-- Phase 1 Slice 1 — Evidence foundation migration
-- Creates Scan Record V2, Consent Snapshot, and analyses compatibility linkage.
-- Reviewed as docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md.
-- Do not apply manually without approval.

-- ---------------------------------------------------------------------------
-- 1. scan_records — Evidence Layer session anchor
-- ---------------------------------------------------------------------------

CREATE TABLE public.scan_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NULL,
  CONSTRAINT scan_records_status_check
    CHECK (status IN ('active', 'excluded'))
);

COMMENT ON TABLE public.scan_records IS
  'Evidence Layer session anchor (Scan Record V2). Authoritative governed capture session; does not store AI output.';

COMMENT ON COLUMN public.scan_records.id IS
  'Stable session identifier distinct from analyses.id.';

COMMENT ON COLUMN public.scan_records.user_email IS
  'User ownership reference; aligns with current analyses access pattern.';

COMMENT ON COLUMN public.scan_records.captured_at IS
  'Evidence event capture timestamp; immutable after creation.';

COMMENT ON COLUMN public.scan_records.status IS
  'Session eligibility marker (active | excluded); excluded reserved for future deletion/governance slice.';

COMMENT ON COLUMN public.scan_records.updated_at IS
  'Optional; governance state changes only — not capture time overwrite.';

CREATE INDEX scan_records_user_email_captured_at_idx
  ON public.scan_records (user_email, captured_at DESC);

-- ---------------------------------------------------------------------------
-- 2. consent_snapshots — immutable capture-time consent record
-- ---------------------------------------------------------------------------

CREATE TABLE public.consent_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_record_id uuid NOT NULL
    REFERENCES public.scan_records (id) ON DELETE CASCADE,
  user_email text NOT NULL,
  consent_scopes jsonb NOT NULL,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  capture_source text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT consent_snapshots_consent_scopes_is_array_check
    CHECK (jsonb_typeof(consent_scopes) = 'array'),
  CONSTRAINT consent_snapshots_scan_record_id_unique
    UNIQUE (scan_record_id)
);

COMMENT ON TABLE public.consent_snapshots IS
  'Immutable capture-time consent record (Consent Snapshot). One snapshot per scan session at capture time.';

COMMENT ON COLUMN public.consent_snapshots.scan_record_id IS
  'Parent Scan Record V2 session; one consent snapshot per session (Slice 1).';

COMMENT ON COLUMN public.consent_snapshots.consent_scopes IS
  'JSON array of active consent scope identifiers at capture (e.g. cosmetic_analysis_acknowledgement, reasoning_consent).';

COMMENT ON COLUMN public.consent_snapshots.snapshot_at IS
  'Immutable consent snapshot timestamp; not retroactively updated on withdrawal.';

COMMENT ON COLUMN public.consent_snapshots.capture_source IS
  'Optional audit context (e.g. web_scan, api_v1).';

-- ---------------------------------------------------------------------------
-- 3. analyses compatibility linkage (nullable; no backfill)
-- ---------------------------------------------------------------------------

ALTER TABLE public.analyses
  ADD COLUMN scan_record_id uuid NULL
    REFERENCES public.scan_records (id) ON DELETE SET NULL;

COMMENT ON COLUMN public.analyses.scan_record_id IS
  'Compatibility linkage only — references governed scan_records for new captures. Legacy rows remain null. analyses is read model, not Evidence Layer source of truth.';

CREATE INDEX analyses_scan_record_id_idx
  ON public.analyses (scan_record_id);

-- ---------------------------------------------------------------------------
-- 4. Row Level Security — SELECT only; no client write policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.scan_records ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.consent_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scan records"
  ON public.scan_records
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

CREATE POLICY "Users can read own consent snapshots"
  ON public.consent_snapshots
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No INSERT, UPDATE, or DELETE policies for client roles.
-- Service-role writes (current app pattern) bypass RLS, matching analyses behavior.
-- Existing analyses rows are unchanged; scan_record_id is null for all current rows.
