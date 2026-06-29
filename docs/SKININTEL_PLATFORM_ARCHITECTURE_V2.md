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

Product Vision defines what SkinIntel is for—not at marketing level, but at platform architecture level. It establishes the product identity that every layer, engine, data object, and experience decision must serve. This section states the long-term direction of the platform. It does not reproduce the full product vision document; **docs/00_FINAL_PRODUCT_VISION.md** holds expanded mission narrative, trust principles, and user-facing framing. Here, vision is expressed as architectural north star: what the platform exists to build, how it creates value, and what it must refuse to become.

---

### Personal Skin Intelligence Platform, not AI skin analyzer

SkinIntel is not just an AI skin analyzer. An AI skin analyzer delivers one scan and one answer—a moment of interpretation that resets when the session ends. That model competes on model quality alone and offers no durable asset to the user who returns tomorrow, next month, or next year.

SkinIntel is a **Personal Skin Intelligence Platform**. Its purpose is to help users build a long-term, evidence-based understanding of their own skin through scans, symptoms, products, ingredients, routines, outcomes, recommendations, feedback, and longitudinal memory. Intelligence compounds because evidence accumulates, outcomes are evaluated, and guidance improves from documented experience—not because a single inference run produces a sharper label.

The product promise shifts from *what does AI think today?* to *what does my skin journey show, what changed after I acted, and what should I do next based on my own evidence?* That shift is architectural. It requires Personal Evidence Base continuity, governed Intelligence Engines, confidence-aware reasoning, and a closed learning loop—not a better camera and a larger language model alone.

---

### One scan versus longitudinal intelligence

The difference between an analyzer and a platform is structural, not cosmetic.

**AI skin analyzer** — One scan, one answer. Stateless interpretation. Generic guidance detached from prior products, routines, or outcomes. No accountability when recommendations fail. No memory when the user returns. Value peaks at first use and does not compound.

**Personal Skin Intelligence Platform** — Personal evidence, memory, learning, outcomes, and increasingly personalized guidance over time. Each scan contributes to a connected record. Product introduction, routine change, and user correction create temporal context. Recommendations link to evidence and await outcome evaluation. Learning calibrates to individual tolerance and response patterns. Value grows with continued engagement because the Personal Evidence Base grows more connected, more explainable, and more useful.

Architecture exists to enforce this difference. Layers do not bypass one another. History is not overwritten. Uncertainty is not hidden. User voice is not suppressed. Without these commitments, SkinIntel would revert to analyzer behavior regardless of product language.

---

### The core asset: Personal Evidence Base

The core asset of SkinIntel is the **Personal Evidence Base**—the accumulated, traceable, chronological, evidence-linked record of the user's skin journey. It is not saved scans alone. It is scans connected to symptoms, body areas, products, ingredients, formulation context, routine structure, recommendations received, user confirmations and corrections, outcomes evaluated, confidence history, AI Knowledge Objects, learning signals, and longitudinal timeline events.

Every architectural decision in this document serves that asset. Input Intelligence extends it. Memory Engine retrieves it. Intelligence Engines reason over it. Outcome Intelligence evaluates change within it. Learning Layer calibrates from it. Experience Layer presents intelligence traceable back to it. A platform that fragments, overwrites, or untraces this record destroys its own long-term value proposition—regardless of short-term feature appeal.

Users should build something they cannot trivially replicate elsewhere: a personal skin intelligence history earned through engagement, structured for their benefit, and accountable to their corrections over time.

---

### AI is capability, not the product

Artificial intelligence is an important capability within SkinIntel. It assists capture, enrichment, interpretation, and synthesis. Input Intelligence may use AI-assisted observation. Product ingress may use OCR and label extraction. Correlation and prediction may use AI-assisted reasoning. AI contributions normalize into AI Knowledge Objects with evidence links—preserving provider independence and historical accountability.

AI is not the product by itself. Reliability, personalization, and trust come from how signals are collected, stored, correlated, evaluated, and refined over time—not from any single automated response. The Intelligence Engine architecture, Personal Evidence Base, and Long-Term Learning Loop are the product core. AI models and providers are replaceable components within that durable system. Architecture must preserve engine integrity and continuity, not bind platform fate to any single vendor or model generation.

When AI inference bypasses evidence, when recommendations lack confidence context, or when outputs cannot be explained or corrected, the platform fails its vision—even if the AI output appears plausible in isolation.

---

### How the platform creates value

SkinIntel creates value through capabilities that compound over time:

- **Long-term memory** — Continuity across scans, products, routines, and outcomes; the user returns to an intact story, not a blank session.
- **Product and ingredient intelligence** — Products and exposure understood in personal context, not as catalog entries alone.
- **Routine intelligence** — Regimen structure, sequencing, and change events linked to exposure and outcomes.
- **Outcome intelligence** — Measurable change after interventions; recommendations evaluated against what actually occurred.
- **Confidence-aware recommendations** — Guidance qualified by evidence density and epistemic limits; honest uncertainty as a feature.
- **Personal threshold learning** — Calibration to individual tolerance, meaningful change definitions, and anti-repeat guards from evaluated history.
- **Explainability and trust** — Users can follow conclusions to evidence, understand rationale, and correct what the platform got wrong.
- **Privacy and user control** — What is remembered, used, and correctable is governed explicitly; trust is foundation, not afterthought.
- **Multilingual, language-independent architecture** — Domain meaning persists in language-neutral identifiers; presentation adapts to locale without fragmenting intelligence.

These capabilities interlock. Memory without outcome evaluation produces archives without learning. Recommendations without confidence produce false precision. Personalization without explainability produces opaque distrust. The platform vision requires all of them, governed by architecture—not a subset chosen for demo speed.

---

### What SkinIntel must not become

Product vision includes explicit refusal. Architecture and experience must reject identities that contradict Personal Skin Intelligence:

- **Medical diagnostic system** — SkinIntel organizes personal cosmetic skin evidence; it does not assign clinical diagnoses or present itself as medical software.
- **Doctor replacement** — Educational cosmetic guidance supports informed self-care; it does not substitute professional clinical judgment.
- **Generic chatbot** — Responses ground in structured Personal Evidence Base history and governed engines—not stateless conversational improvisation.
- **One-shot scan gimmick** — Value must compound through longitudinal engagement, not peak at first capture.
- **Webshop funnel** — Products are variables in the user's skin journey, not conversion targets; Product Lifecycle serves intelligence, not commerce.
- **Marketing profile** — The record exists to serve personal skin intelligence, not advertising segmentation or third-party data exploitation.
- **Black-box AI advice tool** — Inference without evidence links, unexplained personalization, and uncorrectable outputs violate architectural trust.
- **Commerce-biased recommendation engine** — Affiliate logic, pricing pressure, and catalog promotion remain outside recommendation semantics regardless of integration depth.

Scope discipline is permanent. Features that push toward these identities fail vision review regardless of short-term metrics.

---

### Long-term product goal

The long-term product goal is for SkinIntel to become a **calm personal skin intelligence companion**—a platform that helps users understand what affects their skin and what actually works for them over time.

The ideal experience is not clinical alarm, not hype-driven AI spectacle, and not shopping urgency. It is purposeful continuity: the platform remembers the journey, explains its reasoning honestly, acknowledges limits, respects corrections, and grows more attuned to the individual as evidence accumulates. Users should feel that engagement builds lasting personal value—that each scan, product log, outcome report, and feedback moment strengthens a record that answers questions generic advice cannot.

SkinIntel succeeds when a user who has engaged for months or years can answer, with grounded confidence: what changed, after what, with what result, and what may be worth trying next based on their own evidence—not population noise, influencer trends, or a single AI snapshot.

This vision governs the platform architecture defined in the sections that follow. Platform layers, Intelligence Engines, Data Model contract, Intelligence Flow, Personal Evidence Base, Long-Term Learning Loop, Product Lifecycle, User Journey, and Future Architecture extension principles all exist to deliver Personal Skin Intelligence—not to showcase technology for its own sake. Every implementation decision should be evaluable against this question: does it help this user build durable, traceable, trustworthy understanding of their own skin over time?

---

## Core Principles

Core Principles are the permanent architectural commitments that govern SkinIntel Platform Architecture V2. They are not optional preferences, marketing language, or implementation suggestions. They define how the platform must behave across every layer, engine, data object, user experience, and future extension. When trade-offs arise, these principles take precedence over delivery speed, feature appeal, or vendor convenience.

This section states platform-level principles at the master architecture frame. Detailed principle elaboration lives in **docs/11_DATA_MODEL.md**, **docs/ARCHITECTURE_DECISIONS.md**, **docs/SKININTEL_INTELLIGENCE_ENGINE_V1.md**, and **docs/99_DEVELOPMENT_RULES.md**. Here, each principle is expressed as a governing rule with its meaning, rationale, and the failure modes it prevents.

---

### 1. Evidence before intelligence

**What it means:** All intelligence must be grounded in captured, structured evidence before inference, enrichment, or recommendation. The Evidence Layer records; higher layers interpret. Raw experience enters as traceable objects; conclusions reference those objects.

**Why it matters:** Personal Skin Intelligence depends on what the user actually experienced—not on model priors, population defaults, or session-bound guesses detached from history.

**What it prevents:** Orphan conclusions, untraceable AI outputs, recommendations disconnected from the Personal Evidence Base, and platforms that sound authoritative without accountability to user experience.

---

### 2. Personal evidence over generic assumptions

**What it means:** When user-specific records and general domain knowledge conflict, intelligence prioritizes this user's documented history—scans, outcomes, feedback, exposure—over population heuristics. Generic knowledge enriches interpretation; personal evidence determines conclusions.

**Why it matters:** Skincare is individual. Guidance that treats every user as average fails the product promise of Personal Skin Intelligence and erodes trust when lived experience contradicts generic advice.

**What it prevents:** One-size-fits-all recommendations, ignored user feedback, population stereotypes embedded as personal truth, and learning that overrides documented experience with universal rules.

---

### 3. Architecture before implementation

**What it means:** Foundational objects, engine boundaries, and layer contracts are defined and accepted before large-scale feature development proceeds against the intelligence platform vision. Implementation serves architecture; architecture does not bend to expedient shortcuts.

**Why it matters:** Features built without stable object definitions scatter data, duplicate logic, weaken traceability, and require expensive rewrites when the platform must finally behave as a coherent system.

**What it prevents:** Fragmented memory, collapsed model boundaries, features that bypass the Data Model, and architectural drift that destroys longitudinal value.

---

### 4. Separation of concerns

**What it means:** Each platform layer, Intelligence Engine, and Data Model object owns a distinct domain. Symptoms do not absorb outcomes. Products do not embed recommendations. Scans do not silently contain intelligence conclusions. Input Intelligence structures; Recommendation Engine guides; Outcome Intelligence evaluates.

**Why it matters:** Conflated responsibilities produce undifferentiated blobs that cannot be explained, correlated, evaluated, or improved at scale.

**What it prevents:** Conceptual collapse, duplicated logic across engines, untestable intelligence chains, and features that rewrite multiple domains in a single undifferentiated record.

---

### 5. Traceability by default

**What it means:** Every meaningful intelligence artifact links to the evidence records that produced it. Users, auditors, and engines can follow conclusions back through knowledge and reasoning to capture events.

**Why it matters:** Explainability and trust require an inspectable chain. A platform that cannot trace its outputs cannot earn confidence over years of use.

**What it prevents:** Black-box guidance, unreferenced AI inference, recommendations without evidence chains, and intelligence that cannot be defended when challenged.

---

### 6. Confidence and uncertainty are first-class

**What it means:** Certainty, uncertainty, and evidence density attach to objects and outputs—not merely to UI badges. Thin evidence produces qualified outputs; uncertain change is a valid outcome; provisional data carries explicit confidence boundaries.

**Why it matters:** Honest uncertainty protects users from false precision and protects learning from calibration corrupted by inflated confidence.

**What it prevents:** Overconfident recommendations on sparse data, hidden weak evidence, retrospective confidence inflation, and learning that treats tentative signals as established truth.

---

### 7. Historical truth must not be overwritten

**What it means:** Immutable capture records, prior recommendations, and prior evaluations remain inspectable. Current understanding supersedes with reference and new events—not silent mutation of what was captured, recommended, or evaluated at a point in time.

**Why it matters:** Longitudinal intelligence requires knowing what was true when. Overwritten history breaks correlation, outcome windows, and user trust simultaneously.

**What it prevents:** Retroactive erasure, mutable scan records, silent recommendation replacement, and timeline integrity collapse that makes past analysis meaningless.

---

### 8. AI is provider-independent and evidence-grounded

**What it means:** AI assists capture, enrichment, and interpretation but normalizes into AI Knowledge Objects with evidence links. Provider choice is implementation; platform meaning persists across vendor changes. Inference without traceable inputs is not valid intelligence.

**Why it matters:** Models and vendors evolve. Personal evidence and architectural meaning must outlast any single AI generation or provider contract.

**What it prevents:** Provider lock-in, vendor-specific shadow models, session-bound AI text treated as platform truth, and intelligence that vanishes or becomes uninterpretable when providers change.

---

### 9. User correction is part of the system

**What it means:** Confirmations, rejections, and corrections are first-class evidence—not disposable UI state. User feedback flows back into the Personal Evidence Base and Learning Layer with governed traceability. Divergence between user report and platform inference is preserved with uncertainty.

**Why it matters:** Lived experience is authoritative for personal intelligence. A platform that cannot be corrected cannot be trusted or improved honestly.

**What it prevents:** Silent suppression of user voice, immutable wrong conclusions, learning that argues against corrected history, and personalization that ignores explicit user rejection.

---

### 10. Cosmetic and educational scope

**What it means:** SkinIntel organizes personal cosmetic skin evidence and provides educational guidance for informed self-care. It does not diagnose conditions, replace clinical assessment, or present itself as medical authority. Language, scope, and escalation paths respect this boundary consistently.

**Why it matters:** Scope discipline protects users, regulatory posture, and product identity. Medical framing contradicts Personal Skin Intelligence as defined in Product Vision.

**What it prevents:** Diagnostic claims, treatment plans, clinical label assignment, and product identity drift toward regulated medical software without governed separation.

---

### 11. Language-independent internal identifiers

**What it means:** Domain objects are defined by meaning through stable internal identifiers—not by display text in any locale. Presentation adapts to user language; intelligence references canonical tokens that persist across sessions and languages.

**Why it matters:** Multilingual expansion must not fragment memory or duplicate concepts per locale. Intelligence engines must reason uniformly regardless of user-facing language.

**What it prevents:** Hardcoded language concepts as domain truth, inconsistent cross-session records, translation-driven data migration, and reasoning that embeds linguistic assumptions into business knowledge.

---

### 12. Commerce must not bias recommendations

