# SkinIntel Architecture Decisions

## Purpose

This document records every important architectural decision made during the development of SkinIntel.

Each decision must explain:

- What was decided
- Why it was decided
- Alternatives considered
- Consequences
- Status

---

## ADR-001: Personal Skin Intelligence Platform

### Status

Accepted

### Context

SkinIntel originally started as an AI skin analysis application: a user captures an image or completes a structured session, and the platform returns an interpretation—symptoms suggested, concerns noted, guidance offered. That model delivers immediate utility. It does not, by itself, deliver durable value across months and years.

Product direction evolved when it became clear that a single AI scan is not enough to create long-term user value. One analysis is a moment. Skin changes with seasons, products, routines, stress, and life events. A platform that treats each session as an isolated answer cannot explain what changed, why it changed, whether prior guidance worked, or what patterns repeat for this individual. Users who receive only one AI answer have no reason to return beyond curiosity—and no accumulated asset that deepens with continued use.

The strongest long-term value comes from building a Personal Evidence Base: scans, symptoms, products, ingredients, routines, outcomes, recommendations, feedback, and longitudinal patterns connected over time. Each scan contributes evidence. Each product introduction, routine change, and outcome report adds context. Recommendations can be evaluated against what happened afterward. Intelligence improves because it learns from this user's history—not from generic assumptions alone.

Users should not only receive one AI answer; they should build a durable personal skin intelligence history over time. The product promise shifts from *what does AI think today?* to *what does my skin journey show, what changed after I acted, and what should I do next based on my own evidence?* That shift requires platform architecture, not a better single-shot model.

### Decision

SkinIntel will be developed as a Personal Skin Intelligence Platform, not merely an AI Skin Analyzer.

AI analysis remains important. Input Intelligence, image-assisted observation, and AI-generated interpretation are valuable capture and enrichment capabilities. They are not the core product. The core product value is the Intelligence Platform built from personal evidence, longitudinal memory, outcome tracking, product and ingredient intelligence, routine intelligence, and confidence-aware recommendations.

The platform organizes knowledge into durable objects—Scan Records, Product and Ingredient Models, Routine structure, Outcomes, Recommendations, Longitudinal Timeline, AI Knowledge Objects—with explicit boundaries and traceability. Intelligence Engines read and write this shared model. AI assists interpretation; personal evidence remains the foundation. Every layer must support accumulation: what was observed, what was used, what was recommended, what changed, and what was learned.

This decision establishes product identity and architectural north star for all subsequent design: SkinIntel is a longitudinal personal intelligence system for cosmetic skin care, powered by evidence and assisted by AI—not an AI wrapper around a camera.

### Consequences

**Positive consequences**

- **Stronger long-term retention** — Users accumulate a Personal Evidence Base that grows more valuable with each scan, product log, and outcome report. Returning users extend history rather than restart from zero.
- **Clearer product differentiation** — Generic AI skin analyzers compete on model quality alone. A Personal Skin Intelligence Platform competes on memory, traceability, outcome evaluation, and guidance grounded in individual history.
- **Ability to learn from user outcomes** — Structured outcomes, feedback, and recommendation evaluation enable the platform to assess what worked, what failed, and what remains uncertain for each user—feeding correlation, prediction, and learning layers.
- **Better recommendations over time** — Recommendations improve as evidence density increases: routine context, ingredient exposure, prior outcomes, and anti-repeat guards against unsuccessful patterns.
- **Stronger switching cost through personal history** — Years of scans, routines, products, and evaluated guidance constitute an asset users cannot trivially replicate elsewhere—earned through continued engagement, not lock-in through opaque data traps.
- **Architecture supports future intelligence layers** — A stable conceptual model and chronological evidence structure allow new capabilities—environmental context, advanced imaging, professional notes, aggregate insights where permitted—to extend the platform without redefining foundational objects.

**Tradeoffs**

