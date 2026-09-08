'use client';

import { Canvas } from '@react-three/fiber';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';
import AoLiquidScene from './AoLiquidScene';

interface Props {
  isInit?: boolean;
  /** Phone: dpr capped at 1 (the plate is the whole viewport). */
  maxDpr: number;
  /** prefers-reduced-motion: one frame, then still. */
  reduced: boolean;
  onContextLost: () => void;
  onReady?: () => void;
}

/**
 * R3F Canvas for the liquid plate. `makeSafeRenderer` registers our context-
 * loss blocker BEFORE three's constructor (see makeSafeRenderer.ts). Camera is
 * loudsrl's: a 1°-fov perspective at z=1, so the 2×2 clip-plane overfills the
 * frustum whatever the aspect. Opaque canvas, navy clear — the plate is the
 * page's ground, nothing shows through it.
 */
export default function AoLiquidCanvas({ isInit = true, maxDpr, reduced, onContextLost, onReady }: Props) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden
      gl={makeSafeRenderer(
        { antialias: false, alpha: false, powerPreference: 'high-performance' },
        onContextLost,
      )}
      dpr={[1, maxDpr]}
      camera={{ fov: 1, position: [0, 0, 1] }}
      frameloop={reduced ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.setClearColor(0x0b1020, 1);
      }}
    >
      <AoLiquidScene isInit={isInit} onReady={onReady} />
    </Canvas>
  );
}
