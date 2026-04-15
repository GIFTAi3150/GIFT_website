// Skeleton for /company — mirrors the real page layout so there's no jump when content loads.

const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-white ${className}`} style={style} />
);

export default function CompanyLoading() {
  return (
    <div style={{ backgroundColor: '#D7DDD9' }} className="min-h-screen">
      {/* Header */}
      <div className="w-full border-b border-gift-border">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
          <Block className="h-10 w-10 rounded-full" />
          <div className="hidden gap-6 md:flex">
            {Array.from({ length: 6 }).map((_, i) => (
              <Block key={i} className="h-4 w-16" />
            ))}
          </div>
          <Block className="h-9 w-9 rounded-sm md:hidden" />
        </div>
      </div>

      {/* Page header */}
      <section className="border-b border-gift-border py-s-80">
        <div className="mx-auto max-w-container space-y-4 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-24" />
          <Block className="h-14 w-52" />
          <Block className="h-4 w-3/4 sm:w-1/2" />
        </div>
      </section>

      {/* CEO Message */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <Block className="mx-auto aspect-square w-full max-w-md sm:max-w-lg lg:max-w-2xl" />
            <div className="space-y-4">
              <Block className="h-3 w-24" />
              <Block className="h-8 w-56" />
              <div className="mt-6 space-y-3">
                <Block className="h-4 w-full" />
                <Block className="h-4 w-5/6" />
                <Block className="h-4 w-4/6" />
              </div>
              <div className="mt-6 space-y-3">
                <Block className="h-4 w-full" />
                <Block className="h-4 w-11/12" />
              </div>
              <Block className="mt-8 h-5 w-40" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand statement */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-5 px-4 md:px-6 lg:px-8">
          <Block className="h-16 w-3/4 sm:w-1/2" />
          <Block className="h-4 w-2/3 sm:w-1/3" />
        </div>
      </section>

      {/* Company Info Table */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-36" />
          </div>
          <div className="border-t border-gift-border">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 border-b border-gift-border py-5 sm:grid-cols-4 sm:gap-6"
              >
                <Block className="h-3 w-20" />
                <div className="sm:col-span-3">
                  <Block className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-12 space-y-3">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-28" />
          </div>
          <div className="space-y-8 border-l border-gift-border pl-6 sm:pl-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Block className="h-4 w-20" />
                <Block className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mb-10 space-y-3">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-36" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12">
            <div className="space-y-3 lg:col-span-2">
              <Block className="h-4 w-40" />
              <Block className="h-4 w-full" />
              <Block className="h-4 w-5/6" />
              <Block className="h-4 w-32" />
            </div>
            <Block className="aspect-[16/10] w-full lg:col-span-3" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-4 md:px-6 lg:px-8">
          <Block className="h-8 w-3/4 sm:w-1/2" />
          <Block className="h-14 w-44 rounded-full" />
        </div>
      </section>
    </div>
  );
}
