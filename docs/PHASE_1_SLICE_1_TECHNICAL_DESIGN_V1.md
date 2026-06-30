# Phase 1 Slice 1 — Technical Design V1

## Purpose

This document translates the accepted minimal implementation slice from **docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md** into a **read-only technical design** before any Supabase migration, application persistence change, or UI work.

It defines conceptual persistence targets, relationship design, transitional write/read behavior, and migration planning boundaries for Slice 1: **Scan Record V2 + Consent Snapshot + Compatibility `analyses` linkage**. It does not define final exact database fields, SQL, migrations, API implementation, or UI design.

Sources: **docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

Repository inspection (read-only): `app/api/scan/route.ts`, `app/actions/index.ts`, `app/(dashboard)/(homes)/history/page.tsx`, `app/(dashboard)/(homes)/history/[id]/page.tsx`, `app/(dashboard)/(homes)/dashboard/page.tsx`. No Supabase migration files are present in the repository; current `analyses` schema is inferred from application usage only.

---

## Slice 1 Scope

Slice 1 technical design covers **only**:

- **Scan Record V2** future persistence design — Evidence Session Store anchor
- **Consent Snapshot** future persistence design — Consent Governance Store
- **Compatibility linkage** with current `analyses` — transitional read model bridge
- **Authority rules** — which store owns which concern during transition
- **Migration planning boundaries** — what a future migration plan must address; no SQL here

Slice 1 does **not** design or implement child evidence persistence, Intelligence separation, governance workflows, or UI changes.

---

## Current State Summary

Based on **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** and read-only repository inspection:

| Area | Current state |
|------|---------------|
| **Primary persistence** | Supabase `analyses` table is the only server-side scan session store |
| **Mixed artifact** | Each row combines session metadata, AI `result` JSON, AI `confidence`, consent booleans, and `model` |
| **Write path** | `POST /api/scan` validates auth and consent → calls OpenAI → inserts single `analyses` row |
| **Insert fields** | `user_email`, `result`, `confidence`, `consent_medical: true`, `consent_privacy: true`, `model` (hardcoded) |
| **Consent** | Gate-checked at request time; persisted as legacy boolean flags, not Consent Snapshot |
| **Capture inputs** | Image, description, and ingredients used for AI only; **not separately persisted** server-side |
| **Persistence failure** | Supabase insert errors are logged; API still returns 200 with AI JSON |
| **Dashboard reads** | `getLatestAnalysis()` queries `analyses` by `user_email` for `id`, `confidence`, `created_at`, count |
| **History reads** | List and detail pages query `analyses` by `user_email`; detail renders embedded `result` JSON |
| **localStorage** | Dashboard uses `skinintel_last_scan` for device cache; non-authoritative but functionally usable |
| **Migrations in repo** | None found; schema evolution must be planned against live/external Supabase state |

Transitional Hybrid has **not started**. `analyses` is currently both write target and read source of truth—not a compatibility layer.

---

## Proposed Conceptual Persistence Design

Conceptual entities only. No exact columns, types, or SQL.

### Scan Record V2 persistence target

**Purpose:** Authoritative governed capture session anchor for Personal Evidence Base.

**Authority:** Once implemented, Scan Record V2 is the canonical record that a consent-valid capture session occurred. It owns session identity, capture timestamp, and user ownership reference—not AI output.

**Conceptual attributes (not field definitions):**

- Session identifier (stable, distinct from `analyses.id`)
- User ownership reference (see open questions: email vs auth user id)
- Capture timestamp (evidence event time; immutable after creation)
- Reference to linked Consent Snapshot
- Optional reference to compatibility `analyses` row (if linkage lives on session side)
- Placeholder for future child evidence references (Image Evidence, User Description Evidence, etc.) — **not populated in Slice 1**

**Does not own:** AI Analysis Result JSON, recommendation content, `analyses.confidence`, Product Intelligence, or Experience Layer presentation state (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).

### Consent Snapshot persistence target

**Purpose:** Immutable capture-time consent governance record.

**Authority:** Authoritative record of which consent scopes were active when capture began (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).

**Conceptual attributes (not field definitions):**

- Snapshot identifier
- Link to parent Scan Record V2
- Enumerated active consent scopes at capture (e.g., `cosmetic_analysis_acknowledgement`, `image_processing_consent`, `description_processing_consent`, `evidence_storage_consent`, `reasoning_consent`, `retention_tracking_consent`)
- Snapshot timestamp
- Immutability semantics (append-only; no in-place mutation after creation)

