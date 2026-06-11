export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import PageLayout from "@/components/PageLayout"
import TagPageClient from "./[slug]/TagPageClient"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "タグ一覧 | Fashion Database",
    description: "ファッションデータベースに登録されているタグ別の投稿アーカイブを閲覧できます。",
    alternates: { canonical: "https://fashdb.com/tags" },
  }
}

export default async function TagsPage() {
  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "タグ" },
  ]

  return (
    <PageLayout title="Tags" subtitle="タグ" breadcrumbs={breadcrumbs}>
      <TagPageClient />
    </PageLayout>
  )
}