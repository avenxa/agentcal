# AgentCal Technical Handoff — Current

## Protocol State / Command

**Hold Work** — AgentCal remains intentionally paused. No feature implementation is active.

Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490

## Authority

- Product Truth / AgentCal Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- AgentCal / AgentConsult split: https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- **APXS / cross-product product-experience authority:** https://app.notion.com/p/3daeca0675e381b6a3cef40b4c666402
- AgentCal-specific UX/Product planning reference: https://app.notion.com/p/3daeca0675e3817d9af9d2b66d047446
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
- Repository entrypoint: `AGENTS.md`

This file is the durable technical continuity checkpoint. Product/architecture/UX documentation does not reactivate implementation.

## Objective

Preserve AgentCal in **On Hold / Paused** state while keeping the approved architecture and product-experience authority restart-ready:

> **Universal calculation workflow, localized financial authority.**

APXS owns reusable cross-product experience principles. The AgentCal UX Rebaseline owns AgentCal-specific calculation-experience extensions and future sequencing. Neither authorizes Feature 02 continuation, BUY, MOVE, UX implementation, persistence/schema work, AgentCal ↔ AgentConsult integration, jurisdiction refactoring, or second-jurisdiction implementation while the product is on Hold.

## Current Product / Architecture Truth

AgentCal remains **Calculate**; AgentConsult remains **Clarify & Decide**.

Universal AgentCal flow:

`Scenario → Inputs → Jurisdiction → Rules → Deterministic Calculation → Results → Adjust → Compare → Explain → Share`

Future architecture should keep these concerns distinct:

1. **Universal calculation platform** — Scenario/input/result contracts, calculation validity/readiness, comparison, deterministic recalculation, and grounded AI explanation framework.
2. **Jurisdiction rule packs** — local formulas, taxes, fees, exemptions/rebates, thresholds, disclosures, and financial methodology.
3. **Locale/presentation layer** — language, terminology, currency/date/number formatting; locale must not silently change calculation cents.

**BC remains the first supported calculation jurisdiction, not the universal product definition.** Current implementation remains BC-first; this architecture decision does not require immediate refactoring.

Prefer **stable contracts + explicit jurisdiction modules** over scattered jurisdiction conditionals. Do not create a giant universal formula engine before a real second-jurisdiction need exists.

Where practical, future rule packs should be traceable by jurisdiction, rule version/effective date, and validation/source metadata so scenarios remain explainable and reproducible.

## Product Experience — APXS + AgentCal Extensions

APXS governs reusable principles such as Outcome First, Progressive Disclosure, contextual next actions, state/readiness, edit-in-context, immediate feedback, responsive/accessibility baseline, AI-in-context, trust through transparency, and natural end artifacts.

AgentCal-specific extensions remain:
- Scenario as the persistent calculation object;
- primary financial-result hierarchy with transparent assumptions/breakdown depth;
- deterministic recalculation through authoritative code;
- calculation readiness that distinguishes completeness, validity, and professional certainty;
- explicit jurisdiction-rule authority and provenance;
- AI explanation grounded in Scenario + jurisdiction + verified deterministic result + rule metadata;
- client-ready financial output preserving assumptions, caveats, provenance, and advisor-safe presentation.

Approved future AgentCal sequence remains:

1. Scenario-first Architecture
2. Progressive Input Flow
3. Hero Result First
4. Build / Results Mode
5. Contextual Next Actions
6. Completion / Readiness Status
7. Persistent `+ Add` Menu
8. Inline Recalculation
9. AI Gap Detection & Guidance
10. Client-ready Share / Report

Treat this as AgentCal-specific product planning, not ten universal Avenxa UI mandates.

## Completed

- SELL Feature 01 merged and accepted. Implementation merge commit: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- AgentCal / AgentConsult responsibility split aligned.
- PR #4 product-boundary alignment merged.
- PR #5 stage-closeout / Hold documentation merged.
- PR #6 UX Rebaseline / Hold synchronization merged.
- PR #7 jurisdiction-architecture synchronization merged to `main` at `30aa7256885c0ffabc20b5baa2fd367edf1280fa`.
- Product Owner approved **Universal calculation workflow, localized financial authority** while keeping AgentCal On Hold.
- Notion AgentCal Hub, UX Rebaseline, and Project Instructions now inherit APXS for universal experience principles.

