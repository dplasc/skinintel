# Phase 1 Slice 3 — Image Evidence Plan V1

## Purpose

This document plans **Phase 1 Slice 3: Image Evidence persistence** as the next incremental Evidence Layer slice after Slice 1 session foundation and Slice 2 User Description Evidence.

Slice 3 closes the documented capture gap where uploaded skin images are consumed at inference time and **not persisted as governed visual evidence**. It establishes the first **binary content evidence object** in the Personal Evidence Base while preserving Transitional Hybrid posture, existing UI read paths, and Phase 1 object boundaries.

This is a **planning artifact only**. It does not authorize code, SQL, storage configuration, API design, UI design, or Supabase changes.

Sources: **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**.

---

## Why Image Evidence Next

Slice 1 verified Scan Record V2, Consent Snapshot, and `analyses` compatibility linkage. Slice 2 (User Description Evidence) addressed the lowest-risk text-only child evidence increment. Slice 3 addresses the **remaining primary capture input** that Phase 1 audit documents as missing: the user-uploaded image.

**Rationale:**

| Factor | Why Image Evidence is next |
|--------|----------------------------|
| **Transitional mapping gap** | Uploaded image is sent to AI at inference and **not persisted server-side** today (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**). |
| **Capture completeness** | Phase 1 scan flow requires image input; governed session anchor without visual evidence leaves the Personal Evidence Base incomplete for the dominant capture modality. |
| **Consent scope already defined** | `image_processing_consent` and `evidence_storage_consent` govern image transmission and server-side persistence (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**). |
| **Foundation dependency satisfied** | Image Evidence links to Scan Record V2; Slice 1 session and consent stores are operational. Slice 2 establishes the child-evidence dual-write pattern for Slice 3 to extend. |
| **Boundary clarity** | Image Evidence records visual capture and metadata only—not AI observations, symptom labels, or diagnostic content (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**). |
| **Ordered complexity** | Binary storage, access URL governance, and retention semantics are higher risk than text evidence; deferring Image Evidence until after User Description Evidence follows the accepted incremental sequence. |

Product Mention Evidence, Routine Mention Evidence, and structured signal objects remain valid future slices but do not close the primary image capture gap.

---

## Architecture Boundaries

Slice 3 operates within the accepted Phase 1 architecture. The following boundaries are binding for all downstream design and implementation artifacts.

### Layer placement

| Layer | Slice 3 relationship |
|-------|----------------------|
| **Evidence Session Store** | Image Evidence attaches to Scan Record V2; does not replace session anchor authority. |
| **Consent Governance Store** | Image persistence inherits session Consent Snapshot association; `image_processing_consent` and `evidence_storage_consent` must be active at capture. |
| **Evidence Content Stores** | Image Evidence belongs here alongside User Description Evidence (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**). |
| **Intelligence Output Store** | Out of scope — AI Analysis Result remains in `analyses.result` during transition. |
| **Compatibility Read Model** | `analyses` remains non-authoritative read surface; no extension as canonical image store. |

### Authority rules during transition

| Concern | Authoritative store |
|---------|---------------------|
| Session anchor | Scan Record V2 |
| Consent at capture | Consent Snapshot |
| Visual capture artifact and capture metadata | Image Evidence (when implemented) |
| User-origin description text | User Description Evidence (Slice 2) |
| History/dashboard display | `analyses` compatibility row |
| AI output and AI confidence | `analyses.result` / `analyses.confidence` (legacy mixed artifact) |
| Input quality qualification | Not yet persisted — Evidence Confidence Posture deferred |

### Prohibited merges

- **Not AI Analysis Result** — AI-inferred observations, symptom classifications, and recommendations must not be stored inside Image Evidence.
- **Not Symptom Observation Evidence** — Structured cosmetic signals remain a separate object class.
- **Not Body Area Evidence Link** — Anatomical region scoping is a separate linkage object; Slice 3 may design for future association but does not implement it.
- **Not Evidence Confidence Posture** — `image_quality` and related dimensions are planned (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**) but persistence is deferred.
- **Not UI preview asset without provenance** — Thumbnails or display conveniences without governed evidence linkage are not substitutes for Image Evidence.

### Transitional Hybrid constraints

- Evidence stores win on conflict; compatibility row is denormalized convenience only (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**).
- Dual-write extends the verified Slice 1 write order; it does not reverse evidence-first priority.
- Read paths must not assume a compatibility row implies Image Evidence was persisted (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**).
- `localStorage` remains non-authoritative device cache.

