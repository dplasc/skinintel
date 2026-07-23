# Phase 2 Slice 2 — Application Deletion Pathway B-04 Operator Capability and SoD Decision Record

- Status: Draft decision selected — pending acceptance
- Decision ID: B-04
- Decision domain: Operator capability packaging and human segregation of duties
- Review baseline: `10e676325858ebec8806348081c1fa995f9862b3`
- Selected decision: request-scope-deterministic human separation (mandatory different-human for `account_wide`; same-human permitted for `scan_specific` and `evidence_specific` when separately capability-authorized)
- Existing artifact reconciliation: not authorized
- Application implementation: not authorized
- Database execution: not authorized
- DEV execution gate: blocked
- Supabase contact: prohibited
- PROD: strictly prohibited

---

## 1. Status and Authority

| Attribute | Binding posture |
|-----------|-----------------|
| Decision ID | **B-04** |
| Title | Operator capability and human separation-of-duties policy |
| Status | Draft decision selected — pending acceptance |
| Authority categories | Security architecture + project owner/product authority (per Decision Closure Plan §33); application architecture and operations/support as required reviewers |
| Precedence once accepted and committed | Selects the B-04 policy candidate for future reconciliation; does **not** silently rewrite existing designs in this task |
| C-01 / B-19 relationship | Preserved unchanged — validate-before-execute action sequencing remains closed |
| Implementation authorization | **None** |
| Runtime enforcement claim | **None** |
| Overall readiness | Remains **BLOCKED** |

This record is documentation-only. Creating it does **not** close B-04 across the design chain, does **not** prove enforcement, and does **not** authorize privileged operator implementation.

---

## 2. Exact B-04 Decision Question

What operator capability packaging and human segregation-of-duties policy applies to privileged validation and execution on the Application Deletion Pathway, including:

1. whether the same natural person may both validate and execute a deletion request;
2. whether that answer varies by request scope (`account_wide`, `scan_specific`, `evidence_specific`);
3. which discrete capabilities must remain independently grantable;
4. what identity evidence is required for human attribution and equality comparison;
5. what fail-closed posture applies when identity or capability evidence is missing, unstable, untrusted, or incomparable;
6. whether `service_role` may satisfy human identity or separation requirements;
7. whether any break-glass exception is authorized now.

---

## 3. Relationship to C-01 / B-19

**C-01 / B-19** selected and preserved posture (unchanged by this record):

- Validation is a distinct prior authorized action.
- Successful validation leaves `request_state = received`.
- Successful validation sets `validated_at` exactly once.
- Execution requires `request_state = received` and `validated_at` non-null.
- Execution must never set, replace, clear, or reinterpret `validated_at`.
- Missing `validated_at` at execution entry fails closed with no workflow mutation.

**Binding separation of concerns:**

| Concern | Authority |
|---------|-----------|
| Action sequencing (validate before execute) | C-01 / B-19 — closed as selected architecture |
| Human separation (same person vs different person) | **B-04 — selected by this record** |
| Capability discreteness (validate ≠ execute) | Affirmed by Operator Authorization Design; packaged by this B-04 record |

Action sequencing does **not** prove human separation. Distinct capabilities do **not** prove different-human enforcement. This record must not reopen, weaken, or reinterpret C-01 / B-19.

---

## 4. Considered Policy Options

Evaluated without inventing unsupported infrastructure:

### Option A — Always allow same human

Same authorized human may validate and execute for every scope, provided both capabilities are held.

| Assessment | Result |
|------------|--------|
| Account-wide dual-control risk | High — highest-impact scope lacks human separation |
| Operational simplicity | High |
| Audit clarity | Medium — attributable, but no mandatory second person |
| Fit to risk ranking (`account_wide` highest) | Weak |

### Option B — Always require different humans

Validator and executor must differ for every scope.

