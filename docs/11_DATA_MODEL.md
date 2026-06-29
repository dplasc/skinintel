# SkinIntel Data Model

## Status

Draft V1

---

## Purpose

The purpose of the SkinIntel Data Model is to define every knowledge object used by the Intelligence Engine. It is the authoritative conceptual description of what the platform knows, how that knowledge is organized, and how distinct pieces of information relate to one another across a user's skin journey. Every intelligence layer—Input Intelligence, Memory, Knowledge, Product Intelligence, Ingredient Intelligence, Correlation, Prediction, Recommendation, and Formulation—depends on a shared understanding of these objects. Without a common model, layers would speak different languages, memory would fragment, and personalization would collapse into isolated feature data.

This document defines that shared language.

### Conceptual Model, Not Storage Schema

The Data Model is not a database schema. It does not prescribe tables, columns, indexes, or storage technology. It is the conceptual model of everything SkinIntel knows—the entities, relationships, and semantic meaning that persist regardless of how or where information is physically stored.

Storage choices may change. Technologies evolve. Providers are replaced. The conceptual model must remain stable through those transitions because it represents the product's intellectual structure, not its current infrastructure. When a database is redesigned or a service is migrated, the knowledge objects themselves—what a scan is, what a product record means, how an outcome links to history—should remain recognizable and intact.

Confusing the conceptual model with a storage schema is an architectural error. Schemas serve the model; they do not define it.

### Common Read and Write Surface

Every Intelligence Engine reads from and writes to this common model. Input Intelligence writes structured signals derived from user interaction. Memory Engine preserves and retrieves longitudinal records. Product Intelligence enriches product knowledge. Ingredient Intelligence decomposes composition. Correlation Engine connects objects across time and context. Prediction Engine projects from accumulated patterns. Recommendation Engine produces guidance grounded in model truth. Formulation Engine addresses gaps the model exposes.

No layer maintains a private shadow model for the same concept. If two layers need to reference a product, they reference the same product object as defined here—not parallel definitions that drift apart over time. The Data Model is the contract between layers: what exists, what it means, and how it connects.

This shared surface enables auditability. A recommendation can be traced to the scan records, product history, symptom classifications, and outcomes that produced it—because all layers operate on the same objects with the same semantics.

### Stability Across Change

The model should remain stable even if technologies, databases, APIs, or AI providers change. Artificial intelligence may assist interpretation, but the knowledge objects it reads and writes are durable product concepts—not artifacts of a particular model version or vendor capability.

When an AI provider is replaced, the scan record still means the same thing. When storage migrates, the relationship between a product and its ingredient composition remains unchanged. When new capture methods are added, they normalize into existing object types rather than inventing parallel structures.

Stability does not mean immutability. The model may evolve through deliberate versioned extension—new fields of meaning, new relationships, new object types approved through architecture review. It must not churn reactively with every feature sprint or storage decision.

### What the Model Represents

The Data Model encompasses the full scope of personal skin intelligence. It represents:

- **People** — the individuals who use the platform, their profile context, preferences, and ownership of personal records.
- **Skin** — baseline skin characteristics and persistent attributes that orient interpretation across time.
- **Scans** — discrete capture sessions where structured input, observation, and context are recorded as coherent events.
- **Body areas** — the universal spatial classification linking concerns, symptoms, products, and outcomes to where on the body they apply.
- **Symptoms** — classified presentations linked to body area, severity, duration, and session context.
- **Products** — skincare items understood in context: composition, routine role, application area, usage period, and verification status.
- **Ingredients** — component-level knowledge linked to products and personal exposure history.
- **Routines** — the structure and sequence of care steps through which products are applied over time.
- **Outcomes** — user-reported results connecting actions to experience: improvement, stability, reaction, or failure.
- **Recommendations** — explainable guidance produced from personal history, linked to the evidence that supports it.
- **Formulation concepts** — advanced proposals when existing products do not satisfy documented need, distinct from catalog recommendation.
- **Longitudinal history** — the continuous thread connecting all objects above across weeks, months, and years into a personal timeline.

Together these represent the complete domain of what SkinIntel must know to deliver Personal Skin Intelligence—not as disconnected data points, but as interconnected knowledge.

### The Language of Intelligence Engines

The Data Model is the language shared by all Intelligence Engines. When Input Intelligence captures a symptom, it writes an object this document defines. When Correlation Engine links that symptom to a product introduction, it traverses relationships this document specifies. When Recommendation Engine produces guidance, it reads from objects whose meaning is fixed here.

Layers do not negotiate meaning at runtime. They inherit it from the model. This is what allows the platform to grow—new layers, new capabilities, new capture methods—without redefining what a scan or a product already means.

For developers, architects, and AI agents working on SkinIntel, this document answers: what exists in the platform's world of knowledge? For product and intelligence design, it answers: what must be preserved, connected, and explainable for the user across the full journey?

### Summary

The SkinIntel Data Model exists to define every knowledge object the Intelligence Engine uses—conceptually, durably, and independently of any particular technology. It is not storage. It is the platform's shared understanding of people, skin, scans, body areas, symptoms, products, ingredients, routines, outcomes, recommendations, formulation concepts, and longitudinal history. Every layer reads and writes this model. The model stays stable as everything else changes. It is the language that makes Personal Skin Intelligence coherent.

---

## Design Principles

The SkinIntel Data Model is governed by a set of permanent design principles. These principles are not recommendations for initial delivery; they are architectural constraints that apply to every object, relationship, and extension defined in this document. They exist because SkinIntel is designed to accumulate years of personal evidence—scans, routines, products, outcomes, and feedback recorded across seasons, life changes, and evolving skin conditions. A platform with that horizon cannot afford a data model that erodes history, fragments meaning, or binds itself to transient technology or language choices.

The principles below define how the model must behave over the long term. Every object specification, every relationship definition, and every future extension must conform to them.

### Technology independence

The Data Model is technology independent. It describes what the platform knows and how knowledge objects relate to one another—not how those objects are persisted, transmitted, or processed by any particular system. Storage formats, service boundaries, and provider choices are downstream concerns that must conform to the model, not define it.

This independence is essential for longevity. Infrastructure evolves on a shorter cycle than personal health records. A user who trusts SkinIntel with five years of skin history must not lose semantic continuity when the platform migrates storage, replaces services, or adopts new capture methods. The scan recorded in year one must remain the same conceptual object in year five, regardless of what systems hold it.

### Language independence

The Data Model is language independent. Every knowledge object is defined by meaning, not by the words used to present it to any user. Symptoms, body areas, ingredients, classifications, and severity scales exist as language-neutral concepts with universal internal identifiers. User-facing labels in Croatian, English, German, or any future locale are presentation concerns that map to these identifiers—they do not constitute the objects themselves.

Language independence ensures that intelligence derived for one user remains valid regardless of locale. It ensures that adding a new language requires translation coverage, not model revision. It prevents the fragmentation that occurs when the same concept is stored differently in each language, making correlation and longitudinal analysis impossible across markets.

### Globally unique identity

Every object has a globally unique identity. No two records representing distinct events, entities, or observations may share an identifier. No identifier may be reused for a different concept over time. Identity is permanent: once assigned, it denotes that specific object for the life of the platform.

Unique identity is the foundation of traceability and referential integrity. When a recommendation references a scan, a product application, and an outcome, each reference must resolve unambiguously to the exact historical record intended. Without global uniqueness, longitudinal history becomes unreliable and explainability collapses.

### Immutable historical records

Objects are immutable historical records where appropriate. Scans, outcomes, feedback submissions, and other evidence-capture events represent what occurred at a point in time. Once recorded, they are not overwritten, revised, or replaced. Corrections and additions produce new records that reference or supersede prior entries—not mutations of the original.

Immutability preserves the evidentiary chain. SkinIntel's intelligence is only as trustworthy as the history it reasons over. If a scan from six months ago can be silently altered, no correlation, prediction, or recommendation built upon it can be explained or defended. Historical integrity is non-negotiable for a platform whose value grows with the depth and fidelity of accumulated evidence.

### Derived current state

Current state is derived from historical evidence rather than overwriting history. What the platform understands about a user's skin today—active symptoms, current routine, recent outcomes—is computed from the most recent relevant records, not stored as a mutable snapshot that replaces what came before.

This principle ensures that the present is always accountable to the past. A user's current profile reflects the trajectory of their journey, not a disconnected point-in-time overwrite. When state changes, the history of how it changed remains intact. Learning layers can examine transitions; intelligence layers can reason over sequences; the Experience Layer can show evolution—not merely the latest edit.

### Traceability

Every object must be traceable. From any intelligence output, it must be possible to follow a chain of references back to the evidence records that contributed to it. From any evidence record, it must be possible to identify what downstream knowledge, correlations, and recommendations consumed it.

Traceability is the architectural prerequisite for explainability. Users must understand why SkinIntel reaches a conclusion. Auditors, reviewers, and the platform itself must verify that intelligence is grounded in real evidence—not in opaque aggregation or unreferenced assumptions. A model that cannot be traced cannot be trusted over years of use.

### Explainable relationships

Every relationship must be explainable. When two objects are linked— a symptom to a body area, a product to an ingredient, an outcome to a routine—the nature of that relationship must be explicit, typed, and semantically defined. Relationships are not implicit joins or inferred associations buried in processing logic; they are first-class model elements whose meaning is documented and preserved.

Explainable relationships enable intelligence that can be communicated. Correlation is meaningful only when the platform can articulate what was correlated and why. Recommendation is actionable only when the user can see which products, symptoms, and outcomes informed it. Unexplainable relationships produce unexplainable intelligence.

### Personal evidence over generic assumptions

Personal evidence is more important than generic assumptions. When the model holds both user-specific records and general domain knowledge, intelligence must prioritize what this user actually experienced over what populations typically experience. Generic knowledge enriches interpretation; personal evidence determines conclusions.

This principle reflects SkinIntel's core purpose: Personal Skin Intelligence. A platform that accumulates years of personal data but defaults to generic patterns wastes its most valuable asset. The Data Model must structurally elevate personal evidence—making it first-class, permanently retained, and preferentially referenced—so that intelligence becomes more precise as history deepens, not more generic as data volume grows.

### Continuous learning without historical breakage

The model must support continuous learning without breaking historical integrity. As the platform refines thresholds, improves classifications, and incorporates feedback, new understanding must extend forward from existing records—not rewrite them. Learning produces new knowledge layers, adjusted weights, or superseding interpretations that reference prior state; it does not alter the evidence of what was recorded and reasoned at the time.

Years of accumulated evidence lose value if retroactive model changes silently reinterpret history. Continuous learning must make the platform smarter for future decisions while preserving an accurate record of what was known and recommended in the past. Historical integrity and adaptive intelligence are not in tension; the model must serve both.

### Shared conceptual model for all engines

Every Intelligence Engine must read from and write to the same conceptual model. No engine may maintain a parallel definition of a product, a symptom, or an outcome. No engine may introduce objects that exist only within its own boundary. The Data Model is the single contract governing all inter-engine communication.

A shared model prevents fragmentation—the gradual divergence that occurs when each layer optimizes for its own data shape. It ensures that what Input Intelligence writes is what Correlation Engine reads, that what Product Intelligence enriches is what Recommendation Engine references, and that what the Learning Layer evaluates is what the Experience Layer presents. One model, many engines; not many models, one platform.

### Replaceable AI providers

Future AI providers must be replaceable without changing the Data Model. Artificial intelligence may assist interpretation, classification, and enrichment, but the objects it reads and writes are defined here—not by any provider's output format, token structure, or model version. Provider replacement is an operational change; it must not require redefining what a scan or an ingredient means.

This principle protects the platform from vendor lock-in at the knowledge layer. AI capabilities will evolve rapidly; personal evidence records will persist for years. The model must outlast any provider relationship.

### Addable languages without model change

Future languages must be addable without changing the Data Model. New locales require translation mappings to existing identifiers, not new object types, new fields, or new relationship semantics. The model defines concepts once; presentation layers render them in any supported language.

This aligns with the platform's multilingual architecture and ensures that geographic expansion never triggers a model migration that risks historical records.

### Why these principles matter

SkinIntel is not a session-based application that forgets yesterday. It is a longitudinal platform expected to hold personal skin evidence across years—through product changes, seasonal variation, life events, and evolving skin conditions. That horizon demands a Data Model that treats every record as permanent, every relationship as meaningful, and every conclusion as accountable to evidence.

Technology will change. Languages will expand. AI providers will be replaced. Intelligence will improve. Through all of that, the user's history must remain intact, traceable, and explainable. These design principles are the architectural guarantee that SkinIntel can accumulate trust over time—not merely data.

---

## User Profile

The User Profile is the permanent identity object of the SkinIntel platform. It represents who the user is within the system—not what their skin looks like today, not what products they applied this morning, and not the conclusions any Intelligence Engine reached during the latest session. It is the stable anchor to which all personal evidence, knowledge, intelligence outputs, and experience preferences attach over time.

Every record in the platform—scans, outcomes, routines, recommendations—belongs to a user. The User Profile is the object that establishes that ownership, that continuity, and that person-specific context which persists across months and years. Where other model objects capture events and observations along the skin journey, the User Profile captures the enduring characteristics that orient how the platform interprets and communicates with that individual.

### Scope: long-term characteristics only

The User Profile must represent long-term characteristics only. It holds attributes that change infrequently, deliberately, and with user intent—preferences the user sets, goals they declare, sensitivities they document, consents they grant. It does not hold transient state. It does not mirror what is happening on the user's skin right now.

This distinction is architectural, not administrative. Temporary observations belong in evidence objects: scan records, symptom entries, routine logs, outcome reports. Those objects are immutable historical records with timestamps and context. The User Profile is a living but stable reference object whose values are updated through explicit user action or rare lifecycle events—not through automated inference from daily activity.

If today's symptom severity were stored on the User Profile, history would be overwritten rather than accumulated. If current routine products were embedded in the profile, the platform would lose the ability to trace routine evolution over time. The User Profile must remain above the flux of daily skin life.

### Responsibilities of the User Profile

The User Profile carries a defined set of responsibilities. Each concept below represents a category of enduring user context that Intelligence Engines and the Experience Layer may reference without re-deriving it from scattered evidence.

**Identity** — The User Profile establishes the user's permanent presence within the platform. Identity is the root of ownership: all personal evidence, longitudinal history, and intelligence outputs are attributable to this object. Identity is not merely an account identifier; it is the conceptual person whose skin journey SkinIntel serves.

**Preferred language** — The language in which the user wishes to receive presentation-layer content. This preference drives translation resolution at the Experience Layer. It does not alter internal knowledge objects or intelligence reasoning, which remain language-independent. Language preference may change; when it does, the change is recorded as an update to the profile, not as a transformation of stored business knowledge.

**Preferred units** — Measurement and display conventions the user expects: temperature scales, volume units, or other regional formatting preferences relevant to presentation. Like language, this is an Experience Layer orientation that ensures consistency across reports, dashboards, and explanations without encoding units into domain objects.

**Country / region** — Geographic context that may influence product availability assumptions, regulatory considerations for ingredient guidance, seasonal patterns, and presentation defaults. Region is a long-term contextual attribute, not a session variable. It informs enrichment and recommendation context without replacing personal evidence.

**Age group** — Life-stage classification relevant to skin interpretation and goal setting. Age group is a coarse, durable attribute—not a continuously computed value. It orients baseline expectations and communication tone while personal evidence overrides generic assumptions for any specific user.

**Baseline skin profile** — Enduring skin characteristics the user has established as their foundational context: general skin type tendencies, persistent baseline conditions, or long-standing attributes that do not fluctuate session to session. Baseline skin profile is distinct from the Skin Profile object, which may hold richer structured baseline detail; the User Profile holds the reference and ownership linkage that orients the platform to this user's enduring skin context.

**Long-term skin goals** — Declared objectives the user pursues over weeks, months, or longer: reducing sensitivity, addressing a persistent concern, maintaining stability, or achieving a defined outcome. Goals are user-stated intentions, not engine-inferred targets. They guide recommendation framing and progress evaluation without being overwritten by daily symptom variation.

**Declared sensitivities** — Known or self-reported sensitivities the user has explicitly documented: ingredient classes, product categories, or exposure types they wish to avoid or monitor. Declared sensitivities are user assertions that intelligence must respect. They differ from correlations the platform discovers over time; both may exist, but declared sensitivities belong on the profile as durable user statements.

**Privacy preferences** — Controls governing how personal data is used, retained, shared, or exposed within platform capabilities. Privacy preferences are long-term governance settings that every layer must honor before reading or writing user-associated objects.

**Consent history** — A durable record of consents granted, withdrawn, or modified: data processing consent, feature-specific consent, research participation, or communication consent. Consent is not a one-time flag; it is a historical sequence that must remain traceable for compliance and user trust. The User Profile maintains this history as part of its governance responsibility.

**Communication preferences** — How and when the user wishes to receive notifications, reports, reminders, or platform communications. These preferences stabilize the Experience Layer's outreach behavior without embedding communication state into intelligence objects.

Together, these responsibilities define the User Profile as the platform's enduring contract with the individual: who they are, how they wish to be served, what they have declared about themselves, and what boundaries they have set.

### What does not belong in User Profile

Architectural clarity requires explicit exclusion. The following categories of information must not be stored on the User Profile, regardless of convenience:

- **Today's symptoms** — Current symptom observations belong in scan records and symptom objects tied to specific sessions and body areas.
- **Current severity** — Severity is a property of a moment-in-time observation, not a permanent profile attribute. Severity history lives in evidence.
- **Today's products** — Product use on a given day is routine and application evidence, traceable through routine logs and product exposure records.
- **Temporary routines** — Active or experimental routines are time-bounded structures with start, change, and end events—not static profile fields.
- **Scan results** — Capture outcomes from individual sessions are immutable scan records. They must never collapse into profile fields that would overwrite prior results.

The pattern is consistent: if the information describes what is true *right now* as a result of recent observation or activity, it belongs in an evidence object with provenance and timestamp—not on the User Profile. If the information describes what the user *is*, *prefers*, *declares*, or *consents to* over the long term, it belongs on the profile.

Violating this boundary degrades longitudinal integrity. Engines that read "current symptoms" from the profile cannot explain when those symptoms began, how they changed, or what evidence supports them. The platform must resist the shortcut of profile-level mutable state for observational data.

### Stability and engine support

The User Profile is designed to remain stable over many years. A user who joins SkinIntel in one season and remains active through several life stages should have a single continuous identity object—not a succession of recreated profiles that fracture history. Updates to preferences, goals, or declared sensitivities append or supersede with traceability; they do not erase the profile's role as permanent anchor.

Every Intelligence Engine depends on the User Profile, but none should write transient observations to it. Input Intelligence associates incoming evidence with the user's identity. Product Intelligence and Ingredient Intelligence use declared sensitivities and region context to frame enrichment. Correlation and Prediction Engines use baseline characteristics and long-term goals to orient reasoning—while drawing conclusions from evidence, not from profile-level guesswork. Recommendation Engine respects goals, sensitivities, and privacy preferences when framing guidance. The Learning Layer evaluates outcome alignment against declared goals without mutating the profile with daily results. The Experience Layer resolves language, units, and communication preferences for every presentation.

This read-heavy, deliberately-write pattern keeps the profile stable while the evidence base grows rich. Engines read enduring context from the User Profile; they read current truth from evidence; they write intelligence outputs to their appropriate objects. The profile does not become a cache of latest results.

### Relationship to other model objects

The User Profile is one object in a larger model. It does not duplicate the Skin Profile, which holds structured baseline skin attributes in greater detail. It does not contain scan histories, which belong to the longitudinal timeline. It does not hold recommendations, which are intelligence outputs linked to evidence chains.

The User Profile answers: *who is this user, and what enduring context must every layer respect?* Other objects answer: *what happened, when, and what did the platform conclude?* Maintaining this separation is what allows SkinIntel to accumulate years of personal evidence under a single, stable identity—without conflating the person with their latest observation.

---

## Skin Profile

The Skin Profile is the conceptual object that represents the user's long-term baseline skin characteristics. It captures enduring tendencies, persistent concerns, and stable patterns that orient how the platform interprets evidence over months and years—not what the user's skin presents in a single session or week.

Skin Profile is not a medical diagnosis. It does not assert clinical conditions, prescribe treatment, or claim diagnostic authority. It is a cosmetic and educational baseline model: a structured representation of how this user's skin tends to behave, what concerns persist at a foundational level, and which tolerance patterns have been established through longitudinal observation and user declaration. Intelligence Engines use this baseline to contextualize new evidence, calibrate expectations, and frame guidance—always subordinate to personal evidence and never as a substitute for it.

### Relationship to User Profile

Skin Profile is linked to User Profile but serves a different purpose. The two objects must not be conflated.

The User Profile answers: *who is the user, and what preferences and governance apply?* It holds identity, language and presentation preferences, privacy and consent, declared sensitivities at a user-assertion level, long-term goals, and regional context. It is the person and their platform contract.

The Skin Profile answers: *what is the user's baseline skin context over time?* It holds enduring skin tendencies, persistent concern patterns, tolerance baselines, and body-area predispositions. It is the skin's foundational character as understood by the platform—not the person's account settings.

Every user has one User Profile. Every user has one Skin Profile linked to that identity. Evidence objects, scan records, routines, and outcomes attach to the user; the Skin Profile provides the stable dermatological-context lens through which engines interpret what those records mean for *this* individual. Linkage is permanent; purpose is distinct.

### Baseline characteristics

The Skin Profile encodes long-term baseline attributes. Each concept below represents a tendency or pattern—not a point-in-time measurement. Values describe what the user's skin *tends toward* over sustained observation, not what it *is today*.

**Baseline skin type tendencies** — Coarse orientation toward dry, oily, combination, or balanced baseline behavior, understood as tendency rather than fixed classification. Tendencies inform enrichment and recommendation framing without overriding evidence from recent scans.

**Dryness tendency** — The degree to which the user's skin chronically leans toward insufficient moisture retention or lipid depletion, independent of seasonal or acute fluctuations.

**Oiliness tendency** — The degree to which sebum production patterns persistently affect the user's baseline skin character, distinct from temporary shine or product-induced effects.

**Sensitivity tendency** — The user's established propensity toward reactive response to products, environmental factors, or ingredient exposure—measured as long-term pattern, not today's irritation level.

**Redness tendency** — Persistent baseline inclination toward visible erythema or vascular reactivity, separate from an active flare or single-session observation.

**Blemish / breakout tendency** — Long-term pattern of comedonal or inflammatory presentation, used to orient correlation and prediction without encoding current lesion count.

**Pigmentation tendency** — Baseline inclination toward hyperpigmentation, uneven tone, or post-inflammatory marking as an enduring characteristic.

**Texture tendency** — Persistent patterns in surface texture—roughness, smoothness variation, or structural irregularity—that define baseline rather than transient condition.

**Barrier stability tendency** — The user's established resilience or fragility of the skin barrier over time: how reliably their skin maintains equilibrium under routine stress versus how readily it destabilizes.

**Known long-term skin concerns** — Concerns the user or the platform has identified as persistent priorities: chronic dryness in specific contexts, recurring sensitivity to certain exposure classes, or enduring goals tied to baseline character. These are longitudinal concerns, not today's complaint.

