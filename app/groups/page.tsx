export const dynamic = "force-dynamic"

import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import PageLayout from "@/components/PageLayout"
import GroupPageClient from "./GroupPageClient"
import { getRequestLocale, localizedAlternates } from "@/lib/locale-server"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  return {
    title: locale === "en" ? "Fashion Groups - FASHION DATABASE" : "グループ一覧 - FASHION DATABASE",
    description: locale === "en" ? "Explore relationships between major fashion groups and their brands." : "ファッション大手（LVMH、ケリング等）の傘下・ブランド相関図。",
    alternates: await localizedAlternates("/groups"),
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

type CountryGroup = {
  country_name: string
  country_name_ja: string
  brands: Array<{
    id: string | number
    name: string
    slug: string
    country_slug: string
    region_slug: string
  }>
}

type RelatedCountry = { id: string | number; name: string; name_ja: string | null }
type RelatedRegion = { slug: string }

function firstRelation<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value
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
    const countries: Record<string, CountryGroup> = {}

    groupBrands.forEach((brand) => {
      const country = firstRelation(brand.countries as unknown as RelatedCountry | RelatedCountry[] | null)
      const region = firstRelation(brand.regions as unknown as RelatedRegion | RelatedRegion[] | null)
      const countryId = String(country?.id || "unknown")
      const countryName = country?.name || "UNKNOWN"
      const countryNameJa = country?.name_ja || "不明"
      const regionSlug = region?.slug || "unknown"

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
