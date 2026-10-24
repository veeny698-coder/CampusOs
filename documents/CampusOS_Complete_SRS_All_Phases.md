# CampusOS Complete SRS — All Phases

**Source document:** `CampusOS_Complete_SRS_All_Phases.docx` · 22 October 2026 · Draft for stakeholder review.

**Important:** This is the complete text-extracted archival copy of the original master DOCX, preserving sections and wording, but not original Word layout, tables, figures or typography. It describes **target requirements**, not implementation status. Do not interpret a requirement as a completed feature.

---

<PARSED TEXT FOR PAGE: 1 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION




SOFTWARE REQUIREMENTS
SPECIFICATION
Campus Operating Platform — all-phases target product

Unified QRBlaze + CertiFrenzy | Working umbrella brand pending | Multi-institution SaaS

SRS Master Baseline • 22 October 2026 • Status: Draft for stakeholder approval

Prepared to accompany CampusOS_Full_Master_PRD_All_Phases.docx. Requirements describe planned target-state
behavior, not claims of implemented features.


Document control
 Property                                                Value

 Document ID                                             CAMPUS-SRS-MASTER
 Version                                                 Master baseline 1.0 (all phases; not MVP limited)
 Product owner                                           Platform Founder / Super Admin
                                                         Commercial SaaS + complete institution/society/event
 Scope
                                                         operations + AI
                                                         Approved contracts and applicable law > approved SRS
 Precedence
                                                         change requests > draft assumptions
                                                         Functional IDs by domain; acceptance scenarios and
 Traceability
                                                         release gates


Contents
01. Purpose, scope and conventions

02. System context and actor model

03. Platform tenancy, contracts and plans

04. Identity and authentication

05. Authorization, delegation and access

06. Organization and membership management

07. Recruitment, auditions and selection

08. Digital ID card studio

09. Event hierarchy and lifecycle

10. Forms, registration and team entries

11. QR attendance and check-in engine

12. Society meetings and QR meeting attendance

13. Event staff and coordinator attendance

14. Competitions, scoring and results

                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 1
<PARSED TEXT FOR PAGE: 2 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

15. CertiFrenzy credentials

16. Communication, notifications and campaigns

17. Society operational management

18. Student/faculty/public portals

19. AI command center and n8n

20. Analytics and reporting

21. Resource, budget and finance operations

22. Data architecture and integration contracts

23. Non-functional and security requirements

24. State machines and business rules

25. Representative end-to-end scenarios

26. Acceptance test catalogue

27. Delivery phases and migration strategy

28. Assumptions, open decisions and sign-off




                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 2
<PARSED TEXT FOR PAGE: 3 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

1. Purpose, scope and conventions
This specification defines functional and non-functional requirements for a configurable multi-college SaaS
platform that unifies QRBlaze event/attendance and CertiFrenzy credential workflows with institution
management, society operations, recruitment, meetings and an authorization-aware AI operator. All phases are
included; phased delivery affects timing, not the target scope.

Normative terminology: SHALL is mandatory; SHOULD is recommended; MAY is optional. An explicit approval is
required for EVERY AI-initiated write, regardless of apparent risk. Requirements apply per tenant unless labeled
platform-global.

     A tenant is a distinct college/institution with its own data, branding, rules and subscription.
     An organization is a department, society, club, committee, team or authorized subunit within a tenant.
     A principal is an authenticated person or service identity. An assignment grants actions within an explicit
      scope and validity window.
     An event can have child events; competition stages and recruitment rounds are independent structured
      models.
     A member ID QR identifies a membership credential, while an event-issued QR identifies an event registration;
      neither alone authorizes attendance.


2. System context and actor model
    Actor                                                      Scope and primary responsibilities

                                                               Tenant provisioning, plans, contracts, support policy,
    Platform Super Admin                                       global security, feature catalog and platform
                                                               monitoring.
                                                               Commercial actions delegated by founder with limited
    Platform Commercial Operator
                                                               financial scope.
                                                               Only own tenant: college settings, institution user
    Institution Owner                                          admins, departments, societies and institutional
                                                               approvals.
                                                               Delegated college-wide operations and institutional
    College Admin / Dean / Principal
                                                               oversight.
                                                               Manage permitted department, events, faculty and
    HOD / Department Faculty
                                                               student coordinators.
                                                               Manage specified society, elections/positions,
    Society Faculty Advisor / Society Head
                                                               recruitment, meetings, events and delegation.
                                                               Delegated budgets, projects, operations, event roles
    Society Treasurer / Core Team / Member
                                                               and member records.
    Event Director / Registration Manager / Scanner /          Only assigned event, child event or designated station,
    Certificate Manager                                        with permitted actions.
                                                               Time-limited portals for assigned evaluation,
    Judge / Guest / External Participant
                                                               participation and check-in.
                                                               Own identity, memberships, applications, passes,
    Student / Alumni
                                                               certificates and achievements.
                                                               Service principals use scoped tool APIs and approval-
    AI Operator / n8n service
                                                               gated mutations.

Tenant owner and platform founder are different security roles. Founder controls commercial provisioning and
global platform settings; access to student-level private data is exceptional, policy-controlled and audited.
                                                     CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 3
<PARSED TEXT FOR PAGE: 4 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

3. Platform tenancy, contracts and plans
TEN-001 Tenant isolation. Every record and access check SHALL resolve institution scope; cross-tenant access
SHALL fail closed.

TEN-002 Provisioning. Super Admin SHALL create, activate, suspend, archive and configure tenants and assign a
verified institution owner.

TEN-003 Plan catalogue. Authorized platform staff SHALL create versioned free/trial/paid/enterprise plans and
feature entitlements.

TEN-004 Founding college. A complimentary founding-college contract SHALL be represented as an ordinary zero-
price versioned plan/contract, not hard-coded bypass.

TEN-005 Commercial pipeline. Lead, quote, trial, negotiation, signed contract, invoice and activation stages SHALL
be supported.

TEN-006 Contract record. Store effective dates, signatures/references, amendments, contacts, currency, pricing,
taxes as configured, service terms and renewal policy.

TEN-007 Subscription lifecycle. Trial, active, grace, read-only, suspended, cancelled and expired statuses SHALL be
explicit and auditable.

TEN-008 Entitlement engine. Plans SHALL control organization count, active members, events, storage, certificates,
communication volume and AI usage using configurable quotas.

TEN-009 Usage meter. Counters SHALL be defined by event type, period, billable unit, idempotency key and
attribution to tenant.

TEN-010 Overage handling. Hard limits SHALL reject creation clearly; soft limits SHALL alert and record
chargeable overages as contracted.

