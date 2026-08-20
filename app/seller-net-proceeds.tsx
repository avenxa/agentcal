"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { formatExactCad, formatFieldCad, formatWholeCad } from "../lib/engine/currency";
import {
  deriveSellerCalculatorState,
  INITIAL_FORM_VALUES,
  OPTIONAL_FIELD_NAMES,
  type CurrencyFieldName,
  type SellerCalculatorFormValues,
} from "../lib/engine/sell-calculator-form";
import type { CommissionMode } from "../lib/engine/sell";
import {
  createInitialConsultationState,
  deriveTopicSummaries,
  isViewCalculationDisabled,
  TOPIC_IDS,
  type TopicId,
} from "../lib/sell-consultation";
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
import { CurrencyField } from "./currency-field";
import { ViewCalculationDialog } from "./view-calculation";
import { EstimateSummary } from "./estimate-summary";

const OPTIONAL_LABELS: Record<(typeof OPTIONAL_FIELD_NAMES)[number], string> = {
  staging: "Staging/preparation",
  repairs: "Repairs/renovations",
  inspectionAppraisal: "Inspection/appraisal",
  cleaning: "Cleaning",
  movingStorage: "Moving/storage",
  overlapHousing: "Overlap or temporary-housing costs",
  otherPlanningCosts: "Other planning costs",
};

function isTextEditableField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  if (target instanceof HTMLTextAreaElement) {
    return !target.readOnly && !target.disabled;
  }
  if (target instanceof HTMLInputElement) {
    if (target.readOnly || target.disabled) {
      return false;
    }
    return (
      target.type === "text" ||
      target.type === "search" ||
      target.type === "tel" ||
      target.type === "url" ||
      target.type === "email" ||
      target.type === "password" ||
      target.type === "number" ||
      target.type === ""
    );
  }
  return target.isContentEditable;
}

function useMinWidth1280() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1280px)");
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return matches;
}

