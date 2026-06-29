# Phase 1 — Current Persistence Mapping V1

## Purpose

This document maps current SkinIntel persistence artifacts against the accepted Phase 1 Evidence Layer architecture before any Supabase schema, migration, API, or code work begins.

It implements the first recommended implementation slice from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**: conceptual mapping of Scan Record V2 against current analysis persistence. The mapping is architecture-level only—no code, no SQL, no API design, no UI design.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, and current delivery behavior as observed in the application.

---

## Current Known Persistence Model

At conceptual level, SkinIntel today persists completed scan sessions primarily through a single Supabase **`analyses`** store.

Each **`analyses`** row represents a completed analysis session. It includes:

- **User identifier** — `user_email`, linking the row to the authenticated user
- **AI result** — structured JSON output (intro, assessment, recommendations, next steps, disclaimer)
- **Confidence** — a top-level confidence value derived from AI output
- **Consent flags** — `consent_medical` and `consent_privacy`, recorded as boolean values at insert time
- **Model** — AI model identifier used for inference
- **Created timestamp** — when the row was persisted

The row currently behaves as a **mixed artifact**: it combines the scan event, the Intelligence Layer output, and a minimal consent record in one persistence unit. It does not separate evidence capture from AI analysis, does not preserve user-provided inputs as distinct evidence objects, and does not store uploaded images as governed Image Evidence.

Additional persistence behavior exists outside Supabase:

- **Client localStorage** — `skinintel_last_scan` holds the most recent session result on the device, including user description, ingredient/product text input, AI result, and client-side product scoring. This is not part of the Personal Evidence Base and is not governed by consent or deletion rules at platform level.
- **Planned but not fully delivered** — blueprint documents describe `analysis_images` and structured observation categories; current scan delivery sends images to AI inference but does not persist them as separate governed artifacts in the Evidence Layer sense.

Capture flow accepts image upload, user description, and ingredient/product text as form inputs. These inputs influence AI inference but are largely **not separately persisted** in the current `analyses` model—only the AI output and session metadata are stored server-side.

---

## Why Mapping Is Required

**Current persistence mixes evidence and intelligence output.** The `analyses` row conflates what happened at capture with what AI concluded. Phase 1 architecture requires Scan Record V2 as the evidence event and AI Analysis Result as a separate Intelligence Layer artifact with evidence links.

**Phase 1 requires separation of evidence events from AI analysis results.** Without mapping, implementation will extend the mixed model and cement boundary violations identified in **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

**Consent must become governed as Consent Snapshot, not simple flags only.** Current delivery validates consent at request time but persists hardcoded boolean flags without immutable scope snapshot semantics, audit linkage, or distinction from current consent state.

**Corrections and deletion compatibility require append-oriented evidence semantics.** The current model supports insert-only history but has no Correction Event, no supersession path, and no deletion/retention behavior aligned with Phase 1 governance.

**We must avoid creating new Supabase tables before object boundaries are mapped.** Schema work without this mapping risks building tables that reproduce prohibited merges—especially collapsing Scan Record V2 with AI output and treating AI confidence as Evidence Confidence Posture.

---

## Mapping Table

| Current artifact / concept | Closest Phase 1 object | Fit | Problem | Required future decision |
|----------------------------|------------------------|-----|---------|--------------------------|
| Current `analyses` row | Scan Record V2 + AI Analysis Result (mixed) | poor fit | Single row holds evidence session and Intelligence output together | Split or wrap: define which concerns remain in legacy row vs migrate to separated objects |
| Stored AI `result` JSON | AI Analysis Result (Intelligence Layer, not Phase 1 evidence) | partial fit | Persisted inside evidence-like container; includes recommendations (`top5`) without evidence links | Extract to governed Intelligence artifact linked to Scan Record V2 |
| Top-level `confidence` value | Evidence Confidence Posture | poor fit | Reflects AI output certainty, not input evidence quality | Introduce Evidence Confidence Posture; retain recommendation confidence separately |
| `consentMedical` / `consentPrivacy` flags | Consent Snapshot | partial fit | Validated at capture but stored as mutable-style booleans, not immutable snapshot with scope record | Model Consent Snapshot as append-only governance object linked to capture |
| `user_email` | Scan Record V2 ownership reference | good fit | Identifies user but not stable auth user ID pattern; acceptable as interim owner key | Decide canonical user reference for evidence objects |
| `created_at` | Scan Record V2 capture timestamp | good fit | Provides chronological anchor for session | Preserve as evidence event time; do not overwrite on correction |
| `model` | AI Analysis Result provenance | partial fit | Belongs to inference artifact, not evidence event | Move to Intelligence Layer output metadata |
| User image upload | Image Evidence | missing | Sent to AI at inference time; not persisted as governed visual evidence with metadata | Decide whether and how to persist Image Evidence with provenance |
| User `description` input | User Description Evidence | missing | Used in AI prompt only; not stored as separate user-origin evidence | Persist as User Description Evidence linked to Scan Record V2 |
| Ingredients / product text input | Product Mention Evidence (+ possible Routine Mention Evidence) | missing | Used in AI prompt and client scoring; not stored as unverified mention evidence | Capture as Product Mention Evidence; separate from Product Intelligence |
| `localStorage` last scan (`skinintel_last_scan`) | Transient client cache (not a Phase 1 object) | poor fit | Holds mixed session data locally; bypasses governed Personal Evidence Base | Deprecate as source of truth; align with server-side evidence persistence or mark explicitly non-authoritative |

---

## Key Boundary Problems

- **Scan Record V2 is currently mixed with AI Analysis Result** — The `analyses` row is the de facto session record and the AI output store. This violates the primary Phase 1 boundary.

- **Consent Snapshot is not yet a governed object** — Consent is gate-checked at request time and reduced to boolean flags on insert. No immutable snapshot, scope enumeration, or audit linkage exists.

- **Evidence Confidence Posture is not the same as AI confidence** — The persisted `confidence` field expresses AI output certainty. It does not qualify image quality, user attestation, input completeness, or source reliability.

- **User Description Evidence may not be separately preserved** — User narrative is consumed by inference and discarded from server persistence. Historical reasoning cannot be traced to user-origin text.

- **Image Evidence metadata is not yet modeled as its own evidence object** — Images are processed in memory for AI; no durable Image Evidence record with capture context exists.

- **Product Mention Evidence is not separated from ingredient/product input** — Free-text product and ingredient input influences AI and client-side scoring but is not stored as unverified mention evidence distinct from Product Intelligence.

- **Correction Event does not exist** — Users cannot qualify, supersede, or dispute persisted records through governed supersession. History is insert-only without correction semantics.

- **Deletion/retention compatibility is incomplete** — No documented per-object deletion behavior, consent withdrawal impact, or exclusion from personalization after deletion. localStorage retention is ungoverned.

---

## Missing Phase 1 Objects

| Phase 1 object | Current status | Notes |
|----------------|----------------|-------|
| Scan Record V2 | partial | Session timing and user linkage exist via `analyses` row, but mixed with AI output |
| Image Evidence | missing | Image used at inference; not persisted as governed evidence |
| User Description Evidence | missing | Description input not stored server-side |
| Symptom Observation Evidence | missing | No structured cosmetic signal objects; symptoms embedded in AI JSON only |
| Body Area Evidence Link | missing | No body area vocabulary linkage in current persistence |
| Product Mention Evidence | missing | Ingredient/product text not stored as mention evidence |
| Routine Mention Evidence | missing | No routine context capture as evidence |
| Consent Snapshot | partial | Boolean flags only; not immutable governed snapshot |
| Correction Event | missing | No correction or supersession mechanism |
| Evidence Confidence Posture | missing | AI confidence exists; input quality posture does not |

**Summary:** Zero Phase 1 objects are fully present. Two are partial (Scan Record V2, Consent Snapshot). Eight are missing.

---

## Migration Direction Options

Conceptual options only. No schema selection is made here.

### Option A — Extend current `analyses` model

Add columns or JSON sections to the existing table to hold separated evidence references, consent snapshot data, and child evidence links while retaining the row as the primary session anchor.

**Pros:** Minimal immediate disruption; existing history and history UI continue to function; lower short-term migration cost.

**Cons:** Reinforces mixed-artifact pattern; high risk of prohibited merges; difficult to enforce Evidence Layer boundaries in a table designed for AI output; correction and deletion semantics harder to append cleanly.

### Option B — Introduce dedicated Evidence Layer tables later

Create new governed evidence stores aligned to Phase 1 objects. Treat current `analyses` as legacy Intelligence-oriented persistence. New captures write to Evidence Layer first; AI output links back.

**Pros:** Clean boundary alignment; append-oriented evidence semantics easier to enforce; Consent Snapshot, Correction Event, and Evidence Confidence Posture can be modeled correctly from the start.

**Cons:** Requires migration mapping for existing rows; dual-read period during transition; more architecture and implementation work before first deliverable.

### Option C — Transitional hybrid

Retain `analyses` as a compatibility wrapper or read model while new evidence objects persist separately. New sessions write both: governed evidence objects plus a transitional summary row for existing UI.

**Pros:** Preserves user-facing history during transition; allows incremental separation; supports mapping validation before full cutover.

**Cons:** Temporary complexity; dual-write risk if not strictly governed; danger of treating wrapper row as source of truth and never completing separation.

---

## Recommended Next Decision

The next architecture decision should be: **choose the minimal Phase 1 implementation slice and decide whether current `analyses` becomes legacy compatibility, transitional wrapper, or source for migration mapping.**

Specifically, product and architecture should decide:

1. Whether the first coding slice is mapping-only validation (this document accepted) or includes a minimal persistence change
2. Which migration direction option (A, B, or C) aligns with boundary constraints—not which tables to create yet
3. Whether existing `analyses` rows remain readable as-is, gain a transitional wrapper, or feed a one-time migration mapping exercise
4. Whether client `localStorage` last scan is explicitly deprecated as non-authoritative in favor of governed server-side evidence

This decision must pass Phase 1 gates—especially **Minimal implementation slice selected**—before any Supabase or application persistence work proceeds.

---

## Current Decision

**This document does not authorize Supabase changes.**

Acceptance of this mapping means architecture and product agree on how current persistence relates to Phase 1 evidence objects, where boundary violations exist, and what decisions remain open. It does not authorize:

- New Supabase tables or columns
- SQL migrations
- API changes
- Application persistence refactors
- UI changes to history or dashboard

**No tables should be created until this mapping is reviewed and accepted.**

Until acceptance, all persistence work that would extend or replicate the current mixed `analyses` model should be treated as out of scope for Phase 1 evidence foundation.
