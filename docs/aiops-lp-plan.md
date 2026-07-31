# AIOps LP — build plan

Two landing pages for the AI agent offer, built from the manager's mock
(`11_aiops_lp_mock_variants.html`, 2026-07-31).

The mock contained **four** concepts. **A and B are approved and being built.
C and D are dropped.** The manager's note was that the result does not have to
match the mock 100% — it is direction, not a specification.

| | Slug | Hook | Angle |
|---|---|---|---|
| **A** | `/lp/ai-staff` | また、辞めましたか。 | Hiring loop: recruit → train → they quit → repeat |
| **B** | `/lp/president` | ブロッカーですよね、あなた。 | Everything stalls waiting on the president |

---

## 1. What an LP is here, so the constraints make sense

These are not site pages. Each one exists to do exactly one thing: get a
面談 booked through official LINE. The mock states the rule outright —
「詳しい説明はLINE後。LPは面談獲得に絞る。」

Consequences that hold for both pages:

- **No global nav. No footer links. No links to the rest of the site.** The only
  outbound link on the page is the LINE CTA. Anything else is a leak.
- **noindex, nofollow.** Traffic comes from video CM / paid ads, not search.
  This also avoids A, B, `/services/aiops` and `aiops.gift-inc.org` competing
  for the same Japanese keywords.
- **Short.** Four sections. If a section does not push toward LINE, it is cut.

---

## 2. Page structure (identical for A and B — only copy and video differ)

```
1  HERO          fullscreen video, dark          h1 + sub + SCROLL
2  FLOW          light                           before / after comparison
3  WHAT WE DO    dark                            3 numbered steps
4  CTA           LINE green                      heading + LINE button
```

### 1. Hero
- `100dvh` (**dvh, not vh/svh** — standing rule on this project).
- Background video: `autoplay muted loop playsinline`, `object-fit: cover`,
  `filter: grayscale(1) contrast(1.12)`.
- Two stacked overlay gradients (left-to-right dark, plus top-to-bottom dark)
  so white type stays legible over any frame.
- A faint horizontal scanline overlay at ~16% opacity.
- Copy sits **bottom-left**, not centred. `h1` at `clamp(38px, 5.6vw, 76px)`,
  `line-height: .98`, `letter-spacing: -.035em`.
- Vertical `SCROLL` marker bottom-right, hidden under 820px.

### 2. Flow — the signature section
The one part of the mock worth reproducing closely. Two lanes on a light
background:

- **bad lane** — label 「now」in red, then 4 nodes ending in a red terminal
  state (A: 求人を出す → 面接する → 教える → **辞める** / B: 問い合わせ →
  社員が確認 → 社長が外出中 → **返信が止まる**)
- **good lane** — label 「with gift」in LINE green, 4 nodes ending green
  (A: 業務を決める → AIが覚える → 同じ品質で返す → **辞めない**)

Each node is a cell in a 4-column grid with a hairline right border and a small
dot on the top rule. Below both lanes, one large punch line
(A: 「人を増やす前に、繰り返しの仕事をAIに残す。」).

Mobile: 4 columns → 2 → 1, with the borders flipping from vertical to
horizontal. The mock already solves this; reuse its breakpoint logic.

### 3. What we do
Dark section, two columns: heading + lead on the left, three numbered steps on
the right. Steps are ruled rows, not cards — no boxes, no shadows, no ticks.

### 4. CTA
LINE green `#06c755` full-bleed panel, with the word `LINE` set enormous and
bleeding off the bottom-right at 16% white. Heading
「無料でAIエージェントプレゼント！」, one supporting line, then a white button
「公式LINEで面談する」.

---

## 3. Architecture

A and B are **structurally identical**. Do not build two pages — build one set
of components driven by data, the same way `/plans` works off `src/data/plans.ts`.

```
src/data/lp-variants.ts          LP_VARIANTS: Record<'ai-staff'|'president', LpVariant>
src/app/(lp)/layout.tsx          LP-only shell: no nav, no footer, dark body
src/app/(lp)/lp/[variant]/page.tsx
src/app/(lp)/lp/_components/     LpHero / LpFlow / LpSteps / LpCta
```

`generateStaticParams` over the two slugs keeps both pages static. A third
variant later is then a data entry, not a new page.

`LpVariant` shape:

```ts
type LpVariant = {
  slug: string;
  title: string;            // <title> / OG
  hero: { h1: string; sub: string; video: string; poster: string };
  flow: {
    heading: string[];      // one string per rendered line
    bad:  { label: string; nodes: string[] };   // last node = terminal state
    good: { label: string; nodes: string[] };
    punch: string;
  };
  what: { heading: string[]; lead: string; steps: { title: string; body: string }[] };
};
```

