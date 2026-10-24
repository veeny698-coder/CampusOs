# Original CertiFrenzy UI / Workflow Migration Contract

## Non-negotiable
Product owner rejected current redesigned certificate dashboard as confusing. **Original CertiFrenzy React UI, styling, template editor and interactions must remain same-to-same**. Only adapters/backend integrations should change, and shared CampusOS routing/branding should be added without altering core use.

## Original source
The uploaded `certifrenzi-main(1).zip` is the canonical source (not yet checked into GitHub). Inspect its actual component tree and CSS before implementation. Known source paths from earlier inspection, verify each against ZIP:
- `app/home/page.tsx` — original landing flow.
- `app/admin/page.tsx`, `app/admin/events/page.tsx` — admin overview/events.
- `app/admin/events/[id]/page.tsx` — event settings, coordinator roster/links.
- `app/admin/events/[id]/template/page.tsx` — original template editor/placeholder design UI.
- `app/admin/responses/page.tsx` — private feedback analytics.
- `app/events/[slug]/page.tsx` — public feedback workflow.
- `app/events/[slug]/coordinators/page.tsx` — coordinator certificate lookup.
- `app/authentify/page.tsx`, `app/certificate/page.tsx` — verification and display.
- `lib/certificate-generator.ts`, `lib/certificate-authenticity.ts`, `lib/certificate-settings.ts` — generation, QR/ID, settings.
Validate actual file paths before mapping; do not invent missing modules.

## UI parity checklist — screenshot-compare
- Original public home: layout, copy, spacing, cards, navigation, fonts and responsive behavior.
- Original admin overview / events list / event creation/edit and settings flow.
- Original event-specific feedback/question form builder, required answer validation and preview.
- Original feedback public link and participant lookup via correct original identity/token flow.
- Original template upload, drag/drop or editable X/Y variables, font/size/alignment/QR positioning; exact rendering output in portrait/landscape.
- Original participant and coordinator-specific designs/custom names/fields/link logic.
- Original response view/export and coordinator roster import/management.
- Certificate ID creation and legacy verification URLs, QR authenticity, PNG/PDF issuance, brand display.
- Original disabled/loading/error states, mobile camera/device paths, export button labels.

## Data adapter mapping
| Original concern | CampusOS target |
|---|---|
| Legacy event slug/data | `events.id` UUID + optional `legacy_event_aliases` for URLs |
| Old Firebase/Auth | Supabase Auth, RLS-authenticated server actions |
| Original participant roster | `event_registrations`, always `event_id` linked |
| Feedback answers / eligibility | `certificate_feedback`, versioned event-specific questionnaire and rule |
| Template assets/settings | `certificate_templates`, immutable issued version snapshots (to add) |
| Coordinator roster | `certificate_coordinators` now partial; extend to verified staff role/hours |
| Certificate storage | `event_certificates` and public minimally scoped verification function |
| Generator | retain original image rendering algorithm and font/layout support; use supported library/runtime |
| Shares/verification | legacy redirect mapping + new `/verify/certificate/{code}` and coordinator route |

## Security and correctness requirements
- Do NOT copy Firebase credentials/admin keys from ZIP, never dual-write; source code should be audited for secrets before inclusion.
- Participant: register → fill required feedback → evaluate configured eligibility → issue once → download. **Do not assume feedback alone is always sufficient**; SRS CER-003 permits attendance/results/hours/manual approvals.
- Coordinator: separate identity, event staff shift/hours/approval where rules require; don't issue just because string name matched.
- Issued credentials store **immutable** template version, event snapshot, recipient class and public verification ID; revoke/reissue audited.
- Prevent public enumeration of participants via email/name APIs; privacy-safe responses, rate limits, token possession or verified identity.
- Preserve original lookup UX while changing underlying safe authorization where necessary.
- Use event-specific link routing; don't create parallel CertiFrenzy event rows.
- **Powered by CertiFrenzy** must be stamped in preview, PNG, PDF, batch export and verification even with uploaded image.

## Migration acceptance evidence
Maintain `documents/qa/certifrenzy-parity-matrix.md` with every original screen, original file path, new route, screenshot pair, API mapping, tests and product-owner approval. Mark no item verified before it matches. Test portrait and landscape, very long names, custom font/colour/placeholders, date/timezones, coordinator roles and invalid/revoked IDs.

## Do not reuse the interim UI blindly
Existing `app/admin/dashboard/certificates/**` is an incomplete substitute and should be replaced or wrapped behind a controlled feature flag only after original UI parity. Existing Supabase tables can be evolved, but never delete live issuance records to match original app schema.
