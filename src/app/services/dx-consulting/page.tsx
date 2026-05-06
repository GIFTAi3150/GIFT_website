import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import DxV3Page from './_components/DxV3Page';
import './dx-v3.css';

export const metadata: Metadata = {
  title: 'DXコンサル事業',
  description:
    'Lステップ運用、RPA導入、AI活用による業務自動化。中小企業のデジタル変革を支援する株式会社GIFTのDXコンサルティング事業。',
  alternates: { canonical: '/services/dx-consulting' },
};

// Page-scoped fonts loaded via Google Fonts. The dx-v3 design references the
// literal family names directly in dx-v3.css (Space Grotesk / JetBrains Mono /
// Shippori Mincho), so we let Next.js hoist the <link> tags into the document
// head only when this route is rendered.
function DxFontsLink() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@400;500;700&family=Shippori+Mincho:wght@400;500;700&display=swap"
      />
    </>
  );
}

export default function DxConsultingPage() {
  return (
    <>
      <DxFontsLink />
      <Header />
      <DxV3Page />
      <Footer />
    </>
  );
}
