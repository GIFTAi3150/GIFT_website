import type { CSSProperties } from 'react';
import {
  House,
  PanelsTopLeft,
  Layers3,
  BadgeCheck,
  MessageSquareQuote,
  Building2,
  UserRound,
  Megaphone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { PAGES } from './wdContent';
import WdHead from './WdHead';

const PAGE_ICONS = [
  House,
  PanelsTopLeft,
  Layers3,
  BadgeCheck,
  MessageSquareQuote,
  Building2,
  UserRound,
  Megaphone,
  Mail,
  ShieldCheck,
];

/**
 * 10 pages — the spread. The deck starts in slot 10; cards 01–09 move into
 * their grid positions in order before card 10 settles. Finished cards remain
 * unobstructed throughout the sequence, including on narrow phones.
 */
export default function WdPages() {
  return (
    <section
      id="pages"
      className="wd-sec wd-sec--blue wd-pages"
      data-stage
      style={{ '--budget': 8.4 } as CSSProperties}
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
            </div>
            <ol className="wd-spread__grid" data-spread>
              {PAGES.pages.map((page, i) => {
                const Icon = PAGE_ICONS[i];
                return (
                  <li
                    className="wd-sheet"
                    data-sheet
                    key={page}
                    style={{ '--i': i } as CSSProperties}
                  >
                    <Icon className="wd-sheet__icon" strokeWidth={1.75} aria-hidden="true" />
                    <span className="wd-sheet__name">{page}</span>
                  </li>
                );
              })}
            </ol>
            <p className="wd-spread__foot">{PAGES.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
