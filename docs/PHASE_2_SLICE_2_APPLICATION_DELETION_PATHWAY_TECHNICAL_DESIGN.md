# Phase 2 Slice 2 — Application Deletion Pathway Technical Design

- Status: Draft — technical design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- API implementation: not authorized
- UI implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future application architecture** for governed user deletion requests on SkinIntel, translating the accepted Application Deletion Pathway Plan into precise component boundaries, trust zones, sequences, and enforcement rules.

It preserves the **committed database contract** in `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` without altering persistence vocabulary, invariants, privileges, or guards.

This artifact does **not** authorize API implementation, UI implementation, SQL changes, migration execution, Block A/B, Supabase contact, or DEV/PROD changes. Application work that depends on the unapplied migration remains prohibited while the DEV execution gate is blocked.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| Artifact | Role |
|----------|------|
| `docs/PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md` | Slice perimeter and exclusions |
| `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Lifecycle consumer and failure principles |
| `docs/PHASE_2_SLICE_2_MIGRATION_DESIGN.md` | Persistence categories and integrity principles |
| `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Exact table/column/state design |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` | Application pathway scope and obligations |
| `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` | Controlled DEV apply and stop rules |
| `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` | DEV gate BLOCKED disposition |
| `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Committed migration contract |

### Precedence (binding)

1. **Committed migration contract** controls persistence vocabulary, CHECKs, transition rules, deferred consistency, RLS/grants, and attribution cardinality.
2. **Accepted application pathway plan** controls application scope, F-P2-3 obligation, residuals, and hard stops.
3. **This technical design** controls future application structure, sequences, and component responsibilities only.
4. Later implementation **must not** silently change database semantics, invent scopes/states/codes, or weaken trust boundaries.

---

## 3. Current Repository State

Read-only inspection of the deletion-related application surface. Claims below cite exact paths. No inspected file was modified.

### 3.1 Deletion API stub

| Path | Current responsibility | Assessment | Gap vs target |
|------|------------------------|------------|---------------|
| `app/api/delete-request/route.ts` | `POST` handler parses optional `body.email` and `body.message`, discards them (`void`), returns `{ success: true, message: "Delete request received" }` even on parse failure | **Unsafe / incomplete / non-authoritative stub** | No authentication; accepts **client-supplied email**; no durable intake; no scope/target validation; no ownership checks; no audit; always success; does not use NextAuth or Supabase governance tables |

### 3.2 User entry / privacy surfaces

| Path | Current responsibility | Assessment | Gap vs target |
|------|------------------------|------------|---------------|
| `app/page.tsx` | Marketing footer link `href="/api/delete-request"` labeled “Delete Request” | **Incomplete / unsafe discoverability** | Issues a **GET** navigation to a **POST-only** route; no form, confirmation, or status UI |
| `app/privacy/page.tsx` | Static privacy policy; deletion guidance is email to `privacy@skinintel.ai` | **Incomplete relative to governed pathway** | No authenticated request form, status view, or scope selection |
| Settings / account privacy UI | **No `settings` route or page found** under `app/` | **Absent** | Target privacy/settings entry points do not exist |

### 3.3 Authentication and session

| Path | Current responsibility | Assessment | Gap vs target |
|------|------------------------|------------|---------------|
| `auth.ts` | NextAuth configuration; exports `{ handlers, signIn, signOut, auth }`; Credentials + Google + GitHub providers | **Authoritative auth helper for the app** | Must be reused; no replacement auth system |
| `app/actions/index.ts` | Server actions using `auth()` and `session.user.email` for ownership filters on reads/writes | **Authoritative identity pattern for server data access** | Deletion pathway must follow same `auth()` → email derivation pattern |
| `app/api/scan/route.ts` | Authenticated API pattern: `const session = await auth()`; rejects without `session.user` / email; uses service-role Supabase client; rate limit via `checkScanRateLimit` | **Best current authenticated API reference** | Deletion submission must adopt equivalent auth and safe error patterns; must not copy client-email intake |
| `middleware.ts` | `auth` wrapper; redirects unauthenticated users for matcher `/dashboard/:path*`, `/history`, `/history/:path*` only | **Partial route protection** | Does **not** protect `/api/*`; API auth must remain in-handler |
| `proxy.ts` | Alternate/proxy auth gate; explicitly skips paths starting with `/api` | **Unrelated to API auth enforcement** | Must not be treated as API protection for deletion operations |

