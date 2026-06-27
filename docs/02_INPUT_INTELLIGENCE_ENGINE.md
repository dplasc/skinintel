# Input Intelligence Engine

## Status

Draft V1

---

## Purpose

Input Intelligence is the entry point of the SkinIntel Intelligence Engine. Its responsibility is to collect high-quality, structured, and reusable information before any automated reasoning begins. Nothing downstream—memory, knowledge enrichment, correlation, prediction, or recommendation—can perform reliably if the signals it receives are vague, inconsistent, or lost after a single session. Input Intelligence exists to ensure that what enters the engine is worth remembering, worth connecting, and worth building upon.

The quality of every later intelligence layer depends directly on the quality of collected input. A correlation cannot be trusted if the underlying observations were captured imprecisely. A recommendation cannot be personalized if product usage was recorded without context. A prediction cannot improve over time if outcomes were never structured in a way the engine could revisit. Input Intelligence is therefore not a preliminary step to be rushed through; it is the foundation on which the entire platform rests.

The objective is not to ask more questions. It is to ask better questions. Each interaction should earn its place in the user's journey by capturing information that materially improves understanding—of their skin, their routines, their products, and their results. Redundant prompts, vague inquiries, and open-ended fields that produce unusable answers waste user attention without strengthening the personal knowledge base. Better questions are purposeful, scoped, and designed to resolve ambiguity that actually matters for downstream intelligence.

SkinIntel should minimize typing wherever structured selection can express the same meaning more reliably. Buttons, scales, classifications, and guided choices reduce friction and produce consistent signals that the engine can compare over time. Free-text input remains available where nuance matters—personal context, exceptions, descriptions that structured options cannot capture—but it supplements structured capture rather than replacing it. The default path favors clarity and reusability; the optional path favors richness without sacrificing structure elsewhere in the record.

Every answer should become reusable structured knowledge for the Intelligence Engine. A selected symptom severity, a confirmed body area, a logged product, or a piece of feedback is not consumed once and discarded. It is committed to the user's longitudinal record, available for enrichment, correlation, and future guidance. Input Intelligence treats each response as a durable asset, not a transient message passed to an automated model for immediate display.

To fulfill this purpose, Input Intelligence collects information from multiple complementary sources:

- **User answers** — structured responses to guided questions about skin presentation, routines, goals, preferences, and experience.
- **Uploaded images** — visual records that support observation and progress tracking when the user chooses to provide them.
- **Products** — identification and context for items the user applies, including role in routine and timing of use.
- **Ingredients** — component-level information linked to products or entered directly when relevant to the user's concerns.
- **OCR** — extraction of text from product labels or packaging to reduce manual entry while preserving accuracy.
- **Historical updates** — revisions, corrections, and additions that refine what the platform already knows about the user over time.
- **User feedback** — confirmations, rejections, and clarifications that align platform inference with lived experience.

Together, these sources feed a single objective: a coherent, structured picture of the user's skin journey at the moment it enters the engine. Input Intelligence does not interpret, recommend, or diagnose. It captures. What it captures determines how well the rest of the platform can learn, remember, and serve the user over the long term.

---

## Philosophy

Input Intelligence is governed by a clear philosophy: every question asked, every selection made, and every update recorded must serve the long-term intelligence of the platform—not the convenience of a single session. Collecting input is not an exercise in gathering data for its own sake. It is the disciplined act of building a personal knowledge base that grows more valuable with each interaction. The philosophy below defines how SkinIntel decides what to ask, what to skip, and how the burden of input should evolve over time.

### Questions Must Earn Long-Term Value

SkinIntel asks only questions that create long-term value. A question is justified when its answer can be remembered, enriched, correlated with future observations, or used to improve guidance months later. Questions that produce disposable answers—satisfying momentary curiosity but contributing nothing durable—do not belong in the input model. Every prompt should pass a simple test: will this answer make the Intelligence Engine smarter about this user in the future? If not, it should not be asked.

### Every Answer Strengthens the Engine

