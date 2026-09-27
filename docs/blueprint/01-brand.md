# 01 — Brand

Covers brief §1 Positioning · §2 Voice · §3 Visual identity · §4 Color · §5 Typography.

---

## 1. Brand positioning

### Positioning statement

> For people who want personal care to feel easier, **Belurae** is a beauty & wellness brand that makes everyday body rituals simpler to understand and simpler to do — by saying clearly what each product is, how to use it, and what it won't do.

### The idea: *clarity is the luxury*

Most hair-removal and body-care brands compete on intensity ("instant", "painless", "clinically proven"). Belurae competes on **clarity**: honest descriptions, visible ingredient lists, exact directions, stated limitations. The premium feeling comes from restraint, space and precision — not from promises.

| Belurae is | Belurae is not |
|---|---|
| Calm, precise, warm | Hyped, urgent, clinical |
| Editorial (photography + typography) | Template (badges + icons + banners) |
| Honest about limits ("patch test first", "not for the face") | "Safe for everyone", "pain-free" |
| A routine-builder (products that work together) | A single-product funnel |

### Slogan exploration

| Line | Strength | Weakness | Verdict |
|---|---|---|---|
| **Beauty, made simpler.** | Names the promise; scales to every category; three words | Generic without the visual system behind it | **Primary brand line** |
| Thoughtful care for everyday rituals. | Warm, describes the product range | Long; "rituals" is category-common | **Descriptor** (meta descriptions, footer, Organization `description`) |
| Feel good in your skin. | Emotional | Widely used; implies an outcome we can't verify | Campaign-only |
| Care, clearly. | Encodes the transparency idea; short | Colder | Use as the **transparency section title** ("Care, clearly: what's inside") |

**Recommendation:** "Beauty, made simpler." as the brand line, "Thoughtful care for everyday rituals." as the descriptor, "Care, clearly." as the recurring label for ingredient/safety content. They reinforce one idea: simplicity through clarity.

### Brand pillars (every page should express at least one)

1. **Simple** — fewer steps, fewer words, one clear next action.
2. **Clear** — full ingredients, exact directions, stated limitations.
3. **Considered** — products chosen to work together as a routine.
4. **Warm** — human language, real skin, no shame about body hair.

---

## 2. Brand voice

### Voice attributes

| Attribute | Means | Sounds like | Never |
|---|---|---|---|
| Clear | Plain words, concrete numbers | "Leave on for 5–10 minutes. Not longer." | "Advanced fast-acting technology" |
| Calm | No urgency, no exclamation marks | "Ready when you are." | "Hurry! Only 3 left!" |
| Honest | States limits next to benefits | "Everyone's skin is different — patch test 24 hours before." | "Safe for all skin types" |
| Warm | Second person, kind, body-neutral | "However you choose to care for your body hair." | "Say goodbye to embarrassing hair" |

### Writing rules

1. Every claim has a source: packaging, INCI list, or documented policy. If no source → don't write it.
2. Attribute manufacturer claims: "labelled hypoallergenic by the manufacturer", not "hypoallergenic".
3. Numbers over adjectives: "5–10 minutes" beats "fast".
4. Body-neutral: hair removal is a choice, never a fix for something shameful.
5. No absolute words: *painless, pain-free, guaranteed, 100%, safe for everyone, instant, permanent, miracle, clinically proven* (unless a real study exists).
6. Gender-inclusive by default ("anyone who removes body hair"), because the product is labelled for men and women.
7. Sentence case for headings. Uppercase only for eyebrows and small buttons (tracked, `letter-spacing: 0.08em`).

### Before → after (applied to current copy)

| Current | Belurae |
|---|---|
| "Pain-free. No blade, no pulling — spray, wait, wipe away." | "No blade, no strips. Spray, wait 5–10 minutes, wipe away." |
| "Sensitive-skin safe. Hypoallergenic, no additives, non-irritating." | "Labelled hypoallergenic by the manufacturer. Every skin is different — patch test 24 hours before first use." |
| "Works at the root, not just the surface." | *(remove unless R6 substantiation arrives)* |
| "35% less chemical ingredients" | *(remove — not meaningful or verifiable)* |
| "Razors nick. Wax pulls." | "Razors use a blade. Wax pulls hair out. This works differently: it dissolves hair so you can wipe it away." *(verify mechanism wording against R1 active)* |

