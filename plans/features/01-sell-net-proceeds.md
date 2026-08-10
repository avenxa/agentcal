git# Feature 01 — SELL: Seller Net Proceeds Calculator Specification v1.0

**Status:** Approved by WT (2026-08-09)
**Approved design:** v3.3 with approved Optional planning costs refinement
**Current gate:** No Build until WT separately grants Build approval, which must explicitly include the `lucide-react` dependency (see §17)
**Canonical location:** `plans/features/01-sell-net-proceeds.md`

> This specification covers the SELL calculator screen and its on-screen calculation breakdown only. Charter §8 and §15 also require an exportable/shareable Tier-2 estimate artifact before M1 can close. That artifact has not received a design-direction pass and is a separate M1 dependency — not part of this feature.

## 1. Authority and evidence

- Product authority: AgentCal Charter v1.0, especially §4.1, §5, §6, §8, §13 and §15.
- Approved direction: SELL (M1) final calculator UI direction v3.3 (Decision Log).
- Process authority: Avenxa Dev SOP.
- BC selling-cost categories and GST treatment: BCFSA — What Costs Come with Selling a Home (accessed 2026-08-09).
- Commission negotiability and total-brokerage framing: BCFSA — Consumer Guide to Disclosures (accessed 2026-08-09).
- Additional planning-cost categories: Financial Consumer Agency of Canada — Selling a home (accessed 2026-08-09).
- BC GST reference: CRA — GST/HST calculator and rates (accessed 2026-08-09).
- Generic proceeds formula reference: Rates.ca — Home Sale Proceeds Calculator (accessed 2026-08-09); user-provided PDF snapshot updated 2026-06-11.

## 2. Product outcome

A BC real estate agent can enter or revise seller assumptions during a mobile consultation and immediately see a deterministic Estimated Net Proceeds result, with every material assumption visible, editable and explainable.

**Primary user story:** As a BC real estate agent, I want to adjust a seller's expected sale price, mortgage payout and selling costs and immediately see the estimated net proceeds, so I can explain the financial effect of those assumptions during a consultation.

## 3. Scope

### Must build in Feature 01

- One mobile-first SELL page titled **Seller Net Proceeds**.
- Persistent Tier-1 disclaimer.
- Expected selling price and mortgage payout inputs.
- Core selling-cost section, expanded by default.
- Typical BC commission preset with manual override.
- Automatic 5% GST on commission.
- Editable legal/notary, discharge, penalty and signed closing adjustments.
- Optional planning-cost section, collapsed by default.
- Immediate deterministic recalculation without a Calculate button.
- Compact sticky result bar.
- Accessible on-screen View calculation breakdown.
- Empty, populated, focus, warning, error, disabled and negative-result states.
- Pure structured calculation result with a named rule version.
- Automated unit, boundary, rounding and UI-state tests.

### Design now, build later within M1

- Exportable/shareable Tier-2 estimate artifact with timestamp, visible assumptions and full professional-referral disclaimer.
- Final delivery action and artifact layout require their own design-direction approval before implementation.
- Feature 01 must expose a serializable structured result so the artifact can consume it without recalculating.

### Out of scope

- Capital gains tax or BC home flipping tax calculation.
- Tax advice or automatic tax eligibility determination.
- Client, property-address or seller-identity collection.
- Supabase persistence, accounts or saved scenarios.
- CRM, branded report, email delivery, AI explanation or mortgage advice.
- BUY, MOVE or scenario comparison.

## 4. Page structure and hierarchy

1. Navy application header with Back action and **Seller Net Proceeds** title.
2. Persistent disclaimer bar: **Estimate only — not a quote, approval, or professional advice.**
3. Expected selling price input.
4. Mortgage payout input with help action.
5. **Selling costs** card:
   - Default expanded for every new page load or new scenario.
   - May be manually collapsed after the user has reviewed it.
   - Header always retains the section label, current total and state.
   - Core assumptions are never initially hidden.
6. **Optional planning costs** card:
   - Default collapsed.
   - Header always retains the current total and representative helper text.
7. Sticky **Estimated net proceeds** result bar:
   - Approximately 10–12% of usable mobile height.
   - Includes result and View calculation action.
   - Respects bottom safe-area inset.
8. View calculation opens an accessible mobile bottom sheet; at wider widths it may render as a centered dialog. It does not navigate to a different route.

## 5. Field contract

