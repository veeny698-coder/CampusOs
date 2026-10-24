create or replace function public.list_portal_members()
returns table(institution_id uuid,user_id uuid,email text,member_role text)
language sql stable security definer set search_path='' as $$
select m.institution_id,m.user_id,u.email::text,m.role
from public.institution_memberships m
join auth.users u on u.id=m.user_id
where exists(select 1 from public.platform_owners o where o.user_id=(select auth.uid()))
order by u.email limit 1000;
$$;
revoke all on function public.list_portal_members() from public,anon;
grant execute on function public.list_portal_members() to authenticated;
create or replace function public.manage_portal_assignment(p_key text,p_institution uuid,p_user uuid,p_enabled boolean,p_organization uuid default null,p_event uuid default null)
returns void language plpgsql security definer set search_path='' as $$
declare v_actor uuid;
begin
v_actor:=(select auth.uid());
if v_actor is null or not exists(select 1 from public.platform_owners where user_id=v_actor)
then raise exception 'Not authorized' using errcode='42501';end if;
if not exists(select 1 from public.portal_catalog where key=p_key and enabled=true)
then raise exception 'Unknown or disabled portal' using errcode='22023';end if;
if p_event is not null and p_organization is not null then raise exception 'Select one scope' using errcode='22023';end if;
if p_event is not null and not exists(select 1 from public.events where id=p_event and institution_id=p_institution)
then raise exception 'Event institution mismatch' using errcode='22023';end if;
if p_organization is not null and not exists(select 1 from public.organizations where id=p_organization and institution_id=p_institution)
then raise exception 'Organization institution mismatch' using errcode='22023';end if;
if not exists(select 1 from public.institution_memberships where institution_id=p_institution and user_id=p_user)
then raise exception 'User must be a member of the institution' using errcode='42501';end if;
if p_enabled then
insert into public.portal_assignments(portal_key,institution_id,organization_id,event_id,user_id,assigned_by)
values(p_key,p_institution,p_organization,p_event,p_user,v_actor)
on conflict(portal_key,institution_id,user_id,coalesce(organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(event_id,'00000000-0000-0000-0000-000000000000'::uuid))
do update set assigned_by=excluded.assigned_by;
else
delete from public.portal_assignments where portal_key=p_key and institution_id=p_institution and user_id=p_user and organization_id is not distinct from p_organization and event_id is not distinct from p_event;
end if;
insert into public.audit_logs(actor_user_id,action,resource_type,details)
values(v_actor,'portal.assignment.changed','portal',pg_catalog.jsonb_build_object('portal',p_key,'institution_id',p_institution,'user_id',p_user,'enabled',p_enabled));
end;$$;