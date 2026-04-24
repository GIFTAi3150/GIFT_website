import type { Metadata, Viewport } from 'next';
import { notoSansJP, poppins } from './fonts';
import '../styles/globals.css';

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
      className={`${notoSansJP.variable} ${poppins.variable}`}
      style={{ backgroundColor: '#F0F4F9', colorScheme: 'light' }}
    >
      <head>
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
      <body style={{ backgroundColor: '#F0F4F9' }}>
        {/* SSR-rendered dark cover. Present in the very first HTML byte the
            browser receives, so it can paint before any React/JS runs.
            Inline script fades it out once the page is ready. */}
        <div
          id="page-cover"
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: '#F0F4F9',
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
                var hidden = false;
                var hide = function () {
                  if (hidden) return;
                  hidden = true;
                  cover.style.opacity = '0';
                  setTimeout(function () { cover.remove(); }, 600);
                };
                var windowLoaded = document.readyState === 'complete';
                var logoReady = false;
                var tryHide = function () {
                  if (windowLoaded && logoReady) hide();
                };
                window.addEventListener('gift:logo-ready', function () {
                  logoReady = true;
                  tryHide();
                });
                if (windowLoaded) {
                  // already loaded
                } else {
                  window.addEventListener('load', function () {
                    windowLoaded = true;
                    tryHide();
                  });
                }
                // Safety fallback: if the logo never signals (error, no 3D on page),
                // force-hide after 4s so the site is never stuck behind the cover.
                setTimeout(hide, 4000);
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
