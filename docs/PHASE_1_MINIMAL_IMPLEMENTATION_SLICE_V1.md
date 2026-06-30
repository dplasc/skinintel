# Phase 1 — Minimal Implementation Slice V1

## Purpose

This document closes **gate 14 (Minimal implementation slice selected)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** by selecting the first minimal implementation slice after Phase 1 planning gates.

It follows accepted schema direction in **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, Transitional Hybrid persistence in **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, and behavioral governance from consent, deletion, correction, and confidence planning documents. This artifact selects and scopes the first implementation unit—it does not define SQL, migrations, API contracts, application code, or UI behavior.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

---

## Decision

The first minimal implementation slice is:

**Read-only technical design for Evidence Layer persistence slice 1: Scan Record V2 + Consent Snapshot + Compatibility `analyses` linkage.**

This slice is the **first implementation unit to design**, not to code. It produces a reviewed technical design and proposed migration plan before any Supabase changes, application persistence changes, or UI work.

---

## Why This Slice First

This slice is the smallest governed unit that establishes evidence-first authority without a full Evidence Layer rebuild.

- **Scan Record V2 is the anchor** — all Phase 1 evidence and Intelligence outputs attach to the governed capture session (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**). Without a session anchor, child evidence and AI Analysis Result cannot link correctly.

- **Consent Snapshot must exist before governed capture** — immutable scope record at capture time is required before evidence persistence (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**). Current delivery persists hardcoded booleans only (**docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**).

- **`analyses` compatibility linkage is required** — current dashboard and history depend on `analyses` reads (**docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**). Transitional Hybrid requires a non-authoritative compatibility bridge until evidence-first read paths are validated (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**).

- **This slice avoids full Evidence Layer rebuild** — Image Evidence, User Description Evidence, Product Mention Evidence, Correction Event, Evidence Confidence Posture, and deletion workflows are deferred to later slices per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**.

- **This slice does not touch Product Intelligence, Routine Intelligence, Learning, or UI redesign** — scope stays within Phase 1 Evidence Layer foundation and Transitional Hybrid entry path (**docs/IMPLEMENTATION_PLAN_V1.md**).

---

## Slice Scope

The following defines what slice 1 covers at conceptual and technical-design level only.

### First physical persistence target (conceptual)

Introduce governed stores for:

1. **Evidence Session Store** — Scan Record V2 as capture session anchor
2. **Consent Governance Store** — Consent Snapshot linked to Scan Record V2
3. **Compatibility Read Model linkage** — reference from `analyses` row to Scan Record V2 (or inverse reference from session to compatibility row), preserving current history/dashboard reads

AI Analysis Result physical store may be **designed for linkage** in this slice but **not implemented** as persistence in slice 1 unless explicitly added in the reviewed technical design—slice 1 prioritizes session + consent authority and compatibility bridge.

### Store mapping

| Phase 1 object | Conceptual store group | Slice 1 role |
|----------------|------------------------|--------------|
| Scan Record V2 | Evidence Session Store | **In scope** — authoritative capture session anchor |
| Consent Snapshot | Consent Governance Store | **In scope** — immutable capture-time consent record |
| AI Analysis Result | Intelligence Output Store | **Linkage designed** — future artifact links to Scan Record V2; legacy payload may remain in `analyses.result` during transition |
| `analyses` row | Compatibility Read Model | **In scope** — remains read model; gains linkage to Scan Record V2 |

### Future AI Analysis Result linkage

Under Transitional Hybrid, AI Analysis Result must reference Scan Record V2 as a separate Intelligence Layer artifact (**docs/PHASE_1_SCHEMA_DIRECTION_V1.md**). Slice 1 technical design must define:

- How future Intelligence output references the session anchor
- That `analyses.result` remains legacy embedded AI payload until a later slice separates Intelligence persistence
- That AI output is not embedded inside Scan Record V2

### `analyses` as compatibility/read model

- Existing rows remain readable for history and dashboard
- New captures may dual-write: governed session + consent first, then optional compatibility row for current UI (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**)
- Compatibility row summarizes or references session; it is not the Evidence Layer source of truth

### Authority rules between Scan Record V2 and `analyses`

| Concern | Authoritative in slice 1 | Non-authoritative |
|---------|--------------------------|-------------------|
| Capture session identity | Scan Record V2 | `analyses` row ID alone |
| Capture timestamp | Scan Record V2 | — |
| User ownership | Scan Record V2 | — |
| Consent at capture | Consent Snapshot | `consent_medical` / `consent_privacy` booleans |
| Session existence / eligibility | Scan Record V2 + Consent Snapshot | — |
| History/dashboard display | `analyses` (transitional read) | — until cutover |
| AI output payload | `analyses.result` (legacy, transitional) | Scan Record V2 must not embed AI JSON |

Dual-write, when introduced in a later coding slice, must enforce: **evidence stores win on conflict**; compatibility row is denormalized convenience only.

### What legacy `analyses` rows cannot support

Per **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** and **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, existing rows cannot provide:

- Separated Scan Record V2 without mixed AI payload
- Immutable Consent Snapshot with scope enumeration
- Evidence-first write order or evidence links for AI output
- Image Evidence, User Description Evidence, or other child evidence persistence
- Correction Event, Evidence Confidence Posture, or deletion/retention markers
- Governed supersession or authoritative correction resolution

Legacy rows remain readable as-is during transition; new captures adopt slice 1 semantics when implementation is authorized after technical design review.

---

## Explicit Out of Scope

The following are excluded from this document and from slice 1 design scope:

- SQL migrations in this document
- Exact table fields in this document
- API implementation
- Code changes
- UI changes
- Image Evidence persistence
- User Description Evidence persistence
- Product Mention Evidence persistence
- Routine Mention Evidence persistence
- Correction Event implementation
- Deletion workflow implementation
- Evidence Confidence Posture implementation
- Product Intelligence
- Routine Intelligence
- Learning Layer
- Stripe
- PDF export

Deferred objects remain governed by their behavior documents for **future slices**; slice 1 does not implement them.

---

## First Engineering Task After This Document

After this document is reviewed and accepted, the first actual engineering task is:

**Create a technical design prompt for Cursor to produce a read-only implementation plan for the first Supabase migration.**

That task should:

- Scope design to slice 1 only: Scan Record V2, Consent Snapshot, and `analyses` compatibility linkage
- Apply authority rules and constraints from **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** and behavioral governance documents
- Inspect current Supabase migrations/schema as needed for alignment with existing `analyses` table
- Produce a **proposed migration plan** document—not applied SQL

**Clarifications:**

- **Still no SQL execution** — migration plan is review artifact only until explicitly approved
- **Cursor may inspect** current migrations and schema to avoid conflicting with legacy structure
- **Output is proposed migration plan**, not applied changes, not API refactor, not UI work

---

## Authority Rules

These rules bind slice 1 design and all subsequent implementation derived from it:

- **Scan Record V2 becomes authoritative capture session once implemented** — Personal Evidence Base session anchor; not `analyses` row alone.
- **Consent Snapshot becomes authoritative capture-time consent record** — immutable scope enumeration at capture; not hardcoded booleans (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).
- **`analyses` remains compatibility/read model only** — denormalized transitional surface for history and dashboard; must not become canonical Evidence Layer store (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**).
- **`analyses.result` remains legacy AI output payload** — Intelligence Layer content stays separate from Scan Record V2 until a later slice introduces dedicated AI Analysis Result persistence.
- **`analyses.confidence` remains AI output confidence, not Evidence Confidence Posture** — input quality qualification is a future Evidence Governance Store concern (**docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md**).
- **localStorage remains non-authoritative convenience cache** — `skinintel_last_scan` is not Personal Evidence Base and must not bypass consent or deletion rules when implementation proceeds (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).

---

## Required Acceptance Criteria Before Coding

No coding, SQL execution, or Supabase changes may begin until all of the following are satisfied:

| Criterion | Requirement |
|-----------|-------------|
| **Gates 1–14 accepted** | All Phase 1 planning gates marked PASS in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, including this document for gate 14 |
| **Schema direction accepted** | **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** approved at planning level |
| **Minimal slice accepted** | This document approved; slice 1 scope and exclusions binding |
| **First technical design reviewed** | Read-only implementation plan for slice 1 produced and reviewed by product and architecture |
| **Migration plan reviewed before SQL** | Proposed Supabase migration plan approved as design artifact before any migration file is written or applied |
| **No direct Supabase manual table creation** | No ad hoc table or column creation without reviewed migration plan |
| **No UI changes in first implementation slice** | History, dashboard, and capture UI unchanged in slice 1 coding scope |

Behavioral documents (consent, deletion, correction, confidence) inform design constraints even when not fully implemented in slice 1—physical design must not encode prohibited merges or block future governance paths.

---

## Phase 1 Implementation Opening Statement

**After this document is accepted and committed, Phase 1 may move from planning into controlled technical design—but not directly into coding.**

The authorized next phase is:

1. Produce read-only technical design for slice 1 persistence
2. Produce proposed migration plan via reviewed Cursor design task
3. Gate review of migration plan before any SQL or application changes

Planning gates establish *what* and *why*; technical design establishes *how* at schema and integration level; coding begins only after design and migration plan approval.

---

## Current Decision

**This document selects the first minimal implementation slice at planning level.**

Slice 1 is: **read-only technical design for Scan Record V2 + Consent Snapshot + Compatibility `analyses` linkage.**

This document does **not** authorize:

- Immediate SQL or Supabase schema changes
- Migration execution
- Code changes to `app/api/scan/route.ts`, dashboard, history, or related paths
- API contract changes
- UI redesign or new capture/history UX

Implementation authorization requires acceptance of this document, completion of gates 1–14 sign-off, and explicit approval of the first technical design and migration plan before any engineering work applies changes to the repository or database.
