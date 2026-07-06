# Phase 1 Slice 5 Plan — AI Analysis Evidence

## Purpose

This document plans **Phase 1 Slice 5: AI Analysis Evidence** as the next incremental Evidence Layer slice after Slices 1–4.

Slice 5 defines how SkinIntel will **persist AI-generated analysis output as a governed Evidence Layer object** linked to Scan Record V2, while preserving the existing `analyses` compatibility table and all current read paths unchanged.

Today, AI output is written only to the transitional `analyses` row—a mixed artifact that conflates session metadata, compatibility read model concerns, and inference payload. Slice 5 introduces a dedicated evidence store for what the model returned at inference time, establishing provenance, supersession hooks, and future confidence governance without replacing or cutting over from `analyses`.

**Architectural rule:** AI Analysis Evidence stores the **normalized AI analysis output accepted by the application after response validation and normalization**—not the raw provider response. This preserves the governed application output that downstream components consume, aligned with the same accepted payload written to the compatibility read model.

This is a **planning artifact only**. It does not authorize schema work, migrations, application code, API contract changes, UI changes, or Supabase execution.

## Scope

Slice 5 closes the **AI output persistence gap** in the Evidence Layer. It records the model response as capture-time inference evidence—not as canonical truth, diagnosis, Knowledge Layer content, or Intelligence Layer enrichment.

The slice is limited to **write-path evidence persistence** for new scan captures. It extends the established dual-write model: child evidence and mention evidence are persisted before AI inference; AI Analysis Evidence is persisted after inference and alongside—not instead of—the `analyses` compatibility write.

## In Scope

Slice 5 planning covers the following at **conceptual level only**:

- **Storing AI-generated analysis output as evidence** — persist the normalized AI response payload (intro, assessment, top5, next_steps, confidence, medical_disclaimer) as governed evidence content, separate from the compatibility row's authority for dashboard/history.
- **Linking it to `scan_records`** — every AI Analysis Evidence row references the parent Scan Record V2 session anchor established in Slice 1.
- **Preserving model/provider metadata** — record model identifier, provider, and inference-relevant provenance fields (e.g. completion id, token usage where available) at a safe, non-secret level.
- **Preserving prompt/output provenance at a safe level** — capture enough context to audit what class of inference occurred (model, schema version, capture modality flags) without storing full prompt payloads, secrets, or raw image bytes in the evidence row.
- **Supporting future supersession** — append-oriented semantics; new inference runs create new evidence rows; design-compatible hooks for marking prior rows superseded or excluded without in-place mutation of historical output.
- **Supporting future confidence governance** — schema and object boundaries compatible with Evidence Confidence Posture attachment and separation from `analyses.confidence`; no confidence governance implementation in Slice 5.
- **Maintaining Transitional Hybrid posture** — continue writing `analyses` compatibility row with unchanged shape; no read-path cutover.
- **Extending dual-write write order** — AI Analysis Evidence persisted after OpenAI inference succeeds and before or alongside the compatibility write, per downstream dual-write design.
- **Fail-closed persistence posture** — downstream implementation should define whether AI evidence failure blocks the compatibility write; planning assumes evidence persistence is governed and auditable.

**Conceptual store placement:** AI Analysis Evidence belongs in the **Evidence Content Stores** group under **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, linked to Scan Record V2 as an inference-output evidence artifact—not as a replacement for the Intelligence Output Store direction in long-term architecture.

## Out of Scope

The following are excluded from Slice 5 planning and any future Slice 5 implementation authorized by downstream documents:

| Excluded item | Reason |
|---------------|--------|
| **Replacing `analyses` table** | Transitional compatibility read model remains authoritative for dashboard and history. |
| **Changing UI** | No client surface, capture flow, or presentation changes. |
| **Changing history read-path** | Dashboard and history continue reading `analyses` only. |
| **Changing AI prompt** | System and user prompt content, rules, and output schema unchanged. |
| **Changing response JSON** | API response contract to the client unchanged. |
| **Implementing Knowledge Layer** | No catalog, entity resolution, or canonical vocabulary persistence. |
| **Implementing Intelligence Layer** | No Product Intelligence, Ingredient Intelligence, or recommendation record separation beyond AI output evidence. |
| **Diagnosis or medical classification** | Cosmetic, educational scope only; no disease labeling or clinical taxonomy. |
| **Evidence Confidence Posture implementation** | Design-compatible only; attachment workflow deferred. |
| **Correction Event, deletion workflow, supersession enforcement** | Design-compatible schema hooks only; workflow deferred. |
| **Legacy backfill** | Historical `analyses` rows are not retroactively migrated to AI Analysis Evidence. |
| **Read-path exposure of evidence store** | No client or dashboard queries against AI Analysis Evidence in Slice 5. |
| **Prompt full-text archival** | Full system/user prompt storage excluded for size, privacy, and secret-surface reasons. |

## Dependencies

