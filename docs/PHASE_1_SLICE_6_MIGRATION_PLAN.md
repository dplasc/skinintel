# Phase 1 Slice 6 — Migration Plan

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 6
**Depends on:** `PHASE_1_SLICE_6_PLAN.md` (accepted), `PHASE_1_SLICE_6_TECHNICAL_DESIGN.md` (accepted)
**Artifact type:** Migration Plan (precedes SQL Draft)

---

## 1. Purpose

This document defines the migration strategy for Phase 1 Slice 6, translating the accepted Technical Design into an ordered, verifiable migration approach. It establishes what changes, in what sequence, under what safeguards, and how success is proven — without drafting SQL or implementation code.

The Migration Plan is the last planning artifact before the SQL Draft. Its role is to remove every decision of consequence from the SQL drafting step: once this plan is approved, the SQL Draft becomes a mechanical transcription of decisions already made and approved here.

The scope boundaries of the plan and Technical Design remain binding. This migration touches schema constraints and additive metadata only. It ships no lifecycle transition workflow, no deletion workflow, and no change to application behavior.

## 2. Migration Objectives

The migration has four objectives, each traceable to the Technical Design:

1. **Standardize the lifecycle vocabulary.** Bring `user_description_evidence`, `image_evidence`, and `product_mention_evidence` up to the full canonical vocabulary (`active`, `excluded`, `superseded`) already carried by `ai_analysis_evidence`. Per Technical Design Risk 5, this widening ships as a single migration unit across all three tables, not incrementally.

2. **Prepare additive lifecycle metadata.** Introduce the transition metadata identified in the Technical Design (machine-readable exclusion reason, transition timestamp) in an additive, absence-tolerant form, uniform across evidence tables, so that future governance workflows have a place to record transitions without a further schema round-trip.

3. **Reconcile foreign-key deletion posture.** Resolve the inconsistency documented in Technical Design Section 7 by moving the cascading constraints (`consent_snapshots`, `ai_analysis_evidence`) to the restrictive posture already held by the other evidence tables, making physical deletion an explicit governed operation rather than a referential side effect. This is a delete-semantics change and carries the explicit approval required by the plan's Acceptance Criterion 4.

4. **Preserve compatibility.** Complete all of the above with zero change to the scan write path, the legacy `analyses` compatibility insert, API contracts, and read paths. Existing rows remain valid without content migration.

## 3. Schema Changes (conceptual only)

The migration comprises four conceptual change groups. No SQL is defined here; physical form is the SQL Draft's responsibility, constrained by the decisions below.

**Lifecycle vocabulary standardization.** The permitted status values on the three non-AI evidence tables are widened from the two-value set to the canonical three-value set. This is constraint widening: every existing value remains legal, and no stored value changes. `ai_analysis_evidence` requires no vocabulary change. `scan_records.status` is explicitly untouched — the session-level two-value vocabulary is intentional per Technical Design Section 3.

**Additive metadata.** Evidence tables gain the transition metadata structure specified by the Technical Design: an exclusion/transition reason that is machine-readable and reference-capable, and a transition timestamp. The metadata must be legal in its absent state, since no existing row has ever transitioned. Whether the metadata lives on the evidence rows or in a companion structure is the one physical decision delegated to the SQL Draft, under the constraint that the chosen form is identical across all evidence tables. Traceability columns for supersession (`supersedes_evidence_id` pattern) are added only where the Technical Design requires them ahead of any supersession workflow; tables that cannot yet be superseded by any planned workflow may defer the column to the slice that introduces that workflow.

**Constraint reconciliation.** The two cascading foreign keys referencing `scan_records` — on `consent_snapshots` and `ai_analysis_evidence` — are reconciled to the restrictive posture. The legacy `analyses.scan_record_id` set-null posture is documented and deliberately left unchanged in this migration: `analyses` sits outside the Evidence Layer's governance boundary, and altering its referential behavior risks the read contract for no Slice 6 benefit. Its reconciliation, if ever needed, belongs to the deletion slice.

**Compatibility preservation.** No column is renamed, retyped, dropped, or given a new non-null requirement that the existing write path would have to satisfy. No default changes in a way visible to the scan route. The five insert paths in `POST /api/scan` and the `analyses` compatibility insert must be able to run before, during, and after the migration without modification.

## 4. Backward Compatibility Strategy

Compatibility follows from the shape of the changes rather than from mitigating measures:

