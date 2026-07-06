# Phase 1 Slice 4 — Product Mention Evidence Technical Design

## 1. Purpose

This document defines the **technical design boundary** for **Phase 1 Slice 4: Product Mention Evidence** — the fourth incremental Evidence Layer persistence slice after Slices 1–3.

It translates **docs/PHASE_1_SLICE_4_PLAN.md** into object definition, conceptual fields, consent rules, dual-write order, failure posture, boundary protections, read-path constraints, and verification requirements. It inherits binding constraints from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, and **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**.

This is a **technical design artifact only**. It does **not** authorize implementation, Supabase schema work, migrations, application code, API contract changes, or UI design.

---

## 2. Object Definition

**Product Mention Evidence** is a **user-origin Evidence Layer object** in the **Evidence Content Stores** group (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**). It captures the existing ingredients/product mention text submitted during scan capture — what the user typed in the optional capture field — as governed personal evidence linked to Scan Record V2.

### Primary responsibility

Record products the user mentioned during scan capture **without verifying product identity**. Preserve user-stated mention content as authoritative personal attestation at capture time.

### What Product Mention Evidence is

- **Unverified** — no catalog match, no canonical product ID, no ingredient entity resolution
- **User-stated** — content originates from explicit user input at capture; not AI-generated, not platform-inferred
- **Linked to Scan Record V2** — child evidence of the governed capture session anchor; inherits session consent provenance via Consent Snapshot linkage
- **Append-oriented** — new captures create new mention records; no silent overwrite of prior mentions

### What Product Mention Evidence is not

| Concern | Status |
|---------|--------|
| **Product Intelligence** | Not — no identity resolution, composition, or enrichment |
| **Ingredient Intelligence** | Not — no canonical ingredient vocabulary or entity resolution |
| **Catalog matching** | Not — no lookup, match confidence, or webshop linkage |
| **Client-side scoring output** | Not — server mention evidence is distinct from client `scoreProduct` logic and scoredProducts metadata |
| **AI inference** | Not — does not store AI analysis output, model conclusions, or inference-derived product references |

Product Mention Evidence records *what the user said* — a brand name, partial label, informal product description, or ingredient/product text — not what the platform verified. Phase 2 Knowledge Layer resolution is out of scope.

### Boundary clarifications

- **Not User Description Evidence** — mention evidence captures form-submitted mention input only; parsing or duplicating content from User Description Evidence is prohibited (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).
- **Not Routine Mention Evidence** — routine context is a separate deferred object; Slice 4 does not extract regimen structure from mention text.
- **Correctable in future** — Product Mention Evidence is within Correction Event scope (qualify, supersede, retract) per **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**; correction workflow is not implemented in Slice 4.

---

## 3. Source Input

### Defined source

The **sole source input** for Product Mention Evidence is the **existing scan capture ingredients/product mention text input** — the optional field already present in the live scan flow where users enter free-text ingredient or product references.

Content is accepted **verbatim as submitted** at capture time. No structuring, entity extraction, or normalization into Product Model or ingredient entities occurs in Slice 4.

### Explicit exclusions from source derivation

| Excluded source | Reason |
|-----------------|--------|
| **New UI or capture surface** | Slice 4 persists existing input only |
| **Product selection UX** | No catalog browsing or product picker |
| **Parsing from User Description Evidence** | Prohibited boundary merge |
| **Extraction from AI Analysis Result** | AI output is Intelligence Layer; not evidence origin |
| **Catalog lookup** | Prohibited Knowledge Layer behavior |

The capture field may contain ingredient names, product names, brand references, or informal labels. All are stored as unverified mention text without semantic classification into product vs ingredient entities.

---

## 4. Conceptual Fields

The following are **conceptual fields only**. They describe the Product Mention Evidence object for downstream migration and code design. They do **not** define database tables, column names, column types, indexes, or SQL.