- **More architecture work before implementation** — Object definitions, boundaries, and engine contracts must be established before features accumulate incompatible data shapes.
- **More need for object boundaries** — Symptoms, body areas, products, outcomes, and recommendations must remain distinct domains; convenience shortcuts that collapse models will erode explainability and longitudinal integrity.
- **More need for traceability, confidence, and evidence links** — Every inference, recommendation, and outcome must cite supporting evidence and express uncertainty honestly; this raises design and engineering cost compared to stateless AI responses.
- **Slower feature shipping in the short term** — Foundational platform work precedes rapid feature iteration; teams must resist shipping features that bypass the Data Model or overwrite historical evidence for speed.

### Boundaries

This decision defines platform scope and limits:

- **SkinIntel is not a diagnostic medical system** — It organizes personal cosmetic skin evidence and intelligence; it does not assign clinical diagnoses.
- **SkinIntel does not replace dermatologists** — Professional medical care remains outside platform scope; escalation to professional consultation may be recommended when safety boundaries are reached, not substituted for clinical judgment.
- **SkinIntel does not make treatment claims** — Guidance addresses cosmetic care, product usage, routine structure, and observable presentation; it does not claim to treat, cure, or medically manage disease.
- **SkinIntel remains educational and cosmetic in scope** — Personal Skin Intelligence serves informed self-care and evidence-based cosmetic decision-making, not medical treatment planning.
- **AI providers are replaceable** — Artificial intelligence assists capture and interpretation; provider choice is an implementation concern. AI Knowledge Objects normalize inference with evidence links and preserve historical accountability across provider changes.
- **Personal evidence is the core asset** — The user's accumulated scans, usage history, outcomes, and feedback constitute the platform's primary value. AI models may change; personal evidence must persist, remain traceable, and stay accountable to the user who created it.

---

## ADR-002: Architecture Before Implementation

### Status

Accepted

### Context

SkinIntel is entering a platform phase where the biggest risk is not lack of features, but building features without stable architecture. The temptation in a growing product is to ship visible capability quickly: another scan type, another recommendation surface, another product lookup path. Each addition in isolation appears productive. Accumulated without shared object definitions, engine contracts, and boundary discipline, those additions produce fragmented data, duplicated logic, weak traceability, and expensive rewrites when the platform must finally behave as a coherent intelligence system.

Earlier MVP work proved important foundations: the scan flow, AI output, persistence, history, and premium UX direction. Users can capture skin observations, receive AI-assisted interpretation, and see their activity persist. That validation confirms demand for skin intelligence tooling and establishes technical feasibility for capture and presentation. It does not yet define how years of evidence, outcomes, routines, products, and recommendations connect into a Personal Skin Intelligence Platform.

The next phase introduces complex long-term concepts: Personal Evidence Base, Data Model objects, Intelligence Engines, Outcomes, Recommendations, Product Intelligence, Ingredient Intelligence, Routine Intelligence, Longitudinal Timeline, and AI Knowledge Objects. These are not feature flags—they are architectural commitments about what the platform knows, how knowledge persists, how layers communicate, and how intelligence remains explainable over time. Implementing features before defining object boundaries would scatter symptom data across profile fields, collapse outcomes into recommendation text, treat product names as unstable strings rather than traceable identity, and discard routine history on every edit. Each shortcut accelerates a demo and degrades the platform's ability to accumulate trustworthy personal history.

The cost of deferring architecture is not zero delay—it is compound rework. A team that implements recommendation logic against ad hoc tables cannot easily evaluate whether prior guidance worked. A team that embeds AI output directly into scan records without AI Knowledge Object accountability cannot swap providers or audit inference history. Architecture before implementation is a risk reduction decision, not a documentation exercise for its own sake.

### Decision

SkinIntel will define architecture, Data Model boundaries, Intelligence Engine responsibilities, and development rules before implementing the next major product capabilities.

This means foundational documents are written, reviewed, and accepted as the implementation contract before large-scale feature development proceeds against the intelligence platform vision. Architecture defines what objects exist, what each object owns, what it must not own, how engines read and write shared knowledge, and how evidence, confidence, and traceability propagate through the system.

