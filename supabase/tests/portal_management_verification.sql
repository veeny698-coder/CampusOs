-- Read-only. Run before and after the separately approved migration.
select to_regprocedure('public.portal_management_ready()') is not null as ready_function_present;
select p.prosecdef,p.proconfig,
  has_function_privilege('anon',p.oid,'EXECUTE') as anon_execute,
  has_function_privilege('authenticated',p.oid,'EXECUTE') as authenticated_execute
from pg_proc p
where p.oid=to_regprocedure('public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamp with time zone,text)');
select count(*) as assignment_count from public.portal_assignments;
select count(*) as audit_count from public.audit_logs;
