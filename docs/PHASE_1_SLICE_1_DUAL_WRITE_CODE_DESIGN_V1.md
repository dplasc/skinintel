# Phase 1 Slice 1 â€” Dual-Write Code Design V1

## Purpose

This document designs the **future application code change** for dual-writing governed Evidence Layer rows alongside the existing `analyses` compatibility row on each successful scan capture.

Specifically, it defines how `app/api/scan/route.ts` will:

- Create **Scan Record V2** (`scan_records`)
- Create **Consent Snapshot** (`consent_snapshots`)
- Run the **current AI flow unchanged**
- Insert an **`analyses` compatibility row** with `scan_record_id` populated

The schema foundation is already applied and verified per **docs/PHASE_1_SLICE_1_MIGRATION_EXECUTION_REPORT_V1.md**. This document addresses write ordering, failure handling, transactional posture, and GLM audit preconditions before any code is written.

This is **design only**. It is not implementation, SQL, or UI design.

---

## Status

| Attribute | Value |
|-----------|-------|
| **Document status** | Design only |
| **Code authorized** | No â€” no code authorized by this document |
| **SQL authorized** | No â€” no SQL authorized by this document |
| **UI changes** | No |
| **API response shape changes** | No |

---

## GLM Audit Preconditions

A GLM 5.2 read-only architecture and migration audit was performed against the applied Slice 1 schema and approved design documents.

| Finding | Status |
|---------|--------|
| **Verdict** | Ready to proceed |
| **P0 blockers** | None |

**P1 issues to address in this design:**

| ID | Issue | Risk today | Dual-write requirement |
|----|-------|------------|------------------------|
| **P1-1** | `consent_snapshots.scan_record_id` uses `ON DELETE CASCADE` from `scan_records`, which may contradict deletion/retention behavior in **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** (Consent Snapshot should not be silently deleted with content) | Low â€” no rows exist; no deletion workflow exists | Dual-write code must **prohibit** deleting `scan_records` via cascade-sensitive paths until FK behavior is reconciled in a future governance slice |
| **P1-2** | No database-level immutability enforcement on `consent_snapshots` (no UPDATE/DELETE triggers) | Low â€” no rows exist | Dual-write code must enforce **application-layer insert-only** semantics; database triggers may be deferred to a later hardening slice |

This design addresses both P1 items explicitly in dedicated sections below.

---

## Slice 1 Code Scope

Slice 1 dual-write code is limited to **`app/api/scan/route.ts`** future write-path design.

| In scope | Behavior |
|----------|----------|
| **Validate auth** | Preserve current session check |
| **Validate consent** | Preserve `consentMedical` / `consentPrivacy` gate |
| **Resolve Phase 1 consent scopes** | Map legacy checkbox inputs to scope identifiers (see Consent Scope Mapping) |
| **Create Scan Record V2** | Insert into `scan_records` with `user_email`, default `status = 'active'` |
| **Create Consent Snapshot** | Insert into `consent_snapshots` linked to Scan Record V2 |
| **Run current AI flow** | OpenAI call unchanged; no new evidence object persistence |
| **Insert analyses compatibility row** | Existing insert extended with `scan_record_id`; legacy booleans preserved |
| **Preserve current API response** | Return normalized AI JSON unchanged |
| **Preserve dashboard/history reads** | No read-path changes; UI continues querying `analyses` |
| **No UI changes** | Capture form, dashboard, and history unchanged |

Authority during transition: **Scan Record V2 + Consent Snapshot own session and consent**; **`analyses` remains compatibility/read model** per **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

---

## Explicit Out of Scope

The following are **not** part of Slice 1 dual-write code:

- Image evidence persistence
- User description evidence persistence
- Product mention persistence
- Routine mention persistence
- Correction event implementation
- Deletion workflow implementation
- Evidence confidence implementation
- AI Analysis Result separation (dedicated Intelligence store)
- Read-path cutover (dashboard/history still read `analyses` only)
- `localStorage` changes
- Product Intelligence
- Routine Intelligence
- Learning Layer
- UI redesign

---

## Proposed Write Order

The future implementation in `app/api/scan/route.ts` must follow this sequence:

1. **Validate auth** â€” reject unauthenticated requests (current behavior).
2. **Validate `consentMedical` and `consentPrivacy` legacy inputs** â€” reject if not `"true"` (current behavior).
3. **Resolve Phase 1 consent scopes** from current checkbox inputs (see Consent Scope Mapping).
4. **Create Scan Record V2 row** â€” insert into `scan_records`.
5. **Create Consent Snapshot row** linked to Scan Record V2 â€” insert into `consent_snapshots`.
6. **Run existing AI flow unchanged** â€” OpenAI inference using image, description, ingredients; no new evidence persistence.
7. **Insert analyses compatibility row** with `scan_record_id` â€” extend current insert; preserve legacy fields.
8. **Return current normalized AI JSON response unchanged** â€” same response shape as today.

### Difference from earlier conceptual order

Earlier transitional mapping documents (e.g., **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SLICE_1_TECHNICAL_DESIGN_V1.md**) described Consent Snapshot **before** Scan Record V2 at the conceptual governance level.

The **implemented schema** requires `consent_snapshots.scan_record_id NOT NULL` with a foreign key to `scan_records`. Therefore, code must:

1. Create **Scan Record V2 first**
2. Create **Consent Snapshot immediately after**, referencing the new `scan_record_id`

**Architectural invariant unchanged:** AI reasoning must **not** run until **both** Scan Record V2 and Consent Snapshot exist. Steps 4â€“5 complete before step 6. The reordering is a schema constraint, not a weakening of evidence-first governance.

---

## Consent Scope Mapping

Slice 1 maps existing two-checkbox UI inputs to Phase 1 consent scope identifiers defined in **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

### `consentMedical = true` maps to:

- `cosmetic_analysis_acknowledgement`

### `consentPrivacy = true` maps to:

- `image_processing_consent`
- `description_processing_consent`
- `evidence_storage_consent`
- `reasoning_consent`
- `retention_tracking_consent`

### Implementation notes

- The resolved scopes are stored as a **JSON array** on `consent_snapshots.consent_scopes` (schema constraint: array type).
- This is **transitional mapping** from the current two-checkbox UI. It does not introduce granular consent UI.
- Legacy `consent_medical` and `consent_privacy` booleans continue to be written on `analyses` for compatibility reads.
- **No UI changes in Slice 1.** More granular consent UI may come in a later slice.
- Optional `capture_source` (e.g., `web_scan`) may be set on Consent Snapshot for audit context.

---

## Failure Handling Design

Current behavior (audit): Supabase insert failure is logged but API still returns **200** with AI JSON. Dual-write must improve evidence integrity while preserving response shape where possible.

### If Scan Record creation fails

- **Stop** â€” do not proceed to Consent Snapshot, AI, or analyses.
- **Do not run AI** â€” no OpenAI call; avoids reasoning without governed session anchor.
- **Return server error** â€” e.g., 500 with generic error message; do not return AI result.

### If Consent Snapshot creation fails

- **Do not run AI** â€” consent governance incomplete.
- **Optionally mark Scan Record as excluded** â€” set `scan_records.status = 'excluded'` on the orphaned session row, or leave as `active` with explicit logging; preferred Slice 1 posture: **update to `excluded`** when snapshot insert fails, to signal incomplete capture without deleting the row (append-only; no DELETE).
- **Return server error** â€” do not write analyses.
- **Do not write analyses** compatibility row.

### If AI call fails

**Chosen behavior:** Scan Record V2 and Consent Snapshot **remain** as evidence of an attempted capture with valid consent at initiation. No analyses row is written.

| Outcome | Rationale |
|---------|-----------|
| Evidence rows retained | Proves consent-valid capture was initiated; supports future audit and optional retry/governance |
| No analyses row | Current UI/history depends on `analyses`; incomplete sessions should not appear as saved scans |
| Return server error | User should not receive a success response implying a saved history entry |

Alternative (compensating delete of evidence rows) is **not** preferred in Slice 1 â€” it would exercise cascade-sensitive FK paths (P1-1) and contradict append-oriented semantics.

### If analyses insert fails after evidence rows exist

**Chosen behavior:** Return **error**, not success with AI JSON alone.

