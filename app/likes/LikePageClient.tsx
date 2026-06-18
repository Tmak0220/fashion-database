"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type LikedPost = {
  posts: {
    id: string
    title: string | null
    image_urls: string[]
    year: number | null
    season: string | null
    brand_slug: string | null
    brands: {
      name: string
    } | null
  }
}

export default function LikePageClient() {
  const [likes, setLikes] = useState<LikedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAscending, setIsAscending] = useState(false)

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }
      setIsLoggedIn(true)

      const { data, error } = await supabase
        .from("likes")
        .select(`
          posts:post_id (
            id,
            title,
            image_urls,
            year,
            season,
            brand_slug,
            brands (
              name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      if (data) {
        const formattedData: LikedPost[] = data
          .filter((item: any) => item.posts)
          .map((item: any) => {
            const rawPost = item.posts
            const rawBrand = Array.isArray(rawPost.brands) ? rawPost.brands[0] : rawPost.brands

            return {
              posts: {
                id: rawPost.id,
                title: rawPost.title,
                image_urls: rawPost.image_urls,
                year: rawPost.year,
                season: rawPost.season,
                brand_slug: rawPost.brand_slug,
                brands: rawBrand ? { name: rawBrand.name } : null
              }
            }
          })

        setLikes(formattedData)
      } else {
        setLikes([])
      }
      
      setLoading(false)
    }

    fetchLikes()
  }, [])

  if (loading) {
    return <main className="p-10 text-sm text-muted">読み込み中...</main>
  }

  if (!isLoggedIn) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md p-8 border border-border bg-surface rounded-2xl shadow-xl">
          <h1 className="text-xl font-semibold tracking-wide text-foreground">MY FAVORITES</h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            選択したアーカイブを保存し、一覧で管理できるコレクション機能です。本機能の利用にはMEMBER登録が必要です。
          </p>
          <Link
            href="/members"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition hover:opacity-90"
          >
            MEMBERに登録してお気に入りを使う
          </Link>
        </div>
      </main>
    )
  }

  const sortedLikes = [...likes].sort((a, b) => {
    const yearA = a.posts.year ?? 9999
    const yearB = b.posts.year ?? 9999
    return isAscending ? yearA - yearB : yearB - yearA
  })

  return (
    <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
        <h1 className="text-3xl tracking-[0.08em] uppercase font-light">
          お気に入り
        </h1>
        <p className="text-xs text-subtle">
          計 {likes.length} 個のアイテム
        </p>
      </div>

      {likes.length > 1 && (
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => setIsAscending(!isAscending)}
            className="px-4 py-1.5 rounded-full text-xs transition font-medium border bg-surface text-muted border-border hover:bg-neutral-50 flex items-center gap-1.5"
          >
            <span>年代順:</span>
            <span className="text-foreground font-semibold">
              {isAscending ? "古い順 ↑" : "新しい順 ↓"}
            </span>
          </button>
        </div>
      )}

      {sortedLikes.length === 0 ? (
        <div className="mt-20 text-center text-xs text-subtle">
          お気に入りされたアイテムがありません。
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedLikes.map((item, index) => {
            const post = item.posts
            const urlSlug = `${post.brand_slug || "archive"}-${post.id}`

            return (
              <Link
                key={`${post.id}-${index}`}
                href={`/posts/${urlSlug}`}
                className="group block"
              >
                <article className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-border bg-neutral-50 aspect-[4/5] relative">
                    {post.image_urls?.[0] && (
                      <Image
                        src={post.image_urls[0]}
                        alt={post.title || ""}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    )}
                  </div>

                  <div className="space-y-1 px-1">
                    {post.brands?.name && (
                      <p className="text-[11px] font-medium tracking-wide uppercase text-subtle">
                        {post.brands.name}
                      </p>
                    )}
                    {post.title && (
                      <p className="text-xs text-foreground font-normal line-clamp-1 group-hover:text-neutral-600 transition">
                        {post.title}
                      </p>
                    )}
                    {post.year && (
                      <p className="text-[10px] text-muted">
                        {post.year} {post.season || ""}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  )
}