# SkinIntel Development Rules

## Status

Draft V1

---

## Project Philosophy

(placeholder)

---

## Architecture First

Architecture decisions precede implementation. No feature, module, or integration may be designed or built until its place in the accepted architecture is defined, reviewed, and recorded in the governing architecture documents.

Cursor and AI-assisted tooling are implementation accelerators. They are not architectural authorities. They do not define platform structure, layer boundaries, object responsibilities, or data flow. Implementation must follow accepted architecture documents—not inferred patterns, convenience shortcuts, or generated suggestions that conflict with documented design.

Every capability must respect the platform pipeline:

**Evidence → Knowledge → Intelligence → Learning → Experience**

No feature may bypass this sequence. No layer may absorb responsibilities belonging to another. No shortcut reasoning is permitted: conclusions must flow through the defined stages, not leap across them. Object responsibility collapse—merging evidence storage with presentation logic, conflating knowledge with intelligence output, or embedding learning inside experience—is prohibited.

When architecture and implementation conflict, architecture wins. Implementation must stop, the conflict must be surfaced, and the architecture must be explicitly revised through the documented review process before work continues. Silent deviation is not acceptable.

---

## Documentation Before Code

(placeholder)

---

## Intelligence Before Features

(placeholder)

---

## One Source Of Truth

Multilingual support is a core architectural principle of the SkinIntel platform—not a later feature, not a localization overlay, and not an optional enhancement to be deferred until after initial delivery. From the first architectural decision onward, the platform is designed to serve users in multiple languages while maintaining a single, language-neutral representation of all business knowledge. This principle governs how evidence is recorded, how knowledge is structured, how Intelligence Engines reason, and how the Experience Layer presents information to the user.

The following permanent architecture principles define how SkinIntel achieves one source of truth across languages.

### Language-agnostic internal representation

SkinIntel is language-agnostic internally. The platform's internal architecture does not encode, assume, or depend on any human language. Business concepts, domain entities, classifications, and relationships exist independently of the words any particular user speaks or reads. Internal processing, storage of knowledge, and cross-engine communication all operate on language-neutral representations.

This separation is structural, not cosmetic. It ensures that intelligence derived for one user remains valid and comparable regardless of which language that user prefers. It ensures that engines do not embed linguistic assumptions that would constrain future expansion. It ensures that the platform can evolve its reasoning capabilities without re-architecting around language-specific artifacts.

### No language-bound business knowledge

The platform must never store business knowledge in a specific language. Symptoms, body areas, ingredients, product attributes, severity scales, classifications, and every other domain concept must be persisted as language-neutral entities—not as Croatian strings, English strings, or strings in any other tongue.

Storing knowledge in a user-facing language conflates presentation with substance. It creates duplicate records for the same concept across locales, introduces inconsistency when translations diverge, and makes it impossible for Intelligence Engines to reason uniformly. It also makes every future language addition a data migration problem rather than a presentation problem. Business knowledge belongs to the Knowledge Layer and below; human language belongs exclusively to the Experience Layer and its translation mechanisms.

### Universal internal identifiers

Every knowledge object should have a universal internal identifier—a stable, language-neutral key that uniquely denotes the concept regardless of how it is labeled for any user. Identifiers are the canonical reference through which engines, data structures, and cross-layer handoffs recognize and relate entities.

Examples of concepts that require such identifiers include:

- **redness** — a symptom classification, not the word "redness" or its equivalent in any language
- **dryness** — a skin condition attribute, referenced uniformly across correlation and recommendation logic
- **itching** — a symptom type, distinct from localized labels such as "svrbež" or "Juckreiz"
- **cheeks** — a body area, independent of anatomical terminology in any locale
- **forehead** — a body area, mapped consistently across scans, routines, and outcome tracking
- **retinol** — an ingredient entity, reasoned over by Ingredient Intelligence without linguistic variation
- **niacinamide** — an ingredient entity, classified and correlated using the same internal key in every market

These examples illustrate a consistent pattern: the identifier denotes the concept; the translation denotes how the concept is presented. Intelligence operates on identifiers. Users encounter translations.

### Translations as presentation

User-facing translations are a presentation layer concern. They do not define what the platform knows; they define how the platform communicates what it knows to a user who prefers a given language. Translation assets—labels, descriptions, explanatory text, and interface copy—sit at the Experience Layer boundary and may evolve independently of the knowledge and intelligence structures beneath them.

This boundary is architecturally enforced. An Intelligence Engine produces outputs referencing internal identifiers and structured knowledge. The Experience Layer resolves those references to the appropriate translation for the user's selected language. No engine generates final user-facing prose as its primary output; engines generate intelligence that presentation translates.

### Language expansion without architectural change

New languages must not require architecture changes. Adding Croatian, German, Japanese, or any future locale is a matter of supplying translation assets and enabling presentation configuration—not of modifying Intelligence Engines, revising the Data Model, or restructuring how knowledge is stored.

