# 02 — Experience

Covers brief §6 IA · §7 Homepage · §8 Collection · §9 PDP · §10 Cart · §18 Mobile · §59 Visual asset spec.

Launch rule: **a nav item or category ships only when it has at least one real product or one real article behind it.** Empty categories are hidden, not "coming soon".

---

## 6. Information architecture

### Sitemap

```
/                                   Home
/collections/all                    Shop all
/collections/hair-removal           ← launch (hero product)
/collections/aftercare              ← launch only if R14 confirms a product (serum/cream sold separately?)
/collections/body-care              ┐
/collections/skin-care              │ hidden until products exist
/collections/intimate-care          │
/collections/bundles                ← launch (1/2/3 packs and Spray+X sets qualify)
/collections/best-sellers           ← hidden until sales data is meaningful (≥ 3 products)
/collections/new-arrivals           ← hidden until ≥ 2 launches
/products/[handle]                  PDP
/ingredients                        Ingredient index
/ingredients/[slug]                 Aloe, glycerin, hyaluronic acid, ginseng, portulaca, + depilatory active (R1)
/guides                             Guide hub
/guides/[slug]                      Evergreen guides
/journal                            Beauty & Wellness Journal (brief calls it /blog → see 04 §25)
/journal/[slug]
/pages/philosophy                   Why Belurae → Our Philosophy
/pages/how-it-works                 Why Belurae → How It Works
/pages/standards                    Why Belurae → Our Standards (claims policy, sourcing, documentation)
/pages/about                        Our Story + Mission (one page at launch, anchors #story #mission)
/pages/contact
/pages/faq
/pages/shipping  /pages/returns  /pages/privacy  /pages/terms  /pages/accessibility
/search                             noindex
/cart                               noindex (drawer is primary; page is the no-JS fallback)
/account/*                          noindex, auth
```

### Primary navigation (desktop)

```
[BELURAE]     Shop ▾   Why Belurae ▾   Learn ▾   About          [Search] [Account] [Bag (1)]
```

- **Shop** opens a **mega-menu** (justified: it combines categories + a featured product + a guide link, which raises discoverability for a thin early catalogue).
- **Why Belurae** and **Learn** open simple dropdown lists (≤ 7 links each).
- **About** is a direct link.
- **Wishlist: not at launch.** One hero product and < 5 SKUs don't justify it (extra client JS, account complexity). Revisit at ≥ 12 products.

Mega-menu (Shop):

```
┌──────────────────────────────────────────────────────────────────────────┐
│ CATEGORIES           ROUTINES              FEATURED                      │
│ Hair Removal         Bundles & sets        [image 4:5]                   │
│ Aftercare*           The complete routine  Hair Removal Mousse           │
│ Shop all                                   $39.99 · Shop now →           │
│                      LEARN                                               │
│                      How to use hair removal mousse →                     │
└──────────────────────────────────────────────────────────────────────────┘
  * only when a product exists
```

Menu behaviour: opens on click (not hover-only), `aria-expanded`, Escape closes, focus returns to trigger, links are real `<a href>` rendered in HTML for crawlers.

### Mobile navigation

Header: `[☰] [BELURAE] [🔍] [Bag]`. Account lives inside the menu sheet.
Menu = full-height sheet with accordion groups (Shop / Why Belurae / Learn / About), then Account, Contact, shipping line.

### Footer

```
BELURAE                                   Shop            Learn           Why Belurae      Customer care
Beauty, made simpler.                     Hair Removal    Guides          Philosophy       Contact
Thoughtful care for everyday rituals.     Bundles         Ingredients     How it works     Shipping
                                          Shop all        Journal         Standards        Returns
[Newsletter field]                                        FAQ             About            Track order
────────────────────────────────────────────────────────────────────────────────────────────────────
© 2026 [Legal entity, R9] · Privacy · Terms · Accessibility · Cookie settings     [IG] [TT] [Pin]  [payment icons]
```

Payment icons: only methods actually enabled in Shopify Payments (read from `shop.paymentSettings.acceptedCardBrands` + wallets).

---

## 7. Homepage wireframe

Intended LCP element: **hero poster image**. Everything above the fold is server-rendered; zero client JS required to read or navigate it.

