create or replace function public.bulk_issue_event_certificates(p_event_id uuid,p_type text default 'participation')
returns integer language plpgsql security definer set search_path='' as $$
declare actor uuid;qty integer;
begin
actor:=(select auth.uid());
if actor is null or not exists(select 1 from public.platform_owners where user_id=actor)
then raise exception 'Not authorized' using errcode='42501';end if;
if p_type not in ('participation','appreciation') then raise exception 'Invalid type' using errcode='22023';end if;
if not exists(select 1 from public.events where id=p_event_id) then raise exception 'Event missing' using errcode='22023';end if;
if(select count(*) from public.event_registrations where event_id=p_event_id)>1000
then raise exception 'Maximum 1000 registrations per event' using errcode='22023';end if;
insert into public.event_certificates(event_id,institution_id,registration_id,recipient_name,certificate_type,issued_by)
select r.event_id,r.institution_id,r.id,r.full_name,p_type,actor
from public.event_registrations r
join public.certificate_feedback f on f.registration_id=r.id
where r.event_id=p_event_id
on conflict(registration_id,certificate_type) do nothing;
get diagnostics qty=row_count;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(actor,'certificate.bulk_issued','event',p_event_id,pg_catalog.jsonb_build_object('type',p_type,'new_count',qty));
return qty;
end;$$;
revoke all on function public.bulk_issue_event_certificates(uuid,text) from public,anon;
grant execute on function public.bulk_issue_event_certificates(uuid,text) to authenticated;