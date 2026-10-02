import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/content/PageHero";
import { Icon } from "@/components/ui/Icon";
import { ingredients } from "@/content/ingredients";

export const metadata: Metadata = {
  title: "Ingredients — What's In Our Products and Why",
  description:
    "Plain-language explanations of the key ingredients in Belurae products: what each ingredient is and why formulators use it.",
  alternates: { canonical: "/ingredients" },
};

export default function IngredientsIndex() {
  return (
    <>
      <PageHero
        tone="sage"
        crumbs={[{ label: "Home", href: "/" }, { label: "Ingredients" }]}
        eyebrow="Care, clearly"
        title="Ingredients"
        intro="What the key ingredients in our products are and why they're used — in plain language, without promises no ingredient can keep."
      />
      <div className="container-page pt-10 pb-20 md:pt-14">
        <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map((i) => (
            <li key={i.slug}>
              <Link
                href={`/ingredients/${i.slug}`}
                className="group flex h-full min-h-80 flex-col rounded-media bg-porcelain p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-float"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-control bg-sage-100 text-sage-600">
                    <Icon name={i.icon} className="size-4" />
                  </span>
                  <span className="rounded-tag bg-cream px-2.5 py-1 text-right text-[0.72rem] tracking-[0.06em] text-ink-soft">
                    {i.inci}
                  </span>
                </span>
                <span className="mt-8 min-h-[2lh] font-serif text-heading-1 font-light">
                  {i.name}
                </span>
                <span className="mt-3 text-body-sm text-ink-soft">
                  {i.summary}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
