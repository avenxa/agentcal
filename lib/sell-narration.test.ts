import assert from "node:assert/strict";
import test from "node:test";

import { formatExactCad, formatWholeCad } from "./engine/currency.ts";
import {
  calculateSellerNetProceeds,
  type SellerNetProceedsInputs,
} from "./engine/sell.ts";
import {
  composeClipboardHandoff,
  composeMailtoHref,
  composeMailtoSummary,
  composeResultNarration,
  composeTier2Disclosure,
  formatEstimateTimestamp,
  hasMortgagePayoutWarning,
  selectNarrationVariant,
} from "./sell-narration.ts";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  MORTGAGE_WARNING,
  NEGATIVE_RESULT_NOTE,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
  TIER2_REFERRAL,
} from "./sell-copy.ts";

function makeInputs(
  overrides: Partial<SellerNetProceedsInputs> = {},
): SellerNetProceedsInputs {
  return {
    sellingPriceCents: 85_000_000,
    mortgagePayoutCents: 42_000_000,
    commissionMode: "bc-preset",
    manualCommissionCents: 0,
    legalNotaryIncludingGstCents: 150_000,
    mortgageDischargeFeeCents: 30_000,
    mortgagePrepaymentPenaltyCents: 100_000,
    propertyTaxAdjustmentCents: -40_000,
    otherClosingAdjustmentsCents: 0,
    optionalPlanningCosts: {
      stagingCents: 0,
      repairsCents: 0,
      inspectionAppraisalCents: 0,
      cleaningCents: 0,
      movingStorageCents: 0,
      overlapHousingCents: 0,
      otherPlanningCostsCents: 0,
    },
    ...overrides,
  };
}

const generatedAt = new Date("2026-08-19T15:30:00-07:00");

test("standard variant matches the §4a template with reference-scenario substitution", () => {
  const result = calculateSellerNetProceeds(makeInputs());
  const narration = composeResultNarration(result);

  assert.equal(selectNarrationVariant(result), "standard");
  assert.equal(
    narration,
    `Based on an estimated selling price of $850,000, after a $420,000 mortgage payout and estimated selling costs of $30,238 — including a $25,750 commission using the ${COMMISSION_PRESET_LABEL} (${COMMISSION_PRESET_FORMULA}, plus GST; ${COMMISSION_NEGOTIABLE_NOTICE}) — the estimated net proceeds are $399,763. ${TIER1_DISCLAIMER} ${TAX_EXCLUSION_NOTE}`,
  );
  assert.equal(
    formatWholeCad(result.estimatedNetProceedsCents),
    "$399,763",
  );
  assert.equal(
    formatExactCad(result.estimatedNetProceedsCents),
    "$399,762.50",
  );
  assert.doesNotMatch(narration, /Legal\/notary/);
  assert.doesNotMatch(narration, /discharge fee/);
});

test("optional-planning variant inserts the planning sentence before the two disclosure sentences", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      optionalPlanningCosts: {
        stagingCents: 500_000,
        repairsCents: 0,
        inspectionAppraisalCents: 0,
        cleaningCents: 0,
        movingStorageCents: 0,
        overlapHousingCents: 0,
        otherPlanningCostsCents: 0,
      },
    }),
  );
  const narration = composeResultNarration(result);

  assert.equal(selectNarrationVariant(result), "optional-planning");
  assert.equal(result.optionalPlanningTotalCents, 500_000);
  assert.equal(
    formatWholeCad(result.estimatedAfterPlanningCents),
    "$394,763",
  );
  assert.equal(
    narration,
    `Based on an estimated selling price of $850,000, after a $420,000 mortgage payout and estimated selling costs of $30,238 — including a $25,750 commission using the ${COMMISSION_PRESET_LABEL} (${COMMISSION_PRESET_FORMULA}, plus GST; ${COMMISSION_NEGOTIABLE_NOTICE}) — the estimated net proceeds are $399,763. After optional planning costs of $5,000, the estimate is $394,763. ${TIER1_DISCLAIMER} ${TAX_EXCLUSION_NOTE}`,
  );
  assert.match(
    narration,
    new RegExp(
      `\\$394,763\\. ${TIER1_DISCLAIMER.replaceAll(".", "\\.")}`,
    ),
  );
});

test("mortgage-payout warning prepends the locked warning to the standard template", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 10_000_000,
      mortgagePayoutCents: 10_000_100,
      legalNotaryIncludingGstCents: 0,
      mortgageDischargeFeeCents: 0,
      mortgagePrepaymentPenaltyCents: 0,
      propertyTaxAdjustmentCents: 5_000_000,
      otherClosingAdjustmentsCents: 0,
    }),
  );
  const narration = composeResultNarration(result);

  assert.ok(result.estimatedNetProceedsCents > 0);
  assert.equal(hasMortgagePayoutWarning(result), true);
  assert.equal(selectNarrationVariant(result), "mortgage-warning");
  assert.ok(narration.startsWith(`${MORTGAGE_WARNING} Based on`));
  assert.match(narration, /estimated net proceeds are/);
  assert.doesNotMatch(narration, new RegExp(NEGATIVE_RESULT_NOTE));
});

