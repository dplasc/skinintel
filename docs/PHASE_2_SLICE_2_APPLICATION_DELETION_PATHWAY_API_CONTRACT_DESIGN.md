# Phase 2 Slice 2 — Application Deletion Pathway API Contract Design

- Status: Draft — API contract design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- API implementation: not authorized
- UI implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future HTTP/API contract** for the governed user-deletion pathway on SkinIntel: authenticated intake, ownership-scoped status and history reads, and separately authorized operator validation and execution operations.

It does **not** authorize implementation of API routes, UI, TypeScript handlers, SQL changes, migration execution, Block A/B, Supabase contact, or DEV/PROD changes.

Persistence vocabulary and database invariants remain controlled exclusively by the committed migration candidate `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`. Trust zones, orchestration boundaries, and F-P2-3 application obligations remain controlled by the accepted Application Deletion Pathway Plan and Technical Design. This contract binds only the future public and operator HTTP surfaces that must be implemented later under separate authorization.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| Artifact | Role |
|----------|------|
| `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Committed persistence contract |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` | Application pathway scope and obligations |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` | Trust, sequences, and component boundaries |
| `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Lifecycle consumer and failure principles |
| `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Exact table/column/state design narrative |
| `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` | Controlled DEV apply and stop rules |
| `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` | DEV gate BLOCKED disposition |
| This document | Future HTTP/API contract only |

### Precedence (binding)

1. **Committed migration contract** — persistence vocabulary, CHECKs, transition rules, deferred consistency, RLS/grants, attribution cardinality.
2. **Accepted Application Deletion Pathway Plan** — application scope, residuals, F-P2-3 obligation, hard stops.
3. **Accepted Application Deletion Pathway Technical Design** — trust zones, sequences, and orchestration responsibilities.
4. **This API Contract Design** — HTTP routes, methods, request/response envelopes, status codes, and actor permissions for the future pathway.
5. **Future implementation** — may not silently change any accepted contract above.

Implementation may not invent scopes, states, resolution codes, attribution operations, or identity sources that conflict with higher-precedence artifacts.

---

## 3. Current API Surface

Read-only inspection of the repository API surface. Claims cite exact paths. No inspected file was modified.

### 3.1 Observed route inventory

| Path | File | Role |
|------|------|------|
| `POST /api/delete-request` | `app/api/delete-request/route.ts` | Deletion stub (see classification below) |
| `POST /api/scan` | `app/api/scan/route.ts` | Authenticated scan intake reference |
| `POST /api/interest` | `app/api/interest/route.ts` | Unauthenticated interest-lead capture |
| `GET|POST /api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` | NextAuth handlers from `auth.ts` |

Naming convention observed: resource/action folders under `app/api/<name>/route.ts` using singular or kebab-case names (`scan`, `interest`, `delete-request`). No existing plural collection route for governance resources.

### 3.2 `app/api/delete-request/route.ts`

| Aspect | Observed behavior |
|--------|-------------------|
| Method | `POST` only |
| Authentication | None; does not call `auth()` |
| Client email | Parses optional `body.email` (string) then discards via `void email` |
| Client message | Parses optional `body.message` then discards via `void message` |
| Validation | None beyond optional typeof checks; JSON parse failures are swallowed (`catch {}`) |
| Persistence | None; no Supabase client; no `deletion_requests` write |
| Rate limiting | None |
| Response | Always `200` with `{ success: true, message: "Delete request received" }`, including after parse failure |

**Classification:** **Unsafe / incomplete / non-authoritative temporary stub.** Not an accepted governed deletion contract. Must not continue as the durable intake authority.

### 3.3 Authentication behavior (repository)

| Path | Observation |
|------|-------------|
| `auth.ts` | NextAuth v5; exports `{ handlers, signIn, signOut, auth }`; Credentials + Google + GitHub |
| `app/api/scan/route.ts` | `const session = await auth()`; rejects without `session?.user` (`401`); additionally requires `session.user.email` for persistence (`401` if absent) |
| `app/actions/index.ts` | Server actions call `auth()` and filter by `session.user.email` |
| `middleware.ts` | Protects only `/dashboard/:path*`, `/history`, `/history/:path*`; **does not** match `/api/*` |
| `proxy.ts` | Explicitly skips paths starting with `/api` |

**Implication for future deletion APIs:** each route must enforce authentication internally; middleware must not be treated as API protection.

### 3.4 Client-supplied email behavior

| Path | Behavior |
|------|----------|
| `app/api/delete-request/route.ts` | Accepts client `email` (unused) — **unsafe pattern** |
| `app/api/interest/route.ts` | Accepts client `email` for lead capture — **unrelated**; must not template deletion identity |
| `app/api/scan/route.ts` | Identity from session email only; no client email field for ownership |

### 3.5 Response and error conventions

Authenticated reference (`app/api/scan/route.ts`):

- Success: direct JSON payload (normalized scan result), typically implicit `200`
- Errors: `{ error: "<user-safe string>" }` with statuses `401`, `403`, `400`, `413`, `429`, `500`
- Some failures additionally expose `failure_stage` for image evidence paths
- Internal detail logged via `console.error`; not returned to client in generic failures

Unauthenticated lead route (`app/api/interest/route.ts`): `{ success: true }` or `{ error: "..." }` with explicit `Content-Type: application/json`.

No shared response/error helper module was found under `lib/`. No `Cache-Control` / `no-store` usage was found in API routes.

### 3.6 Database persistence behavior (current APIs)

| Path | Persistence |
|------|-------------|
| `app/api/delete-request/route.ts` | None |
| `app/api/scan/route.ts` | Server-side `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`; inserts into scan/evidence/analyses tables |
| `app/api/interest/route.ts` | Service-role insert into `interest_leads` |
| `lib/supabase.ts` | Browser anon client (`NEXT_PUBLIC_*` only) — not suitable for governance writes |

### 3.7 Validation and rate limiting

| Path | Observation |
|------|-------------|
| `package.json` | Runtime stack: Next `15.5.7`, NextAuth `5.0.0-beta.29`, `@supabase/supabase-js`, Zod `^3.24.4`, Upstash Redis |
| `lib/zod.ts` | Zod schemas for login/register/password flows; **not** used by deletion stub or scan API body validation |
| `app/api/scan/route.ts` | Manual FormData validation; size limit `5 * 1024 * 1024`; consent gates |
| `lib/rateLimit.ts` | `checkScanRateLimit(userKey)` — Upstash Redis; **10 requests / hour / userKey**; **fail-open** if Redis missing or errors |

### 3.8 Related discoverability (not API contracts)

| Path | Observation |
|------|-------------|
| `app/page.tsx` | Footer link `href="/api/delete-request"` labeled “Delete Request” (GET navigation to POST-only stub) |
| `app/privacy/page.tsx` | Static privacy guidance (email contact); no governed API form |

### Separation of layers

| Layer | Status |
|-------|--------|
| **Current repository behavior** | Stub returns unconditional success; no auth; client email parsed; no durable governance |
| **Accepted future API contract** | Defined in this document |
| **Unresolved decisions** | Section 34 |
| **Implementation prerequisites** | Section 35 |

---

## 4. Contract Design Principles

| Principle | Contract requirement |
|-----------|----------------------|
| Server-derived identity | `user_email` comes only from authenticated session data via `auth()` |
| Deny by default | Unauthenticated and unauthorized callers receive no durable governance effect |
| Least privilege | Users: ownership-scoped reads and intake only; no execution or attribution writes |
| Ownership-scoped reads | Status, history, and direct lookup filter by authenticated owner |
| No service-role credentials in client | Service-role remains server env only; never `NEXT_PUBLIC_*` |
| No client-controlled workflow fields | Clients cannot set `request_state`, `resolution_code`, timestamps, attribution, or operator identity |
| Idempotent intake behavior | Safe replay of successful intake; no blind double durable insert when key/policy allows |
| No blind execution retry | Ambiguous or failed execution requires status re-read and operator review |
| Truthful user messaging | No “everything deleted” claims; residuals remain explicit |
| No PROD testing | PROD denylisted; no PROD contact for this pathway |
| Exact closed database vocabulary | Scopes, states, and resolution codes match the migration exactly |

---

## 5. Route Family Decision

### Evaluation of existing stub

| Item | Decision |
|------|----------|
| Existing path | `/api/delete-request` (`app/api/delete-request/route.ts`) |
| Authority | **Not authoritative** |
| Future treatment | **Replaced** by the governed collection family below; **deprecated** as a user success pathway |
| Compatibility redirect | **Not implemented now**; whether a temporary redirect/410 remains an open decision (Section 34) |
| Dual active contracts | Prohibited — future implementation must not leave two conflicting intake contracts live |

### Accepted future user route family

Repository evidence shows singular kebab/action names (`scan`, `interest`, `delete-request`) and no plural collection precedent. For a durable governance resource with create, current-status, history, and direct lookup, a plural collection family is the clearer HTTP model and avoids collision with the unsafe stub name.

**Accepted future user route family:**

| Operation | Method | Route |
|-----------|--------|-------|
| Submit deletion request | `POST` | `/api/deletion-requests` |
| Current / latest status | `GET` | `/api/deletion-requests/current` |
| Request history | `GET` | `/api/deletion-requests` |
| Direct request lookup | `GET` | `/api/deletion-requests/{requestId}` |

### Accepted future operator route namespace

Operator routes are **clearly separated** from user routes:

| Operation | Method | Route |
|-----------|--------|-------|
| Validate or reject | `POST` | `/api/operator/deletion-requests/{requestId}/validate` |
| Execute | `POST` | `/api/operator/deletion-requests/{requestId}/execute` |

No routes are created by this document. No compatibility behavior is implemented now.

---

## 6. Actor Matrix

| Actor | Permitted operations | Prohibited operations | Authentication source | Credential boundary | Audit requirement |
|-------|----------------------|-----------------------|-----------------------|---------------------|-------------------|
| **Unauthenticated caller** | None on deletion family | Submit, read, validate, execute | None | No session | Attempted auth failure events |
| **Authenticated user** | Submit own request; read own current/history/direct lookup | Validate; execute; set workflow fields; cross-user reads; supply foreign identity | NextAuth session via `auth()` | Cookie session; no service-role | Intake and privileged-error events with correlation id |
| **Authorized operator** | Validate/reject; execute under orchestration; re-read status for review | Browser possession of service-role; post-terminal attribution append; blind retry | Session **plus** separately approved operator authorization | Server-only operator check; service-role used only server-side | Operator identity required on validate/execute |
| **Service / orchestrator** | Server-mediated DB writes under workflow; atomic execution transaction | Client exposure; accepting caller-supplied attribution | Server process credentials | `SUPABASE_SERVICE_ROLE_KEY` server env only | Execution started/completed/failed + attribution counts |
| **Future worker** (if later approved) | Queued work under same invariants only after separate approval | Post-terminal attribution; bypass of atomic execution; independent auth model without review | Separately approved worker identity | Server secrets only | Same audit categories as orchestrator |

---

## 7. Authentication Contract

| Rule | Contract |
|------|----------|
| Session helper | API handlers call the existing `auth()` export from `auth.ts` |
| Canonical identity | Derived from authenticated session data (`session.user.email`) |
| Missing email | Treated as unauthenticated / fail-closed for this pathway (parity with `app/api/scan/route.ts`) |
| Client email | Ignored or rejected; never persisted as requester identity |
| Bearer / service-role from browser | Not accepted |
| Operator auth | Ordinary user session is insufficient; separately approved authorization required |
| Middleware | Absence of `/api/*` protection in `middleware.ts` / skip in `proxy.ts` means **each route enforces auth internally** |

No new auth provider is invented. NextAuth remains the session source.

---

## 8. Canonical User Identity Contract

| Topic | Contract |
|-------|----------|
| Source of identity | `auth()` → `session.user.email` (same pattern as `app/api/scan/route.ts` and `app/actions/index.ts`) |
| Normalization | Ownership comparisons must be case-insensitive-safe; align with migration RLS `lower(user_email)` semantics and scan path normalization `trim().toLowerCase()` in `app/api/scan/route.ts` |
| Ownership comparison | Server compares authenticated email to target row `user_email` and to request ownership |
| Arbitrary `user_email` input | Forbidden on user APIs |
| Cross-user status lookup | Forbidden |
| User-controlled operator identity | Forbidden |
| Incomplete session identity | Fail closed with `401` / `UNAUTHENTICATED`; no durable intake |

---

## 9. Shared Request Metadata

Transport / application metadata (conceptual; **not** new database columns):

| Metadata | Purpose | Persistence |
|----------|---------|-------------|
| Request / correlation identifier | Correlate logs and responses | Logs/telemetry only unless later approved |
| Idempotency key | Safe intake replay when present | Application/transport store; **no** migration column today |
| Authenticated actor | Derived server-side | Persisted as `user_email` on intake only |
| Request timestamp | Server receive time | Logs; DB `requested_at` / `created_at` defaulted by database on insert |
| Client locale | Presentation only if used | Not a governance column |
| Safe user-agent / IP evidence | Abuse analysis if later approved | Logs only; privacy-reviewed |

Transport metadata must not be confused with persistence fields (`request_state`, `resolution_code`, `validated_at`, `resolved_at`, attribution columns).

---

## 10. User Submission Operation

| Aspect | Accepted contract |
|--------|-------------------|
| Route | `POST /api/deletion-requests` |
| Actor | Authenticated user |
| Authentication | Required via `auth()`; email required |
| Content type | `application/json` |
| Success status | `201 Created` on new durable intake; `200 OK` only for approved idempotent replay of an already-created request |
| Safe response fields | See Section 12 |
| Rate-limit posture | Authenticated user-scoped limits required; exact numbers unresolved (Section 27 / 34) |
| Audit events | `deletion_submission_attempted`, `deletion_submission_accepted`, `deletion_submission_rejected`, `deletion_submission_conflict`, `deletion_submission_rate_limited` |

### Allowed request fields

| Field | Notes |
|-------|-------|
| `request_scope` | Exact closed set: `account_wide`, `scan_specific`, `evidence_specific` |
| Scope-compatible target identifiers | See Section 11 |
| Explicit intent confirmation | Application boolean/acknowledgement; not a DB column |
| Idempotency key | Via approved transport mechanism (header preferred; see Section 14) |

### Forbidden request fields

`user_email`, `id`, `request_state`, `resolution_code`, `validated_at`, `resolved_at`, `created_at`, `requested_at`, execution attribution payloads, affected-table values beyond allowed targets, operator fields, lifecycle timestamps, free-text persistence payload (stub `message` is not accepted as durable input).

---

## 11. Submission Scope Payload Matrix

Evidence table whitelist (exact migration vocabulary):

- `user_description_evidence`
- `image_evidence`
- `product_mention_evidence`
- `ai_analysis_evidence`

### `account_wide`

| Aspect | Contract |
|--------|----------|
| Required fields | `request_scope = account_wide`; intent confirmation |
| Forbidden fields | Any target scan/evidence identifiers |
| Target shape | All target columns null at persistence |
| Ownership verification | Authenticated account identity only |
| User-safe validation errors | Invalid scope/shape; missing intent; forbidden fields |
| Persistence mapping | Insert `received` with null targets |
| Attribution expectation | At later execution: one attribution row per excluded session anchor, all in original atomic transaction (F-P2-3) |

### `scan_specific`

| Aspect | Contract |
|--------|----------|
| Required fields | `request_scope`; `target_scan_record_id` (UUID); intent confirmation |
| Forbidden fields | Evidence table/id |
| Target shape | Scan id non-null; evidence columns null |
| Ownership verification | Target session exists and owned by authenticated email |
| User-safe validation errors | Missing target; invalid UUID; ownership mismatch (non-disclosing); forbidden extras |
| Persistence mapping | Insert `received` with scan target only |
| Attribution expectation | Exactly one execution row matching target on successful `executed` |

### `evidence_specific`

| Aspect | Contract |
|--------|----------|
| Required fields | `request_scope`; parent `target_scan_record_id`; `target_evidence_table` (whitelist); `target_evidence_id` (UUID); intent confirmation |
| Forbidden fields | Missing any of the three targets; non-whitelist table |
| Target shape | All three target fields populated |
| Ownership verification | Evidence and parent session owned by authenticated user |
| User-safe validation errors | Invalid matrix; unknown table; ownership mismatch (non-disclosing) |
| Persistence mapping | Insert `received` with full evidence target shape |
| Attribution expectation | Zero session execution rows on `executed` per migration; execution consumer activation for this scope remains a gated later decision |

No scopes or columns may be added.

---

## 12. Submission Success Response

Conceptual safe success body (no TypeScript):

| Field | Meaning |
|-------|---------|
| `id` | Request identifier (UUID) |
| `request_scope` | Accepted scope |
| `presentation_status` | Safe presentation status (Section 18) |
| `received_at` | User-safe received timestamp (`requested_at` mapping) when appropriate |
| `next_step` | Neutral guidance (e.g., status check; no erasure promise) |

Compatibility note: existing scan responses return bare domain JSON without a wrapper. Deletion success may return a direct object (preferred for repository consistency) containing the fields above, optionally accompanied by a correlation identifier field or header.

### Must not expose

Service/operator metadata; internal SQL fields not required by the user; execution rows; internal resolution details; stack traces; SQLSTATE; credentials; service-role values.

---

## 13. Submission Error Responses

| Condition | HTTP | Public error code (conceptual) | User-safe message posture |
|-----------|------|--------------------------------|---------------------------|
| Unauthenticated / missing email | `401` | `UNAUTHENTICATED` | Sign-in required |
| Malformed JSON / wrong content type | `400` | `MALFORMED_REQUEST` | Invalid request |
| Invalid scope | `400` or `422` (see Section 34) | `INVALID_SCOPE` | Invalid request |
| Missing required target | `400` or `422` | `MISSING_TARGET` | Invalid request |
| Forbidden extra / unknown field | `400` or `422` | `FORBIDDEN_FIELD` | Invalid request |
| Ownership mismatch | `404` or non-disclosing `403` (prefer non-existence disclosure posture in Section 25) | `OWNERSHIP_MISMATCH` | Cannot process request |
| Duplicate active request | `409` | `DUPLICATE_ACTIVE_REQUEST` | Request already in progress / already recorded (per policy wording) |
| Already completed (lifecycle) | `409` | `ALREADY_COMPLETED` | Cannot apply; eligibility already removed |
| Rate limited | `429` | `RATE_LIMITED` | Try again later |
| Conflict / concurrency | `409` | `CONFLICT` | Temporary conflict; check status |
| Internal failure | `500` | `INTERNAL_ERROR` | Internal error |
| Ambiguous persistence result | `503` or `409` with status-check guidance | `AMBIGUOUS_RESULT` | Check status; do not assume success |

Do not expose database constraint names or SQLSTATE.

---

## 14. Idempotency Contract

| Topic | Constraint |
|-------|------------|
| Transport location | Prefer `Idempotency-Key` HTTP header for `POST /api/deletion-requests`; body key alternative remains unresolved if header proves incompatible with clients |
| Key format principles | Opaque caller-generated string; bounded length; non-secret; unique per intended intake attempt |
| Caller ownership | Key scoped to authenticated user; cross-user key reuse must not return another user’s request |
| Same key + same payload | Return prior safe success (`200`) with original request id |
| Same key + different payload | Conflict (`409` / `IDEMPOTENCY_KEY_REUSE_MISMATCH`); no second durable row under that key |
| Key expiry posture | Unresolved; must be defined before implementation (TTL / store medium) |
| Network timeout recovery | Client re-reads current status; server does not treat ambiguity as new execute |
| Duplicate browser submission | UI disable-on-submit + server key/fingerprint |
| Ambiguous prior result | Fail closed to status re-read; no false success |

**Schema dependency (explicit):** the committed migration does **not** provide an idempotency-key uniqueness column or active-request uniqueness constraint. Durable idempotency therefore depends on an **unresolved application-layer store or policy** and is an implementation dependency — not inventable as a silent database constraint in this slice.

---

## 15. Current Status Operation

| Aspect | Contract |
|--------|----------|
| Method / route | `GET /api/deletion-requests/current` |
| Authentication | Required |
| User identifier in request | None (server-derived) |
| Query | Ownership-scoped latest request for authenticated email |
| Safe response | Presentation fields for latest request, or empty state |
| Execution rows | Not included |
| Empty state | `200` with null/empty current object (not `404`) |
| Errors | `401`; `500` internal |
| Cache-Control | `private, no-store` |

---

## 16. Request History Operation

| Aspect | Contract |
|--------|----------|
| Method / route | `GET /api/deletion-requests` |
| Authentication | Required |
| Scope | Authenticated ownership-only list |
| Ordering | Deterministic: `requested_at` descending, then `id` descending |
| Pagination | Cursor/limit concept; exact cursor format unresolved (Section 34) |
| Maximum page-size posture | Hard server maximum required; exact number unresolved pending security review |
| Allowed filters | Optional presentation-status or scope filters **only if** they remain owner-scoped; default is unfiltered owner history |
| Forbidden filters | Any user-email / foreign identity / operator filters |
| Safe summary fields | `id`, `request_scope`, `presentation_status`, `received_at`, terminal timestamps if user-safe |
| Operator details | Not exposed |
| Execution attribution | Not exposed by default |
| Cache-Control | `private, no-store` |

---

## 17. Direct Request Lookup Operation

| Aspect | Contract |
|--------|----------|
| Route | `GET /api/deletion-requests/{requestId}` |
| Request-id validation | UUID format validation; invalid format → `400` / `MALFORMED_REQUEST` |
| Ownership | Authenticated owner match required |
| Disclosure posture | Non-owned or missing → indistinguishable `404` / `NOT_FOUND` (do not reveal another user’s request existence) |
| Response shape | Same safe fields as current/history item + milestone presentation |
| Terminal / milestone presentation | Per Section 18 |
| Cache-Control | `private, no-store` |

---

## 18. User-Facing Status Mapping

### Database vocabulary (closed)

| Database | Values |
|----------|--------|
| `request_state` | `received`, `executed`, `rejected` |
| Validation milestone | `validated_at` non-null while state may remain `received` |
| `resolution_code` | `completed` with `executed`; rejection codes with `rejected`; null with `received` |

**Do not invent `validated` as a fourth database state.**

### Presentation statuses (API)

| Presentation status | Database basis |
|---------------------|----------------|
| `pending_review` | `request_state = received` AND `validated_at` null |
| `in_progress` | `request_state = received` AND `validated_at` non-null |
| `completed` | `request_state = executed` AND `resolution_code = completed` |
| `not_completed` | `request_state = rejected` |

### API return shape

| Field | Required |
|-------|----------|
| `request_state` (raw governed state) | Yes — for machine clients; closed set only |
| `presentation_status` | Yes — stable UI mapping |
| `validated_at` or `validation_milestone: true/false` | Yes — milestone without inventing a fourth state |
| Mapped outcome category | Optional user-safe category for rejections; raw `resolution_code` exposure policy unresolved (Section 34) |

UI must not infer false completion from milestone alone. Only `presentation_status = completed` (terminal executed) may communicate governed pathway completion — never universal erasure.

---

## 19. Operator Validation Operation

| Aspect | Contract |
|--------|----------|
| Route | `POST /api/operator/deletion-requests/{requestId}/validate` |
| Authorization | Operator authorization required beyond ordinary user session |
| Input | Request identifier; accepted action boundary: `validate` (set milestone) or `reject` with closed rejection code |
| Accepted resolution codes on reject | Exact migration set: `invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed` (and not invented codes); `execution_failed` reserved to execution failures |
| `validated_at` | Set-once via permitted `received` → `received` milestone; cannot clear/replace |
| Success acknowledgement | Safe operator acknowledgement (request id, resulting state/milestone); no end-user operator details in user APIs |
| Audit | `deletion_validation_started` / `completed` / `rejected` with operator identity |
| Idempotency / conflict | Repeat validate after milestone → conflict; terminal rows immutable |
| Operator UI | Not defined |

---

## 20. Operator Execution Operation

| Aspect | Contract |
|--------|----------|
| Route | `POST /api/operator/deletion-requests/{requestId}/execute` |
| Authorization | Strict operator / supervised server authorization |
| Input | Request identifier only for target selection |
| Attribution from caller | **Forbidden** — orchestrator derives affected targets server-side |
| Transaction | One atomic execution transaction: governed lifecycle actions + required attribution + terminal `executed`/`completed` |
| Terminal state | Only after governed actions and attribution succeed and deferred consistency can pass |
| Blind retry | Prohibited |
| Ambiguous result | Status re-read + operator review; no assumed success |
| Audit / evidence | `deletion_execution_started` / `completed` / `failed`; affected counts; redacted error category |

No SQL statements are defined in this contract.

---

## 21. F-P2-3 API Enforcement

Binding API rules:

1. All intended **account-wide** attribution is derived and persisted in the **original atomic execution transaction**.
2. The execution API does **not** accept a follow-up “append attribution” operation.
3. There is **no** public or operator API for post-terminal attribution.
4. Worker/retry systems may not schedule post-terminal attribution.
5. Database capability (accepted residual that a later service-role insert may still be physically possible) **≠** API authorization.
6. Future integration tests must prove the **absence** of an append-attribution operation and the refusal/non-scheduling of post-terminal attribution.

No database redesign is authorized by this contract.

---

## 22. Operator Authorization Boundary

Conceptual boundary (no final RBAC implementation invented):

| Rule | Requirement |
|------|-------------|
| Ordinary authenticated user | Cannot call validate/execute routes successfully |
| Check location | Server-side authorization on every operator mutation |
| Operator identity | Attributable in audit events |
| Service-role alone | Proves database privilege, **not** human authorization |
| Future worker | Separately approved authorization model |
| Browser | Must never possess service-role key |

Exact mechanism (allowlist, role claim, admin surface) remains unresolved (Section 34).

---

## 23. Error Envelope

Conceptual public error envelope for the deletion pathway:

| Field | Purpose |
|-------|---------|
| `error` | User-safe message (compatible with `app/api/scan/route.ts` convention) |
| `code` | Stable public error code (Section 13) |
| `request_id` / correlation id | Client/support correlation when available |
| `retryable` | Boolean where appropriate (`RATE_LIMITED`, some `CONFLICT`/`AMBIGUOUS_RESULT`) |

### Must not expose

SQLSTATE; database object names; internal stack; secrets; service-role values; raw operator notes; constraint names.

No JSON Schema code is defined here.

---

## 24. Success Envelope

| Approach | Decision |
|----------|----------|
| Repository convention | Direct JSON objects (`app/api/scan/route.ts` returns domain payload; interest returns `{ success: true }`) |
| Deletion pathway | Prefer **direct success JSON** with safe fields (Section 12) rather than a deep generic wrapper |
| Optional metadata | Correlation/request id may appear as a top-level field or response header without requiring a nested `data` envelope |

Unnecessary wrapper complexity is avoided unless a later cross-API standardization effort is separately approved. If a wrapper is later mandated, deletion responses must remain field-compatible with Section 12.

---

## 25. HTTP Status Mapping

| Status | Usage |
|--------|-------|
| `200` | Successful read; successful idempotent replay of prior intake |
| `201` | New durable `received` request created |
| `400` | Malformed JSON, wrong content type, invalid UUID format, empty body where body required |
| `401` | Unauthenticated or missing session email |
| `403` | Authenticated but lacking operator authorization; optional non-disclosing ownership denial if chosen (prefer `404` for cross-user lookup) |
| `404` | Direct lookup not found **or** not owned (indistinguishable) |
| `409` | Duplicate active request; idempotency key reuse mismatch; concurrency conflict; already completed conflicts |
| `413` | Oversized request body (if size limit exceeded) |
| `422` | Semantically invalid but well-formed payload **if** selected over `400` for scope/matrix failures (open decision) |
| `429` | Rate limited |
| `500` | Internal failure |
| `503` | Ambiguous persistence / temporary orchestration unavailability with status-check guidance |

Cross-user existence must not leak through status choice on direct lookup (`404` for both missing and non-owned).

---

## 26. Validation and Unknown-Field Posture

| Topic | Decision |
|-------|----------|
| Unknown client fields | **Rejected** (reject-closed) for this sensitive endpoint |
| Content-Type | Require `application/json` for JSON mutations |
| Request-size limit | Hard maximum required; exact bytes unresolved pending security review |
| UUID validation | Strict UUID for request id and target ids |
| Scope-target matrix | Enforce migration matrix before durable intake |
| Trimming / normalization | Trim string enums/tables; normalize email only server-side from session |
| Empty body | Reject for `POST` submission |
| Malformed JSON | `400` / `MALFORMED_REQUEST` |

Validation library: repository already depends on Zod (`package.json`, `lib/zod.ts`) for auth forms; scan API uses manual checks. This contract does **not** mandate a library selection beyond requiring reject-closed validation consistent with repository evidence when implementation is later authorized.

---

## 27. Rate-Limit and Abuse Contract

| Topic | Contract |
|-------|----------|
| User-scoped authenticated limiting | Required for submission and status polling |
| Route-specific numeric limits | Unresolved until security review |
| Double-submit suppression | Idempotency key + client disable-on-submit |
| Abusive repeated attempts | Audit; continued `429` / ownership-mismatch patterns |
| Operator endpoint protection | Authz + audit + rate limits |
| Fail-open / fail-closed | Must be an **explicit** approved decision for deletion (current scan limiter in `lib/rateLimit.ts` is **fail-open** if Redis missing — **not** automatically reused) |
| Scan limit reuse | Prohibited without review (`checkScanRateLimit` is scan-specific: 10/hour) |

No rate-limit implementation is authorized now.

---

## 28. CSRF and Session Contract

Consistent with existing NextAuth cookie-session architecture (`auth.ts`, dashboard session usage):

| Topic | Contract |
|-------|----------|
| Cookie-based authenticated mutation | User `POST` operations rely on session cookies verified via `auth()` inside the handler |
| Same-origin expectations | Browser clients are expected to call same-origin `/api/deletion-requests*` |
| Origin / Referer validation | Optional later hardening if approved; not invented as a framework feature here |
| Session verification | Mandatory inside each mutating handler |
| Middleware trust | Insufficient alone (`middleware.ts` does not cover `/api/*`) |
| Operator mutations | Same session verification + stronger operator authorization |
| Replay handling | Idempotency keys for intake; status re-read for ambiguous outcomes |

---

## 29. Cache and Response Headers

| Response class | Header posture |
|----------------|----------------|
| User-specific status / history / lookup | `Cache-Control: private, no-store` |
| Mutation responses | `no-store` |
| Sensitive errors | `no-store` |
| Content-Type | `application/json` |
| Optional security headers | Only if aligned with a separately approved repository-wide header policy |

No header implementation is performed in this task.

---

## 30. Observability Contract

| Operation | Conceptual audit events |
|-----------|-------------------------|
| User submit | attempted / accepted / rejected / conflict / rate-limited |
| Current / history / lookup | optional read events at info/debug; always log auth failures |
| Operator validate | validation started / completed / rejected |
| Operator execute | execution started / completed / failed / ambiguous result |

Common fields: correlation id; actor category; operator identity where privileged; safe request scope; affected counts (execution); redacted error category.

**No secret payload logging.** No new database columns for audit.

---

## 31. Privacy and Response Truthfulness

| Rule | Contract |
|------|----------|
| “Everything deleted” | Forbidden in any success or status response |
| Meaning of `executed` / `completed` | Governed Slice 2 pathway completed for in-scope eligibility effects — **not** every external copy |
| Residuals | Storage, exports, backups, email, logs, localStorage, AI-derived artifacts outside excluded rows remain explicit non-guarantees |
| Personalization | No hidden personalization from excluded evidence in eligibility-aware surfaces after completion |
| Operator / legal notes | Not exposed to end users |
| Unsupported promises | No API copy may promise export wipe, localStorage purge, backup erasure, email erasure, or log erasure |

---

## 32. Existing Stub Deprecation Contract

Future treatment of `app/api/delete-request/route.ts`:

1. It is **not authoritative**.
2. It must **not** continue returning unconditional success once the governed pathway is activated.
3. Client-supplied email must be **removed from authority** (never used as identity).
4. Future replacement/deprecation must avoid two active conflicting intake contracts.
5. No silent compatibility behavior in this documentation task.
6. Landing footer (`app/page.tsx`) and privacy (`app/privacy/page.tsx`) references must be reconciled in a **separately authorized** implementation package.

This document does **not** modify the stub.

---

## 33. Contract Test Matrix

Future contract tests (authorized only after implementation gates), separate from Block A and Block B:

| Test focus | Assertion |
|------------|-----------|
| Auth required | Unauthenticated submit/read → `401` |
| Server-derived identity | Client `user_email` ignored/rejected; persisted identity matches session |
| Unknown-field rejection | Extra fields → reject-closed |
| Scope matrix | Each scope’s required/forbidden targets enforced |
| Ownership | Cross-user targets do not create foreign-owned requests |
| Idempotency replay | Same key + payload returns prior result |
| Duplicate active request | Policy-compliant `409` behavior |
| Already completed | Conflict / mapped rejection per policy |
| Current status | Owner-only latest; empty state safe |
| History pagination | Deterministic order; max page size enforced |
| Direct lookup privacy | Non-owned → `404` without existence leak |
| Operator authorization | Ordinary user cannot validate/execute |
| Validation milestone | Set-once; no fourth DB state |
| Atomic execution | Terminal only with required attribution |
| F-P2-3 | Absence of append-attribution operation |
| Safe errors | No SQLSTATE/secret leakage |
| No-store headers | Private responses not publicly cacheable |
| No PROD access | CI/manual tests never target PROD denylist identities |

Block A/B remain database verification artifacts and are not substitutes for these contract tests.

---

## 34. Open Decisions

Unresolved contract decisions (not forced without evidence):

1. Exact temporary compatibility behavior for `/api/delete-request` (hard deprecate/`410` vs temporary redirect vs simultaneous cutover with footer update).
2. Exact operator authorization mechanism (allowlist, role claim, admin surface).
3. Idempotency-key persistence medium, TTL, and expiry posture (no DB column in committed migration).
4. Duplicate-active-request policy: reject new vs return existing id.
5. Numeric rate limits and whether deletion limiting is fail-closed (vs scan fail-open).
6. CSRF hardening beyond session cookie verification (Origin/Referer validation).
7. `400` versus `422` for well-formed but semantically invalid payloads.
8. Pagination cursor format and default/max page size.
9. Whether `resolution_code` is returned raw to users, mapped only, or operator-only.
10. Whether `evidence_specific` execution consumer is activated in the first release package (intake shape is first-class; execution activation remains gated).
11. Optional explanatory user note treatment (discard vs later-approved persistence — no migration payload column).
12. Correlation id transport (response body field vs header only).

---

## 35. Implementation Preconditions

API implementation remains **prohibited** until all of the following:

- Separate SkinIntel DEV Supabase project exists and is verified
- Phase 2 Slice 2 migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required
- Application Deletion Pathway Technical Design accepted
- **This API Contract Design accepted**
- Operator authorization design accepted
- Idempotency posture accepted
- Storage residual decision recorded for user-facing promises
- Security review accepted
- Exact execution baseline approved at the execution gate

---

## 36. Hard Stops

Stop immediately if:

- DEV unresolved or conflated with PROD
- PROD denylist match under locked typed matching semantics
- Migration unapplied on the target environment
- Block A failure or unapproved bypass
- Route accepts client identity as requester authority
- Ownership contract unclear
- Unknown fields silently accepted without approved decision
- Service-role exposed to browser/bundle
- Operator auth unresolved for privileged routes at implementation time
- Execution request accepts caller-supplied attribution
- Post-terminal attribution operation exists or is scheduled
- Ambiguous execution retried blindly
- Misleading deletion completion response (“everything deleted”)
- Scope creep into account deletion or billing/subscription deletion

---

## 37. Current Authorization Boundary

**Authorized now:**

- Creation and review of this API contract design document

**Not authorized:**

- Route implementation
- API code changes
- UI implementation
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 38. Next Safe Design Step

After acceptance of this API Contract Design, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway UI Flow Design**

That step remains **documentation-only** unless separately authorized.

---

*End of Phase 2 Slice 2 — Application Deletion Pathway API Contract Design.*
