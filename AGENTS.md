# AGENTS.md — AgentCal

## Mission

AgentCal is the dedicated **Calculate** platform for BC real-estate advisors. It owns deterministic financial calculation for **SELL → BUY → MOVE** scenarios and presents transparent assumptions, results, breakdowns, and calculation-focused comparison. AI may explain trusted results; it must not create or alter authoritative financial amounts.

**Cross-product boundary:** AgentCal = Calculate. AgentConsult = Clarify & Decide. AgentCal must not absorb the conversation-first consultation workflow, Advisor-private consultation notes, recommendation workflow, or other AgentConsult responsibilities.

## Authority

- Product Truth: AgentCal Hub — https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Cross-product product-split decision — https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- Development process authority: Avenxa Agentic Development System — https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Execution Truth: this repository — code, configuration, technical decisions, plans, tests, verification commands, Git history, and `docs/HANDOFF.md`.
- Runtime Evidence: preview/deployed behavior when a runtime exists for the bounded task.

If Product Truth and repository reality materially conflict, stop the affected action and surface the conflict before changing product behavior. Repository history may prove what is implemented; it does not silently redefine Product Truth.

## Current Execution — 2026-09-11

- SELL Feature 01 is implemented and merged to `main`; merge commit `eaf0cb7503980e217f8078e6228cd57139be69e4` is current repository history.
- Pure SELL calculation logic and tests live under `lib/engine/`.
- `plans/features/01-sell-net-proceeds.md` is a completed implementation reference, not the active feature plan.
- The former AgentCal Product Truth included a still-open Feature 02 export/share artifact dependency. The 2026-09-11 product split does **not** silently cancel that commitment.
- Before feature implementation resumes, Product Truth must explicitly resolve sequencing between that existing Feature 02 commitment and the next BUY calculation-engine milestone.
- No BUY or MOVE engine module is currently present on `main`; do not claim those scenarios are implemented.
- Technical handoff: `docs/HANDOFF.md`.

There is currently **no authorized BUY feature implementation plan**. Do not start `lib/engine/buy.ts` merely because the architecture anticipates it; first resolve the Product Truth sequencing gate and create a bounded Technical Plan.

## Product Boundary

### AgentCal owns

- deterministic SELL / BUY / MOVE financial engines;
- explicit financial assumptions, rules, rounding, and jurisdiction-specific calculation logic;
- transparent calculation breakdowns and result structures;
- immediate recalculation when assumptions change;
- calculation-focused scenario comparison;
- AI explanation only when grounded in authoritative deterministic results.

### AgentConsult owns

- client life situation, goals, constraints, timing, concerns, and desired next stage;
- conversation-first SELL / BUY / MOVE consultation journeys;
- Advisor guidance and Advisor-private versus client-safe boundaries;
- trade-off clarification, professional recommendations, decision capture, and next actions.

### Integration rule

Do not move AgentCal's engine into AgentConsult and do not pull AgentConsult's consultation workflow into AgentCal. A future cross-product integration is a separate bounded task and should prefer a small explicit versioned scenario/result contract after both sides have stable shapes.

## Non-Negotiable Constraints

- Financial amounts are produced only by deterministic application code.
- AI must not calculate, invent, or silently alter financial amounts or source assumptions.
- Scenario, Jurisdiction, and Locale remain separable. Current configured values are `CA-BC` and `en-CA`; locale must never change calculation cents.
- Preserve money/rounding behavior unless Product Truth explicitly authorizes a change.
- BUY must not recommend or steer toward a particular mortgage product, rate, term, or lender.
- Do not add consultation-question orchestration, Advisor-private notes, recommendation capture, CRM, or transaction-management scope merely to make AgentCal resemble AgentConsult.
- Preserve the approved responsive interaction intent for implemented calculator experiences.
- Existing Feature 01 privacy/data-handling constraints remain binding unless current Product Truth explicitly changes them.

## Repository Map

