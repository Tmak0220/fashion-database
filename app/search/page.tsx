import { Suspense } from "react"
import SearchContent from "./SearchContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "検索 - FASHION DATABASE",
  description: "ブランド、デザイナー、投稿を検索できます。",
  robots: { index: false, follow: true },
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  )
}