**What it means:** Recommendation semantics serve informed personal care grounded in evidence—not catalog conversion, affiliate revenue, pricing pressure, or promotional placement. Product Lifecycle serves intelligence; it is not a webshop funnel.

**Why it matters:** Commerce-biased guidance destroys trust and contradicts the product promise that recommendations exist to serve user intelligence, not obscured commercial logic.

**What it prevents:** Sales-pressure recommendations, affiliate-driven suggestions, catalog promotion disguised as personal guidance, and product intelligence optimized for conversion over user outcomes.

---

### 13. Learning must be explainable and reversible

**What it means:** Personal Threshold Learning produces calibration artifacts that reference prior state, cite supporting evidence, and yield to governed user correction. Learned thresholds are personal hypotheses—not opaque weights or immutable profile mutations.

**Why it matters:** Personalization without explainability is black-box profiling. Learning without reversibility traps users in incorrect calibration with no audit trail.

**What it prevents:** Hidden personalization, overfitting from weak data presented as established truth, learning that ignores user correction, and calibration that cannot be inspected or reset.

---

### 14. Future expansion must be additive and governed

**What it means:** New capabilities add typed objects, references, or evidence layers alongside existing structure—they do not redefine foundational meaning or mutate historical records. Extension requires Data Model review and ADR where boundaries change.

**Why it matters:** Platforms that redefine core objects every release cannot accumulate years of personal evidence. Growth must widen scope without architectural amnesia.

**What it prevents:** Breaking schema changes that orphan history, ad hoc fields that collapse boundaries, features that bypass confidence and traceability, and extension by implementation shortcut rather than governed review.

---

### Universal application

These fourteen principles apply without exception to:

- **Every platform layer** — Evidence, Knowledge, Intelligence, Learning, and Experience layers each uphold the stack; no layer bypasses another.
- **Every Intelligence Engine** — Input through Confidence Layer; each engine's read/write contract preserves traceability, confidence, and boundaries.
- **Every Data Model object** — User Profile through AI Knowledge Objects; each type owns its domain and participates in Personal Evidence Base continuity.
- **Every user experience** — Capture, guidance, history, and correction paths serve intelligence quality and trust—not surface novelty alone.
- **Every future extension** — New domains attach through governed additive process; principles 1–13 remain non-negotiable gates.

When a proposed capability cannot satisfy these principles, it does not belong in the platform architecture regardless of product appeal. When principles conflict with delivery urgency, architecture wins. These Core Principles are the permanent contract under which SkinIntel Platform Architecture V2 and all documents beneath it must operate.

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

The Learning Layer closes the loop between what the platform infers and what actually occurs. It consumes Outcome Intelligence outputs from the Intelligence Layer—evidence-linked outcome evaluations, change assessments, and uncertainty-qualified outcome judgments—and uses them to incorporate feedback and refine how the platform interprets, reasons, and guides. It does not perform outcome evaluation itself; Intelligence evaluates outcomes, and Learning learns from evaluated outcomes.

This layer includes:

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

Intelligence Engines are the platform's reasoning and enrichment capabilities. They are not separate applications, microservices, or isolated product features. Each engine is a defined architectural responsibility—a conceptual capability with explicit read and write contracts against the shared Data Model and Personal Evidence Base. Multiple engines may execute within the same delivery surface; a single user interaction may invoke several engines in sequence or in parallel. What distinguishes an engine is its scope, its boundaries, and the knowledge artifacts it is authorized to produce—not its deployment topology.

All engines operate on the same conceptual objects: scan records, body areas, symptoms, products, ingredients, routines, outcomes, recommendations, formulation concepts, and longitudinal history, as defined in the Data Model. No engine maintains a private shadow model. No engine bypasses the Evidence Layer by inventing conclusions without traceable inputs. Engines compose into a directed intelligence pipeline—input and memory first, enrichment and pattern detection next, evaluation and projection thereafter, guidance and learning last—while the Confidence Layer applies across every stage.

The engines below are listed in approximate processing order. In practice, engines cooperate continuously; Memory Engine serves retrieval throughout, Product and Ingredient Intelligence enrich on demand, and Confidence Layer governs every output regardless of origin.

### Input Intelligence

**Purpose:** Receive, normalize, and structure what the user provides—observations, scan sessions, symptom selections, product logs, routine updates, preferences, and explicit feedback—into durable evidence objects the platform can reason over consistently.

**Reads:** User Profile context (language, declared sensitivities, goals), body area identifiers, symptom classifications, and session context from active interaction flows.

**Produces:** Structured scan records, symptom references scoped to body areas, severity and context attachments, user feedback submissions, and normalized input signals written to the Personal Evidence Base.

**Must not:** Diagnose conditions, assign clinical labels, or convert user input into medical conclusions. Input Intelligence structures experience; it does not interpret it beyond normalization and classification into platform vocabulary.

### Memory Engine

**Purpose:** Preserve, index, and retrieve the user's longitudinal record—the Personal Evidence Base assembled across scans, products, routines, outcomes, and corrections over time.

**Reads:** All evidence objects, User Profile and Skin Profile baseline context, and chronological relationships within the Longitudinal Timeline.

**Produces:** Contextual retrieval assemblies: ordered history by body area, symptom trajectory, product usage periods, routine evolution, and prior intelligence outputs linked to their evidence chains.

**Must not:** Reinterpret or rewrite historical records without new evidence. Memory retrieves and assembles; it does not silently alter what was captured, overwrite immutable evidence, or fabricate continuity where records are absent.

### Product Intelligence

**Purpose:** Maintain structured understanding of commercial skincare products—identity, composition references, routine role, application context, and fit against the user's documented history and goals.

**Reads:** Product model objects, ingredient composition links, user usage records, routine associations, Scan Records referencing product application, and declared sensitivities from User Profile.

**Produces:** Enriched product knowledge objects, verification status, composition snapshots linked to usage periods, and product-context artifacts that downstream engines consume for correlation and recommendation.

**Must not:** Become a product catalog, marketplace, or webshop. Product Intelligence understands products in the user's context; it does not optimize for commerce, availability, or third-party sales integration.

### Ingredient Intelligence

**Purpose:** Decompose and interpret ingredient-level exposure—what components are present in applied products, how they aggregate across routines, and how they relate to the user's personal history and domain knowledge.

**Reads:** Ingredient model objects, product composition links, usage and routine records, declared sensitivities, and personal exposure history derived from evidence.

**Produces:** Ingredient exposure summaries, classification enrichments, interaction context, and exposure artifacts linked traceably to products and time periods.

**Must not:** Label ingredients as universally good or bad. Ingredient Intelligence describes exposure and domain properties in context; personal evidence and declared sensitivities override generic population assumptions.

### Formulation Intelligence

**Architectural classification:** Knowledge Layer intelligence capability.

Formulation Intelligence in V2 is a Knowledge Layer capability—not an Intelligence Layer decision engine, not a recommendation system, and not a custom-formulation system. Its responsibility is composition analysis: understanding how ingredients are structured inside a product. It enriches Product and Ingredient Knowledge so downstream Correlation, Prediction, Recommendation, and Outcome Intelligence can reason about product exposure more accurately. It does not decide what the user should use, create personalized recommendations, propose custom formulas, or claim treatment effects. It does not replace Product Intelligence, Ingredient Intelligence, Recommendation Engine, or Outcome Intelligence.

Prior V1 terminology referred to a **Formulation Engine** oriented toward gap-filling and custom formulation proposals. That capability is not active in V2 architecture. Until a future capability is explicitly defined with its own architectural boundary, "Formulation Engine" must be interpreted as superseded terminology—not as a collapsed alias for Formulation Intelligence. Any future gap-filling or custom formulation proposal capability remains a separate future concern and must not be silently merged into Formulation Intelligence.

**Purpose:** Analyze how ingredients are structured within a product—roles, functional categories, likely purpose, concentration awareness where available, formulation version, reformulation awareness, irritancy and support potential based on composition context, overlap, and composition-level functional coverage. Formulation Intelligence adds structured composition meaning to Product and Ingredient Knowledge without prescribing use or proposing custom formulas.

Historical product exposure must remain linked to the formulation version that existed during that exposure window. Reformulation awareness protects longitudinal integrity: outcomes tied to an older formulation cannot be silently treated as outcomes for a newer formulation.

**Reads:** Product Model, Ingredient Model, Formulation Model, product composition structures, source confidence, verification status, formulation version history, and usage-period context that anchors exposure to a specific formulation snapshot.

**Produces:** Composition analysis artifacts: functional role mappings, category coverage, overlap and duplicate-active exposure signals, concentration-qualified structure where data permits, formulation version and reformulation change markers, irritancy and support context derived from composition, formulation confidence posture, and structured inputs that Correlation, Prediction, Recommendation, and Outcome Intelligence consume for exposure-accurate reasoning.

**Must not:** Make treatment claims, assert therapeutic efficacy, invent missing ingredients, or treat provisional formulation data as verified; decide what the user should use; create personalized recommendations; propose custom formulas; replace Product Intelligence, Ingredient Intelligence, Recommendation Engine, or Outcome Intelligence; or silently conflate outcomes across formulation versions after reformulation.

### Routine Intelligence

**Purpose:** Understand how the user applies care over time—routine structure, sequencing, frequency, product combinations, application areas, and changes to regimen patterns.

**Reads:** Routine model objects, product usage records, body area references, scan and outcome history, and temporal relationships within the Longitudinal Timeline.

**Produces:** Routine structure artifacts, usage pattern summaries, regimen change events, and routine-context knowledge linked to exposure and outcome evaluation.

**Must not:** Prescribe medical routines or assert clinically required treatment schedules. Routine Intelligence documents and interprets usage patterns; actionable guidance flows through Recommendation Engine within cosmetic scope.

### Correlation Engine

**Purpose:** Identify evidence-based associations across the Personal Evidence Base—linking products, ingredients, routines, symptoms, and outcomes within time windows and spatial context.

**Reads:** Scan records, symptom and body area references, product and ingredient exposure history, routine change events, outcome evaluations, and enriched knowledge from Product and Ingredient Intelligence.

**Produces:** Correlation candidates with explicit evidence references, temporal and spatial scope, and confidence posture—typed associations suitable for prediction, recommendation, and learning consumption.

**Must not:** Prove causation or assert definitive medical cause-and-effect. Correlation Engine surfaces candidate relationships grounded in personal evidence; downstream engines and Confidence Layer qualify their strength and limits.

### Outcome Intelligence

**Architectural classification:** Intelligence Layer engine.

Outcome Intelligence belongs to the Intelligence Layer, not the Learning Layer. It evaluates what changed after time, product exposure, routine changes, recommendations, or other governed interventions. It produces outcome evaluations, change assessments, intervention effect assessments, uncertainty-qualified outcome judgments, and evidence-linked outcome artifacts. Uncertain outcome remains a first-class outcome state. It does not perform personal threshold learning by itself, does not own the Learning Layer, and does not mutate user memory or learning state directly. The Learning Layer consumes its outputs to support feedback loops, personal threshold learning, future recommendation calibration, and long-term adaptation—preserving the dependency direction: Evidence → Knowledge → Intelligence → Learning → Experience.

**Purpose:** Evaluate what changed after interventions, routine adjustments, product introductions, or elapsed time—classifying improvement, stability, worsening, partial change, or uncertain change within defined evidence windows.

**Reads:** Scan records before and after anchor events, user-reported feedback, symptom references by body area, product and routine context, prior recommendations, and time-bounded Longitudinal Timeline segments.

**Produces:** Structured outcome evaluation objects scoped to symptoms, body areas, and time windows—change assessments, intervention effect assessments, and evidence-linked outcome artifacts expressed with explicit confidence. Every output remains explainable, confidence-qualified, and auditable back to supporting evidence.

**Must not:** Diagnose disease, label medical conditions, claim treatment effects, or perform personal threshold learning. Outcome Intelligence evaluates observable presentation change and user-reported experience; it does not assign clinical diagnoses or replace professional evaluation.

### Recommendation Engine

**Purpose:** Convert accumulated knowledge, correlations, and personal context into actionable, explainable cosmetic guidance—product directions, routine adjustments, monitoring suggestions, and educational framing grounded in the user's evidence.

**Reads:** Correlation candidates, outcome history, Product and Ingredient Intelligence artifacts, routine context, User Profile goals and sensitivities, Prediction Engine projections, and Learning Layer calibration signals.

**Produces:** Recommendation objects with evidence chains, rationale, scope (body areas, symptoms, products), confidence posture, and linkage to prior recommendations for outcome evaluation.

**Must not:** Create treatment plans, prescribe medical interventions, or issue guidance that exceeds cosmetic and educational scope. Recommendations serve informed personal care decisions; they do not substitute clinical judgment.

#### Safety Boundary Escalation

Safety Boundary Escalation is a governed recommendation boundary within the cosmetic-scope platform—not diagnosis, not medical triage, not disease classification, and not treatment planning. Its purpose is to prevent the platform from giving cosmetic guidance when available evidence indicates that cosmetic guidance may be insufficient, inappropriate, or unsafe. When the safety boundary is reached, Recommendation Engine may produce an escalation recommendation type—such as seeking professional evaluation—without naming a disease, claiming a condition, or asserting that the user has a specific medical problem.

Escalation recommendations remain educational, neutral, and non-alarming. They are evidence-linked, confidence-qualified, and explainable: the user should understand which evidence pattern triggered caution, what uncertainty limited cosmetic guidance, and why professional input may be appropriate—not receive fear-based messaging or implied clinical authority the platform does not possess.

**What escalation is not**

Safety Boundary Escalation does not assign diagnostic labels, prioritize clinical urgency unless explicitly governed elsewhere, prescribe treatment, suggest medication, or pretend that routine cosmetic optimization remains adequate when evidence suggests otherwise. The platform may recommend seeking professional evaluation; it must not tell the user what they have, what they must do clinically, or how urgently they must act beyond governed escalation scope.

**Escalation trigger categories (conceptual)**

Escalation may be considered when evidence patterns suggest cosmetic guidance alone may be inadequate. Conceptual trigger categories include:

- Persistent worsening over time within the user's documented trajectory
- Severe or rapidly changing presentation relative to the user's baseline and history
- User-reported pain, bleeding, swelling, infection-like concern, or unusual reaction
- Unclear presentation where confidence is too low for responsible cosmetic guidance
- Repeated failure of prior cosmetic recommendations within evaluated outcome windows
- Reaction after product use that appears outside normal cosmetic tolerance for this user
- Mismatch between user description and platform confidence in cosmetic interpretation
- User explicitly stating concern that goes beyond cosmetic care scope

