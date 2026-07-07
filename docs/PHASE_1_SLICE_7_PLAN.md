# Phase 1 Slice 7 — Evidence Lifecycle Transition Foundation

## 1. Status

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 7
**Depends on:** Slices 1–6 (Slice 6 — Evidence Lifecycle Governance Foundation)
**Artifact type:** Plan (precedes Technical Design and Migration Plan)

---

## 2. Problem Statement

The Evidence Layer is complete for capture and classification, but its lifecycle states are not yet operational.

- Every evidence row is written as `active` by the scan write path, and no mechanism in the system can transition any row to another state.
- Slice 6 established the canonical lifecycle vocabulary (`active`, `excluded`, `superseded`) and the transition metadata (`status_reason`, `status_changed_at`), but shipped no behavior. The non-`active` states exist only as schema-level possibilities; they are unreachable.
- As long as no governed transition exists, deletion and retention governance defined in `PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md` remains architecturally unenforceable, and consent withdrawal cannot affect the eligibility of already-captured evidence.

Slice 7 solves exactly one problem: **make the `active` → `excluded` transition operational as a governed, service-role-only, internal capability.**

## 3. Why This Follows Slice 6

- Slice 6 was explicitly a foundation slice: it stabilized the lifecycle vocabulary and metadata precisely so that transition behavior could be built without encoding vocabulary drift. Slice 7 is the first consumer of that foundation.
- Slice 6's non-goals state that no application code transitions statuses; it deferred all transition behavior to a successor slice executed "on the vocabulary this slice stabilizes." Slice 7 is that successor.
- The dependency chain is strict and incremental: Slices 1–5 built capture (append-only evidence writes), Slice 6 built classification (states, metadata, FK posture), Slice 7 builds the first governed behavior (transitions). No later Phase 1 work — deletion workflow, correction events, retention — can proceed while lifecycle states remain unreachable.
- Slice 6's FK reconciliation (`CASCADE` → `RESTRICT`) established the tombstone-first posture that a status-transition-based lifecycle model requires: parents cannot be physically deleted out from under evidence, so exclusion by state change is the only governed path — and that path must now exist.

## 4. Purpose

Make evidence lifecycle governance operational at the smallest safe increment: a governed, auditable, service-role-only internal transition that moves evidence from `active` to `excluded`, populating the Slice 6 transition metadata. This slice delivers the transition capability itself — nothing that consumes it (deletion endpoints, UI, redaction) and nothing beyond it (new tables, new markers, new surfaces).

## 5. Scope

- **Governed exclusion transition:** an internal, service-role-only capability that transitions evidence rows from `active` to `excluded` on the existing evidence tables (`user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence`) and transitions `scan_records.status` from `active` to `excluded` at session level.
- **Transition metadata population:** every transition writes `status_reason` and `status_changed_at` (the columns introduced by Slice 6). No transition may occur without both.
- **State machine enforcement:** only `active` → `excluded` is permitted in this slice; `excluded` is terminal; no reverse transitions; no other state movements.
- **Immutability guarantees:** transitions change lifecycle state and metadata only. Evidence content payloads are never modified.
- **Consent snapshot posture:** `consent_snapshots` are immutable governance records and are not mutated or excluded by lifecycle transitions in this slice.
- **Dual-write preservation:** the `POST /api/scan` capture path and its write order remain unchanged; the transition capability is an orthogonal, post-capture path.

## 6. Non-scope

- **No new governance event table.** Transition auditability in this slice is carried by the existing `status_reason` / `status_changed_at` metadata; a dedicated governance event store is not introduced.
- **No changes to `analyses`.** No new columns, markers, or lifecycle state on the compatibility surface. `analyses` remains a compatibility read model only; the Evidence Layer remains the source of truth.
- **No UI changes** of any kind.
- **No API contract changes** — no public deletion endpoint, no request/response shape changes.
- **No read-path changes** — history and dashboard continue to read `analyses` exclusively and unfiltered.
- **No redaction, binary deletion, or physical deletion** — no storage object removal, no payload stripping, no row deletion. Exclusion is an eligibility change, not content destruction.
- **No supersession workflow** — `active` → `superseded` remains schema-ready but unexercised.
- **No correction event store** — correction semantics remain a separate future slice per `PHASE_1_CORRECTION_EVENT_BEHAVIOR_V1.md`.
- **No consent withdrawal automation** — withdrawal-triggered exclusion policy is future work; this slice provides only the transition primitive such policy would invoke.
- **No localStorage handling** and no client-facing behavior of any kind.

## 7. Dependencies

