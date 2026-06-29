# SkinIntel Implementation Plan V1

## Purpose

This document defines how SkinIntel moves from accepted architecture into implementation without breaking the architecture.

Architecture documents establish what the platform is, how layers relate, and which boundaries are non-negotiable. This plan translates those commitments into a phased delivery sequence. Each phase has explicit scope, explicit exclusions, and gates that must pass before coding begins. The goal is not speed at the expense of structure—it is controlled progress that preserves Personal Evidence Base integrity, layer discipline, and cosmetic-scope boundaries as the system is built.

Implementation follows **docs/SKININTEL_PLATFORM_ARCHITECTURE_V2.md**, **docs/ARCHITECTURE_DECISIONS.md**, and domain-specific architecture artifacts. Where this plan and detailed architecture appear to conflict, architecture wins until explicitly reconciled through review.

---

## Implementation Principles

The following principles govern every phase. They are not optional delivery preferences; they are architectural constraints carried into execution.

**Architecture before implementation** — No feature, module, or integration is designed or built until its place in accepted architecture is defined and recorded. When implementation and architecture conflict, work stops until the conflict is resolved through documented review.

**Evidence → Knowledge → Intelligence → Learning → Experience** — All capabilities flow through this pipeline. Evidence is captured and persisted. Knowledge structures domain meaning. Intelligence reasons over knowledge in personal context. Learning calibrates from outcomes and corrections. Experience presents intelligence traceable to evidence. No stage may be skipped or collapsed into another for convenience.

**No layer bypass** — Conclusions do not leap from raw capture to recommendations. Presentation does not embed reasoning. Learning does not overwrite evidence. Each layer consumes defined inputs and produces defined outputs with explicit handoff contracts.

**Personal Evidence Base is the durable asset** — The user's accumulated, traceable, chronological, evidence-linked skin journey is the core platform value. Implementation must extend and preserve this asset—not fragment it, overwrite it, or untrace it for short-term feature appeal.

**AI is replaceable** — Artificial intelligence assists capture, enrichment, and interpretation. AI providers and models are implementation components, not the product. Inference normalizes into governed knowledge structures with evidence links so provider changes do not destroy historical accountability.

**Data model is not SQL** — The conceptual data model defines object boundaries, relationships, and lifecycle semantics. Storage technology follows the model; the model does not follow tables, ORM convenience, or legacy schema shapes. Physical persistence is a downstream concern subordinate to object integrity.

**Consent and deletion governance are architectural constraints** — What is captured, retained, used, corrected, and deleted is governed by explicit consent and deletion rules defined at architecture level. Implementation must be compatible with these rules from the first evidence object—not retrofitted after data accumulates.

**Confidence and explainability are mandatory** — Every inference, recommendation, and guidance output must express appropriate confidence and remain traceable to supporting evidence. Uncertainty is surfaced honestly. Users can follow conclusions to their basis and correct what the platform got wrong.

**Cosmetic-scope only** — SkinIntel organizes personal cosmetic skin evidence and intelligence. It does not operate as medical software.

**No diagnosis, disease labels, or treatment claims** — Implementation must not introduce clinical diagnostic behavior, disease naming, or claims to treat, cure, or medically manage conditions. Safety boundary escalation may recommend professional consultation; it does not substitute clinical judgment.

---

## Phase 1 — Evidence Layer Foundation

Phase 1 is the first and only phase authorized for immediate implementation planning after this document is accepted. It establishes the foundation on which all subsequent layers depend.

### Scope

- **Scan capture foundation** — Consent-aware image and structured session capture that produces governed evidence inputs, not standalone AI answers.
- **Evidence object planning** — Definition of core evidence objects (e.g., scan records, symptom observations, body-area associations, temporal markers) with clear boundaries and traceability requirements.
- **Consent-aware capture** — Capture flows that respect consent state before evidence is persisted or enriched.
- **Basic Personal Evidence Base persistence planning** — Chronological, append-oriented storage semantics for personal evidence; no silent overwrite of historical records.
- **User correction path planning** — Mechanism by which users supersede or qualify prior evidence without destroying auditability.
- **Confidence posture attachment planning** — How confidence metadata attaches to evidence and early inference outputs at capture and enrichment stages.
- **Deletion/retention compatibility planning** — Evidence lifecycle design compatible with consent withdrawal, deletion requests, and retention policies defined in architecture.

