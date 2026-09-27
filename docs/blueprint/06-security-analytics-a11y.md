# 06 — Security, Analytics, Accessibility

Covers brief §31 Security · §32 CSP · §43 Third-party audit · §33 API security · §34 Analytics · §35 Accessibility.

---

## 31. Security architecture

### Threat model (what we actually protect)

| Asset | Threat | Control |
|---|---|---|
| Shopify Admin credentials | Leak to browser / repo | Server-only modules (`server-only`), client-credentials (short-lived tokens), least-privilege scopes, bundle secret scan in CI |
| Customer session | Theft, fixation, CSRF | AES-256-GCM encrypted httpOnly cookie, `Secure`, `SameSite=Lax`, rotation on login, OAuth state + PKCE (ported) |
| Cart integrity | Price/discount tampering | Client sends only `variantId`+`quantity`; Shopify prices; discount codes applied via Shopify validation only |
| Webhook endpoint | Forged revalidation / DoS | HMAC + timing-safe compare, shop-domain check, idempotency, body size cap |
| Page integrity | XSS via rich text / third-party | No `dangerouslySetInnerHTML` of CMS content (own rich-text renderer), CSP, minimal third parties |
| Availability | Scraping / abuse of search & newsletter | Rate limits (Vercel WAF + Upstash), CDN caching |
| Supply chain | Malicious npm dependency | Lockfile, `npm audit` + Dependabot/Renovate, minimal dependency count, no runtime CDN scripts except consented analytics |

### HTTP headers (all routes, set in `proxy.ts` / `next.config.ts`)

| Header | Value |
|---|---|
| `Content-Security-Policy` | see §32 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` (submit to preload list only after all subdomains are HTTPS) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.belurae.com"), usb=(), interest-cohort=(), browsing-topics=()` |
| `X-Frame-Options` | `DENY` (legacy; CSP `frame-ancestors 'none'` is authoritative) |
| `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` (Shop Pay / wallet popups must keep working) |
| `Cross-Origin-Resource-Policy` | `same-site` on our own assets. **Not** COEP — it would break Shopify CDN media without CORP headers we don't control. |
| `X-Powered-By` | removed (`poweredByHeader: false`) |

---

## 32. CSP architecture

### The constraint (documented, not hidden)

Next.js App Router inlines RSC payload `<script>` tags. Nonces require **dynamic rendering of every page** (a nonce must be unique per response), which would disable static/ISR delivery — sacrificing TTFB/LCP for every visitor. Hashes don't work because the inline payload differs per page/build.

### Decision: two policies by route class

| Route class | Rendering | `script-src` |
|---|---|---|
| Static/ISR (home, PDP, collections, content) | Static | `'self' 'unsafe-inline'` + explicit third-party hosts (only when consented integrations are configured). Risk accepted because: no user-generated HTML is rendered, all CMS rich text goes through our own renderer, no `eval`. |
| Dynamic (cart page, account, search) | Dynamic | `'self' 'nonce-{n}' 'strict-dynamic'` — nonce generated in `proxy.ts`, passed via header, read by Next for its scripts. |

Plus a **`Content-Security-Policy-Report-Only`** strict nonce-based policy on static routes, to collect data on what would break if we moved everything to nonces later (e.g. when Next supports static nonces/hashes for PPR shells).

### Policy (production, static routes)

```
default-src 'self';
script-src 'self' 'unsafe-inline' {GA_HOSTS if consent-enabled};
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://cdn.shopify.com {GA_IMG_HOSTS};
font-src 'self';
media-src 'self' https://cdn.shopify.com blob:;
connect-src 'self' https://belurae.myshopify.com https://monorail-edge.shopifysvc.com {GA_CONNECT_HOSTS};
frame-src 'self' https://checkout.belurae.com https://shop.app;
worker-src 'self' blob:;
object-src 'none';
base-uri 'self';
form-action 'self' https://checkout.belurae.com https://shopify.com;
frame-ancestors 'none';
manifest-src 'self';
upgrade-insecure-requests;
report-to csp-endpoint; report-uri /api/csp-report
```

Notes:

- `style-src 'unsafe-inline'` is needed for `next/font` and React style attributes; low risk (no script execution).
- `connect-src` to Shopify only if any client-side Storefront calls exist; the plan keeps them server-side, so this can likely shrink to `'self'` + analytics — confirm during implementation and remove unused hosts.
- `frame-src` for Shop Pay/accelerated checkout buttons only if enabled; otherwise remove.
- `'unsafe-eval'` never in production (dev only for React Refresh).
- CSP built by `lib/security/csp.ts` from an **integration registry**, so enabling an integration adds its hosts and disabling removes them (pattern ported from `reference/src/middleware.ts`).

### Third-party inventory & audit (§43)

