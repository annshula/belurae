import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ComparisonTable } from "@/components/content/ComparisonTable";
import { Faq } from "@/components/content/Faq";
import { SectionHeading } from "@/components/content/SectionHeading";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { Stars } from "@/components/ui/Stars";
import { guides } from "@/content/guides";
import { demoReviewsFor } from "@/data/reviews";
import {
  products as productContent,
  productContentByLegacySlug,
} from "@/content/products";
import { getProductBySlug, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { getProductReviews } from "@/lib/judgeme/reviews";
import { productSchema } from "@/lib/seo/product-schema";
import { breadcrumbSchema, faqSchema, graph } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

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
  const name = record.title;
  const image = record.media.find((m) => m.type === "image");
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `/products/${content.slug}` },
    openGraph: {
      type: "website",
      url: `/products/${content.slug}`,
      title: `${name} · ${site.name}`,
      description: content.seo.description,
      images:
        image && image.type === "image"
          ? [
              {
                url: `${image.url.split("?")[0]}?width=1200`,
                alt: name,
              },
            ]
          : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    const legacy = productContentByLegacySlug(slug);
    if (legacy) permanentRedirect(`/products/${legacy.slug}`);
    notFound();
  }

  const { content, record } = product;
  const [currency, verifiedReviews] = await Promise.all([
    storeCurrency(),
    getProductReviews(record.handle),
  ]);
  const view = buildProductView(record, content, currency);

  /*
   * Two review sources, deliberately kept apart:
   *  - `verifiedReviews` — Judge.me, verified buyers only. The only source
   *    allowed anywhere near structured data.
   *  - `ratingLine` — what the page shows. Falls back to the placeholder set in
   *    data/reviews.ts (see its doc comment) while Judge.me has nothing, which
   *    is why the schema above is given `verifiedReviews` and never this.
   */
  const ratingLine =
    verifiedReviews?.summary ?? demoReviewsFor(record.handle)?.summary ?? null;

  const crumbs = [
    { label: "Home", href: "/" },
    {
      label: content.category.name,
      href: `/collections/${content.category.slug}`,
    },
    { label: view.name },
  ];
  const relatedGuides = guides
    .filter((g) => g.products.includes(content.slug))
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={graph(
          productSchema(view, content, verifiedReviews?.summary ?? null),
          breadcrumbSchema(
            crumbs.map((c, i) =>
              i === crumbs.length - 1 ? { label: c.label, href: view.href } : c,
            ),
          ),
          faqSchema(content.faqs),
        )}
      />

      {/* ── Above the fold ─────────────────────────────────────────────── */}
      <div className="container-page pt-6 pb-10 md:pt-8 lg:pb-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <ProductGallery media={view.gallery} productName={view.name} />

          <div className="lg:pt-4">
            {ratingLine && ratingLine.count > 0 && (
              /* The rating replaces the old category eyebrow: it is the number
                 shoppers look for first, so it gets its own white chip, and it
                 jumps to the reviews below. */
              <a
                href="#reviews"
                className="group inline-flex items-center gap-2 rounded-pill bg-paper py-2 pr-3.5 pl-3 font-ui text-body-sm shadow-soft transition-shadow duration-300 hover:shadow-float"
                aria-label={`Rated ${ratingLine.average.toFixed(1)} out of 5 from ${ratingLine.count.toLocaleString("en-US")} reviews — jump to the reviews`}
              >
                <Stars value={ratingLine.average} />
                <span className="font-numeral font-semibold tabular-nums">
                  {ratingLine.average.toFixed(1)}
                </span>
                <span className="text-ink-soft">
                  {ratingLine.count.toLocaleString("en-US")} reviews
                </span>
                <Icon
                  name="chevron-down"
                  className="size-3.5 text-ink-faint transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </a>
            )}

            <h1 className="mt-4 font-title text-heading-1 font-medium">
              {view.name}
            </h1>
            {/* <p className="mt-2 text-body-lg text-ink-soft">{content.benefitLine}</p> */}

            {view.perks.length > 0 && (
              <ul className="mt-5 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                {view.perks.map((perk) => (
                  <li
                    key={perk}
                    className="flex items-start gap-2.5 text-body-sm"
                  >
                    {/* items-start, not items-center: a tick centred on the
                        whole row drifts down whenever a perk wraps to two
                        lines. It belongs on the first line. */}
                    <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-sage-600">
                      <Icon name="check" className="size-3 text-ivory" />
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <PurchasePanel view={view} />
            </div>

            <ProductAccordion
              items={[
                {
                  title: "How to use",
                  body: (
                    <ol className="flex flex-col gap-2">
                      {content.steps.map((step) => (
                        <li key={step.title}>
                          <strong className="font-medium text-ink">
                            {step.title}.
                          </strong>{" "}
                          {step.body}
                        </li>
                      ))}
                    </ol>
                  ),
                },
                {
                  title: "Ingredients",
                  body: (
                    <ul className="flex flex-col gap-1.5">
                      {content.keyIngredients.map((ing) => (
                        <li key={ing.slug}>
                          <strong className="font-medium text-ink">
                            {ing.name}:
                          </strong>{" "}
                          {ing.role}
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Safety",
                  body: (
                    <>
                      <p>{content.safety.patchTest}</p>
                      <p className="mt-2">{content.safety.ifIrritation}</p>
                    </>
                  ),
                },
              ]}
            />

            <ul className="mt-6 space-y-3.5 rounded-card bg-cream/80 p-5 text-body-sm md:p-6">
              <li className="flex gap-3">
                <Icon name="truck" className="size-5 shrink-0" />
                <span>
                  Tracked delivery in {site.delivery.minDays}–
                  {site.delivery.maxDays} days.{" "}
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
            </ul>

            <aside
              className="mt-3 flex gap-3 rounded-card bg-clay-100 p-5 text-body-sm"
              aria-label="Patch test"
            >
              <Icon
                name="info"
                className="mt-0.5 size-5 shrink-0 text-clay-600"
              />
              <p>
                <strong className="font-semibold">
                  Patch test 24 hours before first use.
                </strong>{" "}
                Not for the face or genitals.{" "}
                <a href="#safety" className="link-underline">
                  Where to use it
                </a>
              </p>
            </aside>
          </div>
        </div>
      </div>

      {/* ── Feature highlights (from Shopify, alternating image layout) ── */}
      {view.featureHighlights.length > 0 && (
        <section className="px-2 sm:px-3" aria-labelledby="highlights">
          <div className="rounded-media bg-cream py-12 lg:py-16">
            <div className="container-page">
              <SectionHeading
                eyebrow="The details"
                title="What's inside."
                id="highlights"
                size="heading"
              />
            </div>
            <div className="container-page mt-8 flex flex-col gap-8 lg:gap-12">
              {view.featureHighlights.map((h, i) => (
                <div
                  key={h.label}
                  className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12"
                >
                  <div className={cn(i % 2 === 0 && "lg:order-2")}>
                    <p className="font-serif text-heading-2 font-light">
                      {h.label}
                    </p>
                    <p className="mt-2 text-body-sm text-ink-soft">{h.body}</p>
                  </div>
                  {h.image && (
                    <div
                      className={cn(
                        "relative aspect-4/3 overflow-hidden rounded-media",
                        i % 2 === 0 && "lg:order-1",
                      )}
                    >
                      <Image
                        src={h.image}
                        alt={h.label}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── How to use ────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16" aria-labelledby="how-to-use">
        <div className="container-page">
          <SectionHeading
            eyebrow="How to use"
            title="Six unhurried steps."
            id="how-to-use"
            size="heading"
            intro={
              <>
                The short version: patch test, spray, wait 5–10 minutes, wipe,
                rinse, rest.{" "}
                <Link
                  href="/guides/how-to-use-hair-removal-mousse"
                  className="link-underline text-ink"
                >
                  Read the full guide
                </Link>
                .
              </>
            }
          />
          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.steps.map((step, i) => (
              <li
                key={step.title}
                className="rounded-media bg-porcelain p-5 shadow-soft lg:p-6"
              >
                <p
                  className="grid size-10 place-items-center rounded-[12px] bg-clay-50 font-serif text-body-lg text-clay-600 tabular-nums"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-5 font-serif text-heading-3">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="mt-1.5 text-body-sm text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Ingredients ───────────────────────────────────────────────── */}
      <section
        id="ingredients"
        className="px-2 sm:px-3"
        aria-labelledby="ingredients-title"
      >
        <div className="rounded-media bg-sage-100 py-12 lg:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Care, clearly"
                title="What's inside."
                id="ingredients-title"
                size="heading"
                intro="The key ingredients the manufacturer lists for this formula, and why formulators use them."
              />
              <div className="glass mt-6 rounded-card p-5 text-body-sm">
                <p className="font-medium">Full ingredient list</p>
                <p className="mt-2 text-ink-soft">
                  We&apos;re waiting on the complete INCI list — including the
                  hair-removing active ingredient — from the manufacturer, and
                  will publish it here in full. Until then, check the pack or{" "}
                  <a
                    href={`mailto:${site.supportEmail}?subject=Ingredient%20question`}
                    className="link-underline text-ink"
                  >
                    ask us
                  </a>
                  .
                </p>
              </div>
            </div>
            <dl className="flex flex-col gap-2">
              {content.keyIngredients.map((ing) => (
                <div
                  key={ing.slug}
                  className="grid gap-1.5 rounded-card bg-porcelain/90 p-4 shadow-soft sm:grid-cols-[210px_1fr] sm:gap-6 sm:p-5"
                >
                  <dt className="font-serif text-heading-3">
                    <Link
                      href={`/ingredients/${ing.slug}`}
                      className="link-underline"
                    >
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
      <section
        id="safety"
        className="py-12 lg:py-16"
        aria-labelledby="safety-title"
      >
        <div className="container-page">
          <SectionHeading
            eyebrow="Before you start"
            title="Where to use it — and where not to."
            id="safety-title"
            size="heading"
            intro={content.safety.note}
          />
          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            <div className="rounded-media bg-clay-100 p-6 lg:p-7">
              <h3 className="font-serif text-heading-3">Patch test first</h3>
              <p className="mt-2 text-body-sm text-ink-soft">
                {content.safety.patchTest}
              </p>
              <Link href="/guides/how-to-patch-test" className="btn-quiet mt-3">
                How to patch test
              </Link>
            </div>
            <div className="rounded-media bg-porcelain p-6 shadow-soft lg:p-7">
              <h3 className="flex items-center gap-3 font-serif text-heading-3">
                <span className="grid size-8 place-items-center rounded-tag bg-sage-50">
                  <Icon name="check" className="size-4 text-success" />
                </span>{" "}
                Use on
              </h3>
              <ul className="mt-4 space-y-2 text-body-sm text-ink-soft">
                {content.safety.use.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-media bg-porcelain p-6 shadow-soft lg:p-7">
              <h3 className="flex items-center gap-3 font-serif text-heading-3">
                <span className="grid size-8 place-items-center rounded-tag bg-clay-50">
                  <Icon name="close" className="size-4 text-error" />
                </span>{" "}
                Don&apos;t use on
              </h3>
              <ul className="mt-4 space-y-2 text-body-sm text-ink-soft">
                {content.safety.avoid.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-3 flex gap-4 rounded-card bg-porcelain p-5 shadow-soft">
            <Icon
              name="alert"
              className="mt-0.5 size-5 shrink-0 text-warning"
            />
            <p className="text-body-sm">
              <strong className="font-semibold">If it stings or burns: </strong>
              {content.safety.ifIrritation}
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparison + details ──────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="compare">
        <div className="rounded-media bg-cream py-12 lg:py-16">
          <div className="container-page">
            <SectionHeading
              eyebrow="Compare"
              title="Mousse, razor or wax?"
              id="compare"
              size="heading"
              intro="How they differ in practice — no method is right for everyone."
            />
            <div className="mt-8">
              <ComparisonTable />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-16" aria-labelledby="details">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2
              id="details"
              className="text-center font-serif text-heading-1 font-light lg:text-left"
            >
              Specifications
            </h2>
            <dl className="mt-5 overflow-hidden rounded-card bg-porcelain text-body-sm shadow-soft">
              {view.specs.map((s) => (
                <div
                  key={s.label}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3 even:bg-cream/60"
                >
                  <dt className="text-ink-soft">{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="eyebrow flex justify-center lg:mt-[3.6rem] lg:justify-start">
              What&apos;s in the box
            </h3>
            <ul className="mt-5 overflow-hidden rounded-card bg-porcelain text-body-sm shadow-soft">
              {content.inTheBox.map((b) => (
                <li
                  key={b.item}
                  className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-5 py-3 even:bg-cream/60"
                >
                  <span>{b.item}</span>
                  <span className="text-ink-soft">{b.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Reviews ───────────────────────────────────────────────────── */}
      <section className="pb-12 lg:pb-16" aria-labelledby="reviews">
        <div className="container-page">
          <h2
            id="reviews"
            className="mb-6 text-center font-serif text-heading-1 font-light lg:text-left"
          >
            Reviews
          </h2>
          <ReviewsSection data={verifiedReviews} handle={view.handle} />
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="faq">
        <div className="rounded-media bg-cream py-12 lg:py-16">
          <div className="container-page grid gap-8 lg:grid-cols-[4fr_8fr] lg:gap-16">
            <SectionHeading
              eyebrow="Questions"
              title="Before you buy."
              id="faq"
              size="heading"
              intro={
                <>
                  Didn&apos;t find your answer?{" "}
                  <a
                    href={`mailto:${site.supportEmail}`}
                    className="link-underline text-ink"
                  >
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
        <section className="py-12 lg:py-16" aria-labelledby="learn">
          <div className="container-page">
            <SectionHeading
              eyebrow="Your routine"
              title="Before and after."
              id="learn"
              size="heading"
            />
            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {relatedGuides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group block h-full rounded-media bg-porcelain p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-float lg:p-7"
                  >
                    <p className="eyebrow">{g.topic}</p>
                    <h3 className="mt-5 font-serif text-heading-3">
                      {g.title}
                    </h3>
                    <p className="mt-2 text-body-sm text-ink-soft">
                      {g.description}
                    </p>
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
