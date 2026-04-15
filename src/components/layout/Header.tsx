'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  
  { href: '/company', ja: '会社概要' },
  { href: '/achievements', ja: '実績' },
  { href: '/member', ja: 'メンバー' },
  { href: '/recruit', ja: '採用情報' },
  { href: '/news', ja: 'お知らせ' },
  { href: '/contact', ja: 'お問い合わせ' },
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
        scrolled ? 'bg-gift-bg/90 shadow-deep backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
        <Link
          href="/"
          className="nav-reveal flex items-center"
          aria-label="株式会社GIFT トップページ"
          style={{ ['--reveal-delay' as string]: '0ms' }}
        >
          <Image
            src="/GIFT_logo.svg"
            alt="株式会社GIFT"
            width={48}
            height={48}
            priority
            className="h-10 w-auto transition-transform duration-200 hover:scale-105"
          />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="メインナビゲーション">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-reveal whitespace-nowrap font-sans text-normal font-medium text-white/80 transition-colors duration-150 hover:text-gift-green-mid"
              style={{ ['--reveal-delay' as string]: `${150 + i * 80}ms` }}
            >
              {item.ja}
            </Link>
          ))}
        </nav>

        <button
          className="nav-reveal flex flex-col gap-1.5 rounded-sm p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gift-green-mid md:hidden"
          style={{ ['--reveal-delay' as string]: '150ms' }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="メニューを開く"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

      {open && (
        <nav
          className="flex flex-col gap-4 border-t border-white/10 bg-gift-bg px-4 pb-6 pt-4 md:hidden"
          aria-label="モバイルナビゲーション"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-sans text-normal font-medium text-white/80 transition-colors hover:text-gift-green-mid"
            >
              {item.ja}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
