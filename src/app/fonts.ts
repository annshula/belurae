import localFont from "next/font/local";

/**
 * Self-hosted type (WOFF2, latin subset) — no third-party font requests.
 * next/font generates size-adjusted fallbacks, so the swap causes no CLS.
 *
 *  - Instrument Serif: high-contrast editorial display face (fashion-magazine
 *    feel) with a true italic. Used for headings, prices, numerals.
 *  - Jost: geometric sans in the Futura tradition — the classic voice of
 *    cosmetics packaging — variable 300–600 for UI and body copy.
 *
 * Only the UI sans is preloaded; the display face is small (~25 KB) and loads
 * alongside, but the LCP element (hero image) never waits on it.
 */
export const sans = localFont({
  src: [{ path: "./fonts/jost.woff2", weight: "300 700", style: "normal" }],
  variable: "--ff-sans",
  display: "swap",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial"],
});

export const serif = localFont({
  src: [
    { path: "./fonts/instrument-serif.woff2", weight: "400", style: "normal" },
    { path: "./fonts/instrument-serif-italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--ff-serif",
  display: "swap",
  preload: true,
  fallback: ["Didot", "Bodoni 72", "Georgia", "serif"],
});
