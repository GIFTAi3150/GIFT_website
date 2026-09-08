import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import KhField from './_components/KhField';
import KhHero from './_components/KhHero';
import KhFeatures from './_components/KhFeatures';
import KhPricing from './_components/KhPricing';
import KhGlossary from './_components/KhGlossary';
import KhSupport from './_components/KhSupport';
import KhCta from './_components/KhCta';
import KhScroll from './_components/KhScroll';
import './plans.css';

const OG_TITLE = 'ナレッジハーネス｜社内の知識を「全社の記憶基盤」に';
const OG_DESCRIPTION =
  '社内に散らばる情報・ノウハウを構造化して蓄積し、Claude Codeから安全に引き出せる社内知識ツール。月額9万円の単一プラン。';

export const metadata: Metadata = {
  title: 'ナレッジハーネス｜料金プラン',
  description:
    '社内の知識を「全社の記憶基盤」に。ナレッジハーネスは社内に散らばる情報・ノウハウを構造化して蓄積し、Claude Codeから安全に引き出せる社内知識ツールです。月額9万円の単一プラン。',
  alternates: { canonical: '/plans' },
  // This page gets shared as a bare link (Instagram bio / DM / LINE), where the
  // preview card IS the pitch. Without a page-level openGraph block Next falls
  // back to the site-wide one in layout.tsx, so every share of this URL would
  // read「株式会社GIFT | Gift an opportunity」and the generic company blurb —
  // nothing about the product or the price.
  //
  // `title` here is the raw string, NOT the `%s | 株式会社GIFT` template: the
  // template applies to <title> only, and doubling the suffix into an OG card
  // truncates the useful half on a narrow phone.
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '株式会社GIFT',
    url: 'https://www.gift-inc.org/plans',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

// Redesign "the harnessing" (2026-09-07) — docs/knowledge-harness-redesign-spec.md.
// Every string comes from _components/khContent.ts.
export default function PlansPage() {
  return (
    <>
      <main className="kh-page" data-flash-guard="">
        {/* The field: one fixed 2D canvas behind the page (z 0). */}
        <KhField />

        <KhHero />
        <KhFeatures />
        <KhPricing />
        <KhGlossary />
        <KhSupport />
        <KhCta />

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <KhScroll />
      </main>
      {/* The field canvas is fixed inside <main>, and <main> is positioned —
          positioned content paints above a static sibling whatever the DOM
          order, so an unwrapped footer sits UNDER the canvas. The wrapper
          gives the footer its own positioned layer. */}
      <div className="kh-footer">
        <Footer />
      </div>
    </>
  );
}