**Long-term tolerance patterns** — Established patterns of what this user's skin historically tolerates, partially tolerates, or reliably reacts to—derived from accumulated outcomes and explicit recalibration, not from a single product trial.

**Baseline body-area patterns** — Persistent spatial patterns: which body areas chronically exhibit which tendencies, which zones differ from the overall baseline, and where long-term concerns concentrate. Body-area baseline is tendency mapped to anatomy, not a snapshot from the latest scan.

Together, these attributes define the platform's understanding of *this user's skin at foundation*—the context against which new evidence is interpreted and deviation is detected.

### What does not belong in Skin Profile

Architectural discipline requires explicit boundaries. The following must not be stored on the Skin Profile:

- **Today's severity** — Severity belongs to symptom objects within scan records, timestamped and traceable.
- **Current flare** — Active flares are evidence events with onset, progression, and resolution in historical records—not baseline fields.
- **One scan result** — Individual scan outcomes are immutable scan records. They inform baseline evolution; they do not replace it inline.
- **One product reaction** — Single exposure reactions are outcome and evidence objects linked to products and time. Baseline tolerance patterns emerge from many such records, not from collapsing the latest reaction into the profile.
- **Temporary irritation** — Short-lived irritation following a new product or environmental trigger is transient evidence, not baseline character.
- **Short-term routine changes** — Routine modifications are time-bounded routine objects. The Skin Profile does not hold what the user applied this week.

The governing rule: if the information describes a *moment*, an *event*, or a *recent change*, it belongs in evidence. If it describes a *tendency*, a *persistent pattern*, or a *foundational characteristic* established over time, it may belong on the Skin Profile—subject to traceability requirements below.

### Derived current state

Current skin state must be derived from Scan Records, Outcomes, Routines, and historical evidence—not overwritten inside Skin Profile. When the platform needs to answer *what is the user's skin like now*, it computes that answer from the most recent relevant evidence chain: latest scans, active symptoms, current routine context, and reported outcomes. The Skin Profile provides baseline orientation; it does not cache current truth.

This separation preserves the design principle that current state is derived from history rather than replacing it. Engines that conflate baseline with current condition lose the ability to detect deviation—to recognize that today's flare is abnormal *for this user* because it diverges from baseline and from recent trajectory. Deviation detection requires both: stable baseline on the Skin Profile, dynamic state from evidence.

### Evolution and historical traceability

Skin Profile may evolve slowly over time through explicit baseline recalibration. Baseline is not frozen at onboarding. As months of evidence accumulate, the user or the platform—through governed recalibration processes—may update tendency assessments, refine tolerance patterns, or revise long-term concern priorities. Such evolution reflects genuine shift in understanding, not automated overwrite from daily data.

Every recalibration must preserve historical traceability. Prior baseline states are not destroyed; they are superseded with reference to what changed, when, and on what evidentiary basis. A user whose sensitivity tendency is recalibrated after two years of outcomes must retain a record that earlier intelligence was framed against earlier baseline—a requirement for explainability and for Learning Layer evaluation of how baseline and predictions aligned over time.

Slow evolution with traceability distinguishes Skin Profile from evidence immutability. Scan records never change; baseline understanding may mature—but never silently, and never by absorbing transient observations without explicit recalibration.

### Support for Intelligence Engines

The Skin Profile exists to serve intelligence across the platform. Each engine below reads baseline context from this object while writing observations and conclusions to their appropriate domains—not to the Skin Profile directly.

**Input Intelligence** — Uses baseline tendencies and body-area patterns to contextualize incoming user input: interpreting severity reports, symptom selections, and scan context relative to what is normal for this user rather than generic defaults.

**Memory Engine** — Retrieves Skin Profile as part of longitudinal context assembly, linking current evidence retrieval to baseline orientation so that historical queries respect enduring characteristics alongside chronological records.

**Correlation Engine** — Compares observed patterns in evidence against baseline tendencies to identify meaningful associations: whether a product introduction correlates with deviation from established dryness or sensitivity patterns, for example.

**Prediction Engine** — Projects forward from baseline plus trajectory: predictions account for what this user's skin tends toward and how current evidence diverges from or aligns with that foundation.

**Recommendation Engine** — Frames guidance against baseline character, long-term concerns, and tolerance patterns—ensuring recommendations respect enduring context while prioritizing recent personal evidence.

**Outcome Intelligence** — Evaluates whether outcomes align with expectations set by baseline and goals: improvement relative to this user's tendency profile, not generic population norms.

**Formulation Engine** — Identifies gaps between baseline needs, long-term concerns, and what existing products satisfy—using baseline body-area patterns and tolerance history to orient formulation proposals.

In each case, the Skin Profile is a read-oriented baseline reference. Engines write evidence, outcomes, and intelligence outputs elsewhere. Baseline updates flow only through governed recalibration, preserving the object's stability and traceability over years of use.

---

## Scan Record

The Scan Record is an immutable evidence object representing a point-in-time skin observation. It captures what was observed, reported, uploaded, or structured during one scan session—a discrete moment in the user's skin journey frozen as a permanent historical record. Every scan session produces exactly one Scan Record. That record is the platform's authoritative account of what was known and captured at that moment, not a living document that evolves as understanding improves.

Scan Records sit at the foundation of the Evidence Layer. They are the primary ingress through which personal skin evidence enters the platform. Intelligence above the Evidence Layer may interpret, correlate, and reason over scan content—but it must never mutate the record itself. What was reported on a given day remains what was reported, even if the user later disagrees, if AI interpretation improves, or if baseline understanding shifts.

### Distinction from User Profile and Skin Profile

Scan Record is not the same as User Profile or Skin Profile. Each object answers a different architectural question.

The User Profile answers: *who is the user, and what long-term preferences and governance apply?* It holds identity, language preference, privacy settings, consent history, and declared long-term goals. None of this belongs inside a Scan Record except as a reference to the user to whom the scan belongs.

The Skin Profile answers: *what is the user's long-term baseline skin context?* It holds enduring tendencies, tolerance patterns, and persistent concern profiles. A scan may inform future baseline recalibration, but it does not embed baseline character inline.

The Scan Record answers: *what was observed or reported at this specific moment?* It is event-sourced evidence: timestamped, session-bound, and complete in itself. A scan from March records March's observation. It does not update when April arrives, and it does not collapse into profile fields that would erase the historical moment.

Confusing these objects breaks longitudinal integrity. Profiles orient; scans evidence. The platform needs both, separately.

### Core concepts

A Scan Record aggregates the concepts captured during one session. Each represents a dimension of what occurred—not a storage layout, but the semantic content the record must be able to express.

**Timestamp** — The point in time when the scan session occurred or was submitted. Timestamp establishes chronological position on the longitudinal timeline and enables sequencing, correlation, and outcome evaluation across time.

**Scan type** — The purpose and context of the session. Scan type orients how downstream engines interpret the record:

- **First scan** — Initial evidence capture establishing early context for the user's journey on the platform
- **Follow-up scan** — Continuation scan building on prior history, typically comparing against previous observations
- **Progress check** — Session focused on evaluating change since a prior intervention, routine period, or goal milestone
- **Product reaction check** — Session focused on assessing response following product introduction, increased frequency, or suspected exposure

Scan type is metadata about intent, not a substitute for the observations themselves.

**Body areas involved** — The anatomical or logical regions referenced during the session. Body areas link scan content to the Body Area Model, enabling spatial correlation across sessions and products.

**Symptoms reported** — Symptoms the user identified or confirmed during the session, referenced by universal internal identifiers. Symptoms on a scan are what the user reported *then*, linked to the Symptom Model—not updated when the user reports different symptoms later.

**Severity values** — Severity associated with reported symptoms at the time of capture. Severity is moment-specific; it does not propagate forward as current severity elsewhere.

**User notes** — Free-form or structured narrative the user provided during the session: context, concerns, observations in their own words. Notes are part of the evidence, preserved as submitted.

**Uploaded skin images** — Visual captures the user provided as part of the session. Images are evidence artifacts linked to the scan, with their own provenance—not standalone objects detached from session context.

**Image context** — Metadata orienting image interpretation: lighting conditions, capture angle, time since last product application, or other context the user or system associated with the image at capture time.

**Current routine snapshot reference** — Reference to the routine state active at scan time. The scan does not embed the full routine object; it references what the user was following when the observation occurred, enabling correlation between routine context and observed state.

**Current product usage reference** — Reference to products in active use at scan time. Like routine, this is a snapshot reference—not catalog truth, not long-term usage history, but what was relevant *at this moment*.

**Environmental or lifestyle context** — Contextual factors the user reported or that were associated with the session: travel, climate change, stress, sleep, menstrual cycle phase, or other factors that may orient interpretation. Context is session-bound evidence, not permanent profile state.

**AI-generated observations** — Structured observations produced by AI assistance during or after capture: detected patterns, suggested symptom alignments, or interpretive annotations. AI observations are part of the scan record as captured—not retroactively replaced when models change. They represent what the platform interpreted *at processing time*, with confidence expressed separately.

**Confidence snapshot** — The confidence level associated with AI-generated or structured observations at the time of capture. Confidence is frozen with the record so that later intelligence can evaluate how prior interpretations aligned with subsequent evidence.

**Consent / processing context** — The consent and processing scope applicable when the scan was captured: what processing was authorized, what data categories were included, and any session-specific privacy constraints. This supports governance traceability without duplicating full consent history from User Profile.

**Source / provenance** — How the scan entered the platform: user-initiated capture, prompted follow-up, scheduled check, or other origin. Provenance establishes authenticity and supports audit of the evidence chain.

Together, these concepts define a complete point-in-time evidence package—sufficient for downstream engines to reason without re-interviewing the user about a past moment.

### Immutability and corrections

Scan Record should be immutable. Once created and committed, the record is not edited, overwritten, or silently amended. Immutability is not a storage preference; it is an architectural guarantee that personal evidence remains trustworthy over years.

When corrections are needed—user disputes a symptom selection, clarifies a note, or retracts an image—corrections create new correction records or superseding notes that reference the original scan. The original Scan Record remains intact as the account of what was captured at submission. The correction record documents what changed in understanding and when. This pattern preserves both historical fidelity and current clarity without erasing the past.

Engines and presentation layers may display corrected interpretation alongside original capture, but the original record must always remain retrievable and traceable.

### What does not belong in Scan Record

Explicit exclusion maintains object purity:

- **Permanent user preferences** — Language, units, communication preferences belong on User Profile.
- **Long-term skin baseline** — Tendencies, tolerance patterns, and baseline concerns belong on Skin Profile.
- **Product catalog truth** — Canonical product identity, verified composition, and catalog enrichment belong in Product Intelligence and product model objects—not duplicated as authoritative catalog state within a scan.
- **Verified ingredient truth** — Ingredient classifications and domain knowledge belong in Ingredient Intelligence—not embedded as permanent truth inside session evidence.
- **Final product recommendation history** — Recommendations are intelligence outputs with their own objects, evidence chains, and lifecycle. A scan may trigger or inform a recommendation; it does not contain the recommendation itself.
- **Long-term outcome conclusions** — Evaluations of change over time belong in Outcome objects, not in the scan that captured a single moment.

The Scan Record captures *what was observed*. Other objects capture *what the platform knows*, *what it recommends*, and *what resulted over time*.

### Scan Record versus Outcome

Scan Record and Outcome serve distinct roles and must not be conflated.

The Scan Record captures what is observed at one moment. It is a snapshot: symptoms reported, severity noted, images uploaded, context declared. It answers *what was the state or report at time T?*

The Outcome evaluates what changed over time or after an intervention. It connects prior state to subsequent state, user experience to action taken, expectation to result. It answers *what happened as a consequence—or what changed between periods?*

A product reaction check scan captures the moment of observation: redness reported, severity noted, product reference attached. An Outcome evaluates whether the reaction resolved, worsened, or stabilized over the following days and whether that aligns with prior predictions. Scans supply evidence; Outcomes supply evaluation. Multiple scans may inform one Outcome; one scan alone is not an Outcome.

### Support across the platform

Scan Records are foundational to personal evidence and intelligence across the architecture.

**Evidence Layer** — Scan Records are primary evidence objects: the canonical capture of user observation at a point in time. All higher layers depend on scan fidelity.

**Memory Engine** — Retrieves, indexes, and assembles scan history for longitudinal queries. Memory organizes scans chronologically and contextually without altering them.

**Body Area Model** — Scans reference body areas; repeated scans across areas build spatial evidence patterns linked to the universal body area classification.

**Symptom Model** — Scans reference symptoms by internal identifier; symptom history is the aggregate of symptom references across scans over time.

**Correlation Engine** — Links scan observations to routines, products, and prior scans to identify associations: symptom emergence following product introduction, severity patterns across body areas, temporal clustering.

**Prediction Engine** — Uses scan sequences and trajectory to project likely near-term states based on observed patterns plus baseline context.

**Recommendation Engine** — Grounds guidance in recent and relevant scan evidence, ensuring recommendations cite observable state—not profile assumptions alone.

**Outcome Intelligence** — Compares scan evidence before and after interventions, evaluating whether observed change matches expected or reported results.

**Personal Evidence Base** — Scan Records are the core building blocks of the personal evidence base: the accumulated, immutable record of what this user observed and reported across their entire skin journey.

Every scan is a moment preserved. Accumulated scans are the history from which SkinIntel derives everything else—always traceable, never overwritten, and permanently accountable to the user who captured them.

---

## Body Area Model

The Body Area Model is the universal spatial classification system used across SkinIntel. It defines how the platform names, organizes, and references *where on the body* any piece of knowledge applies—without encoding what was observed there, how severe it was, or what should be done about it. Every scan, symptom reference, product application, image, outcome, and recommendation can be linked to one or more body areas through this model. It is the shared anatomical vocabulary that allows intelligence layers to reason spatially: correlating concerns across regions, comparing progress zone by zone, and targeting guidance to the locations where it matters.

The Body Area Model is a conceptual knowledge object. It describes classification semantics and hierarchical relationships—not storage fields, API payloads, or UI widget definitions. How body areas are persisted, indexed, or rendered is downstream implementation. The model itself must remain stable, language-independent, and intelligible to every Intelligence Engine regardless of technology or provider.

### Universal spatial classification

SkinIntel treats the body as a structured spatial domain, not an unstructured list of user-entered labels. The Body Area Model provides the canonical set of regions and sub-regions through which all location-aware knowledge flows. When a user reports dryness on the cheeks, applies a product to the forehead, or uploads an image of the jawline, each action references the same classification system—not ad hoc text that varies by session, language, or capture method.

Universal classification eliminates fragmentation. Without it, one layer might record "left cheek," another "cheek_L," and a third a localized string in the user's language. Correlation across scans, products, and outcomes becomes unreliable. The Body Area Model ensures that *face.cheeks.left* means the same thing everywhere in the platform: in Input Intelligence when the user selects a region, in Memory when history is assembled, in Correlation when patterns are detected, and in Recommendation when guidance is scoped to a zone.

Spatial classification is orthogonal to clinical or cosmetic taxonomy. The model does not diagnose, stage, or severity-score. It answers a single question: *where?*

### Language independence and internal identifiers

The Body Area Model must be language-independent. User-facing labels—"Cheeks," "Wangen," "Joues"—are presentation concerns resolved at the interface layer through localization. The model itself is defined by universal internal identifiers: stable, immutable tokens that never change when copy is translated, marketing language evolves, or a new locale is added.

Internal identifiers use a consistent hierarchical notation. A major region is referenced by a root token such as `face` or `scalp`. Sub-regions extend with dot-separated segments: `face.cheeks`, `face.forehead`. Optional finer granularity continues the chain: `face.cheeks.left`, `face.forehead.upper`. These identifiers are the contract between layers. Engines read and write them; localization maps them to human-readable strings for the user.

Language independence protects longitudinal integrity. A user's five-year history of scans linked to `face.around_eyes` remains coherent even if the app UI language changes three times. Intelligence outputs cite internal identifiers in evidence chains; presentation layers translate at read time. No intelligence layer should depend on locale-specific strings as authoritative keys.

### Linking knowledge to location

The Body Area Model exists so that every location-relevant object in the platform can declare *where it applies* through a common reference surface.

A Scan Record references body areas involved in the session—one region or many. Symptom references attach to body areas: redness on the cheeks is not redness in the abstract; it is redness linked to `face.cheeks` (or finer identifiers when precision warrants). Product usage records declare application areas: a serum applied only to the forehead is linked accordingly, enabling exposure history by zone. Uploaded images associate with the regions they depict, supporting spatial evidence assembly and future visual comparison. Outcomes evaluate change with regional scope: improvement on the jawline versus stability on the forehead are distinct evaluations tied to distinct areas. Recommendations target regions: guidance to reduce actives on irritated zones references the same identifiers the user and evidence already use.

This linking is many-to-many where the domain requires it. A single scan may involve multiple body areas. A single product may apply to several regions over time. A single outcome may reference change across multiple zones. The Body Area Model supplies the vocabulary; other objects supply the semantics of what happened there.

### Hierarchical classification

Body areas are organized in a hierarchy of increasing spatial precision. Not every use case requires the deepest level; the model supports coarse and fine reference as context demands.

**Level 1 — Major body region**

The root of the hierarchy. Major regions partition the body into top-level zones used for broad classification, navigation, and aggregate analysis.

Examples:

- `face`
- `scalp`
- `neck`
- `chest`
- `back`
- `arms`
- `hands`
- `legs`
- `feet`
- `whole_body`

Level 1 identifiers suffice when precision to sub-region is unnecessary—whole-body scans, general product use, or platform-level defaults that apply broadly.

**Level 2 — Sub-region**

Sub-regions refine a major region into anatomically meaningful subdivisions. Most facial and targeted skincare intelligence operates at this level or below.

Examples:

- `face.forehead`
- `face.cheeks`
- `face.nose`
- `face.chin`
- `face.jawline`
- `face.around_eyes`
- `face.around_mouth`

Level 2 is the typical default for symptom reporting, product application scoping, and recommendation targeting on the face and other structured regions.

**Level 3 — Optional detailed location**

Level 3 adds lateral, vertical, or other fine distinctions when the user or capture context requires them. Use is optional: many sessions resolve adequately at Level 2.

Examples:

- `face.cheeks.left`
- `face.cheeks.right`
- `face.forehead.upper`
- `face.forehead.lower`

Level 3 supports asymmetric concerns—irritation on one cheek but not the other—and enables future capabilities such as regional heatmaps and side-by-side progress visualization without inventing a parallel classification scheme.

The hierarchy is strict: every Level 2 identifier belongs to exactly one Level 1 parent; every Level 3 identifier belongs to exactly one Level 2 parent. Engines traverse upward for aggregation (both cheeks roll up to `face.cheeks` and then to `face`) and downward for specificity when evidence or guidance requires it.

### Capabilities the model must support

The Body Area Model is designed to enable current platform behavior and planned spatial intelligence. It must support:

- **Multi-area scans** — A single scan session may reference multiple body areas simultaneously, reflecting how users actually observe and report skin state.
- **Region-specific symptoms** — Symptom references bind to body areas so that the same symptom type on different regions remains distinguishable in history and correlation.
- **Product application areas** — Usage and exposure history scoped to where products are applied, not merely which products exist in a routine.
- **Image-to-region linking** — Visual evidence associated with the anatomical regions depicted, enabling spatial retrieval and comparison.
- **Outcome tracking by region** — Evaluations of change scoped to the zones where improvement, stability, or reaction was observed or expected.
- **Recommendation targeting by region** — Guidance that applies to specific areas—reduce frequency here, avoid actives there—using the same identifiers as evidence.
- **Future heatmaps** — Aggregate spatial intensity of symptoms, concerns, or product exposure over time, built on consistent regional keys.
- **Future progress visualization** — Timeline and visual comparison of change per region, requiring stable identifiers across months and years.

These capabilities depend on a single, durable classification system—not per-feature region lists that diverge over time.

### What does not belong in the Body Area Model

Architectural discipline requires explicit boundaries. The Body Area Model provides location vocabulary only. The following must not be embedded in body area definitions:

- **Symptoms** — What is observed belongs in symptom references on Scan Records and related evidence objects, linked *to* body areas—not stored as properties of the area itself.
- **Severity** — Severity is moment-specific and symptom-bound; it is not an attribute of a region in the classification model.
- **Diagnosis** — Clinical or platform diagnostic conclusions are intelligence outputs with their own objects and evidence chains.
- **Product recommendations** — What to use or avoid is recommendation domain knowledge, targeted *at* regions via reference—not part of the spatial taxonomy.
- **Temporary observations** — Point-in-time reports belong in immutable scan and evidence records.
- **User notes** — Narrative context is session evidence, linked to areas where relevant but not constitutive of the area model.

If information describes *what was seen*, *how bad it was*, *what it means*, or *what to do*, it belongs elsewhere and references body areas by identifier. The model answers *where*, not *what* or *so what*.

### Location vocabulary only

The Body Area Model is deliberately narrow in scope. It is the platform's atlas: a stable, hierarchical, language-independent map of body regions through which all spatially scoped knowledge is indexed and connected. It does not interpret evidence, predict outcomes, or prescribe care. It ensures that when any layer asks "where on the body does this apply?" the answer is unambiguous, consistent, and durable across the full Personal Skin Intelligence journey.

Intelligence Engines consume body area identifiers as spatial context. Input Intelligence normalizes user region selection into canonical identifiers. Memory Engine assembles history by area. Correlation Engine detects spatial patterns—recurring concerns on the jawline, product exposure concentrated on the forehead. Prediction Engine projects regional trajectories. Recommendation Engine scopes guidance. Outcome Intelligence evaluates change by zone. Visualization and analytics layers, present and future, aggregate on the same keys.

By confining the Body Area Model to location vocabulary, SkinIntel preserves separation of concerns: spatial structure remains stable while symptoms, products, outcomes, and recommendations evolve in their own domains—always linkable to the same universal map of the body.

---

## Symptom Model

The Symptom Model is the universal classification system for what the user reports, observes, or confirms about skin presentation. It defines how the platform names, organizes, and references *what is being seen or felt* on the skin—without encoding where on the body it occurs, how severe it is at a given moment, what it means clinically, or what should be done about it. Every Scan Record, body area reference, Outcome evaluation, Recommendation, and Prediction can reference symptoms through this model using the same canonical vocabulary. It is the shared presentation vocabulary that allows intelligence layers to reason consistently across sessions, regions, products, and time.

The Symptom Model is a conceptual knowledge object. It describes classification semantics and identifier stability—not storage fields, service contracts, or capture interface design. How symptoms are persisted, validated, or displayed is downstream implementation. The model itself must remain stable, language-independent, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Universal symptom classification

SkinIntel treats skin presentation as a structured domain of observable signals, not an unstructured stream of user-typed complaints. The Symptom Model provides the canonical set of presentation types through which all symptom-aware knowledge flows. When a user reports redness, confirms dryness, or accepts an AI-suggested alignment with flaking, each action references the same classification system—not session-specific wording that varies by language, phrasing, or capture method.