| Field | Description |
|-------|-------------|
| **evidence id** | Stable identifier for this Product Mention Evidence record within the Personal Evidence Base |
| **scan record link** | Reference to parent Scan Record V2 — the governed capture session anchor for this mention |
| **user ownership reference** | Reference to the user who owns this evidence (transitional: may mirror Slice 1–3 `user_email` pattern until auth user id migration) |
| **raw mention text** | Verbatim user-submitted ingredients/product mention text from capture input |
| **normalized display text** | Optional display-safe normalization (e.g., whitespace trim, encoding normalization) if needed for storage consistency — **not** semantic parsing, entity resolution, or catalog normalization |
| **source type** | Provenance indicator that content originated from user capture input (e.g., `scan_capture_mention_field`) — distinguishes user-direct input from any future governed structuring paths |
| **consent snapshot link** | Inherited via Scan Record V2 — proves which consent scopes were active when mention was persisted |
| **capture timestamp** | Time the mention evidence was recorded at capture; aligned with session capture time, not correction or AI inference time |
| **correction status placeholder** | Design-compatible hook for Correction Event chain resolution (`correction_status` dimension per **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**) — not populated or enforced in Slice 4 |
| **deletion/retention status placeholder** | Design-compatible hook for deletion exclusion and tombstone markers per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** — not populated or enforced in Slice 4 |
| **confidence posture placeholder** | Design-compatible hook for Evidence Confidence Posture attachment (`product_mention_specificity`, `user_attestation_strength`, `correction_status` dimensions) — not populated or enforced in Slice 4 |

No database column types, constraints, or physical storage layout are defined in this document.

---

## 5. Consent Behavior

Product Mention Evidence persistence is **consent-gated**. Consent rules derive from **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md** and Slice 2–3 child evidence precedent.

### Primary gate: `evidence_storage_consent`

**`evidence_storage_consent`** is the **primary gate** for persisting Product Mention Evidence. This scope authorizes server-side persistence of capture session and attached evidence in the Personal Evidence Base.

When mention text is present and persistence is attempted, the session Consent Snapshot must include active **`evidence_storage_consent`**. Without it, mention evidence must not be written.

### Supporting session scopes

The following scopes are required for the overall capture flow but are not mention-specific storage gates:

| Scope | Role for mention slice |
|-------|------------------------|
| **`cosmetic_analysis_acknowledgement`** | Mandatory for any scan session |
| **`reasoning_consent`** | Required before AI analysis proceeds after evidence persistence |
| **`retention_tracking_consent`** | Required for standard history/dashboard persistence posture |
| **`image_processing_consent`** | Required when image present (Slice 3); independent of mention |
| **`description_processing_consent`** | Required when description present (Slice 2); independent of mention |

Slice 4 does not introduce a separate mention-specific consent scope. Mention storage falls under **`evidence_storage_consent`**, consistent with governed child evidence persistence.

### Mention text absent

If mention text is empty or absent, **`evidence_storage_consent`** is not invoked for mention purposes. No Product Mention Evidence row is created. The capture flow continues normally.

### Mention text present but consent missing

If mention text is **non-empty** but **`evidence_storage_consent`** is **not** active in the session Consent Snapshot (or required session scopes are otherwise unsatisfied):

- **Fail closed** — do not persist Product Mention Evidence
- **Do not proceed** to AI analysis or `analyses` compatibility row write under fail-closed dual-write posture
- **Do not silently discard** mention text while persisting other evidence and completing the session — governed persistence requires explicit consent alignment

This mirrors Slice 2 optional-field consent discipline: present content with missing authorization blocks the governed write path rather than creating orphan or unconsented evidence.

### Consent Snapshot immutability

Consent Snapshot is immutable after creation. Withdrawal of current consent does not mutate historical snapshots. Mention evidence persisted under a valid snapshot retains capture-time authorization record regardless of subsequent consent changes (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).

---

## 6. Dual-Write Order

Slice 4 **extends** the established Slices 1–3 dual-write sequence. It adds Product Mention Evidence persistence without reordering prior steps.

The following is **conceptual design only** — not code, not transaction specification, not API contract.

| Step | Action |
|------|--------|
| **1** | **Validate session/user** — authenticate capture request; verify required consent scopes for capture type |
| **2** | **Create Scan Record V2** — governed capture session anchor |
| **3** | **Create Consent Snapshot** — immutable record of active consent scopes at capture initiation, linked to session |
| **4** | **Persist User Description Evidence if present** — Slice 2 child evidence; gated on `description_processing_consent` when description non-empty |
| **5** | **Persist Image Evidence if present** — Slice 3 child evidence; gated on `image_processing_consent` and `evidence_storage_consent` when image present |
| **6** | **Persist Product Mention Evidence if present and consented** — Slice 4 child evidence; gated on `evidence_storage_consent` when mention text non-empty |
| **7** | **Continue AI analysis** — Intelligence Layer consumes capture inputs; governed evidence already persisted |
| **8** | **Write `analyses` compatibility row** — transitional denormalized read model; non-authoritative for Evidence Layer concerns |

### Ordering principles

