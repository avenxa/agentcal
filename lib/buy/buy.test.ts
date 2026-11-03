import assert from "node:assert/strict";
import test from "node:test";

import {
  allocateTierDisplayCents,
  bpFromDownPayment,
  calculateBuy,
  calculateStandardPtt,
  downPaymentFromBp,
  minimumDownPaymentCents,
  parsePercentToBp,
  percentDisplayFromAmount,
} from "./buy.ts";

const d = (dollars: number) => dollars * 100;

test("approved PTT example vectors", () => {
  const vectors: [number, number][] = [
    [200_000, 2_000],
    [500_000, 8_000],
    [1_000_000, 18_000],
    [2_000_000, 38_000],
    [3_000_000, 68_000],
    [3_500_000, 93_000],
  ];
  for (const [v, tax] of vectors) {
    assert.equal(calculateStandardPtt(d(v)).totalCents, d(tax), `V=${v}`);
  }
});

test("PTT integer-cents boundaries below/equal/above $200k, $2m, $3m", () => {
  // $200k: 1% of 199,999.99 = 1,999.9999 -> 200000 cents (half-up of 199999.99)
  assert.equal(calculateStandardPtt(d(200_000) - 1).totalCents, 200_000);
  assert.equal(calculateStandardPtt(d(200_000)).totalCents, 200_000);
  // 200,000.01: 2000 + 2% of 0.01 = 0.0002 -> 200000
  assert.equal(calculateStandardPtt(d(200_000) + 1).totalCents, 200_000);
  assert.equal(calculateStandardPtt(d(200_000) + 100).totalCents, 200_000 + 2); // +$1 at 2% = 2 cents
  // $2m
  assert.equal(calculateStandardPtt(d(2_000_000) - 100).totalCents, d(38_000) - 2);
  assert.equal(calculateStandardPtt(d(2_000_000)).totalCents, d(38_000));
  assert.equal(calculateStandardPtt(d(2_000_000) + 100).totalCents, d(38_000) + 3);
  // $3m: marginal rate becomes 5%
  assert.equal(calculateStandardPtt(d(3_000_000) - 100).totalCents, d(68_000) - 3);
  assert.equal(calculateStandardPtt(d(3_000_000)).totalCents, d(68_000));
  assert.equal(calculateStandardPtt(d(3_000_000) + 100).totalCents, d(68_000) + 5);
  assert.equal(calculateStandardPtt(d(3_000_000) + 1).totalCents, d(68_000)); // 0.05 cent rounds down
});

test("PTT zero and tier breakdown", () => {
  assert.equal(calculateStandardPtt(0).totalCents, 0);
  assert.equal(calculateStandardPtt(0).tiers.length, 0);
  const t = calculateStandardPtt(d(3_500_000));
  assert.deepEqual(t.tiers.map((x) => x.rateBp), [100, 200, 300, 500]);
  assert.equal(t.tiers[3].portionCents, d(500_000));
  assert.throws(() => calculateStandardPtt(-1));
  assert.throws(() => calculateStandardPtt(1.5));
});

test("minimum down payment thresholds", () => {
  assert.equal(minimumDownPaymentCents(d(400_000)), d(20_000));
  assert.equal(minimumDownPaymentCents(d(500_000) - 20), d(25_000) - 1); // 5% of $499,999.80
  assert.equal(minimumDownPaymentCents(d(500_000)), d(25_000));
  assert.equal(minimumDownPaymentCents(d(1_000_000)), d(75_000));
  assert.equal(minimumDownPaymentCents(d(1_500_000) - 100), d(25_000) + Math.ceil((d(1_000_000) - 100) / 10));
  assert.equal(minimumDownPaymentCents(d(1_500_000)), d(300_000));
  assert.equal(minimumDownPaymentCents(d(2_000_000)), d(400_000));
  // exact 5% rounds up to the cent
  assert.equal(minimumDownPaymentCents(10_001), 501);
});

test("down payment amount/percent sync", () => {
  assert.equal(downPaymentFromBp(d(1_000_000), 2000), d(200_000));
  assert.equal(bpFromDownPayment(d(1_000_000), d(200_000)), 2000);
  assert.equal(downPaymentFromBp(d(500_001), 500), 2_500_005);
  assert.equal(bpFromDownPayment(0, 100), 0);
  assert.deepEqual(parsePercentToBp("12.5"), { status: "valid", bp: 1250 });
  assert.deepEqual(parsePercentToBp("20%"), { status: "valid", bp: 2000 });
  assert.equal(parsePercentToBp("1.234").status, "invalid");
  assert.equal(parsePercentToBp("-1").status, "invalid");
  assert.equal(parsePercentToBp("").status, "empty");
});