TEN-011 Renewal alerts. Configurable notices SHALL notify the contract owner and platform operator ahead of
renewal and expiry.

TEN-012 Billing integrations. Payment provider and accounting adapter SHALL use authenticated webhooks,
duplicate protection and reconciliation status.

TEN-013 Entitlement upgrades. Changes SHALL retain historical snapshots, effective periods, proration policy and
rollback/credit rules.

TEN-014 Data continuity. Expiry SHALL NOT silently delete college records; grace, export, suspension and retention
follow contract/policy.

TEN-015 Tenant support access. Cross-tenant support SHALL require approved purpose, least privilege, expiry and
complete access audit.

TEN-016 Institution self-service. Institution owner SHALL see own subscription, invoice history, consumption,
requests and renewal actions without global billing administration.

TEN-017 Tenant branding. Tenant SHALL configure approved logo, colors, institution details, domains and email
sender settings.


4. Identity and authentication
IAM-001 Single profile. One individual SHALL hold one primary account with multiple memberships, positions and
event assignments.

IAM-002 Account invitation. Authorized admins SHALL invite or provision accounts, assign initial scope and
provide activation links.
                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 4
<PARSED TEXT FOR PAGE: 5 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

IAM-003 SSO support. Support email login initially and optionally institution SSO with verified domains and tenant
mapping.

IAM-004 MFA. Platform admins and privileged institution roles SHALL use MFA according to policy.

IAM-005 Session control. Sessions SHALL support expiration, logout-all, device revocation and reauthentication for
privileged actions.

IAM-006 Account recovery. Secure identity verification, one-time expiry, throttling and audit SHALL protect
recovery.

IAM-007 External user. Judges and participants MAY use time-limited accounts with limited profile exposure.

IAM-008 Identity linking. Duplicate email and institutional identifiers SHALL be resolved through verified linking
and review, not blind overwrite.

IAM-009 Academic year. Term and alumni lifecycle SHALL retain historical memberships and achievements.

IAM-010 Self-service profile. Users SHALL edit permitted fields, consent preferences, avatar and communication
settings.

IAM-011 Account status. Pending, active, locked, suspended, deactivated and alumni statuses SHALL have defined
access behavior.

IAM-012 Credential revocation. Role, organization and credential deactivation SHALL take effect without relying
on stale frontend caches.


5. Authorization, delegation and access
ACL-001 Scoped RBAC. Permission decisions SHALL combine principal, tenant, resource hierarchy, action,
contextual policy and validity.

ACL-002 Role catalogue. Immutable system roles and configurable tenant-approved custom roles SHALL be
supported.

ACL-003 Fine actions. View, list, create, update, approve, export, publish, delete, delegate and manage permissions
SHALL be separate rights.

ACL-004 Inheritance. Parent-event role inheritance SHALL be explicit/configurable; child access must not
accidentally expose unrelated data.

ACL-005 Cross-org events. Joint event access SHALL rely on event-specific grants, not transfer ownership of whole
organizations.

ACL-006 Delegation. Grantor SHALL possess both delegable grant permission and the rights being granted in target
scope.

ACL-007 Granular event portal. Heads SHALL be able to grant check-in, registrations, certificate, email, staffing or
analytics individually.

ACL-008 Time limits. Assignments SHALL support effective and expiry timestamps, purpose, issuer, status and
revocation.

ACL-009 Sensitive permissions. Exports, finance, judge results, private contacts and mass messaging SHALL have
extra policies.

ACL-010 Audit. Every role grant/revoke and denied sensitive request SHALL be recorded with before/after and
actor.

ACL-011 AI parity. AI and automation tools SHALL enforce exactly the same effective permissions as manual API
requests.

                                                   CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 5
<PARSED TEXT FOR PAGE: 6 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

ACL-012 Default deny. Missing, expired, ambiguous or cross-tenant grants SHALL deny access.

ACL-013 Permission testing. A cross-scope automated test matrix SHALL cover all privileged endpoints, storage and
realtime channels.

ACL-014 Emergency control. Institution owner can suspend users; founder can suspend tenant; each action
requires reason and audit.


6. Organization and membership management
ORG-001 Organizations. Create/manage departments, societies, clubs, committees and temporary festival
committees within tenant.

ORG-002 Organizational relationships. Support organization parents, affiliations, collaborative events and
independent ownership.

ORG-003 Member records. Membership SHALL include organization, role/post, team, start/end, status, approval
and historical changes.

ORG-004 Multi-membership. Same user SHALL belong to multiple organizations with different designations.

ORG-005 Team administration. Create core teams, working groups, recruitment panels and staff rosters.

ORG-006 Position catalogue. Support custom positions such as president, faculty coordinator, treasurer and
volunteer.

ORG-007 Member onboarding. Approval, welcome messages, documents, permissions and ID issuance SHALL be
independently configurable.

ORG-008 Transfer/offboarding. Leave, alumni graduation, termination, handover and term rollover SHALL
preserve historical credits.

ORG-009 Bulk import. Authorized admins SHALL import members with dry run, validation, duplicate detection
and error file.

ORG-010 Directory privacy. Visibility of phones, email, profile photos and other data SHALL be controlled per
audience.

ORG-011 Society applications. Student membership requests and invitation-only society entries SHALL be
supported.

ORG-012 Membership dashboards. Provide active/inactive count, team diversity, recruitment history and member
participation.

ORG-013 Academic rollover. New academic year SHALL create new office tenures and transfer authorities without
erasing past records.

ORG-014 Cross-role selector. Users SHALL switch active institutional/society workspace without second account.


7. Recruitment, auditions and selection
REC-001 Drive creation. Head/advisor SHALL create recruitment drive scoped to a society, team and academic year.

REC-002 Dynamic application. Recruitment forms SHALL include custom fields, attachments, eligibility and
deadline.

REC-003 Pipeline states. Application status SHALL support submitted, eligible, ineligible, scheduled, attended,
shortlisted, selected, waitlisted, rejected and withdrawn.




                                                   CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 6
<PARSED TEXT FOR PAGE: 7 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

REC-004 Audition scheduling. Support panel assignments, venues, capacity, candidate preferences and
rescheduling.

REC-005 Candidate entry. Allow candidate QR check-in tied to audition schedule and time window.

REC-006 Assessment rubrics. Weighted criteria, comments, multiple judges and score aggregation SHALL be
configurable.

REC-007 Conflict of interest. Judges SHALL declare conflicts; conflicting assessors SHALL be excluded/restricted per
policy.

REC-008 Blind evaluation. Recruitment managers MAY enable masked candidate identities for judges.

REC-009 Multiround. Create screening, auditions, interviews, callbacks and finals with transition rules.

