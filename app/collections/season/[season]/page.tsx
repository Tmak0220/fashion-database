export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import SeasonCollectionsPageClient from "./SeasonCollectionPageClient"

type Props = {
  params: Promise<{
    season: string
  }>
}

export default async function Page({ params }: Props) {
  const { season } = await params
  const [yearText, seasonName] = season.split("-")

  const { data: postsResult } = await supabase
    .from("posts")
    .select("id, title, image_urls, brands!posts_brand_id_fkey(slug)")
    .eq("year", Number(yearText))
    .eq("season", seasonName)
    .order("created_at", { ascending: false })

  const posts = (postsResult ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    image_urls: post.image_urls,
    brand: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
  }))

  return <SeasonCollectionsPageClient season={season} initialPosts={posts} />
}
