# Phase 2 Slice 2 — Application Deletion Pathway Operator Authorization Design

- Status: Draft — operator authorization design only
- Database dependency: migration not applied
- DEV execution gate: blocked
- Operator implementation: not authorized
- API implementation: not authorized
- UI implementation: not authorized
- Auth and middleware changes: not authorized
- SQL changes: not authorized
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Purpose

This document defines the **future authorization contract** for privileged deletion-request validation and execution on SkinIntel’s Application Deletion Pathway.

It establishes that:

- **Ordinary authentication is insufficient.** A successful NextAuth login proves identity for ownership-scoped user operations; it does not grant operator privilege.
- **Service-role possession is insufficient.** Possession or use of `SUPABASE_SERVICE_ROLE_KEY` proves database privilege for a server process; it does not prove human operator authorization.
- **No implementation is authorized** by this document: no auth, middleware, session, role, route, UI, worker, or database changes.
- **No database execution is authorized.** Migration apply, Block A, Block B, and any Supabase contact remain prohibited under current posture.
- **Accepted API, UI, and Security designs remain authoritative** for HTTP surfaces, presentation boundaries, and threat/abuse controls. This document specializes the operator authorization boundary they leave unresolved.
- **This document cannot silently redesign persistence or workflow contracts.** Request states, resolution codes, attribution rules, F-P2-3 obligations, and atomic execution remain governed by the committed migration and accepted pathway Plan / Technical Design.

---

## 2. Authoritative Inputs and Precedence

### Authoritative artifacts

1. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md`
2. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_TECHNICAL_DESIGN.md`
3. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_API_CONTRACT_DESIGN.md`
4. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_UI_FLOW_DESIGN.md`
5. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`
6. `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md`
7. `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`
8. `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md`
9. `docs/PHASE_2_SLICE_2_DEV_EXECUTION_GATE_DISPOSITION.md`
10. `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`

Supporting inspection sources (current repository posture only): `auth.ts`, `middleware.ts`, `proxy.ts`, `app/api/scan/route.ts`, `app/api/delete-request/route.ts`, `app/actions/index.ts`, `lib/supabase.ts`, `lib/rateLimit.ts`, `package.json`, `utils/db.ts`, `README.md`, and repository search results recorded in Section 3.

### Precedence

1. Committed migration contract (`supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`)
2. Accepted pathway Plan
3. Accepted Technical Design
4. Accepted API Contract Design
5. Accepted UI Flow Design
6. Accepted Security and Abuse Design
7. **This Operator Authorization Design**
8. Future implementation (only after separate authorization and preconditions in Section 43)

Where this document and a higher-precedence artifact conflict, the higher-precedence artifact wins. This document must not invent persistence columns, workflow states, rejection codes, or database operations absent from the migration and accepted contracts.

---

## 3. Current Repository Authorization Posture

Inspection baseline: branch `main`, HEAD `bfe382bbf8905975d4c936551e70d2fdaefb29f0` (matches `origin/main` per task baseline). Permitted untracked entry observed: `?? .cursor/`. No code or configuration was modified during inspection.

### 3.1 Search results for admin / operator / role infrastructure

Repository read-only search across TypeScript/JavaScript sources and related docs for: `admin`, `operator`, `role`, `roles`, `authorization`, `allowlist`, `permissions`, `claims`, `service-role`, `elevated`, `privileged`, `is_admin`, `metadata`, `session callback`.

| Capability | Repository state |
|------------|------------------|
| Operator authorization module | **Does not exist** — no `app/api/operator/**`, no operator guard, no operator allowlist env contract in code |
| Admin RBAC / `is_admin` claim | **Does not exist** in application auth code |
| Role / permissions / claims on session | **Does not exist** — no `auth.config.ts`; no `next-auth.d.ts` session augmentation; no JWT/session callbacks in `auth.ts` |
| Operator allowlist | **Does not exist** as implemented configuration |
| Admin deletion / governance UI | **Does not exist** — UI Flow Design and repository confirm absence of operator queue UI |
| “Admin” string occurrences | Template residue only (e.g. WowDash metadata in `app/auth/*/page.tsx`, display label in `components/shared/profile-dropdown.tsx`, demo data in `components/table/users-list-table.tsx`) — **not** authorization infrastructure |
| Documented operator authz | Accepted pathway designs define the **boundary as unresolved**; Security Open Decision #1 and API Contract Section 22 defer mechanism selection |

**Verdict:** Operator/admin authorization infrastructure for governed deletion **does not currently exist** in the repository. Ordinary NextAuth authentication and server-side service-role data access patterns exist; privileged human operator authorization does not.

### 3.2 NextAuth configuration — `auth.ts`

| Aspect | Finding |
|--------|---------|
| Path | `auth.ts` |
| Current behavior | NextAuth v5 (`next-auth` `^5.0.0-beta.29` per `package.json`). Exports `{ handlers, signIn, signOut, auth }`. Providers: Credentials (`authorize` via `loginSchema` + `getUserFromDb`), Google, GitHub. OAuth providers set `authorization.params` for consent/offline/code. |
| Session fields | No custom session callbacks; no role, admin, operator, or permission fields configured in this file. Default NextAuth user session shape only. |
| Auth callbacks | **None configured** in `auth.ts` (no `callbacks.jwt`, `callbacks.session`, or equivalent). |
| Provider configuration | Credentials against in-memory demo user in `utils/db.ts`; Google/GitHub via env client id/secret. |
| Authorization assessment | Authentication helper only. Proves identity for routes/actions that call `auth()`; grants no operator privilege. |
| Gap vs future operator pathway | Needs separate server-side operator authority resolution after session identity is established. No role claim pipeline to extend safely from client-supplied data. |

### 3.3 `auth.config.ts`

| Aspect | Finding |
|--------|---------|
| Path | `auth.config.ts` |
| Current behavior | **File does not exist** in the repository. |
| Authorization assessment | No split Auth.js config; all observed auth setup is in `auth.ts` plus `app/api/auth/[...nextauth]/route.ts`. |
| Gap | Future operator work must not invent Auth.js config structure without approval; any later config split remains an implementation decision. |

### 3.4 Session identity source — `utils/db.ts`

| Aspect | Finding |
|--------|---------|
| Path | `utils/db.ts` |
| Current behavior | In-memory `users` array with a single demo Credentials user (`id`, `email`, `name`, `password`). `getUserFromDb` returns matching user or `null`. |
| Authorization assessment | Demo credential store only; no roles, no operator flags. |
| Gap | Not an operator registry. Email match here must never be treated as operator enrollment. |

### 3.5 Middleware — `middleware.ts`

| Aspect | Finding |
|--------|---------|
| Path | `middleware.ts` |
| Current behavior | Wraps `auth((req) => ...)`. Redirects to `/auth/login` when `!req.auth?.user`. Matcher: `["/dashboard/:path*", "/history", "/history/:path*"]`. |
| Authorization assessment | Page-route authentication gate only. No role checks. **Does not match `/api/*`.** |
| Gap | Middleware alone cannot authorize operator APIs. Future operator handlers must enforce authz in-handler. |

### 3.6 Proxy — `proxy.ts`

| Aspect | Finding |
|--------|---------|
| Path | `proxy.ts` |
| Current behavior | Skips auth for `/_next`, favicon, **`/api`**, `/images`, `/manifest.json`. Calls `auth()` for other paths; redirects unauthenticated non-public routes to login. Public routes: login/register/forgot-password/create-password. |
| Authorization assessment | Explicitly **bypasses API authentication** at proxy layer. |
| Gap | Confirms API routes must self-authenticate. Operator routes must never rely on proxy/middleware for privilege. |

### 3.7 Scan API pattern — `app/api/scan/route.ts`

| Aspect | Finding |
|--------|---------|
| Path | `app/api/scan/route.ts` |
| Current behavior | `const session = await auth()`; `401` without `session?.user`; requires `session.user.email` for persistence; server-side `createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)`; `checkScanRateLimit`; consent gates; user-safe errors. |
| Authorization assessment | Best current authenticated API reference for handler-level auth and server-derived identity. Still ordinary-user privilege only. |
| Gap | Operator pathway needs the same session call **plus** independent operator capability check before privileged reads/mutations. |

### 3.8 Delete-request stub — `app/api/delete-request/route.ts`

| Aspect | Finding |
|--------|---------|
| Path | `app/api/delete-request/route.ts` |
| Current behavior | Unauthenticated `POST`; optionally parses client `email`/`message` and discards them; always returns success. No persistence, no rate limit, no operator surface. |
| Authorization assessment | Non-authoritative stub (per API Contract Design). |
| Gap | Must not be treated as operator or user governance authz precedent. |

### 3.9 Server actions — `app/actions/index.ts`

| Aspect | Finding |
|--------|---------|
| Path | `app/actions/index.ts` |
| Current behavior | Server actions call `auth()`, then service-role Supabase client, filtering by `session.user.email` (e.g. `getLatestAnalysis`, reminder preferences). Social login/logout helpers. |
| Authorization assessment | Established ownership-scoped user data pattern using service-role + application filters. No operator actions. |
| Gap | Privileged deletion validate/execute must not reuse “any authenticated email + service-role” as sufficient human authorization. |

### 3.10 Anonymous Supabase client — `lib/supabase.ts`

| Aspect | Finding |
|--------|---------|
| Path | `lib/supabase.ts` |
| Current behavior | Browser/anon client via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. |
| Authorization assessment | Client-safe only. |
| Gap | Must never hold service-role or operator authority. |

### 3.11 Rate limiter — `lib/rateLimit.ts`

| Aspect | Finding |
|--------|---------|
| Path | `lib/rateLimit.ts` |
| Current behavior | Scan-specific Upstash Redis limiter; **fail-open** when Redis missing or errors. |
| Authorization assessment | Not an authorization control; scan product choice. |
| Gap | Must not be reused as operator authorization; privileged fail posture must fail closed for authz lookup (Section 39). |

### 3.12 NextAuth route — `app/api/auth/[...nextauth]/route.ts`

| Aspect | Finding |
|--------|---------|
| Path | `app/api/auth/[...nextauth]/route.ts` |
| Current behavior | Standard Auth.js handlers export from `auth.ts` (present in `app/api` inventory). |
| Authorization assessment | Authentication endpoint only. |
| Gap | No operator elevation endpoint exists or is authorized. |

### 3.13 Package / environment documentation

| Aspect | Finding |
|--------|---------|
| Path | `package.json` |
| Current behavior | Next 15.5.7; `next-auth` beta; `@supabase/supabase-js`; no RBAC/CASL/authz libraries. |
| Path | `README.md` |
| Current behavior | Generic Next.js getting-started text; **no** tracked operator/authz/env authorization documentation. |
| Env docs | No committed `.env.example` observed in repository search. Operational env guidance for DEV/PROD separation appears in `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md` (notes current `.env.local` points at PROD and must not prove DEV). |
| Authorization assessment | No packaged operator RBAC; no tracked allowlist contract in app code. |
| Gap | Authority source, env scoping, and enrollment process remain design decisions (Sections 11–14, 28, 42). |

### 3.14 Existing privileged server patterns (summary)

Current privileged **database** pattern: server process uses `SUPABASE_SERVICE_ROLE_KEY` after ordinary `auth()` for user-owned reads/writes. Current privileged **human operator** pattern for deletion governance: **absent**.

Accepted pathway designs already record this gap (Technical Design unresolved operator mechanism; Security Section 12; API Contract Section 22; UI Flow Section 25 / open operator authorization).

---

## 4. Authorization Objectives

| Objective | Requirement |
|-----------|-------------|
| Deny by default | Absence of affirmative operator authorization → deny |
| Independently verified operator status | Operator status resolved from approved authority source, not from login alone |
| Least privilege | Grant only capabilities required for the specific privileged operation |
| Attributable operator identity | Every privileged action links to an individual human identity in audit evidence |
| Separation of ordinary user and operator capabilities | Distinct namespaces and checks; ordinary session never implies operator rights |
| Server-side enforcement | Authorization decided on the server for every privileged request |
| No browser service-role authority | Browser never receives or uses service-role credentials |
| Revocable access | Operator authority can be removed with bounded effect latency |
| Auditable privileged actions | Validate, reject, execute, privileged reads, and denials leave safe audit evidence |
| Stale-session protection | Privilege re-resolved on privileged requests; revocation honored |
| No PROD testing | Current work prohibits PROD contact and PROD authority exercise |

---

## 5. Privileged Operations Inventory

Privileged operations are conceptual future operator capabilities aligned with accepted pathway designs. They do **not** add unsupported database operations beyond the migration workflow (received → validated milestone / rejected / executed with attribution).

| Operation | Read / mutation | Risk level | Required authorization strength | Audit requirement |
|-----------|-----------------|------------|----------------------------------|-------------------|
| View operator queue | Read | Medium | `queue_read` (authorized operator) | Access audit with correlation id; no protected payload dump |
| View privileged request detail | Read | Medium–High | `request_privileged_read` | Access audit; least-data fields only |
| Validate request | Mutation | High | `request_validate` | Validation started/completed + operator identity |
| Reject request | Mutation | High | `request_reject` | Rejection decision + closed code + operator identity |
| Initiate execution | Mutation | Critical | `request_execute` (elevated execution operator) | Execution started/completed/failed/ambiguous + operator identity |
| Review ambiguous execution | Read (+ acknowledgement mutation if approved) | Critical | `ambiguous_result_review` or execution-level capability | Review/ack evidence; no blind retry |
| View protected audit evidence | Read | High | `audit_read` | Access audit; redacted evidence only |
| Acknowledge execution outcome | Mutation (acknowledgement only) | High | Execution-level or review capability | Acknowledgement event; no state invention beyond accepted workflow |

No operation may append post-terminal attribution (F-P2-3). No operation may invent new persistence fields.

---

## 6. Actor Model

These are **conceptual authorization actors**, not implemented roles, database enums, or code constants.

| Actor | Meaning |
|-------|---------|
| Ordinary authenticated user | Identity established via NextAuth `auth()`; ownership-scoped user deletion operations only |
| Operator candidate | Authenticated identity proposed for operator enrollment; **no** privilege until activated |
| Authorized operator | Identity affirmatively present in approved authority source with one or more non-execution capabilities |
| Elevated execution operator | Authorized operator additionally granted `request_execute` (and related execution-strength capabilities) |
| Service / orchestrator | Server process using service-role to perform approved DB effects after human authorization is established |
| Future worker | Separately authorized machine identity if later approved; **not authorized now** |
| Security administrator | Human who may approve/revoke operator authority under change control (process actor) |
| Infrastructure administrator | Human who manages secrets, environments, and deploy controls; not automatically a deletion operator |

---

## 7. Ordinary User Boundary

### Ordinary users may

- Submit owned deletion requests (future user API family)
- Read their own current request
- Read their own history
- Read their own detail (ownership-scoped, non-disclosing on cross-user lookup per API/Security contracts)

### Ordinary users may not

- Access operator routes
- Access operator queues
- Validate requests
- Reject requests
- Execute requests
- View operator notes
- View execution attribution / privileged audit internals
- Impersonate operators
- Supply role or operator identity (client-supplied role/operator fields are ignored)

---

## 8. Operator Capability Matrix

Conceptual capabilities only. **Do not treat names as code constants.**

| Capability | Minimum actor | Mutation | Step-up may be required | Required audit evidence | Delegation allowed |
|------------|---------------|----------|-------------------------|-------------------------|--------------------|
| `queue_read` | Authorized operator | No | No (default) | Queue access event | No |
| `request_privileged_read` | Authorized operator | No | No (default) | Privileged detail access | No |
| `request_validate` | Authorized operator | Yes | Open (usually no) | Validation decision + identity | No |
| `request_reject` | Authorized operator | Yes | Open (usually no) | Rejection + closed code + identity | No |
| `request_execute` | Elevated execution operator | Yes | Open — may require step-up (Section 24) | Execution lifecycle events + identity | No |
| `ambiguous_result_review` | Elevated execution operator or approved reviewer | Ack only if defined; no blind retry | Open | Review/ack evidence | No |
| `audit_read` | Authorized operator with audit scope | No | Open for sensitive packs | Audit access event | No |
| `operator_management` | Security administrator (process) | Authority-source change | Yes (process) | Enrollment/revocation evidence | No self-delegation |

Delegation of privileged capabilities to other humans or to clients is **not allowed**. Machine workers require a separate future authorization model (Section 23).

---

## 9. Validation Versus Execution Separation

- **Validation and execution are distinct capabilities.** `request_validate` / `request_reject` do not imply `request_execute`.
- **A validator does not automatically gain execution permission.**
- **Whether the same person may validate and execute remains an open segregation-of-duties decision** (Section 26). This design does not invent a final SoD policy.
- **Terminal execution requires stronger authorization than queue reading.** Queue/detail read privilege must never be inferred as execution privilege.
- **Execution cannot be inferred from general admin access.** Template “Admin” labels, dashboard access, or broad future admin UI presence are not execution authorization.

---

## 10. Operator Identity Source

Accepted principles:

1. Identity originates from the authenticated NextAuth session (`auth()` / session subject such as email or stable subject id when present).
2. Operator status must be resolved **server-side** from a **separately approved authority source** (Section 11 options).
3. Client-supplied role claims, headers, body fields, or query flags asserting operator status are **ignored**.
4. Email alone does **not** automatically grant operator authority (including demo Credentials email in `utils/db.ts`).
5. The service-role key is **not** operator identity and cannot substitute for human authorization.
6. Incomplete identity (missing session, missing attributable subject, ambiguous subject) **fails closed**.

---

## 11. Operator Authority Source Options

Evaluate conceptually. **No final unsupported infrastructure is selected as implemented.** Repository evidence does **not** currently support an existing RBAC system, IdP group mapping, or operator registry.

### 11.1 Server-side environment allowlist

| Dimension | Assessment |
|-----------|------------|
| Benefits | Smallest surface; explicit; easy to reason about for very small operator population; aligns with deny-by-default |
| Risks | Process/deploy coupling; accidental copy across environments; weak structured capability granularity unless carefully encoded |
| Revocation | Remove identity from env and redeploy/reload; session freshness must re-resolve |
| Auditability | Change control via config review; runtime decisions should log authority-source reference/version |
| Deploy/change control | Requires disciplined review of env changes |
| DEV/PROD separation | Must use distinct env vars/values; copied DEV allowlist must not authorize PROD |
| Initial-release suitability | **Strong candidate** for initial release **pending approval** (Section 12) |

### 11.2 Database-backed operator registry

| Dimension | Assessment |
|-----------|------------|
| Benefits | Queryable; finer capability grants; audit rows possible |
| Risks | Requires schema/migration/RLS design **not authorized now**; bootstrapping and PROD protection complexity |
| Revocation | Row disable/delete with bounded cache TTL |
| Auditability | Potentially strong if append-only change log exists |
| Deploy/change control | DB change process + app read path |
| DEV/PROD separation | Separate registries per project required |
| Initial-release suitability | Not supported by current migration contract for operator registry tables; **deferred unless separately designed and approved** |

### 11.3 Identity-provider role/group claim

| Dimension | Assessment |
|-----------|------------|
| Benefits | Centralized IdP management; familiar enterprise pattern |
| Risks | Current `auth.ts` has **no** claim mapping callbacks; client-visible claims can be forged if trusted naively; Google/GitHub group claims not present in repo |
| Revocation | IdP-side removal + session freshness |
| Auditability | Depends on IdP logs + app decision logs |
| Deploy/change control | IdP admin process |
| DEV/PROD separation | Requires distinct IdP apps/groups per environment |
| Initial-release suitability | **Unsupported by current repository evidence** without new auth callback design |

### 11.4 Signed server-owned configuration

| Dimension | Assessment |
|-----------|------------|
| Benefits | Integrity-protected config; explicit versioning |
| Risks | Key management complexity; still needs distribution and revocation story |
| Revocation | Publish new signed config excluding identity |
| Auditability | Config version in decision output |
| Deploy/change control | Signing ceremony + review |
| DEV/PROD separation | Distinct signing keys/config per environment |
| Initial-release suitability | Possible later hardening; heavier than needed for tiny operator set |

### 11.5 External authorization service

| Dimension | Assessment |
|-----------|------------|
| Benefits | Central policy; rich evaluation |
| Risks | New infrastructure; availability coupling; out of scope / inventing architecture |
| Revocation | Policy update at external system |
| Auditability | External + local correlation |
| Deploy/change control | External change management |
| DEV/PROD separation | Separate policy tenants required |
| Initial-release suitability | **Not justified** by current repository or approved architecture |

**Selection rule:** Do not implement or declare a final option until an explicit authority-source decision is recorded and repository/architecture evidence supports it.

---

## 12. Initial Release Posture

**Recommendation (pending approval — not implemented, not finally accepted):**

For the smallest safe initial release of human operator privileged deletion actions:

1. Maintain a **very small operator population**.
2. Use an **explicit server-side allowlist or equivalent approved authority** resolved only on the server (Section 11.1 as leading candidate).
3. Enforce **deny-by-default** for all operator capabilities.
4. Allow **no browser-controlled roles**.
5. Require **documented change control** for every addition/removal/capability change.
6. Enforce **environment separation** (DEV authority ≠ PROD authority).
7. Ensure **operator identity auditability** on every privileged decision and mutation.

Capability split at minimum: queue/privileged read vs validate/reject vs execute. Whether validate and execute may be held by the same person remains open (Section 26).

---

## 13. Operator Enrollment

Future process (documentation only):

1. **Identity verification** of the candidate against real individual identity (no shared mailbox).
2. **Approval owner** recorded (open who exactly — Section 42).
3. **Requested capabilities** listed explicitly (from Section 8).
4. **Environment scope** declared (`DEV` and/or `PROD` separately; PROD currently prohibited).
5. **Activation timestamp** recorded.
6. **Evidence of approval** retained (ticket/change record).
7. **Expiration/review date** if adopted by policy.
8. **No self-enrollment.**
9. **No email-based automatic elevation** (including matching a Credentials demo user or OAuth email alone).

Operator candidate status confers no privilege until activation in the approved authority source.

---

## 14. Operator Revocation

| Control | Requirement |
|---------|-------------|
| Immediate revocation | Remove/disable identity in authority source without waiting for natural session expiry alone |
| Session invalidation considerations | Prefer Auth.js/session invalidation where supported; always re-resolve authz on privileged requests so revocation bites even if cookie remains |
| Credential rotation | If compromise suspected: rotate affected secrets (including service-role if exposure risk), invalidate sessions, review recent privileged actions |
| Removal from authority source | Mandatory for revocation completion |
| Audit record | Who revoked, whom, when, environment, capabilities removed |
| Pending execution review | In-flight/ambiguous executions require human review; revoked operators must not continue privileged actions |
| Emergency response | Security administrator path; no silent privilege retention |
| PROD and DEV independence | Revocation in one environment does not automatically configure the other; each environment’s authority source is updated deliberately |

---

## 15. Authentication Versus Authorization

- Successful login proves **identity**, not **privilege**.
- Operator authorization must run on **every** privileged request.
- Middleware alone is insufficient (`middleware.ts` does not cover `/api/*` and performs no role checks).
- UI visibility does not grant permission.
- Route secrecy does not grant permission.
- Service-role database access does not grant human permission.

---

## 16. Handler-Level Enforcement

For every future operator route/handler:

1. Validate session via `auth()` (or equivalent server session API).
2. Resolve current authorization from the approved authority source for the current environment.
3. Check required capability **before** privileged data read.
4. Recheck authorization **before** mutation (especially execution).
5. Place **no trust** in client-provided operator fields (role, is_admin, operator_id, etc.).
6. On authorization failure, produce **no durable workflow effect** (no validate milestone, reject, execute, or acknowledgement side effects).

---

## 17. Operator Route Namespace

Accepted conceptual namespace (from API Contract Design):

`/api/operator/deletion-requests/...`

Accepted explicit mutations in API Contract Design:

- `POST /api/operator/deletion-requests/{requestId}/validate`
- `POST /api/operator/deletion-requests/{requestId}/execute`

Additional privileged read/review surfaces (queue, privileged detail, audit evidence, acknowledgement), if later approved, remain under the same operator namespace and the same authorization rules. This document does **not** implement routes or invent persistence.

Rules:

- Separation from ordinary-user routes (`/api/deletion-requests/...`) is mandatory for clarity.
- Route namespace alone is **not** a security control.
- All handlers require server-side authentication **and** authorization.
- No compatibility route (including legacy `app/api/delete-request/route.ts`) may bypass operator checks or become an operator backdoor.
- Method restrictions remain explicit (e.g., mutations via `POST` only as contracted).

---

## 18. Privileged Read Authorization

| Topic | Contract |
|-------|----------|
| Queue access | Requires `queue_read`; returns least-data operator queue fields only |
| Privileged request detail | Requires `request_privileged_read`; no unnecessary medical/image content |
| Protected audit evidence | Requires `audit_read`; redacted fields only |
| Least-data exposure | Prefer identifiers, scope, state/milestone, safe timestamps, closed codes — not evidence payloads |
| No unrelated medical/image content | Forbidden in operator deletion queue/detail by default |
| No unnecessary user history | Do not expand into full account browsing beyond request-scoped need |
| Paging/filter restrictions | Server-enforced page size/filters; no arbitrary cross-tenant dump |
| Non-operator access | Denied (`401`/`403` per Section 30) **without** existence disclosure of protected requests |

---

## 19. Validation Authorization

| Topic | Contract |
|-------|----------|
| Required capability | `request_validate` or `request_reject` as applicable |
| Current request state read | Fresh server read under privileged path before mutation |
| Allowed actions | `validate` (set-once `validated_at` milestone while remaining `received`) or `reject` with closed rejection code |
| Accepted rejection categories | Migration-closed set used by API Contract: `invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed` (not invented codes). `execution_failed` reserved to execution-failure pathway per API Contract |
| No arbitrary workflow fields | Callers cannot set `request_state`, timestamps, attribution, or operator identity |
| Stale-state conflict | Re-read; conflict if milestone already set, terminal, or transition illegal |
| Operator identity attribution | Server-derived from session + authz resolution; never client-supplied |
| Audit requirement | Validation started/completed/rejected with operator identity and correlation id |

---

## 20. Execution Authorization

| Topic | Contract |
|-------|----------|
| Strongest operator capability | `request_execute` |
| Fresh authorization check | Mandatory immediately before orchestration |
| Fresh request-state read | Mandatory; validated non-terminal request required per workflow contracts |
| Optional step-up authentication | Remains open (Section 24) |
| Explicit high-risk confirmation | Required at operator UX/API confirmation boundary per Security/UI designs |
| Server-derived targets | Orchestrator derives affected targets; caller inventory forbidden |
| No caller-supplied attribution | Forbidden |
| Atomic orchestration only | Lifecycle effects + required attribution + terminal state in one approved transaction |
| No blind retry | Ambiguous/failed → review path |
| Audit evidence required | Execution started/completed/failed/ambiguous + operator identity |

Service-role may perform DB effects only **after** human execution authorization succeeds.

---

## 21. Ambiguous Result Review Authorization

| Topic | Contract |
|-------|----------|
| Capability | Separate `ambiguous_result_review` **or** execution-level capability (final packaging open) |
| No automatic retry | Review does not imply re-execute |
| Evidence review | Safe status/audit evidence only |
| Status re-read | Mandatory before any further action |
| Escalation | To security/infrastructure administrators when integrity uncertain |
| Operator acknowledgement | If adopted, records review completion without inventing terminal success |
| No post-terminal attribution workaround | Acknowledgement must not append attribution after `executed` |

---

## 22. Service and Orchestrator Authorization

- Service identity is **distinct** from human operator identity.
- Human authorization must be established **before** orchestration begins.
- Orchestrator receives only approved request/action context (request id, server-derived scope/targets, correlation id).
- Service-role access is **server-only** (`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_URL`), never browser-exposed.
- No arbitrary operator impersonation by the service.
- Audit links the **human actor** to the **service execution** outcome.

---

## 23. Future Worker Authorization

If later approved (not authorized now):

- Separately authorized **machine identity**
- Narrow capability (no default queue browsing)
- No post-terminal attribution
- Bounded retries under the same atomicity/idempotency rules
- Operator approval linkage for initiating privileged work
- Revocation and environment isolation

**State:** no worker is authorized now.

---

## 24. Step-Up Authentication

Future step-up options for execution (open security decision — not an implemented requirement):

| Option | Notes |
|--------|-------|
| Recent login | Require authentication within a bounded time window |
| Provider re-authentication | Force OAuth/Credentials re-challenge |
| Second factor if supported later | Not present in current repository auth configuration |
| Confirmation challenge | High-risk explicit confirm (UI/API), complementary but not full step-up |

**Current repository evidence limitations:** `auth.ts` has no step-up, MFA, or `auth.config.ts` support; middleware/proxy provide no privileged re-auth. Record as **open**; do not implement here.

---

## 25. Session Freshness

| Case | Required posture |
|------|------------------|
| Expired session | `401`; no privileged effect |
| Stale role/allowlist state | Re-resolve authority on each privileged request; do not trust long-lived in-memory privilege |
| Operator revoked during active session | Subsequent privileged requests deny even if cookie remains |
| Authorization re-resolution | Mandatory on privileged requests |
| Cached privilege TTL | No long-lived cached privilege without approved TTL (TTL itself unresolved — Section 42) |
| Execution | Requires freshest practical authorization decision immediately before mutation |

---

## 26. Segregation of Duties

Evaluate without selecting final policy:

| Model | Status |
|-------|--------|
| Validator and executor may be same person | Open |
| Validator and executor must differ | Open |
| Two-person approval only for selected scopes (e.g. `account_wide`) | Open |
| Emergency exception | Open; no break-glass authorized now (Section 34) |

Record:

- **Final policy unresolved.**
- Database schema does **not** by itself enforce human segregation of duties.
- Application workflow must enforce any future SoD policy.
- **No invented constraint** is claimed as accepted in this document.

---

## 27. Scope-Based Authorization

Privileges may later vary by:

- `account_wide`
- `scan_specific`
- `evidence_specific`
- Validation versus execution
- DEV versus PROD

Binding statements:

- **Account-wide execution is highest risk.**
- Scope restrictions must be **server-enforced**.
- Ordinary clients cannot select or elevate operator privilege level.
- Initial release may start with environment-scoped full deletion-operator capabilities for a tiny allowlist, but must not silently grant PROD or unrelated admin powers.

---

## 28. Environment Authorization

- DEV operator authority does **not** imply PROD authority.
- PROD access requires **separate explicit approval**.
- Current work **prohibits PROD entirely**.
- Authority source must be **environment-scoped**.
- Copied DEV configuration must not silently authorize PROD.
- Any PROD denylist match remains a **hard stop** (per DEV apply / gate dispositions).
- Local `.env.local` is not DEV proof (documented PROD-pointing risk in `docs/PHASE_2_SLICE_2_DEV_APPLY_PROCEDURE.md`).

---

## 29. Authorization Decision Output

Conceptual internal decision fields (not database columns):

| Field | Purpose |
|-------|---------|
| `allowed` / `denied` | Decision |
| Actor identity | Attributable subject |
| Capability checked | e.g. conceptual `request_execute` |
| Environment | DEV / PROD / other approved env label |
| Reason category | Safe machine reason (e.g. `not_operator`, `capability_missing`, `revoked`, `env_mismatch`) |
| Decision timestamp | When resolved |
| Authority-source version/reference | Config/registry version for audit |
| Correlation id | Links to request/audit trail |

Do **not** add database columns or schemas from this document.

---

## 30. Denial Behavior

| Condition | Behavior |
|-----------|----------|
| Unauthenticated | `401` |
| Authenticated but unauthorized | `403` |
| Ordinary-user request lookup | Remains non-disclosing for cross-user ids per API/Security contracts (prefer non-existence semantics there) |
| Operator route denial | Must not leak protected request data, queue contents, or audit evidence |
| Denial audit | Safe audit evidence permitted/required for privileged denial attempts |
| Role details to caller | Not returned |
| Secrets / authority-source internals | Not exposed |

---

## 31. Audit Requirements

For every privileged action, record conceptually:

- Correlation id
- Human operator identity
- Capability
- Request identifier
- Safe scope
- Previous state
- Attempted action
- Outcome
- Timestamp
- Environment
- Redacted denial/failure reason

Forbidden in audit payloads: secrets, service-role material, unnecessary medical/image content, raw unconstrained free-text dumps.

---

## 32. Operator Notes Boundary

- Operator notes are **not required** unless separately approved.
- No arbitrary free-text is required for initial authorization design.
- Raw internal notes are **never** returned to ordinary users.
- Notes must not contain unnecessary medical/image data.
- Retention and access require policy.
- **Do not add a notes field** to persistence via this document.

---

## 33. F-P2-3 Authorization Enforcement

Binding authorization rules:

- No capability grants append-attribution after terminal execution.
- No operator role can perform post-terminal attribution.
- No emergency role bypass for append-attribution.
- No worker capability for append-attribution.
- Physical database capability (accepted residual that a later service-role insert may still be possible) does **not** create an authorization permission.
- Authorization tests must prove **no such capability exists** in application/operator/worker surfaces.

---

## 34. Emergency Access

Conceptual evaluation only:

| Element | Future consideration |
|---------|----------------------|
| Break-glass operator | Named, time-bounded elevation |
| Activation approval | Dual control / security administrator |
| Short duration | Mandatory expiry |
| Narrow capability | Prefer read/review over execute unless explicitly approved |
| Mandatory audit | Full trail |
| Post-event review | Required |
| Credential rotation | After use if credentials were exceptional |

**State:** no break-glass mechanism exists or is authorized now.

---

## 35. Operator Abuse and Insider Controls

| Threat | Required future control |
|--------|-------------------------|
| Privilege escalation | Server-side capability checks; ignore client roles; deny-by-default |
| Self-approval | Enrollment forbids self-activation; SoD policy when adopted |
| Unauthorized execution | `request_execute` distinct; fresh checks; audit |
| Arbitrary rejection | Closed rejection codes only; audit |
| Excessive data access | Least-data privileged reads; paging limits; audit |
| Attribution injection | Server-derived targets only; reject caller inventory |
| Audit tampering | Append-oriented/safe audit pipeline; no operator rewrite of evidence |
| Shared accounts | Prohibited (Section 36) |
| Stale privileges | Re-resolve; revocation; bounded cache TTL |
| Compromised sessions | Logout/invalidation; optional step-up; secret rotation on suspicion |

---

## 36. Shared Account Prohibition

- Operators require **individual identities**.
- No shared operator mailbox/session.
- No generic admin account as the attributable actor.
- Actions must remain attributable to a natural person.
- Emergency access, if ever approved, must still identify an individual.

---

## 37. Change Control for Operator Authority

- Who may approve operator changes remains **open** (Section 42).
- Additions/removals require review.
- Capability changes require evidence.
- Configuration/database authority-source changes require versioning/reference in decision audit.
- Emergency changes require retrospective review.
- PROD changes require separate authorization (currently prohibited).

---

## 38. Authorization Caching

- Avoid long-lived privilege caching.
- Cache key must include identity, environment, and capability (if caching is ever approved).
- Revocation latency must be bounded.
- Exact TTL unresolved.
- Execution checks should prefer fresh resolution.
- Cache failure must **not** authorize access (fail closed).

---

## 39. Authorization Failure Posture

Fail closed for:

- Missing authority source
- Malformed role/allowlist data
- Authority lookup error
- Stale or ambiguous operator identity
- Environment mismatch
- Unknown capability
- Audit pipeline failure for **execution** (do not execute if execution cannot be attributable/audited)

A different availability posture for non-privileged ordinary-user reads may be considered separately under Security/API designs and must not weaken operator deny-by-default.

---

## 40. Operator Authorization Test Matrix

Plan future tests (not authorized to implement now):

1. Ordinary user denied queue
2. Ordinary user denied validation
3. Ordinary user denied execution
4. Client-forged role ignored
5. Email alone insufficient
6. Revoked operator denied
7. Wrong-environment operator denied
8. Stale privilege denied
9. Queue-only operator denied execution
10. Validator denied execution if policy separates
11. Execution operator allowed only approved action
12. Service-role without human authorization denied for human-privileged entrypoints
13. Shared/generic identity prohibited
14. F-P2-3 append capability absent
15. Safe `401`/`403` behavior
16. No protected data leakage on denial
17. No PROD interaction in current gated work

---

## 41. Implementation Decomposition

Future smallest safe packages (**none authorized now**):

| # | Package | Dependencies / gates |
|---|---------|----------------------|
| 1 | Authority-source decision | Security + this design accepted; architecture approval |
| 2 | Operator identity resolution | Package 1; session subject stability |
| 3 | Capability model | Packages 1–2; SoD decision recorded or explicitly deferred with controls |
| 4 | Handler authorization guard | Packages 2–3; fail-closed decision output |
| 5 | Operator queue read | Package 4; DEV migration applied; Block A PASS; API/UI acceptance |
| 6 | Validation authorization | Package 4; validation API contract; audit ready |
| 7 | Execution authorization | Package 6 or parallel after Package 4; step-up decision recorded; F-P2-3 tests planned |
| 8 | Session freshness and revocation | Packages 1–4; revocation process approved |
| 9 | Audit integration | Observability fields from Security/API designs |
| 10 | Authorization tests | Packages 4–9; matrix in Section 40 |
| 11 | Emergency-access decision | Explicit accept/reject; default remains none |
| 12 | Environment separation review | DEV≠PROD proof; denylist hard stops |

Each package remains blocked while DEV gate is blocked and migration is unapplied.

---

## 42. Open Authorization Decisions

Unresolved only — **not resolved by this document**:

1. Final authority source
2. Initial operator identities
3. Capability granularity (exact packaging of review/ack vs execute)
4. Validator/executor segregation
5. Two-person approval
6. Execution step-up authentication
7. Session freshness threshold
8. Authorization cache TTL
9. Operator approval owner
10. Emergency-access policy
11. Operator-note policy
12. PROD authority process
13. Audit retention for privileged authz events
14. Worker authorization

---

## 43. Implementation Preconditions

Operator implementation remains **prohibited** until:

- Separate SkinIntel DEV Supabase project exists
- Migration applied to DEV
- Block A PASS
- Block B separately authorized and PASS if required
- Technical Design accepted
- API Contract Design accepted
- UI Flow Design accepted
- Security and Abuse Design accepted
- **This Operator Authorization Design accepted**
- Authority source selected
- Initial capability model approved
- Environment separation approved
- Revocation process approved
- Audit posture approved
- Segregation-of-duties decision recorded
- Final security review accepted

---

## 44. Hard Stops

Stop if any of the following hold:

- DEV unresolved
- PROD denylist match
- Migration unapplied
- Operator authority source unresolved at implementation time
- Client-controlled roles
- Email-only automatic elevation
- Shared operator account
- Service-role treated as human authorization
- Authorization checked only in UI
- Operator privilege cached indefinitely
- Revoked operator remains authorized
- Wrong-environment authority accepted
- Queue-read privilege implies execution
- Arbitrary attribution capability exists
- Post-terminal attribution capability exists
- Audit identity missing for privileged mutation
- Execution proceeds after authorization lookup failure
- Scope creep into account or billing administration

---

## 45. Current Authorization Boundary

### Authorized now

- Creation and review of this Operator Authorization Design document

### Not authorized

- Auth implementation
- Role implementation
- Operator enrollment
- Operator UI
- Operator API
- Middleware changes
- Session changes
- Service-role changes
- Worker implementation
- SQL changes
- Migration execution
- Block A
- Block B
- Supabase contact
- DEV/PROD changes

---

## 46. Next Safe Design Step

After acceptance of this Operator Authorization Design, the next safe step is:

**Phase 2 Slice 2 — Application Deletion Pathway Idempotency and Concurrency Design**

That step remains **documentation-only** unless separately authorized.
