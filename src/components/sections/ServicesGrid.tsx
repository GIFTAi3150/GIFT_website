import Link from 'next/link';
import services from '@/data/services.json';

export default function ServicesGrid() {
  return (
    <section className="w-full bg-gift-near-black py-s-80">
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8">

        <div className="flex flex-col gap-2 mb-16">
          <p className="font-display font-bold text-gift-green tracking-widest uppercase text-small">
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center"
            >
              <div className={service.imageLeft ? '' : 'lg:order-2'}>
                <div
                  className="w-full overflow-hidden"
                  style={{ aspectRatio: '4/3' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover brightness-95 hover:brightness-100 transition-[filter] duration-300"
                  />
                </div>
              </div>

              <div className={service.imageLeft ? '' : 'lg:order-1'}>
                <h3
                  className="font-display font-bold text-white leading-tight"
                  style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}
                >
                  {service.titleEn}
                </h3>
                <p className="font-sans font-medium text-medium text-gift-green-mid mt-1">
                  {service.title}
                </p>

                <div className="w-12 h-0.5 bg-gift-green my-6" />

                <p
                  className="font-sans font-light text-normal text-gift-silver"
                  style={{ lineHeight: '1.9' }}
                >
                  {service.body}
                </p>

                {service.extra && (
                  <p className="font-sans font-normal text-normal text-white mt-3">
                    {service.extra}
                  </p>
                )}

                {service.href && (
                  <Link
                    href={service.href}
                    className="group mt-8 inline-flex items-center gap-2 font-sans font-medium text-normal text-gift-green hover:text-gift-green-mid transition-colors duration-150"
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
