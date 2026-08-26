import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import PlansHero from './_components/PlansHero';
import KhFeatures from './_components/KhFeatures';
import KhPricing from './_components/KhPricing';
import KhGlossary from './_components/KhGlossary';
import KhSupport from './_components/KhSupport';
import KhCta from './_components/KhCta';

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

export default function PlansPage() {
  return (
    <>
      {/* Dark base behind every section. Each section paints its own band on top;
          this only guarantees no light seam shows through between them, and covers
          the overscroll area on iOS. */}
      <main className="bg-[#0b1020]">
        <PlansHero />
        <KhFeatures />
        <KhPricing />
        <KhGlossary />
        <KhSupport />
        <KhCta />
      </main>
      <Footer />
    </>
  );
}
