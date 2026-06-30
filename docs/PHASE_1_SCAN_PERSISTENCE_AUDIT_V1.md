# Phase 1 — Scan Persistence Audit V1

## Purpose

This document records the formal read-only audit of SkinIntel's current scan persistence **write** and **read** paths, conducted against the transitional architecture defined in **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/PHASE_1_CURRENT_PERSISTENCE_MAPPING_V1.md**, and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**.

The audit establishes current-state reality before any Phase 1 persistence implementation. It does not define schema, APIs, migrations, or UI changes.

---

## Audit Scope

### Inspected files

| File | Inspected |
|------|-----------|
| `app/api/scan/route.ts` | Yes |
| `app/(dashboard)/(homes)/dashboard/page.tsx` | Yes |
| `app/(dashboard)/(homes)/history/page.tsx` | Yes |
| `app/(dashboard)/(homes)/history/[id]/page.tsx` | Yes |

### Out-of-scope reference

`getLatestAnalysis()` in `app/actions` was **not** in the strict file scope but is referenced in this audit because `dashboard/page.tsx` depends on it for latest-analysis metadata and total count. That server action queries Supabase `analyses` for `id`, `confidence`, and `created_at`.

### Audit method

Read-only code inspection. No files were modified. No runtime testing was performed.

---

## Executive Verdict

| Assessment | Result |
|------------|--------|
| Read-only audit completion | **PASS** — current write/read paths are documented against transitional mapping |
| Phase 1 Evidence Layer boundary compliance | **FAIL** — current implementation violates accepted object boundaries |
| Transitional Hybrid status | **Pre-transition legacy path** — no Scan Record V2, no evidence-first write order, no compatibility-layer semantics |
| Implementation authorization | **None** — this audit does not authorize code or schema changes |

Current delivery persists and reads scan sessions through a mixed `analyses` artifact. This is consistent with pre-Phase-1 delivery but incompatible with accepted Evidence Layer architecture until transitional hybrid implementation is separately gated and approved.

---

## Current Write Path Findings

**Endpoint:** `POST /api/scan` (`app/api/scan/route.ts`)

### Authentication

- `auth()` is called at request entry.
- Returns 401 if `session?.user` is absent.
- Rate limiting applied via `checkScanRateLimit(userKey)` using email or user id.

### Consent

- **Client-side** (`dashboard/page.tsx`): consent checkboxes must be checked before submit; values sent as `consentMedical` and `consentPrivacy` form fields.
- **Server-side** (`scan/route.ts`): returns 403 if either field is not exactly `"true"`.
- **Persistence:** insert stores `consent_medical: true` and `consent_privacy: true` as **hardcoded booleans**, not as an immutable Consent Snapshot of active scopes at capture time.

### FormData inputs

| Field | Usage |
|-------|-------|
| `consentMedical` | Gate validation |
| `consentPrivacy` | Gate validation |
| `image` | Required; validated as image File, max 5 MB |
| `description` | Optional text; embedded in AI prompt |
| `ingredients` | Optional text; coerced to string; embedded in AI prompt |

### AI invocation

- Image converted to base64 data URL and sent as `image_url` content block to OpenAI (`gpt-4o-mini`).
- Description and ingredients embedded in user prompt text.
- No governed evidence objects or evidence links are passed to inference.

### Supabase insert (`analyses`)

When Supabase environment variables are present, a single row is inserted:

| Field | Source |
|-------|--------|
| `user_email` | Session email |
| `result` | Normalized AI JSON (`intro`, `assessment`, `top5`, `next_steps`, `confidence`, `medical_disclaimer`) |
| `confidence` | Copied from AI JSON |
| `consent_medical` | Hardcoded `true` |
| `consent_privacy` | Hardcoded `true` |
| `model` | Hardcoded `"gpt-4o-mini"` |

Insert errors are logged only; the API returns 200 with AI JSON regardless of persistence outcome.

### Capture input persistence

| Input | Separately persisted? |
|-------|----------------------|
| Image | **No** — in-memory for inference only |
| Description | **No** — prompt only, discarded |
| Product/ingredient text | **No** — prompt and client scoring only, discarded |

### Mixed artifact

**Yes.** One `analyses` row combines the scan event (user ownership, timestamp, consent flags, model metadata) with the full AI Analysis Result JSON and top-level AI confidence. Scan Record V2 and AI Analysis Result are not separated.

### Transitional write order

**Not implemented.** Actual sequence: validate auth → validate consent → read inputs → call AI → insert mixed `analyses` row → return AI JSON. No Consent Snapshot, Scan Record V2, evidence attachments, or evidence-first sequencing.

---

## Current Read Path Findings

### Dashboard — latest analysis metadata

- `dashboard/page.tsx` calls `getLatestAnalysis()` on mount (via `@/app/actions`).
- Reads `analyses` for `id`, `confidence`, `created_at`, and total row count.
- Powers stat cards and link to `/history/{id}`.
- Does not read `result` for latest-analysis content summary.

### Dashboard — current scan session

- After `POST /api/scan`, AI output is displayed from **in-memory API response** (`scanResult` state), not re-fetched from `analyses`.
- UI shows "Analiza spremljena" after successful API response without verifying Supabase insert succeeded.
- Client-side product scoring runs from `ingredientsInput` and product catalog; not persisted server-side.

### Dashboard — localStorage

- **Key:** `skinintel_last_scan`
- **On mount:** loads saved session and displays "Spremljena analiza" banner if present.
- **On save:** writes `{ savedAt, description, ingredientsInput, scanResult, scoredProducts }`.
- **On load:** restores description, ingredients, scan result, and scored products from device cache.
- Operates in parallel with server `analyses`; not synchronized with Supabase.

### History list (`history/page.tsx`)

- Server component; auth required.
- Queries `analyses` for current user: `id, confidence, model, created_at, result`, ordered descending, limit 50.
- List preview uses `result.intro`.
- Each row is treated as a complete analysis session.

### History detail (`history/[id]/page.tsx`)

- Server component; auth required.
- Single row query by `id` and `user_email`.
- Renders full embedded `result` JSON: `intro`, `assessment`, `top5`, `next_steps`, `confidence`, `medical_disclaimer`.
- Also displays top-level `analysis.confidence`.

### Dependency on `analyses.result`

**Yes.** Server-side history list and detail depend entirely on embedded `result` JSON. No Evidence Layer reads exist.

### localStorage authority

localStorage is not declared authoritative in code, but the dashboard **functionally treats it as a usable session store**: users can save, reload, and continue sessions from device cache containing capture inputs and AI output absent from server history. This violates the architectural requirement that localStorage remain non-authoritative.

---

## Boundary Findings Table

| Boundary item | Status | Finding |
|---------------|--------|---------|
| Scan Record V2 separated from AI Analysis Result | **FAIL** | `analyses` mixes capture session and AI output in a single row. |
| Consent Snapshot exists | **FAIL** | Consent is gate-checked and stored as booleans, not an immutable scope snapshot. |
| Image Evidence exists | **NOT PRESENT** | Image is used for inference and not persisted as governed evidence. |
| User Description Evidence exists | **NOT PRESENT** | Description is prompt-only; not stored server-side. |
| Product Mention Evidence exists | **NOT PRESENT** | Ingredients/product text is prompt/client-scoring only. |
| Routine Mention Evidence exists | **NOT PRESENT** | No routine context capture. |
| Evidence Confidence Posture exists | **NOT PRESENT** | Only AI output confidence exists at row level. |
| Correction Event exists | **NOT PRESENT** | No correction or supersession path; insert-only history. |
| `analyses` treated only as compatibility/read model | **FAIL** | `analyses` is the current canonical server store for writes and reads. |
| localStorage treated as non-authoritative | **FAIL** | Dashboard reads/writes/restores usable sessions from `skinintel_last_scan`. |

**Summary:** 3 FAIL, 7 NOT PRESENT, 0 PASS.

---

## Key Risks

1. **Mixed-artifact persistence is live** — production write path reinforces the prohibited Scan Record V2 + AI Analysis Result merge.

2. **Capture inputs are ephemeral** — image, description, and ingredients are lost after inference; historical sessions cannot be traced to user-origin evidence.

3. **AI confidence is conflated with evidence confidence** — row-level `confidence` reflects AI output certainty, not Evidence Confidence Posture for input quality.

4. **Consent governance gap** — request-time validation exists, but persistence uses hardcoded booleans without immutable Consent Snapshot or audit linkage.

5. **Silent persistence failure** — Supabase insert failure does not fail the API response; UI may indicate success while no row is stored.

6. **Dual server/localStorage paths without authority rules** — `analyses` and `skinintel_last_scan` can diverge with no defined source of truth per concern.

7. **No evidence links** — AI output has no reference to governed evidence objects; orphan inference pattern.

8. **History UI assumes completeness** — history displays AI JSON as the full session record though underlying capture evidence was never persisted.

9. **Transitional hybrid has not started** — no separate Scan Record V2, no compatibility-row semantics, no dual-write governance.

10. **Deletion, correction, and retention are absent** — no Phase 1 governance mechanisms; localStorage retention is ungoverned.

---

## Required Gate Review Before Implementation

**This audit must be reviewed and accepted before any Phase 1 persistence coding begins.**

The read-only audit gate from **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md** is satisfied by this document. Remaining gates that must pass before implementation:

| Gate | Status |
|------|--------|
| Transitional mapping accepted | Requires sign-off (prior document) |
| Read-only audit completed | **This document** |
| Consent snapshot behavior accepted | **Pending** |
| Deletion/retention impact accepted | **Pending** |
| Correction behavior accepted | **Pending** |
| Confidence posture accepted | **Pending** |
| Schema direction approved separately | **Pending** — distinct from this audit |
| Minimal implementation slice approved | **Pending** — after remaining gates |

No Supabase schema changes, persistence code changes, or API refactors are authorized until all applicable gates pass.

---

## Recommended Minimal Next Step

**Create a Phase 1 Gate Review Checklist document** that converts current planning artifacts and this audit into explicit **PASS / BLOCKED / NEEDS DECISION** items for each remaining gate.

That checklist should cover:

- Consent Snapshot behavior definition and acceptance
- Deletion and retention impact per evidence object
- Correction Event supersession semantics
- Evidence Confidence Posture dimensions and assignment rules
- Schema direction approval (separate gate, not implied by audit)
- Minimal implementation slice selection after all planning gates pass

This step is **planning only**. It does not recommend code, SQL, Supabase table creation, or application changes.

---

## Current Decision

**This audit records current reality and confirms that implementation must not proceed until gate review is completed.**

Acceptance of this document means product and architecture agree that:

- The read-only audit of scan persistence paths is complete
- Current implementation is a pre-transition legacy path incompatible with Phase 1 Evidence Layer boundaries
- All boundary findings in the table above accurately describe current delivery
- Implementation remains blocked until remaining Phase 1 gates pass and minimal implementation slice is separately approved

Until gate review completes:

- No Supabase schema changes
- No persistence code changes
- No extension of `analyses` as the long-term Evidence Layer store
- No bypass of constraints in **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md** and **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**

Implementation authorization requires subsequent gate sign-off after the Phase 1 Gate Review Checklist is reviewed and all pending gates are resolved.
