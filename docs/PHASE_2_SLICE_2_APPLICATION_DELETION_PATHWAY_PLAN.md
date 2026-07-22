# Phase 2 Slice 2 — Application Deletion Pathway Plan

- Status: Draft — planning only
- Database dependency: migration not applied
- API implementation: not authorized
- UI implementation: not authorized
- Supabase contact: prohibited
- DEV execution gate: blocked
- PROD: strictly prohibited

---

## 1. Purpose

This document translates the accepted Phase 2 Slice 2 deletion-request governance model—defined in the Slice 2 implementation plan, technical design, migration design, SQL migration design, and the committed migration candidate—into a **future application-layer pathway** for user-initiated deletion requests.

It is **not** implementation. It does not authorize API work, UI work, database changes, migration execution, or Supabase contact. It defines how the application **should** orchestrate intake, validation, execution boundaries, user communication, and evidence capture **when** separately authorized, while remaining strictly compatible with the committed migration contract (`public.deletion_requests`, `public.deletion_request_executions`, closed vocabularies, transition guards, and deferred cross-table consistency rules).

Execution of any application deletion pathway remains **blocked** until a separate SkinIntel DEV Supabase project is provisioned, the Phase 2 Slice 2 migration is successfully applied to that DEV project, and subsequent implementation gates (including Block A and, where required, Block B) are satisfied per repository disposition records.

---

## 2. Scope

### In scope

- Future **authenticated user request submission** (durable intake as `received` only).
- Future **request status viewing** for the owning user (ownership-scoped read of governance metadata).
- Future **operator execution workflow boundary** (service-role/server-side progression; no client execution).
- **Request validation** (post-intake governance checks before lifecycle invocation).
- **Request identity and ownership** (server-derived `user_email`; verified ownership of targets).
- **User communication states** (neutral presentation of workflow progress and outcomes).
- **Audit and evidence expectations** (structured events and review artifacts; no new persistence columns).
- **Failure and retry posture** (non-destructive failures; no blind execution retry).
- **Application-layer enforcement of F-P2-3** (atomic account-wide attribution within the original execution transaction).

### Out of scope

- SQL changes, new tables, new migrations, Supabase execution, or verification SQL runs.
- Actual lifecycle primitive invocation design at the SQL level (primitives remain frozen Slice 8 capability).
- **Actual deletion implementation**: physical row deletion, image-storage deletion, export deletion, account deletion, billing/subscription cancellation.
- **localStorage cleanup**, client-side cache purge, or third-party email/content erasure.
- Admin UI implementation, notification delivery implementation, or final marketing copy.
- Redesign of Phase 1 governance contracts, Slice 1 eligibility read path, or existing API contracts beyond what a future gated implementation explicitly authorizes.

---

## 3. Actors and Trust Boundaries

| Actor | Role |
|-------|------|
| **Authenticated user** | Initiates a deletion request; views own request status; cannot progress workflow or execute exclusions. |
| **Application server** | Authenticates sessions; derives identity; validates intake shape and ownership; orchestrates service-role workflow steps; emits audit evidence. |
| **Service-role operator pathway** | Server-side only pathway using service-role database authority to insert/update governance rows and invoke exclusion primitives under approved workflow. |
| **Authorized human operator** | Person or role authorized to trigger validation and execution through server-controlled operator interfaces (not defined in this plan). |
| **Future background worker** | Optional future actor for queued processing **only if** separately approved; must not bypass atomic execution or F-P2-3 rules. |
| **Database governance layer** | Authoritative for persistence invariants: CHECK constraints, transition guard, deferred cross-table consistency, RLS/grants on new tables. |
| **Audit/evidence reviewer** | Reviews logs, verification outcomes, and governance records; not an runtime actor in the user pathway. |

**Trust boundaries (binding):**

- The browser/client **never** receives service-role credentials or direct write access to `deletion_request_executions`.
- The client **cannot** directly insert execution attribution rows or set terminal `request_state`, `resolution_code`, or governance timestamps.
- **Database governance** remains authoritative for what may persist; invalid transitions fail at the database even if application logic errs.
- The **application layer** remains responsible for correct **orchestration**: ordering of validation milestone, primitive invocation, attribution inserts, and terminal transition within a single atomic execution transaction where required.

---

## 4. User Entry Points

Future user-facing entry points (conceptual; no final UI design):

| Entry | Purpose |
|-------|---------|
| **Privacy / settings surface** | Discoverability of data-rights and evidence lifecycle options; link to deletion request flow. |
| **Deletion request form** | Collect scope and optional target identifiers; confirm intent. |
| **Confirmation step** | Explicit acknowledgment that the action requests governed evidence exclusion, not guaranteed erasure of all copies. |
| **Request status view** | Show current workflow presentation (see Section 8) for the user’s own requests. |

**Information the user may provide (aligned to migration columns only):**

- **Request scope**: one of `account_wide`, `scan_specific`, `evidence_specific`.
- **Optional scan-record target** (`target_scan_record_id` conceptually): required for `scan_specific`; required as parent session context for `evidence_specific`.
- **Optional evidence target** (`target_evidence_table`, `target_evidence_id`): required only for `evidence_specific`, from the closed evidence-table whitelist in the migration contract.
- **Confirmation of intent**: application-layer acknowledgment (not a new database column unless separately authorized).

**Explicitly not accepted from the user at submission (server-controlled or forbidden):**

- Request `id`, `request_state`, `resolution_code`, `validated_at`, `resolved_at`, `requested_at`, `created_at`.
- Execution rows or operator attribution fields.
- `user_email` differing from the authenticated identity (must be server-derived).

**Optional explanatory note:** A free-text user message is **out of scope** for the committed migration (no payload column). If product later requires a note, that requires a separately authorized schema and privacy review—not assumed here.

**Repository note:** A stub HTTP handler exists at `/api/delete-request` that currently accepts client-supplied email; future implementation must **not** treat that pattern as authoritative and must replace it with server-derived identity under a gated implementation step.

---

## 5. Request Scope Mapping

Application choices map **only** to the closed migration vocabulary.

### `account_wide`

| Aspect | Plan |
|--------|------|
| **Required user input** | Scope selection; confirmation of intent. All target columns must remain unset at persistence. |
| **Forbidden user input** | Any scan or evidence target identifiers; claims about other users’ data. |
| **Validation before submission** | Authenticated session present; scope structurally valid (null targets). |
| **Post-intake validation** | Confirm account ownership context; evaluate duplicate/active request policy (Section 7); prepare enumeration of active session anchors owned by the account for execution attribution. |
| **Execution attribution behavior** | On successful `executed`: one append-only row per excluded session anchor in `deletion_request_executions`; all intended rows **inside one atomic execution transaction** (F-P2-3). |
| **User-facing explanation** | Request applies to governed scan/evidence eligibility across the account; excluded items stop appearing in eligibility-aware app views; storage, exports, and audit records may remain (Section 15). |

### `scan_specific`

| Aspect | Plan |
|--------|------|
| **Required user input** | Scope; identifier of the target scan session (presented via app-owned UI, resolved server-side to `target_scan_record_id`). |
| **Forbidden user input** | Evidence-table/id without evidence scope; arbitrary UUIDs not owned by the user. |
| **Validation before submission** | Target present; evidence target columns null. |
| **Post-intake validation** | Target exists; owned by authenticated user; lifecycle `active`; not already terminal excluded; duplicate policy (Section 7). |
| **Execution attribution behavior** | On `executed`: exactly one execution row; `scan_record_id` equals `target_scan_record_id`. |
| **User-facing explanation** | Request applies to one scan session and its governed child evidence via session propagation semantics; not a guarantee of binary or export deletion. |

### `evidence_specific`

| Aspect | Plan |
|--------|------|
| **Required user input** | Scope; parent session context; evidence table (from whitelist) and evidence row id. |
| **Forbidden user input** | Account-wide or scan-only shape; non-whitelist table names. |
| **Validation before submission** | All three target fields populated; structural CHECK shape satisfied at insert. |
| **Post-intake validation** | Evidence row exists; belongs to user and parent session; active preconditions per Slice 9/11; duplicate policy. |
| **Execution attribution behavior** | On `executed`: **zero** session execution rows per migration consistency rules; outcome recorded on request row and child-level primitive effects (future gated consumer path). |
| **User-facing explanation** | Request targets one evidence item; session-level attribution rows are not used for this scope in the committed contract. |

No additional scope values may be invented.

---

## 6. Submission Contract

Future server-side submission sequence:

1. **Authenticate user** — reject unauthenticated callers; no governance row (transport/application rejection only).
2. **Derive canonical user identity server-side** — set `user_email` from the trusted session/JWT email convention used elsewhere in the repository (`lower` comparison parity with RLS).
3. **Validate request scope** — closed set; reject unknown scope without durable intake.
4. **Validate ownership of any supplied target** — server-side lookups; never trust client ownership claims without verification.
5. **Reject client-supplied server-controlled fields** — strip or ignore `id`, state, resolution, timestamps, execution payloads, operator fields, and foreign `user_email`.
6. **Create only an initial received request** — service-role (or server-mediated) insert with `request_state = received`, `resolution_code` null, `validated_at`/`resolved_at` null, structurally valid targets; timestamps database/server defaulted.
7. **Return a safe response** — request identifier and neutral status only; no internal codes, operator notes, or service-role details.
8. **Record evidence for later review** — structured application log correlating request id, actor, scope, and outcome of intake (redacted).

**Users cannot submit:** `id`, `request_state`, `resolution_code`, `validated_at`, `resolved_at`, execution rows, operator fields, or arbitrary `user_email` different from authenticated identity.

**Durable intake boundary:** Structurally malformed payloads that do not yield a recognized scope with valid target shape create **no** governance row; they remain application/transport failures with audit logging only.

---

## 7. Duplicate and Idempotency Posture

The committed migration does **not** define a global uniqueness constraint on “one active request per user/scope/target.” Duplicate control is therefore **shared** across layers:

| Scenario | Planned control |
|----------|-----------------|
| **Double-click / repeated browser submit** | Application idempotency key or short-window deduplication before second insert; UI disable-on-submit. |
| **Network retry of same submission** | Safe retry: if first insert succeeded, return existing request id (read-after-write) rather than second `received` row when policy defines “active duplicate” rejection. |
| **Same scan-specific target** | Application query for non-terminal `received` rows with same scope and target; reject with `duplicate_request` at validation or reject new intake per product policy (document choice in future technical design). |
| **Account-wide request already active** | Application policy: at most one non-terminal account-wide request per user unless explicitly overridden by future workflow policy. |
| **Already completed (terminal) request** | New submission creates a **new** governance row (append-oriented model); post-intake validation may reject with `already_completed` if lifecycle target already excluded. |
| **Convergent lifecycle re-request** | Map to `already_completed` or convergent no-op semantics per Slice 2 technical design failure principles; never mutate terminal rows. |

**Ownership by layer:**

- **Application validation** — proactive duplicate detection, idempotency tokens, UX guards.
- **Transaction orchestration** — ensure validation → execution → terminal transition is atomic where required.
- **Database constraints already accepted** — uniqueness on `(deletion_request_id, scan_record_id)` for attribution only; state/resolution coupling; no invented uniqueness on active requests.
- **Future workflow policy** — explicit rules for whether duplicate `received` rows are allowed vs. rejected at validation.

---

## 8. Request Lifecycle Presentation

Database workflow states are `received`, `executed`, and `rejected`. Validation progress is represented by **`validated_at`** while state may remain `received`. User-facing presentation may include four **neutral** labels:

| Presentation | Database basis | User language (neutral) |
|--------------|----------------|-------------------------|
| **Received / pending review** | `request_state = received`, `validated_at` null | “We received your request and are reviewing it.” |
| **Validated / in progress** | `request_state = received`, `validated_at` not null | “Your request passed initial checks and is being processed.” |
| **Completed** | `request_state = executed`, `resolution_code = completed` | “Your request was completed under our data governance process.” |
| **Not completed** | `request_state = rejected`, closed rejection code | “Your request could not be completed.” (Reason category mapped to safe copy; no internal codes verbatim.) |

**Rules:**

- Do **not** promise deletion or full erasure before terminal `executed` with successful lifecycle effect.
- Do **not** expose sensitive operator notes, stack traces, primitive errors, or raw `resolution_code` strings unless mapped to approved user-safe categories.
- Do **not** imply reversal of terminal exclusion (`excluded` remains terminal in evidence lifecycle).