## Preserved Unfinished Execution Work

- Feature 02 candidate remains preserved on `feature/02-tier2-export-share` at `25ffeea2e52b652b1345dc6c5978a328349c9d32`.
- It contains a Technical Plan, Estimate Summary implementation, narration/handoff code, and tests.
- It is substantive unfinished execution, not an accepted feature.
- Do not delete or automatically merge it.
- On resume, inspect it against current Product Truth, APXS, the AgentCal UX Rebaseline, and the architecture boundary before deciding whether to review/finish, defer, redesign, or abandon it.

## Open / Deferred

1. AgentCal remains **On Hold**.
2. Feature 02 review/acceptance/merge remains deferred.
3. BUY is not implemented and is not authorized.
4. MOVE is not implemented and depends on verified SELL + BUY results.
5. UX Rebaseline implementation is not authorized.
6. AgentCal ↔ AgentConsult integration remains deferred.
7. No second jurisdiction or multi-jurisdiction framework is authorized.
8. No jurisdiction refactor of accepted SELL behavior is authorized merely for architectural purity.
9. Any client-facing disclaimer or local professional wording remains subject to appropriate jurisdiction review when applicable.

## Resume Sequence

On explicit `Resume Work`, reconstruct in this order:

1. Current AgentCal Hub Product Truth.
2. APXS.
3. `AGENTS.md`.
4. `docs/HANDOFF.md`.
5. AgentCal UX Rebaseline.
6. Actual `main`, branch, PR, test, and runtime state.
7. Inspect `feature/02-tier2-export-share` at the preserved tip.
8. Reconcile preserved Feature 02 work against current Product Truth and AgentCal-specific UX direction.
9. Inspect existing SELL/Feature 02 structures for BC-specific logic embedded in otherwise universal Scenario/input/result/UI structures. Do **not** refactor blindly; document actual coupling first.
10. Reopen Product Owner sequencing: finish/review Feature 02, formally defer Feature 02 and authorize BUY, or approve a separately bounded UX/architecture objective.
11. Only after sequencing is resolved, create/refresh a bounded Technical Plan and Builder handoff.

Do not implement a second jurisdiction merely to prove abstraction. If a future second-jurisdiction need becomes real, scope it as a separate Product Owner-approved bounded task.

## Verification for This APXS Documentation Sync

This sync is governance/documentation only.

Confirmed before branch creation:

- live `main` = `30aa7256885c0ffabc20b5baa2fd367edf1280fa`;
- AgentCal Hub status = **On Hold / Paused**;
- Feature 02 preserved branch remains the known unfinished candidate at `25ffeea2e52b652b1345dc6c5978a328349c9d32`;
- no application code, financial formula, package, schema, BUY/MOVE implementation, jurisdiction implementation, or runtime behavior is intentionally changed by this sync.

No application test rerun is claimed for this documentation-only change.

## Next

**None while AgentCal remains paused.** The next implementation trigger is `Resume Work`, reconstruction, and Product Owner sequencing — not coding.

## Authority / Gate

A future agent may autonomously read Product Truth, APXS, repository state, AgentCal UX Rebaseline, `AGENTS.md`, and this handoff.

A future agent may perform Product Owner-requested planning/documentation refinement without treating it as reactivation.

Product Owner approval is required before:

- leaving Hold;
- merging/deleting Feature 02 preserved work;
- starting Feature 02 continuation, BUY, MOVE, UX implementation, or integration;
- changing authoritative formulas, rounding, disclosures, privacy/data handling, or methodology;
- changing universal-core / jurisdiction-rule / locale boundaries;
- adding or materially changing a jurisdiction pack;
- creating a second-jurisdiction implementation;
- consequential merge/release or other ADS Human Gates.

## Stop / Escalation Conditions

Stop and escalate if:

- Product Truth and repository state materially conflict;
- UX simplification hides material assumptions or rule provenance;
- work would alter authoritative financial logic without approval;
- jurisdiction-specific rules are being pushed into universal structures without a justified boundary;
- universal abstraction is being built without a real product need;
- work blurs AgentCal / AgentConsult responsibilities;
- feature implementation is requested before `Resume Work` and sequencing are resolved;
- a consequential merge/release or other Human Gate is reached.