# AgentCal Technical Handoff — Current

## Protocol State / Command

**Code Complete — Feature 03 SELL Scenario Foundation v1.** Builder (Claude Code) implemented the bounded slice on `feature/03-sell-scenario-foundation-v1` and self-verified it. Awaiting AI PM independent review. Not merged; merge/release remain separately gated.

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

**Human Gate: None for Builder work.** Access is no longer blocked: Claude Code executed the Builder task. Review, merge and release remain separately gated.

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

## Code Complete Report — Feature 03

- Branch: `feature/03-sell-scenario-foundation-v1`
- Implementation commit: `73a682a4cd3d97fc0f3ce83fa6d6ead39c0dd9bd` (branch head is this commit plus the docs-only handoff commit that follows it)
- Base: `9bb2ad07c1f108e3cee05720c0cb3a3223518bf0` (docs-only Builder dispatch head)

### Changed files
- New `lib/scenarios/sell-scenario.ts` — versioned SELL Scenario model, create/duplicate/save, lifecycle (Draft/Calculated/Saved/Updated), readiness (5 groups), displayed-result resolution (clean saved Scenario keeps its saved snapshot).
- New `lib/scenarios/sell-scenario-storage.ts` — replaceable repository interface; `localStorage` adapter at `agentcal.sell-scenarios.v1`; parse guards; defensive load (corrupt data backed up to `…v1.corrupt-<ts>` before any write; unknown/invalid records retained verbatim).
- New `lib/scenarios/sell-scenario.test.ts` — 22 unit tests.
- New `app/sell-scenario-app.tsx`, `sell-scenario-entry.tsx`, `sell-scenario-editor.tsx`, `sell-build-panel.tsx`, `sell-results-panel.tsx`.
- Modified `app/page.tsx` (renders `SellScenarioApp`), `app/layout.tsx` (title), `app/currency-field.tsx` (optional `badge`, `onBlur`), `app/view-calculation.tsx` (takes `result` instead of UI state), `app/globals.css` (appended `sc-*` section, existing tokens reused), `package.json` (`test` now also runs the scenario tests).
- Removed `app/seller-net-proceeds.tsx` and `e2e/sell-consultation.spec.ts` (the single-page consultation UI replaced by Entry → Build → Results).
- Added `e2e/sell-scenario.spec.ts` (22 Playwright tests, 1 evidence test gated on `VISUAL_DIR`).
- **Untouched:** `lib/engine/*` (formulas, rounding, BC rules, rule version `sell-bc-2026-08-09-v1`), `lib/sell-copy.ts`, `lib/sell-consultation.ts` (still covered by `sell.test.ts`).

### Verified (run from the repo, Oct 6 2026)
- `pnpm lint` — pass.
- `pnpm type-check` — pass.
- `pnpm test` — 43/43 pass (21 existing engine/form + 22 new scenario tests).
- `pnpm build` — pass (`/` static).
- Playwright — 21 passed + 1 evidence test passed with `VISUAL_DIR` set (22/22). **Caveat:** `pnpm test:e2e` with the repo config could not launch here (sandbox Chromium is build 1194, Playwright expects 1234). I ran the same spec with an untracked local config that only sets `executablePath: /opt/pw-browsers/chromium`; no repo config was changed. Please re-run `pnpm test:e2e` in CI/your environment.
- Every Playwright test fails on any browser `console.error` / `pageerror` (auto fixture) — none occurred.
- Coverage of the required flows: Entry→New, Draft Build, $850,000 → `$822,963` (accepted result), mortgage edit → `$422,963`, invalid input removes result, Build↔Results preserves edits, Save→Entry→reload→reopen, Draft save/reopen, Updated lifecycle, Duplicate (Entry and Results), mortgage warning, negative result, all selling/planning inputs reachable (exact `$835,450` / `$834,750` after planning checked by hand), keyboard arrows/focus, malformed storage, widths 320/390/768/834/1280/1366 with no horizontal overflow.

### Fix Handoff — QC findings on 6481b966 (Oct 7 2026)
- **Snapshot preservation:** added `hasSameCalculationInputs` (financial form values + commission mode only). `resolveDisplayedResult` and `saveSellScenario` (new optional `baseline` arg) now use it, so rename / readiness-review-only edits and re-saves keep the saved snapshot and its `ruleVersion`; only a financial edit recalculates and updates the snapshot. `hasSameEditableState` still drives dirty / Saved vs Updated. Regression test added (simulated historical snapshot: rename + review edit + save preserved; financial edit recalculates).
- **E2E command:** `playwright.config.ts` now honors optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` (unset by default; no hardcoded path). Added `.github/workflows/ci.yml` (lint, type-check, test, build, `playwright install --with-deps chromium`, `pnpm test:e2e`).
- Verified: `pnpm lint`, `pnpm type-check`, `pnpm build` pass; `pnpm test` 44/44; `pnpm test:e2e` (repo config, with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` only because this sandbox lacks the pinned Chromium) 21 passed, 1 skipped (evidence test gated on `VISUAL_DIR`). The CI workflow has **not** run yet; first GitHub Actions run on this PR is the supported-environment evidence.

### Runtime / visual evidence
- Screenshots captured with Playwright at 390×844 and 1366×900 for Entry, Build, Results and compared by eye against Figma frames `9:2`, `3:3`, `3:48`, `3:84`, `3:139`. Structure matches (Entry cards + badges, readiness banner, Essential inputs, optional disclosure, result preview, hero + next action + key breakdown + assumptions, desktop two-column with side rail, Duplicate Scenario). Screenshots are not committed (scratch only).
- No Vercel Preview URL was checked from this session.

### Residual risks / deviations
1. `pnpm test:e2e` still needs a green run in CI (workflow added, not yet run); see Fix Handoff above.
2. Figma comparison was visual by eye, not pixel diff; hero shows the full rule version instead of Figma's short "Rule v1" because the exact version must stay inspectable.
3. Old consultation CSS in `globals.css` (topic rail, sticky summary) is now unused; left in place to keep the diff bounded. Candidate for a cleanup task.
4. Readiness "reviewed" flags (mortgage blur, opening selling/planning sections) are saved with the Scenario and count toward Updated vs Saved.
5. Mobile Build shows the result preview below the inputs per Figma; desktop shows it in the side rail.
6. Persistence is browser-local only (single device/browser); no delete/archive by design.
7. Preview/runtime on Vercel and independent QC are still outstanding.

## ONE NEXT ACTION

**Owner: AI PM / Independent Reviewer.** Review PR diff and evidence above, run `pnpm test:e2e` and open the Vercel Preview for the PR, then return Review Work findings. Merge/production release remain separately gated.

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