```
┌─ 1. ANNOUNCEMENT BAR (36px, surface-muted, body-s) ─────────────────────┐
│  Tracked delivery on every order  ·  Secure checkout                     │  ← rotating = no. Static, max 2 facts.
└──────────────────────────────────────────────────────────────────────────┘
┌─ HEADER (64px, sticky, ivory; hairline on scroll) ──────────────────────┐
└──────────────────────────────────────────────────────────────────────────┘
┌─ 2. HERO (desktop 100vh max 860px; mobile 88svh) ───────────────────────┐
│ [full-bleed poster image → 6–8s muted loop after load]                   │
│                                                                          │
│   BELURAE                                   (eyebrow)                    │
│   Beauty,                                                                │
│   made simpler.                             (display-xl, Newsreader)     │
│   Thoughtful personal care for everyday rituals.  (body-l)               │
│   [ SHOP HAIR REMOVAL ]   Discover Belurae →                             │
│                                                        [❚❚ pause video]  │
└──────────────────────────────────────────────────────────────────────────┘
   Desktop: text on the left third over a light scrim. Mobile: image top
   (4:5), text block below on ivory — no text over busy imagery on small screens.

┌─ 3. TRUST STRIP (surface-muted, 4 items, text-first, 1 hairline icon each)┐
│ Full ingredient list  │ Clear usage guidance │ Tracked delivery │ Secure checkout │
└──────────────────────────────────────────────────────────────────────────┘
   Each item links to its proof (ingredients anchor, how-to, shipping page).
   Mobile: 2×2 grid, not a marquee.

┌─ 4. SHOP BY NEED (heading-2 + editorial cards) ─────────────────────────┐
│  [Hair Removal 4:5]  [Bundles 4:5]  [Aftercare* 4:5]                     │
│  Card = photo + title + one line + arrow. Only live categories render.   │
└──────────────────────────────────────────────────────────────────────────┘
   With 2–3 live categories use a 2-up/3-up editorial layout, not a
   5-card grid with gaps. Mobile: horizontal scroll-snap row, 80% card width.

┌─ 5. BEST SELLERS → at launch titled "The essentials" ───────────────────┐
│  ProductCard ×N (see §Cards). Grid 4 / 2 cols. Hidden if < 2 products.   │
└──────────────────────────────────────────────────────────────────────────┘
   At launch (1 product with 3 styles) → replace with section 6 moved up.

┌─ 6. HERO PRODUCT STORY (split 7/5) ─────────────────────────────────────┐
│ [video/image 4:5, sticky on desktop]  │ HAIR REMOVAL                      │
│                                       │ Meet a simpler way to remove       │
│                                       │ unwanted hair.                     │
│                                       │ What it is · How it's used ·       │
│                                       │ Who it's for · Key ingredients ·   │
│                                       │ Worth knowing (patch test, areas)  │
│                                       │ $39.99   [ SHOP NOW ]              │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 7. HOW IT WORKS (4 steps, numbered, each with a real photo 1:1) ────────┐
│ 01 Prepare   02 Apply   03 Wait 5–10 min*   04 Wipe & rinse              │
│ [ ▶ Watch the 45-second routine ] (captioned video, click-to-play)       │
│ * exact wording from packaging (R2)                                      │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 8. INGREDIENT STORY — "Care, clearly." ────────────────────────────────┐
│ [ingredient photo]  Aloe leaf water — what it is / why it's there        │
│ …only R1-confirmed ingredients…                                          │
│ See the full ingredient list →  (/products/…#ingredients)                │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 9. SOCIAL PROOF ───────────────────────────────────────────────────────┐
│ Renders only when ≥ 5 verified reviews exist. Otherwise → omitted.       │
│ Pre-review alternative: "What to expect" — honest first-use notes        │
│ (smell, timing, tingling = rinse) from packaging + support FAQs.         │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 10. WHY BELURAE (surface, 3 columns) ──────────────────────────────────┐
│ Simple · Clear · Considered   — each: one sentence + link to Standards   │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 11. ROUTINES / BUNDLES — "The complete routine" ───────────────────────┐
│ Starter (Mousse ×1) · Routine (Mousse + Serum) · Stock-up (×3)           │
│ Only real Shopify variants/bundles. See 03 §12.                          │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 12. EDUCATION (3 article cards, image 3:2) ────────────────────────────┐
│ How to use hair removal mousse · How to patch test · Aftercare basics    │
└──────────────────────────────────────────────────────────────────────────┘

┌─ 13. FAQ (6 questions, <details>, answers in HTML) ─────────────────────┐
└──────────────────────────────────────────────────────────────────────────┘

┌─ 14. EMAIL — "Make your routine a little simpler." ─────────────────────┐
│ One field + Subscribe. "Guides and new products. Unsubscribe anytime."   │
│ No discount bait, no popup. Double opt-in.                               │
└──────────────────────────────────────────────────────────────────────────┘
┌─ 15. FOOTER ────────────────────────────────────────────────────────────┐
```

