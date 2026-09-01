import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import { LOGO_WALL } from './worksContent';

export default function WkLogoWall() {
  return (
    <section className="bg-[#F6F8FB] py-20 md:py-24">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {LOGO_WALL.tiles.map((tile, i) => (
            // Hover classes sit on the inner div, not on Reveal: Reveal sets
            // transform inline on its own element, and inline style always wins
            // over a class-based hover:-translate-y on that same element.
            <Reveal key={tile.companyName} delay={(i % 4) * 70}>
              <div className="flex h-[120px] flex-col items-center justify-center gap-2 border border-[#E2E8F2] bg-white shadow-[0_1px_3px_rgba(12,14,26,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-[0_10px_20px_rgba(37,99,235,0.12)]">
                {tile.logoSrc ? (
                  <Image
                    src={tile.logoSrc}
                    alt={tile.companyName}
                    width={96}
                    height={40}
                    className="h-10 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display text-[16px] font-bold tracking-[0.08em] text-[#5B6B8A]">
                    LOGO
                  </span>
                )}
                <span className="font-sans text-[12px] font-normal text-[#4A5877]">
                  {tile.companyName}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 font-sans text-[12px] font-light text-[#5B6B8A]">{LOGO_WALL.note}</p>
      </div>
    </section>
  );
}
