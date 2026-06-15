export default function BrandsLoading() {
  return (
    <main className="p-6 sm:p-10 md:p-14 lg:p-16" role="status" aria-label="読み込み中">
      <div className="animate-pulse">
        <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="mt-8 h-12 w-72 bg-neutral-200 dark:bg-neutral-700 rounded-lg" />
        <div className="mt-4 h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded" />
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="w-full aspect-[4/5] bg-neutral-200 dark:bg-neutral-700 rounded-2xl" />
            <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        ))}
      </div>
      
      <span className="sr-only">読み込み中...</span>
    </main>
  )
}