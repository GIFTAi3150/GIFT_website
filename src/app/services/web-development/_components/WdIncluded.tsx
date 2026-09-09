import Image from 'next/image';
import type { CSSProperties } from 'react';
import originalDesign from './assets/original-design.webp';
import { INCLUDED, PAGES } from './wdContent';
import WdHead from './WdHead';

/** Shared outline-icon props for the browser chrome. */
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/**
 * All included — the build. A browser frame assembles beside the six-item
 * index as the reader scrolls: the design block lands, ten page sheets fan in,
 * the 0 stamps on, the address turns https, the news row flips, and finally
 * the frame narrows into a phone. WdScroll writes `data-step` (0–5) on
 * [data-build] and `.is-on` on the matching index row; CSS transitions do the
 * rest, so scrolling back reverses every step.
 */
export default function WdIncluded() {
  return (
    <section
      id="included"
      className="wd-sec wd-sec--paper wd-included"
      data-stage
      style={{ '--budget': 3.4 } as CSSProperties}
      aria-labelledby="wd-included-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-included__inner">
          <div className="wd-included__side">
            <WdHead label={INCLUDED.eyebrow} title={INCLUDED.title} />
            <ol className="wd-included__index" data-build-index>
              {INCLUDED.items.map((item) => (
                <li className="wd-inc" data-inc key={item.key}>
                  <span className="wd-mono wd-inc__label">{item.label}</span>
                  <h3 className="wd-inc__title">{item.title}</h3>
                  <div className="wd-inc__body">
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="wd-included__price">
              <span className="wd-mono">{INCLUDED.price.pre}</span>
              <strong>
                月額<b>{INCLUDED.price.amount}</b>
                {INCLUDED.price.unit}
                <small>{INCLUDED.price.tax}</small>
              </strong>
              <span className="wd-included__initial">{INCLUDED.price.initial}</span>
            </p>
          </div>

          <div className="wd-build" data-build data-step="0" aria-hidden>
            <div className="wd-build__frame" data-build-frame>
              <div className="wd-build__bar">
                <span className="wd-build__dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="wd-build__nav">
                  <svg viewBox="0 0 16 16" width="15" height="15">
                    <path d="M10 3 5.2 8 10 13" {...STROKE} />
                  </svg>
                  <svg viewBox="0 0 16 16" width="15" height="15" className="wd-build__dim">
                    <path d="M6 3 10.8 8 6 13" {...STROKE} />
                  </svg>
                  <svg viewBox="0 0 18 16" width="16" height="14">
                    <rect x="1.4" y="2.2" width="15.2" height="11.6" rx="2.4" {...STROKE} />
                    <path d="M6.8 2.2v11.6M3.6 5.8h1.6M3.6 8h1.6M3.6 10.2h1.6" {...STROKE} />
                  </svg>
                </span>
                <span className="wd-build__url">
                  <svg className="wd-build__lock" viewBox="0 0 16 16" width="10" height="10">
                    <rect x="3" y="7" width="10" height="7" rx="1.2" fill="currentColor" />
                    <path
                      d="M5 7V5a3 3 0 0 1 6 0v2"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                  <span className="wd-build__scheme">
                    http<span className="wd-build__s">s</span>://
                  </span>
                  {INCLUDED.url}
                </span>
                <span className="wd-build__tools">
                  <svg viewBox="0 0 16 16" width="15" height="15">
                    <path d="M8 10.2V2.8M5.6 5.2 8 2.8l2.4 2.4M4.6 7.2H3.2v6.2h9.6V7.2h-1.4" {...STROKE} />
                  </svg>
                  <svg viewBox="0 0 16 16" width="15" height="15">
                    <path d="M8 3.4v9.2M3.4 8h9.2" {...STROKE} />
                  </svg>
                  <svg viewBox="0 0 16 16" width="15" height="15">
                    <rect x="5.2" y="2.6" width="8.2" height="8.2" rx="2" {...STROKE} />
                    <rect
                      x="2.6"
                      y="5.2"
                      width="8.2"
                      height="8.2"
                      rx="2"
                      className="wd-build__tabfront"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                  </svg>
                </span>
              </div>
              <div className="wd-build__page">
                <div className="wd-build__hero">
                  <span className="wd-build__aa">Aa</span>
                  <span className="wd-build__line wd-build__line--1" />
                  <span className="wd-build__line wd-build__line--2" />
                  <span className="wd-build__btn" />
                  <span className="wd-build__art">
                    <Image
                      src={originalDesign}
                      alt=""
                      fill
                      sizes="(max-width: 899px) 45vw, 22vw"
                      priority={false}
                    />
                  </span>
                </div>
                <ol className="wd-build__pages">
                  {PAGES.pages.map((page, i) => (
                    <li key={page} style={{ '--i': i } as CSSProperties}>
                      <span>{page}</span>
                    </li>
                  ))}
                </ol>
                <div className="wd-build__news">
                  <span className="wd-mono">NEWS</span>
                  <span className="wd-build__news-slot">
                    <span className="wd-build__news-old">{INCLUDED.news.old}</span>
                    <span className="wd-build__news-new">
                      <b className="wd-mono">NEW</b>
                      {INCLUDED.news.fresh}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            <div className="wd-build__foot">
              <p className="wd-build__caption wd-mono">
                <span data-build-caption>{INCLUDED.items[0].label}</span>
              </p>
              <div className="wd-build__marks">
                <p className="wd-build__mark wd-build__mark--pages">
                  <span className="wd-mono">最大</span>
                  <b>10</b>
                  <span className="wd-build__unit">ページ</span>
                </p>
                <p className="wd-build__mark wd-build__mark--zero">
                  <span className="wd-mono">初期費用</span>
                  <b>0</b>
                  <span className="wd-build__unit">円</span>
                </p>
                <p className="wd-build__mark wd-build__mark--lock">
                  <span className="wd-mono">常時SSL</span>
                  <svg className="wd-build__glyph" viewBox="0 0 48 62">
                    <path
                      className="wd-build__shackle"
                      d="M14 28V18a10 10 0 0 1 20 0v10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                      strokeLinecap="round"
                    />
                    <rect
                      x="5"
                      y="28"
                      width="38"
                      height="31"
                      rx="4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                    />
                    <path
                      d="M24 39v9"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </p>
                <p className="wd-build__mark wd-build__mark--update">
                  <span className="wd-mono">月2回</span>
                  <svg className="wd-build__glyph wd-build__glyph--spin" viewBox="0 0 62 62">
                    <path
                      d="M53 31a22 22 0 1 1-7.2-16.3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M53 7v12h-12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </p>
                <p className="wd-build__mark wd-build__mark--phone">
                  <span className="wd-mono">PC・スマホ</span>
                  <svg className="wd-build__glyph" viewBox="0 0 44 62">
                    <rect
                      x="4"
                      y="3"
                      width="36"
                      height="56"
                      rx="6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.4"
                    />
                    <path
                      d="M18 51h8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
