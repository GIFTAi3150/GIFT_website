# LP CTA — flat green field → dark field + LINE talk preview

Replaces the full-bleed `#06C755` block at the bottom of each LP variant.

## 1. Why

Three problems with the current block, in order of how much they cost:

1. **It fails contrast where it matters most.** White on `--lp-line` (`#06C755`)
   is **2.23:1**. That is the h2 *and* the button label — the single conversion
   point on the page — both under AA. The green-on-white button is the same
   2.23:1 inverted. No amount of weight fixes this; the field colour has to go.
2. **LINE green is a button colour, not a field colour.** At ~1900px wide and
   full saturation it vibrates and flattens everything sitting on it, including
   the button, which is supposed to be the loudest object in the section.
   Because the whole field is already the brand colour, the CTA has nothing
   left to stand out *against*.
3. **It asks for a LINE add and shows nothing about what that means.** The
   friction here is not persuasion, it is uncertainty — "what lands in my LINE
   after I tap?" A talk-thread preview answers it in one glance.

The fix is inversion: near-black field (`--lp-black`, same as the LP's other
dark sections, and a hard cut down from the `--lp-mist` what-we-do section
directly above it), with green surviving **only** on the button and the
outgoing chat bubbles. Green appears three times, small, and every instance
points at the action.

The device is drawn flat and **cropped by the section's bottom edge** — a
hard-edged editorial crop, matching the LP's existing language (giant cropped
type, hard rules). It is explicitly **not** a glossy 3D iPhone render floating
on a drop shadow; that is the templated-SaaS look this site rejects.

### Decisions that are settled — do not re-open

- **The button is NOT inside the phone.** A CTA drawn inside a device frame
  reads as part of the image and does not get clicked. The phone is decorative
  (`aria-hidden`), the real anchor lives in the copy column.
- **The `.lp-cta::after` giant "LINE" wordmark is deleted.** It only existed to
  give the flat green field something to look at. The phone now carries LINE
  identity, and two large LINE signifiers fight. A soft green glow behind the
  phone replaces it.
- **The chat is LINE _dark_ mode**, not the default blue-grey wallpaper. A
  bright blue-grey panel would just be a second large colour field on a dark
  section, and green bubbles pop far harder on `#171c20`.
- **On ≤920px the device chrome is stripped** and the bubbles sit directly on
  the section field. Drawing a phone inside a phone is silly and wastes width.

## 2. Constraints the executor must not break

- `LpMotion.tsx` is **selector-driven**. Two existing selectors depend on this
  markup and must keep matching:
  - `.lp-cta h2` — heading reveal, needs the `.lp-line` spans to stay.
  - `.lp-cta-inner > p` — copy fade. Both the eyebrow `p` and the body `p` are
    currently direct children of `.lp-cta-inner` and both animate. Keep them
    direct children. The new notes list is a `<ul>` so it is not matched.
- `LP_CTA.href` stays `'#'`. It is a known launch blocker tracked in
  `src/data/lp-variants.ts`; **do not invent a LINE URL.** Keep the existing
  `⚠️ HARD LAUNCH BLOCKER` comment in `LpCta.tsx` verbatim.
- The component stays a **server component** — no `'use client'`, no hooks.
- Do not use the official LINE logotype/mark. The glyph on the button is a
  generic speech bubble drawn inline (trademark safety).
- New GSAP work is a **tween with a stagger, never a timeline**.
  `gsap.timeline({scrollTrigger:…})` has self-killed mid-refresh on this
  project before.

## 3. `src/app/(lp)/lp/_components/LpCta.tsx` — full replacement

