# Phase 1 Slice 3 — Image Evidence Storage Posture V1

## Purpose

This document defines the **governed object storage posture** for Phase 1 Slice 3: Image Evidence—the first **binary content evidence object** in the Personal Evidence Base.

It specifies how user-uploaded scan image bytes are stored, scoped, accessed, and lifecycle-managed in private object storage, and how those artifacts relate to the relational `image_evidence` store via `storage_object_ref`. It closes the **P1-1 storage posture artifact gap** identified in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_READINESS_REVIEW_V1.md** and satisfies the storage workstream prerequisites in **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**.

Image Evidence records **what the user captured**—visual artifact reference and capture metadata linked to Scan Record V2—not AI observations, symptom classifications, or diagnostic content (**docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_EVIDENCE_OBJECT_BOUNDARIES_V1.md**).

This is an **architecture document only**. It does not authorize object storage provisioning, policy execution, application code, SQL, migration apply, or read-path changes.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_TECHNICAL_DESIGN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**, **docs/PHASE_1_CONSENT_SNAPSHOT_BEHAVIOR_V1.md**, **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**, **docs/PHASE_1_SCHEMA_DIRECTION_V1.md**, **docs/ADR_PHASE_1_PERSISTENCE_DIRECTION.md**, **docs/SKININTEL_MASTER_BLUEPRINT_V2.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Proposed draft for architecture review |
| **Storage provisioning** | Not authorized by this document |
| **Policy execution** | Not authorized by this document |
| **Application code** | Not authorized by this document |

---

## Storage Principles

The following principles bind all Image Evidence object storage decisions for Slice 3 and future governance slices.

| # | Principle | Definition |
|---|-----------|------------|
| **1** | **Private by default** | Image artifacts are highly sensitive personal health-adjacent data. Storage must deny anonymous and unauthenticated access. No persistent public URLs, CDN exposure, or enumerable paths. |
| **2** | **Relational metadata, external bytes** | Supabase Postgres stores governed references and capture metadata only. Image binaries live in private object storage. The relational row never holds inline binary content. |
| **3** | **Reference stability** | `storage_object_ref` is a durable, bucket-relative object key—not a signed URL, public URL, or HTTP endpoint. Access credentials are generated at retrieval time in future slices, not persisted as the canonical reference. |
| **4** | **Evidence-first coupling** | A storage object must not exist without a governing `image_evidence` row (except transient upload failure cleanup). A relational row must not reference a missing object at commit time. |
| **5** | **Server-side governance** | Upload is performed exclusively by the authenticated scan route via service-role credentials. End users do not receive client upload tokens with unrestricted bucket scope in Slice 3. |
| **6** | **Consent-limited purpose** | Persistence is authorized only when both `image_processing_consent` and `evidence_storage_consent` are active in the session Consent Snapshot. Storage serves personal cosmetic analysis and Personal Evidence Base governance—not marketing, sharing, or third-party exploitation. |
| **7** | **Append-oriented immutability** | New captures create new objects and new evidence rows. Existing artifacts are not overwritten in place. Path collision must fail rather than silently replace prior evidence. |
| **8** | **Category isolation** | Image Evidence (skin capture) occupies a dedicated storage namespace distinct from future product images, label OCR artifacts, and other image categories defined in platform blueprints. Categories must not share buckets or path roots without explicit architecture decision. |
| **9** | **Deletion-compatible design** | Storage posture must support future binary removal, reference revocation, and tombstone semantics without redesign (**docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**). |
| **10** | **Provider portability** | Object keys and ownership segmentation must remain meaningful if the underlying provider changes (Supabase Storage today; S3-compatible or VPS object storage in future). Provider-specific URLs must not be embedded in evidence records. |

---

## Bucket Strategy

Slice 3 introduces one **dedicated private bucket** for governed skin Image Evidence. Bucket provisioning is a separate gated operation per environment; this section defines naming, visibility, and separation intent.

