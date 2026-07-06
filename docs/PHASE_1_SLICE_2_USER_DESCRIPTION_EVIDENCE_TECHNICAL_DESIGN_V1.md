# Phase 1 Slice 2 — User Description Evidence Technical Design V1

## Purpose

This document translates the accepted **Phase 1 Slice 2 plan** from **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md** into a **technical design** for persisting user-provided scan description as governed User Description Evidence linked to Scan Record V2.

It defines conceptual persistence design, transitional write/read behavior, consent and failure rules, and boundary constraints. It derives from accepted Phase 1 planning artifacts for evidence boundaries, schema direction, consent, deletion, correction, confidence, and transitional mapping.

This is **design only**. It does **not** authorize SQL, migration execution, application code, API contract changes, UI changes, or read-path cutover.

Sources: **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**.

---

## Design Objective

**Target:** Persist the user's scan description as **User Description Evidence** — user-origin governed evidence that preserves **original user text** and links to the **Scan Record V2** session anchor created in Slice 1.

| Objective | Definition |
|-----------|------------|
| **What is persisted** | User-provided description text submitted at capture time — verbatim user voice, not AI output. |
| **When it is persisted** | Only when non-empty description text is present and `description_processing_consent` is active in the session Consent Snapshot. |
| **Where authority resides** | `user_description_evidence` (Evidence Content Store) is authoritative for user-origin description text; `analyses` remains compatibility/read model. |
| **What stays unchanged** | AI analysis flow, API response shape on success, dashboard/history read paths, and capture UI. |

This slice closes the documented gap where description text is consumed by AI and discarded server-side (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**). It does not separate AI Analysis Result, implement correction/deletion workflows, or expose description evidence to the client.

---

## Proposed Evidence Store

**Conceptual persistence object:** `user_description_evidence`

**Store group:** Evidence Content Stores per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

**Relationship:** Each row links to exactly one Scan Record V2 (`scan_records`) for the capture session. At most one User Description Evidence row per scan session in Slice 2 (one description field per capture).

**RLS posture (conceptual):** Consistent with Slice 1 — users may read own evidence via SELECT policy; service-role writes for scan route; no client INSERT/UPDATE/DELETE policies in Slice 2.

### Conceptual fields (not DDL)

| Field | Purpose |
|-------|---------|
| **`id`** | Stable identifier for the User Description Evidence record. |
| **`scan_record_id`** | Required link to parent Scan Record V2 session anchor. |
| **`user_email`** (or canonical owner reference) | User ownership for RLS and audit; aligns with Slice 1 `scan_records.user_email` pattern until auth user id migration is separately authorized. |
| **`original_text`** | **User-origin description text only** — preserved as submitted at capture; not AI summary, paraphrase, or normalized symptom taxonomy. |
| **`capture_source`** | Provenance of capture channel (e.g., `web_scan`); consistent with Consent Snapshot capture source semantics. |
| **`consent_snapshot_id`** (or inherited consent relationship) | Direct reference to session Consent Snapshot, **or** consent provenance inherited exclusively via `scan_record_id` + session snapshot linkage — physical choice deferred to SQL draft; audit must prove `description_processing_consent` was active at capture. |
| **`evidence_status`** | Lifecycle state for governed evidence (e.g., `active`, `excluded`) — supports future deletion/tombstone semantics without edit-in-place of `original_text`. |
| **`created_at`** | Evidence creation timestamp; capture-time semantics; immutable after insert. |
| **Optional future references (not populated in Slice 2)** | Placeholder linkage for Correction Event chain, deletion/retention tombstone metadata, Evidence Confidence Posture attachment — design-compatible only; no storage or resolution logic in this slice. |

**Does not store:** AI summaries, diagnostic labels, recommendations, structured symptom identifiers, product mentions, routine mentions, or Intelligence Layer output.

**Does not extend `analyses`:** User description text must not be added to `analyses` columns or embedded JSON as the canonical description store (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**).

---

## Write Order

Intended future write sequence in `app/api/scan/route.ts`, extending verified Slice 1 dual-write. Steps 1–3 and 5–6 preserve Slice 1 behavior; step 4 is the Slice 2 addition.

