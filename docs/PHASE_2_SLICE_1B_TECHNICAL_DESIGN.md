# Phase 2 Slice 1B Technical Design — Read Path Cut-over

## Status

**Status:** Draft  
**Phase:** 2  
**Parent Slice:** 1 — Evidence Layer Foundation  
**Slice:** 1B  
**Artifact type:** Technical Design  
**Depends on:**

- Phase 1 Slice 10 — Read-Surface Eligibility Boundary (contract)
- `PHASE_2_SLICE_1A_TECHNICAL_DESIGN.md` (approved)
- `PHASE_2_SLICE_1A_CLOSURE_REVIEW.md` (Slice 1A formally closed)
- `PHASE_2_SLICE_1B_READ_PATH_CUTOVER_PLAN.md` (approved)

This document designs the first approved consumer of the Evidence Persistence Boundary. It contains no code, no SQL, no migrations, no API changes, and no UI changes, and it authorizes no implementation.

---

## Verified Consumer Inventory

The current codebase was inspected before this design was written. Application code contains exactly three read surfaces that consume `public.analyses`, plus one write path relevant to compatibility. No other application file reads `analyses`.

### 1. Dashboard latest analysis

- **File/path:** `app/actions/index.ts` — `getLatestAnalysis()` server action, consumed by `app/(dashboard)/(homes)/dashboard/page.tsx` on mount.
- **Current data source:** `analyses`, selecting `id, confidence, created_at` with an exact count, filtered by `user_email`, ordered by `created_at` descending, limit 1, via a service-role client.
- **User-visible role:** Latest-scan metadata card and total analysis count on the dashboard; links to `/history/{id}`.
- **Legacy analyses dependence:** Total. Reads only `analyses`; metadata-only payload (no result content).
- **Eligibility risk:** Low. Worst case under a naive cut-over is a wrong "latest" pointer or count; no result content is rendered from this query. The dashboard's full scan result display comes from the in-memory API response and `localStorage`, not from this read.

### 2. History list

- **File/path:** `app/(dashboard)/(homes)/history/page.tsx` (server component).
- **Current data source:** `analyses`, selecting `id, confidence, model, created_at, result`, filtered by `user_email`, ordered descending, limit 50, via a service-role client.
- **User-visible role:** Full history timeline, progress summary (first/last analysis, day gap), and before/after comparison links. The oldest/newest comparisons are derived in-page from this single query.
- **Legacy analyses dependence:** Total. All list content and derived summaries come from `analyses` rows, including rows that predate evidence structures.
- **Eligibility risk:** Medium. Careless filtering would silently shrink the timeline and shift the before/after anchors — user-visible history loss.

### 3. History detail

- **File/path:** `app/(dashboard)/(homes)/history/[id]/page.tsx` (server component).
- **Current data source:** `analyses`, selecting a single row by `id` and `user_email` via a service-role client.
- **User-visible role:** Full saved analysis rendering (intro, assessment, top-5 recommendations, next steps, disclaimer). Already has a designed not-found state ("Analiza nije pronađena.") for missing or unowned rows.
- **Legacy analyses dependence:** Total. Renders the complete `result` payload of an `analyses` row.
- **Eligibility risk:** Medium. Direct URL access to an excluded session must not render a normal active detail view; behaviour for that case must be an explicit decision.

### 4. Scan write path (contextual, not a read surface)

- **File/path:** `app/api/scan/route.ts`.
- **Relevant behaviour:** Dual-writes governed evidence (including `ai_analysis_evidence`) and a compatibility `analyses` row stamped with `scan_record_id`. New `analyses` rows are therefore evidence-linked; rows predating Phase 1 Slice 1 have `scan_record_id` null.
- **Slice 1B impact:** None. The write path is out of scope and unchanged; it is recorded here because the `scan_record_id` presence/absence split defines the compatibility problem this design must solve.

One adjacent surface is noted for completeness: the dashboard renders the most recent scan result from `localStorage` (`skinintel_last_scan`), not from any database read. This is the localStorage residual already named in Phase 1 closure and is outside this slice.

---

## Design Goal

Introduce governed, eligibility-aware read consumption on the three surfaces above so that excluded sessions stop being presentable as normal active results — while guaranteeing that no legacy history disappears and no existing UX breaks.

Two facts make this achievable safely. First, every current row is `active` and the Slice 8 exclusion primitives are dormant, so correctly designed eligibility filtering is observationally invisible at cut-over time: behaviour changes only if and when an exclusion later occurs, which is exactly the intent. Second, legacy `analyses` rows carry no evidence linkage (`scan_record_id` null), so they have no lifecycle state to evaluate and must remain visible by definition, not by accident.

The goal is therefore not a data migration and not a UI change: it is making the three read helpers eligibility-aware, with legacy rows explicitly grandfathered.

---

## Eligibility Strategy

The Slice 10 contract requires an explicit filter/annotate/replace decision per surface. This design decides as follows:

### Dashboard latest analysis — **filter**

An `analyses` row whose linked session is not eligible must not be selected as the latest result, and must not contribute to the total count as a normal active record. Rows without evidence linkage remain eligible (see Compatibility Strategy). Filter is chosen over annotate because the surface renders metadata only — there is nothing meaningful to annotate — and over replace because the boundary views cannot yet serve legacy rows, which dominate the count.

### History list — **filter**

Rows whose linked session is not eligible are omitted from the timeline and from the derived summaries (count, first/last, before/after anchors), so the list remains internally consistent. Rows without evidence linkage remain listed. Filter is chosen over annotate to avoid a UI redesign (annotated degraded entries would be new UI, which is out of scope) and because omission is the behaviour the eligibility contract describes for normal active listings.