Universal classification eliminates semantic drift. Without it, one layer might record "my skin feels tight," another "dehydration," and a third a localized string describing the same sensation in different terms. Correlation across scans, body areas, products, and outcomes becomes unreliable. The Symptom Model ensures that `redness` means the same presentation signal everywhere in the platform: in Input Intelligence when the user selects or confirms a symptom, in Memory when history is assembled, in Correlation when patterns are detected, and in Recommendation when guidance addresses specific presentation types.

Symptom classification answers a single question: *what is being observed or reported?* Location belongs to the Body Area Model. Severity at a moment belongs on evidence records. Change over time belongs to the Outcome Model. Action belongs to the Recommendation Model. The Symptom Model holds the vocabulary for presentation only.

### Language independence and internal identifiers

The Symptom Model must be language-independent. User-facing labels—"Redness," "Rötung," "Rougeur"—are presentation concerns resolved at the interface layer through localization. The model itself is defined by universal internal identifiers: stable, immutable tokens that never change when copy is translated, regulatory language evolves, or a new locale is added.

Internal identifiers use consistent, flat or hierarchically extensible tokens that represent presentation types without embedding locale, severity, or body location. Examples of canonical symptom identifiers include:

- `redness`
- `dryness`
- `oiliness`
- `itching`
- `burning`
- `stinging`
- `flaking`
- `tightness`
- `blemishes`
- `blackheads`
- `whiteheads`
- `texture_roughness`
- `uneven_tone`
- `hyperpigmentation`
- `visible_pores`
- `sensitivity`
- `dullness`

These identifiers are the contract between layers. Engines read and write them; localization maps them to human-readable strings for the user. A user's three-year history of `redness` linked to cheek scans remains coherent even if the app UI language changes. Intelligence outputs cite internal identifiers in evidence chains; presentation layers translate at read time. No intelligence layer should depend on locale-specific strings or free-text descriptions as authoritative symptom keys.

Traceability requires that every symptom reference in the platform resolves to a defined identifier in this model—or to an explicitly governed extension approved through architecture review. Ad hoc symptom strings are not authoritative classification.

### Symptoms are not diagnoses

Architectural clarity depends on a firm boundary between presentation and clinical conclusion. Symptoms in the SkinIntel model are user-observable or platform-observable cosmetic signals: what the user sees, feels, or confirms about their skin surface and immediate sensory experience. They describe presentation, not pathology.

A user who reports `redness` on the cheeks is reporting an observable signal. That is symptom vocabulary. Assigning a disease label, clinical diagnosis, or treatment indication is outside the Symptom Model. The platform may assist interpretation elsewhere—with appropriate governance, consent, and scope—but the Symptom Model itself does not encode diagnostic taxonomy, ICD categories, or medical condition names.

This separation protects the platform's scope as Personal Skin Intelligence focused on personal evidence and cosmetic presentation. It keeps symptom history legible to users as *what I observed*, not *what the platform decided I have*. It allows intelligence layers to correlate presentation patterns with products, routines, and outcomes without conflating observable signals with clinical claims.

When AI assistance suggests symptom alignment during capture, the suggested match references Symptom Model identifiers. The suggestion is an observation aid, not a diagnosis. The user's confirmation or correction remains evidence on the Scan Record; the identifier remains presentation vocabulary.

### Linking knowledge to symptoms

The Symptom Model exists so that every presentation-relevant object in the platform can declare *what signals apply* through a common reference surface.

Scan Records reference symptoms reported or confirmed during the session—one symptom or many. Symptom references bind to body areas through separate linkage: `redness` on `face.cheeks` is a distinct evidence tuple from `redness` on `face.nose` or `dryness` on `face.cheeks`. The Symptom Model supplies *what*; the Body Area Model supplies *where*; the Scan Record binds them at capture time.

Outcome evaluations reference symptoms when assessing change: whether `blemishes` improved, whether `dryness` stabilized, whether `stinging` resolved after a routine adjustment. Predictions reference symptoms when projecting likely near-term presentation trajectories based on historical patterns. Recommendations reference symptoms when targeting guidance: address `hyperpigmentation` concerns, reduce actives when `sensitivity` is elevated in recent evidence.

Correlation Engine links symptom references across scans, products, ingredients, and routines to identify associations—symptom emergence following product introduction, recurring `flaking` during seasonal transitions, `oiliness` patterns aligned with routine changes. Memory Engine assembles symptom history chronologically and spatially without altering the identifiers themselves.

This linking is many-to-many where the domain requires it. A single scan may report multiple symptoms. A single symptom type may appear across multiple body areas in one session. A single product exposure history may be evaluated against multiple symptom trajectories over time. The Symptom Model supplies the vocabulary; other objects supply severity, duration, location, interpretation, and action.

### Capabilities the model must support

The Symptom Model is designed to enable current platform behavior and planned presentation intelligence. It must support:

- **Multi-symptom scans** — A single scan session may reference multiple symptoms simultaneously, reflecting how users actually observe and report skin state.
- **Symptom-to-body-area linking** — Each symptom reference can be associated with one or more body areas, enabling spatially precise evidence without embedding location in the symptom identifier itself.
- **Severity scoring** — Symptom identifiers are severity-agnostic; severity values attach to symptom references on evidence records at capture time, not as properties of the classification token.
- **Duration tracking** — Symptom history across scans enables inference of persistence, episodic recurrence, and duration patterns linked by identifier over time.
- **Progress tracking** — Longitudinal symptom references support evaluation of whether presentation types increase, decrease, or stabilize across sessions.
- **Outcome comparison** — Outcome objects compare symptom states before and after interventions by referencing the same identifiers on both sides of the evaluation.
- **Correlation with products** — Product exposure history can be analyzed against symptom emergence, escalation, or resolution using consistent presentation keys.
- **Correlation with ingredients** — Ingredient exposure aggregates can be linked to symptom patterns when composition knowledge and usage history align.
- **Correlation with routines** — Routine structure and timing can be evaluated against symptom trajectories without ambiguous presentation labels.
- **Recommendation targeting** — Guidance can address specific presentation types—hydration for `dryness`, gentler actives when recent `sensitivity` evidence accumulates—using the same identifiers as scans.
- **Future trend visualization** — Timeline and aggregate views of symptom frequency, co-occurrence, and regional intensity over months and years, built on stable presentation keys.

These capabilities depend on a single, durable classification system—not per-feature symptom lists that diverge as the platform grows.

### What does not belong in the Symptom Model

Architectural discipline requires explicit boundaries. The Symptom Model provides symptom vocabulary only. The following must not be embedded in symptom definitions:

- **Diagnosis** — Clinical or platform diagnostic conclusions are intelligence outputs with their own objects, governance, and evidence chains—not presentation identifiers.
- **Disease labels** — Medical condition names, syndrome classifications, and pathology taxonomy belong outside cosmetic presentation vocabulary.
- **Treatment claims** — Assertions about what will cure, treat, or medically address a condition are recommendation or formulation domain—not symptom classification.
- **Product recommendations** — What to use or avoid is recommendation domain knowledge, targeted in response to symptoms—not part of the presentation taxonomy.
- **Severity values** — Severity is moment-specific and evidence-bound; it attaches to symptom references on Scan Records, not to the identifier `redness` itself.
- **Temporary notes** — Point-in-time narrative context belongs in session evidence as user notes, linked to symptom references where relevant but not constitutive of the model.
- **User free-text descriptions** — Raw user language is input to be normalized into canonical identifiers; it is not an authoritative substitute for the Symptom Model.

If information describes *how bad it is*, *what it means clinically*, *what to do*, or *what the user typed in their own words*, it belongs elsewhere and references symptoms by identifier. The model answers *what presentation signal*, not *how much*, *why*, or *what next*.

### Symptom vocabulary only

The Symptom Model is deliberately narrow in scope. It is the platform's presentation lexicon: a stable, language-independent catalog of observable skin signals through which all presentation-scoped knowledge is indexed and connected. It does not locate concerns on the body, score severity, evaluate change, diagnose conditions, or prescribe care.

The division of responsibility across models is explicit and must be preserved:

- **Symptom Model** — *What* is being observed or reported.
- **Body Area Model** — *Where* it is observed.
- **Outcome Model** — *How* presentation changed over time (defined later in this document).
- **Recommendation Model** — *What* to do next (defined later in this document).

Intelligence Engines consume symptom identifiers as presentation context. Input Intelligence normalizes user selection and confirmation into canonical identifiers. Memory Engine assembles symptom history across time and body areas. Correlation Engine detects co-occurrence and exposure associations. Prediction Engine projects symptom trajectories from accumulated patterns. Recommendation Engine scopes guidance to presentation types evidenced in personal history. Outcome Intelligence evaluates change by referencing the same identifiers before and after interventions.

By confining the Symptom Model to symptom vocabulary, SkinIntel preserves separation of concerns: presentation classification remains stable while severity, location bindings, outcomes, and recommendations evolve in their own domains—always linkable through traceable, explainable references to the same universal catalog of what the user and platform observe about the skin.

---

## Product Model

The Product Model defines how SkinIntel understands cosmetic products as knowledge objects—not merely as catalog entries awaiting lookup. A product in this model is a durable, traceable entity that the platform can connect to user usage, ingredient composition, routine placement, outcomes, recommendations, and personal evidence across the full skin journey. It is the shared product vocabulary through which every layer answers *what product is this*, *what does the platform know about it*, and *how does it relate to this user's history*—without collapsing identity, usage, composition, or intelligence conclusions into a single undifferentiated record.

The Product Model is a conceptual knowledge object. It describes product identity semantics, verification posture, and relationship surfaces—not storage fields, commerce integrations, or capture interface design. How products are persisted, searched, or enriched is downstream implementation. The model itself must remain stable, language-independent where possible, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Products as traceable knowledge objects

A product is not only a name or brand. Names change by market, language, packaging revision, and retailer listing. Brand marketing copy is not product truth. In SkinIntel, a product is an object the platform can follow through time: linked to what the user applied, when they applied it, where on the body it was used, what ingredients it contains, what outcomes followed, and what recommendations referenced it.

This traceability is essential for Personal Skin Intelligence. Correlation Engine cannot associate symptom emergence with product introduction if the product exists only as an ephemeral search result. Outcome Intelligence cannot evaluate whether a moisturizer helped if the platform cannot reconcile the user's usage record with a stable product identity across reformulations. Recommendation Engine cannot avoid previously unsuccessful alternatives if similar products are not connected through shared composition and history.

The Product Model supplies identity and product knowledge. Usage logs, severity values, outcome conclusions, and recommendation text live in their appropriate domains and reference products by identifier—not embed intelligence inside the product object itself.

### Verified and provisional products

The Product Model must support both verified and provisional products. Real users introduce products the platform has never seen. The architecture must accommodate incomplete knowledge without blocking evidence capture or personal history accumulation.

A **verified product** is a product whose identity and ingredient composition have been confirmed through trusted sources or admin verification. Verification establishes that the platform's representation of the product—name alignment, category, type, and linked composition—is authoritative enough for high-confidence intelligence: ingredient exposure analysis, cross-user pattern learning where permitted, and recommendation grounding against known formulation content.

A **provisional product** is a user-added or AI/OCR-assisted product that may be incomplete, uncertain, or awaiting verification. Provisional status is not a failure state; it is an honest representation of knowledge quality. The user photographed a label, pasted an INCI list, or typed a name from memory—the platform captures the reference, attaches available composition signals with appropriate confidence, and preserves the usage relationship. Intelligence layers operate on provisional products with explicit confidence boundaries; verification may upgrade the object later without breaking historical links.

Verification status and source confidence are attributes of product knowledge—not substitutes for usage records or outcomes. A verified product can still produce a negative outcome for a given user; a provisional product can still support valuable personal correlation when composition is partial but usage is clear.

### Reference paths without catalog dependency

The platform must not stop if a product is not already in the product database. Personal evidence capture is more important than catalog completeness. Users must be able to reference products through multiple ingress paths, each normalizing toward the same Product Model object:

- **Existing product catalog** — Selection from verified or known catalog entries when available.
- **Search** — Discovery against catalog and indexed product knowledge, resolving to catalog identity when match confidence warrants.
- **Manual entry** — User-provided name, brand, and context when catalog match is unavailable or incorrect.
- **Product photo** — Visual capture of packaging for identity assistance and downstream enrichment.
- **OCR label extraction** — Structured extraction from photographed labels, treated as input signal—not authoritative truth until verified.
- **Pasted INCI list** — User-supplied composition text linked to provisional or verified product identity with explicit provenance.
- **Routine history** — Re-reference of products already present in the user's routine context.
- **Previous scan history** — Re-use of products referenced in prior sessions without re-entry friction.

Each path produces or resolves a Product Model reference. The path explains provenance; the object provides continuity. A product first entered manually and later matched to catalog identity should remain one traceable thread in the user's history, not a disconnected duplicate.

### Language independence and identity separation

The Product Model must be language-independent where possible. Product identity separates internal identifiers from user-facing display names. Internal identifiers are stable tokens—the contract between Intelligence Engines. Display names, localized marketing titles, and retailer-specific listings are presentation and enrichment layers mapped to that identity.

Product names vary by country, language, packaging, reformulation, retailer, and marketing copy. The same formulation may appear under different commercial names in different markets. A reformulation may retain a familiar name while composition changes materially. Without identifier separation, longitudinal history fragments: the user appears to have used three different products when they believe they used one, or one product when composition shifted beneath a stable brand line.

The model accommodates this reality through identity that persists across display variation, explicit formulation version linkage where known, and verification that can distinguish rename from reformulation. Localization applies to display; intelligence references internal identity and composition links.

### Capabilities the model must support

The Product Model is designed to enable current platform behavior and planned product intelligence. It must support:

- **Brand identity** — Stable reference to the commercial brand entity associated with the product, distinct from product line and display name variation.
- **Product display name** — User-facing and catalog-facing names as presentation attributes, not authoritative keys.
- **Product category** — High-level classification orienting intelligence scope: cleanser, moisturizer, serum, sunscreen, treatment, and comparable cosmetic categories.
- **Product type** — Finer-grained type distinction within category where relevant to usage and recommendation context.
- **Intended cosmetic use** — Declared or inferred cosmetic purpose: hydration, exfoliation, sun protection, barrier support—orienting interpretation without medical claims.
- **Formulation version** — Linkage to known formulation revisions when composition or packaging change is material to exposure history.
- **Ingredient composition link** — Reference to Ingredient Model knowledge: what the product contains, verified or provisional, with confidence appropriate to source.
- **Verification status** — Whether identity and composition are verified, provisional, or pending review.
- **Source confidence** — Confidence in identity and composition derived from catalog, OCR, user entry, or admin confirmation—not a substitute for outcome evaluation.
- **User ownership or usage relationship** — The platform's understanding that this user uses or has used this product, expressed through related usage objects rather than embedded personal logs in the product definition itself.
- **Routine placement** — Reference surface linking product to Routine Model placement: step order, time of day, application context.
- **Frequency of use** — Expressed through related usage objects: how often the user applies the product over a defined period.
- **Start and stop dates through related usage objects** — Temporal bounds of usage captured in usage relationships, enabling before/after correlation without storing session logs on the product object.
- **Outcome correlation** — Reference surface enabling Outcome objects to evaluate change in context of product introduction, continuation, or discontinuation.
- **Recommendation targeting** — Reference surface enabling Recommendation objects to suggest, avoid, or replace specific products based on personal evidence.
- **Future product comparison** — Stable identity enabling side-by-side comparison of similar products, alternatives, and substitutes across composition and personal history.
- **Future formulation gap analysis** — Reference surface for Formulation Engine to identify unmet needs relative to what existing products in the user's history provide.

These capabilities depend on treating the product as a first-class knowledge object with clear boundaries—not as a catalog row augmented with user notes.

### Product Intelligence questions

The Product Model enables Product Intelligence to answer questions central to Personal Skin Intelligence:

- **What the user is using** — Which products are active in the user's current context, verified or provisional.
- **When the user started using it** — Temporal onset of usage through related usage objects, anchoring correlation timelines.
- **Where it is applied** — Application areas through Body Area Model linkage on usage records, not embedded in product identity.
- **How often it is used** — Frequency patterns through usage relationships across routines and sessions.
- **Which symptoms changed after use** — Symptom trajectory reference points before and after product introduction or change, assembled from Scan Records and Outcome objects—not stored as conclusions on the product.
- **Which ingredients may be relevant** — Composition link enabling Ingredient Intelligence to evaluate exposure in context of symptom and outcome patterns.
- **Whether the product helped, did nothing, or worsened a concern** — Outcome evaluation linked to product usage period, expressed in Outcome Model objects with evidence chains.
- **Whether similar products were previously unsuccessful** — Identity and composition linkage enabling comparison against prior products the user discontinued after negative outcomes.

Product Intelligence reads product identity and product knowledge from this model. It writes usage evidence, outcomes, and recommendations elsewhere. The Product Model orients; it does not conclude.

### What does not belong in the Product Model

Architectural discipline requires explicit boundaries. The Product Model is product identity and product knowledge only. The following must not be embedded in product definitions as authoritative content:

- **Personal usage logs** — Session-by-session application records belong in usage and routine evidence objects linked to the product.
- **Symptom severity values** — Severity is moment-specific on Scan Records, linked to symptoms and body areas—not attributes of the product object.
- **Outcome conclusions** — Whether a product helped or harmed belongs in Outcome objects with traceable evidence chains.
- **Recommendation text** — Guidance language belongs in Recommendation objects targeted at or referencing products—not inside product knowledge.
- **Medical claims** — Diagnostic or therapeutic assertions are outside cosmetic product knowledge scope.
- **Marketing claims treated as facts** — Brand promises and advertising copy are not verified composition or efficacy truth.
- **Raw OCR text as authoritative truth** — OCR output is extraction input with provenance and confidence, subject to verification—not canonical product definition.
- **Unverified ingredient assumptions** — Inferred composition without source confidence must not present as verified ingredient truth.
- **Purchase or webshop logic** — Commerce transaction mechanics are outside intelligence product knowledge.
- **Pricing as core intelligence** — Price is commercial context, not personal skin intelligence foundation.
- **Affiliate logic** — Referral and commission mechanics are presentation and commerce concerns, not product model semantics.

If information describes *how the user used it*, *how bad symptoms were*, *what changed*, *what to do next*, or *what the retailer charges*, it belongs elsewhere and references the product by identifier. The model answers *what product this is* and *what the platform knows about its identity and composition*, not *what happened when the user applied it*.

### Product identity and product knowledge only

The Product Model is deliberately scoped. It is the platform's product registry and knowledge anchor: stable identity, verification posture, category and type orientation, composition linkage, and reference surfaces for usage, routine, outcome, and recommendation relationships. It does not log applications, score symptoms, evaluate results, or prescribe next steps.

The division of responsibility across models is explicit and must be preserved:

- **Product Model** — *What* product exists and what product knowledge the platform holds.
- **Ingredient Model** — *What* it contains (defined later in this document).
- **Routine Model** — *How* the user uses it (defined later in this document).
- **Outcome Model** — *What* changed after use (defined later in this document).
- **Recommendation Model** — *What* to do next (defined later in this document).

Intelligence Engines consume product identifiers as identity context. Input Intelligence normalizes user product reference from catalog, search, manual entry, photo, or pasted composition into Product Model objects—verified or provisional. Product Intelligence enriches identity and composition linkage. Memory Engine assembles product history across usage periods. Correlation Engine links product introduction and exposure to symptom and outcome patterns. Recommendation Engine targets, avoids, or substitutes products based on personal evidence. Formulation Engine identifies gaps relative to products the user already uses or has used.

By confining the Product Model to product identity and product knowledge, SkinIntel preserves separation of concerns: product definitions remain stable and verifiable while usage, composition detail, routines, outcomes, and recommendations evolve in their own domains—always linkable through traceable, explainable references to the same universal understanding of what the user puts on their skin.

---

## Ingredient Model

The Ingredient Model defines how SkinIntel understands cosmetic ingredients as stable knowledge objects. It is the platform's normalized vocabulary for composition: the layer that transforms label text, INCI strings, OCR fragments, and user input into durable, language-independent ingredient identity the Intelligence Engine can reason over consistently. An ingredient in this model is not a line item on a product label—it is a traceable knowledge object that connects products, formulations, routines, symptoms, outcomes, recommendations, and personal evidence across the full skin journey.

The Ingredient Model is a conceptual knowledge object. It describes ingredient identity semantics, normalization rules, and general cosmetic knowledge surfaces—not storage fields, parsing pipelines, or enrichment service design. How ingredients are extracted, matched, or indexed is downstream implementation. The model itself must remain stable, language-independent, neutral, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Ingredients as normalized knowledge objects

Ingredients are not just text strings from INCI lists. A label may read "Aqua," "Water," "Eau," or a partially OCR-corrupted variant of the same entry. Retailer pages may use trade names. User-pasted composition may omit accents, invert word order, or split compound entries incorrectly. If the platform treats each string as a distinct entity, exposure history fragments, correlation fails, and intelligence cannot answer whether the user has encountered niacinamide three times across five products or three different substances.

The Ingredient Model normalizes these variations into canonical identity. A normalized ingredient is a language-independent knowledge object with a stable internal identifier, linked display and alias forms, and optional general cosmetic knowledge—function, category, relevance contexts—that Ingredient Intelligence applies with appropriate confidence. Products reference ingredients through composition links; usage and routines reference exposure through product relationships; outcomes and recommendations reference ingredients when evaluating or guiding exposure—not by embedding personal conclusions inside the ingredient definition.

This normalization is essential for Personal Skin Intelligence. Correlation Engine cannot link recurring stinging to a specific active if each product stores composition as opaque text. Recommendation Engine cannot suggest avoiding a previously problematic exposure if the platform cannot reconcile alias spellings across the user's history. Ingredient Model supplies identity and general knowledge; personal interpretation lives elsewhere.

### INCI, aliases, and normalization

The Ingredient Model must support INCI names, aliases, spelling variations, trade names where appropriate, and normalization into canonical identity. INCI nomenclature is the primary international reference for cosmetic labeling, but real-world inputs rarely arrive as clean INCI alone.

The same ingredient may appear under different names, formats, or spellings across labels, regions, user input, OCR extraction, and retailer pages. Examples include internationalized names, hyphenation differences, parenthetical qualifiers, combined INCI entries that resolve to multiple canonical ingredients, and trade or marketing names that map to established cosmetic actives. The model must absorb this variation without losing identity integrity.

Architectural discipline requires distinguishing layers of representation:

- **Canonical ingredient identity** — The stable internal identifier and authoritative normalized form that all intelligence layers reference.
- **Display names** — User-facing and locale-appropriate presentation labels mapped to canonical identity, not authoritative keys.
- **Aliases** — Known alternative names, spellings, and recognized trade names that normalize to the same canonical ingredient.
- **Extracted raw text** — Verbatim strings from OCR, paste, or label capture—input with provenance, never final truth until matched and confidence-scored.
- **Uncertain matches** — Provisional linkage between raw text and canonical identity when match confidence is below verification threshold; explicit uncertainty preserved.
- **Verified matches** — Confirmed linkage between extracted or declared text and canonical identity through trusted sources, admin review, or high-confidence automated normalization.

Normalization resolves toward canonical identity. Raw text and uncertain matches remain traceable in the evidence chain so users and auditors can see what was extracted, what was inferred, and what was verified—without polluting canonical definitions with unverified strings.

