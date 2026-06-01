'use client';

import { Component, useEffect, useState, type ReactNode } from 'react';
import RootCanvas from './RootCanvas';

// Client-only mount gate + error boundary for the shared WebGL canvas.
//
// Two safety properties this file owns:
//
// 1) Client-only mount. next/dynamic with ssr:false caused
//    "Cannot read properties of null (reading 'useContext')" inside
//    updateDehydratedSuspenseComponent during hydration. A plain
//    useEffect mount gate avoids the Suspense path entirely.
//
// 2) Error boundary. If Chrome refuses to hand the origin another WebGL
//    context (the "guilty origin" verdict — "Web page caused context loss
//    and was blocked"), `new THREE.WebGLRenderer()` throws synchronously
//    inside makeSafeRenderer. R3F surfaces that throw as an Error in
//    React's commit phase. Without a boundary here the error propagates
//    to the root and crashes the entire app — meaning the user can't even
//    navigate to a non-3D page to recover. The boundary catches the
//    construction failure and renders nothing; per-page static fallbacks
//    (HeroLogoDelayed's static SVG, etc.) still show normally.

class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    // Log once so the developer sees the underlying cause, but don't
    // re-throw — the whole point is to keep the app running.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[RootCanvas] WebGL canvas failed to mount:', error.message);
    }
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

function ClientGate() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return <RootCanvas />;
}

export default function RootCanvasMount() {
  return (
    <CanvasErrorBoundary>
      <ClientGate />
    </CanvasErrorBoundary>
  );
}
