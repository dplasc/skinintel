# Phase 1 Slice 3 — Image Evidence Technical Design V1

## Purpose

This document translates the accepted **Phase 1 Slice 3 plan** from **docs/PHASE_1_SLICE_3_PLAN_V1.md** into a **technical design** for persisting user-uploaded scan images as governed Image Evidence linked to Scan Record V2.

Image Evidence is the **first binary content evidence object** in the Personal Evidence Base. It records what the user captured at scan time—visual artifact reference and capture metadata—not what AI inferred from the image. It closes the documented gap where uploaded images are transmitted to AI at inference and **discarded as governed evidence server-side** (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**).

Within the Evidence Layer, Image Evidence belongs to **Evidence Content Stores** per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**. It attaches to the Scan Record V2 session anchor established in Slice 1 and coexists with User Description Evidence from Slice 2 on the same capture session when both inputs are present.

This document defines conceptual persistence design, transitional write/read behavior, consent and failure rules, security boundaries, and future governance compatibility. It derives from accepted Phase 1 planning artifacts for evidence boundaries, schema direction, consent, deletion, correction, confidence, and transitional mapping.

This is **design only**. It does **not** authorize SQL, migration execution, object storage configuration, application code, API contract changes, or read-path cutover.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

---

## Design Objective

| Objective | Definition |
|-----------|------------|
| **What is persisted** | User-uploaded skin image as governed visual capture evidence—artifact reference and capture metadata, not AI output. |
| **When it is persisted** | On every new scan capture where image input is present (Phase 1 scan requires image) and both `image_processing_consent` and `evidence_storage_consent` are active in the session Consent Snapshot. |
| **Where authority resides** | `image_evidence` (Evidence Content Store) is authoritative for visual capture artifact and capture metadata; governed binary storage holds the artifact; `analyses` remains compatibility/read model. |
| **What stays unchanged** | AI analysis flow, API response shape on success, dashboard/history read paths, and capture experience. |

Slice 3 extends the verified Slice 1–2 dual-write pattern. It does not separate AI Analysis Result, implement correction/deletion workflows, expose image evidence to the client, or alter Transitional Hybrid direction.

---

## Proposed Evidence Store

**Conceptual persistence object:** `image_evidence`

**Store group:** Evidence Content Stores per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

**Relationship:** Each row links to exactly one Scan Record V2 (`scan_records`) for the capture session. At most one Image Evidence row per scan session in Slice 3 (one image upload per capture).

**Binary artifact posture (conceptual):** Image bytes reside in governed private object storage, referenced by the evidence record. The evidence row holds the stable reference to the stored artifact—not the AI inference payload. Physical bucket naming, path conventions, and upload mechanics are deferred to SQL draft and migration plan artifacts.

**RLS posture (conceptual):** Consistent with Slice 1–2 — users may read own evidence via SELECT policy; service-role writes for scan route; no client INSERT/UPDATE/DELETE policies in Slice 3.

### Conceptual fields (not DDL)

| Field | Purpose |
|-------|---------|
| **`id`** | Stable identifier for the Image Evidence record. |
| **`scan_record_id`** | Required link to parent Scan Record V2 session anchor. |
| **`user_email`** (or canonical owner reference) | User ownership for RLS and audit; aligns with Slice 1 `scan_records.user_email` pattern until auth user id migration is separately authorized. |
| **`storage_object_ref`** | Governed reference to the persisted binary artifact in private object storage—not a public URL. |
| **`content_type`** | MIME type at capture (e.g., `image/jpeg`) for provenance and future retrieval validation. |
| **`byte_size`** | Artifact size at capture for audit, quota awareness, and integrity checks. |
| **`capture_source`** | Provenance of capture channel (e.g., `web_scan`); consistent with Consent Snapshot capture source semantics. |
| **`capture_metadata`** | Structured capture context only—device class, upload timestamp, optional quality indicators sufficient for provenance. Must not contain AI observations, symptom labels, or diagnostic content. |
| **`evidence_status`** | Lifecycle state for governed evidence (e.g., `active`, `excluded`) — supports future deletion/tombstone semantics without edit-in-place of artifact reference. |
| **`created_at`** | Evidence creation timestamp; capture-time semantics; immutable after insert. |
| **Optional future references (not populated in Slice 3)** | Placeholder linkage for Body Area Evidence Link association, Correction Event chain, deletion/retention tombstone metadata, Evidence Confidence Posture attachment — design-compatible only. |

**Does not store:** AI-inferred observations, symptom classifications, diagnostic labels, recommendations, Intelligence Layer output, product mentions, routine mentions, or denormalized image bytes inline in the relational row.

