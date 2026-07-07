-- Phase 2 Slice 1A — Evidence Persistence Boundary (first migration)
-- Forward migration only. No rollback section by design; every statement is
-- additive and the created objects are dormant until a future approved slice
-- consumes them.
--
-- Source artifacts:
-- - docs/PHASE_2_SLICE_1A_EVIDENCE_PERSISTENCE_BOUNDARY_PLAN.md
-- - docs/PHASE_2_SLICE_1A_TECHNICAL_DESIGN.md
-- - docs/PHASE_2_SLICE_1A_SQL_MIGRATION_DESIGN.md
--
-- Position within the migration design scope:
-- The evidence anchor (public.scan_records), the four evidence-bearing tables,
-- lifecycle participation (evidence_status / status / status_reason /
-- status_changed_at), provenance retention, and storage reference capability
-- were delivered by the Phase 1 slice migrations and are CONFIRMED here, not
-- recreated. The one boundary responsibility approved by the Slice 1A
-- Technical Design that has no physical representation yet is Boundary Rule 5:
--   "Eligibility is enforceable at the persistence boundary itself; it is
--    never delegated solely to presentation layers."
-- This migration implements exactly that minimum: governed, eligibility-
-- filtered read surfaces over the existing evidence structures.
--
-- Scope:
-- - Preflight verification that the Phase 1 evidence foundations exist.
-- - Five dormant eligibility views (anchor + four evidence categories) that
--   express the Phase 1 read eligibility contract at the persistence boundary.
-- - Explicit privilege posture on the new views only.
--
-- Non-scope (binding):
-- - No table is created, altered, renamed, or dropped.
-- - No column, constraint, index, trigger, or FK change on any existing object.
-- - No RLS policy is added, removed, or altered on any table.
-- - No data is inserted, updated, deleted, or backfilled.
-- - No application code, API, or UI change; no read path is cut over.
-- - No Knowledge Layer or Intelligence Layer structure is introduced.
-- - public.analyses is never read or written; the compatibility residual
--   bounded by the Slice 10 contract persists unchanged through this slice.
-- - consent_snapshots receives no eligibility surface: it is immutable
--   capture-time provenance, outside the lifecycle state machine.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Preflight verification — fail fast if the Phase 1 foundations are absent
-- ---------------------------------------------------------------------------
-- The migration design requires explicit verification and no hidden
-- behavioural change. This block asserts the boundary's base structures exist
-- before any view is defined, so a partially-migrated environment fails with
-- a precise message instead of a mid-migration error.

DO $$
DECLARE
  v_missing text;
BEGIN
  SELECT string_agg(t.expected, ', ')
    INTO v_missing
    FROM (VALUES
      ('public.scan_records'),
      ('public.user_description_evidence'),
      ('public.image_evidence'),
      ('public.product_mention_evidence'),
      ('public.ai_analysis_evidence')
    ) AS t(expected)
    WHERE to_regclass(t.expected) IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 1A boundary migration: required Phase 1 evidence structures missing: %. Apply Phase 1 slice migrations first.',
      v_missing;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Eligibility view — session anchor
-- ---------------------------------------------------------------------------
-- The anchor is the root governance context (Slice 1A Boundary Rule 2). An
-- eligible session is one whose lifecycle state is 'active'; excluded sessions
-- are ineligible for presentation as normal active results (Phase 1 Slice 10
-- read eligibility contract).
--
-- security_invoker = true: the view evaluates the RLS policies of the querying
-- role, not the view owner. Client roles therefore see only their own rows
-- (the Phase 1 SELECT policies apply unchanged); the service role retains its
-- existing full-read posture. The boundary adds eligibility on top of, and
-- never in place of, ownership enforcement.
--
-- Transition metadata (status_reason, status_changed_at) is intentionally not
-- exposed: it is always null on 'active' rows and belongs to governance
-- surfaces, not to normal active reads.

CREATE VIEW public.eligible_scan_records
  WITH (security_invoker = true)
