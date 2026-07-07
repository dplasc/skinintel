# Phase 1 Slice 7 — SQL Draft V1

This draft follows the approved:

- `PHASE_1_SLICE_7_PLAN.md`
- `PHASE_1_SLICE_7_TECHNICAL_DESIGN.md`
- `PHASE_1_SLICE_7_MIGRATION_PLAN.md`
- Phase 1 Slice 7 — SQL Readiness Audit

This is a review artifact. The SQL contained here is proposed DDL only; it must not be executed without explicit approval per the established slice artifact sequence (SQL Draft → execution approval → Execution Report).

---

## 1. Status

**Status:** Draft V1 — pending approval
**Phase:** 1
**Slice:** 7
**Depends on:** Slice 7 Plan (approved), Slice 7 Technical Design (approved), Slice 7 Migration Plan (approved), SQL Readiness Audit (completed)
**Artifact type:** SQL Draft (precedes execution approval and Execution Report)
**Migration file target:** `supabase/migrations/<timestamp>_phase_1_slice_7_session_anchor_lifecycle_metadata.sql`

---

## 2. Audit Summary

The SQL Readiness Audit resolved the Migration Plan's conditional step 2 by evidence:

- **`public.scan_records` is missing `status_reason` and `status_changed_at`.** This is the only schema gap in the entire lifecycle surface. The Slice 1 foundation created the session anchor with the `('active','excluded')` status dimension but no transition metadata; Slice 6 deliberately left `scan_records` unchanged.
- **All four evidence tables are already complete.** `user_description_evidence`, `image_evidence`, `product_mention_evidence`, and `ai_analysis_evidence` carry nullable `status_reason` and `status_changed_at` (Slice 6) and the canonical `('active','excluded','superseded')` vocabulary.
- **FK posture, RLS posture, `consent_snapshots` immutability, and the `analyses` compatibility surface are all in the target state.** No change to any of them is required or permitted.
- **No transition logic exists anywhere in the codebase.** The `POST /api/scan` dual-write path inserts all rows as `active` and references neither new column; the migration is invisible to it.

Conclusion: step 2 of the Migration Plan is **not** a no-op. The required migration is exactly two nullable additive columns on the session anchor.

## 3. SQL Scope

The migration performs, in a single forward-only transaction:

1. Add `public.scan_records.status_reason` — `text`, nullable, no default.
2. Add `public.scan_records.status_changed_at` — `timestamptz`, nullable, no default.
3. Add `COMMENT ON COLUMN` statements documenting the governed semantics of both columns, including the closed application-level reason vocabulary and the distinction from the pre-existing `updated_at` column.

Nothing else. Both additions use `ADD COLUMN IF NOT EXISTS` for idempotent re-review safety. No backfill occurs; every pre-existing row remains valid with null metadata, consistent with the Slice 6 pattern on the evidence tables.

## 4. Non-scope

Binding per the Migration Plan (Section 5) and the Technical Design constraints (Section 13):

- **No `scan_records.status` vocabulary change.** The check constraint remains `('active','excluded')`.
- **No CHECK constraint on `status_reason`.** The reason taxonomy is enforced at the governed service-role capability layer, not in the schema (Section 5).
- **No evidence table changes.** All four evidence tables are already in the target state.
- **No `consent_snapshots` changes.** It remains immutable and outside the state machine.
- **No `analyses` changes.** No lifecycle marker, column, or constraint on the compatibility surface.
- **No RLS changes.** No policies added, removed, or altered on any table.
- **No triggers, no functions, no indexes.**
- **No data changes.** No `UPDATE`, no `DELETE`, no backfill; all rows remain `active`.
- **No code, API, UI, or read-path changes.**
- **No down-migration versioned or shipped** (Section 8).

## 5. Reason Taxonomy

The closed vocabulary for `status_reason`, fixed at planning level per the Migration Plan (Section 4) and reviewed here as an artifact of this draft:

| Reason value | Meaning |
|---|---|
| `user_deletion_request` | Transition initiated by a governed user deletion request. |
| `consent_withdrawal` | Transition initiated by withdrawal of a consent scope required for eligibility. |
| `administrative_invalidation` | Transition initiated by an internal governance decision invalidating the session or evidence item. |
| `session_propagated_exclusion` | Child evidence transition caused by exclusion of its parent scan session (Technical Design, Section 7). |