### 3.4 Supabase helpers

| Path | Current responsibility | Assessment | Gap vs target |
|------|------------------------|------------|---------------|
| `lib/supabase.ts` | Browser/anon client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Client-safe anon helper only** | Must never receive service-role; not suitable for governance writes |
| Inline `createClient` in `app/api/scan/route.ts`, `app/actions/index.ts`, history pages, etc. | Server-side clients using `process.env.SUPABASE_URL` + `process.env.SUPABASE_SERVICE_ROLE_KEY` | **Current service-role pattern (server-only env)** | Future deletion DB adapter should remain server-only; no new client exposure of service role |

### 3.5 Rate limiting and validation conventions

| Path | Current responsibility | Assessment | Gap vs target |
|------|------------------------|------------|---------------|
| `lib/rateLimit.ts` | Upstash Redis scan rate limit (`checkScanRateLimit`); fail-open if Redis missing | **Scan-specific only** | Deletion needs a separately planned authenticated rate-limit policy |
| `lib/zod.ts` | Shared Zod schemas (e.g. login) | **Unrelated to deletion DTO today** | Future validation may reuse Zod style; not designed here as code |
| `app/api/interest/route.ts` | Unauthenticated lead capture accepting client `email` | **Unrelated lead pathway** | Must not be used as a template for deletion identity |

### 3.6 Error-response convention (observed)

Authenticated APIs such as `app/api/scan/route.ts` commonly return JSON `{ error: "<user-safe string>" }` with HTTP status codes `401`, `403`, `400`, `413`, `429`, `500`. Internal details go to `console.error`. Target deletion operations should preserve this **user-safe external / detailed internal** split without inventing a new public error dialect in this design.

### 3.7 Explicit identity risk

Current stub at `app/api/delete-request/route.ts` reads `body.email`. That is **untrusted client identity input**. Target design forbids using client-supplied email as requester identity.

---

## 4. Target Architecture Overview

Future logical components (responsibilities only; no code):

| Component | Responsibility |
|-----------|----------------|
| **Authenticated user UI boundary** | Collect allowed scope/target/intent; show confirmation and status; never hold service-role secrets |
| **Deletion request submission operation** | Authenticated intake creating only a `received` governance row |
| **Request-status query operation** | Ownership-scoped latest/history/direct reads with safe presentation mapping |
| **Operator validation service** | Server/operator-only milestone (`validated_at`) or rejection with closed `resolution_code` |
| **Operator execution orchestrator** | Atomic service-role execution of lifecycle effects + attribution + terminal state |
| **Database access adapter** | Server-only access to `deletion_requests` / `deletion_request_executions` under migration privileges |
| **Authorization and ownership guard** | Session identity derivation; target ownership verification; actor authorization for operator ops |
| **Audit/evidence emitter** | Structured logs/events with correlation IDs; no new DB columns |
| **Error mapper** | Internal categories → user-safe messages and HTTP statuses |
| **Future storage-residual coordinator** | Explicit non-implemented boundary for binaries/exports/localStorage/etc. |

---

## 5. Trust Boundary Model

| Zone | May do | Must not do |
|------|--------|-------------|
| **Browser/client** | Submit allowed DTO fields; display status; confirm intent | Hold service-role key; write execution rows; set state/timestamps/`user_email`; invoke primitives |
| **Authenticated Next.js server boundary** | Call `auth()`; derive identity; validate input; invoke service-role adapter; map errors | Trust client identity; expose operator notes or SQLSTATE to users |
| **Service-role / server-only boundary** | Insert `received`; update workflow columns; insert attribution; invoke lifecycle primitives under orchestration | Run in browser; accept unauthenticated callers |
| **Authorized operator boundary** | Trigger validate/execute via server-controlled interfaces | Act without attributable identity; bypass atomic execution |
| **Database governance boundary** | Enforce CHECKs, transition guard, deferred consistency, RLS | Be bypassed by application “soft” success |
| **Future worker boundary** (if later approved) | Perform queued work under same invariants | Append post-terminal attribution; execute without atomic transaction |

---

## 6. Identity and Authentication Contract

