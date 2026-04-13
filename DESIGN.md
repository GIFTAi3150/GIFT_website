# GIFT Inc. — Design Token Reference

> Version 1.0 · 2026-04-13
> Source of truth for Next.js + Tailwind + TS rebuild.
> Derived from `gift-style.md` (scraped from gift-inc.org).
> Full research notes and alternatives live in `scratchpad/design-spec.md`.

---

## NEEDS USER INPUT

The following items are flagged and must not be blocked on by frontend. Record your decisions and we will patch them in.

| # | Item | Why it matters | Status |
|---|---|---|---|
| 1 | **Bob Marley quote** | Present on current site. Keep, remove, or replace? Affects hero/about copy. | Awaiting decision |
| 2 | **Photo and logo assets** | No production-quality photos or final logo files confirmed. Placeholder strategy in use until assets arrive. | Assets not yet received |
| 3 | **Multilingual (JP + EN) at launch vs Phase 2** | Drives whether `next-intl` is wired at Day 0 or bolted on later. Affects routing and component structure. | Awaiting decision |
| 4 | **Brass accent (`#b08944`) sign-off** | Most opinionated single choice in the palette. If this reads as too warm/gold, fall back to Palette B (Emerald & Ice) documented in `scratchpad/design-spec.md`. | Awaiting confirmation |
| 5 | **Serif vs. all-sans** | Zen Old Mincho on hero is recommended but if user wants all-sans (closer to e-pace), switch to Pairing 3 in `scratchpad/design-spec.md`. | Awaiting confirmation |
| 6 | **Business-line color coding** | Do Telemarketing / LINE / RPA / Real Estate each need a sub-accent? Affects whether a second hue is added to the palette. | Awaiting decision |

---

## 1. Color Tokens (locked — pending brass and business-line decisions)

Recommendation: **Palette A — Forest & Brass**. Anchors on the existing green, adds brass as a single warm luxurious hairline accent. Rationale: brass reads as premium B2B without drifting into fintech/SaaS; one accent color doing all the heavy lifting is the same discipline e-pace uses with its purple.

### Core tokens

| Token name | Hex | Tailwind key | Usage |
|---|---|---|---|
| `--brand-green` | `#357b49` | `brand-green` | Primary CTA, link underlines, active states, motif stroke color |
| `--brand-green-deep` | `#1f5230` | `brand-green-deep` | Hover on primary green, dark hero gradient base, heading accents |
| `--brass` | `#b08944` | `brass` | Hairline dividers, small decorative icons, kanji numeral styling — use sparingly |
| `--ink` | `#1a1d21` | `ink` | All body copy and headings (deeper than original charcoal for print-like contrast) |
| `--charcoal` | `#32373c` | `charcoal` | Dark surface backgrounds, primary (pill) button background |
| `--paper` | `#ffffff` | `paper` | Default page and card surface |
| `--bone` | `#f6f3ec` | `bone` | Warm editorial section backgrounds (replaces cold `#f6f7f7` in content-heavy sections) |
| `--mist` | `#f6f7f7` | `mist` | System-level alternating section bg — kept for compatibility |

### Discarded WordPress accent colors

The following hex values from `gift-style.md` are **not carried forward**. They were WordPress block defaults, not intentional brand colors.

`#0693e3` `#9b51e0` `#cf2e2e` `#ff6900` `#7bdcb5` `#00d084` `linear-gradient(135deg, …)`

---

## 2. Typography

### Recommendation: Pairing 1 — Zen Old Mincho (display) + Zen Kaku Gothic New (body/UI)

Rationale: both fonts are from the Zen family, ensuring consistent kerning and rhythm across JP and EN. Zen Old Mincho carries "luxury / heritage / gift" on display; Zen Kaku Gothic New carries "modern / corporate / B2B" on body and UI. Both cover JIS X 0208. Both load via `next/font/google` — no external stylesheet needed.

### Font variables

| Variable | Font | Weights | Role |
|---|---|---|---|
| `--font-display` | Zen Old Mincho | 500, 700 | Hero headings, section titles, JP display kanji |
| `--font-sans` | Zen Kaku Gothic New | 400, 500, 700 | Body copy, UI labels, nav, buttons, all body JP text |
| `--font-mono` | JetBrains Mono | 400 | Data tables, code, technical specs only |

