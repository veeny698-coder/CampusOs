create or replace function public.certificate_feedback_eligibility()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from public.certificate_feedback f where f.registration_id=new.registration_id)
 then raise exception 'Feedback must be completed before a certificate can be issued' using errcode='42501';end if;
 return new;
end;$$;
drop trigger if exists certificate_requires_feedback on public.event_certificates;
create trigger certificate_requires_feedback before insert on public.event_certificates
for each row execute function public.certificate_feedback_eligibility();
revoke all on function public.certificate_feedback_eligibility() from public,anon,authenticated;
create or replace function public.get_certificate_feedback_event(p_ticket uuid)
returns table(event_title text,participant_name text,already_submitted boolean)
language sql security definer set search_path='' stable as $$
 select e.title,r.full_name,exists(select 1 from public.certificate_feedback f where f.registration_id=r.id)
 from public.event_registrations r join public.events e on e.id=r.event_id
 where r.ticket_token=p_ticket and e.status='published' limit 1;
$$;
revoke all on function public.get_certificate_feedback_event(uuid) from public;
grant execute on function public.get_certificate_feedback_event(uuid) to anon,authenticated;