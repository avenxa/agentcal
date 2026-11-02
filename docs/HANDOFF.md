# AgentCal Technical Handoff — Current

## Protocol State / Command

**Code Complete — Issue #16 (docs-only closeout).** SELL v2 is accepted and released; this task reconciles stale current-state statements in `AGENTS.md` and this file; amended after AI PM review (2026-11-02) to record final `main` `c1147a9` and current Production `dpl_29VHjFUXh9M6RtUWAxNmfkJUWGH7`. No code, config, tests, package or product-behaviour change. Awaiting AI PM Recheck Work; merge is separately gated. Sections under **Historical Archive** below are history, not current state.

## Objective

Current state: none active for Builder. Docs closeout only (Issue #16). No BUY, MOVE or Feature 02 authorization; next product scope needs a new bounded task.

## Current Truth (verified)

- **Release:** AgentCal PR #15 merged; Product Owner accepted mobile SELL v2. Merge commit on `main`: `f6a22bb249050ad809240af3d9af45e0cbaa16ba`.
- **CI source:** [PR #15 run 40162946639](https://github.com/avenxa/agentcal/actions/runs/40162946639) success on exact reviewed head `c68922556c75069dae780ef8e7e838602553cfbf` (per Issue #16). GitHub push CI on the merge commit itself was not verified here.
- **Final current `main`:** `c1147a9eb2f3b4c8c9aac4789d48a5acbaf321f7` (PR #18, Issue #17 320px Results net-row fix, then PR #20, Issue #19 planning costs grouped under net proceeds; both UI-only).
- **Current Production:** Vercel deployment `dpl_29VHjFUXh9M6RtUWAxNmfkJUWGH7` **READY** on that exact final SHA; aliases https://agentcal-five.vercel.app/ and https://agentcal-avenxa.vercel.app/ confirmed by Vercel deployment lookup (AI PM independent review of this PR, 2026-11-02).
- **Product Owner iPhone Production evidence:** actual iPhone Production screenshots reviewed and recorded in Issue #10 comment 6567311352. **PASS only for** observed SELL results arithmetic, grouped planning costs, saved scenario list/reopen and visible Saved/Done. This is **not** a full test-checklist or real-device compatibility PASS; Issue #10 remains open.
- **Historical release evidence (PR #15, superseded as current Production):** deployment `dpl_Bi6KDh7832ojNLznAMHTa512AwRK` READY on merge SHA `f6a22bb`, no Vercel runtime errors in the 1h window checked (per Issue #16). Retained as history only.
- **Superseded:** PR #12 and #14 closed unmerged; Issue #13 closed completed; Feature 03 foundation UX superseded by SELL v2 (Hero Result → Build / Results was rejected).
- **SELL v2 flow:** Inputs → explicit Calculate → separate Results ledger → Save → Done → ephemeral one-time "Estimate saved / You're done for now" on Scenarios Entry. Rule `sell-bc-2026-08-09-v1`, CA-BC / en-CA unchanged.
- **Product Truth:** Hub https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e ; latest checkpoint https://app.notion.com/p/3f0eca0675e381c5992bf73ff76e5a15 ; Design Truth https://app.notion.com/p/401eca0675e3811483ead46d8b25520b . ADS https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08 .
- **Preserved, not authorized:** Feature 02 on `feature/02-tier2-export-share` (`25ffeea2e52b652b1345dc6c5978a328349c9d32`); BUY; MOVE.

## Verification State

- Verified: current Production deployment `dpl_29VHjFUXh9M6RtUWAxNmfkJUWGH7` READY on final `main` SHA `c1147a9` with both aliases (AI PM review, 2026-11-02); PR #15 CI success on its reviewed head (historical); PO iPhone Production screenshots PASS for the limited scope listed in Current Truth.
- **Gaps:** (1) full combined-`main` GitHub Actions CI at `c1147a9` not independently observed; Vercel commit status success does not substitute. (2) Issue #10 full test checklist and real-device compatibility not complete (PO iPhone evidence is limited-scope). (3) This Builder session ran no HTTP/browser smoke of Production.
- This docs task: diff verified docs-only (`AGENTS.md`, `docs/HANDOFF.md`); application checks not re-run because no code changed (see PR for lint/format outcome if run).

## Human Gate / Access Status

Human Gate: none for this docs task. Merge and any release remain Product Owner / AI PM-gated. Builder automation (GitHub → Claude Code): **NOT IMPLEMENTED**; manual dispatch only.

## ONE NEXT ACTION

**Owner: AI PM / Independent Reviewer.** Run Recheck Work on this amended docs-only PR (exact diff: `AGENTS.md`, `docs/HANDOFF.md`), then proceed with current closeout review and QA: close out Issue #16 on merge, and complete the remaining Issue #10 QA checklist and observe combined-`main` CI. Merge remains Product Owner / AI PM-gated.

---

# Historical Archive — superseded, retained as evidence

> Everything below is **history**. Statements such as "Awaiting PR review", "Implement … SELL Scenario Foundation v1", "planned Builder branch", "Human Gate: None for Builder work", and any "ONE NEXT ACTION" in these sections described an earlier moment and are **not** current. Use **Current Truth** above.

### Earlier Protocol State (Issue #17, 2026-11-01 — historical)

Code Complete — Issue #17 (SELL 320px Results net-row fix); since merged as PR #18.

### Earlier Objective (Feature 03, October 2026 — historical)

Implement and self-verify the **SELL Scenario Foundation v1** without changing accepted SELL financial authority. Completed and superseded in UX by SELL v2.

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

### Earlier Verification State (reactivation, historical)

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

### Earlier Human Gate / Access Status (historical)

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

## Code Complete Report — Issue #19 (SELL Results: net vs planning costs, 2026-11-01)

- Branch: `claude/sell-results-planning-clarity-19`, based on main `f6a22bb249050ad809240af3d9af45e0cbaa16ba`. **Independent of PR #18** (`claude/sharp-pascal-yhgwrj`, 320px net-row collision fix, still open). Head SHA: see PR.
- **Merge dependency:** none required. A trial `git merge` of #18 into this branch applies cleanly (this change edits the Results planning block, appends CSS at the end of `globals.css`, adds e2e tests in a different spot, and inserts this section away from #18's handoff edits). Recommended order: merge #18 first, then this PR; either order works. On main-without-#18 the 320px net row is the known cramped layout; the golden case still passes the no-collision test, the larger 1,212,463 case is what #18 fixes.
- Scope: UI only. **Untouched:** `lib/**` (engine already supplies `estimatedNetProceedsCents`, `optionalPlanningTotalCents`, `estimatedAfterPlanningCents`), commission/GST, snapshots, storage, rule `sell-bc-2026-08-09-v1`, BUY/MOVE.

### Change
- `app/sell-results-view.tsx`: removed the separate "Planning costs (not included above)" card. When planning total > 0, a grouped block sits directly under the Estimated net proceeds row inside the same "How we got there" card: `Less: optional planning costs` (−exact), `Estimated funds after planning costs` (exact line + rounded-dollar amount, negative styling when < 0) and the hint "Planning costs are estimates and are not included in net proceeds." Net row, `result-amount`, ledger rows and their order are unchanged; planning rows are not part of the `ledger` list. Planning = $0 renders exactly as before (no planning block, no second figure).
- `app/globals.css`: appended `.v2-after*` styles (dashed muted block, 26px after-planning amount, stack below 360px).
- `e2e/sell-scenario.spec.ts`: golden case at 320/390/1280 (net $757,163 / exact 757,162.50, planning −10,500.00, after $746,663 / exact 746,662.50, no "available" wording, DOM order, same card, pairwise text-box no-overlap, no overflow); Save → Done → reload → reopen keeps both amounts; zero-planning state has no planning block; after-planning negative with positive net; negative net keeps existing note.

### Verified locally (2026-11-01)
- `pnpm lint` pass; `pnpm type-check` pass; `pnpm test` 44/44; `pnpm build` pass.
- `pnpm test:e2e`: 45 passed, 1 skipped (evidence test needs `VISUAL_DIR`), with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (sandbox lacks pinned Chromium). Main baseline: 38 passed + 1 skipped; existing planning test (`planning-row` $700, `after-planning-row` $834,750, ledger without "Optional planning") still passes unmodified.
- Screenshots (scratch, not committed) at 320, 390, 1280 golden case and 390 zero-planning inspected by eye.

### Not verified / gaps
1. Exact-head CI and Vercel Preview for the new head (record after push); real iPhone Safari.
2. No Figma frame exists for this block; layout follows Issue #19 text.
3. The after-planning figure is a scenario amount, not confirmed available cash; MOVE funding untouched.

**Next action (Issue #19): AI PM / Independent Reviewer** — review diff, exact-head CI and Preview at 320/390; merge order #18 then this PR is Product Owner-gated.

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

## Fix Handoff — PR #15 session completion closure (2026-10-25)

Finding (PO iPhone): after Done the journey ended in a list of Saved cards with no statement that the estimate is complete. UI-only, ephemeral; no persisted Completed lifecycle, no `lib/**` change, no financial/storage change.

- `SellScenarioApp` holds in-memory `completionNotice`, set only by a new `onDone` callback (`finishEditor`: reload list, clear editor, show notice, scroll to top). Header Back (`closeEditor`), New, Open and Duplicate clear it. It is never written to localStorage and a reload does not revive it.
- `SellScenarioEditor`: the clean-saved `Done — Back to Scenarios` button now calls `onDone`; header Back still uses the guarded `onBack`. Done is only rendered for a clean saved Results view, so Draft save, Save failure, dirty edits and Duplicate cannot reach it.
- `SellScenarioEntry`: `role="status"` banner above New SELL Scenario — `✓ Estimate saved` / `You’re done for now.` / `No further action is required. You can close this page or reopen the estimate later in this browser.` and a ≥44px `Dismiss completion notice` button (hides the banner only).
- **E2E:** 39 tests (new: Done shows notice, Save alone does not, dismiss, reload clears; Back/Draft save/Duplicate-discard/New/Open do not show or carry it; failed save never reaches it; 320/390/768/1280 fit, keyboard dismiss).
- **Verified locally:** `pnpm lint`, `pnpm type-check`, `pnpm test` 44/44, `pnpm build`, `pnpm test:e2e` 38 passed + 1 skipped (evidence test needs `VISUAL_DIR`), using `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (sandbox lacks the pinned Chromium).
- **Not verified:** exact-head CI and Vercel Preview for the new head; Figma node 54:2 comparison (no screenshots taken); real iPhone Safari.

## Code Complete Report — Issue #17 (2026-11-01)

- Branch: `claude/sharp-pascal-yhgwrj`, based on main `f6a22bb249050ad809240af3d9af45e0cbaa16ba` (PR #15 merge). Head SHA: see PR / `git log -1` (docs-only handoff commit follows the fix commit).
- Scope: UI only. **Untouched:** `lib/**`, formulas, commission amounts, GST, storage/snapshot logic, rule `sell-bc-2026-08-09-v1`, BUY/MOVE. No BUY/MOVE screens.

### Independent inspection of main (320/390, mobile emulation, Chromium)
- Probed Entry, Inputs, Inputs with both expanders + manual commission + oversize mortgage value, Results, and Tab order, at 320 and 390. Automated box-overlap, off-screen, clipping, <44px target, <16px input font (iOS zoom), unlabeled-control, horizontal-overflow and focus-outline checks: **no findings** except the one below. No console errors.
- Matches approved direction: compact labels, one primary Calculate, Inputs show no result, editable Typical BC preset / Manual amount, Results ledger with net last, Edit inputs secondary, Save → receipt + Done.
- Vector 1,250,000: commission 35,750.00, GST 1,787.50, net 1,212,462.50 (shown $1,212,463 rounded, exact line shown) — verified at both widths.
- **Defect (320px only):** Results final row — the 32px net amount took the grid `auto` column and squeezed the label/exact line; "Estimated" glyphs collided with "$1,212,463" and the Exact line wrapped into a ~4-word column. Not present at 390. (The overlapping-fields screenshot in Issue #17 came from the archived MOVE board; this is a separate, reproduced SELL defect.)

### Fix
- `app/globals.css`: `@media (max-width: 359px)` stacks `.v2-ledger-final` (label + exact line above, amount left-aligned below). No markup/engine change; ≥360px layout unchanged.
- `e2e/sell-scenario.spec.ts`: new test at 320 and 390 comparing text-range boxes of label/exact line vs amount (fails on main at 320, passes with fix) plus no horizontal overflow and `$1,212,463`.

### Verified locally (2026-11-01)
- `pnpm lint` pass; `pnpm type-check` pass; `pnpm test` 44/44; `pnpm build` pass.
- `pnpm test:e2e`: 40 passed, 1 skipped (evidence test needs `VISUAL_DIR`), with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` (sandbox lacks pinned Chromium). Baseline on main before change: 38 passed + 1 skipped.
- Before/after 320px screenshots taken (scratch, not committed).

### Not verified / gaps
1. Exact-head CI and Vercel Preview not yet observed. 2. Real iPhone Safari not tested. 3. Figma 91:2/91:3 not pixel-compared (Figma MCP not used; compared to the Notion v0.3 spec text). 4. "How to use" guidance below the calculator (Notion spec) is not implemented in SELL v2 and was not added: it is new copy/content, not a demonstrated defect — raise to AI PM if wanted. 5. `docs/HANDOFF.md` earlier sections remain historical (Issue #16 stale-doc cleanup still open).

### Issue #17 next action (historical, superseded)

**Owner: AI PM / Independent Reviewer.** Review the PR diff (CSS + one e2e test), confirm CI and READY Preview on the exact head, check Results at 320px on the Preview, then decide on the "How to use" gap (item 4). Merge/Production remain Product Owner-gated.

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