Every answer should improve the Intelligence Engine. Input is not a handoff to automated reasoning for immediate display alone. Each response becomes structured knowledge—committed to memory, available for enrichment, and eligible for correlation with products, outcomes, and feedback. The user is not filling out a form; they are contributing to a personal asset that the platform will reuse. This framing shapes tone, scope, and restraint: fewer questions, each with clear downstream purpose.

### Structure Over Typing

Minimize typing. Maximize structured selections. Where meaning can be expressed through a slider, a selector, a classification, or a guided workflow, that path is preferred. Structured input produces consistent signals that the engine can compare across time and users without parsing ambiguity. Typing is reserved for context that structured options cannot capture—exceptions, nuance, personal notes—not for facts that a well-designed selection could express in seconds.

Sliders communicate degree. Selectors communicate choice. Classifications communicate category. Guided workflows communicate sequence and completeness. Together they reduce cognitive load, eliminate inconsistent phrasing, and produce records the Memory Engine can rely on without reinterpretation.

### Respect What Is Already Known

Never ask the same question twice if the answer is already known. Reuse historical information whenever possible. If the platform remembers a user's baseline routine, known sensitivities, or previously confirmed product list, those facts should inform the current session—not be re-requested as if memory did not exist. Repetition erodes trust, wastes attention, and signals that prior contributions were not valued.

When a user returns, Input Intelligence should begin from what the platform already understands and ask only what has changed. A new scan is not a blank slate. It is an update to an ongoing record. The governing question shifts from "tell us everything" to "what is different now?"

### Delta-Oriented Collection

Ask only what changed since the previous scan. Stable facts—unchanged routines, persistent preferences, long-standing concerns—need not be reconfirmed unless the user initiates a correction. The platform should detect or invite delta: new products, shifted severity, different affected areas, altered outcomes. This delta-oriented approach keeps sessions short while keeping the knowledge base current. It aligns with longitudinal memory: the record grows through change, not through redundant restatement.

### Every Interaction Builds the Knowledge Base

Every interaction should become part of the user's personal knowledge base. There are no throwaway inputs. A severity adjustment, a product addition, a confirmed improvement, or a rejected suggestion all enter the same durable stream. Input Intelligence treats each touchpoint as additive—even small updates compound into a richer picture over weeks and months.

### Effort Should Decrease Over Time

Input collection should become easier over time, not harder. The first scan collects the foundation: goals, baseline presentation, core routine, initial product context, and the structural facts needed to orient all future intelligence. It may require more attention because nothing is yet known. That investment is intentional and once-per-foundation, not a permanent tax on every visit.

Every later scan should require fewer questions because the platform already knows the user. As memory deepens, prompts narrow. As patterns stabilize, confirmation replaces discovery. As trust builds, the user spends less time repeating and more time refining. The arc of the product is toward reduced effort paired with increased intelligence—not the reverse.

### The Guiding Tension

The goal is to reduce effort while increasing intelligence. These two aims are not in conflict when input is designed correctly. Less typing, fewer repeated questions, and delta-oriented updates reduce effort. Better questions, structured capture, and durable knowledge increase intelligence. Input Intelligence exists at the intersection: disciplined enough to ask only what matters, efficient enough to honor what is already known, and purposeful enough to ensure every answer earns its place in the engine.

---

## Input Sources

Input Intelligence draws from multiple information sources, each contributing a distinct type of signal to the SkinIntel Intelligence Engine. No source operates in isolation; together they form a composite picture of the user's skin journey. Regardless of origin, every source passes through the same principle: raw input is normalized into structured signals before it enters downstream intelligence processing. Normalization ensures consistency, comparability over time, and compatibility with memory, enrichment, and correlation—regardless of whether the user typed, selected, photographed, or confirmed.

### 1. User Structured Answers

**What enters:** Guided responses captured through structured selections—body areas, symptom classifications, severity scales, routine steps, goals, preferences, timing, and optional contextual notes. These are deliberate, scoped answers to questions designed for reusability.

