export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-[3px] border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">Loading</p>
      </div>
    </div>
  );
}
