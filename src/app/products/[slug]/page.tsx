import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ComparisonTable } from "@/components/content/ComparisonTable";
import { Faq } from "@/components/content/Faq";
import { SectionHeading } from "@/components/content/SectionHeading";
import { ProductAccordion } from "@/components/product/ProductAccordion";
import { SaleCountdown } from "@/components/product/SaleCountdown";
import { EditorialBands } from "@/components/product/EditorialBands";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchaseFeedback } from "@/components/product/PurchaseFeedback";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import {
  ProductVideoShowcase,
  type ShowcaseVideo,
} from "@/components/product/ProductVideoShowcase";
import { ReviewsSection } from "@/components/product/ReviewsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ingredientIcon } from "@/content/ingredients";
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
import {
  breadcrumbSchema,
  faqSchema,
  graph,
  howToSchema,
} from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Local clips for the "See it in action" showcase — served from `public/videos`,
 * not Shopify media, so they're independent of the catalog sync. Add more here
 * as they're recorded; no poster is supplied, so each autoplays into its own
 * first frame.
 */
const productVideos: ShowcaseVideo[] = [
  ...[1, 2, 3, 4, 5, 6].map((n) => ({
    src: `/videos/hair-removal/hair-removal-${n}.mp4`,
    alt: `Belurae hair removal video ${n}`,
    // Mobile leads with the 2nd clip; desktop keeps the numbered order.
    mobileFirst: n === 2,
  })),
  { src: "/videos/product-1.mp4", alt: "Belurae product video 1" },
  { src: "/videos/product-2.mp4", alt: "Belurae product video 2" },
  { src: "/videos/product-3.mp4", alt: "Belurae product video 3" },
  { src: "/videos/product-4.mp4", alt: "Belurae product video 4" },
  { src: "/videos/product-5.mp4", alt: "Belurae product video 5" },
  { src: "/videos/product-6.mp4", alt: "Belurae product video 6" },
  { src: "/videos/product-7.mp4", alt: "Belurae product video 7" },
  { src: "/videos/product-8.mp4", alt: "Belurae product video 8" },
];

/** Toner clips — served from `public/videos/toner` (compressed from `toner_video/`). */
const tonerVideos: ShowcaseVideo[] = [
  {
    src: "/videos/toner/toner-new-3.mp4",
    alt: "Belurae EGF Tox toner video 1",
  },
  ...[1, 2, 3, 4, 5].map((n) => ({
    src: `/videos/toner/toner-${n}.mp4`,
    alt: `Belurae EGF Tox toner video ${n + 1}`,
  })),
];

/** Per-product clip sets; products without an entry use the mousse clips. */
const productVideosBySlug: Record<string, ShowcaseVideo[]> = {
  "egf-tox-toner": tonerVideos,
};

/**
 * Keyword → icon for the perk list, checked in order against each perk's
 * text (case-insensitive) — first match wins. Perks come from the live
 * Shopify sync (`catalog.json`), so this can't be a fixed per-index mapping;
 * a perk that matches nothing falls back to the plain checkmark.
 */
const PERK_ICON_RULES: [pattern: RegExp, icon: IconName][] = [
  [/hydrat|moistur/i, "droplet"],
  [/sensitive/i, "heart"],
  [/remov.*hair|stubborn hair/i, "scissors"],
  [/ingrown/i, "shield"],
  [/fine lines/i, "feather"],
  [/plump|radiant|supple/i, "star"],
  [/routine|morning/i, "clock"],
  [/long.?lasting|smooth/i, "clock"],
  [/chemical|clean formula/i, "leaf"],
  [/hypoallergenic/i, "shield"],
  [/men and women|all skin types|unisex/i, "users"],
  [/scent|fragrance|citrus|floral/i, "flower"],
  [
    /aloe|glycerin|hyaluronic|extract|oil|botanical|egf|collagen|niacinamide/i,
    "leaf",
  ],
];