These categories describe evidence posture and scope limits—not clinical thresholds, medical conditions, or diagnostic criteria. Recommendation Engine evaluates whether available personal evidence supports continuing cosmetic guidance; when it does not, escalation is the governed alternative to overconfident cosmetic advice.

**Platform behavior at the safety boundary**

When the safety boundary is reached, Recommendation Engine may produce an escalation-type recommendation: seek professional evaluation, pause self-directed product experimentation pending professional input, or maintain monitoring without further cosmetic optimization—each scoped to body areas, symptoms, and evidence referenced in the rationale. Recommendation Engine must not continue routine optimization as if no safety boundary exists, must not substitute escalation with generic product suggestions, and must not downgrade escalation posture through presentation that minimizes the underlying evidence pattern.

Confidence Layer qualifies every escalation recommendation—evaluating evidence completeness, recency, consistency, and residual uncertainty before the escalation is committed or presented. Personal Threshold Learning must not suppress safety boundaries: personal tolerance calibration adjusts cosmetic guidance weighting; it does not override escalation when evidence indicates cosmetic scope may be exceeded. A user who historically tolerates strong actives may still receive escalation when new evidence patterns warrant caution.

**Timeline and evidence accountability**

Escalation events should be recorded as part of the Personal Evidence Base conceptually—linked to the evidence pattern, confidence posture, and uncertainty drivers that motivated the boundary decision. Later outcomes may show that escalation was unnecessary or that it was appropriate; either way, the historical escalation decision remains traceable. Outcome Intelligence may evaluate subsequent change without retroactively erasing why escalation was recommended at the time. Deletion and Retention Governance applies to escalation evidence and linked artifacts like other sensitive personal evidence: governance may limit inspectability without silently removing the fact that escalation occurred.

Safety Boundary Escalation preserves platform integrity within cosmetic scope: when personal evidence says cosmetic guidance is not enough, Recommendation Engine says so clearly, calmly, and accountably—without diagnosing, without disease labels, and without pretending the platform is something it is not.

### Prediction Engine

**Purpose:** Project plausible near-term trajectories from observed patterns—likely presentation shifts, exposure risks, or stability scenarios—always qualified by available evidence and baseline context.

**Reads:** Correlation outputs, symptom trajectories, routine and exposure history, Skin Profile baseline, outcome evaluations, and Learning Layer personal thresholds.

**Produces:** Prediction artifacts describing projected scenarios, contributing evidence, assumption boundaries, and confidence ranges—not single deterministic forecasts.

**Must not:** Guarantee outcomes or present projections as certainties. Prediction Engine extends patterns forward with explicit uncertainty; actual results require Outcome Intelligence evaluation against subsequent evidence.

### Learning Layer / Personal Threshold Learning

**Purpose:** Calibrate the platform to the individual over time—refining personal thresholds, tolerance patterns, sensitivity signals, and recommendation weighting based on evaluated outcomes and accumulated feedback.

**Reads:** Outcome evaluations, user corrections, feedback submissions, correlation history, recommendation effectiveness records, and prior learning state linked to evidence.

**Produces:** Personal calibration artifacts—adjusted thresholds, refined weighting signals, and superseding learning interpretations that reference prior state without rewriting historical evidence.

**Must not:** Create universal rules that override personal evidence or retroactively alter immutable records. Learning extends forward from history; it does not replace the user's documented experience with population defaults.

### Confidence Layer

**Architectural classification:** cross-cutting governance capability.

Confidence Layer is not a sequential engine and not an independent pipeline layer. It holds no standalone position between Evidence, Knowledge, Intelligence, Learning, and Experience. It is a governance capability that attaches confidence posture and confidence metadata to outputs produced by other engines—qualifying those outputs without assuming the responsibility of the engine that produced them. An engine that generates a correlation, prediction, recommendation, or outcome remains accountable for that artifact; Confidence Layer governs how strongly that artifact may be acted upon, propagated, or presented.

**Purpose:** Govern certainty expression across the platform by evaluating the evidential basis of every intelligence artifact before it is committed, propagated, or presented. Confidence Layer assesses evidence quality, evidence completeness, evidence recency, signal consistency, source reliability, residual uncertainty, and confidence limitations. Its assessments apply uniformly across Input Intelligence outputs, Knowledge Layer enrichments, correlation candidates, predictions, recommendations, outcome evaluations, learning signals, and user-facing explanations—not as a stage that follows or precedes those outputs, but as a cross-cutting qualification applied wherever intelligence artifacts are produced or consumed.

**Reads:** Evidence references attached to any engine output, scan frequency and temporal coverage, user-platform signal divergence, confounding change indicators, source reliability context, and domain-specific confidence rules per object type.

**Produces:** Confidence posture metadata bound to intelligence artifacts—explicit certainty levels, uncertainty flags, qualification requirements, and auditable uncertainty drivers that downstream engines and the Experience Layer must honor. Every confidence posture must be traceable back to the evidence records and uncertainty factors that produced it; confidence without an auditable evidence chain is architecturally invalid.

**Action strength:** Confidence posture directly influences how strongly the platform may act on an inference. High confidence may support stronger guidance where evidence is dense, aligned, and recent. Low confidence must lead to monitoring suggestions, evidence collection, cautious next steps, or explicit uncertainty—not to conclusions presented with false precision. Confidence must never hide weak evidence.

**Must not:** Degrade into a decorative presentation badge disconnected from evidence. Confidence Layer must not create medical certainty, diagnose conditions, label disease, or imply treatment certainty. It must not substitute for the reasoning engine that produced an output, nor bypass the governed sequence: Evidence → Knowledge → Intelligence → Learning → Experience. No confidence assessment may elevate thin, stale, or conflicting evidence into authoritative guidance.

### Cross-engine obligations

Every Intelligence Engine must preserve platform-wide architectural commitments regardless of scope:

- **Traceability** — Every output references the evidence records that produced it; no orphan conclusions enter the Personal Evidence Base.
- **Explainability** — Every meaningful artifact can be articulated in human-readable terms linked to evidence and reasoning chain.
- **Confidence awareness** — Uncertainty is expressed honestly; thin evidence produces qualified outputs, not false precision.
- **Provider independence** — AI-assisted enrichment normalizes into model objects with evidence links; no engine binds platform meaning to a specific vendor format.
- **Historical accountability** — Prior records, recommendations, and evaluations remain inspectable; new intelligence supersedes with reference, not silent erasure.
- **User correction paths** — Feedback, confirmation, and correction flow back into evidence and learning without suppressing user voice.
- **Personal Evidence Base continuity** — Each engine leaves the user's accumulated history more complete, more connected, or more accurately structured than before.

Engines that cannot satisfy these obligations do not belong in the platform architecture, regardless of product appeal or implementation convenience.

---

## Data Model

The Data Model is the conceptual map of what SkinIntel knows. It defines the platform's shared vocabulary: the entities, relationships, and semantic boundaries through which evidence becomes knowledge, knowledge becomes intelligence, and intelligence returns to the user as explainable guidance. Every architectural layer and every Intelligence Engine depends on this map. Without it, the platform would accumulate data without accumulating meaning.

This section describes how the Data Model fits into platform architecture. It does not reproduce the full object specifications. For detailed definitions, field semantics, relationship rules, and boundary constraints, **docs/11_DATA_MODEL.md** is the source of truth.

### Conceptual model, not implementation

The Data Model is not a database schema. It is not SQL, table design, API payload structure, or storage technology selection. It is not tied to any AI provider, cloud vendor, or application framework. It is the durable intellectual structure of the product—the meaning layer that persists when databases migrate, services are replaced, and AI capabilities evolve.

Implementation serves the model; the model does not serve implementation. When storage is redesigned or a provider is swapped, scan records, product identities, outcome evaluations, and recommendation objects must remain semantically recognizable. Confusing conceptual objects with physical persistence is an architectural error that fragments memory and erodes traceability over years of use.

### Stable knowledge objects and boundaries

The Data Model defines stable knowledge objects, each with explicit scope and ownership. These objects form the platform's domain vocabulary:

- **User Profile** — Enduring identity, preferences, declared sensitivities, goals, and governance settings that orient the platform to the individual without holding transient skin state.
- **Skin Profile** — Baseline skin characteristics and persistent attributes that frame interpretation across time without replacing session-level evidence.
- **Scan Record** — Immutable capture events: structured observations, context, and user attestation at a point in time.
- **Body Area Model** — Universal spatial classification linking symptoms, products, outcomes, and guidance to where on the body they apply.
- **Symptom Model** — Canonical presentation vocabulary for what is observed or reported, independent of location, severity moment, or recommended action.
- **Product Model** — Skincare items in context: identity, composition references, routine role, usage periods, and verification status.
- **Ingredient Model** — Component-level knowledge linked to products and personal exposure history.
- **Routine Model** — Structure, sequencing, and evolution of care steps through which products are applied over time.
- **Outcome Model** — Evaluated change connecting interventions to results, scoped to symptoms, body areas, and time windows.
- **Recommendation Model** — Explainable guidance with evidence chains, confidence posture, and lifecycle accountability.
- **Formulation Model** — Composition structure inside products: roles, functional categories, version context, and analysis inputs—distinct from catalog recommendation.
- **Longitudinal Timeline** — The continuous chronological thread connecting all objects above into the Personal Evidence Base.
- **AI Knowledge Objects** — Normalized AI-assisted inferences with evidence links, preserving provider independence and historical accountability.
- **Future Expansion** — Governed extension points for new object types and relationships approved through architecture review, not ad hoc feature additions.

Each object owns specific meaning. Symptoms do not absorb outcomes. Products do not embed recommendations. Scans do not silently contain intelligence conclusions. Separation of concerns at the object level is what makes the platform explainable at scale.

### Contract across platform layers

These objects form the shared contract between the five platform layers:

The **Evidence Layer** writes capture objects—scan records, symptom references, feedback, usage events—into the model without interpreting them beyond structure. The **Knowledge Layer** enriches evidence through product, ingredient, and formulation objects without yet drawing user-specific conclusions. The **Intelligence Layer** reads enriched knowledge and produces correlation candidates, predictions, recommendations, and outcome evaluations as typed model artifacts. The **Learning Layer** writes calibration and threshold adjustments that reference prior state without rewriting immutable evidence. The **Experience Layer** reads derived intelligence and presents it through language and format preferences—without redefining the objects beneath.

Every Intelligence Engine must read and write against these conceptual objects instead of inventing private data shapes. Input Intelligence writes scan records the Correlation Engine can traverse. Product Intelligence enriches product objects the Recommendation Engine references. Outcome Intelligence produces outcome evaluations the Learning Layer calibrates against. No engine maintains a shadow model for the same concept. One model, many engines.

### Architectural guarantees

The Data Model must preserve properties that protect long-term platform integrity:

- **Language-independent identifiers** — Objects are defined by meaning, not display text; locales map to identifiers without altering semantics.
- **Historical traceability** — Every object and relationship supports a chain from intelligence output back to evidence records.
- **Explainability** — Typed relationships make it possible to articulate why objects are linked and what intelligence consumed them.
- **Confidence awareness** — Uncertainty and evidence density attach to objects and outputs, not merely to presentation.
- **Provider independence** — AI contributions normalize into model objects; vendor replacement does not redefine platform meaning.
- **Separation of concerns** — Each object type owns its domain; conflation is an architectural violation.
- **Personal Evidence Base continuity** — Accumulated history grows more connected and inspectable over time, never silently replaced.

These guarantees ensure that a user who engages with SkinIntel for years retains a coherent, auditable personal record—not a sequence of disconnected feature states.

### What the model protects against

The Data Model exists to prevent failure modes that destroy longitudinal value:

- **Duplicated logic** — Parallel definitions of the same concept across engines or features.
- **Fragmented memory** — Isolated data stores that cannot be assembled into a Personal Evidence Base.
- **Hardcoded language concepts** — Storing presentation strings as domain truth, breaking multilingual and cross-session consistency.
- **Provider lock-in** — Binding knowledge object meaning to a specific AI vendor's output format.
- **Untraceable AI outputs** — Inference that enters the platform without evidence links or accountability objects.
- **Overwritten user history** — Mutating immutable evidence instead of superseding with new records.
- **Conceptual blob collapse** — Mixing recommendations, outcomes, products, and symptoms into undifferentiated aggregates that cannot be explained, correlated, or evaluated.

### Authoritative reference

Platform architecture establishes that the Data Model is the language of SkinIntel. Implementation teams, product designers, and Intelligence Engine specifications must conform to it. When objects require extension, change proceeds through governed review and documented decision—not through implementation shortcuts.

**docs/11_DATA_MODEL.md** holds the authoritative detailed definitions for every object listed above: scope, boundaries, relationships, immutability rules, and inter-engine read/write expectations. This master document defines how the model fits the platform; that document defines what each object is.

---

## Intelligence Flow

Intelligence Flow describes how information moves through the SkinIntel platform—from the moment a user provides input to the moment they receive guidance, and onward through feedback, outcomes, and learning. It is the operational expression of the five platform layers and the Intelligence Engines working together over time. This section explains that movement at the architectural level. It does not reproduce engine specifications, object definitions, or decision records; those remain authoritative in their respective documents.

The flow is not a one-time pipeline that runs once and terminates. It is a continuous loop. Every scan, recommendation, user correction, routine change, product change, and observed outcome can create new evidence, enrich knowledge, trigger re-evaluation, and improve future intelligence. A user who returns after six months does not restart the system; they extend a Personal Evidence Base that has been accumulating context, accountability, and calibration since their first interaction.

---

### End-to-end flow

The platform processes information through ten interconnected stages. In practice, stages overlap and repeat; Memory Engine and Confidence Layer operate throughout. The sequence below describes the primary architectural path.

**1. User provides input**

The flow begins with what the user contributes: scan sessions, symptom selections, severity judgments, product logs, routine updates, preferences, goals, explicit feedback, confirmations, and corrections. Input may arrive through any Experience Layer surface, but architecturally it is always user-originated experience—not pre-formed intelligence. The platform treats input as the authoritative starting point for what the user observed, applied, or decided.

**2. Input Intelligence structures it**

Input Intelligence receives raw interaction signals and normalizes them into structured evidence objects aligned with the Data Model. It assigns platform vocabulary—body area identifiers, symptom references, product and routine links, session context—without diagnosing, recommending, or converting experience into medical conclusions. Structuring is the boundary between lived experience and platform reasoning: what enters the Evidence Layer must be consistent, comparable, and durable.

**3. Evidence Layer stores it as traceable evidence**

Structured input is written to the Personal Evidence Base as traceable evidence. Scan records, usage events, feedback submissions, and related capture objects are preserved with provenance: when they occurred, in what context, and with what level of user attestation. The Evidence Layer records; it does not interpret beyond normalization. Immutable capture objects form the foundation to which all later intelligence must remain accountable.