The initial production languages are:

- **Croatian**
- **English**
- **German**

These three languages define the first production presentation scope. The architecture treats them equally: each maps to the same internal identifiers, the same knowledge objects, and the same intelligence outputs. None receives preferential treatment at the knowledge or reasoning level. English may serve as the working language for documentation and development communication, but it is not the canonical language of stored business knowledge.

The architecture must support adding future languages without changing Intelligence Engines or the Data Model. A new language introduces translation coverage and presentation validation; it does not introduce new entity types, new reasoning paths, or new storage schemas. If adding a language would require any of those changes, the architecture has been violated.

### Architectural commitment

One source of truth means one knowledge representation, many presentation surfaces. SkinIntel stores what is true about the user's skin journey in language-neutral form. It presents that truth in the language the user understands. Intelligence Engines and the Data Model remain stable as the platform's linguistic reach expands. This is not a guideline for a future phase; it is a binding constraint on every current and future architectural decision.

---

## Data Before AI

The Personal Evidence Base is the durable asset of the SkinIntel Intelligence Platform. AI is a processing capability applied to that asset—not a substitute for it.

AI must not invent, infer, or fabricate missing user evidence. Every AI output must be grounded in structured evidence that exists within the platform's data model. When evidence is absent, the platform must acknowledge the gap—not fill it with plausible generation.

Data objects must remain traceable and explainable at every stage. Where applicable, current state must be derived from history rather than overwritten without lineage. AI provider output must be normalized into platform-defined artifacts before it enters the Knowledge Layer or Intelligence Engines. Raw model responses are not platform truth.

The AI provider is replaceable. The Data Model and Personal Evidence Base are not. Architectural decisions must preserve evidence integrity, normalization boundaries, and auditability regardless of which AI capability is invoked. No implementation may treat model output as authoritative without passing through the platform's evidence and normalization requirements.

---

## Explainability Requirements

Every major conclusion the platform produces must be explainable. Explainability is not optional presentation polish; it is a binding requirement of the Intelligence Platform.

Recommendations must reference the evidence that supports them, the user context that shaped them, the uncertainty present in the underlying data, and the confidence posture applied to the conclusion. Confidence must not mask weak evidence. When evidence is incomplete, uncertain, or conflicting, that condition must be visible to the user—not smoothed over by authoritative tone or high-confidence labeling.

Explanations must remain educational and within cosmetic scope. The platform does not diagnose disease, assign medical labels, or claim treatment outcomes. No engine output may cross into medical diagnosis, disease labeling, or treatment claims.

Every engine output must be auditable back to evidence. A reviewer—or the user—must be able to trace how a conclusion was reached, which evidence objects contributed, and where uncertainty entered the reasoning chain. Intelligence that cannot be traced is not acceptable intelligence.

---

## Privacy Requirements

Privacy and consent are architectural requirements—not UI details, not post-launch compliance patches, and not optional enhancements.

User consent must govern how the platform stores evidence, performs reasoning, applies learning, exports data, and executes deletion. Withdrawal of consent must be respected with defined platform behavior. Delete requests and retention policies are platform obligations, not discretionary features.

Immutable history does not mean ignoring deletion rights. Architectural immutability serves traceability and audit integrity; it does not override the user's right to request deletion or restrict processing. Deletion and retention behavior must preserve architectural integrity through explicit governance—defined policies, auditable processes, and documented handling of sensitive records—not through ad hoc erasure that breaks platform structure.

Skin images and symptom descriptions are sensitive by nature and require heightened care in storage, access, processing, and presentation boundaries.

No marketing profile, commercial segment, or webshop profile may be silently derived from the Personal Evidence Base. Evidence collected for skin intelligence must not be repurposed for unrelated commercial profiling without explicit, separate consent governed by architecture—not by implicit data reuse.

---

## Review Process

Work proceeds one step at a time. Each change must be deliberate, scoped, and reviewable before it becomes part of the platform.

Every Cursor diff must be reviewed before acceptance. No commit, push, or deploy may occur without explicit review approval. Scope creep is prohibited. Breaking changes are prohibited unless explicitly authorized and documented. Undocumented architectural decisions are prohibited.

Placeholder architecture must not be implemented as if it were final. If a gap is discovered during implementation, work stops. The architectural decision must be documented and accepted before implementation resumes. Accepted architecture sections must not be rewritten casually; changes require deliberate review and explicit approval.

Cleanup must be targeted and minimal. Refactoring for its own sake, broad rewrites of stable sections, and opportunistic scope expansion are not permitted under the guise of improvement.

---

## Cursor Rules

(placeholder)

---

## AI Agent Rules

(placeholder)

---

## Coding Rules

(placeholder)

---

## Deployment Rules

(placeholder)

---

## Version History

V1 Draft