### Product card

```
┌──────────────────┐
│ [image 4:5]      │  hover (desktop, pointer:fine): crossfade to 2nd image;
│                  │  optional 3–4s muted clip only if < 400 KB, loaded on hover
│ [+ Quick add]    │  quick add: single-variant → adds; multi → opens bottom sheet/popover
├──────────────────┤
│ Hair Removal Mousse           (heading-3)
│ Spray mousse · 140 ml          (body-s, secondary)
│ ★★★★☆ 4.6 (38)                (only if verified, ≥ 5 reviews)
│ $39.99  [$45.99 only if a real prior price exists]
│ ○ Spray ○ +Serum ○ +Cream      (swatch-style text chips, max 3)
└──────────────────┘
```

---

## 8. Collection page wireframe (`/collections/hair-removal`)

LCP: category hero image (mobile) / H1 text + image (desktop).

```
Home / Shop / Hair Removal                                     (breadcrumb)
┌────────────────────────────┬─────────────────────────────────────────────┐
│ Hair Removal (H1)          │ [category image 3:2, priority]              │
│ 80–120 word intro: what    │                                             │
│ at-home methods exist, what│                                             │
│ Belurae offers, who it's   │                                             │
│ for. Links: guide, ingred. │                                             │
└────────────────────────────┴─────────────────────────────────────────────┘
[Filter ▾ Format · Area · Set size]   [Sort: Featured ▾]     3 products
┌────────┬────────┬────────┬────────┐
│ card   │ card   │ card   │ card   │   grid 4 / 3 / 2 cols
└────────┴────────┴────────┴────────┘
Pagination: numbered links (?page=2), 24 per page. No infinite scroll.

── Choosing a method (educational, 300–600 words, H2s) ──────────────────
   Mousse vs cream vs razor vs wax — links to comparison guide.
── Comparison table (see §PDP comparison) ─────────────────────────────
── FAQ (4–6 category questions) ────────────────────────────────────────
── Related: Aftercare · Bundles · Guides ───────────────────────────────
```

Filters:

- Rendered as `<form method="get">` with checkboxes → works without JS; JS enhances to instant update.
- Filtered URLs: `noindex, follow` + canonical to the unfiltered collection. Only `?page=N` is indexable (self-canonical).
- Filters hidden when a collection has < 6 products (filters on 3 products are noise).

Mobile: filter + sort as two buttons opening a bottom sheet; product grid 2 cols; intro text clamped to 3 lines with "Read more" (full text still in HTML).

---

## 9. PDP wireframe (highest priority)

LCP: **first gallery image**. Price, name, and CTA server-rendered.

### Above the fold — desktop (7/5 split)

```
┌────────────────────────────────────────┬─────────────────────────────────┐
│ GALLERY (sticky column)                │ Home / Hair Removal / Mousse     │
│ ┌────────────────────────────┐ ┌────┐  │ HAIR REMOVAL                    │
│ │ main 4:5, priority         │ │thumb│ │ Belurae Hair Removal Mousse (H1)│
│ │                            │ │thumb│ │ ★★★★★ 4.7 · 38 verified reviews │ ← only if real
│ │                            │ │ ▶  │  │ No-blade hair removal for legs, │
│ │                            │ │thumb│ │ underarms and body. Spray, wait │
│ └────────────────────────────┘ └────┘  │ 5–10 minutes, wipe away.        │
│  desktop: 2-col editorial grid on       │                                 │
│  scroll (image pairs), not a carousel   │ $39.99                          │
│                                         │ Tax/shipping line               │
│                                         │                                 │
│                                         │ Choose your set                 │
│                                         │ [Mousse] [+ Serum] [+ Cream]    │
│                                         │  what's included, 1 line each   │
│                                         │                                 │
│                                         │ Choose your pack                │
│                                         │ ( ) 1 can      $39.99           │
│                                         │ (•) 2 cans     $69.99  Save $9.99│
│                                         │ ( ) 3 cans     $99.99  Save $19.98│
│                                         │  unavailable combos: disabled,  │
│                                         │  labelled "Not available"       │
│                                         │                                 │
│                                         │ [ − 1 + ]  [    ADD TO BAG    ] │
│                                         │ [  Buy now (Shop Pay)  ]        │
│                                         │                                 │
│                                         │ ✓ Tracked delivery, 3–8 days    │
│                                         │ ✓ Returns: [policy summary R8]  │
│                                         │ ✓ Secure checkout by Shopify    │
│                                         │ ✓ Full ingredient list ↓        │
│                                         │                                 │
│                                         │ ⓘ Patch test 24h before first   │
│                                         │   use. Not for face. [Details ↓]│
└────────────────────────────────────────┴─────────────────────────────────┘
```

Notes:

- "Most popular / Best value" labels only when backed by order data (Shopify Analytics query) or pure arithmetic ("lowest price per can" is arithmetic, so "Best value per can" is allowed on the 3-pack).
- Savings = `n × singlePrice − packPrice`. Compare-at shown only if a genuine prior price exists for that exact variant.
- The patch-test line sits **above the fold** — it's a trust signal, not small print.
- Variant state lives in the URL (`?variant=` via `history.replaceState`) so shared links restore selection; canonical stays `/products/[handle]`.

### Below the fold — section order

| # | Section | Content source | Render |
|---|---|---|---|
| 1 | Product story — "Smooth skin without turning your routine into a chore." | Brand copy (reviewed) | RSC |
| 2 | Benefits (3–4 cards with photo) | Only R6-substantiated or packaging-attributed | RSC |
| 3 | How to use (video + 6 steps: prepare, apply, wait, remove, rinse, aftercare) | R2 | RSC + client video |
| 4 | **Care, clearly — Ingredients** (key ingredients table + full INCI `<details open>` on desktop) | R1 metafields | RSC |
| 5 | **Safety & patch test** (where to use / not use, time limit, irritation steps, who should ask a doctor) | R2 verbatim | RSC |
| 6 | Comparison: mousse vs razor vs wax | Factual table below | RSC |
| 7 | What's in the box + specifications | Metafields | RSC |
| 8 | Documentation (inspectable PDFs, labelled "Manufacturer's SDS", "CPNP notification no. …") | R5 | RSC; section absent if none |
| 9 | Reviews | Judge.me (verified only) | RSC first page, client filters |
| 10 | FAQ (8–12 Qs) | R2 + support logs | RSC `<details>` |
| 11 | Complete the routine / Pairs well with | Shopify product refs metafield | RSC |
| 12 | Related guides | Content graph | RSC |

### Comparison table (factual, non-defamatory)

| | Hair removal mousse | Razor | Wax |
|---|---|---|---|
| How it works | Chemical formula breaks hair down at the skin surface; wiped away* | Blade cuts hair at the surface | Pulls hair out from the follicle |
| Blade involved | No | Yes | No |
| Pulling involved | No | No | Yes |
| Time per session | 5–10 min wait + application | A few minutes | Varies; salon or at-home |
| Hair length needed | Per packaging (R2) | Any | Usually a minimum length |
| Things to know | Patch test; can irritate sensitive skin; scent | Risk of nicks and razor bumps for some people | Can be uncomfortable; risk of irritation |

\* Mechanism wording confirmed against R1 before publishing. Regrowth-time rows are **omitted** unless the manufacturer substantiates them.

### PDP media gallery sequence

| # | Asset | Status |
|---|---|---|
| 1 | Hero product on ivory stone (4:5) | Shoot |
| 2 | Product in hand (scale) | Shoot |
| 3 | Mousse texture macro | Shoot |
| 4 | Application on leg | Shoot |
| 5 | Demonstration video (15–30 s, captioned, poster) | Shoot / existing Shopify videos after review |
| 6 | Ingredients flat-lay (R1 only) | Shoot |
| 7 | Documentation thumbnail (if R5) | From documents |
| 8 | How-to-use step graphic (typographic, not icons) | Design |
| 9 | Before/after — authentic, labelled with area + timeframe + "customer photo" | Only from consenting customers |
| 10 | Lifestyle bathroom shelf | Shoot |
| 11 | What's included (can, scraper, serum/cream) | Shoot |
| 12 | UGC (labelled) | Post-launch |

Supplier images currently on the page (manufacturer before/after composites) are **not** used unless the supplier grants rights and they are labelled as manufacturer images.

Gallery behaviour: every slot has fixed `aspect-ratio` (no CLS); mobile = native CSS scroll-snap with dots + "1 / 8" counter; desktop = vertical editorial grid with click-to-zoom dialog; thumbnails are `<button aria-label="Show image 3 of 8: mousse texture">`.

