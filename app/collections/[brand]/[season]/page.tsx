export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import CollectionPageClient from "./CollectionPageClient"
import type { Metadata } from "next"
import { localizedAlternates } from "@/lib/locale-server"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{
    brand: string
    season: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand, season } = await params
  if (!/^\d{4}-(ss|fw)$/.test(season)) notFound()
  const { data } = await supabase.from("brands").select("name, name_ja").eq("slug", brand).maybeSingle()
  const name = data?.name_ja || data?.name || brand.replaceAll("-", " ")
  const [year, code] = season.split("-")
  const seasonName = code?.toLowerCase() === "ss" ? "春夏" : "秋冬"
  const title = `${name} ${year}年${seasonName}コレクション`
  const description = `${name}の${year}年${seasonName}コレクションと関連する投稿アイテムを掲載しています。`
  return {
    title,
    description,
    alternates: await localizedAlternates(`/collections/${brand}/${season}`),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function Page({ params }: Props) {
  const { brand, season } = await params

  const { data: brandRecord } = await supabase
    .from("brands")
    .select("id")
    .eq("slug", brand)
    .maybeSingle()

  const [yearText, seasonName] = season.split("-")
  const { data: postsResult } = brandRecord ? await supabase
    .from("posts")
    .select("*")
    .eq("brand_id", brandRecord.id)
    .eq("year", Number(yearText))
    .eq("season", seasonName)
    : { data: [] }

  const posts = postsResult ?? []
  const { data: collectionRecord } = brandRecord
    ? await supabase
        .from("collections")
        .select("id")
        .eq("brand_id", brandRecord.id)
        .eq("year", Number(yearText))
        .eq("season", seasonName)
        .maybeSingle()
    : { data: null }

  if (!brandRecord || (!collectionRecord && posts.length === 0)) notFound()

  return (
    <CollectionPageClient 
      brandSlug={brand} 
      seasonSlug={season} 
      initialPosts={posts} 
    />
  )
}
