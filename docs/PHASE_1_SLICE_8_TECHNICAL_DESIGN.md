# Phase 1 Slice 8 — Technical Design

This document follows the approved Slice 8 Plan (`docs/PHASE_1_SLICE_8_PLAN.md`).

This is a design artifact only. It contains no SQL, no API endpoint definitions, and no UI behavior. It defines the physical design for the governed exclusion transition primitive; exact physical form is finalized in the Slice 8 SQL Draft.

---

## Status

**Status:** Draft — pending approval
**Phase:** 1
**Slice:** 8
**Depends on:** `PHASE_1_SLICE_8_PLAN.md` (approved), Slice 7 closure (session anchor transition metadata, frozen reason taxonomy, Execution Report)
**Artifact type:** Technical Design (precedes Migration Plan and SQL Draft)

---

## 1. Design Summary

Slice 8 introduces database-layer governed transition primitives for the `active` → `excluded` lifecycle transition — and for that transition only.

The primitives are internal, service-role-only capabilities that operate on the existing lifecycle-participating tables: the session anchor (`scan_records`) and the four evidence tables. They make the lifecycle states established by Slices 6 and 7 reachable for the first time, while enforcing the state machine, the mandatory transition metadata, and the closed reason taxonomy by construction.

Placing the primitives in the database layer is a deliberate decision: it provides a single enforcement point for the reason taxonomy (which has no schema constraint by Slice 7 decision), and it makes the all-or-nothing transaction semantics of session exclusion structural rather than conventional. No application code participates in enforcement.

The primitives ship dormant. Nothing invokes them; no data changes state as part of this slice.

## 2. Primitive Shape

Two internal primitives are defined conceptually:

- **`exclude_scan_record(scan_record_id, reason)`** — the session-level governed action. Excludes the identified scan session and propagates exclusion to its lifecycle-participating child evidence rows, per the coordination model inherited from the Slice 7 Technical Design (children first, then the session anchor, within one transaction).
- **`exclude_evidence_row(table_name, evidence_id, reason)`** — the subordinate child-level governed action. Excludes exactly one evidence row in one of the four evidence tables, leaving the session anchor and sibling evidence unchanged.

Both primitives record the mandatory transition metadata (`status_reason`, `status_changed_at`) as an inseparable part of the state change. Neither primitive accepts a target state parameter: `excluded` is the only reachable target and is fixed inside the primitive, not chosen by the caller.

These shapes are conceptual contracts. Exact SQL signatures — parameter types, naming, return values, and error surfacing — are finalized in the Slice 8 SQL Draft. No SQL is defined in this document.

## 3. Authority Model

- **Service-role only.** The primitives are executable exclusively under the established service-role posture used by the Slices 1–5 write paths.
- **No anon/authenticated execution.** Client-facing database roles hold no execution privilege on either primitive. Privilege restriction is part of the primitive's definition, not an afterthought.
- **No API or UI invocation.** No endpoint, page, component, job, or schedule invokes the primitives. They exist as internal governed capabilities; the surfaces that will consume them (deletion workflow, consent withdrawal policy) are future slices.
- **No RLS policy change.** The existing RLS posture is byte-identical before and after this slice. No policies are added, removed, widened, or narrowed. Authority is expressed through execution privileges on the primitives, not through row-level policy.

## 4. Reason Taxonomy Enforcement

The closed reason vocabulary, frozen at Slice 7 and binding here:

| Reason value | Meaning |
|---|---|
| `user_deletion_request` | Transition initiated by a governed user deletion request. |
| `consent_withdrawal` | Transition initiated by withdrawal of a consent scope required for eligibility. |
| `administrative_invalidation` | Transition initiated by an internal governance decision invalidating the session or evidence item. |
| `session_propagated_exclusion` | Child evidence transition caused by exclusion of its parent scan session. |

**Enforcement lives in the primitive, not in a CHECK constraint.** This preserves the Slice 7 decision: the schema remains free of a reason constraint so future taxonomy additions stay additive, and the primitive — as the sole legal writer of `status_reason` — validates every supplied reason against the closed set and rejects anything outside it. Free-text reasons are invalid by design. A reason outside the taxonomy causes the entire governed action to fail with no state or metadata change.

Session-propagated child transitions record `session_propagated_exclusion` as their reason, identifying the session-level governed action as the cause, per the Slice 7 Technical Design.

## 5. Transition Rules

The state machine enforced by both primitives:

- **Source must be `active`.** A transition attempt against a row in any other state is illegal.
- **Target is `excluded` only.** No other target state is expressible; the primitives offer no mechanism to reach `superseded` or to return to `active`.
- **`excluded` is terminal.** No transition leaves the `excluded` state. Reinstatement is expressed only by capturing new `active` evidence, per the append-only philosophy.
- **`superseded` is not touched.** The state remains defined by the Slice 6 vocabulary and unreachable; no primitive produces, consumes, or traverses it, and no primitive follows the `supersedes_evidence_id` reference.
- **Re-exclusion must not overwrite original metadata.** Applying an exclusion to an already-`excluded` row is not a legal transition. It is handled as a rejected no-op that preserves the original `status_reason` and `status_changed_at`; within session propagation, already-excluded children are skipped with metadata intact, making re-execution convergent.
- **Invalid transitions fail fully.** Illegal source state, missing or invalid reason, unknown target row, or unauthorized origin cause the entire governed action to fail with no partial state change and no partial metadata write.

## 6. Transaction Semantics

