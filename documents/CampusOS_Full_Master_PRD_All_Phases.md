# CampusOS Full Master PRD — All Phases

**Source document:** `CampusOS_Full_Master_PRD_All_Phases.docx` · 22 October 2026 · Draft for stakeholder review.

**Important:** This is the complete text-extracted archival copy of the original master DOCX, preserving sections and wording, but not original Word layout, tables, figures or typography. It describes **target requirements**, not implementation status. Do not interpret a requirement as a completed feature.

---

<PARSED TEXT FOR PAGE: 1 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

PRODUCT REQUIREMENTS DOCUMENT


Campus Operating Platform
Commercial multi-institution SaaS | QRBlaze + CertiFrenzy unified | Working umbrella brand: To be finalized

MASTER PRD — COMPLETE TARGET PRODUCT (ALL PLANNED RELEASES)

Document edition: Full-scope master baseline • Date: 22 October 2026 • Status: Draft for stakeholder sign-off

This is a comprehensive destination-state PRD, not an MVP-only or phase-one document. Features are grouped by
planned delivery waves, but all described capabilities belong to the target product.


Document control
    Attribute                                              Value

                                                           Commercial Campus Operating Platform (final brand
    Product
                                                           TBD)
                                                           QRBlaze event registration/check-in; CertiFrenzy
    Founder products
                                                           certificate engine
                                                           One founding institution on complimentary
    Launch model
                                                           contracted entitlement; paid institutions follow
                                                           Institution-isolated SaaS; platform owner maintains
    Tenant model
                                                           global control
                                                           Every write action requires explicit user
    AI policy
                                                           confirmation; read-only actions may execute
                                                           One person, one account, multiple memberships and
    Account model
                                                           scoped workspaces
                                                           Platform Super Admin + Organizations + Unified
    Initial functional delivery
                                                           Events
                                                           All planned phases through multi-college commercial
    Scope baseline
                                                           general availability



Contents
     1. Executive product vision & business strategy
     2. Scope, assumptions and product principles
     3. Personas, governance and access ownership
     4. SaaS tenancy, commercial contracts and billing
     5. Identity, user provisioning and permissions
     6. Institution, department, society & committee administration
     7. Membership, teams, recruitment and auditions
     8. Branded digital identity cards
     9. Events, festivals, nested events and approvals
     10. Registration, QR entry and attendance
     11. Competition, volunteers and operations
     12. CertiFrenzy credential lifecycle
     13. Communications and notifications

                                                                       CONFIDENTIAL • Product planning | Page 1
<PARSED TEXT FOR PAGE: 2 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

   14. Society operational management
   15. Student, faculty and external portals
   16. AI command center and n8n orchestration
   17. Analytics, finance, resources and achievements
   18. Experience, accessibility and mobile
   19. Data ownership, privacy, reliability and security
   20. Integrations and engineering constraints
   21. Full-lifecycle user scenarios
   22. Scope waves, dependencies and exit gates
   23. Release acceptance, metrics and risks
   24. Open decisions and PRD sign-off




                                                            CONFIDENTIAL • Product planning | Page 2
<PARSED TEXT FOR PAGE: 3 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

1. Executive product vision & business strategy
Develop a configurable campus operations SaaS serving colleges as independent tenants. Each institution
manages its internal administration, departments, societies, committees, festivals, individual events, registrations,
staff, auditions, memberships, certifications, and reporting. The platform founder operates a separate global
console for tenant lifecycle, contracts, plans, metering and commercial operations. AI helps each person
accomplish authorized tasks through natural language while preserving human control of all writes.


Outcomes
     Replace disconnected spreadsheets, forms, QR scanners, membership databases and certificate tools with one
      coherent record of campus operations.
     Give societies and departments delegated autonomy without compromising institutional oversight or cross-
      society privacy.
     Support both a simple seminar and a multi-day college festival with nested event schedules, multiple teams
      and parallel gates.
     Enable verifiable student involvement history, branded society identities and durable academic-year
      leadership transitions.
     Commercialize the platform through contracts, institution-specific entitlements and configurable paid plans
      rather than code forks.
     Offer safe AI-driven natural language navigation, data retrieval and confirmed workflows through a
      dedicated assistant in every relevant portal.


2. Scope, assumptions and product principles
     IN SCOPE: all capabilities specified in sections 4–20, including future waves; absence from first launch does
      not mean removed from product scope.
     OUT OF SCOPE (unless explicitly added later): learning management, grades, ERP payroll, unrestricted
      surveillance, social networking feed, native iOS/Android binaries, automatic binding student admission
      records without college authorization.
     Single account model, many roles and memberships; institution, society, event and sub-event scopes coexist.
     Configurable workflows and forms rather than separate one-off implementations per event/society.
     Web/PWA first, with scanner and student mobile journeys receiving highest usability priority.
     Founding college free by explicit plan/contract; other colleges can be trial, paid, negotiated enterprise or
      sponsored.
     Human control: each AI-initiated mutation must display the intended changes and obtain explicit
      confirmation before execution, even for low-risk writes.
     Platform-wide support access to tenant content is controlled, auditable and restricted; platform ownership
      does not require routinely browsing student records.


3. Personas, governance and access ownership
    Persona                               Responsibilities                        Boundaries

                                          Manage all institutions, plan           Global actions auditable; sensitive
    Platform Owner / Super Admin          catalog, contracts, billing, feature    tenant data via authorized support
                                          flags, risk and support                 access
                                          Subscription invoicing, support         Delegated platform permissions
    Platform Operations/Billing Staff
                                          tickets, onboarding                     only


                                                                          CONFIDENTIAL • Product planning | Page 3
<PARSED TEXT FOR PAGE: 4 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                             Accountable institutional
                                                                                      One institution only; no global
    Institution Owner                        administrator; departments,
                                                                                      pricing/tenant modification
                                             societies, staff & policy approvals
                                             College-level event approvals,
                                                                                      Institution policies; grantable
    College Admin / Dean                     organization and compliance
                                                                                      rights scoped
                                             oversight
                                             Department membership,
    HOD / Department Faculty                                                          Assigned department(s) only
                                             departmental events, approvals
                                             Faculty oversight, societies, event
    Society Faculty Advisor / Head                                                    Assigned societies/events only
                                             approval, delegated staff
    Society President, VP, Secretary,        Run society, staff allocation,           Scoped to society and explicitly
    Treasurer                                recruitment, budget and reporting        delegated functions
                                             Specific duties, tasks, shifts, scoped   No automatic visibility into
    Core Team / Member / Volunteer
                                             registration/QR tools                    unrelated records
                                             Discover events, register, view          Self-service records and public
    Student / Participant
                                             passes, feedback and credentials         information
                                             Limited evaluation or specific           Time and resource limited; no
    Judge / Guest / Vendor
                                             operational portal                       general admin access


Role design rules
        Role is a named policy bundle, not a replacement for the underlying permission evaluation.
        Same student may hold multiple distinct active positions across organizations and events.
        Granting rights requires both permission to delegate and possession of the allowed rights within the target
         scope; system denies privilege escalation.
        Temporary assignments include start/end dates, issuer, approval, reason and revocation capability.
        Roles may be customized by authorized institution administrators within platform-approved permission
         boundaries; system roles remain immutable.


4. SaaS tenancy, commercial contracts and billing
The platform owner sells institution-scoped subscriptions while the founding college runs on a complimentary
entitlement. Contracts, subscriptions, usage, entitlements and payment operations are separate commercial
records and must not leak into college-only administration.


Key user journeys
        Platform Owner creates an institution, defines its owner, selects a plan, sets contract dates and activates
         entitlements.
        New college registers interest → platform review → trial/quote → agreement → institution provisioning → paid
         activation.
        Institution Owner views own plan, consumption, renewal notices, add-on requests and billing contacts.
        Founder college is registered with a zero-price founding contract with explicit entitlement limits/exception
         policy.


Full-scope feature requirements

    ID                       Capability               Required product        Primary actors          Tier
                                                      behavior /


                                                                              CONFIDENTIAL • Product planning | Page 4
