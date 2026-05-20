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

const DX_CONSULTING_THEME: NavTheme = {
  bg: '#f5f7ff',                            // paper — light blurple tint
  bgAlpha: 'rgba(245, 247, 255, 0.95)',
  bgFull: '#f5f7ff',
  accent: '#FF4D6D',                        // vivid coral — hover/secondary pop
  accentDeep: '#E63950',                    // deeper coral — hover-on-hover
  border: '#c9d3f5',                        // hairline
  bgAlt: '#e6eeff',                         // paper-2 — dropdown hover band
  ink: '#0b1340',                           // deep navy ink
  muted: '#6b7aa8',                         // silver slate
  logoShield: '#635bff',                    // blurple — page brand stays primary
  logoInner: '#f5f7ff',                     // paper cutout — reads as negative space
};

// Mirrors the .finance-page CSS palette in
// src/app/services/finance-consulting/finance.css:
//   --paper #f3f1e7 / --ink #0a0908 / --cherry #e63946.
// The finance design is editorial-print: warm off-white background,
// near-black ink, cherry red as the accent voice. Header + Footer
// inherit the same palette so chrome reads as one piece with the page.
const FINANCE_THEME: NavTheme = {
  bg: '#f3f1e7',                            // paper
  bgAlpha: 'rgba(243, 241, 231, 0.95)',
  bgFull: '#f3f1e7',
  accent: '#e63946',                        // cherry — page's signature accent
  accentDeep: '#c1232f',                    // cherry-deep — hover-on-hover
  border: '#d6d2c2',                        // warm hairline that reads on paper
  bgAlt: '#e8e5d6',                         // paper-2 — dropdown hover band
  ink: '#0a0908',                           // near-black ink
  muted: '#454238',                         // ink-soft
  logoShield: '#e63946',                    // cherry — page brand stays primary
  logoInner: '#f3f1e7',                     // paper cutout — reads as negative space
};

// Mirrors the warm-cream + terracotta palette applied to the /member
// page (src/app/member/page.tsx and TeamGreet.tsx):
//   bg #F4EFE6 / surface #EBE3D2 / ink #2A2520 / terracotta #D96B43.
// Magazine / risograph print feel — the Header and Footer wear the
// same paper-and-ink palette as the page so the chrome reads as part
// of the spread rather than floating above it.
const MEMBER_THEME: NavTheme = {
  bg: '#F4EFE6',                            // warm cream paper
  bgAlpha: 'rgba(244, 239, 230, 0.95)',
  bgFull: '#F4EFE6',
  accent: '#D96B43',                        // terracotta — page accent
  accentDeep: '#B85530',                    // terracotta-deep — hover-on-hover
  border: '#DDD0BA',                        // warm hairline
  bgAlt: '#EBE3D2',                         // deeper cream — dropdown hover band
  ink: '#2A2520',                           // warm ink
  muted: '#6B5F52',                         // warm gray
  logoShield: '#D96B43',                    // terracotta — page brand stays primary
  logoInner: '#F4EFE6',                     // cream cutout — matches page bg
};

const THEME_MAP: Array<[RegExp, NavTheme]> = [
  [/^\/services\/callcenter(\/|$)/, CALLCENTER_THEME],
  [/^\/services\/dx-consulting(\/|$)/, DX_CONSULTING_THEME],
  [/^\/services\/finance-consulting(\/|$)/, FINANCE_THEME],
  [/^\/member(\/|$)/, MEMBER_THEME],
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
