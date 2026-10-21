"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { CurrencyFieldName } from "../lib/engine/sell-calculator-form";
import {
  deriveCalculation,
  deriveLifecycle,
  deriveReadiness,
  hasSameEditableState,
  resolveDisplayedResult,
  saveSellScenario,
  type SellReadiness,
  type SellReviewState,
  type SellScenario,
} from "../lib/scenarios/sell-scenario";
import type { SaveResult } from "../lib/scenarios/sell-scenario-storage";
import type { CommissionMode } from "../lib/engine/sell";
import { formatWholeCad } from "../lib/engine/currency";
import {
  EMPTY_RESULT_LABEL,
  NEGATIVE_RESULT_NOTE,
  TIER1_DISCLAIMER,
  TAX_EXCLUSION_NOTE,
  UNAVAILABLE_AMOUNT,
} from "../lib/sell-copy";
import { CalculationDetails, KeyBreakdown } from "./sell-breakdown";
import { Chevron, PlanningCostFields, SellingCostFields } from "./sell-cost-fields";
import { CurrencyField } from "./currency-field";
import { formatTimestamp } from "./sell-scenario-entry";
import { ViewCalculationDialog } from "./view-calculation";

export type CostSections = {
  selling: boolean;
  planning: boolean;
};

type EditorProps = {
  initialWorking: SellScenario;
  initialBaseline: SellScenario | null;
  startsUnsaved: boolean;
  onSave: (scenario: SellScenario) => SaveResult;
  onBack: () => void;
  onDuplicate: (source: SellScenario) => void;
};

type NextAction = {
  key: string;
  label: string;
  fieldId: string;
  open?: Array<keyof CostSections>;
};

function nextActions(
  readiness: SellReadiness,
  mode: CommissionMode,
): NextAction[] {
  switch (readiness.nextGroup?.id) {
    case "price":
      return [{ key: "price", label: "Enter selling price", fieldId: "sellingPrice" }];
    case "mortgage":
      return [{ key: "mortgage", label: "Add mortgage payout", fieldId: "mortgagePayout" }];
    case "commission":
      return [
        {
          key: "commission",
          label: "Review commission",
          fieldId: mode === "manual" ? "manualCommission" : "commissionPreset",
          open: ["selling"],
        },
      ];
    case "selling-costs":
      return [
        { key: "selling", label: "Review selling costs", fieldId: "legalNotary", open: ["selling"] },
      ];
    case "planning-costs":
      return [
        { key: "planning", label: "Review planning costs", fieldId: "staging", open: ["planning"] },
      ];
    default:
      return [];
  }
}

