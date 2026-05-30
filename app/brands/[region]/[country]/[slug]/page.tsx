import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
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
    .select("name, name_ja, history, country_name_ja")
    .eq("slug", slug)
    .single()

  if (!brand) {
    return {
      title: "Brand Not Found",
    }
  }

  const title = brand.name_ja ? `${brand.name_ja} (${brand.name}) | Fashion Database` : `${brand.name} | Fashion Database`
  const description = brand.history ? brand.history.slice(0, 120) : `${brand.country_name_ja}のブランド。コレクションやランウェイのアーカイブを閲覧できます。`

  return {
    title,
    description,
    alternates: {
      canonical: `https://fashdb.com/brands/${region}/${country}/${slug}`,
    },
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const { data: brand } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!brand) {
    notFound()
  }

  const { data: relatedBrands } = await supabase
    .from("brands")
    .select("id, name, name_ja, slug, region_slug, country_slug")
    .eq("country_slug", brand.country_slug)
    .neq("slug", brand.slug)

  const shuffled = (relatedBrands || []).sort(() => 0.5 - Math.random())
  const selectedBrands = shuffled.slice(0, 4)

  const sanitizedRelatedBrands = selectedBrands.map((b) => ({
    ...b,
    image_url: null
  }))

  return (
    <BrandPageClient 
      brand={brand} 
      relatedBrands={sanitizedRelatedBrands} 
    />
  )
}