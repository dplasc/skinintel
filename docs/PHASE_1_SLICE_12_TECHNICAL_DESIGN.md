# Phase 1 Slice 12 Technical Design — Storage and Binary Retention Boundary

## Status

**Status:** Draft — pending review  
**Phase:** 1  
**Slice:** 12  
**Depends on:** Slices 1–11 (`PHASE_1_SLICE_12_PLAN.md` approved)  
**Artifact type:** Technical Design  
**Implementation scope:** none

---

## Purpose

This document defines the future governance boundaries for stored binaries and storage references after lifecycle exclusion or deletion request governance events: what persists, what may become eligible for cleanup, and what must never be acted on blindly.

This slice does not delete binaries and does not implement cleanup. No storage action, automation, or provider change is authorized. Its purpose is to prevent a future storage cleanup slice from deciding retention semantics at implementation time.

---

## Design Context

- **Slice 8** introduced the governed lifecycle primitives (dormant, database-layer exclusion).
- **Slice 9** defined the governed invocation contract for those primitives.
- **Slice 10** defined the read-surface eligibility boundary.
- **Slice 11** defined user deletion request governance.
- **Storage binaries and references remain unresolved residuals** — explicitly recorded as open in the Slice 11 residual handling contract. This design bounds that residual; it does not resolve it.

---

## Core Boundary

Five distinct layers must never be conflated:

1. **Database lifecycle status** — the `active`/`excluded` state on lifecycle-participating rows.
2. **Storage reference metadata** — database-held pointers (paths, URLs, object keys) to stored objects.
3. **Actual binary/image object** — the stored bytes at the storage provider.
4. **Derived/cache/export/local copies** — thumbnails, CDN artifacts, exports, localStorage and browser copies.
5. **Audit records** — governance evidence of requests and actions, which persists by design.

Binding principle: **lifecycle exclusion is not the same as physical binary deletion.** Excluding a database row changes eligibility only; the referenced binary, its derived variants, and all secondary copies persist until a separately governed cleanup action addresses them.

---

## Evidence Storage Categories

### Scan skin images

User skin photos used as scan evidence.

- **Retention sensitivity:** highest — personal, biometric-adjacent imagery with the strongest privacy expectations.
- **Downstream dependency:** analysis derivation, history detail, potential future verification of past analyses.
- **Cleanup eligibility considerations:** primary candidates for cleanup after governed exclusion and deletion request handling, subject to audit and recovery constraints.
- **Why not treated as row exclusion:** the binary carries privacy weight independent of the database row; excluding the row neither removes the image nor discharges the user's deletion expectation.

### Product images

Product packaging or cosmetic product photos.

- **Retention sensitivity:** lower — typically non-personal subject matter, though ownership and context still bind them to a user session.
- **Downstream dependency:** product identification, mention evidence, potential re-verification.
- **Cleanup eligibility considerations:** may justify longer retention or different eligibility rules than skin photos.
- **Why not treated as row exclusion:** the same binary category may serve non-personal reference purposes; blanket coupling to row exclusion would over-delete or under-delete depending on context.

### OCR label images

Ingredient label / INCI photos used for extraction or verification.

- **Retention sensitivity:** low-to-moderate — label content is non-personal, but capture context belongs to a user session.
- **Downstream dependency:** ingredient extraction provenance; the evidential basis for OCR-derived analysis input.
- **Cleanup eligibility considerations:** deleting the label image removes the ability to re-verify extraction correctness; retention may be justified while derived analysis remains referenced.
- **Why not treated as row exclusion:** the image is verification evidence for derived data that may outlive the row's active eligibility.

### Derived image variants

Thumbnails, optimized versions, webp conversions, previews, crops, masks, or future heatmap overlays.

- **Retention sensitivity:** inherits the sensitivity of the original (a skin photo thumbnail is still a skin photo).
- **Downstream dependency:** UI rendering surfaces, caching layers.
- **Cleanup eligibility considerations:** may be evaluated separately from originals — derived variants can often be cleaned earlier and regenerated if needed.
- **Why not treated as row exclusion:** derived variants are frequently unreferenced by database rows at all; row-level exclusion cannot see them.

### Non-storage residuals

Exports, localStorage copies, CDN/cache artifacts, backup copies, logs, and audit references.

- **Retention sensitivity:** varies; partially outside direct system control (user devices, downloaded exports).
- **Downstream dependency:** none required by the system; audit references are required by governance.
- **Cleanup eligibility considerations:** each requires its own future handling contract; none is addressed by primary storage cleanup.
- **Why not treated as row exclusion:** these copies exist outside the database's authority entirely; no row transition can affect them.

---

## Storage Reference Governance

Before any future system acts on a storage reference, it must be able to establish:

- **Evidence type** — which storage category the referenced object belongs to.
- **Owning user/session/scan** — the ownership chain binding the object to governance.
- **Lifecycle status of linked evidence** — whether the referencing rows are `active` or `excluded`.
- **Object class** — whether the reference points to an original, derived, temporary, cached, or exported object.
- **Continued need** — whether the object is still required for audit, legal, technical recovery, or user-facing history purposes.
- **Deletion request applicability** — whether the object falls within the scope of a governed deletion request under the Slice 11 contract.

