'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import services from '@/data/services.json';
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

gsap.registerPlugin(ScrollTrigger);

// Stack visual tuning — how far each card sits behind the one in front,
// and how much smaller it scales. Subtle so the stack reads as depth,
// not as a stair-step.
const STAGGER_Y = 18;
const SCALE_STEP = 0.04;

export default function ServicesCards() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const stack = stackRef.current;
    if (!section || !pin || !stack) return;

    const cards = Array.from(stack.querySelectorAll<HTMLElement>('.card-stack-item'));
    const total = cards.length;
    if (total < 2) return;

    // Stack the cards at rest — index 0 in front, each subsequent card
    // offset down by STAGGER_Y px and scaled down by SCALE_STEP. The
    // xPercent/yPercent of -50 handles centering via transform so we
    // can layer `y` and `scale` on top without fighting CSS translates.
    cards.forEach((card, i) => {
      gsap.set(card, {
        xPercent: -50,
        yPercent: -50,
        y: i * STAGGER_Y,
        scale: 1 - i * SCALE_STEP,
        zIndex: total - i,
        transformOrigin: 'center center',
      });
    });

    // Each card transition takes one viewport height of scroll. With N
    // cards, we need (N-1) transitions before the last card sits front.
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut', duration: 1 },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (total - 1)}`,
        pin: pin,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    for (let i = 0; i < total - 1; i++) {
      // Drop the front card — translates up and off, fades, tilts slightly
      // so it reads as "thrown away" rather than just sliding.
      tl.to(
        cards[i],
        {
          y: () => -window.innerHeight * 0.85,
          opacity: 0,
          rotate: -6,
          scale: 0.88,
          ease: 'power2.in',
          // Prevent the dropped card from intercepting clicks once it's
          // off-screen (clicks would still hit it during the fade out).
          pointerEvents: 'none',
        },
        i
      );

      // All cards behind shift one slot forward — into the position
      // previously occupied by the card that's dropping.
      for (let j = i + 1; j < total; j++) {
        const newSlot = j - i - 1;
        tl.to(
          cards[j],
          {
            y: newSlot * STAGGER_Y,
            scale: 1 - newSlot * SCALE_STEP,
            ease: 'power2.out',
          },
          i
        );
      }
    }

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full bg-gift-near-black"
      // Section needs enough height to scrub through (total - 1) transitions
      // plus the initial pin moment. 100vh per card transition + 100vh
      // settle = (total) * 100vh total height.
      style={{ height: `${100 * Math.max(2, services.length)}vh` }}
    >
      <div ref={pinRef} className="h-screen w-full flex flex-col overflow-hidden">
        {/* Section header — stays visible above the dropping stack */}
        <div className="mx-auto w-full max-w-container px-4 md:px-6 lg:px-8 pt-s-80 shrink-0">
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            SERVICE
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            事業内容
          </h2>
          <p className="mt-2 font-sans text-normal font-light text-gift-silver">
            GIFTが提供する3つの事業。
          </p>
        </div>

        {/* Cards stack — absolute-positioned cards centered in flex area.
            Each card uses top-1/2 left-1/2 for centering anchor; GSAP
            applies xPercent: -50, yPercent: -50 transform to actually
            center, leaving y/scale free for the stack offsets. */}
        <div ref={stackRef} className="relative flex-1 w-full">
          {services.map((s, idx) => {
            const Icon = SERVICE_ICON_BY_ID[s.id];
            const cardContent = (
              <div className="gift-card group relative flex h-full flex-col overflow-hidden !p-0">
                <div
                  className="relative overflow-hidden rounded-t-[18px]"
                  style={{ aspectRatio: '4/3' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover brightness-75 transition-all duration-700 group-hover:scale-[1.06] group-hover:brightness-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

                  <span className="absolute left-5 top-4 font-display text-small font-bold tracking-widest text-gift-green">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <h3 className="absolute bottom-4 left-5 right-5 font-display text-medium font-bold leading-tight text-gift-ink">
                    {s.titleEn}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3">
                    {Icon && (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gift-green/10 text-gift-green transition-colors duration-300 group-hover:bg-gift-green group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </span>
                    )}
                    <p className="font-sans text-small font-medium text-gift-green-mid">{s.title}</p>
                  </div>
                  <p className="mt-1 flex-1 font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                    {s.body.length > 90 ? s.body.slice(0, 90) + '…' : s.body}
                  </p>
                </div>

                <span className="gift-card-btn">詳しく見る</span>
              </div>
            );

            const wrapperClass =
              'card-stack-item absolute top-1/2 left-1/2 w-[90%] max-w-[520px] will-change-transform';

            return s.href ? (
              <Link key={s.id} href={s.href} className={wrapperClass}>
                {cardContent}
              </Link>
            ) : (
              <div key={s.id} className={wrapperClass}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