### Bucket identity

| Element | Posture |
|---------|---------|
| **Logical name** | `image-evidence` — denotes Evidence Content Store category and highest-sensitivity skin capture class |
| **Environment instance** | One bucket per Supabase project/environment (staging, production). Staging and production must never share a bucket instance. |
| **Configuration surface** | Bucket identity supplied to application via environment variable (e.g., `IMAGE_EVIDENCE_STORAGE_BUCKET`—illustrative example only; not a normative architecture requirement). Missing configuration fails closed before upload. |
| **Public visibility** | **Private** — bucket must not be public; no anonymous read or list. |
| **Versioning** | Not required in Slice 3. Future governance may enable versioning for audit; not a Slice 3 dependency. |
| **Lifecycle rules** | No automatic expiry in Slice 3. Future retention/deletion workflows govern object removal explicitly. |

### Bucket separation rationale

| Separation | Reason |
|------------|--------|
| **Dedicated bucket for skin Image Evidence** | Highest sensitivity tier; distinct access policy, audit, and future deletion sweep scope per **docs/SKININTEL_MASTER_BLUEPRINT_V2.md** category model. |
| **Not co-located with product or label images** | Prevents policy bleed, accidental cross-category access, and complicates per-category GDPR deletion sweeps. |
| **Not co-located with Supabase public assets** | Marketing, avatars, and static assets must remain in separate namespaces. |
| **Relational store externalized** | DDL creates `image_evidence` only; bucket creation and storage policies are out of SQL scope (**docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**). |

### Cross-environment posture

| Requirement | Intent |
|-------------|--------|
| **Environment parity** | Staging and production use identical bucket naming convention and path template; only project/bucket instance differs. |
| **Reference collision prevention** | Object keys are globally unique within a bucket via evidence identifier segment; cross-environment buckets are isolated instances—no shared key namespace. |
| **Pre-code state** | Bucket may exist empty before dual-write code deploy; relational table may exist with zero rows. Both are expected during schema-only rollout. |

---

## Object Naming Strategy

Object keys must be **opaque, non-guessable, and ownership-scoped** to support access policy alignment, audit, and future per-user deletion sweeps.

### Canonical path template

All Image Evidence objects use a single bucket-relative path template:

```
{path_prefix}/{owner_segment}/{scan_record_id}/{evidence_id}
```

| Segment | Definition | Constraints |
|---------|------------|-------------|
| **`path_prefix`** | Fixed category root for Image Evidence | Default: `image-evidence`. Configurable via environment variable (e.g., `IMAGE_EVIDENCE_STORAGE_PATH_PREFIX`—illustrative example only; not a normative architecture requirement) for provider or environment overrides. Must not include user or session identifiers. |
| **`owner_segment`** | User ownership scope | Phase 1 transitional ownership identifier: normalized capturing user email (lowercase, URL-safe encoding per platform convention). This is not the long-term canonical identity; canonical auth user UUID replaces it when separately authorized. Enables user-scoped policy predicates and one-sweep deletion. |
| **`scan_record_id`** | Governed session anchor | UUID of parent Scan Record V2. Binds artifact to capture session for audit and verification. |
| **`evidence_id`** | Stable unique object identifier | UUID assigned at evidence row creation (may equal `image_evidence.id`). Ensures append-only uniqueness; prevents overwrite of prior captures. |

**`storage_object_ref` value:** The full bucket-relative path string produced by the template above. Example shape (illustrative only):

```
image-evidence/jane.example@example.com/a1b2c3d4-e5f6-7890-abcd-ef1234567890/f9e8d7c6-b5a4-3210-fedc-ba9876543210
```

### Naming rules