| Field | Type / default | Rules |
|---|---|---|
| Expected selling price | Required CAD currency; initially empty | Greater than $0; maximum $100,000,000 |
| Mortgage payout | CAD currency; default $0 | 0–$100,000,000. If greater than sale price, show warning but still calculate. |
| Total brokerage commission | Computed CAD currency; Typical BC preset | Label as a negotiable planning preset, not a legal or standard rate. User can switch to manual amount and reset to preset. |
| GST on commission | Computed CAD currency | 5% of the active commission amount; not independently editable. |
| Legal/notary, incl. GST | CAD currency; default $0 | Manual estimate; 0–$100,000,000. The v3.3 $1,500 value is a populated example, not a product default. |
| Mortgage discharge fee | CAD currency; default $0 | Manual estimate; 0–$100,000,000. |
| Prepayment penalty | CAD currency; default $0 | Manual lender-supplied estimate; 0–$100,000,000. |
| Property-tax adjustment | Signed CAD adjustment; default $0 | Positive adds to seller proceeds; negative reduces proceeds; range -$100,000,000 to $100,000,000. |
| Other closing adjustments | Signed CAD adjustment; default $0 | Positive adds to seller proceeds; negative reduces proceeds. Seller concessions or adviser-supplied tax adjustments may be entered as negative values. |

### Core row editing

- Rows present as clean label/value rows with dividers, not permanent mini input boxes.
- Selecting an editable amount turns only that row into an inline currency editor with a visible focus ring.
- Commission editing exposes **Typical BC preset** and **Manual amount** modes.
- Switching back to the preset immediately recalculates commission from selling price.
- Invalid input shows an inline message attached to the field; the last valid value must not be silently reused as the current result.

## 6. Optional planning costs

### Approved collapsed-card refinement

- Use `lucide-react` `ListPlus` for Optional planning costs: 20px icon, `strokeWidth` 1.75, navy `#0B1F3A`.
- Place the icon in a pale-gold `#FFF6DF` container sized 40×40px with 12px radius.
- The Optional planning costs card uses a complete neutral 1px border with 16px radius. The card must not use the sticky Result bar's gold divider as a bottom border.
- Preserve 12–16px whitespace below the card before the sticky Result bar treatment.
- The collapsed header's right side displays `$0 + ChevronDown`, with 8px spacing. The interactive target is at least 44×44px.
- The gold 2px divider belongs to the sticky Result bar, not to the Optional planning costs card.
- For this local Optional planning costs detail, this written specification takes precedence over the not-yet-updated v3.3 visual reference.

The expanded optional section contains non-negative manual CAD fields:

- Staging/preparation
- Repairs/renovations
- Inspection/appraisal
- Cleaning
- Moving/storage
- Overlap or temporary-housing costs
- Other planning costs

Seller concessions do not belong here; they are a core closing adjustment. Optional planning costs do not change the primary legal-style Estimated Net Proceeds result. When optional total is greater than $0, show a secondary value in the sticky result and breakdown:

**After optional planning costs = Estimated net proceeds - Optional planning costs**

## 7. Calculation contract

All monetary values are integer cents. Floating-point arithmetic is prohibited.

### Typical BC commission preset

```text
tier1Base = min(sellingPrice, $100,000)
tier2Base = max(sellingPrice - $100,000, $0)

commissionBeforeGST =
  roundHalfUpToCent(
    tier1Base x 7%
    + tier2Base x 2.5%
  )

gstOnCommission =
  roundHalfUpToCent(commissionBeforeGST x 5%)
```

Required UI copy:

- **Typical BC preset**
- **7% first $100k + 2.5% balance**
- **Commission is negotiable. Confirm the amount in the listing agreement.**

Use **Total brokerage commission**, not listing-agent commission, because the negotiated total may include remuneration shared with a buyer's brokerage.

### Net-proceeds formula

```text
fixedClosingCosts =
  commissionBeforeGST
  + gstOnCommission
  + legalNotaryIncludingGST
  + mortgageDischargeFee
  + mortgagePrepaymentPenalty

estimatedNetProceeds =
  sellingPrice
  - mortgagePayout
  - fixedClosingCosts
  + propertyTaxAdjustment
  + otherClosingAdjustments

displayedSellingCostDeduction =
  fixedClosingCosts
  - propertyTaxAdjustment
  - otherClosingAdjustments

optionalPlanningTotal =
  staging
  + repairs
  + inspectionAppraisal
  + cleaning
  + movingStorage
  + overlapHousing
  + otherPlanningCosts

estimatedAfterPlanning =
  estimatedNetProceeds
  - optionalPlanningTotal
```

### Reference example

```text
Selling price                      $850,000.00
Mortgage payout                   -$420,000.00
Commission                         -$25,750.00
GST on commission                   -$1,287.50
Legal/notary                        -$1,500.00
Mortgage discharge                    -$300.00
Prepayment penalty                  -$1,000.00
Property-tax adjustment               -$400.00
Other closing adjustments                $0.00
Estimated net proceeds             $399,762.50
Whole-dollar summary                  $399,763
Selling-cost deduction summary         $30,238
```

