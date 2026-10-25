"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  OPTIONAL_FIELD_NAMES,
  type CurrencyFieldName,
} from "../lib/engine/sell-calculator-form";
import { SELL_RULE_VERSION, type CommissionMode } from "../lib/engine/sell";
import {
  deriveCalculation,
  deriveLifecycle,
  hasSameCalculationInputs,
  hasSameEditableState,
  resolveDisplayedResult,
  saveSellScenario,
  type SellReviewState,
  type SellScenario,
} from "../lib/scenarios/sell-scenario";
import type { SaveResult } from "../lib/scenarios/sell-scenario-storage";
import { SellInputsView, type CostSections } from "./sell-inputs-view";
import { SellResultsView } from "./sell-results-view";

type Mode = "inputs" | "results";

type EditorProps = {
  initialWorking: SellScenario;
  initialBaseline: SellScenario | null;
  startsUnsaved: boolean;
  onSave: (scenario: SellScenario) => SaveResult;
  onBack: () => void;
  onDuplicate: (source: SellScenario) => void;
};

const SELLING_SECTION_FIELDS: CurrencyFieldName[] = [
  "manualCommission",
  "legalNotary",
  "mortgageDischarge",
  "prepaymentPenalty",
  "propertyTaxAdjustment",
  "otherClosingAdjustments",
];

