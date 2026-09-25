import WkHeroLogo from './WkHeroLogo';
import { WORKS_HERO_LETTERING } from './worksHeroLettering';
import styles from './WkHero.module.css';

function HeroWord({ word }: { word: keyof typeof WORKS_HERO_LETTERING }) {
  const lettering = WORKS_HERO_LETTERING[word];
  return (
    <span data-works-word={word} style={{ width: `${lettering.widthEm}em` }}>
      <span className={styles.wordEntrance}>
        <svg
          className={styles.wordArt}
          viewBox={lettering.viewBox}
          fill="currentColor"
          focusable="false"
        >
          <path d={lettering.path} />
        </svg>
      </span>
    </span>
  );
}

// The same server-rendered outlines remain visible through font and WebGL loading.
export default function WkHeroVisual() {
  return (
    <div className={styles.intro} data-works-intro aria-hidden="true">
      <div className={styles.wordmark} data-works-wordmark>
        <HeroWord word="WORKS" />
        <WkHeroLogo />
        <HeroWord word="PARTNERS" />
      </div>
    </div>
  );
}
