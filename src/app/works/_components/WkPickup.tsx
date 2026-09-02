import Reveal from '@/components/ui/Reveal';
import WkSectionHead from './WkSectionHead';
import { PICK_UP } from './worksContent';

export default function WkPickup() {
  return (
    <section className="bg-[#F6F8FB] pb-24 pt-2 md:pb-28 lg:pb-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <Reveal>
          <WkSectionHead word={PICK_UP.eyebrow} chip={PICK_UP.title} />
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PICK_UP.cases.map((item, i) => (
            // Hover classes sit on the inner <article>, not on Reveal: Reveal sets
            // transform inline on its own element, and inline style always wins
            // over a class-based hover:-translate-y on that same element.
            <Reveal key={item.industry} delay={i * 80}>
              <article className="flex flex-col gap-3.5 border border-[#E2E8F2] bg-white p-8 shadow-[0_1px_3px_rgba(12,14,26,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-[0_14px_28px_rgba(12,14,26,0.1)]">
                {/* 会社名は出さない方針(2026-09-02)— 業種タグ + 取組内容のみ */}
                <span className="inline-flex w-fit border border-[#2563EB] px-2.5 py-1 font-sans text-[12px] font-bold tracking-[0.1em] text-[#2563EB]">
                  {item.industry}
                </span>
                <p
                  className="font-sans text-[14px] font-light text-[#4A5877]"
                  style={{ lineHeight: 2, textWrap: 'pretty' }}
                >
                  {item.body}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
