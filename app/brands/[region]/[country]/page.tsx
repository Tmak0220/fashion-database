export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CardSection from "@/components/CardSection"
import HistoryDrawerItem from "@/components/HistoryDrawerItem"

type Props = {
  params: Promise<{
    region: string
    country: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, country } = await params
  const { data: countryData } = await supabase
    .from("countries")
    .select("name, name_ja")
    .eq("slug", country)
    .single()

  const countryName = countryData ? (countryData.name_ja || countryData.name) : "国"

  return {
    title: `${countryName}のブランド一覧 - FASHION DATABASE`,
    description: `ファッションデータベースに登録されているブランドの中から、${countryName}を拠点とするブランドのアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/brands/${region}/${country}`,
    },
  }
}

export default async function CountryPage({ params }: Props) {
  const { region, country } = await params

  // 1. まずURLのスラッグから国と地域のデータを並列で取得
  const [countryResult, regionResult] = await Promise.all([
    supabase
      .from("countries")
      .select("*")
      .eq("slug", country)
      .single(),
    supabase
      .from("regions")
      .select("id, name, name_ja") // 後の条件のために id も取得
      .eq("slug", region)
      .single()
  ])

  const countryData = countryResult.data
  const regionData = regionResult.data

  if (!countryData || !regionData) notFound()

  // 2. 確定した各IDをベースに、歴史と所属ブランド一覧を並列で取得
  const [historyResult, brandsResult] = await Promise.all([
    supabase
      .from("country_histories")
      .select("title, content, order") 
      .eq("country_id", countryData.id)
      .eq("key", "brand")
      .eq("lang", "ja")
      .eq("is_visible", true)
      .order("order", { ascending: true }),
    
    // 【修正箇所】スラッグではなく、一貫性のあるIDでブランドを絞り込む
    supabase
      .from("brands")
      .select("id, name, name_ja, slug")
      .eq("region_id", regionData.id)
      .eq("country_id", countryData.id)
      .order("name", { ascending: true }),
  ])

  const history = historyResult.data ?? []

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "ブランド", href: "/brands" },
    { label: regionData.name_ja || regionData.name, href: `/brands/${region}` },
    { label: countryData.name_ja || countryData.name },
  ]

  return (
    <PageLayout 
      title={countryData.name} 
      subtitle={countryData.name_ja}
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
        title="Brands"
        titleJa="ブランド"
        items={brandsResult.data ?? []}
        basePath={`/brands/${region}/${country}`}
        uppercase={true}
      />
    </PageLayout>
  )
}