-- Phase 2: Super Admin institution management. This is additive and preserves
-- existing institution/event identifiers and current platform-owner access.
alter table public.institutions
  add column if not exists lifecycle_status text not null default 'active'
    check (lifecycle_status in ('active','suspended','archived'));

create table if not exists public.institution_profiles (
  institution_id uuid primary key references public.institutions(id) on delete cascade,
  domain text unique,
  time_zone text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  check (domain is null or domain = lower(btrim(domain)))
);

create table if not exists public.institution_onboarding (
  institution_id uuid primary key references public.institutions(id) on delete cascade,
  stage text not null default 'created' check (stage in ('created','owner_invited','identity_verified','plan_assigned','settings_configured','active','blocked')),
  blocker text,
  assigned_to uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create table if not exists public.institution_owner_invitations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email text not null check (email = lower(btrim(email)) and length(email) between 3 and 320),
  status text not null default 'pending' check (status in ('pending','revoked','accepted','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null,
  check (expires_at > created_at)
);
create unique index if not exists institution_owner_invitations_one_pending
  on public.institution_owner_invitations(institution_id, email) where status = 'pending';
create index if not exists institutions_lifecycle_listing on public.institutions(lifecycle_status, created_at desc);
create index if not exists institution_onboarding_stage_listing on public.institution_onboarding(stage, updated_at desc);
create index if not exists institution_owner_invitations_institution_listing on public.institution_owner_invitations(institution_id, created_at desc);

insert into public.institution_profiles(institution_id)
select id from public.institutions on conflict (institution_id) do nothing;
insert into public.institution_onboarding(institution_id)
select id from public.institutions on conflict (institution_id) do nothing;

alter table public.institution_profiles enable row level security;
alter table public.institution_onboarding enable row level security;
alter table public.institution_owner_invitations enable row level security;
revoke all on public.institution_profiles, public.institution_onboarding, public.institution_owner_invitations from anon, authenticated;
grant select on public.institution_profiles, public.institution_onboarding, public.institution_owner_invitations to authenticated;
create policy institution_profiles_platform_owner_read on public.institution_profiles for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy institution_onboarding_platform_owner_read on public.institution_onboarding for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy institution_owner_invitations_platform_owner_read on public.institution_owner_invitations for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.is_institution_active(p_institution uuid)
returns boolean language sql stable security definer set search_path='' as $$
  select exists(
    select 1 from public.institution_memberships m
    join public.institutions i on i.id=m.institution_id
    where m.institution_id=p_institution and m.user_id=(select auth.uid()) and i.lifecycle_status='active'
  )
$$;
revoke all on function public.is_institution_active(uuid) from public, anon;
grant execute on function public.is_institution_active(uuid) to authenticated;

-- Suspension blocks future tenant-scoped reads. Platform-owner policies remain
-- independent so lifecycle work can be audited and reversed.
drop policy if exists institutions_member_read on public.institutions;
create policy institutions_member_read on public.institutions for select to authenticated using (
  lifecycle_status='active' and exists(select 1 from public.institution_memberships m where m.institution_id=id and m.user_id=(select auth.uid()))
);
drop policy if exists organizations_member_read on public.organizations;
create policy organizations_member_read on public.organizations for select to authenticated using (
  public.is_institution_active(institution_id) and exists(select 1 from public.institution_memberships m where m.institution_id=organizations.institution_id and m.user_id=(select auth.uid()))
);
drop policy if exists events_member_read on public.events;
create policy events_member_read on public.events for select to authenticated using (
  public.is_institution_active(institution_id) and exists(select 1 from public.institution_memberships m where m.institution_id=events.institution_id and m.user_id=(select auth.uid()))
);

create or replace function public.create_institution(p_name text,p_slug text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_name text;v_slug text;
begin
 v_actor:=(select auth.uid()); v_name:=pg_catalog.btrim(p_name); v_slug:=pg_catalog.lower(pg_catalog.btrim(p_slug));
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501'; end if;
 if pg_catalog.length(v_name) not between 2 and 200 or v_slug !~ '^[a-z0-9][a-z0-9-]{2,62}$' then raise exception 'Invalid institution name or slug' using errcode='22023'; end if;
 insert into public.institutions(name,slug,lifecycle_status) values(v_name,v_slug,'active') returning id into v_id;
 insert into public.institution_profiles(institution_id,updated_by) values(v_id,v_actor);
 insert into public.institution_onboarding(institution_id,stage,updated_by) values(v_id,'created',v_actor);
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.created','institution',v_id,pg_catalog.jsonb_build_object('name',v_name,'slug',v_slug));
 return v_id;
end;$$;
revoke all on function public.create_institution(text,text) from public,anon;
grant execute on function public.create_institution(text,text) to authenticated;

create or replace function public.update_institution_profile(p_institution uuid,p_domain text,p_time_zone text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_domain text;v_time_zone text;
begin
 v_actor:=(select auth.uid());v_domain:=nullif(pg_catalog.lower(pg_catalog.btrim(p_domain)), '');v_time_zone:=nullif(pg_catalog.btrim(p_time_zone),'');
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if not exists(select 1 from public.institutions where id=p_institution) then raise exception 'Institution not found' using errcode='22023';end if;
 if v_domain is not null and (v_domain !~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$') then raise exception 'Invalid domain' using errcode='22023';end if;
 insert into public.institution_profiles(institution_id,domain,time_zone,updated_at,updated_by) values(p_institution,v_domain,v_time_zone,now(),v_actor)
 on conflict(institution_id) do update set domain=excluded.domain,time_zone=excluded.time_zone,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.profile.updated','institution',p_institution,pg_catalog.jsonb_build_object('domain',v_domain,'time_zone',v_time_zone));
end;$$;
revoke all on function public.update_institution_profile(uuid,text,text) from public,anon;
grant execute on function public.update_institution_profile(uuid,text,text) to authenticated;

create or replace function public.set_institution_lifecycle(p_institution uuid,p_status text,p_reason text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_reason text;
begin
 v_actor:=(select auth.uid());v_reason:=pg_catalog.btrim(p_reason);
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if p_status not in ('active','suspended','archived') or pg_catalog.length(v_reason) not between 3 and 500 then raise exception 'Invalid lifecycle change' using errcode='22023';end if;
 update public.institutions set lifecycle_status=p_status where id=p_institution;
 if not found then raise exception 'Institution not found' using errcode='22023';end if;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.lifecycle.changed','institution',p_institution,pg_catalog.jsonb_build_object('status',p_status,'reason',v_reason));
end;$$;
revoke all on function public.set_institution_lifecycle(uuid,text,text) from public,anon;
grant execute on function public.set_institution_lifecycle(uuid,text,text) to authenticated;

create or replace function public.set_institution_onboarding_stage(p_institution uuid,p_stage text,p_blocker text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_blocker text;
begin
 v_actor:=(select auth.uid());v_blocker:=nullif(pg_catalog.btrim(p_blocker),'');
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if p_stage not in ('created','owner_invited','identity_verified','plan_assigned','settings_configured','active','blocked') then raise exception 'Invalid onboarding stage' using errcode='22023';end if;
 if p_stage='blocked' and (v_blocker is null or pg_catalog.length(v_blocker)>500) then raise exception 'A blocker is required' using errcode='22023';end if;
 insert into public.institution_onboarding(institution_id,stage,blocker,updated_at,updated_by) values(p_institution,p_stage,v_blocker,now(),v_actor)
 on conflict(institution_id) do update set stage=excluded.stage,blocker=excluded.blocker,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 if not found then raise exception 'Institution not found' using errcode='22023';end if;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.onboarding.updated','institution',p_institution,pg_catalog.jsonb_build_object('stage',p_stage,'blocker',v_blocker));
end;$$;
revoke all on function public.set_institution_onboarding_stage(uuid,text,text) from public,anon;
grant execute on function public.set_institution_onboarding_stage(uuid,text,text) to authenticated;

create or replace function public.create_institution_owner_invitation(p_institution uuid,p_email text,p_expires_at timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_email text;
begin
 v_actor:=(select auth.uid());v_email:=pg_catalog.lower(pg_catalog.btrim(p_email));
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or p_expires_at <= now() then raise exception 'Invalid invitation' using errcode='22023';end if;
 if not exists(select 1 from public.institutions where id=p_institution) then raise exception 'Institution not found' using errcode='22023';end if;
 update public.institution_owner_invitations set status='expired' where institution_id=p_institution and status='pending' and expires_at<=now();
 insert into public.institution_owner_invitations(institution_id,email,expires_at,created_by) values(p_institution,v_email,p_expires_at,v_actor) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.owner_invitation.created','institution',p_institution,pg_catalog.jsonb_build_object('invitation_id',v_id,'email',v_email,'expires_at',p_expires_at));
 return v_id;
end;$$;
revoke all on function public.create_institution_owner_invitation(uuid,text,timestamptz) from public,anon;
grant execute on function public.create_institution_owner_invitation(uuid,text,timestamptz) to authenticated;

-- Existing QR scanner and portal routes consult this helper. Active platform
-- owners retain oversight; assigned tenant users lose portal access immediately
-- when an institution is suspended or archived.
create or replace function public.has_portal_access(p_key text,p_institution uuid,p_event uuid default null,p_organization uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
 or (
   exists(select 1 from public.institutions i where i.id=p_institution and i.lifecycle_status='active')
   and exists(
     select 1 from public.portal_assignments a
     join public.portal_catalog c on c.key=a.portal_key and c.enabled=true
     where a.user_id=(select auth.uid()) and a.portal_key=p_key and a.institution_id=p_institution
       and (a.event_id is null or a.event_id=p_event)
       and (a.organization_id is null or a.organization_id=p_organization)
   )
 )
$$;
revoke all on function public.has_portal_access(text,uuid,uuid,uuid) from public,anon;
grant execute on function public.has_portal_access(text,uuid,uuid,uuid) to authenticated;

-- Keep input validation independent of SQL string escape settings.
create or replace function public.update_institution_profile(p_institution uuid,p_domain text,p_time_zone text)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_domain text;v_time_zone text;
begin
 v_actor:=(select auth.uid());v_domain:=nullif(pg_catalog.lower(pg_catalog.btrim(p_domain)), '');v_time_zone:=nullif(pg_catalog.btrim(p_time_zone),'');
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if not exists(select 1 from public.institutions where id=p_institution) then raise exception 'Institution not found' using errcode='22023';end if;
 if v_domain is not null and (position('.' in v_domain)=0 or position(' ' in v_domain)>0 or position('/' in v_domain)>0) then raise exception 'Invalid domain' using errcode='22023';end if;
 insert into public.institution_profiles(institution_id,domain,time_zone,updated_at,updated_by) values(p_institution,v_domain,v_time_zone,now(),v_actor)
 on conflict(institution_id) do update set domain=excluded.domain,time_zone=excluded.time_zone,updated_at=excluded.updated_at,updated_by=excluded.updated_by;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.profile.updated','institution',p_institution,pg_catalog.jsonb_build_object('domain',v_domain,'time_zone',v_time_zone));
end;$$;
revoke all on function public.update_institution_profile(uuid,text,text) from public,anon;
grant execute on function public.update_institution_profile(uuid,text,text) to authenticated;

create or replace function public.create_institution_owner_invitation(p_institution uuid,p_email text,p_expires_at timestamptz)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_email text;
begin
 v_actor:=(select auth.uid());v_email:=pg_catalog.lower(pg_catalog.btrim(p_email));
 if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
 if position('@' in v_email)<2 or position('.' in split_part(v_email,'@',2))=0 or position(' ' in v_email)>0 or p_expires_at<=now() then raise exception 'Invalid invitation' using errcode='22023';end if;
 if not exists(select 1 from public.institutions where id=p_institution) then raise exception 'Institution not found' using errcode='22023';end if;
 update public.institution_owner_invitations set status='expired' where institution_id=p_institution and status='pending' and expires_at<=now();
 insert into public.institution_owner_invitations(institution_id,email,expires_at,created_by) values(p_institution,v_email,p_expires_at,v_actor) returning id into v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details) values(v_actor,'institution.owner_invitation.created','institution',p_institution,pg_catalog.jsonb_build_object('invitation_id',v_id,'email',v_email,'expires_at',p_expires_at));
 return v_id;
end;$$;
revoke all on function public.create_institution_owner_invitation(uuid,text,timestamptz) from public,anon;
grant execute on function public.create_institution_owner_invitation(uuid,text,timestamptz) to authenticated;
