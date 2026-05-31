"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { supabase } from "@/lib/supabase"

type Post = {
  id: string

  image_urls: string[]

  title: string | null
  description: string | null

  created_at: string

  users: {
    id: string
    username: string | null
    avatar_url: string | null
  }
}

export default function PostFeed() {

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  const [isPlusMember, setIsPlusMember] =
    useState(false)

  useEffect(() => {

    const fetchPosts = async () => {

      // user check

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {

        const {
          data: profile,
        } = await supabase
          .from("profiles")
          .select("plus_member")
          .eq("id", user.id)
          .single()

        setIsPlusMember(
          !!profile?.plus_member
        )
      }

      // posts

      const { data, error } =
        await supabase
          .from("posts")
          .select(`
            *,
            users (
              id,
              username,
              avatar_url
            )
          `)
          .order("created_at", {
            ascending: false,
          })

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setPosts(data || [])

      setLoading(false)
    }

    fetchPosts()

  }, [])

  if (loading) {

    return (
      <p>Loading...</p>
    )
  }

  return (

    <div
      className="
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-10
      "
    >

      {posts.map((post, index) => {

        const locked =
          !isPlusMember && index >= 50

        return (

          <article
            key={post.id}
            className="space-y-5"
          >

            {/* image */}

            <div className="relative">

              {locked ? (

                <div
                  className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    border
                    border-border
                  "
                >

                  <img
                    src={post.image_urls?.[0]}
                    alt=""
                    className="
                      w-full
                      aspect-[4/5]
                      object-cover
                      blur-xl
                      scale-110
                      opacity-60
                    "
                  />

                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-black/30
                      backdrop-blur-[2px]
                    "
                  >

                    <div className="text-center text-white">

                      <p
                        className="
                          text-sm
                          tracking-[0.14em]
                        "
                      >
                        PLUS MEMBER
                      </p>

                      <Link
                        href="/members"
                        className="
                          mt-4
                          inline-block
                          border
                          border-white
                          px-5
                          py-3
                          text-xs
                          tracking-[0.12em]
                          hover:bg-white
                          hover:text-black
                          transition
                        "
                      >
                        登録する
                      </Link>

                    </div>

                  </div>

                </div>

              ) : (

                <Link
                  href={`/posts/${post.id}`}
                  className="block"
                >

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

                </Link>

              )}

            </div>

            <div className="space-y-3">

              {/* user */}

              <div className="flex items-center gap-3">

                {post.users?.avatar_url && (

                  <Link
                    href={`/users/${post.users.id}`}
                  >

                    <img
                      src={post.users.avatar_url}
                      alt=""
                      className="
                        w-10
                        h-10
                        rounded-full
                        object-cover
                      "
                    />

                  </Link>

                )}

                <Link
                  href={`/users/${post.users?.id}`}
                  className="
                    text-sm
                    hover:underline
                  "
                >

                  {post.users?.username || "名称非公開"}

                </Link>

              </div>

              {/* content */}

              {locked ? (

                <div>

                  <h2 className="text-xl opacity-50">
                    {post.title}
                  </h2>

                  <p
                    className="
                      mt-2
                      text-subtle
                      leading-7
                      opacity-50
                    "
                  >
                    PLUS MEMBER限定
                  </p>

                </div>

              ) : (

                <Link
                  href={`/posts/${post.id}`}
                  className="block"
                >

                  <div>

                    <h2 className="text-xl">
                      {post.title}
                    </h2>

                    <p
                      className="
                        mt-2
                        text-subtle
                        leading-7
                      "
                    >
                      {post.description}
                    </p>

                  </div>

                </Link>

              )}

            </div>

          </article>

        )
      })}

    </div>

  )
}