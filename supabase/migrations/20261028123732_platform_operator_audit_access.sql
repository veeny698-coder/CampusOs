-- Independent access slice: a read-only audit capability, never platform ownership.
begin;
create table public.platform_role_versions (
 id uuid primary key default gen_random_uuid(),
 role_key text not null check(role_key ~ '^[a-z][a-z0-9_]{2,79}$'),
 label text not null check(length(btrim(label)) between 2 and 120),
 version integer not null check(version>0),
 capabilities text[] not null check(cardinality(capabilities)=1 and capabilities=ARRAY['audit.read']::text[]),
 created_by uuid not null references auth.users(id),created_at timestamptz not null default now(),
 unique(role_key,version)
);
create table public.platform_access_requests (
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id),
 role_version_id uuid not null references public.platform_role_versions(id),
 status text not null default 'pending' check(status in ('pending','approved','rejected','revoked')),
 requested_by uuid not null references auth.users(id),requested_at timestamptz not null default now(),
 expires_at timestamptz not null check(isfinite(expires_at)),
 reviewed_by uuid references auth.users(id),reviewed_at timestamptz,
 revoked_by uuid references auth.users(id),revoked_at timestamptz,
 reason text not null check(length(btrim(reason)) between 3 and 500),
 check(user_id<>requested_by),
 check(reviewed_by is null or (reviewed_by<>requested_by and reviewed_by<>user_id)),
 check(status not in ('approved','rejected') or (reviewed_by is not null and reviewed_at is not null)),
 check((status='revoked')=(revoked_at is not null)),
 check(expires_at>requested_at)
);
create index platform_access_effective_idx on public.platform_access_requests(user_id,status,expires_at);
alter table public.platform_role_versions enable row level security;
alter table public.platform_access_requests enable row level security;
revoke all on public.platform_role_versions,public.platform_access_requests from public,anon,authenticated;
grant select on public.platform_role_versions,public.platform_access_requests to authenticated;
create policy platform_roles_owner_read on public.platform_role_versions for select to authenticated using(exists(select 1 from public.platform_owners where user_id=(select auth.uid())));
create policy platform_requests_owner_or_self_read on public.platform_access_requests for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.platform_owners where user_id=(select auth.uid())));

create function public.platform_access_owner(p_reason text) returns uuid language plpgsql security invoker set search_path='' as $$
declare actor uuid:=(select auth.uid());begin
 if actor is null or not exists(select 1 from public.platform_owners where user_id=actor) then raise exception 'Owner required' using errcode='42501';end if;
 if p_reason is null or length(btrim(p_reason)) not between 3 and 500 then raise exception 'Reason required' using errcode='22023';end if;
 return actor;
end;$$;
revoke all on function public.platform_access_owner(text) from public,anon,authenticated;

create function public.platform_role_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Role versions are immutable' using errcode='55000';end;$$;
revoke all on function public.platform_role_immutable() from public,anon,authenticated;
create trigger platform_role_history before update or delete on public.platform_role_versions for each row execute function public.platform_role_immutable();

