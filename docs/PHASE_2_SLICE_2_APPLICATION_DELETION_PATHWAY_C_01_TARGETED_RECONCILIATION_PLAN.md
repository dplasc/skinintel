# Phase 2 Slice 2 — Application Deletion Pathway C-01 Targeted Reconciliation Plan

- Status: Draft — targeted reconciliation planning only
- Review baseline: `34f818698d9120d7f5364f0c78351229a9e0e501`
- Decision authority: C-01 validate before execute
- Existing artifact modification: not authorized
- Reconciliation execution: not authorized
- Application implementation: not authorized
- Database execution: not authorized
- DEV execution gate: blocked
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document identifies the **exact documentation changes** required to incorporate the accepted C-01 decision (**validate before execute**) into existing pathway artifacts.

It does **not** perform those changes.

It does **not** authorize application implementation, SQL/migration work, DEV apply, Supabase contact, or PROD contact.

---

## 2. Authoritative Decision

**Decision authority (this conflict only):**

`docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_VALIDATION_GATE_DECISION_RECORD.md`

| Attribute | Binding posture |
|-----------|-----------------|
| Decision ID | C-01 |
| Readiness mapping | B-19 (same conflict) |
| Selected option | Option A — validate before execute |
| Precedence | Once accepted and committed, supersedes Pathway Plan wording that permits execution-time setting of `validated_at` |
| Affirmed artifact | Execution Orchestration Design §§9–10 and §28 |
| Unchanged by this decision | B-04 (segregation of duties); SQL/migration objects; overall readiness BLOCKED |

For the C-01 / B-19 conflict only, the committed decision record outranks contradictory Pathway Plan wording. It does not outrank unrelated open blockers or invent runtime proof.

---

## 3. Reconciliation Scope

### Documents inspected (read-only)

1. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md`
2. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md`
3. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md`
4. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md`
5. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md`
6. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`
7. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md`
8. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md`
9. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md`
10. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md`
11. `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md`
12. `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`
13. `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`
14. `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql`

Also inspected for authority: `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_VALIDATION_GATE_DECISION_RECORD.md` (decision record; not a reconciliation target).

### Documents requiring edits

| Path | Sections | Nature |
|------|----------|--------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` | §10 (primary); §3 and §7 (secondary restatements that place the validation milestone inside / as part of the atomic execution transaction) | Targeted documentation wording only |

### Documents already aligned

| Path | Aligned posture |
|------|-----------------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md` | §§9–10, §14, §23, §28 — prior milestone required; execution does not set `validated_at` |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` | §§13–14, §16 — distinct validation service; execute requires prior milestone |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md` | §§18–20 — separate validate/execute operations; execution transaction does not set milestone |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md` | §§25–27 — distinct validation and execution actions; `in_progress` = presentation only |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md` | §§12, 20, 22 — privileged fail-closed; validate/execute race fails closed |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md` | §§8–9, 19–20 — `request_validate` ≠ `request_execute`; B-04 still open |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md` | §§28–32 — missing milestone fails closed; no fourth state |
| `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Milestone via `received`→`received`; `executed` requires prior `validated_at`; no fourth state |
| Migration + verification SQL | Transition guard already forbids setting `validated_at` during terminalization; executed requires prior milestone |

### Documents containing historical blocker references only

| Path | Treatment |
|------|-----------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md` | Historical review evidence for its baseline; do not rewrite now |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md` | Historical sequencing / register evidence; do not rewrite now |

### Documents with no C-01 documentation impact

| Path | Reason |
|------|--------|
| `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Slice-level consumer / governance-validation flow; does not restate Plan §10 execution-time milestone step |

### Prohibited implementation and SQL scope

Not authorized by this plan or by future C-01 documentation reconciliation:

- API, UI, auth, operator roles, idempotency/concurrency mechanisms, orchestration hosting, workers, queues, retries, locks, rate limits, tests
- Transactions/RPCs/audit infrastructure/storage cleanup as implementation
- Migrations, verification SQL, database objects, middleware, proxy, sessions, environment files, application code
- TypeScript / TSX / JavaScript / CSS / SQL / JSON schemas / scripts / patches / executable configuration
- DEV or PROD contact; Supabase contact; Block A; Block B

---

## 4. Accepted C-01 Contract

Binding validate-before-execute rules (from the committed decision record):

1. Validation occurs through a **separately authorized** action.
2. Successful validation keeps `request_state = received`.
3. Successful validation sets `validated_at` **exactly once**.
4. `validated_at` is a **milestone**, not a fourth `request_state`.
5. Execution requires `request_state = received` and `validated_at IS NOT NULL`.
6. Execution **never** sets, replaces, clears, or reinterprets `validated_at`.
7. Missing `validated_at` at execution entry **fails closed** with **no** workflow mutation.
8. Validation and execution capabilities remain **distinct** (`request_validate` ≠ `request_execute`).
9. **B-04** still decides whether the same human may perform both actions.
10. **No** SQL or migration change is required.
11. Overall readiness remains **BLOCKED** until reconciliation and all other blockers are separately closed.

---

## 5. Primary Conflict Source

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md`

**Section:** `## 10. Execution Orchestration`

**Heading:** Execution Orchestration

**Current conflicting wording (exact):**

> **Single atomic execution transaction (account-wide and scan-specific session paths)** — within one database transaction: (a) set validation milestone if not already set; (b) invoke required primitive(s); (c) insert all required `deletion_request_executions` rows; (d) transition request to `executed` with `resolution_code = completed` and `resolved_at`; (e) satisfy deferred cross-table consistency at commit.

**Surrounding semantic context:**

- The same section correctly requires service-role / server-side control, prohibits partial attribution before terminal success, requires rollback on primitive failure, and forbids browser/client direct execution.
- Steps (b)–(e) describe the accepted atomic execution sequence (lifecycle actions, attribution, terminal transition, deferred consistency).
- Step (a) alone permits **execution-time / implicit validation** and conflicts with accepted C-01.

**Classification:** CONFLICTING — targeted edit required.

---

