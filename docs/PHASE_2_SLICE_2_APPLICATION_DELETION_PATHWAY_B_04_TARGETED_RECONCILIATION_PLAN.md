# Phase 2 Slice 2 — Application Deletion Pathway B-04 Targeted Reconciliation Plan

- Status: Draft — targeted reconciliation planning only
- Decision ID: B-04
- Decision domain: Operator capability packaging and human segregation of duties
- Review baseline: `2b12cc2b6379b6686f4e126915a5b850b9e20d47`
- Decision authority: B-04 Operator Capability and SoD Decision Record (Option C)
- Existing artifact modification: not authorized
- Reconciliation execution: not authorized
- Application implementation: not authorized
- Database execution: not authorized
- DEV execution gate: blocked
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Status and Authority

| Attribute | Binding posture |
|-----------|-----------------|
| Artifact type | Targeted reconciliation **plan** only |
| Decision ID | **B-04** |
| Selected policy | Option C — request-scope-deterministic human separation |
| Authority source for policy | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_B_04_OPERATOR_CAPABILITY_AND_SOD_DECISION_RECORD.md` |
| Precedence for future reconciliation | Once the decision record is accepted and committed, and this plan is separately accepted, future documentation edits must incorporate the locked B-04 matrix without inventing enforcement |
| C-01 / B-19 relationship | Preserved unchanged — validate-before-execute action sequencing remains closed and is not reopened |
| B-03 relationship | Remains a separate unresolved authority-source decision; not resolved by this plan |
| Implementation authorization | **None** |
| Runtime enforcement claim | **None** |
| Overall readiness | Remains **BLOCKED** |
| B-04 closure by this plan | **No** — planning only; does not mark B-04 fully closed |

This plan authorizes **planning documentation only**. It does not perform reconciliation, does not update the Decision Closure register, and does not authorize implementation, SQL, Supabase, DEV, or PROD work.

---

## 2. Purpose

This document identifies the **exact section-level documentation changes** required to incorporate the accepted B-04 operator capability and human separation-of-duties policy into existing Application Deletion Pathway design artifacts.

It does **not** perform those changes.

It does **not** mark B-04 fully closed.

It does **not** claim schema enforcement, application enforcement, identity persistence, or runtime readiness.

It does **not** authorize application implementation, SQL/migration work, DEV apply, Supabase contact, or PROD contact.

---

## 3. Repository and Decision Baseline

| Item | Value |
|------|-------|
| Branch | `main` |
| HEAD | `2b12cc2b6379b6686f4e126915a5b850b9e20d47` |
| `origin/main` | `2b12cc2b6379b6686f4e126915a5b850b9e20d47` |
| Decision record path | `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_B_04_OPERATOR_CAPABILITY_AND_SOD_DECISION_RECORD.md` |
| Decision record commit | Present on baseline (`2b12cc2b` — Add B-04 operator capability and SoD decision record) |
| Selected option | Option C — request-scope-deterministic risk-based human separation |
| Authoring posture for this plan | Documentation-only; no existing file modification |

### Authoritative sources read (read-only)

1. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_B_04_OPERATOR_CAPABILITY_AND_SOD_DECISION_RECORD.md` — policy authority
2. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md` — primary reconciliation target
3. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md` — secondary reconciliation target
4. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md` — future register/status target only
5. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_VALIDATION_GATE_DECISION_RECORD.md` — C-01/B-19 preservation authority
6. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_TARGETED_RECONCILIATION_PLAN.md` — reconciliation-plan pattern and B-04 non-closure precedent
7. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_EXECUTION_ORCHESTRATION_DESIGN.md` — C-01 sequencing preservation context
8. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PLAN.md` — pathway contract context; not a B-04 edit target
9. `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md` — historical readiness evidence; not a B-04 edit target
10. `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` — current persistence/enforcement-gap evidence

---

## 4. Exact Reconciliation Objective

Future targeted documentation reconciliation must:

1. Replace open / unresolved B-04 SoD statements in the listed Operator Authorization Design and Security and Abuse Design sections with the locked Option C request-scope matrix.
2. Preserve discrete capability packaging (`queue_read`, `validate`, `reject`, `execute`, `review`/`audit`) with no automatic implication between capabilities.
3. Preserve natural-person identity, `service_role` process-privilege boundary, fail-closed pre-mutation rules, and break-glass prohibition.
4. Preserve C-01/B-19 validate-before-execute sequencing unchanged.
5. Preserve honest current enforcement-gap statements (schema and application do not enforce B-04 today).
6. Update Decision Closure Plan B-04 register/status **only after** the targeted design reconciliations are performed, accepted, and committed — never merely because the decision record exists.
7. Leave B-03 unresolved and not invent an authority source.
8. Perform **no** implementation, SQL, identity persistence, comparison logic, DEV, PROD, or Supabase work as part of B-04 documentation reconciliation.

---

## 5. Locked B-04 Policy Summary

### 5.1 Exact request-scope matrix

| Request scope | Same human may validate and execute? | Required human-separation rule | Capability requirement |
|---------------|--------------------------------------|--------------------------------|------------------------|
| `account_wide` | **No** | Validator natural-person identity **must differ** from executor natural-person identity | Distinct validate + execute capabilities; both required on their respective actions |
| `scan_specific` | **Yes, if separately authorized** | Different-human separation **not** mandatory | Acting human must independently hold validate for validation and execute for execution |
| `evidence_specific` | **Yes, if separately authorized** | Different-human separation **not** mandatory | Acting human must independently hold validate for validation and execute for execution |

### 5.2 Locked policy bullets (must be preserved exactly in meaning)

1. **`account_wide`**
   - Validator and executor must be different natural persons.
   - The same human must not validate and execute the request.
   - The execution path must compare stable validator and executor natural-person identities.
   - Equal, missing, unstable, untrusted, or non-comparable identities must fail closed before workflow mutation.
2. **`scan_specific`**
   - The same natural person may validate and execute.
   - That person must independently possess both validate and execute capabilities.
   - Possession of one capability must not imply the other.
   - Both actions must remain separately authorized and durably attributable.
   - Missing or unreliable natural-person identity must fail closed.
3. **`evidence_specific`**
   - Apply the same rule as `scan_specific`.
   - Same-human validation and execution are permitted only with independent authorization for both capabilities.
4. **Deterministic request-scope rule**
   - `account_wide` = mandatory different-human separation.
   - `scan_specific` = same human permitted with independent dual authorization.
   - `evidence_specific` = same human permitted with independent dual authorization.
   - No discretionary, inferred, or undocumented exception is allowed.
5. **Discrete capabilities** — `queue_read`, `validate`, `reject`, `execute`, `review`/`audit`; no capability automatically includes another; generic operator label insufficient; review/audit read-only and cannot substitute for validation; reject does not imply execute.
6. **Natural-person identity boundary** — stable server-derived natural-person identity; client-supplied identity untrusted; `service_role` is process privilege, not human identity; shared `service_role` cannot establish validator/executor identity; privileged verification cannot prove realistic runtime least privilege or human separation.
7. **Break-glass** — no emergency bypass authorized; any future exception requires a separate explicit decision and authorization.
8. **Current enforcement truth** — committed schema does not persist stable validator/executor natural-person identities; database cannot enforce mandatory different-human `account_wide` rule; application does not implement operator authorization or natural-person identity comparison; B-04 is accepted policy documentation only; implementation and runtime enforcement remain future work.

Rejected non-selected options that must not be reintroduced as accepted policy during reconciliation:

- Always allow same human for every scope
- Always require different humans for every scope
- Discretionary / case-by-case SoD
- Break-glass bypass

---

## 6. Relationship to C-01/B-19

| Concern | Authority | Posture under B-04 reconciliation |
|---------|-----------|-----------------------------------|
| Action sequencing (validate before execute) | C-01 / B-19 | **Unchanged — must not reopen or weaken** |
| Human separation (same person vs different person) | B-04 | Selected by Option C; documentation reconciliation only |
| Capability discreteness (validate ≠ execute) | Operator Authorization Design + B-04 | Affirmed; packaging preserved |

### Locked C-01/B-19 sequencing rules (must remain unchanged)

1. Validate before execute remains mandatory.
2. Validation remains a distinct prior authorized action.
3. Validation leaves `request_state = received`.
4. Validation sets `validated_at` exactly once.
5. Execution requires `request_state = received` and `validated_at` non-null.
6. Execution does not mutate `validated_at`.
7. Action sequencing alone does not prove human separation.

B-04 reconciliation must not reinterpret C-01/B-19 as human SoD proof, and must not alter Execution Orchestration Design or Pathway Plan C-01 wording under the B-04 package.

---

## 7. Reconciliation Principles

1. **Smallest possible documentation diff** — edit only listed B-04 open/unresolved statements and necessary adjacent clarifying sentences in authorized target sections.
2. **Policy incorporation, not enforcement invention** — state the selected matrix; do not claim current schema/application enforcement.
3. **Fail closed before mutation** — preserve and, where open wording exists, clarify that SoD/capability/identity failures deny before workflow mutation.
4. **No silent B-03 resolution** — authority-source selection remains open.
5. **No C-01 reopening** — preserve validate-before-execute milestone semantics.
6. **No break-glass insertion** — keep emergency bypass unauthorized.
7. **Honest gap preservation** — schema lacks validator/executor natural-person identity persistence; application lacks operator authz/comparison path.
8. **Register last** — Decision Closure Plan B-04 status updates only after design reconciliations are accepted and committed.
9. **No implementation package** — documentation-only future work.
10. **No overclaim** — see Section 30.

---

## 8. Target Artifact Inventory

### 8.1 Documents requiring future targeted edits

| Path | Exact targets | Nature |
|------|---------------|--------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md` | §9; §12; §26; §27; §42 items 4–5; §43 where applicable | Documentation wording only |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md` | §30; §41 item 3 | Documentation wording only |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md` | B-04 register / status only | Documentation wording only; **after** design reconciliations |