| Rule | Requirement |
|------|-------------|
| **No file extension requirement** | Extension is optional; content type is stored on the relational row (`content_type`) and as object metadata at upload. Keys must not rely on extension for type inference. |
| **No sequential or enumerable IDs** | Keys must not use incrementing integers or predictable timestamps as the sole uniqueness mechanism. |
| **No public or CDN path segments** | Paths must not include `public`, `cdn`, `assets`, or equivalent segments that imply anonymous serving. |
| **No AI or inference segments** | Paths must not encode model output, symptom labels, or diagnostic classifications. |
| **Collision semantics** | Upload must use non-destructive create semantics. If an object already exists at the computed key, upload fails—prior evidence is never silently overwritten. |
| **Uniqueness enforcement** | Relational `storage_object_ref` carries a global unique index; one evidence row per stored artifact (**docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**). |
| **Cardinality** | At most one Image Evidence object per `scan_record_id` in Slice 3 (one image per capture session). |

### Prohibited key patterns

- Short, guessable paths (e.g., `{user_id}/latest.jpg`)
- Shared keys across users or sessions
- Keys derived from AI output or clinical labels
- Keys that embed recoverable image content (hashes of raw bytes used alone without UUID segment are insufficient as sole identifier)

---

## Ownership Model

Ownership aligns relational RLS, storage access policy intent, and object key segmentation under a single user authority.

| Concern | Posture |
|---------|---------|
| **Primary owner** | The authenticated user who initiated the scan capture—the same principal referenced by `image_evidence.user_email` and parent `scan_records.user_email` as the Phase 1 transitional ownership identifier. These fields are not the long-term canonical identity. |
| **Session attribution** | Every object is bound to a governed Scan Record V2 via `scan_record_id` in the key and relational FK. Ownership is user + session, not bucket-global. |
| **Platform custody** | SkinIntel holds artifacts as processor/controller under stated consent scopes. Platform operators access objects only via service-role or future audited admin paths—not as default end-user capability in Slice 3. |
| **Transitional `user_email` pattern** | Mirrors Slice 1–2 evidence stores. `user_email` is the Phase 1 transitional ownership identifier pending canonical auth user id migration (separately authorized). Owner segment in object key must align with the same transitional identifier used in relational RLS predicates—not with a future canonical identity unless migrated under separate authorization. |
| **No shared or anonymous objects** | Objects without a resolvable owning user and session must not be retained. Upload failure cleanup removes orphaned objects without governing rows. |
| **Coexistence with Slice 2** | User Description Evidence remains text-only in Postgres. Image bytes never share ownership semantics with description rows; both may reference the same `scan_record_id` as independent child evidence types. |

---

## Access Model

Access is **deny-by-default**. Slice 3 establishes write and infrastructure access only; governed end-user retrieval is deferred.

### Access roles

| Actor | Slice 3 capability | Intent |
|-------|---------------------|--------|
| **Anonymous / unauthenticated** | **None** | No list, read, or write. |
| **Authenticated end user (client)** | **None to object storage in Slice 3** | No signed upload URLs, no direct download, no bucket-scoped client tokens. Relational SELECT on own `image_evidence` rows is permitted by RLS but does not grant object retrieval. |
| **Scan route (service-role)** | **Create (upload) only** | Upload new objects during governed dual-write. No routine read of stored objects required for Slice 3 capture path (AI uses in-memory buffer from request, not storage re-fetch). |
| **Service-role (operational)** | **Create, read, delete** | Supports upload, verification, orphan cleanup on insert failure, and future deletion workflow. Delete is not invoked in Slice 3 application code except best-effort orphan cleanup. |
| **Future governed retrieval** | **Deferred** | Authenticated proxy or short-lived signed URLs for authorized user access—separate slice. |

### Policy intent (conceptual)

Storage policies must enforce:

1. **Deny all anonymous operations** on the Image Evidence bucket.
2. **Allow service-role insert** at governed paths matching the naming template.
3. **Deny authenticated user direct object access** in Slice 3 (no client READ policy on bucket objects).
4. **Allow service-role select and delete** for verification, orphan cleanup, and future governance workflows.

