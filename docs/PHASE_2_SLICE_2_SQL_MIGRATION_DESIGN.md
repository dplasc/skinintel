# Phase 2 Slice 2 SQL Migration Design

## Status

**Status:** Draft
**Phase:** 2
**Slice:** 2
**Artifact type:** SQL Migration Design
**Depends on:**

- `PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md` (approved)
- `PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` (approved)
- `PHASE_2_SLICE_2_MIGRATION_DESIGN.md` (approved)
- Phase 1 Slice 11 deletion-request governance contract (closed)
- Phase 1 identity and RLS conventions established in Slices 1–5 migrations
- Phase 1 Slice 8 exclusion primitives and reason taxonomy (frozen, unmodified)

This is a SQL migration design document only. It defines the exact proposed persistence shape for review. It contains no executable SQL, creates no migration file, authorizes no database change, and authorizes no application code.

---

## Purpose

This artifact defines the exact proposed persistence shape for the Slice 2 deletion-request governance record **before executable SQL is authorized**.

It translates the approved Migration Design categories — governance record, request-state vocabulary, execution linkage, and new-structure-only access posture — into a concrete, reviewable object and column design. Physical DDL, migration file creation, and execution remain gated subsequent steps.

No architecture is changed by this document. No existing table, view, function, primitive, policy, or grant is proposed for modification.

---

## Approved Persistence Scope

The only approved persistence scope for this migration is the **deletion request governance record** and its **execution attribution**.

Approved and binding:

- One new request table recording governed deletion requests under the Slice 11 intake and residual contracts.
- One new execution-attribution table linking executed requests to excluded session anchors.
- Closed request-workflow and resolution-code vocabularies on the new structures only.
- Database-enforced workflow immutability local to the new governance structure.
- Access posture expressed entirely on the new structures.

These two tables still constitute **one** approved persistence capability: the deletion-request governance record and its execution attribution. They do not expand persistence scope beyond the Migration Design categories.

Explicitly not approved:

- Modification of any existing table, view, function, primitive, policy, grant, or application surface.
- Any write to lifecycle-participating evidence or session rows by the migration itself.
- Any change to Slice 8 primitives, Slice 1A eligibility views, or existing RLS policies.
- Array-based execution linkage on the request row.
- Free-text outcome detail columns.
- Any object outside the new governance structure.

---

## Proposed Database Objects

Design-level object set only. No executable SQL.

| Object class | Proposed object | Role |
|--------------|-----------------|------|
| Table | `public.deletion_requests` (proposed pending gate approval) | Durable governance record of each deletion request |
| Table | `public.deletion_request_executions` (proposed pending gate approval) | Append-only attribution row per request/session execution |
| Vocabulary | Closed `CHECK` constraints on `request_scope`, `request_state`, and `resolution_code` | Enforce closed scopes, workflow states, and resolution codes without database enums |
| Transition guard | One non-`SECURITY DEFINER` trigger function local to the new governance structure | Enforce allowed updates (`received` → `received` validation milestone only; `received` → `executed`; `received` → `rejected`) and field immutability on `deletion_requests` |
| Trigger | One trigger on `public.deletion_requests` | Invoke the transition guard on UPDATE |
| Cross-table consistency guard | One additional non-`SECURITY DEFINER` function local to the two new governance tables only | Enforce end-of-transaction request-state / scope / execution-row cardinality consistency across both new tables |
| Deferred constraint trigger | One deferred constraint trigger on `public.deletion_requests` | Invoke the cross-table consistency guard at transaction end after request-row changes |
| Deferred constraint trigger | One deferred constraint trigger on `public.deletion_request_executions` | Invoke the cross-table consistency guard at transaction end after execution-row inserts |
| Indexes | Ownership/recency, workflow-state, target lookup, execution linkage | Support known access patterns only |
| RLS / grants | Posture on the new tables only | `anon` denied; authenticated ownership-scoped SELECT on requests; service-role workflow authority; executions service-role-only for this slice |

**CHECK versus enum.** Repository evidence (Slices 1–8) uses `text` columns with `CHECK (... IN (...))` for closed vocabularies (`status`, `evidence_status`, and related). No `CREATE TYPE` / database enum appears in the evidence-layer migrations. This design therefore proposes **CHECK-based vocabularies**, not enums, unless gate review explicitly overrides that convention.

**Transition guard posture.** The proposed transition-guard trigger function is **not** `SECURITY DEFINER`. It is a local integrity guard on the new governance structure only. It does not modify, wrap, or replace any existing function, primitive, or policy. Executable trigger SQL is not authored in this document.

**Deferred cross-table consistency guard posture.** One additional non-`SECURITY DEFINER` function, local to the two new governance tables only, enforces request-state / scope / execution-row cardinality consistency at **transaction end**. Coverage is via deferred constraint triggers on both `deletion_requests` and `deletion_request_executions`. These checks run at transaction end so the governed workflow may atomically: (1) invoke the approved lifecycle transition; (2) insert execution attribution rows; (3) transition the deletion request to its terminal state; (4) pass cross-table consistency validation before commit. No partially consistent transaction may commit. Executable trigger SQL is not authored in this document.

**Trigger responsibility separation (do not merge).**