### `app/fonts.ts` (paste verbatim)

```ts
import { Zen_Old_Mincho, Zen_Kaku_Gothic_New, JetBrains_Mono } from 'next/font/google';

export const display = Zen_Old_Mincho({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const sans = Zen_Kaku_Gothic_New({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});
```

Wire all three variables onto `<html className={[display.variable, sans.variable, mono.variable].join(' ')}>`.

---

## 3. Type Scale

Fluid scale using `clamp()`. Base ratio approximately 1.25 (major third) at body sizes, stepping up to 1.333 at display. Line-height values are tuned for JP readability at body (`1.75`) and tighter at display (`1.15`).

| Tailwind key | clamp() value | Intended usage |
|---|---|---|
| `text-2xs` | `clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)` | Eyebrow labels, legal, copyright |
| `text-xs` | `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)` | Captions, image credits |
| `text-sm` | `0.875rem` | Meta text, timestamps, fine print |
| `text-base` | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | All body copy |
| `text-md` | `clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)` | Lead / intro paragraphs |
| `text-lg` | `clamp(1.1875rem, 1.1rem + 0.5vw, 1.375rem)` | Subheadings, card titles |
| `text-xl` | `clamp(1.375rem, 1.2rem + 1vw, 1.75rem)` | H3 |
| `text-2xl` | `clamp(1.75rem, 1.5rem + 1.4vw, 2.25rem)` | H2 / section headings |
| `text-3xl` | `clamp(2.125rem, 1.7rem + 2.2vw, 3rem)` | H1 / section hero |
| `text-4xl` | `clamp(2.625rem, 2rem + 3.2vw, 4rem)` | Hero display heading |
| `text-5xl` | `clamp(3.25rem, 2.2rem + 5.2vw, 5.5rem)` | Oversized kanji kicker, full-bleed numbers |

Line-height defaults by context:

- Display (`text-3xl` and up): `1.15`
- UI / subheadings (`text-lg` to `text-2xl`): `1.35`
- Body (`text-base` to `text-md`): `1.75`
- Small / meta (`text-sm` and below): `1.5`

---

## 4. Spacing Scale

Tailwind default spacing scale is retained. Three additional tokens added to bridge the original WordPress spacing values.

| Token | Value | Equivalent | Source |
|---|---|---|---|
| `spacing.4.5` | `1.125rem` | 18px | Bridges WP `50` (1.5rem) and `40` (1rem) |
| `spacing.13` | `3.25rem` | 52px | Maps to WP `70` (3.38rem), used for section vertical rhythm |
| `spacing.18` | `4.5rem` | 72px | Maps to WP `80` (5.06rem) compressed — used for large section gaps |

Section vertical padding convention: `py-13` on desktop, `py-8` on mobile.
Container horizontal padding: `px-4` on mobile, `px-6` on tablet, `px-8` on desktop.

---

## 5. Layout Direction

**Decision: centered constrained container with intentional full-bleed breaks.**

- Default content width: `max-w-6xl` (72rem / 1152px) centered with auto margins.
- Hero section: full-bleed (`w-full`) — the mark/motif and imagery live edge-to-edge.
- Color section dividers (e.g., bone or mist bands): full-bleed background, constrained content inside.
- No full-bleed body text. All readable copy stays inside the constrained container.

Rationale: full-bleed-only layouts require strong photography and assets, which are currently unconfirmed. Constrained container is forgiving during the asset-unknown phase and matches the established corporate/professional expectation of the audience. Full-bleed hero is still possible and budgeted.

---

## 6. Component Style Direction

### Border radius

| Token | Value | Usage |
|---|---|---|
| `rounded-pill` | `9999px` | Primary (dark) button — matches existing site exactly |
| `rounded-cta` (`rounded-lg` equivalent) | `8px` | Green CTA/accent button — matches existing site exactly |
| `rounded-sm` | `4px` | Cards, input fields, badges |
| `rounded-none` | `0` | Section containers, nav, footer — no rounding at layout level |

### Shadows

