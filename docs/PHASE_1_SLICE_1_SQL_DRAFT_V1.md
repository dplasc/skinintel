# Phase 1 Slice 1 — SQL Draft V1

## Purpose

This document contains **proposed SQL for review** before any Supabase execution.

It translates the accepted migration plan (**docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**), technical design (**docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md**), and live schema inspection (**docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md**) into concrete DDL for Phase 1 Slice 1: `scan_records`, `consent_snapshots`, and nullable `analyses.scan_record_id` linkage.

This is a **review artifact only**. It does not execute SQL, apply migrations, modify Supabase, or authorize application changes.

---

## Status

| Attribute | Value |
|-----------|-------|
| **Document status** | Draft only |
| **Execution approval** | Not approved for execution |
| **Run instruction** | **Do not run this SQL yet** |
| **Supabase authorization** | **No Supabase changes authorized by this document** |

---

## Live Schema Basis

Verified read-only facts from **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md**:

| Finding | Verified state |
|---------|----------------|
| `analyses.id` | `uuid`, default `gen_random_uuid()` |
| `analyses` RLS | Enabled |
| `analyses` SELECT policy | `lower(user_email) = lower(auth.jwt() ->> 'email')` — policy name: *Users can read own analyses* |
| `analyses` row count | **2** rows |
| Extensions | `pgcrypto` (1.3) and `uuid-ossp` (1.1) present |
| `gen_random_uuid()` | Tested; works |
| `analyses.scan_record_id` | **Does not exist yet** |
| `analyses` write pattern | Service-role client bypasses RLS; no client INSERT/UPDATE/DELETE policies on `analyses` |

New tables should mirror the existing ownership pattern: user-owned SELECT on `user_email`; server-side service-role writes until a future code slice opens client write paths.

---

## Proposed SQL Draft

```sql
-- Phase 1 Slice 1 — proposed DDL (review only; do not execute without approval)

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
```

---

## Rollback Draft

```sql
-- Phase 1 Slice 1 — proposed rollback (review only; do not execute without approval)
-- Preserves all analyses rows and existing analyses data.

-- Drop RLS policies first
DROP POLICY IF EXISTS "Users can read own consent snapshots" ON public.consent_snapshots;
DROP POLICY IF EXISTS "Users can read own scan records" ON public.scan_records;

-- Drop dependent table (consent_snapshots references scan_records)
DROP TABLE IF EXISTS public.consent_snapshots;

-- Remove compatibility linkage from analyses (index dropped with column)
ALTER TABLE public.analyses
  DROP COLUMN IF EXISTS scan_record_id;

-- Drop session anchor table
DROP TABLE IF EXISTS public.scan_records;

-- analyses rows and all other analyses columns remain intact.
```

---

## Review Notes

- **Review before execution** — Product and architecture must review and accept both forward and rollback SQL before any DDL runs.
- **Versioned migration recommended** — After approval, store the accepted SQL in `supabase/migrations/` as the source of truth per **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**.
- **Manual Supabase SQL Editor** — If applied manually, copy/paste **only after explicit approval**; do not run unaudited dashboard edits.
- **Backup consideration** — Even with only **2** `analyses` rows today, consider a production backup or export before execution in production environments.
- **Post-apply verification** — Confirm `analyses` reads unchanged, new tables empty, `scan_record_id` nullable on all existing rows, and service-role write path still functions when dual-write code is authorized later.

---

## What This SQL Does Not Do

This draft explicitly excludes:

- No backfill of legacy `analyses` rows to `scan_records`
- No image evidence table
- No user description evidence table
- No product/routine mention table
- No correction event table
- No evidence confidence table
- No AI result separation (dedicated Intelligence store)
- No API changes
- No UI changes
- No triggers enforcing consent snapshot immutability (deferred to future slice or application layer)
- No deletion/tombstone workflow implementation (`scan_records.status = 'excluded'` is schema placeholder only)

---

## Acceptance Criteria Before Execution

All criteria must pass before any SQL is applied:

| # | Criterion |
|---|-----------|
| 1 | Forward SQL reviewed and accepted |
| 2 | Rollback SQL reviewed and accepted |
| 3 | Table names accepted: `scan_records`, `consent_snapshots` |
| 4 | RLS SELECT policies accepted (no client write policies) |
| 5 | `consent_scopes` JSON array strategy accepted |
| 6 | Nullable `analyses.scan_record_id` FK accepted (`ON DELETE SET NULL`) |
| 7 | One consent snapshot per `scan_record_id` unique constraint accepted |
| 8 | `scan_records.status` check constraint values accepted (`active`, `excluded`) |
| 9 | Execution environment confirmed (staging first recommended) |
| 10 | No manual Supabase or dashboard schema changes before final approval |

---

## Recommended Next Step

**Review this SQL draft manually** with product and architecture stakeholders.

After acceptance:

1. Create a versioned migration file under `supabase/migrations/`
2. Apply to staging first
3. Verify read paths and row preservation
4. Authorize dual-write application code as a **separate** slice

Do not run forward or rollback SQL until explicit execution sign-off.

---

## Current Decision

**This document proposes SQL only.**

It translates live-verified schema facts and accepted migration direction into reviewable DDL. It does **not** authorize:

- Supabase schema changes or migration execution
- Manual SQL Editor runs
- Application code changes
- API or UI changes

Execution requires separate sign-off after this draft and its rollback companion are reviewed and accepted.