| Integration | Why | Necessary? | CSP additions | Perf impact | Privacy impact | Loading | Decision |
|---|---|---|---|---|---|---|---|
| Shopify Storefront/Customer APIs | Commerce | Yes | none (server-side) | none on client | Customer data processed by Shopify (processor) | Server | **Use** |
| Shopify Checkout | Payments | Yes | `form-action`/`frame-src` checkout domain | Off-site | PCI handled by Shopify | Navigation | **Use** |
| Shopify Analytics (`sendShopifyAnalytics` via `@shopify/hydrogen-react`) | Shopify reports, attribution | Yes | `connect-src monorail-edge.shopifysvc.com` | ~5 KB, idle | Respects Customer Privacy API consent | After consent, idle | **Use** |
| Shopify Customer Privacy API | Consent state shared with checkout | Yes (EU/UK/CA) | Script from Shopify CDN if used client-side | ~10 KB | Is the privacy control | On load (small) | **Use** or own banner wired to it |
| Judge.me reviews | Verified reviews + post-purchase requests | Yes (once orders exist) | none — fetched server-side via API; review photos from Judge.me CDN → `img-src` host | 0 KB client | Reviewer names shown (first name + initial) | Server | **Use (server API only, no widget JS)** |
| GA4 | Funnel analysis | Optional | `script-src/connect-src/img-src` Google hosts | ~50 KB | Cookies, cross-site | After consent + idle | **Optional**; consider Shopify Analytics + Vercel Web Analytics first |
| Vercel Speed Insights / Web Analytics | Real-user CWV, cookieless pageviews | Yes (CWV is a core requirement) | `'self'` (proxied) | ~1–2 KB | Cookieless | Idle | **Use** |
| Meta Pixel + CAPI | Paid social attribution | Only when running Meta ads | `connect.facebook.net`, `facebook.com` (script, img, frame, form) | ~60–90 KB | High | After marketing consent only | **Defer**; use Shopify's Meta channel (server-side CAPI from checkout) to avoid the client pixel where possible |
| GTM | Tag management | **No** | Wildcard-ish hosts | Heavy, uncontrolled | High | — | **Do not install** (breaks CSP/budget governance) |
| TikTok Pixel | Ads | Only with TikTok ads | TikTok hosts | ~70 KB | High | After consent | **Defer** (same as Meta: prefer server-side via Shopify channel) |
| Microsoft Clarity | Session replay | No at launch | clarity hosts | ~25 KB + uploads | High (replay) | — | **Not at launch** |
| Email (Shopify Email / Klaviyo) | Newsletter, flows | Yes | none if server-side subscribe | 0 KB client | Email address | Server Action | **Server-side only**; no Klaviyo onsite JS/popups |
| Support chat | Customer support | Not at launch | Vendor hosts | 100 KB+ | Chat transcripts | — | **Not at launch**; email + contact form. Revisit with click-to-load facade |
| Video host | Media | Shopify-hosted | `media-src cdn.shopify.com` | Controlled | None | Lazy | **Use Shopify**, no YouTube embeds on commerce pages |
| Cloudflare Turnstile | Bot defence on forms | Only if abuse | `challenges.cloudflare.com` script/frame | ~ 30 KB on form pages | Low | Only on form focus | **Standby** |

---

## 33. API security

| Control | Implementation |
|---|---|
| Input validation | zod schemas at every boundary: Server Action args, route handler query/body, webhook payloads. GIDs validated with regex `^gid://shopify/ProductVariant/\d+$`; quantity int 1–10; email RFC-lite + length ≤ 254; search `q` trimmed, ≤ 80 chars. |
| Authentication | Customer: encrypted session + Customer Account API token (refresh server-side). Webhooks: HMAC. Revalidate: bearer secret, timing-safe. |
| Authorisation | Account data fetched with the customer's own token → Shopify enforces ownership. Order/return actions re-verify the order belongs to the session customer before mutation. |
| CSRF | Server Actions: Next's built-in Origin/Host check + POST-only; `serverActions.allowedOrigins` = `['belurae.com']`. Session cookie `SameSite=Lax`. Route handlers that mutate require a custom header or secret (not cookie-only). |
| Rate limiting | Vercel WAF rules (global per-IP) + Upstash sliding window per route: search suggest 30/min/IP, newsletter 5/hour/IP, cart actions 60/min/session, CSP report 30/min/IP, webhooks unlimited (HMAC first). |
| Secure errors | Generic messages to the client (`"Something went wrong. Please try again."`), correlation id; details only in server logs. No Shopify error strings passed through. |
| Secret leakage | `server-only` imports, env validation, CI bundle scan, log redaction (tokens, emails masked). |
| Never trust client | prices, discounts, inventory, customer id — all resolved server-side or by Shopify. |
| Dependencies | `npm audit --omit=dev` in CI (fail on high), Renovate weekly, lockfile-only installs (`npm ci`). |
| Logging | Structured JSON, no PII payloads; webhook topics/ids only. |

---

## 34. Analytics architecture

### Principles