**4. Knowledge Layer enriches it with domain context**

The Knowledge Layer transforms evidence into reasoning-ready knowledge. Product Intelligence, Ingredient Intelligence, Formulation Intelligence, and Routine Intelligence enrich records with structured context: product identity and composition, ingredient exposure, formulation roles and gaps, routine structure and change events, symptom and body-area relationships. Enrichment adds meaning without yet drawing user-specific conclusions about what the user should do. Knowledge remains linked to the evidence that produced it.

**5. Memory Engine retrieves relevant historical context**

Before and during reasoning, Memory Engine assembles longitudinal context from the Personal Evidence Base. It retrieves ordered history by body area, symptom trajectory, product usage periods, routine evolution, prior recommendations, and prior intelligence outputs with their evidence chains. Memory does not rewrite history; it retrieves and connects. Intelligence without memory is session-bound and architecturally incomplete.

**6. Intelligence Engines evaluate patterns, correlations, outcomes, and possible next actions**

Multiple Intelligence Engines reason over enriched knowledge and retrieved history. Correlation Engine identifies evidence-based associations among products, ingredients, routines, symptoms, and outcomes. Outcome Intelligence evaluates what changed after interventions or elapsed time. Prediction Engine projects plausible trajectories qualified by available evidence. Confidence Layer is not a stage within this sequence; as a cross-cutting governance capability, it qualifies outputs at every stage of the flow—evaluating evidence quality, completeness, recency, signal consistency, source reliability, and epistemic limits—without replacing the engines that produced those outputs. No engine consumes raw evidence in isolation from knowledge structuring; no engine commits outputs without confidence posture.

**7. Recommendation Engine produces guidance**

Recommendation Engine converts accumulated knowledge, correlations, outcomes, and personal context into actionable cosmetic guidance. Recommendations are typed model artifacts with evidence chains, rationale, scope, confidence posture, and linkage to prior recommendations for later outcome evaluation. Guidance is never free-floating advice; it is the product of reasoning that can be explained, evaluated, and superseded with reference—not silent replacement.

**8. Experience Layer presents guidance in the user's language and context**

The Experience Layer translates intelligence into forms the user can access and act on: dashboard summaries, history views, reports, explanations, and formulation proposals. Presentation respects User Profile language and format preferences. The Experience Layer communicates intelligence; it does not originate it. Every surface must be capable of linking presentation back through knowledge and intelligence to evidence.

**9. User feedback and later outcomes return into the Personal Evidence Base**

When the user confirms, corrects, rejects, or refines platform inference—or when subsequent scans and observations reveal what happened after acting on guidance—those signals re-enter the flow as new evidence. User feedback is authoritative personal experience evidence. Outcome observations are time-bounded evaluations linked to prior recommendations, routines, and products. Both paths write forward into the Personal Evidence Base; they do not overwrite immutable prior records.

**10. Learning Layer improves future interpretation and recommendations**

The Learning Layer consumes outcome evaluations produced by Outcome Intelligence in the Intelligence Layer, incorporates feedback, and calibrates personal thresholds, tolerance patterns, and recommendation weighting. Learning produces superseding calibration artifacts that reference prior state without rewriting historical evidence. Future Correlation Engine, Outcome Intelligence, Prediction Engine, and Recommendation Engine runs consume this calibration—making the platform more attuned to the individual over time while remaining anchored to documented experience.

---

### The loop, not the line

Architecturally, stage ten connects back to stage one. A corrected preference becomes new input. An evaluated outcome becomes new evidence. A superseded recommendation remains inspectable while a new one references it. Routine and product changes create change events that reframe prior correlations. Low-confidence outputs invite more evidence rather than forcing false precision.

This loop is what distinguishes SkinIntel from a stateless AI analyzer. The platform's value compounds because information circulates: captured, enriched, reasoned over, presented, acted upon, observed, corrected, and learned from—repeated across the user's skin journey.

---

### Properties the flow must preserve

Every traversal of the Intelligence Flow must uphold platform-wide commitments:

- **Traceability** — Intelligence outputs reference the evidence records that produced them; no orphan conclusions enter the Personal Evidence Base.
- **Confidence awareness** — Uncertainty is expressed honestly; thin evidence produces qualified outputs, not false precision.
- **Evidence references** — Correlations, outcomes, predictions, and recommendations carry explicit links to supporting evidence objects.
- **User correction paths** — Feedback, confirmation, and correction flow back into evidence and learning without suppressing user voice.
- **Historical accountability** — Prior records, recommendations, and evaluations remain inspectable; new intelligence supersedes with reference, not silent erasure.
- **Provider independence** — AI-assisted enrichment normalizes into model objects with evidence links; platform meaning does not bind to a specific vendor format.
- **Separation of concerns** — Each stage owns its responsibility; conflation—diagnosis at input, recommendation at enrichment, erasure at learning—is an architectural violation.
- **Language-independent internal identifiers** — Objects are defined by meaning, not display text; locales map to identifiers without altering semantics.

These properties are not optional quality attributes. They are structural requirements without which the flow cannot support longitudinal personal intelligence.

---

### Architectural boundaries

The Intelligence Flow enforces non-negotiable boundaries that protect trust and long-term platform integrity:

**AI inference cannot bypass evidence.** Artificial intelligence may assist capture, enrichment, and interpretation, but AI contributions normalize into AI Knowledge Objects with evidence links. Inference that enters the platform without traceable inputs violates the architecture regardless of apparent accuracy.

**Recommendation cannot happen without context and confidence.** Actionable guidance requires enriched knowledge, retrieved history, evaluated correlations or outcomes where applicable, and explicit confidence posture. Shortcuts that generate recommendations from isolated signals or thin context are forbidden.

**Outcomes must feed back into learning.** Outcome evaluations connect recommendations to observed results. Learning that ignores outcomes—or adjusts models without reference to what the user actually experienced—breaks the closed loop the platform depends on.

**User feedback must be preserved.** Corrections and confirmations are evidence, not disposable UI state. Divergence between user report and platform inference is preserved with uncertainty, not resolved by discarding user voice.

**Current state must not erase history.** The platform expresses current understanding through supersession and reference, not mutation of immutable capture records. What was captured, recommended, or evaluated at a point in time must remain inspectable.

**Presentation language must not change internal identifiers.** The Experience Layer renders intelligence in the user's locale; it does not redefine domain objects. Symptom identifiers, body area codes, and product references remain stable across languages and sessions.

---

### Flow across layers and engines

The Intelligence Flow maps directly onto the five platform layers and the Intelligence Engines defined elsewhere in this document. Input Intelligence and Memory Engine span the boundary between capture and retrieval. Product, Ingredient, Formulation, and Routine Intelligence operate within the Knowledge Layer. Correlation Engine, Outcome Intelligence, Prediction Engine, and Recommendation Engine operate within the Intelligence Layer. Personal Threshold Learning operates within the Learning Layer, which consumes Outcome Intelligence outputs rather than executing outcome evaluation itself. Confidence Layer applies across all stages. The Experience Layer terminates the forward path and re-initiates the loop through user action and feedback.

Implementation teams, product designers, and engine specifications must preserve this flow. Features that capture no durable signal, bypass enrichment or reasoning, present untraceable conclusions, or overwrite history for convenience violate the architecture—regardless of short-term product appeal. The Intelligence Flow is the contract through which SkinIntel earns longitudinal trust: every interaction strengthens a personal record that grows more connected, more explainable, and more useful over time.

---

## Personal Evidence Base

The Personal Evidence Base is the core long-term asset of SkinIntel. It is what the platform accumulates, protects, and reasons over across months and years of use. Every architectural layer, every Intelligence Engine, and every future capability depends on the quality and continuity of this record. Without it, SkinIntel is a session-bound analyzer. With it, SkinIntel becomes a Personal Skin Intelligence Platform whose value compounds with continued engagement.

This section defines what the Personal Evidence Base is architecturally, why it matters, what it must preserve, and what it must never become. It does not reproduce object specifications or engine contracts; those remain authoritative in **docs/11_DATA_MODEL.md**, **docs/ARCHITECTURE_DECISIONS.md**, and the Intelligence Engine documentation.

---

### What the Personal Evidence Base is

The Personal Evidence Base is not just saved scans. A scan is a moment—a valuable capture event—but intelligence requires connection across moments. The Personal Evidence Base is the accumulated, traceable, chronological, evidence-linked record of the user's skin journey: what was observed, what was applied, what was recommended, what was confirmed or corrected, what changed afterward, and what the platform inferred—with explicit confidence and accountability at every stage.

It is assembled from typed knowledge objects written through the Evidence Layer, enriched by the Knowledge Layer, extended by Intelligence and Learning Layers, and positioned on a shared temporal axis. Memory Engine retrieves it; Correlation Engine, Outcome Intelligence, Prediction Engine, and Recommendation Engine consume it; the Experience Layer presents derived intelligence that remains linkable back to it. The Personal Evidence Base is the user's durable personal skin intelligence history—not a transient application state.

---

### What the Personal Evidence Base includes

The Personal Evidence Base comprises interconnected evidence and intelligence artifacts, each with defined scope and traceability:

- **Scan records** — Immutable capture events: structured observations, session context, and user attestation at a point in time.
- **Symptoms** — Canonical presentation references scoped to observations, independent of location, severity moment, or recommended action.
- **Body areas** — Spatial classification linking symptoms, products, outcomes, and guidance to where on the body they apply.
- **Products used** — Skincare items in context: identity, composition references, routine role, usage periods, and verification status.
- **Ingredients exposed to** — Component-level exposure derived from product composition and usage, aggregated across routines and time windows.
- **Formulation context** — Composition structure inside products: roles, functional categories, overlap, gaps, and verification confidence at time of exposure.
- **Routine structure** — Sequencing, frequency, and product combinations through which care is applied.
- **Routine changes** — Distinct temporal events when regimen structure shifts—additions, removals, reorderings, frequency changes—preserved as history, not silent overwrites.
- **Recommendations received** — Explainable guidance with evidence chains, scope, confidence posture, and lifecycle accountability.
- **User confirmations and corrections** — Authoritative first-person responses that confirm, refine, or reject platform inference and prior guidance.
- **Outcomes** — Evaluated change connecting interventions to results, scoped to symptoms, body areas, and time windows—including uncertain change as a valid result.
- **Confidence and uncertainty history** — Explicit certainty levels, uncertainty markers, and confidence transitions preserved over time, not collapsed into current presentation.
- **AI Knowledge Objects** — Normalized AI-assisted inferences with evidence links, preserving provider independence and historical accountability.
- **Learning signals** — Calibration inputs and personal threshold adjustments that reference prior state without rewriting immutable evidence.
- **Longitudinal timeline events** — The chronological spine connecting all artifacts above: exposure windows, comparison brackets, recommendation and feedback events, and temporal relationships that make sequence and change legible.

These elements interleave on a single chronological axis. The Personal Evidence Base is coherent because objects remain typed, linked, and temporally positioned—not because they are stored in one container.

---

### Why the Personal Evidence Base matters

The product promise of SkinIntel depends on accumulation, not isolated answers.

**One scan gives an answer.** A single session can orient a user, surface observations, and offer initial guidance. That utility is real but bounded. It does not explain what changed over months, whether prior guidance worked, or what patterns repeat for this individual.

**Accumulated evidence gives intelligence.** As scans, products, routines, outcomes, and feedback accumulate, the platform can correlate exposure with presentation, evaluate recommendations against results, and reason from personal history rather than population defaults alone. Intelligence density grows with evidence density.

**Outcomes make recommendations measurable.** Recommendations without subsequent evaluation are open-ended advice. Outcome evaluations connect guidance to observed results, enabling the platform to assess what worked, what failed, and what remains uncertain—feeding correlation, prediction, and learning.

**History makes future guidance more personal.** Early interactions rely on general knowledge and light context. Over time, declared sensitivities, prior reactions, routine evolution, and evaluated outcomes sharpen relevance. The Personal Evidence Base is what makes personalization earned rather than assumed.

**Evidence creates switching cost ethically through user value, not lock-in.** Years of connected scans, routines, products, and evaluated guidance constitute an asset the user built through continued engagement. Retention follows value—the ability to answer *what does my skin journey show?*—not opaque data traps or irreversible export barriers. The platform earns loyalty by making history useful, not by making history inaccessible.

**Traceability builds trust.** Users who can follow conclusions back to evidence, see uncertainty acknowledged honestly, and correct what the platform got wrong develop confidence in the system. A record that cannot be explained cannot be trusted; a record that can be inspected and corrected can.

---

### Properties the Personal Evidence Base must preserve

The Personal Evidence Base is governed by architectural commitments that protect long-term integrity:

- **Historical truth** — What was captured, recommended, or evaluated at a point in time remains inspectable. Current understanding supersedes with reference; it does not erase prior records.
- **User ownership and correction paths** — The user is the source of lived experience. Confirmations, corrections, and rejections are first-class evidence, not disposable UI state.
- **Evidence references** — Intelligence artifacts link to the evidence records that produced them. Orphan conclusions do not belong in the Personal Evidence Base.
- **Time sequence** — Order matters: product introduction before symptom shift, routine change before outcome window, recommendation before evaluation. Chronological structure is non-negotiable.
- **Confidence context** — Uncertainty at capture time is preserved. Retrospective analysis must not inflate confidence that did not exist when evidence was sparse or conflicting.
- **Language-independent identifiers** — Objects are defined by meaning, not display text. Locales map to identifiers without altering semantics across sessions and languages.
- **Provider independence** — AI contributions normalize into model objects with evidence links. Vendor replacement does not redefine platform meaning or invalidate accumulated history.
- **Privacy and consent boundaries** — What is remembered, what is used for reasoning, and what the user can change or remove are governed explicitly. The Personal Evidence Base earns the right to personal data by protecting it and returning clear value.

These properties are structural requirements. Compromising them accelerates short-term demos and degrades the platform's ability to accumulate trustworthy personal history.

---

### Deletion and Retention Governance

Deletion and retention are architectural governance requirements—not legal policy text, not UI afterthoughts, and not operational patches applied after launch. The Personal Evidence Base is designed for longitudinal integrity, but longitudinal integrity does not mean indefinite retention of all sensitive content in fully usable form. Governance must define what is retained, what is removed, what is anonymized or minimized, and how long evidence remains usable for reasoning—before any implementation proceeds.

Immutable history and append-only truth are structural commitments. They ensure that what was captured, recommended, or evaluated at a point in time remains inspectable when permitted. They do not override user deletion rights. The user retains the right to request erasure, restrict processing, and withdraw consent. Architectural immutability serves traceability and audit integrity within governed boundaries; it does not grant the platform indefinite authority to retain, reuse, or reason over all evidence without limit or without consent alignment.

