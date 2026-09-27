import Image from "next/image";
import Link from "next/link";

import type { ProductView } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";

/**
 * Product card. Image on a cream well (packshots have white backgrounds, so
 * `mix-blend-multiply` lets them sit in the palette); second image crossfades
 * on hover for fine pointers only. Price shows "From" when sets differ.
 */
export function ProductCard({ product, priority = false }: { product: ProductView; priority?: boolean }) {
  const variesInPrice = new Set(product.variants.filter((v) => v.units === 1).map((v) => v.price)).size > 1;
  const setCount = product.options.find((o) => o.name !== product.packOptionName)?.values.length ?? 1;

  return (
    <article className="group relative">
      <div className="well relative aspect-[4/5] overflow-hidden rounded-media">
        {product.cardImage && (
          <Image
            src={product.cardImage.url}
            alt={product.cardImage.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="media-zoom object-contain p-10 mix-blend-multiply"
          />
        )}
        {product.cardImageAlt && (
          <Image
            src={product.cardImageAlt.url}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, 45vw"
            className="hidden object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block group-hover:opacity-100"
          />
        )}
        {!product.availableForSale && (
          <span className="glass absolute top-4 left-4 rounded-[10px] px-3 py-1.5 text-eyebrow uppercase">Sold out</span>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <h3 className="font-serif text-heading-2">
            <Link href={product.href} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-body-sm text-ink-soft">
            {product.format}
            {setCount > 1 && ` · ${setCount} sets`}
          </p>
        </div>
        <p className="shrink-0 tabular-nums">
          {variesInPrice && <span className="text-body-sm text-ink-soft">From </span>}
          {formatMoney(product.fromPrice, product.currency)}
        </p>
      </div>
    </article>
  );
}