<PARSED TEXT FOR PAGE: 5 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                        acceptance intent

                                        Create, verify,
                                        activate, archive,
                                        suspend and search
SAS-001          Institution registry                            Platform Admin      P0
                                        tenants with status,
                                        branding, owner
                                        and lifecycle dates.
                                        Secure invitation
                                        for designated
                                        Institution Owner;
                 Initial tenant
SAS-002                                 enforce MFA at           Platform Admin      P0
                 bootstrap
                                        privileged access
                                        and acceptance of
                                        terms.
                                        Versioned plan
                                        names, features,
                                        usage limits, billing
SAS-003          Plan catalog                                    Platform Admin      P1
                                        cadence,
                                        seat/certificate/AI/e
                                        mail entitlements.
                                        Record
                                        counterparty, term,
                                        renewal, signed
SAS-004          Contract records       documents,               Platform Admin      P1
                                        negotiated
                                        variations, contacts
                                        and amendments.
                                        Create a $0/₹0
                                        founding-college
                 Complimentary          entitlement with
SAS-005                                                          Platform Admin      P0
                 founding plan          explicit contract
                                        history, not hard-
                                        coded exemptions.
                                        Track trial, active,
                                        past-due, grace,
                                        suspended,
SAS-006          Subscriptions                                   Platform Admin      P1
                                        cancelled, expired
                                        and reactivated
                                        states.
                                        Idempotently meter
                                        active users, events,
                                        certificates, storage,
SAS-007          Usage metering                                  Platform Admin      P1
                                        emails, AI
                                        tokens/credits and
                                        integrations.
                                        Gate premium
                                        features and
                 Entitlement            soft/hard limits
SAS-008                                                          All                 P1
                 enforcement            consistently in APIs
                                        and UI; preview
                                        upgrade options.
SAS-009          Quotes and invoices    Support quotes,          Billing Staff       P2

                                                                 CONFIDENTIAL • Product planning | Page 5
<PARSED TEXT FOR PAGE: 6 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                 invoices, credits,
                                                 taxes and receipts
                                                 with external
                                                 accounting/paymen
                                                 t integration where
                                                 needed.
                                                 Renewal reminders,
                                                 grace-period
                          Renewal                milestones,
    SAS-010                                                             Platform Admin         P1
                          automation             payment failures
                                                 and manual
                                                 override controls.
                                                 MRR/ARR where
                                                 applicable, paid
                          Commercial             tenants, trial
    SAS-011                                                             Platform Admin         P2
                          analytics              conversions, churn,
                                                 seats and feature
                                                 usage.
                                                 Policy-governed
                                                 export, archive,
                          Tenant                 deletion requests
    SAS-012                                                             Platform Admin         P1
                          export/offboarding     and portable core
                                                 data on
                                                 termination.
                                                 Scheduled
                                                 upgrades/downgrad
                                                 es with proration
    SAS-013               Plan changes                                  Platform Admin         P1
                                                 policy and non-
                                                 destructive effects
                                                 on existing data.
                                                 Support negotiated
                                                 custom pricing,
                                                 add-ons,
                          Reseller/enterprise
    SAS-014                                      procurement            Platform Admin         P3
                          terms
                                                 reference and
                                                 bespoke
                                                 institutional SLAs.


Business rules & edge cases
     No automatic hard deletion of student records solely because a contract expires; user access follows
      grace/read-only/export policy.
     A college owner cannot inspect other tenants or change global prices, contracts or entitlements.
     Payment failure cannot silently revoke needed data export; security and legal retention apply.
     All plan versions and contract changes retain complete historical snapshots.


Acceptance outcomes
     Platform owner can provision multiple isolated tenants with different plan limits.
     Founding institution stays on complimentary entitlements without special-case code.
     Tenant cannot exceed hard quotas; permitted overages generate visible notifications.



                                                                       CONFIDENTIAL • Product planning | Page 6
<PARSED TEXT FOR PAGE: 7 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

5. Identity, provisioning and granular authorization
Centralized identity and authorization powers all portals, all APIs, AI agents and workflow execution. Roles use
explicit tenant, organization and event scopes with effective grant evaluation.


Key user journeys
        Super Admin invites institutional owner; institution owner creates/invites faculty, heads, students and guest
         users.
        Society Head assigns an event-specific check-in and registrations permission to a core member with bounded
         expiry.
        A single user switches between multiple memberships/workspaces without logging in again.


Full-scope feature requirements
                                                    Required product
    ID                       Capability             behavior /              Primary actors        Tier
                                                    acceptance intent

                                                    Email/password or
                                                    supported SSO;
                             Central                verified email,
    IAM-001                                                                 All                   P0
                             authentication         account recovery
                                                    and session
                                                    controls.
                                                    Enforce MFA for
                                                    platform and
                                                    institutional
                             Mandatory
    IAM-002                                         owners;                 Admins                P0
                             privileged MFA
                                                    configurable for
                                                    other privileged
                                                    roles.
                                                    Define CRUD,
                                                    approve, issue,
                             Role/permission        export, delegate
    IAM-003                                                                 Admins                P0
                             registry               and financial rights
                                                    as explicit
                                                    permission keys.
                                                    Attach roles to
                                                    institution,
                                                    department,
    IAM-004                  Scoped grants                                  Admins                P0
                                                    society, parent
                                                    event, child event
                                                    or team.
                                                    Create pending
                                                    invitations,
                                                    expiration, resend,
    IAM-005                  Account invitations                            Admins                P0
                                                    acceptance and
                                                    duplicate-email
                                                    reconciliation.
                                                    Student/faculty/staff
    IAM-006                  Managed profiles       categories,             All                   P0
                                                    affiliation,

                                                                            CONFIDENTIAL • Product planning | Page 7
<PARSED TEXT FOR PAGE: 8 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                    academic-year
                                    status and
                                    approved profile
                                    fields.
                                    Display authorized
                                    organizations and
                 Workspace
IAM-007                             roles; explicit         All                 P0
                 switcher
                                    workspace
                                    selection.
                                    Delegation bounded
                                    by grantor scope,
IAM-008          Grant delegation   delegable rights,       Heads               P0
                                    max duration and
                                    approval policy.
                                    Event-specific
                                    grants with
                 Temporary staff    start/end time, auto-
IAM-009                                                     Heads               P0
                 access             expiration and
                                    immediate
                                    revocation.
                                    Reusable
                                    society/department
                 Org policy         roles and
IAM-010                                                     Owners              P1
                 templates          permission packs,
                                    customizable
                                    within bounds.
                                    Institutional
                                    SAML/OIDC and
                 SSO/provisioning   optionally SCIM or
IAM-011                                                     IT Admin            P2
                 integration        approved bulk sync;
                                    avoid duplicate
                                    identities.
                                    Device sessions,
                                    terminate sessions,
IAM-012          Session security   session timeouts        All                 P1
                                    and suspicious-
                                    login alerting.
                                    Field-level
                                    restrictions for
IAM-013          PII field access   phone, roll number,     Admins              P0
                                    photos, judging
                                    notes and exports.
                                    Authorized admins
                                    can preview
                                    effective
IAM-014          Access simulator                           Admins              P1
                                    permissions for a
                                    role/member/resour
                                    ce.
                                    Record actor, target,
IAM-015          Access audit       scope, before/after     Admins              P0
                                    values, rationale
                                    and user agent for

                                                            CONFIDENTIAL • Product planning | Page 8
<PARSED TEXT FOR PAGE: 9 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                    grants.
                                                    Consent/
                                                    justification, time-
                             Support                bound support
    IAM-016                  impersonation          access, visible         Platform Ops         P2
                             controls               banner and audit;
                                                    never impersonate
                                                    silently.


Business rules & edge cases
        Revocation takes effect before another privileged request, independent of cached UI state.
        Cross-tenant and cross-event access denied on API and DB policy checks, not merely hidden navigation.
        Member may be suspended in one society while retaining other memberships.
        Deleted society leadership cannot retain delegated event permissions without explicit independent grant.


Acceptance outcomes
        Automated tests deny access to unrelated institutions, societies and child events.
        Same person can be society president and another event volunteer with distinct menus.
        All delegated grants can be explained, listed, audited and revoked.


