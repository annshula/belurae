/**
 * PLACEHOLDER review set for the Belurae hair-removal mousse.
 *
 * This exists so the review surfaces — the rating line above the title and the
 * review feed with its filters — can be built, reviewed and demoed before
 * Judge.me has verified-buyer reviews to serve. The copy is hand-written in a
 * realistic customer register and modelled on the reference storefront's
 * `reference/src/data/reviews.ts`.
 *
 * TWO RULES, both from the blueprint, that must hold while this file exists:
 *
 *  1. **UI only.** These reviews are never handed to `productSchema`: no
 *     schema.org `Review`/`AggregateRating` is emitted from placeholder
 *     content (docs/blueprint/00-README.md §Reviews, 04-search-visibility.md).
 *     The PDP keeps passing Judge.me's real summary — `null` when there is
 *     none — to the graph.
 *  2. **Claim rules.** Copy stays inside docs/blueprint/01-brand.md §2: what a
 *     customer noticed, never a medical outcome, never an absolute.
 *
 * Delete this file and its two call sites (`ReviewsSection`, the [slug] route's
 * rating line) once real reviews exist.
 *
 * Generation is deterministic — seeded PRNG, fixed anchor date — so the server
 * and the browser produce identical data. That is what lets the client-side
 * feed import this module directly instead of receiving 524 reviews through the
 * RSC payload, and keeps hydration clean.
 */

import {
  summarize,
  type ProductReviews,
  type Review,
} from "@/lib/judgeme/types";

/** The one product this set belongs to (data/catalog.json's product handle). */
const DEMO_HANDLE = "bikini-pain-free-hair-removal-spray";

/** Date of the newest review, fixed so both renderers agree. Bump when refreshing. */
const ANCHOR = Date.UTC(2026, 8, 25, 12, 0, 0);
const DAY = 86_400_000;

/**
 * The star mix behind the headline figures: 524 reviews, average 4.9 —
 * overwhelmingly 5★ with a genuine minority lower down, so the 2★/3★ filters
 * have something real to show rather than an empty state.
 */
const MIX: { rating: Review["rating"]; count: number }[] = [
  { rating: 5, count: 478 },
  { rating: 4, count: 32 },
  { rating: 3, count: 8 },
  { rating: 2, count: 3 },
  { rating: 1, count: 3 },
];

/**
 * Review copy, in two halves: how a review opens and how it closes. Pairing
 * them is what keeps the feed from rhyming — a single-sentence pool repeats
 * inside two pages, the pairs gave 94 distinct bodies across the set. The
 * smaller bands have no closers; one sentence is enough for 14 reviews.
 */
const OPENERS: Record<Review["rating"], string[]> = {
  5: [
    "Sprayed an even layer on my legs, waited about eight minutes, then wiped it away with the scraper.",
    "The mousse holds its shape when you spray it, so nothing drips down my leg.",
    "Got both legs and my underarms out of one bottle.",
    "Used it the morning of a wedding, in the time it took me to dry my hair.",
    "Ten minutes of waiting is fine by me — I read while it works, then rinse in the shower.",
    "Followed the timings on the leaflet exactly the first time.",
    "Second pack, because the first one lasted about two months of weekly use.",
    "Did my shins and underarms in one go, with no razor in sight.",
    "The scraper in the box is the bit I didn't expect to like.",
    "Took it away for a long weekend and the cap stayed on in my wash bag.",
    "Hair came away on the second pass on my shins.",
    "Left it the full ten minutes while I got on with my hair.",
  ],
  4: [
    "Does the job, though the coarser hair around my ankles needs a second pass.",
    "Great on legs and underarms.",
    "Happy with it overall, and I've reordered.",
    "Works well, and the finish lasts about as long as shaving did for me.",
    "Nice texture, and it sprays on evenly.",
    "Second bottle in, so it has clearly earned its place.",
    "Close enough that I stopped noticing the odd missed hair around my knees.",
    "Gentle enough that I use it twice a week without thinking about it.",
  ],
  3: [
    "It works, but I need two applications on my underarms and that's a lot of waiting for one shower.",
    "Fine on my legs, less so on coarser hair. Not the shortcut I was hoping for.",
    "Does what it says if you follow the timings exactly. Leave it past ten minutes and my skin felt tight.",
    "The scent is pleasant, but the nozzle clogs if I don't rinse the cap after each use.",
    "It's alright. My razor is quicker, this is gentler — depends which one matters more to you.",
  ],
  2: [
    "Left patches on my knees and ankles even after a second go. Fine on my shins, nothing more.",
    "Smells nice, but it didn't shift the hair on my legs at all. I patch tested first so there was no reaction — it just didn't work for me.",
    "Arrived with the nozzle leaking and half the bottle in the bag. The product was okay once I used what was left.",
  ],
  1: [
    "Didn't work for me. Left it the full ten minutes, wiped it away, and barely any hair came off.",
    "The bottle leaked in transit, so I never really got to try it properly.",
    "Didn't get on with it — my skin felt tight for a day afterwards, so I stopped after two goes.",
  ],
};

