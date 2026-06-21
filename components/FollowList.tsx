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
  const [isPlusMember, setIsPlusMember] = useState(false)

  useEffect(() => {
    const checkMemberAndFetchData = async () => {
      setLoading(true)

      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const isAdmin = user?.user_metadata?.role === "admin" || user?.role === "admin" || user?.app_metadata?.role === "admin"
        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()
        
        const hasValidFlag = memberData?.plus_member === true || memberData?.plus_members === true || memberData?.is_active === true
        const memberStatus = isAdmin || hasValidFlag
        setIsPlusMember(memberStatus)

        if (!memberStatus) {
          setLoading(false)
          return
        }
      } else {
        setIsPlusMember(false)
        setLoading(false)
        return
      }

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
      checkMemberAndFetchData()
    }
  }, [userId, type])

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground animate-pulse">読み込み中...</div>
  }

  if (!isPlusMember) {
    return (
      <main className="max-w-6xl mx-auto p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="max-w-md w-full p-8 border border-border bg-surface rounded-2xl shadow-xl">
          <h1 className="text-base font-semibold tracking-[0.05em] text-foreground uppercase">
            MEMBER限定機能
          </h1>
          <p className="mt-4 text-xs text-muted leading-relaxed">
            フォローしているユーザーや、自身をフォローしているユーザーの一覧を確認できる機能です。本機能の利用にはMEMBER登録が必要です。
          </p>
          <Link
            href="/members"
            className="mt-8 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition-colors duration-300 hover:bg-neutral-800"
          >
            MEMBERに登録する
          </Link>
          <Link 
            href="/" 
            className="mt-4 inline-block text-[11px] text-subtle hover:text-foreground transition-colors duration-300"
          >
            トップページに戻る
          </Link>
        </div>
      </main>
    )
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