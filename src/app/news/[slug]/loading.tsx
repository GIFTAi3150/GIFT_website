const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function NewsDetailLoading() {
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

      {/* Back link */}
      <div className="border-b border-gift-border py-4">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <Block className="h-4 w-52 rounded" />
        </div>
      </div>

      {/* Article header */}
      <section className="py-s-80">
        <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Block className="h-4 w-16 rounded" />
            <Block className="h-4 w-20 rounded" />
          </div>
          <Block className="h-10 w-full rounded" />
          <Block className="h-10 w-10/12 rounded" />
        </div>
      </section>

      {/* Hero image */}
      <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
        <Block className="rounded-2xl" style={{ aspectRatio: '16/9' }} />
      </div>

      {/* Body */}
      <section className="py-s-80">
        <div className="mx-auto max-w-3xl space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-5 w-full rounded" />
          <Block className="h-5 w-11/12 rounded" />
          <div className="mt-8 space-y-3">
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-11/12 rounded" />
            <Block className="h-4 w-10/12 rounded" />
            <Block className="h-4 w-full rounded" />
            <Block className="h-4 w-8/12 rounded" />
          </div>
        </div>
      </section>

      {/* Related grid */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-10 space-y-3">
            <Block className="h-3 w-20 rounded" />
            <Block className="h-8 w-36 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[16px] border border-gift-border bg-white"
              >
                <Block className="!rounded-none" style={{ aspectRatio: '16/10' }} />
                <div className="space-y-2 p-5">
                  <div className="flex gap-3">
                    <Block className="h-3 w-16 rounded" />
                    <Block className="h-3 w-14 rounded" />
                  </div>
                  <Block className="h-4 w-full rounded" />
                  <Block className="h-4 w-10/12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
