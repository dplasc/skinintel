# Phase 1 Slice 3 — Image Evidence SQL Draft V1

## Purpose

This document contains **proposed SQL for review** before any Supabase execution.

It translates the accepted Slice 3 plan (**docs/PHASE_1_SLICE_3_PLAN_V1.md**), technical design (**docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md**), and verified Slice 1–2 schema (**docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md**) into concrete DDL for Phase 1 Slice 3: `image_evidence` linked to `scan_records`.

This is a **review artifact only**. It does not execute SQL, apply migrations, modify Supabase, provision object storage, or authorize application changes.

| Attribute | Value |
|-----------|-------|
| **Document status** | Draft only |
| **Execution approval** | Not approved for execution |
| **Run instruction** | **Do not run this SQL yet** |
| **Supabase authorization** | **No Supabase changes authorized by this document** |
| **Storage authorization** | **No bucket creation or storage policy changes authorized by this document** |

---

## Conceptual Table Purpose

**`public.image_evidence`** is the Evidence Content Store for user-origin visual capture artifacts linked to Scan Record V2.

| Responsibility | Definition |
|----------------|------------|
| **Primary purpose** | Persist governed reference to the user-uploaded scan image and capture metadata as authoritative personal visual evidence. |
| **Store group** | Evidence Content Stores per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**. |
| **Session linkage** | Each row attaches to exactly one `scan_records` session anchor for the capture event. |
| **Binary posture** | Image bytes reside in private object storage; the relational row holds a stable `storage_object_ref`, not inline bytes or public URLs. |
| **Boundary** | Records *what the user captured* — not AI observations, symptom labels, diagnostic content, or Intelligence Layer output. |
| **Slice 3 read posture** | Write-only foundation for the Personal Evidence Base; current application read paths continue on `analyses` only. |

---

## Conceptual Columns

| Column | Type (proposed) | Nullability | Purpose |
|--------|-----------------|-------------|---------|
| **`id`** | `uuid` | NOT NULL | Primary key; stable Image Evidence identifier. |
| **`scan_record_id`** | `uuid` | NOT NULL | Foreign key to parent Scan Record V2 session anchor. |
| **`user_email`** | `text` | NOT NULL | Ownership field for RLS and audit; mirrors Slice 1–2 transitional pattern until canonical auth user id migration is separately authorized. |
| **`storage_object_ref`** | `text` | NOT NULL | Governed private object storage reference (bucket-relative path or stable object key)—not a public URL, signed URL, or CDN endpoint. |
| **`content_type`** | `text` | NOT NULL | MIME type at capture (e.g., `image/jpeg`) for provenance and retrieval validation. |
| **`byte_size`** | `bigint` | NOT NULL | Artifact size in bytes at capture for audit, quota awareness, and integrity checks. |
| **`capture_source`** | `text` | NOT NULL | Capture channel provenance (e.g., `web_scan`); aligns with `consent_snapshots.capture_source` audit semantics. |
| **`capture_metadata`** | `jsonb` | NOT NULL | Structured capture context only—device class, client-reported dimensions, upload completeness indicators, and other non-inference provenance fields. Must not contain AI observations, symptom labels, or diagnostic content. |
| **`evidence_status`** | `text` | NOT NULL | Lifecycle eligibility marker (`active` \| `excluded`); supports future deletion/tombstone semantics without in-place edit of artifact reference. |
| **`created_at`** | `timestamptz` | NOT NULL | Evidence creation timestamp; capture-time semantics; immutable after insert. |

**Deferred columns (not in Slice 3 DDL):** `consent_snapshot_id` (consent inherited via session chain), Body Area Evidence Link association, Correction Event references, Evidence Confidence Posture attachment.

---

## SQL Draft

