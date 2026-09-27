# 04 — Search Visibility (SEO · AEO · GEO)

Covers brief §15 SEO · §16 AEO · §17 GEO · §18 Entities · §19 Schema · §20 Internal linking · §24–27 · §33 Image SEO · §52 Headless technical SEO · §39 SEO page matrix.

---

## 15. SEO strategy

### Principles

1. **Everything indexable is in the initial HTML.** Product facts, prices, FAQs, ingredients, directions, internal links — server-rendered. Client JS only enhances.
2. **One URL per thing.** Every entity (product, category, ingredient, guide) has exactly one canonical URL.
3. **Quality gate for indexation.** A page is indexable only if it has unique, useful content (see matrix). Everything else is `noindex, follow`.
4. **Metadata is generated from data, reviewed by humans.** Templates produce defaults; Shopify SEO fields and MDX front-matter override.

### URL structure (§25)

| Type | Pattern | Example |
|---|---|---|
| Product | `/products/[handle]` | `/products/hair-removal-mousse` |
| Collection | `/collections/[handle]` | `/collections/hair-removal` |
| Guide | `/guides/[slug]` | `/guides/how-to-use-hair-removal-mousse` |
| Journal | `/journal/[slug]` | `/journal/why-we-publish-full-ingredient-lists` |
| Ingredient | `/ingredients/[slug]` | `/ingredients/aloe-leaf-water` |
| Brand/policy | `/pages/[slug]` | `/pages/about` |

`/blog/…` (as named in the brief) → we use `/journal/` for brand voice; add a permanent redirect `/blog/:slug → /journal/:slug` so either works. Change to `/blog` if you prefer — decide once, before launch.

Rules: lowercase, hyphens, no trailing slash (308 redirect trailing → non-trailing), no dates in slugs, no `/collections/x/products/y` nesting (canonical is always `/products/y`).

### Non-indexable URLs

| URL | Treatment |
|---|---|
| `/cart`, `/account/*`, `/search` | `noindex, nofollow` meta + `X-Robots-Tag`; disallowed in robots.txt **only** for `/account` and `/cart` (search stays crawlable-but-noindex so the directive is seen) |
| Checkout (`checkout.belurae.com`) | Shopify-controlled; noindex by Shopify |
| `?variant=` | Canonical → base product URL |
| Filters/sort `?filter.*`, `?sort=` | `noindex, follow`, canonical → clean collection |
| `?page=N` | Indexable, self-canonical, `rel` links not required |
| Tracking `utm_*`, `gclid`, `fbclid`, `ttclid` | Canonical ignores query string; internal links never include them |

### robots.txt

```
User-agent: *
Disallow: /account
Disallow: /cart
Disallow: /api/
Allow: /

Sitemap: https://belurae.com/sitemap.xml
```

AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended): **allowed** by default, because the GEO goal is to be cited. This is a business decision — flip per bot in `app/robots.ts` if you change it.

### Sitemaps

`/sitemap.xml` index → `sitemap-products.xml`, `sitemap-collections.xml`, `sitemap-content.xml`, `sitemap-pages.xml`. `lastmod` = Shopify `updatedAt` / MDX `lastReviewed`. Only indexable, 200-status, canonical URLs. Product sitemap includes image entries. Revalidated by the same webhook tags as the pages.

### Redirects

| From | To | Code |
|---|---|---|
| `shoptrackify.com/products/bikini-pain-free-hair-removal-cream` | `belurae.com/products/hair-removal-mousse` | 301 (configured on Trackify side) |
| `shoptrackify.com/products/bikini-pain-free-hair-removal-spray` | same | 301 |
| `/products/bikini-pain-free-hair-removal-cream` (on Belurae) | `/products/hair-removal-mousse` | 308 |
| Shopify `urlRedirects` | mirrored | Fetched at build + on `app` webhook; applied in `proxy.ts` from a cached map |

### Programmatic metadata (§26)

