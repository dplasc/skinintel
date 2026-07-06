# Phase 1 Slice 3 — Image Evidence Dual-Write Code Design V1

## Purpose

This document designs the **future application code change** for Phase 1 Slice 3: persisting user-uploaded scan images as governed **Image Evidence** (`image_evidence`) with coordinated **private object storage upload**, extending the verified Slice 1–2 dual-write path in **`app/api/scan/route.ts`**.

Image Evidence is the **first binary content evidence object** in the Personal Evidence Base. The code design closes the documented gap where uploaded images are transmitted to AI at inference and **discarded as governed evidence server-side** (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**). It records visual artifact reference and capture metadata linked to Scan Record V2—not AI observations, symptom classifications, or diagnostic content.

This document defines write ordering, storage upload posture, relational insert payload, consent gating, failure handling, AI execution boundaries, compatibility row behavior, logging, and verification intent. It derives from accepted Slice 3 planning, technical design, SQL draft, and migration plan artifacts.

This is **code design only**. It does not authorize application changes, migration execution, object storage configuration, API contract changes, or read-path cutover.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **app/api/scan/route.ts**.

| Attribute | Value |
|-----------|-------|
| **Document status** | Proposed draft only |
| **Code authorized** | No — no code authorized by this document |
| **Target file** | `app/api/scan/route.ts` |
| **Frontend changes** | None |
| **API response shape on success** | Unchanged |

---

## Target File

All Slice 3 dual-write changes are scoped to **`app/api/scan/route.ts`** only.

| Constraint | Requirement |
|------------|-------------|
| **Single write path** | Image Evidence persistence occurs only on the authenticated scan POST route |
| **Service-role client** | Preserve existing Supabase service-role pattern for evidence and storage writes |
| **No new routes** | No dedicated upload endpoint, signed-URL handoff, or client-direct storage writes in Slice 3 |
| **No new modules required** | Storage upload and evidence insert logic may be inline or extracted to a local helper within the same file only if readability requires it; no new shared library without separate authorization |
| **Slice 1–2 preservation** | Existing `scan_records`, `consent_snapshots`, and `user_description_evidence` steps remain unchanged in behavior except ordering relative to the new Image Evidence step |
| **Environment configuration** | Bucket name and storage path prefix supplied via environment variables; missing configuration fails closed before storage upload |

**Precondition:** `image_evidence` table and governed private storage bucket must exist in the target environment per **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** before code deploy.

---

## Write Order

Future implementation in **`app/api/scan/route.ts`** extends Slice 1–2 with one coordinated storage-and-insert step before AI analysis. Phase 1 scan **requires image**; Image Evidence persistence is **mandatory** on every successful capture path when both image consent scopes are active.

| Step | Action |
|------|--------|
| **1** | Auth, rate limit, legacy consent validation — unchanged |
| **2** | Image validation (type, size) — unchanged; reject 400/413 before any evidence writes |
| **3** | **`scan_records` insert** — unchanged (Slice 1) |
| **4** | **`consent_snapshots` insert** — unchanged (Slice 1); AI must not run until steps 3–4 succeed |
| **5** | **`user_description_evidence` insert** — unchanged (Slice 2); only if non-empty description and `description_processing_consent` active; skip if absent |
| **6** | **Image Evidence persistence** — upload image bytes to governed private object storage; insert **`image_evidence`** row with `storage_object_ref`, capture metadata, and session linkage; **required** when image present and both `image_processing_consent` and `evidence_storage_consent` are active |
| **7** | **AI analysis** — existing OpenAI flow unchanged in outcome; image remains available as prompt input |
| **8** | **`analyses` compatibility insert** — unchanged except existing `scan_record_id` linkage |
| **9** | Return normalized AI JSON — unchanged response shape on success |

**Physical ordering constraints:**

| Constraint | Rule |
|------------|------|
| **Session foundation first** | Steps 3–4 must complete before any child evidence (steps 5–6) |
| **Child evidence before AI** | Steps 5–6 must complete (or be correctly skipped for step 5 only) before step 7 |
| **Relative order of steps 5 and 6** | Either order is acceptable when both apply; current route performs step 5 before step 6 — **preserve this order** to minimize diff scope |
| **Evidence before Intelligence** | Step 6 must succeed before step 7 when image is present and consented |
| **Compatibility row last** | Step 8 follows successful AI parse and normalization |

**Image buffer handling:** Read the uploaded `File` into a buffer **once** after step 2 validation. Reuse the same buffer for step 6 storage upload and step 7 AI data URL construction. Do not re-read FormData or perform redundant `arrayBuffer()` calls.

---