REC-010 Committee decision. Selected/rejected status SHALL require authorized finalization; AI suggestions cannot
finalize.

REC-011 Results publication. Bulk and individual publication SHALL allow preview, approval and delay schedule.

REC-012 Waitlist workflow. Offer/accept/decline, deadline and next-candidate promotion SHALL be supported.

REC-013 Onboarding. Accepted candidates SHALL be converted to approved memberships with designated
teams/positions and ID card eligibility.

REC-014 Review and appeal. Support configured review requests, immutable prior decisions and adjudication logs.

REC-015 Candidate privacy. Judge notes and private scores SHALL be invisible to applicants and unrelated
members.

REC-016 Recruitment analytics. Stage conversion, show-up rate, panel scoring and cohort reporting SHALL be
available.


8. Digital ID card studio
IDC-001 Design templates. Each organization SHALL use custom named templates with logo, colors, backgrounds,
layout, fonts and front/back design.

IDC-002 Brand assets. Upload society/institution logos and member photographs with validation and privacy
controls.

IDC-003 Variable merge. Support member name, ID, team, role, academic year, expiry, institution and verified QR
placeholders.

IDC-004 Template governance. Authorized heads create/edit templates; optional faculty approval controls
publishing.

IDC-005 Live preview. Display phone and desktop preview plus print/PDF output preview.

IDC-006 Card lifecycle. Issue, reissue, expire, revoke and replace cards without rewriting membership history.

IDC-007 Multiple cards. User SHALL view multiple society cards in one student wallet.

IDC-008 Verification. QR SHALL resolve opaque signed/reference token to minimal authorized verification screen;
no raw private data encoded.

IDC-009 Scanner membership check. Member QR SHALL resolve verified account/membership for permitted
meeting and coordinator attendance.

IDC-010 Counterfeit resistance. Revoked, expired or invalid cards SHALL not be accepted; repeated scans are
idempotent.



                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 7
<PARSED TEXT FOR PAGE: 8 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

IDC-011 Bulk export. Authorized staff MAY generate approved card batches with download limitations and
expiring URLs.

IDC-012 Custom collections. Provide curated template presets including minimal, premium, dark, colorful and
organization branded.


9. Event hierarchy and lifecycle
EVT-001 Event tree. An event MAY have a parent, sub-event and many descendants with cycle-prevention and
tenant consistency.

EVT-002 Event organizer. Event SHALL support lead organization and approved co-organizers with roles.

EVT-003 Event types. Support seminar, hackathon, cultural, sports, annual function, exhibition, competition,
workshop and custom types.

EVT-004 Creation wizard. Capture objectives, audience, venue, timezone, organizer, schedule, capacity, budget,
communication and approvals.

EVT-005 Approval chain. Support proposed → reviewed → approved/rejected with designated institutional/faculty
authorities.

EVT-006 Publication. Publishing SHALL validate required fields, permissions, quotas, links and registration form
availability.

EVT-007 Lifecycle. Draft, pending approval, approved, published, live, completed, closed, cancelled and archived
states SHALL be enforced.

EVT-008 Nested visibility. Authorized parent leaders SHALL view rollup reporting; child managers see only
designated events.

EVT-009 Scheduling. Prevent or flag venue/resource overlap and invalid start/end chronology.

EVT-010 Multiday. Support several days, sessions, tracks, staggered gates and multiple locations.

EVT-011 Event cloning. Clone templates without copying personal registration/attendance data.

EVT-012 Cross-event registration. Parent festival passes and child-entry policies SHALL be configurable.

EVT-013 Cancellation. Cancel/reschedule SHALL trigger approved notification workflow and preservation of
historical records.

EVT-014 Event closure. Require completed attendance, results/financial reconciliation as configured and final
reports.

EVT-015 Attachments. Store event proposal, poster, agendas, required approvals and archived outcomes.

EVT-016 Analytics. Provide organizers rollup statistics across tree while enforcing data-scope rules.


10. Forms, registration and team entries
REG-001 Dynamic forms. Event managers SHALL build conditional form fields, validations, consent and file
uploads.

REG-002 Form versions. Published revisions SHALL be versioned; historical submissions retain original structure.

REG-003 Public and restricted. Configure open, invite-only, institution-only, paid (future) and eligibility-gated
registrations.

REG-004 Capacity. Use transactional seat claiming, waitlist and capacity enforcement under simultaneous requests.

REG-005 Individual/team. Support solo and team entries with captain, teammate invitations and team-size limits.
                                                   CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 8
<PARSED TEXT FOR PAGE: 9 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

REG-006 Duplicate policy. Deduplicate by configured verified identifiers within eligible scope without exposing
other submissions.

REG-007 Application workflow. Submission, review, approved, rejected, waitlisted, cancelled and checked-in states
SHALL be distinct.

REG-008 Confirmation. Issue unique confirmation and QR pass upon the policy-defined approval event.

REG-009 Registrant self-service. Attendees SHALL check status, update allowed fields and download pass.

REG-010 External students. Public events MAY register external attendees using verified contact method.

REG-011 Exports. Authorized exports SHALL include purpose, audit and sensitive-column safeguards.

REG-012 Refund/cancellation. If paid event module enabled, align event cancellation with gateway/refund records.

REG-013 Registration analytics. Support sources, capacity remaining, conversion and attendance funnel metrics.

REG-014 Bulk operations. Approve/reject/import/update workflows SHALL support preview, error reporting and
audit.


11. QR attendance and check-in engine
QRA-001 Shared scanner. Authorized mobile scanner SHALL switch scanning context: event participant,
coordinator shift, society meeting or audition.

QRA-002 Verification. Scanner SHALL validate signed/opaque QR reference against server-side record, tenant,
scope, status and attendance window.

QRA-003 Registration QR. Event participation SHALL use event registration/pass QR when configured.

QRA-004 Membership QR. Society member ID card QR SHALL be reusable for permitted meeting and
coordinator/volunteer attendance contexts.

QRA-005 Scanner authorization. Scanner SHALL have delegated permission for the exact attendance session and
allowed location/station.

QRA-006 Idempotency. Repeated scans SHALL return already checked-in state rather than create duplicate
attendance.

QRA-007 Concurrency. Parallel scans SHALL commit a single canonical record using database
uniqueness/transactions.

QRA-008 Late/early. Arrival outside configured window SHALL be flagged or blocked according to policy; reason
retained.

QRA-009 Check-out. Where required, record check-in/out pairs and cumulative duration; prevent negative
durations.

QRA-010 Status. Present, late, absent, excused, manual adjustment and invalid scan SHALL be separately modeled.

