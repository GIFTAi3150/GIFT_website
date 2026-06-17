import Link from 'next/link';
import { SERVICE_ICON_BY_ID } from '@/components/ui/ServiceIcons';

const services = [
  {
    iconId: 'callcenter' as const,
    labelJa: 'コールセンター事業',
    labelEn: 'Call Center',
    href: '/services/callcenter',
  },
  {
    iconId: 'aiops' as const,
    labelJa: 'AIOps事業',
    labelEn: 'AIOps',
    href: '/services/aiops',
  },
  {
    iconId: 'finance-consulting' as const,
    labelJa: '財務コンサル事業',
    labelEn: 'Financial Consulting',
    href: '/services/finance-consulting',
  },
];

export default function Clients() {
  return (
    <section className="w-full border-t border-[#BFDBFE] bg-[#F0F7FF] py-s-80">
      <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {services.map((s) => {
            const Icon = SERVICE_ICON_BY_ID[s.iconId];
            return (
              <Link
                key={s.href}
                href={s.href}
                className="group relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#2563EB]/20 bg-gradient-to-b from-[#0C0E1A] to-[#0c1a3a] p-8 text-white shadow-[0_30px_60px_-20px_rgba(37,99,235,0.25)] transition-all duration-300 hover:border-[#2563EB]/60 hover:shadow-[0_30px_60px_-20px_rgba(37,99,235,0.45)] hover:-translate-y-1 sm:min-h-[280px]"
              >
                <span aria-hidden className="h-[3px] w-8 rounded-full bg-[#2563EB]" />

                <div className="flex flex-1 items-center justify-center py-6 text-[#2563EB] transition-transform duration-300 group-hover:scale-110">
                  {Icon && <Icon className="h-16 w-16" />}
                </div>

                <div className="text-center">
                  <p className="font-sans text-[18px] font-bold leading-tight text-white">
                    {s.labelJa}
                  </p>
                  <p className="mt-1 font-display text-[11px] font-medium uppercase tracking-[0.2em] text-white/50">
                    {s.labelEn}
                  </p>
                </div>

                <span
                  aria-hidden
                  className="mt-5 inline-block text-[#2563EB] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                >
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

