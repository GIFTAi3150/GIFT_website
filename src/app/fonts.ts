import { Noto_Sans_JP, Poppins } from 'next/font/google';

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
