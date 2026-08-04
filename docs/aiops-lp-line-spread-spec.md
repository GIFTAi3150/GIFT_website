# LP — line-spread on scroll (madewithgsap effect097)

Applies to the two headline blocks on `/lp`, both concepts:

- `.lp-hero-copy` → its `h1` and its `p`
- the before/after heading in `.lp-tl` → its `.lp-eyebrow` and its `h2`

No markup changes. No data changes. LpMotion + one CSS rule.

## 1. The reference

Reel (verified against the page's own HTML — the page is paywalled, the mp4 is
not):

```
curl -sL https://madewithgsap.com/effects/effect097 | grep -oE '[^"]*\.mp4'
  -> pub-8ca9b5847fbb4d4fb97b3497fb9521d5.r2.dev/video_OPTIM/097.mp4
```

**Each rendered line's word-spacing is a function of that line's own vertical
position on screen.** Not a per-block timeline, not a stagger. In one frame of
the reel a single paragraph shows its top four lines at natural spacing and
lines 5–8 progressively looser, the bottom one loosest — a gradient *inside*
one paragraph. That gradient is the whole effect.

- settle line ≈ **0.68 × viewport height**; at or above it, natural spacing
- below it the spacing opens, ramping steeply over roughly a third of a screen
- glyphs are never scaled — only the gaps
- no opacity ramp, no vertical offset beyond ordinary scroll
- **enter-only**: once settled, lines stay settled as they scroll off the top

## 2. The Japanese adaptation

The reference spreads **words**. Japanese has no word spaces, so there is
nothing to open. The equivalent is character spacing (字間) — animate
`letter-spacing`. This is not a shortcut; it is the only mapping that exists.

Two consequences:

- **The line opens about its own centre**, via a `translateX` of half the
  added width. This is what the reference does — its loose lines extend past
  the column on *both* sides — and it halves the overhang on each edge, which
  is what keeps a spread line on screen at phone widths.
- **The overflow is clipped, not prevented.** `white-space: nowrap` on the
  split lines stops any re-wrap mid-animation; the line simply gets wider than
  its measure and is clipped at the viewport edge.

> ### ⚠️ Do not re-add a width cap. It was v1 and it zeroed the whole effect.
>
> v1 capped the spread to `available − natural` on each line so that nothing
> would overflow and no clip container would be needed. That silently disabled
> the effect: **a wrapped line fills its measure by definition — that is why it
> wrapped** — so `available − natural ≈ 0` for every line of a paragraph, the
> cap resolved to 0, and the hero sub got exactly no spread. Only a short
> non-wrapping heading had any room at all. Spreading text *requires* room the
> measure does not have; the room has to come from overflow.

## 3. Numbers

```
MAX      0.34       em of extra letter-spacing at full spread
SETTLE   0.62       fraction of viewport height; at/above this, natural
RANGE    0.42       fraction of vh over which the spread ramps to MAX
ramp     d ** 1.5   ease-in, gentler than v1's d*d so the spread is visible
                    across more of the range rather than only at the very edge
```

Per line, every scroll frame:

```
d      = clamp((rect.top / vh - SETTLE) / RANGE, 0, 1)
spread = MAX * d ** 1.5                  // em
extra  = spread * fontSize * n           // px of width the line gains
shift  = -extra / 2                      // opens about the line's centre
```

`n` = `textContent.length`. `fontSize` is cached at split time — reading
computed style per line per frame forces a style recalc for nothing.

At `d === 0` **both inline styles are removed**, not written as zero, so the
element's own CSS letter-spacing (`-0.01em` on the headings) applies exactly at
rest and no stray transform is left on the node.

**Read every rect first, then write every style.** letter-spacing is a layout
property, so interleaving reads and writes forces one synchronous layout per
line. Same rule the punch marquee in this file already documents.

## 4. `src/app/(lp)/lp.css`

Append one rule. `.lp-sline` elements only exist once SplitText has run, so
there is no static/no-JS state to protect here.

```css
/* SplitText line wrappers for the effect097 line-spread (LpMotion). nowrap is
   load-bearing: the spread grows each line's width past its measure, and
   without this the line would re-wrap mid-animation and the paragraph would
   jump. Safe because a split line is by definition already exactly one
   rendered line. */
.lp-sline {
  white-space: nowrap;
}
/* A spread line is deliberately WIDER than the measure — that overflow is
   where the effect's room comes from (see the spec: capping it to the measure
   instead is what silently disabled v1). The hero already clips, via
   `overflow: hidden` on .lp-hero; the flow section does not, and without this
   a spread heading would hand the document a horizontal scrollbar.

   `clip`, not `hidden`, and x only: `hidden` would make .lp-tl a scroll
   container, which would neutralise the sticky `.lp-punch-pane` inside it.
   `clip` is not a scroll container, and `overflow-y: visible` is only legal
   alongside `clip`. .lp-tl is full-bleed, so this cuts at the window edge. */
.lp-tl {
  overflow-x: clip;
  overflow-y: visible;
}
```

## 5. `src/app/(lp)/lp/_components/LpMotion.tsx`

**(a)** Add the import beside the ScrollTrigger one, and register it:

```ts
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);
```

