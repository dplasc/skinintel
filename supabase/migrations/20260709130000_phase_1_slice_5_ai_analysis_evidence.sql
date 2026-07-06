-- Phase 1 Slice 5 — AI Analysis Evidence (Evidence Content Store)
-- Depends on Slice 1: public.scan_records, public.consent_snapshots
-- Depends on Slices 2–4 pattern: child evidence linked to scan_records (coexists; no schema conflict)
-- Additive only: does not modify scan_records, consent_snapshots, analyses, or prior slice tables.
-- Consent provenance inherited via scan_record_id -> consent_snapshots (reasoning_consent and evidence_storage_consent gates at application layer).

-- ---------------------------------------------------------------------------
-- ai_analysis_evidence — application-accepted AI analysis output (Evidence Content Store)
-- ---------------------------------------------------------------------------

CREATE TABLE public.ai_analysis_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_record_id uuid NOT NULL
    REFERENCES public.scan_records (id) ON DELETE CASCADE,
  user_email text NOT NULL,
  normalized_result jsonb NOT NULL,
  model_provider text NOT NULL,
  model_name text NOT NULL,
  response_schema_version text NOT NULL,
  evidence_status text NOT NULL DEFAULT 'active',
  supersedes_evidence_id uuid NULL
    REFERENCES public.ai_analysis_evidence (id),
  provenance_metadata jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_analysis_evidence_model_provider_nonempty_check
    CHECK (char_length(btrim(model_provider)) > 0),
  CONSTRAINT ai_analysis_evidence_model_name_nonempty_check
    CHECK (char_length(btrim(model_name)) > 0),
  CONSTRAINT ai_analysis_evidence_response_schema_version_nonempty_check
    CHECK (char_length(btrim(response_schema_version)) > 0),
  CONSTRAINT ai_analysis_evidence_evidence_status_check
    CHECK (evidence_status IN ('active', 'excluded', 'superseded'))
);

COMMENT ON TABLE public.ai_analysis_evidence IS
  'Application-accepted AI analysis output linked to Scan Record V2. Stores normalized inference result after response validation and normalization — not raw provider response. Not diagnosis, not Knowledge Layer, not Intelligence Layer. public.analyses remains the compatibility read model; this migration does not cut over dashboard, history, or API read paths.';

COMMENT ON COLUMN public.ai_analysis_evidence.id IS
  'Stable AI Analysis Evidence identifier.';

COMMENT ON COLUMN public.ai_analysis_evidence.scan_record_id IS
  'Parent Scan Record V2 session anchor. Multiple AI analysis evidence rows may attach to the same scan session when future governed supersession paths are authorized.';

COMMENT ON COLUMN public.ai_analysis_evidence.user_email IS
  'User ownership reference for RLS; mirrors Slice 1–4 scan_records.user_email pattern until auth user id migration is separately authorized.';

COMMENT ON COLUMN public.ai_analysis_evidence.normalized_result IS
  'Application-accepted normalized analysis payload after OpenAI response validation and normalization (intro, assessment, top5, next_steps, confidence, medical_disclaimer). Not raw provider text, not invalid or partial response. Same governed output written to analyses compatibility row at capture.';

COMMENT ON COLUMN public.ai_analysis_evidence.model_provider IS
  'Inference provider identifier at safe, non-secret level (e.g. openai). Not prompt archival.';

COMMENT ON COLUMN public.ai_analysis_evidence.model_name IS
  'Model identifier used for inference (e.g. gpt-4o-mini). Not canonical truth or diagnosis label.';

COMMENT ON COLUMN public.ai_analysis_evidence.response_schema_version IS
  'Version marker for accepted output schema shape; supports audit and future supersession without storing full prompt text.';

COMMENT ON COLUMN public.ai_analysis_evidence.evidence_status IS
  'Lifecycle eligibility marker (active | excluded | superseded). superseded reserved for future governed supersession workflow without in-place edit of normalized_result.';

COMMENT ON COLUMN public.ai_analysis_evidence.supersedes_evidence_id IS
  'Optional future hook referencing a prior AI Analysis Evidence row this record supersedes. Not populated or enforced in Slice 5 application path.';

COMMENT ON COLUMN public.ai_analysis_evidence.provenance_metadata IS
  'Optional safe inference audit metadata (e.g. completion id, token usage summary). Must not store full prompt text, raw provider payload, or image bytes. Not Knowledge Layer or Intelligence Layer enrichment.';

COMMENT ON COLUMN public.ai_analysis_evidence.created_at IS
  'Evidence creation timestamp; immutable after insert; aligned with inference acceptance time.';

CREATE INDEX ai_analysis_evidence_scan_record_id_idx
  ON public.ai_analysis_evidence (scan_record_id);

CREATE INDEX ai_analysis_evidence_user_email_created_at_idx
  ON public.ai_analysis_evidence (user_email, created_at DESC);

CREATE INDEX ai_analysis_evidence_evidence_status_idx
  ON public.ai_analysis_evidence (evidence_status);

-- ---------------------------------------------------------------------------
-- Row Level Security — SELECT only; no client write policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.ai_analysis_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own ai analysis evidence"
  ON public.ai_analysis_evidence
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No INSERT, UPDATE, or DELETE policies for client roles.
-- Service-role writes (current app pattern) bypass RLS, matching Slice 1–4 scan route behavior.
-- reasoning_consent and evidence_storage_consent must be active at capture (application gate).