### 8.2 Documents inspected and not edit targets for B-04

| Path | Treatment |
|------|-----------|
| B-04 decision record | Policy authority; not rewritten by reconciliation |
| C-01 decision record | Sequencing authority; preserve |
| C-01 targeted reconciliation plan | Pattern/precedent only |
| Execution Orchestration Design | C-01 preservation context; not a B-04 target |
| Pathway Plan | Not a B-04 open-SoD restatement target |
| Pre-Implementation Readiness Review | Historical readiness evidence |
| Migration SQL | Enforcement-gap evidence only; no edit |

### 8.3 Prohibited implementation and SQL scope

Not authorized by this plan or by future B-04 documentation reconciliation:

- Operator authorization modules, identity persistence, identity comparison, capability grants, routes, UI, middleware, sessions, workers
- Migrations, verification SQL, database objects, RLS, auth flows
- DEV / PROD / Supabase contact; Block A; Block B
- Claims of runtime enforcement or overall readiness PASS

---

## 9. Operator Authorization Design §9 Plan

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md`
**Section:** `## 9. Validation Versus Execution Separation`

| Field | Value |
|-------|-------|
| Current subject / posture | Affirms distinct `request_validate` / `request_reject` vs `request_execute`; states that whether the same person may validate and execute **remains an open SoD decision** (points to §26); does not invent final SoD policy |
| Exact B-04 policy to incorporate | Request-scope matrix: `account_wide` mandatory different-human; `scan_specific` / `evidence_specific` same-human permitted only with independent dual capability authorization; fail closed on equal/missing/unstable/untrusted/non-comparable identities for `account_wide` |
| Required conceptual correction | Replace “remains an open segregation-of-duties decision” with selected Option C policy summary; keep capability discreteness; state that action separation ≠ human separation proof |
| Statements that must remain unchanged | Distinct capabilities; validator does not automatically gain execution permission; queue/detail read never implies execution; execution cannot be inferred from general admin access / decorative Admin labels |
| Prohibited overclaims | Current enforcement; schema identity persistence; B-03 closure; break-glass; global SoD for all scopes |
| Dependencies / acceptance evidence | B-04 decision record §§5–9; after edit, §9 must match matrix and still point to §26 for full SoD detail without reopening as “unresolved” |

