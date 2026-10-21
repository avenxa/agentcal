# AgentCal Technical Handoff — Current

## Protocol State / Command

**Code Complete — Issue #11 SELL Mobile UX Reset v1.** Builder (Claude Code) implemented the bounded UX/IA reset on `claude/kind-faraday-89oqfv` (PR #12). Awaiting independent AI PM review. Not merged; merge/release remain Product Owner-gated.

## Objective

Replace the Build/Results tab flow with a single-flow mobile-first SELL estimator (price first, live net estimate below, mortgage/cost refinement, breakdown/details on demand, save/reopen) without changing SELL monetary authority.

## Execution Evidence (Issue #11)

- Branch: `claude/kind-faraday-89oqfv` (branched from main `6d28dea`, PR #9 merge). Code commit: `f3497a728f15741520fa3f722779b6f0b811db73`. PR: https://github.com/avenxa/agentcal/pull/12
- Changed: `app/sell-scenario-editor.tsx` (rewritten, no tabs), new `app/sell-cost-fields.tsx`, `app/sell-breakdown.tsx`; removed `app/sell-build-panel.tsx`, `app/sell-results-panel.tsx`; `app/globals.css` (editor styles, safe-area), `app/layout.tsx` (viewport-fit=cover), `e2e/sell-scenario.spec.ts`.
- Untouched (verified empty diff vs main): `lib/engine/**`, `lib/scenarios/**`. Rule `sell-bc-2026-08-09-v1`, 5% commission GST, storage schema, snapshots unchanged.
- Local verification on code commit (Chromium at /opt/pw-browsers): `pnpm lint` PASS; `pnpm type-check` PASS; `pnpm test` 44/44 PASS; `pnpm build` PASS; `pnpm test:e2e` 24 passed, 1 skipped (VISUAL_DIR screenshot test, env-gated).
- E2E covers: first fold at 320×640 and 390×844 (price field within viewport and above hero, no tabs), $850,000 → $822,963, $400k mortgage → $422,963, $1,000,000 preset → $969,025 with $29,500 + $1,475, invalid/negative/mortgage-warning states, disclosures, keyboard/focus, save/reopen, rename keeps ruleVersion, overflow at 320/390/768/834/1280/1366, zero console errors.
- Visual check: screenshots at 390 and 1366 compared with Figma node 25:41 / 27:2; layout matches (price → dark hero → mortgage → cost disclosures).

## Known gaps / Open

- Real iPhone Safari / keyboard behaviour not verified (not accessible from this environment).
- Figma frames 25:2 (Draft) and 25:81 (expanded detail) viewed only indirectly via e2e screenshots, not pixel-compared.
- Deviation: planning/selling disclosures are two top-level cards (the old "Optional selling & planning costs" wrapper was removed); "Optional" badge on mortgage replaces "Key input".
- Vercel Preview / GitHub CI status: see PR #12 checks (recorded in PR, not fabricated here).

## Next

AI PM independent review of PR #12 (diff + Preview on a phone). Merge/Production only after Product Owner authorization.

## Human Gate / Access Status

No Human Gate for Builder work. Merge and Production release gated to Product Owner.

## Product Truth

- Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Current Project Checkpoint: https://app.notion.com/p/3f0eca0675e381c5992bf73ff76e5a15
- Current Design Definition: https://app.notion.com/p/3f0eca0675e3818ea370de8257f8523e
- Project Instructions: https://app.notion.com/p/3daeca0675e381c4b7c3cbb1cc527a36
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
