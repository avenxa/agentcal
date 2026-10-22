"use client";

import { useState } from "react";

import { formatExactCad, formatWholeCad } from "../lib/engine/currency";
import type { SellerNetProceedsResult } from "../lib/engine/sell";
import type { SellLifecycle, SellScenario } from "../lib/scenarios/sell-scenario";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  NEGATIVE_RESULT_NOTE,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
} from "../lib/sell-copy";
import { formatTimestamp } from "./sell-scenario-entry";

type LedgerRow = { key: string; label: string; detail?: string; amount: string };

/** Deduction shown with a leading minus; a negative deduction (credit) shows as a plus. */
function deduction(cents: number): string {
  if (cents > 0) return `−${formatExactCad(cents)}`;
  if (cents < 0) return `+${formatExactCad(-cents)}`;
  return `−${formatExactCad(0)}`;
}

/** Signed adjustment where positive adds to seller proceeds. */
function adjustment(cents: number): string {
  if (cents > 0) return `+${formatExactCad(cents)}`;
  if (cents < 0) return `−${formatExactCad(-cents)}`;
  return formatExactCad(0);
}

function buildLedger(result: SellerNetProceedsResult): LedgerRow[] {
  const manual = result.commissionMode === "manual";
  const rows: LedgerRow[] = [
    {
      key: "selling-price",
      label: "Selling price",
      amount: formatExactCad(result.inputs.sellingPriceCents),
    },
    {
      key: "commission",
      label: "Commission",
      detail: manual
        ? "Manual amount · negotiable"
        : `${COMMISSION_PRESET_LABEL} · ${COMMISSION_PRESET_FORMULA} · negotiable`,
      amount: deduction(result.commissionBeforeGstCents),
    },
    {
      key: "gst",
      label: "GST on commission (5%)",
      amount: deduction(result.gstOnCommissionCents),
    },
    {
      key: "mortgage",
      label: "Mortgage payout",
      amount: deduction(result.inputs.mortgagePayoutCents),
    },
  ];

  const other: LedgerRow[] = [];
  const pushDeduction = (key: string, label: string, cents: number) => {
    if (cents !== 0) other.push({ key, label, amount: deduction(cents) });
  };
  pushDeduction("legal", "Legal/notary, incl. GST", result.inputs.legalNotaryIncludingGstCents);
  pushDeduction("discharge", "Mortgage discharge fee", result.inputs.mortgageDischargeFeeCents);
  pushDeduction(
    "prepayment",
    "Prepayment penalty",
    result.inputs.mortgagePrepaymentPenaltyCents,
  );
  if (result.propertyTaxAdjustmentCents !== 0) {
    other.push({
      key: "property-tax",
      label: "Property-tax adjustment",
      amount: adjustment(result.propertyTaxAdjustmentCents),
    });
  }
  if (result.otherClosingAdjustmentsCents !== 0) {
    other.push({
      key: "other-adjustments",
      label: "Other closing adjustments",
      amount: adjustment(result.otherClosingAdjustmentsCents),
    });
  }
  if (other.length === 0) {
    rows.push({
      key: "other-closing",
      label: "Other closing costs & adjustments",
      amount: formatExactCad(0),
    });
  } else {
    rows.push(...other);
  }
  return rows;
}

type ResultsProps = {
  working: SellScenario;
  result: SellerNetProceedsResult;
  lifecycle: SellLifecycle;
  usingSnapshot: boolean;
  calculatedAt: string;
  savedAt: string | null;
  mortgageWarning: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
};

