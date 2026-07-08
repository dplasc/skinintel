# Phase 2 Slice 2 Implementation Plan

## Status

**Status:** Draft  
**Phase:** 2  
**Slice:** 2  
**Artifact type:** Implementation Plan  
**Depends on:** Phase 1 Governance Foundation (closed), Phase 2 Slice 1A (closed), Phase 2 Slice 1B (closed)

This document is a planning artifact only. It contains no code, no SQL design, no architectural changes, and no implementation detail. It authorizes no implementation until reviewed and accepted.

---

## Purpose

Phase 2 Slice 2 continues the Evidence Layer workstream on top of the completed Slice 1 foundation.

Slice 1 delivered the Evidence Persistence Boundary in two parts: Slice 1A established eligibility-filtered read structures at the persistence layer, and Slice 1B rolled the eligibility-aware read path out to all planned application consumers (dashboard latest analysis, history list, history detail). With Slice 1 closed, the platform can now *observe* eligibility correctly on every governed read surface — but nothing yet *changes* eligibility. The Phase 1 lifecycle exclusion primitives remain dormant, with no governed consumer, as recorded in the Slice 1A closure residuals.

The objective of Slice 2 is to plan the activation of evidence lifecycle governance as operational capability: the first governed pathway by which evidence eligibility can change, consistent with the Phase 1 contracts and safely visible through the read path completed in Slice 1B. Slice 1 made governance observable; Slice 2 plans to make it actionable.

---

## Scope

High-level implementation scope only. This section defines direction, not design.

Slice 2 covers the governed write side of the evidence lifecycle:

- Introducing the first authorized consumer(s) of the Phase 1 lifecycle exclusion capability.
- Connecting lifecycle state changes to the deletion request governance model defined in Phase 1.
- Ensuring lifecycle transitions surface correctly and non-destructively through the Slice 1B eligibility-aware read path.

All boundaries, mechanisms, and sequencing within this scope are deferred to the Slice 2 technical design. This plan fixes the perimeter; the design fixes the content.

---

## Dependencies

Slice 2 depends on the following completed and closed artifacts:

### Phase 1 — Governance Foundation

- Lifecycle eligibility capability and the `active`/`excluded` state model
- Governed invocation contract (authorized consumers, reason taxonomy)
- Read eligibility contract
- Deletion request governance
- Storage and binary retention boundary
- Phase 1 Closure Review

### Phase 2 Slice 1A — Evidence Persistence Boundary

- Evidence Persistence Boundary plan, technical design, and SQL migration design
- Executed Slice 1A migration establishing the eligibility views
- Slice 1A execution report and closure review

### Phase 2 Slice 1B — Read-Path Rollout

- Slice 1B technical design, implementation plan, and read-path cutover plan
- Implementation execution reports for all three consumers (dashboard latest analysis, history list, history detail)
- Slice 1B closure review

**Why Slice 2 depends on them.** Lifecycle activation without the Phase 1 contracts would be ungoverned mutation; the contracts define who may change lifecycle state, why, and with what guarantees. Lifecycle activation without the Slice 1A boundary would have no persistence-layer eligibility semantics to act upon. Lifecycle activation without the Slice 1B read-path rollout would be unsafe: an exclusion executed before the read surfaces were eligibility-aware would leave excluded evidence visibly presented as active, violating the read eligibility contract. Slice 1's closure is therefore the hard precondition that makes Slice 2 plannable at all.

---

## In Scope

Approved work categories only. No implementation detail is defined here.

- **Lifecycle invocation planning** — defining which governed consumer(s) may execute lifecycle transitions, within the Phase 1 invocation contract.
- **Deletion request pathway planning** — defining how a deletion request travels from intake to governed lifecycle effect, within the Phase 1 deletion governance model.
- **Read-path consistency verification** — confirming that lifecycle transitions produce correct, non-destructive outcomes on the Slice 1B read surfaces.
- **Governance and audit posture** — ensuring every lifecycle transition is attributable, reasoned, and reviewable per the Phase 1 contracts.
- **Slice 2 artifact production** — the planning, design, review, implementation, execution reporting, and closure documents required by the Phase 2 gate sequence.

---

## Out of Scope

Slice 2 explicitly excludes:

- **UI redesign** — no visual, layout, component, or styling changes beyond what the approved scope strictly requires; no redesign of any surface.
- **API redesign** — no changes to existing endpoint contracts, shapes, or semantics.
- **Unrelated migrations** — no schema work outside the approved Slice 2 scope; any required migration must be individually designed and gated within this slice.
- **New product features** — no user-facing feature work; Slice 2 is governance capability, not product surface.
- **Analytics** — no analytics, tracking, or reporting instrumentation.
- **Performance optimisation** — no optimisation work; correctness and governance only.
- **Security redesign** — no changes to the authentication, authorization, or RLS posture beyond what the approved scope strictly requires.
- **MotionForge or any cross-project artifacts** — no documents, designs, or scope originating from any other project are accepted into this slice. Cross-project context leakage identified during Slice 1B closure remains rejected.

A discovered need in any excluded category stops work and returns to planning. Exclusions are not implemented opportunistically.

---

## Implementation Strategy

Slice 2 follows the incremental, review-first workflow established across Phase 1 and Slice 1:

- **Small diffs** — each implementation step changes the minimum surface area required; one consumer, one pathway, or one bounded capability per step.
- **Review before commit** — every diff is reviewed against the approved artifacts before it is committed; no unreviewed change enters the repository.
- **Forward-only changes** — no rollbacks of closed slices, no reopening of frozen contracts, no rewriting of accepted artifacts; corrections move forward through new gated work.
- **Governance-first** — the governing artifact always precedes the capability; no implementation step begins before its plan and design are approved, and no capability ships before its contract exists.

Each implementation step within Slice 2 produces its own execution report and passes review before the next step is authorized.

---

## Acceptance Criteria

### Planning completion (this artifact)

1. Scope, in-scope categories, and exclusions are reviewed and accepted at gate review.
2. Dependencies on Phase 1, Slice 1A, and Slice 1B are acknowledged as binding.
3. No implementation, SQL, or design work has occurred within this planning step.

### Slice completion (later implementation)

1. Every approved in-scope work category is implemented within its own gated step, or explicitly deferred with a recorded decision.
2. All five Phase 1 governance contracts are preserved unchanged and verified in the closure review.
3. Every lifecycle transition pathway introduced is governed, attributable, and consistent with the Slice 1B read path.
4. `npm run build` passes for every implementation step.
5. All exclusions in the Out of Scope section are confirmed untouched at closure.
6. All Slice 2 deliverables listed below exist, are reviewed, and are accepted.

---

## Deliverables

Slice 2 will produce the following artifacts through the Phase 2 gate sequence:

- **`PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md`** — this planning document.
- **Slice 2 Technical Design** — the reviewed design answering the questions this plan defers, produced before any implementation.
- **Migration design and execution artifacts** — only if the approved technical design requires persistence changes; individually gated.
- **Implementation execution reports** — one per implementation step, recording what was done and verified.
- **Slice 2 Closure Review** — confirming scope completion, governance preservation, validation results, and explicit residuals before any subsequent slice is planned.

No deliverable is skipped, merged, or produced out of sequence.

---

*End of Phase 2 Slice 2 Implementation Plan.*
