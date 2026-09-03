import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { COURSES } from './aiTrainingContent';

/* Course lineup — added per 社労士 review (2026-09-03). The offering is three
   predefined trainings (name / outline / module hours) straight from the
   research pamphlets, never per-company customization, to stay inside subsidy
   requirements. */
export default function AtCourses() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={COURSES.eyebrow} chip={COURSES.title} lead={COURSES.note} />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[760px]:grid-cols-3 md:gap-6">
          {COURSES.items.map((course, i) => (
            <Reveal key={course.nameParts.join('')} delay={i * 80}>
              <article className="flex h-full flex-col border border-ai-border bg-ai-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-accent hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] md:p-8">
                <span className="font-display text-[13px] font-bold tracking-[0.14em] text-ai-accent">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3
                  className="mt-3 font-sans text-[20px] font-bold text-ai-ink"
                  style={{ lineHeight: 1.4 }}
                >
                  {course.nameParts.map((part) => (
                    <span key={part} className="inline-block">
                      {part}
                    </span>
                  ))}
                </h3>
                <p
                  className="mt-3 font-sans text-[14px] font-light text-ai-muted"
                  style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                >
                  {course.description}
                </p>
                <ul className="mt-auto flex flex-col gap-2 border-t border-ai-border pt-5">
                  {course.modules.map((mod) => (
                    <li key={mod.title} className="flex items-center justify-between gap-3">
                      <span className="font-sans text-[14px] font-normal text-ai-ink">
                        {mod.title}
                      </span>
                      <span className="shrink-0 border border-ai-border bg-white px-2 py-0.5 font-sans text-[12px] font-bold text-ai-muted">
                        {mod.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
