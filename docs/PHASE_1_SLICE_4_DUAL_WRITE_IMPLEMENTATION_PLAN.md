# Phase 1 Slice 4 — Dual-Write Implementation Plan

## 1. Purpose

This document defines the **conceptual dual-write execution order** for **Phase 1 Slice 4: Product Mention Evidence** persistence within the established Transitional Hybrid capture path.

It describes the **logical sequence** by which governed mention evidence is written alongside existing session stores, child evidence types, and the `analyses` compatibility read model—without prescribing implementation mechanics, transaction design, or environment-specific execution details.

This is a **dual-write planning artifact only**. It does not authorize application changes, Supabase modifications, migration execution, API contract changes, UI changes, or operational rollout.

Sources: **docs/PHASE_1_SLICE_4_PLAN.md**, **docs/PHASE_1_SLICE_4_TECHNICAL_DESIGN.md**, **docs/PHASE_1_SLICE_4_MIGRATION_PLAN.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft only |
| **Implementation authorization** | Not granted by this document |
| **Code authorization** | Not granted by this document |

---

## 2. Dual-Write Philosophy

Slice 4 extends the evidence-first dual-write model established in Slices 1–3. The following principles govern all capture-path persistence decisions for Product Mention Evidence.

| Principle | Meaning for Slice 4 |
|-----------|---------------------|
| **Evidence-first** | Governed Evidence Layer objects—Scan Record V2, Consent Snapshot, and all applicable child evidence including Product Mention Evidence—are persisted before Intelligence Layer processing and before the compatibility read model write. Personal Evidence Base authority for mention concerns resides in governed mention evidence, not in downstream artifacts |
| **Append-only** | New captures create new mention evidence records. Prior mention records are not silently overwritten, edited in place, or superseded without a future governed Correction Event workflow |
| **No silent overwrite** | Mention content is preserved as user-stated capture input. Normalization is limited to display-safe handling if required for storage consistency—not semantic parsing, entity resolution, or catalog normalization |
| **Compatibility model preserved** | The `analyses` row continues to serve dashboard and history as a transitional denormalized read surface. Its presence must not be treated as proof that Product Mention Evidence was persisted. Slice 4 does not extend `analyses` as the canonical mention store |
| **Intelligence runs after evidence persistence** | AI analysis consumes capture inputs only after applicable governed evidence—including mention evidence when present and consented—has been established. Intelligence output does not precede or substitute for evidence persistence |

These principles inherit from **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md** and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**. Slice 4 adds mention persistence to the child evidence sequence without reordering or altering Slices 1–3 semantics.

---

## 3. Preconditions

Before the conceptual execution sequence begins, the capture path must satisfy the following preconditions. These describe **logical readiness** only—not implementation checks, validation functions, or storage preconditions.

| Precondition | Conceptual requirement |
|--------------|------------------------|
| **Authenticated session** | The capture request originates from an identified user session eligible to initiate a governed scan capture under existing access rules |
| **Scan Record V2 exists** | A governed capture session anchor will be created as the first persistence action in the evidence sequence; all child evidence including Product Mention Evidence links to this anchor |
| **Consent Snapshot exists** | An immutable Consent Snapshot recording active consent scopes at capture initiation will be created and linked to the session before child evidence persistence |
| **Optional inputs identified** | The capture path evaluates which optional inputs are present: user description text, uploaded image, and ingredients/product mention text. Each optional input is assessed independently for presence and consent applicability |
| **Mention text evaluated** | The existing optional ingredients/product mention input is assessed for presence. Absent or empty mention text skips Product Mention Evidence persistence without blocking the remainder of the capture path. Non-empty mention text triggers consent evaluation before persistence |

Additional session-level consent scopes required for the overall capture flow—`cosmetic_analysis_acknowledgement`, `reasoning_consent`, `retention_tracking_consent`, and input-specific scopes for image and description—must be satisfied per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md** before Intelligence processing proceeds.

Slice 4 does not introduce a separate mention-specific consent scope. Mention storage falls under **`evidence_storage_consent`**, consistent with governed child evidence persistence in Slices 2–3.

