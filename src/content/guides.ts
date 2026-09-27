/**
 * Evergreen guides (/guides/[slug]). Written to the claims rules: general,
 * practical, no medical claims, and always deferring to the product's own
 * directions. Each guide opens with a direct answer (AEO summary).
 */

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; title: string; text: string };

export type GuideSection = { heading: string; blocks: GuideBlock[] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  /** 2–4 sentence direct answer shown at the top. */
  summary: string;
  readingMinutes: number;
  published: string;
  updated: string;
  topic: "Hair removal" | "Sensitive skin" | "Aftercare";
  sections: GuideSection[];
  faqs?: { q: string; a: string }[];
  /** Product slugs featured in the guide. */
  products: string[];
  related: string[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-use-hair-removal-mousse",
    title: "How to use a hair removal mousse, step by step",
    description:
      "A calm, practical walkthrough of using a spray hair removal mousse at home: preparing skin, timing, removal and aftercare.",
    summary:
      "Start with clean, dry, unbroken skin and patch test 24 hours before your first use. Spray an even layer over the hair, leave it on for the time on the pack (5–10 minutes for our mousse), wipe it away with the scraper, then rinse thoroughly with lukewarm water. Never go past the maximum time.",
    readingMinutes: 5,
    published: "2026-09-27",
    updated: "2026-09-27",
    topic: "Hair removal",
    sections: [
      {
        heading: "Before you start",
        blocks: [
          { type: "p", text: "Hair removal mousses and creams are depilatories: they break hair down at the skin's surface so it can be wiped away, instead of cutting it (like a razor) or pulling it out (like wax). Because they work chemically, preparation and timing matter more than technique." },
          {
            type: "ul",
            items: [
              "Read the directions and warnings on the pack — they are the rules for that specific formula.",
              "Patch test 24 hours before your first full use (see our patch-test guide).",
              "Use it on clean, dry skin with no cuts, sunburn, irritation or rash.",
              "Avoid using it straight after shaving, waxing or exfoliating the same area — give skin a few days.",
              "Have a timer ready. Guessing is the most common way people leave products on too long.",
            ],
          },
        ],
      },
      {
        heading: "Step by step",
        blocks: [
          {
            type: "ol",
            items: [
              "Rinse and dry the area. Skin should be completely dry so the mousse sits evenly.",
              "Spray an even layer that fully covers the hair. You don't need to rub it in.",
              "Start your timer. For our mousse, the window is 5–10 minutes.",
              "Around the lower end of the window, test a small patch with the scraper. If hair wipes away easily, remove the rest.",
              "Wipe the mousse off with the scraper in gentle strokes, going against the direction of hair growth.",
              "Rinse the area thoroughly with lukewarm water until no product remains, then pat dry.",
            ],
          },
          { type: "note", title: "Don't go over time", text: "If some hair is left when you reach the maximum time, rinse anyway. Leaving the product on longer won't help and makes irritation more likely. You can treat missed spots on another day once skin is calm." },
        ],
      },
      {
        heading: "Afterwards",
        blocks: [
          { type: "p", text: "Freshly treated skin is more reactive for a few hours. For the rest of the day, skip fragranced products, deodorant on treated underarms, hot baths, saunas, swimming pools and direct sun on the area. A plain, fragrance-free moisturiser is fine once skin feels comfortable." },
          { type: "p", text: "Before using the product again on the same area, wait until skin is completely calm — no redness or tenderness." },
        ],
      },
      {
        heading: "If something feels wrong",
        blocks: [
          { type: "p", text: "Mild warmth can happen, but stinging or burning is a signal to stop. Remove the product immediately, rinse with plenty of cool water, and don't reapply. If irritation continues, contact a doctor or pharmacist." },
        ],
      },
    ],
    faqs: [
      { q: "How long should hair removal mousse stay on?", a: "As long as the pack says and no longer. For our mousse that's 5–10 minutes." },
      { q: "Should I shave before using a hair removal mousse?", a: "No. Shaving just before can leave skin more reactive. Give the area a few days after shaving or waxing." },
    ],
    products: ["hair-removal-mousse"],
    related: ["how-to-patch-test", "hair-removal-aftercare", "choosing-a-hair-removal-method"],
  },
  {
    slug: "how-to-patch-test",
    title: "How to patch test a new body-care product",
    description:
      "Why and how to patch test before using a new hair removal or body-care product, and what a reaction looks like.",
    summary:
      "A patch test means using a small amount of a new product on a small area first, then waiting 24 hours to see how your skin responds. For a rinse-off product like a hair removal mousse, apply and remove it exactly as directed on a coin-sized area, then check for redness, itching, burning or swelling over the next day.",
    readingMinutes: 4,
    published: "2026-09-27",
    updated: "2026-09-27",
    topic: "Sensitive skin",
    sections: [
      {
        heading: "Why patch test at all?",
        blocks: [
          { type: "p", text: "Labels like “hypoallergenic” or “for sensitive skin” are helpful signals, but they can't promise that a product suits everyone. A patch test is a small, low-risk way to find out how your own skin responds before you use a product on a large area." },
          { type: "p", text: "It's especially worth doing for hair removal products, fragranced products, and anything you plan to use on sensitive areas." },
        ],
      },
      {
        heading: "How to do it",
        blocks: [
          {
            type: "ol",
            items: [
              "Choose a small, discreet patch of the kind of skin you plan to treat — for a body product, the inner forearm or a small area on the lower leg works well.",
              "Make sure the skin is clean, dry and unbroken.",
              "Use the product exactly as directed, just on a coin-sized area. For a hair removal mousse, that means applying it, keeping to the time on the pack, removing it and rinsing.",
              "Leave the area alone for 24 hours. Don't apply other new products there.",
              "Check the area a few times during the day and the next morning.",
            ],
          },
        ],
      },
      {
        heading: "Reading the result",
        blocks: [
          { type: "p", text: "No change after 24 hours is a good sign that you can go ahead and use the product as directed. Redness, itching, burning, swelling, bumps or rash are signs to stop — don't use the product." },
          { type: "note", title: "A patch test isn't a guarantee", text: "Skin can react differently on different parts of the body, and sensitivity can change over time. Always follow the pack's directions and stop if anything feels wrong." },
        ],
      },
    ],
    products: ["hair-removal-mousse"],
    related: ["how-to-use-hair-removal-mousse", "hair-removal-aftercare"],
  },
  {
    slug: "hair-removal-aftercare",
    title: "Hair removal aftercare: the first 24 hours",
    description:
      "Simple aftercare for the day after hair removal: what to skip, what helps, and when to wait before the next session.",
    summary:
      "After hair removal, keep the area clean and calm for about 24 hours: rinse off all product, pat dry, and skip fragrance, deodorant on treated underarms, hot water, saunas, pools and direct sun. A plain fragrance-free moisturiser is fine once skin feels comfortable. Wait until skin is fully calm before removing hair from the same area again.",
    readingMinutes: 4,
    published: "2026-09-27",
    updated: "2026-09-27",
    topic: "Aftercare",
    sections: [
      {
        heading: "Straight after",
        blocks: [
          { type: "ul", items: ["Rinse thoroughly with lukewarm water until no product remains.", "Pat dry with a clean towel — don't rub.", "Wear loose, breathable clothing over the area if you can."] },
        ],
      },
      {
        heading: "For the rest of the day",
        blocks: [
          {
            type: "ul",
            items: [
              "Skip fragranced lotions, perfume and deodorant on freshly treated skin.",
              "Avoid hot baths, saunas, steam rooms and swimming pools.",
              "Keep the area out of direct sun, and don't use self-tan yet.",
              "Hold off on scrubs, exfoliating acids and other hair removal on the same area.",
            ],
          },
          { type: "p", text: "If the area feels dry, a plain, fragrance-free moisturiser is a sensible choice once it feels comfortable." },
        ],
      },
      {
        heading: "Before the next session",
        blocks: [
          { type: "p", text: "Wait until the skin is completely calm — no redness, tenderness or bumps — before removing hair from the same area again. If you notice lasting irritation, stop and speak to a doctor or pharmacist." },
        ],
      },
    ],
    products: ["hair-removal-mousse"],
    related: ["how-to-use-hair-removal-mousse", "how-to-patch-test"],
  },
  {
    slug: "choosing-a-hair-removal-method",
    title: "Mousse, cream, razor or wax? Choosing an at-home hair removal method",
    description:
      "A neutral comparison of common at-home hair removal methods — how each works, what it involves and what to consider.",
    summary:
      "Razors cut hair at the surface, wax pulls it out from the root, and depilatory mousses and creams break hair down chemically at the surface so it can be wiped away. None is best for everyone: the right choice depends on the area, your skin, how much time you have, and whether you'd rather avoid blades or pulling.",
    readingMinutes: 6,
    published: "2026-09-27",
    updated: "2026-09-27",
    topic: "Hair removal",
    sections: [
      {
        heading: "Razors",
        blocks: [
          { type: "p", text: "A blade cuts hair at the skin's surface. Shaving is quick and inexpensive, works on any hair length, and needs no waiting time. Some people get nicks, razor burn or bumps, particularly on curved or sensitive areas, and because hair is cut at the surface, stubble can reappear quickly." },
        ],
      },
      {
        heading: "Wax",
        blocks: [
          { type: "p", text: "Warm or strip wax grips hair and pulls it out from the follicle. Because hair is removed from the root, results typically last longer than shaving. Waxing usually needs hair to be a minimum length, can be uncomfortable, and can irritate reactive skin." },
        ],
      },
      {
        heading: "Depilatory mousses and creams",
        blocks: [
          { type: "p", text: "A depilatory breaks down hair at the skin's surface so it can be wiped or rinsed away. There's no blade and no pulling, and it covers large areas easily. It does involve a waiting time and is a chemical process, so patch testing, keeping to the time on the pack and avoiding sensitive areas like the face and genitals are essential." },
        ],
      },
      {
        heading: "Questions to ask yourself",
        blocks: [
          {
            type: "ul",
            items: [
              "Which area? Large, flat areas suit sprays and creams; small, curved areas may be easier to shave. Never use body depilatories on the face or genitals.",
              "How does your skin usually react? If blades or wax tend to irritate you, a depilatory may be worth a patch test — if chemical products irritate you, it may not.",
              "How much time do you have? Shaving is fastest; a depilatory needs a 5–10 minute wait; waxing takes preparation.",
            ],
          },
        ],
      },
    ],
    products: ["hair-removal-mousse"],
    related: ["how-to-use-hair-removal-mousse", "how-to-patch-test"],
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
