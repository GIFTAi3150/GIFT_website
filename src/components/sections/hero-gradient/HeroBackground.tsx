'use client';

import { useState, useCallback, useEffect, Component, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import HeroGradientStatic from './HeroGradientStatic';

const HeroGradientCanvas = dynamic(() => import('./HeroGradientCanvas'), { ssr: false });

class GradientErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { failed: boolean; retryKey: number; retriesLeft: number }
> {
  state = { failed: false, retryKey: 0, retriesLeft: 1 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {
    if (this.state.retriesLeft <= 0) return;
    this.retryTimer = setTimeout(() => {
      this.setState(s => ({ failed: false, retryKey: s.retryKey + 1, retriesLeft: s.retriesLeft - 1 }));
    }, 2000);
  }
  componentWillUnmount() { if (this.retryTimer) clearTimeout(this.retryTimer); }
  render() {
    if (this.state.failed) return this.props.fallback;
    return <div key={this.state.retryKey} style={{ display: 'contents' }}>{this.props.children}</div>;
  }
}

interface Props { className?: string; }

export default function HeroBackground({ className }: Props) {
  // Mount canvas only on client (after hydration). SSR shows static fallback.
  const [clientReady, setClientReady] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  // Ball-expand entrance: starts clipped to a small ball, then grows to fill.
  const [revealed, setRevealed] = useState(false);
  const onContextLost = useCallback(() => setContextLost(true), []);

  useEffect(() => { setClientReady(true); }, []);

  // Start the expansion only once there's painted content to reveal. The
  // double rAF guarantees one painted frame of the small ball before the
  // clip-path transition begins, so the ball phase is always visible.
  // Also signal the root #page-cover to fade out at the same moment.
  const startReveal = useCallback(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setRevealed(true);
        window.dispatchEvent(new Event('gift:logo-ready'));
      })
    );
  }, []);

  // Fired by the canvas after its first rendered frame.
  const onCanvasReady = useCallback(() => startReveal(), [startReveal]);

  // Static-fallback path (no WebGL / context lost): the fallback gradient
  // paints immediately, so reveal shortly after.
  useEffect(() => {
    if (contextLost) {
      const t = setTimeout(startReveal, 500);
      return () => clearTimeout(t);
    }
  }, [contextLost, startReveal]);

  // Anti-stuck last resort: a long timeout so the ball can never get stuck if
  // the canvas somehow never signals. Kept well beyond normal canvas-ready so
  // it doesn't pre-empt the onReady-gated reveal on a slow-hydrating page.
  useEffect(() => {
    const t = setTimeout(startReveal, 4000);
    return () => clearTimeout(t);
  }, [startReveal]);

  const staticFallback = <HeroGradientStatic className="absolute inset-0" />;

  return (
    <div
      className={`${className ?? ''} hero-ball-reveal${revealed ? ' is-revealed' : ''}`}
    >
      {clientReady && !contextLost ? (
        <GradientErrorBoundary fallback={staticFallback}>
          <HeroGradientCanvas onContextLost={onContextLost} onReady={onCanvasReady} />
        </GradientErrorBoundary>
      ) : (
        staticFallback
      )}
    </div>
  );
}
