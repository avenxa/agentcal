import {
  BC_COMMISSION_BALANCE_PER_MILLE,
  BC_COMMISSION_FIRST_TIER_CENTS,
  BC_COMMISSION_FIRST_TIER_PER_MILLE,
  BC_GST_RATE_PERCENT,
  FEATURE_01_JURISDICTION,
  MAX_MONEY_CENTS,
  SELL_RULE_VERSION,
  type Feature01Jurisdiction,
} from "./sell-bc-rules.ts";

export {
  FEATURE_01_JURISDICTION,
  MAX_MONEY_CENTS,
  SELL_RULE_VERSION,
} from "./sell-bc-rules.ts";

export type CommissionMode = "bc-preset" | "manual";

export type OptionalPlanningCosts = {
  stagingCents: number;
  repairsCents: number;
  inspectionAppraisalCents: number;
  cleaningCents: number;
  movingStorageCents: number;
  overlapHousingCents: number;
  otherPlanningCostsCents: number;
};

export type SellerNetProceedsInputs = {
  sellingPriceCents: number;
  mortgagePayoutCents: number;
  commissionMode: CommissionMode;
  manualCommissionCents: number;
  legalNotaryIncludingGstCents: number;
  mortgageDischargeFeeCents: number;
  mortgagePrepaymentPenaltyCents: number;
  propertyTaxAdjustmentCents: number;
  otherClosingAdjustmentsCents: number;
  optionalPlanningCosts: OptionalPlanningCosts;
};

/**
 * Structured Feature 01 result. Monetary amounts are integer cents stored as
 * JSON-serializable safe `number` values rather than `bigint`. This is a
 * serialization choice only: Feature 01's $100,000,000 field maximum is
 * 10,000,000,000 cents, well inside Number.MAX_SAFE_INTEGER. Formulas and
 * half-up rounding are unchanged.
 */
export type SellerNetProceedsResult = {
  ruleVersion: typeof SELL_RULE_VERSION;
  jurisdiction: Feature01Jurisdiction;
  commissionMode: CommissionMode;
  inputs: SellerNetProceedsInputs;
  commissionBeforeGstCents: number;
  gstOnCommissionCents: number;
  fixedClosingCostsCents: number;
  propertyTaxAdjustmentCents: number;
  otherClosingAdjustmentsCents: number;
  displayedSellingCostDeductionCents: number;
  estimatedNetProceedsCents: number;
  optionalPlanningTotalCents: number;
  estimatedAfterPlanningCents: number;
};

function roundHalfUpPositiveRational(
  numerator: number,
  denominator: number,
): number {
  return Math.floor((numerator + denominator / 2) / denominator);
}

function assertSafeIntegerCents(name: string, value: number): void {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`${name} must be a safe integer number of cents.`);
  }
}

function assertCentsRange(
  name: string,
  value: number,
  minimum: number,
  maximum: number,
): void {
  if (value < minimum || value > maximum) {
    throw new RangeError(
      `${name} must be between ${minimum} and ${maximum} cents.`,
    );
  }
}

function validateInputs(inputs: SellerNetProceedsInputs): void {
  const centsEntries: Array<[string, number]> = [
    ["sellingPriceCents", inputs.sellingPriceCents],
    ["mortgagePayoutCents", inputs.mortgagePayoutCents],
    ["manualCommissionCents", inputs.manualCommissionCents],
    ["legalNotaryIncludingGstCents", inputs.legalNotaryIncludingGstCents],
    ["mortgageDischargeFeeCents", inputs.mortgageDischargeFeeCents],
    [
      "mortgagePrepaymentPenaltyCents",
      inputs.mortgagePrepaymentPenaltyCents,
    ],
    ["propertyTaxAdjustmentCents", inputs.propertyTaxAdjustmentCents],
    ["otherClosingAdjustmentsCents", inputs.otherClosingAdjustmentsCents],
    ["optionalPlanningCosts.stagingCents", inputs.optionalPlanningCosts.stagingCents],
    ["optionalPlanningCosts.repairsCents", inputs.optionalPlanningCosts.repairsCents],
    [
      "optionalPlanningCosts.inspectionAppraisalCents",
      inputs.optionalPlanningCosts.inspectionAppraisalCents,
    ],
    ["optionalPlanningCosts.cleaningCents", inputs.optionalPlanningCosts.cleaningCents],
    [
      "optionalPlanningCosts.movingStorageCents",
      inputs.optionalPlanningCosts.movingStorageCents,
    ],
    [
      "optionalPlanningCosts.overlapHousingCents",
      inputs.optionalPlanningCosts.overlapHousingCents,
    ],
    [
      "optionalPlanningCosts.otherPlanningCostsCents",
      inputs.optionalPlanningCosts.otherPlanningCostsCents,
    ],
  ];

  for (const [name, value] of centsEntries) {
    assertSafeIntegerCents(name, value);
  }

  assertCentsRange(
    "sellingPriceCents",
    inputs.sellingPriceCents,
    1,
    MAX_MONEY_CENTS,
  );

  const nonNegativeEntries: Array<[string, number]> = [
    ["mortgagePayoutCents", inputs.mortgagePayoutCents],
    ["manualCommissionCents", inputs.manualCommissionCents],
    ["legalNotaryIncludingGstCents", inputs.legalNotaryIncludingGstCents],
    ["mortgageDischargeFeeCents", inputs.mortgageDischargeFeeCents],
    [
      "mortgagePrepaymentPenaltyCents",
      inputs.mortgagePrepaymentPenaltyCents,
    ],
    ["optionalPlanningCosts.stagingCents", inputs.optionalPlanningCosts.stagingCents],
    ["optionalPlanningCosts.repairsCents", inputs.optionalPlanningCosts.repairsCents],
    [
      "optionalPlanningCosts.inspectionAppraisalCents",
      inputs.optionalPlanningCosts.inspectionAppraisalCents,
    ],
    ["optionalPlanningCosts.cleaningCents", inputs.optionalPlanningCosts.cleaningCents],
    [
      "optionalPlanningCosts.movingStorageCents",
      inputs.optionalPlanningCosts.movingStorageCents,
    ],
    [
      "optionalPlanningCosts.overlapHousingCents",
      inputs.optionalPlanningCosts.overlapHousingCents,
    ],
    [
      "optionalPlanningCosts.otherPlanningCostsCents",
      inputs.optionalPlanningCosts.otherPlanningCostsCents,
    ],
  ];

  for (const [name, value] of nonNegativeEntries) {
    assertCentsRange(name, value, 0, MAX_MONEY_CENTS);
  }

  assertCentsRange(
    "propertyTaxAdjustmentCents",
    inputs.propertyTaxAdjustmentCents,
    -MAX_MONEY_CENTS,
    MAX_MONEY_CENTS,
  );
  assertCentsRange(
    "otherClosingAdjustmentsCents",
    inputs.otherClosingAdjustmentsCents,
    -MAX_MONEY_CENTS,
    MAX_MONEY_CENTS,
  );
}

