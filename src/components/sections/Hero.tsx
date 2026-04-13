import dynamic from 'next/dynamic';

const GiftLogo3D = dynamic(() => import('@/components/ui/GiftLogo3D_PremiumBadge'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full max-w-lg flex flex-col items-center justify-center gap-6"
      style={{ height: '400px' }}
    >
      {/* Pulsing shield silhouette */}
      <div className="relative">
        <svg
          width="80"
          height="90"
          viewBox="0 0 828 800"
          className="animate-pulse"
          style={{ opacity: 0.15 }}
        >
          <path
            d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"
            fill="#2d6b3f"
          />
        </svg>
        {/* Orbiting dot */}
        <div
          className="absolute inset-0 animate-spin"
          style={{ animationDuration: '2s' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            style={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)' }}
          />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <p
          className="text-white/25 text-sm italic"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
        >
          One Love! One Heart!
        </p>
        <p
          className="text-white/15 text-xs italic"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.05em' }}
        >
          Let&apos;s get together and feel all right
        </p>
      </div>
    </div>
  ),
});

export default function Hero() {
  return (
    <section
      className="relative w-full flex items-center justify-center"
      style={{ minHeight: '100vh', backgroundColor: '#141414' }}
    >
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-8">
        <GiftLogo3D className="w-full max-w-lg" />
        <h1
          className="font-display font-bold text-white leading-tight"
          style={{ fontSize: 'clamp(42px, 7vw, 72px)', lineHeight: '1.1' }}
        >
          Gift an opportunity.
        </h1>
        <p
          className="font-mincho text-white/90"
          style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', lineHeight: '1.9' }}
        >
          全ての人と社会へ夢やキッカケを与えられる企業へ
        </p>
        <a
          href="/contact"
          className="inline-block bg-gift-green hover:bg-gift-green-mid text-white font-sans font-medium text-normal px-10 py-4 transition-colors duration-200 whitespace-nowrap"
        >
          お問い合わせ
        </a>
      </div>
    </section>
  );
}