```tsx
import { LP_CTA } from '@/data/lp-variants';

// Identical on both A and B, so it's hardcoded against LP_CTA rather than
// threaded through per-variant data (see docs/aiops-lp-plan.md §3).
//
// Was a full-bleed #06C755 field until 2026-08-05. It was replaced because
// white-on-LINE-green is 2.23:1 — the h2 and the only CTA on the page were
// both under AA — and because the section asked for a LINE add without
// showing what arrives after the tap. Rationale + the settled decisions
// (button outside the phone, wordmark deleted, dark-mode chat) are in
// docs/aiops-lp-cta-line-phone.md. Read it before changing the colour field.
export default function LpCta() {
  return (
    <section className="lp-cta" aria-label="公式LINEでの面談予約">
      <div className="lp-cta-grid">
        <div className="lp-cta-inner">
          <p className="lp-eyebrow">{LP_CTA.eyebrow}</p>
          <h2>
            {LP_CTA.heading.map((line, i) => (
              <span className="lp-line" key={i}>
                {line}
              </span>
            ))}
          </h2>
          <p>{LP_CTA.body}</p>
          {/*
            ⚠️ HARD LAUNCH BLOCKER — LP_CTA.href is still '#' (see the comment
            on it in src/data/lp-variants.ts). This is the ONLY conversion
            point on either page: swap in the real 公式LINE URL, and fire the
            ad-platform conversion event here before navigating, once the ad
            platform is known (docs/aiops-lp-plan.md §4.4 / §4.5).
            Plain <a>, not next/link — this is meant to become an external
            LINE URL, not an internal route.
          */}
          <a className="lp-button lp-cta-btn" href={LP_CTA.href}>
            {/* Generic speech bubble, deliberately NOT the LINE mark — the
                official logotype has usage terms we have not cleared. */}
            <svg className="lp-cta-btn-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 3C6.9 3 2.8 6.4 2.8 10.6c0 2.4 1.4 4.6 3.6 6 .2.1.3.4.2.6l-.5 1.9c-.1.3.2.6.5.4l2.4-1.3c.2-.1.4-.1.6-.1.8.2 1.6.3 2.4.3 5.1 0 9.2-3.4 9.2-7.7S17.1 3 12 3Z"
              />
            </svg>
            <span>{LP_CTA.button}</span>
          </a>
          {/* Friction removal, not decoration — both items are structurally
              true of a 公式LINE flow (adding a 友だち is free; the booking
              happens in the talk). Replace or delete if 営業 wants different
              wording; do NOT add claims about response time. */}
          <ul className="lp-cta-notes">
            <li>登録は無料です</li>
            <li>LINEのトークで完結します</li>
          </ul>
        </div>

        {/* Decorative: a preview of the talk the visitor is about to open.
            aria-hidden because it restates the copy column in picture form —
            a screen reader should not read the mock conversation as content. */}
        <div className="lp-cta-phone" aria-hidden="true">
          <div className="lp-phone-frame">
            <span className="lp-phone-speaker" />
            <div className="lp-phone-screen">
              <div className="lp-chat-bar">
                <span className="lp-chat-back" />
                <span className="lp-chat-name">株式会社GIFT</span>
                <span className="lp-chat-menu" />
              </div>
              <div className="lp-chat-body">
                <div className="lp-chat-row is-in">
                  <p className="lp-bubble">
                    ご登録ありがとうございます。御社で「AIに任せられる業務」を一緒に洗い出します。
                  </p>
                </div>
                <div className="lp-chat-row is-in">
                  <p className="lp-bubble">ご希望の日時をお選びください。</p>
                </div>
                <div className="lp-chat-row is-out">
                  <p className="lp-bubble">来週の火曜 14:00 で</p>
                  <span className="lp-chat-meta">既読</span>
                </div>
                <div className="lp-chat-row is-in">
                  <p className="lp-bubble">承知しました。当日はこのトークからご案内します。</p>
                </div>
              </div>
              <div className="lp-chat-input">
                <span />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

## 4. `src/app/(lp)/lp.css`

### 4.1 Replace the existing `.lp-cta` block (currently lines ~1210–1250)

Delete `.lp-cta`, `.lp-cta::after`, `.lp-cta-inner`, `.lp-cta h2`, `.lp-cta p`
and `.lp-cta .lp-button` entirely and paste this in their place. Keep the
`/* --- @media */` divider comment that follows it exactly where it is.

```css
/* ---------------------------------------------------------------- cta

   Near-black field, not the LINE green it used to be. White on #06C755 is
   2.23:1 — the h2 and the page's only conversion button were both under AA —
   and a full-bleed brand colour leaves the CTA nothing to stand out against.
   Green now appears three times only: the button, the outgoing bubbles, and
   the glow behind the phone. Full argument, and the decisions that are closed
   (button outside the phone, no giant LINE wordmark, dark-mode chat), in
   docs/aiops-lp-cta-line-phone.md.
=================================================================== */
.lp-cta {
  position: relative;
  overflow: hidden;
  background: var(--lp-black);
  color: var(--lp-white);
  padding: clamp(58px, 9vw, 106px) clamp(18px, 6vw, 84px);
}
.lp-cta-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) clamp(272px, 25vw, 328px);
  gap: clamp(32px, 5vw, 72px);
  align-items: center;
  width: min(1180px, 100%);
}
.lp-cta-inner {
  width: min(680px, 100%);
}
/* Was --lp-blue on the green field. On near-black, #165dff is ~3.5:1 at 11px
   — too thin. Green ties the label to the button and is 7.7:1 here. */
.lp-cta .lp-eyebrow {
  color: var(--lp-line);
}
.lp-cta h2 {
  max-width: 780px;
  color: var(--lp-white);
}
.lp-cta-inner > p:not(.lp-eyebrow) {
  max-width: 560px;
  margin: 18px 0 0;
  font-size: clamp(16px, 2vw, 21px);
  font-weight: 700;
  color: var(--lp-muted);
}

/* ---- button. The only saturated-green solid in the section, so it is also
   the brightest object in it — which is the entire point. */
.lp-cta .lp-button {
  gap: 10px;
  margin-top: 30px;
  min-height: 66px;
  min-width: min(100%, 360px);
  padding: 0 30px;
  border-color: var(--lp-line);
  background: var(--lp-line);
  color: var(--lp-white);
  border-radius: 999px;
  font-size: 17px;
  /* Reads as lit rather than pasted on. Tight and low-alpha — a wide soft
     shadow would put a green haze back over the section. */
  box-shadow: 0 16px 34px -16px rgba(6, 199, 85, 0.85);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    filter 0.25s ease;
}
.lp-cta .lp-button:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
  box-shadow: 0 20px 40px -16px rgba(6, 199, 85, 0.95);
}
.lp-cta-btn-icon {
  width: 22px;
  height: 22px;
  flex: none;
}
.lp-cta-notes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.45);
}
.lp-cta-notes li {
  position: relative;
  padding-left: 15px;
}
.lp-cta-notes li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 7px;
  height: 7px;
  margin-top: -3.5px;
  border-radius: 50%;
  background: var(--lp-line);
}

/* ---- phone. Flat: 1px stroke, no gloss, no tilt, no drop shadow. It hangs
   past the section's bottom padding and is cut by `overflow: hidden` above —
   an editorial crop, the same move as the cropped type elsewhere on the LP.
   `align-self: end` is required for the negative margin to apply in full;
   under the grid's `align-items: center` it would only take half effect. */
