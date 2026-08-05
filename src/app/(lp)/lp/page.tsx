import type { Metadata } from 'next';
import { LP_VARIANTS, LP_SLUGS } from '@/data/lp-variants';
import LpHero from './_components/LpHero';
import LpFlow from './_components/LpFlow';
import LpSteps from './_components/LpSteps';
import LpCta from './_components/LpCta';
import LpMotion from './_components/LpMotion';

// ONE page carrying BOTH concepts, stacked (user's call, 2026-07-31 — they did
// not want them split across two URLs).
//
// Worth writing down, because it will look wrong to anyone who knows how LPs
// normally work: A and B are two DIFFERENT sales messages, each intended to be
// the destination of its own video ad. For live ad traffic they would have to
// be separate URLs, otherwise a visitor arriving on the 人材 hook immediately
// scrolls into the 社長 hook and neither lands. Stacked like this the page is a
// REVIEW artefact — it exists so the manager can see both in one link.
//
// If/when ads actually run, split this back into `lp/[variant]/page.tsx`
// (it was built that way first; see git history). The components below are all
// data-driven off LP_VARIANTS, so the split is a routing change only — no
// component or CSS work.
export const metadata: Metadata = {
  title: 'AIエージェントLP 訴求案',
  description: 'A案 人材系訴求 / B案 社長待ち訴求 の2案を1ページにまとめた確認用ページです。',
};

export default function LpPage() {
  return (
    <>
      {/* Scroll motion for every section below the hero. Mounted once and
          selector-driven, so the sections below stay server components — see
          the doc comment in LpMotion.tsx. */}
      <LpMotion />
      {LP_SLUGS.map((slug) => {
        const data = LP_VARIANTS[slug];
        return (
          <section key={slug} aria-label={data.conceptName} data-lp-variant={slug}>
            {/* No visible concept label. The `.lp-concept-tag` bar that named
                「A案 / B案」 here, and carried the 「動画はサンプルです」 note,
                was removed on the user's instruction (2026-08-05) — on a phone
                it read as a stray black band between the two films. The concept
                name survives on the section's aria-label and in
                `data-lp-variant` for anyone inspecting the page. */}
            <LpHero hero={data.hero} />
            <LpFlow flow={data.flow} />
            <LpSteps what={data.what} />
            <LpCta />
          </section>
        );
      })}
    </>
  );
}
