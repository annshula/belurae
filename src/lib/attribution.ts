/**
 * Ad-click attribution. Imported by both the browser and the checkout route,
 * so this file must NOT be a "use client" module (the route would get a
 * client reference instead of the exports).
 *
 * Shopify never sees the landing URL — the shopper reaches its hosted checkout
 * via a Storefront cart created from this site's API — so ad query params
 * would be lost at the first navigation. They're captured on landing, kept in
 * localStorage, and sent with the checkout request as cart attributes (see
 * api/cart/checkout/route.ts), which Shopify copies onto the order's
 * note_attributes.
 *
 * ALL query params of an ad landing are kept (utm_*, placement, fbclid, any
 * custom ones). A landing counts as an ad landing when it carries at least one
 * TRIGGER key; plain internal URLs (`?variant=…`, `?q=…`) never overwrite it.
 * Last-touch: a new ad landing replaces the stored set.
 */

export type Attribution = Record<string, string>;

const TRIGGER_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "placement",
  "fbclid",
  "gclid",
  "ttclid",
];

const STORAGE_KEY = "belurae.attribution.v2";
export const MAX_PARAMS = 30;
export const MAX_KEY = 40;
export const MAX_VALUE = 255;
const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_.\-]*$/;

/** Shared by browser and server: keeps only safe, bounded string pairs. */
export function sanitizeAttribution(input: unknown): Attribution {
  const out: Attribution = {};
  if (!input || typeof input !== "object") return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PARAMS) break;
    if (key.length > MAX_KEY || !KEY_PATTERN.test(key)) continue;
    if (typeof value !== "string") continue;
    const v = value.trim();
    // An unsubstituted Meta macro (`{{ad.id}}`) means the ad's URL tags were
    // misconfigured — not worth storing as if it were data.
    if (!v || v.length > MAX_VALUE || v.includes("{{")) continue;
    out[key] = v;
  }
  return out;
}

export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    if (!TRIGGER_KEYS.some((k) => params.has(k))) return;
    const found = sanitizeAttribution(Object.fromEntries(params));
    if (Object.keys(found).length === 0) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // Storage blocked — attribution is best-effort, never break the page.
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const out = sanitizeAttribution(JSON.parse(raw));
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}
