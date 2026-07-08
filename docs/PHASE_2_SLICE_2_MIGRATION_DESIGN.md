# Phase 2 Slice 2 Migration Design

## Status

**Status:** Draft  
**Phase:** 2  
**Slice:** 2  
**Artifact type:** Migration Design  
**Depends on:** `PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md` (approved), `PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` (approved)

This is a migration design document only. It contains no SQL, no migration files, and no implementation code. It changes no architecture and authorizes no execution until reviewed and accepted.

---

## Purpose

The Slice 2 technical design activates the governed user deletion request pathway. The pathway requires one persistence capability that does not yet exist: a durable governance record of deletion requests.

The Phase 1 Slice 11 migration assessment explicitly anticipated this: persisting deletion requests as governed records was named as a real future database requirement belonging to a later slice. Slice 2 is that slice. This document defines the migration strategy for that requirement — objectives, categories, integrity principles, and validation obligations — before any SQL is drafted.

---

## Migration Objectives

- **Persist deletion requests as governed records.** Every request that enters the Slice 11 intake boundary is durably recorded — requester identity, resolved scope, request state, timestamps, and outcome — so that governance outcomes are attributable and reviewable, and failed or rejected requests leave an auditable trace.
- **Support the request lifecycle, not the evidence lifecycle.** The migration serves the workflow record of the request itself. The evidence lifecycle (`active`/`excluded`) already has its complete capability from Slice 8 and requires no migration.
- **Additive only.** The migration introduces new structures exclusively. It modifies no existing table, view, function, privilege, or policy.
- **Preserve audit permanence.** Per the Slice 11 residual handling contract, governance records of a request persist by design and are not subject to the exclusion they document.

---

## Existing Database Dependencies

The migration consumes the following as frozen dependencies. None is modified:

- **Slice 8 exclusion primitives** — `public.exclude_scan_record` and `public.exclude_evidence_row`, with reason validation, mandatory transition metadata, and service-role-only execution privilege.
- **Lifecycle-participating tables** — `scan_records` and the four evidence tables, carrying the `active`/`excluded` state model and transition metadata columns from Slices 6–7.
- **Slice 1A eligibility views** — `eligible_scan_records` and the four evidence eligibility views, the persistence-layer expression of the read eligibility contract.
- **Existing RLS posture** — the policy set across `scan_records`, `consent_snapshots`, the evidence tables, and `analyses`, byte-identical before and after this migration.
- **`analyses` compatibility surface** — untouched; its divergence from excluded evidence remains the accepted, documented residual.
- **`consent_snapshots`** — immutable governance records outside the state machine; no reference, propagation, or write.

---

## Required Migration Categories

Categories only; physical form, naming, and shape belong to the SQL draft.

- **Deletion request governance record.** A new structure recording each governed deletion request: the requesting user, the resolved request scope (account-wide, scan-specific, or evidence-specific, per the Slice 11 scope model), the request's own workflow state, submission and resolution timestamps, and the outcome.
- **Request-state vocabulary.** A closed set of workflow states for the request record itself (for example: received, validated, executed, rejected — final vocabulary is a design decision of the SQL draft), distinct from and never conflated with the evidence lifecycle states.
- **Execution linkage.** The means by which an executed request is traceably linked to the session(s) it excluded, satisfying the Slice 11 verification obligation that governance outcomes are attributable to their originating request.
- **Access and privilege posture for the new structure only.** Ownership-scoped access for authenticated users to their own requests, and service-role authority for workflow processing — expressed entirely on the new structure. No existing grant or policy changes.

No other category is required. In particular, no migration category exists for the evidence tables, the primitives, the eligibility views, or any read surface.

---

## Data Integrity Principles

- **Two state models, never conflated.** The request record's workflow state and the evidence lifecycle state are separate models; no migration structure may blur them or allow one to masquerade as the other.
- **Requests are append-oriented governance evidence.** Request records are created and progressed, never repurposed or deleted; a rejected request is a permanent record, not a discarded row.
- **No orphaned execution.** An executed exclusion under this pathway must be linkable to exactly one originating request; the structure must not permit an execution record without a request.
- **Ownership is explicit.** Every request record is bound to the account that owns the affected records, consistent with the Slice 11 verified-ownership intake rule.
- **Evidence data is untouched.** The migration writes no row, column, or constraint on any lifecycle-participating table; evidence payloads, storage references, and transition metadata are outside its write surface.
- **Reason taxonomy is not restated.** The closed reason taxonomy remains enforced solely inside the Slice 8 primitives; the new structure records outcomes, it does not re-implement enforcement.

---

## Forward-Only Migration Strategy

Consistent with the strategy applied in Phase 1 and Slice 1A:

- **Additive changes only.** New structures are introduced; nothing existing is altered, renamed, or dropped.
- **No destructive statements.** The migration contains no data deletion, truncation, or backfill against existing tables.
- **Dormant on arrival.** Immediately after execution, the new structure is empty and unconsumed; no application code writes to it until the gated implementation step that introduces the workflow. Post-migration data state of all existing tables is identical to pre-migration state.
- **Preflight verification.** The migration verifies its preconditions (expected dependencies present, no naming collisions) before applying, following the Slice 1A precedent.
- **Single reviewed unit.** The Slice 2 migration ships as one reviewed, individually gated migration; discovered additional needs return to design rather than expanding the unit.

---

## Rollback Philosophy

Governance approach only:

- **Correction moves forward.** Consistent with the forward-only principle established across Phase 1 and Phase 2, an erroneous migration is corrected by a new, reviewed, forward migration — not by rolling back an applied one.
- **Governance records are never rolled back once populated.** After the structure carries real request records, removal would destroy audit evidence; any structural correction must preserve recorded governance history.
- **Pre-consumption reversal is a governance decision, not a routine tool.** Because the structure ships dormant, removing an unconsumed structure is technically low-risk but still requires its own reviewed decision; it is never performed ad hoc.
- **Rollback of executed exclusions does not exist.** Nothing in this migration or its reversal semantics creates any path from `excluded` back to `active`; the terminal state contract is untouched by design.

---

## Validation Requirements

The migration execution report must demonstrate:

- **Structure created as designed** — the new structure exists in the target schema with the shape approved in the SQL draft.
- **Privilege posture verified** — access on the new structure matches the approved posture; `anon` holds no access; service-role and ownership-scoped access are confirmed by catalog inspection.
- **Existing RLS posture unchanged** — the full policy set on all pre-existing tables is byte-identical to the pre-migration baseline.
- **No existing object modified** — tables, views, functions, constraints, and grants outside the new structure show no diff against the pre-migration baseline.
- **No production data changed** — every row in every lifecycle-participating table remains in its pre-migration state; the new structure is empty.
- **Capture regression baseline** — a full capture through `POST /api/scan` behaves identically before and after the migration.
- **Build integrity** — `npm run build` passes after any accompanying repository change.

---

## Risks

- **Scope model rigidity.** The Slice 11 scope model admits three request scopes; a structure that encodes scope too narrowly will force schema churn when scan-specific or evidence-specific requests are implemented. The SQL draft must represent scope without foreclosing the contract's full range.
- **State vocabulary lock-in.** The request-state vocabulary becomes a governance surface once populated; a poorly chosen closed set forces awkward forward migrations. The vocabulary must be reviewed as a contract, not a detail.
- **Privacy surface of the request record itself.** The structure records who asked to delete what — governance metadata with its own sensitivity. Access posture errors here disclose deletion intent; this is why the privilege posture is a named validation requirement.
- **Audit permanence versus account deletion.** Request records persist by design, including for accounts whose evidence is excluded. This tension is inherited from the Slice 11 residual contract and must remain documented, not silently resolved by the migration.
- **Dormancy discipline.** The structure ships unconsumed; a premature write path introduced outside the gated implementation step would bypass the review sequence. Dormancy on arrival is a verified condition, not an assumption.

---

## Out of Scope

This migration design excludes:

- **No SQL and no migration files** — physical form belongs to the subsequent SQL draft artifact.
- **No changes to existing tables, views, functions, constraints, or grants** — including `scan_records`, the evidence tables, `analyses`, `consent_snapshots`, the eligibility views, and the exclusion primitives.
- **No RLS changes on existing tables** — policy work is confined to the new structure only.
- **No primitive invocation** — the migration executes no exclusion and changes no lifecycle state.
- **No API, UI, or application code** — workflow implementation is a separate gated step.
- **No physical deletion, redaction, or storage cleanup** — per the Slice 12 boundary.
- **No new lifecycle states, transitions, or reasons** — the evidence state machine and taxonomy are consumed as frozen.
- **No analytics, performance, or security redesign** — per the Slice 2 implementation plan exclusions.
- **No MotionForge or cross-project artifacts.**

---

## Exit Criteria

This migration design is complete, and the Slice 2 SQL draft may begin, when:

1. **The single migration requirement is accepted** — the deletion request governance record, and nothing else, is confirmed as the full persistence scope of Slice 2.
2. **The migration categories are approved** as the complete category set: governance record, request-state vocabulary, execution linkage, and new-structure-only access posture.
3. **Data integrity principles are accepted as binding** on the SQL draft, including the separation of request workflow state from evidence lifecycle state.
4. **The forward-only strategy and rollback philosophy are accepted**, including dormant shipping and the prohibition on rolling back populated governance records.
5. **Validation requirements are accepted** as the migration execution report's obligations.
6. **No SQL has been drafted and no database change has occurred** during this design step.

---

*End of Phase 2 Slice 2 Migration Design.*
