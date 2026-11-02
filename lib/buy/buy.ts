/**
 * BUY Phase 1 — standard BC residential resale core (Issue #22).
 *
 * All money is integer CAD cents. No floating point is used in calculations.
 * Scope: 100% interest, residential, GST-nontaxable resale, no PTT exemption,
 * no additional PTT qualification beyond the >$3m residential surcharge.
 *
 * Sources (verify effective dates before relying on them):
 *  - BC general PTT: https://www2.gov.bc.ca/gov/content/taxes/property-taxes/property-transfer-tax
 *    1% to $200k, 2% $200k–$2m, 3% over $2m, plus 2% on the residential portion over $3m.
 *  - Minimum down payment: https://www.canada.ca/en/financial-consumer-agency/services/mortgages/down-payment.html
 */

export const BUY_RULE_VERSION = "buy-bc-standard-resale-p1-v0.2";
export const MAX_AMOUNT_CENTS = 100_000_000_000; // $1,000,000,000 sanity cap

const DOLLARS_200K = 20_000_000;
const DOLLARS_2M = 200_000_000;
const DOLLARS_3M = 300_000_000;
const DOLLARS_500K = 50_000_000;
const DOLLARS_1_5M = 150_000_000;

export type PttTier = {
  key: string;
  label: string;
  /** Portion of taxable FMV in this tier, in cents. */
  portionCents: number;
  /** Marginal rate in basis points of a percent (100 = 1%). */
  rateBp: number;
  /** Exact tax for this tier in 1/10000 cent units' numerator (portion*rateBp), before rounding. */
  numerator: number;
};

export type PttResult = {
  taxableFmvCents: number;
  totalCents: number;
  tiers: PttTier[];
};

/** Half-up integer division for non-negative integers. */
function divRoundHalfUp(numerator: number, denominator: number): number {
  return Math.floor((numerator * 2 + denominator) / (denominator * 2));
}

function divCeil(numerator: number, denominator: number): number {
  return Math.floor((numerator + denominator - 1) / denominator);
}

/**
 * Standard BC general PTT on taxable FMV `v` (cents). The total is the exact
 * sum of tier amounts rounded half-up to the cent once (whole-dollar FMV is
 * always exact). Rounding of sub-dollar FMV is a flagged methodology item.
 */
export function calculateStandardPtt(v: number): PttResult {
  if (!Number.isSafeInteger(v) || v < 0 || v > MAX_AMOUNT_CENTS) {
    throw new RangeError("Taxable FMV must be a non-negative safe integer in cents.");
  }
  const specs = [
    { key: "t1", label: "1% on the first $200,000", from: 0, to: DOLLARS_200K, rateBp: 100 },
    { key: "t2", label: "2% on $200,000 to $2,000,000", from: DOLLARS_200K, to: DOLLARS_2M, rateBp: 200 },
    { key: "t3", label: "3% on $2,000,000 to $3,000,000", from: DOLLARS_2M, to: DOLLARS_3M, rateBp: 300 },
    { key: "t4", label: "5% on the portion over $3,000,000 (3% + 2% additional)", from: DOLLARS_3M, to: Number.POSITIVE_INFINITY, rateBp: 500 },
  ];
  const tiers: PttTier[] = [];
  let numeratorTotal = 0;
  for (const spec of specs) {
    const portion = Math.max(0, Math.min(v, spec.to) - spec.from);
    if (portion === 0) continue;
    const numerator = portion * spec.rateBp;
    numeratorTotal += numerator;
    tiers.push({ key: spec.key, label: spec.label, portionCents: portion, rateBp: spec.rateBp, numerator });
  }
  return {
    taxableFmvCents: v,
    totalCents: divRoundHalfUp(numeratorTotal, 10_000),
    tiers,
  };
}

/** Per-tier display amount (rounded half-up); the headline total is rounded once from the exact sum. */
export function tierAmountCents(tier: PttTier): number {
  return divRoundHalfUp(tier.numerator, 10_000);
}

/** Ordinary minimum down payment reference (rounded up to the cent). Not lender approval. */
export function minimumDownPaymentCents(p: number): number {
  if (p < DOLLARS_500K) return divCeil(p * 5, 100);
  if (p < DOLLARS_1_5M) return 2_500_000 + divCeil((p - DOLLARS_500K) * 10, 100);
  return divCeil(p * 20, 100);
}

/** Down payment (cents) from a percent expressed in hundredths of a percent (basis points). */
export function downPaymentFromBp(p: number, bp: number): number {
  return divRoundHalfUp(p * bp, 10_000);
}

/** Percent in basis points (hundredths of a percent) for display, rounded half-up. */
export function bpFromDownPayment(p: number, d: number): number {
  if (p <= 0) return 0;
  return divRoundHalfUp(d * 10_000, p);
}

export type BuyInputs = {
  purchasePriceCents: number;
  taxableFmvCents: number;
  downPaymentCents: number;
  closingCostsCents: number | null; // null = not supplied
  depositPaidCents: number;
  otherCreditsCents: number;
};

export type BuyResult = {
  ruleVersion: string;
  ptt: PttResult;
  baseMortgageCents: number;
  minimumDownPaymentCents: number;
  /** D + PTT + C (no insurance premium, no GST, no other costs). */
  totalContributionCents: number;
  creditsCents: number;
  /** null when credits exceed the modelled contribution (unsupported reconciliation). */
  remainingDueCents: number | null;
  creditsExceedContribution: boolean;
  closingCostsSupplied: boolean;
  /** True when down payment < 20% (insurance required, premium not calculated). */
  insuranceRequired: boolean;
  /** Always true in Phase 1 unless D >= 20% and nothing else is excluded; see `partialReasons`. */
  partial: boolean;
  partialReasons: string[];
};

export function calculateBuy(inputs: BuyInputs): BuyResult {
  const p = inputs.purchasePriceCents;
  const d = inputs.downPaymentCents;
  const ptt = calculateStandardPtt(inputs.taxableFmvCents);
  const closing = inputs.closingCostsCents ?? 0;
  const total = d + ptt.totalCents + closing;
  const credits = inputs.depositPaidCents + inputs.otherCreditsCents;
  const exceeds = credits > total;
  const insuranceRequired = d * 5 < p; // d < 20% of p, exact integer comparison
  const partialReasons: string[] = [];
  if (insuranceRequired) {
    partialReasons.push(
      "Down payment is below 20%: mortgage default insurance is required and its premium is not yet calculated. The base mortgage and cash totals are partial.",
    );
  }
  return {
    ruleVersion: BUY_RULE_VERSION,
    ptt,
    baseMortgageCents: p - d,
    minimumDownPaymentCents: minimumDownPaymentCents(p),
    totalContributionCents: total,
    creditsCents: credits,
    remainingDueCents: exceeds ? null : total - credits,
    creditsExceedContribution: exceeds,
    closingCostsSupplied: inputs.closingCostsCents !== null,
    insuranceRequired,
    partial: insuranceRequired,
    partialReasons,
  };
}

/** Parse a percent string ("12.5") into basis points. */
export function parsePercentToBp(
  value: string,
):
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; bp: number } {
  const normalized = value.trim().replaceAll("%", "").replaceAll(/\s/g, "");
  if (normalized === "") return { status: "empty" };
  if (!/^(?:\d+|\d*\.\d{1,2})$/.test(normalized)) return { status: "invalid" };
  const [whole = "0", frac = ""] = normalized.split(".");
  const bp = Number(whole || "0") * 100 + Number(frac.padEnd(2, "0") || "0");
  if (!Number.isSafeInteger(bp)) return { status: "invalid" };
  return { status: "valid", bp };
}