**Does not own:** Current mutable user consent preferences, UI checkbox state, or retroactive consent reinterpretation.

### `analyses` compatibility linkage

**Purpose:** Preserve current history and dashboard behavior during Transitional Hybrid (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**).

**Authority:** **Non-authoritative** for Evidence Layer concerns. Readable for UI; subordinate to Scan Record V2 and Consent Snapshot for session and consent truth.

**Conceptual behavior:**

- Existing legacy rows remain readable without Scan Record V2 reference
- New captures write compatibility row **after** governed session + consent, linked to Scan Record V2
- Row continues to carry `result` (legacy AI JSON), `confidence` (AI output certainty), `model`, and legacy consent booleans for backward-compatible reads
- Linkage field (on `analyses` or via inverse reference) connects compatibility row to Scan Record V2 for new sessions only

**Why not authoritative:** Personal Evidence Base authority resides in governed evidence stores. Treating `analyses` as canonical would abort separation and violate **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

---

## Relationship Design

Conceptual cardinality and linkage:

| Relationship | Cardinality / rule |
|--------------|-------------------|
| Scan Record V2 → user | **One session belongs to one user** |
| Scan Record V2 → Consent Snapshot | **One session has one Consent Snapshot at capture time** |
| Scan Record V2 → compatibility `analyses` row | **One session may have one compatibility row during transition** |
| `analyses` row → Scan Record V2 | **Optional reference for new captures**; legacy rows may have no link |
| Scan Record V2 → AI output | **No embedding** — AI payload stays in `analyses.result` during Slice 1 |
| Scan Record V2 → child evidence | **Designed for future linkage** — not persisted in Slice 1 |

**Legacy rows:** Pre-Slice-1 `analyses` rows have no Scan Record V2 reference. They remain valid for history/dashboard reads as mixed legacy artifacts.

**AI output:** Remains in `analyses.result` during Slice 1. Dedicated AI Analysis Result persistence is a later slice. Scan Record V2 must not store AI JSON, recommendations, or model output (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).

---

## Transitional Write Design

Conceptual write sequence for **future implementation** (not authorized by this document):

1. **Validate auth** — reject unauthenticated requests (current behavior preserved).
2. **Validate required consent scopes** — block capture if mandatory scopes absent (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).
3. **Create Consent Snapshot** — immutable scope record before session anchor.
4. **Create Scan Record V2** — linked to Consent Snapshot; establishes authoritative session.
5. **Run current AI flow** — unchanged inference using capture inputs; no new evidence object persistence in Slice 1.
6. **Write `analyses` compatibility row** — linked to Scan Record V2; carries legacy AI payload and transitional metadata.
7. **Return current response unchanged if possible** — same JSON shape to client; no UI contract change.

**Clarifications:**

- **Exact transaction handling is not defined here** — whether Consent Snapshot, Scan Record V2, and `analyses` insert are atomic, compensating, or best-effort is an open question (see below).
- **Code implementation is not authorized here** — `app/api/scan/route.ts` remains unchanged until migration plan approval and explicit coding authorization.
- **No UI changes in Slice 1** — dashboard, history, and capture presentation unchanged.

**Authority on write:** Evidence stores (Consent Snapshot, Scan Record V2) are written **before** compatibility row. On conflict, evidence stores prevail.

---

## Transitional Read Design

| Read path | Slice 1 behavior |
|-----------|------------------|
| **Dashboard** | Continues reading `analyses` via `getLatestAnalysis()` — no change |
| **History list** | Continues querying `analyses` by `user_email`, ordered by `created_at` |
| **History detail** | Continues rendering `analyses.result` embedded JSON |
| **New evidence stores** | **Not used by UI** in Slice 1 — no read cutover |
| **Legacy rows** | Readable without Scan Record V2 link; no migration marker required for display |
| **Future read migration** | Evidence-first reads deferred to later slice after dual-write validation |

Compatibility linkage must **not change current user experience**. Users see the same history and dashboard behavior; engineering gains governed session + consent records under the hood for new captures.

---

## Migration Planning Notes

A future **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** should address the following conceptually (no SQL in this document):

| Migration concern | Planning intent |
|-------------------|-----------------|
| **Create Scan Record V2 persistence target** | New governed session store; distinct from `analyses` |
| **Create Consent Snapshot persistence target** | New immutable consent store; linked to Scan Record V2 |
| **Add compatibility linkage** | Optional nullable reference between `analyses` and Scan Record V2 (direction TBD in open questions) |
| **Preserve existing `analyses` rows** | No destructive change to legacy data; reads continue |
| **Avoid breaking history/dashboard** | Existing columns and query patterns remain valid |
| **Backfill** | **Not required in Slice 1** unless separately approved — legacy rows stay unlinked |
| **Repository gap** | No migration files in repo today; plan must document how schema is applied (Supabase dashboard vs new migration directory) |
| **RLS / policies** | Future plan should note access control alignment with `user_email` pattern |

