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

  const [loading, setLoading] = useState(true)
  const [brands, setBrands] = useState<Brand[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setBrands([])
        setUsers([])
        setPosts([])
        setLoading(false)
        return
      }

      setLoading(true)

      const { data: brandsData } = await supabase
        .from("brands")
        .select("id, name, name_ja, slug, region_slug, country_slug, search_keywords")
        .or(`name.ilike.%${query}%,name_ja.ilike.%${query}%,search_keywords.ilike.%${query}%`)
        .limit(12)

      const matchedBrandSlugs = brandsData?.map((brand) => brand.slug) || []

      const { data: usersData } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .ilike("username", `%${query}%`)
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
      setLoading(false)
    }

    fetchResults()
  }, [query])

  return (
    <main className="max-w-7xl p-10 md:p-14 lg:p-16">
      <p className="text-sm text-subtle tracking-wider uppercase">Search</p>
      <h1 className="mt-4 type-display text-5xl md:text-6xl text-foreground">RESULTS</h1>
      <p className="mt-4 text-base tracking-wider text-muted font-medium">"{query}"</p>

      {loading ? (
        <p className="mt-12 text-sm text-muted">Loading...</p>
      ) : (
        <div className="mt-16 space-y-20">
          <section>
            <h2 className="text-xl tracking-[0.1em] uppercase font-medium border-b border-border pb-3">Brands</h2>
            {brands.length === 0 ? (
              <p className="mt-6 text-sm text-subtle">No brands found</p>
            ) : (
              <div className="mt-8 flex flex-wrap gap-3">
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={getBrandUrl(brand)}
                    className="border border-border rounded-xl px-5 py-3 hover:bg-black hover:text-white hover:border-black transition duration-200"
                  >
                    <div>
                      <p className="text-sm font-medium">{brand.name}</p>
                      {brand.name_ja && (
                        <p className="mt-0.5 text-xs text-subtle group-hover:text-neutral-300">{brand.name_ja}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl tracking-[0.1em] uppercase font-medium border-b border-border pb-3">Users</h2>
            {users.length === 0 ? (
              <p className="mt-6 text-sm text-subtle">No users found</p>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <Link
                    key={user.id}
                    href={`/users/${user.username}`}
                    className="flex items-center gap-4 border border-border rounded-xl p-4 hover:bg-neutral-50 transition duration-200"
                  >
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {user.avatar_url ? (
                        <Image
                          src={user.avatar_url}
                          alt=""
                          fill
                          sizes="48px"
                          className="rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full border border-border bg-neutral-50" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground">{user.username || "名称非公開"}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl tracking-[0.1em] uppercase font-medium border-b border-border pb-3">Posts</h2>
            {posts.length === 0 ? (
              <p className="mt-6 text-sm text-subtle">No posts found</p>
            ) : (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map((post) => {
                  const slugPrefix = post.brand_slug || "archive"
                  return (
                    <Link key={post.id} href={`/posts/${slugPrefix}-${post.id}`} className="block group">
                      <article className="space-y-3">
                        <div className="relative overflow-hidden rounded-xl border border-border w-full aspect-[4/5]">
                          {post.image_urls?.[0] && (
                            <Image
                              src={post.image_urls[0]}
                              alt={post.title || ""}
                              fill
                              sizes="(max-width: 768px) 50vw, 33vw"
                              className="object-cover group-hover:opacity-90 transition duration-200"
                            />
                          )}
                        </div>
                        {post.title && (
                          <p className="text-xs sm:text-sm font-medium text-foreground leading-snug group-hover:text-neutral-600 transition">
                            {post.title}
                          </p>
                        )}
                      </article>
                    </Link>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}