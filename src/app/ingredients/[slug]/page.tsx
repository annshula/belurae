import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ingredientBySlug, ingredients } from "@/content/ingredients";
import { products } from "@/content/products";
import { breadcrumbSchema, graph } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ingredients.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const i = ingredientBySlug(slug);
  if (!i) return {};
  return {
    title: `${i.name}: What It Is and Why It's Used`,
    description: i.summary,
    alternates: { canonical: `/ingredients/${i.slug}` },
  };
}

export default async function IngredientPage({ params }: Props) {
  const { slug } = await params;
  const ing = ingredientBySlug(slug);
  if (!ing) notFound();

  const url = `/ingredients/${ing.slug}`;
  const usedIn = products.filter((p) =>
    p.keyIngredients.some((k) => k.slug === ing.slug),
  );
  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Ingredients", href: "/ingredients" },
    { label: ing.name },
  ];

  return (
    <article>
      <JsonLd
        data={graph(
          {
            "@type": "WebPage",
            "@id": `${absoluteUrl(url)}#webpage`,
            name: ing.name,
            description: ing.summary,
            url: absoluteUrl(url),
            about: {
              "@type": "DefinedTerm",
              name: ing.name,
              alternateName: ing.inci,
              description: ing.summary,
            },
            mentions: usedIn.map((p) => ({
              "@id": `${absoluteUrl(`/products/${p.slug}`)}#product`,
            })),
          },
          breadcrumbSchema(
            crumbs.map((c, i) => (i === 2 ? { ...c, href: url } : c)),
          ),
        )}
      />
      <div className="container-page pt-6 pb-20 md:pt-10">
        <Breadcrumbs items={crumbs} />
        <header className="mx-auto mt-10 max-w-3xl text-center lg:mx-0 lg:text-left">
          <p className="eyebrow">Ingredient · INCI: {ing.inci}</p>
          <h1 className="mt-5 font-serif text-display font-light">
            {ing.name}
          </h1>
          <p className="mt-6 text-body-lg">{ing.summary}</p>
        </header>

        <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
          <div className="prose-belurae">
            <h2>What it is</h2>
            {ing.whatItIs.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h2>Why it&apos;s used</h2>
            {ing.whyUsed.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h2>Good to know</h2>
            <ul>
              {ing.goodToKnow.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <aside className="space-y-8 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            {usedIn.length > 0 && (
              <div>
                <p className="eyebrow">Listed as a key ingredient in</p>
                <ul className="mt-3 space-y-2">
                  {usedIn.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/products/${p.slug}#ingredients`}
                        className="block rounded-card bg-porcelain p-5 shadow-soft transition-shadow hover:shadow-float"
                      >
                        <span className="block font-medium">{p.name}</span>
                        <span className="text-body-sm text-ink-soft">
                          {p.format}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <p className="eyebrow">Also read</p>
              <Link
                href="/guides/how-to-patch-test"
                className="link-underline mt-3 inline-block"
              >
                How to patch test a new product
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