| Assessment | Result |
|------------|--------|
| Dual-control strength | Highest |
| Operational cost for narrow scopes | High — may over-constrain `scan_specific` / `evidence_specific` |
| Fit to request-scope risk differentiation | Weak — treats all scopes identically |

### Option C — Request-scope-deterministic risk-based separation (selected)

- `account_wide`: mandatory different-human validation and execution.
- `scan_specific` / `evidence_specific`: same human permitted when independently authorized for both actions.
- Capabilities remain discrete in all cases.
- Fail closed when identity evidence cannot support the required comparison or attribution.

| Assessment | Result |
|------------|--------|
| Account-wide dual-control risk | Controlled by mandatory different-human rule |
| Narrow-scope operability | Preserved under separate capability possession |
| Determinism | High — scope alone selects the human-separation rule |
| Discretionary exceptions | Prohibited |

### Option D — Discretionary / case-by-case SoD

Operators or reviewers choose when separation applies.

| Assessment | Result |
|------------|--------|
| Determinism | Fail — silent or discretionary exceptions |
| Auditability | Weak |
| Abuse resistance | Weak |

### Option E — Break-glass bypass of human separation

Emergency same-human or capability-bypass path for any scope.

| Assessment | Result |
|------------|--------|
| Authorization in this record | **Rejected / not authorized** |
| Future path | Requires a separate explicit decision |

---

## 5. Selected Risk-Based Policy

**Selected option: Option C — request-scope-deterministic risk-based human separation.**

Binding selected posture:

1. For an `account_wide` deletion request:
   - the human who validates the request must be different from the human who executes it;
   - same-human validation and execution are prohibited;
   - execution must fail closed before any workflow mutation if the validator and executor identities are equal, missing, unstable, untrusted, or cannot be compared reliably.
2. For `scan_specific` and `evidence_specific` deletion requests:
   - the same authorized human may validate and execute;
   - that human must independently possess both the validate capability and the execute capability;
   - possession of one capability must not imply possession of the other;
   - both actions must remain separately authorized and attributable;
   - inability to establish the acting human’s stable identity must fail closed.
3. The policy is request-scope deterministic:
   - `account_wide` = mandatory different-human separation;
   - `scan_specific` = same human permitted when separately authorized for both actions;
   - `evidence_specific` = same human permitted when separately authorized for both actions;
   - no discretionary or silently inferred scope exception is permitted.
4. The policy concerns natural-person identity:
   - `service_role` is process privilege, not human identity;
   - a shared `service_role` credential must never satisfy validator/executor identity evidence;
   - privileged verification does not prove realistic runtime least privilege or human separation.
5. Capability packaging remains discrete (Section 7).
6. No break-glass or emergency bypass of the selected human-separation rule is authorized by this decision.
7. This decision establishes **policy only** and must not claim current runtime enforcement.

---

## 6. Exact Request-Scope Matrix

| Request scope | Same human may validate and execute? | Required human-separation rule | Capability requirement |
|---------------|--------------------------------------|--------------------------------|------------------------|
| `account_wide` | **No** | Validator natural-person identity **must differ** from executor natural-person identity | Distinct validate + execute capabilities; both required on their respective actions |
| `scan_specific` | **Yes, if separately authorized** | Different-human separation **not** mandatory | Acting human must independently hold validate for validation and execute for execution |
| `evidence_specific` | **Yes, if separately authorized** | Different-human separation **not** mandatory | Acting human must independently hold validate for validation and execute for execution |

Additional matrix rules:

- Scope is read from the governed request server-side before authorization comparison.
- Clients cannot select, elevate, or waive the human-separation rule.
- Unknown or missing scope fails closed for privileged mutation.
- Reject remains a separate capability and does not imply execute authorization.
- Review/audit remains read-only and does not substitute for validation.

---

## 7. Discrete Capability Model

Capabilities remain independently grantable. No capability automatically includes another. No generic operator label is sufficient authorization.

