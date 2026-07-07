# Phase 1 Slice 6 — SQL Draft V1

**Status:** Draft — pending review and approval
**Phase:** 1
**Slice:** 6
**Depends on:** `PHASE_1_SLICE_6_PLAN.md`, `PHASE_1_SLICE_6_TECHNICAL_DESIGN.md`, `PHASE_1_SLICE_6_MIGRATION_PLAN.md`, SQL Readiness Audit
**Artifact type:** SQL Draft (not a migration file)

---

## 1. Purpose

This document drafts the forward SQL for Phase 1 Slice 6. It translates the accepted planning, technical design, migration plan, and SQL readiness audit into a reviewable SQL artifact before a migration file is created.

This is not an executable migration artifact. It must be reviewed and approved before any file is created under `supabase/migrations/` or applied to an environment.

The SQL is intentionally limited to lifecycle vocabulary standardization, additive lifecycle metadata, and foreign-key delete-posture reconciliation. It does not introduce application code, API changes, UI changes, read-path changes, triggers, or client write policies.

## 2. Accepted Decisions

- Widen `evidence_status` vocabulary on `user_description_evidence`, `image_evidence`, and `product_mention_evidence` to allow `active`, `excluded`, and `superseded`.
- Keep `scan_records.status` unchanged as the session-level vocabulary `active` and `excluded`.
- Keep `analyses.scan_record_id` unchanged with its existing `ON DELETE SET NULL` behavior.
- Add nullable, additive lifecycle metadata columns:
  - `status_reason text`
  - `status_changed_at timestamptz`
- Do not add `supersedes_evidence_id` to `user_description_evidence`, `image_evidence`, or `product_mention_evidence` in Slice 6.
- Do not add client write policies. Existing RLS posture remains SELECT-only for client roles, with service-role writes.
- Reconcile cascading foreign-key behavior for `consent_snapshots.scan_record_id` and `ai_analysis_evidence.scan_record_id` away from `CASCADE` to restrictive behavior.

## 3. Forward SQL

