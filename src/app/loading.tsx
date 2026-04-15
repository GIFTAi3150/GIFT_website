// Full-page skeleton that mirrors the homepage layout.
// Shown during route transitions & server data fetching.

const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-white ${className}`} style={style} />
);

export default function Loading() {
  return (
    <div style={{ backgroundColor: '#D7DDD9' }} className="min-h-screen">
      {/* Header */}
      <div className="w-full border-b border-gift-border">
        <div className="mx-auto flex h-16 max-w-container items-center justify-between px-4 md:px-6 lg:px-8">
          <Block className="h-6 w-24" />
          <div className="hidden gap-6 md:flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Block key={i} className="h-4 w-16" />
            ))}
          </div>
          <Block className="h-9 w-28" />
        </div>
      </div>

      {/* Hero */}
      <section className="flex min-h-[100vh] items-center justify-center">
        <div className="flex w-full max-w-3xl flex-col items-center gap-8 px-4">
          <Block
            className="h-[400px] w-full max-w-lg rounded-full"
            style={{ borderRadius: '9999px' }}
          />
          <Block className="h-10 w-3/4" />
          <Block className="h-5 w-2/3" />
          <Block className="h-14 w-40" />
        </div>
      </section>

      {/* Who We Are */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
            <Block className="h-3 w-24" />
            <Block className="h-8 w-4/5" />
            <Block className="h-0.5 w-12" />
            <Block className="h-4 w-full" />
            <Block className="h-4 w-5/6" />
            <Block className="mt-4 h-12 w-44" />
          </div>
        </div>
      </section>

      {/* Team Photo Carousel */}
      <section className="overflow-hidden py-s-80">
        <div className="mx-auto mb-10 max-w-container space-y-3 px-4">
          <Block className="h-3 w-24" />
          <Block className="h-8 w-56" />
          <Block className="h-4 w-72" />
        </div>
        <div className="flex gap-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Block
              key={i}
              className="aspect-[4/3] shrink-0"
              style={{ width: 'min(60vw, 480px)' }}
            />
          ))}
        </div>
      </section>

      {/* Case Study */}
      <section className="py-s-80">
        <div className="mx-auto mb-12 max-w-container space-y-3 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-28" />
          <Block className="h-8 w-40" />
          <Block className="h-4 w-64" />
        </div>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Block className="aspect-[4/3]" />
                <Block className="h-3 w-20" />
                <Block className="h-4 w-full" />
                <Block className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-s-80">
        <div className="mx-auto mb-12 max-w-container space-y-3 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-24" />
          <Block className="h-8 w-36" />
        </div>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Block className="aspect-[4/3]" />
                <Block className="h-4 w-4/5" />
                <Block className="h-3 w-1/2" />
                <Block className="h-3 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clients */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto mb-10 max-w-container space-y-3 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-24" />
          <Block className="h-8 w-52" />
        </div>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-px bg-white sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <Block key={i} className="h-24" />
            ))}
          </div>
        </div>
      </section>

      {/* Social Links */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-24" />
          <Block className="h-7 w-64" />
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Block key={i} className="h-14 w-36" />
            ))}
          </div>
        </div>
      </section>

      {/* Column / News */}
      <section className="border-t border-gift-border py-s-80">
        <div className="mx-auto mb-12 max-w-container space-y-3 px-4 md:px-6 lg:px-8">
          <Block className="h-3 w-28" />
          <Block className="h-8 w-52" />
        </div>
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Block className="aspect-[16/10]" />
                <Block className="h-3 w-24" />
                <Block className="h-4 w-full" />
                <Block className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="border-t border-gift-border">
        <div className="mx-auto grid max-w-container grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4 md:px-6 lg:px-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Block className="h-4 w-20" />
              <Block className="h-3 w-full" />
              <Block className="h-3 w-3/4" />
              <Block className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
