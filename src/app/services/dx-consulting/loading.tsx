const Block = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white ${className}`} />
);

export default function DxConsultingLoading() {
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
          <Block className="h-3 w-32" />
          <Block className="h-14 w-64" />
          <Block className="h-4 w-full max-w-2xl" />
          <Block className="h-4 w-3/4 max-w-xl" />
          {/* Partner card skeleton */}
          <div className="mt-6 flex items-center gap-4 rounded-2xl border-2 border-gift-border bg-white px-6 py-6">
            <Block className="h-16 w-16 !rounded-full" />
            <div className="flex-1 space-y-2">
              <Block className="h-5 w-32" />
              <Block className="h-3 w-48" />
              <Block className="h-4 w-full" />
            </div>
          </div>
          {/* Tagline skeleton */}
          <Block className="mt-4 h-20 w-full rounded-xl" />
        </div>
      </section>

      {/* Service areas — 4 cards */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-28" />
            <Block className="h-8 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[20px] border-2 border-gift-border bg-white p-8">
                <Block className="mb-4 h-6 w-40" />
                <div className="space-y-2">
                  <Block className="h-4 w-full" />
                  <Block className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="border-t border-gift-border py-s-80" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Block className="mx-auto mb-3 h-3 w-24" />
            <Block className="mx-auto mb-12 h-8 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-2xl border border-gift-border bg-white px-6 py-5">
                  <Block className="h-8 w-8 !rounded-full" />
                  <Block className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features — 6 cards */}
      <section className="border-t border-gift-border py-s-80" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-12 text-center">
            <Block className="mx-auto mb-3 h-3 w-20" />
            <Block className="mx-auto h-8 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gift-border bg-white p-7">
                <Block className="mb-4 h-12 w-12 !rounded-full" />
                <Block className="mb-3 h-5 w-28" />
                <div className="space-y-2">
                  <Block className="h-3 w-full" />
                  <Block className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case study */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mx-auto mb-12 text-center">
            <Block className="mx-auto mb-3 h-3 w-24" />
            <Block className="mx-auto h-8 w-36" />
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-gift-border bg-white">
            <Block className="aspect-[21/9] w-full !rounded-none" />
            <div className="space-y-4 p-8">
              <Block className="h-16 w-full rounded-xl" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Block className="h-4 w-32" />
                  <Block className="h-3 w-full" />
                  <Block className="h-3 w-4/5" />
                </div>
                <div className="space-y-2">
                  <Block className="h-4 w-32" />
                  <Block className="h-3 w-full" />
                  <Block className="h-3 w-4/5" />
                </div>
              </div>
            </div>
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
