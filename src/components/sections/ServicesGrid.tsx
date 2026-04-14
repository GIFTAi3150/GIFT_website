import Link from 'next/link';
import services from '@/data/services.json';

export default function ServicesGrid() {
  return (
    <section className="w-full bg-gift-near-black py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mb-16 flex flex-col gap-2">
          <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
            WORKS
          </p>
          <h2
            className="font-sans font-extrabold text-white"
            style={{ fontSize: '38px', lineHeight: '1.25' }}
          >
            事業内容
          </h2>
        </div>

        <div className="flex flex-col gap-24">
          {services.map((service) => (
            <div
              key={service.id}
              className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div className={service.imageLeft ? '' : 'lg:order-2'}>
                <div className="w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-full object-cover brightness-95 transition-[filter] duration-300 hover:brightness-100"
                  />
                </div>
              </div>

              <div className={service.imageLeft ? '' : 'lg:order-1'}>
                <h3
                  className="font-display font-bold leading-tight text-white"
                  style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
                >
                  {service.titleEn}
                </h3>
                <p className="mt-1 font-sans text-medium font-medium text-gift-green-mid">
                  {service.title}
                </p>

                <div className="my-6 h-0.5 w-12 bg-gift-green" />

                <p
                  className="font-sans text-normal font-light text-gift-silver"
                  style={{ lineHeight: '1.9' }}
                >
                  {service.body}
                </p>

                {service.extra && (
                  <p className="mt-3 font-sans text-normal font-normal text-white">
                    {service.extra}
                  </p>
                )}

                {service.href && (
                  <Link
                    href={service.href}
                    className="group mt-8 inline-flex items-center gap-2 font-sans text-normal font-medium text-gift-green transition-colors duration-150 hover:text-gift-green-mid"
                  >
                    詳しく見る
                    <span className="inline-block transition-transform duration-150 group-hover:translate-x-1">
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
