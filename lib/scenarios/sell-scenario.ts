import {
  deriveSellerCalculatorState,
  INITIAL_FORM_VALUES,
  OPTIONAL_FIELD_NAMES,
  type CurrencyFieldName,
  type SellerCalculatorFormValues,
  type SellerCalculatorUiState,
} from "../engine/sell-calculator-form.ts";
import {
  FEATURE_01_JURISDICTION,
  SELL_RULE_VERSION,
  type CommissionMode,
  type SellerNetProceedsResult,
} from "../engine/sell.ts";

/**
 * Versioned SELL Scenario model. It is deliberately separate from the
 * calculation engine: it stores inputs and a saved result snapshot and never
 * computes a financial amount itself. Amounts always come from
 * `deriveSellerCalculatorState` / `calculateSellerNetProceeds`.
 */
export const SELL_SCENARIO_SCHEMA_VERSION = 1 as const;
export const SELL_SCENARIO_LOCALE = "en-CA" as const;

export type SellReviewState = {
  mortgage: boolean;
  sellingCosts: boolean;
  planningCosts: boolean;
};

export type SellScenario = {
  schemaVersion: typeof SELL_SCENARIO_SCHEMA_VERSION;
  id: string;
  type: "SELL";
  name: string;
  jurisdiction: typeof FEATURE_01_JURISDICTION;
  locale: typeof SELL_SCENARIO_LOCALE;
  ruleVersion: string;
  formValues: SellerCalculatorFormValues;
  commissionMode: CommissionMode;
  review: SellReviewState;
  /** Result at last save; null for a Draft with no valid result. */
  savedResult: SellerNetProceedsResult | null;
  createdAt: string;
  updatedAt: string;
  /** Null until the Scenario is explicitly saved. */
  savedAt: string | null;
};

export type SellLifecycle = "Draft" | "Calculated" | "Saved" | "Updated";

export const CURRENCY_FIELD_NAMES = Object.keys(
  INITIAL_FORM_VALUES,
) as CurrencyFieldName[];

