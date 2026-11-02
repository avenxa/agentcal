import assert from "node:assert/strict";
import test from "node:test";

import {
  bpFromDownPayment,
  calculateBuy,
  calculateStandardPtt,
  downPaymentFromBp,
  minimumDownPaymentCents,
  parsePercentToBp,
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
