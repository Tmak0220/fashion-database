export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import DesignerPageClient from "./DesignerPageClient"
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
  
  const { data: designer } = await supabase
    .from("designers")
    .select(`
      name, name_ja,
      countries ( id, name, name_ja, slug ),
      designer_histories!designer_id (content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!designer) return { title: "Designer Not Found" }

  const histories = (designer.designer_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "designer" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const historyContent = sortedHistories[0]?.content
  
  const title = designer.name_ja ? `${designer.name_ja} (${designer.name}) - FASHION DATABASE` : `${designer.name} - FASHION DATABASE`
  
  const countryObj = firstRelation(designer.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const countryNameJa = countryObj ? (countryObj.name_ja || countryObj.name) : "不明"
  const description = historyContent 
    ? historyContent.slice(0, 120) 
    : `${countryNameJa}を拠点とするデザイナー。コレクションやアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: await localizedAlternates(`/designers/${region}/${country}/${slug}`),
  }
}

export default async function Page({ params }: Props) {
  const { region, country, slug } = await params

  const { data: designer } = await supabase
    .from("designers")
    .select(`
      id, name, name_ja, slug, country_id,
      countries ( id, name, name_ja, slug ),
      regions ( id, name, name_ja, slug ),
      designer_histories!designer_id (title, content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!designer) notFound()

  const histories = (designer.designer_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "designer" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const designerWithHistories = {
    id: designer.id,
    name: designer.name,
    name_ja: designer.name_ja,
    slug: designer.slug,
    designer_histories: sortedHistories
  }

  const { data: relatedDesigners } = await supabase
    .from("designers")
    .select("id, name, name_ja, slug")
    .eq("country_id", designer.country_id)
    .neq("slug", designer.slug)

  const sanitizedRelatedDesigners = (relatedDesigners || [])
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 4)
    .map((d) => ({ ...d, region_slug: region, country_slug: country }))

  const countryData = firstRelation(designer.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionData = firstRelation(designer.regions as unknown as PlaceRecord | PlaceRecord[] | null)

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "デザイナー", href: "/designers" },
    { 
      label: regionData?.name_ja || regionData?.name || region, 
      href: `/designers/${region}` 
    },
    { 
      label: countryData?.name_ja || countryData?.name || country, 
      href: `/designers/${region}/${country}` 
    },
    { label: designer.name_ja || designer.name },
  ]

  return (
    <PageLayout
      title={designer.name}
      subtitle={designer.name_ja}
      breadcrumbs={breadcrumbs}
    >
      <DesignerPageClient 
        designer={designerWithHistories}
        relatedDesigners={sanitizedRelatedDesigners} 
      />
    </PageLayout>
  )
}