**Why it is valuable:** Structured answers produce the most reliable foundation for personalization. They express meaning in forms the engine can store, compare, and revisit without reinterpretation. They anchor every other source: a product log without routine context is weaker; an image without classified symptom context is harder to correlate.

**How it improves the engine over time:** Each structured answer compounds into longitudinal memory. Early answers establish baseline; later answers reveal change. The Correlation Engine links structured observations to products and outcomes; the Recommendation Engine draws on accumulated preference and severity patterns. As the record deepens, structured answers enable delta-oriented collection—asking only what changed rather than starting over.

### 2. Images

**What enters:** Visual records the user chooses to upload—typically of affected skin areas, progress over time, or product packaging when relevant to observation. Images enter as referenced visual signals linked to session context, body area, and date.

**Why it is valuable:** Images capture presentation that words alone may not convey—texture, distribution, visible change. They support progress tracking and provide a visual thread alongside structured classifications. When linked to classified symptoms and severity, images strengthen evidential weight for correlation.

**How it improves the engine over time:** Repeated images across sessions create a visual timeline. The engine can relate image-linked records to product introductions, routine changes, and reported outcomes. Over weeks and months, visual history supports more confident pattern recognition and more grounded guidance—always in conjunction with structured context, never as standalone diagnosis.

### 3. Products

**What enters:** Identification and context for commercial products the user applies—name, category, role in routine, frequency, timing relative to other steps, and start or stop dates. Products may be selected from known catalogs or entered with sufficient structure for later enrichment.

**Why it is valuable:** Products are the primary actionable variables in most skin care journeys. Without product context, observations float unattached to cause. Product records enable the engine to ask which changes preceded which outcomes and to evaluate fit against goals and sensitivities.

**How it improves the engine over time:** A growing product history reveals what the user tolerates, repeats, abandons, or reacts to. Product Intelligence and Ingredient Intelligence enrich these records downstream; Input Intelligence ensures they enter with enough structure to support that enrichment. Longitudinal product data is among the strongest inputs for correlation and personalized recommendation.

### 4. Ingredients

**What enters:** Component-level information—either linked to logged products or entered directly when the user wants to track a specific ingredient concern. This includes known actives, allergens of interest, and ingredients the user wishes to avoid or prioritize.

**Why it is valuable:** Ingredients bridge product-level records and domain knowledge. A user may react to a class of components across multiple products; ingredient-level input makes that visible. It also supports explainable recommendations grounded in composition rather than product name alone.

**How it improves the engine over time:** Accumulated ingredient exposure, combined with outcomes and feedback, sharpens personal sensitivity profiles. The engine learns not just which products worked but which components likely contributed—enabling finer recommendations and more precise avoidance guidance as data grows.

### 5. OCR

**What enters:** Text extracted from product labels, ingredient lists, or packaging photographs—converted into structured ingredient and product fields rather than left as unstructured image attachments.

**Why it is valuable:** OCR reduces manual entry burden while preserving accuracy. Users should not retype long ingredient lists when the information already exists on the product itself. Structured extraction turns a visual capture into actionable product and ingredient records.

**How it improves the engine over time:** Lower friction increases the likelihood that products enter the system completely and correctly. Complete product records enrich faster; richer records improve correlation and recommendation quality. OCR contributes to the compounding effect: easier input leads to more complete memory, which leads to better intelligence.

### 6. Historical Data

**What enters:** Previously captured records reused, referenced, or updated in subsequent sessions—prior answers, logged products, established routines, confirmed preferences, and baseline classifications. Historical data enters not only as stored memory but as active context that shapes what new input is required.

**Why it is valuable:** Historical data prevents redundant collection and enables delta-oriented input. It transforms each new session from a restart into a continuation. The platform's intelligence depends as much on what it remembers as on what it newly captures.

**How it improves the engine over time:** Reuse of historical data is what makes the platform smarter with age. Early sessions build foundation; later sessions refine. The engine's reasoning depth scales with record length—correlations strengthen, predictions qualify more precisely, and recommendations narrow as history accumulates.

### 7. User Feedback

