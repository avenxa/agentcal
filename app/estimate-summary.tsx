"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { formatExactCad, formatWholeCad } from "../lib/engine/currency";
import type { SellerNetProceedsResult } from "../lib/engine/sell";
import {
  getPreparedByServerSnapshot,
  getPreparedBySnapshot,
  subscribePreparedBy,
  writePreparedBy,
} from "../lib/prepared-by";
import {
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  EMAIL_PASTE_PROMPT,
  PREPARED_BY_PLACEHOLDER,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
} from "../lib/sell-copy";
import {
  composeClipboardHandoff,
  composeMailtoHref,
  composePreparedByLine,
  composeResultNarration,
  composeTier2Disclosure,
  formatEstimateTimestamp,
} from "../lib/sell-narration";
import { BreakdownBody } from "./view-calculation";

type EstimateSummaryProps = {
  result: SellerNetProceedsResult;
  onClose: () => void;
};

type AssumptionRow = {
  label: string;
  detail?: string;
  cents?: number;
  text?: string;
};

function AssumptionValue({
  cents,
  text,
}: {
  cents?: number;
  text?: string;
}) {
  if (text !== undefined) {
    return <dd>{text}</dd>;
  }
  if (cents === undefined) {
    return <dd>—</dd>;
  }
  const exact = formatExactCad(cents);
  const whole = formatWholeCad(cents);
  return (
    <dd className="tabular">
      <span>{whole}</span>
      {cents % 100 !== 0 ? (
        <span className="breakdown-detail"> ({exact} exact)</span>
      ) : null}
    </dd>
  );
}

