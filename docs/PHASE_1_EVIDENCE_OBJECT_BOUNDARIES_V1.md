# Phase 1 — Evidence Object Boundaries V1

## Purpose

This document defines the accepted object inventory and responsibility boundaries for Phase 1 Evidence Layer Foundation.

It derives from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** and exists to prepare gate review for **Object list accepted** and **Object boundaries accepted**. Each object has a single primary responsibility, explicit ownership, and prohibited merges with adjacent domains. This document is architecture-level: no code, no SQL, no API design, no UI design.

---

## Boundary Principle

Phase 1 evidence objects exist to record what was captured, reported, or attested—not to reason, recommend, or resolve knowledge.

**Evidence objects must not collapse into AI output.** Capture artifacts and AI inference are separate governed records. AI may assist structuring; it does not replace evidence objects or embed conclusions inside them.

**Evidence objects must not become product intelligence.** User-mentioned products remain unverified mentions until Phase 2 Knowledge Layer resolution. Ingredient composition, catalog linkage, and product identity are out of scope.

**Evidence objects must not become recommendation records.** Recommendations belong to the Intelligence Layer. Evidence records what happened at capture; it does not prescribe action.

**Evidence objects must remain traceable, consent-aware, append-oriented, and correctable.** Every object carries provenance, links to Consent Snapshot at creation, extends history without silent overwrite, and may be qualified or superseded through Correction Events.

**Each object has one primary responsibility.** When two concerns appear to belong together, they are linked—not merged. Boundary violations are architectural defects, not implementation shortcuts.

---

## Accepted Phase 1 Evidence Object Inventory

The following ten objects constitute the complete Phase 1 evidence inventory. No additional evidence types enter Phase 1 without explicit plan revision.

### Scan Record V2

- **Primary responsibility** — Anchor the governed capture session as the central evidence event.
- **Owns** — Session identity, capture timestamp, references to child evidence objects, session-level Evidence Confidence Posture, link to Consent Snapshot.
- **Does not own** — AI analysis results, recommendations, product resolution, routine models, learning signals, or Experience Layer presentation state.
- **Created from** — User-initiated scan or structured capture session under valid consent.
- **Can link to** — Image Evidence, User Description Evidence, Symptom Observation Evidence, Body Area Evidence Link, Product Mention Evidence, Routine Mention Evidence, Consent Snapshot, Evidence Confidence Posture, Correction Events affecting the session.
- **Must not be confused with** — AI Analysis Result, Recommendation Record, Longitudinal Timeline aggregate, or current `analyses` persistence row when it embeds inference output.

### Image Evidence

- **Primary responsibility** — Record captured visual evidence and capture metadata.
- **Owns** — Image artifact reference, capture context (device, timing, quality indicators), link to parent Scan Record V2.
- **Does not own** — AI-inferred observations, symptom classifications, diagnostic labels, or storage of Intelligence Layer outputs.
- **Created from** — Camera upload or image selection during consent-valid capture.
- **Can link to** — Scan Record V2, Body Area Evidence Link (region scoping), Evidence Confidence Posture.
- **Must not be confused with** — AI Analysis Result, Symptom Observation Evidence, or thumbnail/preview UI asset without provenance.

### User Description Evidence

- **Primary responsibility** — Preserve user-provided narrative, context, and self-reported observations as authoritative personal experience.
- **Owns** — User's own words or structured self-report text, attestation that content is user-origin, capture timestamp.
- **Does not own** — AI-generated summaries, platform paraphrase presented as user voice, or structured symptom taxonomy resolution.
- **Created from** — User text input or voice-to-text during capture, explicitly attributed to the user.
- **Can link to** — Scan Record V2, Body Area Evidence Link, Evidence Confidence Posture, Correction Events.
- **Must not be confused with** — Symptom Observation Evidence (when structured separately), AI Analysis Result intro/summary, or chatbot transcript.

