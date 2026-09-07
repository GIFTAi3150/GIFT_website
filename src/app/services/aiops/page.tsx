import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import DxV3Page from './_components/DxV3Page';
import './dx-v3.css';

export const metadata: Metadata = {
  title: 'AIOps事業',
  description:
    '中小企業がAIを会社に根づかせるためのロードマップ。学習・実装・定着の3ステップで、AIを現場で動かす状態へ。株式会社GIFTのAIOps事業。',
  alternates: { canonical: '/services/aiops' },
};

// Page-scoped fonts.
// Gen Interface JP (SIL OFL, jsDelivr) — harmonised Inter + Noto Sans JP,
// the same typeface used by ai-ops-manager.com. Covers Latin + Japanese in
// a single family so no fallback stack is needed. "Gen Interface JP Display"
// variant is used for large headings (tighter letter-spacing).
// Inter italic (Google Fonts) is loaded for the italic accent words ONLY:
// Gen Interface JP ships no italic face, so `font-style: italic` on it
// synthesizes a faux oblique whose shear clips on mobile. Inter IS Gen
// Interface JP's Latin skeleton and HAS a real italic, so the accents render
// as a true italic with no shear/clip. Accents are Latin-only, so Inter covers
// them; Japanese subtitles are upright (.ja) and untouched.
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
        href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@1,400;1,500&family=JetBrains+Mono:wght@400;500;700&display=swap"
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