## Storage Upload Behaviour

Governed binary persistence uses **private Supabase object storage** (or equivalent governed private bucket configured per migration plan). Upload is performed by the scan route via **service-role** credentials—not client upload tokens.

### Upload prerequisites

| Requirement | Behavior |
|-------------|----------|
| **Bucket exists** | Target private bucket provisioned and verified per migration plan before code deploy |
| **Configuration present** | Required environment variables for bucket identity and path convention; missing config → fail at step 6 with 500 before AI |
| **Consent active** | Upload proceeds only when both `image_processing_consent` and `evidence_storage_consent` are in resolved consent scopes (see Consent Requirements) |
| **Validated input** | Upload uses the same validated `File` from step 2; content type and byte size taken from client-reported values subject to step 2 checks |

### Object path convention

| Element | Intent |
|---------|--------|
| **User scoping** | Path includes user ownership segment (e.g., normalized `user_email` or future canonical user id) to support access policy alignment |
| **Session scoping** | Path includes `scan_record_id` to bind artifact to governed capture session |
| **Uniqueness** | Path includes stable unique segment (e.g., evidence record id or generated uuid) to prevent overwrite of prior captures |
| **No public segment** | Path must not map to public or CDN-served locations |
| **`storage_object_ref` value** | Store bucket-relative path or stable object key agreed in storage posture artifact—not a signed URL, public URL, or full HTTP endpoint |

Exact path template is defined in the storage posture artifact accompanying the migration plan; code must conform to that template without ad hoc variation per deploy.

### Upload execution rules

| Rule | Behavior |
|------|----------|
| **Private bucket only** | Upload to non-public bucket; no `public` ACL or anonymous read |
| **Content type preserved** | Set storage object content type to validated `image.type` from step 2 |
| **Byte integrity** | Upload byte length must match validated `image.size`; reject or fail if buffer length diverges |
| **Upsert policy** | Use non-destructive upload semantics (`upsert: false` or equivalent) so accidental path collision fails rather than silently overwriting prior evidence |
| **No inline relational bytes** | Do not store image bytes in `image_evidence` row or `analyses` |
| **Durability before relational claim** | Storage object must exist and be durably written **before** `image_evidence` insert references it |
| **Failure cleanup** | If relational insert fails after successful upload, attempt best-effort deletion of the orphaned storage object via service-role; log cleanup outcome; do not proceed to AI |

### Prohibited storage behavior

- Public or unauthenticated object URLs in evidence records or API responses
- Upload before steps 3–4 (session and consent foundation)
- Upload when either required image consent scope is absent
- Storing AI inference output, thumbnails for display convenience, or derived model artifacts in the evidence bucket in Slice 3
- Client-direct upload bypassing service-role governance

---

## Image Evidence Insert Behaviour

After successful storage upload, insert one row into **`image_evidence`** via service-role Supabase client. Insert-only — no UPDATE or DELETE in Slice 3.

### Insert conditions

| Condition | Action |
|-----------|--------|
| **Image present and validated** | Always true on Phase 1 scan success path after step 2 |
| **Both image consent scopes active** | Required; enforced before upload (see Consent Requirements) |
| **Storage upload succeeded** | Insert proceeds with `storage_object_ref` pointing to uploaded object |
| **One row per session** | At most one insert per `scan_record_id`; aligns with SQL Draft `UNIQUE (scan_record_id)` |

### Proposed insert payload

| Field | Value |
|-------|-------|
| `scan_record_id` | From step 3 |
| `user_email` | Session email (Slice 1–2 transitional pattern) |
| `storage_object_ref` | Governed object key from successful upload |
| `content_type` | Validated `image.type` (e.g., `image/jpeg`, `image/png`) |
| `byte_size` | Validated `image.size` / buffer length |
| `capture_source` | `'web_scan'` |
| `capture_metadata` | JSON object — non-inference capture context only (see below) |
| `evidence_status` | `'active'` (default; omit if DB default applies) |

### Capture metadata envelope

`capture_metadata` must be a **JSON object** satisfying SQL Draft object-type constraint. Permitted provenance fields include:

| Field (conceptual) | Source |
|--------------------|--------|
| **Upload timestamp** | Server capture time at persistence (ISO 8601) |
| **Original filename** | Client `File.name` if present — optional, non-authoritative |
| **Reported dimensions** | Client-reported width/height if available from FormData or future capture metadata — optional |
| **Upload completeness indicator** | e.g., buffer length matches declared size — optional audit flag |

**Prohibited in `capture_metadata`:** AI observations, symptom labels, diagnostic content, model confidence, recommendations, body area resolution, or denormalized base64/image bytes.

