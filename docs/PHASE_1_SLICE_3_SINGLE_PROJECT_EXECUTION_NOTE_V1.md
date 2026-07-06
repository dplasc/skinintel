# Phase 1 Slice 3 — Single-Project Execution Note V1

## Purpose

This document records an **operational environment constraint** and the **controlled execution workflow** for Phase 1 Slice 3: Image Evidence infrastructure rollout.

It clarifies that SkinIntel currently operates against **one Supabase project only**—labeled **production/main**—and that **no separate staging Supabase project exists** at this time. Phase 1 Slice 3 will proceed under a **single-project controlled execution model** without altering accepted architecture artifacts.

This note adapts **how** authorized operators execute Slice 3 infrastructure work. It does **not** redefine storage posture, relational migration scope, access model, consent model, deletion compatibility, or dual-write design.

Sources: **docs/PHASE_1_SLICE_3_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_MIGRATION_PLAN_V1.md**, **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md**, **docs/PHASE_1_SLICE_3_STORAGE_PROVISIONING_RUNBOOK_V1.md**, **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md**.

| Attribute | Status |
|-----------|--------|
| **Document status** | Operational execution note — environment constraint |
| **Architecture authority** | Unchanged — accepted Slice 3 artifacts remain binding |
| **Infrastructure authorization** | Not granted by this document |
| **Dual-write authorization** | Not granted by this document |

---

## Current Supabase Environment

| Attribute | Current state |
|-----------|---------------|
| **Supabase projects in use** | **One** — production/main |
| **Staging Supabase project** | **Does not exist** at this time |
| **Environment isolation** | No separate pre-production Supabase target for relational or storage apply |
| **Operational implication** | All Slice 3 infrastructure steps that migration planning previously assumed on staging must be executed on production/main under explicit, step-by-step approval |

The existing Supabase project is the **authoritative production/main environment**. It hosts live relational schema, RLS posture, and application configuration. There is no parallel Supabase project available for dry-run apply, rollback rehearsal, or isolated storage provisioning.

---

## Decision

Phase 1 Slice 3 **will proceed** using a **single-project controlled execution workflow** on the existing **production/main** Supabase project.

| Decision | Rationale |
|----------|-----------|
| **Proceed on production/main** | Slice 3 infrastructure is blocked without an execution path; accepted architecture and migration artifacts are complete pending operator apply |
| **Do not reinterpret architecture** | Storage posture, SQL migration intent, access model, consent model, deletion compatibility, and dual-write design remain as accepted in upstream documents |
| **Replace staging-first sequencing with gated production sequencing** | Each infrastructure operation requires its own explicit approval, verification, and recorded sign-off before the next step |
| **Defer separate staging project creation** | A dedicated staging Supabase project remains **recommended before scale** but is **deferred for now** due to current project inventory and operational constraints |

This decision is an **execution adaptation**, not an architecture revision.

---

## Risk Acknowledgement

Operating Slice 3 infrastructure on a single production/main Supabase project increases operational exposure relative to a staging-first rollout.

| Risk | Acknowledgement |
|------|-----------------|
| **No isolated rehearsal environment** | Relational migration and storage provisioning cannot be validated on a disposable Supabase project before production/main apply |
| **Production-adjacent blast radius** | Misconfiguration, wrong-project action, or partial apply affects the live authoritative environment |
| **Reduced rollback rehearsal** | Rollback intent is documented but cannot be exercised on staging before production/main execution |
| **Operator error under time pressure** | Manual dashboard and SQL Editor steps carry higher consequence without environment separation |
| **Deferred staging debt** | Absence of a staging project accumulates risk as user volume, evidence volume, and change frequency increase |

These risks are **accepted for Phase 1 Slice 3 execution** under the controlled workflow defined below. They do **not** authorize shortcuts on verification, approval recording, or sequencing gates.

---

## Execution Rules

The following rules bind all Phase 1 Slice 3 infrastructure work under the single-project model.

| # | Rule | Requirement |
|---|------|-------------|
| **1** | **Explicit step-by-step approval** | Every production/main infrastructure operation requires **separate, documented, explicit approval** before execution. No bundled or implied multi-step authorization. |
| **2** | **Correct project confirmation** | Operator must confirm Supabase project identity (name, ID, region) immediately before each step. Halt if identity cannot be verified. |
| **3** | **Storage before relational migration** | **Storage provisioning must complete and pass verification** before Supabase relational migration execution on production/main. |
| **4** | **Infrastructure before code** | **No dual-write code deployment** is permitted until **both** storage provisioning verification **and** relational migration verification pass on production/main. |
| **5** | **Read-only verification between gates** | Post-step verification is mandatory and read-only. Failed verification blocks all downstream steps. |
| **6** | **Versioned artifacts only** | Apply migration SQL from approved versioned files only. Do not paste ad hoc SQL or deviate from accepted storage posture. |
| **7** | **Approval audit trail** | Each approved step must record operator identity, timestamp, target environment (production/main), and pass/fail outcome. |
| **8** | **No parallel unauthorized changes** | No concurrent Supabase schema edits, bucket changes, or application deploys outside the authorized step sequence. |
| **9** | **Stop on P0 condition** | Any P0 stop condition (below) halts execution immediately. Do not proceed to the next gated step until resolved and re-approved. |

