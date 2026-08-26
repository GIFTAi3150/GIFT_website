# /plans — dark restyle to match the homepage, responsive pass, and nav entry

**Branch: `features/plans-page` ONLY.** Nothing under `src/app/(lp)/`.

Status: design spec, ready to execute. Written 2026-08-18 by Opus.
Third and final styling pass. Supersedes the styling in
`docs/plans-knowledge-harness-restyle.md`; the **content** spec
(`docs/plans-knowledge-harness.md`) is still authoritative and unchanged.

Three tasks in one:
1. Restyle `/plans` to the dark navy world the user pointed at (§1–§9).
2. Make it genuinely responsive (§10 — folded into the component code).
3. Put `/plans` in the nav under SERVICE, with matching chrome (§11).

---

## 0. Why

The user supplied a screenshot of the homepage's `WhoWeAre` section as the reference
and said `/plans` *"doesn't look nothing similar to our main hp"* and *"the colors feel
weird."* They are right, and there are two separate causes:

**Cause 1 — the page is light, the reference is dark.** The previous pass matched
`HPAbout`/`HPCases`, which are the homepage's *light* bands. The section the user
actually pointed at is `src/components/sections/WhoWeAre.tsx`: dark navy gradient,
white text, a small blue uppercase kicker, a short blue rule.

**Cause 2 — the nav chrome is still pink.** `src/lib/navTheme.ts:268` maps `/plans`
to `DX_CONSULTING_THEME` — `bg #f5f7ff`, `accent #FF4D6D`, `ink #0b1340`. That is the
palette of the *original* `/plans` build. So even after the body was restyled to
black-and-white, the header sitting above it kept rendering pink accents on lavender.
That mismatch is a large part of "the colors feel weird" and no amount of body
restyling would have fixed it.

## The reference — exact values

From `src/components/sections/WhoWeAre.tsx`. **These are the source of truth. Do not
approximate them from the screenshot.**

| role | value |
|---|---|
| section background | `linear-gradient(180deg, #0b1020 0%, #111827 50%, #1a2440 100%)` |
| kicker ("THE SHIFT") | `font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]` |
| headline | `font-sans font-extrabold leading-tight text-white`, `clamp(28px, 4vw, 42px)` |
| rule under headline | `h-0.5 w-12 bg-[#3b82f6]` |
| body | `font-sans font-light text-white`, `clamp(18px, 2vw, 22px)`, `line-height: 2` |
| layout | `max-w-container` outer, `max-w-3xl` inner, centred |

Derived tokens for the parts `WhoWeAre` does not have (cards, tables, buttons). These
come from `CONTACT_THEME` in `navTheme.ts`, which is the site's existing dark-navy
chrome and already uses `#0b1020` + `#2563EB`:

| role | value |
|---|---|
| hairline / card border | `rgba(255,255,255,0.14)` → `border-white/15` |
| card fill | `rgba(255,255,255,0.03)` → `bg-white/[0.03]` |
| body text, secondary | `text-white/75` |
| body text, faint (notes) | `text-white/50` |
| accent — rules, emphasis | `#3b82f6` |
| accent — kickers, figures | `#60a5fa` |
| CTA fill / hover | `#2563EB` / `#1D4ED8` |

**Fonts do not change and are already global** (`src/app/layout.tsx`): `font-sans` =
Noto Sans JP for all Japanese, `font-display` = Poppins for uppercase Latin kickers
and for numerals. Do not add any font loading to this page.

**Japanese weight discipline, from the reference:** headings are `font-extrabold`,
body is `font-light`. Not `font-bold` + `font-normal`. This is what makes the
reference read the way it does — follow it.

---

## 1. Page shell — `page.tsx`

Sections get their own dark bands so a long page still has rhythm, and the sequence
descends `#0b1020 → #111827 → #1a2440` across the whole page, ending on the light end
of the reference gradient exactly where the CTA sits.