## 6. Primary Aligned Source

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md`

| Section | Heading | Current posture | C-01 status |
|---------|---------|-----------------|-------------|
| §9 | Execution Entry Preconditions | Execution may begin only when `request_state` is `received` and `validated_at` is non-null (among other gates) | ALIGNED — preserve |
| §10 | Forbidden Entry Conditions | Execution must not begin when unvalidated (`validated_at` null) | ALIGNED — preserve |
| §28 | Validation Milestone Treatment | `validated_at` is a prerequisite milestone, not a fourth state; execution cannot set or reinterpret it; missing/stale blocks execution; validation and execution remain distinct | ALIGNED — preserve |

**Correction required now:** none.

**Preservation required:** yes — these sections are the accepted aligned posture affirmed by the C-01 decision record.

**Editorial cross-reference:** none evidenced. Orchestration does not quote Plan §10’s “(a) set validation milestone if not already set” phrase; no purely editorial Orchestration edit is required for C-01 reconciliation.

---

## 7. Repository-Wide Dependency Search Results

Search covered the fourteen assigned artifacts (plus the C-01 decision record for authority). Matches were classified by surrounding meaning, not keyword presence alone.

| Path | Section / heading | Matched wording (summary) | Classification | Reconciliation needed | Reason |
|------|-------------------|---------------------------|----------------|------------------------|--------|
| `..._PLAN.md` | §3 Trust boundaries | “ordering of validation milestone, primitive invocation, attribution inserts, and terminal transition within a single atomic execution transaction where required” | CONFLICTING | Yes | Restates milestone-inside-execution-transaction semantics |
| `..._PLAN.md` | §7 Duplicate and Idempotency Posture — Ownership by layer | “ensure validation → execution → terminal transition is atomic where required” | CONFLICTING | Yes | Implies validation is part of the same atomic execution chain |
| `..._PLAN.md` | §8 Request Lifecycle Presentation | `validated_at` while state may remain `received`; four presentation labels | ALIGNED | No | Milestone ≠ fourth state |
| `..._PLAN.md` | §9 Validation Workflow | Separate validation step sets `validated_at` once via `received`→`received` | ALIGNED | No | Distinct validation action |
| `..._PLAN.md` | §10 Execution Orchestration | “(a) set validation milestone if not already set” inside atomic execution transaction | CONFLICTING | Yes | Primary superseded wording |
| `..._PLAN.md` | §11 F-P2-3 Application Obligation | Attribution inside original atomic execution transaction | NO C-01 IMPACT | No | F-P2-3 preservation; unrelated to milestone setter |
| `..._PLAN.md` | §17 API Planning Boundary | Separate “Operator validate” vs “Operator execute” | ALIGNED | No | Distinct operations |
| `..._PLAN.md` | §18 UI Planning Boundary | Validated / in progress = `validated_at` set, still `received` | ALIGNED | No | Presentation only |
| `..._EXECUTION_ORCHESTRATION_DESIGN.md` | §9 Execution Entry Preconditions | Requires non-null `validated_at` | ALIGNED | No | Affirmed by C-01 |
| `..._EXECUTION_ORCHESTRATION_DESIGN.md` | §10 Forbidden Entry Conditions | Unvalidated (`validated_at` null) forbidden | ALIGNED | No | Affirmed by C-01 |
| `..._EXECUTION_ORCHESTRATION_DESIGN.md` | §14 Fresh Request-State Check | Verify `validated_at` non-null | ALIGNED | No | Entry re-check |
| `..._EXECUTION_ORCHESTRATION_DESIGN.md` | §23 Atomic Transaction Boundary | Lifecycle + attribution + terminal; no milestone set | ALIGNED | No | Correct atomic boundary |
| `..._EXECUTION_ORCHESTRATION_DESIGN.md` | §28 Validation Milestone Treatment | Prerequisite; cannot set; distinct actions | ALIGNED | No | Affirmed by C-01 |
| `..._TECHNICAL_DESIGN.md` | §7 Domain Vocabulary Mapping | `validated_at` milestone; presentation “in progress” | ALIGNED | No | No fourth state |
| `..._TECHNICAL_DESIGN.md` | §13 Validation Service Design | Separate milestone update; no execution | ALIGNED | No | Distinct validation |
| `..._TECHNICAL_DESIGN.md` | §14 Execution Orchestrator Design | Refuse if not `received` with successful validation milestone; atomic lifecycle+attribution+terminal | ALIGNED | No | Prior validation required; no milestone set in execute |
| `..._TECHNICAL_DESIGN.md` | §16 Transaction and Concurrency Design | Re-read; confirm still `received` and validated before execute | ALIGNED | No | Fail-closed eligibility |
| `..._API_CONTRACT_DESIGN.md` | §18 User-Facing Status Mapping | No fourth DB state; `in_progress` = received + milestone | ALIGNED | No | Presentation contract |
| `..._API_CONTRACT_DESIGN.md` | §19 Operator Validation Operation | Separate validate route; set-once `validated_at` | ALIGNED | No | Distinct capability |
| `..._API_CONTRACT_DESIGN.md` | §20 Operator Execution Operation | Atomic lifecycle + attribution + terminal; no milestone set | ALIGNED | No | Does not restate Plan §10 step (a) |
| `..._UI_FLOW_DESIGN.md` | §5 / §17 / §19 | `in_progress` presentation for validated `received` | ALIGNED | No | Presentation only |
| `..._UI_FLOW_DESIGN.md` | §25–§27 Operator UI / Validation / Execution | Distinct validate vs execute actions | ALIGNED | No | Action separation |
| `..._SECURITY_AND_ABUSE_DESIGN.md` | §5 / §12 / §20 / §22 | Protects `validated_at`; ordinary auth insufficient; simultaneous validate/execute fails closed; privileged fail-closed | ALIGNED | No | No execution-time milestone repair |
| `..._OPERATOR_AUTHORIZATION_DESIGN.md` | §8 / §9 / §19 / §20 | Distinct `request_validate` / `request_execute`; SoD open; validated non-terminal required for execute | ALIGNED | No | Capability separation; B-04 remains open |
| `..._OPERATOR_AUTHORIZATION_DESIGN.md` | §26 (SoD) | Same-human vs separate-human unresolved | OPEN B-04 ONLY | No | Must not be closed by C-01 reconciliation |
| `..._IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md` | §28–§32 | Missing milestone fails closed; races fail closed; milestone not fourth state | ALIGNED | No | Compatible with C-01 |
| `..._PRE_IMPLEMENTATION_READINESS_REVIEW.md` | §7 C-01; §20 B-19 | Records Plan vs Orchestration conflict as blocking | HISTORICAL RECORD | No (not in this package) | Accurate for review baseline; later readiness update separately authorized |
| `..._DECISION_CLOSURE_PLAN.md` | §6 / §7 / §8 / Wave 0 | Plans C-01 decision package; does not select option | HISTORICAL RECORD | No (not in this package) | Sequencing evidence; later status update separately authorized |
| `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Request → Governance validation → lifecycle | Slice-level consumer flow | NO C-01 IMPACT | No | Does not restate Plan §10 execution-time milestone step |
| `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Request State Vocabulary / milestone rules | Milestone not fourth state; executed requires prior `validated_at` | ALIGNED | No | Compatible; no SQL change |
| `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Transition guard | Forbids setting `validated_at` during terminalization; executed requires prior milestone | ALIGNED | No | No migration change required |
| `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` | Milestone / terminal checks | Verifies set-once, no terminalization set, executed-requires-validated_at | ALIGNED | No | No verification SQL change required |