### Consent linkage

No `consent_snapshot_id` column. Consent provenance is **inherited** via `scan_record_id` → `consent_snapshots` per SQL Draft. Application must not duplicate consent scope enumeration on the evidence row.

### Boundary invariant

Image Evidence answers *what the user captured*. It must not embed Intelligence Layer output or merge with User Description Evidence (`original_text` remains on `user_description_evidence` only).

---

## Failure Behaviour

Slice 3 extends Slice 2 fail-closed posture for binary persistence. All failure responses use generic **HTTP 500** with `{ error: "Internal server error" }` unless an existing 401/403/400/413/429 applies. No AI JSON in error responses.

### If storage upload fails (image present and consented)

| Rule | Behavior |
|------|----------|
| **Stop before relational insert** | Do not insert `image_evidence` |
| **Stop before AI** | Do not call OpenAI |
| **No analyses row** | Do not insert `analyses` compatibility row |
| **No false success** | Do not return 200 |
| **Session rows** | Existing `scan_records`, `consent_snapshots`, and any `user_description_evidence` from prior steps may remain |
| **Orphan prevention** | No partial upload without subsequent governed row; if upload partially succeeded, attempt cleanup and log |

### If `image_evidence` insert fails after successful upload

| Rule | Behavior |
|------|----------|
| **Stop before AI** | Do not call OpenAI |
| **No analyses row** | Do not insert `analyses` |
| **Orphan cleanup** | Attempt best-effort deletion of uploaded storage object; log cleanup success or failure |
| **Session rows** | Prior governed rows may remain (append-oriented) |
| **No false success** | Return 500 |

### If User Description Evidence insert fails (description present and consented)

Slice 2 rules unchanged — stop before Image Evidence step 6, AI, and compatibility row.

### If Image Evidence succeeds but AI call fails

| Rule | Behavior |
|------|----------|
| **Governed rows remain** | `scan_records`, `consent_snapshots`, optional `user_description_evidence`, `image_evidence`, and stored binary may remain |
| **No analyses row** | Do not insert compatibility row |
| **No false success** | Return 500; user must not receive success implying saved history entry |
| **No exposure** | Stored image not returned in response; no storage URL in error payload |

### If AI response parse or normalization fails

Preserve Slice 2 P1-2 remediation — return 500; no `analyses` insert; no false-success fallback. Governed session and child evidence rows (including Image Evidence when persisted) may remain for audit.

### If `analyses` insert fails after full success path

Slice 1–2 rules unchanged: return 500; do not return 200 with AI JSON alone. Image Evidence and storage artifact may remain under governed ownership.

### Session exclusion posture

On evidence persistence failure after steps 3–4, optional marking of `scan_records.status = 'excluded'` per Slice 1 failure pattern is preferred over cascade DELETE. Exact exclusion update is optional in Slice 3 if not already implemented; failure must still fail closed regardless.

---

## Consent Requirements

Image Evidence persistence is **dual-scope consent-gated** per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

| Scope | Requirement |
|-------|-------------|
| **`image_processing_consent`** | Required for AI transmission and processing of the image |
| **`evidence_storage_consent`** | Required for server-side storage upload and `image_evidence` insert |

### Gating rules

| Rule | Behavior |
|------|----------|
| **Both scopes required** | Phase 1 scan with image requires both scopes active for steps 6–9 |
| **Transitional mapping** | Current route requires `consentPrivacy = true`, which includes both scopes via `resolveConsentScopes()` — no new consent surfaces in Slice 3 |
| **Missing either scope** | Block at step 1 equivalent — do not upload, do not insert evidence, do not run AI, do not write `analyses` |
| **Consent Snapshot authority** | Capture-time scopes recorded in step 4 `consent_scopes`; evidence inherits via session chain |
| **No storage without storage consent** | Even if AI processing were hypothetically allowed, binary upload and `image_evidence` insert must not occur without `evidence_storage_consent` |
| **No AI without processing consent** | Image must not be sent to OpenAI without `image_processing_consent` |

### Independence from description consent

| Evidence type | Required scope(s) |
|---------------|-------------------|
| **User Description Evidence** | `description_processing_consent` (Slice 2; unchanged) |
| **Image Evidence** | `image_processing_consent` + `evidence_storage_consent` |

Failure or skip of one child evidence type must not silently bypass consent requirements for the other when that type's input is present and consented.

---

## AI Execution Rules

AI analysis (step 7) runs **only after** governed session foundation (steps 3–4) and Image Evidence persistence (step 6) succeed when image is present and consented.

