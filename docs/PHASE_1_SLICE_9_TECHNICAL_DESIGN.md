# Phase 1 Slice 9 Technical Design — Governed Exclusion Invocation Contract

## Status

**Status:** Draft — pending review  
**Phase:** 1  
**Slice:** 9  
**Depends on:** `PHASE_1_SLICE_9_PLAN.md`, Slice 8 Execution Report  
**Artifact type:** Technical Design (planning/design only; no implementation authorization)

---

## Design Purpose

This document defines the governed invocation contract for future authorized use of the dormant Slice 8 exclusion primitives. It specifies who may call those primitives in a later implementation slice, which governance events may justify invocation, how those events map to caller-suppliable reasons, and what verification obligations a future workflow must satisfy.

Slice 9 does not invoke the primitives. It does not create a workflow, endpoint, job, UI, SQL migration, or operational runbook. Its purpose is to prevent future implementation work from deciding invocation semantics at coding time.

---

## Existing Primitive Boundary

Slice 8 created the existing database-layer governed exclusion primitives:

- `public.exclude_scan_record(uuid, text)`
- `public.exclude_evidence_row(text, uuid, text)`

These primitives already provide the database capability for governed `active` -> `excluded` transitions, including reason validation, metadata writing, service-role-only execution posture, and full rejection of invalid or reserved caller reasons.

Slice 9 does not change these primitives. It does not alter their signatures, behavior, privileges, transaction model, reason taxonomy, or dormant shipping posture.

---

## Authorized Consumer Boundary

Future invocation is authorized only through an explicitly approved governed workflow in a later implementation slice.

Binding boundary:

- **Service-role only.** The future consumer must execute under the established service-role posture. No client-facing role may call the primitives.
- **No client-originated invocation.** A client action may only initiate a future approved workflow; it must never call, request direct execution of, or hold authority over the database primitive itself.
- **No direct UI or API exposure.** The primitives are not public product APIs. No UI element or API endpoint may expose primitive invocation semantics directly.
- **No ad hoc operator execution.** Manual database execution, one-off scripts, console calls, or operational shortcuts are outside the authorized boundary unless a future slice explicitly approves a governed runbook.
- **Later implementation approval required.** Any consuming workflow must be defined, reviewed, and approved by its own future implementation slice before it invokes the primitives in any environment.

---

## Governance Event Classes

The planning-level governance event classes that may map to governed exclusion are:

- `user_deletion_request`
- `consent_withdrawal`
- `administrative_invalidation`

`user_deletion_request` is the first candidate event class for future session-level consumption because it aligns with the deletion/retention planning model and the Slice 8 reason taxonomy.

Slice 9 does not implement any event class. These classes define eligible future contract categories only; workflow behavior, actor validation, retention decisions, and user-facing semantics remain future implementation work.

---

## Reason Mapping Rules

Reason mapping is exact and non-transformational:

| Governance event class | Caller-suppliable primitive reason |
|------------------------|------------------------------------|
| `user_deletion_request` | `user_deletion_request` |
| `consent_withdrawal` | `consent_withdrawal` |
| `administrative_invalidation` | `administrative_invalidation` |

`session_propagated_exclusion` is internal-only. It is reserved exclusively for child evidence transitions performed inside `public.exclude_scan_record(uuid, text)` during session propagation.

`session_propagated_exclusion` must never be accepted from callers by any workflow, API layer, service method, operator tool, or future implementation surface.

Invalid, unknown, null, or reserved caller-supplied reasons are full rejection cases. The governed action must fail with no state change and no metadata write.

---

## Invocation Preconditions

A future approved workflow must validate all of the following before invoking a primitive:

- **Target exists.** The referenced session or child evidence row must exist.
- **Target is active.** The target must currently be in `active` lifecycle state. Already `excluded` rows are not eligible for caller-driven re-exclusion.
- **Reason is caller-suppliable.** The reason must be one of `user_deletion_request`, `consent_withdrawal`, or `administrative_invalidation`.
- **Actor is authorized through an approved service workflow.** The workflow must establish that the actor, system, or governance process is authorized before service-role execution occurs.
- **Primitive choice is correct.** Session-wide governance events use `public.exclude_scan_record(uuid, text)`; direct child evidence exclusions use `public.exclude_evidence_row(text, uuid, text)`.
- **No read-path or deletion assumptions are made.** Invocation changes eligibility state only. It does not imply read-path filtering, physical deletion, redaction, storage cleanup, `analyses` mutation, or localStorage handling.

