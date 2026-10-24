# CertiFrenzy Original-vs-CampusOS Visual and Functional Parity Matrix

**Status key:** UNSCOPED, MAPPED, IMPLEMENTED_UNVERIFIED, VISUALLY_VERIFIED, FUNCTIONALLY_VERIFIED, APPROVED. **All rows initially MAPPED/UNVERIFIED** until original screenshot/behavior evidence is added.

| Original screen/workflow | Original source path (verify ZIP) | Target portal route | Must validate | Current status |
|---|---|---|---|---|
| Original landing | `app/home/page.tsx` | `/certifrenzy` (proposed) | pixel styling, nav, mobile | MAPPED only |
| Original admin | `app/admin/page.tsx` | `/portal/certifrenzy` proposed | event cards/links, roles | MAPPED only |
| Event list/create | `app/admin/events/page.tsx` | events shared adapter | existing event, not duplicate | MAPPED only |
| Event settings | `app/admin/events/[id]/page.tsx` | canonical event ID | coordinator, forms, links | MAPPED only |
| Feedback config | inspect event page/components | CertiFrenzy event settings | required questions, versioning | MAPPED only |
| Feedback response | `app/events/[slug]/page.tsx` | event feedback link | ticket policy, public privacy | MAPPED only |
| Template editor | `app/admin/events/[id]/template/page.tsx` | event template editor | drag/drop, styling, previews | MAPPED only |
| Coordinator setup | inspect event page/components | coordinator roster | custom fields CSV/links | MAPPED only |
| Coordinator public lookup | `app/events/[slug]/coordinators/page.tsx` | coordinator lookup | privacy, eligible staff | MAPPED only |
| Feedback analytics | `app/admin/responses/page.tsx` | staff responses | private authorized export | MAPPED only |
| Authentify/ID | `app/authentify/page.tsx` | `/authentify` | old/new IDs and revocation | MAPPED only |
| Participant certificate | `app/certificate/page.tsx` | verified credential | exact image output, PDF/PNG | MAPPED only |
| Batch export | inspect original generator/settings | scoped export route | 100+ items/retries | MAPPED only |

## Test artifact template
For each row, append: original screenshot (URL), current screenshot (URL), viewport, source JSX/CSS reference, visual-diff outcome, user flow test ID, tenant-scope negative test ID, issue or mismatch, approval owner/date. No row may be marked APPROVED on CI passing alone.

## Required comparison cases
- desktop and mobile (including touch drag gestures)
- portrait and landscape image sizes; safe margins and bleed
- normal/long/Unicode names, multi-line fonts, mixed lettercase
- custom placeholder text, custom links, font size/colour/family/alignment
- missing/invalid/expired link; duplicate/feedback-later and revoked cases
- participant vs coordinator certificate and separate recipient type
- unique certificate ID, verifiable QR, WhatsApp/LinkedIn share
- permanent **Powered by CertiFrenzy** embedded in generated media
- feedback completion requirement, recipient lookup, offline/errors/loading
- no duplicate events or secondary Firebase credential database

## Approval
Visual sign-off: Product owner ___. Technical/function sign-off: QA ___. Security approval: Security ___. Date/evidence ___.
