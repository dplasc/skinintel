# Phase 1 Slice 5 Migration Plan

## Status

**Planning draft.**

This document defines the **migration sequence** for introducing **Phase 1 Slice 5: AI Analysis Evidence** into the existing Transitional Hybrid persistence architecture.

It describes how governed AI inference output evidence will be introduced incrementally—preserving production stability, Slices 1–4 operational posture, and the `analyses` compatibility read model—while closing the documented Evidence Layer gap for application-accepted AI analysis output.

This is a **migration planning artifact only**. It does not authorize implementation, Supabase changes, application code, SQL execution, database schema definition, API contract changes, UI changes, or operational rollout.

Sources: **docs/PHASE_1_SLICE_5_PLAN.md**, **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md**, **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Planning draft |
| **Execution approval** | Not approved for execution |
| **Implementation authorization** | Not granted by this document |

---

## Migration Strategy

Slice 5 introduces a **new additive Evidence Layer object** — AI Analysis Evidence — linked to Scan Record V2 as a governed record of the normalized AI analysis output accepted by the application after response validation and normalization.

### Core posture

| Principle | Requirement |
|-----------|-------------|
| **Additive only** | AI Analysis Evidence is introduced as a new Evidence Content Store child. No existing tables are replaced, dropped, or repurposed |
| **No read-path changes** | Dashboard, history, and all user-facing surfaces continue reading from `analyses`. The evidence store is write-only foundation in Slice 5 |
| **No UI changes** | Capture flow, presentation, and client surfaces unchanged |
| **No API changes** | Scan response contract and client-visible behavior unchanged |
| **`analyses` preserved** | The compatibility read model remains authoritative for dashboard and history. Slice 5 does not cut over read paths or extend `analyses` as the canonical AI evidence store |

### What the migration achieves

The migration closes the documented gap where AI output persists only inside the transitional `analyses` mixed artifact. After Slice 5, new captures will dual-write: governed AI Analysis Evidence in the Personal Evidence Base, plus the unchanged `analyses` compatibility row for existing consumers.

AI Analysis Evidence stores the **application-accepted normalized payload** — not the raw provider response. This aligns evidence authority with the same output downstream components consume.

### What the migration does not achieve

- Replacement of `analyses` as the read model
- Intelligence Layer separation (Product Intelligence, Ingredient Intelligence, structured recommendation records)
- Knowledge Layer persistence
- Legacy backfill of historical AI output into the evidence store
- Read-path cutover or Experience Layer exposure of the evidence store

---

## Migration Phases

Slice 5 migration proceeds through five conceptual phases. Each phase has explicit intent and exit criteria before the next phase begins. This sequence describes **migration intent and ordering only** — not SQL, not implementation specifications, not transaction design, and not environment runbooks.

### Phase A — Preparation

Establish that all upstream planning gates, dependencies, and operational preconditions are satisfied before any Slice 5 infrastructure or application work is authorized.

**Activities:**

- Verify Slice 1–4 complete and operational in target environment: Scan Record V2, Consent Snapshot, User Description Evidence, Image Evidence, Product Mention Evidence, and `analyses.scan_record_id` compatibility linkage
- Verify Transitional Hybrid architecture remains binding: evidence stores authoritative for their concerns; `analyses` remains compatibility read model; no read-path cutover planned
- Verify Evidence Layer boundaries: AI Analysis Evidence is inference-output evidence, not diagnosis, Knowledge Layer, or Intelligence Layer; normalized application output only, not raw provider log
- Confirm **docs/PHASE_1_SLICE_5_PLAN.md** and **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md** accepted
- Confirm **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md** accepted and Slice 4 production verification complete
- Confirm downstream gated artifacts (SQL draft, dual-write implementation plan, code design, audit) are scheduled — not conflated with this planning step
- Confirm staging-first execution posture and separate explicit approval per environment

**Exit criteria:** All dependencies satisfied; no Slice 5 execution authorized until preparation sign-off is recorded.

### Phase B — Evidence Object Introduction

Introduce AI Analysis Evidence as a new governed evidence object within the Evidence Content Stores group, linked to Scan Record V2.

**Intent:**

