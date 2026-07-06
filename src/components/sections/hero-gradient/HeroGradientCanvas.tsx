'use client';

import { Canvas } from '@react-three/fiber';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';
import FluidPlane from './FluidPlane';

interface Props {
  onContextLost: () => void;
  onReady?: () => void;
  /**
   * 'always' while the hero is on screen, 'never' once it scrolls out of view.
   * The fluid sim is ~36 GPU passes/frame (32 Jacobi pressure iterations); with
   * frameloop always it kept solving the whole time the homepage was mounted —
   * even far below the fold — starving the GPU and making the rest of the page
   * scroll heavily on mobile. Pausing offscreen frees the frame budget for
   * everything below (incl. the AIOps aurora section). See HeroBackground.
   */
  frameloop?: 'always' | 'never' | 'demand';
}

export default function HeroGradientCanvas({ onContextLost, onReady, frameloop = 'always' }: Props) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      aria-hidden
      gl={makeSafeRenderer(
        { antialias: false, alpha: true, powerPreference: 'high-performance' },
        onContextLost,
      )}
      dpr={[1, 2]}
      frameloop={frameloop}
    >
      <FluidPlane onReady={onReady} />
    </Canvas>
  );
}