**(b)** Exclude `.lp-tl`'s heading from the generic heading tween. SplitText
rewrites the h2's innerHTML, which detaches the `.lp-line` nodes that tween
holds — it would then animate nodes that are no longer in the document.

```ts
      gsap.utils
        .toArray<HTMLElement>('.lp-section h2, .lp-cta h2')
        // .lp-tl's heading is line-split for the spread below, which rewrites
        // its innerHTML — this tween's `.lp-line` targets would be detached.
        .filter((h) => !h.closest('.lp-tl'))
        .forEach((h) => { /* body unchanged */ });
```

**(c)** Add this block immediately after the `.lp-scroll` cue tween:

```ts
      /* ----------------------------------------------------- line spread */
      // Port of madewithgsap effect097. Each rendered LINE's letter-spacing is
      // a function of that line's own position on screen: natural at or above
      // ~68% of the viewport, opening up below it. Not a timeline and not a
      // stagger — in the reference a single paragraph shows settled lines at
      // the top and progressively looser ones toward the bottom, and that
      // gradient inside one block is the effect.
      //
      // The reference spreads WORDS. Japanese has no word spaces, so this
      // spreads CHARACTERS (字間) instead — the only mapping that exists.
      // Derivation: docs/aiops-lp-line-spread-spec.md.
      //
      // ⚠️ Left edge is anchored and the spread is capped to the room each
      // line actually has. That is what makes this safe without a clip
      // container: nothing can overflow the measure, and with `nowrap` on the
      // split lines nothing can re-wrap mid-animation.
      gsap.utils
        .toArray<HTMLElement>('.lp-hero-copy, .lp-tl .lp-inner')
        .forEach((block) => {
          const targets = gsap.utils.toArray<HTMLElement>(
            ':scope > h1, :scope > p, :scope > .lp-eyebrow, :scope > h2',
            block,
          );
          if (!targets.length) return;

          const MAX = 0.34;
          const SETTLE = 0.62;
          const RANGE = 0.42;

          // Cached at split time rather than read per line per frame — a
          // getComputedStyle in the paint loop forces a style recalc for a
          // number that only changes when the split is redone anyway.
          const measure = (line: HTMLElement) => {
            line.style.letterSpacing = '';
            line.style.transform = '';
            line.dataset.size = String(parseFloat(getComputedStyle(line).fontSize) || 16);
          };

          // autoSplit re-splits on resize and on late webfonts, which is
          // exactly when the rendered line breaks change. The line elements are
          // therefore NOT cached anywhere — paint() re-queries them, because a
          // cached reference would be stale the moment a re-split happened.
          targets.forEach((el) => {
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'lp-sline',
              autoSplit: true,
              onSplit: (self) => {
                (self.lines as HTMLElement[]).forEach(measure);
              },
            });
          });

          const paint = () => {
            const vh = window.innerHeight;
            const lines = Array.from(
              block.querySelectorAll<HTMLElement>('.lp-sline'),
            );

            // ⚠️ Read every rect FIRST, then write every style. letter-spacing
            // is a layout property, so interleaving would force one synchronous
            // layout per line — the same rule the punch marquee below follows.
            const tops = lines.map((line) => line.getBoundingClientRect().top);

            lines.forEach((line, i) => {
              const d = gsap.utils.clamp(0, 1, (tops[i] / vh - SETTLE) / RANGE);
              if (d === 0) {
                // Removed, not written as 0, so the element's own CSS
                // letter-spacing (-0.01em on the headings) applies exactly and
                // no stray transform is left on the node.
                line.style.letterSpacing = '';
                line.style.transform = '';
                return;
              }

              const n = line.textContent?.length ?? 0;
              const size = parseFloat(line.dataset.size ?? '0');
              if (!n || !size) return;

              // NO CAP — see the warning in the spec. A wrapped line already
              // fills its measure, so capping the spread to the measure zeroes
              // the effect outright. The extra width overflows and is clipped.
              const spread = MAX * Math.pow(d, 1.5);
              // letter-spacing adds space after every character, including the
              // last, so the line gains `spread * size * n`. Shifting back by
              // half of it opens the line about its own centre instead of
              // pushing it off the right edge.
              const shift = (spread * size * n) / 2;
              line.style.letterSpacing = `${spread}em`;
              line.style.transform = `translateX(${-shift}px)`;
            });
          };

          ScrollTrigger.create({
            trigger: block,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: paint,
            // Fires on create and after every resize / re-split, which is what
            // sets the initial state for someone landing mid-page.
            onRefresh: paint,
          });
        });
```

## 6. Constraints

- Everything above sits below the `prefers-reduced-motion` bail already at the
  top of the effect, so those visitors get the untouched static document. No
  `.lp-sline` element exists at all without JS.
- Per section, never `document.querySelector` — `page.tsx` maps `LP_SLUGS`, so
  both selectors match twice. All lookups above are scoped to `block`.
- No `pin`, no `clearProps: 'all'`, no `once: true`.

## 7. Verification

- `npx tsc --noEmit` clean.
- **Do NOT run `npm run build` / `npm run dev`** — the user owns port 3000.
- If `gsap/SplitText` does not import cleanly, STOP and report; do not
  substitute a hand-rolled splitter.