Exact policy definitions are operational artifacts applied at provisioning time; this document defines intent only.

### Relational vs object access decoupling

| Layer | Governs |
|-------|---------|
| **Postgres RLS on `image_evidence`** | Which user may read evidence **metadata rows** (SELECT on `user_email` match). |
| **Object storage policies** | Which principals may read, write, or delete **binary bytes**. |

A user who can SELECT an `image_evidence` row in Slice 3 still cannot retrieve the binary via storage unless a future governed retrieval workflow explicitly authorizes it. Relational access does not imply object access.

---

## Security Requirements

| Requirement | Definition |
|-------------|------------|
| **Private bucket** | Bucket public flag disabled; no anonymous ACLs. |
| **No persistent public URLs** | Evidence records, API responses, logs, and compatibility rows must not contain public or long-lived unauthenticated URLs. |
| **Service-role credential containment** | Service-role keys used only server-side in the scan route and operational tooling; never exposed to client bundles or browser storage. |
| **Cross-user isolation** | One user must not read, list, infer, or overwrite another user's objects. Key segmentation and policy predicates must enforce owner boundaries. |
| **Consent gate before write** | Upload must not occur unless both `image_processing_consent` and `evidence_storage_consent` are active in the session Consent Snapshot chain. |
| **Content type integrity** | Stored object content type must match validated upload type; byte length must match declared size. |
| **No payload leakage** | Logs must not contain raw image bytes, base64, or full storage URLs with embedded credentials. `analyses.result` and compatibility row must not embed recoverable image content or durable private URLs. |
| **Minimum metadata exposure** | Capture metadata on the relational row holds provenance only—never AI observations, symptom labels, or clinical framing. |
| **Encryption at rest** | Rely on provider default encryption at rest for Supabase Storage (or equivalent for future providers). No additional client-side encryption in Slice 3. |
| **Encryption in transit** | All upload and operational access over TLS. |
| **Audit support** | Object key, relational row, and Consent Snapshot join path must support capture-time authorization audit without exposing bytes in audit logs. |
| **Fail closed on misconfiguration** | Missing bucket name, path prefix, or invalid storage configuration aborts capture before upload and before AI analysis. |

---

## Upload Rules

Upload behavior aligns with **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**. This section states architecture rules; implementation detail belongs in the code design artifact.

### Preconditions

| Precondition | Requirement |
|--------------|-------------|
| **Infrastructure** | Private bucket provisioned and verified in target environment before code deploy. |
| **Relational foundation** | `image_evidence` table exists with constraints and RLS per accepted migration. |
| **Session foundation** | Scan Record V2 and Consent Snapshot rows exist for the capture session before upload. |
| **Consent** | Both `image_processing_consent` and `evidence_storage_consent` active in resolved session scopes. |
| **Input validation** | Image type and size validated before any evidence or storage writes. |

### Upload execution rules

| Rule | Behavior |
|------|----------|
| **Single write path** | Upload occurs only on authenticated scan POST via service-role—not via dedicated client upload endpoint or signed-URL handoff in Slice 3. |
| **Path computation** | Object key computed from canonical template using assigned `evidence_id`, `scan_record_id`, and owner segment before upload. |
| **Durability before relational claim** | Object must be durably written before `image_evidence` insert references `storage_object_ref`. |
| **Non-destructive create** | Upload must fail on key collision; never overwrite existing evidence objects. |
| **Content type preserved** | Object stored with validated MIME type from upload. |
| **Byte integrity** | Uploaded byte length must match validated file size. |
| **Original bytes only** | Store user-uploaded capture bytes. No derived thumbnails, WebP transcoding, EXIF-stripped variants, or AI-generated artifacts in the evidence bucket in Slice 3. |
| **One object per session** | At most one upload per `scan_record_id`. |
| **Failure cleanup** | If relational insert fails after successful upload, best-effort deletion of orphaned object via service-role; outcome logged; capture fails closed before AI. |