---

## 3. Visual identity

### Principles

1. **Photography leads, type frames it.** Every section is built around one real image or video; typography does the rest. Icons are the exception, not the system.
2. **Quiet grid.** 12-column desktop, 4-column mobile, generous vertical rhythm (section padding 96–160 px desktop, 64–96 px mobile).
3. **Flat and sharp.** Radius 0–4 px on media and cards, 999 px only on pills (variant chips). Shadows only on overlays (drawer, sheet, menu).
4. **One accent at a time.** Each viewport shows at most one green CTA and one rose detail.
5. **Real skin.** Unretouched texture, diverse skin tones and body types, natural light.

### Logo direction (for the brand designer)

- Wordmark only for launch: **BELURAE** in a custom-spaced serif or high-contrast sans, uppercase, tracked +6–10%.
- Monogram **B** for favicon, packaging seal, social avatar.
- Must read at 16 px (favicon) and 88 px wide (mobile header).
- Deliver: SVG (ink), SVG (ivory), monochrome PNG for email.

### Photography art direction

| Category | Light | Background | Styling | Avoid |
|---|---|---|---|---|
| Product | Soft window light, 45°, gentle shadow | Ivory plaster, travertine, linen | Single product + one natural prop (stone, leaf, ceramic) | Floating renders, glossy reflections, gradients |
| Texture | Macro, raking light | Neutral | Mousse swatch on skin or glass | Oversaturated white foam |
| Application | Natural daylight | Bathroom stone/tile, towel | Real hands, real skin texture, visible hair where honest | Faceless "perfect" limbs, retouched pores |
| Lifestyle | Morning light | Bathroom, bedroom linen | Calm routine moments | Beach-bikini clichés, sexualised framing |
| Ingredient | Studio, soft | Cream/beige paper | Aloe leaf, ginseng root, portulaca — only ingredients confirmed by R1 | Ingredients not in the formula |

### Motion identity

- Durations 180–320 ms, easing `cubic-bezier(0.2, 0, 0, 1)`.
- Only opacity + transform. No scroll-jacking, no smooth-scroll library, no parallax on text.
- `prefers-reduced-motion: reduce` → all transitions become instant; autoplay videos show the poster with a play button.

---

## 4. Color system

### Palette (contrast computed against `--background #FAF7F2`)

| Token | Hex | Role | Contrast on bg | Allowed use |
|---|---|---|---|---|
| `--background` | `#FAF7F2` | Warm ivory page | — | Page |
| `--surface` | `#F3EDE4` | Soft cream sections, cards | — | Alternating sections, product card image well |
| `--surface-muted` | `#EAE2D6` | Warm beige | — | Trust strip, footer, input fill (hover) |
| `--surface-raised` | `#FFFFFF` | Overlays | — | Drawer, sheet, menu, dialog |
| `--text-primary` | `#1F1D1A` | Deep charcoal | 15.7 : 1 | All body text |
| `--text-secondary` | `#5B554D` | Warm grey | 6.9 : 1 | Captions, meta, helper text |
| `--accent` | `#3E5242` | Muted botanical green | 7.9 : 1 (ivory text on it: 7.9 : 1) | Primary CTA fill, active states, focus ring, links on hover |
| `--accent-strong` | `#33443A` | Green, hover/pressed | 9.7 : 1 | CTA hover |
| `--highlight` | `#C4907F` | Dusty rose/peach | 2.6 : 1 | **Decorative only**: rule lines, active dot, selected-chip underline, illustration. Never text. |
| `--highlight-ink` | `#96594A` | Rose, text-safe | 5.1 : 1 | Small highlighted words, "Most chosen" label |
| `--highlight-tint` | `#F2E1D9` | Rose wash | ink on it 13.3 : 1 | Selected bundle card background, notice banners |
| `--border` | `#D9D0C3` | Hairline dividers | 1.4 : 1 | Decorative dividers only |
| `--border-strong` | `#8C8378` | Input/control borders | 3.5 : 1 | Inputs, chips, checkboxes (meets 3 : 1 non-text on bg and surface) |
| `--success` | `#2F6246` | | 6.7 : 1 | Added-to-cart, in stock |
| `--warning` | `#8A5A10` | | 5.5 : 1 | Low stock (only when true), patch-test callouts |
| `--error` | `#A2382B` | | 6.3 : 1 | Form errors |

