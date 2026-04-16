const Block = ({ className = '', style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`animate-pulse bg-gift-grey-light/30 ${className}`} style={style} />
);

export default function ContactLoading() {
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
          <Block className="h-3 w-20 rounded" />
          <Block className="h-14 w-64 rounded md:w-80" />
          <div className="mt-4 space-y-3">
            <Block className="h-4 w-full max-w-2xl rounded" />
            <Block className="h-4 w-10/12 max-w-2xl rounded" />
          </div>
        </div>
      </section>

      {/* Form + sidebar */}
      <section className="py-s-80">
        <div className="mx-auto max-w-container px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Form */}
            <div className="rounded-2xl border border-gift-border bg-white p-6 md:p-10 lg:col-span-2">
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Block className="h-4 w-24 rounded" />
                      <Block className="h-12 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Block className="h-4 w-28 rounded" />
                      <Block className="h-12 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Block className="h-4 w-40 rounded" />
                  <Block className="h-12 w-full rounded-lg" />
                </div>
                <div className="space-y-2">
                  <Block className="h-4 w-36 rounded" />
                  <Block className="h-44 w-full rounded-lg" />
                </div>
                <Block className="h-4 w-80 max-w-full rounded" />
                <Block className="mt-2 h-12 w-40 rounded-full" />
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-8 lg:col-span-1">
              <div>
                <Block className="mb-3 h-3 w-16 rounded" />
                <Block className="mb-6 h-8 w-40 rounded" />
                <div className="space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <Block className="h-10 w-10 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2 pt-1.5">
                        <Block className="h-3 w-16 rounded" />
                        <Block className="h-4 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-gift-border bg-white p-6 space-y-3">
                <Block className="h-3 w-16 rounded" />
                <Block className="h-5 w-48 rounded" />
                <Block className="h-3 w-full rounded" />
                <Block className="h-3 w-10/12 rounded" />
                <Block className="mt-2 h-4 w-32 rounded" />
              </div>
              <div className="rounded-2xl bg-gift-ink/80 p-6 space-y-3">
                <Block className="h-3 w-16 rounded !bg-white/30" />
                <Block className="h-5 w-24 rounded !bg-white/30" />
                <Block className="h-3 w-32 rounded !bg-white/30" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