create function public.publish_platform_audit_role(p_key text,p_label text,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.platform_access_owner(p_reason);result uuid;next_version integer;begin
 if p_key is null or p_key !~ '^[a-z][a-z0-9_]{2,79}$' or p_label is null or length(btrim(p_label)) not between 2 and 120 then raise exception 'Invalid role' using errcode='22023';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select coalesce(max(version),0)+1 into next_version from public.platform_role_versions where role_key=p_key;
 insert into public.platform_role_versions(role_key,label,version,capabilities,created_by) values(p_key,btrim(p_label),next_version,ARRAY['audit.read'],actor) returning id into result;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(actor,'platform.role.published','platform_role',result,jsonb_build_object('reason',btrim(p_reason),'version',next_version));
 return result;
end;$$;

create function public.request_platform_audit_access(p_user uuid,p_role_version uuid,p_expires_at timestamptz,p_reason text) returns uuid
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.platform_access_owner(p_reason);result uuid;begin
 if p_user is null or p_user=actor or not exists(select 1 from auth.users where id=p_user)
 or exists(select 1 from public.platform_owners where user_id=p_user) or p_expires_at is null or not isfinite(p_expires_at) or p_expires_at<=now()
 or not exists(select 1 from public.platform_role_versions where id=p_role_version) then raise exception 'Invalid target, role or expiry' using errcode='22023';end if;
 insert into public.platform_access_requests(user_id,role_version_id,requested_by,expires_at,reason) values(p_user,p_role_version,actor,p_expires_at,btrim(p_reason)) returning id into result;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(actor,'platform.access.requested','platform_access',result,jsonb_build_object('reason',btrim(p_reason),'user_id',p_user));
 return result;
end;$$;

create function public.decide_platform_audit_access(p_request uuid,p_decision text,p_reason text) returns void
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.platform_access_owner(p_reason);item public.platform_access_requests%rowtype;begin
 select * into item from public.platform_access_requests where id=p_request for update;
 if not found or p_decision is null or p_decision not in ('approve','reject','revoke') then raise exception 'Invalid decision' using errcode='22023';end if;
 if p_decision='revoke' then
  if item.status not in ('pending','approved') then raise exception 'Request is final' using errcode='22023';end if;
  update public.platform_access_requests set status='revoked',revoked_at=now(),revoked_by=actor where id=p_request;
 else
  if item.status<>'pending' or item.expires_at<=now() then raise exception 'Request is no longer pending' using errcode='22023';end if;
  if actor=item.requested_by or actor=item.user_id then raise exception 'Independent owner approval required' using errcode='42501';end if;
  update public.platform_access_requests set status=case when p_decision='approve' then 'approved' else 'rejected' end,reviewed_at=now(),reviewed_by=actor where id=p_request;
 end if;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(actor,'platform.access.'||p_decision,'platform_access',p_request,jsonb_build_object('reason',btrim(p_reason),'previous_status',item.status));
end;$$;

create function public.platform_my_capabilities() returns text[] language sql stable security definer set search_path='' as $$
 select coalesce(array_agg(distinct capability),ARRAY[]::text[]) from public.platform_access_requests a
 join public.platform_role_versions r on r.id=a.role_version_id cross join lateral unnest(r.capabilities) capability
 where a.user_id=(select auth.uid()) and a.status='approved' and a.reviewed_at<=now() and a.expires_at>now();
$$;

create function public.platform_audit_feed(p_before bigint default null,p_action text default null)
returns table(id bigint,action text,resource_type text,resource_id uuid,created_at timestamptz)
language plpgsql stable security definer set search_path='' as $$
begin
 if (select auth.uid()) is null or (not exists(select 1 from public.platform_owners where user_id=(select auth.uid()))
 and not ('audit.read'=any(public.platform_my_capabilities()))) then raise exception 'Audit capability required' using errcode='42501';end if;
 if length(coalesce(p_action,''))>120 then raise exception 'Invalid filter' using errcode='22023';end if;
 return query select a.id,a.action,a.resource_type,a.resource_id,a.created_at from public.audit_logs a
 where (p_before is null or a.id<p_before) and (nullif(btrim(p_action),'') is null or a.action=btrim(p_action)) order by a.id desc limit 51;
end;$$;

revoke all on function public.publish_platform_audit_role(text,text,text),public.request_platform_audit_access(uuid,uuid,timestamptz,text),public.decide_platform_audit_access(uuid,text,text),public.platform_my_capabilities(),public.platform_audit_feed(bigint,text) from public,anon;
grant execute on function public.publish_platform_audit_role(text,text,text),public.request_platform_audit_access(uuid,uuid,timestamptz,text),public.decide_platform_audit_access(uuid,text,text),public.platform_my_capabilities(),public.platform_audit_feed(bigint,text) to authenticated;
commit;
