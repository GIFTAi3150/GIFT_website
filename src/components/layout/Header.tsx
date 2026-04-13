'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/',              ja: 'HOME'                           },
  { href: '/about',         ja: '会社概要'                       },
  { href: '/lstep',         ja: 'Lステップ'                      },
  { href: '/lsteprpa',      ja: 'RPAでLステップ更新作業を自動化'  },
  { href: '/privacypolicy', ja: 'プライバシーポリシー'           },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-gift-bg/90 backdrop-blur-md shadow-deep'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2" aria-label="株式会社GIFT トップページ">
          <span className="font-display font-bold text-medium text-white tracking-wide">
            株式会社GIFT
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="メインナビゲーション">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-sans font-medium text-normal text-white/80 hover:text-gift-green-mid transition-colors duration-150 whitespace-nowrap"
            >
              {item.ja}
            </Link>
          ))}
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-gift-green-mid"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="メニューを開く"
        >
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-white transition-transform duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {open && (
        <nav
          className="md:hidden bg-gift-bg border-t border-white/10 px-4 pb-6 pt-4 flex flex-col gap-4"
          aria-label="モバイルナビゲーション"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-sans font-medium text-normal text-white/80 hover:text-gift-green-mid transition-colors"
            >
              {item.ja}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
