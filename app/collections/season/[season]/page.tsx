export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import SeasonCollectionsPageClient from "./SeasonCollectionPageClient"
import type { Metadata } from "next"
import { localizedAlternates } from "@/lib/locale-server"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{
    season: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { season } = await params
  if (!/^\d{4}-(ss|fw)$/.test(season)) notFound()
  const [year, code] = season.split("-")
  const seasonName = code?.toLowerCase() === "ss" ? "春夏" : "秋冬"
  const title = `${year}年${seasonName}ファッションコレクション`
  const description = `${year}年${seasonName}に発表されたブランド別コレクションと投稿アイテムを横断して閲覧できます。`
  return {
    title,
    description,
    alternates: await localizedAlternates(`/collections/season/${season}`),
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  }
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

  if (posts.length === 0) notFound()

  return <SeasonCollectionsPageClient season={season} initialPosts={posts} />
}
