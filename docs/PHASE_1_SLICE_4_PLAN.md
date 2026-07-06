# Phase 1 Slice 4 — Product Mention Evidence Plan

## 1. Purpose

This document plans **Phase 1 Slice 4: Product Mention Evidence persistence** as the next incremental Evidence Layer slice after Slices 1–3.

**Core capture modality:** The live scan flow already submits user-stated **ingredient/product mention text** via the existing optional capture input. Slice 4 persists that input as governed mention evidence. It does **not** introduce product-selection UX, catalog browsing, or a new capture surface.

Slice 4 closes the last remaining server-submitted capture gap: mention text is consumed at AI inference and in client-side scoring but **not persisted as governed mention evidence**. It establishes the first **mention evidence object** in the Personal Evidence Base while preserving Transitional Hybrid posture, existing UI read paths, and Phase 1 object boundaries.

This is a **planning artifact only**. It does not authorize code, schema work, storage configuration, API design, UI design, or Supabase changes.

Sources: **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**.

---

## 2. Current Completed Scope (Slices 1–3 Summary)

### Slice 1 — Session and consent foundation

| Deliverable | Status |
|-------------|--------|
| **Scan Record V2** (`scan_records`) | Operational — governed capture session anchor written on new scans |
| **Consent Snapshot** (`consent_snapshots`) | Operational — immutable scope record linked to session |
| **Compatibility linkage** (`analyses.scan_record_id`) | Operational — transitional read model references session anchor |
| **Dual-write authority model** | Verified — evidence-first write order for session stores; failure posture documented |

Slice 1 established the session anchor and consent provenance required for all child evidence. Legacy `analyses` rows and current history/dashboard read paths remain intact.

### Slice 2 — User Description Evidence

| Deliverable | Status |
|-------------|--------|
| **User Description Evidence** (`user_description_evidence`) | Operational — user-origin description text persisted when non-empty and consented |
| **Consent gating** | `description_processing_consent` required when description present |
| **Write-only foundation** | No read-path cutover; dashboard and history unchanged |
| **Child evidence pattern** | Established consent-gated, session-linked, append-oriented dual-write precedent |

Slice 2 closed the text-only user-origin capture gap without binary storage complexity.

### Slice 3 — Image Evidence

| Deliverable | Status |
|-------------|--------|
| **Image Evidence** (`image_evidence`) | Operational — relational evidence row with capture metadata |
| **Private object storage** | Operational — governed binary artifact in `image-evidence` bucket |
| **Consent gating** | `image_processing_consent` and `evidence_storage_consent` required when image present |
| **Failure cleanup posture** | Storage upload failure stops before relational insert; relational insert failure triggers storage cleanup attempt |
| **Coexistence with Slice 2** | Both child evidence types may attach to the same Scan Record V2 |

Slice 3 closed the primary visual capture gap. Image Evidence records visual artifact reference and capture metadata only — not AI inference.

### Remaining capture gap (pre–Slice 4)

Per **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** and **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, the live scan flow still treats the **existing ingredients/product mention input** as ephemeral:

- Submitted via the current optional capture field as user-stated ingredient or product text — not catalog product selection
- Consumed by AI analysis at inference time
- Used in client-side product scoring after scan response
- **Not stored server-side** as governed mention evidence

**Deferred to later slices** (no current capture surface or governed structuring path):

| Object | Why deferred |
|--------|--------------|
| **Routine Mention Evidence** | No dedicated routine input exists; extracting from User Description Evidence is a prohibited boundary merge. |
| **Symptom Observation Evidence** | No structured symptom capture in the live flow; requires explicit capture UX or a governed structuring gate — not AI output embedded in `analyses.result`. |
| **Body Area Evidence Link** | No body-area selection in the live flow; requires explicit user selection or a provenance-clear association path — not image inference alone. |

Evidence Governance stores (Correction Event, Evidence Confidence Posture, deletion markers) and Intelligence Layer separation remain deferred.

---

## 3. Proposed Slice 4 Objective

**Persist Product Mention Evidence for new scan captures when the user provides text in the existing ingredients/product mention input**, as unverified user-stated context linked to Scan Record V2, under valid session consent.

Slice 4 completes the **mention text** increment in the Evidence Content Stores group. It records what the user typed at capture time — not catalog resolution, product identity, ingredient entities, or Intelligence Layer enrichment.

