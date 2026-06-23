import React from "react"

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16 pb-0 sm:pb-0 md:pb-0 lg:pb-0">
        <div className="flex items-center justify-between gap-4 min-h-[40px]">
          <div className="h-3 bg-foreground/[0.08] rounded w-24"></div>
          <div className="h-9 border border-border rounded-xl bg-surface px-10 sm:px-12"></div>
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col">
          <div className="h-10 sm:h-12 md:h-16 bg-foreground/[0.08] rounded w-3/4 max-w-md"></div>
          <div className="mt-4 h-4 bg-foreground/[0.08] rounded w-1/3 max-w-[180px]"></div>
        </div>
      </section>

      <section className="px-6 mt-16 mb-28 sm:px-10 sm:mt-24 sm:mb-32 md:px-14 md:mt-28 md:mb-36 lg:px-16">
        <div className="w-full bg-white/[0.2] backdrop-blur-[8px] rounded-3xl px-6 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-9 md:px-10 md:pt-7 md:pb-10 shadow-[0_8px_32px_0_rgba(0,0,0,0.01)] border border-white/[0.2]">
          <div className="-mt-9 sm:-mt-10 md:-mt-11">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-border bg-surface rounded-xl p-6 h-28 flex flex-col justify-center items-center space-y-2">
                  <div className="h-4 bg-foreground/[0.08] rounded w-3/4"></div>
                  <div className="h-3 bg-foreground/[0.08] rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 sm:px-10 md:px-14 lg:px-16">
        <div className="mb-8 space-y-2">
          <div className="h-8 bg-foreground/[0.08] rounded w-48"></div>
          <div className="h-3 bg-foreground/[0.08] rounded w-20"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-b border-border pb-6 space-y-3">
              <div className="h-5 bg-foreground/[0.08] rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
                <div className="h-4 bg-foreground/[0.08] rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}