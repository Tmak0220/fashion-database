export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import GroupPageClient from "./GroupPageClient"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "グループ一覧 - FASHION DATABASE",
    description: "ファッション大手（LVMH、ケリング等）の傘下・ブランド相関図。",
    alternates: { canonical: "https://fashdb.com/groups" },
  }
}

const getGridClasses = (slug: string) => {
  switch (slug.toLowerCase()) {
    case "lvmh": return "md:col-span-2 md:row-span-2 lg:col-span-2"
    case "kering":
    case "richemont": return "md:col-span-1 md:row-span-2"
    case "prada":
    case "swatch": return "md:col-span-1 md:row-span-1"
    case "independent": return "md:col-span-2 lg:col-span-3"
    default: return "md:col-span-1 md:row-span-1"
  }
}

export default async function GroupsPage() {
  const [groupsResult, brandsResult] = await Promise.all([
    supabase.from("groups").select("*").order("id"),
    supabase
      .from("brands")
      .select(`
        id, name, slug, group_slug,
        countries (id, name, name_ja),
        regions (id, slug)
      `)
      .not("group_slug", "is", null)
      .order("name")
  ])

  if (groupsResult.error || brandsResult.error) {
    throw new Error("データ取得中にエラーが発生しました")
  }

  const rawGroups = groupsResult.data || []
  const rawBrands = brandsResult.data || []

  const formattedGroups = rawGroups.map((group) => {
    const groupBrands = rawBrands.filter((b) => b.group_slug === group.slug)
    const countries: Record<string, any> = {}

    groupBrands.forEach((brand: any) => {
      const countryId = brand.countries?.id || "unknown"
      const countryName = brand.countries?.name || "UNKNOWN"
      const countryNameJa = brand.countries?.name_ja || "不明"
      const regionSlug = brand.regions?.slug || "unknown"

      if (!countries[countryId]) {
        countries[countryId] = {
          country_name: countryName,
          country_name_ja: countryNameJa,
          brands: []
        }
      }

      countries[countryId].brands.push({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        country_slug: countryId,
        region_slug: regionSlug,
      })
    })

    return {
      ...group,
      countries,
      gridClasses: getGridClasses(group.slug),
    }
  })

  return (
    <PageLayout title="Groups" subtitle="ファッション大手の傘下・グループ相関図" breadcrumbs={[]}>
      <GroupPageClient initialGroups={formattedGroups} />
    </PageLayout>
  )
}