The objective is planning-level selection and scope definition for the fourth minimal implementation increment. It does not close technical design, migration, code design, or implementation gates.

### Prohibited boundaries (binding)

Slice 4 mention evidence must **not**:

- Perform catalog lookup or product catalog matching
- Resolve product identity or canonical product IDs
- Resolve ingredient entities or canonical ingredient vocabulary
- Invoke or persist **Product Intelligence** or **Ingredient Intelligence**
- Persist client-side `scoreProduct` logic, scoring metadata, or catalog-derived match results
- Extract or duplicate mention content from User Description Evidence

---

## 4. In Scope

Slice 4 planning covers the following at **conceptual level only**:

- **Persist Product Mention Evidence** when the existing ingredients/product mention input is non-empty and consent permits storage.
- **Preserve user-origin mention content** — verbatim as submitted; no normalization into Product Model or ingredient entities.
- **Link Product Mention Evidence to Scan Record V2** for the same capture session.
- **Respect consent scope** — persist only when session Consent Snapshot includes scopes that authorize mention storage (principally `evidence_storage_consent`; consistent with Slice 2–3 child evidence patterns).
- **Maintain Transitional Hybrid posture** — continue writing `analyses` compatibility row; do not cut over read paths from `analyses`.
- **Preserve current API response shape and dashboard/history behavior** — no client contract, capture UX, or read-path changes.
- **Extend dual-write write order** — mention evidence persisted after session, consent, and existing child evidence types, before AI analysis (transitional mapping step 6).
- **Apply append-oriented semantics** — new captures create new mention records; no silent overwrite.
- **Coexist with Slices 2–3 child evidence** on the same Scan Record V2 when all applicable inputs are present.
- **Plan for future governance hooks** — deletion, correction, and Evidence Confidence Posture design-compatible but not implemented in Slice 4.

**Conceptual store placement:** Product Mention Evidence belongs in the **Evidence Content Stores** group under **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, linked to Scan Record V2.

---

## 5. Explicitly Out of Scope

The following are excluded from Slice 4 planning and any future Slice 4 implementation authorized by downstream documents:

| Excluded item | Reason |
|---------------|--------|
| **Schema, migrations, or Supabase changes** | Separate gated artifact. |
| **API, UI, or capture flow changes** | Existing ingredients/product mention input UX unchanged; no product-selection UX. |
| **Application code** | Not authorized by this plan. |
| **Catalog lookup, product identity resolution, ingredient entity resolution** | Prohibited Knowledge Layer merges — see §3 Prohibited boundaries. |
| **Product Intelligence / Ingredient Intelligence** | Phase 1 Evidence Layer only; no enrichment or resolution. |
| **Client-side `scoreProduct` persistence** | Dashboard catalog scoring remains client-side and separate from server mention evidence. |
| **Routine Mention Evidence** | Deferred until a dedicated routine capture surface exists. |
| **Symptom Observation Evidence** | Deferred until explicit structured symptom capture or a governed structuring gate exists. |
| **Body Area Evidence Link** | Deferred until explicit user selection or a provenance-clear association path exists. |
| **Evidence Confidence Posture, Correction Event, deletion workflow** | Design-compatible only; implementation deferred. |
| **AI Analysis Result separation, read-path cutover, localStorage governance, legacy backfill** | Unchanged transitional posture. |
| **Mention extraction from User Description Evidence** | Prohibited boundary merge. |
| **Medical diagnosis, disease labeling, clinical classification** | Cosmetic scope only. |

---

## 6. Dependencies

Slice 4 cannot be planned or implemented in isolation. The following dependencies are mandatory.

### Slice 1 — Session and consent foundation

| Dependency | Requirement |
|------------|-------------|
| **Scan Record V2 operational** | `scan_records` written on new captures. |
| **Consent Snapshot operational** | `consent_snapshots` linked to session; scope enumeration includes `evidence_storage_consent` and `reasoning_consent`. |
| **Compatibility linkage** | `analyses.scan_record_id` references governed session anchor. |
| **Dual-write authority model** | Evidence-first write order and failure posture verified for session stores. |
| **RLS posture pattern** | User-scoped read, service-role write pattern established. |

### Slice 2 — Text child evidence precedent

| Dependency | Requirement |
|------------|-------------|
| **Child evidence dual-write pattern** | User Description Evidence establishes consent-gated, session-linked, write-only child evidence without read-path cutover. |
| **Optional-field semantics** | Empty optional input skips evidence row creation; flow continues — same pattern expected for absent mention text. |
| **Non-interference** | Slice 4 extends write order; it does not alter User Description Evidence semantics. |

