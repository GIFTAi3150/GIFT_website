import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import MemberGrid, { type MemberCard } from './MemberGrid';
import { getPublishedMembers } from '@/lib/notion';
import staticMembers from '@/data/members.json';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'メンバー紹介',
  description: '株式会社GIFTで活躍するメンバーをご紹介します。',
  alternates: { canonical: '/member' },
};

export default async function MemberPage() {
  let members: MemberCard[] = [];

  try {
    const notionMembers = await getPublishedMembers();
    if (notionMembers.length > 0) {
      members = notionMembers.map((m) => ({
        id: m.id,
        name: m.name,
        nameEn: m.nameEn,
        role: m.role,
        department: m.department,
        image: m.image,
      }));
    } else {
      members = staticMembers;
    }
  } catch {
    // Notion unavailable — fall back to static placeholders
    members = staticMembers;
  }

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
              GIFTの経営陣と主要メンバーをご紹介します。一人ひとりが独自の専門性を持ち、力を合わせてお客様と社会に価値をお届けしています。
            </p>
          </div>
        </section>

        {/* Filter + grid (client component) */}
        <MemberGrid members={members} />

        {/* Recruit CTA */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
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
