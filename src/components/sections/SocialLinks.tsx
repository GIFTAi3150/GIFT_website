import { Fragment } from 'react';

// TODO: add real hrefs for X (Twitter) and LINE (採用用) when shared
const socials = [
  {
    name: 'Instagram',
    handle: '@gift_with_you_',
    href: 'https://www.instagram.com/gift_with_you_',
    icon: 'instagram',
    tagline: '写真と動画で、日々の活動を',
    // Instagram's signature gradient
    background:
      'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
    textColor: '#ffffff',
  },
  {
    name: 'X',
    handle: '@gift_inc',
    href: '#',
    icon: 'x',
    tagline: 'リアルタイムな最新情報を',
    background: '#000000',
    textColor: '#ffffff',
  },
  {
    name: 'LINE',
    handle: '採用用LINE',
    href: '#',
    icon: 'line',
    tagline: '採用情報のご案内はこちら',
    background: '#06C755',
    textColor: '#ffffff',
  },
  {
    name: 'TikTok',
    handle: '@gift_with_you_',
    href: 'https://www.tiktok.com/@gift_with_you_',
    icon: 'tiktok',
    tagline: '動画で、GIFTの日常を',
    background: 'linear-gradient(135deg, #25F4EE 0%, #000000 50%, #FE2C55 100%)',
    textColor: '#ffffff',
  },
];

function Icon({ name }: { name: string }) {
  const common = { width: 48, height: 48, viewBox: '0 0 24 24', fill: 'currentColor' } as const;
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
    case 'line':
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...common}>
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function SocialLinks() {
  return (
    <section className="w-full border-t border-gift-border bg-gift-near-black py-s-80">
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            FOLLOW US
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: '1.2' }}
          >
            SNSで最新情報を
          </h2>
        </div>
      </div>

      {/* Brand-color strip */}
      <div className="social-strip mx-auto w-full max-w-2xl px-4 md:px-6 lg:px-8">
        {socials.map((s, i) => (
          <Fragment key={s.name}>
            <a
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.name}
              className="social-panel group"
              style={{ ['--panel-bg' as string]: s.background }}
            >
              <div className="social-panel-inner">
                <span className="social-panel-icon">
                  <Icon name={s.icon} />
                </span>
                <div className="social-panel-handle">{s.handle}</div>
              </div>
            </a>
            {i < socials.length - 1 && <span className="social-divider" aria-hidden />}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
