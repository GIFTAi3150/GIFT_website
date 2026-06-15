'use client';

// DEV preview for VAT playback (Plans.md T-010 / P3). Renders the baked
// particle cloud for a chosen shape with NO solver â€” the same component that
// will drive the DX hero in P4. Use this to confirm the bake looks like the
// live face (silhouette + shimmer) and that it runs in mobile device view
// without a crash. Available in dev only.

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { VatShape } from '@/app/services/aiops/_components/VatParticles';

const VatParticles = dynamic(
  () => import('@/app/services/aiops/_components/VatParticles'),
  { ssr: false },
);

const SHAPES: { slug: VatShape; label: string }[] = [
  { slug: 'head', label: 'Head' },
  { slug: 'logo', label: 'GIFT logo' },
  { slug: 'pet', label: 'Pet' },
];

export default function VatPreviewPage() {
  const [shape, setShape] = useState<VatShape>('logo');
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return (
      <main style={{ padding: 40, fontFamily: 'system-ui, sans-serif', color: '#111' }}>
        <h1>VAT preview (development only)</h1>
        <p>Run <code>npm run dev</code> and visit this URL locally.</p>
      </main>
    );
  }

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: '#f5f7ff' }}>
      {/* Full-viewport stage. VatParticles renders a <View> into the shared
          RootCanvas; this container gives it size + a visible flow box. */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <VatParticles shape={shape} />
      </div>

      <div
        style={{
          position: 'fixed', top: 20, left: 20, zIndex: 10, padding: 16,
          borderRadius: 12, background: 'rgba(8,10,18,0.85)',
          border: '1px solid rgba(255,255,255,0.12)', color: '#e7ecff',
          fontFamily: 'system-ui, sans-serif', backdropFilter: 'blur(8px)',
        }}
      >
        <h1 style={{ margin: '0 0 4px', fontSize: 15 }}>VAT preview (P3)</h1>
        <p style={{ margin: '0 0 12px', fontSize: 12, opacity: 0.6 }}>
          Baked playback Â· no solver Â· phone-safe
        </p>
        <div style={{ display: 'flex', gap: 6 }}>
          {SHAPES.map((s) => (
            <button
              key={s.slug}
              onClick={() => setShape(s.slug)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 6, fontSize: 12,
                cursor: 'pointer', whiteSpace: 'nowrap',
                border: shape === s.slug ? '1px solid #635bff' : '1px solid rgba(255,255,255,0.18)',
                background: shape === s.slug ? 'rgba(99,91,255,0.25)' : 'rgba(0,0,0,0.25)',
                color: '#fff', fontWeight: shape === s.slug ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}