**What enters:** Explicit user responses to platform outputs and inferences—confirmations, corrections, rejections, clarifications, and outcome reports. Feedback closes the loop between what the engine inferred and what the user experienced.

**Why it is valuable:** Without feedback, the engine risks drifting from lived experience. Feedback aligns inference with reality, validates or invalidates correlations, and teaches the system what matters to this individual. It is the user's voice in the learning cycle.

**How it improves the engine over time:** Feedback refines personal models continuously. A rejected recommendation, a confirmed improvement, or a corrected severity rating adjusts future weighting. Over time, feedback makes guidance more attuned, more trustworthy, and more resistant to generic assumptions.

### 8. Future Sources

**What enters:** Additional input channels not yet defined—potential new capture methods, external references the user authorizes, or expanded signal types that meet the same standards of structure, consent, and long-term value.

**Why it is valuable:** The input model must remain extensible without compromising architectural discipline. New sources should expand what the engine knows, not bypass how it learns.

**How it improves the engine over time:** Future sources enter only if they normalize into structured signals, contribute durable knowledge, and respect the philosophy of reduced effort over time. Each new source is evaluated by whether it strengthens the personal knowledge base—not whether it adds novelty.

### Normalization Principle

Every source—regardless of category—must be normalized into structured signals before entering the Intelligence Engine. Normalization is the boundary between collection and reasoning. Unstructured noise stops at Input Intelligence; structured knowledge begins there. This single pipeline ensures that images, OCR extractions, product logs, and guided answers all speak a common language that memory can preserve, knowledge layers can enrich, and correlation can connect across the user's entire history.

---

## Structured User Questions

Structured User Questions are the logical groupings of information SkinIntel may collect during onboarding and subsequent scans. They are not screens, flows, or interface designs—they are the canonical categories of input the platform recognizes, each producing signals the Intelligence Engine can store, enrich, and reuse. Every question group exists because it answers a specific intelligence need. Questions within each group are asked through structured selection wherever possible, with optional free-text reserved for context that classifications cannot capture.

The platform organizes collection around stability and change. Stable facts—profile attributes, long-standing allergies, baseline skin type—are captured once and reused until the user updates them. Dynamic facts—severity, progress, current products, new concerns—are revisited according to their natural cadence. The governing principle: avoid repeatedly asking stable questions; focus each scan on what has changed since the last interaction.

### Personal Profile

**Why it matters:** Establishes foundational context about the user—demographic and personal factors that may influence skin presentation and care preferences without defining medical identity.

**How it improves the Intelligence Engine:** Anchors personalization to the individual rather than anonymous defaults. Profile context informs tone, priority, and relevance of downstream guidance without duplicating clinical assessment.

**Collection frequency:** First scan only; occasionally when the user initiates a profile update.

### Skin Profile

**Why it matters:** Captures baseline skin characteristics—general type, typical presentation, known tendencies—that persist across sessions and orient all future interpretation.

**How it improves the Intelligence Engine:** Provides a stable reference against which change is measured. Without baseline skin profile, later severity shifts and outcome reports lack context for what is normal versus exceptional for this user.

**Collection frequency:** First scan only; only when changed if the user reports a fundamental shift in baseline presentation.

### Primary Concern

**Why it matters:** Identifies what the user most wants to address—the dominant focus that prioritizes recommendations, tracking, and progress evaluation.

**How it improves the Intelligence Engine:** Directs correlation and recommendation toward stated intent. Multiple concerns may exist; primary concern ensures the engine weights guidance appropriately rather than treating all signals equally.

**Collection frequency:** First scan; every scan when focus has shifted; only when changed if concern remains stable.

### Body Area

**Why it matters:** Links concern, symptoms, and outcomes to specific regions using the universal Body Area Classification model.

**How it improves the Intelligence Engine:** Enables per-region history, product tracking, and recommendations. Spatial linkage is required for meaningful comparison and future visualization.

**Collection frequency:** Every scan for active concerns; first scan establishes baseline areas; subsequent scans ask only when areas of focus change or new areas emerge.

