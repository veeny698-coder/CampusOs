# Portal management slice â€” approved migration applied

Source: Ultimate Super Admin specification, People & Access / Portal Access; repository PRT-001 and portal membership/time-window requirements.

## Changes

- `app/super-admin/access/portals/{page,forms,actions}.tsx` (action file is `.ts`): protected assignment listing, scoped member grants, optional UTC expiry, confirmation, reason and revocation. Server actions independently verify platform ownership and resolve revocation scope from the saved record.
- `app/super-admin/super-admin-shell.tsx`: canonical navigation entry.
- `supabase/migrations/202610270002_portal_management.sql`: replacement RPC validates current membership, organization membership, tenant resource integrity, expiry and reason. Revocation remains available after suspension, disablement or membership removal. Repeated revocation is idempotent. No tables or tenant rows are deleted.
- `tests/portal-security.test.cjs` and `tests/portal-actions.test.cjs`: disposable PostgreSQL authorization and server-action tests.

## Live comparison and compatibility

Live inspection on 27 October found the readiness function absent. Following explicit owner approval, this migration was applied on 28 October and recorded as `20261028120600_portal_management`. Post-apply verification found the readiness function present, management SECURITY DEFINER with empty search_path, anonymous EXECUTE denied and authenticated EXECUTE allowed. Assignment count remained 0 and audit count remained 1; the migration changed no tenant records. GitHub CI run 40545649587 succeeded for implementation commit c3ddc79.

The approved membership repair is recorded live as `20261027162046_restore_portal_membership_checks`, corresponding to repository `202610270001_restore_portal_membership_checks.sql`. Do not blindly push the local migration directory: it also contains an unapproved commercial draft and differing historical migration versions.

The existing RPC signature and assignment IDs are preserved. UI mutation controls stay unavailable without the new readiness function; existing records can be inspected. No payment/provider, contract, commercial or deployment changes occur in this slice.

## Rollback and verification

Prefer roll-forward. To disable this slice, revoke authenticated EXECUTE on `public.portal_management_ready()` and `public.set_portal_assignment(text,uuid,uuid,boolean,uuid,uuid,timestamptz,text)` and revert the UI commit. This stops access mutations, including legacy wrappers. Do not restore the older permissive authorization helper or delete audit records. A rollback requiring the old management body must undergo security review because its revocation eligibility gates are defective.

Run `supabase/tests/portal_management_verification.sql` before/after apply (read-only). Expected after apply: readiness exists; management is security-definer with empty search_path; anonymous execute false; authenticated execute true. Capture assignment/audit counts around apply; DDL must not change either count. Run behavioral tests with `npm test`; production must never receive disposable test fixtures.

Validation: `npm test` passed 29 tests, including organization scope membership removal, cross-tenant grants, replayed revocation and server-action validation. `npm run typecheck` and `npm run build` passed. Hosted authenticated browser testing and concurrent-session integration remain release gates. This is not full Super Admin completion or product-owner visual approval.
