import { formatWholeCad } from "./engine/currency.ts";
import type { SellerCalculatorUiState } from "./engine/sell-calculator-form.ts";

export const TOPIC_IDS = [
  "price",
  "mortgage",
  "selling-costs",
  "planning",
] as const;

export type TopicId = (typeof TOPIC_IDS)[number];

export type TopicTone = "empty" | "ok" | "warning" | "error" | "negative";

export type TopicSummary = {
  id: TopicId;
  label: string;
  value: string;
  tone: TopicTone;
};

export type ConsultationState = {
  activeTopic: TopicId;
  planningExpanded: boolean;
};

export const TOPIC_LABELS: Record<TopicId, string> = {
  price: "Price",
  mortgage: "Mortgage",
  "selling-costs": "Selling costs",
  planning: "Planning",
};

export function createInitialConsultationState(): ConsultationState {
  return {
    activeTopic: "price",
    planningExpanded: false,
  };
}

export function deriveTopicSummaries(
  calc: SellerCalculatorUiState,
): Record<TopicId, TopicSummary> {
  const priceValue =
    calc.salePriceState === "empty"
      ? "Enter selling price"
      : calc.salePriceState === "invalid"
        ? "Invalid amount"
        : calc.result
          ? formatWholeCad(calc.result.inputs.sellingPriceCents)
          : "—";
  const priceTone: TopicTone =
    calc.salePriceState === "empty"
      ? "empty"
      : calc.salePriceState === "invalid"
        ? "error"
        : "ok";

  const mortgageValue = calc.result
    ? formatWholeCad(calc.result.inputs.mortgagePayoutCents)
    : calc.fieldErrors.mortgagePayout
      ? "Invalid amount"
      : formatWholeCad(0);
  const mortgageTone: TopicTone = calc.mortgageWarning
    ? "warning"
    : calc.fieldErrors.mortgagePayout
      ? "error"
      : "ok";

  const sellingCostsValue =
    calc.displayedSellingCostDeductionCents === null
      ? "—"
      : formatWholeCad(calc.displayedSellingCostDeductionCents);

  const planningValue =
    calc.optionalPlanningTotalCents === null
      ? "—"
      : formatWholeCad(calc.optionalPlanningTotalCents);

  return {
    price: {
      id: "price",
      label: TOPIC_LABELS.price,
      value: priceValue,
      tone: priceTone,
    },
    mortgage: {
      id: "mortgage",
      label: TOPIC_LABELS.mortgage,
      value: mortgageValue,
      tone: mortgageTone,
    },
    "selling-costs": {
      id: "selling-costs",
      label: TOPIC_LABELS["selling-costs"],
      value: sellingCostsValue,
      tone: calc.salePriceState === "invalid" ? "error" : "ok",
    },
    planning: {
      id: "planning",
      label: TOPIC_LABELS.planning,
      value: planningValue,
      tone: calc.fieldErrors.staging ||
        calc.fieldErrors.repairs ||
        calc.fieldErrors.inspectionAppraisal ||
        calc.fieldErrors.cleaning ||
        calc.fieldErrors.movingStorage ||
        calc.fieldErrors.overlapHousing ||
        calc.fieldErrors.otherPlanningCosts
        ? "error"
        : "ok",
    },
  };
}

export function isViewCalculationDisabled(
  calc: SellerCalculatorUiState,
): boolean {
  return calc.result === null;
}