---

## 10. Operator Authorization Design §12 Plan

**Path:** same Operator Authorization Design
**Section:** `## 12. Initial Release Posture`

| Field | Value |
|-------|-------|
| Current subject / posture | Initial-release recommendation pending approval; capability split at minimum queue/privileged read vs validate/reject vs execute; “Whether validate and execute may be held by the same person remains open (Section 26)” |
| Exact B-04 policy to incorporate | Close the open same-person note against the selected request-scope matrix; preserve discrete capability split |
| Required conceptual correction | Replace open same-person note with: same-person validate+execute prohibited for `account_wide`; permitted for `scan_specific` / `evidence_specific` only when both capabilities independently held and natural-person identity is stable/attributable |
| Statements that must remain unchanged | Very small operator population; server-side allowlist/equivalent **as recommendation pending B-03**; deny-by-default; no browser-controlled roles; change control; environment separation; auditability |
| Prohibited overclaims | Selecting B-03 authority source; claiming allowlist is implemented; claiming runtime SoD enforcement; claiming PROD readiness |
| Dependencies / acceptance evidence | Must remain consistent with §9 / §26 / §27 after reconciliation; must not convert §12 recommendation language into implemented authority-source selection |

---

## 11. Operator Authorization Design §26 Plan

**Path:** same Operator Authorization Design
**Section:** `## 26. Segregation of Duties`

| Field | Value |
|-------|-------|
| Current subject / posture | Evaluates models without selecting final policy; table marks same-person, must-differ, two-person for selected scopes, and emergency exception as **Open**; records “Final policy unresolved”; notes schema does not enforce human SoD; application must enforce any future SoD policy; no invented constraint claimed as accepted |
| Exact B-04 policy to incorporate | Record selected Option C matrix; reject always-same / always-different / discretionary / break-glass as non-selected; bind fail-closed comparison rules; preserve enforcement-gap honesty |
| Required conceptual correction | Replace open/unresolved SoD posture with selected policy; update the model table so selected request-scope-deterministic posture is accepted and non-selected options are recorded as rejected/not authorized; keep “schema does not by itself enforce human SoD” and “application must enforce” as **future** enforcement truth, not as “policy unresolved” |
| Statements that must remain unchanged | Database schema does not by itself enforce human segregation of duties today; no claim that current application enforces SoD; no invented persistence columns |
| Prohibited overclaims | Current DB enforcement; current app enforcement; validator/executor identity columns exist; break-glass authorized; discretionary exceptions |
| Dependencies / acceptance evidence | B-04 decision record §§4–11, §16; must align with §9, §12, §27, §42 items 4–5 |

