"use client";

import Link from "next/link";
import { useState } from "react";

import {
  BUY_RULE_VERSION,
  MAX_AMOUNT_CENTS,
  bpFromDownPayment,
  calculateBuy,
  downPaymentFromBp,
  minimumDownPaymentCents,
  parsePercentToBp,
  tierAmountCents,
  type BuyResult,
} from "../../lib/buy/buy";
import {
  formatExactCad,
  formatFieldCad,
  parseCurrencyToCents,
} from "../../lib/engine/currency";
import { TIER1_DISCLAIMER } from "../../lib/sell-copy";
import { CurrencyField } from "../currency-field";

type Form = {
  price: string;
  fmv: string;
  fmvEdited: boolean;
  fmvConfirmed: boolean;
  dpAmount: string;
  dpPercent: string;
  closing: string;
  deposit: string;
  credits: string;
  gstNonTaxable: boolean;
  standardCase: boolean;
};

const INITIAL: Form = {
  price: "",
  fmv: "",
  fmvEdited: false,
  fmvConfirmed: false,
  dpAmount: "",
  dpPercent: "",
  closing: "",
  deposit: "",
  credits: "",
  gstNonTaxable: false,
  standardCase: false,
};

type Errors = Partial<
  Record<
    | "price"
    | "fmv"
    | "fmvConfirmed"
    | "down"
    | "closing"
    | "deposit"
    | "credits"
    | "assumptions",
    string
  >
>;

function cents(value: string): number | null | "invalid" {
  const parsed = parseCurrencyToCents(value);
  if (parsed.status === "empty") return null;
  if (parsed.status === "invalid") return "invalid";
  return parsed.cents;
}

function validate(f: Form): { errors: Errors; result: BuyResult | null } {
  const errors: Errors = {};
  const price = cents(f.price);
  if (price === null) errors.price = "Enter the purchase price.";
  else if (price === "invalid" || price <= 0 || price > MAX_AMOUNT_CENTS)
    errors.price = "Enter a positive amount, up to $1,000,000,000, in dollars and cents.";

  const fmvRaw = f.fmv === "" && !f.fmvEdited ? f.price : f.fmv;
  const fmv = cents(fmvRaw);
  if (fmv === null) errors.fmv = "Enter the PTT taxable fair market value.";
  else if (fmv === "invalid" || fmv <= 0 || fmv > MAX_AMOUNT_CENTS)
    errors.fmv = "Enter a positive amount, up to $1,000,000,000.";
  if (!f.fmvConfirmed) errors.fmvConfirmed = "Confirm the taxable value before calculating.";

  const optional = (value: string, key: "closing" | "deposit" | "credits") => {
    const c = cents(value);
    if (c === "invalid" || (c !== null && (c < 0 || c > MAX_AMOUNT_CENTS))) {
      errors[key] = "Enter zero or a positive amount.";
      return null;
    }
    return c;
  };
  const closing = optional(f.closing, "closing");
  const deposit = optional(f.deposit, "deposit");
  const credits = optional(f.credits, "credits");

  const validPrice = typeof price === "number" && !errors.price;
  let down: number | null = null;
  const dpA = cents(f.dpAmount);
  if (dpA === "invalid" || (typeof dpA === "number" && dpA < 0)) {
    errors.down = "Enter a valid down payment amount or percent.";
  } else if (dpA === null) {
    errors.down = "Enter the down payment as dollars or a percent.";
  } else if (validPrice) {
    down = dpA;
    if (down > price) errors.down = "Down payment cannot exceed the purchase price.";
    else if (down < minimumDownPaymentCents(price))
      errors.down = `Below the ordinary minimum down payment of ${formatFieldCad(
        minimumDownPaymentCents(price),
      )} for this price. This estimate does not support lower amounts.`;
  }
  if (!f.gstNonTaxable || !f.standardCase)
    errors.assumptions = "Confirm both standard-case assumptions to calculate.";

  if (Object.keys(errors).length > 0 || !validPrice || down === null || typeof fmv !== "number")
    return { errors, result: null };
  return {
    errors,
    result: calculateBuy({
      purchasePriceCents: price,
      taxableFmvCents: fmv,
      downPaymentCents: down,
      closingCostsCents: closing,
      depositPaidCents: deposit ?? 0,
      otherCreditsCents: credits ?? 0,
    }),
  };
}

