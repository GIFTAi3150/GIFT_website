'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/company', en: 'ABOUT', ja: '会社概要' },
  { href: '/achievements', en: 'WORKS', ja: '実績' },
  { href: '/member', en: 'MEMBER', ja: 'メンバー' },
  { href: '/recruit', en: 'RECRUIT', ja: '採用情報' },
  { href: '/news', en: 'NEWS', ja: 'お知らせ' },
  { href: '/contact', en: 'CONTACT', ja: 'お問い合わせ' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Only start hide/show logic once past a threshold so tiny scrolls don't trigger
      if (y > 80) {
        setHidden(y > lastY);
      } else {
        setHidden(false);
      }
      lastY = y;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // If the mobile menu is open, always show the header
  const isHidden = hidden && !open;

  return (
    <>
    <header
      className={`fixed top-0 z-50 w-full transition-opacity duration-700 ease-out ${
        isHidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      } ${
        scrolled
          ? 'bg-gift-bg/95 shadow-deep backdrop-blur-md'
          : 'bg-gift-bg/90 backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-8 md:flex" aria-label="メインナビゲーション">
          {navItems.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-reveal group relative block h-5 overflow-hidden whitespace-nowrap leading-5"
              style={{ ['--reveal-delay' as string]: `${150 + i * 80}ms` }}
              aria-label={item.ja}
            >
              <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-5">
                <span className="block h-5 font-display text-[13px] font-bold uppercase tracking-[0.15em] text-gift-ink/85">
                  {item.en}
                </span>
                <span className="block h-5 font-sans text-[13px] font-medium text-gift-hover">
                  {item.ja}
                </span>
              </span>
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
            className={`block h-0.5 w-6 bg-gift-ink transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-gift-ink transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-gift-ink transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </div>

    </header>

    {open && (
      <nav
        className="fixed inset-0 top-20 z-40 flex flex-col gap-8 overflow-y-auto bg-gift-bg px-6 pb-10 pt-10 md:hidden"
        aria-label="モバイルナビゲーション"
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-4 leading-none"
          >
            <span className="font-display text-[28px] font-bold uppercase tracking-[0.1em] text-gift-ink">
              {item.en}
            </span>
            <span aria-hidden className="h-6 w-px bg-gift-border" />
            <span className="font-sans text-[15px] font-medium text-gift-silver">
              {item.ja}
            </span>
          </Link>
        ))}
      </nav>
    )}
    </>
  );
}
