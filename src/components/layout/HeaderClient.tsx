"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import type { NavGroup } from "@/content/navigation";
import { cn } from "@/lib/utils";

/**
 * Header interactivity: desktop disclosure menus, the mobile menu sheet and
 * the bag button. Menus are disclosure buttons (not ARIA `menu`), close on
 * Escape / outside click / navigation, and return focus to their trigger.
 * All links are real <a> elements in the server HTML, so crawlers see them.
 */

/**
 * The site-wide announcement bar — hidden on the home page, where the hero
 * carries the brand message instead and the transparent header sits directly
 * on the hero panel with nothing above it.
 */
export function AnnouncementBar() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <div className="bg-sage-900 text-sage-100">
      <p className="container-page flex h-(--announce-h) items-center justify-center gap-4 text-center text-[0.78rem] tracking-[0.06em]">
        <span>Tracked delivery on every order</span>
        <span
          aria-hidden="true"
          className="hidden size-1 rounded-full bg-sage-400 sm:inline-block"
        />
        <span className="hidden sm:inline">Secure checkout by Shopify</span>
        <span
          aria-hidden="true"
          className="hidden size-1 rounded-full bg-sage-400 md:inline-block"
        />
        <span className="hidden md:inline">
          Key ingredients listed on every product
        </span>
      </p>
    </div>
  );
}

export type MegaCategory = {
  label: string;
  href: string;
  count: number;
  image: string | null;
};
export type MegaData = { categories: MegaCategory[]; browseAllHref: string };

