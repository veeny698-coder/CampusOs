insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('certifrenzy-templates','certifrenzy-templates',true,5242880,array['image/png','image/jpeg','image/webp'])
on conflict(id) do nothing;
create policy certificate_artwork_owner_upload on storage.objects
for insert to authenticated
with check(bucket_id='certifrenzy-templates' and exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
create policy certificate_artwork_owner_remove on storage.objects
for delete to authenticated
using(bucket_id='certifrenzy-templates' and exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid())));
alter table public.certificate_templates add column image_path text;
alter table public.certificate_templates add column coordinator_image_path text;
alter table public.certificate_templates add column participant_placeholders jsonb not null default
'[{"key":"name","x":50,"y":49,"fontSize":78},{"key":"event","x":50,"y":64,"fontSize":30},{"key":"date","x":24,"y":82,"fontSize":21},{"key":"certificate_id","x":48,"y":94,"fontSize":16}]'::jsonb;
alter table public.certificate_templates add column coordinator_placeholders jsonb not null default
'[{"key":"name","x":50,"y":49,"fontSize":78},{"key":"event","x":50,"y":64,"fontSize":30},{"key":"date","x":24,"y":82,"fontSize":21},{"key":"certificate_id","x":48,"y":94,"fontSize":16}]'::jsonb;
create or replace function public.save_certificate_artwork(p_event uuid,p_path text,p_coordinator boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;v_institution uuid;
begin
v_actor:=(select auth.uid());
if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor)
then raise exception 'Not authorized' using errcode='42501';end if;
select institution_id into v_institution from public.events where id=p_event;
if v_institution is null or length(p_path)>250 or p_path not like p_event::text||'/%'
or not exists(select 1 from storage.objects where bucket_id='certifrenzy-templates' and name=p_path)
then raise exception 'Invalid artwork path' using errcode='22023';end if;
insert into public.certificate_templates(event_id,institution_id,image_path,coordinator_image_path)
values(p_event,v_institution,case when p_coordinator then null else p_path end,case when p_coordinator then p_path else null end)
on conflict(event_id) do update set
image_path=case when p_coordinator then public.certificate_templates.image_path else p_path end,
coordinator_image_path=case when p_coordinator then p_path else public.certificate_templates.coordinator_image_path end;
insert into public.audit_logs(actor_user_id,action,resource_type,resource_id,details)
values(v_actor,'certificate.artwork.updated','event',p_event,pg_catalog.jsonb_build_object('coordinator',p_coordinator));
end;$$;
revoke all on function public.save_certificate_artwork(uuid,text,boolean) from public,anon;
grant execute on function public.save_certificate_artwork(uuid,text,boolean) to authenticated;