.lp-cta-phone {
  position: relative;
  align-self: end;
  isolation: isolate;
  margin-bottom: calc(-1 * clamp(58px, 9vw, 106px) - 26px);
}
.lp-cta-phone::before {
  content: '';
  position: absolute;
  inset: -14% -22%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(closest-side, rgba(6, 199, 85, 0.3), transparent 72%);
  filter: blur(26px);
  pointer-events: none;
}
.lp-phone-frame {
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 34px;
  background: #0e1114;
  padding: 10px 10px 0;
}
.lp-phone-speaker {
  display: block;
  width: 44px;
  height: 5px;
  margin: 3px auto 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
}
.lp-phone-screen {
  border-radius: 24px 24px 0 0;
  background: #171c20;
  overflow: hidden;
}
.lp-chat-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 12px;
  background: #1b2126;
}
.lp-chat-back,
.lp-chat-menu {
  flex: none;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.42);
}
/* The back chevron, drawn as two rotated edges rather than an icon file. */
.lp-chat-back {
  width: 8px;
  height: 8px;
  border: 0;
  border-left: 1.5px solid rgba(255, 255, 255, 0.55);
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.55);
  border-radius: 0;
  background: none;
  transform: rotate(45deg);
}
.lp-chat-menu {
  margin-left: auto;
  box-shadow:
    0 -6px 0 rgba(255, 255, 255, 0.42),
    0 6px 0 rgba(255, 255, 255, 0.42);
}
.lp-chat-name {
  font-size: 12.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
  color: rgba(255, 255, 255, 0.9);
}
.lp-chat-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 12px;
}
.lp-chat-row {
  display: flex;
  align-items: flex-end;
  gap: 5px;
}
.lp-chat-row.is-out {
  justify-content: flex-end;
}
.lp-bubble {
  max-width: 80%;
  margin: 0;
  padding: 9px 12px;
  font-size: 12.5px;
  line-height: 1.65;
  font-weight: 600;
  /* Asymmetric radius instead of a drawn tail — reads as a LINE bubble
     without a fake triangle pseudo-element on every row. */
  border-radius: 16px;
  background: #2a3238;
  color: rgba(255, 255, 255, 0.92);
}
.lp-chat-row.is-in .lp-bubble {
  border-top-left-radius: 5px;
}
.lp-chat-row.is-out .lp-bubble {
  order: 2;
  border-top-right-radius: 5px;
  background: var(--lp-line);
  /* 5.9:1 on #06C755. White here would be the 2.23:1 problem again. */
  color: #04150c;
}
.lp-chat-meta {
  order: 1;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1;
  padding-bottom: 3px;
  color: rgba(255, 255, 255, 0.35);
}
.lp-chat-input {
  display: flex;
  align-items: center;
  height: 46px;
  padding: 0 12px;
  background: #1b2126;
}
.lp-chat-input span {
  display: block;
  width: 100%;
  height: 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}
```

### 4.2 Add to the existing `@media (max-width: 920px)` block

Append inside the block that already starts at the `/* ---- @media */`
divider — do not create a second `@media (max-width: 920px)` rule.

```css
  /* Single column, and the device chrome comes off: rendering a phone inside
     a phone is a joke that costs width. The thread alone still tells the
     story, sitting directly on the section field. */
  .lp-cta-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 34px;
  }
  .lp-cta-phone {
    align-self: start;
    width: min(430px, 100%);
    margin-bottom: 0;
  }
  .lp-cta-phone::before {
    display: none;
  }
  .lp-phone-frame {
    border: 0;
    border-radius: 0;
    background: none;
    padding: 0;
  }
  .lp-phone-speaker,
  .lp-chat-bar,
  .lp-chat-input {
    display: none;
  }
  .lp-phone-screen {
    border-radius: 0;
    background: none;
    overflow: visible;
  }
  .lp-chat-body {
    padding: 0;
  }
  .lp-cta .lp-button {
    min-width: 100%;
  }
```

## 5. `src/app/(lp)/lp/_components/LpMotion.tsx`

Insert **immediately after** the `.lp-lead, .lp-cta-inner > p` forEach block
(it currently ends around line 826, just before the
`/* ---- punch marquee */` comment). Nothing else in the file changes.

```ts
      /* --------------------------------------------------- cta chat thread */
      // The talk preview types itself in, one message at a time — the section's
      // pitch is "this is what lands in your LINE", so the thread arriving in
      // order is the message.
      //
      // A stagger on a plain tween, NOT a timeline: a timeline with a
      // ScrollTrigger on this page has self-killed mid-refresh before. Rows
      // start hidden from JS, never from CSS, so a JS failure leaves the whole
      // thread visible instead of blank.
      gsap.utils.toArray<HTMLElement>('.lp-cta-phone').forEach((phone) => {
        const rows = gsap.utils.toArray<HTMLElement>('.lp-chat-row', phone);
        if (!rows.length) return;
        gsap.set(rows, { opacity: 0, y: 14 });
        gsap.to(rows, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.16,
          scrollTrigger: enter(phone, 'top 80%'),
        });
      });
```

`enter()` is the local helper defined at the top of the effect (~line 46) —
use it, do not hand-write `toggleActions`.

## 6. Verify (revision 1)

- `npx tsc --noEmit` clean. **Do not run `npm run build`** — the user's dev
  server is running and a concurrent build corrupts its chunks.
- Grep that nothing else in the repo referenced the deleted rules:
  `lp-cta::after` should have no remaining hits; `.lp-cta-inner` must still be
  matched by `LpMotion.tsx`.
- `LP_CTA.href` is still `'#'` and the HARD LAUNCH BLOCKER comment survives.
- The section renders twice (once per variant, A and B) — both must look
  identical, and both phones must animate independently.

---

# Revision 2 — field colour + the mobile blank

Two changes on top of revision 1. **Everything above still stands** except the
values explicitly replaced here.

## 7. The field goes from black to the page's own deep blue

`--lp-black` was the wrong dark. It is the hero's colour, so the CTA read as a
second hero rather than as the page's closing move, and next to the `--lp-mist`
what-we-do section directly above it, pure neutral black looks like an absence
of a decision rather than a decision.

The LP already has a blue axis: `--lp-blue` (#165dff) and `--lp-mist` (#e0e6f0)
are the *same hue*, 221°, at opposite ends of the lightness range — that
derivation is written up in `docs/aiops-lp-what-section-light-field.md`. The CTA
field becomes the third point on that axis: hue 221° taken dark. It is visibly
a colour rather than "off", it belongs to the section above it, and it keeps the
light → dark punctuation that makes the CTA read as an arrival.

### 7.1 New tokens — add to `:root` in `lp.css`, after `--lp-blue-ink`

```css
  /* CTA field. Third point on the same 221° axis as --lp-blue / --lp-mist:
     hsl(221 45% 12%). NOT --lp-black — that is the hero's colour, and reusing
     it made the CTA read as a second hero instead of the page's last move.
     White is 18.2:1 here and LINE green is 8.2:1, so both the heading and the
     button clear AA comfortably. */
  --lp-deep: #111a2c;
  /* Button fill ONLY. #06c755 with a white label is 2.23:1 — the exact defect
     that killed the old green field, and it would have come straight back on
     the button, which is the one control on the page that must not fail.
     #05a94a is LINE's own darker green and takes a white 17px/900 label to
     3.10:1, over the 3:1 large-text threshold. The vivid #06c755 stays on the
     chat bubbles, where the text is near-black and reads 5.9:1. */
  --lp-line-deep: #05a94a;
