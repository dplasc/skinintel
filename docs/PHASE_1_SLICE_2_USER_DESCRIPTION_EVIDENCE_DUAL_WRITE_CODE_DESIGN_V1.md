# Phase 1 Slice 2 — User Description Evidence Dual-Write Code Design V1

## Purpose

This document designs the **future application code change** for Phase 1 Slice 2: persisting user-provided scan description as governed **User Description Evidence** (`user_description_evidence`) alongside the verified Slice 1 dual-write path in **`app/api/scan/route.ts`**.

It defines write ordering, description normalization, consent gating, failure handling, and the **GLM audit P1-2** remediation (JSON parse false-success) before any implementation is authorized.

Sources: **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_MIGRATION_PLAN_V1.md**, **app/api/scan/route.ts**.

This is **code design only**. It does not authorize application changes, migration files, SQL execution, API contract changes, or UI changes.

| Attribute | Value |
|-----------|-------|
| **Target file** | `app/api/scan/route.ts` |
| **Frontend changes** | None |
| **API response shape on success** | Unchanged |

---

## Current Route Behavior

Post–Slice 1, `app/api/scan/route.ts` performs:

| Step | Action |
|------|--------|
| 1 | Auth and rate-limit check; reject 401/429 |
| 2 | Validate `consentMedical` and `consentPrivacy` are `"true"`; reject 403 |
| 3 | Validate image; reject 400/413 |
| 4 | Insert **`scan_records`** (Scan Record V2) |
| 5 | Resolve consent scopes via `resolveConsentScopes()`; insert **`consent_snapshots`** linked to `scan_record_id` |
| 6 | Read `description` from FormData; build image payload |
| 7 | Call OpenAI with description in prompt (description not persisted server-side) |
| 8 | On successful JSON parse: insert **`analyses`** with `scan_record_id`; return normalized AI JSON (200) |
| 9 | On JSON parse failure: empty `catch {}` falls through to a **200 fallback response without `analyses` insert** |

**Gap:** User description is consumed by AI and discarded. **Defect (P1-2):** Step 9 returns success without a compatibility row — false-positive saved capture from the client perspective.

---

## Target Write Order

Future implementation in **`app/api/scan/route.ts`** extends Slice 1 with one insert step and one integrity fix. Steps 1–3 and 5–6 preserve Slice 1 behavior.

| Step | Action |
|------|--------|
| **1** | Auth, rate limit, legacy consent validation — unchanged |
| **2** | **`scan_records` insert** — unchanged (Slice 1) |
| **3** | **`consent_snapshots` insert** — unchanged (Slice 1); AI must not run until steps 2–3 succeed |
| **4** | **`user_description_evidence` insert** — **only if** description is non-empty **and** `description_processing_consent` is in resolved consent scopes; insert **after** steps 2–3, **before** AI analysis |
| **5** | **AI analysis** — existing OpenAI flow unchanged; description remains prompt input |
| **6** | **`analyses` compatibility insert** — unchanged except existing `scan_record_id` linkage |
| **7** | Return normalized AI JSON — unchanged response shape on success |

**Empty description path:** Steps 2–3 → skip step 4 → steps 5–7. Equivalent to current Slice 1 for captures without description text.

**Schema dependency:** `consent_snapshots` requires `scan_record_id` FK; `user_description_evidence` requires `scan_record_id` FK. Physical order `scan_records` → `consent_snapshots` → `user_description_evidence` is mandatory.

---

## Description Normalization Rule

Before step 4 evaluation and before AI prompt assembly:

| Rule | Requirement |
|------|-------------|
| **Coerce input** | Resolve FormData `description` to a string (same coercion pattern as `ingredients`) |
| **Non-empty test** | `description.trim().length > 0` — whitespace-only is treated as absent; **no row inserted** |
| **`original_text` content** | Store the **submitted user description text** as provided after string coercion — **not** AI summary, paraphrase, or normalized symptom taxonomy |
| **Skip when absent** | If non-empty test fails, skip step 4 entirely; continue steps 5–7 |
| **DB alignment** | Insert only when `original_text` satisfies SQL Draft non-empty check: `char_length(btrim(original_text)) > 0` |

