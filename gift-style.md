# GIFT Inc. Style Guide

> Extracted from [gift-inc.org](https://gift-inc.org/) on 2026-04-13

---

## Brand Identity

- **Company:** 株式会社GIFT (GIFT Inc.)
- **Tagline:** "Gift an opportunity"
- **Visual Feel:** Corporate, professional, modern minimalist
- **Language:** Japanese-English bilingual

---

## Colors

### Primary Palette

| Role             | Color     | Hex       | Usage                              |
| ---------------- | --------- | --------- | ---------------------------------- |
| Primary          | Mid Green | `#357b49` | Buttons, accents, CTAs             |
| Dark             | Charcoal  | `#32373c` | Button backgrounds, dark text      |
| Text             | Black     | `#000000` | Body text, headings                |
| Background       | White     | `#ffffff` | Page background, card backgrounds  |
| Background Alt   | Light Grey| `#f6f7f7` | Section backgrounds, subtle fills  |
| Text on Dark     | White     | `#ffffff` | Text on dark/green backgrounds     |

### Accent / Secondary Colors (WordPress Block Palette)

| Name                  | Hex       |
| --------------------- | --------- |
| Vivid Cyan Blue       | `#0693e3` |
| Vivid Purple          | `#9b51e0` |
| Vivid Red             | `#cf2e2e` |
| Luminous Vivid Orange | `#ff6900` |
| Light Green Cyan      | `#7bdcb5` |
| Vivid Green Cyan      | `#00d084` |

### Gradients

| Name     | Value                                                            |
| -------- | ---------------------------------------------------------------- |
| Midnight | `linear-gradient(135deg, rgb(2,3,129) 0%, rgb(40,116,252) 100%)` |

---

## Typography

### Font Stack

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen-Sans', 'Ubuntu', 'Cantarell', 'Helvetica Neue', sans-serif;
```

### Font Sizes

| Token    | Size   | Usage                  |
| -------- | ------ | ---------------------- |
| Small    | `13px` | Captions, fine print   |
| Normal   | `16px` | Body text              |
| Medium   | `20px` | Subheadings, lead text |
| Large    | `36px` | Section headings       |
| X-Large  | `42px` | Hero headings          |

### Font Weights

| Weight | Value | Usage                    |
| ------ | ----- | ------------------------ |
| Regular| `400` | Body text                |
| Medium | `500` | Links, buttons, nav      |
| Bold   | `600` | Strong text, emphasis    |

---

## Spacing Scale

| Token | Value      | Rem     |
| ----- | ---------- | ------- |
| 20    | `0.44rem`  | ~7px   |
| 30    | `0.67rem`  | ~11px  |
| 40    | `1rem`     | 16px   |
| 50    | `1.5rem`   | 24px   |
| 60    | `2.25rem`  | 36px   |
| 70    | `3.38rem`  | 54px   |
| 80    | `5.06rem`  | 81px   |

---

## Buttons

### Primary Button

```css
background-color: #32373c;
color: #ffffff;
border-radius: 9999px;        /* fully rounded / pill shape */
font-size: 1.125em;
font-weight: 500;
padding: calc(0.667em + 2px) calc(1.333em + 2px);
text-decoration: none;
```

### Accent Button (Green CTA)

```css
background-color: #357b49;
color: #ffffff;
border-radius: 8px;
padding: 12px;
font-weight: 500;
transition: all 0.2s ease;
```

**Hover state:**
```css
filter: brightness(110%);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06),
            0 0 2px rgba(0, 0, 0, 0.16);
```

---

## Shadows

| Name     | Value                                                                      |
| -------- | -------------------------------------------------------------------------- |
| Natural  | `6px 6px 9px rgba(0, 0, 0, 0.2)`                                          |
| Deep     | `12px 12px 50px rgba(0, 0, 0, 0.4)`                                       |
| Sharp    | `6px 6px 0px rgba(0, 0, 0, 0.2)`                                          |
| Outlined | `6px 6px 0px -3px #fff, 6px 6px #000`                                     |
| Crisp    | `6px 6px 0px #000`                                                         |

---

## Layout

- **Navigation:** Horizontal on desktop, hamburger toggle on mobile
- **Nav items:** HOME, About, Lステップ, etc.
- **Default gap:** `0.5em`
- **Column gap:** `2em`
- **Container:** Responsive with max-width constraints
- **Images:** `max-width: 100%; height: auto;`

---

## Animations

| Effect        | Detail                                    |
| ------------- | ----------------------------------------- |
| ScrollReveal  | Origin: bottom, duration: 1000ms, distance: 50px |
| Smooth Scroll | `scroll-behavior: smooth`                |
| Carousel      | CSS `transform: translateX()`             |
| Hover Trans.  | `transition: all 0.2s ease`              |

---

## Page Sections

1. **Hero** — Mission statement with "Gift an opportunity" tagline
2. **Works** — Four business divisions (Telemarketing, LINE Operations, RPA, Real Estate)
3. **About** — Company overview
4. **Contact** — Contact form
5. **Footer** — Copyright, company name, contact info, policy links

---

## CSS Custom Properties Reference

```css
--akismet-color-mid-green: #357b49;
--akismet-color-white: #fff;
--akismet-color-light-grey: #f6f7f7;
--wp-block-synced-color: #7a00df;
--wp-admin-theme-color: #007cba;
```

---

## Notes

- The current site is WordPress-based — many of the accent colors come from WordPress block defaults and may not all be actively used in the brand design.
- The primary brand colors to carry forward are likely: **green (#357b49)**, **charcoal (#32373c)**, **white**, and **light grey (#f6f7f7)**.
- Typography uses system fonts — consider choosing a custom font pair for the Next.js rebuild to strengthen brand identity.
