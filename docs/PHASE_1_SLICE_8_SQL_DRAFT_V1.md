# Phase 1 Slice 8 — SQL Draft V1

This draft follows the approved:

- `PHASE_1_SLICE_8_PLAN.md`
- `PHASE_1_SLICE_8_TECHNICAL_DESIGN.md`
- `PHASE_1_SLICE_8_MIGRATION_PLAN.md`

This is a design document. It describes the planned SQL migration for the governed exclusion transition primitive at the level of content, order, and expected outcome. It contains **no executable SQL**; executable DDL may be written only after this draft is approved (Section 7).

---

## Status

**Status:** Draft V1 — pending approval
**Phase:** 1
**Slice:** 8
**Depends on:** Slice 8 Plan (approved), Slice 8 Technical Design (approved), Slice 8 Migration Plan (approved), Slice 7 closure (Execution Report)
**Artifact type:** SQL Draft (precedes executable SQL, execution approval, and Execution Report)
**Migration file target:** `supabase/migrations/<timestamp>_phase_1_slice_8_governed_exclusion_transition_primitive.sql`

---

## 1. Purpose

This document describes the planned SQL migration that introduces the governed exclusion transition primitive designed in the Slice 8 Technical Design. It fixes, at review level, what the migration will contain, how it will be validated, in what order it will execute, and what state the database must be in afterward.

The migration is the first in Phase 1 to ship behavior-capable database objects rather than schema surface. Its defining property, carried from the Migration Plan, is **dormant shipping**: the migration creates capability and restricts authority, and does nothing else. No schema changes, no data changes, no invocation surface.

## 2. Planned Migration Contents

The migration will comprise exactly two content groups, applied as a single forward-only unit:

- **Creation of governed exclusion primitives.** The two primitives approved in the Technical Design (Section 2) are created in their finalized physical form:
  - the session-level exclusion action — transitions a scan session `active` → `excluded` and propagates exclusion to its lifecycle-participating child evidence rows, children before session anchor, within a single all-or-nothing transaction;
  - the subordinate child-level exclusion action — transitions exactly one evidence row in one of the four evidence tables, leaving the session anchor and siblings unchanged.

  Both primitives internally enforce the complete governance contract: source state `active` only; target `excluded` only and not caller-selectable; terminal exclusion; mandatory reason validated against the closed four-value taxonomy (`user_deletion_request`, `consent_withdrawal`, `administrative_invalidation`, `session_propagated_exclusion`); mandatory transition timestamp; re-exclusion rejected without overwriting original metadata; already-excluded children skipped during propagation; full rejection of invalid transitions with no partial writes; no mutation of payloads, `consent_snapshots`, or `analyses`.

- **Execution privilege configuration.** Within the same migration unit, execution privilege on both primitives is granted to the established service-role posture only and explicitly withheld from all client-facing roles (`anon`, `authenticated`). Per the Migration Plan, the capability must never exist in an unrestricted state, even transiently; privilege configuration is therefore inseparable from primitive creation, not a follow-up step.

Explicitly absent from the migration, by binding decision:

- **No schema modifications.** No table, column, constraint, FK posture, index, or comment on any existing object is created, altered, or dropped.
- **No data modifications.** No row is inserted, updated, or deleted in any application table. No transition is executed. All rows in all lifecycle-participating tables remain `active` with null transition metadata.

## 3. Planned Validation

Validation is organized into six groups, mapping to the Technical Design verification contract (Section 9) and the Migration Plan validation strategy (Section 6). Concrete queries are written together with the executable SQL after this draft is approved; their results are recorded in the Execution Report.

1. **Primitive existence.** Both primitives are present in the target schema in the approved shape, confirmed by catalog inspection.
2. **Privilege verification.** Execution privilege is held by the service-role posture only; `anon` and `authenticated` demonstrably hold no execution privilege, confirmed by catalog inspection.
3. **Dormant shipping verification.** Post-migration data state is identical to the pre-migration baseline: every row in every lifecycle-participating table remains `active` with null `status_reason` and null `status_changed_at`. Behavioral verification of the primitives (legal transition, propagation, metadata recording, re-exclusion rejection, invalid-reason rejection) is exercised only in an isolated validation setup or a transaction-rollback context; no verification activity commits a state change to production rows.
4. **Schema compatibility.** Zero diff against the pre-migration baseline for all existing schemas: evidence tables, session anchor, `consent_snapshots`, `analyses`, all payload columns, all constraints, and all FK postures.
5. **RLS verification.** The full policy set across all six Evidence Layer tables is byte-identical to the pre-migration baseline capture.
6. **Capture regression verification.** A full capture through `POST /api/scan` is indistinguishable from the pre-migration reference capture across all write targets and response shapes.

