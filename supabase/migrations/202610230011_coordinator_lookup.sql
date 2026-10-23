create or replace function public.lookup_coordinator_certificate(p_event uuid,p_name text)
returns uuid language sql security definer set search_path='' stable as $$
 select c.certificate_code from public.certificate_coordinators c
 join public.events e on e.id=c.event_id
 where c.event_id=p_event and e.status='published' and c.revoked_at is null
 and pg_catalog.lower(pg_catalog.btrim(c.full_name))=pg_catalog.lower(pg_catalog.btrim(p_name))
 limit 1;
$$;
revoke all on function public.lookup_coordinator_certificate(uuid,text) from public;
grant execute on function public.lookup_coordinator_certificate(uuid,text) to anon,authenticated;