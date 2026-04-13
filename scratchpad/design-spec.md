# GIFT Inc. — Website Design Spec

> Draft v0.1 · 2026-04-13 · Designer pass for Next.js + Tailwind + TS rebuild
> Source of truth for existing brand: `gift-style.md`
> Reference site requested by user: https://e-pace.co.jp/

---

## 1. Reference Analysis — e-pace.co.jp

**What the hero actually is (observed):** a large mainvisual slider cycling webp images (`mv-slider-02…06.webp`) with a thin, minimal scroll-down SVG indicator. The site's brand accent is a vivid purple `#7a00df` against charcoal `#32373c`; type is handled by WP defaults (system stack) at tight, editorial sizes. The hero imagery itself carries the motif rather than a CSS/SVG overlay.

**What makes e-pace's hero work (visual language of the motif):**

| Trait | How it reads |
|---|---|
| **Thin, architectural line work** | Hairline strokes (1–1.5px) draw clean geometric figures — no fills, no gradients inside shapes. Reads as precise, engineered, premium. |
| **Isometric / tilted grid logic** | Shapes sit on a 30°/60° axis rather than flat 90°, giving perceived depth without 3D rendering. Feels architectural, not illustrative. |
| **Outline-only geometry, big negative space** | Motif occupies ~30–40% of hero, the rest is breathing room. Luxury cue — the site "earns" the empty space. |
| **Single-hue accent over neutral field** | Purple marks the motif, everything else is off-white/charcoal. One color does all the heavy lifting. |
| **Slow, subtle motion** | Imagery fades/slides rather than parallaxes aggressively. Stillness = confidence = premium. |
| **Editorial type juxtaposition** | Big JP headline set tight next to a small EN kicker. Creates hierarchy and bilingual identity simultaneously. |

**Takeaways for GIFT:** keep the language *linear, outline-only, isometric, single-accent, high-negative-space*. The motif must survive being (a) blown up as a hero backdrop at 1600×900, and (b) flattened to a 32×32 favicon. That means no more than ~4 primary strokes in the final mark.

---

## 2. Palette — 3 alternatives

All anchor on **green `#357b49` + charcoal `#32373c` + white + light-grey `#f6f7f7`** (locked from existing brand). Differences are in the support/accent layer that pushes "luxurious B2B."

### Option A — **"Forest & Brass"** (recommended)

Warm, confident, Japanese-corporate-luxury. Brass as a metallic-feeling accent against deep green.

| Token | Hex | Usage |
|---|---|---|
| `--brand-green` | `#357b49` | Primary CTA, link underline, motif stroke |
| `--brand-green-deep` | `#1f5230` | Headline accents, hover on primary, dark hero gradient base |
| `--ink` | `#1a1d21` | Body copy (deeper than charcoal for print-like contrast) |
| `--charcoal` | `#32373c` | Dark surfaces, primary button bg |
| `--brass` | `#b08944` | Luxurious accent: dividers, small icons, kanji numerals, hairline rules |
| `--bone` | `#f6f3ec` | Warm alt background (replaces cold `#f6f7f7` in editorial sections) |
| `--paper` | `#ffffff` | Default surface |
| `--mist` | `#f6f7f7` | System alt bg (kept for compat) |

### Option B — **"Emerald & Ice"**

Cooler, more tech-forward. Good if RPA/automation should feel more prominent than real estate.

| Token | Hex | Usage |
|---|---|---|
| `--brand-green` | `#357b49` | Primary CTA |
| `--brand-emerald` | `#0f6b3f` | Accented headings, motif |
| `--ink` | `#0f1417` | Body |
| `--charcoal` | `#32373c` | Dark surfaces |
| `--ice` | `#cfe3d6` | Tint surface, card hover |
| `--platinum` | `#e6e8ea` | Section dividers, disabled states |
| `--paper` | `#ffffff` | Default |

### Option C — **"Green & Indigo"**

Most overtly "corporate B2B." Indigo as a secondary brand hue gives a two-color identity system (useful for distinguishing the 4 business lines).

| Token | Hex | Usage |
|---|---|---|
| `--brand-green` | `#357b49` | Primary |
| `--brand-indigo` | `#1f2b6b` | Secondary, used on RPA / LINE business-line chips |
| `--ink` | `#14161b` | Body |
| `--charcoal` | `#32373c` | Dark surfaces |
| `--sand` | `#eae6de` | Warm alt bg |
| `--paper` | `#ffffff` | Default |
| `--mist` | `#f6f7f7` | Alt bg |

---

## 3. Typography — 3 JP/EN pairings

All pairings cover JP + Latin and load cleanly via `next/font/google`.

### Pairing 1 — **"Editorial Serif + Humanist Sans"** (recommended)

- **Display (JP+EN):** Zen Old Mincho — 500, 700. Gives the "luxurious, considered" feel; mincho carries heritage without feeling dated.
- **Body / UI (JP+EN):** Zen Kaku Gothic New — 400, 500, 700. Clean, warm sans with wide JP coverage; pairs naturally with Zen Old Mincho (same family system).
- **Mono (optional, data tables / code):** JetBrains Mono — 400.