## 4. Planned Execution Order

The high-level sequence, inherited from the Migration Plan (Section 4):

1. **Record the pre-migration baseline** — live schema state, RLS posture, execution-privilege posture, and data state — and confirm Slice 7 closure against the live catalog. Any discrepancy halts the sequence.
2. **Apply the single forward migration** — primitive creation and privilege restriction as one unit, in the established migration file naming convention.
3. **Run post-migration validation** — all six validation groups (Section 3) against the recorded baseline.
4. **Perform capture regression verification** — full capture through `POST /api/scan` compared to the pre-migration reference.
5. **Observe production capture traffic** for the defined window, then close the migration with the Execution Report.

No step begins before the prior step's gate passes. No primitive is invoked against production data at any point in this sequence.

## 5. Expected Post-Migration State

After successful execution and validation:

- **The primitives exist.** Both governed exclusion primitives are present in the target schema in their approved form.
- **Execution is restricted.** Only the service-role posture can execute them; client-facing roles cannot, and the restriction has held since the moment of creation.
- **All rows remain `active`.** Every row in `scan_records` and the four evidence tables carries the same lifecycle state it had before the migration.
- **Transition metadata is unchanged.** `status_reason` and `status_changed_at` remain null on every row in every lifecycle-participating table.
- **No production transition has been executed.** The `excluded` state remains unoccupied; the capability exists but has never been exercised against production data.

The database differs from its pre-migration state in exactly one respect: a governed, dormant, service-role-only capability now exists. Everything else — schema, data, RLS posture, capture behavior, read paths — is demonstrably identical.

## 6. Out of Scope

Binding per the Slice 8 Plan (Section 5), Technical Design (Section 10), and Migration Plan (Section 8):

- **No UI changes** of any kind.
- **No API changes** — no endpoints, no request/response shape changes, no public deletion surface.
- **No application code** — no route, service, or client code written or modified; the `POST /api/scan` dual-write sequence is untouched.
- **No deletion** — no physical row deletion; no transition executed against production data.
- **No redaction** — no payload stripping or content mutation.
- **No storage cleanup** — no storage object or binary removal.
- **No superseded workflow** — `superseded` remains schema-defined and unreachable.
- **No governance event tables** — auditability remains bounded to `status_reason` and `status_changed_at`.
- **No RLS changes** — no policies added, removed, or altered on any table.
- **No triggers** — no automatic enforcement attached to table writes.
- **No scheduled jobs** — no automation, schedule, or background process.
- **No read-path changes** — history and dashboard continue to read `analyses` exclusively and unfiltered; the accepted residual stands.
- **No schema modifications and no data modifications** of any kind (Section 2).
- **No `consent_snapshots` changes and no `analyses` changes.**
- **No rollback migration versioned or shipped** — forward-only posture per the Migration Plan (Section 7).

## 7. Approval Gate

This draft authorizes nothing by itself. The gated sequence is:

1. **SQL Draft V1 review** — this document is approved or revised.
2. **Executable SQL drafting** — the executable migration may be written **only after this draft is approved**, as a mechanical transcription of the contents fixed here and in the approved upstream artifacts. Any deviation requires a revised draft.
3. **Execution approval** — explicit, separate authorization to apply the migration to the target environment.
4. **Execution** — the migration file is created in `supabase/migrations/` under the established naming convention and applied once, forward-only.
5. **Validation** — all six validation groups (Section 3) executed and recorded; capture regression verified.
6. **Production observation window** — capture traffic observed per the Migration Plan.
7. **Execution Report** — closes the migration and the slice. Consumption of the primitives by any workflow remains unauthorized until a future slice grants it through its own artifact sequence.

No transition is executed against production data at any point in this slice. The migration changes governance capability, not data state.

---

*End of Phase 1 Slice 8 SQL Draft V1.*
