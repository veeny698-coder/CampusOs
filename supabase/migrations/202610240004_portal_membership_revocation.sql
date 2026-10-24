create or replace function public.has_portal_access(p_key text,p_institution uuid,p_event uuid default null,p_organization uuid default null)
returns boolean language sql stable security definer set search_path='' as $$
select
exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
or exists(
 select 1 from public.portal_assignments a
 join public.portal_catalog c on c.key=a.portal_key and c.enabled=true
 join public.institution_memberships m on m.institution_id=a.institution_id and m.user_id=a.user_id
 where a.user_id=(select auth.uid()) and a.portal_key=p_key and a.institution_id=p_institution
 and (
   (a.event_id is null and a.organization_id is null)
   or (p_event is not null and a.event_id=p_event
       and exists(select 1 from public.events e where e.id=p_event and e.institution_id=p_institution))
   or (p_organization is not null and a.organization_id=p_organization
       and exists(select 1 from public.organizations o where o.id=p_organization and o.institution_id=p_institution))
   or (p_event is not null and a.organization_id=(
      select e.organization_id from public.events e where e.id=p_event and e.institution_id=p_institution
   ))
 )
);$$;
revoke all on function public.has_portal_access(text,uuid,uuid,uuid) from public,anon;
grant execute on function public.has_portal_access(text,uuid,uuid,uuid) to authenticated;