export function calculatePresetCommissionCents(
  sellingPriceCents: number,
): number {
  assertSafeIntegerCents("sellingPriceCents", sellingPriceCents);

  if (sellingPriceCents <= 0) {
    return 0;
  }

  const firstTierCents = Math.min(
    sellingPriceCents,
    BC_COMMISSION_FIRST_TIER_CENTS,
  );
  const balanceCents = Math.max(
    sellingPriceCents - BC_COMMISSION_FIRST_TIER_CENTS,
    0,
  );

  return roundHalfUpPositiveRational(
    firstTierCents * BC_COMMISSION_FIRST_TIER_PER_MILLE +
      balanceCents * BC_COMMISSION_BALANCE_PER_MILLE,
    1_000,
  );
}

export function calculateGstOnCommissionCents(
  commissionBeforeGstCents: number,
): number {
  assertSafeIntegerCents(
    "commissionBeforeGstCents",
    commissionBeforeGstCents,
  );

  return roundHalfUpPositiveRational(
    commissionBeforeGstCents * BC_GST_RATE_PERCENT,
    100,
  );
}

export function calculateSellerNetProceeds(
  inputs: SellerNetProceedsInputs,
): SellerNetProceedsResult {
  validateInputs(inputs);

  const commissionBeforeGstCents =
    inputs.commissionMode === "bc-preset"
      ? calculatePresetCommissionCents(inputs.sellingPriceCents)
      : inputs.manualCommissionCents;
  const gstOnCommissionCents = calculateGstOnCommissionCents(
    commissionBeforeGstCents,
  );
  const fixedClosingCostsCents =
    commissionBeforeGstCents +
    gstOnCommissionCents +
    inputs.legalNotaryIncludingGstCents +
    inputs.mortgageDischargeFeeCents +
    inputs.mortgagePrepaymentPenaltyCents;
  const displayedSellingCostDeductionCents =
    fixedClosingCostsCents -
    inputs.propertyTaxAdjustmentCents -
    inputs.otherClosingAdjustmentsCents;
  const estimatedNetProceedsCents =
    inputs.sellingPriceCents -
    inputs.mortgagePayoutCents -
    fixedClosingCostsCents +
    inputs.propertyTaxAdjustmentCents +
    inputs.otherClosingAdjustmentsCents;
  const optionalPlanningTotalCents = Object.values(
    inputs.optionalPlanningCosts,
  ).reduce((total, value) => total + value, 0);
  const estimatedAfterPlanningCents =
    estimatedNetProceedsCents - optionalPlanningTotalCents;

  return {
    ruleVersion: SELL_RULE_VERSION,
    jurisdiction: FEATURE_01_JURISDICTION,
    commissionMode: inputs.commissionMode,
    inputs: {
      ...inputs,
      optionalPlanningCosts: { ...inputs.optionalPlanningCosts },
    },
    commissionBeforeGstCents,
    gstOnCommissionCents,
    fixedClosingCostsCents,
    propertyTaxAdjustmentCents: inputs.propertyTaxAdjustmentCents,
    otherClosingAdjustmentsCents: inputs.otherClosingAdjustmentsCents,
    displayedSellingCostDeductionCents,
    estimatedNetProceedsCents,
    optionalPlanningTotalCents,
    estimatedAfterPlanningCents,
  };
}