QRA-011 Offline mode. Optional offline queue SHALL be scoped, encrypted, expire quickly and reconcile conflicts
on sync; must not assert final attendance before sync.

QRA-012 Audit. Capture actor, device/session, timestamp, method, location if explicitly configured, change reason
and history.

QRA-013 Manual fallback. Authorized supervisors SHALL mark attendance with mandatory reason and optional
secondary approval.

QRA-014 Fraud controls. Rate limit scanning; revoke lost cards; detect anomalies and prevent replay of invalid
tokens.

                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 9
<PARSED TEXT FOR PAGE: 10 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

QRA-015 Scanner UI. Camera permission, torch, clear success/failure result and fast retry SHALL work on mobile.

QRA-016 Attendance export. Authorized roster/export SHALL report counts, time stamps, statuses and corrections.

QRA-017 Session definition. Every attendance record SHALL link to a specific event/session, meeting occurrence,
shift or audition session; no global undifferentiated attendance flag.


12. Society meetings and QR meeting attendance
This is a dedicated operational module. An approved society member ID card is scanned at an explicitly selected
meeting occurrence. One member can attend many meetings without creating additional ID cards. Meeting records
SHALL remain separate from event registrations and from coordinator event-day shifts.

MTG-001 Meeting creation. Authorized society heads, faculty advisors and delegated secretaries SHALL create
internal meetings with title, organizer, purpose, location/online link, date, start/end and visibility.

MTG-002 Meeting type. Support general body, core committee, departmental, faculty, planning, emergency,
orientation and custom meeting categories.

MTG-003 Agenda. Organizer SHALL draft agenda, attach documents, identify topics, speakers and estimated
duration.

MTG-004 Invitees. Select whole society, team, position, explicit members, invited faculty or approved external
guests.

MTG-005 Recurring schedule. Create daily/weekly/monthly recurrence with per-occurrence exceptions,
reschedules and cancellation.

MTG-006 RSVP. Invitees MAY accept, decline or tentative; show response summaries to authorized organizers.

MTG-007 Check-in policy. Organizer SHALL define QR scan start/end, late threshold, check-out necessity and
eligibility.

MTG-008 Shared ID scanner. Assigned scanner opens meeting → starts camera → scans society ID card QR →
backend confirms member eligibility → marks meeting attendance.

MTG-009 Session identity. Meeting occurrence ID SHALL always be sent/verified; scanner never guesses which
meeting to mark.

MTG-010 Multiple memberships. If the ID corresponds to a user in several societies, backend SHALL validate the
meeting organizer/society context and active membership.

MTG-011 Roster controls. Only invited members or configured open-meeting members MAY be checked in;
unauthorized QR scans return privacy-safe rejection.

MTG-012 Duplication. Second scan of same person/occurrence returns already marked status with original
timestamp.

MTG-013 Late and absent. Late arrivals flagged from configured threshold; absent calculated only after attendance
window closes and roster freezes.

MTG-014 Check-out. Optional end-time scanning and attendance duration for mandatory-hours meetings SHALL be
supported.

MTG-015 Faculty control. Faculty advisors SHALL have configurable oversight, minutes approval and correction
authority.

MTG-016 Minutes of meeting. Secretaries SHALL record agenda outcomes, decisions, motions, action owners, due
dates and attachments.



                                                   CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 10
<PARSED TEXT FOR PAGE: 11 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

MTG-017 Minutes approval. Configurable faculty/head review and approved/published/archived status SHALL
preserve revision history.

MTG-018 Action items. Approved meeting actions MAY become assignable society tasks with due dates and follow-
up links.

MTG-019 Reschedule/cancel. Meeting changes SHALL notify invitees, preserve history and update per-occurrence
attendance eligibility.

MTG-020 Manual correction. Authorized changes SHALL require actor, reason, old/new status, timestamp and
optional approval.

MTG-021 Attendance reports. Per meeting, recurring series, individual member, team, role and academic year
reporting SHALL be available.

MTG-022 Attendance threshold. Optional society policy MAY identify members below configurable attendance
percentage, without automatic punitive action.

MTG-023 Privacy. Only authorized society roles see private meeting content and member-specific attendance.

MTG-024 Scanner fallback. If card lost/invalid, supervisor MAY verify identity and enter reasoned attendance with
audit; revoked credential cannot be used.

MTG-025 Notifications. Reminders, agenda publication, meeting conclusion and missing action-item notices SHALL
be template-driven.

MTG-026 Archive. Meetings, minutes and signed attendance SHALL remain searchable according to tenant
retention policy.


13. Event staff and coordinator attendance
STA-001 Staff roles. An event SHALL support volunteers, staff, faculty coordinators, leads, registration desk,
security and other configurable roles.

STA-002 Assignments. Staff SHALL be assigned event, sub-event, station, shift, permission set and role.

STA-003 Shift roster. Support start/end, breaks, swaps, replacement approvals, supervisor and attendance rules.

STA-004 Member ID QR check-in. At event-day staff check-in, supervisor scans member digital ID QR to register
attendance for a specific assigned shift/event.

STA-005 External staff fallback. Authorized external volunteers MAY receive separate expiring staff badges when
no society ID exists.

STA-006 Participation separation. Staff attendance SHALL not automatically count as participant attendance or
certificate eligibility unless configured.

STA-007 Check-out and hours. Shift check-out and volunteer hours SHALL follow configured verification/approval
policy.

STA-008 Multiple shifts. Same person may check into several distinct shifts, each uniquely recorded and
deduplicated.

STA-009 Onsite validation. Scan SHALL fail when member has no eligible shift/role in scope or when card expired.

STA-010 Lead review. Supervisors SHALL view no-shows, late staff, replacement needs and corrections.

STA-011 Coordinator certificates. Certificate rules SHALL use verified staff role/hours and approval rather than
participant check-in alone.

STA-012 Export. Provide coordinator attendance and hours report by event, subevent, day, team and supervisor.


                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 11
<PARSED TEXT FOR PAGE: 12 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

14. Competitions, scoring and results
CMP-001 Competition model. Supports tracks, heats, round progression, categories and individual/team
participants.

CMP-002 Judge assignments. Configure judges with limited entries, rubric access and conflicts.

CMP-003 Scoring. Weighted criteria, qualitative feedback, drafts, submitted/locked scores and appeal corrections
SHALL be versioned.

CMP-004 Leaderboard. Show authorized ranking; support ties, disqualifications and publication states.

CMP-005 Sports bracket. Support match schedule, fixtures, results and configurable progression rules.

CMP-006 Results approval. Only designated authority SHALL finalize and publish winners.

