import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import WkHero from './_components/WkHero';
import WkLogoWall from './_components/WkLogoWall';
import WkPickup from './_components/WkPickup';
import WkCta from './_components/WkCta';

// 【要確認】「掲載のご承諾をいただいた」は承諾企業確定が前提（worksContent.ts HERO.body と同じ
// 未確認クレーム）。ここは metadata なのでページ内の「※仮」注記なしでリンクプレビューに露出する
// ため、公開前に承諾済み企業リストの確定を要確認。
const OG_TITLE = '取引実績｜株式会社GIFT';
const OG_DESCRIPTION =
  '業種も規模も異なるお客様の現場を支援してきました。掲載のご承諾をいただいた企業様をご紹介します。';

export const metadata: Metadata = {
  title: '取引実績',
  description:
    '株式会社GIFTの取引実績ページ。業種も規模も異なるお客様の現場を支援してきました。掲載のご承諾をいただいた企業様をご紹介します。',
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