### Capabilities the model must support

The Ingredient Model is designed to enable current platform behavior and planned composition intelligence. It must support:

- **Canonical internal identifier** — Stable token representing normalized ingredient identity across all layers and locales.
- **INCI name** — Primary INCI-aligned reference name associated with canonical identity.
- **Common display name** — Widely recognized presentation name for user-facing contexts, localized separately from identity.
- **Aliases and spelling variants** — Mapped alternative forms that normalize to the same canonical ingredient.
- **Ingredient category** — High-level classification: humectant, emollient, preservative, active, fragrance component, UV filter, and comparable taxonomy orienting intelligence scope.
- **Cosmetic function** — General role in formulation context: hydration support, barrier reinforcement, exfoliation, antimicrobial preservation, UV protection—described as cosmetic function, not medical effect.
- **Concentration awareness where available** — Position or declared concentration signals when product composition knowledge includes them; absence of concentration does not block identity linkage.
- **Formulation role** — How the ingredient typically appears in product structure: primary active, supporting active, base component, preservative system member.
- **Compatibility context** — General knowledge about combination considerations with other ingredient classes—context for intelligence, not universal prescriptions.
- **Concern relevance** — General association surfaces linking ingredient knowledge to symptom or concern types for contextual interpretation, not user-specific verdicts.
- **Sensitivity relevance** — General knowledge that an ingredient class may warrant careful monitoring for sensitivity-prone users—applied only in personal context through evidence.
- **Barrier relevance** — General association with barrier support or barrier stress contexts in cosmetic framing.
- **Exfoliation relevance** — General association with exfoliating activity and typical use contexts.
- **Hydration relevance** — General association with moisture retention and hydration support roles.
- **Pigmentation relevance** — General association with tone-evening or pigmentation-addressing cosmetic contexts where knowledge exists.
- **Comedogenic or irritation caution where evidence is appropriate** — Documented general cautions from cosmetic knowledge sources, expressed with evidence confidence—not fear labels or universal bans.
- **Evidence confidence** — Confidence in identity match, alias mapping, and general knowledge claims derived from source quality and verification status.
- **Source provenance** — Origin of identity and knowledge: INCI reference, verified catalog, admin confirmation, inferred match—supporting audit and explainability.
- **Relationship to products** — Reference surface linking canonical ingredients to Product Model composition: which products contain which ingredients, verified or provisional.
- **Relationship to outcomes** — Reference surface enabling Outcome objects to evaluate change in context of ingredient exposure periods—not storing outcome conclusions on the ingredient.
- **Relationship to recommendations** — Reference surface enabling Recommendation objects to suggest monitoring, reduction, or alternative exposure based on personal evidence.
- **Future cross-product ingredient attribution** — Aggregate exposure across routines and products by canonical identity, enabling cumulative exposure analysis and duplicate detection.

These capabilities depend on canonical identity remaining separate from raw input, personal verdicts, and recommendation language.

### Ingredient Intelligence questions

The Ingredient Model enables Ingredient Intelligence to answer questions central to Personal Skin Intelligence:

- **Which ingredients the user is repeatedly exposed to** — Cumulative exposure assembled from product composition and usage periods, resolved by canonical identity.
- **Which ingredients appear across multiple products** — Cross-product attribution revealing shared actives, preservatives, or fragrance components the user may not consciously track.
- **Which ingredients may correlate with improvement** — Personal correlation candidates linking exposure periods to symptom and outcome trajectories, expressed with confidence—not stored as universal efficacy claims on the ingredient object.
- **Which ingredients may correlate with worsening** — Personal correlation candidates linking exposure to negative symptom or outcome patterns, contextual and evidence-bound.
- **Which ingredients are duplicated across a routine** — Detection of redundant exposure to the same canonical ingredient through multiple products in active routine context.
- **Which ingredient categories are missing from the routine** — Gap analysis against routine structure and general cosmetic knowledge, orienting formulation and recommendation layers.
- **Which ingredients should be monitored carefully for a specific user** — Personal monitoring signals derived from sensitivity history, symptom patterns, and prior outcomes—not universal ingredient condemnation.
- **Which previous ingredient exposures did not help** — Historical linkage between exposure periods and neutral or negative outcomes for this user, supporting recommendation avoidance and alternative exploration.

Ingredient Intelligence reads canonical identity and general ingredient knowledge from this model. It writes personal correlations, outcomes, and recommendations elsewhere. The Ingredient Model orients composition understanding; it does not conclude for the individual user inside its definitions.

### Neutrality and contextual interpretation

The Ingredient Model must stay neutral. It must not label ingredients as universally good or bad. Cosmetic ingredients have context-dependent effects: concentration, formulation vehicle, combination with other ingredients, application frequency, body area, individual tolerance, and accumulated exposure history all shape real-world experience. A platform that embeds moral or fear-based verdicts into ingredient definitions destroys explainability and misleads users whose personal evidence contradicts generic labels.

Ingredient interpretation must be contextual. Intelligence layers apply general ingredient knowledge against:

- **User history** — Prior exposures, outcomes, and tolerance patterns for this individual.
- **Symptom pattern** — Which presentation signals appear, where, and when relative to exposure.
- **Body area** — Application zone from Body Area Model linkage on usage records.
- **Routine structure** — Step order, frequency, and concurrent product exposure from Routine Model relationships.
- **Concentration when known** — Stronger or weaker interpretation when composition knowledge includes position or declared level.
- **Frequency of use** — Daily versus occasional exposure alters cumulative relevance.
- **Combination with other ingredients** — Simultaneous exposure to complementary or potentially irritating pairings in the same routine period.
- **Outcome evidence** — Reported improvement, stability, or worsening linked to exposure windows through Outcome objects.
- **Confidence level** — Verified composition versus provisional match versus uncertain OCR linkage shapes how strongly intelligence may reason.

General knowledge on the ingredient object describes cosmetic role and documented cautions with evidence confidence. Personal verdict—this ingredient helped you, this ingredient likely contributed to your stinging—belongs in correlation outputs, outcomes, and recommendations with traceable evidence chains.

### What does not belong in the Ingredient Model

Architectural discipline requires explicit boundaries. The Ingredient Model is ingredient identity and ingredient knowledge only. The following must not be embedded in ingredient definitions as authoritative content:

- **Product usage logs** — Application records belong in usage and routine evidence objects linked to products that reference ingredients.
- **User-specific conclusions** — Whether an ingredient helped or harmed this user belongs in Outcome and correlation intelligence outputs, not in canonical ingredient knowledge.
- **Diagnosis** — Clinical conclusions are outside cosmetic ingredient knowledge scope.
- **Treatment claims** — Therapeutic assertions about curing or treating conditions belong in governed intelligence outputs with appropriate scope—not ingredient definitions.
- **Universal fear-based ingredient labels** — "Toxic," "dirty," or blanket safety verdicts without personal context violate neutrality and explainability requirements.
- **Marketing claims** — Brand or retailer promotional language is not verified ingredient knowledge.
- **Raw OCR text as final truth** — Extracted strings are input with provenance until normalized and confidence-scored.
- **Unverified assumptions** — Inferred identity or function without source confidence must not present as canonical knowledge.
- **Recommendation text** — Guidance language belongs in Recommendation objects referencing ingredients—not inside ingredient definitions.
- **Outcome conclusions** — Evaluations of change belong in Outcome objects with evidence chains.
- **Medical advice** — Clinical guidance to users is outside ingredient model semantics.

If information describes *how this user reacted*, *what to do next*, *what was scanned off a label*, or *what a blogger claimed*, it belongs elsewhere and references the ingredient by canonical identifier. The model answers *what ingredient this is* and *what general cosmetic knowledge the platform holds*, not *what happened when this user encountered it*.

### Ingredient identity and ingredient knowledge only

The Ingredient Model is deliberately scoped. It is the platform's composition lexicon and knowledge anchor: canonical identity, alias normalization, general cosmetic function and relevance contexts, evidence confidence, and reference surfaces for product composition, exposure, outcome, and recommendation relationships. It does not log applications, render personal verdicts, diagnose conditions, or prescribe care.

The division of responsibility across models is explicit and must be preserved:

- **Ingredient Model** — *What* an ingredient is and what general cosmetic knowledge is known about it.
- **Product Model** — *Which* products contain it.
- **Routine Model** — *How* the user is exposed to it (defined later in this document).
- **Outcome Model** — *What* changed after exposure (defined later in this document).
- **Recommendation Model** — *What* to do next (defined later in this document).

Intelligence Engines consume canonical ingredient identifiers as composition context. Input Intelligence and Product Intelligence normalize extracted and declared composition text into canonical links—verified or uncertain. Ingredient Intelligence enriches general knowledge and supports exposure aggregation. Memory Engine assembles ingredient exposure history across products and time. Correlation Engine evaluates personal associations between exposure windows and symptom or outcome patterns. Recommendation Engine suggests monitoring, reduction, or alternatives based on personal evidence grounded in canonical identity. Formulation Engine addresses composition gaps relative to ingredients present or absent in the user's routine context.

By confining the Ingredient Model to ingredient identity and general ingredient knowledge, SkinIntel preserves separation of concerns: canonical composition vocabulary remains stable and neutral while products, usage, routines, personal correlations, outcomes, and recommendations evolve in their own domains—always linkable through traceable, explainable references to the same universal understanding of what the user's skin encounters.

---

## Routine Model

The Routine Model defines how SkinIntel understands the way a user applies products over time. It is the platform's structured representation of usage context: not merely what products exist in a cabinet, but how those products are organized into steps, timed across day parts, applied to specific body areas, repeated at defined frequencies, and changed across the skin journey. A routine in this model is a durable knowledge object that connects products, steps, timing, frequency, body areas, symptoms, outcomes, recommendations, and personal evidence—supplying the *how* and *when* of exposure that Product and Ingredient Models cannot express alone.

The Routine Model is a conceptual knowledge object. It describes routine structure semantics, temporal usage context, and change history—not storage fields, scheduling mechanics, or capture interface design. How routines are persisted, edited, or displayed is downstream implementation. The model itself must remain stable, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Routines as structured usage context

A routine is not just a list of products. A flat inventory of product names cannot answer whether the user applies retinol before or after moisturizer, whether sunscreen appears only in the morning, or whether three serums containing overlapping actives run concurrently in the evening. Intelligence requires structure: step order, day-part segmentation, frequency, application zone, and temporal bounds of each item's active use.

The Routine Model captures this structure as usage context. Each routine item references a product from the Product Model—not redefining product identity—and declares how that product participates in the user's care pattern: which step it occupies, when in the day it applies, how often it runs, where on the body it targets, and whether it is currently active or paused. Ingredient exposure aggregates through product composition links; symptom and outcome correlation evaluates against the routine state that prevailed during relevant periods.

This structure is essential for Personal Skin Intelligence. Correlation Engine cannot associate stinging with routine change if the platform knows only today's product list without knowing that a new acid toner was inserted three steps before a previously tolerated moisturizer. Outcome Intelligence cannot compare routine patterns if historical structure is discarded whenever the user edits their morning sequence. The Routine Model preserves usage context as evidence-grade knowledge.

### Current state and historical change

The Routine Model must support both current routine state and historical routine changes. Current state answers *what the user is doing now*—the active morning sequence, the evening steps in play, the weekly treatments on rotation. Historical change answers *what was different then*—the routine that existed when a scan was captured, when a product was introduced, when symptoms escalated, or when an outcome was reported.

SkinIntel must understand:

- **What products are used** — Product references within routine structure, verified or provisional, linked through Product Model identity.
- **When they are used** — Day-part and temporal placement: morning, evening, weekly, occasional, or event-triggered use contexts.
- **In what order** — Step sequence and layering position within each routine segment.
- **How often they are used** — Daily, alternate-day, twice-weekly, or other frequency patterns attached to routine items.
- **Where they are applied** — Body area linkage through Body Area Model references on application context, not embedded in product identity.
- **When they were started** — Onset of each routine item's active period through related usage objects, anchoring before/after timelines.
- **When they were stopped** — Cessation or pause of each routine item, preserving the end of an exposure window for correlation.
- **What changed after routine changes** — Reference surface enabling Outcome and correlation intelligence to evaluate symptom and presentation trajectories relative to routine modifications—not storing conclusions inside routine structure itself.

Current state serves presentation and immediate intelligence context. Historical change serves the Personal Evidence Base. Both are required; neither substitutes for the other.

### Capabilities the model must support

The Routine Model is designed to enable current platform behavior and planned routine intelligence. It must support:

- **Morning routine** — Distinct day-part structure for AM application sequence and timing context.
- **Evening routine** — Distinct day-part structure for PM application sequence, including actives typically reserved for night use.
- **Weekly or occasional use** — Routine segments outside daily cadence: masks, treatments, exfoliation nights, rotation schedules.
- **Product step order** — Explicit ordering of products within each routine segment, establishing sequence for layering interpretation.
- **Product layering** — Structural expression of how products sit relative to one another in application order—relevant to compatibility and cumulative exposure reasoning.
- **Active vs inactive routine items** — Distinction between products currently in use within the routine and items paused, discontinued, or archived without erasing historical presence.
- **Start and stop dates through related usage objects** — Temporal bounds of each item's participation, expressed through usage relationships rather than embedded session logs in routine definition.
- **Body-area-specific application** — Application zone per routine item where use is regional rather than whole-face or whole-body.
- **Frequency of use** — Per-item cadence within the routine structure: daily, intermittent, cyclic, or custom patterns.
- **Skipped usage** — User-declared or inferred non-use instances where relevant to exposure accuracy—distinguishing *in routine but not used today* from *removed from routine*.
- **Routine changes over time** — Versioned or event-sourced history of structural modifications: additions, removals, reorderings, frequency shifts.
- **Routine simplification** — Structural visibility into reduced step count or consolidated sequences over periods—relevant to barrier recovery and adherence context.
- **Routine overload detection** — Reference surface enabling intelligence to evaluate step count, active overlap, and cumulative load against personal tolerance evidence.
- **Ingredient exposure aggregation** — Composition resolved through Product Model links, aggregated across concurrent routine items by canonical Ingredient Model identity.
- **Outcome correlation** — Reference surface linking routine periods to Outcome evaluations before and after structural change.
- **Recommendation targeting** — Reference surface enabling Recommendation objects to suggest reordering, pausing, introducing, or removing steps based on personal evidence.
- **Future routine optimization** — Historical and structural data supporting proposed routine adjustments grounded in personal patterns and outcomes.

These capabilities depend on treating routine as temporal, structured usage context—not a static checklist that overwrites its own history on every edit.

### Routine Intelligence questions

The Routine Model enables Routine Intelligence to answer questions central to Personal Skin Intelligence:

- **What the user currently uses** — Active routine structure across day parts, with product, order, frequency, and application zone context.
- **What changed since the last scan** — Diff between routine state at prior scan time and current state: new items, removed items, reorderings, frequency shifts.
- **Whether a new product was introduced** — Onset detection of routine items with start dates after a reference point, linked to product identity for composition and exposure analysis.
- **Whether a product was stopped** — Cessation detection through inactive status or stop dates, preserving exposure window closure for correlation.
- **Whether the routine is too complex** — Structural evaluation of step count, concurrent actives, and layering depth against personal tolerance and outcome history.
- **Whether active ingredients overlap** — Ingredient exposure aggregation revealing duplicate actives across multiple concurrent routine items.
- **Whether exposure frequency may be too high** — Cadence analysis for potentially irritating classes: acids, retinoids, multiple exfoliants—contextual to user evidence, not universal rules.
- **Whether a symptom change followed a routine change** — Temporal alignment between routine modification events and symptom trajectory shifts assembled from Scan Records and Outcome references.
- **Whether a previous routine pattern was more successful** — Historical comparison of routine structures linked to positive versus negative outcome periods for this user.
- **Which routine steps are stable and which are experimental** — Duration and consistency analysis: long-standing items versus recently introduced or frequently changed steps.

Routine Intelligence reads routine structure and usage context from this model. It writes correlations, outcomes, and recommendations elsewhere. The Routine Model orients exposure pattern; it does not conclude.

### Routine history as personal evidence

Routine history is part of the Personal Evidence Base. A user's current routine is not enough. The platform must preserve routine changes over time because outcomes depend on change history, not just current state.

When a user reports improvement, intelligence must know whether they simplified their evening routine, removed a suspected irritant, or merely continued an unchanged pattern. When symptoms worsen, intelligence must reconstruct what was added, increased in frequency, or layered differently in the weeks preceding escalation. Scan Records reference routine snapshot at capture time; those snapshots gain meaning only if historical routine structure is retrievable and comparable.

Discarding routine history on edit destroys explainability. A recommendation that says "your stinging began after you added a new toner" requires a preserved record that the toner was added, when, and in what step position. Outcome evaluation that compares routine periods requires two reconstructable states—not a single current list with no memory of prior structure.

Routine change events—addition, removal, reorder, frequency change, pause, resume—are evidence objects in their own right, linked to the Routine Model's temporal representation. They enable Correlation Engine, Prediction Engine, and Outcome Intelligence to reason about *change* as the variable that personal skin journeys constantly introduce.

### What does not belong in the Routine Model

Architectural discipline requires explicit boundaries. The Routine Model is routine structure and usage context only. The following must not be embedded in routine definitions as authoritative content:

- **Product identity definitions** — What a product is belongs in the Product Model; routine items reference product identity, not redefine it.
- **Ingredient identity definitions** — Canonical ingredient knowledge belongs in the Ingredient Model; exposure aggregates through product composition links.
- **Symptom severity values** — Severity is moment-specific on Scan Records, linked to symptoms and body areas—not attributes of routine structure.
- **Outcome conclusions** — Whether a routine change helped or harmed belongs in Outcome objects with traceable evidence chains.
- **Diagnosis** — Clinical conclusions are outside routine model scope.
- **Treatment plans** — Medically scoped care plans are governed intelligence outputs, not routine structure semantics.
- **Recommendation text** — Guidance language belongs in Recommendation objects targeting routine adjustments—not inside routine definitions.
- **Medical claims** — Therapeutic assertions about routine effects are outside cosmetic usage context scope.
- **Purchase or commerce data** — Transaction and retailer mechanics are unrelated to usage structure intelligence.
- **Raw unstructured notes as authoritative routine state** — User narrative may supplement context as linked notes; routine structure must normalize into defined steps, timing, and product references—not free text alone.

If information describes *what a product is*, *what an ingredient means*, *how bad symptoms were*, *what changed as a result*, or *what the user should do next*, it belongs elsewhere and references the routine or its items by identifier. The model answers *how and when the user applies products*, not *what those products are* or *what happened because of them*.

### Routine structure and usage context only

The Routine Model is deliberately scoped. It is the platform's usage architecture: day-part segmentation, step order, frequency, application zone, active and inactive items, temporal bounds, and preserved change history. It does not define products, normalize ingredients, score symptoms, evaluate outcomes, or prescribe next steps.

The division of responsibility across models is explicit and must be preserved:

- **Routine Model** — *How* and *when* the user is exposed to products and ingredients.
- **Product Model** — *What* product exists.
- **Ingredient Model** — *What* ingredients exist.
- **Outcome Model** — *What* changed after routine exposure (defined later in this document).
- **Recommendation Model** — *What* to do next (defined later in this document).

Intelligence Engines consume routine structure as exposure context. Input Intelligence captures routine declarations and changes as structured events. Memory Engine assembles routine history alongside scan and product timelines. Correlation Engine aligns routine modifications with symptom emergence and resolution patterns. Ingredient Intelligence aggregates exposure across concurrent routine items. Outcome Intelligence evaluates change relative to routine periods before and after intervention. Recommendation Engine proposes structural adjustments—pause, reorder, introduce, simplify—grounded in personal evidence. Prediction Engine projects likely effects of proposed routine changes based on historical patterns for this user.

By confining the Routine Model to routine structure and usage context, SkinIntel preserves separation of concerns: usage patterns remain reconstructable and comparable over years while products, ingredients, symptoms, outcomes, and recommendations evolve in their own domains—always linkable through traceable, explainable references to the same universal understanding of how the user cares for their skin over time.

---

## Outcome Model

The Outcome Model defines how SkinIntel understands what changed over time after scans, product use, ingredient exposure, routine changes, and recommendations. It is the platform's structured interpretation of change: the layer that evaluates whether presentation improved, worsened, stabilized, or shifted ambiguously across a defined period and context—not what was observed at a single moment, not what should be done next, and not a clinical conclusion about underlying cause.

An outcome is not a diagnosis. It does not assign disease labels, medical conditions, or therapeutic verdicts. An outcome is not a recommendation. It does not prescribe products, routines, or actions the user should take. An outcome is a structured interpretation of change—grounded in evidence, scoped to time windows, linked to the symptoms, body areas, products, ingredients, routines, and recommendations that frame the evaluation, and expressed with explicit confidence and uncertainty where data is incomplete.

The Outcome Model is a conceptual knowledge object. It describes change interpretation semantics, evidence linkage, and confidence posture—not storage fields, inference pipelines, or presentation design. How outcomes are computed, displayed, or confirmed is downstream implementation. The model itself must remain stable, evidence-based, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Outcomes as structured change interpretation

Personal Skin Intelligence depends on understanding *what changed*, not only *what is*. Scan Records capture moments. Product, Ingredient, and Routine Models capture exposure context. The Outcome Model connects these into evaluative knowledge: improvement after a routine simplification, worsening following product introduction, stability across a month of consistent care, partial response on the cheeks but not the forehead, uncertain shift because scan frequency was too low to judge confidently.

Without structured outcomes, the platform accumulates evidence but cannot learn from it. Recommendation Engine cannot know whether prior guidance worked. Correlation Engine cannot distinguish coincidence from repeated pattern. Memory Engine cannot assemble progress narratives across months. The Outcome Model transforms longitudinal evidence into interpretable change—always traceable to the scans, feedback, and context that supported the evaluation.

Outcomes reference other models; they do not redefine them. Symptom identifiers come from the Symptom Model. Body areas from the Body Area Model. Products and ingredients from their respective identity models. Routine structure from the Routine Model. Recommendation references from the Recommendation Model. The Outcome Model binds these references across time and declares what changed—not what each object *is*.

### Connected knowledge domains

The Outcome Model connects the full personal evidence graph into change evaluation:

- **Symptoms** — Which presentation signals are in scope for the outcome: dryness, redness, blemishes, and comparable identifiers from the Symptom Model.
- **Body areas** — Where change is evaluated: regional improvement on the jawline versus whole-face assessment, linked through Body Area Model references.
- **Scan records** — Before-and-after evidence anchors: symptom reports, severity, images, and context from immutable Scan Records bounding the evaluation window.
- **Products** — Product introduction, continuation, or discontinuation periods framing exposure context for product-related outcomes.
- **Ingredients** — Canonical ingredient exposure windows assembled through product composition links for ingredient-related outcomes.
- **Routines** — Structural routine state before and after change events, linked through Routine Model history for routine-related outcomes.
- **Recommendations** — Prior guidance the platform issued, enabling evaluation of whether expected change aligned with observed change.
- **User feedback** — Explicit user declarations of improvement, worsening, no change, or partial response—first-class evidence, not overridden silently by inference.
- **Time** — Defined comparison windows: onset, duration, and reference periods that bound what "before" and "after" mean for this outcome.

