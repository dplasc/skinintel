-- =============================================================================
-- Phase 2 Slice 2 — Migration Verification SQL Draft V1
-- =============================================================================
-- NOT APPROVED FOR EXECUTION
-- DEV ONLY AFTER SEPARATE AUTHORIZATION
-- NEVER RUN IN PROD
-- BLOCK B PERFORMS TEMPORARY DML AND MUST ROLLBACK
-- =============================================================================
-- Source migration:
--   supabase/migrations/20260719120000_phase_2_slice_2_deletion_request_governance.sql
-- Repository baseline (Git identity, not Supabase history):
--   73af733400efd68a6657bbbc11c52814e6c9d3f2
-- =============================================================================

-- #############################################################################
-- BLOCK A — READ-ONLY CATALOG AND PRIVILEGE VERIFICATION
-- #############################################################################

BEGIN READ ONLY;

WITH
params AS (
  SELECT
    'public'::name AS schema_name,
    'deletion_requests'::name AS req_table,
    'deletion_request_executions'::name AS exec_table
),
-- A-01 — Execution context and object preflight
a01 AS (
  SELECT
    'A-01-01'::text AS check_id,
    'execution_context'::text AS verification_area,
    'P1'::text AS severity,
    'INFO'::text AS status,
    'observable database and schema context'::text AS expected,
    format('database=%s current_schema=%s current_user=%s',
           current_database(), current_schema(), current_user) AS actual,
    'Context observation only; does not prove migration history'::text AS details
  UNION ALL
  SELECT
    'A-01-02',
    'object_preflight',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END,
    'public.deletion_requests exists',
    CASE WHEN to_regclass('public.deletion_requests') IS NOT NULL
         THEN 'present' ELSE 'absent' END,
    'Verification of migration-created request table'
  UNION ALL
  SELECT
    'A-01-03',
    'object_preflight',
    'P0',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NOT NULL THEN 'PASS' ELSE 'FAIL' END,
    'public.deletion_request_executions exists',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NOT NULL
         THEN 'present' ELSE 'absent' END,
    'Verification of migration-created execution attribution table'
  UNION ALL
  SELECT
    'A-01-04',
    'object_preflight',
    'P0',
    CASE
      WHEN to_regclass('public.deletion_requests') IS NOT NULL
       AND to_regclass('public.deletion_request_executions') IS NOT NULL
      THEN 'PASS'
      ELSE 'FAIL'
    END,
    'both Slice 2 tables present before catalog deep checks',
    CASE
      WHEN to_regclass('public.deletion_requests') IS NOT NULL
       AND to_regclass('public.deletion_request_executions') IS NOT NULL
      THEN 'both_present'
      ELSE 'one_or_both_absent'
    END,
    'If FAIL, subsequent catalog checks may report NOT_RUN or secondary FAILs; no migration-history mutation performed'
  UNION ALL
  SELECT
    'A-01-05',
    'migration_history',
    'P2',
    'INFO',
    'no claim of supabase_migrations history unless queried',
    'not_queried',
    'This draft does not assert remote migration-history identity'
  UNION ALL
  SELECT
    'A-01-06',
    'dormancy',
    'P1',
    CASE
      WHEN to_regclass('public.deletion_requests') IS NULL
        OR to_regclass('public.deletion_request_executions') IS NULL
      THEN 'NOT_RUN'
      WHEN (SELECT count(*)::bigint FROM public.deletion_requests) = 0
       AND (SELECT count(*)::bigint FROM public.deletion_request_executions) = 0
      THEN 'PASS'
      ELSE 'FAIL'
    END,
    'both Slice 2 tables contain zero rows immediately after apply (dormant-on-arrival)',
    CASE
      WHEN to_regclass('public.deletion_requests') IS NULL
        OR to_regclass('public.deletion_request_executions') IS NULL
      THEN 'table_absent'
      ELSE format('deletion_requests_count=%s deletion_request_executions_count=%s',
        (SELECT count(*)::bigint FROM public.deletion_requests),
        (SELECT count(*)::bigint FROM public.deletion_request_executions))
    END,
    'Post-apply empty-table dormancy evidence; does not delete or repair rows; object existence alone does not prove emptiness'
),
-- A-02 — Exact table and column inventory
expected_req_cols AS (
  SELECT * FROM (VALUES
    (1,  'id',                     'uuid',        false, 'gen_random_uuid()'),
    (2,  'user_email',             'text',        false, NULL),
    (3,  'request_scope',          'text',        false, NULL),
    (4,  'target_scan_record_id',  'uuid',        true,  NULL),
    (5,  'target_evidence_table',  'text',        true,  NULL),
    (6,  'target_evidence_id',     'uuid',        true,  NULL),
    (7,  'request_state',          'text',        false, '''received''::text'),
    (8,  'resolution_code',        'text',        true,  NULL),
    (9,  'requested_at',           'timestamptz', false, 'now()'),
    (10, 'validated_at',           'timestamptz', true,  NULL),
    (11, 'resolved_at',            'timestamptz', true,  NULL),
    (12, 'created_at',             'timestamptz', false, 'now()')
  ) AS v(ord, col, typ, is_nullable, def_norm)
),
actual_req_cols AS (
  SELECT
    a.attnum AS ord,
    a.attname AS col,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS typ,
    NOT a.attnotnull AS is_nullable,
    pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) AS def_expr,
    a.attidentity AS identity_posture,
    a.attgenerated AS generated_posture
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_catalog.pg_attrdef ad
    ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_requests'
    AND a.attnum > 0
    AND NOT a.attisdropped
),
expected_exec_cols AS (
  SELECT * FROM (VALUES
    (1, 'id',                   'uuid',        false, 'gen_random_uuid()'),
    (2, 'deletion_request_id',  'uuid',        false, NULL),
    (3, 'scan_record_id',       'uuid',        false, NULL),
    (4, 'executed_at',          'timestamptz', false, 'now()'),
    (5, 'created_at',           'timestamptz', false, 'now()')
  ) AS v(ord, col, typ, is_nullable, def_norm)
),
actual_exec_cols AS (
  SELECT
    a.attnum AS ord,
    a.attname AS col,
    pg_catalog.format_type(a.atttypid, a.atttypmod) AS typ,
    NOT a.attnotnull AS is_nullable,
    pg_catalog.pg_get_expr(ad.adbin, ad.adrelid) AS def_expr,
    a.attidentity AS identity_posture,
    a.attgenerated AS generated_posture
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_catalog.pg_attrdef ad
    ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_request_executions'
    AND a.attnum > 0
    AND NOT a.attisdropped
),
a02 AS (
  SELECT
    'A-02-01'::text AS check_id,
    'column_inventory'::text AS verification_area,
    'P1'::text AS severity,
    CASE
      WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
      WHEN (SELECT count(*) FROM actual_req_cols) = 12
       AND NOT EXISTS (
         SELECT 1
         FROM expected_req_cols e
         FULL OUTER JOIN actual_req_cols a
           ON a.ord = e.ord AND a.col = e.col
         WHERE e.col IS NULL OR a.col IS NULL
            OR a.typ IS DISTINCT FROM e.typ
            OR a.is_nullable IS DISTINCT FROM e.is_nullable
            OR coalesce(a.def_expr, '') IS DISTINCT FROM coalesce(e.def_norm, '')
            OR a.identity_posture IS DISTINCT FROM ''
            OR a.generated_posture IS DISTINCT FROM ''
       )
      THEN 'PASS' ELSE 'FAIL'
    END AS status,
    'deletion_requests: 12 columns, exact order/name/type/nullability/defaults; no identity/generated'::text AS expected,
    CASE
      WHEN to_regclass('public.deletion_requests') IS NULL THEN 'table_absent'
      ELSE format('count=%s mismatch_rows=%s',
        (SELECT count(*) FROM actual_req_cols),
        (SELECT count(*) FROM expected_req_cols e
         FULL OUTER JOIN actual_req_cols a
           ON a.ord = e.ord AND a.col = e.col
         WHERE e.col IS NULL OR a.col IS NULL
            OR a.typ IS DISTINCT FROM e.typ
            OR a.is_nullable IS DISTINCT FROM e.is_nullable
            OR coalesce(a.def_expr, '') IS DISTINCT FROM coalesce(e.def_norm, '')
            OR a.identity_posture IS DISTINCT FROM ''
            OR a.generated_posture IS DISTINCT FROM ''))
    END AS actual,
    'Defaults expected: gen_random_uuid()/now()/''received''::text per migration'::text AS details
  UNION ALL
  SELECT
    'A-02-02',
    'column_inventory',
    'P1',
    CASE
      WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
      WHEN (SELECT count(*) FROM actual_exec_cols) = 5
       AND NOT EXISTS (
         SELECT 1
         FROM expected_exec_cols e
         FULL OUTER JOIN actual_exec_cols a
           ON a.ord = e.ord AND a.col = e.col
         WHERE e.col IS NULL OR a.col IS NULL
            OR a.typ IS DISTINCT FROM e.typ
            OR a.is_nullable IS DISTINCT FROM e.is_nullable
            OR coalesce(a.def_expr, '') IS DISTINCT FROM coalesce(e.def_norm, '')
            OR a.identity_posture IS DISTINCT FROM ''
            OR a.generated_posture IS DISTINCT FROM ''
       )
      THEN 'PASS' ELSE 'FAIL'
    END,
    'deletion_request_executions: 5 columns, exact order/name/type/nullability/defaults; no identity/generated',
    CASE
      WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'table_absent'
      ELSE format('count=%s mismatch_rows=%s',
        (SELECT count(*) FROM actual_exec_cols),
        (SELECT count(*) FROM expected_exec_cols e
         FULL OUTER JOIN actual_exec_cols a
           ON a.ord = e.ord AND a.col = e.col
         WHERE e.col IS NULL OR a.col IS NULL
            OR a.typ IS DISTINCT FROM e.typ
            OR a.is_nullable IS DISTINCT FROM e.is_nullable
            OR coalesce(a.def_expr, '') IS DISTINCT FROM coalesce(e.def_norm, '')
            OR a.identity_posture IS DISTINCT FROM ''
            OR a.generated_posture IS DISTINCT FROM ''))
    END,
    'Defaults expected: gen_random_uuid()/now() per migration'
  UNION ALL
  SELECT
    'A-02-03',
    'column_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM actual_req_cols
           WHERE col = 'id' AND def_expr = 'gen_random_uuid()'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests.id DEFAULT gen_random_uuid()',
    coalesce((SELECT def_expr FROM actual_req_cols WHERE col = 'id'), 'absent'),
    'Database-controlled UUID default'
  UNION ALL
  SELECT
    'A-02-04',
    'column_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM actual_req_cols
               WHERE col IN ('requested_at','created_at') AND def_expr = 'now()') = 2
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests.requested_at and created_at DEFAULT now()',
    (SELECT string_agg(col || '=' || coalesce(def_expr,'<null>'), ', ' ORDER BY col)
       FROM actual_req_cols WHERE col IN ('requested_at','created_at')),
    'Database-controlled timestamps'
  UNION ALL
  SELECT
    'A-02-05',
    'column_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM actual_exec_cols
               WHERE col IN ('id') AND def_expr = 'gen_random_uuid()') = 1
          AND (SELECT count(*) FROM actual_exec_cols
               WHERE col IN ('executed_at','created_at') AND def_expr = 'now()') = 2
         THEN 'PASS' ELSE 'FAIL' END,
    'executions id/executed_at/created_at database-controlled defaults',
    (SELECT string_agg(col || '=' || coalesce(def_expr,'<null>'), ', ' ORDER BY ord)
       FROM actual_exec_cols WHERE col IN ('id','executed_at','created_at')),
    'Database-controlled UUID and timestamps on executions'
),
-- A-03 — Constraint inventory
-- CHECK expression normalization: strip whitespace and ::type casts only.
-- Accept IN (...) and = ANY (ARRAY[...]) as equivalent closed-set forms.
expected_req_checks AS (
  SELECT * FROM (VALUES
    ('deletion_requests_user_email_nonempty_check',
     'char_length(btrim(user_email))>0'),
    ('deletion_requests_request_scope_check',
     'scope_vocab:account_wide|scan_specific|evidence_specific'),
    ('deletion_requests_request_state_check',
     'state_vocab:received|executed|rejected'),
    ('deletion_requests_resolution_code_check',
     'resolution_vocab:completed|invalid_request|duplicate_request|unauthorized_request|already_completed|execution_failed'),
    ('deletion_requests_state_resolution_coupling_check',
     'coupling:received=>null;executed=>completed;rejected=>rejection_set'),
    ('deletion_requests_scope_target_matrix_check',
     'matrix:account_wide(null,null,null)|scan_specific(scan,null,null)|evidence_specific(scan,table,id)'),
    ('deletion_requests_evidence_table_whitelist_check',
     'whitelist:user_description_evidence|image_evidence|product_mention_evidence|ai_analysis_evidence'),
    ('deletion_requests_timestamp_ordering_check',
     'ordering:requested_at<=validated_at<=resolved_at when present'),
    ('deletion_requests_received_resolved_at_null_check',
     'received=>resolved_at null'),
    ('deletion_requests_terminal_requires_resolved_at_check',
     'non-received=>resolved_at non-null'),
    ('deletion_requests_executed_requires_validated_at_check',
     'executed=>validated_at non-null'),
    ('deletion_requests_created_requested_integrity_check',
     'requested_at<=created_at')
  ) AS v(conname, expected_semantic)
),
req_constraints AS (
  SELECT
    con.conname,
    con.contype,
    pg_catalog.pg_get_constraintdef(con.oid, true) AS def,
    regexp_replace(
      regexp_replace(lower(pg_catalog.pg_get_constraintdef(con.oid, true)), '::[a-z0-9 _\[\]"]+', '', 'g'),
      '[[:space:]]+', '', 'g'
    ) AS def_norm,
    con.condeferrable,
    con.condeferred
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_requests'
),
exec_constraints AS (
  SELECT
    con.conname,
    con.contype,
    pg_catalog.pg_get_constraintdef(con.oid, true) AS def,
    con.confupdtype,
    con.confdeltype,
    con.condeferrable,
    con.condeferred,
    con.confrelid
  FROM pg_catalog.pg_constraint con
  JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_request_executions'
),
check_expr_eval AS (
  SELECT
    e.conname,
    e.expected_semantic,
    r.def,
    r.def_norm,
    CASE e.conname
      WHEN 'deletion_requests_user_email_nonempty_check' THEN
        r.def_norm LIKE '%char_length(btrim(user_email))>0%'
         OR r.def_norm LIKE '%char_length(btrim((user_email)))>0%'
      WHEN 'deletion_requests_request_scope_check' THEN
        r.def_norm LIKE '%request_scope%'
        AND r.def_norm LIKE '%account_wide%'
        AND r.def_norm LIKE '%scan_specific%'
        AND r.def_norm LIKE '%evidence_specific%'
        AND (r.def_norm LIKE '%request_scopein(%'
             OR r.def_norm LIKE '%request_scope=any(array[%')
      WHEN 'deletion_requests_request_state_check' THEN
        r.def_norm LIKE '%request_state%'
        AND r.def_norm LIKE '%received%'
        AND r.def_norm LIKE '%executed%'
        AND r.def_norm LIKE '%rejected%'
        AND (r.def_norm LIKE '%request_statein(%'
             OR r.def_norm LIKE '%request_state=any(array[%')
      WHEN 'deletion_requests_resolution_code_check' THEN
        r.def_norm LIKE '%resolution_codeisnull%'
        AND r.def_norm LIKE '%completed%'
        AND r.def_norm LIKE '%invalid_request%'
        AND r.def_norm LIKE '%duplicate_request%'
        AND r.def_norm LIKE '%unauthorized_request%'
        AND r.def_norm LIKE '%already_completed%'
        AND r.def_norm LIKE '%execution_failed%'
      WHEN 'deletion_requests_state_resolution_coupling_check' THEN
        r.def_norm LIKE '%request_state=''received''andresolution_codeisnull%'
        AND r.def_norm LIKE '%request_state=''executed''andresolution_code=''completed''%'
        AND r.def_norm LIKE '%request_state=''rejected''%'
        AND r.def_norm LIKE '%invalid_request%'
        AND r.def_norm LIKE '%execution_failed%'
      WHEN 'deletion_requests_scope_target_matrix_check' THEN
        r.def_norm LIKE '%request_scope=''account_wide''%'
        AND r.def_norm LIKE '%target_scan_record_idisnull%'
        AND r.def_norm LIKE '%target_evidence_tableisnull%'
        AND r.def_norm LIKE '%target_evidence_idisnull%'
        AND r.def_norm LIKE '%request_scope=''scan_specific''%'
        AND r.def_norm LIKE '%target_scan_record_idisnotnull%'
        AND r.def_norm LIKE '%request_scope=''evidence_specific''%'
        AND r.def_norm LIKE '%target_evidence_tableisnotnull%'
        AND r.def_norm LIKE '%target_evidence_idisnotnull%'
      WHEN 'deletion_requests_evidence_table_whitelist_check' THEN
        r.def_norm LIKE '%target_evidence_tableisnull%'
        AND r.def_norm LIKE '%user_description_evidence%'
        AND r.def_norm LIKE '%image_evidence%'
        AND r.def_norm LIKE '%product_mention_evidence%'
        AND r.def_norm LIKE '%ai_analysis_evidence%'
      WHEN 'deletion_requests_timestamp_ordering_check' THEN
        r.def_norm LIKE '%validated_atisnullorrequested_at<=validated_at%'
        AND r.def_norm LIKE '%resolved_atisnullorrequested_at<=resolved_at%'
        AND r.def_norm LIKE '%validated_at<=resolved_at%'
      WHEN 'deletion_requests_received_resolved_at_null_check' THEN
        r.def_norm LIKE '%request_state<>''received''orresolved_atisnull%'
      WHEN 'deletion_requests_terminal_requires_resolved_at_check' THEN
        r.def_norm LIKE '%request_state=''received''orresolved_atisnotnull%'
      WHEN 'deletion_requests_executed_requires_validated_at_check' THEN
        r.def_norm LIKE '%request_state<>''executed''orvalidated_atisnotnull%'
      WHEN 'deletion_requests_created_requested_integrity_check' THEN
        r.def_norm LIKE '%requested_at<=created_at%'
      ELSE false
    END AS expr_ok
  FROM expected_req_checks e
  LEFT JOIN req_constraints r
    ON r.conname = e.conname AND r.contype = 'c'
),
a03 AS (
  SELECT
    'A-03-01'::text AS check_id,
    'constraint_inventory'::text AS verification_area,
    'P1'::text AS severity,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM req_constraints WHERE contype = 'c') = 12
          AND NOT EXISTS (
            SELECT 1 FROM expected_req_checks e
            LEFT JOIN req_constraints r ON r.conname = e.conname AND r.contype = 'c'
            WHERE r.conname IS NULL
          )
          AND NOT EXISTS (
            SELECT 1 FROM req_constraints r
            WHERE r.contype = 'c'
              AND NOT EXISTS (
                SELECT 1 FROM expected_req_checks e WHERE e.conname = r.conname
              )
          )
         THEN 'PASS' ELSE 'FAIL' END AS status,
    'exactly the 12 migration-named CHECK constraints on deletion_requests (no missing/extra names)'::text AS expected,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'table_absent'
         ELSE format('check_count=%s missing=%s unexpected=%s',
           (SELECT count(*) FROM req_constraints WHERE contype = 'c'),
           coalesce((SELECT string_agg(e.conname, ', ')
                       FROM expected_req_checks e
                       LEFT JOIN req_constraints r ON r.conname = e.conname AND r.contype = 'c'
                      WHERE r.conname IS NULL), '<none>'),
           coalesce((SELECT string_agg(r.conname, ', ')
                       FROM req_constraints r
                      WHERE r.contype = 'c'
                        AND NOT EXISTS (
                          SELECT 1 FROM expected_req_checks e WHERE e.conname = r.conname
                        )), '<none>'))
    END AS actual,
    'Name inventory exact-set reconciliation'::text AS details
  UNION ALL
  SELECT
    'A-03-02',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM check_expr_eval) = 12
          AND NOT EXISTS (SELECT 1 FROM check_expr_eval WHERE NOT coalesce(expr_ok, false))
         THEN 'PASS' ELSE 'FAIL' END,
    'all 12 named CHECK expressions match migration-grounded normalized semantics',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'table_absent'
         ELSE coalesce((SELECT string_agg(
                conname || '=' || CASE WHEN coalesce(expr_ok,false) THEN 'PASS' ELSE 'FAIL' END,
                ', ' ORDER BY conname) FROM check_expr_eval), 'absent')
    END,
    'Normalized whitespace/casts; IN and =ANY(ARRAY[]) treated as equivalent closed-set forms; not vocabulary-fragment-only'
  UNION ALL
  SELECT
    'A-03-03',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_user_email_nonempty_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_user_email_nonempty_check expression',
    coalesce((SELECT left(def, 200) FROM check_expr_eval
               WHERE conname = 'deletion_requests_user_email_nonempty_check'), 'absent'),
    'char_length(btrim(user_email)) > 0'
  UNION ALL
  SELECT
    'A-03-04',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_request_scope_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_request_scope_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_request_scope_check'), 'absent'),
    'Closed scope vocabulary'
  UNION ALL
  SELECT
    'A-03-05',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_request_state_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_request_state_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_request_state_check'), 'absent'),
    'Closed state vocabulary'
  UNION ALL
  SELECT
    'A-03-06',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_resolution_code_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_resolution_code_check expression',
    coalesce((SELECT left(def, 300) FROM check_expr_eval
               WHERE conname = 'deletion_requests_resolution_code_check'), 'absent'),
    'Null-or closed resolution vocabulary'
  UNION ALL
  SELECT
    'A-03-07',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_state_resolution_coupling_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_state_resolution_coupling_check expression',
    coalesce((SELECT left(def, 300) FROM check_expr_eval
               WHERE conname = 'deletion_requests_state_resolution_coupling_check'), 'absent'),
    'State/resolution coupling'
  UNION ALL
  SELECT
    'A-03-08',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_scope_target_matrix_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_scope_target_matrix_check expression',
    coalesce((SELECT left(def, 300) FROM check_expr_eval
               WHERE conname = 'deletion_requests_scope_target_matrix_check'), 'absent'),
    'Exact three-scope target matrix'
  UNION ALL
  SELECT
    'A-03-09',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_evidence_table_whitelist_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_evidence_table_whitelist_check expression',
    coalesce((SELECT left(def, 300) FROM check_expr_eval
               WHERE conname = 'deletion_requests_evidence_table_whitelist_check'), 'absent'),
    'Evidence table whitelist when present'
  UNION ALL
  SELECT
    'A-03-10',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_timestamp_ordering_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_timestamp_ordering_check expression',
    coalesce((SELECT left(def, 300) FROM check_expr_eval
               WHERE conname = 'deletion_requests_timestamp_ordering_check'), 'absent'),
    'Timestamp ordering'
  UNION ALL
  SELECT
    'A-03-11',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_received_resolved_at_null_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_received_resolved_at_null_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_received_resolved_at_null_check'), 'absent'),
    'received => resolved_at null'
  UNION ALL
  SELECT
    'A-03-12',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_terminal_requires_resolved_at_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_terminal_requires_resolved_at_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_terminal_requires_resolved_at_check'), 'absent'),
    'terminal => resolved_at non-null'
  UNION ALL
  SELECT
    'A-03-13',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_executed_requires_validated_at_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_executed_requires_validated_at_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_executed_requires_validated_at_check'), 'absent'),
    'executed => validated_at non-null'
  UNION ALL
  SELECT
    'A-03-14',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN coalesce((SELECT expr_ok FROM check_expr_eval
                         WHERE conname = 'deletion_requests_created_requested_integrity_check'), false)
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests_created_requested_integrity_check expression',
    coalesce((SELECT left(def, 240) FROM check_expr_eval
               WHERE conname = 'deletion_requests_created_requested_integrity_check'), 'absent'),
    'requested_at <= created_at'
  UNION ALL
  SELECT
    'A-03-15',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM req_constraints WHERE contype = 'p') = 1
          AND EXISTS (
            SELECT 1 FROM req_constraints
            WHERE contype = 'p' AND def LIKE '%PRIMARY KEY%' AND def LIKE '%id%'
          ) THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests PRIMARY KEY on id',
    coalesce((SELECT string_agg(conname || ':' || def, ' | ') FROM req_constraints WHERE contype = 'p'), 'absent'),
    'Primary key inventory'
  UNION ALL
  SELECT
    'A-03-16',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (SELECT 1 FROM req_constraints WHERE contype = 'f')
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_requests has zero foreign keys',
    format('fk_count=%s', (SELECT count(*) FROM req_constraints WHERE contype = 'f')),
    'Opaque target UUIDs; no lifecycle FKs'
  UNION ALL
  SELECT
    'A-03-17',
    'constraint_inventory',
    'P0',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1
           FROM exec_constraints ec
           JOIN pg_catalog.pg_class rc ON rc.oid = ec.confrelid
           JOIN pg_catalog.pg_namespace rn ON rn.oid = rc.relnamespace
           WHERE ec.conname = 'deletion_request_executions_deletion_request_id_fkey'
             AND ec.contype = 'f'
             AND rn.nspname = 'public'
             AND rc.relname = 'deletion_requests'
             AND ec.confdeltype = 'r'
             AND ec.confupdtype = 'a'
             AND ec.def LIKE '%deletion_request_id%'
             AND ec.def LIKE '%id%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'FK deletion_request_executions_deletion_request_id_fkey -> public.deletion_requests(id) ON DELETE RESTRICT; ON UPDATE NO ACTION',
    coalesce((SELECT format('def=%s del=%s upd=%s deferrable=%s deferred=%s',
                            def, confdeltype, confupdtype, condeferrable, condeferred)
                FROM exec_constraints
               WHERE conname = 'deletion_request_executions_deletion_request_id_fkey'), 'absent'),
    'confdeltype r=restrict; confupdtype a=no action (migration default)'
  UNION ALL
  SELECT
    'A-03-18',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM exec_constraints
           WHERE conname = 'deletion_request_executions_request_scan_unique'
             AND contype = 'u'
             AND def LIKE '%deletion_request_id%'
             AND def LIKE '%scan_record_id%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'UNIQUE (deletion_request_id, scan_record_id)',
    coalesce((SELECT def FROM exec_constraints WHERE conname = 'deletion_request_executions_request_scan_unique'), 'absent'),
    'Per-request session attribution uniqueness'
  UNION ALL
  SELECT
    'A-03-19',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM exec_constraints WHERE contype = 'p') = 1
         THEN 'PASS' ELSE 'FAIL' END,
    'deletion_request_executions PRIMARY KEY present',
    coalesce((SELECT string_agg(conname || ':' || def, ' | ') FROM exec_constraints WHERE contype = 'p'), 'absent'),
    'Primary key on id'
  UNION ALL
  SELECT
    'A-03-20',
    'constraint_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1
           FROM exec_constraints ec
           JOIN pg_catalog.pg_class rc ON rc.oid = ec.confrelid
           JOIN pg_catalog.pg_namespace rn ON rn.oid = rc.relnamespace
           WHERE ec.contype = 'f'
             AND NOT (rn.nspname = 'public' AND rc.relname = 'deletion_requests')
         ) THEN 'PASS' ELSE 'FAIL' END,
    'no lifecycle/evidence foreign keys on executions',
    format('non_request_fk_count=%s',
      (SELECT count(*)
         FROM exec_constraints ec
         JOIN pg_catalog.pg_class rc ON rc.oid = ec.confrelid
         JOIN pg_catalog.pg_namespace rn ON rn.oid = rc.relnamespace
        WHERE ec.contype = 'f'
          AND NOT (rn.nspname = 'public' AND rc.relname = 'deletion_requests'))),
    'scan_record_id must remain opaque uuid without lifecycle FK'
),
-- A-04 — Index inventory (Slice-owned indexes only)
expected_indexes AS (
  SELECT * FROM (VALUES
    ('deletion_requests_user_email_requested_at_idx', 'deletion_requests', false),
    ('deletion_requests_request_state_requested_at_idx', 'deletion_requests', false),
    ('deletion_requests_target_scan_record_id_idx', 'deletion_requests', false),
    ('deletion_requests_target_evidence_idx', 'deletion_requests', false),
    ('deletion_request_executions_scan_record_id_idx', 'deletion_request_executions', false)
  ) AS v(idxname, tbl, is_unique)
),
slice_indexes AS (
  SELECT
    i.relname AS idxname,
    t.relname AS tbl,
    ix.indisunique AS is_unique,
    pg_catalog.pg_get_indexdef(i.oid) AS idxdef
  FROM pg_catalog.pg_index ix
  JOIN pg_catalog.pg_class i ON i.oid = ix.indexrelid
  JOIN pg_catalog.pg_class t ON t.oid = ix.indrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
  WHERE n.nspname = 'public'
    AND t.relname IN ('deletion_requests', 'deletion_request_executions')
    AND i.relname IN (
      'deletion_requests_user_email_requested_at_idx',
      'deletion_requests_request_state_requested_at_idx',
      'deletion_requests_target_scan_record_id_idx',
      'deletion_requests_target_evidence_idx',
      'deletion_request_executions_scan_record_id_idx'
    )
),
a04 AS (
  SELECT
    'A-04-01'::text AS check_id,
    'index_inventory'::text AS verification_area,
    'P1'::text AS severity,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM slice_indexes) = 5
          AND NOT EXISTS (
            SELECT 1 FROM expected_indexes e
            LEFT JOIN slice_indexes s ON s.idxname = e.idxname
            WHERE s.idxname IS NULL
          )
         THEN 'PASS' ELSE 'FAIL' END AS status,
    'exactly 5 Slice-owned indexes present by name'::text AS expected,
    format('found=%s missing=%s',
      (SELECT count(*) FROM slice_indexes),
      coalesce((SELECT string_agg(e.idxname, ', ')
                  FROM expected_indexes e
                  LEFT JOIN slice_indexes s ON s.idxname = e.idxname
                 WHERE s.idxname IS NULL), '<none>')) AS actual,
    'Does not reject unrelated pre-existing indexes outside this name set'::text AS details
  UNION ALL
  SELECT
    'A-04-02',
    'index_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM slice_indexes
           WHERE idxname = 'deletion_requests_user_email_requested_at_idx'
             AND idxdef LIKE '%user_email%'
             AND idxdef LIKE '%requested_at%DESC%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'user_email, requested_at DESC',
    coalesce((SELECT idxdef FROM slice_indexes WHERE idxname = 'deletion_requests_user_email_requested_at_idx'), 'absent'),
    'Ownership/recency index'
  UNION ALL
  SELECT
    'A-04-03',
    'index_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM slice_indexes
           WHERE idxname = 'deletion_requests_request_state_requested_at_idx'
             AND idxdef LIKE '%request_state%'
             AND idxdef LIKE '%requested_at%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'request_state, requested_at ASC',
    coalesce((SELECT idxdef FROM slice_indexes WHERE idxname = 'deletion_requests_request_state_requested_at_idx'), 'absent'),
    'Workflow-state index'
  UNION ALL
  SELECT
    'A-04-04',
    'index_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM slice_indexes
           WHERE idxname = 'deletion_requests_target_scan_record_id_idx'
             AND idxdef LIKE '%target_scan_record_id%'
             AND idxdef LIKE '%WHERE%target_scan_record_id%IS NOT NULL%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'partial index on target_scan_record_id IS NOT NULL',
    coalesce((SELECT idxdef FROM slice_indexes WHERE idxname = 'deletion_requests_target_scan_record_id_idx'), 'absent'),
    'Session target lookup'
  UNION ALL
  SELECT
    'A-04-05',
    'index_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM slice_indexes
           WHERE idxname = 'deletion_requests_target_evidence_idx'
             AND idxdef LIKE '%target_evidence_table%'
             AND idxdef LIKE '%target_evidence_id%'
             AND idxdef LIKE '%WHERE%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'partial composite evidence target index',
    coalesce((SELECT idxdef FROM slice_indexes WHERE idxname = 'deletion_requests_target_evidence_idx'), 'absent'),
    'Evidence target lookup'
  UNION ALL
  SELECT
    'A-04-06',
    'index_inventory',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM slice_indexes
           WHERE idxname = 'deletion_request_executions_scan_record_id_idx'
             AND idxdef LIKE '%scan_record_id%'
             AND idxdef NOT LIKE '%WHERE%'
         ) THEN 'PASS' ELSE 'FAIL' END,
    'non-partial index on deletion_request_executions(scan_record_id)',
    coalesce((SELECT idxdef FROM slice_indexes WHERE idxname = 'deletion_request_executions_scan_record_id_idx'), 'absent'),
    'Reverse lookup index; standalone deletion_request_id index intentionally omitted'
),
-- A-05 — Function inventory and security posture
fn_meta AS (
  SELECT
    n.nspname AS schema_name,
    p.proname,
    pg_catalog.pg_get_function_identity_arguments(p.oid) AS args,
    pg_catalog.pg_get_function_result(p.oid) AS result_type,
    l.lanname AS language,
    CASE p.provolatile WHEN 'i' THEN 'IMMUTABLE' WHEN 's' THEN 'STABLE' WHEN 'v' THEN 'VOLATILE' END AS volatility,
    p.proisstrict AS is_strict,
    p.prosecdef AS is_security_definer,
    coalesce(array_to_string(p.proconfig, ','), '') AS proconfig,
    pg_catalog.pg_get_userbyid(p.proowner) AS owner
  FROM pg_catalog.pg_proc p
  JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
  JOIN pg_catalog.pg_language l ON l.oid = p.prolang
  WHERE n.nspname = 'public'
    AND p.proname IN (
      'enforce_deletion_request_transition',
      'enforce_deletion_request_execution_consistency'
    )
    AND pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
),
fn_exec AS (
  SELECT
    r.proname,
    EXISTS (
      SELECT 1
      FROM pg_catalog.pg_proc p
      JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
      CROSS JOIN LATERAL pg_catalog.aclexplode(
        coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
      ) acl
      WHERE n.nspname = 'public'
        AND p.proname = r.proname
        AND pg_catalog.pg_get_function_identity_arguments(p.oid) = ''
        AND acl.grantee = 0
        AND acl.privilege_type = 'EXECUTE'
    ) AS public_execute,
    CASE WHEN to_regprocedure('public.' || r.proname || '()') IS NOT NULL
         THEN has_function_privilege('anon', 'public.' || r.proname || '()', 'EXECUTE')
         ELSE false END AS anon_execute,
    CASE WHEN to_regprocedure('public.' || r.proname || '()') IS NOT NULL
         THEN has_function_privilege('authenticated', 'public.' || r.proname || '()', 'EXECUTE')
         ELSE false END AS authenticated_execute,
    CASE WHEN to_regprocedure('public.' || r.proname || '()') IS NOT NULL
         THEN has_function_privilege('service_role', 'public.' || r.proname || '()', 'EXECUTE')
         ELSE false END AS service_role_execute
  FROM (VALUES
    ('enforce_deletion_request_transition'),
    ('enforce_deletion_request_execution_consistency')
  ) AS r(proname)
  WHERE to_regprocedure('public.' || r.proname || '()') IS NOT NULL
),
a05 AS (
  SELECT
    'A-05-01'::text AS check_id,
    'function_inventory'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN (SELECT count(*) FROM fn_meta) = 2 THEN 'PASS' ELSE 'FAIL' END AS status,
    'both guard functions present with zero-arg signatures'::text AS expected,
    format('found=%s names=%s',
      (SELECT count(*) FROM fn_meta),
      coalesce((SELECT string_agg(proname, ', ' ORDER BY proname) FROM fn_meta), '<none>')) AS actual,
    'public.enforce_deletion_request_transition() and public.enforce_deletion_request_execution_consistency()'::text AS details
  UNION ALL
  SELECT
    'A-05-02',
    'function_inventory',
    'P1',
    CASE WHEN COUNT(*) FILTER (
           WHERE result_type = 'trigger'
             AND language = 'plpgsql'
             AND volatility = 'VOLATILE'
             AND is_strict = false
             AND proconfig LIKE '%search_path=pg_catalog, public%'
         ) = 2
         AND (SELECT count(*) FROM fn_meta) = 2
         THEN 'PASS' ELSE 'FAIL' END,
    'both functions: returns trigger, plpgsql, VOLATILE, not STRICT, search_path=pg_catalog, public',
    coalesce((SELECT string_agg(
               format('%s ret=%s lang=%s vol=%s strict=%s config=%s',
                      proname, result_type, language, volatility, is_strict, proconfig),
               ' | ' ORDER BY proname) FROM fn_meta), 'absent'),
    'Exact migration posture'
  FROM fn_meta
  UNION ALL
  SELECT
    'A-05-03',
    'function_security',
    'P0',
    CASE WHEN (SELECT count(*) FROM fn_meta) = 2
          AND NOT EXISTS (SELECT 1 FROM fn_meta WHERE is_security_definer)
         THEN 'PASS' ELSE 'FAIL' END,
    'neither function is SECURITY DEFINER (prosecdef=false)',
    coalesce((SELECT string_agg(proname || '=' || is_security_definer::text, ', ')
                FROM fn_meta), 'absent'),
    'SECURITY INVOKER required'
  UNION ALL
  SELECT
    'A-05-04',
    'function_privileges',
    'P0',
    CASE WHEN (SELECT count(*) FROM fn_exec) = 2
          AND NOT EXISTS (
            SELECT 1 FROM fn_exec
            WHERE public_execute OR anon_execute OR authenticated_execute OR NOT service_role_execute
          )
         THEN 'PASS' ELSE 'FAIL' END,
    'EXECUTE: service_role=true; PUBLIC/anon/authenticated=false for both functions',
    coalesce((SELECT string_agg(
               format('%s public=%s anon=%s auth=%s service=%s',
                      proname, public_execute, anon_execute, authenticated_execute, service_role_execute),
               ' | ') FROM fn_exec), 'absent'),
    'Migration grant matrix for guard functions'
  UNION ALL
  SELECT
    'A-05-05',
    'function_inventory',
    'P2',
    'INFO',
    'owner identity reported for DEV environment dependence',
    coalesce((SELECT string_agg(proname || ' owner=' || owner, ' | ' ORDER BY proname) FROM fn_meta), 'absent'),
    'Owner is environment-dependent; reported as INFO, not a hard role equality FAIL'
),
-- A-06 — Trigger inventory
trig_meta AS (
  SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    t.tgname,
    t.tgconstraint <> 0 AS is_constraint_trigger,
    CASE WHEN (t.tgtype & 2) = 2 THEN 'BEFORE' ELSE 'AFTER' END AS timing,
    CASE WHEN (t.tgtype & 1) = 1 THEN 'ROW' ELSE 'STATEMENT' END AS granularity,
    ((t.tgtype & 4)  = 4)  AS fires_insert,
    ((t.tgtype & 8)  = 8)  AS fires_delete,
    ((t.tgtype & 16) = 16) AS fires_update,
    p.proname AS function_name,
    NOT t.tgenabled = 'D' AS is_enabled,
    t.tgdeferrable AS is_deferrable,
    t.tginitdeferred AS initially_deferred
  FROM pg_catalog.pg_trigger t
  JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  JOIN pg_catalog.pg_proc p ON p.oid = t.tgfoid
  WHERE NOT t.tgisinternal
    AND n.nspname = 'public'
    AND c.relname IN ('deletion_requests', 'deletion_request_executions')
    AND t.tgname IN (
      'trg_deletion_requests_transition_guard',
      'trg_deletion_requests_execution_consistency',
      'trg_deletion_request_executions_execution_consistency'
    )
),
a06 AS (
  SELECT
    'A-06-01'::text AS check_id,
    'trigger_inventory'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN (SELECT count(*) FROM trig_meta) = 3 THEN 'PASS' ELSE 'FAIL' END AS status,
    'exactly three Slice triggers present'::text AS expected,
    format('found=%s', (SELECT count(*) FROM trig_meta)) AS actual,
    coalesce((SELECT string_agg(tgname, ', ' ORDER BY tgname) FROM trig_meta), '<none>') AS details
  UNION ALL
  SELECT
    'A-06-02',
    'trigger_inventory',
    'P0',
    CASE WHEN EXISTS (
           SELECT 1 FROM trig_meta
           WHERE tgname = 'trg_deletion_requests_transition_guard'
             AND table_name = 'deletion_requests'
             AND NOT is_constraint_trigger
             AND timing = 'BEFORE'
             AND fires_insert AND fires_update AND NOT fires_delete
             AND granularity = 'ROW'
             AND function_name = 'enforce_deletion_request_transition'
             AND is_enabled
             AND NOT is_deferrable
             AND NOT initially_deferred
         ) THEN 'PASS' ELSE 'FAIL' END,
    'transition guard: BEFORE INSERT OR UPDATE ROW, ordinary trigger, enabled, not deferred',
    coalesce((SELECT format('tbl=%s constr=%s timing=%s I/U/D=%s/%s/%s gran=%s fn=%s en=%s def=%s initdef=%s',
                            table_name, is_constraint_trigger, timing,
                            fires_insert, fires_update, fires_delete, granularity,
                            function_name, is_enabled, is_deferrable, initially_deferred)
                FROM trig_meta WHERE tgname = 'trg_deletion_requests_transition_guard'), 'absent'),
    'Transition guard exact posture'
  UNION ALL
  SELECT
    'A-06-03',
    'trigger_inventory',
    'P0',
    CASE WHEN EXISTS (
           SELECT 1 FROM trig_meta
           WHERE tgname = 'trg_deletion_requests_execution_consistency'
             AND table_name = 'deletion_requests'
             AND is_constraint_trigger
             AND timing = 'AFTER'
             AND fires_insert AND fires_update AND fires_delete
             AND granularity = 'ROW'
             AND function_name = 'enforce_deletion_request_execution_consistency'
             AND is_enabled
             AND is_deferrable
             AND initially_deferred
         ) THEN 'PASS' ELSE 'FAIL' END,
    'requests deferred constraint trigger: AFTER INSERT OR UPDATE OR DELETE, DEFERRABLE INITIALLY DEFERRED',
    coalesce((SELECT format('tbl=%s constr=%s timing=%s I/U/D=%s/%s/%s gran=%s fn=%s en=%s def=%s initdef=%s',
                            table_name, is_constraint_trigger, timing,
                            fires_insert, fires_update, fires_delete, granularity,
                            function_name, is_enabled, is_deferrable, initially_deferred)
                FROM trig_meta WHERE tgname = 'trg_deletion_requests_execution_consistency'), 'absent'),
    'Deferred consistency on deletion_requests'
  UNION ALL
  SELECT
    'A-06-04',
    'trigger_inventory',
    'P0',
    CASE WHEN EXISTS (
           SELECT 1 FROM trig_meta
           WHERE tgname = 'trg_deletion_request_executions_execution_consistency'
             AND table_name = 'deletion_request_executions'
             AND is_constraint_trigger
             AND timing = 'AFTER'
             AND fires_insert AND fires_delete AND NOT fires_update
             AND granularity = 'ROW'
             AND function_name = 'enforce_deletion_request_execution_consistency'
             AND is_enabled
             AND is_deferrable
             AND initially_deferred
         ) THEN 'PASS' ELSE 'FAIL' END,
    'executions deferred constraint trigger: AFTER INSERT OR DELETE only (no UPDATE), DEFERRABLE INITIALLY DEFERRED',
    coalesce((SELECT format('tbl=%s constr=%s timing=%s I/U/D=%s/%s/%s gran=%s fn=%s en=%s def=%s initdef=%s',
                            table_name, is_constraint_trigger, timing,
                            fires_insert, fires_update, fires_delete, granularity,
                            function_name, is_enabled, is_deferrable, initially_deferred)
                FROM trig_meta WHERE tgname = 'trg_deletion_request_executions_execution_consistency'), 'absent'),
    'Append-only executions trigger coverage'
),
-- A-07 — RLS verification
pol_meta AS (
  SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    p.polname,
    CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
    END AS command,
    p.polpermissive AS is_permissive,
    coalesce((SELECT string_agg(pr.rolname, ',' ORDER BY pr.rolname)
                FROM pg_catalog.pg_authid pr
               WHERE pr.oid = ANY (p.polroles)), 'PUBLIC') AS roles,
    pg_catalog.pg_get_expr(p.polqual, p.polrelid) AS using_expr,
    pg_catalog.pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr
  FROM pg_catalog.pg_policy p
  JOIN pg_catalog.pg_class c ON c.oid = p.polrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN ('deletion_requests', 'deletion_request_executions')
),
rls_meta AS (
  SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname IN ('deletion_requests', 'deletion_request_executions')
),
a07 AS (
  SELECT
    'A-07-01'::text AS check_id,
    'rls'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN (SELECT count(*) FROM rls_meta WHERE relrowsecurity) = 2 THEN 'PASS' ELSE 'FAIL' END AS status,
    'RLS enabled on both new tables'::text AS expected,
    coalesce((SELECT string_agg(relname || '=relrowsecurity:' || relrowsecurity::text, ', ' ORDER BY relname)
                FROM rls_meta), 'absent') AS actual,
    'FORCE RLS not required by migration; reported for observation'::text AS details
  UNION ALL
  SELECT
    'A-07-02',
    'rls',
    'P0',
    CASE WHEN (SELECT count(*) FROM pol_meta WHERE table_name = 'deletion_requests') = 1
          AND (SELECT count(*) FROM pol_meta WHERE table_name = 'deletion_request_executions') = 0
         THEN 'PASS' ELSE 'FAIL' END,
    'exactly one policy on deletion_requests; zero policies on deletion_request_executions',
    format('req_policies=%s exec_policies=%s',
      (SELECT count(*) FROM pol_meta WHERE table_name = 'deletion_requests'),
      (SELECT count(*) FROM pol_meta WHERE table_name = 'deletion_request_executions')),
    'Policy count contract'
  UNION ALL
  SELECT
    'A-07-03',
    'rls',
    'P0',
    CASE WHEN EXISTS (
           SELECT 1 FROM pol_meta
           WHERE table_name = 'deletion_requests'
             AND polname = 'Users can read own deletion requests'
             AND command = 'SELECT'
             AND roles = 'authenticated'
             AND is_permissive
             AND with_check_expr IS NULL
             AND (
               using_expr = 'lower(user_email) = lower((auth.jwt() ->> ''email''::text))'
               OR using_expr = 'lower(user_email) = lower((auth.jwt() ->> ''email''))'
               OR using_expr = 'lower(user_email) = lower(auth.jwt() ->> ''email'')'
             )
         ) THEN 'PASS' ELSE 'FAIL' END,
    'policy "Users can read own deletion requests": SELECT TO authenticated; permissive; ownership USING equality predicate mandatory (lower(user_email) = lower(auth.jwt() ->> ''email'') or harmlessly normalized equivalent); no WITH CHECK; token-only semantic fallback prohibited',
    coalesce((SELECT format('name=%s cmd=%s roles=%s permissive=%s using=%s with_check=%s',
                            polname, command, roles, is_permissive, using_expr, coalesce(with_check_expr,'<none>'))
                FROM pol_meta
               WHERE table_name = 'deletion_requests'
                 AND polname = 'Users can read own deletion requests'), 'absent'),
    'Binding P0: equality ownership predicate mandatory via exact or harmlessly normalized equality forms only; token-only semantic fallback prohibited; authenticated ownership predicate not weakened'
  UNION ALL
  SELECT
    'A-07-04',
    'rls',
    'P2',
    'INFO',
    'exact textual USING representation (observational; cannot fail Block A)',
    coalesce((SELECT format('exact_match=%s using=%s',
        (using_expr = 'lower(user_email) = lower((auth.jwt() ->> ''email''::text))'
         OR using_expr = 'lower(user_email) = lower((auth.jwt() ->> ''email''))'
         OR using_expr = 'lower(user_email) = lower(auth.jwt() ->> ''email'')'),
        using_expr)
      FROM pol_meta
     WHERE polname = 'Users can read own deletion requests'), 'absent'),
    'INFO exact-text evidence only; pg_get_expr formatting drift must not fail Block A when A-07-03 semantic contract passes'
),
-- A-08 — Table privileges
-- Table-level ACL only via pg_catalog.aclexplode(relacl).
-- has_table_privilege(INSERT|UPDATE) is NOT used for absence proofs because
-- column-level INSERT/UPDATE grants make those helpers return true.
tbl_acl AS (
  SELECT
    c.relname AS rel,
    CASE
      WHEN acl.grantee = 0 THEN 'PUBLIC'
      ELSE pg_catalog.pg_get_userbyid(acl.grantee)
    END AS role_name,
    acl.privilege_type
  FROM pg_catalog.pg_class c
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  CROSS JOIN LATERAL pg_catalog.aclexplode(
    coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
  ) acl
  WHERE n.nspname = 'public'
    AND c.relname IN ('deletion_requests', 'deletion_request_executions')
),
tbl_priv AS (
  SELECT
    t.rel,
    r.role_name,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'SELECT'
    ) AS has_table_select,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'INSERT'
    ) AS has_table_insert,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'UPDATE'
    ) AS has_table_update,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'DELETE'
    ) AS has_table_delete,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'TRUNCATE'
    ) AS has_table_truncate,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'REFERENCES'
    ) AS has_table_references,
    EXISTS (
      SELECT 1 FROM tbl_acl a
      WHERE a.rel = t.rel AND a.role_name = r.role_name AND a.privilege_type = 'TRIGGER'
    ) AS has_table_trigger
  FROM (VALUES
    ('deletion_requests'),
    ('deletion_request_executions')
  ) AS t(rel)
  CROSS JOIN (VALUES
    ('PUBLIC'),
    ('anon'),
    ('authenticated'),
    ('service_role')
  ) AS r(role_name)
  WHERE to_regclass('public.' || t.rel) IS NOT NULL
),
a08 AS (
  SELECT
    'A-08-01'::text AS check_id,
    'table_privileges'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_requests' AND role_name = 'authenticated'
             AND has_table_select AND NOT has_table_insert AND NOT has_table_update
             AND NOT has_table_delete AND NOT has_table_truncate
             AND NOT has_table_references AND NOT has_table_trigger
         ) THEN 'PASS' ELSE 'FAIL' END AS status,
    'authenticated: table SELECT only on deletion_requests'::text AS expected,
    coalesce((SELECT format('table S/I/U/D/T/R/Trig=%s/%s/%s/%s/%s/%s/%s',
                            has_table_select, has_table_insert, has_table_update, has_table_delete,
                            has_table_truncate, has_table_references, has_table_trigger)
                FROM tbl_priv WHERE rel = 'deletion_requests' AND role_name = 'authenticated'),
             'absent') AS actual,
    'Table ACL via aclexplode; RLS does not replace privilege checks'::text AS details
  UNION ALL
  SELECT
    'A-08-02',
    'table_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_requests' AND role_name = 'service_role'
             AND has_table_select
             AND NOT has_table_insert
             AND NOT has_table_update
             AND NOT has_table_delete
             AND NOT has_table_truncate
             AND NOT has_table_references
             AND NOT has_table_trigger
         ) THEN 'PASS' ELSE 'FAIL' END,
    'service_role: table SELECT only on deletion_requests (no table-level INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER ACL)',
    coalesce((SELECT format('table S/I/U/D/T/R/Trig=%s/%s/%s/%s/%s/%s/%s',
                            has_table_select, has_table_insert, has_table_update, has_table_delete,
                            has_table_truncate, has_table_references, has_table_trigger)
                FROM tbl_priv WHERE rel = 'deletion_requests' AND role_name = 'service_role'),
             'absent'),
    'Column-level INSERT/UPDATE are verified in A-09 and must not be treated as table-level grants'
  UNION ALL
  SELECT
    'A-08-03',
    'table_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_request_executions' AND role_name = 'service_role'
             AND has_table_select
             AND NOT has_table_insert
             AND NOT has_table_update
             AND NOT has_table_delete
             AND NOT has_table_truncate
             AND NOT has_table_references
             AND NOT has_table_trigger
         ) THEN 'PASS' ELSE 'FAIL' END,
    'service_role: table SELECT only on deletion_request_executions (no table-level INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER ACL)',
    coalesce((SELECT format('table S/I/U/D/T/R/Trig=%s/%s/%s/%s/%s/%s/%s',
                            has_table_select, has_table_insert, has_table_update, has_table_delete,
                            has_table_truncate, has_table_references, has_table_trigger)
                FROM tbl_priv WHERE rel = 'deletion_request_executions' AND role_name = 'service_role'),
             'absent'),
    'Column-level INSERT verified in A-09; approved column grants must not false-FAIL table ACL checks'
  UNION ALL
  SELECT
    'A-08-04',
    'table_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE role_name IN ('PUBLIC','anon')
             AND (has_table_select OR has_table_insert OR has_table_update OR has_table_delete
                  OR has_table_truncate OR has_table_references OR has_table_trigger)
         )
         AND NOT EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_request_executions'
             AND role_name = 'authenticated'
             AND (has_table_select OR has_table_insert OR has_table_update OR has_table_delete
                  OR has_table_truncate OR has_table_references OR has_table_trigger)
         )
         THEN 'PASS' ELSE 'FAIL' END,
    'PUBLIC/anon: no table ACL privileges on either table; authenticated: none on executions',
    coalesce((SELECT string_agg(
               format('%s.%s S/I/U/D=%s/%s/%s/%s', rel, role_name,
                      has_table_select, has_table_insert, has_table_update, has_table_delete),
               ' | ')
               FROM tbl_priv
              WHERE role_name IN ('PUBLIC','anon')
                 OR (rel = 'deletion_request_executions' AND role_name = 'authenticated')),
             'absent'),
    'Unauthorized table privilege absence; PUBLIC/anon/authenticated checks not weakened'
),
-- A-09 — Column privileges
col_ins_req AS (
  SELECT a.attname
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_requests'
    AND a.attnum > 0 AND NOT a.attisdropped
    AND has_column_privilege('service_role', c.oid, a.attname, 'INSERT')
),
col_upd_req AS (
  SELECT a.attname
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_requests'
    AND a.attnum > 0 AND NOT a.attisdropped
    AND has_column_privilege('service_role', c.oid, a.attname, 'UPDATE')
),
col_ins_exec AS (
  SELECT a.attname
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
  JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'deletion_request_executions'
    AND a.attnum > 0 AND NOT a.attisdropped
    AND has_column_privilege('service_role', c.oid, a.attname, 'INSERT')
),
a09 AS (
  SELECT
    'A-09-01'::text AS check_id,
    'column_privileges'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM col_ins_req) = 5
          AND NOT EXISTS (
            SELECT unnest(ARRAY[
              'user_email','request_scope','target_scan_record_id',
              'target_evidence_table','target_evidence_id'
            ])
            EXCEPT SELECT attname FROM col_ins_req
          )
          AND NOT EXISTS (
            SELECT attname FROM col_ins_req
            EXCEPT SELECT unnest(ARRAY[
              'user_email','request_scope','target_scan_record_id',
              'target_evidence_table','target_evidence_id'
            ])
          )
         THEN 'PASS' ELSE 'FAIL' END AS status,
    'service_role INSERT columns on deletion_requests: user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id'::text AS expected,
    coalesce((SELECT string_agg(attname, ', ' ORDER BY attname) FROM col_ins_req), '<none>') AS actual,
    'Exact approved intake columns'::text AS details
  UNION ALL
  SELECT
    'A-09-02',
    'column_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM col_upd_req) = 4
          AND NOT EXISTS (
            SELECT unnest(ARRAY['request_state','resolution_code','validated_at','resolved_at'])
            EXCEPT SELECT attname FROM col_upd_req
          )
          AND NOT EXISTS (
            SELECT attname FROM col_upd_req
            EXCEPT SELECT unnest(ARRAY['request_state','resolution_code','validated_at','resolved_at'])
          )
         THEN 'PASS' ELSE 'FAIL' END,
    'service_role UPDATE columns on deletion_requests: request_state, resolution_code, validated_at, resolved_at',
    coalesce((SELECT string_agg(attname, ', ' ORDER BY attname) FROM col_upd_req), '<none>'),
    'Exact approved workflow columns'
  UNION ALL
  SELECT
    'A-09-03',
    'column_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1 FROM col_ins_req
           WHERE attname IN ('id','request_state','resolution_code','requested_at','validated_at','resolved_at','created_at')
         ) THEN 'PASS' ELSE 'FAIL' END,
    'service_role has no INSERT on denied deletion_requests columns',
    coalesce((SELECT string_agg(attname, ', ') FROM col_ins_req
               WHERE attname IN ('id','request_state','resolution_code','requested_at','validated_at','resolved_at','created_at')),
             '<none>'),
    'Denied: id, request_state, resolution_code, requested_at, validated_at, resolved_at, created_at'
  UNION ALL
  SELECT
    'A-09-04',
    'column_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN (SELECT count(*) FROM col_ins_exec) = 2
          AND NOT EXISTS (
            SELECT unnest(ARRAY['deletion_request_id','scan_record_id'])
            EXCEPT SELECT attname FROM col_ins_exec
          )
          AND NOT EXISTS (
            SELECT attname FROM col_ins_exec
            EXCEPT SELECT unnest(ARRAY['deletion_request_id','scan_record_id'])
          )
         THEN 'PASS' ELSE 'FAIL' END,
    'service_role INSERT columns on executions: deletion_request_id, scan_record_id',
    coalesce((SELECT string_agg(attname, ', ' ORDER BY attname) FROM col_ins_exec), '<none>'),
    'Exact approved attribution columns'
  UNION ALL
  SELECT
    'A-09-05',
    'column_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1 FROM col_ins_exec WHERE attname IN ('id','executed_at','created_at')
         ) THEN 'PASS' ELSE 'FAIL' END,
    'service_role has no INSERT on denied executions columns id/executed_at/created_at',
    coalesce((SELECT string_agg(attname, ', ') FROM col_ins_exec
               WHERE attname IN ('id','executed_at','created_at')), '<none>'),
    'Database-controlled columns remain unprivileged for explicit caller INSERT'
  UNION ALL
  SELECT
    'A-09-06',
    'column_privileges',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1
           FROM pg_catalog.pg_attribute a
           JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
           JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
           WHERE n.nspname = 'public'
             AND c.relname IN ('deletion_requests','deletion_request_executions')
             AND a.attnum > 0 AND NOT a.attisdropped
             AND (
               has_column_privilege('authenticated', c.oid, a.attname, 'INSERT')
               OR has_column_privilege('authenticated', c.oid, a.attname, 'UPDATE')
               OR has_column_privilege('anon', c.oid, a.attname, 'INSERT')
               OR has_column_privilege('anon', c.oid, a.attname, 'UPDATE')
             )
         )
         AND NOT EXISTS (
           SELECT 1
           FROM pg_catalog.pg_class c
           JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
           CROSS JOIN LATERAL pg_catalog.aclexplode(
             coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
           ) acl
           WHERE n.nspname = 'public'
             AND c.relname IN ('deletion_requests','deletion_request_executions')
             AND acl.grantee = 0
             AND acl.privilege_type IN ('INSERT','UPDATE')
         )
         THEN 'PASS' ELSE 'FAIL' END,
    'authenticated/anon/PUBLIC have no column or table INSERT/UPDATE on either table',
    'scanned',
    'Client-facing roles and PUBLIC must not hold write grants'
),
-- A-10 — Comments and governance metadata
a10 AS (
  SELECT
    'A-10-01'::text AS check_id,
    'comments'::text AS verification_area,
    'P1'::text AS severity,
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN obj_description('public.deletion_requests'::regclass, 'pg_class') LIKE 'Phase 2 Slice 2 deletion-request governance record%'
         THEN 'PASS' ELSE 'FAIL' END AS status,
    'table comment on public.deletion_requests present with migration governance text'::text AS expected,
    left(coalesce(obj_description('public.deletion_requests'::regclass, 'pg_class'), '<none>'), 160) AS actual,
    'Comment presence/governance meaning'::text AS details
  UNION ALL
  SELECT
    'A-10-02',
    'comments',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN obj_description('public.deletion_request_executions'::regclass, 'pg_class') LIKE 'Phase 2 Slice 2 append-only execution attribution%'
         THEN 'PASS' ELSE 'FAIL' END,
    'table comment on public.deletion_request_executions present',
    left(coalesce(obj_description('public.deletion_request_executions'::regclass, 'pg_class'), '<none>'), 160),
    'Comment presence/governance meaning'
  UNION ALL
  SELECT
    'A-10-03',
    'comments',
    'P1',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN (
           SELECT count(*) FROM (VALUES
             ('request_state'),('resolution_code'),('target_scan_record_id'),
             ('target_evidence_table'),('target_evidence_id'),('validated_at')
           ) AS v(col)
           WHERE coalesce(col_description('public.deletion_requests'::regclass,
                   (SELECT a.attnum FROM pg_catalog.pg_attribute a
                     WHERE a.attrelid = 'public.deletion_requests'::regclass
                       AND a.attname = v.col)), '') <> ''
         ) = 6 THEN 'PASS' ELSE 'FAIL' END,
    'comments on six migration-commented deletion_requests columns',
    'request_state,resolution_code,target_scan_record_id,target_evidence_table,target_evidence_id,validated_at',
    'Do not invent comments for uncommented columns'
  UNION ALL
  SELECT
    'A-10-04',
    'comments',
    'P1',
    CASE WHEN to_regclass('public.deletion_request_executions') IS NULL THEN 'NOT_RUN'
         WHEN coalesce(col_description('public.deletion_request_executions'::regclass,
                (SELECT attnum FROM pg_catalog.pg_attribute
                  WHERE attrelid = 'public.deletion_request_executions'::regclass
                    AND attname = 'deletion_request_id')), '') <> ''
          AND coalesce(col_description('public.deletion_request_executions'::regclass,
                (SELECT attnum FROM pg_catalog.pg_attribute
                  WHERE attrelid = 'public.deletion_request_executions'::regclass
                    AND attname = 'scan_record_id')), '') <> ''
         THEN 'PASS' ELSE 'FAIL' END,
    'comments on deletion_request_id and scan_record_id',
    'checked',
    'Migration-commented execution columns only'
  UNION ALL
  SELECT
    'A-10-05',
    'comments',
    'P1',
    CASE WHEN to_regprocedure('public.enforce_deletion_request_transition()') IS NULL THEN 'NOT_RUN'
         WHEN obj_description('public.enforce_deletion_request_transition()'::regprocedure, 'pg_proc')
              LIKE 'Phase 2 Slice 2 non-SECURITY DEFINER transition guard%'
          AND obj_description('public.enforce_deletion_request_execution_consistency()'::regprocedure, 'pg_proc')
              LIKE 'Phase 2 Slice 2 non-SECURITY DEFINER deferred cross-table consistency guard%'
         THEN 'PASS' ELSE 'FAIL' END,
    'comments on both guard functions',
    'checked',
    'Function governance comments'
),
-- A-11 — Static security and scope posture
a11 AS (
  SELECT
    'A-11-01'::text AS check_id,
    'static_security'::text AS verification_area,
    'P0'::text AS severity,
    CASE WHEN NOT EXISTS (
           SELECT 1 FROM pg_catalog.pg_proc p
           JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public'
             AND p.proname IN (
               'enforce_deletion_request_transition',
               'enforce_deletion_request_execution_consistency'
             )
             AND p.prosecdef
         ) THEN 'PASS' ELSE 'FAIL' END AS status,
    'no SECURITY DEFINER on Slice guard functions'::text AS expected,
    'prosecdef scan complete'::text AS actual,
    'Explicit security posture'::text AS details
  UNION ALL
  SELECT
    'A-11-02',
    'static_security',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE role_name IN ('PUBLIC','anon')
             AND (has_table_select OR has_table_insert OR has_table_update OR has_table_delete)
         ) THEN 'PASS' ELSE 'FAIL' END,
    'no broad PUBLIC/anon table ACL access',
    'scanned',
    'Least-privilege posture via table ACL'
  UNION ALL
  SELECT
    'A-11-03',
    'static_security',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_requests' AND role_name = 'authenticated'
             AND has_table_select AND NOT has_table_insert AND NOT has_table_update
             AND NOT has_table_delete
         ) THEN 'PASS' ELSE 'FAIL' END,
    'authenticated has no table-level write ACL on deletion_requests',
    'scanned',
    'SELECT-only client posture'
  UNION ALL
  SELECT
    'A-11-04',
    'static_security',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_requests' AND role_name = 'service_role'
             AND NOT has_table_insert AND NOT has_table_update AND NOT has_table_delete
         )
         AND EXISTS (
           SELECT 1 FROM tbl_priv
           WHERE rel = 'deletion_request_executions' AND role_name = 'service_role'
             AND NOT has_table_insert AND NOT has_table_update AND NOT has_table_delete
         )
         AND (SELECT count(*) FROM tbl_priv WHERE role_name = 'service_role') = 2
         THEN 'PASS' ELSE 'FAIL' END,
    'service_role has no table-level INSERT/UPDATE/DELETE ACL entry on either table',
    'scanned',
    'Table ACL only; approved column-level grants are verified in A-09 and must not false-FAIL this check'
  UNION ALL
  SELECT
    'A-11-05',
    'static_security',
    'P0',
    CASE WHEN to_regclass('public.deletion_requests') IS NULL THEN 'NOT_RUN'
         WHEN NOT EXISTS (
           SELECT 1 FROM tbl_priv WHERE has_table_delete
         ) THEN 'PASS' ELSE 'FAIL' END,
    'no table-level DELETE ACL for PUBLIC/anon/authenticated/service_role on either table',
    'scanned',
    'Append-oriented permanence'
  UNION ALL
  SELECT
    'A-11-06',
    'static_security',
    'P0',
    CASE WHEN NOT EXISTS (
           SELECT 1 FROM fn_exec
           WHERE public_execute OR anon_execute OR authenticated_execute OR NOT service_role_execute
         )
         AND (SELECT count(*) FROM fn_exec) = 2
         THEN 'PASS' ELSE 'FAIL' END,
    'unauthorized function EXECUTE absent; service_role EXECUTE present',
    'scanned',
    'Guard function execute hardening'
  UNION ALL
  SELECT
    'A-11-07',
    'pre_existing_baseline',
    'P0',
    'INFO',
    'separate pre-apply versus post-apply catalog baseline artifact required for unchanged pre-existing objects',
    'not_provided_by_block_a_sql',
    'Block A final object catalogs alone cannot prove migration ordering or that pre-existing objects were unchanged; absence of the external baseline must be reported as a DEV evidence-review gate defect'
),
all_a AS (
  SELECT * FROM a01
  UNION ALL SELECT * FROM a02
  UNION ALL SELECT * FROM a03
  UNION ALL SELECT * FROM a04
  UNION ALL SELECT * FROM a05
  UNION ALL SELECT * FROM a06
  UNION ALL SELECT * FROM a07
  UNION ALL SELECT * FROM a08
  UNION ALL SELECT * FROM a09
  UNION ALL SELECT * FROM a10
  UNION ALL SELECT * FROM a11
),
a12 AS (
  SELECT
    'A-12-01'::text AS check_id,
    'block_a_summary'::text AS verification_area,
    'P0'::text AS severity,
    CASE
      WHEN EXISTS (SELECT 1 FROM all_a WHERE status = 'FAIL') THEN 'FAIL'
      WHEN EXISTS (SELECT 1 FROM all_a WHERE status = 'NOT_RUN') THEN 'FAIL'
      ELSE 'PASS'
    END AS status,
    'no FAIL and no NOT_RUN among Block A required checks'::text AS expected,
    format(
      'total=%s passed=%s failed=%s informational=%s not_run=%s verdict=%s',
      (SELECT count(*) FROM all_a),
      (SELECT count(*) FROM all_a WHERE status = 'PASS'),
      (SELECT count(*) FROM all_a WHERE status = 'FAIL'),
      (SELECT count(*) FROM all_a WHERE status = 'INFO'),
      (SELECT count(*) FROM all_a WHERE status = 'NOT_RUN'),
      CASE
        WHEN EXISTS (SELECT 1 FROM all_a WHERE status = 'FAIL') THEN 'FAIL'
        WHEN EXISTS (SELECT 1 FROM all_a WHERE status = 'NOT_RUN') THEN 'FAIL'
        ELSE 'PASS'
      END
    ) AS actual,
    'Deterministic Block A summary; INFO does not override FAIL'::text AS details
)
SELECT check_id, verification_area, severity, status, expected, actual, details
FROM (
  SELECT * FROM all_a
  UNION ALL
  SELECT * FROM a12
) q
ORDER BY check_id;

COMMIT;

-- #############################################################################
-- BLOCK B — TRANSACTION-ROLLED-BACK BEHAVIOURAL VERIFICATION
-- #############################################################################
-- WARNING BANNER
-- NOT APPROVED FOR EXECUTION
-- DEV ONLY AFTER SEPARATE AUTHORIZATION
-- NEVER RUN IN PROD
-- BLOCK B PERFORMS TEMPORARY DML AND MUST ROLLBACK
-- Synthetic identifiers are reserved for this verification only.
--
-- EXECUTION-ROLE CONTRACT (fail-closed):
-- Block B must run under an approved privileged DEV verification session
-- (table owner / postgres-equivalent) capable of INSERT/UPDATE/DELETE on both
-- Slice 2 tables, including protected columns used by negative tests.
-- This is NOT a realistic service_role runtime test and is NOT proof of
-- service_role least-privilege behaviour (verified by Block A catalog ACL).
-- No SET ROLE. No JWT impersonation. No auth.users mutation.
-- SQLSTATE 42501 must never be interpreted as an expected guard rejection.
-- #############################################################################

BEGIN;

SET LOCAL statement_timeout = '30s';
SET LOCAL lock_timeout = '5s';

CREATE TEMP TABLE p2s2_vfy_b_results (
  check_id text PRIMARY KEY,
  verification_area text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL,
  expected text NOT NULL,
  actual text NOT NULL,
  details text NOT NULL
) ON COMMIT DROP;

DO $blockb$
DECLARE
  -- Deterministic synthetic identifiers (example-domain; schema-compliant)
  c_email constant text := 'p2s2-migration-verify@example.com';
  c_scan_a constant uuid := 'a1000000-0000-4000-8000-000000000001';
  c_scan_b constant uuid := 'a1000000-0000-4000-8000-000000000002';
  c_scan_c constant uuid := 'a1000000-0000-4000-8000-000000000003';
  c_evid  constant uuid := 'b1000000-0000-4000-8000-000000000001';

  v_id uuid;
  v_id2 uuid;
  v_id3 uuid;
  v_id4 uuid;
  v_id5 uuid;
  v_id6 uuid;
  v_sqlstate text;
  v_msg text;
  v_ok boolean;
  v_count bigint;
  v_objects_ok boolean := false;
  v_role_ok boolean := false;
  v_precond_ok boolean := false;
  r record;
BEGIN
  -- B-00-01 objects present
  IF to_regclass('public.deletion_requests') IS NOT NULL
     AND to_regclass('public.deletion_request_executions') IS NOT NULL THEN
    v_objects_ok := true;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-00-01', 'precondition', 'P0', 'PASS',
       'both Slice 2 tables present', 'both_present',
       'Object precondition satisfied');
  ELSE
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-00-01', 'precondition', 'P0', 'FAIL',
       'both Slice 2 tables present', 'one_or_both_absent',
       'Block B fail-closed: migration objects absent; behavioural cases NOT_RUN');
  END IF;

  -- B-00-02 privileged execution-role precondition (not service_role realism)
  IF v_objects_ok
     AND has_table_privilege(current_user, 'public.deletion_requests', 'INSERT')
     AND has_table_privilege(current_user, 'public.deletion_requests', 'UPDATE')
     AND has_table_privilege(current_user, 'public.deletion_requests', 'DELETE')
     AND has_table_privilege(current_user, 'public.deletion_request_executions', 'INSERT')
     AND has_table_privilege(current_user, 'public.deletion_request_executions', 'DELETE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'id', 'INSERT')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'request_state', 'INSERT')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'validated_at', 'INSERT')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'resolved_at', 'INSERT')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'resolution_code', 'INSERT')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'id', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'user_email', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'request_scope', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'target_scan_record_id', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'target_evidence_table', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'target_evidence_id', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'requested_at', 'UPDATE')
     AND has_column_privilege(current_user, 'public.deletion_requests', 'created_at', 'UPDATE')
  THEN
    v_role_ok := true;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-00-02', 'precondition', 'P0', 'PASS',
       'privileged DEV verification session can INSERT/UPDATE/DELETE including protected columns',
       format('current_user=%s role_ok=true', current_user),
       'Table owner/postgres-equivalent expected; not service_role runtime proof; Block A verifies service_role least privilege');
  ELSE
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-00-02', 'precondition', 'P0', 'FAIL',
       'privileged DEV verification session can INSERT/UPDATE/DELETE including protected columns',
       format('current_user=%s objects_ok=%s role_ok=false', current_user, v_objects_ok),
       'Fail-closed: Block B is not a service_role runtime test; do not interpret 42501 as guard rejection');
  END IF;

  v_precond_ok := v_objects_ok AND v_role_ok;

  IF NOT v_precond_ok THEN
    -- Emit precondition-dependent NOT_RUN markers for all substantive behavioural case IDs.
    -- B-10-01 is emitted once only by the post-DO summary SELECT (never inserted here).
    FOR r IN
      SELECT * FROM (VALUES
        ('B-01-01'),('B-01-02'),('B-01-03'),('B-01-04'),('B-01-05'),
        ('B-01-06'),('B-01-07'),('B-01-08'),('B-01-09'),('B-01-10'),
        ('B-01-11'),('B-01-12'),('B-01-13'),('B-01-14'),('B-01-15'),
        ('B-01-16'),('B-01-17'),
        ('B-02-01'),('B-02-02'),('B-02-03'),('B-02-04'),('B-02-05'),
        ('B-02-06'),('B-02-07'),('B-02-08'),
        ('B-03-01'),('B-03-02'),('B-03-03'),('B-03-04'),
        ('B-04-01'),('B-04-02'),('B-04-03'),('B-04-04'),('B-04-05'),
        ('B-04-06'),('B-04-07'),('B-04-08'),
        ('B-05-01'),('B-05-02'),('B-05-03'),('B-05-04'),
        ('B-06-01'),('B-06-02'),('B-06-03'),('B-06-04'),
        ('B-07-01'),('B-07-02'),('B-07-03'),('B-07-04'),
        ('B-08-01'),('B-08-02'),
        ('B-09-01'),('B-09-02'),('B-09-03')
      ) AS t(check_id)
    LOOP
      INSERT INTO p2s2_vfy_b_results VALUES
        (r.check_id, 'precondition_gate', 'P0', 'NOT_RUN',
         'behavioural case runnable after hard preconditions',
         'precondition_failed',
         'Allowed NOT_RUN: B-00 object/role precondition failed; block verdict cannot be PASS');
    END LOOP;
    RETURN;
  END IF;

  -- =========================================================================
  -- B-01 — Initial INSERT posture
  -- =========================================================================

  -- B-01-01 valid received request
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_id;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-01', 'insert_posture', 'P1', 'PASS',
       'valid received insert succeeds', 'inserted id=' || v_id::text,
       'F-1 compliant defaults');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-01', 'insert_posture', 'P1', 'FAIL',
       'valid received insert succeeds',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Unexpected rejection of valid insert');
  END;

  -- B-01-02 invalid initial non-received state
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, request_state, resolution_code, resolved_at, validated_at
    ) VALUES (
      c_email, 'account_wide', 'executed', 'completed', now(), now()
    );
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-02', 'insert_posture', 'P1', 'PASS',
       'non-received insert rejected with check_violation (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Expected F-1 / CHECK rejection');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-02', 'insert_posture', 'P1', 'FAIL',
       'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-02', 'insert_posture', 'P1', 'FAIL',
       'non-received insert rejected', 'accepted',
       'Unexpected acceptance');
  END IF;

  -- B-01-03 invalid initial validated_at
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope, validated_at)
    VALUES (c_email, 'account_wide', now());
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-03', 'insert_posture', 'P1', 'PASS',
       'insert with validated_at rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'F-1 insert posture');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-03', 'insert_posture', 'P1', 'FAIL',
       'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-03', 'insert_posture', 'P1', 'FAIL',
       'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-04 invalid initial resolved_at
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope, resolved_at)
    VALUES (c_email, 'account_wide', now());
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-04', 'insert_posture', 'P1', 'PASS',
       'insert with resolved_at rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'F-1 insert posture');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-04', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-04', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-05 invalid initial resolution_code
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope, resolution_code)
    VALUES (c_email, 'account_wide', 'completed');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-05', 'insert_posture', 'P1', 'PASS',
       'insert with resolution_code rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'F-1 insert posture');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-05', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-05', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-06 invalid scope/target: account_wide with target_scan_record_id
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope, target_scan_record_id)
    VALUES (c_email, 'account_wide', c_scan_a);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-06', 'insert_posture', 'P1', 'PASS',
       'account_wide with target rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-06', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-06', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-07 invalid scope/target: scan_specific missing target
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'scan_specific');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-07', 'insert_posture', 'P1', 'PASS',
       'scan_specific without target rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-07', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-07', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-08 invalid scope/target: evidence_specific incomplete targets
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_table
    ) VALUES (c_email, 'evidence_specific', c_scan_a, 'image_evidence');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-08', 'insert_posture', 'P1', 'PASS',
       'evidence_specific incomplete target rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-08', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-08', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-09 empty user_email
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES ('', 'account_wide');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-09', 'insert_posture', 'P1', 'PASS',
       'empty user_email rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_user_email_nonempty_check');
  EXCEPTION WHEN insufficient_privilege THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-09', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Permission-denied 42501 is not an expected guard rejection');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-09', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-09', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-10 whitespace-only user_email
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES ('   ', 'account_wide');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-10', 'insert_posture', 'P1', 'PASS',
       'whitespace-only user_email rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_user_email_nonempty_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-10', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-10', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-11 invalid target_evidence_table whitelist value
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id
    ) VALUES (c_email, 'evidence_specific', c_scan_a, 'not_an_evidence_table', c_evid);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-11', 'insert_posture', 'P1', 'PASS',
       'invalid target_evidence_table rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_evidence_table_whitelist_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-11', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-11', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-12 evidence_specific missing evidence table (scan + evidence_id present)
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_id
    ) VALUES (c_email, 'evidence_specific', c_scan_a, c_evid);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-12', 'insert_posture', 'P1', 'PASS',
       'evidence_specific missing target_evidence_table rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-12', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-12', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-13 evidence_specific missing evidence id (scan + table present) — complements B-01-08
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_table
    ) VALUES (c_email, 'evidence_specific', c_scan_a, 'image_evidence');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-13', 'insert_posture', 'P1', 'PASS',
       'evidence_specific missing target_evidence_id rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-13', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-13', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-14 evidence targets present for non-evidence scope (account_wide)
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_evidence_table, target_evidence_id
    ) VALUES (c_email, 'account_wide', 'image_evidence', c_evid);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-14', 'insert_posture', 'P1', 'PASS',
       'account_wide with evidence targets rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-14', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-14', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-15 evidence targets present for scan_specific scope
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id
    ) VALUES (c_email, 'scan_specific', c_scan_a, 'image_evidence', c_evid);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-15', 'insert_posture', 'P1', 'PASS',
       'scan_specific with evidence targets rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-15', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-15', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-16 evidence_specific missing scan target
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_evidence_table, target_evidence_id
    ) VALUES (c_email, 'evidence_specific', 'image_evidence', c_evid);
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-16', 'insert_posture', 'P1', 'PASS',
       'evidence_specific missing target_scan_record_id rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_scope_target_matrix_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-16', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-16', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-01-17 invalid request_scope vocabulary
  BEGIN
    v_ok := false;
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'not_a_valid_scope');
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-17', 'insert_posture', 'P1', 'PASS',
       'invalid request_scope rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'deletion_requests_request_scope_check');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-17', 'insert_posture', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-01-17', 'insert_posture', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- =========================================================================
  -- B-02 — Immutable request identity and target posture
  -- =========================================================================
  IF v_id IS NULL THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-02-00', 'immutability', 'P1', 'NOT_RUN',
       'seed received row from B-01-01', 'missing', 'Cannot test immutability without seed row');
  ELSE
    -- B-02-01 through B-02-06: each immutable field
    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET id = 'ffffffff-ffff-4fff-8fff-ffffffffffff' WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-01', 'immutability', 'P1', 'PASS', 'id immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-01', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-01', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET user_email = 'other-p2s2-verify@example.com' WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-02', 'immutability', 'P1', 'PASS', 'user_email immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-02', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-02', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests
         SET request_scope = 'scan_specific', target_scan_record_id = c_scan_a
       WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-03', 'immutability', 'P1', 'PASS', 'request_scope immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-03', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-03', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    -- seed scan_specific row for target immutability
    INSERT INTO public.deletion_requests (user_email, request_scope, target_scan_record_id)
    VALUES (c_email, 'scan_specific', c_scan_a)
    RETURNING id INTO v_id2;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET target_scan_record_id = c_scan_b WHERE id = v_id2;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-04', 'immutability', 'P1', 'PASS', 'target_scan_record_id immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-04', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-04', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    INSERT INTO public.deletion_requests (
      user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id
    ) VALUES (c_email, 'evidence_specific', c_scan_a, 'image_evidence', c_evid)
    RETURNING id INTO v_id3;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests
         SET target_evidence_table = 'user_description_evidence'
       WHERE id = v_id3;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-05', 'immutability', 'P1', 'PASS', 'target_evidence_table immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-05', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-05', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET target_evidence_id = c_scan_b WHERE id = v_id3;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-06', 'immutability', 'P1', 'PASS', 'target_evidence_id immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-06', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-06', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET requested_at = now() + interval '1 day' WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-07', 'immutability', 'P1', 'PASS', 'requested_at immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-07', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-07', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET created_at = now() + interval '1 day' WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-08', 'immutability', 'P1', 'PASS', 'created_at immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-08', 'immutability', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-02-08', 'immutability', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  END IF;

  -- =========================================================================
  -- B-03 — Validation lifecycle
  -- =========================================================================
  IF v_id IS NULL THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-03-00', 'validation_lifecycle', 'P1', 'NOT_RUN',
       'seed received row', 'missing', 'Skipped');
  ELSE
    BEGIN
      UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_id;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-01', 'validation_lifecycle', 'P1', 'PASS',
         'one-time validated_at null->non-null succeeds', 'updated', 'received->received milestone');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-01', 'validation_lifecycle', 'P1', 'FAIL',
         'milestone update succeeds',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected rejection');
    END;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET validated_at = NULL WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-02', 'validation_lifecycle', 'P1', 'PASS',
         'clearing validated_at rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'validated_at immutability');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-02', 'validation_lifecycle', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-02', 'validation_lifecycle', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET validated_at = now() + interval '1 hour' WHERE id = v_id;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-03', 'validation_lifecycle', 'P1', 'PASS',
         'replacing validated_at rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'validated_at immutability');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-03', 'validation_lifecycle', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-03', 'validation_lifecycle', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;

    -- B-03-04 first setting validated_at during terminalization prohibited
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_id4;
    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests
         SET request_state = 'rejected',
             resolution_code = 'invalid_request',
             resolved_at = now(),
             validated_at = now()
       WHERE id = v_id4;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-04', 'validation_lifecycle', 'P1', 'PASS',
         'setting validated_at during terminalization rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         'validated_at only via received->received milestone');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-04', 'validation_lifecycle', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-03-04', 'validation_lifecycle', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  END IF;

  -- =========================================================================
  -- B-04 — Terminal transitions
  -- =========================================================================
  -- Prepare dedicated rows
  INSERT INTO public.deletion_requests (user_email, request_scope, target_scan_record_id)
  VALUES (c_email, 'scan_specific', c_scan_a)
  RETURNING id INTO v_id5;
  UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_id5;

  INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
  VALUES (v_id5, c_scan_a);

  -- B-04-01 valid received -> executed
  BEGIN
    UPDATE public.deletion_requests
       SET request_state = 'executed',
           resolution_code = 'completed',
           resolved_at = now()
     WHERE id = v_id5;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-01', 'terminal_transitions', 'P1', 'PASS',
       'valid received->executed with prior validation and matching attribution',
       'executed', 'scan_specific path');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-01', 'terminal_transitions', 'P1', 'FAIL',
       'transition succeeds',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected rejection');
  END;

  -- B-04-02 executed without prior validation
  INSERT INTO public.deletion_requests (user_email, request_scope, target_scan_record_id)
  VALUES (c_email, 'scan_specific', c_scan_b)
  RETURNING id INTO v_id6;
  BEGIN
    v_ok := false;
    UPDATE public.deletion_requests
       SET request_state = 'executed',
           resolution_code = 'completed',
           resolved_at = now()
     WHERE id = v_id6;
    v_ok := true;
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-02', 'terminal_transitions', 'P1', 'PASS',
       'executed without validated_at rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'transition guard');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-02', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
  END;
  IF v_ok THEN
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-02', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
  END IF;

  -- B-04-03 valid received -> rejected (early, validated_at null)
  DECLARE
    v_rej uuid;
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_rej;
    UPDATE public.deletion_requests
       SET request_state = 'rejected',
           resolution_code = 'unauthorized_request',
           resolved_at = now()
     WHERE id = v_rej;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-03', 'terminal_transitions', 'P1', 'PASS',
       'valid received->rejected with validated_at null',
       'rejected/unauthorized_request', 'early rejection path');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-03', 'terminal_transitions', 'P1', 'FAIL',
       'rejection succeeds',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected rejection');
  END;

  -- B-04-04 invalid state/resolution: executed with rejection code
  DECLARE
    v_bad uuid;
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_bad;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_bad;
    v_ok := false;
    BEGIN
      UPDATE public.deletion_requests
         SET request_state = 'executed',
             resolution_code = 'invalid_request',
             resolved_at = now()
       WHERE id = v_bad;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-04', 'terminal_transitions', 'P1', 'PASS',
         'executed+invalid_request rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'state/resolution coupling');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-04', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-04', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  END;

  -- B-04-05 invalid resolved timestamp posture (terminal without resolved_at)
  DECLARE
    v_bad2 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_bad2;
    v_ok := false;
    BEGIN
      UPDATE public.deletion_requests
         SET request_state = 'rejected',
             resolution_code = 'invalid_request',
             resolved_at = NULL
       WHERE id = v_bad2;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-05', 'terminal_transitions', 'P1', 'PASS',
         'terminal without resolved_at rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'resolved_at required');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-05', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-05', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  END;

  -- B-04-06 timestamp ordering violation (resolved_at < requested_at)
  DECLARE
    v_bad3 uuid;
    v_req timestamptz;
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id, requested_at INTO v_bad3, v_req;
    v_ok := false;
    BEGIN
      UPDATE public.deletion_requests
         SET request_state = 'rejected',
             resolution_code = 'duplicate_request',
             resolved_at = v_req - interval '1 hour'
       WHERE id = v_bad3;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-06', 'terminal_transitions', 'P1', 'PASS',
         'resolved_at < requested_at rejected (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'timestamp_ordering_check');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-06', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-06', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  END;

  -- B-04-07 mutation of executed terminal row
  IF EXISTS (SELECT 1 FROM public.deletion_requests WHERE id = v_id5 AND request_state = 'executed') THEN
    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests SET resolution_code = 'completed' WHERE id = v_id5;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-07', 'terminal_transitions', 'P1', 'PASS',
         'executed row immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'terminal immutability');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-07', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-07', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  ELSE
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-07', 'terminal_transitions', 'P1', 'NOT_RUN',
       'executed seed from B-04-01', 'missing', 'Depends on B-04-01 success');
  END IF;

  -- B-04-08 mutation of rejected terminal row
  DECLARE
    v_term_rej uuid;
  BEGIN
    INSERT INTO public.deletion_requests (user_email, request_scope)
    VALUES (c_email, 'account_wide')
    RETURNING id INTO v_term_rej;
    UPDATE public.deletion_requests
       SET request_state = 'rejected',
           resolution_code = 'already_completed',
           resolved_at = now()
     WHERE id = v_term_rej;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    BEGIN
      v_ok := false;
      UPDATE public.deletion_requests
         SET resolution_code = 'execution_failed'
       WHERE id = v_term_rej;
      v_ok := true;
    EXCEPTION WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-08', 'terminal_transitions', 'P1', 'PASS',
         'rejected row immutable (23514)',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'terminal immutability');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-08', 'terminal_transitions', 'P1', 'FAIL', 'check_violation 23514',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Unexpected exception shape');
    END;
    IF v_ok THEN
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-04-08', 'terminal_transitions', 'P1', 'FAIL', 'rejected', 'accepted', 'Unexpected acceptance');
    END IF;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-04-08', 'terminal_transitions', 'P1', 'FAIL',
       'setup+immutability test',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg, 'Setup failed');
  END;

  -- =========================================================================
  -- B-05 — Deferred consistency: received and rejected
  -- Expected deferred failures place ALL case setup + SET CONSTRAINTS IMMEDIATE
  -- inside one exception-isolated nested block (subtransaction). On expected
  -- check_violation, case-local mutations roll back automatically.
  -- No SAVEPOINT / ROLLBACK TO SAVEPOINT / COMMIT / ROLLBACK inside DO.
  -- =========================================================================

  -- B-05-01 received with zero execution rows (success; deferred-valid final state)
  DECLARE
    v_r uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000501', c_email, 'account_wide')
    RETURNING id INTO v_r;
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-05-01', 'deferred_consistency', 'P1', 'PASS',
         'received + zero executions commits deferred check',
         'ok', 'immediate check via SET CONSTRAINTS IMMEDIATE');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-05-01', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         CASE WHEN v_sqlstate = '42501'
              THEN 'Permission-denied 42501 is not an expected guard rejection'
              ELSE 'Unexpected failure' END);
    END;
  END;

  -- B-05-02 received with an execution row (expected failure; fully isolated)
  DECLARE
    v_r2 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000502', c_email, 'account_wide')
    RETURNING id INTO v_r2;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_r2, c_scan_a);
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-02', 'deferred_consistency', 'P1', 'FAIL',
       'received + execution row rejected at deferred check (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-02', 'deferred_consistency', 'P1', 'PASS',
       'received + execution row rejected at deferred check (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back all case-local mutations');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-02', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- B-05-03 rejected with zero execution rows (success)
  DECLARE
    v_rj uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000503', c_email, 'account_wide')
    RETURNING id INTO v_rj;
    UPDATE public.deletion_requests
       SET request_state = 'rejected',
           resolution_code = 'invalid_request',
           resolved_at = now()
     WHERE id = v_rj;
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-05-03', 'deferred_consistency', 'P1', 'PASS',
         'rejected + zero executions passes deferred check',
         'ok', 'deferred guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-05-03', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         CASE WHEN v_sqlstate = '42501'
              THEN 'Permission-denied 42501 is not an expected guard rejection'
              ELSE 'Unexpected failure' END);
    END;
  END;

  -- B-05-04 rejected with an execution row (expected failure; fully isolated)
  DECLARE
    v_rj2 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000504', c_email, 'account_wide')
    RETURNING id INTO v_rj2;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_rj2, c_scan_a);
    UPDATE public.deletion_requests
       SET request_state = 'rejected',
           resolution_code = 'execution_failed',
           resolved_at = now()
     WHERE id = v_rj2;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-04', 'deferred_consistency', 'P1', 'FAIL',
       'rejected + execution row rejected at deferred check (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-04', 'deferred_consistency', 'P1', 'PASS',
       'rejected + execution row rejected at deferred check (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back all case-local mutations');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-05-04', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- =========================================================================
  -- B-06 — Deferred consistency: scan_specific executed
  -- =========================================================================

  -- B-06-01 exactly one matching execution attribution (success)
  DECLARE
    v_ss uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope, target_scan_record_id)
    VALUES ('c1000000-0000-4000-8000-000000000601', c_email, 'scan_specific', c_scan_a)
    RETURNING id INTO v_ss;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_ss;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_ss, c_scan_a);
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_ss;
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-06-01', 'deferred_consistency', 'P1', 'PASS',
         'scan_specific executed with one matching attribution passes',
         'ok', 'deferred guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-06-01', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         CASE WHEN v_sqlstate = '42501'
              THEN 'Permission-denied 42501 is not an expected guard rejection'
              ELSE 'Unexpected failure' END);
    END;
  END;

  -- B-06-02 zero attribution rows (expected failure; fully isolated)
  DECLARE
    v_ss0 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope, target_scan_record_id)
    VALUES ('c1000000-0000-4000-8000-000000000602', c_email, 'scan_specific', c_scan_b)
    RETURNING id INTO v_ss0;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_ss0;
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_ss0;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-02', 'deferred_consistency', 'P1', 'FAIL',
       'scan_specific executed with zero attribution rejected (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-02', 'deferred_consistency', 'P1', 'PASS',
       'scan_specific executed with zero attribution rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back inconsistent executed parent; cannot poison B-07/B-08');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-02', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- B-06-03 multiple attribution rows (expected failure; fully isolated)
  DECLARE
    v_ssm uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope, target_scan_record_id)
    VALUES ('c1000000-0000-4000-8000-000000000603', c_email, 'scan_specific', c_scan_a)
    RETURNING id INTO v_ssm;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_ssm;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_ssm, c_scan_a), (v_ssm, c_scan_b);
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_ssm;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-03', 'deferred_consistency', 'P1', 'FAIL',
       'scan_specific executed with multiple attributions rejected (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-03', 'deferred_consistency', 'P1', 'PASS',
       'scan_specific executed with multiple attributions rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back all case-local mutations');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-03', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- B-06-04 mismatched scan_record_id (expected failure; fully isolated)
  DECLARE
    v_ssx uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope, target_scan_record_id)
    VALUES ('c1000000-0000-4000-8000-000000000604', c_email, 'scan_specific', c_scan_a)
    RETURNING id INTO v_ssx;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_ssx;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_ssx, c_scan_b);
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_ssx;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-04', 'deferred_consistency', 'P1', 'FAIL',
       'scan_specific mismatched scan_record_id rejected (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-04', 'deferred_consistency', 'P1', 'PASS',
       'scan_specific mismatched scan_record_id rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back all case-local mutations');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-06-04', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- =========================================================================
  -- B-07 — Deferred consistency: account_wide executed
  -- =========================================================================

  -- B-07-01/02/03 share one deferred-valid executed parent (dedicated id)
  DECLARE
    v_aw uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000701', c_email, 'account_wide')
    RETURNING id INTO v_aw;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_aw;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_aw, c_scan_a);
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_aw;
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-01', 'deferred_consistency', 'P1', 'PASS',
         'account_wide executed with one attribution passes',
         'ok', 'deferred guard / F-2');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-01', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         CASE WHEN v_sqlstate = '42501'
              THEN 'Permission-denied 42501 is not an expected guard rejection'
              ELSE 'Unexpected failure' END);
    END;

    -- B-07-02 more than one attribution row where allowed
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_aw, c_scan_b);
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-02', 'deferred_consistency', 'P1', 'PASS',
         'account_wide executed with multiple attributions passes',
         'ok', 'multi-attribution posture accepted');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-02', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         'Must not incorrectly fail accepted multi-attribution posture');
    END;

    -- B-07-03 F-P2-3 residual observation: post-terminal additional attribution (INFO)
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_aw, c_scan_c);
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-03', 'accepted_residual_f_p2_3', 'P2', 'INFO',
         'post-terminal account_wide attribution insert remains possible while invariants hold',
         'additional attribution accepted',
         'F-P2-3 accepted residual; not classified as FAIL; not database-level temporal freezing; not a redesign');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-07-03', 'accepted_residual_f_p2_3', 'P2', 'FAIL',
         'residual insert should be possible under current model',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         'Unexpected block of accepted residual posture');
    END;
  END;

  -- B-07-04 zero attribution rows / F-2 (expected failure; fully isolated)
  DECLARE
    v_aw0 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (id, user_email, request_scope)
    VALUES ('c1000000-0000-4000-8000-000000000704', c_email, 'account_wide')
    RETURNING id INTO v_aw0;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_aw0;
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_aw0;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-07-04', 'deferred_consistency', 'P1', 'FAIL',
       'account_wide executed with zero attribution rejected (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-07-04', 'deferred_consistency', 'P1', 'PASS',
       'account_wide executed with zero attribution rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'F-2; subtransaction rolled back inconsistent executed parent');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-07-04', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- =========================================================================
  -- B-08 — Deferred consistency: evidence_specific executed
  -- =========================================================================

  -- B-08-01 zero session execution rows (success)
  DECLARE
    v_es uuid;
  BEGIN
    INSERT INTO public.deletion_requests (
      id, user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id
    ) VALUES ('c1000000-0000-4000-8000-000000000801', c_email, 'evidence_specific', c_scan_a, 'ai_analysis_evidence', c_evid)
    RETURNING id INTO v_es;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_es;
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_es;
    BEGIN
      SET CONSTRAINTS
        trg_deletion_requests_execution_consistency,
        trg_deletion_request_executions_execution_consistency IMMEDIATE;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-08-01', 'deferred_consistency', 'P1', 'PASS',
         'evidence_specific executed with zero session executions passes',
         'ok', 'deferred guard');
    EXCEPTION WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
      INSERT INTO p2s2_vfy_b_results VALUES
        ('B-08-01', 'deferred_consistency', 'P1', 'FAIL',
         'should pass',
         'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
         CASE WHEN v_sqlstate = '42501'
              THEN 'Permission-denied 42501 is not an expected guard rejection'
              ELSE 'Unexpected failure' END);
    END;
  END;

  -- B-08-02 one session execution row (expected failure; fully isolated)
  DECLARE
    v_es1 uuid;
  BEGIN
    INSERT INTO public.deletion_requests (
      id, user_email, request_scope, target_scan_record_id, target_evidence_table, target_evidence_id
    ) VALUES ('c1000000-0000-4000-8000-000000000802', c_email, 'evidence_specific', c_scan_a, 'product_mention_evidence', c_evid)
    RETURNING id INTO v_es1;
    UPDATE public.deletion_requests SET validated_at = now() WHERE id = v_es1;
    INSERT INTO public.deletion_request_executions (deletion_request_id, scan_record_id)
    VALUES (v_es1, c_scan_a);
    UPDATE public.deletion_requests
       SET request_state = 'executed', resolution_code = 'completed', resolved_at = now()
     WHERE id = v_es1;
    SET CONSTRAINTS
      trg_deletion_requests_execution_consistency,
      trg_deletion_request_executions_execution_consistency IMMEDIATE;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-08-02', 'deferred_consistency', 'P1', 'FAIL',
       'evidence_specific executed with session execution rejected (23514)',
       'accepted', 'Unexpected acceptance');
  EXCEPTION WHEN check_violation THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-08-02', 'deferred_consistency', 'P1', 'PASS',
       'evidence_specific executed with session execution rejected (23514)',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       'Subtransaction rolled back all case-local mutations');
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_msg = MESSAGE_TEXT;
    INSERT INTO p2s2_vfy_b_results VALUES
      ('B-08-02', 'deferred_consistency', 'P1', 'FAIL', 'check_violation 23514',
       'sqlstate=' || v_sqlstate || ' msg=' || v_msg,
       CASE WHEN v_sqlstate = '42501'
            THEN 'Permission-denied 42501 is not an expected guard rejection'
            ELSE 'Unexpected exception shape' END);
  END;

  -- =========================================================================
  -- B-09 — Full rollback evidence (pre-ROLLBACK counts)
  -- =========================================================================
  SELECT count(*) INTO v_count
    FROM public.deletion_requests
   WHERE user_email = c_email
      OR id IN (
        'c1000000-0000-4000-8000-000000000501',
        'c1000000-0000-4000-8000-000000000502',
        'c1000000-0000-4000-8000-000000000503',
        'c1000000-0000-4000-8000-000000000504',
        'c1000000-0000-4000-8000-000000000601',
        'c1000000-0000-4000-8000-000000000602',
        'c1000000-0000-4000-8000-000000000603',
        'c1000000-0000-4000-8000-000000000604',
        'c1000000-0000-4000-8000-000000000701',
        'c1000000-0000-4000-8000-000000000704',
        'c1000000-0000-4000-8000-000000000801',
        'c1000000-0000-4000-8000-000000000802'
      );
  INSERT INTO p2s2_vfy_b_results VALUES
    ('B-09-01', 'rollback_evidence', 'P1', 'INFO',
     'synthetic request row count visible inside transaction before ROLLBACK',
     'request_rows=' || v_count::text,
     'Transaction is scheduled to roll back; counts are intra-transaction only');

  SELECT count(*) INTO v_count
    FROM public.deletion_request_executions dre
   WHERE dre.deletion_request_id IN (
           SELECT dr.id FROM public.deletion_requests dr WHERE dr.user_email = c_email
         )
      OR dre.scan_record_id IN (c_scan_a, c_scan_b, c_scan_c)
      OR dre.deletion_request_id IN (
        'c1000000-0000-4000-8000-000000000501',
        'c1000000-0000-4000-8000-000000000601',
        'c1000000-0000-4000-8000-000000000701',
        'c1000000-0000-4000-8000-000000000801'
      );
  INSERT INTO p2s2_vfy_b_results VALUES
    ('B-09-02', 'rollback_evidence', 'P1', 'INFO',
     'synthetic execution row count visible inside transaction before ROLLBACK',
     'execution_rows=' || v_count::text,
     'Transaction is scheduled to roll back');

  INSERT INTO p2s2_vfy_b_results VALUES
    ('B-09-03', 'rollback_evidence', 'P0', 'INFO',
     'explicit ROLLBACK will discard all Block B DML',
     'rollback_scheduled',
     'Cleanup is enforced by ROLLBACK statement after this DO block, not by comments alone');

END;
$blockb$;

-- Case-row projection (does not include B-10-01; summary is emitted once below)
SELECT check_id, verification_area, severity, status, expected, actual, details
FROM p2s2_vfy_b_results
ORDER BY check_id;

-- Single Block B summary emitter (never inserted into temp results; does not count itself)
SELECT
  'B-10-01'::text AS check_id,
  'block_b_summary'::text AS verification_area,
  'P0'::text AS severity,
  CASE
    WHEN EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE status = 'FAIL') THEN 'FAIL'
    WHEN EXISTS (
           SELECT 1 FROM p2s2_vfy_b_results r
            WHERE r.status = 'NOT_RUN'
              AND NOT (
                EXISTS (
                  SELECT 1 FROM p2s2_vfy_b_results p
                   WHERE p.check_id IN ('B-00-01', 'B-00-02')
                     AND p.status = 'FAIL'
                )
                OR (r.check_id = 'B-02-00'
                    AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-01-01' AND status = 'FAIL'))
                OR (r.check_id = 'B-03-00'
                    AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-01-01' AND status = 'FAIL'))
                OR (r.check_id = 'B-04-07'
                    AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-04-01' AND status = 'FAIL'))
              )
         ) THEN 'FAIL'
    ELSE 'PASS'
  END AS status,
  'no FAIL; unexpected NOT_RUN fails; hard precondition failure cannot yield PASS; INFO/F-P2-3 allowed'::text AS expected,
  format(
    'case_rows=%s passed=%s failed=%s informational=%s not_run=%s verdict=%s residual=%s precond=%s',
    (SELECT count(*) FROM p2s2_vfy_b_results),
    (SELECT count(*) FROM p2s2_vfy_b_results WHERE status = 'PASS'),
    (SELECT count(*) FROM p2s2_vfy_b_results WHERE status = 'FAIL'),
    (SELECT count(*) FROM p2s2_vfy_b_results WHERE status = 'INFO'),
    (SELECT count(*) FROM p2s2_vfy_b_results WHERE status = 'NOT_RUN'),
    CASE
      WHEN EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE status = 'FAIL') THEN 'FAIL'
      WHEN EXISTS (
             SELECT 1 FROM p2s2_vfy_b_results r
              WHERE r.status = 'NOT_RUN'
                AND NOT (
                  EXISTS (
                    SELECT 1 FROM p2s2_vfy_b_results p
                     WHERE p.check_id IN ('B-00-01', 'B-00-02')
                       AND p.status = 'FAIL'
                  )
                  OR (r.check_id = 'B-02-00'
                      AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-01-01' AND status = 'FAIL'))
                  OR (r.check_id = 'B-03-00'
                      AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-01-01' AND status = 'FAIL'))
                  OR (r.check_id = 'B-04-07'
                      AND EXISTS (SELECT 1 FROM p2s2_vfy_b_results WHERE check_id = 'B-04-01' AND status = 'FAIL'))
                )
           ) THEN 'FAIL'
      ELSE 'PASS'
    END,
    coalesce(
      (SELECT status || ':' || actual FROM p2s2_vfy_b_results WHERE check_id = 'B-07-03'),
      'residual_case_absent'
    ),
    coalesce(
      (SELECT string_agg(check_id || '=' || status, ',' ORDER BY check_id)
         FROM p2s2_vfy_b_results WHERE check_id IN ('B-00-01', 'B-00-02')),
      'precond_absent'
    )
  ) AS actual,
  'Single summary emitter; counts exclude this row; precondition-dependent NOT_RUN tolerated only when B-00 failed; dependency NOT_RUN only when seed failed; F-P2-3 INFO alone must not FAIL'::text AS details;

ROLLBACK;

-- -----------------------------------------------------------------------------
-- B-09-04 — Post-rollback residue verification (separately executable, read-only)
-- NOT part of the rolled-back Block B transaction. Required evidence row.
-- -----------------------------------------------------------------------------
SELECT
  'B-09-04'::text AS check_id,
  'rollback_residue'::text AS verification_area,
  'P0'::text AS severity,
  CASE
    WHEN (
      SELECT count(*)::bigint FROM public.deletion_requests
       WHERE user_email = 'p2s2-migration-verify@example.com'
          OR id IN (
            'c1000000-0000-4000-8000-000000000501',
            'c1000000-0000-4000-8000-000000000502',
            'c1000000-0000-4000-8000-000000000503',
            'c1000000-0000-4000-8000-000000000504',
            'c1000000-0000-4000-8000-000000000601',
            'c1000000-0000-4000-8000-000000000602',
            'c1000000-0000-4000-8000-000000000603',
            'c1000000-0000-4000-8000-000000000604',
            'c1000000-0000-4000-8000-000000000701',
            'c1000000-0000-4000-8000-000000000704',
            'c1000000-0000-4000-8000-000000000801',
            'c1000000-0000-4000-8000-000000000802'
          )
    ) = 0
    AND (
      SELECT count(*)::bigint FROM public.deletion_request_executions
       WHERE deletion_request_id IN (
               SELECT id FROM public.deletion_requests
                WHERE user_email = 'p2s2-migration-verify@example.com'
                   OR id IN (
                     'c1000000-0000-4000-8000-000000000501',
                     'c1000000-0000-4000-8000-000000000601',
                     'c1000000-0000-4000-8000-000000000701',
                     'c1000000-0000-4000-8000-000000000801'
                   )
             )
          OR scan_record_id IN (
               'a1000000-0000-4000-8000-000000000001',
               'a1000000-0000-4000-8000-000000000002',
               'a1000000-0000-4000-8000-000000000003'
             )
          OR deletion_request_id IN (
               'c1000000-0000-4000-8000-000000000501',
               'c1000000-0000-4000-8000-000000000502',
               'c1000000-0000-4000-8000-000000000503',
               'c1000000-0000-4000-8000-000000000504',
               'c1000000-0000-4000-8000-000000000601',
               'c1000000-0000-4000-8000-000000000602',
               'c1000000-0000-4000-8000-000000000603',
               'c1000000-0000-4000-8000-000000000604',
               'c1000000-0000-4000-8000-000000000701',
               'c1000000-0000-4000-8000-000000000704',
               'c1000000-0000-4000-8000-000000000801',
               'c1000000-0000-4000-8000-000000000802'
             )
    ) = 0
    THEN 'PASS' ELSE 'FAIL'
  END AS status,
  'zero durable synthetic request rows and zero durable synthetic execution rows after Block B ROLLBACK'::text AS expected,
  format(
    'request_rows=%s execution_rows=%s',
    (SELECT count(*)::bigint FROM public.deletion_requests
      WHERE user_email = 'p2s2-migration-verify@example.com'
         OR id IN (
           'c1000000-0000-4000-8000-000000000501',
           'c1000000-0000-4000-8000-000000000502',
           'c1000000-0000-4000-8000-000000000503',
           'c1000000-0000-4000-8000-000000000504',
           'c1000000-0000-4000-8000-000000000601',
           'c1000000-0000-4000-8000-000000000602',
           'c1000000-0000-4000-8000-000000000603',
           'c1000000-0000-4000-8000-000000000604',
           'c1000000-0000-4000-8000-000000000701',
           'c1000000-0000-4000-8000-000000000704',
           'c1000000-0000-4000-8000-000000000801',
           'c1000000-0000-4000-8000-000000000802'
         )),
    (SELECT count(*)::bigint FROM public.deletion_request_executions
      WHERE deletion_request_id IN (
              SELECT id FROM public.deletion_requests
               WHERE user_email = 'p2s2-migration-verify@example.com'
            )
         OR scan_record_id IN (
              'a1000000-0000-4000-8000-000000000001',
              'a1000000-0000-4000-8000-000000000002',
              'a1000000-0000-4000-8000-000000000003'
            )
         OR deletion_request_id IN (
              'c1000000-0000-4000-8000-000000000501',
              'c1000000-0000-4000-8000-000000000502',
              'c1000000-0000-4000-8000-000000000503',
              'c1000000-0000-4000-8000-000000000504',
              'c1000000-0000-4000-8000-000000000601',
              'c1000000-0000-4000-8000-000000000602',
              'c1000000-0000-4000-8000-000000000603',
              'c1000000-0000-4000-8000-000000000604',
              'c1000000-0000-4000-8000-000000000701',
              'c1000000-0000-4000-8000-000000000704',
              'c1000000-0000-4000-8000-000000000801',
              'c1000000-0000-4000-8000-000000000802'
            ))
  ) AS actual,
  'Read-only residue check after ROLLBACK; independent request-row and execution-row counts; does not use the rolled-back temp results table'::text AS details;
