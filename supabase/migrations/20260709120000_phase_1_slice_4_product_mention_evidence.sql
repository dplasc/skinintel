-- Phase 1 Slice 4 — Product Mention Evidence (Evidence Content Store)
-- Depends on Slice 1: public.scan_records, public.consent_snapshots
-- Depends on Slice 2–3 pattern: child evidence linked to scan_records (coexists; no schema conflict)
-- Additive only: does not modify scan_records, consent_snapshots, analyses, or prior slice tables.
-- Consent provenance inherited via scan_record_id -> consent_snapshots (evidence_storage_consent gate at application layer).

-- ---------------------------------------------------------------------------
-- product_mention_evidence — user-origin product/ingredient mention text (Evidence Content Store)
-- ---------------------------------------------------------------------------

CREATE TABLE public.product_mention_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_record_id uuid NOT NULL
    REFERENCES public.scan_records (id) ON DELETE RESTRICT,
  user_email text NOT NULL,
  raw_mention_text text NOT NULL,
  source_type text NOT NULL DEFAULT 'scan_capture_mention_field',
  evidence_status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_mention_evidence_raw_mention_text_nonempty_check
    CHECK (char_length(btrim(raw_mention_text)) > 0),
  CONSTRAINT product_mention_evidence_source_type_nonempty_check
    CHECK (char_length(btrim(source_type)) > 0),
  CONSTRAINT product_mention_evidence_evidence_status_check
    CHECK (evidence_status IN ('active', 'excluded'))
);

COMMENT ON TABLE public.product_mention_evidence IS
  'User-origin product/ingredient mention evidence. Preserves verbatim user-stated mention text at capture; not Product Intelligence, Ingredient Intelligence, catalog resolution, AI output, or client scoring data.';

COMMENT ON COLUMN public.product_mention_evidence.id IS
  'Stable Product Mention Evidence identifier.';

COMMENT ON COLUMN public.product_mention_evidence.scan_record_id IS
  'Parent Scan Record V2 session anchor. Multiple mention evidence rows may attach to the same scan session in future governed capture paths.';

COMMENT ON COLUMN public.product_mention_evidence.user_email IS
  'User ownership reference for RLS; mirrors Slice 1 scan_records.user_email pattern until auth user id migration is separately authorized.';

COMMENT ON COLUMN public.product_mention_evidence.raw_mention_text IS
  'Verbatim user-submitted ingredients/product mention text from capture input. Non-empty after trim; application must not insert when mention absent. Not entity-resolved, not catalog-normalized.';

COMMENT ON COLUMN public.product_mention_evidence.source_type IS
  'Provenance indicator for mention origin (e.g. scan_capture_mention_field). Distinguishes user-direct capture input from future governed structuring paths.';

COMMENT ON COLUMN public.product_mention_evidence.evidence_status IS
  'Lifecycle eligibility marker (active | excluded). excluded reserved for future deletion/tombstone slice without in-place edit of raw_mention_text.';

COMMENT ON COLUMN public.product_mention_evidence.created_at IS
  'Evidence creation timestamp; immutable after insert.';

CREATE INDEX product_mention_evidence_user_email_created_at_idx
  ON public.product_mention_evidence (user_email, created_at DESC);

CREATE INDEX product_mention_evidence_scan_record_id_idx
  ON public.product_mention_evidence (scan_record_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — SELECT only; no client write policies
-- ---------------------------------------------------------------------------

ALTER TABLE public.product_mention_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own product mention evidence"
  ON public.product_mention_evidence
  FOR SELECT
  TO public
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No INSERT, UPDATE, or DELETE policies for client roles.
-- Service-role writes (current app pattern) bypass RLS, matching Slice 1–3 scan route behavior.
-- evidence_storage_consent must be active at capture when mention text is present (application gate).
