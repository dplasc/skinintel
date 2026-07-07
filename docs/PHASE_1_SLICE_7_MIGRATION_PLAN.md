# Phase 1 Slice 7 — Migration Plan

This document follows the approved:

- `PHASE_1_SLICE_7_PLAN.md`
- `PHASE_1_SLICE_7_TECHNICAL_DESIGN.md`

This is a planning artifact only. It contains no SQL, no API endpoint definitions, and no UI behavior. It modifies no architecture; it sequences the schema preparation and verification required for the design already approved.

---

## 1. Status

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 7
**Depends on:** Slice 7 Plan (approved), Slice 7 Technical Design (approved), Slice 6 closure (canonical vocabulary, transition metadata, reconciled FK posture verified in production)
**Artifact type:** Migration Plan (precedes SQL Draft; no execution authorized by this document)

---

## 2. Migration Objectives

1. Ensure the schema fully supports the governed `active` → `excluded` transition defined in the Technical Design, on both the session anchor and the child evidence tables.
2. Close any residual metadata gap on the session anchor: `scan_records` must carry the same mandatory transition metadata (reason, transition timestamp) that Slice 6 established for the evidence tables, if it does not already.
3. Fix the governed, closed reason vocabulary for `status_reason` as a reviewed artifact of this plan's successor (SQL Draft), so no reason values are invented at implementation time.
4. Guarantee that every schema change is additive, nullable, and forward-only, leaving all existing rows, write paths, and read paths valid without modification.
5. Establish the verification baseline that the Execution Report must satisfy before any transition capability is exercised.

## 3. Migration Principles

- **Additive-first.** Only column additions and constraint widenings that accept all existing data. No column drops, no type narrowing, no data rewrites.
- **Forward-only.** One versioned forward migration following the established naming convention (`phase_1_slice_7_*`). Rollback exists as a documented contingency draft, not as an executed or versioned down-migration.
- **Nullable by default.** Any new metadata column is nullable; all pre-existing rows remain valid with no backfill.
- **No behavioral coupling.** The migration prepares schema only. It ships no triggers, no functions that transition state, no scheduled jobs, and no code. All rows remain `active` after migration.
- **No contract disturbance.** The migration must be invisible to the `POST /api/scan` write path, the `analyses` read paths, and the RLS posture.
- **Gated execution.** SQL is drafted and reviewed in the Slice 7 SQL Draft; execution occurs only after explicit approval, per the established slice artifact sequence.

## 4. Migration Scope

- **Session anchor metadata completion.** Verify whether `scan_records` carries transition metadata equivalent to the Slice 6 evidence-table columns (`status_reason`, `status_changed_at`). If absent, add them as nullable additive columns. This is the only anticipated structural change of the slice.
- **Vocabulary confirmation.** Verify that the session anchor status dimension remains `('active','excluded')` and that all four evidence tables carry the full canonical vocabulary from Slice 6. No widening is expected; this is confirmation, not change.
- **Reason taxonomy definition.** Enumerate the closed set of permitted `status_reason` values for this slice's transitions (at minimum: user deletion request, consent withdrawal, administrative invalidation, session-propagated exclusion). The taxonomy is defined and reviewed here at planning level; its physical enforcement form is a SQL Draft decision.
- **Constraint posture review.** Confirm that no existing constraint (FK behavior, status checks, RLS) prevents the transition model — including the children-before-session ordering rule — from being implemented later without further schema change.

## 5. Non-scope

- **No transition execution.** No row changes state during or after this migration; the migration prepares schema, nothing more.
- **No new tables.** No governance event table, no audit store, no correction event store.
- **No `analyses` changes.** No columns, markers, or lifecycle state on the compatibility surface.
- **No consent snapshot changes.** `consent_snapshots` receives no lifecycle or metadata columns; it remains outside the state machine.
- **No FK behavior changes.** The Slice 6 reconciled posture is final for this slice.
- **No RLS changes.** No policies added, removed, or altered.
- **No triggers, functions, or automation.** State-machine enforcement in the database layer, if ever desired, is a future decision; this slice's enforcement lives in the governed service-role capability defined by the Technical Design.
- **No backfill and no data migration.** Existing rows are untouched.
- **No code, API, UI, or read-path changes** of any kind.

## 6. Migration Sequence

The migration proceeds in five gated steps:

1. **Pre-migration baseline.** Record the current schema state of `scan_records` and the four evidence tables (status vocabularies, metadata columns, constraint posture) and confirm Slice 6 closure evidence. Any discrepancy halts the sequence.
2. **Schema preparation.** Apply the single additive forward migration: session anchor metadata columns if required by step 1 findings. If step 1 shows no gap, this step is a documented no-op and the slice proceeds without schema change.
3. **Schema validation.** Confirm the resulting schema matches the Technical Design's requirements: metadata columns present and nullable on all lifecycle-participating tables, vocabularies unchanged, no constraint regressions.
4. **Write-path regression verification.** Execute a full capture through `POST /api/scan` and confirm the dual-write sequence produces identical results to the pre-migration baseline: all evidence rows `active`, compatibility insert unchanged, no new errors.
5. **Production observation window.** Observe capture traffic for a defined period before declaring the migration complete and authorizing the next artifact. No transition capability is exercised during or after this window within this slice's migration scope.

