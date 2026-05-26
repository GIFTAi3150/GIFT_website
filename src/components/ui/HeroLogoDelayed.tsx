'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, Component, type ReactNode } from 'react';
import { useWebGLAvailable } from '@/lib/useWebGLAvailable';

// SVG paths for the static-fallback logo. Mirrors GiftLogo3D_PremiumBadge's
// LogoFallback so the WebGL-off and WebGL-on visuals share a silhouette.
const SHIELD_PATH =
  'M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z';
const G_PATH_1 =
  'M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z';
const G_PATH_2 =
  'M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z';

// Retry-with-backoff error boundary for R3F Canvas mounts.
//
// Three.js's WebGLRenderer constructor throws synchronously if
// `canvas.getContext('webgl2', attributes)` returns null. We can't predict
// this perfectly from a probe — the probe asks for a context with NO
// attributes, but Three.js asks with antialias/alpha/etc, so the probe can
// say "ready" while the real mount still fails (typical when the previous
// page's R3F canvases are mid-disposal — R3F runs its dispose inside a
// setTimeout(500) so the GPU resources are still bound when our Canvas
// tries to claim a context).
//
// Strategy: catch the throw, force a remount after a backoff, and try again.
// Each retry waits longer to give R3F's lingering cleanup more time. After
// MAX_RETRIES we surrender, mark the tab as "WebGL failed" in sessionStorage
// (so future navigations skip straight to the static fallback instead of
// re-stacking errors), and show the static SVG fallback permanently.
class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean; retryKey: number; retriesLeft: number }
> {
  state = { failed: false, retryKey: 0, retriesLeft: 4 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError() { return { failed: true } as Partial<typeof CanvasErrorBoundary.prototype.state>; }
  componentDidCatch() {
    if (this.state.retriesLeft <= 0) return;
    // Backoff: 600ms, 1200ms, 2000ms, 3000ms. The first retry covers the
    // typical case (R3F's 500ms cleanup just hadn't run yet); later retries
    // cover GPU-driver stalls that need longer to clear.
    const delays = [600, 1200, 2000, 3000];
    const attempt = 4 - this.state.retriesLeft;
    const delay = delays[Math.min(attempt, delays.length - 1)];
    this.retryTimer = setTimeout(() => {
      this.setState((s) => ({
        failed: false,
        retryKey: s.retryKey + 1,
        retriesLeft: s.retriesLeft - 1,
      }));
    }, delay);
  }
  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    // The `key` change forces React to unmount + remount the children
    // subtree, which gets us a fresh dynamic import + Canvas attempt.
    return <div key={this.state.retryKey} style={{ display: 'contents' }}>{this.props.children}</div>;
  }
}

const GiftLogo3D = dynamic(() => import('@/components/ui/GiftLogo3D_PremiumBadge'), {
  ssr: false,
  loading: () => <LogoPlaceholder />,
});

// Faint, pulsing placeholder shown while we're WAITING for the canvas to
// be ready (probe in progress, min wait pending). Intentionally subtle so
// it reads as "loading" not "this is the final state."
function LogoPlaceholder() {
  return (
    <div
      className="flex h-[360px] w-full items-center justify-center bg-transparent sm:h-[460px] lg:h-[640px]"
    >
      <div className="relative">
        <svg
          width="80"
          height="90"
          viewBox="0 0 828 800"
          className="animate-pulse"
          style={{ opacity: 0.15 }}
        >
          <path d={SHIELD_PATH} fill="#2d6b3f" />
        </svg>
        {/* Orbiting dot */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
          <div
            className="h-1.5 w-1.5 rounded-full bg-white/60"
            style={{
              position: 'absolute',
              top: '-4px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// Final fallback shown when WebGL is determined unavailable for the rest
// of this session (probe timed out, or Canvas mount retries exhausted).
// Mirrors the 3D logo's silhouette at presentation scale so the hero still
// reads as a logo rather than empty space.
function LogoStaticFallback() {
  return (
    <div className="flex h-[360px] w-full items-center justify-center bg-transparent sm:h-[460px] lg:h-[640px]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 828 800"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: '420px', maxHeight: '420px', opacity: 0.92 }}
      >
        <path d={SHIELD_PATH} fill="#2d6b3f" />
        <path d={G_PATH_1} fill="#eeebe3" />
        <path d={G_PATH_2} fill="#eeebe3" />
      </svg>
    </div>
  );
}

// Minimum time the loading placeholder stays on screen before we attempt
// the first Canvas mount. R3F's unmount cleanup is wrapped in
// `setTimeout(..., 500)`, and when arriving from a multi-Canvas route
// like /services/dx-consulting the previous page's contexts are still
// holding GPU resources during that window. Bumped from 1200ms to 2000ms
// because AMD iGPU (Ryzen integrated graphics) takes longer to actually
// release the underlying GPU memory after the JS-side dispose runs —
// at 1200ms we'd see the OES_packed_depth_stencil allocation failure
// when the new context tried to grab a depth buffer.
const MIN_PLACEHOLDER_MS = 2000;

export default function HeroLogoDelayed({ className }: { className?: string }) {
  const webglStatus = useWebGLAvailable();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_PLACEHOLDER_MS);
    return () => clearTimeout(t);
  }, []);

  if (webglStatus === 'unavailable') {
    return (
      <div className={className}>
        <LogoStaticFallback />
      </div>
    );
  }
  if (webglStatus === 'probing' || !minTimeElapsed) {
    return (
      <div className={className}>
        <LogoPlaceholder />
      </div>
    );
  }
  return (
    <CanvasErrorBoundary fallback={<div className={className}><LogoStaticFallback /></div>}>
      <GiftLogo3D className={className} />
    </CanvasErrorBoundary>
  );
}
