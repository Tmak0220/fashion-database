import React from "react"

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="h-3 bg-foreground/[0.08] rounded w-56 mb-6"></div>

      <div className="flex flex-col mb-12">
        <div className="h-12 sm:h-16 md:h-20 bg-foreground/[0.08] rounded w-1/2 max-w-[240px]"></div>
        <div className="mt-3 h-4 bg-foreground/[0.08] rounded w-16"></div>
      </div>

      <section className="max-w-5xl mx-auto mb-16">
        <div className="border border-border bg-surface rounded-3xl p-8 sm:p-10 h-36 flex flex-col justify-center items-center space-y-3">
          <div className="h-4 bg-foreground/[0.08] rounded w-2/3 max-w-[280px]"></div>
          <div className="h-0.5 bg-foreground/[0.04] w-12 pt-[1px]"></div>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-8 flex flex-col gap-1.5">
          <div className="h-7 sm:h-8 md:h-9 bg-foreground/[0.08] rounded w-24"></div>
          <div className="h-3 bg-foreground/[0.08] rounded w-10"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="border border-border bg-surface rounded-2xl p-4 h-20 flex flex-col justify-center items-center space-y-2"
            >
              <div className="h-3.5 bg-foreground/[0.08] rounded w-3/4 max-w-[140px]"></div>
              <div className="h-2.5 bg-foreground/[0.08] rounded w-1/2 max-w-[90px]"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}