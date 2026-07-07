# Phase 1 Slice 10 Plan — Read-Surface Eligibility Boundary

## Status

**Status:** Draft — pending approval  
**Phase:** 1  
**Slice:** 10  
**Depends on:** Slices 1–9 (Slice 9 — Governed Exclusion Invocation Contract, closed by Execution Report)  
**Artifact type:** Plan (planning only; no implementation authorization)

---

## Background

Slices 6–9 established the lifecycle governance foundation: Slice 6 introduced the lifecycle surface, Slice 7 added transition metadata (`status_reason`, `status_changed_at`), Slice 8 delivered the dormant governed exclusion primitives, and Slice 9 froze the invocation contract for future consumers.

The read side remains untouched. Compatibility read paths may still surface records through `analyses` or other existing read surfaces even after a future exclusion occurs. This residual was explicitly accepted in Slices 8 and 9 and deferred to a future read-surface slice — this slice.

---

## Problem

Excluded lifecycle state must eventually influence read eligibility, but no read-surface boundary has been planned yet.

If a future workflow excludes a session or child evidence row, every existing read surface would continue serving it unchanged. Without a planned eligibility boundary, any future read-path change would resolve visibility semantics at implementation time — the same ungoverned gap Slice 9 closed on the write side.

---

## Scope

Planning only. Slice 10 identifies read eligibility rules; it does not implement them.

Read surfaces that must be assessed before any implementation:

- Dashboard latest analysis
- History list
- History detail
- Analysis-derived views
- Any compatibility surfaces backed by `analyses`

For each surface, planning must determine whether excluded lifecycle state should affect visibility, and under what contract.

---

## Non-Scope

- **No app code**
- **No API change**
- **No SQL**
- **No migration**
- **No RLS change**
- **No deletion**
- **No redaction**
- **No storage cleanup**
- **No localStorage handling**
- **No UI redesign**
- **No product feature**

Carried forward: the Slice 8 primitives remain dormant, no consuming workflow is implemented, and no invocation is authorized by Slice 10.

---

## Read Eligibility Questions

The Technical Design must answer:

- Should excluded scan records be hidden from user-facing history?
- Should excluded child evidence affect derived analysis visibility?
- How should compatibility `analyses` rows behave once their originating session is excluded?
- Should read behavior be strict exclusion, degraded visibility, or deferred to future separate handling?
- What would a future implementation slice need to verify after any read-eligibility change?

---

## Residual Risks

- **Excluded state may exist before read paths understand it.** The write-side capability can precede read-side awareness, creating a window of inconsistent visibility.
- **`analyses` compatibility surface may continue showing stale results** until an eligibility boundary is implemented.
- **Hiding data without a clear contract could create audit or trust confusion** — users or operators may expect explanation rather than silent disappearance.
- **Implementing read filtering too early could break existing dashboard/history behavior**, which currently depends on the unfiltered compatibility surface.

---

## Deliverables

| Artifact | Role |
|----------|------|
| **This plan** (`PHASE_1_SLICE_10_PLAN.md`) | Defines slice boundary, scope, non-scope, and exit criteria |
| **Technical Design** (`PHASE_1_SLICE_10_TECHNICAL_DESIGN.md`) | Created only after plan approval; defines read eligibility rules per surface |
| **Migration Plan** | Created only if the Technical Design proves a database change is required |
| **SQL Draft** | Not expected at planning stage |

---

## Exit Criteria

Slice 10 planning is complete when:

1. **Read-surface governance gap is accepted** at gate review.
2. **Candidate read surfaces are listed** and agreed as the assessment set.
3. **Non-scope is accepted** as binding.
4. **Technical Design is authorized** as the next artifact.
5. **No implementation has started** — no code, SQL, migration, or read-path change occurs within this slice.

---

*End of Phase 1 Slice 10 Plan.*