**Target design:**

- User identity for deletion requests is derived **only** from the authenticated server session via `auth()` exported from `auth.ts`, consistent with `app/api/scan/route.ts` and `app/actions/index.ts`.
- **Client-supplied email is ignored or rejected**; it must never become `user_email` on `deletion_requests`.
- Canonical requester identity is `session.user.email` when present; absence of email is an authentication failure for this pathway (same hard requirement as scan persistence, which rejects missing email).
- Normalization for comparison/ownership must follow repository conventions: migration RLS uses `lower(user_email) = lower(auth.jwt() ->> 'email')`; scan storage path segment uses `authenticatedEmail.trim().toLowerCase()` in `app/api/scan/route.ts`. Application ownership checks must be case-insensitive-safe and consistent with stored `user_email` values.
- Ownership of scan/evidence targets is verified **server-side** against governed tables before durable intake eligibility and again at validation/execution.
- Service-role credentials remain server environment secrets (`SUPABASE_SERVICE_ROLE_KEY`), never `NEXT_PUBLIC_*`.
- Operator actions must record attributable operator identity in audit events.

**Current repository state:** NextAuth via `auth.ts`; no replacement auth system is designed or authorized.

**Unresolved:** exact operator authorization mechanism (role, allowlist, or separate admin surface) — see Section 28.

---

## 7. Domain Vocabulary Mapping

Application concepts map **exactly** to the committed migration vocabulary. No additions.

### Request scopes

- `account_wide`
- `scan_specific`
- `evidence_specific`

### Request states

- `received`
- `executed`
- `rejected`

### Validation milestone

- Database field: `validated_at` (nullable timestamp).
- Presentation label “validated” / “in progress” may describe `received` + non-null `validated_at`.
- **Not** a fourth `request_state` value.

### Resolution codes (exact closed set)

| Code | When |
|------|------|
| `completed` | With `executed` only |
| `invalid_request` | Rejection |
| `duplicate_request` | Rejection |
| `unauthorized_request` | Rejection |
| `already_completed` | Rejection |
| `execution_failed` | Rejection |

`received` requires `resolution_code` null.

---

## 8. Request DTO Boundary

### Conceptual accepted user input

- `request_scope` (closed set above)
- Target scan identifier **only when** scope requires it (`scan_specific`; parent session for `evidence_specific`)
- Evidence table + evidence id **only when** `evidence_specific` (whitelist: `user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence`)
- Intent confirmation (application boolean/acknowledgement; not a new DB column)
- Optional non-persisted explanatory text **only if later approved** (migration has no payload column; current stub’s `message` must not be assumed persisted)

### Forbidden client fields

- `id`
- `user_email`
- `request_state`
- `resolution_code`
- `validated_at`
- `resolved_at`
- `requested_at` / `created_at` / `executed_at`
- Execution attribution payloads
- Affected table/row identifiers beyond allowed scope targets
- Operator identity
- Any lifecycle timestamps or server-controlled fields

No TypeScript interfaces or schemas are defined in this document.

---

## 9. Scope Validation Matrix

### `account_wide`

| Aspect | Design |
|--------|--------|
| Required target input | None; all target columns null |
| Forbidden target input | Any scan/evidence identifiers |
| Ownership validation | Authenticated account identity only |
| Submission eligibility | Authenticated; structural scope valid; duplicate policy (Section 12) |
| Attribution behavior | One execution row per excluded session anchor; all in original atomic execution transaction (F-P2-3) |
| User-safe explanation | Request covers governed eligibility across the account’s scan/evidence; not universal erasure |
| Unresolved | Exact enumeration strategy at execution (ordering of session list) remains implementation detail under atomicity rule |

### `scan_specific`

| Aspect | Design |
|--------|--------|
| Required target input | `target_scan_record_id` |
| Forbidden target input | Evidence table/id |
| Ownership validation | Target session exists and `user_email` matches authenticated identity |
| Submission eligibility | Structural shape valid; ownership verified before or at durable intake policy point |
| Attribution behavior | Exactly one execution row matching target |
| User-safe explanation | One scan session and governed children via session propagation; not binary deletion |
| Unresolved | None beyond duplicate-active policy |

### `evidence_specific`

