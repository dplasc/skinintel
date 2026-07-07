# Phase 1 Slice 6 — Evidence Lifecycle Governance Foundation Plan

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 6
**Depends on:** Slices 1–5 (complete)
**Artifact type:** Plan (precedes Technical Design and Migration Plan)

---

## 1. Purpose

Slice 6 standardizes lifecycle semantics for the evidence records introduced in Slices 1–5. It defines a single canonical status vocabulary, formal supersession and invalidation semantics, and a deletion-compatible referential posture across the Evidence Layer.

Slice 6 is a governance foundation slice. It establishes the vocabulary and invariants that all future deletion, correction, and retention workflows must build on. It does not implement any of those workflows.

## Design Principles

Slice 6 follows these architectural principles throughout planning and downstream design:

- **Additive-first migrations** — prefer constraint widening and metadata additions over destructive schema changes.
- **Backward compatibility** — existing capture paths and stored rows remain valid without migration of application logic.
- **No breaking changes** — no alteration of API contracts, read paths, or dual-write behavior in this slice.
- **Append-only evidence philosophy** — new evidence is captured as new rows; lifecycle changes do not rewrite historical content.
- **Governed lifecycle transitions** — movement between lifecycle states is explicit, auditable, and service-role-only.
- **Immutable evidence content** — governed actions change eligibility status, not the captured payload at the point of transition.
- **Compatibility with existing dual-write** — the scan write path and legacy `analyses` compatibility insert are preserved.
- **Implementation deferred until approved** — this plan defines semantics and boundaries; no DDL or code ships before approval.

## 2. Problem Statement

The Evidence Layer is functionally complete for capture (Slices 1–5) but its lifecycle semantics have drifted:

- **Status is effectively insert-only.** All evidence rows are written with `evidence_status = 'active'` by the scan write path. No code path transitions any row to another state, so the non-active states are unexercised and their meaning is undocumented at the schema level.
- **Vocabulary drift already exists.** `ai_analysis_evidence` permits `('active','excluded','superseded')` and carries `supersedes_evidence_id`, while `user_description_evidence`, `image_evidence`, and `product_mention_evidence` permit only `('active','excluded')`.
- **The session anchor uses a different dimension.** `scan_records.status` is a session-level eligibility state, not a per-evidence lifecycle state, but this distinction is currently implicit.
- **FK deletion posture is inconsistent.** `consent_snapshots` and `ai_analysis_evidence` cascade on parent delete; `user_description_evidence`, `image_evidence`, and `product_mention_evidence` restrict; legacy `analyses.scan_record_id` sets null. This contradicts the tombstone-first posture in `PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md` and the Slice 1 finding that consent snapshots must not be silently removed.
- **Sequencing risk.** If a deletion workflow is built before the lifecycle vocabulary is stable, every governance action would encode today's drift and require a corrective migration later. Vocabulary must be fixed before behavior is implemented.

## 3. Scope

### In scope

- Canonical evidence lifecycle vocabulary, applied uniformly across all evidence tables.
- Supersession semantics: definition, invariants, and traceability requirements.
- Invalidation semantics: definition of `excluded` as a governed state transition.
- Status metadata planning: identification of the audit metadata (e.g. reason, transition timestamp) that future transitions require; column design is deferred to the Technical Design.
- Deletion/retention compatibility: alignment of FK delete behavior with the tombstone-first posture so future deletion work does not require referential rework.
- RLS/service-role posture: confirmation that lifecycle state mutations remain service-role-only, with no new client-facing write policies.
- Compatibility with the existing dual-write model: the `POST /api/scan` write order and the legacy `analyses` compatibility insert remain unchanged.

### Out of scope

- Deletion workflow (including the `delete-request` endpoint, storage binary removal, `analyses` redaction, client `localStorage` clearing).
- Correction Event store (`PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md`) and Evidence Confidence Posture stores.
- UI changes of any kind.
- API response contract changes (success or error shapes).
- AI prompt or model behavior changes.
- Read-path cutover: history and dashboard continue to read `analyses` exclusively.
- Any code that changes statuses: no application code transitions evidence into `excluded` or `superseded` in this slice.

## 4. Canonical Lifecycle Vocabulary

The canonical lifecycle vocabulary for evidence records is:

| State | Meaning |
|-------|---------|
| `active` | Evidence is valid and eligible for reasoning. Default state at capture. |
| `excluded` | Evidence has been removed from active reasoning by a governed action (invalidation, deletion governance, consent withdrawal). Row structure is retained; the state is terminal for reasoning eligibility. |
| `superseded` | Evidence has been replaced by a newer evidence record of the same type. Retained for traceability; ineligible for current-state reasoning. |

This vocabulary applies uniformly to `user_description_evidence`, `image_evidence`, `product_mention_evidence`, and `ai_analysis_evidence`. The three non-AI evidence tables are brought up to the full vocabulary; `ai_analysis_evidence` already conforms.

