# Original CertiFrenzi Source Inventory — Verified from ZIP

Inspected attached `certifrenzi-main(1).zip` on 24 October 2026. **Source paths below are confirmed ZIP entries**, not guessed architecture. The original source is an independent app using Supabase components plus Firebase Admin for certificate authenticity; its exact React/CSS should be reused, not reimagined.

## Frontend screens (verified)
| Source file (relative to ZIP root) | Purpose / migration consideration |
|---|---|
| `app/page.tsx`, `app/home/page.tsx` | entry/landing |
| `app/admin/page.tsx` | admin dashboard |
| `app/admin/events/page.tsx` | event list and management |
| `app/admin/events/[id]/page.tsx` | event-specific management/settings |
| `app/admin/events/[id]/template/page.tsx` | original template studio, **1,146 lines / 40,906 bytes**; do not replace with new slider form |
| `app/admin/responses/page.tsx` | feedback responses |
| `app/events/[slug]/page.tsx` | public event/feedback |
| `app/events/[slug]/coordinators/page.tsx` | coordinator lookup |
| `app/auth/login/page.tsx` | old auth UI; migrate to unified Supabase auth |
| `app/authentify/page.tsx` | certificate ID authenticity |
| `app/certificate/page.tsx` | certificate view/download |

## Original API handlers (verified)
- `app/api/bulk-upload/route.ts`
- `app/api/certificate/route.ts`
- `app/api/coordinator-certificates/route.ts`
- `app/api/coordinator-certificates/sync-all/route.ts`
- `app/api/events/[slug]/certificate/route.ts`
- `app/api/events/[slug]/coordinators/certificate/route.ts`
- `app/api/events/[slug]/coordinators/lookup/route.ts`
- `app/api/events/[slug]/feedback/route.ts`
- `app/api/feedback/route.ts`
- `app/api/get-certificate/route.ts`

## Core libraries (verified)
- `lib/certificate-generator.ts`: 223 lines, Sharp image renderer. Contains `TextPosition{x,y,fontSize,fontColor,fontFamily?}`, overlay and authenticity-stamp types.
- `lib/certificate-authenticity.ts`: 371 lines, **firebase-admin / firestore + qrcode**; needs same features with Supabase credential records. No Firebase credentials copied.
- `lib/certificate-config.ts`: QR/authenticity settings.
- `lib/certificate-settings.ts`: event certificate configuration.
- `lib/certificate-fonts.ts`: font registry.
- `lib/event-form-config.ts`: original event custom fields, required rating/text feedback. Original has multiple fixed default feedback questions; do not simplify to one rating and one comment without explicit sign-off.
- `lib/supabase/admin.ts`, `client.ts`, `proxy.ts`, `server.ts`: preexisting Supabase integration but may point at different project or auth assumptions. Replace connection strategy with CampusOS `lib/supabase/server.ts` and shared project.
- `lib/utils.ts`.

## Design source
- `app/globals.css`, `styles/globals.css`.
- `components/ui/**` (Radix/Shadcn-style imported by template/editor pages).
- Brand/placeholder images under `public/`; original fonts included inside ZIP should be used only pursuant to license compliance, not re-shared separately.
- `package.json` contains original UI/component dependencies; migrate selectively and keep current versions/lockfile coherent.
- Do not blindly copy middleware, login, config or legacy API routes; these are auth/security integration surfaces.

## Priority migration order
1. Copy original visuals/assets/component library with no database-side changes to isolated portal route and obtain screenshot baselines.
2. Build typed adapter interfaces for original components (`eventId`, slug aliases, users, responses, config, coordinators, templates).
3. Port original API endpoint behavior to secured Supabase RPC/services, not public service-role operations.
4. Port original Sharp/QRCode renderer and tests for fixed fonts/coordinates, separate participant/coordinator templates and QR branding.
5. Add delegated event/society portal rights and reject unauthorized records/actions.
6. Replace interim bespoke pages once screenshot diff, policy tests and product owner sign-off pass.

## Imported-source safety review
Search for firebase-admin, FIREBASE_*, SUPABASE_SERVICE_ROLE_KEY, hardcoded provider secrets, admin key, credential config and Firebase sync jobs. Remove old environment dependencies from browser. Never commit credential files. Preserve only original user-visible behavior and necessary rendering logic.

## Missing evaluation
This inventory verifies **file existence and selected source structure**, not feature-complete behavior. Codex must inspect each file deeply and turn this into component-by-component parity/acceptance evidence.