```

### 7.2 Value swaps in the `.lp-cta` block

Change only these declarations; everything else in §4.1 is unchanged.

| Selector | Property | Was | Becomes |
| --- | --- | --- | --- |
| `.lp-cta` | `background` | `var(--lp-black)` | `var(--lp-deep)` |
| `.lp-cta .lp-button` | `background` | `var(--lp-line)` | `var(--lp-line-deep)` |
| `.lp-cta .lp-button` | `border-color` | `var(--lp-line)` | `var(--lp-line-deep)` |
| `.lp-phone-frame` | `background` | `#0e1114` | `#0a111e` |
| `.lp-phone-screen` | `background` | `#171c20` | `#151d2a` |
| `.lp-chat-bar` | `background` | `#1b2126` | `#1b2536` |
| `.lp-chat-input` | `background` | `#1b2126` | `#1b2536` |
| `.lp-bubble` | `background` | `#2a3238` | `#2a3547` |

The four phone greys move onto the same blue axis for one reason: neutral
warm-grey chrome on a 221° navy field reads muddy and slightly green. These are
the same values shifted to the field's hue — the phone still looks like LINE
dark mode, it just belongs to the section it is sitting in.

Also update the hover rule so the button brightens *toward* the brand green
rather than past it:

```css
.lp-cta .lp-button:hover {
  transform: translateY(-2px);
  background: var(--lp-line);
  box-shadow: 0 20px 40px -16px rgba(6, 199, 85, 0.95);
}
```

(The `filter: brightness(1.08)` from §4.1 comes out — with an explicit hover
background it would double-lighten.)

Leave the `.lp-cta-phone::before` glow, `.lp-chat-row.is-out .lp-bubble`
(`var(--lp-line)` / `#04150c`) and `.lp-cta-notes li::before` on `--lp-line`.
Those are all vivid-green-on-dark or dark-on-vivid-green and already pass.

## 8. Mobile: the chat thread never appears — cause and fix

**Symptom.** At ≤920px the phone area is blank. Desktop is fine.

**Cause.** It is not the CSS — §4.2 is applied correctly and only strips the
device chrome, so on mobile the bubbles *are* the entire visual. The §5 tween
sets `.lp-chat-row` to `opacity: 0` up front and only restores it when
`enter(phone, 'top 80%')` fires. When that ScrollTrigger's start position is
computed wrong, the rows are never revealed and the section renders empty —
and on mobile it is computed wrong routinely, because the CTA sits below two
`.lp-punch-live` tracks that are sized in `230svh` with a `-32dvh` pull.
`svh` and `dvh` disagree by the height of the mobile URL bar, so every trigger
position below those tracks is stale the moment the bar collapses.

On desktop the same code is safe (no URL bar, `svh == dvh`), which is exactly
why the bug is mobile-only.

**Fix.** Do not run the reveal at all below the breakpoint where the device
chrome comes off. On mobile the phone is already reduced to bare bubbles, so
the stagger was buying almost nothing there — and not running it means the rows
are never hidden in the first place, which makes the section robust rather than
dependent on a trigger firing.

Replace the whole §5 block in `LpMotion.tsx` with:

```ts
      /* --------------------------------------------------- cta chat thread */
      // The talk preview types itself in, one message at a time — the section's
      // pitch is "this is what lands in your LINE", so the thread arriving in
      // order is the message.
      //
      // ⚠️ DESKTOP ONLY, and that is a correctness requirement, not taste.
      // This tween hides the rows first and reveals them on a ScrollTrigger, so
      // if the trigger's start is mis-measured the rows stay at opacity 0 and
      // the section renders BLANK. Below this breakpoint the CTA sits under two
      // `.lp-punch-live` tracks measured in 230svh against a -32dvh pull, and
      // svh/dvh disagree by the height of the mobile URL bar — so every trigger
      // position down here is stale as soon as that bar collapses. That is the
      // blank-phone-on-mobile bug. Keeping the gsap.set INSIDE the mm.add means
      // a phone never hides the rows at all.
      //
      // 921px, not the 900 used elsewhere in this file: it has to line up with
      // the 920px CSS breakpoint that strips the device chrome, so the frame
      // and the motion always agree about which layout is on screen.
      //
      // A stagger on a plain tween, NOT a timeline: a timeline with a
      // ScrollTrigger on this page has self-killed mid-refresh before.
      mm.add('(min-width: 921px)', () => {
        gsap.utils.toArray<HTMLElement>('.lp-cta-phone').forEach((phone) => {
          const rows = gsap.utils.toArray<HTMLElement>('.lp-chat-row', phone);
          if (!rows.length) return;
          gsap.set(rows, { opacity: 0, y: 14 });
          gsap.to(rows, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.16,
            scrollTrigger: enter(phone, 'top 80%'),
          });
        });
      });
```

`mm.add` reverts everything created inside it — including the `gsap.set` — when
the query stops matching, so resizing a desktop window down past 921px restores
the rows instead of leaving them stuck at `opacity: 0`. That is the same reason
the two existing `mm.add` blocks in this file exist; do not "simplify" this to a
bare `window.innerWidth` check.

## 9. Verify (revision 2)

- `npx tsc --noEmit` clean. Still **no `npm run build`** — the user's dev server
  is running.
- `--lp-black` must no longer appear anywhere inside the `.lp-cta` rules.
- Grep `#0e1114`, `#171c20`, `#1b2126`, `#2a3238` — zero hits left in `lp.css`.
- At a ≤920px viewport width the four chat bubbles must be visible **without
  scrolling being required to reveal them** — that is the whole point of the
  fix. Confirm by reading the CSS/JS, not by starting a server.

---

# Revision 3 — the thread still vanishes on resize

## 10. Symptom and cause

Revision 2 fixed the fresh mobile load: below 921px the `mm.add` never runs, so
the rows are never hidden. It did **not** fix crossing the breakpoint. Widen the
window past 921px and the reveal writes `opacity: 0` **inline** on every
`.lp-chat-row`; narrow it again and those inline styles are still there, so the
section renders as a tall empty gap under the button.

`gsap.matchMedia()` is supposed to revert everything created inside a query
callback when that query stops matching, and that is what revision 2 relied on.
It is not reliably restoring these rows here — the `mm` is created outside the
surrounding `gsap.context()` while the `mm.add` calls happen inside it, so the
sets are recorded by two contexts at once.

Rather than debug whose revert wins, this revision removes the dependency
entirely. **The chat thread's visibility must not depend on JavaScript doing
the right thing**, because every failure mode of this animation blanks the
section — the rows are the only thing rendered on mobile, where the device
chrome is stripped.

Two independent guarantees, deliberately redundant:

## 11. Guarantee 1 — CSS floor at ≤920px (`lp.css`)

Add to the existing `@media (max-width: 920px)` block, next to the other
`.lp-cta` rules (~line 1494 onward):

```css
  /* Bulletproofing, not styling — and the one place on this page where
     !important is correct.

     The desktop reveal writes `opacity: 0` INLINE on these rows. Below this
     breakpoint the bubbles are the entire section (the device chrome is
     stripped above), so one leftover inline style renders the whole CTA as an
     empty gap — which is exactly what crossing 921px used to do. An inline
     style can only be beaten by !important, and there is no state below this
     width in which a chat row is legitimately hidden: the animation that hides
     them is gated to (min-width: 921px). So this is a hard invariant, not a
     specificity fight. */
  .lp-chat-row {
    opacity: 1 !important;
    transform: none !important;
  }
```

## 12. Guarantee 2 — explicit named-prop restore (`LpMotion.tsx`)

Do not trust the implicit revert. Return a cleanup from the `mm.add` callback
that clears the two props by name.

Replace the body of the §8 `mm.add('(min-width: 921px)', ...)` callback with:

```ts
      mm.add('(min-width: 921px)', () => {
        // Collected so the cleanup below can restore them by name. Same rule as
        // the two mm.add blocks above: the cleanup is returned from the mm.add
        // callback, never from the forEach.
        const armed: HTMLElement[] = [];

        gsap.utils.toArray<HTMLElement>('.lp-cta-phone').forEach((phone) => {
          const rows = gsap.utils.toArray<HTMLElement>('.lp-chat-row', phone);
          if (!rows.length) return;
          armed.push(...rows);
          gsap.set(rows, { opacity: 0, y: 14 });
          gsap.to(rows, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.16,
            scrollTrigger: enter(phone, 'top 80%'),
          });
        });

        // ⚠️ Explicit, and NOT redundant with matchMedia's own revert. This mm
        // is created outside the surrounding gsap.context() while these sets
        // are recorded inside it, and the implicit revert was leaving
        // `opacity: 0` on the rows when the window narrowed back past 921px —
        // the section then rendered as an empty gap. Named props only:
        // clearProps: 'all' is banned on this project (it is
        // `style.cssText = ''`, which takes React-owned styles with it).
        return () => {
          if (armed.length) gsap.set(armed, { clearProps: 'opacity,transform' });
        };
      });
```

Everything else in the §8 block — the whole comment header above `mm.add`, the
breakpoint, the tween values — is unchanged.

## 13. Verify (revision 3)

- `npx tsc --noEmit` clean. Still **no `npm run build`**.
- `clearProps: 'all'` must appear nowhere in `LpMotion.tsx`.
- The `return () =>` must be at the `mm.add` callback level, not inside the
  `forEach`.
- `.lp-chat-row { opacity: 1 !important }` exists **only** inside the
  `@media (max-width: 920px)` block — never unscoped, or the desktop reveal
  dies.

---

# Revision 4 — the device frame comes back on mobile

## 14. Reversing a design decision

§1 and §4.2 stripped the device chrome below 920px on the argument that drawing
a phone inside a phone is redundant. **The user overruled that on 2026-08-05**:
they want the same object on mobile that they see on desktop. That call is
theirs, so the "no phone-inside-a-phone" line in §1 is dead — ignore it, and do
not re-propose stripping the chrome.

Mobile now renders the *same* component as desktop, just narrower and centred:
frame, speaker slot, chat bar, thread, input row, green glow, and the same
bottom crop.

## 15. `lp.css` — replace the CTA rules inside `@media (max-width: 920px)`

In the `@media (max-width: 920px)` block, **delete** these five rules outright
(they are the chrome-strip from §4.2):

