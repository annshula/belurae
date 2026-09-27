/**
 * Belurae product line — editorial layer on top of the Shopify catalog.
 *
 * Shopify owns: price, variants, availability, media (data/catalog.json).
 * This file owns: naming, copy, directions, warnings, FAQs and gallery curation.
 *
 * CLAIMS RULE (docs/blueprint/01-brand.md §2): every statement here must come
 * from the manufacturer's packaging/listing as shown on the live product page,
 * attributed where it is the manufacturer's claim. Unknowns are listed in
 * `contentGaps` and simply not rendered — never filled with guesses.
 */

export type ProductFaq = { q: string; a: string };

export type KeyIngredient = {
  /** Slug of the ingredient page (content/ingredients.ts). */
  slug: string;
  name: string;
  role: string;
};

export type ProductContent = {
  /** Shopify product handle (source of truth for the catalog). */
  handle: string;
  /** Public URL slug: /products/{slug}. */
  slug: string;
  /** Old URLs that 308 to this product. */
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
  optionLabels: Record<string, { label: string; values: Record<string, string> }>;
  /** Option whose values are pack sizes, mapped to unit counts. */
  packOption?: { name: string; units: Record<string, number> };
  /** One line per set explaining what is included. */
  setDescriptions?: Record<string, string>;
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
  /** Shopify media to show, in order, matched by file-name fragment. Anything not listed is hidden. */
  gallery: { match: string; alt: string }[];
  /** Items still needed from the manufacturer before the content is complete. */
  contentGaps: string[];
};

export const products: ProductContent[] = [
  {
    handle: "bikini-pain-free-hair-removal-spray",
    slug: "hair-removal-mousse",
    legacySlugs: ["bikini-pain-free-hair-removal-spray", "bikini-pain-free-hair-removal-cream"],
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
      Style: {
        label: "Choose your set",
        values: {
          Spray: "Mousse",
          "Spray & Serum": "Mousse + Serum",
          "Spray & Cream": "Mousse + Cream",
        },
      },
      Quantity: {
        label: "Choose your pack",
        values: { "1PC": "1 set", "2PCS": "2 sets", "3PCS": "3 sets" },
      },
    },
    packOption: { name: "Quantity", units: { "1PC": 1, "2PCS": 2, "3PCS": 3 } },
    setDescriptions: {
      Spray: "One 140 ml mousse can and a scraper.",
      "Spray & Serum": "The mousse and scraper, plus the manufacturer's companion serum.",
      "Spray & Cream": "The mousse and scraper, plus a 100 ml Smooth hair removal cream tube.",
    },
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
      { title: "Prepare", body: "Start with clean, dry skin. If it's your first time, patch test a small area 24 hours before." },
      { title: "Apply", body: "Spray an even layer that fully covers the hair you want to remove." },
      { title: "Wait 5–10 minutes", body: "Leave the mousse on for 5–10 minutes. Don't exceed 10 minutes." },
      { title: "Remove", body: "Gently wipe the mousse and hair away with the included scraper." },
      { title: "Rinse", body: "Rinse the area thoroughly with lukewarm water and pat dry." },
      { title: "Aftercare", body: "Skip fragranced products, hot baths and sun on the area for the rest of the day. Wait until skin is completely calm before using again." },
    ],
    keyIngredients: [
      { slug: "aloe-leaf-water", name: "Aloe leaf water", role: "A water-based aloe extract, commonly used in body care for a soothing, conditioning feel." },
      { slug: "glycerin", name: "Glycerin", role: "A humectant: it draws water into the top layer of the skin." },
      { slug: "hyaluronic-acid", name: "Hyaluronic acid", role: "A humectant that helps skin hold on to moisture." },
      { slug: "ginseng-extract", name: "Ginseng extract", role: "A botanical extract from ginseng root, listed by the manufacturer as a key herbal ingredient." },
      { slug: "portulaca-oleracea-extract", name: "Portulaca oleracea extract", role: "Purslane extract, a botanical used in skin-care formulas for a conditioning feel." },
    ],
    specs: [
      { label: "Format", value: "Spray mousse, 140 ml / 4.73 fl oz" },
      { label: "Cream (Mousse + Cream set)", value: "Smooth hair removal cream, 100 ml / 3.5 fl oz" },
      { label: "Time on skin", value: "5–10 minutes" },
      { label: "Scent", value: "Orange Spring Cologne" },
      { label: "Skin type", value: "Labelled for sensitive skin (hypoallergenic, no additives) by the manufacturer" },
      { label: "Suitable for", value: "Men and women" },
      { label: "Made by", value: "PHOFAY (Cloud Sense)" },
    ],
    inTheBox: [
      { item: "Hair removal mousse", detail: "140 ml / 4.73 fl oz spray can, per set" },
      { item: "Scraper", detail: "For wiping the mousse and hair away" },
      { item: "Serum or Smooth cream", detail: "Included only with the Mousse + Serum or Mousse + Cream sets" },
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
        q: "What's the difference between the sets?",
        a: "“Mousse” is the spray can and scraper. “Mousse + Serum” adds the manufacturer's companion serum. “Mousse + Cream” adds a 100 ml Smooth hair removal cream tube.",
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
    gallery: [
      { match: "cb532d83", alt: "Hair removal mousse can with scraper, aloe leaves, ginseng root and crocus flowers" },
      { match: "d18c159e", alt: "Mousse can standing next to its box, photographed on a desk" },
      { match: "4bfe1451", alt: "Mousse can with the Smooth hair removal cream tube (Mousse + Cream set)" },
      { match: "f9bf984c", alt: "Mousse can with the companion serum (Mousse + Serum set)" },
      { match: "c47134fd", alt: "Short video of the mousse being used" },
      { match: "5c6a8008", alt: "Key ingredients: ginseng extract, portulaca oleracea extract, aloe leaf water and glycerin" },
      { match: "ff825bef", alt: "Four steps: clean, apply, wait 5 to 10 minutes, scrape and rinse" },
      { match: "74ba0718", alt: "Short video showing the mousse routine" },
    ],
    contentGaps: [
      "Full INCI ingredient list, including the hair-removing active ingredient",
      "Exact wording of the packaging warnings",
      "Name, size and ingredients of the companion serum",
      "Ingredient list and directions for the Smooth cream",
      "GTIN / barcode",
    ],
  },
];

export const BELURAE_HANDLES: readonly string[] = products.map((p) => p.handle);

export function productContentBySlug(slug: string): ProductContent | undefined {
  return products.find((p) => p.slug === slug);
}

export function productContentByHandle(handle: string): ProductContent | undefined {
  return products.find((p) => p.handle === handle);
}
