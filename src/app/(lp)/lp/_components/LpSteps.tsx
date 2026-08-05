import type { CSSProperties } from 'react';
import type { LpVariant } from '@/data/lp-variants';

// Splitting a Japanese line for the burst in LpMotion is not `Array.from(line)`.
// The pieces become inline-block boxes in live mode, and an inline-block is an
// atomic wrap opportunity that the browser's kinsoku (禁則処理) does not apply
// across. Split naively and the LEAD — the one part of the heading that actually
// wraps — can start a line with 「、」 or break 「AI」 between the A and the I.
//
// So a token is not always one character:
//   - a run of Latin letters or digits stays whole (AI, GIFT, 24),
//   - a character that must never start a line (行頭禁則: 、。・！？, closing
//     brackets, small kana, 長音符) is glued onto the token before it,
//   - a space is glued onto the token before it so words keep their gap. The
//     live span carries `white-space: pre` for exactly this, because a trailing
//     space inside an inline-block is otherwise trimmed at a line end.
// The mirror rule (行末禁則 — opening brackets must not END a line) is not
// implemented: no copy on this page contains one, and an untested branch is
// worse than a documented gap.
const NO_LINE_START =
  /[、。，．・：；！？）】〉》」』〕｝］”’ーヽヾ々ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮ]/;
const LATIN = /[0-9A-Za-z]/;

function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const ch of Array.from(text)) {
    const prev = out[out.length - 1];
    const glue =
      prev !== undefined &&
      (NO_LINE_START.test(ch) ||
        ch === ' ' ||
        (LATIN.test(ch) && LATIN.test(prev[prev.length - 1])));
    if (glue) out[out.length - 1] = prev + ch;
    else out.push(ch);
  }
  return out;
}

// One flying unit per span. Inert without JS — `.lp-wchar` has no base CSS rule
// at all, so this is plain inline text until `.lp-what-live` exists.
function Split({ text }: { text: string }) {
  return (
    <>
      {tokenize(text).map((token, i) => (
        <span className="lp-wchar" key={i}>
          {token}
        </span>
      ))}
    </>
  );
}

// Radius of the circle each line of card type is set on, in em of that type's
// own font-size — so both curves scale with their font size and neither ever
// needs re-tuning per breakpoint.
//
// These are the ONLY place the curves are defined. The CSS just consumes the two
// custom properties ArcLine emits — do not try to express an arc in lp.css, it
// needs each token's position along the line and CSS cannot count.
//
// The two values are deliberately close in PIXELS, not in em: 14em at the 30px
// title is ~420px, 30em at the 16px body is ~480px. One card carries an arch and
// a bowl at once, and two arcs of visibly different curvature on one card read
// as an accident rather than as a pair. If either font size changes, move the
// other radius to keep the pixel radii within ~15% of each other.
//
// Smaller R = tighter curve. Below ~10 em-widths of half-line the end tokens tip
// past 25° and the line stops reading as a sentence; too large and it flattens
// back to a straight line. At these values the longest title line's ends tilt
// ~18° and the longest body line's ~13°.
const ARC_R_TITLE = 14;
const ARC_R_BODY = 30;

// Advance widths in em, used ONLY to decide where along the arc a token sits.
// The browser still lays the tokens out itself with the font's real metrics, so
// an error here nudges the curve — it can never move text off its baseline.
// CJK is full-width by definition; 0.56em is a bold grotesque's rough average
// for ASCII, which on this page only ever has to cover 「AI」 and 「1」.
function advance(token: string): number {
  return Array.from(token).reduce(
    (sum, ch) => sum + (ch.charCodeAt(0) < 0x2e80 ? 0.56 : 1),
    0,
  );
}

/**
 * One line of card type, set on a circle so each token sits at its own angle and
 * the line bows. A rigid rotate() on the whole block was rejected 2026-08-04
 * precisely because every character in it shares one angle.
 *
 * `dir` picks which side of the line the circle's centre is on:
 *   - 'arch' — centre BELOW. The middle of the line is the high point and the
 *     ends fall away. This is the card TITLE (approved 2026-08-05, replacing a
 *     bowl that was rejected the same morning).
 *   - 'bowl' — centre ABOVE. The middle is the low point and the ends ride up.
 *     This is the card BODY.
 * The two are exact mirrors, so one sign drives both the vertical offset and the
 * rotation. Derivation of why the rotation sign must flip with the offset:
 * docs/aiops-lp-what-card-title-arc-rev3.md §2.
 *
 * All lines of one block share a radius, so they are arcs of the SAME circle:
 * congruent parallel curves whose vertical gap stays constant wherever they
 * overlap horizontally. Do not give the lines of one block different radii.
 */