The following documents are part of the architecture foundation before implementation:

- **docs/SKININTEL_INTELLIGENCE_ENGINE_V1.md** — Intelligence Engine scope, layer responsibilities, and processing philosophy.
- **docs/SKININTEL_PLATFORM_ARCHITECTURE_V2.md** — Platform structure, engine relationships, and system-level boundaries.
- **docs/11_DATA_MODEL.md** — Conceptual knowledge objects, model boundaries, and Personal Evidence Base semantics.
- **docs/99_DEVELOPMENT_RULES.md** — Engineering discipline rules ensuring implementation respects architecture.
- **docs/ARCHITECTURE_DECISIONS.md** — Record of accepted decisions, tradeoffs, and scope boundaries governing change.

Implementation work on major intelligence capabilities—outcome evaluation, recommendation generation, product and ingredient normalization, routine history, longitudinal timeline assembly—proceeds against these definitions. Features that require undefined objects or blurred boundaries are blocked until architecture is extended through governed review, not improvised at implementation time.

Architecture before implementation does not mean analysis paralysis. It means the platform's intellectual structure precedes the next wave of capability code—not that all future features are fully specified before any code ships.

### Consequences

**Positive consequences**

- **Fewer rewrites later** — Object boundaries and engine contracts reduce the likelihood that early feature code must be discarded when outcome tracking, recommendation evaluation, or product intelligence mature.
- **Stronger separation of concerns** — Symptoms, body areas, products, outcomes, recommendations, and AI inferences remain distinct domains; teams implement against clear ownership rather than shared mutable blobs.
- **Better traceability** — Architecture mandates evidence links, confidence posture, and historical preservation—making recommendations, outcomes, and AI contributions auditable from the start.
- **Easier provider replacement** — Provider-independent AI Knowledge Objects and technology-independent Data Model definitions allow AI vendor and infrastructure changes without redefining what a scan or product means.
- **Easier multi-language support** — Language-independent internal identifiers defined in architecture enable localization without fragmenting longitudinal history.
- **Clearer future implementation tasks** — Engineers and AI agents receive explicit object definitions and boundary rules, reducing ambiguity about where data belongs and which engine owns which behavior.
- **Safer long-term intelligence development** — Correlation, prediction, learning, and formulation layers extend a stable foundation rather than patching around inconsistent early data.

**Tradeoffs**

- **Slower short-term visible progress** — Documentation and boundary definition precede some user-facing feature velocity; stakeholders may perceive delay before the next shippable increment.
- **More documentation work** — Architecture foundation requires sustained writing, review, and maintenance—not a one-time sprint.
- **More discipline required before coding** — Teams must resist shortcuts that bypass accepted object boundaries for expediency.
- **Higher upfront thinking cost** — Architects, product, and engineering invest significant effort defining concepts before corresponding implementation begins.

### Boundaries

This decision establishes how architecture relates to implementation:

- **Architecture documents do not replace implementation** — Documents define concepts, boundaries, and rules; working software still must be built, tested, and delivered against them.
- **Architecture must stay practical and actionable** — Definitions must be usable by engineers and AI agents as implementation contracts, not abstract theory disconnected from delivery.
- **No document should become a feature wishlist** — Architecture describes structure and principles; roadmap features require separate prioritization and, where needed, governed Data Model extension—not unchecked scope accumulation in docs.
- **No implementation should bypass accepted architecture decisions** — Code that collapses model boundaries, overwrites historical evidence, or embeds unlinked AI output violates the foundation this ADR establishes.
- **Future code must follow these boundaries unless a new ADR changes them** — Architecture evolves through explicit decision records with documented tradeoffs; silent drift through implementation shortcuts is not acceptable.

---

## ADR-003: Outcome Intelligence Engine

### Status

Accepted

### Context