```sql
-- Phase 1 Slice 6 — Evidence Lifecycle Governance Foundation
-- Forward SQL Draft V1
--
-- Scope:
-- - Widen evidence_status vocabulary on Slice 2–4 evidence tables.
-- - Add nullable/additive lifecycle metadata columns.
-- - Reconcile scan_records child FK behavior away from CASCADE.
--
-- Non-scope:
-- - No application code changes.
-- - No UI/API/read-path changes.
-- - No analyses.scan_record_id FK change.
-- - No scan_records.status change.
-- - No supersedes_evidence_id columns added to non-AI evidence tables.
-- - No triggers.
-- - No RLS policy changes.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Lifecycle vocabulary standardization
-- ---------------------------------------------------------------------------
-- The three non-AI evidence tables currently allow:
--   ('active', 'excluded')
-- Slice 6 widens them to the canonical evidence lifecycle vocabulary:
--   ('active', 'excluded', 'superseded')
--
-- This is a widening operation. Existing stored values remain valid.

ALTER TABLE public.user_description_evidence
  DROP CONSTRAINT IF EXISTS user_description_evidence_evidence_status_check;

ALTER TABLE public.user_description_evidence
  ADD CONSTRAINT user_description_evidence_evidence_status_check
  CHECK (evidence_status IN ('active', 'excluded', 'superseded'));

ALTER TABLE public.image_evidence
  DROP CONSTRAINT IF EXISTS image_evidence_evidence_status_check;

ALTER TABLE public.image_evidence
  ADD CONSTRAINT image_evidence_evidence_status_check
  CHECK (evidence_status IN ('active', 'excluded', 'superseded'));

ALTER TABLE public.product_mention_evidence
  DROP CONSTRAINT IF EXISTS product_mention_evidence_evidence_status_check;

ALTER TABLE public.product_mention_evidence
  ADD CONSTRAINT product_mention_evidence_evidence_status_check
  CHECK (evidence_status IN ('active', 'excluded', 'superseded'));

-- ---------------------------------------------------------------------------
-- 2. Nullable/additive lifecycle metadata
-- ---------------------------------------------------------------------------
-- These columns prepare future governed lifecycle transitions.
-- They are nullable because existing rows have not transitioned and the current
-- scan write path must continue to insert without supplying metadata.
--
-- status_reason:
--   Future machine-readable reason for lifecycle state transition.
--
-- status_changed_at:
--   Future timestamp for lifecycle state transition.

ALTER TABLE public.user_description_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

COMMENT ON COLUMN public.user_description_evidence.status_reason IS
  'Nullable lifecycle transition reason. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

COMMENT ON COLUMN public.user_description_evidence.status_changed_at IS
  'Nullable lifecycle transition timestamp. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

ALTER TABLE public.image_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

COMMENT ON COLUMN public.image_evidence.status_reason IS
  'Nullable lifecycle transition reason. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

COMMENT ON COLUMN public.image_evidence.status_changed_at IS
  'Nullable lifecycle transition timestamp. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

ALTER TABLE public.product_mention_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

COMMENT ON COLUMN public.product_mention_evidence.status_reason IS
  'Nullable lifecycle transition reason. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

COMMENT ON COLUMN public.product_mention_evidence.status_changed_at IS
  'Nullable lifecycle transition timestamp. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

ALTER TABLE public.ai_analysis_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

COMMENT ON COLUMN public.ai_analysis_evidence.status_reason IS
  'Nullable lifecycle transition reason. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

COMMENT ON COLUMN public.ai_analysis_evidence.status_changed_at IS
  'Nullable lifecycle transition timestamp. Reserved for future governed exclusion/supersession workflows; not populated by Slice 6 capture paths.';

-- ---------------------------------------------------------------------------
-- 3. Foreign-key delete posture reconciliation
-- ---------------------------------------------------------------------------
-- Current audited behavior:
-- - consent_snapshots.scan_record_id       ON DELETE CASCADE
-- - ai_analysis_evidence.scan_record_id    ON DELETE CASCADE
-- - user_description_evidence              ON DELETE RESTRICT
-- - image_evidence                         ON DELETE RESTRICT
-- - product_mention_evidence               ON DELETE RESTRICT
-- - analyses.scan_record_id                ON DELETE SET NULL
--
-- Slice 6 reconciles cascading Evidence Layer paths away from CASCADE.
-- The default/no-action posture is restrictive in PostgreSQL: parent deletion
-- is blocked while dependent child rows exist.
--
-- analyses.scan_record_id is intentionally left unchanged.

ALTER TABLE public.consent_snapshots
  DROP CONSTRAINT IF EXISTS consent_snapshots_scan_record_id_fkey;

ALTER TABLE public.consent_snapshots
  ADD CONSTRAINT consent_snapshots_scan_record_id_fkey
  FOREIGN KEY (scan_record_id)
  REFERENCES public.scan_records (id)
  ON DELETE RESTRICT;

ALTER TABLE public.ai_analysis_evidence
  DROP CONSTRAINT IF EXISTS ai_analysis_evidence_scan_record_id_fkey;

ALTER TABLE public.ai_analysis_evidence
  ADD CONSTRAINT ai_analysis_evidence_scan_record_id_fkey
  FOREIGN KEY (scan_record_id)
  REFERENCES public.scan_records (id)
  ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- 4. Explicitly unchanged by this draft
-- ---------------------------------------------------------------------------
-- public.scan_records.status remains constrained to ('active', 'excluded').
-- public.analyses.scan_record_id remains ON DELETE SET NULL.
-- No non-AI evidence table receives supersedes_evidence_id in Slice 6.
-- No triggers are added.
-- No RLS policies are added or modified.

COMMIT;
```

## 4. Validation SQL

