# Phase 1 Slice 8 — SQL Draft V2 (Decision Lock Addendum)

This document is an addendum to `PHASE_1_SLICE_8_SQL_DRAFT_V1.md`. It does not restate that draft. It freezes the implementation decisions identified by the pre-execution architecture consistency audit as consequential enough that they must be fixed at review level before executable SQL is written.

Every decision below operates strictly within the approved Slice 8 Plan, Technical Design, and Migration Plan. No approved architectural decision is altered, widened, or reinterpreted. This addendum contains **no executable SQL**.

---

## Status

**Status:** Draft V2 (Decision Lock Addendum) — pending approval
**Phase:** 1
**Slice:** 8
**Depends on:** Slice 8 SQL Draft V1, Slice 8 Migration Plan (approved), Slice 8 Technical Design (approved), Slice 8 Plan (approved)
**Artifact type:** SQL Draft addendum (precedes executable SQL, execution approval, and Execution Report)

---

## 1. Session Re-invocation Decision

**Frozen decision: invoking the session-level exclusion primitive against a session that is already `excluded` is a full rejection — the governed action fails with an explicit error and produces no state change and no metadata write of any kind.**

Rationale and boundaries:

- This resolves the residual ambiguity between "re-exclusion is rejected" and "re-execution is convergent" in favor of rejection at the session level. The two statements now have disjoint domains:
  - **Rejection** applies to the governed action's target row: a session (or individually targeted evidence row) that is not in `active` state is an illegal source, and the action fails in full.
  - **Convergence** applies only *within* a legal session exclusion: during propagation, child rows already `excluded` by a prior governed action are skipped with their original `status_reason` and `status_changed_at` preserved.
- Because the session exclusion executes as a single atomic transaction, the partial state contemplated by the Slice 7 consistency model (children excluded, session still `active`) can never persist as a committed outcome. The Slice 7 "reconciliation by re-execution" path is therefore unreachable by construction and requires no dedicated repair behavior in the primitive.
- The original transition metadata of an excluded session is never overwritten under any invocation, consistent with the Technical Design (Section 5).

## 2. Child Primitive Shape

**Frozen decision: the two-primitive contract approved in the Technical Design (Section 2) is retained — one session-level primitive and one child-level primitive. The child-level primitive validates its table identifier against a hard-coded closed whitelist of exactly the four lifecycle-participating evidence tables and dispatches through static, per-table statements. No dynamic SQL identifier construction of any kind is permitted.**

Rationale and boundaries:

- A caller-supplied table identifier resolved through dynamic statement construction is an injection-shaped surface, even behind service-role privileges. It is eliminated at the design level, not mitigated at coding time.
- The whitelist is closed and internal to the primitive, mirroring the enforcement pattern already approved for the reason taxonomy: a table identifier outside the set (`user_description_evidence`, `image_evidence`, `product_mention_evidence`, `ai_analysis_evidence`) causes the entire governed action to fail with no state or metadata change.
- Dispatch to the identified table is expressed as static statements fixed in the migration text — one branch per table — so every statement the primitive can ever execute is visible in full at review time.
- This preserves the approved invocation surface (two primitives, no more) while removing the sole dynamic-SQL element the V1 shape implied.

## 3. Privilege Hardening

**Frozen decision: privilege configuration on both primitives comprises three mandatory operations, executed within the same single-transaction migration unit that creates the primitives:**

1. **Revocation from `PUBLIC`.** The default execution privilege that the database grants to all roles on function creation is explicitly revoked. Revoking client roles alone is insufficient; without this step the capability would remain executable by every present and future role through the implicit public grant.
2. **Revocation from client-facing roles.** `anon` and `authenticated` are explicitly revoked, covering both direct grants and any execution privilege acquired through the platform's default-privilege configuration for newly created functions in the target schema.
3. **Explicit grant to the service-role posture.** Execution privilege is granted solely to the established service-role posture used by the Slices 1–5 write paths.

Because the migration applies as one transaction, the primitives are not visible to any session before commit — at which point all three operations have already taken effect. The Migration Plan requirement that the capability never exist in an unrestricted state, even transiently, is therefore satisfied structurally, not procedurally. Post-migration privilege posture is verified by catalog inspection per the approved validation strategy. High-level statement only; physical grant/revoke form belongs to the executable migration.

## 4. Transaction Timestamp

**Frozen decision: a single transaction-stable timestamp is used for the entire governed action.** The session anchor and every child row transitioned by propagation record the identical `status_changed_at` value, taken once at the transaction boundary. The governed action is thereby atomic in time as well as in state: all rows changed by one governed exclusion are distinguishable as one event by timestamp equality alone, within the audit surface bounded to `status_reason` and `status_changed_at`.

## 5. Session Locking

**Frozen decision: the session-level primitive acquires an exclusive row-level lock on the target `scan_records` row as its first action, before any validation of child rows and before propagation begins.**

- Concurrent invocations of the session exclusion against the same session serialize on this lock; the second invocation observes the committed `excluded` state and is rejected per Section 1, never producing interleaved or duplicated metadata writes.
- The children-before-session write ordering inherited from the Slice 7 Technical Design is unchanged; locking the anchor first is an acquisition order, not a write order.
- Accepted residual, named explicitly: a capture in flight on `POST /api/scan` may insert a child row for a session concurrently being excluded, leaving an `excluded` session with an `active` child. This state is safe under the approved eligibility model — session state is the outer gate, so the child is ineligible regardless of its own status field — and is detectable by inspection of lifecycle fields alone, as the Slice 7 consistency model requires. No coordination with the capture path is introduced; the two paths remain fully decoupled by binding decision.

## 6. Implementation Notes

The remaining physical SQL details — exact function names, parameter types, return values, error surfacing form, function language, security posture (invoker semantics and pinned search path), and the concrete catalog-inspection and rollback-context verification queries — are finalized during executable migration review. Their resolution is bounded by this addendum and by the approved upstream artifacts: no such detail may alter the two-primitive contract, the state machine, the closed reason taxonomy, the privilege posture of Section 3, the decisions frozen in Sections 1–5, or the dormant-shipping guarantee. Any deviation from a frozen decision requires a revised draft and re-approval; it is never resolved silently at coding time.

The gated sequence of SQL Draft V1 (Section 7) remains in force, with this addendum inserted as a review gate between draft approval and executable SQL drafting. No transition is executed against production data at any point in this slice.

## 7. Reason Taxonomy Partition

**Frozen decision: the closed four-value reason taxonomy is partitioned by responsibility. Caller-suppliable reasons and internally assigned reasons are disjoint sets; the partition is a governance rule, not an implementation detail.**

The session-level exclusion primitive accepts only the following caller-supplied reasons:

- `user_deletion_request`
- `consent_withdrawal`
- `administrative_invalidation`

The direct child-level exclusion primitive accepts the same three reasons. No other value is valid as caller input on either primitive.

The value `session_propagated_exclusion` is reserved exclusively for internal propagation performed by the session-level primitive. It identifies child evidence transitions caused by session exclusion and records the session-level governed action as their cause, per the Slice 7 Technical Design. It must never be accepted as caller input on any primitive.

Any invocation that supplies `session_propagated_exclusion` as a reason, or any reason outside the permitted set for the invoked primitive, is a full rejection: the governed action fails with no state change and no metadata write of any kind. This partition preserves the semantic integrity of the frozen taxonomy without schema change and ensures that propagation provenance cannot be forged by a caller.

---

*End of Phase 1 Slice 8 SQL Draft V2 (Decision Lock Addendum).*