---

## In Scope

Slice 3 planning covers the following at **conceptual level only**:

- **Persist Image Evidence** for new scan captures when the user submits an image (Phase 1 scan requires image).
- **Preserve visual capture artifact reference and capture metadata** — what was captured, not what AI inferred.
- **Link Image Evidence to Scan Record V2** for the same capture session.
- **Respect consent scope** — persist only when `image_processing_consent` and `evidence_storage_consent` are active in the session Consent Snapshot.
- **Define governed binary storage posture** — durable artifact location, access control intent, and deletion compatibility at planning level (physical storage design is a separate gated artifact).
- **Maintain Transitional Hybrid posture** — continue writing `analyses` compatibility row; do not cut over read paths from `analyses`.
- **Preserve current API response shape and dashboard/history behavior** — no client contract or UI read-path changes in this slice.
- **Extend dual-write write order** — Image Evidence persisted after session and consent foundation, before or alongside AI analysis, consistent with transitional mapping step 4.
- **Apply append-oriented semantics** — new captures create new evidence records; no silent overwrite of prior image evidence.
- **Plan for future governance hooks** — deletion, correction, and Evidence Confidence Posture must be **design-compatible** with accepted behavior documents but are not implemented in Slice 3.
- **Coexist with Slice 2 User Description Evidence** — both child evidence types may attach to the same Scan Record V2 when present.

**Conceptual store placement:** Image Evidence belongs in the **Evidence Content Stores** group under **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, linked to Scan Record V2.

---

## Out of Scope

The following are explicitly excluded from Slice 3 planning and any future Slice 3 implementation authorized by downstream documents:

| Excluded item | Reason |
|---------------|--------|
| **SQL / migrations / Supabase schema / storage bucket configuration** | Physical persistence design is a separate gated artifact. |
| **API endpoint design or contract changes** | Not authorized by this plan. |
| **UI design, capture flow redesign, or image display changes** | Image upload UX and history views remain unchanged. |
| **Application code** | This document does not authorize engineering work. |
| **User Description Evidence** | Delivered in Slice 2; not re-scoped here. |
| **Product Mention / Routine Mention Evidence** | Separate slices. |
| **Symptom Observation Evidence / Body Area Evidence Link** | Structured signal and spatial linkage objects deferred. |
| **Evidence Confidence Posture storage** | Applicable dimensions defined at planning level; persistence deferred. |
| **Correction Event storage or correction UX** | Correctability semantics planned; implementation deferred. |
| **Deletion/retention workflow implementation** | Behavior defined; workflow deferred. |
| **AI Analysis Result separation** | Intelligence Layer artifact remains in `analyses.result` during transition. |
| **Read-path cutover from `analyses`** | Compatibility read model remains authoritative for UI. |
| **localStorage governance changes** | Device cache remains non-authoritative. |
| **Legacy backfill** | Prior `analyses` rows and historically non-persisted images are not retroactively stored. |
| **AI observations, symptom labels, or diagnostic content in Image Evidence** | Prohibited boundary merge. |
| **Image re-inference or AI rewrite of prior evidence** | Re-inference produces new linked Intelligence artifact; does not mutate Image Evidence. |
| **Product Intelligence, Routine Intelligence, Learning Layer** | Phase 1 scope discipline. |
| **Public sharing, CDN exposure, or marketing use of images** | Consent scope prohibits beyond stated cosmetic analysis purpose. |

---

## Dependencies on Slice 1 and Slice 2

Slice 3 cannot be planned or implemented in isolation. The following dependencies are mandatory.

### Slice 1 — Session and consent foundation

| Dependency | Requirement |
|------------|-------------|
| **Scan Record V2 operational** | `scan_records` exists and is written on new captures per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**. |
| **Consent Snapshot operational** | `consent_snapshots` linked to `scan_records`; scope enumeration includes `image_processing_consent` and `evidence_storage_consent`. |
| **Compatibility linkage** | `analyses.scan_record_id` references governed session anchor. |
| **Dual-write authority model** | Evidence-first write order and failure posture verified for session stores. |
| **RLS posture pattern** | User-scoped read, service-role write pattern established for Slice 1 tables. |

Without verified Slice 1 foundation, Image Evidence has no governed session anchor or consent provenance.

### Slice 2 — Child evidence pattern

