'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const CASES = [
  {
    client: 'AIOps / ã‚«ã‚¹ã‚¿ãƒžãƒ¼ã‚µãƒãƒ¼ãƒˆ',
    title: 'å•ã„åˆã‚ã›å¯¾å¿œã®å®Œå…¨è‡ªå‹•åŒ–ã§ä¸€æ¬¡è§£æ±ºçŽ‡98%ã‚’é”æˆ',
    summary: 'ç¹°ã‚Šè¿”ã—æ¥­å‹™ã«è¿½ã‚ã‚Œã‚‹ã‚µãƒãƒ¼ãƒˆãƒãƒ¼ãƒ ã®è² è·ã‚’AIã‚¨ãƒ¼ã‚¸ã‚§ãƒ³ãƒˆãŒè‚©ä»£ã‚ã‚Šã€‚800ç¨®é¡žä»¥ä¸Šã®å•ã„åˆã‚ã›ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ã§åˆ†é¡žãƒ»å›žç­”ã—ã€äººçš„å¯¾å¿œã¯æœ¬å½“ã«å¿…è¦ãªã‚±ãƒ¼ã‚¹ã ã‘ã«çµžã‚‹ã€‚',
  },
  {
    client: 'AIOps / ç¤¾å†…æ¥­å‹™è‡ªå‹•åŒ–',
    title: 'æ‰¿èªãƒ»å ±å‘Šãƒ»é›†è¨ˆãƒ•ãƒ­ãƒ¼ã‚’AIãŒè‡ªå¾‹å®Ÿè¡Œã—å·¥æ•°ã‚’65%å‰Šæ¸›',
    summary: 'è¤‡æ•°ã‚·ã‚¹ãƒ†ãƒ ã‚’ã¾ãŸãå®šåž‹æ¥­å‹™ã‚’AIã‚¨ãƒ¼ã‚¸ã‚§ãƒ³ãƒˆãŒä»£æ›¿ã€‚ãƒ‡ãƒ¼ã‚¿åŽé›†ã‹ã‚‰æ‰¿èªãƒ«ãƒ¼ãƒ†ã‚£ãƒ³ã‚°ãƒ»ãƒ¬ãƒãƒ¼ãƒˆç”Ÿæˆã¾ã§ã€æ¯Žæ—¥ç¹°ã‚Šè¿”ã•ã‚Œã¦ã„ãŸæ‰‹ä½œæ¥­ã‚’ã‚¼ãƒ­ã«ã™ã‚‹ã€‚',
  },
  {
    client: 'AIOps / ç•°å¸¸æ¤œçŸ¥ãƒ»ã‚³ãƒ³ãƒ—ãƒ©ã‚¤ã‚¢ãƒ³ã‚¹',
    title: 'ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ç›£è¦–ã§éšœå®³ãƒ»é•åãƒªã‚¹ã‚¯ã‚’äººæ‰‹ã‚¼ãƒ­ã§æ¤œå‡º',
    summary: 'ãƒ­ã‚°ã‚„ãƒˆãƒ©ãƒ³ã‚¶ã‚¯ã‚·ãƒ§ãƒ³ãƒ‡ãƒ¼ã‚¿ã‚’AIãŒå¸¸æ™‚ã‚¹ã‚­ãƒ£ãƒ³ã—ã€ç•°å¸¸ãƒ‘ã‚¿ãƒ¼ãƒ³ã‚’å³åº§ã«ãƒ•ãƒ©ã‚°ã€‚æ‹…å½“è€…ãŒãƒ¬ãƒãƒ¼ãƒˆã‚’ç¢ºèªã™ã‚‹ã“ã‚ã«ã¯åŽŸå› åˆ†æžã¨å¯¾å¿œæ¡ˆã¾ã§è‡ªå‹•ç”Ÿæˆã•ã‚Œã¦ã„ã‚‹ã€‚',
  },
  {
    client: 'AIOps / ã‚µãƒ—ãƒ©ã‚¤ãƒã‚§ãƒ¼ãƒ³æœ€é©åŒ–',
    title: 'éœ€è¦äºˆæ¸¬ã¨ç™ºæ³¨è‡ªå‹•åŒ–ã§ã‚­ãƒ£ãƒƒã‚·ãƒ¥ãƒ•ãƒ­ãƒ¼ã‚’æ”¹å–„',
    summary: 'è²©å£²ãƒ‡ãƒ¼ã‚¿ãƒ»åœ¨åº«ãƒ»å¤–éƒ¨å¤‰æ•°ã‚’AIãŒçµ±åˆåˆ†æžã—ã€é©æ­£ç™ºæ³¨é‡ã‚’ãƒªã‚¢ãƒ«ã‚¿ã‚¤ãƒ ç®—å‡ºã€‚éŽå‰°åœ¨åº«ã¨æ¬ å“ã‚’åŒæ™‚ã«æŠ‘ãˆãªãŒã‚‰ã€ç™ºæ³¨æ¥­å‹™ãã®ã‚‚ã®ã‚’è‡ªå‹•åŒ–ã™ã‚‹ã€‚',
  },
];

