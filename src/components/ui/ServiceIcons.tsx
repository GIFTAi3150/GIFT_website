// Hand-drawn pixel-art icons for the 3 service cards.
// Uses integer-aligned <rect>s + shape-rendering=crispEdges for the blocky look.
// Color comes from currentColor, so parent's text color controls the icon tint.

type IconProps = { className?: string };

export function HeadsetIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {/* Top headband */}
      <rect x="8" y="4" width="8" height="2" />
      <rect x="6" y="6" width="2" height="2" />
      <rect x="16" y="6" width="2" height="2" />
      <rect x="4" y="8" width="2" height="2" />
      <rect x="18" y="8" width="2" height="2" />
      <rect x="3" y="10" width="1" height="3" />
      <rect x="20" y="10" width="1" height="3" />
      {/* Left ear cup */}
      <rect x="3" y="13" width="5" height="6" />
      {/* Right ear cup */}
      <rect x="16" y="13" width="5" height="6" />
      {/* Mic arm */}
      <rect x="12" y="19" width="1" height="2" />
      <rect x="13" y="21" width="2" height="1" />
    </svg>
  );
}

export function MonitorIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {/* Top + bottom frame */}
      <rect x="2" y="3" width="20" height="2" />
      <rect x="2" y="15" width="20" height="2" />
      {/* Side frame */}
      <rect x="2" y="5" width="2" height="10" />
      <rect x="20" y="5" width="2" height="10" />
      {/* Pixel content (chart-like) inside the screen */}
      <rect x="6" y="11" width="2" height="2" />
      <rect x="9" y="9" width="2" height="4" />
      <rect x="12" y="7" width="2" height="6" />
      <rect x="15" y="10" width="2" height="3" />
      {/* Stand */}
      <rect x="11" y="17" width="2" height="2" />
      <rect x="7" y="19" width="10" height="2" />
    </svg>
  );
}

export function ChartIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      {/* Baseline */}
      <rect x="2" y="20" width="20" height="2" />
      {/* Ascending bars */}
      <rect x="3" y="14" width="4" height="6" />
      <rect x="9" y="10" width="4" height="10" />
      <rect x="15" y="5" width="4" height="15" />
    </svg>
  );
}

// Map service id → icon component. Lets ServicesCards pick the right one per card.
export const SERVICE_ICON_BY_ID: Record<string, (p: IconProps) => JSX.Element> = {
  'callcenter': HeadsetIcon,
  'dx-consulting': MonitorIcon,
  'finance-consulting': ChartIcon,
};
