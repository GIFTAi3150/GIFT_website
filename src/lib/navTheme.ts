'use client';

import { usePathname } from 'next/navigation';

// Per-page theme tokens for the global Header + Footer chrome.
// Service pages get their own palette (call center first, more to come).
// The default theme matches the WhatsApp-green system the rest of the site uses.

export type NavTheme = {
  /** Base background — used at top of page (no scroll). */
  bg: string;
  /** Background when the page is scrolled (with alpha). */
  bgAlpha: string;
  /** Mobile-nav full-screen overlay background. */
  bgFull: string;
  /** Active / hover accent color (replaces `--gift-green`). */
  accent: string;
  /** Slightly darker accent for hover-on-hover. */
  accentDeep: string;
  /** Hairline border + dividers. */
  border: string;
  /** Soft alt surface (dropdown rows, hover bands). */
  bgAlt: string;
  /** Body / heading text on this background. */
  ink: string;
  /** Muted text. */
  muted: string;
  /** Outer fill of the GIFT shield in the navbar/footer logo. */
  logoShield: string;
  /** Inner "G" fill in the navbar/footer logo. */
  logoInner: string;
};

const DEFAULT_THEME: NavTheme = {
  bg: '#EBEEF3',
  bgAlpha: 'rgba(235, 238, 243, 0.95)',
  bgFull: '#EBEEF3',
  accent: '#25D366',     // WhatsApp bright
  accentDeep: '#1EBE5B',
  border: '#CDD0D5',
  bgAlt: '#F7F9FC',
  ink: '#111B21',
  muted: '#3A3A3A',
  logoShield: '#234a2d',                    // original brand dark green
  logoInner: '#ffffff',
};

const CALLCENTER_THEME: NavTheme = {
  bg: '#F2EBDC',                            // cream linen
  bgAlpha: 'rgba(242, 235, 220, 0.95)',
  bgFull: '#F2EBDC',
  accent: '#E5347A',                        // magenta — most readable on cream
  accentDeep: '#B81E5B',
  border: '#D9CDB3',
  bgAlt: '#F8F2E4',
  ink: '#0E0A24',                           // deep night ink
  muted: '#221945',
  logoShield: '#3D2EC4',                    // indigo — primary brand color
  logoInner: '#F2EBDC',                     // cream — matches page bg, reads as cutout
};

const THEME_MAP: Array<[RegExp, NavTheme]> = [
  [/^\/services\/callcenter(\/|$)/, CALLCENTER_THEME],
  // Add more service themes here as they get designed (DX, Finance, …).
];

export function getNavThemeForPath(pathname: string): NavTheme {
  for (const [pattern, theme] of THEME_MAP) {
    if (pattern.test(pathname)) return theme;
  }
  return DEFAULT_THEME;
}

export function useNavTheme(): NavTheme {
  const pathname = usePathname();
  return getNavThemeForPath(pathname || '/');
}

/** CSS variable bag — spread into a `style` prop to expose theme tokens. */
export function navThemeVars(theme: NavTheme): Record<string, string> {
  return {
    '--nav-bg': theme.bg,
    '--nav-bg-alpha': theme.bgAlpha,
    '--nav-bg-full': theme.bgFull,
    '--nav-accent': theme.accent,
    '--nav-accent-deep': theme.accentDeep,
    '--nav-border': theme.border,
    '--nav-bg-alt': theme.bgAlt,
    '--nav-ink': theme.ink,
    '--nav-muted': theme.muted,
  };
}
