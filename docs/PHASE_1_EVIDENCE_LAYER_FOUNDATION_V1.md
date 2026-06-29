# Phase 1 — Evidence Layer Foundation V1

## Purpose

Phase 1 establishes the trusted evidence foundation for SkinIntel before Knowledge, Intelligence, Learning, or Experience expansion.

The Evidence Layer is the platform's source of truth. Everything upstream of reasoning—Knowledge structures, Intelligence engines, Learning calibration, and Experience presentation—depends on evidence that is captured with consent, stored with provenance, qualified by confidence, correctable by the user, and compatible with deletion and retention governance. Phase 1 does not build those higher layers. It defines the evidence objects, boundaries, rules, and gates that make them possible without architectural drift.

This document translates Phase 1 from **docs/IMPLEMENTATION_PLAN_V1.md** into a detailed, execution-ready planning artifact. It remains architecture-level: no code, no SQL, no API design, no UI design.

---

## Why Phase 1 Comes First

SkinIntel cannot reason reliably without governed evidence. Intelligence engines consume structured, traceable inputs. When evidence is fragmented, overwritten, or detached from consent and provenance, downstream reasoning produces conclusions that cannot be explained, corrected, or trusted—regardless of model quality.

AI output is not the durable product asset. Automated interpretation assists capture and enrichment, but the Personal Evidence Base—the user's accumulated, chronological, evidence-linked skin journey—is what compounds over time. A platform that optimizes for one-shot AI answers without stable evidence infrastructure reverts to analyzer behavior and forfeits long-term value.

The Personal Evidence Base must be stable before advanced engines operate. Product Intelligence, Ingredient Intelligence, Recommendation Engine, Outcome Intelligence, and Learning Layer all assume evidence objects with clear boundaries, append-oriented history, and explicit links. Building those engines on unstable or ambiguous evidence shapes creates rework, traceability loss, and scope drift that is expensive to unwind.

Evidence must be consent-aware, traceable, correctable, and deletion-compatible from the beginning. Consent, correction, and deletion cannot be retrofitted after data accumulates without risking non-compliance, user distrust, and silent personalization on records the user withdrew or corrected. Phase 1 plans these behaviors into the evidence model before any persistence or capture implementation proceeds.

---

## Phase 1 Scope

Phase 1 planning covers the following domains. Each item is a planning deliverable—not an implementation authorization.

- **Scan Record V2 planning** — Redefinition of the central evidence event as a governed capture container linking all Phase 1 evidence objects.
- **Consent-aware scan capture** — Capture semantics that respect consent state before evidence is persisted or enriched.
- **Evidence object boundaries** — Explicit responsibility, ownership, and prohibited merges for each evidence type.
- **Image evidence metadata planning** — Visual capture artifacts and associated metadata without conflating image storage with inference output.
- **User-provided description evidence** — User narrative, context, and self-reported observations as first-class evidence, distinct from AI interpretation.
- **Symptom observation evidence** — Structured cosmetic signals—observed or reported—scoped to body areas and capture session.
- **Body area linking** — Connections between evidence and anatomical region vocabulary using language-neutral identifiers.
- **Product/routine mention capture only as evidence** — User-mentioned products and routine context recorded as unverified mentions, not as Product Intelligence or Routine Intelligence outputs.
- **User correction path** — Mechanism for users to qualify, supersede, or dispute prior evidence without silent overwrite.
- **Confidence posture attachment** — Initial confidence metadata on evidence quality, completeness, recency, and source reliability.
- **Deletion and retention compatibility** — Evidence lifecycle design aligned with consent withdrawal, deletion requests, and retention policies defined in architecture.

---

## Explicit Out of Scope

The following are excluded from Phase 1 planning and implementation. Their absence is intentional scope discipline, not deferred convenience.

- Database schema
- SQL migrations
- API endpoint design
- UI redesign
- Full Product Intelligence
- Full Ingredient Intelligence
- Full Recommendation Engine
- Full Outcome Intelligence
- Full Learning Layer
- Stripe
- PDF export
- Admin panel
- Medical diagnosis
- Disease labels
- Treatment planning

