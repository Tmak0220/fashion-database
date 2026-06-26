export default function CollectionsLoading() {
    return (
      <main className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 min-h-screen">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="h-9 sm:h-12 md:h-16 w-72 bg-neutral-100 rounded-lg" />
          <div className="h-4 sm:h-5 w-56 bg-neutral-100 rounded-md" />
        </div>
  
        <div className="mt-12 sm:mt-16 space-y-8 sm:space-y-12">
          <div className="animate-pulse border border-border bg-white rounded-2xl p-6 sm:p-8 md:p-10 space-y-6">
            <div className="space-y-2">
              <div className="h-6 sm:h-7 w-40 bg-neutral-100 rounded-md" />
              <div className="h-3 w-24 bg-neutral-100/80 rounded" />
            </div>
            <div className="border-t border-neutral-100/60" />
            <div className="h-4 w-48 bg-neutral-50 rounded" />
          </div>
  
          <div className="animate-pulse border border-border bg-white rounded-2xl p-6 sm:p-8 md:p-10 space-y-6">
            <div className="space-y-2">
              <div className="h-6 sm:h-7 w-48 bg-neutral-100 rounded-md" />
              <div className="h-3 w-44 bg-neutral-100/80 rounded" />
            </div>
            <div className="border-t border-neutral-100/60" />
            <div className="h-4 w-48 bg-neutral-50 rounded" />
          </div>
        </div>
      </main>
    )
  }