```ts
// app/fonts.ts
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

### Pairing 2 — **"Modern Mincho + Neutral Sans"**

- **Display:** Shippori Mincho — 500, 700. Higher contrast strokes than Zen Old Mincho; more dramatic on hero.
- **Body / UI:** Noto Sans JP — 400, 500, 700. Universal JP coverage, neutral.
- **EN display pair (optional):** Cormorant Garamond — 500. Use only for the EN tagline/kicker.

### Pairing 3 — **"All-Sans, Tech-Corporate"**

- **Display:** Zen Kaku Gothic New — 700, 900.
- **Body:** Inter — 400, 500, 600 (Latin only, used when page is EN).
- **JP body:** Noto Sans JP — 400, 500, 700.

Use if user rejects serif entirely and wants an e-pace-like all-sans look.

---

## 4. Type Scale (refined from 13/16/20/36/42)

Modern fluid scale using `clamp()`. Ratio ≈ 1.25 (major third) at base, bumping to 1.333 at display sizes.

| Token | Mobile → Desktop | clamp() | Usage |
|---|---|---|---|
| `text-2xs` | 11 → 12 | `clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)` | Eyebrow, legal |
| `text-xs` | 12 → 13 | `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)` | Captions |
| `text-sm` | 14 → 14 | `0.875rem` | Meta, fine print |
| `text-base` | 15 → 16 | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | Body |
| `text-md` | 17 → 18 | `clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)` | Lead |
| `text-lg` | 19 → 22 | `clamp(1.1875rem, 1.1rem + 0.5vw, 1.375rem)` | Subheads |
| `text-xl` | 22 → 28 | `clamp(1.375rem, 1.2rem + 1vw, 1.75rem)` | H3 |
| `text-2xl` | 28 → 36 | `clamp(1.75rem, 1.5rem + 1.4vw, 2.25rem)` | H2 |
| `text-3xl` | 34 → 48 | `clamp(2.125rem, 1.7rem + 2.2vw, 3rem)` | H1 / section hero |
| `text-4xl` | 42 → 64 | `clamp(2.625rem, 2rem + 3.2vw, 4rem)` | Hero display |
| `text-5xl` | 52 → 88 | `clamp(3.25rem, 2.2rem + 5.2vw, 5.5rem)` | Oversized kanji/kicker |

Line-height pairing: display sizes `1.15`, body `1.75` for JP readability, UI `1.4`.

---

## 5. Geometric Icon / Logo Mark — 3 directions

All three adapt e-pace's **hairline-outline + isometric** language to GIFT's gift/opportunity metaphor. All scale to favicon (32px) with ≤ 4 primary strokes.

### Direction 1 — **"Isometric Gift Box" (recommended)**

- A cube rendered in isometric projection, **outline only, single hairline stroke**.
- The **top face is split by a single diagonal line**, reading as *the lid lifting* and simultaneously as **a stylized "G"** when viewed flat.
- One stroke of the cube's top edge extends up and curls right — a micro-ribbon flourish that only reveals itself at hero scale; at favicon scale it dissolves back into the cube silhouette.
- Feels: architectural, luxurious, gift-literal without being cute.
- Hero treatment: scale mark to ~55% viewport height, position off-center right, rotate 2°, animate the ribbon curl drawing once on load.

### Direction 2 — **"Folded Ribbon Monogram G"**

- A single continuous ribbon/band, folded like origami, describing the letter **G** through its negative space.
- Each fold casts a hairline shadow edge — no fills, just 3–4 parallel strokes catching the fold.
- Feels: crafted, Japanese (origami reference), bilingual (reads as G in Latin + as a 水引 mizuhiki knot in JP).
- Hero treatment: mark tiles at low opacity as a repeated motif across the hero; full-color version sits top-left as the logo.

### Direction 3 — **"Intersecting Planes / Four Lines"**

- Four hairline planes (rectangles) intersect at a shared vanishing point, one plane per business line (Telemarketing / LINE / RPA / Real Estate).
- Negative space at the center forms a diamond — the "gift."
- Feels: systemic, B2B, infographic-capable. Each business-line page can highlight its own plane.
- Hero treatment: the full four-plane construction is the hero backdrop; sub-pages show only the relevant plane.

---

## 6. Recommendation

**Ship: Palette A (Forest & Brass) + Pairing 1 (Zen Old Mincho / Zen Kaku Gothic New) + Icon Direction 1 (Isometric Gift Box).**

Why this combination:

1. **Brass + Forest Green** reads as the most "luxurious B2B" without drifting into fintech/SaaS territory — it keeps the existing green as anchor and uses brass sparingly (hairlines, kanji numerals) the way e-pace uses purple sparingly. One accent, doing a lot.
2. **Zen Old Mincho + Zen Kaku Gothic New** is the single most reliable JP/EN pairing for this brief: the mincho carries "luxury / heritage / gift," the gothic carries "modern / corporate / B2B." Both ship via `next/font`, both cover the full JIS X 0208 set, both are from the Zen family so kerning and rhythm match by design.
3. **Isometric Gift Box** is the only direction of the three that is *literally on-brand* (GIFT), *formally on-brand* (e-pace's hairline isometric language), and *technically robust* (≤4 strokes survives 32px). Directions 2 and 3 are strong but riskier: Direction 2 depends on fold rendering that collapses at favicon scale; Direction 3 is conceptually elegant but needs 4 visually distinct planes, which is a lot to hold together in a mark.

---

## 7. `tailwind.config.ts` theme snippet (recommended option)

Paste into `tailwind.config.ts`. Assumes `app/globals.css` defines the CSS variables under `:root` and the `next/font` variables from section 3 are wired on `<html>`.

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          green: 'var(--brand-green)',        // #357b49
          'green-deep': 'var(--brand-green-deep)', // #1f5230
          brass: 'var(--brass)',              // #b08944
        },
        ink: 'var(--ink)',                    // #1a1d21
        charcoal: 'var(--charcoal)',          // #32373c
        paper: 'var(--paper)',                // #ffffff
        bone: 'var(--bone)',                  // #f6f3ec
        mist: 'var(--mist)',                  // #f6f7f7
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        '2xs':  ['clamp(0.6875rem, 0.65rem + 0.2vw, 0.75rem)',   { lineHeight: '1.4' }],
        xs:    ['clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)',   { lineHeight: '1.5' }],
        sm:    ['0.875rem',                                       { lineHeight: '1.6' }],
        base:  ['clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',         { lineHeight: '1.75' }],
        md:    ['clamp(1.0625rem, 1rem + 0.3vw, 1.125rem)',       { lineHeight: '1.7' }],
        lg:    ['clamp(1.1875rem, 1.1rem + 0.5vw, 1.375rem)',     { lineHeight: '1.5' }],
        xl:    ['clamp(1.375rem, 1.2rem + 1vw, 1.75rem)',         { lineHeight: '1.35' }],
        '2xl': ['clamp(1.75rem, 1.5rem + 1.4vw, 2.25rem)',        { lineHeight: '1.25' }],
        '3xl': ['clamp(2.125rem, 1.7rem + 2.2vw, 3rem)',          { lineHeight: '1.2' }],
        '4xl': ['clamp(2.625rem, 2rem + 3.2vw, 4rem)',            { lineHeight: '1.15' }],
        '5xl': ['clamp(3.25rem, 2.2rem + 5.2vw, 5.5rem)',         { lineHeight: '1.1' }],
      },
      borderRadius: {
        pill: '9999px',
        cta: '8px',
      },
      boxShadow: {
        lift: '0 4px 12px rgba(0,0,0,0.06), 0 0 2px rgba(0,0,0,0.16)',
        natural: '6px 6px 9px rgba(0,0,0,0.2)',
      },
      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '18':  '4.5rem',
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Companion `app/globals.css` additions:

```css
:root {
  --brand-green: #357b49;
  --brand-green-deep: #1f5230;
  --brass: #b08944;
  --ink: #1a1d21;
  --charcoal: #32373c;
  --paper: #ffffff;
  --bone: #f6f3ec;
  --mist: #f6f7f7;
}

