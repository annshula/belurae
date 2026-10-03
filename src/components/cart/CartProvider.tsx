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
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { getExternalId } from "@/lib/ad-identity";
import type { PaymentMethod } from "@/lib/shopify/payments";

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
  /** This pack's own compare-at price (the whole pack, not per set), when Shopify has one. */
  compareAtPrice: number | null;
  /** Sets in the pack (1 for a single). */
  units: number;
  image: string | null;
  href: string;
  available: boolean;
  /** True when the product's variants are pack sizes (buying more means picking a bigger pack, not a stepper). */
  hasPackOption: boolean;
};

export type BagCatalog = {
  currency: string;
  variants: Record<string, BagVariant>;
  /** What checkout accepts, from Shopify — empty when it couldn't be read. */
  payments: PaymentMethod[];
};

export type BagLine = { variantId: string; quantity: number };
export type ResolvedLine = BagLine &
  BagVariant & {
    lineTotal: number;
    /** What the line would cost at the pack's own compare-at price (equals lineTotal when there is none). */
    compareAtTotal: number;
    /** Percent off that compare-at price; null when there is no discount. */
    savedPercent: number | null;
  };

const STORAGE_KEY = "belurae.bag.v1";
const MAX_QTY = 10;
/** What shipping protection is worth, in the catalog's base currency (USD). */
const PROTECTION_VALUE_USD = 2.29;

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

