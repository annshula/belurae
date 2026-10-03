"use client";

import { useCallback, useRef, useState } from "react";

import {
  Avatar,
  ReadMoreButton,
  useInlinePreview,
} from "@/components/product/ReviewPanel";
import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import { formatReviewDate, type Review } from "@/lib/judgeme/types";
import { cn } from "@/lib/utils";

/**
 * "What customers say" — a review carousel that sits in the buy box, directly
 * beneath the reassurance line: the last objection the panel has to answer is
 * "what do other people say?".
 *
 * Two deliberately separate presentations of the same `Review[]` (there is no
 * second copy of review data; like the feed, neither is ever handed to
 * `productSchema`):
 *  - from sm up, the original one-slide-at-a-time carousel with arrows, dots
 *    and mouse/keyboard paging (`FeedbackDesktop`);
 *  - on phones, a native scroll-snap strip (`FeedbackMobile`): the browser owns
 *    touch scrolling, so a swipe always reaches the next review, and the next
 *    card peeks in from the right the way a native app hints there is more.
 */

/** Enough to show variety without making the panel bottom-heavy. */
const MAX_SLIDES = 5;

/**
 * Lines of review body a slide shows before the trigger. The line itself is
 * shared with the trigger — see `useInlinePreview` — so this is the height of
 * every slide, and of the panel, whether or not its review ran long.
 */
const PREVIEW_LINES = 3;

/** Movement in px before a horizontal drag counts as a swipe (desktop carousel). */
const SWIPE_THRESHOLD = 40;

