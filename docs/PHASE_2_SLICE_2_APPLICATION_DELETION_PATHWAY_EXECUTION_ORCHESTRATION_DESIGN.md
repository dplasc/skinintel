# Phase 2 Slice 2 — Application Deletion Pathway Execution Orchestration Design

- Status: Draft — execution orchestration design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- Orchestrator implementation: not authorized
- Operator implementation: not authorized
- API implementation: not authorized
- UI implementation: not authorized
- Worker implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future execution-orchestration contract** for privileged deletion-request execution on SkinIntel’s Application Deletion Pathway: from an authorized operator execution request through target derivation, one atomic governed execution transaction, attribution, terminal state, audit evidence, failure handling, and ambiguous-result recovery.

**Authorization boundary (binding):**

- **No implementation is authorized** by this document.
- **No database execution is authorized.**
- **No new schema or RPC is authorized.**
- Accepted **API Contract Design**, **UI Flow Design**, **Security and Abuse Design**, **Operator Authorization Design**, and **Idempotency and Concurrency Design** remain authoritative for their domains.
- The committed migration controls persistence vocabulary and invariants.
- This document **cannot silently redesign F-P2-3** or lifecycle behavior.

Execution orchestration remains **blocked** while the Phase 2 Slice 2 migration is unapplied, the DEV execution gate is BLOCKED, a separate SkinIntel DEV Supabase project is not provisioned, and PROD remains denylisted.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| # | Artifact | Role |
|---|----------|------|
| 1 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` | Pathway scope, residuals, F-P2-3 obligation, hard stops |
| 2 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` | Trust zones, sequences, component boundaries |
| 3 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md` | HTTP execute surface, envelopes, status codes |
| 4 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md` | Operator/user presentation; no client execution |
| 5 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md` | Threat model, privileged fail-closed posture |
| 6 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md` | Human operator capability vs service-role |
| 7 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md` | Replay, race, stale-state, retry, ambiguity |
| 8 | `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Lifecycle consumer and failure principles |
| 9 | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Persistence narrative |
| 10 | `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` | Controlled DEV apply; PROD denylist |
| 11 | `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` | DEV gate **BLOCKED** |
| 12 | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Committed persistence contract |
| 13 | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` | Verification candidate; F-P2-3 residual INFO |

### Precedence (binding)

1. Committed migration
2. Accepted pathway Plan
3. Accepted Technical Design
4. Accepted API Contract Design
5. Accepted UI Flow Design
6. Accepted Security and Abuse Design
7. Accepted Operator Authorization Design
8. Accepted Idempotency and Concurrency Design
9. **This Execution Orchestration Design**
10. Future implementation

Where this document and a higher-precedence artifact conflict, the higher-precedence artifact wins. This document must not invent persistence columns, workflow states, rejection codes, lifecycle primitives, or executable infrastructure absent from accepted contracts.

---

## 3. Current Repository Execution Posture

Read-only inspection of lifecycle, service-role, server-action, API, evidence, transaction, and execution conventions. No inspected file was modified. Claims cite exact repository paths.

Inspection baseline: branch `main`, HEAD `bad9245e23e87920960c47412cfc869e451d58f0` (matches task baseline). Permitted untracked entry observed: `?? .cursor/`.

### 3.1 Deletion-request tables and invariants

| Aspect | Finding |
|--------|---------|
| **Path** | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| **Current behavior** | Committed migration candidate defines `public.deletion_requests` and `public.deletion_request_executions`; closed scopes/states/resolution codes; transition guard `enforce_deletion_request_transition()` (`SECURITY INVOKER`); deferred consistency `enforce_deletion_request_execution_consistency()` (`SECURITY INVOKER`, `DEFERRABLE INITIALLY DEFERRED`); service-role column-level grants; no `SECURITY DEFINER`. Marked **NOT APPROVED FOR EXECUTION**. |
| **Assessment** | Persistence contract is designed and committed; **not applied** to any authorized DEV project. |
| **Gap versus future orchestration** | Orchestrator cannot persist governed execution until migration is applied on a verified DEV project and gates pass. |

### 3.2 Deletion execution attribution

| Aspect | Finding |
|--------|---------|
| **Path** | Same migration; verification `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` (B-07-03 F-P2-3 residual INFO) |
| **Current behavior** | Attribution table is append-only by grant posture (`INSERT` of `deletion_request_id`, `scan_record_id` only). Deferred consistency enforces scope/cardinality at commit (account_wide ≥ 1; scan_specific exactly 1 matching target; evidence_specific zero session rows; received/rejected zero rows). Verification records that **post-terminal additional attribution insert remains physically possible** as accepted residual (INFO, not FAIL). |
| **Assessment** | Database does not temporally freeze attribution after terminalization. |
| **Gap versus future orchestration** | Application orchestrator must enforce F-P2-3: all intended attribution in the original atomic execution transaction; no post-terminal append path. |

### 3.3 Current lifecycle exclusion mechanisms

| Aspect | Finding |
|--------|---------|
| **Paths** | `supabase/migrations/20260712120000_phase_1_slice_8_governed_exclusion_transition_primitive.sql`; supporting lifecycle metadata in `supabase/migrations/20260710120000_phase_1_slice_6_evidence_lifecycle_governance.sql`, `supabase/migrations/20260711120000_phase_1_slice_7_session_anchor_lifecycle_metadata.sql` |
| **Current behavior** | `public.exclude_scan_record(uuid, text)` and `public.exclude_evidence_row(text, uuid, text)` exist as `SECURITY INVOKER` primitives; `GRANT EXECUTE` to `service_role` only; caller reasons include `user_deletion_request`. Session exclusion locks the scan row `FOR UPDATE`, rejects non-active sessions, propagates to active children, then excludes the session. |
| **Assessment** | Lifecycle exclusion capability exists at the database layer and is dormant/service-role-only. |
| **Gap versus future orchestration** | No application orchestrator invokes these primitives for deletion-request execution today. |

### 3.4 Eligible read surfaces

| Aspect | Finding |
|--------|---------|
| **Path** | `supabase/migrations/20260713120000_phase_2_slice_1a_evidence_persistence_boundary.sql` |
| **Current behavior** | Views: `eligible_scan_records`, `eligible_user_description_evidence`, `eligible_image_evidence`, `eligible_product_mention_evidence`, `eligible_ai_analysis_evidence` (`security_invoker` posture in comments; SELECT to `authenticated` and `service_role`). |
| **Runtime consumption** | `app/actions/index.ts` reads `eligible_scan_records` (and falls back to `analyses`) filtered by `session.user.email`. |
| **Assessment** | Eligibility-aware read surfaces exist; some application consumption exists for latest-analysis style reads. |
| **Gap versus future orchestration** | Execution target derivation must use authoritative owned lifecycle-participating records; eligible views are read aids, not an execution inventory API. |

### 3.5 Server-side service-role usage

| Aspect | Finding |
|--------|---------|
| **Paths** | Inline `createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)` in `app/api/scan/route.ts`, `app/api/interest/route.ts`, `app/actions/index.ts`; anon client in `lib/supabase.ts` |
| **Current behavior** | Mutating server paths construct service-role clients after ordinary `auth()` (scan/actions) or without auth (interest). Anon client is browser-safe only. |
| **Assessment** | Established server-only service-role pattern; **service-role proves DB privilege, not human operator authorization** (Operator Authorization Design). |
| **Gap versus future orchestration** | Orchestrator may use service-role for governed writes only after fresh human operator authorization; must never treat service identity as operator identity. |

### 3.6 Current APIs / server actions

| Path | Current behavior | Assessment | Gap |
|------|------------------|------------|-----|
| `app/api/delete-request/route.ts` | Unauthenticated `POST`; optional client `email`/`message` discarded; always `{ success: true }` | Unsafe / non-authoritative stub | No durable intake, validation, or execution |
| `app/api/scan/route.ts` | `auth()`; email required; rate limit; sequential service-role inserts; user-safe errors | Best authenticated mutating API reference | No multi-statement transaction wrapper; not deletion orchestration |
| `app/actions/index.ts` | Ownership-scoped reads/upserts via service-role + `session.user.email` | User data pattern | No validate/execute actions |
| `app/api/operator/**` | **Does not exist** | Absent | Future execute route family is design-only |

### 3.7 Current transaction or RPC conventions

| Aspect | Finding |
|--------|---------|
| **Paths searched** | `app/`, `lib/`; migration SQL |
| **Current behavior** | **No** application-layer DB transaction API, advisory-lock helper, or serialized workflow runner under `app/` or `lib/`. Scan route performs sequential inserts without an explicit multi-statement transaction. **No** `.rpc(` usage for deletion orchestration in application TypeScript. Migration/lifecycle SQL contain database functions and a migration `BEGIN`…`COMMIT`, not an application orchestrator. |
| **Assessment** | Application has **no** reusable transaction/RPC orchestration framework for deletion execution. |
| **Gap versus future orchestration** | Atomic execution boundary must be designed and later implemented under separate authorization; this document does not invent SQL statements or RPC wrappers. |

### 3.8 Worker / queue / job infrastructure

| Aspect | Finding |
|--------|---------|
| **Paths** | `package.json`; `app/`; `lib/` |
| **Current behavior** | `package.json` has **no** job/queue/worker runtime (no Bull, pg-boss, Inngest, Agenda, etc.). Application TypeScript has **no** deletion worker, cron, or job runner. |
| **Assessment** | Worker/queue/job infrastructure for deletion **does not exist**. |
| **Gap versus future orchestration** | Synchronous supervised execution is the default conceptual posture until a worker is separately approved. |

### 3.9 Execution orchestration infrastructure

| Aspect | Finding |
|--------|---------|
| **Paths searched** | Repository for `orchestrator`, deletion execute pathway under `app/` / `lib/` |
| **Current behavior** | **No** application deletion orchestrator module, service, or route exists. Design documents describe a future “Operator execution orchestrator” conceptually only. |
| **Assessment** | **An application deletion orchestrator currently does not exist.** |
| **Gap versus future orchestration** | Entire execution pathway is greenfield relative to runtime code. |

### 3.10 Retry handling

| Aspect | Finding |
|--------|---------|
| **Paths searched** | `app/**/*.{ts,tsx}`, `lib/**/*.{ts,tsx}` for retry helpers |
| **Current behavior** | **No** application retry helper, retry budget, or idempotent retry client under `app/` or `lib/`. |
| **Assessment** | Retry classification for execution is design-only (Idempotency Design). |
| **Gap versus future orchestration** | Orchestrator must implement fail-closed ambiguity handling; no existing retry utility to reuse. |

### 3.11 Audit / observability conventions

| Aspect | Finding |
|--------|---------|
| **Paths** | `app/api/scan/route.ts` (`console.error` with `failure_stage`); pathway design docs for conceptual audit events |
| **Current behavior** | Runtime uses `console.error` for internal failures; **no** structured deletion-execution audit sink, correlation registry, or alerting pipeline for governed deletion execution. |
| **Assessment** | Observability for deletion execution **does not exist** in runtime. |
| **Gap versus future orchestration** | Audit evidence contract (Section 43) remains future work; no vendor selected. |

### 3.12 Auth, middleware, proxy, rate limit

| Path | Current behavior | Gap |
|------|------------------|-----|
| `auth.ts` | NextAuth v5; Credentials + Google + GitHub; no role/operator claims | Ordinary identity only |
| `middleware.ts` | Protects dashboard/history pages only; **not** `/api/*` | Operator APIs must self-authorize |
| `proxy.ts` | Explicitly skips `/api` | Not API protection |
| `lib/rateLimit.ts` | Scan-only Upstash Redis; **fail-open** if Redis missing | Must not authorize execution |

### 3.13 Repository search results (explicit)

Searched read-only for: `deletion_request`, `deletion_request_executions`, `request_state`, `validated_at`, `resolution_code`, `account_wide`, `scan_specific`, `evidence_specific`, `affected_table`, `affected_row_id`, `exclusion`, `excluded_at`, `lifecycle`, `eligible`, `service_role`, `security definer`, `security invoker`, `rpc`, `transaction`, `atomic`, `deferred`, `set constraints`, `rollback`, `commit`, `execution`, `orchestrator`, `worker`, `queue`, `retry`, `ambiguous`, `terminal`, `stale`, `advisory`, `lock`, `audit`.

| Mechanism | Result in application runtime (`app/`, `lib/`) |
|-----------|-----------------------------------------------|
| Application deletion orchestrator | **Does not exist** |
| Worker / queue / job / cron for deletion | **Does not exist** |
| Application DB transaction wrapper | **Does not exist** |
| Advisory / distributed locks | **Does not exist** |
| Deletion RPC orchestration client | **Does not exist** |
| Retry / idempotency registry for execution | **Does not exist** |
| Structured deletion audit sink | **Does not exist** |
| Operator execute route | **Does not exist** (`app/api/operator/**` absent) |
| Lifecycle primitives in DB migrations | **Exist** (Slice 8; service-role execute grant) |
| Governance tables/guards in committed migration | **Exist as unapplied SQL candidate** |
| Eligible views | **Exist** (Slice 1A migration); partial read use in `app/actions/index.ts` |
| Dashboard “transaction” UI tables | Presentation mocks under `components/table/*` — **not** persistence transactions |

Design documents under `docs/` extensively discuss future orchestration; they are not runtime infrastructure.

**Application deletion orchestrator currently exists: no.**

---

## 4. Orchestration Objectives

| Objective | Intent |
|-----------|--------|
| Authorized execution only | Fresh human operator capability required before mutation |
| Server-derived targets | Inventory derived from authoritative owned records, never caller-supplied |
| One atomic execution transaction | Lifecycle actions + attribution + terminal transition succeed or roll back together |
| Complete attribution before terminal state | Required attribution persisted before/with terminalization inside the same transaction |
| No caller-controlled inventory | Forbidden affected-table/row payloads from browser/API callers |
| No partial-success presentation | No UI/API success until transaction outcome is known |
| Deterministic terminal outcome | Known success → `executed`/`completed`; known lawful rejection path remains separate |
| Safe conflict handling | Stale/concurrent attempts receive conflict without mutation |
| No blind retry | Ambiguous outcomes require status re-read and review |
| Auditable human-to-service linkage | Human operator identity distinct from service-role identity |
| Truthful residual messaging | Governed completion ≠ universal erasure |
| No PROD testing | PROD denylist hard stop |

---

## 5. Terminology

Conceptual definitions only. No schemas or constants are created.

| Term | Meaning |
|------|---------|
| **Execution request** | Authorized operator intent to execute one governed deletion request identified by request id |
| **Orchestrator** | Future server-side component that derives targets, runs the atomic governed execution transaction, and reports known/ambiguous outcomes |
| **Execution plan** | Immutable in-process description of intended governed actions for one attempt (not a persistence schema) |
| **Target inventory** | Complete server-derived set of governed rows/actions for the attempt |
| **Governed action** | Approved lifecycle exclusion/eligibility mutation within Slice 2 contracts |
| **Attribution row** | Row in `deletion_request_executions` linking an executed request to a session anchor (where scope requires it) |
| **Execution attempt** | One orchestration try correlated by ids; may later have a persisted attempt identity if approved |
| **Atomic boundary** | Single database transaction covering lifecycle actions, required attribution, terminal transition, and deferred consistency |
| **Terminal transition** | Request move from `received` to `executed` or `rejected` with required resolution metadata |
| **Ambiguous execution result** | Application cannot prove whether the atomic transaction committed or rolled back |
| **Residual system** | Storage, backups, email, localStorage, logs, CDN, exports, AI-derived artifacts outside the governed DB inventory |
| **Execution evidence** | Safe audit/observability record linking human, service, request, outcome, and correlation id |

---

## 6. Operation Boundary

### Orchestration does

- Load one governed deletion request
- Verify authorization and eligibility
- Derive target inventory
- Execute approved lifecycle operations
- Persist required execution attribution
- Reach terminal state only after all governed work succeeds
- Record safe audit evidence

### Orchestration does not

- Account deletion
- Billing cancellation
- Arbitrary storage deletion
- Backup erasure
- Email deletion
- localStorage deletion
- Unapproved external-system mutation

---

## 7. Actor Model

| Actor | Role |
|-------|------|
| **Authenticated ordinary user** | May submit/read own requests; cannot execute |
| **Authorized validator** | May set `validated_at` or reject under validation/rejection capability |
| **Authorized execution operator** | May trigger execution under approved execute capability |
| **Execution orchestrator** | Server component performing derivation + atomic transaction |
| **Service-role database client** | Database privilege for server process; not human authorization |
| **Future worker** | Only if separately approved; cannot invent human permission |
| **Support reviewer** | Reviews status/audit after ambiguity or failure |
| **Security reviewer** | Reviews privileged abuse, leakage, and hard-stop compliance |

**Binding:** service identity and human operator identity remain distinct.

---

## 8. Trust Boundaries

| Boundary | Rule |
|----------|------|
| Operator browser ↔ operator API | Browser never holds service-role; supplies request id / correlation only |
| Operator API ↔ authorization resolver | Session identity resolved; capability checked server-side |
| Authorization resolver ↔ orchestrator | Orchestrator invoked only after capability grant for this environment |
| Orchestrator ↔ Supabase | Service-role used only server-side for governed writes |
| Orchestrator ↔ residual/external systems | Residuals outside atomic DB transaction unless separately approved |
| Application logs ↔ user-visible responses | Logs may contain redacted internal detail; users receive safe envelopes only |
| DEV ↔ PROD | Hard isolation; PROD denylist match stops execution |
| Human authorization ↔ service execution | Service-role alone never authorizes execution |

---

## 9. Execution Entry Preconditions

Execution may begin only when all of the following hold:

- Exact request exists
- Request is owned/valid under accepted contract
- Request state is `received`
- `validated_at` is non-null
- Request is not terminal
- Execution operator has approved capability
- Authorization is freshly resolved
- Target environment is verified
- DEV gate is open at implementation time
- Migration and required verification gates have passed
- No hard-stop condition exists

---

## 10. Forbidden Entry Conditions

Execution must **not** begin when:

- Request is missing
- Request is unvalidated (`validated_at` null)
- Request is terminal (`executed` or `rejected`)
- Operator authorization is absent or stale
- Environment is ambiguous
- PROD denylist matches
- Target derivation is incomplete
- Idempotency/concurrency policy is unresolved at implementation time
- Residual messaging would be misleading
- Attribution plan is incomplete
- Audit identity is unavailable

---

## 11. Accepted Orchestrator Inputs

Conceptual accepted inputs:

- Deletion request identifier
- Authorized human actor identity
- Approved execution capability
- Environment identity
- Correlation identifier
- Expected request state/milestone
- Optional approved execution attempt identity

**Binding:** all workflow data is reloaded server-side. Caller snapshots are hints for stale detection only, never write authority.

---

## 12. Forbidden Caller Inputs

Caller control is prohibited for:

- `user_email`
- `request_state`
- `resolution_code`
- `validated_at`
- `resolved_at`
- Affected tables
- Affected row identifiers
- Target inventory
- Attribution rows
- Operator identity
- Terminal outcome
- Lifecycle timestamps
- SQL/RPC identifiers
- Retry count
- Environment selection from browser

---

## 13. Fresh Authorization Check

| Step | Contract |
|------|----------|
| Session verification | Resolve current session via existing `auth()` pattern; fail closed if missing |
| Operator-capability resolution | Resolve approved execute capability server-side (Operator Authorization Design) |
| Environment-scoped authority | Capability must match verified target environment |
| Revocation awareness | Revoked operators fail closed immediately |
| Cache posture | No cached privilege without approved TTL |
| Pre-mutation recheck | Authorization rechecked immediately before mutation |
| Failure effect | Authorization failure produces **no** workflow effect |

---

## 14. Fresh Request-State Check

| Step | Contract |
|------|----------|
| Reload | Load current request row server-side |
| State | Verify `request_state = received` |
| Milestone | Verify `validated_at` non-null |
| Terminal | Verify not resolved / not terminal |
| Stale screen | Detect operator UI based on outdated snapshot |
| Simultaneous rejection/execution | Detect race; only one terminal path may win |
| Conflict | Return safe conflict **without** mutation |
| Write policy | No last-write-wins behavior |

---

## 15. Scope Dispatch Boundary

Exact supported scopes (closed migration vocabulary):

- `account_wide`
- `scan_specific`
- `evidence_specific`

| Rule | Contract |
|------|----------|
| Closed vocabulary | Unsupported scope fails closed |
| Derivation strategy | Scope determines target-derivation strategy |
| Authority | Scope does **not** grant additional operator authority |

---

## 16. Account-Wide Target Derivation

Conceptually:

- Derive all governed lifecycle-participating records owned by the canonical user
- Use authoritative relationships and the accepted evidence-table set
- Derive before execution
- Freeze the intended governed inventory for the atomic attempt
- No caller-supplied rows
- No late append after terminal state
- Residual systems remain outside this governed database inventory unless separately approved

**F-P2-3 / F-2 interaction:** account-wide successful `executed` requires at least one session attribution row at commit (migration deferred consistency). Zero eligible sessions cannot commit as `executed` and must resolve under accepted rejection/`already_completed` policy—not as false success.

---

## 17. Scan-Specific Target Derivation

| Rule | Contract |
|------|----------|
| Canonical scan id | Taken from request `target_scan_record_id` |
| Ownership | Server-side ownership verification against authoritative scan/user relationship |
| Governed scan record | Session anchor included when eligible for governed exclusion |
| Related evidence | Lifecycle-participating children via accepted session propagation semantics |
| Cross-user | Forbidden |
| Unavailable/terminal target | Fail closed or map to accepted conflict/rejection categories—never mutate foreign data |
| Empty/no-op | Deterministic empty/no-op posture remains explicit (open if policy unresolved) |

Attribution expectation on successful `executed`: exactly one execution row with `scan_record_id` equal to `target_scan_record_id`.

---

## 18. Evidence-Specific Target Derivation

| Rule | Contract |
|------|----------|
| Canonical evidence target | Parent scan id + whitelist table + evidence id from the request |
| Approved table set | Exact migration whitelist only |
| Ownership | Through authoritative scan/user relationship |
| Arbitrary tables | Forbidden |
| Dynamic routing | No routing outside the approved set |
| Release availability | Evidence-specific **execution consumer** activation may remain gated (accepted Technical/API designs) |
| Unsupported type | Fails closed |

Attribution expectation on successful `executed`: **zero** session execution rows (migration deferred consistency).

---

## 19. Approved Evidence-Table Boundary

Exact authoritative evidence tables from the committed migration whitelist:

1. `user_description_evidence`
2. `image_evidence`
3. `product_mention_evidence`
4. `ai_analysis_evidence`

| Rule | Contract |
|------|----------|
| Approved set only | No invented legacy or template tables |
| Browser input | Table identifier never accepted from ordinary browser input as free-form execution routing |
| Orchestrator mapping | Maps approved target type to fixed internal handling |
| Generic execution | No unrestricted table execution |

These same tables are the lifecycle-participating evidence set referenced by Slice 8 primitives and Slice 1A eligible views.

---

## 20. Target Inventory Contract

For each target, conceptually include:

- Target category (session / evidence / other approved governed category)
- Approved table identity
- Row identifier
- Owning scan identifier where applicable
- Intended governed action
- Attribution requirement (yes/no; session-level vs none)
- Pre-execution eligibility evidence

No database columns or executable schemas are added by this document.

---

## 21. Target Inventory Completeness

| Rule | Contract |
|------|----------|
| Completeness before mutation | Inventory must be complete before mutation begins |
| Account-wide | Completeness required for F-P2-3 |
| Ambiguous relationships | Missing/ambiguous relationship blocks execution |
| Best-effort inventory | Prohibited |
| Uncertain completeness | No terminal success |
| Auditability | Completeness evidence remains auditable |

---

## 22. Execution Plan Construction

Conceptual phases:

1. Load request
2. Check environment
3. Authenticate and authorize
4. Verify state/milestone
5. Derive inventory
6. Validate inventory
7. Create immutable in-process execution plan
8. Begin atomic governed execution
9. Apply lifecycle actions
10. Persist attribution
11. Transition terminal state
12. Complete transaction
13. Emit audit outcome

No executable plan format is selected here.

---

## 23. Atomic Transaction Boundary

One atomic database transaction contains:

- Governed lifecycle actions
- Required execution attribution
- Terminal request transition
- Resolution metadata required by the accepted migration contract
- Deferred consistency validation

| Rule | Contract |
|------|----------|
| All-or-nothing | All succeed or all roll back |
| Partial terminal success | Prohibited |
| Separate post-commit attribution | Prohibited |
| UI/API success timing | Only after transaction outcome is known |

SQL statements are not described here.

---

## 24. Execution Ordering Principles

Required logical ordering:

1. State and authorization checks before mutation
2. Target derivation before mutation
3. Lifecycle actions before terminal success
4. Attribution within the same atomic transaction
5. Terminal transition after required governed work
6. Deferred consistency before commit
7. Response only after known transaction outcome

Exact SQL statement ordering remains an implementation review matter.

---

## 25. Lifecycle Action Boundary

Governed actions conceptually:

- Lifecycle exclusion/eligibility changes approved by existing contracts (Slice 8 primitives and related lifecycle posture)
- No physical erasure claim unless separately governed
- No unrelated row mutation
- No account/auth deletion
- No billing change
- No arbitrary evidence rewriting
- No external residual mutation in this Slice 2 transaction

---

## 26. Attribution Contract

| Rule | Contract |
|------|----------|
| Completeness | Every required affected target receives accepted attribution |
| Derivation | Attribution is server-derived |
| Caller inventory | Forbidden |
| Invariants | Uniqueness/cardinality controlled by migration |
| Write timing | Attribution written only in the original execution transaction |
| Nature | Attribution is evidence, not a permission surface |
| User exposure | Ordinary users do not receive raw attribution inventory by default |

---

## 27. F-P2-3 Orchestration Enforcement

Binding application rules:

- All intended account-wide attribution is derived before execution
- All attribution is persisted in the original atomic execution transaction
- No append-attribution endpoint
- No post-terminal UI action
- No operator workaround
- No worker retry job that appends attribution after terminal execution
- No repair path that appends attribution after terminal execution
- Physical database capability (accepted verification residual B-07-03 INFO) does **not** authorize application behavior
- Orchestration and concurrency tests must prove absence of post-terminal append pathways

No database redesign is authorized.

---

## 28. Validation Milestone Treatment

| Rule | Contract |
|------|----------|
| Prerequisite | `validated_at` is a prerequisite milestone |
| Not a state | It is not a fourth `request_state` |
| Execution role | Execution cannot set or reinterpret it as a new state |
| Missing/stale | Blocks execution |
| Separation | Validation and execution remain distinct authorized actions |

---

## 29. Terminal Transition Contract

| Rule | Contract |
|------|----------|
| Successful execution | Transitions to `executed` with `resolution_code = completed` and non-null `resolved_at` |
| Rejection | Terminal through separately authorized validation/rejection flow |
| Once | Terminal state set once |
| Metadata | Follows migration contract |
| Reopen | No return to `received` |
| Overwrite | No terminal overwrite |
| Post-terminal attribution | Forbidden |

---

## 30. Resolution-Code Boundary

Exact accepted resolution-code vocabulary from the committed migration:

| Code | Coupling |
|------|----------|
| `completed` | With `executed` only |
| `invalid_request` | Rejection |
| `duplicate_request` | Rejection |
| `unauthorized_request` | Rejection |
| `already_completed` | Rejection |
| `execution_failed` | Rejection |

| Rule | Contract |
|------|----------|
| Orchestrator use | May use only execution-compatible accepted value (`completed` on success; rejection codes only via approved rejection/failure policy) |
| Caller supply | Forbidden |
| Unsupported value | Fails closed |
| User exposure | Raw internal resolution need not be exposed directly to users |
| Invention | No new resolution code |

---

## 31. Successful Execution Outcome

Known-success requirements (all required):

- Transaction committed
- Lifecycle actions complete
- Attribution complete (per scope cardinality)
- Terminal state persisted
- Deferred invariants passed
- Audit evidence linked
- Safe user/operator response available

Only then may orchestration report success.

---

## 32. No-Op and Already-Applied Conditions

Conceptual evaluation matrix. Unsupported choices remain unresolved (Section 51).

| Condition | Tentative classification posture | Notes |
|-----------|----------------------------------|-------|
| Target already excluded | **Unresolved** between safe no-op vs conflict vs rejection (`already_completed`) | Slice 8 re-invocation on non-active session rejects; policy mapping for orchestration remains open |
| Target unavailable | Conflict or fail-closed unavailable | Never invent success |
| Request already terminal | Conflict / already terminal | No mutation |
| Semantically duplicate execution attempt | Known success replay or conflict per Idempotency Design | No second accepted execution |
| Zero governed targets (account_wide) | Cannot commit as `executed` (F-2) | Must not present as success; rejection/`already_completed` path under accepted policy |

Do not silently choose unsupported behavior.

---

## 33. Rejection Path Boundary

| Rule | Contract |
|------|----------|
| Not execution | Rejection is not execution |
| Capability | Requires validation/rejection capability |
| Codes | Accepted rejection categories only |
| Lifecycle | No lifecycle mutation on pure rejection |
| Attribution | No execution attribution on rejection |
| Terminal | `rejected` follows migration invariants |
| Disguise | Execution orchestrator must not disguise failure as rejection without approved policy |

---

## 34. Concurrency and Stale-Action Handling

Covered cases:

- Simultaneous execute attempts
- Execution versus rejection race
- Stale operator page
- Repeated execution click
- Concurrent server instances
- Terminal state wins
- Loser receives safe conflict
- No partial committed half-success
- Coordination mechanism remains separately selected (Idempotency Design open decision)

---

## 35. Execution Attempt Identity

Conceptual components:

- Correlation id
- Human operator
- Request id
- Environment
- Execution attempt identity if later approved
- Relationship to intake idempotency key: **distinct**; intake key never authorizes execution
- Execution attempt identity never grants authorization
- No new schema is authorized here

---

## 36. Idempotency Interaction

| Rule | Contract |
|------|----------|
| Intake key | Does not authorize execution |
| Execution identity | Uses separate privileged concurrency identity |
| Repeated click | Does not start a second accepted execution |
| Known success | Returned safely |
| Known conflict | Returned safely |
| Ambiguous execution | Never retried blindly |
| Persistence mechanism | Remains unresolved (Idempotency Design) |

---

## 37. Execution Timeout Contract

| Rule | Contract |
|------|----------|
| Timeout meaning | Does **not** prove rollback or commit |
| Automatic second execution | Prohibited |
| Recovery | Status and attribution are re-read |
| Operator response | Ambiguous outcome |
| Correlation | Correlation id retained |
| Escalation | Review required |
| Claims | No success/failure claim without evidence |

---

## 38. Ambiguous Execution Result

When transaction outcome is not known to the application:

- No blind retry
- No new execution identity used automatically
- Reload request state
- Inspect governed attribution evidence
- Inspect safe audit evidence
- Escalate to authorized reviewer
- Never use post-terminal attribution repair
- User response remains truthful and non-final until evidence is known

---

## 39. Failure Classification

| Category | Mutation may have occurred? | Allowed next action |
|----------|-----------------------------|---------------------|
| Precondition failure | No | Fix preconditions; no execute claim |
| Authorization failure | No | Re-authz; no mutation |
| Target-derivation failure | No | Block; repair derivation inputs/policy |
| Validation/inventory failure | No | Block until inventory complete |
| Concurrency conflict | No (loser) / maybe (winner elsewhere) | Status re-read |
| Transaction rollback | No durable governed success | Safe pre-mutation retry only after review of cause |
| Known execution failure | No committed success (rolled back) or terminal rejection if policy applied | Status re-read; operator review |
| Ambiguous execution | **Unknown** | Status/attribution re-read; escalate; no blind retry |
| Observability failure | Depends; must not silently authorize | Fail closed for privileged proceed if audit identity required |
| External residual failure outside transaction | DB pathway may be complete while residual incomplete | Do not claim universal erasure; residual handling separate |

---

## 40. Rollback Semantics

| Rule | Contract |
|------|----------|
| Pre-commit failure | Rolls back governed actions, attribution, and terminal transition |
| Partial success response | Prohibited |
| Audit outside transaction | May record failed attempt outside the governed transaction only if safe and separately designed |
| Automatic destructive retry | Not authorized by rollback |
| Follow-up | Status re-read after failure |

---

## 41. Retry Classification

| Class | Allowed? |
|-------|----------|
| Safe status-read retry | Yes |
| Safe authorization recheck | Yes |
| Safe pre-mutation retry | Yes, when no mutation occurred |
| Operator-reviewed execution retry | Only after evidence shows no commit / lawful re-eligibility |
| Blind execution retry | **Prohibited** |
| Post-terminal attribution retry | **Prohibited** |

| Outcome | Retry posture |
|---------|---------------|
| Known success | Return known success; do not re-execute |
| Known conflict / already terminal | Return conflict; do not mutate |
| Known rollback / precondition failure | May retry only after cause cleared and preconditions rechecked |
| Ambiguous | Status re-read + review; never blind re-execute |

---

## 42. Worker and Queue Boundary

| Rule | Contract |
|------|----------|
| Current state | No worker or queue exists or is authorized now |
| Future worker | Needs separate identity and authorization |
| Human permission | Worker cannot derive human permission |
| Job identity | Distinct from intake key |
| Retries | Bounded |
| Post-terminal attribution job | Forbidden |
| Ambiguous terminals | Require review |
| Queue serialization | Not selected here |

---

## 43. Audit Evidence Contract

Conceptual evidence fields:

- Correlation id
- Human operator identity
- Service/orchestrator identity
- Request id
- Scope
- Environment
- Pre-execution state
- Derived target counts by safe category
- Attempted action
- Transaction outcome
- Terminal result
- Failure/ambiguity category
- Timestamp

**Must not include:** secrets, image content, unnecessary medical content, raw keys, or unsafe operator notes.

No new database audit columns are authorized by this document.

---

## 44. Observability and Alerting

Conceptual signals:

- Authorization denial
- Inventory derivation failure
- Zero-target anomaly
- Simultaneous execution conflict
- Rollback
- Ambiguous execution
- Repeated operator retries
- Post-terminal mutation attempt
- F-P2-3 append attempt
- Audit-pipeline failure
- PROD denylist match

No vendor or implementation is selected.

---

## 45. Error and Response Mapping

Align orchestration outcomes with accepted API Contract categories:

| Orchestration outcome | API posture (conceptual) |
|-----------------------|--------------------------|
| Unauthorized | `401` / `UNAUTHENTICATED` |
| Forbidden | `403` (insufficient operator capability) |
| Invalid request | `400` / `422` invalid request family |
| Stale conflict | `409` / `CONFLICT` |
| Already terminal | `409` conflict / already-terminal family |
| Target unavailable | Safe unavailable/conflict category; non-disclosing where required |
| Known execution failure | Failed / review guidance; no false success |
| Ambiguous execution | `AMBIGUOUS_RESULT` (`503` or `409` with status-check guidance) |
| Internal failure | `500` |
| Service unavailable | `503` |

**Must not expose:** SQLSTATE, table internals, stack traces, secrets, target inventory, or raw operator notes.

---

## 46. User-Facing Truthfulness

| Rule | Contract |
|------|----------|
| Meaning of executed | Governed Slice 2 pathway completed for the accepted scope |
| Not universal erasure | Does not mean every copy everywhere is gone |
| Residuals | Storage, backups, email, localStorage, exports, logs, CDN, and AI-derived artifacts remain separate residual categories |
| Personalization | No hidden continued personalization from excluded evidence on eligibility-aware surfaces |
| Ambiguous | Not shown as completed |
| Legal claims | No legal promise beyond approved policy |

---

## 47. External Residual Coordination

Boundaries for:

- VPS images
- Storage references
- localStorage
- Exports/downloads
- Email
- Logs/audit
- Cached summaries
- AI-derived artifacts
- Backups/CDN

| Rule | Contract |
|------|----------|
| DB transaction inclusion | Residuals are **not** silently included in the database transaction |
| Separate governance | Each requires separately governed lifecycle or retention decisions |
| Coordination signals | Orchestration may emit future coordination signals only if separately designed and approved |
| Residual worker | Not authorized now |

---

## 48. Security Test Matrix

Plan future tests for:

- Unauthenticated execution
- Ordinary user execution attempt
- Insufficient operator capability
- Revoked operator
- Wrong environment
- PROD denylist
- Missing validation milestone
- Stale request state
- Forged target inventory
- Forged attribution
- Unsupported scope
- Cross-user target derivation
- Terminal request
- Simultaneous execute
- Execution/rejection race
- Rollback
- Ambiguous transaction outcome
- Secret leakage
- Audit identity
- F-P2-3 append absence

---

## 49. Orchestration Contract Test Matrix

Plan future tests for:

- Scope dispatch
- Account-wide inventory completeness
- Scan-specific derivation
- Evidence-specific allowlist
- Lifecycle action ordering
- Attribution completeness
- Terminal transition
- Deferred consistency
- No partial success
- No-op/zero-target handling
- Conflict handling
- Timeout recovery
- Ambiguous-result review
- Truthful user response
- Residual systems excluded from false completion claim
- No PROD interaction

These tests are **separate** from Block A and Block B database verification.

---

## 50. Future Implementation Decomposition

Future smallest safe packages (**not authorized now**):

| # | Package | Dependencies / gates |
|---|---------|----------------------|
| 1 | Orchestration contract acceptance | This document accepted |
| 2 | Target-derivation module | Contract acceptance; ownership/eligibility review |
| 3 | Scope dispatch | Derivation module; closed vocabulary |
| 4 | Inventory validation | Completeness rules; F-P2-3/F-2 awareness |
| 5 | Operator execution guard | Operator Authorization Design accepted; authority source selected |
| 6 | Atomic database execution boundary | DEV migration applied; Block A PASS; concurrency mechanism accepted |
| 7 | Attribution persistence | Atomic boundary; migration grants |
| 8 | Terminal transition | Attribution + lifecycle success; migration transition guards |
| 9 | Conflict handling | Idempotency/Concurrency Design accepted |
| 10 | Ambiguous-result review | Timeout/ambiguity contract; escalation owner |
| 11 | Audit/observability integration | Audit posture accepted |
| 12 | Residual-message integration | Residual policy recorded; UI/API truthfulness |
| 13 | Orchestration tests | Packages 1–12 design gates; still no PROD |

Each package remains separately gated. Acceptance of this design does not authorize any package.

---

## 51. Open Decisions

Unresolved only — **do not resolve unsupported decisions here:**

1. Exact orchestrator hosting boundary
2. Server route versus supervised command path
3. Execution attempt identity persistence
4. Coordination mechanism
5. Zero-target behavior
6. Already-excluded target behavior
7. Execution-compatible resolution code exposure
8. Audit sink and retention
9. Observability thresholds
10. Ambiguous-result escalation owner
11. Worker/queue need
12. Residual coordination signals
13. Evidence-specific first-release support
14. Any future RPC or schema change

---

## 52. Implementation Preconditions

Implementation remains **prohibited** until:

- Separate DEV project exists
- Migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required
- Technical Design accepted
- API Contract Design accepted
- UI Flow Design accepted
- Security and Abuse Design accepted
- Operator Authorization Design accepted
- Idempotency and Concurrency Design accepted
- This Execution Orchestration Design accepted
- Authority source selected
- Execution capability model approved
- Concurrency coordination mechanism accepted
- Target derivation reviewed
- Residual policy recorded
- Audit/observability posture accepted
- Exact execution baseline approved
- Final security review accepted

---

## 53. Hard Stops

Stop if any of the following are true:

- DEV unresolved
- PROD denylist match
- Migration unapplied
- Block A failure
- Operator authorization unresolved
- Stale request state
- Missing validation milestone
- Incomplete target inventory
- Caller-supplied affected targets
- Arbitrary table routing
- Cross-user target included
- Attribution plan incomplete
- Multiple execution paths may commit
- Partial lifecycle mutation presented as success
- Terminal state set before governed work completes
- Ambiguous result retried blindly
- Post-terminal attribution repair exists
- Service-role treated as human authorization
- Audit identity missing
- Residual systems falsely represented as erased
- Scope creep into account or billing deletion

---

## 54. Current Authorization Boundary

### Authorized now

- Creation and review of this Execution Orchestration Design

### Not authorized

- Orchestrator implementation
- Operator execution implementation
- API implementation
- UI implementation
- Worker/queue implementation
- Transaction/RPC implementation
- Locking implementation
- Retry implementation
- Auth or middleware changes
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 55. Next Safe Step

After acceptance, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway Pre-Implementation Readiness Review**

That review consolidates the accepted application-pathway designs, identifies unresolved blockers, and decides whether any implementation package may be prepared.

It remains **read-only and documentation-only** unless separately authorized.
