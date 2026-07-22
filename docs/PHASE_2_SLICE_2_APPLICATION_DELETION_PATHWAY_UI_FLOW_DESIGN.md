# Phase 2 Slice 2 — Application Deletion Pathway UI Flow Design

- Status: Draft — UI flow design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- API implementation: not authorized
- UI implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future user and operator experience** for governed deletion requests on SkinIntel: how authenticated users discover controls, submit scoped requests, confirm intent, track status, and receive truthful outcome messaging; and how authorized operators interact with validation and execution boundaries without exposing governance internals to ordinary users.

It does **not** authorize UI implementation, route implementation, API implementation, SQL changes, migration execution, Block A/B, Supabase contact, or DEV/PROD changes.

The **API Contract Design** (`docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md`) controls future HTTP transport, actor permissions, and safe response boundaries. The **committed migration** (`supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`) controls persistence vocabulary, state invariants, and attribution rules. User-facing copy and presentation must remain **truthful about external residuals** (storage, exports, logs, client caches, and third-party copies are not universally erased by governed lifecycle exclusion).

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| Artifact | Path |
|----------|------|
| Committed migration contract | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| Application Deletion Pathway Plan | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` |
| Application Deletion Pathway Technical Design | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` |
| Application Deletion Pathway API Contract Design | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md` |
| Slice 2 Technical Design | `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` |
| DEV execution gate disposition | `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` |
| Design system reference | `docs/SKININTEL_DESIGN_SYSTEM_V1.md` |
| This document | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md` |

### Precedence (binding)

1. **Committed migration contract** — scopes, states, resolution codes, transition guards, attribution cardinality, RLS/grants.
2. **Accepted Application Deletion Pathway Plan** — pathway scope, residuals, F-P2-3 obligation, user communication rules.
3. **Accepted Application Deletion Pathway Technical Design** — trust zones, sequences, component responsibilities.
4. **Accepted API Contract Design** — HTTP operations, envelopes, presentation field mapping.
5. **This UI Flow Design** — user/operator experience structure, navigation placement, accessibility, and copy boundaries only.
6. **Future implementation** — must not silently redefine database semantics or overclaim erasure.

UI copy and visual presentation **must not** silently redefine database states (`received`, `executed`, `rejected`), invent a fourth `request_state`, or imply deletion scope beyond the selected governed scope.

---

## 3. Current UI Surface

Read-only inspection at repository baseline. Claims cite exact paths. **No inspected file was modified.**

### Separation

| Layer | Content |
|-------|---------|
| **Current repository UI state** | Sections 3.1–3.11 below |
| **Accepted future UI flow** | Sections 5–37 |
| **Unresolved decisions** | Section 41 |
| **Implementation prerequisites** | Sections 42–44 |

### 3.1 Landing and footer deletion link

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/page.tsx` | Footer link `href="/api/delete-request"` labeled “Delete Request” (English); navigates via GET | **Incomplete / unsafe discoverability** | GET to POST-only stub; no authenticated form, scope selection, confirmation, or status UI |
| `app/page.tsx` | Primary product copy in Croatian; warm ivory / terracotta styling aligned with design direction | **On-brand marketing surface** | No governed data-rights entry beyond broken footer link |

### 3.2 Privacy page

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/privacy/page.tsx` | Static “Politika privatnosti”; user rights via email to `privacy@skinintel.ai` | **Incomplete relative to governed pathway** | No link to authenticated request flow, scope selection, or status tracking |
| `app/privacy/page.tsx` | Neutral educational tone; mentions local storage on device | **Partial residual awareness** | Does not describe governed exclusion vs universal erasure |

### 3.3 Privacy-policy route

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/privacy-policy/` | **Not present** in repository | **Absent** | N/A — only `app/privacy/page.tsx` exists |

### 3.4 Dashboard and navigation

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/(dashboard)/layout.tsx` | Wraps dashboard in `SessionProvider` + `ClientRoot` | **Authenticated shell** | No privacy/deletion nav entries |
| `app/client-root.tsx` | Sidebar + header + `#FBF6F0` dashboard body | **Layout host** | No deletion pathway routes |
| `components/app-sidebar.tsx` | Desktop sidebar (`hidden` below `xl`); SkinIntel branding | **Partial nav chrome** | No mobile-equivalent sidebar; no deletion links |
| `components/sidebar-data.ts` | Nav items: “Scan” → `/dashboard`, “History” → `/history` | **Minimal product nav** | No account/privacy/deletion entries |
| `components/layout/header.tsx` | `SidebarTrigger` + `ProfileDropdown` | **Header chrome** | No deletion/status shortcut |

