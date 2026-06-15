import {
  Anton,
  Forum,
  Noto_Sans_JP,
  Open_Sans,
  Poppins,
  Shippori_Antique_B1,
} from 'next/font/google';

// ── Biscom-reference hero fonts ──────────────────────────────────────
// Forum: elegant EN display serif (their --font-en).
// Shippori Antique B1: JP antique gothic (their --font-mincho).
export const forum = Forum({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-forum',
  display: 'swap',
});

export const shipporiAntique = Shippori_Antique_B1({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shippori',
  display: 'swap',
});

export const notoSansJP = Noto_Sans_JP({
  weight: ['300', '500', '800'],
  subsets: ['latin'],
  variable: '--font-noto-jp',
  display: 'swap',
});

export const poppins = Poppins({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const minchoStack =
  '"游明朝","Yu Mincho","Hiragino Mincho ProN W3","ヒラギノ明朝 ProN W3",serif';

export const anton = Anton({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-anton',
  display: 'swap',
});

export const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-open-sans',
  display: 'swap',
});
