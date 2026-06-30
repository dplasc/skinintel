# Phase 1 — Gate Review Checklist V1

## Purpose

This document converts Phase 1 planning artifacts and audit findings into explicit **gate status** before any Evidence Layer implementation work begins.

It consolidates gate requirements from **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, and **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md** into a single review checklist for product and architecture sign-off.

This is a planning and governance artifact only. It does not define schema, APIs, migrations, or application code.

---

## Gate Status Legend

| Status | Meaning |
|--------|---------|
| **PASS** | Gate requirement is documented, reviewed, and accepted for Phase 1 planning purposes |
| **BLOCKED** | Gate cannot proceed due to an unresolved dependency or explicit rejection |
| **NEEDS DECISION** | Planning artifact is incomplete or not yet accepted; decision required before implementation |
| **NOT STARTED** | No planning work has begun for this gate |

---

## Gate Review Table

| # | Gate | Status | Evidence | Decision needed | Implementation impact |
|---|------|--------|----------|-----------------|----------------------|
| 1 | Implementation Plan accepted | **PASS** | `docs/IMPLEMENTATION_PLAN_V1.md` | None | Defines Phase 1 scope, principles, and gate framework |
| 2 | Phase 1 Evidence Layer plan accepted | **PASS** | `docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md` | None | Defines evidence objects, rules, and Phase 1 gates |
| 3 | Evidence object inventory accepted | **PASS** | `docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md` | None | Ten-object inventory closed for Phase 1 |
| 4 | Evidence object boundaries accepted | **PASS** | `docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md` | None | Prohibited merges and responsibility boundaries binding |
| 5 | Current persistence mapping accepted | **PASS** | `docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md` | None | Current `analyses` mapped to Phase 1 objects and gaps |
| 6 | Persistence direction ADR accepted | **PASS** | `docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md` | None | Transitional Hybrid (Option C) selected; Option A rejected, Option B deferred |
| 7 | Scan Record V2 transitional mapping accepted | **PASS** | `docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md` | None | Write/read order, conceptual mapping, audit slice defined |
| 8 | Read-only scan persistence audit completed | **PASS** | `docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md` | None | Current write/read reality documented; boundary failures confirmed |
| 9 | Consent Snapshot behavior accepted | **NEEDS DECISION** | Partial in foundation and boundaries docs | Immutable snapshot semantics, scope enumeration, capture-time linkage | Blocks governed capture write path |
| 10 | Deletion/retention impact accepted | **NEEDS DECISION** | Referenced in foundation gates; no dedicated doc | Per-object deletion, retention, localStorage, personalization exclusion | Blocks lifecycle and compliance design |
| 11 | Correction Event behavior accepted | **NEEDS DECISION** | Referenced in foundation gates; audit confirms absent | Supersession semantics, correction scope, downstream read rules | Blocks append-oriented evidence corrections |
| 12 | Evidence Confidence Posture accepted | **NEEDS DECISION** | Referenced in foundation and boundaries; audit confirms absent | Input quality dimensions, assignment rules, separation from AI confidence | Blocks evidence qualification at capture |
| 13 | Schema direction approved separately | **NEEDS DECISION** | ADR selects direction only; no physical schema doc | Physical persistence design under Transitional Hybrid | Blocks Supabase table design and migrations |
| 14 | Minimal implementation slice selected | **NEEDS DECISION** | Transitional mapping recommends read-only audit; audit complete | Smallest first coding slice after all gates pass | Blocks any implementation authorization |

---

## Gates Already Passed

Gates **1–8** are considered **PASS** for Phase 1 planning progression:

1. **Implementation Plan** — Phase 1 scope, pipeline discipline, and implementation gates are defined.
2. **Evidence Layer Foundation** — Phase 1 evidence objects, rules, and gate requirements are documented.
3. **Evidence object inventory** — Ten Phase 1 evidence objects are enumerated and closed.
4. **Evidence object boundaries** — Primary responsibilities, prohibited merges, and boundary clarifications are accepted at planning level.
5. **Current persistence mapping** — Legacy `analyses` behavior is mapped to Phase 1 objects; gaps and boundary violations are identified.
6. **Persistence direction ADR** — Transitional Hybrid is the accepted Phase 1 persistence direction.
7. **Transitional mapping** — Scan Record V2 relationship to `analyses`, conceptual concern mapping, and intended write/read order are defined.
8. **Scan persistence audit** — Read-only audit confirms current implementation is a pre-transition legacy path with 3 FAIL and 7 NOT PRESENT boundary findings.

These gates establish architectural direction and current-state truth. They do **not** authorize implementation.

---

## Gates Still Requiring Decision

Gates **9–14** remain **NEEDS DECISION**. Each must be resolved through a dedicated planning document or explicit gate sign-off before coding.

### Consent Snapshot behavior

**Decision required:** Define immutable Consent Snapshot semantics at capture time.

