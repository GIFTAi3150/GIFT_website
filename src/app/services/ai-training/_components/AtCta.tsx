import Link from 'next/link';
import { CTA } from './aiTrainingContent';

export default function AtCta() {
  return (
    <section className="relative bg-[linear-gradient(180deg,#111827_0%,#0C0E1A_100%)] py-20 md:py-28 lg:py-32">
      <div className="mx-auto flex max-w-container flex-col items-center px-4 md:px-6 lg:px-8">
        <p
          className="text-center font-sans text-[18px] font-light text-white/80"
          style={{ lineHeight: 1.9, textWrap: 'balance' }}
        >
          {CTA.lead}
        </p>

        <Link
          href={CTA.href}
          className="group mt-8 inline-flex w-full max-w-[420px] items-center justify-between gap-6 bg-[#2563EB] px-7 py-4 text-white transition-colors duration-300 hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60a5fa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] min-[480px]:w-auto"
        >
          <span className="font-sans text-[17px] font-bold tracking-tight">{CTA.label}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
