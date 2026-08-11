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
  const { data: collection } = brandRecord ? await supabase
    .from("collections")
    .select("id")
    .eq("brand_id", brandRecord.id)
    .eq("year", Number(yearText))
    .eq("season", seasonName)
    .maybeSingle()
    : { data: null }

  const { data: postsResult } = collection ? await supabase
    .from("posts")
    .select("*")
    .eq("collection_id", collection.id)
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
