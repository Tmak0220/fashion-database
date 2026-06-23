import { Suspense } from "react"
import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "検索 - FASHION DATABASE",
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}