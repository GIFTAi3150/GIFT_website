import type { Metadata, Viewport } from 'next';
import { anton, forum, notoSansJP, openSans, poppins, shipporiAntique } from './fonts';
import '../styles/globals.css';
import CtaHoverHydrator from '@/components/util/CtaHoverHydrator';
import ScrollToTopOnRouteChange from '@/components/util/ScrollToTopOnRouteChange';
import RootCanvasMount from '@/components/three/RootCanvasMount';
import Header from '@/components/layout/Header';

export const metadata: Metadata = {
  metadataBase: new URL('https://gift-inc.org'),
  title: {
    default: '株式会社GIFT | Gift an opportunity',
    template: '%s | 株式会社GIFT',
  },
  description:
    'コールセンター・DXコンサル・財務コンサル事業を展開する株式会社GIFTの公式サイト。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://gift-inc.org',
    siteName: '株式会社GIFT',
    title: '株式会社GIFT | Gift an opportunity',
    description:
      'コールセンター・DXコンサル・財務コンサル事業を展開する株式会社GIFTの公式サイト。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '株式会社GIFT | Gift an opportunity',
    description:
      'コールセンター・DXコンサル・財務コンサル事業を展開する株式会社GIFTの公式サイト。',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
    shortcut: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#F0F4F9',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${poppins.variable} ${anton.variable} ${openSans.variable} ${forum.variable} ${shipporiAntique.variable}`}
      // Browsers serialize inline-style hex colors as rgb(), which
      // React reads back as a different string than its JSX source —
      // produces a noisy but harmless hydration warning. Suppress it.
      suppressHydrationWarning
      style={{ backgroundColor: '#F0F7FF', colorScheme: 'light' }}
    >
      <head>
        {/* Suppress known third-party and framework noise.
            - THREE.Clock: deprecated in r165+, R3F 8.x still uses it — unfixable without upstream upgrade.
            - Skipping auto-scroll: Next.js dev-only check hitting our fixed-position overlays — harmless. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var w=console.warn.bind(console);console.warn=function(){var m=arguments[0];if(typeof m==='string'&&(m.indexOf('THREE.Clock')!==-1||m.indexOf('Skipping auto-scroll')!==-1))return;w.apply(console,arguments);};})();`,
          }}
        />
        {/* Google Search Console verification */}
        <meta name="google-site-verification" content="QywozbyWj6GtH9Gv1iDF7AS8P3pSbGrYOThrj2OrU4c" />
        {/* Google Analytics 4 */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-RBBNELXPJ8" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RBBNELXPJ8');
            `,
          }}
        />
        {/* Microsoft Clarity */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "wcy0ylgpif");
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning style={{ backgroundColor: '#F0F7FF' }}>
        {/* SSR-rendered dark cover. Present in the very first HTML byte the
            browser receives, so it can paint before any React/JS runs.
            Inline script fades it out once the page is ready. */}
        <div
          id="page-cover"
          aria-hidden
          // The inline script below mutates this div's style attribute
          // (opacity: 0) before React hydrates, which makes the
          // post-script DOM diverge from React's JSX. suppressHydrationWarning
          // tells React this mismatch is intentional and shouldn't error.
          suppressHydrationWarning
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#F0F7FF',
            pointerEvents: 'none',
            transition: 'opacity 500ms ease-out',
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var cover = document.getElementById('page-cover');
                if (!cover) return;
                // Dark load background on /services/aiops — its hero is a dark
                // liquid field, so the default light cover would flash before
                // it paints. Recolour BEFORE the cover is shown/faded; every
                // other route keeps the light default. Runs in the same
                // parser-blocking pass as the cover div, so it applies before
                // first paint.
                if (location.pathname.indexOf('/services/aiops') === 0) {
                  cover.style.background = 'linear-gradient(160deg, #0b0b0e 0%, #17181c 100%)';
                }
                var hidden = false;
                var hide = function () {
                  if (hidden) return;
                  hidden = true;
                  cover.style.opacity = '0';
                  // page-ready triggers CSS animation-play-state: running on
                  // .nav-reveal and .fade-up-word elements. Adding the class when
                  // the cover STARTS fading (not after it's gone) lets nav items
                  // fade in simultaneously with the cover fade-out, so users see
                  // the reveal animation instead of text appearing pre-formed.
                  document.body.classList.add('page-ready');
                  setTimeout(function () { cover.remove(); }, 600);
                };
                // Drop cover as soon as the hero signals it's painted.
                // windowLoaded is NOT required — logo-ready fires before all
                // images/fonts finish (hero is WebGL, not an image) and gating
                // on it caused animations to complete under the cover, resulting
                // in text that appeared to "jump" into its final state.
                window.addEventListener('gift:logo-ready', function () {
                  hide();
                });
                // For pages without a canvas hero (company, contact, …) no one
                // dispatches gift:logo-ready. Drop the cover when the window
                // finishes loading instead (typically 300-800ms).
                window.addEventListener('load', function () {
                  setTimeout(hide, 100);
                }, { once: true });
                // If already loaded (client-side nav to a non-hero page), fire now.
                if (document.readyState === 'complete') {
                  setTimeout(hide, 100);
                }
                // Hard safety cap — never leave the cover up beyond 3s.
                setTimeout(hide, 3000);
              })();
            `,
          }}
        />
        <Header />
        {children}
        <CtaHoverHydrator />
        <ScrollToTopOnRouteChange />
        <RootCanvasMount />
      </body>
    </html>
  );
}
