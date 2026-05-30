export default function BrandsLoading() {
  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="animate-pulse">
        <div className="h-3 w-24 bg-neutral-200 rounded" />
        <div className="mt-8 h-12 w-72 bg-neutral-200 rounded" />
        <div className="mt-4 h-4 w-48 bg-neutral-200 rounded" />
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="w-full aspect-[4/5] bg-neutral-200 rounded-2xl" />
            <div className="h-4 w-32 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
    </main>
  )
}