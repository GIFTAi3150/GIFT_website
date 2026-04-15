import Reveal from '@/components/ui/Reveal';

// TODO: swap with real client names/logos. Keep text placeholders until logo files are provided.
const clients = [
  'Client A',
  'Client B',
  'Client C',
  'Client D',
  'Client E',
  'Client F',
  'Client G',
  'Client H',
  'Client I',
  'Client J',
  'Client K',
  'Client L',
];

export default function Clients() {
  return (
    <section className="w-full border-t border-gift-border bg-gift-bg-alt py-s-80">
      <Reveal>
        <div className="mx-auto mb-10 max-w-container px-4 md:px-6 lg:px-8">
          <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
            CLIENTS
          </p>
          <h2
            className="font-sans font-extrabold text-gift-ink"
            style={{ fontSize: '36px', lineHeight: '1.25' }}
          >
            ご支援企業様の例
          </h2>
        </div>
      </Reveal>

      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-px bg-white sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {clients.map((name, i) => (
            <Reveal
              key={i}
              delay={i * 60}
              className="flex h-24 items-center justify-center bg-gift-bg-alt hover:bg-gift-mid-dark"
            >
              <span className="font-display text-small uppercase tracking-widest text-gift-ink/60">
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
