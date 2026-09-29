"use client";

import { useRef, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import type { Review } from "@/lib/judgeme/types";
import { cn } from "@/lib/utils";

/**
 * The top of the review feed, compressed into a carousel that sits in the buy
 * box directly beneath the "Secure payment by Shopify" reassurance — the last
 * objection the panel has to answer is "what do other people say?".
 *
 * Deliberately shallow: it takes the same `Review[]` the full feed renders and
 * shows the first few, so there is no second copy of review data anywhere. The
 * copy, names and countries are whatever the feed is showing (verified Judge.me
 * reviews when they exist, otherwise the placeholder set) — this component adds
 * no content of its own and, like the feed, is never handed to `productSchema`.
 *
 * One slide is visible at a time, so a swipe, an arrow key, the arrow buttons
 * and the dots all do the same job. Slides past the first overflow their track
 * rather than being duplicated, which keeps 5 reviews out of the way of the
 * crawler's first-paint budget.
 */

/** Enough to show variety without making the panel bottom-heavy. */
const MAX_SLIDES = 5;

/** Movement in px before a horizontal drag counts as a swipe. */
const SWIPE_THRESHOLD = 40;

export function PurchaseFeedback({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  const slides = reviews.filter((r) => r.rating === 5).slice(0, MAX_SLIDES);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  // Percent of one slide's width the track has been dragged so far — 0 outside
  // a drag. Applied on top of the index offset so the track visibly follows
  // the finger instead of only reacting once a threshold is crossed.
  const [dragPercent, setDragPercent] = useState(0);
  const dragFrom = useRef<{ x: number; id: number; width: number } | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  if (count === 0) return null;

  // Wraps in both directions — five slides, so an end stop would read as a bug.
  const go = (next: number) => setIndex(((next % count) + count) % count);

  const onDragStart = (clientX: number, pointerId: number) => {
    const width = trackRef.current?.getBoundingClientRect().width ?? 0;
    if (width === 0) return;
    dragFrom.current = { x: clientX, id: pointerId, width };
  };
  const onDragMove = (clientX: number, pointerId: number) => {
    const from = dragFrom.current;
    if (!from || from.id !== pointerId) return;
    const dx = clientX - from.x;
    setDragPercent((dx / from.width) * 100);
  };
  const onDragEnd = (clientX: number, pointerId: number) => {
    const from = dragFrom.current;
    dragFrom.current = null;
    setDragPercent(0);
    if (!from || from.id !== pointerId) return;
    const dx = clientX - from.x;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;
    go(dx < 0 ? index + 1 : index - 1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="What customers say"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(index - 1);
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          go(index + 1);
        }
      }}
      className={cn("surface-float px-4 py-4 sm:px-5", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-ui text-body-sm font-medium text-ink-soft">
          What customers say
        </p>

        {count > 1 && (
          <div className="flex items-center gap-1">
            <ArrowButton
              label="Previous review"
              onClick={() => go(index - 1)}
              icon="chevron-right"
              className="rotate-180"
            />
            <ArrowButton
              label="Next review"
              onClick={() => go(index + 1)}
              icon="chevron-right"
            />
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className="mt-3 overflow-hidden"
        onPointerDown={(event) => {
          if (event.pointerType === "mouse") return;
          onDragStart(event.clientX, event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.pointerType === "mouse") return;
          onDragMove(event.clientX, event.pointerId);
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "mouse") return;
          onDragEnd(event.clientX, event.pointerId);
        }}
        onPointerCancel={() => {
          dragFrom.current = null;
          setDragPercent(0);
        }}
      >
        <ul
          aria-live="polite"
          className={cn(
            "flex items-stretch ease-out-soft motion-reduce:transition-none",
            dragFrom.current
              ? "transition-none"
              : "transition-transform duration-500",
          )}
          style={{ transform: `translateX(calc(-${index * 100}% + ${dragPercent}%))` }}
        >
          {slides.map((review, i) => (
            <li
              key={review.id}
              aria-hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              /* min-h holds the track still: review bodies differ in length and
                 a sliding track is the one place a height change is obvious. */
              className="flex min-h-20 w-full shrink-0 flex-col gap-3"
            >
              <div>
                <p className="flex items-center gap-2">
                  <Stars value={review.rating} starClassName="size-3.5" />
                  <span className="sr-only">
                    {review.rating} out of 5 stars
                  </span>
                </p>

                <p className="mt-2.5 text-body-sm text-ink-soft">
                  {review.body}
                </p>
              </div>

              <footer className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-ui text-body-sm">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-sage-100 text-[0.8rem] font-medium text-sage-600"
                >
                  {review.author.charAt(0)}
                </span>
                <span className="font-medium">{review.author}</span>
                {review.country && (
                  <span className="text-ink-faint">{review.country}</span>
                )}
                <span className="inline-flex items-center gap-1 text-ink-faint">
                  <Icon
                    name="check"
                    className="size-3 text-sage-600"
                    strokeWidth={2.4}
                  />
                  Verified buyer
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>

      {count > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {slides.map((review, i) => (
            <button
              key={review.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show review ${i + 1} of ${count}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 ease-out-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
                i === index
                  ? "w-5 bg-sage-600"
                  : "w-1.5 bg-sage-200 hover:bg-sage-400",
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/** Circular pager arrow — one glyph, mirrored for "previous". */
function ArrowButton({
  label,
  onClick,
  icon,
  className,
}: {
  label: string;
  onClick: () => void;
  icon: "chevron-right";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-sage-200 bg-paper text-sage-700 transition-colors duration-300 hover:border-sage-400 hover:text-sage-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
    >
      <Icon name={icon} className={cn("size-4", className)} />
    </button>
  );
}
