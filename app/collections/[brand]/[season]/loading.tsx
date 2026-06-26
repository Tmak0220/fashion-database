export default function CollectionSeasonLoading() {
    const skeletonItems = Array.from({ length: 8 })
  
    return (
      <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full min-h-screen">
        <div className="animate-pulse flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
          <div className="h-3 w-8 bg-neutral-100 rounded" />
          <span>/</span>
          <div className="h-3 w-20 bg-neutral-100 rounded" />
          <span>/</span>
          <div className="h-3 w-16 bg-neutral-100 rounded" />
          <span>/</span>
          <div className="h-3 w-12 bg-neutral-100 rounded" />
        </div>
  
        <section className="border-b border-border/40 pb-14">
          <div className="animate-pulse space-y-3">
            <div className="h-10 sm:h-12 md:h-14 w-80 bg-neutral-100 rounded-lg" />
            <div className="h-3 w-32 bg-neutral-100/80 rounded" />
          </div>
        </section>
  
        <section className="mt-20">
          <div className="flex items-end justify-between gap-6 mb-12 border-b border-border/40 pb-4">
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-44 bg-neutral-100 rounded-md" />
              <div className="h-3 w-28 bg-neutral-100/80 rounded" />
            </div>
            <div className="animate-pulse h-3 w-14 bg-neutral-100 rounded" />
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {skeletonItems.map((_, index) => (
              <article key={index} className="animate-pulse space-y-4">
                <div className="w-full aspect-[4/5] rounded-xl border border-border/40 bg-neutral-50" />
                <div className="space-y-2 px-1">
                  <div className="h-3 w-12 bg-neutral-100 rounded" />
                  <div className="h-4 w-36 bg-neutral-100/80 rounded" />
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    )
  }