Deletion must be explicit, governed, and auditable. No silent deletion behavior is permitted: every removal, tombstone, minimization, or invalidation must be attributable to defined governance rules and consent posture at the time of action. No silent orphan references are permitted. When evidence content is removed or becomes unavailable, references to it must not pretend the evidence still fully exists. Dependent artifacts must be reconciled according to governed rules—not left to degrade inconsistently across engines and layers.

The platform must distinguish five categories of record. Each category may be governed differently, but all behavior must be explicitly defined—not inferred at implementation time or resolved through silent defaults:

**Evidence content** — The substantive payload: scan observations, symptom descriptions, skin images, user attestation, and comparable capture data. This category carries the highest sensitivity and the strictest governance. Deletion or minimization of evidence content must be deliberate, consent-aligned, and auditable. Sensitive evidence such as skin images and symptom descriptions requires stricter handling than general metadata: heightened access boundaries, accelerated erasure paths, and minimization policies must be architecturally anticipated for this category.

**Evidence references** — Pointers, identifiers, and structural links that connect the chronological spine and tie intelligence artifacts to their sources. References may be retained in reduced form when governance allows—for example, through retention markers or tombstones that preserve structural integrity without preserving sensitive content—but only through explicit rules. References must not become covert stores of usable personal data.

**Derived intelligence** — Recommendations, correlations, predictions, normalized AI Knowledge Objects, and comparable outputs produced from evidence. When underlying evidence is deleted or becomes unavailable, derived intelligence must not continue as if the source evidence remains fully present. Downstream outputs may need to be marked **limited**, **stale**, or **invalidated**; downgraded in confidence; excluded from active reasoning paths; or withheld from future learning—according to governed rules for each artifact type.

**Learning signals** — Calibration inputs, personal threshold adjustments, and comparable learning artifacts that reference prior evidence and outcomes. Learning must not silently absorb deleted or withdrawn evidence as if it were still authoritative. Withdrawal of consent may restrict future reasoning, learning, export, or reuse even when historical markers remain for structural integrity.

**User-facing history** — What the Experience Layer presents as the user's skin journey narrative. Presentation must respect privacy boundaries and deletion outcomes. User-facing history must not surface deleted sensitive content, must not imply conclusions unsupported by available evidence, and must acknowledge when portions of history are limited, unavailable, or governed by retention policy.

User erasure requests must be reconciled with longitudinal integrity. The platform cannot choose between user rights and architectural coherence; it must resolve both through governance. That resolution may preserve non-sensitive structural markers, anonymized continuity, or tombstoned references where policy permits—but it must never preserve silent access to sensitive content or allow downstream intelligence to behave as if deletion did not occur.

Withdrawal of consent is a first-class architectural event. It may restrict future storage, reasoning, learning, export, or reuse without requiring destruction of every structural artifact, depending on governed retention policy—but restriction must be enforced at every layer that would otherwise consume withdrawn evidence. Consent posture governs behavior across the platform, not merely visibility in the user interface.

Retention rules must answer four questions for every evidence type and artifact category: what is retained, what is removed, what is anonymized or minimized, and how long evidence remains usable for personalization, correlation, prediction, and learning. Deleted evidence must not remain silently usable for personalization, learning, marketing, or commercial profiling. No marketing profile or commercial segment may be derived from evidence the user has deleted, withdrawn, or restricted—directly or through residual learning signals treated as if consent still applied.

Downstream artifacts that depended on deleted or unavailable evidence must be governed consistently across Intelligence Engines and the Learning Layer. Correlation results, recommendations, outcome evaluations, and calibrations that lose evidentiary foundation must not propagate into future intelligence unchecked. They must be invalidated, downgraded, excluded from active learning, or presented with explicit limitation—never left operating at full confidence on evidence that no longer exists or is no longer permitted.

Retention markers and tombstones may preserve structural integrity without preserving sensitive content, where governance explicitly allows. Their purpose is chronological coherence and audit traceability within privacy boundaries—not indefinite full data retention dressed as metadata.

The Personal Evidence Base must remain traceable without violating privacy boundaries. Within permitted scope, a reviewer or user must be able to understand how conclusions were formed and what evidence contributed—but traceability must not require indefinite retention of all sensitive payloads, must not circumvent deletion rights through duplicate storage or ungoverned derived replicas, and must not expose content the user has legitimately removed or restricted.

Deletion and retention behavior must be designed before implementation, not patched later. Every Intelligence Engine, Learning Layer contract, and Experience Layer presentation path must declare how it behaves when evidence is deleted, minimized, tombstoned, or subject to withdrawn consent. Gaps discovered during implementation require architectural documentation and acceptance before work continues. Until governance is defined, deletion-sensitive behavior must not be assumed, improvised, or deferred as a compliance exercise.

---

### Consent Scope Governance

Consent Scope Governance is the architecture-level rule for how user consent governs evidence storage, reasoning, learning, export, reuse, and withdrawal within the Personal Evidence Base. Consent is not a checkbox-only UI concern. It is an architectural state that governs what the platform may store, process, reason over, learn from, export, or reuse—and that state must be traceable and auditable across the user's journey.

Consent applies to Personal Evidence Base behavior holistically, not only to scan submission. A user may consent to capture at one moment while restricting learning, export, or reuse at another. Consent posture must be knowable to every layer that would consume evidence: Intelligence Engines, Learning Layer, Experience Layer, and export behavior. Consent must not be silently bypassed through derived objects, AI Knowledge Objects, learning signals, cached summaries, or presentation layers that treat withdrawn permission as still active.

Sensitive evidence—skin images, symptom descriptions, discomfort reports, product reaction history—requires explicit consent boundaries appropriate to its sensitivity. No marketing profile, webshop profile, commercial segment, or unrelated personalization may be derived from the Personal Evidence Base without separate explicit consent. Analysis consent does not imply marketing permission; storage consent does not imply reuse for aggregate improvement; reasoning consent does not imply exportable packaging.

**Conceptual consent scopes**

Consent is scoped, not monolithic. The platform recognizes distinct conceptual scopes that may be granted, restricted, or withdrawn independently:

**1. Storage consent** — Permission to store user evidence as part of the Personal Evidence Base: images, descriptions, selected symptoms, product usage, routine data, feedback, outcomes, and comparable capture where applicable. Without storage consent for a given evidence type, the platform must not persist that content as durable personal evidence beyond governed transient processing boundaries.

**2. Reasoning consent** — Permission for the platform to reason over stored evidence to produce analysis, correlations, predictions, recommendations, or explanations. Evidence may exist under storage consent but remain excluded from active reasoning if reasoning consent is restricted—producing limited or insufficient-confidence outputs rather than silent use of restricted evidence.

**3. Learning consent** — Permission for personal learning loops, Personal Threshold Learning, calibration, and future recommendation adaptation. Evidence may support current reasoning while excluded from future adaptation. Learning signals must not incorporate evidence beyond learning consent scope; withdrawn learning consent restricts future calibration without retroactively pretending prior learning never occurred—governed supersession and limitation apply per Deletion and Retention Governance reconciliation rules.

**4. Export consent** — Permission to package or present user data outside normal in-app display: downloadable reports, shareable summaries, or comparable external presentation. Export requires separate explicit consent where in-app viewing alone is permitted. Export behavior must respect scope boundaries and must not include evidence categories the user has restricted.

**5. Reuse consent** — Permission for evidence or derived signals to be reused beyond the immediate analysis context—including aggregate improvement or future platform refinement if ever introduced. Reuse beyond personal service must not be assumed. Default posture is personal-service scope only; broader reuse requires explicit separate consent and governed architectural approval.

Scopes may differ simultaneously: a user may allow storage and current reasoning but restrict learning; allow in-app history but restrict export; permit personal analysis but deny reuse for platform-wide refinement. The platform must honor the most restrictive applicable scope at each consumption point—not infer broader permission from narrower grants.

**Withdrawal as a first-class event**

Consent withdrawal is a first-class architectural event, not a UI reset. Withdrawal may restrict future storage, reasoning, learning, export, personalization, or reuse according to which scopes are withdrawn. Withdrawal does not automatically mean every historical structural marker disappears: Deletion and Retention Governance defines how privacy rights and longitudinal integrity are reconciled—through tombstones, limitation markers, confidence downgrade, and governed unavailability rather than silent full erasure of all chronological structure where policy permits markers without sensitive payload.

When consent changes, downstream artifacts may become limited, unavailable, stale, invalidated, or excluded from future learning. Intelligence outputs must know whether supporting evidence remains permitted for reasoning. Learning signals must know whether evidence remains permitted for learning. AI Knowledge Objects must not retain or reuse evidence beyond consent scope. User-facing history must respect consent restrictions in presentation. Confidence may be downgraded if consent withdrawal removes key supporting evidence—honest epistemic posture rather than false precision on restricted foundations.

**Downstream enforcement**

Consent restrictions must be respected consistently:

- **Intelligence Engines** — Correlation, prediction, recommendation, and outcome reasoning must not consume evidence outside permitted scopes; outputs derived from subsequently restricted evidence must be limited or re-evaluated.
- **Learning Layer** — Personal Threshold Learning and calibration must not absorb withdrawn evidence; future adaptation excludes restricted content without hidden retention in learning state.
- **Experience Layer** — History, reports, and explanations must reflect consent limitations; users must not see restricted content presented as fully available intelligence.
- **AI Knowledge Objects** — Inference artifacts must not preserve or propagate use of evidence beyond consent scope through derived summaries or ungoverned replicas.

Consent withdrawal and Deletion and Retention Governance interact explicitly. Withdrawal restricts future use; deletion or erasure removes or minimizes content per governed rules. Neither mechanism may be used to circumvent the other: withdrawal must not leave hidden usable copies; deletion must not erase consent audit lineage required for accountability within policy bounds.

**Boundary rules**

Consent Scope Governance must not treat consent as a one-time checkbox only, assume consent for all future purposes, use deleted or withdrawn evidence for hidden personalization, infer marketing permission from analysis consent, override Deletion and Retention Governance, permit commercial profiling without separate explicit consent, weaken cosmetic-scope safety boundaries, or hide consent limitations from explanations where they affect output quality.

When consent limitation reduces evidence available for reasoning, the platform must explain reduced confidence or scope honestly—not present outputs as if full evidence still supports them. Safety Boundary Escalation remains governed by evidence patterns and Recommendation Engine boundaries; consent restrictions do not suppress escalation when permitted evidence still warrants caution, and consent posture does not substitute for safety evaluation.

Consent Scope Governance ensures the Personal Evidence Base earns trust: the user controls what the platform may remember, reason over, learn from, export, and reuse—while longitudinal integrity, audit traceability, and governed reconciliation with deletion rights remain architecturally explicit rather than assumed.

---

### What the Personal Evidence Base is not

Architectural discipline requires explicit boundaries. The Personal Evidence Base must not be confused with adjacent but distinct concepts:

**It is not a raw data dump.** Unstructured blobs, orphaned files, and disconnected logs do not constitute a Personal Evidence Base. Evidence must be normalized into typed objects with provenance, relationships, and temporal position.

**It is not a medical record.** SkinIntel organizes personal cosmetic skin evidence and intelligence. It does not assign clinical diagnoses, replace professional evaluation, or present itself as a medical authority. Scope and language must respect this boundary consistently.

**It is not a marketing profile.** The record exists to serve the user's skin intelligence, not to optimize advertising segments, third-party data sales, or engagement manipulation unrelated to evidence quality.

**It is not a webshop personalization profile.** Product Intelligence understands products in the user's context; it does not optimize for commerce, availability, or third-party sales integration. The Personal Evidence Base supports informed personal care decisions, not catalog conversion.

**It must not overwrite history.** Routine edits, product stops, symptom corrections, and superseded recommendations create new events; they do not mutate immutable capture records as if prior state never existed.

**It must not hide uncertainty.** Sparse evidence, conflicting signals, and provisional data carry uncertainty markers. Collapsing uncertainty into false confidence corrupts downstream learning and erodes trust.

**It must not allow AI conclusions without evidence links.** Inference that enters the platform without traceable inputs is ungrounded output. AI Knowledge Objects require evidence references; otherwise they must not enter the Personal Evidence Base as intelligence.

---

### Dependency of all future intelligence

Every Intelligence Engine reads from or writes to the Personal Evidence Base through governed contracts. Input Intelligence extends it with structured capture. Product, Ingredient, Formulation, and Routine Intelligence enrich exposure context. Correlation Engine traverses it for temporal associations. Outcome Intelligence evaluates change within its windows. Recommendation Engine produces guidance accountable to its contents. Learning Layer calibrates from evaluated outcomes and feedback stored within it. Confidence Layer governs certainty expression across every artifact it contains.

Future capabilities—environmental context, advanced imaging, professional collaboration notes, aggregate insights where permitted—extend the Personal Evidence Base through governed object types. They do not replace its foundation. Implementation shortcuts that scatter symptom data across profile fields, collapse outcomes into recommendation text, treat product names as unstable strings, or discard routine history on every edit fragment memory and make longitudinal intelligence impossible.

The quality of the Personal Evidence Base determines the ceiling of platform intelligence. Thin, disconnected, or untraceable records produce qualified outputs at best and misleading guidance at worst. Dense, connected, chronologically coherent records enable correlation, measurable outcomes, personal calibration, and guidance that improves because it learns from this user's documented experience.

SkinIntel's architectural north star is clear: personal evidence is the core asset. AI models may change; providers may be replaced; surfaces may evolve. The Personal Evidence Base must persist, remain traceable, and stay accountable to the user whose skin journey it records. All future intelligence depends on preserving its quality and continuity.

---

## Long-Term Learning Loop

The Long-Term Learning Loop is the closed cycle through which SkinIntel becomes more valuable with continued use. It connects evidence capture, intelligence generation, user action, outcome evaluation, and personal calibration into a repeating architectural pattern—not a one-time pipeline that terminates after the first recommendation. This section defines how the platform learns over time from user evidence, recommendations, feedback, and outcomes. It does not reproduce engine specifications, object definitions, or decision records; those remain authoritative in **docs/11_DATA_MODEL.md**, **docs/ARCHITECTURE_DECISIONS.md**, and the Intelligence Engine documentation.

Without the Long-Term Learning Loop, SkinIntel would accumulate data without improving interpretation. With it, the platform adjusts future reasoning based on what actually occurred for this user—making guidance more personal, recommendations more accountable, and uncertainty more honestly expressed as evidence density grows.

---

### The loop

The Long-Term Learning Loop comprises ten interconnected stages. Stages repeat continuously; each traversal strengthens the Personal Evidence Base and refines personal calibration without overwriting historical truth.

**1. User captures evidence**