**Does not extend `analyses`:** Image artifact references must not be added to `analyses` columns or embedded JSON as the canonical image store (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**).

---

## Object Responsibilities

Binding definition from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** and **docs/PHASE_1_SLICE_3_PLAN_V1.md**.

### Image Evidence owns

| Responsibility | Description |
|----------------|-------------|
| **Visual capture artifact reference** | Stable, governed pointer to the user-uploaded image stored under user ownership in private object storage. |
| **Capture metadata** | Context sufficient for provenance: capture timestamp, content type, size, capture channel, and non-inference quality indicators (e.g., upload completeness). |
| **Session linkage** | Explicit association to parent Scan Record V2 for the capture session. |
| **Evidence lifecycle state** | `evidence_status` (or equivalent) enabling future exclusion/tombstone without silent overwrite. |
| **User-origin attestation** | Record that the artifact represents user-initiated visual capture at scan time—not platform-generated or AI-synthesized imagery. |

### Image Evidence must never own

| Prohibited content | Reason |
|--------------------|--------|
| **AI-inferred observations** | Intelligence Layer output; must link to evidence, not embed in it. |
| **Symptom classifications or taxonomy resolution** | Belongs to Symptom Observation Evidence (future slice). |
| **Diagnostic labels or clinical framing** | Cosmetic scope only; no disease or treatment artifacts. |
| **Recommendations or guidance** | Intelligence Layer artifacts only. |
| **AI Analysis Result JSON or model output** | Remains in `analyses.result` during transition. |
| **Evidence Confidence Posture values** | Input quality qualification is a separate governance object (future slice). |
| **Body area resolution records** | Belongs to Body Area Evidence Link (future slice). |
| **Consent scope enumeration** | Belongs to Consent Snapshot on the session. |
| **Public or unauthenticated access URLs** | Violates privacy and consent boundaries. |
| **Marketing, sharing, or commercial profiling artifacts** | Prohibited by Phase 1 Rules (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**). |

**Boundary invariant:** Image Evidence answers *what the user captured*; AI Analysis Result answers *what the model inferred*. These must remain separable objects with explicit links in future Intelligence separation—not merged fields.

---

## Relationships

Conceptual cardinality and linkage. No physical FK or DDL specification.

### Scan Record V2

| Aspect | Relationship |
|--------|--------------|
| **Cardinality** | One Scan Record V2 → at most one Image Evidence row per capture session (Slice 3). |
| **Direction** | Image Evidence references `scan_record_id`; session anchor does not embed image bytes or AI output. |
| **Authority** | Scan Record V2 remains session identity authority; Image Evidence is a child content object. |
| **Ordering** | Image Evidence is created only after Scan Record V2 and Consent Snapshot exist for the session. |
| **Deletion coupling** | Parent `scan_records` deletion is blocked while Image Evidence rows exist (consistent with Slice 2 `ON DELETE RESTRICT` posture); tombstone workflow deferred. |

### Consent Snapshot

| Aspect | Relationship |
|--------|--------------|
| **Cardinality** | One session Consent Snapshot governs authorization for all child evidence on that session. |
| **Linkage model** | Consent provenance inherited via session chain: `image_evidence` → `scan_records` → `consent_snapshots` (consistent with Slice 2 inherited consent pattern). Direct `consent_snapshot_id` column is optional physical choice deferred to SQL draft. |
| **Required scopes** | `image_processing_consent` (transmission and AI processing) and `evidence_storage_consent` (server-side persistence) must both be active at capture. |
| **Immutability** | Post-capture consent withdrawal does not mutate Consent Snapshot or retroactively de-authorize stored artifact provenance; future eligibility governed separately. |
| **Audit** | Verification must prove both scopes were active in the session snapshot at capture time. |

### User Description Evidence

| Aspect | Relationship |
|--------|--------------|
| **Coexistence** | Both may attach to the same Scan Record V2 when image and description are present. |
| **Independence** | Image Evidence and User Description Evidence are separate object classes with separate consent scope requirements (`image_processing_consent` + `evidence_storage_consent` vs `description_processing_consent`). |
| **No merge** | Description text must not be stored on Image Evidence; image reference must not be stored on User Description Evidence. |
| **Write ordering** | Both must complete (or be correctly skipped) before AI analysis; relative order between steps 4 and 5 is flexible when both apply. |
| **Failure isolation** | Failure persisting one child evidence type must not silently succeed the other when that type was consented and required. |

### `analyses` compatibility row

