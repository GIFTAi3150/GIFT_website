'use client';

// Static SVG cherry-$ glyph. Replaces the previous Three.js Canvas hero
// asset on /services/finance-consulting. Shares the same default export
// name so finance-consulting/page.tsx doesn't need to change.
//
// Gentle ±22deg rotateY swing + float (CSS-only). No WebGL context, no
// GPU pressure. The .dollar-svg-wrap class + animation are defined in
// finance.css alongside the existing .cube-stage perspective container.

export default function DollarSignHero() {
  return (
    <div className="dollar-svg-wrap" aria-hidden>
      <svg
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="ds-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5d6c" />
            <stop offset="38%" stopColor="#e63946" />
            <stop offset="100%" stopColor="#8c1a24" />
          </linearGradient>
          <linearGradient id="ds-spec" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="48%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <filter id="ds-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" />
          </filter>
        </defs>

        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e63946"
          opacity="0.45"
          filter="url(#ds-glow)"
          fontFamily="var(--font-bricolage), Georgia, serif"
          fontSize="180"
          fontWeight="900"
        >
          $
        </text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#ds-fill)"
          fontFamily="var(--font-bricolage), Georgia, serif"
          fontSize="180"
          fontWeight="900"
        >
          $
        </text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="url(#ds-spec)"
          fontFamily="var(--font-bricolage), Georgia, serif"
          fontSize="180"
          fontWeight="900"
          style={{ mixBlendMode: 'screen' as const }}
        >
          $
        </text>
      </svg>
    </div>
  );
}
