# Phase 2 Slice 2 — Application Deletion Pathway Idempotency and Concurrency Design

- Status: Draft — idempotency and concurrency design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- Idempotency implementation: not authorized
- API implementation: not authorized
- UI implementation: not authorized
- Worker implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future idempotency, duplicate-handling, concurrency, retry, and ambiguous-outcome contract** for the governed Application Deletion Pathway.

It is the design authority for:

- safe intake replay
- duplicate suppression
- racing requests
- stale operator actions
- ambiguous persistence and execution results
- bounded retry behavior

**Authorization boundary (binding):**

- **No implementation is authorized** by this document.
- **No database execution is authorized.**
- **No new schema capability is authorized** (no column, table, index, constraint, RPC, or migration change).
- Accepted **API Contract Design**, **UI Flow Design**, **Security and Abuse Design**, and **Operator Authorization Design** remain authoritative for their domains.
- This document **cannot silently redesign** persistence vocabulary, transition rules, resolution codes, or **F-P2-3**.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| # | Artifact | Role |
|---|----------|------|
| 1 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` | Pathway scope, duplicate posture, retry/error principles, F-P2-3 |
| 2 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` | Trust zones, sequences, duplicate/idempotency, transaction/concurrency concepts |
| 3 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md` | HTTP semantics, `Idempotency-Key` posture, conflict/ambiguous codes |
| 4 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md` | Double-submit, status re-read, no user execution retry |
| 5 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md` | Idempotency security, abuse bounds, rate-limit interaction principles |
| 6 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md` | Privileged validate/reject/execute, stale session, ambiguous review |
| 7 | `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` | Lifecycle consumer and failure principles |
| 8 | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` | Persistence narrative (no idempotency columns) |
| 9 | `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` | Controlled DEV apply; no blind retry |
| 10 | `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` | DEV gate **BLOCKED** |
| 11 | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Committed persistence contract |
| 12 | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` | Verification candidate (Block A/B); F-P2-3 residual observation |

### Precedence (binding)

1. **Committed migration** — persistence vocabulary, CHECKs, transition rules, terminal immutability, attribution uniqueness, grants/RLS.
2. **Accepted pathway Plan** — application scope, residuals, F-P2-3 obligation, hard stops.
3. **Accepted Technical Design** — trust zones, sequences, orchestration responsibilities.
4. **Accepted API Contract Design** — HTTP routes, envelopes, status codes, idempotency transport posture.
5. **Accepted UI Flow Design** — client recovery UX; not a substitute for server authority.
6. **Accepted Security and Abuse Design** — abuse bounds, rate-limit principles, fail-closed privileged posture.
7. **Accepted Operator Authorization Design** — privilege model for validate/reject/execute/review.
8. **This Idempotency and Concurrency Design** — replay, race, stale-state, retry, and ambiguous-result contract.
9. **Future implementation** — may not silently change any accepted contract above.

---

## 3. Current Repository Posture

Read-only inspection of intake, API, persistence, retry, rate-limit, and transaction conventions. No inspected file was modified. Claims cite exact repository paths.

### 3.1 Current delete-request stub — `app/api/delete-request/route.ts`

| Aspect | Finding |
|--------|---------|
| **Path** | `app/api/delete-request/route.ts` |
| **Current behavior** | `POST` only; optional `body.email` / `body.message` parsed then discarded; JSON parse errors swallowed (`catch {}`); always returns `200` `{ success: true, message: "Delete request received" }`. No `auth()`, no rate limit, no persistence, no idempotency key handling. |
| **Assessment** | Unsafe / incomplete / non-authoritative temporary stub. |
| **Gap versus future pathway** | Future `POST /api/deletion-requests` must authenticate, validate, coordinate duplicates/idempotency, and never return false success. Stub provides **no** durable idempotency or concurrency control. |

### 3.2 Scan API — `app/api/scan/route.ts`

| Aspect | Finding |
|--------|---------|
| **Path** | `app/api/scan/route.ts` |
| **Current behavior** | Calls `auth()`; rejects without session user (`401`); requires `session.user.email` for persistence; applies `checkScanRateLimit` from `lib/rateLimit.ts`; sequential Supabase inserts (scan record → consent → evidence → storage upload with `upsert: false` → analyses); OpenAI completion; user-safe `{ error }` responses; internal `console.error`. |
| **Assessment** | Best current authenticated mutating API reference for auth and safe errors. |
| **Gap versus future pathway** | **No** `Idempotency-Key` handling; **no** multi-statement DB transaction wrapper; **no** retry helper; **no** duplicate-request coordination; storage `upsert: false` is object-write conflict avoidance, not request idempotency. Must not be copied as deletion concurrency architecture. |

### 3.3 Interest API — `app/api/interest/route.ts`

| Aspect | Finding |
|--------|---------|
| **Path** | `app/api/interest/route.ts` |
| **Current behavior** | Unauthenticated `POST`; client-supplied `email`/`consent`; service-role insert into `interest_leads`; returns `{ success: true }` or `{ error: "Invalid request" }`. |
| **Assessment** | Unrelated lead capture; client email ownership pattern is **unsafe** for deletion. |
| **Gap versus future pathway** | Must not template identity, idempotency, or duplicate handling for the deletion pathway. |

### 3.4 Server actions — `app/actions/index.ts`

| Aspect | Finding |
|--------|---------|
| **Path** | `app/actions/index.ts` |
| **Current behavior** | `"use server"`; social login/logout via `auth.ts`; `getLatestAnalysis` / reminder preference reads filtered by `session.user.email`; `saveReminderPreference` uses Supabase `.upsert(..., { onConflict: "user_email" })`. |
| **Assessment** | Ownership-scoped reads exist; preference upsert is the only observed application-layer conflict/upsert pattern. |
| **Gap versus future pathway** | No deletion intake/actions; preference upsert is **not** a deletion idempotency registry and must not be generalized into governance request identity. |