function IconChevron({
  open,
  className = "",
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={`chevron ${open ? "chevron-open" : ""} ${className}`.trim()}
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

export function SellerNetProceeds() {
  const [values, setValues] = useState<SellerCalculatorFormValues>(
    INITIAL_FORM_VALUES,
  );
  const [commissionMode, setCommissionMode] =
    useState<CommissionMode>("bc-preset");
  const [consultation, setConsultation] = useState(
    createInitialConsultationState,
  );
  const [helpOpen, setHelpOpen] = useState(false);
  const [calculationOpen, setCalculationOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [editingFieldFocused, setEditingFieldFocused] = useState(false);
  const editingRegionRef = useRef<HTMLDivElement>(null);
  const isDesktopLayout = useMinWidth1280();
  const planningPanelId = "planning-optional-costs";
  const resultDetailsId = "result-card-details";

  function refreshEditingFieldFocus() {
    const active = document.activeElement;
    const focused = Boolean(
      isTextEditableField(active) &&
        editingRegionRef.current?.contains(active),
    );
    setEditingFieldFocused(focused);
    if (focused) {
      setSummaryExpanded(false);
    }
  }

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const onViewportChange = () => {
      const keyboardLikelyOpen = window.innerHeight - viewport.height > 80;
      if (keyboardLikelyOpen) {
        const active = document.activeElement;
        if (
          isTextEditableField(active) &&
          editingRegionRef.current?.contains(active)
        ) {
          setEditingFieldFocused(true);
          setSummaryExpanded(false);
          return;
        }
      }
      refreshEditingFieldFocus();
    };

    viewport.addEventListener("resize", onViewportChange);
    viewport.addEventListener("scroll", onViewportChange);
    return () => {
      viewport.removeEventListener("resize", onViewportChange);
      viewport.removeEventListener("scroll", onViewportChange);
    };
  }, []);

  const calc = useMemo(
    () => deriveSellerCalculatorState(values, commissionMode),
    [values, commissionMode],
  );
  const summaries = deriveTopicSummaries(calc);
  const viewDisabled = isViewCalculationDisabled(calc);

  function updateField(name: CurrencyFieldName, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function setTopic(topic: TopicId) {
    setConsultation((current) => ({ ...current, activeTopic: topic }));
  }

  const resultAmount = calc.result
    ? formatWholeCad(calc.result.estimatedNetProceedsCents)
    : calc.salePriceState === "invalid"
      ? UNAVAILABLE_AMOUNT
      : EMPTY_RESULT_LABEL;

  const sellingCostSummary =
    calc.displayedSellingCostDeductionCents === null
      ? UNAVAILABLE_AMOUNT
      : formatWholeCad(calc.displayedSellingCostDeductionCents);

  const afterPlanning =
    calc.result &&
    calc.optionalCalculationAvailable &&
    calc.optionalPlanningTotalCents !== null &&
    calc.optionalPlanningTotalCents > 0
      ? formatWholeCad(calc.result.estimatedAfterPlanningCents)
      : null;

  const livingAssumptions = [
    {
      label: "Selling price",
      value:
        calc.salePriceState === "valid" && calc.result
          ? formatWholeCad(calc.result.inputs.sellingPriceCents)
          : calc.salePriceState === "invalid"
            ? UNAVAILABLE_AMOUNT
            : EMPTY_RESULT_LABEL,
    },
    {
      label: "Mortgage payout",
      value: calc.result
        ? formatWholeCad(calc.result.inputs.mortgagePayoutCents)
        : formatFieldCad(0),
    },
    {
      label: "Total brokerage commission",
      value:
        calc.commissionBeforeGstCents === null
          ? UNAVAILABLE_AMOUNT
          : formatFieldCad(calc.commissionBeforeGstCents),
    },
    {
      label: "GST on commission",
      value:
        calc.gstOnCommissionCents === null
          ? UNAVAILABLE_AMOUNT
          : formatExactCad(calc.gstOnCommissionCents),
    },
    {
      label: "Selling-cost deduction",
      value: sellingCostSummary,
    },
  ];

  return (
    <>
    <div className="page-shell" data-testid="sell-page" hidden={summaryOpen && calc.result !== null}>
      <header className="app-header">
        <button
          type="button"
          className="icon-button"
          aria-label="Back"
          onClick={() => window.history.back()}
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
        <h1 className="page-title">Seller Net Proceeds</h1>
        <button
          type="button"
          className="icon-button"
          aria-label="Help"
          aria-expanded={helpOpen}
          aria-controls="help-panel"
          onClick={() => setHelpOpen((open) => !open)}
        >
          <span aria-hidden="true">?</span>
        </button>
      </header>

      <div
        className={helpOpen ? "notice-group" : undefined}
        data-testid={helpOpen ? "notice-group" : undefined}
      >
        {helpOpen ? (
          <aside id="help-panel" className="help-panel">
            <p>{TAX_EXCLUSION_NOTE}</p>
          </aside>
        ) : null}

        <p className="disclaimer" data-testid="tier1-disclaimer">
          {TIER1_DISCLAIMER}
        </p>
      </div>

      <div className="consultation-layout">
        <div
          className="editing-region"
          ref={editingRegionRef}
          onFocusCapture={refreshEditingFieldFocus}
          onBlurCapture={() => {
            window.requestAnimationFrame(refreshEditingFieldFocus);
          }}
        >
          <nav
            className="topic-rail"
            aria-label="Consultation topics"
            data-testid="topic-rail"
          >
            {TOPIC_IDS.map((topicId) => {
              const summary = summaries[topicId];
              const selected = consultation.activeTopic === topicId;
              return (
                <button
                  key={topicId}
                  type="button"
                  className={`topic-chip ${selected ? "topic-chip-active" : ""} tone-${summary.tone}`}
                  aria-current={selected ? "true" : undefined}
                  data-testid={`topic-${topicId}`}
                  onClick={() => setTopic(topicId)}
                >
                  <span className="topic-chip-label">{summary.label}</span>
                  <span className="topic-chip-value tabular">{summary.value}</span>
                </button>
              );
            })}
          </nav>

          <section
            className="topic-workspace"
            data-testid="topic-workspace"
            aria-labelledby="active-topic-title"
          >
            <h2 id="active-topic-title" className="section-title">
              {summaries[consultation.activeTopic].label}
            </h2>

            {consultation.activeTopic === "price" ? (
              <CurrencyField
                id="sellingPrice"
                label="Expected selling price"
                value={values.sellingPrice}
                error={calc.fieldErrors.sellingPrice}
                emptyMeansBlank
                onChange={(value) => updateField("sellingPrice", value)}
              />
            ) : null}

            {consultation.activeTopic === "mortgage" ? (
              <>
                <CurrencyField
                  id="mortgagePayout"
                  label="Mortgage payout"
                  value={values.mortgagePayout}
                  error={calc.fieldErrors.mortgagePayout}
                  onChange={(value) => updateField("mortgagePayout", value)}
                />
                {calc.mortgageWarning ? (
                  <p className="field-warning" role="status" data-testid="mortgage-warning">
                    {calc.mortgageWarning}
                  </p>
                ) : null}
              </>
            ) : null}

            {consultation.activeTopic === "selling-costs" ? (
              <div className="stack">
                <fieldset className="commission-fieldset">
                  <legend className="amount-label">Total brokerage commission</legend>
                  <div className="segmented" role="radiogroup" aria-label="Commission mode">
                    <label className="segment">
                      <input
                        type="radio"
                        name="commissionMode"
                        value="bc-preset"
                        checked={commissionMode === "bc-preset"}
                        onChange={() => setCommissionMode("bc-preset")}
                      />
                      {COMMISSION_PRESET_LABEL}
                    </label>
                    <label className="segment">
                      <input
                        type="radio"
                        name="commissionMode"
                        value="manual"
                        checked={commissionMode === "manual"}
                        onChange={() => setCommissionMode("manual")}
                      />
                      Manual amount
                    </label>
                  </div>
                  <p className="amount-hint">{COMMISSION_PRESET_FORMULA}</p>
                  <p className="amount-hint">{COMMISSION_NEGOTIABLE_NOTICE}</p>
                </fieldset>
                {commissionMode === "manual" ? (
                  <CurrencyField
                    id="manualCommission"
                    label="Manual commission amount"
                    value={values.manualCommission}
                    error={calc.fieldErrors.manualCommission}
                    onChange={(value) => updateField("manualCommission", value)}
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
                  onChange={(value) => updateField("legalNotary", value)}
                />
                <CurrencyField
                  id="mortgageDischarge"
                  label="Mortgage discharge fee"
                  value={values.mortgageDischarge}
                  error={calc.fieldErrors.mortgageDischarge}
                  onChange={(value) => updateField("mortgageDischarge", value)}
                />
                <CurrencyField
                  id="prepaymentPenalty"
                  label="Prepayment penalty"
                  value={values.prepaymentPenalty}
                  error={calc.fieldErrors.prepaymentPenalty}
                  onChange={(value) => updateField("prepaymentPenalty", value)}
                />
                <CurrencyField
                  id="propertyTaxAdjustment"
                  label="Property-tax adjustment"
                  hint="Positive adds to seller proceeds; negative reduces proceeds."
                  value={values.propertyTaxAdjustment}
                  error={calc.fieldErrors.propertyTaxAdjustment}
                  allowNegative
                  onChange={(value) => updateField("propertyTaxAdjustment", value)}
                />
                <CurrencyField
                  id="otherClosingAdjustments"
                  label="Other closing adjustments"
                  hint="Seller concessions or adviser-supplied tax adjustments may be entered as negative values."
                  value={values.otherClosingAdjustments}
                  error={calc.fieldErrors.otherClosingAdjustments}
                  allowNegative
                  onChange={(value) => updateField("otherClosingAdjustments", value)}
                />
              </div>
            ) : null}

            {consultation.activeTopic === "planning" ? (
              <div className="stack">
                <p className="body-text">
                  Optional planning costs do not change Estimated Net Proceeds.
                  The Planning summary always includes the current optional
                  total, including $0.
                </p>
                <p className="planning-total tabular" data-testid="planning-total">
                  Optional total {summaries.planning.value}
                </p>
                <button
                  type="button"
                  className="accordion-trigger"
                  aria-expanded={consultation.planningExpanded}
                  aria-controls={planningPanelId}
                  data-testid="planning-toggle"
                  onClick={() =>
                    setConsultation((current) => ({
                      ...current,
                      planningExpanded: !current.planningExpanded,
                    }))
                  }
                >
                  <span>
                    {consultation.planningExpanded
                      ? "Hide optional planning costs"
                      : "Show optional planning costs"}
                  </span>
                  <IconChevron open={consultation.planningExpanded} />
                </button>
                <div
                  id={planningPanelId}
                  className="planning-panel"
                  hidden={!consultation.planningExpanded}
                >
                  {OPTIONAL_FIELD_NAMES.map((fieldName) => (
                    <CurrencyField
                      key={fieldName}
                      id={fieldName}
                      label={OPTIONAL_LABELS[fieldName]}
                      value={values[fieldName]}
                      error={calc.fieldErrors[fieldName]}
                      onChange={(value) => updateField(fieldName, value)}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        <section
          className="result-context living-statement"
          aria-live="polite"
          aria-label="Living statement"
          data-testid="result-context"
          data-expanded={summaryExpanded ? "true" : "false"}
          data-input-focused={editingFieldFocused ? "true" : "false"}
          inert={editingFieldFocused ? true : undefined}
          aria-hidden={editingFieldFocused ? true : undefined}
        >
          <ResultBlock
            amount={resultAmount}
            sellingCostSummary={sellingCostSummary}
            afterPlanning={afterPlanning}
            calc={calc}
            viewDisabled={viewDisabled}
            onView={() => setCalculationOpen(true)}
            onEstimate={() => setSummaryOpen(true)}
            assumptions={livingAssumptions}
            detailsId={resultDetailsId}
            expanded={summaryExpanded}
            isDesktopLayout={isDesktopLayout}
            onToggleExpanded={() => setSummaryExpanded((open) => !open)}
          />
        </section>
      </div>

      <ViewCalculationDialog
        open={calculationOpen}
        onClose={() => setCalculationOpen(false)}
        calc={calc}
      />
    </div>
    {summaryOpen && calc.result ? (
      <EstimateSummary
        result={calc.result}
        onClose={() => {
          setSummaryOpen(false);
          window.requestAnimationFrame(() => {
            document
              .querySelector<HTMLButtonElement>(
                '[data-testid="estimate-summary-open"]',
              )
              ?.focus();
          });
        }}
      />
    ) : null}
    </>
  );
}

function ResultAmount({
  amount,
  calc,
}: {
  amount: string;
  calc: ReturnType<typeof deriveSellerCalculatorState>;
}) {
  return (
    <span className="result-amount-slot">
      <span
        className={`result-amount tabular ${calc.salePriceState === "empty" ? "result-empty" : ""} ${calc.hasNegativeResult ? "result-negative" : ""}`}
        data-testid="result-amount"
      >
        {amount}
      </span>
    </span>
  );
}

function ResultBlock({
  amount,
  sellingCostSummary,
  afterPlanning,
  calc,
  viewDisabled,
  onView,
  onEstimate,
  assumptions,
  detailsId,
  expanded,
  isDesktopLayout,
  onToggleExpanded,
}: {
  amount: string;
  sellingCostSummary: string;
  afterPlanning: string | null;
  calc: ReturnType<typeof deriveSellerCalculatorState>;
  viewDisabled: boolean;
  onView: () => void;
  onEstimate: () => void;
  assumptions: Array<{ label: string; value: string }>;
  detailsId: string;
  expanded: boolean;
  isDesktopLayout: boolean;
  onToggleExpanded: () => void;
}) {
  const detailsHidden = !isDesktopLayout && !expanded;

  return (
    <div className="result-card">
      {isDesktopLayout ? (
        <>
          <p className="result-label">Estimated Net Proceeds</p>
          <ResultAmount amount={amount} calc={calc} />
        </>
      ) : (
        <button
          type="button"
          className="sticky-summary-toggle"
          aria-expanded={expanded}
          aria-controls={detailsId}
          data-testid="sticky-summary-toggle"
          onClick={onToggleExpanded}
        >
          <span className="sticky-summary-copy">
            <span className="result-label">Estimated Net Proceeds</span>
            <ResultAmount amount={amount} calc={calc} />
          </span>
          <span className="sticky-summary-affordance">
            <span className="sticky-summary-affordance-text">
              {expanded ? "Hide details" : "Show details"}
            </span>
            <IconChevron open={expanded} className="sticky-summary-chevron" />
          </span>
        </button>
      )}
      <div
        id={detailsId}
        className="result-card-details"
        hidden={detailsHidden}
      >
        {calc.hasNegativeResult ? (
          <p className="field-error" data-testid="negative-note">
            {NEGATIVE_RESULT_NOTE}
          </p>
        ) : null}
        {calc.mortgageWarning ? (
          <p className="field-warning">{calc.mortgageWarning}</p>
        ) : null}
        <p className="result-context-line">
          Selling-cost deduction {sellingCostSummary}
        </p>
        {afterPlanning ? (
          <p className="result-context-line">
            After optional planning costs {afterPlanning}
          </p>
        ) : null}
        <dl className="assumption-list">
          {assumptions.map((item) => (
            <div key={item.label} className="assumption-row">
              <dt>{item.label}</dt>
              <dd className="tabular">{item.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="secondary-button"
          data-testid="view-calculation"
          disabled={viewDisabled}
          onClick={onView}
        >
          View calculation
        </button>
        <button
          type="button"
          className="secondary-button"
          data-testid="estimate-summary-open"
          disabled={viewDisabled}
          onClick={onEstimate}
        >
          Estimate summary
        </button>
        <p className="caption" data-testid="result-disclaimer">
          {TIER1_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