Rules:

1. Neutral share of any screen ≥ 85%. Green ≤ 10%. Rose ≤ 5%.
2. `--highlight-ink` and `--border-strong` fail on `--surface-muted` for small text/controls → never place inputs or small rose text on beige.
3. No gradients except a 0→40% charcoal scrim behind text on hero imagery (only when text overlays an image).
4. Dark mode: not at launch (beauty imagery is art-directed for light). Tokens are structured so it can be added.

### Token layers

```
primitive   --ivory-50 #FAF7F2  --cream-100 #F3EDE4  --beige-200 #EAE2D6  --sage-700 #3E5242 …
semantic    --background → --ivory-50   --accent → --sage-700 …
component   --button-primary-bg → --accent   --chip-selected-border → --text-primary …
```

Components only read semantic/component tokens. Implemented as CSS custom properties + Tailwind v4 `@theme`.

---

## 5. Typography

### Families

| Role | Family | Why | Axes/weights shipped | Est. size (WOFF2, latin+latin-ext) |
|---|---|---|---|---|
| Display / editorial | **Newsreader** (variable, OFL) | Editorial serif with optical sizing (opsz 6–72) → elegant at 64 px, readable at 18 px; real italic | Roman: wght 300–500, opsz; Italic: wght 400 only | ~48 KB roman, ~24 KB italic (subset) |
| UI / body | **Hanken Grotesk** (variable, OFL) | Neutral grotesk in the Neue-Haas family feel, good at small sizes, wide latin-ext coverage | wght 400–600 | ~38 KB |

Alternatives if licensing budget exists: Canela / Söhne. The blueprint's budgets assume the free pair.

Loading:

- Self-host WOFF2 in `/app/fonts/`, loaded via `next/font/local` (auto `size-adjust` fallback → no CLS, no external request).
- `font-display: swap` for both.
- **Preload only Hanken Grotesk roman** (used above the fold everywhere). Newsreader loads on demand; hero headline uses it but the hero *image* is the LCP element, so a brief fallback swap is acceptable.
- Subsets: `latin` + `latin-ext`. Add Cyrillic/Greek files only when a market needs them (unicode-range split, zero cost until used).

### Type scale (fluid, `clamp()`)

| Token | Mobile → Desktop | Family | Weight | Line height | Tracking | Use |
|---|---|---|---|---|---|---|
| `display-xl` | 44 → 88 px | Newsreader | 350 | 1.02 | −0.02em | Homepage hero H1 |
| `display-l` | 36 → 64 px | Newsreader | 350 | 1.05 | −0.015em | Section openers, PDP story |
| `heading-1` | 30 → 44 px | Newsreader | 400 | 1.1 | −0.01em | Page H1 (collection, guide, PDP name) |
| `heading-2` | 24 → 32 px | Newsreader | 400 | 1.15 | 0 | Section H2 |
| `heading-3` | 18 → 20 px | Hanken | 600 | 1.3 | 0 | Card titles, FAQ questions |
| `body-l` | 17 → 19 px | Hanken | 400 | 1.6 | 0 | Editorial paragraphs |
| `body` | 16 px | Hanken | 400 | 1.55 | 0 | Default |
| `body-s` | 14 px | Hanken | 400 | 1.5 | 0.005em | Meta, captions |
| `eyebrow` | 12 → 13 px | Hanken | 600 | 1.2 | 0.12em uppercase | Eyebrows, labels |
| `button` | 14 → 15 px | Hanken | 600 | 1 | 0.08em uppercase | Buttons |

Rules: body never below 16 px on inputs (prevents iOS zoom); measure 60–72 characters for editorial text; italic Newsreader for one emphasised word per headline at most.