### 3.5 Rate limiter — `lib/rateLimit.ts`

| Aspect | Finding |
|--------|---------|
| **Path** | `lib/rateLimit.ts` |
| **Current behavior** | Upstash Redis (`@upstash/redis`); `checkScanRateLimit(userKey)` — **10 requests / hour / userKey**; missing Redis config or Redis errors → `{ allowed: true }` (**fail-open**) with `console.error`. |
| **Assessment** | Scan-specific limiter only; Redis is present as a **rate-limit** dependency, not an idempotency store. |
| **Gap versus future pathway** | Deletion must not reuse scan numeric limits or fail-open posture without separate approval (per Security and Abuse Design). No deletion rate-limit keys exist today. |

### 3.6 Supabase clients — `lib/supabase.ts` and inline service-role clients

| Aspect | Finding |
|--------|---------|
| **Paths** | `lib/supabase.ts`; service-role `createClient` usage in `app/api/scan/route.ts`, `app/api/interest/route.ts`, `app/actions/index.ts` |
| **Current behavior** | `lib/supabase.ts` exports anon client from `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Mutating APIs construct service-role clients inline with `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`. |
| **Assessment** | No shared transaction helper, RPC wrapper, or idempotency client. |
| **Gap versus future pathway** | Future pathway must define durable write coordination separately; current clients do not provide idempotent intake semantics. |

### 3.7 Existing transaction conventions

| Aspect | Finding |
|--------|---------|
| **Paths searched** | Application TypeScript under `app/`, `lib/`; migration `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| **Current behavior** | **No** application-layer DB transaction API, advisory lock helper, or serialized workflow runner exists in `app/` or `lib/`. Scan route performs sequential inserts without an explicit multi-statement transaction. Migration SQL uses a single migration `BEGIN`…`COMMIT` and deferred consistency triggers for governance tables (database-side, unapplied). Dashboard “transaction” UI tables under `components/table/*` are **presentation mocks**, not persistence transactions. |
| **Assessment** | Application has **no** reusable transaction/concurrency framework for deletion. |
| **Gap versus future pathway** | Execution atomicity remains a future orchestration concern; this document does not invent SQL mechanisms. |

### 3.8 Existing retry logic

| Aspect | Finding |
|--------|---------|
| **Paths searched** | `app/**/*.{ts,tsx}`, `lib/**/*.{ts,tsx}` for `retry` / `retries` |
| **Current behavior** | **No** application retry helper, retry budget, exponential backoff, or idempotent retry client exists under `app/` or `lib/`. |
| **Assessment** | Retry behavior is absent at the application layer. |
| **Gap versus future pathway** | Future retry classification (Section 36) is greenfield relative to repository code. |

### 3.9 Existing idempotency support

| Aspect | Finding |
|--------|---------|
| **Paths searched** | Repository application code for `idempotency`, `Idempotency-Key`, `fingerprint`, `request hash` |
| **Current behavior** | **No** `Idempotency-Key` header handling; **no** idempotency registry; **no** request fingerprint store; **no** durable key→result mapping in application code. |
| **Assessment** | Durable idempotency infrastructure **does not currently exist**. |
| **Gap versus future pathway** | Entire intake idempotency surface is future work; persistence medium remains unresolved (Section 16). |

### 3.10 Existing worker / queue / job infrastructure

| Aspect | Finding |
|--------|---------|
| **Paths searched** | `package.json` dependencies; `app/`, `lib/` for `worker`, `queue`, `job`, `cron` |
| **Current behavior** | `package.json` has **no** job/queue/worker runtime (no Bull, pg-boss, Inngest, Agenda, etc.). Application TypeScript has **no** deletion worker, cron, or job runner. Operator “queue” language in design docs is conceptual UX/authorization vocabulary, not implemented infrastructure. |
| **Assessment** | Worker/queue/job infrastructure for deletion **does not exist**. |
| **Gap versus future pathway** | Any future worker requires separate authorization and distinct job identity (Section 35). |

### 3.11 Existing duplicate handling

| Aspect | Finding |
|--------|---------|
| **Paths** | `app/api/delete-request/route.ts` (none); `app/actions/index.ts` (preference upsert only); migration uniqueness on attribution |
| **Current behavior** | Delete stub does not detect duplicates. Preference save uses `onConflict: "user_email"` for `user_preferences` only. Committed migration defines `UNIQUE (deletion_request_id, scan_record_id)` on `deletion_request_executions` — attribution uniqueness, **not** active-request duplicate suppression. |
| **Assessment** | No active deletion-request duplicate policy is implemented. |
| **Gap versus future pathway** | Semantic duplicate-active policy remains open (Sections 19–21). |

### 3.12 Existing uniqueness relevant to deletion requests

