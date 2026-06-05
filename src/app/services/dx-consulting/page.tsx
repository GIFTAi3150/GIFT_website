import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import DxV3Page from './_components/DxV3Page';
import './dx-v3.css';

export const metadata: Metadata = {
  title: 'AIOps事業',
  description:
    'Lステップ運用、RPA導入、AI活用による業務自動化。中小企業のデジタル変革を支援する株式会社GIFTのAIOps事業。',
  alternates: { canonical: '/services/dx-consulting' },
};

// Page-scoped fonts. General Sans (Fontshare) is the chunky geometric sans
// used as the headline font — closest free analog to juanmora.co's Goga.
// The Latin subset of dx-v3 type uses 'General Sans'; Japanese still falls
// through to Noto Sans JP (kanji not in General Sans). Instrument Serif
// stays for italic emphasis, JetBrains Mono for tech labels.
function DxFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=general-sans@300,400,500,600,700&display=swap"
      />
    </>
  );
}

export default function DxConsultingPage() {
  return (
    <>
      {/* Preload manifesto-scene PNGs so they're cached by the time the flash
          guard releases. Without this, first-visit images arrive after the
          guard drop and snap in blank→loaded instead of fading in smoothly. */}
      <link rel="preload" href="/spline/cylinder.png" as="image" />
      <link rel="preload" href="/spline/sphere.png" as="image" />
      <link rel="preload" href="/spline/pill.png" as="image" />
      <link rel="preload" href="/spline/cube2.png" as="image" />
      <DxFontsLink />
      <DxV3Page />
      <Footer />
    </>
  );
}