### Symptoms

**Why it matters:** Classifies what the user observes—structured symptom types rather than unstructured description—linked to body area and session context.

**How it improves the Intelligence Engine:** Produces comparable signals over time. Symptom classification feeds correlation with products, triggers, and outcomes; unstructured symptom text alone cannot support reliable longitudinal analysis.

**Collection frequency:** Every scan for active areas; delta-oriented—confirm unchanged symptoms briefly rather than re-entering full classification when stable.

### Severity

**Why it matters:** Quantifies intensity of presentation on a consistent scale, enabling trend detection and progress measurement.

**How it improves the Intelligence Engine:** Severity timelines reveal improvement, stability, or worsening. Correlation Engine links severity shifts to product introductions and routine changes; Prediction Engine uses severity trends for qualified projections.

**Collection frequency:** Every scan for active symptoms; essential delta signal on each return visit.

### Duration

**Why it matters:** Records how long a concern or symptom has persisted—recent onset versus chronic presentation changes interpretation and urgency of guidance.

**How it improves the Intelligence Engine:** Distinguishes acute from long-standing patterns. Duration context prevents misreading a new flare as a chronic baseline or vice versa.

**Collection frequency:** First scan for each new concern; only when changed if duration category shifts (e.g., acute becoming chronic).

### Triggers

**Why it matters:** Captures factors the user associates with worsening or onset—products, stress, climate, diet, hormonal cycles, or other self-identified triggers.

**How it improves the Intelligence Engine:** Feeds Correlation Engine with hypothesis signals the user provides. Trigger patterns, confirmed or refuted over time, sharpen personal models and explainable recommendations.

**Collection frequency:** First scan for known triggers; occasionally when exploring new patterns; only when changed when user identifies new or revised triggers.

### Daily Routine

**Why it matters:** Documents the sequence and frequency of care steps—what the user actually does, not what they ideally intend—providing context for product application and outcome timing.

**How it improves the Intelligence Engine:** Routine structure explains when products contact skin, in what order, and at what frequency. Essential for correlating application with outcome and for recommendation fit.

**Collection frequency:** First scan; only when changed when routine is stable; every scan when user reports routine adjustment.

### Current Products

**Why it matters:** Records products actively in use—linked to routine role, application area, and start date—forming the live variable set affecting current presentation.

**How it improves the Intelligence Engine:** Current products are primary inputs for Product Intelligence, Ingredient Intelligence, and correlation with symptoms and outcomes. Incomplete product records weaken all downstream reasoning.

**Collection frequency:** First scan establishes initial set; every scan as delta—new additions, removals, or replacements; only when changed for stable routines.

### Previous Products

**Why it matters:** Preserves history of discontinued or replaced products, including why use stopped when the user provides that context.

**How it improves the Intelligence Engine:** Previous products explain past reactions and avoid re-recommending failed options. Historical product exposure informs ingredient sensitivity inference across the user's full journey.

**Collection frequency:** First scan for relevant history; occasionally when retrospective context emerges; only when changed when user adds past product information not previously captured.

### Product Results

**Why it matters:** Captures user-reported outcome of specific products—helped, neutral, worsened, caused reaction—closing the loop between application and experience.

**How it improves the Intelligence Engine:** Product results are high-value feedback signals. They validate or invalidate correlations, train personal fit models, and make future recommendations explainable and conservative where history warrants.

**Collection frequency:** Occasionally as products are evaluated; every scan when user reports new outcome for a current or recently stopped product; prompted when sufficient use duration has passed.

### Allergies / Sensitivities

**Why it matters:** Records known ingredient, product, or contact sensitivities the user wants the platform to respect—safety and comfort constraints on all recommendations.

**How it improves the Intelligence Engine:** Hard boundaries for Recommendation Engine and Product Intelligence. Sensitivities prevent harmful suggestions and prioritize explainable avoidance rationale.

**Collection frequency:** First scan; only when changed unless user confirms unchanged during periodic safety check (occasionally).

### Lifestyle Factors

