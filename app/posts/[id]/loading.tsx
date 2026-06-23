export default function PostLoading() {
    return (
      <main className="min-h-screen bg-background animate-pulse">
        <div className="max-w-3xl mx-auto p-6 sm:p-10 md:p-14">
          <div className="w-full aspect-[4/5] bg-neutral-200 rounded-2xl mb-8" />
  
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-neutral-200" />
            <div className="space-y-2">
              <div className="h-2.5 w-10 bg-neutral-200 rounded" />
              <div className="h-4 w-32 bg-neutral-200 rounded" />
            </div>
          </div>
  
          <div className="h-8 w-3/4 bg-neutral-200 rounded mb-6" />
  
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="h-4 w-12 bg-neutral-200 rounded" />
            <div className="h-4 w-16 bg-neutral-200 rounded" />
            <div className="h-4 w-24 bg-neutral-200 rounded" />
          </div>
  
          <div className="space-y-3 mb-10">
            <div className="h-4 w-full bg-neutral-200 rounded" />
            <div className="h-4 w-5/6 bg-neutral-200 rounded" />
          </div>
  
          <div className="flex gap-3">
            <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
            <div className="flex-grow h-12 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </main>
    );
  }