export function PurchaseFeedback({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  return (
    <>
      <div className="sm:hidden">
        <FeedbackMobile reviews={reviews} className={className} />
      </div>
      <div className="hidden sm:block">
        <FeedbackDesktop reviews={reviews} className={className} />
      </div>
    </>
  );
}

/**
 * One slide of "What customers say". The desktop carousel and the phone's snap
 * strip differ only in how the track moves — the card inside them is the same,
 * so the clamp, its "Read more" and the reviewer's badge live here once.
 */
function FeedbackSlide({
  review,
  index,
  count,
  className,
  bodyClassName,
  hidden,
}: {
  review: Review;
  index: number;
  count: number;
  className?: string;
  bodyClassName?: string;
  hidden?: boolean;
}) {
  const { bodyRef, shown, trimmed } = useInlinePreview(
    review.body,
    PREVIEW_LINES,
  );

  return (
    <li
      aria-hidden={hidden}
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      className={className}
    >
      <div>
        <header className="flex items-baseline justify-between gap-3">
          <p className="flex items-center gap-2">
            <Stars value={review.rating} starClassName="size-3.5" />
            <span className="sr-only">{review.rating} out of 5 stars</span>
          </p>
          {/* The date belongs on the slide: the buy box is where a review is
              actually read, and “2 days ago” is not a date. */}
          <time
            dateTime={review.createdAt.slice(0, 10)}
            className="font-ui text-body-sm text-ink-faint tabular-nums"
          >
            {formatReviewDate(review.createdAt)}
          </time>
        </header>

        {review.title && (
          <p className="mt-2 font-serif text-body-lg font-medium">
            {review.title}
          </p>
        )}

        {/* Three lines, with the trigger sitting inside the last one rather
            than on a line of its own: a slide stretches to the tallest in the
            track, so the panel's height must not move because one review ran
            long. The clamp stays on as the no-JS cut. */}
        <p
          ref={bodyRef}
          className={cn(
            "mt-2 line-clamp-3 text-body-sm text-ink-soft",
            bodyClassName,
          )}
        >
          {shown}
          {trimmed && (
            <>
              {"… "}
              <ReadMoreButton review={review} />
            </>
          )}
        </p>
      </div>

      <footer className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-ui text-body-sm">
        <Avatar review={review} className="size-8 text-[0.8rem]" />
        <span className="font-medium">{review.author}</span>
        {review.country && (
          <span className="text-ink-faint">{review.country}</span>
        )}
        {review.itemTitle && (
          <span className="inline-flex items-center gap-1 text-ink-faint">
            <Icon name="package" className="size-3" />
            {review.itemTitle}
          </span>
        )}
        <span className="inline-flex items-center gap-1 font-medium text-success">
          <Icon
            name="check"
            className="size-3 text-success"
            strokeWidth={2.4}
          />
          Verified buyer
        </span>
      </footer>
    </li>
  );
}

function FeedbackDesktop({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  // The five newest reviews rather than the five-star ones: there are only
  // four of those, and a carousel that skips the 4★ is a highlight reel.
  const slides = reviews.slice(0, MAX_SLIDES);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  // Percent of one slide's width the track has been dragged so far — 0 outside
  // a drag. Applied on top of the index offset so the track visibly follows
  // the finger instead of only reacting once a threshold is crossed.
  const [dragPercent, setDragPercent] = useState(0);
  const dragFrom = useRef<{ x: number; id: number; width: number } | null>(
    null,
  );
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
            <DesktopArrow
              label="Previous review"
              onClick={() => go(index - 1)}
              icon="chevron-right"
              className="rotate-180"
            />
            <DesktopArrow
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
          style={{
            transform: `translateX(calc(-${index * 100}% + ${dragPercent}%))`,
          }}
        >
          {slides.map((review, i) => (
            <FeedbackSlide
              key={review.id}
              review={review}
              index={i}
              count={count}
              hidden={i !== index}
              /* min-h holds the track still: review bodies differ in length
                 and a sliding track is the one place a height change is
                 obvious. `justify-between` puts the slack between the text and
                 the reviewer's row rather than under it, so that row sits on
                 the slide's floor whichever card is beside it — a short review
                 must not leave its footer floating up. */
              className="flex min-h-20 w-full shrink-0 flex-col justify-between gap-3"
            />
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
function DesktopArrow({
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

/** Enough to show variety without making the panel bottom-heavy. */
function FeedbackMobile({
  reviews,
  className,
}: {
  reviews: Review[];
  className?: string;
}) {
  const slides = reviews.slice(0, MAX_SLIDES);
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLUListElement>(null);

  /** Scrolls the strip so slide `i` sits centred (matches `snap-center`). */
  const go = useCallback(
    (i: number) => {
      const track = trackRef.current;
      const slide = track?.children[Math.max(0, Math.min(count - 1, i))] as
        | HTMLElement
        | undefined;
      if (!track || !slide) return;
      const reduce = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      track.scrollTo({
        left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
        behavior: reduce ? "auto" : "smooth",
      });
    },
    [count],
  );

  /** The slide whose centre is nearest the strip's centre is the active one. */
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const mid = track.scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    setIndex((prev) => (prev === nearest ? prev : nearest));
  };

  if (count === 0) return null;

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
              disabled={index === 0}
              className="rotate-180"
            />
            <ArrowButton
              label="Next review"
              onClick={() => go(index + 1)}
              disabled={index === count - 1}
            />
          </div>
        )}
      </div>

      {/* Bleeds to the card edge on phones so cards can peek in from the side. */}
      <ul
        ref={trackRef}
        onScroll={onScroll}
        aria-live="polite"
        className="relative -mx-4 mt-3 flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overscroll-x-contain px-4 pb-1 scrollbar-none sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((review, i) => (
          <FeedbackSlide
            key={review.id}
            review={review}
            index={i}
            count={count}
            className="flex w-[86%] shrink-0 snap-center flex-col justify-between gap-4 rounded-2xl bg-cream/70 p-4 sm:w-full"
            /* Darker than the desktop slide: this one sits on the tinted
               card, where ink-soft loses too much contrast. Five lines here
               against the desktop's four, which is what it has always had. */
            bodyClassName="line-clamp-4 text-ink"
          />
        ))}
      </ul>

      {count > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {slides.map((review, i) => (
            <button
              key={review.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show review ${i + 1} of ${count}`}
              aria-current={i === index}
              /* 24px tall hit area around a 6px dot, so it is tappable. */
              className="grid h-6 place-items-center px-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600"
            >
              <span
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300 ease-out-soft",
                  i === index ? "w-5 bg-sage-600" : "w-1.5 bg-sage-200",
                )}
              />
            </button>
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
  disabled,
  className,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-sage-200 bg-paper text-sage-700 transition-colors duration-300 hover:border-sage-400 hover:text-sage-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600 disabled:opacity-40"
    >
      <Icon name="chevron-right" className={cn("size-4", className)} />
    </button>
  );
}
