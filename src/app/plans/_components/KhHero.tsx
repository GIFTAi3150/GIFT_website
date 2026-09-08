import { HERO, FEATURES } from './khContent';

/**
 * Hero — the harnessing. A pinned stage over the field (KhField, behind the
 * DOM): KNOWLEDGE HARNESS set as the biggest thing on the page while the
 * loose filaments of light behind it are pulled straight into ruled lines
 * by the scroll. Once the structure is complete the name yields to the coda —
 * 「導入後の変化：AIが全社の記憶を持って動く。」— the page's thesis, which
 * used to sit as a caption above the feature grid. Load intro = masked rises.
 */
export default function KhHero() {
  const words = HERO.nameEn.split(' ');
  return (
    <section id="hero" className="kh-hero" aria-label={HERO.nameJa}>
      <div className="kh-hero__stick">
        <div className="kh-hero__inner">
          <p className="kh-hero__kicker">
            <span className="kh-mask">
              <span className="kh-mask__in" data-hero-in>
                <span className="kh-hero__kicker-rule" aria-hidden />
                {HERO.nameJa}
              </span>
            </span>
          </p>

          <div className="kh-hero__block" data-hero-block>
            <h1 className="kh-hero__title">
              {words.map((w) => (
                <span key={w} className="kh-hero__tline">
                  <span className="kh-mask kh-hero__tmask">
                    <span className="kh-mask__in" data-hero-in>
                      {w}
                    </span>
                  </span>
                </span>
              ))}
            </h1>

            <p className="kh-hero__jp">
              <span className="kh-mask">
                <span className="kh-mask__in" data-hero-in>
                  <span className="kh-hero__jp-part">{HERO.headline.line1}</span>
                  <span className="kh-hero__jp-part">
                    <span className="kh-hero__jp-br">「</span>
                    <em className="kh-hero__jp-em">{HERO.headline.bracketed}</em>
                    <span className="kh-hero__jp-br">」</span>
                    {HERO.headline.tail}
                  </span>
                </span>
              </span>
            </p>

            <p className="kh-hero__body">
              <span className="kh-mask">
                <span className="kh-mask__in" data-hero-in>
                  {HERO.body}
                </span>
              </span>
            </p>
          </div>

          <div className="kh-hero__coda" data-hero-coda>
            <p className="kh-hero__coda-label kh-mono">{FEATURES.leadLabel}</p>
            <p className="kh-hero__coda-line">{FEATURES.leadStatement}</p>
          </div>

          <div className="kh-hero__cue" data-hero-cue aria-hidden>
            <span className="kh-mono">Scroll</span>
            <span className="kh-hero__cue-line">
              <span />
            </span>
          </div>
        </div>
      </div>
      <div className="kh-hero__spacer" aria-hidden />
    </section>
  );
}
