# Phase 1 Slice 5 Technical Design — AI Analysis Evidence

## Status

**Design draft for review.**

This document defines the **technical design boundary** for **Phase 1 Slice 5: AI Analysis Evidence** — the fifth incremental Evidence Layer persistence slice after Slices 1–4.

It translates **docs/PHASE_1_SLICE_5_PLAN.md** into object definition, conceptual fields, consent rules, dual-write order, failure posture, boundary protections, read-path constraints, and verification requirements. It inherits binding constraints from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, and **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**.

This is a **technical design artifact only**. It does **not** authorize implementation, Supabase schema work, migrations, application code, API contract changes, or UI design.

---

## Object Definition

**AI Analysis Evidence** is an **Evidence Layer object** in the **Evidence Content Stores** group (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**). It stores the **normalized AI analysis output accepted by the application after response validation and normalization**, linked to Scan Record V2 as a governed inference-output evidence record.

### Primary responsibility

Record what the application accepted as the AI analysis result for a capture session — the same governed payload that downstream components consume — without elevating that output to canonical truth, diagnosis, Knowledge Layer content, or Intelligence Layer enrichment.

### What AI Analysis Evidence is

- **Application-accepted** — content is the validated, normalized analysis payload; not raw provider text
- **Linked to Scan Record V2** — child evidence of the governed capture session anchor; inherits session consent provenance via Consent Snapshot linkage
- **Append-oriented** — new inference runs create new evidence rows; supersession is a future governed workflow
- **Provenance-aware** — model and safe inference metadata may attach; full prompt archival is excluded

### What AI Analysis Evidence is not

| Concern | Status |
|---------|--------|
| **Raw provider response log** | Not — unvalidated provider payload is excluded |
| **Diagnosis or medical classification** | Not — cosmetic, educational scope only |
| **Knowledge Layer** | Not — no catalog resolution or canonical entity persistence |
| **Intelligence Layer artifact** | Not — no Product Intelligence, Ingredient Intelligence, or structured recommendation records |
| **UI read model** | Not — dashboard and history remain on `analyses` |
| **Replacement for `analyses`** | Not yet — compatibility row continues unchanged in Slice 5 |

AI Analysis Evidence records *what the application accepted from inference* — not what the platform declares clinically or catalogically true.

---

## Source Input

### Defined source

The **sole content source** for AI Analysis Evidence is the **accepted normalized analysis payload** produced after OpenAI response validation and normalization in the capture path.

This payload comprises the application-governed analysis structure — intro, assessment, top5, next_steps, confidence, medical_disclaimer — only after the capture path confirms the provider response satisfies required shape and content rules.

### Explicit exclusions from source derivation

| Excluded source | Reason |
|-----------------|--------|
| **Raw provider response** | Unvalidated text may be malformed, incomplete, or non-conformant; not governed application output |
| **Pre-validation provider text** | Fail-closed validation rejects invalid output before persistence |
| **Full system/user prompt** | Size, privacy, and secret-surface constraints |
| **Raw image bytes or data URLs** | Already governed by Image Evidence (Slice 3) |
| **Client-side scoring output** | Separate from server evidence persistence |
| **Catalog or entity enrichment** | Prohibited Knowledge Layer behavior |

The evidence store preserves the **same accepted payload** written to the compatibility read model and returned to the client — ensuring evidence authority aligns with downstream consumption without duplicating unvalidated provider artifacts.

---

## Conceptual Fields

The following are **conceptual fields only**. They describe the AI Analysis Evidence object for downstream migration and code design. They do **not** define database tables, column names, column types, indexes, or SQL.

| Field | Description |
|-------|-------------|
| **id** | Stable identifier for this AI Analysis Evidence record within the Personal Evidence Base |
| **scan_record_id** | Reference to parent Scan Record V2 — the governed capture session anchor for this inference output |
| **user_email** | User ownership reference for RLS; mirrors Slice 1–4 transitional pattern until auth user id migration is separately authorized |
| **normalized_result** | Application-accepted analysis payload after validation and normalization — intro, assessment, top5, next_steps, confidence, medical_disclaimer |
| **model_provider** | Inference provider identifier (e.g. OpenAI) at safe, non-secret level |
| **model_name** | Model identifier used for inference (e.g. gpt-4o-mini) |
| **response_schema_version** | Version marker for the accepted output schema shape — supports audit and future supersession without prompt archival |
| **evidence_status** | Lifecycle eligibility marker (`active` \| `excluded`); `excluded` reserved for future deletion/tombstone or supersession without in-place edit of `normalized_result` |
| **created_at** | Evidence creation timestamp; immutable after insert; aligned with inference acceptance time |
| **supersedes_evidence_id** *(optional future hook)* | Design-compatible reference to a prior AI Analysis Evidence row this record supersedes; not populated or enforced in Slice 5 |
| **provenance_metadata** *(optional safe metadata)* | Design-compatible container for non-secret inference audit fields — e.g. completion identifier, token usage summary, capture modality flags — without full prompt or raw provider payload |