CMP-007 Certificate outcomes. Winner/runner-up certificate eligibility SHALL consume approved published
results.

CMP-008 Integrity. Scoring changes SHALL retain history and prevent unauthorized post-lock edits.

CMP-009 Export. Authorized organizers SHALL export anonymized or full score sheets by permission.


15. CertiFrenzy credentials
CER-001 Unified engine. Existing CertiFrenzy templates, rendering and verification SHALL be migrated through
tested domain APIs.

CER-002 Template studio. Create branded certificate designs, variables, images, signature placements and
versioned templates.

CER-003 Eligibility. Rules support attendance, participation, roles, verified hours, results, feedback and manual
award approval.

CER-004 Recipient classes. Support participant, winner, judge, volunteer, coordinator, faculty and organizer
certificates.

CER-005 Batch preview. Before issuing, show recipient list, template/version, data preview and invalid/missing
recipients.

CER-006 Immutable issue. Issued credential SHALL retain identity, event, award type, template version, issue time
and verification ID.

CER-007 Public verification. Verification page exposes approved public information only and supports
revoked/expired flags.

CER-008 Revocation. Authorized staff SHALL revoke and optionally reissue credentials with full audit.

CER-009 Bulk processing. Asynchronous generation SHALL implement deduplication, retries, resumability and
failure dashboard.

CER-010 Delivery. Email notifications SHALL be tracked as queued, sent, delivered where provider supports, failed
and bounced.

CER-011 Coordinator requirements. Staff certificate rules may require shift check-in, hours confirmation and
supervisor approval.

CER-012 Student wallet. Students SHALL retrieve their issued certificates across events and societies.

CER-013 Exports. Authorized managers SHALL export credential records while respecting tenant and personal data
policies.


                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 12
<PARSED TEXT FOR PAGE: 13 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

CER-014 Template import. Existing CertiFrenzy design assets and records SHOULD migrate without breaking old
verification URLs where feasible.


16. Communication, notifications and campaigns
COM-001 Channels. Support in-app and email by default; optional verified SMS/WhatsApp via authorized
integrations.

COM-002 Templates. Institution/society-approved event, meeting, recruitment, member and certificate templates
with variables.

COM-003 Audience builder. Select tenant/society/event/role/status and preview exact authorized recipients.

COM-004 Consent. Honor communication purpose, opt-outs where applicable, suppression lists and required
service messages.

COM-005 Bulk confirmation. Mass sends initiated by AI SHALL require explicit confirmation with recipient
preview.

COM-006 Queue. Use reliable asynchronous sending, throttling, provider failure retries, webhook validation and
idempotency.

COM-007 History. Keep send batch, recipient result, template version, requesting actor and status.

COM-008 Meeting notifications. Meeting invitation, RSVP, reminders, changed venue, agenda and approved
minutes SHALL be available.

COM-009 Deliverability. Provide unsubscribe for applicable categories, verified sender domains and bounce
reporting.

COM-010 Approval. Tenant admins MAY require message approval before public or large-audience campaign.


17. Society operational management
OPS-001 Tasks. Create tasks, assignments, priority, due date, comments, files and completion verification.

OPS-002 Projects. Group tasks into society campaigns, initiatives and annual workstreams.

OPS-003 Meeting linkage. Meeting action items SHALL link to tasks and responsible persons.

OPS-004 Document library. Manage charters, policies, event records, assets and meeting files with scoped sharing.

OPS-005 Leadership handover. Store outgoing/incoming officers, checklist, asset transfer, pending work and
historical approval.

OPS-006 Announcements. Create scoped notices and pin updates for teams or whole society.

OPS-007 Budget requests. Authorized treasurers SHALL create spend requests and track status against approved
allocations.

OPS-008 Asset register. Track shared gear/equipment checkout, responsible custodian and return condition.

OPS-009 Membership contributions. Optional verified contribution hours, completed assignments and event
responsibility history.

OPS-010 Society analytics. Measure recruitment conversion, active member rate, meeting participation and event
activity.

OPS-011 Templates. Reusable society templates for meetings, recruitment, tasks and handover SHALL be
supported.



                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 13
<PARSED TEXT FOR PAGE: 14 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

18. Student, faculty and public portals
UIX-001 Workspace switcher. Single-account users SHALL switch institution/society/department/event contexts
while respecting policies.

UIX-002 Student dashboard. Show own memberships, ID cards, event registrations, recruitment progress, verified
hours and certificates.

UIX-003 Society head dashboard. Show members, recruitment, meetings, staffing, events, finance and delegated
access modules.

UIX-004 Faculty/HOD dashboard. Provide approvals and oversight for authorized organizations and events.

UIX-005 Platform global console. Separate platform-wide commercial console from institution workspace.

UIX-006 College owner console. Own college provisioning, admin assignment, settings, plan consumption and
institutions reports.

UIX-007 Public event portal. Provide approved public event listing, event registration and certificate verification.

UIX-008 Accessible navigation. Keyboard support, WCAG-oriented contrast, readable labels and reduced-motion
support.

UIX-009 Mobile PWA. Responsive dashboards, QR scanner camera UX, student passes, push capable where
supported, offline status messaging.

UIX-010 Search. Search resources only after scoped authorization; enforce pagination and privacy.

UIX-011 Activity log. Users SHALL review important account actions, notifications and their own status changes.


19. AI command center and n8n
AIX-001 Per-portal AI. Dedicated context-aware AI chat shall appear in each applicable authorized workspace.

AIX-002 Read and explain. AI SHALL answer using only access-checked data and cite the source record in UI when
practical.

AIX-003 UI actions. AI may return typed intents to open pages, drawers, popups, apply filters and show previews.

AIX-004 Typed tools. AI actions SHALL use whitelisted server tools with JSON-schema validation; no arbitrary SQL
or direct browser control.

AIX-005 Write confirmation. EVERY AI-INITIATED WRITE, including create, edit, send, delete, grant, approve and
generate, SHALL show a specific preview and request explicit user confirmation.

AIX-006 Reauthorization. After confirmation backend SHALL re-check resource version, privileges, tenant, policy
and action parameters.

AIX-007 Bulk impact. Display affected recipients/records, estimated cost, non-reversible impact and approval chain.

AIX-008 Context isolation. Prompts, retrieval and tool inputs SHALL be tenant/workspace scoped and defend
against injected instructions.

AIX-009 Multi-step plans. AI SHALL decompose tasks and display step progress, pending approvals, completion and
failures.

AIX-010 Actions history. Every planned, confirmed, executed, denied, cancelled and retried action SHALL be
traceable.

AIX-011 n8n orchestration. n8n SHALL handle durable asynchronous processes through authenticated integration
contracts.


                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 14
