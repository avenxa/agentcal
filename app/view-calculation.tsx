"use client";

import { useEffect, useId, useRef } from "react";

import { formatExactCad } from "../lib/engine/currency";
import type { SellerNetProceedsResult } from "../lib/engine/sell";
import type { SellerCalculatorUiState } from "../lib/engine/sell-calculator-form";
import {
  COMMISSION_PRESET_FORMULA,
  COMMISSION_PRESET_LABEL,
  TAX_EXCLUSION_NOTE,
  TIER1_DISCLAIMER,
} from "../lib/sell-copy";

type ViewCalculationProps = {
  open: boolean;
  onClose: () => void;
  calc: SellerCalculatorUiState;
};

function Row({
  label,
  detail,
  amount,
}: {
  label: string;
  detail?: string;
  amount: string;
}) {
  return (
    <div className="breakdown-row">
      <div>
        <p className="breakdown-label">{label}</p>
        {detail ? <p className="breakdown-detail">{detail}</p> : null}
      </div>
      <p className="tabular breakdown-amount">{amount}</p>
    </div>
  );
}

function formatSignedExact(cents: number): string {
  return formatExactCad(cents);
}

function focusVisibleViewTrigger() {
  document
    .querySelector<HTMLButtonElement>('[data-testid="view-calculation"]')
    ?.focus();
}

export function ViewCalculationDialog({
  open,
  onClose,
  calc,
}: ViewCalculationProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const result = calc.result;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && result) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, result]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => {
      onClose();
      focusVisibleViewTrigger();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  if (!result) {
    return (
      <dialog
        ref={dialogRef}
        className="calc-dialog"
        aria-labelledby={titleId}
      />
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className="calc-dialog"
      aria-labelledby={titleId}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          dialogRef.current?.close();
        }
      }}
    >
      <div className="calc-dialog-sheet">
        <div className="calc-dialog-header">
          <h2 id={titleId} className="section-title">
            View calculation
          </h2>
          <button
            type="button"
            className="icon-button"
            onClick={() => dialogRef.current?.close()}
          >
            Close
          </button>
        </div>
        <BreakdownBody result={result} />
      </div>
    </dialog>
  );
}

export function BreakdownBody({
  result,
  hideDisclosure = false,
}: {
  result: SellerNetProceedsResult;
  hideDisclosure?: boolean;
}) {
  const commissionDetail =
    result.commissionMode === "bc-preset"
      ? `${COMMISSION_PRESET_LABEL} · ${COMMISSION_PRESET_FORMULA}`
      : "Manual amount";

  return (
    <div className="breakdown-list">
      <Row
        label="Selling price"
        amount={formatSignedExact(result.inputs.sellingPriceCents)}
      />
      <Row
        label="Mortgage payout"
        amount={formatSignedExact(-result.inputs.mortgagePayoutCents)}
      />
      <Row
        label="Total brokerage commission"
        detail={commissionDetail}
        amount={formatSignedExact(-result.commissionBeforeGstCents)}
      />
      <Row
        label="GST on commission"
        detail="5% of the active commission amount"
        amount={formatSignedExact(-result.gstOnCommissionCents)}
      />
      <Row
        label="Legal/notary, incl. GST"
        amount={formatSignedExact(-result.inputs.legalNotaryIncludingGstCents)}
      />
      <Row
        label="Mortgage discharge fee"
        amount={formatSignedExact(-result.inputs.mortgageDischargeFeeCents)}
      />
      <Row
        label="Prepayment penalty"
        amount={formatSignedExact(-result.inputs.mortgagePrepaymentPenaltyCents)}
      />
      <Row
        label="Property-tax adjustment"
        detail="Positive adds to seller proceeds; negative reduces proceeds."
        amount={formatSignedExact(result.propertyTaxAdjustmentCents)}
      />
      <Row
        label="Other closing adjustments"
        amount={formatSignedExact(result.otherClosingAdjustmentsCents)}
      />
      <Row
        label="Estimated net proceeds"
        detail="Exact cents"
        amount={formatSignedExact(result.estimatedNetProceedsCents)}
      />
      {result.optionalPlanningTotalCents > 0 ? (
        <>
          <Row
            label="Optional planning costs"
            amount={formatSignedExact(-result.optionalPlanningTotalCents)}
          />
          <Row
            label="After optional planning costs"
            amount={formatSignedExact(result.estimatedAfterPlanningCents)}
          />
        </>
      ) : null}
      <p className="caption">
        Whole-dollar summaries on the main page use half-up rounding. Any
        difference from these exact cents is display rounding only.
      </p>
      <p className="caption">Rule version {result.ruleVersion}</p>
      {hideDisclosure ? null : (
        <>
          <p className="caption">{TIER1_DISCLAIMER}</p>
          <p className="caption">{TAX_EXCLUSION_NOTE}</p>
        </>
      )}
    </div>
  );
}
