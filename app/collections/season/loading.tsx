export default function AllSeasonsLoading() {
    const skeletonItems = Array.from({ length: 10 })
  
    return (
      <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full">
        <div className="animate-pulse flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
          <div className="h-3 w-8 bg-neutral-100 rounded" />
          <span>/</span>
          <div className="h-3 w-20 bg-neutral-100 rounded" />
          <span>/</span>
          <div className="h-3 w-12 bg-neutral-100 rounded" />
        </div>
  
        <section className="border-b border-border/40 pb-14">
          <div className="animate-pulse space-y-3">
            <div className="h-10 sm:h-12 md:h-14 w-56 bg-neutral-100 rounded-lg" />
            <div className="h-3 w-32 bg-neutral-100/80 rounded" />
          </div>
        </section>
  
        <section className="mt-20">
          <div className="mb-12 border-b border-border/40 pb-4">
            <div className="animate-pulse space-y-2">
              <div className="h-6 w-52 bg-neutral-100 rounded-md" />
              <div className="h-3 w-32 bg-neutral-100/80 rounded" />
            </div>
          </div>
  
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {skeletonItems.map((_, index) => (
              <div
                key={index}
                className="animate-pulse flex flex-col justify-between p-6 border border-border/60 bg-neutral-50 rounded-xl aspect-square"
              >
                <div className="h-3 w-8 bg-neutral-100 rounded" />
                <div className="space-y-2">
                  <div className="h-8 w-20 bg-neutral-100 rounded-md" />
                  <div className="h-4 w-12 bg-neutral-100/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }