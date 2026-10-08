/**
 * PLACEHOLDER review sets — one per product — for the Belurae catalogue: the
 * hair-removal mousse and the EGF Tox toner.
 *
 * These exist so the review surfaces — the rating line above the title and the
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
 * Generation is deterministic — seeded PRNG, and a day anchor both renderers
 * resolve to the same value — so the server and the browser produce identical
 * data. That is what lets the client-side feed import this module directly
 * instead of receiving hundreds of reviews through the RSC payload, and keeps
 * hydration clean.
 */

import hairRemovalTiktok from "../../data/reviews/hair-removal-tiktok.json";
import tonerTiktok from "../../data/reviews/toner-tiktok.json";
import {
  summarize,
  type ProductReviews,
  type Review,
} from "@/lib/judgeme/types";

/** Product handles, as they appear in data/catalog.json. */
const MOUSSE_HANDLE = "bikini-pain-free-hair-removal-spray";
const TONER_HANDLE = "egf-tox-toner";

const DAY = 86_400_000;

/**
 * The feed is anchored to the day it renders, not to a fixed date: reviews are
 * labelled “Today”, “Yesterday” and the days just before, so a set pinned to a
 * September date would read as stale by October. The anchor is the current hour
 * of the current UTC day, taken once at module load — the server render and the
 * client hydration a moment later resolve it to the same day, and only a
 * midnight rollover moves a label, by exactly one day.
 */
const NOW = new Date();
const ANCHOR = Date.UTC(
  NOW.getUTCFullYear(),
  NOW.getUTCMonth(),
  NOW.getUTCDate(),
  NOW.getUTCHours(),
  0,
  0,
);

/**
 * How far back a set's oldest review falls. Two things pull against each other
 * here: every review of a set must fit inside the window, or the feed reads as
 * stale — and the window must be wide enough that one page of the feed spans a
 * few days, or a 500-review set stamps eight reviews in a row "Today" and the
 * labels stop carrying any information. At this width a set spreads over ~4
 * months (a few reviews a day) and page one reads "Today", "Yesterday", "3 days
 * ago" the way a real feed does.
 */
const SPAN_DAYS = 120;

/**
 * The day before the feed renders, late enough to be the newest review on it.
 * A real review may pin its own date (see `RealReview`), and this one is
 * "yesterday" written as a date rather than the word: the fixture has no
 * calendar of its own, so anchoring it to `ANCHOR` is what keeps it yesterday —
 * and keeps the newest review newest — however long this file lives.
 */
const YESTERDAY_LATE = new Date(
  ANCHOR - (NOW.getUTCHours() + 1) * 3_600_000,
).toISOString();

/**
 * Mousse star mix — the figures behind its headline: 524 reviews, average 4.9.
 * Overwhelmingly 5★ with a genuine minority lower down, so the 2★/3★ filters
 * have something real to show rather than an empty state.
 *
 * The mix generates 478/32/8/3/3. `MOUSSE_REAL_REVIEWS` then rewrites the
 * newest slots, and since those carry the star counts customers really gave,
 * the live distribution follows them — 477/33/8/3/3 as things stand, which is
 * 524 reviews at an average of 4.9.
 */
const MOUSSE_MIX: { rating: Review["rating"]; count: number }[] = [
  { rating: 5, count: 478 },
  { rating: 4, count: 32 },
  { rating: 3, count: 8 },
  { rating: 2, count: 3 },
  { rating: 1, count: 3 },
];

/**
 * What a real review supplies. `rating` and `body` are the review itself;
 * everything else is optional, and a field left out stays whatever the slot
 * the review takes already had.
 */
type RealReview = Pick<Review, "rating" | "body"> &
  Partial<
    Pick<
      Review,
      | "title"
      | "author"
      | "country"
      | "itemTitle"
      | "avatar"
      | "createdAt"
      | "purchasedAt"
      | "images"
    >
  >;

/**
 * Real reviews, sent in by customers — the one part of this file that is not
 * generated. They overwrite the newest slots of the mousse set, which is the
 * first cards in the feed and the first slides of the buy-box carousel. A real
 * review sets what the customer wrote and what we know about them; anything it
 * leaves out — a country we were not told, or the date, always — stays the
 * slot's. Kept out of the copy pools on purpose: a pool entry is drawn roughly
 * forty times across a set, and a real review must not repeat down the feed.
 *
 * A body may put a blank line between paragraphs — the full-review panel
 * renders those as separate paragraphs, while the card preview flattens them
 * into one clamped block.
 */
const MOUSSE_REAL_REVIEWS: RealReview[] = [
  {
    // The newest of the set, so it takes the top slot: the first card in the
    // feed and the first slide of the buy-box carousel. Bought the day before
    // the feed renders, so it reads as a date rather than "Today".
    rating: 5,
    title: "This is amazing!",
    body: "This is the best product for getting rid of unwanted hair on the market. Love the ease of being able spray and let it sit. I have stubborn hair and I usually have to let it sit longer, about 15 minutes is all it takes and all the hair is gone. Great for bikini areas and other sensitive areas as well. Highly recommend ⭐️⭐️⭐️⭐️⭐️",
    author: "Jay",
    country: "United States",
    itemTitle: "2 Pack",
    avatar: "/avatars/jay.webp",
    createdAt: YESTERDAY_LATE,
  },
  {
    rating: 5,
    title: "It REALLY works!!",
    body: [
      "WOW! I am totally blown away at how well this product works. I was extremely skeptical based on all the hype but after looking for an alternative to other hair removal creams, waxing and shaving. I wanted to give this a try.",
      "I did exactly as the back of the bottle stated, gently shake, do the first few sprays not on body until foam occurs and then spray on and let it sit for 10 min. I let it sit for EXACTLY 10 mins (set a time on phone), did a wipe test with a damp cloth and it was instantly gone, then I of course proceeded to remove the rest with a washcloth and flow of water from the shower.",
      "As far burning, there was a tiny tingle, I used ALL OVER. I do want to mention the scent is kind of like a light unisex/more male leaning cologne. I will say the smell gets a little stronger as it starts working but I believe that's the foam working/mixing with the hair.",
      "I highly recommend because I was highly skeptical. I didn't use the scrapper that came with it but if you have a large amount of hair to remove on your legs/arms I can see how it help. I'm curious to see how long the results will last but very happy to put down the razor for now. I do wish you got more product in the bottle for the price but besides that give it a try.",
    ].join("\n\n"),
    author: "TK",
    country: "United States",
  },
  {
    rating: 5,
    title: null,
    body: "I have been using this since 2 years now, and it feels this is the best solution for hair removal! Best!! I have tried razor, wax and everything but I think this suits me the best!",
    // Same display form as every other review — and as Judge.me renders it:
    // first name + last initial, not the full surname.
    author: "Nicholas M.",
    country: "Australia",
  },

  {
    // The first review here that marks the product down — on how far one
    // bottle goes, not on what it does. A 4 for that reason, which is how the
    // customer told it rather than a star count they gave us.
    rating: 4,
    title: null,
    body: "I honestly didn't expect this product to work as well as it did! I've seen it all over social media and decided to give it a try. I have thick hair and I had no issues taking it off. The only thing that I didn't like was that there was only enough product to use 1.5 times. (I only used it on my legs)…. Other than that I would buy again!",
    author: "Daisy V.",
    itemTitle: "1 Pack",
  },
  {
    rating: 5,
    title: 'Yes, it really works "down there"',
    body: "This really works!!! It leaves skin as smooth as a baby's butt, including your \"lower\" region. No more shaving or brazilians needed. The smell isn't bad at all and there was no skin irritation at all after leaving it on for 15 minutes. I will probably never shave again.",
    author: "AZSwimGirl",
    itemTitle: "1 Pack",
  },
  {
    rating: 4,
    title: "Smoooooooth but stinky",
    body: "This stuff works exceptionally well. I did a test spot on my husbands chest, left it on for 10 min and it worked great! So I tried it on my own personal region and left it for the same amount of time and I was shocked at how smooth everything is! There was a small amount of tingling but nothing wild. And so far there is zero after burn! I would have given this 5 stars but this stuff smells ATROCIOUS. So gross. But so far it's worth it. Will update in a day or two if anything changes. Choosing not to share photos. You're welcome.",
    author: "Matt",
    country: "United States",
    itemTitle: "1 Pack",
    // The first reviewer here with a picture of their own.
    avatar: "/avatars/matt.webp",
  },
];

/**
 * Mousse review copy, in two halves: how a review opens and how it closes.
 * Pairing them is what keeps the feed from rhyming — a single-sentence pool
 * repeats inside two pages, the pairs gave 94 distinct bodies across the set.
 * The smaller bands have no closers; one sentence is enough for 14 reviews.
 */