---

## Evidence Objects To Plan

The following objects are defined at conceptual level only. Field lists, storage shapes, and transport contracts belong to downstream implementation documents—not this plan.

### Scan Record V2

The central evidence event. A Scan Record V2 represents a single governed capture session: when it occurred, under what consent state, what evidence objects it contains or references, and what confidence posture applies to the session as a whole. It is the anchor to which image evidence, descriptions, symptom observations, body area links, and product/routine mentions attach. It does not embed Intelligence Layer conclusions, recommendations, or learning outputs.

### Image Evidence

Captured visual evidence and related metadata. Image Evidence records what was captured—not what AI inferred from it. Metadata includes capture context (device, timing, quality indicators) and links to the parent Scan Record V2. AI-assisted observations derived from images are separate governed artifacts with evidence links; they do not replace or silently merge into Image Evidence.

### User Description Evidence

User-provided description, context, and self-reported observations. This object preserves the user's own words and structured self-report as authoritative personal experience evidence. It is distinct from AI-generated summaries and from Symptom Observation Evidence when the user expresses observations in free form rather than structured selection.

### Symptom Observation Evidence

Structured observed or reported cosmetic signals. Symptom observations reference language-neutral symptom identifiers and are scoped to body areas and capture time. They represent cosmetic presentation signals—not clinical diagnoses or disease labels. Observations may originate from user selection, user description normalization, or AI-assisted structuring; provenance and confidence posture must reflect the source.

### Body Area Evidence Link

Connection between evidence and anatomical region vocabulary. Body Area Evidence Links associate symptom observations, image evidence regions, and user descriptions with stable, language-neutral body area identifiers. They enable spatial context without binding intelligence to locale-specific anatomical terminology.

### Product Mention Evidence

Products mentioned by user during scan, without treating them as verified Product Intelligence. Product Mention Evidence captures what the user said they use or applied—name, free-text label, or partial identifier—not canonical product resolution, ingredient composition, or catalog linkage. Resolution to Knowledge Layer product entities is a Phase 2 concern.

### Routine Mention Evidence

Routine context mentioned by user, without building full Routine Intelligence yet. Routine Mention Evidence captures regimen context the user provides during capture—products referenced, timing, frequency, recent changes—as unstructured or lightly structured evidence. It does not produce governed Routine structure objects or temporal regimen models.

### Consent Snapshot

Consent state captured at evidence creation time. A Consent Snapshot records which consent scopes were active when evidence was captured, enabling downstream audit of whether persistence and enrichment were authorized. Consent Snapshots are immutable historical records; consent changes after capture do not retroactively alter prior snapshots.

### Correction Event

User correction that qualifies, supersedes, or disputes previous evidence without silent overwrite. A Correction Event links to the evidence it addresses, records what the user changed or rejected, and establishes supersession semantics for downstream consumption. Prior evidence remains in the Personal Evidence Base for auditability; corrections define what is currently authoritative for reasoning without erasing history.

### Evidence Confidence Posture

Initial confidence posture attached to evidence quality, completeness, recency, and source reliability. Evidence Confidence Posture expresses epistemic limits at capture time—e.g., low image quality, partial user input, AI-structured vs user-attested—so downstream layers do not treat all evidence as equally reliable. Confidence posture is attached to evidence objects and may be updated only through governed correction or enrichment events, not silent recalculation.

---

## Phase 1 Rules

These rules are non-negotiable for all Phase 1 evidence design and any future implementation derived from it.

