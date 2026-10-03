"use client";

import { useCallback, useRef, useState } from "react";

import {
  ReadMoreButton,
  ReviewExtras,
  ReviewFooter,
  ReviewMeta,
  useReviewOverflow,
} from "@/components/product/ReviewPanel";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import {
  FEED_PAGE_SIZE,
  SHOW_REVIEW_PHOTOS,
  type FeedFilter,
  type FeedPage,
  type Review,
  type ReviewSummary,
} from "@/lib/judgeme/types";
import { cn } from "@/lib/utils";

/**
 * The review feed: an aggregate panel (clickable star breakdown), quick filters
 * and a paginated list of full reviews.
 *
 * The reviews themselves never ship whole. The server renders page one into the
 * HTML (so crawlers and first paint have real reviews), and every other page or
 * filter is fetched from `/api/reviews`, 8 reviews at a time, and kept so going
 * back to a page is instant. Where they come from — Judge.me, else the local
 * set in `data/reviews.ts` — is decided on the server (`lib/reviews/feed.ts`).
 */

const STAR_ORDER = [5, 4, 3, 2, 1] as const;

export function ReviewsSection({
  summary,
  photoCount,
  initial,
  handle,
}: {
  /** Null when the product has no reviews at all. */
  summary: ReviewSummary | null;
  /** How many reviews carry a photo — the "With photos" chip's count. */
  photoCount: number;
  /** Page one of the feed, already in the server-rendered HTML. */
  initial: FeedPage;
  handle: string;
}) {
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [current, setCurrent] = useState<FeedPage>(initial);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  // Pages already fetched, so going back to one is instant and free.
  const cache = useRef(new Map<string, FeedPage>([["all:1", initial]]));
  // Only the latest request may land; a slower, older one is dropped.
  const latest = useRef(0);

  const load = useCallback(
    async (nextFilter: FeedFilter, nextPage: number) => {
      const key = `${nextFilter}:${nextPage}`;
      const ticket = ++latest.current;
      const cached = cache.current.get(key);
      if (cached) {
        setCurrent(cached);
        setLoading(false);
        setFailed(false);
        return;
      }
      setLoading(true);
      setFailed(false);
      try {
        const res = await fetch(
          `/api/reviews?${new URLSearchParams({
            handle,
            filter: String(nextFilter),
            page: String(nextPage),
          })}`,
        );
        if (!res.ok) throw new Error(`reviews ${res.status}`);
        const data = (await res.json()) as FeedPage;
        cache.current.set(key, data);
        if (ticket === latest.current) setCurrent(data);
      } catch {
        if (ticket === latest.current) setFailed(true);
      } finally {
        if (ticket === latest.current) setLoading(false);
      }
    },
    [handle],
  );

  if (!summary) return <NoReviewsYet />;

  const from = current.total === 0 ? 0 : (current.page - 1) * FEED_PAGE_SIZE + 1;
  const to = Math.min(current.page * FEED_PAGE_SIZE, current.total);
  const recommendPercent = summary.count
    ? Math.round(
        ((summary.distribution[5] + summary.distribution[4]) / summary.count) *
          100,
      )
    : 0;

  const chooseFilter = (next: FeedFilter) => {
    setFilter(next);
    void load(next, 1);
  };

  const goTo = (next: number) => {
    void load(filter, Math.min(Math.max(1, next), current.pages));
    // `scroll-mt` on the list keeps the sticky header off the top review.
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const chips: {
    id: FeedFilter;
    label: string;
    count: number;
    camera?: boolean;
  }[] = [
    { id: "all", label: "All reviews", count: summary.count },
    ...(SHOW_REVIEW_PHOTOS && photoCount > 0
      ? [
          {
            id: "photo" as FeedFilter,
            label: "With photos",
            count: photoCount,
            camera: true,
          },
        ]
      : []),
    ...STAR_ORDER.map((star) => ({
      id: star as FeedFilter,
      label: `${star} star${star === 1 ? "" : "s"}`,
      count: summary.distribution[star] ?? 0,
    })),
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-12">
      {/* ── Aggregate ─────────────────────────────────────────────────── */}
      <aside
        aria-label="Rating summary"
        className="surface h-fit p-7 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start"
      >
        <div className="flex items-baseline gap-2">
          <p className="font-serif text-heading-1 font-light leading-none">
            {summary.average.toFixed(1)}
          </p>
          <p className="font-ui text-body-sm text-ink-faint">/ 5</p>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-2">
          <Stars value={summary.average} />
          <span className="font-ui text-body-sm text-ink-soft tabular-nums">
            {summary.count.toLocaleString("en-US")} reviews
          </span>
        </p>

        <p className="mt-3 text-body-sm text-ink-soft">
          <strong className="font-numeral font-semibold text-ink tabular-nums">
            {recommendPercent}%
          </strong>{" "}
          rated it 4 or 5 stars.
        </p>

        <ul className="mt-6 flex flex-col gap-0.5">
          {STAR_ORDER.map((star) => {
            const n = summary.distribution[star];
            const percent = summary.count
              ? Math.round((n / summary.count) * 100)
              : 0;
            const active = filter === star;
            return (
              <li key={star}>
                <button
                  type="button"
                  onClick={() => chooseFilter(star)}
                  aria-pressed={active}
                  aria-label={`Show ${star} star reviews — ${n} of ${summary.count}`}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-btn px-2 py-2 font-ui text-body-sm transition-colors duration-200",
                    active ? "bg-sage-100" : "hover:bg-cream",
                  )}
                >
                  <span className="flex w-10 shrink-0 items-center gap-1 tabular-nums">
                    {star}
                    <Icon
                      name="star"
                      className="size-3.5 fill-current text-gold-500"
                      strokeWidth={1}
                    />
                  </span>
                  <span
                    className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand"
                    aria-hidden="true"
                  >
                    <span
                      className="block h-full rounded-full bg-sage-600"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-numeral text-ink-soft tabular-nums">
                    {n}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* ── Feed ──────────────────────────────────────────────────────── */}
      <div ref={listRef} className="scroll-mt-[calc(var(--header-h)+2rem)]">
        <div
          role="group"
          aria-label="Filter reviews"
          className="flex flex-wrap items-center gap-2"
        >
          {chips.map((chip) => {
            const active = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => chooseFilter(chip.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex min-h-10 items-center gap-2 rounded-btn px-4 font-ui text-body-sm font-medium transition-colors duration-200",
                  active
                    ? "bg-sage-600 text-ivory"
                    : "bg-porcelain text-ink-soft shadow-soft hover:bg-sand hover:text-ink",
                )}
              >
                {chip.camera && <Icon name="camera" className="size-4" />}
                {chip.label}
                <span
                  className={cn(
                    "font-numeral tabular-nums",
                    active ? "text-ivory/70" : "text-ink-faint",
                  )}
                >
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        <p
          aria-live="polite"
          className="mt-6 font-ui text-body-sm text-ink-faint tabular-nums"
        >
          {current.total === 0
            ? "No reviews match this filter."
            : `Showing ${from}–${to} of ${current.total.toLocaleString("en-US")} reviews`}
        </p>

        {failed && (
          <p
            role="alert"
            className="mt-4 rounded-card bg-cream px-4 py-3 font-ui text-body-sm text-ink-soft"
          >
            Couldn&apos;t load those reviews.{" "}
            <button
              type="button"
              onClick={() => void load(filter, current.page)}
              className="link-underline font-medium text-ink"
            >
              Try again
            </button>
          </p>
        )}

        {current.items.length === 0 ? (
          <EmptyFilterState onReset={() => chooseFilter("all")} />
        ) : (
          /* The list stays put and dims while the next page is fetched, so the
             page never jumps to empty and back. */
          <ul
            aria-busy={loading}
            className={cn(
              "mt-4 flex flex-col gap-4 transition-opacity duration-200",
              loading && "pointer-events-none opacity-50",
            )}
          >
            {current.items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </ul>
        )}

        {current.pages > 1 && (
          <nav
            aria-label="Reviews pagination"
            className="mt-8 flex flex-wrap items-center justify-end gap-1.5"
          >
            <PageButton
              label="Previous page"
              disabled={current.page === 1}
              onClick={() => goTo(current.page - 1)}
            >
              <Icon name="chevron-right" className="size-4 rotate-180" />
            </PageButton>

            {pageWindow(current.page, current.pages).map((entry, i) =>
              entry === "…" ? (
                <span
                  key={`gap-${i}`}
                  aria-hidden="true"
                  className="grid size-10 place-items-center font-ui text-body-sm text-ink-faint"
                >
                  …
                </span>
              ) : (
                <PageButton
                  key={entry}
                  label={`Page ${entry}`}
                  current={entry === current.page}
                  onClick={() => goTo(entry)}
                >
                  {entry}
                </PageButton>
              ),
            )}

            <PageButton
              label="Next page"
              disabled={current.page === current.pages}
              onClick={() => goTo(current.page + 1)}
            >
              <Icon name="chevron-right" className="size-4" />
            </PageButton>
          </nav>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────── pieces ─────────────────────────────── */

function ReviewCard({ review }: { review: Review }) {
  const { bodyRef, overflowing } = useReviewOverflow(review.body);

  return (
    <li>
      <article className="surface p-6 md:p-7">
        <ReviewMeta review={review} />

        {review.title && (
          <p className="mt-4 font-serif text-body-lg">{review.title}</p>
        )}
        {/* Four lines on the card; blank lines between paragraphs are
            flattened here, and the panel holds the full text one paragraph at
            a time. */}
        <p
          ref={bodyRef}
          className={cn(
            "line-clamp-4 max-w-[68ch] text-body-sm text-ink-soft",
            review.title ? "mt-1.5" : "mt-4",
          )}
        >
          {review.body}
        </p>

        {/* Flush under the clamp, so it reads as the rest of the sentence the
            ellipsis cut off. */}
        {overflowing && <ReadMoreButton review={review} />}

        <ReviewExtras review={review} />
        <ReviewFooter review={review} />
      </article>
    </li>
  );
}

function PageButton({
  label,
  children,
  onClick,
  current = false,
  disabled = false,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  current?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={cn(
        "grid size-10 place-items-center rounded-btn font-ui text-body-sm font-medium transition-colors duration-200",
        current
          ? "bg-sage-600 text-ivory"
          : "bg-porcelain text-ink-soft shadow-soft hover:bg-sand hover:text-ink",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {children}
    </button>
  );
}

function EmptyFilterState({ onReset }: { onReset: () => void }) {
  return (
    <div className="surface-tint mt-4 px-6 py-14 text-center">
      <p className="font-medium">No reviews match this filter yet.</p>
      <p className="mx-auto mt-2 max-w-sm text-body-sm text-ink-soft">
        Try another star rating, or go back to the full list.
      </p>
      <Button variant="outline" className="mt-6" onClick={onReset}>
        Show all reviews
      </Button>
    </div>
  );
}

/**
 * Nothing to show: no verified reviews from Judge.me and no placeholder set for
 * this handle. Says so plainly instead of borrowing reviews from elsewhere.
 */
function NoReviewsYet() {
  return (
    <div className="grid gap-6 rounded-media bg-sage-100 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
      <div>
        <p className="font-serif text-heading-1 font-light">No reviews yet.</p>
        <p className="mt-4 max-w-xl text-ink-soft">
          Belurae shows reviews from verified Belurae orders — we don&apos;t
          import reviews from marketplaces or other sellers. After your order
          arrives you&apos;ll get an email inviting you to share how it went.
        </p>
      </div>
      <p className="glass rounded-card px-6 py-5 text-body-sm md:max-w-64">
        <span className="block font-medium">Verified orders only</span>
        <span className="text-ink-soft">No imported or hidden reviews.</span>
      </p>
    </div>
  );
}

/* ────────────────────────────── helpers ────────────────────────────── */

/** Numeric page window with ellipsis gaps — e.g. [1, "…", 12, 13, 14, "…", 66]. */
function pageWindow(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [];
  const push = (entry: number | "…") => {
    if (out[out.length - 1] !== entry) out.push(entry);
  };
  push(1);
  if (page > 4) push("…");
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(total - 1, page + 1);
    i += 1
  ) {
    push(i);
  }
  if (page < total - 3) push("…");
  push(total);
  return out;
}
