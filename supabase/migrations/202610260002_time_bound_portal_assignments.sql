-- Phase 3, vertical slice 1: effective portal grants with explicit expiry,
-- revocation, and audit history. Existing assignments remain active.
alter table public.portal_assignments
  add column if not exists starts_at timestamptz not null default now(),
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz,
  add column if not exists revoked_by uuid references auth.users(id) on delete set null,
  add column if not exists reason text;
alter table public.portal_assignments
  drop constraint if exists portal_assignments_valid_window;
alter table public.portal_assignments
  add constraint portal_assignments_valid_window check (expires_at is null or expires_at > starts_at);
create index if not exists portal_assignments_effective_lookup
  on public.portal_assignments(user_id, institution_id, portal_key, starts_at, expires_at)
  where revoked_at is null;

create or replace function public.has_portal_access(p_key text,p_institution uuid,p_event uuid default null,p_organization uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
 or (
   exists(select 1 from public.institutions i where i.id=p_institution and i.lifecycle_status='active')
   and exists(
     select 1 from public.portal_assignments a
     join public.portal_catalog c on c.key=a.portal_key and c.enabled=true
     where a.user_id=(select auth.uid()) and a.portal_key=p_key and a.institution_id=p_institution
       and a.revoked_at is null and a.starts_at<=now() and (a.expires_at is null or a.expires_at>now())
       and (a.event_id is null or a.event_id=p_event)
       and (a.organization_id is null or a.organization_id=p_organization)
   )
 )
$$;
revoke all on function public.has_portal_access(text,uuid,uuid,uuid) from public,anon;
grant execute on function public.has_portal_access(text,uuid,uuid,uuid) to authenticated;

create or replace function public.set_portal_assignment(
  p_key text,p_institution uuid,p_user uuid,p_enabled boolean,
  p_organization uuid default null,p_event uuid default null,
  p_expires_at timestamptz default null,p_reason text default null
)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_reason text;
begin
 v_actor:=(select auth.uid());v_reason:=nullif(pg_catalog.btrim(p_reason),'');
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if p_key is null or not exists(select 1 from public.portal_catalog where key=p_key and enabled=true) then raise exception 'Unknown or disabled portal' using errcode='22023';end if;
 if p_organization is not null and p_event is not null then raise exception 'Only one resource scope is allowed' using errcode='22023';end if;
 if not exists(select 1 from public.institutions where id=p_institution) or not exists(select 1 from auth.users where id=p_user) then raise exception 'Invalid institution or user' using errcode='22023';end if;
 if p_event is not null and not exists(select 1 from public.events where id=p_event and institution_id=p_institution) then raise exception 'Event institution mismatch' using errcode='22023';end if;
 if p_organization is not null and not exists(select 1 from public.organizations where id=p_organization and institution_id=p_institution) then raise exception 'Organization institution mismatch' using errcode='22023';end if;
 if p_expires_at is not null and p_expires_at<=now() then raise exception 'Expiry must be in the future' using errcode='22023';end if;
 if p_enabled then
   if v_reason is null or pg_catalog.length(v_reason)<3 or pg_catalog.length(v_reason)>500 then raise exception 'A grant reason is required' using errcode='22023';end if;
   insert into public.portal_assignments(portal_key,institution_id,organization_id,event_id,user_id,assigned_by,starts_at,expires_at,revoked_at,revoked_by,reason)
   values(p_key,p_institution,p_organization,p_event,p_user,v_actor,now(),p_expires_at,null,null,v_reason)
   on conflict(portal_key,institution_id,user_id,coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid))
   do update set assigned_by=excluded.assigned_by,starts_at=excluded.starts_at,expires_at=excluded.expires_at,revoked_at=null,revoked_by=null,reason=excluded.reason
   returning id into v_id;
   insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'portal.assignment.granted','portal_assignment',v_id,pg_catalog.jsonb_build_object('portal',p_key,'institution_id',p_institution,'user_id',p_user,'expires_at',p_expires_at,'reason',v_reason));
 else
   if v_reason is null or pg_catalog.length(v_reason)<3 or pg_catalog.length(v_reason)>500 then raise exception 'A revocation reason is required' using errcode='22023';end if;
   update public.portal_assignments set revoked_at=now(),revoked_by=v_actor,reason=v_reason
   where portal_key=p_key and institution_id=p_institution and user_id=p_user and organization_id is not distinct from p_organization and event_id is not distinct from p_event and revoked_at is null
   returning id into v_id;
   if v_id is null then raise exception 'Active assignment not found' using errcode='22023';end if;
   insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'portal.assignment.revoked','portal_assignment',v_id,pg_catalog.jsonb_build_object('portal',p_key,'institution_id',p_institution,'user_id',p_user,'reason',v_reason));
 end if;
 return v_id;
end;$$;
revoke all on function public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamptz,text) from public,anon;
grant execute on function public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamptz,text) to authenticated;

-- Preserve the existing RPC contract while ensuring legacy UI callers also
-- receive the new revocation semantics. New UI uses set_portal_assignment.
create or replace function public.manage_portal_assignment(p_key text,p_institution uuid,p_user uuid,p_enabled boolean,p_organization uuid default null,p_event uuid default null)
returns void language plpgsql security definer set search_path='' as $$
begin
 perform public.set_portal_assignment(p_key,p_institution,p_user,p_enabled,p_organization,p_event,null,'Legacy portal assignment update');
end;$$;
revoke all on function public.manage_portal_assignment(text,uuid,uuid,boolean,uuid,uuid) from public,anon;
grant execute on function public.manage_portal_assignment(text,uuid,uuid,boolean,uuid,uuid) to authenticated;