| Page | Title pattern (≤ 60 chars) | Description pattern (≤ 155 chars) |
|---|---|---|
| Home | `Belurae — Beauty, Made Simpler` | `Thoughtful personal care for everyday rituals. Hair removal and body care with full ingredient lists and clear directions.` |
| Collection | `{Collection} — {n} products · Belurae` → prefer human `seo.title` | First sentence of intro, trimmed |
| PDP | `{Product name} · {format + size} · Belurae` | `{benefit line}. {key fact: time on skin}. Full ingredients and directions.` |
| Guide | `{H1} · Belurae Guides` | Summary box text |
| Ingredient | `{Ingredient}: What It Is and Why It's Used · Belurae` | First answer sentence |

All pages: `alternates.canonical`, OpenGraph (`og:type` product/article/website), `twitter:card=summary_large_image`, OG image (static per product from Shopify image via `opengraph-image.tsx` 1200×630, typographic for guides). No keyword stuffing: titles contain the entity name once.

Product-specific meta (via JSON-LD, not meta tags): price, currency, availability, brand, SKU, GTIN (R12).

### Image SEO (§33)

- Filenames descriptive (see 02 §59).
- Alt text describes what is visible, including product name only when the product is visible. Decorative images `alt=""`.
- Width/height always set; `sizes` accurate; AVIF/WebP via `next/image` loader pointing at Shopify CDN (`?width=`) — see 05 §27.
- Product images in image sitemap.

---

## 52. Technical SEO for headless Shopify

### Production domain architecture

```
belurae.com                 → Next.js on Vercel (the only indexable storefront)
www.belurae.com             → 308 → belurae.com
checkout.belurae.com        → Shopify checkout (custom domain on the Shopify store)
account.belurae.com         → Shopify Customer Accounts (optional custom domain)
belurae.myshopify.com       → Shopify default; Online Store channel theme
```

### Preventing duplicate indexing (Shopify-hosted vs Next.js)

1. Install the **Headless** sales channel; publish products to it.
2. Online Store theme: replace `theme.liquid` with a minimal layout that **redirects every storefront route to `belurae.com` + same path** (JS redirect + `<meta name="robots" content="noindex">` + `<link rel="canonical" href="https://belurae.com{path}">`). Keep the Online Store channel installed only if an app requires it; otherwise enable the store **password page**.
3. Do **not** connect `belurae.com` as the Shopify primary domain for the theme; it points to Vercel.
4. Shopify-generated emails/links (order status, abandoned checkout) use the checkout domain — fine.
5. Search Console: verify `belurae.com` (domain property); submit sitemap; confirm `*.myshopify.com` URLs are not indexed via `site:` checks post-launch.

### Canonicals

- Product: `https://belurae.com/products/{handle}` — always absolute, no query.
- Variant URLs (`?variant=`) exist for sharing and Merchant Center; they canonicalise to the product.
- Collections: products listed in collections link to `/products/{handle}` (never nested).

### Inventory & pricing freshness for SEO

- Price/availability rendered in HTML must match JSON-LD and Merchant Center. Both come from the same cached fetch, invalidated by `products/update` and inventory webhooks (05 §26) — so they cannot drift from each other.
- Out-of-stock products stay indexed (200) with `OutOfStock` availability and a "notify me" form; discontinued products → 301 to the closest replacement or collection.

### Merchant Center

Use Shopify's Google & YouTube channel for the feed, with product URLs overridden to `belurae.com` (feed `link` = headless domain). Structured data on the PDP must match the feed (price, availability, GTIN).

---

## 16. AEO strategy (answer engines, featured snippets, voice)

### Rules

1. Every priority question has **one canonical answer location** (PDP FAQ for product questions, guides for how-to, FAQ hub for policy).
2. Answer format: **question as heading → 1–2 sentence direct answer → detail.** The first sentence must make sense on its own (quoted out of context by an engine).
3. Answers live in rendered HTML (`<details>` elements are fine — content is in the DOM).
4. Answers are sourced; product answers cite the packaging/manufacturer.

### Priority question set (PDP FAQ + FAQ hub)

