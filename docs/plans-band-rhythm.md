# /plans — alternate dark and light bands

**Branch: `features/plans-page` ONLY.** Nothing under `src/app/(lp)/`.

Status: design spec, ready to execute. Written 2026-08-18 by Opus.
Amends `docs/plans-dark-restyle.md` §1–§8. Everything that document says about
**fonts, weights, layout, responsive behaviour, the nav/chrome/sitemap edits (§11) and
the constraints (§12)** still stands. Only section backgrounds and the text colours
that sit on them change.

---

## 0. Why

User instruction, 2026-08-18: *"too dark give me some white areas as well please."*

The previous pass made all six sections dark. That was an over-correction — the
homepage itself alternates: `WhoWeAre` is dark navy, `HPAbout` is a light band,
`HPCases` is white. Alternating bands **is** the house rhythm, and a page with six
sections of unbroken navy is heavier than anything else on the site.

The blue accent family is kept on both tones, so the page still reads as one thing.

---

## 1. Band assignment

| # | section | tone | background |
|---|---|---|---|
| 1 | `PlansHero` | **dark** | `bg-[linear-gradient(180deg,#0b1020_0%,#111827_100%)]` |
| 2 | `KhFeatures` | **light** | `bg-white` |
| 3 | `KhPricing` | **dark** | `bg-[#0b1020]` |
| 4 | `KhGlossary` | **light** | `bg-[#F0F7FF]` |
| 5 | `KhSupport` | **light** | `bg-white` |
| 6 | `KhCta` | **dark** | `bg-[linear-gradient(180deg,#1a2440_0%,#0b1020_100%)]` |

Reasoning, so nobody "tidies" this later:

- **Hero stays dark** — it is the reference the user supplied, and it is what the
  header chrome (`PLANS_THEME`, `#0b1020`) is themed to sit on.
- **Features goes white** — six cards of multi-line Japanese body copy is the single
  heaviest reading load on the page, and it is far easier on white.
- **Pricing stays dark** — the money block has been the page's anchor since the first
  design, and one reverse block is what makes it read as an inserted 見積書.
- **Glossary on `#F0F7FF`** — the site's own body background (`layout.tsx` sets it on
  `<html>`, and `HOME_THEME`/`COMPANY_THEME` both use it). A pale blue, not the warm
  `#F8F6F2` of `HPAbout`, because this page's accent family is blue and beige fights it.
- **Support white**, adjacent to the `#F0F7FF` glossary — two light bands in a row at
  different tones is exactly what the homepage does with `HPAbout` → `HPCases`.
- **CTA descends `#1a2440 → #0b1020`** so it lands on the footer's own colour. The
  footer wears `PLANS_THEME.bg` = `#0b1020`, so ending anywhere else leaves a seam.

## 2. Tone palettes

Dark tone — unchanged, from `WhoWeAre.tsx`:

| role | value |
|---|---|
| kicker | `text-[#60a5fa]` |
| heading | `text-white` |
| rule | `bg-[#3b82f6]` |
| body | `text-white/80`, cards `text-white/75` |
| hairline / card border | `border-white/15` |
| card fill | `bg-white/[0.03]` |

Light tone — the site's blue light palette (`ai.*` in `tailwind.config.ts`, and the
`HOME_THEME` nav tokens):

| role | value |
|---|---|
| kicker | `text-[#2563EB]` |
| heading | `text-[#0C0E1A]` |
| rule | `bg-[#2563EB]` |
| body | `text-[#5B6B8A]` |
| hairline / card border | `border-[#BFDBFE]` |
| card fill | `bg-[#F7FAFF]` on a white band |

The kicker blue differs by tone on purpose: `#60a5fa` is too pale to read on white,
`#2563EB` too dark to read on `#0b1020`. Do not unify them.

---

## 3. `KhSectionHead.tsx` — add a `tone` prop

One component, two tones, selected by a lookup rather than ternaries scattered through
the JSX.

