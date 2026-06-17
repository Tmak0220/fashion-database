"use client"

import Link from "next/link"

type Season = {
  id: number
  slug: string
  year: number
  name_ja: string | null
}

type Brand = {
  id: string | number
  name: string
  slug: string
  country_slug: string
  region_slug: string
}

type Props = {
  initialSeasons: Season[]
  initialBrands: Brand[]
}

export default function CollectionsPageClient({ initialSeasons, initialBrands }: Props) {
  return (
    <div className="space-y-16">
      <section className="border border-border rounded-2xl bg-surface p-6 md:p-8">
        <div className="border-b border-border/60 pb-4 mb-6">
          <h2 className="type-brand text-xl md:text-2xl font-medium text-foreground tracking-wide">
            TIMELINE
          </h2>
          <p className="text-xs text-muted font-medium mt-1 tracking-wider">
            シーズンから探す
          </p>
        </div>
        
        {initialSeasons.length === 0 ? (
          <p className="text-sm text-muted">登録されているシーズンがありません</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {initialSeasons.map((season) => (
              <Link
                key={season.id}
                href={`/collections/season/${season.slug}`}
                className="flex flex-col items-center justify-center p-4 border border-border/40 rounded-xl bg-surface hover:bg-background transition-all duration-200 group text-center"
              >
                <span className="text-sm font-mono font-bold tracking-wider text-foreground group-hover:text-muted">
                  {season.slug.toUpperCase()}
                </span>
                {season.name_ja && (
                  <span className="text-[11px] text-muted font-medium mt-1">
                    {season.name_ja}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border border-border rounded-2xl bg-surface p-6 md:p-8">
        <div className="border-b border-border/60 pb-4 mb-6">
          <h2 className="type-brand text-xl md:text-2xl font-medium text-foreground tracking-wide">
            BRANDSINDEX
          </h2>
          <p className="text-xs text-muted font-medium mt-1 tracking-wider">
            ブランドのコレクションアーカイブ
          </p>
        </div>

        {initialBrands.length === 0 ? (
          <p className="text-sm text-muted">登録されているブランドがありません</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
            {initialBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/collections/${brand.slug}`}
                className="text-sm font-medium tracking-wide text-foreground hover:text-muted hover:underline transition-all duration-200 block py-1.5 border-b border-border/10"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}