---

## 4. Conceptual Execution Sequence

The following describes the **logical order of operations** for a governed scan capture path extended with Product Mention Evidence. This sequence is conceptual only—it does not reference application modules, storage APIs, or transaction boundaries.

| Step | Action |
|------|--------|
| **1** | **Validate request** — Confirm the capture request satisfies authentication, rate-limiting, and session-level consent requirements for the capture type |
| **2** | **Establish session context** — Resolve user ownership reference and prepare governed capture session context for evidence persistence |
| **3** | **Create Scan Record V2** — Establish the governed capture session anchor for this capture event |
| **4** | **Create Consent Snapshot** — Record immutable active consent scopes at capture initiation, linked to the session anchor |
| **5** | **Persist User Description Evidence (if applicable)** — When description text is non-empty and `description_processing_consent` is active, persist user-origin description evidence linked to the session (Slice 2) |
| **6** | **Persist Image Evidence (if applicable)** — When image is present and required image and storage consent scopes are active, persist governed visual evidence linked to the session (Slice 3) |
| **7** | **Evaluate mention input** — Assess whether ingredients/product mention text is present. If absent, skip step 8 and proceed to step 9 |
| **8** | **Persist Product Mention Evidence (if applicable)** — When mention text is non-empty and `evidence_storage_consent` is active, persist unverified user-stated mention evidence linked to the session (Slice 4) |
| **9** | **Continue AI analysis** — Intelligence Layer consumes capture inputs; governed evidence is already established |
| **10** | **Write analyses compatibility record** — Persist transitional denormalized read model row for dashboard and history; non-authoritative for Evidence Layer concerns |
| **11** | **Finish request** — Return capture response to the client with unchanged contract shape |

### Ordering invariants

- Steps 3–8 establish governed evidence before Intelligence processing (step 9) and compatibility write (step 10)
- Slice 4 adds step 7 evaluation and step 8 persistence only; steps 3–6 preserve Slices 1–3 semantics without reordering
- Steps 5, 6, and 8 are independently conditional—any combination may produce child evidence on the same Scan Record V2 when all applicable inputs are present and consented
- Evidence Confidence Posture attachment remains deferred; it is not part of this sequence

---

## 5. Conditional Paths

The capture path branches based on mention input presence and consent alignment. The following describes expected behavior for each path at a conceptual level.

### No mention text

| Condition | Expected behavior |
|-----------|-------------------|
| Mention input absent or empty | Step 8 is skipped. No Product Mention Evidence record is created |
| Flow continuation | Steps 9–11 proceed per existing session rules when all other preconditions and child evidence requirements are satisfied |
| Other child evidence | User Description Evidence and Image Evidence persistence follow their own independent optional-field rules in steps 5–6 |

This path is equivalent to pre–Slice 4 behavior for captures without mention text.

### Mention text + consent

| Condition | Expected behavior |
|-----------|-------------------|
| Mention text non-empty and `evidence_storage_consent` active in Consent Snapshot | Step 8 persists Product Mention Evidence linked to Scan Record V2 |
| Content handling | Mention text is stored verbatim as user-stated capture input—no catalog lookup, product identity resolution, or ingredient entity resolution |
| Flow continuation | Steps 9–11 proceed after successful mention evidence persistence |
| Coexistence | When description and image are also present and consented, steps 5, 6, and 8 may all produce child evidence on the same session anchor |

### Mention text without consent

| Condition | Expected behavior |
|-----------|-------------------|
| Mention text non-empty but `evidence_storage_consent` not active (or other blocking session consent failure) | **Fail closed** |
| Product Mention Evidence | Not persisted |
| AI analysis | Does not proceed |
| Compatibility record | Not written |
| Session posture | Governed capture does not complete with partial success. Mention text must not be silently discarded while other evidence persists and the session completes as if authorized |

This mirrors Slice 2 optional-field consent discipline: present content with missing authorization blocks the governed write path.

### Persistence failure

