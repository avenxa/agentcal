/**
 * CA-BC rule data for Feature 01. Scenario, jurisdiction, and locale stay
 * separable: this module is the single jurisdiction-scoped source for the
 * Typical BC commission tiers, GST rate, money bounds, and rule version.
 * Presentation copy and en-CA formatting live outside the calculation engine.
 */
export const FEATURE_01_JURISDICTION = "CA-BC" as const;
export type Feature01Jurisdiction = typeof FEATURE_01_JURISDICTION;

export const SELL_RULE_VERSION = "sell-bc-2026-08-09-v1";

/** $100,000,000 expressed as integer cents. */
export const MAX_MONEY_CENTS = 10_000_000_000;

/** $100,000 first-tier boundary expressed as integer cents. */
export const BC_COMMISSION_FIRST_TIER_CENTS = 10_000_000;

/**
 * Typical BC preset rates as parts per thousand so commission can be computed
 * as one aggregate rational amount before a single half-up round to cents.
 * 7% = 70/1000; 2.5% = 25/1000.
 */
export const BC_COMMISSION_FIRST_TIER_PER_MILLE = 70;
export const BC_COMMISSION_BALANCE_PER_MILLE = 25;

/** GST on commission: 5%. */
export const BC_GST_RATE_PERCENT = 5;
