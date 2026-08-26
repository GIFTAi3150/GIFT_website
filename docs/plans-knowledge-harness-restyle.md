# /plans — restyle to the site's house style

**Branch: `features/plans-page` ONLY.** Nothing under `src/app/(lp)/`.

Status: design spec, ready to execute. Written 2026-08-18 by Opus.
Follows `docs/plans-knowledge-harness.md`, which built the page. **The content, the
section order and the file layout from that spec are unchanged and correct.** This
document replaces only the *styling* — fonts, colour, and component chrome.

---

## 0. Why

The page was built on the visual vocabulary the old `/plans` carousel introduced:
CDN-loaded Gen Interface JP + JetBrains Mono, navy `#0b1340`, pink `#FF4D6D`, rounded
gradient cards, pill buttons. None of that is what the rest of the site uses, so
`/plans` reads as a page from a different website.

User instruction, 2026-08-18: *"the writing on the page should [be the] same as the
rest of the main page — the fonts we used, the colors etc."*

### The actual house style

Read from `tailwind.config.ts`, `src/app/layout.tsx`, and the live homepage sections
`src/components/sections/HPAbout.tsx` and `HPCases.tsx`. These are the reference —
if anything in this spec is ambiguous, open `HPCases.tsx` and copy what it does.

| role | house value | Tailwind |
|---|---|---|
| Japanese text — everything | Noto Sans JP, loaded globally in `layout.tsx` | `font-sans` |
| Latin display headings | Forum (serif) | `font-forum` |
| Latin numerals / labels | Poppins | `font-display` |
| Ink — the ONLY text colour | `#111B21` | `text-[#111B21]` |
| Reverse surface | `#111B21` with white text | `bg-[#111B21] text-white` |
| Page bands | `#FFFFFF` and `#F8F6F2`, alternating | `bg-white` / `bg-[#F8F6F2]` |
| Card | 1px `#111B21` border, white fill, **sharp corners** | `border border-[#111B21] bg-white` |
| Emphasis | a solid dark chip with white text — never a colour | `bg-[#111B21] px-3 py-1.5 text-white` |
| Container | 72rem | `mx-auto max-w-container px-4 md:px-6 lg:px-8` |
| Section rhythm | `py-24 md:py-32` |

**There is no accent colour on this site.** Emphasis is carried by inversion (dark
chip / white chip), by size, and by hairlines. The pink is deleted, not replaced.

**Nothing is rounded and nothing has a shadow.** `rounded-*`, `ring-*`, `shadow-*`
and gradients do not appear in the house sections and must not appear here.

### Section heading grammar

Every homepage section does the same thing: a hairline rule, then a giant English
word in Forum beside a small Japanese label in a solid dark chip.

```
────────────────────────────────────  ← h-px bg-[#111B21]
Pricing  [ 料金 ]
```

`/plans` adopts it exactly:

| section | English word | chip |
|---|---|---|
| hero | `Knowledge Harness` | ナレッジハーネス |
| できること | `Features` | できること |
| 料金 | `Pricing` | 料金 |
| Claude Team Standard とは | *(no giant word — it is an aside)* | 用語解説 |
| サポート・伴走 | `Support` | サポート・伴走 |

---

## 1. What does NOT change

- **Every Japanese string.** `khContent.ts` is correct and stays exactly as written.
  Do not retype it, do not reword it, do not reformat the strings.
- The section order, the file list, and the component split.
- Still **zero animation, zero `'use client'`, zero `gsap`** — every component on this
  page stays a server component. The only CSS transition allowed is the CTA button's
  hover invert, copied from `HPCases.tsx`.
- `src/data/plans.ts` and the `/contact` deep link.
- `docs/NOLLM-plans-page.md` stays accurate about *content*; only add a line noting
  the page now uses the global theme fonts and has no page-scoped font loading.

---

## 2. Files

```
src/app/plans/_components/khTokens.ts      DELETE
src/app/plans/_components/khContent.ts     UNCHANGED — do not touch
src/app/plans/_components/KhSectionHead.tsx  REWRITE
src/app/plans/_components/PlansHero.tsx      REWRITE
src/app/plans/_components/KhFeatures.tsx     REWRITE
src/app/plans/_components/KhPricing.tsx      REWRITE
src/app/plans/_components/KhGlossary.tsx     REWRITE
src/app/plans/_components/KhSupport.tsx      REWRITE
src/app/plans/_components/KhCta.tsx          REWRITE
src/app/plans/page.tsx                       EDIT — delete PlansFontsLink
```

