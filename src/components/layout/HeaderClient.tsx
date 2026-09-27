"use client";

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

export function DesktopNav({ groups }: { groups: NavGroup[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
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
      if (!navRef.current?.contains(e.target as Node)) setOpenIndex(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [openIndex, baseId]);

  return (
    <nav ref={navRef} aria-label="Main" className="hidden lg:block">
      <ul className="flex items-center gap-1">
        {groups.map((group, i) =>
          group.links.length === 0 ? (
            <li key={group.label}>
              <Link
                href={group.href ?? "/"}
                className="flex min-h-11 items-center rounded-xl px-3.5 text-body-sm transition-colors hover:bg-sand/60"
              >
                {group.label}
              </Link>
            </li>
          ) : (
            <li key={group.label} className="relative">
              <button
                id={`${baseId}-t${i}`}
                type="button"
                aria-expanded={openIndex === i}
                aria-controls={`${baseId}-p${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className={cn(
                  "flex min-h-11 items-center gap-1.5 rounded-xl px-3.5 text-body-sm transition-colors hover:bg-sand/60",
                  openIndex === i && "bg-sand/60",
                )}
              >
                {group.label}
                <Icon
                  name="chevron-down"
                  className={cn(
                    "size-3.5 transition-transform",
                    openIndex === i && "rotate-180",
                  )}
                />
              </button>
              <div
                id={`${baseId}-p${i}`}
                hidden={openIndex !== i}
                className="surface-float absolute top-full left-0 z-40 mt-3 w-88 p-2.5"
              >
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="block rounded-[14px] px-4 py-3 transition-colors hover:bg-cream"
                      >
                        <span className="block text-body">{link.label}</span>
                        {link.description && (
                          <span className="block text-body-sm text-ink-soft">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ),
        )}
      </ul>
    </nav>
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
            <span className="font-serif text-heading-3 tracking-[0.3em]">
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
                  <ul className="pb-4">
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
            <div className="mt-auto flex flex-col gap-1 rounded-2xl bg-cream p-3 text-body-sm">
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
