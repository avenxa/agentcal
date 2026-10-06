"use client";

import { useState } from "react";

import { formatExactCad, formatFieldCad, formatWholeCad } from "../lib/engine/currency";
import type { SellerCalculatorUiState } from "../lib/engine/sell-calculator-form";
import type { SellerNetProceedsResult } from "../lib/engine/sell";
import type {
  SellLifecycle,
  SellReadiness,
  SellScenario,
} from "../lib/scenarios/sell-scenario";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  EMPTY_RESULT_LABEL,
  NEGATIVE_RESULT_NOTE,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
  UNAVAILABLE_AMOUNT,
} from "../lib/sell-copy";
import { Chevron } from "./sell-build-panel";
import type { CostSections } from "./sell-scenario-editor";
import { formatTimestamp } from "./sell-scenario-entry";
import { ViewCalculationDialog } from "./view-calculation";

type ResultsProps = {
  working: SellScenario;
  calc: SellerCalculatorUiState;
  result: SellerNetProceedsResult | null;
  readiness: SellReadiness;
  lifecycle: SellLifecycle;
  usingSnapshot: boolean;
  calculatedAt: string;
  savedAt: string | null;
  onGoToField: (fieldId: string, open?: Array<keyof CostSections>) => void;
  onDuplicate: () => void;
};

function deduction(cents: number): string {
  if (cents > 0) return `− ${formatWholeCad(cents)}`;
  if (cents < 0) return `+ ${formatWholeCad(-cents)}`;
  return formatWholeCad(0);
}

type NextAction = {
  key: string;
  label: string;
  fieldId: string;
  open?: Array<keyof CostSections>;
};

function nextActions(readiness: SellReadiness): NextAction[] {
  const actions: NextAction[] = [];
  switch (readiness.nextGroup?.id) {
    case "price":
      actions.push({ key: "price", label: "Enter selling price", fieldId: "sellingPrice" });
      break;
    case "mortgage":
      actions.push({ key: "mortgage", label: "Add mortgage payout", fieldId: "mortgagePayout" });
      break;
    case "commission":
      actions.push({
        key: "commission",
        label: "Review commission",
        fieldId: "manualCommission",
        open: ["optional", "selling"],
      });
      break;
    case "selling-costs":
      actions.push({
        key: "selling",
        label: "Review selling costs",
        fieldId: "legalNotary",
        open: ["optional", "selling"],
      });
      break;
    case "planning-costs":
      actions.push({
        key: "planning",
        label: "Review planning costs",
        fieldId: "staging",
        open: ["optional", "planning"],
      });
      break;
  }
  if (readiness.nextGroup?.id !== "mortgage") {
    actions.push({ key: "edit-mortgage", label: "Edit mortgage payout", fieldId: "mortgagePayout" });
  }
  return actions;
}

