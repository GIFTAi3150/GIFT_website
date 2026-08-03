# LP punch-line scroll reveal (2026-08-03)

Adds a scroll-scrubbed character reveal to `.lp-flow-punch` — the single large
line under the timeline (「人を増やす前に、繰り返しの仕事をAIに残す。」 on A案,
「AIに必要なのは、御社の文脈です。」 on B案).

Companion to `docs/aiops-lp-timeline-spec.md`, which covers the timeline above it.

## On the reference

The client pointed at `madewithgsap.com/effects/effect079`. It is member-locked
("Become a member to unlock the full effect today") and nothing public describes
it, so **this is NOT a port of that effect** — it is built from this site's own
existing pattern, `src/components/ui/ScrollRevealText.tsx`. Flagged to the client.
If effect079 turns out to be something else, this is a small, isolated change to
redirect.

## Why not just reuse ScrollRevealText

`ScrollRevealText` splits with GSAP `SplitText` into `words, chars` and sets
`display: inline-block; white-space: nowrap` on each word so characters cannot
wrap mid-phrase. That only works because the copy it runs on is segmented with
**zero-width spaces (U+200B)** marking phrase boundaries — see its `wordDelimiter`
option.

The punch strings in `src/data/lp-variants.ts` contain no U+200B. Japanese has no
spaces either, so `SplitText` would produce exactly **one** word containing the
whole sentence, and `inline-block; nowrap` on it would make the entire line an
unbreakable box that overflows the viewport and never wraps.

Options were: add U+200B to the client's copy, segment at runtime with
`Intl.Segmenter`, or avoid the inline-block requirement. This spec takes the
third, which is the only one that touches neither the copy nor adds runtime
complexity:

**Server-render one plain inline `<span>` per character, and animate opacity
only.** Consequences, all good here:

- Inline elements do not interrupt line-breaking, so Japanese wraps exactly as it
  would unsplit — kinsoku rules and `text-wrap: balance` both still apply.
- Transforms do not apply to inline elements, so this is opacity-only. That is
  the right read anyway: it matches the opacity tiering of the timeline directly
  above it, which is the section's established language.
- No `SplitText`, no `autoSplit`, no revert bookkeeping.
- **No layout shift on mount**, because the spans are in the SSR'd HTML. This is
  the important one — see the note on scroll-effect interference below.
- Screen readers are unaffected: plain inline spans inside a `<p>` are
  concatenated for the accessible name. (This is only a problem with
  `inline-block` per character, which is exactly what we are avoiding.)

## ⚠️ The actual bug risk: two scroll effects in sequence

The client specifically asked that neither scroll animation be damaged. Three
things matter, in order:

1. **`.lp-flow-punch` is already animated.** It is in LpMotion's play-once body
   copy block (`'.lp-lead, .lp-flow-punch, .lp-cta-inner > p'`), which does
   `gsap.set(el, { opacity: 0, y: 16 })` and fades it in on enter. Leaving it
   there while adding a scrubbed reveal means two ScrollTriggers writing
   `opacity` on the same element at the same time — the fade would fight the
   scrub and the line would flicker or stick. **It must be removed from that
   selector list.** This is the real defect; everything else is prevention.

2. **Layout shift is what breaks neighbouring triggers.** A trigger caches its
   start/end pixel offsets. If splitting the text changed the paragraph's height
   after the timeline's triggers were created, every trigger below it would fire
   at the wrong scroll position. Server-rendering the spans means the height is
   final before any JavaScript runs, so nothing to invalidate.

3. **Independence.** The new trigger is on `.lp-flow-punch`; the timeline's are
   on `.lp-tl-list` and each `.lp-tl-step`. Different elements, no pin, no
   sticky, no shared property. ScrollTrigger handles any number of concurrent
   scrubs. Both are created inside the same `gsap.context`, so `ctx.revert()`
   tears both down together.

Already handled and unchanged: `ScrollTrigger.refresh()` on rAF and on `load` at
the bottom of the effect.

---

## 1. `src/app/(lp)/lp/_components/LpFlow.tsx`

REPLACE:

```tsx
        <p className="lp-flow-punch">{flow.punch}</p>
```

…with:

```tsx
        {/* Per-character spans, rendered on the SERVER so the paragraph's height
            is final before any JavaScript runs — a split done at mount would
            resize this line and invalidate the cached offsets of every
            ScrollTrigger below it.
            Plain inline spans, NOT inline-block: inline boundaries do not
            interrupt line-breaking, so the Japanese wraps exactly as it would
            unsplit. That also means transforms do not apply, which is why the
            reveal in LpMotion animates opacity only. See
            docs/aiops-lp-punch-reveal-spec.md. */}
        <p className="lp-flow-punch">
          {Array.from(flow.punch).map((ch, i) => (
            <span className="lp-punch-char" key={i}>
              {ch}
            </span>
          ))}
        </p>
```

`Array.from` rather than `split('')` so any astral-plane character is one span
rather than two broken halves.

---

## 2. `src/app/(lp)/lp/_components/LpMotion.tsx`

### 2a. Remove the punch from the play-once block

REPLACE:

```ts
      gsap.utils
        .toArray<HTMLElement>('.lp-lead, .lp-flow-punch, .lp-cta-inner > p')
```

…with:

```ts
      // ⚠️ `.lp-flow-punch` is deliberately NOT in this list. It gets its own
      // scrubbed character reveal below, and two ScrollTriggers writing opacity
      // on the same element fight each other — the fade-in would stamp over the
      // scrub and the line would flicker. Do not add it back here.
      gsap.utils
        .toArray<HTMLElement>('.lp-lead, .lp-cta-inner > p')
```

### 2b. Add the reveal

Insert this block immediately AFTER the body-copy/CTA block and BEFORE the
`.lp-button` block:

```ts
      /* --------------------------------------------------- punch reveal */
      // The closing line of the flow section, revealed character by character
      // as it is scrolled through. Scrubbed rather than played, so it reads as
      // continuous with the timeline directly above it — and so it runs
      // backwards on the way up instead of sitting finished.
      //
      // Opacity only, by necessity and by choice: the characters are plain
      // INLINE spans so that Japanese line-breaking still works (see
      // LpFlow.tsx), and transforms do not apply to inline boxes. It is also
      // the right language here — the timeline above states its progress in
      // opacity tiers too.
      //
      // The spans are server-rendered, so nothing here changes layout and no
      // neighbouring trigger's cached offsets are invalidated.
      gsap.utils.toArray<HTMLElement>('.lp-flow-punch').forEach((el) => {
        const chars = el.querySelectorAll('.lp-punch-char');
        if (!chars.length) return;

        // Not 0: the line should read as present-but-dim before it resolves,
        // matching the timeline's unseen-step tier rather than appearing from
        // nothing.
        gsap.set(chars, { opacity: 0.14 });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              // Finishes well before the line leaves the screen, so the
              // resolved sentence is what the visitor actually sits with.
              end: 'top 42%',
              scrub: 0.5,
            },
          })
          .to(chars, {
            opacity: 1,
            duration: 0.6,
            // `ease: 'none'` because with scrub the visitor's scroll IS the
            // easing; the stagger alone supplies the texture.
            ease: 'none',
            stagger: { each: 0.03, from: 'start' },
          });
      });
```

⚠️ Standing project rules, both satisfied: no `once: true` on a timeline (a
scrubbed timeline uses neither), and no `clearProps: 'all'`.

---

## 3. `src/app/(lp)/lp.css`

No changes. `.lp-punch-char` needs no styling — it is a plain inline span and
inherits everything from `.lp-flow-punch`. Do not add `display`, `will-change`,
or `transform` to it; `inline-block` in particular would break Japanese wrapping,
which is the whole reason for this approach.

---

## 4. Verification

- `npx tsc --noEmit` clean; `npm run build` succeeds.
- `node scripts/check-encoding.mjs` clean.
- `.lp-flow-punch` appears in LpMotion.tsx **only** in the new punch-reveal block
  — confirm it is gone from the `.lp-lead, .lp-cta-inner > p` selector.
- `src/data/lp-variants.ts`, `page.tsx` and `lp.css` unchanged.
- Manual on `/lp` at **1440×900** and **390px**, scrolling slowly down and back up:
  - the timeline's rail fill still tracks scroll and still turns green at the
    「with gift」 header — unchanged from before this task;
  - the punch line resolves character by character as it rises, and un-resolves
    on the way back up;
  - the punch line **wraps normally** and does not overflow horizontally at
    390px — this is the failure mode this design exists to avoid;
  - no flicker or double-animation on the punch line;
  - the CTA copy and button below still animate as before.
- With OS "reduce motion" on: the punch line renders at full opacity, unsplit in
  appearance, nothing dimmed.
