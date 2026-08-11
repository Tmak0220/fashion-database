"use client"

import { useEffect, useState } from "react"
import Link from "@/components/LocalizedLink"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import SearchLoading from "./loading" 
import AutoTranslatedText from "@/components/AutoTranslatedText"

type Brand = {
  id: number
  name: string
  name_ja: string | null
  slug: string
  region_id: string | null
  country_id: string | null
}

type Designer = {
  id: number
  name: string
  name_ja: string | null
  slug: string
  region_id: string | null
  country_id: string | null
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
  brands: { slug: string } | null
}

export default function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""

  const [brands, setBrands] = useState<Brand[]>([])
  const [designers, setDesigners] = useState<Designer[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setBrands([])
        setDesigners([])
        setUsers([])
        setPosts([])
        return
      }

      setLoading(true)

      try {
        const { data: brandsData } = await supabase
          .from("brands")
          .select("id, name, name_ja, slug, region_id, country_id")
          .or(`name.ilike.%${query}%,name_ja.ilike.%${query}%`)
          .limit(12)

        const { data: designersData } = await supabase
          .from("designers")
          .select("id, name, name_ja, slug, region_id, country_id")
          .or(`name.ilike.%${query}%,name_ja.ilike.%${query}%`)
          .limit(12)

        const matchedBrandIds = brandsData?.map((brand) => brand.id) || []

        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
          .limit(12)

        let postsQuery = supabase
          .from("posts")
          .select("id, title, image_urls, brands!posts_brand_id_fkey(slug)")
          .limit(18)

        if (matchedBrandIds.length > 0) {
          postsQuery = postsQuery.or(`title.ilike.%${query}%,brand_id.in.(${matchedBrandIds.join(",")})`)
        } else {
          postsQuery = postsQuery.ilike("title", `%${query}%`)
        }

        const { data: postsData } = await postsQuery

        setBrands(brandsData || [])
        setDesigners(designersData || [])
        setUsers(usersData || [])
        setPosts((postsData || []).map((post) => ({
          ...post,
          brands: Array.isArray(post.brands) ? post.brands[0] || null : post.brands,
        })))
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [searchParams, query])

  if (loading) {
    return <SearchLoading />
  }

  return (
    <main className="max-w-7xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 min-h-screen">
      <p className="text-[11px] text-subtle tracking-[0.14em] uppercase font-medium">Search</p>
      <h1 className="mt-2 sm:mt-4 text-4xl sm:text-5xl md:text-6xl tracking-[0.05em] text-foreground font-light">
        RESULTS
      </h1>
      <p className="mt-2 text-sm sm:text-base tracking-[0.1em] text-muted font-medium break-all">
        &ldquo;{query}&rdquo;
      </p>

      <div className="mt-12 sm:mt-16 space-y-16 sm:space-y-20">
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
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/collections/${brand.slug}`}
                  className="group min-w-[140px] sm:min-w-[160px] border border-border bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1 hover:bg-foreground hover:text-background hover:border-foreground transition duration-200 active:scale-[0.98]"
                >
                  <p className="text-sm sm:text-base font-medium tracking-[0.02em] text-center leading-tight">
                    {brand.name}
                  </p>
                  {brand.name_ja && (
                    <p className="text-[10px] sm:text-xs text-subtle tracking-[0.02em] text-center leading-normal group-hover:text-neutral-300 transition duration-200">
                      {brand.name_ja}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="border-b border-border pb-3 flex flex-col gap-0.5">
            <h2 className="text-lg sm:text-xl tracking-[0.1em] uppercase font-medium text-foreground">
              Designers
            </h2>
            <p className="text-[10px] sm:text-xs tracking-[0.14em] text-subtle font-medium">
              デザイナー
            </p>
          </div>
          {designers.length === 0 ? (
            <p className="mt-6 text-xs sm:text-sm text-subtle leading-relaxed">
              該当するデザイナーはありません
            </p>
          ) : (
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              {designers.map((designer) => (
                <Link
                  key={designer.id}
                  href={`/designers/${designer.slug}`}
                  className="group min-w-[140px] sm:min-w-[160px] border border-border bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-1 hover:bg-foreground hover:text-background hover:border-foreground transition duration-200 active:scale-[0.98]"
                >
                  <p className="text-sm sm:text-base font-medium tracking-[0.02em] text-center leading-tight">
                    {designer.name}
                  </p>
                  {designer.name_ja && (
                    <p className="text-[10px] sm:text-xs text-subtle tracking-[0.02em] text-center leading-normal group-hover:text-neutral-300 transition duration-200">
                      {designer.name_ja}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>

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
            <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {users.map((user) => {
                const content = (
                  <div className="flex items-center gap-3 sm:gap-4 border border-border bg-white rounded-xl p-3 sm:p-4 w-full h-full">
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
                        <div className="w-full h-full rounded-full border border-border bg-neutral-50" />
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
                  </div>
                )

                return true ? (
                  <Link
                    key={user.id}
                    href={`/users/${user.username}`}
                    className="block hover:bg-neutral-50 hover:border-neutral-400 transition duration-200 active:scale-[0.99] rounded-xl"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={user.id} className="block rounded-xl opacity-70">
                    {content}
                  </div>
                )
              })}
            </div>
          )}
        </section>

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
            <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-12">
              {posts.map((post) => {
                const slugPrefix = post.brands?.slug || "archive"
                const content = (
                  <article className="space-y-2.5 sm:space-y-3.5">
                    <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-surface w-full aspect-[4/5]">
                      {post.image_urls?.[0] && (
                        <Image
                          src={post.image_urls[0]}
                          alt={post.title || ""}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      )}
                    </div>
                    {post.title && (
                      <div className="px-0.5 sm:px-1">
                        <AutoTranslatedText text={post.title} as="p" showControls={false} className="text-xs sm:text-sm font-medium text-foreground leading-snug group-hover:text-neutral-600 transition duration-200 break-words line-clamp-1 sm:line-clamp-2" />
                      </div>
                    )}
                  </article>
                )

                return true ? (
                  <Link key={post.id} href={`/posts/${slugPrefix}-${post.id}`} className="block group">
                    {content}
                  </Link>
                ) : (
                  <div key={post.id} className="block">
                    {content}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