<PARSED TEXT FOR PAGE: 15 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

AIX-012 Service identity. Workflow service principals SHALL have minimal tenant-specific rights and isolated
secrets.

AIX-013 Retries. Workflows SHALL have idempotency keys, bounded retries, exponential backoff and dead-letter
handling.

AIX-014 Cost guardrails. AI usage budgets, model selection, quotas and token/operation metering SHALL enforce
plan entitlements.

AIX-015 Automation templates. Offer audited recipes for meeting reminders, attendance reports, certificates,
recruitment and annual reports.

AIX-016 No silent selection. AI SHALL NOT autonomously finalize audition decisions, payments, certificate issuance
or privilege grants.

AIX-017 User cancellation. Users SHALL be able to cancel a pending plan or uncommitted action and see partial
execution status.

AIX-018 AI fallback. When provider unavailable or confidence inadequate, use deterministic UI/workflow fallback
without fabricating completion.


20. Analytics and reporting
RPT-001 Role analytics. Dashboards SHALL show only data within effective permissions.

RPT-002 Events. Registration-to-check-in funnel, live occupancy/capacity and cross-child event rollup.

RPT-003 Meetings. Meeting occurrence attendance, recurring series percentage, minutes and action completion.

RPT-004 Staff. Coordinator/volunteer attendance, hours, no-shows and shift gaps.

RPT-005 Recruitment. Applications by stage, audition turnout, scoring distributions and selection outcomes.

RPT-006 Credentials. Certificate issued, verified, revoked, resend and failed generation metrics.

RPT-007 Institution. Cross-society and departmental summaries, approved annual activity report.

RPT-008 SaaS analytics. Platform console SHALL show tenant activity, plan conversion, MRR where meaningful,
renewals and usage.

RPT-009 Exports. CSV/PDF exports SHALL be permission-gated, identifiable and rate-limited.

RPT-010 Privacy. Aggregate dashboards SHALL avoid disclosing small-cohort private information in untrusted
scopes.

RPT-011 Data filters. Date, academic year, society, event, role, status and export columns SHALL be configurable.


21. Resource, budget and finance operations
FIN-001 Venue. Maintain rooms, halls, labs and sports facilities with ownership and booking policy.

FIN-002 Conflict validation. Flag overlapping resource reservations and require approval for overrides.

FIN-003 Equipment. Manage reservation, check-out, condition and return tracking for organization assets.

FIN-004 Budget. Define event and society cost categories, approvals, actual spend and comparison report.

FIN-005 Expense evidence. Receipts, reimbursement requests, attachments and status transitions SHALL be
supported.

FIN-006 Finance approvals. Approval limits SHALL be policy-based, scoped and immutable in audit history.



                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 15
<PARSED TEXT FOR PAGE: 16 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

FIN-007 Commercial separation. Institution spend records SHALL never be confused with platform subscription
billing.

FIN-008 Paid registrations. Optional payment gateway adapter SHALL support authorization, settlement, refund
and reconciliation.

FIN-009 Resource reports. Availability, occupancy, spend, budget variance and outstanding reimbursements.

FIN-010 Compliance. Financial export/retention SHALL follow tenant contracts and jurisdiction policy.


22. Data architecture and integration contracts
The physical schema will be delivered as an ERD and migrations separately; this SRS specifies essential entities,
invariants and external boundaries.

 Domain                                                     Indicative entities

                                                            tenants, plans, plan_versions, contracts, subscriptions,
 SaaS
                                                            entitlements, metering, invoices
                                                            users, identities, sessions, memberships,
 Identity
                                                            role_assignments, scopes, permissions, audit_log
                                                            departments, societies, committees, teams, positions,
 Organizations
                                                            academic_years, member_cards
                                                            events, event_organizers, event_sessions, forms,
 Events
                                                            submissions, registrations, attendance_sessions
                                                            meetings, meeting_occurrences, agenda_items,
 Meeting                                                    invitations, rsvps, minutes, decisions,
                                                            attendance_records
                                                            event_staff_assignments, shifts, shift_attendance,
 Staff
                                                            verified_hours
                                                            recruitment_drives, candidates, rounds, panels,
 Recruitment
                                                            assessments, decisions
                                                            templates, issues, verification_tokens, revocations,
 Certificates
                                                            delivery_jobs
                                                            ai_runs, action_previews, approvals, workflow_runs,
 AI/Operations
                                                            tasks, communication_jobs

DATA-001 Tenant key. All tenant-specific records SHALL carry tenant identity or enforce equivalent tenant-safe
relationship with database policies.

DATA-002 Foreign keys. No child object SHALL reference an entity from another tenant except explicitly audited
platform-level entities.

DATA-003 Membership identity. Membership card QR SHALL reference opaque credential lookup, not embed raw
personal details.

DATA-004 Attendance key. Meeting attendance unique(occurrence,person,attendance_type); staff attendance
unique(shift,person); event registration attendance unique(session,registration) subject to approved modeling.

DATA-005 Historic snapshots. Published forms, issued certificates, approved results and contract terms SHALL
preserve version snapshots.

DATA-006 Soft archive. Critical historical records SHALL use archive/tombstone semantics rather than destructive
delete.



                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 16
<PARSED TEXT FOR PAGE: 17 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

DATA-007 Data migration. Legacy QRBlaze and CertiFrenzy data migration SHALL support dry-run mapping, stable
IDs, duplicate matching and rollback.

DATA-008 Storage. Private files SHALL use signed access and object-level tenant/role authorization.

DATA-009 APIs. External integrations SHALL expose versioned, authenticated, rate-limited documented endpoints.

DATA-010 Webhook integrity. Webhooks SHALL use signatures, timestamps, replay window and idempotency.

DATA-011 Operational events. Domain events SHALL capture entity ID, tenant, correlation ID, actor, version,
timestamp and type.

DATA-012 Search indexing. Search results SHALL obey tenant and resource-level filtering independently of UI.

DATA-013 Data retention. Policies for student records, attendance, signatures, messages and AI chats SHALL be
configurable according to legal/contractual requirements.


23. Non-functional and security requirements
NFR-001 Availability. Published availability SLOs SHALL be defined per paid plan before commercial launch;
maintenance and incident communications SHALL be supported.

NFR-002 Responsiveness. UI SHALL remain usable at phone widths and on desktops; target test device/browser
matrix set before release.

NFR-003 Peak traffic. Event-registration/check-in capacity SHALL be load-tested to expected peak concurrent user
and scanner numbers.

NFR-004 Atomic check-in. Database transactions/unique constraints SHALL prevent duplicate attendance under
concurrent requests.