| Question | Answer skeleton (fill only from R1/R2) |
|---|---|
| What is Belurae Hair Removal Mousse? | "A spray-on hair removal mousse (140 ml) that you leave on the skin for 5–10 minutes and then wipe away with the included scraper." |
| How does it work? | "It contains [active, R1], which breaks down hair at the skin's surface so it can be wiped away. It does not use a blade or pull hair out." |
| How do I use it? | Numbered steps from R2. |
| How long should I leave it on? | "5 to 10 minutes. Don't leave it on longer than the directions say, even if some hair remains." |
| Is it suitable for sensitive skin? | "The manufacturer labels it hypoallergenic, but every skin is different. Patch test a small area 24 hours before first use." |
| Where can I use it? | From R2 allowed list. |
| Can I use it on the bikini line? | From R2 verbatim — including where **not** to use it. |
| What ingredients does it contain? | Key ingredients + link to full INCI list. |
| How often can I use it? | From R2; if unspecified: "The packaging doesn't state a frequency; wait until skin is fully calm between uses." (only if R2 is silent and you approve this wording) |
| What should I do before using it? | Patch test, clean dry skin, no broken/irritated skin. |
| What should I do if irritation occurs? | "Rinse with cool water straight away and stop using it. If irritation continues, contact a doctor or pharmacist." |
| Can men use it? | Per packaging ("labelled for men and women"). |
| What's the difference between the sets? | Mousse only / + serum / + cream. |
| How long does delivery take? | R7. |
| Can I return it? | R8. |

---

## 17. GEO strategy (generative engines / LLM search)

What LLM-based search needs: **unambiguous entities, consistent facts across pages, citable sentences, and pages that exist for each question type.**

1. **Entity home page**: `/pages/about` states in plain prose: who Belurae is, founded when/where (R9), what it sells, what it doesn't claim. Mirrors Organization JSON-LD.
2. **Fact consistency**: product facts come from one source (Shopify metafields) and render identically on PDP, guides (via component, not copy-paste), FAQ and schema. Contradictions across pages are the main reason LLMs cite competitors instead.
3. **Specific over vague**: "140 ml spray mousse, 5–10 minutes on skin, contains aloe leaf water, glycerin and hyaluronic acid" — not "revolutionary formula".
4. **Limitations published**: "Not for use on the face" etc. — LLM answers about safety prefer sources that state limits.
5. **Standards page** (`/pages/standards`): claims policy, how reviews are collected, how ingredients are listed, manufacturer relationship (D1). This is the page an AI will cite for "is Belurae legit?".
6. **Off-site consistency**: same name, description, and logo on Google Business Profile (if eligible), social profiles, marketplaces; linked via `sameAs`.
7. **`/llms.txt`**: optional, cheap (a curated index of the canonical pages). No proven ranking effect — ship it as a courtesy, don't rely on it.
8. **Crawl access**: AI crawlers allowed (see robots). Pages fast and server-rendered so crawlers that don't run JS get everything.

---

## 18. Entity architecture

```
Organization: Belurae ──sells──▶ Brand: Belurae
   │                                 │
   │                         category: Beauty & Wellness
   │                                 │
   │                  ┌──────────────┼───────────────┐
   │             Hair Removal     Aftercare*     Body Care*
   │                  │
   │         topic: Bikini-line hair removal (guide)
   │                  │
   │        Product: Hair Removal Mousse ──hasVariant──▶ sets / packs
   │           │   │     │       │
   │   ingredients │   how-to  safety
   │    (Aloe, HA, │   guide    & patch test guide
   │     active…)  │
   │               └──isRelatedTo──▶ Aftercare products / guide
   │
   └── publishes ──▶ Guides, Journal (author: Person)
```

Implementation:

- Each node = one URL + one JSON-LD `@id` (`https://belurae.com/#organization`, `…/products/hair-removal-mousse#product`, `…/ingredients/aloe-leaf-water#ingredient`).
- Relationships expressed in both **visible links** and JSON-LD references (`brand`, `isPartOf`, `about`, `mentions`, `isRelatedTo`).
- Ingredients: stored as Shopify **metaobjects** (`ingredient`: name, INCI name, function, description, image, slug) referenced by products → the ingredient page lists every product that references it, automatically.

