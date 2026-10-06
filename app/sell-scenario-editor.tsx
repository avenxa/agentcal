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
  type SellReviewState,
  type SellScenario,
} from "../lib/scenarios/sell-scenario";
import type { SaveResult } from "../lib/scenarios/sell-scenario-storage";
import type { CommissionMode } from "../lib/engine/sell";
import { SellBuildPanel } from "./sell-build-panel";
import { SellResultsPanel } from "./sell-results-panel";

export type EditorTab = "build" | "results";

export type CostSections = {
  optional: boolean;
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

const TABS: Array<{ id: EditorTab; label: string }> = [
  { id: "build", label: "Build" },
  { id: "results", label: "Results" },
];

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
  const [tab, setTab] = useState<EditorTab>("build");
  const [sections, setSections] = useState<CostSections>({
    optional: false,
    selling: false,
    planning: false,
  });
  const [leavePrompt, setLeavePrompt] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [calculatedAt, setCalculatedAt] = useState(() => new Date().toISOString());
  const [focusTick, setFocusTick] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const [pristine] = useState(initialWorking);
  const tabRefs = useRef<Record<EditorTab, HTMLButtonElement | null>>({
    build: null,
    results: null,
  });

  const calc = useMemo(() => deriveCalculation(working), [working]);
  const result = resolveDisplayedResult(working, baseline, calc);
  const lifecycle = deriveLifecycle(working, baseline, result);
  const readiness = deriveReadiness(working, calc);
  const usingSnapshot = result !== null && result === baseline?.savedResult;
  const hasUnsavedChanges = baseline
    ? !hasSameEditableState(working, baseline)
    : startsUnsaved || !hasSameEditableState(working, pristine);

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

  function setCommissionMode(mode: CommissionMode) {
    touch((current) => ({ ...current, commissionMode: mode }));
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

  function goToField(fieldId: string, open: Array<keyof CostSections> = []) {
    setTab("build");
    if (open.length > 0) {
      setSections((current) => {
        const next = { ...current };
        for (const section of open) next[section] = true;
        return next;
      });
      if (open.includes("selling")) markReviewed("sellingCosts");
      if (open.includes("planning")) markReviewed("planningCosts");
    }
    pendingFocus.current = fieldId;
    setFocusTick((tick) => tick + 1);
  }

  function handleSave() {
    const saved = saveSellScenario(working, calc);
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

  function handleTabKey(event: React.KeyboardEvent, current: EditorTab) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const next: EditorTab = current === "build" ? "results" : "build";
    setTab(next);
    tabRefs.current[next]?.focus();
  }

  const saveDisabled = baseline !== null && !hasUnsavedChanges;

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
        <h1 className="sc-name-heading">
          <input
            className="sc-name-input"
            aria-label="Scenario name"
            data-testid="scenario-name"
            value={working.name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
          />
        </h1>
        <span
          className={`sc-badge sc-badge-${lifecycle.toLowerCase()}`}
          data-testid="lifecycle-badge"
        >
          {lifecycle}
        </span>
      </header>
      <p className="sc-subtitle sc-editor-subtitle">SELL Scenario</p>

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

      <div className="sc-tabs" role="tablist" aria-label="Scenario sections">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            ref={(element) => {
              tabRefs.current[id] = element;
            }}
            type="button"
            role="tab"
            id={`${id}-tab`}
            aria-selected={tab === id}
            aria-controls={`${id}-panel`}
            tabIndex={tab === id ? 0 : -1}
            className={`sc-tab ${tab === id ? "sc-tab-active" : ""}`}
            data-testid={`tab-${id}`}
            onClick={() => setTab(id)}
            onKeyDown={(event) => handleTabKey(event, id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="sc-editor-grid"
        role="tabpanel"
        id={`${tab}-panel`}
        aria-labelledby={`${tab}-tab`}
      >
        {tab === "build" ? (
          <SellBuildPanel
            working={working}
            calc={calc}
            result={result}
            readiness={readiness}
            sections={sections}
            usingSnapshot={usingSnapshot}
            calculatedAt={calculatedAt}
            savedAt={baseline?.savedAt ?? null}
            onField={setField}
            onMortgageBlur={() => markReviewed("mortgage")}
            onCommissionMode={setCommissionMode}
            onToggleSection={toggleSection}
            onViewResults={() => setTab("results")}
          />
        ) : (
          <SellResultsPanel
            working={working}
            calc={calc}
            result={result}
            readiness={readiness}
            lifecycle={lifecycle}
            usingSnapshot={usingSnapshot}
            calculatedAt={calculatedAt}
            savedAt={baseline?.savedAt ?? null}
            onGoToField={goToField}
            onDuplicate={() => onDuplicate(working)}
          />
        )}

        <div className="sc-save-block sc-order-save">
          <button
            type="button"
            className="sc-primary-button"
            data-testid="save-scenario"
            disabled={saveDisabled}
            onClick={handleSave}
          >
            {saveDisabled ? "Saved" : "Save Scenario"}
          </button>
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
        </div>
      </div>
    </div>
  );
}
