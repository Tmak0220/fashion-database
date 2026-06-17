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

  const countryName = countryData
    ? (countryData.name_ja || countryData.name)
    : "国"

  return {
    title: `${countryName}のデザイナー一覧 - FASHION DATABASE`,
    description: `ファッションデータベースに登録されているデザイナーの中から、${countryName}を拠点とするデザイナーのアーカイブを閲覧できます。`,
    alternates: {
      canonical: `https://fashdb.com/designers/${region}/${country}`,
    },
  }
}

export default async function CountryPage({ params }: Props) {
  const { region, country } = await params

  const [countryResult, regionResult] = await Promise.all([
    supabase
      .from("countries")
      .select("*")
      .eq("slug", country)
      .single(),

    supabase
      .from("regions")
      .select("name, name_ja")
      .eq("slug", region)
      .single(),
  ])

  const countryData = countryResult.data
  const regionData = regionResult.data

  if (!countryData || !regionData) notFound()

  const [historyResult, designersResult] = await Promise.all([
    supabase
      .from("country_histories")
      .select("title, content, order")
      .eq("country_id", countryData.id)
      .eq("key", "designer")
      .eq("lang", "ja")
      .eq("is_visible", true)
      .order("order", { ascending: true }),

    supabase
      .from("designers")
      .select("id, name, name_ja, slug")
      .eq("region_slug", region)
      .eq("country_slug", country)
      .order("name", { ascending: true }),
  ])

  const history = (historyResult.data ?? []).sort(
    (a, b) => a.order - b.order
  )

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "デザイナー", href: "/designers" },
    {
      label: regionData.name_ja || regionData.name,
      href: `/designers/${region}`,
    },
    {
      label: countryData.name_ja || countryData.name,
    },
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
        title="Designers"
        titleJa="デザイナー"
        items={designersResult.data ?? []}
        basePath={`/designers/${region}/${country}`}
        uppercase={true}
      />
    </PageLayout>
  )
}