Slice 1 migration adds structure for **new captures only**; legacy history remains mixed-artifact rows until optional future backfill or cutover slice.

---

## Open Technical Questions

These must be resolved in the migration plan before writing migration SQL:

1. **Canonical user reference** — Continue `user_email` (matches all current queries) or migrate to auth `user.id` UUID? Mixed use exists in rate limiting (`email ?? id`).

2. **Naming of persistence targets** — Table/collection names for Scan Record V2 and Consent Snapshot (e.g., `scan_records`, `consent_snapshots` vs domain-specific naming). Must not imply merge with `analyses`.

3. **Linkage direction** — Foreign key on `analyses` → Scan Record V2, or Scan Record V2 → `analyses`, or bidirectional? Affects query patterns and orphan handling.

4. **Legacy row linkage** — Nullable reference only for new rows, or separate `legacy_unlinked` marker column? Default: null = pre-Slice-1 or unknown.

5. **Transaction behavior** — If `analyses` insert fails after Scan Record V2 + Consent Snapshot are created: rollback, compensating delete, retry, or orphan session with tombstone? Current code silently succeeds API on insert failure.

6. **Consent scope storage shape** — JSON array, bitmask, or normalized scope rows? Must support immutable enumeration per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

7. **Legacy consent booleans on `analyses`** — Keep writing `consent_medical` / `consent_privacy` for compatibility during transition, or deprecate on insert while retaining column for legacy reads?

8. **Rollout strategy** — Feature flag, environment-only deploy, or all-new-captures immediately after migration apply?

9. **Rollback strategy** — Drop new tables and linkage column vs. leave orphaned evidence rows; impact on sessions created during rollout window.

10. **Supabase schema source of truth** — No migrations in repo; confirm live schema matches inferred `analyses` shape before planning ALTER vs new tables.

---

## Explicit Non-Goals

Slice 1 technical design explicitly excludes:

- Image Evidence persistence
- User Description Evidence persistence
- Product Mention Evidence persistence
- Routine Mention Evidence persistence
- Correction Event storage
- Deletion workflow implementation
- Evidence Confidence Posture storage
- AI Analysis Result separation (dedicated Intelligence store)
- Dashboard/history UI changes
- localStorage behavior changes
- Product Intelligence
- Routine Intelligence
- SQL migration files
- Application code changes
- API contract changes

---

## Acceptance Criteria For This Technical Design

This document is acceptable for review when:

| Criterion | Met by this design |
|-----------|-------------------|
| Aligns with Transitional Hybrid | Dedicated evidence stores + `analyses` compatibility (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**) |
| Preserves current `analyses` reads | Dashboard/history unchanged; same query surfaces |
| Does not make `analyses` authoritative | Scan Record V2 + Consent Snapshot own session and consent |
| Keeps AI output separate from Scan Record V2 | `analyses.result` only; no AI JSON on session anchor |
| Does not define SQL prematurely | Conceptual entities and open questions only |
| Identifies open questions before migration plan | Ten questions listed for migration plan resolution |
| Prepares next document | **docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md** recommended |

---

## Recommended Next Step

**Create `docs/PHASE_1_SLICE_1_MIGRATION_PLAN_V1.md`**

That document should:

- Resolve open technical questions from this design
- Propose exact table names, column strategy, and linkage direction
- Define migration sequencing, rollout, and rollback approach
- Inspect live Supabase schema and document delta from current `analyses` usage

**Clarifications:**

- Migration plan **still does not execute SQL**
- It may propose exact table names and migration strategy for review
- **No manual Supabase changes** until migration plan is reviewed and approved
- Application code changes remain blocked until migration plan approval and explicit implementation authorization per **docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md**

---

## Current Decision

**This technical design does not authorize implementation.**

Acceptance of this document means product and architecture agree on Slice 1 conceptual persistence design, transitional write/read intent, migration planning boundaries, and open questions—but it does **not** authorize:

- SQL or Supabase schema changes
- Migration execution or manual table creation
- Changes to `app/api/scan/route.ts`, dashboard, history, or related application files
- API contract or response shape changes
- UI redesign or new user-facing behavior

Next authorized artifact: proposed migration plan. Coding begins only after migration plan review and explicit implementation sign-off.
