import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INTRO } from './worksContent';
import styles from './WkIntro.module.css';

export default function WkIntro() {
  return (
    <section className={styles.intro} aria-labelledby="works-intro-title">
      <div className={'mx-auto max-w-container ' + styles.container}>
        <p className={styles.eyebrow}>{INTRO.eyebrow}</p>
        <div className={styles.layout}>
          <div className={styles.story}>
            <h2 id="works-intro-title" className={styles.title}>
              <span className={styles.titleLead}>{INTRO.titleParts[0]}</span>
              <span className={styles.titleMain}>{INTRO.titleParts[1]}</span>
            </h2>
          </div>
        </div>

        <ul className={styles.areas} role="list">
          {INTRO.areas.map((area) => (
            <li key={area.href}>
              <Link
                href={area.href}
                prefetch={false}
                className={styles.area}
                aria-label={area.title}
              >
                <span className={styles.areaCopy}>
                  <span className={styles.category}>{area.category}</span>
                  <span className={styles.areaTitle}>{area.title}</span>
                </span>
                <span className={styles.areaArrow} aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={1.6} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
