import React from "react"

export default function Loading() {
  return (
    <main className="min-h-screen animate-pulse p-6 sm:p-10 md:p-14 lg:p-16">
      <div className="h-3 bg-foreground/[0.08] rounded w-64 mb-6"></div>

      <div className="flex flex-col mb-8">
        <div className="h-12 sm:h-16 md:h-20 bg-foreground/[0.08] rounded w-2/3 max-w-[340px]"></div>
        <div className="mt-3 h-4 bg-foreground/[0.08] rounded w-24"></div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-8 mb-12 max-w-5xl mx-auto">
        <div className="space-y-1.5">
          <div className="h-2.5 bg-foreground/[0.08] rounded w-16"></div>
          <div className="h-6 bg-foreground/[0.08] rounded w-8"></div>
        </div>
        <div className="h-10 border border-border rounded-xl bg-surface px-10 sm:px-12"></div>
      </div>

      <section className="max-w-3xl mx-auto space-y-12">
        <div className="flex flex-col items-center gap-1.5">
          <div className="h-7 sm:h-8 bg-foreground/[0.08] rounded w-28"></div>
          <div className="h-3 bg-foreground/[0.08] rounded w-8"></div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-11/12"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-5/6"></div>
        </div>

        <div className="space-y-4 pt-4">
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-full"></div>
          <div className="h-4 bg-foreground/[0.08] rounded w-3/4"></div>
        </div>
      </section>
    </main>
  )
}