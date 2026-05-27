'use client';

// Dev-only utility for producing the DX hero background video loop.
//
// Why this exists:
//
// The DX hero used to render GiftLogoFluid live — a GPGPU particle face
// (~16k particles, 3 full-resolution texture passes per frame, vorticity
// confinement). On mid-tier and weak GPUs the workload tripped Chrome's
// "guilty origin" counter and blocked all WebGL on the site after a few
// route navs. We decided to bake the visual to a video and serve that
// instead — zero WebGL on the hero, crash impossible.
//
// This page mounts the still-extant GiftLogoFluid component in a clean
// full-viewport container, captures the shared root canvas via
// canvas.captureStream() + MediaRecorder, and downloads the result as
// VP9 webm. The capture window is sized to cover exactly one auto-cycle
// of the morph (head → logo → pet → head, ~36s at 12s per form).
//
// Workflow:
//   1. Run `npm run dev`, set browser to 1920×1080 (or whatever target
//      resolution you want the final video at), navigate to
//      /dev/capture-dx-hero.
//   2. Click "Start capture". Wait ~4s for the scene to mount and
//      settle on the head form, then ~37s of recording.
//   3. Click the download link, save the .webm to public/video/.
//   4. Convert to .mp4 for Safari fallback:
//        ffmpeg -i dx-hero-loop.webm -c:v libx264 -pix_fmt yuv420p \
//          -movflags +faststart dx-hero-loop.mp4
//   5. (Optional) extract a poster frame:
//        ffmpeg -i dx-hero-loop.webm -ss 00:00:02 -vframes 1 \
//          -q:v 2 dx-hero-loop.jpg
//   6. Drop dx-hero-loop.webm / .mp4 / .jpg into public/video/, reload
//      the DX page in production build to confirm.
//
// In production builds this page renders an explanatory stub instead of
// the capture UI (and the GiftLogoFluid import is still pulled into the
// chunk, but tree-shaken because the JSX path is gone). If you want it
// truly out of the production bundle, gate the dynamic import too.

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const GiftLogoFluid = dynamic(
  () => import('@/app/services/dx-consulting/_components/GiftLogoFluid'),
  { ssr: false },
);

// 36s ≈ one full head → logo → pet → head auto-cycle (GiftLogoFluid
// internally calls setInterval every 12s through FORM_VALUES of length 3).
// We pad to 37s to capture the start of the morph back to head, which gives
// the editor a clean splice point for a loop seam.
const CAPTURE_DURATION_MS = 37_000;

// 4s lead-in: GiftLogoFluid needs ~1-2s to load GLBs + initialize the
// GPGPU sim, and another ~1s for particles to settle on the head form
// before the first morph ticks. Starting recording earlier means the
// loop opens on initialization noise instead of a clean head silhouette.
const SETTLE_DELAY_MS = 4_000;

// VP9 in webm: ~50% smaller than H.264 at equivalent quality on typical
// hero footage. Chrome + Firefox decode hardware-accelerated; Safari 15+
// also supports it. The eventual `<video>` tag in DxV3Page lists an MP4
// source second as a fallback for older Safari.
const MIME_TYPE = 'video/webm;codecs=vp9';

// 6 Mbps at 1080p ≈ visually transparent for synthetic particle content.
// Raise if banding shows in dark areas; lower if file size is a concern.
const VIDEO_BITRATE = 6_000_000;

type Status = 'idle' | 'settling' | 'recording' | 'done' | 'error';