### Symptom Observation Evidence

- **Primary responsibility** — Record structured cosmetic signals—observed or reported—scoped to body area and capture time.
- **Owns** — Language-neutral symptom identifier reference, severity or presence indication, provenance (user-selected, user-described-normalized, AI-structured), body area scope.
- **Does not own** — Clinical diagnosis, disease labels, treatment implications, or recommendation rationale.
- **Created from** — User structured selection, normalization of user description, or AI-assisted structuring with evidence link and provenance flag.
- **Can link to** — Scan Record V2, Body Area Evidence Link, Evidence Confidence Posture, Correction Events.
- **Must not be confused with** — Diagnosis, ICD/clinical taxonomy, AI Analysis Result aggregate, or Product Intelligence sensitivity inference.

### Body Area Evidence Link

- **Primary responsibility** — Connect evidence to anatomical region vocabulary using language-neutral identifiers.
- **Owns** — Stable body area identifier, association to parent evidence object, optional region granularity within capture scope.
- **Does not own** — Medical anatomy ontology, clinical site coding, diagnosis localization, or presentation labels in any locale.
- **Created from** — User selection, AI-assisted region suggestion accepted into evidence, or inference from capture context with provenance.
- **Can link to** — Symptom Observation Evidence, Image Evidence, User Description Evidence, Scan Record V2.
- **Must not be confused with** — Medical Anatomy Model, dermatological examination chart, or translated UI label stored as knowledge.

### Product Mention Evidence

- **Primary responsibility** — Capture products the user mentioned during scan without verifying product identity.
- **Owns** — User-stated product name, free-text label, partial identifier, mention context (e.g., currently using, recently applied).
- **Does not own** — Canonical product ID, ingredient composition, catalog match confidence, Product Intelligence enrichment, or purchase history.
- **Created from** — User input during capture referencing a product by name, label, or informal description.
- **Can link to** — Scan Record V2, Routine Mention Evidence, Evidence Confidence Posture, Correction Events.
- **Must not be confused with** — Product Model, Product Intelligence output, verified User Product Usage Record, or webshop catalog entry.

### Routine Mention Evidence

- **Primary responsibility** — Capture routine context the user mentioned during scan without building governed regimen structure.
- **Owns** — User-stated regimen context (products referenced, timing, frequency, recent changes) as unstructured or lightly structured evidence.
- **Does not own** — Routine Model, temporal regimen graph, Product Intelligence linkage, or Recommendation Engine routine adjustments.
- **Created from** — User input during capture describing current or recent routine behavior.
- **Can link to** — Scan Record V2, Product Mention Evidence, Evidence Confidence Posture, Correction Events.
- **Must not be confused with** — Routine Model, Routine Intelligence output, or scheduled regimen enforcement object.

### Consent Snapshot

- **Primary responsibility** — Record consent state at evidence creation time for audit and governance.
- **Owns** — Immutable record of active consent scopes when evidence was captured, snapshot timestamp, link to capture session.
- **Does not own** — Current user consent preferences, consent UI state, or retroactive consent reinterpretation of prior captures.
- **Created from** — Consent validation at capture initiation; written before or atomically with evidence persistence.
- **Can link to** — Scan Record V2 and, by session association, all evidence objects created under that capture.
- **Must not be confused with** — Current Consent State, user settings profile, or mutable privacy preferences document.

### Correction Event

- **Primary responsibility** — Record user qualification, supersession, or dispute of prior evidence without silent overwrite.
- **Owns** — Link to corrected evidence object, nature of correction (qualify, supersede, reject), user attestation, correction timestamp, supersession semantics for downstream consumption.
- **Does not own** — Deletion of prior evidence, global truth assertion, or automatic Intelligence Layer recomputation.
- **Created from** — Explicit user correction action against existing evidence in Personal Evidence Base.
- **Can link to** — Any Phase 1 evidence object it addresses; may reference replacement or qualifying evidence.
- **Must not be confused with** — Deletion request, consent withdrawal, admin data purge, or edit-in-place of historical record.

### Evidence Confidence Posture

- **Primary responsibility** — Qualify evidence quality, completeness, recency, and source reliability at capture or governed update.
- **Owns** — Confidence dimensions for input evidence (e.g., image quality, user attestation level, AI-structured vs user-direct, completeness flags).
- **Does not own** — Recommendation confidence, commercial fit score, model certainty presented as product advice, or Learning Layer calibration weights.
- **Created from** — Capture-time assessment rules, provenance metadata, or governed update via Correction Event.
- **Can link to** — Scan Record V2, Image Evidence, User Description Evidence, Symptom Observation Evidence, Product Mention Evidence, Routine Mention Evidence.
- **Must not be confused with** — Recommendation confidence, AI Analysis Result score, or commercial profiling metric.

---

## Object Boundary Matrix

| Object | Layer | Primary responsibility | Owns | Does not own | Key boundary risk |
|--------|-------|------------------------|------|--------------|-------------------|
| Scan Record V2 | Evidence | Governed capture session anchor | Session identity, child refs, session confidence, consent link | AI output, recommendations, knowledge resolution | Collapsing session with AI analysis result row |
| Image Evidence | Evidence | Visual capture artifact + metadata | Image ref, capture context, scan link | AI observations, symptom labels | Storing inference inside image record |
| User Description Evidence | Evidence | User narrative and self-report | User-origin text, attestation, timestamp | AI summary, structured symptom taxonomy | Replacing user voice with AI paraphrase |
| Symptom Observation Evidence | Evidence | Structured cosmetic signal | Symptom ID, severity, provenance, body scope | Diagnosis, disease labels, treatment | Medical taxonomy or diagnostic naming |
| Body Area Evidence Link | Evidence | Location vocabulary association | Body area ID, evidence association | Medical anatomy ontology, locale labels | Storing translated anatomy as knowledge |
| Product Mention Evidence | Evidence | Unverified product mention | User-stated name/text, mention context | Product ID, ingredients, catalog match | Auto-resolving to Product Model in Phase 1 |
| Routine Mention Evidence | Evidence | Unverified routine context | User-stated regimen description | Routine Model, temporal graph | Building full Routine Intelligence early |
| Consent Snapshot | Evidence | Consent at capture time | Immutable scope record, timestamp | Current consent prefs | Mutating snapshot when user changes consent |
| Correction Event | Evidence | Supersession without overwrite | Correction type, target link, timestamp | Deletion, global truth, silent edit | In-place edit or conflating with deletion |
| Evidence Confidence Posture | Evidence | Input quality qualification | Capture quality, source reliability dims | Recommendation strength, commercial score | Using as recommendation or marketing score |

---

## Specific Boundary Clarifications

### Scan Record V2 vs AI Analysis Result

Scan Record V2 is the evidence event—the governed record that a capture occurred, under what consent, with what attached evidence. AI Analysis Result is an Intelligence Layer output derived from evidence; it must reference evidence links and must not be embedded inside Scan Record V2. Current delivery that persists analysis and inference in a single artifact violates this boundary and requires separation in future implementation mapping.

### Product Mention Evidence vs Product Intelligence

Product Mention Evidence records what the user said—"my vitamin C serum," a brand name, a partial label—not what the platform verified. Product Intelligence resolves identity, composition, and personal exposure context in the Knowledge Layer. Phase 1 may capture mentions; it must not treat mentions as verified Product Model entities or trigger catalog enrichment as evidence-layer behavior.

### Routine Mention Evidence vs Routine Model

Routine Mention Evidence preserves user-described regimen context at capture time. Routine Model is a governed Knowledge Layer structure with temporal sequencing, product linkage, and change events. Phase 1 captures mentions only; it does not construct regimen graphs, enforce schedules, or produce Routine Intelligence outputs.

