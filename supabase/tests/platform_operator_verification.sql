-- Read-only after the separately approved operator-access migration.
select tablename,rowsecurity from pg_tables where schemaname='public' and tablename in ('platform_role_versions','platform_access_requests');
select p.proname,p.prosecdef,p.proconfig,
 has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
 has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('platform_access_owner','platform_role_immutable','publish_platform_audit_role','request_platform_audit_access','decide_platform_audit_access','platform_my_capabilities','platform_audit_feed');
select count(*) as owner_count from public.platform_owners;
select count(*) as request_count from public.platform_access_requests;
-- Must return no rows.
select id from public.platform_access_requests where status='approved' and (reviewed_by=requested_by or reviewed_by=user_id or reviewed_by is null);
