import { NextRequest, NextResponse } from "next/server";

import { beluraeVariantIndex } from "@/lib/catalog";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { isStorefrontConfigured } from "@/lib/shopify/config";
import { createCart } from "@/lib/shopify/storefront";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/cart/checkout — turns the browser bag into a Shopify Storefront
 * cart and returns Shopify's hosted checkout URL.
 *
 * Trust model: the client sends only variant ids + quantities. Every id must
 * be a Belurae variant in the synced catalog (the store is shared with other
 * brands), quantities are clamped, and Shopify prices the cart itself — no
 * price, discount or inventory value is ever accepted from the browser.
 */

const GID = /^gid:\/\/shopify\/ProductVariant\/\d{1,20}$/;
const MAX_LINES = 20;
const MAX_QTY = 10;

const json = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return json({ error: "Invalid origin." }, 403);
  }
  if (!rateLimit(`checkout:${clientIp(request.headers)}`, 20, 60_000)) {
    return json({ error: "Too many attempts. Please wait a moment and try again." }, 429);
  }
  if (!isStorefrontConfigured()) {
    return json({ error: "Checkout is temporarily unavailable." }, 503);
  }

  const raw = await request.text();
  if (raw.length > 8_000) return json({ error: "Request too large." }, 413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const input = (body as { lines?: unknown })?.lines;
  if (!Array.isArray(input) || input.length === 0 || input.length > MAX_LINES) {
    return json({ error: "Your bag is empty." }, 400);
  }

  const known = await beluraeVariantIndex();
  const merged = new Map<string, number>();
  for (const line of input) {
    const id = (line as { variantId?: unknown })?.variantId;
    const qty = Number((line as { quantity?: unknown })?.quantity);
    if (typeof id !== "string" || !GID.test(id) || !known.has(id)) continue;
    if (!Number.isInteger(qty) || qty < 1) continue;
    merged.set(id, Math.min(MAX_QTY, (merged.get(id) ?? 0) + qty));
  }
  if (merged.size === 0) {
    return json({ error: "The items in your bag are no longer available." }, 400);
  }

  const country = request.headers.get("x-vercel-ip-country");
  const countryCode = country && /^[A-Z]{2}$/.test(country) ? country : null;

  try {
    const cart = await createCart(
      [...merged].map(([merchandiseId, quantity]) => ({ merchandiseId, quantity })),
      { countryCode },
    );
    const url = new URL(cart.checkoutUrl);
    if (url.protocol !== "https:") throw new Error("Unexpected checkout URL");
    return json({ checkoutUrl: cart.checkoutUrl });
  } catch (error) {
    console.error("[cart/checkout] cartCreate failed:", (error as Error).message);
    return json({ error: "We couldn't start checkout. Please try again." }, 502);
  }
}