- **Session exclusion updates children first, then `scan_records`.** The ordering rule fixed by the Slice 7 Technical Design is preserved inside the primitive: the outer eligibility gate (session state) closes only after the inner records agree.
- **Single transaction.** A session exclusion and its full child propagation execute within one transaction boundary.
- **All-or-nothing.** Partial application — session excluded with children still `active`, or the reverse — is not an acceptable committed outcome. Failure at any point aborts the entire governed action.
- **No payload mutation.** Evidence content payloads, storage references, capture metadata, provenance fields, and capture timestamps are never written by any primitive. Only the lifecycle state field and its two metadata fields change.
- **No `analyses` mutation.** The compatibility surface is not read, written, or referenced by any primitive. Its divergence from excluded evidence remains the accepted, documented residual of Slices 7 and 8.
- **No `consent_snapshots` mutation.** Consent snapshots are immutable governance records outside the state machine. They receive no transition, no metadata, and no write of any kind from any primitive.

## 7. Child Evidence Behavior

Session propagation and individual exclusion cover all four evidence tables uniformly:

- `user_description_evidence`
- `image_evidence`
- `product_mention_evidence`
- `ai_analysis_evidence`

Behavior, identical across the four:

- **On session exclusion**, every `active` child row of the excluded session transitions to `excluded` with reason `session_propagated_exclusion` and a transition timestamp, within the same transaction as the session anchor change.
- **Already-excluded children are skipped**, preserving their original transition metadata. Propagation never overwrites a prior governed action.
- **On individual child exclusion**, exactly the targeted row transitions; the session anchor, sibling evidence, and all other sessions are unchanged. Individual child exclusion never cascades upward to the session.
- **No cross-session effects.** No primitive touches rows belonging to another scan session.
- **Session state remains the outer gate.** Once a session is `excluded`, no child of that session is eligible for reasoning regardless of the child's own status field, per the Slice 7 eligibility model. The primitives maintain the inner records; the gate semantics are unchanged.

`consent_snapshots` is exempt from all propagation, consistent with its position outside the state machine.

## 8. Dormant Shipping

The Slice 8 migration creates the primitives only. It does not execute them against production data.

- No row in any lifecycle-participating table changes state as a result of the migration; all rows remain `active` with null transition metadata.
- No invocation surface ships: no endpoint, trigger, schedule, job, or application call site exists after this slice.
- The primitives remain dormant until a future slice — with its own plan, design, and approval gates — defines a governed workflow that invokes them.
- Post-migration data state is therefore identical to pre-migration data state, and this is a verified condition of the Execution Report, not an assumption.

## 9. Verification Contract

The Execution Report must demonstrate all of the following:

| Verification | Expectation |
|---|---|
| **Primitive exists** | Both primitives are present in the target schema with the shapes approved in the SQL Draft. |
| **Privileges are restricted** | Execution privilege is held by the service-role posture only; `anon` and `authenticated` hold no execution privilege. Verified by catalog inspection. |
| **Legal transition behavior** | Transition behavior (legal exclusion, propagation, metadata recording, re-exclusion rejection, invalid-reason rejection) is exercised only in an isolated validation setup or within a transaction-rollback context — never committed against production rows. |
| **No production rows changed** | Post-migration, every row in every lifecycle-participating table remains `active` with null `status_reason` and null `status_changed_at`. |
| **RLS posture unchanged** | The full policy set across `scan_records`, `consent_snapshots`, and the four evidence tables is byte-identical to the pre-migration baseline. |
| **Schemas outside scope unchanged** | `consent_snapshots`, `analyses`, all payload columns, all constraints, and all FK postures show no diff against the pre-migration baseline. |

Verification must also confirm the capture regression baseline: a full capture through `POST /api/scan` behaves identically before and after the migration.

## 10. Explicit Non-Goals

Restated as binding constraints on the Migration Plan, SQL Draft, and any future work referencing this design:

- **No UI** — no component, page, or client behavior changes.
- **No API** — no endpoints, no request/response shape changes, no public deletion surface.
- **No app code** — no route, service, or client code written or modified; the `POST /api/scan` dual-write sequence is untouched.
- **No deletion** — no physical row deletion; exclusion is an eligibility change, not removal.
- **No redaction** — no payload stripping or content mutation of any kind.
- **No storage cleanup** — no storage object or binary removal.
- **No read-path filtering** — history and dashboard continue to read `analyses` exclusively and unfiltered; excluded sessions remain visible there as the accepted residual.
- **No triggers** — no automatic enforcement attached to table writes.
- **No jobs** — no schedule, automation, or background process.
- **No governance event table** — auditability remains bounded to `status_reason` and `status_changed_at`.

## 11. Exit Criteria

This Technical Design is complete and Slice 8 may proceed to the Migration Plan when:

1. The two-primitive shape (session-level with propagation, child-level subordinate) is reviewed and accepted as the complete invocation surface of this slice.
2. The authority model (service-role-only execution privilege, no client roles, no RLS change) is accepted.
3. Primitive-level enforcement of the closed reason taxonomy — in place of a CHECK constraint — is reconfirmed as the binding enforcement posture.
4. The transition rules and transaction semantics (children-first ordering, single transaction, all-or-nothing, convergent re-execution) are accepted.
5. Dormant shipping is accepted: the migration creates capability, changes no data, and ships no invocation surface.
6. The verification contract (Section 9) is accepted as the Execution Report's obligations.
7. No migration or SQL drafting begins before this design is approved.

---

*End of Phase 1 Slice 8 Technical Design.*