---

## 12. Operator Authorization Design §27 Plan

**Path:** same Operator Authorization Design
**Section:** `## 27. Scope-Based Authorization`

| Field | Value |
|-------|-------|
| Current subject / posture | Privileges may later vary by scope and validate vs execute and DEV vs PROD; account-wide execution is highest risk; scope restrictions server-enforced; clients cannot elevate; initial release may start with environment-scoped full deletion-operator capabilities for a tiny allowlist without silently granting PROD/unrelated admin powers |
| Exact B-04 policy to incorporate | Bind `account_wide` mandatory different-human validate/execute rule; bind `scan_specific` / `evidence_specific` same-human-permitted-with-independent-dual-authorization rule; scope read server-side before authorization comparison; unknown/missing scope fails closed for privileged mutation |
| Required conceptual correction | Add explicit SoD binding by request scope without converting environment/DEV-PROD scoping into SoD exceptions; clarify that “full deletion-operator capabilities” packaging still requires discrete capability checks and does not waive `account_wide` different-human comparison |
| Statements that must remain unchanged | Account-wide is highest risk; server-enforced scope; clients cannot select/elevate privilege; DEV≠PROD; no silent PROD grant |
| Prohibited overclaims | Client-selectable SoD waiver; discretionary scope exceptions; current runtime scope/SoD enforcement |
| Dependencies / acceptance evidence | Must match §26 matrix; preserve B-03 openness for how capabilities are sourced |

---

## 13. Operator Authorization Design §42 Items 4–5 Plan

**Path:** same Operator Authorization Design
**Section:** `## 42. Open Authorization Decisions` — items 4 and 5

| Field | Value |
|-------|-------|
| Current subject / posture | Item 4: “Validator/executor segregation” listed unresolved; Item 5: “Two-person approval” listed unresolved; surrounding items (including final authority source / B-03-related item 1) remain open |
| Exact B-04 policy to incorporate | After acceptance/reconciliation: item 4 closed by Option C matrix; item 5 clarified that two-person/different-human approval is satisfied for `account_wide` by the mandatory different-human rule and is **not** globally required for all scopes |
| Required conceptual correction | Update only items 4–5 to selected/closed-with-scope-matrix status; do not close unrelated open decisions in §42 |
| Statements that must remain unchanged | Items 1–3 and 6–14 remain open unless separately decided; especially final authority source (B-03), step-up, cache TTL, emergency-access policy, PROD authority process |
| Prohibited overclaims | Closing B-03 via item 1; authorizing emergency access via item 10; claiming implementation readiness because items 4–5 are selected |
| Dependencies / acceptance evidence | Only after B-04 decision acceptance and targeted reconciliation of §9/§12/§26/§27; register update in Decision Closure Plan remains a later step |

---

## 14. Operator Authorization Design §43 Plan (Where Applicable)

**Path:** same Operator Authorization Design
**Section:** `## 43. Implementation Preconditions`

| Field | Value |
|-------|-------|
| Current subject / posture | Operator implementation prohibited until listed preconditions hold, including “Segregation-of-duties decision recorded” |
| Exact B-04 policy to incorporate | Clarify that SoD decision being **recorded** is necessary but not sufficient; acceptance, targeted documentation reconciliation, and future enforcement evidence remain required before implementation may claim B-04 compliance |
| Required conceptual correction | Where applicable, refine the SoD precondition bullet to: decision recorded **and** accepted; documentation reconciled; identity/capability/comparison enforcement and tests still required later — without authorizing those later steps here |
| Statements that must remain unchanged | All other preconditions (DEV project, migration apply, Block A/B, design acceptances, authority source selected, environment separation, revocation, audit posture, final security review) |
| Prohibited overclaims | That recording/reconciling B-04 authorizes operator implementation; that realistic runtime least privilege is proven; that B-03 is closed |
| Dependencies / acceptance evidence | Align with B-04 decision record §§12, §18 and this plan’s closure boundary |

---

## 15. Security and Abuse Design §30 Plan

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`
**Section:** `## 30. Operator Abuse and Insider Risk`

| Field | Value |
|-------|-------|
| Current subject / posture | Self-approval / execution row states “Segregation of duties remains an open decision — not invented here”; closing note forbids inventing final SoD policy in this document |
| Exact B-04 policy to incorporate | Replace open-decision wording with selected Option C summary: `account_wide` different-human mandatory; narrow scopes same-human permitted only with independent dual authorization; fail closed before mutation on identity/capability failures; no break-glass |
| Required conceptual correction | Update self-approval control direction to selected policy; replace “do not invent final SoD policy” with “SoD policy selected under B-04 decision record; this section summarizes accepted policy only and does not claim runtime enforcement” |
| Statements that must remain unchanged | Other abuse rows (unauthorized access, excessive privilege least-privilege direction, closed rejection codes, server-derived targets, note leakage, stale execution, audit tampering, emergency credential revocation) |
| Prohibited overclaims | Current enforcement; schema identity persistence; service_role as human identity; discretionary exceptions |
| Dependencies / acceptance evidence | Must match Operator Authorization Design §26 matrix after reconciliation; remain consistent with §41 item 3 update |

---

## 16. Security and Abuse Design §41 Item 3 Plan

**Path:** same Security and Abuse Design
**Section:** `## 41. Open Security Decisions` — item 3

| Field | Value |
|-------|-------|
| Current subject / posture | Item 3: “Segregation of duties (validate vs execute separation)” listed among unresolved decisions |
| Exact B-04 policy to incorporate | Mark segregation-of-duties / human SoD as selected under B-04 Option C (request-scope matrix), only after acceptance and targeted reconciliation |
| Required conceptual correction | Update item 3 from unresolved to selected/closed-by-B-04 with brief matrix pointer; keep capability discreteness and human-separation distinction clear; do not collapse C-01 action sequencing into this item |
| Statements that must remain unchanged | Other open security decisions (operator authorization mechanism / B-03-related, re-auth, CSRF, rate limits, idempotency, worker auth, residual lifecycle, etc.) |
| Prohibited overclaims | Closing operator authorization mechanism (item 1) via B-04; claiming runtime SoD enforcement; reopening C-01 |
| Dependencies / acceptance evidence | Requires prior/parallel Operator Authorization Design SoD section reconciliation; Decision Closure register update remains later |

---

## 17. Decision Closure Plan Register/Status Plan

**Path:** `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md`
**Future target:** B-04 register / status references only (including §8 blocking register row for B-04 and Wave 1 §13 status language where it still presents B-04 as unresolved policy selection)

### Preconditions before any register/status update may occur

The register may be updated **only after all** of the following:

1. The B-04 decision record is accepted and committed.
2. The authorized targeted reconciliation (Operator Authorization Design + Security and Abuse Design targets in this plan) is performed.
3. All changed documents pass acceptance review.
4. The reconciliation is committed.
5. Repository integrity is confirmed.

### Binding constraints for that future update

- Do **not** update the register in this planning task.
- Do **not** declare B-04 fully closed merely because its decision record is committed.
- Do **not** rewrite historical sequencing narrative as runtime proof.
- Do **not** claim schema/application enforcement by changing register wording.
- Do **not** silently close B-03, B-16 packaging edges, or overall readiness.
- Future status language may record: policy selected (Option C); documentation reconciled; **implementation/runtime enforcement still open/blocked**.

### Explicit non-closure

Documentation reconciliation + register update, even when later authorized and completed, still leave implementation and runtime enforcement as future work. Full B-04 closure across the design/implementation chain requires later enforcement evidence (see Sections 31–32).

---

## 18. Cross-Document Terminology Contract

| Term | Binding meaning for B-04 reconciliation |
|------|----------------------------------------|
| Natural-person identity | Stable server-derived individual human subject used for attribution and equality comparison |
| Validator identity | Natural-person identity that performed the authorized validation action |
| Executor identity | Natural-person identity that attempts/performs the authorized execution action |
| Different-human separation | Validator identity ≠ executor identity under reliable comparison |
| Same-human permitted | Same natural person may perform both actions only when scope policy allows and both capabilities are independently held |
| Capability | Independently grantable authorization unit; not implied by another capability or by a generic operator/admin label |
| `queue_read` | Privileged least-data queue/list read only |
| `validate` / `request_validate` | Authorized validation mutation capability; sets `validated_at` once while remaining `received`; does not authorize execute |
| `reject` / `request_reject` | Authorized rejection capability; does not imply execute |
| `execute` / `request_execute` | Highest-risk execution capability; does not imply validate or reject |
| `review` / `audit` / `audit_read` | Read-only review/audit capability; cannot substitute for validation; no workflow mutation authority |
| `service_role` | Process/database privilege for approved server effects after human authorization; **not** human identity |
| Fail closed before workflow mutation | Denial with no `validated_at` mutation, no reject terminalization caused by the failed check, no execution lifecycle/attribution/terminal success effects |
| Action sequencing | C-01/B-19 validate-before-execute milestone rules |
| Human separation | B-04 same-vs-different person rules by request scope |

Capability label aliases (`validate` vs `request_validate`, etc.) are policy packaging alignment labels; exact code constants remain a later implementation concern and must not be invented during documentation reconciliation.

---

## 19. Discrete Capability Preservation

Future reconciliation must preserve:

1. Capabilities remain independently grantable.
2. No capability automatically includes another.
3. A generic operator / Admin label is not sufficient authorization.
4. Review/audit remains read-only and cannot substitute for validation.
5. Reject capability must not imply execute capability.
6. Validate does not grant execute; execute does not grant validate.
7. Queue/privileged read does not grant validate, reject, or execute.

These rules apply for **all** request scopes, including scopes that permit same-human validate+execute.

---

## 20. Natural-Person Identity Preservation

Future reconciliation must preserve:

1. Policy concerns a stable server-derived natural-person identity.
2. Client-supplied identity, role flags, headers, or body fields are not trusted as authorization evidence.
3. Shared accounts are prohibited as attributable actors.
4. Missing, unstable, untrusted, ambiguous, or non-attributable identity fails closed.
5. For `account_wide`, validator and executor identities must be comparable as natural-person subjects.
6. Validator identity and executor identity remain distinct attribution facts even when same-human is permitted by scope policy.
7. Exact persistence medium for durable human attribution remains a later design/implementation decision and must **not** be invented during B-04 documentation reconciliation.

---

## 21. Service-Role Boundary Preservation

Future reconciliation must preserve:

| Claim | Required posture |
|-------|------------------|
| `service_role` is database/process privilege | Affirmed |
| `service_role` is human operator identity | **False / prohibited** |
| Shared `service_role` satisfies validator identity | **Prohibited** |
| Shared `service_role` satisfies executor identity | **Prohibited** |
| Shared `service_role` proves different-human separation | **Prohibited** |
| Privileged verification proves realistic runtime least privilege | **Not claimed** |
| Privileged verification proves human SoD enforcement | **Not claimed** |

Service-role may later perform approved database effects only after human authorization succeeds. It never satisfies B-04 human-identity evidence.

---

## 22. Fail-Closed and Pre-Mutation Requirements

Future reconciled wording must require fail-closed **before any workflow mutation** when:

1. Required capability evidence is missing for the attempted action.
2. Acting human identity is missing, unstable, untrusted, ambiguous, or not attributable.
3. For `account_wide` execution: validator identity missing; executor identity missing; identities incomparable; or identities equal.
4. Request scope is unknown, missing, or outside the closed scope set.
5. Authority-source lookup fails or returns malformed/untrusted data (when authority source is later bound under B-03).
6. Environment authority mismatch (when environment scoping is later bound).
7. Audit/attribution evidence required for the privileged mutation cannot be established.

Fail-closed means no `validated_at` mutation, no reject terminalization caused by the failed check, no execution lifecycle effects, no execution attribution inserts, no terminal success transition — safe denial/conflict response only.

---

## 23. Break-Glass Disposition

| Topic | Disposition |
|-------|-------------|
| Break-glass bypass of selected human-separation rule | **Not authorized** |
| Emergency same-human `account_wide` validate+execute | **Not authorized** |
| Capability auto-elevation under incident pressure | **Not authorized** |
| Future exception | Requires a **separate explicit decision and authorization** |
| Default if exception absent | Selected matrix remains binding |

Reconciliation must not insert emergency exception language as accepted policy.

---

## 24. Current Enforcement-Gap Preservation

Honest current posture that must remain explicit after documentation reconciliation:

| Layer | Current enforcement of selected B-04 policy |
|-------|---------------------------------------------|
| Committed schema (`deletion_requests`) | Persists workflow metadata and `validated_at` milestone; does **not** persist stable validator or executor natural-person identities; **cannot** enforce different-human `account_wide` comparison |
| Committed attribution table (`deletion_request_executions`) | Session-anchor attribution only; not human validator/executor identity persistence for SoD |
| Application code | No implemented operator authorization module, capability checks, or validator/executor identity-comparison path |
| Auth/session | Ordinary NextAuth identity only; no operator capability claims |
| Runtime DEV/PROD | Migration unapplied under current gate posture; no runtime SoD proof |

Therefore reconciled documents may state accepted **policy**, but must **not** claim current schema enforcement, current application enforcement, or runtime readiness.

Migration evidence supporting the gap: `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` defines `validated_at` and workflow guards, and contains no validator/executor natural-person identity columns or SoD comparison enforcement.

---

## 25. B-03 Dependency Boundary

| Topic | Posture |
|-------|---------|
| B-03 decision | Operator authority-source selection — **still open / separately unresolved** |
| Allowed in B-04 plan | Identify B-03 as a dependency for future runtime binding of capabilities/identities |
| Prohibited in B-04 reconciliation | Silently resolve B-03; invent an authorization source; declare allowlist/IdP/registry implemented; treat recommendation language as final source selection |

B-04 selects **what** human-separation and capability packaging policy applies. B-03 remains required to select **where** operator authority is sourced before runtime binding.

---

## 26. Historical and NOT REQUIRED Artifacts

Treat as historical or **NOT REQUIRED** for targeted B-04 reconciliation unless a later audit proves otherwise:

| Artifact | Why not targeted |
|----------|------------------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md` | Historical readiness evidence at its baseline; accurate as then-open SoD recording; do not rewrite now |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_B_04_OPERATOR_CAPABILITY_AND_SOD_DECISION_RECORD.md` | Policy authority itself; not a reconciliation target |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_VALIDATION_GATE_DECISION_RECORD.md` | C-01/B-19 authority only; preserves B-04 as separate; not a B-04 edit target |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_TARGETED_RECONCILIATION_PLAN.md` | C-01 documentation reconciliation planning only |
| Verification SQL `B-04-*` checks | Identifiers concern unrelated terminal-transition tests; **not** human-SoD evidence |
| `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Persistence contract; no B-04 human-identity enforcement to edit under documentation reconciliation |
| Application code | Absent operator SoD path; not modified |
| DEV artifacts | Out of scope; contact prohibited |
| PROD artifacts | Out of scope; contact strictly prohibited |
| Execution Orchestration Design / Pathway Plan | Not B-04 open-SoD restatement targets; C-01 sequencing preserved separately |

Do not modify any of them under the B-04 targeted reconciliation package planned here.

---

## 27. Proposed Reconciliation Execution Order

Preferred future order (planning only; **not authorized to execute by this document**):

1. **Operator Authorization Design targeted reconciliation**
   Why first: primary SoD/capability contract; §§9, 12, 26, 27, 42 items 4–5, and §43 where applicable establish the canonical matrix other docs must summarize.
2. **Security and Abuse Design targeted reconciliation**
   Why second: abuse/open-decision language must align to the already-reconciled Operator Authorization Design matrix (§30 and §41 item 3).
3. **Cross-document read-only acceptance review**
   Why third: verify matrix consistency, C-01 preservation, enforcement-gap honesty, B-03 non-resolution, and prohibited-overclaim absence before any commit of reconciled design documents.
4. **Controlled commit and push of the accepted design reconciliation documents**
   Why fourth: the accepted design reconciliation must be committed before Decision Closure Plan register/status mutation begins (Section 17).
5. **Repository integrity confirmation**
   Why fifth: confirm expected files only; HEAD equals `origin/main`; no unintended tracked or staged changes; `.cursor/` untouched.
6. **Decision Closure Plan B-04 register/status reconciliation as a separate later edit**
   Why sixth: register/status may change only after the design reconciliation is committed and repository integrity is confirmed (Section 17).
7. **Independent read-only acceptance review of the register/status edit**
   Why seventh: the later register change requires its own review before its own controlled commit.
8. **Separate controlled commit and push of the accepted register/status reconciliation**
   Why eighth: register/status reconciliation is a distinct commit gate from the design reconciliation.
9. **Final read-only repository integrity review**
   Why ninth: confirm only authorized files changed; no SQL/app/DEV/PROD/network side effects; untracked/staged posture clean except approved docs.

Two separate controlled commit gates are required because:

- the design reconciliation must already be committed and integrity-confirmed before the Decision Closure Plan register is changed (Section 17);
- the later register/status change requires its own acceptance review and controlled commit;
- planning this order does **not** authorize executing any step.

Source evidence does not require a different order: Security §30/§41 currently defer SoD as open and should follow the Operator Authorization Design canonical update; Decision Closure register update is explicitly gated after reconciliation commit and repository integrity confirmation.

Planning this order does **not** authorize executing it.

---

## 28. Per-Artifact Validation Obligations

### 28.1 Operator Authorization Design (future package)

After future edit, reviewers must confirm:

- §9 no longer states SoD is open; matrix present; capability discreteness preserved
- §12 open same-person note closed against matrix; B-03 not silently selected
- §26 records Option C; non-selected options rejected; schema/app non-enforcement preserved
- §27 binds `account_wide` different-human rule and narrow-scope independent dual authorization
- §42 items 4–5 updated only; other open decisions remain open
- §43 SoD precondition refined without authorizing implementation
- No SQL/application files touched

### 28.2 Security and Abuse Design (future package)

After future edit, reviewers must confirm:

- §30 self-approval row reflects selected matrix and fail-closed posture
- §30 does not invent break-glass or discretionary exceptions
- §41 item 3 no longer lists SoD as unresolved policy selection
- Other open security decisions remain open
- No runtime-enforcement claim added

### 28.3 Decision Closure Plan (later, gated)

After future register/status edit, reviewers must confirm:

- All Section 17 preconditions were satisfied
- B-04 status does not claim full closure merely from decision-record existence
- Historical sequencing not rewritten as runtime proof
- B-03 and overall readiness remain appropriately open/blocked
- No unrelated blocker rows silently closed

---

## 29. Cross-Document Acceptance Criteria

Future B-04 documentation reconciliation is acceptable only if:

1. Option C request-scope matrix is incorporated unambiguously in Operator Authorization Design SoD sections.
2. Security and Abuse Design open/self-approval SoD wording matches the same matrix.
3. Discrete capabilities remain independent; no capability implies another.
4. Natural-person identity and `service_role` boundaries remain explicit.
5. Fail-closed-before-mutation rules remain explicit.
6. Break-glass remains unauthorized.
7. Current enforcement gap remains honest (no schema/app enforcement claim).
8. C-01/B-19 sequencing rules remain unchanged and unreopened.
9. B-03 remains unresolved.
10. Decision Closure register/status is updated only under Section 17 gates.
11. No SQL, verification SQL, migration, application, DEV, PROD, or Supabase changes occur.
12. Unsupported guarantees in Section 30 remain excluded.
13. B-04 is not marked fully closed across the implementation chain merely by documentation reconciliation.

---

## 30. Unsupported Guarantees Explicitly Excluded

This plan does **not** claim, and future B-04 documentation reconciliation must **not** claim:

- B-04 is fully reconciled (by this plan alone) or fully closed across the design/implementation chain
- schema enforcement of different-human `account_wide` comparison exists
- application enforcement of operator authorization or natural-person identity comparison exists
- validator identity is currently persisted
- executor identity is currently persisted
- `service_role` establishes human identity
- realistic runtime least privilege has been proven
- global idempotency
- concurrency safety beyond committed evidence
- safe blind retries
- residual erasure
- post-terminal attribution guarantees
- email delivery
- implementation readiness
- execution readiness
- SQL authorization
- Supabase authorization
- DEV readiness
- PROD readiness

---

## 31. Residual Blockers After Documentation Reconciliation

Even after a later successful B-04 documentation reconciliation, the following remain residual blockers / open dependencies:

| Dependency | Status after docs reconciliation |
|------------|----------------------------------|
| B-03 Operator authority source | Still open — required before runtime binding |
| C-01 / B-19 validate-before-execute | Selected/preserved; not reopened |
| Durable validator/executor identity persistence design | Not selected; may be required for enforcement |
| Application operator authorization implementation | Not authorized |
| Identity comparison enforcement and tests | Not authorized / not proven |
| B-01 / B-02 DEV identity and migration apply | Still blocked; required before runtime proof |
| B-09 concurrency mechanism | Still open; complementary to SoD |
| B-15 audit sink / retention | Still open; needed for durable privileged attribution operations |
| B-16 ambiguous-result review packaging | Still coupled to review capability packaging; not fully closed by B-04 docs reconciliation alone |
| Overall readiness | Remains **BLOCKED** |

---

## 32. B-04 Closure Boundary

This targeted reconciliation plan:

- **plans** section-level documentation reconciliation for accepted B-04 Option C policy;
- does **not** itself close B-04;
- does **not** perform reconciliation;
- does **not** prove implementation or runtime enforcement;
- leaves implementation and execution readiness **blocked**.

**Do not mark B-04 closed merely because this plan exists, or merely because the decision record is committed.**

Minimum future closure chain (separately authorized steps):

1. accepted and committed B-04 decision record;
2. accepted B-04 targeted reconciliation plan;
3. authorized targeted design reconciliation;
4. acceptance review and controlled commit/push of reconciled design documents;
5. repository integrity confirmation;
6. separately authorized Decision Closure Plan B-04 register/status edit under Section 17 gates;
7. acceptance review and controlled commit/push of the register/status edit;
8. final repository integrity confirmation;
9. later identity, capability, comparison enforcement, tests, and readiness updates under separate authorization.

Documentation reconciliation alone does not complete step 9 and therefore does not prove or close implementation/runtime enforcement, nor authorize claiming full B-04 enforcement closure.

---

## 33. Non-Authorization Statement

**Authorized by this task:**

- creation and review of this B-04 targeted reconciliation plan candidate.

**Not authorized:**

- modification of any existing file;
- performance of the planned reconciliation;
- Decision Closure Plan register/status update;
- application / API / UI / auth / operator implementation;
- identity persistence or comparison implementation;
- SQL, migration, or verification SQL changes;
- Block A / Block B;
- Supabase contact;
- DEV or PROD changes;
- staging, commit, or push;
- claims of current runtime enforcement;
- claims that overall readiness is PASS;
- claims that B-04 is fully closed;
- silent resolution of B-03;
- reopening or weakening of C-01/B-19.

---

## 34. Final Planning Statement

- B-04 selected policy remains **request-scope-deterministic human separation (Option C)**.
- `account_wide`: different human must validate and execute; same-human path fails closed before mutation.
- `scan_specific` / `evidence_specific`: same human permitted only with independently held validate and execute capabilities and stable natural-person identity.
- Capabilities remain discrete; `service_role` is never human SoD evidence.
- C-01 / B-19 remains preserved unchanged.
- Reconciliation has **not** yet occurred.
- Implementation remains **blocked**.
- Database execution remains **not authorized**.
- DEV and PROD contact remain **not authorized**.
- Exact next safe step after acceptance of this plan is separately authorized **B-04 targeted documentation reconciliation** of the inventory in Section 8, in the order in Section 27.
