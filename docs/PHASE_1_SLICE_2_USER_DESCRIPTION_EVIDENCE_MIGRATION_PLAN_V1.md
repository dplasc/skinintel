# Phase 1 Slice 2 — User Description Evidence Migration Plan V1

## Purpose

This document proposes the **Supabase migration plan** for Phase 1 Slice 2: User Description Evidence persistence.

It defines scope, preconditions, planned schema change, execution and verification posture, rollback intent, and risks—while remaining a **planning artifact only**. It does not contain executable migration files, run SQL, modify Supabase, or change application code.

Sources: **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft only |
| **Execution approval** | Not approved for execution |
| **Migration file** | Not created by this document |
| **Supabase authorization** | No Supabase changes authorized by this document |

---

## Migration Scope

This migration plan includes **only**:

| In scope | Detail |
|----------|--------|
| **New table** | `public.user_description_evidence` — Evidence Content Store for user-origin scan description text |
| **RLS posture** | Enable RLS; SELECT policy on `user_email`; no client INSERT/UPDATE/DELETE policies |
| **Indexes** | Supporting indexes on `user_email`, `created_at`, and `scan_record_id` per SQL draft |
| **Slice 1 dependency** | Requires existing `public.scan_records` and `public.consent_snapshots` from verified Slice 1 migration |

This migration plan explicitly excludes changes to existing Slice 1 tables and all application layers in this step (see **Explicit Non-Goals**).

---

## Preconditions

All preconditions must be satisfied before migration file creation or Supabase execution:

| # | Precondition |
|---|--------------|
| 1 | **Slice 1 verified** — `scan_records`, `consent_snapshots`, and `analyses.scan_record_id` exist and are operational in target environment |
| 2 | **Slice 2 plan accepted** — **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md** committed and reviewed |
| 3 | **Slice 2 technical design accepted** — **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md** committed and reviewed |
| 4 | **SQL Draft accepted** — **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md** reviewed and signed off; forward and rollback SQL approved |
| 5 | **Migration file gate** — versioned migration file under `supabase/migrations/` is a **separate future artifact**; created only after SQL Draft acceptance |
| 6 | **Execution gate** — Supabase apply (CLI or reviewed manual run) requires **separate explicit approval** after migration file review |
| 7 | **No code deploy coupling** — this migration step does not authorize dual-write application changes |

---

## Planned Schema Change

Single additive change. **No ALTER** to existing tables.

### `public.user_description_evidence` (new)

| Column / element | Definition |
|------------------|------------|
| `id` | `uuid` PRIMARY KEY, default `gen_random_uuid()` |
| `scan_record_id` | `uuid NOT NULL`, FK to `public.scan_records(id)` **ON DELETE RESTRICT**, `UNIQUE` |
| `user_email` | `text NOT NULL` — ownership for RLS; mirrors Slice 1 transitional pattern |
| `original_text` | `text NOT NULL` — non-empty after trim (`CHECK char_length(btrim(original_text)) > 0`) |
| `capture_source` | `text NOT NULL`, default `'web_scan'` |
| `evidence_status` | `text NOT NULL`, default `'active'`; check `IN ('active', 'excluded')` |
| `created_at` | `timestamptz NOT NULL`, default `now()` |

**Consent linkage:** Inherited via `scan_record_id` → `consent_snapshots` (no `consent_snapshot_id` column). Audit proves `description_processing_consent` through join.

**Unchanged tables:**

| Table | Change |
|-------|--------|
| `public.scan_records` | **None** |
| `public.consent_snapshots` | **None** |
| `public.analyses` | **None** |

**Data migration:** None. **No legacy backfill** of prior scan descriptions or historical `analyses` rows.

---

## Execution Approach

| Step | Action |
|------|--------|
| 1 | Accept this migration plan and accepted SQL Draft |
| 2 | Create versioned migration file (separate artifact) containing approved forward SQL from SQL Draft |
| 3 | Review migration file diff against SQL Draft — no unaudited drift |
| 4 | Apply to **staging first** (recommended) after explicit Supabase execution approval |
| 5 | Run **Verification Plan** queries on staging |
| 6 | Confirm **row count is 0** and existing Slice 1 reads/writes unaffected |
| 7 | Apply to production only after staging verification passes and production execution is separately approved |
| 8 | **Do not deploy application code** in this step — schema-only migration |

**Ordering:** Migration first, dual-write code second (separate gated slice). Users should see no behavior change until application code is separately authorized and deployed.

**Write path note (future code slice):** Application insert order remains `scan_records` → `consent_snapshots` → `user_description_evidence` per verified Slice 1 FK dependency. This migration does not implement that path.

---

## Verification Plan

Read-only verification after approved migration apply. Queries defined in SQL Draft; summary checklist:

| # | Check | Expected result |
|---|-------|-----------------|
| 1 | **Table exists** | `to_regclass('public.user_description_evidence')` returns table name |
| 2 | **Columns exist** | All seven columns present with correct types and defaults |
| 3 | **Constraints exist** | PK, FK (`ON DELETE RESTRICT`), `UNIQUE(scan_record_id)`, non-empty text check, `evidence_status` check |
| 4 | **RLS enabled** | `relrowsecurity = true` on `user_description_evidence` |
| 5 | **SELECT policy exists** | Policy *Users can read own user description evidence* with `lower(user_email) = lower(auth.jwt() ->> 'email')` |
| 6 | **Row count initially 0** | `SELECT count(*) FROM public.user_description_evidence` returns **0** immediately post-migration |
| 7 | **Slice 1 regression** | Existing `analyses`, `scan_records`, and `consent_snapshots` queries unchanged; no new required columns on legacy read paths |
| 8 | **Inherited consent join** | After dual-write code is implemented (separate slice): join `user_description_evidence` → `scan_records` → `consent_snapshots` proves `description_processing_consent` in `consent_scopes` for rows with description |
| 9 | **Rollback dry-run intent** | Rollback SQL documented; confirms drop of new table only |

Verification item 8 is **post-code** validation; schema-only migration cannot populate rows until application dual-write is deployed.

---

## Rollback Plan

Rollback intent per SQL Draft. **Does not touch Slice 1 tables.**

| Step | Action |
|------|--------|
| 1 | Drop SELECT policy: *Users can read own user description evidence* |
| 2 | `DROP TABLE IF EXISTS public.user_description_evidence` |
| 3 | **Preserve** `public.scan_records`, `public.consent_snapshots`, `public.analyses`, and all existing data |

**Safe rollback window:** Between migration apply and dual-write code deploy — table empty; rollback is low risk.

**Post-code rollback:** Requires application code revert first, then schema rollback. Rows in `user_description_evidence` may require governed handling per future deletion slice before parent `scan_records` deletion (`ON DELETE RESTRICT`).

Exact rollback SQL: **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md** — Rollback Draft section.

---

## Risks And Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **`user_email` ownership is transitional** | RLS and ownership tied to email string; future auth user id migration requires coordinated column strategy | Accept for Slice 2; mirror Slice 1 pattern; defer UUID migration to separate authorized slice |
| **`ON DELETE RESTRICT` on `scan_record_id`** | Physical `scan_records` deletion blocked while dependent evidence rows exist | Intentional — deletion must be explicit governed workflow; use `evidence_status = 'excluded'` tombstone path in future slice before parent delete |
| **No direct `consent_snapshot_id` FK** | Consent audit depends on join through `scan_records` | `consent_snapshots` has `UNIQUE(scan_record_id)`; verification query 8 validates join path; avoids duplicate FK drift |
| **Pre-existing JSON parse false-success risk in scan route** | Application may return success on malformed AI JSON independent of evidence persistence | Out of scope for this migration; must be addressed in separate Slice 2 **code design** before dual-write deploy |
| **No read path uses this table yet** | Table is write-only foundation until future read-path slice | Expected Slice 2 posture; dashboard/history continue reading `analyses`; post-deploy verification must query governed store directly when code is live |
| **Schema-only deploy before code** | Empty table adds no user-visible value until dual-write | Acceptable — matches Slice 1 rollout pattern; migration and code remain separately gated |
| **SQL Draft / migration file drift** | Unreviewed changes between draft and apply | Migration file created only after SQL Draft acceptance; diff review required before execution |

---

## Explicit Non-Goals

This migration plan explicitly excludes:

- Migration file creation in this document
- SQL execution or Supabase modification
- Application code changes (`app/api/scan/route.ts`, actions, UI)
- API contract or response shape changes
- UI or capture flow changes
- **ALTER** to `scan_records`, `consent_snapshots`, or `analyses`
- Legacy backfill of prior scan descriptions
- Image Evidence, Product/Routine Mention, Correction Event, deletion workflow, Evidence Confidence Posture
- Read-path cutover from `analyses`
- AI Analysis Result separation
- Dual-write code deploy in this step

---

## Current Decision

**This document proposes migration direction only.**

It defines a single additive schema change — `public.user_description_evidence` — with inherited consent linkage, Slice 1-aligned RLS, and no changes to existing tables. It does **not** authorize:

- Migration file creation (requires accepted SQL Draft first)
- Supabase schema apply or SQL Editor runs
- Application code changes
- API or UI changes

**Next steps after acceptance:** (1) finalize SQL Draft sign-off if not complete, (2) create versioned migration file as separate artifact, (3) apply with separate Supabase execution approval, (4) run verification plan, (5) authorize dual-write code design and implementation as a **separate gated slice**.