This connectivity is what makes outcomes explainable. A user can ask *why does the platform think my redness improved?* and receive an answer citing scan trajectory, routine change timing, product stop date, and confidence level—not an opaque score.

### User-reported and platform-observed outcomes

The Outcome Model must support both user-reported outcomes and platform-observed outcomes. Neither alone is sufficient; together they produce accountable change interpretation.

**User-reported outcomes** include what the user says changed: explicit feedback that a concern improved, worsened, stayed the same, or responded partially. User report is authoritative as personal experience evidence. It may conflict with scan-visible signals; the model preserves both rather than silently discarding user voice. User confirmation or correction of platform-observed outcomes is a governed interaction—corrections create traceable updates without erasing prior interpretation.

**Platform-observed outcomes** include changes inferred from scan history, structured symptom ratings across sessions, image comparison where available, and routine timeline alignment. Platform inference extends evaluation when users do not actively report—detecting symptom trajectory shifts, stability patterns, or ambiguous movement that warrants low-confidence outcome classification. Platform-observed outcomes carry confidence levels and evidence references; they are not presented as certainty when inference is weak.

When user report and platform observation align, confidence strengthens. When they diverge, the Outcome Model preserves uncertainty, surfaces both signals, and invites confirmation where appropriate. SkinIntel must avoid pretending certainty when data is weak. Outcomes must preserve uncertainty.

### Capabilities the model must support

The Outcome Model is designed to enable current platform behavior and planned outcome intelligence. It must support:

- **Improvement** — Structured classification that presentation signals or user experience moved favorably within the evaluation scope.
- **Worsening** — Structured classification that signals or experience deteriorated within scope.
- **No meaningful change** — Classification that evidence does not support material shift in either direction within the window.
- **Partial change** — Improvement or worsening in some symptoms or body areas but not others within the same evaluation.
- **Uncertain change** — Classification when evidence is insufficient, conflicting, or too sparse for confident directional judgment.
- **Symptom-specific outcomes** — Change scoped to individual symptom identifiers, not collapsed into a single undifferentiated verdict.
- **Body-area-specific outcomes** — Regional change evaluation: cheeks improved while forehead did not.
- **Product-related outcomes** — Change interpreted in context of product introduction, continued use, or discontinuation periods.
- **Ingredient-related outcomes** — Change interpreted in context of ingredient exposure windows across products.
- **Routine-related outcomes** — Change interpreted relative to routine modifications: additions, removals, reorderings, frequency shifts.
- **Recommendation-related outcomes** — Change evaluated against prior recommendation intent: did expected improvement materialize?
- **Time-window comparison** — Explicit before and after periods with defined boundaries anchored to scans, events, or user declarations.
- **Confidence level** — Quantified or ordinal confidence in the outcome interpretation derived from evidence quality, alignment, and completeness.
- **Evidence references** — Traceable links to Scan Records, user feedback, routine events, product usage periods, and recommendations supporting the evaluation.
- **Uncertainty explanation** — Human-readable and machine-auditable rationale for low confidence: sparse scans, conflicting signals, missing routine history.
- **User confirmation or correction** — Governed user response to platform-observed outcomes, preserved in the evidence chain.
- **Longitudinal progress tracking** — Sequence of outcomes across months enabling trend assembly without overwriting prior evaluations.
- **Future before/after comparison** — Stable outcome objects supporting visual and narrative comparison across defined periods.
- **Future personal threshold learning** — Reference surface for Learning Layer to refine what magnitude of change constitutes meaningful improvement for this user—without embedding learned thresholds as universal rules inside outcome definitions.

These capabilities depend on outcomes remaining interpretive objects with evidence chains—not silent overwrites of scan history or profile fields.

### Outcome Intelligence questions

The Outcome Model enables Outcome Intelligence to answer questions central to Personal Skin Intelligence:

- **Did the user improve after a routine change** — Routine-related outcome comparing symptom and feedback trajectories across defined before/after windows bracketing the modification.
- **Did a symptom get worse after a product introduction** — Product-related outcome aligning symptom trajectory with product start date and exposure period.
- **Did stopping a product help** — Outcome evaluating change following discontinuation, with confidence appropriate to scan density and user feedback.
- **Did a recommendation produce the expected result** — Recommendation-related outcome comparing predicted or intended change against observed change.
- **Which body areas improved and which did not** — Partial change decomposition by Body Area Model reference within a single evaluation period.
- **Which symptoms are stable over time** — Longitudinal outcome sequence identifying persistent no-change classifications across repeated windows.
- **Which changes are uncertain because evidence is weak** — Explicit uncertain-change outcomes with uncertainty explanation, not inflated confidence.
- **Which patterns repeat across months** — Recurring outcome types linked to similar exposure or routine contexts, feeding Correlation Engine and Prediction Engine.
- **What the platform should learn from this user's history** — Reference surface for Learning Layer: outcome accuracy, threshold calibration, and recommendation effectiveness evaluation—expressed as learning inputs, not embedded verdicts in the Outcome Model itself.

Outcome Intelligence reads evidence from Scan Records, routines, products, and feedback. It writes structured outcome objects with confidence and references. It does not redefine symptoms, products, or routines inside outcome definitions.

### Evidence-based and confidence-aware interpretation

Outcome interpretation must always be evidence-based and confidence-aware. An outcome without evidence references is not a valid Outcome Model object—it is an unsupported assertion. Every classification of improvement, worsening, stability, partial change, or uncertainty must trace to Scan Records, user feedback, routine events, or comparable evidence within the evaluation window.

Confidence derives from evidence quality: scan frequency in the window, alignment between user report and structured symptom trajectory, completeness of routine and product context, image availability where relevant, and absence of confounding changes during the same period. A single scan before and after a major routine overhaul warrants lower confidence than six scans across an unchanged exposure period. Multiple simultaneous changes—new product, new climate, routine reorder—warrant uncertain change classification rather than false precision.

SkinIntel must avoid pretending certainty when data is weak. Outcomes must preserve uncertainty. Presenting inferred change as definitive when evidence is sparse erodes trust and corrupts downstream learning. Uncertain change is a valid, valuable outcome type—it tells Recommendation Engine to gather more evidence before acting, tells Prediction Engine to widen confidence bands, and tells the user honestly that the platform cannot yet judge reliably.

Unsupported causation does not belong in outcomes. An outcome may record that redness worsened during a period when a new serum was introduced; it must not assert as fact that the serum caused the worsening unless evidence and confidence posture support causal framing—and even then, causation remains interpretive, not diagnostic. Correlation and outcome evaluation serve Personal Skin Intelligence; they do not replace clinical investigation.

### What does not belong in the Outcome Model

Architectural discipline requires explicit boundaries. The Outcome Model is change interpretation only. The following must not be embedded in outcome definitions as authoritative content:

- **Diagnosis** — Clinical condition assignment is outside outcome scope.
- **Medical conclusions** — Pathological interpretation belongs in governed clinical contexts, not cosmetic change evaluation.
- **Treatment claims** — Assertions that an intervention treats or cures conditions are recommendation or clinical domain—not outcome classification.
- **Raw symptom vocabulary** — Symptom identifiers belong in the Symptom Model; outcomes reference them, not redefine them.
- **Product identity definitions** — Product knowledge belongs in the Product Model.
- **Ingredient identity definitions** — Ingredient knowledge belongs in the Ingredient Model.
- **Routine structure** — Usage architecture belongs in the Routine Model; outcomes reference routine periods and change events.
- **Recommendation text** — Guidance language belongs in Recommendation objects; outcomes evaluate recommendation effect, not restate guidance.
- **Marketing claims** — Brand or product marketing is not evidence for outcome evaluation.
- **Unsupported causation** — Definitive cause attribution without evidence and confidence support violates explainability requirements.
- **Universal rules** — Population-level rules about what outcomes mean belong in knowledge layers applied contextually, not embedded as fixed outcome semantics.

If information describes *what was observed at one moment*, *what a product is*, *how the user applies products*, or *what to do next*, it belongs elsewhere and is referenced by the outcome evaluation. The model answers *what changed over time*, with evidence, confidence, and scope—not *what you have*, *what you used*, or *what you should try*.

### Change interpretation only

The Outcome Model is deliberately scoped. It is the platform's evaluative layer: structured change classification across symptoms, body areas, exposure contexts, and time—linked to evidence, expressed with confidence, open to user confirmation, and preserved longitudinally. It does not observe moments, define products, structure routines, diagnose conditions, or prescribe actions.

The division of responsibility across models is explicit and must be preserved:

- **Outcome Model** — *What* changed over time.
- **Symptom Model** — *What* was observed.
- **Body Area Model** — *Where* it was observed.
- **Product Model** — *What* product exists.
- **Ingredient Model** — *What* ingredient exists.
- **Routine Model** — *How* the user was exposed.
- **Recommendation Model** — *What* to do next (defined later in this document).

Intelligence Engines consume and produce outcomes as evaluative context. Input Intelligence captures user-reported outcome feedback as structured evidence. Memory Engine assembles outcome sequences across the longitudinal timeline. Correlation Engine identifies recurring change patterns linked to exposure and routine contexts. Prediction Engine uses outcome history to project likely trajectories. Recommendation Engine evaluates prior recommendation outcomes before issuing new guidance. Learning Layer refines personal thresholds and recommendation effectiveness from accumulated outcome evidence—with traceability to the evaluations that informed learning.

By confining the Outcome Model to change interpretation, SkinIntel preserves separation of concerns: moments remain immutable in Scan Records, exposure context remains structured in Product, Ingredient, and Routine Models, and evaluative knowledge accumulates as accountable, confidence-aware outcomes—always linkable through traceable, explainable references to the evidence that supported each judgment of change.

---

## Recommendation Model

The Recommendation Model defines how SkinIntel represents guidance given to the user. It is the platform's structured output layer for actionable next steps: what to continue, pause, simplify, monitor, avoid, or reassess—grounded in personal evidence, scoped to symptoms, body areas, products, ingredients, and routines, and expressed with explicit confidence and explainability. A recommendation in this model is not a moment of observation, not an evaluation of past change, and not a clinical verdict about underlying condition.

A recommendation is not a diagnosis. It does not assign disease labels, medical conditions, or pathological conclusions. A recommendation is not a medical treatment plan. It does not prescribe therapeutic regimens, pharmaceutical interventions, or clinical care protocols outside the platform's cosmetic Personal Skin Intelligence scope. A recommendation is a structured, evidence-based, confidence-aware guidance object—traceable to scan history, outcomes, exposure context, and user preferences, proportional to evidence strength, and honest about uncertainty when action would be premature.

The Recommendation Model is a conceptual knowledge object. It describes guidance semantics, intent classification, evidence linkage, and explainability requirements—not storage fields, delivery channels, or presentation design. How recommendations are generated, displayed, or confirmed is downstream implementation. The model itself must remain stable, explainable, traceable, and accountable to every Intelligence Engine regardless of technology or provider.

### Recommendations as structured guidance

Personal Skin Intelligence culminates in guidance the user can act on—but action without evidence is indistinguishable from generic advice. The Recommendation Model transforms accumulated personal evidence into structured guidance objects that declare intent, target, rationale, confidence, and follow-up expectations. Continue the moisturizer that correlated with improvement. Pause the newly introduced serum pending more evidence. Simplify the evening routine after overload signals. Monitor redness on the cheeks for two weeks before introducing another active. Collect more scans before recommending product change when uncertainty is high.

Recommendations reference other models; they do not redefine them. Symptom identifiers come from the Symptom Model. Body areas from the Body Area Model. Products and ingredients from their identity models. Routine steps from the Routine Model. Prior change evaluations from the Outcome Model. Scan Records supply evidentiary anchors. User preferences and constraints from User Profile orient delivery without overriding evidence. The Recommendation Model binds these references into guidance—declaring *what to do next and why*, not re-embedding vocabulary or conclusions from other domains.

Every recommendation must be explainable. Hidden reasoning without evidence references violates the platform's accountability contract. A user who receives guidance must be able to understand—not necessarily agree with—why the platform suggested it, what would invalidate it, and what to watch for afterward.

### Connected knowledge domains

Recommendations must be connected to the full personal evidence graph:

- **Symptoms** — Target presentation signals the guidance addresses, references from the Symptom Model.
- **Body areas** — Regional scope where guidance applies, linked through Body Area Model references.
- **Scan records** — Evidentiary anchors: recent observations, severity trajectories, and context supporting the recommendation.
- **Products** — Target products to continue, pause, introduce, or avoid—referenced through Product Model identity, not redefined.
- **Ingredients** — Ingredient exposure context motivating monitoring, reduction, or avoidance guidance.
- **Routines** — Routine steps or structural changes targeted: simplify, reorder, pause a step—linked through Routine Model references.
- **Outcomes** — Prior change evaluations informing what worked, failed, or remains uncertain—referenced from Outcome Model objects with evidence chains.
- **User preferences** — Declared preferences from User Profile: ingredient avoidances, routine complexity tolerance, communication style—orienting guidance without contradicting evidence.
- **User constraints** — Practical limits: budget sensitivity, product availability, time for routine steps, consent scope—shaping feasible recommendations.
- **Confidence level** — Explicit confidence in the recommendation derived from evidence quality, outcome alignment, and completeness of context.
- **Evidence references** — Traceable links to Scan Records, outcomes, routine events, product usage periods, and correlation outputs supporting the guidance.

This connectivity enables explainability and outcome evaluation. When the platform later assesses whether a recommendation worked, it compares observed change against the recommendation's stated intent, expected outcome, and review window—not against an undocumented suggestion lost to history.

### Recommendation types

The Recommendation Model must support different recommendation types, each expressing distinct intent rather than collapsing all guidance into generic "try this product" language:

- **Continue** — Maintain current product, step, or pattern when evidence supports stability or improvement.
- **Pause** — Temporarily stop a product or step pending observation, without declaring permanent abandonment.
- **Reduce frequency** — Lower application cadence for a product or active step when exposure may exceed personal tolerance.
- **Increase frequency carefully** — Cautious cadence increase when evidence supports gradual intensification with explicit monitoring requirements.
- **Simplify routine** — Reduce step count, active overlap, or layering complexity when overload or barrier stress signals appear.
- **Introduce product category** — Suggest a category gap fill—hydration, sun protection, gentle cleansing—when routine analysis and outcomes support need, distinct from pushing a specific commercial product.
- **Avoid repetition of previously unsuccessful pattern** — Explicit guard against reintroducing products, ingredients, or routine structures linked to negative outcomes for this user.
- **Monitor symptom** — Observe specified presentation signals over a defined period before further action; action deferred, not absent.
- **Collect more evidence** — Recommend additional scans, structured feedback, or observation window when uncertainty is too high for confident intervention.
- **Seek professional help when appropriate safety boundaries are reached** — Escalation guidance when symptom patterns, severity trajectories, or user declarations exceed cosmetic guidance scope—expressed as safety boundary response, not diagnosis.

Type classification makes guidance legible to users and auditable to the Learning Layer. A recommendation to monitor is fundamentally different from a recommendation to introduce; conflating them corrupts outcome evaluation and user trust.

### Explainability requirements

Every recommendation should be able to answer:

- **Why this recommendation was made** — Primary rationale linked to evidence: outcome history, symptom trajectory, routine change correlation, or explicit uncertainty management.
- **What evidence supports it** — Evidence references with sufficient specificity for user and auditor review.
- **What uncertainty exists** — Acknowledged gaps: sparse scans, conflicting outcomes, concurrent uncontrolled changes, provisional product composition.
- **What the user should watch for** — Monitoring signals during the recommendation period: symptom escalation, new presentation types, tolerance indicators.
- **What outcome should be checked later** — Expected change direction or stability target the platform will evaluate against—linked to Outcome Model evaluation, not guaranteed result.
- **When the recommendation should be reviewed** — Review window defining when follow-up assessment, reassessment, or escalation is appropriate.

Explainability is not optional marketing transparency. It is an architectural requirement. Recommendation Engine outputs that cannot cite evidence are not valid Recommendation Model objects.

### Capabilities the model must support

The Recommendation Model is designed to enable current platform behavior and planned recommendation intelligence. It must support:

- **Recommendation intent** — Classified purpose aligned with recommendation types: continue, pause, simplify, monitor, collect evidence, escalate, and comparable intents.
- **Target symptom** — Symptom Model reference defining which presentation signal the guidance addresses.
- **Target body area** — Body Area Model reference scoping regional guidance.
- **Target product** — Product Model reference when guidance names a specific product to continue, pause, or avoid.
- **Target ingredient** — Ingredient Model reference when guidance addresses exposure to a canonical ingredient class or instance.
- **Target routine step** — Routine Model reference when guidance addresses specific step order, frequency, or structural position.
- **Expected outcome** — Declared change direction or stability expectation for later Outcome Model evaluation—not a guaranteed result.
- **Risk or caution note** — Contextual caution proportional to evidence: potential irritation, overlap with recent negative history, need for gradual introduction.
- **Confidence level** — Explicit confidence in the recommendation appropriate to evidence strength.
- **Evidence strength** — Qualitative or ordinal assessment of how robustly personal evidence supports the guidance.
- **User confirmation** — Governed user acceptance of guidance, preserved for outcome evaluation and learning.
- **User rejection** — Governed user decline with optional reason, preserved without silently erasing the recommendation from history.
- **Follow-up requirement** — Whether structured follow-up scan, feedback, or check-in is required before next major guidance.
- **Review window** — Temporal boundary after which the recommendation should be reassessed against new evidence.
- **Outcome evaluation** — Reference surface linking recommendation to subsequent Outcome objects evaluating whether expected change materialized.
- **Anti-repeat failure guard** — Explicit linkage to prior failed recommendations or negative outcomes preventing naive repetition of unsuccessful patterns.
- **Personal preference awareness** — Incorporation of User Profile preferences and constraints into feasible, respectful guidance.
- **Safety boundary escalation** — Classification and routing when guidance exceeds cosmetic scope and professional consultation is the appropriate recommendation type.

These capabilities depend on recommendations remaining distinct from outcomes, diagnoses, and product marketing.

### Recommendation Intelligence questions

The Recommendation Model enables Recommendation Intelligence to answer questions central to Personal Skin Intelligence:

- **What should the user do next** — Primary actionable guidance object with intent, target, and rationale.
- **Why is this the next best step** — Evidence-based ranking explanation: why this guidance precedes alternatives given current personal history.
- **What should the user not repeat** — Anti-repeat failure guard drawing on negative outcomes and rejected prior recommendations.
- **What recommendation worked before** — Historical linkage between past recommendations and positive subsequent outcomes for this user.
- **What recommendation failed before** — Historical linkage between past recommendations and neutral or negative outcomes, informing guard logic.
- **What should be monitored** — Active monitor-type recommendations with defined signals and review windows.
- **When should the user reassess** — Review window aggregation across active recommendations.
- **When is uncertainty too high for action** — Collect-more-evidence and monitor recommendations explicitly prioritized over intervention.
- **When should the platform recommend professional consultation instead of cosmetic guidance** — Safety boundary escalation when symptom severity, duration, or pattern exceeds platform scope.

Recommendation Intelligence reads evidence from scans, outcomes, routines, products, and preferences. It writes structured recommendation objects with explainability and confidence. It does not embed outcome conclusions, product definitions, or diagnostic labels inside guidance.

### Proportional to evidence

Recommendations must not pretend certainty. They must be proportional to evidence. Strong evidence—consistent outcomes, clear symptom trajectory, stable routine context, repeated personal pattern—supports confident continue, pause, or simplify guidance. Weak evidence—single scan, concurrent uncontrolled changes, provisional product identity, conflicting user report—supports monitor, collect more evidence, or cautious pause rather than aggressive intervention.

When evidence is weak, the correct recommendation may be to collect more evidence, simplify the routine, or monitor. Presenting high-confidence product introduction guidance from sparse data erodes trust and produces outcome evaluations that fail learning loops. The Recommendation Model treats uncertainty-aware guidance as first-class output, not fallback failure.

Proportionality extends to caution notes and expected outcomes. Expected outcome declarations describe what the platform will evaluate—not promises of improvement. Risk notes reflect personal history and ingredient context, not universal fear language. Confidence and evidence strength fields exist so presentation layers never imply certainty the model did not assert.

### What does not belong in the Recommendation Model

Architectural discipline requires explicit boundaries. The Recommendation Model is guidance only. The following must not be embedded in recommendation definitions as authoritative content:

- **Diagnosis** — Clinical condition assignment is outside recommendation scope.
- **Medical treatment claims** — Therapeutic assertions about curing or treating disease belong in governed clinical contexts, not cosmetic guidance objects.
- **Guaranteed results** — Promises of specific outcomes violate explainability and proportionality requirements.
- **Product marketing copy** — Brand promotional language is not recommendation rationale.
- **Affiliate logic** — Referral, commission, or commercial prioritization mechanics are unrelated to evidence-based guidance semantics.
- **Purchase pressure** — Urgency language driven by commerce rather than personal evidence is excluded from recommendation content.
- **Unsupported causation** — Definitive cause attribution without evidence references violates accountability requirements.
- **Raw symptom definitions** — Symptom vocabulary belongs in the Symptom Model; recommendations reference identifiers.
- **Raw product definitions** — Product knowledge belongs in the Product Model; recommendations reference identity.
- **Raw ingredient definitions** — Ingredient knowledge belongs in the Ingredient Model; recommendations reference canonical identity.
- **Outcome conclusions without evidence** — Evaluations of past change belong in Outcome objects with evidence chains, not embedded as unsupported rationale inside new guidance.
- **Hidden reasoning without evidence references** — Every recommendation must cite the evidence that supports it; opaque guidance is architecturally invalid.

If information describes *what was observed*, *what changed*, *what a product is*, or *how the user applies products*, it belongs elsewhere and is referenced by the recommendation. The model answers *what to do next and why*—not *what you have*, *what happened*, or *what you are diagnosed with*.

### Guidance only

The Recommendation Model is deliberately scoped. It is the platform's actionable intelligence output: structured guidance with intent, target, rationale, confidence, monitoring expectations, review windows, and outcome evaluation linkage. It does not observe moments, evaluate past change, define products or ingredients, structure routines, or diagnose conditions.

The division of responsibility across models is explicit and must be preserved:

- **Recommendation Model** — *What* to do next and *why*.
- **Outcome Model** — *What* changed after previous actions.
- **Routine Model** — *How* the user is exposed.
- **Product Model** — *What* product exists.
- **Ingredient Model** — *What* ingredient exists.
- **Symptom Model** — *What* was observed.
- **Body Area Model** — *Where* it was observed.

Intelligence Engines interact with recommendations across the platform lifecycle. Recommendation Engine produces guidance from accumulated evidence and prior outcome evaluations. Input Intelligence captures user confirmation, rejection, and follow-up feedback. Memory Engine retrieves active and historical recommendations for context assembly. Outcome Intelligence evaluates subsequent change against recommendation intent and expected outcome. Learning Layer assesses recommendation effectiveness, refines anti-repeat guards, and calibrates confidence thresholds from recommendation-outcome pairs—with full traceability.

