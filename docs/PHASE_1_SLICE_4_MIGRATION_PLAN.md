# Phase 1 Slice 4 — Migration Plan

## 1. Purpose

This document defines the **migration sequence** for introducing **Phase 1 Slice 4: Product Mention Evidence** into the existing Transitional Hybrid persistence architecture.

It describes **how** governed mention evidence will be introduced incrementally—preserving production stability, Slices 1–3 operational posture, and the `analyses` compatibility read model—while closing the documented server-side capture gap for user-stated ingredient/product mention text.

This is a **migration planning artifact only**. It does not authorize implementation, Supabase changes, application code, API contract changes, UI changes, or operational execution.

Sources: **docs/PHASE_1_SLICE_4_PLAN.md**, **docs/PHASE_1_SLICE_4_TECHNICAL_DESIGN.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft only |
| **Execution approval** | Not approved for execution |
| **Implementation authorization** | Not granted by this document |

---

## 2. Migration Goals

The migration sequence exists to achieve the following objectives:

| Goal | Intent |
|------|--------|
| **Introduce Product Mention Evidence safely** | Persist user-stated ingredient/product mention text from the existing capture input as governed, unverified mention evidence linked to Scan Record V2—without catalog resolution, Product Intelligence, or Ingredient Intelligence |
| **Preserve Transitional Hybrid architecture** | Evidence Layer stores remain authoritative for mention concerns; `analyses` continues as the compatibility read model for dashboard and history |
| **Preserve analyses compatibility model** | Existing history and dashboard consumers continue reading `analyses`; no read-path cutover and no extension of `analyses` as the canonical mention store |
| **Avoid breaking existing production flow** | Slices 1–3 session foundation, User Description Evidence, and Image Evidence dual-write paths remain operational and regression-free; capture UX and API response shape unchanged |

Slice 4 migration closes the last remaining server-submitted capture gap identified in **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**: mention text currently consumed at AI inference and client-side scoring but not persisted as governed mention evidence.

---

## 3. Migration Principles

The following principles bind all Slice 4 migration activity. They inherit from **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, and established Slices 1–3 rollout precedent.

| Principle | Requirement |
|-----------|-------------|
| **Additive only** | Slice 4 introduces new Evidence Content Store infrastructure for Product Mention Evidence. No modification to existing Slice 1–3 stores or to the `analyses` compatibility structure as part of this slice's migration intent |
| **No destructive migration** | No dropping, truncating, or altering existing tables, policies, or data required for current production behavior. Migration must not invalidate prior session, consent, description, or image evidence |
| **No read-path cutover** | Dashboard, history, and API consumers continue existing read behavior. Product Mention Evidence is write-only foundation in Slice 4; direct store verification is the engineering audit path—not user-facing surfaces |
| **No UI changes** | The existing optional ingredients/product mention capture input remains unchanged. No product-selection UX, catalog browsing, or new capture surfaces |
| **No API changes** | Scan response contract and client-visible behavior unchanged. Server mention evidence is not exposed to Experience Layer consumers in Slice 4 |
| **Rollback-first thinking** | Migration sequencing assumes operational rollback is always available. Disable dual-write before considering infrastructure reversal; preserve rows created during rollout unless governed deletion workflow is separately invoked |
| **Evidence Layer authority** | Personal Evidence Base authority for mention concerns resides in governed Product Mention Evidence once operational—not in `analyses`, client-side `scoreProduct` output, or `localStorage`. Compatibility rows must not be treated as proof that mention evidence was persisted |

Additional binding constraints from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**:

- Product Mention Evidence records what the user said—not verified product identity, ingredient entities, or catalog match results
- Mention content must not be parsed or duplicated from User Description Evidence
- AI Analysis Result and Intelligence Layer output must not embed inside mention evidence records

---

## 4. Migration Sequence

Slice 4 migration proceeds through five conceptual phases. Each phase has explicit entry criteria and produces a verifiable state before the next phase begins. This sequence describes **migration intent and ordering only**—not implementation specifications, transaction design, or environment runbooks.

### Phase A — Preparation

Establish that all upstream planning gates, dependencies, and operational preconditions are satisfied before any Slice 4 infrastructure or application work is authorized.

