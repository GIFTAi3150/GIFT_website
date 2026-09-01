import Link from 'next/link';
import { CTA } from './worksContent';

export default function WkCta() {
  return (
    <section className="bg-[#0C0E1A] py-16 md:py-24">
      <div className="mx-auto flex max-w-container flex-col items-center gap-5 px-4 py-6 md:px-6 lg:px-8">
        <p
          className="text-center font-sans text-[24px] font-bold text-white"
          style={{ lineHeight: 1.5, textWrap: 'balance' }}
        >
          {CTA.headline}
        </p>

        <Link
          href={CTA.href}
          className="group inline-flex w-full max-w-[360px] items-center justify-center gap-2.5 bg-[#2563EB] px-10 py-4 text-white transition-colors duration-300 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0E1A] min-[420px]:w-auto"
        >
          <span className="font-sans text-[15px] font-bold">{CTA.label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