### Prohibited upload behavior

- Upload before session and consent foundation exists
- Upload when either required image consent scope is absent
- Client-direct upload bypassing service-role governance
- Storing AI inference output, display thumbnails, or model artifacts in the evidence bucket
- Inline storage of image bytes in Postgres or `analyses`
- Public or CDN-targeted upload destinations

---

## Retrieval Rules

Slice 3 is **write-only** for Image Evidence from an application and end-user perspective. Governed retrieval is intentionally deferred.

| Concern | Slice 3 posture |
|---------|-----------------|
| **End-user retrieval** | **Not provided.** Dashboard, history, and API success response do not expose image evidence, storage references, or binary access. |
| **Client read paths** | No signed download URLs, authenticated proxy, or storage re-fetch in application read paths. |
| **AI analysis input** | AI continues to consume the in-memory upload buffer from the request—not a storage re-read—in Slice 3. Storage is evidence persistence, not inference pipeline storage. |
| **Operational verification** | Service-role may read object metadata and existence for post-deploy verification and integrity checks. |
| **Relational reads** | Authenticated user may SELECT own `image_evidence` metadata rows under RLS; metadata read does not authorize binary retrieval. |
| **Compatibility layer** | `analyses` row must not contain image URLs, `storage_object_ref`, thumbnails, or embedded bytes. |

### Future retrieval direction (not Slice 3)

When a governed retrieval slice is authorized, expected posture:

- **Authenticated proxy** or **short-lived signed URLs** scoped to owning user and specific object
- **No persistent public URLs** in evidence records or client caches
- **Consent and lifecycle checks** before serving (`evidence_status`, deletion/tombstone state)
- **Audit logging** of retrieval events without logging raw bytes

---

## Deletion Compatibility

Slice 3 does not implement deletion workflows. Storage posture must be **compatible** with **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md** without redesign.

| Concern | Design-compatible posture |
|---------|---------------------------|
| **Binary removal** | Future deletion workflow must delete object bytes from storage and revoke retrieval capability. |
| **Relational tombstone** | `evidence_status = 'excluded'` may mark ineligible evidence without requiring in-place key mutation; binary may be removed while row remains for audit. |
| **Reference revocation** | After deletion, `storage_object_ref` must not resolve to recoverable content; future workflow may retain key string for audit with object absent. |
| **Parent session protection** | `ON DELETE RESTRICT` on `scan_record_id` prevents session anchor deletion while evidence rows exist; deletion slice must remove or exclude child evidence first. |
| **Orphan prevention** | Upload failure cleanup already removes objects without governing rows. Post-deletion, no unreferenced recoverable binaries should remain publicly accessible. |
| **Downstream exclusion** | Deleted image evidence must not feed AI re-inference, personalization, or learning; storage deletion is part of exclusion enforcement. |
| **Consent Snapshot immutability** | Deletion removes artifact and metadata; it does not mutate historical Consent Snapshot records. |
| **Rollback decoupling** | Relational DDL rollback does not remove storage objects. Operational cleanup is a separate authorized procedure (**docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**). |
| **Per-user sweep** | Owner segment in object key supports future bulk deletion sweep for a single user without scanning unrelated namespaces. |

---

## Future Compatibility

Storage posture must accommodate downstream slices without bucket or key template redesign.

### Multi-image scan support

Future phases may authorize multiple Image Evidence objects under a single Scan Record V2 when multi-image capture is supported. This requires no bucket redesign: object uniqueness is **evidence-based** (`evidence_id`), not scan-based (`scan_record_id`). Multiple objects per session share the same `owner_segment` and `scan_record_id` path segments but receive distinct `evidence_id` values.

