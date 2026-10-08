/**
 * Quantity-break pricing ("buy more, save more") for products that sell every
 * pack as the SAME variant at a higher cart quantity: one SKU, so the supplier
 * simply ships N units of it. The percentages here only mirror the automatic
 * discounts configured in Shopify Admin (Discounts → "<Product> Pack - Buy 2
 * Save 20%" and so on). Shopify applies them at checkout and is what actually
 * charges. Change a number in Shopify and here together, or the price on the
 * page and the price at checkout drift apart.
 *
 * Plain data and arithmetic only, so server and client components share it.
 */

export type PackTier = {
  /** Cart quantity at which this tier starts (the Shopify minimum quantity). */
  size: number;
  /** Percent off the whole line at this quantity. */
  discountPercent: number;
};

/** The discount for `quantity`: the highest tier it has reached, so 4+ keeps the 3-pack rate. */
export function tierPercent(
  tiers: readonly PackTier[] | null | undefined,
  quantity: number,
): number {
  if (!tiers) return 0;
  let percent = 0;
  for (const t of tiers) {
    if (quantity >= t.size && t.discountPercent > percent) {
      percent = t.discountPercent;
    }
  }
  return percent;
}

/**
 * What `quantity` units cost, and the struck-through price beside it.
 *
 * `total` is the unit price × quantity less the tier's percent: what Shopify
 * charges. `full` is the same units at the unit's own compare-at price when
 * Shopify has one (exactly how the other products' packs are shown), otherwise
 * at the plain unit price, and it only differs from `total` when there is
 * something to strike through. `percent` is the saving that struck-through
 * price represents, so the badge always agrees with the two numbers beside it.
 */
export function tierPrice(
  unitPrice: number,
  quantity: number,
  tiers: readonly PackTier[] | null | undefined,
  compareAtUnit: number | null = null,
): { percent: number; total: number; full: number } {
  const discount = tierPercent(tiers, quantity);
  const total =
    Math.round(unitPrice * quantity * (1 - discount / 100) * 100) / 100;
  const base =
    compareAtUnit != null && compareAtUnit > unitPrice
      ? compareAtUnit
      : unitPrice;
  const gross = Math.round(base * quantity * 100) / 100;
  const full = gross > total + 0.004 ? gross : total;
  const percent = full > total ? Math.round((1 - total / full) * 100) : 0;
  return { percent, total, full };
}