| Rule | Behavior |
|------|----------|
| **Evidence-first gate** | Do not invoke OpenAI until step 6 completes successfully |
| **Input unchanged** | AI receives the same image and text inputs as today — data URL or equivalent from in-memory buffer; prompt structure unchanged |
| **No new AI dependencies** | AI flow does not require `image_evidence.id` or `storage_object_ref` as prompt input in Slice 3 |
| **No inference in evidence** | AI output must not be written to `image_evidence` or `capture_metadata` |
| **Processing consent** | AI call implies `image_processing_consent` was validated before step 6 |
| **Failure isolation** | AI provider errors, timeouts, or malformed responses follow existing failure posture — 500, no `analyses` row |
| **Parse integrity** | JSON parse and normalization failure returns 500 (P1-2 remediation preserved); no synthetic success payload |

AI execution rules do not change model selection, prompt content, or normalized response field structure on success.

---

## analyses Compatibility Behaviour

The `analyses` row remains the **compatibility read model** per **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**. Slice 3 does not promote it to canonical image store.

| Rule | Behavior |
|------|----------|
| **Insert timing** | Step 8 — after successful AI parse/normalization only |
| **`scan_record_id`** | Populate with session anchor from step 3 (existing Slice 1 behavior) |
| **Legacy fields preserved** | `user_email`, `result`, `confidence`, `consent_medical`, `consent_privacy`, `model` — unchanged |
| **No image reference** | Do not add image URL, `storage_object_ref`, thumbnail, or embedded image bytes to `analyses` columns or `result` JSON |
| **Non-authoritative for Image Evidence** | Row existence does not prove image was persisted; verification must query `image_evidence` and storage directly |
| **Failure coupling** | No `analyses` row when step 6 failed, AI failed, or parse failed |
| **Success coupling** | HTTP 200 with normalized AI JSON only when step 8 insert succeeds |

Dashboard and history continue reading `analyses` only. Image Evidence is write-only foundation in Slice 3.

---

## Logging Requirements

Logging supports operational audit and failure diagnosis without leaking sensitive image content or personal health data.

### Required log fields (structured or convention-based)

| Field | Usage |
|-------|-------|
| **`failure_stage`** | Identifies failing step (see stage values below) |
| **`scan_record_id`** | Present whenever steps 3+ have completed |
| **Error detail** | Supabase or storage provider error object/message — not raw image bytes |

### `failure_stage` values for Slice 3

| Stage | When |
|-------|------|
| **`image_storage_upload`** | Private object storage upload failed |
| **`image_storage_cleanup`** | Post-failure orphan object deletion attempted (success or failure of cleanup logged) |
| **`image_evidence`** | Relational insert into `image_evidence` failed |
| **`image_storage_config`** | Missing bucket or storage environment configuration |

Existing stages (`scan_record`, `consent_snapshot`, `user_description_evidence`, `ai_response_parse`, `analyses`) remain unchanged.

### Prohibited logging

| Prohibited | Reason |
|------------|--------|
| **Raw image bytes or base64** | Highly sensitive personal data |
| **Full `capture_metadata` at info level** | May contain device context; restrict to debug if ever needed |
| **Public or signed storage URLs** | Access credential leakage |
| **AI-inferred clinical or symptom content at info level** | Intelligence output separation |

### Success path logging

Optional info-level log on successful Image Evidence persistence: `scan_record_id`, `content_type`, `byte_size`, `storage_object_ref` hash or redacted suffix — **not** full object key if treated as sensitive. Success logging is optional; failure logging is mandatory for step 6 failures.

---

## Verification Strategy

Post-deploy verification confirms dual-write behavior via read-only governed-store queries. Verification does not rely on `analyses` row presence alone.

### Pre-deploy gates

| Gate | Requirement |
|------|-------------|
| **Migration applied** | `image_evidence` table and private storage bucket live per migration plan |
| **This code design accepted** | Write order, storage behavior, failure rules signed off |
| **Slice 2 verified** | Recommended before Slice 3 code deploy |
| **Diff review** | Implementation PR matches accepted design; no scope creep |

### Functional verification (post-deploy)

