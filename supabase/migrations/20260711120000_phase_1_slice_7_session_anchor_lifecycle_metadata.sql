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
