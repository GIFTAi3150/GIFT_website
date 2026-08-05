# LP what-we-do — black field → light mist field

**Status:** approved 2026-08-05 (user: "i dont like the bg color is all black,
make it on the brighter side").
**Scope:** `src/app/(lp)/lp.css`, `src/app/(lp)/lp/_components/LpSteps.tsx`.
Cards, motion, geometry and copy are all untouched.

---

## 1. What changes

`.lp-what-sec` is currently `.lp-section .lp-dark` — `background: #050505`,
`color: #ffffff`. It becomes a **light cool-grey field** with the page's normal
ink, so the LP reads:

| # | section | field |
|---|---------|-------|
| 1 | hero    | black, the film |
| 2 | flow    | `--lp-paper` #ffffff |
| 3 | **what we do** | **`--lp-mist` #e0e6f0** ← this change |
| 4 | cta     | `--lp-line` #06c755 |

The dark moment of the page becomes the film alone, and 2 → 3 → 4 is a
continuous bright build into the green CTA.

## 2. Why mist and not white

Card 01 is `--lp-paper` **pure white**. Put the section on white and card 01 —
the card the whole sequence opens on, alone on the field before 02 and 03 fan
in — has 1.09:1 against its own background and effectively disappears.

`#e0e6f0` is the value that buys card 01 back without going dark:

| pair | contrast | verdict |
|------|----------|---------|
| card 01 `#ffffff` on field | **1.25:1** | a visible tonal step — paper on a desk |
| card 03 `#b6c4d6` on field | 1.42:1 | reads |
| h2 ink `#111111` on field | 15.1:1 | ✅ |
| lead `#555555` on field | 5.9:1 | ✅ |

The hue is `--lp-blue`'s own (≈221°) desaturated to 25% and lifted to 90% L, so
the field, the blue card and the blue eyebrow are one family rather than a
neutral grey with a blue object dropped on it.

⚠️ Do **not** lighten this toward white to "brighten it more". Every step
toward #ffffff is a step of card 01 disappearing. If more brightness is wanted,
the lever is the CARDS, not the field.

⚠️ Do **not** change the card trio (paper → blue → steel). Those three colours
have their own rejection history in the CSS comment above `.lp-wcard-1`
(pastels rejected 2026-08-04, LINE-green card rejected 2026-08-04). This change
is deliberately the field only.

## 3. Why the eyebrow gets its own blue

`WHAT WE DO` is `.lp-eyebrow` — 11px, weight 900, `--lp-blue` #165dff. That
blue clears 4.5:1 on white (5.19:1) and on #050505 (4.93:1), but on the mist
field it lands at **4.14:1** — under AA for text this small.

There is no light field that fixes this: the value needed for #165dff to clear
4.5:1 is lighter than white. So the eyebrow takes a deeper blue **scoped to
this section only** — `--lp-blue-ink` #0f47cc, 5.99:1 on the field. Same hue,
indistinguishable as an accent at 11px, legal as text.

The flow section's eyebrow keeps `--lp-blue` on white. Do not promote
`--lp-blue-ink` into `.lp-eyebrow` globally — it is a contrast fix for one
surface, not a new brand blue.

## 4. Edits

### 4a. `lp.css` — `:root`, after `--lp-blue`

```css
  --lp-blue: #165dff;
  /* Section field for what-we-do. --lp-blue's own hue (221deg) at 25% S / 90% L
     — light enough to read as a bright section, dark enough that card 01, which
     is pure white and appears ALONE before the other two fan in, still reads as
     a card on it (1.25:1). Derivation: docs/aiops-lp-what-section-light-field.md.
     Do not push this toward #ffffff; that erases card 01. */
  --lp-mist: #e0e6f0;
  /* --lp-blue deepened for text ON --lp-mist. #165dff is 4.14:1 there, under AA
     for the 11px eyebrow, and no light field can fix that — see §3 of the doc
     above. Scoped to .lp-what-sec; this is NOT a second brand blue. */
  --lp-blue-ink: #0f47cc;
```

### 4b. `lp.css` — top of the `.lp-what-sec` block (currently line ~748)

Insert `background` / `color` as the first two declarations, before
`--wcard-w`, keeping everything already in the block:

```css
.lp-what-sec {
  /* Light field, NOT .lp-dark — changed 2026-08-05 at the user's request; the
     black this replaces is in git. Same specificity as `.lp-section` (one
     class) and later in the file, so it wins without an `!important` or a
     doubled selector. Why this exact grey, and why the card colours did NOT
     move with it: docs/aiops-lp-what-section-light-field.md. */
  background: var(--lp-mist);
  color: var(--lp-ink);

  --wcard-w: 338px;
  /* ...rest of the existing block unchanged... */
}
```

### 4c. `lp.css` — new rule, immediately after the `.lp-what-sec` block

```css
/* Contrast fix, not a restyle: #165dff is 4.14:1 on --lp-mist and this text is
   11px/900. See §3 of docs/aiops-lp-what-section-light-field.md. */
.lp-what-sec .lp-eyebrow {
  color: var(--lp-blue-ink);
}
```

### 4d. `LpSteps.tsx` — drop `lp-dark`

```diff
-    <section className="lp-section lp-dark lp-what-sec" aria-label="サービス内容">
+    <section className="lp-section lp-what-sec" aria-label="サービス内容">
```

`.lp-dark .lp-lead` (rgba white .68) stops applying and the base `.lp-lead`
`--lp-paper-muted` #555555 takes over automatically — that is the intended
result, no extra rule needed.

### 4e. Leave alone

`.lp-section.lp-dark` and `.lp-dark .lp-lead` in lp.css stay where they are.
Nothing uses `.lp-dark` after this change, but they are a generic modifier, not
this section's private code. Do not delete them.

## 5. Not in scope

- No card colour changes.
- No `box-shadow` and no border on `.lp-wcard`. If the manager later says card
  01 is too faint on the field, the escape hatch is a single hairline
  `inset 0 0 0 1px rgba(13, 22, 32, 0.10)` — not a shadow, which is the
  templated-SaaS look this site rejects. Do not ship it preemptively.
- No change to LpMotion, the burst, the fan geometry or the mobile strip. None
  of them reference the field colour.

## 6. Verify

- `npx tsc --noEmit` clean. **Do not run `npm run build`** — the user's dev
  server is up and a concurrent build corrupts its chunks.
- Grep confirms `lp-dark` no longer appears in `src/app/(lp)/lp/`.
- The section renders light with black heading ink, grey lead, and the three
  cards unchanged in colour.
