# Phase 2 Slice 1A Plan — Evidence Persistence Boundary

## Status

**Status:** Draft  
**Phase:** 2  
**Parent slice:** Slice 1 — Evidence Layer Foundation  
**Slice:** 1A  
**Artifact type:** Plan  
**Depends on:**

- Phase 1 Governance Foundation (closed)
- `PHASE_2_IMPLEMENTATION_PLAN.md`
- `PHASE_2_SLICE_1_EVIDENCE_LAYER_FOUNDATION_PLAN.md`
- `PHASE_2_SLICE_1_TECHNICAL_DESIGN.md` (approved)

---

## Background

Slice 1 defined the Evidence Layer architecture: its position as the lowest governed implementation layer, the responsibilities of each evidence category, and the conceptual lifecycle from capture through storage retention compatibility. Physical persistence and migration sequencing were intentionally deferred by that design.

Slice 1A begins narrowing that deferred area. It plans the persistence boundary only — which persistence responsibilities belong to the Evidence Layer and which do not — before any migration or code design work is undertaken.

---

## Problem

Before any migration or code can be designed, SkinIntel must decide which persistence responsibilities belong to the Evidence Layer and which remain outside it.

Without this boundary, future SQL or implementation work could accidentally mix evidence, knowledge, intelligence, storage binaries, and UI concerns in the same persistence surface — collapsing the layer separation the Slice 1 design established and making governance enforcement structurally impossible at the data layer.

---

## Objective

Plan the boundary for future persistence work supporting governed evidence records: what evidence persistence is responsible for, what it must never own, and what the subsequent technical design must decide.

---

## Scope

Planning scope only:

- **Evidence-bearing persistence responsibility** — what it means for a persisted record to carry evidence.
- **Relationship between scan record anchor and child evidence** — the anchor-and-subordinate structure at persistence level.
- **Lifecycle metadata participation** — evidence-bearing records participate in the Phase 1 lifecycle status model.
- **Provenance requirements** — what persisted evidence must retain about its origin.
- **Consent-at-capture compatibility** — persistence remains bound to consent state effective at capture time.
- **Read eligibility compatibility** — persisted evidence remains consumable under the Phase 1 read eligibility contract.
- **Deletion request compatibility** — persisted evidence remains addressable by deletion request governance.
- **Storage reference compatibility** — evidence persistence references binaries without owning them, per the Phase 1 retention boundary.
- **Backward compatibility with existing analysis persistence** — currently persisted analyses continue to function until explicitly migrated.

---

## Non-Scope

- **No SQL migrations**
- **No schema definitions**
- **No table names**
- **No column names**
- **No indexes**
- **No RLS policies**
- **No API changes**
- **No UI changes**
- **No storage/binary implementation**
- **No data backfill**
- **No production deployment**

This plan authorizes no implementation of any kind.

---

## Persistence Boundary Principles

- **Evidence records must be distinguishable from derived knowledge.** Persistence must never blur what was captured with what was interpreted.
- **AI outputs are evidence only when provenance is retained.** An analysis output without traceable inputs and session context is not evidence and does not belong inside the evidence persistence boundary.
- **Stored binaries are not owned by evidence persistence.** Evidence persists references and capture context; the binary object remains governed by the Phase 1 storage retention boundary.
- **Lifecycle participation is required for evidence-bearing records.** A persisted record that carries evidence but cannot participate in the lifecycle status model is a boundary violation, not an option.
- **Read eligibility is not a UI-only concern.** Eligibility must be enforceable at the persistence boundary, not delegated to presentation layers.
- **Deletion governance must remain addressable.** Every evidence-bearing record must be reachable by the scope models defined in Phase 1 deletion request governance.
- **Compatibility with current persisted analyses must be preserved until explicitly migrated.** Existing history behavior continues unchanged; any migration away from it is its own planned, reviewed decision.

---

## Design Questions for Next Artifact

The technical design must answer, and this plan deliberately does not:

- What existing persisted records are in scope?
- What new persistence responsibilities are required?
- How should existing analysis records relate to evidence records?
- Which evidence categories require first-class persistence?
- Which lifecycle metadata must be represented?
- What provenance must be preserved?
- How should storage references be linked without owning binaries?
- What compatibility constraints must protect existing history views?

---

## Exit Criteria

This planning slice is complete when:

1. **Persistence scope and non-scope are accepted** at gate review.
2. **Boundary principles are explicit** and accepted as binding on the technical design.
3. **Design questions are listed** and accepted as the design's obligations.
4. **No implementation is authorized** — no code, SQL, migration, or runtime change occurs within this planning slice.

---

## Current Decision

The next artifact after approval of this plan is the Technical Design for Phase 2 Slice 1A — Evidence Persistence Boundary. No design or implementation work begins before this plan is reviewed and approved.

---

*End of Phase 2 Slice 1A Plan.*
