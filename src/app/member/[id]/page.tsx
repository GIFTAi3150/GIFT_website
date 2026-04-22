import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Reveal from '@/components/ui/Reveal';
import staticMembers from '@/data/members.json';
import { getPublishedMembers } from '@/lib/notion';

export const dynamic = 'force-dynamic';

type MemberRecord = {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  department: string;
  image: string;
  bio: string;
};

export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { from?: string };
}) {
  // Try Notion first, fall back to static placeholders
  let members: MemberRecord[] = [];
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
        bio: m.bio,
      }));
    } else {
      members = staticMembers;
    }
  } catch {
    members = staticMembers;
  }

  const index = members.findIndex((m) => m.id === params.id);
  if (index === -1) notFound();

  const member = members[index];
  const fromFilter = searchParams.from ?? 'All';
  const scopedToDept = fromFilter !== 'All' && fromFilter === member.department;

  // Scope navigation + "other members" to either all members or the same department
  const scope = scopedToDept
    ? members.filter((m) => m.department === member.department)
    : members;
  const scopeIndex = scope.findIndex((m) => m.id === member.id);
  const prev = scopeIndex > 0 ? scope[scopeIndex - 1] : null;
  const next = scopeIndex < scope.length - 1 ? scope[scopeIndex + 1] : null;

  const others = scope.filter((m) => m.id !== member.id);

  return (
    <>
      <Header />
      <main className="bg-gift-near-black">
        {/* Back link */}
        <div className="border-b border-gift-border py-4">
          <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
            <Link
              href="/member"
              className="inline-flex items-center gap-2 font-sans text-small font-medium text-gift-silver transition-colors hover:text-gift-ink"
            >
              ← メンバー一覧へ戻る
            </Link>
          </div>
        </div>

        {/* Hero image with prev/next arrows on sides + overlapping info band */}
        <section className="relative pb-12 md:pb-16">
          <div className="relative h-[60vh] min-h-[460px] w-full overflow-hidden bg-gift-near-black">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={member.image}
              alt={member.name}
              className="h-full w-full object-cover object-center"
            />

            {prev ? (
              <Link
                href={`/member/${prev.id}?from=${encodeURIComponent(fromFilter)}`}
                aria-label={`前のメンバー: ${prev.name}`}
                className="member-nav-arrow member-nav-arrow--left"
              >
                <span aria-hidden>←</span>
              </Link>
            ) : (
              <span
                aria-hidden
                className="member-nav-arrow member-nav-arrow--left member-nav-arrow--disabled"
              >
                ←
              </span>
            )}
            {next ? (
              <Link
                href={`/member/${next.id}?from=${encodeURIComponent(fromFilter)}`}
                aria-label={`次のメンバー: ${next.name}`}
                className="member-nav-arrow member-nav-arrow--right"
              >
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <span
                aria-hidden
                className="member-nav-arrow member-nav-arrow--right member-nav-arrow--disabled"
              >
                →
              </span>
            )}
          </div>

          {/* White info band — overlaps the bottom of the image */}
          <Reveal className="relative -mt-24 md:-mt-32">
            <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
              <div className="bg-white px-6 py-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] md:px-12 md:py-10">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h1
                      className="font-sans font-extrabold text-gift-ink"
                      style={{ fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: '1.1' }}
                    >
                      {member.department}
                    </h1>
                    <p className="mt-3 font-sans text-normal text-gift-silver">
                      <span className="font-medium text-gift-ink">{member.name}</span>
                      <span className="mx-2 text-gift-silver/60">/</span>
                      {member.role}
                      <span className="mx-2 text-gift-silver/60">/</span>
                      {member.nameEn}
                    </p>
                  </div>
                  <div className="shrink-0 pt-1 font-display text-medium font-bold tabular-nums text-gift-green">
                    {String(scopeIndex + 1).padStart(2, '0')}{' '}
                    <span className="text-gift-silver/40">/</span>{' '}
                    {String(scope.length).padStart(2, '0')}
                  </div>
                </div>

                <p
                  className="mt-8 font-sans font-light text-gift-silver"
                  style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', lineHeight: '2' }}
                >
                  {member.bio}
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* Other members — circular avatars */}
        <Reveal>
          <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
            <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
              <p className="mb-3 font-display text-small font-bold uppercase tracking-widest text-gift-green">
                {scopedToDept ? member.department : 'OTHER MEMBERS'}
              </p>
              <h2
                className="mb-10 font-sans font-extrabold text-gift-ink"
                style={{ fontSize: 'clamp(24px, 3vw, 32px)', lineHeight: '1.25' }}
              >
                {scopedToDept ? '同じ事業部のメンバー' : '他のメンバー'}
              </h2>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-10">
                {others.map((m, i) => (
                  <Reveal key={m.id} delay={(i % 5) * 80}>
                    <Link
                      href={`/member/${m.id}?from=${encodeURIComponent(fromFilter)}`}
                      className="member-card group"
                    >
                      <div className="member-card-outer">
                        <div className="member-card-image-wrap">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.image} alt={m.name} className="member-card-image" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="font-display text-small font-bold uppercase tracking-widest text-gift-green">
                          {m.department}
                        </p>
                        <h3 className="mt-1 font-sans text-small font-bold text-gift-ink">
                          {m.name}
                        </h3>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