- Add relational evidence store capacity for AI Analysis Evidence per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**
- Apply session linkage, ownership posture, and access control consistent with Slice 1–4 child evidence precedent
- Support conceptual fields defined in **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md**: normalized result payload, model provenance, response schema version, evidence status, and design-compatible supersession hooks
- Leave existing Slice 1–4 stores and `analyses` unchanged
- Deploy infrastructure with zero initial AI Analysis Evidence rows — schema-only posture matching established Slice 2–4 rollout pattern
- Apply staging before production; separate approval for each environment

**Exit criteria:** Evidence store infrastructure exists and passes read-only infrastructure verification; Slice 1–4 regression checks pass; no application dual-write active.

### Phase C — Dual-Write Activation

Authorize and deploy application changes that extend the established evidence-first write path to persist AI Analysis Evidence on new captures after successful inference.

**Conceptual write order:**

1. Scan Record V2
2. Consent Snapshot
3. User Description Evidence *(when applicable)*
4. Image Evidence *(when applicable)*
5. Product Mention Evidence *(when applicable)*
6. AI inference
7. AI Analysis Evidence
8. `analyses` compatibility row

**Intent:**

- Extend dual-write sequence by adding AI Analysis Evidence persistence after inference acceptance and before compatibility row write — consistent with **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md**
- Persist only the application-accepted normalized analysis payload; exclude raw provider response
- Gate persistence on valid Scan Record V2, Consent Snapshot, and session consent scopes (`reasoning_consent`, `evidence_storage_consent`) already established at capture
- Apply fail-closed posture: AI Analysis Evidence persistence failure aborts before compatibility row write; no silent drop
- Preserve Slices 1–4 write semantics without reordering prior steps
- Apply staging before production; monitor failure rates and boundary audit signals post-activation

**Exit criteria:** New captures produce AI Analysis Evidence rows in target environment; compatibility row still written unchanged; Slice 1–4 paths regression-free.

### Phase D — Verification

Confirm Slice 5 migration outcomes through direct evidence-store verification and compatibility regression checks.

**Verify:**

- AI Analysis Evidence row exists for successful new captures
- Row is linked to correct `scan_record_id`
- `normalized_result` matches the application-accepted analysis output — same payload written to compatibility row and returned to client
- `analyses` row still written with unchanged shape, fields, and linkage
- Dashboard and history behavior unchanged; no new client queries against evidence store
- Slice 1–4 evidence rows unaffected
- Consent audit confirms `reasoning_consent` and storage scopes present when evidence persisted
- Boundary audit confirms no raw provider payload, Knowledge Layer fields, or Intelligence Layer merge on evidence records
- Failure simulation confirms evidence persistence failure aborts before compatibility row write

**Exit criteria:** Verification checklist complete; production sign-off recorded; execution report artifact committed.

### Phase E — Operational Stabilization

Establish stable coexistence between AI Analysis Evidence and `analyses` during the Transitional Hybrid period.

**Intent:**

- Monitor dual-write health: evidence persistence success rate, compatibility row write success rate, and divergence signals between stores
- Confirm operational teams understand dual authority model: evidence store is authoritative for inference-output persistence concerns; `analyses` remains read model for dashboard and history
- Confirm no stakeholder assumption that compatibility row presence alone proves evidence-store persistence
- Document transitional gap: legacy captures prior to Slice 5 activation have `analyses` rows but no AI Analysis Evidence rows — no backfill in this slice
- Maintain rollback readiness: dual-write disable path documented and tested in staging
- Hold read-path cutover, Intelligence Layer work, and Knowledge Layer work out of scope until separately authorized slices

**Exit criteria:** Operational stabilization period complete; no open P1/P2 migration defects; Slice 5 ready for formal closure and Slice 6 planning gate evaluation.

---

## Rollback Strategy

Slice 5 migration is **additive**. Rollback posture prioritizes operational safety and preserves all prior slice investments.

### Rollback principles