| Guard | Responsible for | Not responsible for |
|-------|-----------------|---------------------|
| Existing `deletion_requests` transition guard | Allowed request-state transitions; `validated_at` milestone semantics; request-row field immutability; timestamp and resolution-code coupling | Cross-table execution-row cardinality; attribution presence/absence by scope |
| New deferred cross-table consistency guard | Request-state / scope / execution-row cardinality consistency; preventing attribution rows for `received`, `rejected`, or `evidence_specific` requests; preventing `executed` session-level requests without required attribution | Allowed transitions; `validated_at` milestones; request-row field immutability; timestamp / resolution-code coupling on the request row alone |

**Privilege summary (application workflow, proposed pending gate approval):**

- On `deletion_requests`: service-role receives `INSERT`, `SELECT`, and constrained `UPDATE` as required for workflow progression; it receives **no** `DELETE` privilege.
- On `deletion_request_executions`: service-role may `INSERT` and `SELECT`; the application workflow receives **no** `UPDATE` or `DELETE` capability — the table is append-only for the application workflow.
- No existing table, function, policy, or grant is modified.

---

## Proposed Table Shape

### `public.deletion_requests`

Primary key: `id`
Schema: `public` only

| Proposed name | Conceptual type | Nullability | Purpose | Integrity rationale |
|---------------|-----------------|-------------|---------|---------------------|
| `id` | `uuid`, default generated | Required | Stable request identifier | Immutable primary key; distinct from session and evidence ids |
| `user_email` | `text` | Required | Owner / requester identity | Matches repository ownership convention on `scan_records`, evidence tables, and `analyses` (`user_email`); RLS compares to JWT email. **Not** an `auth.users` foreign key — no such FK exists on governed evidence tables today |
| `request_scope` | `text` (closed CHECK) | Required | Recognized Slice 11 scope at durable intake | Must be one of `account_wide`, `scan_specific`, `evidence_specific`; structurally valid target shape required at insert; ownership/authority/active-state validation occurs after intake |
| `target_scan_record_id` | `uuid` | Conditional | Target session when scope requires it | Present for `scan_specific`; required with evidence targets for `evidence_specific` (parent session context); **must be null** for `account_wide` |
| `target_evidence_table` | `text` (closed CHECK when present) | Conditional | Evidence table identifier for evidence-specific scope | Closed whitelist aligned with Slice 8 child primitive tables: `user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence` |
| `target_evidence_id` | `uuid` | Conditional | Evidence row identifier for evidence-specific scope | Paired with `target_evidence_table`; both null outside `evidence_specific` |
| `request_state` | `text` (closed CHECK) | Required | Request workflow state | Distinct from evidence lifecycle `active`/`excluded`; default `received` |
| `resolution_code` | `text` (closed CHECK when present) | Conditional | Closed workflow resolution code | Null while `received`; `completed` when `executed`; one of the rejection codes when `rejected`. No free-text outcome detail column in this slice |
| `requested_at` | `timestamptz` | Required | Submission / durable intake timestamp | Server/database-controlled; never accepted as a trusted client value |
| `validated_at` | `timestamptz` | Optional | Governance-validation milestone | Set at most once when post-intake validation succeeds; remains null if rejected before validation completes |
| `resolved_at` | `timestamptz` | Conditional | Terminal resolution timestamp | Set only on transition to `executed` or `rejected`; never changed afterward; null while `received` |
| `created_at` | `timestamptz` | Required | Row creation timestamp | Append-oriented audit baseline; immutable after insert; server/database-controlled |

**Identity convention (verified).** Live migrations use `user_email text NOT NULL` with RLS predicate `lower(user_email) = lower(auth.jwt() ->> 'email')`. Comments on evidence tables explicitly treat this as transitional until a separately authorized auth user-id migration. This design **must not** introduce `auth.users` foreign keys or `user_id uuid` columns without that separate authorization.

**Foreign keys to lifecycle/evidence tables.** Proposed as **absent**: target identifiers on the request row, and `scan_record_id` on execution rows, are opaque `uuid` values without FK constraints onto lifecycle tables. Rationale: Slice 11 audit permanence requires governance records to survive independently of evidence lifecycle and any future physical-deletion work.

**No `updated_at`.** No repository contract on this new structure requires `updated_at`. Workflow progression is expressed by `request_state`, `validated_at`, `resolved_at`, and `resolution_code` under the transition guard. The column is omitted.

**No payload columns.** The table stores request governance metadata only — not evidence content, storage references, or analysis output.

**No array execution columns.** Execution attribution belongs exclusively on `deletion_request_executions`.

### `public.deletion_request_executions`

Primary key: `id`
Schema: `public` only

| Proposed name | Conceptual type | Nullability | Purpose | Integrity rationale |
|---------------|-----------------|-------------|---------|---------------------|
| `id` | `uuid`, default generated | Required | Stable execution-attribution identifier | Immutable primary key for each attribution row |
| `deletion_request_id` | `uuid` | Required | Owning request | References `deletion_requests.id` with restrictive / non-destructive delete behaviour (`ON DELETE RESTRICT` or equivalent); prevents orphaned attribution and prevents destructive cascade that would erase audit history |
| `scan_record_id` | `uuid` | Required | Session anchor excluded under the request | Opaque uuid; **no** foreign key to `scan_records` or any lifecycle table, preserving audit independence |
| `executed_at` | `timestamptz` | Required | When this session exclusion was attributed | Server/database-controlled attribution time for the request/session pair |
| `created_at` | `timestamptz` | Required | Row creation timestamp | Append-only audit baseline; immutable after insert |

