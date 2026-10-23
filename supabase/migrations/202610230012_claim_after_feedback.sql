alter table public.event_certificates alter column issued_by drop not null;
create or replace function public.claim_certificate_after_feedback(p_ticket uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare registration public.event_registrations%rowtype; certificate uuid;
begin
 select * into registration from public.event_registrations where ticket_token=p_ticket;
 if not found then raise exception 'Invalid ticket' using errcode='22023';end if;
 if not exists(select 1 from public.events e where e.id=registration.event_id and e.status='published')
 then raise exception 'Event is unavailable' using errcode='22023';end if;
 if not exists(select 1 from public.certificate_feedback f where f.registration_id=registration.id)
 then raise exception 'Feedback required' using errcode='42501';end if;
 insert into public.event_certificates(event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by)
 values(registration.event_id,registration.institution_id,registration.id,registration.full_name,'participation',null)
 on conflict(registration_id,certificate_type) do update set recipient_name=excluded.recipient_name
 returning certificate_code into certificate;
 return certificate;
end;$$;
revoke all on function public.claim_certificate_after_feedback(uuid) from public;
grant execute on function public.claim_certificate_after_feedback(uuid) to anon,authenticated;