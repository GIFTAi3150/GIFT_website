'use client';

import { useState } from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import PixelRobot from '@/components/ui/PixelRobot';

const departments = ['All', '代表取締役', '取締役', 'DXAI事業部', 'コールセンター事業部'];

export interface MemberCard {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
}

export default function MemberGrid({ members }: { members: MemberCard[] }) {
  const [active, setActive] = useState<string>('All');

  const filtered =
    active === 'All' ? members : members.filter((m) => m.department === active);

  return (
    <>
      {/* Department filter */}
      <section className="border-t border-gift-border bg-gift-bg-alt py-8">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2">
            {departments.map((d) => {
              const count =
                d === 'All' ? members.length : members.filter((m) => m.department === d).length;
              const isActive = active === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setActive(d)}
                  className={`rounded-full border px-4 py-2 font-sans text-small font-medium transition-colors ${
                    isActive
                      ? 'border-gift-ink bg-gift-ink text-white'
                      : 'border-gift-border bg-white text-gift-ink hover:border-gift-ink'
                  }`}
                >
                  {d}
                  <span className={`ml-1.5 text-xs ${isActive ? 'text-white/70' : 'text-gift-silver'}`}>
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Member grid */}
      <section className="border-t border-gift-border bg-white py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <PixelRobot pose="sleep" className="mb-6 h-24 w-24 text-gift-green-teal" />
              <p className="font-sans text-normal text-gift-silver">
                該当するメンバーがいません。
              </p>
            </div>
          ) : (
            <div
              key={active}
              className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-10"
            >
              {filtered.map((m, i) => (
                <Reveal key={m.id} delay={(i % 4) * 80}>
                  <Link
                    href={`/member/${m.id}?from=${encodeURIComponent(active)}`}
                    className="member-card group"
                  >
                    <div className="member-card-outer">
                      <div className="member-card-image-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.image} alt={m.name} className="member-card-image" />
                      </div>
                    </div>
                    <div className="mt-5">
                      <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
                        {m.department}
                      </p>
                      <h3 className="mt-2 font-sans text-medium font-bold text-gift-ink">
                        {m.name}
                      </h3>
                      <p className="mt-0.5 font-display text-small font-medium uppercase tracking-wider text-gift-silver">
                        {m.nameEn}
                      </p>
                      <p className="mt-2 font-sans text-small font-light text-gift-silver">
                        {m.role}
                      </p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
