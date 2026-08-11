"use client"

import DirectoryCard from "@/components/cards/DirectoryCard"

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
              <DirectoryCard
                key={season.id}
                href={`/collections/season/${season.slug}`}
                name={season.slug.replaceAll("-", " ")}
                nameJa={season.name_ja}
                uppercase
              />
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
              <DirectoryCard
                key={brand.id}
                href={`/collections/${brand.slug}`}
                name={brand.name}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
