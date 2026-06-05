'use client';

import { Canvas } from '@react-three/fiber';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';
import FluidPlane from './FluidPlane';

interface Props {
  onContextLost: () => void;
  onReady?: () => void;
}

export default function HeroGradientCanvas({ onContextLost, onReady }: Props) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden
      gl={makeSafeRenderer(
        { antialias: false, alpha: true, powerPreference: 'high-performance' },
        onContextLost,
      )}
      dpr={[1, 2]}
      frameloop="always"
    >
      <FluidPlane onReady={onReady} />
    </Canvas>
  );
}