---

## 8. Required Reconciliation Inventory

Only evidence-backed conflicting Pathway Plan wording requires a future targeted edit. No other inspected file is listed.

### 8.1 Primary — Pathway Plan §10

| Field | Value |
|-------|-------|
| Exact file path | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` |
| Exact section | `## 10. Execution Orchestration` |
| Current statement | Atomic execution transaction includes “(a) set validation milestone if not already set” before primitives, attribution, and terminal transition |
| Required semantic correction | Remove execution-time milestone setting; require prior validation (`validated_at` already non-null); preserve steps for primitives, attribution, terminal transition, and deferred consistency |
| Reason | Primary C-01 conflict side A; superseded by validate-before-execute |
| Decision authority reference | C-01 Validation Gate Decision Record §§4, 7, 20, 27 |

### 8.2 Secondary — Pathway Plan §3

| Field | Value |
|-------|-------|
| Exact file path | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` |
| Exact section | `## 3. Actors and Trust Boundaries` — trust-boundary bullet on application orchestration |
| Current statement | Application orchestrates “ordering of validation milestone, primitive invocation, attribution inserts, and terminal transition within a single atomic execution transaction where required” |
| Required semantic correction | State that validation milestone is established by a prior distinct authorized validation action; the atomic execution transaction covers lifecycle actions, attribution, and terminal transition only |
| Reason | Restates milestone-inside-execution-transaction semantics |
| Decision authority reference | C-01 Validation Gate Decision Record §§7, 12, 27 |

### 8.3 Secondary — Pathway Plan §7

| Field | Value |
|-------|-------|
| Exact file path | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` |
| Exact section | `## 7. Duplicate and Idempotency Posture` — Ownership by layer → Transaction orchestration |
| Current statement | “ensure validation → execution → terminal transition is atomic where required” |
| Required semantic correction | Clarify that validation and execution remain separate authorized actions; atomicity applies to the execution transaction (lifecycle + attribution + terminalization), not to bundling validation into execution |
| Reason | Ambiguous wording that can reintroduce validate-inside-execute |
| Decision authority reference | C-01 Validation Gate Decision Record §§7, 12, 25 |

