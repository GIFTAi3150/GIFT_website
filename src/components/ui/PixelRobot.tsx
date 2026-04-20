// Minimalist Claw'd-inspired pixel mascot — chunky body, simple black eyes,
// 1 antenna, 2 arms, 1 leg. Used in the ProcessFlow section and the 404 page.

export default function PixelRobot({ className = '' }: { className?: string }) {
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

      {/* Chunky body — rectangle with beveled top/bottom corners */}
      <rect x="7" y="6" width="10" height="1" />
      <rect x="6" y="7" width="12" height="10" />
      <rect x="7" y="17" width="10" height="1" />

      {/* Two simple black eyes — no pupils, no sparkles */}
      <rect x="9" y="10" width="2" height="2" fill="#111B21" />
      <rect x="13" y="10" width="2" height="2" fill="#111B21" />

      {/* Two arms — sticking out sideways */}
      <rect x="4" y="11" width="2" height="2" />
      <rect x="18" y="11" width="2" height="2" />

      {/* Single leg — centered at bottom */}
      <rect x="11" y="18" width="2" height="3" />
    </svg>
  );
}
