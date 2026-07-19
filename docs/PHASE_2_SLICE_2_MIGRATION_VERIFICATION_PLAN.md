# Phase 2 Slice 2 Migration Verification Plan

## Status

| Item | Value |
|------|-------|
| Status | Draft — pending review |
| Phase | 2 |
| Slice | 2 |
| Artifact type | Migration Verification Plan |
| Migration candidate | committed |
| DEV execution | not authorized |
| PROD execution | not authorized |
| Verification SQL creation | not yet authorized by this document |
| Supabase has not been modified | confirmed |

This document is a verification planning artifact only. It authorizes no database change, no verification SQL execution, and no Supabase DEV or PROD modification.

---

## Purpose

This document defines the verification contract for the committed Phase 2 Slice 2 deletion-request-governance migration candidate:

`supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql`

It specifies what must be proven before, during, and after a future authorized DEV apply: repository identity, static SQL fidelity, apply observation, catalog correctness, privilege and RLS least-privilege posture, request-transition behaviour, and deferred cross-table consistency behaviour.

This document does **not** authorize migration execution. Migration execution and migration verification remain separate gates. A later reviewed verification-SQL artifact and a separate execution authorization are required before any DEV apply or behavioural testing may occur.

---

## Authoritative Inputs

The following artifacts were inspected for this plan. Object names, constraints, functions, triggers, policies, grants, columns, states, scopes, resolution codes, and behaviours below are taken from the committed migration and these sources. No remote Supabase migration identity is claimed because the migration has not been applied.

| Order | Artifact |
|-------|----------|
| 1 | `docs/PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md` |
| 2 | `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md` |
| 3 | `docs/PHASE_2_SLICE_2_MIGRATION_DESIGN.md` |
| 4 | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md` |
| 5 | `docs/PHASE_2_SLICE_2_SQL_MIGRATION_GATE_DISPOSITION.md` |
| 6 | `docs/PHASE_2_SLICE_2_SQL_DRAFT_V1.md` |
| 7 | `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |

**Committed migration identity (repository):**

`8b22fea6379038254a2fdbb1148e8e05140dd906`

That revision is the local and `origin/main` HEAD baseline for this verification plan. A remote Supabase migration history identity does not exist until after an authorized apply.

---

## Verification Principles

1. **Read-only verification wherever possible.** Catalog inspection, privilege inspection, and RLS inspection must prefer non-mutating queries.
2. **No hidden repair or mutation.** Verification must report findings; it must not silently alter schema, grants, policies, or data to force a pass.
3. **No test-data insertion before authorization.** Behavioural cases that require rows may run only after a separate authorization for test transactions.
4. **Exact catalog verification rather than name-only checks.** Existence of a similarly named object is insufficient; definitions, expressions, deferral, security mode, and privilege columns must match the migration.
5. **Explicit privilege and RLS verification.** Ownership policies do not replace privilege checks; both must pass independently.
6. **Transaction-safe behavioural testing only after separate authorization.** Expected failures must roll back fully; no durable pollution of DEV governance tables without explicit approval.
7. **Failed verification must not be converted into an automatic fix.** A fail produces a finding and a gate decision, not an opportunistic repair migration.
8. **DEV evidence must be captured before any PROD consideration.** PROD is out of scope until DEV verification evidence is complete and separately approved.
9. **Migration execution and migration verification are separate gates.** Passing this plan’s review authorizes neither apply nor verification SQL.

---

## Verification Stages

### Stage 1 — Pre-Apply Repository Verification

| Dimension | Definition |
|-----------|------------|
| Purpose | Prove the repository baseline matches the committed migration candidate before any apply attempt. |
| Permitted actions | Read-only git and filesystem inspection; byte comparison of draft fenced SQL against the migration file. |
| Prohibited actions | Staging, committing, pushing, applying the migration, modifying Supabase, inserting test data, authoring executable verification SQL under this stage. |
| Expected evidence | Clean tracked tree (or explicitly documented unrelated dirty paths outside scope); HEAD = `origin/main` = `8b22fea6379038254a2fdbb1148e8e05140dd906` (or a later reviewed revision that still contains the same migration bytes); migration path and content confirmed; draft/migration parity confirmed. |
| Pass | All Pre-Apply Repository Verification checks pass. |
| Fail | Any identity mismatch, second overlapping Slice 2 migration, draft/migration divergence, or evidence of prior unauthorized apply. |

