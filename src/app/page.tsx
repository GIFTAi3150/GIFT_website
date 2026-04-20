import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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
        <Reveal>
          <WhoWeAre />
        </Reveal>
        <Reveal>
          <PhotoCarousel />
        </Reveal>
        <Reveal>
          <CaseStudy />
        </Reveal>
        <Reveal>
          <ServicesCards />
        </Reveal>
        <Reveal>
          <ProcessFlow />
        </Reveal>
        <Reveal>
          <Clients />
        </Reveal>
        <Reveal>
          <SocialLinks />
        </Reveal>
        <Reveal>
          <Column articles={articles} />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
