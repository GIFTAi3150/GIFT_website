'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, useCallback, Component, type ReactNode } from 'react';
import { useViewportMount } from '@/lib/useViewportMount';

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
// Three.js's WebGLRenderer constructor throws synchronously if the browser
// refuses the requested context attributes — typical Edge/Chromium failure
// modes include the GPU process being "guilty" after prior context losses,
// or ANGLE refusing depth+stencil attachment ("OES_packed_depth_stencil
// support is required").
//
// Strategy: ONE retry after a short backoff (covers the benign case where
// the previous page's R3F canvases were still mid-disposal), then fall to
// the static SVG fallback. Beyond one retry the failure is structural —
// driver/origin-guilty state that won't clear without a browser restart —
// so additional attempts only spam the console with identical stack traces.
class CanvasErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean; retryKey: number; retriesLeft: number }
> {
  state = { failed: false, retryKey: 0, retriesLeft: 3 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  static getDerivedStateFromError() { return { failed: true } as Partial<typeof CanvasErrorBoundary.prototype.state>; }
  componentDidCatch() {
    if (this.state.retriesLeft <= 0) return;
    this.retryTimer = setTimeout(() => {
      this.setState((s) => ({
        failed: false,
        retryKey: s.retryKey + 1,
        retriesLeft: s.retriesLeft - 1,
      }));
    }, 2000);
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

// Max consecutive context losses before giving up and showing the static SVG.
const MAX_CONTEXT_LOSSES = 3;

export default function HeroLogoDelayed({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldMount } = useViewportMount(containerRef);

  const [logoKey, setLogoKey] = useState(0);
  // When true the canvas is hidden immediately so its opaque-black cleared
  // framebuffer can't block the DotsGrid behind it. The remount fires after
  // 1.5s once the GPU has freed the slot.
  const [contextLostPending, setContextLostPending] = useState(false);
  const lossCountRef = useRef(0);
  const [permanentFail, setPermanentFail] = useState(false);

  // Vestigial after the shared-canvas refactor — the badge no longer fires
  // onContextLost (RootCanvas owns context lifecycle). Kept wired so the
  // static SVG fallback still has a code path it could be reached through
  // if we add a "shared canvas died" signal later.
  const handleContextLost = useCallback(() => {
    lossCountRef.current += 1;
    if (lossCountRef.current > MAX_CONTEXT_LOSSES) {
      setPermanentFail(true);
      return;
    }
    setContextLostPending(true);
    setTimeout(() => {
      setContextLostPending(false);
      setLogoKey((k) => k + 1);
    }, 1500);
  }, []);

  let content: ReactNode;
  if (permanentFail) {
    content = <LogoStaticFallback />;
  } else if (!shouldMount || contextLostPending) {
    content = <LogoPlaceholder />;
  } else {
    content = (
      <CanvasErrorBoundary fallback={<LogoStaticFallback />}>
        <GiftLogo3D key={logoKey} onContextLost={handleContextLost} />
      </CanvasErrorBoundary>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      {content}
    </div>
  );
}
