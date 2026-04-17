const Block = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-white ${className}`} />
);

export default function FinanceConsultingLoading() {
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
          <Block className="h-3 w-40" />
          <Block className="h-14 w-64" />
          <Block className="h-4 w-full max-w-2xl" />
          <Block className="h-4 w-3/4 max-w-xl" />
        </div>
      </section>

      {/* What we offer — 2 cards */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-28" />
            <Block className="h-8 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
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

      {/* Approach */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-16">
            <div className="space-y-3 lg:col-span-1">
              <Block className="h-3 w-20" />
              <Block className="h-8 w-36" />
            </div>
            <div className="space-y-3 lg:col-span-3">
              <Block className="h-4 w-full" />
              <Block className="h-4 w-11/12" />
              <Block className="h-4 w-4/5" />
            </div>
          </div>
        </div>
      </section>

      {/* Target */}
      <section className="border-t border-gift-border py-s-80" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="mx-auto max-w-container px-4 text-center md:px-6 lg:px-8">
          <Block className="mx-auto mb-3 h-3 w-24" />
          <Block className="mx-auto mb-6 h-8 w-72" />
          <Block className="mx-auto h-4 w-full max-w-xl" />
          <Block className="mx-auto mt-2 h-4 w-3/4 max-w-lg" />
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