### Symptom Observation Evidence vs Diagnosis

Symptom Observation Evidence records cosmetic presentation signals—redness, dryness, texture change—using language-neutral symptom identifiers. Diagnosis assigns clinical disease labels and lies outside platform scope. Symptom evidence must never store ICD codes, condition names implying disease, or treatment-directed classifications.

### Body Area Evidence Link vs Medical Anatomy Model

Body Area Evidence Link provides location vocabulary for spatial context—cheeks, forehead, T-zone—using stable internal identifiers. Medical Anatomy Model implies clinical examination semantics, diagnostic localization, and professional charting. Phase 1 links evidence to cosmetic-scope body area identifiers only.

### Consent Snapshot vs Current Consent State

Consent Snapshot is an immutable historical record of consent scopes active at evidence creation. Current Consent State reflects the user's present preferences and governs future capture. Withdrawal or change of current consent does not retroactively alter snapshots; it governs future behavior and deletion eligibility.

### Correction Event vs Deletion

Correction Event qualifies or supersedes evidence for reasoning while preserving audit history. Deletion removes or anonymizes evidence per governance rules and excludes it from future personalization. A correction is not a deletion; a deletion is not a correction. Both may apply to the same evidence over time but remain distinct governance paths.

### Evidence Confidence Posture vs Recommendation Confidence

Evidence Confidence Posture qualifies input quality—is the image clear, was the symptom user-attested, is the product mention vague. Recommendation Confidence qualifies Intelligence Layer guidance strength given evidence density and reasoning. Input quality must not be presented as recommendation certainty; recommendation confidence must not be stored as evidence-layer metadata.

---

## Prohibited Object Merges

The following merges are explicitly prohibited in Phase 1 design and implementation:

- **Merging Scan Record V2 with AI output** — Session container and inference result remain separate objects with evidence links.
- **Merging Product Mention Evidence with verified Product Model** — Mentions stay unverified until Phase 2 Knowledge Layer resolution.
- **Merging Routine Mention Evidence with full Routine Model** — Capture-time mentions do not become governed regimen structures.
- **Merging Symptom Observation Evidence with diagnosis** — Cosmetic signals do not become clinical labels or disease records.
- **Merging Consent Snapshot with mutable user settings** — Historical consent at capture is immutable; current preferences are separate.
- **Merging Correction Event with deletion request** — Supersession and removal are distinct governance behaviors.
- **Merging Evidence Confidence Posture with commercial scoring** — Input qualification serves traceability and epistemic honesty, not marketing or purchase propensity.

Any implementation that combines these concerns in a single object fails object boundary review.

---

## Gate Readiness Statement

This document **prepares** Phase 1 gate review for **Object list accepted** and **Object boundaries accepted**. It does **not** itself complete gate review.

Formal acceptance requires product leadership and architecture sign-off that:

- The ten-object inventory is complete and closed for Phase 1
- Each object's primary responsibility, ownership, and prohibited merges are accepted
- The boundary clarifications and prohibited merges are accepted as binding constraints

Remaining Phase 1 gates—**Consent impact accepted**, **Deletion impact accepted**, **Correction behavior accepted**, **Confidence posture accepted**, and **Minimal implementation slice selected**—require separate documents or gate sessions. This document satisfies only the object inventory and boundary gates.

---

## Current Decision

**Phase 1 may not proceed to coding until this object boundary document is reviewed and accepted.**

Acceptance binds Phase 1 implementation to the ten-object inventory, the boundary matrix, specific clarifications, and prohibited merges defined here. Until acceptance:

- No evidence object outside this inventory may enter Phase 1
- No prohibited merge may be implemented for convenience or legacy compatibility
- No gate sign-off for object list or object boundaries is valid without review of this document

Implementation authorization remains blocked until all Phase 1 Implementation Gates in **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** pass, including acceptance of this document for the object inventory and boundary gates.
