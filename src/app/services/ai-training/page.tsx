import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import AtHero from './_components/AtHero';
import AtPains from './_components/AtPains';
import AtReasons from './_components/AtReasons';
import AtSteps from './_components/AtSteps';
import AtCourses from './_components/AtCourses';
import AtPricing from './_components/AtPricing';
import AtFaq from './_components/AtFaq';
import AtCta from './_components/AtCta';

const OG_TITLE = '法人向けAI研修｜業務で使える生成AI研修';
const OG_DESCRIPTION =
  '「使ってみた」から「使いこなす」へ。業務で使える実践型の生成AI研修です。人材開発支援助成金の対象です。';

export const metadata: Metadata = {
  title: '法人向けAI研修',
  description:
    '業務で使える実践型の生成AI研修。1名から受講でき、未経験の方でも安心してご参加いただけます。人材開発支援助成金の対象です。',
  alternates: { canonical: '/services/ai-training' },
  // Soft launch: this URL is not yet reachable from Header/Footer nav, so it will
  // mostly be shared as a bare link. Same reasoning as /plans — give it its own
  // openGraph/twitter block rather than falling back to the site-wide one.
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

export default function AiTrainingPage() {
  return (
    <>
      {/* Dark base behind the hero/CTA bands; the intervening sections paint their
          own light backgrounds, so this only closes the gap on iOS overscroll. */}
      <main className="bg-[#0C0E1A]">
        <AtHero />
        <AtPains />
        <AtReasons />
        <AtSteps />
      <AtCourses />
        <AtPricing />
        <AtFaq />
        <AtCta />
      </main>
      <Footer />
    </>
  );
}
