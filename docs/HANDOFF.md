# AgentCal Technical Handoff — Current

## Protocol State / Command

**Code Complete — Issue #13 SELL v2 (PR #14 fix round: placeholder & stage consistency).** Builder (Claude Code) implemented the fresh v2 workflow and self-verified it locally. Awaiting PR, CI, exact-head Vercel Preview and AI PM independent review. Not merged; merge/release remain separately gated.

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

## Code Complete Report — Issue #13 (SELL v2 workflow, 2026-10-22)

- Branch: `claude/busy-ride-djj1st` (designated session branch; issue suggested `feat/sell-input-results-rebaseline-v2`). Based on main `6d28dea` (PR #9 merge). Not based on PR #12.
- Implementation commit: `85d5c7d89816817a795f18870527893dafd02abd` (branch head = this plus the docs-only handoff commit).
- Scope: UI view tree only. **Untouched:** `lib/engine/**`, `lib/scenarios/**`, `lib/sell-copy.ts`, storage schema, `package.json`, rule `sell-bc-2026-08-09-v1`.

### Changed
- New `app/sell-inputs-view.tsx` (Inputs mode: price, mortgage, Selling costs & commission, Planning costs, one `Calculate net proceeds` CTA; no amount rendered anywhere) and `app/sell-results-view.tsx` (Results mode: `Edit inputs`, ledger Selling price → Commission (negotiable) → GST 5% → Mortgage → other closing costs/adjustments → final Estimated net proceeds last with exact cents + rounding note, Preliminary / Saved-result status, planning costs separate, Calculation details disclosure, Duplicate).
- Rewrote `app/sell-scenario-editor.tsx` as a two-mode state machine (Build/Results tabs, readiness banner, result preview, side result and hero removed). Calculate validates, blurs keyboard, switches to Results and focuses the `SELL · Results` heading; invalid/empty stays on Inputs, shows the error and focuses the field. `Edit inputs` hides the result; the CTA becomes `Recalculate & show results`. Saved clean Scenario with a saved result reopens on Results (original snapshot/ruleVersion kept via existing `resolveDisplayedResult`); Draft reopens on Inputs. `Save Scenario` on Results, quiet `Save draft` on Inputs. Editing never persists implicitly; leave-unsaved prompt kept.
- Removed `sell-build-panel.tsx`, `sell-results-panel.tsx`, `view-calculation.tsx`; appended `v2-*` CSS to `globals.css`; replaced `e2e/sell-scenario.spec.ts` (22 tests for v2).

### Verified (local, 2026-10-22)
- `pnpm lint` pass; `pnpm type-check` pass; `pnpm test` 44/44; `pnpm build` pass.
- `pnpm test:e2e` 22/22 pass (incl. screenshot test with `VISUAL_DIR`), run with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` because this sandbox lacks the pinned Chromium. Covers: zero `result-amount`/`estimated-net` on Inputs while typing `1250000` (and no `1,212,46x` text); $1.25M ledger (−$35,750.00, −$1,787.50, −$0.00, final $1,212,463, exact $1,212,462.50, final row last); $850k → $822,963; $1M manual $29,500 → GST $1,475 → $969,025; $850k mortgage $400k → $422,963; Edit inputs shows prior values and no result, Recalculate updates; empty/invalid blocked; Save/reopen/Updated/rename-keeps-snapshot/Duplicate/Draft; negative result; all selling/planning inputs ($835,450 / $834,750 after planning); keyboard Enter; corrupt storage; no horizontal overflow at 320/390/768/834/1280/1366 in both modes. Console errors fail every test.
- Screenshots (scratch, not committed) at 390×844 and 1366×900: inputs-default, inputs-typing, results, edit-after-result. Mobile inputs-typing and results inspected by eye.

### Not verified / open
1. **Real iPhone Safari not tested** (no device here); keyboard occlusion/safe-area on iOS is unverified. Playwright only covers Chromium emulation.
2. GitHub CI on exact head, Vercel Preview READY/bound to head: not yet run (no PR opened by this session). Figma frames 37:* were not pixel-compared; layout follows the Notion v2 spec.
3. Quiet same-price `$1,250,000` confirmation while typing was intentionally omitted (optional; caret safety); price formats to grouped CAD on blur.
4. Old v1 CSS (`sc-tabs`, hero, readiness, etc.) is now unused; left in place to keep the diff bounded.
5. `deriveReadiness` remains in `lib/scenarios` but is no longer surfaced in the UI (readiness dashboard excluded by v2 spec).

## Fix Handoff — PR #14 review findings (2026-10-24)

Findings addressed: premature `Calculated` badge on Inputs; `Save draft` persisting an unseen result (reopened on Results); real-iPhone defect where optional fields held a typed `"0"` instead of a placeholder. UI-only: `lib/engine/**`, `lib/scenarios/**`, storage schema, rule version and formulas untouched (`git diff -- lib` empty).

- **Placeholders:** new Scenarios are created in `app/sell-scenario-app.tsx` with every amount field `""` (price keeps `Enter amount`; optional fields placeholder `0`, signed `0 or signed amount`, muted style). `CurrencyField` no longer renders empty as `$0`. Empty parses to $0 in the engine, so results are unchanged. Stored/explicit `"0"` and duplicated values are left as-is (shown `$0` at rest, `0` on focus; focus/blur does not dirty the Scenario).
- **Stage label:** Inputs shows `Draft` unless a saved result exists (then Saved/Updated). Results shows `Calculated` for a not-yet-saved result.
- **Save draft:** from Inputs without a saved result it persists `savedResult: null` (existing Draft semantics) so reopen lands on Inputs. A draft later calculated shows `Calculated` with Save enabled. On a saved Scenario, changed numbers hide Save on Inputs ("Calculate to review and save the changed numbers"); name/review-only edits keep the snapshot.
- **E2E:** 26 tests (new: placeholder at 320/390 incl. `pressSequentially("2500")`, signed `-500`, cleared-optional → zero; Draft badge + Save draft/reload/reopen; saved explicit zero + snapshot; changed-numbers gating).
- **Verified locally:** lint, type-check, `pnpm test` 44/44, `pnpm build`, `pnpm test:e2e` 26/26 (with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`).
- **Not verified:** exact-head CI and Vercel Preview for the new head (record after push); real iPhone Safari recheck.

## Fix Handoff — PR #14 Saved-state actions (2026-10-25)

Finding: after Save, Results showed a prominent disabled grey `Saved` button and an equal-weight outlined `Duplicate Scenario`; no clear completion action. UI-only fix; `lib/engine/**`, `lib/scenarios/**`, storage schema, rule version, formulas, placeholders and Draft/Save-draft semantics untouched.

- **Unsaved Results:** full-width primary `Save Scenario` (`Save changes` when a saved result already exists and numbers changed); `Edit inputs` stays the one secondary action (top of Results); `Duplicate scenario` is now a small ≥44px text action below Save (new-ID unsaved copy unchanged).
- **Clean saved (just saved or reopened):** the disabled button is replaced by a non-interactive `role="status"` receipt `✓ Scenario saved` / `Stored in this browser. Reopen it from Scenarios.` and an enabled primary `Done — Back to Scenarios` (routes through the existing guarded back path; no data change, no recalculation, no auto-redirect). Inputs mode shows the receipt without Done.
- **Failed save:** no receipt or Done; Save stays enabled with the `save-error` alert. **Dirty again:** receipt/Done disappear, Save returns, leave-unsaved prompt still guards back.
- No `Clear`, PDF, Share, or storage changes.
- **E2E:** 32 tests (new: receipt/Done/Duplicate hierarchy and reopen; failed save then retry and dirty guard; 320/390/1280 reachability and no overlap/overflow). Two existing assertions changed from `Save` disabled to receipt shown / button absent.
- **Verified locally:** `pnpm lint`, `pnpm type-check`, `pnpm test` 44/44, `pnpm build`, `pnpm test:e2e` 31 passed + 1 skipped (evidence test, needs `VISUAL_DIR`), run with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` because this sandbox lacks the pinned Chromium.
- **Not verified:** exact-head CI and Vercel Preview for the new head; screenshots against Figma node 50:2; real iPhone Safari.

## ONE NEXT ACTION

**Owner: AI PM / Independent Reviewer.** Confirm CI and a READY Vercel Preview on the new PR #14 head, review the Saved Results actions against Figma node 50:2, then recheck on a real iPhone (Save → receipt + Done → Scenarios, Duplicate). Merge/Production remain Product Owner gated.

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