| Aspect | Relationship |
|--------|--------------|
| **Cardinality** | One compatibility row per successful capture session; references `scan_record_id`. |
| **Authority** | **Non-authoritative** for Image Evidence. Row existence does not prove image was persisted as governed evidence. |
| **No image reference** | Compatibility row must not store canonical image artifact reference, thumbnail URL, or embedded image payload in Slice 3. |
| **Write ordering** | Compatibility row written **after** Image Evidence (when image present and consented) and AI analysis steps. |
| **Legacy rows** | Pre-Slice-3 captures have no Image Evidence; compatibility rows remain valid transitional reads without image linkage. |
| **Drift prevention** | Engineering verification must query `image_evidence` and governed storage directly; must not infer persistence from `analyses` alone. |

---

## Write Order

Intended future write sequence extending verified Slice 1–2 dual-write. Conceptual only—not API contract, transaction specification, or implementation pseudocode.

| Step | Action |
|------|--------|
| **1** | **Auth and consent validation** — reject unauthenticated requests; validate legacy consent inputs; resolve Phase 1 consent scopes. Block capture if required scopes missing. Phase 1 scan requires image; `image_processing_consent` and `evidence_storage_consent` are mandatory for governed capture. |
| **2** | **`scan_records` creation** — insert Scan Record V2 session anchor (Slice 1). |
| **3** | **`consent_snapshots` creation** — insert Consent Snapshot linked to `scan_record_id` (Slice 1). AI must not run until steps 2–3 succeed. |
| **4** | **`user_description_evidence` creation** — Slice 2; only if non-empty description and `description_processing_consent` active. Skip if absent. |
| **5** | **`image_evidence` creation** — persist governed binary artifact to private object storage; insert evidence row with `storage_object_ref`, capture metadata, and session linkage. **Required** when image input is present and both image and storage consent scopes are active. |
| **6** | **AI analysis** — existing inference flow unchanged in outcome; image available as governed input and prompt input. |
| **7** | **`analyses` compatibility row** — existing insert with `scan_record_id` linkage unchanged; legacy fields preserved; response shape unchanged. |

**Schema note:** `consent_snapshots` requires `scan_record_id` FK; Scan Record V2 precedes Consent Snapshot at the physical layer, consistent with implemented Slice 1 code. Governance invariant unchanged: session anchor and consent record exist before child evidence and before AI reasoning.

**Evidence-first invariant:** Steps 2–5 establish governed evidence before Intelligence output (step 6) and compatibility convenience (step 7). Step 7 must not reverse this priority.

**Binary upload sequencing:** Artifact must be durably stored (or transactionally coupled with evidence row insert) such that no evidence row references a missing or publicly exposed object. Exact atomicity strategy deferred to dual-write code design.

---

## Consent Behavior

Image Evidence persistence is **dual-scope consent-gated** per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

| Rule | Behavior |
|------|----------|
| **No processing consent, no AI transmission** | Image must not be sent to AI without `image_processing_consent`. |
| **No storage consent, no persistence** | Image must not be written to governed storage or `image_evidence` without `evidence_storage_consent`. |
| **Both scopes required for full capture path** | Phase 1 scan with image requires both scopes active; missing either blocks capture at step 1. |
| **Consent Snapshot anchors permission** | Capture-time scopes are immutable record of authorization; evidence inherits session consent linkage. |
| **Transitional mapping** | Current legacy consent booleans map to Phase 1 scopes per Slice 1 mapping; no new consent surfaces in Slice 3. |
| **No marketing/commercial reuse** | Scopes authorize personal cosmetic analysis and evidence storage only. |
| **Withdrawal is forward-looking** | Post-capture withdrawal does not mutate Consent Snapshot or silently remove stored artifact; future deletion workflow governs exclusion. |

If image is present but either required scope is not active, capture must be **blocked** at step 1 — do not persist image, do not run AI, do not write compatibility row.

---

## Failure Behaviour

Slice 3 extends Slice 2 evidence integrity posture for binary persistence. Failure rules apply when image input is present and both consent scopes are active.

### If binary upload or `image_evidence` insert fails

| Rule | Behavior |
|------|----------|
| **Stop before AI** | Do **not** proceed to inference. |
| **No false success** | Do **not** return a successful saved-analysis response implying a complete governed capture. |
| **Safe server error** | Return generic server error (e.g., 500); no AI JSON in success response. |
| **No partial compatibility row** | Do **not** write `analyses` compatibility row when image was present, consented, and evidence persistence failed. |
| **No orphaned public objects** | Do **not** leave durable storage objects without a governing evidence row (or equivalent cleanup on failure). |
| **Session rows** | Existing `scan_records`, `consent_snapshots`, and any prior child evidence rows from earlier steps may remain (append-oriented; mark session `excluded` per Slice 1 failure pattern — preferred over cascade delete). |