test("negative result uses the shortfall template instead of the mortgage-warning variant", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 10_000_000,
      mortgagePayoutCents: 12_000_000,
    }),
  );
  const narration = composeResultNarration(result);

  assert.ok(result.estimatedNetProceedsCents < 0);
  assert.equal(hasMortgagePayoutWarning(result), true);
  assert.equal(selectNarrationVariant(result), "negative");
  assert.ok(narration.startsWith("Based on an estimated selling price of $100,000"));
  assert.ok(narration.includes(NEGATIVE_RESULT_NOTE));
  assert.ok(
    narration.includes(
      `The estimated shortfall is ${formatWholeCad(Math.abs(result.estimatedNetProceedsCents))}`,
    ),
  );
  assert.ok(!narration.startsWith(MORTGAGE_WARNING));
  assert.doesNotMatch(
    narration,
    new RegExp(`^${MORTGAGE_WARNING.replaceAll(".", "\\.")}`),
  );
});

test("negative result without a mortgage-payout warning still uses the negative template", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 20_000_000,
      mortgagePayoutCents: 5_000_000,
      legalNotaryIncludingGstCents: 10_000_000,
      mortgageDischargeFeeCents: 5_000_000,
      mortgagePrepaymentPenaltyCents: 5_000_000,
    }),
  );
  const narration = composeResultNarration(result);

  assert.ok(result.estimatedNetProceedsCents < 0);
  assert.equal(hasMortgagePayoutWarning(result), false);
  assert.equal(selectNarrationVariant(result), "negative");
  assert.doesNotMatch(narration, new RegExp(MORTGAGE_WARNING));
  assert.match(narration, new RegExp(NEGATIVE_RESULT_NOTE));
});

test("manual commission substitutes only the locked commission clause", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      commissionMode: "manual",
      manualCommissionCents: 1_234_567,
    }),
  );
  const narration = composeResultNarration(result);

  assert.equal(selectNarrationVariant(result), "standard");
  assert.match(
    narration,
    /including a \$12,346 commission \(manually entered\), plus GST/,
  );
  assert.doesNotMatch(narration, new RegExp(COMMISSION_PRESET_LABEL));
});

test("mortgage-warning plus optional planning keeps the warning and inserts the planning sentence", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 10_000_000,
      mortgagePayoutCents: 10_000_100,
      legalNotaryIncludingGstCents: 0,
      mortgageDischargeFeeCents: 0,
      mortgagePrepaymentPenaltyCents: 0,
      propertyTaxAdjustmentCents: 5_000_000,
      optionalPlanningCosts: {
        stagingCents: 100_000,
        repairsCents: 0,
        inspectionAppraisalCents: 0,
        cleaningCents: 0,
        movingStorageCents: 0,
        overlapHousingCents: 0,
        otherPlanningCostsCents: 0,
      },
    }),
  );
  const narration = composeResultNarration(result);

  assert.equal(selectNarrationVariant(result), "mortgage-warning");
  assert.ok(narration.startsWith(`${MORTGAGE_WARNING} Based on`));
  assert.match(
    narration,
    /After optional planning costs of \$1,000, the estimate is/,
  );
});

test("zero optional planning does not insert the planning sentence", () => {
  const narration = composeResultNarration(
    calculateSellerNetProceeds(makeInputs()),
  );
  assert.doesNotMatch(narration, /After optional planning costs/);
});

test("clipboard handoff is narration followed by the Tier 2 block", () => {
  const result = calculateSellerNetProceeds(makeInputs());
  const handoff = composeClipboardHandoff({
    result,
    preparedBy: "Jordan Lee, Example Realty",
    generatedAt,
  });
  const narration = composeResultNarration(result);
  const tier2 = composeTier2Disclosure({
    result,
    preparedBy: "Jordan Lee, Example Realty",
    generatedAt,
  });

  assert.equal(handoff, `${narration}\n\n${tier2}`);
  assert.match(handoff, /Prepared by: Jordan Lee, Example Realty/);
  assert.match(handoff, new RegExp(TIER2_REFERRAL));
  assert.match(handoff, /mortgage broker or lender/);
  assert.match(handoff, /lawyer or notary/);
  assert.match(handoff, /accountant/);
  assert.doesNotMatch(handoff, /third-party data/);
  assert.doesNotMatch(handoff, /referral fee/i);
  assert.doesNotMatch(handoff, /finder's fee/i);
});

test("mailto href has no recipient and a shorter summary body", () => {
  const result = calculateSellerNetProceeds(makeInputs());
  const href = composeMailtoHref({
    result,
    preparedBy: "Jordan Lee, Example Realty",
    generatedAt,
  });
  const summary = composeMailtoSummary({
    result,
    preparedBy: "Jordan Lee, Example Realty",
    generatedAt,
  });

  assert.match(href, /^mailto:\?subject=/);
  assert.doesNotMatch(href, /mailto:[^?]+@/);
  assert.match(href, /subject=/);
  assert.match(href, /body=/);
  assert.match(summary, /Estimated net proceeds: \$399,763 \(\$399,762\.50 exact\)/);
  assert.match(summary, new RegExp(TIER2_REFERRAL));
  assert.ok(summary.length < composeClipboardHandoff({
    result,
    preparedBy: "Jordan Lee, Example Realty",
    generatedAt,
  }).length);
  assert.match(
    decodeURIComponent(href),
    new RegExp(formatEstimateTimestamp(generatedAt)),
  );
});