The property-tax value is a signed proceeds adjustment. In this example, -$400 reduces proceeds; it is not a $400 credit.

## 8. Rounding and display rules

- Parse currency into integer cents before calculation.
- Calculate tiered commission as one aggregate rational amount, then round half-up once to cents.
- Calculate GST from the rounded commission cents, then round half-up to cents.
- Structured results and View calculation show exact cents.
- Main page summaries display whole dollars using half-up rounding.
- Do not truncate.
- The structured result includes `ruleVersion: "sell-bc-2026-08-09-v1"` and the active commission mode.
- Every displayed total must reconcile to the exact-cent breakdown; any whole-dollar difference caused by display rounding is explained in the breakdown.

## 9. State behaviour

### Empty

- Selling price is empty or $0.
- Result displays **Enter selling price**.
- View calculation is disabled.
- Dependent preset commission and GST display $0 until a valid selling price exists.

### Populated

- Every valid edit recalculates synchronously.
- No Calculate button.
- Result and totals update in the same interaction cycle.

### Focus

- Only the active field or cost row receives the blue focus border/ring.
- Other amount rows remain quiet text rows.

### Blocking error

- Invalid sale price example: **Enter an amount greater than $0.**
- Sale-price error makes commission, GST, selling-cost total and result unavailable, displayed as an em dash.
- Independent manually entered rows remain visible.
- Invalid input blocks only calculations dependent on that field.

### Non-blocking warning

- Mortgage payout greater than selling price shows: **Mortgage payout exceeds the expected selling price.**
- Calculation continues and may produce negative proceeds.

### Negative result

- A valid negative result is not a field error.
- Display the signed amount with error-semantic colour plus copy: **Estimated costs and mortgage exceed the selling price.**

### Loading

- Core calculation is synchronous and must not show a loading spinner or skeleton.
- Any future asynchronous export action is outside this feature.

## 10. View calculation breakdown

The accessible bottom sheet/dialog shows:

- Selling price
- Mortgage payout
- Commission mode and exact preset formula or manual amount
- GST rate and amount
- Every core cost and signed adjustment
- Exact-cent Estimated net proceeds
- Optional planning-cost total and Estimated after planning, when applicable
- Rule version
- Persistent Tier-1 disclaimer
- Tax exclusion note: **Capital gains tax and BC home flipping tax are not calculated. Use an adviser-supplied amount only as a manual adjustment.**

Closing returns focus to View calculation.

## 11. Visual system

### Typography

Use the existing repository `Geist` configuration through `next/font/google`; do not add a font package.

- Page title: 20px / 700
- Section title: 15px / 650 or nearest supported weight
- Field label: 14px / 600
- Input amount: 18px / 600
- Cost amount: 14px / 600
- Helper and disclaimer: 12px / 400
- Result amount: 32px / 700
- All monetary values use `font-variant-numeric: tabular-nums`.

### Colour tokens

```text
page background       #F6F8FB
card                   #FFFFFF
navy                   #0B2344
primary text           #101828
secondary text         #667085
border                 #D0D5DD
gold                   #9A6700
action blue            #175CD3
error                  #B42318
navy icon tint         #EEF4FF
gold icon tint         #FFF6DF
neutral icon tint      #F2F4F7
error icon tint        #FEF3F2
```

### Icons

Use `lucide-react` only after dependency approval is included with Build approval.

- `ArrowLeft`: white, navigation.
- `Info` and `CircleHelp`: gray-blue with neutral tint.
- `ReceiptText`: navy with pale-blue tint.
- `ListPlus`: Optional planning costs; 20px, `strokeWidth` 1.75, navy `#0B1F3A`, inside a 40×40px pale-gold `#FFF6DF` container with 12px radius.
- `ChevronUp` / `ChevronDown`: neutral gray-blue.
- `CircleAlert`: red with pale-red tint.
- `ListTree`: blue with pale-blue tint.

Glyphs are 16–20px with 1.75–2px stroke. Tinted containers are approximately 24–32px; interactive targets remain at least 44×44px. Do not assign a different decorative colour to each cost row.

## 12. Responsive behaviour

- 320–767px: single column, 14–20px horizontal padding, sticky bottom result, safe-area padding.
- 768px and above: retain Direction A single-column flow, centered with a readable maximum content width; do not introduce the rejected two-column calculator.
- No horizontal scrolling at 320px.
- Long helper text wraps without pushing numeric values off-screen.
- When the on-screen keyboard opens, the active input must remain visible and the result bar must not cover it.

## 13. Accessibility