### If User Description Evidence step fails (description present and consented)

Slice 2 rules unchanged — stop before Image Evidence step 5, AI, and compatibility row.

### If AI or `analyses` insert fails after Image Evidence persisted

Slice 1–2 rules unchanged: governed session and child evidence rows may remain; no compatibility row; return server error; user must not receive success implying saved history entry. Stored image artifact remains under governed ownership for audit and future governance—not exposed via success response.

### Success path

**No API response shape changes on success** — normalized AI JSON returned unchanged; dashboard/history unaffected. Image evidence not exposed in response payload.

---

## Read Behaviour

Transitional Hybrid read posture per **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** and **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**.

| Concern | Slice 3 behavior |
|---------|------------------|
| **Dashboard** | Continues reading `analyses` only — unchanged. |
| **History list/detail** | Continues reading `analyses` only — unchanged. |
| **API success response** | Shape unchanged; Image Evidence not included in response payload. |
| **`image_evidence` table** | **Write-only foundation** in Slice 3 — persisted for Personal Evidence Base; not queried by current application read paths. |
| **Governed object storage** | Not exposed to client read paths in Slice 3; access via service-role and future governed retrieval only. |
| **Read-path cutover** | **Out of scope** — evidence-first reads deferred to future slice. |
| **Compatibility row assumption** | Consumers must **not** assume `analyses` row implies Image Evidence exists. |
| **localStorage** | Remains non-authoritative device cache; no governance changes. |
| **Legacy captures** | Pre-Slice-3 rows readable via `analyses`; no Image Evidence linkage expected. |

Post-deploy verification must confirm Image Evidence rows and storage references via direct governed-store queries—not via compatibility row inference.

---

## Security Boundaries

Image artifacts are highly sensitive personal health-adjacent data. Security posture must meet or exceed Slice 1–2 evidence store standards.

### Ownership

| Boundary | Requirement |
|----------|-------------|
| **User ownership** | Image Evidence rows and stored artifacts belong to the capturing user (`user_email` transitional pattern). |
| **Session scoping** | Artifact access must be attributable to a governed Scan Record V2 under that user. |
| **Service-role writes** | Scan route persists evidence via service-role client; end users do not receive storage upload credentials with unrestricted scope. |

### RLS intent

| Policy | Intent |
|--------|--------|
| **SELECT** | Authenticated user may read own `image_evidence` rows only (matching `user_email` or future canonical user id). |
| **INSERT/UPDATE/DELETE** | No client-facing mutation policies in Slice 3; service-role performs writes. |
| **Cross-user isolation** | One user must not read or infer another user's image evidence or storage objects. |

### Privacy boundaries

| Boundary | Requirement |
|----------|-------------|
| **Private storage only** | Artifacts in non-public object storage; no anonymous or CDN-public URLs in Slice 3. |
| **Consent-limited purpose** | Storage and retrieval authorized for personal cosmetic analysis and Personal Evidence Base only—not marketing, sharing, or third-party exploitation. |
| **No payload leakage in compatibility layer** | `analyses.result` and compatibility row must not embed recoverable image bytes or durable private URLs. |
| **Minimum metadata exposure** | Capture metadata stored on evidence row must not include inference conclusions or clinical labels. |

### Evidence governance

| Concern | Slice 3 posture |
|---------|-----------------|
| **Append-oriented history** | New captures create new records; no in-place overwrite of prior image evidence. |
| **Auditability** | Evidence row + storage reference + Consent Snapshot chain must support capture-time authorization audit. |
| **Future deletion** | Design must support binary removal and URL/reference revocation without breaking Consent Snapshot immutability. |
| **Future correction** | Design must support dispute/retract semantics without storing AI observations on the evidence record. |

Physical RLS policies, storage bucket policies, and signed-URL strategy deferred to SQL draft and migration plan.

---

## Future Compatibility

Slice 3 **designs for future governance** only. None of the following are implemented in this slice.

### Deletion (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**)

- Deletion removes image binary and capture metadata; revokes access to storage object.
- Tombstone marker permitted — record that image evidence existed and was deleted without retaining recoverable content.
- Deleted image evidence excluded from personalization and learning.
- AI results referencing deleted image marked ineligible or confidence-downgraded; no re-inference from deleted artifact.
- `analyses` compatibility surfaces must not retain recoverable image content in embedded JSON.
- Consent Snapshot remains immutable governance record.

