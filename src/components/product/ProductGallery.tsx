import Image from "next/image";

import { GalleryController } from "@/components/product/GalleryController";
import { VideoTile } from "@/components/product/VideoTile";
import type { ViewMedia } from "@/lib/commerce/product-view";

/**
 * PDP media. Server-rendered so the first image (the LCP element) is plain
 * HTML with `priority`; the controller only adds variant-image syncing.
 *  - Mobile: full-width swipe row (CSS scroll-snap, no carousel JS).
 *  - Desktop: editorial grid — lead image full width, the rest in pairs.
 * Every tile has a fixed aspect ratio, so nothing shifts while loading.
 */
export function ProductGallery({ media, productName }: { media: ViewMedia[]; productName: string }) {
  const count = media.length;
  return (
    <section aria-label={`${productName} images and video`} className="min-w-0">
      <GalleryController />
      <ul
        data-gallery
        className="snap-row auto-cols-[88%] gap-3 px-(--gutter) scroll-px-(--gutter) md:grid md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0"
      >
        {media.map((item, i) => (
          <li
            key={i}
            data-variant-id={item.type === "image" ? (item.variantId ?? undefined) : undefined}
            className={i === 0 ? "md:col-span-2" : undefined}
            aria-label={`${i + 1} of ${count}`}
          >
            {item.type === "image" ? (
              <div className={`well relative overflow-hidden rounded-media ${i === 0 ? "aspect-square" : "aspect-[4/5]"}`}>
                <Image
                  src={item.url}
                  alt={item.alt}
                  fill
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : undefined}
                  sizes={i === 0 ? "(min-width: 1024px) 56vw, 100vw" : "(min-width: 1024px) 28vw, 100vw"}
                  className="object-contain p-4 mix-blend-multiply md:p-8"
                />
              </div>
            ) : (
              <VideoTile video={item} className="aspect-[4/5] overflow-hidden rounded-media bg-ink" />
            )}
          </li>
        ))}
      </ul>
      {count > 1 && (
        <p className="mt-3 text-center text-body-sm text-ink-soft md:hidden" aria-hidden="true">
          Swipe to see all {count}
        </p>
      )}
    </section>
  );
}
