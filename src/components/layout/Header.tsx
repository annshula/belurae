import Link from "next/link";

import {
  BagButton,
  DesktopNav,
  HeaderShell,
  MobileMenu,
  type MegaData,
} from "@/components/layout/HeaderClient";
import { Icon } from "@/components/ui/Icon";
import { primaryNav } from "@/content/navigation";
import { getProducts, storeCurrency } from "@/lib/catalog";
import { buildProductView } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";
import { site } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-sage-900 text-sage-100">
      <p className="container-page flex h-(--announce-h) items-center justify-center gap-4 text-center text-[0.78rem] tracking-[0.06em]">
        <span>Tracked delivery on every order</span>
        <span aria-hidden="true" className="hidden size-1 rounded-full bg-sage-400 sm:inline-block" />
        <span className="hidden sm:inline">Secure checkout by Shopify</span>
        <span aria-hidden="true" className="hidden size-1 rounded-full bg-sage-400 md:inline-block" />
        <span className="hidden md:inline">Key ingredients listed on every product</span>
      </p>
    </div>
  );
}

/** Shop mega-menu content, built from the live catalog (images are real product media). */
async function getMegaData(): Promise<MegaData> {
  const [products, currency] = await Promise.all([getProducts(), storeCurrency()]);
  const first = products[0];
  if (!first) return { cards: [], featured: null };
  const view = buildProductView(first.record, first.content, currency);
  const alt = view.gallery.find((m) => m.type === "image" && m.variantId && m.url !== view.cardImage?.url);
  return {
    cards: [
      {
        label: "Hair Removal",
        href: "/collections/hair-removal",
        description: "No blade, no strips",
        image: view.cardImage?.url ?? null,
        tone: "well-clay",
      },
      {
        label: "Shop all",
        href: "/collections/all",
        description: "The full Belurae edit",
        image: alt && alt.type === "image" ? alt.url : (view.cardImage?.url ?? null),
        tone: "well",
      },
    ],
    featured: {
      name: first.content.name,
      href: view.href,
      format: first.content.format,
      price: formatMoney(view.fromPrice, currency),
      image: view.cardImage?.url ?? null,
      imageAlt: view.cardImage?.alt ?? first.content.name,
    },
  };
}

/**
 * Floating header. Over the home hero it is transparent and blends into the
 * hero panel; once the page scrolls (and on every other page) it becomes the
 * floating glass bar — see HeaderShell.
 */
export async function Header() {
  const mega = await getMegaData();
  return (
    <header className="sticky top-0 z-30 px-2 pt-2 sm:px-3 sm:pt-3">
      <HeaderShell>
        <div className="flex items-center">
          <div className="flex items-center lg:hidden">
            <MobileMenu groups={primaryNav} />
            <Link href="/search" className="grid size-11 place-items-center rounded-xl hover:bg-ink/5" aria-label="Search">
              <Icon name="search" />
            </Link>
          </div>
          <DesktopNav groups={primaryNav} mega={mega} />
        </div>

        <Link
          href="/"
          className="justify-self-center pl-[0.3em] font-serif text-[1.85rem] leading-none tracking-[0.3em]"
          aria-label={`${site.name} — home`}
        >
          BELURAE
        </Link>

        <div className="flex items-center justify-end gap-1">
          <Link href="/search" className="hidden size-11 place-items-center rounded-xl hover:bg-ink/5 lg:grid" aria-label="Search">
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
