import Link from 'next/link';
import news from '@/data/news.json';

const posts = news.slice(0, 6).map((n) => ({
  id: n.slug,
  date: n.date,
  category: n.category,
  title: n.title,
  image: n.image,
  href: `/news/${n.slug}`,
}));

export default function Column() {
  return (
    <section className="w-full border-t border-gift-border bg-gift-bg-alt py-s-80">
      <div className="mx-auto mb-12 flex max-w-container items-end justify-between px-4 md:px-6 lg:px-8">
        <div>
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            COLUMN / NEWS
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            コラム・お知らせ
          </h2>
        </div>
      </div>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.id} href={p.href} className="news-card group block">
              <div className="relative overflow-hidden rounded-t-[16px]" style={{ aspectRatio: '16/10' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:brightness-100"
                />
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-center gap-3">
                  <span className="font-sans text-small text-gift-silver">{p.date}</span>
                  <span className="font-display text-small uppercase tracking-widest text-gift-green">
                    {p.category}
                  </span>
                </div>
                <h3 className="font-sans text-normal font-semibold leading-snug text-gift-ink">
                  {p.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