By confining the Recommendation Model to guidance, SkinIntel preserves separation of concerns: evidence remains in Scan Records, change evaluation in Outcomes, exposure context in Product, Ingredient, and Routine Models, and actionable next steps in accountable, explainable recommendations—always proportional to evidence, always citeable, and always subject to later outcome evaluation.

---

## Formulation Model

The Formulation Model defines how SkinIntel understands a product's composition as a structured formulation context, not just a flat ingredient list. It is the platform's representation of *how ingredients relate inside a product*: their roles, categories, functional purpose, likely concentration context where available, interaction context, and verification posture. Where the Product Model answers *what product exists* and the Ingredient Model answers *what each ingredient is*, the Formulation Model answers *how those ingredients are composed together* in a specific product—and with what confidence the platform knows that composition.

A formulation is not only "which ingredients are present." An ordered INCI string alone cannot express that niacinamide appears as a primary active while glycerin serves as humectant base support, that two exfoliating acids coexist in potentially cumulative roles, or that preservative system members frame stability context for the actives they protect. Formulation context is what enables intelligence to reason about overlap, gap, strength, and functional coverage—not merely ingredient name matching.

The Formulation Model is a conceptual knowledge object. It describes composition structure semantics, role assignment, and confidence posture—not storage fields, parsing pipelines, or enrichment service design. How formulations are extracted, normalized, or displayed is downstream implementation. The model itself must remain stable, neutral, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Formulation as structured composition context

Personal Skin Intelligence requires understanding products as formulated systems, not ingredient bags. Two moisturizers may share glycerin and ceramides yet differ materially in active emphasis, exfoliant presence, or preservative load. Routine overlap analysis asks whether cumulative exfoliation exposure exceeds personal tolerance—not whether the same ingredient names appear anywhere in two labels. Gap analysis asks whether the routine lacks sun protection or barrier support at the functional level—not whether a product with "moisturizer" in its name exists.

The Formulation Model captures this structure as composition context linked to Product Model identity. Each formulation expresses product-to-ingredient relationships with role, category, function, and confidence annotations. Ingredient identities resolve through Ingredient Model canonical references—not redefined within formulation. User exposure aggregates through Routine Model and usage relationships. Outcomes and recommendations reference formulation context when evaluating or guiding exposure—not by embedding personal conclusions inside composition definitions.

Without formulation context, Product Intelligence knows *what* is in a product as text; Formulation Intelligence knows *what that composition means* for overlap, gap, and functional analysis.

### Connected knowledge domains

The Formulation Model connects composition knowledge across the platform:

- **Products** — Formulation belongs to a product; Product Model supplies identity while Formulation Model supplies structured composition for that identity.
- **Ingredients** — Canonical ingredient references from Ingredient Model, with formulation-specific role and context—not redefined ingredient knowledge.
- **Ingredient roles** — Functional position within the product: primary active, supporting active, base, solvent, preservative, and comparable role assignments.
- **Ingredient categories** — Classification context within formulation: humectant, emollient, surfactant, exfoliant, UV filter, and related taxonomy.
- **Cosmetic functions** — What the formulated combination is oriented toward: hydration support, barrier reinforcement, exfoliation, pigmentation addressing, oil control, sun protection—expressed as cosmetic purpose, not medical effect.
- **Concentration awareness** — Declared concentration, label order position, or inferred strength context where available—with explicit confidence when inferred rather than declared.
- **Formulation version** — Linkage to known composition revisions when reformulation materially changes ingredient structure or role balance.
- **Source confidence** — Confidence in composition accuracy derived from source type and verification status.
- **Verification status** — Whether formulation is verified, provisional, partial, or uncertain.
- **User exposure** — Reference surface linking formulation to exposure periods through routines and usage—not personal logs embedded in formulation.
- **Outcomes** — Reference surface enabling evaluation of change in context of formulated exposure—not outcome conclusions stored on formulation.
- **Recommendations** — Reference surface enabling guidance about overlap, gap, pause, or alternative based on formulation analysis.
- **Future formulation gap analysis** — Aggregate functional coverage across routine products identifying unmet cosmetic needs relative to personal evidence.

This connectivity enables explainable composition reasoning. When intelligence flags exfoliation overlap, it cites formulation role context across concurrent products—not opaque ingredient string comparison.

### Verified and provisional formulations

The Formulation Model must support both verified and provisional formulations. Real-world composition knowledge arrives with variable quality; intelligence must operate honestly across the full range.

A **verified formulation** is supported by trusted INCI sources or admin verification. Identity of included ingredients, order where relevant, and role assignments carry confidence sufficient for high-stakes analysis: cumulative active exposure, duplicate detection across routine, and comparison against prior products with known composition.

A **provisional formulation** may come from OCR, user paste, retailer page, product photo, or incomplete label extraction. Provisional status preserves honest uncertainty. Partial composition—known humectants and preservatives but uncertain active concentration—still supports valuable analysis with widened confidence bounds. Intelligence layers must not treat provisional formulation as verified when making strong guidance.

Raw INCI text is not the final formulation model. Raw INCI is an input signal that must be normalized into ingredient identities and formulation context with provenance and confidence. Verbatim label strings remain traceable as extraction input; canonical formulation structure resolves through Ingredient Model references, role assignment, and verification progression. A product whose raw INCI was OCR-captured yesterday and verified today should present one formulation thread with upgraded confidence—not two disconnected composition records.

### Capabilities the model must support

The Formulation Model is designed to enable current platform behavior and planned formulation intelligence. It must support:

- **Product-to-ingredient composition** — Structured linkage between product identity and canonical ingredient references with formulation-specific context.
- **Ingredient order where available** — INCI order or declared sequence supporting concentration inference where label position implies relative level.
- **Declared concentration where available** — Explicit percentage or concentration claims when present on label or verified source—not invented precision.
- **Formulation versioning** — Tracking composition revisions linked to Product Model formulation version when reformulation occurs.
- **Active vs supporting ingredient context** — Distinction between primary actives and supporting functional components within the same product.
- **Functional roles** — Base, solvent, preservative, humectant, emollient, surfactant, exfoliant, UV filter, and other role classifications orienting intelligence scope.
- **Duplicate or overlapping active detection** — Cross-product and within-product identification of redundant functional exposure—same active class across multiple routine items.
- **Formulation strength estimation where appropriate and confidence-aware** — Inferred intensity from order, declared concentration, or product type context—never presented as verified fact without source support.
- **Compatibility context** — General combination considerations between ingredient classes within and across products—context for intelligence, not universal prescriptions.
- **Barrier-support context** — Functional orientation toward barrier reinforcement within formulation structure.
- **Irritation or sensitivity caution context where evidence supports it** — Documented general cautions tied to formulation patterns, expressed with evidence confidence—not fear labels.
- **Source provenance** — Origin of composition knowledge: verified catalog, admin review, OCR, user paste, retailer extraction.
- **Verification confidence** — Composite confidence in formulation accuracy accounting for source, completeness, and match quality.
- **Relationship to user routines** — Reference surface linking formulation to concurrent products in active routine for aggregate analysis.
- **Relationship to outcomes** — Reference surface for evaluating change against formulated exposure periods.
- **Relationship to recommendations** — Reference surface for gap-fill, overlap reduction, and alternative product guidance.
- **Future comparison between products** — Side-by-side formulation context comparison for alternatives and substitutes.
- **Future formulation gap analysis** — Routine-level functional coverage assessment identifying missing cosmetic roles relative to personal goals and evidence.

These capabilities depend on formulation remaining composition context—not a duplicate of Product or Ingredient Model definitions.

### Formulation Intelligence questions

The Formulation Model enables Formulation Intelligence to answer questions central to Personal Skin Intelligence:

- **What functional roles a product covers** — Role and function decomposition: hydration, exfoliation, sun protection, barrier support, and comparable coverage.
- **Whether two products overlap in active function** — Duplicate or cumulative active detection across products in routine context.
- **Whether a routine has too much exfoliation exposure** — Aggregate exfoliant role analysis across concurrent routine items—contextual to user tolerance evidence, not universal rules.
- **Whether a product mainly supports hydration, barrier, exfoliation, pigmentation, oil control, or sun protection** — Primary functional orientation derived from formulation role context.
- **Whether a product fills a routine gap** — Gap analysis against aggregate routine formulation coverage and personal evidence priorities.
- **Whether a previous unsuccessful product shares formulation patterns with a proposed product** — Pattern comparison across role, category, and active context linked to prior negative outcomes for this user.
- **Whether ingredient exposure is duplicated across products** — Canonical ingredient attribution revealing redundant presence across routine products.
- **Whether a product's formulation is known, partial, uncertain, or verified** — Verification status and confidence reporting enabling proportional intelligence behavior.

Formulation Intelligence reads composition context from this model and Ingredient Model references. It writes correlations, recommendations, and analyses elsewhere. It does not embed personal verdicts or guidance text inside formulation definitions.

### Neutrality and contextual interpretation

The Formulation Model must remain neutral. It must not claim that a formulation is universally good or bad. A high-exfoliant formulation may suit one user's goals and tolerance while overwhelming another's barrier. A fragrance-containing formulation may be acceptable for one user and correlated with sensitivity for another. Composition context describes structure and general functional orientation; personal verdict belongs in outcomes, correlations, and recommendations.

Interpretation must depend on:

- **User history** — Prior exposures, outcomes, and tolerance patterns for this individual.
- **Symptoms** — Current and historical presentation signals from Scan Records and Symptom Model references.
- **Body areas** — Application zones affecting cumulative exposure interpretation.
- **Routine structure** — Concurrent products, step order, and frequency from Routine Model relationships.
- **Frequency of use** — Daily versus occasional application altering cumulative formulation impact.
- **Other products used at the same time** — Cross-product formulation interaction within active routine periods.
- **Outcome evidence** — Reported change linked to exposure windows through Outcome Model references.
- **Formulation confidence** — Verified versus provisional composition shaping how strongly intelligence may reason.
- **Ingredient verification quality** — Uncertain ingredient matches within formulation widen interpretation bounds.

General formulation knowledge describes roles, functions, and documented cautions with confidence. Personal guidance—reduce exfoliation overlap, this formulation pattern matched a prior negative outcome—belongs in Recommendation and correlation outputs with evidence chains.

### What does not belong in the Formulation Model

Architectural discipline requires explicit boundaries. The Formulation Model is formulation composition context only. The following must not be embedded in formulation definitions as authoritative content:

- **Product identity definitions** — Product knowledge belongs in the Product Model; formulation links to product identity.
- **Ingredient identity definitions** — Canonical ingredient knowledge belongs in the Ingredient Model; formulation references canonical identity with role context.
- **Personal usage logs** — Application records belong in usage and routine evidence objects.
- **Symptom severity values** — Moment-specific severity belongs on Scan Records.
- **Outcome conclusions** — Change evaluations belong in Outcome objects with evidence chains.
- **Recommendation text** — Guidance language belongs in Recommendation objects referencing formulation analysis.
- **Diagnosis** — Clinical conclusions are outside formulation scope.
- **Treatment claims** — Therapeutic assertions are governed intelligence outputs, not composition context.
- **Marketing claims treated as truth** — Brand promises about efficacy are not verified formulation knowledge.
- **Raw OCR text as final truth** — Extracted strings are input with provenance until normalized.
- **Unsupported assumptions** — Inferred roles or concentrations without confidence annotation must not present as verified structure.
- **Affiliate or purchase logic** — Commerce mechanics are unrelated to formulation semantics.

If information describes *what product this is*, *what an ingredient is in the abstract*, *how the user applied it*, *what changed*, or *what to do next*, it belongs elsewhere and references formulation by linkage. The model answers *how ingredients are structured inside a product*, with confidence—not *who should buy it* or *whether it cured anything*.

### Formulation composition context only

The Formulation Model is deliberately scoped. It is the platform's composition architecture for products: ingredient relationships, roles, categories, functions, concentration awareness, versioning, verification posture, and reference surfaces for exposure, outcome, and recommendation analysis. It does not define product identity, normalize ingredient catalogs, log usage, evaluate change, or prescribe actions.

The division of responsibility across models is explicit and must be preserved:

- **Formulation Model** — *How* ingredients are structured inside a product.
- **Product Model** — *What* product exists.
- **Ingredient Model** — *What* ingredients exist.
- **Routine Model** — *How* the user is exposed.
- **Outcome Model** — *What* changed after exposure.
- **Recommendation Model** — *What* to do next.

Intelligence Engines consume formulation context as composition input. Product Intelligence and Input Intelligence normalize raw INCI and label extraction into formulation structure—verified or provisional. Formulation Intelligence analyzes overlap, gap, functional coverage, and pattern similarity. Ingredient Intelligence aggregates canonical exposure through formulation links. Correlation Engine evaluates formulation patterns against symptom and outcome trajectories. Recommendation Engine proposes gap-fill, overlap reduction, and alternatives grounded in formulation analysis and personal evidence. Formulation Engine addresses unmet needs when existing product formulations do not satisfy documented requirements.

By confining the Formulation Model to formulation composition context, SkinIntel preserves separation of concerns: product identity and ingredient catalogs remain stable while composition structure, verification, and functional analysis evolve with enrichment—always linkable through traceable, explainable references to how each product is formulated and with what confidence the platform knows it.

---

## Longitudinal Timeline

The Longitudinal Timeline defines how SkinIntel organizes the user's skin journey over time. It is the platform's chronological evidence structure: the ordered assembly of everything that happened, was observed, was changed, was recommended, was confirmed or rejected, and was evaluated—connected across weeks, months, and years into a coherent personal history. The timeline is not a presentation convenience. It is the architectural backbone through which intelligence understands sequence, context, and change.

The timeline is not just a list of scans. Scans are essential moments, but they alone cannot express that a product was introduced eleven days before redness escalated, that a routine was simplified twice in one month, or that a recommendation to pause was rejected and followed by a different outcome trajectory. The Longitudinal Timeline connects scan events to symptom observations, body-area-specific evidence, product and routine change events, exposure windows, recommendation and feedback events, outcome evaluations, uncertainty markers, and learning signals—preserving *when* each occurred and *in what sequence* relative to everything else.

The Longitudinal Timeline is a conceptual knowledge object. It describes temporal organization semantics, event linkage, and historical preservation rules—not storage fields, query interfaces, or visualization design. How the timeline is indexed, rendered, or traversed is downstream implementation. The model itself must remain stable, evidence-based, traceable, and explainable to every Intelligence Engine regardless of technology or provider.

### Backbone of the Personal Evidence Base

The timeline is the backbone of the Personal Evidence Base. Every other knowledge object in this document contributes content; the Longitudinal Timeline supplies temporal structure. Scan Records contribute moments. Product, Ingredient, Formulation, and Routine Models contribute exposure objects and change events. Symptom and Body Area Models contribute classification vocabulary referenced at each observation. Recommendation Model contributes guidance events. Outcome Model contributes change evaluations. User feedback contributes first-person evidence. Learning signals contribute calibration inputs—all positioned on a shared chronological axis.

Without the timeline, SkinIntel cannot understand change. Improvement and worsening require before-and-after windows anchored to real events. Without the timeline, the platform cannot understand sequence: did the product precede the symptom shift or follow it? Without the timeline, cause-and-effect candidates remain untestable assertions rather than temporally grounded hypotheses. Recurring patterns—seasonal flaking, post-travel sensitivity, repeated negative response to a formulation class—emerge only when events accumulate in order across months. Progress narratives require milestone assembly over time, not snapshot comparison alone.

Memory Engine assembles and retrieves timeline structure. Correlation Engine traverses it for temporal alignment. Prediction Engine projects forward from trajectory segments. Outcome Intelligence bounds evaluation windows using timeline events. Recommendation Engine assesses evidence sufficiency by measuring scan density and event completeness across relevant periods. The Longitudinal Timeline is the shared temporal contract between these layers.

### Event types the timeline must support

The Longitudinal Timeline is designed to accommodate the full scope of personal skin evidence. It must support:

- **Scan events** — Point-in-time capture sessions: immutable Scan Records positioned at their timestamps with full session context references.
- **Symptom observations** — Symptom references linked to scans or standalone feedback moments, with severity and body area bindings where applicable.
- **Body-area-specific observations** — Regional evidence scoped through Body Area Model references within scan and feedback events.
- **Product introduction events** — Onset of product usage: when a product entered the user's active exposure context through routine or direct use.
- **Product stop events** — Cessation or pause of product usage: closing an exposure window for correlation and outcome evaluation.
- **Routine change events** — Structural modifications: additions, removals, reorderings, frequency shifts—preserved as distinct temporal events, not silent overwrites.
- **Ingredient exposure windows** — Periods during which canonical ingredient exposure accumulated through product composition and usage, bounded by product and routine events.
- **Formulation exposure windows** — Periods during which specific formulation context applied, including verification confidence at time of exposure where relevant.
- **Recommendation events** — Guidance issued by the platform: intent, target, confidence, and evidence references positioned at issuance time.
- **User confirmation or rejection events** — Governed user responses to recommendations and platform-observed outcomes, preserved in the evidence chain.
- **Outcome evaluation events** — Structured change interpretations from the Outcome Model, with confidence, scope, and evidence references.
- **Follow-up events** — Scheduled reassessments, prompted scans, and check-ins linked to prior recommendations or outcome evaluations.
- **Uncertainty markers** — Explicit flags when evidence was sparse, conflicting, or provisional at a point in time—preventing retrospective inflation of confidence.
- **Confidence changes over time** — Transitions in verification status, composition confidence, or outcome certainty as knowledge matured.
- **Before/after comparison windows** — Defined temporal brackets anchored to events, used by Outcome Intelligence for structured change evaluation.
- **Progress milestones** — Significant journey markers: first scan, major routine overhaul, sustained improvement period, goal achievement declarations.
- **Recurring pattern detection** — Reference surface for Correlation Engine to identify repeating temporal associations across months.
- **Personal threshold learning** — Reference surface for Learning Layer inputs derived from accumulated outcome and feedback sequences.
- **Future prediction context** — Trajectory segments assembled for Prediction Engine projection from ordered historical evidence.

These event types interleave on a single chronological axis. Intelligence traverses the axis to answer questions scoped by time, not by object type alone.

### Historical truth and non-destructive change

The timeline must preserve historical truth. Current state must never erase previous state. When a user changes a routine, stops a product, updates symptoms, or corrects feedback, the platform must preserve what was known before and what changed after.

This principle extends every object on the timeline. A routine edit creates a routine change event; it does not replace the prior routine structure as if it never existed. A product stop closes an exposure window; it does not delete usage history during the active period. A symptom correction on a scan creates a governed correction record; it does not mutate the original Scan Record. A user who rejects a recommendation preserves that rejection as timeline evidence, not a silent absence.

Overwritten historical state is an architectural failure. If the platform displays only current routine when evaluating a scan from six weeks ago, correlation breaks—the scan's routine snapshot reference becomes meaningless. If product introduction dates shift retroactively without event records, outcome windows become untrustworthy. The Longitudinal Timeline enforces append-only temporal semantics for evidence: new events add to history; they do not rewrite it.

Current state is derived from the latest relevant events on the timeline, not stored as a replacement for history. When intelligence needs *what is the routine now*, it reads forward from routine change events to the present. When it needs *what was the routine at scan time*, it reconstructs from events bounded by that timestamp.

### Timeline Intelligence questions

The Longitudinal Timeline enables Timeline Intelligence to answer questions central to Personal Skin Intelligence:

- **What happened before this change** — Event sequence preceding a symptom shift, outcome, or user action, bounded by configurable lookback context.
- **What changed after this product was introduced** — Post-introduction window assembly linking product start event to subsequent scans, symptoms, and outcomes.
- **What was the routine at the time of this scan** — Reconstructed routine state from routine change events and scan timestamp, honoring Scan Record routine snapshot references.
- **Which symptoms persisted across months** — Longitudinal symptom observation sequence identifying chronic versus episodic presentation patterns.
- **Which body areas improved over time** — Regional outcome trajectory assembled from body-area-scoped observations and evaluations across windows.
- **Which recommendations were followed** — Confirmation events linked to recommendation events on the timeline.
- **Which recommendations were rejected** — Rejection events preserved with optional rationale, informing anti-repeat and learning logic.
- **Which outcomes repeated** — Recurring outcome evaluation patterns linked to similar exposure or routine contexts across periods.
- **Which product or ingredient exposure windows overlap with symptoms** — Temporal intersection analysis between exposure bounds and symptom observation sequences.
- **Whether the platform has enough evidence to make a confident recommendation** — Event density, scan frequency, and uncertainty marker assessment within relevant windows.
- **What the user's skin journey looked like over weeks, months, or years** — Narrative and analytical assembly of the full chronological evidence structure for presentation and intelligence context.

Timeline Intelligence reads event structure; it does not redefine the objects events reference. Scans remain Scan Records. Products remain Product Model identities. Outcomes remain Outcome Model evaluations. The timeline supplies *when* and *in what order*.

### Time windows and contextual meaning

Time windows are essential. The same data point has different meaning depending on whether it happened before, during, or after a product, routine, or recommendation event. A severity report of moderate redness is baseline context if recorded before product introduction; it is escalation evidence if recorded two weeks after. A scan showing stability is uninformative for outcome evaluation if captured before the recommended change took effect; it is central evidence if captured within the review window after.

The Longitudinal Timeline makes windows explicit. Product exposure windows bound ingredient and formulation exposure. Recommendation review windows bound outcome evaluation of guidance effect. Before/after comparison windows bound Outcome Model assessments. Intelligence layers must anchor interpretation to window membership on the timeline—not treat all historical data as equally relevant to every question.

Window boundaries derive from events: product start and stop, routine change timestamps, recommendation issuance and review dates, outcome evaluation periods. Ambiguous boundaries—uncertain product start date from provisional entry—carry uncertainty markers that widen window interpretation appropriately.

Timeline interpretation must remain evidence-based and confidence-aware. Sparse event sequences produce wide windows with low confidence. Dense, verified event sequences support narrow windows with stronger evaluative power. The timeline preserves uncertainty markers so retrospective analysis does not falsely assume completeness that did not exist at the time.

### What does not belong in the Longitudinal Timeline

Architectural discipline requires explicit boundaries. The Longitudinal Timeline is chronological evidence structure only. The following must not be embedded as timeline semantics or allowed to corrupt temporal integrity:

- **Diagnosis** — Clinical conclusions are not timeline events; they belong in governed intelligence outputs if ever in scope.
- **Medical conclusions** — Pathological interpretation is outside timeline evidence structure.
- **Product identity definitions** — Product knowledge belongs in the Product Model; timeline carries product introduction and stop events referencing identity.
- **Ingredient identity definitions** — Canonical ingredient knowledge belongs in the Ingredient Model; timeline carries exposure windows referencing identity.
- **Formulation definitions** — Composition context belongs in the Formulation Model; timeline carries formulation exposure windows referencing that context.
- **Recommendation text as standalone advice without event context** — Guidance content belongs in Recommendation Model objects positioned as recommendation events with full metadata.
- **Outcome conclusions without evidence references** — Change evaluations belong in Outcome Model objects with traceable evidence chains, positioned as outcome evaluation events.
- **Overwritten historical state** — Retroactive erasure or silent replacement of prior events violates timeline integrity.
- **Unstructured memory without timestamps** — Narrative without temporal anchoring is not timeline evidence; it must link to timestamped events or scans.
- **Unsupported causation** — Causal assertions without temporal grounding and confidence posture are correlation hypotheses, not timeline facts.
- **Marketing or commerce logic** — Purchase events and commercial mechanics are outside personal skin evidence timeline scope unless explicitly governed as non-intelligence context.

