"use client"

import { useEffect, useState } from "react"
import Link from "@/components/LocalizedLink"
import Image from "next/image"
import AutoTranslatedText from "@/components/AutoTranslatedText"
import { supabase } from "@/lib/supabase"
import CollectionButton from "@/components/CollectionButton"

type Post = {
  id: string
  title: string | null
  image_urls: string[]
  collection_slug: string | null
  season_slug: string | null
}

type SeasonItem = {
  id: string
  year: string
  season: string
}

type Props = {
  params: Promise<{
    brand: string
  }>
}

export default function BrandPage({ params }: Props) {
  const [brand, setBrand] = useState<string>("")
  const [posts, setPosts] = useState<Post[]>([])
  const [uniqueSeasons, setUniqueSeasons] = useState<SeasonItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      const { brand: resolvedBrand } = await params
      setBrand(resolvedBrand)

      const { data: postsResult } = await supabase
        .from("posts")
        .select("id, title, image_urls, collection_slug, season_slug")
        .eq("brand_slug", resolvedBrand)
        .order("created_at", { ascending: false })

      const fetchedPosts = postsResult ?? []
      setPosts(fetchedPosts)

      const seasons = Array.from(
        new Map(
          fetchedPosts
            .filter((post) => post.season_slug)
            .map((post) => {
              const [year, season] = post.season_slug!.split("-")
              return [
                post.season_slug,
                {
                  id: `${resolvedBrand}/${post.season_slug}`,
                  year: year,
                  season: season?.toUpperCase() || "",
                },
              ]
            })
        ).values()
      ).sort((a, b) => b.id.localeCompare(a.id))

      setUniqueSeasons(seasons)
      setLoading(false)
    }

    initData()

  }, [params])

  if (loading) {
    return <div className="p-10 md:p-14 lg:p-16 text-center text-xs text-subtle">LOADING...</div>
  }

  return (
    <main className="p-10 md:p-14 lg:p-16 max-w-7xl mx-auto w-full min-h-screen">
      <nav className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-subtle mb-16">
        <Link href="/" className="hover:text-foreground transition-colors">
          HOME
        </Link>
        <span>/</span>
        <Link href="/collections" className="hover:text-foreground transition-colors">
          COLLECTIONS
        </Link>
        <span>/</span>
        <span className="text-muted font-medium">{brand}</span>
      </nav>

      <section className="border-b border-border/40 pb-14">
        <div>
          <h1 className="type-display text-5xl md:text-6xl font-light text-foreground uppercase tracking-tight">
            {brand}
          </h1>
          <p className="text-[10px] tracking-[0.05em] text-subtle mt-2 font-normal">
            ブランド アーカイブ
          </p>
        </div>

        {uniqueSeasons.length > 0 && (
          <div className="mt-14">
            <div className="mb-6">
              <h2 className="text-xs tracking-[0.15em] text-foreground uppercase font-medium">
                Explore Collections
              </h2>
              <p className="text-[10px] tracking-[0.05em] text-subtle mt-0.5">
                コレクションから探す
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {uniqueSeasons.map((item) => (
                <CollectionButton
                  key={item.id}
                  collection={{
                    id: item.id,
                    year: item.year,
                    season: item.season,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between gap-6 mb-12 border-b border-border/40 pb-4">
          <div>
            <h2 className="type-display text-2xl font-light tracking-tight text-foreground uppercase">
              Recent Archives
            </h2>
            <p className="text-[10px] tracking-[0.05em] text-subtle mt-1 font-normal">
              最近の投稿アイテム
            </p>
          </div>
          <p className="text-[11px] tracking-widest text-subtle font-light uppercase">
            {posts.length} Items
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="border border-border/50 rounded-2xl p-16 text-center text-xs tracking-wider text-subtle bg-surface/20">
            このブランドの投稿はまだありません。
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {posts.map((post) => {
              const content = (
                <article className="space-y-4">
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-surface aspect-[4/5]">
                    <Image
                      src={post.image_urls?.[0]}
                      alt={post.title || "Archive image"}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                    />
                  </div>
                  <div className="space-y-1 px-1">
                    {post.season_slug && (
                      <span className="text-[10px] font-medium uppercase tracking-widest text-subtle block">
                        {post.season_slug.replace("-", " ")}
                      </span>
                    )}
                    {post.title && (
                      <AutoTranslatedText text={post.title} as="p" showControls={false} className="text-[13px] font-normal tracking-wide text-foreground line-clamp-1 transition-colors group-hover:text-subtle" />
                    )}
                  </div>
                </article>
              )

              return <Link key={post.id} href={`/posts/${post.id}`} className="group block">{content}</Link>
            })}
          </div>
        )}
      </section>
    </main>
  )
}
