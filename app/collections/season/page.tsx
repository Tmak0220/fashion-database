export const dynamic = "force-dynamic"

import { supabase } from "@/lib/supabase"
import Link from "next/link"

export default async function AllSeasonsPage() {
  const { data: collectionsResult } = await supabase
    .from("collections")
    .select("year, season, slug")

  const collections = collectionsResult ?? []

  const allSeasons = Array.from(
    new Map(
      collections
        .filter((c) => c.year && c.season && c.slug)
        .map((c) => [
          c.slug,
          {
            slug: c.slug,
            year: String(c.year),
            season: c.season.toUpperCase(),
          },
        ])
    ).values()
  ).sort((a, b) => b.slug.localeCompare(a.slug))

  return (
    <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full">
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
        <Link href="/" className="hover:text-foreground transition-colors">
          HOME
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-foreground transition-colors">
          COLLECTIONS
        </Link>
        <span>/</span>
        <span className="text-muted font-medium">SEASON</span>
      </nav>

      <section className="border-b border-border/40 pb-14">
        <div>
          <h1 className="type-display text-5xl md:text-6xl font-light text-foreground uppercase tracking-tight">
            All Seasons
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-2 font-normal">
            シーズン年代記一覧
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="mb-12 border-b border-border/40 pb-4">
          <h2 className="type-display text-2xl font-light tracking-tight text-foreground uppercase">
            Chronological Index
          </h2>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-1 font-normal">
            時系列のアーカイブ
          </p>
        </div>

        {allSeasons.length === 0 ? (
          <div className="border border-border/50 rounded-2xl p-16 text-center text-xs tracking-wider text-subtle bg-surface/20">
            登録されているシーズンがまだありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {allSeasons.map((item) => (
              <Link
                key={item.slug}
                href={`/collections/season/${item.slug}`}
                className="group flex flex-col justify-between p-6 border border-border/60 bg-surface rounded-xl aspect-square transition-all duration-300 hover:bg-foreground hover:border-foreground"
              >
                <span className="text-xs font-light text-subtle tracking-widest group-hover:text-background/70 transition-colors">
                  YEAR
                </span>
                <div className="space-y-1">
                  <span className="block text-4xl font-light tracking-tight text-foreground group-hover:text-background transition-colors">
                    {item.year}
                  </span>
                  <span className="block text-sm font-medium tracking-widest text-subtle group-hover:text-background/80 transition-colors">
                    {item.season}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}