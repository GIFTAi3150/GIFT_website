import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PixelRobot from '@/components/ui/PixelRobot';

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-20 text-center md:px-6"
        style={{ backgroundColor: '#F8FAF8' }}
      >
        {/* Drifting blobs for atmosphere — same as hero */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="hero-blob hero-blob-1" />
          <div className="hero-blob hero-blob-2" />
          <div className="hero-blob hero-blob-3" />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Robot mascot, big and centered */}
          <PixelRobot className="h-36 w-36 text-gift-green-teal sm:h-44 sm:w-44 md:h-52 md:w-52" />

          {/* Huge 404 display */}
          <p
            className="font-display font-extrabold leading-none text-gift-green"
            style={{ fontSize: 'clamp(72px, 14vw, 160px)' }}
          >
            404
          </p>

          {/* Japanese message */}
          <h1
            className="max-w-xl font-sans font-extrabold text-gift-ink"
            style={{ fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: '1.4' }}
          >
            このページは見つかりませんでした
          </h1>

          {/* English subtitle */}
          <p className="max-w-md font-sans text-normal font-light text-gift-silver">
            お探しのページは削除されたか、URLが間違っている可能性があります。
            <br />
            The page you are looking for could not be found.
          </p>

          {/* CTA */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="cta-btn">
              <span>ホームに戻る</span>
            </Link>
            <Link href="/contact" className="cta-btn cta-btn--deep">
              <span>お問い合わせ</span>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
