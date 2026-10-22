-- Platform owner visibility for the command center; no write permissions granted.
create policy events_platform_owner_read on public.events for select to authenticated using (
  exists (select 1 from public.platform_owners po where po.user_id = (select auth.uid()))
);
create policy organizations_platform_owner_read on public.organizations for select to authenticated using (
  exists (select 1 from public.platform_owners po where po.user_id = (select auth.uid()))
);
