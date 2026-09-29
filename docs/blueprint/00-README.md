# Belurae — Storefront Blueprint

Status: **Phase 1 of 3 — Audit + Strategy + Architecture** (no implementation code yet).
Date: 2026-09-27.

## Read in this order

| # | File | Covers (brief sections) |
|---|------|-------------------------|
| 0 | `00-README.md` (this file) | Audit findings, blocking decisions, required content inputs |
| 1 | [01-brand.md](01-brand.md) | 1 Positioning · 2 Voice · 3 Visual identity · 4 Color · 5 Typography |
| 2 | [02-experience.md](02-experience.md) | 6 IA · 7 Homepage · 8 Collection · 9 PDP · 10 Cart · mobile · CRO/trust · micro-interactions · visual asset spec |
| 3 | [03-commerce-content.md](03-commerce-content.md) | 11 Ecosystem · 12 Bundles · 13 Cross-sell · 14 Content strategy · search |
| 4 | [04-search-visibility.md](04-search-visibility.md) | 15 SEO · 16 AEO · 17 GEO · 18 Entities · 19 Schema · 20 Internal links · 39 Page matrix |
| 5 | [05-architecture.md](05-architecture.md) | 21–30 Next.js, Shopify, API, rendering, caching, webhooks, image, video, CWV, budget · 36–38 components, folders, env |
| 6 | [06-security-analytics-a11y.md](06-security-analytics-a11y.md) | 31 Security · 32 CSP · 33 API security · 34 Analytics · 35 Accessibility |
| 7 | [07-launch-qa.md](07-launch-qa.md) | 40 Launch QA checklist |

---

## A. Audit — what the live product page actually says

Source: `https://shoptrackify.com/products/bikini-pain-free-hair-removal-cream?variant=67582703501539`, fetched 2026-09-27 (rendered HTML + JSON-LD).

### A1. Product facts (verified from the page)

| Field | Value on page | Source confidence |
|---|---|---|
| Actual format | **Spray mousse** (140 ml / 4.73 fl oz can) — not a cream | Specs block |
| Manufacturer brand | **PHOFAY "Cloud Sense"** | Specs block |
| SKU prefix | `CJPF2536027…` (CJ Dropshipping catalogue SKU) | JSON-LD |
| Add-ons | Serum (unnamed, unspecified) · "Smooth" cream tube 100 ml / 3.5 fl oz | Specs, FAQ |
| In the box | Mousse can + scraper (+ serum or cream by style) | "What's in the box" |
| Key ingredients (partial) | Ginseng extract, *Portulaca oleracea* extract, aloe leaf water, glycerin, hyaluronic acid | Specs |
| Full INCI list | **Not published** | — |
| Depilatory active | **Not published** (the ingredient that removes hair is not named) | — |
| Scent | "Orange Spring Cologne" | Specs |
| Time on skin | 5–10 minutes | Specs, How-to |
| Directions | Clean & dry → spray even layer → wait 5–10 min → scrape → rinse | How-to |
| Patch test | "24 hours before first use" | Why-it-works, FAQ |
| Irritation guidance | Rinse with cool water, stop use, see a doctor if it continues | FAQ |
| Not for | Face | FAQ |
| Areas shown | Back, chest, underarms, legs, arms; bikini line "follow packaging directions" | Where-it-fits |
| Delivery | 5–11 days, tracked | Delivery block |
| Reviews / rating | **None** — no `aggregateRating` in schema, none rendered | JSON-LD |
| Support | support@shoptrackify.com | FAQ |

### A2. Variants and pricing (from JSON-LD + embedded Storefront data)

| Variant | Price (USD) | Compare-at on page | Real saving vs. buying singles |
|---|---|---|---|
| Spray / 1 | 39.99 | 45.99 | — (single; no sale history known) |
| Spray / 2 | 69.99 | 89.99 | $9.99 vs 2 × 39.99 (12%) |
| Spray / 3 | 99.99 | 150.00 | $19.98 vs 3 × 39.99 (17%) |
| Spray & Serum / 1 | 49.99 | 79.99 | — |
| Spray & Serum / 3 | 109.99 | 239.99 | $40.00 vs 3 × 49.99 (27%) |
| Spray & Cream / 1 | 49.99 | 79.99 | — |
| Spray & Cream / 3 | 109.99 | 239.99 | $40.00 vs 3 × 49.99 (27%) |

**7 variants, not 9.** "Spray & Serum / 2" and "Spray & Cream / 2" do not exist, but the UI shows a "2 packs — Most popular" option for every style.

### A3. Problems the new storefront must fix

Ranked by risk.

1. **Brand identity vs. reality.** The product is a PHOFAY-branded third-party formula. Selling it as a "Belurae formulation" with "thoughtful formulations" copy is a misleading claim. → Decision D1 below.
2. **"FDA & CPNP documented"** in the announcement bar. The FDA does not approve cosmetics. Unless a real MoCRA facility registration / product listing and a CPNP notification exist *for this product and this seller*, the line implies an endorsement that does not exist. → Remove until documents are in hand, then show the documents themselves, labelled for what they are.
3. **Unsupported claims.** "Pain-free" (in the product name), "Minimizes ingrown hair", "Works at the root", "Long-lasting smoothness", "Hydrates skin for up to 24hrs", "35% less chemical ingredients", "Sensitive-skin safe", "Non-irritating". None has substantiation on the page. Depilatories are chemical products that can irritate or burn skin; "pain-free" and "safe" are absolute claims. → Remove or replace with packaging-attributed wording ("labelled hypoallergenic by the manufacturer").
4. **Reference pricing.** Compare-at prices (e.g. $150 for a 3-pack sold at $99.99 when three singles cost $119.97) look like invented "was" prices. "Save 13%" on a single unit implies a sale with no evidence of a prior selling price. → Show only real multi-unit savings, computed from the single price.
5. **Name ≠ product.** URL says `…-cream`, canonical says `…-spray`, H1 is a 30-word marketplace title. → One product name, one canonical URL, 301s for the old handles.
6. **Store identity.** The product lives inside "Trackify", a general store (Baby & Kids, Travel, Wallets). Organization schema says Trackify. Belurae needs its own domain and store identity (D3).
7. **Bikini-area guidance is vague.** Depilatory packaging normally prohibits use on genitals, mucous membranes and broken skin. The page says "follow the packaging directions" without quoting them. → Quote the manufacturer's exact warnings (required input R2).
8. **Reviews source.** The previous storefront in `reference/` imported supplier-sourced reviews (Judge.me with AliExpress/CJ photos — see `reference/next.config.ts`). For Belurae, reviews written about another seller or another brand must not be shown as Belurae reviews. Start at zero and collect verified-buyer reviews.

