# Phase 1 Slice 3 — Image Evidence Readiness Review V1

## Purpose

This document is the **final gate review** for Phase 1 Slice 3 (Image Evidence) **before** creating the versioned Supabase migration file.

It confirms that all upstream planning, technical design, SQL draft, migration plan, and dual-write code design artifacts are aligned; risks are understood; scope boundaries are preserved; and relational migration intent is coherent with governed object storage posture. This is a **review artifact only**. It does not authorize Supabase execution, object storage provisioning, application code changes, SQL runs, or migration file creation by itself.

Image Evidence is the first **binary content evidence object** in the Personal Evidence Base. This review evaluates readiness to materialize the relational foundation (`image_evidence`) as a versioned migration file derived from the accepted SQL draft. Storage bucket provisioning, dual-write implementation, and production verification remain separately gated.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**, **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**, **docs/PHASE_1_SLICE_2_USER_DESCRIPTION_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Review artifact only |
| **Migration file creation** | Not authorized by this document alone |
| **Supabase execution** | Not authorized |
| **Object storage provisioning** | Not authorized |
| **Application code implementation** | Not authorized |

---

## Reviewed Artifacts

| Artifact | Review status | Summary |
|----------|---------------|---------|
| **docs/PHASE_1_SLICE_3_PLAN_V1.md** | **Accepted for review** | Selects Image Evidence as Slice 3; defines boundaries, consent dual-scope, transitional hybrid posture, and gated implementation sequence |
| **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md** | **Accepted for review** | Maps plan to `image_evidence` store model, write/read behavior, consent and failure rules, security boundaries, and governance compatibility |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** | **Accepted for review** | Proposes forward DDL, RLS, constraints, indexes, verification queries, and rollback intent for `public.image_evidence` |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** | **Accepted for review** | Defines relational and storage workstreams, dependencies, staging-first execution order, rollback, and verification checklist |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md** | **Accepted for review** | Designs `app/api/scan/route.ts` extension: storage upload, evidence insert, consent gating, fail-closed behavior, logging, and verification intent |

**Upstream foundation assumed:**

| Dependency | Status |
|------------|--------|
| **Slice 1 session stores** | Verified per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** — `scan_records`, `consent_snapshots`, `analyses.scan_record_id` operational |
| **Slice 2 child evidence schema** | `user_description_evidence` defined and implemented in application write path; coexistence with Image Evidence on same `scan_record_id` is architecturally supported |
| **Slice 2 dual-write verification document** | Not present in repository — recommended before Slice 3 **code** deploy; does not block relational migration file creation |

**Not yet created:**

| Artifact | Notes |
|----------|-------|
| **Storage posture artifact** | Bucket name, path template, and storage policy intent referenced across migration plan and code design; standalone accepted document not yet in repository |
| **Versioned migration file** | Next authorized artifact if this review passes |
| **Dual-write verification document** | Post-code closure artifact |

---

## Architecture Consistency Review

Cross-artifact review confirms architectural alignment on binding concerns:

| Concern | Alignment across artifacts |
|---------|---------------------------|
| **Evidence object boundary** | Image Evidence records visual artifact reference and capture metadata only — not AI observations, symptom labels, diagnostic content, or Intelligence Layer output |
| **Store placement** | `image_evidence` in Evidence Content Stores per **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**; does not extend `analyses` as canonical image store |
| **Session linkage** | Required FK to `scan_records`; at most one Image Evidence row per capture session (`UNIQUE (scan_record_id)`) |
| **Binary posture** | Image bytes in governed private object storage; relational row holds `storage_object_ref` only — no inline bytes, no public URLs |
| **Consent provenance** | Inherited via `scan_record_id` → `consent_snapshots`; no `consent_snapshot_id` column; dual-scope gate: `image_processing_consent` + `evidence_storage_consent` |
| **Write order (future code)** | `scan_records` → `consent_snapshots` → optional `user_description_evidence` → `image_evidence` (storage + insert) → AI → `analyses` |
| **Evidence-first invariant** | Child evidence and binary persistence complete before AI analysis and compatibility row |
| **Coexistence with Slice 2** | Image Evidence and User Description Evidence are independent object classes on same session when both inputs present; no field merge |
| **Failure posture** | Storage or evidence failure stops before AI; no false success; no partial `analyses` row when image was present and consented |
| **RLS posture** | SELECT on `user_email`; service-role writes only; consistent with Slice 1–2 |
| **Deletion coupling** | `ON DELETE RESTRICT` from `scan_records`; tombstone/deletion workflow deferred but design-compatible |
| **Transitional Hybrid** | `analyses` remains compatibility/read model; write-only Image Evidence foundation; no read-path cutover |
| **Scope exclusions** | No UI changes; no API response shape changes on success; no legacy backfill; no correction/deletion/confidence workflow in Slice 3 |