- `.lp-cta-phone::before { display: none; }`
- `.lp-phone-frame { border: 0; border-radius: 0; background: none; padding: 0; }`
- `.lp-phone-speaker, .lp-chat-bar, .lp-chat-input { display: none; }`
- `.lp-phone-screen { border-radius: 0; background: none; overflow: visible; }`
- `.lp-chat-body { padding: 0; }`

And **replace** the `.lp-cta-phone` rule with:

```css
  /* The full device, same as desktop — the user asked for the phone shape on
     mobile too (2026-08-05), overruling the earlier call to strip it. Centred
     rather than flush-left: at 300px under a full-bleed column, left-aligning
     leaves a dead strip down the right side.

     300px because that is a believable handset width and it holds the 12.5px
     bubble type at the same size the desktop frame does — scaling the frame to
     the column would blow the type up and stop it reading as a screenshot.

     `align-self` and `margin-bottom` are deliberately NOT overridden here: the
     base rule's bottom bleed still applies, so the frame is cropped by the
     section edge on mobile exactly as it is on desktop. */
  .lp-cta-phone {
    justify-self: center;
    width: min(300px, 84%);
  }
```

Everything else in that block stays: the single-column `.lp-cta-grid`, the
full-width `.lp-cta .lp-button`, and — unchanged and still required — the
`.lp-chat-row { opacity: 1 !important; transform: none !important; }` floor
from §11.

No JS changes. The reveal stays gated to ≥921px: with the frame back, mobile
renders a complete, static phone, which is the robust state.

## 16. Verify (revision 4)

- `npx tsc --noEmit` clean. Still **no `npm run build`**.
- Inside the `@media (max-width: 920px)` block there must be **no** rule
  targeting `.lp-phone-frame`, `.lp-phone-screen`, `.lp-phone-speaker`,
  `.lp-chat-bar`, `.lp-chat-input`, `.lp-chat-body`, or `.lp-cta-phone::before`.
- The `.lp-chat-row` `!important` floor is still there.
- `.lp-cta-phone` in that block sets only `justify-self` and `width`.

---

# Revision 5 — light field, and the reassurance line comes out

## 17. The field goes light

