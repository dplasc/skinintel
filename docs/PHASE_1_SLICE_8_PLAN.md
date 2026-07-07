# Phase 1 Slice 8 — Governed Exclusion Transition Primitive

## 1. Status

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 8
**Depends on:** Slices 1–7 (Slice 7 — Session Anchor Lifecycle Metadata migration, closed by Execution Report)
**Artifact type:** Plan (precedes Technical Design and Migration Plan)

---

## 2. Purpose

Slice 8 introduces the first governed lifecycle transition capability for the Evidence Layer.

Slices 1–5 built capture: append-only evidence writes, all rows entering the system as `active`. Slice 6 established the canonical lifecycle vocabulary (`active`, `excluded`, `superseded`) and the transition metadata surface on the four evidence tables. Slice 7 completed that metadata surface on the session anchor (`scan_records`) and froze the closed reason taxonomy. Across all of this, the non-`active` states have remained schema-level possibilities only: no mechanism in the system can move any row out of `active`.

Slice 8 closes exactly that gap. It delivers the governed transition primitive that makes the `active` → `excluded` transition operational — and nothing that consumes it. The primitive is the internal capability that every future governance workflow (deletion, consent withdrawal, retention) will invoke; those workflows remain future slices.

## 3. Goals

1. **`active` → `excluded` only.** The primitive supports exactly one transition. No other state movement is defined, permitted, or reachable. `excluded` is terminal; `superseded` remains unreachable.
2. **Governed transition.** Every transition is an explicit, auditable governed action. It records the mandatory transition metadata — a reason drawn from the frozen closed taxonomy and a transition timestamp — and is invalid without both, by construction rather than convention.
3. **Service-role only.** Transition authority is restricted to the established service-role posture. No client-originated path — direct or indirect — can perform or request a transition.
4. **Transactional.** A session-level exclusion and its child evidence propagation form a single all-or-nothing governed action, honoring the consistency model fixed by the Slice 7 Technical Design (atomicity goal, children-before-session ordering, convergent re-execution).
5. **Evidence-first.** The Evidence Layer remains the sole source of lifecycle truth. Transitions change lifecycle state and its two metadata fields only; evidence payloads, capture metadata, consent snapshots, and the `analyses` compatibility surface are never touched.
6. **No automatic execution.** The primitive ships dormant. No transition is executed against any data as part of this slice; no schedule, trigger, or workflow invokes it. All rows in all lifecycle-participating tables remain `active` at slice completion.

## 4. Scope

- **Transition primitive.** The governed capability that performs the `active` → `excluded` transition on the session anchor (`scan_records`) and the four evidence tables (`user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence`), including session-to-child propagation and the subordinate individual-child exclusion case defined by the Slice 7 Technical Design.
- **Transition metadata enforcement.** Structural enforcement that every transition carries a valid reason from the closed four-value taxonomy (`user_deletion_request`, `consent_withdrawal`, `administrative_invalidation`, `session_propagated_exclusion`) and a transition timestamp; that re-exclusion is rejected without overwriting original metadata; and that illegal transitions (wrong source state, wrong target state, missing metadata) are rejected in full.
- **Transaction boundaries.** Definition of the atomic unit of a governed exclusion: session exclusion plus child propagation as one all-or-nothing action; individual child exclusion as its own bounded action; failure and reconciliation posture inherited from the Slice 7 Technical Design.
- **Governance enforcement.** Restriction of the capability to service-role authority, with no widening of any client-facing surface. The primitive becomes the single enforcement point for the reason taxonomy, which is deliberately not enforced by a schema constraint.

## 5. Explicit Non-Scope

- **No UI changes** of any kind.
- **No API changes** — no endpoints, no request/response shape changes, no public deletion surface.
- **No application code** — no route, service, or client code is written or modified; the `POST /api/scan` capture path and its dual-write sequence are untouched.
- **No deletion** — no physical row deletion of any kind; exclusion is an eligibility change, not removal.
- **No redaction** — no payload stripping or content mutation; evidence content remains byte-identical across any transition.
- **No storage cleanup** — no storage object or binary removal.
- **No superseded workflow** — `active` → `superseded` remains schema-ready but unexercised; the primitive does not produce or traverse supersession.
- **No governance event tables** — auditability remains bounded to `status_reason` and `status_changed_at`, per the Slice 7 decision.
- **No RLS changes** — no policies added, removed, or altered on any table.
- **No triggers** — no automatic state-machine enforcement attached to table writes.
- **No scheduled jobs** — no automation, schedule, or background process invokes the primitive.

Additionally binding, carried forward from prior slices: no `consent_snapshots` changes (immutable, outside the state machine), no `analyses` changes (compatibility surface only, no lifecycle markers), and no read-path changes — the accepted residual that excluded sessions remain visible via `analyses`-based read paths stands until a future read-surface slice.

## 6. Success Criteria

Slice 8 is complete when all of the following are objectively verified:

1. **Legal transition works.** A governed exclusion of an `active` session results in the session anchor and all its lifecycle-participating children in `excluded` state, each carrying the supplied reason and a transition timestamp. A governed exclusion of an individual `active` child excludes exactly that row, leaving the session and siblings unchanged.
2. **Illegal transitions are impossible.** Attempts to re-exclude an `excluded` row, to transition to any state other than `excluded`, to transition without a reason or timestamp, or to supply a reason outside the closed taxonomy are rejected with no state or metadata change.
3. **Authority is closed.** No client-facing role can invoke the primitive; invocation is possible only under the established service-role posture. RLS posture is byte-identical to the pre-slice baseline.
4. **Atomicity holds.** A session exclusion and its child propagation complete as one unit; no completed action leaves a session `excluded` with children still `active`. Re-execution of a governed exclusion is convergent: already-excluded children are skipped with their original metadata preserved.
5. **Immutability is preserved.** Before/after comparison across any transition shows evidence payloads, storage references, capture metadata, consent snapshots, and all `analyses` rows unchanged; only lifecycle state and its two metadata fields differ.
6. **The primitive ships dormant.** After slice completion, every row in every lifecycle-participating table remains `active` with null transition metadata; no transition has been executed against production data.
7. **Capture regression is clean.** A full capture through `POST /api/scan` behaves identically before and after the slice; the dual-write sequence, response shapes, and RLS posture are unchanged.
8. **Artifact sequence honored.** All changes ship via the established forward-only artifact sequence (Technical Design → Migration Plan → SQL Draft → execution approval → Execution Report), and the Execution Report records the verification results above.

## 7. Next Step

Upon approval of this plan, produce `PHASE_1_SLICE_8_TECHNICAL_DESIGN.md` specifying the physical form of the transition primitive, its invocation posture, transaction and failure semantics, and the verification contract — followed by the Migration Plan and SQL Draft per the established slice artifact sequence. No migration or implementation work begins before this plan is approved.

---

*End of Phase 1 Slice 8 Plan.*
