# Phase 1 Slice 3 — Storage Provisioning Runbook V1

## Purpose

This document is the **operational runbook** for Phase 1 Slice 3 staging storage provisioning—the manual execution checklist that translates accepted architecture into safe, auditable infrastructure work.

It operationalizes **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** and **docs/PHASE_1_SLICE_3_STORAGE_AUDIT_V1.md** for migration plan **step 5** (staging storage provisioning). It defines what an authorized operator must verify before, during, and after creating the governed private Image Evidence bucket on the **staging** Supabase project.

Image Evidence stores user-uploaded scan image bytes as governed personal capture artifacts linked to Scan Record V2—not AI observations, symptom classifications, or diagnostic content.

This is an **operations runbook only**. It does not contain SQL, application code, storage policy scripts, or authorization to execute provisioning by itself.

| Attribute | Status |
|-----------|--------|
| **Document status** | Operational runbook — staging provisioning |
| **Target environment** | Staging only |
| **Provisioning execution** | **Not complete** — not authorized by this document alone |
| **Production provisioning** | **Not authorized** by this runbook |
| **Supabase relational migration** | **Not authorized** by this runbook |

Sources: **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md**, **docs/PHASE_1_SLICE_3_STORAGE_AUDIT_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**.

---

## Preconditions

All preconditions must be confirmed **before** beginning bucket creation. If any precondition fails, stop and resolve before proceeding.

| # | Precondition | Confirmation |
|---|--------------|--------------|
| 1 | **Storage posture accepted** — **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** reviewed, accepted, committed, and pushed | ☐ Confirmed |
| 2 | **Storage audit passed** — **docs/PHASE_1_SLICE_3_STORAGE_AUDIT_V1.md** verdict: ready for explicit staging storage provisioning approval | ☐ Confirmed |
| 3 | **Slice 1 operational** — `scan_records`, `consent_snapshots`, and `analyses.scan_record_id` verified per **docs/PHASE_1_SLICE_1_DUAL_WRITE_VERIFICATION_V1.md** | ☐ Confirmed |
| 4 | **Slice 2 complete** — `user_description_evidence` migration, dual-write implementation, and production verification complete on staging project | ☐ Confirmed |
| 5 | **Explicit staging storage approval recorded** — migration plan step 5 approval documented (ticket, change record, or sign-off) with operator identity and timestamp | ☐ Confirmed |
| 6 | **Correct Supabase project** — operator has confirmed staging project ID, region, and dashboard access; not production | ☐ Confirmed |
| 7 | **Service-role access available** — service-role key available for post-provisioning verification only; not exposed to client or logged | ☐ Confirmed |
| 8 | **No conflicting bucket** — no existing `image-evidence` bucket on staging, or existing bucket reviewed and explicitly handled per rollback notes | ☐ Confirmed |
| 9 | **Operator read this runbook end-to-end** — including P0 stop conditions and rollback notes | ☐ Confirmed |

**This runbook does not substitute for explicit execution approval.** Preconditions 5 and 6 are mandatory gates.

---

## Target Environment

| Element | Value |
|---------|-------|
| **Environment** | **Staging** |
| **Provider** | Supabase Storage (staging Supabase project) |
| **Bucket logical name** | `image-evidence` |
| **Path prefix (default)** | `image-evidence` |
| **Initial object count expected** | Zero — bucket provisioned empty; no test uploads with real user data in this step |
| **Production** | **Out of scope** — requires separate runbook authorization and explicit production approval (migration plan step 9) |

**Environment isolation rule:** Staging and production must never share a bucket instance. Do not point staging application configuration at a production bucket or vice versa.

---

## Provisioning Scope

### In scope (this runbook)

| Item | Detail |
|------|--------|
| **Create private bucket** | Dedicated `image-evidence` bucket on staging Supabase project |
| **Configure bucket privacy** | Non-public; deny anonymous access |
| **Apply storage access posture** | Service-role upload/read/delete; no authenticated client object access in Slice 3 |
| **Document path convention** | Canonical object key template and owner segment normalization rule |
| **Verify empty bucket state** | Zero objects after provisioning |
| **Record execution evidence** | Checklist completion, operator, timestamp, project reference |

### Out of scope (this runbook)

| Item | Reason |
|------|--------|
| **Production bucket provisioning** | Separate approval and runbook instance required |
| **Supabase relational migration apply** | Migration plan step 6 — separate explicit approval after storage verification |
| **Application dual-write deploy** | Post-infrastructure code gate |
| **Test image uploads with user data** | Deferred to dual-write verification after code deploy |
| **Signed URL or client download configuration** | Deferred to future governed retrieval slice |
| **CDN, image optimization, or transcoding** | Explicit non-goal per storage posture |
| **Relational `image_evidence` table creation** | DDL migration is a separate gated step |

