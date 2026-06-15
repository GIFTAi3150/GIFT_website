import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import HeroScene from './_components/HeroScene';
import ScrollMarquee from './_components/ScrollMarquee';
import PinnedNumbers from './_components/PinnedNumbers';
import DayInLifeDeck from './_components/DayInLifeDeck';
import PerksCube from './_components/PerksCube';
import RecruitFunnel from './_components/RecruitFunnel';
import './twilight.css';

export const metadata: Metadata = {
  title: 'コールセンター事業',
  description:
    '株式会社GIFTのコールセンター事業を、はたらく場所として紹介します。アウトバウンド特化、自社運営、300名+の体制。',
  alternates: { canonical: '/services/callcenter' },
};

export default function CallCenterPage() {
  return (
    <>
      <main className="twilight-scope">
        <HeroScene />
        <ScrollMarquee />
        <PinnedNumbers />
        <DayInLifeDeck />
        <PerksCube />
        <ScrollMarquee />
        <RecruitFunnel />
      </main>
      <Footer />
    </>
  );
}
