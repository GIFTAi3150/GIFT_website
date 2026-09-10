import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import WebDevelopmentHero from './_components/WebDevelopmentHero';
import WdManifesto from './_components/WdManifesto';
import WdWorries from './_components/WdWorries';
import WdIncluded from './_components/WdIncluded';
import WdPrepare from './_components/WdPrepare';
import WdPages from './_components/WdPages';
import WdCompare from './_components/WdCompare';
import WdApproach from './_components/WdApproach';
import WdPlans from './_components/WdPlans';
import WdTerms from './_components/WdTerms';
import WdFlow from './_components/WdFlow';
import WdFaq from './_components/WdFaq';
import WdClosing from './_components/WdClosing';
import WdScroll from './_components/WdScroll';
import './web-development.css';

export const metadata: Metadata = {
  title: 'ホームページ制作・保守',
  description:
    '初期費用0円、月額3万円。オリジナルデザインのホームページ制作からサーバー・ドメイン・SSL管理、公開後の更新まで株式会社GIFTがまとめて対応します。',
  alternates: { canonical: '/services/web-development' },
};

// "The Build" (2026-09-09) — docs/web-development-redesign-spec.md.
// Every string below the hero comes from _components/wdContent.ts.
export default function WebDevelopmentPage() {
  return (
    <>
      <main className="wd-page" data-flash-guard="">
        <noscript>
          <style>{`#page-cover { display: none !important; }
            .wd-page[data-flash-guard] section { visibility: visible !important; }
            .wd-page[data-flash-guard]::after { display: none !important; }
            [data-time-travel] button { display: none; }`}</style>
        </noscript>

        <WebDevelopmentHero />
        <WdManifesto />
        <WdWorries />
        <WdIncluded />
        <WdPrepare />
        <WdPages />
        <WdCompare />
        <WdApproach />
        <WdPlans />
        <WdTerms />
        <WdFlow />
        <WdFaq />
        <WdClosing />

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <WdScroll />
      </main>
      <div className="wd-footer">
        <Footer creditsHref="/models/earth/credits.txt" />
      </div>
    </>
  );
}