export function BuyApp() {
  const [form, setForm] = useState<Form>(INITIAL);
  const [mode, setMode] = useState<"inputs" | "results">("inputs");
  const [attempted, setAttempted] = useState(false);
  const [result, setResult] = useState<BuyResult | null>(null);
  const { errors } = validate(form);
  const show = (key: keyof Errors) => (attempted || (key === "down" && form.dpAmount !== "") ? errors[key] : undefined);

  function patch(next: Partial<Form>) {
    setForm((current) => ({ ...current, ...next }));
  }

  /** Recompute the non-source down payment representation from the source. */
  function syncDown(f: Form, source: "amount" | "percent", priceStr = f.price): Form {
    const price = cents(priceStr);
    const p = typeof price === "number" && price > 0 ? price : null;
    if (source === "amount") {
      const a = cents(f.dpAmount);
      return {
        ...f,
        dpPercent:
          p && typeof a === "number" && a >= 0
            ? (bpFromDownPayment(p, a) / 100).toString()
            : "",
      };
    }
    const bp = parsePercentToBp(f.dpPercent);
    return {
      ...f,
      dpAmount:
        p && bp.status === "valid"
          ? (downPaymentFromBp(p, bp.bp) / 100).toFixed(2)
          : "",
    };
  }

  const [source, setSource] = useState<"amount" | "percent">("amount");

  function onPrice(value: string) {
    setForm((f) => syncDown({ ...f, price: value }, source, value));
  }
  function onFmv(value: string) {
    patch({ fmv: value, fmvEdited: true, fmvConfirmed: false });
  }
  function onAmount(value: string) {
    setSource("amount");
    setForm((f) => syncDown({ ...f, dpAmount: value }, "amount"));
  }
  function onPercent(value: string) {
    setSource("percent");
    setForm((f) => syncDown({ ...f, dpPercent: value }, "percent"));
  }

  function calculate() {
    setAttempted(true);
    const outcome = validate(form);
    if (!outcome.result) {
      document.getElementById("buy-errors")?.focus();
      return;
    }
    setResult(outcome.result);
    setMode("results");
    window.scrollTo({ top: 0 });
  }

  function editInputs() {
    setMode("inputs");
    window.scrollTo({ top: 0 });
  }

  const fmvDisplay = form.fmv === "" && !form.fmvEdited ? form.price : form.fmv;
  const errorList = Object.entries(errors);

  return (
    <div className="sc-shell" data-testid="buy-app">
      <header className="sc-entry-header">
        <Link href="/" className="v2-link-button" data-testid="to-sell">
          ← SELL estimate
        </Link>
        <h1 className="sc-title">BUY estimate</h1>
        <p className="sc-subtitle">
          Standard BC residential resale · Phase 1 · CAD
        </p>
      </header>

      {mode === "results" && result ? (
        <BuyResults result={result} form={form} onEdit={editInputs} />
      ) : (
        <form
          className="v2-stack"
          noValidate
          data-testid="buy-inputs"
          onSubmit={(event) => {
            event.preventDefault();
            calculate();
          }}
        >
          <h2 className="v2-mode-heading" tabIndex={-1}>
            BUY · Inputs
          </h2>

          {attempted && errorList.length > 0 ? (
            <div
              id="buy-errors"
              className="sc-notice sc-notice-warning"
              role="alert"
              tabIndex={-1}
              data-testid="buy-error-summary"
            >
              <p className="sc-notice-text">Fix these before calculating:</p>
              <ul>
                {errorList.map(([key, message]) => (
                  <li key={key}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <section className="sc-card" aria-labelledby="buy-purchase">
            <h3 id="buy-purchase" className="sc-card-title">
              The purchase
            </h3>
            <CurrencyField
              id="buyPrice"
              label="Purchase price (CAD)"
              badge="Required"
              value={form.price}
              error={show("price")}
              emptyMeansBlank
              onChange={onPrice}
            />
            <CurrencyField
              id="buyFmv"
              label="PTT taxable fair market value (CAD)"
              badge="Required"
              hint={
                form.fmvEdited
                  ? "Value property transfer tax is charged on."
                  : "Suggested: same as the purchase price. Change it if the taxable value differs."
              }
              value={fmvDisplay}
              error={show("fmv")}
              emptyMeansBlank
              onChange={onFmv}
            />
            <label className="buy-check">
              <input
                type="checkbox"
                data-testid="confirm-fmv"
                checked={form.fmvConfirmed}
                aria-describedby={show("fmvConfirmed") ? "fmvConfirmed-error" : undefined}
                onChange={(event) => patch({ fmvConfirmed: event.target.checked })}
              />
              <span>I confirm this is the taxable value for property transfer tax.</span>
            </label>
            {show("fmvConfirmed") ? (
              <p id="fmvConfirmed-error" className="field-error" role="alert">
                {errors.fmvConfirmed}
              </p>
            ) : null}
          </section>

          <section className="sc-card" aria-labelledby="buy-down">
            <h3 id="buy-down" className="sc-card-title">
              Down payment
            </h3>
            <CurrencyField
              id="buyDownAmount"
              label="Down payment (CAD)"
              badge="Required"
              hint="Enter dollars or a percent below; the other updates."
              value={form.dpAmount}
              error={show("down")}
              emptyMeansBlank
              onChange={onAmount}
            />
            <div className="amount-row">
              <label className="amount-row-text" htmlFor="buyDownPercent">
                <span className="amount-label">Down payment (%)</span>
              </label>
              <input
                id="buyDownPercent"
                className="amount-input tabular"
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                placeholder="e.g. 20"
                value={form.dpPercent}
                aria-invalid={Boolean(errors.down && attempted)}
                onChange={(event) => onPercent(event.target.value)}
              />
            </div>
            <p className="sc-muted-text">
              Ordinary minimum for this price (illustrative, not lender approval):{" "}
              <span className="tabular" data-testid="min-down">
                {(() => {
                  const p = cents(form.price);
                  return typeof p === "number" && p > 0
                    ? formatFieldCad(minimumDownPaymentCents(p))
                    : "—";
                })()}
              </span>
            </p>
          </section>

          <section className="sc-card" aria-labelledby="buy-optional">
            <h3 id="buy-optional" className="sc-card-title">
              Costs and credits you know about
            </h3>
            <CurrencyField
              id="buyClosing"
              label="Closing costs you expect to pay (CAD)"
              badge="Optional"
              hint="Legal, adjustments, etc. Left blank = not supplied, not zero."
              value={form.closing}
              error={show("closing")}
              onChange={(value) => patch({ closing: value })}
            />
            <CurrencyField
              id="buyDeposit"
              label="Deposit already paid (CAD)"
              badge="Optional"
              hint="Confirmed deposit already paid toward this purchase."
              value={form.deposit}
              error={show("deposit")}
              onChange={(value) => patch({ deposit: value })}
            />
            <CurrencyField
              id="buyCredits"
              label="Other confirmed buyer cash credits (CAD)"
              badge="Optional"
              hint="Only credits that reduce cash due at closing. Do not repeat the deposit."
              value={form.credits}
              error={show("credits")}
              onChange={(value) => patch({ credits: value })}
            />
          </section>

          <section className="sc-card" aria-labelledby="buy-assume">
            <h3 id="buy-assume" className="sc-card-title">
              Standard case only
            </h3>
            <label className="buy-check">
              <input
                type="checkbox"
                data-testid="confirm-gst"
                checked={form.gstNonTaxable}
                onChange={(event) => patch({ gstNonTaxable: event.target.checked })}
              />
              <span>
                This is a resale that is not subject to GST (not a new or substantially
                renovated home).
              </span>
            </label>
            <label className="buy-check">
              <input
                type="checkbox"
                data-testid="confirm-standard"
                checked={form.standardCase}
                onChange={(event) => patch({ standardCase: event.target.checked })}
              />
              <span>
                100% interest in a residential property, with no property transfer tax
                exemption, no additional PTT, no mixed use, and no fractional ownership.
              </span>
            </label>
            <p className="sc-muted-text">
              First-time buyer and newly built exemptions, GST, insurance premiums and
              other cases are not calculated in this version.
            </p>
          </section>

          <button type="submit" className="sc-primary-button" data-testid="buy-calculate">
            Calculate
          </button>
          <p className="sc-caption">{TIER1_DISCLAIMER}</p>
        </form>
      )}
    </div>
  );
}

function BuyResults({
  result,
  form,
  onEdit,
}: {
  result: BuyResult;
  form: Form;
  onEdit: () => void;
}) {
  const partial = result.partial;
  return (
    <div className="v2-stack" data-testid="buy-results">
      <div className="v2-results-top">
        <h2 className="v2-mode-heading" tabIndex={-1}>
          BUY · Results
        </h2>
        <button
          type="button"
          className="secondary-button v2-edit-button"
          data-testid="buy-edit-inputs"
          onClick={onEdit}
        >
          Edit inputs
        </button>
      </div>

      {partial ? (
        <div className="sc-notice sc-notice-warning" role="status" data-testid="buy-partial">
          <p className="sc-notice-text">
            <strong>Partial estimate — insurance premium not yet calculated.</strong>{" "}
            {result.partialReasons.join(" ")}
          </p>
        </div>
      ) : null}

      <section className="sc-card" aria-labelledby="buy-cash">
        <h3 id="buy-cash" className="sc-card-title">
          Cash you need
        </h3>
        <dl className="buy-rows">
          <div className="buy-row">
            <dt>
              Total estimated buyer contribution{partial ? " (partial)" : ""}
              <span className="buy-sub">Down payment + PTT + closing costs entered</span>
            </dt>
            <dd className="tabular" data-testid="buy-contribution">
              {formatExactCad(result.totalContributionCents)}
            </dd>
          </div>
          {result.creditsCents > 0 ? (
            <div className="buy-row">
              <dt>Less: deposit and credits already confirmed</dt>
              <dd className="tabular" data-testid="buy-credits">
                −{formatExactCad(result.creditsCents)}
              </dd>
            </div>
          ) : null}
          <div className="buy-row buy-row-final">
            <dt>Remaining cash due at closing{partial ? " (partial)" : ""}</dt>
            <dd className="tabular" data-testid="buy-remaining">
              {result.remainingDueCents === null
                ? "Cannot be determined"
                : formatExactCad(result.remainingDueCents)}
            </dd>
          </div>
        </dl>
        {result.creditsExceedContribution ? (
          <p className="field-warning" role="status" data-testid="buy-reconcile">
            Deposit and credits ({formatExactCad(result.creditsCents)}) exceed the modelled
            contribution ({formatExactCad(result.totalContributionCents)}). No cash due or
            refund is shown; check the figures with your professional.
          </p>
        ) : null}
        {!result.closingCostsSupplied ? (
          <p className="sc-muted-text" data-testid="buy-closing-unsupplied">
            Closing costs: not supplied. They are not counted above and are not an
            authoritative zero.
          </p>
        ) : null}
      </section>

      <section className="sc-card" aria-labelledby="buy-ptt">
        <h3 id="buy-ptt" className="sc-card-title">
          Property transfer tax (standard)
        </h3>
        <dl className="buy-rows" data-testid="buy-ptt">
          {result.ptt.tiers.map((tier) => (
            <div className="buy-row" key={tier.key}>
              <dt>
                {tier.label}
                <span className="buy-sub">on {formatExactCad(tier.portionCents)}</span>
              </dt>
              <dd className="tabular">{formatExactCad(tierAmountCents(tier))}</dd>
            </div>
          ))}
          <div className="buy-row buy-row-final">
            <dt>
              Total PTT
              <span className="buy-sub">
                On taxable value {formatExactCad(result.ptt.taxableFmvCents)}
              </span>
            </dt>
            <dd className="tabular" data-testid="buy-ptt-total">
              {formatExactCad(result.ptt.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="sc-card" aria-labelledby="buy-mortgage">
        <h3 id="buy-mortgage" className="sc-card-title">
          Base mortgage
        </h3>
        <dl className="buy-rows">
          <div className="buy-row buy-row-final">
            <dt>
              Purchase price less down payment{partial ? " (before insurance)" : ""}
              <span className="buy-sub">Not affected by PTT, deposit or credits</span>
            </dt>
            <dd className="tabular" data-testid="buy-mortgage">
              {formatExactCad(result.baseMortgageCents)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="sc-card" aria-labelledby="buy-assumptions">
        <h3 id="buy-assumptions" className="sc-card-title">
          Assumptions and exclusions
        </h3>
        <ul className="buy-list" data-testid="buy-assumptions">
          <li>Standard BC general PTT for a 100% residential interest on the taxable value you confirmed (1% / 2% / 3%, plus 2% more over $3,000,000).</li>
          <li>Resale not subject to GST; no PTT exemption and no additional PTT.</li>
          <li>Not included: mortgage default insurance premium, GST, first-time buyer or newly built exemptions, adjustments, legal fees unless entered, and any other costs.</li>
          <li>Minimum down payment is the ordinary illustrative reference (5% / $25,000 + 10% over $500,000 / 20%), not financing approval.</li>
          <li>
            Sources:{" "}
            <a href="https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax" target="_blank" rel="noreferrer">BC property transfer tax</a>
            {" · "}
            <a href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html" target="_blank" rel="noreferrer">FCAC down payment</a>.
          </li>
          <li>Rule {BUY_RULE_VERSION}. Purchase price {formatFieldCad(cents(form.price) as number)}.</li>
        </ul>
        <p className="sc-caption" data-testid="buy-disclaimer">
          Estimate only — not mortgage, lender, tax or legal advice. Confirm every figure with
          a qualified lawyer, notary, mortgage professional and the BC government before
          relying on it.
        </p>
      </section>
    </div>
  );
}
