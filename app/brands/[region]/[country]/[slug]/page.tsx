export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import BrandPageClient from "./BrandPageClient"
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
  
  const { data: brand } = await supabase
    .from("brands")
    .select(`
      name, name_ja,
      countries ( id, name, name_ja, slug ),
      regions ( id, name, name_ja, slug ),
      brand_histories!brand_id (content, sort_order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .maybeSingle()

  if (!brand) return { title: "Brand Not Found" }

  const histories = (brand.brand_histories || []) as unknown as HistoryRecord[]
  const jaHistories = histories.filter(h => h.key === "brand" && h.lang === "ja" && h.is_visible === true)
  const sortedHistories = jaHistories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
  const historyContent = sortedHistories[0]?.content
  
  const title = brand.name_ja ? `${brand.name_ja} (${brand.name})｜ブランド` : `${brand.name}｜ブランド`
  
  const countryObj = firstRelation(brand.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionObj = firstRelation(brand.regions as unknown as PlaceRecord | PlaceRecord[] | null)
  const canonicalPath = `/brands/${regionObj?.slug || region}/${countryObj?.slug || country}/${slug}`
  const countryNameJa = countryObj ? (countryObj.name_ja || countryObj.name) : "不明"
  const description = historyContent 
    ? historyContent.slice(0, 120) 
    : `${countryNameJa}のブランド。コレクションやアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: await localizedAlternates(canonicalPath),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
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

  const [relatedBrandsResult, designersResult, collectionsResult, postsResult] = await Promise.all([
    supabase
      .from("brands")
      .select("id, name, name_ja, slug")
      .eq("country_id", brand.country_id)
      .neq("slug", brand.slug),
    supabase
      .from("brand_designers")
      .select("*, designers!brand_designers_designer_id_fkey (*)")
      .eq("brand_id", brand.id)
      .order("start_year", { ascending: true }),
    supabase
      .from("collections")
      .select("id, year, season, label")
      .eq("brand_id", brand.id)
      .order("year", { ascending: true }),
    supabase
      .from("posts")
      .select("id, image_urls, title")
      .eq("brand_id", brand.id)
      .order("created_at", { ascending: false }),
  ])

  const relatedBrands = relatedBrandsResult.data

  const sanitizedRelatedBrands = (relatedBrands || [])
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .slice(0, 4)
    .map((b) => ({ ...b, region_slug: region, country_slug: country, image_url: null }))

  const countryData = firstRelation(brand.countries as unknown as PlaceRecord | PlaceRecord[] | null)
  const regionData = firstRelation(brand.regions as unknown as PlaceRecord | PlaceRecord[] | null)

  const canonicalPath = `/brands/${regionData?.slug || region}/${countryData?.slug || country}/${brand.slug}`
  if (`/brands/${region}/${country}/${slug}` !== canonicalPath) permanentRedirect(canonicalPath)

  const description = sortedHistories[0]?.content?.slice(0, 300) || undefined
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Brand",
        name: brand.name,
        alternateName: brand.name_ja || undefined,
        url: `${SITE_URL}${canonicalPath}`,
        description,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          ["ファッションデータベース", "/"],
          ["ブランド", "/brands"],
          [regionData?.name_ja || regionData?.name || region, `/brands/${regionData?.slug || region}`],
          [countryData?.name_ja || countryData?.name || country, `/brands/${regionData?.slug || region}/${countryData?.slug || country}`],
          [brand.name_ja || brand.name, canonicalPath],
        ].map(([name, path], index) => ({
          "@type": "ListItem", position: index + 1, name, item: `${SITE_URL}${path}`,
        })),
      },
    ],
  }

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageLayout title={brand.name} subtitle={brand.name_ja} breadcrumbs={breadcrumbs}>
        <BrandPageClient
          brand={brandWithHistories}
          relatedBrands={sanitizedRelatedBrands}
          initialDesigners={(designersResult.data || []) as never[]}
          initialCollections={collectionsResult.data || []}
          initialPosts={postsResult.data || []}
        />
      </PageLayout>
    </>
  )
}
