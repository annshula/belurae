import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Faq } from "@/components/content/Faq";
import { NewsletterForm } from "@/components/content/NewsletterForm";
import { SectionHeading } from "@/components/content/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductCard } from "@/components/product/ProductCard";
import { Icon } from "@/components/ui/Icon";
import { guides } from "@/content/guides";
import { ingredientIcon } from "@/content/ingredients";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { faqSchema, graph } from "@/lib/seo/schema";
import { site } from "@/lib/site";

/**
 * Home — static, refreshed through the `catalog` tag. LCP element: the hero
 * product image (priority, correctly sized, no JS dependency).
 */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `${site.name} — Beauty, Made Simpler` },
  description:
    "Thoughtful personal care for everyday rituals. At-home hair removal with key ingredients, clear directions and honest limitations.",
  alternates: { canonical: "/" },
};

const homeFaqs = [
  {
    q: "What is Belurae?",
    a: "Belurae is a beauty and wellness store built around simpler everyday body-care routines. We start with at-home hair removal and publish the key ingredients, directions and limitations of everything we sell.",
  },
  {
    q: "How does the hair removal mousse work?",
    a: "You spray an even layer on clean, dry skin, leave it on for 5–10 minutes, then wipe it away with the hair using the included scraper and rinse. There's no blade and no pulling.",
  },
  {
    q: "Is it suitable for sensitive skin?",
    a: "The manufacturer labels it hypoallergenic and suitable for sensitive skin, but no product suits everyone. Patch test a small area 24 hours before your first full use.",
  },
  {
    q: "Where can I use it?",
    a: "On the body — legs, arms, underarms, back, chest, face, eyebrows and the bikini line. Not near the eyes, on the genitals or on broken or irritated skin.",
  },
  {
    q: "How long does delivery take?",
    a: `Orders are delivered in ${site.delivery.minDays}–${site.delivery.maxDays} days with tracking.`,
  },
  {
    q: "Can I return it?",
    a: "Personal-care products can't be returned once received unless they arrive damaged, defective or incorrect — in which case contact us and we'll put it right. EU customers also have a 14-day right to cancel.",
  },
];

const pillars = [
  {
    title: "Simple",
    body: "Few steps, plain words, one clear next action. Everyday care shouldn't need a manual — but when it does, we write one.",
  },
  {
    title: "Clear",
    body: "Key ingredients, exact timings and where not to use a product sit right next to the price. No borrowed reviews, no invented “was” prices.",
  },
  {
    title: "Considered",
    body: "Products chosen to work together as a routine, with guidance for the before and the after — not just the moment of use.",
  },
];