---

## 9. Validation Workflow

Future authorized validation step (operator or automated server workflow under service-role):

1. **Identity confirmation** — request row `user_email` matches authenticated subject for user-initiated flows; operator flows verify authorization to act on request.
2. **Scope confirmation** — scope/target matrix matches migration CHECK rules; immutable after insert.
3. **Target ownership** — server verifies scan/evidence rows belong to requester.
4. **Request completeness** — structural and business preconditions for the chosen scope.
5. **Legal/retention exceptions** — **unresolved** unless separately approved in compliance artifacts; must not be presented as resolved in UI copy.
6. **Duplicate / already-completed evaluation** — per Section 7; transition to `rejected` with `duplicate_request` or `already_completed` when applicable.
7. **Transition to validated milestone** — permitted `received` → `received` update setting `validated_at` once (never from client).
8. **On failure before validation milestone** — `received` → `rejected` with appropriate closed code (`invalid_request`, `unauthorized_request`, etc.); `validated_at` remains null.
9. **Evidence capture** — log validation decision, correlation id, redacted reason category, operator identity if human-driven.

**Unresolved (explicit):** Legal hold, regulatory retention, and cross-border processing constraints are **not** defined in this slice; any validation branch depending on them requires separate compliance approval.

---

## 10. Execution Orchestration

Future execution boundary:

- **Execution requires service-role / server-side control** — invokes Slice 8 exclusion primitives and writes governance progression; browsers never call primitives directly.
- **Single atomic execution transaction (account-wide and scan-specific session paths)** — within one database transaction: (a) set validation milestone if not already set; (b) invoke required primitive(s); (c) insert all required `deletion_request_executions` rows; (d) transition request to `executed` with `resolution_code = completed` and `resolved_at`; (e) satisfy deferred cross-table consistency at commit.
- **Partial attribution followed by terminal execution is prohibited** — application must not commit terminal `executed` until all required attribution rows for the scope are present in the same transaction.
- **Terminal state only after governed actions succeed** — primitive failures roll back; request may transition to `rejected` with `execution_failed` without lifecycle effect.
- **Failure must not silently produce successful terminal state** — distinguish success, rejected, and indeterminate outcomes in logs and user messaging.
- **No browser/client direct execution pathway** — including no client Supabase inserts into execution table or workflow columns.

Evidence-specific execution (child primitive path) follows the same atomicity principle for its governed effects; session execution rows remain zero per contract.

This section intentionally omits SQL command text and primitive signatures.

---

## 11. F-P2-3 Application Obligation

**Accepted residual:** F-P2-3 — Post-terminal account-wide attribution.

The database may still permit a later service-role insert of an additional execution attribution row for an already `executed` `account_wide` request while other invariants hold. That capability is **not** authorization for the application to defer attribution.

**Application rule (binding for future implementation):**

- All **intended** account-wide execution-attribution rows must be created **inside the original atomic execution transaction** that terminalizes the request to `executed`.
- No later application workflow, batch job, or operator action may append attribution rows after terminal execution for account-wide scope.
- **Database capability ≠ application authorization.**
- Future API/service tests must assert F-P2-3: post-terminal attribution attempts are rejected or never scheduled by application code (verification SQL may observe database INFO only via Block B `B-07-03`; that does not replace application tests).

Do not redesign the database to add temporal freezing in this slice.

---

## 12. Error and Retry Posture

| Condition | User-safe message | Internal audit evidence | Retry | Operator review |
|-----------|-------------------|-------------------------|-------|-------------------|
| Authentication failure | Generic unauthorized | Auth failure event, no row | Allowed after re-auth | No |
| Invalid scope / malformed body | Generic invalid request | Payload hash, validation errors (redacted) | User may correct and resubmit | If repeated abuse |
| Missing target | Specific enough to correct target | Scope/target validation | User resubmit | No |
| Ownership mismatch | Cannot process request | Ownership check failure | Block retry with same target | If suspected abuse |
| Duplicate request | Request already in progress | Duplicate policy hit | Safe idempotent response | Optional |
| Already completed | Request cannot apply to already removed eligibility | `already_completed` path | New request if policy allows | Optional |
| Validation rejection | Not completed (category) | `resolution_code`, request id | New request if appropriate | If pattern |
| Execution failure | Not completed; support path | Primitive error redacted, rollback proof | **No blind retry** | **Required** before re-execution |
| Timeout / network interruption | Ambiguous; advise checking status | Correlation id, partial step markers | Read status; do not duplicate execute | If stuck `received` |
| Ambiguous server result | Check status or contact support | Full trace for investigators | Idempotent status read | Yes |

