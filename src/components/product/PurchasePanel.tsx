"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { SaleCountdown } from "@/components/product/SaleCountdown";
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

/**
 * "Choose your pack" — one full-width row per pack size, not a 3-up grid.
 * A row is easier to compare (price, per-unit cost and savings sit on the
 * same line) and gives the middle size room for a merchandising badge.
 * The badge is a recommendation we're making, not a sales-data claim — it
 * sits on the middle size only because that's genuinely where the per-unit
 * price first drops meaningfully, not because of invented "X people bought
 * this" style numbers.
 */
function PackFieldset({
  option,
  selection,
  view,
  onChoose,
  optionAvailable,
}: {
  option: ProductView["options"][number];
  selection: Record<string, string>;
  view: ProductView;
  onChoose: (name: string, value: string) => void;
  optionAvailable: (name: string, value: string) => boolean;
}) {
  const name = option.name;
  const middleIndex =
    option.values.length >= 3 ? Math.floor(option.values.length / 2) : -1;
  const lastIndex = option.values.length - 1;

  return (
    <fieldset>
      <legend className="mb-4 text-body-sm font-semibold">
        {option.label}
      </legend>
      <div className="flex flex-col gap-3">
        {option.values.map((value, i) => {
          const available = optionAvailable(name, value.value);
          const exists = Boolean(
            findVariant(view, { ...selection, [name]: value.value }),
          );
          const checked = selection[name] === value.value;
          const combo = findVariant(view, {
            ...selection,
            [name]: value.value,
          });
          const recommended = i === middleIndex && exists;
          const bestValue =
            i === lastIndex && i !== middleIndex && exists;

          return (
            <label
              key={value.value}
              data-checked={checked}
              data-disabled={!exists}
              className={cn(
                "group relative flex cursor-pointer flex-row items-center gap-4 rounded-card border-2 border-transparent bg-porcelain px-5 py-4 shadow-soft transition-all duration-200 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-600",
                checked
                  ? "border-sage-600 bg-sage-100 shadow-none"
                  : "hover:border-sand hover:shadow-float",
                !exists &&
                  "cursor-not-allowed opacity-50 hover:border-transparent hover:shadow-soft",
              )}
            >
              <input
                type="radio"
                name={name}
                value={value.value}
                checked={checked}
                onChange={() => onChoose(name, value.value)}
                disabled={!exists}
                className="sr-only"
                aria-describedby={
                  !exists ? `${name}-${value.value}-na` : undefined
                }
              />

              {/* Radio dot */}
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200",
                  checked
                    ? "border-sage-600 bg-sage-600"
                    : "border-sand bg-ivory",
                )}
              >
                {checked && <span className="size-1.5 rounded-full bg-ivory" />}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-body-sm font-semibold">
                    {value.label}
                  </span>
                  {recommended && (
                    <span className="inline-flex items-center rounded-tag bg-sage-600 px-2 py-0.5 font-headline text-[0.62rem] leading-none font-semibold tracking-wider text-ivory uppercase">
                      Most popular
                    </span>
                  )}
                  {bestValue && (
                    <span className="inline-flex items-center rounded-tag bg-clay-600 px-2 py-0.5 font-headline text-[0.62rem] leading-none font-semibold tracking-wider text-ivory uppercase">
                      Best value
                    </span>
                  )}
                  {combo && combo.compareAtPercent && (
                    <span className="rounded-tag bg-clay-50 px-2 py-0.5 font-numeral text-[0.66rem] font-semibold tracking-[0.02em] text-clay-600 tabular-nums">
                      −{combo.compareAtPercent}%
                    </span>
                  )}
                </span>
                {combo && combo.units > 1 && (
                  <span className="mt-0.5 block font-numeral text-[0.75rem] text-ink-soft tabular-nums">
                    {formatMoney(combo.perUnit, view.currency)} / set
                  </span>
                )}
                {!exists && (
                  <span
                    id={`${name}-${value.value}-na`}
                    className="mt-0.5 block text-[0.75rem] text-ink-soft"
                  >
                    Not available in this set
                  </span>
                )}
                {exists && !available && (
                  <span
                    id={`${name}-${value.value}-na`}
                    className="mt-0.5 block text-[0.75rem] text-ink-soft"
                  >
                    Sold out
                  </span>
                )}
              </span>

              {combo && (
                <span className="flex shrink-0 flex-col items-end">
                  {combo.compareAtPrice && (
                    <span className="font-numeral text-[0.68rem] text-ink-soft tabular-nums line-through">
                      {formatMoney(combo.compareAtPrice, view.currency)}
                    </span>
                  )}
                  <span className="font-numeral text-heading-3 font-semibold tabular-nums">
                    {formatMoney(combo.price, view.currency)}
                  </span>
                  {combo.savings && (
                    <span className="font-numeral text-[0.72rem] font-medium text-clay-600 tabular-nums">
                      Save {formatMoney(combo.savings, view.currency)}
                    </span>
                  )}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {variant.compareAtPrice && (
            <p className="font-numeral text-body-sm text-ink-soft tabular-nums line-through">
              {formatMoney(variant.compareAtPrice, view.currency)}
            </p>
          )}
          <p
            className="font-numeral text-heading-3 font-semibold tabular-nums"
            aria-live="polite"
          >
            {formatMoney(variant.price, view.currency)}
          </p>
          {variant.compareAtPercent && (
            <p className="rounded-tag bg-clay-600 px-2.5 py-1 font-numeral text-[0.8rem] font-bold tracking-wide text-ivory tabular-nums">
              −{variant.compareAtPercent}% OFF
            </p>
          )}
          {variant.units > 1 && (
            <p className="font-numeral text-body-sm text-ink-soft tabular-nums">
              {formatMoney(variant.perUnit, view.currency)} per set
            </p>
          )}
        </div>
        {variant.savings && (
          <p className="font-numeral text-body-sm text-clay-600 tabular-nums">
            You save {formatMoney(variant.savings, view.currency)} vs. {variant.units}{" "}
            single {variant.units === 1 ? "set" : "sets"}
          </p>
        )}
        {view.saleEndsAt && <SaleCountdown endsAt={view.saleEndsAt} />}
      </div>
    );
  }, [variant, view.currency, view.saleEndsAt]);

  return (
    <div>
      <div className="space-y-7">
        {view.options.map((option) => {
          const isPack = option.name === view.packOptionName;

          if (isPack) {
            return (
              <PackFieldset
                key={option.name}
                option={option}
                selection={selection}
                view={view}
                onChoose={choose}
                optionAvailable={optionAvailable}
              />
            );
          }

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
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {option.values.map((value) => {
                  const available = optionAvailable(option.name, value.value);
                  const checked = selection[option.name] === value.value;
                  return (
                    <label
                      key={value.value}
                      data-checked={checked}
                      data-disabled={!available}
                      className="option-card flex min-h-16 flex-col justify-center gap-0.5 px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-sage-600"
                    >
                      <input
                        type="radio"
                        name={option.name}
                        value={value.value}
                        checked={checked}
                        onChange={() => choose(option.name, value.value)}
                        className="sr-only"
                        aria-describedby={
                          !available
                            ? `${option.name}-${value.value}-na`
                            : undefined
                        }
                      />
                      <span className="text-body-sm font-medium">
                        {value.label}
                      </span>
                      {!available && (
                        <span
                          id={`${option.name}-${value.value}-na`}
                          className="text-[0.75rem] text-ink-soft"
                        >
                          Sold out
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <div className="mt-9">
        {priceLine}
        <button
          ref={buttonRef}
          type="button"
          className="btn-primary mt-4 w-full"
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
        <p className="mt-3 flex items-center justify-center gap-2 text-body-sm text-ink-soft">
          <Icon name="shield" className="size-4 shrink-0" />
          Secure payment by Shopify
        </p>
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
            <p className="font-numeral text-body-sm font-medium text-ink-soft tabular-nums">
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