```sql
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
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Write order (application layer)** | `scan_records` → `consent_snapshots` → optional `user_description_evidence` → `image_evidence` → AI → `analyses` | Physical ordering follows verified Slice 1–2 implementation and **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**. Image Evidence follows session and consent foundation; precedes AI analysis under evidence-first ordering. |
| **Ownership column** | `user_email text NOT NULL` | Mirrors Slice 1 `scan_records.user_email` and Slice 2 child evidence pattern for RLS consistency until canonical auth user id migration is separately authorized. |
| **Consent relationship** | **Inherited** via `scan_record_id` → `consent_snapshots` | `consent_snapshots` has `UNIQUE (scan_record_id)`. Direct `consent_snapshot_id` FK would duplicate session linkage. Audit proves `image_processing_consent` and `evidence_storage_consent` via join: `image_evidence` → `scan_records` → `consent_snapshots.consent_scopes`. |
| **No `consent_snapshot_id` column** | Deferred | Single session consent anchor is 1:1 with `scan_record_id`; inherited relationship is sufficient for Slice 3 audit. |
| **Cardinality** | `UNIQUE (scan_record_id)` | One image upload per capture session in Phase 1 scan flow; append-oriented new captures create new rows on new sessions. |
| **`storage_object_ref`** | `text NOT NULL` + global unique index | Stable governed pointer to private storage object; uniqueness prevents duplicate evidence rows referencing the same artifact. |
| **`capture_metadata`** | `jsonb NOT NULL DEFAULT '{}'` with object-type check | Flexible provenance envelope without schema migration for new non-inference capture fields; explicitly rejects array/scalar top-level JSON. |
| **`capture_source` default `web_scan`** | Required column with default | Records capture channel for provenance audit, consistent with Slice 2 and `consent_snapshots.capture_source` semantics. |
| **`evidence_status` default `active`** | Lifecycle placeholder | Supports future deletion/tombstone semantics (`excluded`) without UPDATE of `storage_object_ref`; aligns with Slice 2 and `scan_records.status` pattern. |
| **ON DELETE RESTRICT from `scan_records`** | Restrict | Deletion behavior remains governed. Physical deletion of Scan Record V2 must be an explicit future workflow decision rather than automatic cascade. Preserves flexibility for future retention and tombstone strategies per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**. |
| **No client write RLS policies** | Service-role only | Matches Slice 1–2 posture: scan route writes via service-role; users SELECT own rows only. |
| **No inline binary column** | Storage externalized | Relational row holds reference and metadata only; bytes in governed private object storage per technical design. |
| **No `analyses` extension** | Deferred / prohibited | Canonical image reference must not be added to compatibility read model (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**). |

---

## Primary Key

| Element | Definition |
|---------|------------|
| **Column** | `id` |
| **Type** | `uuid` |
| **Generation** | `DEFAULT gen_random_uuid()` |
| **Constraint name** | Implicit `image_evidence_pkey` |

Stable surrogate key for Image Evidence records; distinct from `scan_record_id` and from `analyses.id`.

---

## Foreign Key to `scan_records`

| Element | Definition |
|---------|------------|
| **Column** | `scan_record_id` |
| **References** | `public.scan_records (id)` |
| **On delete** | `RESTRICT` |
| **Cardinality enforcement** | `UNIQUE (scan_record_id)` — at most one Image Evidence row per Scan Record V2 session |
| **Semantics** | Evidence belongs to exactly one governed capture session; session anchor must exist before insert |

---

## Constraints

| Constraint | Definition | Semantics |
|------------|------------|-----------|
| **`image_evidence_scan_record_id_unique`** | `UNIQUE (scan_record_id)` | At most one Image Evidence row per Scan Record V2 session. |
| **`image_evidence_storage_object_ref_nonempty_check`** | `CHECK (char_length(btrim(storage_object_ref)) > 0)` | Governed storage reference must be present and non-whitespace when row exists. |
| **`image_evidence_content_type_nonempty_check`** | `CHECK (char_length(btrim(content_type)) > 0)` | MIME type required for provenance and retrieval validation. |
| **`image_evidence_byte_size_positive_check`** | `CHECK (byte_size > 0)` | Artifact size must be positive; zero-byte or negative values rejected at database layer. |
| **`image_evidence_capture_metadata_is_object_check`** | `CHECK (jsonb_typeof(capture_metadata) = 'object')` | Capture metadata is a JSON object envelope; arrays and scalars rejected. Application must not store AI inference payloads in this column. |
| **`image_evidence_evidence_status_check`** | `CHECK (evidence_status IN ('active', 'excluded'))` | **`active`:** governed evidence eligible for downstream use. **`excluded`:** tombstone/deletion slice placeholder — row may remain for audit but artifact must not drive personalization; no in-place edit of `storage_object_ref` in Slice 3. |
| **`scan_record_id` FK** | `REFERENCES public.scan_records (id) ON DELETE RESTRICT` | Parent session deletion blocked while Image Evidence rows exist; governed deletion workflow deferred. |
| **`storage_object_ref` unique index** | `UNIQUE INDEX image_evidence_storage_object_ref_unique_idx ON (storage_object_ref)` | One evidence row per stored artifact; prevents duplicate relational claims on the same object. |

---

## Indexes

| Index | Columns | Purpose |
|-------|---------|---------|
| **`image_evidence_pkey`** | `(id)` | Primary key lookup. |
| **`image_evidence_scan_record_id_unique`** | `(scan_record_id)` | Enforces 1:1 session cardinality; supports join from session to image evidence. |
| **`image_evidence_user_email_created_at_idx`** | `(user_email, created_at DESC)` | User-scoped temporal queries; consistent with Slice 1–2 ownership index pattern. |
| **`image_evidence_scan_record_id_idx`** | `(scan_record_id)` | Non-unique lookup support for verification joins (redundant with unique constraint but explicit for audit queries). |
| **`image_evidence_storage_object_ref_unique_idx`** | `(storage_object_ref)` | Artifact reference uniqueness and integrity verification. |

---

## RLS Intent

| Setting | Posture |
|---------|---------|
| **RLS enabled** | `ALTER TABLE public.image_evidence ENABLE ROW LEVEL SECURITY` |
| **Ownership model** | Row visibility scoped by `user_email` matching authenticated JWT email (transitional pattern). |
| **Write model** | Service-role scan route only; RLS bypass for inserts consistent with Slice 1–2. |
| **Cross-user isolation** | No authenticated user may read another user's Image Evidence rows. |
| **Storage coupling** | RLS governs relational row access only; object storage access policies are defined in the separate storage posture artifact. Relational SELECT does not imply unauthenticated object retrieval. |

---

## SELECT Policy Intent

| Attribute | Value |
|-----------|-------|
| **Policy name** | `"Users can read own image evidence"` |
| **Command** | `FOR SELECT` |
| **Role** | `TO public` (authenticated and anon roles subject to JWT predicate) |
| **Predicate** | `lower(user_email) = lower(auth.jwt() ->> 'email')` |
| **INSERT policy** | None — service-role scan route only |
| **UPDATE policy** | None — append-oriented; no client mutation in Slice 3 |
| **DELETE policy** | None — deletion workflow deferred to future slice |

Consistent with Slice 1–2: authenticated users read own evidence; all writes bypass RLS via service-role client on the scan route.

---

## Verification Queries

Read-only queries for post-migration verification (do not run until after approved execution):

```sql
-- 1. Table exists
SELECT to_regclass('public.image_evidence') AS table_name;