**Why it matters:** Captures relevant lifestyle context—sleep, stress, exercise, diet patterns, hormonal factors—affecting skin without claiming medical diagnosis.

**How it improves the Intelligence Engine:** Lifestyle signals enrich correlation when symptom patterns align with contextual factors. Supports educational guidance about contributing factors rather than product-only reasoning.

**Collection frequency:** First scan for baseline; occasionally when relevant to emerging patterns; only when changed for stable lifestyle.

### Environment

**Why it matters:** Records environmental context—climate, season, humidity, sun exposure, travel, workplace conditions—that may influence presentation and product needs.

**How it improves the Intelligence Engine:** Environment explains temporal shifts unrelated to product change. Seasonal and location context improves recommendation timing and ingredient suitability reasoning.

**Collection frequency:** Occasionally; every scan when user reports environmental change (travel, season shift); first scan for home baseline environment.

### Previous Treatments

**Why it matters:** Documents prior professional or over-the-counter treatments attempted—what was tried, when, and reported effect—avoiding redundant guidance and honoring care history.

**How it improves the Intelligence Engine:** Treatment history prevents circular recommendations and informs severity of concern context. Links to outcome records strengthen longitudinal understanding.

**Collection frequency:** First scan; only when changed when user adds new treatment history.

### Progress Since Last Scan

**Why it matters:** Delta-oriented capture of what changed—better, worse, stable, new concern, resolved concern—since the previous session. The core question for returning users.

**How it improves the Intelligence Engine:** Progress signals validate predictions, confirm correlations, and prioritize what needs attention now. This category embodies the philosophy of asking what changed rather than restarting full intake.

**Collection frequency:** Every scan for returning users; not applicable on first scan.

### User Goals

**Why it matters:** Captures what the user wants to achieve—clarity, hydration, blemish reduction, anti-aging focus, maintenance, experimentation boundaries—guiding recommendation priority and success criteria.

**How it improves the Intelligence Engine:** Goals weight Recommendation Engine output and define what "improvement" means for this individual. Goal shifts reorient the entire guidance frame.

**Collection frequency:** First scan; occasionally when goals evolve; only when changed when goals remain stable.

### Collection Strategy Summary

Structured User Questions are not an exhaustive interrogation on every visit. First scan collects foundation: profile, skin profile, goals, baseline routine, current and relevant previous products, allergies, primary concern, body areas, symptoms, severity, duration, triggers, lifestyle, environment, and treatment history. Every later scan compresses toward delta: progress since last scan, severity updates, product changes, new or resolved concerns, and confirmation of stable facts only when integrity requires it.

Stable questions—personal profile, skin profile, allergies, established treatment history—should not repeat unless the user initiates change or the platform detects inconsistency requiring gentle confirmation. Dynamic questions—severity, progress, current products, primary concern when shifted—anchor each return visit. Occasional questions—triggers, lifestyle, environment, product results—surface when patterns suggest relevance or when sufficient time has passed to ask without fatigue.

This strategy reduces effort while increasing intelligence: fewer repeated prompts, richer longitudinal record, and each scan contributing structured knowledge the engine compounds over time.

---

## Body Area Classification

Body Area Classification is the universal spatial model used across the entire SkinIntel platform. It provides a consistent vocabulary for where—on the body—something occurs, is observed, is treated, or is evaluated. Every scan, image, symptom record, product usage entry, recommendation, and outcome can be linked to one or more body areas. This linkage is structural, not decorative. Without a shared body area model, observations cannot be compared over time, products cannot be traced to affected regions, and recommendations cannot be grounded in where the user actually experiences change.

The model is hierarchical: broad regions anchor the record, sub-regions refine it, and optional detailed locations resolve ambiguity when precision matters. The hierarchy balances usability with specificity—users are not forced through exhaustive selection on every interaction, yet the platform supports enough granularity to distinguish left cheek from right cheek or upper forehead from lower forehead when that distinction affects history, correlation, or guidance.

### Philosophy

**Location is context.** Presentation, product response, and outcomes often depend on where on the body they occur. Linking every signal to body area preserves context that undifferentiated records would lose.