- Which consent scopes are recorded (e.g., medical disclaimer acknowledgment, image/description processing, retention use)?
- How snapshot is linked to Scan Record V2 and child evidence objects?
- Distinction between **Consent Snapshot** (historical, immutable) and **current consent state** (mutable user preferences)?
- Whether capture is blocked when required scopes are absent?
- How consent withdrawal after capture affects future behavior without retroactive snapshot mutation?

Audit finding: consent is gate-checked but persisted as hardcoded booleans, not governed snapshots.

### Deletion/retention impact

**Decision required:** Define per-object deletion and retention behavior across Evidence Layer objects.

- What is removed, anonymized, or retained per object type on deletion request or consent withdrawal?
- Tombstone or marker semantics for audit vs. personalization exclusion?
- How legacy `analyses` rows and future compatibility rows participate in deletion?
- **localStorage** (`skinintel_last_scan`): explicit non-authoritative handling and user-facing deletion alignment?
- Downstream rule: deleted evidence excluded from personalization and intelligence?

Audit finding: no deletion/retention governance; localStorage is ungoverned.

### Correction Event behavior

**Decision required:** Define supersession without silent overwrite.

- What can users correct (symptom observations, description, product mentions, confidence qualification)?
- Supersession semantics: qualify vs. supersede vs. reject?
- How prior evidence remains in Personal Evidence Base for auditability?
- How downstream reads determine currently authoritative evidence?
- Prohibition of in-place edit of historical records?

Audit finding: insert-only history; no Correction Event path exists.

### Evidence Confidence Posture

**Decision required:** Define input quality qualification separate from AI output confidence.

- Dimensions: image quality, user attestation, input completeness, source reliability, AI-structured vs user-direct?
- Assignment rules at capture time?
- Update paths through Correction Event only?
- Explicit separation from AI Analysis Result `confidence` and recommendation certainty?

Audit finding: row-level `confidence` reflects AI output only; Evidence Confidence Posture is NOT PRESENT.

### Schema direction

**Decision required:** Approve physical persistence design under Transitional Hybrid ADR.

- Which governed stores are introduced first (conceptual, not SQL)?
- How Scan Record V2 and evidence objects relate physically to legacy `analyses`?
- Dual-write authority rules during transition?
- Compatibility row shape and non-authoritative semantics?

**No SQL, table names, or migrations in this gate.** Schema direction is a separate approval from behavioral gates 9–12.

### Minimal implementation slice

**Decision required:** Select the smallest first coding slice after gates 9–13 pass.

- Must remain within Phase 1 scope and Transitional Hybrid direction.
- Must not extend `analyses` as long-term Evidence Layer store.
- Must respect all accepted boundaries and governance decisions.
- Likely candidates (decision required): first evidence object persistence path, compatibility dual-write slice, or read-path cutover slice — selection depends on outcomes of gates 9–13.

Read-only audit is complete; it is not itself an implementation slice.

---

## Recommended Order To Close Remaining Gates

Close remaining gates in this order:

1. **Consent Snapshot behavior**
2. **Deletion/retention impact**
3. **Correction Event behavior**
4. **Evidence Confidence Posture**
5. **Schema direction**
6. **Minimal implementation slice**

**Rationale:** Consent, deletion, correction, and confidence are **behavioral governance decisions** that define how evidence objects live, change, and qualify over time. Physical schema design (gate 5) must reflect these semantics — not precede them. Designing tables before consent snapshot immutability, deletion exclusion rules, supersession semantics, and confidence dimensions risks encoding prohibited merges or incomplete governance into storage. Minimal implementation slice (gate 6) must be chosen only after both behavioral rules and schema direction are approved, so the first code change targets a governed, bounded, auditable unit of work.

---

## Implementation Block Statement

**No code, SQL, Supabase table creation, API refactor, or UI changes are authorized until all NEEDS DECISION gates (9–14) are resolved and explicitly signed off.**

Specifically blocked until gate review completes:

- Supabase schema changes or migrations
- Persistence logic changes in `app/api/scan/route.ts` or related paths
- New Evidence Layer write or read paths
- Extension of `analyses` as canonical Evidence Layer store
- UI redesign justified by Phase 1 persistence work
- Bypass of constraints in **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**

---

## Recommended Next Step

**Create the next planning document:**

`docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md`

This document should define Consent Snapshot semantics, scope enumeration, capture-time linkage to Scan Record V2, immutability rules, and distinction from current consent state — addressing gate 9 before deletion, correction, and confidence planning proceed.

This step is **planning only**. It does not recommend code, SQL, or Supabase changes.

---

## Current Decision

**Phase 1 remains blocked for implementation until gate review is completed.**

Acceptance of this checklist means product and architecture agree that:

- Gates 1–8 are **PASS** for planning progression
- Gates 9–14 are **NEEDS DECISION** and must be closed in recommended order
- Implementation authorization requires explicit sign-off on each remaining gate
- The next planning artifact is Consent Snapshot behavior (gate 9)

Until all gates pass:

- Phase 1 Evidence Layer implementation does not begin
- Current legacy `analyses` path remains unchanged by this checklist
- All architectural constraints from accepted planning documents remain binding

Implementation authorization requires completion of gate review and separate approval of minimal implementation slice (gate 14).
