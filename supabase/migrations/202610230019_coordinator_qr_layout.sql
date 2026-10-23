drop function public.verify_coordinator_certificate(uuid);
create function public.verify_coordinator_certificate(p_code uuid)
returns table(recipient_name text,event_name text,issued_at timestamptz,status text,
 image_path text,placeholders jsonb,custom_fields jsonb,qr_x integer,qr_y integer)
language sql stable security definer set search_path='' as $$
select c.full_name,e.title,c.created_at,
case when c.revoked_at is null then 'valid' else 'revoked' end,
t.coordinator_image_path,t.coordinator_placeholders,c.custom_fields,
coalesce(t.qr_x,86),coalesce(t.qr_y,78)
from public.certificate_coordinators c join public.events e on e.id=c.event_id
left join public.certificate_templates t on t.event_id=c.event_id
where c.certificate_code=p_code limit 1;$$;
revoke all on function public.verify_coordinator_certificate(uuid) from public;
grant execute on function public.verify_coordinator_certificate(uuid) to anon,authenticated;