SkinIntel cannot become a long-term Personal Skin Intelligence Platform if it only gives recommendations but never learns whether they worked. Guidance without evaluation is broadcast, not intelligence. A platform that suggests pausing a product, simplifying a routine, or monitoring a symptom—but never assesses what happened afterward—cannot improve, cannot avoid repeating failed advice, and cannot earn durable user trust.

Earlier AI analyzer products often stop at analysis and advice. They capture a moment, produce an interpretation, perhaps suggest a product or routine change, and move on. The loop is open. The user may follow guidance or ignore it; the platform does not systematically know. Over months, the user accumulates sessions but not evaluated change. Recommendation quality cannot be measured. Personal patterns remain anecdotal. Anti-repeat logic has no foundation. This is acceptable for a single-use analyzer; it is insufficient for Personal Skin Intelligence.

SkinIntel must understand change over time: improvement, worsening, no meaningful change, partial change, and uncertain change. Change is not binary and not always visible from a single follow-up scan. A user may report improvement on the cheeks while the forehead remains unchanged. Symptom trajectory may shift ambiguously when scan frequency is low. Platform inference may suggest stabilization while user feedback reports worsening. The Outcome Model defines these classifications; Outcome Intelligence is the engine capability that produces them from evidence.

Outcomes must connect scans, symptoms, body areas, products, ingredients, routines, recommendations, user feedback, and time. An outcome evaluation without time windows is meaningless—*improved* relative to when? Without product and routine context, correlation is impossible—*improved after what change*? Without recommendation linkage, the platform cannot assess its own guidance. Without user feedback, personal experience is silenced. Without confidence and uncertainty, weak evidence masquerades as certainty and corrupts downstream learning.

Without Outcome Intelligence, the platform cannot evaluate recommendation quality, learn personal patterns, avoid repeating failed advice, or build real user trust. Users who see the platform acknowledge uncertainty and track whether guidance helped experience accountability. Users who receive endless new advice with no memory of results experience noise.

### Decision

SkinIntel will include Outcome Intelligence as a core intelligence capability.

Outcome Intelligence will evaluate what changed after scans, product use, ingredient exposure, routine changes, and recommendations. It reads evidence from Scan Records, routine history, product usage periods, user feedback, and prior recommendation objects; it writes structured outcome evaluations aligned with the Outcome Model—scoped to symptoms, body areas, and time windows, linked to evidence references, and expressed with explicit confidence.

Outcome Intelligence must be evidence-based, confidence-aware, and uncertainty-preserving. Every outcome classification must trace to supporting evidence. Confidence derives from scan density, alignment between user report and platform observation, completeness of exposure context, and absence of confounding simultaneous changes. Uncertain change is a valid, first-class result—not a failure to produce a verdict.

Outcome Intelligence must not make diagnosis or treatment claims. It evaluates cosmetic presentation change and user-reported experience within platform scope; it does not assign clinical conditions or assert therapeutic outcomes.

Outcome Intelligence must support user-reported outcomes and platform-observed outcomes. User feedback is authoritative personal experience evidence. Platform inference extends evaluation when users do not actively report. Divergence between signals is preserved with uncertainty—not resolved by discarding user voice or suppressing weak inference.

Outcome Intelligence operates within the Longitudinal Timeline: before-and-after windows anchored to real events, outcome evaluation events positioned chronologically, and prior evaluations preserved when new evidence arrives—not silently overwritten.

### Consequences

**Positive consequences**

- **Closed learning loop** — Recommendations lead to outcome evaluation; outcomes inform future recommendations and learning signals—a complete cycle rather than open-ended advice.
- **Better recommendations over time** — Recommendation Engine assesses prior guidance effectiveness before issuing new guidance; anti-repeat failure logic draws on documented negative outcomes.
- **Ability to measure recommendation effectiveness** — Recommendation-related outcomes compare expected change against observed change, enabling platform accountability and Learning Layer calibration.
- **Better personal pattern detection** — Recurring outcome types across similar exposure or routine contexts feed Correlation Engine and Prediction Engine with evaluated change, not raw symptom snapshots alone.
- **Anti-repeat failure logic** — Structured record of neutral and negative outcomes linked to products, ingredients, routines, and recommendations prevents naive repetition of unsuccessful patterns.
- **Stronger longitudinal value** — Users see progress, stability, and setback as evaluated narrative across months—not disconnected scans.
- **More trust because the platform can say when evidence is weak** — Honest uncertain-change outcomes communicate epistemic integrity; users trust a platform that admits limits over one that feigns certainty.