**Intent:**

- Confirm Slices 1–3 are operational in the target environment: Scan Record V2, Consent Snapshot, User Description Evidence, Image Evidence, and `analyses.scan_record_id` compatibility linkage
- Confirm Slice 4 plan and technical design are accepted and committed
- Confirm this migration plan is reviewed and accepted
- Confirm recommended hard gate: formal Slice 3 dual-write verification documentation equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** is committed before implementation authorization
- Confirm downstream gated artifacts (SQL draft, dual-write code design, pre-implementation audit) are scheduled—not conflated with this planning step
- Confirm staging-first execution posture and separate explicit approval per environment

**Exit criteria:** All dependencies satisfied; no Slice 4 execution authorized until preparation sign-off is recorded.

### Phase B — Evidence Object Introduction

Introduce governed Product Mention Evidence persistence infrastructure as an additive Evidence Content Store child of Scan Record V2.

**Intent:**

- Add relational evidence store capacity for Product Mention Evidence within the Evidence Content Stores group per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**
- Apply session linkage, ownership posture, and access control consistent with Slice 2–3 child evidence precedent
- Leave existing Slice 1–3 stores and `analyses` unchanged
- Deploy infrastructure with zero initial mention evidence rows—schema-only posture matching established Slice 2–3 rollout pattern
- Apply staging before production; separate approval for each environment

**Exit criteria:** Evidence store infrastructure exists and passes read-only infrastructure verification; Slice 1–3 regression checks pass; no application dual-write active.

### Phase C — Dual-Write Activation

Authorize and deploy application changes that extend the established evidence-first write path to persist Product Mention Evidence on new captures.

**Intent:**

- Extend dual-write sequence by adding mention persistence after User Description Evidence and Image Evidence steps, before AI analysis and `analyses` compatibility row write—consistent with transitional mapping step 6 in **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md** and **docs/PHASE_1_SLICE_4_TECHNICAL_DESIGN.md**
- Gate mention persistence on session Consent Snapshot `evidence_storage_consent` when mention text is non-empty
- Preserve optional-field semantics: absent mention text skips evidence row creation; flow continues
- Apply fail-closed posture when mention text is present but consent or persistence fails—no partial success masking
- Coexist with Slices 2–3 child evidence on the same Scan Record V2 when all applicable inputs are present
- Deploy only after Phase B infrastructure verification passes and dual-write code design plus pre-implementation audit are accepted

**Exit criteria:** New captures with mention text and valid consent produce governed mention evidence linked to correct session; captures without mention text behave as before; dashboard, history, and API surfaces unchanged.

### Phase D — Verification

Confirm migration outcomes through direct evidence store audit—not inference from compatibility rows alone.

**Intent:**

- Verify happy path: mention text present and consented produces Product Mention Evidence linked to correct Scan Record V2
- Verify optional field: no mention text produces no mention evidence row; flow completes successfully
- Verify consent audit: mention evidence joins to session Consent Snapshot confirming `evidence_storage_consent` when persisted
- Verify coexistence: sessions with image, description, and mention produce all applicable child evidence types on same session anchor
- Verify boundary compliance: no catalog lookup, product identity resolution, ingredient entity resolution, Product Intelligence, Ingredient Intelligence, or client scoring data on mention records; no description cross-contamination
- Verify regression: Slice 1–3 dual-write paths and compatibility linkage unaffected
- Verify read-path unchanged: dashboard and history continue reading `analyses` only
- Verify failure posture: induced mention persistence failure confirms fail-closed behavior before AI analysis and compatibility write

**Exit criteria:** All verification checks pass in staging; production verification complete after separate production deploy approval.

### Phase E — Operational Stabilization

Monitor production capture path after Slice 4 activation and confirm sustained compliance with migration principles.

**Intent:**

- Monitor mention persistence failure rates against acceptable thresholds
- Monitor consent audit queries for unconsented mention rows
- Monitor boundary audit signals for Product Intelligence merge or description cross-contamination
- Monitor Slice 1–3 regression indicators on shared write path
- Record operational approval traceability per environment
- Halt rollout and evaluate rollback if rollback triggers defined in §6 are met