---

## 19. Schema strategy (§27)

Generated by typed builders in `lib/schema/*` from the **same objects that render the page** (so schema cannot diverge from visible content). One `<script type="application/ld+json">` per page containing an `@graph`.

| Page | Types | Conditions |
|---|---|---|
| All | `Organization` (name, url, logo, sameAs R13, contactPoint R9, `hasMerchantReturnPolicy` when R8) · `WebSite` (no SearchAction — sitelinks search box is retired; add only if a real need appears) | Always |
| Home | + `WebPage` | |
| PDP | `Product` (name, description, image[], brand, sku, gtin R12, category, `offers`: array of `Offer` per variant with `price`, `priceCurrency`, `availability`, `url` (?variant=), `itemCondition`, `shippingDetails` (R7), `hasMerchantReturnPolicy` (R8)) | `aggregateRating` + `review` **only** when rendered on page from verified reviews |
| PDP | `BreadcrumbList` | Always |
| PDP | `FAQPage` | Only Q&As visible on the page. Note: Google shows FAQ rich results only for authoritative gov/health sites; kept for other engines and AEO. |
| PDP | `HowTo` | Optional; Google retired HowTo rich results. Include only on the how-to guide, not the PDP. |
| PDP | `VideoObject` | For each on-page video: name, description, thumbnailUrl, uploadDate, duration, contentUrl |
| Collection | `CollectionPage` + `ItemList` (ListItem → product url) + `BreadcrumbList` | |
| Guide / Journal | `Article` or `BlogPosting` (headline, author `Person`, datePublished, dateModified, image, publisher → org `@id`) + `BreadcrumbList` (+ `FAQPage` if visible FAQ) | |
| Ingredient | `WebPage` with `about` → `DefinedTerm` (name = INCI, description) + `mentions` → products | |
| About | `AboutPage` + Organization | |
| Contact | `ContactPage` | |

Brand in `Product.brand`: **Belurae only under D1 option (a)**. Under option (b) the brand is the manufacturer and Belurae is the `seller` in `Offer.seller`.

Validation: CI runs schema builders against fixtures + snapshot tests; launch QA runs Google Rich Results Test and Schema.org validator on each template.

---

## 20. Internal linking strategy (§32)

### Required links per template

| From | Must link to |
|---|---|
| PDP | Its collection (breadcrumb), each key ingredient page, how-to guide, patch-test guide, aftercare guide, 1–3 related products |
| Collection | Every product in it, 1–2 guides, related collections |
| Guide | 1–2 products (contextual), parent hub, 3 related guides, relevant ingredient pages |
| Ingredient | Every product containing it, 1 guide |
| Journal | 1 product max, 2 guides |
| Home | Every live collection, hero product, 3 guides, Standards page |
| Footer | Policies, hubs (not every guide) |

### Mechanics

- A **content graph** module (`lib/content/graph.ts`) builds links from data (product ↔ ingredient metaobjects, MDX `products[]` and `entities[]` front-matter), so links stay correct when products change.
- Anchor text = the destination's name or a natural phrase ("how to patch test"), never "click here".
- Orphan check in CI: every indexable URL in the sitemap must have ≥ 2 internal inbound links.
- Breadcrumbs on every non-home page (visible + `BreadcrumbList`).

---

## 39. SEO page matrix

