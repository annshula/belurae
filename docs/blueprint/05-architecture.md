# 05 — Technical Architecture

Covers brief §19–23 · §21 Next.js · §22 Shopify · §23 API · §24 Rendering · §25 Caching · §26 Webhooks · §27 Image · §28 Video · §29 Core Web Vitals · §30 Performance budget · §36 Components · §37 Folders · §38 Environment variables.

Version note: written against **Next.js 16 (App Router, React 19, `proxy.ts`, Cache Components)** and **Shopify API version 2026-07**. Pin exact versions in `package.json` and `lib/shopify/config.ts`; confirm the cache API signatures (`"use cache"`, `cacheTag`, `cacheLife`, `revalidateTag`) against the installed Next release when implementation starts.

---

## 21. Next.js architecture

```
Browser
  │  HTML (prerendered/ISR from Vercel CDN)  +  small client islands
  ▼
Next.js on Vercel
  ├─ proxy.ts           security headers (CSP), redirects map, /account presence guard
  ├─ Server Components  all page composition + data fetching (default)
  ├─ Server Actions     cart mutations, newsletter, review submit (POST, origin-checked)
  ├─ Route Handlers     webhooks, predictive search, OAuth callbacks, CSP reports
  └─ lib/shopify/*      the ONLY place that talks to Shopify  ← server-only
  ▼
Shopify
  ├─ Storefront API (private token, server-side)   products, collections, cart, search
  ├─ Customer Account API (OAuth 2 + PKCE)          login, orders, addresses
  ├─ Admin API (client-credentials, scripts+webhooks only)  inventory lookups, customer marketing consent, webhook registration
  └─ Hosted Checkout (checkout.belurae.com)
```

Principles:

1. **Server Components by default.** A file gets `"use client"` only if it needs state, effects, or browser APIs. The PDP page itself is a Server Component; client islands are `VariantSelector`, `AddToBag`, `GalleryController`, `StickyBuyBar`, `CartDrawer`, `ReviewFilters`, `VideoPlayer`, `SearchDialog`.
2. **Islands receive serialisable, minimal props** (variant ids, prices, availability) — never whole Shopify objects.
3. **`import "server-only"`** at the top of every `lib/shopify/*`, `lib/security/*` module → build fails if a client file imports it.
4. **No global client state library.** Cart state = server truth + `useOptimistic`; a tiny React context exposes `openCart()` and the line count.

---

## 22. Shopify architecture

### Data layer (`lib/shopify/`)

```
lib/shopify/
  config.ts            API version, endpoints, env validation (zod)
  client.ts            storefrontFetch<T>(query, vars, {tags, cache}) — typed, retries 429 w/ backoff, timeout 8s
  admin.ts             adminFetch — client-credentials token, server-only, scripts/webhooks only
  customer-account.ts  OAuth/PKCE, token refresh (ported from reference/)
  fragments/           product-card.ts, product-detail.ts, variant.ts, image.ts, money.ts, seo.ts
  queries/             product.ts, collection.ts, search.ts, recommendations.ts, menu.ts, shop.ts, policies.ts, metaobjects.ts
  mutations/           cart.ts
  products.ts          getProduct(handle), getProductHandles(), getProductCard(id)
  collections.ts       getCollection(handle, {page, filters, sort})
  cart.ts              getCart(), addLines(), updateLines(), removeLines(), attachBuyer()
  search.ts            search(q), predictiveSearch(q)
  recommendations.ts   getComplementary(productId)
  webhooks.ts          verifyHmac(), topicToTags()
  mappers.ts           Shopify shape → domain types (strip edges/nodes, normalise money)
  types.ts             generated GraphQL types (graphql-codegen) + domain types
```

