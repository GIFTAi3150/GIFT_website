import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import WhoWeAre from '@/components/sections/WhoWeAre';
import CaseStudy from '@/components/sections/CaseStudy';
import WheelScroll from '@/components/sections/WheelScroll';
import Column from '@/components/sections/Column';
import AIOps from '@/components/sections/AIOps';
import HPAbout from '@/components/sections/HPAbout';
import HPCases from '@/components/sections/HPCases';
import RecruitCta from '@/components/sections/RecruitCta';
import Reveal from '@/components/ui/Reveal';
import { getPublishedArticles, getPublishedMembers } from '@/lib/notion';
import staticMembersData from '@/data/members.json';

// ISR: page is statically cached and regenerated in the background at most
// once per minute. The Notion-backed content on / (articles + member
// previews) doesn't need per-request freshness — a 60-second window is
// invisible to humans and gives us instant nav-back instead of a full
// server roundtrip + two sequential Notion API calls every visit.
export const revalidate = 60;

export const metadata: Metadata = {
  title: '株式会社GIFT | Gift an opportunity',
  description:
    'AIを、会社に根づかせる。学習から実装、定着まで——人とAIが一緒に成果を出す環境をつくる、株式会社GIFTのAIOps。',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  let articles: { slug: string; title: string; date: string; category: string; cover?: string }[] = [];
  let membersData: typeof staticMembersData = staticMembersData;

  // Run both Notion fetches in parallel. Promise.allSettled lets each one
  // fail independently — if Notion is down for articles we still try for
  // members and vice versa, matching the prior per-call try/catch behavior.
  const [articlesResult, membersResult] = await Promise.allSettled([
    getPublishedArticles(),
    getPublishedMembers(),
  ]);

  if (articlesResult.status === 'fulfilled') {
    articles = articlesResult.value.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      category: a.category,
      cover: a.cover,
    }));
  }

  if (membersResult.status === 'fulfilled' && membersResult.value.length > 0) {
    membersData = membersResult.value.map((m) => ({
      id: m.id,
      name: m.name,
      nameEn: m.nameEn,
      role: m.role,
      department: m.department,
      image: m.image,
      bio: m.bio ?? '',
    }));
  }

  return (
    <>
      <main>
        <Hero />

        {/* ABOUT */}
        <Reveal>
          <WhoWeAre />
        </Reveal>

        {/* OUR PHILOSOPHY — scroll-pinned rotating wheel (no Reveal: manages its own sticky scroll) */}
        <WheelScroll />

        {/* ABOUT */}
        <HPAbout />

        {/* AIOPS — scroll-pinned cascade + giant text */}
        <AIOps />

        {/* CASES */}
        <HPCases />

        {/* SERVICE — hidden */}
        {/* WORKS — hidden */}
        {/* MEMBERS — hidden */}

        {/* RECRUIT — hidden */}
        {/* NEWS — hidden */}
        {/* SOCIAL — hidden */}
      </main>
      <Footer />
    </>
  );
}
