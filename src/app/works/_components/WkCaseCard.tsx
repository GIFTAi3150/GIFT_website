'use client';

import Image from 'next/image';
import { Headphones, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { PickUpCase } from './worksContent';
import styles from './WkCaseCard.module.css';

// Independently implemented from the public Osmo 3D Perspective Hover preview:
// https://www.osmo.supply/preview?resource=3d-perspective-hover
export default function WkCaseCard({ item, index }: { item: PickUpCase; index: number }) {
  const stageRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const [interactive, setInteractive] = useState(false);
  const number = String(index + 1).padStart(2, '0');
  const Icon = item.icon === 'headphones' ? Headphones : Store;

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const control = controlRef.current;
    if (!stage || !card || !control) return;
    const hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    let rotateX = 0;
    let rotateY = 0;
    let tapAnimation: Animation | null = null;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      tapAnimation?.cancel();
      tapAnimation = null;
      delete card.dataset.animating;
      card.dataset.tilting = 'false';
      card.style.setProperty('--rotate-x', '0deg');
      card.style.setProperty('--rotate-y', '0deg');
    };
    const move = (event: PointerEvent) => {
      if (reduced.matches || !hover.matches || event.pointerType === 'touch' || tapAnimation) return;
      // Measure the stationary hit area so the tilted edges never cause feedback jitter.
      const bounds = stage.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      const y = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      rotateX = -y * 12;
      rotateY = x * 18;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        card.dataset.tilting = 'true';
        card.style.setProperty('--rotate-x', rotateX + 'deg');
        card.style.setProperty('--rotate-y', rotateY + 'deg');
      });
    };
    const activate = () => {
      if (reduced.matches || document.hidden || !card.animate) return;
      // Continue from the current pose when a visitor taps again mid-animation.
      const start = getComputedStyle(card).transform;
      reset();
      card.dataset.animating = 'true';
      const direction = index % 2 === 0 ? 1 : -1;
      const animation = card.animate(
        [
          { transform: start, offset: 0, easing: 'ease-out' },
          {
            transform: `translateY(-8px) rotateX(5deg) rotateY(${-7 * direction}deg)`,
            offset: 0.32,
            easing: 'ease-in-out',
          },
          {
            transform: `translateY(-5px) rotateX(-2deg) rotateY(${3 * direction}deg)`,
            offset: 0.65,
            easing: 'ease-in-out',
          },
          { transform: 'translateY(0) rotateX(0deg) rotateY(0deg)', offset: 1 },
        ],
        { duration: 1000 },
      );
      tapAnimation = animation;
      animation.onfinish = () => {
        if (tapAnimation !== animation) return;
        tapAnimation = null;
        delete card.dataset.animating;
      };
    };
    const leave = (event: PointerEvent) => {
      // Touch pointers leave immediately after a tap; let the tap animation finish.
      if (event.pointerType !== 'touch') reset();
    };
    const syncMotion = () => {
      reset();
      setInteractive(!reduced.matches && typeof card.animate === 'function');
    };
    syncMotion();
    control.addEventListener('click', activate);
    control.addEventListener('blur', reset);
    stage.addEventListener('pointermove', move, { passive: true });
    stage.addEventListener('pointerleave', leave);
    stage.addEventListener('pointercancel', reset);
    window.addEventListener('blur', reset);
    window.addEventListener('scroll', reset, { passive: true });
    document.addEventListener('visibilitychange', reset);
    hover.addEventListener('change', reset);
    reduced.addEventListener('change', syncMotion);
    return () => {
      reset();
      control.removeEventListener('click', activate);
      control.removeEventListener('blur', reset);
      stage.removeEventListener('pointermove', move);
      stage.removeEventListener('pointerleave', leave);
      stage.removeEventListener('pointercancel', reset);
      window.removeEventListener('blur', reset);
      window.removeEventListener('scroll', reset);
      document.removeEventListener('visibilitychange', reset);
      hover.removeEventListener('change', reset);
      reduced.removeEventListener('change', syncMotion);
    };
  }, [index]);

  return (
    <article
      ref={stageRef}
      className={styles.stage}
      aria-labelledby={'works-case-' + number}
      data-works-case
    >
      <div ref={cardRef} className={styles.card} data-perspective-card>
        <div className={styles.visual}>
          <div className={styles.photoFrame}>
            {/* Existing service imagery is decorative, not client-project photography. */}
            <Image
              src={item.imageSrc}
              alt=""
              fill
              sizes="(max-width: 767px) calc(100vw - 80px), (max-width: 1280px) 42vw, 520px"
              className={styles.photo}
            />
            <div className={styles.photoShade} />
          </div>
          <div className={styles.label}>
            <span className={styles.labelKicker}>CASE {number}</span>
            <h3 id={'works-case-' + number} className={styles.industry}>
              {item.industry}
            </h3>
          </div>
          <div className={styles.disc} aria-hidden="true">
            <Icon strokeWidth={1.25} />
            <span className={styles.discDetail}>{number}</span>
          </div>
          <span className={styles.signature} aria-hidden="true">
            GIFT / WORKS
          </span>
        </div>
        <div className={styles.copy}>
          <p>{item.body}</p>
        </div>
      </div>
      <button
        ref={controlRef}
        type="button"
        className={styles.motionControl}
        aria-label={item.industry + 'のカードアニメーションを再生'}
        hidden={!interactive}
      />
    </article>
  );
}
