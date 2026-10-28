# Owner invitation acceptance — review and release notes

Scope: SRS:IAM-002; implementation-plan Sprint 1 invitation and verified-email acceptance. This is a narrow, additive Super Admin slice. It does **not** create Auth accounts, configure an email provider, invent legal language, or alter QRBlaze, CertiFrenzy, shared Auth, canonical `events.id`, tenant event data, or Vercel deployment settings.

## Batch

`supabase/migrations/20261028183937_owner_invitation_acceptance.sql` is the single additive migration for this slice and is **not applied to the live project** as of 29 October 2026.

It adds:

- `accepted_at` and `accepted_by` to existing owner invitations;
- opaque, SHA-256-hashed, one-time tokens and per-account attempt counters, both RLS-enabled with no direct authenticated/anonymous access;
- owner-only creation/rotation and revocation RPCs, each requiring a reason and audit entry;
- an authenticated acceptance RPC which requires a confirmed, non-banned account whose normalized email equals the invitation email, rechecks expiry and active institution state under lock, creates/upgrades only that institution membership to `owner`, consumes the token, and audits acceptance.

The UI creates a link only once, asks the platform owner to copy it to an approved delivery channel, exposes a revocation form, and supplies an acceptance page. The clear token is never stored in a table, audit payload, or page listing.

## Security and compatibility

- All privileged functions are `SECURITY DEFINER` with `search_path=''`, explicit `authenticated` grants, and `PUBLIC`/`anon` execute revoked.
- Acceptance returns a generic denial for invalid/expired/revoked/replayed/mismatched links to avoid invitation/account enumeration.
- The existing invitation request RPC remains for compatibility; the updated Super Admin UI uses the link RPC. Existing invitation rows remain valid records and no tenant rows are rewritten.
- A platform owner may revoke pending or expired links. Accepted invitations are terminal; repeat acceptance is denied.
- A pending invitation link is an external bearer secret. Delivery, retention, and disclosure must follow an approved operational channel; no provider is presumed.

## Rollback

Before any rollback, revoke every outstanding link through the UI/RPC. To reverse only the additive database objects: revoke function grants, drop the four new functions, drop `owner_invitation_attempts` and `owner_invitation_tokens`, then drop `accepted_at` and `accepted_by` only after confirming no accepted invitation rows require that audit history. Rolling back after live acceptance is a data-retention decision and must be approved; it is not an automatic remediation.

## Verification evidence

- Live-schema comparison before code: existing invitation table has no acceptance columns, one platform-owner read policy, and only the legacy creation RPC; latest live migration is `20261028183125`.
- Disposable PostgreSQL test: `tests/owner-invitation-security.test.cjs` covers owner-only creation, no anon execute, hidden hash storage, generic denials, verified-email matching, one-time acceptance, scoped membership, revocation and audit.
- Server-action test: `tests/owner-invitation-actions.test.cjs` covers input validation, owner authorization, allowlisted RPC arguments, relative link output, and generic acceptance failures.
- Release SQL: `supabase/tests/owner_invitation_acceptance_verification.sql` verifies RLS, RPC grants, and added columns without creating records.

Do not apply to production until this migration, the verification SQL, RLS checks, hosted authenticated browser flow, and product-owner visual review are approved together.
