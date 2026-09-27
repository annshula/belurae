import type { ImageRecord, MediaRecord, ProductRecord, VideoRecord } from "@/lib/catalog/types";
import type { ProductContent } from "@/content/products";

/**
 * Client-safe product view: the minimal, serialisable shape the PDP islands,
 * product cards and the bag need. Built on the server from the Shopify record
 * + editorial content; nothing here trusts or exposes anything sensitive.
 *
 * Pricing honesty: `savings` is pure arithmetic against the single-unit price
 * of the same set. Shopify compare-at prices are deliberately NOT surfaced —
 * there is no evidence those were ever real selling prices (blueprint A3.4).
 */

export type ViewImage = { url: string; width: number; height: number; alt: string };
export type ViewVideo = {
  type: "video";
  poster: string;
  width: number;
  height: number;
  alt: string;
  sources: { src: string; type: string; width: number | null }[];
};
export type ViewMedia = ({ type: "image" } & ViewImage & { variantId: string | null }) | ViewVideo;

export type ViewVariant = {
  id: string;
  options: Record<string, string>;
  price: number;
  availableForSale: boolean;
  sku: string | null;
  image: string | null;
  units: number;
  /** Saving vs buying `units` single sets, when > 0. */
  savings: number | null;
  perUnit: number;
  /** "Mousse + Cream · 3 sets" */
  label: string;
};

export type ViewOption = {
  name: string;
  label: string;
  values: { value: string; label: string; description?: string }[];
};

export type ProductView = {
  handle: string;
  slug: string;
  href: string;
  name: string;
  format: string;
  benefitLine: string;
  currency: string;
  options: ViewOption[];
  variants: ViewVariant[];
  defaultVariantId: string;
  fromPrice: number;
  availableForSale: boolean;
  gallery: ViewMedia[];
  cardImage: ViewImage | null;
  cardImageAlt: ViewImage | null;
  packOptionName: string | null;
};

const fallbackSize = 1200;

function toImage(m: ImageRecord, alt: string): ViewImage {
  return {
    url: m.url,
    width: m.width ?? fallbackSize,
    height: m.height ?? fallbackSize,
    alt,
  };
}

function mediaKey(m: MediaRecord): string {
  return m.type === "image" ? m.url : `${m.poster} ${m.sources.map((s) => s.src).join(" ")}`;
}

function curateGallery(record: ProductRecord, content: ProductContent): ViewMedia[] {
  const out: ViewMedia[] = [];
  for (const entry of content.gallery) {
    const m = record.media.find((item) => mediaKey(item).includes(entry.match));
    if (!m) continue;
    if (m.type === "image") {
      out.push({ type: "image", ...toImage(m, entry.alt), variantId: m.variantId });
    } else {
      const v = m as VideoRecord;
      out.push({
        type: "video",
        poster: v.poster,
        width: v.width ?? 720,
        height: v.height ?? 1280,
        alt: entry.alt,
        sources: v.sources,
      });
    }
  }
  // Nothing matched (e.g. media re-uploaded): fall back to the first image so the page is never bare.
  if (out.length === 0) {
    const first = record.media.find((m): m is ImageRecord => m.type === "image");
    if (first) out.push({ type: "image", ...toImage(first, first.alt ?? content.name), variantId: first.variantId });
  }
  return out;
}

export function buildProductView(
  record: ProductRecord,
  content: ProductContent,
  currency: string,
): ProductView {
  const packName = content.packOption?.name ?? null;
  const unitsFor = (options: Record<string, string>) =>
    packName ? (content.packOption?.units[options[packName] ?? ""] ?? 1) : 1;

  const labelFor = (name: string, value: string) =>
    content.optionLabels[name]?.values[value] ?? value;

  const variants: ViewVariant[] = record.variants.map((v) => {
    const units = unitsFor(v.options);
    const single =
      packName && units > 1
        ? record.variants.find(
            (o) =>
              unitsFor(o.options) === 1 &&
              Object.entries(v.options).every(([k, val]) => k === packName || o.options[k] === val),
          )
        : undefined;
    const raw = single ? single.price * units - v.price : 0;
    const savings = raw > 0.009 ? Math.round(raw * 100) / 100 : null;
    return {
      id: v.id,
      options: v.options,
      price: v.price,
      availableForSale: v.availableForSale,
      sku: v.sku,
      image: v.image,
      units,
      savings,
      perUnit: Math.round((v.price / units) * 100) / 100,
      label: record.options.map((o) => labelFor(o.name, v.options[o.name] ?? "")).join(" · "),
    };
  });

  const options: ViewOption[] = record.options
    .filter((o) => o.values.length > 1)
    .map((o) => ({
      name: o.name,
      label: content.optionLabels[o.name]?.label ?? o.name,
      values: o.values.map((value) => ({
        value,
        label: labelFor(o.name, value),
        description: o.name === "Style" ? content.setDescriptions?.[value] : undefined,
      })),
    }));

  const available = variants.filter((v) => v.availableForSale);
  const defaultVariant =
    available.find((v) => v.units === 1) ?? available[0] ?? variants[0];

  const singles = variants.filter((v) => v.units === 1);
  const fromPrice = Math.min(...(singles.length ? singles : variants).map((v) => v.price));

  const gallery = curateGallery(record, content);
  const images = gallery.filter((m): m is Extract<ViewMedia, { type: "image" }> => m.type === "image");

  return {
    handle: record.handle,
    slug: content.slug,
    href: `/products/${content.slug}`,
    name: content.name,
    format: content.format,
    benefitLine: content.benefitLine,
    currency,
    options,
    variants,
    defaultVariantId: defaultVariant?.id ?? "",
    fromPrice,
    availableForSale: record.availableForSale,
    gallery,
    cardImage: images[0] ?? null,
    cardImageAlt: images[1] ?? null,
    packOptionName: packName,
  };
}
