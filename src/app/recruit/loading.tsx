const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function RecruitLoading() {
  return (
    <div style={{ backgroundColor: '#F0F4F9' }} className="min-h-screen">
      {/* Header */}
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

      {/* Hero */}
      <section className="border-b border-gift-border py-s-80">
        <div className="mx-auto max-w-container space-y-5 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-20 rounded" />
          <Block className="h-14 w-56 rounded md:w-80" />
          <Block className="h-14 w-64 rounded md:w-96" />
          <div className="mt-4 space-y-3">
            <Block className="h-4 w-full max-w-2xl rounded" />
            <Block className="h-4 w-11/12 max-w-2xl rounded" />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Block className="h-12 w-56 rounded-full" />
            <Block className="h-12 w-40 rounded-full" />
          </div>
        </div>
      </section>

      {/* Why GIFT — 4 value cards */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-20 rounded" />
            <Block className="h-9 w-72 max-w-full rounded" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[20px] border-2 border-gift-border bg-white p-8"
              >
                <Block className="mb-5 h-14 w-14 rounded-2xl" />
                <Block className="mb-3 h-5 w-40 rounded" />
                <div className="space-y-2">
                  <Block className="h-3 w-full rounded" />
                  <Block className="h-3 w-11/12 rounded" />
                  <Block className="h-3 w-10/12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Career path — 4 steps */}
      <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-14 space-y-3">
            <Block className="h-3 w-24 rounded" />
            <Block className="h-9 w-60 max-w-full rounded" />
            <Block className="mt-4 h-4 w-full max-w-2xl rounded" />
            <Block className="h-4 w-10/12 max-w-2xl rounded" />
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-4 flex items-center gap-3">
                  <Block className="h-10 w-10 rounded-full" />
                  <Block className="h-3 w-16 rounded" />
                </div>
                <Block className="mb-2 h-5 w-24 rounded" />
                <Block className="h-3 w-28 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Positions — 5 cards in 2-col grid */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-28 rounded" />
            <Block className="h-9 w-72 max-w-full rounded" />
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-[20px] border-2 border-gift-border bg-white p-7"
              >
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Block className="h-7 w-28 rounded-full" />
                  <Block className="h-7 w-20 rounded-full" />
                </div>
                <Block className="mb-3 h-5 w-56 rounded" />
                <div className="mb-5 space-y-2">
                  <Block className="h-3 w-full rounded" />
                  <Block className="h-3 w-10/12 rounded" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Block className="h-6 w-20 rounded-full" />
                  <Block className="h-6 w-24 rounded-full" />
                  <Block className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flow — 4 step cards */}
      <section className="border-t border-gift-border bg-gift-bg-alt py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-14 space-y-3">
            <Block className="h-3 w-28 rounded" />
            <Block className="h-9 w-40 max-w-full rounded" />
            <Block className="mt-4 h-4 w-full max-w-2xl rounded" />
            <Block className="h-4 w-10/12 max-w-2xl rounded" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white p-6">
                <Block className="mb-3 h-3 w-16 rounded" />
                <Block className="mb-3 h-5 w-36 rounded" />
                <div className="space-y-2">
                  <Block className="h-3 w-full rounded" />
                  <Block className="h-3 w-10/12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-5 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-20 rounded" />
          <Block className="h-10 w-80 max-w-full rounded" />
          <Block className="mt-4 h-12 w-48 rounded-full" />
        </div>
      </section>
    </div>
  );
}