- **Evidence-first authority** — steps 2–6 establish governed evidence before Intelligence output (step 7) and compatibility surface (step 8)
- **Slice 4 adds step 6 only** — does not reorder or alter Slices 1–3 persistence semantics
- **Optional-field semantics** — steps 4–6 execute only when applicable input is present and consented; absent input skips row creation
- **Coexistence** — steps 4, 5, and 6 may all produce child evidence on the same Scan Record V2 when image, description, and mention text are all present and consented
- **Compatibility row is subordinate** — step 8 must not reverse write priority or become canonical persistence path (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**)

Evidence Confidence Posture attachment (transitional mapping step 7 in **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**) remains deferred in Slice 4; placeholder fields acknowledge future posture without implementing it.

---

## 7. Failure Behavior

Failure rules bind Slice 4 to fail-closed, evidence-first dual-write discipline established in Slices 1–3.

### Mention text absent

| Condition | Behavior |
|-----------|----------|
| Mention input empty or not provided | **No Product Mention Evidence row created** |
| Flow impact | **Continues** — AI analysis and compatibility row write proceed per existing session rules |

### Mention text present but consent missing

| Condition | Behavior |
|-----------|----------|
| Non-empty mention text without valid **`evidence_storage_consent`** (or other blocking consent failure) | **Fail closed** |
| Product Mention Evidence | **Not persisted** |
| AI analysis | **Does not proceed** under fail-closed posture |
| `analyses` compatibility row | **Not written** under fail-closed posture |
| Other child evidence | Must not be left in inconsistent state — session failure applies to governed capture as a whole |

### Mention persistence fails

| Condition | Behavior |
|-----------|----------|
| Mention text present, consent valid, persistence error | **Fail closed** |
| AI analysis | **Does not proceed** |
| `analyses` compatibility row | **Not written** |
| Error surfacing | Capture request returns failure; no partial success masking |

Failure must occur **before** AI analysis and **before** compatibility row write when mention persistence is required but fails.

### Orphan prevention

- **No orphan Product Mention Evidence** — mention records must always link to a valid Scan Record V2 created in the same governed capture session
- **No mention evidence without consent linkage** — session Consent Snapshot must exist and authorize storage
- **No compatibility row implying mention persistence** — compatibility surface must not suggest governed mention evidence exists when it does not

### Slices 1–3 protection

Slice 4 failure or rollback must **not corrupt** existing Slice 1–3 evidence:

- Scan Record V2 and Consent Snapshot integrity preserved
- User Description Evidence and Image Evidence rows unaffected by mention-only failures handled at session level
- Existing dual-write paths for session, description, and image evidence remain semantically unchanged

---

## 8. Boundary Protections

The following are **explicitly prohibited** in Slice 4 design and any downstream implementation authorized by later gates:

| Prohibited behavior | Rationale |
|---------------------|-----------|
| **Catalog lookup** | Knowledge Layer concern; not Evidence Layer capture |
| **Product identity resolution** | Product Mention Evidence stays unverified until Phase 2 |
| **Ingredient entity resolution** | No canonical ingredient vocabulary in Phase 1 evidence |
| **Ingredient Intelligence** | Intelligence Layer separation |
| **Product Intelligence** | Prohibited merge per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** |
| **Storing `scoreProduct` output** | Client-side catalog scoring remains separate from server mention evidence |
| **Storing AI analysis output** | Intelligence Layer artifact; not embedded in mention evidence |
| **Parsing User Description Evidence** | Prohibited cross-object extraction |
| **Medical diagnosis or treatment claims** | Cosmetic scope only; no disease labeling or clinical classification via mention content or enrichment |

Additional prohibited merges from Phase 1 object boundaries remain binding:

- No canonical product ID, ingredient composition, or catalog match confidence on mention records
- No Routine Model or regimen graph construction from mention text
- No extension of `analyses` as canonical mention store (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**)
- No hardcoded consent booleans substituting for Consent Snapshot
- No edit-in-place correction — future supersession via Correction Event only

Any implementation crossing these boundaries fails architectural review regardless of delivery convenience.

---

## 9. Read Path

Slice 4 is **write-only foundation**. No read-path cutover occurs.

| Surface | Slice 4 behavior |
|---------|------------------|
| **Dashboard** | **No change** — continues existing read behavior |
| **History list and detail** | **No change** — continues reading from `analyses` |
| **API response shape** | **No change** — scan response contract unchanged |
| **`analyses` compatibility row** | Remains transitional read model; not authoritative for mention evidence |
| **Product Mention Evidence store** | **Write-only in Slice 4** — persisted for Personal Evidence Base foundation; not exposed to client or Experience Layer |

