# Phase 2 Slice 2 — Application Deletion Pathway Security and Abuse Design

- Status: Draft — security and abuse design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- API implementation: not authorized
- UI implementation: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future security, threat, and abuse-control contract** for SkinIntel’s governed deletion pathway: authenticated request intake, ownership-scoped reads, operator validation, and privileged execution orchestration.

It is **security-and-abuse design only**. It does **not** authorize implementation, database execution, Supabase contact, DEV/PROD changes, API routes, UI, middleware, auth changes, rate-limit changes, workers, tests, or SQL modifications.

Layer ownership remains binding:

| Layer | Controlling artifact |
|-------|----------------------|
| Transport (HTTP methods, routes, envelopes, status codes) | Accepted API Contract Design |
| Presentation (user/operator UX, copy boundaries) | Accepted UI Flow Design |
| Persistence vocabulary and invariants | Committed migration contract |
| Application orchestration and trust zones | Accepted Pathway Plan and Technical Design |
| Security, threat, and abuse controls | **This document** |

This document **cannot silently redesign** any accepted contract above. Where a security control would conflict with a higher-precedence artifact, the conflict must be escalated as an open decision rather than resolved by invention.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

| # | Artifact |
|---|----------|
| 1 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` |
| 2 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md` |
| 3 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md` |
| 4 | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md` |
| 5 | `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` |
| 6 | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` |
| 7 | `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` |
| 8 | `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` |
| 9 | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| Supporting (service-role / privilege narrative) | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_GATE_DISPOSITION.md` and Phase 1 service-role posture documentation |

### Precedence (binding)

1. **Committed migration contract**
2. **Accepted pathway Plan**
3. **Accepted Technical Design**
4. **Accepted API Contract Design**
5. **Accepted UI Flow Design**
6. **This Security and Abuse Design**
7. **Future implementation**

Implementation may not invent scopes, states, resolution codes, identity sources, attribution operations, or privilege widenings that conflict with higher-precedence artifacts.

---

## 3. Current Repository Security Posture

Read-only inspection at repository baseline. Claims cite exact paths. **No inspected file was modified.**

### Separation of layers

| Layer | Content |
|-------|---------|
| **Current repository posture** | This section |
| **Accepted future security contract** | Sections 4–37 |
| **Unresolved security decisions** | Section 41 |
| **Implementation prerequisites** | Section 42 |

### 3.1 Authentication helper — `auth.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | NextAuth v5 configuration; Credentials + Google + GitHub providers; exports `{ handlers, signIn, signOut, auth }`. Credentials path validates via `loginSchema` from `lib/zod.ts` and `getUserFromDb`. |
| **Security assessment** | Authoritative session helper for the application. Provider secrets use server env (`GOOGLE_*`, `GITHUB_*`). |
| **Gap vs future deletion pathway** | Deletion handlers must call `auth()` in-handler; absence of email must fail closed. No replacement auth system is authorized. |

**`auth.config.ts`:** **Not present** in the repository. No separate Auth.js config file was found.

### 3.2 Middleware matchers — `middleware.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Wraps `auth`; redirects unauthenticated users to `/auth/login`. Matcher: `/dashboard/:path*`, `/history`, `/history/:path*` only. |
| **Security assessment** | Partial page protection only. |
| **Gap** | Does **not** protect `/api/*`. Deletion APIs must not treat middleware as authentication or authorization. |

### 3.3 Proxy API behavior — `proxy.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Auth gate for non-public page routes; explicitly skips paths starting with `/api` (and `/_next`, favicon, images, manifest). |
| **Security assessment** | Unrelated to API auth enforcement. |
| **Gap** | Must not be cited as deletion API protection. |

### 3.4 Current deletion stub — `app/api/delete-request/route.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | `POST` only; parses optional client `body.email` and `body.message`, discards them; swallows JSON parse errors; always returns `200` `{ success: true, message: "Delete request received" }`. No `auth()`, no rate limit, no persistence. |
| **Security assessment** | **Unsafe / incomplete / non-authoritative stub.** Client identity pattern; unconditional success; no audit. |
| **Gap** | Must be replaced/deprecated per API Contract Design; must not remain a user success pathway once the governed family is activated. |

### 3.5 Scan route auth pattern — `app/api/scan/route.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | `const session = await auth()`; rejects without `session?.user` (`401`); requires `session.user.email` for persistence (`401` if absent); uses server-side `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`; applies `checkScanRateLimit`; manual FormData validation; image size cap; consent gates; user-safe `{ error }` responses; internal `console.error`. |
| **Security assessment** | **Best current authenticated API reference** for handler-level auth, server-derived identity, service-role usage, and safe error split. |
| **Gap** | Deletion must adopt equivalent auth/safe-error patterns; must **not** reuse scan rate-limit numbers or fail-open posture without separate approval; must not copy FormData patterns for JSON deletion intake. |

