import "server-only";

import { demoReviewsFor } from "@/data/reviews";
import { getProductReviews } from "@/lib/judgeme/reviews";
import {
  FEED_PAGE_SIZE,
  type FeedFilter,
  type FeedPage,
  type ProductReviews,
} from "@/lib/judgeme/types";

/**
 * Server side of the review feed. The set is never sent whole: the page ships
 * page one of it, and `/api/reviews` serves the rest a page at a time, so the
 * browser downloads 8 reviews however many a product has.
 */

/** Verified Judge.me reviews when there are any, otherwise the local set. */
export async function reviewSetFor(
  handle: string,
): Promise<ProductReviews | null> {
  return (await getProductReviews(handle)) ?? demoReviewsFor(handle);
}

/** How many reviews carry at least one photo — the "With photos" chip's count. */
export function photoCount(set: ProductReviews): number {
  return set.reviews.filter((r) => r.images.length > 0).length;
}

/** A `filter` query value, or "all" for anything we don't recognise. */
export function parseFilter(raw: string | null): FeedFilter {
  if (raw === "photo") return "photo";
  const star = Number(raw);
  return star >= 1 && star <= 5 && Number.isInteger(star)
    ? (star as FeedFilter)
    : "all";
}

/** One page of the feed under a filter; an out-of-range page is clamped. */
export function feedPage(
  set: ProductReviews,
  filter: FeedFilter,
  page: number,
): FeedPage {
  const matching =
    filter === "all"
      ? set.reviews
      : filter === "photo"
        ? set.reviews.filter((r) => r.images.length > 0)
        : set.reviews.filter((r) => r.rating === filter);

  const pages = Math.max(1, Math.ceil(matching.length / FEED_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pages);
  return {
    items: matching.slice(
      (current - 1) * FEED_PAGE_SIZE,
      current * FEED_PAGE_SIZE,
    ),
    total: matching.length,
    page: current,
    pages,
  };
}