### Transitional Hybrid posture

- Personal Evidence Base authority for mention concerns resides in governed Product Mention Evidence store once implemented
- UI and API consumers must not assume compatibility row presence implies mention evidence persistence
- Client-side `scoreProduct` and `localStorage` (`skinintel_last_scan`) remain non-authoritative and unaffected by server mention evidence writes
- Direct database or audit queries are the verification read path for Slice 4 closure — not user-facing surfaces

Future read-path cutover to evidence-first presentation is explicitly out of Slice 4 scope.

---

## 10. Verification Requirements

Future implementation closure requires verification equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**. The following checks define Slice 4 success criteria.

### Capture path verification

| Check | Expected outcome |
|-------|------------------|
| **Scan with mention text** | Creates Product Mention Evidence row linked to correct Scan Record V2 |
| **Scan without mention text** | Creates **no** Product Mention Evidence row; flow completes successfully |
| **Scan with missing consent** | **Fail closed** — no mention evidence, no AI analysis completion, no compatibility row under fail-closed posture |
| **Scan with image + description + mention** | Creates **all applicable child evidence types** (Image Evidence, User Description Evidence, Product Mention Evidence) on same Scan Record V2 |

### Consent audit verification

| Check | Expected outcome |
|-------|------------------|
| **Consent join** | Query mention evidence → Scan Record V2 → Consent Snapshot confirms **`evidence_storage_consent`** present when mention persisted |
| **No unconsented rows** | Zero mention evidence rows without valid session storage consent |

### Boundary audit verification

| Check | Expected outcome |
|-------|------------------|
| **No catalog/intelligence data** | Mention records contain user-stated text only — no product IDs, ingredient entities, catalog match metadata, or scoring output |
| **No AI output embedded** | Mention records do not contain AI analysis JSON or inference-derived product references |
| **No description cross-contamination** | Mention content matches form-submitted mention input, not duplicated from User Description Evidence |

### Regression verification

| Check | Expected outcome |
|-------|------------------|
| **Slice 1–3 unaffected** | Session, consent, description, and image evidence dual-write paths unchanged in behavior |
| **Dashboard/history unchanged** | No new fields, no read-path modifications, no user-visible mention evidence exposure |
| **Compatibility linkage intact** | `analyses.scan_record_id` reference pattern preserved |

### Verification method

- **Direct DB verification required** — confirm Product Mention Evidence persistence by querying evidence store directly; do not infer from compatibility row alone
- **Failure simulation** — induced mention persistence failure confirms fail-closed behavior before AI and compatibility write

---

## 11. Implementation Gates

Slice 4 technical design acceptance does **not** authorize implementation. The following gates remain **open** and must close before any code or schema work:

| Gate | Artifact / requirement |
|------|------------------------|
| **Slice 3 formal verification** | Dual-write verification document equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** — **required hard gate before implementation** |
| **Slice 4 migration plan** | Separate gated artifact defining additive schema introduction and rollback posture |
| **Slice 4 dual-write implementation plan** | Code design document mapping conceptual write order to scan route persistence |
| **Code audit prompt** | Pre-implementation audit confirming boundary compliance and write-path integration points |
| **Final review before code** | Architecture and product sign-off on migration plan, dual-write plan, and audit findings |

Additionally binding from upstream gates:

- Object boundaries (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**)
- Schema direction (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**)
- Consent, deletion, correction, and confidence behavior documents
- **docs/PHASE_1_SLICE_4_PLAN.md** scope and prohibited boundaries

No Supabase changes, application code, API modifications, or UI work until all implementation gates pass.

---

## 12. Current Decision

**Phase 1 Slice 4 — Product Mention Evidence technical design is defined for review only.**

This document specifies:

- Product Mention Evidence as unverified, user-stated mention text linked to Scan Record V2
- Source input from existing capture field only — no new UI, parsing, catalog lookup, or AI extraction
- Conceptual fields with governance placeholders for correction, deletion, and confidence posture
- Consent gating via **`evidence_storage_consent`** with fail-closed behavior when mention present but consent missing
- Extended dual-write order adding mention persistence after Slices 2–3 child evidence, before AI analysis
- Write-only foundation with no dashboard, history, or API read-path changes

This document does **not** authorize:

- Supabase schema changes or migrations
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes
- Product Intelligence, Ingredient Intelligence, or catalog integration

**Slice 4 technical design is accepted only after review and commit of this document.** Subsequent artifacts (migration plan, dual-write implementation plan, verification document) follow in gated sequence before implementation authorization.
