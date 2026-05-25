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
  /** Primary text color (nav items, headings). */
  text: string;
  /** Secondary / muted text (labels, sub-items). */
  textMuted: string;
  /** Very faint text (copyright, footnotes). */
  textFaint: string;
};

const DEFAULT_THEME: NavTheme = {
  bg: '#EBEEF3',
  bgAlpha: 'rgba(235, 238, 243, 0.95)',
  bgFull: '#EBEEF3',
  accent: '#25D366',
  accentDeep: '#1EBE5B',
  border: '#CDD0D5',
  bgAlt: '#F7F9FC',
  ink: '#111B21',
  muted: '#3A3A3A',
  logoShield: '#234a2d',
  logoInner: '#ffffff',
  text: '#111B21',
  textMuted: '#3A3A3A',
  textFaint: 'rgba(17, 27, 33, 0.40)',
};

const CALLCENTER_THEME: NavTheme = {
  bg: '#F2EBDC',
  bgAlpha: 'rgba(242, 235, 220, 0.95)',
  bgFull: '#F2EBDC',
  accent: '#E5347A',
  accentDeep: '#B81E5B',
  border: '#D9CDB3',
  bgAlt: '#F8F2E4',
  ink: '#0E0A24',
  muted: '#221945',
  logoShield: '#3D2EC4',
  logoInner: '#F2EBDC',
  text: '#0E0A24',
  textMuted: '#221945',
  textFaint: 'rgba(14, 10, 36, 0.40)',
};

const DX_CONSULTING_THEME: NavTheme = {
  bg: '#f5f7ff',
  bgAlpha: 'rgba(245, 247, 255, 0.95)',
  bgFull: '#f5f7ff',
  accent: '#FF4D6D',
  accentDeep: '#E63950',
  border: '#c9d3f5',
  bgAlt: '#e6eeff',
  ink: '#0b1340',
  muted: '#6b7aa8',
  logoShield: '#635bff',
  logoInner: '#f5f7ff',
  text: '#0b1340',
  textMuted: '#6b7aa8',
  textFaint: 'rgba(11, 19, 64, 0.40)',
};

const FINANCE_THEME: NavTheme = {
  bg: '#f3f1e7',
  bgAlpha: 'rgba(243, 241, 231, 0.95)',
  bgFull: '#f3f1e7',
  accent: '#e63946',
  accentDeep: '#c1232f',
  border: '#d6d2c2',
  bgAlt: '#e8e5d6',
  ink: '#0a0908',
  muted: '#454238',
  logoShield: '#e63946',
  logoInner: '#f3f1e7',
  text: '#0a0908',
  textMuted: '#454238',
  textFaint: 'rgba(10, 9, 8, 0.40)',
};

const MEMBER_THEME: NavTheme = {
  bg: '#F4EFE6',
  bgAlpha: 'rgba(244, 239, 230, 0.95)',
  bgFull: '#F4EFE6',
  accent: '#D96B43',
  accentDeep: '#B85530',
  border: '#DDD0BA',
  bgAlt: '#EBE3D2',
  ink: '#2A2520',
  muted: '#6B5F52',
  logoShield: '#D96B43',
  logoInner: '#F4EFE6',
  text: '#2A2520',
  textMuted: '#6B5F52',
  textFaint: 'rgba(42, 37, 32, 0.40)',
};

const RECRUIT_THEME: NavTheme = {
  bg: '#F5FBFC',
  bgAlpha: 'rgba(245, 251, 252, 0.96)',
  bgFull: '#FFFFFF',
  accent: '#226D7A',
  accentDeep: '#1A5260',
  border: '#C2DDE2',
  bgAlt: '#EBF7FA',
  ink: '#0F2428',
  muted: '#5F6360',
  logoShield: '#226D7A',
  logoInner: '#F5FBFC',
  text: '#0F2428',
  textMuted: '#5F6360',
  textFaint: 'rgba(15, 36, 40, 0.40)',
};

// Dark navy + gold theme matching the .achievements-page palette:
//   bg #0A1124 / accent #E8B04C / fg #FFFFFF
// Header and Footer wear the same dark surface so the chrome reads as
// part of the page rather than floating above it.
const ACHIEVEMENTS_THEME: NavTheme = {
  bg: '#0A1124',
  bgAlpha: 'rgba(10, 17, 36, 0.92)',
  bgFull: '#0A1124',
  accent: '#E8B04C',
  accentDeep: '#D89930',
  border: 'rgba(255, 255, 255, 0.12)',
  bgAlt: '#131C3C',
  ink: '#FFFFFF',
  muted: 'rgba(255, 255, 255, 0.60)',
  logoShield: '#E8B04C',
  logoInner: '#0A1124',
  text: 'rgba(255, 255, 255, 0.87)',
  textMuted: 'rgba(255, 255, 255, 0.55)',
  textFaint: 'rgba(255, 255, 255, 0.35)',
};

// Atelier High-Key Bone — warm bone bg, oxblood accent. Matches the /company page palette.
const COMPANY_THEME: NavTheme = {
  bg: '#F6F2EA',
  bgAlpha: 'rgba(246, 242, 234, 0.95)',
  bgFull: '#F6F2EA',
  accent: '#7B2D26',
  accentDeep: '#5C1D18',
  border: '#DDD8CD',
  bgAlt: '#EBE5D6',
  ink: '#1A1B1E',
  muted: '#6B6760',
  logoShield: '#7B2D26',
  logoInner: '#F6F2EA',
  text: '#1A1B1E',
  textMuted: '#6B6760',
  textFaint: 'rgba(26, 27, 30, 0.40)',
};

const THEME_MAP: Array<[RegExp, NavTheme]> = [
  [/^\/company(\/|$)/, COMPANY_THEME],
  [/^\/services\/callcenter(\/|$)/, CALLCENTER_THEME],
  [/^\/services\/dx-consulting(\/|$)/, DX_CONSULTING_THEME],
  [/^\/services\/finance-consulting(\/|$)/, FINANCE_THEME],
  [/^\/member(\/|$)/, MEMBER_THEME],
  [/^\/recruit(\/|$)/, RECRUIT_THEME],
  [/^\/achievements(\/|$)/, ACHIEVEMENTS_THEME],
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
    '--nav-text': theme.text,
    '--nav-text-muted': theme.textMuted,
    '--nav-text-faint': theme.textFaint,
  };
}