### History detail — **filter**, reusing the existing not-found state

Direct access to a row whose linked session is not eligible renders the existing "Analiza nije pronađena." state — the same designed behaviour as a missing or unowned row. This satisfies the contract (no normal active rendering of an excluded session) with zero new UI. Annotated or restricted views remain possible future work if a product decision ever wants exclusion to be distinguishable from absence; nothing in this choice forecloses that.

### Replace — **deferred for all surfaces**

Full replacement of `analyses` reads with boundary-view reads is deferred. The boundary views cannot represent legacy rows, and `ai_analysis_evidence` payload parity with `analyses.result` has not been verified. Replacement becomes a candidate slice only after (a) legacy representation is decided and (b) payload parity is verified. Until then, `analyses` remains the row source and the boundary supplies eligibility.

### Analysis-derived views — **defer**

The in-page derivations on the history list (progress summary, before/after) inherit the list's filtering automatically and need no separate mechanism. The dashboard localStorage display is outside this slice, as recorded in Phase 1 closure.

Conceptually, each surface keeps `analyses` as its row source and consults the Evidence Persistence Boundary as its eligibility source: a linked row is eligible when its session anchor is eligible (as expressed by `eligible_scan_records`); an unlinked row is eligible unconditionally. The exact mechanism (query shape, helper structure) is an implementation-slice decision within this rule.

---

## Compatibility Strategy

Legacy `analyses` rows — those with `scan_record_id` null — predate the evidence structures and carry no lifecycle state. This design binds the following compatibility rule:

- **Null linkage means eligible.** A legacy row is never filtered, hidden, or degraded by any eligibility mechanism introduced under this slice. Eligibility evaluation applies only to rows that carry a `scan_record_id`.
- **No backfill.** No legacy row is linked, migrated, or modified by this slice. Retroactively linking legacy rows to evidence structures would be a data migration with its own governance obligations and is explicitly a separate future slice.
- **The grandfathering is permanent until explicitly revisited.** If a future slice migrates legacy rows into the evidence boundary, the null-means-eligible rule is retired by that slice's own reviewed decision — never silently.

The consequence is stated plainly: legacy history remains visible exactly as today, and eligibility governance takes effect only for evidence-linked sessions — which are precisely the sessions the governance model can address.

---

## Rollout Strategy

Surfaces migrate one at a time, lowest risk first. A surface must pass its verification before the next begins.

1. **Dashboard latest analysis** (`getLatestAnalysis()`). Lowest risk: metadata-only payload, single row plus count, one consumer, trivially comparable before/after. This is the first approved consumer of the Evidence Persistence Boundary.
2. **History list.** Same filtering rule extended to a multi-row read with derived summaries; verified against timeline completeness.
3. **History detail.** Direct-access behaviour verified last, including the excluded-session not-found path.

Each step is its own small implementation slice with its own gate sequence. Because all current rows are `active`, each cut-over is expected to produce byte-identical user-visible output at deployment time, which is itself a verification criterion.

---

## Verification Strategy

Every implementation slice under this design must verify, per surface:

- **Active records still appear.** Output with eligibility-aware reads is identical to the pre-change output for the current all-active dataset — same rows, same order, same counts, same rendering.
- **Excluded records do not appear as normal active results where governed evidence is used.** Demonstrated in a non-production environment by excluding a test session via the governed Slice 8 primitives and confirming: the dashboard does not present it as latest or count it, the history list omits it and recomputes summaries consistently, and detail access renders the not-found state.
- **Legacy history remains visible.** Rows with null `scan_record_id` appear on every surface exactly as before, in the presence and absence of excluded linked rows.
- **No records are mutated by reads.** Eligibility evaluation is read-only: no write, update, or state transition occurs on `analyses`, evidence tables, or `scan_records` as a side effect of any read path, verified by row-level comparison before and after read execution.

Verification results are recorded in each implementation slice's execution report, per the Slice 10 verification obligations.

---

## Non-Scope

This design and the slices under it explicitly exclude:

- **No SQL migrations**
- **No schema changes**
- **No UI redesign** — existing empty/not-found states are reused; no new visual states are introduced
- **No API redesign** — no endpoint contract changes; the scan write path is untouched
- **No data backfill** — legacy `analyses` rows are not linked or migrated
- **No deletion workflow changes** — the Slice 8 primitives remain dormant in production; this slice consumes eligibility state, never creates it
- **No storage/binary cleanup**
- **No Knowledge Layer structures**
- **No Intelligence Layer structures**

---

## Design Exit Criteria

This design is complete when:

1. **The consumer inventory is accepted as verified** — the three read surfaces and the write-path context reflect the actual codebase at gate review.
2. **The per-surface eligibility decision is accepted** — filter for all three surfaces, replace and annotate explicitly deferred, with the reasoning approved.
3. **The compatibility rule is accepted as binding** — null linkage means eligible, no backfill, grandfathering retired only by explicit future decision.
4. **Rollout order and per-surface verification obligations are accepted** — dashboard first, then history list, then history detail, each independently gated.
5. **No implementation is authorized** — no code, SQL, or runtime change results from this document.

---

## Current Decision

The next step after approval of this design is the **first small implementation slice for the lowest-risk consumer**: making `getLatestAnalysis()` eligibility-aware as the first approved consumer of the Evidence Persistence Boundary. That slice proceeds through its own gate sequence — plan, review, implementation, execution report, closure review — before the history list or history detail surfaces are touched.

---

*End of Phase 2 Slice 1B Technical Design.*
