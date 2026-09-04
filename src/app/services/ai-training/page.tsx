import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import AtPlasma from './_components/AtPlasma';
import AtHero from './_components/AtHero';
import AtStatement from './_components/AtStatement';
import AtConcerns from './_components/AtConcerns';
import AtReasons from './_components/AtReasons';
import AtFlow from './_components/AtFlow';
import AtCourses from './_components/AtCourses';
import AtPricing from './_components/AtPricing';
import AtFaq from './_components/AtFaq';
import AtCta from './_components/AtCta';
import AtScroll from './_components/AtScroll';
import './ai-training.css';

const OG_TITLE = '法人向けAI研修｜業務で使える生成AI研修';
const OG_DESCRIPTION =
  '「使ってみた」から「使いこなす」へ。業務で使える実践型の生成AI研修です。人材開発支援助成金の対象です。';

export const metadata: Metadata = {
  title: '法人向けAI研修',
  description:
    '業務で使える実践型の生成AI研修。1名から受講でき、未経験の方でも安心してご参加いただけます。人材開発支援助成金の対象です。',
  alternates: { canonical: '/services/ai-training' },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '株式会社GIFT',
    url: 'https://www.gift-inc.org/services/ai-training',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

// Redesign v8 "Plasma" (2026-09-04) — docs/ai-training-redesign-spec.md.
// Every string comes from _components/aiTrainingContent.ts.
export default function AiTrainingPage() {
  return (
    <>
      <main className="at-page" data-flash-guard="">
        {/* The plasma: one fixed OGL canvas + navy veil behind the page (z 0). */}
        <AtPlasma />

        <AtHero />
        <AtStatement />
        <AtConcerns />
        <AtReasons />
        <AtFlow />
        <AtCourses />
        <AtPricing />
        <AtFaq />
        <AtCta />

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <AtScroll />
      </main>
      {/* The plasma canvas is fixed inside <main>, and <main> is positioned —
          positioned content paints above a static sibling whatever the DOM
          order, so an unwrapped footer sits UNDER the canvas. The wrapper
          gives the footer its own positioned layer. */}
      <div className="at-footer">
        <Footer />
      </div>
    </>
  );
}
