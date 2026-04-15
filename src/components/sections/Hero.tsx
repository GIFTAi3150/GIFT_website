import HeroLogoDelayed from '@/components/ui/HeroLogoDelayed';
import ScatterText from '@/components/ui/ScatterText';

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
              <ScatterText text="Where " />
              <span className="text-gift-green">
                <ScatterText text="opportunity" />
              </span>
              <br />
              <ScatterText text="begins." />
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
              className="nav-reveal group mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-gift-border bg-white px-10 py-4 font-sans text-normal font-medium text-gift-ink shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-hover hover:bg-gift-hover hover:text-white hover:shadow-[0_12px_36px_-8px_rgba(37,99,235,0.5)] active:scale-95"
              style={{ ['--reveal-delay' as string]: '1350ms' }}
            >
              お問い合わせ
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
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
