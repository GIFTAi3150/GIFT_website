import KhSectionHead from './KhSectionHead';
import { SUPPORT } from './khContent';

export default function KhSupport() {
  return (
    <section className="relative bg-white py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <KhSectionHead word="Support" chip={SUPPORT.title} lead={SUPPORT.lead} tone="light" />

        <dl className="mx-auto mt-14 max-w-4xl">
          {SUPPORT.items.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-y-2 border-t border-[#BFDBFE] py-6 min-[760px]:flex-row min-[760px]:items-baseline min-[760px]:gap-x-10"
            >
              <dt
                className="font-sans text-[19px] font-bold leading-snug text-[#0C0E1A] min-[760px]:w-[42%] min-[760px]:shrink-0"
                style={{ textWrap: 'balance' }}
              >
                {item.title}
              </dt>
              <dd
                className="font-sans text-[17px] font-light text-[#5B6B8A]"
                style={{ lineHeight: 1.9, textWrap: 'pretty' }}
              >
                {item.detail}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
