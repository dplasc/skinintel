# Phase 1 Slice 8 — Migration Plan

This document follows the approved:

- `PHASE_1_SLICE_8_PLAN.md`
- `PHASE_1_SLICE_8_TECHNICAL_DESIGN.md`

This is a planning artifact only. It contains no SQL, no API endpoint definitions, and no UI behavior. It defines the execution strategy for introducing the governed exclusion transition primitive; all SQL is drafted and approved in the subsequent Slice 8 SQL Draft.

---

## Status

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 8
**Depends on:** Slice 8 Plan (approved), Slice 8 Technical Design (approved), Slice 7 closure (session anchor transition metadata, frozen reason taxonomy, Execution Report)
**Artifact type:** Migration Plan (precedes SQL Draft; no execution authorized by this document)

---

## 1. Purpose

This document defines the execution strategy for introducing the governed exclusion transition primitive designed in the Slice 8 Technical Design. It sequences the migration, fixes its safeguards, and establishes the verification baseline the Execution Report must satisfy — without drafting SQL.

Slice 8 is the first slice in Phase 1 that ships behavior-capable database objects rather than schema surface alone. The migration therefore carries one obligation above all others: the primitives must arrive **dormant**. Capability is created; no data changes state; no invocation surface exists. The Migration Plan's role is to make that property structural — enforced by sequence, privilege posture, and validation — rather than assumed.

Once this plan is approved, the SQL Draft becomes a mechanical transcription of decisions already made here and in the Technical Design. No decision of consequence is deferred to SQL drafting time.

## 2. Migration Objectives

1. **Introduce the two governed primitives** defined by the Technical Design (Section 2): the session-level exclusion action with child propagation, and the subordinate single-row evidence exclusion action — both enforcing the `active` → `excluded` state machine, the mandatory transition metadata, and the closed four-value reason taxonomy internally.
2. **Restrict execution authority at creation time.** The primitives are executable only under the established service-role posture; client-facing roles (`anon`, `authenticated`) hold no execution privilege from the moment the primitives exist. There is no window in which the capability is broadly executable.
3. **Preserve every existing surface.** No table, column, constraint, FK posture, RLS policy, or row of data changes. The migration adds primitives; it touches nothing else.
4. **Establish the dormancy guarantee as a verified condition.** Post-migration data state must be demonstrably identical to pre-migration data state, satisfying the Technical Design's verification contract (Section 9), not merely asserted.
5. **Prove capture-path invisibility.** The `POST /api/scan` dual-write sequence must behave identically before and after the migration, verified empirically against a pre-migration baseline.

## 3. Scope

- **Primitive creation.** The two governed transition primitives, in the physical form finalized by the SQL Draft, enforcing internally: source state `active` only, target `excluded` only, terminal exclusion, mandatory reason from the closed taxonomy, mandatory transition timestamp, re-exclusion rejected without metadata overwrite, children-before-session ordering within a single all-or-nothing transaction.
- **Privilege restriction.** Execution privileges granted to the service-role posture only and explicitly withheld from all client-facing roles, applied within the same migration unit that creates the primitives.
- **Verification baseline.** Pre-migration capture of the RLS posture, schema state, and data state of all lifecycle-participating tables, against which post-migration validation is compared.

Nothing else. The migration creates capability and restricts authority; it performs no other action.

## 4. Migration Sequence

The migration proceeds in five gated steps. Each step completes before the next begins; SQL form is the SQL Draft's responsibility.

1. **Pre-migration baseline.** Record the live schema state, RLS posture, execution-privilege posture, and data state (all rows `active`, null transition metadata) of the session anchor and the four evidence tables. Confirm Slice 7 closure against the live catalog. Any discrepancy halts the sequence and routes back to Slice 7 closure.
2. **Introduce governed primitives.** Apply the single forward migration creating both primitives as designed. The primitives encapsulate all state-machine, metadata, and taxonomy enforcement; no enforcement lives outside them.
3. **Restrict execution privileges.** Within the same migration unit, ensure execution privilege is held by the service-role posture only, with client-facing roles explicitly excluded. The capability must never exist in an unrestricted state, even transiently.
4. **Preserve existing schemas, data, and RLS posture.** Structural non-action, verified rather than assumed: the migration contains no statement that alters any table, column, constraint, FK posture, or policy, and no statement that reads or writes application data. Validation confirms zero diff against the step 1 baseline on all three dimensions.
5. **Post-migration verification and observation.** Execute the validation strategy (Section 6), including capture regression through `POST /api/scan`, then observe production capture traffic for a defined window before declaring the migration complete. No primitive is invoked against production data during or after this window within this slice's scope.

## 5. Compatibility

