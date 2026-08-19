import assert from "node:assert/strict";
import test from "node:test";

import {
  formatWholeCad,
  parseCurrencyToCents,
  roundCentsToWholeDollars,
} from "./currency.ts";
import {
  calculateGstOnCommissionCents,
  calculatePresetCommissionCents,
  calculateSellerNetProceeds,
  type SellerNetProceedsInputs,
} from "./sell.ts";
import {
  deriveSellerCalculatorState,
  INITIAL_FORM_VALUES,
} from "./sell-calculator-form.ts";
import {
  createInitialConsultationState,
  deriveTopicSummaries,
  isViewCalculationDisabled,
} from "../sell-consultation.ts";

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

test("reference scenario reconciles to the approved exact-cent result", () => {
  const result = calculateSellerNetProceeds(makeInputs());

  assert.equal(result.commissionBeforeGstCents, 2_575_000);
  assert.equal(result.gstOnCommissionCents, 128_750);
  assert.equal(result.fixedClosingCostsCents, 2_983_750);
  assert.equal(result.displayedSellingCostDeductionCents, 3_023_750);
  assert.equal(result.estimatedNetProceedsCents, 39_976_250);
  assert.equal(formatWholeCad(result.estimatedNetProceedsCents), "$399,763");
  assert.equal(
    formatWholeCad(result.displayedSellingCostDeductionCents),
    "$30,238",
  );
  assert.equal(result.jurisdiction, "CA-BC");
  assert.equal(result.ruleVersion, "sell-bc-2026-08-09-v1");
});

test("currency parsing and whole-dollar display avoid calculation floats", () => {
  assert.deepEqual(parseCurrencyToCents("$1,234.56"), {
    status: "valid",
    cents: 123_456,
  });
  assert.deepEqual(parseCurrencyToCents("-0.01"), {
    status: "valid",
    cents: -1,
  });
  assert.equal(roundCentsToWholeDollars(150), 2);
  assert.equal(roundCentsToWholeDollars(-150), -2);
  assert.equal(parseCurrencyToCents("1.234").status, "invalid");
});

test("repeated runs are deterministic and directly JSON-serializable", () => {
  const inputs = makeInputs();
  const first = calculateSellerNetProceeds(inputs);
  const second = calculateSellerNetProceeds(inputs);

  assert.deepEqual(first, second);
  assert.doesNotThrow(() => JSON.stringify(first));
  assert.equal(first.ruleVersion, "sell-bc-2026-08-09-v1");
  assert.equal(JSON.parse(JSON.stringify(first)).jurisdiction, "CA-BC");
});

const frozenCommissionScenarios = [
  { name: "below first tier", sellingPriceCents: 5_000_000, expected: 350_000 },
  { name: "one cent below boundary", sellingPriceCents: 9_999_999, expected: 700_000 },
  { name: "at boundary", sellingPriceCents: 10_000_000, expected: 700_000 },
  { name: "one cent above boundary", sellingPriceCents: 10_000_001, expected: 700_000 },
  { name: "half-cent rounds up", sellingPriceCents: 10_000_020, expected: 700_001 },
  { name: "typical populated price", sellingPriceCents: 85_000_000, expected: 2_575_000 },
  { name: "maximum price", sellingPriceCents: 10_000_000_000, expected: 250_450_000 },
] as const;

for (const scenario of frozenCommissionScenarios) {
  test(`preset commission: ${scenario.name}`, () => {
    assert.equal(
      calculatePresetCommissionCents(scenario.sellingPriceCents),
      scenario.expected,
    );
  });
}

test("GST rounds half-up from the rounded commission cents", () => {
  assert.equal(calculateGstOnCommissionCents(9), 0);
  assert.equal(calculateGstOnCommissionCents(10), 1);
  assert.equal(calculateGstOnCommissionCents(2_575_000), 128_750);
});