function ArcLine({
  text,
  r,
  dir,
}: {
  text: string;
  r: number;
  dir: 'arch' | 'bowl';
}) {
  const tokens = tokenize(text);
  const widths = tokens.map(advance);
  const total = widths.reduce((sum, w) => sum + w, 0);
  const sign = dir === 'arch' ? 1 : -1;
  let x = 0;

  return (
    <span className="lp-wline">
      {tokens.map((token, i) => {
        // This token's centre, in em, measured from the line's centre.
        const d = x + widths[i] / 2 - total / 2;
        x += widths[i];
        const rad = d / r;
        return (
          <span
            className="lp-warc"
            key={i}
            style={
              {
                // The baseline is tangent to the circle. On an arch it descends
                // to the right of centre (clockwise, positive); on a bowl it
                // climbs (counter-clockwise, negative). Same sign as the offset.
                '--rot': `${(sign * rad * (180 / Math.PI)).toFixed(2)}deg`,
                // SIGNED, and positive is DOWN — the CSS applies it as-is. cos
                // is even, so both ends of a line move by the same amount.
                '--arc-y': `${(sign * r * (1 - Math.cos(rad))).toFixed(3)}em`,
              } as CSSProperties
            }
          >
            {token}
          </span>
        );
      })}
    </span>
  );
}

type LpStepsProps = {
  what: LpVariant['what'];
};

export default function LpSteps({ what }: LpStepsProps) {
  return (
    <section className="lp-section lp-what-sec" aria-label="サービス内容">
      {/* Scroll budget. In live mode this is 300svh tall and the stage inside
          it is sticky, which is how the card sequence gets 100svh of scroll per
          card WITHOUT a ScrollTrigger pin — this page has no pin-spacer
          anywhere and must not gain one. With JS off this element has no height
          of its own and everything below is a plain stacked section. */}
      <div className="lp-what-scroll">
        <div className="lp-what-stage">
          <div className="lp-inner lp-what-head">
            {/* All three are split, because all three fly — see the burst in
                LpMotion. Plain inline spans, NOT inline-block: inline spans create
                no line break opportunities of their own, so the static fallback
                wraps and applies kinsoku exactly like unsplit Japanese text.
                `display: inline-block` arrives only under `.lp-what-live`. Same
                reasoning as `.lp-punch-char` in LpFlow. */}
            <p className="lp-eyebrow">
              <Split text="what we do" />
            </p>
            <h2>
              {what.heading.map((line, i) => (
                <span className="lp-line" key={i}>
                  <Split text={line} />
                </span>
              ))}
            </h2>
            <p className="lp-lead">
              <Split text={what.lead} />
            </p>
          </div>

          {/* Row 2 of the stage grid in live mode, and the only thing that
              decides where the fan sits vertically: the heading above takes
              exactly the height it needs and this takes the rest, so no number
              in lp.css has to know how tall the heading is. Outside live mode
              it is an inert wrapper. */}
          <div className="lp-what-arena">
            {/* The wheel. In live mode this <ol> IS the reference's 3675px
                square: each <li> is a full-size absolutely-stacked copy of it
                whose transform-origin is the square's centre — a hub ~1837px
                below the cards. Rotating an <li> swings its card along that
                huge, shallow arc. It stays an <ol> because these are three
                ordered stages and the order is the meaning; do NOT flatten it
                with `display: contents`, which would destroy both the list
                semantics and the geometry. */}
            <ol className="lp-what-wheel">
              {what.steps.map((step, i) => (
                <li className="lp-wslot" key={step.title}>
                  <article className={`lp-wcard lp-wcard-${i + 1}`}>
                    {/* Display title, set on an arc — see ArcLine above. One ArcLine per
                        authored line; the <strong> keeps the whole title as a single
                        accessible string. */}
                    <strong>
                      {(step.titleLines ?? [step.title]).map((line, li) => (
                        <ArcLine text={line} r={ARC_R_TITLE} dir="arch" key={li} />
                      ))}
                    </strong>
                    {/* Watermark. Duplicates the <ol>'s own numbering, so it is
                        hidden from screen readers rather than read out twice.
                        Its position HERE, between the title and the body, is
                        load-bearing: it is an in-flow flex item and the card's
                        `space-between` is what holds it clear of both. It used
                        to be absolutely positioned at `bottom: 32%`, which was a
                        constant guessing at the paragraph's height and collided
                        with it the moment the body copy grew. See
                        docs/aiops-lp-what-card-number-gap.md. */}
                    <span className="lp-wnum" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {/* Body copy, set on a bowl — the mirror of the title's
                        arch above it. One ArcLine per authored line; the <p>
                        keeps the whole paragraph as one accessible string.
                        bodyLines is required for the arc to survive a resize;
                        the fallback exists only so a step authored without it
                        still renders. */}
                    <p>
                      {(step.bodyLines ?? [step.body]).map((line, li) => (
                        <ArcLine text={line} r={ARC_R_BODY} dir="bowl" key={li} />
                      ))}
                    </p>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
