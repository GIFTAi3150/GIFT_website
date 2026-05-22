import type { Metadata } from 'next';
import AchievementsClient from './_components/AchievementsClient';

export const metadata: Metadata = {
  title: '軌跡・実績 | Achievements',
  description:
    '株式会社GIFTの8年間の軌跡。312名超の組織・3事業・184件のプロジェクト・受賞実績をご紹介します。',
  alternates: { canonical: '/achievements' },
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}
