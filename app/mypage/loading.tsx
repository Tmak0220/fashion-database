export default function MyPageLoading() {
    return (
      <main className="min-h-screen bg-background text-foreground animate-pulse">
        <section className="p-6 sm:p-10 md:p-14 lg:p-16 max-w-5xl mx-auto">
          <div className="h-4 w-16 bg-neutral-200 rounded mb-10" />
  
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="h-10 w-48 bg-neutral-200 rounded mb-3" />
              <div className="h-4 w-32 bg-neutral-200 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 bg-neutral-200 rounded-full" />
              <div className="h-10 w-28 bg-neutral-200 rounded-full" />
            </div>
          </div>
  
          <div className="mt-12 space-y-8 max-w-3xl">
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-full bg-neutral-200" />
              <div className="h-10 w-32 bg-neutral-200 rounded-xl" />
            </div>
  
            <div className="space-y-6 pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="h-4 w-24 bg-neutral-200 rounded mb-2" />
                  <div className="h-12 w-full bg-neutral-200 rounded-xl" />
                </div>
              ))}
            </div>
            
            <div className="h-12 w-32 bg-neutral-200 rounded-xl pt-2" />
          </div>
  
          <div className="border-t border-neutral-200 my-16" />
  
          <div>
            <div className="h-6 w-20 bg-neutral-200 rounded mb-8" />
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="w-full aspect-[4/5] bg-neutral-200 rounded-2xl" />
                  <div className="space-y-2 pl-1">
                    <div className="h-3 w-3/4 bg-neutral-200 rounded" />
                    <div className="h-3 w-1/2 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    )
  }