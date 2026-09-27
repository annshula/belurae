import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ComparisonTable } from "@/components/content/ComparisonTable";
import { Faq } from "@/components/content/Faq";
import { SectionHeading } from "@/components/content/SectionHeading";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Icon } from "@/components/ui/Icon";
import { guides } from "@/content/guides";
import { products as productContent } from "@/content/products";
import { getProductBySlug, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { getProductReviews } from "@/lib/judgeme/reviews";
import { productSchema } from "@/lib/seo/product-schema";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/schema";
import { site } from "@/lib/site";

/**
 * PDP — ISR. Static HTML from the cached catalog; the products/* webhook
 * purges the `catalog` tag so price/availability changes land within seconds.
 * Only the purchase controls and video tiles hydrate.
 */
export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return productContent.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const { content, record } = product;
  const image = record.media.find((m) => m.type === "image");
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `/products/${content.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${content.slug}`,
      title: `${content.name} · ${site.name}`,
      description: content.seo.description,
      images: image && image.type === "image" ? [{ url: `${image.url.split("?")[0]}?width=1200`, alt: content.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { content, record } = product;
  const [currency, reviews] = await Promise.all([storeCurrency(), getProductReviews(record.handle)]);
  const view = buildProductView(record, content, currency);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: content.category.name, href: `/collections/${content.category.slug}` },
    { label: content.name },
  ];
  const relatedGuides = guides.filter((g) => g.products.includes(content.slug)).slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          productSchema(view, content, reviews?.summary ?? null),
          breadcrumbSchema(crumbs.map((c, i) => (i === crumbs.length - 1 ? { label: c.label, href: view.href } : c))),
          faqSchema(content.faqs),
        )}
      />

      {/* ── Above the fold ─────────────────────────────────────────────── */}
      <div className="container-page pt-6 pb-16 md:pt-8 lg:pb-28">
        <Breadcrumbs items={crumbs} className="mb-5 md:mb-8" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="-mx-(--gutter) md:mx-0">
            <ProductGallery media={view.gallery} productName={content.name} />
          </div>

          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
            <p className="eyebrow eyebrow-dot">{content.category.name}</p>
            <h1 className="mt-4 font-serif text-display font-light">{content.name}</h1>
            <p className="mt-2 text-body-sm text-ink-soft">{content.format}</p>
            <p className="mt-6 text-body-lg text-ink-soft">{content.benefitLine}</p>

            <div className="mt-8">
              <PurchasePanel view={view} />
            </div>

            <ul className="mt-8 space-y-3.5 rounded-card bg-cream/80 p-5 text-body-sm md:p-6">
              <li className="flex gap-3">
                <Icon name="truck" className="size-5 shrink-0" />
                <span>
                  Tracked delivery in {site.delivery.minDays}–{site.delivery.maxDays} days.{" "}
                  <Link href="/pages/shipping" className="link-underline">
                    Shipping details
                  </Link>
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="shield" className="size-5 shrink-0" />
                <span>Secure checkout by Shopify.</span>
              </li>
              <li className="flex gap-3">
                <Icon name="refresh" className="size-5 shrink-0" />
                <span>
                  Damaged, defective or wrong item? We&apos;ll put it right.{" "}
                  <Link href="/pages/refund-policy" className="link-underline">
                    Refund policy
                  </Link>
                </span>
              </li>
              <li className="flex gap-3">
                <Icon name="leaf" className="size-5 shrink-0" />
                <span>
                  <a href="#ingredients" className="link-underline">
                    Key ingredients
                  </a>{" "}
                  and{" "}
                  <a href="#safety" className="link-underline">
                    safety guidance
                  </a>{" "}
                  below.
                </span>
              </li>
            </ul>

            <aside className="well-clay mt-3 flex gap-3 rounded-card p-5 text-body-sm" aria-label="Patch test">
              <Icon name="info" className="mt-0.5 size-5 shrink-0 text-clay-600" />
              <p>
                <strong className="font-semibold">Patch test 24 hours before first use.</strong> Not for the face or
                genitals.{" "}
                <a href="#safety" className="link-underline">
                  Where to use it
                </a>
              </p>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Story ─────────────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="story">
        <div className="section-y rounded-media bg-cream">
        <div className="container-page grid gap-10 lg:grid-cols-2 lg:gap-20">
          <SectionHeading eyebrow="The idea" title={content.story.heading} id="story" />
          <div className="space-y-5 text-body-lg text-ink-soft lg:pt-10">
            {content.story.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        <div className="container-page mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {content.highlights.map((h, i) => (
            <div key={h.title} className="flex min-h-56 flex-col rounded-media bg-porcelain p-7 shadow-soft lg:p-8">
              <span className="font-serif text-heading-2 text-clay-300 tabular-nums" aria-hidden="true">0{i + 1}</span>
              <h3 className="mt-auto pt-8 font-serif text-heading-2">{h.title}</h3>
              <p className="mt-3 text-body-sm text-ink-soft">{h.body}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── How to use ────────────────────────────────────────────────── */}
      <section className="section-y" aria-labelledby="how-to-use">
        <div className="container-page">
          <SectionHeading
            eyebrow="How to use"
            title="Six unhurried steps."
            id="how-to-use"
            intro={
              <>
                The short version: patch test, spray, wait 5–10 minutes, wipe, rinse, rest.{" "}
                <Link href="/guides/how-to-use-hair-removal-mousse" className="link-underline text-ink">
                  Read the full guide
                </Link>
                .
              </>
            }
          />
          <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.steps.map((step, i) => (
              <li key={step.title} className="rounded-media bg-porcelain p-7 shadow-soft lg:p-8">
                <p className="grid size-12 place-items-center rounded-[14px] bg-clay-50 font-serif text-heading-3 text-clay-600 tabular-nums" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-8 font-serif text-heading-2">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Ingredients ───────────────────────────────────────────────── */}
      <section id="ingredients" className="px-2 sm:px-3" aria-labelledby="ingredients-title">
        <div className="well-sage section-y rounded-media">
        <div className="container-page grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Care, clearly"
              title="What's inside."
              id="ingredients-title"
              intro="The key ingredients the manufacturer lists for this formula, and why formulators use them."
            />
            <div className="glass mt-10 rounded-card p-6 text-body-sm">
              <p className="font-medium">Full ingredient list</p>
              <p className="mt-2 text-ink-soft">
                We&apos;re waiting on the complete INCI list — including the hair-removing active ingredient — from the
                manufacturer, and will publish it here in full. Until then, check the pack or{" "}
                <a href={`mailto:${site.supportEmail}?subject=Ingredient%20question`} className="link-underline text-ink">
                  ask us
                </a>
                .
              </p>
            </div>
          </div>
          <dl className="flex flex-col gap-2.5">
            {content.keyIngredients.map((ing) => (
              <div key={ing.slug} className="grid gap-2 rounded-card bg-porcelain/90 p-5 shadow-soft sm:grid-cols-[210px_1fr] sm:gap-8 sm:p-6">
                <dt className="font-serif text-heading-3">
                  <Link href={`/ingredients/${ing.slug}`} className="link-underline">
                    {ing.name}
                  </Link>
                </dt>
                <dd className="text-ink-soft">{ing.role}</dd>
              </div>
            ))}
          </dl>
        </div>
        </div>
      </section>

      {/* ── Safety ────────────────────────────────────────────────────── */}
      <section id="safety" className="section-y" aria-labelledby="safety-title">
        <div className="container-page">
          <SectionHeading eyebrow="Before you start" title="Where to use it — and where not to." id="safety-title" intro={content.safety.note} />
          <div className="mt-14 grid gap-3 lg:grid-cols-3">
            <div className="well-clay rounded-media p-7 lg:p-9">
              <h3 className="font-serif text-heading-2">Patch test first</h3>
              <p className="mt-3 text-ink-soft">{content.safety.patchTest}</p>
              <Link href="/guides/how-to-patch-test" className="btn-quiet mt-4">
                How to patch test
              </Link>
            </div>
            <div className="rounded-media bg-porcelain p-7 shadow-soft lg:p-9">
              <h3 className="flex items-center gap-3 font-serif text-heading-2">
                <span className="grid size-9 place-items-center rounded-[10px] bg-sage-50"><Icon name="check" className="size-4 text-success" /></span> Use on
              </h3>
              <ul className="mt-6 space-y-3 text-ink-soft">
                {content.safety.use.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-media bg-porcelain p-7 shadow-soft lg:p-9">
              <h3 className="flex items-center gap-3 font-serif text-heading-2">
                <span className="grid size-9 place-items-center rounded-[10px] bg-clay-50"><Icon name="close" className="size-4 text-error" /></span> Don&apos;t use on
              </h3>
              <ul className="mt-6 space-y-3 text-ink-soft">
                {content.safety.avoid.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex gap-4 rounded-card bg-porcelain p-6 shadow-soft">
            <Icon name="alert" className="mt-0.5 size-5 shrink-0 text-warning" />
            <p>
              <strong className="font-semibold">If it stings or burns: </strong>
              {content.safety.ifIrritation}
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison + details ──────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="compare">
        <div className="section-y rounded-media bg-cream">
        <div className="container-page">
          <SectionHeading
            eyebrow="Compare"
            title="Mousse, razor or wax?"
            id="compare"
            intro="How they differ in practice — no method is right for everyone."
          />
          <div className="mt-16">
            <ComparisonTable />
          </div>
        </div>
        </div>
      </section>

      <section className="section-y" aria-labelledby="details">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 id="details" className="font-serif text-display font-light">
              The details
            </h2>
            <h3 className="mt-10 eyebrow">Specifications</h3>
            <dl className="mt-5 overflow-hidden rounded-card bg-porcelain text-body-sm shadow-soft">
              {content.specs.map((s) => (
                <div key={s.label} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-4 even:bg-cream/60">
                  <dt className="text-ink-soft">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="eyebrow lg:mt-[5.6rem]">What&apos;s in the box</h3>
            <ul className="mt-5 overflow-hidden rounded-card bg-porcelain text-body-sm shadow-soft">
              {content.inTheBox.map((b) => (
                <li key={b.item} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-4 even:bg-cream/60">
                  <span>{b.item}</span>
                  <span className="text-ink-soft">{b.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────── */}
      <section className="pb-[var(--section-y)]" aria-labelledby="reviews">
        <div className="container-page">
          <h2 id="reviews" className="mb-10 font-serif text-display font-light">
            Reviews
          </h2>
          <ReviewsSection data={reviews} />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="faq">
        <div className="section-y rounded-media bg-cream">
        <div className="container-page grid gap-10 lg:grid-cols-[4fr_8fr] lg:gap-20">
          <SectionHeading
            eyebrow="Questions"
            title="Before you buy."
            id="faq"
            intro={
              <>
                Didn&apos;t find your answer?{" "}
                <a href={`mailto:${site.supportEmail}`} className="link-underline text-ink">
                  {site.supportEmail}
                </a>
              </>
            }
          />
          <Faq items={content.faqs} />
        </div>
        </div>
      </section>

      {/* ── Learn more ────────────────────────────────────────────────── */}
      {relatedGuides.length > 0 && (
        <section className="section-y" aria-labelledby="learn">
          <div className="container-page">
            <SectionHeading eyebrow="Your routine" title="Before and after." id="learn" />
            <ul className="mt-12 grid gap-3 sm:grid-cols-3">
              {relatedGuides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="group block h-full rounded-media bg-porcelain p-7 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-float lg:p-8">
                    <p className="eyebrow">{g.topic}</p>
                    <h3 className="mt-8 font-serif text-heading-2">{g.title}</h3>
                    <p className="mt-3 text-body-sm text-ink-soft">{g.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
