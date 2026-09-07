import Link from 'next/link';
import { CTA } from './khContent';

/**
 * CTA — the bookend. The section is transparent: the veil over the field
 * lifts here and a slow wave of light runs through the lattice rows (KhField)
 * while the copy rises in with a scrub (KhScroll). The button is the site's
 * directional outline button (CtaHoverHydrator), nothing stacked on top.
 */
export default function KhCta() {
  return (
    <section id="cta" className="kh-cta">
      <div className="kh-container kh-cta__inner" data-cta-rise>
        <p className="kh-cta__lead">{CTA.lead}</p>
        <Link href={CTA.href} className="cta-btn cta-btn--kh">
          <span>{CTA.label}</span>
        </Link>
      </div>
    </section>
  );
}
