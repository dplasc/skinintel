# Scan Record V2 Transitional Mapping V1

## Purpose

This document maps **Scan Record V2** into the accepted **Transitional Hybrid** persistence direction defined in **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

It translates Phase 1 evidence architecture into a practical transitional model: how the governed capture session anchor relates to current `analyses` persistence, what each concern owns during transition, and what write/read order is intended before any schema, API, or application code work begins.

This is a planning artifact only. It does not define tables, endpoints, migrations, or UI behavior.

Sources: **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

---

## Context

SkinIntel currently persists completed scan sessions through Supabase **`analyses`**. This store supports existing **history** and **dashboard** behavior: users view past sessions, navigate chronological analysis history, and see confidence and model metadata. Current delivery depends on this path.

Current **`analyses`** persistence is a **mixed artifact**. Each row combines the scan event, AI Analysis Result JSON, top-level AI confidence, minimal consent booleans, and session metadata in a single unit. User-provided description, uploaded image, and ingredient/product text are not separately preserved as governed evidence objects.

**docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** selected **Transitional Hybrid (Option C)** as the Phase 1 persistence direction. Option A (extend `analyses`) is rejected. Option B (full dedicated Evidence Layer cutover) is deferred as the immediate entry path.

Under transitional hybrid, **Scan Record V2 must become the future evidence event anchor** — the governed capture session that links Consent Snapshot, attached evidence objects, and Evidence Confidence Posture. AI Analysis Result remains a separate Intelligence Layer artifact linked back to Scan Record V2.

**`analyses` may remain a compatibility/read model during transition.** It continues serving current UI while governed Evidence Layer objects are introduced separately. It must not become the canonical Evidence Layer store.

---

## Scan Record V2 Responsibility

Scan Record V2 is the **central governed capture session** in Phase 1 evidence architecture.

It is:

- The **evidence event anchor** for a single user-initiated capture session
- **Consent-linked** via immutable Consent Snapshot at creation time
- **Append-oriented** — new sessions extend history; prior sessions are not silently overwritten
- **Traceable** — child evidence objects, confidence posture, and corrections link to the session with provenance

It is not:

- An **AI answer** — Intelligence Layer output does not embed inside Scan Record V2
- A **recommendation** — guidance records belong to the Intelligence Layer with evidence links
- A **UI history card** — presentation aggregates are Experience Layer concerns, not evidence objects

Scan Record V2 owns session identity, capture timestamp, references to child evidence objects, session-level Evidence Confidence Posture, and link to Consent Snapshot. It does not own AI analysis results, product resolution, routine models, or learning signals.

---

## Transitional Relationship With `analyses`

During Phase 1 transition:

- **Existing `analyses` remains readable** for current history and dashboard. No immediate read-path disruption is required.
- **Future Scan Record V2 should be introduced separately** — not by extending `analyses` as the long-term evidence store.
- **AI Analysis Result should eventually link to Scan Record V2** as a governed Intelligence Layer artifact with explicit evidence links, not as embedded JSON inside the evidence event.
- **During transition, `analyses` may act as compatibility wrapper or read model** — a denormalized summary row for legacy UI until Evidence Layer read paths are ready.
- **`analyses` must not become the canonical Evidence Layer store.** Personal Evidence Base authority resides in governed evidence objects. Compatibility rows are transitional, not authoritative.

Dual-write during transition is an explicit, governable risk. When both evidence objects and compatibility rows exist, implementation must define which store is authoritative for each concern and prevent drift.

---

## Conceptual Mapping