export default function CaptureDxHeroPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [mountKey, setMountKey] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const isProduction = process.env.NODE_ENV === 'production';

  // Dismiss the layout.tsx page-cover immediately. The cover normally waits
  // for the HP hero logo's `gift:logo-ready` event before fading; this page
  // doesn't render that logo, so without this the cover would only clear via
  // the 4s safety timeout — landing inside our settle window and bleeding a
  // semi-transparent overlay into the start of the recording. Effect must
  // run before the production-only early return below to satisfy
  // rules-of-hooks (no-op in production since the cover is irrelevant there).
  useEffect(() => {
    if (typeof window !== 'undefined' && !isProduction) {
      window.dispatchEvent(new Event('gift:logo-ready'));
    }
  }, [isProduction]);

  if (isProduction) {
    return (
      <main
        style={{
          padding: 40,
          fontFamily: 'system-ui, sans-serif',
          color: '#111',
        }}
      >
        <h1>Capture utility (development only)</h1>
        <p>
          This route is for producing the DX hero video loop and is disabled in
          production. Run <code>npm run dev</code> and visit this URL locally.
        </p>
      </main>
    );
  }

  const startCapture = async () => {
    if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
      setErrorMessage('MediaRecorder is not available in this browser.');
      setStatus('error');
      return;
    }
    if (!MediaRecorder.isTypeSupported(MIME_TYPE)) {
      setErrorMessage(
        `Browser does not support ${MIME_TYPE}. Try latest Chrome or Firefox.`,
      );
      setStatus('error');
      return;
    }

    // Release any previous capture's object URL before starting a new one.
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    // Remount GiftLogoFluid so its internal formIdx resets to 0 (head) and
    // its 12s setInterval starts fresh. Without this, repeated captures
    // start at unpredictable points in the morph cycle.
    setMountKey((k) => k + 1);
    setStatus('settling');
    setProgress(0);

    await new Promise((r) => window.setTimeout(r, SETTLE_DELAY_MS));

    // The shared root canvas is the only <canvas> on the page (mounted
    // via RootCanvasMount in app/layout.tsx). All drei <View>s, including
    // GiftLogoFluid's, paint into it.
    const canvas = document.querySelector<HTMLCanvasElement>('canvas');
    if (!canvas) {
      setErrorMessage(
        'No <canvas> element found in DOM. Is RootCanvasMount enabled in layout.tsx?',
      );
      setStatus('error');
      return;
    }

    // captureStream(60) requests a 60fps stream from the canvas. The actual
    // frame rate the browser delivers is the lower of: the canvas's render
    // rate, the system's vsync, and this requested fps.
    const stream = (canvas as HTMLCanvasElement & {
      captureStream(fps?: number): MediaStream;
    }).captureStream(60);

    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: MIME_TYPE,
      videoBitsPerSecond: VIDEO_BITRATE,
    });
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onerror = (e) => {
      setErrorMessage(`MediaRecorder error: ${(e as ErrorEvent).message ?? 'unknown'}`);
      setStatus('error');
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatus('done');
    };

    recorder.start();
    setStatus('recording');

    const startTime = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startTime;
      const p = Math.min(elapsed / CAPTURE_DURATION_MS, 1);
      setProgress(p);
      if (elapsed < CAPTURE_DURATION_MS) {
        requestAnimationFrame(tick);
      } else {
        recorder.stop();
      }
    };
    requestAnimationFrame(tick);
  };

  const remainingSec = Math.ceil((CAPTURE_DURATION_MS / 1000) * (1 - progress));

  return (
    <main
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #0b1340 0%, #1c2870 100%)',
      }}
    >
      {/* GiftLogoFluid renders the .hero-particles wrapper which is
          position:absolute inset:0, so it fills this main. The shared
          root canvas paints into its View. */}
      <div key={mountKey} style={{ position: 'absolute', inset: 0 }}>
        <GiftLogoFluid />
      </div>

      {/* Capture controls overlay */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.88)',
          color: '#fff',
          padding: 20,
          borderRadius: 8,
          fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
          fontSize: 13,
          maxWidth: 380,
          lineHeight: 1.5,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>
          DX hero capture (dev only)
        </div>
        <div style={{ opacity: 0.7, marginBottom: 14, fontSize: 12 }}>
          Records {CAPTURE_DURATION_MS / 1000}s of the shared canvas as VP9 webm.
          Auto-cycle: head → logo → pet → head, 12s each.
          Set your browser window to your target resolution (e.g. 1920×1080)
          before clicking start.
        </div>

        <div style={{ marginBottom: 10 }}>
          Status: <strong style={{ color: status === 'error' ? '#f88' : '#0f0' }}>{status}</strong>
        </div>

        {status === 'recording' && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 4 }}>
              {(progress * 100).toFixed(0)}% — {remainingSec}s left
            </div>
            <div
              style={{
                width: '100%',
                height: 4,
                background: '#222',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: '100%',
                  background: '#0f0',
                  transition: 'width 80ms linear',
                }}
              />
            </div>
          </div>
        )}

        {status === 'settling' && (
          <div style={{ marginBottom: 12, opacity: 0.8 }}>
            Settling on head form ({SETTLE_DELAY_MS / 1000}s)…
          </div>
        )}

        {status === 'error' && (
          <div style={{ color: '#f88', marginBottom: 12 }}>{errorMessage}</div>
        )}

        <button
          type="button"
          onClick={startCapture}
          disabled={status === 'settling' || status === 'recording'}
          style={{
            padding: '10px 18px',
            background: status === 'settling' || status === 'recording' ? '#444' : '#0a0',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'settling' || status === 'recording' ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {status === 'idle' && 'Start capture'}
          {status === 'settling' && 'Settling…'}
          {status === 'recording' && 'Recording…'}
          {status === 'done' && 'Capture again'}
          {status === 'error' && 'Retry'}
        </button>

        {downloadUrl && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #333' }}>
            <a
              href={downloadUrl}
              download="dx-hero-loop.webm"
              style={{ color: '#0f0', textDecoration: 'underline', fontWeight: 600 }}
            >
              ⬇ Download dx-hero-loop.webm
            </a>
            <div style={{ marginTop: 10, opacity: 0.7, fontSize: 11, lineHeight: 1.6 }}>
              Save to <code>public/video/dx-hero-loop.webm</code>.
              <br />
              Convert to MP4 (Safari fallback):
              <br />
              <code style={{ display: 'block', marginTop: 4, padding: 6, background: '#111', borderRadius: 3, overflowX: 'auto' }}>
                ffmpeg -i dx-hero-loop.webm -c:v libx264 -pix_fmt yuv420p -movflags +faststart dx-hero-loop.mp4
              </code>
              Extract poster frame:
              <br />
              <code style={{ display: 'block', marginTop: 4, padding: 6, background: '#111', borderRadius: 3, overflowX: 'auto' }}>
                ffmpeg -i dx-hero-loop.webm -ss 00:00:02 -vframes 1 -q:v 2 dx-hero-loop.jpg
              </code>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
