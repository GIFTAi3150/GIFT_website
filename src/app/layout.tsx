import type { Metadata } from 'next';
import { notoSansJP, poppins } from './fonts';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '株式会社GIFT | Gift an opportunity',
  description: 'テレマーケティング・LINE運用・RPA・不動産事業を展開する株式会社GIFTの公式サイト。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${poppins.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
