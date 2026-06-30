# Phase 1 — Evidence Confidence Posture V1

## Purpose

This document defines **Evidence Confidence Posture behavior** for Phase 1 Evidence Layer Foundation and closes **gate 12 (Evidence Confidence Posture accepted)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** before any Evidence Layer implementation.

It translates input-quality qualification requirements from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, and audit findings in **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** into explicit dimensions, posture values, update rules, and prohibited behaviors.

This is a planning artifact only. It does not define database fields, SQL, API contracts, or UI components.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**.

---

## Definition

**Evidence Confidence Posture** is a Phase 1 Evidence Layer qualification object with the following properties:

- **Input evidence quality qualification** — expresses epistemic limits of capture inputs, not Intelligence Layer conclusions.
- **Attached to evidence objects or Scan Record V2** — may apply at session level and/or per child evidence object.
- **Separate from AI result confidence** — AI output certainty is an Intelligence Layer concern; not interchangeable.
- **Separate from recommendation confidence** — guidance strength given evidence density is distinct from input quality.
- **Not medical certainty** — cosmetic-scope qualification only; no diagnostic precision or disease certainty framing.
- **Not commercial score** — not purchase propensity, product fit, or marketing segmentation metric.
- **Updated only through governed events** — capture-time assignment, Correction Event, or governed enrichment with evidence link and valid consent; no silent recalculation.

Evidence Confidence Posture answers: *"How reliable, complete, and eligible is this evidence as input — before and independent of what AI concluded?"*

---

## Why This Is Required

Phase 1 cannot support honest Intelligence or Experience presentation without input-quality qualification.

**Current delivery gaps** (from **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**):

- **Current implementation stores AI confidence only** — `analyses.confidence` copied from AI JSON.
- **Current confidence does not describe** image quality, input completeness, user attestation strength, source reliability, correction status, or consent/deletion eligibility.

**Architectural requirements:**