```tsx
// The homepage's section heading, matching src/components/sections/WhoWeAre.tsx:
// a small blue uppercase Latin kicker, an extrabold Japanese headline, a short blue
// rule, then optional light body copy. Centred.
//
// `tone` picks the palette for the band this heading sits on. The kicker blue is
// deliberately different per tone — #60a5fa is unreadable on white and #2563EB is
// unreadable on #0b1020 — so do not "unify" them.
//
// Prop names are historical: `word` is the Latin kicker and `chip` is the Japanese
// headline. They were a Forum display word and a dark chip in an earlier pass; the
// names were kept so call sites did not churn.

const TONES = {
  dark: {
    kicker: 'text-[#60a5fa]',
    title: 'text-white',
    rule: 'bg-[#3b82f6]',
    lead: 'text-white/80',
  },
  light: {
    kicker: 'text-[#2563EB]',
    title: 'text-[#0C0E1A]',
    rule: 'bg-[#2563EB]',
    lead: 'text-[#5B6B8A]',
  },
} as const;

export default function KhSectionHead({
  word,
  chip,
  lead,
  tone = 'dark',
}: {
  word: string;
  chip: string;
  lead?: string;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];

  return (
    <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <p className={`mb-4 font-display text-small font-bold uppercase tracking-widest ${t.kicker}`}>
        {word}
      </p>

      <h2
        className={`font-sans font-extrabold leading-tight ${t.title}`}
        style={{ fontSize: 'clamp(28px, 4vw, 42px)', textWrap: 'balance' }}
      >
        {chip}
      </h2>

      <div className={`mt-8 h-0.5 w-12 ${t.rule}`} />

      {lead ? (
        <p
          className={`mt-8 w-full font-sans font-light ${t.lead}`}
          style={{ fontSize: 'clamp(17px, 1.9vw, 21px)', lineHeight: 2, textWrap: 'pretty' }}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
```

---

## 4. `KhFeatures.tsx` — to the light tone

Section background, the lead block's colours, and the card colours change. Structure,
spacing, grid breakpoints and font sizes are all unchanged.

```tsx
import KhSectionHead from './KhSectionHead';
import { FEATURES } from './khContent';

export default function KhFeatures() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Features" chip={FEATURES.title} tone="light" />

        {/* The source line is 「導入後の変化：AIが全社の記憶を持って動く。」 — split at the
            ： so the statement carries display weight instead of reading as a
            caption. This is the page's thesis sentence. */}
        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center text-center">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#2563EB]">
            {FEATURES.leadLabel}
          </p>
          <p
            className="mt-3 font-sans font-extrabold leading-snug text-[#0C0E1A]"
            style={{ fontSize: 'clamp(20px, 2.8vw, 30px)', textWrap: 'balance' }}
          >
            {FEATURES.leadStatement}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-2 min-[1000px]:grid-cols-3 md:gap-6">
          {FEATURES.items.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col border border-[#BFDBFE] bg-[#F7FAFF] p-6 md:p-8"
            >
              <span className="font-sans text-[14px] font-bold tracking-wide text-[#2563EB]">
                {item.kicker}
              </span>

              <h3 className="mt-4 font-sans text-[20px] font-bold leading-snug text-[#0C0E1A]">
                {item.title}
              </h3>

              {/* textWrap:pretty, not balance — balance is for short lines and makes
                  a 4-line JP paragraph ragged. `pretty` only prevents the orphan. */}
              <p
                className="mt-4 font-sans text-[17px] font-light text-[#5B6B8A]"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## 5. `KhGlossary.tsx` — to the light tone

```tsx
import { GLOSSARY } from './khContent';