**Enforcement posture — controlled application-level vocabulary, not a DB CHECK constraint.** This is a deliberate design decision, not an omission:

- The Technical Design places transition authority exclusively in the governed service-role capability; that capability is the single writer of `status_reason` and therefore the natural enforcement point.
- A CHECK constraint would force a constraint-rebuild migration for every future taxonomy addition, contradicting the Migration Plan requirement that the physical form be "chosen so additions remain additive."
- The column remains nullable because capture-time rows carry no reason; a non-null reason is mandatory only at transition time, which is a transition-validity rule (Technical Design, Section 5), not a column-level rule.

Any future value outside this table requires a reviewed taxonomy amendment before use. Free-text reasons are invalid by design.

## 6. SQL Draft

Proposed forward migration. Review only; do not execute without approval.

```sql
-- Phase 1 Slice 7 — Session anchor lifecycle transition metadata
-- Forward migration only.
--
-- Scope:
-- - Add nullable transition metadata columns to public.scan_records,
--   closing the residual gap identified by the Slice 7 SQL Readiness Audit.
--
-- Non-scope:
-- - No scan_records.status vocabulary change (remains 'active' | 'excluded').
-- - No CHECK constraint on status_reason (application-level closed vocabulary).
-- - No evidence table, consent_snapshots, or analyses changes.
-- - No RLS, trigger, function, or index changes.
-- - No backfill and no data changes; all rows remain 'active'.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Session anchor transition metadata (nullable, additive, no default)
-- ---------------------------------------------------------------------------
-- Mirrors the Slice 6 metadata pattern established on the four evidence
-- tables. Existing rows remain valid with null metadata; the capture write
-- path does not reference these columns.

ALTER TABLE public.scan_records
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

COMMENT ON COLUMN public.scan_records.status_reason IS
  'Governed transition reason recorded at session-level lifecycle transition (active -> excluded). Closed application-level vocabulary: user_deletion_request | consent_withdrawal | administrative_invalidation | session_propagated_exclusion. Null until a governed transition occurs; never free text; written only by the service-role transition capability.';

COMMENT ON COLUMN public.scan_records.status_changed_at IS
  'Timestamp of the governed session-level lifecycle transition (active -> excluded). Null until a governed transition occurs. Distinct from updated_at and from captured_at; capture timestamps are never rewritten.';

-- ---------------------------------------------------------------------------
-- 2. Explicitly unchanged
-- ---------------------------------------------------------------------------
-- public.scan_records.status remains constrained to ('active', 'excluded').
-- user_description_evidence, image_evidence, product_mention_evidence,
--   and ai_analysis_evidence are untouched (Slice 6 state is final).
-- consent_snapshots remains immutable and outside the state machine.
-- analyses receives no lifecycle marker; scan_record_id FK unchanged.
-- No RLS policies are added or modified.
-- No triggers, functions, or indexes are created.
-- No rows are updated; all rows remain 'active'.

COMMIT;
```

## 7. Validation Queries

Read-only verification to be executed after migration and recorded in the Execution Report. Expected results are stated per query.

