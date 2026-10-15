"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/CartProvider";
import { Icon } from "@/components/ui/Icon";
import { PaymentIcons } from "@/components/ui/PaymentIcons";
import { Stars } from "@/components/ui/Stars";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEPT",
  "OCT",
  "NOV",
  "DEC",
];

/** Month + pack + saved %, e.g. 3 Pack saving 47% in October → OCTP347. */
function couponCode(units: number, percent: number) {
  return `${MONTHS[new Date().getMonth()]}P${units}${percent}`;
}

/** Quantity-break lines read "2 Pack", like the product page cards; everything else keeps its variant label. */
function packLabel(line: {
  tiers: unknown;
  quantity: number;
  variantLabel: string;
}) {
  return line.tiers ? `${line.quantity} Pack` : line.variantLabel;
}

/**
 * Bag body shared by the drawer and the /cart page: lines, subtotal, checkout.
 * `onNavigate` closes the drawer when a link is followed.
 */
export function BagContents({ onNavigate }: { onNavigate?: () => void }) {
  const {
    lines,
    subtotal,
    discount,
    currency,
    shippingValue,
    upsells,
    add,
    setQuantity,
    remove,
    checkout,
    hydrated,
    payments,
  } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  if (!hydrated) {
    return (
      <div className="flex-1 p-6 text-body-sm text-ink-soft">
        Loading your bag…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-start gap-5 p-6">
        <p className="font-serif text-heading-2">Your bag is empty.</p>
        <p className="text-body-sm text-ink-soft">
          Start with our hair removal mousse, or read how it works first.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/collections/hair-removal"
            className="btn-primary"
            onClick={onNavigate}
          >
            Shop hair removal
          </Link>
          <Link
            href="/guides/how-to-use-hair-removal-mousse"
            className="btn-quiet"
            onClick={onNavigate}
          >
            How it works
          </Link>
        </div>
      </div>
    );
  }

  /* The label of each pack discount applied, e.g. OCTP347 (month · pack · saved %). */
  const codes = lines.map((l) =>
    l.savedPercent != null
      ? couponCode(l.tiers ? l.quantity : l.units, l.savedPercent)
      : null,
  );
  const appliedCodes = [
    ...new Set(codes.filter((c): c is string => c !== null)),
  ];
  const discountTag = appliedCodes.join(" · ");
  const couponCount = appliedCodes.length;

  const onCheckout = async () => {
    setPending(true);
    setError(null);
    const result = await checkout();
    if (!result.ok) {
      setError(result.error);
      setPending(false);
    }
  };

  return (
    <>
      <ul
        className="flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain px-3 py-2"
        aria-label="Items in your bag"
      >
        {lines.map((line, i) => {
          const hasCoupon = Boolean(codes[i]) && line.savedPercent != null;
          /* Packs (separate variants or quantity breaks) are chosen on the
             product page, so these lines have no quantity stepper. */
          const fixedPack = line.hasPackOption || Boolean(line.tiers);
          const removeButton = (
            <button
              type="button"
              onClick={() => remove(line.variantId)}
              className="ml-auto grid size-7 shrink-0 place-items-center rounded-tag text-ink-soft hover:bg-sand hover:text-ink"
            >
              <Icon name="trash" className="size-4" />
              <span className="sr-only">Remove {line.productName}</span>
            </button>
          );
          return (
            <li
              key={line.variantId}
              className="flex gap-3 rounded-card bg-porcelain p-2.5 shadow-soft"
            >
              <Link
                href={line.href}
                onClick={onNavigate}
                className={cn(
                  "well relative size-16 shrink-0 overflow-hidden rounded-xl",
                  line.upsell && "pointer-events-none",
                )}
                tabIndex={-1}
                aria-hidden="true"
              >
                {line.image && (
                  <Image
                    src={line.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain mix-blend-multiply"
                  />
                )}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={line.href}
                      onClick={onNavigate}
                      title={line.productName}
                      className={cn(
                        "block truncate text-[0.8125rem] leading-snug font-medium hover:underline",
                        line.upsell && "pointer-events-none hover:no-underline",
                      )}
                    >
                      {line.productName}
                    </Link>
                    {!hasCoupon && (
                      <p className="text-[0.72rem] text-ink-soft">
                        {packLabel(line)}
                      </p>
                    )}
                  </div>
                  <p className="flex shrink-0 flex-col items-end font-numeral tabular-nums">
                    <span className="text-[0.8125rem] font-medium">
                      {formatMoney(line.lineTotal, currency)}
                    </span>
                    {!hasCoupon && line.compareAtTotal > line.lineTotal && (
                      <span className="text-[0.7rem] text-ink-faint line-through">
                        {formatMoney(line.compareAtTotal, currency)}
                      </span>
                    )}
                  </p>
                </div>
                {hasCoupon && (
                  <>
                    {/* Line 2: pack + saving badge. Line 3: coupon icon + code, with remove. */}
                    <div className="flex items-center justify-between gap-2 text-[0.72rem]">
                      <p className="flex min-w-0 items-center gap-1.5">
                        <span className="font-medium text-ink">
                          {packLabel(line)}
                        </span>
                        <span className="rounded-tag bg-clay-100 px-1.5 py-0.5 font-numeral text-[0.7rem] leading-none font-medium text-clay-600 tabular-nums">
                          Saved {line.savedPercent}%
                        </span>
                      </p>
                      {line.compareAtTotal > line.lineTotal && (
                        <span className="shrink-0 font-numeral text-[0.7rem] text-ink-faint tabular-nums line-through">
                          {formatMoney(line.compareAtTotal, currency)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1 text-[0.7rem] text-ink-soft">
                        <Icon
                          name="tag"
                          className="size-3 shrink-0 text-clay-600"
                        />
                        <span className="font-numeral font-semibold tracking-wide text-clay-600">
                          {codes[i]}
                        </span>
                        coupon applied
                      </p>
                      {/* Lines with a stepper keep delete beside it, below. */}
                      {fixedPack && removeButton}
                    </div>
                  </>
                )}
                <div
                  className={cn(
                    "mt-auto flex items-center justify-between pt-1.5",
                    fixedPack && hasCoupon && "hidden",
                  )}
                >
                  {fixedPack ? null : (
                    <div
                      className="flex items-center rounded-tag bg-cream"
                      role="group"
                      aria-label={`Quantity for ${line.productName}`}
                    >
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-tag hover:bg-sand"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setQuantity(line.variantId, line.quantity - 1)
                        }
                      >
                        <Icon name="minus" className="size-3.5" />
                      </button>
                      <span
                        className="w-6 text-center text-[0.8125rem] tabular-nums"
                        aria-live="polite"
                      >
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        className="grid size-8 place-items-center rounded-tag hover:bg-sand disabled:opacity-40"
                        aria-label="Increase quantity"
                        disabled={line.quantity >= 10}
                        onClick={() =>
                          setQuantity(line.variantId, line.quantity + 1)
                        }
                      >
                        <Icon name="plus" className="size-3.5" />
                      </button>
                    </div>
                  )}
                  {(!hasCoupon || !fixedPack) && removeButton}
                </div>
              </div>
            </li>
          );
        })}
        {upsells.map((u) => {
          const rating = u.upsell?.rating ?? null;
          return (
            <li
              key={u.variantId}
              className="rounded-card border border-dashed border-sage-300 bg-sage-50 p-3"
            >
              <p className="font-ui text-[0.68rem] font-semibold tracking-[0.08em] text-sage-800 uppercase">
                Add to your order
              </p>
              <div className="mt-2 flex gap-3">
                <span className="well relative size-16 shrink-0 overflow-hidden rounded-xl">
                  {u.image && (
                    <Image
                      src={u.image}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-contain mix-blend-multiply"
                    />
                  )}
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    {/* Title, rating, description and price stack in one
                        column, so the description sits right under the title
                        whatever the height of the price beside them. */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.8125rem] leading-snug font-medium">
                        {u.productName}
                      </p>
                      {/* The offer's own rating, shown the way the product
                          page shows it: stars, average, then the count. */}
                      {rating && (
                        <p
                          className="mt-1 flex items-center gap-1.5"
                          aria-label={`Rated ${rating.value.toFixed(1)} out of 5 from ${rating.count.toLocaleString("en-US")} reviews`}
                        >
                          <Stars
                            value={rating.value}
                            starClassName="size-3.5"
                          />
                          <span className="font-numeral text-[0.72rem] font-semibold tabular-nums">
                            {rating.value.toFixed(1)}
                          </span>
                          <span className="font-numeral text-[0.72rem] text-ink-soft tabular-nums">
                            ({rating.count.toLocaleString("en-US")})
                          </span>
                        </p>
                      )}
                      <p className="mt-1 text-[0.72rem] leading-snug text-ink-soft">
                        {u.upsell?.blurb}
                      </p>
                      {/* The standard primary button at a size that fits the
                          offer card: the bag's add-to-bag button is a full
                          width, 52px page CTA, which is too heavy here. */}
                      <button
                        type="button"
                        className="btn-primary mt-2.5 min-h-10 self-start px-4 text-[0.75rem]"
                        onClick={() => add(u.variantId, 1)}
                      >
                        Add to order
                      </button>
                    </div>
                    <p className="flex shrink-0 flex-col items-end font-numeral tabular-nums">
                      <span className="text-[0.8125rem] font-medium">
                        {formatMoney(u.price, currency)}
                      </span>
                      {u.compareAtPrice != null && (
                        <span className="text-[0.7rem] text-ink-faint line-through">
                          {formatMoney(u.compareAtPrice, currency)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          "m-3 mt-3 rounded-[20px] bg-porcelain px-4 shadow-float",
          summaryOpen
            ? "pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        )}
      >
        {/* Short summary above the button; the full breakdown opens on click. */}
        {!summaryOpen && (
          <button
            type="button"
            className="flex w-full items-center gap-3 text-left"
            aria-expanded={false}
            aria-controls="bag-summary"
            onClick={() => setSummaryOpen(true)}
          >
            <span
              aria-hidden="true"
              className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-sage-100 text-sage-600"
            >
              <Icon name="truck" className="size-4.5" />
              <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border-2 border-porcelain bg-success text-white">
                <Icon name="check" className="size-2.5" strokeWidth={3} />
              </span>
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-[0.8125rem] font-semibold">
                Free shipping
              </span>
              <span className="mt-1 block text-[0.72rem] text-ink-soft">
                {discount > 0.009
                  ? `You save ${formatMoney(discount, currency)}`
                  : "Tracked delivery"}
              </span>
            </span>
            <span className="font-numeral text-[0.95rem] font-semibold tabular-nums">
              {formatMoney(subtotal, currency)}
            </span>
            <Icon
              name="chevron-down"
              className="size-4 shrink-0 text-ink-soft"
            />
            <span className="sr-only">Show order summary</span>
          </button>
        )}

        {summaryOpen && (
          <div id="bag-summary">
            {/* Free shipping on every order. */}
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="relative grid size-9 shrink-0 place-items-center rounded-xl bg-sage-100 text-sage-600"
              >
                <Icon name="truck" className="size-5" />
                <span className="absolute -right-1 -bottom-1 grid size-4 place-items-center rounded-full border-2 border-porcelain bg-success text-white">
                  <Icon name="check" className="size-2.5" strokeWidth={3} />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-semibold">Free shipping</p>
                <p className="text-[0.72rem] leading-snug text-ink-soft">
                  Tracked delivery on every order.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="flex items-baseline gap-1.5 font-numeral text-[0.8125rem] tabular-nums">
                  {shippingValue != null && (
                    <span className="text-[0.72rem] text-ink-faint line-through">
                      {formatMoney(shippingValue, currency)}
                    </span>
                  )}
                  <span className="font-semibold text-sage-600">FREE</span>
                </p>
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-600 py-0.5 pr-2 pl-1.5 text-[0.68rem] leading-none font-semibold text-ivory">
                  <Icon name="check" className="size-3" strokeWidth={3} />
                  Added
                </span>
              </div>
            </div>

            <dl className="mt-3 space-y-1.5 border-t border-sand pt-3 text-[0.8125rem]">
              {discount > 0.009 && (
                <>
                  <div className="flex items-center justify-between">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="font-numeral tabular-nums text-ink-soft">
                      {formatMoney(subtotal + discount, currency)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="flex flex-wrap items-center gap-1.5 text-ink-soft">
                      Discounts
                      <span
                        className="inline-flex items-center gap-1 rounded-tag bg-cream px-1.5 py-0.5 font-numeral text-[0.7rem] leading-none text-ink-soft tabular-nums"
                        title={discountTag}
                        aria-label={`${couponCount} coupon${couponCount === 1 ? "" : "s"} applied`}
                      >
                        <Icon name="tag" className="size-3 text-clay-600" />
                        {couponCount}
                      </span>
                      <span className="font-numeral text-[0.7rem] font-semibold text-clay-600 tabular-nums">
                        {Math.round((discount / (subtotal + discount)) * 100)}%
                        off
                      </span>
                    </dt>
                    <dd className="font-numeral tabular-nums text-clay-600">
                      −{formatMoney(discount, currency)}
                    </dd>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between border-t border-dashed border-sand pt-2 text-[0.95rem]">
                <dt className="font-semibold">Total</dt>
                <dd className="font-numeral font-semibold tabular-nums">
                  {formatMoney(subtotal, currency)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              className="mx-auto mt-2 flex items-center gap-1 text-[0.72rem] font-medium text-ink-soft hover:text-ink"
              aria-expanded
              aria-controls="bag-summary"
              onClick={() => setSummaryOpen(false)}
            >
              Hide details
              <Icon name="chevron-down" className="size-3.5 rotate-180" />
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-[0.8125rem] text-error">
            {error}
          </p>
        )}
        <button
          type="button"
          className="btn-primary mt-3 w-full"
          onClick={onCheckout}
          disabled={pending}
        >
          {pending
            ? "Opening secure checkout…"
            : `Checkout • ${formatMoney(subtotal, currency)}`}
        </button>
        <PaymentIcons methods={payments} className="mt-2" />
      </div>
    </>
  );
}
