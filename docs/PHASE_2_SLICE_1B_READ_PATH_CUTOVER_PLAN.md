# Phase 2 Slice 1B Plan — Read Path Cut-over

## Status

**Status:** Draft  
**Phase:** 2  
**Parent Slice:** 1 — Evidence Layer Foundation  
**Slice:** 1B  
**Artifact type:** Plan  
**Depends on:**

- Phase 1 Governance Foundation (closed)
- Phase 1 Slice 10 — Read-Surface Eligibility Boundary (contract)
- `PHASE_2_IMPLEMENTATION_PLAN.md`
- `PHASE_2_SLICE_1_TECHNICAL_DESIGN.md` (approved)
- `PHASE_2_SLICE_1A_TECHNICAL_DESIGN.md` (approved)
- `PHASE_2_SLICE_1A_CLOSURE_REVIEW.md` (Slice 1A formally closed)

---

## Background

Slice 1A established the Evidence Persistence Boundary at the database layer. It shipped five dormant, eligibility-filtered read views — `eligible_scan_records`, `eligible_user_description_evidence`, `eligible_image_evidence`, `eligible_product_mention_evidence`, and `eligible_ai_analysis_evidence` — that make the Phase 1 read eligibility contract structurally enforceable at the persistence boundary: a row is visible only when it is `active` and its session anchor is `active`.

The views were deliberately shipped dormant. Slice 1A's approved scope was capability only; connecting any consumer was explicitly deferred, because a read-path change alters user-visible behaviour and therefore requires its own planned, designed, and reviewed slice. That deferral was recorded as an intentional residual in the Slice 1A closure review. Slice 1B is the slice that residual pointed to: the first approved consumer of the boundary.

---

## Problem

Every read surface in production still reads through the legacy `public.analyses` compatibility model: dashboard latest analysis, history list, history detail, and analysis-derived views. These reads are not lifecycle-aware — an excluded session would still surface as a normal active result, the exact residual bounded by the Phase 1 Slice 10 contract.

The cut-over cannot be a single switch, for three reasons:

- **Legacy rows lack full lifecycle linkage.** Existing `analyses` rows predate the evidence structures; `analyses.scan_record_id` is null for all legacy rows. A naive cut-over to the boundary views would silently drop legacy history from user-facing surfaces — a breaking behavioural change, not a governance improvement.
- **Each surface has different risk.** The dashboard's latest-result semantics, the history list's completeness expectations, and detail-view direct access each fail differently if eligibility filtering is introduced carelessly. They must be assessed and migrated individually, not as a batch.
- **The Slice 10 contract requires an explicit residual decision.** For `analyses`-backed reads, future implementation must choose filter, annotate, or replace — deliberately and verifiably. That choice has not yet been made and must be made per surface through this slice's artifact sequence.

An incremental cut-over — surface by surface, with compatibility preserved and verification at each step — is the only path that changes read behaviour without breaking existing history.

---

## Objective

Plan the migration of application read surfaces from the `analyses` compatibility model to the Evidence Persistence Boundary, so that eligibility-governed reads become the norm while existing user-visible history behaviour is preserved throughout the transition.

---

## Scope

Planning scope only:

- **Consumer identification.** Enumerate the read surfaces in scope — dashboard latest analysis, history list, history detail, and analysis-derived views — and classify each by its dependence on legacy `analyses` rows and its behavioural risk under eligibility filtering.
- **Governed read-path strategy.** Plan how consumers adopt the boundary views as their read source, including how the filter/annotate/replace decision required by the Slice 10 contract is made explicitly for each surface.
- **Compatibility preservation.** Plan how legacy rows without evidence linkage remain visible where users expect them, so that no history silently disappears during or after cut-over.
- **Rollout sequencing.** Plan the order in which surfaces migrate — lowest-risk first — and the criteria a surface must meet before the next begins.
- **Verification approach.** Plan how each migrated surface is verified against the Slice 10 obligations: active records still appear normally, excluded records do not appear as normal active results, and no source evidence or `analyses` row is mutated by any read path.

---

## Non-Scope

- **No SQL**
- **No code**
- **No UI changes**
- **No API changes**
- **No migration**
- **No deployment**

This plan authorizes no implementation of any kind. No read path changes behaviour within this planning slice.

---

## Exit Criteria

This planning slice is complete when:

1. **Consumer inventory is accepted** — the read surfaces in scope, and their classification by legacy dependence and risk, are explicit and approved at gate review.
2. **Scope and non-scope are accepted** — what the cut-over covers, and what it must not touch, are approved.
3. **Compatibility obligation is explicit** — preservation of legacy history visibility is accepted as binding on the technical design.
4. **Sequencing and verification obligations are accepted** — incremental, surface-by-surface rollout with per-surface verification is accepted as the required approach.
5. **No implementation is authorized** — no code, SQL, or runtime change occurs within this planning slice.

---

## Current Decision

The next artifact after approval of this plan is the **Technical Design for Phase 2 Slice 1B — Read Path Cut-over**. That design must make the filter/annotate/replace decision explicit per surface and define the compatibility mechanism for legacy rows. No design or implementation work begins before this plan is reviewed and approved.

---

*End of Phase 2 Slice 1B Plan.*
