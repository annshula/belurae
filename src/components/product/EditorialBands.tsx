import Image from "next/image";
import Link from "next/link";

import { editorialDisplay } from "@/app/fonts";
import { Icon } from "@/components/ui/Icon";
import { ingredientIcon } from "@/content/ingredients";
import type { ProductContent } from "@/content/products";
import type { ProductView } from "@/lib/commerce/product-view";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * "Your daily step" + "Key ingredients" bands, shared by the product pages.
 * Server-rendered, no client JavaScript; the ingredient orbs are CSS
 * gradients (no image requests). The display serif is scoped to this wrapper
 * so only routes that render the bands download it.
 */

const DISPLAY = "font-(family-name:--ff-display)";
const DEFER = "[content-visibility:auto] [contain-intrinsic-size:auto_640px]";

/** Glossy "bubble" fills for the ingredient orbs. */
const ORBS = [
  "bg-[radial-gradient(circle_at_32%_28%,#fff_0,var(--color-sage-100)_38%,var(--color-sage-300)_100%)]",
  "bg-[radial-gradient(circle_at_32%_28%,#fff_0,var(--color-sage-50)_38%,var(--color-sage-200)_100%)]",
  "bg-[radial-gradient(circle_at_32%_28%,#fff_0,var(--color-sage-100)_38%,var(--color-sage-200)_100%)]",
  "bg-[radial-gradient(circle_at_32%_28%,#fff_0,var(--color-sage-50)_38%,var(--color-sage-300)_100%)]",
];

const POSITION = {
  right: "object-right",
  top: "object-top",
  center: "object-center",
} as const;

export function EditorialBands({
  content,
  view,
}: {
  content: ProductContent;
  view: ProductView;
}) {
  const daily = content.pdp.dailyStep;
  if (!daily) return null;

  const lifestyle = view.gallery.flatMap((m) =>
    m.type === "image" && m.url.includes(daily.mediaFile) ? [m] : [],
  )[0];

  return (
    <div className={editorialDisplay.variable}>
      {/* ── Your daily step ── */}
      <section
        aria-labelledby="daily-title"
        className={cn("px-2 sm:px-3", DEFER)}
      >
        <div className="mx-auto grid grid-cols-1 max-w-(--page-max) overflow-hidden rounded-media bg-cream lg:grid-cols-[5fr_4fr_4fr]">
          {lifestyle && (
            <div className="relative aspect-4/3 lg:aspect-auto lg:min-h-96">
              <Image
                src={lifestyle.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 38vw, 100vw"
                className={cn(
                  "object-cover",
                  POSITION[daily.imagePosition ?? "right"],
                )}
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="eyebrow">{daily.eyebrow}</p>
            <h2
              id="daily-title"
              className={cn(
                DISPLAY,
                "mt-3 text-[clamp(2.1rem,1.6rem+2vw,3.1rem)] leading-[1.02] font-semibold text-sage-900",
              )}
            >
              {daily.heading}
            </h2>
            <p className="mt-4 max-w-[44ch] text-ink-soft">{daily.body}</p>
          </div>
          <ul className="flex flex-col justify-center gap-5 p-6 pt-0 sm:p-10 lg:bg-sand/60 lg:pt-10">
            {daily.benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-paper shadow-soft">
                  <Icon name={b.icon} className="size-5 text-sage-800" />
                </span>
                <span>
                  <span className="block font-ui font-medium">{b.title}</span>
                  <span className="block text-body-sm text-ink-soft">
                    {b.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Key ingredients ── */}
      <section
        id="ingredients"
        aria-labelledby="ingredients-title"
        className={cn("mt-2 bg-sage-50 py-12 sm:mt-3 lg:py-16", DEFER)}
      >
        <div className="container-page grid grid-cols-1 gap-8 lg:grid-cols-[4fr_8fr] lg:items-center lg:gap-10">
          <div>
            <p className="eyebrow">Key ingredients</p>
            <h2
              id="ingredients-title"
              className={cn(
                DISPLAY,
                "mt-3 text-[clamp(2.1rem,1.6rem+2vw,3.1rem)] leading-[1.02] font-semibold text-sage-900",
              )}
            >
              Every ingredient, named.
            </h2>
            <p className="mt-3 max-w-[40ch] text-ink-soft">
              {content.pdp.ingredientsNote}{" "}
              <a
                href={`mailto:${site.supportEmail}?subject=Ingredient%20question`}
                className="link-underline text-ink"
              >
                Ask us
              </a>{" "}
              about any ingredient and we&apos;ll answer.
            </p>
            <Link
              href="/ingredients"
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-control bg-sage-800 px-6 font-ui text-body-sm font-medium text-ivory transition-colors hover:bg-sage-900"
            >
              Explore the ingredient library
              <Icon name="arrow-right" className="size-4" />
            </Link>
          </div>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-flow-col sm:auto-cols-fr sm:gap-x-0 sm:divide-x sm:divide-sand">
            {content.keyIngredients.map((ing, i) => (
              <li key={ing.slug} className="sm:px-4">
                <Link
                  href={`/ingredients/${ing.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "grid size-20 place-items-center rounded-full shadow-[inset_-6px_-8px_16px_color-mix(in_srgb,var(--color-sage-400)_25%,transparent),inset_6px_6px_14px_rgb(255_255_255/0.9),0_10px_24px_-10px_color-mix(in_srgb,var(--color-sage-500)_50%,transparent)] transition-transform duration-500 group-hover:-translate-y-1 sm:size-24",
                      ORBS[i % ORBS.length],
                    )}
                  >
                    <Icon
                      name={ingredientIcon(ing.slug, ing.icon)}
                      className="size-8 text-sage-600 sm:size-9"
                      strokeWidth={1.4}
                    />
                  </span>
                  <span className="mt-4 font-ui font-medium">{ing.name}</span>
                  <span className="mt-1 text-body-sm text-ink-soft">
                    {ing.role}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
