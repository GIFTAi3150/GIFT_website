'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Props {
  src: string;
  alt: string;
  caption?: string;
  subcaption?: string;
  bg?: string;
  minHeight?: string;
  priority?: boolean;
}

export default function PhotoReveal({
  src,
  alt,
  caption,
  subcaption,
  bg = '#F4EFE6',
  minHeight = '180vh',
  priority = false,
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = sectionRef.current;
    const photo = photoRef.current;
    const imgWrap = imgWrapRef.current;
    const cap = capRef.current;

    if (!sec || !photo) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate(self) {
        const p = self.progress;

        // (1) FRAME — letterboxed → full bleed → stays open
        const inset = Math.max(0, 28 - p * 56);
        photo.style.clipPath = `inset(${inset}% ${(inset * 1.4).toFixed(2)}% round 18px)`;

        // (2) FRAME SCALE — gently grows as it opens
        photo.style.transform = `scale(${Math.min(1.04, 0.92 + p * 0.16)})`;

        // (3) KEN-BURNS — slight pan + scale inside the frame
        if (imgWrap) {
          const peak = 1 - Math.abs(p - 0.5) * 2;
          imgWrap.style.transform = `translateY(${((p - 0.5) * -8).toFixed(2)}%) scale(${(1.06 + peak * 0.04).toFixed(4)})`;
        }

        // (4) CAPTION — fades in only when photo is roughly full-bleed
        if (cap) {
          cap.style.opacity = p > 0.35 && p < 0.85 ? '1' : '0';
        }
      },
    });

    return () => st.kill();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{ position: 'relative', minHeight, background: bg }}
    >
      {/* Sticky viewport-pinned frame */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6vh 6vw',
        }}
      >
        {/* Photo container — clip-path and scale driven by scroll */}
        <div
          ref={photoRef}
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '18px',
            overflow: 'hidden',
            willChange: 'clip-path, transform',
            clipPath: 'inset(28% 39.20% round 18px)',
          }}
        >
          {/* Ken-Burns wrapper — translateY + scale driven by scroll */}
          <div
            ref={imgWrapRef}
            style={{
              position: 'absolute',
              inset: 0,
              willChange: 'transform',
              transform: 'translateY(4%) scale(1.10)',
            }}
          >
            <Image
              src={src}
              alt={alt}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
              priority={priority}
            />
          </div>
        </div>

        {/* Caption — mix-blend-mode: difference keeps it legible over any photo */}
        {(caption || subcaption) && (
          <div
            ref={capRef}
            style={{
              position: 'absolute',
              left: '6vw',
              right: '6vw',
              bottom: '6vh',
              mixBlendMode: 'difference',
              color: bg,
              opacity: 0,
              transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
              pointerEvents: 'none',
            }}
          >
            {caption && (
              <span
                className="block font-display font-bold"
                style={{ fontSize: 'clamp(14px, 2vw, 22px)', letterSpacing: '0.05em' }}
              >
                {caption}
              </span>
            )}
            {subcaption && (
              <span className="mt-1 block font-sans text-sm font-light opacity-70">
                {subcaption}
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
