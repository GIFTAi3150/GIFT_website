// Minimalist Claw'd-inspired pixel mascot — chunky body, simple black eyes,
// 1 antenna, 2 arms, 1 leg. Used in the ProcessFlow section, the 404 page,
// empty states, and the contact success state.

type Pose = 'idle' | 'wave' | 'sleep';

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

      {/* Chunky body — rectangle with beveled top/bottom corners */}
      <rect x="7" y="6" width="10" height="1" />
      <rect x="6" y="7" width="12" height="10" />
      <rect x="7" y="17" width="10" height="1" />

      {/* Eyes — open (idle/wave) or closed slits (sleep) */}
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

      {/* Right arm — raised + waving when wave, otherwise at rest */}
      {pose === 'wave' ? (
        <g className="robot-arm-wave">
          <rect x="18" y="9" width="2" height="2" />
          <rect x="19" y="7" width="2" height="2" />
        </g>
      ) : (
        <rect x="18" y="11" width="2" height="2" />
      )}

      {/* Single leg — centered at bottom */}
      <rect x="11" y="18" width="2" height="3" />
    </svg>
  );
}
