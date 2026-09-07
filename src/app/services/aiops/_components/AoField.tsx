'use client';

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { liquidTargets, setFieldController } from './fieldBus';

/**
 * The field — "Groundwork" (2026-09-07). One fixed plate behind the whole
 * page running the approved liquid paint (AoLiquidScene), and a navy veil
 * over it that AoScroll scrubs as the hero scene leaves. The scroll works the
 * liquid itself through `liquidTargets`:
 *
 *   hero p 0 → 1   zoom 4 → 2.4 (the camera pulls back into the paint),
 *                  spinSpeed 2 → 0.7, contrast 5.5 → 3.6 — chaos → order
 *   sections       veil VEIL_MAX over the calmed ground
 *   CTA            veil lifts to VEIL_CTA and spinSpeed → 2.6: it moves again
 *
 * three.js / R3F load client-only (ssr:false). Until the canvas mounts — or
 * if WebGL is unavailable, the context is lost, or the boundary trips twice —
 * `main[data-ao-fallback]` paints a navy bloom in CSS and the page is fully
 * readable. `gift:logo-ready` fires after the shader's 3rd frame or after
 * READY_CAP_MS, whichever comes first; the hero intro and the #page-cover
 * fade wait on it.
 */

const AoLiquidCanvas = dynamic(() => import('./AoLiquidCanvas'), { ssr: false });

const VEIL_MAX = 0.82; // under the sections the liquid is a slow pulse, never gone
const VEIL_CTA = 0.5; // the bookend lets it back through
const CTA_EASE_MS = 700;
const READY_CAP_MS = 2200;

const HERO_A = { zoom: 4, spinSpeed: 2, contrast: 5.5 };
const HERO_B = { zoom: 2.4, spinSpeed: 0.7, contrast: 3.6 };
const CTA_T = { zoom: 2.4, spinSpeed: 2.6, contrast: 4.4 };

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// One retry on a transient WebGL failure, then surrender to the CSS ground.
class LiquidBoundary extends Component<
  { children: ReactNode; onFail: () => void },
  { failed: boolean; retryKey: number; retriesLeft: number }
> {
  state = { failed: false, retryKey: 0, retriesLeft: 1 };
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    if (this.state.retriesLeft <= 0) {
      this.props.onFail();
      return;
    }
    this.retryTimer = setTimeout(() => {
      this.setState((s) => ({ failed: false, retryKey: s.retryKey + 1, retriesLeft: s.retriesLeft - 1 }));
    }, 2000);
  }
  componentWillUnmount() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
  }
  render() {
    if (this.state.failed) return null;
    return (
      <div key={this.state.retryKey} style={{ display: 'contents' }}>
        {this.props.children}
      </div>
    );
  }
}

export default function AoField() {
  const veilRef = useRef<HTMLDivElement>(null);
  const [clientReady, setClientReady] = useState(false);
  const [lost, setLost] = useState(false);
  const [isInit, setIsInit] = useState(true);
  const [env, setEnv] = useState({ maxDpr: 1.5, reduced: false });
  const readyFired = useRef(false);

  const ready = useCallback(() => {
    if (readyFired.current) return;
    readyFired.current = true;
    window.dispatchEvent(new Event('gift:logo-ready'));
  }, []);
  const onContextLost = useCallback(() => setLost(true), []);

  useEffect(() => {
    setEnv({
      maxDpr: window.matchMedia('(max-width: 899px)').matches ? 1 : 1.5,
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    });
    setClientReady(true);
    const init = window.setTimeout(() => setIsInit(false), 2000);
    const cap = window.setTimeout(ready, READY_CAP_MS);
    return () => {
      window.clearTimeout(init);
      window.clearTimeout(cap);
    };
  }, [ready]);

  // No WebGL → the CSS ground; tell the page (and release the cover).
  useEffect(() => {
    const main = document.querySelector<HTMLElement>('main.ao-page');
    if (!main || !lost) return;
    main.setAttribute('data-ao-fallback', '');
    ready();
    return () => main.removeAttribute('data-ao-fallback');
  }, [lost, ready]);

  // ── the bus: scene → targets, veil, cta ─────────────────────────────────
  useEffect(() => {
    const veil = veilRef.current;
    if (!veil) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let scene = 0;
    let veilP = reduced ? 1 : 0; // AoScroll never drives the veil under reduced motion
    let cta = false;

    const paintVeil = (ms: number) => {
      veil.style.transitionDuration = `${ms}ms`;
      const v = cta ? Math.min(VEIL_CTA, VEIL_MAX * veilP) : VEIL_MAX * veilP;
      veil.style.opacity = v.toFixed(3);
    };
    const applyTargets = () => {
      if (cta) {
        Object.assign(liquidTargets, CTA_T);
        return;
      }
      liquidTargets.zoom = HERO_A.zoom + (HERO_B.zoom - HERO_A.zoom) * scene;
      liquidTargets.spinSpeed = HERO_A.spinSpeed + (HERO_B.spinSpeed - HERO_A.spinSpeed) * scene;
      liquidTargets.contrast = HERO_A.contrast + (HERO_B.contrast - HERO_A.contrast) * scene;
    };
    paintVeil(0);
    applyTargets();

    setFieldController({
      setScene: (p) => {
        scene = clamp01(p);
        applyTargets();
      },
      setVeil: (v) => {
        veilP = clamp01(v);
        paintVeil(0); // a scrub: no easing, or it lags the reader's finger
      },
      setCta: (on) => {
        if (on === cta) return;
        cta = on;
        applyTargets();
        paintVeil(CTA_EASE_MS); // a toggle: this one eases
      },
    });
    return () => setFieldController(null);
  }, []);

  return (
    <div className="ao-field" aria-hidden>
      {clientReady && !lost && (
        <LiquidBoundary onFail={onContextLost}>
          <AoLiquidCanvas
            isInit={isInit}
            maxDpr={env.maxDpr}
            reduced={env.reduced}
            onContextLost={onContextLost}
            onReady={ready}
          />
        </LiquidBoundary>
      )}
      <div ref={veilRef} className="ao-veil" />
    </div>
  );
}
