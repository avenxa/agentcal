import { parseCurrencyToCents } from "./currency.ts";
import {
  calculateGstOnCommissionCents,
  calculatePresetCommissionCents,
  calculateSellerNetProceeds,
  type CommissionMode,
  MAX_MONEY_CENTS,
  type SellerNetProceedsInputs,
  type SellerNetProceedsResult,
} from "./sell.ts";

export const CORE_FIELD_NAMES = [
  "mortgagePayout",
  "manualCommission",
  "legalNotary",
  "mortgageDischarge",
  "prepaymentPenalty",
  "propertyTaxAdjustment",
  "otherClosingAdjustments",
] as const;

export const OPTIONAL_FIELD_NAMES = [
  "staging",
  "repairs",
  "inspectionAppraisal",
  "cleaning",
  "movingStorage",
  "overlapHousing",
  "otherPlanningCosts",
] as const;

export type CoreFieldName = (typeof CORE_FIELD_NAMES)[number];
export type OptionalFieldName = (typeof OPTIONAL_FIELD_NAMES)[number];
export type CurrencyFieldName =
  | "sellingPrice"
  | CoreFieldName
  | OptionalFieldName;

export type SellerCalculatorFormValues = Record<CurrencyFieldName, string>;

export type SellerCalculatorUiState = {
  fieldErrors: Partial<Record<CurrencyFieldName, string>>;
  result: SellerNetProceedsResult | null;
  salePriceState: "empty" | "invalid" | "valid";
  mortgageWarning: string | null;
  optionalCalculationAvailable: boolean;
  hasNegativeResult: boolean;
  commissionBeforeGstCents: number | null;
  gstOnCommissionCents: number | null;
  displayedSellingCostDeductionCents: number | null;
  optionalPlanningTotalCents: number | null;
};

export const INITIAL_FORM_VALUES: SellerCalculatorFormValues = {
  sellingPrice: "",
  mortgagePayout: "0",
  manualCommission: "0",
  legalNotary: "0",
  mortgageDischarge: "0",
  prepaymentPenalty: "0",
  propertyTaxAdjustment: "0",
  otherClosingAdjustments: "0",
  staging: "0",
  repairs: "0",
  inspectionAppraisal: "0",
  cleaning: "0",
  movingStorage: "0",
  overlapHousing: "0",
  otherPlanningCosts: "0",
};

const NON_NEGATIVE_CORE_FIELDS: CoreFieldName[] = [
  "mortgagePayout",
  "manualCommission",
  "legalNotary",
  "mortgageDischarge",
  "prepaymentPenalty",
];

const SIGNED_CORE_FIELDS: CoreFieldName[] = [
  "propertyTaxAdjustment",
  "otherClosingAdjustments",
];

function parseOptionalAmount(
  rawValue: string,
  allowNegative: boolean,
): { cents: number; error?: string } {
  const parsed = parseCurrencyToCents(rawValue);

  if (parsed.status === "empty") {
    return { cents: 0 };
  }

  if (parsed.status === "invalid") {
    return { cents: 0, error: "Enter a valid dollar amount." };
  }

  const minimum = allowNegative ? -MAX_MONEY_CENTS : 0;
  if (parsed.cents < minimum || parsed.cents > MAX_MONEY_CENTS) {
    return {
      cents: 0,
      error: allowNegative
        ? "Enter an amount from -$100,000,000 to $100,000,000."
        : "Enter an amount from $0 to $100,000,000.",
    };
  }

  return { cents: parsed.cents };
}