### Out of scope

- Full Learning Layer
- Full Outcome Intelligence
- Product Intelligence rebuild
- Advanced Prediction Engine
- Custom formulation
- Commercial profiling
- Webshop logic
- Full admin panel
- Stripe
- PDF export
- UI redesign

Phase 1 delivers evidence infrastructure and planning artifacts—not a feature-complete product surface. Experience Layer work in this phase is limited to what is required to exercise consent-aware capture and evidence persistence correctly.

---

## Phase 2 — Knowledge Layer Foundation

High-level scope only. Detailed planning begins after Phase 1 gates pass and Phase 2 is explicitly authorized.

### Scope

- **Product identity refinement** — Stable, language-neutral product entities linked to personal exposure context.
- **Ingredient identity refinement** — Canonical ingredient entities decoupled from label text and locale.
- **Formulation composition context** — Structure for how products relate to ingredient exposure without collapsing product and ingredient domains.
- **Routine structure model** — Temporal regimen structure linking products, sequencing, and change events to evidence.
- **Language-independent identifiers** — Universal internal keys for all knowledge objects; presentation translations remain outside knowledge persistence.

---

## Phase 3 — Intelligence Layer Foundation

High-level scope only. Detailed planning begins after Phase 2 foundation is in place.

### Scope

- **Recommendation rationale structure** — Recommendations as governed records with explicit rationale, evidence citations, and scope boundaries.
- **Confidence-qualified analysis** — Intelligence outputs that express epistemic limits and evidence density, not false precision.
- **Outcome-ready recommendation records** — Recommendations structured so future outcome evaluation can assess what was suggested, when, and on what basis.
- **Safety boundary escalation behavior** — Defined escalation paths when observations or patterns exceed cosmetic-scope boundaries; no diagnostic output.

---

## Phase 4 — Learning Loop Foundation

High-level scope only. Detailed planning begins after Phase 3 foundation is in place.

### Scope

- **Outcome capture** — Structured recording of post-intervention change linked to prior recommendations and evidence.
- **Before/after comparison** — Governed comparison semantics within Personal Evidence Base timeline.
- **Personal threshold learning preparation** — Foundations for individual calibration from evaluated history without overwriting source evidence.
- **Correction-driven supersession** — Learning signals derived from user corrections that refine future guidance while preserving historical accountability.

---

## Implementation Gates

No phase proceeds to coding until all applicable gates pass. Gates apply per phase; earlier phases must complete their gates before later phases open.

| Gate | Requirement |
|------|-------------|
| **Relevant architecture section accepted** | Governing architecture documents for the phase are reviewed and marked accepted—not draft placeholders conflicting with implementation intent. |
| **Object boundaries clear** | Each object in scope has defined responsibility, ownership layer, and prohibited merges with adjacent objects. |
| **Consent/deletion impact understood** | Capture, retention, correction, and deletion behavior for phase objects is documented and compatible with governance rules. |
| **Confidence behavior defined** | How confidence is assigned, updated, and presented for phase outputs is specified—not deferred to implementation discretion. |
| **No medical-scope drift** | Phase scope reviewed against cosmetic boundaries; no diagnosis, disease labels, or treatment claims introduced by design or omission. |
| **Diff review before commit** | Implementation changes reviewed against architecture and this plan before merge; silent deviation is not acceptable. |

Phase 2, 3, and 4 each require their own gate review in addition to completion of the prior phase. Authorization to plan a later phase does not authorize coding it.

---

## Current Decision

**Implementation should start with Phase 1 only after this plan is reviewed and accepted.**

Phases 2 through 4 remain architectural placeholders in this document. They define direction and sequencing intent but are not authorized for implementation planning or coding until Phase 1 completes its gates and a subsequent plan revision—or addendum—explicitly opens the next phase.

Until acceptance: no Evidence Layer coding, no schema migration justified by this plan, and no feature work that bypasses Phase 1 scope or out-of-scope items listed above.

Acceptance means product leadership and architecture agree this sequencing preserves platform integrity and is the correct first step after architecture cleanup.
