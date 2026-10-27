# Portal membership security repair

## Finding and source

Read-only live metadata on 27 October 2026 confirmed that Phase 3 replaced `has_portal_access` without the institution-membership join present in `202610240004_portal_membership_revocation.sql`. A stale assignment can therefore authorize a removed member. Source: SRS:TEN-001 and the SRS:IAM/ACL families, repository portal access contract, Super Admin specification section 03.3.

## Change

`202610270001_restore_portal_membership_checks.sql` replaces only the existing helper with the same signature and explicit grants. It checks membership, resource tenancy, enabled portal, active institution, assignment timing and revocation. Organization-derived rights additionally require organization membership. It preserves the explicit platform-owner operational path but no longer lets it bypass module availability, institution suspension, or mismatched resource IDs. No student data or identifiers are changed. This is a standalone Phase 3 security repair, not part of Phase 5 commercial DDL.

## Compatibility and rollout

The migration has no dependency on the unapplied commercial migration. Apply this file alone in an explicit transaction after approval; do not use a blanket migration push while commercial SQL is a draft. Existing scoped scanner calls continue using the same signature. Removed members, stale organization memberships, disabled portals and suspended tenants will correctly lose access. Existing callers that pass invalid resource/tenant combinations will be denied.

## Tests

`node --test tests/portal-security.test.cjs` passes the disposable PostgreSQL suite. It first reproduces the live behavior from committed migration bodies and then verifies the repair. The test bootstraps auth.uid and roles; it is not a complete hosted Supabase/Auth/PostgREST integration test. The unused pgcrypto extension declaration is skipped because gen_random_uuid is built into PostgreSQL. No production data was seeded or mutated.

## Verification SQL

Read only, after explicit application:

```sql
select pg_get_functiondef('public.has_portal_access(text,uuid,uuid,uuid)'::regprocedure);
select
  has_function_privilege('anon','public.has_portal_access(text,uuid,uuid,uuid)','execute') as anon_execute,
  has_function_privilege('authenticated','public.has_portal_access(text,uuid,uuid,uuid)','execute') as authenticated_execute;
-- Expected: false, true. Inspect definition for membership joins, active
-- institution, enabled catalog, timing, revoked_at and exact resource scope.
```

## Rollback

Before commit, failure rolls back the whole transaction. After application, prefer a forward repair preserving membership checks. Restoring Phase 3's old helper would reintroduce the confirmed vulnerability and is not an acceptable normal rollback. No DDL/table rollback is necessary; all data remain intact.

## Remaining work

The grant mutation still needs hardened membership checks, and the portal hub must stop presenting expired/revoked assignments as current. Full action-level permissions and approved support access remain separate requirements. This repair is not a claim that all portal authorization is complete.
