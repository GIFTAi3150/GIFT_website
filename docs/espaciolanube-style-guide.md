# Espacio La Nube — Style Guide for the GIFT Recruitment Site

> **Source:** https://www.espaciolanube.com/ (Madrid-based architecture studio specializing in ephemeral inflatable structures for events, festivals, and brand activations).
> **Captured:** 2026-05-21 from Wayback snapshot `20250113104301` (live site blocks scrapers with a 403). All numeric tokens below were extracted from the rendered Wix Thunderbolt CSS, not invented.
> **Purpose:** Replicate the visual DNA on the GIFT Inc recruitment site. Use this file as the single source of truth when Claude Code is asked to "make the recruitment site look like espaciolanube."

---

## 1. TL;DR — the mood in one paragraph

Editorial-architectural. Big, ultra-condensed display type (**Anton**) stacked against airy white space, with a soft cloud-blue brand color and dark teal ink as the only real palette. Photography is the hero — large, full-bleed, color-rich images of physical installations break up the type. Animations are subtle: long, eased fades and slow scale-ins, slide page transitions, blurred background layers. It feels like a design boutique studio, not an agency: confident, premium, playful, image-led. **The type does not shout — the photography does. Anton is the frame, not the show.**

---

## 2. Color palette

Two colors do 90% of the work. The rest are accents and neutrals.

### Primary

| Role | Hex | RGB | Notes |
|------|-----|-----|-------|
| **Cloud Blue** (signature bg) | `#B0E0E9` | `176, 224, 233` | Pale sky/cloud tone. The "Nube" (cloud) brand reference. Use on full-section backgrounds, never as text. |
| **Deep Teal** (ink) | `#226D7A` | `34, 109, 122` | Primary text on cloud-blue. Also the brand voice color in headings. |
| **Paper White** | `#FFFFFF` | `255, 255, 255` | Default page bg. |
| **True Black** | `#000000` | `0, 0, 0` | Headings on white. |

### Accents (use sparingly — one per section max)

| Role | Hex | RGB |
|------|-----|-----|
| Sun Yellow | `#FFCB05` | `255, 203, 5` |
| Flag Red | `#ED1C24` | `237, 28, 36` |
| Pool Turquoise | `#12B7B3` | `18, 183, 179` |
| Sky Cyan | `#00B4FF` | `0, 180, 255` |
| Signal Blue | `#0088CB` | `0, 136, 203` |

### Neutrals

| Role | Hex |
|------|-----|
| Off-white | `#EFEFEF` |
| Light grey | `#ABABAB` |
| Mid grey | `#3E3E3E` |
| Soft ink | `#5F6360` |
| Near black | `#080808` |

### Rules

- **Default section:** white bg + black/teal text.
- **Hero / brand sections:** cloud-blue bg + deep-teal text. This is the signature look.
- **Photo sections:** let the photography supply the color. Background goes white or cloud-blue.
- **Never combine more than two accent colors in one viewport.** Even Espacio La Nube uses accents one-at-a-time across sections.

---

## 3. Typography

Two fonts. Both are free from Google Fonts.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
```

Or with `next/font` (preferred for this project):

```ts
// src/app/layout.tsx
import { Anton, Open_Sans } from "next/font/google";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
  display: "swap",
});
```

### Font roles

| Role | Family | Used for |
|------|--------|----------|
| **Display** | Anton (single weight, very condensed) | All headings H1–H4, hero, section labels, big numbers, callouts. |
| **Body** | Open Sans 400/600/700 | All running text, captions, nav, buttons, form labels. |

### Type scale (extracted verbatim from source `--font_N` vars)

| Token | Family | Size | Line-height | Suggested use |
|-------|--------|------|-------------|---------------|
| `display-xl` | Anton | 60px | 1.4 | Page hero headline (mobile: 40px) |
| `display-lg` | Anton | 51px | 1.4 | Section hero (mobile: 36px) |
| `display-md` | Anton | 40px | 1.4 | H2 (mobile: 30px) |
| `display-sm` | Anton | 37px | 1.4 | Big project titles |
| `display-xs` | Anton | 23px | 1.4 | H4, eyebrow labels |
| `body-lg`    | Open Sans | 18px | 1.4 | Lead paragraph |
| `body`       | Open Sans | 16px | 1.4 | Default body |
| `body-sm`    | Open Sans | 13px | 1.4 | Captions, meta |
| `body-xs`    | Open Sans | 12px | 1.4 | Nav, footer |
| `body-2xs`   | Open Sans | 10px | 1.4 | Legal, tags |

### Type rules

- **Line-height is always `1.4`.** Don't loosen it; the condensed display needs the tight rhythm.
- **Anton is uppercase-feeling even at default case.** Use mixed case for headlines; force `uppercase` only on small labels (`text-xs tracking-[0.18em] uppercase`).
- **Letter-spacing:** Anton is naturally tight — leave at `0`. Open Sans labels and eyebrows use `tracking-wider` (`0.05–0.18em`).
- **Never bold Anton.** It only ships in 400 and the design uses 400 everywhere. Weight is a function of size, not weight.
- **Italics:** none. The site has zero italic text.

---

## 4. Layout & spacing

### Container

- Max content width: **1240px** (`max-w-[1240px]` in Tailwind).
- Horizontal page gutter: `20px` mobile, `40px` desktop.
- Sections vertically padded `60px` minimum, `120px` for hero / first-fold sections.

### Grid

- 12-column grid on desktop, single column on mobile.
- Project galleries use 2- or 3-column grids with **square** or **landscape 3:2** tiles.
- Gaps: `gap-4` (16px) inside dense grids, `gap-8` (32px) for breathing room, `gap-16` (64px) between major sections.

### Vertical rhythm

- After a hero: 80–120px breathing space before the next block.
- Between paragraphs: standard `--font_2` (18px Open Sans) leading with paragraph spacing of `1.5em`.

---

## 5. Animations & interactions

Espacio La Nube is not flashy. The interaction language is **slow, eased, image-led**. Everything below was extracted from the live CSS.

### Easing curves (verbatim)

| Token | Curve | Use case |
|-------|-------|----------|
| `--ease-out-soft` | `cubic-bezier(.22, 1, .36, 1)` | Default page/element fade-ins. Decelerates fast at the start. |
| `--ease-inout-strong` | `cubic-bezier(.87, 0, .13, 1)` | Modal opens, big section reveals. |
| `--ease-inout-sine` | `cubic-bezier(.37, 0, .63, 1)` | Slide page transitions. |
| `--ease-in-heavy` | `cubic-bezier(.64, 0, .78, 0)` | Element exits / dismiss. |
| `--ease-out-quick` | `cubic-bezier(0, 0, .2, 1)` | Button presses, hover lifts (under 150ms). |

### Durations (verbatim)

- **Micro (hover, button press):** `100ms` (`transform .1s`)
- **Small UI (menu open, focus ring):** `200ms` (`opacity .2s`, `width .2s`)
- **Image / content reveal:** `500ms` (`opacity .5s ease`)
- **Hero / page fade:** `1600ms` (`opacity 1.6s ease-out`) — distinctive long fade on first paint.

### Patterns to replicate

1. **Long hero fade.** On page load, hero image and headline fade up over `1.6s` with `ease-out`. Don't rush this — it sets the entire premium tone.
2. **Image hover crop-zoom.** Project cards scale image to `1.05` over `500ms` `--ease-out-soft` on hover; container stays clipped.
3. **Page transitions.** Use slide-horizontal between project pages, simple fade between top-level nav. (In Next.js: implement with `framer-motion` `AnimatePresence` or the View Transitions API — the site uses native `view-transition-name`.)
4. **Blur backdrop.** Some background photos are blurred `9–14px` while overlay text sits above in pure focus. Reuse this for hero overlays.
5. **No marquees, no parallax, no cursor effects, no scroll-snap, no Lenis-style smooth scrolling.** The site is *very* restrained — resist adding GSAP/ScrollTrigger gymnastics. If a fancier effect is proposed, default to **no**.

### Libraries detected on the source site

None of these need to be replicated — the site rides on Wix's Thunderbolt runtime. For the GIFT site, achieve the same feel with:

| Need | Recommended in this project |
|------|------------------------------|
| Page transitions | `framer-motion` `AnimatePresence` |
| Reveal on scroll | `framer-motion` `whileInView` (or CSS `@starting-style` for simple fades) |
| Image hover scale | Pure CSS `transition` |
| Long hero fade | CSS `@keyframes` + `animation-fill-mode: forwards` |

---

## 6. Imagery

- **Treatment:** straight color photography. No filters, no duotone, no b&w. Saturation is naturally high because the subjects (inflatable installations) already are.
- **Aspect ratios:** prefer `3:2` landscape and `1:1` square for grids. `16:9` only for video.
- **Subject:** spaces and objects more often than people. When people appear, they're inside the installation as scale reference, not portraits.
- **Background imagery:** sometimes blurred (9–14px) and used behind type as a colored canvas.
- **For the recruitment site:** swap "inflatable installations" for **office shots, team in-action, product/screen mockups**. Same treatment — natural color, generous crop, no overlays except where text needs contrast.

---

## 7. Component patterns

### Hero

```
[ Full-bleed cloud-blue panel, 90vh ]
  [ Top nav, transparent over the panel ]
  [ Center: Anton 60px headline, max 8 words, 2 lines ]
  [ Below: Open Sans 18px subline, max 25 words ]
  [ Bottom-left: small Open Sans 12px tracking-wide eyebrow ]
