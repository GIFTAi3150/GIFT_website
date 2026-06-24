"use client";

/**
 * StrengthDots — the REAL alpha.plaid.co.jp *Strength* section animation.
 *
 * Plaid's Strength section is NOT the hero orbital-arc field (that was our old
 * wrong port on /company). It is two small <dotlottie-player>s of drifting
 * circles that pop in/out and drift diagonally on a stagger — verified from the
 * live DOM:
 *   accent (lottie.host 51f95e13…, 418×395, top-right of the section)
 *   tall   (lottie.host 381382b9…, 330×660, left edge)
 * We ship the motion 1:1 (keyframes untouched) and only recolor to /company
 * (see scripts/generate-company-orbit.mjs → company-strength-dots{,-tall}.json):
 *   deep orange #D95208 + light orange #F07A30 dots, slate #64757D hollow rings.
 *
 * Unlike CompanySphereBg (full-bleed "cover" of the arc field), these are
 * fixed-aspect *accents* positioned like the reference — preserveAspectRatio
 * "meet" so the circles keep their shape. Played with lottie-react (already a
 * dependency — no new package). Viewport-gated + reduced-motion aware.
 */

import { useEffect, useRef, useState } from "react";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";

/** One positioned, viewport-gated, reduced-motion-aware dots accent. */
function DotsPiece({ src, className }: { src: string; className?: string }) {
  const [data, setData] = useState<object | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);

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
    <div ref={wrapRef} aria-hidden className={`pointer-events-none absolute ${className ?? ""}`}>
      <Lottie
        lottieRef={lottieRef}
        animationData={data}
        loop
        autoplay
        rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

type Variant = "vision" | "values";

/**
 * Per-section dot sets. Same drifting-dots/rings motion, different recolor +
 * layout so each section reads distinct (the reference scatters these pieces
 * differently per section too):
 *   vision → white bg, orange/slate dots; accent top-right + tall strip lower-left
 *   values → dark card, gold dots;        accent top-left  + tall strip lower-right (mirrored)
 */
const SETS: Record<Variant, { accent: string; tall: string; accentClass: string; tallClass: string }> = {
  vision: {
    accent: "/lottie/company-strength-dots.json",
    tall: "/lottie/company-strength-dots-tall.json",
    accentClass: "right-[3%] top-[6%] aspect-[418/395] w-[clamp(220px,34vw,460px)]",
    tallClass: "hidden bottom-[2%] left-[2%] aspect-[330/660] w-[clamp(120px,15vw,280px)] md:block",
  },
  values: {
    accent: "/lottie/company-strength-dots-values.json",
    tall: "/lottie/company-strength-dots-values-tall.json",
    accentClass: "left-[4%] top-[5%] aspect-[418/395] w-[clamp(200px,30vw,420px)]",
    tallClass: "hidden bottom-[3%] right-[3%] aspect-[330/660] w-[clamp(120px,14vw,260px)] md:block",
  },
};

type Props = {
  variant?: Variant;
  /** overall layer opacity (0–1) */
  opacity?: number;
  className?: string;
};

export default function StrengthDots({ variant = "vision", opacity = 0.9, className = "" }: Props) {
  const set = SETS[variant];
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      {/* accent cluster (plaid 51f95e13, 418×395) */}
      <DotsPiece src={set.accent} className={set.accentClass} />
      {/* tall drifting strip (plaid 381382b9, 330×660); md+ only */}
      <DotsPiece src={set.tall} className={set.tallClass} />
    </div>
  );
}
