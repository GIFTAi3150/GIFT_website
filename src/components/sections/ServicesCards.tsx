'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import servicesData from '@/data/services.json';

const MAX_TILT = 14;

function ServiceCard({ service }: { service: (typeof servicesData)[0] }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = 'box-shadow 0.3s ease, transform 0.08s linear';
      card.style.transform = `perspective(900px) rotateX(${-ny * MAX_TILT * 2}deg) rotateY(${nx * MAX_TILT * 2}deg) scale3d(1.03, 1.03, 1.03)`;
    });
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const touch = e.touches[0];
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const nx = (touch.clientX - rect.left) / rect.width - 0.5;
      const ny = (touch.clientY - rect.top) / rect.height - 0.5;
      card.style.transition = 'box-shadow 0.3s ease, transform 0.08s linear';
      card.style.transform = `perspective(900px) rotateX(${-ny * MAX_TILT * 2}deg) rotateY(${nx * MAX_TILT * 2}deg) scale3d(1.03, 1.03, 1.03)`;
    });
  };

  const onTouchEnd = () => {
    const card = cardRef.current;
    cancelAnimationFrame(rafRef.current);
    if (card) {
      card.style.transition = 'box-shadow 0.3s ease, transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  const onMouseLeave = () => {
    const card = cardRef.current;
    cancelAnimationFrame(rafRef.current);
    if (card) {
      card.style.transition = 'box-shadow 0.3s ease, transform 0.55s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={() => router.push(service.href)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.35)] hover:shadow-[0_30px_60px_-10px_rgba(37,99,235,0.4)]"
      style={{ willChange: 'transform', aspectRatio: '3 / 4' }}
    >
      {/* Photo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={service.image}
        alt={service.title}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

      {/* Top accent */}
      <span aria-hidden className="absolute left-1/2 top-4 h-[3px] w-8 -translate-x-1/2 rounded-full bg-[#2563EB]" />

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
        <p className="font-sans text-[17px] font-bold leading-tight text-white">{service.title}</p>
        <p className="mt-1 font-display text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
          {service.titleEn}
        </p>
      </div>
    </div>
  );
}

export default function ServicesCards() {
  return (
    <section className="w-full border-t border-[#BFDBFE] bg-[#F0F7FF] py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <p className="font-display text-small font-bold uppercase tracking-widest text-[#2563EB]">
            SERVICE
          </p>
          <h2
            className="font-sans font-extrabold text-[#0C0E1A]"
            style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: '1.15' }}
          >
            事業内容
          </h2>
          <p className="font-sans text-normal font-light text-[#475569]">GIFTが提供する事業。</p>
        </div>

        <div className="flex justify-center">
        <div className="w-full max-w-sm">
          {servicesData
            .filter((s) => !['callcenter', 'finance-consulting'].includes(s.id))
            .map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
        </div>
        </div>
      </div>
    </section>
  );
}
