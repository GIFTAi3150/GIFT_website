const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function MemberLoading() {
  return (
    <div style={{ backgroundColor: '#F0F4F9' }} className="min-h-screen">
      {/* Header skeleton */}
      <div className="w-full border-b border-gift-border">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
          <Block className="h-6 w-24 rounded" />
          <div className="hidden gap-6 md:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Block key={i} className="h-4 w-16 rounded" />
            ))}
          </div>
          <Block className="h-9 w-28 rounded-full" />
        </div>
      </div>

      {/* Hero — eyebrow + H1 + subtitle */}
      <section className="border-b border-gift-border py-s-80">
        <div className="mx-auto max-w-container space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-20 rounded" />
          <Block className="h-12 w-48 rounded md:w-64" />
          <Block className="h-4 w-80 max-w-full rounded" />
        </div>
      </section>

      {/* Filter chip strip */}
      <section className="border-b border-gift-border py-8">
        <div className="mx-auto flex max-w-container flex-wrap gap-2 px-4 md:px-6 lg:px-8">
          {[24, 20, 32, 28, 28].map((w, i) => (
            <Block key={i} className="h-9 rounded-full" style={{ width: `${w * 2}px` }} />
          ))}
        </div>
      </section>

      {/* Member grid — mirrors circular card grid */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-center">
                <Block className="mx-auto aspect-square w-[85%] max-w-[260px] rounded-full" />
                <div className="mt-5 flex flex-col items-center gap-2">
                  <Block className="h-3 w-20 rounded" />
                  <Block className="h-5 w-24 rounded" />
                  <Block className="h-3 w-16 rounded" />
                  <Block className="mt-1 h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recruit CTA */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-5 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-20 rounded" />
          <Block className="h-8 w-64 max-w-full rounded" />
          <Block className="mt-2 h-12 w-44 rounded-full" />
        </div>
      </section>
    </div>
  );
}