**Adapted sequencing on production/main:**

| Step | Action | Gate |
|------|--------|------|
| 1 | Confirm upstream dependencies and accepted artifacts | Planning sign-off |
| 2 | **Provision private object storage** on production/main | Explicit production storage approval |
| 3 | Verify storage posture per runbook | Storage verification pass |
| 4 | **Apply relational migration** on production/main | Explicit production Supabase migration approval |
| 5 | Verify relational schema, RLS, constraints, and Slice 1–2 regression | Migration verification pass |
| 6 | **Do not deploy dual-write code** | Blocked until steps 2–5 pass |
| 7 | Authorize dual-write code deploy as separate gated slice | Code gate only after infrastructure verification |

---

## What Changes

This execution note changes **operational workflow assumptions** only.

| Changed element | Detail |
|-----------------|--------|
| **Environment target** | Infrastructure steps execute on **production/main** instead of a non-existent staging project |
| **Approval granularity** | Staging-then-production dual approval is replaced by **per-step production/main approval** with recorded sign-off |
| **Runbook interpretation** | References to "staging" in provisioning runbooks and migration plan sequencing are interpreted as **production/main controlled steps** under this note—not as authorization to skip gates |
| **Verification placement** | Verification runs on production/main after each approved step; there is no prior staging verification pass |

---

## What Does Not Change

Accepted Phase 1 Slice 3 architecture and design artifacts remain **fully binding**.

| Unchanged element | Authority |
|-------------------|-----------|
| **Storage posture** | **docs/PHASE_1_SLICE_3_STORAGE_POSTURE_V1.md** — bucket identity, private-by-default posture, path convention, service-role access model |
| **SQL migration scope** | **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_SQL_DRAFT_V1.md** and versioned migration file — additive `image_evidence` only; no upstream table alteration |
| **Access model** | RLS SELECT for owning user; no client write policies; service-role write posture consistent with Slice 1–2 |
| **Consent model** | Dual-scope consent (`image_processing_consent`, `evidence_storage_consent`) via session Consent Snapshot chain |
| **Deletion compatibility** | Design-compatible with **docs/PHASE_1_DELETION_RETENTION_BEHAVIOR_V1.md**; no deletion workflow implementation in Slice 3 |
| **Dual-write design** | **docs/PHASE_1_SLICE_3_IMAGE_EVIDENCE_DUAL_WRITE_CODE_DESIGN_V1.md** — write order, atomicity intent, consent gating, failure cleanup |
| **Transitional Hybrid read model** | `analyses` remains compatibility read path; no UI or API contract change from infrastructure apply |
| **Rollback intent** | Documented relational and storage rollback posture in migration plan and SQL draft |
| **Long-term recommendation** | Creating a separate staging Supabase project before scale remains recommended; only the **timing** of that investment is deferred |

---

## P0 Stop Conditions

Execution **must halt immediately** if any of the following conditions occur. Do not proceed to the next gated step without resolution and fresh explicit approval.

| # | P0 condition | Required response |
|---|--------------|-------------------|
| **1** | Operator cannot confirm production/main Supabase project identity | Halt — wrong-environment risk |
| **2** | Explicit step-by-step approval not recorded for the pending operation | Halt — obtain approval before any infrastructure change |
| **3** | Storage provisioning attempted after relational migration without prior verified storage step | Halt — sequencing violation; assess state before continuing |
| **4** | Relational migration attempted before storage provisioning verification passes | Halt — sequencing violation |
| **5** | Dual-write code deploy initiated before storage and migration verification pass | Halt — code gate violation |
| **6** | Bucket created with wrong name, visibility, or access posture vs accepted storage posture | Halt — assess exposure; remediate per runbook rollback notes |
| **7** | Migration apply deviates from approved versioned SQL | Halt — do not continue; assess partial apply |
| **8** | Verification failure on RLS, constraints, Slice 1–2 regression, or storage posture | Halt — no downstream steps until pass or authorized rollback |
| **9** | Unexpected data mutation on `analyses`, `scan_records`, `consent_snapshots`, or `user_description_evidence` | Halt — incident assessment required |
| **10** | Public or authenticated client object access detected on Image Evidence bucket | Halt — privacy and consent boundary violation |

---

## Next Step

1. **Record acceptance of this execution note** — Confirm that operators and approvers acknowledge the single-project constraint and controlled workflow.
2. **Request explicit production/main storage provisioning approval** — First authorized infrastructure step per **docs/PHASE_1_SLICE_3_STORAGE_PROVISIONING_RUNBOOK_V1.md**, interpreted for production/main under **Execution Rules** above.
3. **Do not request relational migration approval** until storage provisioning verification passes on production/main.
4. **Do not authorize dual-write code deploy** until storage provisioning and relational migration verification both pass.
5. **Plan staging project creation** as a separate infrastructure investment before scale; defer implementation until resourced, without blocking Slice 3 controlled execution on production/main.

**This document defines the single-project execution posture for Phase 1 Slice 3. It does not authorize infrastructure changes or mark any Slice 3 step complete.**