**No blind retry of execution** — re-execution requires explicit operator/workflow decision after reviewing governance state and lifecycle outcome.

---

## 13. Security Requirements

Future implementation must satisfy (planning targets only; **no controls implemented in this task**):

- **Server-derived identity** for `user_email`; never trust client email fields (including legacy stub behavior).
- **Least privilege** — authenticated users: ownership-scoped SELECT on own requests only; no writes to governance or execution tables from client roles.
- **No service-role key in client** — service role confined to server runtime secrets.
- **No direct client writes** to `deletion_request_executions` or workflow UPDATE on `deletion_requests`.
- **No user-controlled lifecycle timestamps** — `requested_at`, `validated_at`, `resolved_at`, `created_at`, `executed_at` are server/database controlled.
- **No trusting client ownership claims** — always verify against governed tables under user session or service-role read.
- **CSRF/session protections** appropriate to existing Next.js/auth architecture for state-changing submission endpoints.
- **Rate-limit planning** for submission and status polling to reduce abuse and duplicate intake noise.
- **Structured audit logging** with correlation/request id, redacted errors, operator identity on privileged actions.
- **Secret redaction** in logs and client responses.
- **No PROD testing** of deletion workflow until explicitly authorized on non-PROD infrastructure with DEV gate open.

---

## 14. Privacy and Compliance Requirements

- **Educational/cosmetic platform posture** unchanged — no diagnostic or medical claims in deletion flows.
- **Request confirmation and status transparency** — users can see that a request was recorded and its outcome category.
- **Data minimization** — persist only migration-defined governance metadata at intake; avoid collecting free-text unless separately approved.
- **No hidden continued personalization from deleted evidence** — eligibility-aware reads must reflect exclusion after execution (Slice 1B path); unrelated legacy analyses behavior remains documented residual.
- **Deletion/exclusion does not silently imply** removal of every VPS binary, export, email, log, or third-party copy.
- **Unresolved boundaries** (storage, export, localStorage, audit retention) must remain explicit in user-facing copy (Section 15).
- **No misleading “everything deleted” confirmation** — completed means governed workflow and lifecycle exclusion completed per product definition, not universal erasure.

---

## 15. Storage and External Residuals

The Slice 2 database migration does **not** resolve the following; each is **future governed work**, not automatically solved by request `executed`:

| Residual surface | Classification |
|------------------|----------------|
| VPS image binaries | Future storage governance / Slice 12 follow-on |
| Image URLs and references in payloads | Future redaction or retention policy |
| localStorage / client caches | Future client hygiene; out of DB migration scope |
| Exports and downloads | Future product and retention decision |
| Email content and notifications | Future messaging governance |
| Application and infrastructure logs | Retention and access policy |
| Audit and governance records | Persist by design (Slice 11 residual) |
| Cached summaries and CDN edge copies | Future infra process |
| AI-derived artifacts outside excluded rows | Future scope definition |

Application messaging must not imply these are removed upon request execution unless a separate approved contract says so.

---

## 16. Observability and Evidence

Plan conceptual application events and log fields (no new database columns):

- Request accepted (intake id, scope, redacted target presence)
- Request validated or rejected (milestone vs. terminal rejection)
- Execution started / completed / failed (correlation id, request id)
- Attribution count and affected target identifiers (internal)
- Operator identity (internal, for privileged actions)
- Timestamps (server-generated in logs)
- Correlation / request ID across HTTP and database workflow
- Redacted error classes (never raw primitive messages to users)

Evidence supports DEV verification sessions, security review, and incident response without exposing service-role material to clients.

---

## 17. API Planning Boundary