| Aspect | Finding |
|--------|---------|
| **Path** | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| **Current behavior** | `deletion_requests.id` UUID PK; **no** unique constraint on `(user_email, request_scope, targets, non-terminal)`; **no** idempotency-key column; **no** fingerprint column. Attribution table uniqueness: `deletion_request_executions_request_scan_unique` on `(deletion_request_id, scan_record_id)`. Terminal immutability and `validated_at` set-once enforced by transition guard function. |
| **Verification note** | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` verifies attribution uniqueness and records F-P2-3 residual (post-terminal attribution insert possibility as INFO, not FAIL). |
| **Assessment** | Schema uniqueness does **not** guarantee one active request per user/scope/target or durable intake idempotency. |
| **Gap versus future pathway** | Application-layer coordination required; inventing DB uniqueness here is prohibited. |

### 3.13 Auth, middleware, proxy, validation helpers

| Path | Current behavior | Assessment / gap |
|------|------------------|------------------|
| `auth.ts` | NextAuth v5; Credentials + Google + GitHub; exports `{ handlers, signIn, signOut, auth }` | Identity source for future pathway; **no** idempotency or operator capability model |
| `middleware.ts` | Protects `/dashboard/:path*`, `/history`, `/history/:path*` only | **Does not** protect `/api/*` |
| `proxy.ts` | Explicitly skips paths starting with `/api` | API auth must be in-handler |
| `lib/zod.ts` | Auth form schemas only (`loginSchema`, etc.) | **No** deletion request schema; present for completeness |
| `package.json` | Includes `@upstash/redis`, `@supabase/supabase-js`, `zod`, `next-auth`; no worker packages | Confirms Redis available for scan rate limits only today |

### 3.14 Repository search results (explicit)

Searched read-only across the repository (application and design surfaces). Results relevant to implementation posture:

| Mechanism | Result in application runtime (`app/`, `lib/`) |
|-----------|-----------------------------------------------|
| `idempotency` / `Idempotency-Key` | **Does not exist** |
| `retry` / `retries` helpers | **Does not exist** |
| Durable duplicate-request coordinator for deletion | **Does not exist** |
| Concurrency / race helpers | **Does not exist** |
| Advisory / distributed locks | **Does not exist** |
| Application DB transaction wrapper | **Does not exist** |
| Idempotency fingerprint / request hash store | **Does not exist** |
| Worker / queue / job / cron for deletion | **Does not exist** |
| `upsert` / `onConflict` | Present only in `app/actions/index.ts` for `user_preferences` reminder days — **unrelated** to deletion requests |
| Storage `upsert: false` | Present in `app/api/scan/route.ts` image upload — **not** request idempotency |
| Redis / Upstash | Present in `lib/rateLimit.ts` for **scan rate limiting only** |
| Terminal / stale / ambiguous handling for deletion APIs | **Does not exist** in runtime code (design docs only) |

Design documents under `docs/` extensively discuss these concepts for the **future** pathway; they are not implemented.

**Durable idempotency infrastructure currently exists: no.**

---

## 4. Design Objectives

| Objective | Intent |
|-----------|--------|
| At-most-one intended intake result per approved idempotency identity | Same key + same payload yields one durable request identity |
| No false duplicate success | Never claim success for a second unintended create |
| No cross-user replay leakage | Owner-scoped key namespace; no foreign result disclosure |
| Deterministic conflict behavior | Same key + different payload → stable conflict |
| Safe recovery after network timeout | Timeout ≠ failure; reuse key / status read |
| No blind destructive retry | Especially for execution and privileged mutations |
| Stale-state protection | Operator actions re-read and fail closed when stale |
| Terminal immutability | `executed` / `rejected` cannot be overwritten by replay |
| Operator action attribution | Privileged mutations remain attributable |
| No PROD testing | DEV-only when execution is later authorized |
| No invented database guarantee | Do not claim uniqueness/idempotency the schema does not provide |

---

## 5. Terminology

Conceptual definitions only. No schemas or constants are created.

| Term | Meaning |
|------|---------|
| **Idempotency key** | Caller-generated opaque token identifying one intended intake submission attempt within a scoped namespace |
| **Request fingerprint** | Canonical normalized digest of the meaningful intake payload fields used to detect same-key payload mismatch |
| **Duplicate submission** | Another attempt that would create a second request for the same intended user action (transport replay or semantic overlap) |
| **Active duplicate** | A non-terminal (`received`, possibly with validation milestone) request that overlaps the same user/scope/target identity under approved policy |
| **Replay** | Re-delivery of the same idempotency identity after a prior successful intake; returns the original safe result |
| **Concurrency conflict** | Two or more overlapping mutating attempts where only one may lawfully proceed |
| **Stale state** | Caller action based on outdated request state, validation milestone, or UI snapshot |
| **Ambiguous persistence result** | Application cannot determine whether a durable intake write committed |
| **Ambiguous execution result** | Application cannot determine whether execution lifecycle/attribution/terminalization committed |
| **Terminal result** | Request in `executed` or `rejected` with resolution fields set per migration coupling |
| **Retryable failure** | Failure class where a defined safe retry or recovery action is permitted |
| **Non-retryable failure** | Failure class where repeating the same mutating action is prohibited or unsafe without new evidence |

---

## 6. Operation Inventory

| Operation | Mutation / read | Destructive risk | Replay posture | Concurrency sensitivity | Terminality |
|-----------|-----------------|------------------|----------------|-------------------------|-------------|
| User submission (`POST /api/deletion-requests`) | Mutation | Medium (creates governance row; enables later destructive workflow) | Idempotent when key+payload match | High | Creates non-terminal `received` |
| Current-status read | Read | None | Naturally safe | Low (read races yield stale-but-safe) | Reflects current/terminal |
| History read | Read | None | Naturally safe | Low–medium (pagination consistency open) | Reflects terminal history |
| Direct request lookup | Read | None | Naturally safe | Low | Reflects one request |
| Operator validation | Mutation | Medium (sets `validated_at` milestone) | Repeat after success → conflict | High | Milestone set-once; not terminal |
| Operator rejection | Mutation | High (terminalizes) | Repeat after terminal → conflict | High | Terminal `rejected` |
| Operator execution | Mutation | Critical (lifecycle + attribution + terminalize) | Blind replay prohibited | Critical | Terminal `executed` on success |
| Ambiguous-result review | Read (+ optional ack if later approved) | Critical if misused to re-execute | Review ≠ retry | High | Must not overwrite terminal without evidence |
| Future worker processing | Mutation (if later approved) | Critical | Bounded, deduplicated; not authorized now | Critical | Must honor terminal immutability |

---

## 7. Intake Idempotency Boundary

| Rule | Contract |
|------|----------|
| Scope of intake idempotency | Applies **only** to future `POST /api/deletion-requests` |
| User identity | **Server-derived** from authenticated session; never from client-asserted ownership fields |
| Key scoping | Authenticated user + operation identity (+ environment namespace) |
| Access control | Key does **not** grant access to another user’s result |
| Non-bypass | Idempotency does **not** bypass validation, ownership checks, rate limits, or authorization |
| Successful replay | Returns the **original safe intake result** (`200` per API Contract), not a second create |

---

## 8. Idempotency-Key Transport

Aligns with accepted API Contract Design Section 14:

| Topic | Posture |
|-------|---------|
| Preferred transport | `Idempotency-Key` HTTP header |
| Body transport | Remains **unresolved fallback** if header proves incompatible with approved clients |
| Authentication | Key is **never** treated as authentication or authorization |
| Missing key | Behavior remains **explicit and unresolved** for finalization (Section 15) |
| Proxies / logs | Must not expose sensitive payload values; raw keys must not be logged as secrets (Section 40) |
| Implementation selection | **None** — no store, parser, or middleware is selected or authorized here |

---

## 9. Key Format Principles

| Principle | Contract |
|-----------|----------|
| Generation | Opaque caller-generated value |
| Length | Bounded; **exact length not chosen** without evidence |
| Secrecy | Non-secret (not a credential); still not freely logged in full if policy treats it as sensitive operational identifier |
| Characters | Valid character posture to be finalized with format decision; reject control characters / empty |
| Intent mapping | One key per intended submission |
| Predictability | No requirement to embed predictable user identifiers in the key |
| Normalization | Trim/normalize rules must be deterministic and applied before durable effects |
| Malformed keys | Rejected **before** durable intake effects |

Do **not** choose exact max length, charset regex, or UUID-vs-ULID preference in this document.

---

## 10. User and Operation Scope

Conceptual key namespace composition:

1. Authenticated user identity (server-derived)
2. Operation identity (intake submission operation)
3. Environment (DEV vs PROD separation)
4. Caller key value

Binding statements:

- Cross-user reuse **cannot** return another user’s request.
- DEV keys **never** match PROD keys (environment namespace separation).
- Validation and execution operations **do not share** intake keys.
- Ordinary users **cannot** choose or override the environment namespace.

---

## 11. Canonical Request Fingerprint

### Conceptual fingerprint inputs

- Canonical request scope (`account_wide` / `scan_specific` / `evidence_specific`)
- Canonical target identifiers (scan and/or evidence identity fields as applicable)
- Intent-confirmation value where contractually relevant
- Authenticated owner identity **indirectly** via key namespace (not as a free-form client field)
- Stable normalized field ordering

### Exclusions

- Timestamps
- Correlation id
- Locale
- User-agent
- Volatile presentation metadata
- Operator fields

**Not specified here:** hashing algorithm, executable serialization format, or library choice.

---

## 12. Same Key and Same Payload

Accepted replay behavior:

| Requirement | Contract |
|-------------|----------|
| Result | Return the original safe intake result |
| HTTP | `200` (not a second create) |
| Request identity | Preserve original request identifier |
| Received timestamp | Preserve original received timestamp in the returned safe view |
| Workflow stages | Do **not** re-run validation or execution |
| Internal state | Do **not** expose additional internal/operator state |
| Audit | Record a safe replay event (Section 40) |

---

## 13. Same Key and Different Payload

| Requirement | Contract |
|-------------|----------|
| HTTP | Deterministic `409` |
| Public category | Stable mismatch category (`IDEMPOTENCY_KEY_REUSE_MISMATCH` per API Contract) |
| Persistence | **No** new request row under that key |
| Original request | **No** mutation of the original request |
| Disclosure | No disclosure of another user’s request |
| Guidance | Safe guidance to use a **new key only** for a genuinely new intended submission |

---

## 14. Cross-User Key Reuse

| Rule | Contract |
|------|----------|
| Ownership | Keys are owner-scoped |
| Non-leakage | One user’s key cannot reveal another user’s result |
| Visible key coincidence | Same visible key value may exist independently across users **if approved** by final namespace design |
| Lookup | Always includes server-derived owner identity |
| Enumeration | No cross-user enumeration via timing or response detail differences beyond what ownership-safe responses already allow |

---

## 15. Missing Idempotency Key

Future policy options — **evaluate only; do not finalize without evidence.**

| Option | Safety | UX | Recoverability | Abuse risk | Compatibility |
|--------|--------|----|----------------|------------|---------------|
| **Reject keyless intake** | Strongest server guarantee alignment | Requires client key generation | Timeout recovery harder without key unless status read suffices | Lower accidental duplicate create; higher client complexity | Best with modern clients; may break naive clients |
| **Allow keyless intake with weaker guarantees** | Weaker; duplicates possible under retry | Simpler clients | Poor after timeout (may create second row) | Higher duplicate flood / double-submit risk | Compatible with stub-like clients; conflicts with at-most-once objective |
| **Server-generated key** | Medium; server can mint but client may not know key after timeout | Easy first submit | Weak unless key returned and client persists it | Medium | Requires careful response contract |
| **Transient fingerprint suppression** | Medium short-window help | Transparent | Weak across instances/TTL gaps | Bypass via payload tweaks | Temporary UX aid; **not** a substitute for durable key policy |

**Decision status:** unresolved (listed in Section 45).

---

## 16. Idempotency Persistence Options

Conceptual evaluation only. **Do not select or implement infrastructure.**

| Option | Durability | Multi-instance | TTL | Revocation / cleanup | Ambiguity recovery | Operational cost | DEV/PROD separation |
|--------|------------|----------------|-----|----------------------|--------------------|------------------|---------------------|
| **Redis/Upstash record** | TTL-durable; loss on eviction/expiry | Good if shared Redis | Natural TTL | Expire keys; must not delete governance rows | Replay requires record still present | Leverages existing `@upstash/redis` dependency pattern in `lib/rateLimit.ts`, but **not** currently used for idempotency | Separate key prefixes/namespaces required |
| **Application database registry** | Strong if same DB | Strong | App-managed | Cleanup jobs risk if poorly scoped | Strong correlation to request rows | Schema/migration gate required | Separate projects already separate data |
| **Dedicated persistence table** | Strong | Strong | App-managed | Explicit retention policy | Excellent | New migration — **not authorized** here | Environment-separated by project |
| **Existing request-row metadata** | Couples to request row | Strong | Tied to request retention | Cannot remove governance meaning | Good if column exists — **it does not** in committed migration | Requires schema change — **not authorized** | Same |
| **Signed short-lived token** | Client-held; server verifies | N/A (stateless) | Embedded expiry | Revocation hard | Weak after write without server store | Crypto/ops complexity | Env-specific signing keys |
| **In-memory process cache** | Weak / process-local | **Unsafe** across instances | Process lifetime | Lost on deploy | Poor | Low but incorrect for production multi-instance | Unsafe |

---

## 17. Current Schema Limitation

State explicitly:

- Committed migration `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` has **no idempotency-key column**.
- Committed migration has **no idempotency fingerprint column**.
- Committed migration has **no accepted active-request uniqueness constraint** for one-active-request-per-user/scope/target behavior.
- **Durable idempotency is not guaranteed by current schema.**
- This document **does not authorize** adding a column, table, index, or constraint.
- Any future schema change requires a **separate design and migration gate**.

Existing uniqueness that **must not be misread** as intake idempotency:

- `UNIQUE (deletion_request_id, scan_record_id)` on `deletion_request_executions` (attribution uniqueness only).

---

## 18. Idempotency TTL and Retention

| Topic | Contract |
|-------|----------|
| TTL value | **Unresolved** |
| Lower bound principle | TTL must exceed normal client retry windows |
| Policy separation | Terminal request retention and idempotency retention are **different** policies |
| Expiry behavior | Expired key behavior must be **deterministic** (e.g., treat as unknown key → new intake allowed only under explicit policy; never ambiguous silent merge) |
| Cleanup | Cleanup **cannot** remove governance records (`deletion_requests` / executions) |
| Abuse bound | Storage growth and unique-key abuse risks must be bounded |
| Environments | PROD and DEV TTL policies remain separated |

---

## 19. Duplicate Active Request Definition

Conceptual duplicate dimensions:

- Same user
- Same scope
- Same target set
- Active database state (`received`, including with or without `validated_at`)
- Validation milestone presence (may affect operator paths; does not by itself create a fourth state)
- Prior terminal request (terminal overlap is **not** automatically an active duplicate; append-oriented new rows may still exist and later be rejected with `already_completed` / policy codes)

**Critical distinction:** an **idempotent replay** (same key + same payload) and a **semantically duplicate new key** (different key, overlapping active target identity) are **different cases** and must not be conflated in responses or audits.

---

## 20. Duplicate-Active Policy Options

Evaluate without silently choosing:

| Option | UX | Auditability | Workflow complexity | Race behavior | Security / compliance risk |
|--------|----|--------------|---------------------|---------------|----------------------------|
| **Reject new request with `409`** | Clear conflict; user opens existing status | Strong (new attempt denied) | Lower (one active path) | Needs coordination to avoid double-insert under race | Lower accidental dual workflows |
| **Return existing active request** | Convenient; may surprise if user intended distinct intent | Must audit “mapped to existing” | Medium (response shaping) | Needs atomic find-or-return | Risk of masking distinct intents if fingerprint too coarse |
| **Allow multiple active requests** | Flexible | Harder ops triage | High (queue ambiguity) | Races create many rows | Higher abuse/storage; operator confusion |
| **Merge requests** | Opaque | Poor | Highest | Merge races are hazardous | **Unacceptable** for governance clarity |

Do **not** silently choose a policy in implementation without acceptance (Section 45).

---

## 21. Recommended Initial Duplicate Posture

> **Pending approval — non-binding recommendation**

Recommended initial posture:

1. **One effective active request** per user/scope/target identity.
2. Deterministic **conflict** or **existing-request** response (exact choice still open between reject-`409` vs return-existing).
3. **No merge behavior.**
4. **No silent duplicate row creation** when an active overlap is detected under the accepted policy.
5. **No database guarantee claim** until a separately designed and authorized mechanism exists.

This recommendation does **not** authorize schema uniqueness, locks, or implementation.

---

## 22. Browser Double-Submit

| Rule | Contract |
|------|----------|
| UI pending state | Disable submit while pending (UI Flow Design) |
| Key reuse | Preserve the **same** idempotency key during retry of the same intended submission |
| Key minting | Do **not** generate a new key on every click for the same intent |
| Authority | Server remains authoritative |
| Client-only prevention | Insufficient alone |
| Refresh recovery | Use status read (`GET /api/deletion-requests/current` and related reads) |

---

## 23. Racing Intake Requests

| Race | Required deterministic posture | Unresolved persistence dependency |
|------|--------------------------------|-----------------------------------|
| Same user, same key, same payload | One durable request; later arrivals are safe replays (`200`) | Durable key→result registry or equivalent |
| Same user, same key, different payload | Deterministic `409` mismatch; no second row under key | Fingerprint stored with key |
| Same user, different keys, same semantic target | Apply accepted duplicate-active policy (conflict or return-existing); **no merge** | Active-overlap query/coordination mechanism |
| Different users, same visible key | Independent namespaces; no cross-user result | Owner-scoped key namespace |
| Simultaneous requests across server instances | Coordination must be shared-store / DB-safe; process memory insufficient | Multi-instance-safe persistence (Section 16/33) |

---

## 24. Intake Write Ordering

Conceptual ordering for future intake:

1. Authenticate
2. Authorize ordinary-user action
3. Validate content type and payload
4. Normalize payload
5. Verify ownership
6. Check rate limit
7. Resolve idempotency identity
8. Coordinate duplicate/concurrency decision
9. Perform durable intake
10. Record safe result (including idempotency outcome mapping if applicable)
11. Return response

**Note:** Exact implementation ordering requires later review against the selected persistence and coordination mechanisms. This sequence is a design constraint, not executable code.

---

## 25. Network Timeout Recovery

| Rule | Contract |
|------|----------|
| Meaning of timeout | Timeout does **not** prove failure |
| Client key reuse | Client must reuse the same idempotency key for the same intended submission |
| Status read | Client may read current status |
| Server duty | Must **not** create a second row merely because response delivery failed |
| Ambiguity representation | Must not be represented as success or failure without evidence |
| Messaging | User messaging remains truthful (UI Flow Design; API ambiguous category) |

---

## 26. Ambiguous Persistence Result

| Rule | Contract |
|------|----------|
| Definition | Database write outcome unknown to the application |
| Response | Stable ambiguous category (`AMBIGUOUS_RESULT`; `503` or `409` with status-check guidance per API Contract) |
| New-key retry | **No** automatic new-key retry |
| Preferred recovery | Status re-read and/or idempotent replay with the **same** key |
| Correlation | Correlation id required |
| Escalation | Operator/support escalation may be needed |
| Forbidden | No false `201` |

---

## 27. Read Operation Concurrency

Posture for current status, history, and direct lookup:

| Topic | Contract |
|-------|----------|
| Ownership | Ownership-scoped reads only |
| Ordering | Deterministic ordering for “current” and history lists (exact sort fields per API Contract) |
| Pagination consistency | Exact consistency model **unresolved**; must not invent cross-page mutable cursors without design |
| Stale-but-safe display | Allowed; reads may be slightly stale |
| Caching | No public caching; `private, no-store` posture per API Contract |
| Leakage | No cross-user leakage |
| Mutations | Reads do **not** mutate workflow state |

---

## 28. Validation Concurrency

| Topic | Contract |
|-------|----------|
| Freshness | Fresh state read before validation/rejection |
| Validate vs reject race | Only one terminal/milestone outcome may lawfully commit; loser receives conflict |
| Duplicate validate | After `validated_at` set, repeats fail closed (set-once) |
| Stale operator page | Stale UI action fails safely with conflict category |
| Already terminal | Conflict; no overwrite |
| Response | Stable conflict category; no silent success |
| Audit | Operator identity required on privileged mutation |
| Overwrite | **No** silent overwrite |

---

## 29. Execution Concurrency

| Topic | Contract |
|-------|----------|
| Authorization | Fresh authorization on each privileged execute |
| State read | Fresh request-state read before effects |
| Capability | Execution capability check must pass at call time |
| Validation milestone | Stale/missing milestone fails closed for `executed` path |
| Simultaneous executes | At most **one** accepted execution path |
| Target inventory | **No** caller-supplied target inventory for account-wide attribution |
| Retry | **No** blind retry |
| Ambiguity | Ambiguous result → review path (Operator Authorization Design) |

---

## 30. Validation Versus Execution Race

| Scenario | Contract |
|----------|----------|
| Execution starts while another operator rejects | Terminal state wins; loser observes conflict / non-eligible; no partial workflow mutation left as success |
| Validation repeats while execution starts | Milestone immutability + eligibility re-check; conflicts fail closed |
| Stale UI shows actionable state | Server re-check denies stale action |
| Terminal state wins | `executed` / `rejected` immutable per migration |
| Partial mutation | Conflicts must not produce a committed half-success presentation |
| Final ordering mechanism | Remains **implementation-dependent**; not selected here (Section 33) |

---

## 31. Stale-State Protection

Conceptual preconditions before privileged mutation:

- Expected current state
- Expected validation milestone
- Terminal-state check
- Operator capability
- Environment
- Correlation identity

Binding statements:

- Stale actions **fail safely**.
- **No** hidden last-write-wins behavior.
- **No** SQL mechanism is selected here.

---

## 32. Terminal Immutability

| Rule | Contract |
|------|----------|
| Terminal states | `executed` and `rejected` are terminal |
| Validated milestone | `validated_at` is **not** a fourth `request_state` |
| No reopen | Terminal requests cannot return to `received` |
| Replay | Terminal outcome cannot be overwritten by intake replay or operator replay |
| Later operator actions | Receive conflict |
| F-P2-3 | Forbids post-terminal attribution append (Section 41) |

---

## 33. Coordination Mechanism Options

Conceptual evaluation only. **Do not select or describe SQL implementation.**

| Mechanism | Correctness | Availability | Multi-instance | Failure modes | Operational complexity |
|-----------|-------------|--------------|----------------|---------------|------------------------|
| Database uniqueness | Strong if correctly constrained | Depends on DB | Strong | Constraint violations under race (must map to conflict, not 500-leak) | Requires migration gate — **not authorized now** |
| Conditional update | Strong for milestone/terminal transitions | High | Strong | Lost update if predicate weak | Medium; aligns with set-once fields |
| Transaction-level serialization | Strong for execute atomicity | Contended under load | Strong | Timeouts/deadlocks | Medium–high |
| Advisory locking | Strong if scoped well | Lock contention | Strong within DB | Lock timeout; forgotten unlock on crash (session-end usually releases) | Medium; **not authorized now** |
| External distributed lock | Variable | Depends on lock service | Strong if shared | Split brain if misconfigured | High |
| Durable idempotency registry | Strong for intake replay | Depends on store | Strong if shared | TTL expiry ambiguity if poorly defined | Medium |
| Queue serialization | Strong for ordered work | Queue lag | Strong | Poison messages; retry storms | High; worker not authorized |

---

## 34. Lock Scope and Duration Principles

| Principle | Contract |
|-----------|----------|
| Scope | Narrowest safe lock scope |
| Identity considerations | May consider user / key / target identity — exact scope unresolved |
| Duration | Bounded |
| Browser interaction | No lock held across browser interaction |
| Crash recovery | Locks must not strand the system indefinitely |
| Timeout handling | Lock/timeout → fail closed / conflict; no blind continue |
| Global lock | **Forbidden** |
| Indefinite lock | **Forbidden** |

**No lock implementation is authorized.**

---

## 35. Future Worker and Job Identity

If a worker is later approved (none authorized now):

| Topic | Contract |
|-------|----------|
| Durable identity | Each job needs durable identity |
| Separation | Job identity is distinct from intake idempotency key |
| Retries | Bounded |
| Deduplication | Required |
| Environment | Environment-scoped |
| Privileged execution linkage | Human operator linkage retained for privileged execution accountability where required |
| F-P2-3 | No post-terminal attribution job |
| Authorization now | **No worker authorized** |

---

## 36. Retry Classification

### Categories

| Category | Meaning |
|----------|---------|
| Safe automatic retry | Narrow, non-destructive cases only if later explicitly approved |
| Safe user-triggered replay | Same key + same payload intake replay |
| Status-read recovery | Preferred after timeout/ambiguity |
| Operator-reviewed retry | Required before any re-execution attempt |
| Prohibited retry | Blind execution retry; new-key retry after ambiguous persistence; post-terminal attribution |

### Failure mapping

| Failure | Retry posture |
|---------|---------------|
| Transient read failure | Status-read recovery / safe read retry |
| Rate limit | Delayed retry per `retryable` / retry-after guidance; do not bypass limits |
| Malformed payload | Non-retryable until corrected; new key only for new intended corrected submission |
| Authorization denial | Non-retryable without privilege change |
| Duplicate conflict | Non-mutating recovery (open existing request / follow conflict guidance) |
| Ambiguous persistence | Same-key replay and/or status read; **no** new key |
| Ambiguous execution | Operator-reviewed only; **no** blind retry |
| Terminal conflict | Prohibited mutating retry |

---

## 37. Rate-Limit Interaction

| Rule | Contract |
|------|----------|
| Idempotent replay counting | Still counts according to **approved** deletion rate-limit policy (exact counting rule unresolved) |
| Duplicate floods | Cannot bypass rate limits via key rotation or mismatch spam |
| Status polling | Separate limits from intake |
| Operator actions | Stricter posture than ordinary intake |
| Limiter failure (intake) | Remains **unresolved**; scan fail-open in `lib/rateLimit.ts` is **not** inherited |
| Privileged execution | **Fails closed** if authz/limiter dependency cannot be assured under approved policy |
| Scan limiter reuse | Current scan limiter is **not** automatically reused |

---

## 38. Abuse and Resource Exhaustion

| Threat | Bounding principle (non-numeric) |
|--------|----------------------------------|
| Unbounded unique keys | TTL + per-user key cardinality bounds + rate limits |
| High-cardinality user keys | Detect and throttle; do not retain forever |
| Deliberate key mismatch floods | Rate limit + audit; stable conflict without expensive disclosure |
| Repeated semantic duplicates | Duplicate-active policy + rate limits |
| Polling storms | Separate status polling limits |
| Lock exhaustion | Narrow scope, bounded duration, fail closed |
| Stale job accumulation | If workers later approved: bounded retries + dead-letter/review |
| Operator conflict spam | Privileged rate limits + audit |

Safe detection principles: correlate by user, operator, route class, and decision category; alert on sustained conflict/mismatch/ambiguous spikes. No numeric limits are invented here.

---

## 39. Response and HTTP Semantics

Align with accepted API Contract Design:

| Scenario | Conceptual response |
|----------|---------------------|
| New intake | `201` with new request id |
| Replay (same key + same payload) | `200` with original safe result |
| Key mismatch | `409` / `IDEMPOTENCY_KEY_REUSE_MISMATCH` |
| Duplicate active request | `409` / `DUPLICATE_ACTIVE_REQUEST` (or approved return-existing success shape if that policy is accepted) |
| Stale operator action | `409` / `CONFLICT` |
| Already terminal | `409` / conflict or already-completed category as applicable |
| Rate limited | `429` / `RATE_LIMITED` |
| Ambiguous persistence | `503` or `409` with `AMBIGUOUS_RESULT` + status-check guidance |
| Ambiguous execution | Ambiguous category + operator review path; no assumed success |
| Internal failure | `500` / `INTERNAL_ERROR` |

Do not expose database constraint names or SQLSTATE.

---

## 40. Audit and Observability

### Conceptual events

- Idempotency key accepted
- Replay served
- Mismatch rejected
- Duplicate conflict
- Race detected
- Stale validation rejected
- Stale execution rejected
- Ambiguous persistence
- Ambiguous execution
- Retry attempted
- Retry prohibited

### Safe record fields

- Correlation id
- Actor category (user / operator / system)
- Operator identity where privileged
- Request id (when known)
- Safe scope
- Decision category
- **No** raw secret key logging and **no** sensitive payload logging (full images, medical content, credentials)

Full idempotency key logging is discouraged; if operationally required later, prefer truncated/hashed forms under a separate logging policy.

---

## 41. F-P2-3 Concurrency Enforcement

Binding application invariant under concurrent attempts:

- Account-wide targets are finalized **before** original atomic execution commits.
- Concurrent **append** operations do not exist as an authorized application path.
- No idempotency key authorizes append attribution.
- No retry path creates post-terminal attribution.
- No operator or worker race can schedule append work after terminal `executed`.
- Database capability (accepted residual that a privileged insert may still be physically possible) **does not** create application permission.
- Future tests must prove **absence** of post-terminal attribution under concurrent attempts.

Verification candidate note: `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` records F-P2-3 as an accepted residual INFO observation, not as application authorization to append.

---

## 42. Failure and Recovery Matrix

| Operation | Failure / race | Known or ambiguous | Retry posture | Required next action | Message category | Audit |
|-----------|----------------|--------------------|---------------|----------------------|------------------|-------|
| Intake | Network timeout after unknown write | Ambiguous | Same-key replay + status read | Check current status | `AMBIGUOUS_RESULT` / status guidance | Correlation + attempt |
| Intake | Same key + same payload after success | Known | Safe replay | Show existing request | Success replay | Replay served |
| Intake | Same key + different payload | Known | Prohibited under same key | New key only if new intent | `IDEMPOTENCY_KEY_REUSE_MISMATCH` | Mismatch rejected |
| Intake | Semantic active duplicate (new key) | Known | Non-mutating | Open existing / conflict UX | `DUPLICATE_ACTIVE_REQUEST` | Duplicate conflict |
| Intake | Rate limited | Known | Delayed | Wait / retry-after | `RATE_LIMITED` | Rate-limit event |
| Status read | Transient read failure | Ambiguous/transient | Safe read retry | Retry read | Internal / temporary | Read failure |
| Validate | Stale / already validated | Known | Prohibited overwrite | Refresh; conflict | `CONFLICT` | Stale validation rejected |
| Reject | Already terminal | Known | Prohibited | Refresh | `CONFLICT` | Terminal conflict |
| Execute | Simultaneous execute | Known (one winner) | Loser: no blind retry | Winner proceeds; loser refreshes | `CONFLICT` | Race detected |
| Execute | Ambiguous commit | Ambiguous | Operator-reviewed only | Ambiguous-result review | Ambiguous execution | Ambiguous execution |
| Execute | Terminal already | Known | Prohibited | Stop | `CONFLICT` / already completed | Retry prohibited |
| Any | Authz denial | Known | Non-retryable | Re-auth / privilege path | Unauthenticated / forbidden | Denial audit |
| Account-wide execute | Post-terminal append attempt | Known forbidden | **Prohibited** | None — absence required | Internal deny | F-P2-3 enforcement |

---

## 43. Test Matrix

Future application/concurrency tests (separate from Block A and Block B database verification):

| # | Scenario |
|---|----------|
| 1 | Missing key |
| 2 | Malformed key |
| 3 | Same key + same payload |
| 4 | Same key + different payload |
| 5 | Cross-user same key |
| 6 | Same semantic request + different keys |
| 7 | Double-click |
| 8 | Concurrent server instances |
| 9 | Timeout after write |
| 10 | Timeout before write |
| 11 | Duplicate-active policy |
| 12 | Validation race |
| 13 | Validation/execution race |
| 14 | Simultaneous execution |
| 15 | Terminal replay |
| 16 | Stale operator session |
| 17 | Rate-limit interaction |
| 18 | Lock failure (if locks later approved) |
| 19 | Ambiguous result |
| 20 | F-P2-3 append absence |
| 21 | No PROD interaction |

These tests are **not** substitutes for Block A/B and are **not authorized** now.

---

## 44. Future Implementation Decomposition

Smallest safe packages — **documentation of future work only; not authorized now.**

| # | Package | Dependencies / gates |
|---|---------|----------------------|
| 1 | Final idempotency policy (required vs optional key) | This design accepted; API/UI acceptance |
| 2 | Persistence mechanism decision | Package 1; no silent schema invention; migration gate if DB registry chosen |
| 3 | Canonical fingerprint contract | Packages 1–2; API Contract alignment |
| 4 | Intake key validation | Packages 1–3; auth in-handler |
| 5 | Replay response | Packages 2–4 |
| 6 | Key-mismatch conflict | Packages 3–5 |
| 7 | Duplicate-active coordination | Duplicate policy accepted; DEV migration applied; Block A PASS |
| 8 | Status-read recovery | API read contract; ownership scope |
| 9 | Validation stale-state handling | Operator Authorization Design; conditional update posture |
| 10 | Execution concurrency guard | Execution Orchestration Design (next); atomic execute path |
| 11 | Worker/job identity decision | Only if worker separately proposed/approved |
| 12 | Audit and abuse controls | Security and Abuse Design; observability policy |
| 13 | Concurrency tests | Packages above; DEV-only; no PROD |

Each package remains blocked while DEV gate is blocked and migration is unapplied.

---

## 45. Open Decisions

Unresolved only — **do not resolve unsupported decisions here:**

1. Key required versus optional
2. Key length/format
3. Fingerprint serialization
4. Persistence medium
5. TTL
6. Duplicate-active policy
7. Conflict versus return-existing behavior
8. Concurrency coordination mechanism
9. Lock scope
10. Limiter interaction (including whether idempotent replays consume quota)
11. Pagination consistency
12. Worker/job model
13. Ambiguous-result escalation owner
14. Retry thresholds
15. Observability retention
16. Any future schema change

---

## 46. Implementation Preconditions

Implementation remains **prohibited** until all of the following are true:

- Separate SkinIntel DEV project exists
- Migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required
- Technical Design accepted
- API Contract Design accepted
- UI Flow Design accepted
- Security and Abuse Design accepted
- Operator Authorization Design accepted
- This Idempotency and Concurrency Design accepted
- Persistence mechanism selected
- Duplicate-active policy accepted
- TTL accepted
- Concurrency coordination mechanism accepted
- Rate-limit interaction accepted
- Exact execution baseline approved
- Final security review accepted

---

## 47. Hard Stops

Stop if any of the following are true:

- DEV unresolved
- PROD denylist match
- Migration unapplied
- Durable idempotency claimed without mechanism
- Invented database uniqueness guarantee
- Cross-user replay possible
- Same key/different payload creates a row
- Ambiguous result retried with a new key
- Duplicate-active policy unresolved at implementation time
- Race handling relies only on UI
- Stale operator action silently succeeds
- Multiple execution paths can run concurrently
- Terminal state overwritten
- Blind execution retry
- Unbounded key storage
- Post-terminal attribution retry exists
- Secrets or full idempotency keys logged unsafely
- Scope creep into account or billing deletion

---

## 48. Current Authorization Boundary

### Authorized now

- Creation and review of this Idempotency and Concurrency Design

### Not authorized

- Idempotency implementation
- Persistence changes
- API implementation
- UI implementation
- Worker/queue implementation
- Locking implementation
- Auth or operator changes
- Rate-limit changes
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 49. Next Safe Design Step

After acceptance, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway Execution Orchestration Design**

That step remains **documentation-only** unless separately authorized.

---

*End of document.*
