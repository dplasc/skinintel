# Phase 1 Slice 3 — Image Evidence Storage Audit V1

## Purpose

This document is a **read-only architecture audit** of governed object storage posture for Phase 1 Slice 3: Image Evidence, conducted **before** Supabase migration execution and object storage provisioning.

It evaluates whether accepted design artifacts provide sufficient, consistent, and operationally actionable specification to proceed to:

1. **Staging storage provisioning** (migration plan step 5)
2. **Staging Supabase relational migration apply** (migration plan step 6)
3. **Post-infrastructure verification** (migration plan checklist items 1–11)

This audit does **not** authorize Supabase execution, bucket creation, storage policy application, application code changes, or dual-write deployment. It does **not** mark any execution step as complete.

Image Evidence is the first **binary content evidence object** in the Personal Evidence Base. This audit focuses on the **storage workstream** and its coupling to the relational `image_evidence` store via `storage_object_ref`.

| Attribute | Status |
|-----------|--------|
| **Document status** | Read-only audit artifact |
| **Supabase execution** | **Not complete** — not authorized by this document |
| **Storage provisioning** | **Not complete** — not authorized by this document |
| **Application dual-write** | **Not complete** — out of audit scope |

---

## Audit Scope

### In scope

| Area | Audit intent |
|------|--------------|
| **Cross-artifact consistency** | Storage posture aligned with migration plan, SQL draft, dual-write code design, and prior readiness review |
| **Bucket specification** | Private dedicated bucket identity, separation, and environment posture |
| **Object key specification** | Canonical path template, uniqueness semantics, and `storage_object_ref` coupling |
| **Access policy intent** | Deny-by-default model, service-role upload, no client object access in Slice 3 |
| **Consent gating** | Dual-scope storage authorization requirements |
| **Deletion compatibility** | Future governance alignment without Slice 3 workflow implementation |
| **Execution readiness** | Pre-execution checklist derived from migration plan verification strategy |

### Out of scope

| Area | Reason |
|------|--------|
| **Supabase apply verification** | Execution has not occurred; post-apply checks are future operational work |
| **Live bucket or policy inspection** | No infrastructure provisioned at audit time |
| **Application code review** | Dual-write implementation is a separate post-migration gate |
| **SQL or migration file modification** | Audit is read-only; DDL artifacts are referenced, not changed |
| **Legacy backfill, UI, read-path cutover** | Explicitly excluded from Slice 3 |

---

## Source Documents

| Document | Role in audit | Audit treatment |
|----------|---------------|-----------------|
| **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** | Primary storage architecture specification | Verified against downstream artifacts; resolves prior P1-1 gap from readiness review |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md** | Execution sequence, verification checklist, rollback posture | Verified storage workstream dependencies and staging-first order |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_READINESS_REVIEW_V1.md** | Prior cross-artifact gate (pre-migration file) | Superseded for storage posture gap; relational and code alignment findings retained |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** | Relational store and `storage_object_ref` constraints | Verified storage reference semantics and RLS decoupling |
| **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md** | Upload behavior, path convention, failure cleanup | Verified code design conforms to storage posture template |

**Upstream foundation assumed operational:** Slice 1 session stores per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md**; Slice 2 `user_description_evidence` migration, dual-write implementation, and production verification complete.

**Versioned migration file:** `supabase/migrations/20260708120000_phase_1_slice_3_image_evidence.sql` exists in repository and aligns with SQL draft forward DDL at audit time. Migration file creation gate from readiness review is satisfied; **Supabase apply is not**.

---

## Storage Posture Verification

Cross-artifact review of **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** against source documents:

| Concern | Storage posture | Downstream alignment | Result |
|---------|-----------------|----------------------|--------|
| **Artifact completeness** | Defines bucket strategy, path template, ownership, access, upload, retrieval, deletion compatibility, and future compatibility | Migration plan step 4 prerequisite; code design references posture for path template | **Pass** — standalone artifact present; closes readiness review P1-1 |
| **Binary externalization** | Relational metadata only; bytes in private object storage | SQL draft: no inline binary; `storage_object_ref text NOT NULL` | **Pass** |
| **Reference semantics** | Bucket-relative key; not URL, signed URL, or CDN endpoint | SQL draft comments; code design insert payload | **Pass** |
| **Evidence-first coupling** | Object requires governing row; row requires existing object at commit | Code design: durability before insert; orphan cleanup on insert failure | **Pass** |
| **Server-side upload** | Service-role only; no client upload tokens in Slice 3 | Code design: scan route service-role; no new upload endpoints | **Pass** |
| **Category isolation** | Dedicated skin Image Evidence bucket; separate from product/label/public assets | Migration plan in-scope storage posture; master blueprint category model | **Pass** |
| **Slice 3 cardinality** | At most one object per `scan_record_id` | SQL draft `UNIQUE (scan_record_id)`; code design one row per session | **Pass** |
| **Future multi-image** | Evidence-based uniqueness via `evidence_id`; no bucket redesign | SQL `UNIQUE (scan_record_id)` is Slice 3-only; future slice requires relational constraint change — posture documents intent without contradicting current DDL | **Pass** — future change explicitly scoped to later phase |
| **Transitional ownership** | Phase 1 `user_email` as transitional identifier; not long-term canonical identity | SQL draft and RLS on `user_email`; owner segment aligns with relational predicates | **Pass** |
| **Environment configuration** | Bucket and path prefix via configuration; fail closed if missing | Code design: missing config → 500 before upload | **Pass** |
| **Illustrative env var names** | Names such as `IMAGE_EVIDENCE_STORAGE_BUCKET` marked illustrative, not normative | Code design uses generic "environment variables" language | **Pass** — no normative naming conflict |
| **Document acceptance status** | Reviewed, accepted, committed, and pushed | Migration plan step 4 prerequisite satisfied | **Pass** — formal acceptance complete |

**Storage posture verification summary:** No architectural contradictions identified. The storage posture artifact provides the missing specification referenced across migration plan, SQL draft, and code design.

---

## Bucket Requirements

Derived from storage posture and verified against migration plan and code design.

| Requirement | Specification | Cross-artifact status |
|-------------|---------------|----------------------|
| **Dedicated bucket** | One private bucket per environment for skin Image Evidence | **Aligned** — migration plan in-scope; code design private bucket only |
| **Logical name** | `image-evidence` | **Aligned** — consistent naming convention across posture and migration plan verification item 10 |
| **Public visibility** | Private; no anonymous read or list | **Aligned** — security requirements and access model |
| **Environment isolation** | Staging and production must not share bucket instance | **Aligned** — migration plan cross-environment posture |
| **Separation from other categories** | Not co-located with product, label, or public asset buckets | **Aligned** — bucket separation rationale in posture |
| **DDL scope boundary** | Bucket not created by relational migration | **Aligned** — SQL draft and migration file header comments |
| **Pre-code empty state** | Bucket may exist empty before dual-write | **Aligned** — schema-only deploy window in migration plan |
| **Versioning / lifecycle** | Not required in Slice 3; no automatic expiry | **Aligned** — deletion workflow deferred |
| **Configuration** | Bucket identity supplied via application configuration; missing config fails closed | **Aligned** — code design upload prerequisites |

**Operational note:** Exact Supabase bucket creation steps and policy SQL are **not** defined in source documents. Provisioning operators must translate architecture intent into provider-specific configuration at execution time (see P1-2).

---

## Object Key Requirements

Derived from storage posture canonical template and verified against SQL draft and code design.

### Canonical template

```
{path_prefix}/{owner_segment}/{scan_record_id}/{evidence_id}
```

| Segment | Requirement | Verification |
|---------|-------------|--------------|
| **`path_prefix`** | Default `image-evidence`; configurable; no user/session identifiers | Code design: path convention defers to posture artifact — **aligned** |
| **`owner_segment`** | Phase 1 transitional ownership identifier (normalized email); aligns with RLS `user_email` | SQL draft ownership column; posture ownership model — **aligned** |
| **`scan_record_id`** | Parent Scan Record V2 UUID | SQL draft FK; code design session scoping — **aligned** |
| **`evidence_id`** | Stable UUID; may equal `image_evidence.id` | Code design uniqueness segment; SQL draft PK — **aligned** |
| **`storage_object_ref`** | Full bucket-relative path string | SQL unique index on `storage_object_ref`; code design governed key — **aligned** |

### Key behavior requirements

| Requirement | Status |
|-------------|--------|
| **Opaque, non-guessable keys** | **Pass** — UUID evidence segment; prohibited patterns documented |
| **Non-destructive create** | **Pass** — collision fails; code design `upsert: false` |
| **Global artifact uniqueness** | **Pass** — `UNIQUE (storage_object_ref)` in SQL draft |
| **No public/CDN path segments** | **Pass** — naming rules in posture |
| **No AI or inference in key** | **Pass** — boundary consistent across artifacts |
| **Original bytes only in Slice 3** | **Pass** — no derivatives in evidence bucket |
| **Content type on object metadata** | **Pass** — code design preserves MIME type |

**Minor gap (non-blocking):** Exact email normalization rules for `owner_segment` (e.g., encoding of `@` in path) are described as "platform convention" but not fully specified in source documents. Operators and implementers must define and document one convention before first upload (see P1-1).