-- 2. RLS enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'image_evidence'
  AND relnamespace = 'public'::regnamespace;

-- 3. SELECT policy exists
SELECT polname, polcmd
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'image_evidence'
  AND c.relnamespace = 'public'::regnamespace;

-- 4. Columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'image_evidence'
ORDER BY ordinal_position;

-- 5. Constraints exist
SELECT conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.image_evidence'::regclass
ORDER BY conname;

-- 6. Indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'image_evidence'
ORDER BY indexname;

-- 7. Row count check (expect 0 immediately after migration)
SELECT count(*) AS row_count
FROM public.image_evidence;

-- 8. Join proves dual image and storage consent scope linkage (run after dual-write produces rows)
-- Verifies inherited consent: evidence -> scan_records -> consent_snapshots
SELECT
  ie.id AS evidence_id,
  ie.scan_record_id,
  ie.storage_object_ref,
  ie.content_type,
  ie.byte_size,
  cs.id AS consent_snapshot_id,
  cs.consent_scopes,
  cs.consent_scopes @> '["image_processing_consent"]'::jsonb AS image_processing_consent_active,
  cs.consent_scopes @> '["evidence_storage_consent"]'::jsonb AS evidence_storage_consent_active
FROM public.image_evidence ie
JOIN public.scan_records sr ON sr.id = ie.scan_record_id
JOIN public.consent_snapshots cs ON cs.scan_record_id = sr.id
LIMIT 10;

