create or replace function public.bulk_save_certificate_coordinators(p_event uuid,p_people jsonb)
returns integer language plpgsql security definer set search_path='' as $$
declare actor uuid;institution uuid;person jsonb;n text;details jsonb;count_rows integer:=0;
begin
actor:=(select auth.uid());
if actor is null or not exists(select 1 from public.platform_owners p where p.user_id=actor)
then raise exception 'Not authorized' using errcode='42501';end if;
select institution_id into institution from public.events where id=p_event;
if institution is null then raise exception 'Event not found' using errcode='22023';end if;
if jsonb_typeof(p_people)<>'array' or jsonb_array_length(p_people) not between 1 and 300
then raise exception 'Upload 1 to 300 people at a time' using errcode='22023';end if;
for person in select value from jsonb_array_elements(p_people) loop
n:=pg_catalog.btrim(coalesce(person->>'name',''));details:=coalesce(person->'fields','{}'::jsonb);
if length(n) not between 2 and 120 or jsonb_typeof(details)<>'object' or length(details::text)>2000
then raise exception 'Invalid coordinator row' using errcode='22023';end if;
insert into public.certificate_coordinators(event_id,institution_id,full_name,custom_fields)
values(p_event,institution,n,details)
on conflict(event_id,full_name) do update set custom_fields=excluded.custom_fields;
count_rows:=count_rows+1;
end loop;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(actor,'certificate.coordinator_bulk_uploaded','event',p_event,
pg_catalog.jsonb_build_object('rows',count_rows));
return count_rows;
end;$$;
revoke all on function public.bulk_save_certificate_coordinators(uuid,jsonb) from public,anon;
grant execute on function public.bulk_save_certificate_coordinators(uuid,jsonb) to authenticated;