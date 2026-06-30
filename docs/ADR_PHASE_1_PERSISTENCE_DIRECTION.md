# ADR — Phase 1 Persistence Direction

## Status

Accepted draft.

---

## Context

This ADR derives from **docs/IMPLEMENTATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, and **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**.

SkinIntel currently persists completed scan sessions through Supabase **`analyses`**. This store supports existing history and dashboard behavior: users can view past sessions, see confidence and model metadata, and navigate chronological analysis history. The current delivery depends on this persistence path.

Current **`analyses`** persistence is a **mixed artifact**. Each row combines the scan event, AI Analysis Result JSON, top-level AI confidence, minimal consent booleans, and session metadata in a single unit. User-provided description, image capture, and ingredient/product input are not separately preserved as governed evidence objects. This violates Phase 1 boundaries defined in **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

Phase 1 requires **separation of evidence objects from AI output**. Scan Record V2 must anchor the capture session; AI Analysis Result must exist as a linked Intelligence Layer artifact—not embedded inside the evidence event. Consent Snapshot, Evidence Confidence Posture, Correction Event, and other Phase 1 objects require append-oriented semantics that the current mixed model does not support.

An **immediate full rebuild** of persistence would be architecturally clean but operationally risky. It would disrupt working history and dashboard flows, require migration of existing rows before replacement behavior is validated, and increase delivery risk before minimal Phase 1 evidence semantics are proven.

**Extending `analyses` directly** (Option A) would preserve current UI with minimal disruption but would reinforce the mixed-artifact design. Adding columns or JSON sections to the existing table increases the probability of prohibited merges—especially treating the row as both Scan Record V2 and AI Analysis Result—and makes correction, consent snapshot, and deletion semantics harder to enforce.

**docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** evaluated three migration directions. This ADR records the selected direction for Phase 1 persistence evolution.

---

## Decision

SkinIntel will use a **Transitional Hybrid** direction for Phase 1 persistence.

Specifically:

- **Existing `analyses` remains as a compatibility/read model** for current UI during transition. History and dashboard may continue reading from `analyses` while Evidence Layer separation is introduced incrementally.
- **New Evidence Layer objects should be introduced separately** when Phase 1 implementation begins—not by extending `analyses` as the long-term evidence store.
- **New captures should eventually write governed Evidence Layer objects first.** Scan Record V2 and attached Phase 1 evidence objects become the authoritative capture record; persistence flow prioritizes evidence before Intelligence output.
- **AI analysis results should eventually link back to Scan Record V2** as governed Intelligence Layer artifacts with evidence links—not as embedded content inside the evidence event.
- **`analyses` should not be treated as the long-term source of truth for the Evidence Layer.** It may serve as legacy read surface, transitional wrapper, or denormalized compatibility view until cutover is complete. Personal Evidence Base authority resides in governed evidence objects.

This decision selects direction only. It does not define schema, tables, APIs, or implementation sequence beyond architectural intent.

---

## Rationale

### Option A — Extend current `analyses` model

**Rejected.**

Extending the existing table preserves bad boundaries. The mixed row would gain additional responsibilities—evidence references, consent data, child links—while remaining the primary session anchor designed for AI output. This approach makes prohibited merges easier to implement and harder to detect. Correction Event, Consent Snapshot, and Evidence Confidence Posture would likely be approximated within the same artifact rather than modeled as distinct governed objects. Phase 1 gate requirements for object boundaries would be structurally undermined.

### Option B — Full dedicated Evidence Layer cutover

**Deferred.**

A clean cutover to dedicated Evidence Layer persistence aligns best with long-term architecture. However, it carries higher first-implementation risk: existing history becomes unreadable or requires full migration before any new capture path ships; dual-system complexity appears immediately without a compatibility bridge; and delivery disruption to working dashboard/history flows is unacceptable before minimal slice validation. Option B remains the likely end state but is not the preferred Phase 1 entry path.

### Option C — Transitional hybrid

**Accepted.**

Transitional hybrid balances architecture correctness and delivery safety. Governed Evidence Layer objects can be introduced with clean boundaries while `analyses` continues serving current UI as a compatibility layer. Incremental migration becomes possible: map existing rows, validate new write paths, cut over read paths when evidence objects are proven. Dual-write during transition is an explicit, governable risk—not an accidental byproduct of extending the wrong model. This direction honors **docs/IMPLEMENTATION_PLAN_V1.md** phased delivery without freezing the platform on mixed-artifact persistence indefinitely.

---

## Architectural Constraints

The following constraints apply regardless of transitional mechanics:

- **No merging Scan Record V2 with AI output** — Evidence event and Intelligence result remain separate objects with explicit links.
- **No treating AI confidence as Evidence Confidence Posture** — Input quality qualification and recommendation certainty are distinct concerns.
- **No treating consent booleans as full Consent Snapshot** — Immutable scope snapshot at capture time is required; boolean flags alone are insufficient.
- **No treating localStorage as Personal Evidence Base** — Client-side last-scan cache is non-authoritative and ungoverned.
- **No Product Intelligence work in Phase 1** — Product Mention Evidence only; no catalog resolution or Knowledge Layer enrichment.
- **No schema work until minimal implementation slice is separately approved** — This ADR selects direction; it does not authorize Supabase changes.

All constraints in **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md** and Phase 1 Rules in **docs/PHASE_1_EVIDENCE_LAYER_FOUNDATION_V1.md** remain binding.

---

## Impact

**Current history and dashboard can remain functional during transition.** Existing `analyses` reads continue until Evidence Layer read paths are ready. Users are not blocked by architectural migration work in progress.

**Future Evidence Layer can be built cleanly.** New objects follow accepted Phase 1 inventory without inheriting the structural defects of the mixed `analyses` row.

**Migration can be incremental.** Existing rows map to transitional semantics; new captures adopt governed evidence-first write order; cutover proceeds object by object or read path by read path.

**Dual-write risk must be controlled.** When new captures write both evidence objects and compatibility `analyses` rows, implementation must define which store is authoritative for each concern and prevent drift. Transitional dual-write requires explicit governance—not ad hoc duplication.

**`analyses` may become compatibility wrapper or read model.** Long-term, the table may serve denormalized UI convenience, legacy history access, or be retired after migration. It must not remain the canonical Evidence Layer store.

---

## Non-Goals

This ADR does not authorize or scope:

- SQL or Supabase migration design
- Supabase table creation or column changes
- API refactor of scan or history endpoints
- UI redesign of dashboard or history
- Deletion system implementation
- Correction UI or Correction Event persistence
- Full evidence schema definition
- Intelligence Layer separation implementation
- Legacy row migration execution

---

## Next Required Decision

After this ADR is accepted, the next planning step is to **select the minimal implementation slice for Phase 1**.

Recommended minimal slice:

**Create a technical planning document for Scan Record V2 transitional mapping—not code.**

That document should define how transitional hybrid applies in practice: which write path changes first, how `analyses` relates to Scan Record V2 during dual-write, what remains read-only from legacy rows, and what gate must pass before any schema or application persistence work begins.

This slice continues the planning sequence from **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md** without crossing into implementation.

---

## Current Decision

**This ADR selects persistence direction only and does not authorize implementation.**

Acceptance means product and architecture agree that Phase 1 persistence evolution follows Transitional Hybrid (Option C), with Option A rejected and Option B deferred as the immediate entry path.

Until the minimal implementation slice is separately approved and Phase 1 gates pass:

- No Supabase schema changes
- No persistence code changes
- No extension of `analyses` as the long-term Evidence Layer store
- No bypass of architectural constraints listed above

Implementation authorization requires a subsequent gate sign-off after the Scan Record V2 transitional mapping planning document is reviewed and accepted.
