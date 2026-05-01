import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import Hero from '@/components/sections/Hero';
import PhotoCarousel from '@/components/sections/PhotoCarousel';
import WhoWeAre from '@/components/sections/WhoWeAre';
import CaseStudy from '@/components/sections/CaseStudy';
import ServicesCards from '@/components/sections/ServicesCards';
import ProcessFlow from '@/components/sections/ProcessFlow';
import SocialLinks from '@/components/sections/SocialLinks';
import Clients from '@/components/sections/Clients';
import Column from '@/components/sections/Column';
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

        {/* SERVICE */}
        <Reveal>
          <ServicesCards />
        </Reveal>
        <Reveal>
          <ProcessFlow />
        </Reveal>

        {/* WORKS */}
        <Reveal>
          <CaseStudy />
        </Reveal>
        <Reveal>
          <Clients />
        </Reveal>

        {/* MEMBER */}
        <Reveal>
          <PhotoCarousel />
        </Reveal>

        {/* RECRUIT — minimal CTA strip linking to the dedicated /recruit page */}
        <Reveal>
          <section className="border-t border-gift-border bg-white py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-6 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                RECRUIT
              </p>
              <Link href="/recruit" className="cta-btn cta-btn--deep">
                <span>採用情報を見る</span>
              </Link>
            </div>
          </section>
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
