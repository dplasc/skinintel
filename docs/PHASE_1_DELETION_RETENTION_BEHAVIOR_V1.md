# Phase 1 — Deletion and Retention Behavior V1

## Purpose

This document defines **deletion and retention governance** for Phase 1 Evidence Layer Foundation and closes **gate 10 (Deletion/retention impact accepted)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** before any Evidence Layer implementation.

It translates lifecycle and compliance requirements from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, and audit findings in **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** into explicit object-level deletion rules, withdrawal interaction, and prohibited behaviors.

This is a planning artifact only. It does not define database fields, SQL, API contracts, or UI components.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**.

---

## Definition

**Deletion and retention governance** for Phase 1 defines how evidence lifecycle is controlled when users exercise rights or consent changes, while preserving audit integrity where required.

Phase 1 governs:

- **User deletion rights** — users may request removal or anonymization of personal evidence subject to defined scope and legal constraints.
- **Consent withdrawal impact** — narrowing or withdrawing consent affects future processing eligibility and may trigger deletion/retention workflow (**docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**).
- **Retention markers / tombstones** — non-sensitive structural records that evidence existed, was deleted, or is excluded — without retaining recoverable personal content.
- **Audit structure without sensitive content** — lineage and governance events may persist for compliance; personal data does not.
- **Exclusion from personalization and learning** — deleted or withdrawn evidence must not feed Intelligence, Learning, marketing, or commercial profiling.
- **Compatibility with append-oriented evidence history** — deletion and correction are distinct; prior records are not silently overwritten; supersession and exclusion are explicit.

Deletion governance answers: *"What happens to evidence when the user deletes, withdraws consent, or retention expires — and what may downstream systems still use?"*

---

## Why This Is Required

Phase 1 cannot design governed persistence without deletion-compatible object semantics.

**Current delivery gaps** (from **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**):

- **No per-object deletion behavior** — insert-only `analyses` history; no governed removal or exclusion path.
- **localStorage is ungoverned** — `skinintel_last_scan` retains mixed session data outside Personal Evidence Base rules.
- **`analyses` is a mixed legacy artifact** — session and AI output combined; deletion of one concern cannot be cleanly expressed.

**Architectural requirements:**

- **Evidence Layer objects must be deletion-compatible before schema design** — physical persistence must not be designed until object-level removal, anonymization, and exclusion rules are accepted (**docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**).
- **Deleted or withdrawn evidence must not silently feed AI, learning, personalization, marketing, or commercial profiling** — Phase 1 Rules prohibit deleted evidence reuse (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**).
- **Transitional Hybrid requires dual-path clarity** — governed evidence deletion must propagate to compatibility `analyses` rows and client cache semantics without hidden retention (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**).

Without deletion/retention behavior, schema direction (gate 13) risks encoding incomplete governance.

---

## Phase 1 Deletion Principles

The following principles bind all Phase 1 deletion and retention design:

1. **Deletion is governed behavior, not silent row removal only** — deletion requests produce auditable governance outcomes (remove, anonymize, exclude, or mark), not undocumented `DELETE` without trace.

2. **Deletion does not mean indefinite retention** — tombstones and audit markers are minimal; sensitive content is not retained indefinitely under deletion semantics.

3. **Immutable history does not override user deletion rights** — append-oriented history and Consent Snapshot immutability do not block governed deletion of personal content; they constrain how deletion is performed, not whether it may occur.

4. **Tombstones may preserve structure without sensitive content** — e.g., "scan session existed, excluded at {time}" without image, description, or AI payload.

5. **Downstream artifacts may become invalidated, stale, limited, confidence-downgraded, or excluded** — AI Analysis Results linked to deleted evidence are excluded or marked ineligible; not silently reused.

6. **No hidden AI copies of deleted evidence** — provider-side caches, undocumented summaries, or client caches must not substitute for deleted Personal Evidence Base content.

7. **No deleted evidence reused for personalization** — Intelligence and Learning layers treat deletion-excluded evidence as absent for reasoning and calibration.

---

## Object-Level Deletion Impact