| Step | Action |
|------|--------|
| **1** | **Auth and consent validation** — reject unauthenticated requests; validate legacy consent inputs; resolve Phase 1 consent scopes. Block capture if required scopes missing. |
| **2** | **`scan_records` creation** — insert Scan Record V2 session anchor (Slice 1). |
| **3** | **`consent_snapshots` creation** — insert Consent Snapshot linked to `scan_record_id` (Slice 1). AI must not run until steps 2–3 succeed. |
| **4** | **`user_description_evidence` creation** — **only if** description text is non-empty **and** `description_processing_consent` is in active consent scopes. Insert row with `original_text` and session linkage. **Skip** if description is empty — no evidence row, flow continues. |
| **5** | **AI analysis** — existing OpenAI flow unchanged; description remains available as prompt input and as governed evidence when step 4 ran. |
| **6** | **`analyses` compatibility row** — existing insert with `scan_record_id` linkage unchanged; legacy fields preserved; response shape unchanged. |

**Schema note:** `consent_snapshots` requires `scan_record_id` FK; Scan Record V2 precedes Consent Snapshot at the physical layer, consistent with implemented Slice 1 code (**docs/PHASE_1_SLICE_1_DUAL_WRITE_CODE_DESIGN_V1.md**). Conceptual governance invariant unchanged: consent and session anchor exist before AI reasoning.

**Empty description path:** Steps 2–3 → skip step 4 → steps 5–6. Behavior equivalent to current Slice 1 for captures without description text.

---

## Consent Behavior

User Description Evidence persistence is **consent-gated** per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

| Rule | Behavior |
|------|----------|
| **No consent, no persistence** | Description text must **not** be persisted without valid `description_processing_consent` in the session Consent Snapshot. |
| **Empty description** | No `user_description_evidence` row is created. Optional field; scope not invoked for storage when text absent. |
| **Consent Snapshot anchors permission** | Capture-time scopes are immutable record of authorization; evidence inherits session consent linkage. |
| **Transitional mapping** | Current `consentPrivacy = true` maps to `description_processing_consent` among other scopes (Slice 1 mapping); no new consent UI in Slice 2. |
| **No marketing/commercial reuse** | Consent scopes authorize personal cosmetic analysis and evidence storage only — not marketing segmentation, commercial profiling, or third-party data exploitation (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** Phase 1 Rules). |
| **Withdrawal is forward-looking** | Post-capture consent withdrawal does not mutate Consent Snapshot or rewrite stored `original_text`; future eligibility governed separately. |

If description text is present but `description_processing_consent` is not active, capture must be **blocked** at step 1 — do not persist description, do not run AI, do not write compatibility row.

---

## Failure Behavior

Slice 2 strengthens evidence integrity for description persistence. Failure rules extend Slice 1 dual-write posture.

### If `user_description_evidence` insert fails (description present and consented)

| Rule | Behavior |
|------|----------|
| **Stop before AI** | Do **not** proceed to OpenAI analysis. |
| **No false success** | Do **not** return a successful saved-analysis response implying a complete governed capture. |
| **Safe server error** | Return generic server error (e.g., 500); no AI JSON in success response. |
| **No partial compatibility row** | Do **not** write `analyses` compatibility row when description was present, consented, and evidence insert failed. |
| **Session rows** | Existing `scan_records` and `consent_snapshots` rows from steps 2–3 may remain (append-oriented; mark session `excluded` per Slice 1 failure pattern — preferred over cascade delete). |

### If description absent

Step 4 skipped; Slice 1 failure rules apply for steps 2–3, 5–6. No User Description Evidence row expected.

### If AI or `analyses` insert fails after evidence persisted

Slice 1 rules unchanged: governed session (+ description evidence when present) may remain; no compatibility row; return server error; user must not receive success implying saved history entry.

### Success path

**No frontend response shape changes on success** — normalized AI JSON returned unchanged; dashboard/history unaffected.

---

## Read Path Behavior

