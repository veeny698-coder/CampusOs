# Commercial foundation migration review

28 October 2026. Status: owner-approved consolidated batch APPLIED and metadata verified.

## Source and scope

Ultimate Super Admin specification section 04 (plans, subscriptions, contracts/billing and usage); SRS:TEN-003 through TEN-010, TEN-016, DATA-005, NFR-022, NFR-025; PRD:SAS-009 / PRT-001. This delivers provider-neutral reference records and entitlement operations. It does not claim the full commercial specification or full Super Admin is verified.

One batch: `supabase/migrations/202610260005_commercial_foundation.sql`, implementation commit `19941d5`. The earlier uncommitted draft was replaced in place; do not apply any earlier copy. Live read-only inspection on 28 October found no commercial tables. After explicit approval, the exact committed batch was applied and recorded live as `20261028182835_commercial_foundation`. All ten tables have RLS. Verification assertions passed: anonymous function access and direct authenticated table writes are denied. Existing counts remained unchanged: 1 institution, 0 events, 3 owners, 1 audit record. Plans and metering events remain empty; no commercial fixtures were seeded. A preflight check refuses accidental reapplication.

## Data and authorization

Ten new RLS tables: plans, plan versions, entitlements, contracts, subscriptions, billing records, meters, rollups, append-only metering events, append-only lifecycle audit. Contract/subscription/billing/usage references include composite institution foreign keys. Authenticated users have SELECT only, filtered to platform owners. Anonymous roles have neither table access nor RPC EXECUTE. Mutations require verified platform ownership independently in server actions and SQL, plus confirmation and audit reasons in the UI. Trigger/helper functions have no client EXECUTE grants; SECURITY DEFINER functions use empty search_path.

Published versions/entitlements cannot be edited. Signed contract references and recorded billing references cannot be rewritten. Retiring a plan prevents new subscriptions without altering existing entitlements. Subscription state transitions are explicit and cancellation is terminal. Signed contracts must match the institution and cover the subscription term.

Metering locks the selected subscription, checks effective entitlement and quota, inserts one immutable event per institution/source-operation key, updates the rollup and records audit in one transaction. Exact retries return the original event; changed payloads with the same key fail. Quotas are cumulative across the explicit subscription term, with no inferred monthly billing/reset. Unlimited must be an explicit null quota; absent/disabled entitlement denies. Multiple meters tied to one entitlement share its quota. A read-only entitlement check is advisory; reserve/record through the atomic operation when enforcing consumable quotas. A separate feature permission check is still required.

## Compatibility and remaining work

No existing Auth, events, QRBlaze, CertiFrenzy, storage or tenant data is changed. No commercial records are seeded. Existing operational portals do not suddenly require subscriptions: approved entitlement rollout and domain-specific transactional usage integration remain pending. The new server-only entitlement helper fails closed on query/validation errors.

No provider, prices, currency, tax rules, invoice contents, legal wording, collection, refunds or founding-college exception is invented. UI inputs store references to existing approved documents. Marking a contract signed or a billing reference settled records an external outcome; it does not execute a signature/payment. Secure document uploads, provider adapters/webhook reconciliation, financial terms, approved amendments/renewals, exceptions, operator capability separation, and domain usage emitters remain future work requiring their own tested implementation and relevant product inputs.

Lists/selectors are bounded to 1,000 records and explicitly disclose the limit. Search/cursor pagination and hosted authenticated browser/mobile review remain unfinished. No visual parity or production-ready claim is made.

## Verification and rollback

- `tests/commercial-security.test.cjs` runs the real committed DDL/RPC bodies in disposable PGlite PostgreSQL with anon/authenticated roles and two synthetic institutions. Only the unrelated pgcrypto extension declaration is omitted from baseline migrations; gen_random_uuid is built in.
- `tests/commercial-actions.test.cjs` checks every command, owner denial, allowlisted RPC dispatch, invalid inputs, confirmation and safe errors.
- `tests/commercial-ui.test.cjs` renders every form and tests protected page denial/error states. These are rendered-component tests, not browser login tests.
- `supabase/tests/phase5_commercial_verification.sql` asserts RLS/grants and reconciles immutable events with rollups without writing production data. Run after apply. Disposable tests run it as part of validation.
- Separate hosted sessions/concurrent requests and actual Supabase Auth/browser integration remain release gates; PGlite execution is not evidence of live network behavior.

Local evidence on 28 October: `npm test` passed 59 tests across login routing, portal security/actions and commercial SQL/actions/rendered UI. `npm run typecheck -- --incremental false` and the production build passed. The repository lint configuration remains a separate unresolved baseline task. These results are not a production deployment or completed hosted acceptance test.

Before approval: review the entire batch, execute tests/typecheck/build, record live schema absence and check current migration history. Apply this file alone. Historical repository versions differ from tool-assigned live versions; never run an indiscriminate migration push. Existing portal repairs are recorded live as 20261027162046 and 20261028120600.

The SQL batch is transactional: a failed statement rolls back all its changes. After successful use, preserve all financial/history rows. Roll back the application entry points first and revoke authenticated EXECUTE on the new commercial mutation functions; do not delete tables/history or restore permissive policies. Revoking every commercial function also disables entitlement checks and must be coordinated with any later domain rollout. No destructive rollback is authorized by this review.

GitHub CI run 40688713732 passed for implementation commit 19941d5. Vercel automatic deployment remains disabled. The commercial schema is applied; application deployment and hosted acceptance testing have not been performed.
