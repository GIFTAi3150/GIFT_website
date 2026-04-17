import Link from 'next/link';

interface ColumnArticle {
  slug: string;
  date: string;
  category: string;
  title: string;
  cover?: string;
}

export default function Column({ articles }: { articles?: ColumnArticle[] }) {
  const posts = (articles || []).slice(0, 6);

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
        {posts.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <p className="mb-2 font-sans text-medium font-bold text-gift-ink">
              記事は近日公開予定
            </p>
            <p className="font-sans text-normal text-gift-silver">
              DX・AI・財務に関するノウハウや最新情報をお届けします。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/news/${p.slug}`} className="news-card group block">
                {p.cover && (
                  <div className="relative overflow-hidden rounded-t-[16px]" style={{ aspectRatio: '16/10' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.cover}
                      alt={p.title}
                      className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:brightness-100"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="font-sans text-small text-gift-silver">{p.date}</span>
                    {p.category && (
                      <span className="rounded-full bg-gift-green/10 px-3 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-gift-green">
                        {p.category}
                      </span>
                    )}
                  </div>
                  <h3 className="font-sans text-normal font-semibold leading-snug text-gift-ink">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
