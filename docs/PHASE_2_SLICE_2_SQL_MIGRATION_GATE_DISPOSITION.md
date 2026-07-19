# Phase 2 Slice 2 SQL Migration Gate Disposition

## Status

**Artifact type:** Governance decision record
**Source review:** Final read-only Fable 5 High gate review of `PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`

| Item | Disposition |
|------|-------------|
| Gate decision | **PASS** |
| P0 findings | None |
| P1 findings | None |
| SQL draft | **Authorized** â€” preparation of the executable SQL draft artifact may proceed |
| SQL execution | **Not authorized** |
| Migration file creation | **Not authorized** until separate review approval of the SQL draft |

This record closes the gate review of the SQL Migration Design. It does not authorize database change, application implementation, or lifecycle invocation.

---

## Approved Design Baseline

The committed SQL Migration Design (`PHASE_2_SLICE_2_SQL_MIGRATION_DESIGN.md`) remains **approved and binding**. The following design elements are locked for the SQL draft:

| Element | Binding posture |
|---------|-----------------|
| `deletion_requests` | New governance record table; primary request workflow surface |
| `deletion_request_executions` | New append-only execution-attribution table |
| CHECK-based vocabularies | Closed `request_scope`, `request_state`, and `resolution_code` via `CHECK` constraints â€” not database enums |
| `user_email` ownership convention | Owner identity on request rows; RLS aligned with repository convention; no `auth.users` FK |
| Durable intake boundary | Recognized scope + structurally valid target shape â†’ insert as `received`; post-intake validation may reject without erasing the row |
| Request transition guard | One non-`SECURITY DEFINER` trigger function and trigger on `deletion_requests` for allowed transitions and request-row immutability |
| Deferred cross-table consistency guard | One additional non-`SECURITY DEFINER` function with deferred constraint triggers on both new tables for end-of-transaction state/scope/cardinality consistency |
| Authenticated ownership-scoped read | `authenticated` SELECT only on `deletion_requests`, ownership predicate per repository identity convention |
| Service-role workflow writes | Service-role INSERT, SELECT, and constrained UPDATE on requests; service-role INSERT and SELECT on executions; no application DELETE |
| Dormant-on-arrival | Empty new structures at migration completion; no backfill; no lifecycle invocation; no consumption by application code until a later approved step |
| No modification of existing objects | No change to existing tables, views, functions, policies, grants, or primitives |

The SQL draft must implement this baseline. It must not reinterpret, narrow, or expand it.

---

## P2 Finding Dispositions

Four P2 findings were raised during gate review. Each is dispositioned below. All four are **binding** on the SQL draft.

### F-1 â€” Insert-State Enforcement

**Decision:** The request transition guard must also enforce **insertion posture**.

A newly inserted `deletion_requests` row must have:

- `request_state = received`
- `validated_at IS NULL`
- `resolved_at IS NULL`
- `resolution_code IS NULL`

Direct insertion as `executed` or `rejected` is **forbidden**.

The SQL draft must implement this without `SECURITY DEFINER`.

---

### F-2 â€” Account-Wide Zero-Session Case

**Decision:** The approved invariant remains:

**`account_wide` + `executed` requires at least one `deletion_request_executions` row.**

If an account-wide request resolves to zero eligible active session anchors, it must **not** be recorded as `executed`. It resolves as:

- `request_state = rejected`
- `resolution_code = already_completed`

No forward migration is required for Slice 2.

---

### F-3 â€” Authenticated SELECT Policy Role

**Decision:** The ownership-scoped SELECT policy on `deletion_requests` must be explicitly scoped:

**`TO authenticated`**

It must **not** use `TO public`.

The ownership predicate remains consistent with the repository identity convention:

`lower(user_email) = lower(auth.jwt() ->> 'email')`

`anon` receives no policy and no usable table privilege on `deletion_requests`.

---

### F-4 â€” Migration Preflight

**Decision:** The SQL draft must include a Slice 1A-style preflight block **before** object creation.

The preflight must verify:

- Required dependency objects exist
- `public.deletion_requests` does not already exist
- `public.deletion_request_executions` does not already exist
- Proposed trigger-function names do not collide
- Proposed trigger names do not collide on the target tables

Failure of any precondition must **stop the migration before partial object creation**.

---

## Binding SQL Draft Instructions

The future SQL draft artifact must:

1. Implement all four P2 dispositions (**F-1** through **F-4**) exactly as stated above.
2. Remain faithful to the approved SQL Migration Design baseline in every other respect.
3. **Not reinterpret** any disposition â€” insertion posture, zero-session account-wide rejection, authenticated-only SELECT policy scope, and preflight preconditions are mandatory, not advisory.
4. Contain no scope expansion beyond the approved persistence capability (deletion-request governance record and execution attribution).
5. Introduce no modification of existing database objects.

Ambiguity at draft time is resolved by this disposition record and the approved SQL Migration Design â€” not by drafter inference.

---

## Authorization Boundary

### Authorized

- Preparation of the executable SQL draft artifact, subject to the approved design baseline and all four P2 dispositions
- Preparation of a migration file **only after** separate review approval of the SQL draft

### Not authorized

- SQL execution
- Supabase changes
- Application implementation
- API or UI changes
- Lifecycle invocation
- Production data changes

---

## Exit Criteria

This gate disposition record is **complete** when:

- [x] All four P2 findings (F-1 through F-4) are explicitly dispositioned
- [x] No executable SQL is included in this record
- [x] No other file is modified by this gate step
- [x] The SQL drafter can proceed without guessing

---

*End of Phase 2 Slice 2 SQL Migration Gate Disposition.*