If information defines *what* an object is, *what* guidance says in full, or *what* changed without evidence, it belongs in the appropriate model object and appears on the timeline only as a properly structured, timestamped event referencing that object. The timeline answers *when things happened and in what sequence*—not *what they are* in definitional terms.

### Chronological evidence structure only

The Longitudinal Timeline is deliberately scoped. It is the platform's temporal spine: ordered events, exposure windows, comparison brackets, uncertainty markers, and reconstruction rules that bind the Personal Evidence Base across time. It does not capture moment content, define vocabulary, structure formulations, evaluate change, or prescribe guidance—it positions those objects in time.

The division of responsibility across models is explicit and must be preserved:

- **Longitudinal Timeline** — *When* things happened and *in what sequence*.
- **Scan Record** — *What* was captured at one moment.
- **Symptom Model** — *What* was observed.
- **Body Area Model** — *Where* it was observed.
- **Product, Ingredient, and Formulation Models** — *What* the exposure objects are.
- **Routine Model** — *How* exposure happened.
- **Recommendation Model** — *What* guidance was given.
- **Outcome Model** — *What* changed over time.

Intelligence Engines consume timeline structure as temporal context. Memory Engine assembles, indexes, and retrieves chronological evidence. Input Intelligence writes timestamped events from user actions and capture sessions. Correlation Engine traverses event sequences for temporal alignment and pattern detection. Outcome Intelligence bounds evaluation windows using timeline anchors. Recommendation Engine assesses evidence sufficiency across relevant periods. Prediction Engine extracts trajectory segments for forward projection. Learning Layer consumes ordered outcome and feedback sequences for personal calibration.

By confining the Longitudinal Timeline to chronological evidence structure, SkinIntel preserves the integrity of personal history: every moment, change, guidance, and evaluation remains findable in sequence—never erased by the present, always available for explainable intelligence that respects what actually happened on the user's skin journey over time.

---

## AI Knowledge Objects

AI Knowledge Objects define how SkinIntel stores and references AI-generated interpretations, inferences, confidence assessments, uncertainty explanations, evidence links, and learning signals. They are the platform's durable record of what artificial intelligence contributed to personal skin intelligence—not the model weights, not the prompt templates, not the vendor response payload, but the normalized knowledge artifacts that persist after processing: what was inferred, why, from what evidence, with what confidence, and with what uncertainty acknowledged.

AI Knowledge Objects are not the AI model itself. They are not prompts. They are not provider-specific outputs frozen as the platform's truth. They are traceable, explainable intelligence artifacts created or assisted by AI and grounded in the Personal Evidence Base. When Input Intelligence suggests symptom alignment during capture, when Correlation Engine proposes a temporal association between product introduction and symptom escalation, when Prediction Engine generates a trajectory candidate—these contributions become AI Knowledge Objects linked to evidence, not orphaned text discarded when the session ends or the provider changes.

The AI Knowledge Objects layer is a conceptual knowledge domain. It describes inference artifact semantics, accountability rules, and provider independence requirements—not storage fields, model routing, or API integration design. How AI is invoked, which provider serves a request, and how responses are parsed are downstream implementation. The objects themselves must remain stable, evidence-linked, and intelligible regardless of which AI provider generated the underlying inference.

### Provider independence and durable artifacts

AI providers may change. Models version, vendors replace, capabilities shift, and cost structures evolve. SkinIntel's intellectual structure cannot bind itself to any single provider's output format, token layout, or response schema. AI Knowledge Objects must remain stable through provider transitions: the inference that redness on the cheeks may correlate with a serum introduced twelve days prior must remain retrievable and explainable whether it was produced by one vendor's model in 2025 or another's in 2028.

Provider independence means normalizing AI contributions into platform-defined object types with internal semantics. Provider identity may be recorded as provenance metadata for audit—which system produced the raw inference—but the authoritative artifact is the SkinIntel AI Knowledge Object with its evidence links, confidence posture, and uncertainty explanation. Re-processing a scan with an improved model creates new or superseding objects; it does not silently replace historical intelligence without traceability.

This stability aligns with the Design Principles governing the broader Data Model: technology independence, language independence, and durability across change. AI assists interpretation; AI Knowledge Objects preserve what that interpretation was at the time it mattered.

### Connected knowledge domains

AI Knowledge Objects must connect to the full personal evidence graph:

- **Scan records** — Primary evidence anchors for capture-time interpretations and post-scan analyses.
- **Symptoms** — Symptom Model references scoped to inference: suggested alignments, trajectory observations, pattern notes.
- **Body areas** — Body Area Model references regionalizing inference scope.
- **Products** — Product Model references when inference concerns product introduction, overlap, or exposure context.
- **Ingredients** — Ingredient Model references when inference concerns composition or cumulative exposure.
- **Formulations** — Formulation Model references when inference concerns functional overlap, gap, or strength context.
- **Routines** — Routine Model references when inference concerns usage structure, change timing, or overload signals.
- **Recommendations** — Recommendation Model references when inference supports or evaluates guidance rationale.
- **Outcomes** — Outcome Model references when later change evaluation confirms, contradicts, or retires prior inference.
- **Longitudinal timeline events** — Temporal positioning of inference relative to product, routine, recommendation, and scan events.
- **Evidence references** — Traceable links to Scan Records, user feedback, routine change events, and comparable primary evidence.
- **Confidence levels** — Explicit confidence in the inference derived from evidence quality, completeness, and alignment.
- **Uncertainty explanations** — Documented gaps: sparse scans, provisional product identity, conflicting signals, model limitation acknowledgment.
- **User confirmations or corrections** — Governed user acceptance, rejection, or correction of AI-generated interpretation.
- **Learning signals** — Inputs for Learning Layer calibration: inference accuracy, confirmation rates, outcome alignment over time.

Connectivity ensures no AI contribution floats free of accountability. An inference without evidence references is not a valid AI Knowledge Object—it is ungrounded output that must not enter the Personal Evidence Base as intelligence.

### Object types the model may include

AI Knowledge Objects may include distinct artifact types, each serving a specific intelligence role:

- **Interpretation objects** — Structured readings of evidence: suggested symptom alignment, image observation annotations, context enrichment proposals at capture or analysis time.
- **Hypothesis objects** — Testable propositions linking exposure, routine change, or environmental context to symptom trajectory—explicitly provisional until outcome evidence evaluates them.
- **Confidence assessments** — Standalone or embedded confidence evaluation of an inference, evidence chain, or data quality posture.
- **Uncertainty explanations** — Human-readable and machine-auditable rationale for why confidence is limited.
- **Correlation candidates** — Temporally grounded associations between events and symptom patterns—candidates, not confirmed causation.
- **Pattern observations** — Recurring structures detected across timeline segments: seasonal recurrence, repeated post-introduction escalation, stable tolerance periods.
- **Prediction candidates** — Forward-looking trajectory proposals with explicit confidence bands and assumption declarations.
- **Recommendation rationale objects** — Structured reasoning supporting Recommendation Model outputs, separable from the recommendation text itself for audit and learning.
- **Safety boundary flags** — Signals that symptom severity, duration, or pattern may exceed cosmetic guidance scope—escalation candidates, not diagnoses.
- **Data quality assessments** — Evaluation of evidence sufficiency within a window: scan density, verification completeness, conflicting sources.
- **Evidence summaries** — Condensed, traceable assembly of relevant evidence for a decision context—always linked to source records, not substitute truth.
- **Learning signals** — Structured inputs recording inference outcome: confirmed, rejected, contradicted by later evidence, retired due to model upgrade.

Type discipline prevents collapsing all AI output into undifferentiated "AI notes." A hypothesis object behaves differently from a confirmed interpretation; conflating them corrupts outcome evaluation and learning loops.

### Required properties of every AI Knowledge Object

Every AI Knowledge Object must conform to architectural requirements:

- **Traceable** — Origin, timestamp, processing context, and supersession chain retrievable for audit.
- **Explainable** — Rationale expressible to users and auditors: why this inference, not only what it says.
- **Evidence-linked** — References to primary evidence; no inference stands alone without linkage.
- **Confidence-aware** — Explicit confidence appropriate to evidence strength; never implied certainty by presentation.
- **Version-aware** — Model or processing version recorded as provenance; upgrades create superseding objects, not silent replacement.
- **Provider-independent** — Normalized platform semantics independent of vendor response format.
- **Non-authoritative without evidence** — Inference ranks below immutable Scan Records and governed user feedback; it assists, it does not override.
- **Reversible or supersedable when corrected by later evidence** — User correction, outcome contradiction, or model upgrade creates governed supersession; prior object remains in history.

These properties are constraints, not optional quality goals. Intelligence layers that produce unlinked, unconfident, or non-supersedable output violate the Data Model contract.

### Uncertainty preservation

AI Knowledge Objects must preserve uncertainty. They must not present weak inference as fact. They must not hide uncertainty behind polished language. Personal Skin Intelligence depends on honest epistemic posture: the platform knows what it knows, knows what it merely suspects, and communicates both.

When scan density is low, correlation candidates carry low confidence and explicit uncertainty explanations. When product composition is provisional, ingredient-related inference widens bounds. When user report conflicts with platform observation, both signals persist with divergence noted—not resolved by selecting the more fluent narrative. Recommendation rationale objects must cite uncertainty that motivated monitor-or-wait guidance rather than smoothing it into confident product suggestions.

Uncertainty preservation protects downstream layers. Recommendation Engine must not amplify weak inference into strong guidance. Outcome Intelligence must not treat low-confidence prediction candidates as failed predictions when they were honestly uncertain. Learning Layer must not penalize models for appropriate uncertainty expression.

### Intelligence accountability questions

AI Knowledge Objects enable Intelligence layers to answer accountability questions:

- **What did the AI infer** — Retrieval of specific interpretation, hypothesis, or pattern object with type and scope.
- **Why did it infer that** — Rationale and evidence summary linked to the object.
- **What evidence supported it** — Evidence reference enumeration with primary source traceability.
- **What evidence was missing** — Uncertainty explanation documenting gaps that limited confidence.
- **How confident was the platform** — Confidence assessment at time of inference creation.
- **Did the user confirm or reject the interpretation** — Confirmation or correction events linked to the object.
- **Did later outcomes support or contradict the inference** — Outcome Model cross-reference evaluating inference against subsequent change evidence.
- **Should this inference be reused, downgraded, replaced, or retired** — Supersession and learning signal evaluation based on confirmation, outcome alignment, and model upgrade.
- **What did the platform learn from the result** — Learning signal assembly for calibration without embedding learned rules as immutable truth inside the object.

These questions define explainability for AI-assisted intelligence. A user who asks *why did you think that?* must receive an answer grounded in AI Knowledge Objects and their evidence chains—not a regenerated explanation that may differ from what was originally inferred.

### Historical accountability

AI Knowledge Objects must support historical accountability. If the AI interpretation changes later, the old interpretation must remain traceable as historical intelligence, not silently overwritten.

Reprocessing scans with improved models, revising correlation candidates after new evidence arrives, or superseding hypothesis objects after outcome evaluation—all produce new objects that reference what they supersede. The prior inference remains retrievable: what the platform believed at time T, with what evidence, at what confidence. This mirrors Scan Record immutability applied to intelligence layer: beliefs evolve; history of beliefs is preserved.

Silent overwrite destroys auditability and learning integrity. If yesterday's interpretation vanishes when today's model runs, Outcome Intelligence cannot evaluate whether prior guidance was reasonable given prior evidence. Users cannot trust that the platform acknowledges its own evolution. Historical accountability requires append-only or supersession-chain semantics for AI Knowledge Objects.

User corrections follow the same pattern. A corrected interpretation creates a new object or governed correction record referencing the original—not deletion of what the AI suggested before correction.

### Supersession Semantics

AI Knowledge Objects are normalized, platform-defined artifacts produced from AI provider output. They are not raw AI responses. They are not final truth by themselves. Each object represents what the platform inferred or assessed at a point in time—structured, evidence-linked, traceable, explainable, provider-independent, and version-aware. Supersession semantics govern how those objects evolve when evidence improves, inputs are corrected, models change, or governance requires knowledge to be retired or limited without destroying historical accountability.

**Core supersession rules**

AI Knowledge Objects must not be silently overwritten. Reprocessing creates a new object or a superseding object—not an invisible replacement of what existed before. Superseded objects may remain historically inspectable where Deletion and Retention Governance permits. The current reasoning view may prefer the most recent valid superseding object, but preference for current use is not erasure of prior state.

Supersession must preserve lineage. Every supersession chain must be able to answer, conceptually: what was the original object; what object superseded it; why supersession occurred; what evidence supported the change; which provider or model contributed where relevant; what confidence posture applied at each stage; and what timestamp or version context bounded each object's validity. Lineage is the platform's record of intellectual evolution—not a convenience for debugging, but a requirement for longitudinal integrity.

Downstream intelligence that depended on a superseded object must not continue unchanged as if nothing happened. Artifacts derived from superseded knowledge—correlation candidates extended into predictions, recommendation rationale built on retired hypotheses, learning signals calibrated from invalidated inference—may need to be marked stale, limited, invalidated, re-evaluated, confidence-downgraded, or excluded from future learning. Supersession propagates accountability: when upstream knowledge changes status, downstream consumers must respect that change through governed object status, not through implicit assumption that the latest scan re-run fixed everything silently.

**When supersession occurs**

Supersession may happen because of better evidence, corrected user input, model reprocessing, provider change, improved normalization, formulation update, deletion or retention governance action, or confidence downgrade. Each cause must be representable in supersession lineage so auditors and users can distinguish *we learned more* from *we were wrong* from *evidence is no longer available* from *the model improved*.

User correction should be treated as personal evidence and may trigger supersession. When a user rejects or corrects an AI interpretation, the correction enters the Personal Evidence Base as governed evidence; the superseding AI Knowledge Object references both the original inference and the correction event. Supersession must not erase historical reasoning context—the platform must remain able to explain what it inferred before correction and why that inference was reasonable given evidence available at that time.

Formulation update illustrates temporal sensitivity. When a product's verified composition changes, inference objects tied to prior formulation context may be superseded by objects scoped to the new formulation version. Exposure history remains anchored to the formulation version active during each usage window; supersession preserves that distinction rather than collapsing reformulation into a single undifferentiated product narrative.

**Supersession is not deletion**

Supersession and deletion are distinct governance mechanisms that must interact explicitly. Supersession governs knowledge evolution: a newer object replaces the current authority of an older one while lineage remains inspectable. Deletion and Retention Governance governs evidence availability: when evidence is withdrawn, expired, or removed under policy, knowledge objects that depended on that evidence may be superseded, limited, or marked unavailable—not preserved through hidden copies or ungoverned replicas.

AI Knowledge Objects must not preserve sensitive deleted evidence through shadow retention. If primary evidence is no longer available under governance rules, superseding objects must reflect reduced confidence, explicit unavailability, or retirement—not silent continuation as if the evidence still exists. Conversely, supersession must not be used as a workaround for deletion: retiring an object because evidence was deleted is a governed supersession with deletion as the stated reason, not a mutation that leaves deleted content recoverable through supersession chains without authorization.

Conflicting objects must not coexist without relationship or status. Two interpretations of the same evidence window cannot both present as current authority. Current state must be derived from governed object status—active, superseded, limited, retired, stale—not by mutating historical truth in place. Historical objects remain readable; current reasoning selects among governed statuses.

**Boundary rules**

AI Knowledge Objects must not diagnose disease, create medical labels, claim treatment effects, invent missing evidence, overwrite user evidence, bypass Data Model objects, become provider-specific blobs, silently train future personalization after deletion or withdrawal restrictions, or act as recommendations unless converted into Recommendation Model objects by the proper engine. Supersession does not relax these boundaries—a superseding object is subject to the same constraints as the object it replaces.

**Relationship to platform layers**

AI Knowledge Objects sit between raw AI contribution and durable platform reasoning. Their supersession semantics connect explicitly to adjacent architectural layers:

- **Evidence Layer** — AI Knowledge Objects interpret evidence; they do not replace it. Supersession triggered by new or corrected evidence must reference the Evidence Layer objects that motivated the change. User corrections and Scan Records remain authoritative inputs; supersession adjusts inference, not captured fact.

- **Personal Evidence Base** — Normalized AI Knowledge Objects persist within the user's longitudinal record as intelligence artifacts, not as vendor transcripts. Supersession chains are part of that base's accountability structure: what the platform believed, when, and what replaced it.

- **Knowledge Layer** — Product Intelligence, Ingredient Intelligence, Formulation Intelligence, and Routine Intelligence produce structured knowledge that AI Knowledge Objects may reference or enrich. Supersession in AI Knowledge Objects must respect Knowledge Layer object boundaries; inference supersession does not silently rewrite Product Model or Formulation Model truth—it supersedes interpretation of those objects.

- **Intelligence Engines** — Correlation, Prediction, Recommendation, and Outcome Intelligence produce and consume AI Knowledge Objects. When supersession retires an upstream object, engines that consumed it must re-evaluate or downgrade dependent outputs rather than propagate stale reasoning. Intelligence Engines initiate supersession through reprocessing; they do not mutate historical objects in place.

- **Confidence Layer** — Confidence posture is part of supersession lineage. A superseding object may carry higher or lower confidence than its predecessor; confidence downgrade alone may justify supersession without implying the prior inference was negligent—only that current epistemic posture has changed. The Confidence Layer qualifies both superseded and superseding objects for presentation and downstream use.

- **Deletion and Retention Governance** — When governance removes or restricts evidence, affected AI Knowledge Objects enter supersession or retirement paths governed by explicit reason codes. Deletion may make superseded objects non-inspectable under policy; supersession records that limitation rather than preserving forbidden content. Governance and supersession together ensure knowledge evolution remains lawful, traceable, and honest about what can no longer be shown or learned from.

Supersession semantics complete the contract begun in Historical accountability: AI Knowledge Objects evolve, but they evolve in the open—with lineage, governed status, downstream consequence, and layer-appropriate boundaries preserved across the platform lifecycle.

### What does not belong in AI Knowledge Objects

Architectural discipline requires explicit boundaries. AI Knowledge Objects are intelligence artifacts only. The following must not be embedded as core AI Knowledge Object semantics:

- **Raw prompts as core knowledge** — Prompt templates are implementation artifacts; normalized inference output is the object.
- **Provider-specific response formats as core model** — Vendor JSON, token streams, or API schemas are transport, not platform knowledge.
- **Hidden reasoning without evidence** — Chain-of-thought or internal reasoning not linked to evidence references is not accountable intelligence.
- **Diagnosis** — Clinical condition assignment exceeds AI Knowledge Object scope regardless of model capability.
- **Medical claims** — Therapeutic assertions belong in governed clinical contexts, not cosmetic inference artifacts.
- **Unsupported causation** — Definitive cause attribution without evidence and confidence support violates hypothesis object discipline.
- **Ungrounded hallucinated facts** — Inferences without evidence links or with fabricated reference are invalid objects.
- **Product marketing claims** — Brand promotional content is not AI inference ground truth.
- **User free-text as final truth** — Raw user language is input to normalize; governed user feedback is evidence, not unprocessed text as authoritative inference.
- **Implementation logs** — Service debug output, latency records, and routing metadata are operational artifacts, not knowledge objects.
- **Debugging artifacts** — Developer diagnostics excluded from Personal Evidence Base intelligence.
- **Temporary UI copy** — Presentation strings generated for display without evidentiary structure are not durable AI Knowledge Objects.

If content defines *what was captured*, *what changed*, *what guidance was given*, or *when events occurred*, it belongs in the appropriate domain model and may be *referenced* by AI Knowledge Objects—not duplicated or replaced by them.

### Intelligence artifacts only

AI Knowledge Objects are deliberately scoped. They are the platform's record of AI-assisted interpretation: inferences, hypotheses, confidence, uncertainty, correlation and pattern candidates, prediction proposals, rationale structures, safety flags, data quality assessments, evidence summaries, and learning signals—all normalized, evidence-linked, and accountable. They do not capture raw moments, define domain vocabulary, evaluate final change outcomes, issue guidance, or organize chronological structure—they interpret and connect those objects with explicit epistemic honesty.

The division of responsibility across models is explicit and must be preserved:

- **AI Knowledge Objects** — *What* the platform inferred, *why*, with what evidence, confidence, and uncertainty.
- **Scan Records** — *What* was captured.
- **Outcome Model** — *What* changed.
- **Recommendation Model** — *What* guidance was given.
- **Longitudinal Timeline** — *When* it happened.
- **Core domain models** — The vocabulary and objects being referenced: symptoms, body areas, products, ingredients, formulations, routines.

Intelligence Engines produce and consume AI Knowledge Objects throughout the platform lifecycle. Input Intelligence creates capture-time interpretation objects linked to Scan Records. Correlation Engine produces correlation candidates and pattern observations positioned on the Longitudinal Timeline. Prediction Engine produces prediction candidates with confidence bands. Recommendation Engine attaches rationale objects to Recommendation Model outputs. Outcome Intelligence evaluates prior inferences against subsequent change. Learning Layer consumes learning signals to calibrate confidence thresholds and inference reuse policy—with full historical traceability.

By confining AI contributions to normalized, accountable AI Knowledge Objects, SkinIntel preserves provider independence, epistemic honesty, and historical integrity: artificial intelligence assists the journey, but the platform owns what was inferred, knows why, and never pretends weak evidence was certainty—or erases what it once believed when evidence and models evolve.

---

## Confidence Taxonomy

Confidence Taxonomy is the shared vocabulary for representing uncertainty, evidence strength, and action strength across the SkinIntel Data Model. It applies wherever objects or outputs carry epistemic posture—not as decoration, not as medical certainty, not as diagnosis, and not as a mechanism to hide weak evidence behind polished presentation. Confidence is a structured posture attached to objects and outputs where uncertainty matters: evidence-linked, explainable, and auditable back to the evidence and uncertainty drivers that shaped it.

The Data Model defines what confidence means conceptually and which dimensions objects may declare. The Confidence Layer governs how confidence is expressed, qualified, and propagated across platform reasoning—but the taxonomy here is the stable vocabulary those expressions must use. Objects across Scan Records, domain models, AI Knowledge Objects, outcomes, and recommendations share this vocabulary so intelligence layers, learning loops, and user-facing surfaces speak consistently about what the platform knows, suspects, or cannot yet conclude.

### Confidence posture

Confidence posture is the summary category—user-facing or engine-facing—that communicates how strongly the platform may act on an object or output given available evidence. Posture is derived from confidence dimensions; it is not an arbitrary label assigned for presentation convenience.

The preferred conceptual posture values are:

- **high** — Evidence is dense, recent, consistent, and aligned enough for stronger cosmetic guidance within scope. High posture does not mean certainty, medical confidence, or guaranteed outcome—it means the platform has sufficient personal evidence to reason with reduced qualification.
- **medium** — Evidence is useful but incomplete or partly uncertain. Guidance and interpretation should remain qualified; assumptions must be visible; monitoring and follow-up evidence collection remain appropriate.
- **low** — Evidence is thin, conflicting, stale, or weak. Outputs should focus on cautious next steps, monitoring, evidence collection, or explicitly limited interpretation—not on confident product or routine direction.
- **insufficient** — The platform should not draw a substantive conclusion from available evidence. Outputs should ask for more evidence, limit scope, defer strong guidance, or—when safety boundary relevance applies—support escalation rather than cosmetic optimization.

Posture summarizes dimensions; it does not replace them. Two objects with the same posture may differ in which dimensions limited confidence and therefore in what action strength mapping permits.

### Confidence dimensions

Confidence is structured, not only a single label. Dimensions describe why a posture was assigned and which aspects of evidence quality matter for a given object. The taxonomy defines the following conceptual dimensions:

- **Evidence density** — How much relevant evidence exists within the applicable window: scan frequency, feedback depth, usage logging completeness.
- **Evidence recency** — How current the supporting evidence is relative to the question being answered; stale evidence may warrant downgrade even when historically dense.
- **Evidence consistency** — Alignment among scans, user reports, routine context, and structured observations over time; conflicting signals reduce consistency.
- **Source reliability** — Trustworthiness of how evidence or object data entered the platform: user attestation, catalog verification, OCR quality, admin confirmation.
- **User-platform signal alignment** — Agreement between user-described experience and platform-structured interpretation; divergence widens uncertainty.
- **Object verification status** — Whether identity, composition, formulation version, or classification is verified, provisional, or uncertain.
- **Temporal coverage** — Whether the evidence window spans enough time to support the claim: single-point capture versus sustained observation across an exposure period.
- **Uncertainty drivers** — Explicit documentation of what is missing, conflicting, or limiting: sparse scans, reformulation mid-window, simultaneous routine changes, deleted evidence under governance.
- **Safety boundary relevance** — Whether evidence patterns suggest cosmetic guidance may be insufficient or inappropriate regardless of other dimensions; may override normal action strength toward escalation.

Not every object requires every dimension. Every object that carries confidence must declare conceptually which dimensions apply and which uncertainty drivers limited posture. Undeclared confidence—posture without dimensional rationale—violates the taxonomy contract.

### Object-specific confidence

Confidence applies differently across object types. The taxonomy is unified; the emphasis shifts by domain:

- **Scan Record** — Capture quality and user context completeness: image clarity where relevant, symptom selection completeness, session context, and attestation level—not a judgment that the user's experience is untrue.
- **Symptom Model references** — Confidence in classification and mapping to platform vocabulary, not in whether the user experienced the symptom.
- **Product Model** — Product identity match certainty and source reliability: catalog match versus manual entry versus uncertain OCR linkage.
- **Ingredient Model** — Ingredient recognition certainty, synonym and alias resolution, and canonical link quality—not universal safety judgment.
- **Formulation Model** — Formulation version certainty, composition verification, and concentration awareness where available; reformulation mid-exposure lowers temporal confidence for cross-window comparison.
- **Routine Model** — Routine structure completeness, adherence confidence, and clarity of change-event timing—not prescription of what the user should do.
- **AI Knowledge Objects** — Inference confidence and evidence linkage strength; hypothesis objects carry lower default posture than outcome-confirmed interpretations.
- **Outcome Model** — Before/after comparability and outcome certainty: window integrity, confounding changes, scan density, and alignment between user report and structured trajectory.
- **Recommendation Model** — Action strength appropriate to evidence and uncertainty limits; escalation recommendations carry their own posture tied to safety boundary relevance.
- **Personal Threshold Learning** — Hypothesis strength and reversibility of learned calibration; learning signals are provisional until outcome evaluation confirms or contradicts them.

Object-specific confidence preserves separation of concerns: product identity confidence is not outcome confidence; inference confidence is not recommendation action strength—though downstream mapping connects them through governed propagation rules.

### Action strength mapping

Confidence posture maps conceptually to how strongly the platform may guide, interpret, or act within cosmetic scope:

- **High confidence** may support stronger cosmetic guidance—product direction, routine adjustment, or monitoring with defined evaluation windows—always within scope and never as medical certainty.
- **Medium confidence** supports qualified guidance: explicit assumptions, narrower scope, and expectation of follow-up evidence before treating conclusions as durable.
- **Low confidence** supports cautious next steps: monitoring, simplified routines, evidence collection prompts, and limited interpretation without strong directional pressure.
- **Insufficient confidence** should avoid substantive conclusions; the platform collects evidence, limits output scope, or defers to safety boundary escalation when relevant—not silent continuation of confident-sounding guidance.

Safety boundary relevance may override normal action strength. When evidence patterns indicate cosmetic guidance may be inadequate or unsafe, posture may be insufficient for routine optimization even if some dimensions appear moderate; Recommendation Engine may produce escalation-type guidance governed separately from product suggestion strength. Personal Threshold Learning must not suppress this override: personalization calibrates weighting within safe scope; it does not inflate action strength when safety boundaries apply.

### Auditability and propagation

Confidence must propagate through downstream artifacts with accountability. When a correlation candidate feeds a prediction, a prediction informs a recommendation, or an AI Knowledge Object supports an outcome evaluation, downstream objects inherit or explicitly re-evaluate confidence—they do not silently inherit high posture without dimensional review.

Downstream objects must not increase confidence without new evidence. A recommendation must not present as high confidence when its supporting correlation was medium and no additional evidence arrived. Propagation rules require either explicit re-assessment of dimensions at each layer or documented inheritance with unchanged posture and visible lineage.

Confidence may be downgraded when evidence becomes stale, when Deletion and Retention Governance removes or restricts supporting evidence, when AI Knowledge Objects are superseded, when formulation version changes invalidate prior composition context, or when user feedback conflicts with prior interpretation. Downgrade must update posture and uncertainty drivers—not mutate historical records to match the new posture retroactively.

Confidence posture must remain auditable: what posture was assigned, which dimensions applied, which uncertainty drivers limited it, and which evidence objects supported the assessment. Users who ask why guidance was cautious must receive answers grounded in taxonomy dimensions, not regenerated narratives.

The Confidence Layer governs expression and qualification at runtime; the Data Model defines the taxonomy objects use. Extensions to the platform must use this vocabulary or extend it through governed additive change—not introduce parallel confidence schemes that fragment accountability.

### Boundary rules

Confidence Taxonomy must not define medical certainty, diagnostic probability, or clinical authority. It must not hide weak evidence, convert uncertainty into false authority, let personalization override safety boundaries, permit recommendations without evidence linkage, or allow confidence inflation for commercial reasons. Confidence describes epistemic posture within a cosmetic and educational platform—not a license to speak with clinical precision the evidence does not support.

---

## User Correction Governance

User Correction Governance defines how user corrections, confirmations, rejections, clarifications, and feedback enter the Personal Evidence Base. Corrections are not informal edits scattered across the platform—they are governed evidence events with scope, lineage, and downstream consequence. User correction is personal evidence: authoritative for what the user experienced, reported, or rejected—but not automatically global truth, not medical diagnosis, and not permission to silently overwrite historical records.

Corrections create governed correction records, superseding records, or feedback signals. Historical AI inference and prior platform interpretation remain traceable where Deletion and Retention Governance permits. Current state may prefer corrected or superseding records for reasoning and presentation, but historical reasoning is not erased. User correction may trigger AI Knowledge Object supersession, confidence downgrade, confidence upgrade, or uncertainty change. It may inform Outcome Intelligence and Personal Threshold Learning. Every correction must be scoped: what is being corrected, which object or output it affects, and which correction category applies.

### Correction scope categories

**1. User-observable evidence**

User-observable evidence corrections address what the user directly experienced or can attest. Examples include symptom presence or absence, perceived severity, duration, discomfort, product use confirmation, routine adherence, whether a recommendation was followed, and perceived improvement, worsening, stability, or no change.

User correction in this category is authoritative as personal experience evidence. The platform treats the user's report of their experience as primary evidence for that user—not as a universal rule for all users, and not as medical diagnosis. A user who corrects severity or denies a symptom the platform suggested does not rewrite immutable Scan Record capture; they add governed correction evidence that current intelligence must respect while preserving what was originally captured at time T.

**2. Platform interpretation**

Platform interpretation corrections challenge how the platform classified, mapped, matched, or inferred—not necessarily what the user experienced. Examples include symptom classification, body area mapping, product match, ingredient recognition, formulation interpretation, routine structure interpretation, AI Knowledge Object inference, and recommendation relevance.

User correction may reject or refine platform interpretation, but resolution must occur through evidence, confidence, and supersession—not blind overwrite of historical objects. The platform does not delete what it inferred; it supersedes or limits interpretation while linking the correction event. Confidence Taxonomy posture may change; AI Knowledge Objects may enter supersession chains; Outcome Intelligence may re-evaluate comparisons affected by the correction—but governed status and audit lineage remain intact.

**3. Platform-only governed outputs**

Some outputs are governed system state that users may feedback upon but do not directly edit. Examples include confidence posture, safety boundary escalation status, model or provider provenance, object verification status, formulation verification, audit lineage, and deletion or retention status.

User feedback about these outputs becomes evidence that may trigger review, supersession, downgrade, or correction workflow—but users do not mutate provenance, verification flags, or governance status by assertion alone. A user who disagrees with an escalation recommendation contributes feedback and personal experience evidence; Recommendation Engine and Confidence Layer resolve whether posture changes through governed reasoning, not by treating user disagreement as direct edit of system audit fields.

### Conflict handling

When user correction conflicts with AI inference or platform interpretation, the conflict must be represented explicitly—not hidden, not silently resolved by choosing one side without status.

User-reported experience carries strong authority for personal experience scope: if the user states they did not experience a suggested symptom or that severity differed, that evidence governs personal experience reasoning. Platform interpretation remains governed by evidence density, verification status, and Confidence Taxonomy dimensions. When experience and interpretation diverge, both signals persist with explicit conflict status until resolved through additional evidence, supersession, or governed downgrade to low or insufficient confidence.

Unresolved conflict may produce low or insufficient confidence posture rather than false precision. Repeated corrections in consistent directions may inform Personal Threshold Learning or engine calibration for this user—adjusting weighting, sensitivity signals, or interpretation reuse policy. Corrections must not become global rules propagated to other users as universal truth; learning remains personal and evidence-scoped.

Conflict representation protects Outcome Intelligence integrity: outcome evaluations that depended on contested interpretation must be re-evaluable or confidence-limited when correction arrives, without retroactively pretending the prior evaluation never occurred.

### Boundaries

User corrections must not introduce medical diagnosis into platform truth, force disease labels, force treatment claims, overwrite immutable evidence, bypass Deletion and Retention Governance, silently rewrite AI Knowledge Objects, falsify provider or model provenance, remove audit lineage, inflate confidence for commercial reasons, teach unsafe personalization, or propagate to other users as universal truth.

Corrections that attempt to assert clinical conditions exceed cosmetic and educational scope. They may be recorded as user-reported language within feedback context, but must not enter domain models as authoritative medical labels. Corrections cannot restore evidence removed under governance rules or create ungoverned replicas of deleted content. Supersession Semantics apply: correction adjusts current authority through lineage, not mutation of historical truth in place.

Safety Boundary Escalation status is not overridden by user disagreement alone. User feedback that cosmetic guidance was sufficient does not silently remove escalation when evidence patterns still warrant caution; conversely, user concern beyond cosmetic scope may contribute evidence toward escalation review—always through governed engines, not direct user edit of escalation audit state.

### Relationship to platform concepts

User Correction Governance connects explicitly to adjacent Data Model and platform concepts:

- **Personal Evidence Base** — Corrections enter as governed evidence events alongside Scan Records, usage events, and feedback. They extend the longitudinal record without replacing immutable capture.

- **AI Knowledge Objects** — User rejection or refinement of inference triggers supersession per Supersession Semantics. Original inference remains in lineage; superseding objects reference correction evidence.

- **Supersession Semantics** — Correction is a primary supersession cause. Downstream artifacts that depended on superseded interpretation must be marked stale, re-evaluated, or confidence-downgraded as governance requires.

- **Confidence Taxonomy** — Corrections may upgrade, downgrade, or reshape confidence posture and uncertainty drivers. Conflict without resolution tends toward low or insufficient posture.

- **Outcome Intelligence** — Corrections affecting before/after comparability, symptom scope, or exposure context may require outcome re-evaluation or confidence limitation on prior outcome objects.

- **Personal Threshold Learning** — Repeated consistent corrections inform personal calibration hypotheses—reversible, evidence-linked, and scoped to the individual user.

- **Deletion and Retention Governance** — Corrections cannot bypass withdrawal or deletion rules. Governed unavailability limits inspectability without fabricating replacement evidence.

- **Safety Boundary Escalation** — User concern contributes personal evidence; escalation status remains governed output qualified by Confidence Layer and Recommendation Engine boundaries.

User Correction Governance ensures the platform listens without amnesia: the user's voice strengthens personal evidence, challenges interpretation through accountable supersession, and calibrates learning—while historical truth, audit lineage, and safety boundaries remain governed rather than overwritten.

---

## Future Expansion

Future Expansion defines how the SkinIntel Data Model should support future growth without breaking the core architecture. It is not a feature wishlist. It does not enumerate roadmap deliverables or prioritize product backlog items. It defines architectural extension principles: how new objects, capabilities, intelligence layers, and integrations may enter the platform while preserving the conceptual integrity, traceability, and separation of concerns established throughout this document.

The Data Model must be stable enough to support future growth without rewriting foundational concepts. User Profile, Skin Profile, Scan Record, Body Area Model, Symptom Model, Product Model, Ingredient Model, Routine Model, Outcome Model, Recommendation Model, Formulation Model, Longitudinal Timeline, and AI Knowledge Objects represent durable intellectual structure—not transient implementation choices. Future capabilities extend this structure; they do not replace it. A platform that redefines what a scan means every release cannot accumulate years of personal evidence. A platform that collapses outcome evaluation into recommendation text cannot explain itself to users or learn from history.

Future Expansion is a conceptual governance section. It describes extension rules and boundary preservation—not storage migrations, feature flags, or integration specifications. How extensions are approved, versioned, and deployed is downstream process. The principles here govern what extensions must respect regardless of technology or delivery timeline.

### Principles future expansion must preserve

Every extension to the Data Model must preserve the Design Principles and object boundaries defined in this document. Future expansion must preserve:

- **Language-independent internal identifiers** — New objects reference canonical tokens, not locale-specific strings as authoritative keys.
- **Provider independence** — New capabilities do not bind knowledge semantics to a specific AI vendor, storage engine, or capture technology.
- **Separation of concerns** — New objects occupy distinct domains; they do not absorb symptoms into products, outcomes into recommendations, or evidence into AI inference.
- **Historical traceability** — Extensions add to the Personal Evidence Base; they do not overwrite Scan Records, timeline events, or prior intelligence artifacts.
- **Explainability** — New objects remain accountable: users and auditors can understand what was added, why, and from what source.
- **Evidence-based reasoning** — New context enriches interpretation; it does not substitute for primary evidence or inflate confidence without support.
- **Confidence awareness** — New signals carry explicit confidence and uncertainty appropriate to source quality and completeness.
- **User correction and feedback loops** — User-provided and user-corrected data remain governable; extensions do not bypass confirmation and correction semantics.
- **Personal Evidence Base continuity** — Longitudinal integrity persists across extensions: prior history remains coherent when new object types appear.

These principles are non-negotiable extension gates. Capabilities that violate them require architecture review and explicit exception—not silent incorporation into the model.

### Domains future expansion may include

Future expansion may introduce new knowledge domains and evidence layers. Illustrative domains—not commitments—include:

- **Environmental factors** — Reported or inferred environmental context linked to scan and timeline events: humidity, pollution exposure, indoor heating—user-provided or platform-observed with provenance.
- **Lifestyle factors** — Travel, schedule disruption, exercise, and comparable context voluntarily associated with scan periods.
- **Seasonal context** — Temporal seasonal markers linked to symptom and outcome patterns across years.
- **Menstrual cycle or hormonal context where user voluntarily provides it** — Optional, consent-governed context with explicit user control and scope boundaries.
- **Sleep and stress context** — Self-reported or device-assisted signals linked to evidence windows, not embedded as baseline profile truth without recalibration governance.
- **Nutrition context** — Voluntary dietary context where users choose to associate it with skin evidence periods.
- **Climate and location-level context** — Regional climate association for correlation analysis, with privacy-appropriate granularity.
- **Wearable or device signals** — Externally sourced biometric or environmental data linked to timeline windows with source provenance and confidence.
- **Dermatologist or professional notes where appropriate** — Externally verified or user-attached professional input as distinct evidence objects, not overwriting user-reported history.
- **Advanced image comparison** — Structured image analysis artifacts linked to Scan Records and body areas, expressed as AI Knowledge Objects or governed comparison results with evidence references.
- **Multi-photo scan sets** — Session groupings of related captures as structured scan context, not unstructured media dumps.
- **Formulation version monitoring** — Enhanced tracking when verified product reformulation materially changes composition linked to exposure history.
- **Product reformulation tracking** — Temporal linkage between formulation version changes and user exposure windows on the Longitudinal Timeline.
- **Cross-user aggregate insights where privacy and consent allow** — Population-level pattern objects strictly separated from personal evidence, never overriding individual history.
- **Advanced prediction models** — Prediction candidates as AI Knowledge Objects with confidence bands, not guaranteed forecasts stored as outcomes.
- **Longitudinal progress scoring** — Derived summary metrics referencing outcome and scan evidence chains, not replacements for Outcome Model evaluations.
- **Exportable reports** — Presentation assemblies of existing evidence and intelligence objects, not new authoritative truth.
- **Professional review workflows** — Governed review states and attestations linked to evidence objects, not silent modification of user records.
- **Brand or product verification workflows** — Verification progression events upgrading provisional to verified product and formulation knowledge with traceable provenance.

Each domain requires new or extended object definitions approved through the extension criteria below—not ad hoc fields appended to existing objects until boundaries collapse.

### Extension criteria for every new object

Every future object must answer architectural questions before incorporation:

- **What domain concept it represents** — Explicit single-responsibility definition: what question this object answers and what question it does not answer.
- **Which existing objects it references** — Reference surfaces to Scan Records, timeline events, domain models, and AI Knowledge Objects—not redefinition of their semantics.
- **What evidence it adds** — What new information enters the Personal Evidence Base and how it differs from existing evidence types.
- **What confidence or uncertainty it carries** — Source-appropriate confidence posture: verified, user-reported, inferred, provisional.
- **Whether it is user-provided, platform-observed, externally verified, or AI-inferred** — Provenance classification governing how intelligence layers may weight the object.
- **How it affects recommendations, outcomes, or learning** — Downstream impact declaration: which Intelligence Engines read or write the object and with what confidence boundaries.
- **What does not belong inside it** — Explicit exclusion list preserving separation of concerns from adjacent models.

Objects that cannot answer these questions remain feature ideas, not Data Model extensions.

### Boundary preservation under expansion

New objects must not blur existing boundaries. Future Expansion explicitly guards against common architectural failures:

- **Environmental context must not become diagnosis** — Context objects enrich correlation; they do not assign clinical conditions.
- **Professional notes must not overwrite user history** — External input supplements evidence; it does not mutate immutable Scan Records or erase user-reported observations.
- **Prediction objects must not become guaranteed outcomes** — Predictions remain AI Knowledge Objects or governed candidates until Outcome Model evaluation confirms or contradicts change.
- **Aggregate insights must not override personal evidence** — Population patterns inform priors where consent allows; personal scan and outcome history remain authoritative for individual guidance.
- **Commerce objects must not pollute recommendation logic** — Purchase, affiliate, and pricing mechanics remain outside recommendation semantics regardless of integration depth.
- **AI-generated objects must not replace evidence references** — New AI capabilities produce AI Knowledge Objects linked to evidence; they do not substitute for Scan Records or user feedback as primary truth.

Boundary blur is incremental architecture erosion. Each extension is evaluated against these failure modes before approval.

### Additive and governed extension

Expansion must be additive and governed. Future capabilities should add new objects, references, or evidence layers without mutating historical records or breaking prior interpretations.

Additive extension means versioned object introduction: new types appear alongside existing types with defined reference relationships. A new environmental context object links to a scan period; it does not retroactively embed environment fields into Scan Record semantics. A new progress score references outcome sequences; it does not overwrite individual Outcome Model evaluations with a single number that erases detail.

Governed extension means architecture review, documented exclusion boundaries, and explicit impact assessment on Intelligence Engines and the Longitudinal Timeline. Breaking changes to foundational object meaning require deliberate version migration with historical preservation—not reactive schema edits during feature sprints.

When AI providers upgrade, when storage migrates, when new capture methods emerge, existing knowledge objects remain recognizable. Extensions attach; they do not redefine.

### What does not belong in Future Expansion

Future Expansion as a section defines principles, not uncontrolled growth. The following must not characterize extension activity:

- **Uncontrolled scope creep** — Features appended to existing objects without domain definition or boundary analysis.
- **Feature ideas without architectural boundaries** — Roadmap items that skip extension criteria and exclusion definitions.
- **Provider lock-in** — Object semantics that embed vendor-specific concepts as platform truth.
- **Hardcoded language-specific concepts** — Locale-bound identifiers or display strings as authoritative model keys.
- **Untraceable AI conclusions** — New AI capabilities that bypass AI Knowledge Object accountability requirements.
- **Medical claims outside platform scope** — Clinical extensions that violate cosmetic Personal Skin Intelligence boundaries without governed scope separation.
- **Commerce-driven recommendation bias** — Commercial objects influencing recommendation logic without evidence-based firewall.
- **Rewriting historical evidence** — Retroactive mutation of Scan Records, timeline events, or outcome evaluations to accommodate new features.
- **Collapsing multiple models into one** — Convenience objects that merge product, routine, outcome, and recommendation semantics into undifferentiated records.

If a proposed capability matches these failure modes, it is not ready for Data Model extension regardless of product priority.

### Protecting the long-term platform

Future Expansion exists to protect the long-term platform. SkinIntel is designed to accumulate years of personal skin evidence—to grow from current Personal Skin Intelligence into a broader evidence-based intelligence system without losing trust, traceability, or architectural clarity.

Users entrust the platform with intimate, longitudinal history. That trust depends on stable meaning: what a scan was in year one remains understandable in year five; what the platform recommended remains retrievable alongside what happened afterward; what AI inferred remains accountable when models improve. Extensions that preserve principles strengthen the platform. Extensions that erode boundaries consume trust faster than features restore it.

Architects, product leaders, and AI agents proposing new capabilities should treat this section as the extension contract. The core Data Model objects defined above are the foundation. Future Expansion describes how to build on that foundation—additively, governedly, and with explicit answers to what each new object represents, what it references, what it excludes, and what principles it preserves.

Growth is expected. Architectural amnesia is not. Future Expansion ensures SkinIntel can widen its intelligence scope—environmental context, professional collaboration, advanced imaging, aggregate learning where permitted—while the Personal Evidence Base remains coherent, explainable, and permanently accountable to the user whose skin journey it records.

---

## Version History

V1 Draft
