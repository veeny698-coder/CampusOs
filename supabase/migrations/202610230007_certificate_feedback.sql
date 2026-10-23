create table if not exists public.certificate_feedback (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null unique references public.event_registrations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  answers jsonb not null,
  submitted_at timestamptz not null default now()
);
alter table public.certificate_feedback enable row level security;
revoke all on public.certificate_feedback from public,anon,authenticated;
grant select on public.certificate_feedback to authenticated;
create policy certificate_feedback_owner_select on public.certificate_feedback
for select to authenticated using (
exists(select 1 from public.platform_owners where user_id=(select auth.uid())));
create or replace function public.submit_certificate_feedback(p_ticket uuid,p_answers jsonb)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_registration public.event_registrations%rowtype;v_feedback uuid;
begin
select * into v_registration from public.event_registrations where ticket_token=p_ticket;
if not found then raise exception 'Ticket not found' using errcode='22023';end if;
if not exists(select 1 from public.events where id=v_registration.event_id and status='published')
then raise exception 'Event not published' using errcode='22023';end if;
if jsonb_typeof(p_answers) <> 'object' or length(p_answers::text)>8000
then raise exception 'Invalid answers' using errcode='22023';end if;
if coalesce(p_answers->>'rating','') not in ('1','2','3','4','5')
or length(btrim(coalesce(p_answers->>'feedback','')))<2
or length(coalesce(p_answers->>'feedback',''))>2000
then raise exception 'Rating and feedback required' using errcode='22023';end if;
insert into public.certificate_feedback(registration_id,event_id,answers)
values(v_registration.id,v_registration.event_id,p_answers)
on conflict(registration_id) do update set answers=excluded.answers,submitted_at=now()
returning id into v_feedback;
return v_feedback;
end;$$;
revoke all on function public.submit_certificate_feedback(uuid,jsonb) from public;
grant execute on function public.submit_certificate_feedback(uuid,jsonb) to anon,authenticated;