| Aspect | Design |
|--------|--------|
| Required target input | Parent scan id + whitelist table + evidence id |
| Forbidden target input | Missing any of the three; non-whitelist table |
| Ownership validation | Evidence and parent session owned by authenticated user |
| Submission eligibility | Structural CHECK shape; ownership verified |
| Attribution behavior | Zero session execution rows on `executed` per migration contract |
| User-safe explanation | One evidence item; session attribution table not used for this scope |
| Unresolved execution behavior | First Slice 2 lifecycle consumer in the slice technical design is session-level exclusion; evidence-specific **execution consumer activation** remains a gated later step even though intake shape is first-class in the migration |

No new scopes or columns.

---

## 10. Submission Sequence

Future server-side order (exact):

1. **Authenticate** — `auth()`; reject if no authenticated user/email.
2. **Derive canonical identity** — server-derived email; ignore/reject client email.
3. **Parse and validate allowed input** — reject unknown fields / forbidden server-controlled fields.
4. **Validate scope/target matrix** — structural rules matching migration CHECK matrix.
5. **Verify target ownership** where scope requires targets.
6. **Evaluate duplicate/idempotency posture** (Section 12).
7. **Create received request only** — service-role insert: `request_state = received`, null resolution/validation/resolution timestamps as required by INSERT posture; database defaults for `requested_at`/`created_at`.
8. **Capture audit evidence** — submission accepted event with correlation/request id.
9. **Return safe response** — request id + presentation status only.

**Transaction expectations (conceptual):** durable intake insert is a single write of a `received` row. Ownership lookups precede insert. Validation milestone and execution are **not** part of submission. If intake insert fails, no false success response.

---

## 11. Request Read and Status Sequence

| Read mode | Design |
|-----------|--------|
| Latest / current | Ownership-scoped: most recent request for authenticated email |
| History | Ownership-scoped list ordered by `requested_at` descending |
| Direct lookup | By request id **and** ownership match; otherwise not found / forbidden |
| Presentation mapping | Map DB state + `validated_at` to user labels (pending / validated milestone / completed / not completed) |
| Execution rows | **Not** exposed to users by default; authenticated policies on executions are service-role-only in migration for this slice |
| Operator-only details | Never included in user responses (`resolution_code` may be mapped to category copy, not raw internal notes) |

Reads may use authenticated ownership-scoped SELECT on `deletion_requests` per migration RLS, or equivalent server mediation that preserves the same ownership predicate. Preference in future implementation must not widen privilege beyond the migration contract.

---

## 12. Duplicate and Idempotency Design

| Scenario | Control |
|----------|---------|
| Double click | UI disable-on-submit + server idempotency token / short-window fingerprint |
| Repeated HTTP request | Same idempotency key returns prior safe response when intake already succeeded |
| Browser retry / network timeout | Client re-reads status; server treats ambiguous post-timeout as status lookup, not second execute |
| Duplicate scan-specific target | Application query for non-terminal matching scope/target; reject or return existing per policy |
| Active account-wide request | Application policy for at most one non-terminal account-wide request (policy value open) |
| Already completed | New row allowed (append-oriented); post-intake validation may reject with `already_completed` if lifecycle already excluded |

**Separation of controls:**

| Layer | Role |
|-------|------|
| Request fingerprint / idempotency concept | Application/transport; not a new DB column unless later approved |
| Application transaction checks | Pre-insert queries and workflow decisions |
| Existing database constraints | Attribution uniqueness `(deletion_request_id, scan_record_id)`; state/resolution coupling; **no** active-request uniqueness constraint |
| Unresolved workflow policy | Exact “reject vs return existing” for duplicate active requests |

Do **not** invent a database uniqueness constraint for active requests.

---

## 13. Validation Service Design

Future operator/server validation operation:

1. Load request under **server/service-role authority**.
2. Verify current state is `received` and not already terminal.
3. Verify ownership / authority for the operator action.
4. Validate scope and target existence/ownership/active preconditions.
5. Evaluate duplicate / already-completed conditions.
6. On success: perform permitted `received` → `received` milestone update setting `validated_at` once.
7. On failure: transition `received` → `rejected` with an accepted closed `resolution_code` (`invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed` as applicable); do not invent codes.
8. Capture operator identity and audit evidence.
9. Return no sensitive internal details to end users.