| Condition | Expected behavior |
|-----------|-------------------|
| Mention text present, consent valid, mention evidence persistence fails | **Fail closed** |
| AI analysis | Does not proceed |
| Compatibility record | Not written |
| Error surfacing | Capture request returns failure; no partial success masking |
| Prior evidence | Session-level failure discipline applies; Slices 1–3 evidence already written in the same attempt must not be left in an inconsistent state relative to the fail-closed posture defined in technical design |

Failure must occur before Intelligence processing and before compatibility write when mention persistence is required but fails.

---

## 6. Failure Discipline

Slice 4 inherits fail-closed, evidence-first failure discipline from Slices 1–3. The following rules bind all dual-write execution.

| Rule | Requirement |
|------|-------------|
| **Fail closed** | When mention text is present and governed persistence is required but cannot complete—due to missing consent, storage failure, or session integrity failure—the capture path must not proceed to AI analysis or compatibility write. Partial success that implies a completed governed session is prohibited |
| **No orphan evidence** | Product Mention Evidence must always link to a valid Scan Record V2 created in the same governed capture session. Mention records must not exist without session linkage or without consent provenance through the Consent Snapshot chain |
| **No compatibility write after failure** | The `analyses` compatibility record must not be written when mention persistence was required and failed. Compatibility row presence must not suggest governed mention evidence exists when it does not |
| **Preserve previous slices** | Slice 4 failure or rollback must not corrupt Slice 1–3 semantics. Scan Record V2 and Consent Snapshot integrity rules remain unchanged. User Description Evidence and Image Evidence dual-write paths must not be reordered or altered. Regression in Slices 1–3 is a halt condition for Slice 4 rollout |

Session-level failure handling applies when a governed capture cannot complete coherently. The exact reconciliation posture for evidence written before a downstream failure is defined in downstream authorized artifacts—not in this conceptual plan.

---

## 7. Evidence Authority

Authority for each concern during Transitional Hybrid dual-write is explicit and non-negotiable.

| Concern | Authoritative store | Non-authoritative surface |
|---------|---------------------|---------------------------|
| **Capture session identity** | Scan Record V2 | `analyses` row ID |
| **Consent at capture time** | Consent Snapshot | Legacy boolean flags on compatibility row |
| **User description content** | User Description Evidence | AI prompt input alone; embedded JSON in compatibility row |
| **Visual capture artifact** | Image Evidence | In-memory image at inference |
| **Product/ingredient mention text** | Product Mention Evidence | AI prompt input alone; client-side scoring output |
| **AI analysis output** | Intelligence Layer artifact (currently embedded in compatibility row during transition) | Not stored in mention evidence |
| **History and dashboard display** | Compatibility read model (`analyses`) for current UI | Not authoritative for evidence existence or content |

### Binding authority rules

- **Evidence stores remain authoritative** for Personal Evidence Base concerns. Product Mention Evidence is the authoritative record of user-stated mention content for new captures once dual-write is active
- **`analyses` is compatibility only** — a denormalized transitional read surface for legacy UI. It must not become the canonical mention store and must not be extended to hold governed mention evidence as primary storage
- **No Product Intelligence** — mention evidence records what the user said, not verified product identity, composition, or catalog match results. Catalog lookup and product resolution are prohibited Knowledge Layer behavior
- **No Ingredient Intelligence** — mention text is not resolved into canonical ingredient entities or ingredient vocabulary. Ingredient names in user input remain unverified mention content

Client-side `scoreProduct` logic and device cache (`localStorage`) remain non-authoritative and unaffected by server mention evidence writes per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

---

## 8. Operational Constraints

The following constraints bind Slice 4 dual-write execution and must not be relaxed for delivery convenience.

| Constraint | Requirement |
|------------|-------------|
| **Additive only** | Slice 4 extends the write path with mention evidence persistence. It does not modify Slice 1–3 write semantics, reorder prior steps, or alter existing store behavior |
| **No read-path changes** | Dashboard, history, and all Experience Layer consumers continue reading from the compatibility model. Product Mention Evidence is write-only foundation in Slice 4 |
| **No UI changes** | The existing optional ingredients/product mention capture input remains unchanged. No product-selection UX, catalog browsing, or new capture surfaces |
| **No API changes** | Scan response contract and client-visible behavior unchanged. Server mention evidence is not exposed to client consumers in Slice 4 |
| **No historical backfill** | Prior captures where mention text was consumed ephemerally at inference are not retroactively persisted. Transitional gap for legacy rows is an explicit non-goal |

