import Decimal from "decimal.js";

function groupedInteger(value: string): string {
  const negative = value.startsWith("-");
  const absolute = negative ? value.slice(1) : value;
  return `${negative ? "-" : ""}${absolute.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  )}`;
}

export function formatMoney(value: string | number | null | undefined): string {
  const decimal = new Decimal(String(value ?? "0").replace(",", "."));
  const fixed = decimal.toFixed(2);
  const [integer, fraction] = fixed.split(".");
  return `CHF ${groupedInteger(integer)},${fraction}`;
}

export function formatNumber(
  value: string | number | null | undefined,
  decimals = 2,
): string {
  const decimal = new Decimal(String(value ?? "0").replace(",", "."));
  const fixed = decimal.toFixed(decimals);
  const [integer, fraction] = fixed.split(".");
  return `${groupedInteger(integer)},${fraction}`;
}

export function formatPercent(value: string | number | null | undefined): string {
  const decimal = new Decimal(String(value ?? "0").replace(",", "."));
  return `${formatNumber(decimal.mul(100).toString(), 2)}%`;
}

export function decimalInputToRate(value: string): string {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return "";
  }

  try {
    return new Decimal(normalized).div(100).toString();
  } catch {
    return `invalid:${value}`;
  }
}

export function rateToDecimalInput(value: string): string {
  if (!value.trim()) {
    return "";
  }
  if (value.startsWith("invalid:")) {
    return value.slice("invalid:".length);
  }

  try {
    return new Decimal(value).mul(100).toFixed(4).replace(/\.?0+$/, "");
  } catch {
    return "";
  }
}
