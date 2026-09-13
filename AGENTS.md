# AGENTS.md — AgentCal

## Start Here — ADS Takeover Route

Before implementation, orient in this order:

1. Read this file.
2. Read **Avenxa Agentic Development System (ADS) v1.1**: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
3. Read **Avenxa Command Protocol v1**: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
4. Use the Command Protocol Quick Reference only as an operational aid: https://app.notion.com/p/3d7eca0675e381e98746ff8718a09d79
5. Read **AgentCal Hub — Product Truth**: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
6. Read **AgentCal / AgentConsult product split**: https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
7. Read **Avenxa Product Experience Standard (APXS)**: https://app.notion.com/p/3daeca0675e381b6a3cef40b4c666402
8. Read **AgentCal UX Rebaseline**: https://app.notion.com/p/3daeca0675e3817d9af9d2b66d047446
9. Read `docs/HANDOFF.md`.
10. Inspect actual code, tests, Git/PR state, verification evidence, and runtime evidence before changing implementation.

## Shared Command Protocol

Avenxa Command Protocol v1 is the canonical Product Owner → reasoning AI → Builder control language. Apply known canonical commands without asking the Product Owner to restate them. Commands never override approved scope, acceptance criteria, verification requirements, financial-methodology controls, security/privacy, production protection, or Human Gates.

Canonical commands include: `Define Scope`, `Prepare Handoff`, `Execute Task`, `Code Complete`, `Review Work`, `Check Diff`, `Verify Work`, `Fix Handoff`, `Recheck Work`, `Check Blocker`, `Commit Ready`, `Push Ready`, `Preview Ready`, `Review Preview`, `Release Ready`, `Human Gate`, `Update Truth`, `Resume Work`, `Next Action`, and `Hold Work`.

## Mission

AgentCal is Avenxa's dedicated **Calculate** platform for real-estate **SELL → BUY → MOVE** financial scenarios.

It owns deterministic calculation, explicit assumptions, transparent result breakdowns, fast recalculation, calculation-focused comparison, and grounded explanation.

**Canonical architecture principle:** **Universal calculation workflow, localized financial authority.**

**Cross-product boundary:** AgentCal = Calculate. AgentConsult = Clarify & Decide. AgentCal must not absorb conversation-first consultation workflow, Advisor-private notes, recommendation workflow, decision capture, CRM, transaction management, or other AgentConsult responsibilities.

## Authority

- Product Truth: AgentCal Hub — https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Product split — https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- **APXS — cross-product product-experience/UI/UX authority:** https://app.notion.com/p/3daeca0675e381b6a3cef40b4c666402
- AgentCal-specific UX/product planning authority while paused — https://app.notion.com/p/3daeca0675e3817d9af9d2b66d047446
- ADS — https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Command Protocol — https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
- Execution Truth: this repository, Git/PR state, tests, verification evidence, and `docs/HANDOFF.md`.

If Product Truth and repository reality materially conflict, stop the affected action and surface the conflict. Repository history proves what is implemented; it does not silently redefine Product Truth.

APXS governs reusable cross-product product-experience principles. The AgentCal UX Rebaseline is a product-specific extension/planning authority only while AgentCal is On Hold. Neither authorizes implementation or overrides the Resume Work reconstruction/sequencing gate.

## ADS v1.1 Role Model — Mandatory Default

- **Product Owner / Human:** intent, priority, consequential product decisions, Human Gates, sequencing, final acceptance.
- **ChatGPT / reasoning AI:** AI Product Manager + Planner + Architect + Reviewer. Define bounded work, prepare Builder handoffs, identify conflicts/risks, review actual implementation evidence, and recommend next action.
- **Claude Code / approved coding agent:** Builder. Implement the bounded task, run verification, diagnose, self-correct, and maintain durable repository continuity.
- **Independent Reviewer:** inspect objective, actual diff, verification evidence, and runtime evidence where required.

The Planner/Reviewer does **not** implement the same task by default. A same-AI Planner/Reviewer + Builder combination requires explicit Product Owner authorization for that specific task.

## Current Execution — Paused / On Hold

