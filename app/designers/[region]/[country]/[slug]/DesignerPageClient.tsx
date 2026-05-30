"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { useParams } from "next/navigation"

import { supabase } from "@/lib/supabase"

import CollectionButton from "@/components/CollectionButton"
import SectionHeading from "@/components/SectionHeading"

type Designer = {
  name: string
  name_ja: string | null
  description: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

export default function DesignerPage() {

  const params = useParams()

  const slug = params.slug as string

  const [designer, setDesigner] =
    useState<Designer | null>(null)

  const [collections, setCollections] =
    useState<any[]>([])

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  // plus member

  const [isPlusMember, setIsPlusMember] =
    useState(false)

  // follow

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const [following, setFollowing] =
    useState(false)

  const [followersCount, setFollowersCount] =
    useState(0)

  const [followLoading, setFollowLoading] =
    useState(false)

  useEffect(() => {

    const fetchData = async () => {

      // current user

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {

        setCurrentUserId(user.id)

        // plus member check

        const { data: profile } =
          await supabase
            .from("profiles")
            .select("plus_member")
            .eq("id", user.id)
            .single()

        setIsPlusMember(
          profile?.plus_member || false
        )
      }

      // designer

      const { data: designerData } =
        await supabase
          .from("designers")
          .select("*")
          .eq("slug", slug)
          .single()

      setDesigner(designerData)

      // collections

      const { data: collectionsData } =
        await supabase
          .from("collections")
          .select("*")
          .eq("designer_slug", slug)
          .order("year", {
            ascending: true,
          })

      setCollections(collectionsData || [])

      // posts

      const { data: postsData } =
        await supabase
          .from("posts")
          .select(`
            id,
            image_urls,
            title
          `)
          .eq("designer_slug", slug)
          .order("created_at", {
            ascending: false,
          })

      setPosts(postsData || [])

      // followers count

      const {
        count,
      } = await supabase
        .from("designer_follows")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("designer_slug", slug)

      setFollowersCount(count || 0)

      // following check

      if (user) {

        const { data: followData } =
          await supabase
            .from("designer_follows")
            .select("id")
            .eq("user_id", user.id)
            .eq("designer_slug", slug)
            .maybeSingle()

        setFollowing(!!followData)
      }

      setLoading(false)
    }

    fetchData()

  }, [slug])

  const handleFollow = async () => {

    if (!currentUserId) {

      alert("Login required")

      return
    }

    // plus only

    if (!isPlusMember) {

      alert("PLUS MEMBERS限定機能です")

      return
    }

    if (followLoading) return

    setFollowLoading(true)

    if (following) {

      await supabase
        .from("designer_follows")
        .delete()
        .eq("user_id", currentUserId)
        .eq("designer_slug", slug)

      setFollowing(false)

      setFollowersCount((prev) => prev - 1)

    } else {

      await supabase
        .from("designer_follows")
        .insert({
          user_id: currentUserId,
          designer_slug: slug,
        })

      setFollowing(true)

      setFollowersCount((prev) => prev + 1)
    }

    setFollowLoading(false)
  }

  if (loading) {

    return (
      <main className="p-10">
        Loading...
      </main>
    )
  }

  if (!designer) {

    return (
      <main className="p-10">
        Designer not found
      </main>
    )
  }

  return (
    <main className="p-10 md:p-14 lg:p-16">

      {/* header */}

      <div
        className="
          flex
          flex-col
          md:flex-row
          md:items-end
          md:justify-between
          gap-8
        "
      >

        <div>

          <h1
            className="type-brand text-5xl md:text-6xl"
            style={
              designer.name.length <= 6
                ? {
                    letterSpacing: "0.24em",
                    paddingRight: "0.24em",
                  }
                : undefined
            }
          >
            {designer.name}
          </h1>

          {designer.name_ja && (

            <p className="mt-3 text-xl tracking-[0.04em] text-muted">
              {designer.name_ja}
            </p>

          )}

        </div>

        {/* follow area */}

        <div className="flex items-center gap-6">

          <div>

            <p className="text-sm text-subtle">
              Followers
            </p>

            <p className="mt-1 text-2xl">
              {followersCount}
            </p>

          </div>

          <button
            onClick={handleFollow}
            disabled={followLoading}
            className="
              border
              border-border
              rounded-xl
              px-5
              py-3
              hover:bg-black
              hover:text-white
              transition
            "
          >
            {following
              ? "Following"
              : "Follow Designer"}
          </button>

        </div>

      </div>

      {/* description */}

      {designer.description && (

        <p className="mt-10 max-w-3xl text-[15px] leading-8 text-muted whitespace-pre-line">
          {designer.description}
        </p>

      )}

      {/* collections */}

      <section className="mt-16">

        <SectionHeading
          title="Collections"
          titleJa="コレクション"
          className="mb-6"
        />

        <div className="flex flex-wrap gap-4">

          {collections.map((collection) => (

            <CollectionButton
              key={collection.id}
              collection={collection}
            />

          ))}

        </div>

      </section>

      {/* posts */}

      <section className="mt-24">

        <SectionHeading
          title="Posts"
          titleJa="投稿"
          className="mb-8"
        />

        <div
          className="
            grid
            grid-cols-2
            md:grid-cols-3
            gap-6
          "
        >

          {(isPlusMember
            ? posts
            : posts.slice(0, 50)
          ).map((post) => (

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

        {!isPlusMember &&
          posts.length > 50 && (

          <div className="mt-10 text-center">

            <p className="text-sm text-muted">
              続きを見るにはPLUS MEMBERS登録が必要です
            </p>

            <Link
              href="/members"
              className="
                inline-block
                mt-4
                border
                border-black
                bg-black
                text-white
                px-6
                py-3
                rounded-xl
                text-sm
                tracking-[0.08em]
              "
            >
              PLUS MEMBERS
            </Link>

          </div>
        )}

      </section>

    </main>
  )
}