Only the `<main>` and the section backgrounds change here; imports and metadata stay.

```tsx
export default function PlansPage() {
  return (
    <>
      {/* Dark base behind every section. Each section paints its own band on top;
          this only guarantees no light seam shows through between them, and covers
          the overscroll area on iOS. */}
      <main className="bg-[#0b1020]">
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

Band assignment (applied in each component below):

| section | background |
|---|---|
| `PlansHero` | `bg-[linear-gradient(180deg,#0b1020_0%,#111827_100%)]` |
| `KhFeatures` | `bg-[#111827]` |
| `KhPricing` | `bg-[#0d1322]` |
| `KhGlossary` | `bg-[#111827]` |
| `KhSupport` | `bg-[#0d1322]` |
| `KhCta` | `bg-[linear-gradient(180deg,#111827_0%,#1a2440_100%)]` |

**Section padding is `py-20 md:py-28 lg:py-32` everywhere.** The old `py-24 md:py-32`
is too tall on a phone.

---

## 2. `KhSectionHead.tsx` — REWRITE

The reference's heading block: centred, blue uppercase kicker, white extrabold
Japanese headline, short blue rule, light body lead.

`word` is the Latin kicker (was a giant Forum display word — that belonged to the
light `HPCases` pattern and is dropped). `chip` is now the Japanese headline, no
longer a chip. **Keep the prop names `word` and `chip`** so the call sites in
`KhFeatures` / `KhPricing` / `KhSupport` do not have to change.

```tsx
// The homepage's dark-section heading, matching src/components/sections/WhoWeAre.tsx:
// a small blue uppercase Latin kicker, a white extrabold Japanese headline, a short
// blue rule, then optional light body copy. Centred.
//
// Prop names are historical: `word` is the Latin kicker and `chip` is the Japanese
// headline. They were a Forum display word and a dark chip in the previous
// (light) pass; the names were kept so call sites did not churn.

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
    <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
        {word}
      </p>

      <h2
        className="font-sans font-extrabold leading-tight text-white"
        style={{ fontSize: 'clamp(28px, 4vw, 42px)', textWrap: 'balance' }}
      >
        {chip}
      </h2>

      <div className="mt-8 h-0.5 w-12 bg-[#3b82f6]" />

      {lead ? (
        <p
          className="mt-8 w-full font-sans font-light text-white/80"
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

## 3. `PlansHero.tsx` — REWRITE

Same block, one size up, plus the body paragraph and the 補助金 note.

```tsx
import { HERO } from './khContent';

export default function PlansHero() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#0b1020_0%,#111827_100%)] py-24 md:py-32 lg:py-36">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#60a5fa]">
            {HERO.nameEn}
          </p>

          <p className="mb-6 font-sans text-[15px] font-light tracking-[0.08em] text-white/60">
            {HERO.nameJa}
          </p>

          {/* The page's h1 is the product's tagline, not its name — the name is the
              kicker above. Brackets stay white: the accent blue is reserved for the
              kicker, the rule and the CTA, and colouring them too would spend it
              three times in one screen. */}
          <h1
            className="font-sans font-extrabold leading-tight text-white"
            style={{ fontSize: 'clamp(30px, 4.6vw, 50px)', textWrap: 'balance' }}
          >
            {HERO.headline.line1}
            「{HERO.headline.bracketed}」{HERO.headline.tail}
          </h1>

          <div className="mt-8 h-0.5 w-12 bg-[#3b82f6]" />

          <p
            className="mt-8 w-full font-sans font-light text-white"
            style={{ fontSize: 'clamp(18px, 2vw, 22px)', lineHeight: 2, textWrap: 'pretty' }}
          >
            {HERO.body}
          </p>

          {/* 補助金 note. Deliberately quiet: the copy says the product is designed ON
              THE ASSUMPTION of being an eligible tool (対象ツールとなることを前提に), which
              is not the same as being confirmed eligible. A footnote, never a badge. */}
          <p
            className="mt-10 w-full border-t border-white/15 pt-6 font-sans text-[14px] font-light leading-[1.9] text-white/50"
            style={{ textWrap: 'pretty' }}
          >
            {HERO.note}
          </p>
        </div>
      </div>
    </section>
  );
}
```

---

## 4. `KhFeatures.tsx` — REWRITE

Cards become faint translucent panels with hairline borders — on a dark ground a
solid-bordered white card would punch a hole in the page. The kicker loses its black
chip and becomes blue text, matching the reference's blue-kicker treatment.

```tsx
import KhSectionHead from './KhSectionHead';
import { FEATURES } from './khContent';

