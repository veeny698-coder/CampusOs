# Limited platform operator access

Scope: Ultimate Super Admin sections 03.2 Roles, 03.4 Team and 08.2 Audit; SRS:IAM/ACL. This slice implements one working read-only capability, `audit.read`. It does not claim the complete platform role catalog, invitation delivery or tenant role system.

Migration `20261028123732_platform_operator_audit_access.sql` was generated with Supabase CLI 2.122.0. Live metadata inspection found only platform_owners and platform_settings_versions; neither new table/function existed. The migration is NOT APPLIED.

## Behavior and security

Owner-published role versions are immutable. Requests target an existing non-owner account, have a finite explicit future expiry, and grant nothing while pending. A different current platform owner must approve; requester and recipient cannot approve their own request. Owner revocation also works after expiry. No RPC changes platform_owners, so this slice cannot remove the last owner or turn an operator into an owner.

The session resolver verifies Auth identity and current database rights on every request. Owners retain the existing path when the migration is absent. Operators land on the audit route and see only that capability's navigation. Existing owner-only page/action/RPC boundaries remain unchanged.

Audit operators use a bounded keyset RPC returning only record ID, action, resource type/ID and timestamp. No audit details, actor email, student data or direct audit-table policy is exposed. Role/version tables are owner-readable; requests are owner/self readable. Helper/trigger functions are not client-executable; public APIs revoke PUBLIC/anon execution and pin search_path.

## Changed files

- Migration, `lib/auth/platform-access.ts`, login continuation and Super Admin layout/overview/shell/audit.
- Protected `/super-admin/access/roles` and `/super-admin/team` pages/forms/actions.
- SQL authorization, server-action, resolver/routing and rendered-navigation tests in `tests/platform-access-*.test.cjs`; updated login tests.

## Compatibility, rollback and remaining gates

No existing tenant/Auth/event/owner rows are changed and no role/request is seeded. Reverting the UI restores owner-only entry; revoking EXECUTE on platform_my_capabilities and platform_audit_feed disables operator reads immediately. Preserve role/request/audit history. Do not drop data to roll back.

Before approval run tests/typecheck/build and `supabase/tests/platform_operator_verification.sql`. After applying run the metadata checks and compare owner/tenant counts. Never run disposable test fixtures against production.

Pending: authenticated hosted browser acceptance, dual-owner user workflow, mobile visual approval, full capability catalog, invitations, security-directory diagnostics and support exception controls. The latest 100 requests and 1,000 role versions are explicitly bounded; full search/pagination is not delivered here.

Local validation: 74 tests passed across the complete suite, including independent-owner approval, pending/expired/revoked denial, direct-table privacy, metadata-only audit output, non-owner action denial and rendered operator navigation. Typecheck and production build passed. No requirement is marked VERIFIED without hosted/browser and visual evidence.