const base = {
  purchasePriceCents: d(1_000_000),
  taxableFmvCents: d(1_000_000),
  downPaymentCents: d(200_000),
  closingCostsCents: 0,
  depositPaidCents: 0,
  otherCreditsCents: 0,
};

test("reviewed example: P=V=$1m, D=$200k, C=0", () => {
  const r = calculateBuy(base);
  assert.equal(r.ptt.totalCents, d(18_000));
  assert.equal(r.totalContributionCents, d(218_000));
  assert.equal(r.baseMortgageCents, d(800_000));
  assert.equal(r.remainingDueCents, d(218_000));
  assert.equal(r.insuranceRequired, false);
  assert.equal(r.partial, false);
});

test("deposit E=$50k reduces remaining to $168k, no double deduction", () => {
  const r = calculateBuy({ ...base, depositPaidCents: d(50_000) });
  assert.equal(r.totalContributionCents, d(218_000));
  assert.equal(r.remainingDueCents, d(168_000));
  const r2 = calculateBuy({ ...base, depositPaidCents: d(50_000), otherCreditsCents: d(8_000) });
  assert.equal(r2.remainingDueCents, d(160_000));
  assert.equal(r2.baseMortgageCents, d(800_000)); // credits never touch the mortgage
});

test("credits exceeding contribution give reconciliation state, not a refund", () => {
  const r = calculateBuy({ ...base, depositPaidCents: d(300_000) });
  assert.equal(r.creditsExceedContribution, true);
  assert.equal(r.remainingDueCents, null);
  const exact = calculateBuy({ ...base, depositPaidCents: d(218_000) });
  assert.equal(exact.remainingDueCents, 0);
  assert.equal(exact.creditsExceedContribution, false);
});

test("below 20% marks a partial estimate; exactly 20% does not", () => {
  const under = calculateBuy({ ...base, downPaymentCents: d(200_000) - 1 });
  assert.equal(under.insuranceRequired, true);
  assert.equal(under.partial, true);
  assert.equal(under.partialReasons.length, 1);
  const at = calculateBuy({ ...base, downPaymentCents: d(200_000) });
  assert.equal(at.insuranceRequired, false);
});

test("closing costs not supplied is distinguishable from a supplied $0", () => {
  assert.equal(calculateBuy({ ...base, closingCostsCents: null }).closingCostsSupplied, false);
  assert.equal(calculateBuy({ ...base, closingCostsCents: 0 }).closingCostsSupplied, true);
  assert.equal(calculateBuy({ ...base, closingCostsCents: d(5_000) }).totalContributionCents, d(223_000));
});

test("blank closing costs make the estimate partial even at >=20% down; supplied costs do not", () => {
  const blank = calculateBuy({ ...base, closingCostsCents: null });
  assert.equal(blank.insuranceRequired, false);
  assert.equal(blank.partial, true);
  assert.equal(blank.partialReasons.length, 1);
  assert.match(blank.partialReasons[0], /Closing costs were not supplied/);
  // dollar amounts unchanged by the disclosure
  assert.equal(blank.totalContributionCents, d(218_000));
  assert.equal(blank.remainingDueCents, d(218_000));
  const supplied = calculateBuy({ ...base, closingCostsCents: 0 });
  assert.equal(supplied.partial, false);
  assert.deepEqual(supplied.partialReasons, []);
  const both = calculateBuy({ ...base, downPaymentCents: d(100_000), closingCostsCents: null });
  assert.equal(both.partialReasons.length, 2);
});

test("visible PTT tiers always sum exactly to the once-rounded total (reviewed + fractional FMV)", () => {
  const values = [
    0, 1, 99, 100, 149, 150, 199_999_99, 20_000_000 - 1, 20_000_000, 20_000_001, 20_000_050,
    20_000_149, 200_000_000 - 1, 200_000_000, 200_000_001, 200_000_050, 300_000_000 - 1,
    300_000_000, 300_000_001, 300_000_010, 300_000_050, 350_000_000, 350_000_033, 99_999_999_999,
  ];
  for (let v = 0; v < 1000; v++) values.push(v * 7_919_137 + (v % 100));
  for (const v of values) {
    const r = calculateStandardPtt(v);
    const sum = r.tiers.reduce((a, t) => a + t.displayCents, 0);
    assert.equal(sum, r.totalCents, `V=${v}`);
    for (const t of r.tiers) assert.ok(t.displayCents >= 0 && Number.isInteger(t.displayCents));
    // total is independent of display allocation: exact sum rounded half-up once
    const exact = r.tiers.reduce((a, t) => a + t.numerator, 0);
    assert.equal(r.totalCents, Math.floor((exact * 2 + 10_000) / 20_000), `V=${v}`);
  }
});