export function SellResultsView({
  working,
  result,
  lifecycle,
  usingSnapshot,
  calculatedAt,
  savedAt,
  mortgageWarning,
  onEdit,
  onDuplicate,
}: ResultsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const net = result.estimatedNetProceedsCents;
  const negative = net < 0;
  const exact = formatExactCad(net);
  const rounded = formatWholeCad(net);
  const roundingDiffers = net % 100 !== 0;
  const ledger = buildLedger(result);
  const status = usingSnapshot ? "Saved result" : "Preliminary";

  return (
    <div className="v2-stack" data-testid="results-view">
      <div className="v2-results-top">
        <h2 className="v2-mode-heading" id="mode-heading" tabIndex={-1}>
          SELL · Results
        </h2>
        <button
          type="button"
          className="secondary-button v2-edit-button"
          data-testid="edit-inputs"
          onClick={onEdit}
        >
          Edit inputs
        </button>
      </div>
      <p className="sc-muted-text">
        <span className="sc-pill" data-testid="result-status">
          {status}
        </span>{" "}
        {lifecycle} · {working.jurisdiction}
      </p>

      <section className="sc-card" aria-labelledby="ledger-title">
        <h3 id="ledger-title" className="sc-card-title">
          How we got there
        </h3>
        <ol className="v2-ledger" data-testid="ledger">
          {ledger.map((row) => (
            <li key={row.key} className="v2-ledger-row" data-testid="ledger-row">
              <div>
                <p className="v2-ledger-label">{row.label}</p>
                {row.detail ? <p className="v2-ledger-detail">{row.detail}</p> : null}
              </div>
              <p className="v2-ledger-amount tabular">{row.amount}</p>
            </li>
          ))}
          <li className="v2-ledger-final" data-testid="estimated-net">
            <div>
              <p className="v2-ledger-label">Estimated net proceeds</p>
              <p className="v2-ledger-detail" data-testid="net-exact">
                Exact {exact}
                {roundingDiffers ? " · rounded to the nearest dollar" : ""}
              </p>
            </div>
            <p
              className={`v2-ledger-net tabular ${negative ? "result-negative" : ""}`}
              data-testid="result-amount"
            >
              {rounded}
            </p>
          </li>
        </ol>
        {negative ? (
          <p className="field-error" data-testid="negative-note">
            {NEGATIVE_RESULT_NOTE}
          </p>
        ) : null}
        {mortgageWarning ? (
          <p className="field-warning" data-testid="results-mortgage-warning">
            {mortgageWarning}
          </p>
        ) : null}
        <p className="sc-caption">{COMMISSION_NEGOTIABLE_NOTICE}</p>
      </section>

      {result.optionalPlanningTotalCents > 0 ? (
        <section className="sc-card" data-testid="planning-section">
          <h3 className="sc-card-title">Planning costs (not included above)</h3>
          <dl className="sc-breakdown">
            <div className="sc-breakdown-row" data-testid="planning-row">
              <dt>Optional planning costs</dt>
              <dd className="tabular">{deduction(result.optionalPlanningTotalCents)}</dd>
            </div>
            <div className="sc-breakdown-row" data-testid="after-planning-row">
              <dt>After planning costs</dt>
              <dd className="tabular">{formatWholeCad(result.estimatedAfterPlanningCents)}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="sc-card">
        <button
          type="button"
          className="sc-disclosure"
          aria-expanded={detailsOpen}
          aria-controls="calc-details"
          data-testid="details-toggle"
          onClick={() => setDetailsOpen((open) => !open)}
        >
          <span className="sc-disclosure-title">Calculation details</span>
          <span className="sc-disclosure-icon" aria-hidden="true">
            {detailsOpen ? "−" : "+"}
          </span>
        </button>
        <div id="calc-details" hidden={!detailsOpen} className="sc-subsection">
          <dl className="sc-breakdown">
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
              <dd data-testid="detail-rule-version">{result.ruleVersion}</dd>
            </div>
            <div className="sc-breakdown-row">
              <dt>{usingSnapshot ? "Saved result" : "Calculated"}</dt>
              <dd>{formatTimestamp(usingSnapshot ? savedAt : calculatedAt)}</dd>
            </div>
          </dl>
          <p className="sc-caption">{TAX_EXCLUSION_NOTE}</p>
        </div>
      </section>

      <p className="sc-caption" data-testid="result-disclaimer">
        {TIER1_DISCLAIMER}
      </p>

      <button
        type="button"
        className="secondary-button"
        data-testid="duplicate-scenario"
        onClick={onDuplicate}
      >
        Duplicate Scenario
      </button>
    </div>
  );
}
