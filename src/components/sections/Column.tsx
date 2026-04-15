import Link from 'next/link';

// TODO: wire to real CMS/MDX posts later
const posts = [
  {
    id: 1,
    date: '2026.04.10',
    category: 'LINE',
    title: 'Lステップで売上を伸ばす5つの運用パターン',
    image: '/img/7.jpg',
    href: '#',
  },
  {
    id: 2,
    date: '2026.04.02',
    category: 'RPA',
    title: '中小企業のためのRPA導入ステップ',
    image: '/img/8.jpg',
    href: '#',
  },
  {
    id: 3,
    date: '2026.03.25',
    category: 'CS',
    title: 'コールセンター品質を上げる研修設計',
    image: '/img/5.jpg',
    href: '#',
  },
  {
    id: 4,
    date: '2026.03.18',
    category: '不動産',
    title: '地域密着で選ばれる不動産会社の条件',
    image: '/img/3.jpg',
    href: '#',
  },
  {
    id: 5,
    date: '2026.03.10',
    category: 'NEWS',
    title: 'GIFTが新オフィスへ移転しました',
    image: '/img/6.jpg',
    href: '#',
  },
  {
    id: 6,
    date: '2026.03.01',
    category: 'CULTURE',
    title: 'GIFTで働くということ',
    image: '/img/1.jpg',
    href: '#',
  },
];

export default function Column() {
  return (
    <section className="w-full border-t border-white/5 bg-gift-near-black py-s-80">
      <div className="mx-auto mb-12 flex max-w-container items-end justify-between px-4 md:px-6 lg:px-8">
        <div>
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            COLUMN / NEWS
          </p>
          <h2
            className="font-sans font-extrabold text-white"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            コラム・お知らせ
          </h2>
        </div>
        <Link
          href="#"
          className="hidden items-center gap-2 font-sans text-small text-gift-green transition-colors hover:text-gift-green-mid sm:inline-flex"
        >
          一覧を見る <span>→</span>
        </Link>
      </div>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={p.href} className="group block">
              <div className="relative mb-4 overflow-hidden rounded-2xl" style={{ aspectRatio: '16/10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-100"
                />
              </div>
              <div className="mb-2 flex items-center gap-3">
                <span className="font-sans text-small text-gift-silver">{p.date}</span>
                <span className="font-display text-small uppercase tracking-widest text-gift-green">
                  {p.category}
                </span>
              </div>
              <h3 className="font-sans text-normal font-semibold leading-snug text-white transition-colors group-hover:text-gift-green-mid">
                {p.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