Conceptual operations for a future gated API layer (exact paths not fixed except where repository evidence exists):

| Operation | Intent |
|-----------|--------|
| **Submit deletion request** | Authenticated intake → `received` row via server/service-role. Repository contains a **non-authoritative stub** at `/api/delete-request`; replacement or hardening is future implementation. |
| **Get current user request status** | Ownership-scoped read of latest or specific request by id. |
| **List user request history** | Paginated SELECT-equivalent for own requests only. |
| **Operator validate request** | Server-only; sets `validated_at` or rejects. |
| **Operator execute request** | Server-only; atomic execution transaction. |

Do not specify TypeScript types, OpenAPI schemas, or route implementations in this document. Do not redesign unrelated existing endpoints (`/api/scan`, etc.).

---

## 18. UI Planning Boundary

Future UI states (no components, routes, mockups, or final copy):

- Request entry (scope selection)
- Confirmation (intent and limitation acknowledgment)
- Pending / received (awaiting review)
- Validated / in progress (`validated_at` set, still `received`)
- Executed (completed presentation)
- Rejected (not completed presentation)
- Retry / support guidance (status check, contact support, no execution retry button for users)

Mobile-first posture preserved; no redesign of unrelated dashboard surfaces unless separately authorized.

---

## 19. Testing Strategy

Future tests (authorized only after implementation gates):

| Category | Examples |
|----------|----------|
| **Unit** | Scope/target matrix validation; forbidden field stripping; presentation mapping; duplicate policy helpers. |
| **Integration** | Authenticated submission creates `received` only; ownership failures → `rejected`; validation milestone update; atomic execution with attribution cardinality; F-P2-3 prohibition on post-terminal attribution scheduling. |
| **Database verification** | Block A and Block B remain **separately authorized** repository verification artifacts; not substitutes for application tests. |
| **UI** | Form validation, disabled double-submit, status display per Section 8, no leakage of internal codes. |

Additional cases: authentication required; forbidden client fields ignored; safe error messages; no secret leakage; no PROD execution in CI or manual tests.

---

## 20. Implementation Preconditions

Application implementation may begin **only after** all of the following:

- Separate SkinIntel DEV Supabase project provisioned and identity verified.
- Phase 2 Slice 2 migration successfully applied to DEV.
- Block A PASS on DEV.
- Block B separately authorized and PASS if required by the implementation gate.
- **Phase 2 Slice 2 — Application Deletion Pathway Technical Design** accepted.
- UI flow design accepted for deletion request surfaces.
- Storage residual decision recorded for user-facing promises.
- Security review accepted for service-role orchestration and operator boundaries.
- Execution baseline SHA and blob identities approved at the execution gate.

Until then, only documentation and read-only repository review are authorized.

---

## 21. Hard Stops

Stop all implementation work immediately if:

- DEV project identity unresolved or conflated with PROD.
- PROD ref `rbukikinzyhyaixjvnhf`, host `rbukikinzyhyaixjvnhf.supabase.co`, or exact project name `skinintel` detected under locked typed matching semantics in an execution context.
- Migration not applied to the target environment.
- Block A failure or unapproved verification bypass.
- Ownership contract unclear or client-supplied identity accepted.
- Service-role credentials exposed to client or bundled in frontend assets.
- Application attempts terminal `executed` before required atomic attribution completes.
- User-facing copy promises full storage/export erasure without approved residual decisions.
- Legal/retention ambiguity presented as resolved.
- Scope creep into account deletion, billing cancellation, or unrelated API redesign.

---

## 22. Current Authorization Boundary

**Authorized now:**

- Creation and review of this planning document.

**Not authorized:**

- API implementation (including hardening `/api/delete-request`).
- UI implementation.
- SQL changes, migration execution, Block A, Block B.
- Supabase contact (DEV or PROD).
- Any database mutation or CLI apply.

---

## 23. Next Planning Step

After this plan is reviewed and accepted, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway Technical Design**

That document will refine submission sequences, operator boundaries, idempotency policy choices, error code mapping to user copy, and integration points with existing auth and scan/history surfaces—**documentation only** unless a separate message explicitly authorizes implementation.

---

*End of Phase 2 Slice 2 — Application Deletion Pathway Plan.*