- **The write path only writes `active`.** Vocabulary widening adds legal values that the writer never uses. A writer that inserts `active` into a two-value constraint behaves identically against a three-value constraint.
- **Metadata is additive and absence-tolerant.** New metadata is not populated at capture and carries no capture-time obligation. The existing insert statements remain valid without knowing the new structure exists.
- **Constraint reconciliation changes delete behavior only.** Moving from cascading to restrictive posture affects what happens on parent delete. The application performs no physical deletes of `scan_records` in any code path (to be verified — see Section 8), so no application behavior changes. Inserts, updates, and reads are unaffected by delete-posture changes.
- **`analyses` is untouched.** The legacy table's structure, referential behavior, and read contract are outside this migration. History and dashboard read paths cannot observe any change.
- **No transition logic ships.** Because no code transitions evidence out of `active` in this slice, the new states and metadata remain structurally present but behaviorally dormant. Dormant schema cannot alter runtime behavior.

The compatibility claim is therefore structural: every change is either invisible to existing code (widening, additive metadata) or only observable through an operation the application does not perform (parent deletes).

## 5. Migration Sequence

The migration executes in five ordered stages. Each stage has a completion gate; a stage does not begin until the prior stage's gate passes.

1. **Schema preparation.** Apply the additive changes: vocabulary widening on the three non-AI evidence tables (as one unit) and the additive metadata structure. This stage is strictly widening/additive and carries the lowest risk, so it goes first — if anything later is aborted, the schema is left in a valid, more-permissive state that harms nothing.

2. **Constraint reconciliation.** Apply the foreign-key posture changes on `consent_snapshots` and `ai_analysis_evidence`. This is the only stage that changes behavior (delete semantics) and is sequenced after preparation so it can be evaluated and, if needed, aborted independently of the vocabulary work. Pre-condition: the delete-caller inventory from Section 8 has confirmed no dependency on cascade behavior.

3. **Validation.** Verify the post-migration schema state: permitted vocabularies match the canonical set on all four evidence tables, metadata structures exist and are absence-tolerant, foreign-key postures match the target end-state, and — per Technical Design Risk 3 — existing data satisfies the at-most-one-`active` invariant if declarative enforcement was chosen.

4. **Dual-write verification.** Exercise the full scan write path against the migrated schema: a complete `POST /api/scan` request must produce all five evidence-layer inserts plus the `analyses` compatibility insert, with all rows captured as `active` and with response shapes unchanged. This proves the compatibility claims of Section 4 empirically rather than by argument.

5. **Production verification.** After deployment, confirm on production data: write-path success rates are unchanged, no new constraint violations appear in logs, history and dashboard reads are unaffected, and row counts across the dual-write remain consistent with pre-migration behavior over an agreed observation window.

## 6. Risk Assessment

Migration risks only; design risks are recorded in the Technical Design.

1. **Restrictive posture breaks an unknown delete caller.** If any operational script, admin tool, or manual procedure deletes `scan_records` rows relying on cascade, it fails hard after Stage 2. Likelihood: low (no application code path deletes scan records). Impact: medium (operational task fails loudly; no data loss). Mitigation: mandatory delete-caller inventory before Stage 2; the failure mode is an error, not silent corruption, which is the intended direction of the posture change.

2. **Constraint change requires a table lock or validation scan.** Altering check constraints and foreign-key postures can require scanning or locking the affected tables depending on the mechanism the SQL Draft chooses. Impact on a production write path: brief write contention. Mitigation: the SQL Draft must state the locking behavior of each operation and prefer non-blocking or short-lock mechanisms; execution is scheduled in a low-traffic window.

3. **Partial application leaves the vocabulary inconsistent.** If the Stage 1 unit fails midway, some tables carry the canonical vocabulary and others do not — recreating the drift this slice exists to eliminate. Mitigation: Stage 1 executes as a single transactional unit where the platform allows; if not, the validation stage explicitly checks vocabulary uniformity before the migration is declared complete.

4. **Historical data violates the at-most-one-`active` invariant.** If declarative enforcement is chosen and historical rows violate the invariant, the constraint addition fails. Mitigation (carried from Technical Design Risk 3 and Exit Criterion 7): data verification precedes any declarative constraint; if violations exist, the migration falls back to procedural enforcement and the violations are logged for governance review, not silently corrected.

5. **Metadata form conflicts with future correction events.** If the metadata structure chosen in the SQL Draft is not reference-capable, future correction-event integration requires a second migration. Mitigation: the reference-capability constraint from the Technical Design is a named acceptance check in the SQL Draft review.

## 7. Rollback Strategy

Rollback is planned per stage, in reverse dependency order, and is conceptual here — no rollback statements are drafted.