The loop begins when the user contributes experience: scans, symptom observations, product logs, routine updates, preferences, and explicit feedback. Capture is user-originated evidence—not pre-formed intelligence. Every loop iteration depends on new or corrected evidence entering the platform faithfully.

**2. Platform structures and stores it**

Input Intelligence normalizes capture into typed evidence objects aligned with the Data Model. The Evidence Layer writes scan records, usage events, feedback submissions, and related artifacts to the Personal Evidence Base with provenance and temporal position. Structuring ensures that what is learned later can be traced to what was captured now.

**3. Knowledge Layer enriches it**

Product Intelligence, Ingredient Intelligence, Formulation Intelligence, and Routine Intelligence transform evidence into reasoning-ready knowledge: exposure context, composition structure, regimen patterns, and change events. Enrichment adds meaning without yet drawing conclusions about what the user should do next.

**4. Intelligence Engines interpret it**

Memory Engine retrieves longitudinal context. Correlation Engine identifies evidence-based associations. Outcome Intelligence evaluates prior change where windows exist. Prediction Engine projects plausible trajectories. Confidence Layer governs certainty expression at every stage. Interpretation consumes enriched knowledge and personal history—not isolated signals or population defaults alone.

**5. Recommendation Engine gives guidance**

Recommendation Engine produces actionable cosmetic guidance with evidence chains, rationale, scope, confidence posture, and linkage to prior recommendations for later evaluation. Guidance is accountable intelligence—not open-ended advice disconnected from the evidence that produced it.

**6. User acts, ignores, confirms, rejects, or corrects**

The user responds to guidance through action or inaction: applying a suggested change, declining it, confirming platform inference, rejecting a recommendation, or correcting what the platform got wrong. Each response is first-class evidence. Confirmation, rejection, and correction events enter the Personal Evidence Base and Longitudinal Timeline—they are not disposable UI state.

**7. Future scans and feedback reveal outcomes**

Subsequent scans, symptom reports, and user feedback reveal what happened after guidance was issued or ignored. Time passes; exposure continues; presentation shifts. Outcome signal emerges from new evidence positioned chronologically after recommendation and action events—not from assumptions about compliance.

**8. Outcome Intelligence evaluates what changed**

Outcome Intelligence evaluates change within defined windows: improvement, stability, worsening, partial change, or uncertain change—scoped to symptoms, body areas, and time, linked to evidence references and expressed with explicit confidence. Recommendation-outcome pairs become measurable: did guidance produce expected change for this user?

**9. Learning Layer updates personal thresholds and future interpretation**

The Learning Layer consumes outcome evaluations produced by Outcome Intelligence in the Intelligence Layer and calibrates personal thresholds, tolerance patterns, recommendation weighting, and interpretation sensitivity from those evaluations and accumulated feedback. Personal Threshold Learning produces superseding calibration artifacts that reference prior state without rewriting immutable evidence. Low-confidence history produces tentative calibration; repeated patterns produce narrower personal thresholds with explicit evidence support.

**10. Future recommendations become more personal and evidence-aware**

Future Correlation Engine, Outcome Intelligence, Prediction Engine, and Recommendation Engine runs consume calibration signals. Guidance respects personal tolerance, meaningful change definitions, prior success and failure patterns, and anti-repeat guards against unsuccessful recommendations. Early interactions rely on general heuristics; mature interactions reflect this user's documented skin journey.

Stage ten connects back to stage one. Each new capture extends evidence; each evaluated outcome refines calibration; each correction governs future interpretation. The loop does not terminate—it compounds.

---

### Learning is not the same as storing data

Accumulating scans, products, and routines in a database is necessary but insufficient. Storage preserves history; learning improves future interpretation based on that history.

Learning means the platform can adjust how it interprets evidence, evaluates outcomes, weights correlations, and generates recommendations—calibrated to what this user actually experienced. A stored scan record does not teach the platform that this user reacts to fragrance exposure; an evaluated outcome sequence linked to ingredient exposure windows and user confirmation does. A stored recommendation does not improve future guidance; a recommendation-outcome pair with confidence-weighted evaluation and learning signal does.

Personal Threshold Learning is the architectural expression of this distinction. It converts evaluated history into calibration inputs that downstream engines consume—not silent mutation of profile fields or opaque model weights disconnected from evidence. Learning extends forward from documented experience; it does not replace the experience with inferred defaults.

---

### What the loop depends on

The Long-Term Learning Loop is not a standalone feature. It depends on governed architectural components working together:

- **Personal Evidence Base** — The accumulated, traceable record that supplies evidence, outcomes, feedback, and intelligence artifacts for calibration.
- **Longitudinal Timeline** — The chronological spine that positions recommendation events, outcome evaluations, exposure windows, and learning signals in sequence.
- **Outcome Model** — Typed outcome evaluations with scope, confidence, and evidence references that make change measurable.
- **Recommendation Model** — Explainable guidance with lifecycle accountability, enabling recommendation-outcome evaluation.
- **AI Knowledge Objects** — Normalized AI-assisted inferences with evidence links, preserving provider independence across learning cycles.
- **Confidence Layer** — Certainty governance that prevents weak evidence from producing strong learning or false precision in calibration.
- **Personal Threshold Learning** — The Learning Layer capability that calibrates personal tolerance, meaningful change definitions, and recommendation weighting from evaluated history.
- **User correction paths** — Governed mechanisms by which confirmations, rejections, and corrections supersede inferred learning with traceability.

If any dependency is bypassed—outcomes without evidence links, learning without confidence context, calibration without user correction—the loop breaks. The platform may store data but cannot learn honestly.

---

### What the loop enables

The Long-Term Learning Loop converts continued engagement into compounding platform value:

- **Better recommendations over time** — Guidance improves as evidence density increases: routine context, ingredient exposure history, prior outcomes, and personal calibration sharpen relevance.
- **Anti-repeat failure guard** — Failed recommendations and negative outcomes for this user inform avoidance of repeated unsuccessful patterns—not generic population avoidance alone.
- **Personal tolerance learning** — Exposure frequency, routine complexity, and ingredient classes calibrate to what this user historically tolerates and responds to.
- **Better routine guidance** — Routine overload detection and sequencing suggestions respect personal history of barrier response and complexity tolerance.
- **Better ingredient and formulation interpretation** — Personal exposure windows linked to outcomes build user-specific sensitivity and tolerance signals within Ingredient and Formulation Intelligence context.
- **Better prediction** — Trajectory projection uses personal thresholds for expected response timing and symptom evolution rather than population curves alone.
- **Stronger retention through accumulated value** — Users experience the platform as increasingly attuned to their skin journey; the asset they built through engagement grows more useful—not trapped behind opaque lock-in.
- **More honest uncertainty handling** — Sparse evidence produces tentative calibration with wide bounds; the platform does not pretend depth where history is thin.

These outcomes emerge from the closed loop—not from a better single-shot model or larger training corpus alone.

---

### Boundaries

The Long-Term Learning Loop operates within strict architectural limits:

**Learning must not overwrite historical evidence.** Calibration updates reference prior state; Scan Records, outcome evaluations, recommendations, and prior learning signals remain retrievable. Supersession follows append-only semantics with traceability.

**Learning must not create universal rules from one user.** Personal thresholds calibrate interpretation for this user only. Calibration must not propagate to other users or replace domain knowledge in Ingredient or Product Models as population truth.

**Learning must not hide uncertainty.** Tentative personal thresholds carry explicit confidence. Low-evidence calibration must not present as established personal truth. Uncertain outcomes remain first-class results that constrain learning appropriately.

**Learning must not ignore user correction.** Governed user rejection of inferred thresholds creates superseding calibration with preserved audit trail. The platform must not argue silently against corrected learning.

**Learning must not become black-box personalization.** Learned thresholds remain explainable: what evidence supported calibration, when it was updated, and what would invalidate it. Opaque weight adjustment without evidence links violates the architecture.

**Learning must not make diagnosis or treatment claims.** Personal tolerance and response patterns describe personal cosmetic evidence history—not clinical conditions, pathology, or therapeutic outcomes. Escalation to professional consultation when scope is exceeded takes precedence over learned heuristics.

---

### From AI scan tool to Personal Skin Intelligence Platform

A one-time AI scan delivers a moment of utility: observations, initial guidance, orientation. That model competes on model quality alone and resets with every session. The Long-Term Learning Loop is the architectural reason SkinIntel can grow beyond that ceiling.

The loop closes the gap between *what does AI think today?* and *what does my skin journey show, what changed after I acted, and what should I do next based on my own evidence?* It makes recommendations measurable, outcomes accountable, and guidance improvable. It transforms accumulated Personal Evidence Base history into personal calibration that future intelligence consumes—always traceable, always confidence-aware, always respectful of user correction.

SkinIntel's long-term value is not the scan. It is the loop: evidence captured, intelligence generated, guidance issued, outcomes evaluated, interpretation refined—and repeated across months and years of use. The Long-Term Learning Loop is what makes continued engagement compound rather than repeat. It is the architectural commitment that elevates SkinIntel from an AI scan tool into a Personal Skin Intelligence Platform whose intelligence deepens because it learns from this user's documented experience—not despite it.

---

## Product Lifecycle

Product Lifecycle defines how products move through the SkinIntel platform—not as commerce transactions, but as intelligence objects whose identity, composition, usage, outcomes, and personal significance evolve over time. This section describes the intelligence lifecycle of how a product becomes known, used, evaluated, and learned from inside SkinIntel. It does not reproduce Product Model specifications, Product Intelligence engine contracts, or decision records; those remain authoritative in **docs/11_DATA_MODEL.md**, **docs/08_PRODUCT_INTELLIGENCE.md**, **docs/ARCHITECTURE_DECISIONS.md**, and the Intelligence Engine documentation.

Every product a user applies is a variable in their skin journey. Product Lifecycle ensures that variable is captured faithfully, enriched honestly, tracked through time, evaluated against outcomes, and incorporated into personal learning—without conflating catalog identity with usage history, verified knowledge with provisional capture, or personal product experience with platform-wide sales logic.

---

### Intelligence lifecycle, not webshop lifecycle

E-commerce platforms track browse, cart, purchase, fulfillment, and return. SkinIntel tracks something different: how a product enters the user's evidence record, what the platform knows about its composition, how long and in what context it was applied, what changed afterward, and what the platform should recommend next based on personal history.

Product Lifecycle is the architectural path from product reference to personal intelligence asset. A product that enters through OCR on a bathroom shelf label and a product selected from a verified catalog follow different ingress paths—but both normalize toward the same Product Model object, both support usage tracking, and both can participate in correlation, outcome evaluation, and learning when evidence permits. The lifecycle ends not at checkout but at accumulated understanding: what this product meant for this user's skin over time.

---

### Lifecycle stages

Products progress through ten interconnected stages. Stages may overlap; a product can be provisional at identity level while actively used in routine. The sequence describes the primary architectural path.

**1. Product reference enters the platform**

The user or system introduces a product reference through an ingress path: catalog selection, search, manual entry, product photo, OCR label extraction, pasted INCI list, or reconnection from prior routine or scan history. Ingress produces a candidate identity—not yet fully enriched, but sufficient to begin evidence capture.

**2. Product is matched, created, or marked provisional**

Product Intelligence resolves the reference against known catalog identity or creates a provisional Product Model object. Match confidence, verification posture, and source provenance attach to the object. Unknown or uncertain references remain honestly provisional; the platform does not block personal history accumulation waiting for perfect catalog coverage.

**3. Ingredient and formulation knowledge are attached where available**

Ingredient Intelligence and Formulation Intelligence link composition to the product: canonical ingredient references, functional roles, overlap and gap context, verification confidence at time of attachment. Partial composition is preserved with explicit confidence boundaries; missing ingredients are not invented.

**4. User connects product to routine or scan context**

The user associates the product with routine structure, application areas, scan sessions, or direct usage logs. Routine Intelligence records placement, sequencing, and frequency. Input Intelligence writes usage evidence scoped to body areas and time. The product becomes an active variable in the Personal Evidence Base—not merely a catalog entry.

**5. Product exposure is tracked through time**

The Longitudinal Timeline records product introduction, active usage periods, routine change events, and exposure windows. Ingredient and formulation exposure aggregate across the usage period. Memory Engine assembles product history for correlation and outcome evaluation. Exposure tracking answers *when* and *for how long*—not just *what*.

**6. Outcomes are evaluated after use, pause, or stop**

Outcome Intelligence evaluates presentation change within windows anchored to product introduction, continued use, pause, or discontinuation. Evaluations link to scan records, symptom references, routine context, and user feedback—scoped to symptoms, body areas, and time with explicit confidence.

**7. Product may become associated with success, failure, neutrality, uncertainty, or personal caution**

Personal evidence—not population reputation—determines association. A verified catalog product may produce negative outcomes for one user; a provisional product may support valuable correlation when usage is clear. Associations are evidence-linked intelligence artifacts, not permanent labels embedded in the Product Model itself.

**8. Recommendation Engine may continue, pause, reduce, replace, avoid, or monitor product use**

Recommendation Engine consumes product context, personal outcome history, ingredient exposure, routine fit, and learning calibration to produce guidance: continue current use, reduce frequency, substitute alternatives, pause pending more evidence, or monitor with follow-up scan suggestion. Guidance carries evidence chains and confidence posture—not sales pressure.

**9. Learning Layer updates personal product and ingredient patterns**

Personal Threshold Learning calibrates tolerance, sensitivity signals, and anti-repeat guards from product-outcome sequences and user confirmations. Learning produces superseding calibration that references prior state without rewriting usage history or immutable capture records.

**10. Product knowledge can be refined later through verification, reformulation tracking, or user correction**

A provisional product may upgrade to verified status when composition and identity are confirmed. Reformulation events create new formulation context linked to the same or superseded product identity without breaking historical exposure links. User corrections to product name, composition, or match override inferred knowledge with governed traceability.

---

### Product ingress sources

The platform must not stop if a product is not already in the database. Personal evidence capture is more important than catalog completeness. Supported ingress paths normalize toward the same Product Model object:

- **Catalog selection** — User chooses a verified product already known to the platform with composition available for immediate enrichment.
- **Search** — User queries platform product knowledge; matched or provisional resolution follows with explicit confidence.
- **Manual entry** — User types product name or details; provisional identity created with available metadata.
- **Product photo** — Image-assisted capture of product front or packaging for identification and match attempts.
- **OCR label extraction** — Vision-assisted transcription of printed label content into structured product and INCI signals with per-field confidence.
- **Pasted INCI list** — User-supplied composition text linked to provisional or verified identity with explicit provenance.
- **Previous routine history** — Reconnection of products already present in the user's longitudinal record.
- **Previous scan history** — Products referenced in prior scan sessions or usage logs re-entered into current context.

