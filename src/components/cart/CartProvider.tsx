"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  trackAddToCart,
  trackBeginCheckout,
  trackRemoveFromCart,
  type AnalyticsItem,
} from "@/lib/analytics";

/**
 * The bag (same model as the reference storefront): lines live in
 * localStorage as { variantId, quantity } only. Names, labels and prices are
 * looked up in the server-provided `bagCatalog`, so a stale browser can never
 * show or submit a price — and Shopify re-prices everything when the checkout
 * cart is created server-side (/api/cart/checkout).
 */

export type BagVariant = {
  productName: string;
  variantLabel: string;
  price: number;
  image: string | null;
  href: string;
  available: boolean;
  /** True when the product's variants are pack sizes (buying more means picking a bigger pack, not a stepper). */
  hasPackOption: boolean;
};

export type BagCatalog = { currency: string; variants: Record<string, BagVariant> };

export type BagLine = { variantId: string; quantity: number };
export type ResolvedLine = BagLine & BagVariant & { lineTotal: number };

const STORAGE_KEY = "belurae.bag.v1";
const MAX_QTY = 10;

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  currency: string;
  isOpen: boolean;
  hydrated: boolean;
  open: () => void;
  close: () => void;
  add: (variantId: string, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  checkout: () => Promise<{ ok: true } | { ok: false; error: string }>;
  announcement: string;
};

const CartContext = createContext<CartContextValue | null>(null);

function readStored(): BagLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (l): l is BagLine =>
          typeof l?.variantId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0,
      )
      .slice(0, 20);
  } catch {
    return [];
  }
}

function toItem(line: ResolvedLine | (BagVariant & { variantId: string }), quantity: number): AnalyticsItem {
  return {
    id: line.variantId,
    name: line.productName,
    variant: line.variantLabel,
    price: line.price,
    quantity,
  };
}

export function CartProvider({ catalog, children }: { catalog: BagCatalog; children: ReactNode }) {
  const [raw, setRaw] = useState<BagLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    setRaw(readStored());
    setHydrated(true);
    const sync = (e: StorageEvent) => e.key === STORAGE_KEY && setRaw(readStored());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
    } catch {
      /* private mode / quota — the bag still works for this tab */
    }
  }, [raw, hydrated]);

  // Lines whose variant no longer exists in the catalog are dropped silently.
  const lines = useMemo<ResolvedLine[]>(
    () =>
      raw.flatMap((l) => {
        const v = catalog.variants[l.variantId];
        return v ? [{ ...l, ...v, lineTotal: Math.round(v.price * l.quantity * 100) / 100 }] : [];
      }),
    [raw, catalog],
  );

  const count = lines.reduce((n, l) => n + l.quantity, 0);
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;

  const add = useCallback(
    (variantId: string, quantity = 1) => {
      const v = catalog.variants[variantId];
      if (!v || !v.available) return;
      setRaw((prev) => {
        const existing = prev.find((l) => l.variantId === variantId);
        if (existing) {
          return prev.map((l) =>
            l.variantId === variantId ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
          );
        }
        return [...prev, { variantId, quantity: Math.min(MAX_QTY, quantity) }];
      });
      trackAddToCart(toItem({ ...v, variantId }, quantity), catalog.currency);
      setAnnouncement(`Added to bag: ${v.productName}, ${v.variantLabel}.`);
      setOpen(true);
    },
    [catalog],
  );

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    const q = Math.max(0, Math.min(MAX_QTY, Math.round(quantity)));
    setRaw((prev) =>
      q === 0 ? prev.filter((l) => l.variantId !== variantId) : prev.map((l) => (l.variantId === variantId ? { ...l, quantity: q } : l)),
    );
  }, []);

  const remove = useCallback(
    (variantId: string) => {
      const line = lines.find((l) => l.variantId === variantId);
      if (line) {
        trackRemoveFromCart(toItem(line, line.quantity), catalog.currency);
        setAnnouncement(`Removed from bag: ${line.productName}.`);
      }
      setRaw((prev) => prev.filter((l) => l.variantId !== variantId));
    },
    [lines, catalog.currency],
  );

  const checkout = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (lines.length === 0) return { ok: false, error: "Your bag is empty." };
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lines: lines.map(({ variantId, quantity }) => ({ variantId, quantity })) }),
      });
      const data = (await res.json().catch(() => ({}))) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        return { ok: false, error: data.error ?? "We couldn't start checkout. Please try again." };
      }
      trackBeginCheckout(lines.map((l) => toItem(l, l.quantity)), catalog.currency);
      window.location.assign(data.checkoutUrl);
      return { ok: true };
    } catch {
      return { ok: false, error: "We couldn't reach checkout. Check your connection and try again." };
    }
  }, [lines, catalog.currency]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      currency: catalog.currency,
      isOpen,
      hydrated,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQuantity,
      remove,
      checkout,
      announcement,
    }),
    [lines, count, subtotal, catalog.currency, isOpen, hydrated, add, setQuantity, remove, checkout, announcement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
