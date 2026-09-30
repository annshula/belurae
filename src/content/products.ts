/**
 * Belurae product line — editorial layer on top of the Shopify catalog.
 *
 * Shopify owns: price, variants, availability, media (data/catalog.json).
 * This file owns: naming, copy, directions, warnings and FAQs. Gallery media
 * comes straight from Shopify, in Shopify's own order (product-view.ts).
 *
 * CLAIMS RULE (docs/blueprint/01-brand.md §2): every statement here must come
 * from the manufacturer's packaging/listing as shown on the live product page,
 * attributed where it is the manufacturer's claim. Unknowns are listed in
 * `contentGaps` and simply not rendered — never filled with guesses.
 */

export type ProductFaq = { q: string; a: string };

export type PdpIcon =
  | "leaf"
  | "star"
  | "droplet"
  | "flower"
  | "heart"
  | "feather"
  | "globe"
  | "shield"
  | "clock";

export type KeyIngredient = {
  /** Slug of the ingredient page (content/ingredients.ts). */
  slug: string;
  name: string;
  role: string;
};

export type ProductContent = {
  /** Shopify product handle (source of truth for the catalog). */
  handle: string;
  /** Public URL slug: /products/{slug}. Always equal to `handle` — Shopify's real URL, not an invented one. */
  slug: string;
  /** Old slugs that 301-redirect to this product (see the [slug] route). */
  legacySlugs: string[];
  name: string;
  /** Short format line for cards, e.g. "Spray mousse · 140 ml". */
  format: string;
  category: { slug: string; name: string };
  benefitLine: string;
  /** Manufacturer / brand printed on the pack. */
  manufacturer: string;
  seo: { title: string; description: string };
  /** Shopify option name → display label, and value → display label. */
  optionLabels: Record<
    string,
    { label: string; values: Record<string, string> }
  >;
  /** Option whose values are pack sizes, mapped to unit counts. */
  packOption?: { name: string; units: Record<string, number> };
  story: { heading: string; body: string[] };
  highlights: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  keyIngredients: KeyIngredient[];
  specs: { label: string; value: string }[];
  inTheBox: { item: string; detail: string }[];
  safety: {
    patchTest: string;
    /** Shown above the lists — says where the guidance comes from. */
    note: string;
    use: string[];
    avoid: string[];
    ifIrritation: string;
  };
  faqs: ProductFaq[];
  /** Product-specific copy for PDP sections that were originally written for the mousse. */
  /** Google product category for Product JSON-LD. */
  googleCategory: string;
  pdp: {
    /** Three icon + text items above the H1. */
    trust?: { icon: PdpIcon; text: string }[];
    /** Show Shopify's `custom.perks` one per row instead of two columns. */
    perksOneColumn?: boolean;
    /** "flush": gallery photos shown whole (no crop), with no tinted panel or padding. */
    galleryFit?: "contain" | "flush";
    /** "cards": the photo-card pack picker instead of stacked rows. */
    packs?: "list" | "cards";
    /** "Your daily step" band and the key-ingredients band under it (EditorialBands). */
    dailyStep?: {
      eyebrow: string;
      heading: string;
      body: string;
      /** Substring of the Shopify image filename to use as the band photo; hidden if no match. */
      mediaFile: string;
      /** CSS object-position for the band photo. */
      imagePosition?: "right" | "top" | "center";
      benefits: { icon: PdpIcon; title: string; body: string }[];
    };
    /** The local video clips are mousse footage; only products with an intro show the showcase. */
    videosIntro?: string;
    howTo: {
      heading: string;
      intro: string;
      guide?: { href: string };
    };
    /** Shown beside the key ingredients while the full INCI list is outstanding; the page appends the "check the pack or ask us" line. */
    ingredientListNote: string;
    /** The mousse / razor / wax comparison only makes sense for hair removal. */
    showHairRemovalComparison: boolean;
    /** Callout under the buy box. */
    notice: { lead: string; text: string };
  };
  /** Items still needed from the manufacturer before the content is complete. */
  contentGaps: string[];
};

