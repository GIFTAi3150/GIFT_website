import { GLOSSARY } from './khContent';

export default function KhGlossary() {
  return (
    <section className="relative bg-[#F0F7FF] py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl border border-[#BFDBFE] bg-white p-6 md:p-10">
          <p className="font-display text-[12px] font-bold uppercase tracking-widest text-[#2563EB]">
            Glossary
          </p>
          <h2 className="mt-4 font-sans text-[clamp(21px,2.4vw,25px)] font-extrabold leading-snug text-[#0C0E1A]">
            {GLOSSARY.title}
          </h2>
          <p
            className="mt-5 font-sans text-[17px] font-light text-[#5B6B8A]"
            style={{ lineHeight: 1.95, textWrap: 'pretty' }}
          >
            {GLOSSARY.body}
          </p>
        </div>
      </div>
    </section>
  );
}