---

## Bucket Creation Checklist

Execute in order. Record completion time and operator for each step.

| Step | Action | Pass criteria | Done |
|------|--------|---------------|------|
| **1** | Open Supabase Dashboard → **staging project** → Storage | Project name and ID match preconditions | ☐ |
| **2** | Confirm no existing `image-evidence` bucket, or halt if conflict unresolved | No naming collision, or rollback/cleanup completed first | ☐ |
| **3** | Create new bucket with name **`image-evidence`** | Bucket name exactly `image-evidence` (lowercase, hyphenated) | ☐ |
| **4** | Set bucket visibility to **Private** at creation (do not create as public) | Public access disabled at bucket level | ☐ |
| **5** | Do **not** enable public URL generation or anonymous access options | No public bucket flag; no "public bucket" toggle enabled | ☐ |
| **6** | Do **not** co-locate skin Image Evidence in an existing product, avatar, or marketing bucket | Dedicated bucket only | ☐ |
| **7** | Confirm bucket appears in Storage list with **Private** indicator | Visual confirmation in dashboard | ☐ |
| **8** | Confirm bucket object count is **zero** | Empty bucket; no seed or test objects | ☐ |
| **9** | Record bucket identifier for application configuration (bucket name `image-evidence`) | Documented in execution record; service-role key not committed to repository | ☐ |

**Do not upload objects during bucket creation** except as required by a controlled service-role verification step in the Verification Checklist (non-production test object only, removed after verify).

---

## Bucket Privacy Checklist

Verify privacy posture after bucket creation and after any policy changes.

| # | Check | Expected result | Done |
|---|-------|-----------------|------|
| 1 | Bucket **Public** flag disabled | Private bucket only | ☐ |
| 2 | No anonymous read of objects | Unauthenticated request to object URL fails or returns unauthorized | ☐ |
| 3 | No anonymous list of bucket contents | Unauthenticated list operation denied | ☐ |
| 4 | No anonymous write/upload | Unauthenticated insert denied | ☐ |
| 5 | No public CDN or permanent public URL exposed for bucket | No shareable public links enabled | ☐ |
| 6 | Bucket not referenced in client-side code or public configuration | Server-side configuration only | ☐ |
| 7 | Bucket separated from other image categories | No shared bucket with product, label, or static assets | ☐ |

If any privacy check fails, treat as **P0 stop condition** — do not proceed to application configuration or relational migration.

---

## Storage Policy Checklist

Translate storage posture access model into Supabase Storage policy configuration. Apply via Supabase Dashboard Storage policies or approved infrastructure tooling—**without deviating from intent below**.

### Required policy posture (Slice 3)

| # | Policy intent | Required configuration | Done |
|---|---------------|------------------------|------|
| 1 | **Deny anonymous operations** | No policy grants `anon` role SELECT, INSERT, UPDATE, or DELETE on `image-evidence` bucket | ☐ |
| 2 | **Deny authenticated client object access** | No policy grants `authenticated` role SELECT, INSERT, UPDATE, or DELETE on bucket objects in Slice 3 | ☐ |
| 3 | **Allow service-role insert** | Service role can upload (INSERT) objects under governed path prefix | ☐ |
| 4 | **Allow service-role select** | Service role can read object metadata/existence for verification and orphan cleanup | ☐ |
| 5 | **Allow service-role delete** | Service role can delete objects for orphan cleanup and future deletion workflow | ☐ |
| 6 | **No client upload tokens** | Do not create user-scoped upload policies or signed upload handoff for end users | ☐ |
| 7 | **No authenticated download** | Do not create SELECT policy for `authenticated` on bucket objects | ☐ |

### Policy verification notes

- **Relational RLS decoupling:** Users may SELECT own `image_evidence` **metadata rows** in Postgres after relational migration—that does **not** require or imply storage object READ policy for `authenticated` role.
- **Service-role only for bytes:** All binary upload, verification read, and cleanup delete in Slice 3 use service-role credentials server-side only.
- **Policy review:** After applying policies, re-run Bucket Privacy Checklist and Verification Checklist items 4–6.

**Prohibited during provisioning:**

- Public READ policies
- Authenticated INSERT or SELECT policies on bucket objects
- Policies scoped to entire storage namespace beyond `image-evidence` bucket
- Test policies left in place that grant client access

---

## Object Key Convention

All Image Evidence objects on staging use this **bucket-relative path template**. Application dual-write must compute `storage_object_ref` identically.

```
{path_prefix}/{owner_segment}/{scan_record_id}/{evidence_id}
```