-- 9. Coexistence with User Description Evidence on same session (when both present)
SELECT
  sr.id AS scan_record_id,
  ie.id AS image_evidence_id,
  ude.id AS user_description_evidence_id
FROM public.scan_records sr
LEFT JOIN public.image_evidence ie ON ie.scan_record_id = sr.id
LEFT JOIN public.user_description_evidence ude ON ude.scan_record_id = sr.id
WHERE ie.id IS NOT NULL OR ude.id IS NOT NULL
LIMIT 10;

-- 10. Storage reference uniqueness (expect no duplicates)
SELECT storage_object_ref, count(*) AS ref_count
FROM public.image_evidence
GROUP BY storage_object_ref
HAVING count(*) > 1;
```

---

## Rollback Intent

Rollback removes Slice 3 relational artifacts only. It does **not** delete object storage buckets, storage policies, or orphaned binary objects. Orphan storage cleanup is a separate operational decision documented in the migration plan.

```sql
-- Phase 1 Slice 3 — proposed rollback (review only; do not execute without approval)
-- Does not modify scan_records, consent_snapshots, user_description_evidence, or analyses.
-- Does not remove object storage buckets or delete stored image bytes.

DROP POLICY IF EXISTS "Users can read own image evidence"
  ON public.image_evidence;

DROP TABLE IF EXISTS public.image_evidence;

-- scan_records, consent_snapshots, user_description_evidence, analyses,
-- and all existing analyses data remain intact.
-- Stored image binaries in object storage (if any were written post-deploy)
-- require separate governed cleanup per migration plan — not handled by this DDL rollback.
```

| Rollback concern | Intent |
|------------------|--------|
| **Relational schema** | Drop `image_evidence` table and SELECT policy. |
| **Upstream tables** | No change to Slice 1 session stores or Slice 2 description evidence. |
| **Compatibility read model** | `analyses` unchanged. |
| **Object storage** | Out of scope for DDL rollback; binary artifacts may remain until explicit storage cleanup is authorized. |
| **Reversibility** | Re-applying forward DDL after rollback is idempotent at empty-table state; data loss applies only to dropped `image_evidence` rows. |

---

## Current Decision

**This document proposes SQL only.**

It translates accepted Slice 3 plan and technical design into reviewable DDL for `image_evidence`. It does **not** authorize:

- Supabase schema changes or migration execution
- Object storage bucket creation, storage policy changes, or upload configuration
- Manual SQL Editor runs
- Application code changes
- API or UI changes
- Read-path cutover from `analyses`

**Consent is inherited through `scan_record_id` → `consent_snapshots` (no direct FK). `storage_object_ref` is a governed private storage reference, not a public URL. `capture_metadata` holds non-inference capture context only. `evidence_status` is `active` or `excluded`.**

Execution requires separate sign-off after this draft, its rollback companion, storage posture artifact, and downstream migration plan are reviewed and accepted.
