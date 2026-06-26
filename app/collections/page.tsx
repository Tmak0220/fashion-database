export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import CollectionsPageClient from "./CollectionPageClient"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "コレクションアーカイブ - FASHION DATABASE",
    description: "年代別のシーズンコレクションおよびブランド別ランウェイの構造化アーカイブ。ファッション史をタイムラインで俯瞰できます。",
    alternates: { canonical: "https://fashdb.com/collections" },
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