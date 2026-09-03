import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { COURSES } from './aiTrainingContent';

/* Fixed course lineup — added per 社労士 review (2026-09-03): the offering is
   presented as predefined courses (name / outline / training hours), never as
   per-company customization, to stay inside subsidy requirements. */
export default function AtCourses() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={COURSES.eyebrow} chip={COURSES.title} />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[760px]:grid-cols-3 md:gap-6">
          {COURSES.items.map((course, i) => (
            <Reveal key={course.name} delay={i * 80}>
              <article className="flex h-full flex-col border border-ai-border bg-ai-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-accent hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] md:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-display text-[13px] font-bold tracking-[0.14em] text-ai-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="border border-ai-accent px-2.5 py-1 font-sans text-[12px] font-bold tracking-tight text-ai-accent">
                    {course.hours}
                  </span>
                </div>
                <h3
                  className="mt-4 font-sans text-[19px] font-bold text-ai-ink"
                  style={{ lineHeight: 1.4 }}
                >
                  {course.name}
                </h3>
                <p
                  className="mt-4 font-sans text-[15px] font-light text-ai-muted"
                  style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                >
                  {course.summary}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
