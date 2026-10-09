import type { LandUnit } from "@/lib/data/properties";

// ── Conversion constants (UP Terai / Palia Kalan local standards) ──────────
//
// 1 Pucca Bigha (UP) = 0.6198 Acres
// 1 Acre            = 1.6134 Pucca Bigha  (commonly rounded to 1.6 locally)
// 1 Hectare         = 2.471 Acres         = 3.954 Pucca Bigha
// 1 Acre            = 43,560 sq.ft
// 1 Bigha (UP)      ≈ 27,000 sq.ft        = 0.6198 acre = 0.2508 hectare

export const CONVERSION = {
  BIGHA_TO_ACRE: 0.6198,
  BIGHA_TO_HECTARE: 0.25082,
  BIGHA_TO_SQFT: 27000,
  ACRE_TO_BIGHA: 1.6134,
  ACRE_TO_HECTARE: 0.40468,
  ACRE_TO_SQFT: 43560,
  HECTARE_TO_BIGHA: 3.9847,
  HECTARE_TO_ACRE: 2.4711,
  HECTARE_TO_SQFT: 107639,
  SQFT_TO_BIGHA: 1 / 27000,
  SQFT_TO_ACRE: 1 / 43560,
  SQFT_TO_HECTARE: 1 / 107639,
} as const;

/** Convert any land area to a target unit */
export function convertArea(
  value: number,
  from: LandUnit,
  to: LandUnit
): number {
  if (from === to) return value;

  // First convert to bigha as the base unit
  let inBigha: number;
  switch (from) {
    case "bigha":    inBigha = value; break;
    case "acre":     inBigha = value * CONVERSION.ACRE_TO_BIGHA; break;
    case "hectare":  inBigha = value * CONVERSION.HECTARE_TO_BIGHA; break;
    case "sqft":     inBigha = value * CONVERSION.SQFT_TO_BIGHA; break;
  }

  // Then convert from bigha to target
  switch (to) {
    case "bigha":    return round(inBigha, 3);
    case "acre":     return round(inBigha * CONVERSION.BIGHA_TO_ACRE, 3);
    case "hectare":  return round(inBigha * CONVERSION.BIGHA_TO_HECTARE, 3);
    case "sqft":     return round(inBigha * CONVERSION.BIGHA_TO_SQFT, 0);
  }
}

/** Format an area value with its unit label */
export function formatArea(value: number, unit: LandUnit): string {
  const labels: Record<LandUnit, string> = {
    bigha:   "Bigha",
    acre:    "Acre",
    hectare: "Hectare",
    sqft:    "Sq. Ft.",
  };
  const formatted = unit === "sqft"
    ? value.toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : value.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${formatted} ${labels[unit]}`;
}

/** Format a price in Indian number format with ₹ symbol */
export function formatPrice(price: number, compact = false): string {
  if (compact) {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000)   return `₹${(price / 100000).toFixed(2)} L`;
    if (price >= 1000)     return `₹${(price / 1000).toFixed(1)}K`;
    return `₹${price.toLocaleString("en-IN")}`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

/** Format price per unit (e.g. "₹5.6 L / Bigha") */
export function formatPricePerUnit(pricePerUnit: number, unit: LandUnit): string {
  const unitLabels: Record<LandUnit, string> = {
    bigha:   "Bigha",
    acre:    "Acre",
    hectare: "Hectare",
    sqft:    "Sq. Ft.",
  };
  return `${formatPrice(pricePerUnit, true)} / ${unitLabels[unit]}`;
}

/** Calculate price per unit from total price and area */
export function calcPricePerUnit(
  totalPrice: number,
  area: number,
  unit: LandUnit
): number {
  if (area <= 0) return 0;
  const areaInBigha = convertArea(area, unit, "bigha");
  if (areaInBigha <= 0) return 0;
  return Math.round(totalPrice / areaInBigha);
}

/** Get all conversions for a given area value */
export function getAllConversions(
  value: number,
  from: LandUnit
): Record<LandUnit, number> {
  return {
    bigha:   convertArea(value, from, "bigha"),
    acre:    convertArea(value, from, "acre"),
    hectare: convertArea(value, from, "hectare"),
    sqft:    convertArea(value, from, "sqft"),
  };
}

/** Round to N decimal places */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Distance label from town center */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m from Palia`;
  return `${km} km from Palia`;
}

/** Check if a price is in a given budget range (in Lakhs) */
export function isInBudget(price: number, minLakhs?: number, maxLakhs?: number): boolean {
  const inLakhs = price / 100000;
  if (minLakhs !== undefined && inLakhs < minLakhs) return false;
  if (maxLakhs !== undefined && inLakhs > maxLakhs) return false;
  return true;
}

export const UNIT_LABELS: Record<LandUnit, string> = {
  bigha:   "Bigha",
  acre:    "Acre",
  hectare: "Hectare",
  sqft:    "Sq. Ft.",
};

export const UNIT_SHORT: Record<LandUnit, string> = {
  bigha:   "Bigha",
  acre:    "Ac.",
  hectare: "Ha.",
  sqft:    "Sq.Ft.",
};
