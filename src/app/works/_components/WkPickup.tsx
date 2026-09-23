import Reveal from '@/components/ui/Reveal';
import WkSectionHead from './WkSectionHead';
import WkCaseCard from './WkCaseCard';
import { PICK_UP } from './worksContent';
import sections from './WkSections.module.css';

export default function WkPickup() {
  return (
    <section className={sections.pickup} aria-labelledby="works-pickup-title">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal className={sections.sectionIntro}>
          <WkSectionHead word={PICK_UP.eyebrow} chip={PICK_UP.title} id="works-pickup-title" />
          <span className={sections.sectionNumber} aria-hidden="true">
            02
          </span>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-8">
          {PICK_UP.cases.map((item, i) => (
            <Reveal key={item.industry} delay={i * 80}>
              <WkCaseCard item={item} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
