'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

type Props = {
  /** Path to the Bodymovin JSON, served from /public. */
  src: string;
};

// Derive a CSS variant token from the JSON filename so each Lottie
// can be tuned (scale, transform-origin) independently in CSS without
// rendering logic per src. e.g. /lottie/datab-animation.json → "datab-animation".
const variantFromSrc = (src: string) => {
  const m = src.match(/\/([^/]+)\.json(?:\?.*)?$/);
  return m ? m[1] : 'default';
};

// Bodymovin/Lottie animation served from /public/lottie/*.json.
// Fetched at runtime (not bundled) so the JSONs stay static assets
// and we can swap them per capability via the `src` prop.
export default function CapLottie({ src }: Props) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    setData(null);
    fetch(src)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!data) return null;

  // The visual zoom that compensates for empty padding in some Bodymovin
  // comps lives in CSS (.cap-lottie + .cap-lottie--<variant>) so it can
  // be tuned per breakpoint AND per Lottie file without re-rendering.
  const variant = variantFromSrc(src);
  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      className={`cap-lottie cap-lottie--${variant}`}
      style={{ width: '100%', height: '100%' }}
      rendererSettings={{ preserveAspectRatio: 'xMidYMid meet' }}
    />
  );
}
