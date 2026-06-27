# SkinIntel Platform Architecture V2

## Status

Draft V1

---

## Purpose

This document is the master architecture document for the SkinIntel platform. It establishes the authoritative conceptual frame through which the entire platform is understood, governed, and evolved. All stakeholders—product leadership, architecture, engineering, data governance, and delivery teams—should treat this document as the primary reference for what SkinIntel is architecturally and how its constituent parts relate to one another.

This document does not replace the detailed architecture documents that define specific domains, engines, models, and decisions. Those documents remain the authoritative sources for depth within their respective scopes. The role of this document is different: to connect those specialized artifacts into one coherent system. It provides the integrative view that makes individual documents legible as parts of a unified whole rather than as isolated specifications.

Every architecture decision recorded elsewhere must remain consistent with the structures, boundaries, and principles defined here. Every Intelligence Engine must align with the roles and relationships assigned to it within this framework. Every data object must conform to the conceptual model and flow described at this level. Every future implementation—whether near-term or long-term—must preserve the integrity of the system as articulated in this document. Where detailed documents extend or refine this architecture, they do so within its boundaries; where they appear to conflict, resolution begins with reconciliation against this master view.

Accordingly, this document serves as the single executive overview of the platform architecture. It is written for leaders and practitioners who need a complete picture before diving into domain-specific detail. It answers not only what SkinIntel comprises, but why its architecture is organized as it is and how its parts depend on one another.

Within that executive role, this document defines five essential dimensions of the platform:

**Platform philosophy** — The foundational beliefs and constraints that shape every architectural choice: how SkinIntel interprets user context, how it earns trust, how it balances precision with adaptability, and how it positions intelligence as a sustained capability rather than a point-in-time output.

**Architecture layers** — The logical stratification of the platform: what sits above what, where responsibilities begin and end, and how separation of concerns enables independent evolution without fragmentation.

**Intelligence flow** — The end-to-end movement of information and inference across the platform: from raw input through interpretation, enrichment, personalization, and actionable guidance, including the feedback mechanisms that close the loop.

**Relationships between engines** — The contractual interdependencies among Intelligence Engines: which engines consume what, which produce what, how handoffs are governed, and how the platform maintains coherence when multiple engines operate in parallel or sequence.

**Relationships between documents** — The map of the architecture documentation estate itself: which documents hold authority for which domains, how this master document relates to engine-specific, data-specific, and decision-specific artifacts, and how readers navigate from overview to detail without losing systemic context.

By holding these dimensions in one place, this document reduces architectural drift. It ensures that product vision, engine design, data modeling, user experience, and delivery planning all reference the same underlying system definition. Teams may work in parallel across domains; this document is what keeps their work convergent.

This document intentionally stops at the level of architecture. It does not prescribe implementation approaches, operational mechanics, or delivery sequencing. Those concerns belong to downstream documents and execution planning. Its value lies in clarity of structure, consistency of intent, and the assurance that every part of SkinIntel can be traced back to a single, coherent architectural whole.

---

## Product Vision

(placeholder)

---

## Core Principles

(placeholder)

---

## Platform Layers

The SkinIntel platform is organized into five permanent architectural layers. These layers are not organizational conveniences or delivery phases; they are structural commitments that define how the platform acquires meaning, generates insight, improves over time, and delivers value to the user. Each layer has a distinct responsibility, a defined scope, and a fixed position in the overall architecture. Together they form a vertical stack in which information rises through progressively higher levels of abstraction, always grounded in what the user has actually experienced.

This layering model is invariant. Future capabilities, new Intelligence Engines, and expanded product scope must fit within these layers rather than redefine them. The layers establish boundaries that protect architectural integrity: what belongs where, what may depend on what, and what must never be conflated. Understanding the platform begins with understanding this stack.

### Layer dependency and architectural discipline

Every layer depends on the layer immediately beneath it. The Knowledge Layer cannot operate without evidence to transform. The Intelligence Layer cannot reason without structured knowledge to reason over. The Learning Layer cannot improve without intelligence outputs and their observed consequences. The Experience Layer cannot present meaningful guidance without intelligence that has been derived through the full chain below it.

No layer should bypass another. Shortcuts that move raw evidence directly into presentation, or that generate recommendations without passing through knowledge structuring and reasoning, violate the architecture and undermine trust. Bypassing creates hidden assumptions, untraceable conclusions, and intelligence that cannot be explained or improved. Architectural discipline requires that all platform behavior traverse the stack in order: evidence first, then knowledge, then intelligence, then learning where applicable, then experience.

Evidence is the foundation of the entire platform. Without a faithful record of the user's real skin journey, every higher layer operates on abstraction rather than truth. SkinIntel does not begin with generic models or pre-formed conclusions; it begins with what the user has observed, applied, experienced, and reported. All intelligence is ultimately accountable to that foundation.

---

### Layer 1 — Evidence Layer

**Purpose:** Collect, normalize, and preserve evidence from the user's real skin journey.

The Evidence Layer is the platform's source of truth. Its responsibility is to capture what is happening on and around the user's skin with fidelity, consistency, and permanence. Evidence enters the platform through user action, observation, and feedback. The layer does not interpret, recommend, or optimize. It records, standardizes, and retains.

Examples of evidence include:

- **Scans** — Visual or structured captures of skin condition at a point in time
- **Body areas** — The anatomical or logical regions to which evidence applies
- **Symptoms** — Observable or reported signs of skin state
- **Severity** — The degree or intensity associated with symptoms or conditions
- **Products** — Items the user applies, uses, or considers part of their regimen
- **Ingredients** — Constituent substances associated with products or exposures
- **Routines** — Sequences, frequencies, and patterns of product use over time
- **Outcomes** — Changes in skin state following interventions or elapsed time
- **Feedback** — Explicit user judgments, confirmations, corrections, or preferences

The Evidence Layer must preserve provenance: when evidence was captured, in what context, and with what level of user attestation. Normalization ensures that disparate inputs can be compared and referenced consistently downstream, without altering their essential meaning. What is lost or corrupted at this layer cannot be recovered at any higher layer.

---

### Layer 2 — Knowledge Layer

**Purpose:** Transform evidence into structured knowledge.

The Knowledge Layer sits above evidence and converts raw, heterogeneous records into organized, queryable, and interoperable knowledge. Where the Evidence Layer asks *what happened*, the Knowledge Layer asks *what does this mean in structured terms*. It bridges the gap between lived experience and reasoning-ready representation.

This layer includes:

- **Product Intelligence** — Structured understanding of products: identity, composition, role, and relationships within the user's context
- **Ingredient Intelligence** — Structured understanding of ingredients: properties, classifications, and relevance to skin outcomes
- **Knowledge enrichment** — Augmentation of evidence-derived facts with domain knowledge that supports interpretation without replacing user-specific truth
- **Classifications** — Assignment of evidence and entities to consistent categorical frameworks
- **Normalization** — Harmonization of terminology, units, and representations so that knowledge from multiple sources and time points can be combined

The Knowledge Layer does not yet draw conclusions about what the user should do. It prepares the substrate on which reasoning depends. All intelligence downstream assumes that knowledge has been structured according to platform conventions and remains traceable to underlying evidence.

---

### Layer 3 — Intelligence Layer

**Purpose:** Reason over accumulated knowledge.

The Intelligence Layer is where SkinIntel generates insight. It consumes structured knowledge—personal, contextual, and enriched—and applies reasoning to produce outputs that reflect what the platform understands about the user's skin journey and what may follow from it.

This layer includes:

- **Correlation** — Identification of relationships among products, ingredients, routines, symptoms, and outcomes within the user's history
- **Prediction** — Forward-looking inference about likely skin responses, risks, or trajectories based on accumulated patterns
- **Recommendation** — Actionable guidance derived from reasoning, aligned with the user's context and goals
- **Confidence** — Explicit expression of certainty, uncertainty, and the evidentiary basis supporting each inference or recommendation

The Intelligence Layer operates on knowledge, not on raw evidence directly. Its outputs must be explainable in terms of the knowledge and evidence chain that produced them. Intelligence without confidence is incomplete; confidence without traceability to evidence is unacceptable.

---

### Layer 4 — Learning Layer

**Purpose:** Improve the platform over time.

The Learning Layer closes the loop between what the platform infers and what actually occurs. It observes outcomes, incorporates feedback, and refines how the platform interprets, reasons, and guides—always in service of the individual user's evolving skin journey and, where architecturally appropriate, of platform-wide refinement.

This layer includes:

- **Outcome Intelligence** — Systematic evaluation of whether predicted or recommended outcomes align with observed results
- **Personal Threshold Learning** — Adaptation to individual tolerance, sensitivity, and response patterns that differ from population norms
- **Feedback loops** — Mechanisms by which user corrections, confirmations, and new evidence flow back into knowledge and intelligence refinement
- **Continuous improvement** — Sustained refinement of reasoning quality, relevance, and calibration as evidence accumulates over time

The Learning Layer does not replace the Intelligence Layer; it informs and sharpens it. Learning that bypasses evidence—by adjusting models without reference to what the user actually experienced—violates the same architectural principle that forbids bypass elsewhere. All improvement must remain anchored to the Evidence Layer.

---

### Layer 5 — Experience Layer

**Purpose:** Present intelligence to the user.

The Experience Layer is the surface through which the user encounters SkinIntel's value. It translates intelligence into forms that are accessible, actionable, and trustworthy. It does not originate insight; it communicates insight that has passed through the layers below.

This layer includes:

- **Dashboard** — Consolidated view of current skin state, active guidance, and salient patterns
- **History** — Chronological access to evidence, outcomes, and the evolution of the user's skin journey
- **Reports** — Structured summaries of findings, trends, and significant changes over defined periods
- **Explanations** — Clear articulation of why the platform reaches particular conclusions, linked to evidence and reasoning
- **Formulation proposal** — Presentation of suggested product or routine directions derived from intelligence, framed for user evaluation and decision

The Experience Layer must never present conclusions that cannot be traced through knowledge and intelligence to evidence. Presentation is not a substitute for reasoning; it is the final expression of a complete architectural chain. When the user acts on what they see at this layer, they act on intelligence that is grounded, structured, and improvable.

---

### Summary

The five layers—Evidence, Knowledge, Intelligence, Learning, and Experience—define the permanent vertical architecture of SkinIntel. Evidence grounds everything. Knowledge structures it. Intelligence reasons over it. Learning improves how reasoning performs. Experience delivers the result to the user. Each layer depends on the one before it. No layer bypasses another. This structure is the architectural contract under which all platform capabilities must operate.

---

## Intelligence Engines

(placeholder)

---

## Data Model

(placeholder)

---

## Intelligence Flow

(placeholder)

---

## Personal Evidence Base

(placeholder)

---

## Long-Term Learning Loop

(placeholder)

---

## Product Lifecycle

(placeholder)

---

## User Journey

(placeholder)

---

## Future Architecture

(placeholder)

---

## Related Documents

(placeholder)

---

## Version History

V1 Draft