export default function KhFeatures() {
  return (
    <section className="relative bg-[#111827] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Features" chip={FEATURES.title} />

        {/* The source line is 「導入後の変化：AIが全社の記憶を持って動く。」 — split at the
            ： so the statement carries display weight instead of reading as a
            caption. This is the page's thesis sentence. */}
        <div className="mx-auto mt-14 flex max-w-3xl flex-col items-center text-center">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#60a5fa]">
            {FEATURES.leadLabel}
          </p>
          <p
            className="mt-3 font-sans font-extrabold leading-snug text-white"
            style={{ fontSize: 'clamp(20px, 2.8vw, 30px)', textWrap: 'balance' }}
          >
            {FEATURES.leadStatement}
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-2 min-[1000px]:grid-cols-3 md:gap-6">
          {FEATURES.items.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col border border-white/15 bg-white/[0.03] p-6 md:p-8"
            >
              <span className="font-sans text-[14px] font-bold tracking-wide text-[#60a5fa]">
                {item.kicker}
              </span>

              <h3 className="mt-4 font-sans text-[20px] font-bold leading-snug text-white">
                {item.title}
              </h3>

              {/* textWrap:pretty, not balance — balance is for short lines and makes
                  a 4-line JP paragraph ragged. `pretty` only prevents the orphan. */}
              <p
                className="mt-4 font-sans text-[17px] font-light text-white/75"
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

## 5. `KhPricing.tsx` — REWRITE

The quotation panel, now on dark. The 補助金 sub-panel is where the accent blue earns
its keep — it is the one thing on the page that should stop a reader.

**Responsive rule for the line-item rows:** below 560px the item name and its amount
stack, because 「Claude Team Standard 5名分（24ヶ月分）」 plus a figure will not sit on
one 375px line without either wrapping badly or pushing the page into horizontal
scroll. Above 560px they sit on one row with the amount right-aligned.

```tsx
import KhSectionHead from './KhSectionHead';
import { PRICING } from './khContent';

/** Amount + 万円 unit. `tabular-nums` so every row's digits sit in the same column
 *  however many digits each figure has. The unit is sized in `em` so it scales with
 *  whatever figure size the caller passes — do not replace it with a px value. */
function Yen({ figure, className }: { figure: string; className?: string }) {
  return (
    <span className="whitespace-nowrap">
      <span className={`font-display font-bold tabular-nums ${className ?? ''}`}>{figure}</span>
      <span className="ml-1 font-sans text-[0.42em] font-light">万円</span>
    </span>
  );
}

export default function KhPricing() {
  return (
    <section className="relative bg-[#0d1322] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Pricing" chip={PRICING.title} lead={PRICING.lead} />

        <div className="mx-auto mt-14 max-w-4xl border border-white/15 bg-white/[0.03] p-6 text-white md:p-10 lg:p-12">
          {/* Headline price. 月額9万円 is what the manager leads with, so it leads
              here — but the 合計 row below gets comparable weight so the page never
              reads as if 9万円/月 were the whole cost. */}
          <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
            <div className="flex items-baseline gap-4">
              <span className="font-sans text-[17px] font-light text-white/70">
                {PRICING.monthlyLabel}
              </span>
              <Yen figure={PRICING.monthlyFigure} className="text-[clamp(42px,7vw,64px)] leading-none" />
            </div>
            <span className="font-sans text-[15px] font-light text-white/70">
              {PRICING.termNote}
            </span>
          </div>

          <dl className="mt-10 md:mt-12">
            {PRICING.rows.map((row) => (
              <div
                key={row.item}
                className="flex flex-col gap-2 border-t border-white/15 py-5 min-[560px]:flex-row min-[560px]:items-start min-[560px]:justify-between min-[560px]:gap-6"
              >
                <dt className="min-w-0">
                  <span className="block font-sans text-[17px] font-light leading-normal">
                    {row.item}
                  </span>
                  {row.detail ? (
                    <span className="mt-1.5 block font-sans text-[15px] font-light leading-relaxed text-white/60">
                      {row.detail}
                    </span>
                  ) : null}
                </dt>
                <dd className="shrink-0 min-[560px]:text-right">
                  <Yen figure={row.amount} className="text-[24px] leading-none" />
                </dd>
              </div>
            ))}

            {/* Total. The blue rule and the larger figure mark this as the number a
                buyer actually compares against the 補助金 ceiling. */}
            <div className="flex flex-col gap-2 border-t-2 border-[#3b82f6] pt-6 min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between min-[560px]:gap-6">
              <dt className="font-sans text-[19px] font-bold">{PRICING.totalLabel}</dt>
              <dd className="shrink-0">
                <Yen figure={PRICING.totalAmount} className="text-[clamp(30px,4.5vw,40px)] leading-none" />
              </dd>
            </div>
          </dl>

          {/* 補助金 panel. No strikethrough on 299万円 anywhere: a struck-through price
              reads as a limited-time sale, and this is a public grant that may or may
              not be awarded.
              The condition 「補助金の交付を受けた場合」 is this panel's first line and sits
              directly above the figure. Never separate them, never demote the
              condition to a footnote. */}
          <div className="mt-10 border border-[#3b82f6]/45 bg-[#3b82f6]/10 p-6 md:mt-12 md:p-8">
            <p className="font-sans text-[17px] font-bold text-white">
              {PRICING.subsidy.condition}
            </p>

            <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-3">
              <span className="font-sans text-[17px] font-light text-white/70">
                {PRICING.subsidy.label}
              </span>
              <Yen
                figure={PRICING.subsidy.figure}
                className="text-[clamp(36px,6vw,54px)] leading-none text-[#60a5fa]"
              />
              <span className="bg-[#3b82f6] px-2 py-0.5 font-sans text-[14px] font-bold tracking-tight text-white">
                {PRICING.subsidy.aside}
              </span>
            </div>

            <p
              className="mt-5 font-sans text-[16px] font-light text-white/70"
              style={{ lineHeight: 1.9, textWrap: 'pretty' }}
            >
              {PRICING.subsidy.body}
            </p>
          </div>

          <p className="mt-8 font-sans text-[15px] font-light text-white/50">{PRICING.taxNote}</p>
        </div>
      </div>
    </section>
  );
}
```

---

## 6. `KhGlossary.tsx` — REWRITE

```tsx
import { GLOSSARY } from './khContent';

export default function KhGlossary() {
  return (
    <section className="relative bg-[#111827] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-white/15 bg-white/[0.03] p-6 md:p-10">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#60a5fa]">
            Glossary
          </p>
          <h2 className="mt-4 font-sans text-[clamp(21px,2.4vw,25px)] font-extrabold leading-snug text-white">
            {GLOSSARY.title}
          </h2>
          <p
            className="mt-5 font-sans text-[17px] font-light text-white/75"
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

## 7. `KhSupport.tsx` — REWRITE

```tsx
import KhSectionHead from './KhSectionHead';
import { SUPPORT } from './khContent';

export default function KhSupport() {
  return (
    <section className="relative bg-[#0d1322] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Support" chip={SUPPORT.title} lead={SUPPORT.lead} />

        <dl className="mx-auto mt-14 max-w-4xl">
          {SUPPORT.items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 border-t border-white/15 py-6 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
            >
              <dt
                className="font-sans text-[19px] font-bold leading-snug text-white min-[760px]:w-[42%] min-[760px]:shrink-0"
                style={{ textWrap: 'balance' }}
              >
                {item.title}
              </dt>
              <dd
                className="font-sans text-[17px] font-light text-white/75"
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

## 8. `KhCta.tsx` — REWRITE

Solid blue button on dark. `w-full` below 480px so it is a comfortable tap target on
a phone, intrinsic width above.

`next/link`, never a bare `<a>` — a bare internal anchor is a full document reload,
which re-raises the SSR `#page-cover` in `layout.tsx` (a solid panel at z-9999 that
only lifts on `window.load` + 100ms). `/contact` is dark navy, so on a throttled
phone that reads as a blank page.

```tsx
import Link from 'next/link';
import { CTA } from './khContent';

export default function KhCta() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#111827_0%,#1a2440_100%)] py-20 md:py-28 lg:py-32">
      <div className="mx-auto flex max-w-container flex-col items-center px-4 md:px-6 lg:px-8">
        <p
          className="text-center font-sans text-[18px] font-light text-white/80"
          style={{ textWrap: 'balance' }}
        >
          {CTA.lead}
        </p>

        <Link
          href={CTA.href}
          className="group mt-8 inline-flex w-full max-w-[420px] items-center justify-between gap-6 bg-[#2563EB] px-7 py-4 text-white transition-colors duration-300 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] min-[480px]:w-auto"
        >
          <span className="font-sans text-[17px] font-bold tracking-tight">{CTA.label}</span>
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

## 9. Still true

- **No animation, no `'use client'`, no `useEffect`, no `gsap`.** Every component on
  this page stays a server component. The only CSS transitions are the CTA's
  `hover:bg-*` and its arrow nudge.
- **`khContent.ts` must not be edited. Not one character.**
- Nothing `rounded-*`. Sharp corners throughout, as on the rest of the site.
- `PlanCard.tsx` / `PlanCardFace.tsx` / `PlanCardStack.tsx` stay untouched on disk.

---

## 10. Responsive checklist

Built into the code above; verify each one at 375px, 768px and 1440px:

1. Section padding `py-20 md:py-28 lg:py-32`, horizontal `px-4 md:px-6 lg:px-8`.
2. Feature grid 1 → 2 (`min-[680px]`) → 3 (`min-[1000px]`); card padding `p-6 md:p-8`.
3. Pricing line-item rows stack below `min-[560px]`, side-by-side above.
4. Pricing panel padding `p-6 md:p-10 lg:p-12`.
5. Support rows stack below `min-[760px]`.
6. CTA button full-width below `min-[480px]`.
7. Every display figure and headline uses `clamp()` — nothing has a fixed large px.
8. **No horizontal scroll at 320px.** The likely offenders are the `whitespace-nowrap`
   inside `Yen` (fine — the longest is `149.5万円`) and long unbroken JP strings. If
   anything overflows, fix it in the layout; do not add `overflow-x: hidden` to hide it.

---

## 11. Nav, chrome and sitemap

### 11.1 `src/lib/navTheme.ts` — add `PLANS_THEME`

`/plans` is currently mapped to `DX_CONSULTING_THEME` (line ~268) — light lavender
with a pink accent, left over from the original build. That is why the header looks
wrong above the page. Replace the mapping with a dark theme.

Add this constant next to `CONTACT_THEME` (which it deliberately mirrors — same dark
navy `#0b1020`, same `#2563EB` accent — because both pages now live in the same dark
world):

```ts
// /plans (Knowledge Harness) — dark navy matching the page's own bands and the
// homepage's WhoWeAre section. Mirrors CONTACT_THEME: both are #0b1020 + #2563EB.
// Was DX_CONSULTING_THEME (light lavender + pink) until 2026-08-18, left over from
// the original /plans build — the chrome kept rendering pink over a dark page.
const PLANS_THEME: NavTheme = {
  bg: '#0b1020',
  bgAlpha: 'rgba(11, 16, 32, 0.92)',
  bgFull: '#0b1020',
  accent: '#2563EB',
  accentDeep: '#1D4ED8',
  border: 'rgba(255, 255, 255, 0.12)',
  bgAlt: '#131c3c',
  ink: '#FFFFFF',
  muted: 'rgba(255, 255, 255, 0.60)',
  logoShield: '#2563EB',
  logoInner: '#0b1020',
  text: 'rgba(255, 255, 255, 0.87)',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textFaint: 'rgba(255, 255, 255, 0.35)',
};
```

Then change the `THEME_MAP` entry:

```ts
[/^\/plans(\/|$)/, PLANS_THEME],
```

Leave every other entry alone, and leave `DX_CONSULTING_THEME` in place — it is still
used by `/services/aiops`.

### 11.2 `src/components/layout/Header.tsx` — add the nav item

`serviceItems` (line ~15) is a single-entry array that the desktop dropdown and the
mobile accordion both map over, so adding an entry is all that is required:

```ts
const serviceItems = [
  { href: '/services/aiops', label: 'AIOps事業', labelEn: 'AIOps' },
  { href: '/plans', label: '料金プラン', labelEn: 'Plans' },
];
```

After the edit, **check the mobile accordion actually maps `serviceItems` too** — read
the mobile SERVICE block (around line ~264–300). If it hard-codes the AIOps link
instead of mapping, add the second link there in the same style. Report which it was.

### 11.3 `src/components/layout/Footer.tsx` — add the footer link

```ts
const footerServices = [
  { href: '/services/aiops', label: 'AIOps事業' },
  { href: '/plans', label: '料金プラン' },
];
```

### 11.4 `src/app/sitemap.ts` — add the route

`/plans` was deliberately absent while it was an unlisted URL. It is now linked from
the global nav, so it will be crawled regardless and excluding it only produces an
inconsistency. Add to `STATIC_ROUTES`, after the `/services/*` entries:

```ts
{ path: '/plans', priority: 0.8, changeFrequency: 'monthly' },
```

---

## 12. Constraints

1. Branch `features/plans-page` only. Nothing under `src/app/(lp)/`.
2. **Do not run `npm run build`** — it corrupts `.next` under the user's dev server.
   Verify with **`npx tsc --noEmit`** only.
3. **Do not start a dev server, do not open a port.** The user owns 3000.
4. **Do not edit `khContent.ts`.**
5. No animation, no `'use client'` on `/plans`, no `gsap`.
6. No `rounded-*`, no `shadow-*`.
7. No git write commands.
8. In `navTheme.ts`, `Header.tsx` and `Footer.tsx` — these are shared, site-wide
   files. Change ONLY what §11 specifies. Do not reformat, reorder or "tidy"
   anything else in them.

## 13. Verification

- `npx tsc --noEmit` — clean.
- `node scripts/check-encoding.mjs` — no mojibake.
- `npx next lint` — no new warnings.
- Grep `src/app/plans/` for `#111B21`, `#F8F6F2`, `font-forum`, `rounded`, `shadow-`
  — hits expected ONLY in the three retired `PlanCard*.tsx` files.
- Grep `src/lib/navTheme.ts` for `DX_CONSULTING_THEME` — it must still be defined and
  still mapped to `/services/aiops`, but no longer mapped to `/plans`.
- Confirm `git diff` touches only: the 7 `/plans` component files, `page.tsx`,
  `navTheme.ts`, `Header.tsx`, `Footer.tsx`, `sitemap.ts`.
