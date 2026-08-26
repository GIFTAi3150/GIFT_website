import Image from 'next/image';
import type { Plan } from '@/data/plans';

// What is actually printed on a /plans reel card, in two sizes:
//   'reel'  — the card in the carousel (as small as ~150px wide on desktop)
//   'panel' — the same card after it is clicked open (up to 1120px wide)
//
// SIZING: THE REEL FACE IS MEASURED IN `cqw`, NOT px.
// 1cqw = 1% of the card's own width, so every value below is a proportion of
// the card rather than a fixed size. That matters because the same markup has
// to look right across a 3× range of card widths — ~150px on a 1000px-wide
// desktop window, ~220px on a large monitor, up to 500px on a phone — and the
// desktop card is additionally scaled 1.4× by GSAP while it holds the
// spotlight. With proportions, checking that the type fits ONCE proves it fits
// at every size; with px it would have to be re-checked at each, and a value
// that fits the big card overflows the small one. Nothing here is capped for
// exactly that reason: a cap would break the proportion and reintroduce the
// overflow it was meant to avoid.
//
// Fit budget at the reel size, in cqw (card width = 100, height = 56.25):
//   text column = 100 − 6.4 (left padding) − 40 (right padding, clearing the
//   photo band) = 53.6 wide, 43.4 tall.
//   widest line   = the name, 7 full-width JP characters at 6.8cqw = 47.6 ✓
//   tallest stack = label 4.8 + name 10.9 + caption 5.8 + figure 9.2 = 30.7,
//                   or 39.2 if the name takes two lines ✓
// Those two are why the photo band is 38% and not the 44% it started at: the
// wider band left the name overflowing its column at every size.
//
// The panel is laid out separately (see PanelFace) because it is a different
// shape — 16:9 and wide on desktop, but portrait on a phone — so one set of
// proportions cannot serve both.

// Deliberately ONE `sizes` string for both faces. The reel card and the opened
// panel show the same file, so giving them different hints would make next/image
// request two different widths of it and download the photo twice.
const IMG_SIZES = '(max-width: 900px) 50vw, 480px';

// Grey, per the manager's call (2026-07-31) — it replaced a flat navy #0b1340.
// A gradient rather than a flat fill so the reel's cards don't read as a stack
// of identical grey slabs: the top-left corner catches light, the bottom-right
// falls away. `ring-inset` is a hairline border drawn inside the radius (a real
// border would have to be subtracted from the card's aspect box).
//
// ⚠️ CLASSES, NOT AN INLINE `style` OBJECT — and it must stay that way.
// The mobile branch of PlanCardStack clears GSAP's leftover desktop transforms
// off these cards, and GSAP's `clearProps` implementation for the properties it
// does not recognise individually is literally `style.cssText = ""`: it wipes
// the element's ENTIRE inline style attribute, React's included. As an inline
// style this gradient was erased on every mobile card the moment that ran, and
// since React's virtual DOM still believed the style was applied it never put
// it back — so the cards rendered with no background at all and read as white
// blanks against the pale hero. (That branch now clears only the three specific
// properties it owns, which fixes it from the other side too, but a class can't
// be wiped by any of this in the first place.)
export const CARD_SURFACE_CLASS =
  'bg-[linear-gradient(158deg,#4B5058_0%,#33383F_44%,#232629_100%)] ring-1 ring-inset ring-white/10';

const INK = '#F4F5F7';
const MUTED = '#A8AEB6';
const RULE = 'rgba(255,255,255,0.13)';
// The hero's CTA pink, used once per card as a 5px marker beside the label.
// One accent, one place — the rest of the card stays monochrome.
const ACCENT = '#FF4D6D';

// Already loaded by the page (see PlansFontsLink in src/app/plans/page.tsx),
// which pulls JetBrains Mono + Gen Interface JP for the AIOps design system.
// Mono carries the labels and the figures, Gen Interface JP the Japanese.
const MONO = '"JetBrains Mono", ui-monospace, monospace';
const JP = '"Gen Interface JP", sans-serif';