**Tradeoffs**

- **Requires more structured follow-up** — Outcome evaluation depends on follow-up scans, feedback prompts, and review windows—not passive accumulation alone.
- **Requires time windows and evidence links** — Engineering and product must implement bounded comparison periods and traceable evidence references, raising design complexity.
- **Requires careful uncertainty handling** — Presentation layers must not collapse uncertain outcomes into false confidence; downstream engines must respect low-confidence evaluations appropriately.
- **Recommendations cannot be treated as one-off advice** — Every significant recommendation carries implicit or explicit outcome evaluation expectation, increasing platform responsibility.
- **Short-term UX must ask for feedback without overwhelming the user** — Follow-up prompts, confirmation flows, and correction paths must be designed for sustainable engagement, not interrogation after every action.

### Boundaries

Outcome Intelligence operates within strict scope limits:

- **Outcome Intelligence does not diagnose** — Change evaluation addresses cosmetic presentation and user experience; clinical condition assignment remains outside scope.
- **Outcome Intelligence does not prove medical causation** — Temporal association between exposure and symptom shift may support correlation candidates; definitive medical causation is not asserted.
- **Outcome Intelligence does not replace professional evaluation** — Persistent, severe, or ambiguous patterns may trigger safety boundary escalation to professional consultation; outcome evaluation does not substitute clinical judgment.
- **Outcomes must reference evidence** — Outcome objects without evidence links are architecturally invalid; unsupported verdicts must not enter the Personal Evidence Base.
- **Uncertain outcome is a valid result** — Sparse, conflicting, or incomplete evidence produces uncertain-change classification—not inflated improvement or worsening labels.
- **User feedback must be preserved and respected** — User-reported outcomes and corrections are first-class evidence; platform inference does not silently override user voice.
- **Outcome evaluation must not silently overwrite historical records** — Prior outcome evaluations, Scan Records, and AI Knowledge Objects remain retrievable; supersession follows governed append-only semantics with traceability.

---

## ADR-004: Confidence Layer

### Status

Accepted

### Context

SkinIntel depends on heterogeneous inputs: AI interpretation, user input, product data, ingredient data, routine history, scan quality, outcomes, and time-based evidence assembled across the Longitudinal Timeline. Personal Skin Intelligence emerges from combining these signals—but not all signals carry equal reliability. Treating every input as equally trustworthy produces confident-sounding guidance built on fragile foundations.

Some evidence is verified: admin-confirmed product identity, trusted INCI sources, user-confirmed symptom selections, aligned user report and scan trajectory. Some is user-reported: explicit feedback, manual product entry, self-described routine changes—authoritative as personal experience but not independently validated. Some is AI-inferred: symptom alignment suggestions, correlation candidates, pattern observations, prediction proposals—valuable but model-dependent. Some is provisional: OCR-extracted labels, pasted composition, retailer-sourced product pages awaiting verification. Some is incomplete: partial formulation knowledge, sparse scan history, missing routine context during a comparison window. Some is uncertain or conflicting: user reports improvement while structured symptom ratings show stability; two simultaneous routine changes obscure which exposure drove observed shift.

Without an explicit Confidence Layer, the platform may present weak inference as strong guidance, treat provisional product data like verified data, or hide uncertainty from users. A recommendation to introduce an active ingredient grounded in uncertain OCR composition and a single pre-change scan appears as authoritative as one grounded in verified formulation and six aligned follow-up scans. An outcome labeled improvement from sparse evidence erodes trust when the user experiences no change. AI Knowledge Objects presented without confidence posture invite users to treat every inference as fact.