| Dependency | Requirement |
|------------|-------------|
| Slice 6 closure | The canonical vocabulary, `status_reason` / `status_changed_at` columns, and reconciled FK posture must be approved and verified in production before Slice 7 Technical Design begins. |
| `PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md` | Binding behavioral contract: exclusion preserves structure, no silent removal, deleted/excluded evidence must not feed reasoning. |
| `PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md` | Consent snapshot immutability under lifecycle exclusion. |
| Service-role write posture (Slices 1–5) | Transitions reuse the established service-role Supabase pattern; no new client-facing write policies. |
| Transitional Hybrid ADR | Evidence Layer authority and `analyses` compatibility role remain as decided; this slice must not disturb either. |

## 8. Transition Semantics

- **Single permitted transition:** `active` → `excluded`. No other movement is valid in this slice.
- **`excluded` is terminal.** There is no reinstatement transition; if evidence must become eligible again, it is captured as a new `active` row per the append-only philosophy.
- **Service-role-only authority.** No client write path can perform or request a transition. RLS posture is unchanged; no new policies are added.
- **Eligibility change only.** A transition mutates `evidence_status` (or `scan_records.status`), `status_reason`, and `status_changed_at` — nothing else. Evidence payloads are immutable and are not redacted in this slice.
- **Mandatory metadata.** Every transition carries a reason and a transition timestamp. A transition without both is invalid by design.
- **Session-level coherence.** `scan_records.status` remains the session-level eligibility dimension (`active` / `excluded`); session exclusion semantics must remain coherent with child evidence eligibility, with the precise coordination rules specified in the Technical Design.
- **Consent snapshots excluded from the state machine.** Lifecycle exclusion never mutates a consent snapshot; it remains the immutable record of what was authorized at capture.

## 9. Acceptance Criteria

Slice 7 planning is accepted when:

1. The problem statement — lifecycle states exist but are not operational — is reviewed and accepted as the single slice boundary.
2. The transition semantics are accepted: `active` → `excluded` only; `excluded` terminal; service-role-only; eligibility/state change only; mandatory reason and timestamp.
3. The immutability guarantees are accepted: no payload mutation, no redaction, no physical deletion, consent snapshots untouched.
4. Non-scope is confirmed with no creep: no governance event table, no `analyses` changes, no UI/API/read-path changes, no supersession, no correction events.
5. The Slice 6 closure gate is confirmed satisfied before Technical Design begins.
6. Compatibility is confirmed: additive only, forward-migration compatible, no breaking changes, dual-write path unchanged.
7. The slice is declared ready for `PHASE_1_SLICE_7_TECHNICAL_DESIGN.md`; no migration or code ships before this plan is approved.

## 10. Risks

- **Slice 6 ratification gap.** If Slice 6 is not formally closed before Slice 7 design begins, the transition capability builds on unratified semantics. Mitigation: hard dependency gate (Section 7).
- **Irreversibility.** `excluded` is terminal; an erroneous governed exclusion cannot be reversed, only compensated by new capture. Mitigation: mandatory reason metadata and service-role-only authority; explicit sign-off on this trade-off at gate review.
- **Partial-transition inconsistency.** A session-level exclusion whose child-evidence transitions partially fail would create eligibility drift within a scan. The Technical Design must define ordering and consistency posture before implementation.
- **Hidden-visibility residual.** Because read paths are unchanged, an excluded session remains visible in history/dashboard via `analyses` until a future slice addresses the read surface. This is an accepted, documented residual of this slice — Slice 7 does not deliver user-visible deletion.
- **Scope creep toward destruction.** Pressure to "actually delete" content (binaries, payloads, `analyses` rows) must be refused; exclusion and redaction are deliberately separated, and redaction is future slice work.
- **Audit-scope creep.** Pressure to add a governance event table "while we are here" must be refused; this slice's auditability is bounded to the Slice 6 metadata columns by explicit decision.

## 11. Exit Criteria

Slice 7 is complete when:

1. The governed `active` → `excluded` transition is implemented, service-role-only, and verified against the state machine invariants (terminal exclusion, no reverse transitions, mandatory metadata).
2. Transition execution demonstrably leaves evidence payloads, consent snapshots, `analyses` rows, read paths, and the capture dual-write path unmodified.
3. All schema changes (if any are required by the Technical Design) are additive and applied via a forward-only migration following the established `phase_1_slice_7` naming convention.
4. An execution report documents verification results and the accepted residuals (read-path visibility, no redaction).
5. No regression exists in the `POST /api/scan` capture path.

## 12. Next Step

Upon approval of this plan, produce `PHASE_1_SLICE_7_TECHNICAL_DESIGN.md` specifying the physical form of the transition capability (invocation surface, session/child coordination rules, consistency posture, and validation queries), followed by the Migration Plan and SQL Draft per the established slice artifact sequence.

---

*End of Phase 1 Slice 7 Plan.*
