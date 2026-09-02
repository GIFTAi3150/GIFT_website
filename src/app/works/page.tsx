import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import WkHero from './_components/WkHero';
import WkLogoWall from './_components/WkLogoWall';
import WkPickup from './_components/WkPickup';
import WkCta from './_components/WkCta';

const OG_TITLE = '取引実績｜株式会社GIFT';
const OG_DESCRIPTION =
  '業種も規模も異なるお客様とともに、現場に根ざした改善を積み重ねてきました。';

export const metadata: Metadata = {
  title: '取引実績',
  description:
    '株式会社GIFTの取引実績ページ。業種も規模も異なるお客様とともに、現場に根ざした改善を積み重ねてきました。',
  alternates: { canonical: '/works' },
  // Soft launch: this URL is not yet reachable from Header/Footer nav, so it
  // will mostly be shared as a bare link. Same reasoning as /plans and
  // /services/ai-training — give it its own openGraph/twitter block rather
  // than falling back to the site-wide one in layout.tsx.
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    siteName: '株式会社GIFT',
    url: 'https://www.gift-inc.org/works',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

export default function WorksPage() {
  return (
    <>
      {/* Dark base behind the hero/CTA navy bands; the LogoWall/PickUp sections
          in between paint their own light background, so this only closes the
          gap on iOS overscroll. */}
      <main className="bg-[#0C0E1A]">
        <WkHero />
        <WkLogoWall />
        <WkPickup />
        <WkCta />
      </main>
      <Footer />
    </>
  );
}