6. Institution and organization management
Model institutions, campuses, faculties, departments, student societies, clubs, committees and temporary
organizing bodies without assuming a single tree ownership structure.


Key user journeys
        Institution Owner configures institution → departments → societies/committees and assigns responsible
         faculty.
        Joint event can be organized by a society and department; each owner receives only permitted access.
        Academic-year rollover replaces office bearers without changing historical certificates or membership
         records.


Full-scope feature requirements
                                                    Required product
    ID                       Capability             behavior /              Primary actors       Tier
                                                    acceptance intent

                                                    Logo, display name,
                                                    address, campuses,
    ORG-001                  Institution profile    timezone, policies,     Institution Owner    P0
                                                    contact details and
                                                    verified domains.
                                                    Create and archive
                                                    departments;
    ORG-002                  Departments                                    Institution Admin    P0
                                                    appoint HODs and
                                                    administrators.
                                                    Create
    ORG-003                  Society directory      societies/clubs and     Institution Admin    P0
                                                    assign faculty
                                                                           CONFIDENTIAL • Product planning | Page 9
<PARSED TEXT FOR PAGE: 10 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                  advisors, heads,
                                                  descriptions and
                                                  branding.
                                                  Permanent or
                                                  temporary
                          Organizing
    ORG-004                                       committees for           Institution Admin   P1
                          committees
                                                  annual functions,
                                                  sports and festivals.
                                                  Society affiliated to
                                                  department/college
                          Multi-organization
    ORG-005                                       and co-sponsor           Institution Admin   P1
                          relationships
                                                  links without
                                                  hierarchy conflicts.
                                                  Configure start/end
                                                  periods,
    ORG-006               Academic sessions       membership years,        Institution Admin   P1
                                                  appointments and
                                                  archived views.
                                                  Create
                                                  organization-
    ORG-007               Positions and teams     specific teams,          Society Head        P1
                                                  titles, hierarchy and
                                                  headcount rules.
                                                  Configure
                                                  faculty/HOD/dean
    ORG-008               Approver chains                                  Institution Admin   P1
                                                  approvals by event
                                                  type and amount.
                                                  Public society page,
                                                  branding, history,
                          Society profile and
    ORG-009                                       achievements,            Society Head        P2
                          microsite
                                                  contact and official
                                                  announcements.
                                                  Preserve old
                                                  leadership,
                          Historical
    ORG-010                                       membership roles,        Institution Admin   P1
                          continuity
                                                  archived events and
                                                  past projects.


Business rules & edge cases
     A department and society may jointly own a project; audit and approval ownership must remain explicit.
     Archive does not delete historical attendance, certificates or financial records.


Acceptance outcomes
     Institution Owner provisions two societies and one department with separate heads.
     Academic-year rollover preserves previous years and expires leadership grants.




                                                                          CONFIDENTIAL • Product planning | Page 10
<PARSED TEXT FOR PAGE: 11 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

7. Memberships, recruitment, auditions and selection
A complete recruitment operating system supports club onboarding, form collection, evaluations, multi-round
auditions, published results and selected-member activation.


Key user journeys
        Society opens recruitment → applicants submit multi-team preferences → eligibility review → audition slots →
         QR attendance → judging → committee decision → results → invited membership → ID card.
        Dance society conducts two audition rounds with distinct judge panels, blind rubric evaluation, waitlist and
         result publication.
        Technical society selects applicants into PR, design, development and content teams with different positions.


Full-scope feature requirements
                                                       Required product
    ID                         Capability              behavior /               Primary actors      Tier
                                                       acceptance intent

                                                       Requested, pending,
                                                       active, paused,
                               Membership
    REC-001                                            alumnus, revoked         Society Head        P1
                               lifecycle
                                                       and expired with
                                                       effective dates.
                                                       Create branded
                                                       drives with
                                                       windows, eligibility,
    REC-002                    Recruitment drives                               Society Head        P2
                                                       teams, application
                                                       caps and custom
                                                       questions.
                                                       Save drafts, submit
                                                       documents, choose
                               Candidate
    REC-003                                            preferences and          Applicants          P2
                               applications
                                                       receive application
                                                       reference.
                                                       Rules for
                                                       year/program/avail
    REC-004                    Eligibility screening   ability; exceptions      Recruitment Staff   P2
                                                       and manual
                                                       reviews.
                                                       Audition/interview
                                                       slots, capacity,
    REC-005                    Slot scheduling         locations, waitlists,    Recruitment Staff   P2
                                                       reschedule and
                                                       cancellation.
                                                       QR or authorized
                                                       manual attendance
    REC-006                    Audition check-in                                Staff               P2
                                                       at assigned rounds
                                                       with audit trail.
                                                       Allocate judges,
    REC-007                    Judge panels            conflict                 Recruitment Lead    P2
                                                       declarations,

                                                                               CONFIDENTIAL • Product planning | Page 11
<PARSED TEXT FOR PAGE: 12 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                 private score sheets
                                                 and calibrated
                                                 rubrics.
                                                 Rounds, callback
                                                 auditions, technical
                          Multi-stage
    REC-008                                      tests, interviews        Judges               P2
                          evaluations
                                                 and weighted score
                                                 policies.
                                                 Shortlist, selected,
                                                 waitlisted, rejected,
                                                                          Selection
    REC-009               Decision workflow      withdrawn;                                    P2
                                                                          Committee
                                                 authorized finalizer
                                                 and lock.
                                                 Anonymized
                                                 evaluation option,
                                                 evidence links,
    REC-010               Fairness & appeals                              Committee            P3
                                                 controlled
                                                 appeal/re-
                                                 evaluation.
                                                 Preview
                                                 groups/templates;
                                                 publish/email only
    REC-011               Bulk result dispatch                            Recruitment Lead     P2
                                                 after approval and
                                                 explicit
                                                 confirmation.
                                                 Invite accepted
                                                 candidates, request
                          Onboarding             consent, set
    REC-012                                                               Society Head         P2
                          automation             membership,
                                                 position, team and
                                                 tasks.
                                                 Application funnel,
                                                 attendance, pass
                          Recruitment
    REC-013                                      rates, judge             Society Head         P2
                          analytics
                                                 disagreement and
                                                 team fill rate.


Business rules & edge cases
     Audition attendance alone never makes a candidate a member.
     AI may summarize scorecards but cannot independently finalize selection or reject candidates.
     All selection publication and emails require explicit confirmed write; records maintain reviewer identity.
     Candidates can hold multiple offers across societies; each offer is independent.


Acceptance outcomes
     Complete a two-round audition with distinct judges and accepted outcomes.
     Selected candidates enter onboarding only after authorized finalized result and acceptance.




                                                                         CONFIDENTIAL • Product planning | Page 12
<PARSED TEXT FOR PAGE: 13 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

8. Branded digital ID card studio
Premium member cards identify role, academic tenure and affiliation and offer secure, privacy-controlled
verification.


Key user journeys
        Society Head selects template, uploads logo and permitted brand assets, maps fields, previews front/back and
         publishes approved template.
        Member receives individualized card; scanning public QR returns minimal authorized membership details.


Full-scope feature requirements
                                                   Required product
    ID                      Capability             behavior /               Primary actors      Tier
                                                   acceptance intent

                                                   Modern, minimal,
                                                   royal, tech, cultural
    IDC-001                 Template catalog                                Heads               P2
                                                   and institutional
                                                   design presets.
                                                   Upload validated
                                                   society/institution
                            Brand                  logo, palette,
    IDC-002                                                                 Heads               P2
                            customization          typography,
                                                   backgrounds and
                                                   footer.
                                                   Drag/resize fields,
                                                   guides, bleed/safe
    IDC-003                 Visual card editor     zones, front/back        Designers           P2
                                                   layout and mobile
                                                   preview.
                                                   Member photo, ID,
                                                   position, team, year,
    IDC-004                 Data binding           validity, signature      Heads               P2
                                                   and barcode/QR
                                                   tokens.
                                                   Generate/reissue/
                                                   export approved
    IDC-005                 Bulk issue                                      Card Managers       P2
                                                   member cards by
                                                   team or session.
                                                   Signed opaque QR
                                                   token, current
                                                   status verification,
    IDC-006                 QR verification                                 Public              P2
                                                   optional expiration
                                                   and privacy
                                                   minimum.
                                                   Institution brand
                                                   policy approvals
    IDC-007                 Template approvals     and immutable            Faculty/Admin       P2
                                                   versions used on
                                                   issued cards.


                                                                           CONFIDENTIAL • Product planning | Page 13