**Uniqueness.** Unique constraint on `(deletion_request_id, scan_record_id)` — at most one attribution row per request/session pair.

**Append-only.** Application workflow may insert attribution rows; it must not update or delete them. No client-facing policies on this table for this slice.

---

## Durable Intake Boundary

Governance persistence begins at durable intake, not at completed validation.

### Creates a `received` row

An authenticated request that presents:

- a recognized `request_scope`, and
- a structurally valid target shape for that scope (per Scope Representation invariants)

is inserted as `request_state = received` with `resolution_code` null.

### Occurs after durable intake

The following are **post-intake** governance validation steps and do not block initial persistence when the intake shape is recognized and structurally valid:

- ownership verification
- target existence
- authority boundary checks
- active-state precondition checks
- subsequent authorized lifecycle transition

Failed governance validation transitions the durable request to `rejected` with a closed `resolution_code` (`invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed`, or `execution_failed` as applicable). Accepted governance intake attempts — including those later rejected — leave an auditable record.

### Creates no row

Outside the governance intake boundary, and creating **no** `deletion_requests` row:

- unauthenticated requests
- unparsable HTTP payloads
- structurally malformed payloads that do not yield a recognized scope with a valid target shape

Those failures remain transport/application rejection events, not governance records.

---

## Request State Vocabulary

### Separation from evidence lifecycle

| Model | Domain | Values | Owner |
|-------|--------|--------|-------|
| Evidence lifecycle | Session / evidence eligibility | `active`, `excluded` (+ historical `superseded` on some evidence tables) | Slices 6–8; unchanged |
| Request workflow | Deletion-request governance record | `received`, `executed`, `rejected` | This migration; new tables only |

These models must never share column names that invite conflation (do not name the workflow column `status` or `evidence_status`). Proposed column name: `request_state`.

### Proposed closed request-state vocabulary (minimal)

| State | Meaning | Terminal? |
|-------|---------|-----------|
| `received` | Request durably recorded at intake; governance validation and/or execution not yet completed | No |
| `executed` | Authorized lifecycle transition completed; session attribution rows recorded as required by scope | Yes |
| `rejected` | Request failed post-intake validation, authorization, preconditions, or execution; no successful lifecycle effect | Yes |

**Why not a `validated` state.** Validation is a mandatory stage in the Slice 2 technical design flow, but it is representable as the milestone timestamp `validated_at` without expanding the closed state set.

### Proposed closed `resolution_code` vocabulary

| Code | Used when | Meaning |
|------|-----------|---------|
| `completed` | `executed` | Request completed successfully |
| `invalid_request` | `rejected` | Post-intake validation failed (e.g. target missing or structurally invalid after intake) |
| `duplicate_request` | `rejected` | Convergent duplicate; no second transition |
| `unauthorized_request` | `rejected` | Authority/ownership boundary failure |
| `already_completed` | `rejected` | Target already excluded / terminal lifecycle precondition failure |
| `execution_failed` | `rejected` | Authorized transition attempted but failed without successful completion |

Conceptual enforcement:

- `received` requires `resolution_code` **null**
- `executed` requires `resolution_code = completed`
- `rejected` requires exactly one of: `invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed`, `execution_failed`

No free-text outcome detail column is added in this slice. `resolution_code` does **not** restate or enforce the Slice 8 reason taxonomy; primitives remain the sole enforcer of `user_deletion_request` and related reasons.

### Allowed transitions (conceptual; database-enforced)

```
received  →  received   (validation-milestone update only; see below)
received  →  executed
received  →  rejected
```

No transitions out of `executed` or `rejected`.
No transition from `rejected` to `executed` or the reverse.
Re-submission of a deletion intent for the same target is a **new request row**, not mutation of a terminal row (append-oriented governance).

### Permitted non-terminal update: `received` → `received`

One constrained same-state update is permitted so that `validated_at` can be recorded without inventing a fourth workflow state.

Allowed **only** when all of the following hold:

- `OLD.validated_at` IS NULL
- `NEW.validated_at` IS NOT NULL
- `request_state` remains `received`
- `resolution_code` remains NULL
- `resolved_at` remains NULL
- every other protected field remains unchanged

No other `received` → `received` mutation is permitted.

The validation-milestone update must not allow changes to:

- `id`
- `user_email`
- `request_scope`
- `target_scan_record_id`
- `target_evidence_table`
- `target_evidence_id`
- `requested_at`
- `created_at`
- `resolution_code`
- `resolved_at`

### Terminal transition paths relative to `validated_at`

Terminal transition may occur:

- **directly from `received` with `validated_at` null** when validation fails before successful validation, producing `rejected` (e.g. `invalid_request`, `unauthorized_request`, `duplicate_request`, `already_completed` as applicable)
- **from `received` with `validated_at` populated** after successful validation, producing `executed` (`resolution_code = completed`) or a later `rejected` outcome such as `execution_failed` or `already_completed`

### Transition-guard immutability (design level)

The non-`SECURITY DEFINER` trigger on `deletion_requests` must enforce:

- permitted updates only:
  - `received` → `received` under the validation-milestone constraints above
  - `received` → `executed`
  - `received` → `rejected`
- no other same-state mutation
- no transition out of `executed` or `rejected`
- immutable `id`
- immutable `user_email`
- immutable `request_scope` and all target identifiers
- immutable `requested_at` and `created_at`
- after `validated_at` is set: it is immutable — it cannot be cleared and cannot be replaced
- `resolved_at` may be set only on terminal transition and never changed afterward
- `resolution_code` may be set only on terminal transition and never changed afterward

### Timestamp coupling

Governance timestamps are **server/database-controlled** and never accepted as trusted client values.

- `requested_at` / `created_at` set at insert; immutable thereafter.
- `validated_at` may be set exactly once via the permitted `received` → `received` update on successful post-intake validation; remains null when rejection occurs before successful validation; after set, immutable (cannot be cleared or replaced).
- `resolved_at` set exactly once on transition to `executed` or `rejected`; never changed afterward.
- Ordering invariant: `requested_at` ≤ `validated_at` (when present) ≤ `resolved_at` (when present).

---

## Scope Representation

Slice 11 requires three scopes. Slice 2 activates only the first session-level consumer, but the structure must represent the full contract without foreclosing later consumers.

### Scope values

| `request_scope` | Meaning |
|-----------------|---------|
| `account_wide` | All lifecycle-participating sessions and evidence owned by the account |
| `scan_specific` | One session anchor and its lifecycle-participating children |
| `evidence_specific` | One child evidence row in the approved evidence table set |

### Target invariants (conceptual CHECK family)

Invalid structural combinations must be impossible at insert (durable intake shape):

| Scope | `target_scan_record_id` | `target_evidence_table` | `target_evidence_id` |
|-------|-------------------------|-------------------------|----------------------|
| `account_wide` | **NULL** | **NULL** | **NULL** |
| `scan_specific` | **REQUIRED** | **NULL** | **NULL** |
| `evidence_specific` | **REQUIRED** (parent session for ownership context) | **REQUIRED** (whitelist) | **REQUIRED** |

Additional rules:

- When `target_evidence_table` is present, it must be one of the four Slice 8 whitelist names.
- `target_evidence_table` and `target_evidence_id` are both null or both present — never mixed.
- Structural validity of scope/target shape is required for durable intake as `received`.
- Ownership, target existence, authority, and active-state validation remain **post-intake** and may produce `rejected` with a closed `resolution_code` without erasing the auditable request row.

This deliberately does **not** overfit the table to session-only execution: account-wide and evidence-specific shapes are first-class even though Slice 2’s first consumer executes session-level exclusion only.

---

## Execution Linkage

### Requirement

An executed request must be traceably linked to the session(s) it excluded, satisfying the Slice 11 verification obligation that governance outcomes are attributable to their originating request. No orphaned execution: every attribution row references exactly one originating request.

### Normalized two-table representation (proposed pending gate approval)

Array-based linkage (`executed_scan_record_ids uuid[]`) is **rejected**.

Execution attribution is normalized:

- `deletion_requests` — request governance record
- `deletion_request_executions` — one append-only attribution row per request/session execution

Together these remain one approved persistence capability: the deletion-request governance record and its execution attribution.

### Cardinality

| Scope | On successful `executed` | Attribution rows |
|-------|--------------------------|------------------|
| `account_wide` | One row per session anchor excluded under the request | One request → many execution rows |
| `scan_specific` | Exactly one row; `scan_record_id` equals `target_scan_record_id` | One request → one execution row |
| `evidence_specific` | No session-exclusion attribution rows required (child-level path does not exclude session anchors); attribution remains on request targets + terminal state/`resolution_code` | Zero execution rows |

Additional assumptions:

- Unique `(deletion_request_id, scan_record_id)` prevents duplicate attribution for the same pair.
- Multiple distinct requests may historically attribute the same `scan_record_id` over time (e.g. rejected then later successful); uniqueness is per request, not global per session.
- Child evidence excluded by session propagation is **not** duplicated into `deletion_request_executions`; session-level attribution plus Slice 8 primitive metadata remain the audit surface for propagation.
- `deletion_request_id` FK uses restrictive / non-destructive delete behaviour so attribution cannot orphan and request history cannot be cascade-destroyed.
- `scan_record_id` has **no** FK to lifecycle tables.

### Consistency rules when `request_state = executed`

- `resolved_at` is present.
- `resolution_code = completed`.
- For `account_wide` / `scan_specific`: one or more `deletion_request_executions` rows exist for the request, consistent with the cardinality rules above.
- For `scan_specific`: exactly one execution row matching `target_scan_record_id`.
- For `evidence_specific`: zero execution rows; request target columns remain populated.

### Consistency rules when `request_state = rejected`

