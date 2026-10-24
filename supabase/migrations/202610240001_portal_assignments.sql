create table if not exists public.portal_catalog(
 key text primary key check(key ~ '^[a-z][a-z0-9_]{2,39}$'),
 label text not null,
 route text not null check(route like '/%'),
 description text not null default '',
 enabled boolean not null default true
);
insert into public.portal_catalog(key,label,route,description) values
('events','Event Management','/admin/dashboard/events','Manage events and subevents'),
('qr_scanner','QR Scanner','/admin/dashboard/check-in','Scan attendance tickets'),
('certifrenzy','CertiFrenzy','/admin/dashboard/certificates','Issue and verify event certificates')
on conflict(key) do update set label=excluded.label,route=excluded.route,description=excluded.description;
create table if not exists public.portal_assignments(
 id uuid primary key default gen_random_uuid(),
 portal_key text not null references public.portal_catalog(key),
 institution_id uuid not null references public.institutions(id) on delete cascade,
 organization_id uuid references public.organizations(id) on delete cascade,
 event_id uuid references public.events(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 assigned_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 constraint portal_assignment_scope check(not (event_id is not null and organization_id is not null)),
 unique(portal_key,institution_id,organization_id,event_id,user_id)
);
create unique index if not exists portal_assignments_unique_scope on public.portal_assignments(portal_key,institution_id,user_id,coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid));
alter table public.portal_catalog enable row level security;
alter table public.portal_assignments enable row level security;
revoke all on public.portal_catalog from anon,authenticated;
revoke all on public.portal_assignments from anon,authenticated;
grant select on public.portal_catalog,public.portal_assignments to authenticated;
create policy portal_catalog_authenticated_read on public.portal_catalog for select to authenticated using(true);
create policy portal_assignments_self_or_owner on public.portal_assignments for select to authenticated using(user_id=(select auth.uid()) or exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create or replace function public.manage_portal_assignment(p_key text,p_institution uuid,p_user uuid,p_enabled boolean,p_organization uuid default null,p_event uuid default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
v_actor:=(select auth.uid());
if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor) then raise exception 'Not authorized' using errcode='42501';end if;
if not exists(select 1 from public.portal_catalog where key=p_key and enabled=true) then raise exception 'Unknown or disabled portal' using errcode='22023';end if;
if p_event is not null and p_organization is not null then raise exception 'Select one scope' using errcode='22023';end if;
if p_event is not null and not exists(select 1 from public.events where id=p_event and institution_id=p_institution) then raise exception 'Event institution mismatch' using errcode='22023';end if;
if p_organization is not null and not exists(select 1 from public.organizations where id=p_organization and institution_id=p_institution) then raise exception 'Organization institution mismatch' using errcode='22023';end if;
if not exists(select 1 from public.institutions where id=p_institution) or not exists(select 1 from auth.users where id=p_user) then raise exception 'Invalid institution or user' using errcode='22023';end if;
if p_enabled then
insert into public.portal_assignments(portal_key,institution_id,organization_id,event_id,user_id,assigned_by)
values(p_key,p_institution,p_organization,p_event,p_user,v_actor)
on conflict(portal_key,institution_id,user_id,coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid))
do update set assigned_by=excluded.assigned_by;
else
delete from public.portal_assignments where portal_key=p_key and institution_id=p_institution and user_id=p_user and organization_id is not distinct from p_organization and event_id is not distinct from p_event;
end if;
insert into public.audit_logs(actor_user_id,action,resource_type,details)
values(v_actor,'portal.assignment.changed','portal',pg_catalog.jsonb_build_object('portal',p_key,'institution_id',p_institution,'user_id',p_user,'enabled',p_enabled));
end;$$;
revoke all on function public.manage_portal_assignment(text,uuid,uuid,boolean,uuid,uuid) from public,anon;
grant execute on function public.manage_portal_assignment(text,uuid,uuid,boolean,uuid,uuid) to authenticated;