<PARSED TEXT FOR PAGE: 14 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                       Lost/revoked card
                                                       replacement; old
    IDC-008                  Reissue controls                                  Member/Admin        P2
                                                       token invalidated as
                                                       policy requires.
                                                       High-resolution PDF
                                                       with correct size
                             Physical print
    IDC-009                                            and print               Heads               P2
                             exports
                                                       margin/crop
                                                       settings.
                                                       Mobile card view
                             Digital wallet            with accessible text
    IDC-010                                                                    Members             P2
                             experience                and scan-ready
                                                       brightness mode.


Business rules & edge cases
        Card validity stops when membership expires; historic proof can remain under policy.
        Verification endpoint must not expose private student contacts, academic data or addresses.


Acceptance outcomes
        Two societies produce visually distinct approved cards for one student.
        Revoked token no longer verifies as active.


9. Events, festivals, proposals and approvals
Unified event management supports unlimited nested event/group structures, multiple organizing bodies,
configurable approval chains and reusable event templates.


Key user journeys
        Institution Admin creates Annual Fest → cultural/technical/sports groups → contests and rounds; assigns
         different teams at each level.
        Society Head independently creates seminar; faculty approves; registration and staffing inherit only intended
         configuration.


Full-scope feature requirements
                                                       Required product
    ID                       Capability                behavior /              Primary actors      Tier
                                                       acceptance intent

                                                       Parent/child
                                                       hierarchy with safe
                                                       moves, cycle
    EVT-001                  Event tree                prevention,             Organizers          P0
                                                       unlimited
                                                       conceptual nesting
                                                       and derived paths.
                                                       Festival, seminar,
    EVT-002                  Event categories          workshop,               Organizers          P0
                                                       hackathon,
                                                       competition, sports,

                                                                              CONFIDENTIAL • Product planning | Page 14
<PARSED TEXT FOR PAGE: 15 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                        alumni and custom.
                                        Assign owning
                                        institution/departm
                 Ownership and co-
EVT-003                                 ent/society/committ       Organizers          P0
                 organizers
                                        ee plus
                                        collaborators.
                                        Title, dates,
                                        timezone, cover,
EVT-004          Event builder          details, venue,           Organizers          P0
                                        eligibility, capacity
                                        and visibility.
                                        Submit/revise/
                                        reject/approve with
                 Proposal &
EVT-005                                 configurable chains       Faculty/Admin       P1
                 approval
                                        and documented
                                        decisions.
                                        Clone authorized
                                        configurations:
EVT-006          Templates              event forms, roles,       Organizers          P1
                                        QR, task lists, emails
                                        and certificates.
                                        Multi-day program,
                                        sessions, stage
EVT-007          Schedules              rooms and                 Organizers          P1
                                        calendars with
                                        conflict checks.
                                        Request venue,
                                        room, inventory,
EVT-008          Resource booking                                 Organizers          P3
                                        equipment and
                                        collision resolution.
                                        Branding, agenda,
                                        speakers, tracks,
EVT-009          Public microsite                                 Public              P1
                                        registration links
                                        and updates.
                                        Draft, review,
                                        published, live,
EVT-010          Publishing controls    complete, archived        Owners              P0
                                        and cancelled status
                                        with guards.
                                        Roll-up registration,
                                        check-in, budget
EVT-011          Parent aggregates      and reports without       Institution Admin   P1
                                        double-counting
                                        people.
                                        Track edits, change
                                        communications
                                        and permission-
EVT-012          Change history                                   Organizers          P0
                                        relevant
                                        inheritance
                                        changes.
EVT-013          Joint administration   Collaborators work        Organizers          P1

                                                                 CONFIDENTIAL • Product planning | Page 15
<PARSED TEXT FOR PAGE: 16 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                     within grants; one
                                                     accountable event
                                                     owner remains
                                                     defined.
                                                     Repeat event
                                                     templates across
    EVT-014                  Recurring events        weeks/semesters           Organizers          P3
                                                     with independent
                                                     instances.


Business rules & edge cases
        Parent event registration and sub-event registration are distinct selectable models.
        Moving child events cannot accidentally grant inherited access to unintended users.
        Cancellation triggers policy-driven messaging and certificate eligibility review.


Acceptance outcomes
        One annual fest contains 3 event groups and 10 independent competitions without leaking access.
        Aggregate attendance does not count repeated check-ins as unique people.


10. Registration, QR check-in and attendance
Reuse QRBlaze to deliver secure attendee registration and reliable event entry, including peak-capacity scanning,
multi-gate operations and coordinator attendance.


Key user journeys
        Organizer builds conditional forms; student registers individually/team, receives verification and QR pass.
        Gate operator scans QR and sees result for assigned gate/event only; coordinator attendance recorded
         separately from participant attendance.


Full-scope feature requirements
                                                     Required product
    ID                       Capability              behavior /                Primary actors      Tier
                                                     acceptance intent

                                                     Custom fields,
                                                     conditional logic,
                             Dynamic form            mandatory
    ATT-001                                                                    Organizers          P0
                             builder                 validation, file
                                                     uploads and data
                                                     consent.
                                                     Public/
                                                     authenticated
                             Individual              enrolment,
    ATT-002                                                                    Participants        P0
                             registration            eligibility, quotas,
                                                     draft/approval
                                                     workflows.
                                                     Team leaders,
    ATT-003                  Team registration       invitees, roster lock,    Participants        P1
                                                     size limits and

                                                                              CONFIDENTIAL • Product planning | Page 16
<PARSED TEXT FOR PAGE: 17 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                      replacement
                                      workflow.
                                      Pending, approved,
                                      waitlisted, rejected,
                 Registration
ATT-004                               cancelled, attended       Staff               P0
                 statuses
                                      and no-show with
                                      reason.
                                      Opaque
                                      signed/tokenized
ATT-005          QR token issuance                              Backend             P0
                                      credentials and
                                      controlled reissue.
                                      Mobile scanner,
                                      duplicate/invalid
                                      handling, event
ATT-006          Check-in scan                                  Scanner             P0
                                      authorization and
                                      operator
                                      attribution.
                                      Permission-guarded
                                      override requiring
ATT-007          Manual check-in      reason; optional          Staff               P0
                                      supervisor
                                      approval.
                                      Race-safe
                                      idempotent
                                      attendance events,
                 Multi-gate
ATT-008                               scoped gate               Staff               P1
                 concurrency
                                      assignment and
                                      near-real-time
                                      summaries.
                                      Configurable
                                      multiple-entry
                 Check-out & re-
ATT-009                               policy, entry/exit        Staff               P1
                 entry
                                      records and session
                                      attendance.
                                      Separate staff shifts,
                                      time windows and
                 Coordinator
ATT-010                               attendance records,       Team Lead           P0
                 attendance
                                      not falsely counted
                                      as participants.
                                      Queued signed scan
                                      events with conflict
ATT-011          Offline scanning                               Staff               P3
                                      resolution, expiry
                                      and sync indicators.
                                      Validate CSV,
                                      dedupe, mapping
ATT-012          Bulk import/export   preview and               Organizers          P1
                                      privacy restricted
                                      export.

                 Attendance           By date, track, gate,
ATT-013                               cohort, staff and         Managers            P0
                 reporting
                                      registration


                                                               CONFIDENTIAL • Product planning | Page 17
<PARSED TEXT FOR PAGE: 18 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                    conversion.
                                                    Replay limits, token
                                                    revocation, rate
    ATT-014                  Fraud prevention       limits and                 Admins              P1
                                                    suspicious scan
                                                    alerts.


