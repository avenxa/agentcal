# Technical Plan — Feature 01: SELL Seller Net Proceeds

**Plan status:** Active repository plan. Feature 01 calculation engine, Guided Topic Rail UI, and executable verification harness are implemented on `feature/01-sell-net-proceeds-v2` pending independent review. Product Truth UI/interaction contract remains the 2026-08-16 re-freeze.
**Product Spec:** https://app.notion.com/p/3b8eca0675e3815db467c68673ebeb05
**AgentCal Hub:** https://app.notion.com/p/3b6eca0675e38046b68ee8f1675ad0b9
**Process authority:** https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
**Accepted Figma reference:** https://www.figma.com/design/hafKuvVyF6DbhPBhj7bEDb

## Objective
Implement and verify Feature 01 against the re-frozen Product Truth: deterministic SELL calculations plus the approved consultation-first **Guided Topic Rail with Living Statement elements** across phone, tablet, and laptop/desktop.

This file is Technical Plan / Execution Truth. Exact product behaviour, formulas, disclosures, interaction rules, visual acceptance, and human gates remain in Notion Product Truth.

## Current Repository Reality
Re-checked on 2026-08-17 during the `feature/01-sell-net-proceeds-v2` implementation cycle:

- Next.js App Router + React + TypeScript + Tailwind remain the stack.
- Feature 01 SELL UI is implemented on `feature/01-sell-net-proceeds-v2` (not yet on `main`).
- The Estimated Net Proceeds region is a single `ResultBlock` instance. Below 1280px the editing region precedes it in DOM order and the result is a collapsible sticky bottom summary; at 1280px+ CSS Grid `grid-template-areas` still places the same node in the sticky right column.
- Canonical scripts: `dev`, `build`, `start`, `lint`, `type-check`, `test`, `test:e2e`.
- Calculation tests use Node's built-in test runner; browser checks use Playwright.
- `lucide-react` is not installed; inline SVG is used for Back/disclosure only.
- M1 has no persistence/schema implementation and does not require Supabase.
- Local `feature/01-sell-net-proceeds` is left untouched as a salvage/reference branch.

## Product Contract Now Active
The former UI gate is closed. The active Product Truth now requires:

- consultation-first, mobile-first, responsively adaptive, guided-but-non-linear interaction;
- topic navigation for **Price**, **Mortgage**, **Selling costs**, and **Planning**, with current value/state visible in topic summaries;
- immediate recalculation without a Calculate button;
- compact result context on phone/tablet that does not obscure editing;
- a persistent Living Statement/result region on laptop/desktop;
- AgentCal Brand Kit v1.0 visual language: Inter, Deep Teal, warm neutrals, restrained semantic accents, progressive disclosure, and generous whitespace;
- tablet/laptop breathing room as defined in Product Truth, including the approved spacing refinement;
- superseded v3.3 Geist/navy/gold presentation rules must not be revived.

The existing Feature 01 functional scope, calculation contract, field contract, privacy boundary, jurisdiction/locale boundary, and structured-result contract remain valid.

## In Scope for the Next Implementation Cycle
1. Re-read `AGENTS.md`, this Technical Plan, `docs/HANDOFF.md`, the re-frozen Feature 01 Product Spec, and current repository files before editing.
2. Configure the minimum executable automated verification harness needed for calculation, boundary, rounding, and relevant UI-state coverage.
3. Expose canonical repository scripts for the resulting verification contract.
4. Implement the pure deterministic SELL calculation module and structured result contract.
5. Implement the approved Guided Topic Rail / Living Statement UI using the existing Next.js/React/TypeScript/Tailwind stack.
6. Add only dependencies that are actually required by the re-frozen UI and compatible with current repository versions.
7. Verify responsive and accessibility behaviour at Product Spec acceptance boundaries, including 320/390 phone widths, 768/834 tablet, and 1280/1366 laptop/desktop.
8. Produce runtime/preview evidence for the consequential user-facing states and spacing behaviour.
9. Update `docs/HANDOFF.md` with actual implementation, verification, and open-risk state.

## Out of Scope
- BUY or MOVE implementation.
- Tier-2 export/share artifact implementation until its own product/design definition is approved.
- Supabase persistence, accounts, saved scenarios, CRM, analytics transmission of calculation inputs, or schema work.
- Additional jurisdictions, locale switching, generalized i18n, or generalized global rule infrastructure.
- AI-generated financial calculations or financial advice.
- Product-definition changes made inside the repository.

## Proposed Technical Approach
### 1. Calculation boundary
Create a pure side-effect-free calculation layer independent of React/UI. Use integer cents for monetary arithmetic and preserve Product Truth rounding and structured-result requirements. Keep jurisdiction-scoped rule data separate from locale/presentation concerns.

### 2. Presentation boundary
The UI consumes structured calculation output and formats it for the configured locale. Locale must not affect deterministic cents. Feature 01 inputs must remain session-only and must not be persisted or transmitted.

