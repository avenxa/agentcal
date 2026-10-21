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

type FieldHandlers = {
  working: SellScenario;
  calc: SellerCalculatorUiState;
  onField: (name: CurrencyFieldName, value: string) => void;
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

export function SellingCostFields({
  working,
  calc,
  onField,
  onCommissionMode,
}: FieldHandlers & { onCommissionMode: (mode: CommissionMode) => void }) {
  const values = working.formValues;
  const mode = working.commissionMode;
  return (
    <div className="stack">
      <fieldset className="commission-fieldset">
        <legend className="amount-label">Total brokerage commission</legend>
        <div className="segmented" role="radiogroup" aria-label="Commission mode">
          <label className="segment">
            <input
              id="commissionPreset"
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

export function PlanningCostFields({ working, calc, onField }: FieldHandlers) {
  const values = working.formValues;
  return (
    <div className="stack">
      <p className="sc-muted-text">Optional planning costs do not change Estimated Net Proceeds.</p>
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
  );
}
