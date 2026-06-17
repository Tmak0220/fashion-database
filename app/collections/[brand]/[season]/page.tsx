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
  const collectionSlug = `${brand}-${season}`

  const { data: postsResult } = await supabase
    .from("posts")
    .select("*")
    .eq("collection_slug", collectionSlug)

  const posts = postsResult ?? []

  return (
    <CollectionPageClient 
      brandSlug={brand} 
      seasonSlug={season} 
      initialPosts={posts} 
    />
  )
}