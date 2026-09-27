# 07 — Launch QA Checklist

Covers brief §40 / §61. Each line is pass/fail with a named tool or method. Launch requires every **P0** to pass; **P1** may ship with a dated fix ticket.

---

## Content & claims (run first — it blocks everything else)

| P | Check | Method |
|---|---|---|
| P0 | D1 decided and reflected in brand copy, `Product.brand`, About and Standards pages | Manual review |
| P0 | Every product claim appears in `content/claims-register.md` with a source | `scripts/check-claims.ts` + manual |
| P0 | Banned-word scan clean (*pain-free, painless, guaranteed, clinically proven, FDA approved, safe for all…*) | CI script |
| P0 | Full INCI (R1) and warnings (R2) rendered on PDP; bikini-line answer matches packaging verbatim | Manual vs packaging photo |
| P0 | No compare-at price without evidence; savings math matches `n × single − pack` | Unit test on `lib/commerce/bundles.ts` + manual |
| P0 | No reviews, ratings, UGC or before/after without consent + verification | Manual |
| P0 | Shipping (R7) and returns (R8) policies published and consistent with PDP/cart/schema | Manual |
| P1 | `scripts/content-gaps.ts` report empty for launch products | Script |

## Functionality

| P | Check | Method |
|---|---|---|
| P0 | Every variant combination: selectable, correct price, correct image, unavailable combos disabled | Playwright matrix test |
| P0 | Add to bag, change qty, remove, empty state — desktop + mobile | Playwright |
| P0 | Checkout handoff lands on `checkout.belurae.com` with correct lines; test order completes (Bogus Gateway on dev store, then a real low-value order refunded on prod) | Manual |
| P0 | Cart persists across reload and tabs; expired cart id recovers gracefully | Playwright |
| P0 | Customer login/logout, orders, addresses | Manual |
| P0 | Search: "bikini", "sensitive", "aftercare", "aloe", misspelling "hair remvoal" return useful results | Manual |
| P0 | Navigation: mega-menu, mobile menu, footer links — no 404s | Crawler (Screaming Frog / `linkinator`) |
| P0 | Newsletter: success, duplicate, invalid email, rate limit | Playwright |
| P1 | No-JS: PDP readable, FAQ expandable, `/cart` fallback works | Browser with JS disabled |
| P1 | 404 and error pages branded, with navigation | Manual |

## SEO

| P | Check | Method |
|---|---|---|
| P0 | Unique title + description on every indexable URL | Crawler export |
| P0 | Canonicals absolute, self-referencing; `?variant`/filters canonicalise correctly | Crawler |
| P0 | `noindex` on search, cart, account, filtered collections | Crawler + `curl -I` for `X-Robots-Tag` |
| P0 | `robots.txt` correct; sitemap index lists only 200/canonical/indexable URLs | Manual + crawler |
| P0 | Structured data valid, matches visible content (price, availability, rating absent if no reviews) | Rich Results Test + Schema.org validator per template |
| P0 | Redirects: old Trackify URLs → Belurae (301), trailing slash, `www` | `curl -I` script |
| P0 | Shopify-hosted storefront not indexable (redirect/password + noindex) | `curl` myshopify URLs; `site:` check 2 weeks post-launch |
| P1 | Every indexable URL has ≥ 2 internal inbound links (orphan check) | CI graph script |
| P1 | Merchant Center feed URLs point to `belurae.com`, prices match PDP | Merchant Center diagnostics |
| P1 | Search Console: domain verified, sitemap submitted, no coverage errors | GSC |

## Performance

| P | Check | Method |
|---|---|---|
| P0 | Budgets (05 §30) pass on Home, PDP, Collection, Guide | CI (size-limit, byte script) |
| P0 | LCP element is the intended element on each template; not lazy-loaded; single `priority` image | Chrome DevTools Performance panel |
| P0 | Lab on Moto G Power / Slow 4G profile: LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms | Lighthouse CI / WebPageTest |
| P0 | Hero video not requested before `load`; not requested with reduced motion or Save-Data | DevTools network |
| P0 | Fonts: 2 WOFF2 max early, self-hosted, no external font requests | Network panel |
| P0 | Zero third-party requests before consent | Network panel, EU geo |
| P1 | TTFB ≤ 400 ms for cached HTML from 3 regions | WebPageTest |
| P1 | Field data (Speed Insights) reviewed after 7 days: LCP/INP/CLS "good" at p75 | Vercel dashboard |

## Security

| P | Check | Method |
|---|---|---|
| P0 | Headers present: CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors | `curl -I` + securityheaders.com |
| P0 | Zero CSP violations on all templates (report endpoint + console) | Manual walk + `/api/csp-report` log |
| P0 | Webhook: invalid HMAC → 401; replay → idempotent; valid → correct tags revalidated | `scripts/test-webhook.ts` |
| P0 | No secrets in client bundle or source maps | CI grep; production source maps not public |
| P0 | Account routes: unauthenticated → redirect; another customer's order id → 404 | Manual |
| P0 | Rate limits trigger on search, newsletter, cart | Load script (k6/autocannon, low volume) |
| P0 | `npm audit --omit=dev` no high/critical | CI |
| P1 | Admin API token scopes = least privilege | Shopify admin review |
| P1 | `reference/.env` never committed; any shared tokens rotated | `git log -p` check + Shopify admin |

## Accessibility

| P | Check | Method |
|---|---|---|
| P0 | axe: 0 serious/critical on all templates | Playwright + axe in CI |
| P0 | Keyboard-only: complete purchase path to checkout handoff | Manual |
| P0 | Screen reader: VoiceOver iOS + NVDA — PDP selectors, add-to-bag announcement, drawer | Manual |
| P0 | Focus visible everywhere, not obscured by sticky bars | Manual |
| P0 | Reduced motion: no autoplay, no transitions | OS setting |
| P1 | 400% zoom / 320 px reflow | Manual |
| P1 | Contrast on every text-over-image instance | Manual with contrast checker |

## CRO / trust (no dark patterns)

| P | Check |
|---|---|
| P0 | No countdown timers, fake stock counters, "X people viewing", forced popups, pre-ticked add-ons |
| P0 | Patch-test line visible above the fold on PDP (mobile and desktop) |
| P0 | Contact route (email + form) reachable in ≤ 1 click from PDP |
| P1 | "Most popular" / "Best value" labels backed by data or arithmetic |
