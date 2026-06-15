import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import DxV3Page from './_components/DxV3Page';
import './dx-v3.css';

export const metadata: Metadata = {
  title: 'AIOpsäº‹æ¥­',
  description:
    'Lã‚¹ãƒ†ãƒƒãƒ—é‹ç”¨ã€RPAå°Žå…¥ã€AIæ´»ç”¨ã«ã‚ˆã‚‹æ¥­å‹™è‡ªå‹•åŒ–ã€‚ä¸­å°ä¼æ¥­ã®ãƒ‡ã‚¸ã‚¿ãƒ«å¤‰é©ã‚’æ”¯æ´ã™ã‚‹æ ªå¼ä¼šç¤¾GIFTã®AIOpsäº‹æ¥­ã€‚',
  alternates: { canonical: '/services/aiops' },
};

// Page-scoped fonts. General Sans (Fontshare) is the chunky geometric sans
// used as the headline font â€” closest free analog to juanmora.co's Goga.
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
          guard drop and snap in blankâ†’loaded instead of fading in smoothly. */}
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

