# Phase 1 — Consent Snapshot Behavior V1

## Purpose

This document defines **Consent Snapshot behavior** for Phase 1 Evidence Layer Foundation and closes **gate 9 (Consent Snapshot behavior accepted)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** before any Evidence Layer implementation.

It translates consent governance from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, and audit findings in **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** into explicit capture-time, withdrawal, and prohibited-behavior rules.

This is a planning artifact only. It does not define database fields, SQL, API contracts, or UI components.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

---

## Consent Snapshot Definition

**Consent Snapshot** is a Phase 1 Evidence Layer governance object with the following properties:

- **Immutable capture-time governance record** — written once at evidence creation; never modified in place.
- **Linked to Scan Record V2** — each governed capture session references the snapshot active when capture began.
- **Records which consent scopes were active at evidence creation** — explicit enumeration of authorized processing and retention permissions at that moment.
- **Historical record, not mutable user settings** — preserves what was permitted when evidence was captured for audit and downstream eligibility checks.
- **Not a UI checkbox state only** — UI may collect consent, but governed persistence requires a snapshot object with scope record and timestamp, not transient form state.
- **Not a replacement for current consent state** — user preferences that govern future capture and withdrawal remain a separate concern.

Consent Snapshot answers: *"Under which consent scopes was this evidence captured and authorized to be processed?"*

---

## Why This Is Required

Phase 1 cannot implement governed evidence capture without explicit Consent Snapshot behavior.

**Current delivery gaps** (from **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**):

- Consent is **gate-checked** at request time but **not governed** as a durable object.
- `analyses` stores **hardcoded** `consent_medical: true` and `consent_privacy: true` booleans — partial legacy signals, not immutable scope snapshots.

**Architectural requirements:**

- **Evidence Layer requires consent-aware capture** — evidence must not persist or enrich without valid consent at creation time (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**).
- **Deletion/retention and learning eligibility depend on consent scope** — what may be retained, used for reasoning, or excluded after withdrawal is determined by scopes active at capture and subsequent governance events.
- **AI Knowledge Objects and future intelligence must not bypass consent** — Intelligence Layer processing consumes evidence only when capture-time consent authorized the relevant scopes; no orphan inference or silent reuse after withdrawal.

Without Consent Snapshot semantics, Phase 1 cannot meet consent/deletion gates or Transitional Hybrid write order (snapshot before Scan Record V2).

---

## Consent Scopes For Phase 1

Phase 1 defines the following **conceptual consent scopes**. These are language-neutral identifiers for governance; they are not database fields.

### cosmetic_analysis_acknowledgement

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User acknowledges SkinIntel provides cosmetic/educational analysis, not medical diagnosis or treatment. |
| **Required for capture?** | **Yes** — mandatory for any scan session. |
| **What it allows** | Proceed with cosmetic-scope AI analysis presentation; display educational disclaimers tied to the session. |
| **What it does not allow** | Medical claims, disease labeling, diagnostic framing, or treatment planning. |

### image_processing_consent

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User authorizes processing of uploaded skin image for cosmetic analysis. |
| **Required for capture?** | **Yes** — mandatory when image is included in capture (Phase 1 scan requires image). |
| **What it allows** | Image transmission to AI for cosmetic analysis; future persistence as Image Evidence with provenance. |
| **What it does not allow** | Public sharing, marketing use, third-party sale, or processing beyond stated cosmetic analysis purpose. |

### description_processing_consent

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User authorizes processing of self-reported description and symptom context. |
| **Required for capture?** | **Yes** when user provides description text; optional field may proceed without if empty and scope not invoked. |
| **What it allows** | Storage as User Description Evidence; use in AI reasoning linked to evidence. |
| **What it does not allow** | Replacing user voice with AI paraphrase presented as user-origin; clinical interpretation as diagnosis. |

### evidence_storage_consent

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User authorizes server-side persistence of capture session and attached evidence in Personal Evidence Base. |
| **Required for capture?** | **Yes** — mandatory for governed server persistence. |
| **What it allows** | Scan Record V2, child evidence objects, and linked metadata to persist under user ownership. |
| **What it does not allow** | Treating client-only cache (e.g., localStorage) as governed storage; persistence without snapshot linkage. |

### reasoning_consent

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User authorizes AI-assisted reasoning over submitted capture inputs for cosmetic guidance. |
| **Required for capture?** | **Yes** — mandatory before AI analysis runs. |
| **What it allows** | Intelligence Layer inference linked to evidence; AI Analysis Result storage with evidence references. |
| **What it does not allow** | AI processing without evidence link; reasoning on withdrawn or deletion-excluded evidence. |

### retention_tracking_consent

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User authorizes retention of session data for longitudinal personal tracking (history, timeline, progress). |
| **Required for capture?** | **Yes** for standard scan persistence intended for history/dashboard; future optional capture modes may differ (out of Phase 1 scope). |
| **What it allows** | Chronological Personal Evidence Base growth; history and timeline reads authorized for the user. |
| **What it does not allow** | Indefinite retention without governance; retention after withdrawal without deletion/retention workflow; commercial profiling. |

**Legacy mapping note:** Current `consent_medical` approximates `cosmetic_analysis_acknowledgement`; current `consent_privacy` partially overlaps `image_processing_consent`, `description_processing_consent`, and `evidence_storage_consent` but does not enumerate scopes and is not immutable.

---

## Consent Snapshot vs Current Consent State

| Concern | Consent Snapshot | Current Consent State |
|---------|------------------|----------------------|
| **Temporal role** | Historical record at capture time | Present user preference |
| **Mutability** | Immutable after creation | May change when user updates preferences or withdraws |
| **Scope** | Enumerated scopes active for one capture session | Governs future captures and withdrawal eligibility |
| **Linkage** | Linked to Scan Record V2 and session evidence | Linked to user account / privacy settings |
| **Effect of change** | None — prior snapshots unchanged | Affects future capture blocking and withdrawal workflows |

**Rules:**

- Changing **current consent state** does **not** mutate previous Consent Snapshots.
- **Withdrawal** triggers governance behavior (future capture restrictions, deletion/retention workflow) — not snapshot rewrite.
- Downstream systems must evaluate **snapshot at capture** for historical authorization and **current state** for future eligibility.

---

## Capture-Time Behavior

The following describes **conceptual capture-time behavior** under Transitional Hybrid. This is not implementation design, API contract, or transaction specification.

1. **User initiates scan** — authenticated capture session begins.
2. **Required consent scopes are checked** — UI and server validate all mandatory scopes for the capture type are satisfied.
3. **If required scopes missing, scan is blocked** — no Scan Record V2, no evidence persistence, no AI reasoning.
4. **If present, Consent Snapshot is created** — immutable record of active scopes and snapshot timestamp **before** Scan Record V2 and child evidence are persisted.
5. **All child evidence objects inherit linkage** — Image Evidence, User Description Evidence, Product Mention Evidence, etc. associate to the session via Scan Record V2, which references the Consent Snapshot.
6. **AI reasoning may proceed only if `reasoning_consent` is active** — inference runs after evidence-first ordering; AI Analysis Result links back to Scan Record V2 with evidence references.

This aligns with transitional write order step 2 (Consent Snapshot) before step 3 (Scan Record V2) in **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**.

---

## Withdrawal Behavior

When a user withdraws consent or narrows current consent state:

- **Withdrawal does not erase historical Consent Snapshot** — audit record of what was authorized at capture remains.
- **Withdrawal affects future capture and future processing** — new sessions require re-validation; processing not authorized by current state is blocked going forward.
- **Withdrawal may trigger deletion/retention workflow** — per-object removal, anonymization, or exclusion governed by a separate planning document (gate 10, not closed here).
- **Withdrawn evidence must not continue to feed personalization, learning, or marketing** — Intelligence and Learning layers exclude evidence no longer eligible regardless of snapshot content.
- **Retention markers/tombstones may preserve audit structure without sensitive content** — governance may retain non-sensitive lineage for compliance while excluding personal data from active use.

Withdrawal is distinct from **Correction Event** — withdrawal governs eligibility and retention; correction governs supersession of evidence content without deleting audit history.

---

## Prohibited Behaviors

The following are explicitly prohibited in Phase 1 design and future implementation:

- **No hardcoded consent booleans as full consent record** — `consent_medical: true` / `consent_privacy: true` alone are insufficient (current audit FAIL).
- **No treating UI checkbox state as governed consent** — transient form state is not Consent Snapshot.
- **No mutating historical snapshots after withdrawal** — immutability is non-negotiable.
- **No AI processing without required consent** — reasoning blocked when `reasoning_consent` or prerequisite scopes absent.
- **No hidden learning from evidence after consent withdrawal** — withdrawn or deletion-excluded evidence excluded from Learning Layer signals.
- **No marketing or commercial profiling from analysis consent** — consent scopes authorize personal cosmetic analysis only; no commercial segmentation (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** Phase 1 Rules).
- **No localStorage consent bypass** — device cache (`skinintel_last_scan`) is not governed evidence; cannot substitute for Consent Snapshot or server-side authorization.

---

## Impact On Current Implementation

**Current `analyses` consent fields:**

- `consent_medical` and `consent_privacy` are **partial legacy signals only**.
- They reflect gate-check intent but are **not** full Consent Snapshots — hardcoded on insert, no scope enumeration, no immutability semantics, no linkage model.

**Transitional mapping:**

- Legacy rows remain readable during transition; new captures must adopt Consent Snapshot semantics when implementation is authorized.
- Current implementation requires **future mapping** before schema or code changes — no direct extension of boolean columns as snapshot substitute.

**localStorage:**

- Saved scans in `skinintel_last_scan` operate outside Consent Snapshot governance.
- Phase 1 planning treats localStorage as non-authoritative; deletion/retention gate must address explicit handling.

---

## Gate Decision

**Upon review and approval of this document, gate 9 (Consent Snapshot behavior accepted) may be marked PASS** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Acceptance means product and architecture agree on:

- Consent Snapshot definition and immutability
- Phase 1 consent scope inventory and requirements
- Distinction from current consent state
- Capture-time and withdrawal behavior at planning level
- Prohibited behaviors binding on future implementation

Approval is **planning-level only**. It does not authorize Supabase, code, API, or UI work.

---

## Remaining Dependencies

This document does **not** close the following gates:

| Gate | Status after this document |
|------|----------------------------|
| Deletion/retention impact | **Open** — requires `docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md` or equivalent |
| Correction Event behavior | **Open** |
| Evidence Confidence Posture | **Open** |
| Schema direction | **Open** — separate approval; no SQL implied |
| Minimal implementation slice | **Open** — after gates 10–13 |

Withdrawal behavior references deletion/retention workflow intentionally deferred to gate 10.

---

## Current Decision

**Consent Snapshot behavior is defined for Phase 1 planning only.**

This document establishes governed consent semantics for Evidence Layer capture. It does **not** authorize:

- Supabase schema changes or migrations
- Code changes to `app/api/scan/route.ts`, dashboard, or history paths
- API contract changes
- UI redesign or new consent UI implementation

Implementation authorization requires completion of remaining gates (10–14), schema direction approval, and explicit minimal implementation slice sign-off per **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Until then, current legacy consent booleans in `analyses` remain unchanged; this document defines the target behavior for transitional hybrid implementation when gated.
