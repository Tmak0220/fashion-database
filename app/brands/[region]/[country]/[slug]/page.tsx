export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import BrandPageClient from "./BrandPageClient"
import { localizedAlternates } from "@/lib/locale-server"

type Props = {
  params: Promise<{
    region: string
    country: string
    slug: string
  }>
}

type HistoryRecord = {
  title?: string | null
  content: string | null
  sort_order: number | null
  key: string | null
  lang: string | null
  is_visible: boolean | null
}

type PlaceRecord = {
  name: string
  name_ja: string | null
  slug: string
}

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, country, slug } = await params
  
  const { data: brand } = await supabase
    .from("brands")
    .select(`
      name, name_ja,
      countries ( id, name, name_ja, slug ),
      brand_histories!brand_id (content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!brand) return { title: "Brand Not Found" }

  const histories = (brand.brand_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "brand" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const historyContent = sortedHistories[0]?.content
  
  const title = brand.name_ja ? `${brand.name_ja} (${brand.name}) - FASHION DATABASE` : `${brand.name} - FASHION DATABASE`
  
  const countryObj = firstRelation(brand.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const countryNameJa = countryObj ? (countryObj.name_ja || countryObj.name) : "不明"
  const description = historyContent 
    ? historyContent.slice(0, 120) 
    : `${countryNameJa}のブランド。コレクションやアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: await localizedAlternates(`/brands/${region}/${country}/${slug}`),
  }
}

export default async function Page({ params }: Props) {
  const { region, country, slug } = await params

  const { data: brand } = await supabase
    .from("brands")
    .select(`
      id, name, name_ja, slug, country_id,
      countries ( id, name, name_ja, slug ),
      regions ( id, name, name_ja, slug ),
      brand_histories!brand_id (title, content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!brand) notFound()

  const histories = (brand.brand_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "brand" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const brandWithHistories = {
    id: brand.id,
    name: brand.name,
    name_ja: brand.name_ja,
    slug: brand.slug,
    brand_histories: sortedHistories
  }

  const { data: relatedBrands } = await supabase
    .from("brands")
    .select("id, name, name_ja, slug")
    .eq("country_id", brand.country_id)
    .neq("slug", brand.slug)

  const sanitizedRelatedBrands = (relatedBrands || [])
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 4)
    .map((b) => ({ ...b, region_slug: region, country_slug: country, image_url: null }))

  const countryData = firstRelation(brand.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionData = firstRelation(brand.regions as unknown as PlaceRecord | PlaceRecord[] | null)

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "ブランド", href: "/brands" },
    { 
      label: regionData?.name_ja || regionData?.name || region, 
      href: `/brands/${region}` 
    },
    { 
      label: countryData?.name_ja || countryData?.name || country, 
      href: `/brands/${region}/${country}` 
    },
    { label: brand.name_ja || brand.name },
  ]

  return (
    <PageLayout
      title={brand.name}
      subtitle={brand.name_ja}
      breadcrumbs={breadcrumbs}
    >
      <BrandPageClient 
        brand={brandWithHistories}
        relatedBrands={sanitizedRelatedBrands} 
      />
    </PageLayout>
  )
}
