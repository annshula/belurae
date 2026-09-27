import "server-only";

import { guides } from "@/content/guides";
import { ingredients } from "@/content/ingredients";
import { contentPages } from "@/content/pages";
import { products } from "@/content/products";

/**
 * Site search over products, guides, ingredients and pages. The catalogue is
 * small, so an in-process index beats a round trip to Shopify's search API.
 * Synonyms map everyday words to what we sell (blueprint §54).
 */

export type SearchResult = { type: "Product" | "Guide" | "Ingredient" | "Page" | "Question"; title: string; href: string; excerpt: string };

const SYNONYMS: Record<string, string[]> = {
  bikini: ["hair removal", "bikini line"],
  pubic: ["hair removal", "bikini line"],
  sensitive: ["sensitive skin", "patch test", "hypoallergenic"],
  gentle: ["sensitive skin", "hypoallergenic"],
  irritation: ["patch test", "sensitive", "aftercare", "stings"],
  burning: ["stings", "irritation", "aftercare"],
  aftercare: ["aftercare", "after"],
  after: ["aftercare"],
  soothing: ["aftercare", "aloe"],
  depilatory: ["hair removal", "mousse"],
  cream: ["hair removal", "mousse", "cream"],
  spray: ["mousse", "hair removal"],
  foam: ["mousse"],
  nair: ["hair removal", "mousse"],
  veet: ["hair removal", "mousse"],
  shave: ["razor", "hair removal", "method"],
  shaving: ["razor", "hair removal", "method"],
  razor: ["razor", "method"],
  wax: ["wax", "method"],
  waxing: ["wax", "method"],
  legs: ["legs", "hair removal"],
  underarm: ["underarms", "hair removal"],
  armpit: ["underarms", "hair removal"],
  hyaluronic: ["hyaluronic acid"],
  ginseng: ["ginseng"],
  purslane: ["portulaca"],
  delivery: ["shipping", "delivery"],
  refund: ["return", "refund"],
};

type Doc = SearchResult & { text: string; boost: number };

const docs: Doc[] = [
  ...products.flatMap((p): Doc[] => [
    {
      type: "Product",
      title: p.name,
      href: `/products/${p.slug}`,
      excerpt: p.benefitLine,
      text: [p.name, p.format, p.category.name, p.benefitLine, p.keyIngredients.map((k) => k.name).join(" "), "hair removal mousse spray bikini legs underarms"].join(" "),
      boost: 3,
    },
    ...p.faqs.map((f) => ({
      type: "Question" as const,
      title: f.q,
      href: `/products/${p.slug}#faq`,
      excerpt: f.a,
      text: `${f.q} ${f.a}`,
      boost: 1,
    })),
  ]),
  ...guides.map((g) => ({
    type: "Guide" as const,
    title: g.title,
    href: `/guides/${g.slug}`,
    excerpt: g.description,
    text: [g.title, g.description, g.summary, g.topic, g.sections.map((s) => s.heading).join(" ")].join(" "),
    boost: 2,
  })),
  ...ingredients.map((i) => ({
    type: "Ingredient" as const,
    title: i.name,
    href: `/ingredients/${i.slug}`,
    excerpt: i.summary,
    text: [i.name, i.inci, i.summary].join(" "),
    boost: 2,
  })),
  ...contentPages.map((p) => ({ type: "Page" as const, title: p.title, href: `/pages/${p.slug}`, excerpt: p.description, text: `${p.title} ${p.description} ${p.intro}`, boost: 1 })),
  { type: "Page", title: "Refund policy", href: "/pages/refund-policy", excerpt: "Returns and refunds.", text: "refund return returns exchange damaged", boost: 1 },
  { type: "Page", title: "Shipping & delivery", href: "/pages/shipping", excerpt: "Tracked delivery times and costs.", text: "shipping delivery tracking", boost: 1 },
];

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}\s]/gu, " ");

export function search(query: string, limit = 20): SearchResult[] {
  const q = normalise(query).trim().slice(0, 80);
  if (q.length < 2) return [];
  const terms = q.split(/\s+/).filter((t) => t.length > 1);
  const expanded = terms.flatMap((t) => [t, ...(SYNONYMS[t] ?? [])]);

  const scored = docs
    .map((d) => {
      const text = normalise(d.text);
      const title = normalise(d.title);
      let score = 0;
      for (const term of expanded) {
        const direct = terms.includes(term);
        if (title.includes(term)) score += (direct ? 6 : 3) * d.boost;
        else if (text.includes(term)) score += (direct ? 2 : 1) * d.boost;
        // tolerate simple typos on longer words ("remvoal")
        else if (direct && term.length > 4 && text.includes(term.slice(0, 4))) score += 0.5;
      }
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map(({ d }) => ({ type: d.type, title: d.title, href: d.href, excerpt: d.excerpt }));
}
