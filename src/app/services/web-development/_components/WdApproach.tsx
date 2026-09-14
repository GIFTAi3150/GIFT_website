import Image from 'next/image';
import type { CSSProperties } from 'react';
import { ArrowDown, ArrowRight, Check, ImageIcon, Menu, Sparkles } from 'lucide-react';
import artwork from './assets/approach-artwork.webp';
import { APPROACH } from './wdContent';
import WdHead from './WdHead';
import styles from './WdApproach.module.css';

function WebsitePreview({ finished = false }: { finished?: boolean }) {
  return (
    <div
      className={`${styles.browser} ${finished ? styles.finished : styles.draft}`}
      aria-hidden="true"
    >
      <div className={styles.chrome}>
        <span className={styles.dots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.address}>your-website.jp</span>
        <span className={styles.chromeMark}>↗</span>
      </div>
      <div className={styles.site}>
        <div className={styles.siteNav}>
          <span className={styles.brand}>{finished ? '余白 / YOHAKU' : <i />}</span>
          <span className={styles.navItems}>
            {finished ? (
              'ABOUT　 WORKS'
            ) : (
              <>
                <i />
                <i />
              </>
            )}
          </span>
          <Menu size={12} />
        </div>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            {finished ? (
              <>
                <span className={styles.eyebrow}>SPACES FOR LIFE</span>
                <strong className={styles.headline}>
                  日常に、
                  <br />
                  新しい余白を。
                </strong>
                <span className={styles.siteLead}>想いをかたちにする、空間づくり。</span>
                <span className={styles.sampleLink}>
                  私たちについて <ArrowRight size={12} />
                </span>
              </>
            ) : (
              <>
                <i className={styles.shortLine} />
                <i className={styles.titleLine} />
                <i className={styles.titleLine} />
                <i className={styles.textLine} />
                <i className={styles.buttonLine} />
              </>
            )}
          </div>
          <div className={styles.heroImage}>
            {finished ? (
              <Image src={artwork} alt="" fill sizes="(max-width: 899px) 50vw, 22vw" />
            ) : (
              <ImageIcon strokeWidth={1} />
            )}
          </div>
        </div>
        <div className={styles.siteFoot}>
          {finished ? (
            <>
              <span>空間から、可能性を。</span>
              <ArrowRight size={12} />
            </>
          ) : (
            <>
              <i />
              <i />
              <i />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** A wireframe and its finished website keep the AI-to-human handoff visible. */
export default function WdApproach() {
  return (
    <section
      id="approach"
      className="wd-sec wd-sec--navy wd-approach"
      data-stage
      style={{ '--budget': 3.2 } as CSSProperties}
      aria-labelledby="wd-approach-title"
    >
      <div className="wd-frame">
        <div className="wd-container wd-approach__inner">
          <div className="wd-approach__copy">
            <div id="wd-approach-title">
              <WdHead label={APPROACH.eyebrow} title={APPROACH.title} />
            </div>
            {APPROACH.body.map((paragraph) => (
              <p className="wd-approach__p" key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="wd-approach__window">
            <figure className={styles.visual} data-craft>
              <div className={styles.progression}>
                <div className={styles.step} data-craft-step="draft">
                  <div className={styles.stepLabel}>
                    <span>
                      <Sparkles size={13} />
                      AI DRAFT
                    </span>
                    <span>構成をつくる</span>
                  </div>
                  <WebsitePreview />
                </div>
                <div className={styles.connector} aria-hidden="true">
                  <ArrowRight className={styles.horizontalArrow} size={18} />
                  <ArrowDown className={styles.verticalArrow} size={18} />
                </div>
                <div className={`${styles.step} ${styles.finishedStep}`} data-craft-step="finished">
                  <div className={styles.stepLabel}>
                    <span>
                      <Check size={13} />
                      HUMAN CRAFT
                    </span>
                    <span>プロが整える</span>
                  </div>
                  <WebsitePreview finished />
                </div>
              </div>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
