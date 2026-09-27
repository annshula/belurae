# 03 — Commerce & Content

Covers brief §11 Ecosystem · §12 Bundles · §13 Cross-sell · §14 Content strategy · §54 Search · §55 Recommendations.

---

## 11. Product ecosystem

### Category model (Shopify side)

Shopify **collections** = navigation categories. Shopify **product taxonomy** (standard category) = `Health & Beauty > Personal Care > Shaving & Grooming > Hair Removal > Depilatories` for the mousse (verify exact node in Admin). **Metafield `belurae.routine_step`** tags each product with its place in a routine:

```
prepare → remove → soothe → moisturise → maintain
```

| Step | Launch product | Future products (R14 roadmap, not promised publicly) |
|---|---|---|
| prepare | — | Gentle body exfoliant |
| remove | **Hair Removal Mousse** (+ cream variant) | Sensitive-skin formula, face-safe formula (separate product, if ever) |
| soothe | Serum (if sold separately; R3) | Post-hair-removal gel |
| moisturise | — | Body lotion, body oil |
| maintain | — | Ingrown-hair care (only with substantiation) |

The routine model drives cross-sell, bundles, content and the entity graph — so adding product #2 requires **no** template changes.

### Launch catalogue reality

At launch there is **one product with three sets and up to three pack sizes**. The site must look complete with that. Tactics:

- Homepage section 5 ("The essentials") is suppressed; section 6 (hero story) carries the product.
- Shop mega-menu features the product + guides rather than empty categories.
- Collections that would contain < 1 product are not generated (no thin pages).

---

## 12. Bundle strategy

### Bundle tiers mapped to what exists today

| Tier | Name | Contents | Price | Real saving | Who it's for |
|---|---|---|---|---|---|
| Starter | **The Essential** | Mousse ×1 + scraper | $39.99 | — | First-time users; try after patch test |
| Routine | **The Routine** | Mousse + Serum (R3) | $49.99 | Show saving only if the serum has a standalone price | Want a post-removal step |
| Routine alt | **Mousse + Cream** | Mousse + Smooth cream 100 ml | $49.99 | Same rule | Prefer a cream for smaller areas (confirm R4) |
| Complete / stock-up | **The Stock-Up** | Mousse ×3 | $99.99 | $19.98 vs 3 × $39.99 | Regular users |

Rules:

1. Savings are always computed server-side from live prices: `saving = Σ(component single prices) − bundle price`. If any component has no standalone price → show "What's included" without a saving figure.
2. No compare-at price unless that exact variant was sold at the higher price for a meaningful period (keep evidence). Current compare-at values on the Trackify store are not carried over.
3. Fix the variant matrix: either create "Spray & Serum / 2" and "Spray & Cream / 2", or show pack choice "1 / 3" only for those sets. The UI disables and labels unavailable combinations instead of hiding them silently.
4. Long-term: move from "option = set" to **Shopify Bundles** (fixed bundles of real component products) once serum/cream exist as standalone products — inventory then tracks per component, and each component gets its own PDP, schema and reviews.

### Bundle card

```
┌ The Routine ───────────────────────────────┐
│ [image 1:1 of exact contents]              │
│ Mousse 140 ml + Serum [size]               │
│ For: a post-removal step                   │
│ $49.99   (individually $X — you save $Y)   │  ← only when computable
│ [ Add to bag ]                             │
└────────────────────────────────────────────┘
```

---

## 13. Cross-sell strategy

Recommendation = **routine logic first, Shopify algorithm second, never random.**

| Surface | Heading | Source (in priority order) | Max items |
|---|---|---|---|
| PDP | "Complete the routine" | `belurae.pairs_with` product-reference metafield (hand-curated) | 3 |
| PDP | "Your post-hair-removal routine" | Products with `routine_step ∈ {soothe, moisturise}` | 3 |
| PDP | "Pairs well with" | Storefront API `productRecommendations(intent: COMPLEMENTARY)` (curated in Search & Discovery app) | 4 |
| Cart drawer | "Complete the routine" | Next routine step not already in cart | **1** |
| Collection | Related categories | Static routine map | 3 links |
| Article | "Products in this guide" | Product handles in MDX front-matter | 2 |

Suppression rules: never recommend an item already in cart; never recommend out-of-stock; never recommend a product from an unrelated routine; if nothing qualifies, render nothing (no filler).

At launch, "Complete the routine" only renders if the serum or cream is purchasable standalone. Otherwise the module links to the **Aftercare guide** instead (education as cross-sell).

---

## 14. Content strategy

Principle: **fewer, better, maintained.** 12 excellent pages beat 200 thin ones. Every piece is reviewed against the claim rules (01-brand §2) before publishing.

### Content types

| Type | URL | Purpose | Length | Cadence |
|---|---|---|---|---|
| Guide (evergreen) | `/guides/[slug]` | Answer a task-level question fully | 1,200–2,500 words | Launch set, then quarterly update |
| Ingredient page | `/ingredients/[slug]` | Entity page: what it is, why it's used, where Belurae uses it | 400–800 words | One per R1 ingredient |
| Journal | `/journal/[slug]` | Brand/wellness stories, routines, behind-the-product | 700–1,500 words | 2 per month max |
| Policy / brand pages | `/pages/*` | Trust, entity clarity | As needed | Update on change |
| FAQ hub | `/pages/faq` | Consolidated answers, grouped | — | Monthly from support tickets |

