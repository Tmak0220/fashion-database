export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import GroupPageClient from "./GroupPageClient"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "グループ一覧 - FASHION DATABASE",
    description: "ファッション大手（LVMH、ケリング等）の傘下・ブランド相関図。系列や規模に応じた多面的な構造マップを閲覧できます。",
    alternates: { canonical: "https://fashdb.com/groups" },
  }
}

const getGridClasses = (slug: string) => {
  switch (slug.toLowerCase()) {
    case "lvmh":
      return "md:col-span-2 md:row-span-2 lg:col-span-2"
    case "kering":
    case "richemont":
      return "md:col-span-1 md:row-span-2"
    case "prada":
    case "swatch":
      return "md:col-span-1 md:row-span-1"
    case "independent":
      return "md:col-span-2 lg:col-span-3"
    default:
      return "md:col-span-1 md:row-span-1"
  }
}

export default async function GroupsPage() {
  const [groupsResult, brandsResult] = await Promise.all([
    supabase.from("groups").select("*").order("id"),
    supabase
      .from("brands")
      .select("id, name, slug, country_slug, country_name, country_name_ja, region_slug, group_slug")
      .not("group_slug", "is", null)
      .order("name")
  ])

  if (groupsResult.error || brandsResult.error) {
    console.error(groupsResult.error || brandsResult.error)
  }

  const rawGroups = groupsResult.data || []
  const rawBrands = brandsResult.data || []

  const formattedGroups = rawGroups.map((group) => {
    const groupBrands = rawBrands.filter((b) => b.group_slug === group.group_slug)
    const countries: Record<string, any> = {}

    groupBrands.forEach((brand) => {
      const countryKey = brand.country_slug || "unknown"

      if (!countries[countryKey]) {
        countries[countryKey] = {
          country_name: brand.country_name || "UNKNOWN",
          country_name_ja: brand.country_name_ja || "不明",
          brands: []
        }
      }

      countries[countryKey].brands.push({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        country_slug: brand.country_slug,
        region_slug: brand.region_slug,
      })
    })

    return {
      ...group,
      countries,
      gridClasses: getGridClasses(group.group_slug),
    }
  })

  return (
    <PageLayout title="Groups" subtitle="ファッション大手の傘下・グループ相関図" breadcrumbs={[]}>
      <GroupPageClient initialGroups={formattedGroups} />
    </PageLayout>
  )
}