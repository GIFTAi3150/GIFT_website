import Image from 'next/image';
import WkSectionHead from './WkSectionHead';
import { PICK_UP } from './worksContent';

export default function WkPickup() {
  return (
    <section className="bg-[#F6F8FB] pb-20 pt-2 md:pb-24">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <WkSectionHead word={PICK_UP.eyebrow} chip={PICK_UP.title} />

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {PICK_UP.cases.map((item) => (
            <article
              key={item.companyName}
              className="flex flex-col gap-3.5 border border-[#E2E8F2] bg-white p-8 shadow-[0_1px_3px_rgba(12,14,26,0.06)]"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-[88px] shrink-0 items-center justify-center border border-dashed border-[#C6D0E0] bg-[#F2F5FA]">
                  {item.logoSrc ? (
                    <Image
                      src={item.logoSrc}
                      alt={item.companyName}
                      width={64}
                      height={32}
                      className="h-8 w-auto object-contain"
                    />
                  ) : (
                    <span className="font-display text-[12px] font-bold text-[#5B6B8A]">LOGO</span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-sans text-[17px] font-bold text-[#0C0E1A]">{item.companyName}</p>
                  <p className="font-sans text-[12px] font-normal text-[#5B6B8A]">{item.industry}</p>
                </div>
              </div>
              <p
                className="font-sans text-[14px] font-light text-[#4A5877]"
                style={{ lineHeight: 2, textWrap: 'pretty' }}
              >
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