No other file requires an edit in the future C-01 targeted documentation reconciliation package.

---

## 9. Pathway Plan §10 Correction

**Do not edit the file in this planning task.**

Exact semantic correction for future reconciliation:

1. **Remove** execution-time setting of the validation milestone (“set validation milestone if not already set”).
2. **Require** prior successful validation: execution may proceed only when `request_state = received` and `validated_at IS NOT NULL`.
3. **Preserve** the remaining atomic execution sequence:
   - invoke required primitive(s)
   - insert all required `deletion_request_executions` rows
   - transition request to `executed` with `resolution_code = completed` and `resolved_at`
   - satisfy deferred cross-table consistency at commit
4. **Preserve** lifecycle-action, attribution, terminal-transition, and rollback contracts already stated in §10.
5. **Preserve** all unrelated Plan content (intake, presentation, F-P2-3, residual messaging, testing strategy, etc.).

---

## 10. Proposed Replacement Intent

Documentation wording only (not code or SQL). Proposed replacement for the conflicting Plan §10 bullet:

> **Single atomic execution transaction (account-wide and scan-specific session paths)** — execution may begin only after prior successful validation (`request_state = received` and `validated_at` already non-null). Within one database transaction the execution path must: (a) invoke required primitive(s); (b) insert all required `deletion_request_executions` rows; (c) transition request to `executed` with `resolution_code = completed` and `resolved_at`; (d) satisfy deferred cross-table consistency at commit. The execution transaction does **not** set, replace, clear, or reinterpret `validated_at`. Missing `validated_at` fails closed with no workflow mutation.

Conceptual requirements satisfied by this wording:

- execution requires prior validation
- execution transaction does not set `validated_at`
- lifecycle actions, attribution, terminal transition, and consistency remain atomic

Secondary Plan §3 / §7 corrections must use the same semantics in shorter form; they must not reintroduce execution-time milestone setting.

---

## 11. Execution Orchestration Preservation

| Section | Treatment | Why |
|---------|-----------|-----|
| §9 Execution Entry Preconditions | **Unchanged** | Already requires non-null `validated_at` |
| §10 Forbidden Entry Conditions | **Unchanged** | Already forbids unvalidated entry |
| §28 Validation Milestone Treatment | **Unchanged** | Already forbids execution setting/reinterpreting the milestone |

**Editorial cross-reference update:** not required on evidence. No Orchestration section quotes the superseded Plan §10 step (a).

Related aligned Orchestration sections (§14, §23) also remain unchanged unless a later separately authorized package finds a non-C-01 defect.

---

## 12. Technical Design Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md`

| Section | Classification |
|---------|----------------|
| §7 Domain Vocabulary Mapping | Already aligned |
| §13 Validation Service Design | Already aligned |
| §14 Execution Orchestrator Design | Already aligned |
| §16 Transaction and Concurrency Design | Already aligned |
| Other sections | No C-01 impact / already aligned |

**Edit required:** no.

The Technical Design does **not** restate Plan §10’s “(a) set validation milestone if not already set.” It requires a successful validation milestone before execute and describes the atomic execution boundary without setting `validated_at`.

---

## 13. API Contract Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md`

| Topic | Finding |
|-------|---------|
| Operator validation endpoint (§19) | Separate route; set-once milestone — aligned |
| Operator execution endpoint (§20) | Separate route; atomic lifecycle + attribution + terminal; does not set `validated_at` — aligned |
| Status mapping (§18) | Milestone / `in_progress` presentation; no fourth state — aligned |

**Edit required:** no.

Absence of an extra explicit “missing milestone → conflict” row in §20 is not a restatement of the superseded Plan §10 step; Orchestration/Idempotency already bind fail-closed entry. No API Contract edit is required for minimal C-01 reconciliation.