| Capability (conceptual packaging) | Mutation | May imply another capability? | Notes |
|-----------------------------------|----------|-------------------------------|-------|
| `queue_read` | No | No | Queue / least-data privileged list access only |
| `validate` | Yes | No | Sets `validated_at` once while remaining `received`; does not authorize execute |
| `reject` | Yes | No | Closed rejection codes only; does **not** imply execute |
| `execute` | Yes | No | Highest-risk mutation; does not imply validate or reject |
| `review` / `audit` | No (read-only) | No | Does **not** substitute for validation; no workflow mutation authority |

Binding packaging rules:

1. Possession of `validate` does not grant `execute`.
2. Possession of `execute` does not grant `validate`.
3. Possession of `reject` does not grant `execute`.
4. Possession of `queue_read` or `review`/`audit` does not grant validate, reject, or execute.
5. A decorative “Admin” label, dashboard access, or ordinary authenticated session is not authorization.
6. Capability names above are policy packaging labels aligned to Operator Authorization Design conceptual capabilities (`queue_read`, `request_validate`, `request_reject`, `request_execute`, `audit_read` / review). Exact code constants remain an implementation concern and are not invented here.

---

## 8. Natural-Person Identity Contract

Human separation and attribution require **natural-person** identity evidence.

| Requirement | Contract |
|-------------|----------|
| Actor type | Individual human operator identity |
| Source | Server-derived from authenticated session subject after approved authority-source resolution (B-03 remains open for source selection) |
| Stability | Identity must be stable enough for durable attribution and equality comparison |
| Trust | Client-supplied operator identity, role flags, headers, or body fields are ignored |
| Shared accounts | Prohibited as attributable actors |
| Comparison for `account_wide` | Validator identity and executor identity must be comparable as natural-person subjects |
| Missing / ambiguous subject | Fail closed |
| Process identity | `service_role` / orchestrator process identity is **not** a substitute human identity |

Validator identity and executor identity are distinct attribution facts even when the same human is permitted by scope policy.

---

## 9. Fail-Closed Rules

Fail closed **before any workflow mutation** when any of the following hold:

1. Required capability evidence is missing for the attempted action.
2. Acting human identity is missing, unstable, untrusted, ambiguous, or not attributable.
3. For `account_wide` execution:
   - validator identity is missing;
   - executor identity is missing;
   - identities cannot be compared reliably;
   - identities are equal (same human).
4. Request scope is unknown, missing, or not one of the closed scopes.
5. Authority-source lookup fails or returns malformed/untrusted data.
6. Environment authority mismatch (when environment scoping is later bound).
7. Audit/attribution evidence required for the privileged mutation cannot be established.

Fail-closed means:

- no `validated_at` mutation;
- no reject terminalization caused by the failed check;
- no execution lifecycle effects;
- no execution attribution inserts;
- no terminal success transition;
- safe denial / conflict response only (exact HTTP packaging later).

---

## 10. Service-Role Boundary

| Claim | Status under this decision |
|-------|----------------------------|
| `service_role` is database/process privilege | Affirmed |
| `service_role` is human operator identity | **False / prohibited** |
| Shared `service_role` credential satisfies validator identity | **Prohibited** |
| Shared `service_role` credential satisfies executor identity | **Prohibited** |
| Shared `service_role` credential proves different-human separation | **Prohibited** |
| Privileged verification / Block B / SQL checks prove realistic runtime least privilege | **Not claimed** |
| Privileged verification proves human SoD enforcement | **Not claimed** |

Service-role may later perform approved database effects only **after** human authorization succeeds. It never satisfies B-04 human-identity evidence.

---

## 11. Current Enforcement Gap

Honest current posture (committed evidence only):

