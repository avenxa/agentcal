"use client";

import { formatExactCad, formatWholeCad } from "../lib/engine/currency";
import {
  OPTIONAL_FIELD_NAMES,
  type CurrencyFieldName,
  type SellerCalculatorUiState,
} from "../lib/engine/sell-calculator-form";
import type { CommissionMode, SellerNetProceedsResult } from "../lib/engine/sell";
import type { SellReadiness, SellScenario } from "../lib/scenarios/sell-scenario";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
} from "../lib/sell-copy";
import { CurrencyField } from "./currency-field";
import type { CostSections } from "./sell-scenario-editor";
import { formatTimestamp } from "./sell-scenario-entry";

const OPTIONAL_LABELS: Record<(typeof OPTIONAL_FIELD_NAMES)[number], string> = {
  staging: "Staging/preparation",
  repairs: "Repairs/renovations",
  inspectionAppraisal: "Inspection/appraisal",
  cleaning: "Cleaning",
  movingStorage: "Moving/storage",
  overlapHousing: "Overlap or temporary-housing costs",
  otherPlanningCosts: "Other planning costs",
};

export function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`chevron ${open ? "chevron-open" : ""}`}
    >
      <path
        d="M5 7.5 10 12.5 15 7.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function nextHint(readiness: SellReadiness): string {
  switch (readiness.nextGroup?.id) {
    case "price":
      return "Enter the expected selling price to see a result.";
    case "mortgage":
      return "Add the mortgage balance to improve the estimate.";
    case "commission":
      return "Check the commission amount.";
    case "selling-costs":
      return "Review selling costs to strengthen this estimate.";
    case "planning-costs":
      return "Review planning costs to complete the picture.";
    default:
      return "All five key assumptions are confirmed.";
  }
}

type BuildProps = {
  working: SellScenario;
  calc: SellerCalculatorUiState;
  result: SellerNetProceedsResult | null;
  readiness: SellReadiness;
  sections: CostSections;
  usingSnapshot: boolean;
  calculatedAt: string;
  savedAt: string | null;
  onField: (name: CurrencyFieldName, value: string) => void;
  onMortgageBlur: () => void;
  onCommissionMode: (mode: CommissionMode) => void;
  onToggleSection: (section: keyof CostSections) => void;
  onViewResults: () => void;
};

