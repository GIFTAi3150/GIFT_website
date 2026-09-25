import Link from 'next/link';
import { INTRO } from './worksContent';
import WkIntroRegister from './WkIntroRegister';
import styles from './WkIntro.module.css';

// Three stacked copies of the word, each clipped to one horizontal strip.
// WkIntroRegister scrubs --mis per row so the strips slide into register.
const STRIPS = [0, 1, 2] as const;

export default function WkIntro() {
  return (
    <section className={styles.intro} aria-labelledby="works-intro-title" data-wk-intro>
      <div className={'mx-auto max-w-container ' + styles.container}>
        <div className={styles.rule}>
          <p className={styles.eyebrow}>{INTRO.eyebrow}</p>
          <span className={styles.ruleLine} aria-hidden="true" />
          <p className={styles.caption} aria-hidden="true">
            {INTRO.visualCaption}
          </p>
        </div>

        <h2 id="works-intro-title" className={styles.title}>
          <span className={styles.titleLead}>{INTRO.titleParts[0]}</span>
          <span className={styles.titleMain}>{INTRO.titleParts[1]}</span>
        </h2>

        <ul className={styles.areas} role="list">
          {INTRO.areas.map((area) => (
            <li key={area.href} className={styles.row} data-wk-row>
              <Link
                href={area.href}
                prefetch={false}
                className={styles.area}
                aria-label={area.title}
              >
                <span className={styles.wipe} aria-hidden="true" />
                <span className={styles.word} aria-hidden="true">
                  <span className={styles.wordSizer}>{area.category}</span>
                  {STRIPS.map((strip) => (
                    <span key={strip} className={styles.strip} data-strip={strip}>
                      {area.category}
                    </span>
                  ))}
                </span>
                <span className={styles.meta}>
                  <span className={styles.areaTitle}>{area.title}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <WkIntroRegister />
    </section>
  );
}
