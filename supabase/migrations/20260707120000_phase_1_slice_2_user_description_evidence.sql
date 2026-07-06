-- Phase 1 Slice 2 — proposed DDL (review only; do not execute without approval)
-- Depends on Slice 1: public.scan_records, public.consent_snapshots

-- ---------------------------------------------------------------------------
-- user_description_evidence — user-origin description text (Evidence Content Store)
-- ---------------------------------------------------------------------------

CREATE TABLE public.user_description_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_record_id uuid NOT NULL
    REFERENCES public.scan_records (id) ON DELETE RESTRICT,
  user_email text NOT NULL,
  original_text text NOT NULL,
  capture_source text NOT NULL DEFAULT 'web_scan',
  evidence_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT user_description_evidence_scan_record_id_unique
    UNIQUE (scan_record_id),
  CONSTRAINT user_description_evidence_original_text_nonempty_check
    CHECK (char_length(btrim(original_text)) > 0),
  CONSTRAINT user_description_evidence_evidence_status_check
    CHECK (evidence_status IN ('active', 'excluded'))
);

COMMENT ON TABLE public.user_description_evidence IS
  'User-origin scan description evidence. Preserves original user text at capture; not AI summary, diagnosis, or recommendation.';

COMMENT ON COLUMN public.user_description_evidence.scan_record_id IS
  'Parent Scan Record V2 session anchor. At most one description evidence row per scan session (Slice 2).';

COMMENT ON COLUMN public.user_description_evidence.user_email IS
  'User ownership reference for RLS; mirrors Slice 1 scan_records.user_email pattern until auth user id migration is separately authorized.';

COMMENT ON COLUMN public.user_description_evidence.original_text IS
  'Verbatim user-submitted description at capture. Non-empty after trim; application must not insert when description absent.';

COMMENT ON COLUMN public.user_description_evidence.capture_source IS
  'Capture channel provenance (e.g. web_scan). Aligns with consent_snapshots.capture_source audit semantics; default web_scan for current scan route.';

COMMENT ON COLUMN public.user_description_evidence.evidence_status IS
  'Lifecycle eligibility marker (active | excluded). excluded reserved for future deletion/tombstone slice without in-place edit of original_text.';

COMMENT ON COLUMN public.user_description_evidence.created_at IS
  'Evidence creation timestamp; immutable after insert.';

CREATE INDEX user_description_evidence_user_email_created_at_idx
  ON public.user_description_evidence (user_email, created_at DESC);

CREATE INDEX user_description_evidence_scan_record_id_idx
  ON public.user_description_evidence (scan_record_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — SELECT only; no client write policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.user_description_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own user description evidence"
  ON public.user_description_evidence
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No INSERT, UPDATE, or DELETE policies for client roles.
-- Service-role writes (current app pattern) bypass RLS, matching Slice 1 scan route behavior.
-- Consent provenance is inherited via scan_record_id -> consent_snapshots (no consent_snapshot_id FK).