| Page | Search intent | Title pattern | Meta description | H1 | Schema | Canonical | Index | Key internal links | AEO questions | GEO entities | Rendering | Caching |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Homepage** `/` | Navigational (brand), broad discovery | `Belurae — Beauty, Made Simpler` | Brand descriptor + what we sell | "Beauty, made simpler." | Organization, WebSite, WebPage | `/` | index | Collections, hero PDP, 3 guides, Standards | What is Belurae? | Belurae (Organization, Brand) | Static (prerendered) | Full-route cache; tags `home`, `product:*` in featured slots |
| **Beauty & Wellness** (= `/collections/all` "Shop all") | Category browse | `Shop Beauty & Wellness · Belurae` | Range summary | "Shop all" | CollectionPage, ItemList, Breadcrumb | self | index | All collections, products | What does Belurae sell? | Belurae → categories | ISR | Tag `collection:all`, `products` |
| **Hair Removal** `/collections/hair-removal` | Commercial investigation ("hair removal mousse", "at-home hair removal") | `Hair Removal — At-Home, No-Blade · Belurae` (human-edited) | Intro sentence | "Hair Removal" | CollectionPage, ItemList, Breadcrumb, FAQPage (visible) | self; filters → self | index (filters noindex) | Products, comparison guide, sensitive-skin guide, aftercare | Which hair removal method…? Mousse vs cream? | Hair removal (topic), products | ISR | Tag `collection:hair-removal` |
| **Product PDP** `/products/hair-removal-mousse` | Transactional + product research | `Hair Removal Mousse · 140 ml Spray · Belurae` | Benefit + time + "full ingredients" | Product name | Product+Offers, Breadcrumb, FAQPage, VideoObject, (AggregateRating if real) | base URL (no `?variant`) | index | Collection, ingredients, how-to, patch test, aftercare, related products | All §16 questions | Product, ingredients, brand, category | ISR (static shell + streamed reviews) | Tags `product:{handle}`, `reviews:{handle}`, `recs:{handle}` |
| **Ingredient** `/ingredients/aloe-leaf-water` | Informational | `Aloe Leaf Water: What It Is and Why It's Used · Belurae` | First answer | "Aloe leaf water" | WebPage + DefinedTerm, Breadcrumb | self | index (only if ≥ 400 useful words) | Products containing it, guide | What is it? Why in hair removal products? | Ingredient ↔ products | Static | Tag `ingredient:{slug}` (metaobject webhook) |
| **About** `/pages/about` | Navigational, trust | `About Belurae — Our Story and Mission` | Who/what/why | "About Belurae" | AboutPage, Organization | self | index | Standards, philosophy, contact, shop | Who is behind Belurae? Is it legit? | Organization facts | Static | Build-time; redeploy/`revalidateTag('page:about')` |
| **FAQ** `/pages/faq` | Informational, pre-purchase | `FAQs — Products, Delivery and Returns · Belurae` | Grouped topics | "Frequently asked questions" | FAQPage (visible), Breadcrumb | self | index | PDP, shipping, returns, guides | All consolidated | Product + policy facts | Static | Tag `faq` |
| **Blog / Journal hub** `/journal` | Informational browse | `Journal — Beauty & Wellness · Belurae` | Hub description | "Journal" | CollectionPage + ItemList (Blog) | self; `?page=N` self | index | Latest articles, guides hub | — | Topics | ISR (1 day) | Tag `journal` |
| **Article** `/journal/[slug]`, `/guides/[slug]` | Informational / how-to | `{H1} · Belurae Guides` | Summary box | Question-shaped H1 | Article/BlogPosting, Breadcrumb, (FAQPage) | self | index (quality-gated) | Products, related, ingredients | Guide's core question | Topic, product, ingredient | Static (MDX, prerendered) | Build + tag `content:{slug}` |
| **Search** `/search?q=` | Internal | `Search · Belurae` | — | "Search results for '{q}'" | none | `/search` | **noindex, follow** | Results | — | — | Dynamic | `no-store`; Storefront search responses cached 60 s per query server-side |
| **Cart** `/cart` | Transactional | `Your bag · Belurae` | — | "Your bag" | none | `/cart` | **noindex, nofollow** | Continue shopping | — | — | Dynamic | `private, no-store` |
| **Account** `/account/*` | Private | `Account · Belurae` | — | Per page | none | — | **noindex, nofollow** (+ robots disallow) | — | — | — | Dynamic (auth) | `private, no-store` |