**Write-order consistency:** Plan, technical design, SQL draft design decisions, migration plan, and dual-write code design all agree on physical ordering constrained by verified Slice 1–2 implementation (`scan_records` before `consent_snapshots` because of FK). Image Evidence precedes AI under evidence-first governance. Relative order of User Description Evidence and Image Evidence is flexible; code design preserves current route order (description before image persistence) to minimize diff scope — consistent with plan allowance.

**Authority model:** No artifact contradicts **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**. Evidence stores remain authoritative for capture concerns; `analyses` row existence must not be interpreted as proof of Image Evidence persistence.

---

## SQL Consistency Review

Review of **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** against technical design, migration plan, and code design insert payload:

| Element | SQL draft | Downstream alignment |
|---------|-----------|---------------------|
| **Table** | `public.image_evidence` | Matches technical design and migration plan |
| **Columns** | `id`, `scan_record_id`, `user_email`, `storage_object_ref`, `content_type`, `byte_size`, `capture_source`, `capture_metadata`, `evidence_status`, `created_at` | Matches technical design conceptual fields and code design insert payload |
| **FK** | `scan_record_id` → `scan_records(id)` `ON DELETE RESTRICT` | Matches technical design, migration plan, Slice 2 precedent |
| **Cardinality** | `UNIQUE (scan_record_id)` | Matches one-image-per-session Slice 3 rule across all artifacts |
| **Storage reference** | `storage_object_ref text NOT NULL` + unique index | Matches code design governed key; not URL |
| **Capture metadata** | `jsonb NOT NULL DEFAULT '{}'` + object-type check | Matches code design non-inference envelope constraint |
| **Lifecycle** | `evidence_status IN ('active', 'excluded')` | Matches technical design tombstone compatibility |
| **Integrity checks** | Non-empty ref/content_type; positive `byte_size` | Supports code design byte integrity and content type preservation |
| **RLS** | Enabled; SELECT policy on `user_email`; no client write policies | Matches Slice 1–2 and code design service-role write model |
| **Indexes** | Ownership temporal, session lookup, storage ref uniqueness | Supports verification and audit queries in SQL draft |
| **Rollback** | Drop policy + table only; preserves Slice 1–2 tables and `analyses` | Matches migration plan rollback strategy |
| **Verification queries** | Ten read-only checks including consent join and coexistence join | Referenced by migration plan and code design verification strategy |
| **No upstream ALTER** | No changes to `scan_records`, `consent_snapshots`, `user_description_evidence`, `analyses` | Matches migration plan in-scope boundary |

**SQL draft scope boundary:** Forward DDL correctly scopes to relational artifacts only. Object storage bucket creation and storage policies are explicitly out of SQL draft scope — consistent with migration plan two-workstream model.

**Minor note (non-blocking):** `image_evidence_scan_record_id_idx` is redundant with `UNIQUE (scan_record_id)` constraint index. Acceptable for explicit audit query support; no migration file change required unless optimization is desired at implementation time.

**Cross-artifact consistency:** Forward SQL in the SQL Draft, migration plan conceptual schema, and dual-write code design insert payload are aligned on columns, constraints, consent inheritance, and `ON DELETE RESTRICT`. Versioned migration file must follow accepted forward DDL without unaudited drift.

---

## Migration Readiness