Third pass on this background. The history matters, because it rules out
half-measures: the original LINE green was "too much green", `--lp-black` was
"not black at all", and `--lp-deep` (#111a2c) was "still too dark". Two
consecutive pushes in the same direction, so this does not go one shade lighter
— it goes **light**, and the section's type inverts with it.

Field is `--lp-paper` (#ffffff), not a tinted off-white. The section directly
above is `--lp-mist` (#e0e6f0), so the CTA has to be brighter than a
blue-grey to read as a new block rather than as the same field continuing;
white is the only step that is unambiguous at that distance. A 1px top hairline
gives it a crisp edge instead of letting the two light fields bleed together.

**The phone stays dark.** LINE dark mode on a white field is a stronger object
than it was on navy — it now reads as a real handset lying on a page, which is
the whole point of it being there. Do not lighten the phone chrome.

### 17.1 Tokens

In `:root`: **delete `--lp-deep`** (it was only ever used by `.lp-cta`, which no
longer wants it). **Keep `--lp-line-deep`** — the button is unchanged. **Add**:

```css
  /* Eyebrow + any green text on the light CTA field. #06c755 is 2.1:1 on white
     and --lp-line-deep is 2.9:1 — both fail an 11px label. This is 6.4:1.
     Text only; never use it as a fill. */
  --lp-line-ink: #036e33;
```

### 17.2 `.lp-cta` rules — replace these declarations

Everything not listed keeps its revision-1/2 value.

```css
.lp-cta {
  position: relative;
  overflow: hidden;
  /* White, not a tinted off-white: the --lp-mist section directly above is
     already a pale blue-grey, so anything short of white reads as that field
     continuing rather than as the closing block arriving. The hairline is what
     stops the two light fields from bleeding into each other. */
  background: var(--lp-paper);
  border-top: 1px solid rgba(17, 17, 17, 0.1);
  color: var(--lp-ink);
  padding: clamp(58px, 9vw, 106px) clamp(18px, 6vw, 84px);
}
.lp-cta .lp-eyebrow {
  color: var(--lp-line-ink);
}
.lp-cta h2 {
  max-width: 780px;
  color: var(--lp-ink);
}
.lp-cta-inner > p:not(.lp-eyebrow) {
  max-width: 560px;
  margin: 18px 0 0;
  font-size: clamp(16px, 2vw, 21px);
  font-weight: 700;
  color: var(--lp-paper-muted);
}
```

The button rule is **unchanged** — `--lp-line-deep` fill with a white label is
3.10:1 regardless of what is behind it, and a saturated green button on white
is the loudest this CTA has ever been. Keep the `box-shadow` and the
brighten-to-`--lp-line` hover.

### 17.3 The phone's green glow becomes a shadow

`.lp-cta-phone::before` was a blurred green radial to make the phone read as lit
on a dark field. On white it is a green smudge. **Delete the entire
`.lp-cta-phone::before` rule**, and delete `isolation: isolate` from
`.lp-cta-phone` (it existed only to contain that pseudo-element's `z-index:
-1`). Keep `position: relative`, `align-self: end` and the negative
`margin-bottom`.

Then add to `.lp-phone-frame`:

```css
  /* Lifts the dark handset off the white field — without it the frame reads as
     a flat shape pasted on. Tight and low, not a soft card shadow. */
  box-shadow: 0 30px 56px -30px rgba(17, 17, 17, 0.55);
```

## 18. Remove the reassurance line under the button

The two green-dotted items under the CTA (`登録は無料です` /
`LINEのトークで完結します`) are cut — the user's call, 2026-08-05. They were
added in revision 1 as friction removal; they are not wanted.

- `LpCta.tsx`: delete the entire `<ul className="lp-cta-notes">` element **and
  the comment block directly above it** that explains the wording constraints.
  Nothing else in that file changes.
- `lp.css`: delete the `.lp-cta-notes`, `.lp-cta-notes li` and
  `.lp-cta-notes li::before` rules.

## 19. Verify (revision 5)

- `npx tsc --noEmit` clean. Still **no `npm run build`**.
- Grep `lp-cta-notes` — zero hits across the whole repo (both files).
- Grep `--lp-deep` — zero hits. Grep `--lp-line-deep` — still present on the
  button only.
- Grep `lp-cta-phone::before` — zero hits.
- No rule inside `.lp-cta` still sets a white or `--lp-muted` text colour.
- The `@media (max-width: 920px)` CTA rules from revision 4 are untouched,
  including the `.lp-chat-row` `!important` floor.

---

# Revision 6 — the thread plays as a real conversation

## 20. Why this is GSAP and not Lottie

The user asked for Lottie. `lottie-react` **is** already a dependency (`/company`
uses it), so the objection is not the dependency — it is the content:

- A Lottie is an After Effects export. These four messages are Japanese text; in
  a Lottie they stop being text and become baked artwork, with the font either
  outlined or embedded. This repo has a live mojibake guard
  (`scripts/check-encoding.mjs`) precisely because JP text has been corrupted
  in transit here before. Baking it into a binary-ish JSON is the wrong
  direction.
- The copy is not final. The 公式LINE URL is still a launch blocker, and the
  thread wording will move with it. In the DOM that is a one-line edit; as a
  Lottie every wording change is a re-export in After Effects.
- The bubbles are not a standalone graphic. They sit inside a CSS phone — the
  frame, chat bar and input row size against the column and re-lay out at
  920px. A Lottie renders at a fixed aspect ratio and cannot reflow with them,
  so it would either replace the whole phone (losing the responsive layout) or
  visibly mismatch it.
- GSAP is already on this page doing exactly this class of work.

Same result, no new asset pipeline. What follows is the choreography.

## 21. What it does

Sequential, with a **typing indicator before each incoming message** — that is
the detail that makes it read as a live conversation rather than a staggered
fade. Roughly 4.1s end to end:

| t | event |
| --- | --- |
| 0.20 | GIFT typing dots appear |
| 0.82 | dots swap for message 1, popping from its top-left corner |
| 1.24 | dots again |
| 1.86 | message 2 |
| 2.63 | your reply pops in from its top-right corner (no dots — you don't watch yourself type) |
| 3.05 | 既読 fades in |
| 3.05 | dots again |
| 3.67 | message 4 |

Bubbles scale up from their tail corner with a slight overshoot, the way a
message lands in a real client.

### Runs on mobile too, unlike the old reveal

Revision 2 gated the old reveal to ≥921px because its ScrollTrigger start was
mis-measured under the `230svh` punch tracks and left the section blank. This
one is triggered by **IntersectionObserver**, which has no cached scroll
geometry to go stale, so the same failure cannot occur — and mobile is where
most of an ad-driven LP's traffic will be, so the signature moment should not
be desktop-only.

### The safety model changes (read this before touching it)

The old guarantee was `.lp-chat-row { opacity: 1 !important }` at ≤920px. That
is **replaced**, not kept, because the animation no longer touches
`.lp-chat-row` at all — it animates `.lp-bubble`, and the floor would be inert.

The new guarantee is an **arming class**: nothing is hidden by default. JS adds
`is-armed` to `.lp-cta-phone` and only then does CSS hide the bubbles. So every
path where JS does not run — script error, reduced-motion bail, no
IntersectionObserver — leaves the full thread visible. That is strictly stronger
than the old floor, which only protected one breakpoint.

## 22. `LpCta.tsx` — add a typing indicator to each incoming row

Inside **each** of the three `<div className="lp-chat-row is-in">` rows, add the
typing element as the FIRST child, before its `<p className="lp-bubble">`. The
`is-out` row does **not** get one.

```tsx
                <div className="lp-chat-row is-in">
                  {/* Absolutely positioned inside the row, so it costs no
                      layout — the row already reserves its bubble's height and
                      the dots appear exactly where the message will land. */}
                  <span className="lp-chat-typing">
                    <i />
                    <i />
                    <i />
                  </span>
                  <p className="lp-bubble">
                    ご登録ありがとうございます。御社で「AIに任せられる業務」を一緒に洗い出します。
                  </p>
                </div>
```

Nothing else in the file changes. The whole phone is already `aria-hidden`, so
the dots need no further ARIA.

## 23. `lp.css`

### 23.1 The row becomes a positioning context

Add one declaration to the existing `.lp-chat-row` rule:

```css
  position: relative;
```

### 23.2 Typing indicator + arming — add after `.lp-chat-meta`

```css
/* Typing dots. Absolute so the row's height stays the bubble's height and
   nothing reflows when they swap out — the empty chat wallpaper above the
   messages that have not landed yet is correct, that is what a real thread
   looks like mid-conversation. Sized and coloured as an incoming bubble,
   because that is what it turns into. */
.lp-chat-typing {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px;
  border-radius: 16px;
  border-top-left-radius: 5px;
  background: #2a3547;
  /* Pure animation furniture: invisible unless the timeline is driving it, so
     a page where the JS never runs simply never shows dots. */
  opacity: 0;
  pointer-events: none;
}
.lp-chat-typing i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  animation: lp-typing 1.1s ease-in-out infinite;
}
.lp-chat-typing i:nth-child(2) {
  animation-delay: 0.15s;
}
.lp-chat-typing i:nth-child(3) {
  animation-delay: 0.3s;
}
@keyframes lp-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }
  30% {
    transform: translateY(-3px);
    opacity: 1;
  }
}

/* ⚠️ THE SAFETY MODEL. Nothing here is hidden by default — `is-armed` is added
   by LpMotion at runtime, and only then do the bubbles start invisible. Every
   path where the JS does not run (script error, prefers-reduced-motion bail, no
   IntersectionObserver) therefore renders the complete thread. Do NOT move
   these `opacity: 0`s onto the bare selectors "to simplify"; that is what
   blanked this section twice before. */
.lp-cta-phone.is-armed .lp-bubble,
.lp-cta-phone.is-armed .lp-chat-meta {
  opacity: 0;
}
```

### 23.3 Delete the superseded floor

In the `@media (max-width: 920px)` block, **delete** the
`.lp-chat-row { opacity: 1 !important; transform: none !important; }` rule and
its whole comment block. §23.2's arming model replaces it. Everything else in
that media block stays.

## 24. `LpMotion.tsx`

### 24.1 Track the observers for cleanup

Next to the existing `heroExits` declaration (~line 41), add:

```ts
    // The CTA chat threads are driven by IntersectionObserver, not ScrollTrigger
    // (see the block below for why), so ctx.revert() does not collect them.
    const chatObservers: IntersectionObserver[] = [];
```

### 24.2 Replace the whole `mm.add('(min-width: 921px)', ...)` chat block

Delete the entire cta-chat-thread block from revisions 2/3 — comment header,
`mm.add`, `armed` array, cleanup, all of it — and put this in its place:

```ts
      /* --------------------------------------------------- cta chat thread */
      // Plays the mock LINE talk as a conversation: GIFT's typing dots, then
      // the message, a beat, the next one. The user asked for this as a Lottie;
      // it is GSAP because the bubbles are real Japanese text inside a CSS
      // phone that reflows at 920px — §20 of the doc has the full argument.
      //
      // ⚠️ TRIGGERED BY IntersectionObserver, DELIBERATELY NOT ScrollTrigger.
      // The previous version used one and had to be gated to ≥921px, because
      // this section sits below two `.lp-punch-live` tracks measured in 230svh
      // against a -32dvh pull: svh and dvh differ by the mobile URL bar, so
      // every cached trigger position down here goes stale the moment that bar
      // collapses, the reveal never fired, and the section rendered blank. IO
      // has no cached geometry, so it cannot fail that way — which is why this
      // now runs at every width. Most of an ad-driven LP's traffic is mobile;
      // the signature moment should not be desktop-only.
      //
      // ⚠️ The timeline carries NO scrollTrigger of its own. A timeline that
      // kills its own trigger during a refresh takes the refresh down with it
      // (rule 1 at the top of this file). Built paused, played by the observer.
      //
      // ⚠️ `is-armed` is what hides the bubbles, and it is added HERE, at
      // runtime. Nothing is hidden in the stylesheet. If this effect never runs
      // — script error, or the reduced-motion bail above — the full thread is
      // simply visible. Do not "tidy" that into a plain CSS opacity: 0.
      gsap.utils.toArray<HTMLElement>('.lp-cta-phone').forEach((phone) => {
        const rows = gsap.utils.toArray<HTMLElement>('.lp-chat-row', phone);
        if (!rows.length || typeof IntersectionObserver === 'undefined') return;

        phone.classList.add('is-armed');

        const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out' } });
        let t = 0.2;

        rows.forEach((row) => {
          const bubble = row.querySelector<HTMLElement>('.lp-bubble');
          const typing = row.querySelector<HTMLElement>('.lp-chat-typing');
          const meta = row.querySelector<HTMLElement>('.lp-chat-meta');
          if (!bubble) return;
          const isOut = row.classList.contains('is-out');

          if (typing) {
            tl.fromTo(
              typing,
              { opacity: 0, scale: 0.9 },
              { opacity: 1, scale: 1, duration: 0.22, transformOrigin: '0% 0%' },
              t,
            );
            // How long GIFT "types" before the message lands.
            t += 0.62;
            tl.to(typing, { opacity: 0, duration: 0.14 }, t);
          } else {
            // Your own reply: no dots, you do not watch yourself type — just a
            // beat, as if you picked a time.
            t += 0.35;
          }

          // fromTo, never from: `.is-armed` sets the CSS opacity to 0, so a
          // `from` tween would read 0 as the end value and animate nothing.
          tl.fromTo(
            bubble,
            { opacity: 0, scale: 0.86, y: 8 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.42,
              ease: 'back.out(1.7)',
              // Bubbles grow out of their tail corner, like a real client.
              transformOrigin: isOut ? '100% 0%' : '0% 0%',
            },
            t,
          );

          if (meta) tl.fromTo(meta, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.42);

          // Pause before the next message.
          t += 0.42;
        });

        const io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            io.disconnect();
            tl.play();
          },
          { threshold: 0.35 },
        );
        io.observe(phone);
        chatObservers.push(io);
      });
```

### 24.3 Cleanup

In the effect's `return () => { ... }` (~line 1024), add before `ctx.revert()`:

```ts
      chatObservers.forEach((io) => io.disconnect());
      document
        .querySelectorAll('.lp-cta-phone.is-armed')
        .forEach((el) => el.classList.remove('is-armed'));
```

Removing `is-armed` matters: `ctx.revert()` strips GSAP's inline `opacity: 1`
from the bubbles, and if the class survived that, the CSS `opacity: 0` would be
left exposed on an unmounted-then-remounted page.

## 25. Verify (revision 6)

- `npx tsc --noEmit` clean. Still **no `npm run build`**.
- Grep `lp-chat-typing` — 3 hits in `LpCta.tsx` (one per `is-in` row, zero in
  the `is-out` row) and the CSS rules.
- Grep `mm.add('(min-width: 921px)'` — zero hits; that gate is gone.
- Grep `opacity: 1 !important` — zero hits in `lp.css`.
- `.lp-cta-phone.is-armed` is the ONLY selector in `lp.css` that sets
  `opacity: 0` on `.lp-bubble` or `.lp-chat-meta`.
- The timeline is constructed with `{ paused: true }` and has no
  `scrollTrigger` key anywhere.
