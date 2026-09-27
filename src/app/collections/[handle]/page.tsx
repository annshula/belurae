import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Faq } from "@/components/content/Faq";
import { ProductCard } from "@/components/product/ProductCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero } from "@/components/content/PageHero";
import { type Crumb } from "@/components/ui/Breadcrumbs";
import { collectionBySlug, collections } from "@/content/collections";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";

/** Collections — ISR, refreshed with the catalog tag. LCP: first product image. */
export const revalidate = 3600;

type Props = { params: Promise<{ handle: string }> };

export function generateStaticParams() {
  return collections.map((c) => ({ handle: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const c = collectionBySlug(handle);
  if (!c) return {};
  return {
    title: c.seoTitle,
    description: c.description,
    alternates: { canonical: `/collections/${c.slug}` },
    openGraph: { url: `/collections/${c.slug}`, title: c.seoTitle, description: c.description },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { handle } = await params;
  const collection = collectionBySlug(handle);
  if (!collection) notFound();

  const [all, currency] = await Promise.all([getProducts(), storeCurrency()]);
  const items = all
    .filter((p) => collection.categories === "*" || collection.categories.includes(p.content.category.slug))
    .map((p) => buildProductView(p.record, p.content, currency));

  const url = `/collections/${collection.slug}`;
  const crumbs: Crumb[] =
    collection.slug === "all"
      ? [{ label: "Home", href: "/" }, { label: "Shop" }]
      : [{ label: "Home", href: "/" }, { label: "Shop", href: "/collections/all" }, { label: collection.title }];

  return (
    <>
      <JsonLd
        data={graph(
          {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl(url)}#collection`,
            name: collection.title,
            description: collection.description,
            url: absoluteUrl(url),
            mainEntity: {
              "@type": "ItemList",
              itemListElement: items.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: absoluteUrl(p.href),
                name: p.name,
              })),
            },
          },
          breadcrumbSchema(crumbs.map((c, i) => (i === crumbs.length - 1 ? { ...c, href: url } : c))),
          ...(collection.faqs ? [faqSchema(collection.faqs)] : []),
        )}
      />

      <PageHero
        compact
        crumbs={crumbs}
        title={collection.title}
        intro={`${items.length} product${items.length === 1 ? "" : "s"}`}
      />

      <div className="container-page pt-8 md:pt-10">
        {items.length > 0 ? (
          <ul className="grid gap-x-5 gap-y-14 pb-14 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <li key={p.handle}>
                <ProductCard product={p} priority={i === 0} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="pb-16 text-ink-soft">New products are on their way. In the meantime, browse our guides.</p>
        )}
        <p className="max-w-[62ch] pb-16 text-body-sm text-ink-soft">{collection.intro}</p>
      </div>

      {collection.education && (
        <section className="px-2 sm:px-3" aria-labelledby="edu">
          <div className="section-y rounded-media bg-cream">
          <div className="container-page grid gap-10 lg:grid-cols-[5fr_7fr] lg:gap-20">
            <h2 id="edu" className="font-serif text-display font-light">
              {collection.education.heading}
            </h2>
            <div className="space-y-5 text-body-lg text-ink-soft">
              {collection.education.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
          </div>
        </section>
      )}

      {collection.faqs && (
        <section className="section-y" aria-labelledby="c-faq">
          <div className="container-page grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-20">
            <h2 id="c-faq" className="font-serif text-display font-light">
              Questions
            </h2>
            <Faq items={collection.faqs} />
          </div>
        </section>
      )}

      <section className="pb-16" aria-labelledby="related">
        <div className="container-page flex flex-wrap items-center gap-3 rounded-media bg-cream/70 p-6 md:p-8">
          <h2 id="related" className="eyebrow mr-4">
            Keep reading
          </h2>
          {collection.related.map((r) => (
            <Link key={r.href} href={r.href} className="rounded-[12px] bg-porcelain px-4 py-2.5 text-body-sm shadow-soft transition-shadow hover:shadow-float">
              {r.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