| Principle | Requirement |
|-----------|-------------|
| **Additive migration** | Infrastructure introduction does not mutate Slice 1–4 stores or `analyses` structure |
| **Compatibility row preserved** | Rollback of AI Analysis Evidence dual-write does not alter `analyses` write path or read-path behavior |
| **Lowest-risk rollback** | Disabling AI Analysis Evidence dual-write while leaving evidence store in place is the preferred operational rollback — no schema reversal required for incident response |
| **No data mutation** | Rollback does not require deleting evidence rows created during rollout unless governed deletion workflow is separately invoked |
| **No Slice 1–4 impact** | Rollback of Slice 5 must not corrupt or invalidate Scan Record V2, Consent Snapshot, or Slices 2–4 child evidence |

### Rollback scenarios

| Scenario | Action | Effect |
|----------|--------|--------|
| **Planning rejection** | Defer or reject this migration plan | No Slice 5 execution; AI output continues `analyses`-only persistence |
| **Post-infrastructure, pre-dual-write** | Do not activate dual-write | Empty evidence store; zero production impact |
| **Post-dual-write incident** | Disable AI Analysis Evidence dual-write | New captures skip evidence write; `analyses` compatibility path continues; existing evidence rows retained |
| **Infrastructure reversal** | Execute explicit rollback plan from SQL artifact | Requires separate authorization; must not drop or alter Slice 1–4 tables or `analyses` |

### Rollback triggers

Halt rollout and evaluate rollback if:

- AI Analysis Evidence persistence failure rate exceeds acceptable threshold
- Compatibility row regression detected
- Consent audit shows evidence rows without valid session authorization
- Boundary audit detects raw provider payload persistence, Knowledge Layer merge, or Intelligence Layer merge
- Slice 1–4 regression on shared capture path

Full infrastructure rollback requires explicit operator approval recorded per established single-project execution posture.

---

## Architectural Constraints

The following constraints are **binding** for Slice 5 migration planning and any downstream execution authorized by later gates:

| Constraint | Requirement |
|------------|-------------|
| **No Knowledge Layer** | No catalog lookup, entity resolution, or canonical vocabulary on evidence records |
| **No Intelligence Layer** | No Product Intelligence, Ingredient Intelligence, or structured recommendation record separation |
| **No Product Intelligence** | Prohibited merge per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** |
| **No Ingredient Intelligence** | Prohibited merge per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** |
| **No prompt changes** | System and user prompt content, rules, and output schema unchanged |
| **No response JSON changes** | API response contract to the client unchanged |
| **No read-path changes** | Dashboard, history, and Experience Layer continue reading `analyses` only |

Additional binding constraints:

- AI Analysis Evidence stores normalized application output only — not raw provider response
- Not diagnosis, medical classification, or clinical taxonomy
- Not replacement for `analyses` in Slice 5
- No legacy backfill of historical AI output
- No full prompt or raw image payload archival in evidence records
- No extension of `analyses` as canonical AI evidence store

Any migration activity crossing these constraints fails architectural review regardless of delivery convenience.

---

## Exit Criteria

Slice 5 is **ready for implementation** only after the following gated artifacts are accepted:

| Gate | Artifact | Status required |
|------|----------|-----------------|
| **Migration plan** | This document | Accepted |
| **Technical design** | **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md** | Accepted |
| **Dual-write implementation plan** | Slice 5 dual-write implementation plan (separate artifact) | Accepted |
| **Code audit** | Slice 5 dual-write code design and boundary audit (separate artifacts) | Accepted |

Additional prerequisites before implementation authorization:

- Slices 1–4 operational in target environment
- **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md** accepted
- Phase A preparation sign-off recorded
- Staging-first execution posture confirmed
- Separate explicit approval per environment documented

This document satisfies **migration planning definition** only. Acceptance of this plan does not authorize SQL drafting, migration execution, application code changes, or production rollout.

Implementation closure requires Phase D verification complete and a formal execution report committed — equivalent in rigor to **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md**.

---

## Current Decision

**Phase 1 Slice 5 — AI Analysis Evidence migration plan is proposed for review.**

Slice 5 migration introduces AI Analysis Evidence as an additive Evidence Layer object under Transitional Hybrid posture. Existing tables, read paths, UI, and API contracts remain unchanged. `analyses` continues as the compatibility read model.

Next step: review and acceptance of this document, then creation of gated dual-write implementation plan and code audit artifacts before any SQL or code work begins.