```

Animation: panel fades in 1.6s, headline slides up 12px with the same fade.

### Section header

```
[ Tiny tracking-wide eyebrow — Open Sans 12px ]
[ Anton 40–51px headline, left-aligned ]
[ Optional Open Sans 16px supporting paragraph below ]
```

### Project / role card

```
[ Full-bleed image, 3:2 or square, hover scale 1.05 ]
[ Anton 23–37px title under the image ]
[ Open Sans 13px meta line (location, type, year) ]
```

Card has no border, no shadow. Just image + type. The grid does the visual work.

### Navigation

- Sticky top bar with logo left, links right.
- Links in Open Sans 13px, mixed case, gap-8 between items.
- Active state: underline only (no color change).
- Mobile: full-screen overlay menu with Anton 40px link list, one per line.

### Buttons

- Primary: solid deep-teal `#226D7A` background, white text, Open Sans 13px tracking-wider uppercase, `px-8 py-4` rounded-none. Hover lifts opacity to 90% over 100ms.
- Secondary: 1px outline of current text color, transparent bg.
- **Never use rounded corners over `4px`.** This is a sharp, editorial site.

### Footer

- Cloud-blue or off-white panel.
- 3 columns on desktop, stacked on mobile: contact / nav / social.
- Anton 23px section labels, Open Sans 13px links.

---

## 8. Tailwind config snippet

Paste into `tailwind.config.ts` `theme.extend`:

```ts
extend: {
  colors: {
    nube: {
      cloud:  "#B0E0E9",  // signature pale bg
      ink:    "#226D7A",  // primary text on cloud
      paper:  "#FFFFFF",
      black:  "#000000",
      offwhite:"#EFEFEF",
      "grey-light":"#ABABAB",
      "grey-mid":  "#3E3E3E",
      "grey-soft": "#5F6360",
    },
    accent: {
      yellow:    "#FFCB05",
      red:       "#ED1C24",
      turquoise: "#12B7B3",
      cyan:      "#00B4FF",
      blue:      "#0088CB",
    },
  },
  fontFamily: {
    display: ["var(--font-anton)", "Impact", "sans-serif"],
    sans:    ["var(--font-open-sans)", "system-ui", "sans-serif"],
  },
  fontSize: {
    "display-xs": ["23px", { lineHeight: "1.4" }],
    "display-sm": ["37px", { lineHeight: "1.4" }],
    "display-md": ["40px", { lineHeight: "1.4" }],
    "display-lg": ["51px", { lineHeight: "1.4" }],
    "display-xl": ["60px", { lineHeight: "1.4" }],
    "body-2xs":   ["10px", { lineHeight: "1.4" }],
    "body-xs":    ["12px", { lineHeight: "1.4" }],
    "body-sm":    ["13px", { lineHeight: "1.4" }],
    "body":       ["16px", { lineHeight: "1.4" }],
    "body-lg":    ["18px", { lineHeight: "1.4" }],
  },
  transitionTimingFunction: {
    "ease-out-soft":    "cubic-bezier(.22, 1, .36, 1)",
    "ease-inout-strong":"cubic-bezier(.87, 0, .13, 1)",
    "ease-inout-sine":  "cubic-bezier(.37, 0, .63, 1)",
    "ease-in-heavy":    "cubic-bezier(.64, 0, .78, 0)",
    "ease-out-quick":   "cubic-bezier(0, 0, .2, 1)",
  },
  transitionDuration: {
    "100":  "100ms",
    "200":  "200ms",
    "500":  "500ms",
    "1600": "1600ms",
  },
  maxWidth: {
    fit: "1240px",
  },
},
```

