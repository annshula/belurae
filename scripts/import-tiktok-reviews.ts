/**
 * Turns a TikTok Shop review export into the shape the site's review UI reads,
 * and copies each review's photos onto our own host (TikTok's image links are
 * signed and expire within days).
 *
 *   npx tsx scripts/import-tiktok-reviews.ts <raw.json> <out.json> <photo-dir> <photo-prefix>
 *   e.g. data/reviews/source/toner-tiktok.raw.json data/reviews/toner-tiktok.json public/reviews/toner tt
 *
 * What it keeps: rating, text, the (already masked) name, country and review
 * date. What it leaves out on purpose: `verified_purchase` — a TikTok "verified
 * purchase" is not a purchase from this store, so nothing here marks anyone a
 * verified buyer here. Each review is tagged `source: "tiktok"` so the UI can
 * say where it came from.
 *
 * Two flags read the rest of the export, both off by default:
 *
 *   --variants        the pack, from TikTok's own variant label ("Spray 2PC" and
 *                     "1 Pack" both read as "1 Pack"). Off by default: a listing
 *                     whose variant is just "Default" says nothing about a pack.
 *   --purchase-dates  the day they ordered (`purchase_date` → `purchasedAt`),
 *                     when the export carries one — the toner's has it on about
 *                     6% of reviews, the mousse's on about 38%. Nothing is
 *                     invented for the rest: a card shows the pack alone rather
 *                     than a made-up date. A date on or after the review itself
 *                     is dropped as a mistake.
 *
 * Photos (`--photos`) and profile pictures (`--avatars`) are OFF by default.
 * They can show a face or a home, and they came from another platform, not from
 * people who agreed to appear on this store: only turn them on for an export
 * you have the right to use. Even then, photos on a review whose text mentions
 * a home or an address are withheld. Files are named by a hash of the review,
 * so re-running after a merge never attaches a photo to the wrong one.
 *
 * `--remote-photos` (with --photos) links review photos straight to TikTok's
 * own image URLs instead of downloading copies; the review UI hides any photo
 * that no longer loads. Profile pictures (--avatars) are always downloaded:
 * their signed links expire within days.
 *
 * Re-runnable: photos already on disk are not downloaded again.
 */

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

type RawReview = {
  reviewer_name: string;
  country?: string;
  rating: number;
  review_text?: string;
  item_variant?: string;
  filter_phase?: string;
  date: string;
  purchase_date?: string;
  media_urls?: string[];
  profile_pic_url?: string;
};

const COUNTRIES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
};

const remotePhotos = process.argv.includes("--remote-photos");
const withPhotos = process.argv.includes("--photos");
const withAvatars = process.argv.includes("--avatars");
const withVariants = process.argv.includes("--variants");
const withPurchaseDates = process.argv.includes("--purchase-dates");
const includeFiltered = process.argv.includes("--include-filtered");
const [rawPath, outPath, photoDir, prefix = "tt"] = process.argv
  .slice(2)
  .filter((arg) => !arg.startsWith("--"));
if (!rawPath || !outPath || !photoDir) {
  console.error(
    "usage: tsx scripts/import-tiktok-reviews.ts <raw.json> <out.json> <photo-dir> [photo-prefix] [--photos] [--avatars] [--variants] [--purchase-dates] [--include-filtered] [--remote-photos]",
  );
  process.exit(1);
}

/**
 * TikTok's own variant label as a pack count ("Spray 2PC" and "1 Pack" both →
 * "1 Pack"), only with `--variants` and only when the label really is a pack
 * count. A listing whose variant is just "Default" says nothing about a pack,
 * and a value somebody filled in by hand is not what the customer bought.
 */
function packOf(variant: string | undefined): string | undefined {
  const m = /^(?:spray\s*)?(\d)\s*(?:pc|packs?)$/i.exec((variant ?? "").trim());
  return m ? `${m[1]} Pack` : undefined;
}

/**
 * The day they ordered, only with `--purchase-dates` and only when the export
 * carries one that lands before the review itself. Noon UTC, like the review
 * date: the export gives a day, not a time.
 */
function purchaseDateOf(r: RawReview): string | undefined {
  if (!withPurchaseDates || !r.purchase_date) return undefined;
  if (r.purchase_date >= r.date) return undefined;
  return `${r.purchase_date}T12:00:00.000Z`;
}

const raw = JSON.parse(readFileSync(rawPath, "utf8")) as {
  reviews: RawReview[];
};

if (withPhotos && !remotePhotos) mkdirSync(photoDir, { recursive: true });
if (withAvatars) mkdirSync(path.join("public", "avatars"), { recursive: true });

/**
 * The only hosts a `--remote-photos` link may point at: the TikTok CDNs the page's
 * Content-Security-Policy (`src/middleware.ts`) allows images from. Anything else
 * (a Facebook or Google avatar in the export) is dropped rather than linked.
 */
