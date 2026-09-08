import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import EvolveField from './_components/EvolveField';
import AoHero from './_components/AoHero';
import AoCaps from './_components/AoCaps';
import AoPains from './_components/AoPains';
import AoSteps from './_components/AoSteps';
import AoAgents from './_components/AoAgents';
import AoThinking from './_components/AoThinking';
import AoCta from './_components/AoCta';
import AoScroll from './_components/AoScroll';
import './aiops.css';

export const metadata: Metadata = {
  title: 'AIOps事業',
  description:
    '中小企業がAIを会社に根づかせるためのロードマップ。学習・実装・定着の3ステップで、AIを現場で動かす状態へ。株式会社GIFTのAIOps事業。',
  alternates: { canonical: '/services/aiops' },
};

// Redesign "Groundwork" (2026-09-07) — docs/aiops-groundwork-redesign-spec.md.
// Every string comes from _components/aoContent.ts.
export default function AiOpsPage() {
  return (
    <>
      <main className="ao-page" data-flash-guard="">
        {/* The ground: one fixed Evolve mountain plate behind the page (z 0). */}
        <EvolveField />

        <AoHero />
        <AoCaps />
        <AoPains />
        <AoSteps />
        <AoAgents />
        <AoThinking />
        <AoCta />

        {/* Orchestrator LAST: its effect must run after every section above. */}
        <AoScroll />
      </main>
      {/* The plate is fixed inside <main>, and <main> is positioned — positioned
          content paints above a static sibling whatever the DOM order, so an
          unwrapped footer would sit UNDER the plate. */}
      <div className="ao-footer">
        <Footer />
      </div>
    </>
  );
}
