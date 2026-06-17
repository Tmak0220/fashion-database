export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CardSection from "@/components/CardSection"
import HistoryDrawerItem from "@/components/HistoryDrawerItem"
import SectionHeading from "@/components/SectionHeading"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "デザイナー一覧 - FASHION DATABASE",
    description:
      "ファッションデータベースに登録されているデザイナーを、地域・国別に探すことができます。",
    alternates: { canonical: "https://fashdb.com/designers" },
  }
}

type HistoryItem = {
  title: string
  content: string
  order: number
  type?: "text" | "markdown" | "html"
}

export default async function DesignersPage() {
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
    { label: "デザイナー" },
  ]

  return (
    <PageLayout
      title="Designers"
      subtitle="デザイナー"
      breadcrumbs={breadcrumbs}
    >
      <section className="mb-24">
        <SectionHeading
          title="History"
          titleJa="歴史"
          className="mb-6"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {history.map((item, index) => (
            <HistoryDrawerItem
              key={index}
              title={item.title}
              content={item.content}
            />
          ))}
        </div>
      </section>

      <CardSection
        title="Regions"
        titleJa="地域"
        items={regions}
        basePath="/designers"
      />
    </PageLayout>
  )
}