Conceptual deletion behavior per object. No schema, table names, or field definitions.

| Object | Sensitive content | Deletion behavior | Retention marker allowed? | Downstream impact |
|--------|-------------------|-------------------|---------------------------|-------------------|
| **Scan Record V2** | Session identity, user linkage, capture time | Remove or anonymize session anchor; mark session excluded | **Yes** — non-sensitive session tombstone (id, deletion time, exclusion flag) | Child evidence excluded; timeline gaps explicit; no silent session rewrite |
| **Image Evidence** | Image artifact, capture metadata | Remove image binary and metadata; revoke access URLs | **Yes** — marker that image evidence existed and was deleted | AI results referencing image marked ineligible or confidence-downgraded; no re-inference from deleted image |
| **User Description Evidence** | User-origin text | Remove text content; anonymize if audit requires event only | **Yes** — deletion marker without text | Intelligence outputs lose description evidence link; explanations must acknowledge missing input |
| **Symptom Observation Evidence** | Structured cosmetic signals | Remove observation records | **Yes** — marker without symptom detail | Recommendations citing observation excluded or invalidated |
| **Body Area Evidence Link** | Location association to evidence | Remove link when parent evidence deleted or link independently deleted | **Yes** — generic link tombstone | Spatial context unavailable for downstream reads |
| **Product Mention Evidence** | User-stated product text | Remove mention content | **Yes** — marker without product text | No Product Intelligence resolution from deleted mention |
| **Routine Mention Evidence** | User-stated routine context | Remove mention content | **Yes** — marker without routine text | Routine context unavailable for timeline correlation |
| **Consent Snapshot** | Scope enumeration at capture | **Not deleted with content** — immutable governance record; may receive exclusion marker if legally required | **Yes** — snapshot metadata without retroactive mutation | Proves what was authorized at capture; does not re-authorize deleted content |
| **Correction Event** | Correction attestation, supersession record | Retain governance record; redact sensitive correction detail if required | **Yes** — correction governance marker | Supersession chain preserved; authoritative read rules respect deletion exclusion |
| **Evidence Confidence Posture** | Input quality qualification | Remove or anonymize posture tied to deleted evidence | **Yes** — marker that posture existed | Downstream confidence presentation adjusted; no false precision from deleted inputs |
| **AI Analysis Result** | AI JSON, recommendations, model metadata | Remove or invalidate result content linked to deleted evidence | **Yes** — marker that result existed and is excluded | History UI must not display deleted payload; compatibility row must not embed surviving copy |
| **`analyses` compatibility row** | Mixed session + embedded `result` JSON | Delete, anonymize, or invalidate row; strip embedded JSON on evidence deletion | **Yes** — compatibility tombstone or empty read model | Legacy history reads reflect exclusion; no hidden source of truth |
| **localStorage last scan** | Device cache: description, ingredients, scanResult, scoredProducts | Clear on user deletion request when app controls cache; never server-authoritative | **No server marker** — client clear only | Must not repopulate server views; not Personal Evidence Base |

---

## Consent Withdrawal vs Deletion Request

| Concern | Consent withdrawal | Deletion request |
|---------|-------------------|------------------|
| **Primary effect** | Future processing and eligibility | Removal or anonymization of existing personal content |
| **Historical Consent Snapshot** | Not mutated | Not mutated |
| **Future captures** | Blocked or restricted per current consent state | Unaffected except where deletion removes account data |
| **Existing evidence** | May become ineligible for processing; may trigger deletion workflow | Governed remove/anonymize/exclude workflow executes |
| **Personalization / learning** | Excluded going forward | Excluded; content removed or marked |
| **Workflow relationship** | Withdrawal **may lead to** deletion/retention workflow when scopes no longer authorize retention | Direct user-initiated governance action |

**Rules:**

- Both paths must **prevent future unauthorized reuse** of affected evidence.
- Withdrawal alone does not automatically erase historical snapshots or all content — it triggers eligibility change and may invoke deletion workflow per scope and policy.
- Deletion request is distinct from **Correction Event** — deletion removes or excludes; correction supersedes content while preserving audit history.

---

## localStorage Handling

Per **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** and **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**:

- **localStorage is non-authoritative** — `skinintel_last_scan` is device cache, not Personal Evidence Base.
- **localStorage must not bypass deletion/retention governance** — server-side deletion must not leave client cache as de facto surviving copy of deleted session.
- **Future implementation must provide clear behavior for clearing local saved scans** — on account deletion, session deletion, or consent withdrawal where applicable, client cache should be cleared or invalidated with user-visible outcome.
- **localStorage cannot be Personal Evidence Base** — governed deletion semantics apply to server evidence; client cache is best-effort clear, not governed retention store.

Phase 1 planning requires explicit pairing: server evidence exclusion + client cache invalidation where the application controls both.

---

## analyses Compatibility Row Handling

Under Transitional Hybrid (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**):

- **`analyses` is legacy/transitional read model** — not canonical Evidence Layer store.
- When linked governed evidence is deleted, compatibility row **may be deleted, anonymized, invalidated, or marked** as excluded — implementation choice deferred to schema gate; behavior is defined here.
- **Must not preserve deleted evidence inside embedded `result` JSON** — if Scan Record V2 or evidence objects are excluded, denormalized JSON must not retain recoverable AI payload or capture content.
- **Must not remain a hidden source of truth** — after governed evidence deletion, reads from `analyses` must reflect exclusion; dual-write authority rules must prevent drift where compatibility row survives deleted evidence.

Legacy rows without governed evidence links follow transitional mapping until migration or cutover; new captures must propagate deletion to compatibility surface when dual-write exists.

---

## Prohibited Behaviors

The following are explicitly prohibited in Phase 1 design and future implementation:

- **No silent deletion without governance record** — deletion produces traceable outcome (event, marker, or audit entry).
- **No orphan references after deletion** — linked objects must reflect exclusion; reads must not assume completeness.
- **No hidden AI summaries retaining deleted evidence** — provider output, caches, or embedded JSON must not preserve deleted personal content.
- **No continued learning from deleted or withdrawn evidence** — Learning Layer excludes deletion-excluded and withdrawal-ineligible evidence.
- **No commercial profiling from retained markers** — tombstones carry no marketing or purchase-propensity signals.
- **No localStorage retention after user deletion if app can clear it** — client cache must not defeat server deletion intent.
- **No treating deletion as correction** — deletion removes or excludes; correction supersedes without equating to erasure.
- **No treating correction as deletion** — Correction Event preserves audit history; deletion is separate governance path (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).

---

## Gate Decision

**Upon review and approval of this document, gate 10 (Deletion/retention impact accepted) may be marked PASS** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Acceptance means product and architecture agree on:

- Phase 1 deletion principles
- Object-level deletion impact table
- Consent withdrawal vs deletion request distinction
- localStorage and `analyses` compatibility handling at planning level
- Prohibited behaviors binding on future implementation

Approval is **planning-level only**. It does not authorize Supabase, code, API, or UI work.

---

## Remaining Dependencies

This document does **not** close the following gates:

| Gate | Status after this document |
|------|----------------------------|
| Correction Event behavior | **Open** — supersession vs deletion distinction referenced; dedicated doc required |
| Evidence Confidence Posture | **Open** |
| Schema direction | **Open** — separate approval; no SQL implied |
| Minimal implementation slice | **Open** — after gates 11–13 |

Deletion behavior interacts with Correction Event and Evidence Confidence Posture; those gates must close before schema and implementation authorization.

---

## Current Decision

**Deletion/retention behavior is defined for Phase 1 planning only.**

This document establishes governed lifecycle semantics for Evidence Layer objects and transitional surfaces. It does **not** authorize:

- Supabase schema changes or migrations
- Code changes to persistence, scan, dashboard, or history paths
- API contract changes
- UI redesign or deletion UX implementation

Implementation authorization requires completion of remaining gates (11–14), schema direction approval, and explicit minimal implementation slice sign-off per **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Until then, current legacy `analyses` and ungoverned localStorage behavior remain unchanged; this document defines target deletion/retention behavior for transitional hybrid implementation when gated.
