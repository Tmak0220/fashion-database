"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type LikeUser = {
  users: {
    id: string
    username: string | null
    avatar_url: string | null
  }[] | null
}

type Props = {
  id: string
}

export default function LikesPageClient({ id }: Props) {
  const [likes, setLikes] = useState<LikeUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase
        .from("likes")
        .select(`
          users (
            id,
            username,
            avatar_url
          )
        `)
        .eq("post_id", id)

      if (error) {
        console.log(error)
        setLoading(false)
        return
      }

      setLikes(data || [])
      setLoading(false)
    }

    fetchLikes()
  }, [id])

  if (loading) {
    return <main className="p-6 sm:p-10 text-sm text-muted">Loading...</main>
  }

  return (
    <main className="max-w-3xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <h1 className="text-3xl sm:text-4xl tracking-[0.08em] uppercase font-medium">
        お気に入り
      </h1>

      <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
        {likes.map((item, index) => {

           const user = item.users?.[0]

           if (!user) return null

           return (
            <Link
              key={`${user.id}-${index}`}
              href={`/users/${user.id}`}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-border bg-neutral-50 shrink-0 group-hover:bg-neutral-800 transition-colors duration-300" />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-base sm:text-lg font-medium truncate">
                  {user.username || "名称非公開"}
                </p>
              </div>
            </Link>
          )
        })}

        {likes.length === 0 && (
          <p className="text-sm text-muted tracking-[0.02em]">
            まだお気に入りはありません。
          </p>
        )}
      </div>
    </main>
  )
}