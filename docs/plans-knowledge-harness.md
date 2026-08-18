# /plans → Knowledge Harness 製品ページ 設計仕様

**Branch: `features/plans-page` ONLY.** Do not touch `features/aiops-lp` or anything
under `src/app/(lp)/`. The LP and `/plans` are separate pages and separate branches.

Status: design spec, ready to execute. Written 2026-08-18 by Opus.
Supersedes the 3-card placeholder grid built 2026-07-31 (`8232e19`).

---

## 0. What changes and why

`/plans` currently shows a 3-up static grid of **invented placeholder services**
(AIOps診断 / 業務自動化 / データ活用) with invented prices, none of which went
through 役員確認. The manager has now supplied the first **real, dated, priced
product**: Knowledge Harness (ナレッジハーネス), sold as a **single plan**.

So `/plans` stops being a service menu and becomes **one product page**. All three
placeholder cards are removed (user decision, 2026-08-18).

### Consequences the executor must not "fix"

- `PlanCard.tsx` stops being imported. **Do not delete it** — the retired-but-kept
  convention already applies to `PlanCardStack.tsx` / `PlanCardFace.tsx` on this page.
  Leave all three on disk, unimported. They cost nothing in the bundle.
- `/contact` reads `PLANS` from `src/data/plans.ts` to pre-fill its message box
  (`PLANS.find(p => p.slug === slug)`, using `.name`, `.label`, `.summary`).
  That contract **must keep working**. `PLANS` becomes a one-entry array; the
  `Plan` type keeps every field it has today.
- Old deep links (`/contact?plan=aiops-diagnosis` etc.) stop resolving. `/contact`
  already handles an unrecognised slug by leaving the field empty, so this
  degrades safely. `/plans` was never in the nav or the sitemap and the URL was
  only ever sent to the manager, so real-world exposure is ~zero.

---

## 1. Design direction

The page keeps the existing `/plans` visual vocabulary — it is **not** a new design
system:

| token | value | where it already exists |
|---|---|---|
| page ground | `#f5f7ff` | `PlansHero.tsx`, `page.tsx` |
| ink | `#0b1340` | `PlansHero.tsx` headline |
| accent (pink) | `#FF4D6D` | `PlanCard.tsx` marker + CTA pill |
| dark surface | `linear-gradient(158deg,#4B5058 0%,#33383F 44%,#232629 100%)` | `PlanCardFace.tsx` `CARD_SURFACE_CLASS` |
| mono | JetBrains Mono, 11px, `letter-spacing:.2em`, uppercase | `PlanCard.tsx` labels |
| JP | Gen Interface JP | all of `/plans` |
| hairline | `rgba(255,255,255,.13)` on dark | `PlanCard.tsx` spec rows |

**The one structural idea: a light page with exactly ONE dark block.**

Six features + a price table + a glossary + five support rows is a lot of content.
Rendering each group as its own card produces card soup — precisely the templated
SaaS look this project has rejected (see memory `feedback_design_no_generic_ai_look`).
So:

- Everything sits on the light `#f5f7ff` ground, separated by **hairline rules**,
  not by boxes.
- The **料金 block is the only dark surface on the page.** It is the page's centre
  of gravity and it reads as a 見積書 (quotation sheet), which is the honest
  metaphor for what it is.
- No checkmark bullets. No pill badges. No drop shadows. No rounded feature cards.

### Motion budget: NONE