### 3. Interaction structure
Implement one coherent interaction model across breakpoints:

- **Phone:** single-column consultation flow, compact topic rail, active-topic workspace, result context that never obscures keyboard/input/error state.
- **Tablet:** same topic model with more simultaneous context, generous outer padding and panel spacing, no dense edge-to-edge calculator layout.
- **Laptop/desktop:** topic/editing region plus persistent Living Statement/result region; preserve the same reading order and direct non-linear topic access.

Topic summaries must expose meaningful values/states, not labels alone. Core assumptions must remain visible in the active topic, topic summary, persistent statement where applicable, or one explicit user-controlled disclosure away.

### 4. Visual implementation
Use Brand Kit v1.0 as the visual authority. Do not carry forward superseded v3.3 Geist/navy/gold rules. Prefer existing Tailwind/CSS primitives over adding a component framework. Small breakpoint-safe spacing adjustments are allowed only if they preserve the Product Spec's breathing-room intent.

### 5. Verification harness
Configure a minimal automated test runner compatible with the existing TypeScript/Next.js stack. Framework/package selection is a reversible implementation detail unless it creates material cost, architecture, security, or maintenance consequences.

The final executable contract must cover:

- install/bootstrap;
- lint;
- typecheck;
- automated unit/logic tests;
- build;
- browser/UI verification sufficient to prove responsive/accessibility behaviour.

Do not claim a command passed until it exists and has actually run successfully.

### 6. Dependency discipline
Inspect `package.json` and lockfile before adding dependencies. `lucide-react` is not currently installed and is no longer a Product Truth requirement for the Planning topic; add it only if the implementation genuinely needs it and the choice remains within routine reversible implementation authority.

## Product Acceptance Mapping
Implementation must satisfy the current Feature 01 Product Spec, including:

- deterministic repeated results and the frozen reference calculation;
- exact integer-cent / round-half-up behaviour;
- CA-BC jurisdiction boundary with locale-independent calculation cents;
- topic summaries and non-linear navigation for Price / Mortgage / Selling costs / Planning;
- visible/editable material assumptions and required empty/warning/error/negative states;
- session-only privacy constraint;
- responsive breathing-room requirements, especially tablet and laptop/desktop;
- persistent Living Statement/result behaviour on laptop/desktop;
- accessibility and focus-order requirements;
- at least 10 frozen engine scenarios covering the Product Spec calculation boundaries;
- repository verification contract passing before implementation handoff.

## Verification Plan
Before implementation handoff, run and record exact commands/results for:

1. dependency/bootstrap install;
2. lint;
3. typecheck;
4. automated calculation and UI-state tests;
5. production build;
6. browser/runtime checks at the required responsive widths;
7. manual accessibility checks for keyboard operation, focus visibility/return, accessible names, error associations, and topic expand/collapse semantics.

Runtime evidence must specifically confirm:
- phone input is not covered by result context or keyboard-safe-area behaviour;
- tablet maintains the approved generous outer padding and panel separation;
- laptop/desktop preserves a comfortable gutter between editing and Living Statement regions and does not crowd material assumptions;
- no page-level horizontal scrolling at required widths;
- empty, populated, blocking error, mortgage warning, negative proceeds, and Planning collapsed/expanded states are coherent.

The accepted Figma spacing refinement was written successfully, but a final laptop screenshot re-check was not available in the design session because the Figma Starter MCP limit was reached. Treat runtime/browser verification at 1366px as the required final evidence, not as a reason to alter Product Truth silently.

## Risks and Dependencies
- **Verification gap:** calculation and Playwright responsive checks now exist on `feature/01-sell-net-proceeds-v2`; independent review and WT product acceptance remain.
- **Runtime evidence gap:** Playwright recorded 320/390/768/834/1280/1366 behaviour; a human visual pass of the live UI is still useful before product acceptance.
- **M1 dependency:** Tier-2 export/share artifact remains separately required before M1 can close and is not part of this Technical Plan.
- **Compliance gate:** required managing-broker / BC counsel review remains a Product Truth gate before real-client use.

## Human Gates
Escalate to WT before:

- changing product scope, formulas, rounding, disclosures, acceptance intent, privacy/data handling, jurisdiction/locale boundaries, interaction direction, or consequential visual hierarchy;
- materially reducing the approved tablet/laptop breathing-room intent rather than making a breakpoint-safe implementation adjustment;
- consequential architecture/security/privacy/compliance choices;
- adding a paid/material external service;
- destructive or production-sensitive action;
- final product acceptance / merge or release when required by ADS.

Routine reversible implementation mechanics within the approved boundary may be decided and verified by the coding agent.

## Next Bounded Technical Action
Independent review of `feature/01-sell-net-proceeds-v2` (diff + verification evidence), then WT product acceptance. Do not merge, and do not broaden into Tier-2 export/share, BUY, MOVE, persistence, or other jurisdictions.