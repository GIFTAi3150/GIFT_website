// Minimalist Claw'd-inspired pixel mascot — chunky body, simple black eyes,
// 1 antenna, 2 arms, 1 leg. Used in the ProcessFlow section, the 404 page,
// empty states, the contact success state, and the achievements hero.

type Pose = 'idle' | 'wave' | 'sleep' | 'holdTrophy';

export default function PixelRobot({
  className = '',
  pose = 'idle',
}: {
  className?: string;
  pose?: Pose;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {/* Trophy clipPath — only used when pose is holdTrophy, but defining it always is harmless */}
      <defs>
        <clipPath id="robot-trophy-clip">
          <rect x="16" y="1" width="6" height="1" />
          <rect x="17" y="2" width="4" height="2" />
          <rect x="18" y="4" width="2" height="1" />
          <rect x="17" y="5" width="4" height="1" />
        </clipPath>
      </defs>

      {/* Single little antenna */}
      <g className="robot-antenna">
        <rect x="11" y="3" width="2" height="2" />
        <rect x="11" y="5" width="2" height="1" />
      </g>

      {/* Floating Zs — only when sleeping */}
      {pose === 'sleep' && (
        <g className="robot-zzz">
          <rect x="18" y="3" width="3" height="1" />
          <rect x="19" y="4" width="1" height="1" />
          <rect x="18" y="5" width="3" height="1" />
        </g>
      )}

      {/* Trophy held aloft + diagonal shine sweep — only when holdTrophy */}
      {pose === 'holdTrophy' && (
        <>
          {/* Trophy fill — small pixel cup in gold so it's visually distinct from the green robot.
              Hardcoded #D98B1F (gift-warning amber) — overrides currentColor inherited by the SVG. */}
          <g fill="#D98B1F">
            <rect x="16" y="1" width="6" height="1" />
            <rect x="17" y="2" width="4" height="2" />
            <rect x="18" y="4" width="2" height="1" />
            <rect x="17" y="5" width="4" height="1" />
          </g>
          {/* Shine sweep — clipped to trophy shape, sweeps diagonally every ~5s */}
          <g clipPath="url(#robot-trophy-clip)">
            <g transform="rotate(25 19 3)">
              <rect className="trophy-shine" x="13" y="-3" width="1" height="12" fill="white" opacity="0">
                <animate
                  attributeName="opacity"
                  values="0; 0; 0.85; 0.85; 0; 0"
                  keyTimes="0; 0.25; 0.32; 0.55; 0.6; 1"
                  dur="5s"
                  repeatCount="indefinite"
                />
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0; 0 0; 12 0; 12 0"
                  keyTimes="0; 0.25; 0.6; 1"
                  dur="5s"
                  repeatCount="indefinite"
                />
              </rect>
            </g>
          </g>
        </>
      )}

      {/* Chunky body — rectangle with beveled top/bottom corners */}
      <rect x="7" y="6" width="10" height="1" />
      <rect x="6" y="7" width="12" height="10" />
      <rect x="7" y="17" width="10" height="1" />

      {/* Eyes — open (idle/wave/holdTrophy) or closed slits (sleep) */}
      {pose === 'sleep' ? (
        <>
          <rect x="9" y="11" width="2" height="1" fill="#111B21" />
          <rect x="13" y="11" width="2" height="1" fill="#111B21" />
        </>
      ) : (
        <>
          <rect x="9" y="10" width="2" height="2" fill="#111B21" />
          <rect x="13" y="10" width="2" height="2" fill="#111B21" />
        </>
      )}

      {/* Left arm — always at rest */}
      <rect x="4" y="11" width="2" height="2" />

      {/* Right arm — wave (animated), holdTrophy (raised vertically up to grip trophy), or rest */}
      {pose === 'wave' ? (
        <g className="robot-arm-wave">
          <rect x="18" y="9" width="2" height="2" />
          <rect x="19" y="7" width="2" height="2" />
        </g>
      ) : pose === 'holdTrophy' ? (
        <g>
          {/* Palm/hand gripping trophy base */}
          <rect x="17" y="6" width="4" height="1" />
          {/* Forearm extending up from body shoulder */}
          <rect x="18" y="7" width="2" height="3" />
        </g>
      ) : (
        <rect x="18" y="11" width="2" height="2" />
      )}

      {/* Single leg — centered at bottom */}
      <rect x="11" y="18" width="2" height="3" />
    </svg>
  );
}
