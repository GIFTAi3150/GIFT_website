import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import DxV3Page from './_components/DxV3Page';
import './dx-v3.css';

export const metadata: Metadata = {
  title: 'AIOps事業',
  description:
    'Lステップ運用、RPA導入、AI活用による業務自動化。中小企業のデジタル変革を支援する株式会社GIFTのAIOps事業。',
  alternates: { canonical: '/services/aiops' },
};

// Page-scoped fonts.
// Gen Interface JP (SIL OFL, jsDelivr) — harmonised Inter + Noto Sans JP,
// the same typeface used by ai-ops-manager.com. Covers Latin + Japanese in
// a single family so no fallback stack is needed. "Gen Interface JP Display"
// variant is used for large headings (tighter letter-spacing).
// JetBrains Mono is kept for terminal/code labels only.
function DxFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/gen-interface-jp@latest/cdn/all.css"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
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

