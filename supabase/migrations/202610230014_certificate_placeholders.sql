create or replace function public.save_certificate_placeholders(p_event uuid,p_layout jsonb,p_coordinator boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare actor uuid;institution uuid;field jsonb;
begin
actor:=(select auth.uid());
if actor is null or not exists(select 1 from public.platform_owners where user_id=actor)
then raise exception 'Not authorized' using errcode='42501';end if;
select institution_id into institution from public.events where id=p_event;
if institution is null then raise exception 'Event missing' using errcode='22023';end if;
if jsonb_typeof(p_layout)<>'array' or jsonb_array_length(p_layout)>24 or jsonb_array_length(p_layout)<1
then raise exception 'Invalid placeholders' using errcode='22023';end if;
for field in select value from jsonb_array_elements(p_layout) loop
 if coalesce(field->>'key','') !~ '^[a-z][a-z0-9_]{0,39}$'
 or coalesce(field->>'x','') !~ '^[0-9]{1,3}$'
 or coalesce(field->>'y','') !~ '^[0-9]{1,3}$'
 or coalesce(field->>'fontSize','') !~ '^[0-9]{1,3}$'
 or (field->>'x')::integer>100 or (field->>'y')::integer>100
 or (field->>'fontSize')::integer not between 10 and 130
 then raise exception 'Invalid placeholder field' using errcode='22023';end if;
end loop;
insert into public.certificate_templates(event_id,institution_id,participant_placeholders,coordinator_placeholders)
values(p_event,institution,case when p_coordinator then '[]'::jsonb else p_layout end,case when p_coordinator then p_layout else '[]'::jsonb end)
on conflict(event_id) do update set
participant_placeholders=case when p_coordinator then public.certificate_templates.participant_placeholders else p_layout end,
coordinator_placeholders=case when p_coordinator then p_layout else public.certificate_templates.coordinator_placeholders end;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(actor,'certificate.placeholders.updated','event',p_event,pg_catalog.jsonb_build_object('coordinator',p_coordinator));
end;$$;
revoke all on function public.save_certificate_placeholders(uuid,jsonb,boolean) from public,anon;
grant execute on function public.save_certificate_placeholders(uuid,jsonb,boolean) to authenticated;

drop function public.verify_event_certificate(uuid);
create function public.verify_event_certificate(p_code uuid)
returns table(recipient_name text,event_name text,certificate_type text,issued_at timestamptz,status text,
 title text,subtitle text,footer text,primary_color text,background_color text,text_color text,
 name_y integer,qr_x integer,qr_y integer,layout text,image_path text,placeholders jsonb)
language sql stable security definer set search_path='' as $$
 select c.recipient_name,e.title,c.certificate_type,c.issued_at,
 case when c.revoked_at is null then 'valid' else 'revoked' end,
 coalesce(t.title,case when c.certificate_type='appreciation' then 'Certificate of Appreciation' else 'Certificate of Participation' end),
 coalesce(t.subtitle,'is proudly presented to'),coalesce(t.footer,'Issued by CampusOS'),
 coalesce(t.primary_color,'#a78bfa'),coalesce(t.background_color,'#151b2f'),coalesce(t.text_color,'#ffffff'),
 coalesce(t.name_y,49),coalesce(t.qr_x,86),coalesce(t.qr_y,78),coalesce(t.layout,'classic'),
 t.image_path,t.participant_placeholders
 from public.event_certificates c join public.events e on e.id=c.event_id
 left join public.certificate_templates t on t.event_id=c.event_id
 where c.certificate_code=p_code limit 1;
$$;
revoke all on function public.verify_event_certificate(uuid) from public;
grant execute on function public.verify_event_certificate(uuid) to anon,authenticated;

drop function public.verify_coordinator_certificate(uuid);
create function public.verify_coordinator_certificate(p_code uuid)
returns table(recipient_name text,event_name text,issued_at timestamptz,status text,
 image_path text,placeholders jsonb,custom_fields jsonb)
language sql stable security definer set search_path='' as $$
 select c.full_name,e.title,c.created_at,
 case when c.revoked_at is null then 'valid' else 'revoked' end,
 t.coordinator_image_path,t.coordinator_placeholders,c.custom_fields
 from public.certificate_coordinators c join public.events e on e.id=c.event_id
 left join public.certificate_templates t on t.event_id=c.event_id
 where c.certificate_code=p_code limit 1;
$$;
revoke all on function public.verify_coordinator_certificate(uuid) from public;
grant execute on function public.verify_coordinator_certificate(uuid) to anon,authenticated;