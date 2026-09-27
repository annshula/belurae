import Image from "next/image";
import Link from "next/link";

import type { ProductView } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";

/**
 * Product card — compact. Image on a cream well (packshots have white
 * backgrounds, so `mix-blend-multiply` lets them sit in the palette); second
 * image crossfades on hover for fine pointers only. Price shows "From" when
 * sets differ. Capped at `max-w-sm` so a short catalogue (one or two items)
 * never stretches a card to fill a lane meant for a full grid.
 */
export function ProductCard({ product, priority = false }: { product: ProductView; priority?: boolean }) {
  const variesInPrice = new Set(product.variants.filter((v) => v.units === 1).map((v) => v.price)).size > 1;
  const setCount = product.options.find((o) => o.name !== product.packOptionName)?.values.length ?? 1;

  return (
    <article className="group relative mx-auto w-full max-w-sm">
      <div className="well relative aspect-square overflow-hidden rounded-card">
        {product.cardImage && (
          <Image
            src={product.cardImage.url}
            alt={product.cardImage.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 80vw"
            className="media-zoom object-contain p-6 mix-blend-multiply"
          />
        )}
        {product.cardImageAlt && (
          <Image
            src={product.cardImageAlt.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 22vw, 40vw"
            className="hidden object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block group-hover:opacity-100"
          />
        )}
        {!product.availableForSale && (
          <span className="glass absolute top-3 left-3 rounded-tag px-2.5 py-1 font-headline text-[0.68rem] tracking-widest uppercase">Sold out</span>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3 px-0.5">
        <div className="min-w-0">
          <h3 className="text-body-sm font-semibold">
            <Link href={product.href} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-[0.78rem] text-ink-soft">
            {product.format}
            {setCount > 1 && ` · ${setCount} sets`}
          </p>
        </div>
        <p className="shrink-0 text-body-sm font-medium tabular-nums">
          {variesInPrice && <span className="text-ink-soft">From </span>}
          {formatMoney(product.fromPrice, product.currency)}
        </p>
      </div>
    </article>
  );
}
