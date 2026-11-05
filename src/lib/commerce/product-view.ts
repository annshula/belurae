import type {
  FeatureHighlightRecord,
  ImageRecord,
  ProductRecord,
  SpecRecord,
} from "@/lib/catalog/types";
import type { ProductContent } from "@/content/products";
import type { PackTier } from "@/lib/commerce/tiers";

/**
 * Client-safe product view: the minimal, serialisable shape the PDP islands,
 * product cards and the bag need. Built on the server from the Shopify record
 * + editorial content; nothing here trusts or exposes anything sensitive.
 *
 * Pricing honesty: `savings` is pure arithmetic against the single-unit price
 * of the same set. Shopify compare-at prices are deliberately NOT surfaced —
 * there is no evidence those were ever real selling prices (blueprint A3.4).
 */

export type ViewImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};
export type ViewVideo = {
  type: "video";
  poster: string;
  width: number;
  height: number;
  alt: string;
  sources: { src: string; type: string; width: number | null }[];
};
export type ViewMedia =
  | ({ type: "image" } & ViewImage & { variantId: string | null })
  | ViewVideo;

export type ViewVariant = {
  id: string;
  options: Record<string, string>;
  price: number;
  /** Shopify's own compare-at price for this variant, when it's genuinely higher than price. */
  compareAtPrice: number | null;
  /** Percent off compareAtPrice, when compareAtPrice exists. */
  compareAtPercent: number | null;
  availableForSale: boolean;
  sku: string | null;
  image: string | null;
  units: number;
  /** Saving vs buying `units` single sets, when > 0. */
  savings: number | null;
  perUnit: number;
  /** "Mousse + Cream · Trio set" */
  label: string;
  /** What the pack holds ("BB Cream + Gel Face Primer"), from the variant's `belurae.pack_description`. */
  contents: string | null;
};

export type ViewOption = {
  name: string;
  label: string;
  values: { value: string; label: string; swatch?: string; note?: string }[];
  /** Swatches render as round dots with no names. */
  dotsOnly?: boolean;
  /** Values are mains plugs: drawn as pin-layout cards. */
  plugGlyphs?: boolean;
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
  /** Pack cards use the content's pack names instead of "N Pack". */
  packNamed: boolean;
  /** Quantity-break packs on the single variant (1 / 2 / 3 Pack), or null when packs are separate variants. */
  packTiers: PackTier[] | null;
  /** Shopify `custom.specs` metaobjects — the merchant's own spec sheet. */
  specs: SpecRecord[];
  /** Shopify `custom.feature_highlights` metaobjects — used for the alternating image section. */
  featureHighlights: FeatureHighlightRecord[];
  /**
   * Shopify `custom.perks` metafield — short bullet claims shown under the
   * product name, ordered for display (see `orderPerks`).
   */
  perks: string[];
  /** Shopify `custom.sale_ends_at` metafield — set by the merchant, already filtered to future dates only. */
  saleEndsAt: string | null;
};

/** Fragrance wording in a perk — "light citrus scent", "Orange Spring Cologne", etc. */
const FRAGRANCE_PERK =
  /\b(scent|scented|unscented|fragrance|fragranced|cologne|perfume|aroma)\b/i;

/** A perk that names the formula's ingredients — "Aloe leaf water, glycerin & hyaluronic acid". */
const INGREDIENT_PERK = /\b(aloe|glycerin|glycerine|hyaluronic)\b/i;

/**
 * Perks that describe the product rather than what it does for you. They sit
 * after the benefit claims, which is why they are the last bullets in the list.
 */
function isDetailPerk(perk: string): boolean {
  return FRAGRANCE_PERK.test(perk) || INGREDIENT_PERK.test(perk);
}

/**
 * The perks list under the product name reads best as benefits first, with the
 * detail perks — the scent note and the ingredient list — last.
 *
 * Keyed on each perk's own text rather than its position, so it holds no matter
 * what order the merchant puts the metafield in, and survives a re-sync.
 * Relative order is preserved within both groups. If every perk is a detail
 * perk (or none is), the list is left untouched.
 */
function orderPerks(perks: string[]): string[] {
  const detail = perks.filter(isDetailPerk);
  if (detail.length === 0 || detail.length === perks.length) return perks;
  return [...perks.filter((perk) => !isDetailPerk(perk)), ...detail];
}

const fallbackSize = 1200;

function toImage(m: ImageRecord, alt: string): ViewImage {
  return {
    url: m.url,
    width: m.width ?? fallbackSize,
    height: m.height ?? fallbackSize,
    alt,
  };
}

/** Every media item Shopify has for this product, in Shopify's own order — nothing hand-curated or hidden. */
function curateGallery(record: ProductRecord): ViewMedia[] {
  return record.media.map((m) => {
    if (m.type === "image") {
      return {
        type: "image",
        ...toImage(m, m.alt ?? record.title),
        variantId: m.variantId,
      };
    }
    return {
      type: "video",
      poster: m.poster,
      width: m.width ?? 720,
      height: m.height ?? 1280,
      alt: m.alt ?? record.title,
      sources: m.sources,
    };
  });
}

