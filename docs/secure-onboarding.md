# Institution creation flow

- Only an authenticated, verified Platform Owner may submit the server action.
- Server validates name and slug, accepts no caller-supplied owner/user/tenant IDs.
- Database has a platform-owner-only INSERT RLS policy, separate from the server check.
- The institution creation trigger writes an append-only audit log using auth.uid().
- Privileged Data API grants (TRUNCATE, TRIGGER, REFERENCES, UPDATE, DELETE) are revoked for anon/authenticated.
- No auto-membership assignment or subscription changes are implied by institution creation.
- No public self-registration for institutions.
- Pending: test with a real Platform Owner session, rate limiting, invite flows, audit export and transaction-level tenancy tests.
