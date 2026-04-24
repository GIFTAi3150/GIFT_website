import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description:
    '株式会社GIFTへのお問い合わせはこちらから。コールセンター・DXコンサル・財務コンサル・採用に関するご相談を承ります。',
  alternates: { canonical: '/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
