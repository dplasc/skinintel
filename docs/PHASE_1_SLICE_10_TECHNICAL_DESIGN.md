# Phase 1 Slice 10 Technical Design — Read-Surface Eligibility Boundary

## Status

**Status:** Draft — pending review  
**Phase:** 1  
**Slice:** 10  
**Depends on:** `PHASE_1_SLICE_10_PLAN.md` (approved), Slice 9 Execution Report  
**Artifact type:** Technical Design (design only; no implementation authorization)

---

## Design Purpose

This document defines how lifecycle exclusion state should affect future read eligibility. It establishes the contract that a later implementation slice must satisfy when making read surfaces lifecycle-aware.

Slice 10 does not change any read path. No code, SQL, migration, RLS, API, UI, or read-path implementation is authorized. Its purpose is to prevent future read-side work from deciding visibility semantics at coding time — mirroring, on the read side, what Slice 9 fixed on the write side.

---

## Existing Read Surface Boundary

The current compatibility read surfaces in scope for this contract are:

- Dashboard latest analysis
- History list
- History detail
- Analysis-derived views
- Compatibility surfaces backed by `analyses`

All of these currently read without lifecycle awareness: they would surface records regardless of `active` or `excluded` state. Slice 10 does not change these surfaces; they continue to behave exactly as they do today.

---

## Eligibility Principle

- **Lifecycle state controls eligibility.** The lifecycle state established by Slices 6–8 is the authoritative input to future read eligibility decisions.
- **Excluded records must not be treated as normal active evidence** in future read behavior. An `excluded` row is ineligible for presentation as a normal, current, user-facing result.
- **Read eligibility is not deletion.** Rows persist in full.
- **Read eligibility is not redaction.** Payload content is not altered.
- **Read eligibility is not storage cleanup.** Binary and storage references are untouched.
- **Read eligibility must not mutate source evidence or `analyses`.** Eligibility is evaluated at read time; it never writes.

---

## Surface-by-Surface Contract

Contract level only. No implementation choice is made in Slice 10.

- **Dashboard latest analysis.** Future implementation should prevent an excluded session from being presented as the active/current latest result. How the surface behaves when the latest session is excluded (show prior active session, empty state, or annotated state) is a future implementation decision.
- **History list.** Future implementation should prevent excluded sessions from being listed as normal active history entries. Whether they are omitted or shown in a degraded/annotated form is deferred.
- **History detail.** Future implementation should prevent an excluded session from rendering as a normal active detail view. Direct-access behavior (not found, annotated state, or restricted view) is deferred.
- **Analysis-derived views.** Future implementation should prevent derived views from treating excluded sessions or excluded child evidence as active inputs. Derivation-invalidation semantics are deferred.
- **`analyses` compatibility surface.** Compatibility `analyses` reads may require filtering, status annotation, or a future migration away from compatibility reads entirely. Slice 10 selects none of these; it only requires that a future implementation slice make the choice explicitly and verify it.

---

## Child Evidence Eligibility

- **Excluded child evidence must not contribute to future active evidence interpretation.** Once a child evidence row is `excluded`, it is ineligible as input to any surface presenting active evidence.
- **Child-level exclusion does not automatically hide the entire session.** A session with one or more excluded children remains eligible unless a future design decides that the derived analysis is invalidated by the exclusion.
- **Degraded visibility / invalidated-analysis behavior remains a future implementation decision.** Slice 10 defines only the eligibility boundary, not the presentation outcome.

---

## Session Eligibility

- **Excluded scan records should be ineligible for normal active history and dashboard surfaces** in future read behavior.
- **Exact user-facing handling is deferred** — omission, annotation, or degraded presentation is decided by the future implementation slice under this contract.
- **No deletion or payload mutation occurs.** Session eligibility is a read-time evaluation only; the excluded row and its evidence persist unchanged.

---

## Compatibility Analyses Residual

`analyses` rows are a legacy/compatibility read surface. They may not have full lifecycle linkage yet: an `analyses` row is not guaranteed to carry or reference the lifecycle state of its originating session.

Slice 10 does not mutate or migrate `analyses`. The known residual — excluded sessions remaining visible through `analyses`-backed reads — persists through this slice, now bounded by an explicit contract.

Future implementation must decide whether to filter, annotate, or replace compatibility reads, and must document and verify that decision. Silent continuation of unfiltered compatibility reads after exclusion becomes possible is not an acceptable end state.

---

## Verification Obligations

A future implementation slice acting under this contract must verify:

- **Active records still appear normally** on every surface in scope — no regression for `active` lifecycle state.
- **Excluded sessions do not appear as normal active records** wherever the eligibility contract applies.
- **`analyses` residual behavior is explicit and tested** — whichever choice is made (filter, annotate, replace), it is deliberate and covered by verification.
- **No source evidence payloads are mutated** by any read-eligibility mechanism.
- **No storage cleanup occurs** as a side effect of eligibility handling.
- **No localStorage behavior is silently changed.**

Verification obligations belong to the future implementing slice. Slice 10 defines them but does not implement them.

---

## Explicit Non-Changes

Slice 10 makes no runtime or database change:

- **No app code**
- **No API change**
- **No SQL**
- **No migration**
- **No RLS**
- **No deletion**
- **No redaction**
- **No storage cleanup**
- **No localStorage handling**
- **No UI redesign**
- **No product feature**

The Slice 8 primitives remain dormant; no consuming workflow or invocation is authorized by Slice 10.

---

## Migration Assessment

No migration is required for Slice 10.

Read eligibility is defined here as a contract over existing lifecycle state; it requires no schema, function, privilege, RLS, or data-state change at design time. A migration would only arise if a future implementation slice chooses to replace or structurally link compatibility `analyses` reads — that decision, and any resulting Migration Plan, belongs to that future slice.

For Slice 10, no Migration Plan and no SQL Draft are expected.

---

## Final Technical Decision

Slice 10 should proceed as a design-only read eligibility contract: no code, no SQL, no migration, no read-path change.

The correct next artifact after review approval is an Execution Report, not a Migration Plan, unless review finds a real database requirement. If approved as written, Slice 10 closes as a contract-only design slice, and any read-surface implementation requires its own future slice operating under this contract.

---

*End of Phase 1 Slice 10 Technical Design.*
