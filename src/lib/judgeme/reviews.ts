import "server-only";

import { isJudgemeConfigured, judgemeConfig, JUDGEME_REVIEWS_ENDPOINT } from "./config";

/**
 * Verified Belurae reviews from Judge.me — server-only (the API token never
 * reaches the browser).
 *
 * AUTHENTICITY RULES (blueprint §14, §60):
 *  - Only reviews Judge.me marks as a verified buyer are shown.
 *  - Imported reviews (marketplace/supplier imports) are excluded: they
 *    describe another seller's orders, not Belurae customers'.
 *  - When the rules leave nothing, the page shows no reviews and emits no
 *    rating schema. There is no placeholder dataset.
 *
 * Judge.me's product filter params don't scope this shop's responses, so the
 * whole pool is paged once per hour and filtered by `product_handle` here.
 */

export type Review = {
  id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string;
  author: string;
  createdAt: string;
  images: string[];
};

export type ReviewSummary = {
  count: number;
  average: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

type JudgemeReview = {
  id: number;
  rating: number;
  body: string | null;
  title: string | null;
  created_at: string;
  hidden: boolean;
  published: boolean;
  curated?: string | null;
  verified?: string | null;
  source?: string | null;
  product_handle: string | null;
  reviewer?: { name?: string | null } | null;
  pictures?: { hidden?: boolean; urls: { original: string; compact?: string } }[];
};

const PER_PAGE = 100;
const MAX_PAGES = 20;
const VERIFIED = new Set(["buyer", "confirmed-buyer", "verified-buyer"]);
const IMPORTED = /import|aliexpress|amazon|csv|ali|cj|temu|etsy|shopee/i;

async function fetchAll(shopDomain: string, apiToken: string): Promise<JudgemeReview[]> {
  const all: JudgemeReview[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(JUDGEME_REVIEWS_ENDPOINT);
    url.searchParams.set("api_token", apiToken);
    url.searchParams.set("shop_domain", shopDomain);
    url.searchParams.set("per_page", String(PER_PAGE));
    url.searchParams.set("page", String(page));
    const res = await fetch(url, { next: { revalidate: 3600, tags: ["reviews"] } });
    if (!res.ok) break;
    const data = (await res.json()) as { reviews?: JudgemeReview[] };
    const reviews = data.reviews ?? [];
    all.push(...reviews);
    if (reviews.length < PER_PAGE) break;
  }
  return all;
}

function displayName(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Verified buyer";
  const first = parts[0]!;
  const last = parts.length > 1 ? ` ${parts[parts.length - 1]![0]!.toUpperCase()}.` : "";
  return `${first}${last}`;
}

function isAuthentic(r: JudgemeReview): boolean {
  if (!r.published || r.hidden) return false;
  if (!r.verified || !VERIFIED.has(r.verified)) return false;
  if (r.source && IMPORTED.test(r.source)) return false;
  return Boolean(r.body?.trim() || r.title?.trim());
}

export function summarize(reviews: Review[]): ReviewSummary {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as ReviewSummary["distribution"];
  for (const r of reviews) distribution[r.rating] += 1;
  const count = reviews.length;
  const average = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { count, average: Math.round(average * 10) / 10, distribution };
}

export type ProductReviews = { reviews: Review[]; summary: ReviewSummary };

/** Verified reviews for a Shopify product handle; null when none qualify or on any failure. */
export async function getProductReviews(handle: string): Promise<ProductReviews | null> {
  const cfg = judgemeConfig();
  if (!isJudgemeConfigured(cfg)) return null;
  try {
    const raw = await fetchAll(cfg.shopDomain, cfg.apiToken);
    const reviews: Review[] = raw
      .filter((r) => r.product_handle === handle && isAuthentic(r))
      .map((r) => ({
        id: String(r.id),
        rating: Math.min(5, Math.max(1, Math.round(r.rating))) as Review["rating"],
        title: r.title?.trim() || null,
        body: r.body?.trim() || "",
        author: displayName(r.reviewer?.name),
        createdAt: r.created_at,
        images: (r.pictures ?? []).filter((p) => !p.hidden).map((p) => p.urls.compact ?? p.urls.original),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (reviews.length === 0) return null;
    return { reviews, summary: summarize(reviews) };
  } catch {
    return null;
  }
}