type CartContextValue = {
  lines: ResolvedLine[];
  count: number;
  subtotal: number;
  /** Total saved against compare-at prices (0 when nothing in the bag has one). */
  discount: number;
  currency: string;
  /** Worth of the free shipping protection in `currency`, or null when it can't be stated. */
  protectionValue: number | null;
  /** Payment methods checkout accepts, for the logo row under the button. */
  payments: PaymentMethod[];
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
  const { localizedPriceFor, requestPrices } = useLocalization();

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

  // Live-priced in the visitor's currency once localization resolves, same
  // overlay the PDP uses — otherwise the bag would show base-currency prices
  // to a shopper who has been looking at localized ones the whole time.
  useEffect(() => {
    const ids = new Set<string>();
    for (const l of raw) ids.add(l.variantId);
    requestPrices([...ids]);
  }, [raw, catalog, requestPrices]);

  // Every line's live price must have landed before any of them is used. Mixing live and
  // base-currency lines would add two currencies into one total, so until the
  // whole bag is live it is shown entirely in the catalog's own currency.
  const localized = useMemo(
    () =>
      raw.length > 0 &&
      raw.every((l) => !catalog.variants[l.variantId] || localizedPriceFor(l.variantId) != null),
    [raw, catalog, localizedPriceFor],
  );

  // Lines whose variant no longer exists in the catalog are dropped silently.
  const lines = useMemo<ResolvedLine[]>(
    () =>
      raw.flatMap((l) => {
        const v = catalog.variants[l.variantId];
        if (!v) return [];
        const live = localized ? localizedPriceFor(l.variantId) : null;
        const liveAmount = live ? Number.parseFloat(live.amount) : NaN;
        const price = Number.isFinite(liveAmount) ? liveAmount : v.price;
        // Struck-through price = this pack's own compare-at, live when localized.
        const liveCompare = live?.compareAtAmount != null ? Number.parseFloat(live.compareAtAmount) : NaN;
        const compareAtPack = live ? (Number.isFinite(liveCompare) ? liveCompare : null) : v.compareAtPrice;
        const hasDiscount = compareAtPack != null && compareAtPack > price;
        const round = (n: number) => Math.round(n * 100) / 100;
        return [
          {
            ...l,
            ...v,
            price,
            lineTotal: round(price * l.quantity),
            compareAtTotal: round((hasDiscount ? compareAtPack : price) * l.quantity),
            savedPercent: hasDiscount ? Math.round((1 - price / compareAtPack) * 100) : null,
          },
        ];
      }),
    [raw, catalog, localized, localizedPriceFor],
  );

  // Shopify localizes every line into one currency together, so the first
  // resolved line's currency (if any) speaks for the whole bag.
  const currency =
    (localized
      ? raw
          .map((l) => localizedPriceFor(l.variantId)?.currencyCode)
          .find((c): c is string => Boolean(c))
      : undefined) ?? catalog.currency;

  // What the shipping-protection line is "worth" (shown struck through next to
  // FREE), in the bag's currency: the USD figure scaled by the same rate
  // Shopify applied to the first line. Null when there is no USD base to scale.
  const protectionValue = (() => {
    if (catalog.currency !== "USD") return null;
    if (!localized) return PROTECTION_VALUE_USD;
    const first = lines[0];
    const live = first ? localizedPriceFor(first.variantId) : null;
    const base = first ? catalog.variants[first.variantId]?.price : null;
    const rate = live && base ? Number.parseFloat(live.amount) / base : NaN;
    return Number.isFinite(rate) && rate > 0
      ? Math.round(PROTECTION_VALUE_USD * rate * 100) / 100
      : null;
  })();

  // Distinct items in the bag, not the sum of their quantities.
  const count = lines.length;
  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100;
  const discount =
    Math.round((lines.reduce((s, l) => s + l.compareAtTotal, 0) - subtotal) * 100) / 100;

  const add = useCallback(
    (variantId: string, quantity = 1) => {
      const v = catalog.variants[variantId];
      if (!v || !v.available) return;
      setRaw((prev) => {
        const existing = prev.find((l) => l.variantId === variantId);
        // Already in the bag: overwrite its quantity with the one being added
        // (adding the same item again must not stack up), keeping its place.
        if (existing) {
          return prev.map((l) =>
            l.variantId === variantId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l,
          );
        }
        return [...prev, { variantId, quantity: Math.min(MAX_QTY, quantity) }];
      });
      const live = localizedPriceFor(variantId);
      const liveAmount = live ? Number.parseFloat(live.amount) : NaN;
      const price = Number.isFinite(liveAmount) ? liveAmount : v.price;
      trackAddToCart(toItem({ ...v, variantId, price }, quantity), live?.currencyCode ?? catalog.currency);
      setAnnouncement(`Added to bag: ${v.productName}, ${v.variantLabel}.`);
      setOpen(true);
    },
    [catalog, localizedPriceFor],
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
        trackRemoveFromCart(toItem(line, line.quantity), currency);
        setAnnouncement(`Removed from bag: ${line.productName}.`);
      }
      setRaw((prev) => prev.filter((l) => l.variantId !== variantId));
    },
    [lines, currency],
  );

  const checkout = useCallback(async (): Promise<{ ok: true } | { ok: false; error: string }> => {
    if (lines.length === 0) return { ok: false, error: "Your bag is empty." };
    try {
      // Meta's click-id / browser-id cookies, when the Pixel has loaded and
      // set them, plus a stable per-browser id (lib/ad-identity.ts) — all
      // carried through Shopify as cart attributes so the orders/paid
      // webhook's server-side Purchase event can include them. Without these,
      // that event has no fbc/fbp/external_id at all (there is no
      // browser-side Purchase pixel to fall back on; see route.ts).
      const fbc = readCookie("_fbc");
      const fbp = readCookie("_fbp");
      const externalId = getExternalId();
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: lines.map(({ variantId, quantity }) => ({ variantId, quantity })),
          ...(fbc || fbp || externalId ? { meta: { fbc, fbp, externalId } } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { checkoutUrl?: string; error?: string };
      if (!res.ok || !data.checkoutUrl) {
        return { ok: false, error: data.error ?? "We couldn't start checkout. Please try again." };
      }
      trackBeginCheckout(lines.map((l) => toItem(l, l.quantity)), currency);
      window.location.assign(data.checkoutUrl);
      return { ok: true };
    } catch {
      return { ok: false, error: "We couldn't reach checkout. Check your connection and try again." };
    }
  }, [lines, currency]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      subtotal,
      discount,
      currency,
      protectionValue,
      payments: catalog.payments,
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
    [lines, count, subtotal, discount, currency, protectionValue, catalog.payments, isOpen, hydrated, add, setQuantity, remove, checkout, announcement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
