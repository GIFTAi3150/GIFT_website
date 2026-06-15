'use client';

// DEV-ONLY recorder for the VAT bake pipeline (Plans.md T-010 / P1).
//
// Goal of P1: prove we can pull the live GPGPU solver's per-frame particle
// positions out to the CPU and download them. This page mounts the still-live
// GiftLogoFluid in a full-viewport container (so its viewport gate reports
// visible and the solver actually runs), arms `vatCapture`, and once the
// target frame count is reached, serializes the captured position frames to a
// single .bin and offers it for download.
//
// Binary layout (little-endian):
//   [0]  int32 texW
//   [4]  int32 texH
//   [8]  int32 frameCount
//   [12] float32 Ã— (frameCount Ã— texW Ã— texH Ã— 4)   RGBA per particle per frame
//        (xyz = position, w = shield/G flag)
//
// This raw float dump is a DEV ARTIFACT, not the shipped asset â€” P2 compresses
// it (quantized deltas, chosen loop length) into the few-MB VAT that playback
// consumes. In production builds this route renders an explanatory stub.

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { vatCapture } from '@/app/services/aiops/_components/_vatCapture';

const GiftLogoFluid = dynamic(
  () => import('@/app/services/aiops/_components/GiftLogoFluid'),
  { ssr: false },
);

// Lead-in before arming. The solver needs ~1â€“2s to load its GLBs + init the
// GPGPU sim, and when a form is PINNED the particles also have to travel to
// that shape and the morph weights settle (~1.5s). 5s covers all of it.
const SETTLE_DELAY_MS = 5_000;

// Default capture length. At 96Â² = 9,216 particles, each frame is
// 9216Ã—4Ã—4 â‰ˆ 147 KB, so 150 frames â‰ˆ 22 MB raw â€” fine for a dev artifact.
const DEFAULT_FRAMES = 150;

// Form index â†’ label/slug. Mirrors FORM_VALUES in GiftLogoFluid
// (0 = head, 1 = GIFT logo, 2 = pet). One clean capture per shape.
const SHAPES = [
  { idx: 0, label: 'Head', slug: 'head' },
  { idx: 1, label: 'GIFT logo', slug: 'logo' },
  { idx: 2, label: 'Pet', slug: 'pet' },
] as const;

type Status = 'idle' | 'settling' | 'capturing' | 'done' | 'error';

