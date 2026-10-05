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
  /**
   * When the order behind the review was placed, as an ISO instant. Shown
   * beside the pack, so a review reads as a purchase that arrived, was used and
   * then written up rather than as an opinion from nowhere. Optional: a source
   * that does not know the order date simply does not send one.
   */
  purchasedAt?: string;
  images: string[];
  /**
   * Where the review was written, when it was not written on this store. Set
   * for reviews carried over from another platform; the card says so, and does
   * not mark them as verified buyers. Absent means a review from this store.
   */
  source?: "tiktok";
  /**
   * The shop's public answer to this review. Set by hand in the review data
   * for the reviews we replied to; the card shows it under the review, and
   * shows nothing when there is none.
   */
  reply?: { id: string; body: string };
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviews = { reviews: Review[]; summary: ReviewSummary };

/**
 * Whether review photos are shown anywhere (cards, panel, buy-box carousel, the
 * "With photos" filter). Off for now: reviews read as text only. The photos
 * are still in the data — set this to `true` to bring them all back.
 */
export const SHOW_REVIEW_PHOTOS = false;

/** Reviews per page in the feed. */
export const FEED_PAGE_SIZE = 8;

/** What the feed can be narrowed to: everything, reviews with photos, or one star band. */
export type FeedFilter = "all" | "photo" | Review["rating"];

/**
 * One page of the feed, cut on the server so the whole review set never has to
 * travel to the browser: `total` is how many reviews match the filter, and
 * `pages` how many pages that makes.
 */
export type FeedPage = {
  items: Review[];
  total: number;
  page: number;
  pages: number;
};

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

/**
 * A reviewer's name as shown: each word keeps its first and last letter with
 * two stars between ("Nicholas M." → "N**s M**"), so a customer is never named
 * in full. A name that already carries stars was masked by the customer (or by
 * us, by hand) and is shown exactly as given.
 */
export function maskName(name: string): string {
  // "Verified buyer" is the stand-in when Judge.me has no name at all.
  if (name.includes("*") || name === "Verified buyer") return name;
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const letters = word.replace(/\.$/, "");
      if (letters.length === 0) return word;
      return letters.length === 1
        ? `${letters}**`
        : `${letters[0]}**${letters[letters.length - 1]}`;
    })
    .join(" ");
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
