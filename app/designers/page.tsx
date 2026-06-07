export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CardSection from "@/components/CardSection"
import HistoryAccordion from "@/components/HistoryAccordion"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "デザイナー一覧 | Fashion Database",
    description: "ファッションデータベースに登録されているデザイナーを、地域・国別に探すことができます。",
    alternates: { canonical: "https://fashdb.com/designers" },
  }
}

type HistoryItem = {
  title: string
  content: string
  order: number
  type?: 'text' | 'markdown' | 'html'
}

export default async function DesignersPage() {
  const [{ data: regions }, { data: contents }] = await Promise.all([
    supabase.from("regions").select("*").order("name", { ascending: true }),
    supabase
      .from("site_contents")
      .select("key, title, content, order, type")
      .eq("key", "history"),
  ])

  const history: HistoryItem[] = (contents ?? [])
    .map((item) => ({
      title: item.title,
      content: item.content,
      order: item.order ?? 0,
      type: item.type as any,
    }))
    .sort((a, b) => a.order - b.order)

  return (
    <PageLayout title="Designers" subtitle="デザイナー">
      <HistoryAccordion items={history} />
      <CardSection
        title="Regions"
        titleJa="地域"
        items={regions}
        basePath="/designers"
      />
    </PageLayout>
  )
}