const Block = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded bg-gift-grey-light/30 ${className}`} />
);

export default function AchievementsLoading() {
  return (
    <div style={{ backgroundColor: '#F0F4F9' }} className="min-h-screen">
      {/* Header skeleton */}
      <div className="w-full border-b border-gift-border">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
          <Block className="h-6 w-24" />
          <div className="hidden gap-6 md:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Block key={i} className="h-4 w-16" />
            ))}
          </div>
          <Block className="h-9 w-28 !rounded-full" />
        </div>
      </div>

      {/* Page header — mirrors: eyebrow + H1 + subtitle */}
      <section className="border-b border-gift-border py-s-80">
        <div className="mx-auto max-w-container space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-20" />
          <Block className="h-12 w-48 md:w-64" />
          <Block className="h-4 w-80 max-w-full" />
        </div>
      </section>

      {/* Case grid — mirrors: 2-col grid of gift-cards */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[20px] border-2 border-gift-border bg-white">
                {/* Image placeholder */}
                <Block className="!rounded-none aspect-[16/10]" />
                {/* Text area */}
                <div className="space-y-3 p-6">
                  <Block className="h-4 w-40" />
                  <Block className="h-3 w-24" />
                  <Block className="h-5 w-full" />
                  <div className="flex gap-2 pt-1">
                    <Block className="h-6 w-16 !rounded-full" />
                    <Block className="h-6 w-20 !rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — mirrors: centered heading + button */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-6 px-4 md:px-6 lg:px-8">
          <Block className="h-8 w-72 max-w-full" />
          <Block className="h-12 w-40 !rounded-full" />
        </div>
      </section>
    </div>
  );
}
