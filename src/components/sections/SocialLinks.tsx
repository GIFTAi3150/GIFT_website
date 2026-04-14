// TODO: replace href values with real GIFT social URLs
const socials = [
  { name: 'Instagram', handle: '@gift_inc', href: '#', icon: 'instagram' },
  { name: 'X', handle: '@gift_inc', href: '#', icon: 'x' },
  { name: 'YouTube', handle: 'GIFT Inc.', href: '#', icon: 'youtube' },
  { name: 'LINE', handle: '@gift', href: '#', icon: 'line' },
  { name: 'TikTok', handle: '@gift_inc', href: '#', icon: 'tiktok' },
];

function Icon({ name }: { name: string }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'currentColor' } as const;
  switch (name) {
    case 'instagram':
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.1.4.3 1 .4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.1-1 .3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.1-.4-.3-1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.1 1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.5a4.3 4.3 0 100 8.6 4.3 4.3 0 000-8.6zm5.5-.3a1 1 0 11-2 0 1 1 0 012 0zM12 9.7a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6z" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M18.244 2H21l-6.52 7.45L22 22h-6.84l-4.76-6.22L4.8 22H2l7-8L1.5 2h7l4.3 5.68L18.244 2zm-2.4 18h1.9L7.3 4h-2L15.843 20z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...common}>
          <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.6 3.5 12 3.5 12 3.5s-7.6 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.8.6 9.4.6 9.4.6s7.6 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.5v-7l6.4 3.5-6.4 3.5z" />
        </svg>
      );
    case 'line':
      return (
        <svg {...common}>
          <path d="M12 2C6 2 1 6 1 11c0 4.4 4 8.2 9.4 9 .4.1.9.3 1 .7.1.4 0 1-.1 1.4l-.2.7c0 .2-.2.8.7.4.9-.4 5.2-3.1 7.1-5.3 1.3-1.5 2.1-3 2.1-5 0-5-5-9-9-9zm-4 11H6V8h1v4h1v1zm2 0H9V8h1v5zm5 0h-1l-2-3v3h-1V8h1l2 3V8h1v5zm3-4h-2v1h2v1h-2v1h2v1h-3V8h3v1z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M19.3 6.5a5.7 5.7 0 01-3.3-1.1A5.6 5.6 0 0114.4 2h-3.1v13.1a2.7 2.7 0 11-2.7-2.7c.3 0 .5 0 .8.1V9.3a5.8 5.8 0 00-.8-.1 5.9 5.9 0 105.9 5.9V9a8.7 8.7 0 005 1.6V7.5a5.8 5.8 0 01-.2-1z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SocialLinks() {
  return (
    <section className="w-full border-t border-white/5 bg-gift-near-black py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center text-center">
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            FOLLOW US
          </p>
          <h2
            className="font-sans font-extrabold text-white"
            style={{ fontSize: '30px', lineHeight: '1.25' }}
          >
            SNSで最新情報を
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="group flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-gift-green hover:bg-gift-green hover:shadow-[0_10px_30px_rgba(0,86,51,0.45)] active:scale-95 active:border-gift-green active:bg-gift-green"
            >
              <span className="text-white/80 transition-colors group-hover:text-white group-active:text-white">
                <Icon name={s.icon} />
              </span>
              <span className="flex flex-col text-left">
                <span className="font-display text-small leading-none text-white">{s.name}</span>
                <span className="mt-1 font-sans text-small font-light leading-none text-gift-silver transition-colors group-hover:text-white/80 group-active:text-white/80">
                  {s.handle}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