| Concern | Slice 2 behavior |
|---------|------------------|
| **Dashboard** | Continues reading `analyses` only — unchanged. |
| **History list/detail** | Continues reading `analyses` only — unchanged. |
| **UI** | No new fields, views, or description display from `user_description_evidence`. |
| **API response** | Success response shape unchanged; description evidence not exposed in response payload. |
| **Exposure** | `user_description_evidence` is **write-only foundation** in Slice 2 — persisted for Personal Evidence Base; not queried by current application read paths. |
| **Read-path cutover** | **Out of scope** — evidence-first reads deferred to future slice. |
| **localStorage** | Remains non-authoritative device cache; no governance changes. |

Compatibility row must not be treated as proof that User Description Evidence exists; engineering verification must query governed store directly post-deploy.

---

## Boundary Rules

Binding constraints from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**:

| Rule | Requirement |
|------|-------------|
| **Original user text only** | `original_text` stores user-submitted narrative at capture — user-origin attestation. |
| **No AI summary** | AI may consume description for reasoning; it must not replace or overwrite User Description Evidence with paraphrase or platform-generated summary. |
| **No diagnosis** | No disease labels, clinical framing, or treatment-directed classification in this object. |
| **No recommendation** | Guidance and action prescriptions belong to Intelligence Layer artifacts — not evidence content. |
| **No symptom taxonomy resolution** | Structured cosmetic signals belong in Symptom Observation Evidence (future slice) — not embedded in User Description Evidence. |
| **No product/routine mention extraction** | Product Mention Evidence and Routine Mention Evidence are separate objects (future slices) — do not parse or store mentions inside `user_description_evidence`. |
| **No prohibited merges** | User Description Evidence must not collapse into `analyses.result`, AI Analysis Result, or Consent Snapshot content. |

---

## Deletion / Correction / Confidence Compatibility

Slice 2 **designs for future governance** only. None of the following are implemented in this slice.

### Deletion / retention (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**)

- Deletion may **remove `original_text`** while retaining tombstone metadata (`evidence_status`, deletion marker).
- Deleted description evidence must be **excluded from personalization and learning**.
- Deletion must propagate to compatibility surfaces — `analyses` must not retain recoverable description in embedded JSON.
- Consent Snapshot remains immutable governance record.

### Correction (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**)

- User Description Evidence is **correctable** — qualify, supersede, clarify, retract, dispute.
- Corrections are **append-oriented** — no in-place edit of historical `original_text`.
- Supersession resolves authoritative description via correction chain, not latest row timestamp alone.

### Evidence Confidence Posture (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**)

- Applicable dimensions: `user_attestation_strength`, `input_completeness`, `source_reliability`, `correction_status`, `deletion_or_retention_status`.
- Posture is **input quality** — distinct from `analyses.confidence` (AI output certainty).
- Posture storage and assignment deferred; `evidence_status` and optional future reference fields remain design-compatible.

---

## Implementation Gates

No Slice 2 engineering work may begin until all gates pass:

| Gate | Requirement |
|------|-------------|
| **Slice 2 plan accepted** | **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md** committed and reviewed. |
| **This technical design accepted** | Scope, store design, write order, failure rules, and boundaries signed off. |
| **GLM audit accepted** | Read-only architecture audit of this design + downstream SQL/code artifacts — no P0 blockers. |
| **SQL draft accepted** | Conceptual-to-physical mapping for `user_description_evidence` — no execution implied. |
| **Migration plan accepted** | Forward migration, verification queries, rollback posture — separate artifact. |
| **Code design accepted** | Dual-write extension design for `app/api/scan/route.ts` — failure handling, consent gating, no response change. |
| **Diff review before commit** | Implementation PR reviewed against accepted design; no scope creep. |
| **Production verification after deploy** | Post-deploy read-only Supabase verification — row counts, linkage, `original_text` integrity, empty-description skip behavior. |

This document closes **technical design** gate only. It does not close SQL, migration, code, or production verification gates.

---

## Current Decision

**Phase 1 Slice 2 User Description Evidence technical design is defined for review only.**

This document does **not** authorize:

- SQL or DDL execution
- Supabase migrations
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes
- Read-path cutover from `analyses`
- Legacy backfill of prior scan descriptions

**User Description Evidence preserves original user text, links to Scan Record V2, and is user-origin evidence — not AI summary, diagnosis, or recommendation.**

Next step: review and commit this design, then create gated SQL draft, migration plan, and code design documents — or handoff to a new chat for those artifacts.
