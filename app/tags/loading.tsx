export default function TagsLoading() {
  return (
    <div className="w-full min-h-screen bg-[#fbfaf7] text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-6 sm:pt-10 pb-16 space-y-12">
        
        <div className="space-y-2 animate-pulse">
          <div className="h-9 sm:h-11 bg-neutral-200/60 rounded-lg w-32 sm:w-40" />
          <div className="h-4 bg-neutral-200/50 rounded w-10" />
        </div>

        <div className="border-b border-neutral-200/60 pb-4" />

        {[1, 2].map((section) => (
          <div key={section} className="space-y-6 sm:space-y-8">
            
            <div className="space-y-2 animate-pulse">
              <div className="h-7 sm:h-9 bg-neutral-200/60 rounded-md w-24 sm:w-32" />
              <div className="h-4 bg-neutral-200/50 rounded w-12" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="space-y-3 animate-pulse">
                  
                  <div className="w-full aspect-[4/5] bg-neutral-200/60 rounded-2xl border border-neutral-200/30" />
                  
                  <div className="space-y-1.5 px-1">
                    <div className="h-3.5 bg-neutral-200/60 rounded w-11/12" />
                    <div className="h-3.5 bg-neutral-200/40 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}