### Stage 2 — Pre-Apply Migration Static Verification

| Dimension | Definition |
|-----------|------------|
| Purpose | Prove the committed SQL text implements the approved design without executing it. |
| Permitted actions | Static reading of the migration file against the Migration Object Inventory and Static SQL Verification checklist. |
| Prohibited actions | SQL execution; Supabase CLI apply; editing the migration to “fix” static findings without a new reviewed artifact. |
| Expected evidence | Completed static checklist with pass/fail per item; inventory crosswalk to migration line content. |
| Pass | All static checks pass; no SECURITY DEFINER; no backfill; no out-of-scope object mutation. |
| Fail | Any P0/P1 static defect (scope breach, missing guard, wrong vocabulary, privilege design error). |

### Stage 3 — DEV Apply Observation

| Dimension | Definition |
|-----------|------------|
| Purpose | Observe a separately authorized DEV apply of the exact committed migration and capture apply identity and outcome. |
| Permitted actions | Only those actions authorized by a future execution gate (apply command, history query, capture of success/failure). |
| Prohibited actions | Apply without execution-gate approval; PROD apply; partial manual DDL outside the migration; continuing past a failed apply without recording partial-state risk. |
| Expected evidence | Apply command used; result; local revision; remote migration history row identity (once available); confirmation that preflight ran inside the transaction and either all objects committed or none did. |
| Pass | Apply completed with no partial object set; history identity recorded; new tables empty. |
| Fail | Apply error, partial objects, unexpected history identity, or post-apply non-empty governance tables without authorized test inserts. |

### Stage 4 — Post-Apply Catalog Verification

| Dimension | Definition |
|-----------|------------|
| Purpose | Prove the live DEV catalog matches the Migration Object Inventory exactly. |
| Permitted actions | Read-only catalog queries (tables, columns, constraints, indexes, functions, triggers, RLS, policies, privileges, comments). |
| Prohibited actions | DDL repair; grant repair; policy rewrite; DML; treating name presence as definition match. |
| Expected evidence | Completed Post-Apply Catalog Verification Matrix with catalog sources and outcomes. |
| Pass | Every matrix row passes; no unauthorized privileges; both tables empty unless authorized behavioural stage has begun. |
| Fail | Any definition mismatch, missing object, unexpected privilege, or RLS/policy deviation. |

### Stage 5 — Authorized Behavioural Verification

| Dimension | Definition |
|-----------|------------|
| Purpose | Prove transition-guard and deferred-consistency behaviour under separately authorized test transactions. |
| Permitted actions | Only reviewed verification SQL / test transactions authorized by a later gate; rollback of expected failures. |
| Prohibited actions | Running behavioural cases from this plan alone; leaving failed-case rows committed; invoking Slice 8 lifecycle primitives as part of migration verification unless a later gate explicitly requires and scopes that. |
| Expected evidence | Case-by-case pass/fail for Request Transition Guard Verification and Deferred Cross-Table Consistency Verification; rollback confirmation for expected failures. |
| Pass | All required behavioural cases pass; expected failures abort and roll back. |
| Fail | Any permitted transition rejected incorrectly, any forbidden transition accepted, or any deferred invariant that allows inconsistent commit. |

### Stage 6 — Evidence Review and Gate Decision

| Dimension | Definition |
|-----------|------------|
| Purpose | Aggregate evidence, classify findings, record accepted residual posture, and decide whether DEV verification may exit. |
| Permitted actions | Evidence package assembly; severity classification; reviewer verdict; documentation of unresolved findings. |
| Prohibited actions | Silent redesign of accepted residual F-P2-3; automatic PROD promotion; converting fails into unreviewed fixes. |
| Expected evidence | Complete Evidence Package; reviewer verdict; open findings list; residual acknowledgement. |
| Pass | DEV Gate Exit Criteria all met; no open P0 or P1. |
| Fail | Incomplete evidence, open P0/P1, or residual silently altered. |

---

## Pre-Apply Repository Verification

Before any DEV apply authorization is considered, verify all of the following:

| Check | Pass condition |
|-------|----------------|
| Clean tracked working tree | `git status` shows no unexpected tracked modifications to the migration candidate or its binding design docs; any unrelated dirty paths are explicitly listed and confirmed out of scope |
| Exact HEAD and `origin/main` equality | Local HEAD equals `origin/main` and both equal `8b22fea6379038254a2fdbb1148e8e05140dd906`, or a later reviewed revision that still contains identical migration file bytes |
| Expected migration path | File exists at `supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql` |
| Migration committed at expected revision | `git log` / `git ls-tree` confirms the file is present at the baseline revision |
| No second overlapping Slice 2 migration | No other `supabase/migrations/*` file creates or alters `deletion_requests`, `deletion_request_executions`, `enforce_deletion_request_transition`, or `enforce_deletion_request_execution_consistency` |
| SQL Draft fenced block and migration file parity | The fenced SQL in `docs/PHASE_2_SLICE_2_SQL_DRAFT_V1.md` matches the migration file byte-for-byte (ignoring only surrounding markdown wrapper) |
| No accidental `.cursor/` inclusion | Verification and future commits do not treat `.cursor/` artifacts as migration evidence or ship them as schema authority |
| No migration execution before the execution gate | No DEV/PROD apply, SQL Editor run, or `supabase db push` has occurred for this candidate; Supabase remains unmodified relative to this candidate |

---

## Migration Object Inventory

Inventory derived exclusively from the committed migration file.

### Transaction wrapper and preflight

| Item | Exact migration content |
|------|-------------------------|
| Transaction wrapper | Single `BEGIN` … `COMMIT` enclosing the entire migration |
| Preflight | Anonymous `DO $$ … $$` block **before** any `CREATE` |
| Preflight dependency tables | `public.scan_records`, `public.user_description_evidence`, `public.image_evidence`, `public.product_mention_evidence`, `public.ai_analysis_evidence` |
| Preflight dependency functions | `public.exclude_scan_record(uuid, text)`, `public.exclude_evidence_row(text, uuid, text)` |
| Preflight collision tables | `public.deletion_requests`, `public.deletion_request_executions` must be absent |
| Preflight collision functions | `public.enforce_deletion_request_transition()`, `public.enforce_deletion_request_execution_consistency()` must be absent |
| Preflight collision triggers | `trg_deletion_requests_transition_guard`, `trg_deletion_requests_execution_consistency`, `trg_deletion_request_executions_execution_consistency` must be absent on those table names |

### Table: `public.deletion_requests`

| Column | Type | Nullability | Default / database-controlled posture |
|--------|------|-------------|----------------------------------------|
| `id` | `uuid` | NOT NULL (PK) | `DEFAULT gen_random_uuid()` |
| `user_email` | `text` | NOT NULL | none |
| `request_scope` | `text` | NOT NULL | none |
| `target_scan_record_id` | `uuid` | NULL | none |
| `target_evidence_table` | `text` | NULL | none |
| `target_evidence_id` | `uuid` | NULL | none |
| `request_state` | `text` | NOT NULL | `DEFAULT 'received'` |
| `resolution_code` | `text` | NULL | none |
| `requested_at` | `timestamptz` | NOT NULL | `DEFAULT now()` |
| `validated_at` | `timestamptz` | NULL | none |
| `resolved_at` | `timestamptz` | NULL | none |
| `created_at` | `timestamptz` | NOT NULL | `DEFAULT now()` |

Named CHECK constraints:

| Constraint name | Role |
|-----------------|------|
| `deletion_requests_user_email_nonempty_check` | `char_length(btrim(user_email)) > 0` |
| `deletion_requests_request_scope_check` | `account_wide` \| `scan_specific` \| `evidence_specific` |
| `deletion_requests_request_state_check` | `received` \| `executed` \| `rejected` |
| `deletion_requests_resolution_code_check` | null or closed code set |
| `deletion_requests_state_resolution_coupling_check` | state ↔ resolution coupling |
| `deletion_requests_scope_target_matrix_check` | scope ↔ target matrix |
| `deletion_requests_evidence_table_whitelist_check` | evidence table whitelist when present |
| `deletion_requests_timestamp_ordering_check` | `requested_at` ≤ `validated_at` ≤ `resolved_at` when present |
| `deletion_requests_received_resolved_at_null_check` | `received` ⇒ `resolved_at` null |
| `deletion_requests_terminal_requires_resolved_at_check` | non-`received` ⇒ `resolved_at` non-null |
| `deletion_requests_executed_requires_validated_at_check` | `executed` ⇒ `validated_at` non-null |
| `deletion_requests_created_requested_integrity_check` | `requested_at` ≤ `created_at` |