// Append clones of all cards so the forward loop is seamless:
// after the last real card (index CASES.length) we see the first clone,
// then onTransitionEnd snaps back to 0 with no animation â†’ invisible seam.
const ITEMS = [...CASES, ...CASES];
const GAP = 32; // px between cards

export default function HPCases() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [cardW, setCardW] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [animated, setAnimated] = useState(true);
  const [paused, setPaused] = useState(false);

  // Drag state
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);
  const isDragging = useRef(false);

  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setCardW(mobile ? w : (w - GAP) / 2);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [measure]);

  // When idx lands on the clone zone (>= CASES.length), silently reset to real position
  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform') return;
      if (idx >= CASES.length) {
        setAnimated(false);
        setIdx(idx - CASES.length);
      }
    },
    [idx],
  );

  // Re-enable transition after the instant reset
  useEffect(() => {
    if (!animated) {
      const id = requestAnimationFrame(() => setAnimated(true));
      return () => cancelAnimationFrame(id);
    }
  }, [animated]);

  const advance = useCallback(() => {
    setAnimated(true);
    setIdx(prev => Math.min(prev + 1, CASES.length)); // cap at first clone position
  }, []);

  const goBack = useCallback(() => {
    setAnimated(true);
    setIdx(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(advance, 2500);
    return () => clearInterval(t);
  }, [paused, advance]);

  const translateX = cardW ? -(idx * (cardW + GAP)) : 0;

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartX.current = e.clientX;
    dragDelta.current = 0;
    isDragging.current = true;
    setPaused(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    dragDelta.current = e.clientX - dragStartX.current;
  };

  const onPointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setPaused(false);
    if (dragDelta.current < -50) advance();
    else if (dragDelta.current > 50) goBack();
  };

  return (
    <section
      className="relative bg-white py-24 md:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">

        {/* Top rule â€” matches the reference's thin animated border-heading line */}
        <div className="mb-10 h-px bg-[#111B21]" />

        {/* Heading row + arrow buttons */}
        <div className="mb-12 flex items-center justify-between gap-4">

          {/* "Case" + pill */}
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <h2 className="font-forum text-[clamp(52px,7.5vw,80px)] leading-none text-[#111B21]">
              Case
            </h2>
            <span className="bg-[#111B21] px-3 py-1.5 font-sans text-[14px] font-bold leading-normal tracking-tight text-white">
              æ´»ç”¨äº‹ä¾‹
            </span>
          </div>

          {/* Square arrow buttons, top-right â€” rgba(0,0,0,0.2) background, 40Ã—40 */}
          <div className="flex shrink-0 gap-2.5">
            <button
              onClick={goBack}
              disabled={idx === 0}
              aria-label="å‰ã¸"
              className="flex h-10 w-10 items-center justify-center bg-black/20 text-[#111B21] transition-colors hover:bg-[#111B21] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={advance}
              aria-label="æ¬¡ã¸"
              className="flex h-10 w-10 items-center justify-center bg-black/20 text-[#111B21] transition-colors hover:bg-[#111B21] hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel viewport */}
        <div ref={containerRef} className="overflow-hidden">
          <div
            className="flex select-none"
            style={{
              gap: GAP,
              transform: `translateX(${translateX}px)`,
              transition: animated ? 'transform 600ms cubic-bezier(.22, 1, .36, 1)' : 'none',
              cursor: isDragging.current ? 'grabbing' : 'grab',
            }}
            onTransitionEnd={handleTransitionEnd}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {ITEMS.map((c, i) => (
              <div
                key={i}
                className="relative shrink-0 border border-[#111B21] bg-white"
                style={{
                  width: cardW || (isMobile ? '100%' : 'calc(50% - 16px)'),
                  height: 230,
                  padding: 32,
                  overflow: 'hidden',
                }}
              >
                {/* Quotation mark â€” top-right, faint, serif */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-2 select-none font-forum text-[68px] leading-none text-[#111B21]/10"
                >
                  {'â€œ'}
                </span>

                {/* Card body */}
                <div className="flex h-full flex-col justify-between">

                  {/* Top: client pill + title */}
                  <div className="flex flex-col gap-4">
                    <span className="w-fit bg-[#111B21] px-2 py-0.5 font-sans text-[13px] font-bold leading-relaxed tracking-tight text-white">
                      {c.client}
                    </span>
                    <h3
                      className="font-sans text-[15px] font-bold leading-snug text-[#111B21]"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {c.title}
                    </h3>
                  </div>

                  {/* Summary â€” 2-line clamp */}
                  <p
                    className="font-sans text-[15px] leading-relaxed text-[#111B21]"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {c.summary}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View More â€” dark rectangle, right-aligned */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/services/aiops"
            className="group inline-flex h-12 w-48 items-center justify-between border border-[#111B21] bg-[#111B21] px-5 text-white transition-all duration-300 hover:bg-transparent hover:text-[#111B21]"
          >
            <span className="font-sans text-sm font-bold tracking-widest">View More</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </section>
  );
}

