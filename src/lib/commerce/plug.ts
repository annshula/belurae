/**
 * Mains plug types, for products sold in several plug variants. Plain data and
 * string matching only, so server and client components can share it.
 */

export type PlugRegion = "US" | "EU" | "UK" | "AU" | "JP";

/** The plug a variant value names, whether it is a code ("EU") or a supplier's name ("European"). */
export function plugRegionOfValue(value: string): PlugRegion | null {
  if (/^(US|American)/i.test(value)) return "US";
  if (/^(EU|European)/i.test(value)) return "EU";
  if (/^(UK|British)/i.test(value)) return "UK";
  if (/^(AU|Australian)/i.test(value)) return "AU";
  if (/^(JP|Japan)/i.test(value)) return "JP";
  return null;
}

/** Countries by plug type. Anywhere not listed falls back to the currency, then to US. */
const BY_COUNTRY: Record<string, PlugRegion> = {
  JP: "JP",
  GB: "UK", IE: "UK", MT: "UK", CY: "UK", HK: "UK", SG: "UK",
  AU: "AU", NZ: "AU",
  // Continental Europe
  AT: "EU", BE: "EU", BG: "EU", HR: "EU", CZ: "EU", DK: "EU", EE: "EU",
  FI: "EU", FR: "EU", DE: "EU", GR: "EU", HU: "EU", IS: "EU", IT: "EU",
  LV: "EU", LT: "EU", LU: "EU", NL: "EU", NO: "EU", PL: "EU", PT: "EU",
  RO: "EU", SK: "EU", SI: "EU", ES: "EU", SE: "EU", CH: "EU",
};

const BY_CURRENCY: Record<string, PlugRegion> = {
  JPY: "JP",
  GBP: "UK",
  AUD: "AU",
  NZD: "AU",
  EUR: "EU",
};

/**
 * The plug to preselect for a visitor: by their country, then by their local
 * currency, and US when neither tells us anything.
 */
export function plugRegionForVisitor(
  country: string | null | undefined,
  currency: string | null | undefined,
): PlugRegion {
  return (
    (country ? BY_COUNTRY[country.toUpperCase()] : undefined) ??
    (currency ? BY_CURRENCY[currency.toUpperCase()] : undefined) ??
    "US"
  );
}