| Segment | Staging value | Rules |
|---------|---------------|-------|
| **`path_prefix`** | `image-evidence` | Fixed category root; must not include user or session identifiers |
| **`owner_segment`** | Normalized transitional email — see **Owner Segment Normalization Rule** | Must match relational `user_email` normalization used at upload time |
| **`scan_record_id`** | UUID of parent Scan Record V2 | Standard UUID string format |
| **`evidence_id`** | UUID assigned at evidence row creation | May equal `image_evidence.id`; ensures append-only uniqueness |

**`storage_object_ref`:** Full path string stored in relational row—not a signed URL, public URL, or HTTP endpoint.

**Example (illustrative):**

```
image-evidence/jane.example%40example.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/f9e8d7c6-b5a4-3210-fedc-ba9876543210
```

**Upload semantics (for future code alignment):**

- Non-destructive create only — collision at key must fail, not overwrite
- At most one Image Evidence object per `scan_record_id` in Slice 3
- Content type stored as object metadata at upload; extension not required in key

Document this template in the staging application environment configuration when dual-write is authorized.

---

## Owner Segment Normalization Rule

This runbook **defines the canonical normalization rule** referenced as P1-1 in **docs/PHASE_1_SLICE_3_STORAGE_AUDIT_V1.md**. Application upload code and object key computation **must** use this rule identically on staging.

### Rule

Given capturing user email string `email` from session (same value written to `scan_records.user_email` and `image_evidence.user_email`):

1. **Trim** leading and trailing whitespace.
2. **Lowercase** the entire string.
3. **URL-safe encode** using **`encodeURIComponent` semantics** (JavaScript-compatible): encode all characters except `A–Z`, `a–z`, `0–9`, `-`, `_`, `.`, `~`.

**Formula (conceptual):**

```
owner_segment = encodeURIComponent(trim(lowercase(email)))
```

### Examples

| Input email | After trim + lowercase | `owner_segment` (encodeURIComponent) |
|-------------|------------------------|--------------------------------------|
| `Jane.Example@Example.com` | `jane.example@example.com` | `jane.example%40example.com` |
| ` user@domain.co.uk ` | `user@domain.co.uk` | `user%40domain.co.uk` |
| `test+alias@example.com` | `test+alias@example.com` | `test%2Balias%40example.com` |

### Alignment requirements

| Requirement | Detail |
|-------------|--------|
| **Relational consistency** | `image_evidence.user_email` and `scan_records.user_email` store the **raw session email** (trimmed for storage if application already trims); RLS compares via `lower(user_email)` |
| **Path consistency** | `owner_segment` in object key uses **encodeURIComponent** of lowercase trimmed email — not the raw `@` character in path |
| **Cross-environment parity** | Same rule applies to production when separately provisioned |
| **Not canonical identity** | Email remains Phase 1 transitional ownership identifier; future UUID migration is a separate authorized slice |

Operators must communicate this rule to the implementation owner before dual-write code deploy. Do not provision staging storage and later adopt a different encoding convention without architecture review.

---

## Verification Checklist

Complete after bucket creation and storage policy configuration. Maps to migration plan verification item 10 and storage audit post-provisioning checks.

| # | Verification | Method | Expected result | Done |
|---|--------------|--------|-----------------|------|
| 1 | Bucket exists on **staging** project | Supabase Dashboard → Storage | Bucket `image-evidence` present | ☐ |
| 2 | Bucket is **Private** | Dashboard bucket settings | Public access disabled | ☐ |
| 3 | Anonymous access denied | Attempt unauthenticated access to bucket (no session) | Read/list/write denied | ☐ |
| 4 | Authenticated client object access denied | Authenticated user session without service-role; attempt object read/upload via client storage API if available | Object read/upload denied on `image-evidence` bucket | ☐ |
| 5 | Service-role upload path works | Service-role client uploads disposable non-production test object to path matching template under `image-evidence/{owner_segment}/...` | Upload succeeds | ☐ |
| 6 | Service-role read/delete works | Service-role reads metadata and deletes test object from step 5 | Read and delete succeed; bucket empty afterward | ☐ |
| 7 | Bucket object count zero after cleanup | Dashboard object list | No remaining objects (excluding aborted step 5 object) | ☐ |
| 8 | Path template documented | Execution record includes prefix `image-evidence` and normalization rule | Documented for application config owner | ☐ |
| 9 | No public URLs generated | Review bucket settings and test object URLs if any | No persistent public URL | ☐ |
| 10 | Staging project ID recorded | Execution record | Correct project referenced | ☐ |
| 11 | Slice 1–2 unaffected | Confirm no changes to existing buckets or policies for session/description evidence | No regression to unrelated storage | ☐ |

**Verification failure:** If any item fails, do not mark provisioning complete. Resolve or rollback per **Rollback / Cleanup Notes**.

**Do not mark Supabase relational migration as complete in this step.** Relational verification (migration plan items 1–9) is a separate execution after step 6 approval.

---

## Rollback / Cleanup Notes