### Correction (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**)

- Image Evidence is **correctable** — qualify, dispute, retract attestation that image represents current state.
- Corrections are **append-oriented** — no in-place mutation of historical artifact reference or metadata as silent rewrite.
- Correction alone does **not** delete binary — deletion is a separate governed path.
- Disputed image may down-grade or exclude linked Intelligence outputs without merging AI observations into Image Evidence.

### Evidence Confidence Posture (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**)

- Applicable dimensions: `image_quality`, `source_reliability`, `body_area_specificity`, `correction_status`, `deletion_or_retention_status`.
- Posture expresses **input quality** — distinct from `analyses.confidence` (AI output certainty).
- Posture storage and capture-time assignment deferred; `evidence_status` and optional future reference fields remain design-compatible.

### Body Area linkage

- Body Area Evidence Link is a **separate object** associating evidence to language-neutral anatomical region identifiers.
- Slice 3 may reserve optional nullable association on `image_evidence` for future link — no resolution, inference, or storage of body area records in Slice 3.
- Spatial context for downstream engines deferred until Body Area Evidence Link slice.

---

## Explicit Non-Goals

The following are intentionally excluded from Slice 3 technical design and any implementation authorized by downstream artifacts:

| Excluded item | Reason |
|---------------|--------|
| **SQL, DDL, migrations, storage bucket creation** | Separate gated artifacts. |
| **Application code and API contract changes** | Dual-write code design is a separate artifact. |
| **UI, capture flow, image display, thumbnails in history** | Experience Layer unchanged. |
| **Read-path cutover from `analyses`** | Transitional Hybrid preserved. |
| **AI Analysis Result separation** | Intelligence artifact remains in `analyses.result`. |
| **User Description Evidence re-scope** | Delivered in Slice 2. |
| **Symptom Observation Evidence** | Separate future slice. |
| **Product Mention / Routine Mention Evidence** | Separate future slices. |
| **Body Area Evidence Link implementation** | Design-compatible reference only. |
| **Evidence Confidence Posture storage** | Deferred. |
| **Correction Event storage and correction UX** | Deferred. |
| **Deletion/retention workflow implementation** | Deferred. |
| **Legacy backfill of historical images** | Transitional gap for pre-Slice-3 rows. |
| **AI observations in Image Evidence** | Prohibited merge. |
| **Public URLs, CDN delivery, image optimization pipelines** | Beyond minimum governed private storage. |
| **localStorage governance changes** | Device cache remains non-authoritative. |
| **Product Intelligence, Routine Intelligence, Learning Layer** | Phase 1 scope discipline. |
| **Medical diagnosis, disease labeling, clinical classification** | Cosmetic scope only. |
| **Changing Transitional Hybrid, schema direction, or object boundaries** | Upstream architecture decisions are binding. |

---

## Implementation Gates

No Slice 3 engineering work may begin until all gates pass:

| Gate | Requirement |
|------|-------------|
| **Slice 3 plan accepted** | **docs/PHASE_1_SLICE_3_PLAN_V1.md** committed and reviewed. |
| **This technical design accepted** | Scope, store design, write order, failure rules, security boundaries, and relationships signed off. |
| **Slice 2 verified (recommended)** | User Description Evidence dual-write verified before Slice 3 code authorization. |
| **Read-only audit accepted** | Architecture audit of this design + downstream SQL/code artifacts — no P0 blockers. |
| **SQL draft accepted** | Conceptual-to-physical mapping for `image_evidence` and storage linkage — no execution implied. |
| **Migration plan accepted** | Forward migration, storage posture, verification queries, rollback intent — separate artifact. |
| **Code design accepted** | Dual-write extension design — failure handling, consent gating, storage upload, no response change. |
| **Production verification after deploy** | Post-deploy read-only verification — row counts, linkage, storage reference integrity, consent scope audit. |

This document closes **technical design** gate only. It does not close SQL, migration, storage configuration, code, or production verification gates.

---

## Current Decision

**Phase 1 Slice 3 Image Evidence technical design is defined for review only.**

This document does **not** authorize:

- SQL or DDL execution
- Supabase migrations or storage bucket provisioning
- Application code changes
- API contract or response shape changes
- Read-path cutover from `analyses`
- Legacy backfill of prior scan images

**Image Evidence preserves visual capture artifact reference and capture metadata, links to Scan Record V2, and records what the user captured—not AI inference, symptom classification, or diagnostic content.**

Next step: review and commit this design, then create gated SQL draft, migration plan, and dual-write code design documents — or handoff to a new session for those artifacts.