| Rule | Rationale |
|------|-----------|
| API must **not** claim saved success | Current dashboard/history depend on `analyses` rows; returning 200 without a compatibility row would mislead the UI |
| Do **not** silently orphan evidence | Scan Record + Consent Snapshot without `analyses` linkage is acceptable for audit, but the client must know persistence failed |
| Log failure stage and IDs | `scan_record_id`, optional `consent_snapshot_id`; enables manual reconciliation |
| Response | 500 (or 503) with generic error; **do not** expose internal IDs to frontend in Slice 1 |

This is a **behavior change** from current code (which returns 200 on insert failure). It is required for dual-write integrity and must be accepted before implementation.

Evidence rows left without analyses are **orphaned but intentional** â€” preferable to false success. A future reconciliation or retry slice may address cleanup; Slice 1 does not implement deletion.

---

## Transaction / Atomicity Strategy

The current scan route performs a **single** Supabase insert into `analyses`. Dual-write introduces **three** independent inserts: `scan_records`, `consent_snapshots`, `analyses`.

| Concern | Slice 1 posture |
|---------|-----------------|
| **True DB transaction** | Not implemented in Slice 1 unless separately authorized. Would require Postgres RPC or server-side function wrapping all inserts. |
| **Preferred approach** | Sequential inserts with **explicit failure handling** at each stage (see Failure Handling Design). |
| **Orphan minimization** | Fail fast before AI; mark session `excluded` on Consent Snapshot failure; never DELETE `scan_records`. |
| **Logging** | Log stage, IDs, and Supabase error codes on every failure. |
| **Future improvement** | Introduce Postgres RPC for atomic write of scan_records + consent_snapshots + analyses in a later slice after dual-write is validated. |

Service-role client (current pattern) bypasses RLS on all three targets, consistent with existing `analyses` writes and verified migration posture.

---

## analyses Compatibility Behavior

`analyses` remains the **current read model** for dashboard and history. Dual-write extends the insert; it does not change read paths.

| Field / concern | Slice 1 behavior |
|-----------------|------------------|
| **`analyses.result`** | Continues storing normalized AI JSON (unchanged) |
| **`analyses.confidence`** | Continues storing AI output confidence from normalized response (not Evidence Confidence Posture) |
| **`analyses.scan_record_id`** | Populated for **new** post-dual-write captures; links to `scan_records.id` |
| **`analyses.consent_medical`** | Continue writing `true` when gate passes (legacy compatibility) |
| **`analyses.consent_privacy`** | Continue writing `true` when gate passes (legacy compatibility) |
| **`analyses.model`** | Unchanged (`gpt-4o-mini`) |
| **`analyses.user_email`** | Unchanged |
| **Legacy rows** | Pre-Slice-1 rows retain `scan_record_id = null`; no backfill |

`analyses` is **non-authoritative** for Evidence Layer session and consent truth. Authoritative consent lives on `consent_snapshots`; session anchor on `scan_records`.

FK note: `analyses.scan_record_id` references `scan_records` with `ON DELETE SET NULL`. Slice 1 code must not DELETE `scan_records`, so this FK is not exercised.

---

## P1-1 Resolution: ON DELETE CASCADE Risk

**Issue:** `consent_snapshots.scan_record_id` â†’ `scan_records.id` uses `ON DELETE CASCADE`. Deleting a scan record would silently delete its Consent Snapshot, conflicting with **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** (Consent Snapshot should retain governance metadata; deletion is tombstone/exclusion, not silent cascade).

**Slice 1 dual-write rules:**

| Rule | Detail |
|------|--------|
| **No DELETE on `scan_records`** | Slice 1 code must not implement any path that deletes `scan_records` rows. |
| **No deletion workflow** | Deletion/retention governance is out of scope; no user-facing or admin delete. |
| **Append-only sessions** | Treat `scan_records` as insert-only for Slice 1; `status = 'excluded'` is the only permitted state mutation (Consent Snapshot failure handling). |
| **CASCADE not exercised** | With no deletes, `ON DELETE CASCADE` on `consent_snapshots` is dormant. |
| **Future reconciliation** | A deletion governance slice must reconcile FK behavior (consider `ON DELETE RESTRICT` or tombstone-only flow) **before** any delete path exists. |
| **No schema change in this design** | FK behavior is documented and mitigated in code only; migration changes deferred. |

