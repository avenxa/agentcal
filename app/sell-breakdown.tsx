"use client";

import { formatExactCad, formatFieldCad, formatWholeCad } from "../lib/engine/currency";
import type { SellerNetProceedsResult } from "../lib/engine/sell";
import type { SellScenario } from "../lib/scenarios/sell-scenario";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  TAX_EXCLUSION_NOTE,
  UNAVAILABLE_AMOUNT,
} from "../lib/sell-copy";
import { formatTimestamp } from "./sell-scenario-entry";

function deduction(cents: number): string {
  if (cents > 0) return `− ${formatWholeCad(cents)}`;
  if (cents < 0) return `+ ${formatWholeCad(-cents)}`;
  return formatWholeCad(0);
}

export function KeyBreakdown({ result }: { result: SellerNetProceedsResult }) {
  const planningCents = result.optionalPlanningTotalCents;
  return (
    <dl className="sc-breakdown" data-testid="key-breakdown">
      <div className="sc-breakdown-row">
        <dt>Selling price</dt>
        <dd className="tabular">{formatWholeCad(result.inputs.sellingPriceCents)}</dd>
      </div>
      <div className="sc-breakdown-row">
        <dt>Mortgage payout</dt>
        <dd className="tabular">{deduction(result.inputs.mortgagePayoutCents)}</dd>
      </div>
      <div className="sc-breakdown-row">
        <dt>Selling costs</dt>
        <dd className="tabular">{deduction(result.displayedSellingCostDeductionCents)}</dd>
      </div>
      {planningCents > 0 ? (
        <>
          <div className="sc-breakdown-row" data-testid="planning-row">
            <dt>Planning costs</dt>
            <dd className="tabular">{deduction(planningCents)}</dd>
          </div>
          <div className="sc-breakdown-row" data-testid="after-planning-row">
            <dt>After planning costs</dt>
            <dd className="tabular">{formatWholeCad(result.estimatedAfterPlanningCents)}</dd>
          </div>
        </>
      ) : null}
    </dl>
  );
}

export function CalculationDetails({
  working,
  result,
  usingSnapshot,
  calculatedAt,
  savedAt,
}: {
  working: SellScenario;
  result: SellerNetProceedsResult | null;
  usingSnapshot: boolean;
  calculatedAt: string;
  savedAt: string | null;
}) {
  const ruleVersion = result ? result.ruleVersion : working.ruleVersion;
  return (
    <>
      <dl className="sc-breakdown">
        <div className="sc-breakdown-row">
          <dt>Commission</dt>
          <dd>
            {working.commissionMode === "bc-preset"
              ? `${COMMISSION_PRESET_LABEL} · ${COMMISSION_PRESET_FORMULA}`
              : "Manual amount"}
          </dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>Total brokerage commission</dt>
          <dd className="tabular">
            {result ? formatFieldCad(result.commissionBeforeGstCents) : UNAVAILABLE_AMOUNT}
          </dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>GST on commission</dt>
          <dd className="tabular">
            {result ? formatExactCad(result.gstOnCommissionCents) : UNAVAILABLE_AMOUNT}
          </dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>Jurisdiction</dt>
          <dd data-testid="detail-jurisdiction">{working.jurisdiction}</dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>Locale</dt>
          <dd>{working.locale}</dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>Rule version</dt>
          <dd data-testid="detail-rule-version">{ruleVersion}</dd>
        </div>
        <div className="sc-breakdown-row">
          <dt>{usingSnapshot ? "Saved result" : "Recalculated"}</dt>
          <dd>{formatTimestamp(usingSnapshot ? savedAt : calculatedAt)}</dd>
        </div>
      </dl>
      <p className="sc-caption">{COMMISSION_NEGOTIABLE_NOTICE}</p>
      <p className="sc-caption">{TAX_EXCLUSION_NOTE}</p>
    </>
  );
}
