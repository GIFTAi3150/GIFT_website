import Link from 'next/link';
import services from '@/data/services.json';
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

export default function ServicesCards() {
  return (
    <section className="w-full bg-gift-near-black py-s-80">
      <div className="mx-auto mb-12 max-w-container px-4 md:px-6 lg:px-8">
        <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
          SERVICE
        </p>
        <h2
          className="font-sans font-extrabold text-gift-ink"
          style={{ fontSize: '36px', lineHeight: '1.25' }}
        >
          事業内容
        </h2>
        <p className="mt-2 font-sans text-normal font-light text-gift-silver">
          GIFTが提供する3つの事業。
        </p>
      </div>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {services.map((s, idx) => {
            const Icon = SERVICE_ICON_BY_ID[s.id];
            const CardInner = (
              <div className="gift-card group relative flex h-full flex-col overflow-hidden !p-0">
                <div className="relative overflow-hidden rounded-t-[18px]" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={s.title}
                    className="h-full w-full object-cover brightness-75 transition-all duration-700 group-hover:scale-[1.06] group-hover:brightness-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />

                  <span className="absolute left-5 top-4 font-display text-small font-bold tracking-widest text-gift-green">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <h3 className="absolute bottom-4 left-5 right-5 font-display text-medium font-bold leading-tight text-gift-ink">
                    {s.titleEn}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-3">
                    {Icon && (
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gift-green/10 text-gift-green transition-colors duration-300 group-hover:bg-gift-green group-hover:text-white">
                        <Icon className="h-6 w-6" />
                      </span>
                    )}
                    <p className="font-sans text-small font-medium text-gift-green-mid">{s.title}</p>
                  </div>
                  <p className="mt-1 flex-1 font-sans text-[15px] font-light leading-relaxed text-gift-silver">
                    {s.body.length > 90 ? s.body.slice(0, 90) + '…' : s.body}
                  </p>
                </div>

                <span className="gift-card-btn">詳しく見る</span>
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