/**
 * Two distinct mental modes: Inputs (creating, never shows an amount) and
 * Results (interpreting, never shows an input). The engine state is derived on
 * every change, but only the explicit Calculate action presents it.
 */
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
  // A clean saved Scenario with a valid saved result reopens on Results; a Draft reopens on Inputs.
  const opensOnResults = initialBaseline?.savedResult != null;
  const [mode, setMode] = useState<Mode>(opensOnResults ? "results" : "inputs");
  const [hasCalculated, setHasCalculated] = useState(opensOnResults);
  const [attempted, setAttempted] = useState(false);
  const [sections, setSections] = useState<CostSections>({ selling: false, planning: false });
  const [leavePrompt, setLeavePrompt] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [calculatedAt, setCalculatedAt] = useState(() => new Date().toISOString());
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const [pristine] = useState(initialWorking);

  const calc = useMemo(() => deriveCalculation(working), [working]);
  const result = resolveDisplayedResult(working, baseline, calc);
  const lifecycle = deriveLifecycle(working, baseline, result);
  const usingSnapshot = result !== null && result === baseline?.savedResult;
  const editsDiffer = baseline
    ? !hasSameEditableState(working, baseline)
    : startsUnsaved || !hasSameEditableState(working, pristine);
  const inResults = mode === "results" && result !== null;
  // A draft saved from Inputs has no saved result; showing Results for it is unsaved work.
  const needsResultSave =
    inResults && baseline !== null && baseline.savedResult === null;
  const hasUnsavedChanges = editsDiffer || needsResultSave;
  // Stage label: Inputs never reports a calculated stage unless a saved result exists.
  const stage = inResults
    ? needsResultSave
      ? "Calculated"
      : lifecycle
    : baseline?.savedResult
      ? lifecycle
      : "Draft";
  // On Inputs, changed numbers on a saved Scenario need an explicit Calculate before saving.
  const canSaveFromInputs =
    baseline?.savedResult == null || hasSameCalculationInputs(working, baseline);

  useEffect(() => {
    const id = pendingFocus.current;
    if (!id) return;
    pendingFocus.current = null;
    const element = document.getElementById(id);
    element?.focus();
    if (id === "mode-heading") window.scrollTo({ top: 0 });
  }, [focusTick, mode]);

  function requestFocus(id: string) {
    pendingFocus.current = id;
    setFocusTick((tick) => tick + 1);
  }

  function touch(update: (current: SellScenario) => SellScenario) {
    setWorking(update);
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

  function setCommissionMode(next: CommissionMode) {
    touch((current) => ({ ...current, commissionMode: next }));
  }

  function setName(name: string) {
    touch((current) => ({ ...current, name }));
  }

  function toggleSection(section: keyof CostSections) {
    const opening = !sections[section];
    setSections((current) => ({ ...current, [section]: opening }));
    if (opening && section === "selling") markReviewed("sellingCosts");
    if (opening && section === "planning") markReviewed("planningCosts");
  }

  function calculate() {
    setAttempted(true);
    if (result === null) {
      const erroneous = (Object.keys(calc.fieldErrors) as CurrencyFieldName[])[0];
      const target = erroneous ?? "sellingPrice";
      const needsSelling = SELLING_SECTION_FIELDS.includes(target);
      const needsPlanning = (OPTIONAL_FIELD_NAMES as readonly string[]).includes(target);
      if (needsSelling || needsPlanning) {
        setSections((current) => ({
          selling: current.selling || needsSelling,
          planning: current.planning || needsPlanning,
        }));
      }
      requestFocus(calc.fieldErrors.sellingPrice || calc.salePriceState !== "valid" ? "sellingPrice" : target);
      return;
    }
    // Dismiss the on-screen keyboard before the mode switch.
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setCalculatedAt(new Date().toISOString());
    setHasCalculated(true);
    setAttempted(false);
    setMode("results");
    requestFocus("mode-heading");
  }

  function editInputs() {
    setMode("inputs");
    requestFocus("mode-heading");
  }

  function handleSave() {
    const savedWithResult = saveSellScenario(working, calc, new Date(), baseline);
    // Save draft before an explicit Calculate must not persist a result the user never saw.
    const asDraft = !inResults && baseline?.savedResult == null;
    const saved: SellScenario = asDraft
      ? { ...savedWithResult, savedResult: null, ruleVersion: SELL_RULE_VERSION }
      : savedWithResult;
    const outcome = onSave(saved);
    if (outcome.ok) {
      setWorking(saved);
      setBaseline(saved);
      setSaveError(null);
    } else {
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

  return (
    <div className="sc-shell v2-shell" data-testid="scenario-editor" data-mode={inResults ? "results" : "inputs"}>
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
        <input
          className="sc-name-input"
          aria-label="Scenario name"
          data-testid="scenario-name"
          value={working.name}
          maxLength={80}
          onChange={(event) => setName(event.target.value)}
        />
        <span
          className={`sc-badge sc-badge-${stage.toLowerCase()}`}
          data-testid="lifecycle-badge"
        >
          {stage}
        </span>
      </header>

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

      {inResults && result ? (
        <SellResultsView
          working={working}
          result={result}
          lifecycle={stage}
          usingSnapshot={usingSnapshot}
          calculatedAt={calculatedAt}
          savedAt={baseline?.savedAt ?? null}
          mortgageWarning={calc.mortgageWarning}
          onEdit={editInputs}
        />
      ) : (
        <SellInputsView
          working={working}
          calc={calc}
          sections={sections}
          attempted={attempted}
          hasCalculated={hasCalculated}
          onField={setField}
          onMortgageBlur={() => markReviewed("mortgage")}
          onCommissionMode={setCommissionMode}
          onToggleSection={toggleSection}
          onCalculate={calculate}
        />
      )}

      <div className="sc-save-block v2-save">
        {saveDisabled ? (
          <>
            <div className="v2-receipt" role="status" data-testid="saved-receipt">
              <p className="v2-receipt-title">
                <span aria-hidden="true">✓ </span>Scenario saved
              </p>
              <p className="v2-receipt-detail">
                Stored in this browser. Reopen it from Scenarios.
              </p>
            </div>
            {inResults ? (
              <button
                type="button"
                className="sc-primary-button"
                data-testid="done-back"
                onClick={handleBack}
              >
                Done — Back to Scenarios
              </button>
            ) : null}
          </>
        ) : inResults || canSaveFromInputs ? (
          <button
            type="button"
            className={inResults ? "sc-primary-button" : "secondary-button"}
            data-testid="save-scenario"
            onClick={handleSave}
          >
            {!inResults
              ? "Save draft"
              : baseline?.savedResult != null
                ? "Save changes"
                : "Save Scenario"}
          </button>
        ) : (
          <p className="sc-muted-text" data-testid="save-needs-calculate">
            Calculate to review and save the changed numbers.
          </p>
        )}
        {saveError ? (
          <p className="field-error" role="alert" data-testid="save-error">
            {saveError}
          </p>
        ) : null}
        {inResults ? (
          <button
            type="button"
            className="v2-link-button"
            data-testid="duplicate-scenario"
            onClick={() => onDuplicate(working)}
          >
            Duplicate scenario
          </button>
        ) : null}
      </div>
    </div>
  );
}