### 3.5 Settings / account area

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/**/settings/**` | **No settings route or page found** | **Absent** | Target account/privacy entry surface does not exist |
| `components/shared/profile-dropdown.tsx` | Profile menu: display name fallback, “Admin” label, **Logout only** | **Template residue / incomplete** | No privacy, data rights, or deletion request links |

### 3.6 Existing delete-request stub entry point

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/api/delete-request/route.ts` | POST-only; parses optional client `email`/`message` then discards; always `200` success JSON | **Unsafe non-authoritative stub** | Must be replaced per API Contract Design; must not remain user success pathway |
| `app/page.tsx` | Footer exposes stub via GET navigation | **Misleading UX** | Users may see non-JSON or wrong-method behavior |

### 3.7 Auth boundary

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `auth.ts` | NextAuth v5; Credentials + Google + GitHub; exports `auth()` | **Authoritative session source** | Deletion UI must reuse; no manual email authority |
| `middleware.ts` | Redirects unauthenticated users for `/dashboard/:path*`, `/history`, `/history/:path*` | **Partial page protection** | Does not protect future deletion pages unless matcher extended later under separate authorization |
| `proxy.ts` | Auth gate for non-public routes; **skips `/api`** | **Not API protection** | Deletion API auth remains in-handler |
| `app/auth/login/page.tsx` | Croatian login shell; `LoginForm` | **Primary sign-in surface** | Future deletion entry should redirect here when unauthenticated |
| `app/actions/index.ts` | Server actions use `auth()` + `session.user.email` | **Identity pattern reference** | Deletion reads/writes must align |

### 3.8 History / status presentation patterns

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/(dashboard)/(homes)/history/page.tsx` | Server page; `auth()` + email required; lists analyses via `eligible_scan_records` + legacy rows; Croatian date formatting (`hr-HR`) | **Eligibility-aware history pattern** | Model for ownership-scoped lists; not deletion request status |
| `app/(dashboard)/(homes)/history/[id]/page.tsx` | Detail for single analysis; redirect if unauthenticated | **Detail drill-down pattern** | No governance request detail view |

### 3.9 Design system

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `docs/SKININTEL_DESIGN_SYSTEM_V1.md` | Documents warm ivory, terracotta, peach, champagne, charcoal, muted sage success-only, premium wellness tone | **Documentation-only north star** | Landing (`app/page.tsx`) and auth/login follow palette; dashboard retains some template patterns |
| `app/globals.css` | Token pipeline referenced by design doc | **Implementation tokens** | Deletion flows should align when implemented |

### 3.10 Localization posture

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| `app/layout.tsx` | `html lang="en"`; Open Graph `locale: "en_US"` | **Metadata skew** | Most user-facing strings are Croatian inline in components |
| Product pages | Croatian primary (`app/page.tsx`, `app/privacy/page.tsx`, dashboard/history formatting) | **No i18n framework** | Future deletion copy must stay localization-ready; internal API vocabulary stays English/stable |

### 3.11 Operator UI

| Path | Current behavior | Assessment | Gap vs target flow |
|------|------------------|------------|-------------------|
| Repository | **No operator deletion queue or admin UI** | **Absent by design in this slice** | Future operator boundary is server-mediated only (Section 25) |

---

## 4. UX Principles

Future deletion pathway UI must be:

- **Calm and non-alarming** — supportive wellness tone; no crisis styling for routine data-rights actions.
- **Privacy-transparent** — explain what the request does and what it does not do before submission.
- **No medical language** — educational/cosmetic framing only; consistent with `app/page.tsx` disclaimer posture.
- **No dark patterns** — deletion controls discoverable; no hidden opt-outs or coerced retention.
- **No accidental submission** — explicit scope review, unchecked confirmation, disabled submit until valid.
- **Explicit intent confirmation** — user acknowledges governed exclusion request, not instant erasure.
- **No misleading “everything deleted”** — completed state describes governed pathway outcome only.
- **Status transparency** — show presentation status mapped from database facts; no fake progress.
- **No internal technical details** — no SQLSTATE, operator notes, attribution rows, or primitive errors in user UI.
- **Mobile-first** — single-column flows, thumb-safe controls, accidental tap prevention on destructive confirm.
- **Accessible** — keyboard, focus, labels, non-color-only status (Section 33).
- **Compatible with future localization** — stable internal keys; Croatian/English/German direction per platform docs.
- **No PROD testing** — UI verification only on authorized non-PROD environments after gates open.

---

## 5. User Journey Overview

Accepted future journey (conceptual; no routes fixed except API family in contract design):

1. **Discover deletion controls** — privacy page, account menu, optional status link, optional future scan context.
2. **Open deletion request entry** — authenticated surface; unauthenticated users redirected to sign-in.
3. **Select scope** — `account_wide`, `scan_specific`, or `evidence_specific` (if enabled for release).
4. **Review implications** — residuals, eligibility effects, limitations; no universal erasure claim.
5. **Confirm intent** — explicit unchecked acknowledgment of scope and limitations.
6. **Request submission** — client calls future `POST /api/deletion-requests` (not current stub).
7. **Received confirmation** — safe success view; presentation status `pending_review`; no completion claim.
8. **Status tracking** — current status and history via future GET operations.
9. **Validated milestone presentation** — `in_progress` while `request_state = received` and `validated_at` set.
10. **Executed or rejected outcome** — `completed` or `not_completed` presentation with mapped safe categories.
11. **Support / residual guidance** — privacy contact, status re-read, no user execution retry.

---

## 6. Entry-Point Architecture

### Accepted future entry points

| Entry | Role | Priority |
|-------|------|----------|
| **Privacy page** (`app/privacy/page.tsx` evolution) | Discoverability + explanation + link to authenticated flow | **Primary public discoverability** |
| **Account / settings area** (not yet in repo) | Signed-in data rights hub | **Primary authenticated hub** (once structure approved) |
| **Request status entry** | Return path from confirmation email or in-app link to status/history | **Secondary** |
| **Contextual scan-level entry** | Pre-select scan for `scan_specific` from history/detail | **Secondary / optional** — only if separately approved |

### Route paths

User-facing **page routes** for the deletion form, confirmation, history, and detail are **not locked** in repository evidence. Future implementation packages must not invent paths in production until approved. API routes are locked in the **API Contract Design**: `/api/deletion-requests` family (replacing non-authoritative `/api/delete-request` stub).

### Stub reconciliation

Future package 1 must reconcile `app/page.tsx` footer link and stub handler so users are not sent to GET `/api/delete-request` or receive false success from the stub.

---

## 7. Navigation Placement

Plan only — **do not modify navigation in this task.**

| Surface | Placement intent |
|---------|------------------|
| **Mobile** | Profile/account menu entry (“Your data” / “Privacy & requests” — labels TBD); link from privacy page; optional footer on marketing pages after stub fix |
| **Desktop sidebar** | Secondary link under profile menu preferred over crowding `components/sidebar-data.ts` primary Scan/History pair; optional privacy subsection if settings hub deferred |
| **Profile dropdown** (`components/shared/profile-dropdown.tsx`) | Add data-rights entry above Logout when authorized |
| **Privacy page** | Prominent authenticated CTA to start or view requests |

Deletion controls must remain **findable** without burying under multiple obscure taps. They must not be styled as a trap or hidden “advanced” setting.

---

## 8. User Authentication Boundary

| Rule | UI behavior |
|------|-------------|
| Unauthenticated access | Redirect to `app/auth/login/page.tsx` (or show sign-in prompt with return URL — pattern TBD) |
| Identity source | Session only via NextAuth; **never** ask user to type authoritative email for submission |
| Confirmation display | Show session email **only if needed** for human confirmation; mask/localize format per policy |
| Missing session email | Fail closed — cannot proceed (parity with scan API requirement) |
| Service role | **No** browser service-role key or direct Supabase governance writes |

Reference surfaces: `auth.ts`, `app/auth/login/page.tsx`, `middleware.ts` (dashboard/history), `app/(dashboard)/(homes)/history/page.tsx` (server redirect pattern).

---

## 9. Request Entry Screen

Conceptual content blocks (not final copy):

| Element | Purpose |
|---------|---------|
| **Title** | Neutral “Data exclusion request” / “Request removal from your account” framing |
| **Explanation** | Governed process; review before processing; not instant deletion of all copies |
| **Scope selector** | Three migration scopes; disable unavailable scopes with explanation |
| **Target selector** | Scan list or evidence picker when scope requires |
| **Residual notice** | Short pointer to full residual disclosure (Section 32) |
| **Intent confirmation** | Unchecked control restating selected scope |
| **Submit action** | Primary terracotta CTA; disabled until valid |
| **Cancel / back** | Return to privacy or previous screen without side effects |

---

## 10. Scope Selection UI

Closed scopes only — no new scopes.

### `account_wide`

| Aspect | UI definition |
|--------|----------------|
| User-safe label | “All scan sessions on my account” (wording TBD) |
| Short explanation | Requests governed exclusion across eligible session anchors; affects in-app eligibility views |
| Follow-up selection | None |
| Unavailable state | If execution not authorized for release — scope disabled with explanation |
| Warnings | Residuals remain; not account closure or billing cancellation |
| Ownership | Implicit via session |
| Attribution implication | Multiple session attribution at execution — invisible to user; no promise of row-by-row listing |

### `scan_specific`

| Aspect | UI definition |
|--------|----------------|
| User-safe label | “One scan session” |
| Short explanation | One session and propagated child evidence via governance rules |
| Follow-up selection | Required scan picker from **owned, eligible** sessions only |
| Unavailable state | No eligible scans — empty state (Section 22) |
| Warnings | Binaries/exports may remain |
| Ownership | Server-validated; UI lists only owner sessions |
| Attribution implication | Single session outcome; user sees scan summary not execution rows |

### `evidence_specific`

| Aspect | UI definition |
|--------|----------------|
| User-safe label | “One piece of evidence” |
| Short explanation | Targets one whitelisted evidence row under a parent session |
| Follow-up selection | Parent session + evidence category + specific item |
| Allowed categories | `user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence` only |
| Unavailable state | **May remain gated** in first UI release if execution consumer not approved — show disabled scope + explanation |
| Warnings | Session attribution rows not used for this scope per contract |
| Ownership | Server validation; no cross-user IDs in UI |
| Lifecycle | Do not invent unsupported exclusion behavior beyond approved consumer path |

---

## 11. Account-Wide Request Flow

1. User selects account-wide scope.
2. UI explains eligibility exclusion across governed sessions; links residual disclosure.
3. User checks intent confirmation acknowledging limitations.
4. Submit → intake `received` only.
5. **Known limitations** shown before and after submit: VPS images, exports, logs, localStorage, email copies may persist.
6. **Atomic execution obligation** is operator/server-side; UI never promises partial completion.
7. Status follow-up via history/detail views.
8. **Must not imply** full account deletion, subscription cancellation, or auth identity removal.

---

## 12. Scan-Specific Request Flow

1. User selects scan-specific scope.
2. UI loads **ownership-only** eligible scan list (pattern similar to `eligible_scan_records` usage in `app/(dashboard)/(homes)/history/page.tsx`).
3. **Empty state** if no eligible scans — offer account-wide only if policy allows or explain nothing to select.
4. **Unavailable / already excluded** scans must not appear as selectable; if user deep-links stale id, server rejects with safe error.
5. Confirmation restates scan label/date (user-safe summary, not internal UUID prominence unless needed for support).
6. Outcome messaging: session removed from eligibility-aware views when `completed`; residuals remain.

Never expose another user’s scan in list, URLs, or error hints.

---

## 13. Evidence-Specific Request Flow

1. User selects evidence-specific scope (if enabled).
2. Select parent session then evidence type (whitelist only) then item.
3. **Ownership validation** server-side; UI filters to owned targets.
4. **Target hierarchy** visible: session → evidence type → item.
5. **Execution support may remain gated** — UI shows unavailable if backend consumer not approved for release.
6. **Unavailable state** when no eligible evidence targets.
7. Do not invent lifecycle behavior for categories outside whitelist or without approved execution path.

---

## 14. Intent Confirmation Pattern

- **Explicit unchecked** checkbox or equivalent accessible control.
- Statement includes **exact requested scope** and target summary when applicable.
- **No pre-checked** consent.
- **No deceptive urgency** (“act now or lose rights”).
- **Destructive-action styling** — muted terracotta/warning tone per design system; not alarm red.
- **Submit disabled** until scope valid, targets satisfied, confirmation checked, not submitting.
- **Final review step** optional but recommended on mobile: summary card before submit.

---

## 15. Submission Interaction States

| State | User-visible behavior |
|-------|----------------------|
| **Idle** | Form editable; submit enabled when valid |
| **Invalid** | Inline field errors; generic safe categories |
| **Submitting** | Submit disabled; loading indicator; double-submit prevented |
| **Accepted** | Navigate to received confirmation view |
| **Conflict** | Explain duplicate/active or already completed; link to existing request |
| **Rate-limited** | Calm retry guidance (Section 31) |
| **Ambiguous result** | Do not assume success; prompt status re-read |
| **Internal failure** | Generic error; support path |

**Double-submit prevention:** disable button + idempotency key per API contract when implemented.

**Idempotency-aware retry:** same key returns prior success; UI should surface existing request id.

**No blind repeated submission** on ambiguous network failure — re-read `GET /api/deletion-requests/current` first.

---

## 16. Received Confirmation View

May show:

- Request identifier (if useful for support)
- Scope and safe target summary
- Received timestamp (`received_at` mapping)
- Presentation status **`pending_review`**
- Next steps (status page, email patience, no completion claim)
- Link to status/history
- **Residual notice** (short)

Must **not** imply deletion is complete or that all copies are gone.

---

## 17. Status Presentation Model

### Database truth

| Field / state | Meaning |
|---------------|---------|
| `request_state = received` | Intake recorded |
| `request_state = executed` | Terminal success path |
| `request_state = rejected` | Terminal non-success path |
| `validated_at` non-null | Validation milestone while still `received` |

### Presentation statuses (not database states)

| Presentation status | Mapping |
|---------------------|---------|
| `pending_review` | `received` + `validated_at` null |
| `in_progress` | `received` + `validated_at` non-null |
| `completed` | `executed` + `resolution_code = completed` |
| `not_completed` | `rejected` (+ safe outcome category) |

UI reads **`presentation_status`** from API when implemented; may show validation milestone timestamp without calling it a new database state.

**Rule:** Milestone alone ≠ completion. Only `completed` presentation may communicate governed pathway completion — never universal erasure.

---

## 18. Pending Review State

- **Messaging:** Request received; team/process reviewing; no outcome promise.
- **Expected next step:** Check back later; status refresh.
- **No internal operator details.**
- **Refresh posture:** manual refresh or pull-to-refresh; polling interval TBD (open decision).
- **Support:** privacy email / in-app support link when defined.

---

## 19. In-Progress / Validated Milestone State

- Reflects **`validated_at` milestone** with presentation `in_progress`.
- User-safe “initial checks passed; processing continues” language.
- **No fourth database state** in copy or badges.
- **No promise** that deletion/exclusion has finished.
- **No raw operator details** or primitive names.

---

## 20. Completed State

- Means **governed Slice 2 pathway completed** and lifecycle exclusion applied per scope under current rules.
- Affected items **no longer appear in eligibility-aware app views** (consistent with Slice 1B behavior).
- **Explicit residual explanation** — external copies may remain (Section 32).
- Links to privacy policy and support.
- **No hidden continued personalization** from excluded evidence on eligibility-aware surfaces.
- **No universal erasure claim.**

---

## 21. Rejected / Not-Completed State

Presentation `not_completed` with **safe category mapping** from closed resolution codes:

| Resolution code | Safe user category (conceptual) | Retry / support |
|-----------------|----------------------------------|-----------------|
| `invalid_request` | Request could not be processed | Correct and resubmit if appropriate |
| `duplicate_request` | Request already recorded / in progress | Link to existing request |
| `unauthorized_request` | Cannot process request | Support if unexpected |
| `already_completed` | Already applied to selected data | New request only if policy allows |
| `execution_failed` | Could not complete processing | Support; **no user retry execution** |

Do **not** show operator notes, SQL errors, or raw `resolution_code` strings unless mapped and approved.

---

## 22. Empty and No-Request States

| State | Safe next action |
|-------|------------------|
| No prior request | CTA to start first request |
| No eligible scans | Explain; suggest account-wide if valid or return to dashboard |
| No eligible evidence targets | Explain; choose other scope or support |
| No request history | Empty list copy + start CTA |
| No active request on “current” | Explain none in progress + link to start |

Each state offers a ** constructive next step**, not a dead end.

---

## 23. Request History View

- **Ownership-only** list for authenticated user.
- **Order:** newest first (align with API contract pagination).
- **Row content:** compact presentation status, scope label, received timestamp, detail link.
- **Pagination / load-more** concept for long histories.
- **No operator details** or execution attribution.
- **No** internal UUID wall unless needed; prefer human-readable scan/date summary in detail.

---

## 24. Request Detail View

Show:

- Request identifier (support-friendly)
- Scope + safe target summary
- Received time
- Current presentation status
- Validation milestone timestamp when `in_progress`
- Terminal outcome when `completed` or `not_completed`
- Residual notice
- Support action (contact privacy)

Hide raw lifecycle internals, execution row counts, and operator identity.

---

## 25. Operator UI Boundary

Future operator experience (conceptual only — **not** a final admin product design):

| Capability | Boundary |
|------------|----------|
| Queue | Server-mediated list of `received` / in-progress requests |
| Request detail | Scope, targets, requester email (internal), timestamps |
| Validation action | Sets milestone or rejects with closed code |
| Execution action | High-risk confirm; server-derived targets only |
| Conflict / stale-state | Refresh before act; no blind retry |
| Evidence capture | Audit logs; not shown to end users |
| Attribution | **No arbitrary caller-supplied rows** |
| Credentials | **No browser service-role** |

Operator authorization mechanism remains **unresolved** (Section 41). Operator UI is **desktop-first** if later approved.

---

## 26. Operator Validation Flow

1. Load request by id (server).
2. Review scope and ownership (automated checks + human review).
3. Confirm eligibility preconditions.
4. **Validate** — set `validated_at` on `received` **or** **reject** with closed `resolution_code`.
5. Accepted rejection categories: `invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed` (pre-execution).
6. Confirmation step before commit.
7. Audit evidence with operator identity.
8. **Stale-state handling:** if state changed since load, abort with conflict; re-read.

---

## 27. Operator Execution Flow

1. **Explicit high-risk confirmation** — restate scope and derived targets.
2. **Server-derived affected targets** — especially account-wide enumeration before atomic transaction.
3. **No caller-supplied attribution** — rows computed in orchestrator.
4. **Atomic execution** — primitives + attribution + terminal transition in one transaction where required.
5. **No blind retry** after failure or ambiguity — re-read status, investigate.
6. **Ambiguous result** → status re-read, not second execute.
7. **Terminal outcome evidence** in logs.
8. **F-P2-3:** all account-wide attribution in original transaction — no post-terminal append workflow.

---

## 28. F-P2-3 UI and Workflow Enforcement

Binding for future UI and operator tools:

- **No UI action** to append attribution after terminal `executed` for account-wide scope.
- **No “add missing item later”** button or batch fix flow.
- **No worker/operator flow** may schedule post-terminal attribution.
- Account-wide affected targets **derived before** atomic execution begins.
- **Database capability ≠ UI/workflow authorization.**
- Future UI/integration tests must **assert absence** of post-terminal attribution actions in application code.

---

## 29. Error Message Architecture

Map to safe UI categories (align with API contract):

| Category | User posture |
|----------|--------------|
| Unauthenticated | Sign in required |
| Forbidden | Cannot access |
| Invalid input | Check form |
| Ownership mismatch | Cannot process (non-disclosing) |
| Duplicate | Existing request — view status |
| Already completed | Already applied |
| Rate limited | Try later |
| Conflict | Refresh status |
| Execution failed | Support contact |
| Ambiguous result | Verify status before retry |
| Generic internal error | Something went wrong |

Never expose SQLSTATE, stack traces, database names, secrets, or operator notes.

---

## 30. Retry and Recovery UX

| Scenario | UX |
|----------|-----|
| Intake failure (safe) | Correct input; resubmit with new idempotency key if needed |
| Idempotent replay | Show original success |
| Network interruption on submit | Prompt status re-read; do not assume failure or success |
| Ambiguous result | Link to current status |
| Operator support | Privacy/support contact |
| Execution failure | User cannot retry execution — support/operator only |
| Duplicate destructive requests | Prevent via UI state + server duplicate policy |

---

## 31. Rate-Limit and Abuse UX

- Calm **rate-limit message**; no accusatory tone.
- Show **retry-after** guidance when API provides it.
- Repeated abuse handled server-side; **do not expose** operator endpoint protections to ordinary users.
- **Numeric limits not set** in this document.

---

## 32. Privacy and Residual Disclosure

UI must disclose (in entry, confirmation, completed, and detail surfaces) that governed completion **does not guarantee** removal of:

| Residual | Disclosure intent |
|----------|-------------------|
| VPS image binaries | May persist per storage boundary |
| Image references in payloads | May persist until separate policy |
| localStorage / device caches | User device may retain copies |
| Exports / downloads | User-held copies unaffected |
| Email | Messages already sent |
| Logs / audit records | Retained for security/governance |
| Cached summaries / CDN | Infrastructure copies may lag |
| AI-derived artifacts outside excluded rows | Scope-limited effect |
| Backups | Restore/retention processes may retain |

UI must **not claim universal erasure.** Wording finalized in later content design.

---

## 33. Accessibility Requirements

- Full **keyboard navigation** through scope, targets, confirmation, submit.
- **Focus management** on step transitions and after submit result.
- **Semantic labels** for scope radios/selects and confirmation control.
- **Visible focus** rings (terracotta focus token per design system).
- **Error association** with fields via `aria-describedby`.
- **Screen-reader announcements** for status changes on confirmation/detail.
- **No color-only status** — text/icon for `pending_review`, `in_progress`, `completed`, `not_completed`.
- **WCAG AA contrast** on warm surfaces.
- **Destructive confirmation** reachable and readable without relying on color alone.
- **`prefers-reduced-motion`** respected for transitions.
- **Mobile readability** — minimum touch targets, readable type scale.

---

## 34. Localization Requirements

- **Internal vocabulary** (`request_scope`, API paths, presentation status keys) stays language-independent.
- **Presentation copy** localized per locale strategy.
- **Croatian, English, German** compatibility with platform direction (`docs/11_DATA_MODEL.md`, architecture docs).
- **No text baked into images** for status or instructions.
- **Dates/times localized** (today `hr-HR` pattern in history pages is precedent).
- **User-safe resolution messages** localized; codes remain internal.
- **Route/API vocabulary stable** across locales.

No translations authored in this task.

---

## 35. Responsive and Mobile Flow

- **Mobile-first single column** for entry, confirm, status, history.
- **Thumb-safe** primary actions; adequate spacing above destructive confirm.
- **Sticky or persistent** primary action on long forms where appropriate.
- **Accidental destructive tap** mitigation — confirmation + non-destructive default focus.
- **Status cards** stack vertically; readable badges.
- **History pagination** as load-more on mobile.
- **Operator UI** remains desktop-first if approved later.

Note: `components/app-sidebar.tsx` hides sidebar below `xl`; mobile users rely on dashboard content and header profile — plan account menu entries accordingly.

---

## 36. Design-System Alignment

Reference: `docs/SKININTEL_DESIGN_SYSTEM_V1.md` and live patterns in `app/page.tsx`, `app/auth/login/page.tsx`.

Preserve:

- Warm ivory `#FBF6F0`, terracotta `#D9734E`, peach/champagne surfaces, charcoal text, muted sage **for success only**
- Premium wellness tone; calm errors
- No clinical/alarm styling; no generic admin-template for user-facing deletion flows

Do **not** redesign the entire application or unrelated dashboard template cards.

---

## 37. Content and Copy Boundaries

Copy must be:

- Factual, neutral, non-accusatory
- No legal claims beyond approved policy pages
- No universal deletion promise
- No internal jargon (RLS, primitives, attribution)
- No medical language
- No manipulative friction or false urgency

Final wording is a **later content-design step** after this flow design is accepted.

---

## 38. Analytics and Observability Boundary

Conceptual UI events only (no new DB columns; no new vendor):

| Event | Purpose |
|-------|---------|
| Deletion entry viewed | Funnel discoverability |
| Scope selected | UX optimization |
| Submit attempted | Conversion |
| Submit accepted / rejected | Outcome rates |
| Status viewed | Engagement |
| Support opened | Help path usage |
| Operator validate / execute initiated | Operator audit (internal) |

**No sensitive payload logging** (targets ok as redacted categories only). Correlation ids in logs per plan/technical design.

---

## 39. UI Test Matrix

Future UI tests (separate from Block A/B database verification):

| Area | Cases |
|------|-------|
| Auth | Redirect when logged out; session email used |
| Identity | No email input field for authority |
| Scope | All three scopes; disabled evidence when gated |
| Targets | Conditional pickers; empty states |
| Intent | Submit blocked until confirmed |
| Submit | Double-submit prevention; success path |
| Errors | Conflict, ambiguous, rate limit messaging |
| Status mapping | All presentation statuses |
| Privacy | No cross-user data in list/detail |
| History/detail | Ownership-only |
| a11y | Keyboard, labels, focus, announcements |
| Mobile | Layout, tap targets |
| i18n readiness | Keys/externalized copy hook points |
| F-P2-3 | No post-terminal attribution UI |
| Truthfulness | Residual messaging present on completed |
| Environment | No PROD interaction in tests |

---

## 40. Implementation Decomposition

Future smallest safe UI packages (**not authorized** by this document):

| # | Package | Scope | Dependencies / gates |
|---|---------|-------|----------------------|
| 1 | Stub/link reconciliation | Fix `app/page.tsx` footer; deprecate stub UX | UI package approval; no false success |
| 2 | User entry + scope selection | Form screens + API client to `POST /api/deletion-requests` | DEV gate, migration, Block A, API implemented |
| 3 | Submission state handling | Loading, errors, idempotency | API contract + rate limit policy |
| 4 | Confirmation + status | Received view + current status | GET current API |
| 5 | History + detail | List + detail views | GET collection + by id |
| 6 | Operator validation UI boundary | Minimal internal validate actions | Operator auth resolved |
| 7 | Operator execution UI boundary | Execute confirm + conflict handling | Operator auth + orchestrator |
| 8 | a11y + localization polish | WCAG + copy hooks | Content design |
| 9 | Residual messaging integration | Cross-surface disclosure | Residual policy recorded |

---

## 41. Open Decisions

Unresolved UI decisions only — **do not resolve without evidence:**

- Primary **page route** / location for entry and status
- **Account/settings** structure (no repo page today)
- Exact **scope labels** in Croatian/English/German
- **Evidence-specific** availability in first UI release
- **Duplicate request** presentation vs idempotent replay UX
- **Idempotency key** presentation (header vs hidden client handling)
- **Operator interface** location and authorization UI
- **Notification** behavior (email/in-app) on status change
- **Support escalation** paths and copy
- Exact **residual** copy blocks
- Exact **localization** content and `html lang` strategy vs product locales
- Footer stub: redirect target vs remove link until ready
- Status **polling** interval vs manual refresh only

---

## 42. Implementation Preconditions

UI implementation remains **prohibited** until all hold:

- Separate SkinIntel **DEV** Supabase project exists and is verified
- Phase 2 Slice 2 **migration applied to DEV**
- **Block A PASS**
- **Block B** separately authorized and PASS if required
- Application Deletion Pathway **Technical Design** accepted
- **API Contract Design** accepted
- **This UI Flow Design** accepted
- **Route implementation package** approved
- **Operator authorization** accepted
- **Residual policy** recorded
- **Security review** accepted
- **Exact execution baseline** Git SHA approved

---

## 43. Hard Stops

Stop UI/API work if:

- DEV project unresolved or PROD denylist match (`docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md`)
- Migration unapplied on target environment
- Block A failure
- API contract not accepted
- UI asks user to type **authoritative email**
- Client **service-role** exposure
- Presentation invents a **fourth DB state**
- **Completed** state overclaims universal erasure
- **Post-terminal attribution UI** exists (F-P2-3 violation)
- **Ownership privacy** unclear in list/detail/history
- **Accessibility blocker** unresolved
- **Legal/retention ambiguity** shown as resolved
- **Scope creep** into account deletion, billing, or auth identity removal

---

## 44. Current Authorization Boundary

**Authorized now:**

- Creation and review of this UI Flow Design document

**Not authorized:**

- UI implementation
- Route implementation
- API changes
- SQL changes
- Migration execution
- Block A / Block B
- Supabase contact
- DEV / PROD changes

---

## 45. Next Safe Design Step

After acceptance of this UI Flow Design, the next safe design step is:

**Phase 2 Slice 2 — Application Deletion Pathway Security and Abuse Design**

That step remains **documentation-only** unless separately authorized. It should address rate limiting, abuse detection, CSRF/session posture for submission, operator authorization, and idempotency store choices without implementing routes or SQL.

---

*Repository baseline for authoring: branch `main`, HEAD `b943016266fe00deb8a5b5e13e7d0825d72694bf` (per task specification). DEV execution gate: BLOCKED.*
