import { Suspense } from "react"
import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "検索 - FASHION DATABASE",
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="p-10 text-sm text-muted">読み込み中...</main>}>
      <SearchContent />
    </Suspense>
  )
}