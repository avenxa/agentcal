# Feature 03 — SELL Scenario Foundation v1

## Protocol State

**AI READY / BUILDER EXECUTION AUTHORIZED — ADS vNext migrated 2026-10-05**

The prior Builder Dispatch approval remains valid. Under ADS vNext, routine Builder dispatch is not itself a Human Gate; this bounded task is already READY.

Implement this bounded task on:

`feature/03-sell-scenario-foundation-v1`

Base commit:

`145b6b339b3d5fbeaf89f7d1fb3509ef28b36c55`

Do not merge to `main` without the later ADS release/merge gate.

## Builder Role

You are the Builder for this task. Follow `CLAUDE.md` → `AGENTS.md`, current `docs/HANDOFF.md`, Product Truth, approved Figma Design Truth, and the Technical Definition.

Do not redesign the product, broaden scope, or change authoritative financial rules.

## Product Truth

- AgentCal Hub: https://app.notion.com/p/3d8eca0675e3811fa497d5455cdd341e
- Design Definition: https://app.notion.com/p/3f0eca0675e3818ea370de8257f8523e
- User Flow / IA: https://app.notion.com/p/3f0eca0675e3810abbfbd12dcd4db1bc
- Technical Definition: https://app.notion.com/p/3f0eca0675e3813e97a9dcda4d955f24
- Figma Design Truth: https://www.figma.com/design/5MQ4tslEDHs26UTTbV0JBg

Required Figma frames:
- Mobile Scenario Entry: `9:2`
- Desktop Scenario Entry: `9:31`
- Mobile Build: `3:3`
- Mobile Results: `3:48`
- Desktop Build: `3:84`
- Desktop Results: `3:139`

## Objective

Implement:

**Scenario Entry → New/Open SELL Scenario → Build → Results → Adjust → Deterministic Recalculate → Save → Reopen**

while preserving the accepted Feature 01 SELL calculation engine.

## Non-negotiable calculation boundary

- `lib/engine/sell.ts` remains authoritative.
- Preserve formulas, cents, half-up rounding, BC commission rules, GST logic, warnings, money bounds, result meanings, and jurisdiction behavior.
- UI and persistence code must not duplicate financial formulas.
- AI must not generate or alter authoritative financial amounts.
- Selling Price is the only current calculation-blocking positive-value input.
- Mortgage payout is a key input, but `$0` is valid and must not block calculation.

If implementation appears to require changing financial methodology, STOP and return to AI PM.

## Persistence decision

Use browser-local `localStorage` for v1 behind a replaceable adapter.

Recommended storage key:

`agentcal.sell-scenarios.v1`

Do not introduce:
- Supabase;
- authentication;
- API routes;
- database;
- cloud sync;
- cross-device promises.

Read malformed storage defensively; do not crash or silently erase unknown/corrupt records.

## Scenario contract

Create a versioned SELL Scenario model separate from the engine.

Required data:
- `schemaVersion: 1`
- unique `id`
- `type: "SELL"`
- editable `name`
- `jurisdiction: "CA-BC"`
- `locale: "en-CA"`
- exact `ruleVersion`
- `formValues`
- `commissionMode`
- deterministic readiness/review metadata
- saved result snapshot or null for Draft
- created / updated / saved timestamps

Do not persist derived display state when it can be derived.

Default name:
`Sell Scenario — YYYY-MM-DD`

No property-address field is added in this slice.

Duplicate:
- new id;
- copy inputs/mode/review state;
- new timestamps;
- `Copy of [name]`;
- unsaved until explicitly saved.

## Lifecycle

Derive:
- Draft — no valid result.
- Calculated — valid result but never saved.
- Saved — current state equals last saved snapshot.
- Updated — saved Scenario has unsaved changes.

No delete/archive/client/transaction/approval statuses.

## Readiness

Readiness is not calculation validity and never blocks a result.

Use five deterministic review groups:
1. Selling Price — valid.
2. Mortgage — reviewed/interacted and no error; zero valid.
3. Commission — current mode valid; BC preset is accepted default.
4. Selling Costs — reviewed/opened and no errors.
5. Planning Costs — reviewed/opened and no errors.

Display `X of 5 key assumptions confirmed`.

Do not imply legal/professional certainty.

## Existing SELL coverage to preserve