**This page has no animation of any kind.** (User instruction, 2026-08-18: *"the page
dont need to have no fancy design or animation at all — something simple is what they
want."*) That means:

- The hero's GSAP staggered rise+fade intro is **deleted**, not retargeted. `gsap` is
  not imported anywhere on this page and `PlansHero.tsx` stops being a client
  component — the whole page becomes server-rendered static markup.
- The CTA's roll-mask hover from `PlanCard.tsx` is **not** carried over. The button
  gets a plain background-colour transition on hover, nothing else.
- No scroll reveals, no ScrollTrigger, no fades, no transforms.

This also happens to align with the manager's standing feedback on this exact page —
content must be visible on landing with zero interaction (memory
`project_plans_carousel_infinite_loop_required`).

Consequence worth noting: with no client component left, the whole `/plans` route
ships zero page-specific JS. Every hydration/GSAP failure mode this project has
collected simply cannot occur here.

### Alignment change

The hero moves from **centred to left-aligned**. Centred body copy plus a dated
legal note reads as a landing-page template; left-aligned with an eyebrow stack is
editorial and matches `/services/aiops`. This is a deliberate change, not a
regression.

### Headline change

`「変える方法は、ひとつじゃない。」` is **removed**. It means *"there is more than one
way to change"* — written when the page offered three services to choose between.
This page sells one product on one plan, so the old headline promises a choice the
page does not offer.

The replacement is the manager's own tagline: **社内の知識を「全社の記憶基盤」に**,
set on two lines with the 「」 brackets in the accent pink and the phrase inside them
in ink. No new copy is invented.

---

## 2. Files

```
src/app/plans/
  page.tsx                     REWRITE
  _components/
    khTokens.ts                NEW   design tokens, shared by the new components
    khContent.ts               NEW   all page copy, one place
    PlansHero.tsx              REWRITE — GSAP intro DELETED, becomes a server component
    KhSectionHead.tsx          NEW   shared eyebrow + title + lead header
    KhFeatures.tsx             NEW   できること
    KhPricing.tsx              NEW   料金 (the dark block)
    KhGlossary.tsx             NEW   Claude Team Standard とは
    KhSupport.tsx              NEW   サポート・伴走
    KhCta.tsx                  NEW   pink pill → /contact
    PlanCard.tsx               LEAVE ON DISK, now unimported
    PlanCardFace.tsx           LEAVE ON DISK (already unimported)
    PlanCardStack.tsx          LEAVE ON DISK (already unimported)
src/data/plans.ts              EDIT — PLANS becomes a single entry
docs/NOLLM-plans-page.md       REWRITE — see §9
```

**Every component on this page is a server component.** There is no `'use client'`
anywhere under `src/app/plans/` after this change, and `gsap` is not imported. If the
executor finds itself writing `'use client'`, `useEffect` or `useRef`, it has
misread the spec — stop and report.

---

## 3. `_components/khTokens.ts` — NEW

```ts
// Design tokens for the /plans Knowledge Harness page.
//
// These are the values already in use on this page (PlansHero.tsx's ink and
// ground, PlanCard.tsx's mono labels, hairlines, pink marker and the graphite
// card surface). They are lifted into one module because the page now has six
// components instead of two, and re-declaring the same hex in each one is how
// a palette drifts.
//
// The retired PlanCard*.tsx files keep their own private copies — do not
// refactor them to import from here. They are unimported dead weight kept for
// history, and touching them is churn with no upside.

/** Light page ground — the existing /plans lavender. */
export const PAGE_BG = '#f5f7ff';
/** Headline navy, from the old PlansHero. */
export const INK = '#0b1340';
/** Body copy on the light ground. */
export const INK_MUTED = 'rgba(11,19,64,0.62)';
/** Quieter still — captions, table sub-labels. */
export const INK_FAINT = 'rgba(11,19,64,0.45)';
/** Hairline rule on the light ground. */
export const RULE_LIGHT = 'rgba(11,19,64,0.14)';

/** The one accent on the page. Used sparingly: 5px markers, the headline
 *  brackets, the 実質負担 figure, and the CTA pill. Nothing else. */
export const ACCENT = '#FF4D6D';

/** The graphite surface, identical to PlanCardFace.tsx's CARD_SURFACE_CLASS.
 *  Used exactly once on this page — the 料金 block. */
export const CARD_SURFACE_CLASS =
  'bg-[linear-gradient(158deg,#4B5058_0%,#33383F_44%,#232629_100%)] ring-1 ring-inset ring-white/10';
export const DARK_INK = '#F4F5F7';
export const DARK_MUTED = '#A8AEB6';
export const RULE_DARK = 'rgba(255,255,255,0.13)';
/** Heavier rule above the 合計 row only. */
export const RULE_DARK_STRONG = 'rgba(255,255,255,0.32)';

export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const JP = '"Gen Interface JP", sans-serif';
```

---

## 4. `_components/khContent.ts` — NEW

All copy is the manager's, supplied 2026-08-18, describing the product as of
**2026年8月10日**. Do not reword it. Do not translate it. Do not "improve" it.

```ts
// Every string shown on /plans. Supplied by the manager 2026-08-18; the product
// content is dated 2026年8月10日 and the page prints that date, so if this copy
// is ever revised the date in HERO.note must move with it.
//
// ⚠️ PRICES ARE REAL, unlike the placeholder figures this page used to carry.
// Treat edits here as a commercial change, not a copy tweak.
//
// ⚠️ 税別 assumption: the manager's source copy does not state a tax basis. The
// previous /plans build printed 税別, so the page continues to say 税別 (see
// PRICING.taxNote). Flagged to the user 2026-08-18 — if 税込 is correct, this
// is the single string to change.

export const HERO = {
  /** Product name, set in mono — this is the page's eyebrow. */
  nameEn: 'KNOWLEDGE HARNESS',
  nameJa: 'ナレッジハーネス',
  /** Headline, two lines. Line 2's brackets are drawn in the accent colour by
   *  PlansHero.tsx, so the bracket characters are kept OUT of `bracketed`. */
  headline: {
    line1: '社内の知識を',
    bracketed: '全社の記憶基盤',
    tail: 'に',
  },
  body:
    '社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。',
  note:
    '国の「デジタル化・AI導入補助金2026」の対象ツールとなることを前提に設計しています。（2026年8月10日時点の内容）',
} as const;

export const FEATURES = {
  eyebrow: 'FEATURES',
  title: 'できること',
  /** Split on the ：from the source line 「導入後の変化：AIが全社の記憶を持って動く。」
   *  so the label can sit small above the statement instead of running into it. */
  leadLabel: '導入後の変化',
  leadStatement: 'AIが全社の記憶を持って動く。',
  items: [
    {
      kicker: 'はじめやすい',
      title: 'オンボーディング機能',
      body: 'ツール内の案内に沿って初期設定が完了。管理者が従業員登録・組織図・社内規程を設定し、従業員が自分の業務情報を入力するだけで立ち上がります。',
    },
    {
      kicker: '貯まる',
      title: '自動で構造化・整理',
      body: '集めた情報を自動で整理し「全社の記憶基盤」として蓄積。社内の知識が人に依存せず会社に残ります。',
    },
    {
      kicker: '見つかる',
      title: '横断検索＋定型通知',
      body: '部署をまたいだ横断検索と、Chatwork・LINEへの定型通知で「探す時間・聞き回る時間」を削減します。',
    },
    {
      kicker: '標準セット',
      title: 'Claude Code 標準セット',
      body: 'Anthropic社のAI「Claude」（Claude Code含む・Team Standard 5名分）の24ヶ月分利用料をプランに含めて提供。導入した日からAIと社内知識を組み合わせて使えます。',
    },
    {
      kicker: '広がる',
      title: 'Claude Code連携（MCP対応・標準機能）',
      body: '標準セットのClaude Codeから社内の知識へ安全に接続。「聞けば答える」体験を実現し、お客様側で自由に活用・カスタマイズできます。',
    },
    {
      kicker: '守れる',
      title: '企業レベルのセキュリティ',
      body: '権限管理・監査ログ・暗号化（AES-256）・稼働率SLA99.5%。AI利用ガイドラインを権限設定と監査ログで技術的に守らせます。',
    },
  ],
} as const;

export const PRICING = {
  eyebrow: 'PRICING',
  title: '料金',
  lead: '単一プラン。2年間のフルセットが補助金の枠に収まる設計です。',

  monthlyLabel: '月額',
  /** Figure only — the component draws the 万円 unit itself. */
  monthlyFigure: '9',
  termNote: '契約は1年（以降自動更新）',

  /** Line items. `detail` is optional and prints under the item name. */
  rows: [
    { item: '月額利用料（24ヶ月分）', detail: null, amount: '216' },
    { item: '初期導入費', detail: '導入研修・オンボーディング初期設定込み', amount: '38' },
    {
      item: 'Claude Team Standard 5名分（24ヶ月分）',
      detail: 'Claude Code含む・標準セット',
      amount: '45',
    },
  ] as { item: string; detail: string | null; amount: string }[],

  totalLabel: '2年間フルセット合計',
  totalAmount: '299',

  /** The 補助金 panel. The conditional 「補助金の交付を受けた場合」 is printed as the
   *  panel's own label, directly above the figure — it must never be separated
   *  from the number it qualifies. */
  subsidy: {
    condition: '補助金の交付を受けた場合',
    label: 'お客様の実質負担',
    figure: '149.5',
    aside: '実質半額',
    body: 'Claudeの利用料も、クラウド利用料として最大2年分が補助対象にできます。',
  },

  taxNote: '※表示価格はすべて税別です。',
} as const;

export const GLOSSARY = {
  eyebrow: 'GLOSSARY',
  title: 'Claude Team Standard とは',
  body:
    'AI開発企業Anthropic（アンソロピック）社の公式法人プランです。世界トップクラスの生成AI「Claude」との対話に加え、文書作成や業務の自動化までこなすAI作業ツール「Claude Code」が使えます。利用メンバーの管理機能などの法人向けセキュリティが付き、入力した内容がAIの学習に使われない設計です。1名につき1席で、本プランには5名分（24ヶ月）が含まれます。',
} as const;

export const SUPPORT = {
  eyebrow: 'SUPPORT',
  title: 'サポート・伴走',
  lead: '導入して終わりではなく、使われて成果が出るまで伴走します。',
  items: [
    { title: '専任担当がつきます', detail: '導入から定着・活用拡大まで同じ担当者が伴走' },
    { title: '有人チャットサポート 無制限', detail: '回数の制限なし。すべて有人対応' },
    { title: '電話サポート', detail: '平日営業時間内' },
    { title: '月次成果レポート', detail: '利用状況と成果を毎月ご報告' },
    {
      title: '補助金の申請〜導入後の効果報告まで支援',
      detail: '効果報告（年1回×3年）も専任担当がサポート',
    },
  ],
} as const;

export const CTA = {
  lead: '導入のご相談・お見積もりはこちらから。',
  label: 'ナレッジハーネスについて相談する',
  /** Slug must match the single entry in src/data/plans.ts. */
  href: '/contact?inquiry=dx&plan=knowledge-harness',
} as const;
```

---

## 5. Components

### 5.1 `PlansHero.tsx` — REWRITE

**Delete the entire GSAP block.** No `'use client'`, no `useEffect`, no `useRef`, no
`gsap` import, no `<noscript>` override, no `invisible` starting state. The reveal
machinery, the `document.fonts.ready` race, the 3s safety net and the
`prefers-reduced-motion` branch all existed only to serve the intro animation, and the
intro animation is gone. Plain server-rendered markup.

Because nothing starts hidden, there is also nothing that can fail to un-hide — the
whole class of "hero renders blank" bugs this project has hit is designed out rather
than defended against.

```tsx
import { ACCENT, INK, INK_FAINT, INK_MUTED, JP, MONO, RULE_LIGHT } from './khTokens';
import { HERO } from './khContent';

export default function PlansHero() {
  return (
    // No dvh/vh height: this is a compact band that shrinks to its content, not
    // a full-screen cover. (Full-screen covers on this project use dvh — that
    // rule does not apply here because nothing is being filled.)
    <section className="bg-[#f5f7ff] px-4 pb-16 pt-24 md:px-6 md:pb-20 md:pt-28 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
          {/* Eyebrow: the product's own name. Set in mono at display size —
              this is the only place mono runs large on the page. */}
          <div className="flex items-center gap-3">
            <span className="h-[6px] w-[6px] shrink-0" style={{ background: ACCENT }} />
            <span
              className="uppercase"
              style={{
                color: INK,
                fontFamily: MONO,
                fontSize: 'clamp(13px,1.5vw,17px)',
                fontWeight: 500,
                letterSpacing: '0.26em',
              }}
            >
              {HERO.nameEn}
            </span>
          </div>

          <p
            style={{
              color: INK_MUTED,
              fontFamily: JP,
              fontSize: '13px',
              letterSpacing: '0.08em',
              marginTop: '10px',
              marginLeft: '18px',
            }}
          >
            {HERO.nameJa}
          </p>

          {/* Headline. Two hard lines — no wrapping decision is left to the
              browser, because 「全社の記憶基盤」に must never break inside the
              brackets. Line 2's bracket glyphs are their own spans so they can
              carry the accent while the phrase stays ink; they sit with NO flex
              gap, since JP bracket glyphs already have their own side-bearing
              and an added gap opens a visible hole before 全社. */}
          <h1
            className="font-bold"
            style={{
              color: INK,
              fontFamily: JP,
              fontSize: 'clamp(32px,5.2vw,60px)',
              lineHeight: 1.22,
              marginTop: '26px',
            }}
          >
            <span className="block">
              {HERO.headline.line1}
            </span>
            <span className="block">
              <span style={{ color: ACCENT }}>「</span>
              {HERO.headline.bracketed}
              <span style={{ color: ACCENT }}>」</span>
              {HERO.headline.tail}
            </span>
          </h1>

          <p
            className="max-w-2xl"
            style={{
              color: INK_MUTED,
              fontFamily: JP,
              fontSize: 'clamp(14px,1.5vw,16px)',
              lineHeight: 2,
              marginTop: '28px',
            }}
          >
            {HERO.body}
          </p>

          {/* 補助金 note. Ruled rather than boxed, and deliberately quiet: the
              copy says the product is designed ON THE ASSUMPTION of being an
              eligible tool (対象ツールとなることを前提に), which is not the same as
              being confirmed eligible. It must read as a footnote, never as a
              badge. The date it carries is part of that hedge — keep it. */}
          <p
            className="max-w-2xl"
            style={{
              color: INK_FAINT,
              fontFamily: JP,
              fontSize: '12px',
              lineHeight: 1.9,
              marginTop: '26px',
              paddingTop: '16px',
              borderTop: `1px solid ${RULE_LIGHT}`,
            }}
          >
            {HERO.note}
          </p>
      </div>
    </section>
  );
}
```

> Indentation above is one level deeper than the JSX nesting needs (a wrapper div
> was removed). Run the project's formatter; do not restructure the markup.

### 5.2 `KhSectionHead.tsx` — NEW (shared)

Three sections share one header shape. Write it once.

```tsx
import { ACCENT, INK, INK_MUTED, JP, MONO } from './khTokens';

export default function KhSectionHead({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header>
      <div className="flex items-center gap-2">
        <span className="h-[5px] w-[5px] shrink-0" style={{ background: ACCENT }} />
        <span
          className="uppercase font-medium"
          style={{ color: INK_MUTED, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em' }}
        >
          {eyebrow}
        </span>
      </div>
      <h2
        className="font-bold"
        style={{
          color: INK,
          fontFamily: JP,
          fontSize: 'clamp(26px,3.2vw,38px)',
          lineHeight: 1.3,
          marginTop: '14px',
          textWrap: 'balance',
        }}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className="max-w-2xl"
          style={{
            color: INK_MUTED,
            fontFamily: JP,
            fontSize: 'clamp(14px,1.5vw,16px)',
            lineHeight: 2,
            marginTop: '16px',
          }}
        >
          {lead}
        </p>
      ) : null}
    </header>
  );
}
```

### 5.3 `KhFeatures.tsx` — NEW

Three columns at ≥1000px, two at ≥680px, one below. Each item is a **hairline-topped
column**, not a card: no fill, no border box, no shadow. The mono index makes the set
read as a table of contents rather than a feature-badge grid.

```tsx
import KhSectionHead from './KhSectionHead';
import { FEATURES } from './khContent';
import { ACCENT, INK, INK_MUTED, JP, MONO, RULE_LIGHT } from './khTokens';

export default function KhFeatures() {
  return (
    <section className="bg-[#f5f7ff] px-4 py-20 md:px-6 md:py-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <KhSectionHead eyebrow={FEATURES.eyebrow} title={FEATURES.title} />

        {/* The source line is 「導入後の変化：AIが全社の記憶を持って動く。」 — split at
            the ： so the statement gets display weight instead of being read as
            a caption. This is the page's thesis sentence. */}
        <div style={{ marginTop: '28px' }}>
          <p
            className="uppercase font-medium"
            style={{ color: INK_MUTED, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em' }}
          >
            {FEATURES.leadLabel}
          </p>
          <p
            className="font-bold"
            style={{
              color: INK,
              fontFamily: JP,
              fontSize: 'clamp(19px,2.3vw,28px)',
              lineHeight: 1.5,
              marginTop: '10px',
              textWrap: 'balance',
            }}
          >
            {FEATURES.leadStatement}
          </p>
        </div>

        <div
          className="grid grid-cols-1 gap-x-10 gap-y-0 min-[680px]:grid-cols-2 min-[1000px]:grid-cols-3"
          style={{ marginTop: '52px' }}
        >
          {FEATURES.items.map((item, i) => (
            <article
              key={item.title}
              style={{ borderTop: `1px solid ${RULE_LIGHT}`, paddingTop: '22px', paddingBottom: '34px' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="tabular-nums"
                  style={{ color: INK_MUTED, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.14em' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span
                  style={{ color: ACCENT, fontFamily: JP, fontSize: '12px', letterSpacing: '0.08em' }}
                >
                  {item.kicker}
                </span>
              </div>

              <h3
                className="font-bold"
                style={{
                  color: INK,
                  fontFamily: JP,
                  fontSize: '19px',
                  lineHeight: 1.45,
                  marginTop: '14px',
                  textWrap: 'balance',
                }}
              >
                {item.title}
              </h3>

              {/* No textWrap:balance here — balance is for short lines. On a
                  4-line JP paragraph it produces ragged, uneven measures. */}
              <p
                style={{
                  color: INK_MUTED,
                  fontFamily: JP,
                  fontSize: '13.5px',
                  lineHeight: 2,
                  marginTop: '12px',
                }}
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

### 5.4 `KhPricing.tsx` — NEW — the dark block

The only dark surface on the page. `max-w-4xl` (narrower than the `max-w-6xl`
feature grid) so it reads as an inserted document — a quotation sheet — rather than
another full-width band. Single column: no responsive two-column split to get wrong.

```tsx
import KhSectionHead from './KhSectionHead';
import { PRICING } from './khContent';
import {
  ACCENT,
  CARD_SURFACE_CLASS,
  DARK_INK,
  DARK_MUTED,
  JP,
  MONO,
  RULE_DARK,
  RULE_DARK_STRONG,
} from './khTokens';

/** Amount + 万円 unit. The figure is mono/tabular so every row's digits line up
 *  in the same column however many digits each has; 万円 is JP and smaller. */
function Yen({ figure, size, color }: { figure: string; size: number; color: string }) {
  return (
    <span className="flex items-baseline whitespace-nowrap">
      <span
        className="font-medium tabular-nums"
        style={{ color, fontFamily: MONO, fontSize: `${size}px`, lineHeight: 1 }}
      >
        {figure}
      </span>
      <span
        style={{ color: DARK_MUTED, fontFamily: JP, fontSize: `${Math.round(size * 0.38)}px`, marginLeft: '0.18em' }}
      >
        万円
      </span>
    </span>
  );
}

export default function KhPricing() {
  return (
    <section className="bg-[#f5f7ff] px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <KhSectionHead eyebrow={PRICING.eyebrow} title={PRICING.title} />
      </div>

      <div className="mx-auto w-full max-w-4xl" style={{ marginTop: '36px' }}>
        <div className={`${CARD_SURFACE_CLASS} rounded-xl p-7 md:p-10 lg:p-12`}>
          <p style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '14px', lineHeight: 1.9 }}>
            {PRICING.lead}
          </p>

          {/* Headline price. 月額9万円 is what the manager leads with, so it leads
              here too — but the 合計 row below is given comparable weight (34px)
              so the page never reads as if 9万円/月 were the whole cost. */}
          <div
            className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3"
            style={{ marginTop: '30px' }}
          >
            <div className="flex items-baseline gap-3">
              <span style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '15px' }}>
                {PRICING.monthlyLabel}
              </span>
              <Yen figure={PRICING.monthlyFigure} size={58} color={DARK_INK} />
            </div>
            <span style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '12px' }}>
              {PRICING.termNote}
            </span>
          </div>

          {/* Line items. Hairline-ruled rows — the same spec-sheet vocabulary the
              old PlanCard used, at document scale. */}
          <dl style={{ marginTop: '38px' }}>
            {PRICING.rows.map((row) => (
              <div
                key={row.item}
                className="flex items-start justify-between gap-6"
                style={{ borderTop: `1px solid ${RULE_DARK}`, padding: '18px 0' }}
              >
                <dt className="min-w-0">
                  <span
                    className="block"
                    style={{ color: DARK_INK, fontFamily: JP, fontSize: '14.5px', lineHeight: 1.6 }}
                  >
                    {row.item}
                  </span>
                  {row.detail ? (
                    <span
                      className="block"
                      style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '12px', lineHeight: 1.7, marginTop: '5px' }}
                    >
                      {row.detail}
                    </span>
                  ) : null}
                </dt>
                <dd className="shrink-0">
                  <Yen figure={row.amount} size={22} color={DARK_INK} />
                </dd>
              </div>
            ))}

            {/* Total. Heavier rule + bigger figure — this is the number a buyer
                actually compares against the 補助金 ceiling. */}
            <div
              className="flex items-center justify-between gap-6"
              style={{ borderTop: `1px solid ${RULE_DARK_STRONG}`, paddingTop: '22px' }}
            >
              <dt
                className="font-bold"
                style={{ color: DARK_INK, fontFamily: JP, fontSize: '16px' }}
              >
                {PRICING.totalLabel}
              </dt>
              <dd className="shrink-0">
                <Yen figure={PRICING.totalAmount} size={34} color={DARK_INK} />
              </dd>
            </div>
          </dl>

          {/* 補助金 panel. Tinted + ringed in the accent, NOT a discount badge —
              no strikethrough on 299万円 anywhere, because a struck-through price
              reads as a limited-time sale and this is a public subsidy that may
              or may not be granted.

              The condition 「補助金の交付を受けた場合」 is the panel's first line and
              sits directly above the figure. Never separate them, never move the
              condition into a footnote. */}
          <div
            className="rounded-lg"
            style={{
              marginTop: '34px',
              padding: '26px',
              background: 'rgba(255,77,109,0.08)',
              boxShadow: 'inset 0 0 0 1px rgba(255,77,109,0.28)',
            }}
          >
            <p
              className="uppercase font-medium"
              style={{ color: ACCENT, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em' }}
            >
              SUBSIDY
            </p>
            <p
              style={{ color: DARK_INK, fontFamily: JP, fontSize: '13px', lineHeight: 1.8, marginTop: '10px' }}
            >
              {PRICING.subsidy.condition}
            </p>

            <div
              className="flex flex-wrap items-end gap-x-4 gap-y-2"
              style={{ marginTop: '14px' }}
            >
              <span style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '13px' }}>
                {PRICING.subsidy.label}
              </span>
              <Yen figure={PRICING.subsidy.figure} size={46} color={ACCENT} />
              <span style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '12px' }}>
                （{PRICING.subsidy.aside}）
              </span>
            </div>

            <p
              style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '12px', lineHeight: 1.9, marginTop: '16px' }}
            >
              {PRICING.subsidy.body}
            </p>
          </div>

          <p
            style={{ color: DARK_MUTED, fontFamily: JP, fontSize: '11.5px', marginTop: '22px' }}
          >
            {PRICING.taxNote}
          </p>
        </div>
      </div>
    </section>
  );
}
```

### 5.5 `KhGlossary.tsx` — NEW

Sits immediately after 料金, because it is what justifies the 45万円 line. An aside,
not a feature: `max-w-4xl` to match the pricing block's measure, hairline box, no fill.

```tsx
import { GLOSSARY } from './khContent';
import { ACCENT, INK, INK_MUTED, JP, MONO, RULE_LIGHT } from './khTokens';

export default function KhGlossary() {
  return (
    <section className="bg-[#f5f7ff] px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <div
          className="rounded-xl"
          style={{ border: `1px solid ${RULE_LIGHT}`, padding: '30px' }}
        >
          <div className="flex items-center gap-2">
            <span className="h-[5px] w-[5px] shrink-0" style={{ background: ACCENT }} />
            <span
              className="uppercase font-medium"
              style={{ color: INK_MUTED, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em' }}
            >
              {GLOSSARY.eyebrow}
            </span>
          </div>
          <h2
            className="font-bold"
            style={{
              color: INK,
              fontFamily: JP,
              fontSize: 'clamp(18px,2vw,22px)',
              lineHeight: 1.45,
              marginTop: '14px',
              textWrap: 'balance',
            }}
          >
            {GLOSSARY.title}
          </h2>
          <p
            style={{ color: INK_MUTED, fontFamily: JP, fontSize: '13.5px', lineHeight: 2.05, marginTop: '14px' }}
          >
            {GLOSSARY.body}
          </p>
        </div>
      </div>
    </section>
  );
}
```

### 5.6 `KhSupport.tsx` — NEW

A ruled definition list — title left, detail right on desktop; stacked on mobile.
Same spec-sheet grammar as the pricing rows, on the light ground.

```tsx
import KhSectionHead from './KhSectionHead';
import { SUPPORT } from './khContent';
import { INK, INK_MUTED, JP, RULE_LIGHT } from './khTokens';

export default function KhSupport() {
  return (
    <section className="bg-[#f5f7ff] px-4 pb-20 md:px-6 md:pb-24 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <KhSectionHead eyebrow={SUPPORT.eyebrow} title={SUPPORT.title} lead={SUPPORT.lead} />

        <dl style={{ marginTop: '40px' }}>
          {SUPPORT.items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
              style={{ borderTop: `1px solid ${RULE_LIGHT}`, padding: '20px 0' }}
            >
              <dt
                className="font-bold min-[760px]:w-[38%] min-[760px]:shrink-0"
                style={{ color: INK, fontFamily: JP, fontSize: '15.5px', lineHeight: 1.6, textWrap: 'balance' }}
              >
                {item.title}
              </dt>
              <dd
                style={{ color: INK_MUTED, fontFamily: JP, fontSize: '13.5px', lineHeight: 1.9 }}
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

### 5.7 `KhCta.tsx` — NEW

A plain pink pill. **Do not** carry over the roll-mask hover from `PlanCard.tsx` —
the two stacked copies, the `overflow-hidden` mask and the 600ms transform are exactly
the kind of thing this page is not having. Hover is a background-colour darken and
nothing else.

`leading-[1.5]` is still required on the label: a Japanese line box clipped to glyph
height shaves the tops of 談/相, and that is a rendering fix, not decoration.

**`next/link`, never a bare `<a>`.** A bare internal anchor is a full document
reload, which re-raises the SSR `#page-cover` in `layout.tsx` — a solid panel at
z-9999 that only lifts on `window.load` + 100ms. `/contact` is dark navy, so on a
throttled phone that reads as a blank page.

```tsx
import Link from 'next/link';
import { CTA } from './khContent';
import { INK_MUTED, JP } from './khTokens';

export default function KhCta() {
  return (
    <section className="bg-[#f5f7ff] px-4 pb-28 md:px-6 md:pb-32 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
        <p
          style={{ color: INK_MUTED, fontFamily: JP, fontSize: '14px', textWrap: 'balance' }}
        >
          {CTA.lead}
        </p>

        <Link
          href={CTA.href}
          className="inline-flex items-center justify-center rounded-full bg-[#FF4D6D] px-10 py-4 font-bold leading-[1.5] text-white transition-colors hover:bg-[#E63F5D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D6D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f7ff]"
          style={{ fontFamily: JP, fontSize: '15px', marginTop: '20px' }}
        >
          {CTA.label}
        </Link>
      </div>
    </section>
  );
}
```

### 5.8 `page.tsx` — REWRITE

`PlansFontsLink` is kept exactly as it is today — same three stylesheets, same
preconnects. Do not touch it.

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

// Page-scoped fonts — same set as /services/aiops (Gen Interface JP + Inter
// italic accents + JetBrains Mono), so /plans reads as part of the same
// AIOps design system rather than introducing a new one. See
// src/app/services/aiops/page.tsx `DxFontsLink` for the original.
function PlansFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/all.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@400;500;700&display=swap"
      />
    </>
  );
}

export default function PlansPage() {
  return (
    <>
      <PlansFontsLink />
      <PlansHero />
      <KhFeatures />
      <KhPricing />
      <KhGlossary />
      <KhSupport />
      <KhCta />
      <Footer />
    </>
  );
}
```

---

## 6. `src/data/plans.ts` — EDIT

Keep the `Plan` type and every field on it — the retired `PlanCard*.tsx` files still
type-check against it. Replace the three placeholder entries with one real entry and
replace the ⚠️ placeholder warning at the top of the file, because it is no longer
true.

New header comment:

```ts
// The plan shown on /plans, and the source of the /contact deep-link pre-fill
// (see src/app/plans/_components/KhCta.tsx for the `/contact?plan=<slug>` link
// and src/app/contact/page.tsx for the lookup that turns a slug back into a
// pre-filled message).
//
// ⚠️ 2026-08-18: these are REAL, manager-supplied figures — not the invented
// placeholders this file used to carry. Editing them is a commercial change.
// The three old AIOps placeholder services (aiops-diagnosis / workflow-automation
// / data-utilization) were removed when /plans became the Knowledge Harness
// product page; a stale `?plan=` link to one of those slugs no longer matches and
// /contact simply leaves the message box empty, which is the intended fallback.
//
// Only `slug`, `label`, `name` and `summary` are read by anything live today —
// /contact's pre-fill. The remaining fields exist because the retired
// PlanCard*.tsx components still type-check against this shape.
```

New value:

```ts
export const PLANS: Plan[] = [
  {
    slug: 'knowledge-harness',
    label: 'KNOWLEDGE HARNESS',
    name: 'ナレッジハーネス',
    summary:
      '社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。',
    price: '90,000',
    priceCaption: '月額（税別）',
    specs: [
      { k: '契約期間', v: '1年（以降自動更新）' },
      { k: '初期導入費', v: '38万円' },
      { k: 'Claude Team Standard', v: '5名分・24ヶ月' },
    ],
    image: '/img/8.jpg',
  },
];
```

The `name` field's doc comment currently says "KEEP IT TO ~7 CHARACTERS" because of
the retired reel's card width. ナレッジハーネス is 8 characters and nothing renders it
in the reel any more, so **amend that comment** to note the constraint only applied
to the retired carousel — do not shorten the product's real name to satisfy a dead
component.

Resulting /contact pre-fill:

```
「ナレッジハーネス」（KNOWLEDGE HARNESS）に興味があります。

■ サービス内容
社内に散らばる情報・ノウハウ・過去のやり取りを集めて構造化し、人もAIも使える形で保管する社内知識ツールです。

詳細なご説明とお見積もりをお願いいたします。
```

---

## 7. Constraints the executor must not violate

1. **Branch**: `features/plans-page` only. Nothing under `src/app/(lp)/`, nothing on
   `features/aiops-lp`.
2. **Do not run `npm run build`.** A production build while the user's dev server is
   running corrupts `.next` and kills it with *"Cannot read properties of undefined
   (reading 'call')"*. Verify with **`npx tsc --noEmit`** only.
3. **Do not start a dev server and do not open a port.** The user owns port 3000.
4. **`next/link`, never a bare `<a>`** for internal links.
5. **No animation of any kind, and no `gsap` import on this page.** No `'use client'`,
   no `useEffect`, no scroll reveals, no transforms, no fades. The only CSS
   `transition` permitted on the whole page is the CTA button's `transition-colors`
   hover. User instruction, 2026-08-18 — simple is the requirement, not a preference.
6. **Do not delete** `PlanCard.tsx`, `PlanCardFace.tsx`, `PlanCardStack.tsx`.
7. **Do not reword any Japanese copy.** Every JP string comes from `khContent.ts`
   exactly as the manager supplied it. If a string looks wrong, stop and report —
   do not fix it.
8. `textWrap: 'balance'` on short JP lines (headings, kickers, single-line copy)
   only. Never on multi-line body paragraphs.
9. `gift-near-black` is a LIGHT colour on this project (#EBEEF3). It is not used
   here — do not reach for it.

---

## 8. Verification

```
npx tsc --noEmit
```

Then read the rendered output for these, which are the things most likely to be
wrong and are not caught by the compiler:

- Hero headline breaks as exactly two lines at every width; 「全社の記憶基盤」 never
  splits across a line and the brackets are pink while the phrase inside is navy.
- No lone trailing character on any JP heading (the manager's standing complaint).
- The 補助金 panel's 「補助金の交付を受けた場合」 sits directly above 149.5万円 — never
  scrolled apart, never reflowed below it.
- Pricing figures right-align to a common column: 216 / 38 / 45 / 299.
- 216 + 38 + 45 = 299, and 299 ÷ 2 = 149.5. If a figure is ever edited, this must
  still hold — nothing computes it, so nothing will catch a typo.
- The feature grid's six items sit on a shared baseline grid at 2- and 3-column
  widths; a short body must not leave a ragged hairline.
- CTA links to `/contact?inquiry=dx&plan=knowledge-harness` and the pre-filled
  message box on `/contact` shows the ナレッジハーネス text above.

---

## 9. `docs/NOLLM-plans-page.md` — REWRITE

That file is the human-editing manual for `/plans` and currently documents the
static 3-card grid. Rewrite it for this page. It must say, in plain Japanese, for a
non-engineer:

- Every string on the page lives in `src/app/plans/_components/khContent.ts`, and
  which constant maps to which visible block.
- The prices are in 万円 as bare figures (`'216'`), not formatted strings — the unit
  is drawn by the component.
- 216 + 38 + 45 must equal the total, and the total ÷ 2 must equal the 実質負担
  figure. Nothing checks this automatically.
- The date `2026年8月10日` in `HERO.note` must be updated whenever the product copy
  is revised.
- The 税別 note is in `PRICING.taxNote`.
- Do not edit `PlanCard.tsx` / `PlanCardFace.tsx` / `PlanCardStack.tsx` — retired.

---

## 10. Open questions for the manager (NOT blockers — page ships without answers)

1. **税別 or 税込?** The source copy states no tax basis. The page prints
   `※表示価格はすべて税別です。`, carried over from the previous build's convention.
   One string to change if wrong: `PRICING.taxNote`.
2. **1年契約 vs 24ヶ月の見積り.** The page says 契約は1年（以降自動更新） while every
   figure is quoted over 24ヶ月. A buyer will ask what happens if they do not renew
   at month 12. Rendered faithfully as supplied; worth the manager resolving.
3. **補助金は未確定.** 「対象ツールとなることを前提に設計しています」 means eligibility is
   assumed, not confirmed — yet 実質半額 is the page's strongest claim. The
   conditional is printed directly above the figure and the note keeps its
   2026年8月10日 date, which is the honest minimum. The manager should know the
   page leans on an unconfirmed premise.
4. **Nav / sitemap.** `/plans` is deliberately in neither. Now that it carries a
   real product, does it get listed? Unchanged by this work.
