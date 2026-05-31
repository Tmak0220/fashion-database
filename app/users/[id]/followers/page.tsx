"use client"

import Link from "next/link"

import { useEffect, useState } from "react"

import { useParams } from "next/navigation"

import { supabase } from "@/lib/supabase"

type FollowerUser = {
  follower: {
    id: string
    username: string | null
    avatar_url: string | null
  }[] | null
}

export default function FollowersPage() {

  const params = useParams()

  const userId = params.id as string

  const [followers, setFollowers] =
    useState<FollowerUser[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    const fetchFollowers = async () => {

      const { data, error } =
        await supabase
          .from("follows")
          .select(`
            follower:follower_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq("following_id", userId)

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setFollowers(data || [])

      setLoading(false)
    }

    fetchFollowers()

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
        Followers
      </h1>

      <div className="mt-12 space-y-6">

        {followers.map((item) => {

          const user = item.follower?.[0]

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