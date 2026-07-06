# Phase 1 Slice 2 — User Description Evidence SQL Draft V1

## Purpose

This document contains **proposed SQL for review** before any Supabase execution.

It translates the accepted Slice 2 plan (**docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**), technical design (**docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md**), and verified Slice 1 schema (**docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md**) into concrete DDL for Phase 1 Slice 2: `user_description_evidence` linked to `scan_records`.

This is a **review artifact only**. It does not execute SQL, apply migrations, modify Supabase, or authorize application changes.

| Attribute | Value |
|-----------|-------|
| **Document status** | Draft only |
| **Execution approval** | Not approved for execution |
| **Run instruction** | **Do not run this SQL yet** |
| **Supabase authorization** | **No Supabase changes authorized by this document** |

---

## SQL Draft

```sql
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
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Write order (application layer)** | `scan_records` → `consent_snapshots` → `user_description_evidence` | Physical ordering follows verified Slice 1 implementation: `consent_snapshots` requires `scan_record_id` FK. Evidence insert occurs only after session anchor and consent snapshot exist. |
| **Ownership column** | `user_email text NOT NULL` | Mirrors Slice 1 `scan_records.user_email` and `consent_snapshots.user_email` for RLS consistency until canonical auth user id migration is separately authorized. |
| **Consent relationship** | **Inherited** via `scan_record_id` → `consent_snapshots` | `consent_snapshots` has `UNIQUE (scan_record_id)`. A direct `consent_snapshot_id` FK would duplicate session linkage and risk drift if not kept in sync. Audit proves `description_processing_consent` via join: `user_description_evidence` → `scan_records` → `consent_snapshots.consent_scopes`. |
| **No `consent_snapshot_id` column** | Deferred | Single session consent anchor is 1:1 with `scan_record_id`; inherited relationship is sufficient for Slice 2 audit and avoids redundant FK maintenance. |
| **Cardinality** | `UNIQUE (scan_record_id)` | One optional description field per capture session; append-oriented new captures create new rows on new sessions. |
| **`capture_source` default `web_scan`** | Required column with default | Records capture channel for provenance audit, consistent with `consent_snapshots.capture_source` semantics. Default matches current web scan route; explicit value allows future channel differentiation without schema change. |
| **`evidence_status` default `active`** | Lifecycle placeholder | Supports future deletion/tombstone semantics (`excluded`) without UPDATE of `original_text`; aligns with `scan_records.status` pattern from Slice 1. |
| **ON DELETE RESTRICT from `scan_records`** | Restrict | Deletion behavior remains governed. Physical deletion of Scan Record V2 must be an explicit future workflow decision rather than automatic cascade. This preserves flexibility for future retention and tombstone strategies. |
| **No client write RLS policies** | Service-role only | Matches Slice 1 posture: scan route writes via service-role; users SELECT own rows only. |

---

## Constraints

| Constraint | Definition | Semantics |
|------------|------------|-----------|
| **`user_description_evidence_scan_record_id_unique`** | `UNIQUE (scan_record_id)` | At most one User Description Evidence row per Scan Record V2 session. |
| **`user_description_evidence_original_text_nonempty_check`** | `CHECK (char_length(btrim(original_text)) > 0)` | **Non-empty `original_text`:** after trimming leading/trailing whitespace, at least one character must remain. Whitespace-only submissions are rejected at the database layer. Application layer must skip insert when the user provides no description (optional field). Aligns with plan rule: no row when description absent. |
| **`user_description_evidence_evidence_status_check`** | `CHECK (evidence_status IN ('active', 'excluded'))` | **`active`:** governed evidence eligible for downstream use. **`excluded`:** tombstone/deletion slice placeholder — row may remain for audit but text must not drive personalization; no in-place edit of `original_text` in Slice 2. |
| **`scan_record_id` FK** | `REFERENCES public.scan_records (id) ON DELETE CASCADE` | Evidence belongs to exactly one governed capture session. |
| **`original_text NOT NULL`** | Column nullability | Database requires text when row exists; application must not insert placeholder or empty strings — use skip instead. |

---

## RLS Policy Draft

| Setting | Posture |
|---------|---------|
| **RLS enabled** | `ALTER TABLE public.user_description_evidence ENABLE ROW LEVEL SECURITY` |
| **SELECT policy** | `"Users can read own user description evidence"` — `FOR SELECT TO public USING (lower(user_email) = lower(auth.jwt() ->> 'email'))` |
| **INSERT policy** | None — service-role scan route only |
| **UPDATE policy** | None — append-oriented; no client mutation in Slice 2 |
| **DELETE policy** | None — deletion workflow deferred to future slice |

Consistent with Slice 1: authenticated users read own evidence; all writes bypass RLS via service-role client in `app/api/scan/route.ts`.

---

## Verification Queries

Read-only queries for post-migration verification (do not run until after approved execution):

```sql
-- 1. Table exists
SELECT to_regclass('public.user_description_evidence') AS table_name;

-- 2. RLS enabled
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname = 'user_description_evidence'
  AND relnamespace = 'public'::regnamespace;

-- 3. SELECT policy exists
SELECT polname, polcmd
FROM pg_policy p
JOIN pg_class c ON c.oid = p.polrelid
WHERE c.relname = 'user_description_evidence'
  AND c.relnamespace = 'public'::regnamespace;

-- 4. Columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_description_evidence'
ORDER BY ordinal_position;

-- 5. Constraints exist
SELECT conname, contype, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.user_description_evidence'::regclass
ORDER BY conname;

-- 6. Row count check (expect 0 immediately after migration)
SELECT count(*) AS row_count
FROM public.user_description_evidence;

-- 7. Join proves consent scope linkage (run after dual-write produces rows)
-- Verifies inherited consent: evidence -> scan_records -> consent_snapshots
SELECT
  ude.id AS evidence_id,
  ude.scan_record_id,
  cs.id AS consent_snapshot_id,
  cs.consent_scopes,
  cs.consent_scopes @> '["description_processing_consent"]'::jsonb AS description_consent_active
FROM public.user_description_evidence ude
JOIN public.scan_records sr ON sr.id = ude.scan_record_id
JOIN public.consent_snapshots cs ON cs.scan_record_id = sr.id
LIMIT 10;
```

---

## Rollback Draft

```sql
-- Phase 1 Slice 2 — proposed rollback (review only; do not execute without approval)
-- Does not modify scan_records, consent_snapshots, or analyses.

DROP POLICY IF EXISTS "Users can read own user description evidence"
  ON public.user_description_evidence;

DROP TABLE IF EXISTS public.user_description_evidence;

-- scan_records, consent_snapshots, analyses, and all existing analyses data remain intact.
```

---

## Current Decision

**This document proposes SQL only.**

It translates accepted Slice 2 plan and technical design into reviewable DDL for `user_description_evidence`. It does **not** authorize:

- Supabase schema changes or migration execution
- Manual SQL Editor runs
- Application code changes
- API or UI changes
- Read-path cutover from `analyses`

**Consent is inherited through `scan_record_id` → `consent_snapshots` (no direct FK). `original_text` is non-empty user-origin text only. `evidence_status` is `active` or `excluded`.**

Execution requires separate sign-off after this draft, its rollback companion, and downstream migration plan are reviewed and accepted.
