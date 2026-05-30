"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

type BookmarkPost = {
  posts: {
    id: string
    title: string | null
    image_urls: string[]
  }[] | null
}

export default function BookmarksPage() {

  const [bookmarks, setBookmarks] =
    useState<BookmarkPost[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchBookmarks = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {

        setLoading(false)

        return
      }

      const { data, error } =
        await supabase
          .from("bookmarks")
          .select(`
            posts (
              id,
              title,
              image_urls
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setBookmarks(data || [])

      setLoading(false)
    }

    fetchBookmarks()

  }, [])

  if (loading) {

    return (
      <main className="p-10">
        Loading...
      </main>
    )
  }

  return (
    <main className="max-w-6xl p-10 md:p-14 lg:p-16">

      <h1
        className="
          text-4xl
          tracking-[0.08em]
          uppercase
        "
      >
        Saved Posts
      </h1>

      <div
        className="
          mt-12
          grid
          grid-cols-2
          md:grid-cols-3
          gap-6
        "
      >

        {bookmarks.map((item, index) => {

          const post = item.posts?.[0]

          if (!post) return null

          return (

            <Link
              key={`${post.id}-${index}`}
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

          )
        })}

      </div>

    </main>
  )
}