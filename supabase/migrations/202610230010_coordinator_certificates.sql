create table public.certificate_coordinators(
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.events(id) on delete cascade,
 institution_id uuid not null references public.institutions(id) on delete cascade,
 full_name text not null check(length(btrim(full_name)) between 2 and 120),
 certificate_code uuid not null unique default gen_random_uuid(),
 custom_fields jsonb not null default '{}'::jsonb,
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 unique(event_id,full_name)
);
alter table public.certificate_coordinators enable row level security;
revoke all on public.certificate_coordinators from public,anon,authenticated;
grant select on public.certificate_coordinators to authenticated;
create policy certificate_coordinators_owner_read on public.certificate_coordinators for select to authenticated
using(exists(select 1 from public.platform_owners where user_id=(select auth.uid())));
create or replace function public.add_certificate_coordinator(p_event uuid,p_name text,p_fields jsonb default '{}'::jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare actor uuid;institution uuid;code uuid;
begin
actor:=(select auth.uid());
if actor is null or not exists(select 1 from public.platform_owners where user_id=actor)
then raise exception 'Not authorized' using errcode='42501';end if;
select institution_id into institution from public.events where id=p_event;
if institution is null or length(btrim(p_name)) not between 2 and 120
or jsonb_typeof(p_fields)<>'object' or length(p_fields::text)>2000
then raise exception 'Invalid coordinator' using errcode='22023';end if;
insert into public.certificate_coordinators(event_id,institution_id,full_name,custom_fields)
values(p_event,institution,btrim(p_name),p_fields)
on conflict(event_id,full_name) do update set custom_fields=excluded.custom_fields
returning certificate_code into code;
insert into public.audit_logs(actor_user_id,action,resource_type,details)
values(actor,'certificate.coordinator_saved','event',pg_catalog.jsonb_build_object('event_id',p_event));
return code;
end;$$;
revoke all on function public.add_certificate_coordinator(uuid,text,jsonb) from public,anon;
grant execute on function public.add_certificate_coordinator(uuid,text,jsonb) to authenticated;
create or replace function public.verify_coordinator_certificate(p_code uuid)
returns table(recipient_name text,event_name text,issued_at timestamptz,status text)
language sql stable security definer set search_path='' as $$
select c.full_name,e.title,c.created_at,case when c.revoked_at is null then 'valid' else 'revoked' end
from public.certificate_coordinators c join public.events e on e.id=c.event_id
where c.certificate_code=p_code limit 1;$$;
revoke all on function public.verify_coordinator_certificate(uuid) from public;
grant execute on function public.verify_coordinator_certificate(uuid) to anon,authenticated;