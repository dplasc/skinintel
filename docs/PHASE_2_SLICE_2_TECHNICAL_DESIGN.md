# Phase 2 Slice 2 Technical Design

## Status

**Status:** Draft  
**Phase:** 2  
**Slice:** 2  
**Artifact type:** Technical Design  
**Depends on:** Phase 1 Governance Foundation (closed), Phase 2 Slice 1A (closed), Phase 2 Slice 1B (closed), `PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md` (approved)

This is a design artifact only. It contains no implementation code, no SQL, and no architectural changes. It redefines no existing governance contract and authorizes no implementation until reviewed and accepted.

---

## Purpose

Phase 2 Slice 2 activates evidence lifecycle governance as operational capability.

Phase 1 shipped the governed exclusion primitives dormant: the database can perform the `active` → `excluded` transition, but nothing invokes it. Slice 1A expressed eligibility at the persistence boundary; Slice 1B made every planned read surface eligibility-aware. The platform can now safely observe a lifecycle transition, but no governed pathway can yet cause one.

The technical objective of Slice 2 is to define the first governed pathway from a lifecycle request to an eligibility change: one authorized consumer, a mandatory transition flow, inherited read consistency, and explicit failure behaviour. Mechanism and physical form are deferred to the implementation artifacts that follow this design's approval.

---

## Design Goals

- **Activate, do not extend.** Slice 2 invokes the existing Slice 8 primitives exactly as designed; no new lifecycle states, transitions, reasons, or primitives.
- **One consumer first.** A single authorized consumer establishes the invocation pattern before any additional consumer is considered.
- **Contracts unchanged.** All five Phase 1 governance contracts are preserved in full; this design operates strictly within them.
- **Read path untouched.** The Slice 1B eligibility-aware read path requires no modification to reflect lifecycle changes.
- **Fail closed, fail clean.** Every rejected or invalid lifecycle request leaves state, metadata, and history unchanged.
- **Attributable by construction.** Every executed transition carries the mandatory transition metadata (`status_reason`, `status_changed_at`), recorded by the primitive itself, not by the consumer.

---

## Existing Governance Contracts

Slice 2 must preserve the following Phase 1 contracts unchanged. Any step that requires modifying one of them must stop and escalate:

- **Lifecycle status contract (Slices 6–8).** The `active`/`excluded` state model; `excluded` is terminal; source must be `active`; transition metadata is inseparable from the state change; the closed reason taxonomy (`user_deletion_request`, `consent_withdrawal`, `administrative_invalidation`, `session_propagated_exclusion`) is enforced inside the primitives.
- **Governed invocation contract (Slice 9).** Only authorized consumers may invoke the exclusion primitives, under defined governance event classes with exact reason mapping; primitives remain service-role-only.
- **Read eligibility contract (Slice 10).** Excluded records must not be presented as normal active user-facing results; implemented by Slice 1B and not reopened here.
- **Deletion request governance (Slice 11).** Intake boundary, authority boundary, scope model, mapping to `user_deletion_request`, the exclusion-versus-deletion distinction, and the residual handling contract.
- **Storage and binary retention boundary (Slice 12).** Lifecycle exclusion is not binary deletion; no storage object, reference, or secondary copy is acted on by any Slice 2 transition.

---

## First Authorized Lifecycle Consumer

**The first and only authorized lifecycle consumer introduced by Slice 2 is the governed user deletion request pathway**, executing session-level exclusion with reason `user_deletion_request` and child evidence transitioned by session propagation, per the existing primitive semantics.

Justification for introducing this consumer first:

- **It is the most completely governed pathway available.** Slice 11 already defines its intake, authority, scope, reason mapping, and residual handling. Slice 2 activates existing governance rather than authoring new governance.
- **It carries the strongest user and legal obligation.** Deletion requests are the lifecycle event whose absence creates real product and compliance risk.
- **It maps to a single frozen reason with no ambiguity.** No taxonomy extension or reinterpretation is required.
- **It exercises the full governed surface in one action.** Session-level exclusion with propagation validates the state machine, transaction semantics, metadata recording, and convergent re-execution — establishing the pattern every later consumer will reuse.
- **Its effects are now safely observable.** With Slice 1B closed, an exclusion is correctly reflected on all planned read surfaces; activating this consumer earlier would have violated the read eligibility contract.

No other event class — consent withdrawal, administrative invalidation, or an independent child-level exclusion pathway — is activated by this slice.

---

## Lifecycle Transition Flow

The conceptual sequence is a single directed flow. Every stage is mandatory; no stage may be skipped or reordered:

**Request → Governance validation → Authorized lifecycle transition → Eligibility state update → Existing eligibility-aware read path**

1. **Request.** A deletion request enters through the Slice 11 intake boundary, identifying the requesting user and target scope. Nothing transitions at intake.
2. **Governance validation.** The request is validated against the Slice 11 authority boundary and scope model, and the Slice 9 invocation preconditions: the target exists, is in the `active` state, and the event maps to `user_deletion_request`. Requests failing any check terminate here with no effect.
3. **Authorized lifecycle transition.** The pathway invokes the session-level exclusion primitive under the service-role authority posture. The primitive — not the consumer — enforces the state machine, the closed reason taxonomy, children-first ordering, and all-or-nothing transaction semantics.
4. **Eligibility state update.** The session anchor and its lifecycle-participating children transition to `excluded` with mandatory transition metadata; propagated children record `session_propagated_exclusion`. No payload, storage reference, or binary is touched.
5. **Existing eligibility-aware read path.** No further action occurs. The excluded session ceases to appear in eligibility-filtered reads because the Slice 1A boundary views no longer return it, and every Slice 1B consumer already reads through that boundary.

---

## Read Consistency

