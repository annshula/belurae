"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import { formatReviewDate, type Review } from "@/lib/judgeme/types";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

/**
 * The review pieces that more than one surface needs: the reviewer's badge, the
 * stars/date header, the photos and the pack, the footer, the "Read more"
 * trigger and the panel that trigger opens.
 *
 * The panel is a bottom sheet on a phone and a centred dialog from md up — the
 * same split, and the same two dismiss controls, as the account's item status
 * panel. A long review is a wall of prose next to the list, and cutting it off
 * mid-sentence is a worse answer than a tap.
 *
 * The trigger is plain text with no button chrome: it sits directly under the
 * line the clamp cut, so it reads as the end of the review it belongs to
 * rather than as a control bolted onto the card.
 */

/**
 * Whether a clamped preview is actually cut off. That is a layout question, not
 * a character count — the same body runs to five lines on a phone and three on
 * a desktop card — so the element is measured, and re-measured when it resizes.
 * Pass the body text: a different review re-measures from scratch.
 */
export function useReviewOverflow(body: string) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => setOverflowing(el.scrollHeight - el.clientHeight > 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [body]);

  return { bodyRef, overflowing };
}

/**
 * The trigger's own type. The measuring stand-in in `useInlinePreview` is given
 * the same classes, so the room it reserves is the room the real button takes.
 */
const TRIGGER_TYPE = "font-ui text-body-sm font-medium";

/**
 * A clamped preview whose "Read more" sits at the end of the last line.
 *
 * `line-clamp` cannot put anything after the ellipsis it draws — the clamp
 * trims the box, so a trigger rendered after the text is the first thing to
 * disappear. So the cut is measured instead: an off-screen stand-in with the
 * same box and the same type is asked how much of the body still fits in
 * `lines` lines *together with* the trigger, and the body is cut back to the
 * last word that does. A review short enough to finish inside the clamp is
 * left whole and gets no trigger at all.
 *
 * The clamp stays on the caller's paragraph as a safety net: if measurement
 * never runs (no JS), the preview is still cut rather than spilling.
 */
export function useInlinePreview(body: string, lines: number) {
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(body);
  const [trimmed, setTrimmed] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;

    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
      const width = el.clientWidth;
      if (!lineHeight || !width) return;
      const limit = lineHeight * lines + 1;

      const probe = el.cloneNode(false) as HTMLParagraphElement;
      probe.style.position = "absolute";
      probe.style.left = "-10000px";
      probe.style.width = `${width}px`;
      probe.style.visibility = "hidden";

      const text = document.createTextNode("");
      const tail = document.createElement("span");
      tail.className = TRIGGER_TYPE;
      tail.textContent = "Read more";
      probe.append(text, tail);
      el.parentElement?.append(probe);

      const fits = (candidate: string, withTrigger: boolean) => {
        tail.style.display = withTrigger ? "" : "none";
        text.data = withTrigger ? `${candidate}… ` : candidate;
        return probe.scrollHeight <= limit;
      };

      const words = body.split(/\s+/).filter(Boolean);
      let cut = words.length;
      if (!fits(body, false)) {
        // Bisect on words: the longest prefix that still leaves room for the
        // ellipsis and the trigger on the last line.
        let lo = 1;
        let hi = words.length;
        while (lo < hi) {
          const mid = Math.ceil((lo + hi) / 2);
          if (fits(words.slice(0, mid).join(" "), true)) lo = mid;
          else hi = mid - 1;
        }
        cut = lo;
      }

      probe.remove();
      setShown(cut >= words.length ? body : words.slice(0, cut).join(" "));
      setTrimmed(cut < words.length);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [body, lines]);

  return { bodyRef, shown, trimmed };
}

/**
 * "Read more" and the panel it opens. Owns the open state, so a caller only has
 * to render it under a clamped body — and only when `useReviewOverflow` or
 * `useInlinePreview` says the body was cut.
 */
export function ReadMoreButton({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useScrollLock(open);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "cursor-pointer text-sage-600 transition-colors duration-200 hover:text-sage-800",
          TRIGGER_TYPE,
          className,
        )}
      >
        Read more
      </button>

      {open &&
        mounted &&
        createPortal(
          <ReviewPanel review={review} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

/** The reviewer's picture when we have one, an empty-profile placeholder when we do not. */
export function Avatar({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  if (review.avatar) {
    return (
      /* Unoptimized on purpose: an avatar is already a 160px thumbnail, and the
         site's custom loader would otherwise rewrite it into a srcset of
         derivatives of a derivative. Same call the review photos make. */
      <Image
        src={review.avatar}
        alt=""
        width={64}
        height={64}
        unoptimized
        className={cn(
          "shrink-0 rounded-full bg-sage-100 object-cover",
          className,
        )}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "block shrink-0 overflow-hidden rounded-full bg-sage-100 text-sage-400",
        className,
      )}
    >
      {/* Filled head and shoulders, cropped by the circle: the usual empty
          profile picture, so it reads as "no photo" rather than as an icon. */}
      <svg viewBox="0 0 32 32" className="size-full" fill="currentColor">
        <circle cx="16" cy="12.5" r="5.5" />
        <path d="M4 32c0-7 5.4-11 12-11s12 4 12 11z" />
      </svg>
    </span>
  );
}

/** Stars and the day the review carries — shared by the card and the panel. */
export function ReviewMeta({
  review,
  className,
}: {
  review: Review;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2",
        className,
      )}
    >
      <p className="flex items-center gap-2">
        <Stars value={review.rating} />
        <span className="sr-only">{review.rating} out of 5 stars</span>
      </p>
      <time
        dateTime={review.createdAt.slice(0, 10)}
        className="font-ui text-body-sm text-ink-faint tabular-nums"
      >
        {formatReviewDate(review.createdAt)}
      </time>
    </header>
  );
}