- **Evidence must be append-oriented** — New capture and correction events extend history. The Personal Evidence Base grows forward; it is not replaced session-by-session.
- **No silent overwrite** — Prior evidence records are not modified in place to reflect new understanding. Supersession flows through Correction Events and governed linkage.
- **No hidden AI memory outside governed evidence** — AI session state, provider-side memory, and undocumented caches do not substitute for Personal Evidence Base objects. All durable signals normalize into governed evidence with provenance.
- **No AI inference without evidence link** — AI-assisted outputs must reference the evidence objects that produced them. Orphan inference is prohibited.
- **No user correction as global truth** — Corrections are authoritative for the correcting user's personal record and supersession semantics; they do not redefine platform-wide knowledge or clinical fact.
- **No deleted evidence reused for personalization** — Evidence subject to deletion or consent withdrawal must not continue to inform personalization, learning, or intelligence outputs.
- **No medical-scope expansion** — Evidence objects, symptom vocabulary, and capture flows remain within cosmetic scope. No diagnosis fields, disease labels, or treatment planning artifacts.
- **No commercial profiling** — Evidence capture and storage do not produce marketing segments, purchase propensity signals, or third-party data exploitation artifacts.

---

## Phase 1 Implementation Gates

No code may begin until all gates pass. Gate review is a deliberate checkpoint—not a formality.

| Gate | Requirement |
|------|-------------|
| **Object list accepted** | All Evidence Objects To Plan are reviewed and accepted as the Phase 1 evidence inventory. No undocumented evidence types enter implementation. |
| **Object boundaries accepted** | Each object's responsibility, ownership layer, inputs, outputs, and prohibited merges are documented and accepted. Adjacent objects (e.g., Product Mention vs Product Intelligence) do not collapse. |
| **Consent impact accepted** | Consent Snapshot behavior, capture blocking semantics, and post-capture consent change handling are defined and accepted for every evidence object. |
| **Deletion impact accepted** | Deletion and retention behavior per object is documented: what is removed, what is anonymized, what audit trail remains, and what downstream engines must exclude. |
| **Correction behavior accepted** | Supersession semantics, Correction Event structure, and downstream consumption rules are defined and accepted. No silent overwrite path exists. |
| **Confidence posture accepted** | Evidence Confidence Posture dimensions, assignment rules at capture, and update paths through correction are defined and accepted. |
| **Minimal implementation slice selected** | The first coding slice is explicitly chosen, scoped, and mapped to accepted objects—no broader implementation begins by default. |

All gates require sign-off from product leadership and architecture before any Phase 1 implementation work starts.

---

## First Implementation Slice Recommendation

The smallest recommended future coding slice—after all Phase 1 gates pass—is:

**Scan Record V2 conceptual mapping against current analysis persistence.**

The existing platform persists analysis sessions (e.g., `analyses` and related capture artifacts in current delivery). The first implementation slice should not rebuild the Evidence Layer wholesale. It should produce a governed mapping document that identifies:

- Which current persistence artifacts correspond to Scan Record V2 and attached evidence objects
- Which artifacts conflate evidence with Intelligence Layer output and require separation
- Which gaps exist where Phase 1 objects have no current representation (Consent Snapshot, Correction Event, Evidence Confidence Posture)
- What append-oriented and supersession semantics the current model violates or supports
- What must change before consent, deletion, and correction requirements can be met

This slice is intentionally minimal: mapping and gap analysis only, producing an alignment artifact that informs the next implementation decision—not a schema migration, API change, or feature delivery.

**This is only a recommendation.** Alternative first slices may be proposed during gate review if they deliver equivalent architectural clarity with lower risk. Any slice must remain within Phase 1 scope and respect all Phase 1 Rules.

**Coding should not begin until this Phase 1 planning document is reviewed and accepted** and all Phase 1 Implementation Gates pass.

---

## Current Decision

**This document opens Phase 1 planning only, not implementation.**

Acceptance of this document means architecture and product agree on Phase 1 evidence objects, boundaries, rules, and gates. It does not authorize database changes, API work, capture flow coding, or Experience Layer redesign.

Until this document is accepted and gates pass:

- No Evidence Layer code
- No schema or migration work justified by Phase 1
- No feature work that introduces evidence objects outside this plan
- No bypass of out-of-scope items listed above

Implementation authorization requires a separate gate sign-off after this planning document is accepted and the minimal implementation slice is selected.