const TIKTOK_CDN = /^https:\/\/[^/]+\.(?:tiktokcdn-us|ttcdn-us)\.com\//i;
mkdirSync(path.dirname(outPath), { recursive: true });

/** Public URL path for a file inside `public/`. */
const publicPath = (file: string) =>
  "/" + path.relative("public", file).split(path.sep).join("/");

async function download(url: string, file: string): Promise<boolean> {
  if (existsSync(file)) return true;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    return true;
  } catch {
    return false;
  }
}

/**
 * True for an image that is (near) solid black — every channel's brightest
 * pixel is below 40/255. Uses `sharp` (already installed with Next); if it
 * can't be loaded the check is skipped and the picture is kept.
 */
async function isBlank(file: string): Promise<boolean> {
  try {
    const { default: sharp } = await import("sharp");
    const { channels } = await sharp(file).stats();
    return channels.every((c) => c.max < 40);
  } catch {
    return false;
  }
}

const usable = raw.reviews
  .filter((r) => r.review_text?.trim() && r.rating >= 1 && r.rating <= 5)
  // Reviews scraped with a star filter (`filter_phase`, e.g. "4-5 star only")
  // are left out unless asked for: a feed and an average built from only the
  // good ratings is not what the listing's buyers said.
  .filter((r) => includeFiltered || !r.filter_phase)
  .sort((a, b) => b.date.localeCompare(a.date));

/**
 * Photos of a review that points at a home or an address are never copied: the
 * picture is of somewhere a person lives.
 */
const ADDRESS = /\b(my (house|home|door|porch|apartment)|address|street)\b/i;

/** Stable per review, so files survive the export being re-merged or re-sorted. */
const fileKey = (r: RawReview) =>
  createHash("sha1")
    .update([r.reviewer_name, r.date, r.review_text ?? ""].join("|"))
    .digest("hex")
    .slice(0, 8);

async function main() {
  const out = [];
  let failed = 0;
  let withheld = 0;
  let blank = 0;
  for (const [i, r] of usable.entries()) {
    const n = String(i + 1).padStart(2, "0");
    const key = fileKey(r);
    const images: string[] = [];
    const sensitive = ADDRESS.test(r.review_text ?? "");
    if (withPhotos && sensitive && r.media_urls?.length) withheld += 1;
    for (const [j, url] of (withPhotos && !sensitive
      ? (r.media_urls ?? [])
      : []
    ).entries()) {
      if (remotePhotos) {
        if (TIKTOK_CDN.test(url)) images.push(url);
        continue;
      }
      const file = path.join(photoDir!, `${prefix}-${key}-${j + 1}.webp`);
      if (await download(url, file)) images.push(publicPath(file));
      else failed += 1;
    }
    let avatar: string | undefined;
    // Profile pictures are always copied to our own host: their links expire in
    // about two days, and a reviewer's picture should not vanish with the link.
    if (withAvatars && r.profile_pic_url) {
      const file = path.join("public", "avatars", `${prefix}-${key}.jpg`);
      if (!(await download(r.profile_pic_url, file))) failed += 1;
      else if (await isBlank(file)) {
        // TikTok serves a solid black square for some accounts with no picture.
        // That is not a profile photo: drop it, so the card shows the same
        // empty-profile silhouette it shows for everyone else without one.
        unlinkSync(file);
        blank += 1;
      } else avatar = publicPath(file);
    }
    const itemTitle = withVariants ? packOf(r.item_variant) : undefined;
    const purchasedAt = purchaseDateOf(r);
    out.push({
      id: `${prefix}-${n}`,
      rating: r.rating,
      title: null,
      body: r.review_text!.trim(),
      author: r.reviewer_name,
      ...(avatar ? { avatar } : {}),
      country: COUNTRIES[r.country ?? ""] ?? r.country,
      ...(itemTitle ? { itemTitle } : {}),
      ...(purchasedAt ? { purchasedAt } : {}),
      // Noon UTC: the export gives a day, not a time.
      createdAt: `${r.date}T12:00:00.000Z`,
      images,
      source: "tiktok",
    });
  }

  writeFileSync(outPath!, JSON.stringify(out, null, 2) + "\n");
  console.log(
    `${out.length} reviews written to ${outPath}` +
      ` (${raw.reviews.length - usable.length} left out: no text, or star-filtered),` +
      ` ${out.reduce((s, r) => s + r.images.length, 0)} photos and` +
      ` ${out.filter((r) => r.avatar).length} profile pictures saved` +
      (withheld ? `, photos withheld on ${withheld} (address/home)` : "") +
      (blank ? `, ${blank} blank (black) profile pictures dropped` : "") +
      (failed ? `, ${failed} failed to download` : ""),
  );
}

void main();
