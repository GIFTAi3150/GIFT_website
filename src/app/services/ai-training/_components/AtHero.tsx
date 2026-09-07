import Link from 'next/link';
import { HERO } from './aiTrainingContent';

/**
 * The hero: AI TRAINING set as the biggest thing on the page, over the plasma
 * (AtPlasma, behind the DOM). Full-viewport, scrolls naturally; as it leaves,
 * AtScroll scrubs the navy veil over the plasma so the sections below read
 * on a near-solid ground. Load intro = masked rises.
 */
export default function AtHero() {
  const words = HERO.nameEn.split(' ');
  return (
    <section className="at-scene" id="hero" aria-label={HERO.nameJaParts.join('')}>
      <div className="at-hero">
        <div className="at-hero__inner" data-hero-stage>
          <p className="at-hero__kicker">
            <span className="at-mask">
              <span className="at-mask__in" data-hero-in>
                <span className="at-hero__kicker-rule" aria-hidden />
                {HERO.nameJaParts.join('')}
              </span>
            </span>
          </p>

          <div className="at-hero__block">
            <h1 className="at-hero__title" data-at-title>
              {words.map((w) => (
                <span key={w} className="at-hero__tline">
                  <span className="at-mask at-hero__tmask">
                    <span className="at-mask__in" data-hero-in>
                      {w}
                    </span>
                  </span>
                </span>
              ))}
            </h1>

            <p className="at-hero__jp">
              <span className="at-mask">
                <span className="at-mask__in" data-hero-in>
                  {HERO.headline.line1}
                  <span className="at-hero__jp-br">「</span>
                  <em className="at-hero__jp-em">{HERO.headline.bracketed}</em>
                  <span className="at-hero__jp-br">」</span>
                  {HERO.headline.tail}
                </span>
              </span>
            </p>
          </div>

          <div className="at-hero__cta">
            <span className="at-mask">
              <span className="at-mask__in" data-hero-in>
                <Link href={HERO.cta.href} className="cta-btn cta-btn--at">
                  <span>{HERO.cta.label}</span>
                </Link>
              </span>
            </span>
          </div>

          <div className="at-hero__cue" data-hero-cue aria-hidden>
            <span className="at-mono">Scroll</span>
            <span className="at-hero__cue-line">
              <span />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
