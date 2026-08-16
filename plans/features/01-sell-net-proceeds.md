# Technical Plan — Feature 01: SELL Seller Net Proceeds

**Plan status:** Active repository plan; Feature 01 UI implementation is blocked by the current Product Truth interaction-direction gate.
**Product Spec:** https://app.notion.com/p/3b8eca0675e3815db467c68673ebeb05
**AgentCal Hub:** https://app.notion.com/p/3b6eca0675e38046b68ee8f1675ad0b9
**Process authority:** https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08

## Objective
Provide the repository-local implementation and verification plan for Feature 01 once its current interaction-direction gate is satisfied. Preserve the approved deterministic SELL calculation contract while making the repository agent-ready under ADS.

This file is Technical Plan / Execution Truth. It does not copy the Feature 01 Product Spec. Exact product behaviour, calculations, states, disclosures, UX acceptance, and product-level gates remain in Notion Product Truth.

## Current Repository Reality
Verified against `main` during ADS Step 4 inspection on 2026-08-16:

- Next.js App Router + React + TypeScript + Tailwind scaffold exists.
- `app/page.tsx` is still the default create-next-app screen; no SELL calculator UI is implemented on `main`.
- `package.json` currently provides `dev`, `build`, `start`, and `lint` scripts.
- TypeScript is configured with `strict: true`; typecheck can currently be run with `pnpm exec tsc --noEmit`.
- No automated test runner or E2E/UI harness is currently configured.
- `lucide-react` is not currently installed.
- M1 has no persistence/schema implementation and does not require Supabase.
- The former contents of this path were a stale copy of the Product Spec and old Dev SOP gate language; Git history preserves that material.

## Product Gate Before UI Build
Do **not** resume Feature 01 UI implementation until Product Truth confirms all of the following:

1. WT has selected/approved the revised consultation-first responsive interaction direction.
2. The affected Feature 01 UI/interaction sections have been updated and re-frozen as the active implementation reference.
3. Any consequential visual conflict between the current Brand Kit and older Feature 01 visual rules has been resolved in Product Truth.

The existing Feature 01 calculation contract and field contract remain valid unless Product Truth explicitly changes them.

## In Scope for the Next Implementation Cycle
After the product gate is satisfied:

1. Inspect the re-frozen Feature 01 Product Spec and current repository state.
2. Implement the pure deterministic SELL calculation module and structured result contract required by Product Truth.
3. Add the minimum automated verification harness needed to prove calculation, boundary, rounding, and relevant UI-state requirements.
4. Expose canonical repository scripts for the required verification contract.
5. Implement the approved SELL interaction/UI without introducing persistence or unapproved product behaviour.
6. Verify responsive/accessibility behaviour at the Product Spec acceptance boundaries.
7. Produce preview/runtime evidence where required by ADS.
8. Update `docs/HANDOFF.md` with actual implementation and verification state.

## Out of Scope
- BUY or MOVE implementation.
- Tier-2 export/share artifact implementation until its own product/design definition is approved.
- Supabase persistence, accounts, saved scenarios, CRM, analytics transmission of calculation inputs, or schema work.
- Additional jurisdictions, locale switching, generalized i18n, or generalized global rule infrastructure.
- AI-generated financial calculations or financial advice.
- Product-definition changes made inside the repository.

## Proposed Technical Approach
These are bounded technical intentions, not permission to begin the blocked UI build.

### 1. Calculation boundary
Create a pure side-effect-free calculation layer independent of React/UI. Use integer cents for monetary arithmetic and preserve the Product Spec's exact rounding and structured-result requirements. Keep jurisdiction-scoped rule data separate from locale/presentation concerns.

### 2. Presentation boundary
The UI consumes structured calculation output and formats it for the configured locale. Locale must not affect deterministic cents. Do not persist or transmit Feature 01 inputs.

### 3. Verification harness
Before Feature 01 can be considered implementation-complete, configure a minimal automated test runner appropriate to the existing TypeScript/Next.js stack and expose it through `package.json`. Framework/package selection is a reversible implementation detail unless it creates material cost, architecture, security, or maintenance consequences; inspect current ecosystem compatibility before choosing.

Required executable contract after the harness is added:

- install/bootstrap
- lint
- typecheck
- automated tests
- build
- additional browser/UI verification if required to prove responsive/accessibility behaviour

Do not document a command as passing until it exists and has actually run successfully.

### 4. Dependency discipline
Inspect `package.json` and lockfile before adding any dependency. `lucide-react` may be added only if it remains part of the re-frozen approved UI definition; do not install it during this remediation-only step.

## Product Acceptance Mapping
Implementation must ultimately satisfy the current Feature 01 Product Spec, including:

- deterministic repeated results and the frozen reference calculation;
- exact integer-cent/round-half-up behaviour;
- CA-BC jurisdiction boundary with locale-independent calculation cents;
- visible/editable material assumptions and required warning/error/negative states;
- session-only privacy constraint;
- accessibility and responsive acceptance;
- at least 10 frozen engine scenarios covering the Product Spec's stated calculation boundaries;
- repository verification contract passing before implementation handoff.

If Product Truth changes during the interaction redesign, update this mapping before coding the affected behaviour.

## Verification Plan
### For this ADS remediation change
No product code or dependency changes are in scope. Verify by repository inspection that:

- `AGENTS.md` routes development to ADS and correctly separates Product Truth from Execution Truth;
- this file is a bounded Technical Plan rather than a Product Spec duplicate;
- `docs/HANDOFF.md` exists and identifies the current blocker/next action;
- no application code, dependency, or package script was changed by the remediation.

### For the later Feature 01 implementation
The coding agent must define and run exact canonical commands in this repository. At minimum the final contract must cover lint, typecheck, automated tests, and build, plus browser/UI evidence required by the Product Spec and ADS. Record actual command results in `docs/HANDOFF.md` and PR/CI evidence, not in Notion.

## Risks and Dependencies
- **Current blocker:** product interaction direction is still under re-evaluation; implementing the old UI now risks avoidable rework and Product Truth conflict.
- **Verification gap:** no automated test runner is configured yet; this must be resolved before calculation implementation can be accepted.
- **Design dependency:** older Feature 01 visual rules may conflict with AgentCal Brand Kit v1.0; Product Truth must resolve the affected direction before UI build.
- **M1 dependency:** Tier-2 export/share artifact remains separately required before M1 can close; it is not silently part of this Technical Plan.
- **Compliance gate:** required managing-broker / BC counsel review remains a Product Truth gate before real-client use.

## Human Gates
Escalate to WT before:

- resuming UI implementation without the re-frozen interaction definition;
- changing product scope, formulas, rounding, disclosures, acceptance intent, privacy/data handling, or jurisdiction/locale product boundaries;
- consequential architecture/security/privacy/compliance choices;
- adding a paid/material external service;
- destructive or production-sensitive action;
- final product acceptance / merge or release when required by ADS.

Routine reversible implementation mechanics within an approved, re-frozen boundary may be decided by the coding agent and verified.

## Next Bounded Technical Action
**Do not code Feature 01 yet.** After the Product Truth interaction-direction gate is closed, a fresh Planning/Coding AI should re-read `AGENTS.md`, this Technical Plan, `docs/HANDOFF.md`, the re-frozen Feature 01 Product Spec, and actual repository state; then update this plan only where the approved direction changes the implementation approach or verification needs.