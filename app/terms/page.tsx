export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import { notFound } from "next/navigation"
import PageLayout from "@/components/PageLayout"
import ContentRenderer from "@/components/ContentRenderer"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "利用規約 | Fashion Database",
    description: "ファッションデータベースの利用規約についてご確認いただけます。",
    alternates: { canonical: "https://fashdb.com/terms" },
  }
}

export default async function TermsPage() {
  const { data: item, error } = await supabase
    .from("site_contents")
    .select("title, content, type")
    .eq("key", "terms")
    .eq("lang", "ja")
    .maybeSingle()

  if (error || !item) {
    console.error(error)
    notFound()
  }

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "利用規約" },
  ]

  return (
    <PageLayout
      title="Terms"
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