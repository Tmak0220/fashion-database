export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import DesignerPageClient from "./DesignerPageClient"
import { localizedAlternates } from "@/lib/locale-server"
import { permanentRedirect } from "next/navigation"
import { SITE_URL } from "@/lib/site"

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
      regions ( id, name, name_ja, slug ),
      designer_histories!designer_id (content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!designer) return { title: "Designer Not Found" }

  const histories = (designer.designer_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "designer" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const historyContent = sortedHistories[0]?.content
  
  const title = designer.name_ja ? `${designer.name_ja} (${designer.name})｜デザイナー` : `${designer.name}｜デザイナー`
  
  const countryObj = firstRelation(designer.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionObj = firstRelation(designer.regions as unknown as PlaceRecord | PlaceRecord[] | null)
  const canonicalPath = `/designers/${regionObj?.slug || region}/${countryObj?.slug || country}/${slug}`
  const countryNameJa = countryObj ? (countryObj.name_ja || countryObj.name) : "不明"
  const description = historyContent 
    ? historyContent.slice(0, 120) 
    : `${countryNameJa}を拠点とするデザイナー。コレクションやアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: await localizedAlternates(canonicalPath),
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
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

  const [relatedDesignersResult, brandsResult, collectionsResult, postsResult] = await Promise.all([
    supabase
      .from("designers")
      .select("id, name, name_ja, slug")
      .eq("country_id", designer.country_id)
      .neq("slug", designer.slug),
    supabase
      .from("brand_designers")
      .select("*, brands!brand_designers_brand_id_fkey (*)")
      .eq("designer_id", designer.id)
      .order("start_year", { ascending: true }),
    supabase
      .from("collections")
      .select("id, year, season, label, brands!collections_brand_id_fkey(slug)")
      .eq("designer_id", designer.id)
      .order("year", { ascending: true }),
    supabase
      .from("posts")
      .select("id, image_urls, title, brands!posts_brand_id_fkey(slug)")
      .eq("designer_id", designer.id)
      .order("created_at", { ascending: false }),
  ])

  const relatedDesigners = relatedDesignersResult.data

  const sanitizedRelatedDesigners = (relatedDesigners || [])
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 4)
    .map((d) => ({ ...d, region_slug: region, country_slug: country }))

  const countryData = firstRelation(designer.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionData = firstRelation(designer.regions as unknown as PlaceRecord | PlaceRecord[] | null)

  const canonicalPath = `/designers/${regionData?.slug || region}/${countryData?.slug || country}/${designer.slug}`
  if (`/designers/${region}/${country}/${slug}` !== canonicalPath) permanentRedirect(canonicalPath)

  const description = sortedHistories[0]?.content?.slice(0, 300) || undefined
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: designer.name,
        alternateName: designer.name_ja || undefined,
        url: `${SITE_URL}${canonicalPath}`,
        description,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          ["ファッションデータベース", "/"],
          ["デザイナー", "/designers"],
          [regionData?.name_ja || regionData?.name || region, `/designers/${regionData?.slug || region}`],
          [countryData?.name_ja || countryData?.name || country, `/designers/${regionData?.slug || region}/${countryData?.slug || country}`],
          [designer.name_ja || designer.name, canonicalPath],
        ].map(([name, path], index) => ({
          "@type": "ListItem", position: index + 1, name, item: `${SITE_URL}${path}`,
        })),
      },
    ],
  }

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageLayout title={designer.name} subtitle={designer.name_ja} breadcrumbs={breadcrumbs}>
        <DesignerPageClient
          designer={designerWithHistories}
          relatedDesigners={sanitizedRelatedDesigners}
          initialBrands={(brandsResult.data || []) as never[]}
          initialCollections={(collectionsResult.data || []).map((collection) => ({
            ...collection,
            brands: firstRelation(collection.brands),
          }))}
          initialPosts={(postsResult.data || []).map((post) => ({
            ...post,
            image_urls: post.image_urls || [],
            brands: firstRelation(post.brands),
          }))}
        />
      </PageLayout>
    </>
  )
}