export default function PlanCardFace({
  plan,
  variant = 'reel',
}: {
  plan: Plan;
  variant?: 'reel' | 'panel';
}) {
  return variant === 'panel' ? <PanelFace plan={plan} /> : <ReelFace plan={plan} />;
}

// ---------------------------------------------------------------------------

function ReelFace({ plan }: { plan: Plan }) {
  return (
    // `pointer-events-none`: the reel decides drag-vs-tap from the event's
    // target (`closest('[data-card]')`) and a drag is cancelled by
    // preventDefault on the card. Letting the face swallow events would put
    // text nodes and an <img> in the way of both.
    <div
      className="pointer-events-none absolute inset-0 select-none"
      style={{ containerType: 'inline-size' }}
    >
      {/* Photo band, bled to the top/right/bottom edges — the card's own
          overflow-hidden clips it to the corner radius. Greyscale here and in
          colour once opened, so clicking a card is rewarded with the real
          photograph. */}
      <div className="absolute inset-y-0 right-0 w-[38%]">
        <Image
          src={plan.image}
          alt=""
          fill
          sizes={IMG_SIZES}
          draggable={false}
          className="object-cover"
          style={{ filter: 'grayscale(1) contrast(1.05)', opacity: 0.82 }}
        />
        {/* Dissolves the photo's left edge into the card so it reads as part of
            the card rather than a pasted-on rectangle. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #33383F 0%, rgba(51,56,63,0.72) 38%, rgba(35,38,41,0.10) 100%)',
          }}
        />
      </div>

      <div
        className="absolute inset-0 flex flex-col justify-between"
        style={{ padding: '6.4cqw', paddingRight: '40%' }}
      >
        <div>
          <div className="flex items-center" style={{ gap: '1.8cqw' }}>
            <span
              className="shrink-0"
              style={{ width: '1.4cqw', height: '1.4cqw', background: ACCENT }}
            />
            <span
              className="whitespace-nowrap font-medium uppercase"
              style={{
                color: MUTED,
                fontFamily: MONO,
                fontSize: '4cqw',
                letterSpacing: '0.18em',
                lineHeight: 1.2,
              }}
            >
              {plan.label}
            </span>
          </div>
          <p
            className="font-bold"
            style={{
              color: INK,
              fontFamily: JP,
              fontSize: '6.8cqw',
              lineHeight: 1.25,
              marginTop: '2.4cqw',
              // Standing rule on this project: short Japanese lines must not be
              // allowed to drop a single trailing character onto its own line.
              textWrap: 'balance',
            }}
          >
            {plan.name}
          </p>
        </div>

        <div>
          <p
            style={{
              color: MUTED,
              fontFamily: JP,
              fontSize: '3.4cqw',
              lineHeight: 1.3,
              marginBottom: '1.4cqw',
            }}
          >
            {plan.priceCaption}
          </p>
          <p
            className="flex items-baseline whitespace-nowrap"
            style={{ color: INK, fontFamily: MONO, fontSize: '9.2cqw', lineHeight: 1 }}
          >
            <span style={{ fontSize: '0.62em', marginRight: '0.12em' }}>¥</span>
            <span className="font-medium tabular-nums">{plan.price}</span>
            <span style={{ color: MUTED, fontSize: '0.5em', marginLeft: '0.14em' }}>〜</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PanelFace({ plan }: { plan: Plan }) {
  return (
    // Mobile: photo on top, content under it (the panel is portrait there).
    // Desktop (901px+): photo right, content left, in a 16:9 box. The
    // breakpoint matches the one the reel itself switches on — the mobile
    // panel only ever exists below it.
    <div
      className="absolute inset-0 flex select-none flex-col min-[901px]:flex-row"
      style={{ containerType: 'inline-size' }}
    >
      <div className="relative order-1 h-[38%] shrink-0 min-[901px]:order-2 min-[901px]:h-auto min-[901px]:w-[42%]">
        <Image
          src={plan.image}
          alt=""
          fill
          sizes={IMG_SIZES}
          draggable={false}
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(35,38,41,0) 55%, rgba(35,38,41,0.85) 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden min-[901px]:block"
          style={{
            background:
              'linear-gradient(90deg, #33383F 0%, rgba(51,56,63,0.55) 30%, rgba(35,38,41,0) 70%)',
          }}
        />
      </div>

      <div
        className="order-2 flex min-h-0 flex-1 flex-col min-[901px]:order-1"
        style={{ padding: 'clamp(18px, 3cqw, 46px)' }}
      >
        <div className="flex items-center" style={{ gap: 'clamp(6px, 0.7cqw, 10px)' }}>
          <span
            className="shrink-0"
            style={{
              width: 'clamp(5px, 0.5cqw, 7px)',
              height: 'clamp(5px, 0.5cqw, 7px)',
              background: ACCENT,
            }}
          />
          <span
            className="font-medium uppercase"
            style={{
              color: MUTED,
              fontFamily: MONO,
              fontSize: 'clamp(10px, 1.15cqw, 14px)',
              letterSpacing: '0.2em',
            }}
          >
            {plan.label}
          </span>
        </div>

        <p
          className="font-bold"
          style={{
            color: INK,
            fontFamily: JP,
            fontSize: 'clamp(21px, 3.1cqw, 40px)',
            lineHeight: 1.2,
            marginTop: 'clamp(8px, 1.2cqw, 18px)',
            textWrap: 'balance',
          }}
        >
          {plan.name}
        </p>

        {/* Desktop only: the phone-sized panel is ~305×381 and this line is the
            one element it can lose without leaving a hole — the spec rows and
            the price carry the actual information. */}
        <p
          className="hidden min-[901px]:block"
          style={{
            color: MUTED,
            fontFamily: JP,
            fontSize: 'clamp(12px, 1.25cqw, 16px)',
            lineHeight: 1.7,
            marginTop: 'clamp(8px, 1cqw, 16px)',
            maxWidth: '34em',
            textWrap: 'balance',
          }}
        >
          {plan.summary}
        </p>

        {/* Spec rows as a hairline-ruled table — a spec sheet, not a feature
            list with ticks. */}
        <dl className="mt-auto" style={{ paddingTop: 'clamp(12px, 1.6cqw, 26px)' }}>
          {plan.specs.map((spec) => (
            <div
              key={spec.k}
              className="flex items-baseline justify-between gap-4"
              style={{
                borderTop: `1px solid ${RULE}`,
                padding: 'clamp(6px, 0.8cqw, 12px) 0',
              }}
            >
              <dt
                style={{
                  color: MUTED,
                  fontFamily: JP,
                  fontSize: 'clamp(10px, 1.1cqw, 14px)',
                }}
              >
                {spec.k}
              </dt>
              <dd
                className="text-right tabular-nums"
                style={{
                  color: INK,
                  fontFamily: JP,
                  fontSize: 'clamp(10px, 1.1cqw, 14px)',
                }}
              >
                {spec.v}
              </dd>
            </div>
          ))}
        </dl>

        <div
          className="flex items-baseline justify-between gap-4"
          style={{
            borderTop: `1px solid ${RULE}`,
            marginTop: 'clamp(10px, 1.4cqw, 22px)',
            paddingTop: 'clamp(10px, 1.4cqw, 22px)',
          }}
        >
          <span
            style={{
              color: MUTED,
              fontFamily: JP,
              fontSize: 'clamp(10px, 1.1cqw, 14px)',
            }}
          >
            {plan.priceCaption}
          </span>
          <span
            className="flex items-baseline whitespace-nowrap"
            style={{
              color: INK,
              fontFamily: MONO,
              fontSize: 'clamp(26px, 3.6cqw, 50px)',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: '0.6em', marginRight: '0.12em' }}>¥</span>
            <span className="font-medium tabular-nums">{plan.price}</span>
            <span style={{ color: MUTED, fontSize: '0.48em', marginLeft: '0.14em' }}>〜</span>
          </span>
        </div>
      </div>
    </div>
  );
}