Assessment of **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** readiness for the **relational migration file** gate:

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Scope defined** | **Ready** | Additive `image_evidence` only; no ALTER to Slice 1–2 tables |
| **Dependencies documented** | **Ready** | Slice 1 verified; Slice 2 schema coexistence acknowledged |
| **Execution sequence** | **Ready** | Staging-first; schema-only deploy before code; separate approvals per environment |
| **Verification checklist** | **Ready** | Items 1–11 for post-migration infrastructure; items 12–16 correctly deferred to post-code |
| **Rollback intent** | **Ready** | Relational rollback documented; storage rollback decoupling explicitly stated |
| **Risk register** | **Ready** | Binary storage, orphan objects, dual consent, and drift risks identified with mitigations |
| **SQL draft as DDL source** | **Ready** | Migration plan references SQL draft; diff review required at file creation |
| **Storage workstream** | **Partially ready** | Migration plan defines storage posture requirements; standalone storage posture artifact not yet accepted (see P1 Issues) |

**Relational migration file readiness:** The migration plan, SQL draft forward DDL, and rollback companion provide sufficient specification to create a versioned migration file under `supabase/migrations/` without scope ambiguity.

**Not ready by this review (separate gates):**

- Supabase migration **execution** on staging or production
- Private object storage bucket **provisioning**
- Application dual-write **implementation**

---

## Code Design Readiness

Assessment of **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md** readiness for **future implementation** (not authorized by this review):

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Target file scope** | **Ready** | Single-file change to `app/api/scan/route.ts`; minimal diff discipline |
| **Write order** | **Ready** | Aligns with SQL draft and transitional mapping; step 6 before AI |
| **Storage upload rules** | **Ready** | Service-role, private bucket, path convention, upsert false, orphan cleanup on insert failure |
| **Insert payload** | **Ready** | Matches SQL draft columns and constraints |
| **Consent gating** | **Ready** | Dual-scope requirement consistent with plan and technical design |
| **Failure behavior** | **Ready** | Fail-closed before AI; no false success; analyses coupling correct |
| **AI execution rules** | **Ready** | Evidence-first gate; no inference in evidence; P1-2 parse integrity preserved |
| **analyses compatibility** | **Ready** | No image reference added; non-authoritative posture preserved |
| **Logging** | **Ready** | New failure stages defined; prohibited sensitive logging explicit |
| **Verification intent** | **Ready** | Post-deploy checks defined; references SQL draft queries |
| **Implementation precondition** | **Not met** | Requires `image_evidence` table live and storage posture artifact accepted before deploy |

**Code design is architecturally ready** for gated implementation after relational migration apply and storage provisioning. This review does not authorize code changes.

**Current route alignment notes:** Existing `app/api/scan/route.ts` implements Slice 1–2 write path and P1-2 remediation (parse failure returns 500). Image buffer is currently read after User Description Evidence insert; code design requires single buffer read reused for storage upload and AI — implementation must refactor read timing without changing external behavior.

---

## Risks

Consolidated risk register from reviewed artifacts and cross-artifact review:

| Risk | Impact | Mitigation posture |
|------|--------|-------------------|
| **Binary storage complexity** | Operational and security surface exceeds Slice 1–2 | Staging-first; separate storage posture artifact; dual approval gates for storage and relational apply |
| **Orphaned storage objects** | Ungoverned binaries if upload succeeds and relational insert fails | Code design mandates best-effort cleanup; migration plan documents decoupled storage rollback |
| **Dual consent coupling** | Partial consent must not produce persisted artifacts | Application gate; verification join audit post-code |
| **Highly sensitive data** | Personal health-adjacent image exposure | Private storage; no public URLs; RLS; service-role writes; logging prohibitions |
| **`ON DELETE RESTRICT`** | Parent session deletion blocked while evidence exists | Intentional; future deletion workflow required |
| **`user_email` transitional ownership** | RLS tied to email until UUID migration | Accepted Slice 1–2 pattern; deferred to separate slice |
| **Inherited consent (no direct FK)** | Audit depends on join path | `consent_snapshots` unique on `scan_record_id`; verification query 8 in SQL draft |
| **Storage posture artifact gap** | Code and storage provisioning blocked until path template and policies defined | P1 — finalize before storage provisioning and code deploy, not before relational migration file |
| **Slice 2 verification gap** | Integration risk on shared write path | P1 — recommended before Slice 3 code; migration file may proceed |
| **SQL draft / migration file drift** | Unreviewed DDL changes at apply time | Mandatory diff review at migration file creation |
| **Schema-only deploy window** | Empty table until code deploy | Expected; matches Slice 1–2 rollout |
| **Legacy backfill expectation** | Stakeholder confusion on historical images | Explicit non-goal across all artifacts |
| **AI observation merge pressure** | Boundary violation in `capture_metadata` | Prohibited across plan, design, SQL comments, and code design |
| **Storage cost and retention** | Unbounded binary retention | Append-only new captures; deletion workflow deferred but schema supports `excluded` |

