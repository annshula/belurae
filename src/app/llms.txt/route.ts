import { guides } from "@/content/guides";
import { ingredients } from "@/content/ingredients";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";
import { absoluteUrl, site } from "@/lib/site";

/**
 * /llms.txt — a plain-text map of the canonical pages and core facts for AI
 * systems (blueprint §17). Same facts as the pages; refreshed with the catalog.
 */
export const revalidate = 3600;

export async function GET() {
  const [products, currency] = await Promise.all([getProducts(), storeCurrency()]);
  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## Products",
    ...products.map(({ record, content }) => {
      const v = buildProductView(record, content, currency);
      return `- [${content.name}](${absoluteUrl(v.href)}): ${content.format}. ${content.benefitLine} From ${formatMoney(v.fromPrice, currency)}. Made by ${content.manufacturer}. Key ingredients: ${content.keyIngredients.map((k) => k.name).join(", ")}. Not for the face, genitals or broken skin; patch test 24 hours before first use.`;
    }),
    "",
    "## Guides",
    ...guides.map((g) => `- [${g.title}](${absoluteUrl(`/guides/${g.slug}`)}): ${g.summary}`),
    "",
    "## Ingredients",
    ...ingredients.map((i) => `- [${i.name}](${absoluteUrl(`/ingredients/${i.slug}`)}): ${i.summary}`),
    "",
    "## Company",
    `- [About](${absoluteUrl("/pages/about")})`,
    `- [Our standards](${absoluteUrl("/pages/standards")}): how claims, ingredients, reviews and pricing are handled.`,
    `- [FAQs](${absoluteUrl("/pages/faq")})`,
    `- [Shipping](${absoluteUrl("/pages/shipping")}): tracked delivery, ${site.delivery.minDays}–${site.delivery.maxDays} days.`,
    `- [Refund policy](${absoluteUrl("/pages/refund-policy")})`,
    `- Contact: ${site.supportEmail}`,
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" },
  });
}
