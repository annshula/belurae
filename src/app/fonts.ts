import {
  Figtree,
  Fraunces,
  Instrument_Serif,
  Jost,
  Manrope,
  Plus_Jakarta_Sans,
  Poppins,
} from "next/font/google";

/**
 * A deliberate multi-role type system, not one font pair reused everywhere —
 * next/font/google self-hosts all of these at build time (no runtime request
 * to Google, no separate download step to maintain).
 *
 *  - Fraunces (display serif): warm, soft-serif display face built for large
 *    optical sizes (its `opsz` axis runs 9–144), with a gentle "SOFT" axis
 *    dialled in for rounded, less severe letterforms — reads as premium and
 *    warm rather than fashion-magazine sharp. Reserved for editorial headings
 *    and large numerals: the PDP/section titles, prices.
 *  - Manrope (body): a clean, slightly warm geometric grotesk, sized for
 *    reading — paragraphs, descriptions, FAQ answers.
 *  - Jost (interface): a refined geometric grotesk (Futura-inspired) reserved
 *    for UI chrome — nav links, buttons, form labels, eyebrows, badges — so
 *    the "controls" of the site read as quiet, considered interface rather
 *    than editorial prose or SaaS-technical chrome.
 *  - Instrument Serif (logotype): a single-weight, high-contrast display
 *    serif reserved for the BELURAE wordmark only — the brand mark gets its
 *    own distinct voice, separate from the Fraunces headings around it.
 *  - Poppins (numerals): a geometric sans reserved for prices and other
 *    standalone figures (PDP price, pack-card prices, cart totals) — a
 *    distinct, evenly-spaced numeral shape rather than reusing a text font.
 *  - Figtree (product title): a warm, rounded grotesk reserved for the PDP
 *    h1 — long, SEO-heavy Shopify titles need a plain, highly legible face at
 *    small-to-medium sizes rather than a display serif or the UI font.
 *
 * Only Manrope (body, used the most) is preloaded; the rest load alongside
 * it, and the LCP element (hero image) never waits on any of them.
 */
export const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-sans",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue"],
});

export const serif = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "variable",
  axes: ["SOFT", "opsz"],
  variable: "--ff-serif",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

export const ui = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ff-ui",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue"],
});

export const logo = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  variable: "--ff-logo",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
});

export const numeral = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--ff-numeral",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue"],
});

export const title = Figtree({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--ff-title",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue"],
});

/**
 * PDP-only heading face, matching the reference storefront's section
 * headings (Plus Jakarta Sans) — a page-scoped override, not the site's
 * default (Fraunces, `--ff-serif`), so only the product page picks it up via
 * SectionHeading's `titleClassName`.
 */
export const pdpHeading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--ff-pdp-heading",
  display: "swap",
  preload: false,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Helvetica Neue"],
});
