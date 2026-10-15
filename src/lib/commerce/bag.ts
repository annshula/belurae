import "server-only";

import type { BagCatalog } from "@/components/cart/CartProvider";
import { getCatalog, getProducts, storeCurrency } from "@/lib/catalog";
import { UPSELLS } from "@/content/upsells";
import { buildProductView } from "@/lib/commerce/product-view";
import { getPaymentMethods } from "@/lib/shopify/payments";

/** The small variant lookup the client bag needs (a few hundred bytes per product). */
export async function getBagCatalog(): Promise<BagCatalog> {
  const [products, catalog, currency, payments] = await Promise.all([
    getProducts(),
    getCatalog(),
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
        handle: record.handle,
        upsell: null,
      };
    }
  }
  /* Cart upsells: sold from the bag, so they have no product page. */
  for (const u of UPSELLS) {
    const record = catalog.products[u.handle];
    if (!record || record.status !== "ACTIVE") continue;
    const fallbackImage =
      record.media.find((m) => m.type === "image")?.url ?? null;
    const v = record.variants[0];
    if (!v) continue;
    variants[v.id] = {
      productName: u.name,
      variantLabel: v.title,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      units: 1,
      image: v.image ?? fallbackImage,
      href: "/cart",
      available: v.availableForSale,
      hasPackOption: false,
      tiers: null,
      handle: record.handle,
      upsell: { blurb: u.blurb, triggers: [...u.triggers], rating: u.rating },
    };
  }
  return { currency, variants, payments };
}