---

## P1-2 Resolution: Consent Snapshot Immutability

**Issue:** No database triggers or policies prevent UPDATE/DELETE on `consent_snapshots`.

**Slice 1 dual-write rules:**

| Rule | Detail |
|------|--------|
| **Insert-only** | Code must only INSERT into `consent_snapshots`; no UPDATE or DELETE statements. |
| **Application-layer enforcement** | Immutability is enforced in application code in Slice 1; not delegated to DB triggers. |
| **Future hardening** | Database-level immutability (trigger, REVOKE UPDATE/DELETE) may be added in a later slice. |
| **Consent state changes** | Any future change to user consent must create a **new governance event** (new capture session with new snapshot), not mutate an existing snapshot. |
| **Withdrawal** | Per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, withdrawal affects future eligibility; it does not rewrite historical snapshots. |

---

## Logging / Observability

Recommend structured server logging on the dual-write path:

| Log field | When |
|-----------|------|
| `scan_record_id` | After successful Scan Record V2 insert; on downstream failures |
| `consent_snapshot_id` | After successful Consent Snapshot insert |
| `analyses_id` | After successful analyses insert (if returned by Supabase) |
| `failure_stage` | On any failure: `scan_record`, `consent_snapshot`, `ai`, `analyses` |
| Supabase error code/message | On insert failures |

**Never log:**

- Image base64 or data URLs
- Full user description text (may log length or presence only)
- Raw OpenAI request payloads containing image data

Rate-limit and auth failures continue existing logging patterns.

---

## API Response Shape

| Rule | Detail |
|------|--------|
| **Response JSON unchanged** | Same normalized fields: `intro`, `assessment`, `top5`, `next_steps`, `confidence`, `medical_disclaimer` |
| **No new fields in Slice 1** | Do not expose `scan_record_id`, `consent_snapshot_id`, or scope arrays to the frontend unless explicitly approved in a separate decision |
| **Success semantics** | 200 only when full dual-write path succeeds (including analyses insert) â€” see Failure Handling Design |
| **Dashboard/history** | Unchanged; continue reading `analyses` by `user_email` |

---

## Acceptance Criteria Before Implementation

All criteria must pass before any code change to `app/api/scan/route.ts`:

| # | Criterion |
|---|-----------|
| 1 | This dual-write design reviewed and accepted by product and architecture |
| 2 | P1-1 (CASCADE risk) acknowledged and addressed in design |
| 3 | P1-2 (consent immutability) acknowledged and addressed in design |
| 4 | Exact Cursor implementation prompt prepared for `app/api/scan/route.ts` only |
| 5 | No UI change scope confirmed |
| 6 | No API response shape change confirmed (field list unchanged; error-on-failed-persist is accepted) |
| 7 | Failure behavior accepted â€” especially analyses-insert failure returns error, not silent 200 |
| 8 | No deletion paths added to Slice 1 code |
| 9 | No consent snapshot UPDATE/DELETE paths added to Slice 1 code |
| 10 | Schema migration verified live per **docs/PHASE_1_SLICE_1_MIGRATION_EXECUTION_REPORT_V1.md** |

---

## Recommended Next Step

**Create a Cursor implementation prompt** for `app/api/scan/route.ts` dual-write only.

Implementation constraints for that prompt:

| Constraint | Detail |
|------------|--------|
| **Minimal diff** | One file only if possible (`app/api/scan/route.ts`) |
| **No UI changes** | Do not modify dashboard, history, or capture components |
| **No SQL / Supabase migration** | Schema already applied |
| **Review before commit** | Diff must be reviewed against this design before merge |

The implementation prompt should reference this document, the write order, consent scope mapping, failure handling decisions, and P1 mitigations explicitly.

---

## Current Decision

**This document designs the Phase 1 Slice 1 dual-write code slice only. It does not implement it.**

Acceptance means product and architecture agree on write order, consent mapping, failure handling, transactional posture, analyses compatibility behavior, and GLM P1 mitigations â€” but it does **not** authorize:

- Application code changes
- Supabase schema changes
- API response field additions
- UI changes
- Deletion, correction, or evidence confidence implementation

Implementation requires separate sign-off after this design is accepted and an implementation prompt is prepared.

