import type { CSSProperties } from 'react';
import { PREPARE } from './wdContent';
import WdHead from './WdHead';

/**
 * Preparation — the handover. 文章 / 写真 / ロゴ start under 御社 and slide
 * across the divider to GIFT one by one; each landing raises its explanation.
 * What stays on your side is only the basic information and the photos you
 * already have (WdScroll).
 */
export default function WdPrepare() {
  return (
    <section
      id="prepare"
      className="wd-sec wd-sec--paper wd-prepare"
      data-stage
      style={{ '--budget': 2 } as CSSProperties}
      aria-labelledby="wd-prepare-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-prepare__inner">
          <div className="wd-prepare__side">
            <WdHead label={PREPARE.eyebrow} title={PREPARE.title} lead={PREPARE.lead} />
            <div className="wd-prepare__notewrap">
              <div className="wd-prepare__note" data-hand-left>
                <span className="wd-mono">{PREPARE.note.label}</span>
                <strong>
                  {PREPARE.note.strong[0]}
                  <br />
                  {PREPARE.note.strong[1]}
                </strong>
                <p>{PREPARE.note.tail}</p>
              </div>
            </div>
          </div>
          <div className="wd-handover" data-handover>
            <div className="wd-handover__head">
              <span className="wd-mono">{PREPARE.columns.you}</span>
              <span className="wd-mono">{PREPARE.columns.gift}</span>
            </div>
            <ol className="wd-handover__rows">
              {PREPARE.items.map((item) => (
                <li className="wd-hand" data-hand key={item.noun}>
                  <span className="wd-hand__from">
                    <span className="wd-hand__noun" data-hand-noun>
                      {item.noun}
                    </span>
                  </span>
                  <div className="wd-hand__to" data-hand-target>
                    <div className="wd-hand__note" data-hand-note>
                      <h3>{item.title}</h3>
                      <p>{item.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