- **GraphQL codegen** (`@graphql-codegen/cli` with Shopify's Storefront schema) → typed queries at build, zero runtime cost.
- **Fragments per surface**: a product card requests ~15 fields; the PDP requests the full set. No over-fetching.
- **Mappers** convert to domain types (`Product`, `Variant`, `Money`, `Image`, `Ingredient`) so components never see Shopify's edge/node shape — swapping the backend later touches only `lib/shopify`.

### Shopify data model (store configuration)

| Object | Fields / metafields (`belurae.*` namespace) |
|---|---|
| Product | title, handle, description (short), SEO title/desc, images/videos (alt set), product taxonomy category, vendor |
| Product metafields | `benefit_line` (single line), `format`, `size`, `scent`, `time_on_skin`, `inci_full` (multi-line), `key_ingredients` (list → `ingredient` metaobject refs), `directions` (rich text, R2), `warnings` (rich text, R2 verbatim), `patch_test` (rich text), `areas_allowed` (list), `areas_not_allowed` (list), `in_the_box` (list), `documents` (list of file refs, R5), `faq` (list → `faq_item` metaobject refs), `pairs_with` (list product refs), `routine_step` (single select), `gtin` (R12), `manufacturer` (text, D1) |
| Variant options | `Set` (Mousse / Mousse + Serum / Mousse + Cream) × `Pack` (1 / 2 / 3) |
| Metaobject `ingredient` | name, inci_name, slug, function, description, why_included, image |
| Metaobject `faq_item` | question, answer (rich text), source |
| Collections | handle, description (intro), SEO, image, metafields: `education` (rich text), `faq` (refs) |
| Menus | `main-menu`, `footer` (fetched via Storefront `menu`) |
| Policies | shipping, refund, privacy, terms (Storefront `shop { shippingPolicy … }`) |

Rich-text metafields are rendered by our own serializer to React elements (no `dangerouslySetInnerHTML`). Product `descriptionHtml` is sanitised server-side (allowlist) if ever used.

---

## 23. API architecture

| Endpoint | Kind | Auth | Purpose | Cache |
|---|---|---|---|---|
| `cartAdd / cartUpdate / cartRemove` | Server Actions | Cart cookie (httpOnly); Next origin check | Cart mutations | none |
| `subscribeNewsletter` | Server Action | Rate limit + honeypot + (Turnstile only if abuse appears) | Admin `customerCreate`/`customerEmailMarketingConsentUpdate` with confirmed opt-in | none |
| `GET /api/search/suggest?q=` | Route Handler | Public, rate-limited | Predictive search | `s-maxage=60` per normalised q |
| `POST /api/webhooks/shopify` | Route Handler | HMAC | Revalidation (§26) | none |
| `GET /account/authorize`, `/account/callback`, `/account/logout` | Route Handlers | OAuth state + PKCE | Customer login (ported) | none |
| `POST /api/revalidate` | Route Handler | Bearer secret (timing-safe) | Manual/CI revalidation | none |
| `POST /api/csp-report` | Route Handler | Public, rate-limited, body ≤ 8 KB | CSP violation intake → log drain | none |
| `POST /api/reviews` | Route Handler/Action | Verified buyer token from Judge.me flow | Only if on-site review form is built | none |

No public REST endpoint exposes cart, prices or customer data. Prices are **never** accepted from the client — the client sends `variantId` + `quantity`; Shopify prices the cart.

---

## 24. Rendering strategy

| Page | Strategy | Why | Dynamic parts |
|---|---|---|---|
| Home | **Static** (prerendered at build) + tag revalidation | Mostly brand content; featured product data is cached and tag-invalidated | Cart count (client island reads cookie-derived count via small action after hydration) |
| Brand pages (`/pages/*`), guides, ingredients, journal | **Static** (MDX / metaobjects at build) | Evergreen | none |
| Collections | **ISR** (`generateStaticParams` for known handles, others on-demand) | Changes when products change | Filtered views render dynamically (`searchParams`), `noindex` |
| PDP | **ISR** static shell with streamed sections | Price/availability/content change via webhooks | Reviews in `<Suspense>` (cached separately, tag `reviews:*`); variant selection is client state over static data |
| Journal hub | ISR, 1-day fallback | New posts | none |
| Search | **Dynamic** | Query-dependent | all |
| Cart page | **Dynamic** | Per user | all |
| Account | **Dynamic**, auth required | Per user | all |
| Checkout | Shopify | — | — |

Per-user data never enters a cached render: cart and customer are read only in dynamic routes, Server Actions, or client islands.

---

## 25. Caching architecture

### Layers

```
① Browser cache      static assets: immutable, 1 year (hashed filenames)
② Vercel CDN         prerendered + ISR HTML/RSC payloads; purged by tag revalidation
③ Next data cache    "use cache" functions in lib/shopify, tagged
④ Shopify CDN        images/videos/files (cdn.shopify.com), versioned URLs (?v=)
⑤ Shopify API        source of truth
```

### Tags and lifetimes

| Data | Function | Tags | `cacheLife` (stale / revalidate / expire) | Invalidated by |
|---|---|---|---|---|
| Product detail | `getProduct(handle)` | `products`, `product:{handle}` | 5 min / 1 h / 1 day | `products/update`, `products/delete`, inventory flip |
| Product card | `getProductCard(id)` | `products`, `product:{handle}` | same | same |
| Collection | `getCollection(handle, page)` | `collections`, `collection:{handle}` | 5 min / 1 h / 1 day | `collections/update`, `collections/delete`, `products/*` for member products |
| Reviews | `getReviews(productId)` | `reviews:{handle}` | 10 min / 6 h / 7 days | Judge.me webhook (review published) or time |
| Recommendations | `getRecommendations(handle)` | `recs:{handle}`, `products` | 1 h / 1 day / 7 days | product webhooks |
| Menus, shop, policies | `getMenu`, `getShop` | `menus`, `shop` | 1 h / 1 day / 30 days | `shop/update`, manual |
| Ingredients/FAQ metaobjects | `getIngredient(slug)` | `ingredient:{slug}`, `metaobjects` | 1 day / 7 days / 30 days | `metaobjects/update` (if available on the API version) or manual |
| Redirect map | `getRedirects()` | `redirects` | 1 h / 1 day / 7 days | manual/CI |
| Search suggest | route handler | — | CDN `s-maxage=60, stale-while-revalidate=300` | time |
| Cart, customer | — | — | **never cached** (`no-store`) | — |

### Behaviour on change

1. Shopify fires webhook → handler verifies → maps to tags → `revalidateTag(tag)`.
2. **Price / availability / deletion**: expire immediately (next request re-renders with fresh data).
3. **Copy/media changes**: stale-while-revalidate (next visitor gets the old page, triggers background regeneration).
4. **Missed webhook safety net**: the `revalidate` lifetime (1 h) guarantees convergence even if a webhook is lost.
5. **Stale price protection at checkout**: irrelevant for correctness — Shopify prices the cart. The only risk is a displayed price ≠ checkout price for ≤ 1 h if a webhook fails; monitored by a nightly job comparing cached vs live prices (log alert).
6. No full rebuild is ever required for catalogue changes; deploys are only for code/content-in-repo changes.

---

## 26. Webhook strategy

### Topics

| Topic | Action |
|---|---|
| `products/create` | `revalidateTag('products')`, sitemap tag |
| `products/update` | `product:{handle}`, `recs:{handle}`, and `collection:{h}` for each collection the product belongs to (from payload/Admin lookup); if handle changed → add redirect old→new |
| `products/delete` | `product:{handle}` (page returns 404/410 → or redirect to collection if configured), `products`, sitemap |
| `inventory_levels/update` | Look up variant → product (Admin, cached). Revalidate `product:{handle}` **only if variant availability flips** (in stock ↔ out); last-known state in Redis. Prevents revalidation storms on every sale. |
| `collections/update`, `collections/delete` | `collection:{handle}`, `collections` |
| `shop/update` | `shop` |
| `app/uninstalled` | alert |

### Handler contract (`app/api/webhooks/shopify/route.ts`)

1. `runtime = "nodejs"`; read **raw body** (`await req.text()`), max 1 MB.
2. Compute `HMAC-SHA256(rawBody, SHOPIFY_WEBHOOK_SECRET)` → base64 → `crypto.timingSafeEqual` against `X-Shopify-Hmac-Sha256`. Mismatch → `401`, no detail.
3. Check `X-Shopify-Shop-Domain === SHOPIFY_STORE_DOMAIN` and `X-Shopify-API-Version` is expected (log if not).
4. Idempotency: `SET NX webhook:{X-Shopify-Event-Id or X-Shopify-Webhook-Id}` with 24 h TTL in Upstash Redis → duplicate → `200` no-op.
5. Parse with zod schema per topic (only the fields we use).
6. Respond `200` quickly; do follow-up lookups in `after()`.
7. Structured log: topic, handle, tags revalidated, duration (no payload PII).

Registration via `scripts/register-webhooks.ts` (ported), idempotent, API version pinned; runs in CI on deploy to production.

---

## 27. Image architecture

- **Source**: all commerce and editorial images uploaded to Shopify (Files or product media) with alt text → served by `cdn.shopify.com`.
- **Delivery**: `next/image` with a **custom Shopify loader** (`lib/media/shopify-loader.ts`) that appends `width` (and `height`/`crop` when art-directed) to the CDN URL. Shopify's CDN negotiates WebP/AVIF from the `Accept` header and caches globally — no second optimisation hop, no Vercel image-optimisation cost. Local `/public` images (logo, OG fallback) use Next's default optimiser.
- **Responsive**: accurate `sizes` per slot (e.g. PDP main `(min-width: 1024px) 58vw, 100vw`); `deviceSizes` = `[360, 480, 640, 828, 1080, 1280, 1600, 1920, 2400]`.
- **Art direction**: `<picture>` with `<source media>` for hero (16:9 desktop vs 4:5 mobile) using `getImageProps()`.
- **Aspect ratio** always reserved (`width`/`height` from Shopify metadata) → CLS 0 from images.
- **Priority**: exactly one `priority`/`fetchPriority="high"` image per page (the LCP element). Everything else `loading="lazy"`.
- **Placeholders**: solid `--surface` colour (zero bytes) for most; tiny blurred LQIP (≤ 400 bytes base64, generated at build for static/editorial images) only for large hero/editorial images.
- **Quality**: AVIF/WebP q≈70 for photos; product packshots q≈80.

---

## 28. Video architecture

| Use | Source | Format | Size target | Loading | Controls |
|---|---|---|---|---|---|
| Home hero loop | Shopify-hosted video | MP4 H.264 720p mobile / 1080p desktop (Shopify renditions), 6–8 s, no audio track | ≤ 1.5 MB mobile, ≤ 3 MB desktop | Poster is LCP; `<video preload="none">` gets `src` after `load` + in viewport + no Save-Data + no reduced motion | Visible pause button (WCAG 2.2.2), `muted playsInline loop` |
| PDP demo (gallery) | Shopify | MP4 720p, 15–30 s | ≤ 4 MB | Click-to-play, `preload="none"`, poster | Native controls, captions |
| How-to video | Shopify | MP4 1080p/720p via `<source media>`, or HLS (native Safari; hls.js only lazy-loaded on non-Safari if HLS chosen) | — | Click-to-play | Captions (WebVTT, required), transcript in HTML |
| Product card hover | Shopify | MP4 480p, 3–4 s | ≤ 400 KB | Fetched on `pointerenter` (fine pointers only) | none (decorative) |

Rules: every video has a poster, captions where speech/text exists, and the same information available as text on the page. No third-party video embeds (YouTube) on commerce pages — use a click-to-load facade on journal pages if ever needed.

---

## 29. Core Web Vitals strategy

### Targets (p75, field data from Vercel Speed Insights / CrUX, mobile)

| Metric | Target | "Good" threshold |
|---|---|---|
| LCP | ≤ 2.0 s | 2.5 s |
| INP | ≤ 150 ms | 200 ms |
| CLS | ≤ 0.05 | 0.1 |
| FCP | ≤ 1.5 s | 1.8 s |
| TTFB | ≤ 0.4 s (CDN hit) | 0.8 s |

### LCP element per page

| Page | LCP element | Tactics |
|---|---|---|
| Home | Hero poster (mobile 4:5 crop) | `priority`, `fetchPriority=high`, preload via `getImageProps` in `<head>`, ≤ 80 KB AVIF at 828w, no JS dependency, video deferred |
| Collection | Category image (mobile) / H1 (desktop) | `priority` on category image only |
| PDP | Gallery image #1 | `priority`, gallery JS doesn't gate first image render (image is plain server HTML; controller hydrates around it) |
| Guide/Journal | H1 text or lead image | Fonts preloaded (sans); lead image `priority` if above fold |

### INP

- Client islands are small; no hydration of the whole page.
- Variant switch = pure client state over prefetched data (no network wait); URL updated with `replaceState` inside `startTransition`.
- Add-to-bag uses `useOptimistic` — drawer opens immediately, server confirms.
- No Lenis / GSAP / scroll listeners; reveal effects use CSS + one shared `IntersectionObserver` (or none at all under reduced motion).
- Third-party scripts deferred until after consent **and** `requestIdleCallback`.

### CLS

- All media has reserved aspect ratios; fonts use `next/font` fallback metrics; announcement bar and header have fixed heights server-rendered; cart count renders in a fixed-width slot; review stars block reserves height (or is absent server-side, never inserted above content later).

### TTFB

- Static/ISR pages served from CDN. Dynamic routes (cart/account) run in the region nearest Shopify's API (US East) to minimise API latency.

---

## 30. Performance budget

Enforced in CI (`size-limit` for JS, a Playwright script measuring transferred bytes per route, Lighthouse CI as a smoke test — field data remains the real measure).

| Resource | Budget (compressed, per route) | Reasoning |
|---|---|---|
| HTML document (incl. inline RSC payload) | Home ≤ 45 KB · PDP ≤ 70 KB · Collection ≤ 60 KB | PDP carries FAQ, ingredients, reviews in HTML (worth it for SEO/AEO); keep RSC payload lean via minimal island props |
| CSS | ≤ 22 KB total, inlined in `<head>` (`experimental.inlineCss`) | Tailwind v4 output for this design is ~15–20 KB; inlining removes a render-blocking request |
| JavaScript — framework baseline | ~100 KB (Next 16 + React 19 runtime, not controllable) | Baseline measured, not budgeted |
| JavaScript — route-specific | Home ≤ 15 KB · PDP ≤ 35 KB · Collection ≤ 20 KB · Cart drawer lazy chunk ≤ 12 KB | Islands only; drawer code loads on first open or idle |
| Fonts | ≤ 2 files preloaded-or-early, ≤ 110 KB total | Hanken roman (preload) + Newsreader roman; italic lazy |
| LCP image | Mobile ≤ 80 KB · Desktop ≤ 180 KB | AVIF at correct width |
| Above-the-fold total (mobile, first view) | ≤ 350 KB | HTML + CSS + JS + fonts + LCP image |
| Third-party JS before consent | **0 KB** | Privacy + INP |
| Third-party JS after consent | ≤ 60 KB, deferred to idle | GA4 (~50 KB) or lighter alternative |
| Hero video | Loaded after `load`; ≤ 1.5 MB mobile | Never competes with LCP |
| Requests before LCP | ≤ 8 | HTML, CSS (inlined → 0), 2 fonts, LCP image, framework chunks |

A PR that exceeds a budget fails CI unless the budget file is changed in the same PR with a written reason.

---

## 36. Component architecture

```
components/
  layout/        AnnouncementBar · Header · MegaMenu (client: disclosure) · MobileMenu (client) · Footer · SkipLink
  commerce/      ProductCard · ProductGrid · Price · SavingsLabel · QuickAdd (client)
    pdp/         ProductGallery (server) + GalleryController (client) · ProductPurchasePanel (server)
                 · VariantSelector (client) · PackSelector (client) · AddToBag (client) · StickyBuyBar (client)
                 · TrustList · SafetyNotice · IngredientTable · FullIngredientList · SpecsList
                 · DocumentsList · ComparisonTable · WhatsInTheBox
    cart/        CartProvider (client, minimal) · CartDrawer (client, lazy) · CartLine (client) · ShippingProgress · CartRecommendation
    collection/  CollectionHeader · FilterForm (server form + client enhance) · SortSelect · Pagination
    reviews/     ReviewSummary · ReviewList (server first page) · ReviewFilters (client) · ReviewMedia
    search/      SearchDialog (client, lazy) · SearchResults
  content/       Hero · EditorialSplit · HowToSteps · IngredientCard · FAQ (details/summary) · ArticleCard
                 · ArticleLayout · SummaryBox · Callout · RoutineMap · Newsletter (form + action)
  media/         ShopifyImage · ArtDirectedImage · VideoPlayer (client) · HeroVideo (client) · Captions
  seo/           JsonLd · Breadcrumbs
  ui/            Button · Link · Chip · RadioCard · Accordion · Dialog · Sheet · Toast · VisuallyHidden · Icon (≤ 12 icons)
  analytics/     ConsentBanner (client) · AnalyticsLoader (client, post-consent)
```

Rules: server components own data + markup; client components own interaction only; components never call Shopify directly (they receive domain types); every interactive component ships with keyboard behaviour + a Playwright a11y test.

---

## 37. Folder structure

```
belurae/
├─ app/
│  ├─ (shop)/
│  │  ├─ page.tsx                          Home
│  │  ├─ collections/[handle]/page.tsx
│  │  ├─ products/[handle]/page.tsx
│  │  ├─ products/[handle]/opengraph-image.tsx
│  │  ├─ search/page.tsx
│  │  └─ cart/page.tsx
│  ├─ (content)/
│  │  ├─ guides/page.tsx · guides/[slug]/page.tsx
│  │  ├─ journal/page.tsx · journal/[slug]/page.tsx
│  │  ├─ ingredients/page.tsx · ingredients/[slug]/page.tsx
│  │  └─ pages/[slug]/page.tsx
│  ├─ account/…                            (ported from reference/, dynamic)
│  ├─ api/
│  │  ├─ webhooks/shopify/route.ts
│  │  ├─ search/suggest/route.ts
│  │  ├─ revalidate/route.ts
│  │  └─ csp-report/route.ts
│  ├─ actions/                             cart.ts · newsletter.ts   ("use server")
│  ├─ fonts/                               *.woff2 + index.ts (next/font/local)
│  ├─ layout.tsx · not-found.tsx · error.tsx · global-error.tsx
│  ├─ robots.ts · sitemap.ts (+ sitemap/[type]/route.ts) · manifest.ts · icon.tsx
│  └─ globals.css                          @import tokens, @theme, base layer
├─ components/                             (see §36)
├─ content/
│  ├─ guides/*.mdx · journal/*.mdx · pages/*.mdx
│  ├─ claims-register.md                   every claim → source → date
│  ├─ search-synonyms.ts
│  └─ nav.ts                               fallback nav if Shopify menu unavailable
├─ lib/
│  ├─ shopify/                             (see §22) server-only
│  ├─ commerce/                            recommendations.ts · bundles.ts (savings math) · availability.ts
│  ├─ content/                             mdx.ts · graph.ts (internal links) · search-index.ts
│  ├─ seo/                                 metadata.ts (builders) · canonical.ts · robots.ts · redirects.ts
│  ├─ schema/                              organization.ts · product.ts · breadcrumb.ts · article.ts · faq.ts · video.ts · collection.ts
│  ├─ analytics/                           events.ts (typed) · consent.ts · shopify-analytics.ts · ga4.ts
│  ├─ security/                            csp.ts · headers.ts · hmac.ts · rate-limit.ts · session.ts (from reference/) · validate.ts
│  ├─ media/                               shopify-loader.ts · video.ts
│  └─ utils/                               cn.ts · money.ts · format.ts
├─ hooks/                                  useInView.ts · useReducedMotion.ts · useMediaQuery.ts
├─ types/                                  domain.ts · shopify.generated.ts (codegen output)
├─ styles/                                 tokens.css (primitive + semantic + component tokens)
├─ public/                                 logo.svg · og-default.jpg · llms.txt
├─ scripts/                                register-webhooks.ts · sync-redirects.ts · content-gaps.ts · check-claims.ts
├─ tests/                                  unit (vitest) · e2e + a11y (playwright + axe) · schema snapshots
├─ docs/blueprint/                         this blueprint
├─ proxy.ts                                CSP + redirects + account guard
├─ next.config.ts · codegen.ts · .size-limit.json · .env.example
└─ reference/                              previous storefront (read-only; delete after port)
```

`app/`: routing and composition only (thin pages). `components/`: presentational + islands. `lib/`: all logic and integrations. `content/`: human-edited, claims-checked text. `types/`: shared types. `scripts/`: operational tasks run by CI or humans.

---

## 38. Environment variables

| Variable | Public? | Used in | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | canonical, schema | `https://belurae.com` |
| `SHOPIFY_STORE_DOMAIN` | server | client, webhook domain check | `belurae.myshopify.com` |
| `SHOPIFY_API_VERSION` | server | config | pinned, e.g. `2026-07` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | **secret** | lib/shopify/client | Headless channel private token; server-only |
| `SHOPIFY_ADMIN_CLIENT_ID` / `SHOPIFY_ADMIN_CLIENT_SECRET` | **secret** | lib/shopify/admin | Least-privilege scopes: `read_products`, `read_inventory`, `write_customers` (newsletter), `read_online_store_navigation` if needed |
| `SHOPIFY_WEBHOOK_SECRET` | **secret** | webhook HMAC | |
| `SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID` | server | OAuth | Public client per Shopify, still kept server-side |
| `SHOPIFY_CUSTOMER_ACCOUNT_API_URL` / `…_AUTH_URL` | server | OAuth | |
| `SESSION_SECRET` | **secret** | encrypted session cookie | 32+ random bytes; rotate with dual-key support |
| `REVALIDATE_SECRET` | **secret** | /api/revalidate | |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | **secret** | rate limit, webhook idempotency | |
| `JUDGEME_PRIVATE_TOKEN` / `JUDGEME_SHOP_DOMAIN` | **secret** / server | reviews | |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | public | analytics (post-consent) | optional |
| `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID` | public | Shopify analytics events | |
| `CSP_REPORT_URI` | server | proxy.ts | optional external collector |

Rules:

1. Validated at boot with zod in `lib/shopify/config.ts` / `lib/env.ts`; missing secret → build fails, not a runtime 500.
2. Only `NEXT_PUBLIC_*` can reach the browser; a CI script greps the client bundle for known secret prefixes (`shpat_`, `shpss_`, token patterns) and fails on match.
3. Secrets live in Vercel encrypted env vars, separate for Preview and Production (preview uses a Shopify **development store**).
4. `.env.local` is git-ignored; `.env.example` lists names only. (Note: `reference/.env` exists on disk — make sure it is never committed and rotate any tokens in it that were ever shared.)