**Unresolved:** legal-retention / hold exceptions remain unresolved and must not be treated as implemented policy.

---

## 14. Execution Orchestrator Design

- Execution is **service-role / server-only**.
- Conceptually re-read request after acquiring workflow authority; refuse if not eligible (`received` with successful validation milestone as required for `executed`).
- All governed lifecycle actions and required attribution inserts occur **inside one atomic transaction** with the terminal transition to `executed` / `completed`.
- Terminal `executed` only after all required actions succeed and deferred consistency can pass.
- On failure: no silent success; transition to `rejected` with `execution_failed` when appropriate, or leave non-terminal only if no partial durable governance claim was committed (prefer fail-closed rollback).
- No client execution pathway.
- No blind retry after failure or ambiguous result.
- No post-terminal attribution append (F-P2-3).

No SQL statements are described here.

---

## 15. F-P2-3 Enforcement Design

**Binding application invariant:**

- Every intended **account-wide** attribution row is created in the **original atomic execution transaction**.
- No application path, worker, retry process, or operator workflow may append attribution after terminal `executed`.
- Database capability (accepted residual that later service-role insert may still be possible) **≠** application authorization.
- Future service/integration tests must assert: orchestrator never schedules or performs post-terminal attribution; account-wide execution packs all intended rows before commit.
- No database redesign or temporal freeze is authorized in this task.

---

## 16. Transaction and Concurrency Design

Conceptual plan only; no invented DB primitives beyond the migration:

| Concern | Design |
|---------|--------|
| Transaction ownership | Execution orchestrator owns the single atomic DB transaction for lifecycle + attribution + terminalization |
| Lock ordering | Load/lock request row before mutating; then lifecycle effects; then attribution; then terminal update |
| Re-read after lock | Confirm still `received` and validated before execute |
| Duplicate concurrent submissions | Idempotency + application duplicate checks; both may insert without DB uniqueness — policy must define conflict handling |
| Concurrent validation | Second validation attempt must fail if milestone already set or state terminal |
| Concurrent execution | Second attempt must observe terminal/non-eligible state and stop |
| Retry after ambiguous result | Prohibited for execution; status re-read + operator review |
| Stale state detection | Compare expected state/version timestamps conceptually via re-read fields (`request_state`, `validated_at`, `resolved_at`) |
| Terminal state protection | Migration transition guard forbids leaving `executed`/`rejected` |

---

## 17. Privilege and Credential Design

| Pathway | Privilege |
|---------|-----------|
| User submission | Authenticated server mediates insert via service-role (migration: authenticated has **no** INSERT policy on `deletion_requests`) |
| User read | Ownership-scoped SELECT on own `deletion_requests` (migration RLS) or equivalent server mediation |
| Workflow mutations | Service-role constrained UPDATE on approved workflow columns only |
| Execution table | Service-role INSERT/SELECT only; **no** client writes; append-only for application workflow |
| Client bundle | Only anon public keys (`lib/supabase.ts`); never service-role |
| Environment secrets | `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL` server-only; redacted from logs/responses |
| Operator access | Separated from end-user APIs; attributable |
| Future worker | If approved, same server secret posture and F-P2-3 rules |

Preserve the migration privilege contract without widening grants.

---

## 18. API Operation Design

Logical operations only. Route paths are **not** finalized (existing stub path `/api/delete-request` is non-authoritative).

### Submit request

| Field | Design |
|-------|--------|
| Actor | Authenticated user |
| Authentication | Required (`auth()`) |
| Input boundary | Allowed DTO only (Section 8) |
| Output boundary | Request id + safe status |
| Error categories | Unauthenticated, invalid, ownership, duplicate, rate limit, internal |
| Audit event | submission attempted / accepted / rejected |
| Idempotency | Fingerprint/key recommended; no blind double insert when key replays |

### Get latest / current status

| Field | Design |
|-------|--------|
| Actor | Authenticated owner |
| Authentication | Required |
| Input | None or optional request id |
| Output | Safe presentation fields |
| Errors | Unauthenticated, not found/forbidden |
| Audit | Optional read audit at debug/info level |
| Idempotency | Read-only; naturally idempotent |

### List own request history