export function deriveSellerCalculatorState(
  values: SellerCalculatorFormValues,
  commissionMode: CommissionMode,
): SellerCalculatorUiState {
  const fieldErrors: Partial<Record<CurrencyFieldName, string>> = {};
  const parsedSalePrice = parseCurrencyToCents(values.sellingPrice);
  let salePriceState: SellerCalculatorUiState["salePriceState"] = "valid";
  let sellingPriceCents = 0;

  if (parsedSalePrice.status === "empty") {
    salePriceState = "empty";
  } else if (
    parsedSalePrice.status === "invalid" ||
    parsedSalePrice.cents <= 0
  ) {
    salePriceState = "invalid";
    fieldErrors.sellingPrice = "Enter an amount greater than $0.";
  } else if (parsedSalePrice.cents > MAX_MONEY_CENTS) {
    salePriceState = "invalid";
    fieldErrors.sellingPrice = "Enter $100,000,000 or less.";
  } else {
    sellingPriceCents = parsedSalePrice.cents;
  }

  const cents: Record<CoreFieldName | OptionalFieldName, number> = {
    mortgagePayout: 0,
    manualCommission: 0,
    legalNotary: 0,
    mortgageDischarge: 0,
    prepaymentPenalty: 0,
    propertyTaxAdjustment: 0,
    otherClosingAdjustments: 0,
    staging: 0,
    repairs: 0,
    inspectionAppraisal: 0,
    cleaning: 0,
    movingStorage: 0,
    overlapHousing: 0,
    otherPlanningCosts: 0,
  };

  for (const fieldName of NON_NEGATIVE_CORE_FIELDS) {
    const parsed = parseOptionalAmount(values[fieldName], false);
    cents[fieldName] = parsed.cents;
    if (parsed.error && !(fieldName === "manualCommission" && commissionMode === "bc-preset")) {
      fieldErrors[fieldName] = parsed.error;
    }
  }

  for (const fieldName of SIGNED_CORE_FIELDS) {
    const parsed = parseOptionalAmount(values[fieldName], true);
    cents[fieldName] = parsed.cents;
    if (parsed.error) {
      fieldErrors[fieldName] = parsed.error;
    }
  }

  for (const fieldName of OPTIONAL_FIELD_NAMES) {
    const parsed = parseOptionalAmount(values[fieldName], false);
    cents[fieldName] = parsed.cents;
    if (parsed.error) {
      fieldErrors[fieldName] = parsed.error;
    }
  }

  const blockingCoreFields = CORE_FIELD_NAMES.filter(
    (fieldName) =>
      fieldName !== "manualCommission" || commissionMode === "manual",
  );
  const hasCoreError = blockingCoreFields.some(
    (fieldName) => fieldErrors[fieldName] !== undefined,
  );
  const optionalCalculationAvailable = !OPTIONAL_FIELD_NAMES.some(
    (fieldName) => fieldErrors[fieldName] !== undefined,
  );
  const commissionBeforeGstCents =
    salePriceState === "empty"
      ? 0
      : salePriceState === "valid" &&
          (commissionMode === "bc-preset" ||
            fieldErrors.manualCommission === undefined)
        ? commissionMode === "bc-preset"
          ? calculatePresetCommissionCents(sellingPriceCents)
          : cents.manualCommission
        : null;
  const gstOnCommissionCents =
    commissionBeforeGstCents === null
      ? null
      : calculateGstOnCommissionCents(commissionBeforeGstCents);
  const sellingCostFields: CoreFieldName[] = [
    "legalNotary",
    "mortgageDischarge",
    "prepaymentPenalty",
    "propertyTaxAdjustment",
    "otherClosingAdjustments",
  ];
  const sellingCostsAvailable =
    commissionBeforeGstCents !== null &&
    gstOnCommissionCents !== null &&
    !sellingCostFields.some(
      (fieldName) => fieldErrors[fieldName] !== undefined,
    );
  const displayedSellingCostDeductionCents = sellingCostsAvailable
    ? commissionBeforeGstCents +
      gstOnCommissionCents +
      cents.legalNotary +
      cents.mortgageDischarge +
      cents.prepaymentPenalty -
      cents.propertyTaxAdjustment -
      cents.otherClosingAdjustments
    : null;
  const optionalPlanningTotalCents = optionalCalculationAvailable
    ? OPTIONAL_FIELD_NAMES.reduce(
        (total, fieldName) => total + cents[fieldName],
        0,
      )
    : null;

  let result: SellerNetProceedsResult | null = null;
  if (salePriceState === "valid" && !hasCoreError) {
    const inputs: SellerNetProceedsInputs = {
      sellingPriceCents,
      mortgagePayoutCents: cents.mortgagePayout,
      commissionMode,
      manualCommissionCents: cents.manualCommission,
      legalNotaryIncludingGstCents: cents.legalNotary,
      mortgageDischargeFeeCents: cents.mortgageDischarge,
      mortgagePrepaymentPenaltyCents: cents.prepaymentPenalty,
      propertyTaxAdjustmentCents: cents.propertyTaxAdjustment,
      otherClosingAdjustmentsCents: cents.otherClosingAdjustments,
      optionalPlanningCosts: {
        stagingCents: cents.staging,
        repairsCents: cents.repairs,
        inspectionAppraisalCents: cents.inspectionAppraisal,
        cleaningCents: cents.cleaning,
        movingStorageCents: cents.movingStorage,
        overlapHousingCents: cents.overlapHousing,
        otherPlanningCostsCents: cents.otherPlanningCosts,
      },
    };

    result = calculateSellerNetProceeds(inputs);
  }

  const mortgageWarning =
    salePriceState === "valid" &&
    fieldErrors.mortgagePayout === undefined &&
    cents.mortgagePayout > sellingPriceCents
      ? "Mortgage payout exceeds the expected selling price."
      : null;

  return {
    fieldErrors,
    result,
    salePriceState,
    mortgageWarning,
    optionalCalculationAvailable,
    hasNegativeResult:
      result !== null && result.estimatedNetProceedsCents < 0,
    commissionBeforeGstCents,
    gstOnCommissionCents,
    displayedSellingCostDeductionCents,
    optionalPlanningTotalCents,
  };
}
