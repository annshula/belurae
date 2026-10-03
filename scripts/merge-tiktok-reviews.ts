/**
 * Folds a second TikTok Shop export into an existing raw one, dropping
 * duplicates (same name, date and text).
 *
 *   npx tsx scripts/merge-tiktok-reviews.ts <base.raw.json> <extra.json> "<filter label>"
 *   e.g. data/reviews/source/toner-tiktok.raw.json toner_5star.json "5 star only"
 *
 * Pass the label only when the extra export was scraped with a star filter:
 * every review it adds is tagged `filter_phase: <label>`, and
 * `import-tiktok-reviews.ts` leaves tagged reviews out of the site unless told
 * otherwise, because a feed and an average built from only the good ratings is
 * not what the listing's buyers said. Omit the label for an unfiltered export.
 */

import { readFileSync, writeFileSync } from "node:fs";

type Raw = {
  reviews: {
    reviewer_name: string;
    date: string;
    review_text?: string;
    filter_phase?: string;
  }[];
  [key: string]: unknown;
};

const [basePath, extraPath, label] = process.argv.slice(2);
if (!basePath || !extraPath) {
  console.error(
    'usage: tsx scripts/merge-tiktok-reviews.ts <base.raw.json> <extra.json> ["<filter label>"]',
  );
  process.exit(1);
}

const base = JSON.parse(readFileSync(basePath, "utf8")) as Raw;
const extra = JSON.parse(readFileSync(extraPath, "utf8")) as Raw;

const key = (r: Raw["reviews"][number]) =>
  [r.reviewer_name, r.date, (r.review_text ?? "").trim()].join("|");

const seen = new Set(base.reviews.map(key));
let dupes = 0;
const added: Raw["reviews"] = [];
for (const r of extra.reviews) {
  if (seen.has(key(r))) {
    dupes += 1;
    continue;
  }
  seen.add(key(r));
  added.push(label ? { ...r, filter_phase: r.filter_phase ?? label } : r);
}

const merged: Raw = {
  ...base,
  merged_at: new Date().toISOString(),
  note: "reviews with filter_phase were scraped with a star filter, so they are not a representative sample; reviews without it are from an unfiltered scrape",
  review_count: base.reviews.length + added.length,
  reviews: [...base.reviews, ...added],
};
writeFileSync(basePath, JSON.stringify(merged, null, 2) + "\n");
console.log(
  `${base.reviews.length} existing + ${added.length} added (${dupes} duplicates removed) = ${merged.reviews.length}`,
);
