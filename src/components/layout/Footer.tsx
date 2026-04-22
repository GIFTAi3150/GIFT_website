import Image from 'next/image';
import Link from 'next/link';
import company from '@/data/company.json';

const footerNav = [
  { href: '/company', en: 'ABOUT', ja: '会社概要' },
  { href: '/achievements', en: 'WORKS', ja: '実績' },
  { href: '/member', en: 'MEMBER', ja: 'メンバー' },
  { href: '/recruit', en: 'RECRUIT', ja: '採用情報' },
  { href: '/news', en: 'NEWS', ja: 'お知らせ' },
  { href: '/contact', en: 'CONTACT', ja: 'お問い合わせ' },
];

const footerServices = [
  { href: '/services/callcenter', label: 'コールセンター事業' },
  { href: '/services/dx-consulting', label: 'DXコンサル事業' },
  { href: '/services/finance-consulting', label: '財務コンサル事業' },
];

const socials = [
  { name: 'Instagram', href: 'https://www.instagram.com/gift_with_you_', icon: 'instagram' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@gift_with_you_', icon: 'tiktok' },
];

function Icon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'currentColor' } as const;
  switch (name) {
    case 'instagram':
      return (
        <svg {...common}>
          <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.1.4.3 1 .4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.1-1 .3-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.1-.4-.3-1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.1 1-.3 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 5.5a4.3 4.3 0 100 8.6 4.3 4.3 0 000-8.6zm5.5-.3a1 1 0 11-2 0 1 1 0 012 0zM12 9.7a2.3 2.3 0 110 4.6 2.3 2.3 0 010-4.6z" />
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
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
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

export default function Footer() {
  return (
    <footer className="bg-gift-bg-2 text-gift-ink/80">
      <div className="mx-auto max-w-container px-4 py-s-80 md:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              aria-label="株式会社GIFT トップページ"
              className="inline-flex w-fit transition-transform duration-200 hover:scale-105"
            >
              <Image
                src="/GIFT_logo.svg"
                alt="株式会社GIFT"
                width={180}
                height={86}
                className="h-10 w-auto"
              />
            </Link>
            <p className="font-sans text-normal text-gift-ink/60" style={{ lineHeight: '1.8' }}>
              {company.address}
            </p>
            <p className="font-sans text-normal text-gift-ink/60">TEL: {company.phone}</p>

            {/* Socials */}
            <div className="mt-4 flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="cta-btn h-10 w-10 !p-0"
                >
                  <Icon name={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-label="フッターナビゲーション" className="flex flex-col gap-4">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 whitespace-nowrap leading-none"
                >
                  <span className="w-20 font-display text-[13px] font-bold uppercase tracking-[0.15em] text-gift-ink transition-colors duration-150 group-hover:text-gift-hover">
                    {item.en}
                  </span>
                  <span aria-hidden className="h-4 w-px bg-white/20" />
                  <span className="font-sans text-small font-light text-gift-silver transition-colors duration-150 group-hover:text-gift-hover">
                    {item.ja}
                  </span>
                </Link>
              ))}
            </nav>

            <nav aria-label="事業内容ナビゲーション" className="flex flex-col gap-3">
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.15em] text-gift-ink">
                SERVICE
              </span>
              {footerServices.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="font-sans text-small font-light text-gift-silver transition-colors duration-150 hover:text-gift-hover"
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-gift-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-small text-gift-ink/40">
            &copy; Copyright 2026 GIFT inc. All Rights Reserved.
          </p>
          <Link
            href="/privacy"
            className="font-sans text-small text-gift-silver transition-colors hover:text-gift-ink"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
