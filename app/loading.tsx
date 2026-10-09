export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 pt-24">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}