### A4. What `reference/` gives us (reuse, don't rebuild)

`reference/` is a previous headless Next.js 15 + Shopify storefront (Crawl & Cuddle). Reusable, already hardened:

- `src/lib/shopify/*` — Storefront client, Customer Account API OAuth + PKCE, encrypted session cookies (AES-256-GCM), Admin client-credentials token, typed queries.
- `src/app/api/webhooks/*`, `scripts/register-webhooks.ts` — HMAC-verified webhooks + registration script.
- `src/middleware.ts` — CSP with per-integration host gating, `/account` guard.
- `src/lib/judgeme/*` — server-side review fetch.
- Account pages (orders, addresses, returns).

Not reusable: brand, copy, GSAP + Lenis motion layer (drop it — see 05-architecture §29), six Google fonts via `next/font/google` (replace with two self-hosted variable fonts).

---

## B. Blocking decisions (you decide; blueprint assumes the recommended option)

| ID | Decision | Options | Recommendation |
|---|---|---|---|
| **D1** | How Belurae relates to the PHOFAY product | (a) Private-label: Belurae packaging, Belurae-owned INCI sheet, SDS, CPNP/MoCRA listing in Belurae's name. (b) Curated retailer: Belurae sells it and names the manufacturer on the PDP. (c) Rebrand the listing only. | **(a) before paid launch; (b) as the interim.** (c) is misleading and blocks every trust goal in the brief. |
| **D2** | Product name | "Bikini Pain-Free Hair Removal Cream" · "Hair Removal Mousse" · other | **"Belurae Hair Removal Mousse"** (or "Gentle Hair Removal Mousse" if the manufacturer's sensitive-skin claim is substantiated). Drop "pain-free". Keep "bikini" in body copy and FAQs only if packaging permits bikini-line use. |
| **D3** | Store + domain | Same Trackify store · new Shopify store for Belurae | **New Shopify store** (clean Organization entity, policies, analytics, reviews, Markets). Domain `belurae.com` (availability + trademark check = R10). |
| **D4** | Editorial source | MDX in repo · Shopify blog/metaobjects · headless CMS | **Product facts in Shopify metafields/metaobjects; guides and journal as MDX in repo.** Revisit a CMS when a non-developer editor joins. |
| **D5** | Hosting | Vercel · other | **Vercel** (reference already uses it; ISR/tag revalidation, WAF rate limits, image optimisation). |

---

## C. Required content inputs (nothing below may be invented)

| ID | Input | Needed for | Owner |
|---|---|---|---|
| R1 | Full INCI ingredient list, **including the depilatory active** | Ingredients section, ingredient pages, AEO answers | Manufacturer |
| R2 | Exact packaging directions + warnings (areas allowed/prohibited, max time, frequency, age, pregnancy note if any) | Safety section, FAQ, bikini-line answer | Manufacturer |
| R3 | What the "serum" is: name, size, INCI, directions | Variant copy, aftercare positioning | Manufacturer |
| R4 | "Smooth" cream: INCI, directions, how it differs from the mousse | Variant copy | Manufacturer |
| R5 | Any real documents: MoCRA listing, CPNP notification, SDS/MSDS, test reports | Documentation module | Manufacturer |
| R6 | Substantiation for any claim you want to keep (hypoallergenic, sensitive skin, hydration, ingrown hairs) | Benefits | Manufacturer |
| R7 | Shipping policy: carriers, regions, cost, free-shipping threshold (if any) | Announcement bar, cart progress bar, schema | You |
| R8 | Returns policy for cosmetics (opened/unopened, window, who pays) | PDP, cart, schema | You |
| R9 | Business entity: legal name, address, support email/phone, response time | Footer, Contact, Organization schema | You |
| R10 | Trademark + domain clearance for "Belurae" | Launch | You |
| R11 | Photography + video (see 02-experience §Visual asset spec) | Every page | Shoot |
| R12 | GTIN/barcode (if the can has one) | Product schema, Merchant Center | Manufacturer |
| R13 | Social profile URLs | `sameAs`, footer | You |
| R14 | Real product roadmap: which aftercare/body products exist and when | Ecosystem, cross-sell | You |

Until an input arrives, the component renders nothing for that slot (never placeholder claims). Implementation will keep a `content-gaps` report generated from empty metafields.

---

## D. Phases after this blueprint

1. **Foundation (≈ 1 week):** repo scaffold, tokens, fonts, Shopify data layer, security headers, CI budgets.
2. **Commerce core (≈ 1.5 weeks):** PDP, cart drawer, collection, search, account (ported from `reference/`).
3. **Brand + content (≈ 1 week, blocked on R1–R11):** homepage, guides, ingredient pages, schema.
4. **Hardening (≈ 3–4 days):** CWV field tuning, CSP report review, a11y audit, launch QA.
