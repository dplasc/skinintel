# Phase 1 Slice 1 — Migration Plan V1

## Purpose

This document proposes the **first Supabase migration plan** for Phase 1 Slice 1 before any SQL is written or applied.

It resolves open questions from **docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md** into concrete persistence targets, linkage strategy, sequencing, rollout, and rollback—while remaining a **planning artifact only**. It does not contain SQL, execute migrations, modify Supabase, or change application code.

Sources: **docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

Repository inspection (read-only): `app/api/scan/route.ts`, `app/actions/index.ts`, `app/(dashboard)/(homes)/history/page.tsx`, `app/(dashboard)/(homes)/history/[id]/page.tsx`, `app/(dashboard)/(homes)/dashboard/page.tsx`. No Supabase migration files or `supabase/` directory found in repository.

---

## Migration Plan Status

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft only |
| **Execution approval** | Not approved for execution |
| **SQL** | No SQL included in this document |
| **Supabase changes** | No Supabase changes authorized by this document |

This plan must be reviewed and accepted before any SQL draft is produced. SQL execution requires a separate approval after SQL draft review.

---

## Scope

This migration plan includes **only**:

- **Scan Record V2** persistence target (`scan_records`)
- **Consent Snapshot** persistence target (`consent_snapshots`)
- **Compatibility linkage** between `analyses` and `scan_records`
- **Preservation** of current `analyses` reads for history and dashboard
- **No UI changes** — schema-only preparation for future dual-write code slice

Excluded: child evidence tables, Intelligence separation, correction/deletion/confidence stores, backfill, API/code/UI work.

---

## Existing Schema Assumptions

Inferred from application usage and **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**. **Must be verified against live Supabase before execution.**

| Assumption | Source |
|------------|--------|
| Table `analyses` exists | All scan read/write paths query or insert into `analyses` |
| Columns used by app | `id`, `user_email`, `result` (JSON), `confidence`, `consent_medical`, `consent_privacy`, `model`, `created_at` |
| Write pattern | Service-role Supabase client in `app/api/scan/route.ts` |
| Read pattern | Filter by `user_email`; order by `created_at`; no join to other tables |
| Migration files in repo | **None present** — schema may exist only in live Supabase project |
| RLS on `analyses` | Unknown — must be inspected on live project before new tables/policies |

**Critical pre-execution step:** Run live schema inspection to confirm column names, types, constraints, indexes, and RLS policies match assumptions. Discrepancies block SQL draft until reconciled.

---

## Proposed Persistence Targets

Exact table names proposed below. **Conceptual columns only—no SQL types or DDL.**

### `scan_records`

**Purpose:** Authoritative Scan Record V2 evidence session anchor (Evidence Session Store).

**Conceptual columns:**

| Column | Purpose |
|--------|---------|
| `id` | Primary key; stable session identifier distinct from `analyses.id` |
| `user_email` | User ownership reference (initial strategy; see recommendations) |
| `captured_at` | Evidence event capture timestamp |
| `status` | Session eligibility marker (e.g., `active`, `excluded`) for future deletion/governance |
| `created_at` | Row creation timestamp |
| `updated_at` | Optional; governance state changes only—not capture time overwrite |

**Does not include:** AI `result` JSON, `confidence`, `model`, recommendations, or consent scope enumeration (lives on `consent_snapshots`).

### `consent_snapshots`

**Purpose:** Immutable capture-time consent scope record linked to `scan_records` (Consent Governance Store).

**Conceptual columns:**

| Column | Purpose |
|--------|---------|
| `id` | Primary key |
| `scan_record_id` | Foreign reference to parent `scan_records.id` |
| `user_email` | Denormalized user reference for access control alignment with current app |
| `consent_scopes` | Enumerated active scopes at capture (storage format TBD; recommendation below) |
| `snapshot_at` | Immutable consent snapshot timestamp |
| `capture_source` | Optional context (e.g., `web_scan`, `api_v1`) for audit |
| `created_at` | Row creation timestamp |

**Immutability:** Application and database rules must prevent UPDATE/DELETE of scope content after insert (enforced in SQL review; triggers or policy-level restrictions deferred to SQL draft).

### `analyses` compatibility linkage

**Purpose:** Connect legacy compatibility row to governed `scan_records` for new captures without breaking existing reads.

**Options considered:**

| Option | Description | Assessment |
|--------|-------------|------------|
| **A — Add nullable `scan_record_id` to `analyses`** | Compatibility row points to session anchor | **Preferred** |
| **B — Add nullable `analyses_id` to `scan_records`** | Session points to compatibility row | Requires new table to reference legacy table; awkward for legacy rows without session |
| **C — Bidirectional references** | Both tables link to each other | Dual-write drift risk; unnecessary for Slice 1 |

**Preferred option: A — Add nullable `scan_record_id` to `analyses`**

**Rationale:**

