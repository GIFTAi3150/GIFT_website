import Reveal from '@/components/ui/Reveal';
import AtSectionHead from './AtSectionHead';
import { PAINS } from './aiTrainingContent';

/* Stroke icons on a 24px grid, one consistent 2px-stroke style, accent blue.
   Drawn inline so they recolor with the theme and add no runtime weight. */
const PAIN_ICONS: Record<string, React.ReactNode> = {
  // 稲妻 — 「試したが業務で活きていない」(エネルギーが成果につながらない)
  spark: <path d="M13 2 3 14h8l-1 8 11-13h-8l1-7z" />,
  // 人材 — 「教えられる人がいない」
  mentor: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
      <path d="M17 3.5a4 4 0 0 1 0 7" />
      <path d="M22 21v-2a5 5 0 0 0-3-4.5" />
    </>
  ),
  // 盾 + ! — 「リスクが不安」
  shield: (
    <>
      <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </>
  ),
};

function PainIcon({ name }: { name: string }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-[#EFF5FF]">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {PAIN_ICONS[name]}
      </svg>
    </span>
  );
}

export default function AtPains() {
  return (
    <section className="relative bg-ai-bg py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <AtSectionHead word={PAINS.eyebrow} chip={PAINS.title} />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 items-stretch gap-5 min-[680px]:grid-cols-3 md:gap-6">
          {PAINS.items.map((item, i) => (
            <Reveal key={item.titleParts.join('')} delay={i * 80}>
              <article className="flex h-full flex-col border border-ai-border bg-ai-surface p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-ai-accent hover:shadow-[0_12px_24px_rgba(37,99,235,0.12)] md:p-8">
                <PainIcon name={item.icon} />
                <h3
                  className="mt-5 font-sans text-[19px] font-bold text-ai-ink"
                  style={{ lineHeight: 1.4 }}
                >
                  {item.titleParts.map((part) => (
                    <span key={part} className="inline-block">
                      {part}
                    </span>
                  ))}
                </h3>
                <p
                  className="mt-4 font-sans text-[16px] font-light text-ai-muted"
                  style={{ lineHeight: 1.9, textWrap: 'pretty' }}
                >
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={PAINS.items.length * 80}>
          <p
            className="mx-auto mt-12 max-w-2xl text-center font-sans text-[17px] font-light text-ai-ink"
            style={{ lineHeight: 1.9, textWrap: 'pretty' }}
          >
            {PAINS.lead}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