**`khTokens.ts` is deleted.** Its whole purpose was to hold hex values and CDN font
stacks that no longer exist. The house style is expressed in Tailwind classes, not
inline style objects — that is also what keeps GSAP and React from fighting over
`style.cssText` elsewhere on this project. After the rewrite, no file under
`src/app/plans/` may import it.

Leave `PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx` alone — still retired,
still on disk, still unimported. They keep their own old colours; that is fine.

---

## 3. `page.tsx` — delete the page-scoped fonts

Remove the entire `PlansFontsLink` function and its `<PlansFontsLink />` call. The
three stylesheets it pulled (Gen Interface JP from jsDelivr, Inter italic, JetBrains
Mono) are no longer used by anything on this page, and Noto Sans JP / Forum / Poppins
are already loaded globally by `src/app/layout.tsx` via `next/font`.

This also clears the `no-page-custom-font` lint warning that `next lint` reported.

Keep `metadata` exactly as it is. Result:

```tsx
import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import PlansHero from './_components/PlansHero';
import KhFeatures from './_components/KhFeatures';
import KhPricing from './_components/KhPricing';
import KhGlossary from './_components/KhGlossary';
import KhSupport from './_components/KhSupport';
import KhCta from './_components/KhCta';

export const metadata: Metadata = {
  title: 'ナレッジハーネス｜料金プラン',
  description:
    '社内の知識を「全社の記憶基盤」に。ナレッジハーネスは社内に散らばる情報・ノウハウを構造化して蓄積し、Claude Codeから安全に引き出せる社内知識ツールです。月額9万円の単一プラン。',
  alternates: { canonical: '/plans' },
};

export default function PlansPage() {
  return (
    <>
      <main>
        <PlansHero />
        <KhFeatures />
        <KhPricing />
        <KhGlossary />
        <KhSupport />
        <KhCta />
      </main>
      <Footer />
    </>
  );
}
```

> Note the added `<main>` wrapper — `src/app/page.tsx` wraps its sections in one and
> `/plans` currently does not. One `<main>` per page is also the correct landmark for
> screen readers.

---

## 4. `KhSectionHead.tsx` — REWRITE

The house heading block, lifted from `HPCases.tsx` (the rule, the Forum word, the
chip) with the optional lead paragraph from `HPAbout.tsx`.

```tsx
// The house section heading, matching src/components/sections/HPCases.tsx:
// a full-width hairline, then a giant English word in Forum sitting on the same
// baseline as a small Japanese label in a solid dark chip.
//
// `word` is Latin and always set in font-forum; `chip` is Japanese and always
// font-sans. Do not swap them — Forum has no Japanese glyphs and would silently
// fall back to a system serif mid-heading.

export default function KhSectionHead({
  word,
  chip,
  lead,
}: {
  word: string;
  chip: string;
  lead?: string;
}) {
  return (
    <header>
      <div className="mb-10 h-px bg-[#111B21]" />

      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <h2 className="font-forum text-[clamp(52px,7.5vw,80px)] leading-none text-[#111B21]">
          {word}
        </h2>
        <span className="bg-[#111B21] px-3 py-1.5 font-sans text-[14px] font-bold leading-normal tracking-tight text-white">
          {chip}
        </span>
      </div>

      {lead ? (
        <p className="mt-8 max-w-[640px] font-sans text-[17px] leading-relaxed text-[#111B21]">
          {lead}
        </p>
      ) : null}
    </header>
  );
}
```

---

## 5. `PlansHero.tsx` — REWRITE

Same shape as a homepage section head, one size up, plus the tagline / body / note.
No `<h2>` here — the product name is the page's `<h1>`.