- **Consent first**: nothing non-essential loads before consent in regions requiring it; consent state from Shopify Customer Privacy API so checkout and storefront agree.
- **One event layer**: `lib/analytics/events.ts` exposes typed `track(event, payload)`; adapters fan out to Shopify Analytics, GA4 (if enabled), Vercel. Components never call vendor SDKs.
- **Deferred**: adapters load via `requestIdleCallback` after consent.
- **Server-side where possible**: purchase events come from Shopify checkout (native), not client pixels.

### Event schema

| Event | Trigger | Payload | Destinations |
|---|---|---|---|
| `page_view` | Route change | path, page_type | Shopify, GA4, Vercel |
| `view_item` | PDP render (client island mount) | product id, variant id, price, currency | Shopify (`PRODUCT_VIEW`), GA4 |
| `view_item_list` / `view_collection` | Collection view | collection handle, item ids (first 12) | Shopify (`COLLECTION_VIEW`), GA4 |
| `select_item` | Card click | item id, list name, index | GA4 |
| `select_variant` | Variant/pack change | variant id, option values | GA4 (custom) |
| `add_to_cart` | Server Action success | variant, qty, value | Shopify (`ADD_TO_CART`), GA4 |
| `remove_from_cart` | Line removed | variant, qty | GA4 |
| `begin_checkout` | Checkout click | cart value, item count | GA4 |
| `purchase` | Shopify checkout | — | Shopify native; GA4 via Shopify channel/Customer Events |
| `search` | Search submit | query (trimmed), results count | Shopify (`SEARCH_VIEW`), GA4 |
| `view_video` | 3 s watched / completed | video id, percent | GA4 |

No PII in events. Query strings in search events are truncated and lower-cased.

---

## 35. Accessibility architecture (WCAG 2.2 AA)

### Foundations

| Area | Rule |
|---|---|
| Semantics | One `<h1>` per page; landmark roles via elements (`header`, `nav`, `main`, `footer`); lists for lists; `<button>` for actions, `<a>` for navigation. |
| Skip link | "Skip to content" first focusable element. |
| Focus | Visible 2 px `--accent` outline + 2 px offset on every interactive element (`:focus-visible`); never removed; focus not obscured by sticky header/ATC bar (`scroll-padding-top`/`bottom`) — WCAG 2.4.11. |
| Contrast | Tokens pre-checked (01-brand §4): text ≥ 4.5:1, large text/UI ≥ 3:1. Text over imagery only with scrim, verified per image. |
| Target size | ≥ 24×24 CSS px minimum (2.5.8), design standard 44×44. |
| Motion | `prefers-reduced-motion` honoured globally; autoplay video has pause control and stops under reduced motion (2.2.2). |
| Forms | Visible labels, `autocomplete`, errors linked via `aria-describedby`, error summary on submit, no placeholder-only labels; newsletter success announced via `role="status"`. |
| Images | Meaningful alt; decorative `alt=""`; product galleries announce position ("Image 3 of 8"). |
| Language | `<html lang="en">` (+ per-market later). |
| Zoom/reflow | Usable at 400% zoom / 320 px width without horizontal scroll (1.4.10). |
| Consistent help | Contact link in the same place (footer + PDP) on every page (3.2.6). |
| Accessible authentication | Shopify customer login uses email code (no cognitive test) (3.3.8). |

### Component patterns

| Component | Pattern |
|---|---|
| Mega-menu | Disclosure buttons (`aria-expanded`, `aria-controls`), not `role="menu"`; Esc closes; focus returns. |
| Mobile menu / Cart drawer / Sheets / Search | Native `<dialog>` with `showModal()` (focus trap + inert background built in), labelled by heading, Esc closes, focus restored to trigger. |
| Gallery / carousels | Not auto-rotating; previous/next buttons with labels; slide count announced; swipe is additive. Desktop grid is not a carousel at all. |
| Variant & pack selectors | `fieldset` + `legend` + native radio inputs styled as chips/cards; disabled options `aria-disabled` + text "Not available". |
| Accordions / FAQ | `<details>/<summary>` (keyboard + screen reader support native). |
| Quantity stepper | Labelled buttons ("Decrease quantity", "Increase quantity") + input `type="number"` with label; changes announced via live region. |
| Add to bag | Button state change + `role="status"` message "Added to bag: Mousse, 2 cans". |
| Reviews filters | Toggle buttons with `aria-pressed`; result count in live region. |
| Toasts | `role="status"`, not auto-dismissed in < 5 s, dismissible. |
| Videos | Captions (WebVTT) + transcript; controls keyboard-operable. |

### Testing

- Automated: `@axe-core/playwright` on every template in CI (0 serious/critical violations to merge); eslint-plugin-jsx-a11y.
- Manual per release: keyboard-only pass, VoiceOver (iOS Safari) and NVDA (Firefox/Chrome) pass on Home → PDP → cart → checkout handoff; 200%/400% zoom; reduced motion on.
- Publish `/pages/accessibility` statement with contact route for issues.