| Future capability | Compatibility intent |
|-------------------|---------------------|
| **Canonical auth user id** | Owner segment migrates from normalized email to UUID; migration strategy documented separately; keys may be rewritten or aliased under governed migration—not ad hoc dual paths. |
| **Governed retrieval** | Private bucket + stable `storage_object_ref` supports proxy or signed-URL delivery without changing canonical reference semantics. |
| **Correction events** | Correction qualifies attestation without requiring binary deletion; object remains at stable key; `evidence_status` and correction chain govern eligibility. |
| **Evidence Confidence Posture** | Input quality dimensions attach to evidence governance objects—not encoded in object key or storage metadata in Slice 3. |
| **Body Area Evidence Link** | Spatial linkage is a separate object; storage keys remain session- and user-scoped only. |
| **Image processing pipeline** | EXIF stripping, WebP optimization, and thumbnail generation may produce **derivative variants** in future slices. Slice 3 stores original capture bytes only; derivatives would use separate variant segment or bucket policy—not overwrite canonical evidence object. |
| **Provider migration** | Provider-agnostic key template and `storage_object_ref` as stable logical reference support VPS → S3-compatible → Supabase Storage transitions via configuration and copy workflows. |
| **Retention policies** | Lifecycle rules may be added at bucket level; governed deletion workflow takes precedence over blind expiry for user-initiated deletion rights. |
| **Product and label image categories** | Separate buckets and path roots per **docs/SKININTEL_MASTER_BLUEPRINT_V2.md**; Image Evidence bucket remains skin-capture only. |

---

## Explicit Non-Goals

The following are **explicitly not goals** of this storage posture document or Slice 3 storage scope:

| Excluded item | Reason |
|---------------|--------|
| **Storage provisioning or policy execution** | Separate gated operational approval per environment |
| **SQL, DDL, or migration apply** | Relational artifacts are separate (**docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md**) |
| **Application code or API changes** | Dual-write code design is separate (**docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**) |
| **UI, capture flow, or image display** | Experience Layer unchanged; no thumbnails in history |
| **Signed URL generation or client download** | Deferred to future governed retrieval slice |
| **CDN delivery or public asset optimization** | Violates private-by-default principle |
| **Image transcoding pipeline (EXIF strip, WebP, thumbnails)** | Beyond minimum governed private storage in Slice 3 |
| **Client-direct upload or presigned upload URLs** | Violates server-side governance model |
| **Legacy backfill of historical scan images** | Transitional gap for pre-Slice-3 captures |
| **Deletion/retention workflow implementation** | Design-compatible only |
| **Correction Event storage or UX** | Design-compatible only |
| **Evidence Confidence Posture storage** | Deferred |
| **Storing AI observations in object metadata** | Prohibited boundary merge |
| **Product, label, or marketing image storage** | Separate categories and future buckets |
| **Medical diagnosis, disease labeling, or clinical image classification artifacts** | Cosmetic scope only |
| **Read-path cutover from `analyses`** | Transitional Hybrid preserved |
| **Changing upstream architecture decisions** | Plan, technical design, schema direction, and object boundaries remain binding |

---

## Current Decision

**Phase 1 Slice 3 Image Evidence storage posture is defined for architecture review only.**

This document specifies:

- One **dedicated private bucket** per environment for skin Image Evidence
- A **canonical bucket-relative object key template** scoped by owner, session, and evidence identifier
- **Service-role-only upload** with deny-by-default access, no client retrieval in Slice 3
- **Evidence-first coupling** between stored objects and `image_evidence.storage_object_ref`
- **Deletion- and future-governance-compatible** posture without implementing those workflows

This document does **not** authorize:

- Bucket creation or storage policy changes in Supabase or any provider
- Application dual-write implementation
- Governed retrieval, signed URLs, or CDN configuration
- Legacy backfill or deletion workflow execution

**Next step:** Accept this storage posture artifact, then proceed with staging storage provisioning (migration plan step 5) after separate explicit approval—followed by dual-write code deploy only when relational migration and storage infrastructure verification (checklist items 1–11) are complete.
