import { Suspense } from "react"
import BookmarksPageClient from "./BookmarksPageClient"

export default function BookmarksPage() {
  return (
    <Suspense fallback={<main className="p-10 text-sm text-muted">読み込み中...</main>}>
      <BookmarksPageClient />
    </Suspense>
  )
}