All accepted inputs remain reachable:
- selling price;
- mortgage payout;
- BC preset/manual commission;
- GST on commission;
- legal/notary;
- mortgage discharge;
- prepayment penalty;
- property-tax adjustment;
- other closing adjustments;
- staging;
- repairs;
- inspection/appraisal;
- cleaning;
- moving/storage;
- overlap/temporary housing;
- other planning costs.

Also preserve:
- negative-result state;
- mortgage warning;
- Tier-1 disclaimer;
- tax-exclusion notice;
- currency parsing/formatting;
- keyboard/focus behavior.

Do not remove functionality merely because Figma uses progressive disclosure.

## Recommended implementation boundaries

Suggested files:
- `app/sell-scenario-app.tsx`
- `app/sell-scenario-editor.tsx`
- `app/sell-build-panel.tsx`
- `app/sell-results-panel.tsx`
- `lib/scenarios/sell-scenario.ts`
- `lib/scenarios/sell-scenario-storage.ts`

Reuse:
- `app/currency-field.tsx`
- `lib/engine/sell.ts`
- `lib/engine/sell-calculator-form.ts`
- `lib/engine/sell-bc-rules.ts`
- existing CSS tokens in `app/globals.css`.

Exact filenames may vary if repository conventions clearly justify it, but responsibility boundaries must remain.

Do not add a competing styling system.

## Results / provenance

Hero Result:
**Estimated Net Proceeds**

Expose:
- key deductions;
- optional planning effect when applicable;
- assumptions/detail;
- jurisdiction `CA-BC`;
- exact `SELL_RULE_VERSION`;
- save/recalculation timestamp context;
- accepted caveats.

The exact rule version must remain inspectable.

## Required verification

Run and report:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
pnpm test:e2e
```

Add unit coverage for:
- scenario defaults/create;
- duplicate;
- dirty/save-state derivation;
- readiness;
- serialization/parse guards;
- storage sorting;
- ruleVersion/result snapshot preservation;
- malformed localStorage behavior.

Playwright/runtime must cover:
1. Entry → New Scenario.
2. Draft Build.
3. Selling price returns same accepted deterministic result.
4. Mortgage edit recalculates.
5. Invalid current input removes authoritative result.
6. Build ↔ Results preserves in-session edits.
7. Save → Entry → reopen restores Scenario.
8. Draft save/reopen.
9. Duplicate.
10. Mortgage warning.
11. Negative proceeds.
12. Existing commission/manual/selling/planning inputs remain reachable.
13. Responsive widths: 320 / 390 / 768 / 834 / 1280 / 1366.
14. No horizontal overflow.
15. Keyboard/focus behavior.
16. Representative Figma comparison for Entry / Build / Results.
17. No browser console/runtime errors in tested flows.

## Builder workflow

Use **Build → Test → Diagnose → Fix / self-correct → Re-test / Re-verify** until the bounded candidate satisfies required checks or a true blocker remains.

1. Read all authority sources.
2. Inspect current code before editing.
3. Implement only this bounded slice.
4. Run required verification.
5. Self-correct until checks pass or a true blocker remains.
6. Update `docs/HANDOFF.md` with:
   - actual changed files;
   - branch/head SHA;
   - verification commands/results;
   - runtime/visual evidence;
   - residual risks;
   - ONE NEXT ACTION.
7. Commit and push to this feature branch.
8. Open a PR to `main` only when implementation + verification are complete.
9. Do not merge the PR.
10. Return control to AI PM for independent review.

## Stop conditions

STOP only the affected path rather than improvise if you need to:
- change financial formulas, rounding, BC rule authority or disclosures;
- change approved primary flow / IA;
- add backend/auth/cloud persistence;
- drop accepted SELL input coverage;
- add BUY / MOVE / AI / CRM / Share / Report;
- merge Feature 02;
- implement another jurisdiction;
- perform destructive production actions;
- cross a protected real-data / merge / release / Production boundary without the applicable authorization.

A login, credential, tool-permission or account-connection problem is **WAITING — ACCESS**, not a Human Gate. Continue other authorized work where safe.

## Completion signal

When ready for independent review, report:

**Code Complete — Feature 03 SELL Scenario Foundation v1**

Include:
- branch + head SHA;
- PR URL if opened;
- concise diff summary;
- verification results;
- preview URL if available;
- known residual risks.