- **Downstream intelligence must not treat all evidence as equally reliable** — reasoning and presentation must reflect evidence density and quality (**docs/IMPLEMENTATION_PLAN_V1.md**).
- **Corrections, deletion, and consent status affect confidence eligibility** — disputed, retracted, withdrawn, or deletion-excluded evidence is not merely "low confidence" but may be ineligible (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- **Confidence must expose uncertainty, not hide it** — weak or incomplete evidence must not be presented with false precision; Phase 1 Rules require honest epistemic limits.

Without Evidence Confidence Posture, schema direction risks collapsing input quality and AI output certainty into a single legacy field.

---

## Evidence Confidence Dimensions

Phase 1 defines the following **conceptual dimensions**. Language-neutral identifiers for governance; not database fields.

### image_quality

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Visual capture clarity, lighting, focus, and suitability for cosmetic observation. |
| **Applies to** | Image Evidence; session-level Scan Record V2 when image present. |
| **Can increase confidence?** | Yes — clear, well-lit, in-focus image. |
| **Can decrease confidence?** | Yes — blur, poor lighting, obstruction, extreme angle. |

### user_attestation_strength

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Degree to which content is directly user-origin vs AI-structured or inferred. |
| **Applies to** | User Description Evidence, Symptom Observation Evidence, Product/Routine Mention Evidence. |
| **Can increase confidence?** | Yes — explicit user text or direct user selection. |
| **Can decrease confidence?** | Yes — AI-structured without user confirmation; weak attestation. |

### input_completeness

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Whether required and optional capture inputs are present for the session type. |
| **Applies to** | Scan Record V2; all child evidence objects. |
| **Can increase confidence?** | Yes — image + description + context present where relevant. |
| **Can decrease confidence?** | Yes — image only with no description; missing key context. |

### source_reliability

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Trustworthiness of evidence provenance (user-direct, device capture, AI-assisted structuring). |
| **Applies to** | All Phase 1 evidence objects with provenance metadata. |
| **Can increase confidence?** | Yes — user-direct capture with clear provenance flag. |
| **Can decrease confidence?** | Yes — ambiguous provenance; AI-assisted without user validation. |

### recency

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Temporal relevance of evidence to current user context at read or reasoning time. |
| **Applies to** | Scan Record V2; Image Evidence; session-scoped objects. |
| **Can increase confidence?** | Yes — recent capture aligned with current concern. |
| **Can decrease confidence?** | Yes — stale capture for time-sensitive interpretation (planning-level; not automatic expiry). |

### body_area_specificity

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Whether evidence is scoped to a specific, identified body area. |
| **Applies to** | Body Area Evidence Link; Symptom Observation Evidence; Image Evidence. |
| **Can increase confidence?** | Yes — explicit body area link. |
| **Can decrease confidence?** | Yes — unspecified or vague spatial context. |

### symptom_specificity

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Precision of structured cosmetic signal (language-neutral symptom identifier + severity/presence). |
| **Applies to** | Symptom Observation Evidence. |
| **Can increase confidence?** | Yes — user-selected structured observation. |
| **Can decrease confidence?** | Yes — vague or AI-inferred symptom without user confirmation. |

### product_mention_specificity

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Clarity of user-stated product reference (name, partial label, context). |
| **Applies to** | Product Mention Evidence. |
| **Can increase confidence?** | Yes — specific product name with usage context. |
| **Can decrease confidence?** | Yes — vague "my serum" without distinguishing detail. |

### routine_context_specificity

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Clarity of user-stated regimen context (timing, frequency, recent changes). |
| **Applies to** | Routine Mention Evidence. |
| **Can increase confidence?** | Yes — structured routine description. |
| **Can decrease confidence?** | Yes — minimal or ambiguous routine mention. |

### consent_eligibility

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Whether evidence remains eligible for processing under current consent and capture-time Consent Snapshot. |
| **Applies to** | Scan Record V2; all session-linked evidence. |
| **Can increase confidence?** | Yes — all required scopes active at capture; still eligible. |
| **Can decrease confidence?** | Yes — partial scope; withdrawal affects future use (may render **ineligible**, not merely low). |

### correction_status

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Whether evidence is qualified, disputed, superseded, or retracted via Correction Event chain. |
| **Applies to** | All correctable evidence objects; session aggregate on Scan Record V2. |
| **Can increase confidence?** | Yes — clarify or supersede with stronger user attestation. |
| **Can decrease confidence?** | Yes — dispute, retract, unresolved conflict. |

### deletion_or_retention_status

| Attribute | Definition |
|-----------|------------|
| **Meaning** | Whether evidence is active, excluded, or tombstoned under deletion/retention governance. |
| **Applies to** | All evidence objects; session on Scan Record V2. |
| **Can increase confidence?** | No — deletion does not increase confidence; restoration is out of Phase 1 scope. |
| **Can decrease confidence?** | Yes — excluded or deletion-pending evidence is **ineligible** for reasoning, not ranked low. |

---

## Posture Values

Allowed **posture values** qualify evidence input quality. They describe **evidence**, not AI recommendation strength.

| Value | Meaning for evidence |
|-------|----------------------|
| **high** | Input is clear, complete, user-attested where required, eligible, and not disputed; suitable for confident downstream consumption with appropriate scope limits. |
| **medium** | Input is usable but partial, moderately specific, or partially AI-structured; downstream must acknowledge gaps. |
| **low** | Input is weak, incomplete, vague, disputed, or heavily AI-inferred without validation; downstream must limit strength of conclusions. |
| **insufficient** | Input lacks minimum quality or eligibility for meaningful reasoning on that dimension; evidence may be stored but not used for strong Intelligence output. |

**Ineligible vs insufficient:** Deletion-excluded, consent-ineligible, or fully retracted evidence is **not** posture-ranked — it is excluded from authoritative reads per deletion and correction rules.

---

## Object-Level Confidence Scope

Conceptual scope per object. No schema, table names, or field definitions.

| Object | Confidence posture applies? | Relevant dimensions | Example low-confidence reason | Boundary notes |
|--------|----------------------------|---------------------|------------------------------|----------------|
| **Scan Record V2** | **Yes** — session aggregate | input_completeness, consent_eligibility, correction_status, deletion_or_retention_status, recency | Image-only capture with no description | Session posture aggregates child signals; not AI certainty |
| **Image Evidence** | **Yes** | image_quality, source_reliability, body_area_specificity, correction_status | Blurry or dark photo | Does not store AI observations |
| **User Description Evidence** | **Yes** | user_attestation_strength, input_completeness, source_reliability, correction_status | Empty or one-word description | User-origin only |
| **Symptom Observation Evidence** | **Yes** | symptom_specificity, user_attestation_strength, body_area_specificity, correction_status | AI-structured symptom not user-confirmed | No disease labels |
| **Body Area Evidence Link** | **Yes** — contributes to spatial posture | body_area_specificity, source_reliability | Missing or generic area | Link only; not medical ontology |
| **Product Mention Evidence** | **Yes** | product_mention_specificity, user_attestation_strength, correction_status | Vague "vitamin C product" | Unverified mention |
| **Routine Mention Evidence** | **Yes** | routine_context_specificity, user_attestation_strength, correction_status | "I use a routine sometimes" | Not Routine Model |
| **Consent Snapshot** | **No** — governance record | — | — | Proves authorization at capture; not quality score |
| **Correction Event** | **No** — triggers posture update | — | — | Event drives posture change on target evidence |
| **Evidence Confidence Posture** | **Yes** — is the posture object | All applicable dimensions per attachment | — | Distinct from AI/recommendation confidence |
| **AI Analysis Result** | **No** — uses recommendation/output confidence separately | — | — | May reference evidence posture in explainability; not substitute |
| **`analyses` compatibility row** | **No** — legacy | — | Row `confidence` is AI output legacy | Must not be evidence posture store long-term |
| **localStorage last scan** | **No** | — | Client `scanResult.confidence` is AI JSON | Not governed posture |

---

## Confidence Updates

**Initial assignment**

- Posture assigned at **capture or structuring time** when evidence object is created.
- Rules derive from dimension evaluation (e.g., image quality heuristics, provenance flags, completeness checklist).
- Scan Record V2 receives session-level aggregate after child evidence attached.

**Correction**

- Correction Event may **downgrade**, **qualify**, or **improve** posture on target evidence (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**).
- Dispute → typically low or insufficient for disputed dimension; supersede with user-attested replacement → may increase attestation strength.

**Deletion / retention**

- Deletion or exclusion renders evidence **ineligible** — not simply low posture (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- Tombstoned sessions may carry marker without recoverable content; no confidence inflation.

**AI enrichment**

- AI may **propose** posture dimension updates (e.g., suggest image quality flag) only with **evidence link** and **valid consent**.
- Proposal requires governed acceptance path — not silent overwrite of user-attested posture.
- AI enrichment does not set recommendation confidence on evidence object.

**General rule**

- **No silent recalculation** without governed event (capture, correction, governed enrichment, deletion exclusion).

---

## Evidence Confidence vs AI Confidence

| Concern | Evidence Confidence Posture | AI confidence | Recommendation confidence |
|---------|----------------------------|---------------|---------------------------|
| **Layer** | Evidence | Intelligence (output) | Intelligence (guidance) |
| **Qualifies** | Input quality, completeness, eligibility | Model/output certainty on analysis | Strength of guidance given evidence |
| **Example** | "Image blurry; description partial" | "medium confidence in assessment JSON" | "Moderate certainty for top5 item" |
| **Collapse?** | **Must not collapse** into single field | Separate artifact metadata | Separate presentation concern |

**Current legacy:** `analyses.confidence` and `result.confidence` are **AI output confidence**, not Evidence Confidence Posture. Transitional Hybrid must not extend this field as evidence quality store.

---

## Prohibited Behaviors

The following are explicitly prohibited in Phase 1 design and future implementation:

- **No treating AI confidence as evidence confidence** — prohibited merge (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).
- **No commercial score as confidence** — no marketing or purchase-propensity dimensions.
- **No medical certainty** — no diagnostic precision or disease-confidence framing.
- **No hiding weak evidence behind high confidence** — insufficient/low must be visible to user and downstream systems.
- **No confidence increase without new evidence, correction, or governed enrichment** — no silent upgrade.
- **No localStorage confidence as governed posture** — device cache not authoritative.
- **No using confidence to bypass safety boundaries** — low confidence does not justify medical claims; high confidence does not authorize them.
- **No confidence inflation for marketing or product promotion** — posture serves traceability and epistemic honesty only.

---

## Impact On Current Implementation

**Current row-level `confidence`** on `analyses` is **partial legacy AI output confidence** — copied from normalized AI JSON; audit FAIL for Evidence Confidence Posture.

**No evidence confidence exists today** — image quality, attestation, completeness, and correction status are not persisted or qualified.

**localStorage** — `scanResult.confidence` and client `scoredProducts` scoring are **not** governed Evidence Confidence Posture.

**Future implementation** must separate evidence posture from AI result confidence **before** schema and code work — physical design must not reuse `analyses.confidence` as dual-purpose field.

---

## Gate Decision

**Upon review and approval of this document, gate 12 (Evidence Confidence Posture accepted) may be marked PASS** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Acceptance means product and architecture agree on:

- Evidence Confidence Posture definition and separation from AI/recommendation confidence
- Phase 1 dimensions and posture values
- Object-level scope and update rules
- Prohibited behaviors binding on future implementation

Approval is **planning-level only**. It does not authorize Supabase, code, API, or UI work.

---

## Remaining Dependencies

This document does **not** close the following gates:

| Gate | Status after this document |
|------|----------------------------|
| Schema direction | **Open** — physical persistence design; no SQL implied |
| Minimal implementation slice | **Open** — after gate 13 |

Behavioral gates 9–12 (consent, deletion, correction, confidence) are defined at planning level; schema direction must incorporate all before implementation authorization.

---

## Current Decision

**Evidence Confidence Posture behavior is defined for Phase 1 planning only.**

This document establishes input-quality qualification semantics for Evidence Layer objects. It does **not** authorize:

- Supabase schema changes or migrations
- Code changes to persistence, scan, dashboard, or history paths
- API contract changes
- UI redesign or confidence presentation implementation

Implementation authorization requires schema direction approval (gate 13), minimal implementation slice sign-off (gate 14), and explicit gate review completion per **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Until then, current legacy AI-only `confidence` field remains unchanged; this document defines target Evidence Confidence Posture for transitional hybrid implementation when gated.
