import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Faq } from "@/components/content/Faq";
import { NewsletterForm } from "@/components/content/NewsletterForm";
import { SectionHeading } from "@/components/content/SectionHeading";
import { JsonLd } from "@/components/seo/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { guides } from "@/content/guides";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";
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
    a: "On the body — legs, arms, underarms, back, chest and the outer bikini line. Not on the face, genitals or broken or irritated skin.",
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
  const hero = products[0];
  const view = hero
    ? buildProductView(hero.record, hero.content, currency)
    : null;
  const heroImage = view?.cardImage;
  const storyImage = view?.gallery.find(
    (m) => m.type === "image" && m.variantId && m.url !== heroImage?.url,
  );
  const sets = view
    ? view.variants
        .filter((v) => v.units === 1)
        .map((v) => ({
          variant: v,
          title: v.label.split(" · ")[0] ?? v.label,
          description:
            view.options
              .find((o) => o.name !== view.packOptionName)
              ?.values.find((val) =>
                Object.values(v.options).includes(val.value),
              )?.description ?? "",
        }))
    : [];
  const featuredGuides = guides.slice(0, 3);

  const setWells = ["well", "well-sage", "well-clay"];
  const ingredientWells = [
    "well-sage",
    "well-clay",
    "well",
    "well-sage",
    "well-clay",
  ];

  return (
    <>
      <JsonLd data={graph(faqSchema(homeFaqs))} />

      {/* ── Hero: one lit panel, product on a soft pedestal ─────────── */}
      <section className="px-2 pt-3 sm:px-3" aria-labelledby="hero-title">
        <div className="well relative overflow-hidden rounded-media">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 -left-32 size-136 rounded-full bg-clay-100/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -bottom-48 size-144 rounded-full bg-sage-100/80 blur-3xl"
          />

          <div className="container-page relative grid items-center gap-6 pt-10 pb-10 md:pt-16 lg:min-h-[calc(100svh-var(--header-h)-var(--announce-h)-2rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:py-16">
            <div className="order-2 lg:order-1">
              <p className="eyebrow eyebrow-dot">Beauty &amp; Wellness</p>
              <h1
                id="hero-title"
                className="mt-6 font-serif text-display-xl font-light"
              >
                Beauty,
                <br />
                <em className="font-normal text-sage-700">made simpler.</em>
              </h1>
              <p className="mt-7 max-w-md text-body-lg text-ink-soft">
                Thoughtful personal care for everyday rituals — beginning with a
                calmer, blade-free way to remove body hair at home.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href="/collections/hair-removal" className="btn-primary">
                  Shop hair removal
                  <Icon name="arrow-right" className="size-4" />
                </Link>
                <Link href="/pages/philosophy" className="btn-quiet">
                  Discover Belurae
                </Link>
              </div>
              <dl className="mt-14 grid max-w-md grid-cols-3 gap-2.5">
                {[
                  ["5–10", "minutes on skin"],
                  ["0", "blades or strips"],
                  [
                    `${site.delivery.minDays}–${site.delivery.maxDays}`,
                    "day tracked delivery",
                  ],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-porcelain/70 px-4 py-4 shadow-soft"
                  >
                    <dt className="sr-only">{label}</dt>
                    <dd>
                      <span className="block font-serif text-heading-2 tabular-nums">
                        {value}
                      </span>
                      <span className="mt-1 block text-[0.78rem] leading-snug text-ink-soft">
                        {label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="relative mx-auto aspect-square w-full max-w-135 lg:-translate-x-10">
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
              {view && (
                <Link
                  href={view.href}
                  className="glass group relative mx-auto -mt-4 flex w-fit max-w-full items-center gap-4 rounded-[18px] p-3 pr-5 transition-transform duration-300 hover:-translate-y-0.5 lg:absolute lg:right-0 lg:bottom-0 lg:mt-0"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-sage-600 text-ivory">
                    <Icon
                      name="arrow-right"
                      className="size-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-body-sm font-medium">
                      {view.name}
                    </span>
                    <span className="text-body-sm text-ink-soft">
                      From {formatMoney(view.fromPrice, view.currency)}
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust ───────────────────────────────────────────────────── */}
      <section aria-label="Why shop with us" className="container-page pt-6">
        <ul className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {[
            {
              icon: "leaf" as const,
              label: "Key ingredients listed",
              sub: "On every product page",
              href: view ? `${view.href}#ingredients` : "/ingredients",
            },
            {
              icon: "info" as const,
              label: "Clear usage guidance",
              sub: "Timings, areas, patch test",
              href: "/guides/how-to-use-hair-removal-mousse",
            },
            {
              icon: "truck" as const,
              label: "Tracked delivery",
              sub: `${site.delivery.minDays}–${site.delivery.maxDays} days`,
              href: "/pages/shipping",
            },
            {
              icon: "shield" as const,
              label: "Secure checkout",
              sub: "Processed by Shopify",
              href: "/pages/faq",
            },
          ].map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="group flex h-full items-center gap-4 rounded-card bg-porcelain p-4 shadow-soft transition-shadow hover:shadow-float md:p-5"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-sage-50 text-sage-600">
                  <Icon name={item.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-body-sm font-medium">
                    {item.label}
                  </span>
                  <span className="block text-[0.8rem] text-ink-soft">
                    {item.sub}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Meet the mousse ─────────────────────────────────────────── */}
      {view && hero && (
        <section className="section-y" aria-labelledby="meet">
          <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
            <div className="well-clay group relative aspect-4/5 overflow-hidden rounded-media md:aspect-square">
              {storyImage && storyImage.type === "image" && (
                <Image
                  src={storyImage.url}
                  alt={storyImage.alt}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="media-zoom object-contain p-10 mix-blend-multiply md:p-16"
                />
              )}
              <p className="glass absolute top-5 left-5 rounded-[12px] px-4 py-2 text-eyebrow tracking-[0.18em] uppercase">
                The hero product
              </p>
            </div>
            <div>
              <SectionHeading
                eyebrow="Hair removal"
                title={
                  <>
                    Meet a simpler way to remove <em>unwanted hair.</em>
                  </>
                }
                id="meet"
              />
              <dl className="mt-10 grid gap-2.5 sm:grid-cols-2">
                {[
                  [
                    "What it is",
                    "A 140 ml spray-on hair removal mousse for the body, with a scraper in the box.",
                  ],
                  [
                    "How it's used",
                    "Spray on clean, dry skin, wait 5–10 minutes, wipe away and rinse.",
                  ],
                  [
                    "Who it's for",
                    "Anyone who'd rather avoid blades or wax — labelled for men and women.",
                  ],
                  [
                    "Worth knowing",
                    "Patch test 24 hours before first use. Not for the face or genitals.",
                  ],
                ].map(([t, d]) => (
                  <div
                    key={t}
                    className="rounded-card bg-porcelain p-5 shadow-soft"
                  >
                    <dt className="font-serif text-heading-3">{t}</dt>
                    <dd className="mt-2 text-body-sm text-ink-soft">{d}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <Link href={view.href} className="btn-primary">
                  Shop now · {formatMoney(view.fromPrice, view.currency)}
                </Link>
                <Link href={`${view.href}#safety`} className="btn-quiet">
                  Safety guidance
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Ritual: how it works ────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="how">
        <div className="section-y rounded-media bg-cream">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-8">
              <SectionHeading
                eyebrow="The ritual"
                title={
                  <>
                    Four steps. <em>About fifteen minutes.</em>
                  </>
                }
                id="how"
              />
              <Link
                href="/guides/how-to-use-hair-removal-mousse"
                className="btn-quiet"
              >
                Read the full guide
              </Link>
            </div>
            <ol className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Prepare",
                  body: "Clean, dry, unbroken skin. First time? Patch test 24 hours before.",
                },
                {
                  title: "Apply",
                  body: "Spray an even layer that fully covers the hair.",
                },
                {
                  title: "Wait 5–10 minutes",
                  body: "Set a timer. Never go past 10 minutes.",
                },
                {
                  title: "Wipe & rinse",
                  body: "Scrape away gently, rinse with lukewarm water, pat dry.",
                },
              ].map((step, i) => (
                <li
                  key={step.title}
                  className="flex flex-col rounded-media bg-porcelain p-7 shadow-soft transition-transform duration-500 hover:-translate-y-1 lg:min-h-80 lg:p-8"
                >
                  <span
                    className="font-serif text-[4.5rem] leading-none font-light text-clay-300 tabular-nums"
                    aria-hidden="true"
                  >
                    0{i + 1}
                  </span>
                  <h3 className="mt-auto pt-10 font-serif text-heading-2">
                    <span className="sr-only">Step {i + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-3 text-body-sm text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Care, clearly: ingredients ──────────────────────────────── */}
      {hero && (
        <section className="section-y" aria-labelledby="clearly">
          <div className="container-page">
            <SectionHeading
              eyebrow="Care, clearly"
              title={
                <>
                  Know what you&apos;re putting <em>on your skin.</em>
                </>
              }
              id="clearly"
              intro="Every product lists its key ingredients with a plain explanation of what each one is — and what we're still waiting on from the manufacturer."
            />
            <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {hero.content.keyIngredients.map((ing, i) => (
                <li key={ing.slug}>
                  <Link
                    href={`/ingredients/${ing.slug}`}
                    className={`${ingredientWells[i % ingredientWells.length]} group flex h-full min-h-72 flex-col rounded-media p-6 transition-transform duration-500 hover:-translate-y-1`}
                  >
                    <span className="grid size-10 place-items-center rounded-[12px] bg-porcelain/80 text-sage-600 shadow-soft">
                      <Icon name="leaf" className="size-4" />
                    </span>
                    <span className="mt-auto pt-10 font-serif text-heading-2">
                      {ing.name}
                    </span>
                    <span className="mt-2 text-body-sm text-ink-soft">
                      {ing.role}
                    </span>
                    <span className="mt-5 inline-flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.12em] uppercase">
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
            <p className="eyebrow eyebrow-dot text-sage-200">Why Belurae</p>
            <h2
              id="why"
              className="mt-6 max-w-3xl font-serif text-display font-light"
            >
              Clarity is <em>the luxury.</em>
            </h2>
            <div className="mt-16 grid gap-3 md:grid-cols-3">
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
            <Link href="/pages/standards" className="btn-light mt-12">
              Read our standards
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sets ────────────────────────────────────────────────────── */}
      {view && sets.length > 1 && (
        <section className="section-y" aria-labelledby="routine">
          <div className="container-page">
            <SectionHeading
              eyebrow="The complete routine"
              title={
                <>
                  Choose <em>your set.</em>
                </>
              }
              id="routine"
              intro="Start with the mousse on its own, or pair it with a companion product. Multi-packs cost less than buying single sets."
            />
            <ul className="mt-14 grid gap-5 md:grid-cols-3">
              {sets.map(({ variant, title, description }, i) => (
                <li key={variant.id}>
                  <Link
                    href={`${view.href}?variant=${variant.id.split("/").pop()}`}
                    className="group block"
                  >
                    <div
                      className={`${setWells[i % setWells.length]} relative aspect-4/5 overflow-hidden rounded-media`}
                    >
                      {(variant.image ?? view.cardImage?.url) && (
                        <Image
                          src={variant.image ?? view.cardImage!.url}
                          alt={`${view.name} — ${title}`}
                          fill
                          sizes="(min-width: 768px) 30vw, 100vw"
                          className="media-zoom object-contain p-10 mix-blend-multiply"
                        />
                      )}
                      <span className="glass absolute top-5 right-5 rounded-[12px] px-3.5 py-2 text-body-sm font-medium tabular-nums">
                        {formatMoney(variant.price, view.currency)}
                      </span>
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-4 px-1">
                      <div>
                        <h3 className="font-serif text-heading-2">{title}</h3>
                        <p className="mt-2 text-body-sm text-ink-soft">
                          {description}
                        </p>
                      </div>
                      <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-sand transition-colors group-hover:bg-sage-600 group-hover:text-ivory">
                        <Icon name="arrow-right" className="size-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Guides ──────────────────────────────────────────────────── */}
      <section className="px-2 sm:px-3" aria-labelledby="learn">
        <div className="section-y rounded-media bg-cream">
          <div className="container-page">
            <div className="flex flex-wrap items-end justify-between gap-8">
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
            <ul className="mt-14 grid gap-3 md:grid-cols-3">
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
                    <span className="mt-auto pt-12 font-serif text-heading-2">
                      {g.title}
                    </span>
                    <span className="mt-3 text-body-sm text-ink-soft">
                      {g.description}
                    </span>
                    <span
                      className={`mt-6 h-1 w-12 rounded-full ${["bg-clay-300", "bg-sage-300", "bg-linen"][i % 3]} transition-all duration-500 group-hover:w-20`}
                      aria-hidden="true"
                    />
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
        <div className="well-clay relative overflow-hidden rounded-media py-16 md:py-24">
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
