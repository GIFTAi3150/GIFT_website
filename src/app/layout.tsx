import type { Metadata, Viewport } from 'next';
import { notoSansJP, poppins } from './fonts';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: '株式会社GIFT | Gift an opportunity',
  description: 'テレマーケティング・LINE運用・RPA・不動産事業を展開する株式会社GIFTの公式サイト。',
};

export const viewport: Viewport = {
  themeColor: '#121212',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${poppins.variable}`}
      style={{ backgroundColor: '#121212' }}
    >
      <body style={{ backgroundColor: '#121212' }}>
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
            backgroundColor: '#121212',
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
                var hide = function () {
                  cover.style.opacity = '0';
                  setTimeout(function () { cover.remove(); }, 600);
                };
                // Fade out once window has loaded (all resources ready).
                if (document.readyState === 'complete') {
                  setTimeout(hide, 400);
                } else {
                  window.addEventListener('load', function () { setTimeout(hide, 400); });
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