---

## 9. `globals.css` snippet

```css
@layer base {
  :root {
    --nube-cloud: 176 224 233;
    --nube-ink:   34 109 122;

    --ease-out-soft: cubic-bezier(.22, 1, .36, 1);
  }

  html { font-family: var(--font-open-sans), system-ui, sans-serif; }
  h1, h2, h3, h4 { font-family: var(--font-anton), Impact, sans-serif; line-height: 1.4; }
  body { color: #000; background: #fff; }
}

@keyframes hero-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.hero-enter { animation: hero-fade-up 1600ms var(--ease-out-soft) both; }
```

---

## 10. Applying this to the GIFT recruitment site

The recruitment site is a different beast than an architecture portfolio — but the **visual mechanism** transfers cleanly:

| Espacio La Nube has… | The GIFT recruitment site swaps in… |
|------------------------|-------------------------------------|
| Hero with project name | Hero with "Join GIFT" headline + tagline |
| Nube I–VII project gallery | Open roles grid (card per role) |
| "About" studio story | "About GIFT" — mission, history, what we do |
| Client logos wall | "Where our people work" or partner / industry logos |
| Team page (Wix team grid) | Team page with same grid pattern |
| Contact form | Application form / "Apply" CTA |

### Concrete rebuild checklist

1. **Add Anton + Open Sans via `next/font/google`** in `src/app/layout.tsx`.
2. **Extend `tailwind.config.ts`** with the snippet in §8.
3. **Update `src/app/globals.css`** with the base + keyframes from §9.
4. **Rebuild the recruitment landing hero**:
   - Cloud-blue panel `bg-nube-cloud`, 90vh.
   - Anton 60px headline `text-nube-ink font-display text-display-xl`.
   - Open Sans 18px subheadline `text-nube-ink/80 font-sans text-body-lg`.
   - Eyebrow Open Sans 12px tracking-wide uppercase `text-nube-ink/60`.
   - Apply `.hero-enter` for the 1.6s long-fade.
5. **Role cards (replaces project cards)**: full-bleed image (3:2), Anton title under, Open Sans meta line. No shadow, no border, no rounded corners >`2px`.
6. **Section transitions**: framer-motion `whileInView` with `transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}`.
7. **Don't add cursor effects, marquees, parallax, or smooth-scrolling libraries.** The source site is restrained; the recruitment site should match.

### Two-strike memory

- DX-hero shapes and DX-hero warp tunnel are both already on the "rejected directions" list — applying this Espacio La Nube style is a **different aesthetic** (editorial-architectural, not WebGL) so it doesn't conflict, but if a third variation gets rejected here, stop and rebrief per `CLAUDE.md` rules.
- Espacio La Nube has zero 3D / WebGL / Three.js work. Don't reach for it when implementing this style — type and photography only.

---

## 11. What this style is NOT

So future iterations don't drift:

- **Not maximalist.** Two colors, two fonts, generous whitespace.
- **Not animated.** Fades only. No bouncy spring physics, no scroll-jacking.
- **Not techy.** No mono fonts, no gradients (well, maybe one soft pastel gradient as a section background), no terminal aesthetics.
- **Not corporate.** No stock photos, no shadowed cards, no "feature blocks with icons."
- **Not flat-design.** Photography carries the depth. UI elements are flat by contrast.

If a proposed change pulls toward any of the above — push back.

---

## 12. Quick visual sanity check

Before saying "this matches the Espacio La Nube style", confirm the page satisfies all of:

- [ ] Only Anton and Open Sans on screen.
- [ ] Cloud-blue + deep-teal appears at least once above the fold.
- [ ] At least one full-bleed photograph.
- [ ] No rounded corners larger than `4px`.
- [ ] No element animates faster than 200ms except buttons.
- [ ] Hero takes at least 80vh and uses the long fade-in.
- [ ] No more than 2 accent colors visible in a single viewport.
- [ ] No 3D / WebGL / parallax / cursor effect.

If all 8 boxes are checked, you're on the style.
