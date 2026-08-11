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
  const [collectionsResult, brandsResult] = await Promise.all([
    supabase.from("collections").select("id, year, season").order("year", { ascending: false }),
    supabase
      .from("brands")
      .select("id, name, slug, country_slug, region_slug")
      .order("name")
  ])

  const seasonsData = Array.from(
    new Map((collectionsResult.data ?? []).map((collection) => {
      const slug = `${collection.year}-${collection.season.toLowerCase()}`
      return [slug, {
        id: collection.id,
        slug,
        year: collection.year,
        name_ja: `${collection.year}年${collection.season.toLowerCase() === "ss" ? "春夏" : "秋冬"}`,
      }]
    })).values()
  )
  const brandsData = brandsResult?.data ?? []

  if (collectionsResult.error) {
    //
  }
  if (brandsResult?.error) {
    //
  }

  return (
    <PageLayout title="Collections" subtitle="全シーズン・ブランドアーカイブ" breadcrumbs={[]}>
      <CollectionsPageClient initialSeasons={seasonsData} initialBrands={brandsData} />
    </PageLayout>
  )
}