### Mobile PDP

```
[gallery full-width 4:5, swipe]   1 / 8
Breadcrumb · Name · rating · price
[Set: Mousse ▾]   → bottom sheet with 3 options + included items
[Pack: 2 cans ▾]  → bottom sheet
[ ADD TO BAG ]
Trust ticks · patch-test line
Accordions: Story · How to use · Ingredients · Safety · Details · Shipping & returns
   (accordion content is in HTML; <details> so it's crawlable and works without JS)
Reviews · FAQ · Complete the routine
── sticky bar appears after the main CTA scrolls out of view ──
[ Mousse · 2 cans · $69.99 ][ ADD TO BAG ]   (56px tall, safe-area inset)
```

---

## 10. Cart UX (drawer)

```
┌─ Your bag (2) ─────────────────────────────── [×] ┐
│ ▓▓▓▓▓▓▓▓░░░  $10.01 away from free delivery       │  ← only if R7 threshold exists
│──────────────────────────────────────────────────│
│ [img] Hair Removal Mousse                          │
│       Spray · 2 cans                               │
│       [− 1 +]                 $69.99     Remove    │
│──────────────────────────────────────────────────│
│ Complete the routine                               │
│ [img] Serum (if sold alone)   $X   [ Add ]         │  ← max 1 item, contextual (03 §13)
│──────────────────────────────────────────────────│
│ Subtotal                                  $69.99   │
│ Shipping & taxes calculated at checkout            │
│ [          CHECKOUT          ]                     │
│ [ Shop Pay ]  (if accelerated checkout enabled)    │
│ ✓ Secure checkout by Shopify · ✓ Tracked delivery  │
└────────────────────────────────────────────────────┘
```

Behaviour:

- Opens on add-to-cart (unless the user added from the drawer itself). Focus moves to drawer heading; Escape and overlay click close; focus returns to trigger; background `inert`.
- Line updates are **optimistic** (`useOptimistic`) with server reconciliation; on failure, row reverts and an inline error explains.
- Quantity max = available inventory (from `quantityAvailable` when exposed) and a sane cap (10).
- Empty state: one line + link to Hair Removal + a guide.
- No-JS fallback: `/cart` page with forms posting to Server Actions.
- Checkout button links to `cart.checkoutUrl` (Shopify-hosted checkout on `checkout.belurae.com`).
- Mobile: full-height drawer from right, 100% width < 480 px, checkout button sticky at bottom.

---

## 18. Mobile UX rules

1. Design at 375 px first; test 320 px (no horizontal scroll).
2. Targets ≥ 44×44 px, ≥ 8 px apart.
3. Primary actions in the bottom 40% of the screen (sticky ATC, sheet buttons).
4. Bottom sheets for selectors (variant, pack, filters, sort) — built on `<dialog>`, swipe-to-close is enhancement only.
5. Hero video on mobile: 720p ≤ 1.5 MB, starts only after `load` + when in viewport + not Save-Data + not reduced-motion.
6. No hover-dependent information.
7. Inputs 16 px+, correct `inputmode`/`autocomplete`.

---

## 53 / 56. CRO and trust architecture

Target reaction: *"I understand this product and I trust the company"* — not *"this site is trying to convince me"*.

| Customer doubt | Where it's answered | Mechanism |
|---|---|---|
| What exactly is this? | PDP H1 + benefit line + "What's in the box" | Specific format/size/time |
| Will it work on my hair/area? | How to use, areas allowed/not allowed, FAQ | Packaging-sourced answers |
| Is it safe for my skin? | Patch-test line above fold, Safety section, full INCI | Transparency, stated limits |
| Is this company real? | About, Standards, Contact, legal entity in footer | Entity clarity (R9) |
| What if it doesn't suit me? | Returns summary next to ATC, full policy page | Risk reduction (R8) |
| When will it arrive? | Delivery line next to ATC, cart, shipping page | Concrete days (R7) |
| Do others like it? | Verified reviews (when they exist) | Judge.me verified-buyer only |

Conversion levers used: clear set/pack choice with honest savings, sticky mobile ATC, one-tap wallet checkout, relevant (not random) recommendations, fast pages. Levers **not** used: timers, fake scarcity, "X people viewing", exit popups, pre-checked add-ons, confirm-shaming.

## 57 / 58. Micro-interactions

All CSS transitions (opacity/transform), 180–320 ms, disabled under reduced motion.

