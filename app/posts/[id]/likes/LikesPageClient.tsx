"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type LikeUser = {
  users: {
    id: string
    username: string | null
    avatar_url: string | null
  } | null
}

type Props = {
  id: string
}

export default function LikesPageClient({ id }: Props) {
  const [likes, setLikes] = useState<LikeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isPlusMember, setIsPlusMember] = useState(false)

  useEffect(() => {
    const fetchLikes = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const isAdmin = 
          user?.user_metadata?.role === "admin" || 
          user?.role === "admin" ||
          user?.app_metadata?.role === "admin"

        const { data: memberData } = await supabase
          .from("users")
          .select("plus_member, plus_members, is_active")
          .eq("id", user.id)
          .maybeSingle()

        const hasValidFlag = 
          memberData?.plus_member === true || 
          memberData?.plus_members === true || 
          memberData?.is_active === true

        setIsPlusMember(isAdmin || hasValidFlag)
      }

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
        console.error(error)
        setLoading(false)
        return
      }

      if (data) {
        // ★ 配列形式で返ってくる users を、LikeUser型に合わせてオブジェクトに平坦化（成形）する
        const formattedData: LikeUser[] = data.map((item: any) => {
          const rawUser = Array.isArray(item.users) ? item.users[0] : item.users

          if (!rawUser) {
            return { users: null }
          }

          return {
            users: {
              id: rawUser.id,
              username: rawUser.username,
              avatar_url: rawUser.avatar_url,
            }
          }
        })

        setLikes(formattedData)
      } else {
        setLikes([])
      }

      setLoading(false)
    }

    fetchLikes()
  }, [id])

  if (loading) {
    return <main className="p-6 sm:p-10 text-sm text-muted">Loading...</main>
  }

  if (!isPlusMember) {
    return (
      <main className="max-w-3xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16 text-center flex flex-col items-center justify-center min-h-[50vh]">
        <div className="max-w-sm p-6 border border-border bg-surface rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold text-foreground">こちらは限定コンテンツです</h2>
          <p className="mt-3 text-xs text-muted leading-relaxed">
            このアイテムをお気に入りにしたユーザーの一覧や、コミュニティデータを閲覧するには、MEMBERへの登録が必要です。
          </p>
          <Link
            href="/members"
            className="mt-6 block w-full text-center bg-black text-white font-medium rounded-xl px-4 py-3 text-[12px] transition hover:opacity-90"
          >
            MEMBERに登録する
          </Link>
          <Link href="/" className="mt-4 block text-[11px] text-subtle hover:text-foreground transition">
            トップページに戻る
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6 sm:p-10 md:p-14 lg:p-16">
      <h1 className="text-3xl sm:text-4xl tracking-[0.08em] uppercase font-light border-b border-border pb-6">
        お気に入りユーザー
      </h1>

      <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6">
        {likes.map((item, index) => {
          const user = item.users

          if (!user) return null

          return (
            <Link
              key={`${user.id}-${index}`}
              href={`/users/@${user.username}`}
              className="flex items-center gap-4 p-2 rounded-xl hover:bg-neutral-50 transition group"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt=""
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shrink-0 border border-border"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-border bg-neutral-50 shrink-0 transition-colors duration-300" />
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium truncate text-foreground group-hover:text-neutral-600 transition">
                  {user.username || "名称非公開"}
                </p>
              </div>
            </Link>
          )
        })}

        {likes.length === 0 && (
          <p className="text-sm text-muted tracking-[0.02em] pt-4">
            まだお気に入りはありません。
          </p>
        )}
      </div>
    </main>
  )
}