The CTA section is the same on both pages, so it is hardcoded in the component,
not in the data.

---

## 4. Decisions and gotchas

### 4.1 The white flash — must be solved before launch
`src/app/layout.tsx` renders `#page-cover`, a fixed `#F0F7FF` panel at
`z-index: 9999`, and sets `body { background: #F0F7FF }`. It only fades on
`window.load` + 100ms (3s cap, 500ms fade). Both LP heroes are `#050505`.

Landing on a paid-traffic LP and seeing a white sheet for up to 3 seconds is
the worst possible first impression. The LP route group must opt out.

**Do NOT remove `#page-cover` from the DOM** — a previous attempt to
`.remove()` it raced hydration and produced React #418/#423 in production. The
rule on this project is: inline scripts may *restyle* React-owned nodes, never
delete them. So the fix is to make the cover dark on LP routes (and set the
body background dark) rather than to strip it out.

### 4.2 Fonts
The mock uses `Inter` + `Noto Sans JP` at `font-weight: 950`. Two notes:

- **950 does not exist.** Inter's variable range tops out at 900, so 950 clamps
  to 900. Use 900 and stop pretending.
- The corporate site uses **Gen Interface JP**. The LP deliberately does not —
  it is a different visual identity aimed at cold traffic. Keep Inter +
  Noto Sans JP, loaded page-scoped like `/plans` does with its own font link,
  so it never leaks into the rest of the site.

### 4.3 Video
Current mock files are placeholders lifted from the existing site
(`recruitment-hero-video.mp4`, `how-we-work-vid.mp4` — the mock labels them
「動画はサンプルです」). They are 2.5MB and 2.7MB, which is the right ballpark.

The manager's real CM videos replace them. Target spec when they arrive:

| | Target |
|---|---|
| Codec | H.264 (+ WebM/VP9 as a second `<source>` if easy) |
| Resolution | 1920×1080, or 1280×720 if the source is soft |
| Duration | 8–15s, seamless loop |
| Audio | **None — strip the track entirely.** It is a muted autoplay loop; a silent audio track is dead weight and some browsers treat its presence as a reason to block autoplay. |
| Size | ≤ 3MB |

Poster frame is required and is the LCP element. Render it as a `next/image`
with `priority` underneath the `<video>`, and fade the video in on `canplay` —
do not rely on the `poster` attribute alone, which next/image cannot optimise.

Respect `prefers-reduced-motion`: hold the poster, do not autoplay.

### 4.4 The LINE CTA
`href="#"` in the mock. **The real official LINE URL is still missing and is a
hard blocker for launch** — it is the only conversion point on either page.

When it lands, the click needs a conversion event fired before navigation
(the pages will be behind paid ads, and an LP with no measurable conversion is
just an expense). Slot for this in the CTA component; wire it once the ad
platform is known.

### 4.5 Analytics / pixels
Ad traffic implies tracking tags. Leave a single, documented insertion point in
`(lp)/layout.tsx` rather than scattering scripts across sections.

### 4.6 Copy safety
All Japanese copy comes from the manager's mock verbatim. Two flags:

- **「無料でAIエージェントプレゼント！」 is a real commercial offer**, not a
  slogan. Confirm it is approved before either page goes live.
- **Variant B calls the visiting president the blocker.** The manager flagged
  this himself as 「やや強い言葉」. That is a deliberate choice, not an
  accident — do not soften it without asking.

---

## 5. Build order

1. `src/data/lp-variants.ts` — both variants' copy, typed. Nothing renders yet.
2. `(lp)/layout.tsx` — dark shell, no nav/footer, noindex, page-cover override.
3. `LpHero` with the placeholder video. Verify the flash fix on a throttled
   connection before going further; everything else depends on this section
   being right.
4. `LpFlow` — the signature section. Check 4→2→1 column behaviour.
5. `LpSteps`, `LpCta`.
6. `/lp/ai-staff` and `/lp/president` wired through `generateStaticParams`.
7. Swap in the real videos, wire the real LINE URL, add conversion tracking.
8. `npm run build`, `node scripts/check-encoding.mjs`, push to preview.

Steps 1–6 can be built and reviewed with placeholder video and a dead LINE
link. Step 7 is what gates launch.

---

## 6. Open questions

| | Blocks |
|---|---|
| Official LINE URL | Launch |
| The two real CM videos | Launch (placeholders work for review) |
| Is 「無料AIエージェント」 an approved offer? | Launch |
| Ad platform (Google / Meta / LINE) for conversion tags | Tracking only |
| Do A and B need different LINE entry points to tell the leads apart? | Tracking only |
