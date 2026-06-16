export default function CategoryDetailLoading() {
  return (
    <div className="bg-white min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="relative h-72 md:h-72 overflow-hidden bg-slate-200">
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto space-y-3">
          <div className="h-3 w-48 rounded bg-white/30" />
          <div className="h-9 w-64 max-w-[80%] rounded bg-white/40" />
          <div className="h-4 w-96 max-w-full rounded bg-white/25" />
        </div>
      </div>

      {/* Product grid skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 -mx-4 px-2 md:-mx-7 md:px-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-slate-100" />
              <div className="h-3 w-16 rounded bg-slate-100" />
              <div className="h-4 w-full rounded bg-slate-100" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
