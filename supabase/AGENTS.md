# Supabase / Database Agent Instructions (inherits root /AGENTS.md)

## Hard requirements
- One Supabase project/schema and shared canonical `public.events.id`, no second credential/event/auth datastore.
- All changes in additive sequential `supabase/migrations`. No destructive reset, drop of historical certificates/registrations or unjustified policy broadening.
- Institution ID consistency across organization/event/registration/credential; enforce tenant-scoped FK and transactions.
- All grant decisions include principal, action, tenant, organization/event/session, status and effective period.
- SECURITY DEFINER functions: lock `search_path`, grant EXECUTE to exact roles, explicit auth checks, avoid uncontrolled RLS bypass. No long-lived service role in frontend.
- Public bearer tokens/routing (feedback, ticket, certificate) must be opaque, privacy-safe and abuse-limited.
- Every issued certificate snapshots eligibility and template version; immutable history, approved revocation/reissue. Staff certificate eligibility separate from participant registration.
- Audits for grants/revokes, denied sensitive access, issuance, scan corrections, exports and AI mutations.

## Migration workflow
1. Read actual live schema and existing migrations, RLS policies, privileges, function owner and storage policies.
2. Identify exact PRD/SRS IDs and failure modes. Create additive migration and rollback/compatibility plan.
3. Test in isolated staging project with realistic dummy tenants and non-owner JWT.
4. Negative tests: cross-tenant, cross-event, revoked grant, stale membership, malformed token, duplicate parallel insert, public export and Firebase leakage.
5. Commit migration + tests + documentation; never assume SQL success = behavioral test success.
6. Wait for explicit user authorization before production deployment or destructive work.

## Data lineage
`institutions → organizations/events → registrations/attendance → feedback/certificate`; preserve event UUIDs and old certificate verification tokens. Meeting/shift/audition attendance must have distinct context IDs.