/** Photos and the pack they bought, when the review carries either. */
export function ReviewExtras({ review }: { review: Review }) {
  return (
    <>
      {review.images.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {review.images.slice(0, 4).map((src) => (
            <li
              key={src}
              className="relative size-20 overflow-hidden rounded-card bg-cream"
            >
              <Image
                src={src}
                alt={`Photo from ${review.author}'s review`}
                fill
                sizes="80px"
                className="object-cover"
                unoptimized
              />
            </li>
          ))}
        </ul>
      )}

      {review.itemTitle && (
        /* What they actually bought. A review with a pack under it reads as a
           purchase; without one it reads as an opinion floating in space. */
        <p className="mt-4 inline-flex flex-wrap items-center gap-1.5 rounded-tag bg-cream px-2.5 py-1 font-ui text-body-sm">
          <Icon
            name="package"
            aria-hidden="true"
            className="size-3.5 shrink-0 text-sage-600"
          />
          <span className="text-ink-faint">Bought</span>
          <span className="font-medium text-ink-soft">{review.itemTitle}</span>
        </p>
      )}
    </>
  );
}

/** Who wrote it, where they are, and that the order was a real one. */
export function ReviewFooter({ review }: { review: Review }) {
  return (
    <footer className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 font-ui text-body-sm">
      <Avatar review={review} className="size-8" />
      <span className="font-medium">{review.author}</span>
      {review.country && (
        <span className="text-ink-faint">{review.country}</span>
      )}
      <span className="inline-flex items-center gap-1.5 font-medium text-success">
        <Icon
          name="check"
          className="size-3.5 text-success"
          strokeWidth={2.4}
        />
        Verified buyer
      </span>
    </footer>
  );
}

/** One review's full text, on its own surface. */
function ReviewPanel({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  /* Blank lines in the body are paragraph breaks; a one-paragraph body (which
     is every generated review) yields a single entry. */
  const paragraphs = useMemo(
    () =>
      review.body
        .split(/\n{2,}/)
        .map((part) => part.trim())
        .filter(Boolean),
    [review.body],
  );

  return (
    <div className="fixed inset-0 z-85 flex items-end justify-center md:items-center md:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Full review from ${review.author}`}
        className="relative flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-media bg-paper pb-[env(safe-area-inset-bottom)] shadow-drift md:max-h-[80vh] md:max-w-2xl md:rounded-panel md:pb-0"
      >
        {/* The grab handle is the sheet's own dismiss control, not decoration:
            it says the sheet can be dismissed before anyone reads a word, and
            on a phone it reaches the thumb far more easily than a corner X. A
            tall sheet leaves little scrim to tap, so it has to be tappable. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="group/handle grid shrink-0 cursor-pointer touch-manipulation place-items-center py-3 md:hidden"
        >
          <span
            aria-hidden="true"
            className="h-1 w-11 rounded-pill bg-sand transition-colors duration-300 group-active/handle:bg-sage-300"
          />
        </button>

        {/* The dialog gets the corner X instead — a pointer has no trouble with
            it, and there is no handle to grab. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 hidden size-11 place-items-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-blush hover:text-sage-600 md:grid"
        >
          <Icon name="close" className="size-4" strokeWidth={2.2} />
        </button>

        <div className="overflow-y-auto overscroll-contain px-6 pt-2 pb-8 md:px-8 md:pt-8">
          {/* `pr` keeps the date out from under the dialog's corner X. */}
          <ReviewMeta review={review} className="md:pr-14" />

          {review.title && (
            <p className="mt-4 font-serif text-heading-2">{review.title}</p>
          )}

          <div
            className={cn(
              "flex max-w-[68ch] flex-col gap-3 text-ink-soft",
              review.title ? "mt-3" : "mt-4",
            )}
          >
            {paragraphs.map((part, i) => (
              <p key={`p-${i}`}>{part}</p>
            ))}
          </div>

          <ReviewExtras review={review} />
          <ReviewFooter review={review} />
        </div>
      </div>
    </div>
  );
}
