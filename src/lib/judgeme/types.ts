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
   * The reviewer's own picture, when they have one. Most reviews do not, and
   * the card falls back to an empty-profile placeholder icon.
   */
  avatar?: string;
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

/**
 * When a review was written, as a short plain date: "Oct 2".
 *
 * Deliberately not "Today"/"Yesterday": the fixture's dates are anchored to
 * the render day, so a relative label would rewrite itself under a reader who
 * left the page open, and a fixed date reads the same on the server as it does
 * after hydration. No year — every review in the feed is from the last few
 * months, and the year is noise at that distance.
 */
export function formatReviewDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
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