```tsx
import { HERO } from './khContent';

export default function PlansHero() {
  return (
    <section className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-10 h-px bg-[#111B21]" />

        {/* Product name as the page's h1, in the house display serif, with the
            Japanese name in the standard dark chip beside it. */}
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <h1 className="font-forum text-[clamp(44px,8vw,92px)] leading-none text-[#111B21]">
            {HERO.nameEn === 'KNOWLEDGE HARNESS' ? 'Knowledge Harness' : HERO.nameEn}
          </h1>
          <span className="bg-[#111B21] px-3 py-1.5 font-sans text-[14px] font-bold leading-normal tracking-tight text-white">
            {HERO.nameJa}
          </span>
        </div>

        {/* Tagline. Same treatment as HPAbout's lead line: font-sans bold, the
            clamp(22px,3.2vw,32px) step. Brackets stay ink — this site has no
            accent colour, so emphasis comes from weight and size only. */}
        <p
          className="mt-10 max-w-[720px] font-sans font-bold leading-snug text-[#111B21]"
          style={{ fontSize: 'clamp(22px, 3.2vw, 32px)', textWrap: 'balance' }}
        >
          {HERO.headline.line1}
          「{HERO.headline.bracketed}」{HERO.headline.tail}
        </p>

        <p className="mt-6 max-w-[640px] font-sans text-[17px] leading-relaxed text-[#111B21]">
          {HERO.body}
        </p>

        {/* 補助金 note. Quiet by design: the copy says the product is built ON THE
            ASSUMPTION of being an eligible tool (対象ツールとなることを前提に), which is
            not the same as being confirmed eligible. It must read as a footnote,
            never as a badge — hence a hairline and 60% ink, not a chip. */}
        <p className="mt-10 max-w-[640px] border-t border-[#111B21]/20 pt-5 font-sans text-[13px] leading-relaxed text-[#111B21]/60">
          {HERO.note}
        </p>
      </div>
    </section>
  );
}
```

> The `nameEn` ternary exists because `khContent.ts` stores the name upper-case for
> the old mono setting, and Forum at 92px in all-caps is shouty. **Do not edit
> `khContent.ts` to fix this** — the content file is frozen. If you prefer, hard-code
> the string `'Knowledge Harness'` and drop the ternary; either is acceptable, but
> `khContent.ts` must not change.

---

## 6. `KhFeatures.tsx` — REWRITE

House cards: 1px ink border, white fill, sharp corners, 32px padding. Three across on
desktop, two on tablet, one on phone. The kicker becomes a dark chip; the index is a
Forum numeral.

`items-stretch` + `h-full` so all six cards in a row end level regardless of body
length — with a hard border, a short card is immediately visible as ragged.

```tsx
import KhSectionHead from './KhSectionHead';
import { FEATURES } from './khContent';

export default function KhFeatures() {
  return (
    <section className="relative bg-[#F8F6F2] py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Features" chip={FEATURES.title} />

        {/* The source line is 「導入後の変化：AIが全社の記憶を持って動く。」 — split at the
            ： so the statement carries display weight instead of reading as a
            caption. This is the page's thesis sentence. */}
        <div className="mt-10">
          <span className="bg-[#111B21] px-2 py-0.5 font-sans text-[12px] font-bold tracking-tight text-white">
            {FEATURES.leadLabel}
          </span>
          <p
            className="mt-4 max-w-[720px] font-sans font-bold leading-snug text-[#111B21]"
            style={{ fontSize: 'clamp(20px, 2.8vw, 30px)', textWrap: 'balance' }}
          >
            {FEATURES.leadStatement}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-6 min-[680px]:grid-cols-2 min-[1000px]:grid-cols-3">
          {FEATURES.items.map((item, i) => (
            <article
              key={item.title}
              className="flex h-full flex-col border border-[#111B21] bg-white p-8"
            >
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[13px] font-bold tabular-nums tracking-widest text-[#111B21]/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="bg-[#111B21] px-2 py-0.5 font-sans text-[12px] font-bold tracking-tight text-white">
                  {item.kicker}
                </span>
              </div>

              <h3 className="mt-5 font-sans text-[18px] font-bold leading-snug text-[#111B21]">
                {item.title}
              </h3>

              {/* No textWrap:balance — balance is for short lines. On a 4-line JP
                  paragraph it produces a ragged, uneven measure. */}
              <p className="mt-4 font-sans text-[15px] leading-relaxed text-[#111B21]">
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

## 7. `KhPricing.tsx` — REWRITE

The one reverse block on the page. Solid `#111B21` — **not** the old graphite
gradient — sharp corners, white hairlines. It reads as a 見積書 dropped into the page.

