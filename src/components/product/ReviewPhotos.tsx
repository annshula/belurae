"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Icon } from "@/components/ui/Icon";
import { maskName } from "@/lib/judgeme/types";
import { cn } from "@/lib/utils";

// Same lightbox the product gallery uses, loaded only when a photo is opened.
const GalleryLightbox = dynamic(
  () => import("@/components/product/GalleryLightbox"),
  { ssr: false },
);

/**
 * One tile's picture, with a spinner over its reserved square until the image
 * has painted, so the tile never looks empty or pops in. A picture that was
 * already cached (or finished before React attached `onLoad`) is caught by the
 * ref check, so it doesn't sit under a spinner forever.
 */
function PhotoImage({ src, sizes }: { src: string; sizes: string }) {
  const [loaded, setLoaded] = useState(false);
  const check = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <>
      <Image
        ref={check}
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={cn(
          "object-cover transition-[opacity,transform] duration-300 ease-out-soft hover:scale-105 motion-reduce:transition-none",
          !loaded && "opacity-0",
        )}
        onLoad={() => setLoaded(true)}
        // A broken link shouldn't spin forever either.
        onError={() => setLoaded(true)}
        /* Unoptimized: the site's custom loader would rewrite a small tile
           into a srcset of derivatives of a derivative. */
        unoptimized
      />
      {!loaded && (
        <span
          aria-hidden="true"
          className="absolute inset-0 grid place-items-center"
        >
          <Icon
            name="spinner"
            className="size-5 animate-spin text-ink-faint motion-reduce:animate-none"
          />
        </span>
      )}
    </>
  );
}

/**
 * A review's photos as small tiles; tapping one opens it full size in the
 * lightbox (swipe or arrows for the rest, pinch or scroll to zoom). Shared by
 * the review cards, the full-review panel and the buy-box carousel, which
 * differ only in tile size and how many tiles they show.
 *
 * Tiles past `max` collapse into a "+N" on the last one, which opens the
 * lightbox too — every photo is reachable from the lightbox, not only the ones
 * with a tile.
 */
export function ReviewPhotos({
  images,
  author,
  max,
  className,
  tileClassName,
  sizes,
}: {
  images: string[];
  author: string;
  max: number;
  className?: string;
  tileClassName: string;
  sizes: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  // The review panel closes on Escape too. While the lightbox is up, Escape
  // belongs to the lightbox alone: swallow it here, after the lightbox's own
  // handler has seen it, so it doesn't also tear down the panel underneath.
  useEffect(() => {
    if (openAt === null) return;
    const swallow = (event: KeyboardEvent) => {
      if (event.key === "Escape") event.stopPropagation();
    };
    document.addEventListener("keydown", swallow);
    return () => document.removeEventListener("keydown", swallow);
  }, [openAt]);

  if (images.length === 0) return null;

  const name = maskName(author);
  const shown = images.slice(0, max);
  const more = images.length - shown.length;

  return (
    <>
      <ul className={cn("flex flex-wrap gap-2", className)}>
        {shown.map((src, i) => (
          <li key={src}>
            <button
              type="button"
              onClick={() => setOpenAt(i)}
              aria-haspopup="dialog"
              aria-label={`Open photo ${i + 1} of ${images.length} from ${name}'s review`}
              className={cn(
                "relative block cursor-zoom-in overflow-hidden bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
                tileClassName,
              )}
            >
              <PhotoImage src={src} sizes={sizes} />
              {more > 0 && i === shown.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 grid place-items-center bg-ink/55 font-ui text-body-sm font-medium text-paper"
                >
                  +{more}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {openAt !== null && (
        <GalleryLightbox
          slides={images.map((src) => ({
            src,
            alt: `Photo from ${name}'s review`,
          }))}
          index={openAt}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
