"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { trackSelectVariant, trackViewItem } from "@/lib/analytics";
import type { ProductView, ViewVariant } from "@/lib/commerce/product-view";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

/**
 * The PDP's buying controls — the only client island in the purchase column.
 *
 *  - Options are native radio groups in fieldsets (keyboard + screen-reader
 *    behaviour for free). Combinations Shopify doesn't have are disabled and
 *    labelled, never silently hidden.
 *  - Savings shown are arithmetic vs. buying single sets (see product-view.ts).
 *  - The selected variant is mirrored to `?variant=` for shareable links; the
 *    canonical URL stays the bare product URL.
 *  - A sticky add-to-bag bar appears on small screens once the main button
 *    scrolls out of view.
 */

const numericId = (gid: string) => gid.split("/").pop() ?? gid;

function findVariant(
  view: ProductView,
  selection: Record<string, string>,
): ViewVariant | undefined {
  return view.variants.find((v) =>
    view.options.every((o) => v.options[o.name] === selection[o.name]),
  );
}

export function PurchasePanel({ view }: { view: ProductView }) {
  const { add, open } = useCart();
  const initial =
    view.variants.find((v) => v.id === view.defaultVariantId) ??
    view.variants[0]!;
  const [selection, setSelection] = useState<Record<string, string>>(
    initial.options,
  );
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [showSticky, setShowSticky] = useState(false);

  const variant = findVariant(view, selection);
  const canBuy = Boolean(variant?.availableForSale);

  // Restore a shared ?variant= link.
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("variant");
    const fromUrl = param
      ? view.variants.find((v) => numericId(v.id) === param)
      : undefined;
    if (fromUrl) setSelection(fromUrl.options);
    const v = fromUrl ?? initial;
    trackViewItem(
      { id: v.id, name: view.name, variant: v.label, price: v.price },
      view.currency,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setShowSticky(
        !entry!.isIntersecting && entry!.boundingClientRect.top < 0,
      ),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (name: string, value: string) => {
    let next = { ...selection, [name]: value };
    // If the new combination doesn't exist, keep the choice and move the other option to one that does.
    if (!findVariant(view, next)) {
      const fallback =
        view.variants.find(
          (v) => v.options[name] === value && v.availableForSale,
        ) ?? view.variants.find((v) => v.options[name] === value);
      if (fallback) next = { ...fallback.options };
    }
    setSelection(next);
    setAdded(false);
    const v = findVariant(view, next);
    if (!v) return;
    startTransition(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", numericId(v.id));
      window.history.replaceState(window.history.state, "", url);
    });
    window.dispatchEvent(
      new CustomEvent("bl:variant", { detail: { variantId: v.id } }),
    );
    trackSelectVariant({
      id: v.id,
      name: view.name,
      variant: v.label,
      price: v.price,
    });
  };

  const onAdd = () => {
    if (!variant || !canBuy) return;
    add(variant.id, 1);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  const onBuyNow = async () => {
    if (!variant || !canBuy) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: [{ variantId: variant.id, quantity: 1 }],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        checkoutUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.checkoutUrl)
        throw new Error(data.error ?? "We couldn't start checkout.");
      window.location.assign(data.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't start checkout.");
      setBuying(false);
    }
  };

  const optionAvailable = (name: string, value: string) => {
    const exact = findVariant(view, { ...selection, [name]: value });
    if (exact) return exact.availableForSale;
    // Non-pack option whose combination is missing: available if any variant with that value is.
    return view.variants.some(
      (v) => v.options[name] === value && v.availableForSale,
    );
  };

  const priceLine = useMemo(() => {
    if (!variant) return null;
    return (
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <p
          className="font-serif text-heading-1 tabular-nums"
          aria-live="polite"
        >
          {formatMoney(variant.price, view.currency)}
        </p>
        {variant.units > 1 && (
          <p className="text-body-sm text-ink-soft tabular-nums">
            {formatMoney(variant.perUnit, view.currency)} per set
          </p>
        )}
        {variant.savings && (
          <p className="rounded-tag bg-clay-50 px-2.5 py-1 text-body-sm font-medium text-clay-600 tabular-nums">
            You save {formatMoney(variant.savings, view.currency)} vs.{" "}
            {variant.units} single sets
          </p>
        )}
      </div>
    );
  }, [variant, view.currency]);

  return (
    <div>
      {priceLine}
      <p className="mt-1 text-body-sm text-ink-soft">
        Taxes and shipping calculated at checkout.
      </p>

      <div className="mt-8 space-y-7">
        {view.options.map((option) => {
          const isPack = option.name === view.packOptionName;
          return (
            <fieldset key={option.name}>
              <legend className="mb-3 flex w-full items-baseline justify-between text-body-sm font-semibold">
                {option.label}
                <span className="font-normal text-ink-soft">
                  {
                    option.values.find(
                      (v) => v.value === selection[option.name],
                    )?.label
                  }
                </span>
              </legend>
              <div
                className={cn(
                  "grid gap-2.5",
                  isPack ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3",
                )}
              >
                {option.values.map((value) => {
                  const available = optionAvailable(option.name, value.value);
                  // A set that lacks the current pack size is still selectable (the pack adjusts);
                  // only pack sizes the chosen set doesn't come in are unavailable.
                  const exists =
                    !isPack ||
                    Boolean(
                      findVariant(view, {
                        ...selection,
                        [option.name]: value.value,
                      }),
                    );
                  const checked = selection[option.name] === value.value;
                  const combo = findVariant(view, {
                    ...selection,
                    [option.name]: value.value,
                  });
                  return (
                    <label
                      key={value.value}
                      data-checked={checked}
                      data-disabled={!exists}
                      className={cn(
                        "option-card flex min-h-16 flex-col justify-center gap-0.5 px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-600",
                        isPack && "items-start",
                      )}
                    >
                      <input
                        type="radio"
                        name={option.name}
                        value={value.value}
                        checked={checked}
                        onChange={() => choose(option.name, value.value)}
                        disabled={isPack && !exists}
                        className="sr-only"
                        aria-describedby={
                          !exists
                            ? `${option.name}-${value.value}-na`
                            : undefined
                        }
                      />
                      <span className="text-body-sm font-medium">
                        {value.label}
                      </span>
                      {isPack && combo && (
                        <span className="text-body-sm text-ink-soft tabular-nums">
                          {formatMoney(combo.price, view.currency)}
                        </span>
                      )}
                      {isPack && combo?.savings && (
                        <span className="text-[0.75rem] font-medium text-clay-600">
                          Save {formatMoney(combo.savings, view.currency)}
                        </span>
                      )}
                      {(!exists || (exists && !available)) && (
                        <span
                          id={`${option.name}-${value.value}-na`}
                          className="text-[0.75rem] text-ink-soft"
                        >
                          {!exists ? "Not available in this set" : "Sold out"}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              {!isPack &&
                option.values.find((v) => v.value === selection[option.name])
                  ?.description && (
                  <p className="mt-3 text-body-sm text-ink-soft">
                    {
                      option.values.find(
                        (v) => v.value === selection[option.name],
                      )?.description
                    }
                  </p>
                )}
            </fieldset>
          );
        })}
      </div>

      <div className="mt-9 grid gap-2.5 sm:grid-cols-[1.6fr_1fr]">
        <button
          ref={buttonRef}
          type="button"
          className="btn-primary w-full"
          onClick={onAdd}
          disabled={!canBuy}
        >
          {!variant ? (
            "Choose your options"
          ) : !canBuy ? (
            "Sold out"
          ) : added ? (
            <>
              <Icon name="check" className="size-4" /> Added to bag
            </>
          ) : (
            "Add to bag"
          )}
        </button>
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={onBuyNow}
          disabled={!canBuy || buying}
        >
          {buying ? "Opening secure checkout…" : "Buy now"}
        </button>
        {error && (
          <p role="alert" className="text-body-sm text-error">
            {error}
          </p>
        )}
      </div>

      {/* Sticky mobile bar */}
      <div
        className={cn(
          "glass fixed inset-x-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-20 rounded-[20px] p-3 pl-5 transition-transform duration-500 ease-out-soft lg:hidden",
          showSticky ? "translate-y-0" : "translate-y-[calc(100%+1.5rem)]",
        )}
        aria-hidden={!showSticky}
        inert={!showSticky}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-heading-3">
              {variant?.label ?? view.name}
            </p>
            <p className="text-body-sm text-ink-soft tabular-nums">
              {variant ? formatMoney(variant.price, view.currency) : ""}
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={added ? open : onAdd}
            disabled={!canBuy}
          >
            {added ? "View bag" : "Add to bag"}
          </button>
        </div>
      </div>
    </div>
  );
}
