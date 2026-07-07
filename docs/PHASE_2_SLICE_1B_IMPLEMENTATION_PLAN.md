# Phase 2 Slice 1B Implementation Plan — Dashboard Latest Analysis

## Status

**Status:** Draft  
**Phase:** 2  
**Parent Slice:** 1 — Evidence Layer Foundation  
**Slice:** 1B  
**Implementation Slice:** 1  
**Artifact type:** Implementation Plan

---

## Scope

Implement eligibility-aware reading only for `getLatestAnalysis()` in `app/actions/index.ts`.

This is the first approved consumer of the Evidence Persistence Boundary. The server action remains the sole read path for dashboard latest-analysis metadata (`id`, `confidence`, `created_at`, total count), consumed by `app/(dashboard)/(homes)/dashboard/page.tsx`. The change is confined to how eligible rows are selected and counted; the return shape, consumer contract, and all other surfaces are untouched.

---

## Dependencies

This implementation slice requires the following approved artifacts:

- Phase 1 Governance Foundation (closed)
- Phase 1 Slice 10 — Read-Surface Eligibility Boundary (contract)
- `PHASE_2_SLICE_1A_TECHNICAL_DESIGN.md` (approved)
- `PHASE_2_SLICE_1A_CLOSURE_REVIEW.md` (Slice 1A formally closed)
- `PHASE_2_SLICE_1B_READ_PATH_CUTOVER_PLAN.md` (approved)
- `PHASE_2_SLICE_1B_TECHNICAL_DESIGN.md` (approved)

The dormant eligibility views created by Slice 1A must be present in the target environment:

- `public.eligible_scan_records`
- `public.eligible_user_description_evidence`
- `public.eligible_image_evidence`
- `public.eligible_product_mention_evidence`
- `public.eligible_ai_analysis_evidence`

---

## Behaviour

The updated `getLatestAnalysis()` must satisfy the following rules, as defined by the Slice 1B Technical Design:

- **Linked analyses respect eligibility.** An `analyses` row with a non-null `scan_record_id` is eligible only when its linked session anchor appears in the Evidence Persistence Boundary (`eligible_scan_records`). Ineligible linked rows must not be returned as `latest` and must not contribute to `total`.
- **Legacy analyses (`scan_record_id` null) remain visible.** Rows without evidence linkage are unconditionally eligible. They must continue to appear in `latest` selection and in `total` exactly as they do today.
- **Output remains byte-identical for the current all-active dataset.** With every current row in `active` state and no exclusions executed, the returned `{ latest, total }` must match the pre-change output for the same user: same `id`, `confidence`, `created_at`, and same count.

Eligibility evaluation is read-only. No write, update, or lifecycle transition occurs on `analyses`, evidence tables, or `scan_records` as a side effect of this read.

The eligibility strategy for this surface is **filter**: ineligible linked rows are omitted, not annotated. `analyses` remains the row source; the boundary supplies eligibility only.

---

## Verification

Verification must be completed before this implementation slice closes:

1. **All-active parity.** For a user with only active rows (current production state), compare `{ latest, total }` before and after the change. Values must be identical.
2. **Legacy visibility.** Confirm that rows with `scan_record_id` null are included in `latest` selection and `total` when they are the most recent eligible row or part of the eligible set.
3. **Excluded linked row filtering.** In a non-production environment, exclude a test session linked to an `analyses` row via the governed Slice 8 primitives. Confirm that row is not returned as `latest` and is not included in `total`; the next eligible row (or legacy row) is selected instead.
4. **Read-only guarantee.** Confirm no rows in `analyses`, `scan_records`, or evidence tables are modified by `getLatestAnalysis()` execution (row-level comparison before and after).
5. **Error handling preserved.** Missing session, missing Supabase configuration, and query failure paths continue to return `{ latest: null, total: 0 }` without regression.

Results are recorded in the implementation slice execution report.

---

## Non-Scope

This implementation slice explicitly excludes:

- **History list** — `app/(dashboard)/(homes)/history/page.tsx` is untouched
- **History detail** — `app/(dashboard)/(homes)/history/[id]/page.tsx` is untouched
- **localStorage** — dashboard scan-result display from `skinintel_last_scan` is unchanged
- **Scan write path** — `app/api/scan/route.ts` is unchanged
- **SQL** — no migrations, schema changes, or database objects
- **UI** — no changes to `app/(dashboard)/(homes)/dashboard/page.tsx` or any visual component

No other server action, API route, or read surface is modified within this slice.

---

## Exit Criteria

This implementation slice is complete when:

1. **`getLatestAnalysis()` is eligibility-aware** — linked rows respect boundary eligibility; legacy rows remain unconditionally eligible.
2. **All-active parity is verified** — output is byte-identical for the current dataset.
3. **Excluded-row filtering is verified** — in a test environment, an excluded linked session is not presented as latest or counted.
4. **Read-only guarantee is verified** — no data mutation occurs on read.
5. **Non-scope is respected** — only `getLatestAnalysis()` was changed; no other surface, SQL, or UI was touched.
6. **Execution report is produced** — verification results are documented before closure review.

---

## Current Decision

After approval of this implementation plan, implementation may begin for **`getLatestAnalysis()` only**. No code change to any other surface, and no SQL, may proceed until this plan is reviewed and approved. Upon completion, the slice closes through execution report and closure review before the history list implementation slice begins.

---

*End of Phase 2 Slice 1B Implementation Plan — Dashboard Latest Analysis.*
