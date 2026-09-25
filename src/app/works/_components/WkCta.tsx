import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { CTA } from './worksContent';
import sections from './WkSections.module.css';

export default function WkCta() {
  return (
    <section className={sections.cta} aria-labelledby="works-contact-title">
      <div className={sections.ctaPanel}>
        <Reveal className="flex flex-col items-center gap-5">
          <p className={sections.ctaEyebrow}>CONTACT</p>
          <h2 id="works-contact-title" className={sections.ctaTitle}>
            {CTA.headline}
          </h2>

          <Link
            href={CTA.href}
            className="inline-flex w-full max-w-[360px] items-center justify-center bg-white px-10 py-4 text-[#2347b8] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e8f0ff] hover:shadow-[0_10px_24px_rgba(37,99,235,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#142b69] min-[420px]:w-auto"
          >
            <span className="font-sans text-[15px] font-bold">{CTA.label}</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