Slice 5 cannot be planned or implemented in isolation.

### Slice 1 — Session and consent foundation

| Dependency | Requirement |
|------------|-------------|
| **Scan Record V2 operational** | `scan_records` written on new captures. |
| **Consent Snapshot operational** | `consent_snapshots` linked to session; `reasoning_consent` active for AI inference path. |
| **Compatibility linkage** | `analyses.scan_record_id` references governed session anchor. |
| **Dual-write authority model** | Evidence-first write order and failure posture verified for session stores. |

### Slice 2 — User Description Evidence

| Dependency | Requirement |
|------------|-------------|
| **Text child evidence precedent** | Consent-gated, session-linked, write-only child evidence pattern established. |
| **Pre-inference write order** | Description evidence persisted before AI call. |

### Slice 3 — Image Evidence

| Dependency | Requirement |
|------------|-------------|
| **Binary child evidence precedent** | Image evidence persisted before AI call; failure stage discipline established. |
| **Multi-type coexistence** | Multiple child evidence types attach to shared session anchor. |

### Slice 4 — Product Mention Evidence

| Dependency | Requirement |
|------------|-------------|
| **Mention evidence operational** | Product mention evidence persisted when non-empty, before AI call. |
| **Slice 4 execution complete** | **docs/PHASE_1_SLICE_4_EXECUTION_REPORT.md** confirms migration, dual-write, and production verification. |

### Upstream planning artifacts

Slice 5 inherits binding constraints from **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, and Phase 1 behavioral governance documents (consent, deletion, correction, confidence).

### Recommended sequencing gates

| Gate | Requirement |
|------|-------------|
| **Planning** | This document accepted. |
| **Implementation** | Slice 4 dual-write verification and execution report accepted; Slices 1–4 operational in target environment. |

## Key Architectural Boundary

**AI Analysis Evidence records what the AI returned for a scan**—specifically, the normalized analysis output the application accepts after response validation and normalization, not the raw provider payload.

It is **not** final truth.  
It is **not** a diagnosis.  
It is **not** Knowledge Layer.  
It is **not** Intelligence Layer.

AI Analysis Evidence is a governed, immutable-at-insert record of accepted model output at inference time. It preserves the same governed application output that downstream components consume—for audit, supersession, and future governance—without elevating that output to canonical clinical or catalog truth and without archiving unvalidated provider text. The existing `analyses` row continues to serve the transitional read model; AI Analysis Evidence is the authoritative evidence-store representation of inference output for Phase 1 persistence concerns.

Downstream Intelligence Layer artifacts (Product Intelligence, Ingredient Intelligence, structured recommendation records) remain separate and are not introduced in Slice 5.

## Risks

| Risk | Description | Mitigation posture |
|------|-------------|-------------------|
| **Compatibility conflation** | Stakeholders treat `analyses.result` and AI Analysis Evidence as interchangeable canonical stores. | Explicit dual-write documentation; direct evidence-store verification; read-path unchanged on `analyses`. |
| **Intelligence Layer merge** | AI evidence row absorbs catalog resolution, entity IDs, or enrichment metadata. | Boundary review; prohibited merges in technical design gate. |
| **Diagnosis drift** | Stored AI output interpreted as medical classification or disease labeling. | Cosmetic scope enforcement; boundary language in schema comments and ops docs. |
| **Prompt secret exposure** | Full prompt archival leaks API patterns, PII, or image data. | Safe-level provenance only; exclude full prompt and raw image payloads. |
| **Write-order regression** | AI evidence write disrupts Slice 1–4 ordering or compatibility write. | Extend established dual-write sequence; regression verification on shared capture path. |
| **Duplicate authority** | Two stores (`analyses` + AI Analysis Evidence) diverge without clear transitional rules. | Transitional Hybrid: compatibility row preserved; evidence store verified independently. |
| **Supersession expectation** | Users expect re-analysis to overwrite prior evidence in place. | Append-oriented semantics; supersession workflow explicitly deferred. |
| **Legacy backfill pressure** | Expectation to migrate historical AI output into evidence store. | Explicit non-goal; communicate transitional gap. |
| **Payload size / cost** | Large JSON payloads increase storage and query cost. | Technical design evaluates column type, indexing, and retention posture. |

## Acceptance Criteria

No Slice 5 implementation may begin until all of the following are satisfied:

| Criterion | Requirement |
|-----------|-------------|
| **Slices 1–4 operational** | Session foundation and all child evidence dual-write paths operational in target environment. |
| **Slice 4 execution accepted** | Slice 4 execution report committed and verified in production. |
| **This plan accepted** | Slice 5 scope, boundaries, and in-scope/out-of-scope lists reviewed and signed off. |
| **Object boundaries binding** | AI Analysis Evidence conforms to **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** — no prohibited merges with Knowledge Layer or Intelligence Layer artifacts. |
| **Consent behavior binding** | Inference evidence gated on session Consent Snapshot scopes per **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md** — principally `reasoning_consent`. |
| **Deletion impact acknowledged** | Object-level deletion semantics per **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Correction behavior acknowledged** | Correctable object scope per **docs/PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md** incorporated into downstream design. |
| **Confidence posture acknowledged** | Evidence Confidence Posture separation from `analyses.confidence` per **docs/PHASE_1_EVIDENCE_CONFIDENCE_POSTURE_V1.md** — attachment deferred. |
| **Schema direction binding** | Evidence Content Store placement per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md** — `analyses` not extended as canonical AI evidence store. |
| **Downstream gated artifacts** | Separate technical design, migration plan, dual-write code design, and audit documents required before code authorization. |

This plan satisfies **slice selection and scope definition** only. It does not close technical design, schema, migration, code design, or implementation gates.

## Verification

Verification belongs to downstream implementation closure artifacts. At planning level, Slice 5 success is verified through:

### Planning verification (this document)

| Check | Expected outcome |
|-------|------------------|
| **Slice selection clarity** | AI Analysis Evidence is the agreed fifth minimal increment. |
| **Boundary preservation** | AI output evidence separated from Knowledge Layer, Intelligence Layer, and diagnosis semantics. |
| **Transitional Hybrid intact** | `analyses` remains compatibility read model; evidence store is authoritative for inference-output persistence concerns. |
| **Capture gap addressed** | AI output ephemeral-in-evidence-layer gap from audit and mapping documents is explicitly closed by Slice 5 scope. |

### Implementation verification (future artifacts)

| Check | Expected outcome |
|-------|------------------|
| **Happy path** | New scan produces AI Analysis Evidence row linked to correct `scan_record_id` with normalized output payload. |
| **Model metadata** | Model identifier and safe provenance fields populated on successful inference. |
| **Pre-inference ordering** | Slices 1–4 evidence persisted before OpenAI call; AI evidence persisted after successful inference. |
| **Compatibility coexistence** | `analyses` row still written with unchanged shape; dashboard and history unaffected. |
| **Read-path unchanged** | No client or dashboard queries against AI Analysis Evidence store. |
| **Failure posture** | Simulated AI evidence persistence failure handled per dual-write design; no silent drop of governed output. |
| **Regression** | Slice 1–4 evidence rows and compatibility linkage unaffected. |
| **Boundary audit** | No Knowledge Layer, Intelligence Layer, diagnosis, or prompt-secret fields on evidence records. |
| **Direct store verification** | Persistence confirmed by querying evidence store directly — not inferred from compatibility row alone. |

Implementation verification document (equivalent to **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**) is required before Slice 6 planning authorization.

## Rollback

Slice 5 introduces additive Evidence Layer persistence only. Rollback posture follows the established Phase 1 incremental model.

### Planning rollback

| Action | Effect |
|--------|--------|
| **Reject or defer this plan** | No Slice 5 artifacts or implementation authorized; AI output continues `analyses`-only persistence. |

### Infrastructure rollback (future migration)

| Action | Effect |
|--------|--------|
| **Revert additive schema migration** | Requires explicit rollback plan in migration artifact; must not alter or drop Slice 1–4 tables or `analyses` compatibility structure. |
| **Application dual-write disable** | Stop writing AI Analysis Evidence while leaving table in place — lowest-risk operational rollback if evidence persistence causes production issues. |

### Data and compatibility considerations

| Concern | Rollback rule |
|---------|---------------|
| **Existing AI Analysis Evidence rows** | Rollback does not require deleting rows unless governed deletion workflow is invoked separately. |
| **`analyses` compatibility rows** | Unaffected by AI evidence rollback; history and dashboard continue functioning. |
| **Slice 1–4 child evidence** | Rollback of Slice 5 must not mutate or invalidate prior session or child evidence. |

### Rollback triggers (operational)

Halt Slice 5 rollout and evaluate rollback if:

- AI evidence persistence failure rate exceeds acceptable threshold on production capture path
- Consent audit queries show evidence rows created without valid `reasoning_consent`
- Boundary audit detects Knowledge Layer or Intelligence Layer merge
- Compatibility row regression or read-path behavior change detected
- Slice 1–4 regression detected on shared write path

---

## Current Decision

**Phase 1 Slice 5 — AI Analysis Evidence is defined for planning only.**

This document selects AI Analysis Evidence as the fifth Evidence Layer increment after Slice 1 session foundation, Slice 2 User Description Evidence, Slice 3 Image Evidence, and Slice 4 Product Mention Evidence. It does **not** authorize schema changes, application code, API contract changes, UI changes, read-path cutover, or Intelligence Layer implementation.

**AI Analysis Evidence records what the AI returned for a scan, linked to Scan Record V2. It is not final truth, not a diagnosis, not Knowledge Layer, and not Intelligence Layer.**

Next step is review and commit of this plan, then creation of gated Slice 5 technical design, migration plan, and dual-write code design documents.
