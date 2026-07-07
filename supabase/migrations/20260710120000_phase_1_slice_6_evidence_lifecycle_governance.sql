-- Phase 1 Slice 6 — Evidence Lifecycle Governance Foundation
-- Forward migration only.
--
-- Scope:
-- - Widen evidence_status vocabulary on Slice 2–4 evidence tables.
-- - Add nullable lifecycle metadata columns to evidence tables.
-- - Reconcile selected scan_records child FK behavior away from CASCADE.
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

ALTER TABLE public.user_description_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

ALTER TABLE public.image_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

ALTER TABLE public.product_mention_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

ALTER TABLE public.ai_analysis_evidence
  ADD COLUMN IF NOT EXISTS status_reason text,
  ADD COLUMN IF NOT EXISTS status_changed_at timestamptz;

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
-- 4. Explicitly unchanged
-- ---------------------------------------------------------------------------
-- public.scan_records.status remains constrained to ('active', 'excluded').
-- public.analyses.scan_record_id remains ON DELETE SET NULL.
-- No non-AI evidence table receives supersedes_evidence_id in Slice 6.
-- No triggers are added.
-- No RLS policies are added or modified.

COMMIT;
