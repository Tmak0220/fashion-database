export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import PageLayout from "@/components/PageLayout"
import ContentRenderer from "@/components/ContentRenderer"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "使い方 | Fashion Database",
    description: "ファッションデータベースの使い方や投稿ガイドライン、ルールについてご確認いただけます。",
    alternates: { canonical: "https://fashdb.com/guide" },
  }
}

export default async function GuidePage() {
  const { data: item, error } = await supabase
    .from("site_contents")
    .select("title, content, type")
    .eq("key", "guide")
    .eq("lang", "ja")
    .maybeSingle()

  if (error || !item) {
    console.error(error)
    notFound()
  }

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "使い方" },
  ]

  return (
    <PageLayout
      title="Guide"
      subtitle={item.title}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <ContentRenderer 
          content={item.content} 
          type={item.type as "text" | "markdown" | "html"} 
        />
      </div>
    </PageLayout>
  )
}