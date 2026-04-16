import HeroLogoDelayed from '@/components/ui/HeroLogoDelayed';
import FadeUpText from '@/components/ui/FadeUpText';

export default function Hero() {
  return (
    <section
      className="relative flex w-full items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#EDF2EE' }}
    >
      <div className="relative z-10 mx-auto w-full max-w-container px-4 py-16 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Text — left on desktop, top on mobile */}
          <div className="order-2 flex flex-col items-start gap-6 text-left lg:order-1 lg:col-span-2">
            <h1
              className="font-display font-semibold leading-[1.05] tracking-tight text-gift-ink"
              style={{ fontSize: 'clamp(36px, 4.2vw, 56px)' }}
            >
              <FadeUpText text="Where" />{' '}
              <span className="text-gift-green">
                <FadeUpText text="opportunity" delayMs={220} />
              </span>
              <br />
              <FadeUpText text="begins." delayMs={400} />
            </h1>
            <p
              className="nav-reveal font-mincho font-medium text-gift-ink"
              style={
                {
                  fontSize: 'clamp(17px, 1.7vw, 20px)',
                  lineHeight: '1.8',
                  ['--reveal-delay' as string]: '1100ms',
                } as React.CSSProperties
              }
            >
              全ての人と社会へ夢やキッカケを与えられる企業へ
            </p>
            <a
              href="/contact"
              className="cta-btn nav-reveal mt-2"
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
