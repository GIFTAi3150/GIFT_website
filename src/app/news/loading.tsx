const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function NewsLoading() {
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
        <div className="mx-auto max-w-container space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-16 rounded" />
          <Block className="h-14 w-72 max-w-full rounded md:w-96" />
          <div className="mt-4 space-y-3">
            <Block className="h-4 w-full max-w-2xl rounded" />
            <Block className="h-4 w-10/12 max-w-2xl rounded" />
          </div>
        </div>
      </section>

      {/* Category chips */}
      <section className="border-b border-gift-border py-8">
        <div className="mx-auto flex max-w-container flex-wrap gap-2 px-4 md:px-6 lg:px-8">
          {[20, 24, 30, 18, 22, 20, 28].map((w, i) => (
            <Block key={i} className="h-9 rounded-full" style={{ width: `${w * 2.5}px` }} />
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[16px] border border-gift-border bg-white"
              >
                <Block className="!rounded-none" style={{ aspectRatio: '16/10' }} />
                <div className="space-y-3 p-5">
                  <div className="flex gap-3">
                    <Block className="h-3 w-16 rounded" />
                    <Block className="h-3 w-14 rounded" />
                  </div>
                  <Block className="h-4 w-full rounded" />
                  <Block className="h-4 w-5/6 rounded" />
                  <div className="mt-1 space-y-2">
                    <Block className="h-3 w-full rounded" />
                    <Block className="h-3 w-10/12 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
