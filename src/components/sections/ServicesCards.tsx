import Link from 'next/link';
import services from '@/data/services.json';

export default function ServicesCards() {
  return (
    <section className="w-full bg-gift-near-black py-s-80">
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
          SERVICE
        </p>
        <h2
          className="font-sans font-extrabold text-white"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          事業内容
        </h2>
        <p className="mt-2 font-sans text-normal font-light text-gift-silver">
          GIFTが提供する4つの事業。
        </p>
      </div>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {services.map((s, idx) => {
            const CardInner = (
              <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gift-mid-dark transition-all duration-500 hover:-translate-y-1 hover:border-gift-green/40 hover:shadow-[0_20px_50px_-15px_rgba(0,86,51,0.55)]">
                {/* Image with gradient scrim */}
                <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover brightness-75 transition-all duration-700 group-hover:scale-[1.06] group-hover:brightness-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gift-mid-dark via-gift-mid-dark/40 to-transparent" />

                  {/* Index number, top-left */}
                  <span className="absolute left-5 top-4 font-display text-small font-bold tracking-widest text-gift-green">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Arrow badge, top-right */}
                  {s.href && (
                    <span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white backdrop-blur-sm transition-all duration-300 group-hover:border-gift-green group-hover:bg-gift-green group-hover:rotate-[-45deg]">
                      →
                    </span>
                  )}

                  {/* English title overlaid on image */}
                  <h3 className="absolute bottom-4 left-5 right-5 font-display text-medium font-bold leading-tight text-white">
                    {s.titleEn}
                  </h3>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-sans text-small font-medium text-gift-green-mid">{s.title}</p>
                  <p className="mt-3 flex-1 font-sans text-small font-light leading-relaxed text-gift-silver">
                    {s.body.length > 90 ? s.body.slice(0, 90) + '…' : s.body}
                  </p>
                  {s.href && (
                    <span className="mt-5 inline-flex items-center gap-2 font-sans text-small font-medium text-gift-green transition-colors group-hover:text-white">
                      詳しく見る
                      <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );

            return s.href ? (
              <Link key={s.id} href={s.href} className="block h-full">
                {CardInner}
              </Link>
            ) : (
              <div key={s.id} className="h-full">
                {CardInner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
