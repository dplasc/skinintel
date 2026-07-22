# Phase 2 Slice 2 — Controlled DEV Migration Apply Procedure

| Item | Value |
|------|-------|
| Status | Draft — procedure authored, execution not authorized |
| Environment | DEV only |
| PROD | strictly prohibited |
| Migration execution | not authorized by this document |
| Block A execution | requires separate post-apply authorization |
| Block B execution | requires separate behavioural-test authorization |

This document is a **procedure-authoring artifact only**. It defines a future controlled sequence. It does **not** authorize, schedule, or execute any Supabase contact, migration apply, verification SQL, or database change.

---

## 1. Purpose

This document defines the future controlled application and verification sequence for the committed Phase 2 Slice 2 deletion-request-governance migration:

`supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`

and the committed verification candidate:

`supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql`

The sequence covers:

1. repository and environment identity gates
2. pre-apply migration-history and catalog baselines
3. controlled DEV migration apply observation
4. a hard stop before verification
5. separately authorized Block A (read-only) boundaries
6. separately authorized Block B (writable behavioural) boundaries

**Authoring this procedure does not authorize execution.**

Three distinct states must never be conflated:

| State | Meaning |
|-------|---------|
| Procedure authoring | This document exists and may be reviewed |
| Later execution authorization | A separate explicit Project Manager / gate decision permits one named step |
| Actual execution | An authorized operator runs one authorized command under supervision |

No step in this document may be treated as permission to run commands.

---

## 2. Locked Repository Baseline

All future execution sessions must begin from this locked baseline unless a later reviewed revision is explicitly substituted by Project Manager approval.

| Dimension | Locked value |
|-----------|--------------|
| Branch | `main` |
| Approved HEAD | `2c4e94d1330303282942c726ca32b54e7222d1c9` |
| Approved `origin/main` | `2c4e94d1330303282942c726ca32b54e7222d1c9` |
| Required tracked/staged state | Clean — no modified tracked files; no staged files |
| Only permitted untracked entry | `.cursor/` |
| Exact migration path | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| Exact verification candidate path | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` |

### 2.1 Accepted commit chain (evidence only)

| Commit | Message |
|--------|---------|
| `8b22fea6379038254a2fdbb1148e8e05140dd906` | Add phase 2 slice 2 deletion request governance migration |
| `fe21888390397bfdbc10790568a12e49b9f50f7a` | Harden phase 2 slice 2 verification block A |
| `2c4e94d1330303282942c726ca32b54e7222d1c9` | Harden phase 2 slice 2 verification block B |

### 2.2 Committed file identities (read-only Git inspection)

Derived at documentation authoring time by read-only Git inspection. No files were created while calculating these identities.

| Artifact | Path | Git blob object ID at approved HEAD |
|----------|------|-------------------------------------|
| Migration | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` | `a6bb362afe06e5e1ad80080136ab8c92090d2e70` |
| Verification candidate | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` | `4151f37ee478278476664820eafbd5d1cd85827b` |

Additional identity facts:

- Migration blob `a6bb362afe06e5e1ad80080136ab8c92090d2e70` is identical at introducing commit `8b22fea6` and at approved HEAD `2c4e94d1`.
- Verification candidate blob `4151f37ee478278476664820eafbd5d1cd85827b` is the identity at approved HEAD `2c4e94d1` (Block B harden commit).
- Working-tree `git hash-object` results for both files must match the committed blob object IDs above before any apply session proceeds.

### 2.3 Working-file prohibition

**STOP** if any of the following is true:

- the working-tree file bytes do not match the committed blob identity above
- HEAD is not exactly `2c4e94d1330303282942c726ca32b54e7222d1c9` (unless a later reviewed revision is separately approved)
- `origin/main` does not equal local HEAD
- any tracked or staged change exists
- any untracked path other than `.cursor/` exists
- a second competing Slice 2 migration or verification candidate path is present

Do **not** apply a working file whose committed identity does not match the approved commit.

---

## 3. Environment Identity Gate

This gate is hard. No apply command may be considered until every row below is resolved and confirmed.

| Required proof | Value at procedure-authoring time |
|----------------|-----------------------------------|
| Exact Supabase DEV project reference | **UNRESOLVED — MUST BE SUPPLIED AND VERIFIED AT THE SEPARATE EXECUTION GATE** |
| Exact expected DEV host / project name | **UNRESOLVED — MUST BE SUPPLIED AND VERIFIED AT THE SEPARATE EXECUTION GATE** |
| Exact PROD project reference (denylist) | **UNRESOLVED — MUST BE SUPPLIED AND VERIFIED AT THE SEPARATE EXECUTION GATE** |
| Exact PROD host / project name (denylist) | **UNRESOLVED — MUST BE SUPPLIED AND VERIFIED AT THE SEPARATE EXECUTION GATE** |

Tracked repository evidence inspected for this procedure does **not** contain committed DEV or PROD project references. Values must **not** be invented. They must be supplied by Project Manager / environment owners at the separate execution gate and independently verified before any command that contacts Supabase.

### 3.1 Mandatory operator confirmations at execution gate

Before any Supabase-contacting command:

1. Record the exact approved DEV project reference and host/project name.
2. Record the exact PROD project reference and host/project name as **denylisted targets**.
3. Confirm in writing that DEV and PROD identities are different.
4. Confirm the currently linked/selected project independently proves as DEV (local config alone is insufficient).
5. Confirm that no command output includes the PROD reference or PROD host.

### 3.2 Immediate STOP conditions for environment identity

Stop immediately — do not apply — if:

- DEV identity remains unresolved
- the connected target cannot be independently proven
- any command output includes the PROD reference or PROD host
- DEV and PROD identities are identical or ambiguous
- the linked/selected project does not match the approved DEV reference

---

## 4. Role and Credential Gate

Do not invent credentials. Credential material is never written into this procedure, into commits, or into evidence packages in cleartext.

| Gate | Required posture |
|------|------------------|
| Migration apply role | Privileged database / migration operator role capable of applying reviewed DDL through the separately approved DEV apply method (schema-creating role used by the authorized Supabase migration apply path). Exact role name must be confirmed at the execution gate against the live DEV project. |
| Block A role | Read-only capable catalog inspection role sufficient to run Block A under `BEGIN READ ONLY` … `COMMIT`. Must not require write privileges. |
| Block B privileged role | Approved privileged DEV verification session: **table owner / postgres-equivalent**, capable of INSERT, UPDATE, and DELETE directly on `public.deletion_requests` and `public.deletion_request_executions`, including protected columns required by negative tests. Block B is **not** a realistic `service_role` runtime test. |
| Browser / client credentials | **Prohibited** for migration application. Do not use browser-authenticated end-user sessions, anon keys, or client JWTs to apply the migration. |
| Secret handling | Passwords, service-role keys, database URLs, access tokens, and connection strings must never appear in reports, commits, screenshots destined for the repo, or unredacted evidence. |
| Evidence redaction | Operator must redact secrets from all captured evidence before sharing with Project Manager or attaching to any repository-adjacent record. |

---

## 5. Local Repository Preflight

> **DO NOT RUN UNTIL SEPARATELY AUTHORIZED**
>
> The PowerShell commands below are copy/paste candidates for a future supervised session. Authoring them here does **not** authorize running them against any database or Supabase project. Local read-only Git inspection may be used later under separate authorization; none of these commands apply the migration.

Future preflight must verify current path, branch, HEAD, `origin/main`, tracked changes, staged changes, untracked files, exact migration presence, exact verification candidate presence, absence of competing Slice 2 artifacts, committed file hashes, and that `.cursor/` is the only permitted untracked path.

### 5.1 Copy/paste preflight block (future session only)

```powershell
# DO NOT RUN UNTIL SEPARATELY AUTHORIZED
# Local repository preflight — Phase 2 Slice 2 DEV apply
# Expected repository root: SkinIntel 03_app

pwd

git branch --show-current
git rev-parse HEAD
git rev-parse origin/main

git status --short
git diff --name-only
git diff --cached --name-only

Test-Path "supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql"
Test-Path "supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql"

git ls-files "supabase/migrations/*phase_2_slice_2*"
git ls-files "supabase/verification/*phase_2_slice_2*"

git rev-parse HEAD:supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql
git rev-parse HEAD:supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql
git hash-object "supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql"
git hash-object "supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql"
```

### 5.2 PASS criteria

All of the following must hold:

| Check | PASS value |
|-------|------------|
| Current path | Repository root for `03_app` |
| Branch | `main` |
| HEAD | `2c4e94d1330303282942c726ca32b54e7222d1c9` |
| `origin/main` | `2c4e94d1330303282942c726ca32b54e7222d1c9` |
| Tracked changes | None |
| Staged changes | None |
| Untracked files | Only `.cursor/` (if present) |
| Migration present | `True` at exact path |
| Verification candidate present | `True` at exact path |
| Competing Slice 2 migration | Exactly one migration path listed |
| Competing verification candidate | Exactly one verification path listed |
| Migration blob | `a6bb362afe06e5e1ad80080136ab8c92090d2e70` for both `git rev-parse HEAD:...` and `git hash-object` |
| Verification blob | `4151f37ee478278476664820eafbd5d1cd85827b` for both `git rev-parse HEAD:...` and `git hash-object` |

### 5.3 STOP results

**STOP** if any PASS criterion fails. Do not proceed to Supabase target preflight. Return evidence to Project Manager.

---

## 6. Supabase Target Preflight

> **DO NOT RUN UNTIL SEPARATELY AUTHORIZED**
>
> No Supabase CLI command is authorized by this document. Do not link, relink, or contact DEV or PROD while only this procedure exists.

Future controlled sequence for proving the linked/selected project is DEV:

1. Capture Supabase CLI version (`supabase --version` or equivalent approved command).
2. Capture current linked / selected project configuration from the approved inspection method for this repository’s tooling.
3. Independently compare the observed project reference and host/project name with the approved DEV values supplied at the execution gate.
4. Explicitly compare the observed values against the PROD denylist.
5. **STOP immediately** on any mismatch, ambiguity, or PROD detection.
6. Do **not** automatically relink.
7. Do **not** change project link during the apply session unless separately authorized in writing.
8. Do **not** treat local config alone as sufficient proof; require independent comparison with the approved DEV reference.

If DEV identity fields remain unresolved, this entire section remains blocked.

---

## 7. Migration-History Baseline

> **DO NOT RUN UNTIL SEPARATELY AUTHORIZED**
>
> Remote migration state is not invented by this document and was not inspected during procedure authoring.

Before apply, capture read-only evidence of remote migration history sufficient to prove:

| Required proof | Pass condition |
|----------------|----------------|
| Remote migration-history listing | Full listing captured and retained in the evidence package |
| Slice 2 migration not already applied | No remote history row for `20260719120000_phase_2_slice_2_deletion_request_governance` |
| Expected prior migrations exist | Remote history includes the previously applied Phase 1 / Slice 1A baseline migrations required by Slice 2 preflight dependencies |
| No remote/local divergence | Remote history does not contain unexpected migrations, repaired-history ambiguity, or missing expected baseline entries relative to the approved local migration set |

Local migration filenames present in the repository (for baseline awareness only; remote presence must still be proven at execution time):

- `20260701120000_phase_1_slice_1_evidence_foundation.sql`
- `20260707120000_phase_1_slice_2_user_description_evidence.sql`
- `20260708120000_phase_1_slice_3_image_evidence.sql`
- `20260709120000_phase_1_slice_4_product_mention_evidence.sql`
- `20260709130000_phase_1_slice_5_ai_analysis_evidence.sql`
- `20260710120000_phase_1_slice_6_evidence_lifecycle_governance.sql`
- `20260711120000_phase_1_slice_7_session_anchor_lifecycle_metadata.sql`
- `20260712120000_phase_1_slice_8_governed_exclusion_transition_primitive.sql`
- `20260713120000_phase_2_slice_1a_evidence_persistence_boundary.sql`
- `20260719120000_phase_2_slice_2_deletion_request_governance.sql` ← candidate; must be absent from remote history before apply

### 7.1 STOP conditions for migration history

**STOP** on:

- duplicate / already-applied Slice 2 migration
- missing required baseline migration
- unexpected remote migration
- repaired-history ambiguity
- inability to capture a complete remote listing

Do not invent the remote migration state in advance of the authorized session.

---

## 8. Pre-Apply Catalog Baseline

Before apply, capture read-only catalog evidence. SQL used for this baseline must be authored or approved separately if not already present in an accepted artifact. This procedure does **not** add new executable SQL.

Required pre-apply observations:

| Observation | Expected before apply |
|-------------|-----------------------|
| Slice 2 tables | Absent: `public.deletion_requests`, `public.deletion_request_executions` |
| Slice 2 functions | Absent: `public.enforce_deletion_request_transition()`, `public.enforce_deletion_request_execution_consistency()` |
| Slice 2 triggers | Absent: `trg_deletion_requests_transition_guard`, `trg_deletion_requests_execution_consistency`, `trg_deletion_request_executions_execution_consistency` |
| Slice 2 policy | Absent: `"Users can read own deletion requests"` on `public.deletion_requests` |
| Conflicting object names | None of the above names exist under conflicting ownership or alternate schemas that would collide with the migration |
| Relevant pre-existing objects | Record presence and ownership of dependency objects required by migration preflight (`scan_records`, evidence tables, Slice 8 exclusion primitives) |
| A-11-07 baseline evidence | Capture a retained pre-apply versus later post-apply catalog baseline sufficient for accepted A-11-07 interpretation: Block A alone cannot prove that non-Slice-2 objects were unchanged |

**STOP** if any Slice 2 object unexpectedly pre-exists, or if conflicting object names are detected.

---

## 9. Backup and Recovery Posture

| Fact | Binding statement |
|------|-------------------|
| Object posture | Migration creates new empty objects only |
| Existing-table mutation | No existing-table mutation or data backfill is expected |
| Transactional DDL | Migration is wrapped in a single `BEGIN` … `COMMIT`; transactional DDL should roll back on failure |
| Backup confirmation | Backup / recovery posture must still be confirmed before DEV apply |
| PITR / backup evidence | Capture current database backup / PITR availability if supported by the DEV project |
| Improvised rollback | No manual object deletion as an improvised rollback |
| Partial / ambiguous apply | Failed or ambiguous partial apply requires **stop and investigation**, not repeated blind execution |
| Forward correction | Structural correction, if ever required, is a new reviewed forward migration — not ad-hoc cleanup |

---

## 10. Timeouts and Session Controls

Required future controls for any authorized session that contacts the database:

| Control | Requirement |
|---------|-------------|
| `statement_timeout` | Accepted verification bound: `30s`. For Block B, set and verify locally inside the behavioural session (`SET LOCAL statement_timeout = '30s'`). Do **not** claim this value automatically applies to migration execution unless the future apply procedure explicitly sets and verifies it for that session. |
| `lock_timeout` | Accepted verification bound: `5s`. For Block B, set and verify locally inside the behavioural session (`SET LOCAL lock_timeout = '5s'`). Do **not** claim this value automatically applies to migration execution unless the future apply procedure explicitly sets and verifies it for that session. |
| Transaction expectations | Migration: single transactional unit. Block A: `BEGIN READ ONLY` … `COMMIT`. Block B: writable transaction ending in explicit `ROLLBACK`, followed by independent residue check. |
| Timeout | **STOP** |
| Lock conflict | **STOP** |
| Connection reset | **STOP** |
| Unexpected notice / error | **STOP** and capture full output |
| Retry | No retry without Project Manager review |
| Attendance | No background or unattended execution |

---

## 11. Migration Apply Sequence

> **NOT AUTHORIZED BY THIS DOCUMENT**
>
> The numbered sequence below is a future controlled checklist. Distinctions:
>
> - **Procedure authoring** — this file exists
> - **Later execution authorization** — separate written approval for a named step
> - **Actual execution** — only after that approval, one command at a time, under Project Manager supervision
>
> Do **not** “run the migration when ready.” Readiness is not authorization.

One-command-at-a-time future sequence:

1. **Final repository gate** — re-run Section 5; PASS required.
2. **Final environment gate** — re-run Sections 3 and 6 with resolved DEV/PROD identities; PASS required.
3. **Migration-history baseline** — complete Section 7; PASS required.
4. **Catalog baseline** — complete Section 8; PASS required.
5. **Operator authorization checkpoint** — Project Manager explicitly authorizes migration apply for DEV only; record operator, timestamp (Europe/Zagreb), and approval reference. Without this checkpoint, stop.
6. **Migration apply** — execute exactly one separately approved apply command against the proven DEV target for:
   `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`
   using the privileged migration apply role. Exact command text must be supplied and approved at the execution gate (not invented here if tooling differs).
7. **Immediate capture** — retain full command output and exit code without redacting non-secret diagnostics; redact secrets only.
8. **Stop before verification** — do not run Block A or Block B in the same uncontrolled paste or as an automatic next step.
9. **No second apply attempt without review** — if exit code is non-zero, output is ambiguous, or objects look partial, stop and investigate. Do not re-apply blindly.

---

## 12. Apply Observation and Evidence Capture

Record all of the following during/after an authorized apply:

| Evidence field | Required |
|----------------|----------|
| Timestamp in Europe/Zagreb | Yes |
| Operator identity | Yes |
| Repository HEAD | Yes — must match approved baseline |
| Migration hash / blob | Yes — `a6bb362afe06e5e1ad80080136ab8c92090d2e70` |
| DEV project identity | Yes — resolved execution-gate values |
| Command used | Yes — exact command text, secrets redacted |
| Complete redacted command output | Yes |
| Exit code | Yes |
| Start and finish time | Yes |
| Timeout / lock events | Yes — present or explicitly “none observed” |
| Migration-history result after apply | Yes |
| Catalog presence after apply | Yes — expected Slice 2 objects present; tables empty |
| Unexpected warnings / notices | Yes — present or explicitly “none observed” |
| Explicit confirmation PROD was not contacted | Yes |

---

## 13. Post-Apply Stop Gate

Successful migration application does **not** authorize verification automatically.

After apply:

1. **Stop.**
2. Return evidence to Project Manager.
3. Review migration output and exit code.
4. Verify remote migration history contains the Slice 2 migration exactly once.
5. Verify expected Slice 2 objects exist and tables are empty (dormant-on-arrival).
6. Confirm no unexpected objects or grants.
7. Authorize Block A separately — only after the above review passes.

Do not proceed into Block A or Block B without that separate authorization.

---

## 14. Block A Procedure Boundary

| Rule | Binding statement |
|------|-------------------|
| Nature | Block A is **read-only** |
| Timing | May run only after successful apply review |
| Authorization | Must run in a separate explicitly authorized step |
| Transaction form | Must begin with `BEGIN READ ONLY` and end with `COMMIT` |
| Evidence | Every binding result and the `A-12-01` summary must be captured |
| FAIL / NOT_RUN | Any `FAIL` or unexpected `NOT_RUN` stops the process |
| INFO rows | Must be recorded; do not independently fail the suite |
| Block B | No Block B execution is implied by Block A authorization or PASS |

### Locked Block A inventory

| Metric | Count |
|--------|------:|
| Unique IDs (including `A-12-01`) | 74 |
| Rows before summary | 73 |
| Binding non-INFO checks | 68 |
| INFO checks | 5 |
| Summary | one `A-12-01` summary |
| Duplicate IDs | none |

Source of inventory lock: accepted verification candidate / draft coverage counts for Phase 2 Slice 2.

Verification candidate path for a future separately authorized Block A run:

`supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql`

blob: `4151f37ee478278476664820eafbd5d1cd85827b`

---

## 15. Block B Procedure Boundary

| Rule | Binding statement |
|------|-------------------|
| Nature | Block B is **writable behavioural testing** |
| Authorization | Requires separate explicit authorization after Block A PASS |
| Bundling | Must never be bundled automatically with migration apply |
| Role | Privileged operator: table owner / postgres-equivalent |
| Data | Synthetic data only |
| `statement_timeout` | `30s` (set and verified in-session) |
| `lock_timeout` | `5s` (set and verified in-session) |
| Transaction end | Explicit `ROLLBACK` required |
| Residue | `B-09-04` independent residue check required after rollback |
| Residue outcome | Any residue is a hard stop |
| PROD | No PROD execution under any condition |

### Locked Block B inventory

| Metric | Count |
|--------|------:|
| Unique IDs | 60 |
| Substantive behavioural cases | 51 |
| Expected-success cases | 10 |
| Expected-rejection cases | 40 |
| INFO cases | 4 |
| Summary | one `B-10-01` summary |
| Residue row | one `B-09-04` residue row |
| Duplicate IDs | none |

---

## 16. F-P2-3 Residual Handling

| Item | Binding posture |
|------|-----------------|
| Residual | Accepted workflow-layer residual F-P2-3 — post-terminal account-wide attribution |
| Verification treatment | `B-07-03` remains `INFO` |
| Database temporal freeze | No database-level temporal freeze in this Slice |
| Workflow expectation | All intended account-wide attribution rows must be created inside the original atomic execution transaction |
| Adjacent invariants | Remain binding (parent remains `executed`, scope remains `account_wide`, uniqueness of `(deletion_request_id, scan_record_id)` satisfied) |
| Scope | Residual does **not** authorize additional workflow behavior or scope expansion |
| Redesign | Residual must not be silently closed by redesign during apply or verification |

---

## 17. Hard Stop Conditions

Stop immediately if any of the following occurs:

- HEAD / `origin/main` mismatch
- tracked or staged changes
- untracked path other than `.cursor/`
- unresolved DEV identity
- PROD reference / host detected
- remote migration divergence
- Slice 2 objects unexpectedly pre-existing
- migration already applied
- object collision
- timeout
- lock error
- connection reset
- non-zero exit
- unexpected SQL error
- ambiguous apply result
- Block A `FAIL` / unexpected `NOT_RUN`
- Block B summary failure
- post-rollback residue
- evidence capture failure
- accidental secret exposure

---

## 18. Prohibited Actions

The following are prohibited under this procedure and under any session that claims to follow it:

- PROD contact or execution
- running verification before apply review
- running Block B without separate authorization
- blind retry
- manual object cleanup
- editing the committed migration during execution
- changing project link silently
- force-pushing
- committing credentials or evidence containing secrets
- using Supabase SQL Editor without a separately approved method
- combining migration apply and behavioural testing into one uncontrolled paste
- inventing DEV/PROD project references
- treating procedure authoring as execution authorization

---

## 19. Evidence Package

Do **not** create these files during procedure authoring. Future evidence package contents (conceptual filenames):

| Conceptual artifact | Purpose |
|---------------------|---------|
| `p2s2_dev_repository_preflight.txt` | Repository preflight outputs |
| `p2s2_dev_environment_identity_proof.txt` | Environment identity proof and DEV≠PROD confirmation |
| `p2s2_dev_migration_history_baseline.txt` | Pre-apply remote migration-history listing |
| `p2s2_dev_catalog_baseline.txt` | Pre-apply catalog baseline including A-11-07 inputs |
| `p2s2_dev_migration_apply_output.txt` | Redacted apply command output and exit code |
| `p2s2_dev_post_apply_migration_history.txt` | Post-apply migration history |
| `p2s2_dev_post_apply_catalog_observation.txt` | Post-apply catalog observation |
| `p2s2_dev_block_a_output.txt` | Block A output if separately authorized |
| `p2s2_dev_block_b_output.txt` | Block B output if separately authorized |
| `p2s2_dev_block_b_residue_b-09-04.txt` | `B-09-04` residue evidence if separately authorized |
| `p2s2_dev_redaction_review.txt` | Redaction review confirmation |
| `p2s2_dev_operator_final_confirmation.txt` | Final operator confirmation including PROD exclusion |

Exact storage location for the evidence package is a Project Manager decision at execution time. Secrets must never be stored in the Git repository.

---

## 20. Procedure Completion Criteria

Procedure **execution** is complete only when all of the following are true:

- all authorized steps have passed
- evidence package is complete
- PROD exclusion is confirmed
- no secret is captured in retained evidence
- any authorized Block A / Block B gate has the expected summary (`A-12-01` / `B-10-01` as applicable)
- `B-09-04` shows no residue when Block B was authorized
- Project Manager reviews the evidence
- an Execution Report is authored separately

Authoring this procedure document alone does **not** complete procedure execution.

---

## 21. Current Authorization Boundary

Authorized now:

- creation and review of this procedure document

Not authorized now:

- Supabase command execution
- DEV contact
- PROD contact
- migration execution
- Block A execution
- Block B execution
- SQL Editor execution
- database changes

---

## 22. Operator Checklist

Use this checklist in a future separately authorized session. Every execution checkbox remains unchecked in this authored document.

### Before any Supabase contact

- [ ] Project Manager has issued separate execution authorization for the named step about to be performed
- [ ] Operator has read this entire procedure
- [ ] Repository is on `main` at `2c4e94d1330303282942c726ca32b54e7222d1c9`
- [ ] `origin/main` equals local HEAD
- [ ] No tracked or staged changes
- [ ] Only permitted untracked path is `.cursor/` (if any)
- [ ] Migration blob is `a6bb362afe06e5e1ad80080136ab8c92090d2e70`
- [ ] Verification blob is `4151f37ee478278476664820eafbd5d1cd85827b`
- [ ] DEV project reference supplied and verified
- [ ] DEV host / project name supplied and verified
- [ ] PROD project reference recorded as denylist
- [ ] Operator confirmed DEV ≠ PROD
- [ ] Privileged migration apply role confirmed (no browser/client credentials)
- [ ] Secret redaction method prepared

### Pre-apply baselines

- [ ] Supabase CLI version captured
- [ ] Linked/selected project independently proven as DEV
- [ ] PROD denylist comparison passed
- [ ] Remote migration-history baseline captured
- [ ] Slice 2 migration absent from remote history
- [ ] Required prior migrations present remotely
- [ ] No remote/local divergence / repaired-history ambiguity
- [ ] Pre-apply catalog baseline captured
- [ ] Slice 2 tables / functions / triggers / policy absent
- [ ] No conflicting object names
- [ ] A-11-07 baseline evidence retained
- [ ] Backup / PITR posture confirmed for DEV

### Migration apply (only after separate apply authorization)

- [ ] Final repository gate re-passed
- [ ] Final environment gate re-passed
- [ ] Operator authorization checkpoint recorded (Europe/Zagreb)
- [ ] Exactly one approved apply command executed against DEV
- [ ] Full redacted output and exit code captured
- [ ] Stopped before verification
- [ ] No second apply attempted without review
- [ ] Explicit confirmation that PROD was not contacted

### Post-apply review (before any verification)

- [ ] Evidence returned to Project Manager
- [ ] Migration output reviewed
- [ ] Remote migration history verified
- [ ] Expected Slice 2 objects exist; tables empty
- [ ] No unexpected objects or grants
- [ ] Separate Block A authorization obtained before any Block A run

### Block A (only after separate post-apply authorization)

- [ ] Block A run under `BEGIN READ ONLY` … `COMMIT`
- [ ] All binding results captured
- [ ] `A-12-01` summary captured
- [ ] Inventory confirmed: 74 unique IDs / 73 pre-summary rows / 68 binding non-INFO / 5 INFO / one summary / no duplicates
- [ ] Any FAIL or unexpected NOT_RUN caused an immediate stop
- [ ] INFO rows recorded without independent fail override
- [ ] Block B not started from Block A authorization alone

### Block B (only after separate behavioural-test authorization and Block A PASS)

- [ ] Privileged table-owner / postgres-equivalent role confirmed
- [ ] Synthetic data only
- [ ] `statement_timeout = 30s` set and verified
- [ ] `lock_timeout = 5s` set and verified
- [ ] Explicit `ROLLBACK` performed
- [ ] `B-09-04` residue check executed and clean
- [ ] `B-10-01` summary captured
- [ ] Inventory confirmed: 60 unique IDs / 51 substantive / 10 success / 40 rejection / 4 INFO / one summary / one residue / no duplicates
- [ ] F-P2-3 residual handled as INFO via `B-07-03` only
- [ ] PROD never contacted

### Closure

- [ ] Evidence package complete
- [ ] Redaction review complete
- [ ] Project Manager evidence review complete
- [ ] Separate Execution Report authorized/authored as its own step

---

## Document control

| Item | Value |
|------|-------|
| Artifact type | Controlled DEV migration apply procedure |
| Phase | 2 |
| Slice | 2 |
| Authoring baseline HEAD | `2c4e94d1330303282942c726ca32b54e7222d1c9` |
| Migration candidate | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| Verification candidate | `supabase/verification/phase_2_slice_2_deletion_request_governance_verification.sql` |
| Execution authorized by this document | No |
