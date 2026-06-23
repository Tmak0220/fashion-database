"use client"

import React from "react"

const EditPostLoading = () => {
  return (
    <main className="max-w-4xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-pulse">
      <div className="border-b border-border/30 pb-6 mb-10">
        <span className="text-[9px] tracking-[0.14em] text-neutral-300 font-medium block leading-none mb-2">
          EDIT POST
        </span>
        <h1 className="text-2xl tracking-[0.12em] font-medium text-foreground uppercase flex flex-col gap-1">
          EDIT
          <span className="text-[10px] tracking-[0.05em] font-normal text-muted lowercase">
            投稿内容の編集
          </span>
        </h1>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:max-w-2xl">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="space-y-2">
              <div className="w-full aspect-[4/5] bg-neutral-100 rounded-2xl border border-border" />
              <div className="h-3 w-10 bg-neutral-200 rounded mx-1" />
            </div>
          ))}
        </div>

        <div className="h-9 w-28 bg-neutral-100 border border-border rounded-xl" />

        {["TITLE", "DESCRIPTION"].map((label) => (
          <div key={label} className="space-y-2">
            <div className="h-3 w-16 bg-neutral-200 rounded" />
            <div className={`w-full bg-neutral-50 border border-border/60 rounded-xl ${
              label === "DESCRIPTION" ? "h-24" : "h-11"
            }`} />
          </div>
        ))}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {["BRAND", "YEAR"].map((label) => (
            <div key={label} className="space-y-2">
              <div className="h-3 w-12 bg-neutral-200 rounded" />
              <div className="w-full h-11 bg-neutral-50 border border-border/60 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="h-3 w-12 bg-neutral-200 rounded" />
          <div className="flex gap-2">
            <div className="h-8 w-12 bg-neutral-100 border border-border rounded-lg" />
            <div className="h-8 w-12 bg-neutral-100 border border-border rounded-lg" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-3 w-10 bg-neutral-200 rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div key={idx} className="h-7 w-16 bg-neutral-50 border border-border/60 rounded-full" />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <div className="h-10 w-24 bg-neutral-100 border border-border rounded-xl" />
          <div className="h-10 w-24 bg-neutral-100 border border-border rounded-xl" />
        </div>
      </div>
    </main>
  )
}

export default EditPostLoading