**Prohibited:** Writing AI output, platform-generated summary, or diagnostic/recommendation content into `original_text`.

---

## Consent Gate

User Description Evidence persistence is consent-gated per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

| Rule | Behavior |
|------|----------|
| **Active scope required** | Insert step 4 only when `description_processing_consent` is present in `consentScopes` resolved at step 3 |
| **Transitional mapping** | Current `consentPrivacy = true` includes `description_processing_consent` via `resolveConsentScopes()` — no new consent UI |
| **Empty description** | No `user_description_evidence` row; consent scope not invoked for storage |
| **Description present, consent absent** | Must not persist description, must not run AI, must not write `analyses` — blocked at step 1 (current route requires `consentPrivacy = true`, which includes the scope; future granular UI must preserve this invariant) |
| **Consent provenance** | Inherited via `scan_record_id` → `consent_snapshots`; no `consent_snapshot_id` column on evidence row (per SQL Draft) |

### Proposed insert payload (step 4)

| Field | Value |
|-------|-------|
| `scan_record_id` | From step 2 |
| `user_email` | Session email (Slice 1 pattern) |
| `original_text` | Normalized user description per rules above |
| `capture_source` | `'web_scan'` |
| `evidence_status` | `'active'` (default; omit if DB default applies) |

Service-role Supabase client (current pattern); insert-only — no UPDATE/DELETE on `user_description_evidence` in Slice 2.

---

## Failure Behavior

### If `user_description_evidence` insert fails (description non-empty and consented)

| Rule | Behavior |
|------|----------|
| **Stop before AI** | Do **not** call OpenAI |
| **No false success** | Do **not** return 200 with AI JSON |
| **Safe server error** | Return generic 500 (`{ error: "Internal server error" }`) |
| **No analyses row** | Do **not** insert `analyses` compatibility row |
| **Session rows** | Existing `scan_records` and `consent_snapshots` from steps 2–3 may remain (append-oriented; optional `scan_records.status = 'excluded'` per Slice 1 failure pattern — preferred over DELETE) |
| **Logging** | Log `failure_stage=user_description_evidence`, `scan_record_id`, Supabase error; do **not** log full `original_text` |

### If description absent (or whitespace-only)

Step 4 skipped. Slice 1 failure rules apply for steps 2–3, 5–7.

### If AI call fails after evidence persisted (when step 4 ran)

Slice 1 rules unchanged: governed session (+ description evidence when present) may remain; no `analyses` row; return 500; user must not receive success implying saved history entry.

### If `analyses` insert fails after AI succeeds

Slice 1 rules unchanged: return 500; do not return 200 with AI JSON alone.

---

## JSON Parse False-Success Fix

### GLM audit P1-2 finding

**P1-2 (scan route integrity):** When OpenAI returns non-parseable JSON, the current route executes an empty `catch {}` and returns **HTTP 200** with a synthetic fallback payload **without** inserting an `analyses` row. The client receives a success response implying a saved capture; dashboard/history depend on `analyses` and will not show the session. This is a **false-success** defect independent of evidence persistence and is called out in **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_MIGRATION_PLAN_V1.md** as a pre-existing risk that Slice 2 code design must close before dual-write deploy.

### Required code behavior

| Rule | Requirement |
|------|-------------|
| **Remove false-success path** | Delete the post-`catch` fallback that returns 200 without `analyses` insert |
| **Parse failure = server error** | On `JSON.parse` failure (or unrecoverable normalization failure), return **500** with generic error message |
| **No analyses row** | Do not insert `analyses` when parse fails |
| **No success semantics** | Do not return normalized or synthetic AI JSON on 200 unless `analyses` insert succeeded |
| **Logging** | Log `failure_stage=ai_json_parse`, `scan_record_id`; do not log raw AI payload at info level |

Governed rows from steps 2–4 (when present) may remain for audit; orphaned sessions without `analyses` are acceptable and preferable to false success.