| Layer | Current enforcement of selected B-04 policy |
|-------|---------------------------------------------|
| Committed schema (`deletion_requests`) | Persists workflow metadata and `validated_at` milestone; does **not** persist stable validator or executor natural-person identities; **cannot** enforce different-human `account_wide` comparison |
| Committed attribution table (`deletion_request_executions`) | Session-anchor attribution only; not human validator/executor identity persistence for SoD |
| Application code | No implemented operator authorization module, capability checks, or validator/executor identity-comparison path |
| Auth/session | Ordinary NextAuth identity only; no operator capability claims |
| Runtime DEV/PROD | Migration unapplied; DEV gate blocked; no runtime SoD proof |

Therefore:

- this decision establishes **policy only**;
- it must **not** claim current schema enforcement;
- it must **not** claim current application enforcement;
- it must **not** claim runtime readiness.

---

## 12. Required Future Enforcement Evidence

Before any implementation may claim B-04 enforcement, all of the following must exist and be proven by tests:

1. Stable server-derived validator identity.
2. Stable server-derived executor identity.
3. Durable attribution for both validation and execution actions.
4. Request scope known server-side before authorization comparison.
5. Capability evidence checked for each action independently.
6. Equality comparison of validator vs executor identities for `account_wide` requests.
7. Fail-closed rejection **before** workflow mutation when evidence is missing, invalid, equal (for `account_wide`), or incomparable.
8. Tests proving allowed and denied paths for:
   - `account_wide` different-human allow;
   - `account_wide` same-human deny;
   - `scan_specific` / `evidence_specific` same-human allow when both capabilities held;
   - missing-capability deny;
   - missing/unstable identity deny;
   - `service_role`-only / no-human deny at human-privileged entrypoints;
   - review/audit cannot validate or execute;
   - reject does not imply execute.

Exact persistence medium for durable human attribution remains a later design/implementation decision and is **not** invented or authorized by this record.

---

## 13. Application Implications

Future application implications (not authorized now):

- Operator validate and execute handlers must resolve natural-person identity server-side.
- Capability checks must be independent per action.
- `account_wide` execute path must load prior validator identity evidence and compare to current executor identity before mutation.
- `scan_specific` / `evidence_specific` execute path may allow same human only after both capability checks and stable identity attribution succeed.
- Ordinary-user routes remain incapable of privileged validate/execute.
- UI must not imply that a generic admin label satisfies B-04.
- No application package is authorized by this record.

---

## 14. Possible Schema / Audit Implications

Possible future needs (recorded only; **not authorized**, not designed here):

| Possible need | Why |
|---------------|-----|
| Durable validator natural-person attribution | Required for `account_wide` equality comparison and audit |
| Durable executor natural-person attribution | Required for execution accountability and SoD comparison |
| Audit events linking human identity, capability, scope, action, outcome | Required for attributable privileged actions |
| Authority-source version/reference in decision audit | Supports revocation/review |

Explicitly **not** claimed or authorized by this decision:

- any new migration;
- any new column;
- any RLS change;
- any verification SQL change;
- any assertion that current schema already stores these identities.

If persistence is later required, it needs a separately authorized design and gate. This record must not invent schema.

---

## 15. Test Obligations

Future tests (planned ≠ executed; not authorized now) must prove:

1. Discrete capability deny matrix (queue_read-only cannot validate/execute; validate-only cannot execute; reject-only cannot execute; review/audit cannot mutate).
2. `account_wide` same-human validate→execute denied before mutation.
3. `account_wide` different-human validate→execute allowed only when both capabilities and stable identities exist.
4. `scan_specific` same-human allowed when both capabilities held and identity stable.
5. `evidence_specific` same-human allowed when both capabilities held and identity stable.
6. Missing validator identity blocks `account_wide` execution.
7. Unstable/untrusted/incomparable identities fail closed.
8. Client-forged operator identity ignored.
9. `service_role` without human authorization denied at human-privileged entrypoints.
10. C-01 sequencing preserved: missing `validated_at` still fails closed independently of SoD.
11. No claim of current test execution or runtime PASS.

