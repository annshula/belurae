import { NextRequest, NextResponse } from "next/server";

import { BELURAE_HANDLES } from "@/content/products";
import { feedPage, parseFilter, reviewSetFor } from "@/lib/reviews/feed";

/**
 * GET /api/reviews?handle=…&filter=all|photo|1-5&page=N — one page (8) of a
 * product's review feed. Public reviews, nothing per-visitor, so it is cached
 * at the edge: the first visitor to ask for a page pays for it, the rest get it
 * from the CDN.
 */

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const handle = params.get("handle") ?? "";
  // Only our own products — never a way to make the server fetch arbitrary
  // Judge.me handles.
  if (!BELURAE_HANDLES.includes(handle)) {
    return NextResponse.json({ error: "Unknown product" }, { status: 404 });
  }

  const set = await reviewSetFor(handle);
  if (!set) {
    return NextResponse.json({ error: "No reviews" }, { status: 404 });
  }

  const page = feedPage(
    set,
    parseFilter(params.get("filter")),
    Number(params.get("page")),
  );
  return NextResponse.json(page, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
