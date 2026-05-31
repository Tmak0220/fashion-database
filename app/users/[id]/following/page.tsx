"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { useParams } from "next/navigation"

import { supabase } from "@/lib/supabase"

type FollowingUser = {
  following: {
    id: string
    username: string | null
    avatar_url: string | null
  }[] | null
}

export default function FollowingPage() {

  const params = useParams()

  const userId = params.id as string

  const [followingUsers, setFollowingUsers] =
    useState<FollowingUser[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchFollowing = async () => {

      const { data, error } =
        await supabase
          .from("follows")
          .select(`
            following:following_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("follower_id", userId)

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setFollowingUsers(data || [])

      setLoading(false)
    }

    fetchFollowing()

  }, [userId])

  if (loading) {

    return (
      <main className="p-10">
        Loading...
      </main>
    )
  }

  return (
    <main className="max-w-3xl p-10 md:p-14 lg:p-16">

      <h1
        className="
          text-4xl
          tracking-[0.08em]
          uppercase
        "
      >
        Following
      </h1>

      <div className="mt-12 space-y-6">

        {followingUsers.map((item) => {

          const user = item.following?.[0]

          if (!user) return null

          return (

            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="
                flex
                items-center
                gap-4
                border
                border-border
                rounded-2xl
                p-4
                hover:bg-black
                hover:text-white
                transition
              "
            >

              {user.avatar_url && (

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

              )}

              <div>

                <p className="text-lg">

                  {user.username || "名称非公開"}

                </p>

              </div>

            </Link>

          )
        })}

      </div>

    </main>
  )
}