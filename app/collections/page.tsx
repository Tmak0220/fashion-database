export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CollectionsPageClient from "./CollectionPageClient"
import { getRequestLocale, localizedAlternates } from "@/lib/locale-server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return {
    title: locale === "en" ? "Collection Archive - FASHION DATABASE" : "コレクションアーカイブ - FASHION DATABASE",
    description: locale === "en" ? "Explore seasonal collections and brand runway archives across fashion history." : "年代別のシーズンコレクションおよびブランド別ランウェイの構造化アーカイブ。ファッション史をタイムラインで俯瞰できます。",
    alternates: await localizedAlternates("/collections"),
  }
}

export default async function CollectionsPage() {
  const [postsResult, brandsResult] = await Promise.all([
    supabase.from("posts").select("id, year, season").not("year", "is", null).not("season", "is", null).order("year", { ascending: false }),
    supabase
      .from("brands")
      .select("id, name, slug")
      .eq("status", "published")
      .order("name")
  ])

  const seasonsData = Array.from(
    new Map((postsResult.data ?? []).map((post) => {
      const slug = `${post.year}-${post.season.toLowerCase()}`
      return [slug, {
        id: post.id,
        slug,
        year: post.year,
        name_ja: `${post.year}年${post.season.toLowerCase() === "ss" ? "春夏" : "秋冬"}`,
      }]
    })).values()
  )
  const brandsData = brandsResult?.data ?? []

  if (postsResult.error) {
    //
  }
  if (brandsResult.error) {
    console.error("Failed to load collection brands", brandsResult.error)
  }

  return (
    <PageLayout title="Collections" subtitle="全シーズン・ブランドアーカイブ" breadcrumbs={[]}>
      <CollectionsPageClient initialSeasons={seasonsData} initialBrands={brandsData} />
    </PageLayout>
  )
}