---

## P0 Blockers

**None identified.**

No contradictions, missing relational specifications, or boundary violations were found that would prevent creation of a versioned migration file derived from the accepted SQL draft forward DDL. All five reviewed artifacts are internally consistent on scope, write order, consent model, failure posture, and Transitional Hybrid direction.

---

## P1 Issues

Issues requiring acknowledgment or resolution in downstream gates. None block relational migration file creation.

| ID | Issue | Risk | Resolution gate |
|----|-------|------|-----------------|
| **P1-1** | **Storage posture artifact not yet created** — bucket name, object path template, and storage access policy intent are referenced across migration plan and code design but no standalone accepted document exists in repository | Storage provisioning and dual-write code deploy cannot proceed with ad hoc conventions | Finalize and accept storage posture artifact **before** migration plan step 5 (staging storage provisioning); not required for relational migration file creation |
| **P1-2** | **Slice 2 dual-write verification document absent** — recommended hard gate before Slice 3 code authorization | Shared write-path integration risk | Complete Slice 2 verification artifact before Slice 3 **code** deploy; does not block relational migration file or schema-only apply |
| **P1-3** | **Image buffer read timing in current route** — `app/api/scan/route.ts` reads image buffer after User Description Evidence insert; code design requires single early buffer read for storage upload and AI reuse | Implementation refactor required; no architectural inconsistency | Address in Slice 3 code implementation PR against accepted code design |
| **P1-4** | **Storage rollback decoupled from DDL rollback** — dropping `image_evidence` does not remove stored binaries post-code | Orphan binaries after rollback | Documented in migration plan; operational cleanup procedure required at post-code rollback — accepted deferred risk |
| **P1-5** | **Transitional `user_email` ownership** — RLS and storage path scoping tied to email string | Future auth user id migration requires coordinated change | Accepted; mirrors Slice 1–2; separate authorized slice |
| **P1-6** | **P1-2 false-success (historical)** — pre-Slice-2 defect in scan route JSON parse path | Current route returns 500 on parse failure — remediated | Code design preserves remediation; verify in Slice 3 implementation diff review |

---

## Final Verdict

**Ready to create the versioned migration file.**

All five reviewed Slice 3 artifacts are architecturally consistent. Relational scope is bounded: additive `public.image_evidence` with Slice 1–2-aligned RLS, inherited consent linkage, external binary storage reference, and no changes to upstream tables or `analyses`. Forward DDL, rollback intent, and verification queries in the SQL draft align with technical design, migration plan, and dual-write code design insert payload.

**P0 blockers:** None.

**P1 issues:** Six items acknowledged — storage posture artifact (P1-1) and Slice 2 verification (P1-2) must be resolved before storage provisioning and code deploy respectively; they do not block migration file creation.

This review **does not** authorize:

- Supabase migration execution (staging or production)
- Object storage bucket creation or policy changes
- Application code changes to `app/api/scan/route.ts`
- API contract or read-path changes

**Next authorized artifact:** Versioned migration file under `supabase/migrations/`, derived from forward DDL in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**, with mandatory diff review against the SQL Draft to prevent unaudited drift.

**Recommended sequence after migration file:** migration file review → separate Supabase execution approval → staging apply and verification (items 1–11) → storage posture acceptance and staging storage provisioning → production apply → separate code implementation authorization → dual-write verification artifact.