**Exit criteria:** Production behavior stable; no open P0 migration defects; formal Slice 4 dual-write verification document committed—required before Slice 5 planning authorization.

---

## 5. Backward Compatibility

Slice 4 migration is designed to preserve all existing production behavior for prior and concurrent consumers.

| Concern | Compatibility posture |
|---------|-------------------------|
| **Existing analyses rows** | All legacy and transitional compatibility rows remain valid and readable. Migration does not alter `analyses` schema or semantics |
| **No historical backfill** | Prior scan sessions where mention text was consumed ephemerally at inference are not retroactively persisted. Transitional gap for legacy rows is an explicit non-goal |
| **Dashboard unchanged** | Dashboard continues existing read behavior; no new fields or mention evidence exposure |
| **History unchanged** | History list and detail views continue reading from `analyses`; no evidence-first read-path cutover |
| **Compatibility model preserved** | `analyses` remains the transitional read model for current UI. Compatibility row presence must not be interpreted as proof of mention evidence persistence |
| **Client-side scoring unchanged** | Client `scoreProduct` logic and `localStorage` (`skinintel_last_scan`) remain non-authoritative and unaffected by server mention evidence writes |
| **Slice 1–3 evidence intact** | Session anchor, Consent Snapshot, User Description Evidence, and Image Evidence semantics and data unchanged by Slice 4 migration |

Under Transitional Hybrid (**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**), Personal Evidence Base authority for mention concerns transfers to governed Product Mention Evidence for **new captures only** once dual-write is active. Existing user-visible history remains served by the compatibility layer until a future explicitly gated read-path cutover.

---

## 6. Rollback Strategy

Rollback posture is **conceptual only**. Exact operational steps reside in downstream authorized artifacts (SQL draft rollback companion, dual-write disable procedure, operational runbook).

### Rollback principles

| Principle | Intent |
|-----------|--------|
| **Disable dual-write first** | Lowest-risk operational rollback: stop writing Product Mention Evidence while leaving infrastructure in place. Production capture path reverts to pre–Slice 4 mention persistence behavior without schema destruction |
| **Preserve existing evidence** | Mention evidence rows created during rollout are not deleted as part of rollback unless governed deletion workflow is separately invoked. Data retention supports audit and future read-path work |
| **Preserve analyses** | Compatibility rows and existing history/dashboard behavior unaffected by mention evidence rollback. No mutation of `analyses` required for rollback |
| **No destructive rollback** | Rollback must not drop, truncate, or alter Slice 1–3 stores. Infrastructure reversal—if ever authorized—is additive-artifact removal only, with explicit operator approval |

### Rollback scenarios

| Scenario | Conceptual response |
|----------|---------------------|
| **Pre–dual-write (Phase B only)** | Infrastructure exists with zero application writes. Reversal is low risk; no user-visible behavior change occurred |
| **Post–dual-write operational issue** | Disable mention dual-write in application layer first. Assess whether infrastructure reversal is necessary; default posture is disable-not-destroy |
| **Consent or boundary violation detected** | Halt rollout immediately; disable dual-write; investigate orphan or unconsented rows via direct store audit |
| **Slice 1–3 regression detected** | Halt Slice 4 rollout; disable mention dual-write; restore shared write path to pre–Slice 4 behavior before re-evaluation |

### Rollback triggers

Evaluate rollback when any of the following occur in production or staging:

- Mention persistence failure rate exceeds acceptable threshold on capture path
- Consent audit reveals mention evidence rows without valid session storage consent
- Boundary audit detects Product Intelligence merge, ingredient entity resolution, or User Description Evidence cross-contamination
- Slice 1–3 regression on shared write path

Full rollback authorization requires explicit operator approval, consistent with Slice 3 single-project execution posture where applicable.

---

## 7. Risks

