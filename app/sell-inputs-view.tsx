"use client";

import { formatWholeCad } from "../lib/engine/currency";
import {
  OPTIONAL_FIELD_NAMES,
  type CurrencyFieldName,
  type SellerCalculatorUiState,
} from "../lib/engine/sell-calculator-form";
import type { CommissionMode } from "../lib/engine/sell";
import type { SellScenario } from "../lib/scenarios/sell-scenario";
import {
  COMMISSION_NEGOTIABLE_NOTICE,
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  SALE_PRICE_ERROR,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
} from "../lib/sell-copy";
import { CurrencyField } from "./currency-field";

const OPTIONAL_LABELS: Record<(typeof OPTIONAL_FIELD_NAMES)[number], string> = {
  staging: "Staging/preparation",
  repairs: "Repairs/renovations",
  inspectionAppraisal: "Inspection/appraisal",
  cleaning: "Cleaning",
  movingStorage: "Moving/storage",
  overlapHousing: "Overlap or temporary-housing costs",
  otherPlanningCosts: "Other planning costs",
};

export type CostSections = {
  selling: boolean;
  planning: boolean;
};

function Chevron({ open }: { open: boolean }) {
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

type InputsProps = {
  working: SellScenario;
  calc: SellerCalculatorUiState;
  sections: CostSections;
  /** True after a Calculate attempt, so an empty price can show its error. */
  attempted: boolean;
  /** True once this Scenario has shown results, so the CTA reads "Recalculate". */
  hasCalculated: boolean;
  onField: (name: CurrencyFieldName, value: string) => void;
  onMortgageBlur: () => void;
  onCommissionMode: (mode: CommissionMode) => void;
  onToggleSection: (section: keyof CostSections) => void;
  onCalculate: () => void;
};

/**
 * Inputs mode. Deliberately renders no monetary result of any kind: the
 * deterministic engine state is only used for field errors and the mortgage
 * warning, never for an amount.
 */
export function SellInputsView({
  working,
  calc,
  sections,
  attempted,
  hasCalculated,
  onField,
  onMortgageBlur,
  onCommissionMode,
  onToggleSection,
  onCalculate,
}: InputsProps) {
  const values = working.formValues;
  const priceError =
    calc.fieldErrors.sellingPrice ??
    (attempted && calc.salePriceState === "empty" ? SALE_PRICE_ERROR : undefined);

  return (
    <form
      className="v2-stack"
      data-testid="inputs-view"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        onCalculate();
      }}
    >
      <h2 className="v2-mode-heading" id="mode-heading" tabIndex={-1}>
        SELL · Inputs
      </h2>

      <section className="sc-card" aria-labelledby="essential-title">
        <h3 id="essential-title" className="sc-card-title">
          Your sale
        </h3>
        <CurrencyField
          id="sellingPrice"
          label="Expected selling price (CAD)"
          badge="Required"
          value={values.sellingPrice}
          error={priceError}
          emptyMeansBlank
          onChange={(value) => onField("sellingPrice", value)}
        />
        <CurrencyField
          id="mortgagePayout"
          label="Mortgage payout (CAD)"
          badge="Optional"
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

      <section className="sc-card">
        <button
          type="button"
          className="accordion-trigger"
          aria-expanded={sections.selling}
          aria-controls="selling-costs-panel"
          data-testid="selling-toggle"
          onClick={() => onToggleSection("selling")}
        >
          <span>Selling costs &amp; commission</span>
          <Chevron open={sections.selling} />
        </button>
        <p className="sc-muted-text">
          Estimated commission uses the BC preset unless changed; actual rates are negotiable.
        </p>
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
            Planning costs are shown separately and are not part of the net proceeds estimate.
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
      </section>

      <button type="submit" className="sc-primary-button" data-testid="calculate">
        {hasCalculated ? "Recalculate & show results" : "Calculate net proceeds"}
      </button>

      <p className="sc-caption" data-testid="tier1-disclaimer">
        {TIER1_DISCLAIMER} {TAX_EXCLUSION_NOTE}
      </p>
    </form>
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
      ) : null}
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
