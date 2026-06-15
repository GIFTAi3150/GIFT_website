import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import TeamGreet, { type MemberCard } from './TeamGreet';
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
      {/* Warm cream + terracotta palette local to /member. Magazine /
          editorial print feel — the pixel HELLO in TeamGreet reads as
          a terracotta print stamp on cream paper. Hex values are
          inlined as arbitrary Tailwind utilities so this page can
          diverge from the global palette without polluting the
          Tailwind config. */}
      <main className="bg-[#F4EFE6]">
        {/* Hero */}
        <section className="border-b border-[#DDD0BA] py-s-80">
          <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
            <p className="mb-4 font-display text-small font-bold uppercase tracking-widest text-[#D96B43]">
              MEMBERS
            </p>
            <h1
              className="font-sans font-extrabold text-[#2A2520]"
              style={{ fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: '1.1' }}
            >
              メンバー
            </h1>
            <p
              className="mx-auto mt-6 max-w-3xl font-sans text-normal font-light text-[#6B5F52]"
              style={{ lineHeight: '2' }}
            >
              GIFT。
            </p>
          </div>
        </section>

        {/* Portrait grid with a "Hello." reveal on hover — pattern
            from neu-ad.jp/team. Grayscale portraits go to color, a
            greeting fades in from the top-left, and the name jumps
            one size step. */}
        <TeamGreet members={members} />

        {/* Recruit CTA — slightly deeper cream surface so the CTA
            reads as a distinct section without leaving the palette. */}
        <Reveal>
          <section className="relative overflow-hidden border-t border-[#DDD0BA] bg-[#EBE3D2] py-s-80">
            <div className="relative z-10 mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-[#D96B43]">
                JOIN US
              </p>
              <h2
                className="mb-8 font-sans font-extrabold text-[#2A2520]"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)', lineHeight: '1.25' }}
              >
                仲間を募集しています
              </h2>
              <Link href="/recruit" className="cta-btn cta-btn--member">
                <span>採用情報を見る</span>
              </Link>
            </div>
          </section>
        </Reveal>

        {/* Marquee band — dark warm strip */}
        <section aria-hidden className="overflow-hidden bg-[#2A2520] py-7 select-none">
          {/* Row 1 forward — logo appears only 2× per cycle; — dash everywhere else */}
          <div className="mb-3 flex w-max animate-marquee items-center gap-0 whitespace-nowrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={`r1-${i}`} className="flex items-center">
                {(
                  [
                    { text: 'JOIN US',         jp: false, sep: 'dash' },
                    { text: '仲間になろう',     jp: true,  sep: 'dash' },
                    { text: 'SPARK',            jp: false, sep: 'dash' },
                    { text: '情熱',             jp: true,  sep: 'dash' },
                    { text: 'GROW TOGETHER',    jp: false, sep: 'dash' },
                    { text: '挑戦',             jp: true,  sep: 'dash' },
                    { text: 'MAKE AN IMPACT',   jp: false, sep: 'logo' },
                    { text: '未来を創る',        jp: true,  sep: 'dash' },
                    { text: 'INSPIRE',          jp: false, sep: 'dash' },
                    { text: '輝く',             jp: true,  sep: 'dash' },
                    { text: 'BUILD THE FUTURE', jp: false, sep: 'dash' },
                    { text: '可能性',           jp: true,  sep: 'dash' },
                    { text: 'BE THE CHANGE',    jp: false, sep: 'dash' },
                    { text: '革新',             jp: true,  sep: 'logo' },
                  ] as { text: string; jp: boolean; sep: 'dash' | 'logo' }[]
                ).map(({ text, jp, sep }) => (
                  <span key={text} className="flex items-center">
                    <span
                      className="font-display font-extrabold tracking-tight"
                      style={{ fontSize: 'clamp(30px, 4.5vw, 64px)', color: jp ? '#D96B43' : '#F4EFE6' }}
                    >
                      {text}
                    </span>
                    {sep === 'logo' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 828 800"
                        className="mx-7 shrink-0"
                        style={{ height: 'clamp(24px, 3.2vw, 44px)', width: 'auto' }}
                      >
                        <path fill="#D96B43" d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"/>
                        <path fill="#2A2520" d="M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z"/>
                        <path fill="#2A2520" d="M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z"/>
                      </svg>
                    ) : (
                      <span
                        className="mx-5"
                        style={{ fontSize: 'clamp(14px, 2vw, 28px)', color: 'rgba(217,107,67,0.5)' }}
                      >
                        ✦
                      </span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </div>

          {/* Row 2 reverse — logo 2× per cycle; / slash separator */}
          <div
            className="flex w-max items-center gap-0 whitespace-nowrap"
            style={{ animation: 'marquee 95s linear infinite reverse' }}
          >
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={`r2-${i}`} className="flex items-center">
                {(
                  [
                    { text: '自分らしく',    jp: true,  sep: 'dash' },
                    { text: 'BE YOURSELF',   jp: false, sep: 'dash' },
                    { text: '絆',            jp: true,  sep: 'dash' },
                    { text: 'COLLABORATE',   jp: false, sep: 'dash' },
                    { text: '前進',          jp: true,  sep: 'dash' },
                    { text: 'THINK BOLDLY',  jp: false, sep: 'dash' },
                    { text: '信頼',          jp: true,  sep: 'logo' },
                    { text: 'STAY CURIOUS',  jp: false, sep: 'dash' },
                    { text: '夢',            jp: true,  sep: 'dash' },
                    { text: '共創',          jp: true,  sep: 'dash' },
                    { text: 'WELCOME TO GIFT', jp: false, sep: 'dash' },
                    { text: 'GIFTへようこそ', jp: true,  sep: 'dash' },
                    { text: '活躍',          jp: true,  sep: 'dash' },
                    { text: 'HAVE FUN',      jp: false, sep: 'logo' },
                  ] as { text: string; jp: boolean; sep: 'dash' | 'logo' }[]
                ).map(({ text, jp, sep }) => (
                  <span key={text} className="flex items-center">
                    <span
                      className="font-display font-bold tracking-tight"
                      style={{
                        fontSize: 'clamp(18px, 2.6vw, 38px)',
                        color: jp ? 'rgba(217,107,67,0.55)' : 'rgba(244,239,230,0.35)',
                      }}
                    >
                      {text}
                    </span>
                    {sep === 'logo' ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 828 800"
                        className="mx-5 shrink-0"
                        style={{ height: 'clamp(14px, 2vw, 28px)', width: 'auto', opacity: 0.3 }}
                      >
                        <path fill="#D96B43" d="M727.19,290.25l-13.54-46.64c-.07-.28-.14-.57-.21-.85-9.97-47.12,10.79-74.96,10.79-74.96l37.27-50.14c3.15-4.23,2.63-10.15-1.21-13.77l-100.68-94.91c-4.16-3.92-10.68-3.74-14.64.38-24.77,25.82-88.99,49.59-130.64,51.21-37.93,1.48-65.98-9.51-82.17-18.37-.2-.15-.41-.28-.65-.4l-13.24-6.4c-1.02-.49-2.2-.49-3.22,0l-13.24,6.4c-.24.12-.45.25-.65.4-16.19,8.85-44.25,19.85-82.17,18.37-41.65-1.62-105.86-25.39-130.64-51.21-3.96-4.12-10.48-4.3-14.64-.38l-100.68,94.91c-3.84,3.62-4.36,9.54-1.21,13.77l37.27,50.14s20.76,27.85,10.79,74.96c-.07.28-.14.57-.21.85l-13.54,46.64c-.07.2-.13.4-.2.6-3.38,9.39-88.7,250.57,18.19,350.22,109.02,101.63,218.75,95.68,249.63,119.21,21.61,16.46,39.82,24.15,42.91,33.57,0,0,0,.01,0,.02,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0-.02,3.09-9.42,21.3-17.11,42.91-33.57,30.88-23.53,140.61-17.58,249.63-119.21,106.89-99.65,21.57-340.82,18.19-350.22-.07-.2-.13-.4-.2-.6Z"/>
                        <path fill="#2A2520" d="M601.73,227.4h-226.7c-104.67,0-189.51,84.85-189.51,189.51s84.85,188.49,189.51,188.49h111.47c1.18,0,2.13-.96,2.13-2.13v-100.79c0-1.12-.9-2.02-2.02-2.02h-111.59v-168.12h226.71c1.12,0,2.03-.91,2.03-2.03v-100.87c0-1.13-.92-2.04-2.04-2.04Z"/>
                        <path fill="#2A2520" d="M601.77,385.58h-207.21c-1.91,0-2.85,2.33-1.48,3.66l103.46,100.02h105.16c1.15,0,2.08-.93,2.08-2.08v-99.58c0-1.11-.9-2.01-2.01-2.01Z"/>
                      </svg>
                    ) : (
                      <span
                        className="mx-4"
                        style={{ fontSize: 'clamp(10px, 1.4vw, 20px)', color: 'rgba(244,239,230,0.25)' }}
                      >
                        ◆
                      </span>
                    )}
                  </span>
                ))}
              </span>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
