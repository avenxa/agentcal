export type ParsedCurrency =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "valid"; cents: number };

const exactCurrencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeCurrencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  currencyDisplay: "narrowSymbol",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function parseCurrencyToCents(value: string): ParsedCurrency {
  const normalized = value
    .trim()
    .replaceAll(",", "")
    .replaceAll("$", "")
    .replaceAll(/\s/g, "");

  if (normalized === "") {
    return { status: "empty" };
  }

  if (!/^[+-]?(?:\d+|\d*\.\d{1,2})$/.test(normalized)) {
    return { status: "invalid" };
  }

  const sign = normalized.startsWith("-") ? -1 : 1;
  const unsigned = normalized.replace(/^[+-]/, "");
  const [dollarsPart = "0", centsPart = ""] = unsigned.split(".");
  const dollars = Number(dollarsPart || "0");
  const cents = Number(centsPart.padEnd(2, "0") || "0");
  const totalCents = sign * (dollars * 100 + cents);

  if (!Number.isSafeInteger(totalCents)) {
    return { status: "invalid" };
  }

  return { status: "valid", cents: totalCents };
}

export function roundCentsToWholeDollars(cents: number): number {
  const sign = cents < 0 ? -1 : 1;
  return sign * Math.floor((Math.abs(cents) + 50) / 100);
}

export function formatExactCad(cents: number): string {
  return exactCurrencyFormatter.format(cents / 100);
}

export function formatWholeCad(cents: number): string {
  return wholeCurrencyFormatter.format(roundCentsToWholeDollars(cents));
}

export function formatFieldCad(cents: number): string {
  return cents % 100 === 0 ? formatWholeCad(cents) : formatExactCad(cents);
}
