# Phase 2 Slice 2 — Application Deletion Pathway C-01 Validation Gate Decision Record

- Status: Draft decision selected — pending acceptance
- Decision ID: C-01
- Readiness blocker mapping: B-19
- Review baseline: `9a610f7468199fb682c4b7af4fbcf0a522a4e20b`
- Selected decision: validate before execute
- Existing artifact reconciliation: not authorized
- Application implementation: not authorized
- Database execution: not authorized
- DEV execution gate: blocked
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Decision Summary

**Selected decision:** Option A — Validate before execute.

**Affected blocker IDs:** C-01 and B-19 (same conflict under two IDs; selection of C-01 selects the architectural resolution for B-19).

**Practical meaning:**

- Validation is a distinct authorized operator action that may set `validated_at` once while `request_state` remains `received`.
- Execution is a distinct authorized operator action that may begin only after `validated_at` is already non-null.
- The execution handler and orchestrator must never set, replace, clear, or reinterpret `validated_at`.
- Missing `validated_at` at execution entry fails closed with no workflow mutation.

**What remains prohibited:**

- Application implementation
- Existing-artifact reconciliation in this task
- Database migration apply, Block A, Block B
- Supabase / DEV / PROD contact
- Treating overall readiness as PASS
- Treating B-04 (segregation of duties) or other blockers as resolved by this record

---

## 2. Decision Scope

This record resolves **only** the architectural decision represented by **C-01 / B-19**: whether validation must complete through a distinct authorized action before execution, or whether execution may set `validated_at` when absent.

It does **not** resolve:

- operator authority source
- segregation of duties
- step-up authentication
- idempotency
- duplicate policy
- concurrency mechanism
- rate limits
- CSRF
- orchestration hosting
- residual policy
- DEV provisioning
- runtime verification

---

## 3. Authoritative Inputs

Read-only review performed against the following thirteen artifacts (exact paths and relevant sections):

1. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md`
   - Especially §8 (presentation), §9 (validation workflow), **§10 (execution orchestration — conflict side A)**, §11 (F-P2-3), §17 (API planning boundary)
2. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md`
   - Especially §7 (domain vocabulary), §13 (validation service), §14 (execution orchestrator), §16 (concurrency)
3. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md`
   - Especially §18 (status mapping), §19 (operator validation), §20 (operator execution), §22 (operator authorization boundary)
4. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`
   - Especially §5 (protected assets including `validated_at`), §12 (operator authorization boundary), §13 (service-role boundary), §20 (duplicate/concurrency abuse including validate/execute races), §22 (fail-closed privileged execution)
5. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md`
   - Especially §5 (privileged operations inventory), §8 (capability matrix), **§9 (validation versus execution separation)**, §19 (validation authorization), §20 (execution authorization), §26 (segregation of duties — open)
6. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md`
   - Especially §28 (validation concurrency), §29 (execution concurrency), §30 (validation versus execution race), §31 (stale-state protection), §32 (terminal immutability)
7. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md`
   - Especially **§9 (execution entry preconditions)**, **§10 (forbidden entry conditions)**, §14 (fresh request-state check), **§28 (validation milestone treatment)**, §29 (terminal transition)
8. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md`
   - Especially §7 (cross-artifact conflict **C-01**), §8 (persistence vocabulary lock), §20 (blocking register **B-19**)
9. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md`
   - Especially **§6 (C-01 conflict record)**, **§7 (C-01 closure package)**, §8 (blocker register), §11 (Wave 0), **§42 (first decision record)**
10. `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md`
    - Lifecycle / validation strategy context for Slice 2 consumer posture
11. `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`
    - Especially Request State Vocabulary; `validated_at` milestone (not a fourth state); allowed `received` → `received` milestone update; executed requires prior milestone
12. `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`
    - `request_state` CHECK (`received` | `executed` | `rejected`); `validated_at` column and set-once immutability; transition guard requiring milestone via `received` → `received` only; `executed` requires non-null `validated_at`; prohibition on setting `validated_at` during terminalization
13. `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql`
    - Verification expectations for milestone set-once, clear/replace prohibition, terminalization-without-prior-milestone rejection, and executed-requires-validated_at checks

No inspected file was modified by this task.

---

## 4. Conflict Statement

### Pathway Plan §10 (conflict side A)

`docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` §10 currently permits the atomic execution transaction to include:

> “(a) set validation milestone if not already set”

as step (a) within the single atomic execution transaction, before invoking primitives, inserting attribution rows, and transitioning to terminal `executed`.

### Execution Orchestration Design §§9–10 and §28 (conflict side B)

`docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md` currently requires:

- **§9:** execution may begin only when `request_state` is `received` and `validated_at` is non-null (among other preconditions).
- **§10:** execution must not begin when the request is unvalidated (`validated_at` null).
- **§28:** `validated_at` is a prerequisite milestone, not a fourth `request_state`; execution cannot set or reinterpret it as a new state; missing/stale milestone blocks execution; validation and execution remain distinct authorized actions.

Both positions are recorded accurately. This record selects between them; it does not exaggerate either side.

---

## 5. Decision Question

Must validation be completed through a distinct authorized action before execution, or may the execution operation set `validated_at` when it is absent?

---

## 6. Evaluated Options

### Option A — Validate before execute

| Criterion | Assessment |
|-----------|------------|
| Authorization clarity | High — `request_validate` and `request_execute` remain separate checks |
| Separation of capabilities | Strong — validation cannot be silently bundled into execution |
| Stale-state behavior | Clear — missing milestone fails closed at execution entry |
| Auditability | High — distinct validator and executor evidence |
| Concurrency risk | Lower for authorization semantics; races remain, but fail-closed |
| Operator UX | Two explicit actions; execution gated until validated |
| Migration compatibility | Strong — matches set-once `received` → `received` milestone and executed-requires-prior-`validated_at` |
| Implementation complexity | Moderate — two handlers/actions, clearer contracts |
| Compliance/truthfulness risk | Lower — validation is not silently equated with destructive execution |

### Option B — Validate inside execute

| Criterion | Assessment |
|-----------|------------|
| Authorization clarity | Weak — one call may perform two privileged effects |
| Separation of capabilities | Weakened — execution path can perform validation |
| Stale-state behavior | Ambiguous — “if not already set” invites repair-inside-execute |
| Auditability | Weaker — validation attribution may collapse into execution |
| Concurrency risk | Higher — validate/execute races and privilege combination |
| Operator UX | One-step destructive path; less explicit checkpoint |
| Migration compatibility | Partial/fragile — DB still requires a distinct `received` → `received` milestone update before terminalization; bundling still conflicts with orchestration preconditions |
| Implementation complexity | Appears simpler operationally; higher authz/audit complexity |
| Compliance/truthfulness risk | Higher — validation may be silently bundled with destructive execution |

### Option C — Hybrid conditional validation during execution

| Criterion | Assessment |
|-----------|------------|
| Authorization clarity | Mixed — multiple entry semantics |
| Separation of capabilities | Conditional; easy to erode |
| Stale-state behavior | More race and branch complexity |
| Auditability | Branch-dependent attribution |
| Concurrency risk | Highest among the three for initial contract |
| Operator UX | Harder guidance (“sometimes validate first, sometimes not”) |
| Migration compatibility | Possible only with careful branching; still weakens deterministic authz |
| Implementation complexity | Highest |
| Compliance/truthfulness risk | Elevated by non-deterministic operator semantics |

---

## 7. Selected Decision

**Option A — Validate before execute**

Selected unambiguously.

Binding selected posture:

1. Validation is a separately authorized action.
2. Execution is a separately authorized action.
3. A deletion request must remain in database state `received` during validation.
4. Successful validation sets `validated_at` exactly once.
5. `validated_at` is a milestone, not a fourth `request_state`.
6. Execution may begin only when:
   - `request_state = received`
   - `validated_at IS NOT NULL`
   - the request is not resolved or terminal
   - fresh execution authorization succeeds
7. The execution handler and orchestrator must never set, replace, clear, or reinterpret `validated_at`.
8. Missing `validated_at` at execution entry produces a safe fail-closed conflict or precondition response with no workflow mutation.
9. Validation and execution capability separation does not itself decide whether the same human may perform both actions.
10. Validator/executor segregation remains the separate **B-04** decision.
11. No SQL or migration change is required by this decision.
12. Pathway Plan §10 must later be reconciled to remove the execution-time validation-milestone step.
13. No existing artifact is modified by this decision-record task.
14. C-01/B-19 implementation dependency remains blocked until the accepted decision is reconciled into affected artifacts through a separately authorized targeted package.

---

## 8. Decision Rationale

Option A is selected because it:

- aligns with the accepted Operator Authorization Design (`request_validate` ≠ `request_execute`; §9, §19, §20)
- preserves distinct validation and execution capabilities
- supports fresh execution precondition checking (Orchestration §9 / §14)
- reduces hidden privilege escalation by preventing execution from performing validation
- improves audit clarity through separate validator and executor evidence
- avoids validation being silently bundled with destructive execution
- aligns with the accepted Execution Orchestration Design §§9–10 and §28
- is compatible with the existing migration vocabulary and transition rules without changing database objects:
  - `validated_at` set at most once via `received` → `received`
  - `validated_at` must already be non-null for `executed`
  - `validated_at` must not be introduced during terminalization

---

## 9. Database-State Contract

Exact database vocabulary (unchanged by this decision):

**States (`request_state`):**

- `received`
- `executed`
- `rejected`

**Validation milestone:**

- `validated_at`

**Explicit rules:**

- “Validated” is **not** a fourth `request_state`.
- Successful validation keeps `request_state = received` and sets `validated_at` once.
- Successful execution later transitions `request_state` to `executed` (with `resolution_code = completed` and `resolved_at` under migration rules).
- Rejection remains a distinct terminal path (`rejected`) and may occur with `validated_at` null (early rejection) or non-null (post-milestone rejection), per migration semantics.

---

## 10. Validation Action Contract

Conceptual contract only — **not implemented by this task**.

Future validation action:

- requires `request_validate` or accepted equivalent capability
- reloads current request state server-side before mutation
- operates only on an eligible `received` request
- sets `validated_at` once (null → non-null) while remaining `received`
- does not execute lifecycle actions
- does not create execution attribution rows
- does not transition to `executed`
- produces audit evidence for the validation outcome
- stale, already-validated, or terminal requests conflict safely (fail closed; no overwrite)

---

## 11. Execution Entry Contract

Execution may begin only when all of the following hold (in addition to other future gates outside this decision):

- `request_state = received`
- `validated_at IS NOT NULL`
- request is not terminal (`executed` / `rejected`)
- fresh `request_execute` authorization succeeds
- verified environment
- complete target inventory (server-derived)
- all future execution gates satisfied (authority source, concurrency mechanism, hosting, residual policy, DEV/runtime gates, etc.)

---

## 12. Execution Prohibitions

Execution must not:

- set `validated_at`
- replace `validated_at`
- clear `validated_at`
- validate implicitly
- reinterpret validation as a fourth database state
- bypass a missing milestone
- bundle unauthorized validation capability into the execute path
- mutate an unvalidated request toward lifecycle effects or terminal success

---

## 13. Missing-Milestone Behavior

If execution is attempted while `validated_at` is null:

- fail closed
- no lifecycle action
- no execution attribution
- no terminal transition
- no automatic validation
- return a safe conflict / precondition response category (exact HTTP code selected later by API packaging)
- provide operator guidance to use the separate validation action
- audit the rejected attempt safely (operator identity, request id, correlation id, outcome)

No executable HTTP status code is selected in this record.

---

## 14. Authorization Boundary

Confirm:

- successful authentication is insufficient for validation or execution
- validation capability is distinct from execution capability
- execution privilege does not imply validation privilege
- validation privilege does not imply execution privilege
- service-role possession is not human authorization
- handler-level server checks remain mandatory on every privileged mutation

---

## 15. Segregation-of-Duties Boundary

- This decision separates **actions** and **capabilities** (validate vs execute).
- It does **not** decide whether the same human may perform both actions.
- **B-04** remains unresolved.
- Two-person approval remains unresolved.
- Step-up authentication remains unresolved.

---

## 16. Concurrency and Stale-State Impact

- Execution must re-read `validated_at` (and `request_state`) immediately before effects.
- Stale operator screens do not authorize execution.
- Simultaneous validate/execute attempts require conflict-safe behavior; missing milestone cannot be repaired inside execution.
- Terminal state wins; no last-write-wins overwrite of terminal or milestone fields.
- Exact concurrency coordination mechanism remains unresolved (separate blocker; e.g. B-09).

---

## 17. Audit Impact

Validation audit evidence conceptually records:

- request ID
- validator identity
- prior state
- milestone result (`validated_at` set)
- timestamp
- correlation ID
- outcome

Execution audit evidence separately records the execution operator and execution result.

No raw medical/image payload in either audit stream.

---

## 18. API Contract Impact

Future API implications (not implemented here):

- operator validation endpoint/action is separate from execution
- operator execution endpoint/action rejects absent milestone (fail closed)
- ordinary user APIs cannot set `validated_at`
- client cannot request implicit validation bundled with execute
- no API implementation is authorized by this record

---

## 19. UI Flow Impact

- Operator UI presents validation and execution as distinct actions.
- Execution is disabled or rejected until validation completes.
- User-facing presentation may map validated `received` (`validated_at` non-null) to `in_progress`.
- UI presentation does not invent a fourth database state.
- No UI implementation is authorized by this record.

---

## 20. Orchestration Impact

- Execution Orchestration Design §§9–10 and §28 posture is **affirmed**.
- Orchestrator treats `validated_at` as an entry prerequisite.
- Orchestrator does not mutate the milestone.
- Pathway Plan §10 requires later targeted reconciliation to remove “(a) set validation milestone if not already set” from the atomic execution transaction description.

---

## 21. Migration and SQL Impact

- No migration change is required by this decision.
- No SQL change is authorized.
- No verification SQL change is authorized.
- Runtime behavior remains unproven because the migration is unapplied.
- Block A and Block B remain unauthorized.

This decision is compatible with existing migration rules that already require:

- milestone via permitted `received` → `received` update only
- `executed` only when `validated_at` is already non-null
- no setting of `validated_at` during terminalization

---

## 22. F-P2-3 Impact

This decision does **not** change:

- account-wide target derivation
- original atomic execution transaction requirement for lifecycle actions + required attribution + terminalization
- attribution completeness requirements
- prohibition on post-terminal attribution append
- prohibition on worker/operator repair after terminal execution
- the rule that database capability ≠ application authorization

---

## 23. Security Impact

Selecting Option A:

- prevents implicit privilege combination of validation and execution
- improves least privilege at the capability boundary
- reduces destructive-action ambiguity
- improves revocation and fresh authorization checking at execute time
- provides clearer audit separation between validate and execute

It does **not** solve:

- B-03 operator authority source
- B-04 segregation of duties
- other unrelated security blockers

---

## 24. Compliance and Truthfulness Impact

Confirm:

- validation does **not** mean deletion completed
- `in_progress` remains presentation-only for `received` + non-null `validated_at`
- `completed` requires known successful execution (`executed` + `completed`)
- no universal-erasure promise is implied
- no account or billing deletion implication is created by this decision

---

## 25. Rejected Option — Validate Inside Execute

Option B is rejected because it:

- combines two privileged operations in one destructive path
- weakens capability separation between `request_validate` and `request_execute`
- complicates audit attribution of validator versus executor
- increases accidental execution risk on unvalidated requests
- conflicts with the accepted orchestration precondition model (Orchestration §§9–10, §28)
- provides no necessary database advantage; migration already requires a prior milestone before `executed`

---

## 26. Rejected Option — Hybrid

Option C is rejected for the initial contract because it:

- creates multiple execution entry semantics
- increases race and stale-state complexity
- complicates UI and operator guidance
- weakens deterministic authorization
- could be reconsidered only through a future separate decision, not by silent scope expansion here

---

## 27. Supersession and Reconciliation Requirement

- Once this decision is **accepted and committed**, it will supersede the conflicting Pathway Plan §10 wording that permits execution-time validation-milestone setting.
- Existing documents are **not** modified by this task.
- A separately authorized targeted reconciliation package is required before implementation may treat the design package as conflict-free on C-01/B-19.
- No broad rewrite is permitted.
- Dependent references (Technical Design, API Contract, Operator Authorization, Idempotency, Readiness Review posture, and any other restatement of the superseded Plan §10 step) must be inspected before reconciliation edits are authorized.

---

## 28. Blocker Status

- Decision ambiguity for **C-01 / B-19** is **selected** by this record (Option A).
- **C-01 / B-19 remains implementation-blocking** until all of the following occur:
  1. this record is accepted and committed
  2. affected artifacts are reconciled through a separately authorized targeted package
  3. reconciliation is reviewed and committed
  4. readiness posture is updated later under a separate authorization

Overall readiness remains **BLOCKED**. This record does **not** mark overall readiness PASS.

Unrelated blockers (including but not limited to B-01–B-18, B-20, and B-04) remain open on their own terms.

---

## 29. Acceptance Criteria

This decision record is acceptable only if:

- Option A is selected unambiguously
- exact state vocabulary is preserved (`received` | `executed` | `rejected`)
- `validated_at` remains a milestone only (not a fourth state)
- execution cannot set the milestone
- missing milestone fails closed
- B-04 remains open
- no SQL or migration change is required or authorized
- targeted reconciliation is identified as a required follow-on
- no implementation authorization is granted
- overall readiness remains blocked

---

## 30. Runtime Evidence Boundary

This decision is architectural only.

Not yet proven:

- runtime milestone transition
- authorization behavior
- stale-state conflict behavior
- API behavior
- execution rejection behavior for missing milestone
- trigger / deferred-constraint behavior under real DEV apply

No runtime claim is made by this record.

---

## 31. Hard Stops

Hard-stop if any of the following occur:

- execution implementation begins before reconciliation of Plan §10 (and dependent restatements)
- execution sets `validated_at`
- an unvalidated request executes
- “validated” is invented as a fourth `request_state`
- validation and execution capability are silently merged
- B-04 is treated as resolved by this record
- SQL is changed without a separate authorized gate
- DEV or PROD is contacted
- overall readiness is treated as PASS

---

## 32. Current Authorization Boundary

**Authorized now:**

- creation and review of this C-01 decision record
- selection of Option A within this document

**Not authorized:**

- modification of existing artifacts
- reconciliation edits
- application implementation
- API / UI / operator implementation
- SQL changes
- migration execution
- Block A
- Block B
- Supabase contact
- DEV / PROD changes

---

## 33. Next Safe Step

After acceptance and commit of this decision record, the exact next safe documentation artifact is:

`docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_TARGETED_RECONCILIATION_PLAN.md`

**Title:**

# Phase 2 Slice 2 — Application Deletion Pathway C-01 Targeted Reconciliation Plan

That future artifact must be:

- documentation-only
- identifies exact lines/sections requiring correction
- does not modify existing files in its own authoring task
- does not authorize implementation or database execution

---

## 34. Final Decision Statement

- **C-01 selected decision: validate before execute**
- **B-19 maps to the same decision**
- Implementation remains blocked pending targeted reconciliation and all other blockers
- Database execution is not authorized
- DEV contact is not authorized
- PROD contact is not authorized
- Exact next safe artifact is the C-01 Targeted Reconciliation Plan
