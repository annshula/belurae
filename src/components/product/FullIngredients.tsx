"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Icon } from "@/components/ui/Icon";
import { useScrollLock } from "@/lib/scroll-lock";
import { cn } from "@/lib/utils";

/**
 * A text button for the ingredients section that opens the complete INCI
 * declaration — a bottom sheet on a phone, a centred dialog from md up (the
 * same shell the full-review panel uses). Owns its open state, so a caller only
 * renders it where the link should sit.
 */
export function FullIngredientsButton({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useScrollLock(open);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          "link-underline inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-ui text-body-sm font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
          className,
        )}
      >
        See the full ingredient list ({items.length})
      </button>

      {open &&
        mounted &&
        createPortal(
          <IngredientsPanel items={items} onClose={() => setOpen(false)} />,
          document.body,
        )}
    </>
  );
}

function IngredientsPanel({
  items,
  onClose,
}: {
  items: string[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Keyboard and screen-reader users land inside the dialog, on its way out.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 z-85 flex items-end justify-center md:items-center md:p-6">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ingredients-panel-title"
        className="relative flex max-h-[88svh] w-full flex-col overflow-hidden rounded-t-media bg-paper pb-[env(safe-area-inset-bottom)] shadow-drift md:max-h-[80vh] md:max-w-2xl md:rounded-panel md:pb-0"
      >
        {/* Phone: the grab handle is the sheet's dismiss control. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="group/handle grid shrink-0 cursor-pointer touch-manipulation place-items-center py-3 md:hidden"
        >
          <span
            aria-hidden="true"
            className="h-1 w-11 rounded-pill bg-sand transition-colors duration-300 group-active/handle:bg-sage-300"
          />
        </button>

        {/* Desktop: the corner X. */}
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 hidden size-11 place-items-center rounded-full text-ink-soft transition-colors duration-300 hover:bg-blush hover:text-sage-600 md:grid"
        >
          <Icon name="close" className="size-4" strokeWidth={2.2} />
        </button>

        <div className="overflow-y-auto overscroll-contain px-6 pt-2 pb-8 md:px-8 md:pt-8">
          <h2
            id="ingredients-panel-title"
            className="font-serif text-heading-3 md:pr-12"
          >
            Full ingredient list
          </h2>
          <p className="mt-1 font-ui text-body-sm text-ink-faint">
            INCI · {items.length} ingredients
          </p>

          <ol className="mt-5 text-body-sm leading-7 text-ink-soft md:columns-2 md:gap-x-8">
            {items.map((name, i) => (
              <li key={`${i}-${name}`} className="break-inside-avoid">
                {name}
              </li>
            ))}
          </ol>

          <p className="mt-6 border-t border-sand pt-4 text-[0.75rem] text-ink-faint">
            As supplied by the manufacturer. The declaration printed on the pack
            is the reference.
          </p>
        </div>
      </div>
    </div>
  );
}
