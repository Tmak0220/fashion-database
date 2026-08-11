"use client"

import Link from "@/components/LocalizedLink"

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
  slug: string 
  countries: Record<string, CountryGroup>
}

type Props = {
  initialGroups: GroupData[]
}

export default function GroupPageClient({ initialGroups }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-[10px] tracking-[0.08em] text-subtle">
          カードサイズは登録されている傘下ブランド数に基づきます
        </p>
        <div className="flex items-center gap-3 text-[9px] tracking-[0.08em] uppercase text-subtle" aria-label="カードサイズの基準">
          <span>1–2 Standard</span>
          <span className="size-1 rounded-full bg-border" aria-hidden="true" />
          <span>3–5 Wide</span>
          <span className="size-1 rounded-full bg-border" aria-hidden="true" />
          <span>6+ Large</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-start grid-flow-row-dense">
        {initialGroups.map((group) => {
          const countries = Object.entries(group.countries)
          const brandCount = countries.reduce((total, [, country]) => total + country.brands.length, 0)
          const hasBrands = brandCount > 0
          const sizeClass = brandCount >= 6
            ? "md:col-span-2 lg:col-span-3"
            : brandCount >= 3
              ? "md:col-span-2 lg:col-span-2"
              : "md:col-span-1 lg:col-span-1"
          const splitCountries = countries.length > 1 && brandCount >= 3
          const splitBrands = countries.length === 1 && brandCount >= 3

          return (
            <article
              key={group.id}
              className={`border border-border rounded-2xl bg-surface p-6 md:p-8 self-start transition-colors duration-300 hover:border-foreground/20 ${sizeClass}`}
            >
            <header className="border-b border-border/60 pb-5 mb-7">
              <div className="flex items-start justify-between gap-5">
                <div className="min-w-0">
                  <h2 className="type-brand text-xl md:text-2xl text-foreground text-balance">
                    {group.name}
                  </h2>
                  {group.name_ja && (
                    <p className="text-[11px] text-muted mt-2 tracking-[0.05em]">
                      {group.name_ja}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[9px] text-subtle tracking-[0.12em] uppercase border border-border/60 rounded-full px-2.5 py-1.5">
                  {brandCount} {brandCount === 1 ? "Brand" : "Brands"}
                </span>
              </div>
            </header>

            {!hasBrands ? (
              <p className="text-sm text-muted py-2">傘下ブランドのデータがありません</p>
            ) : (
              <div className={splitCountries ? "grid sm:grid-cols-2 gap-8" : "space-y-8"}>
                {countries.map(([countrySlug, countryGroup]) => (
                  <section key={countrySlug} className="relative pl-7">
                    <div className="absolute left-[3px] top-2 bottom-3 w-px bg-border" aria-hidden="true" />
                    <div className="absolute left-0 top-[7px] size-[7px] rounded-full bg-surface border border-foreground/45" aria-hidden="true" />

                    <div className="flex items-baseline justify-between gap-3 mb-4">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <h3 className="text-sm font-medium tracking-[0.04em] text-foreground">
                          {countryGroup.country_name_ja}
                        </h3>
                        <span className="text-[9px] text-subtle tracking-[0.1em] uppercase truncate">
                          {countryGroup.country_name}
                        </span>
                      </div>
                      <span className="text-[9px] tabular-nums text-subtle">
                        {countryGroup.brands.length}
                      </span>
                    </div>

                    <div className={splitBrands ? "grid sm:grid-cols-2 sm:gap-x-10 gap-y-1" : "space-y-1"}>
                      {countryGroup.brands.map((brand) => (
                        <div key={brand.id} className="relative">
                          <span className="absolute -left-6 top-1/2 w-4 border-t border-border" aria-hidden="true" />
                          <Link
                            href={`/brands/${brand.region_slug}/${brand.country_slug}/${brand.slug}`}
                            className="group/link flex items-center justify-between gap-4 py-1.5 text-[15px] tracking-[0.02em] text-foreground hover:text-muted transition-colors"
                          >
                            <span>{brand.name}</span>
                            <span className="text-[11px] text-subtle opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" aria-hidden="true">
                              →
                            </span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