Foreign keys on this table: **none** (targets are opaque uuids).

### Table: `public.deletion_request_executions`

| Column | Type | Nullability | Default / database-controlled posture |
|--------|------|-------------|----------------------------------------|
| `id` | `uuid` | NOT NULL (PK) | `DEFAULT gen_random_uuid()` |
| `deletion_request_id` | `uuid` | NOT NULL | none |
| `scan_record_id` | `uuid` | NOT NULL | none |
| `executed_at` | `timestamptz` | NOT NULL | `DEFAULT now()` |
| `created_at` | `timestamptz` | NOT NULL | `DEFAULT now()` |

| Constraint name | Role |
|-----------------|------|
| `deletion_request_executions_deletion_request_id_fkey` | FK to `public.deletion_requests(id)` `ON DELETE RESTRICT` |
| `deletion_request_executions_request_scan_unique` | `UNIQUE (deletion_request_id, scan_record_id)` |

No FK on `scan_record_id`.

### Indexes

| Index name | Table | Definition |
|------------|-------|------------|
| `deletion_requests_user_email_requested_at_idx` | `deletion_requests` | `(user_email, requested_at DESC)` |
| `deletion_requests_request_state_requested_at_idx` | `deletion_requests` | `(request_state, requested_at ASC)` |
| `deletion_requests_target_scan_record_id_idx` | `deletion_requests` | `(target_scan_record_id)` WHERE `target_scan_record_id IS NOT NULL` |
| `deletion_requests_target_evidence_idx` | `deletion_requests` | `(target_evidence_table, target_evidence_id)` WHERE both non-null |
| `deletion_request_executions_scan_record_id_idx` | `deletion_request_executions` | `(scan_record_id)` |

Note: a standalone non-unique index on `deletion_request_executions(deletion_request_id)` is intentionally omitted; the unique constraint supplies that leading column.

### Trigger functions

| Function | Returns | Language | Security | `search_path` |
|----------|---------|----------|----------|---------------|
| `public.enforce_deletion_request_transition()` | `trigger` | `plpgsql` | `SECURITY INVOKER` | `pg_catalog, public` |
| `public.enforce_deletion_request_execution_consistency()` | `trigger` | `plpgsql` | `SECURITY INVOKER` | `pg_catalog, public` |

Neither function is `SECURITY DEFINER`.

### Triggers

| Trigger name | Table | Timing / events | Type | Function |
|--------------|-------|-----------------|------|----------|
| `trg_deletion_requests_transition_guard` | `deletion_requests` | `BEFORE INSERT OR UPDATE` | Row trigger | `enforce_deletion_request_transition()` |
| `trg_deletion_requests_execution_consistency` | `deletion_requests` | `AFTER INSERT OR UPDATE OR DELETE` | `CONSTRAINT` trigger, `DEFERRABLE INITIALLY DEFERRED` | `enforce_deletion_request_execution_consistency()` |
| `trg_deletion_request_executions_execution_consistency` | `deletion_request_executions` | `AFTER INSERT OR DELETE` | `CONSTRAINT` trigger, `DEFERRABLE INITIALLY DEFERRED` | `enforce_deletion_request_execution_consistency()` |

### RLS

| Table | RLS |
|-------|-----|
| `public.deletion_requests` | `ENABLE ROW LEVEL SECURITY` |
| `public.deletion_request_executions` | `ENABLE ROW LEVEL SECURITY` |

### RLS policies

| Policy name | Table | Command | Roles | USING | WITH CHECK |
|-------------|-------|---------|-------|-------|------------|
| `Users can read own deletion requests` | `deletion_requests` | `SELECT` | `authenticated` | `lower(user_email) = lower(auth.jwt() ->> 'email')` | none |

No INSERT / UPDATE / DELETE policies on `deletion_requests`. No policies on `deletion_request_executions`.