/** Refined disclosure caret: a thin chevron that turns as the panel opens. */
function Caret({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={cn(
        "size-3 transition-transform duration-300 ease-out-soft",
        open && "-rotate-180",
      )}
    >
      <path
        d="M2.5 4.5 6 8l3.5-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Arrow that slides on hover of its `group/link` parent. */
function SlideArrow({ className }: { className?: string }) {
  return (
    <span
      className={cn("relative inline-flex size-4 overflow-hidden", className)}
      aria-hidden="true"
    >
      <Icon
        name="arrow-right"
        className="absolute size-4 transition-transform duration-300 group-hover/link:translate-x-4"
      />
      <Icon
        name="arrow-right"
        className="absolute size-4 -translate-x-4 transition-transform duration-300 group-hover/link:translate-x-0"
      />
    </span>
  );
}

export function DesktopNav({
  groups,
  mega,
}: {
  groups: NavGroup[];
  mega: MegaData;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | null>(null);
  const pathname = usePathname();
  const baseId = useId();

  useEffect(() => setOpenIndex(null), [pathname]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const trigger = document.getElementById(`${baseId}-t${openIndex}`);
      setOpenIndex(null);
      trigger?.focus();
    };
    const onClick = (e: MouseEvent) => {
      const header = navRef.current?.closest("header");
      if (!header?.contains(e.target as Node)) setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openIndex, baseId]);

  // Hover intent for fine pointers; click/keyboard always work.
  const hoverOpen = (i: number) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpenIndex(i);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = window.setTimeout(() => setOpenIndex(null), 180);
  };
  const keep = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main"
      className="hidden h-full font-headline lg:block"
    >
      {/* Full-height list: each item's bottom edge is the bar's bottom edge, so
          a panel anchored to `top-full` on the item hangs from the bar itself
          while staying aligned with the menu it belongs to. */}
      <ul className="flex h-full items-stretch gap-0.5">
        {groups.map((group, i) =>
          group.links.length === 0 ? (
            <li key={group.label} className="flex items-center">
              <Link
                href={group.href ?? "/"}
                className="relative flex min-h-11 items-center rounded-xl px-3.5 text-[0.95rem] tracking-[0.01em] transition-colors hover:bg-ink/5"
              >
                {group.label}
              </Link>
            </li>
          ) : (
            <li
              key={group.label}
              className="relative flex items-center"
              onPointerEnter={hoverOpen(i)}
              onPointerLeave={hoverClose}
            >
              <button
                id={`${baseId}-t${i}`}
                type="button"
                aria-expanded={openIndex === i}
                aria-controls={`${baseId}-p${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={cn(
                  "relative flex min-h-11 items-center gap-2 rounded-xl px-3.5 text-[0.95rem] tracking-[0.01em] transition-colors hover:bg-ink/5",
                  openIndex === i && "bg-ink/5",
                )}
              >
                {group.label}
                <span
                  className={cn(
                    "grid size-5 place-items-center rounded-full transition-colors duration-300",
                    openIndex === i ? "bg-sage-600 text-ivory" : "bg-ink/6",
                  )}
                >
                  <Caret open={openIndex === i} />
                </span>
              </button>

              <div
                id={`${baseId}-p${i}`}
                hidden={openIndex !== i}
                onPointerEnter={keep}
                onPointerLeave={hoverClose}
                className={cn(
                  "absolute top-full z-40 pt-3",
                  // The wide Shop panel lines up with its own button's left
                  // edge; the narrow lists sit centred under theirs.
                  i === 0 ? "left-0" : "left-1/2 -translate-x-1/2",
                )}
              >
                <div className="surface-float mega-in inline-block overflow-hidden rounded-[24px] p-3">
                  {i === 0 ? (
                    <ShopPanel mega={mega} />
                  ) : (
                    <EditorialPanel group={group} />
                  )}
                </div>
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

/**
 * Compact Shop dropdown: an eyebrow label, a 2-column grid of category
 * thumbnails with live product counts, and a "Browse all shop" footer link
 * below a hairline — matching a standard compact shop-by-category menu.
 */
function ShopPanel({ mega }: { mega: MegaData }) {
  const twoCol = mega.categories.length > 1;
  return (
    <div className={cn(twoCol ? "w-88" : "w-64", "p-4 font-headline")}>
      <p className="eyebrow px-1">Shop by category</p>
      <ul
        className={cn(
          "mt-3 grid gap-x-4 gap-y-1",
          twoCol ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {mega.categories.map((cat) => (
          <li key={cat.href}>
            <Link
              href={cat.href}
              className="group/link flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-cream"
            >
              <span className="well relative block size-11 shrink-0 overflow-hidden rounded-tag">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-contain p-1.5 mix-blend-multiply"
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-medium">
                  {cat.label}
                </span>
                <span className="block text-[0.78rem] text-ink-soft">
                  {cat.count} {cat.count === 1 ? "piece" : "pieces"}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-sand pt-3">
        <Link
          href={mega.browseAllHref}
          className="group/link flex items-center justify-center gap-2 rounded-xl py-2 text-body-sm font-medium transition-colors hover:bg-cream"
        >
          Browse all shop
          <Icon
            name="arrow-right"
            className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-1"
          />
        </Link>
      </div>
    </div>
  );
}

function EditorialPanel({ group }: { group: NavGroup }) {
  return (
    <ul className="w-64 p-2 font-headline">
      {group.links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="group/link flex items-center justify-between gap-4 rounded-xl px-4 py-3 text-body-sm font-medium transition-colors hover:bg-cream"
          >
            {link.label}
            <SlideArrow className="text-ink-soft" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * Header chrome state. On the home page the bar is transparent while it sits
 * over the hero and becomes the floating glass bar once the page scrolls;
 * everywhere else it is always the glass bar.
 */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      data-over-hero={overHero || undefined}
      style={{ paddingInline: "var(--gutter)" }}
      className={cn(
        "relative mx-auto grid h-(--header-h) max-w-(--page-max) grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-[18px] transition-[background-color,box-shadow,backdrop-filter] duration-500",
        overHero ? "bg-transparent shadow-none" : "bg-porcelain shadow-float",
      )}
    >
      {children}
    </div>
  );
}

export function MobileMenu({ groups }: { groups: NavGroup[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        className="grid size-11 place-items-center rounded-xl hover:bg-sand/60 lg:hidden"
        aria-label="Open menu"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <Icon name="menu" />
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        className="sheet fixed inset-y-2 right-auto left-2 h-[calc(100dvh-1rem)] w-[min(calc(100%-1rem),400px)] rounded-3xl shadow-drift"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current?.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="font-logo text-heading-3 tracking-[0.3em]">
              BELURAE
            </span>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-xl bg-sand/70"
              aria-label="Close menu"
              onClick={() => ref.current?.close()}
            >
              <Icon name="close" />
            </button>
          </div>
          <nav
            aria-label="Mobile"
            className="flex flex-1 flex-col gap-2 overflow-y-auto px-3 py-3"
          >
            {groups.map((group) =>
              group.links.length === 0 ? (
                <Link
                  key={group.label}
                  href={group.href ?? "/"}
                  className="flex min-h-16 items-center rounded-2xl bg-porcelain px-5 font-serif text-heading-2 shadow-soft"
                >
                  {group.label}
                </Link>
              ) : (
                <details
                  key={group.label}
                  className="group rounded-2xl bg-porcelain px-5 shadow-soft"
                >
                  <summary className="flex min-h-16 items-center justify-between font-serif text-heading-2">
                    {group.label}
                    <span className="grid size-8 place-items-center rounded-lg bg-cream">
                      <Icon
                        name="plus"
                        className="size-3.5 transition-transform duration-300 group-open:rotate-45"
                      />
                    </span>
                  </summary>
                  <ul className="pb-4 font-headline">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex min-h-11 items-center text-ink-soft hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ),
            )}
            <div className="mt-auto flex flex-col gap-1 rounded-2xl bg-cream p-3 text-body-sm font-headline">
              <Link
                href="/account"
                prefetch={false}
                className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-sand/60"
              >
                <Icon name="user" className="size-4" /> Account
              </Link>
              <Link
                href="/pages/contact"
                className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-sand/60"
              >
                <Icon name="help" className="size-4" /> Contact us
              </Link>
            </div>
          </nav>
        </div>
      </dialog>
    </>
  );
}

export function BagButton() {
  const { count, open, hydrated } = useCart();
  return (
    <button
      type="button"
      onClick={open}
      className="relative grid size-11 place-items-center rounded-xl hover:bg-sand/60"
      aria-label={
        hydrated && count > 0
          ? `Bag, ${count} item${count === 1 ? "" : "s"}`
          : "Bag"
      }
    >
      <Icon name="bag" />
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1.5 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-sage-600 px-1 text-[10px] leading-none font-semibold text-ivory transition-opacity",
          hydrated && count > 0 ? "opacity-100" : "opacity-0",
        )}
      >
        {count || ""}
      </span>
    </button>
  );
}
