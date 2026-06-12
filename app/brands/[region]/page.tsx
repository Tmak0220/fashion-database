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

  const regionName = regionData ? (regionData.name_ja || regionData.name) : "地域"

  return {
    title: `${regionName}のブランド一覧 | Fashion Database`,
    description: `${regionName}に属するブランドや国別のアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/brands/${region}`,
    },
  }
}

export default async function RegionPage({ params }: Props) {
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
      .select("title, content, order") 
      .eq("region_id", regionData.id)
      .eq("key", "brand")
      .eq("lang", "ja")
      .eq("is_visible", true)
      .order("order", { ascending: true }),
    supabase
      .from("countries")
      .select("*")
      .eq("region_slug", region)
      .order("name", { ascending: true }),
  ])

  const history = (historyResult.data ?? []).sort((a, b) => a.order - b.order)

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "ブランド", href: "/brands" },
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
        basePath={`/brands/${region}`}
      />
    </PageLayout>
  )
}