| Field | Design |
|-------|--------|
| Actor | Authenticated owner |
| Authentication | Required |
| Input | Pagination cursor/limit (conceptual) |
| Output | Safe list items |
| Errors | Unauthenticated, invalid pagination |
| Audit | Optional |
| Idempotency | Read-only |

### Validate request

| Field | Design |
|-------|--------|
| Actor | Authorized operator via server |
| Authentication | Operator authorization required |
| Input | Request id |
| Output | Safe operator acknowledgement |
| Errors | Forbidden, conflict, invalid, already terminal |
| Audit | validation started/completed/rejected + operator id |
| Idempotency | Milestone set-once; repeats fail closed |

### Execute request

| Field | Design |
|-------|--------|
| Actor | Authorized operator / supervised server process |
| Authentication | Operator authorization required |
| Input | Request id |
| Output | Safe completion/failure category |
| Errors | Conflict, execution failed, ambiguous → operator review |
| Audit | execution started/completed/failed + attribution counts |
| Idempotency | No blind retry; terminal protection |

No payload schemas or code.

---

## 19. Error Contract

| Internal category | User-safe mapping | Notes |
|-------------------|-------------------|-------|
| Unauthenticated | Unauthorized / sign-in required | HTTP 401 style |
| Forbidden / ownership mismatch | Cannot process request | No target leakage |
| Invalid request | Invalid request | Structural/DTO failures |
| Duplicate request | Request already in progress / already recorded | Per policy wording |
| Already completed | Cannot apply; eligibility already removed | Mapped from `already_completed` |
| Validation rejected | Request could not be completed | Category copy only |
| Execution failed | Request could not be completed; support path | Operator review required |
| Timeout | Check status or try later | No auto-execute retry |
| Conflict / concurrency | Temporary conflict; check status | |
| Ambiguous server result | Check status / contact support | No blind execute retry |
| Internal failure | Internal error | Log details server-side only |

**Never expose to users:** SQLSTATE, internal table/column names, service credentials, stack traces, operator notes, raw primitive errors.

---

## 20. Rate Limit, CSRF, and Abuse Controls

Planning targets only (not implemented here):

- Authenticated rate limiting for submission and status polling (separate from `lib/rateLimit.ts` scan keys, or an analogous Upstash pattern).
- Double-submit prevention (UI + idempotency key).
- CSRF/session protections consistent with existing NextAuth cookie session architecture used by `auth.ts` / dashboard SessionProvider.
- Request-size constraints for JSON bodies.
- Replay handling via idempotency keys and status re-reads.
- Operator validate/execute protection (authz + audit + rate limits).
- Audit of repeated abusive attempts (ownership mismatch / flood).

---

## 21. Observability and Audit Design

Conceptual events (application logs/telemetry; **no new DB columns**):

- submission attempted / accepted / rejected
- validation started / completed / rejected
- execution started / completed / failed
- attribution count
- affected-target count
- operator identity (privileged ops)
- request id and correlation id
- timestamps
- redacted error class

Evidence supports security review and DEV incident analysis without client exposure of secrets.

---

## 22. Privacy, User Messaging, and Truthfulness

- No claim that all external copies (VPS, exports, email, logs, caches) are deleted.
- No “everything deleted” confirmation.
- Clear distinction among received, validated milestone, executed, and rejected presentations.
- Storage/export/log/AI residuals remain explicit in confirmation copy.
- After `executed`, eligibility-aware surfaces must not continue presenting excluded evidence as active (Slice 1B path); legacy null-link analyses remain documented residual behavior.
- Educational/cosmetic platform posture unchanged; no diagnostic/medical claims in deletion UX.

---

## 23. Storage and External Residual Integration Boundary

This Slice’s DB migration and application pathway **do not automatically solve**:

| Residual | Boundary |
|----------|----------|
| VPS image binaries | Future storage governance |
| Stored image references/URLs | Future redaction policy |
| localStorage | Future client hygiene |
| Exports/downloads | Future product/retention decision |
| Emails | Future messaging governance |
| Logs / audit records | Persist by design / retention policy |
| Cached summaries | Future infra process |
| AI-derived artifacts outside excluded rows | Future scope definition |
| CDN or backup copies | Future infra/ops process |

A future storage-residual coordinator component is named only as a boundary; it is **not** implemented in this slice.

