/**
 * Review shapes and pure helpers shared by the three things that touch
 * reviews: the Judge.me fetch (`lib/judgeme/reviews.ts`), the placeholder
 * dataset (`data/reviews.ts`) and the reviews UI (`product/ReviewsSection`).
 *
 * Types and pure functions only — deliberately **not** `server-only`, because
 * the client-side review feed imports this module. Anything that talks to
 * Judge.me stays in `reviews.ts`.
 */

export type Review = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string;
  author: string;
  /**
   * Reviewer's market, when the source knows it. Judge.me's API does not send
   * one, so this is only ever set by the placeholder dataset.
   */
  country?: string;
  /**
   * What the reviewer actually bought — the pack or variant, as the source
   * knows it (`content/products.ts` pack labels for the placeholder set).
   * Shown on the card so a review reads as a purchase rather than a floating
   * opinion. Optional: not every source sends one, and the card hides it when
   * it is missing.
   */
  itemTitle?: string;
  /** ISO instant. */
  createdAt: string;
  images: string[];
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviews = { reviews: Review[]; summary: ReviewSummary };

/** Midnight UTC of the day `date` falls in — the unit the labels below use. */
function dayStart(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * When a review was written, in the feed's own words: "Today", "Yesterday",
 * "N days ago" inside the last week, then a short date (with the year only
 * once it stops being recent).
 *
 * Day-granular on purpose: the first page is server-rendered and the client
 * re-renders it moments later, so a label that only changes when the calendar
 * day does is the one that cannot drift between the two.
 */
export function formatReviewDate(iso: string, now: Date = new Date()): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  const days = Math.round((dayStart(now) - dayStart(then)) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    ...(days > 300 ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(then);
}

/** Counts, mean (rounded to 1 decimal) and the per-star distribution. */
export function summarize(reviews: Review[]): ReviewSummary {
  const distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  } as ReviewSummary["distribution"];
  for (const r of reviews) distribution[r.rating] += 1;
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10, distribution };
}