---

## 14. UI Flow Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md`

| Topic | Finding |
|-------|---------|
| Distinct validation vs execution actions (§25–§27) | Aligned |
| `in_progress` presentation (§17 / §19) | Presentation for `received` + non-null `validated_at`; not a fourth DB state — aligned |

**Edit required:** no.

---

## 15. Security and Abuse Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`

| Topic | Finding |
|-------|---------|
| Authorization boundary (§12) | Ordinary auth insufficient for validate/execute — aligned |
| Validate/execute race (§20) | Second actor fails closed — aligned |
| Privileged fail-closed (§22) | Aligned |

**Edit required:** no.

Does not authorize execution-time milestone repair.

---

## 16. Operator Authorization Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md`

| Confirm | Status |
|---------|--------|
| Separate capabilities remain aligned | Yes — `request_validate` / `request_reject` do not imply `request_execute` (§9, §19, §20) |
| B-04 remains unresolved | Yes — same-human versus separate-human policy remains open (§9, §26) |
| No wording may imply B-04 closure | Confirmed — C-01 reconciliation must not alter SoD sections |

**Edit required:** no.

---

## 17. Idempotency and Concurrency Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_IDEMPOTENCY_AND_CONCURRENCY_DESIGN.md`

| Topic | Finding |
|-------|---------|
| Validation concurrency (§28) | Set-once; conflicts fail closed — aligned |
| Execution concurrency (§29) | Stale/missing milestone fails closed — aligned |
| Validation versus execution race (§30) | Terminal/eligibility wins; no half-success — aligned |
| Stale-state / terminal rules (§31–§32) | Milestone not a fourth state; terminal immutable — aligned |

**Edit required:** no.

---

## 18. Readiness Review Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md`

Treatment of C-01 / B-19 after targeted reconciliation:

- The historical review decision remains **accurate for its baseline** (it correctly recorded the then-open Plan vs Orchestration conflict).
- Do **not** rewrite history in this reconciliation package unless a later readiness update is **separately authorized**.
- A future readiness review may record C-01 / B-19 reconciliation completion after the Plan wording is corrected and reviewed.
- Overall readiness remains **BLOCKED** regardless (other blockers remain open).

**Edit in the C-01 documentation reconciliation package:** no.

---

## 19. Decision Closure Plan Reconciliation Check

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md`

| Topic | Treatment |
|-------|-----------|
| C-01 / B-19 wave and register entries | Remain historical planning evidence of the conflict and closure package sequence |
| Committed plan status | Remains historical sequencing evidence |
| Later targeted status update | May be separately authorized after documentation reconciliation; **not** part of this package |

**Do not modify it now.**

**Edit in the C-01 documentation reconciliation package:** no.

---

## 20. Database and Migration Impact

Confirm:

| Item | Status |
|------|--------|
| Migration change | **None** required or authorized |
| SQL change | **None** required or authorized |
| Verification SQL change | **None** required or authorized |
| Database vocabulary | Unchanged: `received` \| `executed` \| `rejected`; `validated_at` milestone only |
| Runtime proof | Still absent — migration unapplied; Block A / Block B unauthorized |

Existing migration already requires prior milestone for `executed` and forbids setting `validated_at` during terminalization. C-01 reconciliation is documentation alignment to that contract, not a schema change.

---

## 21. F-P2-3 Preservation

Targeted C-01 reconciliation does **not** change:

- account-wide / scan-specific **target derivation**
- **atomic execution** of lifecycle actions + required attribution + terminalization
- **attribution completeness** requirements
- **no post-terminal append**
- **no worker/operator repair** after terminal execution
- the rule that database capability ≠ application authorization

Plan §11 and Orchestration F-P2-3 sections remain out of C-01 edit scope except that Plan §10’s preserved atomic steps continue to support F-P2-3.

---

## 22. B-04 Preservation

State explicitly:

- **Action separation** (validate vs execute capabilities) is accepted under C-01.
- **Same-human versus separate-human** policy remains **unresolved**.
- Targeted reconciliation **must not** imply a segregation-of-duties decision.
- **B-04 remains blocking.**

No Operator Authorization SoD wording may be altered to suggest closure.

---

## 23. Exact Future Reconciliation Package

**Package title:**

Phase 2 Slice 2 — C-01 Targeted Documentation Reconciliation

**Exact files permitted to change (from inventory):**

1. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` — §10 (primary); §3 and §7 (secondary restatements only)

