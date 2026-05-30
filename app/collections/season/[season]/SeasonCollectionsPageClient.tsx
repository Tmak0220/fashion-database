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

  brand_slug: string
  brand_name: string

  season: string

  title: string | null
  title_ja: string | null

  description: string | null

  cover_image_url: string | null

  posts_count?: number
}

export default function SeasonCollectionsPageClient() {

  const params = useParams()

  const season =
    params.season as string

  const [collections, setCollections] =
    useState<Collection[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchCollections = async () => {

      const { data, error } =
        await supabase
          .from("collections")
          .select(`
            id,
            brand_slug,
            brand_name,
            season,
            title,
            title_ja,
            description,
            cover_image_url
          `)
          .eq("season", season)
          .order("brand_name", {
            ascending: true,
          })

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      if (!data) {

        setCollections([])

        setLoading(false)

        return
      }

      // 投稿数取得

      const collectionsWithCount =
        await Promise.all(

          data.map(async (collection) => {

            const {
              count,
            } = await supabase
              .from("posts")
              .select("*", {
                count: "exact",
                head: true,
              })
              .eq(
                "brand_slug",
                collection.brand_slug
              )
              .eq(
                "season_slug",
                collection.season
              )

            return {
              ...collection,
              posts_count: count || 0,
            }
          })

        )

      setCollections(collectionsWithCount)

      setLoading(false)
    }

    fetchCollections()

  }, [season])

  if (loading) {

    return (
      <main className="p-10 md:p-14 lg:p-16">
        Loading...
      </main>
    )
  }

  return (
    <main className="p-10 md:p-14 lg:p-16">

      {/* heading */}

      <div className="max-w-3xl">

        <p
          className="
            type-label
            text-[11px]
            text-subtle
            tracking-[0.12em]
          "
        >
          COLLECTIONS
        </p>

        <h1
          className="
            mt-8
            text-5xl
            md:text-6xl
          "
        >
          {season.toUpperCase()}
        </h1>

        <p
          className="
            mt-4
            text-base
            tracking-[0.08em]
            text-muted
          "
        >
          シーズン別コレクション
        </p>

      </div>

      {/* collections */}

      <section
        className="
          mt-16
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-3
          gap-10
        "
      >

        {collections.map((collection) => (

          <article
            key={collection.id}
            className="space-y-5"
          >

            <Link
              href={`/collections/${collection.brand_slug}/${collection.season}`}
              className="block"
            >

              {collection.cover_image_url ? (

                <img
                  src={collection.cover_image_url}
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

              ) : (

                <div
                  className="
                    w-full
                    aspect-[4/5]
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    flex
                    items-center
                    justify-center
                    text-sm
                    text-subtle
                  "
                >
                  No Image
                </div>

              )}

            </Link>

            <div>

              <p
                className="
                  text-sm
                  tracking-[0.08em]
                  text-subtle
                "
              >
                {collection.brand_name}
              </p>

              <Link
                href={`/collections/${collection.brand_slug}/${collection.season}`}
                className="block"
              >

                <h2
                  className="
                    mt-2
                    text-2xl
                    hover:underline
                  "
                >
                  {collection.title ||
                    `${collection.brand_name} ${collection.season.toUpperCase()}`}
                </h2>

              </Link>

              {collection.title_ja && (

                <p
                  className="
                    mt-3
                    text-sm
                    text-muted
                  "
                >
                  {collection.title_ja}
                </p>

              )}

              {collection.description && (

                <p
                  className="
                    mt-5
                    text-[15px]
                    leading-7
                    text-muted
                    line-clamp-4
                  "
                >
                  {collection.description}
                </p>

              )}

              {/* 投稿数 */}

              <div
                className="
                  mt-5
                  text-sm
                  text-subtle
                "
              >
                投稿数：
                {collection.posts_count || 0}
              </div>

              {/* リンク */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  gap-3
                "
              >

                <Link
                  href={`/collections/${collection.brand_slug}/${collection.season}`}
                  className="
                    text-sm
                    underline
                    text-muted
                    hover:text-foreground
                    transition-colors
                  "
                >
                  コレクションを見る
                </Link>

                <Link
                  href={`/collections/${collection.brand_slug}/${collection.season}#posts`}
                  className="
                    text-sm
                    underline
                    text-muted
                    hover:text-foreground
                    transition-colors
                  "
                >
                  投稿を見る
                </Link>

              </div>

            </div>

          </article>

        ))}

      </section>

    </main>
  )
}