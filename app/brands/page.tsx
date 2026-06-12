export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CardSection from "@/components/CardSection"
import HistoryDrawerItem from "@/components/HistoryDrawerItem"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ブランド一覧 | Fashion Database",
    description: "ファッションデータベースに登録されているブランドを、地域・国別に探すことができます。",
    alternates: { canonical: "https://fashdb.com/brands" },
  }
}

type HistoryItem = {
  title: string
  content: string
  order: number
  type?: 'text' | 'markdown' | 'html'
}

export default async function BrandsPage() {
  const [{ data: regions }, { data: contents }] = await Promise.all([
    supabase.from("regions").select("*").order("name", { ascending: true }),
    supabase
      .from("site_contents")
      .select("key, title, content, order, type, lang")
      .eq("key", "history")
      .eq("lang", "ja"),
  ])

  const history: HistoryItem[] = (contents ?? [])
    .map((item) => ({
      title: item.title,
      content: item.content,
      order: item.order ?? 0,
      type: item.type as any,
    }))
    .sort((a, b) => a.order - b.order)

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "ブランド" },
  ]

  return (
    <PageLayout 
      title="Brands" 
      subtitle="ブランド"
      breadcrumbs={breadcrumbs}
    >
      {/* 以下の div に max-w-2xl と mx-auto を追加して中央寄せ・幅制限をかけます */}
      <div className="space-y-4 mb-16 max-w-2xl mx-auto"> 
        {history.map((item, index) => (
          <HistoryDrawerItem 
            key={index} 
            title={item.title} 
            content={item.content} 
          />
        ))}
      </div>

      <CardSection
        title="Regions"
        titleJa="地域"
        items={regions}
        basePath="/brands"
      />
    </PageLayout>
  )
}