export function SellResultsPanel({
  working,
  calc,
  result,
  readiness,
  lifecycle,
  usingSnapshot,
  calculatedAt,
  savedAt,
  onGoToField,
  onDuplicate,
}: ResultsProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [calculationOpen, setCalculationOpen] = useState(false);
  const negative = result !== null && result.estimatedNetProceedsCents < 0;
  const heroAmount = result
    ? formatWholeCad(result.estimatedNetProceedsCents)
    : calc.salePriceState === "empty"
      ? EMPTY_RESULT_LABEL
      : UNAVAILABLE_AMOUNT;
  const actions = nextActions(readiness);
  const planningCents = result?.optionalPlanningTotalCents ?? 0;
  const provenanceRule = result ? result.ruleVersion : working.ruleVersion;
  const savedLine = savedAt ? `Last saved ${formatTimestamp(savedAt)}` : "Not saved yet";

  return (
    <>
      <div className="sc-col sc-col-main">
        <section className="sc-card sc-order-1" data-testid="hero">
          <p className="sc-card-label">Estimated Net Proceeds</p>
          <p
            className={`sc-hero-amount tabular ${result ? "" : "sc-hero-empty"} ${negative ? "result-negative" : ""}`}
            data-testid="result-amount"
            aria-live="polite"
          >
            {heroAmount}
          </p>
          <p className="sc-muted-text" data-testid="hero-provenance">
            {result
              ? `Based on current assumptions · ${result.jurisdiction} · Rule ${result.ruleVersion}`
              : "No authoritative result for the current inputs."}
          </p>
          {!result && calc.salePriceState === "valid" ? (
            <p className="field-error" data-testid="invalid-inputs-note">
              Fix the highlighted amounts in Build to see a result.
            </p>
          ) : null}
          {negative ? (
            <p className="field-error" data-testid="negative-note">
              {NEGATIVE_RESULT_NOTE}
            </p>
          ) : null}
          {calc.mortgageWarning ? (
            <p className="field-warning" data-testid="results-mortgage-warning">
              {calc.mortgageWarning}
            </p>
          ) : null}
          <p className="sc-caption" data-testid="result-disclaimer">
            {TIER1_DISCLAIMER}
          </p>
        </section>

        <section className="sc-card sc-order-3" aria-labelledby="breakdown-title">
          <h2 id="breakdown-title" className="sc-card-title">
            Key breakdown
          </h2>
          {result ? (
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
          ) : (
            <p className="sc-muted-text">The breakdown appears once there is a valid result.</p>
          )}
          <button
            type="button"
            className="secondary-button"
            data-testid="view-calculation"
            disabled={result === null}
            onClick={() => setCalculationOpen(true)}
          >
            View calculation
          </button>
        </section>

        <section className="sc-card sc-order-4">
          <button
            type="button"
            className="sc-disclosure"
            aria-expanded={detailsOpen}
            aria-controls="assumptions-details"
            data-testid="details-toggle"
            onClick={() => setDetailsOpen((open) => !open)}
          >
            <span className="sc-disclosure-title">Assumptions &amp; details</span>
            <Chevron open={detailsOpen} />
          </button>
          <p className="sc-muted-text">
            Exact inputs, rule authority and caveats stay available without competing with the
            primary result.
          </p>
          <div id="assumptions-details" hidden={!detailsOpen} className="sc-subsection">
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
                <dd data-testid="detail-rule-version">{provenanceRule}</dd>
              </div>
              <div className="sc-breakdown-row">
                <dt>{usingSnapshot ? "Saved result" : "Recalculated"}</dt>
                <dd>{formatTimestamp(usingSnapshot ? savedAt : calculatedAt)}</dd>
              </div>
            </dl>
            <p className="sc-caption">{COMMISSION_NEGOTIABLE_NOTICE}</p>
            <p className="sc-caption">{TAX_EXCLUSION_NOTE}</p>
          </div>
        </section>
      </div>

      <div className="sc-col sc-col-side">
        <section className="sc-banner sc-order-2" data-testid="next-actions" aria-label="Next best actions">
          <p className="sc-banner-title">Next best action</p>
          {readiness.nextGroup === null ? (
            <p className="sc-muted-text">All five key assumptions are confirmed.</p>
          ) : (
            <p className="sc-muted-text">
              {readiness.confirmedCount} of {readiness.total} key assumptions confirmed.
            </p>
          )}
          <div className="sc-inline-actions">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                className="sc-chip-button"
                data-testid={`action-${action.key}`}
                onClick={() => onGoToField(action.fieldId, action.open)}
              >
                {action.label}
              </button>
            ))}
          </div>
        </section>

        <section className="sc-card sc-order-5" data-testid="save-state">
          <p className={`sc-status-heading ${lifecycle === "Saved" ? "sc-status-ok" : ""}`}>
            {lifecycle}
          </p>
          <p className="sc-muted-text">{savedLine}</p>
          <p className="sc-muted-text" data-testid="rule-version">
            {working.jurisdiction} · {provenanceRule}
          </p>
        </section>

        <button
          type="button"
          className="secondary-button sc-order-6"
          data-testid="duplicate-scenario"
          onClick={onDuplicate}
        >
          Duplicate Scenario
        </button>
      </div>

      <ViewCalculationDialog
        open={calculationOpen}
        onClose={() => setCalculationOpen(false)}
        result={result}
      />
    </>
  );
}
