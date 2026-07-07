-- Phase 1 Slice 8 — Governed Exclusion Transition Primitive
-- Forward migration only.
--
-- Source artifacts:
-- - docs/PHASE_1_SLICE_8_PLAN.md
-- - docs/PHASE_1_SLICE_8_TECHNICAL_DESIGN.md
-- - docs/PHASE_1_SLICE_8_MIGRATION_PLAN.md
-- - docs/PHASE_1_SLICE_8_SQL_DRAFT_V1.md
-- - docs/PHASE_1_SLICE_8_SQL_DRAFT_V2.md
--
-- Scope:
-- - Create two database-layer governed exclusion primitives:
--     public.exclude_evidence_row(text, uuid, text)  — subordinate child-level exclusion
--     public.exclude_scan_record(uuid, text)         — session-level exclusion + propagation
-- - Restrict execution authority to the service-role posture within this same unit.
--
-- The primitives ship DORMANT: this migration creates capability only. It executes
-- no transition against production data.
--
-- Non-scope (binding):
-- - No table schema changes (no table/column/constraint/index/FK/comment on existing objects).
-- - No RLS policy changes.
-- - No triggers.
-- - No scheduled jobs.
-- - No data backfill and no production transition execution; all rows remain 'active'.
-- - consent_snapshots and analyses are never read or written by any primitive.
--
-- Lifecycle facts (from Slices 2–7, unchanged here):
-- - Evidence tables use column `evidence_status` ('active' | 'excluded' | 'superseded'),
--   PK `id`, session FK `scan_record_id`, plus `status_reason` / `status_changed_at`.
-- - scan_records uses column `status` ('active' | 'excluded'),
--   plus `status_reason` / `status_changed_at`.
--
-- Reason taxonomy (closed, application-level; no CHECK constraint by Slice 7 decision):
-- - Caller-suppliable: user_deletion_request | consent_withdrawal | administrative_invalidation
-- - Reserved internal (propagation only, never caller input): session_propagated_exclusion

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Child-level governed exclusion primitive
-- ---------------------------------------------------------------------------
-- Excludes exactly one evidence row in one of the four lifecycle-participating
-- evidence tables. Never touches the session anchor or sibling evidence.
-- Table identifier is validated against a closed hard-coded whitelist and
-- dispatched through static per-table statements; no dynamic SQL is used.