export default function KhGlossary() {
  return (
    <section className="relative bg-[#F0F7FF] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-[#BFDBFE] bg-white p-6 md:p-10">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#2563EB]">
            Glossary
          </p>
          <h2 className="mt-4 font-sans text-[clamp(21px,2.4vw,25px)] font-extrabold leading-snug text-[#0C0E1A]">
            {GLOSSARY.title}
          </h2>
          <p
            className="mt-5 font-sans text-[17px] font-light text-[#5B6B8A]"
            style={{ lineHeight: 1.95, textWrap: 'pretty' }}
          >
            {GLOSSARY.body}
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 6. `KhSupport.tsx` — to the light tone

```tsx
import KhSectionHead from './KhSectionHead';
import { SUPPORT } from './khContent';

export default function KhSupport() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Support" chip={SUPPORT.title} lead={SUPPORT.lead} tone="light" />

        <dl className="mx-auto mt-14 max-w-4xl">
          {SUPPORT.items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 border-t border-[#BFDBFE] py-6 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
            >
              <dt
                className="font-sans text-[19px] font-bold leading-snug text-[#0C0E1A] min-[760px]:w-[42%] min-[760px]:shrink-0"
                style={{ textWrap: 'balance' }}
              >
                {item.title}
              </dt>
              <dd
                className="font-sans text-[17px] font-light text-[#5B6B8A]"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

---

## 7. `KhPricing.tsx` — one line

Stays dark. Only the section background changes, from `bg-[#0d1322]` to `bg-[#0b1020]`
so it matches the hero's darkest navy and the two dark bands agree with each other:

```tsx
<section className="relative bg-[#0b1020] py-20 md:py-28 lg:py-32">
```

Everything else in that file — the panel, the rows, the 補助金 block, the `Yen`
component, the `min-[560px]` stacking — is unchanged. `KhSectionHead` there keeps the
default `tone="dark"`, so its call site does not change either.

---

## 8. `KhCta.tsx` — one line

Stays dark. Only the gradient direction changes, so it descends into the footer's
colour instead of away from it (the footer wears `PLANS_THEME.bg` = `#0b1020`):

```tsx
<section className="relative bg-[linear-gradient(180deg,#1a2440_0%,#0b1020_100%)] py-20 md:py-28 lg:py-32">
```

Everything else in that file is unchanged.

---

## 9. `PlansHero.tsx` and `page.tsx` — unchanged

Do not touch either. The hero is already the dark gradient this spec wants, and
`<main className="bg-[#0b1020]">` is still correct as the base behind the bands — it
is only ever visible in the iOS overscroll area, which sits above the dark hero.

---

## 10. Constraints

Unchanged from `docs/plans-dark-restyle.md` §12, restated because they matter:

1. Branch `features/plans-page` only. Nothing under `src/app/(lp)/`.
2. **Do not run `npm run build`** — it corrupts `.next` under the user's dev server.
   Verify with **`npx tsc --noEmit`** only.
3. **Do not start a dev server, do not open a port.** The user owns 3000.
4. **Do not edit `khContent.ts`.** Not one character.
5. No animation, no `'use client'`, no `useEffect`, no `gsap` on this page.
6. No `rounded-*`, no `shadow-*`.
7. Do not touch `PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx`.
8. Do not touch `navTheme.ts`, `Header.tsx`, `Footer.tsx` or `sitemap.ts` — the §11
   work in the previous spec is already applied and correct.
9. No git write commands.

## 11. Verification

- `npx tsc --noEmit` clean.
- `node scripts/check-encoding.mjs` clean.
- `npx next lint` — no new warnings.
- `git diff --stat` / `git status --short` must show changes to exactly five files:
  `KhSectionHead.tsx`, `KhFeatures.tsx`, `KhGlossary.tsx`, `KhSupport.tsx`,
  `KhPricing.tsx`, `KhCta.tsx` — six. **`PlansHero.tsx` and `page.tsx` must NOT
  appear**, nor any shared file.
- Grep the six files for `#111B21` and `#F8F6F2` — zero hits; this page's light tone
  is `#0C0E1A` / `#5B6B8A` / `#F0F7FF`, not the homepage's warm/neutral pair.