- **Slice 6 compatibility.** The primitives operate strictly within the canonical vocabulary Slice 6 established: `active` → `excluded` only, `superseded` untouched and unreachable, evidence content immutable, `consent_snapshots` outside the state machine, and the reconciled FK posture unchanged. No Slice 6 artifact — vocabulary constraint, metadata column, or FK behavior — is modified. The primitives are the first consumer of the Slice 6 foundation, exactly as that slice anticipated.
- **Slice 7 compatibility.** The primitives write precisely the metadata surface Slice 7 completed (`status_reason`, `status_changed_at` on `scan_records`) and enforce the reason taxonomy Slice 7 froze. The Slice 7 decision to omit a CHECK constraint on `status_reason` is honored: the primitive layer becomes the single enforcement point, as that decision intended. No Slice 7 column or comment is altered.
- **Existing dual-write flow.** The `POST /api/scan` capture path is architecturally orthogonal to the primitives and remains byte-identical: same write order, same six write targets, same response shapes. The migration adds no trigger, no default, and no constraint that any insert path could observe. Because the primitives are never invoked by any code path after this slice, the capture flow cannot interact with them even indirectly. Compatibility is proven empirically in Section 6, not argued structurally alone.

## 6. Validation Strategy

Validation maps to the Technical Design's verification contract (Section 9) and is executed at high level as follows; concrete queries are defined in the SQL Draft and recorded in the Execution Report.

| Validation | Expectation |
|---|---|
| **Primitive existence** | Both primitives exist in the target schema in the approved shape. |
| **Privilege posture** | Execution privilege confirmed for the service-role posture only; `anon` and `authenticated` confirmed excluded, by catalog inspection. |
| **Behavioral verification** | Legal transition, propagation, metadata recording, re-exclusion rejection, and invalid-reason rejection are exercised exclusively in an isolated validation setup or a transaction-rollback context. No verification activity commits a state change to production rows. |
| **Dormancy** | Every row in every lifecycle-participating table remains `active` with null transition metadata — identical to the step 1 baseline. |
| **RLS posture** | The full policy set across all six Evidence Layer tables is byte-identical to the pre-migration baseline. |
| **Out-of-scope schemas** | `consent_snapshots`, `analyses`, all payload columns, all constraints, and all FK postures show zero diff against the baseline. |
| **Capture regression** | A full capture through `POST /api/scan` is indistinguishable from the pre-migration reference capture across all write targets and response shapes. |

The migration is declared successful only when every validation passes and the production observation window closes without deviation from baseline capture behavior.

## 7. Rollback Philosophy

- **Forward-only migration, consistent with Slices 1–7.** No rollback migration is versioned, shipped, or executed.
- **Rollback pressure is inherently low by construction.** The primitives are invoked by nothing, alter no existing object, and touch no data. The pre-migration application behaves identically against the post-migration database; a dormant primitive cannot alter runtime behavior.
- **Emergency contingency (documented only, never pre-approved).** Removing the primitives is a governance-capability change requiring its own explicit approval and its own reviewed artifact. It is never executed as part of this slice's normal flow.
- **Failure posture is forward correction.** If any validation fails, the slice halts in place — dormant primitives are harmless if unused — and remediation proceeds with a corrective forward migration, never a rollback.

## 8. Explicit Non-Scope

Binding on the SQL Draft and restated for gate review:

- **No UI** — no component, page, or client behavior changes.
- **No API** — no endpoints, no request/response shape changes, no public deletion surface.
- **No application code** — no route, service, or client code written or modified; the capture dual-write sequence is untouched.
- **No deletion** — no physical row deletion of any kind; no transition is executed against production data.
- **No redaction** — no payload stripping, content mutation, or storage object removal.
- **No triggers** — no automatic enforcement attached to table writes.
- **No jobs** — no schedule, automation, or background process invoking or supporting the primitives.
- **No read-path changes** — history and dashboard continue to read `analyses` exclusively and unfiltered; the accepted residual (excluded sessions would remain visible there) stands.

Additionally binding, carried forward: no schema changes to any table, no RLS changes, no `consent_snapshots` or `analyses` changes, no governance event table, and no supersession workflow.

## 9. Success Criteria

This Migration Plan is fulfilled and Slice 8 may close when:

1. The pre-migration baseline (schema, RLS, privileges, data state) is recorded and Slice 7 closure is confirmed against the live catalog.
2. The forward migration is applied once, creating both primitives with service-role-only execution privilege and no transient unrestricted state.
3. All validations in Section 6 pass: primitives exist, privileges are restricted, behavioral verification succeeds in isolation without committing production state changes, and dormancy holds.
4. Zero diff is demonstrated against the baseline for all existing schemas, all data, and the RLS posture.
5. Capture regression verification and the production observation window complete with no deviation from pre-migration behavior.
6. Every row in every lifecycle-participating table remains `active` with null transition metadata — the migration has demonstrably changed governance capability, not data state.
7. The Execution Report records all of the above and closes the slice; consumption of the primitives by any workflow remains unauthorized until a future slice grants it through its own artifact sequence.

## 10. Next Step

Upon approval of this plan, produce the Slice 8 SQL Draft containing the reviewed physical form of both primitives and their privilege posture, followed by execution approval and the Execution Report per the established slice artifact sequence. No SQL exists anywhere in the slice artifacts until this plan is approved.

---

*End of Phase 1 Slice 8 Migration Plan.*
