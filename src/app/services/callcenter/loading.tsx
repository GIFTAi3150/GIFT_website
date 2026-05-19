// Route-level loading state for /services/callcenter. Matches the
// actual hero palette — vibrant electric-blue → coral gradient with
// citrus glow and an equalizer bar pattern at the bottom — so the
// transition into the real hero is seamless. The previous skeleton
// was dark ink-on-ink, which mismatched the colorful video and
// caused a jarring flash.
//
// Colors lifted directly from /public/callcenter-hero.svg:
//   #1B33CC / #2E4BFF — electric blue (gradient base)
//   #FF6B35           — vibrant coral (gradient end + bottom wash)
//   #FFD23F           — golden yellow (top-right citrus glow)
//   #FFFCF3           — cream (type + equalizer cream bars)
//   #5E78FF, #FF8A5C  — pastel variants for floating dots

export default function CallCenterLoading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        overflow: 'hidden',
      }}
      aria-label="Loading"
    >
      {/* Base gradient — same diagonal stops as the hero SVG. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, #1B33CC 0%, #2E4BFF 55%, #FF6B35 100%)',
        }}
      />
      {/* Coral wash from bottom-left — slow scale-pulse so the
          loading state breathes without spinning. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 10% 110%, rgba(255, 107, 53, 0.7) 0%, transparent 60%)',
          animation: 'ccLoadingWash 5s ease-in-out infinite',
        }}
      />
      {/* Citrus glow from top-right. */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 90% 5%, rgba(255, 210, 63, 0.5) 0%, transparent 55%)',
          animation: 'ccLoadingWash 5s ease-in-out infinite reverse',
        }}
      />

      {/* Floating multicolored dots — same scattered placement as the
          SVG (without the precision; we just want the visual texture).
          Each one fades in/out on its own delay so the field shimmers. */}
      <div style={{ position: 'absolute', inset: 0 }} aria-hidden>
        {[
          { x: '10%', y: '15%', r: 32, c: '#2E4BFF', d: '0s' },
          { x: '22%', y: '32%', r: 42, c: '#FFD23F', d: '0.4s' },
          { x: '36%', y: '12%', r: 52, c: '#5E78FF', d: '0.8s' },
          { x: '54%', y: '46%', r: 62, c: '#FF8A5C', d: '1.2s' },
          { x: '70%', y: '22%', r: 28, c: '#FFFCF3', d: '1.6s' },
          { x: '84%', y: '64%', r: 38, c: '#2E4BFF', d: '2s' },
          { x: '92%', y: '14%', r: 48, c: '#FF6B35', d: '2.4s' },
          { x: '8%', y: '78%', r: 36, c: '#FFD23F', d: '2.8s' },
        ].map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: dot.x,
              top: dot.y,
              width: dot.r * 2,
              height: dot.r * 2,
              borderRadius: '50%',
              background: dot.c,
              opacity: 0.45,
              animation: `ccLoadingDot 3s ease-in-out ${dot.d} infinite`,
            }}
          />
        ))}
      </div>

      {/* Equalizer bar strip along the bottom — signature element of
          the hero SVG, simplified to ~24 bars with a wave animation
          that travels left-to-right. Reads instantly as "callcenter /
          voice." */}
      <div
        style={{
          position: 'absolute',
          bottom: 'clamp(60px, 12vh, 120px)',
          left: 0,
          right: 0,
          height: 88,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-start',
          paddingLeft: 'clamp(20px, 4vw, 60px)',
          gap: 12,
          opacity: 0.85,
        }}
        aria-hidden
      >
        {Array.from({ length: 24 }).map((_, i) => {
          // Cycle accent colors every few bars.
          const accents = ['#FF6B35', '#FFD23F', '#FFFCF3', '#FFFCF3', '#FFFCF3'];
          const color = accents[i % accents.length];
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: 30,
                borderRadius: 3,
                background: color,
                animation: `ccLoadingEq 1.4s ease-in-out ${i * 0.06}s infinite`,
                transformOrigin: 'bottom',
              }}
            />
          );
        })}
      </div>

      {/* Ghost headline — proportional blocks where the real
          "声で、誰かの一日を、変える人になる。" headline will land.
          Cream blocks with one coral accent block standing in for
          the 誰 character. */}
      <div
        style={{
          position: 'relative',
          padding: 'clamp(108px, 8vw, 128px) clamp(20px, 6vw, 96px)',
          maxWidth: 920,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          opacity: 0.7,
          animation: 'ccLoadingPulse 1.8s ease-in-out infinite',
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: '#FF6B35', opacity: 0.95 }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
          <div style={{ width: 'clamp(40px, 6vw, 90px)', height: 'clamp(48px, 6.4vw, 112px)', borderRadius: 6, background: 'rgba(255, 252, 243, 0.7)' }} />
        </div>

        {/* CTA pill stub. */}
        <div
          style={{
            marginTop: 32,
            width: 200,
            height: 56,
            borderRadius: 999,
            border: '1.5px solid rgba(255, 252, 243, 0.55)',
            background: 'rgba(255, 252, 243, 0.08)',
          }}
        />
      </div>

      {/* Inline keyframes — kept local so the loader doesn't depend on
          twilight.css being parsed before first paint. */}
      <style>{`
        @keyframes ccLoadingWash {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.1); }
        }
        @keyframes ccLoadingDot {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50%      { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes ccLoadingEq {
          0%, 100% { height: 30px; }
          50%      { height: 78px; }
        }
        @keyframes ccLoadingPulse {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