| # | Check | Expected result |
|---|-------|-----------------|
| 1 | **New scan with image** | One `image_evidence` row per capture; `scan_record_id` matches session |
| 2 | **Storage object exists** | Object at `storage_object_ref` present in private bucket |
| 3 | **Reference integrity** | `byte_size` and `content_type` match uploaded file; no duplicate `storage_object_ref` |
| 4 | **Consent audit** | Join `image_evidence` → `scan_records` → `consent_snapshots` shows both `image_processing_consent` and `evidence_storage_consent` in `consent_scopes` |
| 5 | **Capture metadata boundary** | `capture_metadata` contains provenance fields only; no AI observations |
| 6 | **Coexistence with description** | Scan with image and description produces both `image_evidence` and `user_description_evidence` on same `scan_record_id` when description consented |
| 7 | **Compatibility row** | `analyses` row exists with same `scan_record_id`; no image reference added to row |
| 8 | **Success response unchanged** | API returns same normalized JSON fields; no evidence IDs or storage refs exposed |
| 9 | **Simulated storage failure** | Storage or insert failure returns 500; no `analyses` row; no AI success response |
| 10 | **Simulated AI failure after evidence** | 500 returned; `image_evidence` and storage may remain; no `analyses` row |
| 11 | **Read path unchanged** | Dashboard and history queries `analyses` only — no regression |

Detailed verification queries are defined in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** and **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** — referenced here, not duplicated.

### Verification artifact

Production closure requires a separate **dual-write verification document** (future artifact) recording environment, sample captures, query results, and failure-path spot checks.

---

## Explicit Non-Goals

Slice 3 dual-write code design explicitly excludes:

| Excluded | Reason |
|----------|--------|
| **Implementation code in this document** | Design artifact only |
| **SQL, migrations, storage bucket provisioning** | Separate gated artifacts; must precede code deploy |
| **Frontend / capture flow changes** | Experience Layer unchanged |
| **API response shape changes on success** | Client contract frozen |
| **Read-path cutover from `analyses`** | Compatibility read model remains authoritative |
| **Exposing Image Evidence to client** | No evidence IDs, URLs, or thumbnails in API response |
| **Signed URL generation or client download** | Deferred to future governed retrieval slice |
| **CDN, image optimization, or transcoding pipelines** | Beyond minimum governed private storage |
| **User Description Evidence re-scope** | Slice 2; unchanged except shared write order |
| **Product Mention / Routine Mention Evidence** | Future slices |
| **Symptom Observation Evidence / Body Area Evidence Link** | Future slices |
| **Evidence Confidence Posture storage** | Deferred |
| **Correction Event storage or UX** | Design-compatible only |
| **Deletion/retention workflow** | Deferred; no DELETE on evidence or storage in Slice 3 code |
| **AI Analysis Result separation** | `analyses.result` remains mixed artifact |
| **Legacy backfill** | Prior non-persisted images not retroactively stored |
| **Storing AI observations in `capture_metadata`** | Prohibited boundary merge |
| **Public or anonymous storage access** | Privacy and consent violation |
| **Files other than `app/api/scan/route.ts`** | Minimal diff scope unless storage helper extraction is separately authorized |
| **localStorage governance changes** | Device cache remains non-authoritative |
| **Product Intelligence, Routine Intelligence, Learning Layer** | Phase 1 scope discipline |

---

## Implementation Gates

No Slice 3 code change may begin until all gates pass:

| Gate | Requirement |
|------|-------------|
| **Slice 3 plan accepted** | **docs/PHASE_1_SLICE_3_PLAN_V1.md** |
| **Slice 3 technical design accepted** | **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md** |
| **SQL draft accepted** | **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** |
| **Migration applied** | **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** — table and storage live in target environment |
| **This code design accepted** | Write order, storage upload, insert payload, consent, failure rules, logging signed off |
| **Read-only audit accepted** | Architecture audit of design artifacts — no P0 blockers |
| **Diff review before merge** | Implementation PR matches accepted design |
| **Production verification after deploy** | Dual-write verification artifact completed |

This document closes the **code design** gate only. It does not authorize implementation.

---

## Current Decision

**Phase 1 Slice 3 Image Evidence dual-write code design is defined for review only.**

Target implementation: **`app/api/scan/route.ts`** only — after Slice 1–2 steps, upload image to governed private storage and insert `image_evidence` before AI when image is present and both image consent scopes are active; fail closed on storage or evidence failures; preserve P1-2 parse integrity; leave success response shape, dashboard, history, and `analyses` read paths unchanged; do not expose image evidence or storage references to the client.

This document does **not** authorize:

- Application code changes
- Object storage configuration or bucket creation
- Supabase schema changes
- API contract or response field changes on success
- Read-path cutover from `analyses`
- Legacy backfill of prior scan images

**Image Evidence preserves governed visual artifact reference and capture metadata linked to Scan Record V2. It records what the user captured—not AI inference, symptom classification, or diagnostic content.**

**Next step:** Review and commit this design, complete read-only audit acceptance, then prepare a gated implementation prompt for `app/api/scan/route.ts` after migration and storage posture are applied in the target environment.