NFR-005 Latency. Normal check-in success SHALL respond within an agreed percentile target measured during
realistic load testing.

NFR-006 Data in transit. Enforce modern TLS for all public and internal HTTPS endpoints.

NFR-007 Data at rest. Private database, object storage, backups and secrets SHALL use provider-supported
encryption.

NFR-008 Security headers. Protect with CSP, HSTS where applicable, CSRF protection, secure cookie/session design
and content sanitization.

NFR-009 Input validation. Server-side validate all input and uploaded files; scanning does not trust QR contents.

NFR-010 Tenant isolation tests. Automated negative tests for every critical read/write/export, storage URL and
realtime subscription.

NFR-011 Audit integrity. Security and privileged activity logs SHALL be tamper-evident within defined retention
limits.

NFR-012 Least privilege. DB service keys and integration secrets SHALL never appear in browser code or client
error messages.

NFR-013 Backups. Automated backup with periodically verified restore SHALL be required before production.

NFR-014 Recovery. RPO and RTO SHALL be contracted and tested; incident runbooks SHALL exist.

NFR-015 Observability. Trace IDs, metrics, structured logs, error alerts and queue dashboards SHALL be available.

NFR-016 Accessibility. Target WCAG 2.2 AA where practical; accessibility acceptance criteria SHALL cover critical
journeys.



                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 17
<PARSED TEXT FOR PAGE: 18 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

NFR-017 Privacy. Collect minimum required personal information; permit consent/rights handling and tenant-
specific retention.

NFR-018 Secure AI. Defend prompt injection, tool escalation, exfiltration and cross-tenant retrieval; retain human
approvals.

NFR-019 Offline scanning. Offline records SHALL clearly show pending status and resolve conflicts
deterministically on sync.

NFR-020 Localization. Timezone-accurate storage/presentation; institution locale, 12/24-hour time and configurable
date formats.

NFR-021 Performance. Pagination, caching with permission invalidation, queues and bounded exports SHALL
support scale.

NFR-022 SaaS metering reliability. Usage shall be consistent, deduplicated and attributable to plan period; billing
adjustments audited.

NFR-023 Audit of communications. Approval, send, delivery and unsubscribe records SHALL be retained as policy
requires.

NFR-024 Maintainability. Modular domain boundaries, typed APIs, migration tests and automated CI checks SHALL
be maintained.

NFR-025 Change control. Schema migration/backward compatibility and rolling deployment shall be planned for
active events.

NFR-026 Disaster resilience. Loss of n8n/AI SHALL not prevent manual registration, attendance or essential event
operations.

NFR-027 Legal obligations. Contract/privacy/regulatory compliance SHALL be evaluated per deployment
jurisdiction and institution.


24. State machines and business rules
 Object                                                     Allowed state progression / critical rules

                                                            lead → trial → active → grace/read-only →
 Tenant                                                     suspended/cancelled; restoration with historical
                                                            entitlements
                                                            applied/invited → approved → active →
 Membership
                                                            paused/expired/alumni/revoked
                                                            draft → open → screening → audition rounds →
 Recruitment
                                                            decision approval → published → closed
                                                            draft → scheduled → live → concluded → minutes
 Meeting                                                    pending → minutes approved → archived; cancellation
                                                            from scheduled
                                                            draft → submitted → approved → published → live →
 Event                                                      completed → closed → archived; cancellation at
                                                            authorized stages
                                                            started → submitted → under review/waitlisted →
 Registration                                               approved → checked in → completed;
                                                            cancellation/rejection
                                                            draft eligibility → approved issue → rendered →
 Certificate
                                                            delivered/failed → revoked/reissued


                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 18
<PARSED TEXT FOR PAGE: 19 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

 Object                                                      Allowed state progression / critical rules
                                                             plan → preview → explicit confirmation →
 AI write                                                    authorization re-check → execute →
                                                             committed/failed/reconciled
                                                             draft → review → signed → effective →
 Contract
                                                             renewed/amended → expired/terminated

Business invariants: user may be active in multiple societies; revoking a card prevents new scans, not deletion of
prior attendance; user must not mark own attendance unless policy explicitly permits; meeting attendance cannot
be substituted for coordinator shift attendance; confirmed AI actions execute only exactly approved parameters;
public verification exposes minimum data.


25. Representative end-to-end scenarios
UC-01 — Founder provisions paid college
Platform Super Admin creates tenant, assigns owner, plan/contract, quotas and commercial activation; tenant
owner completes branding and authorized admins.


UC-02 — College annual fest
College admin creates parent festival; departments/societies each create child events; scope-based managers
configure registration and staffing; parent admin views rollups.


UC-03 — Society meeting with ID QR
Society secretary creates recurring meeting and invites members; meeting scanner is granted permission;
volunteer scans each member ID QR; backend records per-occurrence attendance; secretary submits minutes.


UC-04 — Event coordinator attendance
Event lead assigns volunteers to shifts; authorized check-in operator scans their society ID card at the staff desk;
verifies shift, stores timestamp, optional checkout; supervisor approves hours.


UC-05 — Society auditions
Head opens recruitment, candidates apply and get audition slots, panel scores in private, committee approves
selection, candidates notified, memberships and ID cards provisioned.


UC-06 — AI creates event
Society Head asks AI to create registration-enabled hackathon; AI proposes event/form, opens edit preview; head
explicitly confirms write; backend reauthorizes and creates draft.


UC-07 — AI bulk messaging
Coordinator requests reminder to 50 attendees; AI retrieves scoped list, previews recipients/message, asks
confirmation, sends through queue, reports failed destinations.


UC-08 — CertiFrenzy issue
After completed event and approved results/attendance, manager previews eligible recipients and template,
confirms batch, asynchronous generation and verification links completed.

                                                  CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 19
<PARSED TEXT FOR PAGE: 20 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

UC-09 — Multi-organization member
A student serves as tech-society secretary and cultural-event coordinator; one account shows two workspaces with
distinct powers and ID cards.


UC-10 — College subscription expires
Plan reaches grace policy; users alerted; write restrictions enforced according to contract; safe export remains
accessible where required; no silent deletion.


