-- Phase 1 Slice 3 — proposed DDL (review only; do not execute without approval)
-- Depends on Slice 1: public.scan_records, public.consent_snapshots
-- Depends on Slice 2 pattern: child evidence linked to scan_records (coexists; no schema conflict)
-- Object storage bucket and storage policies are a separate gated artifact; this DDL references
-- storage_object_ref only — it does not create buckets or authorize upload mechanics.

-- ---------------------------------------------------------------------------
-- image_evidence — user-origin visual capture evidence (Evidence Content Store)
-- ---------------------------------------------------------------------------

CREATE TABLE public.image_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_record_id uuid NOT NULL
    REFERENCES public.scan_records (id) ON DELETE RESTRICT,
  user_email text NOT NULL,
  storage_object_ref text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL,
  capture_source text NOT NULL DEFAULT 'web_scan',
  capture_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT image_evidence_scan_record_id_unique
    UNIQUE (scan_record_id),
  CONSTRAINT image_evidence_storage_object_ref_nonempty_check
    CHECK (char_length(btrim(storage_object_ref)) > 0),
  CONSTRAINT image_evidence_content_type_nonempty_check
    CHECK (char_length(btrim(content_type)) > 0),
  CONSTRAINT image_evidence_byte_size_positive_check
    CHECK (byte_size > 0),
  CONSTRAINT image_evidence_capture_metadata_is_object_check
    CHECK (jsonb_typeof(capture_metadata) = 'object'),
  CONSTRAINT image_evidence_evidence_status_check
    CHECK (evidence_status IN ('active', 'excluded'))
);

COMMENT ON TABLE public.image_evidence IS
  'User-origin scan image evidence. Preserves governed visual artifact reference and capture metadata at capture; not AI output, diagnosis, or recommendation.';

COMMENT ON COLUMN public.image_evidence.id IS
  'Stable Image Evidence identifier.';

COMMENT ON COLUMN public.image_evidence.scan_record_id IS
  'Parent Scan Record V2 session anchor. At most one image evidence row per scan session (Slice 3).';

COMMENT ON COLUMN public.image_evidence.user_email IS
  'User ownership reference for RLS; mirrors Slice 1 scan_records.user_email pattern until auth user id migration is separately authorized.';

COMMENT ON COLUMN public.image_evidence.storage_object_ref IS
  'Governed private object storage reference to persisted image bytes. Not a public URL; access governed by storage policies and future retrieval workflows.';

COMMENT ON COLUMN public.image_evidence.content_type IS
  'MIME type of the captured artifact at insert time (e.g. image/jpeg, image/png).';

COMMENT ON COLUMN public.image_evidence.byte_size IS
  'Artifact size in bytes at capture; must be positive when row exists.';

COMMENT ON COLUMN public.image_evidence.capture_source IS
  'Capture channel provenance (e.g. web_scan). Aligns with consent_snapshots.capture_source audit semantics; default web_scan for current scan route.';

COMMENT ON COLUMN public.image_evidence.capture_metadata IS
  'Structured capture context JSON object only. Provenance fields (device class, dimensions, upload indicators). Must not store AI observations, symptom labels, or diagnostic content.';

COMMENT ON COLUMN public.image_evidence.evidence_status IS
  'Lifecycle eligibility marker (active | excluded). excluded reserved for future deletion/tombstone slice without in-place edit of storage_object_ref.';

COMMENT ON COLUMN public.image_evidence.created_at IS
  'Evidence creation timestamp; immutable after insert.';

CREATE INDEX image_evidence_user_email_created_at_idx
  ON public.image_evidence (user_email, created_at DESC);

CREATE INDEX image_evidence_scan_record_id_idx
  ON public.image_evidence (scan_record_id);

CREATE UNIQUE INDEX image_evidence_storage_object_ref_unique_idx
  ON public.image_evidence (storage_object_ref);

-- ---------------------------------------------------------------------------
-- Row Level Security — SELECT only; no client write policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.image_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own image evidence"
  ON public.image_evidence
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No INSERT, UPDATE, or DELETE policies for client roles.
-- Service-role writes (current app pattern) bypass RLS, matching Slice 1–2 scan route behavior.
-- Consent provenance is inherited via scan_record_id -> consent_snapshots (no consent_snapshot_id FK).
-- image_processing_consent and evidence_storage_consent must be active at capture (application gate).
