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
  const [seasonsResult, brandsResult] = await Promise.all([
    supabase.from("seasons").select("*").order("year", { ascending: false }).order("slug"),
    supabase
      .from("brands")
      .select("id, name, slug, country_slug, region_slug")
      .order("name")
  ])

  const seasonsData = seasonsResult?.data ?? []
  const brandsData = brandsResult?.data ?? []

  if (seasonsResult?.error) {
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