function perkIcon(perk: string): IconName {
  return (
    PERK_ICON_RULES.find(([pattern]) => pattern.test(perk))?.[1] ?? "check"
  );
}

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

  /*
   * The buy-box carousel shows the head of the same feed, sliced here so five
   * reviews cross the RSC boundary instead of all 524 of the placeholder set.
   */
  const feedbackReviews = (
    verifiedReviews ?? demoReviewsFor(record.handle)
  )?.reviews.slice(0, 5);

  const perks = view.perks.map((text) => ({ icon: perkIcon(text), text }));

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

  /* Per-product theme: re-points the colour tokens (primary ramp + warm
     neutrals) document-wide while this page is mounted, so the body
     background, header and footer follow. Values are static strings from
     content/products.ts. */
  const { theme } = content.pdp;
  const themeCss = theme
    ? `:root:root{${[
        ...Object.entries(theme.primary).map(
          ([step, hex]) => `--color-sage-${step}:${hex}`,
        ),
        ...Object.entries(theme.accent).map(
          ([step, hex]) => `--color-clay-${step}:${hex}`,
        ),
        ...Object.entries(theme.surface).map(
          ([name, hex]) => `--color-${name}:${hex}`,
        ),
      ].join(";")}}`
    : null;

  return (
    <>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <JsonLd
        data={graph(
          productSchema(view, content, verifiedReviews?.summary ?? null),
          breadcrumbSchema(
            crumbs.map((c, i) =>
              i === crumbs.length - 1 ? { label: c.label, href: view.href } : c,
            ),
          ),
          faqSchema(content.faqs),
          howToSchema(
            `How to use ${view.name}`,
            content.steps.map((step) => ({
              name: step.title,
              text: step.body,
            })),
          ),
        )}
      />

      {/* ── Offer countdown: a real, merchant-set deadline, shown first ── */}
      {view.saleEndsAt && <SaleCountdown endsAt={view.saleEndsAt} />}

      {/* ── Above the fold ─────────────────────────────────────────────── */}
      <div className="container-page pt-6 pb-10 md:pt-8 lg:pb-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <ProductGallery
            media={view.gallery}
            productName={view.name}
            fit={content.pdp.galleryFit}
          />

          <div className="min-w-0 lg:pt-4">
            {content.pdp.trust && (
              <ul className="mb-4 flex flex-wrap gap-2 font-ui sm:flex-nowrap sm:gap-1.5">
                {content.pdp.trust.map((t) => (
                  <li
                    key={t.text}
                    className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1.5 text-[0.78rem] leading-none font-medium whitespace-nowrap text-sage-800 sm:px-2.5 sm:text-[0.72rem]"
                  >
                    <Icon
                      name={t.icon}
                      className="size-4 shrink-0 sm:size-3.5"
                    />
                    <span className="truncate">{t.text}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Rating line as plain text (no chips). The rating jumps to the
                reviews. */}
            {(() => {
              const hasRating = Boolean(ratingLine && ratingLine.count > 0);
              if (!hasRating) return null;
              return (
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-ui text-body-sm">
                  {ratingLine && ratingLine.count > 0 && (
                    <a
                      href="#reviews"
                      className="group inline-flex items-center gap-1.5"
                      aria-label={`Rated ${ratingLine.average.toFixed(1)} out of 5 from ${ratingLine.count.toLocaleString("en-US")} reviews — jump to the reviews`}
                    >
                      <Stars value={ratingLine.average} />
                      <span className="font-numeral font-semibold tabular-nums">
                        {ratingLine.average.toFixed(1)}
                      </span>
                      <span className="text-ink-soft group-hover:underline">
                        {ratingLine.count.toLocaleString("en-US")} reviews
                      </span>
                    </a>
                  )}
                </p>
              );
            })()}

            <h1 className="mt-3 font-serif text-heading-1 font-medium">
              {view.name}
            </h1>
            {/* <p className="mt-2 text-body-lg text-ink-soft">{content.benefitLine}</p> */}

            {perks.length > 0 && (
              <ul
                className={cn(
                  "mt-5 grid grid-cols-1 gap-x-4 gap-y-2",
                  !content.pdp.perksOneColumn && "sm:grid-cols-2",
                )}
              >
                {perks.map((perk) => (
                  <li
                    key={perk.text}
                    className="flex items-start gap-2.5 text-body-sm"
                  >
                    {/* items-start, not items-center: an icon centred on the
                        whole row drifts down whenever a perk wraps to two
                        lines. It belongs on the first line. */}
                    <span
                      aria-hidden="true"
                      className="mt-px grid size-5.5 shrink-0 place-items-center rounded-full bg-sage-600 text-ivory"
                    >
                      <Icon name={perk.icon} className="size-3" />
                    </span>
                    {perk.text}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8">
              <PurchasePanel view={view} packs={content.pdp.packs} />
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
                  {content.pdp.notice.lead}
                </strong>{" "}
                {content.pdp.notice.text}{" "}
                <a href="#safety" className="link-underline">
                  Where to use it
                </a>
              </p>
            </aside>

            {/* What customers say — right after the patch-test notice. */}
            {feedbackReviews && feedbackReviews.length > 0 && (
              <PurchaseFeedback reviews={feedbackReviews} className="mt-5" />
            )}
          </div>
        </div>
      </div>

      {/* ── Product videos ────────────────────────────────────────────── */}
      {content.pdp.videosIntro && (
        <section className="py-12 lg:py-16" aria-labelledby="videos">
          <div className="container-page">
            <SectionHeading
              eyebrow="Real use"
              title="See it in action."
              id="videos"
              size="heading"
              align="center"
              titleClassName="font-pdp-heading font-semibold"
              intro={content.pdp.videosIntro}
            />
          </div>
          {/* Full-bleed: the row runs edge to edge of the viewport, past
            container-page's max width, so the marquee has real room to drift. */}
          <ProductVideoShowcase
            videos={productVideosBySlug[content.slug] ?? productVideos}
            className="mt-8 px-2 sm:px-3"
          />
        </section>
      )}

      {/* ── Your daily step + key ingredients (products that define them) ── */}
      <EditorialBands content={content} view={view} />

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
                align="center"
                titleClassName="font-pdp-heading font-semibold"
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
                        className="object-cover"
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
            title={content.pdp.howTo.heading}
            id="how-to-use"
            size="heading"
            align="center"
            titleClassName="font-pdp-heading font-semibold"
            intro={
              <>
                {content.pdp.howTo.intro}
                {content.pdp.howTo.guide && (
                  <>
                    {" "}
                    <Link
                      href={content.pdp.howTo.guide.href}
                      className="link-underline text-ink"
                    >
                      Read the full guide
                    </Link>
                    .
                  </>
                )}
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

      {!content.pdp.dailyStep && (
        <>
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
                    align="center"
                    titleClassName="font-pdp-heading font-semibold"
                    intro="The key ingredients in this formula, in INCI form, and why each one is used."
                  />
                  <div className="glass mt-6 rounded-card p-5 text-body-sm">
                    <p className="font-medium">Every ingredient, named</p>
                    <p className="mt-2 text-ink-soft">
                      {content.pdp.ingredientsNote}{" "}
                      <a
                        href={`mailto:${site.supportEmail}?subject=Ingredient%20question`}
                        className="link-underline text-ink"
                      >
                        Ask us
                      </a>{" "}
                      about any ingredient and we&apos;ll answer.
                    </p>
                  </div>
                </div>
                <dl className="flex flex-col gap-2">
                  {content.keyIngredients.map((ing) => (
                    <div
                      key={ing.slug}
                      className="flex gap-4 rounded-card bg-porcelain/90 p-4 shadow-soft sm:p-5"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sage-100 text-sage-600">
                        <Icon
                          name={ingredientIcon(ing.slug, ing.icon)}
                          className="size-4"
                        />
                      </span>
                      <div>
                        <dt className="font-serif text-heading-3">
                          <Link
                            href={`/ingredients/${ing.slug}`}
                            className="link-underline"
                          >
                            {ing.name}
                          </Link>
                        </dt>
                        <dd className="mt-1 text-ink-soft">{ing.role}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </>
      )}

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
            align="center"
            titleClassName="font-pdp-heading font-semibold"
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
      {content.pdp.showHairRemovalComparison && (
        <section className="px-2 sm:px-3" aria-labelledby="compare">
          <div className="rounded-media bg-cream py-12 lg:py-16">
            <div className="container-page">
              <SectionHeading
                eyebrow="Compare"
                title="Mousse, razor or wax?"
                id="compare"
                size="heading"
                align="center"
                titleClassName="font-pdp-heading font-semibold"
                intro="How they differ in practice — no method is right for everyone."
              />
              <div className="mt-8">
                <ComparisonTable />
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16" aria-labelledby="details">
        <div className="container-page grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2
              id="details"
              className="text-center font-pdp-heading text-heading-1 font-semibold"
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
            className="mb-6 text-center font-pdp-heading text-heading-1 font-semibold"
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
              align="center"
              titleClassName="font-pdp-heading font-semibold"
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
              align="center"
              titleClassName="font-pdp-heading font-semibold"
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