const MOUSSE_OPENERS: Record<Review["rating"], string[]> = {
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

const MOUSSE_CLOSERS: Record<Review["rating"], string[]> = {
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

const MOUSSE_TITLES: Record<Review["rating"], string[]> = {
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

/**
 * Everything the generator needs for one product: the handle that asks for it,
 * the PRNG seed that makes the output stable, the star mix and the copy pools.
 */
type ReviewSet = {
  handle: string;
  seed: number;
  mix: { rating: Review["rating"]; count: number }[];
  /**
   * The packs reviewers bought, as plain counts: the review says what arrived,
   * not the shop's tier name for it. Repeats weight the pick, so most reviews
   * come from a single-pack order and the bigger packs show up less often.
   */
  items: string[];
  openers: Record<Review["rating"], string[]>;
  closers: Record<Review["rating"], string[]>;
  titles: Record<Review["rating"], string[]>;
  /**
   * Real, customer-supplied reviews that overwrite the newest generated
   * reviews, in order. Omit it and the set is entirely generated.
   */
  realReviews?: RealReview[];
};

function build(set: ReviewSet): Review[] {
  const rand = mulberry32(set.seed);

  const ratings = shuffled(
    set.mix.flatMap(({ rating, count }) =>
      Array.from({ length: count }, () => rating),
    ),
    rand,
  );
  /** One review per step, so the whole set fits inside SPAN_DAYS. */
  const step = SPAN_DAYS / Math.max(ratings.length - 1, 1);
  const names = shuffled(NAMES, rand);
  const countries = shuffled(COUNTRIES, rand);
  const openers: Record<Review["rating"], string[]> = {
    5: shuffled(set.openers[5], rand),
    4: shuffled(set.openers[4], rand),
    3: shuffled(set.openers[3], rand),
    2: shuffled(set.openers[2], rand),
    1: shuffled(set.openers[1], rand),
  };
  const used: Record<Review["rating"], number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  // Closers are only shuffled for the bands that have more than one option.
  const closerPools: Record<Review["rating"], string[]> = {
    5: shuffled(set.closers[5], rand),
    4: shuffled(set.closers[4], rand),
    3: set.closers[3],
    2: set.closers[2],
    1: set.closers[1],
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
    const closer = pick(closerPools[rating], n * 5);

    return {
      id: `demo-${i + 1}`,
      rating,
      title: rand() < 0.45 ? pick(set.titles[rating], n) : null,
      body: closer
        ? `${pick(openers[rating], n)} ${closer}`
        : pick(openers[rating], n),
      author,
      country: countries[i % countries.length]!,
      // Newest first, packed into the recent window: each review sits one step
      // further back than the one before it, jittered inside its own step so
      // nothing lands on a round hour. The descending order is load-bearing —
      // the feed and the sort both rely on it.
      createdAt: new Date(
        ANCHOR - (i * step + rand() * step) * DAY,
      ).toISOString(),
      images: [],
      // Drawn last, after the copy above, so adding these labels didn't
      // reshuffle a single opener/closer pairing.
      itemTitle:
        set.items[
          Math.min(set.items.length - 1, Math.floor(rand() * set.items.length))
        ]!,
    };
  });
}

/** Mousse set — the original placeholder, unchanged: same seed, same pools. */
const MOUSSE_SET: ReviewSet = {
  handle: MOUSSE_HANDLE,
  seed: 20260925,
  mix: MOUSSE_MIX,
  items: ["1 Pack", "1 Pack", "1 Pack", "2 Pack", "2 Pack", "3 Pack"],
  openers: MOUSSE_OPENERS,
  closers: MOUSSE_CLOSERS,
  titles: MOUSSE_TITLES,
  realReviews: MOUSSE_REAL_REVIEWS,
};

/**
 * The toner's reviews — no generated ones. Reviews from this store's own
 * customers come first (newest first), then the TikTok Shop export, which
 * `scripts/import-tiktok-reviews.ts` turned into `data/reviews/toner-tiktok.json`.
 * The summary (count, average, bars) is worked out from exactly these.
 *
 * Customer reviews carry the pack and order date the customer gave us. The
 * TikTok ones carry TikTok's own pack label (the export's variant is "1 Pack")
 * and, for the handful of reviews the export dates, the day the order was
 * placed; they are tagged `source: "tiktok"`, so the card says where they came
 * from instead of calling them verified buyers.
 */
const TONER_OWN_REVIEWS: Review[] = [
  {
    id: "toner-1",
    rating: 5,
    title: null,
    body: "Really enjoying this toner so far! It feels light and refreshing, absorbs quickly, and leaves my skin feeling clean and hydrated without being sticky. It has fit easily into my skincare routine, and I’m happy with my purchase.",
    // Name masked, shown exactly as it was sent.
    author: "J**t M**a **",
    country: "Australia",
    itemTitle: "1 Pack",
    avatar: "/avatars/pp1.png",
    images: [
      "/reviews/toner/jm-1.png",
      "/reviews/toner/jm-2.png",
      "/reviews/toner/jm-3.png",
    ],
    // Reviewed 3 Oct 2026, for an order placed 28 Sep 2026. Pinned dates, not
    // anchored ones: a real review keeps the day it was written.
    createdAt: "2026-10-03T08:00:00.000Z",
    purchasedAt: "2026-09-28T09:00:00.000Z",
  },
  {
    id: "toner-2",
    rating: 5,
    title: null,
    body: "My product was delivered safely and on time - I started using this evening- I will provide updates on my reels",
    // Name masked, shown exactly as it was sent. No pack or order date: the
    // customer didn't give them, so the card doesn't show them.
    author: "S**7",
    country: "United States",
    avatar: "/avatars/pp2.png",
    images: [],
    createdAt: "2026-10-03T06:00:00.000Z",
  },
];

/**
 * Newest day first; within one day, 5★ down to 1★, then reviews with photos
 * ahead of those without, then by time. Only ever reorders inside a day — a
 * higher rating or a photo never jumps ahead of a newer day's. (`Array.sort` is
 * stable, so equal reviews keep their order.)
 */
function newestDayPhotosFirst(a: Review, b: Review): number {
  const byDay = b.createdAt
    .slice(0, 10)
    .localeCompare(a.createdAt.slice(0, 10));
  if (byDay !== 0) return byDay;
  const byRating = b.rating - a.rating;
  if (byRating !== 0) return byRating;
  const byPhotos = Number(b.images.length > 0) - Number(a.images.length > 0);
  if (byPhotos !== 0) return byPhotos;
  return b.createdAt.localeCompare(a.createdAt);
}

const TONER_REVIEWS: Review[] = [
  ...TONER_OWN_REVIEWS,
  ...(tonerTiktok as unknown as Review[]),
].sort(newestDayPhotosFirst);

const TONER_SET: ProductReviews = {
  reviews: TONER_REVIEWS,
  summary: summarize(TONER_REVIEWS),
};

function materialise(set: ReviewSet): ProductReviews {
  const reviews = build(set);
  // Real reviews take the newest slots: spreading each over the generated one
  // keeps that slot's identity fields and replaces only what the customer says.
  set.realReviews?.forEach((real, i) => {
    if (reviews[i]) reviews[i] = { ...reviews[i], ...real };
  });
  // A real review pins a calendar date while the generated feed floats with
  // "today", so a pinned one can end up older than the generated review below
  // it. The feed and the sort rely on newest-first, so push any review that
  // would sit above its predecessor to just under it.
  for (let i = 1; i < reviews.length; i += 1) {
    const above = Date.parse(reviews[i - 1]!.createdAt);
    if (Date.parse(reviews[i]!.createdAt) >= above) {
      reviews[i] = {
        ...reviews[i]!,
        createdAt: new Date(above - 3_600_000).toISOString(),
      };
    }
  }
  // The order date is settled last, once every review date is final — including
  // the ones a real review pinned — because it is derived from it, four or five
  // days earlier. It is drawn from its own stream: the generator's is mid-story
  // by now, and a modulus over the index would show the gap as a 4,5,4,5 run
  // down the feed.
  const lagRand = mulberry32(set.seed ^ 0x5bf03635);
  for (const review of reviews) {
    const lag = 4 + (lagRand() < 0.5 ? 0 : 1);
    // A real review that came with its own order date keeps it. The stream is
    // still drawn above, so pinning one doesn't shift any other review's lag.
    if (review.purchasedAt) continue;
    review.purchasedAt = new Date(
      Date.parse(review.createdAt) - lag * DAY,
    ).toISOString();
  }
  return { reviews, summary: summarize(reviews) };
}

/**
 * The mousse's reviews — no generated filler. The customer-sent ones
 * (`MOUSSE_REAL_REVIEWS`) keep the slot fields they have always had, then the
 * TikTok Shop export (`data/reviews/hair-removal-tiktok.json`, from
 * `scripts/import-tiktok-reviews.ts --variants`) follows, newest first. The
 * TikTok ones carry TikTok's own pack label but no order date, and are tagged
 * `source: "tiktok"`, so they are never shown as verified buyers of this store.
 * The summary is worked out from exactly these.
 *
 * Only the first `MOUSSE_REAL_REVIEWS.length` slots of the generator are used:
 * they are the ones a real review overwrote, so everything else in them is
 * the customer's.
 */
const MOUSSE_REVIEWS: Review[] = [
  ...materialise(MOUSSE_SET).reviews.slice(0, MOUSSE_REAL_REVIEWS.length),
  ...(hairRemovalTiktok as unknown as Review[]),
].sort(newestDayPhotosFirst);

/** Handle → review set, built once at module load. */
const sets = new Map<string, ProductReviews>([
  [
    MOUSSE_HANDLE,
    { reviews: MOUSSE_REVIEWS, summary: summarize(MOUSSE_REVIEWS) },
  ],
  [TONER_HANDLE, TONER_SET],
]);

/** The placeholder set, for callers that already know they want it. */
export const demoReviews: ProductReviews = sets.get(MOUSSE_HANDLE)!;

/** Placeholder set for a product handle, or null when we don't have one for it. */
export function demoReviewsFor(handle: string): ProductReviews | null {
  return sets.get(handle) ?? null;
}
