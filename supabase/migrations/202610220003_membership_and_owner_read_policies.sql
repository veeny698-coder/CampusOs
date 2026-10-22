-- Read-only membership discovery. No client-side mutation grants.
create policy institution_membership_self_read on public.institution_memberships
for select to authenticated using (user_id = (select auth.uid()));
create policy organization_membership_self_read on public.organization_memberships
for select to authenticated using (user_id = (select auth.uid()));
create policy institutions_platform_owner_read on public.institutions
for select to authenticated using (
 exists (select 1 from public.platform_owners p where p.user_id = (select auth.uid()))
);
