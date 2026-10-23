create or replace function public.lookup_participant_certificate(p_event uuid,p_name text,p_email text)
returns uuid language sql stable security definer set search_path='' as $$
select c.certificate_code
from public.event_certificates c
join public.event_registrations r on r.id=c.registration_id
join public.events e on e.id=r.event_id
where r.event_id=p_event and e.status='published'
and pg_catalog.lower(pg_catalog.btrim(r.full_name))=pg_catalog.lower(pg_catalog.btrim(p_name))
and pg_catalog.lower(pg_catalog.btrim(r.email))=pg_catalog.lower(pg_catalog.btrim(p_email))
and c.certificate_type='participation' and c.revoked_at is null
limit 1;$$;
revoke all on function public.lookup_participant_certificate(uuid,text,text) from public;
grant execute on function public.lookup_participant_certificate(uuid,text,text) to anon,authenticated;