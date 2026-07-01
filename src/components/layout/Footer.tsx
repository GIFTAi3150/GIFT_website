'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import company from '@/data/company.json';
import { useNavTheme, navThemeVars } from '@/lib/navTheme';
import GiftLogo from '@/components/brand/GiftLogo';

const footerNav = [
  { href: '/company', en: 'ABOUT', ja: '会社概要' },
  { href: '/contact', en: 'CONTACT', ja: 'お問い合わせ' },
];

const footerServices = [
  { href: '/services/aiops', label: 'AIOps事業' },
];

export default function Footer() {
  const theme = useNavTheme();
  const themeStyle = navThemeVars(theme) as CSSProperties;
  return (
    <footer
      className="bg-[var(--nav-bg)] text-[var(--nav-text)]"
      style={themeStyle}
    >
      <div className="mx-auto max-w-container px-4 py-s-80 md:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              aria-label="株式会社GIFT トップページ"
              className="inline-flex w-fit transition-transform duration-200 hover:scale-105"
            >
              <GiftLogo
                shieldFill={theme.logoShield}
                innerFill={theme.logoInner}
                className="h-10 w-auto"
              />
            </Link>
            <p className="font-sans text-normal text-[var(--nav-text-muted)]" style={{ lineHeight: '1.8' }}>
              {company.address}
            </p>
            <p className="font-sans text-normal text-[var(--nav-text-muted)]">TEL: {company.phone}</p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <nav aria-label="フッターナビゲーション" className="flex flex-col gap-4">
              {footerNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 whitespace-nowrap leading-none"
                >
                  <span className="w-20 font-display text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--nav-text)] transition-colors duration-150 group-hover:text-[var(--nav-accent)]">
                    {item.en}
                  </span>
                  <span aria-hidden className="h-4 w-px bg-white/20" />
                  <span className="font-sans text-small font-light text-[var(--nav-text-muted)] transition-colors duration-150 group-hover:text-[var(--nav-accent)]">
                    {item.ja}
                  </span>
                </Link>
              ))}
            </nav>

            <nav aria-label="事業内容ナビゲーション" className="flex flex-col gap-3">
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.15em] text-[var(--nav-text)]">
                SERVICE
              </span>
              {footerServices.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="whitespace-nowrap font-sans text-small font-light text-[var(--nav-text-muted)] transition-colors duration-150 hover:text-[var(--nav-accent)]"
                >
                  {s.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-[var(--nav-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-small text-[var(--nav-text-faint)]">
            &copy; Copyright 2026 GIFT inc. All Rights Reserved.
          </p>
          <Link
            href="/privacy"
            className="font-sans text-small text-[var(--nav-text-faint)] transition-colors hover:text-[var(--nav-text)]"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </footer>
  );
}
