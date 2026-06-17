/** Instant skeleton while the PDP RSC payload loads (reduces “stuck” nprogress feel). */
export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square md:aspect-[4/5] max-h-[520px] mx-auto lg:mx-0 w-full rounded-2xl bg-stone-200/80 animate-pulse" />
          <div className="hidden md:flex gap-3">
            {[1, 2, 3, 4].map((k) => (
              <div
                key={k}
                className="w-24 aspect-square rounded-xl bg-stone-200/70 animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="h-4 w-24 rounded bg-stone-200/80 animate-pulse" />
          <div className="h-10 md:h-12 w-4/5 max-w-md rounded bg-stone-200/80 animate-pulse" />
          <div className="h-4 w-48 rounded bg-stone-200/60 animate-pulse" />
          <div className="flex gap-3 pt-2">
            <div className="h-12 w-20 rounded-lg bg-stone-200/70 animate-pulse" />
            <div className="h-12 w-20 rounded-lg bg-stone-200/70 animate-pulse" />
            <div className="h-12 w-20 rounded-lg bg-stone-200/70 animate-pulse" />
          </div>
          <div className="h-14 w-40 rounded-lg bg-stone-200/80 animate-pulse" />
          <div className="space-y-2 pt-4">
            <div className="h-3 w-full rounded bg-stone-200/50 animate-pulse" />
            <div className="h-3 w-full rounded bg-stone-200/50 animate-pulse" />
            <div className="h-3 w-5/6 rounded bg-stone-200/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
