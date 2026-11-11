import { Suspense } from "react"
import BookmarkPageClient from "./BookmarkPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ブックマーク一覧 - FASHION DATABASE",
  description: "ブックマークしたアーカイブを一覧で管理できます。",
  robots: { index: false, follow: false },
}

export default function BookmarksPage() {
  return (
    <Suspense>
      <BookmarkPageClient />
    </Suspense>
  )
}
