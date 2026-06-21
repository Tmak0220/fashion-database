"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from "@/lib/supabase"

type BookmarkPost = {
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

export default function BookmarkPageClient() {
  const [bookmarks, setBookmarks] = useState<BookmarkPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlusMember, setIsPlusMember] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<string>("すべて")

  useEffect(() => {
    const fetchBookmarks = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsPlusMember(false)
        setLoading(false)
        return
      }

      const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
      const { data: memberData } = await supabase
        .from("users")
        .select("plus_member, plus_members, is_active")
        .eq("id", user.id)
        .maybeSingle()
      
      const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
      const memberStatus = isAdmin || hasValidFlag
      setIsPlusMember(memberStatus)

      if (!memberStatus) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("bookmarks")
        .select(`
          posts:post_id (
            id,
            title,
            image_urls,
            year,
            season,
            brand_slug
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        const formattedData: BookmarkPost[] = await Promise.all(
          data
            .filter((item: any) => item.posts)
            .map(async (item: any) => {
              const rawPost = item.posts
              let brandInfo = null

              if (rawPost.brand_slug) {
                const { data: brandData } = await supabase
                  .from("brands")
                  .select("name")
                  .eq("slug", rawPost.brand_slug)
                  .maybeSingle()
                
                if (brandData) {
                  brandInfo = { name: brandData.name }
                }
              }

              return {
                posts: {
                  id: rawPost.id,
                  title: rawPost.title,
                  image_urls: rawPost.image_urls,
                  year: rawPost.year,
                  season: rawPost.season,
                  brand_slug: rawPost.brand_slug,
                  brands: brandInfo
                }
              }
            })
        )

        setBookmarks(formattedData)
      } else {
        setBookmarks([])
      }
      
      setLoading(false)
    }

    fetchBookmarks()
  }, [])

  if (loading) {
    return <main className="p-10 text-sm text-muted font-medium">読み込み中...</main>
  }

  if (!isPlusMember) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-8 border border-border bg-surface rounded-2xl shadow-xl">
          <h1 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">
            MEMBER限定機能
          </h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            お気に入りのアーカイブを保存し、ブランドごとに一覧で管理できるコレクション機能です。本機能の利用にはMEMBER登録が必要です。
          </p>
          <Link
            href="/members"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
          >
            MEMBERに登録してクローゼットを作る
          </Link>
          <Link 
            href="/" 
            className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    )
  }

  const availableBrands = ["すべて", ...Array.from(new Set(
    bookmarks
      .map(item => item.posts.brands?.name)
      .filter((name): name is string => !!name)
  ))]

  const filteredBookmarks = bookmarks.filter(item => {
    if (selectedBrand === "すべて") return true
    return item.posts.brands?.name === selectedBrand
  })

  return (
    <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-6">
        <h1 className="text-2xl tracking-[0.08em] font-medium text-foreground">
          ブックマーク
        </h1>
        <p className="text-xs text-subtle font-medium">
          計 {bookmarks.length} 個のアーカイブ
        </p>
      </div>

      {availableBrands.length > 1 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {availableBrands.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-1.5 rounded-full text-xs transition-colors font-medium border ${
                selectedBrand === brand
                  ? "bg-black text-white border-black"
                  : "bg-surface text-muted border-border hover:bg-neutral-50"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {filteredBookmarks.length === 0 ? (
        <div className="mt-20 text-center text-xs text-subtle">
          ブックマークされたアイテムがありません。
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBookmarks.map((item, index) => {
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
                        className="object-cover transition duration-500 group-hover:scale-[1.02]"
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
                      <p className="text-xs text-foreground font-normal line-clamp-1 group-hover:text-neutral-600 transition-colors">
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