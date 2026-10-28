-- Run after applying 20261028183937_owner_invitation_acceptance.sql.
-- Read-only verification: it creates no invitation and returns no token.
select c.relname, c.relrowsecurity
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('owner_invitation_tokens','owner_invitation_attempts')
order by c.relname;

select p.proname,
       has_function_privilege('anon',p.oid,'execute') as anon_execute,
       has_function_privilege('authenticated',p.oid,'execute') as authenticated_execute
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('issue_owner_invitation_link','create_owner_invitation_link','revoke_owner_invitation_link','accept_owner_invitation')
order by p.proname;

select column_name, is_nullable
from information_schema.columns
where table_schema='public' and table_name='institution_owner_invitations'
  and column_name in ('accepted_at','accepted_by')
order by column_name;