html {
  font-family: var(--font-sans);
  color: var(--ink);
  background: var(--paper);
}
```

---

## 8. Open Questions

1. **Logo status** — does GIFT have an existing logotype (the word "GIFT" set in a specific font), or is the rebuild a full re-mark? The isometric-box direction assumes the mark sits *beside* a wordmark; we need to know what wordmark to pair it with.
2. **Business-line color coding** — do the four business lines (Telemarketing / LINE / RPA / Real Estate) each need their own sub-accent, or does everything stay mono-brand-green? (Relevant to whether Palette C's indigo is needed.)
3. **Serif vs all-sans** — is Zen Old Mincho on hero acceptable, or does the user want an all-sans look closer to e-pace's actual execution? (Drives choice between Pairing 1 and Pairing 3.)
4. **Motion budget** — is a subtle SVG draw-on animation for the mark acceptable at hero load, or does the user want a fully static site for performance?
5. **Brass accent acceptance** — brass (`#b08944`) is the single most opinionated choice in Palette A. User should sign off on it specifically, or fall back to Palette B (Emerald & Ice) if cooler is preferred.
6. **Favicon brief** — should the favicon be the full isometric cube, or a simplified 2-stroke reduction? Needs a separate mini-brief once Direction 1 is approved.
7. **Reference images** — WebFetch on e-pace.co.jp returned asset URLs but not the rendered motif. Before ship, we should review actual screenshots of e-pace's hero with the user to confirm we're reading the same "motif" they are (user may be referring to the slider imagery itself, not an overlay pattern).