- **Legacy rows remain null** — all pre-Slice-1 history unchanged; no backfill required
- **Current reads continue working** — existing SELECT queries do not require the new column
- **Future joins become possible** — evidence-first reads can join `analyses` → `scan_records` → `consent_snapshots` when implemented
- **`analyses` remains compatibility/read model** — new column is reference only; does not promote `analyses` to Evidence Layer authority (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**)
- **Aligns with read-heavy UI** — history and dashboard already query `analyses` first

**Conceptual column on `analyses`:**

| Column | Purpose |
|--------|---------|
| `scan_record_id` | Nullable UUID/reference to `scan_records.id`; set only for new post-migration captures |

Legacy consent booleans (`consent_medical`, `consent_privacy`) remain on `analyses` for transitional compatibility reads; authoritative consent for new captures lives on `consent_snapshots`.

---

## Relationship Model

| Relationship | Rule |
|--------------|------|
| `scan_records` → user | One session belongs to one user (`user_email` initially) |
| `scan_records` → `consent_snapshots` | One session has one consent snapshot at capture time (1:1 for Slice 1) |
| `analyses` → `scan_records` | One compatibility row may reference one `scan_record_id`; optional, nullable |
| Legacy `analyses` | `scan_record_id` is null; valid for all current reads |
| `scan_records` → AI output | **No storage** — `scan_records` does not contain AI result JSON |
| `analyses.result` | Remains legacy AI output payload during Slice 1 |

Cardinality diagram (conceptual):

```
user
 └── scan_records (1..n)
       └── consent_snapshots (1 per capture)
       └── analyses (0..1 compatibility row via analyses.scan_record_id)
```

---

## Access Control / RLS Planning

Conceptual only. Exact policies deferred to SQL draft review.

| Target | Planning intent |
|--------|-----------------|
| **`scan_records`** | User-owned rows visible only to owning user; match `user_email` filter pattern used by current app |
| **`consent_snapshots`** | Access inherited via `scan_record_id` join or matching `user_email`; user cannot mutate after insert |
| **`analyses`** | Current access pattern must remain compatible; existing queries by `user_email` unchanged |
| **Server writes** | Service-role client (current pattern in scan route and server actions) may insert evidence rows; align with existing `analyses` write path |
| **Client direct access** | If RLS currently blocks client writes to `analyses`, same pattern applies to new tables until explicitly opened |

**Pre-SQL verification:** Inspect live Supabase for existing RLS on `analyses`, `user_preferences`, and whether anon/authenticated roles have SELECT/INSERT. New table policies must not break service-role server writes.

---

## Migration Sequence Proposal

Conceptual sequence only. **No SQL.**

1. **Verify live `analyses` schema** — columns, types, indexes, RLS, row counts baseline
2. **Create `scan_records` persistence target** — new table; no data migration from `analyses`
3. **Create `consent_snapshots` persistence target** — new table with reference to `scan_records`
4. **Add nullable `scan_record_id` to `analyses`** — compatibility linkage column only
5. **Add indexes/constraints conceptually** — e.g., index on `analyses.scan_record_id`, index on `scan_records.user_email`, unique 1:1 constraint `consent_snapshots.scan_record_id` if one snapshot per session
6. **Preserve all existing `analyses` rows** — no UPDATE, no DELETE, no backfill
7. **Do not backfill legacy rows in Slice 1** — null `scan_record_id` means pre-Slice-1 or unlinked
8. **Validate current history/dashboard queries** — run existing SELECT patterns against schema with new nullable column (null-safe)
9. **Prepare rollback plan** — document rollback steps before execution (see Rollback Strategy)
10. **Record migration in repo** — add versioned migration file after SQL draft approval (see Open Questions)

---

## Rollout Strategy

| Phase | Action |
|-------|--------|
| **1 — Schema only** | Apply approved migration to target environment (staging first recommended) |
| **2 — Verification** | Confirm `analyses` reads unchanged; new tables empty; linkage column nullable |
| **3 — No app code yet** | No changes to `app/api/scan/route.ts` or UI until migration confirmed |
| **4 — Future code slice** | Separate authorization for dual-write: Consent Snapshot → Scan Record V2 → AI flow → `analyses` with `scan_record_id` |
| **5 — No UI changes** | Dashboard/history continue reading `analyses` only |
| **6 — Production deploy** | Schema migration deploy must preserve current scan/history behavior (reads unaffected; writes unchanged until code slice) |

Deploy order: **migration first, code second**. Users should see no behavior change until dual-write code is separately gated and deployed.

---

## Rollback Strategy

| Principle | Rule |
|-----------|------|
| **Preserve `analyses` history** | Rollback must not delete or truncate existing `analyses` rows |
| **Nullable linkage** | Dropping `scan_record_id` column is safe for legacy reads if column was never required by queries |
| **New tables** | `scan_records` and `consent_snapshots` can be dropped only if **no production code writes** depend on them |
| **Orphan prevention** | If code slice deployed before rollback, assess rows in new tables before drop |
| **Exact rollback SQL** | Deferred to SQL draft; this plan defines intent only |

