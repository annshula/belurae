"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { VideoTile } from "@/components/product/VideoTile";
import { Icon } from "@/components/ui/Icon";
import type { ViewMedia } from "@/lib/commerce/product-view";
import { cn } from "@/lib/utils";

/**
 * PDP gallery — sticky stage on the left with the thumbnails beneath it.
 *
 *  - The stage is a native scroll-snap row: swipe on touch, arrow buttons and
 *    ←/→ keys on desktop, thumbnails jump to a slide. No carousel library.
 *  - The first slide is server-rendered with `priority`, so the LCP image
 *    never waits for JS.
 *  - Choosing a set in the purchase panel (`bl:variant` event) brings that
 *    set's photo to the stage.
 *  - Every slide reserves its aspect ratio: zero layout shift.
 */
export function ProductGallery({ media, productName }: { media: ViewMedia[]; productName: string }) {
  const stageRef = useRef<HTMLUListElement>(null);
  const thumbsRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const count = media.length;

  const goTo = useCallback((index: number, smooth = true) => {
    const stage = stageRef.current;
    if (!stage) return;
    const i = Math.max(0, Math.min(count - 1, index));
    stage.scrollTo({ left: i * stage.clientWidth, behavior: smooth ? "smooth" : "auto" });
  }, [count]);

  // Track the visible slide from scroll position.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(stage.scrollLeft / Math.max(1, stage.clientWidth))));
    };
    stage.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      stage.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Keep the active thumbnail in view — scroll the rail only, never the page.
  useEffect(() => {
    const rail = thumbsRef.current;
    const thumb = rail?.children[active] as HTMLElement | undefined;
    if (!rail || !thumb) return;
    const left = thumb.offsetLeft - rail.offsetLeft;
    if (left < rail.scrollLeft || left + thumb.offsetWidth > rail.scrollLeft + rail.clientWidth) {
      rail.scrollTo({ left: left - 8, behavior: "smooth" });
    }
  }, [active]);

  // Set chosen in the purchase panel → show its photo.
  useEffect(() => {
    const onVariant = (e: Event) => {
      const id = (e as CustomEvent<{ variantId: string }>).detail?.variantId;
      const index = media.findIndex((m) => m.type === "image" && m.variantId === id);
      if (index >= 0) goTo(index);
    };
    window.addEventListener("bl:variant", onVariant);
    return () => window.removeEventListener("bl:variant", onVariant);
  }, [media, goTo]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label={`${productName} images and video`}
      className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1.75rem)] lg:self-start"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(active + 1);
        if (e.key === "ArrowLeft") goTo(active - 1);
      }}
    >
      <div className="group/stage relative">
        <ul
          ref={stageRef}
          className="snap-row auto-cols-[100%] overflow-y-hidden rounded-media lg:max-h-[calc(100svh-var(--header-h)-var(--announce-h)-9rem)]"
          aria-live="polite"
        >
          {media.map((item, i) => (
            <li
              key={i}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== active}
              className="relative"
            >
              {item.type === "image" ? (
                <div className="well relative aspect-square overflow-hidden lg:aspect-auto lg:h-[calc(100svh-var(--header-h)-var(--announce-h)-9rem)]">
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
                  className="aspect-square overflow-hidden bg-ink lg:aspect-auto lg:h-[calc(100svh-var(--header-h)-var(--announce-h)-9rem)]"
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
        <ul ref={thumbsRef} className="snap-row mt-3 auto-cols-19 gap-2.5 p-0.5 md:auto-cols-22" aria-label="Choose image">
          {media.map((item, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${item.type === "video" ? "video" : "image"} ${i + 1}: ${item.alt}`}
                aria-current={i === active}
                className={cn(
                  "well relative block aspect-square w-full overflow-hidden rounded-[14px] transition-[box-shadow,opacity] duration-300",
                  i === active ? "shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "opacity-70 hover:opacity-100",
                )}
              >
                <Image
                  src={item.type === "image" ? item.url : item.poster}
                  alt=""
                  fill
                  sizes="88px"
                  className={cn("mix-blend-multiply", item.type === "image" ? "object-contain p-1.5" : "object-cover")}
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
    </section>
  );
}