Use if provisioning must be reversed or partially failed.

### Before any application upload or relational migration

| Situation | Action |
|-----------|--------|
| **Bucket created with wrong name or on wrong project** | Delete bucket only if empty; document incident; restart runbook on correct staging project |
| **Bucket created public by mistake** | **Stop immediately** — disable public access or delete empty bucket and recreate private bucket; do not proceed |
| **Test object left in bucket** | Delete test object via service-role; confirm zero objects |
| **Policies grant client access** | Remove erroneous policies; re-run Storage Policy Checklist and Verification Checklist |

### After dual-write code has uploaded real artifacts (future)

Storage rollback is **decoupled** from relational DDL rollback per **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**. Dropping `image_evidence` does not remove stored binaries. Full cleanup requires separate authorized procedure.

### Staging bucket removal (empty bucket only)

1. Confirm bucket contains **no production or user capture data**.
2. Confirm no `image_evidence` rows reference objects in bucket (or relational migration not yet applied).
3. Remove storage policies on bucket.
4. Delete `image-evidence` bucket in staging project.
5. Record rollback in change log.

**Do not delete staging bucket** if governed evidence rows or user image bytes exist without explicit data-handling approval.

---

## P0 Stop Conditions

**Stop provisioning immediately** if any condition below occurs. Do not proceed to relational migration, application configuration, or production replication until resolved and re-approved.

| # | Stop condition | Action |
|---|----------------|--------|
| 1 | Bucket created on **production** project instead of staging | Halt; assess exposure; delete empty bucket if safe; restart on staging with new approval |
| 2 | Bucket created **public** or anonymous read enabled | Halt; remediate privacy before any object upload |
| 3 | **Authenticated client** granted INSERT or SELECT on bucket objects | Halt; remove policies; re-run Storage Policy Checklist |
| 4 | Bucket name is not exactly **`image-evidence`** on dedicated bucket | Halt; wrong namespace — recreate or rollback |
| 5 | Skin Image Evidence co-located in shared non-dedicated bucket | Halt; violates category isolation |
| 6 | Explicit staging storage **approval not recorded** | Halt; obtain approval before any infrastructure change |
| 7 | Service-role key exposed in ticket, chat, or repository | Halt; rotate key; restart verification with new secret handling |
| 8 | Verification Checklist item fails and cannot be remediated same session | Halt; rollback or escalate; do not mark complete |
| 9 | Operator cannot confirm staging project identity | Halt; wrong-environment risk |
| 10 | Real user or production capture data uploaded during provisioning test | Halt; invoke data-handling procedure; do not mark complete |

---

## Execution Approval Status

| Gate | Status at runbook publish |
|------|---------------------------|
| **Storage posture accepted** | Accepted per architecture record |
| **Storage audit verdict** | Ready for explicit staging storage provisioning approval |
| **Staging storage provisioning approval** | **Pending** — operator must record before execution |
| **Staging storage provisioning execution** | **Not complete** |
| **Production storage provisioning** | **Not authorized** by this runbook |
| **Staging Supabase relational migration** | **Not authorized** by this runbook — pending storage verification and separate approval |
| **Application dual-write deploy** | **Not authorized** |

**Execution record (complete at provisioning time):**

| Field | Value |
|-------|-------|
| **Operator** | _TBD at execution_ |
| **Execution date (UTC)** | _TBD at execution_ |
| **Staging Supabase project ID** | _TBD at execution_ |
| **Bucket name** | `image-evidence` |
| **Verification checklist** | _All items pass / fail — TBD_ |
| **Approval reference** | _Ticket or sign-off ID — TBD_ |

---

## Next Step After Successful Provisioning

When all preconditions, checklists, and verification items pass **and** execution approval is recorded:

1. **Document completion** — Update execution record with operator, timestamp, project ID, and verification results. Do not commit service-role secrets.
2. **Communicate owner segment rule** — Confirm dual-write implementation owner has **Owner Segment Normalization Rule** before code work.
3. **Stage application configuration** — Prepare staging environment variables for bucket name (`image-evidence`) and path prefix (`image-evidence`) for future dual-write authorization only; do not deploy code in this step.
4. **Request staging Supabase relational migration approval** — Migration plan **step 6** is a **separate explicit gate**. Relational migration must not run until:
   - Staging storage provisioning is verified complete (this runbook Verification Checklist)
   - Migration plan checklist item 10 passes
   - Separate staging Supabase migration approval is recorded
5. **Do not provision production** — Production bucket requires migration plan step 9 and a separate authorized runbook instance.
6. **Do not deploy dual-write code** — Application implementation remains gated until relational migration is applied and verified (migration plan steps 7–8, then step 13).

**This runbook confirms readiness to execute staging storage provisioning when explicitly approved. It does not mark provisioning or migration as complete.**
