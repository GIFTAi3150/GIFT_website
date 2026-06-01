'use client';

type DotsGridProps = {
  className?: string;
  /** Pixels between dot centers. Smaller = denser grid. */
  spacing?: number;
  /** Dot diameter in pixels. */
  dotSize?: number;
  /** Color of dots. RGBA or hex. */
  baseColor?: string;
  /** Accepted for API compatibility with callers — the interactive
   *  proximity/magnetic effects are gone in the CSS implementation. */
  activeColor?: string;
  proximityRadius?: number;
  magnetStrength?: number;
};

/**
 * Static dot pattern rendered as a CSS `radial-gradient` tiled via
 * `background-size`. Replaces the prior canvas-based implementation
 * (commit history) which measured the section's bounds in JS and was
 * recurringly broken on route-back to the homepage because the canvas's
 * effective size was being read at the wrong moment in layout. CSS
 * tiling delegates the sizing to the browser entirely — there is
 * nothing to measure, nothing to observe, nothing to re-mount — so the
 * pattern always fills its container at whatever size CSS computes.
 *
 * Trade-off: the prior version had a proximity glow (dots near the
 * cursor brightened) and a subtle magnetic pull (dots leaned toward the
 * cursor). Both were JS-driven. They are not in this version. If the
 * cursor-follow feel is wanted back, layer a separate radial-gradient
 * overlay driven by a `--mx/--my` CSS variable on top of this div —
 * that approach is still bulletproof on sizing.
 */
export default function DotsGrid({
  className,
  spacing = 22,
  dotSize = 3,
  baseColor = 'rgba(17, 27, 33, 0.14)',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activeColor: _activeColor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  proximityRadius: _proximityRadius,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  magnetStrength: _magnetStrength,
}: DotsGridProps) {
  const radius = dotSize / 2;
  return (
    <div
      className={className}
      aria-hidden
      style={{
        // One dot per tile, centered. The dot is opaque up to `radius`
        // pixels from the tile center and transparent beyond — gives a
        // clean circle without anti-aliasing artifacts at the edges.
        backgroundImage: `radial-gradient(circle, ${baseColor} ${radius}px, transparent ${radius}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        // Pin tile origin to the top-left so the grid lines up
        // predictably with the section edges regardless of scroll.
        backgroundPosition: '0 0',
      }}
    />
  );
}