Each path explains provenance; the Product Model object provides continuity. A product first entered manually and later matched to catalog identity should remain one traceable thread in the user's history—not a disconnected duplicate.

---

### Lifecycle states

Product Lifecycle states describe posture across identity, usage, verification, and personal evidence—not a single boolean flag. A product may simultaneously be verified at platform level and personally unsuccessful for a given user.

**Identity and knowledge states:**

- **Unknown** — Reference introduced but not yet resolved to a Product Model object.
- **Provisional** — User-added or AI/OCR-assisted; identity or composition incomplete, uncertain, or awaiting verification.
- **Matched** — Reference linked to catalog or prior user history with stated match confidence.
- **Verified** — Identity and composition confirmed through trusted sources or admin verification.
- **Reformulated** — Composition or formulation version changed; new formulation context linked with historical preservation.
- **Superseded** — Prior product identity or formulation version replaced by governed successor reference; history remains inspectable.

**Usage states:**

- **Active in routine** — Product currently applied within documented routine structure.
- **Paused** — Use temporarily suspended; exposure window open with pause event recorded.
- **Stopped** — Use discontinued; exposure window closed with stop event on the Longitudinal Timeline.
- **Historically used** — Past usage preserved in Personal Evidence Base; not current but available for correlation and learning.

**Personal evidence states:**

- **Personally successful** — Evaluated outcomes and user feedback associate positive change or sustained benefit for this user, with confidence appropriate to evidence density.
- **Personally unsuccessful** — Evaluated outcomes or user feedback associate negative response, lack of benefit, or confirmed rejection for this user.
- **Uncertain / insufficient evidence** — Exposure or outcome windows too sparse, conflicting, or provisional to support strong personal association; uncertainty preserved as first-class posture.

States combine across dimensions. Recommendation Engine and Learning Layer consume the full state picture—not identity verification alone.

---

### Boundaries

Product Lifecycle operates within strict architectural limits:

**Product lifecycle is not commerce.** SkinIntel understands products in the user's context; it does not optimize for purchase conversion, inventory, or third-party sales integration.

**Product lifecycle is not affiliate logic.** Product references do not exist to drive referral revenue or promotional placement disguised as intelligence.

**Product lifecycle is not price tracking.** Commercial pricing, availability, and retailer comparison are outside platform architecture.

**Product lifecycle must not turn recommendation into sales pressure.** Recommendation Engine produces cosmetic and educational guidance grounded in personal evidence—not catalog promotion or urgency framing.

**Provisional products must not be treated as verified.** Intelligence layers operate on provisional products with explicit confidence boundaries; verification upgrades knowledge without retroactively inflating historical confidence.

**Product outcomes must be evidence-based.** Personal success, failure, or caution associations require outcome evaluations and feedback linked to evidence—not platform reputation or ingredient popularity alone.

**Product identity must not be overwritten when user history depends on it.** Reformulation, rename, and match correction create governed events and references; they do not mutate immutable usage records or erase exposure windows that downstream correlation and outcome evaluation depend on.

---

### Enablement across Intelligence Engines

Product Lifecycle is the connective tissue that allows multiple engines to reason about product use over time:

- **Product Intelligence** — Resolves ingress, maintains identity and verification posture, enriches product knowledge.
- **Ingredient Intelligence** — Decomposes composition and aggregates exposure across usage periods.
- **Formulation Intelligence** — Interprets composition structure, overlap, gaps, and reformulation context.
- **Routine Intelligence** — Records placement, sequencing, frequency, and regimen change events involving the product.
- **Outcome Intelligence** — Evaluates change after introduction, continued use, pause, or stop.
- **Recommendation Engine** — Produces continue, pause, reduce, replace, avoid, or monitor guidance from personal product history.
- **Learning Layer** — Calibrates personal product and ingredient patterns from evaluated outcomes and feedback.

Without governed lifecycle semantics, products remain inert names in a list—disconnected from ingredients, routines, outcomes, and learning. With them, every product the user applies becomes a traceable intelligence variable that compounds in value across the Personal Evidence Base and Long-Term Learning Loop.

Product Lifecycle is how SkinIntel transforms *what is on the shelf* into *what happened when it touched this user's skin*—honestly, traceably, and improvably over time.

---

## User Journey

The User Journey describes how a person moves through the SkinIntel Personal Skin Intelligence Platform over time—not as a sequence of screens, but as an architectural progression from first contact to mature personal intelligence. This section defines that journey at platform level: what each stage accomplishes, how it connects to the Intelligence Flow and Personal Evidence Base, and what design constraints govern experience without prescribing implementation or interface design.

The user journey is not only *upload image → get AI result*. That pattern describes a stateless analyzer. SkinIntel's journey is longitudinal: evidence accumulates, outcomes are evaluated, guidance improves, and the platform becomes more attuned to the individual because it remembers, explains, and learns—not because a single model run produces a sharper answer.

---

### Journey stages

The platform journey comprises ten interconnected stages. Stages overlap in practice; a returning user may capture products and receive outcome evaluation in the same session. The sequence describes the primary architectural arc from new user to mature personal intelligence experience.

**1. First contact / onboarding**

The user discovers SkinIntel and establishes foundational context: identity, language preference, declared sensitivities, goals, and privacy understanding. Onboarding orients the platform to the individual without demanding exhaustive data entry. It sets expectations that SkinIntel is a personal intelligence companion for cosmetic skin care—not medical diagnosis, not a sales funnel. User Profile and Skin Profile baseline context begin here; the Personal Evidence Base is empty but the architectural frame is in place.

**2. First scan and baseline creation**

The user completes an initial capture session: structured observations, symptom selections, body area scope, and session context. Input Intelligence structures capture into immutable Scan Records. The Evidence Layer writes the first durable evidence objects. Baseline presentation enters the Personal Evidence Base and Longitudinal Timeline. This stage invests more user effort intentionally—nothing is yet known—but the foundation supports all future intelligence.

**3. Initial interpretation and confidence-aware guidance**

Intelligence Engines interpret the first evidence with appropriate humility. Knowledge Layer enrichment applies where product and routine context exist; general domain knowledge supplements thin personal history. Confidence Layer governs output: early guidance is qualified, uncertainty is visible, and explanations link to available evidence. The Experience Layer presents observations and initial cosmetic guidance in accessible language—not as final truth, but as structured orientation grounded in what was captured.

**4. Product and routine context capture**

The user logs products, connects routine structure, and supplies composition where available through catalog, search, manual entry, photo, OCR, or pasted INCI. Product Lifecycle begins; Routine Intelligence records placement and sequencing. Ingredient and Formulation Intelligence attach exposure context. This stage transforms isolated scan moments into connected variables the platform can correlate over time. Effort should decrease as recognition improves and prior entries are remembered.

**5. Follow-up scans and feedback**

The user returns for subsequent scans, symptom updates, confirmations, and corrections. Each session extends the Personal Evidence Base. User feedback—confirming, refining, or rejecting platform inference—is first-class evidence, not disposable UI state. Follow-up capture closes the gap between platform observation and lived experience. Memory Engine assembles growing history for downstream reasoning.

**6. Outcome evaluation**

Outcome Intelligence evaluates what changed after interventions, routine adjustments, product introductions, or elapsed time. Before-and-after windows anchor to real events on the Longitudinal Timeline. Evaluations produce structured outcome objects with confidence—including uncertain change when evidence is insufficient. Recommendations become measurable: did prior guidance align with observed results?

**7. Routine and product adjustments**

The user acts on guidance or chooses independent changes: introducing products, pausing use, simplifying routine, or adjusting frequency. Routine change events and product lifecycle transitions enter the timeline. Recommendation Engine may suggest continue, pause, reduce, replace, avoid, or monitor actions—all within cosmetic scope with evidence chains. Adjustments create new evidence for the next evaluation cycle.

**8. Learning and personalization**

The Learning Layer calibrates personal thresholds, tolerance patterns, and recommendation weighting from evaluated outcomes and accumulated feedback. Personal Threshold Learning produces calibration that future intelligence consumes. Guidance becomes more specific to this user's history: anti-repeat guards against failed patterns, tolerance-aware routine suggestions, ingredient sensitivity signals from personal exposure. Personalization is earned through evidence density—not assumed at onboarding.

**9. Longitudinal progress review**

The user reviews history: scan trajectory, product usage periods, outcome evaluations, recommendation effectiveness, and progress milestones across weeks or months. The Experience Layer presents consolidated views—dashboard, history, reports, explanations—always linkable back through intelligence to evidence. Progress review reinforces that SkinIntel remembers the journey and can articulate what changed, when, and with what confidence.

**10. Mature personal intelligence experience**

Continued engagement produces compounding value. The Personal Evidence Base is dense and connected. Correlation, prediction, and recommendation draw primarily from personal history supplemented by domain knowledge. The platform answers *what does my skin journey show, what changed after I acted, and what should I do next based on my own evidence?* The user experiences SkinIntel as a calm personal skin intelligence companion whose guidance improves because it learns from documented experience—not because marketing promises a smarter model.

---

### Design principle: reduce effort, increase evidence quality

The user journey must be designed around reducing user effort while increasing evidence quality. These goals are not opposed when architecture supports them correctly.

Structured capture—symptom selection, body area classification, product recognition, routine logging—produces comparable, correlatable evidence with less ambiguity than free-text alone. Remembering prior products, routines, and preferences reduces re-entry burden. Progressive disclosure collects foundation at first scan and defers optional depth to moments when context makes questions meaningful. OCR and catalog paths minimize composition entry friction while preserving provenance and confidence boundaries.

Every journey stage should serve at least one intelligence purpose:

- **Capture better evidence** — Structured, provenance-attached records enter the Personal Evidence Base.
- **Clarify current context** — Products, routines, goals, and sensitivities orient interpretation.
- **Explain uncertainty** — Confidence posture and evidence limits are visible, not hidden.
- **Help the user act safely within cosmetic scope** — Guidance is educational and actionable without medical claims.
- **Collect feedback** — Confirmations and corrections flow back into evidence and learning.
- **Evaluate outcomes** — Change is measured against time windows and prior guidance.
- **Improve future intelligence** — Learning Layer calibrates from evaluated history.

Stages that consume attention without serving these purposes violate the architecture regardless of interface polish.

---

### Early journey versus mature journey

**Early user journey** relies more heavily on general domain knowledge because personal evidence is thin. Initial scans establish baseline; product and routine context may be partial; outcome windows are immature. Intelligence outputs carry wider confidence bounds. Recommendation Engine applies population-reasonable heuristics supplemented by declared sensitivities and goals—not pretended depth of personalization. The platform must help meaningfully without requiring perfect data before assisting.

**Mature user journey** becomes more personalized because the Personal Evidence Base, Outcome Intelligence, and Personal Threshold Learning have accumulated evidence. Correlation Engine traverses months of exposure history. Outcome evaluations link recommendations to observed results. Learning Layer calibrates tolerance, meaningful change thresholds, and anti-repeat logic for this individual. Guidance specificity increases as evidence density increases—the product promise of improvement over time, not a fixed ceiling reached at onboarding.

The transition is gradual, not a switch. Confidence Layer prevents the platform from presenting tentative early inference as established personal truth. Users should feel improvement in relevance as they engage—not an abrupt mode change labeled "premium intelligence unlocked."

---

### Boundaries

The user journey operates within strict architectural and experiential limits:

**The journey must not become medical triage.** SkinIntel organizes personal cosmetic skin evidence and intelligence. It does not diagnose conditions, assign clinical labels, or present itself as a medical authority. Escalation paths to professional consultation exist where scope is exceeded; they do not redefine the product as clinical software.

**Onboarding must not ask too many questions at once.** Foundation capture at first contact is intentional; exhaustive interrogation is not. Progressive collection spreads optional depth across journey stages when context makes questions meaningful.

**The product must not require perfect data before helping.** Provisional products, partial composition, and thin scan history must not block orientation and qualified guidance. Personal evidence capture is more important than catalog completeness.

**AI result must not be treated as final truth.** Initial interpretation is evidence-linked intelligence with confidence posture—not immutable verdict. User correction paths and subsequent outcome evaluation supersede with reference, not silent replacement.

**Recommendations must not become sales pressure.** Guidance serves informed personal care decisions within cosmetic scope—not catalog promotion, affiliate framing, or urgency manipulation.

**History must not become overwhelming.** Longitudinal review surfaces salient patterns, milestones, and explainable summaries—not undifferentiated data dumps that erode usability while preserving full inspectability for those who seek depth.

**Personalization must remain explainable and correctable.** Users must understand why guidance shifted, what evidence supports calibration, and how to correct what the platform got wrong. Opaque personalization violates trust and architecture alike.

---

### The ideal journey experience

The ideal SkinIntel journey feels like a calm personal skin intelligence companion.

It is **not a medical system**—language, scope, and escalation respect cosmetic and educational boundaries consistently.

It is **not a generic chatbot**—responses are grounded in structured Personal Evidence Base history, typed model objects, and governed Intelligence Engines—not stateless conversational improvisation.

It is **not a webshop funnel**—products matter as variables in the user's skin journey, not as conversion targets. Product Lifecycle serves intelligence, not commerce.

The user should feel that the platform knows their story in a purposeful sense: their history, their products, their reactions, their preferences, and their outcomes woven into guidance that respects individuality. Each interaction should leave the Personal Evidence Base in a better state—more complete, more connected, or more accurately structured. Engagement rewards consistency because consistency builds lasting personal value.

The User Journey is the human-facing arc of the Intelligence Flow and Long-Term Learning Loop. Architecture defines the stages; experience design delivers them with calm premium restraint—but the journey's purpose is fixed: transform everyday skin care decisions into accumulated, personal intelligence that grows more useful over time.

---

## Future Architecture

Future Architecture defines how the SkinIntel platform can evolve without breaking the foundation established in this document. It is not a feature wishlist, roadmap backlog, or delivery commitment. It defines extension principles for future platform growth: what kinds of capabilities may enter the system, what they must preserve, and how they must be governed so that years of Personal Evidence Base history remain coherent, explainable, and trustworthy.

The current architecture—five platform layers, Intelligence Engines, Data Model objects, Personal Evidence Base, Longitudinal Timeline, Intelligence Flow, and Long-Term Learning Loop—is intentionally designed to support growth. Growth must not destroy trust. Future Architecture is the contract that makes expansion additive rather than destructive.

This section describes platform-level extension principles. Detailed object extension criteria remain authoritative in **docs/11_DATA_MODEL.md** (Future Expansion). Architectural decisions proceed through **docs/ARCHITECTURE_DECISIONS.md**. This document defines how future capabilities relate to the master platform frame.

---

### What future architecture may include

Future capabilities extend the platform's intelligence scope—they do not redefine its identity. Illustrative domains, not commitments, include:

- **Advanced image comparison** — Structured analysis artifacts linked to Scan Records and body areas, expressed as governed comparison results or AI Knowledge Objects with evidence references—not unstructured media processing alone.
- **Multi-photo scan sets** — Session groupings of related captures as structured scan context, preserving provenance and temporal position on the Longitudinal Timeline.
- **Environmental and lifestyle context** — Voluntarily associated or platform-observed context linked to evidence windows: humidity, travel, schedule disruption, indoor heating—with explicit provenance and confidence.
- **Seasonal context** — Temporal seasonal markers linked to symptom and outcome patterns across years for correlation and pattern detection.
- **Professional review workflows** — Governed review states and attestations linked to evidence objects, supplementing user-reported history without silently modifying immutable records.
- **Product and formulation verification workflows** — Progression events upgrading provisional to verified product and formulation knowledge with traceable provenance.
- **Reformulation monitoring** — Enhanced tracking when verified product composition materially changes, linking formulation version transitions to exposure windows without breaking historical links.
- **Advanced prediction models** — Prediction candidates as AI Knowledge Objects with confidence bands and assumption boundaries—not guaranteed forecasts stored as outcomes.
- **Exportable user reports** — Presentation assemblies of existing evidence and intelligence objects for user review—not new authoritative truth that bypasses traceability.
- **Cross-user aggregate insights where privacy and consent allow** — Population-level pattern objects strictly separated from personal evidence, never overriding individual history for guidance.
- **Integration with external devices or wearables where appropriate** — Externally sourced signals linked to timeline windows with source provenance, consent governance, and confidence appropriate to data quality.
- **More mature multilingual expansion** — Locale presentation mapped to language-independent identifiers without altering domain semantics across sessions.
- **Professional or brand-facing modules** — External-facing capabilities that do not compromise user trust, do not expose personal evidence without consent, and do not introduce commerce bias into recommendation semantics.

Each domain requires governed extension—not ad hoc fields appended to existing objects until boundaries collapse. Capabilities that cannot be expressed as typed, traceable, confidence-aware artifacts remain product ideas until architecture defines them.

---

### Principles all future architecture must preserve

Every future module, integration, and intelligence capability must pass the same extension gates regardless of product appeal or implementation convenience:

- **Personal Evidence Base continuity** — Extensions add to accumulated history; they do not overwrite Scan Records, timeline events, or prior intelligence artifacts.
- **Data Model boundaries** — New capabilities occupy distinct domains; they do not absorb symptoms into products, outcomes into recommendations, or evidence into AI inference.
- **Longitudinal Timeline integrity** — New events position on the chronological spine; they do not retroactively rewrite sequence or erase exposure windows.
- **Provider independence** — New capabilities do not bind knowledge semantics to a specific AI vendor, storage engine, or capture technology.
- **Language-independent identifiers** — New objects reference canonical tokens; locale-specific strings remain presentation layers.
- **Evidence-based reasoning** — New context enriches interpretation; it does not substitute for primary evidence or inflate confidence without support.
- **Confidence awareness** — New signals carry explicit certainty and uncertainty appropriate to source quality and completeness.
- **User correction paths** — Extensions do not bypass confirmation, rejection, or governed correction semantics.
- **Privacy and consent boundaries** — What is collected, linked, shared, or aggregated requires explicit governance—especially for lifestyle, hormonal, device, professional, or cross-user contexts.
- **No commerce bias in recommendations** — Purchase, affiliate, pricing, and catalog promotion mechanics remain outside recommendation semantics regardless of integration depth.
- **No medical diagnosis unless a separately governed clinical scope ever exists** — Cosmetic and educational scope remains default. Any future clinical capability would require explicit product boundary separation, governed scope, and independent ADR—not incremental scope creep through feature additions.

These principles are non-negotiable. Capabilities that violate them require architecture review and explicit documented decision—not silent incorporation during delivery sprints.

---

### Additive and governed extension

Future modules must be additive and governed. They extend the platform; they do not rewrite it.

**Additive** means new object types, engines, or evidence layers appear alongside existing structure with defined reference relationships. An environmental context object links to a scan period; it does not retroactively embed environment fields into Scan Record semantics. A progress summary references outcome sequences; it does not overwrite individual Outcome Model evaluations with a single number that erases detail. Reformulation tracking creates new formulation context linked to prior exposure windows; it does not mutate immutable usage records.

**Governed** means extension proceeds through documented review: impact assessment on Intelligence Engines, Longitudinal Timeline, Personal Evidence Base, and user-facing trust boundaries. Breaking changes to foundational object meaning require deliberate version migration with historical preservation—not reactive schema edits under deadline pressure.

Future modules must not:

- **Rewrite historical evidence** — Append-only temporal semantics for capture and evaluation records.
- **Collapse models together** — Symptoms, products, outcomes, recommendations, and AI inference remain distinct object domains.
- **Bypass confidence** — Thin or provisional signals produce qualified outputs; extensions do not force false precision.
- **Introduce untraceable AI conclusions** — AI contributions normalize into AI Knowledge Objects with evidence links; orphan inference does not enter the Personal Evidence Base as intelligence.

When AI providers upgrade, when storage migrates, when new capture methods emerge, existing knowledge objects remain semantically recognizable. Extensions attach; they do not redefine.

---

### Extension process: Data Model and ADR

If a new future capability requires a new object, relationship, or boundary change, it must be handled through governed architecture process—not implementation shortcuts.

**Data Model extension** — Proposed objects must answer: what domain concept they represent; which existing objects they reference; what evidence they add; what confidence they carry; whether they are user-provided, platform-observed, externally verified, or AI-inferred; how they affect recommendations, outcomes, or learning; and what does not belong inside them. Objects that cannot answer these questions remain feature ideas, not model extensions. **docs/11_DATA_MODEL.md** holds authoritative object definitions; extensions update that document through review.

**Architecture Decision Record** — Significant boundary changes, new intelligence layer responsibilities, cross-user data use, professional input governance, device integration scope, or any capability that alters platform identity requires a new ADR in **docs/ARCHITECTURE_DECISIONS.md**. ADRs document context, decision, consequences, and explicit boundaries—creating accountability across time and teams.

Feature delivery without architectural definition scatters data across profile fields, collapses outcomes into recommendation text, treats product names as unstable strings, and discards routine history on every edit. The extension process exists to prevent that erosion.

---

### Growth without architectural amnesia

SkinIntel is designed to accumulate years of personal skin evidence—to grow from Personal Skin Intelligence into a broader evidence-based system without losing the properties that make longitudinal value possible.

Future Architecture ensures that widening scope—environmental context, advanced imaging, professional collaboration, aggregate insights where permitted, device integration, multilingual maturity—occurs within the same architectural contract: evidence first, knowledge structured, intelligence reasoned, learning calibrated, experience presented with traceability.

Architects, product leaders, and delivery teams proposing new capabilities should treat this section as the extension frame. The five platform layers, Intelligence Engines, Data Model objects, Personal Evidence Base, Intelligence Flow, and Long-Term Learning Loop are the foundation. Future Architecture describes how to build on that foundation—additively, governedly, and with explicit preservation of user trust.

Growth is expected. Architectural amnesia is not. The platform may become more capable; it must not become less accountable to the user whose skin journey it records.

---

## Related Documents

This document is the master platform architecture overview for SkinIntel. It connects platform philosophy, layers, intelligence flow, engines, data model positioning, Personal Evidence Base, learning loop, product lifecycle, user journey, and future extension principles into one coherent system definition. It is the primary entry point for understanding how the platform fits together—but it is not the only source of truth.

Detailed object definitions, accepted architectural decisions, development constraints, and engine-specific depth live in specialized documents below. When this master document and a detailed document appear to conflict, resolution begins with reconciliation against the architectural principles defined here—then against the authoritative scope of the detailed document. This section maps the documentation estate: what each artifact defines, how it relates to this document, and when to consult it.

---

### Document hierarchy

**This document — master platform overview**

**docs/SKININTEL_PLATFORM_ARCHITECTURE_V2.md** establishes the integrative frame: five platform layers, Intelligence Engines and their relationships, Intelligence Flow, Personal Evidence Base, Long-Term Learning Loop, Product Lifecycle, User Journey, and Future Architecture extension principles. Consult it first for executive understanding, cross-engine dependencies, and systemic boundaries. It summarizes how the platform works; it does not replace detailed specifications.

**Authoritative detail by domain:**

| Domain | Authoritative document |
|--------|------------------------|
| Conceptual knowledge objects, relationships, immutability rules | **docs/11_DATA_MODEL.md** |
| Accepted architectural decisions and consequences | **docs/ARCHITECTURE_DECISIONS.md** |
| Implementation and documentation discipline | **docs/99_DEVELOPMENT_RULES.md** |
| Engine-specific behavior and contracts | Engine documents (see below) |

---

### Related documents

#### docs/00_FINAL_PRODUCT_VISION.md

**What it defines:** The enduring product mission—Personal Skin Intelligence as the goal, permanent skin memory, trust and privacy foundations, and the product identity that governs what SkinIntel is and refuses to become.

**Relation to this document:** This platform architecture document implements the vision at structural level. The vision answers *why* SkinIntel exists; this document answers *how* the platform is organized to deliver that mission over years of use.

**When to consult:** Product direction debates, scope decisions, stakeholder alignment on product identity, and any feature evaluation asking whether it serves Personal Skin Intelligence or merely adds surface capability.

#### docs/SKININTEL_INTELLIGENCE_ENGINE_V1.md

**What it defines:** The Intelligence Engine as product core—vision, permanent design principles, layered engine architecture, and the directional flow from input through memory, knowledge, correlation, prediction, and recommendation.

**Relation to this document:** This document extends and integrates engine concepts into the full platform frame—adding platform layers, Data Model contract, Personal Evidence Base, learning loop, and cross-document governance. The Intelligence Engine document is the engine-centric view; this document is the platform-centric view.

**When to consult:** Engine composition questions, principle trade-offs, and understanding how intelligence layers cooperate before diving into engine-specific specifications.

#### docs/02_INPUT_INTELLIGENCE_ENGINE.md

**What it defines:** Input Intelligence scope—structured capture, normalization, scan and feedback ingress, collection principles, and the foundation quality requirements that all downstream engines depend on.

**Relation to this document:** Input Intelligence is defined at summary level under Intelligence Engines and Intelligence Flow in this document. The Input Intelligence Engine document holds authoritative depth on capture semantics, question groupings, and input boundaries.

**When to consult:** Designing or implementing capture flows, onboarding input scope, scan session structure, feedback submission, or any work at the Evidence Layer ingress boundary.

#### docs/08_PRODUCT_INTELLIGENCE.md

**What it defines:** Product Intelligence scope—product ingress pathways, verification posture, provisional versus verified products, product context for correlation and recommendation, and product-specific principles including formulation gap recognition.

**Relation to this document:** Product Lifecycle and Product Intelligence engine summary in this document describe platform-level product movement and engine role. The Product Intelligence document holds authoritative depth on product capture, enrichment, and reasoning boundaries.

**When to consult:** Product entry flows, catalog and OCR integration, verification workflows, product-outcome linkage, and any work connecting Product Model usage to intelligence pipelines.

#### docs/11_DATA_MODEL.md

**What it defines:** The conceptual Data Model—stable knowledge objects (User Profile, Scan Record, Product Model, Outcome Model, Longitudinal Timeline, AI Knowledge Objects, and others), relationship rules, immutability semantics, layer contracts, and Future Expansion extension criteria.

**Relation to this document:** The Data Model section here explains how the model fits the platform architecture. **docs/11_DATA_MODEL.md** is the source of truth for what each object is, what it owns, what it must not own, and how engines read and write against it.

**When to consult:** Any implementation touching persisted knowledge, object boundaries, timeline events, evidence references, or proposed new object types. Always before defining storage schemas, API payloads, or engine write contracts.

#### docs/ARCHITECTURE_DECISIONS.md

**What it defines:** Accepted Architecture Decision Records—documented choices with context, consequences, and explicit boundaries, including platform identity, outcome evaluation, confidence governance, and Personal Threshold Learning.

**Relation to this document:** This document states the integrated architecture; ADRs record *why* specific commitments were accepted and what tradeoffs they impose. ADRs govern implementation when detailed rules are decision-specific.

**When to consult:** Before challenging established boundaries, proposing scope changes, adding capabilities that alter platform identity, or implementing features covered by existing ADRs. New significant decisions require new ADRs.

#### docs/99_DEVELOPMENT_RULES.md

**What it defines:** Development discipline—architecture-first delivery, documentation-before-code expectations, intelligence-before-features prioritization, multilingual one-source-of-truth rules, and implementation constraints that preserve platform integrity during execution.

**Relation to this document:** This document defines what the architecture is; development rules define how teams must work to preserve it during implementation. Rules operationalize architectural principles for day-to-day delivery.

**When to consult:** Sprint planning, code review standards, multilingual implementation, and any implementation choice that might bypass Data Model boundaries or overwrite historical evidence for delivery speed.

---

### Navigation guidance

Readers approaching SkinIntel architecture should follow this sequence:

1. **This document** — Understand the whole system: layers, flow, engines, evidence, learning, lifecycle, journey, and future extension frame.
2. **docs/00_FINAL_PRODUCT_VISION.md** — Confirm product mission and identity constraints.
3. **docs/11_DATA_MODEL.md** — Learn object definitions and boundaries before designing persistence or engine contracts.
4. **docs/ARCHITECTURE_DECISIONS.md** — Review accepted decisions affecting the capability under design.
5. **Engine documents** — Deep-dive the specific Intelligence Engine in scope.
6. **docs/99_DEVELOPMENT_RULES.md** — Apply implementation discipline before and during delivery.

Engine-specific concepts live in engine documents—not in this master overview. Object field semantics and relationship rules live in **docs/11_DATA_MODEL.md**—not summarized here. Accepted decision rationale lives in **docs/ARCHITECTURE_DECISIONS.md**. Delivery constraints live in **docs/99_DEVELOPMENT_RULES.md**.

Together, these documents form the architecture estate under which SkinIntel is designed, governed, and built. This document holds the map; the specialized documents hold the territory.

---

## Version History

| Version | Date | Status | Summary |
|---|---|---|---|
| V2.0 | 2026-06-29 | Draft complete | Completed the master platform architecture document for SkinIntel Intelligence Platform, including Product Vision, Core Principles, Platform Layers, Intelligence Engines, Data Model, Intelligence Flow, Personal Evidence Base, Long-Term Learning Loop, Product Lifecycle, User Journey, Future Architecture, and Related Documents. |

This document remains subject to future ADR-governed updates. Any future architecture changes that alter object boundaries, engine responsibilities, data model semantics, or platform scope must be documented through **docs/ARCHITECTURE_DECISIONS.md** before implementation.
