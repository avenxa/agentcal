# AgentCal Technical Handoff — Current

## Protocol State / Command

**Human Gate** — product-boundary and Command Protocol documentation alignment are prepared on PR #4. Product Owner approval is required before merge. After merge, the next separate Human Gate is the Feature 02 export/share versus BUY sequencing decision.

Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490

## Authority

- Product Truth / AgentCal Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Active product-split decision: https://app.notion.com/p/3d8eca0675e381bda84ac79174ff2211
- ADS: https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
- Canonical Command Protocol: https://app.notion.com/p/3d7eca0675e381fc9ea5da038a735490
- Repository entrypoint: `AGENTS.md`
- Completed SELL reference plan: `plans/features/01-sell-net-proceeds.md`

This file is the current durable repository handoff. Older text describing Feature 01 as uncommitted/unpushed is superseded by actual Git history.

## Product Truth ↔ Repo Sync

- Product Truth was re-confirmed on **2026-09-11** in the current AgentCal Hub.
- Matching repository documentation is carried by PR #4 on branch `docs/product-split-2026-09-11`.
- The synchronized boundary is: **AgentCal = Calculate; AgentConsult = Clarify & Decide.**
- AgentCal keeps authoritative deterministic SELL / BUY / MOVE calculation ownership; no AgentCal engine migration into AgentConsult is required.
- Product Truth remains authoritative for scope and product responsibility. GitHub remains authoritative for implemented repository state.
- The repository branch now also enforces the sole canonical Avenxa Command Protocol semantic authority; package/shell commands are explicitly classified as repository execution commands rather than Command Protocol commands.
- Until PR #4 is approved and merged, `main` remains the prior execution baseline; this branch is the pending documentation alignment.

## Completed

- Feature 01 SELL implementation was merged to `main` through PR #3 on 2026-08-19.
- Merge commit: `eaf0cb7503980e217f8078e6228cd57139be69e4`.
- The current repository contains the SELL calculator UI, deterministic calculation engine, calculation breakdown view, responsive interaction code, unit tests, and Playwright E2E harness.
- Pure calculation logic is separated under `lib/engine/`.
- Current engine files include `sell.ts`, `sell.test.ts`, `sell-bc-rules.ts`, `sell-calculator-form.ts`, and `currency.ts`.
- The 2026-09-11 Product Owner decision establishes the cross-product split: **AgentCal = Calculate; AgentConsult = Clarify & Decide.**
- No AgentCal engine migration into AgentConsult is required or authorized by the current direction.
- Repository guidance now points to the sole canonical Avenxa Command Protocol page and includes the full canonical command set.

## Changed

### Product responsibility

AgentCal is now explicitly the dedicated intelligent calculation platform for BC real-estate SELL / BUY / MOVE scenarios.

AgentCal owns:

- authoritative deterministic financial logic;
- explicit assumptions, rules, rounding, and calculation outputs;
- transparent breakdowns and calculation-focused scenario comparison;
- future BUY and MOVE calculation-engine work when separately authorized;
- AI explanation only when grounded in trusted deterministic results.

AgentConsult separately owns conversation-first consultation context, Advisor guidance, trade-offs, recommendation synthesis, and next actions.

### Repository guidance

- `AGENTS.md` now points to the current AgentCal Hub rather than the deleted legacy Hub.
- SELL Feature 01 is treated as completed Execution Truth, not active uncommitted work.
- `plans/features/01-sell-net-proceeds.md` is a completed reference, not an active implementation plan.
- There is no authorized BUY implementation plan yet.
- `AGENTS.md` now distinguishes the Avenxa Command Protocol from repository/package commands and routes fresh agents to the sole canonical semantic contract.
- This handoff now carries `Protocol State / Command` near the top as required by governance.

## Verified

Repository inspection on 2026-09-11 confirmed:

- `main` includes merge commit `eaf0cb7503980e217f8078e6228cd57139be69e4` for Feature 01 SELL.
- `lib/engine/` currently contains SELL calculation modules and tests; no `buy.ts` or `move.ts` exists on `main`.
- `app/` contains the SELL calculator experience and calculation-detail components.
- `e2e/` and Playwright configuration are present.
- repository verification commands include lint, typecheck, unit test, E2E, and build.
- the documentation branch `AGENTS.md` routes command semantics to the sole canonical Avenxa Command Protocol page.

Historical pre-merge verification recorded in the prior handoff included 26 unit tests passing, lint/typecheck/build passing, and 19 E2E tests passing. Those results are preserved as historical evidence; they were **not rerun during this documentation-only realignment**.

No product code changed in the 2026-09-11 documentation alignment, so no new runtime evidence is claimed.

## Open

1. **PR #4 merge gate.** The documentation alignment, including Command Protocol enforcement, remains on the focused branch until Product Owner approval and merge.
2. **Feature 02 sequencing gate.** Prior AgentCal Product Truth identified the Tier-2 export/share artifact as the remaining M1 dependency. The 2026-09-11 product split does not cancel it. Product Owner priority must explicitly determine whether Feature 02 is completed before BUY or deliberately reprioritized.
3. **BUY engine not implemented.** No `lib/engine/buy.ts` exists on current `main`.
4. **MOVE engine not implemented.** MOVE should follow verified BUY and compose verified SELL + BUY results rather than reimplementing them.
5. **No active BUY Technical Plan.** Do not start implementation until the sequencing gate is resolved and a bounded plan is created.
6. **Cross-product integration is deferred.** AgentCal ↔ AgentConsult should later use a small explicit versioned scenario/result contract only when both products have stable shapes and a bounded integration task is approved.
7. **Real-client disclaimer review remains relevant** where prior Product Truth required managing-broker / BC counsel review before real-client use; the product split does not silently remove that requirement.

## Next

**Current Human Gate: approve or reject PR #4 documentation realignment.**

After approval and merge, resolve the separate AgentCal feature-sequencing Human Gate: outstanding Feature 02 export/share versus the next BUY calculation-engine milestone.

After that sequencing decision:

- create a repository-ready Technical Plan for the selected next bounded feature;
- if BUY is selected, preserve the `lib/engine/` purity convention and define deterministic inputs/results/tests before UI expansion;
- run Build → Verify → Diagnose → Fix → Re-Verify;
- obtain independent review/runtime evidence where applicable;
- update this handoff before stopping.

Do not infer that the new product split itself authorizes skipping Feature 02, beginning BUY, or beginning MOVE.

## Stop / Escalation Conditions

Stop and escalate if:

- Product Truth and repository state materially conflict;
- work would alter authoritative formulas, rounding, jurisdiction, disclosures, or privacy boundaries without approval;
- work would blur the AgentCal / AgentConsult responsibility boundary;
- a feature implementation is requested before the current sequencing gate and bounded plan are resolved;
- a consequential merge/release or other Human gate is reached.
