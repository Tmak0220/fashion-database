import { Suspense } from "react"
import BookmarkPageClient from "./BookmarkPageClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "BOOKMARKS - ブックマーク一覧",
  description: "ブックマークしたアーカイブを一覧で管理できます。",
}

export default function BookmarksPage() {
  return (
    <Suspense fallback={<main className="p-10 text-sm text-muted">読み込み中...</main>}>
      <BookmarkPageClient />
    </Suspense>
  )
}