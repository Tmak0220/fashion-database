"use client"

import React from "react"

const BookmarkLoading = () => {
  return (
    <main className="max-w-6xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl tracking-[0.12em] font-medium text-foreground uppercase flex flex-col gap-1">
            BOOKMARK
            <span className="text-[10px] tracking-[0.05em] font-normal text-muted lowercase">
              ブックマーク
            </span>
          </h1>
          <div className="h-4 w-28 bg-neutral-200 rounded-md mt-3" />
        </div>
        <div className="h-8 w-20 bg-neutral-200 rounded-xl hidden sm:block" />
      </div>

      <div className="mt-8 flex gap-6 border-b border-border pb-3 overflow-x-auto no-scrollbar">
        {["すべて", "ブランド別", "デザイナー別", "タグ別"].map((_, idx) => (
          <div key={idx} className="h-5 w-16 bg-neutral-200 rounded-md flex-shrink-0" />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-border bg-neutral-100 aspect-[4/5] relative w-full" />
            <div className="space-y-1.5 px-1">
              <div className="h-3 w-1/3 bg-neutral-200 rounded" />
              <div className="h-4 w-3/4 bg-neutral-200 rounded" />
              <div className="h-3 w-1/4 bg-neutral-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}

export default BookmarkLoading