# Phase 2 Slice 1 Plan — Evidence Layer Foundation

## Status

**Status:** Draft  
**Phase:** 2  
**Slice:** 1  
**Artifact type:** Plan  
**Depends on:** Phase 1 Governance Foundation (closed), `PHASE_2_IMPLEMENTATION_PLAN.md`

---

## Background

Phase 1 established the governance contracts: lifecycle eligibility capability, the governed invocation contract, read-surface eligibility, deletion request governance, and the storage and binary retention boundary.

Phase 2 begins with the Evidence Layer because every subsequent workstream depends on it. Knowledge, Intelligence, Learning, and Experience work all consume evidence; none of them can be planned soundly until governed evidence — what it is, how it is captured, and how it may be consumed — has a defined foundation.

---

## Problem

Existing scan data and evidence concepts predate the governance foundation and need a planned foundation before implementation can proceed.

The platform must define what evidence is captured, how evidence participates in lifecycle governance, and how future layers may consume it without bypassing governance. Without this planning, implementation slices would bind evidence semantics ad hoc — recreating at the data layer the ungoverned gaps Phase 1 closed at the contract layer.

---

## Objective

Plan the Evidence Layer Foundation as the first implementation slice of Phase 2: establish the planning boundary within which the subsequent technical design will define the evidence layer, in full compliance with the Phase 1 contracts.

---

## Scope

High-level planning scope only:

- **Scan record evidence boundary** — the session anchor as the root evidence-bearing record.
- **User description evidence boundary** — user-supplied textual evidence.
- **Image evidence boundary** — captured image evidence and its relationship to stored binaries.
- **Product mention evidence boundary** — product references extracted from or attached to sessions.
- **AI analysis evidence boundary** — analysis outputs treated as governed evidence rather than transient results.
- **Consent-aware evidence capture** — evidence capture bound to consent state at capture time.
- **Lifecycle participation** — every evidence category participates in the Phase 1 lifecycle status model.
- **Read eligibility compatibility** — evidence reads remain compatible with the Phase 1 read eligibility contract.
- **Deletion request compatibility** — evidence records remain addressable by the Phase 1 deletion request governance model.
- **Storage and binary retention compatibility** — evidence storage references remain within the Phase 1 retention boundary.

---

## Non-Scope

- **No SQL migrations**
- **No database schema changes**
- **No API changes**
- **No UI changes**
- **No storage implementation**
- **No AI prompt changes**
- **No product intelligence changes**
- **No recommendation engine changes**
- **No learning layer**
- **No outcome intelligence**
- **No production deployment**

This plan authorizes no implementation of any kind.

---

## Governance Requirements

Every future technical design under this slice must preserve, unchanged:

- **Phase 1 lifecycle status contract** — the `active`/`excluded` state model and its transition metadata requirements.
- **Phase 1 governed invocation contract** — the authorized consumer boundary and reason taxonomy.
- **Phase 1 read eligibility contract** — excluded records must not be presented as normal active results.
- **Phase 1 deletion request governance** — intake, authority, scope, and residual handling rules.
- **Phase 1 storage retention boundary** — the separation of lifecycle exclusion from binary retention and cleanup.

A technical design that requires modifying any of these contracts must stop and escalate; contract changes are their own governance work, not implementation detail.

---

## Future Technical Design Questions

The next technical design must answer, and this plan deliberately does not:

- Which existing records become evidence-bearing records?
- Which evidence tables are in scope for implementation?
- What lifecycle metadata is required?
- How should evidence be read safely?
- How should excluded evidence affect future analysis?
- How should deletion requests affect evidence records?
- How should storage references and binaries be represented?
- What must remain backward-compatible?

---

## Exit Criteria

This planning slice is complete when:

1. **Scope and non-scope are accepted** at gate review.
2. **Governance dependencies are explicit** — the five Phase 1 contracts are acknowledged as binding.
3. **Future technical design questions are listed** and accepted as the design's obligations.
4. **No implementation has been authorized** — no code, SQL, migration, or runtime change occurs within this planning slice.

---

## Current Decision

The next artifact after approval of this plan is the Technical Design for Phase 2 Slice 1 — Evidence Layer Foundation. No design or implementation work begins before this plan is reviewed and approved.

---

*End of Phase 2 Slice 1 Plan.*
