import type { Metadata, Viewport } from 'next';
import { anton, forum, notoSansJP, openSans, poppins, shipporiAntique } from './fonts';
import '../styles/globals.css';
import CtaHoverHydrator from '@/components/util/CtaHoverHydrator';
import ScrollToTopOnRouteChange from '@/components/util/ScrollToTopOnRouteChange';
import RootCanvasMount from '@/components/three/RootCanvasMount';
import Header from '@/components/layout/Header';
import ErrorReporter from '@/components/util/ErrorReporter';
import ViewportFreeze from '@/components/util/ViewportFreeze';

export const metadata: Metadata = {
  // Canonical host is www — gift-inc.org 301s here (2026-07-13 domain switch).
  // metadataBase drives every absolute URL Next generates (canonical, OG, Twitter),
  // so pointing it at the bare host makes us advertise URLs that all redirect.
  metadataBase: new URL('https://www.gift-inc.org'),
  title: {
    default: '株式会社GIFT | Gift an opportunity',
    template: '%s | 株式会社GIFT',
  },
  description:
    'AIを、会社に根づかせる。学習から実装、定着まで、人とAIが一緒に成果を出す環境をつくる株式会社GIFTの公式サイト。',
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.gift-inc.org',
    siteName: '株式会社GIFT',
    title: '株式会社GIFT | Gift an opportunity',
    description:
      'AIを、会社に根づかせる。学習から実装、定着まで、人とAIが一緒に成果を出す環境をつくる株式会社GIFTの公式サイト。',
  },
  twitter: {
    card: 'summary_large_image',
    title: '株式会社GIFT | Gift an opportunity',
    description:
      'AIを、会社に根づかせる。学習から実装、定着まで、人とAIが一緒に成果を出す環境をつくる株式会社GIFTの公式サイト。',
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
      // Opt the site out of browser translation (Chrome/Safari honour both the
      // attribute and the class; Chrome-on-iOS needs the class).
      //
      // Why: our pages hide content at opacity:0 and reveal it with GSAP, which
      // holds references to the DOM nodes it animates. Browser translation
      // rewrites those nodes continuously as you scroll, so GSAP ends up
      // animating detached ghosts while the elements actually on screen stay at
      // opacity:0 — a page that loads fine with permanently empty sections
      // (reported on /services/aiops via Chrome-on-iOS, 2026-07-13; confirmed by
      // the reporter: translation off → renders, translation on → blank). It
      // also produces the React #418/#422 hydration mismatches, and it is the
      // same mechanism behind the earlier /contact removeChild crash that the
      // Node.prototype guard below was added to survive.
      //
      // Trade-off accepted: non-Japanese visitors lose one-tap auto-translate.
      // The durable answer is a real localised site, not a rewritten DOM.
      translate="no"
      className={`notranslate ${notoSansJP.variable} ${poppins.variable} ${anton.variable} ${openSans.variable} ${forum.variable} ${shipporiAntique.variable}`}
      // Browsers serialize inline-style hex colors as rgb(), which
      // React reads back as a different string than its JSX source —
      // produces a noisy but harmless hydration warning. Suppress it.
      suppressHydrationWarning
      style={{ backgroundColor: '#F0F7FF', colorScheme: 'light' }}
    >
      <head>
        {/* iOS Safari auto-detects phone numbers, addresses and dates in text and
            rewrites them into <a> tags ITSELF, before React hydrates. The DOM then
            no longer matches the server HTML and React throws #418 (hydration
            mismatch) and re-renders the whole root on the client. The footer
            carries a TEL and an address on every page, which is why the error
            fired site-wide, only ever on iOS Safari, never on desktop.
            Opting out is the fix; the phone stays tappable because Footer now
            renders a real tel: link itself (React knows about that one). */}
        <meta
          name="format-detection"
          content="telephone=no, date=no, address=no, email=no"
        />
        {/* Belt-and-braces with translate="no" + .notranslate on <html>: Chrome
            also honours this meta, and it's the signal Chrome-on-iOS respects
            most reliably. See the comment on <html> for why we opt out. */}
        <meta name="google" content="notranslate" />
        {/* Survive Google-Translate / extension DOM edits. When the browser's
            translator swaps text nodes, React's later removeChild/insertBefore
            throws NotFoundError and takes down the whole page (seen on /contact:
            "removeChild" crash + form couldn't submit). Patch both to no-op
            instead of throw when the node was moved out from under React. Runs
            before hydration so it's in place for the first commit. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(typeof Node!=='function'||!Node.prototype)return;var r=Node.prototype.removeChild;Node.prototype.removeChild=function(c){if(c&&c.parentNode!==this){return c;}return r.apply(this,arguments);};var i=Node.prototype.insertBefore;Node.prototype.insertBefore=function(n,ref){if(ref&&ref.parentNode!==this){return n;}return i.apply(this,arguments);};})();`,
          }}
        />
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
                // Dark load background on the navy-hero routes. /services/aiops,
                // /company and /services/ai-training all paint a dark WebGL field
                // as their hero, so the light default would flash before it lands.
                // They share one navy (#0b1020) so the cover-to-hero handoff is
                // seamless on all three. Recolour BEFORE the cover is shown/faded;
                // every other route keeps the light default. Runs in the same
                // parser-blocking pass as the cover div, so it applies before
                // first paint.
                var darkRoutes = ['/services/aiops', '/company', '/services/ai-training'];
                for (var i = 0; i < darkRoutes.length; i++) {
                  if (location.pathname.indexOf(darkRoutes[i]) === 0) {
                    cover.style.background = '#0b1020';
                    break;
                  }
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
                  // Hide it, never remove it. #page-cover is rendered by React
                  // (see the JSX above) as a direct child of <body>, outside every
                  // Suspense boundary. Deleting it from outside React makes the DOM
                  // diverge from the server HTML, and if this wins the race against
                  // hydration — which it does on a slow connection, where the 3s cap
                  // below fires before the JS has even executed — React throws #418
                  // and then #423: "the entire root will switch to client rendering".
                  // Style mutations are safe (the div carries suppressHydrationWarning);
                  // structural ones are not. Verified 2026-07-14: .remove() reproduces
                  // #418 + #423 on /company, visibility:hidden is clean.
                  setTimeout(function () { cover.style.visibility = 'hidden'; }, 600);
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
        <ViewportFreeze />
        <ErrorReporter />
      </body>
    </html>
  );
}
