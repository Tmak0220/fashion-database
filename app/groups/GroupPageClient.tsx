"use client"

import Link from "next/link"

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
  gridClasses: string
}

type Props = {
  initialGroups: GroupData[]
}

export default function GroupPageClient({ initialGroups }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 grid-flow-row-dense">
      {initialGroups.map((group) => {
        const hasBrands = Object.keys(group.countries).length > 0
        const isLargeGroup = group.group_slug.toLowerCase() === "lvmh"

        return (
          <div
            key={group.id}
            className={`border border-border rounded-2xl bg-surface p-6 md:p-8 relative overflow-hidden flex flex-col justify-between ${group.gridClasses}`}
          >
            <div>
              <div className="absolute right-6 top-4 text-[70px] md:text-[90px] font-bold text-foreground/[0.015] uppercase select-none pointer-events-none hidden md:block tracking-wider font-mono">
                {group.group_slug}
              </div>

              <div className="border-b border-border/60 pb-4 mb-6">
                <h2 className="type-brand text-xl md:text-2xl font-medium text-foreground tracking-wide">
                  {group.name.toUpperCase()}
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
                <div className={`grid grid-cols-1 gap-6 ${isLargeGroup ? "sm:grid-cols-2" : ""}`}>
                  {Object.entries(group.countries).map(([countrySlug, countryGroup]) => (
                    <div
                      key={countrySlug}
                      className="flex flex-col border border-border/40 rounded-xl bg-surface p-4"
                    >
                      <div className="flex items-baseline gap-2 mb-3 border-b border-border/20 pb-2">
                        <span className="w-1.5 h-1.5 bg-black rounded-full self-center opacity-40" />
                        <h3 className="text-sm font-medium tracking-wide text-foreground">
                          {countryGroup.country_name_ja}
                        </h3>
                        <span className="text-[10px] text-subtle tracking-[0.05em] font-medium uppercase">
                          {countryGroup.country_name}
                        </span>
                        <span className="text-[9px] text-subtle font-mono ml-auto bg-background px-1.5 py-0.5 rounded border border-border/40">
                          {countryGroup.brands.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        {countryGroup.brands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
                            className="text-sm font-medium tracking-wide text-foreground hover:text-muted hover:underline transition-all duration-200 block py-0.5"
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
          </div>
        )
      })}
    </div>
  )
}