import * as THREE from 'three';
import { createWorksHeroBackdrop } from './createWorksHeroBackdrop';
import { makeSafeRenderer } from '@/lib/makeSafeRenderer';

export type WorksHeroScene = {
  setActive(active: boolean): void;
  setReducedMotion(reduced: boolean): void;
  dispose(): void;
};

// This canvas only supplies the animated gradient. Hero lettering and the ribbon
// remain in the DOM, so font loading and WebGL readiness cannot replace them.
export function createWorksHeroScene(
  canvas: HTMLCanvasElement,
  initialReducedMotion: boolean,
  onFailure: () => void,
): WorksHeroScene {
  const resources: Array<{ dispose(): void }> = [];
  let disposed = false;
  let failed = false;
  let active = true;
  let reduced = initialReducedMotion;
  let frame = 0;
  let elapsed = 0;
  let previousTime = 0;
  let observer: ResizeObserver | undefined;

  const renderer = makeSafeRenderer(
    { antialias: true, alpha: false, powerPreference: 'low-power' },
    () => {
      failed = true;
      cancelAnimationFrame(frame);
      canvas.dataset.motion = 'unavailable';
      onFailure();
    },
  )(canvas);
  renderer.setClearColor('#f0f7ff', 1);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect();
    resources.forEach((resource) => resource.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
  };

  try {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 30);
    camera.position.z = 5;

    const backdropGeometry = new THREE.PlaneGeometry(1, 1);
    const backdropAnimation = createWorksHeroBackdrop();
    const backdropMaterial = backdropAnimation.material;
    const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
    scene.add(backdrop);
    resources.push(backdropGeometry, backdropAnimation);

    let viewportWidth = 1;
    let viewportHeight = 1;
    const paint = () => {
      if (disposed || failed) return;
      try {
        renderer.render(scene, camera);
      } catch {
        failed = true;
        cancelAnimationFrame(frame);
        onFailure();
      }
    };

    const resize = () => {
      if (disposed || failed) return;
      const bounds = canvas.getBoundingClientRect();
      viewportWidth = Math.max(1, bounds.width);
      viewportHeight = Math.max(1, bounds.height);
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();

      const viewHeight = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      backdrop.scale.set(viewHeight * camera.aspect, viewHeight, 1);
      backdropAnimation.resize(viewportWidth, viewportHeight);
      paint();
    };

    const tick = (now: number) => {
      if (disposed || failed || !active || reduced) return;
      frame = requestAnimationFrame(tick);
      // This decorative effect does not need to render at a display's 120/144Hz.
      if (previousTime && now - previousTime < 1000 / 30) return;
      const frameDelta = previousTime ? (now - previousTime) / 1000 : 0;
      const delta = Math.min(frameDelta, 0.1);
      previousTime = now;
      elapsed += delta;
      backdropAnimation.update(elapsed);
      paint();
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      previousTime = 0;
      canvas.dataset.motion = reduced ? 'still' : active ? 'running' : 'paused';
      if (disposed || failed) return;
      if (active) paint();
      if (active && !reduced) frame = requestAnimationFrame(tick);
    };

    resize();
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    canvas.dataset.background = 'grainient';
    sync();

    return {
      setActive(next) {
        active = next;
        sync();
      },
      setReducedMotion(next) {
        reduced = next;
        sync();
      },
      dispose,
    };
  } catch (error) {
    dispose();
    throw error;
  }
}
