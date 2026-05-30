"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { useParams } from "next/navigation"

import { supabase } from "@/lib/supabase"

type UserProfile = {
  id: string
  username: string | null
  bio: string | null
  avatar_url: string | null
}

type Post = {
  id: string
  image_urls: string[]
  title: string | null
}

export default function UserPage() {

  const params = useParams()

  const userId = params.id as string

  const [profile, setProfile] =
    useState<UserProfile | null>(null)

  const [posts, setPosts] =
    useState<Post[]>([])

  const [loading, setLoading] =
    useState(true)

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null)

  const [following, setFollowing] =
    useState(false)

  const [followersCount, setFollowersCount] =
    useState(0)

  const [followingCount, setFollowingCount] =
    useState(0)

  const [postsCount, setPostsCount] =
    useState(0)

  const [followLoading, setFollowLoading] =
    useState(false)

  useEffect(() => {

    const fetchData = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setCurrentUserId(user.id)
      }

      // profile

      const { data: profileData } =
        await supabase
          .from("users")
          .select(`
            id,
            username,
            bio,
            avatar_url
          `)
          .eq("id", userId)
          .single()

      setProfile(profileData)

      // posts

      const { data: postsData } =
        await supabase
          .from("posts")
          .select(`
            id,
            image_urls,
            title
          `)
          .eq("user_id", userId)
          .order("created_at", {
            ascending: false,
          })

      setPosts(postsData || [])

      setPostsCount(postsData?.length || 0)

      // followers count

      const {
        count: followers,
      } = await supabase
        .from("follows")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("following_id", userId)

      setFollowersCount(followers || 0)

      // following count

      const {
        count: followingTotal,
      } = await supabase
        .from("follows")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("follower_id", userId)

      setFollowingCount(followingTotal || 0)

      // follow check

      if (user) {

        const { data: followData } =
          await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", user.id)
            .eq("following_id", userId)
            .maybeSingle()

        setFollowing(!!followData)
      }

      setLoading(false)
    }

    fetchData()

  }, [userId])

  const handleFollow = async () => {

    if (!currentUserId) {
      alert("Login required")
      return
    }

    if (currentUserId === userId) {
      return
    }

    if (followLoading) return

    setFollowLoading(true)

    if (following) {

      await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", userId)

      setFollowing(false)

      setFollowersCount((prev) => prev - 1)

    } else {

      await supabase
        .from("follows")
        .insert({
          follower_id: currentUserId,
          following_id: userId,
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

  if (!profile) {

    return (
      <main className="p-10">
        User not found
      </main>
    )
  }

  return (
    <main className="max-w-6xl p-10 md:p-14 lg:p-16">

      {/* profile */}

      <section>

        <div className="flex items-start gap-6">

          {profile.avatar_url && (

            <img
              src={profile.avatar_url}
              alt=""
              className="
                w-24
                h-24
                rounded-full
                object-cover
                border
                border-border
              "
            />

          )}

          <div>

            <h1 className="text-3xl">

              {profile.username || "Unknown"}

            </h1>

            {/* stats */}

            <div className="mt-6 flex gap-8">

              <div>

                <p className="text-2xl">
                  {postsCount}
                </p>

                <p className="text-sm text-subtle">
                  Posts
                </p>

              </div>

              <Link
                href={`/users/${userId}/followers`}
                className="block hover:opacity-70 transition"
              >

                <p className="text-2xl">
                  {followersCount}
                </p>

                <p className="text-sm text-subtle">
                  Followers
                </p>

              </Link>

              <Link
                href={`/users/${userId}/following`}
                className="block hover:opacity-70 transition"
              >

                <p className="text-2xl">
                  {followingCount}
                </p>

                <p className="text-sm text-subtle">
                  Following
                </p>

              </Link>

            </div>

            {profile.bio && (

              <p
                className="
                  mt-6
                  max-w-2xl
                  leading-8
                  text-muted
                  whitespace-pre-line
                "
              >
                {profile.bio}
              </p>

            )}

            {currentUserId !== userId && (

              <button
                onClick={handleFollow}
                disabled={followLoading}
                className="
                  mt-8
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
                  : "Follow"}
              </button>

            )}

          </div>

        </div>

      </section>

      {/* posts */}

      <section className="mt-20">

        <h2
          className="
            text-2xl
            tracking-[0.08em]
            uppercase
          "
        >
          Posts
        </h2>

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

      </section>

    </main>
  )
}