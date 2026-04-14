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
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {services.map((s) => (
            <div
              key={s.id}
              className="group flex flex-col overflow-hidden bg-gift-mid-dark transition-colors duration-200 hover:bg-gift-green/10"
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={s.title}
                  className="h-full w-full object-cover brightness-90 transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-100"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-medium font-bold leading-tight text-white">
                  {s.titleEn}
                </h3>
                <p className="mt-1 font-sans text-small text-gift-green-mid">{s.title}</p>
                <div className="my-4 h-0.5 w-10 bg-gift-green" />
                <p className="flex-1 font-sans text-small font-light leading-relaxed text-gift-silver">
                  {s.body.length > 90 ? s.body.slice(0, 90) + '…' : s.body}
                </p>
                {s.href && (
                  <Link
                    href={s.href}
                    className="mt-5 inline-flex items-center gap-2 font-sans text-small text-gift-green transition-colors hover:text-gift-green-mid"
                  >
                    詳しく見る
                    <span className="inline-block transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