Confidence must not be a UI badge only—a decorative indicator applied at presentation time while intelligence layers act as if all evidence were equal. Confidence must be a cross-platform property embedded in knowledge and intelligence artifacts, consumed consistently by AI Knowledge Objects, Outcomes, Recommendations, Product Intelligence, Ingredient Intelligence, Formulation Intelligence, Timeline interpretation, and future learning layers. Engines read confidence when deciding whether to recommend action, monitor, or collect more evidence; presentation layers reflect confidence already declared in the model—not invent it cosmetically at render time.

### Decision

SkinIntel will use a Confidence Layer across the Intelligence Platform.

Confidence must be attached to interpretations, evidence quality, product and formulation verification, ingredient matches, outcomes, recommendations, predictions, and learning signals where relevant. Each artifact carries confidence appropriate to its source class and evidence completeness—not a universal scalar applied uniformly without context, but an explicit posture declared at object creation and preserved through traceability.

Confidence must include uncertainty explanations and evidence references. Low confidence without explanation is insufficient; users and auditors must understand what was missing, conflicting, or provisional. Evidence references anchor confidence claims to Scan Records, verification events, user confirmations, and timeline context—confidence is not invented without evidentiary basis.

Confidence must influence how strongly the platform acts:

- **High confidence** can support stronger guidance: continue effective patterns, pause suspected irritants, simplify routine when overload signals are consistent across multiple evidence types.
- **Medium confidence** can support cautious guidance: reduce frequency rather than discontinue, monitor before introducing, suggest category gap with explicit follow-up requirement.
- **Low confidence** should prefer monitoring, collecting more evidence, or explaining uncertainty—recommendation types such as monitor symptom and collect more evidence are first-class outputs, not failures of the intelligence system.

The Confidence Layer integrates with ADR-003 Outcome Intelligence: uncertain change is valid; with ADR-001 Personal Skin Intelligence Platform: personal evidence quality varies and must be honestly represented; with the Data Model: verification status, source provenance, and evidence strength are defined properties across Product, Ingredient, Formulation, Outcome, Recommendation, and AI Knowledge Objects.

### Consequences

**Positive consequences**

- **Safer recommendations** — Guidance proportional to evidence reduces harmful over-intervention from weak signals.
- **More honest user experience** — Users see when the platform knows versus suspects versus cannot yet judge—building trust through transparency.
- **Stronger explainability** — Confidence and uncertainty explanations accompany recommendations, outcomes, and inferences; accountability questions have answers.
- **Better learning over time** — Learning Layer calibrates from confidence-weighted outcome pairs; inflated certainty corrupts learning less when confidence was honestly low at inference time.
- **Less hallucination risk** — AI Knowledge Objects require evidence links and confidence posture; ungrounded fluent output cannot masquerade as intelligence artifacts.
- **Clearer provider replacement** — Confidence recorded with inference provenance allows comparison of model versions without conflating provider change with evidence change.
- **Better handling of provisional products, OCR, and AI inference** — Provisional and uncertain inputs operate with widened bounds rather than forced verification pretense.

**Tradeoffs**

- **More complexity in every intelligence object** — Confidence, uncertainty explanation, and evidence references add fields of meaning across multiple model types.
- **More UI responsibility to communicate uncertainty clearly** — Presentation must translate confidence without alarming users or falsely simplifying into binary sure/unsure.
- **More engineering discipline** — Every intelligence path must declare confidence; shortcuts that default to high confidence violate architecture.
- **Cannot simplify everything into a single score** — Context-specific confidence across verification, evidence density, alignment, and completeness resists one-number dashboards that hide nuance.
- **Some recommendations will need to be cautious or delayed** — Product and stakeholder pressure for decisive guidance conflicts with honest low-confidence posture; architecture requires accepting delay over false precision.

### Boundaries

The Confidence Layer operates within strict limits:

- **Confidence is not diagnosis** — Confidence in cosmetic presentation interpretation or outcome evaluation does not confer clinical certainty or diagnostic authority.
- **Confidence is not proof** — High confidence means strong personal evidence support within platform scope—not proof of causation, efficacy, or medical conclusion.
- **Confidence is not a marketing trust badge** — Confidence scores must not be repurposed as brand trust signals disconnected from evidence chains.
- **Confidence must not hide weak evidence** — Presentation layers cannot display high-confidence styling when underlying objects declare low confidence; polishing uncertainty away violates this ADR.
- **Confidence must not be invented without evidence** — Default high confidence, missing uncertainty explanation, or absent evidence references are architecturally invalid.
- **Low confidence is valid and useful** — Monitor, collect evidence, and uncertain outcome paths are successful applications of the Confidence Layer—not errors to minimize.
- **Uncertainty must be preserved, not polished away** — Fluent language must not substitute for honest epistemic posture; users deserve accuracy over reassurance.

---

## ADR-005: Personal Threshold Learning

### Status

Accepted

### Context

Users do not all react the same way to products, ingredients, routines, or changes. Population-level assumptions—exfoliate twice weekly, introduce one active at a time, consider four weeks sufficient to judge a moisturizer—provide reasonable starting heuristics for cosmetic guidance. They are not personal truth. SkinIntel's long-term value comes from learning each user's personal tolerance, response patterns, and meaningful change thresholds from their own accumulated evidence.

One user may tolerate frequent exfoliation across multiple products while another reacts to small formulation changes with stinging and redness. One user may consider a modest reduction in visible redness meaningful progress toward a goal; another may care primarily about texture improvement and dismiss tone changes as irrelevant. One user may need dense scan history before the platform detects a pattern; another may produce clear signal from fewer sessions because symptom reporting is consistent and routine structure stable. Generic thresholds cannot capture this variance without erasing the individual.

Without Personal Threshold Learning, the platform would keep applying generic rules instead of adapting to the user's own evidence. Recommendations would treat all users as average. Outcome evaluation would use fixed definitions of improvement. Routine overload detection would ignore personal history of barrier fragility. Anti-repeat failure guards would miss that this user specifically reacts to fragrance exposure while tolerating acids. Prediction would project from population curves rather than personal trajectory. The platform would remain an analyzer with memory—not Personal Skin Intelligence.

This learning depends on outcomes, user feedback, routine history, product and ingredient exposure, body areas, symptoms, and time. Personal thresholds are not inferred from a single session or declared once in a profile field. They emerge from repeated outcome evaluations, confirmation and correction events, recommendation success and failure, symptom persistence patterns, tolerance signals across exposure windows, and confidence history on the Longitudinal Timeline. Learning without this evidence chain is profiling, not intelligence.

### Decision

SkinIntel will support Personal Threshold Learning as a long-term learning capability.

Personal Threshold Learning will use accumulated evidence to calibrate what is meaningful, risky, tolerable, effective, or unsuccessful for a specific user. Calibration targets include: magnitude of symptom change that counts as meaningful improvement for this user; exposure frequency and routine complexity this user historically tolerates; ingredient and product classes associated with positive, neutral, or negative outcomes for this user; body-area-specific response patterns; duration after product introduction before this user's evidence typically supports evaluation; and sensitivity of recommendation anti-repeat logic to prior failed guidance for this user.

Personal Threshold Learning must be evidence-based, confidence-aware, reversible, and never treated as universal truth. Learned thresholds are personal hypotheses supported by outcome and feedback history—not rules exported to other users or embedded as immutable platform defaults. Low-confidence history produces tentative calibration with wide bounds; strong repeated patterns produce narrower personal thresholds with explicit evidence support.

Personal Threshold Learning must learn from:

- **Repeated outcomes** — Sequences of improvement, worsening, stability, partial change, and uncertain change across defined windows.
- **User confirmations** — Acceptance of platform-observed outcomes and inferences strengthens calibration; rejection weakens or reverses inferred thresholds.
- **User corrections** — Governed corrections override inferred learning without erasing prior learning events from history.
- **Recommendation success or failure** — Recommendation-outcome pairs evaluate whether guidance produced expected change for this user.
- **Symptom persistence** — Chronic versus episodic presentation patterns by symptom and body area inform what counts as baseline versus deviation for this user.
- **Product tolerance** — Product introduction and discontinuation periods linked to outcome trajectories build personal product response profile.
- **Ingredient exposure history** — Cumulative canonical ingredient exposure windows linked to outcomes inform personal ingredient sensitivity and tolerance signals.
- **Routine complexity tolerance** — Historical association between routine step count, active overlap, and negative or positive outcomes for this user.
- **Body-area-specific patterns** — Regional outcome and symptom patterns where cheeks, jawline, or eye area behave differently for this user.
- **Uncertainty and confidence history** — Periods of sparse evidence widen personal thresholds; dense verified evidence supports tighter calibration.

Learning outputs feed Recommendation Engine, Outcome Intelligence, Prediction Engine, and Routine Intelligence as calibration inputs—referenced through learning signals and AI Knowledge Objects, not silent mutation of User Profile or Skin Profile baseline without governed recalibration.

### Consequences

**Positive consequences**

- **More personalized recommendations** — Guidance respects personal tolerance, meaningful change definitions, and prior success patterns rather than generic defaults alone.
- **Better anti-repeat failure guard** — Failed recommendations and negative outcomes for this user inform stronger avoidance of repeated unsuccessful patterns.
- **Better tolerance-aware routine guidance** — Routine overload and frequency recommendations calibrate to personal history of barrier response and complexity tolerance.
- **Stronger long-term retention** — Users experience the platform as increasingly attuned to their skin journey—the value of continued engagement compounds.
- **More relevant interpretation of progress** — Outcome evaluation weights what matters to this user and what magnitude of change their history treats as meaningful.
- **Better prediction over time** — Trajectory projection uses personal thresholds for expected response timing and symptom evolution.
- **Less generic advice** — Population heuristics recede as personal evidence density increases; guidance becomes evidence-personalized.

**Tradeoffs**

- **Requires enough history before learning is reliable** — New users operate on generic assumptions until sufficient outcomes, scans, and feedback accumulate; early personalization must not pretend depth.
- **Must avoid overfitting from weak data** — Single negative outcome after one product trial must not create permanent personal ban rules; confidence and repetition requirements constrain learning.
- **Must preserve uncertainty** — Tentative personal thresholds carry explicit confidence; low-evidence calibration must not present as established personal truth.
- **Must allow correction when user feedback contradicts inferred learning** — User correction supersedes inferred thresholds with traceability; the platform must not argue silently against corrected learning.
- **Must not become hidden black-box personalization** — Learned thresholds remain explainable: what evidence supported calibration, when it was updated, and what would invalidate it.

### Boundaries

Personal Threshold Learning operates within strict limits:

- **Personal thresholds are not medical diagnosis** — Learned tolerance and response patterns describe personal cosmetic evidence history, not clinical conditions or pathology.
- **Personal thresholds are not universal rules** — Calibration for one user must not propagate to others or replace Ingredient Model general knowledge as population truth.
- **Personal thresholds must not override safety boundaries** — Escalation to professional consultation when symptom severity or pattern exceeds cosmetic scope takes precedence over learned tolerance heuristics.
- **Personal thresholds must not erase historical evidence** — Learning updates calibrate interpretation; Scan Records, outcomes, and prior learning signals remain retrievable.
- **Weak evidence must not create strong personal rules** — Single-session or low-confidence inputs may suggest tentative calibration only—not durable personal policy.
- **User correction must be respected** — Governed user rejection of inferred thresholds creates superseding calibration with preserved audit trail.
- **Learned thresholds must remain explainable and reversible** — Users and auditors can inspect what was learned, from what evidence, and correct or reset calibration through governed flows.

---

## Future Decisions

(placeholder)