Figures are `font-display` (Poppins) `tabular-nums`: numerals need to align in a
column and Poppins is this site's Latin/numeral face. The 万円 unit is `font-sans`
and smaller.

```tsx
import KhSectionHead from './KhSectionHead';
import { PRICING } from './khContent';

/** Amount + 万円 unit. `tabular-nums` so every row's digits sit in the same column
 *  however many digits each figure has. */
function Yen({ figure, className }: { figure: string; className?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-display font-bold tabular-nums ${className ?? ''}`}>{figure}</span>
      <span className="ml-1 font-sans text-[0.42em] font-normal">万円</span>
    </span>
  );
}

export default function KhPricing() {
  return (
    <section className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Pricing" chip={PRICING.title} lead={PRICING.lead} />

        <div className="mt-12 border border-[#111B21] bg-[#111B21] p-8 text-white md:p-12">
          {/* Headline price. 月額9万円 is what the manager leads with, so it leads
              here — but the 合計 row below gets comparable weight so the page never
              reads as if 9万円/月 were the whole cost. */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-[15px] text-white/70">{PRICING.monthlyLabel}</span>
              <Yen figure={PRICING.monthlyFigure} className="text-[clamp(44px,7vw,64px)] leading-none" />
            </div>
            <span className="font-sans text-[13px] text-white/70">{PRICING.termNote}</span>
          </div>

          <dl className="mt-12">
            {PRICING.rows.map((row) => (
              <div
                key={row.item}
                className="flex items-start justify-between gap-6 border-t border-white/20 py-5"
              >
                <dt className="min-w-0">
                  <span className="block font-sans text-[15px] leading-normal">{row.item}</span>
                  {row.detail ? (
                    <span className="mt-1.5 block font-sans text-[13px] leading-relaxed text-white/60">
                      {row.detail}
                    </span>
                  ) : null}
                </dt>
                <dd className="shrink-0">
                  <Yen figure={row.amount} className="text-[22px] leading-none" />
                </dd>
              </div>
            ))}

            {/* Total. Heavier rule + bigger figure — this is the number a buyer
                compares against the 補助金 ceiling. */}
            <div className="flex items-center justify-between gap-6 border-t-2 border-white pt-6">
              <dt className="font-sans text-[16px] font-bold">{PRICING.totalLabel}</dt>
              <dd className="shrink-0">
                <Yen figure={PRICING.totalAmount} className="text-[clamp(30px,4.5vw,40px)] leading-none" />
              </dd>
            </div>
          </dl>

          {/* 補助金 panel. Emphasis is inversion — a white chip on the dark block —
              NOT a colour, because this site has no accent colour.
              No strikethrough on 299万円 anywhere: a struck-through price reads as a
              limited-time sale, and this is a public grant that may or may not be
              awarded.
              The condition 「補助金の交付を受けた場合」 is this panel's first line and sits
              directly above the figure. Never separate them, never demote the
              condition to a footnote. */}
          <div className="mt-12 border border-white/40 p-6 md:p-8">
            <p className="font-sans text-[14px] font-bold">{PRICING.subsidy.condition}</p>

            <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3">
              <span className="font-sans text-[14px] text-white/70">{PRICING.subsidy.label}</span>
              <Yen figure={PRICING.subsidy.figure} className="text-[clamp(38px,6vw,54px)] leading-none" />
              <span className="bg-white px-2 py-0.5 font-sans text-[12px] font-bold tracking-tight text-[#111B21]">
                {PRICING.subsidy.aside}
              </span>
            </div>

            <p className="mt-5 max-w-[560px] font-sans text-[13px] leading-relaxed text-white/70">
              {PRICING.subsidy.body}
            </p>
          </div>

          <p className="mt-8 font-sans text-[12px] text-white/60">{PRICING.taxNote}</p>
        </div>
      </div>
    </section>
  );
}
```

> `Yen`'s unit uses `text-[0.42em]`, so it scales with whatever figure size the
> caller passes. Do not replace it with a fixed px size.

---

## 8. `KhGlossary.tsx` — REWRITE

An aside, so it gets a chip but no giant Forum word — a second 80px heading here
would compete with 料金 immediately above it for no reason.

```tsx
import { GLOSSARY } from './khContent';

export default function KhGlossary() {
  return (
    <section className="relative bg-[#F8F6F2] py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="border border-[#111B21] bg-white p-8 md:p-10">
          <span className="bg-[#111B21] px-2 py-0.5 font-sans text-[12px] font-bold tracking-tight text-white">
            用語解説
          </span>
          <h2 className="mt-5 font-sans text-[clamp(18px,2.2vw,22px)] font-bold leading-snug text-[#111B21]">
            {GLOSSARY.title}
          </h2>
          <p className="mt-4 max-w-[760px] font-sans text-[15px] leading-relaxed text-[#111B21]">
            {GLOSSARY.body}
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 9. `KhSupport.tsx` — REWRITE

Hairline-ruled rows: title left, detail right on desktop, stacked on phone.

```tsx
import KhSectionHead from './KhSectionHead';
import { SUPPORT } from './khContent';

export default function KhSupport() {
  return (
    <section className="relative bg-white py-24 md:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Support" chip={SUPPORT.title} lead={SUPPORT.lead} />

        <dl className="mt-12">
          {SUPPORT.items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 border-t border-[#111B21]/20 py-6 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
            >
              <dt
                className="font-sans text-[16px] font-bold leading-snug text-[#111B21] min-[760px]:w-[38%] min-[760px]:shrink-0"
                style={{ textWrap: 'balance' }}
              >
                {item.title}
              </dt>
              <dd className="font-sans text-[15px] leading-relaxed text-[#111B21]">
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

## 10. `KhCta.tsx` — REWRITE

The house button, copied from `HPCases.tsx`: a rectangle that inverts on hover, with
an arrow that nudges right. **No pill, no pink.**

`next/link`, never a bare `<a>` — a bare internal anchor is a full document reload,
which re-raises the SSR `#page-cover` in `layout.tsx` (a solid panel at z-9999 that
only lifts on `window.load` + 100ms). `/contact` is dark navy, so on a throttled
phone that reads as a blank page.

```tsx
import Link from 'next/link';
import { CTA } from './khContent';

export default function KhCta() {
  return (
    <section className="relative bg-[#F8F6F2] py-24 md:py-32">
      <div className="mx-auto flex max-w-container flex-col items-center px-4 md:px-6 lg:px-8">
        <p className="font-sans text-[15px] leading-relaxed text-[#111B21]" style={{ textWrap: 'balance' }}>
          {CTA.lead}
        </p>

        <Link
          href={CTA.href}
          className="group mt-8 inline-flex items-center justify-between gap-6 border border-[#111B21] bg-[#111B21] px-6 py-4 text-white transition-all duration-300 hover:bg-transparent hover:text-[#111B21]"
        >
          <span className="font-sans text-[15px] font-bold tracking-tight">{CTA.label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
```

---

## 11. Constraints

1. Branch `features/plans-page` only. Nothing under `src/app/(lp)/`.
2. **Do not run `npm run build`** — it corrupts `.next` under the user's dev server.
   Verify with **`npx tsc --noEmit`** only.
3. **Do not start a dev server, do not open a port.** The user owns 3000.
4. **Do not edit `khContent.ts`.** Not one character. If a string seems to need
   changing, stop and report instead.
5. No animation, no `'use client'`, no `useEffect`, no `gsap`.
6. No `rounded-*`, no `shadow-*`, no `ring-*`, no gradients, no colour other than
   `#111B21`, white, `#F8F6F2`, and opacity variants of `#111B21`/white.
7. Delete `khTokens.ts` and make sure nothing imports it.
8. Do not touch `PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx`.
9. No git write commands.

## 12. Verification

- `npx tsc --noEmit` clean.
- `node scripts/check-encoding.mjs` still reports no mojibake.
- `npx next lint` — the `no-page-custom-font` warning on `/plans` should now be GONE,
  because `PlansFontsLink` was deleted.
- Grep to confirm the old vocabulary is fully gone from `src/app/plans/page.tsx` and
  every `Kh*.tsx` / `PlansHero.tsx`:
  `FF4D6D`, `0b1340`, `f5f7ff`, `Gen Interface`, `JetBrains`, `khTokens`, `rounded`,
  `CARD_SURFACE`. Hits are expected ONLY in the three retired `PlanCard*.tsx` files.