export function EstimateSummary({ result, onClose }: EstimateSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headingId = useId();
  const preparedById = useId();
  const emailContentId = useId();
  const [generatedAt] = useState(() => new Date());
  const preparedBy = useSyncExternalStore(
    subscribePreparedBy,
    getPreparedBySnapshot,
    getPreparedByServerSnapshot,
  );
  const composedEmail = composeClipboardHandoff({
    result,
    preparedBy,
    generatedAt,
  });
  const [emailContent, setEmailContent] = useState(composedEmail);
  const [emailSource, setEmailSource] = useState(composedEmail);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  if (emailSource !== composedEmail) {
    setEmailSource(composedEmail);
    setEmailContent(composedEmail);
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  function updatePreparedBy(value: string) {
    writePreparedBy(value);
  }

  async function copyEmailContent() {
    try {
      await navigator.clipboard.writeText(emailContent);
      setCopyStatus(EMAIL_PASTE_PROMPT);
    } catch {
      setCopyStatus(
        "Copy failed. Select the email content and copy it manually, or use Open in email app.",
      );
    }
  }

  const commissionDetail =
    result.commissionMode === "bc-preset"
      ? `${COMMISSION_PRESET_LABEL} · ${COMMISSION_PRESET_FORMULA}`
      : "Manual amount";
  const assumptions: AssumptionRow[] = [
    { label: "Selling price", cents: result.inputs.sellingPriceCents },
    { label: "Mortgage payout", cents: result.inputs.mortgagePayoutCents },
    { label: "Commission mode, rate and GST", text: commissionDetail },
    {
      label: "Total brokerage commission",
      cents: result.commissionBeforeGstCents,
    },
    { label: "GST on commission", cents: result.gstOnCommissionCents },
    {
      label: "Legal/notary, incl. GST",
      cents: result.inputs.legalNotaryIncludingGstCents,
    },
    {
      label: "Mortgage discharge fee",
      cents: result.inputs.mortgageDischargeFeeCents,
    },
    {
      label: "Prepayment penalty",
      cents: result.inputs.mortgagePrepaymentPenaltyCents,
    },
    {
      label: "Property-tax adjustment",
      cents: result.propertyTaxAdjustmentCents,
    },
    {
      label: "Other closing adjustments",
      cents: result.otherClosingAdjustmentsCents,
    },
  ];
  if (result.optionalPlanningTotalCents > 0) {
    assumptions.push({
      label: "Optional planning costs",
      cents: result.optionalPlanningTotalCents,
    });
  }

  const mailtoHref = composeMailtoHref({ result, preparedBy, generatedAt });
  const timestampLabel = formatEstimateTimestamp(generatedAt);

  return (
    <div
      className="estimate-summary-shell"
      data-testid="estimate-summary"
    >
      <header className="estimate-chrome no-print">
        <button
          type="button"
          className="icon-button"
          data-testid="estimate-back"
          aria-label="Back to calculator"
          onClick={onClose}
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
        <h1
          ref={headingRef}
          id={headingId}
          className="page-title"
          tabIndex={-1}
        >
          Estimate Summary
        </h1>
        <span className="estimate-header-spacer" aria-hidden="true" />
      </header>

      <div className="estimate-chrome no-print">
        <div className="estimate-prepared-by-row">
          <label className="amount-label" htmlFor={preparedById}>
            Prepared by
          </label>
          <div className="estimate-prepared-by-controls">
            <input
              id={preparedById}
              className="estimate-prepared-by-input"
              data-testid="estimate-prepared-by"
              type="text"
              autoComplete="off"
              value={preparedBy}
              placeholder={PREPARED_BY_PLACEHOLDER}
              onChange={(event) => updatePreparedBy(event.target.value)}
            />
            <button
              type="button"
              className="secondary-button estimate-clear-button"
              data-testid="estimate-prepared-by-clear"
              onClick={() => updatePreparedBy("")}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="estimate-actions">
          <button
            type="button"
            className="secondary-button"
            data-testid="estimate-print"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
          <button
            type="button"
            className="secondary-button"
            data-testid="estimate-copy"
            onClick={() => {
              void copyEmailContent();
            }}
          >
            Copy to clipboard
          </button>
          <a
            className="secondary-button estimate-mailto"
            data-testid="estimate-mailto"
            href={mailtoHref}
          >
            Open in email app
          </a>
        </div>
        <p className="caption estimate-email-prompt">
          Paste the copied text into a new email in your own mail client.
          AgentCal never asks for a client email address.
        </p>
        {copyStatus ? (
          <p className="body-text" role="status" data-testid="estimate-copy-status">
            {copyStatus}
          </p>
        ) : null}

        <div className="estimate-email-editor">
          <label className="amount-label" htmlFor={emailContentId}>
            Email content
          </label>
          <textarea
            id={emailContentId}
            className="estimate-email-content"
            data-testid="estimate-email-content"
            value={emailContent}
            onChange={(event) => setEmailContent(event.target.value)}
            rows={10}
          />
        </div>
      </div>

      <article
        className="estimate-artifact"
        data-testid="estimate-artifact"
        aria-labelledby={headingId}
      >
        <p className="estimate-kicker">Seller net proceeds</p>
        <h2 className="section-title estimate-print-title">Estimate Summary</h2>
        <p className="body-text" data-testid="estimate-prepared-by-line">
          {composePreparedByLine(preparedBy)}
        </p>
        <p className="caption" data-testid="estimate-generated-at">
          Generated {timestampLabel}
        </p>
        <p className="caption" data-testid="estimate-rule-version">
          Rule version {result.ruleVersion}
        </p>
        <p className="caption" data-testid="estimate-jurisdiction">
          Jurisdiction {result.jurisdiction}
        </p>

        <p
          className="estimate-narration"
          data-testid="estimate-narration"
        >
          {composeResultNarration(result)}
        </p>

        <p className="result-label">Estimated net proceeds</p>
        <p
          className={`result-amount tabular ${result.estimatedNetProceedsCents < 0 ? "result-negative" : ""}`}
          data-testid="estimate-net-whole"
        >
          {formatWholeCad(result.estimatedNetProceedsCents)}
        </p>
        <p className="caption tabular" data-testid="estimate-net-exact">
          {formatExactCad(result.estimatedNetProceedsCents)} exact
        </p>
        {result.optionalPlanningTotalCents > 0 ? (
          <p className="result-context-line" data-testid="estimate-after-planning">
            After optional planning costs{" "}
            <span className="tabular">
              {formatWholeCad(result.estimatedAfterPlanningCents)}
            </span>
            <span className="caption">
              {" "}
              ({formatExactCad(result.estimatedAfterPlanningCents)} exact)
            </span>
          </p>
        ) : null}
        <p className="caption">
          Whole-dollar summaries use half-up rounding. Any difference from
          these exact cents is display rounding only.
        </p>

        <h3 className="estimate-subsection-title">Assumptions</h3>
        <dl className="estimate-assumption-list" data-testid="estimate-assumptions">
          {assumptions.map((item) => (
            <div key={item.label} className="assumption-row">
              <dt>
                {item.label}
                {item.detail ? (
                  <span className="breakdown-detail"> {item.detail}</span>
                ) : null}
              </dt>
              <AssumptionValue cents={item.cents} text={item.text} />
            </div>
          ))}
        </dl>

        <h3 className="estimate-subsection-title">Exact-cent breakdown</h3>
        <BreakdownBody result={result} />

        <section
          className="estimate-disclosure"
          data-testid="estimate-tier2"
        >
          <h3 className="estimate-subsection-title">Disclosure</h3>
          <p className="caption">{TIER1_DISCLAIMER}</p>
          <p className="caption">{TAX_EXCLUSION_NOTE}</p>
          <pre className="estimate-tier2-block">
            {composeTier2Disclosure({ result, preparedBy, generatedAt })}
          </pre>
        </section>
      </article>
    </div>
  );
}
