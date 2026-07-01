# Phase 1 Slice 1 — Schema Inspection V1

## Purpose

This document records the **read-only repository schema inspection** conducted before drafting Phase 1 Slice 1 SQL.

It formalizes findings from repository inspection aligned with **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md**, and **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**. It establishes what is known from code and repository artifacts—and what requires live Supabase verification—before any SQL draft, migration apply, or application change.

This is a planning artifact only. It does not contain SQL, execute migrations, or authorize implementation.

---

## Inspection Scope

| Attribute | Value |
|-----------|-------|
| **Inspection type** | Repository-only, read-only |
| **Supabase connection** | None |
| **File edits** | None during inspection |
| **Application changes** | None |

**Inspected:** repository root for `supabase/` and migrations; SQL and schema documentation files; all application references to `analyses` in scan write and history/dashboard read paths.

**Not inspected:** live Postgres DDL, RLS policies, indexes, triggers, row counts, or environment parity (staging vs production).

Sources: **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

---

## Repository Migration Status

| Check | Finding |
|-------|---------|
| **`supabase/` at repository root** | **Not present** |
| **`supabase/migrations/`** | **Not present** |
| **Executable migration files for `analyses`, `scan_records`, `consent_snapshots`** | **None** — only planning documents (e.g. **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md**) |
| **Other SQL in repository** | Present for **product catalog only** — e.g. `products_table_draft.sql`, `products_seed_verified_top20.sql`, `docs/product_batch_01.sql`, `docs/product_batch_01_ingredients_update.sql` |
| **Supabase CLI config** | No `config.toml` found |
| **Schema source of truth** | **Likely live Supabase project** — application uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` with direct table access |
| **Scan/evidence schema in repo** | **Not tracked** — no `analyses` DDL, no versioned evidence-layer migrations |

**Conclusion:** Slice 1 schema cannot be validated or applied from repository history alone. Live Supabase inspection is required before SQL draft finalization.

---

## analyses References In Code

Application code references only (planning docs excluded). **No other application files** reference `.from("analyses")` beyond those listed below.

| File | Operation type | Columns read/written | Filters / order | Notes |
|------|----------------|----------------------|-----------------|-------|
| `app/api/scan/route.ts` | **INSERT** | **Write:** `user_email`, `result`, `confidence`, `consent_medical`, `consent_privacy`, `model` | N/A | Service-role client. `result` is normalized AI JSON. Consent booleans hardcoded `true`. Insert errors logged; API still returns 200. Does not write `id` or `created_at`. |
| `app/actions/index.ts` | **SELECT** + count | **Read:** `id`, `confidence`, `created_at` | `.eq("user_email", session.user.email)` · `.order("created_at", { ascending: false })` · `.limit(1)` · `{ count: "exact" }` | Server action via service-role. Used by dashboard. |
| `app/(dashboard)/(homes)/history/page.tsx` | **SELECT** | **Read:** `id`, `confidence`, `model`, `created_at`, `result` | `.eq("user_email", session.user.email)` · `.order("created_at", { ascending: false })` · `.limit(50)` | List UI uses `result.intro`, row `confidence`, `model`, `created_at`. Links to `/history/{id}`. |
| `app/(dashboard)/(homes)/history/[id]/page.tsx` | **SELECT** (single) | **Read:** `id`, `confidence`, `model`, `created_at`, `result` | `.eq("id", id)` · `.eq("user_email", session.user.email)` · `.single()` | Detail UI renders full `result` JSON (`intro`, `assessment`, `top5`, `next_steps`, `medical_disclaimer`) and top-level `confidence`. |
| `app/(dashboard)/(homes)/dashboard/page.tsx` | **Indirect read** | Via `getLatestAnalysis()`: `id`, `confidence`, `created_at`, total count | Same as `app/actions/index.ts` | Displays latest metadata and links to `/history/{id}`. Scan result shown from in-memory API response and `localStorage` (`skinintel_last_scan`); not re-fetched from `analyses` after POST. |

**Related Supabase usage (not `analyses`):** `app/actions/index.ts` reads/writes `user_preferences`; `app/api/interest/route.ts` writes `interest_leads`.

---

## Current Inferred analyses Shape

Inferred **from application code only**. **Not confirmed against live Postgres.**

| Column | Inference | Evidence |
|--------|-----------|----------|
| **`id`** | Primary key; DB-generated on insert | Returned on SELECT; used in URLs and detail filter. TypeScript allows `string \| number` — actual DB type unknown (UUID, bigint, serial, etc.). |
| **`user_email`** | Text; user ownership key | Written on insert; filtered on all reads. |
| **`result`** | JSON/JSONB object | Written as normalized AI payload. Read: `intro`, `assessment`, `top5`, `next_steps`, `confidence`, `medical_disclaimer`. |
| **`confidence`** | Text (`low` \| `medium` \| `high`) | Written from AI JSON; read at row level in list/detail/dashboard. |
| **`consent_medical`** | Boolean | Written hardcoded `true`; not read by current UI queries. |
| **`consent_privacy`** | Boolean | Written hardcoded `true`; not read by current UI queries. |
| **`model`** | Text | Written hardcoded `"gpt-4o-mini"`; read in history list/detail. |
| **`created_at`** | Timestamp | Read and ordered; not written in insert (likely DB default). |
| **Other columns** | **None inferred** | No application references to `updated_at`, `scan_record_id`, or other fields. |

**Insert payload (application):** `{ user_email, result, confidence, consent_medical, consent_privacy, model }`.

**Live schema certainty:** This shape is inferred from code only and is **not confirmed** against live Postgres definitions, constraints, or defaults.

---

## RLS / Policy Visibility From Repo

| Item | Finding |
|------|---------|
| **RLS policies for `analyses`** | **Not visible** — no DDL, no policy SQL, no `supabase/` configuration in repository |
| **`analyses` DDL in repo** | **Absent** |
| **Application access pattern** | All `analyses` access uses **server-side service-role** Supabase client (`app/api/scan/route.ts`, server actions, server components) |
| **Documented RLS intent** | Architecture/blueprint docs reference RLS for user-owned tables before SaaS launch; **docs/HANDOFF_LOG.md** notes some MVP tables unrestricted — **`analyses` RLS status undocumented in repo** |

**Conclusion:** RLS and policy design for `analyses`, `user_preferences`, and proposed Slice 1 tables (`scan_records`, `consent_snapshots`) **cannot be determined from repository inspection**. **Live Supabase inspection is required** before policy design or SQL draft finalization.

---

## Migration Source-of-Truth Gap

Without versioned migrations in the repository, the following risks apply to Slice 1:

| Risk | Impact |
|------|--------|
| **Undocumented live DDL** | Live `analyses` column types, constraints, indexes, and triggers may differ from code inference |
| **Unreviewed manual changes** | Schema may have been applied via Supabase dashboard without repo record |
| **No rollback baseline** | Pre-migration state cannot be reconstructed from git alone |
| **Environment drift** | Staging vs production schema parity unknown |
| **FK type mismatch** | Proposed `analyses.scan_record_id` must match `scan_records.id` type; `analyses.id` type unknown from repo |
| **Team coordination risk** | Multiple operators may apply conflicting DDL outside version control |

Aligns with **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** recommendation to establish `supabase/migrations/` as source of truth after SQL draft approval.

---

## SQL Draft Readiness

| Assessment | Result |
|------------|--------|
| **Conceptual migration direction** | **Sufficient** — table names, linkage (`analyses.scan_record_id`), and store groups defined in migration plan and technical design |
| **Finalize or execute SQL** | **Insufficient** — live schema and policy state unknown |

### Blockers before SQL execution

1. **Live `analyses` schema must be verified** — columns, types, nullability, defaults, indexes, constraints, triggers
2. **RLS policies must be inspected** — on `analyses`, `user_preferences`, and implications for new tables
3. **UUID extension availability must be confirmed** if used — `products_table_draft.sql` suggests `gen_random_uuid()` may be available; not confirmed for evidence tables
4. **Migration execution method must be chosen** — repo migrations + CLI vs reviewed manual apply
5. **Rollback strategy must be represented in SQL draft** — nullable linkage, preserve `analyses` rows, drop-new-tables path
6. **`created_at` behavior must be confirmed** — insert omits column; verify DB default/trigger on live table
7. **Table size / ALTER impact must be assessed** — row count and lock impact before adding nullable `scan_record_id`

Repository inspection alone does **not** clear blockers 1, 2, 6, or 7.

---

## Recommended Next Step

**Perform live Supabase read-only inspection first.**

Before any SQL draft is review-ready:

1. Inspect live **`analyses`** definition — columns, types, indexes, RLS, triggers
2. Inspect **RLS / policies** on existing user-owned tables
3. **Confirm `id` type** — required for `scan_records.id` and `analyses.scan_record_id` FK design
4. **Confirm row counts** and **environment** (staging vs production)
5. **Only after live inspection** — create proposed SQL draft document or migration file (draft only, not executed)
6. **No SQL execution** until draft is reviewed and accepted per **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** acceptance criteria

---

## Current Decision

**This document records repository schema inspection only.**

Acceptance means product and architecture agree on:

- Repository migration status and source-of-truth gap
- Application `analyses` read/write contract as inferred from code
- Inferred column shape (unconfirmed against live Postgres)
- RLS visibility gap and SQL draft blockers

This document does **not** authorize:

- SQL writing or execution
- Supabase schema changes or migration apply
- Application code changes
- API contract changes
- UI changes

Next authorized artifact after live inspection: **proposed SQL draft for review** — still not execution until separately approved.
