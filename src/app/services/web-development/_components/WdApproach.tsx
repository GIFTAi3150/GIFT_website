import Image from 'next/image';
import type { CSSProperties } from 'react';
import craft from './assets/ai-craft.webp';
import { APPROACH } from './wdContent';
import WdHead from './WdHead';

/**
 * Approach — the join. The picture is two halves (AI / HUMAN CRAFT) that
 * travel toward each other and meet; × appears at the seam and the copy rises
 * with it (WdScroll). Top/bottom halves on phones.
 */
export default function WdApproach() {
  return (
    <section
      id="approach"
      className="wd-sec wd-sec--navy wd-approach"
      data-stage
      style={{ '--budget': 1.7 } as CSSProperties}
      aria-labelledby="wd-approach-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-approach__inner">
          <div className="wd-join" data-join>
            {(['-1', '1'] as const).map((side) => (
              <figure
                className={`wd-join__half wd-join__half--${side === '-1' ? 'l' : 'r'}`}
                data-join-half={side}
                key={side}
              >
                <Image
                  src={craft}
                  alt={side === '-1' ? APPROACH.alt : ''}
                  className="wd-join__img"
                  data-join-img
                  sizes="(max-width: 899px) 100vw, 60vw"
                  priority={false}
                />
                <figcaption className="wd-mono">
                  {side === '-1' ? APPROACH.captions.l : APPROACH.captions.r}
                </figcaption>
              </figure>
            ))}
            <span className="wd-join__cross" data-join-cross aria-hidden>
              ×
            </span>
          </div>
          <div className="wd-approach__copy" data-join-copy>
            <WdHead label={APPROACH.eyebrow} title={APPROACH.title} />
            {APPROACH.body.map((paragraph) => (
              <p className="wd-approach__p" key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className="wd-approach__next">
              <span aria-hidden>↓</span>
              <p>
                {APPROACH.next.lead}
                <br />
                <a href="#plans">{APPROACH.next.link}</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
