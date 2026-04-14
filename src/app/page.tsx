import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import PhotoCarousel from '@/components/sections/PhotoCarousel';
import WhoWeAre from '@/components/sections/WhoWeAre';
import CaseStudy from '@/components/sections/CaseStudy';
import ServicesCards from '@/components/sections/ServicesCards';
import SocialLinks from '@/components/sections/SocialLinks';
import Clients from '@/components/sections/Clients';
import Column from '@/components/sections/Column';
import Reveal from '@/components/ui/Reveal';

export default function HomePage() {
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
          <Clients />
        </Reveal>
        <Reveal>
          <SocialLinks />
        </Reveal>
        <Reveal>
          <Column />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
