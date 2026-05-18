import type { Metadata } from 'next';
import HeadSkullScene from './HeadSkullScene';

export const metadata: Metadata = {
  title: 'Head/Skull Test',
  robots: { index: false, follow: false },
};

export default function DxHeadTestPage() {
  return <HeadSkullScene />;
}
