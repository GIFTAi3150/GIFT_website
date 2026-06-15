'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

// Emoji rain effect adapted from Osmo Supply (free GSAP-only version).
// On click: spawns 60 emoji elements at the bottom of a fixed-position
// container, animates each upward with random scale/rotation/delay, then
// removes them after the burst. Navigation to /recruit is delayed ~700ms
// so the rain is visibly playing before the route transition kicks in.

const EMOJIS = ['🔥', '😍'];

export default function RecruitCta() {
  const containerRef = useRef<HTMLDivElement>(null);
  const runningRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    // Prefetch the destination so navigation after the rain feels instant
    router.prefetch('/recruit');
  }, [router]);

  const fireRain = () => {
    const container = containerRef.current;
    if (!container || runningRef.current) return;
    runningRef.current = true;

    const containerHeight = container.offsetHeight;
    const quantity = 60;
    const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    for (let i = 0; i < quantity; i++) {
      const scale = Math.random() * 0.6 + 0.4;
      const rotate = randInt(1, 5);
      const delay = 0.001 * randInt(0, 1250);
      const speed = randInt(500, 1500) * 0.001;
      const left = `${randInt(0, 10)}0%`;
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

      const single = document.createElement('div');
      single.className = 'single-rain-emoji append';
      single.style.left = left;

      const child = document.createElement('div');
      child.className = 'single-rain-emoji-text';
      child.textContent = emoji;
      single.appendChild(child);

      gsap.fromTo(
        single,
        { y: containerHeight, xPercent: -50, rotate: 0.001, scale },
        {
          y: '-100%',
          xPercent: -50,
          rotate: 0.001,
          delay,
          ease: 'Power1.easeIn',
          duration: speed,
        },
      );
      gsap.fromTo(
        child,
        { xPercent: -25, rotate },
        {
          xPercent: 25,
          rotate: -rotate,
          ease: 'Power1.easeInOut',
          delay,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
        },
      );

      container.appendChild(single);
    }

    window.setTimeout(() => {
      container.querySelectorAll('.single-rain-emoji.append').forEach((el) => el.remove());
      runningRef.current = false;
    }, 2750);
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    fireRain();
    window.setTimeout(() => router.push('/recruit'), 700);
  };

  return (
    <>
      <div ref={containerRef} className="emoji-rain-container" aria-hidden="true" />
      <section className="border-t border-[#BFDBFE] bg-white py-s-80">
        <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
          <p className="mb-6 font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
            RECRUIT
          </p>
          <Link href="/recruit" className="cta-btn cta-btn--ai" onClick={handleClick}>
            <span>採用情報はこちら🔥 + 😍</span>
          </Link>
        </div>
      </section>
    </>
  );
}
