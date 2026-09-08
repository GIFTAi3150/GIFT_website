import Link from 'next/link';
import { HERO, STATEMENT } from './aoContent';

/**
 * The scene — "the surface". One pinned frame (AoScroll, HERO_VH budget) over
 * the liquid plate: the title AI / Ops. sits on the paint at full turbulence;
 * as the reader scrolls it recedes into it while the plate itself calms
 * (AoField targets), and the four stanzas of the statement come up out of the
 * depth one after another (scale + blur dolly). Load intro = masked rises on
 * `gift:logo-ready`.
 */
export default function AoHero() {
  return (
    <section className="ao-scene" id="hero" aria-label="AIOps">
      <div className="ao-scene__frame" data-scene-frame>
        <div className="ao-hero" data-hero>
          <p className="ao-hero__kicker">
            <span className="ao-mask">
              <span className="ao-mask__in" data-hero-in>
                <span className="ao-hero__kicker-rule" aria-hidden />
                {HERO.kicker}
              </span>
            </span>
          </p>

          <div className="ao-hero__block">
            <h1 className="ao-hero__title">
              {HERO.titleLines.map((w) => (
                <span key={w} className="ao-hero__tline">
                  <span className="ao-mask ao-hero__tmask">
                    <span className="ao-mask__in" data-hero-in>
                      {w}
                    </span>
                  </span>
                </span>
              ))}
            </h1>
            <p className="ao-hero__jp">
              <span className="ao-mask">
                <span className="ao-mask__in" data-hero-in>
                  {HERO.jp}
                </span>
              </span>
            </p>
          </div>

          <div className="ao-hero__cta">
            <span className="ao-mask">
              <span className="ao-mask__in" data-hero-in>
                <Link href={HERO.cta.href} className="cta-btn cta-btn--ao">
                  <span>{HERO.cta.label}</span>
                </Link>
              </span>
            </span>
          </div>

          <div className="ao-hero__cue" data-hero-cue aria-hidden>
            <span className="ao-mono">{HERO.cue}</span>
            <span className="ao-hero__cue-line">
              <span />
            </span>
          </div>
        </div>

        {/* a soft ink pool under the statement so the paint's bright veins never
            fight the reading — raised by AoScroll as the title recedes */}
        <div className="ao-scene__scrim" data-scene-scrim aria-hidden />

        {/* the statement — four stanzas, each dollied up out of the paint */}
        <div className="ao-statement" data-statement aria-label="statement">
          {STATEMENT.map((stanza, i) => (
            <div key={i} className="ao-stanza" data-stanza={i}>
              {stanza.lines.map((line, j) => (
                <span key={j} className="ao-stanza__line">
                  {line.text}
                  {line.accent ? <em className="ao-stanza__accent">{line.accent}</em> : null}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
