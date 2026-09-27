import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { cn } from "@/lib/utils";

/**
 * Shared opening panel for editorial pages: breadcrumbs, eyebrow, a light
 * display title and an intro, on a softly lit rounded well.
 *
 * `compact` drops the well/blur background and shrinks the title — for
 * listing pages (collections) where the product grid is the focus, not the
 * intro copy.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  tone = "well",
  compact = false,
  children,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  tone?: "well" | "well-sage" | "well-clay";
  compact?: boolean;
  children?: ReactNode;
}) {
  if (compact) {
    return (
      <section className="container-page pt-6 md:pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <h1 className="font-serif text-heading-1 font-light">{title}</h1>
          {intro && <div className="max-w-[46ch] text-body-sm text-ink-soft">{intro}</div>}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section className="px-2 pt-3 sm:px-3">
      <div className={cn(tone, "relative overflow-hidden rounded-media")}>
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 size-[30rem] rounded-full bg-porcelain/70 blur-3xl" />
        <div className="container-page relative pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs items={crumbs} />
          <div className="mt-12 grid gap-8 md:mt-16 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-20">
            <div>
              {eyebrow && <p className="eyebrow eyebrow-dot mb-5">{eyebrow}</p>}
              <h1 className="font-serif text-display font-light">{title}</h1>
            </div>
            {intro && <div className="max-w-[60ch] text-body-lg text-ink-soft">{intro}</div>}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