- `resolved_at` is present.
- `resolution_code` is one of the five rejection codes.
- No `deletion_request_executions` rows exist for the request — rejection must not claim session execution attribution.

### Deferred cross-table consistency (end of transaction)

Row-local CHECKs and the `deletion_requests` transition guard cannot alone guarantee consistency between request state and execution attribution when both tables are written in one atomic workflow. That responsibility belongs exclusively to the deferred cross-table consistency guard (see Proposed Database Objects).

**Required end-of-transaction invariants** (enforced by the deferred guard; no partially consistent transaction may commit):

| Condition at commit | Required invariant |
|---------------------|--------------------|
| `request_state = received` | Zero `deletion_request_executions` rows |
| `request_state = rejected` | Zero `deletion_request_executions` rows |
| `request_state = executed` and `request_scope = scan_specific` | Exactly one execution row; that row’s `scan_record_id` equals `target_scan_record_id` |
| `request_state = executed` and `request_scope = account_wide` | At least one execution row |
| `request_state = executed` and `request_scope = evidence_specific` | Zero session execution rows |
| Every `deletion_request_executions` row | Parent request must be `executed` at transaction end; parent scope must be `account_wide` or `scan_specific` |

**Retained linkage constraints (unchanged):**

- Unique `(deletion_request_id, scan_record_id)`
- Restrictive FK to `deletion_requests`
- No lifecycle FK on `scan_record_id`
- Append-only application posture
- No UPDATE or DELETE capability on execution rows for the application workflow
- No `SECURITY DEFINER`
- No modification of existing objects

**Atomic workflow implication.** Because the deferred constraint triggers fire at transaction end, intermediate mid-transaction states (for example: attribution inserted before the request row reaches `executed`) are permitted inside the transaction and must either become fully consistent before commit or cause full rollback.

---

## Access and RLS Posture

Applies to the new governance structures only. No existing table policy changes.

### `public.deletion_requests`

| Role / actor | Proposed posture |
|--------------|------------------|
| `anon` | No access — revoke all table privileges; no policies that admit anonymous reads or writes |
| `authenticated` | **SELECT only**, ownership-scoped: `lower(user_email) = lower(auth.jwt() ->> 'email')`, mirroring existing evidence-table policy form |
| `authenticated` writes | **No** INSERT, UPDATE, or DELETE policies |
| `service_role` | `INSERT`, `SELECT`, and constrained `UPDATE` for workflow progression under the transition guard; **no** `DELETE` privilege |
| Broad grants | Forbidden — no PUBLIC grants; no grant of write privilege to client-facing roles |

### `public.deletion_request_executions`

| Role / actor | Proposed posture |
|--------------|------------------|
| `anon` | No access |
| `authenticated` | **No client-facing policies for this slice.** Authenticated observation of execution rows is deferred unless a later gate explicitly justifies an ownership-safe design (e.g. join-filtered SELECT through owning `deletion_requests`). Default for Slice 2: service-role-only |
| `service_role` | May `INSERT` and `SELECT` attribution rows; application workflow receives **no** `UPDATE` or `DELETE` — append-only |
| Broad grants | Forbidden |

**Governance justification for denying client writes.** Slice 11 separates request initiation from execution authority. Persisting and progressing the governance record is workflow processing, not a client self-service mutation. Allowing authenticated UPDATE on `request_state`, `resolution_code`, or execution attribution would let a client forge governance outcomes.

**SECURITY DEFINER.** Not proposed for workflow processing. The transition-guard function is explicitly non-`SECURITY DEFINER` and local to the new structure.

**Policy naming (proposed pending gate approval, non-SQL).** One SELECT policy on `deletion_requests` in the style of existing policies, e.g. conceptually “Users can read own deletion requests.” Exact policy names are fixed at SQL draft time.

---

## Integrity Constraints

Conceptual constraints binding on the future SQL draft:

1. **Primary keys** — `deletion_requests.id` and `deletion_request_executions.id` unique, non-null, generated.
2. **Ownership** — `user_email` required and non-empty after trim on every request row.
3. **Request-state vocabulary** — `request_state` CHECK-closed to `received` | `executed` | `rejected`; default `received`.
4. **Resolution-code vocabulary** — `resolution_code` CHECK-closed to `completed` | `invalid_request` | `duplicate_request` | `unauthorized_request` | `already_completed` | `execution_failed` when present.
5. **State/resolution consistency** — `received` ⇒ `resolution_code` null; `executed` ⇒ `completed`; `rejected` ⇒ one of the five rejection codes.
6. **Request-scope vocabulary** — `request_scope` CHECK-closed to `account_wide` | `scan_specific` | `evidence_specific`.
7. **Scope/target consistency** — composite CHECK (or equivalent) enforcing the Scope Representation matrix; malformed mixed-scope rows are impossible at intake.
8. **Evidence table whitelist** — when present, `target_evidence_table` restricted to the four lifecycle-participating evidence table names.
9. **Evidence target pairing** — `target_evidence_table` and `target_evidence_id` both null or both non-null.
10. **Timestamp ordering** — `requested_at` ≤ `validated_at` (if set) ≤ `resolved_at` (if set); `created_at` present at insert; all governance timestamps server/database-controlled.
11. **Terminal-state rules** — `executed` and `rejected` require `resolved_at` and a compatible `resolution_code`; `received` requires `resolution_code` and `resolved_at` both null (`validated_at` may be null or set while still `received`).
12. **Validation-milestone uniqueness** — `validated_at` may transition from null to non-null at most once via the sole permitted `received` → `received` update; thereafter immutable (no clear, no replace).
13. **Execution FK** — `deletion_request_executions.deletion_request_id` references `deletion_requests` with restrictive / non-destructive delete behaviour.
14. **No lifecycle FKs** — no foreign key from request targets or `scan_record_id` onto lifecycle/evidence tables.
15. **Execution uniqueness** — unique `(deletion_request_id, scan_record_id)`.
16. **Execution-link consistency** — attribution rows only for successful session-excluding executions; none for rejected requests; cardinality per Execution Linkage.
17. **Workflow immutability** — transition-guard trigger enforces the three permitted update classes (`received` → `received` validation milestone only; `received` → `executed`; `received` → `rejected`) and the field immutability rules listed under Request State Vocabulary. This guard remains responsible only for allowed request-state transitions, `validated_at` milestone semantics, request-row field immutability, and timestamp / resolution-code coupling — not for cross-table execution cardinality.
18. **Deferred cross-table consistency** — one additional non-`SECURITY DEFINER` guard function, with deferred constraint trigger coverage on both `deletion_requests` and `deletion_request_executions`, enforces the end-of-transaction invariants in Execution Linkage (state/scope/cardinality; no attribution for `received` / `rejected` / `evidence_specific`; required attribution for executed session-level scopes; every execution row’s parent must be `executed` with scope `account_wide` or `scan_specific`). Responsibilities must not be merged ambiguously with the transition guard.
19. **Append-oriented permanence** — no DELETE privilege for the application workflow on either table; rejected request rows and execution attribution rows remain permanent governance evidence.
20. **No conflation with lifecycle columns** — no `status` / `evidence_status` / `status_reason` columns on these tables that could be mistaken for Slice 8 transition metadata.

---

## Indexing Strategy

Indexes justified only by known access patterns. No speculative covering indexes. No array/GIN indexes.

| Proposed index intent | Columns (conceptual) | Justification |
|-----------------------|----------------------|---------------|
| Ownership and recent requests | `deletion_requests (user_email, requested_at DESC)` | Authenticated owner read of own request history; mirrors existing ownership indexes |
| Workflow processing by state | `deletion_requests (request_state, requested_at ASC)` | Service-role workflow scan of non-terminal (`received`) requests in intake order |
| Target lookup (session) | `deletion_requests (target_scan_record_id)` where not null | Locate requests affecting a given session (duplicate/convergent request review) |
| Target lookup (evidence) | `deletion_requests (target_evidence_table, target_evidence_id)` where both present | Locate evidence-specific requests by target |
| Execution by request | `deletion_request_executions (deletion_request_id)` | Load all session attributions for a request |
| Execution reverse lookup | `deletion_request_executions (scan_record_id)` | Verify which request(s) attributed exclusion of a session |

Avoid indexes on free-text fields (none proposed) or unconstrained full-table patterns.

---

## Dormant-On-Arrival Behaviour

Consistent with the approved Migration Design and Phase 1 / Slice 1A forward-only practice, the migration:

- Creates **empty** `deletion_requests` and `deletion_request_executions` structures (plus the local transition-guard function and trigger, the additional non-`SECURITY DEFINER` cross-table consistency guard function, and deferred constraint triggers on both new tables).
- Performs **no backfill** from existing tables or historical events.
- Invokes **no** Slice 8 lifecycle primitive.
- Changes **no** evidence or session lifecycle state.
- Modifies **no** existing object privilege, policy, function, or grant.
- Is **not consumed** by application code until a later approved implementation step introduces the governed workflow write path.

Immediately after migration execution, every pre-existing table’s row content is identical to its pre-migration state, and both new tables contain zero rows. The deferred cross-table guard is present but dormant until the first governed write transaction; it does not alter any pre-existing data.

---

## Validation Plan

Post-migration verification categories for the future migration execution report. Verification SQL is **not** authored here.

1. **New object inventory** — `deletion_requests`, `deletion_request_executions`, the local transition-guard function and trigger on `deletion_requests`, the additional non-`SECURITY DEFINER` cross-table consistency guard function, and deferred constraint triggers on both new tables exist; no unexpected sibling objects created.
2. **Column and constraint verification** — column sets, nullability, defaults, CHECK vocabularies, scope/target invariants, resolution-code consistency, unique `(deletion_request_id, scan_record_id)`, and restrictive request FK match the approved SQL draft.
3. **RLS enabled** — row level security is enabled on both new tables.
4. **Policy and grant verification** — authenticated ownership-scoped SELECT on `deletion_requests` only; no client write policies; `deletion_request_executions` has no client-facing policies; grants match the approved matrix; no application DELETE on either table; no UPDATE/DELETE on executions for the application workflow.
5. **Anon denied** — `anon` holds no usable privilege on either new table.
6. **Ownership-scoped authenticated read behaviour** — an authenticated principal can read only own `deletion_requests` rows; cross-account reads fail.
7. **Service-role workflow authority** — service-role can insert requests, perform constrained updates under the transition guard, and insert execution attribution rows; no `SECURITY DEFINER` workflow function introduced.
8. **Transition-guard behaviour** — verify all of the following:
   - the one allowed `received` → `received` `validated_at` update succeeds (null → non-null; state, `resolution_code`, and `resolved_at` unchanged; all other protected fields unchanged)
   - a second `validated_at` mutation fails
   - any other same-state (`received` → `received`) mutation fails
   - `validated_at` cannot be cleared
   - terminal transitions still work correctly afterward: `received` → `executed` and `received` → `rejected` (including direct rejection with `validated_at` still null, and terminal outcomes after `validated_at` is populated), with correct timestamp and `resolution_code` coupling
   - illegal state transitions and mutations of immutable fields are rejected
