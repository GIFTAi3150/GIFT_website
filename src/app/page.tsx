import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import WhoWeAre from '@/components/sections/WhoWeAre';
import ServicesCards from '@/components/sections/ServicesCards';
import ServicesTypoScroll from '@/components/sections/ServicesTypoScroll';
import ProcessFlow from '@/components/sections/ProcessFlow';
import SocialLinks from '@/components/sections/SocialLinks';
import Clients from '@/components/sections/Clients';
import Column from '@/components/sections/Column';
import RecruitCta from '@/components/sections/RecruitCta';
import Reveal from '@/components/ui/Reveal';
import { getPublishedArticles } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '株式会社GIFT | Gift an opportunity',
  description:
    'コールセンター・DXコンサル・財務コンサルの3事業で、企業のチャンスを形にする。株式会社GIFTの公式サイト。',
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  let articles: { slug: string; title: string; date: string; category: string; cover?: string }[] = [];

  try {
    const notionArticles = await getPublishedArticles();
    articles = notionArticles.map((a) => ({
      slug: a.slug,
      title: a.title,
      date: a.date,
      category: a.category,
      cover: a.cover,
    }));
  } catch {
    // Notion unavailable — show empty state
  }

  return (
    <>
      <Header />
      <main>
        <Hero />

        {/* ABOUT */}
        <Reveal>
          <WhoWeAre />
        </Reveal>

        {/* HOW WE WORK */}
        <Reveal>
          <ProcessFlow />
        </Reveal>

        {/* SERVICE — ServicesCards handles its own pinned scroll-driven
            entrance, so no Reveal wrapper (Reveal applies a transform
            which would break GSAP's position: fixed pinning). */}
        <ServicesCards />

        {/* WORKS — big-typo scroll preview. Each heading links to its
            service page; a centered preview video swaps to the heading
            closest to viewport center as the user scrolls. NOT wrapped
            in Reveal because the preview uses position: fixed and a
            transformed ancestor would re-anchor it. */}
        <ServicesTypoScroll />
        <Reveal>
          <Clients />
        </Reveal>

        {/* RECRUIT — CTA with emoji rain on click (Osmo Supply pattern) */}
        <Reveal>
          <RecruitCta />
        </Reveal>

        {/* NEWS */}
        <Reveal>
          <Column articles={articles} />
        </Reveal>

        {/* CONTACT (social-adjacent) */}
        <Reveal>
          <SocialLinks />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
