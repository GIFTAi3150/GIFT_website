import Link from 'next/link';

export default function WhoWeAre() {
  return (
    <section className="relative w-full overflow-hidden border-t border-gift-border bg-gift-bg-alt py-s-80">
      {/* Bob Marley lyrics drifting across the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-12 overflow-hidden"
      >
        <div className="flex w-max animate-marquee gap-16 whitespace-nowrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={`a${i}`}
              className="select-none font-display italic text-gift-ink/[0.07]"
              style={{ fontSize: 'clamp(60px, 10vw, 140px)', letterSpacing: '0.02em' }}
            >
              One Love! One Heart! Let's get together and feel all right. Hear the children cryin'
              (One Love!);
            </span>
          ))}
        </div>
        <div
          className="flex w-max gap-16 whitespace-nowrap"
          style={{ animation: 'marquee 200s linear infinite reverse' }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={`b${i}`}
              className="select-none font-display italic text-gift-ink/[0.07]"
              style={{ fontSize: 'clamp(55px, 9vw, 130px)', letterSpacing: '0.02em' }}
            >
              Hear the children cryin' (One Heart!), Sayin': give thanks and praise to the Lord and
              I will feel all right; Sayin': let's get together and feel all right. Wo wo-wo wo-wo!
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
            className="mb-8 font-sans font-extrabold leading-tight text-gift-ink"
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

          <Link href="/company" className="cta-btn">
            <span>GIFTについて</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
