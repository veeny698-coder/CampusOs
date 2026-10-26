# CampusOS local Codex handoff — 26 October 2026

## Repository state

- Repository: veeny698-coder/CampusOs
- Branch: main
- Latest committed work: 6126906 feat(platform): add product control pages
- All work below is pushed to GitHub main. The working tree was clean when this handoff was prepared.
- Do not enable Vercel automatic production deployment or deploy without explicit owner approval.

## Read first

1. Root AGENTS.md
2. documents/SUPER_ADMIN_PHASE_0_AUDIT.md
3. documents/knowledge-base/PORTAL_RBAC_AND_TENANCY.md
4. documents/IMPLEMENTATION_MASTER_PLAN.md

## Completed Super Admin work

### Phase 0 — audit

documents/SUPER_ADMIN_PHASE_0_AUDIT.md records route, auth, schema, RLS, and implementation gaps.

### Phase 1 — shell

- Protected /super-admin layout and server-side platform-owner guard.
- Anonymous users redirect to /login; authenticated non-platform users redirect to /portals.
- Responsive Super Admin sidebar/topbar, mobile drawer, loading and error states.
- Live overview reads only existing RLS-scoped institutions and audit records.

### Phase 2 — institution management

- /super-admin/institutions
- /super-admin/institutions/[id]
- /super-admin/onboarding
- /super-admin/organizations
- Lifecycle, profile, onboarding, and owner-invitation request data model.
- Owner invitations are records only: no email delivery or auth-user provisioning exists yet.

### Phase 3 — access-control foundation

- Time-bounded portal grants, explicit audited revocation, and expiry checks in has_portal_access.
- The existing legacy assignment RPC routes through the new revocation semantics.
- Portal Access UI, user directory, operator roles, and invitation acceptance remain unimplemented.

### Phase 4 — product control

- /super-admin/modules
- /super-admin/modules/flags
- /super-admin/settings
- Feature flags with deterministic global/tenant evaluation and versioned platform settings.
- No flags, settings, or fake metrics were seeded.

## Migration status

The owner applied all four migrations in the Supabase SQL Editor and verified the Phase 2 tables/functions and backfill consistency:

1. 202610260001_super_admin_institution_management.sql
2. 202610260002_time_bound_portal_assignments.sql
3. 202610260003_product_control_foundation.sql
4. 202610260004_feature_flag_catalog_rpc.sql

Evidence received for Phase 2:

- institution_profiles, institution_onboarding, and institution_owner_invitations exist with platform-owner read policies.
- Required Phase 2 functions exist.
- The one existing active institution has exactly one profile and one onboarding record.

Do not assume Phase 3 or Phase 4 migrations were independently verified beyond the owner confirming each SQL Editor run. Re-run metadata and RLS checks before changing their structures.

## Validation completed

- npm run typecheck -- --incremental false passed after each frontend change.
- NEXT_TELEMETRY_DISABLED=1 npm run build passed for Super Admin pages.
- Local unauthenticated requests to Super Admin pages returned safe login redirects.
- Public landing, login, and invalid event route regressions passed locally.

Known validation blocker: npm run lint fails because the repository has no ESLint 9 flat configuration. Do not add a speculative config; resolve it as a separate tooling task.

## Supabase access

- Project reference: dcpetrudlngtrabmdwol
- The cloud environment Supabase MCP OAuth was not completed. Local Codex should use the Supabase extension/MCP connection or Supabase CLI with secure local credentials.
- Never paste pool strings, database passwords, service-role keys, or Supabase access tokens into chat, source, docs, or commits.
- Use a disposable Supabase project or branch for RLS tests. Do not create test auth users or mutate production tenant data for authorization tests.

## Next work: Delivery Phase 5 — Commercial

Implement one consolidated migration batch before asking the owner to run SQL:

1. Provider-neutral plan catalog and versioned price/contract records.
2. Institution subscriptions and state transitions: trial, active, grace, suspended, cancelled.
3. Usage-meter definitions and tenant usage rollups.
4. Audited commercial mutations and server-side entitlement checks.
5. Super Admin billing pages: plans, subscriptions, billing, and usage.

Do not invent a payment provider, currency, tax treatment, pricing, invoice data, or founding-college contract wording. Those are documented open decisions. Use provider-neutral records and keep payment-provider actions feature-gated.

## Required tests before calling a phase complete

- Platform owner, tenant member, unrelated tenant member, revoked grant, expired grant, and anonymous direct-route/API checks.
- Two-tenant isolation for every query and RPC added.
- Migration compatibility against the actual live schema dump.
- Typecheck and production build.
- Confirm no QRBlaze, CertiFrenzi, public feedback, ticket, or certificate-verification regression.

## Git workflow

- Work on main, per AGENTS.md and owner instruction.
- Commit each coherent vertical slice and push it to origin main.
- Before pushing, fetch/rebase if remote main changed; never force-push.
