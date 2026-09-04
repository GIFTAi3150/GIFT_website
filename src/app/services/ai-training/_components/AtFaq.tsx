// Accordion FAQ. No shared accordion component exists elsewhere in the codebase,
// so this is built fresh on native <details>/<summary> — no client JS at all
// (the browser owns open/close state), which keeps this a server component.

import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { FAQ } from './aiTrainingContent';

export default function AtFaq() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={FAQ.eyebrow} chip={FAQ.title} />
        </Reveal>

        <Reveal delay={80} className="mx-auto mt-14 max-w-3xl divide-y divide-ai-border border-y border-ai-border">
          {FAQ.items.map((item) => (
            <details key={item.question} className="group py-2">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
                <span
                  className="font-sans text-[17px] font-bold leading-snug text-ai-ink"
                  style={{ textWrap: 'pretty' }}
                >
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 font-display text-[20px] font-light leading-none text-ai-accent transition-transform duration-300 group-open:rotate-45"
                >
                  ＋
                </span>
              </summary>
              {/* CSS-only fade on open — the .at-faq-answer keyframe is defined in
                  globals.css and guarded under prefers-reduced-motion there. Native
                  <details> re-triggers the animation each time it becomes visible,
                  so no JS is needed. */}
              <p
                className="at-faq-answer pb-5 pr-10 font-sans text-[16px] font-light text-ai-muted"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.answer}
              </p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
