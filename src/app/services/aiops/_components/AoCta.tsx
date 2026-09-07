import Link from 'next/link';
import { CTA } from './aoContent';

/**
 * The bookend. Under the CTA the veil lifts and the liquid starts moving
 * again (AoField CTA targets) — 動き始めます — and the copy rises in.
 */
export default function AoCta() {
  return (
    <section className="ao-cta" id="contact">
      <div className="ao-container ao-cta__inner" data-cta-rise>
        <p className="ao-label ao-cta__label">
          <span className="ao-label__rule" aria-hidden />
          <span className="ao-label__text">{CTA.label}</span>
          <span className="ao-cta__label-ja">{CTA.labelJa}</span>
        </p>
        <h2 className="ao-cta__h">
          {CTA.titleEn[0]} <em>{CTA.titleEn[1]}</em>
        </h2>
        <p className="ao-cta__ja">{CTA.ja}</p>
        <Link href={CTA.button.href} className="cta-btn cta-btn--ao ao-cta__btn">
          <span>{CTA.button.label}</span>
        </Link>
      </div>
    </section>
  );
}
