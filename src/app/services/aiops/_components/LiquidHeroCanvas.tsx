'use client';

import { Canvas } from '@react-three/fiber';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';
import LiquidHeroScene from './LiquidHeroScene';

interface Props {
  presetIndex?: number;
  isInit?: boolean;
  onContextLost: () => void;
  onReady?: () => void;
}

/**
 * R3F Canvas for the liquid-paint hero. Mirrors HeroGradientCanvas: a
 * `makeSafeRenderer` gl factory (registers our context-loss blocker BEFORE
 * three's constructor — see makeSafeRenderer.ts), capped dpr, always-on
 * frameloop. Camera matches loudsrl's exactly: a 1°-fov perspective at z=1, so
 * the 2×2 clip-plane massively overfills the frustum and always covers the
 * viewport regardless of aspect. Clear colour is opaque black (loudsrl's
 * `gl.setClearColor('#000000')`) so the canvas fully hides the CSS fallback
 * field when the shader is live.
 */
export default function LiquidHeroCanvas({ presetIndex = 0, isInit = true, onContextLost, onReady }: Props) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden
      gl={makeSafeRenderer(
        { antialias: true, alpha: true, powerPreference: 'high-performance' },
        onContextLost,
      )}
      dpr={[1, 2]}
      camera={{ fov: 1, position: [0, 0, 1] }}
      frameloop="always"
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 1);
      }}
    >
      <LiquidHeroScene presetIndex={presetIndex} isInit={isInit} onReady={onReady} />
    </Canvas>
  );
}