```sql
-- ---------------------------------------------------------------------------
-- 1. Verify evidence_status CHECK constraints exist and carry expected names.
-- ---------------------------------------------------------------------------

SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname IN (
  'user_description_evidence_evidence_status_check',
  'image_evidence_evidence_status_check',
  'product_mention_evidence_evidence_status_check',
  'ai_analysis_evidence_evidence_status_check',
  'scan_records_status_check'
)
ORDER BY table_name::text, constraint_name;

-- Expected:
-- - user_description_evidence allows active/excluded/superseded.
-- - image_evidence allows active/excluded/superseded.
-- - product_mention_evidence allows active/excluded/superseded.
-- - ai_analysis_evidence remains active/excluded/superseded.
-- - scan_records remains active/excluded only.

-- ---------------------------------------------------------------------------
-- 2. Verify nullable lifecycle metadata columns exist on evidence tables.
-- ---------------------------------------------------------------------------

SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
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

-- Expected:
-- - Two rows per evidence table.
-- - status_reason is text and nullable.
-- - status_changed_at is timestamp with time zone and nullable.

-- ---------------------------------------------------------------------------
-- 3. Verify FK delete behavior is restrictive where expected.
-- ---------------------------------------------------------------------------

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS referenced_table_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_catalog = kcu.constraint_catalog
  AND tc.constraint_schema = kcu.constraint_schema
  AND tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_catalog = ccu.constraint_catalog
  AND tc.constraint_schema = ccu.constraint_schema
  AND tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_catalog = rc.constraint_catalog
  AND tc.constraint_schema = rc.constraint_schema
  AND tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'consent_snapshots',
    'user_description_evidence',
    'image_evidence',
    'product_mention_evidence',
    'ai_analysis_evidence'
  )
  AND kcu.column_name = 'scan_record_id'
ORDER BY tc.table_name;

-- Expected:
-- - consent_snapshots delete_rule = RESTRICT
-- - user_description_evidence delete_rule = RESTRICT
-- - image_evidence delete_rule = RESTRICT
-- - product_mention_evidence delete_rule = RESTRICT
-- - ai_analysis_evidence delete_rule = RESTRICT

-- ---------------------------------------------------------------------------
-- 4. Verify analyses.scan_record_id remains ON DELETE SET NULL.
-- ---------------------------------------------------------------------------

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS referenced_table_name,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_catalog = kcu.constraint_catalog
  AND tc.constraint_schema = kcu.constraint_schema
  AND tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_catalog = ccu.constraint_catalog
  AND tc.constraint_schema = ccu.constraint_schema
  AND tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_catalog = rc.constraint_catalog
  AND tc.constraint_schema = rc.constraint_schema
  AND tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'analyses'
  AND kcu.column_name = 'scan_record_id';

-- Expected:
-- - analyses.scan_record_id delete_rule = SET NULL

-- ---------------------------------------------------------------------------
-- 5. Verify no supersedes_evidence_id columns were added to non-AI evidence.
-- ---------------------------------------------------------------------------

SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'user_description_evidence',
    'image_evidence',
    'product_mention_evidence'
  )
  AND column_name = 'supersedes_evidence_id'
ORDER BY table_name;

-- Expected:
-- - Zero rows.

-- ---------------------------------------------------------------------------
-- 6. Verify no unintended status metadata was added to non-evidence tables.
-- ---------------------------------------------------------------------------

SELECT
  table_name,
  column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('scan_records', 'consent_snapshots', 'analyses')
  AND column_name IN ('status_reason', 'status_changed_at')
ORDER BY table_name, column_name;

-- Expected:
-- - Zero rows.

-- ---------------------------------------------------------------------------
-- 7. Verify scan_records.status remains unchanged.
-- ---------------------------------------------------------------------------

SELECT
  conrelid::regclass AS table_name,
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'scan_records_status_check';

-- Expected:
-- - CHECK still allows only active/excluded.
```

## 5. Rollback Notes

Rollback is conceptual at this stage. No rollback SQL is approved in this artifact.

- Vocabulary widening can be reversed only if no rows have been written with `evidence_status = 'superseded'` in the affected tables.
- Nullable metadata columns are additive and dormant. Leaving them in place is usually lower risk than removing them during an incident.
- Foreign-key posture rollback would restore the previous cascading behavior for `consent_snapshots` and `ai_analysis_evidence`. That reopens the known risk of silent evidence/consent deletion and must be treated as a governance decision, not a routine cleanup action.
- Because this draft rewrites no stored status values and introduces no triggers or code paths, rollback scope is limited to schema posture.

## 6. Risks

- Changing `consent_snapshots` and `ai_analysis_evidence` from cascading behavior to restrictive behavior is a real delete-semantics change. Any unknown manual or operational process that relies on cascade will fail after this migration.
- Dropping and recreating constraints can take locks. The actual migration review must consider table size and expected lock duration before production execution.
- `ADD COLUMN IF NOT EXISTS` protects repeated draft execution, but it can also hide a pre-existing column with incompatible semantics if one was added manually outside the repo. The validation step must inspect type and nullability, not only presence.
- Constraint names are assumed from existing migration files. If production constraint names differ from repo definitions, the SQL Draft must be adjusted before execution.
- The draft intentionally does not add lifecycle-transition enforcement. Until future service-role workflows exist, `status_reason` and `status_changed_at` remain structurally available but behaviorally unenforced.
- The draft does not add supersession traceability to non-AI evidence tables. That is consistent with Slice 6 scope, but future supersession workflows for those tables will require additional schema work.

## 7. Approval Gate

This SQL must be reviewed and explicitly approved before creating the actual migration file under `supabase/migrations/`.

Approval must confirm:

- The FK delete-posture change away from cascade is accepted as a deliberate governance behavior change.
- The nullable metadata shape is sufficient for the next lifecycle governance slice.
- `analyses.scan_record_id`, `scan_records.status`, RLS policies, application code, API behavior, UI behavior, and read paths remain out of scope.
- The validation SQL is sufficient to prove the intended schema state after migration.

---

*End of Phase 1 Slice 6 SQL Draft V1.*