| Dependency | Requirement |
|------------|-------------|
| **Child evidence dual-write precedent** | User Description Evidence establishes the pattern for consent-gated, session-linked, write-only child evidence without read-path cutover. |
| **Slice 2 plan acceptance** | Scope, boundaries, and transitional hybrid posture for child evidence content stores are binding precedent. |
| **Non-interference** | Slice 3 extends write order; it does not alter User Description Evidence semantics or storage. |
| **Recommended sequencing** | Slice 2 implementation and verification should complete before Slice 3 implementation authorization; Slice 3 planning may proceed once Slice 2 scope is accepted. |

Slice 2 completion de-risks Slice 3 by proving child evidence persistence without UI or API contract change.

### Upstream planning artifacts (all slices)

Slice 3 inherits binding constraints from Phase 1 gates 1–14, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, behavioral governance documents (consent, deletion, correction, confidence), and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**. No Slice 3 artifact may contradict accepted upstream decisions.

---

## Conceptual Object Definition

**Image Evidence** is Phase 1 visual capture evidence with the following properties:

| Attribute | Definition |
|-----------|------------|
| **Primary responsibility** | Record captured visual evidence and capture metadata as authoritative personal capture artifact. |
| **Origin** | User-initiated camera upload or image selection during consent-valid capture. |
| **Content rule** | **Visual artifact reference and capture context only** — not AI-generated observations, classifications, or Intelligence Layer output. |
| **Session linkage** | **Links to Scan Record V2** — each record attaches to the governed capture session anchor for that scan. |
| **Consent linkage** | Created under valid `image_processing_consent` and `evidence_storage_consent` when image is present; inherits session Consent Snapshot association. |
| **Temporal semantics** | Capture timestamp reflects evidence creation time; append-oriented; not edited in place. |
| **What it owns** | Image artifact reference, capture context (device, timing, quality indicators sufficient for provenance), link to parent Scan Record V2. |
| **What it does not own** | AI-inferred observations; symptom taxonomy resolution; diagnostic labels; recommendations; Body Area Evidence Link records; Evidence Confidence Posture values. |

**Future governance compatibility** (planned, not Slice 3 implementation):