export function SellScenarioEditor({
  initialWorking,
  initialBaseline,
  startsUnsaved,
  onSave,
  onBack,
  onDuplicate,
}: EditorProps) {
  const [working, setWorking] = useState(initialWorking);
  const [baseline, setBaseline] = useState(initialBaseline);
  const [sections, setSections] = useState<CostSections>({ selling: false, planning: false });
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [calculationOpen, setCalculationOpen] = useState(false);
  const [leavePrompt, setLeavePrompt] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [calculatedAt, setCalculatedAt] = useState(() => new Date().toISOString());
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const [pristine] = useState(initialWorking);

  const calc = useMemo(() => deriveCalculation(working), [working]);
  const result = resolveDisplayedResult(working, baseline, calc);
  const lifecycle = deriveLifecycle(working, baseline, result);
  const readiness = deriveReadiness(working, calc);
  const usingSnapshot = result !== null && result === baseline?.savedResult;
  const hasUnsavedChanges = baseline
    ? !hasSameEditableState(working, baseline)
    : startsUnsaved || !hasSameEditableState(working, pristine);
  const values = working.formValues;
  const negative = result !== null && result.estimatedNetProceedsCents < 0;
  const actions = nextActions(readiness, working.commissionMode);
  const complete = readiness.nextGroup === null;

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    document.getElementById(id)?.focus();
  }, [focusTick]);

  function touch(update: (current: SellScenario) => SellScenario) {
    setWorking(update);
    setCalculatedAt(new Date().toISOString());
    setSaveMessage(null);
    setSaveError(null);
  }

  function setField(name: CurrencyFieldName, value: string) {
    touch((current) => ({
      ...current,
      formValues: { ...current.formValues, [name]: value },
      review:
        name === "mortgagePayout" && !current.review.mortgage
          ? { ...current.review, mortgage: true }
          : current.review,
    }));
  }

  function markReviewed(key: keyof SellReviewState) {
    setWorking((current) =>
      current.review[key]
        ? current
        : { ...current, review: { ...current.review, [key]: true } },
    );
  }

  function toggleSection(section: keyof CostSections) {
    const opening = !sections[section];
    setSections((current) => ({ ...current, [section]: opening }));
    if (opening && section === "selling") markReviewed("sellingCosts");
    if (opening && section === "planning") markReviewed("planningCosts");
  }

  function goToField(action: NextAction) {
    if (action.open) {
      setSections((current) => {
        const next = { ...current };
        for (const section of action.open ?? []) next[section] = true;
        return next;
      });
      if (action.open.includes("selling")) markReviewed("sellingCosts");
      if (action.open.includes("planning")) markReviewed("planningCosts");
    }
    pendingFocus.current = action.fieldId;
    setFocusTick((tick) => tick + 1);
  }

  function handleSave() {
    const saved = saveSellScenario(working, calc, new Date(), baseline);
    const outcome = onSave(saved);
    if (outcome.ok) {
      setWorking(saved);
      setBaseline(saved);
      setSaveError(null);
      setSaveMessage("Scenario saved in this browser.");
    } else {
      setSaveMessage(null);
      setSaveError(`Could not save: ${outcome.reason}`);
    }
  }

  function handleBack() {
    if (hasUnsavedChanges) {
      setLeavePrompt(true);
    } else {
      onBack();
    }
  }

  const saveDisabled = baseline !== null && !hasUnsavedChanges;
  const heroAmount = result
    ? formatWholeCad(result.estimatedNetProceedsCents)
    : calc.salePriceState === "empty"
      ? EMPTY_RESULT_LABEL
      : UNAVAILABLE_AMOUNT;

  return (
    <div className="sc-shell" data-testid="scenario-editor">
      <header className="sc-editor-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Back to scenarios"
          data-testid="back-to-entry"
          onClick={handleBack}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M12.5 4.5 7 10l5.5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="sc-editor-title">SELL estimate</h1>
        <span
          className={`sc-badge sc-badge-${lifecycle.toLowerCase()}`}
          data-testid="lifecycle-badge"
        >
          {lifecycle}
        </span>
      </header>
      <div className="sc-name-row">
        <input
          className="sc-name-input"
          aria-label="Scenario name"
          data-testid="scenario-name"
          value={working.name}
          maxLength={80}
          onChange={(event) => touch((current) => ({ ...current, name: event.target.value }))}
        />
      </div>

      {leavePrompt ? (
        <div className="sc-notice sc-notice-warning" role="alert" data-testid="leave-prompt">
          <p className="sc-notice-text">
            This scenario has unsaved changes. Leaving now discards them.
          </p>
          <div className="sc-inline-actions">
            <button type="button" className="sc-chip-button" onClick={onBack} data-testid="discard-changes">
              Discard changes
            </button>
            <button type="button" className="sc-chip-button" onClick={() => setLeavePrompt(false)}>
              Keep editing
            </button>
          </div>
        </div>
      ) : null}

      <div className="sc-editor-grid">
        <div className="sc-col sc-col-main">
          <section className="sc-card sc-order-1" aria-label="Selling price">
            <CurrencyField
              id="sellingPrice"
              label="Expected selling price"
              badge="Required"
              hint="Only required input to calculate an estimate."
              value={values.sellingPrice}
              error={calc.fieldErrors.sellingPrice}
              emptyMeansBlank
              onChange={(value) => setField("sellingPrice", value)}
            />
          </section>

          <section className="sc-card sc-order-3" aria-label="Mortgage payout">
            <CurrencyField
              id="mortgagePayout"
              label="Mortgage payout"
              badge="Optional"
              hint="Current payout or best estimate. $0 is valid."
              value={values.mortgagePayout}
              error={calc.fieldErrors.mortgagePayout}
              onChange={(value) => setField("mortgagePayout", value)}
              onBlur={() => markReviewed("mortgage")}
            />
            {calc.mortgageWarning ? (
              <p className="field-warning" role="status" data-testid="mortgage-warning">
                {calc.mortgageWarning}
              </p>
            ) : null}
          </section>

          <section className="sc-card sc-order-4">
            <button
              type="button"
              className="sc-disclosure"
              aria-expanded={sections.selling}
              aria-controls="selling-costs-panel"
              data-testid="selling-toggle"
              onClick={() => toggleSection("selling")}
            >
              <span>
                <span className="sc-disclosure-title">Selling costs</span>
                <span className="sc-disclosure-sub">Commission, GST, closing costs</span>
              </span>
              <Chevron open={sections.selling} />
            </button>
            <div id="selling-costs-panel" hidden={!sections.selling} className="sc-subsection">
              <SellingCostFields
                working={working}
                calc={calc}
                onField={setField}
                onCommissionMode={(mode) => touch((current) => ({ ...current, commissionMode: mode }))}
              />
            </div>
          </section>

          <section className="sc-card sc-order-5">
            <button
              type="button"
              className="sc-disclosure"
              aria-expanded={sections.planning}
              aria-controls="planning-costs-panel"
              data-testid="planning-toggle"
              onClick={() => toggleSection("planning")}
            >
              <span>
                <span className="sc-disclosure-title">Planning costs</span>
                <span className="sc-disclosure-sub">Optional · does not change net proceeds</span>
              </span>
              <Chevron open={sections.planning} />
            </button>
            <div id="planning-costs-panel" hidden={!sections.planning} className="sc-subsection">
              <PlanningCostFields working={working} calc={calc} onField={setField} />
            </div>
          </section>
        </div>

        <div className="sc-col sc-col-side">
          <section className="sc-hero-card sc-order-2" data-testid="hero" aria-label="Estimated net proceeds">
            <p className="sc-hero-label">Estimated net proceeds</p>
            <p
              className={`sc-hero-amount tabular ${result ? "" : "sc-hero-empty"} ${negative ? "result-negative" : ""}`}
              data-testid="result-amount"
              aria-live="polite"
            >
              {heroAmount}
            </p>
            <p className="sc-hero-context" data-testid="hero-provenance">
              {result
                ? usingSnapshot
                  ? `Saved result · ${formatTimestamp(baseline?.savedAt ?? null)}`
                  : "Preliminary estimate · Updates when inputs change"
                : calc.salePriceState === "empty"
                  ? "Your estimate appears here once you enter a selling price."
                  : "Correct the highlighted amount(s) to see the estimate."}
            </p>
            {negative ? (
              <p className="sc-hero-alert" data-testid="negative-note">
                {NEGATIVE_RESULT_NOTE}
              </p>
            ) : null}
            {result && calc.mortgageWarning ? (
              <p className="sc-hero-alert" data-testid="results-mortgage-warning">
                {calc.mortgageWarning}
              </p>
            ) : null}
            {result ? (
              <button
                type="button"
                className="sc-hero-link sc-hero-link-quiet"
                data-testid="provenance-link"
                onClick={() => {
                  setDetailsOpen(true);
                  pendingFocus.current = "details-toggle";
                  setFocusTick((tick) => tick + 1);
                }}
              >
                Jurisdiction &amp; rule version
              </button>
            ) : null}
            <button
              type="button"
              className="sc-hero-link"
              aria-expanded={breakdownOpen}
              aria-controls="breakdown-panel"
              data-testid="breakdown-toggle"
              disabled={result === null}
              onClick={() => setBreakdownOpen((open) => !open)}
            >
              {breakdownOpen ? "Hide breakdown" : "See breakdown"}
              <Chevron open={breakdownOpen} />
            </button>
          </section>

          <section
            id="breakdown-panel"
            className="sc-card sc-order-2"
            hidden={!breakdownOpen || result === null}
            aria-label="Key breakdown"
          >
            {result ? <KeyBreakdown result={result} /> : null}
          </section>

          <section className="sc-banner sc-order-6" data-testid="readiness" aria-label="Key assumptions">
            <p className="sc-readiness-line">
              <span data-testid="readiness-count">
                {readiness.confirmedCount} of {readiness.total} key assumptions confirmed
              </span>
              <span className="sc-muted-text"> · Does not block your estimate.</span>
            </p>
            {!complete ? (
              <div className="sc-inline-actions" data-testid="next-actions">
                {actions.map((action) => (
                  <button
                    key={action.key}
                    type="button"
                    className="sc-chip-button"
                    data-testid={`action-${action.key}`}
                    onClick={() => goToField(action)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </section>

          <section className="sc-card sc-order-7">
            <button
              type="button"
              className="sc-disclosure"
              aria-expanded={detailsOpen}
              aria-controls="calculation-details"
              id="details-toggle"
              data-testid="details-toggle"
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <span className="sc-disclosure-title">Calculation details</span>
              <Chevron open={detailsOpen} />
            </button>
            <div id="calculation-details" hidden={!detailsOpen} className="sc-subsection">
              <CalculationDetails
                working={working}
                result={result}
                usingSnapshot={usingSnapshot}
                calculatedAt={calculatedAt}
                savedAt={baseline?.savedAt ?? null}
              />
              <button
                type="button"
                className="secondary-button"
                data-testid="view-calculation"
                disabled={result === null}
                onClick={() => setCalculationOpen(true)}
              >
                View exact calculation
              </button>
            </div>
          </section>

          <div className="sc-save-block sc-order-8">
            <button
              type="button"
              className="sc-primary-button"
              data-testid="save-scenario"
              disabled={saveDisabled}
              onClick={handleSave}
            >
              {saveDisabled ? "Saved" : "Save Scenario"}
            </button>
            <p className="sc-caption" data-testid="persistence-note">
              Saved only in this browser on this device — not shared or backed up.
              {baseline ? ` Last saved ${formatTimestamp(baseline.savedAt)}.` : ""}
            </p>
            {saveMessage ? (
              <p className="sc-status-text" role="status" data-testid="save-status">
                {saveMessage}
              </p>
            ) : null}
            {saveError ? (
              <p className="field-error" role="alert" data-testid="save-error">
                {saveError}
              </p>
            ) : null}
            <button
              type="button"
              className="secondary-button"
              data-testid="duplicate-scenario"
              onClick={() => onDuplicate(working)}
            >
              Duplicate Scenario
            </button>
          </div>

          <p className="sc-caption sc-order-9" data-testid="tier1-disclaimer">
            {TIER1_DISCLAIMER} {TAX_EXCLUSION_NOTE}
          </p>
        </div>
      </div>

      <ViewCalculationDialog
        open={calculationOpen}
        onClose={() => setCalculationOpen(false)}
        result={result}
      />
    </div>
  );
}