---

## Access Policy Requirements

Derived from storage posture access model and verified against SQL draft RLS decoupling and code design.

| Requirement | Policy intent | Relational layer | Object layer | Status |
|-------------|---------------|----------------|--------------|--------|
| **Anonymous access** | Deny all | N/A | Deny list, read, write | **Pass** — posture policy intent #1 |
| **Authenticated client object access** | None in Slice 3 | SELECT own `image_evidence` metadata via RLS | No client READ on bucket objects | **Pass** — decoupling explicit in posture |
| **Service-role upload** | Create at governed paths | Writes bypass RLS (Slice 1–2 pattern) | Allow insert | **Pass** — code design service-role upload |
| **Service-role operational** | Read/delete for verification, orphan cleanup, future deletion | N/A | Allow select and delete | **Pass** |
| **End-user retrieval** | Deferred | Metadata SELECT only | No download in Slice 3 | **Pass** |
| **No persistent public URLs** | Evidence records, API, logs, `analyses` | SQL: ref is not URL | Bucket private | **Pass** |

**Operational note:** Conceptual policy intent is fully specified. Executable Supabase Storage RLS policies are not authored in source documents and must be created at provisioning time without deviating from intent (see P1-2).

---

## Consent Requirements

Derived from storage posture, migration plan, SQL draft audit path, and code design.

| Requirement | Specification | Verification |
|-------------|---------------|--------------|
| **Dual-scope gate** | Both `image_processing_consent` and `evidence_storage_consent` required before upload | Code design consent requirements; posture upload preconditions — **aligned** |
| **No storage without storage consent** | Binary upload and `image_evidence` insert blocked | Code design gating rules — **aligned** |
| **Consent provenance** | Inherited via `image_evidence` → `scan_records` → `consent_snapshots` | SQL draft: no `consent_snapshot_id`; verification query 8 in SQL draft — **aligned** |
| **Application enforcement** | Capture blocked at validation if either scope missing | Code design step 1 gate — **aligned** |
| **Purpose limitation** | Personal cosmetic analysis and evidence storage only | Posture principle 6 — **aligned** |
| **Post-capture withdrawal** | Does not retroactively de-authorize stored artifact; deletion workflow deferred | Posture and deletion compatibility — **aligned** |

**Consent requirements summary:** Storage authorization model is consistently specified across artifacts. Post-apply verification of consent joins (migration plan item 12) remains deferred until dual-write code is live.

---

## Deletion Compatibility Requirements

Derived from storage posture deletion compatibility section and verified against SQL draft lifecycle fields and migration plan rollback posture.

| Requirement | Design-compatible posture | SQL / storage support | Status |
|-------------|---------------------------|----------------------|--------|
| **Future binary removal** | Delete object bytes; revoke retrieval | Service-role delete permitted by policy intent | **Pass** |
| **Relational tombstone** | `evidence_status = 'excluded'` without in-place key mutation | SQL draft `evidence_status` check constraint | **Pass** |
| **Reference revocation** | Key may remain for audit; object absent | Stable `storage_object_ref` text column | **Pass** |
| **Parent session protection** | Child evidence blocks parent delete | `ON DELETE RESTRICT` on `scan_record_id` | **Pass** |
| **Orphan prevention** | Upload failure cleanup; no public orphaned binaries | Code design failure cleanup | **Pass** |
| **Per-user deletion sweep** | Owner segment enables namespace-scoped cleanup | Path template owner segment | **Pass** |
| **Rollback decoupling** | DDL rollback does not remove storage objects | Migration plan storage rollback section | **Pass** |
| **Downstream exclusion** | Deleted evidence excluded from AI/personalization | Documented in posture; workflow deferred | **Pass** |
| **Consent Snapshot immutability** | Deletion does not mutate consent record | Inherited consent model unchanged | **Pass** |

**Deletion compatibility summary:** Storage posture satisfies future governance requirements without mandating Slice 3 deletion workflow implementation.

---

## Execution Readiness Checklist

Pre-execution gates and post-apply verification intent from migration plan, assessed at audit time.

### Pre-execution gates (must pass before staging apply)

| # | Gate | Audit status |
|---|------|--------------|
| 1 | Slice 1 session stores operational | **Assumed met** — per Slice 1 verification artifact |
| 2 | Slice 3 plan, technical design, SQL draft, migration plan accepted | **Assumed met** — readiness review accepted for review |
| 3 | Storage posture artifact present and architecturally consistent | **Met** — this audit confirms cross-artifact alignment |
| 4 | Storage posture formally accepted | **Met** — reviewed, accepted, committed, and pushed |
| 5 | Versioned migration file reviewed against SQL draft | **Met** — migration file present and aligned at audit time |
| 6 | Explicit staging storage provisioning approval recorded | **Not met** — not authorized; execution not started |
| 7 | Explicit staging Supabase migration approval recorded | **Not met** — not authorized; execution not started |

