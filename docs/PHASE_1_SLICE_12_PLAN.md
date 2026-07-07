# Phase 1 Slice 12 Plan — Storage and Binary Retention Boundary

## Status

**Status:** Draft — pending approval  
**Phase:** 1  
**Slice:** 12  
**Depends on:** Slices 1–11 (Slice 11 — User Deletion Request Governance, closed by Execution Report)  
**Artifact type:** Plan (planning only; no implementation authorization)

---

## Background

Slices 9–11 established the governed invocation contract, the read-surface eligibility boundary, and user deletion request governance. Lifecycle exclusion and deletion request governance are now documented end to end at contract level.

Binary and image storage behavior remains unresolved. Lifecycle exclusion is a database eligibility change only: storage references and binaries may persist in full even after a session or evidence row is excluded. Slice 11 explicitly recorded storage binaries, localStorage copies, exports, and audit records as open residuals deferred to future slices — this slice begins closing the storage portion of that residual set at planning level.

---

## Problem

Skin/photo/image binaries and their storage references need a future retention boundary, but no policy exists yet for what remains after exclusion, what is eligible for cleanup, and what must not be touched.

Without a planned retention boundary, any future storage cleanup would resolve its semantics at implementation time — risking premature binary deletion that breaks audit and verification, or indefinite retention that contradicts user deletion expectations.

---

## Scope

Planning only. Slice 12 plans the storage and binary retention boundary; it does not design or implement cleanup.

The boundary to be planned includes:

- **Storage reference boundary** — how database rows reference binaries, and what a reference implies for retention.
- **Binary retention boundary** — what persists after lifecycle exclusion, and for how long at policy level.
- **Storage cleanup eligibility** — under what conditions a binary may become eligible for future cleanup.
- **Exclusion vs. cleanup distinction** — database lifecycle exclusion and storage cleanup are separate governed actions; one does not imply the other.
- **Storage categories** — scan image vs. product image vs. OCR label image, each assessed separately for lifecycle participation.
- **Verification expectations** — how future cleanup must be verified without destroying its own evidence.
- **Residuals** — explicit treatment of backups, exports, CDN/cache copies, and localStorage.

---

## Non-Scope

- **No app code**
- **No API endpoint**
- **No UI**
- **No SQL**
- **No migration**
- **No RLS change**
- **No storage deletion**
- **No binary cleanup**
- **No VPS/storage provider changes**
- **No localStorage handling**
- **No email workflow**
- **No admin panel**
- **No product feature**
- **No invocation of Slice 8 primitives**

Carried forward: the Slice 8 primitives remain dormant, no consuming workflow exists, and no read-surface or deletion-workflow implementation is authorized.

---

## Governance Questions

The Technical Design must answer:

- Which storage categories are lifecycle-participating (scan images, product images, OCR label images)?
- When does a binary become eligible for cleanup?
- Is lifecycle exclusion alone sufficient to trigger cleanup eligibility, or is a separate governed decision required?
- How should cleanup be verified after execution?
- How should backups, cache, and CDN copies be treated relative to primary storage cleanup?
- What must be retained for audit or governance records, and for how long?
- How must user-facing deletion language avoid over-promising while binaries persist?

---

## Residual Risks

- **Expectation gap.** Users may expect image deletion while binaries still persist after lifecycle exclusion.
- **Secondary copies.** Backups, CDN, and cache may retain copies after primary cleanup, undermining any completeness claim.
- **Traceability loss.** Storage cleanup without a lifecycle contract could break the link between governance records and the actions they document.
- **Premature deletion.** Deleting binaries too early could break audits or future verification obligations.
- **Provider ambiguity.** An unclear boundary between application responsibility and VPS/storage provider behavior could create operational mistakes during future cleanup.

---

## Deliverables

| Artifact | Role |
|----------|------|
| **This plan** (`PHASE_1_SLICE_12_PLAN.md`) | Defines slice boundary, scope, non-scope, and exit criteria |
| **Technical Design** (`PHASE_1_SLICE_12_TECHNICAL_DESIGN.md`) | Created only after plan approval; defines the storage and binary retention boundary |
| **Migration Plan** | Created only if the Technical Design proves a database change is required |
| **SQL Draft** | Not expected at planning stage |

---

## Exit Criteria

Slice 12 planning is complete when:

1. **Storage/binary retention governance gap is accepted** at gate review.
2. **Storage categories to assess are listed** and agreed as the assessment set.
3. **Scope and non-scope are accepted** as binding.
4. **Technical Design is authorized** as the next artifact.
5. **No implementation has started** — no code, SQL, migration, storage deletion, or cleanup occurs within this slice.

---

*End of Phase 1 Slice 12 Plan.*