export function SellBuildPanel({
  working,
  calc,
  result,
  readiness,
  sections,
  usingSnapshot,
  calculatedAt,
  savedAt,
  onField,
  onMortgageBlur,
  onCommissionMode,
  onToggleSection,
  onViewResults,
}: BuildProps) {
  const values = working.formValues;
  const complete = readiness.confirmedCount === readiness.total;
  const resultReady = result !== null;

  return (
    <>
      <div className="sc-col sc-col-main">
        <section className="sc-banner sc-order-1" data-testid="readiness" aria-label="Key assumptions">
          <div className="sc-banner-row">
            <p className="sc-banner-title" data-testid="readiness-count">
              {readiness.confirmedCount} of {readiness.total} key assumptions confirmed
            </p>
            <span className="sc-pill">{complete ? "Complete" : "In progress"}</span>
          </div>
          <p className="sc-muted-text">
            {resultReady && !complete
              ? `The current result is valid. ${nextHint(readiness)}`
              : nextHint(readiness)}
          </p>
        </section>

        <section className="sc-card sc-order-2" aria-labelledby="essential-title">
          <h2 id="essential-title" className="sc-card-title">
            Essential inputs
          </h2>
          <CurrencyField
            id="sellingPrice"
            label="Expected selling price"
            badge="Required"
            hint="Used to calculate estimated proceeds."
            value={values.sellingPrice}
            error={calc.fieldErrors.sellingPrice}
            emptyMeansBlank
            onChange={(value) => onField("sellingPrice", value)}
          />
          <CurrencyField
            id="mortgagePayout"
            label="Mortgage payout"
            badge="Key input"
            hint="Current payout or best estimate. $0 is valid."
            value={values.mortgagePayout}
            error={calc.fieldErrors.mortgagePayout}
            onChange={(value) => onField("mortgagePayout", value)}
            onBlur={onMortgageBlur}
          />
          {calc.mortgageWarning ? (
            <p className="field-warning" role="status" data-testid="mortgage-warning">
              {calc.mortgageWarning}
            </p>
          ) : null}
        </section>

        <section className="sc-card sc-order-3">
          <button
            type="button"
            className="sc-disclosure"
            aria-expanded={sections.optional}
            aria-controls="optional-costs-panel"
            data-testid="optional-toggle"
            onClick={() => onToggleSection("optional")}
          >
            <span className="sc-disclosure-title">Optional selling &amp; planning costs</span>
            <span className="sc-disclosure-icon" aria-hidden="true">
              {sections.optional ? "−" : "+"}
            </span>
          </button>
          <p className="sc-muted-text">
            Commission, legal/notary, tax adjustments, staging, repairs and moving costs. These do
            not block the first result.
          </p>
          <div id="optional-costs-panel" hidden={!sections.optional} className="sc-subsections">
            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={sections.selling}
              aria-controls="selling-costs-panel"
              data-testid="selling-toggle"
              onClick={() => onToggleSection("selling")}
            >
              <span>Commission &amp; selling costs</span>
              <Chevron open={sections.selling} />
            </button>
            <div id="selling-costs-panel" hidden={!sections.selling} className="sc-subsection">
              <SellingCosts
                working={working}
                calc={calc}
                onField={onField}
                onCommissionMode={onCommissionMode}
              />
            </div>

            <button
              type="button"
              className="accordion-trigger"
              aria-expanded={sections.planning}
              aria-controls="planning-costs-panel"
              data-testid="planning-toggle"
              onClick={() => onToggleSection("planning")}
            >
              <span>Planning costs</span>
              <Chevron open={sections.planning} />
            </button>
            <div id="planning-costs-panel" hidden={!sections.planning} className="sc-subsection">
              <p className="sc-muted-text">
                Optional planning costs do not change Estimated Net Proceeds.
              </p>
              <p className="planning-total tabular" data-testid="planning-total">
                Optional total{" "}
                {calc.optionalPlanningTotalCents === null
                  ? "—"
                  : formatWholeCad(calc.optionalPlanningTotalCents)}
              </p>
              {OPTIONAL_FIELD_NAMES.map((fieldName) => (
                <CurrencyField
                  key={fieldName}
                  id={fieldName}
                  label={OPTIONAL_LABELS[fieldName]}
                  value={values[fieldName]}
                  error={calc.fieldErrors[fieldName]}
                  onChange={(value) => onField(fieldName, value)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="sc-preview sc-order-4 sc-mobile-only" data-testid="result-preview" aria-live="polite">
          <p className="sc-preview-label">Result preview</p>
          <p className="sc-preview-text">
            {result
              ? complete
                ? "Valid result available."
                : `Valid result available — ${nextHint(readiness).toLowerCase()}`
              : "No result yet — a valid selling price is needed."}
          </p>
        </section>

        <p className="sc-caption sc-order-5" data-testid="tier1-disclaimer">
          {TIER1_DISCLAIMER} {TAX_EXCLUSION_NOTE}
        </p>
      </div>

      <div className="sc-col sc-col-side">
        <section className="sc-card sc-order-6 sc-side-result sc-desktop-only" data-testid="side-result">
          <p className="sc-card-label">Estimated Net Proceeds</p>
          <p className={`sc-side-amount tabular ${result && result.estimatedNetProceedsCents < 0 ? "result-negative" : ""}`}>
            {result ? formatWholeCad(result.estimatedNetProceedsCents) : "—"}
          </p>
          <p className="sc-muted-text">
            {result
              ? `Based on current assumptions · ${result.jurisdiction}`
              : "Add a valid selling price to calculate."}
          </p>
        </section>

        <section className="sc-card sc-order-7">
          <p className={`sc-status-heading ${resultReady ? "sc-status-ok" : ""}`}>
            {resultReady ? "Ready to review" : "Needs a selling price"}
          </p>
          <p className="sc-muted-text">
            {resultReady
              ? complete
                ? "Result is valid and all key assumptions are confirmed."
                : `Result is valid with current inputs. ${5 - readiness.confirmedCount} key assumption${5 - readiness.confirmedCount === 1 ? "" : "s"} remain.`
              : "Readiness never blocks a result; only the selling price does."}
          </p>
          <button
            type="button"
            className="sc-primary-button sc-inline-button"
            data-testid="view-results"
            disabled={!resultReady}
            onClick={onViewResults}
          >
            View Results
          </button>
        </section>

        <section className="sc-card sc-order-8" data-testid="provenance">
          <p className="sc-status-heading">Calculation provenance</p>
          <p className="sc-muted-text">Jurisdiction: {working.jurisdiction}</p>
          <p className="sc-muted-text" data-testid="rule-version">
            Rule version: {result ? result.ruleVersion : working.ruleVersion}
          </p>
          <p className="sc-muted-text">
            {usingSnapshot
              ? `Saved result from ${formatTimestamp(savedAt)}`
              : `Recalculated ${formatTimestamp(calculatedAt)}`}
          </p>
          {result ? (
            <p className="sc-muted-text">
              Commission {formatExactCad(result.commissionBeforeGstCents)} + GST{" "}
              {formatExactCad(result.gstOnCommissionCents)}
            </p>
          ) : null}
        </section>
      </div>
    </>
  );
}

function SellingCosts({
  working,
  calc,
  onField,
  onCommissionMode,
}: {
  working: SellScenario;
  calc: SellerCalculatorUiState;
  onField: (name: CurrencyFieldName, value: string) => void;
  onCommissionMode: (mode: CommissionMode) => void;
}) {
  const values = working.formValues;
  const mode = working.commissionMode;
  return (
    <div className="stack">
      <fieldset className="commission-fieldset">
        <legend className="amount-label">Total brokerage commission</legend>
        <div className="segmented" role="radiogroup" aria-label="Commission mode">
          <label className="segment">
            <input
              type="radio"
              name="commissionMode"
              value="bc-preset"
              checked={mode === "bc-preset"}
              onChange={() => onCommissionMode("bc-preset")}
            />
            {COMMISSION_PRESET_LABEL}
          </label>
          <label className="segment">
            <input
              type="radio"
              name="commissionMode"
              value="manual"
              checked={mode === "manual"}
              onChange={() => onCommissionMode("manual")}
            />
            Manual amount
          </label>
        </div>
        <p className="amount-hint">{COMMISSION_PRESET_FORMULA}</p>
        <p className="amount-hint">{COMMISSION_NEGOTIABLE_NOTICE}</p>
      </fieldset>
      {mode === "manual" ? (
        <CurrencyField
          id="manualCommission"
          label="Manual commission amount"
          value={values.manualCommission}
          error={calc.fieldErrors.manualCommission}
          onChange={(value) => onField("manualCommission", value)}
        />
      ) : (
        <CurrencyField
          id="presetCommission"
          label="Preset commission"
          value=""
          readOnly
          readOnlyCents={calc.commissionBeforeGstCents}
          onChange={() => undefined}
        />
      )}
      <CurrencyField
        id="gstOnCommission"
        label="GST on commission"
        value=""
        readOnly
        readOnlyCents={calc.gstOnCommissionCents}
        onChange={() => undefined}
      />
      <CurrencyField
        id="legalNotary"
        label="Legal/notary, incl. GST"
        value={values.legalNotary}
        error={calc.fieldErrors.legalNotary}
        onChange={(value) => onField("legalNotary", value)}
      />
      <CurrencyField
        id="mortgageDischarge"
        label="Mortgage discharge fee"
        value={values.mortgageDischarge}
        error={calc.fieldErrors.mortgageDischarge}
        onChange={(value) => onField("mortgageDischarge", value)}
      />
      <CurrencyField
        id="prepaymentPenalty"
        label="Prepayment penalty"
        value={values.prepaymentPenalty}
        error={calc.fieldErrors.prepaymentPenalty}
        onChange={(value) => onField("prepaymentPenalty", value)}
      />
      <CurrencyField
        id="propertyTaxAdjustment"
        label="Property-tax adjustment"
        hint="Positive adds to seller proceeds; negative reduces proceeds."
        value={values.propertyTaxAdjustment}
        error={calc.fieldErrors.propertyTaxAdjustment}
        allowNegative
        onChange={(value) => onField("propertyTaxAdjustment", value)}
      />
      <CurrencyField
        id="otherClosingAdjustments"
        label="Other closing adjustments"
        hint="Seller concessions or adviser-supplied tax adjustments may be entered as negative values."
        value={values.otherClosingAdjustments}
        error={calc.fieldErrors.otherClosingAdjustments}
        allowNegative
        onChange={(value) => onField("otherClosingAdjustments", value)}
      />
    </div>
  );
}
