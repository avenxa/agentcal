# AgentCal Technical Handoff — Current

## Protocol State / Command

**ADS vNext migrated — Builder execution READY / WAITING — ACCESS in this ChatGPT environment.** The implementation branch is `feature/03-sell-scenario-foundation-v1`. Claude Code is the sole AgentCal Builder. This ChatGPT environment has no Claude Code execution entry, so Builder execution cannot be launched here. This is an Access Gate, not a Human Gate, and no implementation has been simulated by the AI PM.

## Objective

Implement and self-verify the already-defined **SELL Scenario Foundation v1** without changing accepted SELL financial authority or expanding scope.

## Product Truth

- Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Current Project Checkpoint: https://app.notion.com/p/3f0eca0675e381c5992bf73ff76e5a15
- Current Design Definition: https://app.notion.com/p/3f0eca0675e3818ea370de8257f8523e
- Project Instructions: https://app.notion.com/p/3daeca0675e381c4b7c3cbb1cc527a36
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08

## Completed

- Product Owner authorized AgentCal reactivation and proactive ADS progression until Human Gate.
- Notion portfolio status changed from Closed to Building / In Progress / On Track.
- Prior Superseded / Closed direction retired from Product Truth.
- Project Instructions refreshed to current ADS.
- SELL Scenario Foundation v1 Design Definition created.
- Existing repository and Vercel project retained; no project infrastructure recreated.

## Execution Truth

- Repository: https://github.com/avenxa/agentcal
- Reactivation baseline before governance sync: `d566e24621fa63000589676dfe429960cc4d5acd`.
- Accepted SELL Feature 01 merge: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- Production URL: https://agentcal-five.vercel.app/
- Production deployment was verified READY from reactivation baseline `d566e246...`.
- No open PRs were found at reactivation review.
- Preserved Feature 02 branch: `feature/02-tier2-export-share` at `25ffeea2e52b652b1345dc6c5978a328349c9d32`; preserved, unfinished, unaccepted.
- At review time Feature 02 was 4 commits ahead and 20 commits behind the then-current main.

## Scope Now

In scope:
- SELL Scenario identity/lifecycle.
- Progressive essential vs optional SELL inputs.
- Hero Result hierarchy.
- Build / Results responsibilities.
- deterministic recalculation.
- readiness/completeness.
- save/reopen product contract.
- jurisdiction/rule-version provenance.
- mobile-first states and accessibility requirements.

Out of scope:
- BUY.
- MOVE.
- Feature 02 continuation/merge.
- runtime AI guidance.
- CRM / AgentConsult workflow.
- second jurisdiction.
- formula or rounding changes.
- premature persistence/auth implementation.

## Verification State

Verified during reactivation:
- actual repository branch state;
- Feature 02 branch preservation;
- no open PRs;
- Vercel production deployment READY and sourced from the reactivation baseline main commit.

Not re-run in this documentation/definition cycle:
- local lint;
- type-check;
- unit tests;
- Playwright E2E.

Historical test evidence remains history only and must be rerun by Builder when implementation begins.

## Human Gate / Access Status

**Human Gate: None.** Previously completed Definition / Design approvals remain valid and are not reopened by ADS vNext migration.

**WAITING — ACCESS:** this ChatGPT environment cannot invoke Claude Code. Manual Claude Code dispatch remains the safe fallback. No GitHub Action or verified GitHub → Claude Code automatic trigger exists in this repository.

## Design Evidence

- User Flow / IA: https://app.notion.com/p/3f0eca0675e3810abbfbd12dcd4db1bc
- Figma Design Truth: https://www.figma.com/design/5MQ4tslEDHs26UTTbV0JBg
- Frames: Mobile Build, Mobile Results, Desktop Build, Desktop Results, exception / continuity states.
- QA: desktop composition passed; mobile header clipping was detected and corrected; final mobile recheck passed.

## Technical Definition

- Product Truth: https://app.notion.com/p/3f0eca0675e3813e97a9dcda4d955f24
- v1 persistence: browser-local `localStorage` behind a replaceable storage adapter.
- No Supabase/auth/cloud sync in this bounded slice.
- Existing deterministic SELL engine remains authoritative.
- Selling Price is the only calculation-blocking positive-value input under accepted engine behavior; Mortgage remains a key input but `$0` is valid.
- Planned Builder branch: `feature/03-sell-scenario-foundation-v1`.
- Required checks: lint, type-check, unit, build, Playwright, responsive/browser QA, Figma comparison, independent QC.

## Builder Handoff

- Branch: `feature/03-sell-scenario-foundation-v1`
- Branch creation base: `145b6b339b3d5fbeaf89f7d1fb3509ef28b36c55`
- Builder plan: `plans/features/03-sell-scenario-foundation-v1.md`
- Technical Definition: https://app.notion.com/p/3f0eca0675e3813e97a9dcda4d955f24
- Figma: https://www.figma.com/design/5MQ4tslEDHs26UTTbV0JBg
- No implementation code has been written yet.
- ADS vNext migration updated repository execution docs only; no product code, formulas, tests, deployment or runtime state was changed.

## ONE NEXT ACTION

**Owner: Claude Code.** Open `avenxa/agentcal`, checkout `feature/03-sell-scenario-foundation-v1`, and execute from repository context in this order: `CLAUDE.md` → `AGENTS.md` → `docs/HANDOFF.md` → `plans/features/03-sell-scenario-foundation-v1.md` → necessary Product Truth / Figma references.

When the Builder reports **Code Complete**, return control to AI PM for independent review. Merge/production release remains separately gated.

## Stop / Escalation Conditions

Stop only the affected path if:
- Product Truth conflicts with accepted SELL calculation behavior;
- scope expands into BUY/MOVE/Feature 02/CRM/runtime AI;
- authoritative formulas, rounding, jurisdiction rules or disclosures would change;
- persistence/auth choice becomes a consequential architecture decision outside the approved Feature 03 Technical Definition;
- a destructive production/data action or release boundary is reached.

## ADS vNext Migration Record — 2026-10-05

- Project-owned ADS migration completed without restarting the lifecycle or reopening settled Feature 03 decisions.
- `AGENTS.md` now treats Human Gates as exception-control points and distinguishes WAITING — ACCESS.
- `CLAUDE.md` is now a concise Builder contract instead of a redirect-only file.
- README and PROJECT_BRIEFING intentionally remain unchanged because they do not own ADS execution policy.
- No `PLOT.md`, `.github/workflows`, or `docs/handoffs/CURRENT.md` exists; `docs/HANDOFF.md` remains the declared repository checkpoint.
- Builder automation status: **NOT IMPLEMENTED**. Manual Claude Code dispatch is temporary fallback.
- Verification for this migration is documentation consistency and actual Git-state inspection only; application tests were not rerun because no product code changed.
