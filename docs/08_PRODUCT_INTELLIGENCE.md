# Product Intelligence Engine

## Status

Draft V1

---

## Purpose

Product Intelligence is responsible for understanding every skincare product a user has used, is currently using, or plans to use. It sits within the SkinIntel Intelligence Engine as the layer that transforms product-related input—however it arrives—into structured, verified, and reusable product knowledge. The purpose is not catalog management for its own sake. It is to ensure that every product touching a user's skin journey is known, contextualized, and available for reasoning across the platform's full intelligence pipeline.

A user's product history is among the most actionable data the platform holds. Products are the primary variables users control. They introduce ingredients, change routine dynamics, and precede outcomes—positive, neutral, or negative. Product Intelligence exists so those variables are never lost, never ambiguous, and never trapped in a single session. What a user applied six months ago must remain accessible when today's recommendation is evaluated. What they start tomorrow must enter the same coherent record as what they logged at onboarding.

### Multiple Pathways, One Record

The engine must never depend on a single input method. Users encounter products in different contexts: selecting from a known catalog, searching by name, typing details manually, photographing packaging, relying on label extraction, or pasting an INCI list directly. Each pathway reflects real behavior. Restricting product capture to one method would exclude valid products, increase abandonment, and weaken the personal knowledge base.

Products may enter the platform through multiple pathways:

- **Selecting from the SkinIntel database** — choosing a verified product already known to the platform, with composition and metadata available for immediate enrichment.
- **Searching by product name** — locating a product through name matching when the user knows what they use but has not browsed the catalog directly.
- **Manual product entry** — providing product details by hand when catalog or search does not surface the correct item.
- **Uploading product photos** — capturing visual reference to packaging, labels, or product appearance as a starting point for identification.
- **OCR extraction** — converting photographed label text into structured product and ingredient fields, reducing manual transcription burden.
- **Manual INCI paste** — supplying ingredient lists directly when the user has them available, bypassing catalog lookup entirely.

Regardless of pathway, all product input must converge into one standardized product record. Convergence is an architectural requirement, not a convenience. A product selected from the database and a product assembled from manual INCI paste must resolve to the same logical structure—identifiable, linkable to the user's history, enrichable by Ingredient Intelligence, and eligible for correlation and recommendation. Fragmented or pathway-specific records would break longitudinal reasoning. Product Intelligence owns the normalization boundary: diverse input in, unified product knowledge out.

### Growing Platform Knowledge

Product Intelligence is responsible for building a continuously growing product knowledge base. Each newly identified product—once verified—can enrich the platform for future users and future sessions. A product first entered through manual entry or OCR today may become a verified catalog item tomorrow, reducing friction for the next person who uses it. The engine treats product identification as a contribution loop: user input expands platform coverage; platform coverage reduces user effort over time.

Verification is the gate between provisional capture and shared knowledge. Until verified, a product record serves the individual user faithfully. After verification, it may elevate to platform-wide availability—always subject to quality and accuracy standards. Product Intelligence orchestrates this progression without conflating personal provisional records with platform-verified truth.

### Understanding, Not Storing

Product Intelligence exists to understand products, not simply store them. Storage without understanding produces inert entries—names in a list with no connection to ingredients, routine role, application area, or outcome history. Understanding means linking each product to its composition, the user's relationship to it (current, past, planned), where and how it is applied, when use began or ended, and what the user reported as result. A stored product name is a label. An understood product is an intelligence asset.

Products become part of the user's longitudinal history the moment they enter through any pathway. That history persists across scans, accumulates with each routine change, and informs every layer that follows.

### Downstream Intelligence

Product Intelligence feeds the layers that reason about cause, fit, and guidance:

- **Ingredient Intelligence** — decomposes understood products into component-level knowledge, enabling sensitivity inference, interaction awareness, and composition-based explanation.
- **Correlation Engine** — links product introduction, continuation, and discontinuation to symptom changes, severity shifts, and reported outcomes across body areas and time.
- **Recommendation Engine** — draws on full product history—what worked, what failed, what was tolerated, what was rejected—to produce explainable, personalized product guidance.
- **Formulation Engine** — when no suitable verified product exists in catalog or history, the workflow may continue toward a formulation proposal rather than stopping at "no recommendation." Product Intelligence establishes that gap explicitly: the platform has understood what the user needs and confirmed that existing products do not satisfy it, enabling Formulation Engine as the advanced next step.

This handoff is intentional. Product Intelligence does not treat "product not found" as terminal failure. It distinguishes between "unknown product requiring capture" and "known gap requiring formulation"—each with a defined path forward.

### Summary

Product Intelligence ensures that every product in a user's skin journey—past, present, or planned—is captured through whatever pathway the user can provide, normalized into a single record standard, understood in context, and preserved for longitudinal reasoning. It grows platform product knowledge through verified contribution, feeds downstream intelligence layers with structured product truth, and opens the path to formulation when the product landscape offers no suitable answer. Without this layer, ingredients cannot be inferred reliably, correlations cannot attribute cause, recommendations cannot be personal, and formulation cannot know what gap it must fill.

---

## Philosophy

Product Intelligence is governed by a product philosophy that treats skincare items as living variables in a personal journey—not as static entries in a catalog. The principles below define how the engine interprets, records, recommends, and learns from products. They apply to every pathway through which a product enters the platform and to every downstream layer that consumes product knowledge.

### Products Are Active Variables, Not Static Catalog Items

Products are not static catalog items. They are active variables in the user's skin journey—introduced, continued, adjusted, discontinued, and evaluated over time. A product logged at onboarding is not a fixed fact; it is a point in a timeline that may precede improvement, reaction, indifference, or replacement. Product Intelligence tracks products as events in context: when use began, where applied, how often, in what routine position, and what the user reported as outcome.

The same product may be helpful, neutral, or problematic depending on the user, body area, routine, duration, frequency, and ingredient context. A moisturizer praised by many users may irritate one person's cheek when layered over a strong active. A serum tolerated for weeks may cause reaction when frequency increases. Product Intelligence rejects universal product verdicts. Helpfulness is personal, situational, and historical—not a property of the product alone.

### Context Over Names

Product Intelligence must understand context, not just product names. A name identifies a candidate; context reveals meaning. Context includes which user, which concern, which body area, which routine step, what co-existing products, how long use persisted, and what outcome followed. Two users logging the same product name may have opposite experiences; the engine must preserve and reason from those differences rather than collapsing them into a single platform opinion.

Recommendations and correlations built on names alone are fragile. Recommendations built on contextual history are personal and defensible.

### Verified Preferred, Provisional Usable

Verified products are preferred, but unverified or provisional products must still be usable for the individual user's history. When a user enters a product through manual entry, OCR, or INCI paste, the platform may not yet hold verified platform-wide metadata. That uncertainty must not block the user from logging use, tracking outcomes, or receiving guidance grounded in what is known.

Provisional records serve the individual faithfully from the moment of capture. Verification elevates a product toward shared platform knowledge—but the user's journey does not pause waiting for verification. Product Intelligence maintains a clear distinction between verified platform truth and provisional personal truth without treating provisional data as worthless.

### Honesty About Incomplete Data

The platform should never pretend certainty when product or ingredient data is incomplete. Partial INCI lists, ambiguous product matches, unverified entries, and conflicting catalog sources are realities. Product Intelligence communicates gaps openly—in recommendations, in correlation weighting, and in user-facing explanation. Qualified guidance with stated limits earns more trust than confident guidance built on missing composition data.

Uncertainty is not failure. Pretending completeness when composition or match confidence is low is a integrity failure.

### Explainable Recommendations

Product recommendations must be explainable. A user should understand why a product is suggested, avoided, or flagged—not merely see a result. Explanation draws on visible factors: alignment with stated goals, fit with body area and concern, ingredient compatibility, routine position, prior outcomes with similar products, and known sensitivities. Opaque recommendations undermine the platform's educational mission and the user's ability to learn from guidance.

Explainability is a permanent requirement, not a presentation preference.

### Recommendation Context Framework

Product recommendations must consider the full personal frame, not isolated product attributes:

- **User's history** — what products and ingredients this person has used, tolerated, rejected, or reacted to across time.
- **Current concern** — the active focus the user wants to address, weighting relevance over generic popularity.
- **Body area** — where the product will be applied and what regional history suggests about fit and risk.
- **Ingredients** — composition-level reasoning, not name-level guessing; interactions, actives, and known sensitivities.
- **Previous outcomes** — reported results from this product or structurally similar ones in this user's record.
- **Sensitivities** — hard constraints from allergies, irritants, and personal avoidance preferences.
- **Routine compatibility** — whether the product fits the user's actual sequence, frequency, and co-existing steps without conflict.

Recommendations that ignore any of these dimensions may appear plausible in isolation but fail in practice. Product Intelligence treats them as a unified reasoning frame.

### Reducing Effort Over Time

Product Intelligence should reduce user effort over time by remembering products and improving product recognition. A product logged once should not require full re-entry on every scan. Recognition improves as the platform accumulates verified records, match patterns, and user-specific history. The arc favors: first entry may take effort; subsequent reference should be immediate.

This principle aligns with Input Intelligence philosophy: the platform learns what the user uses so the user repeats less and the engine knows more.

### User Contribution to Platform Knowledge

User-added products can expand platform knowledge after verification. Every manual entry, OCR capture, or INCI paste is a potential contribution—not only to the individual record but to future users once verified. Product Intelligence treats user input as a growth mechanism for product coverage, subject to quality gates. The loop is virtuous: users fill gaps; verification shares knowledge; shared knowledge reduces future gaps.

### Matching Failure as Formulation Signal

If product matching fails, this is not failure—it may reveal a formulation gap. When catalog search, manual entry, and recognition exhaust reasonable options without surfacing a suitable verified product, the platform has learned something valuable: the user's need may not be met by existing catalog offerings. That gap is a signal for Formulation Engine, not a dead end labeled "no recommendation."

Product Intelligence distinguishes three states: product unknown (capture and verify), product known but unsuitable (explain and avoid), and no suitable product exists (hand off to formulation). Collapsing these into a single error state would waste intelligence the platform has already gathered.

### Guiding Summary

Product Intelligence holds that products matter because of how they behave in a specific user's journey—not because they appear in a catalog. Context, honesty, explainability, provisional usability, effort reduction, verified growth, and formulation-aware gap recognition define how the engine thinks about every product it touches. These principles ensure product knowledge serves personal intelligence rather than substituting catalog completeness for genuine understanding.

---

## Product Sources

(placeholder)

---

## Product Lifecycle

(placeholder)

---

## Product Verification

(placeholder)

---

## Product Matching

(placeholder)

---

## Product History

(placeholder)

---

## Product Outcome Tracking

(placeholder)

---

## Product Recommendation Logic

(placeholder)

---

## Missing Product Workflow

(placeholder)

---

## OCR Integration

(placeholder)

---

## Ingredient Integration

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