| Interaction | Behaviour |
|---|---|
| Add to bag | Button label → "Added ✓" for 1.5 s, drawer slides in (240 ms), count badge updates; `role="status"` announcement |
| Variant change | Main image crossfade (200 ms); price updates in place (no layout shift) |
| Card hover (fine pointer) | Second image crossfade 300 ms; no scale/zoom jumps |
| Accordion | `<details>` with `::details-content` height transition where supported; instant elsewhere |
| Drawer / sheet | Slide + backdrop fade; `@starting-style` for entry |
| Section reveal | Optional 12 px rise + fade on first view (CSS `animation-timeline: view()` where supported, else none). Content is never hidden if JS/animation fails. |
| Page transitions | View Transitions API (cross-document) for a subtle fade between routes where supported; no JS router animations |

---

## 59. Visual asset specification

Sizes are source-export sizes; `next/image` serves responsive derivatives from the Shopify CDN or Vercel.

| Section | Type | Ratio | Desktop export | Mobile export | Art direction / subject | Background | Text overlay | Loading | Alt text strategy |
|---|---|---|---|---|---|---|---|---|---|
| Home hero | Image poster + video loop 6–8 s | 16:9 desktop / 4:5 mobile (art-directed, 2 crops) | 2400×1350 | 1080×1350 | Hands applying mousse to a leg in morning bathroom light; product visible | Travertine/ivory tile | Desktop yes (left third, scrim); mobile no | Poster `priority` + `fetchPriority=high`; video after `load` | Describe scene: "Hand applying white hair removal mousse to a leg beside the Belurae can" |
| Trust strip | None (text + 20 px line icon) | — | — | — | — | — | — | — | Icons `aria-hidden` |
| Shop by need | Image | 4:5 | 1200×1500 | 720×900 | Category-specific still life | Warm neutrals | Title below, not on image | Lazy | Category content, not "category image" |
| Product card | Image ×2 | 4:5 | 1200×1500 | 600×750 | #1 packshot, #2 in-use | Consistent cream seamless | No | Lazy (first row on collection: eager, no priority) | Product + view ("…can, front view") |
| Hero product story | Video (click or in-view autoplay muted) + poster | 4:5 | 1440×1800 | 1080×1350 | Mousse forming on skin, slow | Neutral | No | Lazy, IntersectionObserver | Poster alt + captions file |
| How it works | Image ×4 | 1:1 | 1000×1000 | 720×720 | One step each, same framing | Same set | Step number outside image | Lazy | Step action |
| How-to video | Video 30–45 s | 16:9 (mobile 9:16 variant) | 1920×1080 | 1080×1920 | Full routine incl. patch test and aftercare | Bathroom | Burned-in: none; captions via WebVTT | Click-to-play, `preload="none"` | Transcript on page |
| Ingredients | Image per ingredient | 1:1 or 4:5 | 1000×1250 | 600×750 | Single botanical on paper | Beige paper | No | Lazy | Ingredient name + form ("fresh aloe leaf cut open") |
| Social proof / UGC | Customer image/video | 1:1 / 9:16 | as received (≥ 1080) | — | Unretouched | Any | "Customer photo" label | Lazy | Customer-provided caption or neutral description |
| Why Belurae | Image | 3:2 | 1800×1200 | 900×600 | Calm shelf / routine | Linen | No | Lazy | Scene |
| Bundles | Image per set | 1:1 | 1200×1200 | 720×720 | Exact set contents, same set | Seamless | No | Lazy | "Two cans of mousse with scraper" |
| Education cards | Image | 3:2 | 1200×800 | 720×480 | Editorial topic image | Varied neutral | No | Lazy | Topic scene |
| Collection hero | Image | 3:2 desktop / 4:5 mobile | 2000×1333 | 1080×1350 | Category mood | Neutral | No | `priority` (LCP) | Scene |
| PDP gallery #1 | Image | 4:5 | 2000×2500 | 1080×1350 | Packshot | Ivory stone | No | `priority` | "Belurae Hair Removal Mousse, 140 ml can, front" |
| PDP gallery #2–12 | Image/video | 4:5 | 2000×2500 | 1080×1350 | See gallery table | Mixed | No | Lazy | Specific to each |
| OG images | Image | 1.91:1 | 1200×630 | — | Product/category + wordmark | Ivory | Title text allowed | — | — |

Filenames: `belurae-hair-removal-mousse-front-140ml.jpg` (descriptive, lowercase, hyphenated). Uploaded to Shopify Files so the CDN serves them.
