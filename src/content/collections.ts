/**
 * Collection pages. A collection is published only when it has real products
 * and real introductory content (no thin category pages).
 */

export type CollectionContent = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  /** Category slug(s) whose products belong here; "*" for all. */
  categories: string[] | "*";
  education?: { heading: string; paragraphs: string[] };
  faqs?: { q: string; a: string }[];
  related: { label: string; href: string }[];
};

export const collections: CollectionContent[] = [
  {
    slug: "hair-removal",
    title: "Hair Removal",
    seoTitle: "At-Home Hair Removal — No Blade, No Wax",
    description:
      "At-home body hair removal without a blade or wax strips, with key ingredients, clear directions and safety guidance for every product.",
    intro:
      "Removing body hair is a personal choice, and there's no single right method. Our hair removal range is for people who'd rather skip blades and wax: sprays and creams that you apply, leave for a few minutes and wipe away. Every product page lists the key ingredients, the exact timing and — just as importantly — where not to use it.",
    categories: ["hair-removal"],
    education: {
      heading: "Choosing an at-home method",
      paragraphs: [
        "Razors cut hair at the skin's surface, wax pulls it out from the root, and depilatory mousses and creams break hair down at the surface so it can be wiped away. Depilatories involve no blade and no pulling, cover large areas easily and take around 5–10 minutes of waiting.",
        "Because they work chemically, they ask for a little care: patch test before first use, keep to the time on the pack, and never use a product near your eyes or on your genitals, and use it on your face only if the pack says it's suitable. Our guides walk through each step.",
      ],
    },
    faqs: [
      {
        q: "Which hair removal method is best for sensitive skin?",
        a: "It depends on what your skin reacts to. If blades or wax tend to irritate you, a depilatory may be worth a patch test; if chemical products irritate you, shaving may suit you better. Always patch test something new.",
      },
      {
        q: "Can I use body hair removal products on my face?",
        a: "Only if the pack says it's suitable for the face, and then only as directed. Keep it away from your eyes, and patch test first.",
      },
      {
        q: "How long do hair removal mousses take?",
        a: "Our mousse stays on the skin for 5–10 minutes, then is wiped away and rinsed — around 15 minutes start to finish.",
      },
    ],
    related: [
      {
        label: "How to use hair removal mousse",
        href: "/guides/how-to-use-hair-removal-mousse",
      },
      {
        label: "Choosing a hair removal method",
        href: "/guides/choosing-a-hair-removal-method",
      },
      {
        label: "Hair removal aftercare",
        href: "/guides/hair-removal-aftercare",
      },
    ],
  },
  {
    slug: "skincare",
    title: "Skincare",
    seoTitle: "Facial Skincare — Clear Ingredients, Plain Directions",
    description:
      "Facial skincare with the key ingredients, directions and safety guidance spelled out on every product page.",
    intro:
      "Each skincare product page names the key ingredients in INCI form, how to use it and where not to, and the complete declaration is printed on every pack.",
    categories: ["skincare"],
    related: [
      { label: "How to patch test", href: "/guides/how-to-patch-test" },
      { label: "Ingredients", href: "/ingredients" },
    ],
  },
  {
    slug: "fragrance",
    title: "Fragrance",
    seoTitle: "Fragrance — Ingredients and Directions, Plainly",
    description:
      "Fragrance sprays with the ingredients, directions and safety guidance spelled out on every product page.",
    intro:
      "Each fragrance product page names the ingredients as the manufacturer lists them, says how to wear it and where not to, and is clear about what we don't yet know.",
    categories: ["fragrance"],
    related: [
      { label: "How to patch test", href: "/guides/how-to-patch-test" },
      { label: "Ingredients", href: "/ingredients" },
    ],
  },
  {
    slug: "all",
    title: "Shop all",
    seoTitle: "Shop All Beauty & Wellness",
    description:
      "Everything Belurae sells today — body care, skincare and fragrance for simpler everyday routines.",
    intro:
      "Belurae is a deliberate range. We add products only when we can explain exactly what they are, how to use them and who they're for. Today that means at-home hair removal, facial skincare and fragrance.",
    categories: "*",
    related: [
      { label: "Our standards", href: "/pages/standards" },
      { label: "All guides", href: "/guides" },
    ],
  },
];

export function collectionBySlug(slug: string) {
  return collections.find((c) => c.slug === slug);
}
