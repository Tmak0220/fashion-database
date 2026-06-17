export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import BrandPageClient from "./BrandPageClient"

type Props = {
  params: Promise<{
    region: string
    country: string
    slug: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region, country, slug } = await params
  const { data: brand } = await supabase
    .from("brands")
    .select(`
      name, name_ja, country_name_ja,
      brand_histories (content, order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .eq("brand_histories.key", "brand")
    .eq("brand_histories.lang", "ja")
    .eq("brand_histories.is_visible", true)
    .single()

  if (!brand) return { title: "Brand Not Found" }

  const sortedHistories = (brand.brand_histories as any[] || []).sort((a, b) => a.order - b.order)
  const historyContent = sortedHistories[0]?.content
  
  const title = brand.name_ja ? `${brand.name_ja} (${brand.name}) - FASHION DATABASE` : `${brand.name} - FASHION DATABASE`
  const description = historyContent ? historyContent.slice(0, 120) : `${brand.country_name_ja || "不明"}のブランド。`

  return {
    title,
    description,
    alternates: { canonical: `https://fashdb.com/brands/${region}/${country}/${slug}` },
  }
}

export default async function Page({ params }: Props) {
  const { region, country, slug } = await params

  const { data: brand } = await supabase
    .from("brands")
    .select(`
      id, name, name_ja, slug, region_slug, country_slug, 
      region_name, region_name_ja, country_name_ja, country_name,
      brand_histories (title, content, order, key, lang, is_visible)
    `)
    .eq("slug", slug)
    .eq("brand_histories.key", "brand")
    .eq("brand_histories.lang", "ja")
    .eq("brand_histories.is_visible", true)
    .single()

  if (!brand) notFound()

  const brandWithHistories = {
    ...brand,
    brand_histories: (brand.brand_histories as any[] || []).sort((a, b) => a.order - b.order)
  }

  const { data: relatedBrands } = await supabase
    .from("brands")
    .select("id, name, name_ja, slug, region_slug, country_slug")
    .eq("country_slug", brand.country_slug)
    .neq("slug", brand.slug)

  const sanitizedRelatedBrands = (relatedBrands || [])
    .sort(() => 0.5 - Math.random())
    .slice(0, 4)
    .map((b) => ({ ...b, image_url: null }))

  const breadcrumbs = [
    { label: "ファッションデータベース", href: "/" },
    { label: "ブランド", href: "/brands" },
    { 
      label: (brand as any).region_name_ja || (brand as any).region_name || region, 
      href: `/brands/${region}` 
    },
    { 
      label: (brand as any).country_name_ja || (brand as any).country_name || country, 
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
        brand={brandWithHistories as any} 
        relatedBrands={sanitizedRelatedBrands} 
      />
    </PageLayout>
  )
}