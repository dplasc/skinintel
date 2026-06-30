# Phase 1 — Correction Event Behavior V1

## Purpose

This document defines **Correction Event behavior** for Phase 1 Evidence Layer Foundation and closes **gate 11 (Correction Event behavior accepted)** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md** before any Evidence Layer implementation.

It translates supersession and correctability requirements from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, and audit findings in **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** into explicit correction types, object scope, authoritative read rules, and prohibited behaviors.

This is a planning artifact only. It does not define database fields, SQL, API contracts, or UI components.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**, **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**.

---

## Definition

**Correction Event** is a Phase 1 Evidence Layer governance object with the following properties:

- **User-initiated governance event** — created by explicit user action to address prior evidence; not system-initiated silent update.
- **Qualifies, supersedes, or disputes previous evidence** — expresses how the user revises their personal record without erasing history.
- **Append-oriented** — new correction events extend the Personal Evidence Base; prior evidence and prior corrections remain for audit.
- **Linked to the evidence it corrects** — each event references one or more target evidence objects with explicit supersession semantics.
- **Not silent overwrite** — historical records are not modified in place to reflect new understanding.
- **Not deletion** — correction governs authoritative interpretation; deletion governs removal or exclusion of personal content (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**).
- **Not global truth** — corrections are authoritative for the correcting user's personal record only; they do not redefine platform-wide knowledge or clinical fact.

Correction Event answers: *"How does the user revise what the platform should treat as currently authoritative for their personal evidence — while preserving audit history?"*

---

## Why This Is Required

Phase 1 cannot deliver a trustworthy Personal Evidence Base without governed correction.

**Current delivery gaps** (from **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**):

- **Insert-only history** — `analyses` rows are written once; no supersession path exists.
- **Users cannot correct scan evidence** — no mechanism to qualify, dispute, or supersede persisted capture or AI-linked interpretation.

**Architectural requirements:**

- **Phase 1 requires evidence to be correctable** — Phase 1 Rules mandate user correction path without silent overwrite (**docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**).
- **Downstream reads need current authoritative evidence** — Intelligence and Experience layers must resolve which evidence is currently authoritative via correction chain, not latest row timestamp alone.
- **Corrections must not mutate historical evidence silently** — append-oriented supersession only; prohibited merge with deletion (**docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).
- **Corrections must not force medical labels or treatment claims** — cosmetic scope only; no diagnosis, disease naming, or treatment planning through correction UX or content.

Without Correction Event behavior, Evidence Confidence Posture and schema direction cannot express correctable, auditable evidence lifecycle.

---

## Correction Types

Phase 1 defines the following **conceptual correction types**. These are language-neutral governance categories; not database fields.

### qualify

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User adds context or limits interpretation of existing evidence without replacing it. |
| **When used** | e.g., "description was approximate"; "symptom was mild and temporary"; "product mention was wrong brand spelling but same product." |
| **Downstream effect** | Evidence remains primary; confidence posture may be adjusted; Intelligence outputs may present qualified interpretation. |
| **What it does not do** | Replace original content; delete evidence; assert platform-wide truth. |

### supersede

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User replaces prior evidence as currently authoritative with new user-attested content or selection. |
| **When used** | e.g., corrected description; updated symptom observation; revised product mention. |
| **Downstream effect** | Prior evidence remains in history; new evidence or correction-linked replacement becomes authoritative for reads and future reasoning. |
| **What it does not do** | Silent in-place edit; erase audit trail; trigger deletion workflow. |

### dispute

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User rejects accuracy or relevance of evidence (often AI-structured or AI-assisted) without necessarily supplying replacement. |
| **When used** | e.g., "AI misread my description"; "symptom observation does not match my experience." |
| **Downstream effect** | Evidence marked disputed; confidence downgraded; Intelligence outputs excluded or flagged; unresolved conflict visible. |
| **What it does not do** | Delete evidence automatically; assign disease labels; override with AI re-inference alone. |

### retract

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User withdraws attestation that they provided or confirmed specific evidence content. |
| **When used** | e.g., user retracts a self-reported statement they no longer stand behind. |
| **Downstream effect** | Retracted content not treated as authoritative; may pair with qualify or trigger deletion workflow if user requests removal. |
| **What it does not do** | Equate to deletion by default; mutate original record in place. |

### clarify

| Attribute | Definition |
|-----------|------------|
| **Meaning** | User supplies additional user-origin detail that clarifies prior evidence without full supersession. |
| **When used** | e.g., adds timing, body area context, or routine context to prior capture. |
| **Downstream effect** | Clarification linked to target evidence; improves confidence or completeness posture; may attach as supplementary User Description Evidence. |
| **What it does not do** | Replace user voice with AI paraphrase; resolve dispute without user attestation. |

---

## Object-Level Correction Scope

Conceptual correction scope per object. No schema, table names, or field definitions.

| Object | Can be corrected? | Correction examples | Downstream effect | Boundary notes |
|--------|-------------------|----------------------|-------------------|----------------|
| **Scan Record V2** | **Limited** — session metadata generally not rewritten | Qualify session context (e.g., "capture conditions were poor") | Session-level confidence posture may adjust | Session anchor persists; no merge with AI output |
| **Image Evidence** | **Yes** — qualify, dispute, retract | Dispute image quality; retract attestation that image represents current state | Image may be marked disputed; AI results referencing image downgraded or excluded | Does not delete binary via correction alone — deletion is separate path |
| **User Description Evidence** | **Yes** — qualify, supersede, clarify, retract | Supersede with corrected user text; clarify with additional narrative | Authoritative description resolves via correction chain | Must preserve user-origin attestation; no AI paraphrase as correction |
| **Symptom Observation Evidence** | **Yes** — qualify, supersede, dispute | Dispute AI-structured symptom; supersede with user-selected observation | Observation authority follows correction; disputed observations excluded from strong recommendations | No disease labels or clinical taxonomy via correction |
| **Body Area Evidence Link** | **Yes** — supersede, qualify | Correct body area association | Spatial context for downstream reads updated via chain | Links only; not medical anatomy ontology |
| **Product Mention Evidence** | **Yes** — qualify, supersede, retract | Correct product name; retract incorrect mention | Mention authority updated; no Product Intelligence resolution in Phase 1 | Mentions stay unverified |
| **Routine Mention Evidence** | **Yes** — qualify, supersede, clarify | Clarify routine timing; supersede routine description | Routine context authority updated | Does not create Routine Model |
| **Consent Snapshot** | **No** | — | Immutable capture-time record | Corrections do not retroactively change consent scopes |
| **Correction Event** | **No** — append-only | — | Prior corrections remain in chain | New event may supersede authoritative read, not prior correction records |
| **Evidence Confidence Posture** | **Yes** — via correction or governed update | Qualify input quality after user feedback | Posture reflects corrected completeness or reliability | Distinct from AI recommendation confidence |
| **AI Analysis Result** | **Indirect** — dispute, not in-place edit | Dispute AI assessment or recommendation | Result marked disputed, stale, or superseded; may trigger future re-inference with evidence link | Intelligence artifact; user corrects evidence, not by editing JSON in place |
| **`analyses` compatibility row** | **No direct correction** | — | Must reflect authoritative state from governed evidence + correction chain when dual-write exists | Legacy row not edited in place; denormalized sync deferred to implementation |
| **localStorage last scan** | **No** — not governed correction | User may overwrite local cache manually | Not Personal Evidence Base; not authoritative supersession | Server Correction Event required for governed correction |

---

## Correction vs Deletion

| Concern | Correction Event | Deletion request |
|---------|------------------|------------------|
| **Audit history** | Preserved; prior evidence remains | Personal content removed, anonymized, or excluded |
| **Primary outcome** | Authoritative interpretation changes | Content no longer available for use |
| **Confidence** | May reduce or qualify; dispute lowers certainty | Linked outputs invalidated or excluded |
| **AI outputs** | May be marked stale/disputed; future re-inference possible with consent | Invalidated or excluded when evidence deleted |
| **Relationship** | Same evidence may later be **deleted**; paths remain separate | Deletion does not substitute for user correction of accuracy |

**Rules:**

- Correction **preserves audit history**; deletion **removes or excludes** personal content per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**.
- Correction may **reduce confidence** or **supersede current interpretation** without erasing records.
- Deletion may **invalidate linked outputs** regardless of correction history.
- Prohibited: treating correction as deletion or deletion as correction.

---

## Correction vs AI Reprocessing

- **Correction can trigger future AI Analysis Result supersession** — new inference may be produced when user disputes or supersedes evidence, subject to valid consent and evidence links.
- **Correction itself is user evidence, not AI truth** — Correction Event records user attestation; it is not an Intelligence Layer output.
- **AI may consume correction only with evidence link and valid consent** — reasoning references correction and target evidence explicitly.
- **AI must not silently rewrite prior evidence** — re-inference produces new linked Intelligence artifact; does not mutate Image Evidence, User Description Evidence, or other evidence objects in place.
- **Downstream artifacts must show corrected/superseded basis when applicable** — Experience Layer presents that conclusions depend on corrected or disputed evidence where relevant.

AI reprocessing is optional future behavior gated by consent and implementation slice; Correction Event semantics exist independently.

---

## Current Authoritative State

**Current state is derived from evidence + correction chain**, not from latest insert or latest AI output alone.

Rules:

- **Original evidence remains historical unless deleted** — correction does not erase capture records.
- **Latest correction does not erase earlier records** — full chain available for audit; authoritative read applies supersession rules.
- **Unresolved conflict can lower confidence or mark evidence as disputed** — e.g., user disputes AI-structured symptom without superseding; Evidence Confidence Posture and presentation reflect dispute.
- **Reads must distinguish historical evidence from currently authoritative interpretation** — timeline and detail views resolve authority via correction chain; historical view may show prior state with correction markers.

Authoritative resolution order (conceptual):

1. Apply deletion/exclusion rules first — deleted evidence not authoritative.
2. Apply correction chain — supersede > dispute flags > qualify/clarify.
3. Apply Evidence Confidence Posture for remaining eligible evidence.
4. Consume eligible evidence in Intelligence Layer with explicit links.

---

## Prohibited Behaviors

The following are explicitly prohibited in Phase 1 design and future implementation:

- **No edit-in-place of historical evidence** — prohibited merge; supersession via Correction Event only.
- **No correction as deletion** — correction does not remove personal content unless user initiates separate deletion workflow.
- **No deletion as correction** — deletion excludes; does not express "user meant something else."
- **No user correction as platform-wide truth** — personal record only; no global knowledge update.
- **No user correction forcing disease labels or diagnosis** — cosmetic scope only.
- **No hidden AI rewrite after correction** — no silent update of evidence objects or embedded `analyses.result` JSON.
- **No localStorage-only correction path** — governed correction requires server-side Correction Event.
- **No commercial use of correction signals** — correction data not used for marketing, segmentation, or purchase propensity.

---

## Impact On Current Implementation

**Current history has no Correction Event path** — audit confirms insert-only `analyses` persistence.

**`analyses` rows cannot represent supersession** — mixed artifact stores final AI JSON only; no correction linkage, dispute flags, or authoritative resolution.

**localStorage saved scans** — user may overwrite device cache locally; this is **not** governed correction and does not propagate to Personal Evidence Base or server history.

**Future implementation** needs Correction Event before reliable user correction UX — Experience Layer correction flows depend on accepted behavior, Evidence Confidence Posture, and schema direction in subsequent gates.

Legacy rows remain read-only during transition; new governed captures adopt correction semantics when implementation is authorized.

---

## Gate Decision

**Upon review and approval of this document, gate 11 (Correction Event behavior accepted) may be marked PASS** in **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Acceptance means product and architecture agree on:

- Correction Event definition and append-oriented supersession
- Phase 1 correction types and object-level scope
- Distinction from deletion and AI reprocessing
- Current authoritative state resolution rules
- Prohibited behaviors binding on future implementation

Approval is **planning-level only**. It does not authorize Supabase, code, API, or UI work.

---

## Remaining Dependencies

This document does **not** close the following gates:

| Gate | Status after this document |
|------|----------------------------|
| Evidence Confidence Posture | **Open** — posture updates via correction referenced; dedicated doc required |
| Schema direction | **Open** — separate approval; no SQL implied |
| Minimal implementation slice | **Open** — after gates 12–13 |

Correction behavior interacts with Evidence Confidence Posture (dispute/downgrade rules) and schema design (correction chain storage); those gates must close before implementation authorization.

---

## Current Decision

**Correction Event behavior is defined for Phase 1 planning only.**

This document establishes governed correctability semantics for Evidence Layer objects. It does **not** authorize:

- Supabase schema changes or migrations
- Code changes to persistence, scan, dashboard, or history paths
- API contract changes
- UI redesign or correction UX implementation

Implementation authorization requires completion of remaining gates (12–14), schema direction approval, and explicit minimal implementation slice sign-off per **docs/PHASE_1_GATE_REVIEW_CHECKLIST_V1.md**.

Until then, current insert-only legacy behavior remains unchanged; this document defines target Correction Event behavior for transitional hybrid implementation when gated.
