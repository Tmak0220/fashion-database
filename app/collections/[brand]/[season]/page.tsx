export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import CollectionPageClient from "./CollectionPageClient"

type Props = {
  params: Promise<{
    brand: string
    season: string
  }>
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

  return (
    <CollectionPageClient 
      brandSlug={brand} 
      seasonSlug={season} 
      initialPosts={posts} 
    />
  )
}
