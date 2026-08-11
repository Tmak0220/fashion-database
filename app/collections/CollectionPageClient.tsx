"use client"

import Link from "@/components/LocalizedLink"

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
}

type Props = {
  initialSeasons: Season[]
  initialBrands: Brand[]
}

export default function CollectionPageClient({ initialSeasons, initialBrands }: Props) {
  return (
    <div className="space-y-16">
      <section className="border border-border rounded-2xl bg-surface p-6 md:p-8">
        <div className="border-b border-border/60 pb-4 mb-6">
          <h2 className="type-brand text-xl md:text-2xl text-foreground">
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
                <span className="type-ui text-base font-medium tabular-nums text-foreground group-hover:text-muted">
                  {season.slug.replaceAll("-", " ").toUpperCase()}
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
          <h2 className="type-brand text-xl md:text-2xl text-foreground">
            BRANDS INDEX
          </h2>
          <p className="text-xs text-muted font-medium mt-1 tracking-wider">
            ブランドのコレクションアーカイブ
          </p>
        </div>

        {initialBrands.length === 0 ? (
          <p className="text-sm text-muted">登録されているブランドがありません</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {initialBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/collections/${brand.slug}`}
                className="flex min-h-20 items-center justify-center rounded-xl border border-border/40 bg-surface p-4 text-center transition-all duration-200 hover:bg-background hover:border-border group"
              >
                <span className="type-ui text-sm md:text-base font-normal text-foreground group-hover:text-muted">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
