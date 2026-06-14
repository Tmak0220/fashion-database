"use client"

import Link from "next/link"

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

export default function SearchPage() {

  const searchParams = useSearchParams()

  const query = searchParams.get("q") || ""

  const [loading, setLoading] =
    useState(true)

  const [brands, setBrands] =
    useState<Brand[]>([])

  const [users, setUsers] =
    useState<UserProfile[]>([])

  const [posts, setPosts] =
    useState<Post[]>([])

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

      // brands

      const { data: brandsData } =
        await supabase
          .from("brands")
          .select(`
            id,
            name,
            name_ja,
            slug,
            region_slug,
            country_slug,
            search_keywords
          `)
          .or(
            `name.ilike.%${query}%,name_ja.ilike.%${query}%,search_keywords.ilike.%${query}%`
          )
          .limit(12)

      // matched brand slugs

      const matchedBrandSlugs =
        brandsData?.map(
          (brand) => brand.slug
        ) || []

      // users

      const { data: usersData } =
        await supabase
          .from("users")
          .select(`
            id,
            username,
            avatar_url
          `)
          .ilike("username", `%${query}%`)
          .limit(12)

      // posts

      let postsQuery =
        supabase
          .from("posts")
          .select(`
            id,
            title,
            image_urls,
            brand_slug
          `)
          .limit(18)

      // title OR brand_slug search

      if (matchedBrandSlugs.length > 0) {

        postsQuery =
          postsQuery.or(
            `title.ilike.%${query}%,brand_slug.in.(${matchedBrandSlugs.join(",")})`
          )

      } else {

        postsQuery =
          postsQuery.ilike(
            "title",
            `%${query}%`
          )
      }

      const { data: postsData } =
        await postsQuery

      setBrands(brandsData || [])

      setUsers(usersData || [])

      setPosts(postsData || [])

      setLoading(false)
    }

    fetchResults()

  }, [query])

  return (
    <main className="max-w-7xl p-10 md:p-14 lg:p-16">

      <p className="text-sm text-subtle">
        Search
      </p>

      <h1 className="mt-6 text-5xl">
        RESULTS
      </h1>

      <p className="mt-6 text-lg">
        "{query}"
      </p>

      {loading ? (

        <p className="mt-12">
          Loading...
        </p>

      ) : (

        <div className="mt-16 space-y-20">

          {/* brands */}

          <section>

            <h2
              className="
                text-2xl
                tracking-[0.08em]
                uppercase
              "
            >
              Brands
            </h2>

            {brands.length === 0 ? (

              <p className="mt-6 text-subtle">
                No brands found
              </p>

            ) : (

              <div className="mt-8 flex flex-wrap gap-4">

                {brands.map((brand) => (

                  <Link
                    key={brand.id}
                    href={getBrandUrl(brand)}
                    className="
                      border
                      border-border
                      rounded-full
                      px-5
                      py-3
                      hover:bg-black
                      hover:text-white
                      transition
                    "
                  >

                    <div>

                      <p>
                        {brand.name}
                      </p>

                      {brand.name_ja && (

                        <p
                          className="
                            mt-1
                            text-xs
                            text-subtle
                          "
                        >
                          {brand.name_ja}
                        </p>

                      )}

                    </div>

                  </Link>

                ))}

              </div>

            )}

          </section>

          {/* users */}

          <section>

            <h2
              className="
                text-2xl
                tracking-[0.08em]
                uppercase
              "
            >
              Users
            </h2>

            {users.length === 0 ? (

              <p className="mt-6 text-subtle">
                No users found
              </p>

            ) : (

              <div
                className="
                  mt-8
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-6
                "
              >

                {users.map((user) => (

                  <Link
                    key={user.id}
                    href={`/users/@${user.username}`}
                    className="
                      flex
                      items-center
                      gap-4
                      border
                      border-border
                      rounded-2xl
                      p-5
                      hover:bg-muted/30
                      transition
                    "
                  >

                    {user.avatar_url ? (

                      <img
                        src={user.avatar_url}
                        alt=""
                        className="
                          w-14
                          h-14
                          rounded-full
                          object-cover
                        "
                      />

                    ) : (

                      <div
                        className="
                          w-14
                          h-14
                          rounded-full
                          border
                          border-border
                        "
                      />

                    )}

                    <p className="text-lg">
                      {user.username || "名称非公開"}
                    </p>

                  </Link>

                ))}

              </div>

            )}

          </section>

          {/* posts */}

          <section>

            <h2
              className="
                text-2xl
                tracking-[0.08em]
                uppercase
              "
            >
              Posts
            </h2>

            {posts.length === 0 ? (

              <p className="mt-6 text-subtle">
                No posts found
              </p>

            ) : (

              <div
                className="
                  mt-8
                  grid
                  grid-cols-2
                  md:grid-cols-3
                  gap-6
                "
              >

                {posts.map((post) => (

                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block"
                  >

                    <article className="space-y-3">

                      <img
                        src={post.image_urls?.[0]}
                        alt=""
                        className="
                          w-full
                          aspect-[4/5]
                          object-cover
                          rounded-2xl
                          border
                          border-border
                        "
                      />

                      {post.title && (

                        <p className="text-sm">
                          {post.title}
                        </p>

                      )}

                    </article>

                  </Link>

                ))}

              </div>

            )}

          </section>

        </div>

      )}

    </main>
  )
}