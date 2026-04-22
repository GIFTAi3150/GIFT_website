'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const navItems = [
  { href: '/company', en: 'ABOUT', ja: '会社概要' },
  { href: '/achievements', en: 'WORKS', ja: '実績' },
  { href: '/member', en: 'MEMBER', ja: 'メンバー' },
  { href: '/recruit', en: 'RECRUIT', ja: '採用情報' },
  { href: '/news', en: 'NEWS', ja: 'お知らせ' },
  { href: '/contact', en: 'CONTACT', ja: 'お問い合わせ' },
];

const serviceItems = [
  { href: '/services/callcenter', label: 'コールセンター事業', labelEn: 'Call Center' },
  { href: '/services/dx-consulting', label: 'DXコンサル事業', labelEn: 'DX Consulting' },
  { href: '/services/finance-consulting', label: '財務コンサル事業', labelEn: 'Financial Consulting' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const [clickedHref, setClickedHref] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active link detection — root is exact match, others match by prefix
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
  const isServiceActive = pathname.startsWith('/services');

  // Flash a brief green highlight on the clicked link (280ms) — works reliably on both desktop and mobile
  const flashClick = (href: string) => {
    setClickedHref(href);
    setTimeout(() => setClickedHref(null), 280);
  };
  const justClicked = (href: string) => clickedHref === href;

  // Mobile: flash the link green BEFORE closing the menu, otherwise the menu hides the feedback instantly
  const flashThenCloseMenu = (href: string) => {
    flashClick(href);
    setTimeout(() => setOpen(false), 280);
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
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

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setServiceOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setServiceOpen(false), 150);
  };

  const isHidden = hidden && !open;

  // Insert SERVICE dropdown at position 1 (after ABOUT)
  const serviceNavIndex = 1;

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
          {navItems.map((item, i) => {
            // Render SERVICE dropdown at the right position
            const actualIndex = i >= serviceNavIndex ? i + 1 : i;
            const elements = [];

            if (i === serviceNavIndex) {
              elements.push(
                <div
                  key="service-dropdown"
                  ref={dropdownRef}
                  className="nav-reveal relative"
                  style={{ ['--reveal-delay' as string]: `${150 + serviceNavIndex * 80}ms` }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="group relative flex items-center gap-1.5 whitespace-nowrap"
                    aria-expanded={serviceOpen}
                    aria-haspopup="true"
                    onClick={() => flashClick('/services')}
                  >
                    <span className="relative block h-5 overflow-hidden leading-5">
                      <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-5">
                        <span
                          className={`block h-5 font-display text-[13px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                            justClicked('/services')
                              ? 'text-gift-green'
                              : 'text-gift-ink/85 group-hover:text-gift-green'
                          }`}
                        >
                          SERVICE
                        </span>
                        <span className="block h-5 font-sans text-[13px] font-medium text-gift-hover">
                          事業内容
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-gift-ink/60 transition-transform duration-200 ${
                        serviceOpen ? 'rotate-180' : ''
                      }`}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </button>

                  {/* Dropdown */}
                  <div
                    className={`absolute left-1/2 top-full pt-3 transition-all duration-200 ${
                      serviceOpen
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none -translate-y-2 opacity-0'
                    }`}
                    style={{ transform: serviceOpen ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-8px)' }}
                  >
                    <div className="w-64 overflow-hidden rounded-xl border border-gift-border bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                      {serviceItems.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          className="group/item flex flex-col gap-0.5 border-b border-gift-border/50 px-5 py-3.5 transition-colors duration-150 last:border-0 hover:bg-gift-bg-alt"
                          onClick={() => setServiceOpen(false)}
                        >
                          <span className="font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                            {s.labelEn}
                          </span>
                          <span className="font-sans text-[14px] font-medium text-gift-ink transition-colors group-hover/item:text-gift-green-teal">
                            {s.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            elements.push(
              <Link
                key={item.href}
                href={item.href}
                onClick={() => flashClick(item.href)}
                className="nav-reveal group relative whitespace-nowrap leading-5"
                style={{ ['--reveal-delay' as string]: `${150 + actualIndex * 80}ms` }}
                aria-label={item.ja}
                aria-current={isActive(item.href) ? 'page' : undefined}
              >
                <span className="relative block h-5 overflow-hidden">
                  <span className="flex flex-col transition-transform duration-300 ease-out group-hover:-translate-y-5">
                    <span
                      className={`block h-5 font-display text-[13px] font-bold uppercase tracking-[0.15em] transition-colors duration-200 ${
                        justClicked(item.href)
                          ? 'text-gift-green'
                          : 'text-gift-ink/85 group-hover:text-gift-green'
                      }`}
                    >
                      {item.en}
                    </span>
                    <span className="block h-5 font-sans text-[13px] font-medium text-gift-hover">
                      {item.ja}
                    </span>
                  </span>
                </span>
              </Link>
            );

            return elements;
          })}
        </nav>

        <button
          className="nav-reveal relative z-10 flex h-10 w-10 items-center justify-center rounded-md text-gift-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-gift-green-mid md:hidden"
          style={{ ['--reveal-delay' as string]: '150ms' }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="メニューを開く"
        >
          {open ? (
            <X size={28} strokeWidth={2.5} />
          ) : (
            <Menu size={28} strokeWidth={2.5} />
          )}
        </button>
      </div>

    </header>

    {open && (
      <nav
        className="fixed inset-0 top-20 z-40 flex flex-col gap-8 overflow-y-auto bg-gift-bg px-6 pb-10 pt-10 md:hidden"
        aria-label="モバイルナビゲーション"
      >
        {/* ABOUT */}
        <Link
          href="/company"
          onClick={() => flashThenCloseMenu('/company')}
          className={`flex items-center gap-4 leading-none transition-opacity duration-200 ${justClicked('/company') ? 'opacity-60' : ''}`}
          aria-current={isActive('/company') ? 'page' : undefined}
        >
          <span
            className={`font-display text-[28px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
              justClicked('/company') ? 'text-gift-green' : 'text-gift-ink hover:text-gift-green'
            }`}
          >
            ABOUT
          </span>
          <span aria-hidden className="h-6 w-px bg-gift-border" />
          <span className="font-sans text-[15px] font-medium text-gift-silver">
            会社概要
          </span>
        </Link>

        {/* SERVICE with expandable sub-items */}
        <div>
          <button
            onClick={() => { flashClick('/services'); setMobileServiceOpen((v) => !v); }}
            className={`flex items-center gap-4 leading-none transition-opacity duration-200 ${justClicked('/services') ? 'opacity-60' : ''}`}
          >
            <span
              className={`font-display text-[28px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
                justClicked('/services') ? 'text-gift-green' : 'text-gift-ink hover:text-gift-green'
              }`}
            >
              SERVICE
            </span>
            <span aria-hidden className="h-6 w-px bg-gift-border" />
            <span className="font-sans text-[15px] font-medium text-gift-silver">
              事業内容
            </span>
            <svg
              className={`ml-1 h-4 w-4 text-gift-silver transition-transform duration-200 ${mobileServiceOpen ? 'rotate-180' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {mobileServiceOpen && (
            <div className="mt-4 flex flex-col gap-3 pl-4 border-l-2 border-gift-green/30">
              {serviceItems.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  onClick={() => flashThenCloseMenu(s.href)}
                  className={`flex flex-col gap-0.5 transition-opacity duration-200 ${justClicked(s.href) ? 'opacity-60' : ''}`}
                  aria-current={isActive(s.href) ? 'page' : undefined}
                >
                  <span className="font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                    {s.labelEn}
                  </span>
                  <span
                    className={`font-sans text-[16px] font-medium transition-colors duration-200 ${
                      justClicked(s.href) ? 'text-gift-green' : 'text-gift-ink hover:text-gift-green'
                    }`}
                  >
                    {s.label}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Rest of nav items */}
        {navItems.slice(serviceNavIndex).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => flashThenCloseMenu(item.href)}
            className={`flex items-center gap-4 leading-none transition-opacity duration-200 ${justClicked(item.href) ? 'opacity-60' : ''}`}
            aria-current={isActive(item.href) ? 'page' : undefined}
          >
            <span
              className={`font-display text-[28px] font-bold uppercase tracking-[0.1em] transition-colors duration-200 ${
                justClicked(item.href) ? 'text-gift-green' : 'text-gift-ink hover:text-gift-green'
              }`}
            >
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
