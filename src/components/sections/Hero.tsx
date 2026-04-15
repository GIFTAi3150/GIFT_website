import HeroLogoDelayed from '@/components/ui/HeroLogoDelayed';
import ScatterText from '@/components/ui/ScatterText';

export default function Hero() {
  return (
    <section
      className="relative flex w-full items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#141414' }}
    >
      <div className="relative z-10 mx-auto w-full max-w-container px-4 py-16 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-5 lg:gap-12">
          {/* Text — left on desktop, top on mobile */}
          <div className="order-2 flex flex-col items-start gap-6 text-left lg:order-1 lg:col-span-2">
            <h1
              className="font-display font-bold leading-tight text-white"
              style={{ fontSize: 'clamp(30px, 3.2vw, 40px)', lineHeight: '1.15' }}
            >
              <ScatterText text="Where opportunity begins." />
            </h1>
            <p
              className="nav-reveal font-mincho text-white/90"
              style={
                {
                  fontSize: 'clamp(15px, 1.4vw, 16px)',
                  lineHeight: '1.9',
                  ['--reveal-delay' as string]: '1100ms',
                } as React.CSSProperties
              }
            >
              全ての人と社会へ夢やキッカケを与えられる企業へ
            </p>
            <a
              href="/contact"
              className="nav-reveal group mt-2 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-10 py-4 font-sans text-normal font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-green hover:bg-gift-green hover:shadow-[0_10px_30px_rgba(0,86,51,0.45)] active:scale-95 active:border-gift-green active:bg-gift-green"
              style={{ ['--reveal-delay' as string]: '1350ms' }}
            >
              お問い合わせ
            </a>
          </div>

          {/* Logo — right on desktop, below text on mobile */}
          <div
            className="order-1 flex items-center justify-center lg:order-2 lg:col-span-3"
            style={{ backgroundColor: '#141414' }}
          >
            <div
              className="relative h-[360px] w-full max-w-3xl sm:h-[460px] lg:h-[640px]"
              style={{ backgroundColor: '#141414' }}
            >
              <HeroLogoDelayed className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
