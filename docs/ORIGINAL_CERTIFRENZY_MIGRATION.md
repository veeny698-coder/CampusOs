# CertiFrenzy exact-source migration contract

The original uploaded `certifrenzi-main(1).zip` is the authority for UI, navigation, labels, layout, drag-and-drop template editor and participant/coordinator workflow. The custom `app/admin/dashboard/certificates` implementation is **not** considered the final UX.

## UI surfaces to preserve verbatim from the original source
- `app/home/page.tsx` — home/landing design.
- `app/admin/page.tsx` and `app/admin/events/page.tsx` — overview and event list/create.
- `app/admin/events/[id]/page.tsx` — feedback links, coordinators, field configuration, roster upload.
- `app/admin/events/[id]/template/page.tsx` — drag/drop template editor, fonts and placeholders.
- `app/admin/responses/page.tsx` — feedback analytics/responses.
- `app/events/[slug]/page.tsx` — original participant feedback form.
- `app/events/[slug]/coordinators/page.tsx` — original coordinator certificate lookup.
- `app/authentify/page.tsx` and `app/certificate/page.tsx` — verification and downloads.
- `lib/certificate-generator.ts`, `lib/certificate-config.ts`, `lib/certificate-authenticity.ts` and related font/style files.

## Non-negotiable architecture
- One Supabase project and Auth session for all portals. **Do not retain separate Firebase or CertiFrenzy databases.**
- `public.events.id` is the immutable shared event key for QR scanner, event registration, feedback, coordinator rosters, certificate templates and certificates.
- Preserve existing CampusOS rows/migrations; no destructive dropping or re-keying.
- Replace original Firebase/back-end I/O with least-privilege Supabase server functions and RLS; keep original React JSX/CSS, interactions, placeholders and labels.
- Admin portal visibility **and all reads/writes** must enforce `has_portal_access` for institution, organization, and event. Merely showing portal cards is not authorization.
- Platform owner assigns/removes Events, QR Scanner, CertiFrenzy. Assignment to an institution member must be revocable without deleting event records.
- Student sign-in is global, and one account may belong to multiple institutions/organizations.
- Every write requires confirmation in AI assistant workflows.

## Test gate before replacing current routes
1. Original UI pixel/interaction parity, desktop + mobile.
2. Shared event creation visible inside both QR attendance and CertiFrenzy, no duplicate event.
3. Coordinator roster, feedback questions/required fields and certificate templates persist in same database.
4. Participant submits feedback, claims certificate, downloads PNG/PDF and QR verification succeeds.
5. Coordinator lookup, custom link, certificate ID, share, and revocation.
6. Portal permission assign/revoke tested with separate users across two institutions and events.
7. No unauthenticated member data exposure; audit logs written only through authorized RPCs.
8. GitHub typecheck/build passes, then explicitly authorized Vercel deployment; do not re-enable automatic builds.

This feature branch is an isolation boundary for original-source migration. Do not claim it has been imported or that parity has passed until all original files, database adapters and tests are committed.