| Token | Value | Usage |
|---|---|---|
| `shadow-lift` | `0 4px 12px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.16)` | Card hover, CTA button hover — matches existing hover state |
| `shadow-natural` | `6px 6px 9px rgba(0,0,0,0.2)` | Floating elements, modals |

Deep, Sharp, Outlined, and Crisp shadows from the original site are **not carried forward** — they belong to WordPress block styles and are too heavy for the target minimalist aesthetic.

### Button conventions

| Variant | Background | Text | Radius | Font weight |
|---|---|---|---|---|
| Primary (dark) | `charcoal` `#32373c` | `paper` `#ffffff` | `pill` (9999px) | 500 |
| CTA / Accent (green) | `brand-green` `#357b49` | `paper` `#ffffff` | `8px` | 500 |
| Ghost | transparent | `brand-green` | `8px` | 500, green border 1.5px |

Hover on all variants: `shadow-lift` + `brightness-110` (CSS `filter: brightness(1.1)`). Transition: `all 0.2s ease`.

### Navigation

- Horizontal on desktop (`md` breakpoint and up), hamburger on mobile.
- Nav links: `font-sans`, weight 500, `text-sm`.
- Active/current page: green underline (`brand-green`, 2px, `underline-offset-4`).
- Background: `paper` with a `border-b border-mist` rule when scrolled (use scroll listener or `sticky` with backdrop-blur).

---

## 7. Tailwind Config Snippet

Drop into `tailwind.config.ts`. Assumes font variables are wired on `<html>` and CSS variables are declared in `app/globals.css`.

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green:      '#357b49',
          'green-deep': '#1f5230',
          brass:      '#b08944',
        },
        ink:      '#1a1d21',
        charcoal: '#32373c',
        paper:    '#ffffff',
        bone:     '#f6f3ec',
        mist:     '#f6f7f7',
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs': ['clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)',  { lineHeight: '1.5' }],
        xs:    ['clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)', { lineHeight: '1.5' }],
        sm:    ['0.875rem',                                     { lineHeight: '1.6' }],
        base:  ['clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',      { lineHeight: '1.75' }],
        md:    ['clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',    { lineHeight: '1.7' }],
        lg:    ['clamp(1.1875rem, 1.1rem + 0.5vw, 1.375rem)',  { lineHeight: '1.5' }],
        xl:    ['clamp(1.375rem, 1.2rem + 1vw, 1.75rem)',      { lineHeight: '1.35' }],
        '2xl': ['clamp(1.75rem, 1.5rem + 1.4vw, 2.25rem)',     { lineHeight: '1.25' }],
        '3xl': ['clamp(2.125rem, 1.7rem + 2.2vw, 3rem)',       { lineHeight: '1.2' }],
        '4xl': ['clamp(2.625rem, 2rem + 3.2vw, 4rem)',         { lineHeight: '1.15' }],
        '5xl': ['clamp(3.25rem, 2.2rem + 5.2vw, 5.5rem)',      { lineHeight: '1.1' }],
      },
      borderRadius: {
        pill: '9999px',
        cta:  '8px',
      },
      boxShadow: {
        lift:    '0 4px 12px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.16)',
        natural: '6px 6px 9px rgba(0,0,0,0.2)',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
      maxWidth: {
        container: '72rem', // 1152px — default content width
      },
    },
  },
  plugins: [],
} satisfies Config;
```

### Companion `app/globals.css` additions

```css
:root {
  --brand-green:      #357b49;
  --brand-green-deep: #1f5230;
  --brass:            #b08944;
  --ink:              #1a1d21;
  --charcoal:         #32373c;
  --paper:            #ffffff;
  --bone:             #f6f3ec;
  --mist:             #f6f7f7;
}

html {
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--paper);
  scroll-behavior: smooth;
}
```

---

## 8. What Is Not Designed Here

The following are out of scope for this token document and will be addressed separately once user input items above are resolved.

- Logo mark / wordmark final artwork
- Hero motif SVG (isometric gift box — direction proposed in `scratchpad/design-spec.md` section 5)
- Page-level layout wireframes
- Animation implementation details (ScrollReveal timing, SVG draw-on)
- i18n routing and `next-intl` configuration
- Business-line sub-page palette (depends on decision #6 above)
