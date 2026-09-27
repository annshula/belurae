"use client";

import { useEffect, useState } from "react";

/** Digits only, no design decisions — remaining time to a real, merchant-set Shopify deadline. */
function remaining(target: number): { hours: number; minutes: number; seconds: number } | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const totalSeconds = Math.floor(ms / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/**
 * Offer countdown — only ever renders a deadline the merchant actually set in
 * Shopify (`custom.sale_ends_at`); the sync engine already drops past dates,
 * and this component hides itself the moment the real deadline passes rather
 * than freezing at 00:00:00 or looping.
 *
 * Starts as `null` on both the server and the client's first paint — the
 * exact countdown text depends on the visitor's clock the moment their page
 * loads, which the server can never predict (worse still with ISR: the HTML
 * may have been generated minutes or hours earlier). Computing it eagerly in
 * `useState`'s initializer would make the server-rendered text disagree with
 * what the client immediately recomputes, which is a React hydration-mismatch
 * error (#418), not just a visual flicker. Filling it in from an effect after
 * mount avoids that entirely, at the cost of one tick where nothing renders.
 */
export function SaleCountdown({ endsAt }: { endsAt: string }) {
  const target = Date.parse(endsAt);
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);

  useEffect(() => {
    setLeft(remaining(target));
    const id = setInterval(() => setLeft(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!left) return null;

  return (
    <p
      className="inline-flex items-center gap-2 rounded-tag bg-clay-50 px-3 py-1.5 font-numeral text-body-sm font-medium text-clay-600 tabular-nums"
      role="timer"
      aria-live="off"
    >
      Offer ends in {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)}
    </p>
  );
}