**One model, every layer.** Input Intelligence, Memory, Product Intelligence, Correlation, Recommendation, and future visualization must share the same body area vocabulary. A symptom classified at input must align with the area in a later product log, image, and recommendation. Universal classification is an architectural requirement.

**Precision when earned.** The default path favors Level 1 or Level 2 selection. Level 3 is available when needed—not mandatory on every scan. As the platform learns which sub-regions matter for a user, it can invite finer selection selectively.

**Many areas, one record.** A single session may involve multiple body areas. The model supports one-to-many linkage—dryness on both cheeks and tightness around the mouth in one scan—each maintaining its own thread within the hierarchy.

### Hierarchical Classification Levels

#### Level 1 — Major Body Region

Level 1 defines primary anatomical regions—the top-level anchors for all spatial classification.

**Standard Level 1 regions:** Face, Scalp, Neck, Chest, Back, Arms, Hands, Legs, Feet, Whole Body.

Level 1 suffices when concern is broadly distributed or when Whole Body applies. Every record resolves to at least one Level 1 region.

#### Level 2 — Sub-Regions

Level 2 subdivides Level 1 into meaningful sub-regions reflecting how users describe concerns and apply products.

**Example — Face:** Forehead, Nose, Cheeks, Chin, Jawline, Around Eyes, Around Mouth.

Each major region has a defined Level 2 set—arms into upper arm, elbow, forearm; back into upper back, lower back, shoulders. Sub-region sets are fixed platform vocabulary for consistency across users and time. Level 2 is the default precision target for most scans and symptom records.

#### Level 3 — Optional Detailed Location

Level 3 provides fine-grained location when sub-region alone is insufficient—lateral distinction, vertical subdivision, or localized precision.

**Examples:** Face → Cheeks → Left cheek, Right cheek; Face → Forehead → Upper forehead, Lower forehead.

Level 3 is optional. Offer it when symmetry matters, progress tracking requires side-by-side comparison, or history shows recurring concern in a narrow zone. It must never block input completion. Unspecified Level 3 within a Level 2 sub-region remains valid.

### Cross-Platform Linkage

Every artifact carrying spatial meaning attaches to this hierarchy: scans classify reported concern at capture; images reference depicted areas; symptoms resolve to one or more regions with per-area severity; product usage records application location when region-specific; recommendations target areas they address; outcomes confirm change in specific regions. A chin recommendation evaluates against chin history, not diluted forehead records. Product timelines align with symptom changes in the same sub-region.

### What the Hierarchy Enables

**Better history.** Per-region timelines show independent evolution—a stable forehead alongside a worsening chin tells a different story than undifferentiated “face concern.”

**Better comparison.** Structured levels enable reliable comparison across sessions, products, and outcomes rather than interpretive guesswork.

**Better product tracking.** Region-specific application links products to the areas they touch, supporting correlation between localized use and localized response.

**Better recommendations.** Area-grounded history produces precise, explainable guidance addressed to where the user actually experiences concern.

**Future heatmaps.** Fixed vocabulary enables personal heatmaps of concern density, severity distribution, and regional change—derived from structured linkage, not unstructured description.

**Future progress visualization.** Region-scoped timelines and visual progress views depend on consistent classification from first input onward.

Body Area Classification is foundational infrastructure—defined once, applied everywhere, refined only through deliberate platform evolution. Every input carrying spatial meaning passes through this model before entering the Intelligence Engine.

---

## Symptom Classification

(placeholder)

---

## Severity Model

(placeholder)

---

## Time & Progress Tracking

(placeholder)

---

## Product Collection

(placeholder)

---

## Ingredient Collection

(placeholder)

---

## Image Collection

(placeholder)

---

## OCR Pipeline

(placeholder)

---

## User Feedback Collection

(placeholder)

---

## Structured Output Model

(placeholder)

---

## AI Responsibilities

(placeholder)

---

## Future Expansion

(placeholder)

---

## Version History

V1 Draft