**Files not permitted in that package:**

- All other pathway design docs (preserve)
- Readiness Review / Decision Closure Plan (historical; later separate update only if authorized)
- SQL Migration Design, migration SQL, verification SQL
- Any application, API, UI, auth, test, script, or environment file

No application or SQL files.

---

## 24. Future Diff Boundary

| Rule | Requirement |
|------|-------------|
| Diff size | Smallest possible |
| Content | Only approved conflicting Pathway Plan wording (§10 primary; §3 / §7 secondary) |
| Rewrite | No broad rewrite |
| Formatting | No formatting churn |
| Cleanup | No unrelated cleanup |
| Implementation | None |
| Package count | One reconciliation package |

---

## 25. Acceptance Criteria

Future reconciliation is acceptable only if:

- execution-time validation wording is removed (“set validation milestone if not already set”)
- prior validation requirement is explicit
- `validated_at` remains milestone only (not a fourth state)
- execution cannot set the milestone
- atomic execution semantics for lifecycle + attribution + terminal + deferred consistency are preserved
- B-04 remains open
- no SQL / migration / verification SQL changes
- no unrelated artifact changes
- readiness remains blocked
- exact diff review passes against this inventory

---

## 26. Validation Plan

Future static checks (manual / review; **do not write scripts** in this task):

1. Conflicting Plan §10 phrase removed.
2. Accepted replacement wording present (prior validation; execution does not set `validated_at`; atomic lifecycle/attribution/terminal preserved).
3. Plan §3 / §7 no longer imply milestone-inside-execution bundling.
4. Orchestration §§9–10 and §28 unchanged.
5. State vocabulary unchanged (`received` \| `executed` \| `rejected`).
6. No fourth state introduced.
7. B-04 remains unresolved in Operator Authorization Design.
8. No SQL / application files modified.
9. Only the approved Pathway Plan documentation file changed.

---

## 27. Hard Stops

Hard-stop if any of the following occur:

- reconciliation performed before acceptance of this plan
- Plan §10 changed beyond C-01 scope
- atomic transaction semantics weakened (lifecycle / attribution / terminal / rollback)
- execution allowed to set `validated_at`
- B-04 silently resolved
- migration or SQL modified
- historical readiness/decision-closure review rewritten as if runtime evidence exists
- implementation mixed into reconciliation
- DEV or PROD contact

---

## 28. Current Authorization Boundary

**Authorized now:**

- creation and review of this targeted reconciliation plan

**Not authorized:**

- modification of existing documents
- reconciliation execution
- application implementation
- API / UI / auth / operator implementation
- SQL changes
- migration execution
- Block A
- Block B
- Supabase contact
- DEV / PROD changes

---

## 29. Next Safe Step

After acceptance and commit of this plan, the next safe task is:

**Phase 2 Slice 2 — C-01 Targeted Documentation Reconciliation**

That task must be:

- separately authorized
- documentation-only
- modifies only files listed in the accepted reconciliation inventory (`PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` sections §10, §3, §7)
- no implementation or SQL

---

## 30. Final Planning Statement

- C-01 selected decision remains **validate before execute**
- reconciliation has **not** yet occurred
- implementation remains **blocked**
- database execution remains **not authorized**
- DEV and PROD contact remain **not authorized**
- exact next step is **targeted documentation reconciliation** of Pathway Plan conflicting wording under a separately authorized package