test("manual commission replaces the preset and still receives GST", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      commissionMode: "manual",
      manualCommissionCents: 1_234_567,
    }),
  );

  assert.equal(result.commissionBeforeGstCents, 1_234_567);
  assert.equal(result.gstOnCommissionCents, 61_728);
});

test("signed adjustments move proceeds in their entered direction", () => {
  const baseline = calculateSellerNetProceeds(
    makeInputs({
      propertyTaxAdjustmentCents: 0,
      otherClosingAdjustmentsCents: 0,
    }),
  );
  const adjusted = calculateSellerNetProceeds(
    makeInputs({
      propertyTaxAdjustmentCents: 25_000,
      otherClosingAdjustmentsCents: -10_000,
    }),
  );

  assert.equal(
    adjusted.estimatedNetProceedsCents,
    baseline.estimatedNetProceedsCents + 15_000,
  );
});

test("optional costs stay separate from primary proceeds", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      optionalPlanningCosts: {
        stagingCents: 100_000,
        repairsCents: 200_000,
        inspectionAppraisalCents: 30_000,
        cleaningCents: 25_000,
        movingStorageCents: 40_000,
        overlapHousingCents: 50_000,
        otherPlanningCostsCents: 5_000,
      },
    }),
  );

  assert.equal(result.optionalPlanningTotalCents, 450_000);
  assert.equal(
    result.estimatedAfterPlanningCents,
    result.estimatedNetProceedsCents - 450_000,
  );
  assert.equal(result.estimatedNetProceedsCents, 39_976_250);
});

test("costs and mortgage can produce valid negative proceeds", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 20_000_000,
      mortgagePayoutCents: 25_000_000,
    }),
  );

  assert.ok(result.estimatedNetProceedsCents < 0);
});

test("maximum field values remain safe integer cents", () => {
  const result = calculateSellerNetProceeds(
    makeInputs({
      sellingPriceCents: 10_000_000_000,
      mortgagePayoutCents: 10_000_000_000,
      legalNotaryIncludingGstCents: 10_000_000_000,
      mortgageDischargeFeeCents: 10_000_000_000,
      mortgagePrepaymentPenaltyCents: 10_000_000_000,
      propertyTaxAdjustmentCents: 10_000_000_000,
      otherClosingAdjustmentsCents: -10_000_000_000,
    }),
  );

  assert.ok(Number.isSafeInteger(result.estimatedNetProceedsCents));
});

test("engine rejects out-of-contract monetary inputs", () => {
  assert.throws(
    () =>
      calculateSellerNetProceeds(
        makeInputs({
          sellingPriceCents: 10_000_000_001,
        }),
      ),
    RangeError,
  );
  assert.throws(
    () =>
      calculateSellerNetProceeds(
        makeInputs({
          optionalPlanningCosts: {
            ...makeInputs().optionalPlanningCosts,
            stagingCents: -1,
          },
        }),
      ),
    RangeError,
  );
});

test("empty form has no result and no sale-price error", () => {
  const state = deriveSellerCalculatorState(
    { ...INITIAL_FORM_VALUES },
    "bc-preset",
  );

  assert.equal(state.salePriceState, "empty");
  assert.equal(state.result, null);
  assert.equal(state.fieldErrors.sellingPrice, undefined);
});

test("zero sale price blocks the result with the approved message", () => {
  const state = deriveSellerCalculatorState(
    { ...INITIAL_FORM_VALUES, sellingPrice: "0" },
    "bc-preset",
  );

  assert.equal(state.salePriceState, "invalid");
  assert.equal(state.result, null);
  assert.equal(
    state.fieldErrors.sellingPrice,
    "Enter an amount greater than $0.",
  );
});

test("mortgage over price warns while preserving a negative result", () => {
  const state = deriveSellerCalculatorState(
    {
      ...INITIAL_FORM_VALUES,
      sellingPrice: "100,000",
      mortgagePayout: "120,000",
    },
    "bc-preset",
  );

  assert.equal(
    state.mortgageWarning,
    "Mortgage payout exceeds the expected selling price.",
  );
  assert.ok(state.result);
  assert.equal(state.hasNegativeResult, true);
});

