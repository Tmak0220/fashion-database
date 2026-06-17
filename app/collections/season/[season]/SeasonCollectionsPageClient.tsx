"use client"

import Link from "next/link"

type Post = {
  id: string
  title: string | null
  image_urls: string[]
  brand_slug: string | null
  season_slug: string | null
}

type Props = {
  season: string
  initialPosts: Post[]
}

export default function SeasonCollectionsPageClient({ season, initialPosts }: Props) {
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
        <Link href="/collections/season" className="hover:text-foreground transition-colors">
          SEASON
        </Link>
        <span>/</span>
        <span className="text-muted font-medium uppercase">{season}</span>
      </nav>

      <section className="border-b border-border/40 pb-14">
        <div>
          <h1 className="type-display text-5xl md:text-6xl font-light text-foreground uppercase tracking-tight">
            {season.replace("-", " ")}
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-2 font-normal">
            シーズン アーカイブ
          </p>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-6 mb-12 border-b border-border/40 pb-4">
          <div>
            <h2 className="type-display text-2xl font-light tracking-tight text-foreground uppercase">
              Season Archives
            </h2>
            <p className="text-[10px] tracking-[0.05em] text-subtle mt-1 font-normal">
              このシーズンの投稿アイテム
            </p>
          </div>
          <p className="text-[11px] tracking-widest text-subtle font-light uppercase">
            {initialPosts.length} Items
          </p>
        </div>

        {initialPosts.length === 0 ? (
          <div className="border border-border/50 rounded-2xl p-16 text-center text-xs tracking-wider text-subtle bg-surface/20">
            このシーズンの投稿はまだありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {initialPosts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`} className="group block">
                <article className="space-y-4">
                  <div className="overflow-hidden rounded-xl border border-border/40 bg-surface aspect-[4/5]">
                    <img
                      src={post.image_urls?.[0]}
                      alt=""
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="space-y-1 px-1">
                    {post.brand_slug && (
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground block group-hover:text-subtle transition-colors">
                        {post.brand_slug}
                      </span>
                    )}
                    {post.title && (
                      <p className="text-[13px] font-normal tracking-wide text-muted line-clamp-1">
                        {post.title}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}