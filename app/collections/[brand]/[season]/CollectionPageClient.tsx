"use client"

import Link from "next/link"

import {
  useEffect,
  useState,
} from "react"

import {
  useParams,
} from "next/navigation"

import { supabase } from "@/lib/supabase"

type Collection = {
  id: string

  slug: string

  title: string
  title_ja: string | null

  description: string | null

  season: string
  year: number

  brand_slug: string

  brands: {
    name: string
    name_ja: string | null
  } | null
}

type Post = {
  id: string

  image_urls: string[]

  title: string | null
}

export default function CollectionPageClient() {

  const params = useParams()

  const brand =
    params.brand as string

  const season =
    params.season as string

  const [collection, setCollection] =
    useState<Collection | null>(null)

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchCollection = async () => {

      // collection

      const { data, error } =
        await supabase
          .from("collections")
          .select(`
            *,
            brands (
              name,
              name_ja
            )
          `)
          .eq("brand_slug", brand)
          .eq("slug", season)
          .single()

      if (error || !data) {

        console.log(error)

        setLoading(false)

        return
      }

      setCollection(data)

      // related posts

      const {
        data: postsData,
      } = await supabase
        .from("posts")
        .select(`
          id,
          image_urls,
          title
        `)
        .eq(
          "collection_slug",
          `${brand}-${season}`
        )
        .order("created_at", {
          ascending: false,
        })

      setPosts(postsData || [])

      setLoading(false)
    }

    fetchCollection()

  }, [brand, season])

  if (loading) {

    return (
      <main className="p-10">
        Loading...
      </main>
    )
  }

  if (!collection) {

    return (
      <main className="p-10">
        Collection not found
      </main>
    )
  }

  return (

    <main className="p-10 md:p-14 lg:p-16">

      {/* header */}

      <section className="max-w-4xl">

        <p
          className="
            type-label
            text-[11px]
            tracking-[0.12em]
            text-subtle
          "
        >
          COLLECTION
        </p>

        <h1
          className="
            mt-8
            type-display
            text-5xl
            md:text-6xl
            text-foreground
          "
        >
          {collection.brands?.name}{" "}
          {collection.title}
        </h1>

        {collection.title_ja && (

          <p
            className="
              mt-4
              text-lg
              tracking-[0.08em]
              text-muted
            "
          >
            {collection.brands?.name_ja}{" "}
            {collection.title_ja}
          </p>

        )}

        {collection.description && (

          <p
            className="
              mt-10
              max-w-3xl
              text-[15px]
              leading-8
              text-muted
              whitespace-pre-line
            "
          >
            {collection.description}
          </p>

        )}

      </section>

      {/* posts */}

      <section className="mt-24">

        <div
          className="
            flex
            items-end
            justify-between
            gap-6
            mb-10
          "
        >

          <div>

            <p
              className="
                type-label
                text-[11px]
                tracking-[0.12em]
                text-subtle
              "
            >
              POSTS
            </p>

            <h2 className="mt-3 text-3xl">
              Related Posts
            </h2>

          </div>

          <p
            className="
              text-sm
              text-muted
            "
          >
            {posts.length} posts
          </p>

        </div>

        {posts.length === 0 ? (

          <div
            className="
              border
              border-border
              rounded-3xl
              p-10
              text-muted
            "
          >
            このコレクションの投稿は
            まだありません。
          </div>

        ) : (

          <div
            className="
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

    </main>

  )
}