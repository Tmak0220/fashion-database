export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CardSection from "@/components/CardSection"
import HistoryDrawerItem from "@/components/HistoryDrawerItem"

type Props = {
  params: Promise<{ region: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region } = await params

  const { data: regionData } = await supabase
    .from("regions")
    .select("name, name_ja")
    .eq("slug", region)
    .single()

  const regionName = regionData
    ? (regionData.name_ja || regionData.name)
    : "地域"

  return {
    title: `${regionName}のデザイナー一覧 - FASHION DATABASE`,
    description: `${regionName}に属するデザイナーや国別のアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/designers/${region}`,
    },
  }
}

export default async function DesignersRegionPage({ params }: Props) {
  const { region } = await params

  const { data: regionData } = await supabase
    .from("regions")
    .select("*")
    .eq("slug", region)
    .single()

  if (!regionData) notFound()

  const [historyResult, countriesResult] = await Promise.all([
    supabase
      .from("region_histories")
      .select("title, content, sort_order")
      .eq("region_id", regionData.id)
      .eq("key", "designer")
      .eq("lang", "ja")
      .eq("is_visible", true)
      .order("sort_order", { ascending: true }),

    supabase
      .from("countries")
      .select("*")
      .eq("region_id", regionData.id)
      .order("name", { ascending: true }),
  ])

  const history = historyResult.data ?? []

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "デザイナー", href: "/designers" },
    { label: regionData.name_ja || regionData.name },
  ]

  return (
    <PageLayout
      title={regionData.name}
      subtitle={regionData.name_ja}
      breadcrumbs={breadcrumbs}
    >
      {history.length > 0 && (
        <div className="mb-16 space-y-4 max-w-2xl mx-auto">
          {history.map((item, index) => (
            <HistoryDrawerItem
              key={index}
              title={item.title ?? "詳細"}
              content={item.content ?? ""}
            />
          ))}
        </div>
      )}

      <CardSection
        title="Countries"
        titleJa="国"
        items={countriesResult.data ?? []}
        basePath={`/designers/${region}`}
      />
    </PageLayout>
  )
}