These preconditions are caller obligations. They do not weaken the database primitive's own rejection behavior; the primitive remains the final enforcement boundary.

---

## Session-Level Invocation Contract

`public.exclude_scan_record(uuid, text)` is the future contract for governed session-wide exclusion only.

Expected future use:

- The caller supplies only the target session identifier and one permitted caller reason.
- The primitive performs child propagation internally.
- The caller does not enumerate, pre-filter, or manually transition child evidence rows.
- The caller does not supply `session_propagated_exclusion`; that reason is assigned only by the primitive during internal propagation.
- The caller treats the session-level action as one governed unit: session anchor plus eligible child evidence propagation.

The future workflow may verify child outcomes after invocation, but it must not duplicate propagation logic outside the primitive.

---

## Child-Level Invocation Contract

`public.exclude_evidence_row(text, uuid, text)` is the future contract for direct child evidence exclusion only.

Expected future use:

- The target table must be one of the approved lifecycle-participating evidence tables:
  - `user_description_evidence`
  - `image_evidence`
  - `product_mention_evidence`
  - `ai_analysis_evidence`
- The caller supplies the approved table identifier, target evidence row identifier, and one permitted caller reason.
- `session_propagated_exclusion` is never accepted as caller input.
- No dynamic table routing outside the approved evidence table set is permitted.
- Direct child exclusion does not cascade upward to the session anchor and does not affect sibling evidence.

This contract is subordinate to the session-level contract. It is for individually governed child evidence invalidation, not session-wide exclusion.

---

## Post-Invocation Verification

A future approved workflow must verify and record the outcome of any authorized invocation.

Required verification:

- **Target rows excluded.** The intended session or child evidence row is in `excluded` state after successful invocation.
- **Metadata complete.** `status_reason` and `status_changed_at` are populated on every row transitioned by the action.
- **Child propagation consistent where applicable.** For session-level exclusion, lifecycle-participating active child rows are excluded through primitive-managed propagation.
- **Payloads unchanged.** Evidence payloads, capture metadata, storage references, and consent snapshots remain unchanged.
- **`analyses` residual unchanged and documented.** `analyses` rows are not mutated by invocation; any continued visibility through compatibility read paths remains an accepted residual until a future read-surface slice.
- **No partial transition committed.** The workflow must treat partial state, illegal transition, or metadata absence as a failed governance action requiring investigation under a future operational policy.

Verification obligations belong to the future consuming workflow. Slice 9 defines them but does not implement them.

---

## Explicit Non-Changes

Slice 9 makes no runtime or database change:

- **No SQL change**
- **No migration**
- **No new function**
- **No app code**
- **No UI, API, or read-path change**
- **No RLS, trigger, or scheduled job**
- **No deletion, redaction, or storage cleanup**
- **No `analyses` mutation**

Additionally, Slice 9 does not authorize localStorage handling, public deletion surfaces, operational scripts, production primitive invocation, or Slice 10/Slice 11 work.

---

## Migration Assessment

No migration is required for Slice 9.

The existing Slice 8 primitives already provide the required database capability. Slice 9 defines the invocation contract around that capability only: authorized consumer boundary, governance event classes, reason mapping, preconditions, and verification obligations.

Because no schema, function, privilege, RLS, trigger, or data-state change is required, a Slice 9 Migration Plan and SQL Draft are not expected.

---

## Open Residuals

- **`analyses` read paths remain unfiltered.** History and dashboard behavior continue to rely on the compatibility surface until a future read-surface slice addresses visibility.
- **Primitives remain dormant.** Slice 9 does not consume or execute the Slice 8 primitives.
- **Deletion and storage cleanup remain future work.** Exclusion remains an eligibility change only; physical removal, redaction, binary cleanup, and localStorage handling are deferred.
- **Authorized consumer implementation remains future work.** A later implementation slice must define and approve the first consuming workflow before invocation occurs.

---

## Final Technical Decision

Slice 9 should proceed with no Migration Plan and no SQL Draft unless review identifies a missing database requirement.

The correct next artifact after this Technical Design is review approval. If approved as written, Slice 9 closes as a contract-only design slice: no migration, no executable SQL, no application implementation, and no invocation of the dormant Slice 8 primitives.

---

*End of Phase 1 Slice 9 Technical Design.*
