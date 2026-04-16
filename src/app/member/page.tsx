'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import members from '@/data/members.json';

const departments = ['All', '経営', 'コールセンター', 'DXコンサル', '財務コンサル'];

export default function MemberPage() {
  const [active, setActive] = useState<string>('All');

  const filtered =
    active === 'All' ? members : members.filter((m) => m.department === active);

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Hero */}
        <section className="border-b border-gift-border py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-gift-green">
              MEMBERS
            </p>
            <h1
              className="font-sans font-extrabold text-gift-ink"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              メンバー
            </h1>
            <p
              className="mt-6 max-w-3xl font-sans text-normal font-light text-gift-silver"
              style={{ lineHeight: '2' }}
            >
              GIFTを構成する経営陣と主要メンバーをご紹介します。多様な専門性を持つ一人ひとりが、お客様と社会に価値を届けています。
            </p>
          </div>
        </section>

        {/* Department filter */}
        <section className="border-b border-gift-border py-8">
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
        <section className="py-s-80">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <p className="py-20 text-center font-sans text-normal text-gift-silver">
                該当するメンバーがいません。
              </p>
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

        {/* Recruit CTA */}
        <Reveal>
          <section className="border-t border-gift-border py-s-80">
            <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                JOIN US
              </p>
              <h2
                className="mb-8 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                仲間を募集しています
              </h2>
              <Link href="/recruit" className="cta-btn">
                <span>採用情報を見る</span>
              </Link>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