### Launch content set (12 pieces)

| # | Title | Type | Primary intent | Links to |
|---|---|---|---|---|
| 1 | How to Use Hair Removal Mousse, Step by Step | Guide | how-to | PDP, patch-test guide, aftercare guide |
| 2 | How to Patch Test a New Body-Care Product | Guide | safety | PDP, sensitive-skin guide |
| 3 | Hair Removal for Sensitive Skin: What to Know | Guide | research | PDP, patch test, ingredients |
| 4 | Hair Removal Aftercare: What to Do in the First 24 Hours | Guide | how-to | Serum/cream, moisturise step |
| 5 | Mousse, Cream, Razor or Wax? How to Choose a Hair-Removal Method | Guide | comparison | Collection, PDP |
| 6 | Bikini-Line Hair Removal at Home: A Careful Guide | Guide | research (high volume) | PDP — **only if R2 permits bikini-line use**; otherwise the guide says where depilatories should not be used |
| 7 | Common Hair-Removal Mistakes (and Simple Fixes) | Guide | how-to | Guides 1, 2, 4 |
| 8 | How to Build a Simple Body-Care Routine | Guide | routine | Routine map |
| 9 | Aloe Leaf Water | Ingredient | entity | PDP |
| 10 | Hyaluronic Acid in Body Care | Ingredient | entity | PDP |
| 11 | [Depilatory active from R1] — what it is and how it works | Ingredient | entity + trust | PDP, safety |
| 12 | Why We Publish Full Ingredient Lists | Journal | brand | Standards page |

### Article template

```
Breadcrumb
H1 (question-shaped where natural)
Byline: author name + role · "Reviewed for accuracy on [date]" · reading time
Summary box: 2–4 sentence direct answer            ← AEO anchor
Table of contents (≥ 4 H2s)
Body with H2/H3, steps as <ol>, cautions as <aside role="note">
"Products in this guide" (max 2)
Sources: packaging, manufacturer docs, reputable public references (linked)
Related guides (3)
```

Authorship: real named person. If medically adjacent statements are needed (irritation, sensitive skin), either quote the manufacturer or have a qualified reviewer — otherwise write "see a doctor or pharmacist" and stop.

### Content governance

- `content/claims-register.md` — every product claim, its exact wording, its source document, date verified.
- Each MDX file front-matter: `lastReviewed`, `reviewer`, `sources[]`, `products[]`, `entities[]`.
- CI check fails the build on banned words (*pain-free, painless, guaranteed, clinically proven, FDA approved, safe for all*) outside the claims-register allowlist.

---

## 54. Product discovery / search

### Engine

- Products: Storefront API `search` (full results) + `predictiveSearch` (typeahead, products + collections + queries).
- Content (guides, ingredients, journal, FAQ): build-time JSON index from `/content` (titles, headings, synonyms, excerpt) — ~10–20 KB, loaded only when the search dialog opens, queried client-side with a tiny scorer. No third-party search SaaS at this catalogue size.
- Synonyms maintained in **Shopify Search & Discovery app** (products) and mirrored in `content/search-synonyms.ts` (content).

### Synonym map (starter)

| Query | Maps to |
|---|---|
| bikini, bikini line, pubic, down there | hair removal → PDP + bikini guide (+ safety note) |
| sensitive, gentle, irritation, red, burning | PDP + sensitive-skin guide + patch-test guide |
| aftercare, after, soothing, calm, bumps | aftercare guide (+ serum/cream if standalone) |
| nair, veet, depilatory, cream, mousse, spray | hair removal collection *(competitor names only as synonyms, never shown as copy)* |
| shave, razor, wax, epilator | comparison guide + hair removal collection |
| aloe, hyaluronic, glycerin, ginseng | ingredient pages + PDP |
| legs, underarm, armpit, back, chest | PDP + how-to guide |

### UX

- Search opens a dialog (`/` shortcut on desktop, header icon), input autofocus, results grouped: Products · Guides · Ingredients · Questions.
- Zero-result state: suggest 3 popular queries + contact link; log the query (anonymous) to improve synonyms.
- `/search?q=` full page is server-rendered, `noindex, follow`, excluded from sitemap, and `?q` never appears in internal links.

---

## 55. Recommendation engine

```
            ┌──────────────────────────────┐
PDP ──────▶ │ getRecommendations(product,  │
Cart ─────▶ │   context, cartLines)        │
Article ──▶ │                              │
            │ 1. curated  (pairs_with)     │
            │ 2. routine  (next step)      │
            │ 3. shopify  (COMPLEMENTARY)  │
            │ 4. filter   (in cart, OOS,   │
            │              same product)   │
            │ 5. cap      (per surface)    │
            └──────────────────────────────┘
```

Lives in `lib/commerce/recommendations.ts`, runs server-side, cached per product with tag `recs:[handle]`, invalidated on product webhooks. Cart context version runs in a Server Action (cart-dependent → uncached).