export default async function HomePage() {
  const [products, currency] = await Promise.all([
    getProducts(),
    storeCurrency(),
  ]);
  const views = products.map((p) =>
    buildProductView(p.record, p.content, currency),
  );
  const heroProduct = products[0];
  const heroImage = views[0]?.cardImage;
  const featuredGuides = guides.slice(0, 3);

  return (
    <>
      <JsonLd data={graph(faqSchema(homeFaqs))} />

      {/* ── Hero: the brand, not a product ────────────────────────────
          Pulled up under the transparent header so bar + hero read as one
          surface; fills the viewport below the announcement bar. */}
      <section
        data-home-hero
        className="-mt-[calc(var(--header-h)+0.5rem)] sm:-mt-[calc(var(--header-h)+0.75rem)]"
        aria-labelledby="hero-title"
      >
        <div className="relative flex min-h-svh flex-col overflow-hidden bg-cream lg:h-svh">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -left-32 size-136 rounded-full bg-clay-100/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-48 size-144 rounded-full bg-sage-100/80 blur-3xl"
          />

          <div className="container-page relative grid flex-1 items-center gap-6 pt-[calc(var(--header-h)+1.5rem)] pb-8 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-[calc(var(--header-h)+0.5rem)] lg:pb-8">
            {/* Centred below lg, where the hero stacks (image, then this copy);
                it goes back to a left-aligned column beside the image at lg. */}
            <div className="order-2 text-center lg:order-1 lg:text-left">
              <p className="eyebrow eyebrow-dot">Beauty &amp; Wellness</p>
              <h1
                id="hero-title"
                className="mt-4 font-serif text-display-xl font-light"
              >
                Beauty,
                <br />
                <em className="font-normal text-sage-700">made simpler.</em>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-body-lg text-ink-soft lg:mx-0">
                Belurae is a beauty and wellness house for simpler everyday
                rituals — considered products, clear ingredients and honest
                guidance, one category at a time.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
                <Link href="/collections/all" className="btn-primary">
                  Shop the range
                  <Icon name="arrow-right" className="size-4" />
                </Link>
                <Link href="/pages/philosophy" className="btn-quiet">
                  Discover Belurae
                </Link>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative mx-auto aspect-square w-full max-w-[min(34rem,calc(100svh-var(--header-h)-7rem))] lg:mr-16">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-[14%] bottom-[9%] h-[14%] rounded-[50%] bg-linen/80 blur-2xl"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-[10%] rounded-full bg-porcelain/60 blur-2xl"
                />
                {heroImage && (
                  <Image
                    src={heroImage.url}
                    alt={heroImage.alt}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 1024px) 600px, 90vw"
                    className="object-contain p-4 mix-blend-multiply md:p-6"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop the range ────────────────────────────────────────────
          A real product grid, not a single-product deep dive — scales as
          the catalogue grows past one item. */}
      <section className="section-y" aria-labelledby="shop-range">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-center gap-8 lg:justify-between">
            <SectionHeading
              eyebrow="Shop"
              title={
                <>
                  Considered essentials, <em>one category at a time.</em>
                </>
              }
              id="shop-range"
            />
            <Link href="/collections/all" className="btn-quiet">
              Shop all
            </Link>
          </div>
          {/* One card per row on phones — the packshot is the pitch, so it
              gets the full width; from sm the grid tightens back up. */}
          <ul className="mt-10 grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-y-8 lg:grid-cols-4">
            {views.map((v, i) => (
              <li key={v.handle}>
                <ProductCard
                  product={v}
                  priority={i === 0}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Care, clearly: ingredients ──────────────────────────────── */}
      {heroProduct && (
        <section className="px-2 sm:px-3" aria-labelledby="clearly">
          <div className="section-y rounded-media bg-cream">
            <div className="container-page">
              <SectionHeading
                eyebrow="Care, clearly"
                title={
                  <>
                    Know what you&apos;re putting <em>on your skin.</em>
                  </>
                }
                id="clearly"
                intro="Every product we sell names its key ingredients in INCI form, with a plain explanation of what each one is and why it's in the formula."
              />
              <ul className="mt-14 grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {heroProduct.content.keyIngredients.map((ing) => (
                  <li key={ing.slug}>
                    {/* Flat porcelain card, same surface as the guide cards
                        below — the old alternating sage/clay gradients washed
                        out against this section's cream band. */}
                    <Link
                      href={`/ingredients/${ing.slug}`}
                      className="group flex h-full min-h-72 flex-col rounded-media bg-porcelain p-6 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-float"
                    >
                      <span className="grid size-10 place-items-center rounded-control bg-sage-100 text-sage-600">
                        <Icon
                          name={ingredientIcon(ing.slug, ing.icon)}
                          className="size-4"
                        />
                      </span>
                      {/* Fixed title offset + reserved height so every card's
                          name and copy start on the same line; only the CTA
                          is pinned to the bottom. */}
                      <span className="mt-8 min-h-[2lh] font-serif text-heading-2 lg:min-h-[3lh]">
                        {ing.name}
                      </span>
                      <span className="mt-2 text-body-sm text-ink-soft">
                        {ing.role}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.75rem] font-semibold tracking-[0.12em] uppercase">
                        Learn more{" "}
                        <Icon
                          name="arrow-right"
                          className="size-3.5 transition-transform group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* ── Why Belurae ─────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="why">
        <div className="section-y relative overflow-hidden rounded-media bg-sage-900 text-ivory">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-[-10%] size-160 rounded-full bg-sage-600/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-52 left-[-10%] size-136 rounded-full bg-clay-600/20 blur-3xl"
          />
          <div className="container-page relative">
            {/* Eyebrow + headline centre together on phones — the eyebrow is an
                inline-flex pill, so it follows the wrapper's text alignment.
                The pillar cards below stay left-aligned. */}
            <div className="text-center lg:text-left">
              <p className="eyebrow eyebrow-dot text-sage-200">Why Belurae</p>
              <h2
                id="why"
                className="mx-auto mt-6 max-w-3xl font-serif text-display font-light lg:mx-0"
              >
                Clarity is <em>the luxury.</em>
              </h2>
            </div>
            <div className="mt-16 grid auto-rows-fr gap-3 md:grid-cols-3">
              {pillars.map((p, i) => (
                <div
                  key={p.title}
                  className="rounded-media bg-white/6 p-8 backdrop-blur-sm lg:p-10"
                >
                  <span className="font-serif text-heading-3 text-sage-300 tabular-nums">
                    0{i + 1}
                  </span>
                  <h3 className="mt-6 font-serif text-heading-1 font-light">
                    {p.title}
                  </h3>
                  <p className="mt-4 text-sage-100">{p.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center lg:text-left">
              <Link href="/pages/standards" className="btn-light">
                Read our standards
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guides ──────────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="learn">
        <div className="section-y rounded-media bg-cream">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-center gap-8 lg:justify-between">
              <SectionHeading
                eyebrow="Learn"
                title={
                  <>
                    Guides for <em>calmer routines.</em>
                  </>
                }
                id="learn"
              />
              <Link href="/guides" className="btn-quiet">
                All guides
              </Link>
            </div>
            <ul className="mt-14 grid auto-rows-fr gap-3 md:grid-cols-3">
              {featuredGuides.map((g, i) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="group flex h-full min-h-80 flex-col rounded-media bg-porcelain p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-float"
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span className="eyebrow">{g.topic}</span>
                      <span className="rounded-tag bg-cream px-2.5 py-1 text-[0.75rem] text-ink-soft">
                        {g.readingMinutes} min
                      </span>
                    </span>
                    <span className="mt-10 min-h-[2lh] font-serif text-heading-2">
                      {g.title}
                    </span>
                    <span className="mt-3 text-body-sm text-ink-soft">
                      {g.description}
                    </span>
                    {/* Wrapper carries the spacing: padding on the bar itself
                        would be painted by its background. */}
                    <span className="mt-auto flex pt-6" aria-hidden="true">
                      <span
                        className={`h-1 w-12 rounded-full ${["bg-clay-300", "bg-sage-300", "bg-linen"][i % 3]} transition-all duration-500 group-hover:w-20`}
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="section-y" aria-labelledby="home-faq">
        <div className="container-page grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2.5rem)] lg:self-start">
            <SectionHeading
              eyebrow="Questions"
              title={
                <>
                  Good <em>to know.</em>
                </>
              }
              id="home-faq"
              intro={
                <Link href="/pages/faq" className="link-underline text-ink">
                  See all FAQs
                </Link>
              }
            />
          </div>
          <Faq items={homeFaqs} />
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────────── */}
      <section className="px-2 pb-3 sm:px-3" aria-labelledby="newsletter">
        <div className="relative overflow-hidden rounded-media bg-clay-100 py-16 md:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 -right-20 size-112 rounded-full bg-porcelain/60 blur-3xl"
          />
          <div className="container-page relative grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-24">
            <SectionHeading
              eyebrow="Newsletter"
              title={
                <>
                  Make your routine <em>a little simpler.</em>
                </>
              }
              id="newsletter"
              intro="New guides and new products, a couple of times a month. No countdowns, no discount games."
            />
            <div className="rounded-media bg-porcelain/80 p-6 shadow-float backdrop-blur md:p-8">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