AS
  SELECT
    sr.id,
    sr.user_email,
    sr.captured_at,
    sr.created_at,
    sr.updated_at
  FROM public.scan_records sr
  WHERE sr.status = 'active';

COMMENT ON VIEW public.eligible_scan_records IS
  'Phase 2 Slice 1A evidence persistence boundary read surface. Sessions eligible under the Phase 1 read eligibility contract (status = active). Excluded sessions are never presented here. security_invoker: underlying scan_records RLS applies to the querying role. Dormant: no application read path consumes this view until a future approved slice performs the cut-over. Not a replacement for the analyses compatibility surface, which remains governed by the Slice 10 residual contract.';

-- ---------------------------------------------------------------------------
-- 3. Eligibility views — subordinate evidence categories
-- ---------------------------------------------------------------------------
-- Child evidence inherits its governance context from the anchor (Slice 1A
-- Boundary Rule 2). A child row is therefore eligible only when BOTH hold:
--   - the child row itself is 'active'  (child-level exclusion, Slice 8), and
--   - its parent session anchor is 'active' (session-level exclusion).
-- The join makes anchor inheritance structural rather than a caller
-- convention: no consumer of these views can accidentally read subordinate
-- evidence of an excluded session.
--
-- 'superseded' rows are not eligible as normal active evidence and are
-- filtered by the evidence_status predicate; their governed presentation is a
-- future supersession workflow concern, not a boundary read concern.

CREATE VIEW public.eligible_user_description_evidence
  WITH (security_invoker = true)
AS
  SELECT
    ude.id,
    ude.scan_record_id,
    ude.user_email,
    ude.original_text,
    ude.capture_source,
    ude.created_at
  FROM public.user_description_evidence ude
  JOIN public.scan_records sr
    ON sr.id = ude.scan_record_id
  WHERE ude.evidence_status = 'active'
    AND sr.status = 'active';

COMMENT ON VIEW public.eligible_user_description_evidence IS
  'Phase 2 Slice 1A boundary read surface for user description evidence. Row eligible only when the evidence row is active AND its parent scan_records anchor is active (anchor governance inheritance, Slice 1A Boundary Rule 2). security_invoker: base-table RLS applies to the querying role. Dormant until a future approved slice consumes it.';

CREATE VIEW public.eligible_image_evidence
  WITH (security_invoker = true)
AS
  SELECT
    ie.id,
    ie.scan_record_id,
    ie.user_email,
    ie.storage_object_ref,
    ie.content_type,
    ie.byte_size,
    ie.capture_source,
    ie.capture_metadata,
    ie.created_at
  FROM public.image_evidence ie
  JOIN public.scan_records sr
    ON sr.id = ie.scan_record_id
  WHERE ie.evidence_status = 'active'
    AND sr.status = 'active';

COMMENT ON VIEW public.eligible_image_evidence IS
  'Phase 2 Slice 1A boundary read surface for image evidence. Row eligible only when the evidence row is active AND its parent scan_records anchor is active. Exposes the storage reference (storage_object_ref) without owning the binary: binary retention remains governed by the Phase 1 storage retention boundary, and eligibility filtering here never implies binary deletion. security_invoker: base-table RLS applies to the querying role. Dormant until a future approved slice consumes it.';

CREATE VIEW public.eligible_product_mention_evidence
  WITH (security_invoker = true)
AS
  SELECT
    pme.id,
    pme.scan_record_id,
    pme.user_email,
    pme.raw_mention_text,
    pme.source_type,
    pme.created_at
  FROM public.product_mention_evidence pme
  JOIN public.scan_records sr
    ON sr.id = pme.scan_record_id
  WHERE pme.evidence_status = 'active'
    AND sr.status = 'active';

COMMENT ON VIEW public.eligible_product_mention_evidence IS
  'Phase 2 Slice 1A boundary read surface for product mention evidence. Row eligible only when the evidence row is active AND its parent scan_records anchor is active. Verbatim mention evidence only — not catalog resolution, Product Intelligence, or Knowledge Layer output. security_invoker: base-table RLS applies to the querying role. Dormant until a future approved slice consumes it.';

