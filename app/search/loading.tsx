export default function Loading() {
    return (
      <main className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-pulse">
        <div className="h-3 w-12 bg-neutral-200 rounded" />
        <div className="mt-2 sm:mt-4 h-10 sm:h-12 w-40 sm:w-52 bg-neutral-200 rounded" />
        <div className="mt-2 h-4 sm:h-5 w-24 sm:w-32 bg-neutral-200 rounded" />
  
        <div className="mt-12 sm:mt-16 space-y-16 sm:space-y-20">
          <section>
            <div className="border-b border-border pb-3">
              <div className="h-5 w-20 bg-neutral-200 rounded mb-1" />
              <div className="h-3 w-14 bg-neutral-200 rounded" />
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-28 sm:w-36 bg-neutral-200 rounded-xl" />
              ))}
            </div>
          </section>
  
          <section>
            <div className="border-b border-border pb-3">
              <div className="h-5 w-20 bg-neutral-200 rounded mb-1" />
              <div className="h-3 w-14 bg-neutral-200 rounded" />
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-[74px] sm:h-[82px] w-full bg-neutral-200 rounded-xl" />
              ))}
            </div>
          </section>
  
          <section>
            <div className="border-b border-border pb-3">
              <div className="h-5 w-20 bg-neutral-200 rounded mb-1" />
              <div className="h-3 w-14 bg-neutral-200 rounded" />
            </div>
            <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2.5 sm:space-y-3.5">
                  <div className="w-full aspect-[4/5] bg-neutral-200 rounded-xl sm:rounded-2xl" />
                  <div className="px-0.5 sm:px-1 space-y-1.5">
                    <div className="h-3.5 w-11/12 bg-neutral-200 rounded" />
                    <div className="h-3.5 w-2/3 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }