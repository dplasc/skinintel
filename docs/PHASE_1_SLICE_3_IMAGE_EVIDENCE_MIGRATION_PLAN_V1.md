# Phase 1 Slice 3 — Image Evidence Migration Plan V1

## Purpose

This document proposes the **Supabase migration plan** for Phase 1 Slice 3: Image Evidence persistence—the first **binary content evidence object** in the Personal Evidence Base.

It defines migration scope, dependencies, execution sequencing, rollback intent, verification posture, and risks while remaining a **planning artifact only**. It does not contain executable migration files, SQL, storage configuration scripts, application code, or authorization to modify Supabase or object storage.

Image Evidence closes the documented capture gap where user-uploaded scan images are transmitted to AI at inference and **not persisted as governed visual evidence server-side** (**docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**, **docs/PHASE_1_SCAN_PERSISTENCE_AUDIT_V1.md**). The migration establishes relational and storage infrastructure for governed artifact references and capture metadata linked to Scan Record V2—not AI observations, symptom labels, or diagnostic content.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft only |
| **Execution approval** | Not approved for execution |
| **Migration file** | Not created by this document |
| **Object storage authorization** | No bucket or policy changes authorized by this document |
| **Supabase authorization** | No Supabase changes authorized by this document |

---

## Migration Scope

This migration plan covers **infrastructure preparation only** for governed Image Evidence persistence. It spans two coordinated workstreams that must be reviewed and approved as a single slice but may be applied in a defined sequence:

| Workstream | Scope |
|------------|-------|
| **Relational evidence store** | Additive introduction of `public.image_evidence` as an Evidence Content Store child of `scan_records` |
| **Governed object storage posture** | Private bucket (or equivalent) provisioning, access policy intent, and artifact path convention sufficient to support `storage_object_ref` integrity |
| **Verification and rollback posture** | Read-only checks, staging-first apply, and rollback intent for relational and storage artifacts |

This migration plan does **not** authorize dual-write application changes, read-path cutover, legacy backfill, or user-visible behavior change. Those remain separately gated artifacts per **docs/PHASE_1_SLICE_3_PLAN_V1.md**.

**Transitional Hybrid invariant:** `analyses` remains the compatibility read model. Migration must not extend `analyses` as the canonical image store or alter existing read paths.

---

## In Scope

The following are in scope for this migration plan at the **planning and execution-intent level**:

| Item | Detail |
|------|--------|
| **New relational table** | `public.image_evidence` — Evidence Content Store for user-origin visual capture artifact reference and capture metadata |
| **Session linkage** | Required association to parent `scan_records` via `scan_record_id`; at most one Image Evidence row per capture session |
| **Ownership and RLS posture** | Enable RLS; SELECT policy scoped to capturing user; no client INSERT/UPDATE/DELETE policies; service-role write posture consistent with Slice 1–2 |
| **Supporting indexes and constraints** | Indexes on ownership, session linkage, and storage reference uniqueness; parent delete protection via restrict semantics; lifecycle status marker for future governance |
| **Inherited consent linkage** | Consent provenance via session chain (`image_evidence` → `scan_records` → `consent_snapshots`); dual-scope audit for `image_processing_consent` and `evidence_storage_consent` |
| **Private object storage posture** | Non-public bucket (or equivalent), user-scoped object path convention, deny-anonymous access, service-role upload intent, no public or CDN URLs |
| **Storage reference integrity** | Relational `storage_object_ref` must reference objects in governed private storage; uniqueness enforced to prevent duplicate evidence claims on the same artifact |
| **Coexistence with Slice 2** | No schema conflict with `user_description_evidence`; both child evidence types may attach to the same `scan_record_id` when present |
| **Slice 1 preservation** | No changes to `scan_records`, `consent_snapshots`, or `analyses` schema in this slice |
| **Staging-first execution** | Apply and verify on staging before production; separate explicit approval for each environment |
| **Schema-only deploy window** | Empty `image_evidence` table and provisioned storage posture may exist before application dual-write is authorized—consistent with Slice 1–2 rollout pattern |
| **Verification checklist** | Relational existence, RLS posture, constraint presence, zero initial row count, Slice 1–2 regression checks, and storage posture confirmation |
| **Rollback intent** | Documented reversal for relational artifacts; explicit handling posture for storage artifacts and orphaned binaries |

**Conceptual field responsibilities** (physical mapping deferred to accepted SQL draft): stable identifier, session linkage, transitional user ownership reference, governed storage object reference, content type, byte size, capture source, non-inference capture metadata envelope, evidence lifecycle status, immutable creation timestamp.

---

## Out of Scope

The following are explicitly excluded from this migration plan and any execution authorized solely by downstream approval:

| Excluded item | Reason |
|---------------|--------|
| **Application code and dual-write deploy** | Separate gated artifact after migration verification |
| **API contract or response shape changes** | Transitional Hybrid preserved; success response unchanged |
| **Read-path cutover from `analyses`** | Compatibility read model remains authoritative for current consumers |
| **ALTER to existing tables** | `scan_records`, `consent_snapshots`, `user_description_evidence`, and `analyses` remain unchanged |
| **Legacy backfill** | Prior captures and historically non-persisted images are not retroactively stored |
| **AI Analysis Result separation** | Intelligence artifact remains in `analyses.result` during transition |
| **User Description Evidence re-scope** | Delivered in Slice 2; not modified here |
| **Product Mention / Routine Mention Evidence** | Separate future slices |
| **Symptom Observation Evidence / Body Area Evidence Link** | Separate future slices |
| **Evidence Confidence Posture storage** | Applicable dimensions acknowledged; persistence deferred |
| **Correction Event storage and correction workflow** | Design-compatible only |
| **Deletion/retention workflow implementation** | Tombstone and binary removal workflow deferred |
| **Signed URL delivery, CDN, image optimization pipelines** | Beyond minimum governed private storage posture |
| **Public or anonymous object access** | Violates privacy and consent boundaries |
| **Storing AI observations in capture metadata** | Prohibited boundary merge per object boundaries document |
| **localStorage governance changes** | Device cache remains non-authoritative |
| **Migration file creation in this document** | Versioned migration file is a separate future artifact |
| **SQL execution or Supabase modification by this document** | Planning only |

---

## Dependencies

All dependencies must be satisfied before migration file creation or infrastructure execution.

### Upstream planning and design gates

| Dependency | Requirement |
|------------|-------------|
| **Slice 3 plan accepted** | **docs/PHASE_1_SLICE_3_PLAN_V1.md** committed and reviewed |
| **Slice 3 technical design accepted** | **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md** committed and reviewed |
| **SQL draft accepted** | **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** reviewed; forward and rollback intent approved |
| **This migration plan accepted** | Scope, order, rollback, and verification posture signed off |
| **Read-only architecture audit** | No P0 blockers on design + SQL draft + this plan before migration file creation |

### Slice 1 — Session and consent foundation

| Dependency | Requirement |
|------------|-------------|
| **`scan_records` operational** | Verified per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** |
| **`consent_snapshots` operational** | Linked to `scan_records`; scope enumeration includes `image_processing_consent` and `evidence_storage_consent` |
| **`analyses.scan_record_id` linkage** | Compatibility linkage operational for new captures |
| **RLS posture pattern** | User-scoped SELECT; service-role write pattern established |

Without verified Slice 1 foundation, Image Evidence has no governed session anchor or consent provenance chain.

### Slice 2 — Child evidence precedent

| Dependency | Requirement |
|------------|-------------|
| **`user_description_evidence` operational** | Slice 2 migration applied and dual-write verified (recommended hard gate before Slice 3 code authorization) |
| **Child evidence pattern proven** | Consent-gated, session-linked, write-only child evidence without read-path cutover |
| **Non-interference** | Slice 3 migration must not alter Slice 2 table semantics or policies |

Slice 2 verification de-risks shared write-path integration before Slice 3 introduces binary persistence complexity.

### Object storage prerequisites

| Dependency | Requirement |
|------------|-------------|
| **Storage posture artifact** | Bucket naming, path convention, policy intent, and service-role upload model documented and accepted (may be embedded in SQL draft companion or separate storage posture document) |
| **Environment parity** | Staging and production storage targets identified; cross-environment reference collision prevented |
| **Supabase project access** | Authorized operator for relational migration and storage configuration with audit trail |

### Downstream dependencies (not satisfied by this migration)

| Dependency | Notes |
|------------|-------|
| **Dual-write code design** | Required before application deploy; defines upload atomicity, failure cleanup, and consent gating |
| **Production dual-write verification** | Post-code artifact; validates rows, storage references, and consent scope joins |

---

## Migration Order

Migration execution follows a **gated, staging-first sequence**. Relational and storage workstreams are ordered to minimize orphaned artifacts and preserve Slice 1–2 stability.

| Phase | Step | Action | Gate |
|-------|------|--------|------|
| **Pre-migration** | 1 | Confirm all **Dependencies** satisfied | Planning and audit sign-off |
| **Pre-migration** | 2 | Accept this migration plan and approved SQL draft | Design review |
| **Pre-migration** | 3 | Create versioned migration file under `supabase/migrations/` | Separate artifact; diff reviewed against SQL draft |
| **Pre-migration** | 4 | Finalize storage posture artifact (bucket, policies, path convention) | Architecture review |
| **Staging** | 5 | Provision private object storage on staging | Explicit staging storage approval |
| **Staging** | 6 | Apply relational migration on staging | Explicit staging Supabase approval |
| **Staging** | 7 | Run **Verification Strategy** on staging | All checks pass |
| **Staging** | 8 | Confirm zero rows in `image_evidence`; confirm Slice 1–2 reads/writes unaffected | Regression sign-off |
| **Production** | 9 | Provision private object storage on production | Separate production storage approval |
| **Production** | 10 | Apply relational migration on production | Separate production Supabase approval |
| **Production** | 11 | Run **Verification Strategy** on production | All checks pass |
| **Post-migration** | 12 | **Do not deploy application code** in this step | Schema and storage infrastructure only |
| **Post-migration** | 13 | Authorize dual-write code design and implementation as separate gated slice | Code gate |

**Ordering rationale:**

1. **Storage posture before or alongside relational apply on each environment** — Application dual-write will require both stores; provisioning storage before code deploy avoids write failures. Relational migration may precede first binary upload because initial row count is zero.
2. **Relational migration before application dual-write** — Matches Slice 1–2 pattern; empty table adds no user-visible behavior until code is separately authorized.
3. **Staging before production** — Binary persistence introduces higher operational risk; staging verification is mandatory.
4. **No parallel competing slices** — Product Mention Evidence, Routine Mention Evidence, read-path cutover, and AI Analysis Result separation must not proceed in parallel with Slice 3 migration execution.

**Write path note (future code slice, not this migration):** Application insert order remains `scan_records` → `consent_snapshots` → optional `user_description_evidence` → `image_evidence` (storage upload coupled with relational insert) → AI analysis → `analyses` compatibility row per **docs/SCAN_RECORD_V2_TRANSITIONAL_MAPPING_V1.md**.

---

## Rollback Strategy

Rollback intent is defined at the **planning level**. Exact rollback steps reside in the accepted SQL draft rollback companion; storage rollback requires separate operational decisions.

### Safe rollback window

Between migration apply and dual-write code deploy, `image_evidence` is empty and no application writes occur. Rollback in this window is **low risk** for relational schema and Slice 1–2 stability.

### Relational rollback

| Step | Intent |
|------|--------|
| 1 | Remove SELECT policy on `image_evidence` |
| 2 | Drop `public.image_evidence` table |
| 3 | Preserve `scan_records`, `consent_snapshots`, `user_description_evidence`, `analyses`, and all existing data |

Relational rollback does **not** modify upstream Slice 1–2 tables or the compatibility read model.

### Storage rollback

| Concern | Intent |
|---------|--------|
| **Bucket and policies** | Removal or deactivation requires separate explicit approval; not automatically coupled to relational DDL rollback |
| **Orphaned binaries** | If dual-write produced storage objects before rollback, binaries may persist after relational table drop; governed cleanup is a separate operational action |
| **Reference integrity** | After relational rollback, no governing evidence rows reference storage objects; objects must not remain publicly accessible |

### Post-code rollback

If application dual-write has produced rows and storage objects:

1. **Revert application code first** — Stop new writes and orphaned upload attempts.
2. **Assess governed data handling** — Rows and binaries may require future deletion-slice semantics before parent session deletion (`ON DELETE RESTRICT` on `scan_record_id`).
3. **Apply relational rollback** — Only after write path is stopped and operational decision on binary retention is recorded.
4. **Execute storage cleanup** — Separate authorized procedure; not implied by relational rollback alone.

### Reversibility

Re-applying forward migration after rollback is feasible at empty-table state. Data loss applies only to dropped `image_evidence` rows and any storage objects intentionally removed during cleanup.

---

## Verification Strategy

Verification is **read-only** and environment-specific. It confirms infrastructure readiness without implying application behavior change.

### Immediate post-migration checks (schema and storage infrastructure)

| # | Check | Expected result |
|---|-------|-----------------|
| 1 | **Table exists** | `image_evidence` present in `public` schema |
| 2 | **Column and constraint posture** | All conceptual fields present; session uniqueness; positive byte size; non-empty storage reference and content type; capture metadata object envelope; lifecycle status enumeration |
| 3 | **Parent linkage** | Foreign key to `scan_records` with restrict delete semantics |
| 4 | **RLS enabled** | Row-level security active on `image_evidence` |
| 5 | **SELECT policy exists** | Authenticated user may read own rows only; no client write policies |
| 6 | **Index posture** | Ownership, session, and storage reference indexes present |
| 7 | **Initial row count** | Zero rows immediately after migration apply |
| 8 | **Slice 1 regression** | `scan_records`, `consent_snapshots`, and `analyses` queries and writes unaffected; no new required columns on legacy read paths |
| 9 | **Slice 2 regression** | `user_description_evidence` unaffected; coexistence join path valid |
| 10 | **Storage posture** | Private bucket exists; anonymous access denied; service-role upload path validated in staging; path convention documented |
| 11 | **Rollback dry-run intent** | Rollback steps documented and reviewed; confirms drop of new relational artifacts only |

Detailed verification queries are defined in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** — referenced by this plan, not duplicated here.

### Post dual-write checks (separate code verification slice)

These checks apply only after application dual-write is separately deployed and authorized:

| # | Check | Expected result |
|---|-------|-----------------|
| 12 | **Consent scope audit** | Rows with image evidence join to session consent snapshot proving both `image_processing_consent` and `evidence_storage_consent` active at capture |
| 13 | **Storage reference integrity** | Each row's `storage_object_ref` resolves to an existing private storage object; no duplicate references across rows |
| 14 | **Coexistence** | Sessions with both image and description inputs may have both child evidence types linked to same `scan_record_id` |
| 15 | **No compatibility drift** | `analyses` row existence alone does not prove Image Evidence persisted; verification queries governed store directly |
| 16 | **Failure posture (code)** | Failed image persistence does not produce success response, AI output, or compatibility row when image was present and consented |

Schema-only migration cannot satisfy checks 12–16 until dual-write code is live.

---

## Risks

| Risk | Description | Mitigation posture |
|------|-------------|-------------------|
| **Binary storage complexity** | Object storage, access policies, and cost controls exceed Slice 1–2 text-only scope | Staging-first apply; explicit storage posture artifact; separate storage and relational approval gates |
| **Orphaned storage objects** | Upload succeeds but relational insert fails (or inverse), leaving ungoverned binaries | Address atomicity and cleanup in dual-write code design; migration plan documents orphan handling in rollback strategy |
| **Dual consent coupling** | Image requires both processing and storage consent; partial consent must not produce persisted artifacts | Application consent gate at capture; verification join audit post-code |
| **Highly sensitive data exposure** | Image artifacts are personal health-adjacent data | Private storage only; no public URLs; RLS and storage policies consistent with Slice 1–2; service-role write posture |
| **`ON DELETE RESTRICT` on session linkage** | Physical `scan_records` deletion blocked while Image Evidence rows exist | Intentional; future deletion workflow must remove or tombstone evidence before parent delete |
| **`user_email` ownership is transitional** | RLS tied to email string until canonical auth user id migration | Accept for Slice 3; mirror Slice 1–2 pattern; defer UUID migration to separate authorized slice |
| **No direct `consent_snapshot_id` FK** | Consent audit depends on join through `scan_records` | `consent_snapshots` has unique session linkage; verification check 12 validates join path |
| **Schema-only deploy before code** | Empty table and empty bucket add no user-visible value until dual-write | Acceptable; matches established rollout pattern; migration and code remain separately gated |
| **SQL draft / migration file drift** | Unreviewed changes between draft and apply | Migration file created only after SQL draft acceptance; mandatory diff review before execution |
| **Storage rollback decoupled from DDL rollback** | Dropping relational table does not remove binaries | Document explicit storage cleanup procedure; do not assume DDL rollback is sufficient post-code |
| **Slice 2 sequencing** | Slice 3 migration or code before Slice 2 verification increases integration risk | Recommend Slice 2 verification before Slice 3 code authorization; migration planning may proceed once Slice 2 schema is applied |
| **Legacy backfill expectation** | Stakeholders may expect historical images in evidence store | Explicit out-of-scope and non-goal; communicate transitional gap |
| **AI observation merge pressure** | Convenience may tempt storing inference metadata in capture metadata | Binding boundary prohibitions; audit in readiness review |
| **Storage cost and retention** | Unbounded retention without governance workflow | Append-only new captures; deletion workflow deferred but schema and storage posture must not block future exclusion |

---

## Success Criteria

Slice 3 migration is successful when the following are satisfied in the target environment(s):

| Criterion | Definition of success |
|-----------|----------------------|
| **Infrastructure readiness** | `image_evidence` relational store and private object storage posture exist and pass verification checklist items 1–11 |
| **Zero initial data** | No rows in `image_evidence` immediately post-migration; no unintended storage objects from migration apply itself |
| **Slice 1–2 stability** | Session stores, description evidence, and compatibility read model unchanged and regression-free |
| **Security posture** | RLS enabled; user-scoped SELECT; no client write policies; storage denies anonymous access |
| **Governance compatibility** | Schema and storage posture support future deletion, correction, and confidence slices without redesign |
| **Transitional Hybrid intact** | `analyses` not extended as canonical image store; no read-path cutover implied by migration |
| **Staging validation** | Staging verification complete before production approval |
| **Approval traceability** | Separate explicit approvals recorded for SQL draft, migration file, storage provisioning, and Supabase apply per environment |
| **No premature code deploy** | Application dual-write not deployed as part of migration execution step |

Migration success does **not** close Slice 3 implementation. Dual-write code deploy and production verification artifact remain separate gates per **docs/PHASE_1_SLICE_3_PLAN_V1.md**.

---

## Explicit Non-Goals

The following outcomes are **explicitly not goals** of this migration plan, even if technically adjacent:

- **Rebuilding the Evidence Layer** — Incremental child evidence infrastructure only
- **Making `analyses` the image store** — Compatibility row must not become canonical visual evidence location
- **Storing AI model observations with the image** — Intelligence output separation remains deferred
- **Enabling display of stored images in history or dashboard** — Read-path changes are out of scope
- **Retroactive recovery of historical scan images** — No backfill from legacy rows or provider caches
- **Implementing user deletion or correction flows** — Design-compatible only; workflow deferred
- **Assigning Evidence Confidence Posture at capture** — Posture dimensions acknowledged; storage deferred
- **Resolving body area or symptom structure from the image** — Separate future objects
- **Optimizing image delivery, CDN, or client-side caching** — Beyond minimum governed private storage
- **Medical diagnosis, disease labeling, or clinical image classification** — Cosmetic scope only
- **Creating migration files or executing SQL in this document** — Separate authorized artifacts and approvals
- **Authorizing application dual-write in this step** — Code gate is downstream of verified migration

---

## Current Decision

**This document proposes migration direction only.**

It defines coordinated relational and object storage infrastructure for `public.image_evidence` with inherited consent linkage, Slice 1–2-aligned RLS, private binary storage posture, and no changes to existing tables. It does **not** authorize:

- Migration file creation (requires accepted SQL draft first)
- Supabase schema apply or SQL Editor runs
- Object storage bucket creation or policy changes
- Application code changes
- API contract changes

**Image Evidence preserves governed visual artifact reference and capture metadata linked to Scan Record V2. It records what the user captured—not AI inference, symptom classification, or diagnostic content.**

**Next steps after acceptance:** (1) finalize SQL draft and storage posture sign-off if not complete, (2) create versioned migration file as separate artifact, (3) apply storage and relational migration on staging with separate approvals, (4) run verification strategy, (5) repeat for production after staging success, (6) authorize dual-write code design and implementation as a **separate gated slice**.
