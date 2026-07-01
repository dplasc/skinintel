# Phase 1 Slice 1 — Execution Approval Checklist V1

## Purpose

This checklist is the **final review gate** before running the Phase 1 Slice 1 Supabase migration.

It confirms that planning artifacts, live inspection findings, SQL draft review, and the versioned migration file are aligned—and that execution risks are understood—before any forward DDL is applied. This document does not execute SQL, modify Supabase, or authorize application changes.

Sources: **docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md**, **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**, **supabase/migrations/20260701120000_phase_1_slice_1_evidence_foundation.sql**.

---

## Migration Under Review

**File:** `supabase/migrations/20260701120000_phase_1_slice_1_evidence_foundation.sql`

**Derived from:** **docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md** (forward SQL only; rollback remains in the draft document).

| Action | Detail |
|--------|--------|
| Create `public.scan_records` | Evidence Layer session anchor (Scan Record V2) |
| Create `public.consent_snapshots` | Immutable capture-time consent record; 1:1 per session |
| Alter `public.analyses` | Add nullable `scan_record_id` FK → `scan_records(id)` ON DELETE SET NULL |
| Indexes | `scan_records(user_email, captured_at DESC)`; `analyses(scan_record_id)` |
| RLS | Enable on `scan_records` and `consent_snapshots` |
| Policies | SELECT only: *Users can read own scan records*; *Users can read own consent snapshots* |
| Backfill | **None** — legacy `analyses` rows remain with `scan_record_id` null |
| Existing data | **No UPDATE/DELETE** on `analyses` — row content preserved |

---

## Pre-Execution Checklist

| Check | Status | Evidence | Notes |
|-------|--------|----------|-------|
| Repo clean | PENDING | Operator confirmation | Confirm no uncommitted schema/code drift unrelated to this migration before execution |
| Migration committed and pushed | PENDING | `supabase/migrations/20260701120000_phase_1_slice_1_evidence_foundation.sql` | Migration file present in repo; confirm commit and remote push before apply |
| Live `analyses` schema inspected | READY | **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md** | Columns, types, indexes, and constraints verified read-only against live Postgres |
| `analyses` row count confirmed | READY | **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md** | **2** rows at inspection time; re-confirm immediately before apply |
| UUID support confirmed | READY | **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md** | `pgcrypto`, `uuid-ossp` present; `gen_random_uuid()` tested |
| RLS pattern confirmed | READY | **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md**, migration file | New tables mirror `analyses` ownership: `lower(user_email) = lower(auth.jwt() ->> 'email')`; no client write policies |
| Rollback reviewed in SQL draft | READY | **docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md** (Rollback Draft) | Drop policies → `consent_snapshots` → `analyses.scan_record_id` → `scan_records`; preserves `analyses` rows |
| Existing `analyses` rows preserved | READY | Migration file, **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** | Nullable column add only; no backfill, no row mutation |
| No app code changes included | READY | Migration scope | Schema-only migration; no application files in this change set |
| No UI changes included | READY | **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** | Dashboard/history unchanged until separate dual-write code slice |
| No API changes included | READY | **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** | `POST /api/scan` unchanged until separately authorized |
| No Supabase changes executed yet | READY | **docs/PHASE_1_SLICE_1_LIVE_SUPABASE_INSPECTION_V1.md** | Read-only inspection only; `scan_record_id` does not exist on live `analyses` |

---

## Execution Risks

| Risk | Mitigation |
|------|------------|
| Accidental production execution without final confirmation | Apply only after this checklist is reviewed and accepted; confirm target environment explicitly |
| Manual SQL paste error | Use versioned migration file contents only; avoid ad hoc edits in SQL Editor |
| Migration succeeds but code is not yet dual-writing | Expected for Slice 1 — new tables remain empty until dual-write code slice; no user-visible change required |
| New tables remain empty until later code slice | Acceptable; schema prepares evidence foundation without behavioral change |
| RLS policy typo risk | Verify policy names and `USING` clause match migration file post-apply |
| Rollback must preserve `analyses` rows | Use rollback SQL from **docs/PHASE_1_SLICE_1_SQL_DRAFT_V1.md** only when instructed; never drop or truncate `analyses` |

---

## Execution Recommendation

**Migration can be approved for manual Supabase SQL Editor execution only after this checklist is reviewed and accepted.**

| Rule | Detail |
|------|--------|
| Apply forward SQL only | Run contents of `20260701120000_phase_1_slice_1_evidence_foundation.sql` |
| Do not run rollback | Unless rollback is specifically instructed after a failed or reversed deploy |
| Verify after execution | Run post-execution verification queries (see below) |
| Do not change app code yet | Dual-write to `scan_records` / `consent_snapshots` requires separate code slice authorization |

Recommended order: staging first (if available) → production after verification passes.

---

## Post-Execution Verification Plan

Run read-only checks after forward migration apply:

| # | Verification | Expected result |
|---|--------------|-----------------|
| 1 | `scan_records` table exists | Table present in `public` schema with expected columns |
| 2 | `consent_snapshots` table exists | Table present with FK to `scan_records` |
| 3 | `analyses.scan_record_id` exists and is nullable | Column type `uuid`, nullable, FK to `scan_records` |
| 4 | Existing `analyses` rows still exist | All pre-migration rows readable |
| 5 | `analyses` row count equals pre-migration count | Count remains **2** (or current baseline recorded immediately before apply) |
| 6 | RLS enabled on new tables | `scan_records` and `consent_snapshots` RLS = true |
| 7 | SELECT policies exist | *Users can read own scan records*; *Users can read own consent snapshots* |
| 8 | Dashboard/history unchanged | Current reads from `analyses` only; no join dependency on new tables |

Optional catalog queries (read-only):

```sql
-- Row count baseline
SELECT count(*) FROM public.analyses;

-- New column nullable check
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'analyses'
  AND column_name = 'scan_record_id';

-- RLS status
SELECT relname, relrowsecurity
FROM pg_class
WHERE relname IN ('scan_records', 'consent_snapshots');
```

---

## Current Decision

**This checklist does not itself execute or authorize execution.**

Acceptance means product and architecture confirm pre-execution checks, understand execution risks, and approve manual forward migration apply per **supabase/migrations/20260701120000_phase_1_slice_1_evidence_foundation.sql**.

Until this checklist is reviewed and accepted:

- Do not run forward SQL in Supabase
- Do not run rollback SQL unless specifically instructed
- Do not deploy application dual-write code
- Do not change API or UI behavior

Execution authorization is a separate explicit sign-off after this checklist passes review.
