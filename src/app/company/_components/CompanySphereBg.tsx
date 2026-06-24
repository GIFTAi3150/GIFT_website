"use client";

/**
 * CompanySphereBg — ambient "orbit" background for /company sections.
 *
 * This renders the ACTUAL alpha.plaid.co.jp hero / Strength animation: their
 * baked After Effects → Bodymovin Lottie (verified — the reference plays it via
 * <dotlottie-player>). We pulled the real hero file (lottie.host
 * 9e69d6a3-…/4r4Hj0KJ7A.lottie, 1440×810, 14s), then in a build step
 * (scripts, see _recolor) recolored it to our palette, stripped its pale-cyan
 * solid background so it composites transparently, and produced three variants:
 *
 *   hero      → Mission : morphing orange blob + sweeping orbital arcs + dots
 *   strength  → Vision  : same orbital arcs + dots, blob removed (the Strength look)
 *   values    → Values  : arcs + dots recolored gold for the dark card
 *
 * Played with lottie-react (already a dependency — no new package).
 */

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

type Variant = "hero" | "blob" | "strength" | "values";

const SRC: Record<Variant, string> = {
  hero: "/lottie/company-orbit-hero.json",
  blob: "/lottie/company-orbit-blob.json",
  strength: "/lottie/company-orbit-strength.json",
  values: "/lottie/company-orbit-values.json",
};

// Per-section framing of the shared orbital-arc field. The arcs are huge
// centered ellipses, so a rotate+scale shows a genuinely different sweep
// pattern in each section (scale ≥1.6 keeps them spanning; transparent corners
// just show the section background). Mission = the untouched hero framing.
const FX: Record<Variant, string> = {
  hero: "none",
  blob: "none",
  strength: "rotate(118deg) scale(1.7)",
  values: "rotate(236deg) scale(1.7)",
};

type Props = {
  variant?: Variant;
  /** overall layer opacity (0–1); keep low so text stays readable */
  opacity?: number;
  /** preserveAspectRatio — "slice" covers, "meet" contains */
  fit?: "slice" | "meet";
  /** cycle hue continuously so the blob shifts through different colors */
  colorCycle?: boolean;
  className?: string;
};

export default function CompanySphereBg({
  variant = "strength",
  opacity = 0.6,
  fit = "slice",
  colorCycle = false,
  className = "",
}: Props) {
  const [data, setData] = useState<object | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // fetch the JSON on the client only
  useEffect(() => {
    let alive = true;
    fetch(SRC[variant])
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [variant]);

  // reduced-motion → freeze on frame 0; off-screen → pause (perf)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !data) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      lottieRef.current?.goToAndStop(0, true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) =>
        entry.isIntersecting ? lottieRef.current?.play() : lottieRef.current?.pause(),
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [data]);

  if (!data) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: FX[variant],
          transformOrigin: "center",
          ...(colorCycle && {
            animation: "blob-hue-cycle 8s linear infinite",
          }),
        }}
      >
        <Lottie
          lottieRef={lottieRef}
          animationData={data}
          loop
          autoplay
          rendererSettings={{ preserveAspectRatio: `xMidYMid ${fit}` }}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