const CLOSERS: Record<Review["rating"], string[]> = {
  5: [
    "No nicks, no wax strips, and my skin felt soft afterwards.",
    "The scent fades quickly, so nothing lingers all day.",
    "As close as my razor ever got.",
    "It replaced my razor, which is the highest compliment I can give a body-care product.",
    "Much easier than a cloth or a mitt.",
    "I patch test out of habit and haven't had a problem.",
    "My sister is still using hers months later.",
    "Cheaper per use than the wax strips I used to buy.",
    "Easier to fit into a weekday evening than booking anything.",
    "Small enough to live on the shelf without taking over the bathroom.",
    "The scent is orange peel rather than the sharp chemical smell I expected.",
    "I've stopped thinking about hair removal as a chore.",
  ],
  4: [
    "The ten minutes feels long when you're in a hurry, but it's easy enough to plan around.",
    "I just wish the bottle were bigger, because I get through it quickly on both legs.",
    "One mark off because the scraper is small and I keep misplacing it.",
    "The scent is stronger than I expected on the first spray, then it settles.",
    "My inner thigh felt a little tight the first time, so now I patch test properly and it's been fine since.",
    "Solid for the price, though I'd buy a travel size if they made one.",
    "It takes a second application on coarse hair, which makes it slower than I hoped.",
    "My razor is still quicker on a last-minute morning, but this is gentler.",
  ],
  3: [""],
  2: [""],
  1: [""],
};

const TITLES: Record<Review["rating"], string[]> = {
  5: [
    "Replaced my razor",
    "Second pack",
    "Better than I expected",
    "Works on legs and underarms",
    "No nicks this time",
    "Smells fresh, not chemical",
    "Easy once you know the timings",
    "Gentle on my skin",
  ],
  4: [
    "Good, with one caveat",
    "Does the job",
    "Happy overall",
    "Worth planning the ten minutes",
    "Better on finer hair",
  ],
  3: ["Depends on the hair", "Takes some patience", "Only on my shins"],
  2: ["Not for me", "Patches left behind"],
  1: ["Didn't work for me", "Arrived damaged"],
};

const NAMES = [
  "Amara Doyle",
  "Priya Raman",
  "Elena Vasquez",
  "Naomi Cohen",
  "Hannah Blake",
  "Bruno Costa",
  "Sofia Lindqvist",
  "Iona Wallace",
  "Marcus Reid",
  "Leila Haddad",
  "Chloe Bennett",
  "Daniel Okafor",
  "Yuki Tanaka",
  "Grace Whitfield",
  "Tomas Novak",
  "Zoe Ashford",
  "Nadia Petrov",
  "Ethan Brooks",
  "Farah Aziz",
  "Julia Moreau",
  "Sam Whitaker",
  "Ingrid Haugen",
  "Carlos Medina",
  "Ruth Adeyemi",
  "Megan Doyle",
  "Arjun Mehta",
  "Clara Fontaine",
  "Liam Doherty",
  "Beatriz Silva",
  "Anneke de Vries",
  "Katie Nolan",
  "Victor Alvarez",
  "Sara Kowalski",
  "Hollie Trent",
  "Noor Rahman",
  "Emilia Rossi",
  "Tessa Brandt",
  "Jade Ellery",
  "Marta Nowak",
  "Simone Duval",
  "Ravi Sharma",
  "Erin Connolly",
  "Paula Ferreira",
  "Gemma Wilde",
  "Aisha Bakr",
  "Lucas Meyer",
  "Bethan Price",
];

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Ireland",
  "New Zealand",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Spain",
  "Italy",
];

/** Small deterministic PRNG (mulberry32) — same numbers on server and client. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], rand: () => number): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const a = out[i]!;
    const b = out[j]!;
    out[i] = b;
    out[j] = a;
  }
  return out;
}

/**
 * Walks a pool so a text crops up again only after the whole pool is used, one
 * position further along each cycle — keeps consecutive pages from rhyming.
 */
function pick(pool: string[], n: number): string {
  return pool[(n + Math.floor(n / pool.length)) % pool.length]!;
}

function build(): Review[] {
  const rand = mulberry32(20260925);

  const ratings = shuffled(
    MIX.flatMap(({ rating, count }) =>
      Array.from({ length: count }, () => rating),
    ),
    rand,
  );
  const names = shuffled(NAMES, rand);
  const countries = shuffled(COUNTRIES, rand);
  const openers: Record<Review["rating"], string[]> = {
    5: shuffled(OPENERS[5], rand),
    4: shuffled(OPENERS[4], rand),
    3: shuffled(OPENERS[3], rand),
    2: shuffled(OPENERS[2], rand),
    1: shuffled(OPENERS[1], rand),
  };
  const used: Record<Review["rating"], number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  // CLOSERS is only shuffled for the bands that have more than one option.
  const closers: Record<Review["rating"], string[]> = {
    5: shuffled(CLOSERS[5], rand),
    4: shuffled(CLOSERS[4], rand),
    3: CLOSERS[3],
    2: CLOSERS[2],
    1: CLOSERS[1],
  };

  return ratings.map((rating, i) => {
    const n = used[rating];
    used[rating] = n + 1;

    const name = names[i % names.length]!;
    const parts = name.split(" ");
    // Same display convention as Judge.me's fetch: first name + last initial.
    const author = `${parts[0]} ${parts[parts.length - 1]![0]!.toUpperCase()}.`;

    // The closer walks its pool at a different stride to the opener, so the
    // pairs don't cycle in lockstep.
    const closer = pick(closers[rating], n * 5);

    return {
      id: `demo-${i + 1}`,
      rating,
      title: rand() < 0.45 ? pick(TITLES[rating], n) : null,
      body: closer
        ? `${pick(openers[rating], n)} ${closer}`
        : pick(openers[rating], n),
      author,
      country: countries[i % countries.length]!,
      // Newest first, ~1.25 days apart, jittered but never out of order.
      createdAt: new Date(ANCHOR - (i * 1.25 + rand()) * DAY).toISOString(),
      images: [],
    };
  });
}

const demoList = build();

/** The placeholder set, for callers that already know they want it. */
export const demoReviews: ProductReviews = {
  reviews: demoList,
  summary: summarize(demoList),
};

/** Placeholder set for a product handle, or null when we don't have one for it. */
export function demoReviewsFor(handle: string): ProductReviews | null {
  return handle === DEMO_HANDLE ? demoReviews : null;
}