- **AgentCal is On Hold / Paused.** No feature implementation is active.
- Current repository `main` is `30aa7256885c0ffabc20b5baa2fd367edf1280fa` (PR #7 merge commit).
- SELL Feature 01 is implemented and merged. Accepted implementation merge commit: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- Pure SELL calculation logic and tests live under `lib/engine/`.
- The approved future AgentCal sequence is: **Scenario-first → Progressive Input → Hero Result → Build / Results → Contextual Next Actions → Readiness → + Add Menu → Inline Recalculation → AI Gap Detection → Client-ready Share**.
- A preserved Feature 02 candidate exists on `feature/02-tier2-export-share` at `25ffeea2e52b652b1345dc6c5978a328349c9d32`. It is unreviewed, unaccepted, and unmerged. Do not delete or merge it automatically.
- BUY and MOVE are not implemented on `main` and are not authorized while paused.
- AgentCal ↔ AgentConsult integration remains deferred.

**Current Next Action while paused = no implementation.** Product/UX/governance documentation may be refined when explicitly requested. On `Resume Work`, reconstruct state, reconcile Product Truth + APXS + AgentCal UX Rebaseline + preserved Feature 02 work, then resolve sequencing before a new bounded Technical Plan or Builder handoff.

## Product Boundary

### AgentCal owns

- deterministic SELL / BUY / MOVE financial engines;
- explicit assumptions, money/rounding behavior, and authoritative jurisdiction-specific calculation rules;
- scenario/input/result contracts and transparent result breakdowns;
- immediate recalculation when assumptions change;
- calculation-focused scenario comparison;
- AI explanation grounded in deterministic results and rule metadata.

### AgentConsult owns

- client life situation, goals, constraints, timing, concerns, and desired next stage;
- conversation-first SELL / BUY / MOVE consultation journeys;
- Advisor guidance and Advisor-private versus client-safe boundaries;
- trade-off clarification, professional recommendations, decision capture, and next actions.

### Integration rule

Do not move AgentCal's engine into AgentConsult or pull AgentConsult's consultation workflow into AgentCal. Any future integration is a separate bounded task and should prefer a small, explicit, versioned scenario/result contract after both sides stabilize.

## Jurisdiction Architecture

### Canonical principle

**Universal calculation workflow, localized financial authority.**

Universal calculation architecture:

`Scenario → Inputs → Jurisdiction → Rules → Deterministic Calculation → Results → Adjust → Compare → Explain → Share`

### Universal calculation core should own

- Scenario identity/lifecycle and revision model;
- input and result contracts;
- calculation validity/readiness framework;
- result breakdown/comparison structure;
- deterministic recalculation contracts;
- AI explanation framework grounded in verified deterministic results.

### Jurisdiction rule packs should own

- jurisdiction-specific formulas;
- taxes, fees, exemptions, rebates and thresholds;
- local financial methodology and transaction-cost rules;
- required disclosures/caveats that materially affect calculation presentation;
- explicit source/validation metadata where applicable.

### Locale layer should own

- language;
- terminology;
- currency/date/number formatting;
- presentation choices that must not silently change calculation cents.

### Architecture rules

- **BC is the first supported calculation jurisdiction, not the universal product definition.**
- Current configured jurisdiction/locale remain `CA-BC` and `en-CA` until explicitly changed.
- Prefer **stable contracts + explicit jurisdiction modules** over scattered `if jurisdiction...` logic.
- Do not build a giant abstract universal formula engine before a real second-jurisdiction need exists.
- Where practical, make rule packs traceable by **jurisdiction + rule version/effective date + validation/source metadata** so saved scenarios remain reproducible and explainable.
- A saved scenario should not silently change historical amounts merely because current rules later change; any future recalculation/version-migration behavior requires explicit Product Truth and acceptance criteria.
- Jurisdiction-agnostic does not mean jurisdiction-unaware. Do not invent, infer, or silently substitute local legal/tax/fee authority.
- Do **not** implement additional jurisdictions during the current Hold. This architecture decision establishes boundaries only.

## Product Experience — APXS + AgentCal Extensions

**APXS is the canonical reusable product-experience authority.** Do not redefine general rules such as Outcome First, Progressive Disclosure, one primary decision/action, contextual next action, state/readiness, edit-in-context, immediate feedback, responsive/accessibility baseline, AI-in-context, trust through transparency, or natural end artifacts in this repository unless an explicit AgentCal exception is required.

The AgentCal UX Rebaseline translates APXS into a calculation-specific implementation sequence. AgentCal-specific extensions include:
- **Scenario-first:** Scenario is the persistent calculation object and owns assumptions, jurisdiction/rule context, results, and revision state.
- **Financial result hierarchy:** the main monetary conclusion should be immediately legible while assumptions and breakdown depth remain available.
- **Deterministic recalculation:** changing an approved assumption must route through authoritative application code; UX convenience never bypasses formula/rounding authority.
- **Calculation readiness:** distinguish data completeness, calculation validity, and professional certainty.
- **Jurisdiction rule authority:** local rules remain explicit, governed, and traceable; Locale must not alter calculation cents.
- **AI explanation:** ground interpretation in Scenario + jurisdiction + verified deterministic result + rule metadata.
- **Client-ready financial output:** preserve assumptions, caveats, calculation provenance, and advisor-safe presentation.

The approved future sequence remains **Scenario-first → Progressive Input → Hero Result → Build / Results → Contextual Next Actions → Readiness → + Add Menu → Inline Recalculation → AI Gap Detection → Client-ready Share**. Treat it as AgentCal product-specific planning, not ten universal Avenxa UI mandates.

The UX Rebaseline must not introduce CRM, full consultation workflow, discovery-question orchestration, transaction management, property-search marketplace, social/follower features, complex collaboration, or AI-generated authoritative financial amounts.

## Non-Negotiable Constraints

- Financial amounts are produced only by deterministic application code using approved jurisdiction rules.
- AI must not calculate, invent, override, or silently alter authoritative financial amounts, formulas, local rules, or source assumptions.
- Scenario, Jurisdiction, and Locale remain separable.
- Locale must never silently change calculation cents.
- Preserve money/rounding behavior unless Product Truth explicitly authorizes a change.
- BUY must not recommend or steer toward a particular mortgage product, rate, term, or lender.
- Do not add consultation orchestration, Advisor-private notes, recommendation capture, CRM, or transaction-management scope merely to make AgentCal resemble AgentConsult.
- Existing Feature 01 privacy/data-handling constraints remain binding unless Product Truth explicitly changes them.
- Preserve ADS Planner/Reviewer ↔ Builder separation unless the Product Owner explicitly authorizes a task-specific exception.
- UX simplicity must never hide material assumptions, rule provenance, or uncertainty.
- Do not create multi-jurisdiction implementation work merely to prove abstraction.

## Repository Map

- `app/` — Next.js App Router presentation and calculator interaction.
- `lib/engine/` — pure authoritative calculation logic. Nothing here may import React, DOM, browser storage, Supabase, or AgentConsult workflow modules.
- `lib/` — non-engine presentation or interaction helpers.
- `e2e/` — Playwright browser checks.
- `plans/features/01-sell-net-proceeds.md` — completed SELL technical-plan reference.
- `docs/HANDOFF.md` — current technical continuity checkpoint.
- `PROJECT_BRIEFING.md` — thin routing note.
- `package.json` — dependencies/scripts.
- `CLAUDE.md` — redirect to this file.

## Calculation Engine Convention

- `lib/engine/sell.ts` — current SELL calculation functions and types.
- `lib/engine/currency.ts` — shared money-as-cents helpers.
- When BUY is authorized, use the same pure-engine separation pattern unless a bounded Technical Plan documents a compatible improvement.
- When MOVE is authorized, compose verified SELL and BUY results rather than reimplementing their calculations.
- Add cross-scenario/shared abstractions only when a real second-scenario need exists.
- Add jurisdiction abstraction only to the extent needed to keep universal contracts clean and BC rules explicit; avoid speculative frameworks.
- UI may import from `lib/engine/`; never reverse that dependency.

## Repository Commands

Install:   `pnpm install --frozen-lockfile`
Dev:       `pnpm dev`
Lint:      `pnpm lint`
Typecheck: `pnpm type-check`
Test:      `pnpm test`
E2E/UI:    `pnpm test:e2e`
Build:     `pnpm build`
Schema:    N/A unless a future bounded task explicitly adds persistence/schema work.

Do not claim an unavailable or unexecuted check passed.

## Execution Rules

1. Invoke ADS automatically.
2. Apply Planner/Reviewer ↔ Builder role separation by default.
3. Work on one bounded objective at a time; keep unrelated edits out.
4. Inspect actual repository state before assuming dependencies, components, tests, schema, features, or runtime behavior exist.
5. Confirm Product Truth, sequencing, acceptance, expected evidence, and Human Gates before meaningful implementation.
6. Do not start Feature 02 continuation, BUY, MOVE, UX implementation, jurisdiction refactoring, or new jurisdiction work while AgentCal is paused.
7. After `Resume Work`, do not refactor existing BC logic simply for architectural purity. First identify actual coupling, preserve accepted behavior, and create a bounded plan.
8. Builder uses **Build → Verify → Diagnose → Fix → Re-Verify** before `Code Complete`.
9. A failing/unavailable required check remains unresolved until fixed or explicitly escalated.
10. Update tests and durable technical documentation when implementation changes their truth.
11. Reviewer inspects actual diff plus evidence after `Code Complete`.
12. Never store secrets or credentials in committed files or documentation.
13. Keep AgentCal calculation responsibilities separate from AgentConsult consultation responsibilities.
14. Avoid concurrent edits to the same working tree by multiple Builders.
15. After each bounded action, identify the next authorized workflow action; do not start unrelated backlog work.

## Human Gates

Product Owner approval is required for:

- `Resume Work` / leaving On Hold;
- product scope, priority, acceptance, milestone sequencing, and Feature 02 versus BUY sequencing;
- choosing which UX Rebaseline phase becomes implementation work;
- changes to authoritative formulas, rounding, disclosures, privacy/data handling, or calculation methodology;
- changes to universal-core / jurisdiction-rule-pack / locale boundaries;
- adding or materially changing a jurisdiction pack;
- changes to AgentCal / AgentConsult responsibility boundaries;
- consequential architecture, security, privacy, compliance, auth, or data-model decisions;
- destructive operations or production mutation/schema migration;
- task-specific Planner/Reviewer + Builder role-combination exceptions;
- final product acceptance and applicable merge/release gates.

## Definition of Done

A bounded task is complete only when:

- scope and acceptance criteria are satisfied;
- required verification passes;
- Builder self-correction is complete;
- actual diff/change set has been reviewed;
- role separation was preserved or an exception was explicitly authorized;
- independent review/runtime evidence exists where required;
- applicable Human Gates and Product Owner acceptance are satisfied;
- `docs/HANDOFF.md` is current.

## Handoff

Before stopping after meaningful work, update `docs/HANDOFF.md` with:

**Protocol State / Command** — current canonical command

**Objective** — current bounded outcome

**Completed** — what is complete

**Changed** — important implementation/configuration/behavior changes

**Verified** — exact commands/checks and results

**Open** — defect, blocker, verification gap, or deferred item

**Next** — one bounded next technical action

**Authority / Gate** — what may continue autonomously vs what needs Product Owner approval

Keep the handoff current rather than appending chat transcripts or maintaining competing status documents.

## Current Next Action

AgentCal is paused. There is no active implementation next action.

The first future implementation action begins only after **Resume Work** reconstruction and Product Owner sequencing. Reconcile the preserved Feature 02 candidate with current Product Truth, APXS, the AgentCal UX Rebaseline, and the universal-calculation/localized-authority architecture; then decide whether to finish/review Feature 02, formally defer it and authorize BUY, or authorize a separately bounded UX/architecture task. Do not build another jurisdiction as part of reactivation unless separately approved.

## Tool-Specific Instructions

`AGENTS.md` is the common cross-agent repository authority. Tool-specific files should redirect here or contain only genuinely tool-specific scoped instructions.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->