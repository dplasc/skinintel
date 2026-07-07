# Phase 1 Slice 11 Technical Design — User Deletion Request Governance

## Status

**Status:** Draft — pending review  
**Phase:** 1  
**Slice:** 11  
**Depends on:** `PHASE_1_SLICE_11_PLAN.md` (approved), Slice 9 and Slice 10 Execution Reports  
**Artifact type:** Technical Design (design only; no implementation authorization)

---

## Design Purpose

This document defines the governance boundary for a future user deletion request workflow: how a deletion request may enter governance, who holds authority at each stage, how an approved request binds to the frozen reason taxonomy, and what the future workflow must guarantee and verify.

Slice 11 does not implement anything. No code, SQL, migration, RLS, API, UI, email workflow, admin panel, storage cleanup, localStorage handling, or invocation of the Slice 8 primitives is authorized. Its purpose is to prevent a future deletion workflow from deciding governance semantics at coding time.

---

## Existing Governance Boundary

- **Slice 8** provides the dormant governed exclusion primitives (`public.exclude_scan_record`, `public.exclude_evidence_row`) with reason validation, mandatory transition metadata, and service-role-only posture.
- **Slice 9** defines the invocation contract and maps `user_deletion_request` as the first candidate governance event class.
- **Slice 10** defines the read-surface eligibility contract: excluded records must not be presented as normal active user-facing results once read surfaces are made lifecycle-aware.
- **Slice 11** invokes nothing. The primitives remain dormant; this design adds the workflow-layer contract above the existing write-side and read-side contracts.

---

## Request Intake Boundary

Future allowed intake, at contract level:

- **Authenticated user request.** A deletion request may originate only from an authenticated user session.
- **Verified account ownership.** The request must be bound to the account that owns the affected records; ownership is verified before the request enters governance.
- **Governed support/admin intake** is permitted only if a future slice explicitly approves it, with its own authority and audit requirements.
- **No anonymous destructive request.** Unauthenticated or unverifiable requests are outside the boundary.
- **No direct primitive invocation from intake.** Intake creates a governed request; it never calls, schedules, or triggers the database primitives directly.

---

## Authority Boundary

- **Request initiation is not execution authority.** A user submitting a request grants nothing beyond entry into the governed workflow.
- **Identity, ownership, and scope must be established before service-role execution.** The future workflow validates all three before any governed action.
- **Service-role execution remains backend-only** under an approved workflow, per the Slice 9 consumer boundary. No client-facing role may execute.
- **Operator/manual execution remains unauthorized** unless a future runbook slice explicitly approves a governed operational procedure.

---

## Request Scope Model

Planning-level scope types a future workflow must support binding to:

- **Account-wide request** — all lifecycle-participating sessions and evidence owned by the account.
- **Scan-specific request** — a single session anchor and its lifecycle-participating child evidence.
- **Evidence-specific request** — an individual child evidence row within the approved evidence table set.

Slice 11 does not choose product UX for expressing scope. It requires only that future implementation bind every request to an explicit, resolved scope before invoking exclusion. A request with unresolved or ambiguous scope must not reach invocation.

---

## Event-to-Reason Mapping

- An **approved deletion request maps to `user_deletion_request`** — exactly, with no transformation.
- **`session_propagated_exclusion` remains internal-only**, assigned solely by the session-level primitive during child propagation; no workflow layer may supply it.
- **Invalid or ambiguous scope must reject before invocation.** Rejection occurs at the workflow layer; the primitive's own rejection behavior remains the final enforcement boundary.
- **No workflow may translate a deletion request into another reason.** `consent_withdrawal` and `administrative_invalidation` belong to their own future event flows.

---

## Exclusion vs Deletion Boundary

The governed action available to a future deletion workflow is lifecycle exclusion — an eligibility change only:

- **Physical deletion is not performed.** Rows persist in full.
- **Redaction is not performed.** Payload content is unaltered.
- **Storage cleanup is not performed.** Binaries and storage references remain.
- **`analyses` mutation is not performed.** The compatibility surface is untouched.
- **localStorage handling is not performed.** Client-side copies remain.
- **User-facing copy in any future workflow must not promise physical deletion** unless and until future slices implement physical removal. Communicating exclusion as deletion would create a false privacy guarantee.

---

## Future Workflow Preconditions

Before any future invocation under this contract:

- Requester is authenticated and verified.
- Account ownership of all targeted records is confirmed.
- Explicit request scope is resolved (account-wide, scan-specific, or evidence-specific).
- Target records exist and are in `active` lifecycle state.
- Reason is fixed to `user_deletion_request`.
- The read-surface residual is understood: exclusion may precede read-path awareness, per Slice 10.
- No claim of physical deletion is made to the user.
- A verification plan is attached to the governed action.

---

## Future Verification Obligations

After any future authorized invocation:

- Target scan and/or evidence rows are `excluded` where applicable.
- Lifecycle metadata (`status_reason`, `status_changed_at`) is populated on every transitioned row.
- Child propagation is verified for session-level requests.
- Active unrelated records are unaffected.
- The compatibility `analyses` residual is documented for the affected records.
- Storage and localStorage residuals are documented.
- No payload mutation occurred.

Verification obligations belong to the future consuming workflow. Slice 11 defines them but does not implement them.

---

## Residual Handling Contract

The following residuals must remain explicit in any future deletion workflow — documented in governance records and never silently ignored:

- **`analyses` compatibility reads** — excluded records may remain visible until read-surface implementation under the Slice 10 contract.
- **Storage references and binaries** — persist until a future storage cleanup slice.
- **localStorage copies** — persist on user devices until a future client-side handling slice.
- **Exports or user-downloaded data** — outside system control; must not be implied as deleted.
- **Audit/governance records** — records of the request and its processing persist by design and are not subject to the exclusion they document.

---

## Explicit Non-Changes

Slice 11 makes no runtime or database change:

- **No app code**
- **No API endpoint**
- **No UI**
- **No SQL**
- **No migration**
- **No RLS**
- **No primitive invocation**
- **No physical deletion**
- **No redaction**
- **No storage cleanup**
- **No localStorage handling**
- **No email workflow**
- **No admin panel**
- **No product feature**

---

## Migration Assessment

No migration is required for Slice 11. This is a workflow governance contract only; it introduces no schema, function, privilege, RLS, or data-state requirement.

A Migration Plan and SQL Draft are not expected unless review identifies a real database requirement (for example, a future decision to persist deletion requests as governed records — which would belong to a future slice, not this one).

---

## Final Technical Decision

Slice 11 should proceed as a design-only user deletion request governance contract: no code, no SQL, no migration, no primitive invocation, no workflow execution.

The correct next artifact after review approval is an Execution Report, not a Migration Plan. If approved as written, Slice 11 closes as a contract-only design slice; the first implementing workflow requires its own future slice operating under the combined Slice 9, 10, and 11 contracts.

---

*End of Phase 1 Slice 11 Technical Design.*