- **Correction Event** — qualify, dispute, or retract image attestation without deleting binary via correction alone (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**).
- **Deletion/retention** — remove binary and metadata; revoke access URLs; tombstone marker (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- **Evidence Confidence Posture** — `image_quality`, `source_reliability`, `body_area_specificity`, `correction_status` dimensions (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**).

---

## Relationship to Existing Flow

### Current state (post Slice 1; Slice 2 when implemented)

1. User submits scan with image (required) and optional description.
2. Consent Snapshot and Scan Record V2 are written (Slice 1).
3. User Description Evidence may be written when description present (Slice 2).
4. Image is sent to AI as prompt input; **not persisted as governed evidence server-side**.
5. AI analysis runs; result persisted in `analyses.result`.
6. **`analyses` compatibility row** written with `scan_record_id` linkage.

### Target state (Slice 3 — conceptual only)

Intended write order extension, aligned with **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**:

1. Validate auth and consent (unchanged).
2. Create Scan Record V2 (unchanged).
3. Create Consent Snapshot (unchanged).
4. Create User Description Evidence if applicable (Slice 2; unchanged).
5. **Create Image Evidence linked to Scan Record V2**, preserving visual artifact reference and capture metadata under valid image and storage consent scopes.
6. Run AI analysis using evidence links (AI flow unchanged in outcome; image remains available as governed input).
7. Write `analyses` compatibility row (unchanged read model; response shape unchanged).

Physical ordering follows verified Slice 1 implementation because Consent Snapshot requires `scan_record_id`. Image Evidence follows session and consent foundation and may precede or follow User Description Evidence when both are present; both must precede AI analysis under evidence-first ordering.

**Read path:** Dashboard and history continue reading `analyses` only. Image Evidence is written for Personal Evidence Base foundation; it is not exposed through new UI or API surfaces in Slice 3.

---

## Success Criteria

Slice 3 is successful at the **planning level** when this document is accepted and downstream gated artifacts can proceed without scope ambiguity.

| Criterion | Definition of success |
|-----------|----------------------|
| **Slice selection clarity** | Image Evidence is the agreed third minimal implementation increment; no parallel competing slice begins without explicit architecture decision. |
| **Boundary preservation** | Visual capture and AI inference remain separated; no prohibited merges introduced at planning level. |
| **Transitional Hybrid intact** | `analyses` remains compatibility read model; evidence stores remain authoritative for capture concerns. |
| **Consent alignment** | Image persistence is explicitly gated on `image_processing_consent` and `evidence_storage_consent`. |
| **Dependency acknowledgment** | Slice 1 and Slice 2 dependencies documented and accepted before implementation gates open. |
| **Governance compatibility** | Deletion, correction, and confidence posture documents inform design constraints without expanding Slice 3 into workflow implementation. |
| **No premature authorization** | Plan acceptance does not imply SQL, storage, code, or Supabase execution approval. |

Slice 3 **implementation** success criteria belong to downstream verification artifacts (migration execution report, dual-write verification) and are not closed by this plan alone.

---

## Explicit Non-Goals

The following outcomes are **explicitly not goals** of Slice 3, even if technically adjacent:

- **Rebuilding the Evidence Layer** — incremental child evidence only; not a platform persistence rewrite.
- **Making `analyses` the image store** — compatibility row must not become canonical visual evidence location.
- **Storing AI model observations with the image** — Intelligence output separation remains deferred.
- **Enabling history or dashboard to display stored images** — read-path and Experience Layer changes are out of scope.
- **Retroactive recovery of historical scan images** — no backfill from legacy rows or provider-side caches.
- **Implementing user deletion or correction flows** — design-compatible only; workflow deferred.
- **Assigning Evidence Confidence Posture at capture** — posture dimensions acknowledged; storage deferred.
- **Resolving body area or symptom structure from the image** — Body Area Evidence Link and Symptom Observation Evidence deferred.
- **Optimizing image delivery, CDN, or client-side caching strategy** — beyond minimum governed storage posture for evidence persistence.
- **Medical diagnosis, disease labeling, or clinical image classification** — cosmetic scope only.

---

## Implementation Order

This section defines the **authorized sequence of gated artifacts** after plan acceptance. It does not prescribe code, SQL, or storage configuration.

| Step | Artifact | Gate |
|------|----------|------|
| **1** | Accept this plan (Slice 3 scope and boundaries) | Planning sign-off |
| **2** | Slice 2 implementation verified (recommended before Slice 3 code authorization) | Dual-write verification |
| **3** | Slice 3 technical design — store model, binary storage posture, write order, consent/failure rules, read-path posture | Architecture review |
| **4** | Slice 3 SQL draft and migration plan — forward DDL intent, RLS posture, storage linkage, verification queries, rollback intent | Design review; no execution |
| **5** | Slice 3 dual-write code design — extend transitional write path without API response or read-path change | Architecture review |
| **6** | Read-only audit on SQL draft and code design | Quality gate |
| **7** | Readiness review — cross-artifact consistency before migration file creation | Final pre-migration gate |
| **8** | Versioned migration file creation | Separate authorization |
| **9** | Supabase migration execution | Separate execution approval |
| **10** | Application dual-write implementation | Post-migration authorization |
| **11** | Dual-write verification document | Implementation closure |

**Parallel work prohibition:** Do not begin Product Mention Evidence, Routine Mention Evidence, read-path cutover, or AI Analysis Result separation in parallel with Slice 3 planning artifacts.

**Planning-before-code rule:** No step at or below migration file creation may begin until all upstream steps for that step are accepted.

---

## Risks

| Risk | Description | Mitigation posture |
|------|-------------|-------------------|
| **Binary storage complexity** | Image persistence introduces object storage, access URLs, retention, and cost controls not present in Slice 1–2. | Address storage posture explicitly in technical design and migration plan; defer execution until reviewed. |
| **Consent scope coupling** | Image requires both processing and storage consent; partial consent must not produce orphaned binaries. | Consent gate defined in plan; failure rules in downstream code design must stop before AI and before compatibility row when persistence was consented. |
| **Deletion without workflow** | Governed deletion behavior requires binary removal and URL revocation; workflow not implemented in Slice 3. | Design-compatible schema and storage posture; `ON DELETE RESTRICT` or equivalent parent protection consistent with Slice 2; tombstone workflow deferred explicitly. |
| **Dual-write drift** | Image persisted in evidence store but compatibility row implies completeness without verification. | Maintain write-only foundation; verification queries evidence store directly; read paths must not assume image link exists. |
| **Security and access exposure** | Image artifacts are highly sensitive personal data. | RLS and storage access rules consistent with Slice 1 patterns; no public URLs; service-role write posture. |
| **Slice 2 sequencing** | Slice 3 code before Slice 2 verification increases integration risk on shared write path. | Recommend Slice 2 verification before Slice 3 implementation authorization; planning may proceed earlier. |
| **AI observation merge pressure** | Engineering convenience may tempt storing inference metadata on image records. | Binding boundary prohibitions; audit in readiness review. |
| **Legacy backfill expectation** | Stakeholders may expect historical images to appear in evidence store. | Explicit non-goal and out-of-scope; communicate transitional gap for legacy rows. |
| **Storage cost and retention** | Unbounded image retention without governance workflow. | Append-only new captures only; deletion workflow deferred but design must not block future exclusion. |
| **Transitional `user_email` ownership** | Mirrors Slice 1–2 until auth user id migration. | Accepted transitional risk; document in technical design. |

---

## Acceptance Criteria

No Slice 3 implementation may begin until all of the following are satisfied:

| Criterion | Requirement |
|-----------|-------------|
| **Slice 1 verified** | **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** committed and accepted. |
| **Slice 2 scope accepted** | Slice 2 plan and downstream artifacts accepted; Slice 2 implementation verified before code authorization (recommended hard gate). |
| **This plan accepted** | Slice 3 scope, boundaries, in-scope/out-of-scope lists, and non-goals reviewed and signed off. |
| **Object boundaries binding** | Image Evidence conforms to **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** — no prohibited merges. |
| **Consent behavior binding** | `image_processing_consent`, `evidence_storage_consent`, and capture-time ordering per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**. |
| **Deletion impact acknowledged** | Object-level deletion semantics for Image Evidence per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Correction behavior acknowledged** | Correctable object scope per **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Confidence posture acknowledged** | Applicable dimensions per **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md** — separate from `analyses.confidence`. |
| **Schema direction binding** | Evidence Content Store placement per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** — no extension of `analyses` as canonical image store. |
| **Slice 3 technical design** | Separate gated artifact (not this document). |
| **Slice 3 SQL draft + migration plan** | Separate gated artifacts including storage posture (not this document). |
| **Slice 3 dual-write code design + audit** | Separate gated artifacts before code authorization. |

This plan satisfies **slice selection and scope definition** only. It does not close technical design, schema, migration, code design, or implementation gates.

---

## Required Gates Before Implementation

| Gate | Requirement |
|------|-------------|
| **Planning gate** | This document accepted. |
| **Dependency gate** | Slice 1 verified; Slice 2 verified (recommended before implementation). |
| **Design gate** | Technical design, SQL draft, migration plan, and dual-write code design accepted. |
| **Audit gate** | Read-only audit on design artifacts completed; findings resolved or assigned. |
| **Migration gate** | Readiness review passed; versioned migration file reviewed. |
| **Execution gate** | Supabase migration explicitly approved. |
| **Code gate** | Application dual-write explicitly approved post-migration. |

---

## Recommended Next Step

After this plan is reviewed and committed:

1. **Confirm Slice 2 verification status** — if not complete, complete Slice 2 before authorizing Slice 3 implementation artifacts.
2. **Create Slice 3 technical design** — conceptual-to-physical mapping for Image Evidence store, binary storage posture, linkage to `scan_records`, RLS intent consistent with Slice 1–2 patterns. No execution until separately approved.
3. **Create Slice 3 SQL draft and migration plan** — include storage linkage strategy and verification approach. No execution until separately approved.
4. **Create Slice 3 dual-write code design** — extend transitional write order without changing API response or read paths.
5. **Run read-only audit** on SQL draft and code design before any implementation authorization.

Do not begin Product Mention Evidence, Routine Mention Evidence, or read-path cutover in parallel with Slice 3 planning artifacts.

---

## Current Decision

**Phase 1 Slice 3 — Image Evidence is defined for planning only.**

This document selects Image Evidence as the third Evidence Layer increment after Slice 1 session foundation and Slice 2 User Description Evidence. It does **not** authorize:

- Supabase schema changes, migrations, or storage bucket creation
- SQL execution or storage configuration
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes

**Image Evidence records visual capture artifact reference and capture metadata linked to Scan Record V2. It is not AI inference, symptom classification, or diagnostic content.**

Next step is review and commit of this plan, then creation of gated Slice 3 technical design, SQL draft, migration plan, and dual-write code design documents—or handoff to a new session for those artifacts.