Additional prohibited behaviors from object boundaries:

- No parsing or duplicating mention content from User Description Evidence
- No storing AI analysis output, client scoring metadata, or catalog-derived match results in mention evidence
- No hardcoded consent booleans substituting for Consent Snapshot scope enumeration

---

## 9. Verification Readiness

Before Slice 4 dual-write rollout is authorized, implementation review must confirm readiness against the following verification dimensions. These describe **what review will validate**—not queries, test scripts, or code inspection procedures.

### Capture path verification

| Review dimension | Expected outcome |
|------------------|-------------------|
| **Mention present, consent valid** | Product Mention Evidence linked to correct Scan Record V2 |
| **Mention absent** | No mention evidence record; capture completes successfully |
| **Mention present, consent missing** | Fail closed; no mention evidence, no AI analysis completion, no compatibility record |
| **Full coexistence** | Capture with image, description, and mention produces all applicable child evidence types on same session anchor |

### Consent verification

| Review dimension | Expected outcome |
|------------------|-------------------|
| **Storage consent alignment** | Mention evidence persisted only when session Consent Snapshot includes active `evidence_storage_consent` |
| **No unconsented rows** | Zero mention evidence records without valid session storage consent provenance |
| **Snapshot immutability respected** | Capture-time authorization recorded via Consent Snapshot; not substituted by mutable consent state |

### Boundary verification

| Review dimension | Expected outcome |
|------------------|-------------------|
| **No intelligence merge** | Mention records contain user-stated text only—no product IDs, ingredient entities, catalog metadata, or scoring output |
| **No AI output embedded** | Mention records do not contain AI analysis content or inference-derived product references |
| **No description cross-contamination** | Mention content matches form-submitted mention input, not duplicated from User Description Evidence |
| **Source input only** | Mention evidence derives from existing capture field only—not catalog lookup, product selection, or AI extraction |

### Regression verification

| Review dimension | Expected outcome |
|------------------|-------------------|
| **Slices 1–3 unchanged** | Session, consent, description, and image evidence dual-write behavior preserved |
| **Read paths unchanged** | Dashboard and history continue reading compatibility model only |
| **Compatibility linkage intact** | Session reference pattern on compatibility records preserved |
| **Failure posture confirmed** | Simulated mention persistence failure blocks AI analysis and compatibility write |

### Authority verification

| Review dimension | Expected outcome |
|------------------|-------------------|
| **Direct store confirmation** | Mention evidence persistence confirmed by querying governed evidence store—not inferred from compatibility record alone |
| **Compatibility subordination** | Compatibility record existence does not imply mention evidence persistence |

Formal Slice 4 dual-write verification documentation—equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**—is required after rollout and before Slice 5 planning authorization.

---

## 10. Current Decision

**Phase 1 Slice 4 dual-write implementation planning is defined for review only.**

This document specifies the conceptual execution order for Product Mention Evidence persistence within the established Transitional Hybrid capture path—evidence-first ordering, conditional mention paths, fail-closed discipline, and evidence authority rules—while preserving Slices 1–3, the `analyses` compatibility model, and all user-visible production behavior.

This document does **not** authorize:

- Application code changes
- Supabase schema changes or migration execution
- API contract or response shape changes
- UI design or capture flow changes
- Product Intelligence, Ingredient Intelligence, or catalog integration
- Operational rollout or production deploy

**Product Mention Evidence records user-stated ingredient/product mention text from the existing capture input, linked to Scan Record V2. It is not Product Intelligence, Ingredient Intelligence, catalog resolution, client scoring output, or AI inference.**

**Implementation planning is complete only after review and commit of this document.** Pre-implementation audit, migration Phase C activation, and formal verification artifact follow in gated sequence per **docs/PHASE_1_SLICE_4_MIGRATION_PLAN.md** before any code work begins.