### Slice 3 — Binary child evidence precedent

| Dependency | Requirement |
|------------|-------------|
| **Extended write order validated** | Image Evidence proves multi-type child evidence coexistence on shared session anchor. |
| **Failure stage discipline** | Established failure logging and fail-closed posture for child evidence persistence. |
| **Single-project execution posture** | If applicable, production/main controlled execution model from Slice 3 remains binding for infrastructure work. |

### Upstream planning artifacts (all slices)

Slice 4 inherits binding constraints from Phase 1 gates 1–14, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, behavioral governance documents (consent, deletion, correction, confidence), and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**. No Slice 4 artifact may contradict accepted upstream decisions.

### Recommended sequencing gates

| Gate | Requirement |
|------|-------------|
| **Planning** | This document accepted — does not require Slice 3 formal verification documentation. |
| **Implementation** | Formal Slice 3 dual-write verification documentation (equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**) is a **recommended hard gate** before Slice 4 implementation authorization. Slices 1–3 must be operational in the application write path. |

---

## 7. Risks

| Risk | Description | Mitigation posture |
|------|-------------|-------------------|
| **Product Intelligence / Ingredient Intelligence merge** | Catalog lookup, entity resolution, or scoring metadata on mention records. | §3 Prohibited boundaries; readiness review audit. |
| **Ingredient vs product naming** | Object is Product Mention Evidence; capture field is ingredient/product text. | Technical design maps text to mention evidence without entity resolution. |
| **Client-server conflation** | Server mention evidence vs client `scoreProduct` scoring. | Server persists capture input only; scoring stays client-side. |
| **Description cross-contamination** | Mention text might be duplicated or parsed from User Description Evidence. | Prohibited merge; mention evidence captures form-submitted mention input only. |
| **Deletion without workflow** | Governed deletion requires mention content removal and tombstone markers; workflow not implemented in Slice 4. | Design-compatible schema; parent protection consistent with Slice 2–3; tombstone workflow deferred explicitly. |
| **Legacy backfill expectation** | Stakeholders may expect historical ingredient input to appear in evidence store. | Explicit non-goal; communicate transitional gap for legacy rows. |
| **Transitional `user_email` ownership** | Mirrors Slice 1–3 until auth user id migration. | Accepted transitional risk; document in technical design. |
| **Write-path complexity** | Four child evidence types on shared session increases ordering and failure surface. | Extend established dual-write pattern; do not reorder Slice 1–3 steps; fail-closed on mention persistence failure when mention present and consented. |

---

## 8. Acceptance Criteria

No Slice 4 implementation may begin until all of the following are satisfied:

| Criterion | Requirement |
|-----------|-------------|
| **Slices 1–3 operational** | Session foundation, User Description Evidence, and Image Evidence dual-write paths operational in target environment. |
| **Slice 3 verification (implementation gate)** | Formal Slice 3 dual-write verification document committed and accepted — **required before implementation**, not before accepting this plan. |
| **This plan accepted** | Slice 4 scope, boundaries, in-scope/out-of-scope lists reviewed and signed off. |
| **Object boundaries binding** | Product Mention Evidence conforms to **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** — no prohibited merges with Product Intelligence, Ingredient Intelligence, or User Description Evidence. |
| **Consent behavior binding** | Mention persistence gated on session Consent Snapshot scopes per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**. |
| **Deletion impact acknowledged** | Object-level deletion semantics for Product Mention Evidence per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Correction behavior acknowledged** | Correctable object scope per **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Confidence posture acknowledged** | Applicable dimensions (`product_mention_specificity`, `user_attestation_strength`, `correction_status`) per **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md** — separate from `analyses.confidence`. |
| **Schema direction binding** | Evidence Content Store placement per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** — no extension of `analyses` as canonical mention store. |
| **Slice 4 technical design** | Separate gated artifact (not this document). |
| **Slice 4 migration plan** | Separate gated artifact (not this document). |
| **Slice 4 dual-write code design + audit** | Separate gated artifacts before code authorization. |

This plan satisfies **slice selection and scope definition** only. It does not close technical design, schema, migration, code design, or implementation gates.

---

## 9. Verification Strategy

Verification belongs to downstream implementation closure artifacts. At planning level, Slice 4 success is verified through the following strategy:

### Planning verification (this document)

| Check | Expected outcome |
|-------|------------------|
| **Slice selection clarity** | Product Mention Evidence is the agreed fourth minimal increment. |
| **Boundary preservation** | User-stated mentions and Product Intelligence remain separated at planning level. |
| **Transitional Hybrid intact** | `analyses` remains compatibility read model; evidence stores remain authoritative for mention concerns. |
| **Capture gap addressed** | Product/ingredient text ephemeral gap from audit and mapping documents is explicitly closed by Slice 4 scope. |

### Implementation verification (future artifacts)

| Check | Expected outcome |
|-------|------------------|
| **Happy path** | New scan with mention text produces Product Mention Evidence row linked to correct `scan_record_id`. |
| **Optional field** | Scan without mention text produces no Product Mention Evidence row; flow completes successfully. |
| **Consent audit** | Join mention evidence → `scan_records` → `consent_snapshots` confirms required storage scopes present when mention persisted. |
| **Coexistence** | Scan with image, description, and mention text produces all applicable child evidence types on same session. |
| **Read-path unchanged** | Dashboard and history continue reading `analyses` only; no new client exposure of mention evidence. |
| **Failure posture** | Simulated mention persistence failure returns error; does not produce `analyses` row if fail-closed ordering is adopted in code design. |
| **Regression** | Slice 1–3 evidence rows and compatibility linkage unaffected by Slice 4 changes. |
| **Boundary audit** | No catalog lookup, product identity resolution, ingredient entity resolution, Product Intelligence, Ingredient Intelligence, or client scoring data on mention records. |
| **Direct store verification** | Persistence confirmed by querying evidence store directly — not inferred from compatibility row alone. |

Implementation verification document (equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**) is required before Slice 5 planning authorization.

---

## 10. Rollback Considerations

Slice 4 introduces additive Evidence Layer persistence only. Rollback posture follows the established Phase 1 incremental model:

### Planning rollback

| Action | Effect |
|--------|--------|
| **Reject or defer this plan** | No Slice 4 artifacts or implementation authorized; Slices 1–3 remain operational; product/ingredient text continues ephemeral server-side behavior. |

### Infrastructure rollback (future migration)

| Action | Effect |
|--------|--------|
| **Revert additive schema migration** | Requires explicit rollback plan in migration artifact; must not alter or drop Slice 1–3 tables or `analyses` compatibility structure. |
| **Application dual-write disable** | Stop writing Product Mention Evidence while leaving table in place — lowest-risk operational rollback if mention persistence causes production issues. |

### Data and compatibility considerations

| Concern | Rollback rule |
|---------|---------------|
| **Existing mention evidence rows** | Rollback does not require deleting rows created during Slice 4 unless governed deletion workflow is invoked separately. |
| **`analyses` compatibility rows** | Unaffected by mention evidence rollback; history and dashboard continue functioning. |
| **Slice 1–3 child evidence** | Rollback of Slice 4 must not mutate or invalidate prior session, description, or image evidence. |
| **Client-side scoring** | Unaffected — client path does not depend on server-side mention evidence in Slice 4. |

### Rollback triggers (operational)

Halt Slice 4 rollout and evaluate rollback if:

- Mention persistence failure rate exceeds acceptable threshold on production capture path
- Consent audit queries show mention rows created without valid session storage consent
- Boundary audit detects Product Intelligence merge or description cross-contamination
- Slice 1–3 regression detected on shared write path

Full rollback authorization requires explicit operator approval recorded per Slice 3 single-project execution posture where applicable.

---

## Current Decision

**Phase 1 Slice 4 — Product Mention Evidence is defined for planning only.**

This document selects Product Mention Evidence as the fourth Evidence Layer increment after Slice 1 session foundation, Slice 2 User Description Evidence, and Slice 3 Image Evidence. It does **not** authorize:

- Supabase schema changes or migrations
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes
- Product Intelligence, Ingredient Intelligence, or catalog integration

**Product Mention Evidence records user-stated ingredient/product mention text from the existing capture input, linked to Scan Record V2. It is not Product Intelligence, Ingredient Intelligence, catalog resolution, client scoring output, or AI inference.**

**Routine Mention Evidence is the likely Slice 5 candidate** — deferred until a real routine capture surface exists.

Next step is review and commit of this plan, then creation of gated Slice 4 technical design, migration plan, and dual-write code design documents — or handoff to a new session for those artifacts.
