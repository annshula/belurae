"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { VideoTile } from "@/components/product/VideoTile";
import { Icon } from "@/components/ui/Icon";
import type { ViewMedia } from "@/lib/commerce/product-view";
import { cn } from "@/lib/utils";

/** Horizontal travel before a gesture counts as a swipe rather than a tap. */
const SWIPE_THRESHOLD = 48;

/**
 * PDP gallery — sticky stage with the thumbnails beside it from lg up (a
 * vertical rail on the stage's left) and beneath it on phones (a horizontal
 * rail, as before).
 *
 *  - Swiping moves exactly one image per gesture — the track follows the finger
 *    and then snaps, so it never becomes a free-scrolling wheel. The arrows,
 *    ←/→ keys and the thumbnail rail jump straight to a slide. No carousel
 *    library.
 *  - From lg up the column is `--gallery-h` tall and sticks to the middle of
 *    the viewport, so it stays level with the purchase panel as you scroll.
 *  - The first slide is server-rendered with `priority`, so the LCP image
 *    never waits for JS.
 *  - Choosing a set in the purchase panel (`bl:variant` event) brings that
 *    set's photo to the stage.
 *  - Every slide reserves its aspect ratio: zero layout shift.
 */
export function ProductGallery({
  media,
  productName,
}: {
  media: ViewMedia[];
  productName: string;
}) {
  const thumbsRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  /** Live finger offset in px — the track follows it, then snaps. */
  const [dragX, setDragX] = useState(0);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const lastDxRef = useRef(0);
  const count = media.length;

  const goTo = useCallback(
    (index: number) => setActive(Math.max(0, Math.min(count - 1, index))),
    [count],
  );

  /*
   * Swiping moves exactly one image per gesture — never a free-scrolling
   * "wheel" the visitor has to catch. The track follows the finger (clamped to
   * one slide so it cannot run ahead), then lands on the neighbour when the
   * gesture passes SWIPE_THRESHOLD and springs back when it does not.
   * Mouse pointers are ignored: desktop uses the arrows, the keyboard and the
   * thumbnail rail.
   */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" || count < 2) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    draggingRef.current = false;
    lastDxRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!draggingRef.current) {
      if (Math.abs(dx) < 10) return;
      // Vertical intent belongs to the page, not the gallery.
      if (Math.abs(dy) > Math.abs(dx)) {
        startRef.current = null;
        return;
      }
      draggingRef.current = true;
    }
    const width = e.currentTarget.clientWidth || 1;
    let offset = Math.max(-width, Math.min(width, dx));
    const pastStart = active === 0 && offset > 0;
    const pastEnd = active === count - 1 && offset < 0;
    if (pastStart || pastEnd) offset *= 0.35; // resist at the ends
    lastDxRef.current = offset;
    setDragX(offset);
  };

  const endSwipe = () => {
    const wasDragging = draggingRef.current;
    startRef.current = null;
    draggingRef.current = false;
    const dx = lastDxRef.current;
    setDragX(0);
    if (wasDragging && Math.abs(dx) >= SWIPE_THRESHOLD) {
      goTo(active + (dx < 0 ? 1 : -1));
    }
  };

  // Keep the active thumbnail in view — scroll the rail only, never the page.
  // The rail is horizontal on phones and vertical from lg up, so the axis is
  // read from the rail itself instead of assumed.
  useEffect(() => {
    const rail = thumbsRef.current;
    const thumb = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !thumb) return;
    const railBox = rail.getBoundingClientRect();
    const box = thumb.getBoundingClientRect();
    if (rail.scrollHeight > rail.clientHeight + 1) {
      if (box.top < railBox.top)
        rail.scrollBy({ top: box.top - railBox.top - 8, behavior: "smooth" });
      else if (box.bottom > railBox.bottom)
        rail.scrollBy({
          top: box.bottom - railBox.bottom + 8,
          behavior: "smooth",
        });
    } else {
      if (box.left < railBox.left)
        rail.scrollBy({
          left: box.left - railBox.left - 8,
          behavior: "smooth",
        });
      else if (box.right > railBox.right)
        rail.scrollBy({
          left: box.right - railBox.right + 8,
          behavior: "smooth",
        });
    }
  }, [active]);

  // Set chosen in the purchase panel → show its photo.
  useEffect(() => {
    const onVariant = (e: Event) => {
      const id = (e as CustomEvent<{ variantId: string }>).detail?.variantId;
      const index = media.findIndex(
        (m) => m.type === "image" && m.variantId === id,
      );
      if (index >= 0) goTo(index);
    };
    window.addEventListener("bl:variant", onVariant);
    return () => window.removeEventListener("bl:variant", onVariant);
  }, [media, goTo]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${productName} images and video`}
      /* Stuck to the middle of the viewport: the stage is `--gallery-h` tall,
         so half of what is left over sits above it and half below. */
      className="min-w-0 lg:sticky lg:top-[calc((100svh-var(--gallery-h))/2)] lg:self-start"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(active + 1);
        if (e.key === "ArrowLeft") goTo(active - 1);
      }}
    >
      {/* Reversed on lg so the rail — which stays after the stage in the DOM,
          keeping the stage first for keyboard and screen-reader order — lands
          to its left. */}
      <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
        <div
          className="group/stage relative min-w-0 flex-1 touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endSwipe}
          onPointerCancel={endSwipe}
        >
          <ul
            className={cn(
              "flex overflow-hidden rounded-media",
              // No transition while the finger is down (the track must track it
              // exactly); back on for the snap, which is what animates.
              dragX === 0 && "transition-transform duration-500 ease-out-soft",
            )}
            style={{
              transform: `translate3d(calc(${-active * 100}% + ${dragX}px), 0, 0)`,
            }}
            aria-live="polite"
          >
            {media.map((item, i) => (
              <li
                key={i}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== active}
                inert={i !== active}
                className="w-full shrink-0"
              >
                {item.type === "image" ? (
                  <div className="well relative aspect-square overflow-hidden lg:aspect-auto lg:h-(--gallery-h)">
                    <Image
                      src={item.url}
                      alt={item.alt}
                      fill
                      priority={i === 0}
                      fetchPriority={i === 0 ? "high" : undefined}
                      loading={i === 0 ? undefined : "lazy"}
                      sizes="(min-width: 1024px) 52vw, 100vw"
                      className="object-contain p-6 mix-blend-multiply md:p-12"
                    />
                  </div>
                ) : (
                  <VideoTile
                    video={item}
                    className="aspect-square overflow-hidden bg-ink lg:aspect-auto lg:h-(--gallery-h)"
                  />
                )}
              </li>
            ))}
          </ul>

          {count > 1 && (
            <>
              <div className="glass pointer-events-none absolute bottom-4 left-4 rounded-tag px-3 py-1.5 text-[0.78rem] tabular-nums">
                {active + 1} / {count}
              </div>
              <div className="absolute right-4 bottom-4 hidden gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => goTo(active - 1)}
                  disabled={active === 0}
                  className="glass grid size-11 place-items-center rounded-[12px] transition-opacity disabled:opacity-40"
                  aria-label="Previous image"
                >
                  <Icon name="arrow-right" className="size-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(active + 1)}
                  disabled={active === count - 1}
                  className="glass grid size-11 place-items-center rounded-[12px] transition-opacity disabled:opacity-40"
                  aria-label="Next image"
                >
                  <Icon name="arrow-right" className="size-4" />
                </button>
              </div>
            </>
          )}
        </div>

        {count > 1 && (
          /* Horizontal snap row under the stage on phones; a vertical scroller
             on its left from lg up, as tall as the stage it sits beside. */
          <ul
            ref={thumbsRef}
            className="scrollbar-none flex w-full snap-x snap-mandatory gap-2.5 overflow-x-auto overscroll-x-contain p-0.5 [&::-webkit-scrollbar]:hidden lg:max-h-(--gallery-h) lg:w-22 lg:shrink-0 lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:p-0"
            aria-label="Choose image"
          >
            {media.map((item, i) => (
              <li key={i} className="shrink-0 snap-start">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${item.type === "video" ? "video" : "image"} ${i + 1}: ${item.alt}`}
                  aria-current={i === active}
                  className={cn(
                    "well relative block size-19 overflow-hidden rounded-[14px] transition-[box-shadow,opacity] duration-300 md:size-22",
                    i === active
                      ? "shadow-[inset_0_0_0_1.5px_var(--color-ink)]"
                      : "opacity-70 hover:opacity-100",
                  )}
                >
                  <Image
                    src={item.type === "image" ? item.url : item.poster}
                    alt=""
                    fill
                    sizes="88px"
                    className={cn(
                      "mix-blend-multiply",
                      item.type === "image"
                        ? "object-contain p-1.5"
                        : "object-cover",
                    )}
                  />
                  {item.type === "video" && (
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="glass grid size-7 place-items-center rounded-full">
                        <Icon name="play" className="size-3 translate-x-px" />
                      </span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
