'use client';

/**
 * ColorBends — animated "color bends" backdrop, CSS-only.
 *
 * History: this began as a WebGL port of ReactBits' Color Bends shader, but a
 * live WebGL shader running as a SECOND GPU context (next to the aiops hero)
 * renders blank on phones with no reliable fix. To keep the backdrop IDENTICAL
 * on desktop and mobile (user's call, 2026-07-06), it is now a pure CSS
 * animated gradient in the same blue/violet/cyan palette — no GPU context, so
 * it paints on every device. The old shader is preserved in git history and in
 * the project_aiops_features_colorbends memory if we ever revisit it.
 *
 * All the visual work lives in `.colorbends-css-layer` in dx-v3.css.
 */

import type { CSSProperties } from 'react';

type Props = {
  className?: string;
  style?: CSSProperties; // merged over the base (e.g. full-bleed left/right)
  opacity?: number; // wash strength over the section background
};

export default function ColorBends({ className = '', style, opacity = 0.85 }: Props) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <div className="colorbends-css-layer" style={{ opacity }} />
    </div>
  );
}