export function generateScenarioId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }
  return `sell-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function defaultScenarioName(now: Date): string {
  return `Sell Scenario — ${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function createSellScenario(
  options: { id?: string; now?: Date } = {},
): SellScenario {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  return {
    schemaVersion: SELL_SCENARIO_SCHEMA_VERSION,
    id: options.id ?? generateScenarioId(),
    type: "SELL",
    name: defaultScenarioName(now),
    jurisdiction: FEATURE_01_JURISDICTION,
    locale: SELL_SCENARIO_LOCALE,
    ruleVersion: SELL_RULE_VERSION,
    formValues: { ...INITIAL_FORM_VALUES },
    commissionMode: "bc-preset",
    review: { mortgage: false, sellingCosts: false, planningCosts: false },
    savedResult: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    savedAt: null,
  };
}

/** New id, copied inputs/mode/review state, new timestamps, unsaved. */
export function duplicateSellScenario(
  source: SellScenario,
  options: { id?: string; now?: Date } = {},
): SellScenario {
  const now = options.now ?? new Date();
  const timestamp = now.toISOString();
  return {
    ...source,
    id: options.id ?? generateScenarioId(),
    name: `Copy of ${source.name}`,
    formValues: { ...source.formValues },
    review: { ...source.review },
    savedResult: null,
    ruleVersion: SELL_RULE_VERSION,
    createdAt: timestamp,
    updatedAt: timestamp,
    savedAt: null,
  };
}

/**
 * Calculation-affecting equivalence: only the financial form values and the
 * commission mode feed the engine. Name and review flags never do, so they must
 * not invalidate a saved result snapshot.
 */
export function hasSameCalculationInputs(
  a: SellScenario,
  b: SellScenario,
): boolean {
  return (
    a.commissionMode === b.commissionMode &&
    CURRENCY_FIELD_NAMES.every((name) => a.formValues[name] === b.formValues[name])
  );
}

/** Editable state comparison used for dirty / Saved vs Updated derivation. */
export function hasSameEditableState(
  a: SellScenario,
  b: SellScenario,
): boolean {
  return (
    a.name === b.name &&
    a.commissionMode === b.commissionMode &&
    a.review.mortgage === b.review.mortgage &&
    a.review.sellingCosts === b.review.sellingCosts &&
    a.review.planningCosts === b.review.planningCosts &&
    CURRENCY_FIELD_NAMES.every((name) => a.formValues[name] === b.formValues[name])
  );
}

export function deriveCalculation(scenario: SellScenario): SellerCalculatorUiState {
  return deriveSellerCalculatorState(scenario.formValues, scenario.commissionMode);
}

/**
 * The authoritative result to display. A clean saved Scenario keeps showing its
 * saved snapshot so historical amounts never change silently when rules later
 * change; name/review-only edits keep it, and only a calculation-affecting
 * edit recalculates through the engine.
 */
export function resolveDisplayedResult(
  working: SellScenario,
  baseline: SellScenario | null,
  calc: SellerCalculatorUiState,
): SellerNetProceedsResult | null {
  if (
    baseline &&
    baseline.savedResult &&
    hasSameCalculationInputs(working, baseline)
  ) {
    return baseline.savedResult;
  }
  return calc.result;
}

export function deriveLifecycle(
  working: SellScenario,
  baseline: SellScenario | null,
  displayedResult: SellerNetProceedsResult | null,
): SellLifecycle {
  if (displayedResult === null) {
    return "Draft";
  }
  if (baseline === null || baseline.savedAt === null) {
    return "Calculated";
  }
  return hasSameEditableState(working, baseline) ? "Saved" : "Updated";
}

/** Lifecycle of a stored Scenario as it appears on the Entry list. */
export function deriveStoredLifecycle(scenario: SellScenario): SellLifecycle {
  return scenario.savedResult === null ? "Draft" : "Saved";
}

export function saveSellScenario(
  working: SellScenario,
  calc: SellerCalculatorUiState,
  now: Date = new Date(),
  baseline: SellScenario | null = null,
): SellScenario {
  const timestamp = now.toISOString();
  const name = working.name.trim() === "" ? defaultScenarioName(now) : working.name.trim();
  // Preserve the historical snapshot + rule version unless a financial input changed.
  const keepSnapshot =
    baseline !== null &&
    baseline.savedResult !== null &&
    hasSameCalculationInputs(working, baseline);
  const savedResult = keepSnapshot ? baseline.savedResult : calc.result;
  return {
    ...working,
    name,
    formValues: { ...working.formValues },
    review: { ...working.review },
    savedResult,
    ruleVersion: keepSnapshot
      ? baseline.ruleVersion
      : calc.result
        ? calc.result.ruleVersion
        : SELL_RULE_VERSION,
    updatedAt: timestamp,
    savedAt: timestamp,
  };
}

export type ReadinessGroupId =
  | "price"
  | "mortgage"
  | "commission"
  | "selling-costs"
  | "planning-costs";

export type ReadinessGroup = {
  id: ReadinessGroupId;
  label: string;
  confirmed: boolean;
};

export type SellReadiness = {
  groups: ReadinessGroup[];
  confirmedCount: number;
  total: 5;
  nextGroup: ReadinessGroup | null;
};

const SELLING_COST_FIELDS: CurrencyFieldName[] = [
  "legalNotary",
  "mortgageDischarge",
  "prepaymentPenalty",
  "propertyTaxAdjustment",
  "otherClosingAdjustments",
];

/**
 * Readiness is not calculation validity and never blocks a result. It only
 * counts which key assumption groups the user has confirmed.
 */
export function deriveReadiness(
  scenario: SellScenario,
  calc: SellerCalculatorUiState,
): SellReadiness {
  const errors = calc.fieldErrors;
  const groups: ReadinessGroup[] = [
    {
      id: "price",
      label: "Selling price",
      confirmed: calc.salePriceState === "valid",
    },
    {
      id: "mortgage",
      label: "Mortgage payout",
      confirmed: scenario.review.mortgage && errors.mortgagePayout === undefined,
    },
    {
      id: "commission",
      label: "Commission",
      confirmed:
        scenario.commissionMode === "bc-preset" ||
        errors.manualCommission === undefined,
    },
    {
      id: "selling-costs",
      label: "Selling costs",
      confirmed:
        scenario.review.sellingCosts &&
        SELLING_COST_FIELDS.every((name) => errors[name] === undefined),
    },
    {
      id: "planning-costs",
      label: "Planning costs",
      confirmed:
        scenario.review.planningCosts &&
        OPTIONAL_FIELD_NAMES.every((name) => errors[name] === undefined),
    },
  ];
  return {
    groups,
    confirmedCount: groups.filter((group) => group.confirmed).length,
    total: 5,
    nextGroup: groups.find((group) => !group.confirmed) ?? null,
  };
}