Business rules & edge cases
        Two scanners cannot record conflicting duplicate entry; backend remains authoritative.
        Guest QR is not equivalent to a verified student ID without policy.
        Registration status changes must invalidate attendance privileges when necessary.


Acceptance outcomes
        A duplicate scan returns explicit non-destructive status.
        Multi-gate live test and check-in throughput benchmark pass institution-set target.


11. Competitions, judges, volunteers and live operations
Complex events need separate operational workspaces for judges, rounds, volunteer teams, operations rooms and
results.


Key user journeys
        Hackathon jury sees only assigned submissions; score aggregation awaits authorized publication.
        Event Director assigns check-in volunteer to entry gate; creates shift; monitors no-shows and reassigns staff.


Full-scope feature requirements
                                                    Required product
    ID                       Capability             behavior /                 Primary actors      Tier
                                                    acceptance intent

                                                    Rules, tracks,
                                                    categories, capacity,
    OPS-001                  Competition setup                                 Event Lead          P2
                                                    prize classes and
                                                    qualifying rounds.
                                                    Files, links,
                             Submission             timestamps, team
    OPS-002                                                                    Participants        P2
                             workflow               versioning and
                                                    eligibility.
                                                    Conflict
                                                    declarations,
    OPS-003                  Judge assignment       workload balancing         Event Lead          P2
                                                    and scoped blind
                                                    review.
                                                    Criteria, weights,
                                                    scores, reviewer
    OPS-004                  Rubric scoring                                    Judges              P2
                                                    feedback and score-
                                                    lock decisions.
    OPS-005                  Result processing      Aggregate, tie-            Committee           P2

                                                                            CONFIDENTIAL • Product planning | Page 18
<PARSED TEXT FOR PAGE: 19 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                 break, review,
                                                 approve, publish
                                                 and keep
                                                 corrections audit.
                                                 Configurable
                                                 private/live/final
    OPS-006               Leaderboards                                     Event Lead           P2
                                                 displays, privacy-
                                                 safe publishing.
                                                 Role, team,
                                                 responsible event,
    OPS-007               Coordinator roster                               Team Leads           P1
                                                 shift and contact
                                                 rules.
                                                 Task ownership,
                                                 priority, status, due
    OPS-008               Staff task boards                                Staff                P2
                                                 dates, attachments
                                                 and escalation.
                                                 Log
                                                 venue/entry/medica
                          Incident               l/technical issue
    OPS-009                                                                Operations           P3
                          management             with authorized
                                                 routing and
                                                 severity.
                                                 Real-time check-in,
                                                 staffing gaps, queue
    OPS-010               Live control center                              Event Director       P2
                                                 alerts, issues and
                                                 schedules.
                                                 Feedback, jury
                          Post-event             reviews, event
    OPS-011                                                                Event Lead           P2
                          evaluation             closeout notes and
                                                 lessons learned.


Business rules & edge cases
     Published competition results require explicit approval and correction records.
     Judge may not see other judges confidential scores unless policy allows.


Acceptance outcomes
     A judge submits scores without gaining registration export rights.
     Winners are locked before winner certificates are issued.


12. CertiFrenzy certificates and verification
Unify certificate generation and verification with event eligibility, society operations, student portfolio and bulk
automation. Support participants, winners, coordinators, volunteers, judges and special recognitions.


Key user journeys
     Event owner finalizes check-in → marks eligibility → previews batches → confirms issuance → send or
      download certificates.



                                                                         CONFIDENTIAL • Product planning | Page 19
<PARSED TEXT FOR PAGE: 20 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

        Coordinator assigned shift and verified attendance becomes eligible under event rules; winner eligibility
         follows locked results.


Full-scope feature requirements
                                                   Required product
    ID                       Capability            behavior /              Primary actors        Tier
                                                   acceptance intent

                                                   Migrate existing
                                                   CertiFrenzy
                             Unified certificate   generation and
    CER-001                                                                Admins                P1
                             engine                verification while
                                                   keeping behavior
                                                   tested.
                                                   Rich text, fonts,
                                                   variables, logo,
                                                   signature and
    CER-002                  Designer                                      Designers             P1
                                                   background
                                                   positioning with
                                                   preview.
                                                   Participant, winner,
                                                   coordinator,
                                                   volunteer, judge,
    CER-003                  Certificate types                             Organizers            P1
                                                   speaker and
                                                   customizable
                                                   categories.
                                                   Attendance
                                                   thresholds, result
                                                   position, task
    CER-004                  Eligibility rules                             Certificate Admin     P1
                                                   completion, manual
                                                   override and policy
                                                   evidence.
                                                   Preview recipients,
                                                   eligible counts,
                             Approval before       exclusions and
    CER-005                                                                Authorized issuer     P1
                             issue                 template before
                                                   confirmed batch
                                                   issuance.
                                                   Queue, chunks,
                                                   retry, idempotency,
    CER-006                  Bulk rendering                                Backend               P1
                                                   progress and failure
                                                   detail.
                                                   Unique public
                                                   verification token,
                                                   revocation status
    CER-007                  Secure verification                           Recipients/Public     P1
                                                   and minimal
                                                   exposed recipient
                                                   data.
                                                   Supersede invalid
                             Correction &          certificate, issue
    CER-008                                                                Certificate Admin     P1
                             reissue               corrected version
                                                   and preserve

                                                                          CONFIDENTIAL • Product planning | Page 20
<PARSED TEXT FOR PAGE: 21 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                      history.
                                                      Email template,
                                                      download, digital
    CER-009                   Delivery                                          Recipients         P1
                                                      vault, bounce/retry
                                                      reporting.
                                                      Per-institution/
                              External template       society certificate
    CER-010                                                                     Designers          P2
                              library                 templates and
                                                      controlled sharing.
                                                      Unify issued
                                                      credentials across
                              Student
    CER-011                                           different                 Students           P2
                              achievement ledger
                                                      organizations and
                                                      academic years.
                                                      Issued,
                                                      downloaded,
    CER-012                   Certificate analytics   delivered, bounced,       Managers           P2
                                                      revoked and
                                                      verified counts.


Business rules & edge cases
        Attendance cancellation after issuance follows correction/revocation policy; do not silently delete credential.
        Mail delivery failure does not cause duplicate certificate creation.


Acceptance outcomes
        10,000-recipient representative generation test respects configured processing targets.
        Revoked certificates explicitly fail active verification while retaining audit.


13. Messaging and notification center
Centralized communications allow authorized staff to reach consented cohorts with approved templates, secure
audience previews and tracked delivery.


Key user journeys
        Recruitment Head creates selected-candidate message → previews exact target recipients → confirms send.
        Event publishes location change → affected registrants receive preferred-channel notification.


Full-scope feature requirements
                                                      Required product
    ID                        Capability              behavior /                Primary actors     Tier
                                                      acceptance intent

                                                      Branded drag-and-
                                                      edit templates,
    COM-001                   Email templates         variables, previews       Communicators      P1
                                                      and localization
                                                      hooks.

    COM-002                   Audience                Filter by event,          Communicators      P1
                              segmentation            registration, role,
                                                                             CONFIDENTIAL • Product planning | Page 21
<PARSED TEXT FOR PAGE: 22 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                  society,
                                                  department, status
                                                  and consent.
                                                  Recipient preview,
                                                  sample send, send
    COM-003               Campaign review                                  Authorized sender   P1
                                                  confirmation and
                                                  optional approval.
                                                  Invitations, QR
                                                  passes, registration
                          Transactional
    COM-004                                       confirmations and        Backend             P0
                          messages
                                                  certificate
                                                  deliveries.
                                                  Email first; optional
                                                  WhatsApp/SMS/pus
    COM-005               Channels                h adapters subject       Admins              P2
                                                  to
                                                  permission/consent.
                                                  In-app user
                                                  notifications, read
    COM-006               Notification inbox                               All                 P1
                                                  state, actions and
                                                  quiet hours.
                                                  Rate limits,
                                                  unsubscribe where
    COM-007               Deliverability          relevant, bounce         Platform Ops        P1
                                                  handling and retry
                                                  queues.
                                                  Calendar-triggered
                                                  reminders, expiry
    COM-008               Scheduled messages      alerts and               Organizers          P2
                                                  campaign
                                                  scheduling.
                                                  Language, channel
                                                  settings, marketing
                          Preference
    COM-009                                       choice and               All                 P2
                          management
                                                  transactional
                                                  necessity.
                                                  Sender audit,
                                                  delivery status,
    COM-010               History and metrics                              Admins              P1
                                                  clicks if compliant,
                                                  and costs by tenant.