- Use semantic `label`, `input`, `button` and dialog elements.
- Accordion headers expose `aria-expanded` and `aria-controls`.
- Error text is programmatically associated using `aria-describedby`; error state does not rely on colour alone.
- Icon-only Back and Help actions have accessible names.
- Decorative icons use `aria-hidden="true"`.
- Minimum interactive target: 44×44px.
- Visible keyboard focus is required.
- Text contrast meets WCAG AA.
- Currency formatting is readable by assistive technology; do not announce decorative currency symbols twice.

## 14. Privacy and trust

- M1 calculation inputs remain in memory for the current session only.
- Do not send calculation inputs to Supabase or analytics.
- Do not request seller identity, contact information or property address.
- Do not automatically calculate capital gains tax or BC home flipping tax.
- Do not use **approved**, **qualified**, **pre-approved** or **you can afford**.
- The Tier-1 disclaimer remains visible with every result.
- Before real-client use, WT must obtain managing-broker and BC counsel review of disclaimer wording as required by Charter §15.

## 15. Technical result contract

The pure calculation module returns a serializable structure containing at minimum:

```typescript
type SellerNetProceedsResult = {
  ruleVersion: string;
  commissionMode: "bc-preset" | "manual";
  inputs: SellerNetProceedsInputs;
  commissionBeforeGstCents: bigint;
  gstOnCommissionCents: bigint;
  fixedClosingCostsCents: bigint;
  propertyTaxAdjustmentCents: bigint;
  otherClosingAdjustmentsCents: bigint;
  displayedSellingCostDeductionCents: bigint;
  estimatedNetProceedsCents: bigint;
  optionalPlanningTotalCents: bigint;
  estimatedAfterPlanningCents: bigint;
};
```

> **Build-time note (Decision Log, 2026-08-09):** `bigint` fields are not natively JSON-serializable (`JSON.stringify` throws on `bigint`), which conflicts with "serializable structure." Resolve during Build via string-encoded cents or a plain `number` representation — the $100,000,000 maximum is only 10,000,000,000 cents, well within `Number.MAX_SAFE_INTEGER`. This is a Build-time implementation decision, not a spec change.

The calculation module has no React, DOM, browser-storage, Supabase or formatting dependencies.

## 16. Acceptance criteria

- [ ] AC-01: Valid input produces the same deterministic result on repeated runs.
- [ ] AC-02: $850,000 / $420,000 reference scenario produces $25,750.00 commission, $1,287.50 GST and $399,762.50 exact net proceeds.
- [ ] AC-03: Main result for the reference scenario displays $399,763 and selling-cost deduction displays $30,238.
- [ ] AC-04: Commission preset uses 7% on the first $100,000 and 2.5% on the balance, with an editable manual mode and negotiability notice.
- [ ] AC-05: Core selling costs are expanded by default; optional planning costs are collapsed by default.
- [ ] AC-06: Every material core assumption remains visible or one explicit user-controlled collapse away; a new scenario resets core costs to expanded.
- [ ] AC-07: Editing any valid field immediately updates dependent totals without a Calculate button.
- [ ] AC-08: Invalid sale price shows the exact inline error, disables View calculation and does not display a stale result.
- [ ] AC-09: Mortgage payout greater than price warns but still calculates a signed negative result.
- [ ] AC-10: Positive signed adjustments increase proceeds; negative signed adjustments reduce proceeds.
- [ ] AC-11: Optional planning costs remain separate from primary Estimated net proceeds and produce a secondary after-planning value.
- [ ] AC-12: View calculation reconciles every exact-cent line to the structured result and displays the rule version.
- [ ] AC-13: Tier-1 disclaimer remains visible in empty, populated, warning and error states.
- [ ] AC-14: Layout works without clipping or horizontal scrolling at 320px, 390px, 768px and 1280px.
- [ ] AC-15: Keyboard-only operation, focus return, accessible names, error association and accordion semantics pass manual accessibility review.
- [ ] AC-16: No calculation input is persisted or transmitted.
- [ ] AC-17: At least 10 frozen engine scenarios cover tier boundary, below/at/above $100k, manual commission, cents rounding, adjustments, maximum values and negative proceeds.
- [ ] AC-18: `pnpm lint`, type-check, automated tests and `pnpm build` pass before implementation handoff.

## 17. Build dependencies and gate

- The current repository already configures Geist through `next/font/google`.
- `lucide-react` is not currently installed. WT's Build approval must explicitly include permission to add this dependency.
- Radix or another accordion/dialog dependency is not required for this feature unless implementation evidence shows native/hand-built accessible controls are insufficient.
- Supabase is selected for future persistence but is not required or configured for Feature 01.

## 18. Known gap before M1 close

The calculator screen can proceed to Build after WT approves Build plus `lucide-react` (spec itself is already approved, 2026-08-09). M1 cannot be declared complete or production-verified until the Tier-2 export/share artifact is designed, specified, implemented and verified against Charter §8, §13 and §15.
