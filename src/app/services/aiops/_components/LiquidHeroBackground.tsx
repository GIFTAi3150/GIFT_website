'use client';

import { useState, useEffect, useCallback, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

// three.js / R3F load client-only (no SSR) so the WebGL bundle stays out of the
// server render and the initial HTML. Until it mounts — or if it fails — the
// hero shows the GPU-free CSS "liquid" field already painted by
// `.dx-v3 .hero.liquid .hero-stage::before/::after` (dx-v3.css). That CSS field
// IS the fallback, so this component renders nothing on the failure paths.
const LiquidHeroCanvas = dynamic(() => import('./LiquidHeroCanvas'), { ssr: false });

// One retry on a transient WebGL failure, then surrender to the CSS field.
// Same shape as the gradient hero's GradientErrorBoundary.
class LiquidErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean; retryKey: number; retriesLeft: number }
> {
  state = { failed: false, retryKey: 0, retriesLeft: 1 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    if (this.state.retriesLeft <= 0) return;
    this.retryTimer = setTimeout(() => {
      this.setState((s) => ({ failed: false, retryKey: s.retryKey + 1, retriesLeft: s.retriesLeft - 1 }));
    }, 2000);
  }
  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
  render() {
    if (this.state.failed) return null; // CSS field shows through
    return (
      <div key={this.state.retryKey} style={{ display: 'contents' }}>
        {this.props.children}
      </div>
    );
  }
}

interface Props {
  className?: string;
  presetIndex?: number;
}

export default function LiquidHeroBackground({ className, presetIndex = 0 }: Props) {
  const [clientReady, setClientReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  // isInit drives the zoom-in entry settle speed; flips false after 2s,
  // matching loudsrl's `setTimeout(() => setIsInit(false), 2000)`.
  const [isInit, setIsInit] = useState(true);
  const onContextLost = useCallback(() => setContextLost(true), []);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setIsInit(false), 2000);
    return () => clearTimeout(t);
  }, []);

  // No WebGL yet / lost → render nothing; the CSS liquid field carries the hero.
  if (!clientReady || contextLost) return null;

  return (
    <div
      className={className}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      <LiquidErrorBoundary>
        <LiquidHeroCanvas presetIndex={presetIndex} isInit={isInit} onContextLost={onContextLost} />
      </LiquidErrorBoundary>
    </div>
  );
}