test("invalid optional input blocks only the after-planning calculation", () => {
  const state = deriveSellerCalculatorState(
    {
      ...INITIAL_FORM_VALUES,
      sellingPrice: "850000",
      staging: "-1",
    },
    "bc-preset",
  );

  assert.ok(state.result);
  assert.equal(state.optionalCalculationAvailable, false);
  assert.equal(
    state.fieldErrors.staging,
    "Enter an amount from $0 to $100,000,000.",
  );
});

test("invalid mortgage blocks net proceeds but not sale-dependent commission", () => {
  const state = deriveSellerCalculatorState(
    {
      ...INITIAL_FORM_VALUES,
      sellingPrice: "850000",
      mortgagePayout: "not an amount",
    },
    "bc-preset",
  );

  assert.equal(state.result, null);
  assert.equal(state.commissionBeforeGstCents, 2_575_000);
  assert.equal(state.gstOnCommissionCents, 128_750);
  assert.equal(state.displayedSellingCostDeductionCents, 2_703_750);
});

test("optional total remains available before a selling price is entered", () => {
  const state = deriveSellerCalculatorState(
    {
      ...INITIAL_FORM_VALUES,
      staging: "1,000",
      cleaning: "250.50",
    },
    "bc-preset",
  );

  assert.equal(state.result, null);
  assert.equal(state.optionalPlanningTotalCents, 125_050);
});

test("empty consultation opens on Price with Planning collapsed and $0 planning summary", () => {
  const consultation = createInitialConsultationState();
  const calc = deriveSellerCalculatorState(
    { ...INITIAL_FORM_VALUES },
    "bc-preset",
  );
  const summaries = deriveTopicSummaries(calc);

  assert.equal(consultation.activeTopic, "price");
  assert.equal(consultation.planningExpanded, false);
  assert.equal(summaries.price.value, "Enter selling price");
  assert.equal(summaries.price.tone, "empty");
  assert.equal(summaries.mortgage.value, "$0");
  assert.equal(summaries["selling-costs"].value, "$0");
  assert.equal(summaries.planning.value, "$0");
});

test("topic summaries expose error, warning, negative, and optional totals", () => {
  const invalid = deriveTopicSummaries(
    deriveSellerCalculatorState(
      { ...INITIAL_FORM_VALUES, sellingPrice: "0" },
      "bc-preset",
    ),
  );
  assert.equal(invalid.price.tone, "error");
  assert.equal(invalid["selling-costs"].value, "—");

  const warning = deriveTopicSummaries(
    deriveSellerCalculatorState(
      {
        ...INITIAL_FORM_VALUES,
        sellingPrice: "100000",
        mortgagePayout: "120000",
      },
      "bc-preset",
    ),
  );
  assert.equal(warning.mortgage.tone, "warning");
  assert.equal(warning.price.tone, "ok");

  const planning = deriveTopicSummaries(
    deriveSellerCalculatorState(
      { ...INITIAL_FORM_VALUES, sellingPrice: "850000", staging: "1500" },
      "bc-preset",
    ),
  );
  assert.equal(planning.planning.value, "$1,500");
  assert.equal(planning.price.value, "$850,000");
});

test("View calculation stays disabled until a valid primary result exists", () => {
  assert.equal(
    isViewCalculationDisabled(
      deriveSellerCalculatorState({ ...INITIAL_FORM_VALUES }, "bc-preset"),
    ),
    true,
  );
  assert.equal(
    isViewCalculationDisabled(
      deriveSellerCalculatorState(
        { ...INITIAL_FORM_VALUES, sellingPrice: "0" },
        "bc-preset",
      ),
    ),
    true,
  );
  assert.equal(
    isViewCalculationDisabled(
      deriveSellerCalculatorState(
        { ...INITIAL_FORM_VALUES, sellingPrice: "850000", staging: "-1" },
        "bc-preset",
      ),
    ),
    false,
  );
});
