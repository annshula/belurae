import Link from "next/link";

import { BagButton, DesktopNav, MobileMenu } from "@/components/layout/HeaderClient";
import { Icon } from "@/components/ui/Icon";
import { primaryNav } from "@/content/navigation";
import { site } from "@/lib/site";

export function AnnouncementBar() {
  return (
    <div className="bg-sage-800 text-sage-100">
      <p className="container-page flex h-(--announce-h) items-center justify-center gap-4 text-center text-[0.78rem] tracking-[0.04em]">
        <span>Tracked delivery on every order</span>
        <span aria-hidden="true" className="hidden size-1 rounded-full bg-sage-400 sm:inline-block" />
        <span className="hidden sm:inline">Secure checkout by Shopify</span>
        <span aria-hidden="true" className="hidden size-1 rounded-full bg-sage-400 md:inline-block" />
        <span className="hidden md:inline">Key ingredients listed on every product</span>
      </p>
    </div>
  );
}

/**
 * Floating glass header: inset from the page edges, soft shadow instead of a
 * rule, sticky with a small top offset so content glides underneath.
 */
export function Header() {
  return (
    <header className="sticky top-0 z-30 px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="glass mx-auto grid h-(--header-h) max-w-[calc(var(--page-max)+1.5rem)] grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[18px] px-3 sm:px-5 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center">
          <div className="flex items-center lg:hidden">
            <MobileMenu groups={primaryNav} />
            <Link href="/search" className="grid size-11 place-items-center rounded-xl hover:bg-sand/60" aria-label="Search">
              <Icon name="search" />
            </Link>
          </div>
          <div className="hidden lg:block">
            <DesktopNav groups={primaryNav} />
          </div>
        </div>

        <Link
          href="/"
          className="justify-self-center font-serif text-[1.5rem] leading-none tracking-[0.32em] pl-[0.32em]"
          aria-label={`${site.name} — home`}
        >
          BELURAE
        </Link>

        <div className="flex items-center justify-end gap-1">
          <Link href="/search" className="hidden size-11 place-items-center rounded-xl hover:bg-sand/60 lg:grid" aria-label="Search">
            <Icon name="search" />
          </Link>
          <Link
            href="/account"
            prefetch={false}
            className="hidden size-11 place-items-center rounded-xl hover:bg-sand/60 lg:grid"
            aria-label="Account"
          >
            <Icon name="user" />
          </Link>
          <BagButton />
        </div>
      </div>
    </header>
  );
}