No database column types, constraints, or physical storage layout are defined in this document.

---

## Consent Behavior

AI Analysis Evidence persistence requires a **valid Scan Record V2** and **Consent Snapshot** already established for the capture session, with session-level consent scopes that authorize inference and storage.

### Primary gates

| Scope | Role for AI Analysis Evidence |
|-------|-------------------------------|
| **`reasoning_consent`** | Authorizes AI inference and persistence of inference output as governed evidence |
| **`evidence_storage_consent`** | Authorizes server-side persistence of capture session and attached evidence in the Personal Evidence Base |
| **`cosmetic_analysis_acknowledgement`** | Mandatory for any scan session |
| **`retention_tracking_consent`** | Required for standard history/dashboard persistence posture |

Slice 5 does not introduce a separate AI-evidence-specific consent scope. Inference evidence persistence inherits the session Consent Snapshot created at capture initiation, consistent with Slices 1–4.

### Preconditions

Before AI Analysis Evidence may be written:

1. Scan Record V2 exists for the capture session
2. Consent Snapshot exists and is linked to that session
3. Slices 2–4 child evidence (when applicable) have been persisted under their respective consent gates
4. AI inference has completed and produced an **accepted normalized payload**

Consent Snapshot is immutable after creation. Withdrawal of current consent does not mutate historical snapshots. AI Analysis Evidence persisted under a valid snapshot retains capture-time authorization record regardless of subsequent consent changes (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).

### Inference output invalid

If provider response fails validation and normalization, no accepted payload exists. AI Analysis Evidence must not be written. The capture path fails before compatibility row write under existing fail-closed posture.

---

## Dual-Write Order

Slice 5 **extends** the established Slices 1–4 dual-write sequence. It adds AI Analysis Evidence persistence after inference without reordering prior steps.

The following is **conceptual design only** — not code, not transaction specification, not API contract.

| Step | Action |
|------|--------|
| **1** | **Scan Record V2** — create governed capture session anchor |
| **2** | **Consent Snapshot** — record immutable active consent scopes at capture initiation, linked to session |
| **3** | **User Description Evidence** — persist when description non-empty and consented (Slice 2) |
| **4** | **Image Evidence** — persist when image present and consented (Slice 3) |
| **5** | **Product Mention Evidence** — persist when mention text non-empty and consented (Slice 4) |
| **6** | **AI/OpenAI inference** — Intelligence Layer consumes capture inputs; governed input evidence already persisted |
| **7** | **AI Analysis Evidence** — persist accepted normalized analysis payload linked to session |
| **8** | **`analyses` compatibility row** — write transitional denormalized read model; non-authoritative for Evidence Layer concerns |

### Ordering principles

- **Input evidence before inference** — steps 1–5 establish governed capture evidence before step 6
- **Accepted output before compatibility** — step 7 must complete successfully before step 8 when fail-closed posture applies
- **Slice 5 adds step 7 only** — does not reorder or alter Slices 1–4 persistence semantics
- **Compatibility row is subordinate** — step 8 must not reverse write priority or become the sole authoritative store for inference output (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**)

Evidence Confidence Posture attachment remains deferred in Slice 5.

---

## Failure Behavior

Failure rules bind Slice 5 to fail-closed, evidence-first dual-write discipline established in Slices 1–4.

### AI inference or validation failure

| Condition | Behavior |
|-----------|----------|
| Provider error, timeout, or invalid response shape | **No AI Analysis Evidence row created** |
| Flow impact | **Fails closed** — compatibility row not written; capture request returns failure |

### AI Analysis Evidence persistence failure

| Condition | Behavior |
|-----------|----------|
| Accepted normalized payload exists but evidence persistence error | **Fail closed** |
| **`analyses` compatibility row** | **Not written** — persistence failure must abort before compatibility row write |
| Error surfacing | Capture request returns failure; **no silent drop** of governed output |
| Accepted payload | Must not be treated as durably persisted when evidence write fails |

Failure must occur **after** successful inference acceptance and **before** compatibility row write when AI Analysis Evidence persistence is required but fails.

### Orphan prevention

- **No orphan AI Analysis Evidence** — evidence rows must always link to a valid Scan Record V2 created in the same governed capture session
- **No evidence without consent linkage** — session Consent Snapshot must exist and authorize inference storage
- **No compatibility row implying evidence persistence** — compatibility surface must not suggest governed AI Analysis Evidence exists when it does not

### Slices 1–4 protection

Slice 5 failure or rollback must **not corrupt** existing Slice 1–4 evidence:

- Scan Record V2, Consent Snapshot, User Description Evidence, Image Evidence, and Product Mention Evidence integrity preserved
- Existing dual-write paths for session and child evidence remain semantically unchanged

---

## Boundary Protection

The following are **explicitly confirmed** as prohibited or unchanged in Slice 5 design and any downstream implementation authorized by later gates:

| Boundary | Slice 5 posture |
|----------|-----------------|
| **Not raw provider log** | Only application-accepted normalized payload persisted |
| **Not diagnosis** | No disease labeling, clinical taxonomy, or medical classification via evidence enrichment |
| **Not Knowledge Layer** | No catalog lookup, entity resolution, or canonical vocabulary on evidence records |
| **Not Intelligence Layer** | No Product Intelligence, Ingredient Intelligence, or structured recommendation record separation |
| **Not UI read model** | Dashboard and history unchanged; evidence store not client-exposed |
| **Not replacement for `analyses` yet** | Compatibility row continues with unchanged shape and read-path authority |
| **No prompt change** | System and user prompt content, rules, and output schema unchanged |
| **No response JSON change** | API response contract to the client unchanged |

Additional prohibited merges from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** remain binding:

- No extension of `analyses` as canonical AI evidence store
- No hardcoded consent booleans substituting for Consent Snapshot
- No edit-in-place correction — future supersession via governed workflow only
- No full prompt or raw image payload archival in AI Analysis Evidence

Any implementation crossing these boundaries fails architectural review regardless of delivery convenience.

---

## Read Path

Slice 5 is **write-only foundation**. No read-path cutover occurs.

| Surface | Slice 5 behavior |
|---------|------------------|
| **Dashboard** | **No change** — continues existing read behavior |
| **History list and detail** | **No change** — continues reading from `analyses` |
| **API response shape** | **No change** — scan response contract unchanged |
| **`analyses` compatibility row** | Remains transitional read model; not authoritative for AI Analysis Evidence |
| **AI Analysis Evidence store** | **Write-only in Slice 5** — persisted for Personal Evidence Base foundation; not exposed to client or Experience Layer |

### Transitional Hybrid posture

- Personal Evidence Base authority for inference-output concerns resides in governed AI Analysis Evidence store once implemented
- UI and API consumers must not assume compatibility row presence implies evidence-store persistence
- Direct database or audit queries are the verification read path for Slice 5 closure — not user-facing surfaces

Future read-path cutover to evidence-first presentation is explicitly out of Slice 5 scope.

---

## Verification Requirements

Future implementation closure requires verification equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**. The following checks define Slice 5 success criteria.

### Capture path verification

| Check | Expected outcome |
|-------|------------------|
| **Successful scan writes AI Analysis Evidence row** | New capture with valid inference produces evidence row in target environment |
| **Row links to `scan_record_id`** | Foreign key references correct parent Scan Record V2 for the capture session |
| **`normalized_result` matches accepted API result** | Evidence payload equals application-accepted analysis output — same content written to compatibility row and returned to client |
| **`analyses` row still written unchanged** | Compatibility row persists with existing shape, fields, and linkage |
| **Dashboard/history unaffected** | No regression in read surfaces; no new client queries against evidence store |
| **Slice 1–4 evidence unaffected** | Session, consent, description, image, and mention evidence dual-write paths unchanged |

### Boundary verification

| Check | Expected outcome |
|-------|------------------|
| **No raw provider payload** | Evidence store contains only validated normalized output |
| **No Knowledge Layer fields** | No catalog IDs, entity resolution, or enrichment metadata on evidence records |
| **No Intelligence Layer merge** | No Product Intelligence or Ingredient Intelligence artifacts introduced |
| **Consent audit** | Join AI Analysis Evidence → `scan_records` → `consent_snapshots` confirms `reasoning_consent` and storage scopes present when evidence persisted |

### Failure verification

| Check | Expected outcome |
|-------|------------------|
| **Evidence persistence failure** | Simulated write failure aborts before compatibility row; no silent drop |
| **Invalid AI response** | Validation failure produces no evidence row and no compatibility row |

Direct store verification — querying the evidence table directly — is required. Persistence must not be inferred from compatibility row presence alone.

---

## Implementation Gates

No SQL, migration execution, application code, or operational rollout may proceed until the following gated artifacts are **accepted**:

| Gate | Artifact | Requirement |
|------|----------|-------------|
| **Planning** | **docs/PHASE_1_SLICE_5_PLAN.md** | Accepted |
| **Technical design** | This document | Accepted |
| **Migration plan** | Slice 5 migration plan (separate artifact) | Accepted before any SQL |
| **Dual-write implementation plan** | Slice 5 dual-write implementation plan (separate artifact) | Accepted before code design |
| **Code audit** | Slice 5 dual-write code design and boundary audit (separate artifacts) | Accepted before application changes |

Additional prerequisites:

- Slices 1–4 operational in target environment
- **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md** accepted
- Slice 4 dual-write verification complete

This document satisfies **technical design definition** only. It does not close migration, dual-write implementation, code design, audit, or production verification gates.

---

## Current Decision

**Phase 1 Slice 5 — AI Analysis Evidence technical design is proposed for review.**

AI Analysis Evidence stores the normalized analysis output the application accepts after validation and normalization — not the raw provider response. It is linked to Scan Record V2, written after inference and before the compatibility row, and does not alter read paths, prompts, or response contracts.

Next step: review and acceptance of this document, then creation of gated migration plan, dual-write implementation plan, and code audit artifacts.