9. **Deferred cross-table consistency behaviour** — verify all of the following future cases (transaction-scoped; inconsistent transactions must roll back fully):
   - `scan_specific` executed with exactly one matching execution row succeeds
   - `scan_specific` executed with zero rows fails
   - `scan_specific` executed with wrong session id fails
   - `scan_specific` executed with more than one distinct session fails
   - `account_wide` executed with one or more rows succeeds
   - `account_wide` executed with zero rows fails
   - `evidence_specific` executed with an execution row fails
   - `received` request with an execution row fails at commit
   - `rejected` request with an execution row fails at commit
   - execution row whose parent remains `received` fails at commit
   - execution row whose parent is `rejected` fails at commit
   - the complete valid atomic workflow (lifecycle transition + attribution insert(s) + terminal request transition) commits successfully
   - any inconsistent transaction is rolled back fully
10. **No changes to existing objects** — tables, views, functions, constraints, grants, and RLS policies outside the new governance structure are byte-identical to the pre-migration baseline.
11. **No data changes** — every lifecycle-participating table retains pre-migration row state.
12. **New tables empty** — both new tables have zero rows.
13. **Capture regression baseline** — full capture through `POST /api/scan` behaves identically before and after migration.
14. **Build validation** — `npm run build` passes after any accompanying repository change (documentation-only change still recorded).

---

## SQL-Specific Risks

Risks created by the proposed database shape only:

- **Identity convention mismatch.** Introducing `user_id` / `auth.users` FKs would diverge from the verified `user_email` convention and break RLS alignment with existing tables.
- **Scope/target ambiguity.** Without composite CHECKs, mixed-scope rows corrupt governance meaning and force forward migrations.
- **State and resolution-code lock-in.** Once populated, `request_state` and `resolution_code` vocabularies become governance contracts; extending them requires a reviewed forward migration.
- **Mutable governance history.** Absent or weak transition-guard enforcement, or granting DELETE / unconstrained UPDATE, would undermine append-oriented audit permanence.
- **Over-broad RLS.** Any policy broader than ownership-scoped SELECT on requests, any anon access, or premature authenticated access to execution rows, discloses deletion intent — itself sensitive governance metadata.
- **Execution linkage integrity.** Missing uniqueness on `(deletion_request_id, scan_record_id)`, allowing UPDATE/DELETE on executions, or adding a lifecycle FK on `scan_record_id`, would weaken attribution or audit independence.
- **Cross-table consistency gap.** Without deferred end-of-transaction enforcement spanning both new tables, a request could commit as `executed` without required attribution, or attribution rows could commit against `received` / `rejected` / `evidence_specific` parents — producing partially consistent governance history that row-local CHECKs and the request-only transition guard cannot prevent.
- **Immediate (non-deferred) cross-table checks.** Enforcing cardinality on each statement rather than at transaction end would break the approved atomic workflow (lifecycle transition → attribution insert(s) → terminal request transition → consistency validation before commit).
- **Intake-boundary leakage.** Persisting unauthenticated or structurally malformed payloads as governance rows would pollute the audit surface; conversely, failing to persist recognized but later-rejected intake would violate the auditable-rejection obligation.
- **Privacy sensitivity of deletion request metadata.** Request and attribution rows record who asked to delete what; indexes, grants, and SELECT policies are privacy controls, not merely performance details.
- **Trigger-function privilege mistakes.** Accidentally marking the transition guard or the cross-table consistency guard `SECURITY DEFINER`, or attaching either to any existing table, would expand privilege/surface beyond the approved new-structure-only scope.
- **Ambiguous guard merge.** Folding cross-table cardinality into the request transition guard, or folding transition/immutability rules into the deferred guard, would obscure failure modes and complicate future review.

---

## Decisions Requiring Gate Approval

Every item below must be explicitly approved before SQL drafting:

1. **Table names** — proposed `public.deletion_requests` and `public.deletion_request_executions` (pending gate approval).
2. **Owner identifier convention** — proposed `user_email text NOT NULL` (no `auth.users` FK; no `user_id`).
3. **CHECK versus enum** — proposed CHECK-only closed vocabularies.
4. **Exact request-state vocabulary** — proposed `{received, executed, rejected}` with `validated_at` as milestone, not a fourth state.
5. **Exact resolution-code vocabulary** — proposed `{completed, invalid_request, duplicate_request, unauthorized_request, already_completed, execution_failed}` with the state/code consistency rules above; no free-text outcome column.
6. **Target representation** — proposed nullable `target_scan_record_id`, `target_evidence_table`, `target_evidence_id` with the scope matrix invariants; evidence-specific requires parent session id.
7. **Durable intake boundary** — proposed: recognized scope + structurally valid targets → insert as `received`; ownership/existence/authority/active-state validation after intake; malformed/unauthenticated payloads create no row.
8. **Execution-link representation** — proposed normalized `deletion_request_executions` (reject uuid-array linkage); restrictive FK to requests; no lifecycle FK on `scan_record_id`; unique `(deletion_request_id, scan_record_id)`.
9. **Foreign keys to lifecycle tables** — proposed **absent** on all target/session identifiers.
10. **Timestamp set** — proposed `requested_at`, `validated_at` (nullable), `resolved_at` (terminal), `created_at`; **no** `updated_at`; server/database-controlled values only.
11. **Transition-guard design** — proposed one non-`SECURITY DEFINER` trigger function and one trigger on `deletion_requests` enforcing: the sole permitted `received` → `received` validation-milestone update; `received` → `executed`; `received` → `rejected`; post-set immutability of `validated_at` (no clear, no replace); and the other immutability rules above. Remains responsible for allowed transitions, `validated_at` milestone semantics, request-row field immutability, and timestamp / resolution-code coupling only.
12. **Deferred cross-table consistency guard** — proposed one additional non-`SECURITY DEFINER` function local to the two new governance tables, with deferred constraint trigger coverage on both `deletion_requests` and `deletion_request_executions`, enforcing the end-of-transaction invariants in Execution Linkage so the atomic workflow (lifecycle transition → attribution insert(s) → terminal request transition → consistency validation) can commit only when fully consistent. Responsible only for state/scope/execution-row cardinality consistency; must not absorb transition-guard responsibilities.
13. **RLS / privilege posture** — proposed authenticated ownership-scoped SELECT on requests only; executions service-role-only for this slice; service-role INSERT/SELECT/constrained UPDATE on requests; no DELETE on either table for the application workflow; executions append-only (INSERT only) for the application workflow.
14. **Grant hardening style** — proposed explicit revoke from `PUBLIC`/`anon` and least-privilege grants on the new tables only, consistent with Slice 1A sensitivity posture.

---

## Out of Scope

This SQL migration design explicitly excludes:

- Executable SQL
- Migration file creation
- Executable trigger SQL
- Modifying existing tables
- Modifying existing RLS policies
- Modifying exclusion primitives (`exclude_scan_record`, `exclude_evidence_row`)
- Modifying eligibility views
- Invoking lifecycle transitions
- Application code
- API changes
- UI changes
- Analytics
- Performance optimisation beyond the justified indexes above
- Security redesign beyond new-structure-only RLS/grants and the local transition guard
- Physical deletion or storage cleanup
- Free-text outcome detail columns
- Array-based execution linkage
- MotionForge or any cross-project artifacts

---

## Exit Criteria

A SQL draft or migration file may be authorized only when all of the following hold:

1. **This SQL Migration Design is reviewed and accepted** at gate review.
2. **Every Decisions Requiring Gate Approval item is dispositioned** (accepted as proposed or replaced with an explicit alternate) and recorded.
3. **Approved persistence scope remains singular** — deletion-request governance record and its execution attribution only; no expansion to evidence tables, primitives, or views.
4. **Two-table execution-linkage design is locked**, including restrictive request FK, no lifecycle FK on `scan_record_id`, uniqueness, append-only application posture, and the deferred end-of-transaction cross-table consistency invariants.
5. **Request-state vocabulary, resolution-code vocabulary, durable intake boundary, and scope/target invariants are locked** as contracts for the SQL draft.
6. **Transition-guard design is locked** — non-`SECURITY DEFINER`, local to `deletion_requests`, enforcing the sole permitted `received` → `received` validation-milestone update, the two terminal transitions, post-set `validated_at` immutability, and the other listed immutability rules (transitions, milestone semantics, request-row immutability, timestamp / resolution-code coupling only).
7. **Deferred cross-table consistency guard is locked** — one additional non-`SECURITY DEFINER` function local to the two new tables; deferred constraint trigger coverage on both `deletion_requests` and `deletion_request_executions`; end-of-transaction invariants and atomic-workflow commit semantics as specified; responsibilities not merged with the transition guard.
8. **RLS and privilege posture are locked** — authenticated ownership-scoped read on requests; executions service-role-only for this slice; anon denied; no application DELETE; executions append-only.
9. **Timestamp set without `updated_at` is locked**, including server/database control of governance timestamps and the `validated_at` once-only milestone semantics.
10. **Dormant-on-arrival and validation plan are accepted** as binding on the migration execution report, including the explicit `validated_at` guard verification cases and the deferred cross-table consistency verification cases.
11. **No executable SQL has been drafted and no database change has occurred** during this design step.

Only after these criteria are met may the subsequent SQL draft artifact begin — still without execution until that draft’s own approval.

---

*End of Phase 2 Slice 2 SQL Migration Design.*
