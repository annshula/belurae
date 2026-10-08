import type { IconName } from "@/components/ui/Icon";

/**
 * Ingredient entities (/ingredients/[slug]). General, widely documented
 * descriptions of what each ingredient is and why formulators use it — never
 * a claim about what it does in a specific Belurae product beyond "it is
 * listed as a key ingredient".
 */

export type Ingredient = {
  slug: string;
  name: string;
  /** Name as it typically appears on an INCI list. */
  inci: string;
  /** Glyph shown on ingredient cards, lists and the PDP orbs. */
  icon: IconName;
  summary: string;
  whatItIs: string[];
  whyUsed: string[];
  goodToKnow: string[];
};

export const ingredients: Ingredient[] = [
  {
    slug: "aloe-leaf-water",
    name: "Aloe leaf water",
    inci: "Aloe Barbadensis Leaf Water",
    icon: "leaf",
    summary:
      "Aloe leaf water is the watery part of the aloe vera leaf, used in body-care formulas as a base ingredient with a soothing, conditioning feel.",
    whatItIs: [
      "Aloe vera (Aloe barbadensis) is a succulent plant whose thick leaves hold a clear gel and water. “Aloe leaf water” is that aqueous portion, processed for use in cosmetics.",
      "On an ingredient list it usually appears as Aloe Barbadensis Leaf Water. It is different from aloe leaf juice or aloe gel, which are more concentrated forms.",
    ],
    whyUsed: [
      "Formulators often use aloe leaf water in place of some of the plain water in a product, so it contributes to the product's texture and skin feel.",
      "It is popular in products used on freshly treated skin because of aloe's long history in soothing, after-sun style care.",
    ],
    goodToKnow: [
      "Being plant-derived doesn't make an ingredient suitable for everyone — some people are sensitive to plants in the lily family, which includes aloe.",
      "An ingredient's position on the list gives a rough idea of how much is present: ingredients are listed in descending order down to 1%.",
    ],
  },
  {
    slug: "glycerin",
    name: "Glycerin",
    inci: "Glycerin",
    icon: "droplet",
    summary:
      "Glycerin is a humectant — an ingredient that draws water into the outer layer of the skin. It is one of the most widely used ingredients in skin and body care.",
    whatItIs: [
      "Glycerin (also called glycerol) is a clear, odourless, slightly sweet liquid. It can be made from plant oils or produced synthetically.",
      "It is found in a huge range of products — cleansers, moisturisers, creams and hair-removal products alike.",
    ],
    whyUsed: [
      "As a humectant, glycerin attracts water, which helps keep the skin's surface hydrated and soft to the touch.",
      "It also helps products spread evenly and stops formulas from drying out.",
    ],
    goodToKnow: [
      "Glycerin is generally very well tolerated, which is part of why it is so common.",
      "It works best alongside ingredients that help skin hold on to the water it attracts.",
    ],
  },
  {
    slug: "hyaluronic-acid",
    name: "Hyaluronic acid",
    inci: "Hyaluronic Acid / Sodium Hyaluronate",
    icon: "droplet",
    summary:
      "Hyaluronic acid is a humectant that helps the skin's surface hold on to moisture. In cosmetics it is often used in its salt form, sodium hyaluronate.",
    whatItIs: [
      "Hyaluronic acid is a substance the body makes naturally; it is found in skin and connective tissue. For cosmetics it is usually produced by fermentation.",
      "On ingredient lists it may appear as Hyaluronic Acid or as Sodium Hyaluronate, its more commonly used salt form.",
    ],
    whyUsed: [
      "It binds water, so it is used to help skin feel hydrated and supple.",
      "In products that are applied and rinsed off, its role is mainly to support the skin's feel during and immediately after use.",
    ],
    goodToKnow: [
      "Hyaluronic acid is generally well tolerated.",
      "“Contains hyaluronic acid” says nothing on its own about how much is in a product — look at where it sits on the full ingredient list.",
    ],
  },
  {
    slug: "ginseng-extract",
    name: "Ginseng extract",
    inci: "Panax Ginseng Root Extract",
    icon: "flower",
    summary:
      "Ginseng extract comes from the root of the ginseng plant and is used in skin and body care as a botanical ingredient.",
    whatItIs: [
      "Panax ginseng is a slow-growing plant whose root has been used in East Asian traditions for centuries. Cosmetic ginseng extract is made by extracting that root.",
      "On ingredient lists it usually appears as Panax Ginseng Root Extract.",
    ],
    whyUsed: [
      "Botanical extracts like ginseng are included for their skin-conditioning character and are common in Korean and Chinese-developed formulas.",
    ],
    goodToKnow: [
      "Plant extracts can occasionally cause sensitivity. A patch test before first use is the simplest way to check how your skin responds to a new product.",
    ],
  },
  {
    slug: "portulaca-oleracea-extract",
    name: "Portulaca oleracea extract",
    inci: "Portulaca Oleracea Extract",
    icon: "leaf",
    summary:
      "Portulaca oleracea extract comes from purslane, a common succulent plant, and is used in skin-care formulas as a conditioning botanical.",
    whatItIs: [
      "Portulaca oleracea — known as purslane — is a small, fleshy-leaved plant that grows in many parts of the world and is also eaten as a vegetable.",
      "Its extract is a familiar ingredient in products designed with sensitive-feeling skin in mind, especially in East Asian skin care.",
    ],
    whyUsed: [
      "Formulators include purslane extract for a calming, conditioning feel in leave-on and rinse-off products.",
    ],
    goodToKnow: [
      "As with any plant extract, individual reactions are possible — patch test new products.",
    ],
  },
  {
    slug: "egf",
    name: "EGF-related ingredients",
    inci: "Varies — often listed as an oligopeptide or polypeptide",
    icon: "sparkles",
    summary:
      "EGF stands for epidermal growth factor, a protein the body makes naturally. In cosmetics, EGF-related ingredients are lab-made versions or relatives of it, and are marketed for skin conditioning.",
    whatItIs: [
      "Epidermal growth factor is a small protein found naturally in the body. Cosmetic versions are made in a laboratory, and on an ingredient list they often appear under names such as sh-Oligopeptide-1 or sh-Polypeptide-1.",
      "“EGF-related” is a broad phrase. The Belurae Editor listing doesn't name the specific ingredient — the pack's declaration is the place to check the exact one.",
    ],
    whyUsed: [
      "Brands include EGF-related ingredients in leave-on products such as toners and serums as part of a skin-conditioning positioning.",
    ],
    goodToKnow: [
      "We make no claim about what EGF does in this toner beyond the manufacturer listing it as a key ingredient. The pack's ingredient declaration names the exact one.",
    ],
  },
  {
    slug: "niacinamide",
    name: "Niacinamide",
    inci: "Niacinamide",
    icon: "tone",
    summary:
      "Niacinamide is a form of vitamin B3 widely used in skin care as a conditioning ingredient.",
    whatItIs: [
      "Niacinamide (also called nicotinamide) is a water-soluble form of vitamin B3. It is a common ingredient in toners, serums and moisturisers.",
    ],
    whyUsed: [
      "Formulators use it to condition skin. The manufacturer says it helps improve the appearance of uneven skin tone in this toner.",
    ],
    goodToKnow: [
      "Niacinamide is generally well tolerated, but any active ingredient can bother some skin. A patch test before first use is the simplest check.",
    ],
  },
  {
    slug: "collagen",
    name: "Collagen",
    inci: "Hydrolyzed Collagen / Collagen",
    icon: "layers",
    summary:
      "Collagen is a protein. In cosmetics it is used as a skin-conditioning ingredient that helps products feel smooth on the skin.",
    whatItIs: [
      "Collagen is the main structural protein in skin. Cosmetic collagen is usually broken down into smaller pieces (hydrolysed collagen) and comes from animal or marine sources.",
    ],
    whyUsed: [
      "In leave-on products it is used for its conditioning, smooth feel. The manufacturer says it supports a smooth, supple feel in this toner.",
    ],
    goodToKnow: [
      "Putting collagen on the skin is not the same as the body making its own collagen. Treat it as a conditioning ingredient.",
      "If the source matters to you (for example marine or animal), check the pack or ask us.",
    ],
  },
  {
    slug: "rosa-rugosa-flower-extract",
    name: "Rosa Rugosa flower extract",
    inci: "Rosa Rugosa Flower Extract",
    icon: "flower",
    summary:
      "Rosa Rugosa flower extract comes from the flowers of Rosa rugosa, a hardy rose also called the Japanese or beach rose. It is used in cosmetics as a botanical ingredient.",
    whatItIs: [
      "Rosa rugosa is a shrub rose with large, fragrant flowers. An extract is made by drawing soluble material out of the petals into a solvent, and on an ingredient list it appears as Rosa Rugosa Flower Extract.",
    ],
    whyUsed: [
      "Rose extracts are used in skin care and fragrance-adjacent products as a botanical ingredient. The manufacturer lists it as the plant ingredient in this fragrance spray.",
    ],
    goodToKnow: [
      "An extract is not the same as a rose essential oil or a perfume. We make no claim about how much is in the formula or what it does for the scent.",
      "Plant extracts can occasionally cause sensitivity. A patch test before first use is the simplest way to check how your skin responds.",
    ],
  },
  {
    slug: "propylene-glycol",
    name: "Propylene glycol",
    inci: "Propylene Glycol",
    icon: "droplet",
    summary:
      "Propylene glycol is a clear, colourless liquid used in cosmetics as a solvent and humectant, which means it helps other ingredients dissolve and helps a product hold on to water.",
    whatItIs: [
      "Propylene glycol is a synthetic organic compound. It is odourless and mixes easily with water, which is why it turns up in so many creams, toners, sprays and cleansers.",
    ],
    whyUsed: [
      "Formulators use it to dissolve other ingredients and to help a formula keep a smooth, even texture. It is listed second in this fragrance spray, after aqua.",
    ],
    goodToKnow: [
      "It is widely used and generally well tolerated, but a small number of people react to it, especially on skin that is already irritated. A patch test before first use is the simplest check.",
    ],
  },
  {
    slug: "1-2-hexanediol",
    name: "1,2-Hexanediol",
    inci: "1,2-Hexanediol",
    icon: "layers",
    summary:
      "1,2-Hexanediol is a clear liquid used in cosmetics as a solvent and conditioning ingredient. It is often found in toners, serums and sprays.",
    whatItIs: [
      "1,2-Hexanediol is a small, water-soluble alcohol-type molecule (a diol). It is not the drying kind of alcohol found in some sprays; it is a different ingredient with a different name on the label.",
    ],
    whyUsed: [
      "Formulators use it to help dissolve other ingredients and to give a formula a lighter, less tacky feel.",
    ],
    goodToKnow: [
      "It is generally well tolerated, but any ingredient can bother some skin. Patch test new products before first use.",
    ],
  },
  {
    slug: "acrylic-copolymer",
    name: "Acrylic copolymer",
    inci: "Acrylic copolymer, as listed by the manufacturer",
    icon: "layers",
    summary:
      "Acrylic copolymers are film-forming polymers: long chains that dry into a thin, flexible layer. They are used in cosmetics, hair styling and skin adhesives.",
    whatItIs: [
      "A copolymer is a polymer made from two or more building blocks. Acrylic copolymers are made from acrylic-type building blocks and are usually supplied as a liquid that dries into a film.",
      "The manufacturer lists “cosmetic-grade acrylic copolymer” as the adhesive base of this body adhesive but doesn't name the exact grade, so we can't give its INCI name.",
    ],
    whyUsed: [
      "As the water in the formula evaporates, the polymer is left behind as a thin film that stays slightly tacky. That tack is what holds fabric, tape or a hairpiece against the skin.",
      "Because the film is water-soluble in this formula, warm water or a wet cloth is what dissolves it again.",
    ],
    goodToKnow: [
      "Acrylic-type polymers can occasionally cause a skin reaction in sensitive people. A patch test before first use is the simplest way to check how your skin responds.",
      "We make no claim about how much is in the formula. The manufacturer gives no percentage.",
    ],
  },
  {
    slug: "water",
    name: "Water",
    inci: "Aqua",
    icon: "droplet",
    summary:
      "Water, listed as Aqua on an ingredient list, is the base of most cosmetic formulas. It dissolves or carries the other ingredients.",
    whatItIs: [
      "On an INCI list, water appears as Aqua. In cosmetics it is purified, so it is not the same as water straight from the tap.",
    ],
    whyUsed: [
      "In a water-based adhesive, water carries the polymer and keeps the formula liquid in the tube. It evaporates as the adhesive dries. The manufacturer says the layer turns clear and tacky in 20–30 seconds.",
    ],
    goodToKnow: [
      "The manufacturer gives a shelf life of 3 years.",
    ],
  },
];

export function ingredientBySlug(slug: string): Ingredient | undefined {
  return ingredients.find((i) => i.slug === slug);
}

/**
 * Glyph for an ingredient wherever it is listed. A product's key-ingredient
 * entry may override it; otherwise the entity's own glyph is used.
 */
export function ingredientIcon(slug: string, override?: IconName): IconName {
  return override ?? ingredientBySlug(slug)?.icon ?? "leaf";
}
