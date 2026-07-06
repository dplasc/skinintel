# Phase 1 Slice 2 — User Description Evidence Plan V1

## Purpose

This document plans **Phase 1 Slice 2: User Description Evidence persistence** as the next incremental Evidence Layer slice after verified Slice 1 dual-write foundation.

It defines scope, object boundaries, relationship to the current scan flow, and gates required before any implementation work. It derives from **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** and accepted Phase 1 planning artifacts for evidence boundaries, consent, deletion, correction, confidence, schema direction, and transitional mapping.

This is a **planning artifact only**. It does not authorize code, SQL, API design, UI design, or Supabase changes.

---

## Why User Description Evidence Next

Slice 1 verified that Scan Record V2, Consent Snapshot, and `analyses` compatibility linkage work in production (**docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**). The next smallest governed increment is the first **user-origin evidence object** that closes a documented capture gap without introducing binary storage or Intelligence Layer separation.

**Rationale:**

| Factor | Why User Description Evidence is next |
|--------|----------------------------------------|
| **Transitional mapping gap** | User description is consumed by AI at inference and **discarded server-side** today; it has no governed persistence (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**). |
| **Lowest-risk child evidence** | Text-only user-origin capture avoids image storage, URL governance, and binary retention complexity that Image Evidence introduces. |
| **Consent scope already defined** | `description_processing_consent` governs description capture and storage (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**). |
| **Foundation dependency satisfied** | User Description Evidence links to Scan Record V2, which Slice 1 already writes and verifies. |
| **Boundary clarity** | Object boundaries are explicit: user voice only—not AI summary, diagnosis, or recommendation (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**). |
| **Deferred complexity** | Image Evidence, Product/Routine Mention Evidence, Evidence Confidence Posture storage, Correction Event storage, and deletion workflow remain out of this slice. |

Image Evidence is a valid alternative next slice but carries higher storage and governance risk; User Description Evidence is the recommended first **content evidence** slice.

---

## Scope

Slice 2 planning covers the following at **conceptual level only**:

- **Persist User Description Evidence** for new scan captures when the user provides description text.
- **Preserve original user text** as user-origin evidence—verbatim or structured self-report as submitted by the user at capture time.
- **Link User Description Evidence to Scan Record V2** created in Slice 1 for the same capture session.
- **Respect consent scope** — persist only when `description_processing_consent` is active in the session Consent Snapshot (or equivalent scope resolution at capture).
- **Maintain Transitional Hybrid posture** — continue writing `analyses` compatibility row; do not cut over read paths from `analyses`.
- **Preserve current API response shape and dashboard/history behavior** — no client contract or UI read-path changes in this slice.
- **Apply append-oriented semantics** — new captures create new evidence records; no silent overwrite of prior description evidence.
- **Plan for future governance hooks** — deletion, correction, and Evidence Confidence Posture must be **design-compatible** with accepted behavior documents but are not implemented in Slice 2.

**Conceptual store placement:** User Description Evidence belongs in the **Evidence Content Stores** group under **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, linked to Scan Record V2.

---

## Out of Scope

The following are explicitly excluded from Slice 2 planning and any future Slice 2 implementation authorized by downstream documents:

| Excluded item | Reason |
|---------------|--------|
| **SQL / migrations / Supabase schema** | Physical persistence design is a separate gated artifact. |
| **API endpoint design or contract changes** | Not authorized by this plan. |
| **UI design or capture flow redesign** | Description input UX remains unchanged. |
| **Application code** | This document does not authorize engineering work. |
| **Image Evidence persistence** | Separate slice; binary storage and metadata governance deferred. |
| **Product Mention / Routine Mention Evidence** | Separate slices. |
| **Symptom Observation Evidence / Body Area Evidence Link** | Structured signal objects deferred. |
| **Evidence Confidence Posture storage** | Posture assignment rules exist at planning level; persistence deferred. |
| **Correction Event storage or correction UX** | Correctability semantics planned; implementation deferred. |
| **Deletion/retention workflow implementation** | Behavior defined; workflow deferred. |
| **AI Analysis Result separation** | Intelligence Layer artifact remains in `analyses.result` during transition. |
| **Read-path cutover from `analyses`** | Compatibility read model remains authoritative for UI. |
| **localStorage governance changes** | Device cache remains non-authoritative. |
| **Legacy backfill** | Prior `analyses` rows and discarded descriptions are not retroactively persisted. |
| **AI summary, paraphrase, or normalization as User Description Evidence** | Prohibited boundary merge. |
| **Diagnosis, disease labels, or recommendation content** | Cosmetic-scope user narrative only. |

---

## Conceptual Object Definition

**User Description Evidence** is Phase 1 user-origin evidence with the following properties:

| Attribute | Definition |
|-----------|------------|
| **Primary responsibility** | Preserve user-provided narrative, context, and self-reported observations as authoritative personal experience. |
| **Origin** | **User-origin only** — content the user typed or voice-to-text attributed to themselves at capture time. |
| **Content rule** | **Original user text preserved** — not AI-generated summary, platform paraphrase, or Intelligence Layer output presented as user voice. |
| **Session linkage** | **Links to Scan Record V2** — each record attaches to the governed capture session anchor for that scan. |
| **Consent linkage** | Created under valid `description_processing_consent` when description text is present; inherits session Consent Snapshot association. |
| **Temporal semantics** | Capture timestamp reflects evidence creation time; append-oriented; not edited in place. |
| **What it owns** | User's own words or structured self-report text; user-origin attestation; capture-time metadata sufficient for provenance. |
| **What it does not own** | AI summaries; structured symptom taxonomy resolution; diagnostic labels; recommendations; Product Intelligence resolution. |

