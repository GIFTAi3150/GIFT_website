import Link from 'next/link';
import company from '@/data/company.json';

const footerNav = [
  { href: '/',              ja: 'HOME'                           },
  { href: '/about',         ja: '会社概要'                       },
  { href: '/lstep',         ja: 'Lステップ'                      },
  { href: '/lsteprpa',      ja: 'RPAでLステップ更新作業を自動化'  },
  { href: '/privacypolicy', ja: 'プライバシーポリシー'           },
];

export default function Footer() {
  return (
    <footer className="bg-gift-bg-2 text-white/80">
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 py-s-80">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          <div className="flex flex-col gap-3">
            <span className="font-display font-bold text-medium text-white tracking-wide">
              {company.name}
            </span>
            <p className="font-sans text-normal text-white/60" style={{ lineHeight: '1.8' }}>
              {company.address}
            </p>
            <p className="font-sans text-normal text-white/60">
              TEL: {company.phone}
            </p>
          </div>

          <nav aria-label="フッターナビゲーション" className="flex flex-col gap-3">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="font-sans text-normal text-white/70 hover:text-gift-green-mid transition-colors duration-150 whitespace-nowrap"
              >
                {item.ja}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="font-sans text-small text-white/40">
            &copy; Copyright 2024 GIFT inc. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
