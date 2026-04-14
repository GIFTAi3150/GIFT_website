'use client';

import dynamic from 'next/dynamic';

const GiftLogo3D = dynamic(() => import('@/components/ui/GiftLogo3D_PremiumBadge'), {
  ssr: false,
  loading: () => <LogoPlaceholder />,
});

function LogoPlaceholder() {
  return (
    <div
      className="flex h-[360px] w-full items-center justify-center sm:h-[460px] lg:h-[640px]"
      style={{ backgroundColor: '#141414' }}
    >
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
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div
            className="h-1.5 w-1.5 rounded-full bg-white/60"
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HeroLogoDelayed({ className }: { className?: string }) {
  return <GiftLogo3D className={className} />;
}