export const products: ProductContent[] = [
  {
    handle: "bikini-pain-free-hair-removal-spray",
    slug: "bikini-pain-free-hair-removal-spray",
    legacySlugs: ["hair-removal-mousse", "bikini-pain-free-hair-removal-cream"],
    name: "Gentle Body Hair Removal Mousse",
    format: "Spray mousse · 140 ml",
    category: { slug: "hair-removal", name: "Hair Removal" },
    benefitLine:
      "A spray-on hair removal mousse for the body. Spray, wait 5–10 minutes, and wipe hair away with the included scraper — no blade, no wax strips.",
    manufacturer: "PHOFAY (Cloud Sense)",
    seo: {
      title: "Hair Removal Mousse · 140 ml Spray",
      description:
        "Spray-on body hair removal mousse with aloe leaf water, glycerin and hyaluronic acid. On skin for 5–10 minutes, then wiped away. Full directions, key ingredients and safety guidance.",
    },
    optionLabels: {
      Quantity: {
        label: "Choose your pack",
        /* Tier names, not counts. "Duo"/"Trio" carry the quantity themselves,
           and the pack rows show the per-set price and the saving beside them,
           so nothing here has to claim anything the numbers don't show. */
        values: {
          "1PC": "Starter set",
          "2PCS": "Duo set",
          "3PCS": "Trio set",
        },
      },
    },
    packOption: { name: "Quantity", units: { "1PC": 1, "2PCS": 2, "3PCS": 3 } },
    story: {
      heading: "Smooth skin, without turning your routine into a chore.",
      body: [
        "Shaving means a blade against your skin; waxing means pulling. This mousse works differently: you spray an even layer, leave it for 5–10 minutes, then wipe it away together with the hair using the scraper in the box.",
        "The manufacturer labels the formula hypoallergenic and additive-free, with aloe leaf water, glycerin, hyaluronic acid and ginseng and portulaca extracts listed as key ingredients. Every skin is different, though — so we ask everyone to patch test first, and we tell you plainly where not to use it.",
      ],
    },
    highlights: [
      {
        title: "No blade, no strips",
        body: "Spray on, wait, wipe away with the scraper. Nothing cuts or pulls at the skin.",
      },
      {
        title: "5–10 minutes on skin",
        body: "A defined window from the directions. Rinse off at 10 minutes, even if some hair remains.",
      },
      {
        title: "Labelled hypoallergenic",
        body: "The manufacturer labels it hypoallergenic, additive-free and suitable for sensitive skin. Patch test 24 hours before first use.",
      },
      {
        title: "Light citrus scent",
        body: "Scented with the manufacturer's “Orange Spring Cologne” fragrance.",
      },
    ],
    steps: [
      {
        title: "Prepare",
        body: "Start with clean, dry skin. If it's your first time, patch test a small area 24 hours before.",
      },
      {
        title: "Apply",
        body: "Spray an even layer that fully covers the hair you want to remove.",
      },
      {
        title: "Wait 5–10 minutes",
        body: "Leave the mousse on for 5–10 minutes. Don't exceed 10 minutes.",
      },
      {
        title: "Remove",
        body: "Gently wipe the mousse and hair away with the included scraper.",
      },
      {
        title: "Rinse",
        body: "Rinse the area thoroughly with lukewarm water and pat dry.",
      },
      {
        title: "Aftercare",
        body: "Skip fragranced products, hot baths and sun on the area for the rest of the day. Wait until skin is completely calm before using again.",
      },
    ],
    keyIngredients: [
      {
        slug: "aloe-leaf-water",
        name: "Aloe leaf water",
        role: "A water-based aloe extract, commonly used in body care for a soothing, conditioning feel.",
      },
      {
        slug: "glycerin",
        name: "Glycerin",
        role: "A humectant: it draws water into the top layer of the skin.",
      },
      {
        slug: "hyaluronic-acid",
        name: "Hyaluronic acid",
        role: "A humectant that helps skin hold on to moisture.",
      },
      {
        slug: "ginseng-extract",
        name: "Ginseng extract",
        role: "A botanical extract from ginseng root, listed by the manufacturer as a key herbal ingredient.",
      },
      {
        slug: "portulaca-oleracea-extract",
        name: "Portulaca oleracea extract",
        role: "Purslane extract, a botanical used in skin-care formulas for a conditioning feel.",
      },
    ],
    specs: [
      { label: "Format", value: "Spray mousse, 140 ml / 4.73 fl oz" },
      { label: "Time on skin", value: "5–10 minutes" },
      { label: "Scent", value: "Orange Spring Cologne" },
      {
        label: "Skin type",
        value:
          "Labelled for sensitive skin (hypoallergenic, no additives) by the manufacturer",
      },
      { label: "Suitable for", value: "Men and women" },
      { label: "Made by", value: "PHOFAY (Cloud Sense)" },
    ],
    inTheBox: [
      {
        item: "Hair removal mousse",
        detail: "140 ml / 4.73 fl oz spray can, per set",
      },
      { item: "Scraper", detail: "For wiping the mousse and hair away" },
    ],
    safety: {
      patchTest:
        "Patch test before first use: apply a small amount to a small area, remove it as directed, and wait 24 hours. Don't use the product if you notice redness, burning, itching or swelling.",
      note: "Always read the directions and warnings on the pack before use. Where the pack is less specific, we follow the standard precautions for depilatory products below.",
      use: [
        "Legs and arms",
        "Underarms",
        "Back and chest",
        "The outer bikini line — follow the directions on the pack",
      ],
      avoid: [
        "The face, including eyebrows and around the eyes",
        "Genitals, the inner bikini area and other mucous membranes",
        "Broken, sunburnt, irritated or recently shaved/waxed skin",
        "Skin with moles, scars, cuts or active breakouts",
      ],
      ifIrritation:
        "If you feel stinging or burning, remove the mousse and rinse the area straight away with plenty of cool water, and stop using it. If irritation continues, contact a doctor or pharmacist.",
    },
    faqs: [
      {
        q: "What is this product?",
        a: "A spray-on hair removal mousse for the body (140 ml). You apply it to clean, dry skin, leave it on for 5–10 minutes, then wipe it away together with the hair using the included scraper and rinse.",
      },
      {
        q: "How long should I leave it on?",
        a: "5 to 10 minutes. Don't leave it on longer than 10 minutes, even if some hair remains — a longer wait raises the chance of irritation.",
      },
      {
        q: "Is it suitable for sensitive skin?",
        a: "The manufacturer labels it hypoallergenic, additive-free and suitable for sensitive skin, but no product suits every skin. Patch test a small area 24 hours before your first full use.",
      },
      {
        q: "Where can I use it?",
        a: "On the body: legs, arms, underarms, back, chest and the outer bikini line. Don't use it on your face, genitals, the inner bikini area, or on broken or irritated skin.",
      },
      {
        q: "Can I use it on the bikini line?",
        a: "On the outer bikini line only, following the directions on the pack. It is not for use on the genitals or mucous membranes. Patch test first, and keep to the 5–10 minute window.",
      },
      {
        q: "How do I remove it?",
        a: "Wipe the mousse and hair away with the included scraper, then rinse the skin thoroughly with water.",
      },
      {
        q: "What if it stings?",
        a: "Remove it and rinse straight away with plenty of cool water, and stop using it. If irritation continues, contact a doctor or pharmacist.",
      },
      {
        q: "How often can I use it?",
        a: "The pack doesn't give a fixed frequency. Wait until your skin is completely calm — no redness or tenderness — before using it again on the same area.",
      },
      {
        q: "Does it have a scent?",
        a: "Yes — a light citrus fragrance the manufacturer calls “Orange Spring Cologne”.",
      },
      {
        q: "Can men use it?",
        a: "Yes. The manufacturer labels it suitable for men and women.",
      },
      {
        q: "Can I return it?",
        a: "Personal-care products can't be returned once received, unless they arrive damaged, defective or incorrect — contact us and we'll put it right. EU customers also have a 14-day right to cancel. See the refund policy for details.",
      },
    ],
    googleCategory:
      "Health & Beauty > Personal Care > Hair Removal > Depilatories",
    pdp: {
      videosIntro:
        "Real clips of the mousse in use — patch test, spray, wipe, rinse.",
      howTo: {
        heading: "Six unhurried steps.",
        intro:
          "The short version: patch test, spray, wait 5–10 minutes, wipe, rinse, rest.",
        guide: { href: "/guides/how-to-use-hair-removal-mousse" },
      },
      dailyStep: {
        eyebrow: "Your daily step",
        heading: "Smooth skin, without the blade.",
        body: "Spray on, wait 5–10 minutes, then wipe hair away with the included scraper. The manufacturer labels the formula hypoallergenic and additive-free.",
        mediaFile: "cac920f9-4b70-404b-8f48-2f28a0d05f61",
        imagePosition: "top",
        benefits: [
          {
            icon: "feather",
            title: "No blade, no strips",
            body: "Nothing cuts or pulls at the skin.",
          },
          {
            icon: "clock",
            title: "5–10 minutes on skin",
            body: "A defined window from the directions. Rinse off at 10 minutes.",
          },
          {
            icon: "leaf",
            title: "Light citrus scent",
            body: "The manufacturer's “Orange Spring Cologne” fragrance.",
          },
        ],
      },
      ingredientListNote:
        "We're waiting on the complete INCI list — including the hair-removing active ingredient — from the manufacturer, and will publish it here in full.",
      packs: "cards",
      showHairRemovalComparison: true,
      notice: {
        lead: "Patch test 24 hours before first use.",
        text: "Not for the face or genitals.",
      },
    },
    contentGaps: [
      "Full INCI ingredient list, including the hair-removing active ingredient",
      "Exact wording of the packaging warnings",
      "Name, size and ingredients of the companion serum",
      "Ingredient list and directions for the Smooth cream",
      "GTIN / barcode",
    ],
  },
  {
    handle: "egf-tox-toner",
    slug: "egf-tox-toner",
    legacySlugs: [
      "hydrating-smoothing-toner-even-skin-tone-brightening-skin-refines-skin-texture-fast-absorbing-non-greasy-refreshing-facial-toner",
    ],
    name: "Belurae EGF Tox Toner",
    format: "Facial toner · 100 ml",
    category: { slug: "skincare", name: "Skincare" },
    benefitLine:
      "A hydrating facial toner with niacinamide, collagen and hyaluronic acid, made to be patted on after cleansing and before your serum and moisturiser.",
    manufacturer: "Belurae Editor",
    seo: {
      title: "EGF Tox Toner · 100 ml Hydrating Facial Toner",
      description:
        "Korean hydrating facial toner (100 ml) listing EGF-related ingredients, niacinamide, collagen and hyaluronic acid. Directions, key ingredients and safety guidance.",
    },
    optionLabels: {
      Color: {
        label: "Choose your pack",
        values: {
          "100ml Boxed": "Single bottle",
          "2 x 100ml Boxed": "Duo set",
          "3 x 100ml Boxed": "Buy 2 Get 1",
        },
      },
    },
    packOption: {
      name: "Color",
      units: { "100ml Boxed": 1, "2 x 100ml Boxed": 2, "3 x 100ml Boxed": 3 },
    },
    story: {
      heading: "One easy step between cleanser and serum.",
      body: [
        "This is a 100 ml Korean facial toner from Belurae Editor. You pat it onto clean skin, then follow with your usual serum and moisturiser.",
        "The manufacturer lists EGF-related ingredients, niacinamide, collagen and hyaluronic acid as the key ingredients, and describes the toner as helping skin feel soft, hydrated and supple. Every skin is different, so we suggest a patch test first, and the full directions are below.",
      ],
    },
    highlights: [
      {
        title: "Hydrating feel",
        body: "Described by the manufacturer as helping skin feel fresh, hydrated and comfortable.",
      },
      {
        title: "Smoother-looking skin",
        body: "The manufacturer says it helps improve the appearance of dry, rough skin and fine lines.",
      },
      {
        title: "Morning and evening",
        body: "A 100 ml toner designed to fit into a morning and evening routine.",
      },
    ],
    steps: [
      { title: "Cleanse", body: "Begin with clean skin." },
      {
        title: "Apply",
        body: "Put an appropriate amount on your hands or a cotton pad.",
      },
      {
        title: "Pat on",
        body: "Gently pat onto your face and neck, avoiding the eye area.",
      },
      {
        title: "Follow up",
        body: "Follow with your favourite serum and moisturiser.",
      },
    ],
    keyIngredients: [
      {
        slug: "egf",
        name: "EGF-related ingredients",
        role: "Skin-conditioning. The listing doesn't give the exact ingredient names.",
      },
      {
        slug: "niacinamide",
        name: "Niacinamide",
        role: "Helps even the look of skin tone, says the manufacturer.",
      },
      {
        slug: "collagen",
        name: "Collagen",
        role: "Supports a smooth, supple feel, says the manufacturer.",
      },
      {
        slug: "hyaluronic-acid",
        name: "Hyaluronic acid",
        role: "Helps attract moisture for hydrated, plump-looking skin.",
      },
    ],
    specs: [
      { label: "Format", value: "Facial toner, 100 ml" },
      { label: "Use on", value: "Face and neck, avoiding the eye area" },
      { label: "Origin", value: "Korea (confirm on packaging)" },
      { label: "Brand", value: "Belurae Editor" },
    ],
    inTheBox: [
      { item: "EGF Tox Toner", detail: "100 ml boxed bottle, per set" },
    ],
    safety: {
      patchTest:
        "Patch test before first use: apply a small amount to a small area of skin and wait 24 hours. Don't use the product if you notice redness, burning, itching or swelling.",
      note: "Use according to the directions on the product packaging. Where the pack is less specific, we follow the standard precautions for leave-on skin care below.",
      use: ["Face", "Neck"],
      avoid: [
        "The eye area",
        "Broken, sunburnt or irritated skin",
        "Skin that has reacted to a similar product before",
      ],
      ifIrritation:
        "If your skin feels irritated, rinse the area with plenty of cool water and stop using the toner. If irritation continues, contact a doctor or pharmacist.",
    },
    faqs: [
      {
        q: "What is this product?",
        a: "A 100 ml facial toner from the Belurae Editor brand, for use after cleansing and before serum and moisturiser.",
      },
      {
        q: "How do I use it?",
        a: "On clean skin, put an appropriate amount on your hands or a cotton pad and gently pat it onto your face and neck, avoiding the eye area. Follow with your serum and moisturiser.",
      },
      {
        q: "Can I use it morning and evening?",
        a: "The manufacturer describes it as suited to a morning and evening routine. Use it according to the directions on the pack.",
      },
      {
        q: "What are the key ingredients?",
        a: "The manufacturer lists EGF-related ingredients, niacinamide, collagen and hyaluronic acid. We're waiting on the full ingredient list and will publish it when we have it.",
      },
      {
        q: "Is it suitable for sensitive skin?",
        a: "The manufacturer doesn't make a sensitive-skin claim for this toner, and no product suits every skin. Patch test a small area 24 hours before your first full use.",
      },
      {
        q: "Where is it made?",
        a: "The manufacturer's listing gives Korea as the origin and asks buyers to confirm on the packaging.",
      },
      {
        q: "Can I return it?",
        a: "Personal-care products can't be returned once received, unless they arrive damaged, defective or incorrect — contact us and we'll put it right. EU customers also have a 14-day right to cancel. See the refund policy for details.",
      },
    ],
    googleCategory:
      "Health & Beauty > Personal Care > Cosmetics > Skin Care > Facial Toners & Astringents",
    pdp: {
      packs: "cards",
      galleryFit: "flush",
      perksOneColumn: true,
      trust: [
        { icon: "globe", text: "100% Original Korean Skincare" },
        { icon: "leaf", text: "Zero Harsh Chemicals" },
        { icon: "droplet", text: "Natural Glass-Skin Bounce" },
      ],
      dailyStep: {
        eyebrow: "Your daily step",
        heading: "For hydrated, smoother-looking skin.",
        body: "The manufacturer describes this toner as helping replenish moisture and leave skin feeling fresh, comfortable and supple.",
        mediaFile: "S838391d7c5b24108ad0a034663d2b5cfr",
        benefits: [
          {
            icon: "droplet",
            title: "Hydration & softness",
            body: "Helps replenish moisture and leave skin feeling fresh and comfortable.",
          },
          {
            icon: "star",
            title: "Smoother-looking skin",
            body: "Helps improve the appearance of dry, rough skin and fine lines.",
          },
          {
            icon: "leaf",
            title: "Supple, radiant look",
            body: "Helps skin look supple, refreshed and naturally radiant.",
          },
        ],
      },
      howTo: {
        heading: "Four simple steps.",
        intro:
          "The short version: cleanse, apply, pat on, follow with serum and moisturiser.",
      },
      ingredientListNote:
        "We're waiting on the complete INCI list from the manufacturer and will publish it here in full.",
      showHairRemovalComparison: false,
      notice: {
        lead: "Patch test 24 hours before first use.",
        text: "Avoid the eye area.",
      },
    },
    contentGaps: [
      "Full INCI ingredient list, including the specific EGF-related ingredient names",
      "Exact wording of the packaging warnings",
      "Confirmed country of origin from the pack",
      "Skin types the manufacturer recommends it for",
      "GTIN / barcode",
    ],
  },
];

export const BELURAE_HANDLES: readonly string[] = products.map((p) => p.handle);

export function productContentBySlug(slug: string): ProductContent | undefined {
  return products.find((p) => p.slug === slug);
}

/** A legacy slug's canonical product, for a 301 redirect — undefined if `slug` is current or unknown. */
export function productContentByLegacySlug(
  slug: string,
): ProductContent | undefined {
  return products.find((p) => p.legacySlugs.includes(slug));
}

export function productContentByHandle(
  handle: string,
): ProductContent | undefined {
  return products.find((p) => p.handle === handle);
}
