'use client';

import dynamic from 'next/dynamic';
import AoHead from './AoHead';
import { CAPS } from './aoContent';

// Lottie touches the DOM; load client-only to avoid SSR mismatch.
const CapLottie = dynamic(() => import('./CapLottie'), { ssr: false });

/**
 * Capabilities — "the dial". The six titles sit on the spokes of a wheel whose
 * hub is off the left edge (desktop) / above the top edge (phone); the scroll
 * turns the wheel (`--dial-a`, AoScroll) so each title comes to the pointer
 * in turn, and the panel beside it shows that capability's Lottie, body and
 * tags. Rotation is the section's one mechanism.
 */
export default function AoCaps() {
  const n = CAPS.items.length;
  return (
    <section className="ao-caps" id="capabilities">
      <div className="ao-container">
        <AoHead label={CAPS.label} title={CAPS.title} lead={CAPS.lead} />
      </div>

      <div className="ao-caps__stage" data-caps-stage>
        <div className="ao-caps__frame">
          <div className="ao-dial" data-dial style={{ '--n': n } as React.CSSProperties}>
            <span className="ao-dial__ring" aria-hidden />
            <span className="ao-dial__ring ao-dial__ring--inner" aria-hidden />
            <span className="ao-dial__pointer" aria-hidden />
            <div className="ao-dial__wheel" data-dial-wheel>
              {CAPS.items.map((c, i) => (
                <div
                  key={c.id}
                  className="ao-dial__spoke"
                  data-dial-spoke={i}
                  style={{ '--i': i } as React.CSSProperties}
                >
                  <span className="ao-dial__tick" aria-hidden />
                  <span className="ao-dial__title">{c.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ao-caps__panel">
            {CAPS.items.map((c, i) => (
              <article key={c.id} className="ao-cap" data-cap={i}>
                <div className="ao-cap__lottie" aria-hidden>
                  <CapLottie src={c.lottie} />
                </div>
                <div className="ao-cap__text">
                  <h3 className="ao-cap__title">{c.title}</h3>
                  <p className="ao-cap__body">{c.body}</p>
                  <ul className="ao-cap__tags">
                    {c.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