test("display allocation reconciles where independent per-tier rounding would differ by a cent", () => {
  // three tiers of exactly 0.5 cent: each rounds half-up to 1 (sum 3), total rounds to 2
  const numerators = [5_000, 5_000, 5_000];
  const independent = numerators.map((n) => Math.floor((n * 2 + 10_000) / 20_000));
  assert.equal(independent.reduce((a, b) => a + b, 0), 3);
  const total = Math.floor((15_000 * 2 + 10_000) / 20_000);
  assert.equal(total, 2);
  const shown = allocateTierDisplayCents(numerators, total);
  assert.deepEqual(shown, [0, 0, 2]); // remainder goes to the highest applicable tier
  assert.equal(shown.reduce((a, b) => a + b, 0), total);
  // zero (inapplicable) top tier is skipped
  assert.deepEqual(allocateTierDisplayCents([15_000, 5_000, 0], 2), [1, 1, 0]);
  assert.deepEqual(allocateTierDisplayCents([20_000, 0], 2), [2, 0]);
  assert.throws(() => allocateTierDisplayCents([30_000], 2));
});

test("fractional FMV: exact tiers, one rounding, reconciled display", () => {
  // $3,000,000.10 -> 68,000 + 10 cents*5% = 0.5 cent -> total rounds half-up to $68,000.01
  const r = calculateStandardPtt(300_000_010);
  assert.equal(r.totalCents, 6_800_001);
  assert.deepEqual(r.tiers.map((t) => t.displayCents), [200_000, 3_600_000, 3_000_000, 1]);
  // $200,000.50: 2,000 + 50c*2% = 1 cent
  assert.equal(calculateStandardPtt(20_000_050).totalCents, 200_001);
  // $200,000.25: 0.5 cent rounds half-up
  assert.equal(calculateStandardPtt(20_000_025).totalCents, 200_001);
  assert.equal(calculateStandardPtt(20_000_024).totalCents, 200_000);
});

test("minimum down payment: threshold transitions and fractional-cent inputs round up", () => {
  assert.equal(minimumDownPaymentCents(49_999_999), 2_499_999 + 1); // 5% of 499,999.99 = 24,999.9995 -> up
  assert.equal(minimumDownPaymentCents(50_000_000), 2_500_000);
  assert.equal(minimumDownPaymentCents(50_000_001), 2_500_001); // 25,000 + 0.1 cent -> up
  assert.equal(minimumDownPaymentCents(50_000_010), 2_500_001);
  assert.equal(minimumDownPaymentCents(50_000_011), 2_500_002);
  assert.equal(minimumDownPaymentCents(149_999_999), 2_500_000 + 10_000_000 - 0); // 25k + 10% of 999,999.99 = 124,999.999 -> up to 125,000.00
  assert.equal(minimumDownPaymentCents(150_000_000), 30_000_000);
  assert.equal(minimumDownPaymentCents(150_000_001), 30_000_001); // 20% of 1,500,000.01 = 300,000.002 -> up
  assert.equal(minimumDownPaymentCents(1), 1); // 0.05 cent -> 1 cent
  assert.equal(minimumDownPaymentCents(20), 1); // exactly 1 cent, no extra
  assert.equal(minimumDownPaymentCents(21), 2);
});

test("amount is exact and authoritative; percent is display only", () => {
  const p = 33_333_333; // $333,333.33
  const amount = 6_666_666; // $66,666.66
  const shown = percentDisplayFromAmount(p, amount);
  assert.equal(shown, "20");
  // re-deriving the amount from the rounded display would drift; the calculation must not do that
  assert.notEqual(downPaymentFromBp(p, 2000), amount);
  const r = calculateBuy({
    purchasePriceCents: p,
    taxableFmvCents: p,
    downPaymentCents: amount,
    closingCostsCents: 0,
    depositPaidCents: 0,
    otherCreditsCents: 0,
  });
  assert.equal(r.baseMortgageCents, p - amount);
  assert.equal(r.totalContributionCents, amount + r.ptt.totalCents);
  // explicit percent edit is half-up to the cent
  assert.equal(downPaymentFromBp(33_333_333, 1250), 4_166_667); // 4,166,666.625 -> up
  assert.equal(downPaymentFromBp(10_001, 5000), 5_001); // 5000.5 -> half-up
  assert.equal(percentDisplayFromAmount(0, 100), "");
  assert.equal(percentDisplayFromAmount(10_000, 1_234), "12.34");
});
