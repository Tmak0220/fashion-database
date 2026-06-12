"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Brand = {
  id: string | number
  name: string
  slug: string
  country_slug: string
  region_slug: string
}

type CountryGroup = {
  country_name: string
  country_name_ja: string
  brands: Brand[]
}

type GroupData = {
  id: number
  name: string
  name_ja: string | null
  group_slug: string
  countries: Record<string, CountryGroup>
}

export default function GroupsPage() {
  const [loading, setLoading] = useState(true)
  const [groups, setGroups] = useState<GroupData[]>([])

  useEffect(() => {
    const fetchGroupsAndBrands = async () => {
      try {
        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("*")
          .order("id")

        if (groupsError) throw groupsError

        const { data: brandsData, error: brandsError } = await supabase
          .from("brands")
          .select("id, name, slug, country_slug, country_name, country_name_ja, region_slug, group_slug")
          .not("group_slug", "is", null)
          .order("name")

        if (brandsError) throw brandsError

        const formattedGroups: GroupData[] = (groupsData || []).map((group) => {
          const groupBrands = (brandsData || []).filter(
            (b) => b.group_slug === group.group_slug
          )

          const countries: Record<string, CountryGroup> = {}
          
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
          }
        })

        setGroups(formattedGroups)
      } catch (err) {
        console.error("Error fetching groups correlation data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchGroupsAndBrands()
  }, [])

  if (loading) {
    return (
      <main className="p-6 sm:p-10 md:p-14 lg:p-16 text-[14px] text-muted font-medium">
        読み込み中...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="p-6 sm:p-10 md:p-14 lg:p-16 max-w-7xl mx-auto">
        <div className="flex flex-col mb-16">
          <p className="type-label text-[11px] text-subtle tracking-[0.12em] pr-[0.12em] uppercase">
            Correlation Map
          </p>
          <h1 className="type-display text-3xl sm:text-4xl md:text-5xl text-foreground break-words leading-tight mt-4">
            Brand Groups
          </h1>
          <p className="mt-2 text-sm sm:text-base tracking-[0.14em] text-muted font-medium">
            ファッション大手の傘下・グループ相関図
          </p>
        </div>

        <div className="space-y-20">
          {groups.map((group) => {
            const hasBrands = Object.keys(group.countries).length > 0

            return (
              <div
                key={group.id}
                className="border border-border rounded-2xl bg-surface p-8 md:p-12 relative overflow-hidden"
              >
                <div className="absolute right-6 top-4 text-[80px] font-bold text-foreground/[0.02] uppercase select-none pointer-events-none hidden md:block">
                  {group.group_slug}
                </div>

                <div className="border-b border-border/60 pb-6 mb-8">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-wide text-foreground">
                    {group.name}
                  </h2>
                  {group.name_ja && (
                    <p className="text-xs text-muted font-medium mt-1 tracking-wider">
                      {group.name_ja}
                    </p>
                  )}
                </div>

                {!hasBrands ? (
                  <p className="text-sm text-muted">傘下ブランドのデータがありません</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(group.countries).map(([countrySlug, countryGroup]) => (
                      <div
                        key={countrySlug}
                        className="flex flex-col border border-border/40 rounded-xl bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-baseline gap-2 mb-4 border-b border-border/20 pb-2">
                          <span className="w-1.5 h-1.5 bg-black rounded-full self-center" />
                          <h3 className="text-sm font-bold tracking-[0.05em] text-foreground">
                            {countryGroup.country_name_ja}
                          </h3>
                          <span className="text-[10px] text-subtle tracking-[0.08em] font-medium uppercase">
                            {countryGroup.country_name}
                          </span>
                          <span className="text-[10px] text-subtle font-mono ml-auto bg-surface px-1.5 py-0.5 rounded border border-border/30">
                            {countryGroup.brands.length}
                          </span>
                        </div>

                        <div className="flex flex-col gap-2.5">
                          {countryGroup.brands.map((brand) => (
                            <Link
                              key={brand.id}
                              href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
                              className="text-sm font-medium tracking-[0.02em] text-foreground hover:text-muted hover:underline transition-all block py-1 pl-1"
                            >
                              {brand.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}