CREATE VIEW public.eligible_ai_analysis_evidence
  WITH (security_invoker = true)
AS
  SELECT
    aae.id,
    aae.scan_record_id,
    aae.user_email,
    aae.normalized_result,
    aae.model_provider,
    aae.model_name,
    aae.response_schema_version,
    aae.provenance_metadata,
    aae.created_at
  FROM public.ai_analysis_evidence aae
  JOIN public.scan_records sr
    ON sr.id = aae.scan_record_id
  WHERE aae.evidence_status = 'active'
    AND sr.status = 'active';

COMMENT ON VIEW public.eligible_ai_analysis_evidence IS
  'Phase 2 Slice 1A boundary read surface for AI analysis evidence. Row eligible only when the evidence row is active AND its parent scan_records anchor is active. Exposes provenance (model_provider, model_name, response_schema_version, provenance_metadata) with the payload, per the Slice 1A rule that AI output is evidence only with retained provenance. Not diagnosis, not Knowledge Layer, not Intelligence Layer. security_invoker: base-table RLS applies to the querying role. Dormant until a future approved slice consumes it.';

-- ---------------------------------------------------------------------------
-- 4. Privilege posture — new views only, closed within this migration unit
-- ---------------------------------------------------------------------------
-- Mirrors the Slice 8 pattern: revoke the broad default, then grant the
-- narrow posture, all inside the migration transaction so the views are never
-- visible under a wider grant than intended.
--
-- authenticated: SELECT only. security_invoker means base-table RLS still
--   limits rows to the requesting user's own records.
-- service_role: SELECT, matching the current server-side read pattern.
-- anon / PUBLIC: no access; anonymous roles have no legitimate evidence reads.

REVOKE ALL ON public.eligible_scan_records               FROM PUBLIC;
REVOKE ALL ON public.eligible_scan_records               FROM anon;
REVOKE ALL ON public.eligible_user_description_evidence  FROM PUBLIC;
REVOKE ALL ON public.eligible_user_description_evidence  FROM anon;
REVOKE ALL ON public.eligible_image_evidence             FROM PUBLIC;
REVOKE ALL ON public.eligible_image_evidence             FROM anon;
REVOKE ALL ON public.eligible_product_mention_evidence   FROM PUBLIC;
REVOKE ALL ON public.eligible_product_mention_evidence   FROM anon;
REVOKE ALL ON public.eligible_ai_analysis_evidence       FROM PUBLIC;
REVOKE ALL ON public.eligible_ai_analysis_evidence       FROM anon;

GRANT SELECT ON public.eligible_scan_records               TO authenticated, service_role;
GRANT SELECT ON public.eligible_user_description_evidence  TO authenticated, service_role;
GRANT SELECT ON public.eligible_image_evidence             TO authenticated, service_role;
GRANT SELECT ON public.eligible_product_mention_evidence   TO authenticated, service_role;
GRANT SELECT ON public.eligible_ai_analysis_evidence       TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 5. Explicitly unchanged
-- ---------------------------------------------------------------------------
-- No table, column, constraint, index, trigger, FK, or sequence is created,
--   altered, or dropped.
-- No RLS policy is added, removed, or altered; the Phase 1 SELECT-only client
--   posture on all evidence tables stands unchanged.
-- No rows are inserted, updated, or deleted; no lifecycle transition executes;
--   all existing rows remain in their current state.
-- public.analyses is untouched: the compatibility read model continues to
--   serve dashboard and history exactly as before this migration.
-- public.consent_snapshots is untouched and receives no eligibility surface.
-- The Slice 8 exclusion primitives remain dormant; nothing here invokes them.
-- No application code references any object created here; every view ships
--   dormant and unconsumed until a future slice is approved to cut over.

COMMIT;
