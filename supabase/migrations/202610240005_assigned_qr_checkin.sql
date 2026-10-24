create or replace function public.check_in_event_ticket(p_ticket_token uuid)
returns text language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_id uuid;v_event uuid;v_institution uuid;v_organization uuid;v_status text;v_checked timestamptz;
begin
v_actor:=(select auth.uid());
if v_actor is null then raise exception 'Authentication required' using errcode='42501';end if;
select r.id,r.event_id,e.institution_id,e.organization_id,r.checked_in_at,e.status
into v_id,v_event,v_institution,v_organization,v_checked,v_status
from public.event_registrations r join public.events e on e.id=r.event_id
where r.ticket_token=p_ticket_token for update of r;
if not found then return 'invalid';end if;
if not public.has_portal_access('qr_scanner',v_institution,v_event,v_organization)
then raise exception 'QR Scanner portal not assigned for this event' using errcode='42501';end if;
if v_checked is not null then return 'already_checked_in';end if;
if v_status <> 'published' then return 'event_not_open';end if;
update public.event_registrations
 set checked_in_at=pg_catalog.now(),checked_in_by=v_actor
where id=v_id;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(v_actor,'event.checked_in','event_registration',v_id,pg_catalog.jsonb_build_object('event_id',v_event));
return 'checked_in';
end;$$;
revoke all on function public.check_in_event_ticket(uuid) from public,anon;
grant execute on function public.check_in_event_ticket(uuid) to authenticated;