**Session-level distinction:** `scan_records.status` remains a session-level eligibility state with values `('active','excluded')`. It is intentionally not identical to child `evidence_status`: a scan session is excluded or active as a whole and is never "superseded" — a re-scan creates a new session rather than replacing an existing one. The plan documents this mapping explicitly; no rename of the column is proposed.

## 5. Supersession Semantics

- **Supersession means replacement.** A record becomes `superseded` only when a newer evidence record of the same type exists and replaces it for reasoning purposes.
- **No silent overwrite.** Superseding evidence is captured as a new row; the prior row is never mutated in content, only in lifecycle state.
- **Traceability is mandatory.** The superseding record must reference the record it replaces (the existing `supersedes_evidence_id` pattern on `ai_analysis_evidence` is the template). The superseded record remains queryable for audit.
- **Current state is derived by status.** The authoritative current evidence for a scan is resolved by selecting `active` rows, never by ordering or timestamps alone. Invariant: at most one `active` evidence record per type per scan record where the type is single-valued (description, image, AI analysis).
- **No re-analysis workflow in this slice.** No code path produces a supersession in Slice 6. The state becomes well-defined and reachable by design; the workflow that reaches it is future work.

## 6. Invalidation Semantics

- **Invalidation maps to `excluded`.** There is no separate `invalidated` state; invalidation is a governed transition of a record from `active` to `excluded`.
- **Excluded means removed from active reasoning.** Excluded evidence is ineligible for any current-state reasoning, downstream inference, or personalization. This is an eligibility outcome, not a confidence downgrade.
- **Not physical deletion.** The row persists; exclusion preserves structure and audit trail per the tombstone posture.
- **Not a content edit.** Governed content redaction (e.g. clearing sensitive payloads, removing storage binaries) is a distinct future concern layered on top of exclusion, not part of the status transition itself.
- **Reason metadata is required in future implementation.** Any transition to `excluded` must carry a reason and a transition timestamp. Slice 6 plans this metadata; the Technical Design specifies its physical form.

## 7. Deletion and Retention Compatibility

- Slice 6 prepares the schema so future deletion/retention workflows can be implemented without referential rework. It implements no deletion workflow itself.
- **Physical delete must not silently cascade evidence.** Current foreign-key deletion semantics are inconsistent across evidence tables. Slice 6 will evaluate and reconcile them. Planning defines the problem; Technical Design determines the solution.
- **Tombstone and redaction behavior remains future slice work.** Marking evidence `excluded`, redacting content, removing storage objects, and reconciling the legacy `analyses` payload are the deletion slice's responsibility, executed on the vocabulary this slice stabilizes.
- The legacy `analyses` table has no lifecycle column. Slice 6 documents this gap and defers it; adding lifecycle state to `analyses` risks the read contract and is unnecessary for this foundation.

## 8. Dependencies on Slices 1–5

| Slice | Object | Dependency |
|-------|--------|------------|
| 1 | `scan_records`, `consent_snapshots` | `scan_records.status` is the session anchor the vocabulary must stay coherent with. The `consent_snapshots` CASCADE reconciliation closes the P1-1 finding from the Slice 1 dual-write design. |
| 2 | `user_description_evidence` | Status vocabulary widened to the canonical set; existing `RESTRICT` posture becomes the standard. |
| 3 | `image_evidence` | Same as Slice 2; storage binary handling remains out of scope. |
| 4 | `product_mention_evidence` | Same as Slice 2; multi-row-per-scan shape is unaffected by the vocabulary. |
| 5 | `ai_analysis_evidence` | Template for the canonical vocabulary and supersession traceability (`superseded`, `supersedes_evidence_id`); CASCADE posture reconciled to `RESTRICT`. |

All five insert paths in the scan write route must continue to function unmodified. Every proposed change is constraint-widening or FK-behavior-only and is backward compatible with the existing dual-write.

## 9. Non-Goals

Strict non-goals for Slice 6, restated for gate review:

- No SQL execution in this artifact — DDL is drafted and approved in the subsequent Migration Plan / SQL Draft, per the established slice sequence.
- No API behavior change — `POST /api/scan` request handling, response shapes, and error contracts are untouched.
- No UI change — no component, page, or client behavior changes.
- No AI change — prompts, models, and response schema are untouched.
- No history/dashboard change — read paths continue to use `analyses` exclusively.

## 10. Acceptance Criteria

Slice 6 planning is accepted when:

1. The canonical lifecycle vocabulary (`active`, `excluded`, `superseded`) and the session-level distinction for `scan_records.status` are reviewed and accepted.
2. The semantic boundaries are accepted: supersession = replacement with traceability; invalidation = governed exclusion; exclusion ≠ physical deletion ≠ content edit.
3. Scope boundaries are confirmed with no creep into deletion workflow or correction event work.
4. The FK reconciliation direction (`CASCADE` → `RESTRICT`) is explicitly approved as a delete-semantics change.
5. The slice is declared ready for `PHASE_1_SLICE_6_TECHNICAL_DESIGN.md`.
6. No implementation (migration or code) begins until this plan is approved.

---

*End of Phase 1 Slice 6 Plan.*
