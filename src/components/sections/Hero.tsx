import Link from 'next/link';
import FadeUpText from '@/components/ui/FadeUpText';
import HeroBackground from './hero-gradient/HeroBackground';

export default function Hero() {
  return (
    <section
      className="relative flex w-full items-center justify-start overflow-hidden"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b1020',
        isolation: 'isolate',
      }}
    >
      {/* WebGL fluid-distortion hero (port of sales-dex.jp) — full bleed, behind
          everything. Entrance (ball-expand reveal) is handled inside. */}
      <HeroBackground className="absolute inset-0 z-0" />

      {/* Bottom fade: only kicks in from 45% down so the top stays vivid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, transparent 0%, transparent 45%, #0b1020 100%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-container px-6 py-24 md:py-32 md:px-8 lg:px-12">
        <div className="flex max-w-4xl flex-col items-start gap-8 text-left">
          <h1
            className="font-display font-semibold leading-[1.05] tracking-tight text-white"
            style={{ fontSize: 'clamp(52px, 7vw, 110px)' }}
          >
            <FadeUpText text="Where" delayMs={650} />{' '}
            <FadeUpText text="opportunity" delayMs={830} />
            <br />
            <FadeUpText text="begins." delayMs={1010} />
          </h1>
          <p
            className="nav-reveal font-mincho font-medium text-white/70"
            style={
              {
                fontSize: 'clamp(16px, 1.5vw, 19px)',
                lineHeight: '1.8',
                ['--reveal-delay' as string]: '1350ms',
              } as React.CSSProperties
            }
          >
            AIと人が共に創る、ビジネスの新時代。
          </p>
          <Link
            href="/contact"
            className="nav-reveal group mt-2 inline-flex items-center gap-3 border border-white bg-white px-5 py-2.5 text-[#0b1020] transition-all duration-300 hover:bg-transparent hover:text-white"
            style={{ ['--reveal-delay' as string]: '1550ms' }}
          >
            <span className="font-display text-sm font-bold tracking-widest">お問い合わせ</span>
            <span className="text-base transition-transform duration-300 group-hover:translate-x-1">›</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
