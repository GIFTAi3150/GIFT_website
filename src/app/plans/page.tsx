import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import PlansHero from './_components/PlansHero';
import PlanCard from './_components/PlanCard';
import { PLANS } from '@/data/plans';

export const metadata: Metadata = {
  title: '料金プラン',
  description:
    'AIOpsロードマップに合わせた料金プランを準備中です。株式会社GIFTのAIOps事業について、まずはお気軽にご相談ください。',
  alternates: { canonical: '/plans' },
};

// Page-scoped fonts — same set as /services/aiops (Gen Interface JP + Inter
// italic accents + JetBrains Mono), so /plans reads as part of the same
// AIOps design system rather than introducing a new one. See
// src/app/services/aiops/page.tsx `DxFontsLink` for the original.
function PlansFontsLink() {
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

export default function PlansPage() {
  return (
    <>
      <PlansFontsLink />
      <PlansHero />

      <section className="bg-[#f5f7ff] px-4 pb-24 md:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-1 gap-6 min-[901px]:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.label} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