- **Stage 1 (widening and additive metadata) requires no rollback under normal failure.** A more-permissive constraint and unused additive metadata are harmless to leave in place; rolling them back is optional cleanup, not incident response. If rollback is nonetheless required, it consists of re-narrowing the vocabulary (safe while no row carries `superseded`, which is guaranteed while no transition code exists) and removing the unused metadata structure.
- **Stage 2 (constraint reconciliation) rolls back by restoring the prior foreign-key posture.** Because the change is posture-only and touches no data, restoration returns delete semantics exactly to their pre-migration state. This rollback is only legitimate as an emergency response to Risk 1; if invoked, the P1-1 cascade problem is re-opened and must be re-scheduled, not abandoned.
- **No data rollback exists or is needed.** The migration rewrites no stored values, so there is no data state to restore. This is a deliberate property of the additive-first design: rollback scope is confined to schema posture.
- **Rollback decision authority.** Any rollback of Stage 2 is treated as a delete-semantics change in its own right and requires the same approval level as the forward change.

The SQL Draft must include a drafted (not executed) rollback counterpart for each forward operation, consistent with this strategy.

## 8. Validation Strategy

Success is verified in four layers, mapping to migration stages 3–5:

1. **Schema-state validation.** Direct inspection of the migrated schema confirms: canonical vocabulary on all four evidence tables; `scan_records.status` unchanged; metadata structures present, uniform, and absence-tolerant; foreign-key postures matching the target end-state; `analyses` structurally untouched.

2. **Data-invariant validation.** Pre-migration: verify no historical data violates the at-most-one-`active` invariant (gates the enforcement decision) and inventory all delete callers against `scan_records` (gates Stage 2). Post-migration: verify no row carries a non-`active` status, confirming the migration itself introduced no transitions.

3. **Behavioral validation.** A full scan capture is exercised end-to-end in a staging environment against the migrated schema: all five evidence inserts and the `analyses` compatibility insert succeed, rows are captured `active`, and API response shapes are byte-compatible with pre-migration responses. A parent-delete attempt against a scan record with evidence must now fail with a referential error on all evidence tables uniformly — the one intentionally changed behavior, verified explicitly.

4. **Production observation.** Over an agreed post-deployment window: scan write success rates, error rates, and dual-write row-count consistency are compared against the pre-migration baseline. Read-path metrics for history and dashboard are confirmed flat. Any new constraint-violation error class in logs is treated as a migration defect until proven otherwise.

The migration is declared successful only when all four layers pass. Failures in layers 1–3 block promotion; failures in layer 4 trigger the rollback evaluation in Section 7.

## 9. Exit Criteria

SQL drafting (`PHASE_1_SLICE_6_SQL_DRAFT`) may begin only when all of the following are true:

1. The four conceptual change groups in Section 3 are approved, including the explicit decision to leave `analyses.scan_record_id` set-null posture unchanged in this slice.
2. The delegated physical decisions are enumerated and bounded: metadata placement (on-row vs. companion structure, uniform across tables), invariant enforcement mechanism (declarative vs. procedural, contingent on data verification), and per-table timing of supersession traceability columns.
3. The five-stage sequence in Section 5 is accepted, including the requirement that vocabulary widening ships as a single unit and that constraint reconciliation is independently gated.
4. The foreign-key posture change is explicitly approved as a delete-semantics change by the required authority (plan Acceptance Criterion 4), and the delete-caller inventory is accepted as a mandatory pre-condition to Stage 2.
5. The rollback strategy in Section 7 is accepted, including the requirement that the SQL Draft contains a drafted rollback counterpart for every forward operation.
6. The validation strategy in Section 8 is accepted, and the staging environment needed for behavioral validation is confirmed available.
7. The migration risks in Section 6 are acknowledged, with Risks 1 and 4 bound to their pre-migration verification gates.
8. No SQL exists yet anywhere in the slice artifacts; drafting begins only after this plan is approved.

## 10. Non-Goals

Explicit non-goals for this Migration Plan, restated for gate review:

- **No SQL.** This document contains no DDL, DML, or executable statements; all SQL is drafted in the subsequent SQL Draft and executed only after its own approval.
- **No application code.** No route, service, or client code is written or modified. No lifecycle transition logic ships in this slice.
- **No API changes.** `POST /api/scan` request handling, response shapes, and error contracts are untouched.
- **No UI changes.** No component, page, or client behavior changes.
- **No read-path changes.** History and dashboard continue to read `analyses` exclusively; no read cutover to the Evidence Layer is planned or prepared here.

---

*End of Phase 1 Slice 6 Migration Plan.*