```sql
-- V1. New columns exist on scan_records and are nullable with no default.
-- Expected: exactly two rows; is_nullable = 'YES'; column_default IS NULL.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'scan_records'
  AND column_name IN ('status_reason', 'status_changed_at')
ORDER BY column_name;

-- V2. scan_records status vocabulary is unchanged: active | excluded only.
-- Expected: one row; definition contains 'active' and 'excluded' and
-- does not contain 'superseded'.
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.scan_records'::regclass
  AND contype = 'c'
  AND conname = 'scan_records_status_check';

-- V3. No new CHECK constraint was introduced on status_reason.
-- Expected: zero rows referencing status_reason.
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.scan_records'::regclass
  AND contype = 'c'
  AND pg_get_constraintdef(oid) ILIKE '%status_reason%';

-- V4. Evidence table schemas are unchanged: metadata columns present
-- (from Slice 6), nullable, no default — confirming this migration did
-- not touch them and the Slice 6 baseline holds.
-- Expected: eight rows (4 tables x 2 columns); is_nullable = 'YES';
-- column_default IS NULL.
SELECT table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'user_description_evidence',
    'image_evidence',
    'product_mention_evidence',
    'ai_analysis_evidence'
  )
  AND column_name IN ('status_reason', 'status_changed_at')
ORDER BY table_name, column_name;

-- V5. Evidence status vocabularies are unchanged (canonical Slice 6 set).
-- Expected: four rows; each definition contains 'active', 'excluded',
-- 'superseded'.
SELECT conrelid::regclass AS table_name, conname,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'c'
  AND conname IN (
    'user_description_evidence_evidence_status_check',
    'image_evidence_evidence_status_check',
    'product_mention_evidence_evidence_status_check',
    'ai_analysis_evidence_evidence_status_check'
  )
ORDER BY table_name;

-- V6. consent_snapshots carries no lifecycle columns.
-- Expected: zero rows.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'consent_snapshots'
  AND column_name IN ('status', 'evidence_status', 'status_reason', 'status_changed_at');

-- V7. analyses carries no lifecycle marker.
-- Expected: zero rows.
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analyses'
  AND column_name IN ('status', 'evidence_status', 'status_reason', 'status_changed_at');

-- V8. RLS posture is byte-identical to baseline: SELECT-only policies,
-- no client write policies, on all Evidence Layer tables.
-- Expected: one SELECT policy per table (six rows total); no policy with
-- cmd other than SELECT. Compare against the pre-migration baseline capture.
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'scan_records',
    'consent_snapshots',
    'user_description_evidence',
    'image_evidence',
    'product_mention_evidence',
    'ai_analysis_evidence'
  )
ORDER BY tablename, policyname;

-- V9. Data state is untouched: no row carries transition metadata and
-- all sessions remain active.
-- Expected: all counts = 0.
SELECT
  count(*) FILTER (WHERE status <> 'active')          AS non_active_sessions,
  count(*) FILTER (WHERE status_reason IS NOT NULL)    AS rows_with_reason,
  count(*) FILTER (WHERE status_changed_at IS NOT NULL) AS rows_with_transition_ts
FROM public.scan_records;
```

## 8. Rollback / Forward Correction Note

- **Forward-only posture, consistent with Slices 1–6.** No down-migration is versioned, shipped, or executed.
- **Rollback pressure is inherently low by construction.** The columns are nullable, defaulted to nothing, unreferenced by any code path, and invisible to the capture dual-write. The pre-migration application behaves identically against the post-migration schema.
- **Emergency contingency (documented only, never pre-approved):** removing the two columns via `ALTER TABLE public.scan_records DROP COLUMN ...` is a **destructive act** requiring its own explicit approval and its own reviewed artifact. It must never be executed as part of this slice's normal flow.
- **Failure posture is forward correction.** If validation (Section 7) fails, the slice halts in place; the additive columns are harmless if unused, and remediation proceeds with a corrective forward migration, never a rollback.

## 9. Execution Preconditions

All must be satisfied before execution approval is granted:

1. **Pre-migration baseline recorded against the live database.** Slice 6 closure is confirmed by evidence — evidence table metadata columns, canonical vocabularies, and reconciled FK posture verified via live catalog inspection, not repository files. Any discrepancy halts Slice 7 and routes back to Slice 6 closure (Migration Plan, Section 10, highest risk).
2. **RLS baseline captured.** Output of validation query V8 recorded pre-migration for byte-identical post-migration comparison.
3. **Reason taxonomy approved.** The four-value closed vocabulary (Section 5) is reviewed and frozen; no additions pending.
4. **This SQL Draft approved** with the non-scope list (Section 4) acknowledged as binding.
5. **Capture regression baseline available.** A pre-migration reference capture through `POST /api/scan` exists for post-migration comparison (Migration Plan, step 4).
6. **No concurrent schema work in flight** against `scan_records` or any Evidence Layer table.

## 10. Approval Gate

This draft authorizes nothing by itself. The gated sequence is:

1. **SQL Draft V1 review** — this document is approved or revised.
2. **Execution approval** — explicit, separate authorization to apply the migration to the target environment.
3. **Execution** — the migration file is created in `supabase/migrations/` under the established naming convention and applied once, forward-only.
4. **Validation** — Section 7 queries executed and recorded; capture regression verification performed (Migration Plan, step 4).
5. **Production observation window** — capture traffic observed per Migration Plan, step 5.
6. **Execution Report** — closes the migration and, per the Migration Plan (Section 13), is the sole gate that authorizes subsequent implementation of the transition capability itself.

No transition capability, endpoint, job, or code change is authorized by this draft. All rows in all lifecycle-participating tables remain `active` after execution; this migration changes schema capability, not data state.

---

*End of Phase 1 Slice 7 SQL Draft V1.*
