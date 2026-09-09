'use client';

import { useEffect, useRef, useState } from 'react';
import { MotionCache } from './motionCache';

const POSES = [
  [0, 0.35],
  [0.125, 1.3],
  [0.25, 2.5],
  [0.375, 3.8],
  [0.5, 5.2],
  [0.625, 6.3],
  [0.75, 7.25],
  [0.875, 8.5],
  [1, 9.55],
] as const;

const REST_PHASE = 0.1184;
const WIDTH = 576;
const HEIGHT = 502;
const ASSET_ROOT = '/media/web-development';

interface PoseManifest {
  width: number;
  height: number;
  frameCount: number;
  duration: number;
  frames: [number, number][];
}

function poseTime(phase: number) {
  const normalized = ((phase % 1) + 1) % 1;
  for (let index = 1; index < POSES.length; index += 1) {
    if (normalized <= POSES[index][0]) {
      const [start, startTime] = POSES[index - 1];
      const [end, endTime] = POSES[index];
      return startTime + ((normalized - start) / (end - start)) * (endTime - startTime);
    }
  }
  return 1.25;
}

export default function WebCharacter() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wakeRef = useRef<() => void>(() => undefined);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(false);
    if (!enabled) return;

    const surface = canvasRef.current;
    const container = stageRef.current;
    const context = surface?.getContext('2d', { alpha: true });
    if (!surface || !container || !context || typeof createImageBitmap !== 'function') {
      setEnabled(false);
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) {
      setEnabled(false);
      return;
    }
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const abort = new AbortController();
    let disposed = false;
    let visible = true;
    let frameRequest = 0;
    let phase = REST_PHASE;
    let targetPhase = REST_PHASE;
    let lastTime = 0;
    let lastPaintAt = 0;
    let paintedFrame = -1;
    let hasFrame = false;
    let decodeErrors = 0;
    let slowFrames = 0;
    let fps = coarsePointer ? 18 : 24;
    let bounds = container.getBoundingClientRect();
    let manifest: PoseManifest | undefined;
    let pool: MotionCache<ImageBitmap> | undefined;

    const stop = () => {
      cancelAnimationFrame(frameRequest);
      frameRequest = 0;
      lastTime = 0;
    };
    const mayAnimate = () => !disposed && visible && !document.hidden;
    const wake = () => {
      if (!frameRequest && mayAnimate()) frameRequest = requestAnimationFrame(tick);
    };
    const fail = () => {
      if (disposed) return;
      stop();
      setEnabled(false);
    };
    const updateBounds = () => {
      bounds = container.getBoundingClientRect();
    };
    const rest = () => {
      targetPhase = REST_PHASE;
      wake();
    };
    const onPointer = (event: PointerEvent) => {
      if (!mayAnimate() || (event.pointerType === 'touch' && event.buttons === 0)) return;
      const dx = event.clientX - (bounds.left + bounds.width * 0.53);
      const dy = event.clientY - (bounds.top + bounds.height * 0.29);
      targetPhase =
        Math.hypot(dx, dy) < 38 ? REST_PHASE : (Math.atan2(-dy, dx) / (Math.PI * 2) + 1) % 1;
      wake();
    };
    const onTouchStart = (event: PointerEvent) => {
      if (event.pointerType === 'touch') onPointer(event);
    };
    const onTouchEnd = (event: PointerEvent) => {
      if (event.pointerType === 'touch') rest();
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        updateBounds();
        rest();
      }
    };
    const onMotionPreference = () => {
      if (reducedMotion.matches) setEnabled(false);
    };
    const tick = (now: number) => {
      frameRequest = 0;
      if (!mayAnimate() || !pool || !manifest) {
        lastTime = 0;
        return;
      }
      const elapsed = lastTime ? now - lastTime : 16.7;
      lastTime = now;
      if (elapsed > 100) {
        slowFrames += 1;
        fps = 12;
      } else {
        slowFrames = Math.max(0, slowFrames - 1);
      }
      if (slowFrames >= 8) {
        fail();
        return;
      }

      const difference = ((targetPhase - phase + 1.5) % 1) - 0.5;
      const moving = Math.abs(difference) > 0.0015;
      phase = moving
        ? (phase + difference * (1 - Math.exp((-Math.min(elapsed, 70) / 1000) * 13)) + 1) % 1
        : targetPhase;
      const index = Math.max(
        0,
        Math.min(
          manifest.frameCount - 1,
          Math.round((poseTime(phase) / manifest.duration) * (manifest.frameCount - 1)),
        ),
      );
      const direction = difference < 0 ? -1 : 1;
      pool.request(
        [index, index + direction, index + direction * 2, index - direction].filter(
          (candidate) => candidate >= 0 && candidate < manifest!.frameCount,
        ),
      );
      const frame = pool.get(index);
      if (frame && index !== paintedFrame && now - lastPaintAt >= 1000 / fps) {
        try {
          context.clearRect(0, 0, WIDTH, HEIGHT);
          context.drawImage(frame, 0, 0, WIDTH, HEIGHT);
          paintedFrame = index;
          lastPaintAt = now;
          if (!hasFrame) {
            hasFrame = true;
            setReady(true);
          }
        } catch {
          fail();
          return;
        }
      }
      if (moving || (frame && paintedFrame !== index)) wake();
      else lastTime = 0;
    };

    wakeRef.current = wake;
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) {
        updateBounds();
        wake();
      } else {
        stop();
        pool?.request([]);
      }
    });
    intersection.observe(container);
    const resize = new ResizeObserver(updateBounds);
    resize.observe(container);
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onTouchStart, { passive: true });
    window.addEventListener('pointerup', onTouchEnd, { passive: true });
    window.addEventListener('pointercancel', onTouchEnd, { passive: true });
    window.addEventListener('scroll', updateBounds, { passive: true });
    document.documentElement.addEventListener('pointerleave', rest);
    document.addEventListener('visibilitychange', onVisibility);
    reducedMotion.addEventListener('change', onMotionPreference);

    void (async () => {
      const [description, response] = await Promise.all([
        fetch(`${ASSET_ROOT}/aria-poses/manifest.json`, { signal: abort.signal }),
        fetch(`${ASSET_ROOT}/aria-poses/poses.bin`, { signal: abort.signal }),
      ]);
      if (!description.ok || !response.ok) throw new Error('Motion asset unavailable');
      const parsed = (await description.json()) as PoseManifest;
      const bytes = await response.arrayBuffer();
      if (disposed) return;
      if (
        bytes.byteLength > 4 * 1024 * 1024 ||
        parsed.width !== WIDTH ||
        parsed.height !== HEIGHT ||
        parsed.frameCount !== 96 ||
        parsed.frames.length !== parsed.frameCount
      ) {
        throw new Error('Unexpected motion asset');
      }
      manifest = parsed;
      pool = new MotionCache<ImageBitmap>(
        async (index, signal) => {
          if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
          const [offset, length] = parsed.frames[index];
          if (offset < 0 || length < 1 || offset + length > bytes.byteLength) {
            throw new Error('Invalid pose');
          }
          const frame = await createImageBitmap(
            new Blob([bytes.slice(offset, offset + length)], { type: 'image/webp' }),
          );
          if (signal.aborted) {
            frame.close();
            throw new DOMException('Aborted', 'AbortError');
          }
          return frame;
        },
        wake,
        () => {
          decodeErrors += 1;
          if (decodeErrors >= 3) fail();
        },
      );
      wake();
    })().catch(() => {
      if (!disposed) fail();
    });

    return () => {
      disposed = true;
      wakeRef.current = () => undefined;
      abort.abort();
      stop();
      pool?.dispose();
      intersection.disconnect();
      resize.disconnect();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onTouchStart);
      window.removeEventListener('pointerup', onTouchEnd);
      window.removeEventListener('pointercancel', onTouchEnd);
      window.removeEventListener('scroll', updateBounds);
      document.documentElement.removeEventListener('pointerleave', rest);
      document.removeEventListener('visibilitychange', onVisibility);
      reducedMotion.removeEventListener('change', onMotionPreference);
      context.clearRect(0, 0, WIDTH, HEIGHT);
    };
  }, [enabled]);

  return (
    <div ref={stageRef} className={`wd-character ${enabled && ready ? 'is-ready' : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="wd-character__poster"
        src={`${ASSET_ROOT}/aria-poster.png`}
        alt="レトロなコンピューターの頭とネイビーのスーツを身につけたGIFTのキャラクター"
        width="848"
        height="738"
        fetchPriority="high"
      />
      <canvas
        ref={canvasRef}
        className="wd-character__canvas"
        width={WIDTH}
        height={HEIGHT}
        aria-hidden="true"
      />
    </div>
  );
}
