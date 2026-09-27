/**
 * Shape of data/catalog.json — the Shopify read model written by
 * `lib/shopify/sync-product.ts` and read by `lib/catalog/index.ts`.
 * Plain data only, safe to import from client components.
 */

export type MarketPrice = {
  amount: number;
  compareAtAmount: number | null;
  currencyCode: string;
};

export type VariantRecord = {
  id: string;
  title: string;
  sku: string | null;
  barcode: string | null;
  price: number;
  /** Only kept when greater than price (Shopify allows nonsense values). */
  compareAtPrice: number | null;
  availableForSale: boolean;
  /** Option name → value, e.g. { Style: "Spray", Pack: "2PCS" }. */
  options: Record<string, string>;
  image: string | null;
  pricesByMarket: Record<string, MarketPrice>;
};

export type ImageRecord = {
  type: "image";
  url: string;
  width: number | null;
  height: number | null;
  alt: string | null;
  variantId: string | null;
};

export type VideoRecord = {
  type: "video";
  alt: string | null;
  poster: string;
  width: number | null;
  height: number | null;
  /** mp4 renditions, smallest first. */
  sources: { src: string; type: string; width: number | null }[];
};

export type MediaRecord = ImageRecord | VideoRecord;

export type ProductRecord = {
  id: string;
  handle: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  status: string;
  updatedAt: string;
  seo: { title: string | null; description: string | null };
  options: { name: string; values: string[] }[];
  availableForSale: boolean;
  variants: VariantRecord[];
  media: MediaRecord[];
};

export type CatalogDocument = {
  version: number;
  syncedAt: string;
  shop: { domain: string; name: string; currencyCode: string };
  markets: string[];
  products: Record<string, ProductRecord>;
};
