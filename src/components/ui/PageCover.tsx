'use client';

import { useEffect, useState } from 'react';

// Dark full-screen overlay shown for a short moment on every page load.
// Guards against any initial white flash (html paint, WebGL init, font swap)
// before the real UI is ready. Fades out — no logo, no animation — just a
// clean handoff from "dark" to "page."
const HOLD_MS = 450; // how long the cover stays fully opaque
const FADE_MS = 500; // how long the fade-out takes

export default function PageCover() {
  const [fading, setFading] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), HOLD_MS);
    const t2 = setTimeout(() => setGone(true), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[200]"
      style={{
        backgroundColor: '#121212',
        opacity: fading ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    />
  );
}
