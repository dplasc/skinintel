# Phase 1 Slice 5 Dual-Write Implementation Plan

## Status

**Implementation planning draft.**

This document defines the **conceptual dual-write execution order** for **Phase 1 Slice 5: AI Analysis Evidence** persistence within the established Transitional Hybrid capture path.

It describes the **logical sequence** by which governed AI inference output evidence is written alongside existing session stores, child evidence types, and the `analyses` compatibility read model — without prescribing implementation mechanics, transaction design, storage APIs, or environment-specific execution details.

This is a **dual-write implementation planning artifact only**. It does not authorize application changes, Supabase modifications, migration execution, SQL drafting, API implementation, UI changes, or operational rollout.

Sources: **docs/PHASE_1_SLICE_5_PLAN.md**, **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md**, **docs/PHASE_1_SLICE_5_MIGRATION_PLAN.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Implementation planning draft |
| **Implementation authorization** | Not granted by this document |
| **Code authorization** | Not granted by this document |

---

## Objective

Slice 5 **extends the Evidence Layer** by introducing **AI Analysis Evidence** — a governed record of the normalized AI analysis output accepted by the application after response validation and normalization — linked to Scan Record V2.

The dual-write objective is to persist this accepted inference output in the Personal Evidence Base **after successful AI inference** and **before** the `analyses` compatibility row write, while preserving the **Transitional Hybrid architecture**:

- Evidence stores remain authoritative for their respective persistence concerns
- `analyses` continues as the compatibility read model for dashboard and history
- Read paths, API response shape, AI prompt, and UI remain unchanged
- Slices 1–4 write semantics are preserved without reordering

Slice 5 adds post-inference evidence persistence only. It does not replace `analyses`, cut over read paths, or introduce Intelligence Layer or Knowledge Layer artifacts.

---

## Dual-Write Sequence

The following describes the **conceptual execution order** for a governed scan capture path extended with AI Analysis Evidence. This sequence is logical only — it does not describe code, modules, storage APIs, or transaction boundaries.

| Step | Action |
|------|--------|
| **1** | **Validate request** — Confirm authentication, rate-limiting, and session-level consent requirements for the capture type |
| **2** | **Establish session** — Resolve user ownership reference and prepare governed capture session context |
| **3** | **Scan Record V2** — Create governed capture session anchor for this capture event |
| **4** | **Consent Snapshot** — Record immutable active consent scopes at capture initiation, linked to session anchor |
| **5** | **User Description Evidence** — Persist when description non-empty and consented (Slice 2) |
| **6** | **Image Evidence** — Persist when image present and consented (Slice 3) |
| **7** | **Product Mention Evidence** — Persist when mention text non-empty and consented (Slice 4) |
| **8** | **AI/OpenAI inference** — Intelligence Layer consumes capture inputs; governed input evidence already established |
| **9** | **Normalize and validate AI response** — Confirm provider output satisfies required shape and content rules; produce application-accepted normalized payload or fail closed |
| **10** | **AI Analysis Evidence** — Persist accepted normalized analysis payload linked to session |
| **11** | **`analyses` compatibility row** — Write transitional denormalized read model; non-authoritative for Evidence Layer concerns |
| **12** | **Finish request** — Return capture response to client with unchanged contract shape |

### Ordering invariants

- Steps 3–7 establish governed input evidence before inference (step 8)
- Step 9 must succeed before steps 10–12 proceed under fail-closed posture
- Step 10 must succeed before step 11 when AI Analysis Evidence persistence is required
- Slice 5 adds steps 9–10 relative to the Slice 4 sequence; steps 3–7 preserve Slices 1–4 semantics without reordering
- Steps 5, 6, and 7 are independently conditional — any combination may produce child evidence on the same Scan Record V2
- Evidence Confidence Posture attachment remains deferred

---

## Accepted Analysis Payload

AI Analysis Evidence stores **only the application-accepted normalized analysis payload** — the same governed output produced after OpenAI response validation and normalization that downstream components consume and that is written to the compatibility read model.

The accepted payload comprises the application-governed analysis structure: intro, assessment, top5, next_steps, confidence, and medical_disclaimer — only after the capture path confirms the provider response satisfies required shape and content rules.

### Never store

| Excluded content | Reason |
|------------------|--------|
| **Raw provider response** | Unvalidated text is not governed application output |
| **Invalid response** | Fail-closed validation rejects non-conformant output before persistence |
| **Partial response** | Incomplete or schema-violating output must not enter the evidence store |
| **Prompt text** | Size, privacy, and secret-surface constraints; not evidence content |
| **Image bytes** | Already governed by Image Evidence (Slice 3); not inference-output evidence |

The evidence store and compatibility row must carry the **same accepted payload** for a given capture session. Divergence between stores indicates a dual-write integrity failure requiring investigation.

Safe inference provenance metadata (model provider, model name, response schema version) may attach at the evidence record level per **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md** — distinct from the normalized result payload and excluded from prompt or raw provider archival.

---

## Failure Behavior

All failure paths bind Slice 5 to **fail-closed, evidence-first dual-write discipline** established in Slices 1–4.

### If inference fails

| Outcome | Requirement |
|---------|-------------|
| **AI Analysis Evidence** | **Not written** |
| **`analyses` compatibility row** | **Not written** |
| **Capture request** | Returns failure; no partial success masking |

Provider error, timeout, or other inference failure produces no accepted payload. Steps 10–11 do not execute.

### If normalization fails

| Outcome | Requirement |
|---------|-------------|
| **AI Analysis Evidence** | **Not written** |
| **`analyses` compatibility row** | **Not written** |
| **Capture request** | Returns failure; no partial success masking |