### Table-level revokes (before grants)

Both tables: `REVOKE ALL … FROM PUBLIC`, `anon`, `authenticated`, `service_role`.

### Table-level and column-level grants

**`deletion_requests`:**

| Grantee | Privilege |
|---------|-----------|
| `authenticated` | table `SELECT` only |
| `service_role` | table `SELECT` |
| `service_role` | column `INSERT` on `user_email`, `request_scope`, `target_scan_record_id`, `target_evidence_table`, `target_evidence_id` only |
| `service_role` | column `UPDATE` on `request_state`, `resolution_code`, `validated_at`, `resolved_at` only |

No table-level INSERT/UPDATE/DELETE for `service_role`. No DELETE for any role. No INSERT privilege on `id`, `request_state`, `resolution_code`, `requested_at`, `validated_at`, `resolved_at`, `created_at`.

**`deletion_request_executions`:**

| Grantee | Privilege |
|---------|-----------|
| `service_role` | table `SELECT` |
| `service_role` | column `INSERT` on `deletion_request_id`, `scan_record_id` only |

No authenticated/anon grants. No UPDATE or DELETE. No INSERT on `id`, `executed_at`, `created_at`.

### Function privileges

Both guard functions:

- `REVOKE ALL … FROM PUBLIC`, `anon`, `authenticated`
- `GRANT EXECUTE … TO service_role`

### Comments

Comments exist on:

- both tables
- columns: `deletion_requests.request_state`, `resolution_code`, `target_scan_record_id`, `target_evidence_table`, `target_evidence_id`, `validated_at`
- columns: `deletion_request_executions.deletion_request_id`, `scan_record_id`
- both guard functions

### Dormant-on-arrival / data posture

The migration contains no DML. After a clean apply, both new tables must contain zero rows and no lifecycle primitive may have been invoked by the migration.

---

## Static SQL Verification

Perform these checks against the committed migration text before any apply:

| Check | Pass condition |
|-------|----------------|
| Preflight before object creation | Preflight `DO` block appears before any `CREATE TABLE` / `CREATE FUNCTION` / `CREATE TRIGGER` |
| One transaction wrapper | Exactly one outer `BEGIN`/`COMMIT` pair wrapping the migration body |
| No data backfill | No `INSERT`/`UPDATE`/`DELETE`/`TRUNCATE` against business or governance rows |
| No application workflow DML | No workflow helper tables or seed rows |
| No `SECURITY DEFINER` | Both functions are `SECURITY INVOKER` |
| No lifecycle primitive invocation | No call to `exclude_scan_record` or `exclude_evidence_row` outside preflight existence checks |
| No changes to pre-existing business objects | No `ALTER`/`DROP`/`CREATE OR REPLACE` on objects other than the new Slice 2 governance objects |
| Request-state vocabulary | Closed set `received`, `executed`, `rejected` with default `received` |
| Request-scope vocabulary | Closed set `account_wide`, `scan_specific`, `evidence_specific` |
| Resolution-code vocabulary | Closed set `completed`, `invalid_request`, `duplicate_request`, `unauthorized_request`, `already_completed`, `execution_failed` (nullable) |
| Scope/target consistency | `deletion_requests_scope_target_matrix_check` matches the three-scope matrix |
| State/resolution consistency | Coupling CHECK matches received/null, executed/completed, rejected/rejection-codes |
| Timestamp ordering | Ordering CHECK plus created/requested integrity CHECK present |
| Executed requires `validated_at` | CHECK and transition-guard executed branch both require non-null `validated_at` |
| Terminal-state immutability | Transition guard rejects updates when `OLD.request_state` is `executed` or `rejected` |
| Controlled initial INSERT posture | INSERT branch requires `received` with `validated_at`, `resolved_at`, `resolution_code` all null (F-1) |
| Deferred cross-table consistency | Both deferred constraint triggers present with correct events; executions trigger omits UPDATE |
| Dormant-on-arrival posture | No DML; comments and grants describe unconsumed governance structures |

---

## Post-Apply Catalog Verification Matrix

Use after an authorized DEV apply. Prefer `pg_catalog` / `information_schema` evidence over name-only probes.

| Verification area | Expected object or behavior | Catalog or evidence source | Pass condition | Failure severity |
|-------------------|-----------------------------|----------------------------|----------------|------------------|
| Schema/table existence | `public.deletion_requests`, `public.deletion_request_executions` | `to_regclass` / `pg_class` | Both exist in `public` | P0 |
| Column inventory — requests | Exact 12 columns, types, nullability, defaults, ordinal order as inventory | `information_schema.columns` / `pg_attribute` | Exact match | P1 |
| Column inventory — executions | Exact 5 columns, types, nullability, defaults, ordinal order as inventory | same | Exact match | P1 |
| Generated / defaults | `id`/`requested_at`/`created_at`/`request_state` defaults on requests; `id`/`executed_at`/`created_at` on executions | column default expressions | Defaults match migration | P1 |
| Named CHECKs | All twelve named CHECKs on `deletion_requests` | `pg_constraint` | Names and expressions match | P1 |
| FK | `deletion_request_executions_deletion_request_id_fkey` → `deletion_requests(id)` `ON DELETE RESTRICT` | `pg_constraint` / `pg_attribute` | Exact match; no lifecycle FKs | P0 if destructive action; else P1 |
| Unique | `deletion_request_executions_request_scan_unique` on `(deletion_request_id, scan_record_id)` | `pg_constraint` | Exact match | P1 |
| Indexes | Five named indexes with columns/predicates as inventory | `pg_indexes` / `pg_index` | Exact match; no unexpected extras required by design | P1 |
| Functions | Both enforce_* functions exist | `pg_proc` | Both present | P0 |
| Function security mode | `prosecdef = false` (INVOKER) | `pg_proc` | Neither is SECURITY DEFINER | P0 |
| Function search_path | `pg_catalog, public` | `pg_proc.proconfig` | Match | P1 |
| Function ownership / EXECUTE | EXECUTE for `service_role` only among client-facing roles; revoked from PUBLIC/anon/authenticated | `information_schema.routine_privileges` / ACLs | Match grant matrix | P0 |
| Transition trigger | `trg_deletion_requests_transition_guard` BEFORE INSERT OR UPDATE row | `pg_trigger` | Attached and enabled | P0 |
| Deferred triggers | Both constraint triggers DEFERRABLE INITIALLY DEFERRED; events as inventory | `pg_trigger` | Match; executions trigger has no UPDATE | P0/P1 |
| RLS status | Both tables `relrowsecurity = true` | `pg_class` | Enabled | P0 |
| Policy | Single SELECT policy on requests `TO authenticated` with exact USING expression; no WITH CHECK; no other policies | `pg_policies` | Exact match | P0 |
| Table privileges | After reset+grant: authenticated SELECT on requests only; service_role SELECT on both; no DELETE | table ACLs | Exact match | P0 |
| Column privileges | service_role INSERT/UPDATE columns exactly as inventory | column ACLs | Exact match; no privilege on denied columns | P0 |
| Absence of unauthorized privileges | No usable privileges for PUBLIC/anon on either table; authenticated has none on executions | ACL scan | No extras | P0 |
| Comments | Table/column/function comments present where migration sets them | `pg_description` | Present and governance-intent text retained | P2 if text drift only; P1 if missing on security-critical objects |
| Empty tables | Zero rows in both new tables immediately after apply | `COUNT(*)` read-only | Zero (before authorized behavioural inserts) | P1 |
| Pre-existing objects unchanged | Existing tables/views/functions/policies/grants outside new objects unchanged vs pre-apply baseline | baseline diff | No diff | P0 |

---

## Privilege and RLS Verification

Privilege verification and RLS verification are independent. Passing one does not satisfy the other.

### Reset-before-grant sequence

Confirm the migration’s privilege model is reflected live:

1. Broader/default privileges on both tables were reset from `PUBLIC`, `anon`, `authenticated`, and `service_role` before narrow grants.
2. No unauthorized function `EXECUTE` remains for `PUBLIC`, `anon`, or `authenticated` on either guard function.
3. Ownership RLS does not silently replace privilege verification.

### `authenticated`

| Expectation | Pass condition |
|-------------|----------------|
| SELECT-only on `deletion_requests` | Table privilege is SELECT only |
| Ownership policy | Policy `Users can read own deletion requests` is `FOR SELECT` `TO authenticated` with `USING (lower(user_email) = lower(auth.jwt() ->> 'email'))` |
| No INSERT / UPDATE / DELETE | No table privileges and no policies admitting writes |
| No access to `deletion_request_executions` | No table privileges and no policies |

### `service_role`

| Expectation | Pass condition |
|-------------|----------------|
| SELECT on `deletion_requests` | Present |
| Column-level INSERT on approved intake columns only | `user_email`, `request_scope`, `target_scan_record_id`, `target_evidence_table`, `target_evidence_id` |
| Column-level UPDATE on approved workflow columns only | `request_state`, `resolution_code`, `validated_at`, `resolved_at` |
| No unintended table-level INSERT or UPDATE | Absent |
| No DELETE | Absent on both tables |
| SELECT on `deletion_request_executions` | Present |
| Column-level INSERT on executions | `deletion_request_id`, `scan_record_id` only |
| No UPDATE/DELETE on executions | Absent |
| No privilege expansion via PUBLIC / anon / authenticated | Those roles hold no write path and no executions access |

### Denied columns (must remain unprivileged for explicit caller INSERT)

On `deletion_requests`: `id`, `request_state`, `resolution_code`, `requested_at`, `validated_at`, `resolved_at`, `created_at`.

On `deletion_request_executions`: `id`, `executed_at`, `created_at`.

---

## Request Transition Guard Verification

These cases are for a future authorized behavioural stage. This plan does **not** include executable SQL.

| Case | Expected outcome |
|------|------------------|
| Valid initial `received` insert | Succeeds when insert posture uses defaults / null validation-resolution fields consistent with F-1 and CHECK vocabulary |
| Invalid non-`received` initial state | Rejected by transition guard INSERT posture |
| Invalid initial `validated_at` | Rejected (must be null on INSERT) |
| Invalid initial `resolved_at` | Rejected (must be null on INSERT) |
| Invalid initial `resolution_code` | Rejected (must be null on INSERT) |
| Valid one-time validation update | `received`→`received` setting `validated_at` null→non-null succeeds; `resolution_code` and `resolved_at` remain null |
| Attempted `validated_at` deletion | Rejected after milestone is set |
| Attempted `validated_at` replacement | Rejected after milestone is set |
| Valid `received`→`executed` transition | Succeeds only with prior non-null `validated_at`, non-null `resolved_at`, and `resolution_code = completed` |
| `executed` without prior `validated_at` | Rejected |
| Valid `received`→`rejected` transition | Succeeds with non-null `resolved_at` and a closed rejection code; `validated_at` may be null or already set; must not newly set `validated_at` during terminalization |
| Invalid terminal-state mutation | Updates to `executed` or `rejected` rows rejected |
| Immutable identifier or target changes | Changes to `id`, `user_email`, `request_scope`, `target_*`, `requested_at`, or `created_at` rejected |
| Invalid state/resolution combinations | Rejected by CHECK and/or transition guard |
| Invalid timestamp ordering | Rejected by CHECK / guard coupling |

---

## Deferred Cross-Table Consistency Verification

These cases require separately authorized test transactions. They must not be run during this planning step. Inconsistent transactions must fail at commit and roll back fully.

| Case | Expected outcome at commit |
|------|----------------------------|
| `received` with zero execution rows | Succeeds |
| `received` with an execution row | Fails; full rollback |
| `rejected` with zero execution rows | Succeeds |
| `rejected` with an execution row | Fails; full rollback |
| `scan_specific` `executed` with exactly one matching scan execution | Succeeds |
| `scan_specific` `executed` with no execution | Fails; full rollback |
| `scan_specific` `executed` with multiple executions | Fails; full rollback |
| `scan_specific` `executed` with mismatched `scan_record_id` | Fails; full rollback |
| `account_wide` `executed` with at least one execution | Succeeds |
| `account_wide` `executed` with no executions | Fails; full rollback (F-2) |
| `evidence_specific` `executed` with zero session execution rows | Succeeds |
| `evidence_specific` `executed` with a session execution row | Fails; full rollback |
| Full rollback when a deferred invariant fails at transaction end | No partial durable governance state remains from that transaction |

Mid-transaction intermediate states (for example attribution inserted before the request reaches `executed`) are permitted inside an open transaction and must become fully consistent before commit.

---

## Failure Classification

| Severity | Meaning | Examples |
|----------|---------|----------|
| **P0** | Security, ownership, privilege, destructive-scope, or migration-identity failure | SECURITY DEFINER present; privilege expansion; wrong policy role; destructive FK action; wrong migration identity; apply left partial objects; existing-object mutation |
| **P1** | State-machine, deferred consistency, constraint, or RLS contract failure | Missing CHECK; wrong deferred trigger events; transition guard gap; catalog definition mismatch; empty-table dormancy breach after apply |
| **P2** | Comment, evidence-format, or non-executable documentation mismatch without behavioural impact | Comment text drift; evidence packaging format issues that do not alter runtime behaviour |

**Gate rule:** Any open **P0** or **P1** finding means the migration cannot proceed toward PROD.

---

## Accepted Residual

### F-P2-3 — Post-terminal account-wide attribution

The current database model may permit later `service_role` insertion of another execution attribution row for an already `executed` `account_wide` request when all remaining invariants hold (parent remains `executed`, scope remains `account_wide`, uniqueness of `(deletion_request_id, scan_record_id)` is satisfied).

This is an **accepted workflow-layer residual**:

- Future workflow implementation must create all account-wide execution attribution rows inside the original atomic execution transaction.
- Temporal freezing of post-terminal attribution is outside this Slice and would require a new design decision.
- Verification must detect and report this posture (for example by documenting that a post-terminal additional attribution insert is not blocked by the deferred guard when cardinality remains ≥ 1 and uniqueness holds).
- Verification must **not** silently redesign the residual into a new constraint, trigger, or migration during this gate.

---

## Evidence Package

Retain the following from a future DEV verification. Store no secrets, tokens, passwords, or full connection strings.

| Evidence item | Required content |
|---------------|------------------|
| Repository revision | Commit SHA used for apply (baseline `8b22fea6379038254a2fdbb1148e8e05140dd906` or later reviewed SHA with identical migration bytes) |
| Local and remote migration identity | Filename/version; Supabase migration history identity after apply |
| Apply command and result | Exact authorized command and success/failure output (redacted) |
| Migration history result | Confirmation the candidate is recorded as applied |
| Catalog-verification output | Completed matrix results |
| RLS and privilege output | Policy and ACL evidence |
| Authorized behavioural-test output | Transition and deferred-consistency case results |
| Rollback confirmation for expected failures | Proof failed cases did not leave durable inconsistent rows |
| Final git status | Post-verification repository cleanliness relative to the verification work |
| Reviewer verdict | Pass / fail with severity summary |
| Unresolved findings | Including explicit acknowledgement of F-P2-3 |

---

## DEV Gate Exit Criteria

All of the following must hold before DEV verification may be considered complete:

1. Exact migration identity confirmed (repository SHA and applied history identity).
2. Apply completed without partial state.
3. All expected objects exist.
4. All catalog definitions match the Migration Object Inventory.
5. RLS and privileges match the least-privilege design (including reset-before-grant posture and column-level grants).
6. Transition guard behavioural cases pass.
7. Deferred consistency behavioural cases pass.
8. No P0 or P1 findings remain open.
9. Accepted residual F-P2-3 remains explicitly documented (detected/reported, not redesigned).
10. DEV evidence package is complete.
11. Separate approval is issued before any PROD consideration.

---

## Non-Execution Boundary

This document does **not** authorize:

- SQL execution of any kind
- `supabase db push`
- Supabase SQL Editor execution
- DEV or PROD modification
- test-data insertion
- executable verification SQL contained in this document

This document itself contains **no** executable verification SQL statement blocks.

A later reviewed verification-SQL artifact and a separate execution gate are required before any apply or behavioural verification may proceed.

---

## Current Decision

**Next permissible step after review of this plan:** authoring a separate migration verification SQL draft.

That later SQL draft must:

- implement the checks and cases defined here against the committed migration inventory
- remain non-executed until separately reviewed and authorized
- not expand Slice 2 persistence scope
- not silently close residual F-P2-3 by redesign

No DEV apply, PROD apply, or Supabase modification is authorized by acceptance of this verification plan alone.

---

*End of Phase 2 Slice 2 Migration Verification Plan.*
