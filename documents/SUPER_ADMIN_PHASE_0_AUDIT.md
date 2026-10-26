# Super Admin Control Center — Phase 0 audit

**Audited commit:** `ffdc37f08b1c6e8358ddcc946fd5216e90d124a0` (`main`)

## Existing baseline

- **Application:** Next.js 15 App Router, TypeScript, React 19, Supabase SSR. There is no committed lockfile, test runner, or ESLint 9 flat configuration.
- **Authentication:** `lib/supabase/server.ts` reads the cookie-bound Supabase user. `getVerifiedPlatformOwner()` additionally requires an RLS-scoped row in `public.platform_owners`; it is used by existing platform pages. `app/portals/page.tsx` is the existing workspace selector for non-platform users.
- **Current routes:** `/admin/dashboard` is the existing owner command center. It mixes platform management with Events, QR Scanner, Certificates, and portal assignment. Existing public QRBlaze and CertiFrenzi flows occupy `/events/[id]`, `/ticket/[token]`, `/feedback/[token]`, `/verify/*`, `/certificates/lookup`, and `/authentify`.
- **Schema and migrations:** foundation tables cover institutions, memberships, organizations, events, registrations/check-ins, certificate records, `platform_owners`, `portal_catalog`, `portal_assignments`, and `audit_logs`. RLS and audited RPCs exist for the current platform-owner workflows. Platform staff capabilities, lifecycle state, subscriptions, feature flags, alerts, incidents, support access, integrations, queues, privacy, and release records do not exist.
- **Deployment:** GitHub CI runs install, typecheck, and build. Preview deployment is manual or PR-triggered; the repository and operating documentation state production Git deployment remains disabled. No deployment configuration was changed.

## Specification gap analysis

| Specification area | Current state | Delivery phase |
| --- | --- | --- |
| Isolated `/super-admin` shell and platform-only server guard | Missing; `/admin/dashboard` is mixed with operational portals | 1 |
| Design tokens, mobile drawer, breadcrumbs, loading/error states | Fragmented global and `console-*` styles; no reusable shell | 1 |
| Command Center overview data | Existing institution/audit reads only; no subscriptions, incidents, analytics, alerts | 1 baseline, 5–6 remaining |
| Institution lifecycle and 360/onboarding | Basic creation/listing only | 2 |
| Platform staff roles, invitations, granular capabilities | `platform_owners` is binary; portal assignments are tenant-scoped and partial | 3 |
| Module catalog/flags/settings/entitlements | Only operational portal catalog exists | 4 |
| Commercial records and metering | Missing | 5 |
| Security, privacy, operations, support, releases | Audit exists; remaining domains missing | 6 |
| Automation, integrations, AI approvals/execution logs | Missing | 7 |

## Phase 1 file-impact plan

1. Add a protected `/super-admin` route group and server layout. An authenticated non-platform user must return to `/portals`; an anonymous user returns to `/login`.
2. Add the sidebar/topbar shell with the contract's 10 navigation groups. Only delivered routes are links; future core pages are visible as planned inventory and are not navigable placeholders.
3. Add tokens and responsive styles without altering existing QRBlaze, CertiFrenzi, or `/admin/dashboard` CSS selectors.
4. Add a live-data-only overview baseline using existing RLS-scoped `institutions` and `audit_logs`; do not create a migration or fabricate unavailable KPI values.
5. Validate typecheck/build and local public-flow responses. Full authorization/RLS behavior requires an environment with the configured Supabase publishable key and a disposable test tenancy.
