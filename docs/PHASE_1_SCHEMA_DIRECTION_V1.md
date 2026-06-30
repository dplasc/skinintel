# Phase 1 — Schema Direction V1

## Purpose

This document closes **gate 13 (Schema direction approved separately)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** at the **conceptual** level before any Supabase schema, migration, API, or application persistence work begins.

It translates the accepted **Transitional Hybrid** persistence direction from **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, the Scan Record V2 transitional model from **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, and behavioral governance from consent, deletion, correction, and confidence planning documents into a **conceptual store grouping and relationship model only**.

This is a planning artifact. It does not define exact database tables, columns, fields, SQL, migrations, API contracts, or UI behavior.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**.

---

## Decision

Phase 1 conceptual schema direction is:

**Transitional Hybrid with dedicated Evidence Layer stores and `analyses` as compatibility/read model.**

Specifically:

- **Do not extend `analyses` as the canonical Evidence Layer store.** Option A (extend current mixed model) is rejected per **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**. The existing row conflates Scan Record V2, AI Analysis Result, consent booleans, and AI confidence; extending it would reinforce prohibited merges identified in **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** and **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**.

- **Introduce dedicated Evidence Layer persistence later.** Governed stores aligned to Phase 1 evidence objects are introduced separately when implementation is authorized—not by growing the legacy mixed artifact.

- **`analyses` remains a compatibility/read model during transition.** Current history and dashboard may continue reading from `analyses` while Evidence Layer separation is introduced incrementally (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**).

- **New captures should eventually write evidence-first.** Scan Record V2 and attached Phase 1 evidence objects become the authoritative capture record; Intelligence output follows governed evidence with explicit links.

- **AI Analysis Result should link to Scan Record V2** as a separate Intelligence Layer artifact—not embedded inside the evidence event.

- **Exact tables and fields are not defined here.** Physical persistence design is deferred to implementation documents authorized after this gate and the minimal implementation slice gate pass.

---

## Why This Direction

This direction follows directly from accepted planning and audit artifacts:

**Persistence mapping** — **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** maps current `analyses` as a poor fit for Scan Record V2 (mixed with AI output), partial fit for Consent Snapshot (boolean flags only), and missing for eight Phase 1 objects. Zero objects are fully present. Schema work without separation would cement boundary violations.

**ADR Option C** — **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** accepts Transitional Hybrid as the Phase 1 entry path: clean Evidence Layer boundaries with a compatibility bridge for working history, rejecting Option A and deferring full cutover (Option B) until minimal slice validation.

**Scan persistence audit** — **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** confirms the live write path is pre-transition legacy: mixed-artifact insert, ephemeral capture inputs, hardcoded consent booleans, AI confidence only, ungoverned localStorage, and no evidence-first write order. Transitional Hybrid has not started; schema direction must not extend this path.

**Behavioral governance gates** — Consent, deletion, correction, and confidence behavior documents define semantics that physical persistence must reflect:

- **Consent Snapshot** — immutable scope record at capture; not hardcoded booleans (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).
- **Deletion/retention** — per-object exclusion, tombstones, compatibility row invalidation, localStorage pairing (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- **Correction Event** — append-oriented supersession; no edit-in-place (**docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**).
- **Evidence Confidence Posture** — input quality separate from AI confidence (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**).

Schema direction must encode these behaviors conceptually before any table design—not after.

---

## Conceptual Store Groups

The following are **conceptual store groups only**. No fields, table names, or SQL.

### Evidence Session Store

For **Scan Record V2** — the governed capture session anchor: session identity, capture timestamp, user ownership reference, references to child evidence objects, session-level Evidence Confidence Posture linkage, and Consent Snapshot linkage.

### Consent Governance Store

For **Consent Snapshot** and consent eligibility linkage — immutable capture-time scope records linked to Scan Record V2; distinct from current mutable consent state.

### Evidence Content Stores

For capture artifacts attached to a session:

- **Image Evidence**
- **User Description Evidence**
- **Symptom Observation Evidence**
- **Body Area Evidence Link**
- **Product Mention Evidence**
- **Routine Mention Evidence**

Each store holds evidence content and provenance—not Intelligence Layer conclusions, Product Intelligence resolution, or Routine Model structures.

### Evidence Governance Stores

For lifecycle and qualification governance:

- **Correction Event** — append-oriented supersession records
- **Evidence Confidence Posture** — input quality qualification
- **Deletion/retention markers** — exclusion, tombstone, and eligibility markers per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**

### Intelligence Output Store

For **AI Analysis Result** linked to Scan Record V2 — Intelligence Layer artifact with evidence references, model provenance, and AI output confidence separate from Evidence Confidence Posture.

### Compatibility Read Model

For **`analyses`** or a future analyses-compatible read surface — denormalized transitional summary for legacy history and dashboard reads; non-authoritative for Evidence Layer concerns.

---

## Relationship Direction

Conceptual relationships only:

- **Scan Record V2 anchors the capture session** — all session-scoped evidence and governance attach to this anchor.
- **Consent Snapshot links to Scan Record V2** — created before or atomically with session persistence; child evidence inherits session linkage.
- **Child evidence objects link to Scan Record V2** — Image Evidence, User Description Evidence, Symptom Observation Evidence, Body Area Evidence Link, Product Mention Evidence, and Routine Mention Evidence reference the session anchor.
- **Evidence Confidence Posture attaches to Scan Record V2 and/or child evidence objects** — session aggregate and per-object qualification; not stored on AI Analysis Result or compatibility row as authoritative posture.
- **Correction Events link to the evidence they correct** — append-only chain; authoritative read resolves via correction + deletion rules, not latest insert alone.
- **Deletion/retention markers link to affected objects** — exclusion propagates to linked Intelligence outputs and compatibility surfaces.
- **AI Analysis Result links to Scan Record V2** — Intelligence consumes governed evidence; does not embed inside the evidence event.
- **`analyses` compatibility row may reference or summarize linked outputs but is not authoritative** — may denormalize for UI convenience during transition; Personal Evidence Base authority resides in governed Evidence Layer stores.

Intended write priority (conceptual): consent validation → Consent Snapshot → Scan Record V2 → child evidence → Evidence Confidence Posture → AI Analysis Result → optional compatibility row (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**).

---

## What `analyses` Becomes

Under Transitional Hybrid:

- **Legacy `analyses` remains readable** — existing rows support current history list and detail views during transition.
- **Future `analyses` may become a compatibility wrapper or denormalized read model** — summary row for UI until evidence-first read paths are validated and cut over.
- **`analyses` must not preserve deleted evidence in embedded JSON** — when governed evidence is excluded, denormalized `result` payload must not retain recoverable capture content or AI output per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**.
- **`analyses.confidence` remains legacy AI confidence, not Evidence Confidence Posture** — row-level confidence reflects AI output certainty only; input quality qualification lives in Evidence Governance Stores (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**).
- **`analyses` should not be extended as long-term source of truth** — no new columns or JSON sections to hold canonical evidence objects, Consent Snapshots, Correction Events, or Evidence Confidence Posture as primary store.

---

## What localStorage Becomes

- **localStorage remains a non-authoritative device cache** — `skinintel_last_scan` is not Personal Evidence Base (**docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**).
- **It cannot be Personal Evidence Base** — governed evidence, consent, correction, and deletion semantics apply server-side only.
- **Future implementation must prevent localStorage from bypassing deletion/consent rules** — server-side exclusion must pair with client cache invalidation on deletion, withdrawal, or account actions (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).
- **It should eventually be reduced or clearly marked as convenience cache only** — not a parallel session store that diverges from governed server evidence.

---

## Schema Direction Constraints

The following constraints bind all future physical persistence design under this direction:

- **No merging Scan Record V2 with AI output** — evidence event and Intelligence result remain separate with explicit links.
- **No storing AI confidence as Evidence Confidence Posture** — input quality and output certainty are distinct layers.
- **No hardcoded consent booleans as Consent Snapshot** — immutable scope enumeration at capture required.
- **No hidden deleted evidence in compatibility rows** — `analyses` embedded JSON must not survive governed deletion.
- **No correction as edit-in-place** — supersession via Correction Event only.
- **No Product Intelligence tables in Phase 1** — Product Mention Evidence only; no catalog resolution stores.
- **No Routine Intelligence tables in Phase 1** — Routine Mention Evidence only; no regimen graph stores.
- **No commercial profiling stores** — no marketing segments, purchase propensity, or third-party exploitation artifacts.
- **No exact SQL in this document** — physical design is a downstream gate after minimal implementation slice selection.

All prohibited merges in **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** and Phase 1 Rules in **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** remain binding.

---

## Implementation Risk Notes

| Risk | Description |
|------|-------------|
| **Dual-write drift** | When new captures write both Evidence Layer stores and compatibility rows, authority per concern must be explicit; drift between stores is the primary transitional failure mode. |
| **Compatibility row becoming source of truth again** | Treating `analyses` as canonical because UI still reads it would abort separation; compatibility surface must remain denormalized and subordinate. |
| **Overbuilding schema before minimal slice** | Introducing full store groups before the first governed write path is validated increases rework risk; physical design should follow minimal slice scope. |
| **localStorage divergence** | Client cache retaining sessions after server deletion or without consent linkage defeats governance; must be addressed in implementation, not ignored. |
| **Incomplete deletion propagation** | Deleting governed evidence without invalidating compatibility rows or Intelligence outputs leaves hidden personal data. |
| **Confusing evidence confidence with AI confidence** | Reusing `analyses.confidence` or a single field for both concerns collapses layers and misleads users and downstream reasoning. |

These risks are explicit and governable under Transitional Hybrid when behavioral gates and dual-write rules are enforced—not accidental.

---

## Gate Decision

**Upon review and approval of this document, gate 13 (Schema direction approved separately) may be marked PASS** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Acceptance means product and architecture agree on:

- Transitional Hybrid as conceptual schema direction
- Conceptual store groups and relationship direction
- Role of `analyses` and localStorage during transition
- Schema direction constraints binding future physical design

Approval is **planning-level only**. It does not authorize Supabase changes, SQL, code, API, or UI work.

---

## Remaining Dependency

This document does **not** close:

| Gate | Status after this document |
|------|----------------------------|
| **Minimal implementation slice selected** | **Open** — gate 14; first coding unit not yet chosen |

Behavioral gates 9–12 (consent, deletion, correction, confidence) are defined in prior planning documents. Schema direction incorporates their semantics; implementation authorization still requires minimal slice sign-off.

---

## Recommended Next Step

**Create `docs/PHASE_1_MINIMAL_IMPLEMENTATION_SLICE_V1.md`** to select the first actual coding slice.

That document should:

- Choose the smallest bounded implementation unit after all planning gates pass
- Map the slice to accepted store groups and transitional write/read order
- Define what the slice explicitly excludes (full schema, full cutover, UI redesign)

**Clarification:** The minimal implementation slice document still does **not** write code or SQL. It only selects and scopes the first implementation unit authorized for engineering work after gate review completes.

---

## Current Decision

**Schema direction is defined for Phase 1 planning only.**

This document establishes conceptual persistence grouping under Transitional Hybrid. It does **not** authorize:

- Supabase schema changes or migrations
- SQL or table creation
- Code changes to `app/api/scan/route.ts`, dashboard, history, or related paths
- API contract changes
- UI redesign

Implementation authorization requires explicit sign-off on **minimal implementation slice** (gate 14) after this document is accepted. Until then, current legacy `analyses` and localStorage behavior remain unchanged; this document defines the target conceptual schema direction for transitional hybrid implementation when gated.