/**
 * Applies `content.optionSplit`: one Shopify option whose values bundle model,
 * colour and plug becomes separate options. Values keep their order of first
 * appearance. If any variant does not match the pattern, nothing changes.
 */
function splitOptions(
  record: ProductRecord,
  content: ProductContent,
): { options: ProductRecord["options"]; variants: ProductRecord["variants"] } {
  const split = content.optionSplit;
  const unchanged = { options: record.options, variants: record.variants };
  if (!split) return unchanged;
  const re = new RegExp(split.pattern);
  const parsed = record.variants.map((v) => {
    const groups = re.exec(v.options[split.option] ?? "")?.groups;
    return groups ? { ...split.fill, ...stripUndefined(groups) } : null;
  });
  if (parsed.some((g) => g === null) && !split.dropUnmatched) return unchanged;
  /* Only the parts named in `order` become options. Parts left out are not
     offered, so variants that differ only by them collapse to the first one in
     Shopify's order. */
  const seen = new Set<string>();
  const kept: {
    variant: ProductRecord["variants"][number];
    picked: Record<string, string>;
  }[] = [];
  record.variants.forEach((v, i) => {
    const groups = parsed[i];
    if (!groups) return;
    const picked = Object.fromEntries(
      split.order.map((name) => [name, groups[name] ?? ""]),
    );
    if (Object.values(picked).some((value) => !value)) return;
    const key = JSON.stringify(picked);
    if (seen.has(key)) return;
    seen.add(key);
    kept.push({ variant: v, picked });
  });
  if (kept.length === 0) return unchanged;
  const variants = kept.map(({ variant, picked }) => {
    const rest = { ...variant.options };
    delete rest[split.option];
    return { ...variant, options: { ...rest, ...picked } };
  });
  const options = [
    ...record.options.filter((o) => o.name !== split.option),
    ...split.order.map((name) => ({
      name,
      values: [...new Set(kept.map((k) => k.picked[name]!))],
    })),
  ];
  return { options, variants };
}

function stripUndefined(groups: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(groups).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
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

  const { options: recordOptions, variants: recordVariants } = splitOptions(
    record,
    content,
  );

  const variants: ViewVariant[] = recordVariants.map((v) => {
    const units = unitsFor(v.options);
    const single =
      packName && units > 1
        ? recordVariants.find(
            (o) =>
              unitsFor(o.options) === 1 &&
              Object.entries(v.options).every(
                ([k, val]) => k === packName || o.options[k] === val,
              ),
          )
        : undefined;
    const raw = single ? single.price * units - v.price : 0;
    const savings = raw > 0.009 ? Math.round(raw * 100) / 100 : null;
    const compareAtPercent =
      v.compareAtPrice != null && v.compareAtPrice > v.price
        ? Math.round((1 - v.price / v.compareAtPrice) * 100)
        : null;
    return {
      id: v.id,
      options: v.options,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      compareAtPercent,
      availableForSale: v.availableForSale,
      sku: v.sku,
      image: v.image,
      units,
      savings,
      perUnit: Math.round((v.price / units) * 100) / 100,
      label: recordOptions
        .map((o) => labelFor(o.name, v.options[o.name] ?? ""))
        .join(" · "),
      contents: v.description,
    };
  });

  const options: ViewOption[] = recordOptions
    .filter((o) => o.values.length > 1)
    .map((o) => ({
      name: o.name,
      label: content.optionLabels[o.name]?.label ?? o.name,
      values: o.values.map((value) => ({
        value,
        label: labelFor(o.name, value),
        swatch: content.optionLabels[o.name]?.swatches?.[value],
        note: content.optionLabels[o.name]?.notes?.[value],
      })),
      dotsOnly: content.optionLabels[o.name]?.dotsOnly,
      plugGlyphs: content.optionLabels[o.name]?.plugGlyphs,
    }));

  const available = variants.filter((v) => v.availableForSale);
  const wanted = content.optionSplit?.defaultOptions;
  const defaultVariant =
    (wanted
      ? available.find((v) =>
          Object.entries(wanted).every(([k, val]) => v.options[k] === val),
        )
      : undefined) ??
    available.find((v) => v.units === 1) ??
    available[0] ??
    variants[0];

  const singles = variants.filter((v) => v.units === 1);
  const fromPrice = Math.min(
    ...(singles.length ? singles : variants).map((v) => v.price),
  );

  const gallery = curateGallery(record);
  const images = gallery.filter(
    (m): m is Extract<ViewMedia, { type: "image" }> => m.type === "image",
  );

  return {
    handle: record.handle,
    slug: content.slug,
    href: `/products/${content.slug}`,
    name: record.title,
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
    packNamed: content.packOption?.named ?? false,
    packTiers: content.packTiers ?? null,
    specs: record.specs,
    featureHighlights: record.featureHighlights,
    perks: orderPerks(record.perks),
    saleEndsAt: record.saleEndsAt,
  };
}
