/**
 * Site-wide facts. Everything here is shown to customers and/or emitted as
 * structured data, so each value must be true. Edit here, not in components.
 */

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const site = {
  name: "Belurae",
  url: rawUrl.replace(/\/+$/, ""),
  tagline: "Beauty, made simpler.",
  descriptor: "Thoughtful care for everyday rituals.",
  description:
    "Belurae is a beauty and wellness store for simpler everyday body-care routines — starting with at-home hair removal, sold with full ingredient information, clear directions and honest limitations.",
  /** Where customers reach a human. */
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@shoptrackify.com",
  /** Stated on the live product page today (tracked delivery, 3–8 days). */
  delivery: { minDays: 3, maxDays: 8, tracked: true },
  /** Returns are started from the customer's order history (account → orders). */
  returnWindowDays: 30,
  /** Free-shipping threshold in store currency, or null when there is none. */
  freeShippingThreshold: null as number | null,
  locale: "en_US",
  social: [] as { label: string; href: string }[],
} as const;

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
