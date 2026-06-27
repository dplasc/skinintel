# SkinIntel Development Rules

## Status

Draft V1

---

## Project Philosophy

(placeholder)

---

## Architecture First

(placeholder)

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

(placeholder)

---

## Explainability Requirements

(placeholder)

---

## Privacy Requirements

(placeholder)

---

## Review Process

(placeholder)

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
