import Image from 'next/image';
import Link from 'next/link';
import { CARD_SURFACE_CLASS } from './PlanCardFace';
import type { Plan } from '@/data/plans';

// Static grid card for /plans — replaced the interactive carousel on
// 2026-07-31 (manager feedback: cards must be visible instantly, zero
// interaction). Server component: nothing here is hidden behind a click or a
// drag, so there is no client-side state to manage.
//
// Reuses the carousel's visual vocabulary (grey card surface, mono labels,
// hairline-ruled spec sheet) so this reads as the same design system —
// PlanCardStack.tsx / PlanCardFace.tsx are retired but kept on disk, not
// deleted, in case the carousel is ever wanted back.

const INK = '#F4F5F7';
const MUTED = '#A8AEB6';
const RULE = 'rgba(255,255,255,0.13)';
// The hero's CTA pink, used once per card as a 5px marker beside the label.
const ACCENT = '#FF4D6D';

const MONO = '"JetBrains Mono", ui-monospace, monospace';
const JP = '"Gen Interface JP", sans-serif';

export default function PlanCard({ plan }: { plan: Plan }) {
  // Pre-fills the contact form's enquiry type AND the specific plan
  // (see src/app/contact/page.tsx, which reads both params in its
  // location.search effect). `dx` is the existing option value for
  // 「AIOps事業について」 — all three /plans cards are AIOps services, so
  // every card uses the same enquiry type and only the plan differs. The
  // plan itself is carried by its stable `slug`, not its name — /contact
  // looks the slug up in PLANS (src/data/plans.ts) to build the message.
  const href = `/contact?inquiry=dx&plan=${plan.slug}`;

  return (
    // `h-full`: grid items stretch, and all three cards must end level —
    // the price block below pins to the bottom of this column with `mt-auto`.
    <article className={`${CARD_SURFACE_CLASS} flex h-full flex-col overflow-hidden rounded-xl`}>
      {/* Photo band, full colour — no greyscale. The carousel greyed this out
          so opening a card rewarded you with the real photo; there is no
          open state here, so the photo is just shown as-is. */}
      <div className="relative aspect-[16/10]">
        <Image
          src={plan.image}
          alt=""
          fill
          sizes="(max-width: 900px) 92vw, 380px"
          className="object-cover"
        />
        {/* Dissolves the photo's bottom edge into the card. */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(35,38,41,0) 45%, rgba(35,38,41,0.92) 100%)',
          }}
        />
      </div>

      <div className="flex flex-1 flex-col p-7">
        <div className="flex items-center gap-2">
          <span className="h-[5px] w-[5px] shrink-0" style={{ background: ACCENT }} />
          <span
            className="uppercase font-medium"
            style={{ color: MUTED, fontFamily: MONO, fontSize: '11px', letterSpacing: '0.2em' }}
          >
            {plan.label}
          </span>
        </div>

        <p
          className="font-bold"
          style={{
            color: INK,
            fontFamily: JP,
            fontSize: '22px',
            lineHeight: 1.3,
            marginTop: '14px',
            textWrap: 'balance',
          }}
        >
          {plan.name}
        </p>

        <p
          style={{
            color: MUTED,
            fontFamily: JP,
            fontSize: '13px',
            lineHeight: 1.8,
            marginTop: '12px',
            textWrap: 'balance',
          }}
        >
          {plan.summary}
        </p>

        {/* Hairline-ruled spec sheet — not a feature list with ticks. */}
        <dl style={{ marginTop: '24px', marginBottom: '22px' }}>
          {plan.specs.map((spec) => (
            <div
              key={spec.k}
              className="flex items-baseline justify-between gap-4"
              style={{ borderTop: `1px solid ${RULE}`, padding: '11px 0' }}
            >
              <dt style={{ color: MUTED, fontFamily: JP, fontSize: '12px' }}>{spec.k}</dt>
              <dd
                className="text-right tabular-nums"
                style={{ color: INK, fontFamily: JP, fontSize: '12px' }}
              >
                {spec.v}
              </dd>
            </div>
          ))}
        </dl>

        {/* Pinned to the bottom of the card so all three price rows sit on the
            same line however long each summary runs.

            ⚠️ `marginTop` MUST be the inline `auto`, and the minimum gap above
            it belongs on the <dl>'s marginBottom — NOT here. This was written
            as `className="mt-auto"` plus `style={{ marginTop: '22px' }}`, and
            the inline value silently beat the class (inline styles always win
            over Tailwind), so the auto-margin never applied and the block just
            sat 22px under the specs. It looked correct only because all three
            summaries happen to wrap to exactly two lines today — the first
            copy edit in planData.ts would have knocked the prices out of
            alignment with no obvious cause. */}
        <div
          className="flex items-baseline justify-between gap-4"
          style={{ borderTop: `1px solid ${RULE}`, marginTop: 'auto', paddingTop: '18px' }}
        >
          <span style={{ color: MUTED, fontFamily: JP, fontSize: '12px' }}>
            {plan.priceCaption}
          </span>
          <span
            className="flex items-baseline whitespace-nowrap"
            style={{ color: INK, fontFamily: MONO, fontSize: '34px', lineHeight: 1 }}
          >
            <span style={{ fontSize: '0.6em', marginRight: '0.12em' }}>¥</span>
            <span className="font-medium tabular-nums">{plan.price}</span>
            <span style={{ color: MUTED, fontSize: '0.48em', marginLeft: '0.14em' }}>〜</span>
          </span>
        </div>

        {/* Per-card CTA — replaced the single hero CTA (2026-07-31): each
            card now links to /contact with both the enquiry type and this
            specific plan pre-filled. `marginTop: 'auto'` on the price block
            above pins the price + CTA pair together at the card's bottom.

            Same pink pill as the old hero CTA, copied here before it was
            deleted there — same roll-mask hover, `w-full` instead of the
            hero's intrinsic width so it fills this content column.

            `next/link`, NOT a bare <a>. A bare anchor is a full document
            reload, which re-raises the SSR `#page-cover` in layout.tsx — a
            solid panel at z-9999 that only lifts on `window.load` + 100ms
            (or its 3s cap, then a 500ms fade). /contact is dark navy, so on
            a throttled phone that reads as a blank page. A client-side
            navigation never raises the cover at all. */}
        <Link
          href={href}
          aria-label={`${plan.name}について相談する`}
          className="group inline-flex w-full items-center justify-center rounded-full bg-[#FF4D6D] px-8 py-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2b2f35]"
          style={{ marginTop: '18px' }}
        >
          {/* Roll mask. `leading-[1.5]` on BOTH copies, not `leading-none`:
              a Japanese line box clipped to the glyph height shaves the
              tops of 談/相 inside `overflow-hidden`. The incoming copy is
              positioned `inset-0` so it inherits the mask's exact height
              and can never land a pixel off. */}
          <span className="relative block overflow-hidden">
            <span className="block text-[15px] font-bold leading-[1.5] transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-full">
              このプランを相談する
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 block translate-y-full text-[15px] font-bold leading-[1.5] transition-transform duration-[600ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0"
            >
              このプランを相談する
            </span>
          </span>
        </Link>
      </div>
    </article>
  );
}
