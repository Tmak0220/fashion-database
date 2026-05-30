"use client"

import { Suspense } from "react"
import SearchContent from "./SearchContent"

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="p-10">Loading...</main>}>
      <SearchContent />
    </Suspense>
  )
}