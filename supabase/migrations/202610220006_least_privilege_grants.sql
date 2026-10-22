-- Least-privilege Data API grants: RLS does not protect TRUNCATE or TRIGGER.
revoke insert, update, delete, truncate, references, trigger on all tables in schema public from anon, authenticated;
revoke select on all tables in schema public from anon;
grant select on public.institutions, public.institution_memberships, public.organizations, public.organization_memberships, public.events, public.platform_owners to authenticated;
grant insert (name, slug) on public.institutions to authenticated;
revoke all on public.audit_logs from anon, authenticated;
