"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Props = {
  userId: string
  type: "followers" | "following"
}

type UserData = {
  id: string
  username: string | null
  avatar_url: string | null
}

export default function FollowList({ userId, type }: Props) {
  const [list, setList] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFollowData = async () => {
      setLoading(true)

      const isFollowers = type === "followers"
      const targetColumn = isFollowers ? "follower_id" : "following_id"
      const filterColumn = isFollowers ? "following_id" : "follower_id"

      const { data, error } = await supabase
        .from("follows")
        .select(`
          user_data:${targetColumn} (
            id,
            username,
            avatar_url
          )
        `)
        .eq(filterColumn, userId)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const formattedData = (data || [])
        .map((item: any) => item.user_data)
        .filter((user): user is UserData => !!user)

      setList(formattedData)
      setLoading(false)
    }

    if (userId) {
      fetchFollowData()
    }
  }, [userId, type])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground animate-pulse">読み込み中...</div>
  }

  if (list.length === 0) {
    return (
      <div className="p-12 text-center text-sm text-muted-foreground border border-dashed rounded-2xl">
        {type === "followers" ? "フォロワーはまだいません。" : "フォロー中のユーザーはまだいません。"}
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto mt-6">
      {list.map((user, index) => (
        <Link
          key={`${user.id}-${index}`}
          href={user.username ? `/users/${user.username}` : "#"}
          className="flex items-center gap-4 border border-border rounded-2xl p-4 hover:bg-black hover:text-white transition group"
        >
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs group-hover:bg-zinc-800">
              No Image
            </div>
          )}
          <div>
            <p className="font-medium text-base">
              {user.username ? `@${user.username}` : "名称非公開"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}