26. Acceptance test catalogue
 Test ID                                Area                                   Pass condition

                                                                               College A user cannot read/update
                                                                               College B society, meeting,
 AT-001                                 Tenant isolation
                                                                               certificate or billing through API,
                                                                               storage or AI.
                                                                               Founder creates tenant and assigns
 AT-002                                 Super Admin                            distinct College Owner; institution
                                                                               owner cannot edit global plans.
                                                                               Society head grants check-in for
                                                                               specific subevent only; grantee
 AT-003                                 Scope delegation                       cannot access other event
                                                                               registration exports or grant higher
                                                                               rights.
                                                                               Active invited member scans valid
                                                                               society ID at authorized meeting
 AT-004                                 Meeting QR success
                                                                               and receives one present/late
                                                                               record.
                                                                               Same member scanned twice or
                                                                               concurrently for same occurrence
 AT-005                                 Meeting duplicate
                                                                               yields one canonical attendance
                                                                               entry.
                                                                               Expired, revoked, cross-society or
 AT-006                                 Meeting invalid ID                     non-invited member credential is
                                                                               denied with privacy-safe reason.
                                                                               Secretary drafts minutes and
                                                                               actions; faculty approval publishes
 AT-007                                 Meeting minutes
                                                                               controlled version and preserves
                                                                               edits.
                                                                               Assigned volunteer scan credits
 AT-008                                 Coordinator QR                         correct staff shift, not participant
                                                                               check-in, with proper event/session.
                                                                               Volunteer attends two shifts; two
 AT-009                                 Shift separation                       distinct records, one per shift; each
                                                                               deduplicates.
                                                                               Parent admin sees child event totals
 AT-010                                 Nested events                          while child operator has no
                                                                               unrelated child-event view.



                                                 CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 20
<PARSED TEXT FOR PAGE: 21 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

Test ID                      Area                                Pass condition
                                                                 Judges submit rubric; only selection
AT-011                       Recruitment                         authority can approve and publish
                                                                 final status.
                                                                 Society logo and approved template
AT-012                       Member cards                        produce correct card; revocation
                                                                 invalidates verification scan.
                                                                 Coordinator certificate issued only
AT-013                       Credentials                         after verified shift-hours policy and
                                                                 approval.
                                                                 AI creates event proposal, but no
                                                                 database mutation occurs until
AT-014                       AI writes
                                                                 explicit confirmation; changed
                                                                 permission at execution fails safely.
                                                                 Tenant plan limits enforce
AT-015                       Billing quotas                      events/certificates and usage meter
                                                                 records no duplicate count.
                                                                 Expired tenant follows contract
AT-016                       Subscription end                    grace/read-only export; records
                                                                 retained according to policy.
                                                                 Meeting QR and event shift scanner
                                                                 work on supported mobile
AT-017                       Mobile
                                                                 browsers including denied camera
                                                                 permission handling.
                                                                 Certificate/email batch retries do
AT-018                       Bulk reliability                    not generate duplicate issues or
                                                                 sends.
                                                                 Same student switches
                                                                 memberships without account
AT-019                       Workspaces
                                                                 switching; private data remains
                                                                 role-filtered.
                                                                 Keyboard-only user can create
AT-020                       Accessibility                       event, navigate scanner fallback,
                                                                 review AI approval and read status.


27. Delivery phases and migration strategy
Phase                        Theme                               Exit gate

                                                                 Inventory existing repos, APIs, RLS
P0                           Discovery                           policies, data mapping, threat
                                                                 model and target ERD.
                                                                 New platform console, tenant
                             Super Admin + Organizations +       owner, institution hierarchy, auth,
P1
                             Unified Events                      permissions, event creation and
                                                                 initial basic registration.
                                                                 Full event hierarchy, forms,
P2                           Registration and QR engine
                                                                 attendee QR and scoped scanner.




                                         CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 21
<PARSED TEXT FOR PAGE: 22 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

 Phase                                   Theme                                   Exit gate
                                                                                 Certificate template rendering,
 P3                                      CertiFrenzy integration                 eligibility, batch delivery and public
                                                                                 verification.
                                                                                 Society memberships, teams,
                                                                                 recurring meetings, ID-based
 P4                                      Society operations + meetings
                                                                                 meeting scanner and staff
                                                                                 attendance.
                                                                                 Recruitment pipelines, judging,
 P5                                      Auditions + digital ID designer
                                                                                 selections and card design/studio.
                                                                                 Per-portal AI chat, typed UI actions,
 P6                                      AI + n8n                                all-write confirmation and
                                                                                 automations.
                                                                                 Advanced billing, quotas, finance,
                                                                                 resources, analytics, multi-college
 P7                                      Commercial/platform maturity
                                                                                 hardening and operational
                                                                                 readiness.

Delivery principle: P1 is the first usable release and contains institution provisioning, organizations and unified
events. Dependencies such as membership identity and attendance-specific domain models should be designed
earlier even when UI modules ship later. Commercial data model belongs to foundation; full billing integrations can
mature in P7.

Migration protocol: freeze original source snapshot → characterize current behavior via tests → map existing
Supabase tables and auth → create tenant-safe schema → migrate data in a dry run → verify counts and historic
verification routes → switch modules incrementally → preserve rollback/checkpoints.


28. Assumptions, open decisions and sign-off
 Open decision                                               Suggested default

                                                             Final name TBD; QRBlaze and CertiFrenzy remain
 Umbrella product brand
                                                             internal engine identities.
 Founding college plan                                       Complimentary but explicitly contracted and metered.
                                                             Dedicated page + contextual dock; EVERY write
 AI interaction
                                                             requires explicit confirmation.
                                                             Scan member ID QR; separate meeting occurrence
 Society meeting attendance
                                                             model, optional late/checkout.
                                                             Scan member ID for assigned event shift; separate
 Coordinator attendance
                                                             from attendee registrations.
                                                             Optional future connector, turned off until gateway
 Paid event registration
                                                             and policy are approved.
                                                             Configurable later; online-first first pilot with safe
 Offline QR scanner
                                                             manual fallback.
                                                             Branded configurable templates; high-fidelity
 Card designer
                                                             drag/drop in later release.
                                                             Finalize with commercial/legal advisor before
 Pricing, taxes and legal
                                                             customer invoicing.
 Performance/SLA numbers                                     Set after pilot load testing and contract packaging.


                                                    CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 22
<PARSED TEXT FOR PAGE: 23 / 23>
CAMPUS OPERATING PLATFORM / SOFTWARE REQUIREMENTS SPECIFICATION

 Open decision                                            Suggested default
 Data retention jurisdiction                              Agree per college contract/privacy requirements.
                                                          Optional per-plan feature, passwordless/email
 Institution SSO
                                                          baseline.

Proposed sign-off owners: Product Founder; lead engineering owner; institution pilot sponsor/faculty advisor; data
protection/security reviewer. Approval indicates target scope agreement, not verification of implemented software.

Requirements count: 304 numbered functional/non-functional statements; 20 acceptance cases; 10 reference
workflows; 8 delivery stages.




                                                CONFIDENTIAL — DRAFT FOR REVIEW | 22 OCT 2026 | PAGE 23