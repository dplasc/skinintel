# Phase 1 Slice 11 Plan — User Deletion Request Governance

## Status

**Status:** Draft — pending approval  
**Phase:** 1  
**Slice:** 11  
**Depends on:** Slices 1–10 (Slice 10 — Read-Surface Eligibility Boundary, closed by Execution Report)  
**Artifact type:** Plan (planning only; no implementation authorization)

---

## Background

Deletion/retention governance exists conceptually across the Phase 1 lifecycle work. Slice 9 identified `user_deletion_request` as the first candidate governance event class for future invocation of the dormant Slice 8 exclusion primitives. Slice 10 defined that excluded records must eventually stop appearing as normal active read results.

Slices 6–10 therefore established lifecycle metadata, governed exclusion primitives, the invocation contract, and the read-surface eligibility contract. However, there is still no planned governance boundary for a user deletion request workflow itself — the business event that would first exercise this chain.

---

## Problem

A user deletion request must eventually map to governed lifecycle exclusion, but nothing about the request itself has been planned: the request lifecycle, the authority boundary, the affected evidence scope, the read impact, and the non-deletion residuals are all undefined.

Without a planned governance boundary, a future implementation would resolve deletion-request semantics at coding time — the exact gap the artifact sequence exists to prevent, now at the workflow layer.

---

## Scope

Planning only. Slice 11 plans the user deletion request governance boundary; it does not design or implement it.

The boundary to be planned includes:

- **Request intake boundary** — how a deletion request enters governance, at planning level only.
- **Actor / authority boundary** — who may request, and who may authorize, before any service-role action.
- **Mapping to `user_deletion_request`** — how an approved request binds to the caller-suppliable reason frozen in Slices 8–9.
- **Exclusion vs. deletion distinction** — the governed action is lifecycle exclusion (eligibility change), not physical deletion.
- **Affected scan/evidence scope** — which session anchors and child evidence rows a request covers.
- **Verification expectations** — aligned with the Slice 9 invocation contract and Slice 10 read eligibility contract.
- **Residuals** — explicit treatment of `analyses`, storage, localStorage, and compatibility reads that persist after exclusion.

---

## Non-Scope

- **No app code**
- **No API endpoint**
- **No UI**
- **No SQL**
- **No migration**
- **No RLS change**
- **No invocation of Slice 8 primitives**
- **No physical deletion**
- **No redaction**
- **No storage cleanup**
- **No localStorage handling**
- **No email workflow**
- **No admin panel**
- **No product feature**

Carried forward: the Slice 8 primitives remain dormant, no consuming workflow exists, and no read-surface implementation is authorized.

---

## Governance Questions

The Technical Design must answer:

- Who may initiate a deletion request?
- How should identity and authority be established in a future workflow before any governed action?
- Is request scope account-wide, scan-specific, or evidence-specific — or tiered?
- How does request approval map to the `user_deletion_request` reason under the Slice 9 contract?
- How should exclusion be verified after future invocation?
- How should compatibility `analyses` be handled in the future design, given the Slice 10 residual?
- What residuals must remain explicit to the user and to governance (storage, localStorage, compatibility reads)?

---

## Residual Risks

- **Expectation gap.** A user may expect physical deletion while current lifecycle exclusion is only an eligibility change; content persists in full.
- **Retained surfaces.** `analyses`, storage, and localStorage may retain data until future slices handle them.
- **False privacy guarantees.** Premature implementation could imply deletion guarantees the system does not yet provide.
- **Scope ambiguity.** Unclear request scope could cause over-exclusion (removing more than requested) or under-exclusion (leaving requested data active).
- **Stale visibility.** Invoking the primitives without read-surface handling in place could leave excluded records visible as stale results through unfiltered reads.

---

## Deliverables

| Artifact | Role |
|----------|------|
| **This plan** (`PHASE_1_SLICE_11_PLAN.md`) | Defines slice boundary, scope, non-scope, and exit criteria |
| **Technical Design** (`PHASE_1_SLICE_11_TECHNICAL_DESIGN.md`) | Created only after plan approval; defines the deletion request governance boundary |
| **Migration Plan** | Created only if the Technical Design proves a database change is required |
| **SQL Draft** | Not expected at planning stage |

---

## Exit Criteria

Slice 11 planning is complete when:

1. **Deletion request governance gap is accepted** at gate review.
2. **Event mapping to `user_deletion_request` is accepted** at planning level.
3. **Scope and non-scope are accepted** as binding.
4. **Technical Design is authorized** as the next artifact.
5. **No implementation has started** — no code, SQL, migration, primitive invocation, or workflow execution occurs within this slice.

---

*End of Phase 1 Slice 11 Plan.*
