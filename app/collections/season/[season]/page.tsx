export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import SeasonCollectionsPageClient from "./SeasonCollectionsPageClient"

type Props = {
  params: Promise<{
    season: string
  }>
}

export default async function Page({ params }: Props) {
  const { season } = await params

  const { data: postsResult } = await supabase
    .from("posts")
    .select("id, title, image_urls, brand_slug, season_slug")
    .eq("season_slug", season)
    .order("created_at", { ascending: false })

  const posts = postsResult ?? []

  return <SeasonCollectionsPageClient season={season} initialPosts={posts} />
}