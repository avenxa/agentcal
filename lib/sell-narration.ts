import { formatExactCad, formatWholeCad } from "./engine/currency.ts";
import type { SellerNetProceedsResult } from "./engine/sell.ts";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  MORTGAGE_WARNING,
  NEGATIVE_RESULT_NOTE,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
  TIER2_ASSUMPTIONS_SUMMARY,
  TIER2_REFERRAL,
} from "./sell-copy.ts";

export type NarrationVariant =
  | "standard"
  | "optional-planning"
  | "mortgage-warning"
  | "negative";

export function hasMortgagePayoutWarning(
  result: SellerNetProceedsResult,
): boolean {
  return result.inputs.mortgagePayoutCents > result.inputs.sellingPriceCents;
}

export function selectNarrationVariant(
  result: SellerNetProceedsResult,
): NarrationVariant {
  if (result.estimatedNetProceedsCents < 0) {
    return "negative";
  }
  if (hasMortgagePayoutWarning(result)) {
    return "mortgage-warning";
  }
  if (result.optionalPlanningTotalCents > 0) {
    return "optional-planning";
  }
  return "standard";
}

function commissionClause(result: SellerNetProceedsResult): string {
  const commissionAmount = formatWholeCad(result.commissionBeforeGstCents);
  if (result.commissionMode === "manual") {
    return `a ${commissionAmount} commission (manually entered), plus GST`;
  }
  return `a ${commissionAmount} commission using the ${COMMISSION_PRESET_LABEL} (${COMMISSION_PRESET_FORMULA}, plus GST; ${COMMISSION_NEGOTIABLE_NOTICE})`;
}

function optionalPlanningSentence(result: SellerNetProceedsResult): string {
  if (result.optionalPlanningTotalCents <= 0) {
    return "";
  }
  return ` After optional planning costs of ${formatWholeCad(result.optionalPlanningTotalCents)}, the estimate is ${formatWholeCad(result.estimatedAfterPlanningCents)}.`;
}

function disclosureSentences(): string {
  return `${TIER1_DISCLAIMER} ${TAX_EXCLUSION_NOTE}`;
}

function standardBaseSentence(result: SellerNetProceedsResult): string {
  return `Based on an estimated selling price of ${formatWholeCad(result.inputs.sellingPriceCents)}, after a ${formatWholeCad(result.inputs.mortgagePayoutCents)} mortgage payout and estimated selling costs of ${formatWholeCad(result.displayedSellingCostDeductionCents)} — including ${commissionClause(result)} — the estimated net proceeds are ${formatWholeCad(result.estimatedNetProceedsCents)}.`;
}

function negativeBaseSentence(result: SellerNetProceedsResult): string {
  const shortfall = formatWholeCad(
    Math.abs(result.estimatedNetProceedsCents),
  );
  return `Based on an estimated selling price of ${formatWholeCad(result.inputs.sellingPriceCents)} and a ${formatWholeCad(result.inputs.mortgagePayoutCents)} mortgage payout, ${NEGATIVE_RESULT_NOTE} The estimated shortfall is ${shortfall}, driven by estimated selling costs of ${formatWholeCad(result.displayedSellingCostDeductionCents)} including a ${formatWholeCad(result.commissionBeforeGstCents)} commission.`;
}

export function composeResultNarration(
  result: SellerNetProceedsResult,
): string {
  if (result.estimatedNetProceedsCents < 0) {
    return `${negativeBaseSentence(result)} ${disclosureSentences()}`;
  }

  const warningPrefix = hasMortgagePayoutWarning(result)
    ? `${MORTGAGE_WARNING} `
    : "";
  return `${warningPrefix}${standardBaseSentence(result)}${optionalPlanningSentence(result)} ${disclosureSentences()}`;
}

export function formatEstimateTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function composePreparedByLine(preparedBy: string): string {
  const trimmed = preparedBy.trim();
  return trimmed === "" ? "Prepared by:" : `Prepared by: ${trimmed}`;
}

export function composeTier2Disclosure(input: {
  result: SellerNetProceedsResult;
  preparedBy: string;
  generatedAt: Date;
}): string {
  const planningNote =
    input.result.optionalPlanningTotalCents > 0
      ? " Optional planning costs are shown as a separate after-planning estimate."
      : "";
  return [
    composePreparedByLine(input.preparedBy),
    `Date: ${formatEstimateTimestamp(input.generatedAt)}`,
    `${TIER2_ASSUMPTIONS_SUMMARY}${planningNote} ${TIER2_REFERRAL}`,
    TIER1_DISCLAIMER,
  ].join("\n");
}

export function composeClipboardHandoff(input: {
  result: SellerNetProceedsResult;
  preparedBy: string;
  generatedAt: Date;
}): string {
  return `${composeResultNarration(input.result)}\n\n${composeTier2Disclosure(input)}`;
}

export function composeMailtoSummary(input: {
  result: SellerNetProceedsResult;
  preparedBy: string;
  generatedAt: Date;
}): string {
  const netWhole = formatWholeCad(input.result.estimatedNetProceedsCents);
  const netExact = formatExactCad(input.result.estimatedNetProceedsCents);
  const lines = [
    `Estimated net proceeds: ${netWhole} (${netExact} exact)`,
    `Selling price: ${formatWholeCad(input.result.inputs.sellingPriceCents)}`,
    `Mortgage payout: ${formatWholeCad(input.result.inputs.mortgagePayoutCents)}`,
    `Selling-cost deduction: ${formatWholeCad(input.result.displayedSellingCostDeductionCents)}`,
  ];
  if (input.result.optionalPlanningTotalCents > 0) {
    lines.push(
      `After optional planning costs: ${formatWholeCad(input.result.estimatedAfterPlanningCents)}`,
    );
  }
  lines.push(
    "",
    TIER1_DISCLAIMER,
    TAX_EXCLUSION_NOTE,
    "",
    composePreparedByLine(input.preparedBy),
    `Generated: ${formatEstimateTimestamp(input.generatedAt)}`,
    `Rule version ${input.result.ruleVersion} · ${input.result.jurisdiction}`,
    TIER2_REFERRAL,
  );
  return lines.join("\n");
}

export function composeMailtoHref(input: {
  result: SellerNetProceedsResult;
  preparedBy: string;
  generatedAt: Date;
}): string {
  const subject = "Seller net proceeds estimate";
  const body = composeMailtoSummary(input);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