Business rules & edge cases
     Every AI-initiated send requires explicit confirmation even when template and audience already exist.
     Recipient export permissions differ from sending permissions.


Acceptance outcomes
     A campaign does not send without confirmation and authorized audience.
     Per-college quotas and delivery failure visibility work.



                                                                          CONFIDENTIAL • Product planning | Page 22
<PARSED TEXT FOR PAGE: 23 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

14. Society daily operations and academic-year transition
Manage societies as year-round operational organizations—not just event hosts—with leadership, collaboration,
projects, finance, documents and institutional oversight.


Key user journeys
        New academic session opens → outgoing president prepares handover checklist → faculty approves incoming
         leadership → role access expires/activates.
        Society runs weekly team meetings, requests small budget, assigns tasks and publishes annual activity report.


Full-scope feature requirements
                                                       Required product
    ID                       Capability                behavior /              Primary actors      Tier
                                                       acceptance intent

                                                       Overview, latest
                                                       activities, members,
    SOC-001                  Society dashboard         events, budget,         Heads               P2
                                                       tasks and upcoming
                                                       deadlines.
                                                       Org chart, role
                             Team/position             tenures, contacts by
    SOC-002                                                                    Members             P2
                             directory                 permission and
                                                       vacancy tracking.
                                                       Assignment,
                                                       comments,
    SOC-003                  Task boards               attachments, due        Teams               P2
                                                       dates, dependencies
                                                       and status.
                                                       Schedule, agendas,
                                                       attendance,
    SOC-004                  Meeting workspace         minutes, decisions      Members             P2
                                                       and follow-up
                                                       actions.
                                                       Folder permissions,
                                                       versioned files,
                             Documents & asset
    SOC-005                                            onboarding              Heads               P2
                             library
                                                       documents and
                                                       shared templates.
                                                       Society-only
                                                       targeted notices,
    SOC-006                  Announcements                                     Heads               P2
                                                       pins and receipt
                                                       tracking.
                                                       Annual budget,
                                                       event allocation,
                                                       expense
    SOC-007                  Budget requests                                   Treasurer/Faculty   P3
                                                       attachments and
                                                       approver
                                                       workflows.
    SOC-008                  Inventory                 Equipment               Coordinators        P3

                                                                              CONFIDENTIAL • Product planning | Page 23
<PARSED TEXT FOR PAGE: 24 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                    checkout,
                                                    availability, custody
                                                    and return status.
                                                    Volunteer hours,
                                                    tasks, event
                             Member
    SOC-009                                         participation and        Heads                   P2
                             contributions
                                                    contribution
                                                    evidence.
                                                    Expire positions,
                                                    open nominations,
                                                    approvals,
    SOC-010                  Leadership rollover                             Faculty/Heads           P2
                                                    incoming
                                                    appointments and
                                                    handover packs.
                                                    Read-only historic
    SOC-011                  Alumni continuity      memberships and          Members                 P3
                                                    opt-in alumni links.
                                                    Participation
                                                    growth, activities,
                             Society                budgets,
    SOC-012                                                                  Faculty                 P2
                             performance report     achievements and
                                                    standardized
                                                    annual report.


Business rules & edge cases
        Old leadership must lose edit access at rollover, barring separately authorized role.
        Finance records do not constitute a full general ledger; export/integrate where required.


Acceptance outcomes
        New academic-year leadership does not rewrite historic membership records.
        Society can function fully without running a current event.


15. Portal and workspace experiences
A single sign-in routes each account to its available workspaces and dynamically grants access to modules based
on role plus scope and subscription entitlements.


Key user journeys
        Student logs in → selects Student home or society leadership workspace → views memberships and QR passes.
        College Owner switches among departments and oversight dashboard while seeing only tenant data.


Full-scope feature requirements
                                                    Required product
    ID                       Capability             behavior /               Primary actors          Tier
                                                    acceptance intent

                             Platform owner         Institutions, plans,
    PRT-001                                         contracts, billing,      Platform Owner          P0
                             console
                                                    incidents, global

                                                                            CONFIDENTIAL • Product planning | Page 24
<PARSED TEXT FOR PAGE: 25 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                         feature flags and
                                         audit.
                                         Institutional
                 Institution owner       organizations, staff,
PRT-002                                                           Institution Owner   P0
                 dashboard               events, policies,
                                         plans and usage.
                                         Relevant
                                         department
                 HOD/faculty
PRT-003                                  approvals, society       Faculty             P1
                 dashboards
                                         oversight, staffing
                                         and reports.
                                         Membership,
                 Society leader          events, recruitment,
PRT-004                                                           Heads               P1
                 portal                  tasks, finance and
                                         card designer.
                                         Event planning,
                                         teams, registrations,
                 Event director
PRT-005                                  attendance, judge        Directors           P0
                 portal
                                         operations and
                                         results.
                                         Check-in-only,
                                         registration-only,
PRT-006          Limited staff portals                            Staff               P0
                                         certificates-only,
                                         judging-only modes.
                                         Profile, societies,
                                         recruitment, events,
PRT-007          Student portal                                   Students            P1
                                         tickets, credentials
                                         and notifications.
                                         Minimal
                                         registration/status/
                 External participant    QR/certificate
PRT-008                                                           Guests              P1
                 portal                  verification with
                                         optional guest
                                         accounts.
                                         One sign-in, clearly
                                         labeled
                                         role/resource
PRT-009          Workspace selector                               All                 P0
                                         switch with no
                                         permission merge
                                         confusion.
                                         Respect tenant
                                         boundaries and
PRT-010          Global search                                    All                 P2
                                         field-level
                                         permissions.
                                         Installable web app
                 Responsive PWA          with support for
PRT-011                                                           All                 P1
                 shell                   mobile, tablets and
                                         desktop.




                                                                 CONFIDENTIAL • Product planning | Page 25
<PARSED TEXT FOR PAGE: 26 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

Business rules & edge cases
        Portal UI hides restricted actions but server remains sole permission authority.
        Guests cannot enumerate private student profiles.


Acceptance outcomes
        A member with three positions can switch workspaces without creating duplicate accounts.
        Each limited staff persona sees only granted functions.


16. AI Command Center and n8n automation
An AI assistant in each portal will understand context, answer authorized questions, navigate UI, prepare forms
and coordinate complex operations. Every write/action that changes persisted state or sends messages requires
explicit user confirmation.


Key user journeys
        Society Head asks: "Open design-team shortlisted applicants and prepare onboarding" → AI opens filtered
         table, drafts plan and asks approval for writes.
        Event Director asks for registrations and staff gaps → AI returns permission-filtered answer with drilldown
         UI.
        College Admin asks to create annual fest with three groups → AI drafts hierarchy, previews creation and
         executes only after confirmation.


Full-scope feature requirements
                                                     Required product
    ID                       Capability              behavior /              Primary actors      Tier
                                                     acceptance intent

                                                     Per-workspace AI
                                                     chat page and
    AIA-001                  Dedicated chat UI       floating assistant      All                 P2
                                                     drawer with history
                                                     and clear context.
                                                     Permission-filtered
                                                     analytics/search
    AIA-002                  Read-only queries                               All                 P2
                                                     with source links to
                                                     original records.
                                                     Open route, select
                                                     tab, show modal,
                                                     apply filter,
                             Structured UI
    AIA-003                                          populate safe draft     All                 P2
                             actions
                                                     form via typed
                                                     frontend
                                                     commands.
                                                     Backend-validated
                                                     tools exposed by
    AIA-004                  Tool/action registry    each domain; no         AI Platform         P2
                                                     arbitrary SQL or
                                                     unrestricted clicks.
    AIA-005                  Confirmation on         Show who/what           All                 P2
                                                                            CONFIDENTIAL • Product planning | Page 26
