import type { CSSProperties } from 'react';
import { PAGES } from './wdContent';
import WdHead from './WdHead';

/**
 * 10 pages — the spread. Ten sheets sit in a pile and fan out into the sitemap
 * grid with the scroll (WdScroll measures each sheet's grid slot and tweens it
 * from the pile). The index numbers are real content: it is a sitemap.
 */
export default function WdPages() {
  return (
    <section
      id="pages"
      className="wd-sec wd-sec--blue wd-pages"
      data-stage
      style={{ '--budget': 1.8 } as CSSProperties}
      aria-labelledby="wd-pages-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-pages__inner">
          <div className="wd-pages__side">
            <WdHead label={PAGES.eyebrow} title={PAGES.title} />
            <p className="wd-pages__count">
              <span>{PAGES.count.pre}</span>
              <strong>{PAGES.count.n}</strong>
              <span>{PAGES.count.post}</span>
            </p>
            <p className="wd-pages__note">
              {PAGES.note[0]}
              <br />
              {PAGES.note[1]}
            </p>
          </div>
          <div className="wd-spread">
            <div className="wd-spread__head wd-mono">
              <span>{PAGES.heading}</span>
              <span>{PAGES.index}</span>
            </div>
            <ol className="wd-spread__grid" data-spread>
              {PAGES.pages.map((page, i) => (
                <li
                  className="wd-sheet"
                  data-sheet
                  key={page}
                  style={{ '--i': i } as CSSProperties}
                >
                  <span className="wd-mono">{String(i + 1).padStart(2, '0')}</span>
                  <span className="wd-sheet__name">{page}</span>
                </li>
              ))}
            </ol>
            <p className="wd-spread__foot">{PAGES.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