## 7. Consistency Strategy

- **Migration-time consistency is trivial by design:** the migration adds nullable columns at most, so no intermediate state can invalidate existing rows or in-flight captures.
- **Post-migration invariant:** every lifecycle-participating table exposes the complete metadata surface the transition model requires, so no future transition can be blocked by, or forced to work around, missing schema.
- **Transition-time consistency is inherited, not defined here.** The atomicity goal, children-before-session ordering rule, and convergent reconciliation posture are fixed by the Technical Design (Sections 9–10). This plan's obligation is solely to ensure the schema imposes no obstacle to that model.
- **Detectability preserved.** Consistency between session state and child states must remain determinable from lifecycle fields alone; the migration introduces no external state that could diverge.

## 8. Validation Strategy

Validation is conceptual and maps to the Technical Design's verification contract (Section 12):

| Validation | Migration-level expectation |
|------------|-----------------------------|
| **Schema completeness** | All lifecycle-participating tables (session anchor plus four evidence tables) expose status, reason, and transition timestamp fields; consent snapshots expose none. |
| **Additivity** | Schema diff against the pre-migration baseline shows only additions; every pre-existing row remains valid with null metadata. |
| **Legal transition readiness** | The schema accepts a state change to `excluded` with reason and timestamp on every lifecycle-participating table (verified structurally, not by executing a transition). |
| **Illegal transition posture** | Nothing in the schema legitimizes reverse transitions or client-originated writes; RLS posture is byte-identical to baseline. |
| **Metadata completeness** | The reason taxonomy is enumerated, reviewed, and closed before the SQL Draft is approved. |
| **Immutability preservation** | Payload columns, consent snapshots, and all `analyses` structures are untouched by the schema diff. |
| **Capture regression** | A post-migration capture is indistinguishable from a pre-migration capture across all six write targets. |

## 9. Compatibility

- **Additive only.** At most, nullable metadata columns on the session anchor. No destructive change of any kind.
- **Forward-migration compatible.** Single forward migration in the established convention; prior slice migrations untouched; no down-migration shipped.
- **No breaking changes.** API contracts, response shapes, read paths, dashboard and history behavior, AI flow, and RLS are unchanged. Existing queries against every affected table remain valid because new columns are nullable and unreferenced.
- **Dual-write compatible.** The capture write order and all six write targets are unmodified. The migration adds no writer, no trigger, and no side effect to the capture sequence; verification step 4 proves this empirically.

## 10. Risks

- **Slice 6 closure assumption (highest).** If Slice 6's migration was applied but never formally verified, step 1 may surface drift between documented and actual schema. Mitigation: the baseline step is a hard gate; any discrepancy halts Slice 7 and routes back to Slice 6 closure.
- **Session anchor metadata ambiguity.** The exact metadata state of `scan_records` is a step 1 finding, not an assumption. Risk of designing against a stale schema picture is mitigated by making the migration content conditional on the recorded baseline.
- **Taxonomy churn.** An incomplete reason taxonomy would force a follow-up widening migration. Mitigation: the taxonomy is reviewed against the deletion/retention and consent behavior documents before SQL Draft approval, and its physical form must be chosen so additions remain additive.
- **Scope creep at SQL Draft stage.** Pressure to add enforcement triggers, governance tables, or `analyses` markers "while migrating" must be refused; the non-scope list is binding on the SQL Draft.
- **Silent write-path regression.** Any schema change carries nonzero risk to inserts. Mitigation: mandatory capture regression verification (step 4) and production observation (step 5) before completion is declared.

## 11. Rollback Philosophy

- **Forward-only posture.** Consistent with Slices 1–6, no down-migration is versioned or executed. The additive, nullable nature of the change means the pre-migration application behaves identically against the post-migration schema; rollback pressure is therefore inherently low.
- **Contingency draft only.** A rollback draft (removing any added columns) is documented in the SQL Draft as an emergency contingency, with the explicit note that executing it is a destructive act requiring its own approval.
- **No data rollback exists or is needed.** The migration writes no data; there is nothing to restore.
- **Failure before completion.** If validation (steps 3–4) fails, the slice halts in place: the additive columns are harmless if unused, and remediation proceeds forward with a corrective migration rather than backward.

## 12. Exit Criteria

This Migration Plan is complete and the slice may proceed when:

1. The pre-migration baseline is recorded and Slice 6 closure is confirmed against it.
2. The conditional migration content (session anchor metadata: required or documented no-op) is resolved by evidence, not assumption.
3. The closed reason taxonomy is enumerated and approved.
4. The forward migration (if required) is applied and schema validation passes.
5. Capture regression verification and the production observation window complete without deviation from baseline behavior.
6. Compatibility is reconfirmed against all four criteria: additive only, forward-only, no breaking changes, dual-write preserved.
7. All rows in all lifecycle-participating tables remain `active` — the migration has demonstrably changed schema capability, not data state.

## 13. Next Step

Upon approval of this plan, produce the Slice 7 SQL Draft containing the reviewed DDL for the conditional schema change and the enumerated reason taxonomy in its physical form, followed by the execution approval and Execution Report per the established slice artifact sequence. Implementation of the transition capability itself is authorized only after the Execution Report closes this migration.

---

*End of Phase 1 Slice 7 Migration Plan.*