export default function CaptureDxVatPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [shapeIdx, setShapeIdx] = useState(0);
  const [targetFrames, setTargetFrames] = useState(DEFAULT_FRAMES);
  const [captured, setCaptured] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // Bump to force a clean remount of GiftLogoFluid between capture runs.
  const [mountKey, setMountKey] = useState(0);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Slug of the shape the CURRENT run captured â€” frozen at start so changing
  // the selector after a run doesn't rename the pending download.
  const runShapeRef = useRef<string>(SHAPES[0].slug);
  const isProduction = process.env.NODE_ENV === 'production';

  // The layout page-cover waits for the HP hero's `gift:logo-ready` event;
  // this route never renders that logo, so fire it manually so the cover
  // doesn't linger over the capture container.
  useEffect(() => {
    if (typeof window !== 'undefined' && !isProduction) {
      window.dispatchEvent(new Event('gift:logo-ready'));
    }
  }, [isProduction]);

  // Cleanup on unmount: cancel any pending settle timer, reset the singleton,
  // and revoke the object URL so we don't leak it.
  useEffect(() => {
    return () => {
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
      vatCapture.reset();
      vatCapture.onProgress = undefined;
      vatCapture.onDone = undefined;
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  if (isProduction) {
    return (
      <main style={{ padding: 40, fontFamily: 'system-ui, sans-serif', color: '#111' }}>
        <h1>VAT capture utility (development only)</h1>
        <p>
          This route bakes the DX hero particle motion and is disabled in
          production. Run <code>npm run dev</code> and visit this URL locally.
        </p>
      </main>
    );
  }

  const serializeAndOffer = (
    frames: Float32Array[],
    texW: number,
    texH: number,
  ) => {
    try {
      const frameLen = texW * texH * 4;
      const headerBytes = 12; // 3 Ã— int32
      const buf = new ArrayBuffer(headerBytes + frames.length * frameLen * 4);
      const header = new Int32Array(buf, 0, 3);
      header[0] = texW;
      header[1] = texH;
      header[2] = frames.length;
      const body = new Float32Array(buf, headerBytes);
      frames.forEach((f, i) => body.set(f, i * frameLen));

      const blob = new Blob([buf], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileInfo(
        `${texW}Ã—${texH} (${texW * texH} particles) Â· ${frames.length} frames Â· ${(blob.size / 1_048_576).toFixed(1)} MB`,
      );
      setStatus('done');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
      setStatus('error');
    }
  };

  const startCapture = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    setCaptured(0);
    setErrorMessage('');
    setFileInfo('');
    // Pin the chosen shape BEFORE remounting so the fresh solver instance
    // starts on it and suspends its auto-cycle.
    vatCapture.forcedForm = shapeIdx;
    runShapeRef.current = SHAPES[shapeIdx].slug;
    // Fresh solver instance so every run starts from the same init state.
    setMountKey((k) => k + 1);
    setStatus('settling');

    vatCapture.onProgress = (n) => setCaptured(n);
    vatCapture.onDone = (frames, texW, texH) => serializeAndOffer(frames, texW, texH);

    settleTimerRef.current = setTimeout(() => {
      setStatus('capturing');
      vatCapture.arm(targetFrames);
    }, SETTLE_DELAY_MS);
  };

  const busy = status === 'settling' || status === 'capturing';
  const pct = targetFrames > 0 ? Math.round((captured / targetFrames) * 100) : 0;

  return (
    <main style={{ position: 'relative', minHeight: '100vh', background: '#05060a' }}>
      {/* Force the GiftLogoFluid containers to fill the viewport so the
          solver's visibility gate reports visible and it runs. */}
      <style>{`
        .vat-capture-stage .hero-particles,
        .vat-capture-stage .hero-particles-touch {
          position: absolute; inset: 0; width: 100%; height: 100%;
        }
      `}</style>

      {/* The live solver. Mounting it renders into the shared RootCanvas via
          its <View>; the capture tap in its useFrame feeds vatCapture. */}
      <div
        className="vat-capture-stage"
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      >
        <GiftLogoFluid key={mountKey} />
      </div>

      {/* Control panel */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 10,
          width: 320,
          padding: 20,
          borderRadius: 12,
          background: 'rgba(8, 10, 18, 0.88)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#e7ecff',
          fontFamily: 'system-ui, sans-serif',
          backdropFilter: 'blur(8px)',
        }}
      >
        <h1 style={{ margin: '0 0 4px', fontSize: 16 }}>VAT capture (P1)</h1>
        <p style={{ margin: '0 0 16px', fontSize: 12, opacity: 0.6 }}>
          Bakes GiftLogoFluid particle positions â†’ downloadable .bin
        </p>

        <div style={{ fontSize: 12, marginBottom: 6 }}>Shape to bake</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {SHAPES.map((s) => (
            <button
              key={s.slug}
              onClick={() => setShapeIdx(s.idx)}
              disabled={busy}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 6, fontSize: 12,
                cursor: busy ? 'default' : 'pointer',
                border: shapeIdx === s.idx
                  ? '1px solid #635bff'
                  : '1px solid rgba(255,255,255,0.18)',
                background: shapeIdx === s.idx ? 'rgba(99,91,255,0.25)' : 'rgba(0,0,0,0.25)',
                color: '#fff', fontWeight: shapeIdx === s.idx ? 700 : 400,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        <label style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>
          Frames to capture
          <input
            type="number"
            min={1}
            value={targetFrames}
            disabled={busy}
            onChange={(e) => setTargetFrames(Math.max(1, Number(e.target.value) || 1))}
            style={{
              display: 'block', width: '100%', marginTop: 4, padding: '6px 8px',
              borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(0,0,0,0.3)', color: '#fff', fontSize: 13,
            }}
          />
        </label>

        <button
          onClick={startCapture}
          disabled={busy}
          style={{
            width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 8,
            border: 'none', cursor: busy ? 'default' : 'pointer',
            background: busy ? '#3a3f55' : '#635bff', color: '#fff',
            fontSize: 14, fontWeight: 600,
          }}
        >
          {status === 'settling'
            ? 'Settlingâ€¦'
            : status === 'capturing'
              ? `Capturing ${captured}/${targetFrames}`
              : 'Start capture'}
        </button>

        {status === 'settling' && (
          <p style={{ fontSize: 12, marginTop: 12, opacity: 0.7 }}>
            Waiting {SETTLE_DELAY_MS / 1000}s for the sim to load & settleâ€¦
          </p>
        )}

        {status === 'capturing' && (
          <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.12)' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: '#635bff', transition: 'width 0.1s' }} />
          </div>
        )}

        {status === 'done' && downloadUrl && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 12, opacity: 0.8, margin: '0 0 8px' }}>{fileInfo}</p>
            <a
              href={downloadUrl}
              download={`dx-hero-vat-${runShapeRef.current}.bin`}
              style={{
                display: 'block', textAlign: 'center', padding: '10px 0',
                borderRadius: 8, background: '#22c55e', color: '#04210f',
                fontSize: 14, fontWeight: 700, textDecoration: 'none',
              }}
            >
              Download .bin
            </a>
          </div>
        )}

        {status === 'error' && (
          <p style={{ fontSize: 12, marginTop: 12, color: '#ff8a8a' }}>
            Error: {errorMessage}
          </p>
        )}
      </div>
    </main>
  );
}

