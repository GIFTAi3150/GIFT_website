import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { COURSES } from './aiTrainingContent';

/* Course lineup — added per 社労士 review (2026-09-03). The offering is three
   predefined trainings (name / outline / module hours) straight from the
   research pamphlets, never per-company customization, to stay inside subsidy
   requirements. Stacked full-width rows (not a 3-col grid) per user feedback:
   easier to read, and each course gets room for its module list. */
export default function AtCourses() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={COURSES.eyebrow} chip={COURSES.title} lead={COURSES.note} />
        </Reveal>

        <div className="mt-14 flex flex-col gap-6">
          {COURSES.items.map((course, i) => (
            <Reveal key={course.nameParts.join('')} delay={i * 80}>
              <article className="grid grid-cols-1 gap-7 border border-ai-border bg-ai-surface p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-accent hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] min-[820px]:grid-cols-[1fr_1fr] min-[820px]:gap-10 md:p-9">
                {/* Left: name + outline */}
                <div className="flex flex-col">
                  <span className="font-display text-[13px] font-bold tracking-[0.14em] text-ai-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3
                    className="mt-3 font-sans font-bold text-ai-ink"
                    style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.4 }}
                  >
                    {course.nameParts.map((part) => (
                      <span key={part} className="inline-block">
                        {part}
                      </span>
                    ))}
                  </h3>
                  <p
                    className="mt-4 font-sans text-[15px] font-light text-ai-muted"
                    style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                  >
                    {course.description}
                  </p>
                </div>

                {/* Right: module list */}
                <div className="flex flex-col justify-center border-t border-ai-border pt-6 min-[820px]:border-l min-[820px]:border-t-0 min-[820px]:pl-10 min-[820px]:pt-0">
                  <span className="font-display text-[12px] font-bold uppercase tracking-[0.18em] text-ai-muted">
                    Curriculum
                  </span>
                  <ul className="mt-4 flex flex-col gap-3.5">
                    {course.modules.map((mod, j) => (
                      <li key={mod.title} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-3 font-sans text-[15px] font-normal text-ai-ink">
                          <span className="font-display text-[12px] font-bold text-ai-accent">
                            {j + 1}
                          </span>
                          {mod.title}
                        </span>
                        <span className="shrink-0 border border-ai-border bg-white px-2.5 py-1 font-sans text-[12px] font-bold text-ai-muted">
                          {mod.hours}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