- `app/` — Next.js App Router presentation and calculator interaction.
- `lib/engine/` — pure authoritative calculation logic. Nothing here may import React, DOM, browser storage, Supabase, or AgentConsult UI/workflow modules.
- `lib/` — non-engine presentation or interaction helpers.
- `e2e/` — Playwright browser checks for implemented calculator UI.
- `plans/features/01-sell-net-proceeds.md` — completed SELL technical-plan reference.
- `docs/HANDOFF.md` — current technical continuity checkpoint.
- `PROJECT_BRIEFING.md` — thin routing note to current Product Truth and repository entrypoints.
- `package.json` — installed dependencies and executable scripts.
- `CLAUDE.md` — redirect to this file.

## Calculation Engine Module Convention

Pure calculation logic for every scenario lives under `lib/engine/`, never directly under `lib/` and never inside `app/`:

- `lib/engine/sell.ts` — current SELL calculation functions and input/result types.
- `lib/engine/currency.ts` — shared money-as-cents helpers currently used by SELL.
- When BUY is explicitly authorized, use `lib/engine/buy.ts` on the same pure-engine pattern unless the bounded Technical Plan documents a better compatible structure.
- When MOVE is explicitly authorized, it should compose verified SELL and BUY result types rather than reimplement their calculations.
- Add cross-scenario shared types only when a real second-scenario need exists; do not over-generalize in advance.
- Nothing under `lib/engine/` may import React, DOM, browser storage, Supabase, or AgentConsult code.
- UI imports from `lib/engine/`; never reverse that dependency.

## Canonical Commands

Install:   `pnpm install --frozen-lockfile`
Dev:       `pnpm dev`
Lint:      `pnpm lint`
Typecheck: `pnpm type-check`
Test:      `pnpm test`
E2E/UI:    `pnpm test:e2e`
Build:     `pnpm build`
Schema:    N/A unless a future bounded task explicitly adds persistence/schema work.

Run additional checks required by the active Technical Plan. Do not claim an unavailable or unexecuted check passed.

## Execution Rules

1. Work on one bounded objective at a time and keep unrelated edits out.
2. Inspect actual repository state before assuming dependencies, components, tests, schema, prior features, or runtime behavior exist.
3. Confirm current Product Truth, active sequencing, acceptance, and applicable Human gates before meaningful feature implementation.
4. Do not start BUY/MOVE implementation without a current bounded Technical Plan.
5. Build → Verify → Diagnose → Fix → Re-Verify before reporting implementation completion.
6. A failing or unavailable required check remains unresolved until fixed or explicitly recorded/escalated.
7. Update tests and durable technical documentation when implementation changes their truth.
8. Consequential work requires independent review of actual diff and evidence; the Builder is not the sole reviewer.
9. Never store secrets or credentials in committed files or documentation.
10. Keep AgentCal calculation responsibilities separate from AgentConsult consultation responsibilities.
11. When one AI/tool is the active coding agent, other orchestrator/reviewer tools must not concurrently edit the same working tree.

## Human Gates

Human/Product Owner approval is required for:

- product scope, priority, acceptance, or milestone sequencing changes — including resolving Feature 02 versus BUY sequencing;
- changes to authoritative formulas, rounding, disclosures, privacy/data handling, or jurisdiction/locale boundaries;
- changes to the AgentCal / AgentConsult responsibility boundary;
- consequential architecture, security, privacy, compliance, or data-model decisions;
- new material external services or paid commitments;
- production data mutation, destructive operations, or production schema migration;
- final product acceptance and any merge/release gate required by ADS/project policy.

Routine reversible implementation mechanics inside an approved bounded task do not require repeated approval.

## Definition of Done

A bounded task is complete only when intended scope and acceptance criteria are satisfied, required verification passes, failures are self-corrected, independent review/runtime evidence exists where required, applicable Human gates are satisfied, and `docs/HANDOFF.md` is current.

## Handoff

Before stopping after meaningful work, update `docs/HANDOFF.md` with **Completed / Changed / Verified / Open / Next**. Keep it current rather than appending chat transcripts or maintaining competing status documents.

## Current Next Action

After this documentation realignment is accepted, stop at the Product Truth sequencing gate: decide whether the outstanding Feature 02 export/share commitment is completed before BUY or explicitly reprioritized. Only then create the next bounded Technical Plan and hand it to the Builder.

## Tool-Specific Instructions

`AGENTS.md` is the common cross-agent repository authority. Tool-specific files should only redirect here or contain genuinely tool-specific scoped instructions; do not maintain duplicate full rule sets.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
