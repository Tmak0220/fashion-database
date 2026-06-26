export default function GroupsLoading() {
    const skeletonCards = Array.from({ length: 9 })
  
    return (
      <main className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 min-h-screen">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="h-9 sm:h-12 md:h-16 w-48 bg-neutral-100 rounded-lg" />
          <div className="h-4 sm:h-5 w-72 bg-neutral-100 rounded-md" />
        </div>
  
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {skeletonCards.map((_, index) => (
            <div
              key={index}
              className="animate-pulse border border-border bg-white rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="h-6 sm:h-7 w-32 bg-neutral-100 rounded-md" />
              
              <div className="border-t border-neutral-100/60" />
  
              <div className="border border-neutral-100 bg-neutral-50/30 rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                    <div className="h-4 w-16 bg-neutral-100 rounded" />
                    <div className="h-3 w-10 bg-neutral-100/80 rounded" />
                  </div>
                  <div className="w-5 h-5 bg-neutral-100 rounded-md" />
                </div>
  
                <div className="space-y-3 pt-2">
                  <div className="h-4 w-28 bg-neutral-100 rounded" />
                  <div className="h-4 w-20 bg-neutral-100 rounded" />
                  <div className="h-4 w-24 bg-neutral-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }