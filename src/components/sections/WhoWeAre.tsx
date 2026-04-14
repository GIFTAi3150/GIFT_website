import Link from 'next/link';

export default function WhoWeAre() {
  return (
    <section className="relative w-full overflow-hidden border-t border-white/5 bg-gift-near-black py-s-80">
      {/* Bob Marley lyrics drifting across the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-12 overflow-hidden"
      >
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={`a${i}`}
              className="select-none font-display italic text-white/[0.07]"
              style={{ fontSize: 'clamp(60px, 10vw, 140px)', letterSpacing: '0.02em' }}
            >
              One Love. One Heart.
            </span>
          ))}
        </div>
        <div
          className="flex w-max gap-16 whitespace-nowrap"
          style={{ animation: 'marquee 80s linear infinite reverse' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={`b${i}`}
              className="select-none font-display italic text-white/[0.07]"
              style={{ fontSize: 'clamp(55px, 9vw, 130px)', letterSpacing: '0.02em' }}
            >
              Let&apos;s get together and feel all right.
            </span>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            WHO WE ARE
          </p>

          <h2
            className="mb-8 font-sans font-extrabold leading-tight text-white"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
          >
            キッカケで、世界が変わる。
          </h2>

          <div className="mb-8 h-0.5 w-12 bg-gift-green" />

          <p
            className="mb-6 font-sans font-light text-gift-silver"
            style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
          >
            企業が本来持つ力を、最大限に引き出すために。 GIFTは、豊富な実績と多角的な知見を持つ
            プロフェッショナルの集合体。 戦略の立案から実行まで、
            あなたのビジネスの可能性を、全方位から支援します。
          </p>

          <p
            className="mb-10 font-sans font-light text-gift-silver"
            style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
          >
            一人ひとりの挑戦を支え、地域と社会に新しいキッカケを届ける。
            それが私たちGIFTの使命です。
          </p>

          <Link
            href="/company"
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-8 py-4 font-sans text-normal font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-green hover:bg-gift-green hover:shadow-[0_10px_30px_rgba(0,86,51,0.45)] active:scale-95 active:border-gift-green active:bg-gift-green"
          >
            GIFTについて
            <span className="inline-block transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