Response validation failure — malformed JSON, missing required fields, invalid confidence value, or other schema violation — produces no accepted payload. Steps 10–11 do not execute.

### If AI Analysis Evidence persistence fails

| Outcome | Requirement |
|---------|-------------|
| **`analyses` compatibility row** | **Not written** — abort before compatibility write |
| **Posture** | **Fail closed** — no silent drop of governed output |
| **Capture request** | Returns failure |

An accepted normalized payload must not be treated as durably persisted when evidence write fails. Compatibility row write must not proceed as a fallback that masks evidence persistence failure.

### Slices 1–4 protection

Failure at steps 8–11 must not corrupt Slice 1–4 evidence already persisted in steps 3–7. Orphan prevention rules from **docs/PHASE_1_SLICE_5_TECHNICAL_DESIGN.md** apply: no evidence row without valid session linkage; no compatibility row implying evidence persistence when evidence write did not succeed.

---

## Compatibility Behavior

The **`analyses` compatibility model continues unchanged** in Slice 5.

| Surface | Behavior |
|---------|----------|
| **`analyses` row** | Still written on successful capture with existing shape, fields, and `scan_record_id` linkage |
| **Dashboard** | Continues reading from `analyses`; no change |
| **History** | Continues reading from `analyses`; no change |
| **API response** | Unchanged contract; same normalized payload returned to client |
| **AI Analysis Evidence store** | **Write-only** during Slice 5 — not exposed to client or Experience Layer |

### Dual authority model

During Transitional Hybrid coexistence:

- **AI Analysis Evidence** is authoritative for inference-output persistence concerns in the Personal Evidence Base
- **`analyses`** remains the read model for dashboard, history, and existing API consumers
- Compatibility row presence must not be treated as sole proof that AI Analysis Evidence was persisted — direct evidence-store verification is required for implementation closure

Slice 5 does not extend `analyses` as the canonical AI evidence store and does not cut over any read path to the evidence store.

---

## Architectural Boundaries

The following boundaries are **explicitly confirmed** as binding for Slice 5 dual-write implementation planning and any downstream code authorized by later gates:

| Boundary | Slice 5 posture |
|----------|-----------------|
| **No Knowledge Layer** | No catalog lookup, entity resolution, or canonical vocabulary on evidence records |
| **No Intelligence Layer** | No Product Intelligence, Ingredient Intelligence, or structured recommendation record separation |
| **No Product Intelligence** | Prohibited merge per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** |
| **No Ingredient Intelligence** | Prohibited merge per **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** |
| **No prompt changes** | System and user prompt content, rules, and output schema unchanged |
| **No response JSON changes** | API response contract to the client unchanged |
| **No UI changes** | Capture flow and presentation unchanged |
| **No read-path changes** | Dashboard, history, and Experience Layer continue reading `analyses` only |

Additional confirmed constraints:

- AI Analysis Evidence is not diagnosis, medical classification, or clinical taxonomy
- Not raw provider log; not replacement for `analyses` in Slice 5
- No legacy backfill; no client exposure of evidence store in Slice 5

Any dual-write implementation crossing these boundaries fails architectural review regardless of delivery convenience.

---

## Verification Targets

Future implementation closure must verify the following. These define success criteria for dual-write activation — not satisfied by this planning document alone.

### Payload and linkage verification

| Target | Expected outcome |
|--------|------------------|
| **Accepted normalized payload stored** | AI Analysis Evidence row contains application-accepted analysis output — not raw provider text |
| **Linked to `scan_record_id`** | Evidence row references correct parent Scan Record V2 for the capture session |
| **Payload alignment** | `normalized_result` matches the same accepted output written to compatibility row and returned to client |

### Compatibility verification

| Target | Expected outcome |
|--------|------------------|
| **`analyses` unchanged** | Compatibility row persists with existing shape, fields, and linkage |
| **Dashboard unaffected** | No regression in dashboard read behavior |
| **History unaffected** | No regression in history read behavior |

### Regression verification

| Target | Expected outcome |
|--------|------------------|
| **Slice 1–4 unaffected** | Session, consent, description, image, and mention evidence dual-write paths unchanged |
| **Failure posture** | Inference failure, normalization failure, and evidence persistence failure all abort before compatibility write |
| **Boundary audit** | No raw provider payload, prompt text, image bytes, Knowledge Layer fields, or Intelligence Layer merge on evidence records |

### Production verification

**Production verification is required** before Slice 5 formal closure. A real capture in production must produce an AI Analysis Evidence row verifiable by direct store query — not inferred from compatibility row presence alone. Results must be recorded in a formal execution report equivalent in rigor to **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md**.

---

## Current Decision

**This document authorizes implementation planning only.**

Phase 1 Slice 5 dual-write execution order, accepted payload rules, failure posture, and compatibility behavior are defined for review. This document does **not** authorize:

- Migration execution or SQL drafting
- Application code changes
- API implementation
- UI changes
- Operational rollout

The following remain **separate gated artifacts** that must be accepted before implementation proceeds:

| Gate | Artifact |
|------|----------|
| **Migration** | **docs/PHASE_1_SLICE_5_MIGRATION_PLAN.md** — accepted; SQL draft and execution separately authorized |
| **Code design** | Slice 5 dual-write code design (separate artifact) |
| **Code audit** | Slice 5 boundary audit (separate artifact) |
| **Implementation** | Application changes separately authorized after all gates satisfied |

Next step: review and acceptance of this document, then creation of gated code design and audit artifacts before any SQL or application work begins.
