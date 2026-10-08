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

import type { IconName } from "@/components/ui/Icon";
import type { PackTier } from "@/lib/commerce/tiers";

export type ProductFaq = { q: string; a: string };

/** The neutrals a theme can re-tint (globals.css: --color-<name>). */
export type SurfaceColors = Record<
  | "ivory"
  | "porcelain"
  | "cream"
  | "sand"
  | "linen"
  | "line"
  | "ink"
  | "ink-soft"
  | "ink-faint",
  string
>;

/** The accent a theme can re-tint (globals.css: --color-clay-<step>). */
export type AccentColors = Record<"50" | "100" | "200" | "300" | "600", string>;

/** A colour ramp, lightest (50) to darkest (900). */
export type ColorRamp = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

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
  /** Optional override — defaults to the ingredient entity's own glyph. */
  icon?: IconName;
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
  /**
   * Quantity-break packs on ONE variant (one SKU): a "2 Pack" is quantity 2 of
   * the same variant. The percentages must match the Shopify automatic
   * discounts, which do the real pricing at checkout (see lib/commerce/tiers.ts).
   */
  packTiers?: PackTier[];
  story: { heading: string; body: string[] };
  highlights: { title: string; body: string }[];
  steps: { title: string; body: string }[];
  keyIngredients: KeyIngredient[];
  /**
   * The complete INCI declaration, one entry per ingredient, in the order the
   * manufacturer gave it. Shown in full under the key ingredients; omit it and
   * the page keeps pointing at the pack's own declaration.
   */
  inci?: string[];
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
    /**
     * Social proof chip above the H1, in place of the delivery tile.
     * `count` is the number of orders we can point to for this product
     * (Shopify order count for the line item) and `asOf` dates that reading,
     * so the figure gets refreshed instead of drifting. Rendered as
     * "25,000+ happy customers".
     */
    customers?: { count: number; asOf: string };
    /**
     * Units sold over the last `months` months, shown right beside the rating
     * above the H1 as "17,841+ sold in the last 3 months". `asOf` dates the
     * reading so it gets refreshed instead of drifting.
     */
    sold?: { count: number; months: number; asOf: string };
    /** Show Shopify's `custom.perks` one per row instead of two columns. */
    perksOneColumn?: boolean;
    /**
     * Colour theme of the page, applied document-wide while the page is open
     * (header and footer included). `primary` is a 50–900 ramp that replaces
     * the sage tokens — keep 600 dark enough for white text (≥ 4.5:1).
     * `accent` replaces the clay tokens (savings, tags, timer banner) and
     * `surface` the warm neutrals: page background, raised cards, washes,
     * borders and text greys. Omit to keep the brand palette.
     */
    theme?: {
      primary: ColorRamp;
      accent: AccentColors;
      surface: SurfaceColors;
    };
    /** "flush": gallery photos shown whole (no crop), with no tinted panel or padding. */
    galleryFit?: "contain" | "flush";
    /** "cards": the photo-card pack picker instead of stacked rows. */
    packs?: "list" | "cards";
    /**
     * Cards only. Default true: a multi-set card leads with the per-set ("each")
     * price. False: every card shows its own price and compare-at, like the
     * single bottle.
     */
    perSetPrice?: boolean;
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
    /** Only products with an intro show the video showcase; clips come from `productVideosBySlug` in the PDP page. */
    videosIntro?: string;
    howTo: {
      heading: string;
      intro: string;
      guide?: { href: string };
    };
    /** Beside the key ingredients: names them in INCI form. The page appends the "Ask us" link. */
    ingredientsNote: string;
    /** The mousse / razor / wax comparison only makes sense for hair removal. */
    showHairRemovalComparison: boolean;
    /** Callout under the buy box; omit to hide it. */
    notice?: { lead: string; text: string };
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
      "A spray-on hair removal mousse for the body. Spray, wait 3–5 minutes, and wipe hair away with the included scraper — no blade, no wax strips.",
    manufacturer: "Belurae (Cloud Sense)",
    seo: {
      title: "Hair Removal Mousse · 140 ml Spray",
      description:
        "Spray-on body hair removal mousse with aloe leaf water, glycerin and hyaluronic acid. On skin for 3–5 minutes, then wiped away. Full directions, key ingredients and safety guidance.",
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
        "Shaving means a blade against your skin; waxing means pulling. This mousse works differently: you spray an even layer, leave it for 3–5 minutes, then wipe it away together with the hair using the scraper in the box.",
        "The manufacturer labels the formula hypoallergenic and additive-free, with aloe leaf water, glycerin, hyaluronic acid and ginseng and portulaca extracts listed as key ingredients. Every skin is different, though — so we ask everyone to patch test first, and we tell you plainly where not to use it.",
      ],
    },
    highlights: [
      {
        title: "No blade, no strips",
        body: "Spray on, wait, wipe away with the scraper. Nothing cuts or pulls at the skin.",
      },
      {
        title: "3–5 minutes on skin",
        body: "A defined window from the directions. Rinse off at 5 minutes, even if some hair remains.",
      },
      {
        title: "Hydrates Skin Up to 24hrs",
        body: "With aloe leaf water, glycerin and hyaluronic acid. Patch test 24 hours before first use.",
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
        title: "Wait 3–5 minutes",
        body: "Leave the mousse on for 3–5 minutes. Don't exceed 5 minutes.",
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
        role: "A botanical extract from ginseng root, one of the key herbal ingredients in this formula.",
      },
      {
        slug: "portulaca-oleracea-extract",
        name: "Portulaca oleracea extract",
        role: "Purslane extract, a botanical used in skin-care formulas for a conditioning feel.",
      },
    ],
    specs: [
      { label: "Format", value: "Spray mousse, 140 ml / 4.73 fl oz" },
      { label: "Time on skin", value: "3–5 minutes" },
      { label: "Scent", value: "Orange Spring Cologne" },
      {
        label: "Skin type",
        value:
          "Labelled for sensitive skin (hypoallergenic, no additives) by the manufacturer",
      },
      { label: "Suitable for", value: "Men and women" },
      { label: "Made by", value: "Belurae (Cloud Sense)" },
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
        "Full body",
        "Bikini and underarms",
        "Legs and arms",
        "Face and ear hair",
      ],
      avoid: [
        "Around the eyes",
        "Inside the nose",
        "Skin with scars, cuts or active breakouts",
      ],
      ifIrritation:
        "If you feel stinging or burning, remove the mousse and rinse the area straight away with plenty of cool water, and stop using it. If irritation continues, contact a doctor or pharmacist.",
    },
    faqs: [
      {
        q: "What is this product?",
        a: "A spray-on hair removal mousse for the body (140 ml). You apply it to clean, dry skin, leave it on for 3–5 minutes, then wipe it away together with the hair using the included scraper and rinse.",
      },
      {
        q: "How long should I leave it on?",
        a: "3 to 5 minutes. Don't leave it on longer than 5 minutes, even if some hair remains — a longer wait raises the chance of irritation.",
      },
      {
        q: "Is it suitable for sensitive skin?",
        a: "The manufacturer labels it hypoallergenic, additive-free and suitable for sensitive skin, but no product suits every skin. Patch test a small area 24 hours before your first full use.",
      },
      {
        q: "Where can I use it?",
        a: "On the body: legs, arms, underarms, back, chest, face, eyebrows and the bikini line. Don't use it near your eyes, on the genitals or other mucous membranes, or on broken or irritated skin.",
      },
      {
        q: "Can I use it on the bikini line?",
        a: "Yes, following the directions on the pack. It is not for use on the genitals or mucous membranes. Patch test first, and keep to the 3–5 minute window.",
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
          "The short version: patch test, spray, wait 3–5 minutes, wipe, rinse, rest.",
        guide: { href: "/guides/how-to-use-hair-removal-mousse" },
      },
      dailyStep: {
        eyebrow: "Your daily step",
        heading: "The hair remover that tells you when to stop.",
        body: "Five minutes, then rinse, even if some hair remains. Spray on, wait 3–5 minutes, then wipe hair away with the included scraper. Nothing cuts or pulls at the skin, and the full ingredient list is printed on every pack.",
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
            title: "3–5 minutes on skin",
            body: "A defined window from the directions. Rinse off at 5 minutes.",
          },
          {
            icon: "leaf",
            title: "Light citrus scent",
            body: "The manufacturer's “Orange Spring Cologne” fragrance.",
          },
        ],
      },
      ingredientsNote:
        "Aloe Barbadensis Leaf Water, Glycerin, Hyaluronic Acid, Panax Ginseng Root Extract and Portulaca Oleracea Extract — the key ingredients in this formula, in INCI form. The complete INCI declaration is printed on every pack.",
      packs: "cards",
      perSetPrice: true,
      galleryFit: "flush",
      perksOneColumn: true,
      /* Lavender, from the bottle cap and label. */
      theme: {
        primary: {
          "50": "#f6f2fb",
          "100": "#ece4f6",
          "200": "#d9caee",
          "300": "#bea5de",
          "400": "#9e79c9",
          "500": "#7e53ae",
          "600": "#65399a",
          "700": "#522d7b",
          "800": "#3c2059",
          "900": "#29153f",
        },
        accent: {
          "50": "#f8f1fb",
          "100": "#efe2f6",
          "200": "#dfc6ec",
          "300": "#b98ad6",
          "600": "#7b3594",
        },
        surface: {
          ivory: "#ffffff",
          porcelain: "#ffffff",
          cream: "#f1ebf8",
          sand: "#e6dcf1",
          linen: "#dccfea",
          line: "#cdbfe0",
          ink: "#1d1826",
          "ink-soft": "#554c63",
          "ink-faint": "#665d74",
        },
      },
      trust: [
        { icon: "feather", text: "No blade, no wax strips" },
        { icon: "clock", text: "3–5 minutes on skin" },
        { icon: "droplet", text: "Hydrates Skin Up to 24hrs" },
      ],
      /* Orders shipped for this product — Shopify count, read 2026-10-02. */
      customers: { count: 22000, asOf: "2026-10-02" },
      /* Supplied by the merchant on 2026-10-07. */
      sold: { count: 17841, months: 3, asOf: "2026-10-07" },
      showHairRemovalComparison: true,
      notice: {
        lead: "Patch test 24 hours before first use.",
        text: "Not for the eyes, genitals or mucous membranes.",
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
        role: "Skin-conditioning. The pack's declaration names the exact ingredient.",
        icon: "sparkles",
      },
      {
        slug: "niacinamide",
        name: "Niacinamide",
        role: "Helps even the look of skin tone.",
        icon: "tone",
      },
      {
        slug: "collagen",
        name: "Collagen",
        role: "Supports a smooth, supple feel.",
        icon: "layers",
      },
      {
        slug: "hyaluronic-acid",
        name: "Hyaluronic acid",
        role: "Helps attract moisture for hydrated, plump-looking skin.",
        icon: "droplet",
      },
    ],
    /* As supplied by the manufacturer, in their order. The source was one run of
       words with no separators, so the commas are ours: each entry is one INCI
       name (e.g. "Dipropylene Glycol", "Mica (CI 77019)"). */
    inci: [
      "Water",
      "Niacinamide",
      "Dipropylene Glycol",
      "Diethoxyethyl Succinate",
      "Hydroxyacetophenone",
      "Caprylyl Glycol",
      "Silk Water",
      "Arginine",
      "Carbomer",
      "Mica (CI 77019)",
      "Hydroxyethylcellulose",
      "Titanium Dioxide (CI 77891)",
      "Adenosine",
      "Disodium EDTA",
      "1,2-Hexanediol",
      "Glycerin",
      "Butylene Glycol",
      "Dipotassium Glycyrrhizate",
      "Hydrolyzed Silk",
      "Tin Oxide",
      "Propanediol",
      "Octyldodecanol",
      "Hydrogenated Lecithin",
      "Lecithin",
      "Methylpropanediol",
      "Ceramide NP",
      "Melia Azadirachta Flower Extract",
      "Ocimum Sanctum Leaf Extract",
      "Melia Azadirachta Leaf Extract",
      "Caprylic/Capric Triglyceride",
      "sh-Polypeptide-121",
      "Glycine Soja (Soybean) Peptide",
      "Sodium Palmitoyl Sarcosinate",
      "Curcuma Longa (Turmeric) Root Extract",
      "Acetyl Glutamine",
      "Benzyl Glycol",
      "Corallina Officinalis Extract",
      "Sodium Hyaluronate",
      "Hydrolyzed Glycosaminoglycans",
      "Ethylhexylglycerin",
      "Heptasodium Hexacarboxymethyl Dipeptide-12",
      "Bacillus/Folic Acid/Soybean Ferment Extract",
      "Dipeptide Diaminobutyroyl Benzylamide Diacetate",
      "Sodium Phosphate",
      "Dextran",
      "Benzoic Acid",
      "Sodium Benzoate",
      "Sodium Hyaluronate Crosspolymer",
      "Silk Amino Acids",
      "Silk Extract",
      "Hydrolyzed Elastin",
      "Myristoyl Pentapeptide-17",
      "Myristoyl Pentapeptide-4",
      "sh-Polypeptide-123",
      "Hydrolyzed Hyaluronic Acid",
      "Palmitoyl Pentapeptide-5",
      "Acetyl Tetrapeptide-3",
      "Trifolium Pratense (Clover) Flower Extract",
      "Copper Tripeptide-1",
      "Atelocollagen",
      "Palmitoyl Pentapeptide-4",
      "Desamido Collagen",
      "Hydroxypropyltrimonium Hyaluronate",
      "Acetyl Hexapeptide-8",
      "Caffeoyl Hexapeptide-65",
      "Hydrolyzed Collagen",
      "Palmitoyl Tetrapeptide-7",
      "sh-Decapeptide-7",
      "sh-Octapeptide-4",
      "sh-Oligopeptide-9",
      "sh-Pentapeptide-19",
      "Palmitoyl Tripeptide-1",
      "Soluble Collagen",
      "Collagen",
      "Collagen Amino Acids",
      "Hyaluronic Acid",
      "Tripeptide-32",
      "sr-(Oligopeptide-91 Clostridium Botulinum Polypeptide-1)",
      "sh-Oligopeptide-1",
      "sh-Polypeptide-1",
      "sh-Oligopeptide-2",
      "sh-Polypeptide-11",
      "sh-Polypeptide-9",
      "Procollagen",
      "Sodium Acetylated Hyaluronate",
      "sh-Polypeptide-16",
      "sh-Polypeptide-22",
      "sh-Polypeptide-3",
      "sh-Polypeptide-19",
      "sh-Polypeptide-62",
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
        a: "EGF-related ingredients, niacinamide, collagen and hyaluronic acid. They're named in INCI form further up this page, and the complete declaration is printed on the pack.",
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
      videosIntro:
        "Short clips of the toner, so you can see the bottle and texture before you buy.",
      packs: "cards",
      galleryFit: "flush",
      perksOneColumn: true,
      /* Gold, from the bottle's cap and label. */
      theme: {
        primary: {
          "50": "#fbf7ec",
          "100": "#f5ecd2",
          "200": "#ead7a3",
          "300": "#dcbd6e",
          "400": "#c9a044",
          "500": "#b08425",
          "600": "#8a6417",
          "700": "#6e4f14",
          "800": "#523b11",
          "900": "#3a290c",
        },
        accent: {
          "50": "#fbf4ea",
          "100": "#f5e4cc",
          "200": "#ebcb9f",
          "300": "#d9a766",
          "600": "#8f5a14",
        },
        surface: {
          ivory: "#ffffff",
          porcelain: "#ffffff",
          cream: "#f6eed9",
          sand: "#eddfbf",
          linen: "#e4d2a8",
          line: "#d6c493",
          ink: "#211c12",
          "ink-soft": "#5b5240",
          "ink-faint": "#6b6150",
        },
      },
      trust: [
        { icon: "globe", text: "100% Original Korean Skincare" },
        { icon: "leaf", text: "Zero Harsh Chemicals" },
        { icon: "droplet", text: "Natural Glass-Skin Bounce" },
      ],
      /* Orders shipped for this product — Shopify count, read 2026-10-02. */
      customers: { count: 25000, asOf: "2026-10-02" },
      dailyStep: {
        eyebrow: "Your daily step",
        heading: "One pat. Fresh, soft, ready for your serum.",
        body: "Fast-absorbing and non-greasy, it pats on in seconds and gets your skin ready for the serum that follows. With EGF-related ingredients, niacinamide, collagen and hyaluronic acid, it helps skin feel soft, hydrated and supple.",
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
      ingredientsNote:
        "EGF-related ingredients, Niacinamide, Collagen and Hyaluronic Acid — the key ingredients in this formula, in INCI form. The complete INCI list is just below, and the declaration is printed on every pack.",
      showHairRemovalComparison: false,
      notice: {
        lead: "Patch test 24 hours before first use.",
        text: "Avoid the eye area.",
      },
    },
    contentGaps: [
      "Exact wording of the packaging warnings",
      "Confirmed country of origin from the pack",
      "Skin types the manufacturer recommends it for",
      "GTIN / barcode",
    ],
  },
  {
    handle: "voyage-nova-middle-eastern-rose-fragrance",
    slug: "voyage-nova-middle-eastern-rose-fragrance",
    legacySlugs: [
      "middle-eastern-rose-fragrance",
      "amz-light-luxury-middle-eastern-rose-fragrance-gentle-rose-scent-elegant-fresh-long-lasting-perfume-for-dating-and-commuting-ver",
    ],
    name: "Middle Eastern Rose Fragrance",
    format: "Fragrance spray · 50 ml",
    category: { slug: "fragrance", name: "Fragrance" },
    benefitLine:
      "A 50 ml rose fragrance spray with a soft, light rose scent, in its own box. Spray it on the wrists, neck and behind the ears. Choose a single bottle, or a Duo or Trio set in the Christmas offer.",
    manufacturer: "Voyage Novus",
    seo: {
      title: "Rose Fragrance · Oct Special Offer",
      description:
        "A 50 ml rose fragrance spray in its own box, with a soft, light rose scent. Christmas offer on single, Duo and Trio sets. Ingredients, directions and safety guidance.",
    },
    optionLabels: {
      Quantity: {
        label: "Choose your pack",
        values: {
          "1PC": "Single bottle",
          "2PCS": "Duo set",
          "3PCS": "Trio set",
        },
      },
    },
    packOption: { name: "Quantity", units: { "1PC": 1, "2PCS": 2, "3PCS": 3 } },
    story: {
      heading: "A soft rose, sprayed where you want it.",
      body: [
        "This is a 50 ml rose fragrance spray. You spray it on the wrists, the neck and behind the ears, wherever you'd like a hint of scent. The manufacturer calls it a luxurious Middle Eastern rose fragrance and describes the scent as soft, light and long-lasting.",
        "It is a short formula: aqua, propylene glycol, glycerin, 1,2-hexanediol and Rosa Rugosa flower extract are the five ingredients the manufacturer lists. The listing doesn't give a separate fragrance or allergen declaration, so we suggest a patch test first, and the safety notes below say where not to use it.",
      ],
    },
    highlights: [
      {
        title: "A soft rose scent",
        body: "The manufacturer describes a luxurious Middle Eastern rose fragrance that is light and elegant.",
      },
      {
        title: "Moist, non-sticky texture",
        body: "Described by the manufacturer as refreshing and comfortable on the skin, and not sticky.",
      },
      {
        title: "A short ingredient list",
        body: "Aqua, propylene glycol, glycerin, 1,2-hexanediol and Rosa Rugosa flower extract, as listed by the manufacturer.",
      },
      {
        title: "Spray and go",
        body: "On the wrists, the neck and behind the ears, wherever you like a hint of fragrance.",
      },
      {
        title: "Easy to give",
        body: "A 50 ml bottle that comes in its own box, easy to give or to keep. The Duo and Trio sets cover more than one gift.",
      },
    ],
    steps: [
      {
        title: "Patch test",
        body: "If it's your first time, spray a small amount on a small area, such as the inner wrist, and wait 24 hours.",
      },
      {
        title: "Spray on the wrists",
        body: "Spray an appropriate amount on your wrists.",
      },
      {
        title: "Neck and behind the ears",
        body: "Apply to the neck and behind the ears, or any area where you want to leave a fragrance.",
      },
      {
        title: "Enjoy the rose scent",
        body: "Keep it away from your eyes, and from broken or irritated skin.",
      },
    ],
    keyIngredients: [
      {
        slug: "rosa-rugosa-flower-extract",
        name: "Rosa Rugosa flower extract",
        role: "A rose flower extract, the botanical ingredient the manufacturer lists.",
        icon: "flower",
      },
      {
        slug: "glycerin",
        name: "Glycerin",
        role: "A humectant: it draws water into the top layer of the skin.",
      },
      {
        slug: "propylene-glycol",
        name: "Propylene glycol",
        role: "A clear liquid used in cosmetics as a solvent and humectant.",
        icon: "droplet",
      },
      {
        slug: "1-2-hexanediol",
        name: "1,2-Hexanediol",
        role: "A clear liquid used in cosmetics as a solvent and conditioning ingredient.",
        icon: "layers",
      },
    ],
    /* As shown on the manufacturer's ingredient graphic, in their order. */
    inci: [
      "Aqua",
      "Propylene Glycol",
      "Glycerin",
      "1,2-Hexanediol",
      "Rosa Rugosa Flower Extract",
    ],
    specs: [
      { label: "Format", value: "Fragrance spray, 50 ml / 1.69 fl oz" },
      {
        label: "Scent",
        value: "Rose, described as a luxurious Middle Eastern rose fragrance",
      },
      { label: "Use on", value: "Wrists, neck and behind the ears" },
      { label: "Shelf life", value: "3 years, stored in a cool, dry place" },
      { label: "Brand on the pack", value: "Voyage Novus" },
    ],
    inTheBox: [
      {
        item: "Rose fragrance spray",
        detail: "50 ml / 1.69 fl oz bottle with its box, per set",
      },
    ],
    safety: {
      patchTest:
        "Patch test before first use: spray a small amount on a small area of skin, such as the inner wrist, and wait 24 hours. Don't use the product if you notice redness, burning, itching or swelling.",
      note: "The manufacturer's listing gives directions but no warnings, so we follow the standard precautions for fragranced skin products below. Read any warnings printed on the pack.",
      use: ["Wrists", "Neck", "Behind the ears"],
      avoid: [
        "The eyes and the area around them",
        "Broken, sunburnt or irritated skin",
        "Skin that has reacted to fragranced products before",
      ],
      ifIrritation:
        "If your skin feels irritated, rinse the area with plenty of cool water and stop using it. If it gets in your eyes, rinse them with water. If irritation continues, contact a doctor or pharmacist.",
    },
    faqs: [
      {
        q: "What is this product?",
        a: "A 50 ml rose fragrance spray. The manufacturer calls it a luxurious Middle Eastern rose fragrance. You spray it on the wrists, the neck and behind the ears.",
      },
      {
        q: "How do I use it?",
        a: "Spray an appropriate amount on your wrists, then on the neck and behind the ears, or any area where you want to leave a fragrance.",
      },
      {
        q: "What does it smell like?",
        a: "A rose scent. The manufacturer describes it as soft, light and elegant. The listing doesn't give scent notes, so we can't describe the top, heart or base.",
      },
      {
        q: "How long does the scent last?",
        a: "The manufacturer describes the scent as soft and long-lasting but gives no duration. How long a scent lasts varies with the person, their skin and the conditions.",
      },
      {
        q: "What is it made of?",
        a: "The manufacturer lists aqua, propylene glycol, glycerin, 1,2-hexanediol and Rosa Rugosa flower extract. The listing doesn't include a separate fragrance or allergen declaration, so ask us if you have a known sensitivity.",
      },
      {
        q: "Is it suitable for sensitive skin?",
        a: "We don't make a sensitive-skin claim for this fragrance, and no product suits every skin. Fragranced products can bother some skin, so patch test a small area 24 hours before your first full use.",
      },
      {
        q: "How should I store it?",
        a: "The manufacturer's spec sheet says to store it in a cool, dry place, and gives a shelf life of 3 years.",
      },
      {
        q: "Is it a good Christmas gift?",
        a: "It is a 50 ml bottle that comes in its own box, which makes it easy to give. Scent is personal, though, and personal-care products can't be returned once received (see the refund policy), so choose a rose scent you think they'll like. The Duo and Trio sets are there if you are buying for more than one person.",
      },
      {
        q: "Why does the box say Voyage Novus?",
        a: "That is the name printed on the manufacturer's box and bottle. Belurae is the seller.",
      },
      {
        q: "Can I return it?",
        a: "Personal-care products can't be returned once received, unless they arrive damaged, defective or incorrect — contact us and we'll put it right. EU customers also have a 14-day right to cancel. See the refund policy for details.",
      },
    ],
    googleCategory:
      "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
    pdp: {
      packs: "cards",
      perSetPrice: false,
      galleryFit: "flush",
      perksOneColumn: true,
      /* Rose, from the pink box and bottle. */
      theme: {
        primary: {
          "50": "#fdf4f5",
          "100": "#fae6e9",
          "200": "#f5ccd3",
          "300": "#eba3b1",
          "400": "#de7389",
          "500": "#c9506b",
          "600": "#a63555",
          "700": "#862a45",
          "800": "#651f35",
          "900": "#4a1626",
        },
        accent: {
          "50": "#fdf3ef",
          "100": "#fbe3da",
          "200": "#f6c8b6",
          "300": "#ec9f84",
          "600": "#a4482c",
        },
        surface: {
          ivory: "#ffffff",
          porcelain: "#ffffff",
          cream: "#fbeff0",
          sand: "#f4dfe2",
          linen: "#ecd0d5",
          line: "#e2bfc6",
          ink: "#2a1a1f",
          "ink-soft": "#66505a",
          "ink-faint": "#76606a",
        },
      },
      trust: [
        { icon: "flower", text: "Rose fragrance · 50 ml" },
        { icon: "droplet", text: "Moist, non-sticky texture" },
        { icon: "heart", text: "Christmas offer" },
      ],
      dailyStep: {
        eyebrow: "Christmas offer",
        heading: "A rose to wear, or to give.",
        body: "A 50 ml bottle in its own box, easy to give or to keep. Spray on the wrists, then on the neck and behind the ears, wherever you'd like a hint of rose. The manufacturer describes a moist, refreshing texture that feels comfortable on the skin and isn't sticky.",
        mediaFile: "H2e3b2e4e8559462abdaecc86923ccdcdb",
        imagePosition: "center",
        benefits: [
          {
            icon: "heart",
            title: "A soft rose scent",
            body: "A light, elegant Middle Eastern rose, as the manufacturer describes it.",
          },
          {
            icon: "droplet",
            title: "Moist, non-sticky feel",
            body: "Refreshing and comfortable on the skin.",
          },
          {
            icon: "feather",
            title: "Easy to wear",
            body: "Wrists, neck and behind the ears.",
          },
        ],
      },
      howTo: {
        heading: "Four easy steps.",
        intro:
          "The short version: patch test, spray on the wrists, then the neck and behind the ears.",
      },
      ingredientsNote:
        "Aqua, Propylene Glycol, Glycerin, 1,2-Hexanediol and Rosa Rugosa Flower Extract: the five ingredients the manufacturer lists, in INCI form. The listing gives no separate fragrance or allergen declaration, so check the pack and ask us if you have a sensitivity.",
      showHairRemovalComparison: false,
      notice: {
        lead: "Patch test 24 hours before first use.",
        text: "Avoid the eyes and broken skin.",
      },
    },
    contentGaps: [
      "Full fragrance and allergen declaration (the listing shows five ingredients, none named as perfume)",
      "Scent notes (top, heart and base)",
      "Exact wording of the packaging warnings",
      "Photos showing the 2-pack and 3-pack",
      "GTIN / barcode",
    ],
  },
  {
    handle: "body-adhesive",
    slug: "body-adhesive",
    legacySlugs: [
      "liquid-body-adhesive-glue-for-clothes-clear-body-glue-for-clothes-clothing-glue-for-skin-body-tape-alternative-for-women",
    ],
    name: "Body Adhesive",
    format: "Liquid body adhesive · 20 ml",
    category: { slug: "body-adhesive", name: "Body Adhesive" },
    benefitLine:
      "A 20 ml liquid adhesive for holding clothes, dancewear and tape against the skin. Dab on a thin layer, wait 20–30 seconds, press and hold. Rinse with warm water to remove.",
    manufacturer: "Belurae (Body Glue)",
    seo: {
      title: "Body Adhesive · 20 ml Liquid Tube",
      description:
        "A 20 ml liquid body adhesive for clothes, dancewear and tape. Sweat and water resistant, latex-free, washes off with water. Directions, ingredients and safety guidance.",
    },
    optionLabels: {
      Color: { label: "Size", values: { "20mlX1": "20 ml" } },
    },
    /* One variant, one SKU: a 2 or 3 Pack is the same tube at quantity 2 or 3.
       The Shopify automatic discounts "Body Adhesive Pack - Buy 2 Save 20%"
       and "Buy 3+ Save 30%" do the pricing at checkout. */
    packTiers: [
      { size: 1, discountPercent: 0 },
      { size: 2, discountPercent: 20 },
      { size: 3, discountPercent: 30 },
    ],
    story: {
      heading: "A liquid hold for the outfit you want to keep still.",
      body: [
        "This is a 20 ml tube of liquid body adhesive. You dab a thin layer on clean, dry skin or on the inside of the garment, wait 20–30 seconds until it turns clear and tacky, then press the fabric, tape or hairpiece into place. When you're done, warm water or a wet cloth dissolves it.",
        "The manufacturer describes a latex-free, hypoallergenic formula made from acrylic copolymer and water, with a sweat-resistant, water-soluble hold that leaves no sticky residue and doesn't stain fabric. The listing gives no hold time and no warnings, so we ask everyone to patch test first, and the safety notes below say where not to use it.",
      ],
    },
    highlights: [
      {
        title: "A secure hold",
        body: "The manufacturer describes an all-day hold for clothes, dancewear, costumes and athletic tape.",
      },
      {
        title: "Dries in 20–30 seconds",
        body: "Wait until it turns clear and tacky, then press and hold for a few seconds.",
      },
      {
        title: "Washes off with any soap and water",
        body: "Warm water or a wet cloth dissolves it. The manufacturer says it leaves no sticky residue.",
      },
      {
        title: "Latex-free formula",
        body: "Acrylic copolymer and water, as listed by the manufacturer. Patch test 24 hours before first use.",
      },
    ],
    steps: [
      {
        title: "Prepare",
        body: "Clean and dry the skin thoroughly to remove oils, lotions and sweat. If it's your first time, patch test a small area 24 hours before.",
      },
      {
        title: "Apply",
        body: "Squeeze the tube gently and spread a thin, even layer on the skin or on the inside of the garment.",
      },
      {
        title: "Let it set",
        body: "Wait 20–30 seconds, until the adhesive turns clear and tacky to the touch.",
      },
      {
        title: "Press and hold",
        body: "Press the fabric, wig or tape firmly onto the prepared skin and hold it for a few seconds to set.",
      },
      {
        title: "Remove",
        body: "Rinse the area with warm water, or wipe with a wet cloth, until the adhesive dissolves completely.",
      },
    ],
    keyIngredients: [
      {
        slug: "acrylic-copolymer",
        name: "Acrylic copolymer",
        role: "A film-forming polymer that dries into a thin, tacky layer. The adhesive base the manufacturer lists.",
      },
      {
        slug: "water",
        name: "Water",
        role: "The base of the formula: it carries the polymer and evaporates as the adhesive dries.",
      },
    ],
    specs: [
      { label: "Format", value: "Liquid body adhesive, 20 ml / 0.7 fl oz tube" },
      {
        label: "Formula",
        value:
          "Acrylic copolymer and water, as listed by the manufacturer. Latex-free",
      },
      { label: "Dries in", value: "20–30 seconds, until clear and tacky" },
      { label: "Removal", value: "Warm water or a wet cloth; soap and water" },
      { label: "Shelf life", value: "3 years" },
      { label: "Brand on the pack", value: "Body Glue" },
    ],
    inTheBox: [
      {
        item: "Body adhesive",
        detail: "20 ml / 0.7 fl oz tube, with its box",
      },
    ],
    safety: {
      patchTest:
        "Patch test before first use: apply a small amount to a small area of skin, let it set, remove it as directed, and wait 24 hours. Don't use the product if you notice redness, burning, itching or swelling.",
      note: "The manufacturer's listing gives directions but no warnings, so we follow the standard precautions for skin adhesives below. Read any warnings printed on the pack.",
      use: [
        "Clean, dry, intact skin",
        "The inside of clothing and dancewear",
        "Tape, wigs and hairpieces, as the manufacturer lists",
      ],
      avoid: [
        "The eyes and the area around them",
        "Broken, sunburnt or irritated skin",
        "Skin that has reacted to adhesives before",
      ],
      ifIrritation:
        "If your skin feels irritated, rinse the area with warm water to dissolve the adhesive and stop using it. If it gets in your eyes, rinse them with water. If irritation continues, contact a doctor or pharmacist.",
    },
    faqs: [
      {
        q: "What is this product?",
        a: "A 20 ml tube of liquid body adhesive. You apply a thin layer to the skin or the inside of a garment, let it turn clear and tacky, then press fabric, tape or a hairpiece into place. It rinses off with water.",
      },
      {
        q: "How do I use it?",
        a: "Clean and dry the skin, spread a thin even layer, wait 20–30 seconds until it is clear and tacky, then press the fabric firmly onto the skin and hold it for a few seconds.",
      },
      {
        q: "How do I remove it?",
        a: "Rinse the area with warm water, or wipe with a wet cloth, until the adhesive dissolves. The listing also describes it as easy to remove with soap and water.",
      },
      {
        q: "Will it stain my clothes?",
        a: "The manufacturer says it won't stain or damage delicate fabrics and leaves no sticky residue. Fabrics differ, so if a garment is delicate or precious, test a hidden spot first.",
      },
      {
        q: "Is it sweat-proof and waterproof?",
        a: "The manufacturer describes it as sweat-resistant and water-resistant, and also as water-soluble, which is why it washes off. The listing gives no hold time, so we can't say how many hours it lasts for a given activity.",
      },
      {
        q: "Is it suitable for sensitive skin?",
        a: "The manufacturer describes the formula as latex-free, gentle and hypoallergenic, but no product suits every skin. Patch test a small area 24 hours before your first full use.",
      },
      {
        q: "What can I use it for?",
        a: "The manufacturer lists strapless dresses and straps, dancewear and costumes, athletic tape and bandages, slip-prone socks, compression stockings, cosplay gear, and lace front wigs and hairpieces.",
      },
      {
        q: "What is it made of?",
        a: "The manufacturer lists cosmetic-grade acrylic copolymer and water. The listing doesn't include a full ingredient declaration, so ask us if you have a known sensitivity.",
      },
      {
        q: "How much is in a tube, and how long does it keep?",
        a: "20 ml (0.7 fl oz). The manufacturer gives a shelf life of 3 years.",
      },
      {
        q: "Can I return it?",
        a: "Personal-care products can't be returned once received, unless they arrive damaged, defective or incorrect — contact us and we'll put it right. EU customers also have a 14-day right to cancel. See the refund policy for details.",
      },
    ],
    googleCategory: "Apparel & Accessories > Clothing Accessories",
    pdp: {
      videosIntro:
        "See how body glue goes on and holds, in short clips.",
      galleryFit: "flush",
      perksOneColumn: true,
      /* Pink, from the pink tube and box. */
      theme: {
        primary: {
          "50": "#fef3f8",
          "100": "#fce4ef",
          "200": "#f9c9de",
          "300": "#f4a0c3",
          "400": "#ec6fa3",
          "500": "#d9528d",
          "600": "#c2447c",
          "700": "#a13866",
          "800": "#7e2c50",
          "900": "#5a203a",
        },
        accent: {
          "50": "#fdf2f7",
          "100": "#fbe2ed",
          "200": "#f6c6da",
          "300": "#ec9bbb",
          "600": "#a13866",
        },
        surface: {
          ivory: "#ffffff",
          porcelain: "#ffffff",
          cream: "#fdf1f5",
          sand: "#f9e0e9",
          linen: "#f0cdda",
          line: "#e6bccb",
          ink: "#2b1a22",
          "ink-soft": "#66505b",
          "ink-faint": "#76606b",
        },
      },
      trust: [
        { icon: "droplet", text: "Sweat & water resistant" },
        { icon: "shield", text: "Latex-free formula" },
        { icon: "feather", text: "Washes off with any soap and water" },
      ],
      dailyStep: {
        eyebrow: "Your outfit, secured",
        heading: "Wear it. Move in it. Wash it off.",
        body: "Dab a thin layer on clean, dry skin or the inside of the garment, wait 20–30 seconds until it turns clear and tacky, then press and hold. When you're done, rinse with warm water or wipe with a wet cloth. The manufacturer describes a hold that keeps straps, necklines and tape in place, and a formula that leaves no sticky residue.",
        mediaFile: "S1f0cc8f94de94998937789ab4290f48av",
        imagePosition: "center",
        benefits: [
          {
            icon: "shield",
            title: "A secure hold",
            body: "The manufacturer's description for clothes, dancewear and tape.",
          },
          {
            icon: "droplet",
            title: "Sweat and water resistant",
            body: "And water-soluble, so it still washes off.",
          },
          {
            icon: "clock",
            title: "Dries in 20–30 seconds",
            body: "Clear and tacky to the touch, then press and hold.",
          },
        ],
      },
      howTo: {
        heading: "Five simple steps.",
        intro:
          "The short version: clean and dry the skin, apply a thin layer, wait 20–30 seconds, press and hold, rinse to remove.",
      },
      ingredientsNote:
        "Acrylic copolymer and water: the two ingredients the manufacturer lists. The listing gives no full ingredient declaration, so check the pack and ask us if you have a sensitivity.",
      showHairRemovalComparison: false,
    },
    contentGaps: [
      "Full ingredient (INCI) declaration; the listing names acrylic copolymer and water only",
      "How long it holds, and under what conditions",
      "Exact wording of the packaging warnings",
      "Whether it is suitable near the face or hairline (the listing mentions lace front wigs but gives no warnings)",
      "Manufacturer's name (the listing says no brand; the pack reads Body Glue)",
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
