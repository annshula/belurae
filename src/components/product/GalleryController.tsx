"use client";

import { useEffect } from "react";

/**
 * When the shopper picks a set that has its own photo, bring that photo into
 * view (mobile swipe row) — listens for the `bl:variant` event the purchase
 * panel dispatches. Renders nothing.
 */
export function GalleryController() {
  useEffect(() => {
    const onVariant = (e: Event) => {
      const id = (e as CustomEvent<{ variantId: string }>).detail?.variantId;
      if (!id) return;
      const row = document.querySelector<HTMLElement>("[data-gallery]");
      const target = row?.querySelector<HTMLElement>(`[data-variant-id="${CSS.escape(id)}"]`);
      if (!row || !target) return;
      if (row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: target.offsetLeft - row.offsetLeft, behavior: "smooth" });
      }
    };
    window.addEventListener("bl:variant", onVariant);
    return () => window.removeEventListener("bl:variant", onVariant);
  }, []);
  return null;
}