<PARSED TEXT FOR PAGE: 27 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                       changes, affected
                                       count and side
                                       effects; require
                 every write
                                       explicit authorized
                                       approval for each
                                       execution.
                                       Create plan/diff
                                       before execution;
                 Action preview &
AIA-006                                revalidate auth and      All                 P2
                 dry-run
                                       data freshness at
                                       confirmation.
                                       Persistent job
                                       status, safe retries,
                 Multi-step
AIA-007                                resumable steps          AI Platform         P2
                 orchestration
                                       and partial failure
                                       explanation.
                                       Signed server-to-
                                       server triggers,
                                       managed
AIA-008          n8n connector         workflows, least         Platform Ops        P2
                                       privilege and
                                       webhook
                                       verification.
                                       Recruitment
                                       notifications, event
                                       launch, check-in
                 Automation
AIA-009                                reports,                 Heads/Admins        P2
                 template library
                                       certification and
                                       member handover
                                       recipes.
                                       Descriptions,
                                       schedules, form
AIA-010          AI event copilot      drafts, coordination     Organizers          P2
                                       plans and reports
                                       with human review.
                                       Prepare selections,
                                       cards, emails and
AIA-011          Bulk agent actions    certificate batches      Heads               P3
                                       with per-operation
                                       confirmation.
                                       Prompt injection
                                       defenses, sensitive-
AIA-012          AI governance         data filtering, model    Platform Admin      P2
                                       policies, token
                                       budgets and audit.
                                       Tenant plans,
                 AI                    usage, quotas and
AIA-013          entitlement/meterin   cost reports;            Owners              P2
                 g                     institution-level
                                       policy controls.

AIA-014          Failure and human     When ambiguous,          All                 P2
                 handoff               insufficient rights

                                                               CONFIDENTIAL • Product planning | Page 27
<PARSED TEXT FOR PAGE: 28 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                    or errors, show
                                                    exactly what needs
                                                    human action.
                                                    Permission-
                                                    controlled graphical
                                                    rule/trigger/action
    AIA-015                  Workflow designer                              Power Users           P3
                                                    builder backed by
                                                    supported n8n
                                                    recipes.


Business rules & edge cases
        Viewing a modal without persistently changing data is allowed; prefilling draft data is non-persistent and
         must not auto-submit.
        All AI-triggered writes including emails, grants, results, cards and exports require confirmation as approved
         by founder.
        An AI assistant must never escape the logged-in user’s resource permissions or tenant.
        Long-running workflows need pause/abort semantics and idempotency.


Acceptance outcomes
        AI can open filtered registrations without modifying anything.
        AI-created society recruitment requires an explicit preview and confirmation.
        Automated negative tests prove cross-tenant data cannot be retrieved through natural-language prompts.


17. Reporting, finance, resources and student achievement
Provide credible, permission-scoped insight across institutional events, societies and students while preserving
operational/financial source-of-truth boundaries.


Key user journeys
        Faculty requests academic-year activity summary and exports authorized PDF/CSV.
        Institution Admin reviews annual fest budget commitments, spend, attendance, certificates and feedback.


Full-scope feature requirements
                                                    Required product
    ID                       Capability             behavior /              Primary actors        Tier
                                                    acceptance intent

                                                    Funnel, arrivals,
                                                    attendance, no-
    RPT-001                  Event metrics                                  Organizers            P0
                                                    show, capacity and
                                                    conversion views.
                                                    Cross-department
                                                    and society
                             Institution
    RPT-002                                         aggregates with         Institution Owner     P1
                             dashboards
                                                    double-counting
                                                    controls.
                                                    Membership
    RPT-003                  Society dashboards     growth,                 Heads                 P2
                                                    engagement,
                                                                           CONFIDENTIAL • Product planning | Page 28
<PARSED TEXT FOR PAGE: 29 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                 participation,
                                                 recruitment, tasks
                                                 and achievements.
                                                 Budget versions,
                                                 approvals, line
    RPT-004              Budget tracking         items, expenses,         Treasurer           P3
                                                 attachments and
                                                 balance views.
                                                 Expense and event
                                                 financial exports
    RPT-005              Finance exports                                  Finance             P3
                                                 for institutional
                                                 ERP/accounting.
                                                 Shared room
                                                 bookings, collisions,
                         Venue/resource
    RPT-006                                      inventory and            Admin               P3
                         planner
                                                 operational
                                                 utilization.
                                                 Unified verifiable
                                                 certificates, roles,
                         Student
                                                 volunteering,
    RPT-007              achievement                                      Students            P2
                                                 official
                         portfolio
                                                 participation and
                                                 badges.
                                                 Template-based
                                                 narrative and
                                                 evidence-backed
    RPT-008              Annual reports                                   Heads/Faculty       P2
                                                 annual
                                                 society/department
                                                 reports.
                                                 Explain changes
                                                 using permitted
    RPT-009              AI analytics insights                            All                 P3
                                                 data with caveats
                                                 and drilldown.
                                                 Saved filters,
                                                 exports, scheduled
    RPT-010              Custom reporting                                 Authorized          P3
                                                 reports, report
                                                 sharing policy.


Business rules & edge cases
     Reported unique participants use institution identity reconciliation policy; never sum raw attendance rows.
     Budget tools are management records unless explicitly integrated into formal accounting.


Acceptance outcomes
     Reports retain provenance to underlying authorized records.
     Student has one portfolio across society memberships but cannot see others’ sensitive data.




                                                                         CONFIDENTIAL • Product planning | Page 29
<PARSED TEXT FOR PAGE: 30 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

18. User experience, mobile and accessibility
Responsive experience
     Mobile-first student registration, pass display, check-in scanning, digital ID and notifications.
     Desktop-optimized high-density admin grids, visual form/card/certificate designers and analytics.
     Installable PWA with graceful unsupported/offline states; offline check-in subject to separate phase and
      conflict safeguards.
     Keyboard shortcuts, contextual breadcrumbs, helpful empty states, undo where safe and command palette.


Brand system
     Global neutral design system with institution themes and organization-level logo/palette.
     Beautiful ready-to-use ID/certificate themes plus advanced design editors and controlled brand governance.
     Light/dark mode, component tokens, consistent alerts, approvals and task progress indicators.


Accessibility and localization
     WCAG 2.2 AA as design target; semantic labels, keyboard paths and reasonable screen-reader experience.
     Readable mobile touch targets, scanner permissions fallback, high contrast and reduced motion.
     Internationalized timestamps, currency and date formats; English-first with translation-ready strings.


19. Security, privacy, legal and non-functional requirements
    Concern                                                   Master requirement / target

                                                              Server-side institution scoping, PostgreSQL RLS where
    Tenant isolation
                                                              applicable and automated cross-tenant tests
                                                              Private faculty/student data shown only to legitimate
    Data minimization
                                                              roles and verified requests
                                                              Configurable notices, consent capture, retention
    Consent/retention                                         schedules, deletion/export handling subject to
                                                              applicable law
                                                              Security-relevant events, AI confirmations, grants,
    Auditability
                                                              result changes, certificates and subscriptions logged
                                                              Strong password/session policies, MFA privileged
    Authentication
                                                              users, rotation and revocation
                                                              Backups, restore runbooks, RPO/RTO defined by
    Resilience
                                                              service tier before contractual launch
                                                              Realistic load test gates defined with first-college peak
    Performance
                                                              registration and scanner needs
                                                              Queue-backed idempotent bulk messages, certificate
    Jobs
                                                              rendering and workflow execution
                                                              SLO/maintenance policy defined before paid
    Availability
                                                              contracts; monitor critical scans and event flows
                                                              Logs, metrics, tracing, audit dashboard, error budget
    Observability
                                                              and alerting
                                                              Institution-level structured exports and
    Portability
                                                              configuration/data separation

                                                                         CONFIDENTIAL • Product planning | Page 30
