import { Fragment } from 'react';
import Image from 'next/image';
import { LOGO_WALL, type LogoTile } from './worksContent';
import styles from './WkLogoWall.module.css';
import sections from './WkSections.module.css';
import WkSectionHead from './WkSectionHead';

const logos = LOGO_WALL.tiles.filter((tile): tile is LogoTile & { logoSrc: string } =>
  Boolean(tile.logoSrc),
);

const phrases = (parts: string[]) =>
  parts.map((part, i) => (
    <Fragment key={part}>
      {i > 0 && <wbr />}
      {part}
    </Fragment>
  ));

export default function WkLogoWall() {
  return (
    <section
      aria-labelledby="works-clients-title"
      aria-roledescription="カルーセル"
      className={sections.clients}
    >
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className={sections.sectionIntro}>
          <WkSectionHead word="CLIENTS" chip="取引企業" id="works-clients-title" />
        </div>
      </div>

      <div className={styles.carousel}>
        <p className={styles.trust}>
          <span className={styles.trustLead}>{phrases(LOGO_WALL.trust.lead)}</span>
        </p>
        <div className={styles.viewport} aria-live="off">
          <div id="works-logo-track" className={styles.track}>
            {/* Equal-width groups include their trailing gap, so the loop has no jump. */}
            {[0, 1].map((copy) => (
              <ul key={copy} className={styles.group} aria-hidden={copy === 1 ? true : undefined}>
                {logos.map((tile) => (
                  <li key={tile.companyName} className={styles.tile}>
                    <Image
                      src={tile.logoSrc}
                      alt={copy === 0 ? tile.companyName : ''}
                      width={180}
                      height={80}
                      sizes="(max-width: 767px) 144px, 180px"
                      className={styles.logo}
                    />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>

      {LOGO_WALL.note ? (
        <p className="mx-auto mt-6 max-w-container px-4 font-sans text-[12px] font-light text-[#5B6B8A] md:px-6 lg:px-8">
          {LOGO_WALL.note}
        </p>
      ) : null}
    </section>
  );
}
