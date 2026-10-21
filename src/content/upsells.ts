import { BELURAE_HANDLES } from "@/content/products";

/**
 * Cart upsells: Shopify products that are sold from the bag, not from their own
 * product page. They are synced into data/catalog.json like every Belurae
 * product, so the bag can price them and checkout accepts their variants, but
 * they have no entry in `content/products.ts` (no PDP, no collection card).
 *
 * Server-side only: the browser receives each offer through the bag catalog
 * (lib/commerce/bag.ts), never this file, so the product content stays out of
 * the client bundle.
 */
export type Upsell = {
  /** Shopify handle of the product. Its first variant is the one offered. */
  handle: string;
  /** Shown in the bag instead of Shopify's long listing title. */
  name: string;
  /** One line under the name. Cosmetic wording only (feel and hydration, no medical claims). */
  blurb: string;
  /** Offered while one of these products is in the bag. */
  triggers: readonly string[];
  /**
   * Star rating shown on the offer, as the store reports it on the product.
   * Leave null while a product has no reviews: a rating is never made up (the
   * imported Judge.me reviews are not shown — see the belurae-shared-store
   * notes), so this is only filled in from the product's own rating.
   */
  rating: { value: number; count: number } | null;
};

export const UPSELLS: readonly Upsell[] = [
  {
    handle:
      "post-hair-removal-care-oil-jojoba-and-almond-blend-soothes-sensitivity-locks-in-hydration-and-supports-daily-skin-comfort",
    name: "Post-Hair Removal Care Oil",
    blurb: "Jojoba and almond blend · soothes and moisturizes · 60 ml",
    triggers: ["bikini-pain-free-hair-removal-spray"],
    rating: { value: 5, count: 439 },
  },
  {
    handle:
      "makeup-egg-beauty-egg-blender-cosmetic-puff-makeup-sponge-beauty-tool-for-women",
    name: "Makeup Blending Sponge",
    blurb: "Soft egg-shaped sponge · for foundation and concealer",
    // Hidden for now: no triggers, so the bag never offers it. Restore
    // ["missha-perfect-cover-bb-cream"] to show it again.
    triggers: [],
    rating: null,
  },
];

/**
 * Cross-sells: products that do have their own page (and a collection card)
 * but are also offered in the bag. Once added they are ordinary bag lines, with
 * the product-page link, pack picker and stepper. The first variant is the one
 * offered, and the rating shown is the product's own from the catalog.
 */
export type CrossSell = {
  /** Shopify handle of the product. */
  handle: string;
  /** One line under the name. Cosmetic wording only (no medical claims). */
  blurb: string;
  /** Offered while one of these products is in the bag. */
  triggers: readonly string[];
};

export const CROSS_SELLS: readonly CrossSell[] = [
  {
    handle: "bikini-pain-free-hair-removal-spray",
    blurb: "Spray-on body hair removal mousse · no blade, no wax strips",
    triggers: ["missha-perfect-cover-bb-cream"],
  },
];

export const UPSELL_HANDLES: readonly string[] = UPSELLS.map((u) => u.handle);

/** Every handle the catalog syncs: the product line plus the cart upsells. */
export const CATALOG_HANDLES: readonly string[] = [
  ...BELURAE_HANDLES,
  ...UPSELL_HANDLES,
];
