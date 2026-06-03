import HeroLogoDelayed from '@/components/ui/HeroLogoDelayed';
import FadeUpText from '@/components/ui/FadeUpText';

export default function Hero() {
  return (
    <section
      className="relative flex w-full items-start justify-center overflow-x-hidden lg:items-center"
      style={{ minHeight: '100vh', backgroundColor: '#F0F7FF' }}
    >
      {/* Decorative drifting blobs — adds depth behind the hero content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
      </div>
      {/* Interactive dots grid — sits above the blobs, below content.
          Dots light up gift-green near the cursor, get pushed by fast
          mouse movement, and ripple on click. Decorative only. */}
      <div className="relative z-10 mx-auto w-full max-w-container px-4 py-8 md:py-16 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Text — left on desktop, top on mobile */}
          <div className="order-2 flex flex-col items-start gap-6 text-left lg:order-1 lg:col-span-2">
            <h1
              className="font-display font-semibold leading-[1.05] tracking-tight text-[#0C0E1A]"
              style={{ fontSize: 'clamp(36px, 4.2vw, 56px)' }}
            >
              <FadeUpText text="Where" />{' '}
              <span className="text-[#2563EB]">
                <FadeUpText text="opportunity" delayMs={220} />
              </span>
              <br />
              <FadeUpText text="begins." delayMs={400} />
            </h1>
            <p
              className="nav-reveal font-mincho font-medium text-[#5B6B8A]"
              style={
                {
                  fontSize: 'clamp(17px, 1.7vw, 20px)',
                  lineHeight: '1.8',
                  ['--reveal-delay' as string]: '1100ms',
                } as React.CSSProperties
              }
            >
              AIと人が共に創る、ビジネスの新時代。
            </p>
            <a
              href="/contact"
              className="cta-btn cta-btn--ai nav-reveal mt-2"
              style={{ ['--reveal-delay' as string]: '1350ms' }}
            >
              <span>お問い合わせ</span>
            </a>
          </div>

          {/* Logo — right on desktop, below text on mobile */}
          <div className="order-1 flex items-center justify-center lg:order-2 lg:col-span-3">
            <div className="relative h-[360px] w-full max-w-3xl sm:h-[460px] lg:h-[640px]">
              <HeroLogoDelayed className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