Verification SQL identifiers such as `B-04-*` in database verification artifacts refer to unrelated terminal-transition checks and are **not** evidence of this human-SoD decision.

---

## 16. Break-Glass Disposition

| Topic | Disposition |
|-------|-------------|
| Break-glass bypass of selected human-separation rule | **Not authorized** by this decision |
| Emergency same-human `account_wide` validate+execute | **Not authorized** |
| Capability auto-elevation under incident pressure | **Not authorized** |
| Future exception | Requires a **separate explicit decision and authorization** |
| Default if exception absent | Selected matrix remains binding |

---

## 17. Unsupported Guarantees Explicitly Excluded

This record does **not** claim or authorize:

- existing different-human enforcement;
- existing validator or executor natural-person identity persistence;
- realistic runtime `service_role` least privilege;
- global idempotency;
- concurrency guarantees beyond committed evidence;
- safe blind retries;
- residual erasure;
- post-terminal attribution guarantees;
- email delivery;
- application implementation;
- SQL execution authorization;
- DEV or PROD readiness;
- closure of B-03 (authority source);
- closure of overall readiness;
- silent reconciliation of existing design documents.

---

## 18. B-04 Closure Boundary

This decision record:

- **selects** the B-04 human-separation and capability-packaging policy candidate;
- does **not** claim that B-04 is fully reconciled across existing documents;
- does **not** prove implementation or runtime enforcement;
- leaves existing B-04 open-decision references unchanged until separately authorized reconciliation;
- leaves implementation and execution readiness **blocked**.

**Do not mark B-04 closed merely because this decision record exists.**

Minimum future closure chain (separately authorized steps):

1. acceptance and commit of this decision record;
2. targeted documentation reconciliation of open B-04 statements;
3. later implementation of identity, capability, and comparison enforcement;
4. tests proving allowed/denied paths;
5. readiness/register updates under separate authorization.

---

## 19. Future Reconciliation Inventory

Recorded for later separately authorized reconciliation. **Not performed by this task.**

### 19.1 Operator Authorization Design

Path: `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_OPERATOR_AUTHORIZATION_DESIGN.md`

| Section | Future reconciliation focus |
|---------|-----------------------------|
| §9 | Validation versus execution separation — replace “SoD remains open” with selected request-scope matrix |
| §12 | Initial release posture — close open validate/execute same-person note against selected policy |
| §26 | Segregation of duties — record selected Option C matrix; reject always-same / always-different / discretionary / break-glass as non-selected |
| §27 | Scope-based authorization — bind `account_wide` mandatory different-human rule |
| §42 items 4–5 | Open decisions “Validator/executor segregation” and “Two-person approval” — update only after acceptance; two-person approval is satisfied for `account_wide` by mandatory different-human rule; not globally required for all scopes |
| §43 where applicable | Implementation preconditions — SoD decision recorded; still requires acceptance/reconciliation/enforcement evidence before implementation |

### 19.2 Security and Abuse Design

Path: `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_SECURITY_AND_ABUSE_DESIGN.md`

| Section | Future reconciliation focus |
|---------|-----------------------------|
| §30 | Operator abuse / self-approval — replace “SoD remains an open decision” with selected policy summary |
| §41 item 3 | Open security decision “Segregation of duties” — mark selected only after acceptance and targeted reconciliation |

### 19.3 Decision Closure Plan

Path: `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_DECISION_CLOSURE_PLAN.md`

| Section | Future reconciliation focus |
|---------|-----------------------------|
| B-04 register / status | Update only after acceptance and separate authorization; do not rewrite historical sequencing as runtime proof |

No other file is authorized for B-04 reconciliation by this record alone.

---

## 20. Historical and NOT REQUIRED Artifacts

Treat as historical or **NOT REQUIRED** for B-04 reconciliation unless a later audit proves otherwise:

| Artifact | Treatment |
|----------|-----------|
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_PRE_IMPLEMENTATION_READINESS_REVIEW.md` | Historical readiness evidence at its baseline; do not rewrite now |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_VALIDATION_GATE_DECISION_RECORD.md` | C-01/B-19 authority only; preserves B-04 as separate; not a B-04 reconciliation target |
| `docs/PHASE_2_SLICE_2_APPLICATION_DELETION_PATHWAY_C_01_TARGETED_RECONCILIATION_PLAN.md` | C-01 documentation reconciliation planning only |
| Verification SQL `B-04-*` checks | Unrelated terminal-transition tests; **not** human-SoD evidence |
| `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | Persistence contract; no B-04 human-identity enforcement to edit under this decision |
| Application code | Absent operator SoD path; not modified by this task |
| DEV or PROD artifacts | Out of scope; contact prohibited |

---

## 21. Residual Blockers and Dependencies

| Dependency | Status relative to this record |
|------------|--------------------------------|
| B-03 Operator authority source | Still open — required before runtime binding of capabilities/identities |
| C-01 / B-19 validate-before-execute | Selected/preserved; not reopened |
| Durable validator/executor identity persistence design | Not selected; may be required for enforcement |
| Application operator authorization implementation | Not authorized |
| B-01 / B-02 DEV identity and migration apply | Still blocked; required before runtime proof |
| B-09 concurrency mechanism | Still open; complementary to SoD, not replaced by it |
| B-15 audit sink / retention | Still open; needed for durable privileged attribution operations |
| B-16 ambiguous-result review packaging | Still coupled to review capability packaging; not fully closed by this record |
| Overall readiness | Remains **BLOCKED** |

---

## 22. Acceptance Criteria

This decision record is acceptable only if:

1. Option C is selected unambiguously.
2. The exact request-scope matrix is recorded (`account_wide` different-human mandatory; `scan_specific` / `evidence_specific` same-human permitted with discrete capabilities).
3. Capabilities remain discrete; no capability implies another.
4. Natural-person identity contract is explicit.
5. Fail-closed rules require rejection before workflow mutation when evidence is missing/invalid/equal/incomparable as specified.
6. `service_role` is excluded as human identity evidence.
7. Current enforcement gap is stated honestly (schema + application do not enforce today).
8. Required future enforcement evidence is listed.
9. Break-glass is not authorized.
10. C-01 / B-19 action sequencing remains unchanged.
11. Unsupported guarantees are explicitly excluded.
12. Future reconciliation inventory is recorded but not performed.
13. No existing file is modified by the authoring task.
14. No implementation, SQL, DEV, PROD, or Supabase authorization is granted.
15. B-04 is **not** marked fully closed merely by this record’s existence.

---

## 23. Non-Authorization Statement

**Authorized by this task:**

- creation and review of this B-04 decision-record candidate;
- selection of Option C within this document.

**Not authorized:**

- modification of any existing file;
- targeted reconciliation listed in Section 19;
- application / API / UI / auth / operator implementation;
- SQL, migration, or verification SQL changes;
- Block A / Block B;
- Supabase contact;
- DEV or PROD changes;
- staging, commit, or push;
- claims of current runtime enforcement;
- claims that overall readiness is PASS;
- claims that B-04 is fully closed across the design chain.

---

## 24. Final Decision Statement

- **B-04 selected policy:** request-scope-deterministic human separation.
- **`account_wide`:** different human must validate and execute; same-human path fails closed before mutation.
- **`scan_specific` / `evidence_specific`:** same human permitted only with independently held validate and execute capabilities and stable natural-person identity.
- **Capabilities:** `queue_read`, `validate`, `reject`, `execute`, `review`/`audit` remain discrete.
- **`service_role`:** process privilege only; never human SoD evidence.
- **C-01 / B-19:** preserved unchanged.
- **Enforcement:** policy selected and documentation recorded only; current schema and application do not enforce.
- **Next safe action:** return this candidate to Project Manager for acceptance review; do not reconcile existing artifacts in this task.