**Safe rollback window:** Between migration apply and dual-write code deploy—new tables unused; rollback is low risk (drop tables, drop column).

**Post-code rollback:** Requires code revert first, then schema rollback; orphaned evidence rows may need tombstone handling per future deletion slice.

---

## Open Questions Before SQL

| # | Question | Recommendation for SQL draft | Final decision |
|---|----------|------------------------------|----------------|
| 1 | User reference: `user_email` vs auth `user.id`? | **Use `user_email` initially** — matches all current queries and inserts; defer UUID migration to later slice | Pending sign-off |
| 2 | Consent scope storage format? | **JSON array of scope identifiers** on `consent_snapshots.consent_scopes` for Slice 1 — simple, immutable blob; normalized scope rows deferred | Pending sign-off |
| 3 | Array/JSON vs normalized consent scope rows? | **JSON array for Slice 1** — six Phase 1 scopes from **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**; normalize in later slice if query-by-scope needed | Pending sign-off |
| 4 | Can `analyses.scan_record_id` be added safely on live Supabase? | Verify table size, locks, and nullable ALTER impact; low risk if column is nullable with no default | Requires live inspection |
| 5 | Current RLS policies on `analyses`? | Inspect live project; mirror ownership pattern on new tables | Requires live inspection |
| 6 | Migration folder / source of truth? | **Recommend:** introduce `supabase/migrations/` in repo for versioned SQL; stop ad hoc dashboard-only changes | Pending sign-off |
| 7 | Repo migration file vs Supabase SQL editor? | **Recommend:** migration file in repo after SQL draft review; apply via Supabase CLI or reviewed manual run—not unaudited dashboard edits | Pending sign-off |
| 8 | Legacy consent booleans on insert? | Continue writing `consent_medical` / `consent_privacy` on `analyses` during transition for read compatibility | Pending sign-off |
| 9 | Transaction behavior on dual-write failure? | Defer to code slice design; schema supports nullable linkage and independent evidence rows | Deferred to code slice |
| 10 | `scan_records.status` enum values? | Propose minimal: `active` default; `excluded` reserved for future deletion slice | Pending sign-off |

---

## Explicit Non-Goals

This migration plan explicitly excludes:

- SQL statements in this document
- Migration execution or Supabase modification
- API changes
- Application code changes
- UI changes
- Image Evidence persistence
- User Description Evidence persistence
- Product Mention / Routine Mention persistence
- Correction Event, deletion workflow, Evidence Confidence Posture implementation
- Backfill of legacy `analyses` rows to `scan_records`
- AI Analysis Result table separation
- Product Intelligence / Routine Intelligence tables

---

## Acceptance Criteria Before SQL

SQL draft production is authorized only when all criteria are met:

| # | Criterion |
|---|-----------|
| 1 | This migration plan reviewed and accepted by product and architecture |
| 2 | Live `analyses` schema verified against assumptions |
| 3 | Table names accepted: `scan_records`, `consent_snapshots` |
| 4 | Linkage direction accepted: nullable `analyses.scan_record_id` |
| 5 | User reference strategy accepted (`user_email` initially recommended) |
| 6 | Consent scope storage strategy accepted (JSON array recommended for Slice 1) |
| 7 | RLS strategy accepted at conceptual level; exact policies in SQL draft |
| 8 | Rollback strategy accepted |
| 9 | Migration source-of-truth strategy accepted (repo migrations recommended) |
| 10 | Exact SQL draft reviewed and approved before execution |

Until all criteria pass: **no SQL files committed for execution, no Supabase apply, no code changes.**

---

## Recommended Next Step

**Strict read-only schema inspection**, then SQL draft production.

### Inspection prompt (Cursor or Supabase)

1. Search repository for any migration files, schema docs, or Supabase config not yet indexed
2. Document all code references to `analyses` (insert/select columns, filters, ordering)
3. Inspect live Supabase (read-only): `\d analyses` equivalent — columns, types, indexes, RLS policies, triggers
4. Confirm whether `user_preferences` or other tables share RLS patterns to mirror
5. Produce **exact SQL draft** as a separate artifact (e.g., proposed migration file content) **only after** inspection results are reviewed

### Clarifications

- **No SQL should be executed** until the SQL draft is reviewed and accepted
- Inspection is read-only; no DDL, no DML, no Supabase dashboard changes during inspection
- SQL draft is the next document/artifact—not automatic execution

---

## Current Decision

**This document proposes migration direction only.**

Acceptance means product and architecture agree on proposed table names, linkage strategy (`analyses.scan_record_id`), sequencing, rollout/rollback intent, and recommendations for open questions—it does **not** authorize:

- Supabase schema changes or migration execution
- SQL writing or application of DDL
- Changes to application files (`app/api/scan/route.ts`, actions, dashboard, history)
- API contract changes
- UI changes

Next authorized step after acceptance: **read-only live schema inspection**, then **SQL draft for review**. Coding and dual-write begin only after SQL is approved and applied, and a separate code slice is authorized per **docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md**.
