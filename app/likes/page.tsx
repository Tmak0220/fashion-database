import LikePageClient from "./LikePageClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "MY FAVORITES - お気に入り一覧",
  description: "お気に入りしたアーカイブを一覧で管理できます。",
}

export default function LikesPage() {
  return <LikePageClient />
}