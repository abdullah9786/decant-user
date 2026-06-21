export default function CategoriesLoading() {
  return (
    <div className="py-20 bg-white animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-9 w-72 max-w-[80%] mx-auto rounded bg-slate-200 mb-4" />
        <div className="h-3 w-56 max-w-[60%] mx-auto rounded bg-slate-100 mb-16" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-emerald-50 bg-slate-100 h-64 md:h-72"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