---

## 24. Testing Architecture

| Suite | Focus |
|-------|-------|
| Unit | Scope matrix, forbidden-field stripping, presentation mapping, error mapper |
| Server/service integration | Intake → `received`; validation milestone; atomic execute + attribution |
| Auth/ownership | Unauthenticated rejection; cross-user target rejection; session email derivation |
| Concurrency/idempotency | Double submit; concurrent execute; replay keys |
| F-P2-3 | Post-terminal attribution never scheduled/performed by application |
| Error-mapping | No secret/SQLSTATE leakage |
| UI | Confirmation, disable-on-submit, status states, truthful residuals copy |
| Block A | Separately authorized DB catalog verification |
| Block B | Separately authorized DB behavioral verification |

Block A/B remain database verification artifacts and are **not** substitutes for application tests.

---

## 25. Implementation Decomposition

Future smallest safe packages (**not authorized now**):

| # | Package | Dependencies / gates |
|---|---------|----------------------|
| 1 | Current deletion-route deprecation/replacement preparation | Design acceptance; stop treating stub as success pathway; footer link remediation later with UI package |
| 2 | Server-side domain validation | Vocabulary locked to migration |
| 3 | Authenticated submission operation | DEV migration applied; Block A PASS; secrets on DEV; service-role adapter |
| 4 | Ownership-scoped status reads | Package 3 tables available; auth patterns from `auth.ts` |
| 5 | Operator validation boundary | Operator authz decision resolved; Package 3 |
| 6 | Execution orchestrator | Packages 5; F-P2-3 tests; lifecycle primitive access; Block B if required by gate |
| 7 | Audit/observability | Cross-cutting with 3–6 |
| 8 | UI states | API contract + messaging truthfulness decisions |
| 9 | Residual integration work | Separate storage/export decisions; out of Slice 2 DB scope |

---

## 26. Implementation Preconditions

Implementation remains prohibited until **all** of the following:

- Separate SkinIntel DEV Supabase project exists and is verified
- Migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required by the implementation gate
- This technical design accepted
- Application Deletion Pathway API Contract Design accepted
- Storage residual decision recorded for user-facing promises
- Security review accepted
- Exact execution baseline approved at the execution gate

---

## 27. Hard Stops

Stop immediately if:

- DEV identity unresolved or conflated with PROD
- PROD denylist match under locked typed matching semantics (`rbukikinzyhyaixjvnhf` / `rbukikinzyhyaixjvnhf.supabase.co` / exact name `skinintel`)
- Migration unapplied on target environment
- Block A failure or unverified bypass
- Untrusted client identity accepted as `user_email`
- Ownership contract unclear
- Service-role key exposed to client/bundle
- Execution outside a single atomic transaction for required attribution
- Post-terminal attribution by application/worker/operator workflow
- Unclear idempotency result treated as success
- Storage deletion claims beyond evidence
- Legal/retention ambiguity treated as resolved
- Scope creep into account deletion or billing/subscription deletion

---

## 28. Open Decisions

Genuinely unresolved (not decided by this design):

1. Exact **duplicate-active-request** policy (reject new vs return existing id).
2. **Idempotency key** strategy (header vs body token; TTL; storage medium).
3. Optional **explanatory note** treatment (discard vs later-approved persistence).
4. **Operator interface** form (internal tool, scripted supervised run, or admin UI).
5. **Background worker** versus supervised synchronous execution.
6. **Storage residual** user-promise policy for binaries/exports/localStorage.
7. **Legal-retention** exception rules.
8. **Notification** strategy (email/in-app) for status changes.
9. Exact **API route naming** (whether to retire/replace `/api/delete-request` path).
10. Whether evidence-specific **execution consumer** is activated in the first application implementation package or deferred after session-level account/scan execution.

---

## 29. Current Authorization Boundary

**Authorized now:**

- Creation and review of this technical design document.

**Not authorized:**

- API implementation
- UI implementation
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 30. Next Safe Design Step

After acceptance, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway API Contract Design**

That step remains **documentation-only** unless separately authorized. It should finalize logical operation contracts, error envelopes, and idempotency headers/fields without implementing routes.

---

*End of Phase 2 Slice 2 — Application Deletion Pathway Technical Design.*
