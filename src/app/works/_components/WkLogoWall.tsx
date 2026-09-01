import Image from 'next/image';
import { LOGO_WALL } from './worksContent';

export default function WkLogoWall() {
  return (
    <section className="bg-[#F6F8FB] py-16 md:py-20">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {LOGO_WALL.tiles.map((tile) => (
            <div
              key={tile.companyName}
              className="flex h-[120px] flex-col items-center justify-center gap-2 border border-[#E2E8F2] bg-white shadow-[0_1px_3px_rgba(12,14,26,0.06)]"
            >
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
          ))}
        </div>

        <p className="mt-6 font-sans text-[12px] font-light text-[#5B6B8A]">{LOGO_WALL.note}</p>
      </div>
    </section>
  );
}
