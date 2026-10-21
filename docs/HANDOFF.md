# AgentCal Technical Handoff — Current

## Protocol State / Command

**Code Complete — PR #12 Fix Work: price-to-net explanation.** Builder (Claude Code) added the always-visible price → net bridge to the hero (Product Owner iPhone finding on `74a8098`). Awaiting independent AI PM recheck. Not merged; merge/release remain Product Owner-gated.

## Objective

Replace the Build/Results tab flow with a single-flow mobile-first SELL estimator (price first, live net estimate below, mortgage/cost refinement, breakdown/details on demand, save/reopen) without changing SELL monetary authority.

## Execution Evidence (Issue #11)

- Branch: `claude/kind-faraday-89oqfv` (branched from main `6d28dea`, PR #9 merge). PR: https://github.com/avenxa/agentcal/pull/12
- Commits: initial implementation `f3497a7`; handoff `855855f` (independent review verdict FIX NEEDED); review-fix code commit `f379e9030c02a4d66696cfe221f46113454ac62e`. The head after this handoff edit is docs-only; its CI/Preview status is recorded in the PR comment, since a file cannot name its own commit.
- Fix commit `f379e90` evidence: GitHub CI `verify` run 39528114304 = success (install, lint, type-check, unit, build, Playwright); Vercel Preview READY (`agentcal-2qg9dxh0q-avenxa.vercel.app`, alias https://agentcal-git-claude-kind-faraday-89oqfv-avenxa.vercel.app).
- Review fixes (PR #12 review @ 855855f): (1) hero shows only "Preliminary estimate · Updates when inputs change" / "Saved result · <time>"; jurisdiction + rule version live in Calculation details, reachable from the "Jurisdiction & rule version" link in the hero; (2) no price → "…once you enter a selling price", any invalid input → "Correct the highlighted amount(s) to see the estimate."; (3) new 390×844 e2e asserts the empty hero and the $822,963 result amount are inside the first fold with scrollY 0; 320×640 price test kept; (4) this handoff corrected.
- Local re-verification on `f379e90`: `pnpm lint` PASS; `pnpm type-check` PASS; `pnpm test` 44/44 PASS; `pnpm build` PASS; `pnpm test:e2e` 26 passed (incl. screenshot test with VISUAL_DIR).
- Changed: `app/sell-scenario-editor.tsx` (rewritten, no tabs), new `app/sell-cost-fields.tsx`, `app/sell-breakdown.tsx`; removed `app/sell-build-panel.tsx`, `app/sell-results-panel.tsx`; `app/globals.css` (editor styles, safe-area), `app/layout.tsx` (viewport-fit=cover), `e2e/sell-scenario.spec.ts`.
- Untouched (verified empty diff vs main): `lib/engine/**`, `lib/scenarios/**`. Rule `sell-bc-2026-08-09-v1`, 5% commission GST, storage schema, snapshots unchanged.
- E2E covers: first fold at 320×640 and 390×844 (price field within viewport and above hero, no tabs), $850,000 → $822,963, $400k mortgage → $422,963, $1,000,000 preset → $969,025 with $29,500 + $1,475, invalid/negative/mortgage-warning states, disclosures, keyboard/focus, save/reopen, rename keeps ruleVersion, overflow at 320/390/768/834/1280/1366, zero console errors.
- Visual check: screenshots at 390 and 1366 compared with Figma node 25:41 / 27:2; layout matches (price → dark hero → mortgage → cost disclosures).

## Fix Work — price-to-net explanation (PO iPhone finding on `74a8098`)

- Hero now shows, directly under the net amount and without a disclosure: `From $X selling price`, `Less $Y mortgage payout` (only if > 0), `Less|Plus $Z estimated commission incl. GST` (preset; "commission incl. GST" for manual) or `net selling costs & adjustments` when legal/discharge/penalty/property-tax/other adjustments are present, and `Net shown to the nearest dollar` when net cents are not whole dollars. Planning costs are excluded (they do not reduce estimated net proceeds).
- Source of truth: `PriceToNetBridge` in `app/sell-breakdown.tsx` reads only the resolved result (`inputs`, `commissionBeforeGstCents`, `gstOnCommissionCents`, `displayedSellingCostDeductionCents`, adjustments), so saved snapshots show their saved result and ruleVersion. Nothing is recomputed or hard-coded; lines reconcile to `estimatedNetProceedsCents`. Hidden when the result is null (empty/invalid).
- Focused input stays raw (`1250000`, no mid-keystroke formatting, no caret/focus change); the grouped price appears in the bridge line.
- `lib/engine/**`, `lib/scenarios/**` untouched.
- Local verification: `pnpm lint` PASS; `pnpm type-check` PASS; `pnpm test` 44/44 PASS; `pnpm build` PASS; `pnpm test:e2e` 34 passed (incl. 8 new bridge tests: $1.25M → $1,212,463 + $37,537.50 at 390×844 while typing and in a 390×544 keyboard-sized viewport, 320×640, mortgage, manual commission, adjustments/credit "Plus", planning excluded, negative, empty/invalid, saved reopen) — run with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium` because the sandbox lacks the pinned Chromium.
- Not verified: real iPhone Safari with the actual keyboard (Chromium viewport resize is only an approximation); exact-head CI and Vercel Preview for this fix commit (see PR comment).

## Known gaps / Open

- **WAITING — ACCESS:** real iPhone Safari pass (touch, number keyboard, safe area, scrolling, save/reopen) not available from the Builder or reviewer environment; CI and Preview READY do not prove it.
- Figma frames 25:2 (Draft) and 25:81 (expanded detail) viewed only indirectly via e2e screenshots, not pixel-compared.
- Deviation: planning/selling disclosures are two top-level cards (the old "Optional selling & planning costs" wrapper was removed); "Optional" badge on mortgage replaces "Key input".

## Next

AI PM independent review of PR #12 (diff + Preview on a phone). Merge/Production only after Product Owner authorization.

## Human Gate / Access Status

No Human Gate for Builder work. Merge and Production release gated to Product Owner.

## Product Truth

- Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Current Project Checkpoint: https://app.notion.com/p/3f0eca0675e381c5992bf73ff76e5a15
- Current Design Definition (SELL UX Reset v1): https://app.notion.com/p/3feeca0675e3815b9444fef2800a222a
- Figma Design Truth (UX Reset): https://www.figma.com/design/5MQ4tslEDHs26UTTbV0JBg?node-id=24-2 (node `24:2`; frames 25:2, 25:41, 25:81, 27:2)
- Prior Feature 03 Design Definition (reference only): https://app.notion.com/p/3f0eca0675e3818ea370de8257f8523e
- Builder Task: https://github.com/avenxa/agentcal/issues/11
- Project Instructions: https://app.notion.com/p/3daeca0675e381c4b7c3cbb1cc527a36
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