<PARSED TEXT FOR PAGE: 31 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                             All writes explicitly confirmed, fully scoped tool calls,
    AI controls                                              prompt-injection defenses, no autonomous privilege
                                                             increases
                                                             Evaluate applicable Indian privacy/contract/tax
    Compliance                                               obligations with qualified legal/accounting review
                                                             before launch



20. Integrations and technical constraints
     Existing products: event-checkin-main.zip (QRBlaze) and certifrenzi-main.zip (CertiFrenzy) are
      migration/reference sources; their endpoints, schema and security assumptions must be audited before reuse.
     Client: Next.js/React/TypeScript with an accessible component system and PWA capability; use a modular
      domain-oriented architecture.
     Backend: versioned authenticated APIs and server authorization shared by UI and AI tools; separate
      privileged automation credentials.
     Database: PostgreSQL/Supabase architecture with institution_id and resource scopes, normalized
      audit/outbox/job records and migrations.
     Background: queue/worker for large batches, race-safe check-ins and reliable transactional outbox
      integration.
     AI: tool calling, typed UI intents, context window/resource filtering, n8n orchestration and explicit
      confirmation gate.
     Communication: abstraction over transactional email service; WhatsApp/SMS/calendar/payments via
      approved adapters and tenant opt-in.
     DevOps: separate local/staging/production environments, secrets vault, CI tests, migration rollback and
      disaster recovery procedures.


21. End-to-end reference scenarios
A. College annual function
Institution Owner creates festival; faculty appoints organizing committee; multiple child events and rooms;
society heads get bounded grants; registration/check-in; scores, certificates, spend and aggregated reporting.


B. Independent society event
Society Head creates workshop under own organization, gets approval if required, builds form, appoints event
volunteer to check-in-only grant, checks attendees in, issues participant/coordinator certificates.


C. Audition to membership
Recruitment drive, applications, slot booking, auditions, panels, weighted results, final committee selection,
emails after confirmation, membership acceptance and society-branded ID issuance.


D. Multiple societies one student
Student is technical society member and cultural society coordinator with separate tenure; single account shows
two workspaces/cards and central achievements without merging private staff powers.




                                                                        CONFIDENTIAL • Product planning | Page 31
<PARSED TEXT FOR PAGE: 32 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

E. AI operation
Head asks AI to locate approved candidates, filter by team and prepare onboarding; AI opens filtered UI, previews
intended changes and asks confirmation before creating membership/invitation records.


F. New paying institution
Founder creates plan and quote, records signed contract, activates tenant, invites College Owner, configures
quotas, monitors usage and invoice/renewal status, retains tenant separation.


G. Academic rollover
Outgoing leadership prepares tasks and documents; faculty approves new positions; prior permissions expire,
new appointments activate, member cards update and historical decisions remain verifiable.


H. Subscription grace and export
Institution payment overdue; platform applies documented grace policy, alerts owners, restricts premium actions
as agreed, preserves safe viewing/export and logs reinstatement.


22. Delivery waves and dependency gates
 Wave                                  Deliverables                             Exit gate

                                       Existing code audit, security gaps,
                                                                                Architecture and migrations
 0 — Discovery                         architecture, canonical data model,
                                                                                approved
                                       design system baseline
                                       Platform Super Admin, institution
                                       bootstrap, organizations, unified        Pilot college runs a complete small
 1 — Initial release
                                       auth, scoped RBAC, nested events         event
                                       and registration/check-in
                                       CertiFrenzy merge, templates,
                                       participant/coordinator
 2 — Credential foundation                                                      Event-to-certificate lifecycle passes
                                       certificates, verification and
                                       delivery
                                       Recruitment, rounds, membership,
                                                                                Society recruitment and cards
 3 — Society & auditions               teams, digital ID studio and
                                                                                operational
                                       rollover
                                       Volunteers, competitions,
 4 — Operations                        approvals, tasks, meetings,              Large multi-event festival pilot
                                       resources and budget tracking
                                       Dedicated assistant, tool registry,
                                       navigation/actions, explicit write       End-to-end confirmed AI
 5 — AI & n8n
                                       confirmation and automation              workflows pass security tests
                                       recipes
                                       Plan catalog, tenant metering,
                                                                                Paid tenant trial + renewal
 6 — Commercial SaaS expansion         contracts, billing, renewals, owner
                                                                                rehearsal
                                       self-service
                                       Accessibility, resilience, security
                                                                                Production and commercial launch
 7 — General availability              assessments, monitoring, DR, scale
                                                                                sign-off
                                       and onboarding


                                                                     CONFIDENTIAL • Product planning | Page 32
<PARSED TEXT FOR PAGE: 33 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

Wave numbering indicates sequencing, not PRD omission. SaaS tenancy and founding complimentary plan must
exist by Wave 1; full commercial billing UI may mature in Wave 6. AI-compatible domain action contracts should
be designed from Wave 1 even if conversational UI launches later.


23. KPIs, acceptance policy and major risks
    Measure                                                   Definition / proposed validation method

                                                              Institution Owner completes setup and launches first
    Activation
                                                              event
                                                              Approved registrations vs attendee check-ins; cohort-
    Event conversion
                                                              based
    Staff effectiveness                                       Percent shifts filled, check-in latency and failed scans
                                                              Applicants progressing through finalized
    Recruitment completion
                                                              selected/waitlisted outcomes
    Credentials                                               Eligible certificates generated, delivered and verified
                                                              Active members, completed tasks, managed events
    Society engagement
                                                              per session
                                                              Active paid tenants, renewals, consumption vs
    SaaS commercial
                                                              entitlements
                                                              Confirmed tasks completed successfully with no
    AI utility
                                                              unauthorized operations
                                                              Incidents during major event peak windows and
    Reliability
                                                              recovery effectiveness


High-priority product risks
      Unauthorized data access due to complex nested resource grants → formal permission model, deny-by-
       default, tests and staff impersonation guardrails.
      Scope expansion → staged releases, feature flags, documented pilot exit criteria and one canonical backlog.
      Simultaneous QR scans/event spikes → idempotent attendance writes, load tests, graceful retries and live
       incident procedures.
      Certificate inaccuracies → versioned templates, approved eligibility rules and reissue/revocation capabilities.
      AI hallucinations/unintended operations → typed APIs, previews, explicit write confirmation and audit
       logging.
      Commercial enforcement disputes → versioned contract entitlements, metering transparency and
       documented grace policy.
      Sensitive student data → tenant privacy boundary, export approvals, retention and legal review.


24. Open decisions and sign-off
    Item                                                      Recommended baseline / pending decision

                                                              TBD: distinct commercial brand; QRBlaze and
    Final umbrella brand
                                                              CertiFrenzy may remain subproduct/engine names
                                                              Define actual contracting entity, invoicing tax
    Legal/commercial owner
                                                              treatment and terms before paid launch
                                                              Explicit complimentary plan, support scope, usage
    Founding college terms
                                                              limits and institution-level authority

                                                                        CONFIDENTIAL • Product planning | Page 33
<PARSED TEXT FOR PAGE: 34 / 34>
CAMPUS OPERATING PLATFORM | MASTER PRODUCT REQUIREMENTS

                                                            Plan and add-on amounts not fixed; research demand,
 Pricing
                                                            costs and institutional budgets
                                                            College decides final authority for membership,
 Approval governance
                                                            outcomes, budgets and certificate issuance
                                                            Define data retention by type, lawful grounds, consent
 Retention/privacy
                                                            and opt-out mechanisms
                                                            Obtain peak event attendance, active student counts
 Bulk scale targets
                                                            and certificate projections
                                                            Choose onboarding, service tiers, escalation and
 Institution support model
                                                            restore obligations
                                                            Select compliant vendor(s) after pricing, deliverability
 Payment and messaging integrations
                                                            and contractual review

SIGN-OFF CRITERIA: Stakeholders approve this master destination-state scope, governance boundaries, AI
confirmation policy, tenant model, delivery principles and ownership of unresolved decisions. SRS will then
decompose each requirement into testable system requirements with full state machines, API contracts, data
schemas, role-action matrix and precise acceptance cases.

End of Master Product Requirements Document




                                                                      CONFIDENTIAL • Product planning | Page 34