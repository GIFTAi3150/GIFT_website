import { HERO } from './worksContent';
import WkHeroVisual from './WkHeroVisual';
import styles from './WkHero.module.css';

export default function WkHero() {
  return (
    <section className={styles.hero} aria-labelledby="works-hero-title" data-works-hero>
      <WkHeroVisual />
      <div className={styles.caption}>
        <h1 id="works-hero-title" className={styles.title}>
          {HERO.headline}
        </h1>
      </div>
    </section>
  );
}
