'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

// Bodymovin/Lottie animation served from /public/lottie/animation.json.
// Fetched at runtime (not bundled) so the JSON stays a static asset.
export default function CapLottie() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/lottie/animation.json')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data) return null;

  // The Bodymovin comp has lots of empty padding around the artwork
  // (gear/PC/phone clustered in the upper-left of a 1938x1098 canvas).
  // The visual zoom that compensates for that whitespace lives in CSS
  // (.cap-lottie) so it can be tuned per breakpoint without re-rendering.
  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className="cap-lottie"
      style={{ width: '100%', height: '100%' }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
    />
  );
}
