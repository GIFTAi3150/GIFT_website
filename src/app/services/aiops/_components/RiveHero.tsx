'use client';

// DX hero — Rive interactive vector (replaces the pulled VAT/particle hero).
//
// WHY RIVE / WHY NOT WEBGL: every prior 3D hero (live GiftLogoFluid, baked VAT
// points) ran on the Three.js WebGL context, which is what triggers the
// site-wide context-loss crash. Rive's `@rive-app/react-canvas` runtime draws
// through the HTML Canvas 2D API (no GL context is ever created), so it cannot
// participate in that failure mode. Cursor / scroll interactivity is authored
// INTO the .riv as state-machine listeners — the RiveComponent attaches the
// pointer handlers automatically, so there is no per-input wiring here.
//
// CRASH-SAFE: if the .riv is missing, 404s, or fails to parse, we render the
// `fallback` (the static logo) instead of a broken canvas. The hero degrades,
// it never breaks.

import { useEffect, useState, type ReactNode } from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

export default function RiveHero({
  src = '/rive/dx-hero.riv',
  stateMachine = 'State Machine 1',
  fallback = null,
}: {
  src?: string;
  /** Must match the state-machine name authored in the .riv. Rive's editor
      default is "State Machine 1"; update if the asset uses another name. */
  stateMachine?: string;
  fallback?: ReactNode;
}) {
  const [failed, setFailed] = useState(false);

  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    // Contain keeps the full mark visible and centered at any hero size; Rive
    // listeners read pointer position in artboard space regardless of fit.
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    onLoadError: () => setFailed(true),
  });

  // Safety net: if the file never resolves (404 in some runtime versions does
  // not always fire onLoadError), fall back after a short grace period.
  useEffect(() => {
    if (rive || failed) return;
    const t = window.setTimeout(() => {
      if (!rive) setFailed(true);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [rive, failed]);

  if (failed) return <>{fallback}</>;

  return (
    <div className="absolute inset-0 z-0" aria-hidden>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
