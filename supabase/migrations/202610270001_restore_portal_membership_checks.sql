-- Security repair for the Phase 3 membership-check regression.
-- Existing identifiers, grants and expiry semantics are preserved.
-- No commercial schema dependencies; review/apply separately from Phase 5.
begin;
create or replace function public.has_portal_access(
  p_key text, p_institution uuid, p_event uuid default null, p_organization uuid default null
) returns boolean language sql stable security definer set search_path='' as $$
  select (select auth.uid()) is not null
    and exists(select 1 from public.portal_catalog c where c.key=p_key and c.enabled)
    and exists(select 1 from public.institutions i where i.id=p_institution and i.lifecycle_status='active')
    and (p_event is null or exists(select 1 from public.events e where e.id=p_event and e.institution_id=p_institution
      and (p_organization is null or e.organization_id=p_organization)))
    and (p_organization is null or exists(select 1 from public.organizations o where o.id=p_organization and o.institution_id=p_institution))
    and (
      exists(select 1 from public.platform_owners p where p.user_id=(select auth.uid()))
      or exists(
        select 1 from public.portal_assignments a
        join public.institution_memberships m on m.institution_id=a.institution_id and m.user_id=a.user_id
        where a.user_id=(select auth.uid()) and a.portal_key=p_key and a.institution_id=p_institution
          and a.revoked_at is null and a.starts_at<=now() and (a.expires_at is null or a.expires_at>now())
          and (
            (a.event_id is null and a.organization_id is null)
            or (a.event_id=p_event and a.organization_id is null)
            or (a.event_id is null and a.organization_id is not null
              and exists(select 1 from public.organization_memberships om where om.organization_id=a.organization_id and om.user_id=a.user_id)
              and (a.organization_id=p_organization or exists(select 1 from public.events e
                where e.id=p_event and e.institution_id=p_institution and e.organization_id=a.organization_id)))
          )
      )
    );
$$;
revoke all on function public.has_portal_access(text,uuid,uuid,uuid) from public,anon;
grant execute on function public.has_portal_access(text,uuid,uuid,uuid) to authenticated;
commit;