**Boundary prohibitions** (binding from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**):

- **Not AI summary** — AI may consume description for reasoning; it must not replace or overwrite User Description Evidence with paraphrase.
- **Not diagnosis** — no disease labels, clinical framing, or treatment-directed classification stored in this object.
- **Not recommendation** — guidance and action prescriptions belong to the Intelligence Layer, not evidence content stores.
- **Not Symptom Observation Evidence** — free-form user narrative remains distinct from structured cosmetic signal objects unless a future slice explicitly separates them.

**Future governance compatibility** (planned, not Slice 2 implementation):

- **Correction Event** — qualify, supersede, clarify, retract, or dispute (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**).
- **Deletion/retention** — text removal with optional tombstone; exclusion from personalization (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- **Evidence Confidence Posture** — `user_attestation_strength`, `input_completeness`, `source_reliability`, `correction_status` dimensions (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**).

---

## Relationship To Existing Flow

### Current state (post Slice 1)

Per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** and **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**:

1. User submits scan with optional description text.
2. Consent Snapshot and Scan Record V2 are written (Slice 1).
3. Description text is sent to AI as prompt input.
4. AI analysis runs; result persisted in `analyses.result`.
5. **`analyses` compatibility row** written with `scan_record_id` linkage.
6. **User description is not persisted** as governed evidence server-side.

### Target state (Slice 2 — conceptual only)

Intended write order extension after Slice 1 steps, aligned with **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**:

1. Validate auth and consent (unchanged).
2. Create Scan Record V2 (unchanged).
3. Create Consent Snapshot (unchanged).
4. **If user provided description text and `description_processing_consent` is active → create User Description Evidence linked to Scan Record V2**, preserving original user text.
5. Run AI analysis using evidence links (AI flow unchanged in outcome; description remains available as governed input).
6. Write `analyses` compatibility row (unchanged read model; response shape unchanged).

Physical ordering follows the verified Slice 1 implementation because Consent Snapshot requires scan_record_id. This reconciles the conceptual model with the implemented foreign-key dependency documented in the Slice 1 Dual-Write Code Design.

**Read path:** Dashboard and history continue reading `analyses` only. User Description Evidence is written for Personal Evidence Base foundation; it is not exposed through new UI or API surfaces in Slice 2.

**Authority during transition:**

| Concern | Authoritative store |
|---------|---------------------|
| Session anchor | Scan Record V2 |
| Consent at capture | Consent Snapshot |
| User-origin description text | User Description Evidence (when implemented) |
| History/dashboard display | `analyses` compatibility row |
| AI output | `analyses.result` (legacy mixed artifact until AI Analysis Result separation) |

**Empty description:** When the user submits no description, no User Description Evidence record is created. This matches optional-field behavior and `description_processing_consent` scope rules.

---

## Required Gates Before Implementation

No Slice 2 implementation may begin until all of the following are satisfied:

| Gate | Requirement |
|------|-------------|
| **Slice 1 verified** | **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** committed and accepted. |
| **This plan accepted** | Slice 2 scope, boundaries, and out-of-scope list reviewed and signed off. |
| **Object boundaries binding** | User Description Evidence conforms to **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** — no prohibited merges. |
| **Consent behavior binding** | `description_processing_consent` and capture-time ordering per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**. |
| **Deletion impact acknowledged** | Object-level deletion semantics for User Description Evidence per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Correction behavior acknowledged** | Correctable object scope per **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Confidence posture acknowledged** | Applicable dimensions per **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md** — separate from `analyses.confidence` (AI output). |
| **Schema direction binding** | Evidence Content Store placement per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** — no extension of `analyses` as canonical description store. |
| **Slice 2 SQL draft + migration plan** | Separate gated artifacts (not this document). |
| **Slice 2 code design + GLM audit** | Separate gated artifacts before code authorization. |

This plan satisfies **slice selection and scope definition** only. It does not close schema, migration, code design, or implementation gates.

---

## Recommended Next Step

After this plan is reviewed and committed:

1. **Create Slice 2 SQL draft and migration plan** — conceptual-to-physical mapping for User Description Evidence store, linkage to `scan_records`, RLS posture consistent with Slice 1 patterns. No execution until separately approved.
2. **Create Slice 2 dual-write code design** — extend transitional write order in `app/api/scan/route.ts` conceptually: persist description after Scan Record V2, before or alongside AI analysis, without changing API response or read paths.
3. **Run GLM 5.2 read-only audit** on SQL draft and code design before any implementation authorization.

Do not begin Image Evidence, Product Mention Evidence, or read-path cutover in parallel with Slice 2 planning artifacts.

---

## Current Decision

**Phase 1 Slice 2 — User Description Evidence is defined for planning only.**

This document selects User Description Evidence as the next Evidence Layer increment after verified Slice 1 dual-write foundation. It does **not** authorize:

- Supabase schema changes or migrations
- SQL execution
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes

**User Description Evidence is user-origin evidence that preserves original user text and links to Scan Record V2. It is not AI summary, diagnosis, or recommendation.**

Next step is review and commit of this plan, then creation of gated Slice 2 SQL draft and code design documents—or handoff to a new chat for those artifacts.