| Concern | Current location | Future owner | Transitional behavior | Boundary risk |
|---------|------------------|--------------|----------------------|---------------|
| Capture session identity | `analyses` row ID (implicit session) | Scan Record V2 | Legacy rows retain ID; new captures create Scan Record V2 first; compatibility row may reference Scan Record V2 | Treating `analyses` ID as evidence event ID permanently |
| User ownership | `analyses.user_email` | Scan Record V2 (user reference) | Existing rows keep email key; future evidence objects use canonical user reference | Conflating auth identifier with evidence ownership semantics |
| Created timestamp | `analyses.created_at` | Scan Record V2 (capture time) | Preserve as evidence event time; do not overwrite on correction | Using correction time as capture time |
| Consent state | `analyses.consent_medical`, `consent_privacy` (boolean flags) | Consent Snapshot (immutable, scope-linked) | Legacy flags remain readable; new captures write Consent Snapshot before evidence | Treating boolean flags as full Consent Snapshot |
| Uploaded image | In-memory at inference; not persisted server-side | Image Evidence (linked to Scan Record V2) | Current path: image consumed by AI only; future path: persist as governed evidence with metadata | Storing AI observations inside Image Evidence |
| User description | AI prompt input only; not stored server-side | User Description Evidence | Current path: discarded after inference; future path: persist as user-origin evidence | Replacing user voice with AI paraphrase |
| Product/ingredient text | AI prompt + client scoring; not stored server-side | Product Mention Evidence / Routine Mention Evidence | Current path: influences inference only; future path: capture as unverified mentions | Auto-resolving to Product Intelligence in Phase 1 |
| AI result JSON | `analyses.result` | AI Analysis Result (Intelligence Layer, linked to Scan Record V2) | Legacy rows embed JSON in `analyses`; future path: separate artifact with evidence links | Merging AI output into Scan Record V2 |
| AI model | `analyses.model` | AI Analysis Result provenance metadata | Legacy: stored on mixed row; future: belongs to Intelligence artifact only | Storing model on evidence event |
| AI confidence | `analyses.confidence` (top-level) | AI Analysis Result (recommendation certainty) | Legacy: persisted on mixed row; future: separate from Evidence Confidence Posture | Treating AI confidence as input quality posture |
| History list display | Reads from `analyses` (`history/page.tsx`) | Experience Layer (reads Evidence Layer + linked Intelligence outputs) | Transition: continue reading `analyses`; eventual cutover to evidence-first read path | Treating compatibility row as sole source of truth |
| Correction path | Not implemented (insert-only history) | Correction Event (append-oriented supersession) | Legacy rows uncorrectable; future path: governed correction without silent overwrite | In-place edit of historical `analyses` rows |
| Deletion/retention handling | Not implemented; localStorage ungoverned | Evidence Layer governance per object | Legacy rows lack per-object deletion semantics; future path: consent-aware deletion excludes from personalization | Deleting compatibility row without governing evidence objects |

---

## Transitional Write Order

The following describes the **future intended write order** under Transitional Hybrid. This is **conceptual only** — not implementation design, not API contract, not transaction specification.

1. **Validate auth and consent** — Block capture if required consent scopes are not satisfied.
2. **Create Consent Snapshot** — Immutable record of active consent scopes at capture initiation.
3. **Create Scan Record V2** — Governed evidence event anchor for the session.
4. **Attach Image Evidence if present** — Visual capture artifact with metadata; not AI inference.
5. **Attach User Description Evidence if present** — User-origin narrative as authoritative personal experience.
6. **Attach Product Mention Evidence / Routine Mention Evidence if present** — Unverified user-stated context only.
7. **Attach Evidence Confidence Posture** — Input quality, completeness, recency, and source reliability qualification.
8. **Run AI analysis using evidence links** — Intelligence consumes governed evidence; does not replace it.
9. **Store AI Analysis Result linked to Scan Record V2** — Separate Intelligence Layer artifact with evidence references.
10. **Optionally update/write `analyses` compatibility row for current UI** — Denormalized read surface only; non-authoritative for Evidence Layer concerns.

Steps 1–9 establish evidence-first authority. Step 10 is optional transitional convenience and must not reverse write priority or become the canonical persistence path.

---

## Transitional Read Strategy

**Current UI can continue reading `analyses`.** History list and detail views may remain on the compatibility store until Evidence Layer read paths are implemented and validated.

**Future UI should eventually read from Evidence Layer + linked Intelligence outputs.** Scan Record V2 and attached evidence objects become the read source for capture context; AI Analysis Result is retrieved via explicit link, not embedded JSON assumption.

**During transition, compatibility rows must be clearly non-authoritative.** Reads from `analyses` serve legacy and transitional UI only. They must not be treated as the Personal Evidence Base or as proof that governed evidence objects exist.

**Read paths must not hide missing evidence links.** UI and API consumers must not assume that a compatibility row implies Image Evidence, User Description Evidence, Consent Snapshot, or other Phase 1 objects were persisted. Missing links must remain visible to engineering and audit review—not masked by denormalized summaries.

Client **`localStorage`** (`skinintel_last_scan`) remains non-authoritative. It is a transient device cache, not part of the Personal Evidence Base, and must not substitute for server-side evidence reads during or after transition.

---

## Minimal First Technical Slice Candidate

The smallest recommended **future technical slice** after this planning document is accepted:

**Read-only code audit of the current scan persistence path.**

Audit scope:

| Area | Location | Audit focus |
|------|----------|-------------|
| Scan API persistence | `app/api/scan/route.ts` | What is validated, what is sent to AI, what is inserted into `analyses`, what capture inputs are discarded |
| Supabase insert | `analyses` insert in scan route | Fields written, consent representation, mixed-artifact boundaries |
| Dashboard reads | `app/(dashboard)/(homes)/dashboard/page.tsx` | `localStorage` last-scan behavior, dependency on server persistence |
| History reads | `app/(dashboard)/(homes)/history/page.tsx`, `history/[id]/page.tsx` | Query shape, fields consumed, assumptions about row completeness |

This slice is an **audit task only**:

- No code changes
- No SQL
- No table creation
- No API refactor
- No UI redesign

Deliverable: an audit artifact documenting current write/read behavior against this transitional mapping—confirming boundary violations, missing evidence persistence, and dual-path risks (server `analyses` vs client `localStorage`) before any implementation slice is authorized.

---

## Gate Conditions Before Coding

No Phase 1 persistence coding may begin until all applicable gates pass:

| Gate | Requirement |
|------|-------------|
| **Transitional mapping accepted** | This document reviewed and accepted by product and architecture |
| **First technical slice selected** | Read-only audit confirmed as the authorized first slice (or equivalent approved alternative) |
| **Read-only audit completed** | Audit artifact delivered and reviewed; current path documented against mapping |
| **Schema direction approved separately** | Physical persistence design authorized in a distinct gate—not implied by this mapping |
| **Consent snapshot behavior approved** | Consent Snapshot capture, immutability, and scope semantics accepted |
| **Deletion/retention impact approved** | Per-object deletion and retention behavior documented and accepted |
| **Correction behavior approved** | Correction Event supersession semantics and downstream consumption rules accepted |

Additional Phase 1 gates from **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** (object list, object boundaries, confidence posture) remain binding. This document satisfies the **minimal implementation slice selected** planning step when accepted together with ADR Option C.

---

## Current Decision

**This document completes planning for selecting the first read-only technical audit slice. It does not authorize code or Supabase changes.**

Acceptance means product and architecture agree on:

- Scan Record V2 as the future evidence event anchor under Transitional Hybrid
- The conceptual mapping of current `analyses` concerns to future owners
- The intended evidence-first write order and transitional read strategy
- Read-only audit of the current scan persistence path as the recommended first technical slice

Until gates pass and the read-only audit is completed and reviewed:

- No Supabase schema changes
- No persistence code changes
- No extension of `analyses` as the long-term Evidence Layer store
- No bypass of architectural constraints in **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**

Implementation authorization requires subsequent gate sign-off after the read-only audit is delivered and schema direction is separately approved.
