# Phase 2 Slice 2 SQL Draft V1

## Status

- Status: Draft — not approved for execution
- Artifact type: Executable SQL Draft
- Migration file creation: not authorized
- SQL execution: not authorized

---

## Design Sources

Binding approved sources for this draft:

1. `docs/PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md`
2. `docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md`
3. `docs/PHASE_2_SLICE_2_MIGRATION_DESIGN.md`
4. `docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`
5. `docs/PHASE_2_SLICE_2_SQL_MIGRATION_GATE_DISPOSITION.md`

Repository convention sources inspected (read-only; not modified):

- `supabase/migrations/20260701120000_phase_1_slice_1_evidence_foundation.sql`
- `supabase/migrations/20260707120000_phase_1_slice_2_user_description_evidence.sql`
- `supabase/migrations/20260712120000_phase_1_slice_8_governed_exclusion_transition_primitive.sql`
- `supabase/migrations/20260713120000_phase_2_slice_1a_evidence_persistence_boundary.sql`

---

## Gate Dispositions Applied

This draft implements all four binding P2 dispositions from the SQL Migration Gate Disposition:

| Disposition | Implementation in this draft |
|-------------|------------------------------|
| **F-1** Insert-state enforcement | Transition-guard trigger function rejects any INSERT that is not `request_state = received` with `validated_at`, `resolved_at`, and `resolution_code` all null |
| **F-2** Account-wide zero-session handling | Deferred consistency guard requires `account_wide` + `executed` to have at least one execution row; a zero-session outcome cannot commit as `executed` and must instead resolve as `rejected` / `already_completed` at the application workflow layer |
| **F-3** SELECT policy scoped `TO authenticated` | Ownership-scoped SELECT policy on `deletion_requests` is created `TO authenticated` (not `TO public`); `anon` receives no policy and no usable privilege |
| **F-4** Preflight validation | Slice 1A-style preflight runs before any object creation and fails closed on missing dependencies, existing target tables, or colliding guard function / trigger names |

---

## SQL Draft

```sql
-- Phase 2 Slice 2 — Deletion Request Governance Record
-- Forward SQL Draft V1 — NOT APPROVED FOR EXECUTION
--
-- Source artifacts:
-- - docs/PHASE_2_SLICE_2_IMPLEMENTATION_PLAN.md
-- - docs/PHASE_2_SLICE_2_TECHNICAL_DESIGN.md
-- - docs/PHASE_2_SLICE_2_MIGRATION_DESIGN.md
-- - docs/PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md
-- - docs/PHASE_2_SLICE_2_SQL_MIGRATION_GATE_DISPOSITION.md
--
-- Scope:
-- - Preflight verification of Phase 1 / Slice 8 foundations and name collisions.
-- - public.deletion_requests governance record table.
-- - public.deletion_request_executions append-only attribution table.
-- - Non-SECURITY DEFINER request transition guard (INSERT + UPDATE).
-- - Non-SECURITY DEFINER deferred cross-table consistency guard.
-- - RLS / grants on the new tables only.
-- - Approved indexes and comments only.
--
-- Non-scope (binding):
-- - No modification of any existing table, view, function, policy, or grant.
-- - No invocation of Slice 8 lifecycle primitives.
-- - No data insert, update, delete, or backfill.
-- - No application workflow functions.
-- - No SECURITY DEFINER.
-- - No migration file authorization; this block is a review draft only.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Preflight verification (F-4) — fail before any object creation
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  v_missing text;
  v_collision text;
BEGIN
  -- Required dependency tables (Phase 1 evidence foundation).
  SELECT string_agg(t.expected, ', ')
    INTO v_missing
    FROM (VALUES
      ('public.scan_records'),
      ('public.user_description_evidence'),
      ('public.image_evidence'),
      ('public.product_mention_evidence'),
      ('public.ai_analysis_evidence')
    ) AS t(expected)
    WHERE to_regclass(t.expected) IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: required dependency tables missing: %. Apply Phase 1 slice migrations first.',
      v_missing;
  END IF;

  -- Required dependency functions (Phase 1 Slice 8 exclusion primitives).
  IF to_regprocedure('public.exclude_scan_record(uuid, text)') IS NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: required dependency function public.exclude_scan_record(uuid, text) is missing. Apply Phase 1 Slice 8 first.';
  END IF;

  IF to_regprocedure('public.exclude_evidence_row(text, uuid, text)') IS NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: required dependency function public.exclude_evidence_row(text, uuid, text) is missing. Apply Phase 1 Slice 8 first.';
  END IF;

  -- Target tables must not already exist.
  SELECT string_agg(t.expected, ', ')
    INTO v_collision
    FROM (VALUES
      ('public.deletion_requests'),
      ('public.deletion_request_executions')
    ) AS t(expected)
    WHERE to_regclass(t.expected) IS NOT NULL;

  IF v_collision IS NOT NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: target table(s) already exist: %. Refusing to proceed.',
      v_collision;
  END IF;

  -- Proposed guard function names must not collide.
  IF to_regprocedure('public.enforce_deletion_request_transition()') IS NOT NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: function public.enforce_deletion_request_transition() already exists. Refusing to proceed.';
  END IF;

  IF to_regprocedure('public.enforce_deletion_request_execution_consistency()') IS NOT NULL THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: function public.enforce_deletion_request_execution_consistency() already exists. Refusing to proceed.';
  END IF;

  -- Proposed trigger names must not collide on the target tables.
  -- Tables are confirmed absent above; this catalog check remains for explicit
  -- name-collision failure messaging consistent with F-4.
  IF EXISTS (
    SELECT 1
      FROM pg_catalog.pg_trigger tr
      JOIN pg_catalog.pg_class c ON c.oid = tr.tgrelid
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE NOT tr.tgisinternal
       AND n.nspname = 'public'
       AND c.relname IN ('deletion_requests', 'deletion_request_executions')
       AND tr.tgname IN (
         'trg_deletion_requests_transition_guard',
         'trg_deletion_requests_execution_consistency',
         'trg_deletion_request_executions_execution_consistency'
       )
  ) THEN
    RAISE EXCEPTION
      'Phase 2 Slice 2 SQL draft preflight: proposed trigger name collision on deletion_requests / deletion_request_executions. Refusing to proceed.';
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 2. Table: public.deletion_requests
-- ---------------------------------------------------------------------------

CREATE TABLE public.deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  request_scope text NOT NULL,
  target_scan_record_id uuid NULL,
  target_evidence_table text NULL,
  target_evidence_id uuid NULL,
  request_state text NOT NULL DEFAULT 'received',
  resolution_code text NULL,
  requested_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz NULL,
  resolved_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT deletion_requests_user_email_nonempty_check
    CHECK (char_length(btrim(user_email)) > 0),

  CONSTRAINT deletion_requests_request_scope_check
    CHECK (request_scope IN (
      'account_wide',
      'scan_specific',
      'evidence_specific'
    )),

  CONSTRAINT deletion_requests_request_state_check
    CHECK (request_state IN (
      'received',
      'executed',
      'rejected'
    )),

  CONSTRAINT deletion_requests_resolution_code_check
    CHECK (
      resolution_code IS NULL
      OR resolution_code IN (
        'completed',
        'invalid_request',
        'duplicate_request',
        'unauthorized_request',
        'already_completed',
        'execution_failed'
      )
    ),

  CONSTRAINT deletion_requests_state_resolution_coupling_check
    CHECK (
      (request_state = 'received' AND resolution_code IS NULL)
      OR (request_state = 'executed' AND resolution_code = 'completed')
      OR (
        request_state = 'rejected'
        AND resolution_code IN (
          'invalid_request',
          'duplicate_request',
          'unauthorized_request',
          'already_completed',
          'execution_failed'
        )
      )
    ),

  CONSTRAINT deletion_requests_scope_target_matrix_check
    CHECK (
      (
        request_scope = 'account_wide'
        AND target_scan_record_id IS NULL
        AND target_evidence_table IS NULL
        AND target_evidence_id IS NULL
      )
      OR (
        request_scope = 'scan_specific'
        AND target_scan_record_id IS NOT NULL
        AND target_evidence_table IS NULL
        AND target_evidence_id IS NULL
      )
      OR (
        request_scope = 'evidence_specific'
        AND target_scan_record_id IS NOT NULL
        AND target_evidence_table IS NOT NULL
        AND target_evidence_id IS NOT NULL
      )
    ),

  CONSTRAINT deletion_requests_evidence_table_whitelist_check
    CHECK (
      target_evidence_table IS NULL
      OR target_evidence_table IN (
        'user_description_evidence',
        'image_evidence',
        'product_mention_evidence',
        'ai_analysis_evidence'
      )
    ),

  CONSTRAINT deletion_requests_timestamp_ordering_check
    CHECK (
      (validated_at IS NULL OR requested_at <= validated_at)
      AND (resolved_at IS NULL OR requested_at <= resolved_at)
      AND (
        validated_at IS NULL
        OR resolved_at IS NULL
        OR validated_at <= resolved_at
      )
    ),

  CONSTRAINT deletion_requests_received_resolved_at_null_check
    CHECK (request_state <> 'received' OR resolved_at IS NULL),

  CONSTRAINT deletion_requests_terminal_requires_resolved_at_check
    CHECK (request_state = 'received' OR resolved_at IS NOT NULL),

  -- executed implies validated_at IS NOT NULL. received/rejected may keep
  -- validated_at null (pre-validation) or non-null (post-milestone).
  CONSTRAINT deletion_requests_executed_requires_validated_at_check
    CHECK (request_state <> 'executed' OR validated_at IS NOT NULL),

  CONSTRAINT deletion_requests_created_requested_integrity_check
    CHECK (requested_at <= created_at)
);

-- ---------------------------------------------------------------------------
-- 3. Table: public.deletion_request_executions
-- ---------------------------------------------------------------------------

CREATE TABLE public.deletion_request_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deletion_request_id uuid NOT NULL,
  scan_record_id uuid NOT NULL,
  executed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT deletion_request_executions_deletion_request_id_fkey
    FOREIGN KEY (deletion_request_id)
    REFERENCES public.deletion_requests (id)
    ON DELETE RESTRICT,

  CONSTRAINT deletion_request_executions_request_scan_unique
    UNIQUE (deletion_request_id, scan_record_id)
);

-- ---------------------------------------------------------------------------
-- 4. Request transition guard (non-SECURITY DEFINER) — F-1 + update posture
-- executed requires prior validated_at milestone; rejected does not.
-- ---------------------------------------------------------------------------

CREATE FUNCTION public.enforce_deletion_request_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- F-1: insert posture — received only; validation/resolution fields null.
    IF NEW.request_state IS DISTINCT FROM 'received'
       OR NEW.validated_at IS NOT NULL
       OR NEW.resolved_at IS NOT NULL
       OR NEW.resolution_code IS NOT NULL THEN
      RAISE EXCEPTION
        'deletion_requests insert posture violation: new rows must be request_state=received with validated_at, resolved_at, and resolution_code all null'
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  -- UPDATE path
  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.user_email IS DISTINCT FROM OLD.user_email
     OR NEW.request_scope IS DISTINCT FROM OLD.request_scope
     OR NEW.target_scan_record_id IS DISTINCT FROM OLD.target_scan_record_id
     OR NEW.target_evidence_table IS DISTINCT FROM OLD.target_evidence_table
     OR NEW.target_evidence_id IS DISTINCT FROM OLD.target_evidence_id
     OR NEW.requested_at IS DISTINCT FROM OLD.requested_at
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION
      'deletion_requests immutability violation: id, user_email, request_scope, target_*, requested_at, and created_at cannot change'
      USING ERRCODE = 'check_violation';
  END IF;

  IF OLD.request_state IN ('executed', 'rejected') THEN
    RAISE EXCEPTION
      'deletion_requests transition violation: terminal rows (executed/rejected) are immutable'
      USING ERRCODE = 'check_violation';
  END IF;

  -- validated_at: once set, cannot clear and cannot replace.
  IF OLD.validated_at IS NOT NULL
     AND NEW.validated_at IS DISTINCT FROM OLD.validated_at THEN
    RAISE EXCEPTION
      'deletion_requests validated_at immutability violation: validated_at cannot be cleared or replaced once set'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Permitted: received -> received validation-milestone update only.
  IF OLD.request_state = 'received' AND NEW.request_state = 'received' THEN
    IF OLD.validated_at IS NOT NULL
       OR NEW.validated_at IS NULL
       OR NEW.resolution_code IS NOT NULL
       OR NEW.resolved_at IS NOT NULL THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: received->received permits only setting validated_at from null to non-null; resolution_code and resolved_at must remain null'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.resolution_code IS DISTINCT FROM OLD.resolution_code
       OR NEW.resolved_at IS DISTINCT FROM OLD.resolved_at THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: received->received may change only validated_at'
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  -- Permitted: received -> executed | rejected (terminal).
  IF OLD.request_state = 'received'
     AND NEW.request_state IN ('executed', 'rejected') THEN
    -- validated_at may only be set via the milestone update, not during terminalization.
    IF OLD.validated_at IS NULL AND NEW.validated_at IS NOT NULL THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: validated_at may be set only via received->received milestone update'
        USING ERRCODE = 'check_violation';
    END IF;

    -- received -> executed only: successful validation must already be recorded.
    IF NEW.request_state = 'executed' AND NEW.validated_at IS NULL THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: executed requires validated_at non-null (set via earlier received->received milestone)'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.resolved_at IS NULL THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: terminal transition requires non-null resolved_at'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.request_state = 'executed'
       AND NEW.resolution_code IS DISTINCT FROM 'completed' THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: executed requires resolution_code=completed'
        USING ERRCODE = 'check_violation';
    END IF;

    IF NEW.request_state = 'rejected'
       AND (
         NEW.resolution_code IS NULL
         OR NEW.resolution_code NOT IN (
           'invalid_request',
           'duplicate_request',
           'unauthorized_request',
           'already_completed',
           'execution_failed'
         )
       ) THEN
      RAISE EXCEPTION
        'deletion_requests transition violation: rejected requires a closed rejection resolution_code'
        USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
  END IF;

  RAISE EXCEPTION
    'deletion_requests transition violation: only received->received (validated_at milestone), received->executed, and received->rejected are permitted'
    USING ERRCODE = 'check_violation';
END;
$$;

CREATE TRIGGER trg_deletion_requests_transition_guard
  BEFORE INSERT OR UPDATE
  ON public.deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_deletion_request_transition();

-- ---------------------------------------------------------------------------
-- 5. Deferred cross-table consistency guard (non-SECURITY DEFINER)
-- ---------------------------------------------------------------------------
-- Runs at transaction end so the atomic workflow may insert attribution rows
-- and then terminalize the request within one transaction. No partially
-- consistent transaction may commit.
--
-- F-2: account_wide + executed requires >= 1 execution row; zero-session
-- account-wide outcomes cannot commit as executed.

CREATE FUNCTION public.enforce_deletion_request_execution_consistency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_request_id uuid;
  v_state text;
  v_scope text;
  v_target_scan uuid;
  v_exec_count bigint;
  v_matching_count bigint;
BEGIN
  IF TG_TABLE_NAME = 'deletion_requests' THEN
    IF TG_OP = 'DELETE' THEN
      -- ON DELETE RESTRICT on executions prevents deleting a parent that still
      -- has attribution rows. A successful parent delete implies zero children.
      RETURN NULL;
    END IF;
    v_request_id := NEW.id;
  ELSE
    IF TG_OP = 'DELETE' THEN
      v_request_id := OLD.deletion_request_id;
    ELSE
      v_request_id := NEW.deletion_request_id;
    END IF;
  END IF;

  SELECT dr.request_state, dr.request_scope, dr.target_scan_record_id
    INTO v_state, v_scope, v_target_scan
    FROM public.deletion_requests dr
   WHERE dr.id = v_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'deletion_request_executions consistency violation: parent deletion_requests row % does not exist at commit',
      v_request_id
      USING ERRCODE = 'foreign_key_violation';
  END IF;

  SELECT count(*)::bigint
    INTO v_exec_count
    FROM public.deletion_request_executions dre
   WHERE dre.deletion_request_id = v_request_id;

  IF v_state = 'received' AND v_exec_count <> 0 THEN
    RAISE EXCEPTION
      'deletion request consistency violation: received request % must have zero execution rows at commit (found %)',
      v_request_id, v_exec_count
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_state = 'rejected' AND v_exec_count <> 0 THEN
    RAISE EXCEPTION
      'deletion request consistency violation: rejected request % must have zero execution rows at commit (found %)',
      v_request_id, v_exec_count
      USING ERRCODE = 'check_violation';
  END IF;

  IF v_state = 'executed' AND v_scope = 'scan_specific' THEN
    IF v_exec_count <> 1 THEN
      RAISE EXCEPTION
        'deletion request consistency violation: executed scan_specific request % requires exactly one execution row at commit (found %)',
        v_request_id, v_exec_count
        USING ERRCODE = 'check_violation';
    END IF;

    SELECT count(*)::bigint
      INTO v_matching_count
      FROM public.deletion_request_executions dre
     WHERE dre.deletion_request_id = v_request_id
       AND dre.scan_record_id = v_target_scan;

    IF v_matching_count <> 1 THEN
      RAISE EXCEPTION
        'deletion request consistency violation: executed scan_specific request % requires execution.scan_record_id to equal target_scan_record_id',
        v_request_id
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF v_state = 'executed' AND v_scope = 'account_wide' THEN
    -- F-2: zero eligible sessions cannot be recorded as executed.
    IF v_exec_count < 1 THEN
      RAISE EXCEPTION
        'deletion request consistency violation: executed account_wide request % requires at least one execution row at commit (found %). Zero-session outcomes must resolve as rejected/already_completed',
        v_request_id, v_exec_count
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  IF v_state = 'executed' AND v_scope = 'evidence_specific' THEN
    IF v_exec_count <> 0 THEN
      RAISE EXCEPTION
        'deletion request consistency violation: executed evidence_specific request % must have zero session execution rows at commit (found %)',
        v_request_id, v_exec_count
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Every remaining execution row (when any exist) requires parent executed
  -- with a session-level scope at transaction end.
  IF v_exec_count > 0 THEN
    IF v_state IS DISTINCT FROM 'executed' THEN
      RAISE EXCEPTION
        'deletion request consistency violation: execution rows for request % require parent request_state=executed at commit (found %)',
        v_request_id, v_state
        USING ERRCODE = 'check_violation';
    END IF;

    IF v_scope NOT IN ('account_wide', 'scan_specific') THEN
      RAISE EXCEPTION
        'deletion request consistency violation: execution rows for request % require parent request_scope account_wide or scan_specific at commit (found %)',
        v_request_id, v_scope
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER trg_deletion_requests_execution_consistency
  AFTER INSERT OR UPDATE OR DELETE
  ON public.deletion_requests
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_deletion_request_execution_consistency();

-- Append-only table: no UPDATE grant and no authorized UPDATE workflow.
-- Constraint trigger covers INSERT and DELETE only (not UPDATE).
CREATE CONSTRAINT TRIGGER trg_deletion_request_executions_execution_consistency
  AFTER INSERT OR DELETE
  ON public.deletion_request_executions
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_deletion_request_execution_consistency();

-- ---------------------------------------------------------------------------
-- 6. RLS and grants — new tables only
-- ---------------------------------------------------------------------------

ALTER TABLE public.deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deletion_request_executions ENABLE ROW LEVEL SECURITY;

-- F-3: ownership-scoped SELECT explicitly TO authenticated (not TO public).
CREATE POLICY "Users can read own deletion requests"
  ON public.deletion_requests
  FOR SELECT
  TO authenticated
  USING (lower(user_email) = lower(auth.jwt() ->> 'email'));

-- No authenticated INSERT / UPDATE / DELETE policies on deletion_requests.
-- No client-facing policies on deletion_request_executions (service-role-only).

REVOKE ALL ON TABLE public.deletion_requests FROM PUBLIC;
REVOKE ALL ON TABLE public.deletion_requests FROM anon;
REVOKE ALL ON TABLE public.deletion_requests FROM authenticated;
REVOKE ALL ON TABLE public.deletion_requests FROM service_role;

REVOKE ALL ON TABLE public.deletion_request_executions FROM PUBLIC;
REVOKE ALL ON TABLE public.deletion_request_executions FROM anon;
REVOKE ALL ON TABLE public.deletion_request_executions FROM authenticated;
REVOKE ALL ON TABLE public.deletion_request_executions FROM service_role;

GRANT SELECT ON TABLE public.deletion_requests TO authenticated;

-- service_role least-privilege: table SELECT; column-level INSERT/UPDATE only.
-- Column-level grants make id and governance timestamps database-controlled
-- (DEFAULT gen_random_uuid() / DEFAULT now() / null posture). Explicit caller
-- values for those columns are not privileged and must not be trusted.
GRANT SELECT ON TABLE public.deletion_requests TO service_role;
GRANT INSERT (
  user_email,
  request_scope,
  target_scan_record_id,
  target_evidence_table,
  target_evidence_id
) ON TABLE public.deletion_requests TO service_role;
-- No INSERT privilege on: id, request_state, resolution_code, requested_at,
-- validated_at, resolved_at, created_at.
GRANT UPDATE (
  request_state,
  resolution_code,
  validated_at,
  resolved_at
) ON TABLE public.deletion_requests TO service_role;
-- No table-level UPDATE. No UPDATE on identity, ownership, scope, targets,
-- requested_at, or created_at. Transition guard remains binding for all
-- permitted workflow mutations.
-- No DELETE grant on deletion_requests.

GRANT SELECT ON TABLE public.deletion_request_executions TO service_role;
GRANT INSERT (
  deletion_request_id,
  scan_record_id
) ON TABLE public.deletion_request_executions TO service_role;
-- No INSERT privilege on: id, executed_at, created_at (database-controlled).
-- No UPDATE or DELETE grant on deletion_request_executions.
-- No authenticated / anon grants on deletion_request_executions.

-- Trigger functions: revoke implicit PUBLIC execute; no client execute.
REVOKE ALL ON FUNCTION public.enforce_deletion_request_transition() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_deletion_request_transition() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_deletion_request_transition() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_deletion_request_transition() TO service_role;

REVOKE ALL ON FUNCTION public.enforce_deletion_request_execution_consistency() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.enforce_deletion_request_execution_consistency() FROM anon;
REVOKE ALL ON FUNCTION public.enforce_deletion_request_execution_consistency() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.enforce_deletion_request_execution_consistency() TO service_role;

-- ---------------------------------------------------------------------------
-- 7. Indexes (approved set only)
-- ---------------------------------------------------------------------------
-- Unique (deletion_request_id, scan_record_id) already provides a leading
-- deletion_request_id access path; a separate non-unique index on
-- deletion_request_id alone is omitted as redundant.

CREATE INDEX deletion_requests_user_email_requested_at_idx
  ON public.deletion_requests (user_email, requested_at DESC);

CREATE INDEX deletion_requests_request_state_requested_at_idx
  ON public.deletion_requests (request_state, requested_at ASC);

CREATE INDEX deletion_requests_target_scan_record_id_idx
  ON public.deletion_requests (target_scan_record_id)
  WHERE target_scan_record_id IS NOT NULL;

CREATE INDEX deletion_requests_target_evidence_idx
  ON public.deletion_requests (target_evidence_table, target_evidence_id)
  WHERE target_evidence_table IS NOT NULL
    AND target_evidence_id IS NOT NULL;

CREATE INDEX deletion_request_executions_scan_record_id_idx
  ON public.deletion_request_executions (scan_record_id);

-- ---------------------------------------------------------------------------
-- 8. Comments
-- ---------------------------------------------------------------------------

COMMENT ON TABLE public.deletion_requests IS
  'Phase 2 Slice 2 deletion-request governance record. Stores request workflow metadata only — not evidence payloads, storage references, AI output, diagnosis, or medical content. Append-oriented audit surface; dormant until a later approved workflow write path consumes it. service_role INSERT/UPDATE are column-level so id and governance timestamps (requested_at, validated_at, resolved_at, created_at) and insert-defaulted request_state/resolution_code begin from database defaults or null posture, not caller-supplied values.';

COMMENT ON TABLE public.deletion_request_executions IS
  'Phase 2 Slice 2 append-only execution attribution: links an executed deletion request to each session anchor excluded under that request. Governance audit surface only; not an evidence payload store. No lifecycle FK on scan_record_id. service_role INSERT is column-level (deletion_request_id, scan_record_id only) so id, executed_at, and created_at are database-controlled; no UPDATE or DELETE grant.';

COMMENT ON COLUMN public.deletion_requests.request_state IS
  'Request workflow state (received | executed | rejected). executed implies validated_at IS NOT NULL. Distinct from evidence lifecycle active/excluded. Not a medical or clinical status field.';

COMMENT ON COLUMN public.deletion_requests.resolution_code IS
  'Closed workflow resolution code. Null while received; completed when executed; one of the closed rejection codes when rejected. Not free-text outcome detail and not a restatement of the Slice 8 reason taxonomy.';

COMMENT ON COLUMN public.deletion_requests.target_scan_record_id IS
  'Opaque session target identifier for scan_specific and evidence_specific scopes. No FK to scan_records so governance history remains independent of evidence lifecycle.';

COMMENT ON COLUMN public.deletion_requests.target_evidence_table IS
  'Evidence table whitelist name for evidence_specific scope only (user_description_evidence | image_evidence | product_mention_evidence | ai_analysis_evidence). Governance identifier only; not payload content.';

COMMENT ON COLUMN public.deletion_requests.target_evidence_id IS
  'Opaque evidence row identifier for evidence_specific scope only. Paired with target_evidence_table; no FK to lifecycle/evidence tables.';

COMMENT ON COLUMN public.deletion_requests.validated_at IS
  'Governance-validation milestone timestamp. Set at most once via the permitted received->received update when post-intake validation succeeds; required non-null before executed; may be null for early rejection or non-null for rejection after successful validation. Immutable once set.';

COMMENT ON COLUMN public.deletion_request_executions.deletion_request_id IS
  'Owning deletion request. Restrictive FK preserves attribution and prevents destructive cascade of governance history.';

COMMENT ON COLUMN public.deletion_request_executions.scan_record_id IS
  'Session anchor attributed as excluded under the owning executed request. Opaque uuid with no lifecycle FK; audit independence from scan_records row lifetime.';

COMMENT ON FUNCTION public.enforce_deletion_request_transition() IS
  'Phase 2 Slice 2 non-SECURITY DEFINER transition guard for deletion_requests. Enforces insert posture (F-1), allowed received->received validated_at milestone, received->executed only when validated_at is already non-null, received->rejected (validated_at null or set), and request-row field immutability. Does not enforce cross-table execution cardinality.';

COMMENT ON FUNCTION public.enforce_deletion_request_execution_consistency() IS
  'Phase 2 Slice 2 non-SECURITY DEFINER deferred cross-table consistency guard. At transaction end enforces request_state/scope/execution-row cardinality invariants across deletion_requests and deletion_request_executions, including F-2 account_wide executed >= 1 execution row. Bound to deletion_requests AFTER INSERT OR UPDATE OR DELETE and to deletion_request_executions AFTER INSERT OR DELETE only (append-only; UPDATE is not an authorized operation). Local to the two new governance tables only.';

COMMIT;
```

---

## Design-to-SQL Traceability

| Approved design requirement | SQL object / constraint implementing it |
|-----------------------------|----------------------------------------|
| F-4 preflight before object creation | Anonymous `DO` block checking dependency tables/functions, absent target tables, and non-colliding function/trigger names |
| `deletion_requests` table + approved columns | `CREATE TABLE public.deletion_requests` with `gen_random_uuid()` / `now()` defaults; no `updated_at`; no free-text outcome; no `auth.users` FK; no lifecycle FKs |
| Non-empty `user_email` | `deletion_requests_user_email_nonempty_check` |
| Closed `request_scope` vocabulary | `deletion_requests_request_scope_check` |
| Closed `request_state` vocabulary + default `received` | Column default + `deletion_requests_request_state_check` |
| Closed `resolution_code` vocabulary | `deletion_requests_resolution_code_check` |
| Exact state/resolution coupling | `deletion_requests_state_resolution_coupling_check` |
| Exact scope/target matrix | `deletion_requests_scope_target_matrix_check` |
| Evidence table whitelist | `deletion_requests_evidence_table_whitelist_check` |
| Timestamp ordering | `deletion_requests_timestamp_ordering_check` |
| `received` ⇒ `resolved_at` null | `deletion_requests_received_resolved_at_null_check` |
| Terminal states require `resolved_at` | `deletion_requests_terminal_requires_resolved_at_check` |
| `executed` ⇒ `validated_at` non-null | `deletion_requests_executed_requires_validated_at_check` + transition-guard `received`→`executed` branch |
| created/requested integrity | `deletion_requests_created_requested_integrity_check` (`requested_at <= created_at`) |
| `deletion_request_executions` shape | `CREATE TABLE public.deletion_request_executions` |
| Restrictive FK to requests | `deletion_request_executions_deletion_request_id_fkey` `ON DELETE RESTRICT` |
| No FK on `scan_record_id` | Column is bare `uuid NOT NULL` |
| Unique `(deletion_request_id, scan_record_id)` | `deletion_request_executions_request_scan_unique` |
| F-1 insert-state enforcement | `enforce_deletion_request_transition` INSERT branch |
| Allowed transitions + immutability | `enforce_deletion_request_transition` UPDATE branch + `trg_deletion_requests_transition_guard` (`received`→`executed` requires prior `validated_at`; `received`→`rejected` unchanged) |
| Deferred cross-table consistency | `enforce_deletion_request_execution_consistency` + deferred constraint triggers: `deletion_requests` AFTER INSERT OR UPDATE OR DELETE; `deletion_request_executions` AFTER INSERT OR DELETE only (no UPDATE coverage — UPDATE is not an authorized operation) |
| F-2 account-wide ≥ 1 execution when executed | Deferred guard `account_wide` + `executed` branch |
| F-3 authenticated ownership SELECT | Policy `"Users can read own deletion requests"` `TO authenticated` |
| Privilege reset before narrow grants | `REVOKE ALL ON TABLE ... FROM PUBLIC`, `anon`, `authenticated`, and `service_role` on both tables precedes all `GRANT` statements; no broader/default privilege can remain effective |
| `authenticated` SELECT-only on `deletion_requests` | After reset: `GRANT SELECT ON TABLE public.deletion_requests TO authenticated` only; no INSERT, UPDATE, or DELETE |
| Service-role workflow writes; no client writes | Column-level grants + absence of write policies; `service_role` has no table-level INSERT, UPDATE, or DELETE on either table |
| `deletion_requests` column-level INSERT/UPDATE | After reset: `GRANT SELECT` table-level; column-level `GRANT INSERT` only on `user_email`, `request_scope`, `target_scan_record_id`, `target_evidence_table`, `target_evidence_id`; column-level `GRANT UPDATE` only on `request_state`, `resolution_code`, `validated_at`, `resolved_at` — no table-level INSERT/UPDATE/DELETE; id and governance timestamps database-controlled |
| Executions service-role-only; append-only | After reset: `GRANT SELECT` table-level; column-level `GRANT INSERT` only on `deletion_request_id`, `scan_record_id`; no table-level INSERT/UPDATE/DELETE; no client policies; unique `(deletion_request_id, scan_record_id)` + restrictive FK retained |
| No application DELETE; no executions UPDATE/DELETE | Explicit grant matrix omits those privileges; executions constraint trigger omits UPDATE |
| Function execute hardening | `REVOKE ALL ... FROM PUBLIC/anon/authenticated` + `GRANT EXECUTE ... TO service_role` |
| Approved indexes | Four `deletion_requests` indexes + `scan_record_id` index; `deletion_request_id` lookup served by unique constraint (redundant standalone index omitted) |
| Comments | `COMMENT ON` for both tables, key columns, and both guard functions |
| Forward-only, transaction-wrapped | Single `BEGIN` … `COMMIT`; additive statements only |
| No SECURITY DEFINER | Both functions declared `SECURITY INVOKER` |
| Dormant-on-arrival / no data | No DML against production or test rows |

---

## Future Privilege Verification (Review Requirement)

Non-executable review requirement. Future verification must confirm:

- broader/default privileges on both tables are revoked from `PUBLIC`, `anon`, `authenticated`, and `service_role` before any narrow `GRANT` statements take effect
- no broader privilege remains effective from default privileges after the reset-and-grant sequence
- `authenticated` has `SELECT` only on `deletion_requests` (no INSERT, UPDATE, or DELETE)
- `service_role` has no table-level INSERT, UPDATE, or DELETE on either table
- `service_role` receives only the approved column-level INSERT/UPDATE privileges on `deletion_requests` and column-level INSERT only on `deletion_request_executions`
- `service_role` cannot explicitly insert `id`, `request_state`, `resolution_code`, `requested_at`, `validated_at`, `resolved_at`, or `created_at` into `deletion_requests`
- `service_role` can insert a valid `received` request using only the approved intake columns
- `service_role` cannot explicitly insert `id`, `executed_at`, or `created_at` into `deletion_request_executions`
- `service_role` cannot update or delete execution rows
- `service_role` updates on `deletion_requests` are limited to the four approved workflow columns and still constrained by the transition guard

Do not treat this section as executable test SQL.

---

## Future Workflow Verification (Review Requirement)

Non-executable review requirement. Future verification must confirm:

- `received` with `validated_at` null cannot transition to `executed`
- `received` with `validated_at` populated can transition to `executed` when all other invariants are satisfied
- early rejection with `validated_at` null remains valid
- later rejection with `validated_at` populated remains valid
- direct `INSERT` as `executed` remains forbidden

Do not treat this section as executable test SQL.

---

## Known Non-Execution Boundary

- This SQL has **not** been executed.
- It has **not** been placed in `supabase/migrations`.
- It requires **read-only high-risk review** before migration file authorization.
- Supabase execution remains **prohibited**.

---

*End of Phase 2 Slice 2 SQL Draft V1.*