---

## Success Response Behavior

| Rule | Detail |
|------|--------|
| **HTTP 200** | Only when full path succeeds: steps 2–3, optional 4, AI parse, step 6 `analyses` insert |
| **Response body** | Unchanged normalized fields: `intro`, `assessment`, `top5`, `next_steps`, `confidence`, `medical_disclaimer` |
| **No new fields** | Do not expose `scan_record_id`, `consent_snapshot_id`, evidence IDs, or `user_description_evidence` content |
| **Frontend** | No changes; client contract unchanged on success |
| **Error responses** | Generic 500 for persistence/parse failures; existing 401/403/400/413/429 unchanged |

---

## Read Path Behavior

| Concern | Slice 2 behavior |
|---------|------------------|
| **Dashboard** | Continues reading `analyses` only — unchanged |
| **History** | Continues reading `analyses` only — unchanged |
| **localStorage** | Unchanged; remains non-authoritative device cache |
| **`user_description_evidence`** | Write-only foundation; **not returned to frontend**; not queried by current application read paths |
| **Read-path cutover** | **Out of scope** — deferred to future slice |
| **UI** | No new fields, views, or description display from evidence store |

Post-deploy verification must query `user_description_evidence` directly in Supabase; `analyses` row presence does not prove description evidence exists.

---

## Explicit Non-Goals

Slice 2 dual-write code design explicitly excludes:

| Excluded | Reason |
|----------|--------|
| **Frontend / UI changes** | Capture form, dashboard, history unchanged |
| **API response shape changes on success** | Client contract frozen |
| **Read-path cutover from `analyses`** | Compatibility read model remains authoritative |
| **Product Intelligence** | Separate Intelligence Layer slice |
| **Image Evidence** | Binary storage deferred |
| **Product / Routine Mention Evidence** | Future slices |
| **Correction Event storage or UX** | Design-compatible only |
| **Deletion/retention workflow** | Deferred |
| **Evidence Confidence Posture storage** | Deferred |
| **AI Analysis Result separation** | `analyses.result` remains mixed artifact |
| **Legacy backfill** | Prior discarded descriptions not retroactively persisted |
| **Migration files / SQL execution** | Separate gated artifacts |
| **Files other than `app/api/scan/route.ts`** | Minimal diff scope |

---

## Implementation Gates

No Slice 2 code change may begin until all gates pass:

| Gate | Requirement |
|------|-------------|
| **Slice 2 plan accepted** | **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md** |
| **Slice 2 technical design accepted** | **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md** |
| **SQL draft accepted** | **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_SQL_DRAFT_V1.md** |
| **Migration applied** | **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_MIGRATION_PLAN_V1.md** — `user_description_evidence` table live in target environment |
| **This code design accepted** | Write order, consent gate, failure rules, P1-2 fix signed off |
| **GLM audit accepted** | Read-only audit of SQL draft + this design — no P0 blockers; P1-2 remediation acknowledged |
| **Diff review before merge** | Implementation PR matches accepted design; no scope creep |
| **Production verification after deploy** | Row counts, `scan_record_id` linkage, `original_text` integrity, empty-description skip, inherited consent join |

This document closes the **code design** gate only. It does not authorize implementation.

---

## Current Decision

**Phase 1 Slice 2 User Description Evidence dual-write code design is defined for review only.**

Target implementation: **`app/api/scan/route.ts`** only — insert `user_description_evidence` after `scan_records` and `consent_snapshots`, before AI when `description.trim().length > 0`, preserve submitted text in `original_text`, fail closed on evidence insert or AI JSON parse failure, and leave success response shape, dashboard, history, and localStorage unchanged.

This document does **not** authorize:

- Application code changes
- Migration file creation or Supabase execution
- API contract or response field changes on success
- UI or frontend changes
- Read-path cutover from `analyses`
- Image Evidence, Product Intelligence, or legacy backfill

**Next step:** Review and commit this design, complete GLM audit acceptance, then prepare a gated implementation prompt for `app/api/scan/route.ts` after migration is applied.
