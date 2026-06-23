"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getBrandUrl } from "@/lib/routes"

type Brand = {
  id: string
  name: string
  name_ja: string | null
  slug: string
  region_slug: string
  country_slug: string
  search_keywords: string | null
}

type UserProfile = {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  title: string | null
  image_urls: string[]
  brand_slug: string | null
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [brands, setBrands] = useState<Brand[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setBrands([])
        setUsers([])
        setPosts([])
        return
      }

      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name, name_ja, slug, region_slug, country_slug, search_keywords")
        .or(`name.ilike.%${query}%,name_ja.ilike.%${query}%,search_keywords.ilike.%${query}%`)
        .limit(12)

      const matchedBrandSlugs = brandsData?.map((brand) => brand.slug) || []

      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, display_name, avatar_url")
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(12)

      let postsQuery = supabase
        .from("posts")
        .select("id, title, image_urls, brand_slug")
        .limit(18)

      if (matchedBrandSlugs.length > 0) {
        postsQuery = postsQuery.or(`title.ilike.%${query}%,brand_slug.in.(${matchedBrandSlugs.map(s => `"${s}"`).join(",")})`)
      } else {
        postsQuery = postsQuery.ilike("title", `%${query}%`)
      }

      const { data: postsData } = await postsQuery

      setBrands(brandsData || [])
      setUsers(usersData || [])
      setPosts(postsData || [])
    }

    fetchResults()
  }, [query])

  return (
    <main className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <p className="text-[11px] text-subtle tracking-[0.14em] uppercase font-medium">Search</p>
      <h1 className="mt-2 sm:mt-4 text-4xl sm:text-5xl md:text-6xl tracking-[0.05em] text-foreground font-light">
        RESULTS
      </h1>
      <p className="mt-2 text-sm sm:text-base tracking-[0.1em] text-muted font-medium">
        "{query}"
      </p>

      <div className="mt-12 sm:mt-16 space-y-16 sm:space-y-20">
        {/* BRANDS SECTION */}
        <section>
          <div className="border-b border-border pb-3 flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl tracking-[0.1em] uppercase font-medium text-foreground">
              Brands
            </h2>
            <p className="text-[10px] sm:text-xs tracking-[0.14em] text-subtle font-medium">
              ブランド
            </p>
          </div>
          {brands.length === 0 ? (
            <p className="mt-6 text-xs sm:text-sm text-subtle leading-relaxed">
              該当するブランドはありません
            </p>
          ) : (
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-2.5 sm:gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={getBrandUrl(brand)}
                  className="group border border-border bg-white rounded-xl px-4 py-2.5 sm:px-5 sm:py-3 hover:bg-foreground hover:text-background hover:border-foreground transition duration-200"
                >
                  <div>
                    <p className="text-xs sm:text-sm font-medium tracking-[0.03em]">{brand.name}</p>
                    {brand.name_ja && (
                      <p className="mt-0.5 text-[10px] sm:text-xs text-subtle group-hover:text-neutral-300 transition duration-200">
                        {brand.name_ja}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* USERS SECTION */}
        <section>
          <div className="border-b border-border pb-3 flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl tracking-[0.1em] uppercase font-medium text-foreground">
              Users
            </h2>
            <p className="text-[10px] sm:text-xs tracking-[0.14em] text-subtle font-medium">
              ユーザー
            </p>
          </div>
          {users.length === 0 ? (
            <p className="mt-6 text-xs sm:text-sm text-subtle leading-relaxed">
              該当するユーザーはありません
            </p>
          ) : (
            <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/users/${user.username}`}
                  className="flex items-center gap-3 sm:gap-4 border border-border bg-white rounded-xl p-3 sm:p-4 hover:bg-neutral-50 hover:border-neutral-400 transition duration-200"
                >
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 40px, 48px"
                        className="rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-border bg-neutral-50" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                      {user.display_name || user.username || "名称非公開"}
                    </p>
                    {user.display_name && user.username && (
                      <p className="text-[10px] sm:text-xs text-muted truncate mt-0.5">
                        @{user.username}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* POSTS SECTION */}
        <section>
          <div className="border-b border-border pb-3 flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl tracking-[0.1em] uppercase font-medium text-foreground">
              Posts
            </h2>
            <p className="text-[10px] sm:text-xs tracking-[0.14em] text-subtle font-medium">
              ポスト
            </p>
          </div>
          {posts.length === 0 ? (
            <p className="mt-6 text-xs sm:text-sm text-subtle leading-relaxed">
              該当するポストはありません
            </p>
          ) : (
            <div className="mt-6 sm:mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
              {posts.map((post) => {
                const slugPrefix = post.brand_slug || "archive"
                return (
                  <Link key={post.id} href={`/posts/${slugPrefix}-${post.id}`} className="block group">
                    <article className="space-y-2.5 sm:space-y-3.5">
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface w-full aspect-[4/5]">
                        {post.image_urls?.[0] && (
                          <Image
                            src={post.image_urls[0]}
                            alt={post.title || ""}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                          />
                        )}
                      </div>
                      {post.title && (
                        <div className="px-0.5 sm:px-1">
                          <p className="text-xs sm:text-sm font-medium text-foreground leading-snug group-hover:text-neutral-600 transition duration-200 break-words line-clamp-2">
                            {post.title}
                          </p>
                        </div>
                      )}
                    </article>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}