### Post-apply verification intent (migration plan items 1–11)

These checks define success **after** execution. None are complete at audit time.

| # | Check | Ready to execute post-apply? |
|---|-------|------------------------------|
| 1 | `image_evidence` table exists | Specification ready — DDL in migration file |
| 2 | Column and constraint posture | Specification ready — matches SQL draft |
| 3 | FK to `scan_records` with RESTRICT | Specification ready |
| 4 | RLS enabled | Specification ready |
| 5 | SELECT policy; no client write policies | Specification ready |
| 6 | Index posture | Specification ready |
| 7 | Zero initial row count | Verifiable post-apply |
| 8 | Slice 1 regression | Verifiable post-apply |
| 9 | Slice 2 regression | Verifiable post-apply |
| 10 | Storage posture: private bucket; anonymous denied; path documented | Verifiable post-provisioning — requires operational policy apply (P1-2) |
| 11 | Rollback dry-run intent reviewed | Documented in SQL draft and migration plan |

**Checklist summary:** Relational specification is execution-ready. Storage provisioning requires translating posture intent into provider configuration before item 10 can pass.

---

## P0 Blockers

**None identified.**

No contradictions, missing storage specifications, boundary violations, or relational/storage coupling gaps were found that would prevent proceeding to **gated** staging storage provisioning—subject to explicit execution approvals. Supabase migration execution remains a separate gate pending completion of storage provisioning.

This audit does **not** assert that Supabase execution has occurred or succeeded.

---

## P1 Issues

Issues requiring acknowledgment or resolution in downstream gates. None are P0 blockers.

| ID | Issue | Risk | Resolution gate |
|----|-------|------|-----------------|
| **P1-1** | **Owner segment normalization convention underspecified** — posture requires normalized transitional email in path but does not define exact encoding (e.g., `@` handling) | Path/RLS misalignment or cross-environment inconsistency if convention differs between provisioning and code | Document single normalization rule in implementation/deploy runbook before first upload; code and bucket policies must match |
| **P1-2** | **Executable storage policies not authored** — posture defines conceptual policy intent only; no Supabase Storage policy definitions in source documents | Policy drift at provisioning time | Author provider-specific policies at staging provisioning; verify against access policy requirements section before sign-off |
| **P1-3** | **Storage rollback decoupled from DDL rollback** | Orphan binaries if code deploys then rolls back | Accepted deferred risk per migration plan; operational cleanup procedure required post-code |
| **P1-4** | **Transitional `user_email` ownership** | Future canonical user id migration requires coordinated relational and storage path change | Accepted; mirrors Slice 1–2; separate authorized slice |
| **P1-5** | **Supabase execution not started** | N/A at audit time — expected | Record explicit per-environment approval after staging storage provisioning is complete; run verification items 1–11 after relational apply |

---

## Verdict

**Ready to proceed to explicit staging storage provisioning approval.**

This read-only audit confirms that **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** is accepted and resolves the storage specification gap identified in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_READINESS_REVIEW_V1.md**. Bucket requirements, object key template, access policy intent, consent gating, and deletion compatibility are consistently specified and aligned with the migration plan, SQL draft, and dual-write code design.

**Supabase migration execution remains pending.** Relational migration apply must not proceed until staging storage provisioning is completed, verified, and explicitly approved per migration plan sequencing.

**P0 blockers:** None.

**Conditions before staging storage provisioning:**

1. Explicit recorded approval for staging storage provisioning (migration plan step 5)
2. Operational translation of access policy intent into provider-specific bucket policies (P1-2)
3. Documented owner segment normalization convention (P1-1)

**Conditions before staging Supabase migration apply (after storage provisioning):**

1. Staging storage provisioning completed and verified (migration plan checklist item 10)
2. Explicit recorded approval for staging Supabase migration apply (migration plan step 6)

**Explicitly not complete at audit time:**

- Staging storage provisioning or policy application
- Supabase migration execution (staging or production)
- Post-apply verification checklist items 1–11
- Application dual-write implementation or production verification

**Recommended sequence:** Approve and execute staging storage provisioning → verify storage posture (checklist item 10) → approve and apply staging relational migration → run verification items 1–11 → repeat for production with separate approvals → authorize dual-write code only after infrastructure verification passes.

This audit **does not** authorize execution. It confirms architectural readiness to enter the staging storage provisioning gate defined in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**.
