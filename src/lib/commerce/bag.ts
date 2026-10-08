import "server-only";

import type { BagCatalog } from "@/components/cart/CartProvider";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { getPaymentMethods } from "@/lib/shopify/payments";

/** The small variant lookup the client bag needs (a few hundred bytes per product). */
export async function getBagCatalog(): Promise<BagCatalog> {
  const [products, currency, payments] = await Promise.all([
    getProducts(),
    storeCurrency(),
    getPaymentMethods(),
  ]);
  const variants: BagCatalog["variants"] = {};
  for (const { record, content } of products) {
    const view = buildProductView(record, content, currency);
    const fallbackImage = view.cardImage?.url ?? null;
    for (const v of view.variants) {
      variants[v.id] = {
        productName: view.name,
        /* Pack-only products read "2 Pack", matching the product page cards. */
        variantLabel:
          view.packOptionName !== null && view.options.length === 1
            ? `${v.units} Pack`
            : v.label,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        units: v.units,
        image: v.image ?? fallbackImage,
        href: `${view.href}?variant=${v.id.split("/").pop()}`,
        available: v.availableForSale,
        hasPackOption: view.packOptionName !== null,
        tiers: view.packTiers,
      };
    }
  }
  return { currency, variants, payments };
}
