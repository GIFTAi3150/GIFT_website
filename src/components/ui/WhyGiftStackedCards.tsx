'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

type CardData = {
  num: string;
  title: string;
  body: string;
  img: string;
  bg: string;
};

const CARDS: CardData[] = [
  {
    num: '01',
    title: '成長機会',
    body: '年齢や経歴を問わず、意欲のある人には早くから裁量と役割をお任せします。立ち止まらず挑戦し続けられる環境です。',
    img: '/recruit/why-gift/whyg1.png',
    bg: '#F5F3EF',
  },
  {
    num: '02',
    title: '横断キャリア',
    body: 'コール → SV → DX → 財務 と、事業領域を越えて経験を積める数少ない会社です。キャリアの可能性が広がります。',
    img: '/recruit/why-gift/whyg2.png',
    bg: '#EEF3F5',
  },
  {
    num: '03',
    title: 'AI・最新ツールを使い倒す',
    body: '生成AIをはじめとした最新ツールを日常業務にフル活用。時代に取り残されない働き方ができます。',
    img: '/recruit/why-gift/whyg3.png',
    bg: '#F2EEF5',
  },
  {
    num: '04',
    title: '研修と評価制度',
    body: 'コールセンター約300名を支える教育制度が礎。個々の挑戦を後押しする運営が全社に行き渡っています。',
    img: '/recruit/why-gift/whyg4.png',
    bg: '#EEF5EF',
  },
];

const TOTAL = CARDS.length;

// pos 0 = front card, pos 3 = hidden at the back
const STACK = [
  { topOffset: 64, scale: 1,    zIndex: 40, opacity: 1 },
  { topOffset: 38, scale: 0.95, zIndex: 30, opacity: 1 },
  { topOffset: 18, scale: 0.90, zIndex: 20, opacity: 1 },
  { topOffset: 6,  scale: 0.85, zIndex: 10, opacity: 0 },
] as const;

const CARD_HEIGHT = 476;
const CONTAINER_HEIGHT = CARD_HEIGHT + STACK[0].topOffset; // 540

export default function WhyGiftStackedCards() {
  const [active, setActive] = useState(0);

  const next = useCallback(() => setActive((i) => (i + 1) % TOTAL), []);
  const prev = useCallback(() => setActive((i) => (i - 1 + TOTAL) % TOTAL), []);

  return (
    <section className="bg-white pb-[80px] pt-2 md:pb-[120px]">
      <div className="mx-auto max-w-[580px] px-5 md:px-0">
        {/* Card stack */}
        <div className="relative" style={{ height: CONTAINER_HEIGHT }}>
          {CARDS.map((card, cardIdx) => {
            const pos = (cardIdx - active + TOTAL) % TOTAL;
            const cfg = STACK[pos];

            return (
              <div
                key={card.num}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: cfg.topOffset,
                  height: CARD_HEIGHT,
                  transform: `scaleX(${cfg.scale})`,
                  zIndex: cfg.zIndex,
                  opacity: cfg.opacity,
                  transition:
                    'top 0.52s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.52s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.38s ease',
                }}
                className="relative rounded-3xl shadow-sm overflow-hidden"
              >
                {/* Full-bleed image */}
                <Image
                  src={card.img}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="580px"
                />

                {/* Gradient scrim so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-3xl" />

                {/* Text overlay */}
                <div className="absolute inset-0 flex flex-col justify-between px-8 py-8">
                  <p className="font-nube-sans text-xs font-normal uppercase tracking-[0.18em] text-white/50">
                    {card.num} / {TOTAL}
                  </p>
                  <div>
                    <h3
                      className="mb-3 font-nube-display text-white"
                      style={{ fontSize: 'clamp(20px, 2.2vw, 26px)', lineHeight: 1.4 }}
                    >
                      {card.title}
                    </h3>
                    <p className="font-nube-sans text-sm leading-relaxed text-white/75">
                      {card.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation — arrows + dot indicators */}
        <div className="mt-7 flex items-center justify-center gap-5">
          <button
            onClick={prev}
            aria-label="前へ"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gift-ink/20 text-gift-ink transition-colors duration-200 hover:border-gift-ink hover:bg-gift-ink hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex gap-2">
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`カード ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-gift-ink' : 'w-1.5 bg-gift-ink/15'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            aria-label="次へ"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gift-ink/20 text-gift-ink transition-colors duration-200 hover:border-gift-ink hover:bg-gift-ink hover:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