CREATE FUNCTION public.exclude_evidence_row(
  p_table_name text,
  p_evidence_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_changed_at timestamptz := now();
  v_status     text;
BEGIN
  -- Reason partition: only caller-suppliable reasons are legal here.
  -- session_propagated_exclusion is reserved for internal propagation and is
  -- rejected as caller input by falling outside this set.
  IF p_reason IS NULL
     OR p_reason NOT IN (
       'user_deletion_request',
       'consent_withdrawal',
       'administrative_invalidation'
     ) THEN
    RAISE EXCEPTION
      'exclude_evidence_row: invalid or reserved reason %; caller reasons are user_deletion_request, consent_withdrawal, administrative_invalidation',
      p_reason
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_evidence_id IS NULL THEN
    RAISE EXCEPTION 'exclude_evidence_row: p_evidence_id must not be null'
      USING ERRCODE = 'null_value_not_allowed';
  END IF;

  -- Closed whitelist + static dispatch. Each branch: lock the target row,
  -- reject a missing row, reject a non-active source, then transition exactly
  -- one row. active -> excluded only; excluded is terminal; superseded untouched.
  IF p_table_name = 'user_description_evidence' THEN
    SELECT evidence_status INTO v_status
      FROM public.user_description_evidence
      WHERE id = p_evidence_id
      FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'exclude_evidence_row: no row % in user_description_evidence', p_evidence_id
        USING ERRCODE = 'no_data_found';
    END IF;
    IF v_status <> 'active' THEN
      RAISE EXCEPTION 'exclude_evidence_row: row % in user_description_evidence is % (source must be active)', p_evidence_id, v_status
        USING ERRCODE = 'check_violation';
    END IF;
    UPDATE public.user_description_evidence
      SET evidence_status  = 'excluded',
          status_reason    = p_reason,
          status_changed_at = v_changed_at
      WHERE id = p_evidence_id;

  ELSIF p_table_name = 'image_evidence' THEN
    SELECT evidence_status INTO v_status
      FROM public.image_evidence
      WHERE id = p_evidence_id
      FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'exclude_evidence_row: no row % in image_evidence', p_evidence_id
        USING ERRCODE = 'no_data_found';
    END IF;
    IF v_status <> 'active' THEN
      RAISE EXCEPTION 'exclude_evidence_row: row % in image_evidence is % (source must be active)', p_evidence_id, v_status
        USING ERRCODE = 'check_violation';
    END IF;
    UPDATE public.image_evidence
      SET evidence_status  = 'excluded',
          status_reason    = p_reason,
          status_changed_at = v_changed_at
      WHERE id = p_evidence_id;

  ELSIF p_table_name = 'product_mention_evidence' THEN
    SELECT evidence_status INTO v_status
      FROM public.product_mention_evidence
      WHERE id = p_evidence_id
      FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'exclude_evidence_row: no row % in product_mention_evidence', p_evidence_id
        USING ERRCODE = 'no_data_found';
    END IF;
    IF v_status <> 'active' THEN
      RAISE EXCEPTION 'exclude_evidence_row: row % in product_mention_evidence is % (source must be active)', p_evidence_id, v_status
        USING ERRCODE = 'check_violation';
    END IF;
    UPDATE public.product_mention_evidence
      SET evidence_status  = 'excluded',
          status_reason    = p_reason,
          status_changed_at = v_changed_at
      WHERE id = p_evidence_id;

  ELSIF p_table_name = 'ai_analysis_evidence' THEN
    SELECT evidence_status INTO v_status
      FROM public.ai_analysis_evidence
      WHERE id = p_evidence_id
      FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'exclude_evidence_row: no row % in ai_analysis_evidence', p_evidence_id
        USING ERRCODE = 'no_data_found';
    END IF;
    IF v_status <> 'active' THEN
      RAISE EXCEPTION 'exclude_evidence_row: row % in ai_analysis_evidence is % (source must be active)', p_evidence_id, v_status
        USING ERRCODE = 'check_violation';
    END IF;
    UPDATE public.ai_analysis_evidence
      SET evidence_status  = 'excluded',
          status_reason    = p_reason,
          status_changed_at = v_changed_at
      WHERE id = p_evidence_id;

  ELSE
    RAISE EXCEPTION
      'exclude_evidence_row: table % is not a lifecycle-participating evidence table', p_table_name
      USING ERRCODE = 'check_violation';
  END IF;
END;
$$;

COMMENT ON FUNCTION public.exclude_evidence_row(text, uuid, text) IS
  'Phase 1 Slice 8 governed child-level exclusion primitive. Transitions exactly one evidence row (active -> excluded) in one of the closed-whitelist tables (user_description_evidence, image_evidence, product_mention_evidence, ai_analysis_evidence), recording status_reason and a transaction-stable status_changed_at. Caller reasons: user_deletion_request | consent_withdrawal | administrative_invalidation; session_propagated_exclusion is reserved and rejected as caller input. Source must be active; excluded is terminal; superseded is untouched. A missing row, non-active source, invalid reason, or unknown table each raises an exception and writes nothing. Uses static per-table dispatch; no dynamic SQL. Never touches the session anchor, sibling evidence, consent_snapshots, or analyses. Service-role only; dormant.';

-- ---------------------------------------------------------------------------
-- 2. Session-level governed exclusion primitive (with child propagation)
-- ---------------------------------------------------------------------------
-- Locks the scan_records row first (FOR UPDATE), rejects a non-active session,
-- propagates exclusion to active children first (reason: session_propagated_exclusion),
-- then transitions the session anchor last. All rows in one invocation share a
-- single transaction-stable timestamp. Already-excluded children are skipped
-- (WHERE evidence_status = 'active'), preserving their original metadata.

CREATE FUNCTION public.exclude_scan_record(
  p_scan_record_id uuid,
  p_reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_changed_at timestamptz := now();
  v_status     text;
BEGIN
  -- Reason partition: only caller-suppliable reasons are legal at the session level.
  -- session_propagated_exclusion is internal-only and rejected as caller input.
  IF p_reason IS NULL
     OR p_reason NOT IN (
       'user_deletion_request',
       'consent_withdrawal',
       'administrative_invalidation'
     ) THEN
    RAISE EXCEPTION
      'exclude_scan_record: invalid or reserved reason %; caller reasons are user_deletion_request, consent_withdrawal, administrative_invalidation',
      p_reason
      USING ERRCODE = 'check_violation';
  END IF;

  IF p_scan_record_id IS NULL THEN
    RAISE EXCEPTION 'exclude_scan_record: p_scan_record_id must not be null'
      USING ERRCODE = 'null_value_not_allowed';
  END IF;

  -- Acquire the exclusive session lock first, before any child validation or
  -- propagation. Concurrent invocations serialize here; the second observes the
  -- committed excluded state and is rejected below.
  SELECT status INTO v_status
    FROM public.scan_records
    WHERE id = p_scan_record_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'exclude_scan_record: no scan_records row %', p_scan_record_id
      USING ERRCODE = 'no_data_found';
  END IF;

  -- Re-invocation on a non-active session is a full rejection (writes nothing).
  IF v_status <> 'active' THEN
    RAISE EXCEPTION 'exclude_scan_record: session % is % (source must be active)', p_scan_record_id, v_status
      USING ERRCODE = 'check_violation';
  END IF;

  -- Children first. Only active children transition; already-excluded (or
  -- superseded) children are skipped by the WHERE clause with metadata intact,
  -- making re-execution within a legal exclusion convergent.
  UPDATE public.user_description_evidence
    SET evidence_status  = 'excluded',
        status_reason    = 'session_propagated_exclusion',
        status_changed_at = v_changed_at
    WHERE scan_record_id = p_scan_record_id
      AND evidence_status = 'active';

  UPDATE public.image_evidence
    SET evidence_status  = 'excluded',
        status_reason    = 'session_propagated_exclusion',
        status_changed_at = v_changed_at
    WHERE scan_record_id = p_scan_record_id
      AND evidence_status = 'active';

  UPDATE public.product_mention_evidence
    SET evidence_status  = 'excluded',
        status_reason    = 'session_propagated_exclusion',
        status_changed_at = v_changed_at
    WHERE scan_record_id = p_scan_record_id
      AND evidence_status = 'active';

  UPDATE public.ai_analysis_evidence
    SET evidence_status  = 'excluded',
        status_reason    = 'session_propagated_exclusion',
        status_changed_at = v_changed_at
    WHERE scan_record_id = p_scan_record_id
      AND evidence_status = 'active';

  -- Session anchor last. The outer eligibility gate closes only after the inner
  -- records agree, per the Slice 7 consistency model.
  UPDATE public.scan_records
    SET status           = 'excluded',
        status_reason    = p_reason,
        status_changed_at = v_changed_at
    WHERE id = p_scan_record_id;
END;
$$;

COMMENT ON FUNCTION public.exclude_scan_record(uuid, text) IS
  'Phase 1 Slice 8 governed session-level exclusion primitive. Locks the target scan_records row FOR UPDATE first. Rejects a non-active session; re-invocation writes nothing. Propagates exclusion to active children (user_description_evidence, image_evidence, product_mention_evidence, ai_analysis_evidence) with reserved reason: session_propagated_exclusion, then transitions the scan_records anchor last. All updates occur within one all-or-nothing transaction sharing a single transaction-stable status_changed_at. Caller reasons: user_deletion_request | consent_withdrawal | administrative_invalidation; session_propagated_exclusion is rejected as caller input. Already-excluded children are skipped; original metadata is preserved. Superseded is untouched. consent_snapshots and analyses are never read or written. Service-role only; dormant.';

-- ---------------------------------------------------------------------------
-- 3. Execution privilege posture (same migration unit; no transient exposure)
-- ---------------------------------------------------------------------------
-- REVOKE the implicit PUBLIC grant on function creation, explicitly revoke the
-- client-facing roles, then GRANT EXECUTE to the service-role posture only.
-- Because this runs inside the migration transaction, the functions are not
-- visible to any session until commit, by which point authority is closed.

REVOKE ALL ON FUNCTION public.exclude_evidence_row(text, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exclude_evidence_row(text, uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.exclude_evidence_row(text, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exclude_evidence_row(text, uuid, text) TO service_role;

REVOKE ALL ON FUNCTION public.exclude_scan_record(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exclude_scan_record(uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.exclude_scan_record(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exclude_scan_record(uuid, text) TO service_role;

-- ---------------------------------------------------------------------------
-- 4. Explicitly unchanged
-- ---------------------------------------------------------------------------
-- No table, column, constraint, index, FK posture, or comment on any existing
--   object is created, altered, or dropped.
-- No RLS policies are added, removed, or altered on any table.
-- No triggers, scheduled jobs, or background processes are created.
-- No rows are inserted, updated, or deleted; no transition is executed.
-- consent_snapshots and analyses are untouched.

COMMIT;