| Risk | Description | Mitigation posture |
|------|-------------|-------------------|
| **Partial migration** | Infrastructure deployed without dual-write, or dual-write deployed without verification—creating ambiguous operational state | Enforce phased sequence with explicit exit criteria; no Phase C without Phase B verification; no production Phase E without Phase D pass |
| **Orphan evidence** | Mention evidence rows without valid Scan Record V2 linkage or consent provenance | Fail-closed dual-write discipline; orphan prevention rules in technical design; consent join audit in verification phase |
| **Consent failures** | Mention text present but `evidence_storage_consent` absent; or mention persisted under invalid session scopes | Fail-closed when mention present and consent missing; do not proceed to AI analysis or compatibility write; consent audit in verification phase |
| **Boundary violations** | Catalog lookup, product identity resolution, ingredient entity resolution, Product Intelligence, or description parsing introduced during implementation | Binding prohibited boundaries in plan and technical design; pre-implementation audit; boundary audit in verification phase |
| **Implementation drift** | Migration execution or code changes diverge from accepted plan, technical design, or migration sequence | Gated artifacts with mandatory review; staging-first apply; separate approval per environment; diff review before execution |
| **Dual-write drift** | Compatibility row existence assumed to imply mention evidence persistence | Direct store verification required; compatibility surface remains non-authoritative per transitional mapping |
| **Client-server conflation** | Server mention evidence conflated with client `scoreProduct` output | Server persists capture input only; scoring remains client-side; boundary audit confirms separation |
| **Write-path complexity** | Four child evidence types on shared session increase ordering and failure surface | Extend established dual-write pattern without reordering Slice 1–3 steps; fail-closed on mention persistence failure when mention present and consented |
| **Legacy backfill expectation** | Stakeholders expect historical ingredient input in evidence store | Explicit non-goal; communicate transitional gap in backward compatibility section |
| **Slice 3 verification gap** | Slice 4 proceeds before Slice 3 formal verification committed | Recommended hard gate before implementation authorization |

---

## 8. Success Criteria

Slice 4 migration is considered **complete** when all of the following are satisfied:

| Criterion | Definition of success |
|-----------|----------------------|
| **Product Mention Evidence operational** | New captures with non-empty mention text and valid `evidence_storage_consent` produce governed mention evidence linked to correct Scan Record V2; optional-field semantics confirmed for absent mention text |
| **Existing production behavior unchanged** | Dashboard, history, API response shape, capture UX, client-side scoring, and `localStorage` behavior identical to pre–Slice 4 posture for all user-visible surfaces |
| **Evidence-first preserved** | Dual-write order maintains evidence-before-Intelligence authority; mention persistence occurs before AI analysis and compatibility row write; fail-closed posture confirmed under failure simulation |
| **No regression in Slices 1–3** | Scan Record V2, Consent Snapshot, User Description Evidence, Image Evidence, and `analyses.scan_record_id` linkage operational and regression-free |
| **Boundary compliance confirmed** | No Product Intelligence, Ingredient Intelligence, catalog resolution, AI output embedding, or User Description Evidence cross-contamination on mention records |
| **Transitional Hybrid intact** | `analyses` not extended as canonical mention store; no read-path cutover; compatibility model preserved |
| **Verification artifact committed** | Formal Slice 4 dual-write verification document equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** accepted—required before Slice 5 planning authorization |

Migration success does **not** close all Phase 1 Evidence Layer work. Evidence Confidence Posture attachment, Correction Event workflow, deletion/retention workflow, and read-path cutover remain explicitly deferred.

---

## 9. Current Decision

**Phase 1 Slice 4 migration planning is defined for review only.**

This document specifies the conceptual migration sequence for introducing Product Mention Evidence under Transitional Hybrid architecture—additive infrastructure, extended dual-write, verification, and operational stabilization—while preserving Slices 1–3, the `analyses` compatibility model, and all user-visible production behavior.

This document does **not** authorize:

- Supabase schema changes or migration execution
- Application code changes
- API contract or response shape changes
- UI design or capture flow changes
- Product Intelligence, Ingredient Intelligence, or catalog integration
- Legacy mention text backfill

**Product Mention Evidence records user-stated ingredient/product mention text from the existing capture input, linked to Scan Record V2. It is not Product Intelligence, Ingredient Intelligence, catalog resolution, client scoring output, or AI inference.**

**Migration planning is complete only after review and commit of this document.** Subsequent gated artifacts—SQL draft, versioned migration file, dual-write code design, pre-implementation audit, and verification document—follow in authorized sequence before any implementation work begins.
