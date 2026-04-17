const Block = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white ${className}`} />
);

export default function CallCenterLoading() {
  return (
    <div style={{ backgroundColor: '#F0F4F9' }} className="min-h-screen">
      {/* Header */}
      <div className="w-full border-b border-gift-border">
        <div className="mx-auto flex h-20 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
          <Block className="h-10 w-10 rounded-full" />
          <div className="hidden gap-6 md:flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <Block key={i} className="h-4 w-16" />
            ))}
          </div>
          <Block className="h-9 w-9 rounded-sm md:hidden" />
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-gift-border py-s-80">
        <div className="mx-auto max-w-container space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-28" />
          <Block className="h-14 w-72" />
          <Block className="h-4 w-full max-w-2xl" />
          <Block className="h-4 w-3/4 max-w-xl" />
        </div>
      </section>

      {/* Highlights — 3 cards */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-64" />
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-[20px] border-2 border-gift-border bg-white p-8">
                <Block className="mb-4 h-6 w-24" />
                <div className="space-y-2">
                  <Block className="h-4 w-full" />
                  <Block className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scale — 3 stats */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Block className="h-16 w-40" />
                <Block className="h-4 w-48" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-4 md:px-6 lg:px-8">
          <Block className="h-8 w-72" />
          <Block className="h-14 w-44 !rounded-full" />
        </div>
      </section>
    </div>
  );
}
