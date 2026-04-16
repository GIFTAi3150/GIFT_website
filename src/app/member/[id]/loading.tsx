const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function MemberDetailLoading() {
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

      {/* Back link strip */}
      <div className="border-b border-gift-border py-4">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <Block className="h-4 w-40 rounded" />
        </div>
      </div>

      {/* Hero image area — light bg so no dark flash */}
      <section className="relative pb-12 md:pb-16">
        <Block
          className="!rounded-none !bg-gift-grey-light/20 h-[60vh] min-h-[460px] w-full"
        />

        {/* White info panel overlapping */}
        <div className="relative -mt-24 md:-mt-32">
          <div className="mx-auto max-w-5xl px-4 md:px-6 lg:px-8">
            <div className="bg-white px-6 py-8 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] md:px-12 md:py-10">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <Block className="h-10 w-40 rounded" />
                  <Block className="h-4 w-72 max-w-full rounded" />
                </div>
                <Block className="h-5 w-16 rounded" />
              </div>
              <div className="mt-8 space-y-3">
                <Block className="h-4 w-full rounded" />
                <Block className="h-4 w-11/12 rounded" />
                <Block className="h-4 w-10/12 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Other members grid */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-10 space-y-3">
            <Block className="h-3 w-28 rounded" />
            <Block className="h-8 w-52 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 lg:gap-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="text-center">
                <Block className="mx-auto aspect-square w-[85%] max-w-[260px] rounded-full" />
                <div className="mt-4 flex flex-col items-center gap-2">
                  <Block className="h-3 w-20 rounded" />
                  <Block className="h-4 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