No additional read-path work is required after Slice 1B. This is a structural property of the completed foundation, not a Slice 2 obligation:

- **The boundary views are the single point of eligibility truth.** `eligible_scan_records` filters on lifecycle state at query time; a Slice 2 transition is reflected immediately and automatically, with no notification or invalidation mechanism.
- **All planned consumers already read through the boundary.** Dashboard latest analysis, history list, and history detail gate linked analyses on `eligible_scan_records`. An exclusion simply gives their existing filtering logic data that exercises it.
- **Legacy compatibility is unaffected.** Analyses with null `scan_record_id` bypass eligibility by design and remain visible; the pathway operates on session anchors and cannot affect legacy rows.
- **Ineligible history detail degrades to existing behaviour.** A direct request for an excluded linked analysis resolves to the pre-existing "Analiza nije pronađena." state, as verified at Slice 1B closure.

Any discovered need to modify a read surface during implementation is a scope breach and returns to planning.

---

## Failure Principles

Every failed lifecycle transition request must be non-destructive. Governance behaviour only:

- **Invalid request.** A request that fails intake, scope resolution, or precondition validation — including a non-existent target or a target not in the `active` state — fails fully: no state change, no metadata write, no partial application of any kind.
- **Duplicate request.** A repeated request for the same target is convergent, not destructive. It produces no second transition and never overwrites the original `status_reason` or `status_changed_at`.
- **Unauthorized request.** A requestor without authority over the target scope is rejected at the authority boundary before any primitive interaction occurs; client-facing roles hold no execution privilege on the primitives regardless of application-layer outcomes.
- **Already completed lifecycle transition.** A request targeting an already-`excluded` session is a rejected no-op that preserves the original transition metadata in full, per the Slice 8 re-exclusion rule; `excluded` is terminal and no pathway reverses it.

In all four cases, authoring state, transition history, and governance metadata are unchanged after the failure, and the outcome must be distinguishable from success so governance results are never silently ambiguous.

---

## Risks

Slice 2-specific governance risks only:

- **First live invocation of dormant capability.** The exclusion primitives have never executed against production data outside isolated validation; the first production exclusion is irreversible (`excluded` is terminal), so a scope-resolution error excludes the wrong session with no in-model path back.
- **Exclusion-versus-deletion expectation gap.** The pathway excludes; it does not delete. Binaries, storage references, and backups persist per the Slice 12 boundary, and this gap becomes user-visible for the first time when the pathway goes live.
- **`analyses` compatibility divergence becomes observable.** Excluded sessions vanish from eligibility-aware reads while rows persist in `public.analyses`; the accepted Slice 7/8 residual moves from theoretical to live.
- **Authority boundary is the single protective gate.** With primitives service-role-only, the application-layer authority check is the sole barrier between a client request and a governed transition.
- **Scope resolution correctness.** Over-resolution destroys eligibility of unaffected evidence; under-resolution leaves a deletion request incompletely honoured. Both are governance failures.
- **Precedent-setting invocation pattern.** As the first consumer, this pathway becomes the template for consent withdrawal and administrative invalidation; a weak pattern propagates.

---

## Validation Strategy

Before implementation is approved, the following must be validated at the design gate:

- **Contract preservation review** — confirmation that this design requires no change to any Phase 1 contract, the Slice 1A views, or the Slice 1B consumers.
- **Consumer authorization review** — confirmation that the deletion request pathway is an authorized consumer under the Slice 9 invocation contract, with correct event class and reason mapping.
- **Transition flow review** — acceptance of the five-stage flow as complete and correctly ordered, with every failure exit non-destructive.
- **Read-consistency confirmation** — verification against the Slice 1B execution reports and closure review that all three consumers observe exclusion correctly with zero read-path changes.
- **Failure behaviour coverage** — each failure principle (invalid, duplicate, unauthorized, already completed) must map to a verification step in the future implementation's validation plan, exercised without committing exclusions against production rows except as explicitly approved.
- **First-execution safety posture** — the implementation artifacts must define how the first production invocation is controlled and verified (bounded target, explicit approval, post-execution read-surface verification).

---

## Out of Scope

Slice 2 exclusions from the approved implementation plan, binding on all subsequent Slice 2 artifacts:

- **UI redesign** — no visual, layout, component, or styling changes beyond what the approved scope strictly requires.
- **API redesign** — no changes to existing endpoint contracts, shapes, or semantics.
- **Unrelated migrations** — no schema work outside the approved Slice 2 scope; any required migration is individually designed and gated within this slice.
- **New product features** — no user-facing feature work.
- **Analytics** — no analytics, tracking, or reporting instrumentation.
- **Performance optimisation** — no optimisation work.
- **Security redesign** — no changes to the authentication, authorization, or RLS posture beyond what the approved scope strictly requires.
- **MotionForge or any cross-project artifacts** — cross-project scope remains rejected.

---

## Exit Criteria

Slice 2 implementation work may begin only when all of the following hold:

1. **This technical design is reviewed and accepted** at gate review, with the single-consumer decision, transition flow, failure principles, and validation strategy explicitly approved.
2. **Contract preservation is confirmed** — the review records that no Phase 1 contract, Slice 1A view, or Slice 1B consumer requires modification.
3. **The first authorized consumer is accepted as the complete invocation surface** of this slice; no additional consumer or pathway is authorized.
4. **The validation strategy is accepted** as the binding obligations of the future implementation and execution reporting.
5. **Out-of-scope exclusions are acknowledged as binding** on all subsequent Slice 2 artifacts.
6. **No implementation, SQL, or migration work has occurred** during the design step; this document is the sole artifact of the Slice 2 design gate.

---

*End of Phase 2 Slice 2 Technical Design.*
