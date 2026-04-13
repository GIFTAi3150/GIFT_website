import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import PhotoCarousel from '@/components/sections/PhotoCarousel';
import ServicesGrid from '@/components/sections/ServicesGrid';
import CompanySnapshot from '@/components/sections/CompanySnapshot';
import CtaBand from '@/components/sections/CtaBand';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PhotoCarousel />
        <ServicesGrid />
        <CompanySnapshot />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
