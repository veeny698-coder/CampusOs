-- Audited, idempotent check-in for platform owners only.
grant update(checked_in_at,checked_in_by) on public.event_registrations to authenticated;
create policy event_registrations_owner_checkin on public.event_registrations
 for update to authenticated
 using (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())))
 with check (exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));

create or replace function public.check_in_event_ticket(p_ticket_token uuid)
returns text language plpgsql security invoker set search_path='' as $$
declare v_id uuid;v_event uuid;v_status text;v_checked timestamptz;
begin
 if (select auth.uid()) is null or not exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
 then raise exception 'Not authorized' using errcode='42501'; end if;
 select r.id,r.event_id,r.checked_in_at,e.status into v_id,v_event,v_checked,v_status
 from public.event_registrations r join public.events e on e.id=r.event_id
 where r.ticket_token=p_ticket_token for update of r;
 if not found then return 'invalid'; end if;
 if v_checked is not null then return 'already_checked_in'; end if;
 if v_status <> 'published' then return 'event_not_open'; end if;
 update public.event_registrations set checked_in_at=pg_catalog.now(),checked_in_by=(select auth.uid()) where id=v_id;
 insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
 values((select auth.uid()),'event.checked_in','event_registration',v_id,pg_catalog.jsonb_build_object('event_id',v_event));
 return 'checked_in';
end;
$$;
revoke all on function public.check_in_event_ticket(uuid) from public,anon;
grant execute on function public.check_in_event_ticket(uuid) to authenticated;
