-- Public registration: narrow RPC only, no direct anonymous table access.
create table public.event_registrations (
 id uuid primary key default gen_random_uuid(),
 event_id uuid not null references public.events(id) on delete cascade,
 institution_id uuid not null references public.institutions(id) on delete cascade,
 full_name text not null check (length(btrim(full_name)) between 2 and 120),
 email text not null check (length(email) between 5 and 254),
 ticket_token uuid not null default gen_random_uuid() unique,
 created_at timestamptz not null default now(),
 checked_in_at timestamptz,
 checked_in_by uuid references auth.users(id),
 foreign key(event_id,institution_id) references public.events(id,institution_id)
);
create unique index event_registrations_event_email_unique on public.event_registrations(event_id,lower(email));
create index event_registrations_institution_event_idx on public.event_registrations(institution_id,event_id);
alter table public.event_registrations enable row level security;
revoke all on public.event_registrations from public,anon,authenticated;
grant select on public.event_registrations to authenticated;
create policy event_registrations_owner_read on public.event_registrations
 for select to authenticated using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.register_for_event(p_event_id uuid,p_full_name text,p_email text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_institution uuid; v_ticket uuid; v_name text; v_email text;
begin
 v_name:=pg_catalog.btrim(p_full_name);
 v_email:=pg_catalog.lower(pg_catalog.btrim(p_email));
 if pg_catalog.length(v_name) not between 2 and 120 or pg_catalog.length(v_email) not between 5 and 254
    or v_email !~ '^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$'
 then raise exception 'Invalid registration details' using errcode='22023'; end if;
 select institution_id into v_institution from public.events where id=p_event_id and status='published';
 if not found then raise exception 'Registration unavailable' using errcode='22023'; end if;
 insert into public.event_registrations(event_id,institution_id,full_name,email)
 values(p_event_id,v_institution,v_name,v_email) returning ticket_token into v_ticket;
 return v_ticket;
exception when unique_violation then
 raise exception 'Already registered for this event' using errcode='23505';
end;
$$;
revoke all on function public.register_for_event(uuid,text,text) from public;
grant execute on function public.register_for_event(uuid,text,text) to anon,authenticated;
comment on function public.register_for_event(uuid,text,text) is 'Public registration, subject to application-level anti-abuse protection before large-scale launch';
