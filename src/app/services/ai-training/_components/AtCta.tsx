import Link from 'next/link';
import { CTA } from './aiTrainingContent';

/**
 * CTA — the bookend. The section is transparent: the veil over the plasma
 * lifts a little here (AtPlasma) and the copy rises in with a scrub
 * (AtScroll).
 */
export default function AtCta() {
  return (
    <section id="cta" className="at-cta">
      <div className="at-container at-cta__inner" data-cta-rise>
        <p className="at-cta__lead">{CTA.lead}</p>
        <Link href={CTA.href} className="cta-btn cta-btn--at">
          <span>{CTA.label}</span>
        </Link>
      </div>
    </section>
  );
}