### 3.6 Interest route (anti-pattern for identity) — `app/api/interest/route.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Unauthenticated `POST`; accepts client `email`/`consent`; service-role insert into `interest_leads`; logs `{ email, consent }`. |
| **Security assessment** | Acceptable only as lead capture; **unsafe template for deletion identity**. |
| **Gap** | Deletion must never treat client-supplied email as requester authority. |

### 3.7 Server service-role usage — `app/actions/index.ts` and inline clients

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Server actions call `auth()`, then `createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)` and filter by `session.user.email` (e.g. `getLatestAnalysis`, reminder preferences). Same env pattern appears in `app/api/scan/route.ts` and history server pages. |
| **Security assessment** | Established server-only service-role pattern; RLS bypass implied by service-role. Ownership must be enforced in application filters. |
| **Gap** | Deletion governance writes must remain in a narrow server module; client must never receive service-role credentials; ownership filtering remains mandatory. |

### 3.8 Anonymous Supabase client — `lib/supabase.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Browser/anon client using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| **Security assessment** | Client-safe anon helper only. |
| **Gap** | Unsuitable for governance writes; must never receive `SUPABASE_SERVICE_ROLE_KEY`. |

### 3.9 Rate limiter — `lib/rateLimit.ts`

| Aspect | Finding |
|--------|---------|
| **Current behavior** | `checkScanRateLimit(userKey)` via Upstash Redis; **10 requests / hour / userKey**; if Redis config missing or Redis errors → **`allowed: true` (fail-open)** with `console.error`. |
| **Security assessment** | Scan-specific; fail-open is a deliberate current product choice for scans, **not** a security default for privileged deletion. |
| **Gap** | Deletion requires separately designed limits; scan limiter must not be reused without review; fail-open must not silently authorize privileged validation/execution. |

### 3.10 Validation approach — `lib/zod.ts` and route handlers

| Aspect | Finding |
|--------|---------|
| **Current behavior** | `lib/zod.ts` defines login/register/password/form schemas; used by Credentials authorize in `auth.ts`. Scan API uses manual FormData checks. Deletion stub has no meaningful validation. |
| **Security assessment** | Zod is an available repository dependency (`package.json`); no shared deletion DTO validator exists. |
| **Gap** | Future deletion intake requires reject-closed JSON validation (unknown fields rejected) before durable effects. Library choice remains an implementation detail; posture is mandatory. |

### 3.11 Environment variable handling

| Aspect | Finding |
|--------|---------|
| **Current behavior** | Server secrets used as `process.env.SUPABASE_URL`, `process.env.SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, Upstash Redis vars, OAuth client secrets. Public anon keys via `NEXT_PUBLIC_*` in `lib/supabase.ts`. |
| **Tracked env documentation** | **No `.env.example` (or equivalent tracked environment template) found** in the repository. |
| **Local config note (from accepted procedure)** | `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` records that current `.env.local` points at **PROD** and must not be treated as DEV proof. This document does not read or reproduce credentials. |
| **Gap** | Deletion implementation must keep service-role server-only; deny `NEXT_PUBLIC_*` for service-role; enforce DEV≠PROD identity gates. |

### 3.12 Existing error behavior

| Path | Behavior |
|------|----------|
| `app/api/scan/route.ts` | User-safe `{ error }` (+ occasional `failure_stage`); statuses `401`/`403`/`400`/`413`/`429`/`500`; internals to `console.error` |
| `app/api/interest/route.ts` | `{ error: "..." }` or `{ success: true }` |
| `app/api/delete-request/route.ts` | Always success — **unsafe** |
| Shared error helper | **Not found** under `lib/` |

**Gap:** Deletion must use a stable safe public error envelope (API Contract Design) with no SQLSTATE/secret/operator-note leakage.

### 3.13 Config / deploy surfaces

| Path | Finding |
|------|---------|
| `package.json` | Next `15.5.7`, `next-auth` `^5.0.0-beta.29`, `@supabase/supabase-js`, `zod`, `@upstash/redis`, etc. |
| `next.config.ts` | Image remotePatterns for Google/GitHub avatars only |
| `next.config.js` | `eslint.ignoreDuringBuilds: true`; empty redirects |
| `vercel.json` | Build env `NPM_CONFIG_LEGACY_PEER_DEPS=true` only; no security header policy |

**Gap:** Cache/security headers for deletion responses require future implementation review; none are authorized here.

### 3.14 Execution posture (governance)

| Source | Finding |
|--------|---------|
| `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md` | DEV execution gate **BLOCKED** — separate DEV project not provisioned |
| Committed migration | Present as candidate; **not applied** |
| PROD | Denylisted in `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` |

---

## 4. Security Objectives

Future deletion pathway security must achieve:

| Objective | Meaning |
|-----------|---------|
| **Authenticated ownership** | Only authenticated owners may submit/read their requests |
| **Operator authorization** | Validation/execution require server-side authorization beyond ordinary login |
| **Least privilege** | Users never gain workflow mutation or attribution write power |
| **Server-derived identity** | Requester identity comes only from trusted session data |
| **Request integrity** | Closed scope vocabulary; reject-closed payloads; no client workflow fields |
| **Safe retries** | Intake idempotency; no blind execution retry |
| **Non-enumeration** | Cross-user lookup does not disclose existence |
| **No secret leakage** | No service-role, SQL internals, or secrets in responses/logs |
| **Auditable privileged actions** | Operator validate/execute always attributable |
| **Truthful deletion outcomes** | No universal-erasure claims |
| **No PROD testing** | PROD denylist hard stop |
| **Fail-closed privileged execution** | Missing auth, ownership uncertainty, or authz failure denies privileged effects |

---

## 5. Protected Assets

| Asset | Why protected |
|-------|----------------|
| User identity (`session.user.email` / requester `user_email`) | Ownership root |
| Deletion request rows | Governance state machine |
| Request targets (scan/evidence identifiers) | Cross-user discovery risk |
| Validation milestones (`validated_at`) | Privileged progress signal |
| Terminal states (`executed` / `rejected`) | Irreversible workflow outcomes |
| Execution attribution rows | Audit of lifecycle effects |
| Evidence eligibility / lifecycle state | Product and privacy impact |
| Service-role credentials | Full DB privilege bypass |
| Operator identity | Accountability for privileged acts |
| Logs and audit evidence | Integrity and privacy of support/security review |
| Residual / privacy disclosures | Legal/trust truthfulness |

---

## 6. Actor and Adversary Model

| Actor / adversary | Capability assumption | Primary risk |
|-------------------|----------------------|--------------|
| **Unauthenticated external caller** | Public HTTP access | Unauthorized intake/read; stub abuse |
| **Ordinary authenticated user** | Valid session for own account | Legitimate use within ownership |
| **Malicious authenticated user** | Valid session; hostile intent | Cross-user enumeration; forged targets; flood; spoofed identity fields |
| **Authorized operator** | Session + approved operator authz | Validate/execute under policy |
| **Compromised operator session** | Stolen operator cookie/session | Arbitrary reject/execute |
| **Server / orchestrator** | Process secrets; service-role | Correct mediation or catastrophic misuse |
| **Future worker** | If later approved | Retry abuse; post-terminal attribution |
| **Insider with infrastructure access** | Env/logs/DB access | Credential theft; audit tampering |
| **Automated abuse client** | Scripted high volume | Duplicate flood; rate-limit pressure |
| **Accidental duplicate submitter** | Double-click / retry | Unintended duplicate `received` rows |

---

## 7. Trust Boundaries

| Boundary | Trust rule |
|----------|------------|
| **Browser ↔ Next.js server** | Browser is untrusted for identity, workflow fields, attribution, and secrets |
| **Session provider ↔ route handler** | Handler must re-verify session via `auth()`; middleware alone is insufficient |
| **Route handler ↔ Supabase** | Server mediates; service-role stays server-side; ownership filters mandatory when bypassing RLS |
| **Ordinary user ↔ operator APIs** | Distinct namespace and authorization; ordinary login ≠ operator privilege |
| **Operator UI ↔ execution orchestrator** | UI cannot supply attribution inventory or force terminal success |
| **Application ↔ external storage/residual systems** | Governed execution ≠ universal erasure |
| **DEV ↔ PROD** | Hard isolation; denylist matching; no credential crossover for execution |
| **Application logs ↔ user-visible responses** | Logs may hold redacted internal categories; responses must not |

---

## 8. Threat Model Summary

| Threat | Attacker | Affected asset | Required control | Residual risk |
|--------|----------|----------------|------------------|---------------|
| Unauthenticated submission | External caller | Request intake integrity | Handler `auth()`; fail closed; no durable effect | Stub currently returns false success until deprecated |
| Client identity spoofing | Malicious user / external | Ownership root | Ignore/reject client email; server-derived identity | Mis-normalization of email case if inconsistent |
| Cross-user enumeration | Malicious user | Request/target existence | Non-disclosing `404`; ownership filters | Timing side channels (mitigate with consistent responses) |
| Forged target identifiers | Malicious user | Foreign scan/evidence | Server ownership verification before durable intake / at validation | Race if target ownership changes between intake and execute |
| Duplicate request flood | Abuse client / accidental | Request table / ops load | Idempotency + duplicate policy + rate limits | Unbounded storage if key store poorly designed |
| Idempotency-key abuse | Malicious user | Intake integrity | User-scoped keys; mismatch → conflict; bounded format | Cross-user key collision if scoping omitted |
| CSRF | Cross-site attacker | Cookie-authenticated mutations | Session verify + same-origin expectation; Origin/Referer decision | Until CSRF posture accepted, residual browser CSRF risk |
| Session replay | Stolen cookie holder | User/operator actions | Session expiry; optional operator re-auth; logout invalidation where supported | Long-lived sessions if provider allows |
| Service-role exposure | XSS / bundle leak / misconfig | Entire DB posture | Never `NEXT_PUBLIC_*`; never return key; narrow modules | Insider with env access |
| Operator privilege escalation | Ordinary user | Validation/execution | Server-side operator authz on every privileged call | Authz mechanism still unresolved |
| Arbitrary attribution injection | Malicious operator/client | Attribution integrity | Server-derived targets only; reject caller inventory | Compromised orchestrator code |
| Post-terminal attribution | Operator/worker/insider | F-P2-3 integrity | No append API/UI/job; tests prove absence | Physical DB insert residual ≠ app authorization |
| Blind execution retry | Operator/automation | Partial/ambiguous state | Status re-read + review; no blind retry | Human error under pressure |
| Log leakage | Insider / log aggregator | Secrets, PII, medical/image content | Redaction; no secret payloads; minimize content | Misconfigured logging sinks |
| Misleading completion response | Product/UI error | User trust / compliance | Truthful residuals messaging | Copy drift if UI diverges from contract |
| PROD mis-targeting | Operator / CI / local env | Production data | Denylist hard stop; DEV identity proof | `.env.local` currently PROD-pointing if misused |

---

## 9. Authentication Contract

| Rule | Future contract |
|------|-----------------|
| Handler-level `auth()` | Every deletion user and operator route calls `auth()` from `auth.ts` |
| Missing session/email | Fail closed (`401` / unauthenticated); **no durable effect** |
| Client-supplied identity | Never authoritative; ignore or reject |
| Browser bearer / service-role | Not accepted as credentials |
| Middleware reliance | **Forbidden** as sole control (`middleware.ts` / `proxy.ts` do not protect `/api`) |
| Auth failure side effects | No governance insert, validation, or execution |

No new auth provider is invented. NextAuth remains the session source.

---

## 10. Canonical Identity and Ownership

| Topic | Contract |
|-------|----------|
| Canonical identity source | `auth()` → `session.user.email` (parity with `app/api/scan/route.ts`, `app/actions/index.ts`) |
| Normalization posture | Case-insensitive-safe comparisons aligned with migration RLS `lower(user_email)` semantics and scan path `trim().toLowerCase()` in `app/api/scan/route.ts` |
| Ownership filtering | All user reads/writes scoped to authenticated owner |
| Target ownership verification | Server-side lookup of scan/evidence ownership before durable intake eligibility and again at validation/execution |
| Cross-user lookup behavior | Direct lookup returns non-disclosing not-found |
| Incomplete identity | Fail closed; no intake |
| Arbitrary user identifier query parameters | Prohibited on user APIs |

---

## 11. Ordinary User Authorization

### Permitted

- Submit an owned deletion request (intake → `received` only)
- Read own current / latest status
- Read own history
- Read own request detail (ownership-scoped)

### Explicitly prohibited

- Validation milestone mutation
- Execution
- Any workflow state mutation
- Resolution code changes
- Execution attribution writes
- Operator metadata reads (raw notes, privileged internals)
- Cross-user filters or foreign identity parameters

---

## 12. Operator Authorization Boundary

Conceptual boundary (no RBAC implementation invented here):

| Rule | Requirement |
|------|-------------|
| Ordinary authentication | **Insufficient** for validate/execute |
| Check location | Server-side on every privileged mutation |
| Operator identity | Must be attributable in audit events |
| Service-role key alone | Proves DB privilege, **not** human authorization |
| Operator sessions | Need stronger control than end-user sessions (mechanism open) |
| Final RBAC mechanism | **Unresolved** (allowlist, role claim, admin surface, etc.) |
| This document | Defines boundary only; **implements nothing** |

---

## 13. Service-Role Security Boundary

| Control | Contract |
|---------|----------|
| Storage | Server-only environment variables (`SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`) |
| Public prefix | Never `NEXT_PUBLIC_*` |
| Client responses | Never returned to browser |
| Caller input | Never accepted as a credential |
| Module ownership | Narrow server modules only (future deletion DB adapter) |
| Client Supabase | `lib/supabase.ts` anon client must not perform governance writes |
| Logging | Redact credentials; never log full keys |
| Rotation response | On suspected exposure: revoke/rotate, audit access, hard-stop affected workflows |
| Least privilege limitation | Service-role bypasses RLS — **residual risk** requires strict application ownership/authz and audit |
| Residual risk | Insider or compromised server process can abuse broad DB privilege |

---

## 14. Route Exposure and Handler Protection

| Topic | Contract |
|-------|----------|
| User API family | Future `/api/deletion-requests` (per API Contract Design) |
| Operator API namespace | Future `/api/operator/deletion-requests/...` |
| In-handler auth | Mandatory on all above |
| Method restrictions | Mutations via approved methods only; reads via GET |
| Content-type checks | Require `application/json` for JSON mutations |
| Unknown-field rejection | Reject-closed |
| No accidental GET mutation | GET never creates/updates governance state |
| Old stub deprecation risk | `app/api/delete-request/route.ts` must not remain an active success contract alongside the new family |
| No conflicting active contracts | Dual intake authority prohibited |

No routes are created by this document.

---

## 15. CSRF and Same-Origin Protection

Future posture for cookie-authenticated mutations:

| Control | Posture |
|---------|---------|
| Session verification | Mandatory via `auth()` in mutating handlers |
| Same-origin expectation | Browser clients call same-origin deletion APIs |
| Origin / Referer checking | **Explicit open decision** — may be added as hardening; **not** claimed as an existing NextAuth/framework guarantee |
| UI controls | Insufficient (disable buttons ≠ CSRF protection) |
| Operator mutations | Session verification + stronger operator authorization |
| Replay considerations | Intake idempotency keys; execution requires status re-read, not blind replay |
| Implementation prerequisite | CSRF control remains an **implementation prerequisite** until an accepted mechanism is chosen |

Do **not** invent unsupported framework guarantees.

---

## 16. Session Security

| Scenario | Contract |
|----------|----------|
| Expired session | Fail closed; no durable privileged effect |
| Missing email | Fail closed for this pathway |
| Stale session | Re-check on each privileged call; do not cache authz indefinitely in client |
| Concurrent logout | Subsequent calls fail closed when session invalid |
| Compromised session | Treat as full account compromise for user ops; operator sessions need stronger controls |
| Session rotation | Use only where NextAuth/provider evidence supports it; do not assume features not present in `auth.ts` |
| Operator re-authentication | **Open decision** for high-risk execution |
| Evidence limit | No assumptions beyond current NextAuth evidence in `auth.ts` and observed session usage |

---

## 17. Input Validation and Reject-Closed Posture

| Topic | Contract |
|-------|----------|
| JSON content type | Required for JSON mutations |
| Malformed JSON | Reject; no durable effect |
| Empty body | Reject for submission POST |
| Request-size limit | Hard maximum required; **exact bytes unresolved** |
| UUID validation | Strict for request id and target ids |
| Closed scope vocabulary | Exact migration set only |
| Scope-target matrix | Enforce before durable intake |
| Unknown fields | **Rejected** |
| Whitespace / normalization | Trim enums/tables; email normalized only from session |
| Free-text operator / attribution payload | Not accepted from callers |
| Validation order | Validate **before** durable effects |

---

## 18. Target Ownership and Enumeration Resistance

| Control | Contract |
|---------|----------|
| Ownership check | Server-side only |
| Cross-user scan/evidence discovery | Denied |
| Direct lookup | Non-disclosing response for missing **and** non-owned |
| Timing / error-message consistency | Prefer uniform status and safe messages |
| User identifier filters | Forbidden on user APIs |
| History / status scope | Bound to session identity |

---

## 19. Idempotency Security

| Topic | Contract |
|-------|----------|
| Key scope | **User-scoped** (key alone must not cross accounts) |
| Key format | Bounded length/charset |
| Same key + same payload | Safe replay of prior successful intake |
| Same key + different payload | Conflict; no silent overwrite |
| Cross-user key reuse | Must not grant access or merge identities |
| Storage / TTL | **Unresolved** (no idempotency column in committed migration) |
| Invented DB uniqueness | **Forbidden** for active requests |
| Ambiguous response recovery | Client re-reads status; server does not invent success |
| DoS from unbounded key storage | Require TTL/bounded store when implemented |

---

## 20. Duplicate and Concurrency Abuse

| Scenario | Control |
|----------|---------|
| Browser double-submit | UI disable-on-submit + idempotency |
| Automated repeated intake | Rate limits + duplicate policy + audit |
| Duplicate active request | Application policy (reject vs return existing — **open**) |
| Racing identical submissions | Conflict handling without inventing DB uniqueness |
| Stale operator validation | Re-read state; set-once milestone |
| Simultaneous validation/execution | Second actor fails closed on conflict/terminal |
| Terminal immutability | Migration transition guard + app refusal |
| Conflict handling | Safe `409`/conflict categories per API contract |
| Blind retry | **Prohibited** for execution |

---

## 21. Rate-Limit Architecture

Separate **conceptual** limit classes (no numeric values selected here):

| Class | Purpose |
|-------|---------|
| Submission | Bound durable intake creation |
| Status polling | Bound current-status polling |
| History / detail reads | Bound list/detail abuse |
| Operator validation | Bound privileged validation attempts |
| Operator execution | Bound high-risk execution attempts |

Binding statements:

- Exact numeric limits are **unresolved**
- Current scan limiter (`lib/rateLimit.ts`) is **scan-specific**
- Current **fail-open** behavior is **not** automatically reused
- User, IP, route, and operator dimensions require review
- **No numeric values are selected in this document**

---

## 22. Fail-Open Versus Fail-Closed Decisions

| Situation | Decision |
|-----------|----------|
| Privileged validation / execution | **Fail closed** |
| Missing auth | **Fail closed** |
| Ownership uncertainty | **Fail closed** |
| Rate-limiter dependency failure | Must be an **explicit** approved decision for deletion (scan fail-open is not inherited) |
| Observability / audit pipeline failure | Must **not** silently authorize execution |
| User status reads | May have a different availability posture than privileged mutations (availability vs integrity trade-off — review at implementation) |
| Exact intake limiter failure behavior | **Open** |

---

## 23. Abuse Detection Signals

Safe conceptual signals (no sensitive payload logging):

- Repeated unauthorized attempts
- Ownership mismatches
- Duplicate floods
- Invalid scope patterns
- Idempotency mismatches
- Operator conflicts
- Repeated ambiguous execution outcomes
- Unusual request velocity
- PROD denylist match (execution/environment gate)

Do **not** log image bytes, full medical/description content, secrets, or raw operator notes in abuse telemetry.

---

## 24. Error and Information Leakage Controls

### Prohibit exposure of

- SQLSTATE
- Constraint names
- Unnecessary table/object names
- Stack traces
- Secrets
- Service-role values
- Raw operator notes
- Another user’s request existence
- Internal target inventory

### Safe public categories

Use stable public codes and user-safe messages per API Contract Design (e.g. unauthenticated, invalid request, conflict, rate limited, not found, internal error, ambiguous result), plus correlation identifiers for support.

---

## 25. Logging and Audit Security

Required conceptual fields for privileged and intake events:

| Field | Rule |
|-------|------|
| Correlation id | Always preferred |
| Actor category | User / operator / system |
| Authenticated identity | Protected logs only; minimize exposure |
| Operator identity | Required on validate/execute |
| Safe scope | Closed vocabulary value only |
| Action / result | Attempted / accepted / rejected / conflict / failed / ambiguous |
| Affected counts | Execution only; aggregate |
| Redacted error category | Internal category, not raw exception |
| Timestamp | Always |
| Secret payloads | Never |
| Medical / image content | Not logged unnecessarily |
| Retention | Policy-controlled; not invented here |

No new database audit columns are authorized by this document.

---

## 26. Privacy and Data Minimization

| Rule | Contract |
|------|----------|
| Field collection | Only fields required by accepted API contract |
| Client email | Not accepted as authority |
| Free text | No unnecessary free text; stub `message` is not durable input |
| Image content in request logs | Forbidden |
| Raw operator notes to users | Forbidden |
| Support correlation | Via correlation id + owner-scoped status |
| Analytics | Non-sensitive events only |

---

## 27. F-P2-3 Security Enforcement

Binding application security rules (no database redesign):

1. All intended **account-wide** attribution is derived **before** execution commit planning and persisted **only** in the original atomic execution transaction.
2. There is **no** append-attribution endpoint.
3. There is **no** post-terminal UI action for attribution.
4. There is **no** operator workaround to append after terminal `executed`.
5. There is **no** worker retry job that appends post-terminal attribution.
6. Database physical capability ≠ application authorization.
7. Future tests must prove **absence** of the operation and non-scheduling of post-terminal attribution.

---

## 28. Execution Integrity

| Rule | Contract |
|------|----------|
| Affected targets | Server-derived only |
| Caller-supplied affected-table inventory | Forbidden |
| Transaction | One atomic execution transaction |
| Terminal state | Only after governed work **and** required attribution succeed |
| Deferred consistency | Must be able to pass |
| Ambiguous outcome | Status re-read + operator review |
| Blind retry | Prohibited |

No SQL statements are described in this document.

---

## 29. Worker and Retry Security

If a future worker is **separately approved** (none is authorized now):

| Control | Posture |
|---------|---------|
| Identity | Separately authorized worker identity |
| Operation set | Narrow; same invariants as orchestrator |
| Post-terminal attribution | Forbidden |
| Job identity | Idempotent |
| Retries | Bounded |
| Ambiguous terminal result | No retry without human/operator review |
| Poison messages | Quarantine + audit; do not loop forever |
| Audit linkage | Correlate to originating request/execution |
| Authorization now | **No worker is authorized** |

---

## 30. Operator Abuse and Insider Risk

| Risk | Control direction |
|------|-------------------|
| Unauthorized operator access | Server-side authz; deny ordinary users |
| Excessive privilege | Least privilege; separate validate vs execute if later policy requires |
| Self-approval / execution | **Segregation of duties remains an open decision** — not invented here |
| Arbitrary rejection | Closed resolution codes only; audit |
| Arbitrary attribution | Server-derived targets only |
| Operator note leakage | Never expose raw notes to end users |
| Stale request execution | Fresh status re-read; conflict on terminal/non-eligible |
| Audit tampering | Protect log sinks; correlation; retention policy |
| Emergency credential revocation | Rotate service-role and invalidate operator access paths |

Do **not** invent final segregation-of-duties policy in this document.

---

## 31. Operator Confirmation and High-Risk Actions

| Control | Contract |
|---------|----------|
| Explicit confirmation | Required before execution |
| Fresh status read | Required immediately before execute |
| Request identity and scope review | Operator must see request id + scope (safe fields) |
| Server-derived targets | Display/derive server-side; not editable inventory |
| Editable attribution | Forbidden |
| Optional re-authentication | **Open decision** |
| Stale / conflict response | Fail closed with conflict category |
| Blind retry | Forbidden |

---

## 32. Storage and External Residual Security

Known residual categories (from accepted pathway artifacts):

- VPS images / object storage binaries
- Storage references
- localStorage / client caches
- Exports / downloads
- Email copies
- Logs / audit records
- Cached summaries
- AI-derived artifacts outside excluded rows
- Backups / CDN edge copies

Binding statements:

- Slice 2 governed execution does **not** prove universal erasure
- Residual systems need separately governed lifecycle decisions
- UI and API messaging must remain truthful (no “everything deleted”)

---

## 33. Secrets and Environment Controls

| Control | Contract |
|---------|----------|
| Environment variables | Server-only for secrets |
| `NEXT_PUBLIC_*` for service-role | **Denied** |
| Environment separation | DEV credentials ≠ PROD credentials |
| PROD credentials in DEV workflow | Forbidden |
| Secrets in logs or Git | Forbidden |
| Terminal output with credentials | Forbidden in evidence/reports |
| Incident rotation | Revoke/rotate on exposure suspicion |
| Current `.env.local` → PROD | Documented in `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md`; **not** DEV authorization |

No tracked `.env.example` was found; future env documentation must still forbid public service-role exposure.

---

## 34. DEV and PROD Isolation

Recorded from accepted governance artifacts (`docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md`, `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md`):

- No separate SkinIntel DEV project exists (gate **BLOCKED**)
- DEV execution gate is blocked
- PROD ref and host are denylisted by accepted procedure (typed matching semantics)
- No local env value proves authorization
- All future execution requires exact target verification
- Any PROD denylist match is an immediate hard stop

Denylist identities (non-credential): project ref `rbukikinzyhyaixjvnhf`; exact project name `skinintel` (exact-name match only); host `rbukikinzyhyaixjvnhf.supabase.co`; region context `eu-west-1 — West EU (Ireland)` (never sufficient alone). Matching semantics remain those locked in the DEV apply procedure.

---

## 35. Cache, Headers, and Browser Security

Future posture:

| Response class | Posture |
|----------------|---------|
| User-specific status / history / lookup | `Cache-Control: private, no-store` |
| Mutations and sensitive errors | `no-store` |
| Content-Type | Stable `application/json` for JSON APIs |
| Public caching of history/status | Forbidden |
| Clickjacking / CSP | Align with app-wide policy when one is approved |
| Security headers | Require implementation review against `next.config.*` / platform config |
| Authorization now | **No header implementation is authorized here** |

Observed today: `next.config.ts`, `next.config.js`, and `vercel.json` do not define a deletion-specific security header policy.

---

## 36. Dependency and Supply-Chain Boundary

Relevant current dependencies from `package.json` (non-exhaustive, security-relevant):

| Package | Role |
|---------|------|
| `next` `15.5.7` | Application framework |
| `next-auth` `^5.0.0-beta.29` | Session authentication |
| `@supabase/supabase-js` | Database/storage client |
| `zod` `^3.24.4` | Validation (auth forms today) |
| `@upstash/redis` `^1.38.0` | Scan rate limiting today |
| `openai` | Scan inference (not deletion pathway core) |
| `react` / `react-dom` | UI runtime |

Contract:

- Prefer existing supported libraries where appropriate
- No unnecessary new security dependency
- Dependency review before adding packages
- Preserve lockfile integrity in future changes
- Framework/security update review before privileged pathway activation
- **No package changes authorized now**

---

## 37. Security Observability and Alerting

Conceptual alerts (no new vendor or implementation):

- Operator authorization failures
- Repeated ownership violations
- Unusual submission velocity
- Service-role misuse indicators (unexpected modules/paths)
- Repeated execution ambiguity
- Post-terminal mutation attempts
- PROD denylist match
- Audit pipeline failure (must not silently authorize execution)

Thresholds remain open (Section 41).

---

## 38. Abuse Test Matrix

Future abuse tests (authorized only after implementation gates), including:

| Case |
|------|
| Unauthenticated submission |
| Spoofed email as identity |
| Unknown fields |
| Invalid scopes |
| Forged targets |
| Cross-user scans/evidence |
| Duplicate flood |
| Cross-user idempotency key |
| Oversized body |
| Malformed JSON |
| Rate-limit breach |
| CSRF attempt |
| Stale session |
| Operator privilege escalation |
| Arbitrary attribution payload |
| Post-terminal append attempt |
| Blind retry attempt |
| Safe error leakage |
| PROD targeting |

---

## 39. Security Contract Test Matrix

Future security contract tests (separate from Block A and Block B database verification):

| Case |
|------|
| Handler-level auth |
| Ownership-only reads |
| Non-disclosing lookup |
| Service-role absence from browser |
| Reject-closed validation |
| Safe error envelope |
| no-store responses |
| Operator server-side authorization |
| Atomic execution boundary |
| F-P2-3 absence |
| Audit correlation |
| Truthful completion messaging |
| No PROD interaction |

Block A/B remain database verification artifacts and are not substitutes for these tests.

---

## 40. Future Implementation Decomposition

Smallest safe packages (**documentation of order only; none authorized now**):

| # | Package | Dependencies / gates |
|---|---------|----------------------|
| 1 | Stub exposure removal | UI/API cutover plan accepted; avoid dual contracts |
| 2 | User auth and intake boundary | DEV applied; Block A PASS; Security + API designs accepted |
| 3 | Ownership-scoped reads | Intake identity contract stable |
| 4 | Validation and payload controls | Reject-closed rules accepted |
| 5 | Idempotency and duplicate handling | Idempotency posture accepted |
| 6 | Rate limiting | Numeric limits + fail posture accepted |
| 7 | Operator authorization | **Operator Authorization Design accepted** |
| 8 | Operator validation | Operator authz live; audit ready |
| 9 | Execution orchestration | Authz + F-P2-3 + residual messaging ready |
| 10 | Logging / alerting | Observability fields accepted |
| 11 | Residual disclosure integration | Storage residual decision recorded |
| 12 | Security test package | Implementation packages above reviewable |

Each package remains blocked while DEV gate is blocked and migration is unapplied.

---

## 41. Open Security Decisions

Unresolved decisions only (not forced without evidence):

1. Operator authorization mechanism (allowlist, role claim, admin surface, etc.)
2. Operator re-authentication for high-risk execution
3. Segregation of duties (validate vs execute separation)
4. CSRF mechanism beyond session cookie verification (Origin/Referer or equivalent)
5. Numeric rate limits per route class
6. Rate-limiter failure posture for intake (fail-closed vs controlled degrade)
7. Idempotency store medium and TTL
8. Duplicate-active-request policy (reject new vs return existing)
9. Request-body size limit (exact bytes)
10. Pagination abuse controls (default/max page size, cursor rules)
11. Alert thresholds
12. Log retention for deletion security events
13. Worker authorization model (if a worker is ever approved)
14. Residual storage lifecycle decisions affecting user promises
15. Incident response ownership for deletion/service-role incidents

---

## 42. Implementation Preconditions

Implementation remains **prohibited** until:

- Separate SkinIntel DEV Supabase project exists and is verified
- Phase 2 Slice 2 migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required
- Technical Design accepted
- API Contract Design accepted
- UI Flow Design accepted
- **This Security and Abuse Design accepted**
- Operator authorization design accepted
- Idempotency posture accepted
- CSRF posture accepted
- Rate-limit posture accepted
- Storage residual decision recorded
- Exact execution baseline approved
- Final security review accepted

---

## 43. Hard Stops

Stop immediately if:

- DEV unresolved or conflated with PROD
- PROD denylist match under locked typed matching semantics
- Migration unapplied on the target environment
- Block A failure or unapproved bypass
- Client-controlled identity accepted as requester authority
- Cross-user access possible
- Unknown fields silently accepted
- Service-role exposed to browser/bundle
- Operator auth unresolved for privileged actions at implementation time
- Arbitrary attribution accepted from caller
- Post-terminal attribution operation exists or is scheduled
- Execution blindly retried
- Rate-limit failure silently authorizes privileged actions
- Secrets logged or committed
- Misleading universal-erasure response
- Scope creep into account deletion or billing/subscription deletion

---

## 44. Current Authorization Boundary

**Authorized now:**

- Creation and review of this Security and Abuse Design

**Not authorized:**

- API implementation
- UI implementation
- Middleware changes
- Auth changes
- Rate-limit changes
- Operator implementation
- Worker implementation
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 45. Next Safe Design Step

After acceptance of this Security and Abuse Design, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway Operator Authorization Design**

That step remains **documentation-only** unless separately authorized.
