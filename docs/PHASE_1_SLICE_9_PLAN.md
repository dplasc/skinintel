# Phase 1 Slice 9 Plan — Governed Exclusion Invocation Contract

## Status

**Status:** Draft — pending approval  
**Phase:** 1  
**Slice:** 9  
**Depends on:** Slices 1–8 (Slice 8 — Governed Exclusion Transition Primitive, closed by Execution Report)  
**Artifact type:** Plan (precedes Technical Design; planning and design only)

Slice 9 is a governance contract slice. It defines the authorized invocation boundary for the dormant Slice 8 exclusion primitives. It does not authorize SQL, migrations, application code, API endpoints, UI changes, or production invocation.

---

## Background

Slice 7 added nullable lifecycle transition metadata (`status_reason`, `status_changed_at`) to `scan_records`, closing the session-anchor metadata gap on the lifecycle surface established by Slice 6.

Slice 8 added two dormant, service-role-only governed exclusion primitives — session-level exclusion with child propagation and subordinate child-level exclusion — enforcing the `active` → `excluded` state machine, mandatory transition metadata, and the closed reason taxonomy by construction.

No application code, UI, API, trigger, scheduled job, RLS change, or read-path behavior consumes those primitives yet. All lifecycle-participating rows remain `active` with null transition metadata; the capability exists but has never been exercised against production data.

---

## Problem

The database can now perform governed exclusion, but no product or governance invocation contract exists yet.

Slice 8 delivered the internal capability; it deliberately shipped no consumer. Without an approved invocation contract, any future workflow that calls the primitives would resolve semantics at implementation time — bypassing the artifact sequence and risking scope creep into deletion UX, read-path changes, or ungoverned operational use. Slice 9 closes that planning gap only.

---

## Scope

- **First authorized consumer boundary (planning level).** Define who may invoke the primitives in a future implementation slice: service-role posture only, through an explicitly approved governed workflow — not through client-facing paths, direct database access by operators without contract, or ad hoc scripts.
- **Allowed governance event classes (planning level).** Enumerate which business events may map to governed exclusion in future slices, aligned with the frozen reason taxonomy (`user_deletion_request`, `consent_withdrawal`, `administrative_invalidation` as caller-suppliable; `session_propagated_exclusion` reserved to internal propagation only).
- **Caller responsibilities.** The future consumer must validate preconditions, supply a permitted reason, invoke the correct primitive (session vs. child), record verification outcomes, and never forge propagation provenance or bypass taxonomy partition rules frozen in Slice 8 SQL Draft V2.
- **Preconditions before future invocation.** Define what must be true before any governed action may run: target session or evidence row exists and is in `active` state; reason is from the permitted set for the invoked primitive; actor holds service-role authority through the approved workflow only; no concurrent unauthorized exclusion path; capture-path and read-path posture unchanged unless a future slice explicitly authorizes otherwise.
- **Reason mapping rules.** Bind each allowed governance event class to exactly one caller-suppliable reason value; prohibit `session_propagated_exclusion` as caller input; require full rejection semantics for invalid or reserved reasons per Slice 8 design.
- **Post-invocation verification expectations.** After any future authorized invocation, verification must confirm: affected rows transitioned to `excluded` with complete metadata; payloads, consent snapshots, and `analyses` rows unchanged; session propagation consistency where applicable; no partial or illegal transition committed.
- **Preserve dormant posture until later implementation slice.** This slice produces contract artifacts only. The primitives remain dormant; no production invocation, no workflow code, and no operational runbook execution are authorized by Slice 9 completion.

---

## Non-Scope

- **No SQL draft**
- **No migration**
- **No new function**
- **No app code**
- **No UI changes**
- **No API endpoint**
- **No read-path filtering**
- **No deletion, redaction, or storage cleanup**
- **No localStorage handling**
- **No `analyses` mutation**
- **No scheduled job or trigger**
- **No Slice 10 or Slice 11 work**

Additionally binding, carried forward: no RLS changes, no governance event table, no supersession workflow, and no change to the accepted residual that excluded sessions would remain visible via `analyses`-based read paths until a future read-surface slice.

---

## Initial Governance Event Candidate

`user_deletion_request` is the first candidate governance event class for future authorized invocation of session-level exclusion. It aligns with the frozen reason taxonomy and with deletion/retention planning semantics at the planning level.

Slice 9 does not implement deletion. It does not define deletion UX, deletion endpoints, physical removal, or any workflow that invokes the primitives. It only establishes the contract frame within which a future slice may seek authorization to consume the primitive for this event class.

`consent_withdrawal` and `administrative_invalidation` remain valid taxonomy values and may be scoped in the Technical Design as additional future event classes; they are not implemented in Slice 9.

---

## Residual Risks

- **`analyses`-based history and dashboard reads remain unfiltered.** Excluded sessions would still appear in compatibility read paths until a future read-surface slice addresses this; Slice 9 documents the residual and does not mitigate it.
- **Dormant primitives are not yet consumed.** Capability without an approved consumer creates operational ambiguity if invoked outside the artifact sequence; Slice 9 reduces that risk by fixing the contract before any implementation slice.
- **Deletion, redaction, and storage cleanup remain future work.** Exclusion is eligibility change only; content persists in full. Physical removal and binary cleanup are explicitly deferred.

---

## Deliverables

| Artifact | Role |
|----------|------|
| **This plan** (`PHASE_1_SLICE_9_PLAN.md`) | Defines slice boundary, scope, non-scope, and exit criteria |
| **Technical Design** (`PHASE_1_SLICE_9_TECHNICAL_DESIGN.md`) | Defines invocation contract detail: consumer boundary, event classes, preconditions, reason mapping, verification obligations — created after plan approval |
| **Migration Plan** (`PHASE_1_SLICE_9_MIGRATION_PLAN.md`) | Created only if the Technical Design identifies a real migration need; not expected for a contract-only slice |
| **SQL Draft** | Not expected at this stage; no executable SQL in Slice 9 |

---

## Exit Criteria

Slice 9 planning is complete when:

1. **This plan is reviewed and approved** — scope, non-scope, initial governance event candidate, and residual risks accepted at gate review.
2. **Technical Design is created and reviewed** — invocation contract specified with sufficient precision that a future implementation slice can proceed without semantic decisions at coding time.
3. **No migration unless explicitly justified** — if the Technical Design finds no schema or database change requirement, no Migration Plan or SQL work is authorized.
4. **No implementation started in Slice 9** — no application code, API, UI, production invocation, or operational execution of the exclusion primitives occurs within this slice.

Consumption of the primitives by any workflow remains unauthorized until a future slice grants it through its own artifact sequence and explicit implementation approval.

---

*End of Phase 1 Slice 9 Plan.*