Binding rule: **storage reference eligibility does not automatically mean binary deletion authority.** A reference may be eligible for evaluation while the binary remains blocked from cleanup by audit, recovery, or dependency constraints.

---

## Binary Retention States

Future conceptual retention states, in governance terms only (no database enums, no SQL):

- **`retained_active`** — the binary supports active evidence; retention is required and cleanup is not a question.
- **`retained_excluded`** — linked evidence is excluded, but the binary is retained pending governed evaluation; this is the default state immediately after lifecycle exclusion.
- **`deletion_requested`** — the binary falls within the scope of a governed deletion request; evaluation for cleanup is mandatory, not optional.
- **`cleanup_eligible`** — all eligibility rules are satisfied; a future governed cleanup action may proceed.
- **`cleanup_blocked`** — an audit, legal, recovery, or dependency constraint prevents cleanup despite exclusion or request; the block reason must be explicit.
- **`cleanup_completed`** — a governed cleanup action removed the primary binary; the state and its verification record persist as governance evidence.
- **`unknown_or_unclassified`** — the object cannot be confidently classified or linked; unclassified objects must never be deleted, and their existence is itself a finding for future inventory work.

---

## Cleanup Eligibility Rules

Conceptual rules a future implementation must satisfy before any binary becomes `cleanup_eligible`:

- Linked evidence is excluded, or the binary is covered by deletion request governance under the Slice 11 contract.
- No active read-surface dependency remains, per the Slice 10 eligibility contract.
- No required audit or legal retention block remains.
- No required recovery window remains.
- Derived binaries may be evaluated separately from originals, and may become eligible earlier.
- Product and OCR evidence may have different retention behavior than skin photos; category-specific rules take precedence over blanket rules.
- Local, export, and cache residuals require separate handling and are never satisfied by primary storage cleanup.

Exclusion alone is necessary but not sufficient: eligibility is the conjunction of all applicable rules.

---

## Non-Goals

- **No migration**
- **No SQL draft**
- **No app code**
- **No API implementation**
- **No storage provider implementation**
- **No binary deletion**
- **No cleanup jobs**
- **No RLS changes**
- **No lifecycle primitive invocation**
- **No localStorage cleanup implementation**
- **No user-facing UI behavior**

---

## Future Implementation Requirements

A future storage cleanup slice must decide, through its own artifact sequence, before touching storage:

- **Storage inventory model** — how the system enumerates and classifies existing objects, including unreferenced ones.
- **Reference ownership** — the authoritative mapping from objects to users, sessions, and evidence rows.
- **Provider abstraction** — the boundary between application responsibility and storage provider behavior.
- **Retention policy** — concrete durations and conditions per storage category.
- **Deletion authority** — who or what may execute cleanup, under which governed workflow.
- **Recovery/audit policy** — what must survive cleanup and for how long.
- **Export/cache/local residual handling** — explicit contracts for copies outside primary storage.
- **Operational safety checks** — pre-flight validation, dry-run capability, and blast-radius limits.
- **Execution reporting** — verifiable evidence of what was cleaned, when, and under which authority.

---

## Risks and Open Questions

- **Orphaned binaries** — objects with no database reference may already exist and are invisible to row-based governance.
- **Hidden persistence after database exclusion** — users and operators may assume exclusion removed images that fully persist.
- **Premature deletion** — removing binaries too early could break audits, history verification, or dispute resolution.
- **CDN/cache delay** — edge copies may survive primary cleanup for their own TTLs.
- **Backups** — backup sets retain deleted binaries on their own schedules; completeness claims must account for backup cycles.
- **localStorage/browser copies** — outside system authority; can only be addressed by a future client-side slice.
- **Exported PDFs/files** — user-downloaded artifacts are permanently outside system control.
- **Derived thumbnails or optimized copies** — may be unreferenced and missed by reference-driven cleanup.
- **Product/OCR vs. skin image sensitivity** — a single blanket policy would either over-retain personal imagery or over-delete reference imagery.
- **Provider lock-in** — cleanup semantics (soft delete, versioning, lifecycle rules) differ per provider; the abstraction choice constrains future portability.

---

## Acceptance Criteria

This design is accepted when:

- Storage binary retention is separated from lifecycle exclusion as a distinct governed concern.
- All image/storage categories are explicitly named and individually assessed.
- Cleanup eligibility is conceptual only — no mechanism, schedule, or automation is defined.
- No implementation or SQL is introduced by this slice.
- Future slices have a clear boundary for storage cleanup planning.

---

## Final Decision

Slice 12 remains planning/design-only and creates no runtime behavior. Binaries, references, and all secondary copies persist unchanged. Any storage cleanup, inventory, or retention enforcement requires its own future slice operating under this boundary together with the Slice 9, 10, and 11 contracts.

---

*End of Phase 1 Slice 12 Technical Design.*
