import Link from "next/link";

import {
  BagButton,
  DesktopNav,
  HeaderShell,
  MobileMenu,
  type MegaData,
} from "@/components/layout/HeaderClient";
import { Icon } from "@/components/ui/Icon";
import { collections } from "@/content/collections";
import { primaryNav } from "@/content/navigation";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { site } from "@/lib/site";

export { AnnouncementBar } from "@/components/layout/HeaderClient";

/**
 * Shop menu content: every real category (from content/collections.ts,
 * excluding the "all" catch-all) with its live product count and a
 * representative image from the live catalog.
 */
async function getMegaData(): Promise<MegaData> {
  const [products, currency] = await Promise.all([
    getProducts(),
    storeCurrency(),
  ]);
  const views = products.map((p) => ({
    p,
    view: buildProductView(p.record, p.content, currency),
  }));

  const categories = collections
    .filter((c) => c.categories !== "*")
    .map((c) => {
      const inCategory = views.filter(({ p }) =>
        (c.categories as string[]).includes(p.content.category.slug),
      );
      return {
        label: c.title,
        // A single-product category opens that product directly; only a
        // category with a real listing worth browsing goes to a collection.
        href:
          inCategory.length === 1
            ? inCategory[0]!.view.href
            : `/collections/${c.slug}`,
        count: inCategory.length,
        image: inCategory[0]?.view.cardImage?.url ?? null,
      };
    })
    .filter((c) => c.count > 0);

  return { categories, browseAllHref: "/collections/all" };
}

/**
 * Floating header. Over the home hero it is transparent and blends into the
 * hero panel; once the page scrolls (and on every other page) it becomes the
 * floating glass bar — see HeaderShell.
 */
export async function Header() {
  const mega = await getMegaData();
  return (
    <header className="sticky top-0 z-30 pt-2 sm:pt-3">
      <HeaderShell>
        {/* self-stretch so the desktop nav can span the bar's full height —
            the dropdowns hang from the bar's bottom edge (see DesktopNav). */}
        <div className="flex h-full self-stretch items-center">
          <div className="flex items-center lg:hidden">
            <MobileMenu groups={primaryNav} />
            <Link
              href="/search"
              className="grid size-11 place-items-center rounded-xl hover:bg-ink/5"
              aria-label="Search"
            >
              <Icon name="search" />
            </Link>
          </div>
          <DesktopNav groups={primaryNav} mega={mega} />
        </div>

        <Link
          href="/"
          className="justify-self-center pl-[0.3em] font-logo text-[1.85rem] leading-none tracking-[0.3em]"
          aria-label={`${site.name} — home`}
        >
          BELURAE
        </Link>

        <div className="flex items-center justify-end gap-1">
          <Link
            href="/search"
            className="hidden size-11 place-items-center rounded-xl hover:bg-ink/5 lg:grid"
            aria-label="Search"
          >
            <Icon name="search" />
          </Link>
          <Link
            href="/account"
            prefetch={false}
            className="hidden size-11 place-items-center rounded-xl hover:bg-ink/5 lg:grid"
            aria-label="Account"
          >
            <Icon name="user" />
          </Link>
          <BagButton />
        </div>
      </HeaderShell>
    </header>
  );
}
