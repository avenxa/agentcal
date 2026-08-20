# Technical Plan — Feature 02: Tier-2 Estimate Export & Share Artifact

**Plan status:** Implemented on `feature/02-tier2-export-share` (from `main` at `eaf0cb7`). Pending independent review. Opened following build approval on 2026-08-19.
**Product Spec:** https://app.notion.com/p/3c1eca0675e3819ab595d10748eb25e4
**AgentCal Hub:** https://app.notion.com/p/3b6eca0675e38046b68ee8f1675ad0b9
**Process authority:** https://app.notion.com/p/3beeca0675e38138a6e1de3f51d15f08
**Build-approval Decision Log:** https://app.notion.com/p/3c2eca0675e38191ba90c01933ebc819
**Feature 01 spec (source of the consumed result contract, §15):** https://app.notion.com/p/3b8eca0675e3815db467c68673ebeb05

## Objective
Implement and verify Feature 02 against the build-approved Product Truth: a client-side-only Estimate Summary artifact that renders the current `SellerNetProceedsResult` as a timestamped, disclosure-complete document the agent can print/save-as-PDF or hand off via email, with no new persistence, no new calculation path, and no client contact-information collection.

This file is Technical Plan / Execution Truth. Exact product behaviour, copy, disclosure structure, and human gates remain in Notion Product Truth (§1–§13 of the spec above).

## Current Repository Reality
Checked on 2026-08-19/20 directly against `origin/main`:

- `origin/main` HEAD is `eaf0cb7` (merge of PR #3, `feature/01-sell-net-proceeds-v2`) — matches the Hub's record of Feature 01 being merged and WT-accepted.
- Stack confirmed: Next.js 16.3.0, React 19.2.8, TypeScript, Tailwind (`@tailwindcss/postcss` ^4), pnpm. Canonical scripts: `dev`, `build`, `start`, `lint`, `type-check`, `test` (`node --test lib/engine/sell.test.ts`), `test:e2e` (Playwright).
- `app/` is currently a single screen: `app/page.tsx` renders only `<SellerNetProceeds />`. There is no second route yet — Feature 02's artifact view will be the first additional presentation surface in `app/`.
- `lib/engine/sell.ts` exports `SellerNetProceedsResult` exactly as described in spec §10: `ruleVersion`, `jurisdiction`, `commissionMode`, `inputs`, per-line cents fields, `estimatedNetProceedsCents`, `optionalPlanningTotalCents`, `estimatedAfterPlanningCents`. Cents are stored as `number`, not `bigint` (documented in-code as a deliberate serialization choice, safe under Feature 01's field maximum). Nothing here needs to change for Feature 02.
- `lib/sell-copy.ts` already defines all seven constants §4a's narration templates require verbatim: `TIER1_DISCLAIMER`, `TAX_EXCLUSION_NOTE`, `COMMISSION_PRESET_LABEL`, `COMMISSION_PRESET_FORMULA`, `COMMISSION_NEGOTIABLE_NOTICE`, `MORTGAGE_WARNING`, `NEGATIVE_RESULT_NOTE`. No new copy constants need to be invented for the base narration text.
- `app/view-calculation.tsx` (203 lines) is the existing exact-cent breakdown component. Feature 02 must reuse its data path, not re-derive the breakdown.
- No `localStorage`/`sessionStorage` usage exists anywhere in the codebase today. The "Prepared by" field will be the first browser-storage usage in this repo.
- No PDF-generation dependency is installed, consistent with spec §5's "no PDF-generation library" requirement — nothing to remove, nothing extra to justify not adding.
- `plans/features/02-tier2-export-share.md` does not exist yet (confirmed via directory listing) — this file is that plan.
- `docs/HANDOFF.md` is stale: it still describes the pre-merge `lib/engine/` relocation cycle on `feature/01-sell-net-proceeds-v2`, not the Feature 01 merge/acceptance or the Feature 02 build-approval. Refreshing it is part of this cycle's Definition of Done, not a separate task.

## Product Contract Now Active
Spec §3–§13 require, in summary:

- A dedicated Estimate Summary view rendered from the current `SellerNetProceedsResult` only — no recalculation anywhere in this feature.
- Generation timestamp, rule version, and jurisdiction shown, sourced from the structured result at render time.
- Full Tier 3 assumption list (reuses `view-calculation.tsx`'s existing data), Tier 1 short disclaimer, Tier 2 full disclaimer (agent/brokerage name, date, assumptions summary, referral to mortgage broker/lender, lawyer/notary, accountant), and the tax-exclusion note.
- A fixed-template **Result narration** (§4a) built only from data substitution into four deterministic variants (standard, with optional planning costs, mortgage-payout warning, negative result) — no runtime AI text generation of any kind.
- Print delivery via the browser's native print dialog only, with a dedicated print stylesheet showing no app chrome, navigation, or interactive controls (AC-06).
- Email handoff as editable text before sending: primary path is copy-to-clipboard (narration + Tier 2 block) with a prompt to paste into the agent's own mail client; secondary optional path is a `mailto:` link with a shorter plain-text summary. No client email address is ever requested or stored.
- A single editable "Prepared by" free-text field, persisted in `localStorage` on the current device only, prefilled on return visits, always editable, user-clearable.
- Export/print/email actions disabled whenever there is no valid result (mirrors Feature 01's existing blocking-error disable pattern).
- Brand Kit v1.0 visual tokens, unbranded (no agent logo/custom colors — that's the reserved Charter §10 post-MVP extension).
- Same accessibility baseline as Feature 01 §13, plus an accessible label and independent keyboard reachability for the editable email-content text area.

## In Scope for the Next Implementation Cycle
1. Re-read `AGENTS.md`, this Technical Plan, the refreshed `docs/HANDOFF.md`, the Feature 02 Product Spec, and current repository files before editing.
2. Implement a deterministic, pure Result-narration composer covering all four §4a template variants, built only from `SellerNetProceedsResult` fields and the existing `lib/sell-copy.ts` constants.
3. Implement the Estimate Summary artifact view in `app/`, consuming the existing engine result and the existing `view-calculation.tsx` breakdown data without introducing a second calculation path.
4. Implement a dedicated print stylesheet and the native-print "Print / Save as PDF" trigger.
5. Implement the copy-to-clipboard primary email-handoff path and the optional `mailto:` secondary path, both editable before send.
6. Implement the device-local "Prepared by" field via `localStorage`, prefilled/editable/clearable.
7. Wire the disabled state for export/print/email actions to the existing blocking-error condition already implemented for Feature 01.
8. Extend the automated test harness: narration-variant unit tests (AC-13/AC-14, including the mortgage-warning/negative-result boundary) and Playwright coverage for print-preview emulation, clipboard/email affordances, Prepared-by persistence, and the Feature 01 breakpoints (320/390/768/834/1280/1366px) applied to the on-screen artifact view.
9. Produce real-browser print-preview evidence for AC-06 specifically — do not rely on the accepted mockup as a substitute; the Decision Log explicitly flags that the mockup round needed a second pass to get this right.
10. Update `docs/HANDOFF.md` with actual implementation, verification, and open-risk state, replacing the stale pre-merge content.

## Out of Scope
- Any change to Feature 01's SELL calculator screen, calculation engine, or `SellerNetProceedsResult` type.
- BUY or MOVE implementation.
- A hosted/shareable web link to the estimate (would require persisting or transmitting calculation inputs — conflicts with the M1 no-persistence boundary).
- App-side email sending, SMTP/email-service integration, or collection of any client contact information.
- Any account, login, or profile system.
- Branded delivery (agent/brokerage logo, custom colors) — reserved Charter §10 post-MVP extension.
- Runtime AI-generated narration text of any kind, or any LLM call at runtime to compose or vary artifact copy.
- Capital gains tax, BC home-flipping tax, or any tax calculation.
- Finalizing Tier 2 disclaimer or narration wording as legally sufficient — that remains pending managing-broker/BC counsel review per Charter §15.

## Proposed Technical Approach

### 1. Result-narration module
A small, pure module (e.g. `lib/sell-narration.ts` — naming is a reversible implementation detail) that takes a `SellerNetProceedsResult` and returns the §4a narration string. It selects among the four template variants by branching on `estimatedNetProceedsCents` sign, presence of `optionalPlanningTotalCents`, and any mortgage-payout warning condition already defined for Feature 01's UI. It formats money using the existing `lib/engine/currency.ts` formatters — no new rounding or formatting logic. This module composes UI copy from data, not financial calculation, so it does not need to live under `lib/engine/`, but it must not import anything that recalculates cents.

### 2. Artifact presentation boundary
A new `app/` component (e.g. `app/estimate-summary.tsx`) renders the artifact from the same in-memory result `seller-net-proceeds.tsx` already holds — passed down, not refetched or recomputed. It reuses `view-calculation.tsx`'s existing breakdown data/formatting rather than re-deriving it, consistent with spec §10.

### 3. Print delivery
A dedicated print stylesheet (CSS `@media print`) hides interactive controls, navigation, and app chrome, leaving a single-column, plain artifact flow. The trigger calls the browser's native `window.print()` — no new dependency, no server round-trip. Verification must include actual print-preview rendering (Playwright's print-media emulation or an equivalent real-browser check), not visual inspection of the on-screen layout alone.

### 4. Email handoff
Primary path: a "Copy to clipboard" action (Clipboard API, triggered by a user gesture so no permission-prompt friction) that copies the §4a narration followed by the Tier 2 disclosure block, paired with a visible "paste into your email" affordance. Secondary optional path: a `mailto:` link pre-filled with a shorter plain-text summary. Both remain editable by the agent before sending — for the clipboard path this means pasting into any editable field (e.g. their mail client); the artifact itself does not need an in-app editable staging area unless implementation surfaces a concrete reason to add one.

### 5. Agent/brokerage identity
A single free-text "Prepared by" field reads/writes `localStorage` directly (first use of browser storage in this codebase) — device-local only, never sent anywhere, always editable, user-clearable. Treated as UI state, not calculation input; it must not be added to `SellerNetProceedsResult`.

### 6. States
Export/print/email actions bind to the same blocking-error condition Feature 01 already uses to disable View calculation. If the agent edits inputs after generating the artifact, the artifact must re-render from the current result rather than showing stale data — this likely falls out naturally from passing the live result object down as a prop rather than snapshotting it, but should be verified explicitly.

### 7. Verification harness extension
Extend the existing Node test runner with narration-variant tests and extend the existing Playwright suite with print-preview, clipboard, and Prepared-by-persistence coverage. No new test framework needed.

### 8. Dependency discipline
No new dependency is currently expected — clipboard, `mailto:`, `localStorage`, and `window.print()` are native browser APIs. If implementation surfaces a genuine need (e.g. a clipboard polyfill for a specific target browser), evaluate against `package.json`/lockfile first per the existing dependency-discipline rule in `AGENTS.md`.

## Product Acceptance Mapping
Implementation must satisfy Feature 02 spec §13 in full:

- AC-01–AC-03: artifact renders only from a currently valid result; no independent recalculation; every value reconciles to its exact-cent source with rounding differences explained inline.
- AC-04–AC-05: Tier 1/Tier 2 disclaimers, referral disclosure, tax-exclusion note, timestamp, rule version, and jurisdiction all present and matching the result.
- AC-06: clean single-flow print output with no app chrome or interactive controls, verified via actual browser print preview.
- AC-07–AC-08: editable email content with no client-email collection; "Prepared by" persists via `localStorage` only, editable and clearable.
- AC-09–AC-10: export/print/email disabled on blocking error; no calculation input or client identity persisted/transmitted anywhere.
- AC-11–AC-12: no clipping/horizontal scrolling at 320/390/768/834/1280/1366px for the on-screen view, legible print output; full keyboard/focus/accessible-name coverage for all new interactive elements.
- AC-13–AC-14: narration text matches §4a exactly per state, with automated tests covering all four variants and the mortgage-warning/negative-result boundary.

## Verification Plan
Before implementation handoff, run and record exact commands/results for:

1. lint;
2. typecheck;
3. automated tests — existing SELL engine suite plus new narration-variant tests;
4. production build;
5. browser/runtime checks at the required responsive widths for the on-screen artifact view;
6. real-browser print-preview verification specifically for AC-06;
7. clipboard-copy and `mailto:` affordance checks;
8. `localStorage` persistence/clear behaviour for "Prepared by" across reloads;
9. manual accessibility checks for the print trigger, copy-to-clipboard control, email content editor, and Prepared-by field — keyboard reachability, visible focus, accessible names, 44×44px targets, WCAG AA contrast.

Do not claim a command passed until it exists and has actually run successfully.

## Risks and Dependencies
- **AC-06 is the single highest-attention item.** Both the Product Spec (§15) and the build-approval Decision Log explicitly flag that the ChatGPT mockup round got this wrong on the first pass and needed a targeted second pass — treat that as a signal to verify Cursor's actual CSS print-stylesheet directly against real browser print preview, not by analogy to the accepted mockup image.
- **Clipboard API support/permissions** is a normal implementation-level browser-compatibility risk; mitigate with the `mailto:` fallback already required by spec §5, not a new dependency.
- **Compliance gate unchanged:** Tier 2 disclaimer wording and the §4a narration wording remain pending managing-broker/BC counsel review (Charter §15) — implement exactly as currently specced, but this Plan does not finalize that wording as legally sufficient.
- **`docs/HANDOFF.md` refresh is part of this cycle**, not deferred — it is currently describing a superseded pre-merge state.
- **M1 closure dependency:** this feature is the sole remaining M1 dependency per the Hub; M1 does not close until it is implemented, deployed, and production-verified.

## Human Gates
Escalate to WT before:

- changing Tier 1/Tier 2 disclosure wording, the §4a narration template wording, the referral-disclosure content, or any content locked by the build-approval Decision Log;
- adding any new persistence beyond the device-local "Prepared by" field, or any transmission of calculation data;
- adding app-side email sending or any hosted/shareable link mechanism;
- introducing branded delivery (logo/custom colors);
- adding a paid/material external service or PDF-generation dependency;
- final product acceptance / merge or release when required by ADS.

Routine reversible implementation mechanics within the approved boundary — component naming, internal module structure, clipboard-vs-mailto UX balance within the spec's stated boundaries — may be decided and verified by the coding agent without repeated approval.

## Next Bounded Technical Action
Hand control to Claude for independent review of the Feature 02 implementation on `feature/02-tier2-export-share` at `C:\dev\agentcal`. Do not broaden into BUY, MOVE, hosted sharing, app-side email sending, or branded delivery.
